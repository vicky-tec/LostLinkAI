import os
import json
import base64
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

_client = None

def _get_client():
    global _client
    if _client is None and GEMINI_API_KEY:
        try:
            from google import genai
            _client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as e:
            print(f"Gemini client init error: {e}")
    return _client


def _image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def analyze_found_item_image(image_path: str) -> dict:
    """Use Gemini Vision to analyze a found item image and return structured data."""
    if not GEMINI_API_KEY:
        return _mock_image_analysis(image_path)

    try:
        from google import genai
        from google.genai import types
        client = _get_client()
        if not client:
            return _mock_image_analysis(image_path)

        img = Image.open(image_path)
        # Convert to bytes
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        img_bytes = buf.getvalue()

        prompt = """Analyze this image of a found item in detail. Return a JSON object with these exact fields:
{
  "category": "one of: ID Card, Wallet, Keys, Earphones/Headphones, Charger, Book/Notebook, Water Bottle, Bag/Backpack, Phone, Glasses, Clothing, Document, Electronics, Other",
  "description": "detailed 2-3 sentence description of the item",
  "color": "primary color(s) of the item",
  "brand": "brand name if visible, else null",
  "visible_text": "any text visible on the item (names, IDs, numbers, institutes), else null",
  "condition": "Good / Fair / Poor",
  "identifiers": "unique identifying features like serial numbers, stickers, markings"
}
Return only valid JSON, no markdown."""

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                types.Part.from_text(text=prompt),
            ]
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"Gemini Vision error: {e}")
        return _mock_image_analysis(image_path)


def generate_embedding(text: str) -> list[float]:
    """Generate a text embedding using Gemini embedding model."""
    if not GEMINI_API_KEY:
        return _mock_embedding(text)

    try:
        client = _get_client()
        if not client:
            return _mock_embedding(text)
        result = client.models.embed_content(
            model="text-embedding-004",
            contents=text,
        )
        # Result is EmbedContentResponse; get first embedding
        return result.embeddings[0].values
    except Exception as e:
        print(f"Gemini embedding error: {e}")
        return _mock_embedding(text)


def generate_match_reason(lost_desc: str, found_desc: str, score: float) -> str:
    """Use Gemini to generate a human-readable match reason."""
    if not GEMINI_API_KEY:
        return f"Both items share similar characteristics. Confidence: {score:.0%}"

    try:
        client = _get_client()
        if not client:
            return f"High similarity detected. Confidence: {score:.0%}"
        prompt = f"""A lost-and-found system matched these two items with {score:.0%} confidence.

Lost item description: {lost_desc}
Found item description: {found_desc}

Write a concise 1-2 sentence explanation of WHY these items match, highlighting the specific matching features (color, brand, location, text, category, etc.). Be specific and helpful."""
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini match reason error: {e}")
        return f"High similarity detected between item descriptions. Confidence: {score:.0%}"


def smart_search_parse(query: str) -> dict:
    """Use Gemini to parse a natural language search query into structured filters."""
    if not GEMINI_API_KEY:
        return {"keywords": query, "category": None, "location": None, "color": None}

    try:
        client = _get_client()
        if not client:
            return {"keywords": query, "category": None, "location": None, "color": None}
        prompt = f"""Parse this lost-and-found search query into structured filters. Return JSON only:
Query: "{query}"

Return:
{{
  "keywords": "key search terms",
  "category": "item category if mentioned, else null",
  "location": "location if mentioned, else null",
  "color": "color if mentioned, else null",
  "brand": "brand if mentioned, else null",
  "time_filter": "this week / today / null"
}}"""
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"Gemini search parse error: {e}")
        return {"keywords": query, "category": None, "location": None, "color": None}


# ── Mock fallbacks (when no API key) ──────────────────────────────────────────
def _mock_image_analysis(image_path: str) -> dict:
    filename = os.path.basename(image_path).lower()
    if "id" in filename or "card" in filename:
        return {
            "category": "ID Card",
            "description": "A student identity card from IIT Patna with white and blue design. The card contains student information including name and roll number.",
            "color": "White and Blue",
            "brand": "IIT Patna",
            "visible_text": "Chandan Kumar | Roll: 2021CS045 | IIT Patna",
            "condition": "Good",
            "identifiers": "Student ID card with photo, hologram sticker"
        }
    return {
        "category": "Other",
        "description": "An item found on campus. Please check the details carefully.",
        "color": "Unknown",
        "brand": None,
        "visible_text": None,
        "condition": "Good",
        "identifiers": "No unique identifiers detected"
    }


def _mock_embedding(text: str) -> list[float]:
    """Generate a deterministic mock embedding based on text content."""
    import hashlib
    import math
    hash_bytes = hashlib.sha256(text.encode()).digest()
    embedding = []
    for i in range(0, min(len(hash_bytes), 64), 2):
        val = (hash_bytes[i] / 255.0) * 2 - 1
        embedding.append(val)
    # Pad to 768 dims
    while len(embedding) < 768:
        embedding.append(math.sin(len(embedding) * 0.1))
    return embedding[:768]
