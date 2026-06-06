import json
import numpy as np
from typing import List, Tuple
from sqlalchemy.orm import Session
from models import LostItem, FoundItem, Match
from services.gemini_service import generate_embedding, generate_match_reason


def cosine_similarity(vec_a: list, vec_b: list) -> float:
    """Compute cosine similarity between two vectors."""
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def build_lost_item_text(item: LostItem) -> str:
    return f"{item.title}. {item.description}. Location: {item.location}."


def build_found_item_text(item: FoundItem) -> str:
    parts = []
    if item.category:
        parts.append(f"Category: {item.category}")
    if item.ai_description:
        parts.append(item.ai_description)
    if item.color:
        parts.append(f"Color: {item.color}")
    if item.brand:
        parts.append(f"Brand: {item.brand}")
    if item.ocr_text:
        parts.append(f"Text on item: {item.ocr_text}")
    if item.location:
        parts.append(f"Found at: {item.location}")
    return ". ".join(parts)


def ensure_embedding(item, db: Session, text: str):
    """Generate and save embedding if not already stored."""
    if not item.embedding:
        emb = generate_embedding(text)
        item.embedding = json.dumps(emb)
        db.commit()
        db.refresh(item)
    return json.loads(item.embedding)


def run_matching_for_lost_item(lost_item_id: int, db: Session, top_k: int = 5) -> List[dict]:
    """Run full AI matching pipeline for a lost item against all found items."""
    lost_item = db.query(LostItem).filter(LostItem.id == lost_item_id).first()
    if not lost_item:
        return []

    lost_text = build_lost_item_text(lost_item)
    lost_emb = ensure_embedding(lost_item, db, lost_text)

    found_items = db.query(FoundItem).filter(FoundItem.status == "unclaimed").all()
    if not found_items:
        return []

    scored: List[Tuple[float, FoundItem]] = []
    for fi in found_items:
        found_text = build_found_item_text(fi)
        found_emb = ensure_embedding(fi, db, found_text)
        score = cosine_similarity(lost_emb, found_emb)
        # Boost score with keyword overlap
        score = _keyword_boost(score, lost_text.lower(), found_text.lower())
        scored.append((score, fi))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_matches = scored[:top_k]

    results = []
    for score, fi in top_matches:
        if score < 0.1:
            continue

        # Check if match already exists
        existing = db.query(Match).filter(
            Match.lost_item_id == lost_item_id,
            Match.found_item_id == fi.id
        ).first()

        found_text = build_found_item_text(fi)
        reason = generate_match_reason(lost_text, found_text, score)

        if existing:
            existing.score = score
            existing.reason = reason
            db.commit()
            match_obj = existing
        else:
            match_obj = Match(
                lost_item_id=lost_item_id,
                found_item_id=fi.id,
                score=score,
                reason=reason
            )
            db.add(match_obj)
            db.commit()
            db.refresh(match_obj)

        results.append({
            "match_id": match_obj.id,
            "found_item_id": fi.id,
            "score": round(score * 100, 1),
            "reason": reason,
            "found_item": fi
        })

    return results


def _keyword_boost(base_score: float, lost_text: str, found_text: str) -> float:
    """Boost similarity score based on common keyword overlap."""
    keywords = [
        "jbl", "earbuds", "wallet", "id card", "keys", "charger", "laptop",
        "library", "hostel", "canteen", "gate", "lab", "black", "blue", "red",
        "white", "iphone", "samsung", "hp", "dell", "notebook", "bottle"
    ]
    boost = 0.0
    for kw in keywords:
        if kw in lost_text and kw in found_text:
            boost += 0.05
    return min(base_score + boost, 1.0)


def semantic_search(query: str, db: Session) -> dict:
    """Perform semantic search across both lost and found items."""
    query_emb = generate_embedding(query)
    query_lower = query.lower()

    found_items = db.query(FoundItem).all()
    lost_items = db.query(LostItem).all()

    found_results = []
    for fi in found_items:
        found_text = build_found_item_text(fi)
        found_emb = ensure_embedding(fi, db, found_text)
        score = cosine_similarity(query_emb, found_emb)
        score = _keyword_boost(score, query_lower, found_text.lower())
        found_results.append((score, fi))

    lost_results = []
    for li in lost_items:
        lost_text = build_lost_item_text(li)
        lost_emb = ensure_embedding(li, db, lost_text)
        score = cosine_similarity(query_emb, lost_emb)
        score = _keyword_boost(score, query_lower, lost_text.lower())
        lost_results.append((score, li))

    found_results.sort(key=lambda x: x[0], reverse=True)
    lost_results.sort(key=lambda x: x[0], reverse=True)

    return {
        "found_items": [
            {"score": round(s * 100, 1), "item": fi}
            for s, fi in found_results[:8] if s > 0.05
        ],
        "lost_items": [
            {"score": round(s * 100, 1), "item": li}
            for s, li in lost_results[:8] if s > 0.05
        ]
    }
