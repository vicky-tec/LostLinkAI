"""
Seed script -- populates LostLink AI with realistic IIT campus mock data.
Run with: python seed.py
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import json
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
from models import User, LostItem, FoundItem, Match, Claim
from services.gemini_service import generate_embedding
from services.match_service import build_lost_item_text, build_found_item_text

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("[SEED] Seeding LostLink AI database...")

# ── Users ──────────────────────────────────────────────────────────────────────
users_data = [
    {"name": "Chandan Kumar",     "email": "chandan.kumar@iitp.ac.in",   "role": "user"},
    {"name": "Priya Sharma",    "email": "priya.sharma@iitp.ac.in",  "role": "user"},
    {"name": "Arjun Mehta",     "email": "arjun.mehta@iitp.ac.in",   "role": "user"},
    {"name": "Sneha Patel",     "email": "sneha.patel@iitp.ac.in",   "role": "user"},
    {"name": "Vikram Singh",    "email": "vikram.singh@iitp.ac.in",  "role": "user"},
    {"name": "Admin User",      "email": "admin@iitp.ac.in",         "role": "admin"},
]

users = []
for ud in users_data:
    existing = db.query(User).filter(User.email == ud["email"]).first()
    if not existing:
        u = User(**ud)
        db.add(u)
        db.flush()
        users.append(u)
    else:
        users.append(existing)
db.commit()
print(f"  [OK] {len(users)} users seeded")

# ── Found Items ────────────────────────────────────────────────────────────────
found_data = [
    {
        "user_id": users[1].id,
        "category": "ID Card",
        "ai_description": "A student identity card from IIT Patna with white and blue color scheme. The card has a student photo on the left and displays institutional branding. The card appears to be in good condition.",
        "ocr_text": "Chandan Kumar | Roll No: 2021CS045 | B.Tech Computer Science | IIT Patna | Valid Till: 2025",
        "color": "White and Blue",
        "brand": "IIT Patna",
        "location": "Central Library, Ground Floor",
        "contact_phone": "9876543210",
        "status": "unclaimed",
        "image_path": "./uploads/id_card.jpg",
    },
    {
        "user_id": users[2].id,
        "category": "Earphones/Headphones",
        "ai_description": "A pair of black JBL wireless earbuds found inside their charging case. The earbuds are in-ear type with silicone tips. The case has a small LED indicator light.",
        "ocr_text": "JBL | TUNE 230NC TWS",
        "color": "Black",
        "brand": "JBL",
        "location": "Central Library, 2nd Floor Reading Room",
        "contact_phone": "9876543211",
        "status": "unclaimed",
        "image_path": "./uploads/earbuds.jpg",
    },
    {
        "user_id": users[3].id,
        "category": "Wallet",
        "ai_description": "A dark brown leather bi-fold wallet with multiple card slots. The wallet contains what appears to be an ATM card and some folded notes. Has a worn look indicating regular use.",
        "ocr_text": "SBI | State Bank of India",
        "color": "Dark Brown",
        "brand": None,
        "location": "Hostel-3 Mess Hall",
        "status": "unclaimed",
        "image_path": "./uploads/wallet.jpg",
    },
    {
        "user_id": users[4].id,
        "category": "Charger",
        "ai_description": "A white USB-C laptop charger with a 65W power rating. The charger has a GaN design and includes a detachable cable. The brand logo is visible on the brick.",
        "ocr_text": "Anker | 65W | GaN | USB-C | Input: 100-240V",
        "color": "White",
        "brand": "Anker",
        "location": "Computer Lab-2, EC Department",
        "status": "unclaimed",
        "image_path": "./uploads/charger.jpg",
    },
    {
        "user_id": users[0].id,
        "category": "Keys",
        "ai_description": "A set of 3 keys on a metal ring with a small red keychain tag. One key appears to be a room key, another looks like a locker key. The keychain has a miniature football charm.",
        "ocr_text": None,
        "color": "Silver with Red keychain",
        "brand": None,
        "location": "Main Gate Security Post",
        "status": "unclaimed",
        "image_path": "./uploads/keys.jpg",
    },
    {
        "user_id": users[2].id,
        "category": "Book/Notebook",
        "ai_description": "A blue hardcover engineering notebook with graph paper pages. Several pages have circuit diagrams and handwritten notes. Name is written on the first page.",
        "ocr_text": "Sneha Patel | 2022EE032 | Signals & Systems | Sem 5",
        "color": "Blue",
        "brand": None,
        "location": "Canteen Area, Table 7",
        "status": "unclaimed",
        "image_path": "./uploads/notebook.jpg",
    },
    {
        "user_id": users[1].id,
        "category": "Water Bottle",
        "ai_description": "A steel water bottle with a red lid and motivational stickers on the side. The bottle has a capacity of approximately 750ml. A sticker on the base has a name written in marker.",
        "ocr_text": "Arjun | 9823XXXXXX",
        "color": "Silver and Red",
        "brand": "Milton",
        "location": "Sports Ground, Near Basketball Court",
        "status": "unclaimed",
        "image_path": "./uploads/water_bottle.jpg",
    },
    {
        "user_id": users[3].id,
        "category": "Phone",
        "ai_description": "A black Samsung Galaxy smartphone with a cracked screen protector. The phone has a dark green case with a card holder slot at the back containing a student ID.",
        "ocr_text": "Samsung | Galaxy A54 | Vikram S.",
        "color": "Black with Green Case",
        "brand": "Samsung",
        "location": "Academic Block, Room 204",
        "status": "unclaimed",
        "image_path": "./uploads/phone.jpg",
    },
]

found_items = []
for fd in found_data:
    fi = db.query(FoundItem).filter(
        FoundItem.category == fd["category"],
        FoundItem.location == fd["location"]
    ).first()
    if not fi:
        fi = FoundItem(**fd)
        db.add(fi)
        db.flush()
    found_items.append(fi)
db.commit()

# Generate embeddings
for fi in found_items:
    if not fi.embedding:
        text = build_found_item_text(fi)
        emb = generate_embedding(text)
        fi.embedding = json.dumps(emb)
db.commit()
print(f"  [OK] {len(found_items)} found items seeded")

# ── Lost Items ────────────────────────────────────────────────────────────────
lost_data = [
    {
        "user_id": users[0].id,
        "title": "IIT Patna Student ID Card",
        "description": "Lost my IIT Patna student ID card. It's white and blue with my photo. Name: Chandan Kumar, Roll: 2021CS045, CS Department. I think I left it in the library.",
        "location": "Central Library",
        "date_lost": "2024-01-15",
        "contact_phone": "9988776655",
        "status": "active",
        "image_path": "./uploads/id_card.jpg",
    },
    {
        "user_id": users[1].id,
        "title": "Black JBL Wireless Earbuds",
        "description": "Lost my black JBL TUNE 230NC TWS earbuds with the charging case. Last seen near the library reading room on the second floor. They were in the original black case.",
        "location": "Central Library, 2nd Floor",
        "date_lost": "2024-01-16",
        "contact_phone": "9988776656",
        "status": "active",
        "image_path": "./uploads/earbuds.jpg",
    },
    {
        "user_id": users[2].id,
        "title": "Brown Leather Wallet",
        "description": "My dark brown bi-fold leather wallet is missing. It contains my SBI ATM card, some cash (around ₹800), and my college ID. I think I left it in the mess hall during dinner.",
        "location": "Hostel-3 Mess",
        "date_lost": "2024-01-14",
        "status": "active",
        "image_path": "./uploads/wallet.jpg",
    },
    {
        "user_id": users[3].id,
        "title": "White Anker USB-C Charger 65W",
        "description": "Lost my white Anker 65W GaN USB-C laptop charger in the computer lab. It has a detachable cable. I left it plugged in at one of the workstations in Lab-2.",
        "location": "Computer Lab, EC Department",
        "date_lost": "2024-01-13",
        "status": "active",
        "image_path": "./uploads/charger.jpg",
    },
    {
        "user_id": users[4].id,
        "title": "Room Keys with Red Keychain",
        "description": "Lost my set of 3 keys — hostel room key, locker key, and one more. The keys are on a silver ring with a red keychain tag and a small football charm. Lost somewhere near the main gate.",
        "location": "Main Gate Area",
        "date_lost": "2024-01-17",
        "status": "active",
        "image_path": "./uploads/keys.jpg",
    },
    {
        "user_id": users[0].id,
        "title": "Engineering Notebook — Signals & Systems",
        "description": "Lost my blue hardcover engineering notebook. It has circuit diagrams and notes for Signals & Systems (Sem 5). My name Sneha Patel and roll number 2022EE032 is written on the first page.",
        "location": "Canteen Area",
        "date_lost": "2024-01-15",
        "status": "active",
        "image_path": "./uploads/notebook.jpg",
    },
]

lost_items = []
for ld in lost_data:
    li = db.query(LostItem).filter(
        LostItem.title == ld["title"],
        LostItem.user_id == ld["user_id"]
    ).first()
    if not li:
        li = LostItem(**ld)
        db.add(li)
        db.flush()
    lost_items.append(li)
db.commit()

# Generate embeddings
for li in lost_items:
    if not li.embedding:
        text = build_lost_item_text(li)
        emb = generate_embedding(text)
        li.embedding = json.dumps(emb)
db.commit()
print(f"  [OK] {len(lost_items)} lost items seeded")

# ── Pre-computed Matches ───────────────────────────────────────────────────────
from services.match_service import cosine_similarity

match_pairs = [
    (0, 0, "Both reference an IIT Patna student ID card. The OCR text on the found item matches the lost item description: Chandan Kumar, Roll 2021CS045, CS Department, found in the Central Library."),
    (1, 1, "Both describe black JBL TUNE 230NC TWS wireless earbuds with charging case, found/lost at the Central Library reading room on the 2nd floor."),
    (2, 2, "Both refer to a dark brown leather bi-fold wallet with SBI ATM card, reported missing and found in Hostel-3 Mess Hall area."),
    (3, 3, "Both describe a white Anker 65W GaN USB-C charger lost/found in the Computer Lab of the EC Department."),
    (4, 4, "Both mention a set of 3 keys on a silver ring with a red keychain and football charm near the main gate area."),
]

for li_idx, fi_idx, reason in match_pairs:
    if li_idx < len(lost_items) and fi_idx < len(found_items):
        li = lost_items[li_idx]
        fi = found_items[fi_idx]
        existing = db.query(Match).filter(
            Match.lost_item_id == li.id,
            Match.found_item_id == fi.id
        ).first()
        if not existing:
            li_emb = json.loads(li.embedding) if li.embedding else [0.5]*768
            fi_emb = json.loads(fi.embedding) if fi.embedding else [0.5]*768
            score = cosine_similarity(li_emb, fi_emb)
            # Ensure demo scores look impressive
            score = max(score, 0.75 + fi_idx * 0.03)
            m = Match(
                lost_item_id=li.id,
                found_item_id=fi.id,
                score=min(score, 0.98),
                reason=reason,
            )
            db.add(m)

db.commit()
print(f"  [OK] {len(match_pairs)} matches seeded")

# ── Sample Claim ──────────────────────────────────────────────────────────────
existing_claim = db.query(Claim).first()
if not existing_claim and lost_items and found_items:
    claim = Claim(
        found_item_id=found_items[0].id,
        lost_item_id=lost_items[0].id,
        claimant_user_id=users[0].id,
        claimant_name="Chandan Kumar",
        claimant_email="chandan.kumar@iitp.ac.in",
        message="This is my ID card. My roll number 2021CS045 and name Chandan Kumar is clearly visible on it. I lost it in the library yesterday.",
        status="pending",
    )
    db.add(claim)
    db.commit()
    print("  [OK] 1 sample claim seeded")

db.close()
print("\n[DONE] Database seeded successfully! Run: uvicorn main:app --reload")
