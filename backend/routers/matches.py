from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Match, LostItem, FoundItem
from schemas import MatchOut
from services.match_service import run_matching_for_lost_item
from typing import List

router = APIRouter(prefix="/api/matches", tags=["Matches"])


@router.post("/{lost_item_id}")
def run_matching(lost_item_id: int, db: Session = Depends(get_db)):
    """Run AI matching for a specific lost item."""
    lost_item = db.query(LostItem).filter(LostItem.id == lost_item_id).first()
    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    results = run_matching_for_lost_item(lost_item_id, db)
    return {
        "lost_item_id": lost_item_id,
        "matches_found": len(results),
        "matches": [
            {
                "match_id": r["match_id"],
                "found_item_id": r["found_item_id"],
                "score": r["score"],
                "reason": r["reason"],
                "found_item": {
                    "id": r["found_item"].id,
                    "category": r["found_item"].category,
                    "ai_description": r["found_item"].ai_description,
                    "ocr_text": r["found_item"].ocr_text,
                    "location": r["found_item"].location,
                    "color": r["found_item"].color,
                    "brand": r["found_item"].brand,
                    "image_path": r["found_item"].image_path,
                    "status": r["found_item"].status,
                    "created_at": r["found_item"].created_at.isoformat(),
                }
            }
            for r in results
        ]
    }


@router.get("/", response_model=List[MatchOut])
def list_all_matches(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return (
        db.query(Match)
        .order_by(Match.score.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/lost/{lost_item_id}")
def get_matches_for_lost_item(lost_item_id: int, db: Session = Depends(get_db)):
    matches = (
        db.query(Match)
        .filter(Match.lost_item_id == lost_item_id)
        .order_by(Match.score.desc())
        .all()
    )
    return matches
