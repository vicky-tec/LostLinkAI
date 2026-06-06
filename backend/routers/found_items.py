import os
import uuid
import json
import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import FoundItem
from schemas import FoundItemOut
from services.gemini_service import analyze_found_item_image, generate_embedding
from services.ocr_service import extract_text_from_image
from services.match_service import build_found_item_text
from typing import List, Optional

router = APIRouter(prefix="/api/found", tags=["Found Items"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=FoundItemOut)
async def report_found_item(
    location: str = Form(...),
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

    # AI Analysis
    ai_data = {}
    ocr_text = None

    if image_path and os.path.exists(image_path):
        ai_data = analyze_found_item_image(image_path)
        ocr_text = extract_text_from_image(image_path)
        # Merge OCR text with Gemini's visible_text
        gemini_text = ai_data.get("visible_text")
        if ocr_text and gemini_text:
            ocr_text = f"{gemini_text} | {ocr_text}"
        elif gemini_text:
            ocr_text = gemini_text

    found_item = FoundItem(
        user_id=user_id,
        image_path=image_path,
        category=ai_data.get("category", "Other"),
        ai_description=ai_data.get("description", "Item found on campus."),
        ocr_text=ocr_text,
        color=ai_data.get("color"),
        brand=ai_data.get("brand"),
        location=location,
        contact_phone=contact_phone,
    )
    db.add(found_item)
    db.commit()
    db.refresh(found_item)

    # Generate embedding asynchronously
    text = build_found_item_text(found_item)
    emb = generate_embedding(text)
    found_item.embedding = json.dumps(emb)
    db.commit()
    db.refresh(found_item)

    return found_item


@router.get("/", response_model=List[FoundItemOut])
def list_found_items(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return db.query(FoundItem).order_by(FoundItem.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{item_id}", response_model=FoundItemOut)
def get_found_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    return item


@router.delete("/{item_id}")
def delete_found_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}
