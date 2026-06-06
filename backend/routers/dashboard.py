from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import LostItem, FoundItem, Match, Claim, User
from typing import List

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_lost = db.query(LostItem).count()
    total_found = db.query(FoundItem).count()
    successful_recoveries = db.query(LostItem).filter(LostItem.status == "recovered").count()
    pending_claims = db.query(Claim).filter(Claim.status == "pending").count()
    total_users = db.query(User).count()

    # Recent matches
    recent_matches = (
        db.query(Match)
        .order_by(Match.created_at.desc())
        .limit(5)
        .all()
    )

    def serialize_match(m):
        return {
            "id": m.id,
            "score": round(m.score * 100, 1),
            "reason": m.reason,
            "created_at": m.created_at.isoformat(),
            "lost_item": {
                "id": m.lost_item.id,
                "title": m.lost_item.title,
                "location": m.lost_item.location,
                "image_path": m.lost_item.image_path,
            } if m.lost_item else None,
            "found_item": {
                "id": m.found_item.id,
                "category": m.found_item.category,
                "location": m.found_item.location,
                "color": m.found_item.color,
                "image_path": m.found_item.image_path,
            } if m.found_item else None,
        }

    # Recent activity feed
    recent_found = db.query(FoundItem).order_by(FoundItem.created_at.desc()).limit(3).all()
    recent_lost = db.query(LostItem).order_by(LostItem.created_at.desc()).limit(3).all()

    activity = []
    for fi in recent_found:
        activity.append({
            "type": "found",
            "text": f"Found item reported: {fi.category or 'Unknown'} at {fi.location}",
            "time": fi.created_at.isoformat(),
            "image_path": fi.image_path,
        })
    for li in recent_lost:
        activity.append({
            "type": "lost",
            "text": f"Lost item reported: {li.title} at {li.location}",
            "time": li.created_at.isoformat(),
            "image_path": li.image_path,
        })
    activity.sort(key=lambda x: x["time"], reverse=True)

    return {
        "stats": {
            "total_lost": total_lost,
            "total_found": total_found,
            "successful_recoveries": successful_recoveries,
            "pending_claims": pending_claims,
            "total_users": total_users,
        },
        "recent_matches": [serialize_match(m) for m in recent_matches],
        "activity_feed": activity[:6],
    }
