# LostLink AI 🔗⚡

> AI-powered Lost & Found Recovery System for College Campuses  
> **Hack4Bharat 2024 — Best Use of Google Gemini API**

---

## 🚀 Quick Start

### 1. Setup Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
python seed.py      # Seed with campus mock data
uvicorn main:app --reload
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Or use the startup script (Windows)

```bat
start.bat
```

Open: **http://localhost:5173**  
API Docs: **http://localhost:8000/docs**

---

## 🧠 AI Features

| Feature | Technology |
|---------|-----------|
| Image Analysis | Gemini 1.5 Flash Vision |
| Text Extraction | EasyOCR + Gemini fallback |
| Semantic Embeddings | Gemini `text-embedding-004` |
| Match Reasoning | Gemini 1.5 Flash |
| Natural Language Search | Gemini Embeddings + Cosine Similarity |

---

## 📁 Project Structure

```
LostLinkAI/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # DB models
│   ├── seed.py              # Mock campus data
│   ├── services/
│   │   ├── gemini_service.py
│   │   ├── ocr_service.py
│   │   └── match_service.py
│   └── routers/             # API endpoints
└── frontend/
    └── src/
        ├── pages/           # React pages
        └── components/      # Shared components
```

---

## 🎯 Hackathon Demo Flow

1. Upload IIT ID card photo → **Gemini extracts text & identifies item**
2. Submit lost item description → **Embedding generated**
3. Run AI matching → **89% match score with reason**
4. Submit claim → **Accept/Reject flow**

---

## 🔧 Environment Variables

```env
GEMINI_API_KEY=your_key_here
DATABASE_URL=sqlite:///./lostlink.db
UPLOAD_DIR=./uploads
```
