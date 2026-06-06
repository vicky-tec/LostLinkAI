import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from database import engine, Base
import models  # ensure all models are registered

from routers import found_items, lost_items, matches, search, claims, dashboard, admin

load_dotenv()

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LostLink AI",
    description="AI-powered Lost & Found Recovery System for College Campuses",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(found_items.router)
app.include_router(lost_items.router)
app.include_router(matches.router)
app.include_router(search.router)
app.include_router(claims.router)
app.include_router(dashboard.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "app": "LostLink AI",
        "status": "running",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {"status": "healthy", "gemini": bool(os.getenv("GEMINI_API_KEY"))}
