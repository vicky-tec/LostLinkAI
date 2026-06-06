import os
from typing import Optional

# Try to import EasyOCR; fall back gracefully if not installed
try:
    import easyocr
    _reader = None

    def _get_reader():
        global _reader
        if _reader is None:
            _reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        return _reader

    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    print("EasyOCR not available — using Tesseract fallback or mock OCR")


def extract_text_from_image(image_path: str) -> Optional[str]:
    """Extract text from an image using EasyOCR."""
    if not os.path.exists(image_path):
        return None

    if EASYOCR_AVAILABLE:
        try:
            reader = _get_reader()
            results = reader.readtext(image_path)
            if not results:
                return None
            # Filter low-confidence results and join
            texts = [text for (_, text, conf) in results if conf > 0.3]
            return " | ".join(texts) if texts else None
        except Exception as e:
            print(f"EasyOCR error: {e}")
            return _tesseract_fallback(image_path)

    return _tesseract_fallback(image_path)


def _tesseract_fallback(image_path: str) -> Optional[str]:
    """Try pytesseract as a fallback OCR method."""
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img).strip()
        return text if text else None
    except Exception as e:
        print(f"Tesseract fallback error: {e}")
        return None
