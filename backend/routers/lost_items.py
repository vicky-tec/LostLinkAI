import os
import uuid
import json
import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import LostItem
from schemas import LostItemOut
from services.gemini_service import generate_embedding
from services.match_service import build_lost_item_text
from typing import List, Optional

router = APIRouter(prefix="/api/lost", tags=["Lost Items"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=LostItemOut)
async def report_lost_item(
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    date_lost: str = Form(...),
    contact_phone: Optional[str] = Form(None),
    user_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    image_path = None

    # Save uploaded image
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(image_path, "wb") as f:
            content = await image.read()
            await f.write(content)

    lost_item = LostItem(
        user_id=user_id,
        title=title,
        description=description,
        location=location,
        date_lost=date_lost,
        contact_phone=contact_phone,
        image_path=image_path
    )
    db.add(lost_item)
    db.commit()
    db.refresh(lost_item)

    # Generate embedding
    text = build_lost_item_text(lost_item)
    emb = generate_embedding(text)
    lost_item.embedding = json.dumps(emb)
    db.commit()
    db.refresh(lost_item)

    return lost_item


@router.get("/", response_model=List[LostItemOut])
def list_lost_items(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(LostItem).order_by(LostItem.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{item_id}", response_model=LostItemOut)
def get_lost_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    return item


@router.delete("/{item_id}")
def delete_lost_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}
