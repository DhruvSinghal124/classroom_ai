# Classroom.AI 🎓

> Your AI-powered educational toolkit for classroom tasks.

## Features

- 📝 **AI Notes Generator** — Convert lectures into structured notes
- 📋 **Summarizer** — Condense long text into key points
- ✍️ **Essay Writer** — Generate complete essays on any topic
- ✅ **Grammar Checker** — Fix spelling and grammar issues
- 🔄 **Paraphraser** — Clean up messy text into proper paragraphs
- 💬 **Q&A Chat** — Ask questions, get AI-powered answers
- ⚡ **Code Generator** — Describe what you need, get working code
- 💡 **Code Explainer** — Get simple explanations for code
- 🐛 **Code Debugger** — Fix buggy code with AI
- 🎤 **Voice to Text** — Convert speech to text
- 🖼️ **Image Preview** — Extract text from images with OCR

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML, CSS (custom design system), JavaScript (ES Modules) |
| Backend | Python, Flask |
| AI | Google Gemini 2.5 Flash |
| Auth | Firebase Authentication (Google + Email/Password) |
| Database | Cloud Firestore |
| OCR | OCR.space API |

## Setup

### Prerequisites
- Python 3.9+
- A Google Gemini API key
- A Firebase project

### 1. Clone the repo
```bash
git clone https://github.com/your-username/ClassRoom-AI.git
cd ClassRoom-AI
```

### 2. Backend setup
```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Start the backend
```bash
python connect_api.py
```

### 4. Open the frontend
Open `home.html` in your browser, or use a local server:
```bash
# Using Python
python -m http.server 5500

# Using VS Code Live Server extension (recommended)
```

## Project Structure

```
├── css/
│   ├── global.css          # Design system tokens & base styles
│   └── components.css      # Reusable component styles
├── js/
│   ├── firebase-config.js  # Single Firebase configuration
│   ├── api.js              # Centralized API client
│   ├── ui.js               # Toast, modal, loading utilities
│   ├── sidebar.js          # Shared sidebar component
│   └── theme.js            # Dark/light mode toggle
├── home.html               # Landing page
├── dashboard.html           # User dashboard
├── questioning.html         # Q&A chat
├── notes.html              # Notes generator
├── summarizer.html         # Text summarizer
├── essay_writer.html       # Essay writer
├── grammar-checker.html    # Grammar checker
├── paraphraser.html        # Paraphraser
├── code_generator.html     # Code generator
├── code_explainer.html     # Code explainer
├── code_debugger.html      # Code debugger
├── speech_to_text.html     # Voice to text
├── image_preview.html      # Image text extraction
├── settings.html           # Settings hub
├── connect_api.py          # Flask API server
├── requirements.txt        # Python dependencies
├── .env.example            # Environment template
└── .gitignore
```

## Security

- API keys stored in `.env` (never committed)
- Rate limiting on all API endpoints
- Input sanitization and length limits
- CORS origin whitelist
- Secure response headers

## Accessibility

- WCAG 2.1 AA compliant
- Skip navigation links
- ARIA landmarks and labels
- Keyboard navigable (Tab, Escape for modals)
- Screen reader compatible
- `prefers-reduced-motion` support
- Proper form labels and error messages

## License

MIT © 2025 Classroom.AI
