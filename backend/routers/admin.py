from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, LostItem, FoundItem, Match, Claim
from schemas import UserOut, UserCreate
from typing import List

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        return existing
    user = User(name=payload.name, email=payload.email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db)):
    return {
        "users": db.query(User).count(),
        "lost_items": db.query(LostItem).count(),
        "found_items": db.query(FoundItem).count(),
        "matches": db.query(Match).count(),
        "claims": db.query(Claim).count(),
        "recoveries": db.query(LostItem).filter(LostItem.status == "recovered").count(),
    }


@router.delete("/lost/{item_id}")
def admin_delete_lost(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


@router.delete("/found/{item_id}")
def admin_delete_found(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


@router.patch("/lost/{item_id}/status")
def update_lost_status(item_id: int, status: str, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item.status = status
    db.commit()
    return {"message": f"Status updated to {status}"}


@router.patch("/found/{item_id}/status")
def update_found_status(item_id: int, status: str, db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item.status = status
    db.commit()
    return {"message": f"Status updated to {status}"}
