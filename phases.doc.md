# phases.doc.md
## Sequential Development Roadmap
### AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant

> Note: This roadmap is adapted for a **hackathon timeline** — prioritize a working end-to-end demo over full production hardening. Follow phases in order; each phase should be a working, testable increment.

---

### PHASE 1: PROJECT SETUP & BASIC AUTH (Optional/Minimal)
- Initialize React frontend (Vite) with Tailwind CSS configured.
- Initialize FastAPI backend with folder structure as per `architecture.md`.
- Set up PostgreSQL database + SQLAlchemy connection (`db_connection.py`).
- Set up `.env` files (frontend and backend) for API keys and DB URL.
- (Optional, low priority) Simple demo login/user session — not core to the problem statement, skip if time is short.
↓

### PHASE 2: SCHEME DATABASE & DASHBOARD
- Design and create the `schemes` table (columns: scheme_name, tier, min_cost, max_cost, margin_percent, interest_rate, repayment_years, moratorium_months).
- Seed the database with real scheme data researched from NSFDC/MoSJE official guidelines (Micro Finance Scheme, NSFDC tiers, etc.).
- Build a basic dashboard/home page listing available schemes (read-only view) to confirm DB connectivity end-to-end.
- Build `GET /api/schemes` endpoint to fetch all schemes.
↓

### PHASE 3: CORE CRUD & BUSINESS LOGIC (Main Feature)
- Build the user input form (business type, investment amount, location, experience) — client-side and server-side validation (Pydantic).
- Implement `scheme_matcher.py` — matches user's project cost/business type to the correct scheme from the database.
- Implement `loan_calculator.py` — pure Python functions:
  - `calculate_margin_money(total_cost, margin_percent)`
  - `calculate_loan_amount(total_cost, margin_money)`
  - `calculate_emi(loan_amount, interest_rate, tenure_years)`
- Build `POST /api/advisory` endpoint that: validates input → matches scheme → calculates numbers → returns structured JSON (no AI yet at this stage — verify math is 100% correct first).
- Build the Result Page UI to display the returned scheme + numbers in a card layout.
↓

### PHASE 4: ADDITIONAL FEATURES (AI + VOICE)
- Integrate the Web Speech API (`speechToText.js`) + `MicButton.jsx` component for voice input; wire it to auto-fill the form.
- Implement `ai_advisory.py` — construct a prompt using the calculated numbers + user context, call the OpenAI API, and return a plain-language explanation.
- Extend `POST /api/advisory` to also call `ai_advisory.py` and include the generated explanation + basic business plan summary in the response.
- Add a disclaimer note in the UI about AI-generated advisory text.
- (Nice-to-have) Add basic settings: language toggle, area/location field for future "nearby agency" lookups.
↓

### PHASE 5: TESTING & QUALITY ASSURANCE
- Unit test `loan_calculator.py` and `scheme_matcher.py` with multiple test cases (edge cases: minimum cost, maximum cost, boundary values between tiers).
- Integration test the full `POST /api/advisory` flow (mock the OpenAI call to avoid real API cost during testing).
- Manually test the voice input flow across different phrasings ("mujhe dairy business start karna hai...", etc.) to confirm speech-to-text + form auto-fill works reliably.
- Fix bugs found in edge cases (e.g., investment amount at exact tier boundary, empty/invalid input).
- Basic performance check: ensure API response time is acceptable for a live demo (OpenAI call should not hang without a timeout/fallback).
↓

### PHASE 6: DEPLOYMENT & DEMO PREP
- Deploy frontend to Vercel/Netlify.
- Deploy backend + PostgreSQL to Render/Railway.
- Do a final end-to-end run-through on the deployed (not localhost) version — voice input requires HTTPS, so confirm it works on the live URL.
- Prepare the live demo script (aligned with the pitch structure — hook, problem, solution, live demo, USP, tech stack, impact).
- Collect feedback from a dry-run demo with teammates; fix any last-minute UX friction points.
- Plan any post-hackathon roadmap enhancements (multi-language output, WhatsApp bot integration, nearby agency lookup) to mention if judges ask "what's next."
