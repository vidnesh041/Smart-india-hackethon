# SAMARTH AI — Rural Business Advisory & Financial Structuring Assistant
> **Smart India Hackathon 2026 | Problem Statement ID: 26091**  
> AI-Driven Hyper-Local Business Advisory and Concessional Financial Structuring for Rural Entrepreneurs (MoSJE & NSFDC Guidelines).

---

## 🌟 Overview

**SAMARTH AI** is a dual-module financial and business advisory platform designed to empower rural micro-entrepreneurs across India. It bridges the gap between ground-level rural business ideas and formal government financial schemes without intermediaries.

### Key Capabilities
1. **Module 1 — Hyper-Local Feasibility & SWOT Analysis**:
   - Automated 6-pillar feasibility report (Market reach radius, opportunity analysis, SWOT grid, local bottlenecks, competitor density, product pricing).
   - Real-world Udyam MSME market calibration signals.

2. **Module 2 — Upward Financial Structuring Engine**:
   - Reverse-calculates total project cost and 90% concessional government loan from entrepreneur's 10% Available Margin Capital.
   - Computes moratorium periods (3–9 months) and quarterly amortization schedules.

3. **Multi-Turn Conversational AI ("Local Advisor")**:
   - Powered by Google Gemini with regional bilingual prompt guidance.
   - Live hands-free voice loop (Speech-to-Text & regional Text-to-Speech audio streaming).

4. **Comprehensive Schemes Directory**:
   - Over 2,700+ verified central and state government schemes (NSFDC, PMEGP, Mudra, Stand-Up India, Mahila Samriddhi).
   - Real-time filters by state, sector, category, and investment budget.

5. **Interactive EMI & Subsidy Calculator**:
   - Real-time loan simulator with women applicant interest rebates (1% discount), custom moratorium sliders, and amortization table export.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Lucide React, React Router v7, HTML2Canvas / JSPDF
- **Backend**: FastAPI (Python 3.10+), Pydantic v2, SQLite / SQLAlchemy, Uvicorn, HTTPX
- **AI / Speech**: Google Gemini API, Regional TTS Audio Synthesizer, Web Speech API

```
├── backend/
│   ├── app/
│   │   ├── database/        # Seed data and SQLite schema
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── routes/          # API endpoints (chat, feasibility, financial, schemes, tts)
│   │   ├── schemas/         # Pydantic v2 data models
│   │   ├── services/        # Business logic (loan calculator, Gemini AI, TTS)
│   │   ├── config.py        # Environment settings
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest suite
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UI cards, Chatbot, Modals, Navbar, Footer
│   │   ├── context/         # Bilingual Language Context (Hindi/English)
│   │   ├── pages/           # Home, InputPage, ResultPage, SchemesPage, CalculatorPage
│   │   ├── services/        # Axios API client
│   │   └── utils/           # Speech STT/TTS utilities
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json          # SPA routing configuration for Vercel
```

---

## 🚀 Quickstart (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web application will be live at: `http://localhost:5173`

---

## ☁️ Deployment Guide

### Deploying Frontend on Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://your-backend.onrender.com/api`)
5. Click **Deploy**. Vercel will build and serve your SPA.

### Deploying Backend (Render / Railway / Fly.io)
1. In Render / Railway, create a new **Web Service** pointing to the repository.
2. Set **Root Directory** to `backend`.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
5. Set Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key

---

## 📄 License
Open source under MIT License for Smart India Hackathon (SIH 2026).
