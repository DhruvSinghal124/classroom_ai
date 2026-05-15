"""
Classroom.AI — Backend API Server
==================================
Flask server providing AI-powered endpoints for text, code, and language tools.
Uses Google Gemini 2.5 Flash for all AI operations.

Security features:
- Environment variable configuration (no hardcoded secrets)
- Rate limiting per IP
- CORS origin whitelist
- Input validation & sanitization
- Request size limits
- Secure response headers
"""

import os
import logging
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import bleach
import google.generativeai as genai

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-fallback-key")
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5500").split(",")
RATE_LIMIT = os.getenv("RATE_LIMIT", "30/minute")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is required. See .env.example")

# ---------------------------------------------------------------------------
# App Initialization
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY

# CORS — only allow specified origins
CORS(app, origins=[origin.strip() for origin in ALLOWED_ORIGINS])

# Rate limiting — prevent abuse
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[RATE_LIMIT],
    storage_uri="memory://",
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MAX_INPUT_LENGTH = 15_000  # characters
MAX_REQUEST_SIZE = 1 * 1024 * 1024  # 1 MB

# ---------------------------------------------------------------------------
# Security Middleware
# ---------------------------------------------------------------------------
@app.before_request
def check_request_size():
    """Reject oversized requests."""
    if request.content_length and request.content_length > MAX_REQUEST_SIZE:
        return jsonify({"error": "Request too large. Maximum size is 1 MB."}), 413


@app.after_request
def add_security_headers(response):
    """Add security headers to every response."""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def sanitize_input(text: str) -> str:
    """Strip HTML/script tags and enforce length limit."""
    if not text:
        return ""
    cleaned = bleach.clean(text, tags=[], strip=True)
    return cleaned[:MAX_INPUT_LENGTH]


def validate_text_input(field_name: str = "text"):
    """Decorator that validates the JSON body contains a non-empty text field."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            data = request.get_json(silent=True)
            if not data:
                return jsonify({"error": "Invalid JSON body."}), 400

            raw = data.get(field_name, "")
            if not isinstance(raw, str) or not raw.strip():
                return jsonify({"error": f"'{field_name}' is required and must be a non-empty string."}), 400

            # Inject sanitized text into kwargs for the route
            kwargs["clean_text"] = sanitize_input(raw.strip())
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def call_gemini(prompt: str, model_name: str = "gemini-2.5-flash") -> str:
    """Call the Gemini API with error handling."""
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        raise

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

# Health Check
@app.route("/")
@limiter.exempt
def health():
    """Health check endpoint."""
    return jsonify({"status": "API is running", "version": "2.0.0"}), 200


# Notes Generator
@app.route("/gemini", methods=["POST"])
@validate_text_input("prompt")
def notes_generator(clean_text: str = ""):
    try:
        result = call_gemini(clean_text)
        return jsonify({"response": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# General AI Response (voice-to-text, image-to-text)
@app.route("/ai-respond", methods=["POST"])
@validate_text_input("prompt")
def ai_respond(clean_text: str = ""):
    try:
        result = call_gemini(clean_text)
        return jsonify({"response": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# Grammar Checker
@app.route("/grammar", methods=["POST"])
@validate_text_input("text")
def grammar(clean_text: str = ""):
    prompt = (
        "Correct the grammar and spelling of the following paragraph.\n"
        "Return only the corrected version, nothing else.\n\n"
        f"{clean_text}"
    )
    try:
        result = call_gemini(prompt)
        return jsonify({"corrected": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# Essay Writer
@app.route("/essay", methods=["POST"])
@validate_text_input("topic")
def essay(clean_text: str = ""):
    prompt = (
        f'Write a well-structured essay of 300–400 words on the topic: "{clean_text}"'
    )
    try:
        result = call_gemini(prompt)
        return jsonify({"essay": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# Summarizer
@app.route("/summarize", methods=["POST"])
@validate_text_input("text")
def summarize(clean_text: str = ""):
    prompt = (
        "Please provide a concise summary of the following text in 3-4 sentences. "
        "Focus only on the key points and remove any repetition or filler:\n\n"
        f"{clean_text}"
    )
    try:
        result = call_gemini(prompt)
        return jsonify({"summary": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# Question Answering
@app.route("/ask", methods=["POST"])
@validate_text_input("question")
def ask_question(clean_text: str = ""):
    """Dedicated endpoint for the Q&A chat tool."""
    prompt = (
        "You are a helpful AI tutor. Answer the following question clearly and concisely. "
        "If it's a factual question, provide accurate information. "
        "If it's a conceptual question, explain with simple examples.\n\n"
        f"Question: {clean_text}"
    )
    try:
        result = call_gemini(prompt)
        return jsonify({"answer": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# Code Generator
@app.route("/generate", methods=["POST"])
@validate_text_input("prompt")
def generate(clean_text: str = ""):
    try:
        result = call_gemini(clean_text, model_name="gemini-2.5-flash")
        return jsonify({"code": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# Code Explainer
@app.route("/explain", methods=["POST"])
@validate_text_input("prompt")
def explain(clean_text: str = ""):
    prompt = f"Explain the following code in simple terms:\n\n{clean_text}"
    try:
        result = call_gemini(prompt)
        return jsonify({"summary": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# Code Debugger
@app.route("/debug", methods=["POST"])
@validate_text_input("prompt")
def debug_code(clean_text: str = ""):
    prompt = (
        "Debug the following code and return only the corrected version:\n\n"
        f"{clean_text}"
    )
    try:
        result = call_gemini(prompt)
        return jsonify({"fixed_code": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# Paraphraser
@app.route("/paragraphize", methods=["POST"])
@validate_text_input("text")
def paragraphize(clean_text: str = ""):
    prompt = (
        "Rewrite the following rough or broken text into clean, clear, "
        "well-structured paragraphs:\n\n"
        f"{clean_text}"
    )
    try:
        result = call_gemini(prompt)
        return jsonify({"paragraph": result})
    except Exception:
        return jsonify({"error": "AI service temporarily unavailable."}), 503


# ---------------------------------------------------------------------------
# Error Handlers
# ---------------------------------------------------------------------------
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found."}), 404


@app.errorhandler(429)
def rate_limited(e):
    return jsonify({
        "error": "Too many requests. Please slow down.",
        "retry_after": e.description,
    }), 429


@app.errorhandler(500)
def internal_error(e):
    logger.error("Internal server error: %s", e)
    return jsonify({"error": "Internal server error."}), 500


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(
        debug=FLASK_DEBUG,
        host="0.0.0.0",
        port=5000,
    )
