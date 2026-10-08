# phases.doc.md
## Sequential Development Roadmap
### Hyper-Local AI Business Advisory Assistant with Smart Scheme Calculator

---

### PHASE 1: PROJECT SETUP
- Initialize React frontend + FastAPI backend per `architecture.md`'s folder structure.
- Set up PostgreSQL + SQLAlchemy connection.
- Create the `loan_schemes` table and seed it with **exactly the 2 official schemes** (Micro Finance Scheme, Term Loan Scheme) using the exact numbers from `PRD.md` Section 1.
↓

### PHASE 2: MODULE 2 — FINANCIAL ENGINE (Build This First — It's the Core, Deterministic Part)
- Implement `loan_calculator.py`:
  - `calculate_project_cost(available_margin_capital)` → margin ÷ 10%
  - `calculate_loan_amount(project_cost)` → 90% of project cost
  - `select_scheme(project_cost)` → exact if/else against the ₹1.40 lakh boundary
  - `generate_repayment_schedule(...)` → quarterly schedule respecting the moratorium period
- Write unit tests immediately using the official worked example (₹1,00,000 → ₹10,00,000 → ₹9,00,000 → Term Loan Scheme) before moving on.
- Build `POST /api/financial-plan` endpoint.
- Build the 3-field input form (`InputPage.jsx`: Location, Available Margin Capital, Business Category) and `FinancialRoadmapCard.jsx` to display the result.
- **Verify this phase end-to-end and get it 100% mathematically correct before starting Phase 3** — this is the trust-critical part of the app.
↓

### PHASE 3: MODULE 1 — FEASIBILITY ENGINE
- Build `feasibility_data_service.py`: fetch Udyam Registration data (data.gov.in API) for competitor density by location + category; fetch population/demographic estimate for the location.
- Build `feasibility_report_service.py`: construct the grounded prompt (user input + grounding data) and call the LLM to generate the 6 sub-sections (Market Reach, Opportunity Analysis, SWOT, Threats, Competitor Mapping, Product Market Value).
- Build `POST /api/feasibility-report` endpoint — must run independently of Module 2 and must not fail the whole request if grounding data is unavailable.
- Build `FeasibilityReportCard.jsx` on the frontend (SWOT as a 2x2 grid, other sections as labeled text blocks).
↓

### PHASE 4: COMBINED RESULT PAGE + VOICE INPUT
- Wire up `ResultPage.jsx` to call both `/api/financial-plan` and `/api/feasibility-report` concurrently (e.g., `Promise.all` or independent renders as each resolves) — Module 2's card should appear first since it resolves faster.
- Add `MicButton.jsx` + speech-to-text so the 3 inputs can be captured by voice, in Hindi/Marathi/English.
- Add the AI-generated disclaimer banner on the Feasibility Report card.
↓

### PHASE 5: TESTING & QUALITY ASSURANCE
- Unit test `loan_calculator.py` (boundary cases, as noted in `rules.md`).
- Integration test both endpoints independently, and test that Module 1 failing does not break Module 2's response.
- Manually test 3+ different business categories/locations to sanity-check Module 1's feasibility report quality and Module 2's number accuracy.
- Test voice input across all 3 languages.
↓

### PHASE 6: DEPLOYMENT & DEMO PREP
- Deploy frontend (Vercel/Netlify) and backend + PostgreSQL (Render/Railway).
- Confirm voice input works on the live HTTPS URL.
- Prepare a live demo using the exact worked example from the PRD (₹1,00,000 margin capital) so the numbers are easy for judges to verify by hand.
- Prepare talking points on the two-module structure (financial roadmap vs. feasibility report) matching the official problem statement's Module 1 / Module 2 framing exactly — this alignment with the problem statement's own language is a strong scoring point.
