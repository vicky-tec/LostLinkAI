from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import FoundItem, LostItem
from services.match_service import semantic_search
from schemas import SearchRequest

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("/")
def smart_search(payload: SearchRequest, db: Session = Depends(get_db)):
    """Semantic natural language search across lost and found items."""
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    results = semantic_search(payload.query, db)

    def serialize_found(fi):
        return {
            "id": fi.id,
            "category": fi.category,
            "ai_description": fi.ai_description,
            "ocr_text": fi.ocr_text,
            "location": fi.location,
            "color": fi.color,
            "brand": fi.brand,
            "image_path": fi.image_path,
            "status": fi.status,
            "created_at": fi.created_at.isoformat(),
        }

    def serialize_lost(li):
        return {
            "id": li.id,
            "title": li.title,
            "description": li.description,
            "location": li.location,
            "date_lost": li.date_lost,
            "status": li.status,
            "created_at": li.created_at.isoformat(),
        }

    return {
        "query": payload.query,
        "found_items": [
            {"score": r["score"], "item": serialize_found(r["item"])}
            for r in results["found_items"]
        ],
        "lost_items": [
            {"score": r["score"], "item": serialize_lost(r["item"])}
            for r in results["lost_items"]
        ],
        "total": len(results["found_items"]) + len(results["lost_items"])
    }
