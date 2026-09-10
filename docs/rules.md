# rules.md
## Project Rules, Standards, Constraints & Guidelines
### AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant

---

## 1. What to Use

- **Frontend:** React.js (functional components + hooks only, no class components), Tailwind CSS for all styling, Axios for all HTTP calls, React Router for navigation.
- **Backend:** FastAPI with async route handlers wherever an external call (OpenAI API, DB query) is involved.
- **Database:** PostgreSQL, accessed only through SQLAlchemy ORM models — no raw SQL strings unless absolutely necessary for a complex query, and even then, use SQLAlchemy Core, not string concatenation.
- **Validation:** All incoming request bodies must be validated using Pydantic schemas before touching business logic.
- **Environment Variables:** All secrets (API keys, DB URL) must be loaded via a `.env` file and `python-dotenv` / `pydantic-settings` — never hardcoded.
- **Design Pattern:** Keep a clean separation — Routes (HTTP layer) → Services (business logic) → Models (data layer). Routes should contain minimal logic; they call service functions.

## 2. What to Avoid

- **Do NOT** use the AI model (OpenAI) to perform any numeric calculation (loan amount, interest, EMI). This is a hard rule — calculations must come from `loan_calculator.py`, a deterministic Python module.
- **Do NOT** hardcode scheme rules (interest rates, tier limits) inside the AI prompt or frontend code — they must live in the PostgreSQL database so they can be updated without a code change.
- **Do NOT** use deprecated or unmaintained npm/pip packages.
- **Do NOT** commit `.env` files or any API keys to version control.
- **Do NOT** use inline styles in React — use Tailwind utility classes only, for consistency.
- **Do NOT** use real user financial data anywhere in the hackathon build — demo/dummy data only.

## 3. Libraries & Dependencies

### Backend (`requirements.txt`)
| Package | Purpose |
|---|---|
| fastapi | Web framework |
| uvicorn | ASGI server |
| sqlalchemy | ORM |
| psycopg2-binary | PostgreSQL driver |
| pydantic | Data validation |
| pydantic-settings | Environment/config management |
| python-dotenv | Load `.env` variables |
| openai | OpenAI API client |

### Frontend (`package.json`)
| Package | Purpose |
|---|---|
| react, react-dom | Core framework |
| react-router-dom | Routing |
| axios | HTTP client |
| tailwindcss | Styling |
| lucide-react | Icons |

**Version Locking:** Pin exact versions in `requirements.txt` (`==`) and use `package-lock.json` / lockfile for npm — do not allow floating versions for a hackathon build, to avoid last-minute breakage.

## 4. Error Handling

- **Backend:** Every route must wrap external calls (DB, OpenAI API) in try/except blocks. Return structured error responses:
  ```json
  { "success": false, "error": "Human-readable message" }
  ```
- **User-Facing Messages:** Never expose raw stack traces or internal error details to the frontend. Use simple messages like *"Scheme nahi mili, dobara try karein"*.
- **Graceful Fallback:** If the OpenAI API call fails or times out, the app must still return the calculated numbers (from `loan_calculator.py`) with a generic fallback explanation — the app should never fail completely just because the AI text generation failed.
- **Frontend:** All Axios calls must have `.catch()` handling with a user-friendly toast/message, and a loading state shown during the request.

## 5. Boundaries of AI

- The AI (OpenAI API) is **only** permitted to:
  - Generate natural-language explanations of already-calculated numbers.
  - Generate a simple business plan narrative from structured inputs.
- The AI is **not** permitted to:
  - Perform or override any financial calculation.
  - Decide which scheme a user is eligible for (this is rule-based, from the database).
  - Access or modify the database directly.
  - Be given real user financial/PII data (demo data only, per PRD constraints).
- Every AI-generated response must be clearly treated as an **explanation**, not as financial advice with legal weight — a disclaimer should be shown in the UI (e.g., "This is an AI-generated guide, please verify with your bank/CSC before applying.").

## 6. General Rules

- **Code Style & Formatting:** Use Prettier for frontend, Black + isort for backend Python. Set up basic linter configs (ESLint for React, flake8/ruff for Python).
- **Naming Conventions:** `camelCase` for JS variables/functions, `PascalCase` for React components, `snake_case` for Python variables/functions and file names.
- **Commit Message Guidelines:** Follow Conventional Commits (e.g., `feat: add loan calculator service`, `fix: correct EMI formula`).
- **Security & Data Privacy:** Sanitize all user inputs; never log API keys; use HTTPS in production; keep OpenAI API key server-side only (never expose it to the frontend).
- **Performance & Scalability:** Use async DB queries and async OpenAI calls where possible to avoid blocking the event loop.
- **Documentation Standards:** Every service function must have a docstring explaining input, output, and purpose.
- **Testing Rules:** At minimum, unit test `loan_calculator.py` (pure functions, easy to test) and `scheme_matcher.py` logic — these are the most critical and error-prone parts of the app.
- **Project-Specific Rule:** Any change to scheme interest rates, tier limits, or margin percentages must be made in the database seed data, never in code logic.
