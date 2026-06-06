from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── User ──────────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime
    class Config:
        from_attributes = True


# ── Lost Item ─────────────────────────────────────────────────────────────────
class LostItemCreate(BaseModel):
    title: str
    description: str
    location: str
    date_lost: str
    contact_phone: Optional[str] = None
    user_id: Optional[int] = None

class LostItemOut(BaseModel):
    id: int
    title: str
    description: str
    location: str
    date_lost: str
    contact_phone: Optional[str]
    image_path: Optional[str]
    status: str
    created_at: datetime
    user_id: Optional[int]
    class Config:
        from_attributes = True


# ── Found Item ────────────────────────────────────────────────────────────────
class FoundItemOut(BaseModel):
    id: int
    category: Optional[str]
    ai_description: Optional[str]
    ocr_text: Optional[str]
    location: Optional[str]
    color: Optional[str]
    brand: Optional[str]
    contact_phone: Optional[str]
    image_path: Optional[str]
    status: str
    created_at: datetime
    user_id: Optional[int]
    class Config:
        from_attributes = True


# ── Match ─────────────────────────────────────────────────────────────────────
class MatchOut(BaseModel):
    id: int
    lost_item_id: int
    found_item_id: int
    score: float
    reason: Optional[str]
    created_at: datetime
    lost_item: Optional[LostItemOut]
    found_item: Optional[FoundItemOut]
    class Config:
        from_attributes = True


# ── Claim ─────────────────────────────────────────────────────────────────────
class ClaimCreate(BaseModel):
    found_item_id: int
    lost_item_id: Optional[int] = None
    claimant_name: str
    claimant_email: str
    message: Optional[str] = None

class ClaimOut(BaseModel):
    id: int
    found_item_id: int
    lost_item_id: Optional[int]
    claimant_name: str
    claimant_email: str
    message: Optional[str]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True


# ── Search ────────────────────────────────────────────────────────────────────
class SearchRequest(BaseModel):
    query: str


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_lost: int
    total_found: int
    successful_recoveries: int
    pending_claims: int
    recent_matches: List[MatchOut]
