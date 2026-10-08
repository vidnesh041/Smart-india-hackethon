# development.md
## Practical Build Guide for Vibe-Coding This App
### Hyper-Local AI Business Advisory Assistant with Smart Scheme Calculator

> Feed `PRD.md`, `architecture.md`, `rules.md`, `phases.doc.md`, `ui-ux.md`, and this file together to your vibe-coding agent, inside a `docs/` folder. Build phase by phase per `phases.doc.md`.

---

## 1. Prerequisites

| Tool | Purpose |
|---|---|
| Node.js (v18+) | React frontend |
| Python (3.10+) | FastAPI backend |
| PostgreSQL (v14+) | Database |
| OpenAI API Key | Module 1 feasibility text generation only |
| data.gov.in API Key | Udyam Registration grounding data for Module 1's Competitor Mapping |

---

## 2. Setup Commands

```bash
mkdir rural-advisory-app && cd rural-advisory-app
git init

# Frontend
npm create vite@latest frontend -- --template react
cd frontend && npm install axios lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..

# Backend
mkdir backend && cd backend
python3 -m venv venv && source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic pydantic-settings python-dotenv openai httpx
pip freeze > requirements.txt
cd ..

mkdir docs
```

### `.env` (backend — never commit)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/rural_advisory_db
OPENAI_API_KEY=your_key_here
DATA_GOV_IN_API_KEY=your_key_here
```

---

## 3. Phase-by-Phase Prompts for the AI Coding Agent

### Phase 1
> "Set up the project skeleton per `architecture.md`. Create the `loan_schemes` table and seed exactly 2 rows: Micro Finance Scheme (project cost 0–1,40,000; max loan 1,25,000; 6.5% interest; 3 year tenure; 3 month moratorium) and Term Loan Scheme (project cost 1,40,000.01–50,00,000; max loan 45,00,000; 8% interest; 7 year tenure; 6 month moratorium)."

### Phase 2 (Module 2 — build and verify this fully before touching Module 1)
> "Implement `loan_calculator.py` exactly per `architecture.md` Section 2 — it takes `available_margin_capital` as input and calculates UPWARD to project cost and loan amount (margin ÷ 10% = project cost; 90% of project cost = loan amount). Do not build a calculator that takes total project cost as the primary input — that is the wrong direction per the PRD. Write unit tests using the worked example: ₹1,00,000 margin → ₹10,00,000 project cost → ₹9,00,000 loan → Term Loan Scheme selected. Build `POST /api/financial-plan` and the corresponding `InputPage.jsx` (3 fields only: location, available margin capital, business category) and `FinancialRoadmapCard.jsx`. Show me the test results before moving to Phase 3."

### Phase 3 (Module 1)
> "Implement `feasibility_data_service.py` to fetch Udyam Registration data from data.gov.in (ask me for the API key first) for competitor density, and implement `feasibility_report_service.py` to generate the 6-part feasibility report (Market Reach, Opportunity Analysis, SWOT, Threats, Competitor Mapping, Product Market Value) via an LLM call grounded in that data. Build `POST /api/feasibility-report` as an independent endpoint that must not fail Module 2 if it errors. Build `FeasibilityReportCard.jsx` with the SWOT 2x2 grid per `ui-ux.md`."

### Phase 4
> "Wire `ResultPage.jsx` to call both endpoints concurrently, show Card A (financial) as soon as it resolves without waiting for Card B (feasibility). Add voice input (mic button) for the 3-field form, supporting Hindi, Marathi, and English."

### Phase 5
> "Write the boundary unit tests specified in `rules.md` (exactly ₹1,40,000 and ₹1,40,000.01 project cost) and integration tests confirming Module 1 failure doesn't break Module 2's response."

### Phase 6
> "Prepare deployment configs for Vercel (frontend) and Render (backend + Postgres). Do not deploy secrets — tell me what environment variables I need to set manually in each dashboard."

---

## 4. Definition of Done Checklist

- [ ] Entering ₹1,00,000 as Available Margin Capital produces exactly: Project Cost ₹10,00,000, Loan Amount ₹9,00,000, Scheme = Term Loan Scheme, 8% interest, 7-year tenure, 6-month moratorium.
- [ ] Entering an amount that results in Project Cost ≤ ₹1,40,000 correctly selects Micro Finance Scheme (6.5%/3yr/3mo).
- [ ] Module 1's feasibility report always carries the AI-generated disclaimer.
- [ ] Module 2 renders even if Module 1's API call fails.
- [ ] All three languages work for both voice input and the feasibility report's text output.
- [ ] No leftover demo/mock scheme data anywhere in the running app — only the 2 official schemes and real grounding data sources are used.
