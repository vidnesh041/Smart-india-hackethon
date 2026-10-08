# rules.md
## Project Rules, Standards, Constraints & Guidelines
### Hyper-Local AI Business Advisory Assistant with Smart Scheme Calculator

---

## 1. What to Use

- **Frontend:** React.js (functional components + hooks), Tailwind CSS, Axios, Web Speech API / Whisper for voice.
- **Backend:** FastAPI with **async route handlers for both `/api/financial-plan` and `/api/feasibility-report`**, ideally triggered concurrently from the frontend (fire both requests at once, render each card as it resolves).
- **Database:** PostgreSQL via SQLAlchemy ORM only.
- **Validation:** Pydantic schemas for all incoming requests — validate `available_margin_capital` is a positive number before it ever reaches `loan_calculator.py`.

## 2. What to Avoid

- **Do NOT let the AI/LLM perform, override, or "double-check" any Module 2 calculation** (Project Cost, Loan Amount, scheme selection, EMI schedule). This is the single most important rule in this project. Module 2 must have zero code path that calls the OpenAI client.
- **Do NOT hardcode the two schemes' numbers (interest rate, tenure, moratorium, tier boundary of ₹1.40 lakh) in more than one place.** They live in the `loan_schemes` database table only. If a value needs to change, it changes in one place.
- **Do NOT invert the calculation direction.** The user provides **Available Margin Capital** (the 10% they already have) — the system calculates **upward** to Project Cost and Loan Amount. Do not build a form asking for "total investment" or "total project cost" as the primary input; that is a different (incorrect) direction from what the problem statement specifies.
- **Do NOT let Module 1's feasibility report present itself as verified fact.** It must always be labeled as AI-generated guidance.
- **Do NOT block the user from seeing Module 2's results while waiting for Module 1.** They should load independently.

## 3. Libraries & Dependencies

Same as previously defined in `development.md` (FastAPI, SQLAlchemy, psycopg2-binary, pydantic, openai, python-dotenv on backend; react, axios, tailwindcss, lucide-react on frontend) — no changes required for this update, only the internal logic and endpoints change.

## 4. Error Handling

- If `available_margin_capital` results in a Project Cost **greater than ₹50,00,000**, do not crash — return a clear structured response: `{"scheme_selected": null, "message": "Your project cost exceeds the scope of these two schemes. Please consult your nearest CSC/bank for larger financing options."}`
- If Module 1 (feasibility report / LLM call) fails or times out, **Module 2's financial roadmap must still be returned successfully** — the two modules must fail independently, never together.
- If grounding data (Udyam/Places API) is unavailable for a given location, Module 1 should still generate a qualitative report but must explicitly note: "Local business density data was unavailable for this area; this estimate is based on general category knowledge only."

## 5. Boundaries of AI

| Task | AI Allowed? |
|---|---|
| Calculating Project Cost, Loan Amount | ❌ Never — pure Python only |
| Selecting which scheme (Micro Finance vs Term Loan) | ❌ Never — pure Python `if/else` on the fixed ₹1.40 lakh boundary |
| Generating the EMI/repayment schedule numbers | ❌ Never — pure Python |
| Writing the Market Reach, Opportunity Analysis, SWOT, Threats, Competitor Mapping summary, Pricing suggestion (Module 1) | ✅ Yes — this is explicitly the AI's job per the problem statement |
| Explaining Module 2's numbers in plain/local language | ✅ Yes — explanation only, never recomputation |

## 6. General Rules

- **Naming:** `snake_case` for Python, `camelCase` for JS, `PascalCase` for React components.
- **Every financial number shown in the UI must be traceable to a `loan_calculator.py` function** — if you can't point to the exact function that produced a number on screen, it's a bug.
- **Testing:** Unit test `loan_calculator.py` with the exact worked example from the PRD (₹1,00,000 margin → ₹10,00,000 project cost → ₹9,00,000 loan → Term Loan Scheme selected) as the primary test case, plus boundary tests exactly at ₹1,40,000 project cost (should select Micro Finance) and ₹1,40,000.01 (should select Term Loan).
- **Documentation:** Every function in `loan_calculator.py` must have a docstring explicitly stating it performs deterministic math with no AI involvement, to make the boundary obvious to future contributors (including AI coding agents).
