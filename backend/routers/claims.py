from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Claim, FoundItem, LostItem
from schemas import ClaimCreate, ClaimOut
from typing import List

router = APIRouter(prefix="/api/claims", tags=["Claims"])


@router.post("/", response_model=ClaimOut)
def submit_claim(payload: ClaimCreate, db: Session = Depends(get_db)):
    found_item = db.query(FoundItem).filter(FoundItem.id == payload.found_item_id).first()
    if not found_item:
        raise HTTPException(status_code=404, detail="Found item not found")
    if found_item.status == "claimed":
        raise HTTPException(status_code=400, detail="This item has already been claimed")

    claim = Claim(
        found_item_id=payload.found_item_id,
        lost_item_id=payload.lost_item_id,
        claimant_user_id=None,
        claimant_name=payload.claimant_name,
        claimant_email=payload.claimant_email,
        message=payload.message,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


@router.get("/", response_model=List[ClaimOut])
def list_claims(db: Session = Depends(get_db)):
    return db.query(Claim).order_by(Claim.created_at.desc()).all()


@router.patch("/{claim_id}")
def update_claim_status(claim_id: int, action: str, db: Session = Depends(get_db)):
    """Accept or reject a claim. action = 'accept' | 'reject'"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if action == "accept":
        claim.status = "accepted"
        # Mark found item as claimed
        found_item = db.query(FoundItem).filter(FoundItem.id == claim.found_item_id).first()
        if found_item:
            found_item.status = "claimed"
        # Mark lost item as recovered
        if claim.lost_item_id:
            lost_item = db.query(LostItem).filter(LostItem.id == claim.lost_item_id).first()
            if lost_item:
                lost_item.status = "recovered"
    elif action == "reject":
        claim.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'accept' or 'reject'")

    db.commit()
    db.refresh(claim)
    return {"message": f"Claim {action}ed successfully", "claim_id": claim.id, "status": claim.status}


@router.get("/{claim_id}", response_model=ClaimOut)
def get_claim(claim_id: int, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim
