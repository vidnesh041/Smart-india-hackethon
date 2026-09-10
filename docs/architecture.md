# architecture.md
## AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant

---

## 1. Architecture Overview

This is a **3-tier web application**:

```
[ React Frontend ]  <--HTTP/JSON-->  [ FastAPI Backend ]  <-->  [ PostgreSQL Database ]
                                              |
                                              v
                                     [ OpenAI API (advisory text) ]
```

### Data Flow (End-to-End Request Lifecycle)

1. **User Input** — User fills a form OR speaks into the microphone.
   - If voice: Browser's Web Speech API converts speech → text on the client side.
2. **Frontend → Backend** — React sends the collected data (business type, investment amount, location, experience) as a JSON payload via Axios to a FastAPI endpoint (e.g., `POST /api/advisory`).
3. **Backend Validation** — FastAPI validates the incoming payload using Pydantic schemas.
4. **Scheme Matching** — Backend service queries PostgreSQL (via SQLAlchemy ORM) for scheme rules matching the user's project cost bracket and business category.
5. **Financial Calculation** — A pure Python module (`loan_calculator.py`) computes margin money, loan amount, interest, and EMI using the matched scheme's fixed rules. **No AI involved in this step.**
6. **AI Advisory Generation** — The calculated numbers + user context are passed to the OpenAI API with a structured prompt; it returns a natural-language explanation and a short business plan summary.
7. **Response** — Backend returns a combined JSON response (scheme details + calculated numbers + AI-generated text) to the frontend.
8. **Display** — React renders the result in a card-based UI.

### Core Components / Subsystems

| Subsystem | Responsibility |
|---|---|
| Frontend (React) | UI, voice capture, form handling, displaying results |
| API Layer (FastAPI routes) | Request handling, validation, orchestration |
| Business Logic Layer (services) | Scheme matching + loan calculation (deterministic) |
| AI Layer (ai_advisory.py) | Prompt construction + OpenAI API calls |
| Data Layer (PostgreSQL + SQLAlchemy) | Storage of scheme rules, user submissions (demo data) |

### How Subsystems Interact

- Frontend never talks to the database or OpenAI directly — everything goes through FastAPI.
- The AI layer never performs calculations; it only explains numbers already computed by the business logic layer.
- The database is the single source of truth for scheme rules (interest rates, tier limits, margin percentages) — these are NOT hardcoded in the AI prompt or frontend.

---

## 2. Folder & File Structure

```
rural-advisory-app/
│
├── frontend/                          # React App
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/                # Reusable UI parts
│   │   │   ├── MicButton.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── pages/                     # Full pages
│   │   │   ├── Home.jsx
│   │   │   ├── FormPage.jsx
│   │   │   └── ResultPage.jsx
│   │   │
│   │   ├── services/                  # API calls
│   │   │   └── api.js                 # Axios instance + API call functions
│   │   │
│   │   ├── utils/                     # Helper functions
│   │   │   └── speechToText.js        # Web Speech API wrapper
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                           # FastAPI App
│   ├── app/
│   │   ├── main.py                    # FastAPI app entry point, router registration
│   │   │
│   │   ├── routes/                    # API endpoints
│   │   │   ├── scheme_routes.py       # GET /api/schemes
│   │   │   └── advisory_routes.py     # POST /api/advisory
│   │   │
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── user_model.py
│   │   │   └── scheme_model.py
│   │   │
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   │   └── user_schema.py
│   │   │
│   │   ├── services/                  # Business logic (the core of the app)
│   │   │   ├── loan_calculator.py     # Pure Python: margin money, loan, EMI math
│   │   │   ├── scheme_matcher.py      # Rule-based scheme matching logic
│   │   │   └── ai_advisory.py         # OpenAI API call + prompt template
│   │   │
│   │   ├── database/
│   │   │   └── db_connection.py       # PostgreSQL + SQLAlchemy engine/session setup
│   │   │
│   │   └── config.py                  # Loads env vars: API keys, DB URL, settings
│   │
│   ├── requirements.txt
│   └── .env                           # Secret keys (OPENAI_API_KEY, DATABASE_URL) — never commit
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── rules.md
│   └── phases.doc.md
│
└── README.md
```

---

## 3. Tech Stack

### Frontend
| Component | Technology |
|---|---|
| Framework | React.js |
| Styling | Tailwind CSS |
| API Calls | Axios |
| State Management | React `useState` / `useContext` |
| Routing | React Router |
| Voice Input | Web Speech API (browser-native, free) |
| Icons | lucide-react |
| Deployment | Vercel / Netlify |

### Backend
| Component | Technology |
|---|---|
| Framework | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| AI API | OpenAI (ChatGPT) API |
| Calculation Logic | Pure Python (no external AI dependency) |
| Deployment | Render / Railway |

### Why This Stack (Rationale)
- **FastAPI** chosen over Flask/Django for async performance, built-in Pydantic validation, and auto-generated Swagger docs — critical for fast hackathon iteration and easy demoing.
- **PostgreSQL + SQLAlchemy** chosen over MongoDB because the domain data (users, schemes, loan calculations) is structured and relational.
- **OpenAI API** chosen for advisory text generation; by default by API-level data is not used for model training, and the hackathon uses only demo/dummy data.
- **Web Speech API** chosen for voice input because it is free, browser-native, and requires no extra backend infrastructure.
