from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_items = relationship("LostItem", back_populates="user")
    found_items = relationship("FoundItem", back_populates="user")
    claims = relationship("Claim", back_populates="claimant")


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(200))
    date_lost = Column(String(50))
    contact_phone = Column(String(20), nullable=True)
    image_path = Column(String(500), nullable=True)
    embedding = Column(Text, nullable=True)  # JSON stored as string
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="lost_items")
    matches = relationship("Match", back_populates="lost_item")
    claims = relationship("Claim", back_populates="lost_item")


class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String(500), nullable=True)
    category = Column(String(100))
    ai_description = Column(Text)
    ocr_text = Column(Text, nullable=True)
    location = Column(String(200))
    color = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    embedding = Column(Text, nullable=True)  # JSON stored as string
    status = Column(String(20), default="unclaimed")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="found_items")
    matches = relationship("Match", back_populates="found_item")
    claims = relationship("Claim", back_populates="found_item")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"))
    found_item_id = Column(Integer, ForeignKey("found_items.id"))
    score = Column(Float)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="matches")
    found_item = relationship("FoundItem", back_populates="matches")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=True)
    found_item_id = Column(Integer, ForeignKey("found_items.id"))
    claimant_user_id = Column(Integer, ForeignKey("users.id"))
    claimant_name = Column(String(100))
    claimant_email = Column(String(150))
    message = Column(Text, nullable=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="claims")
    found_item = relationship("FoundItem", back_populates="claims")
    claimant = relationship("User", back_populates="claims")
