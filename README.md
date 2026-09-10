# AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant
### Smart India Hackathon 2026 — Problem Statement ID: 26091

An AI-powered personal financial advisor and loan structuring assistant designed for rural micro-entrepreneurs. The platform bridges the digital and financial literacy gap by providing voice-enabled inputs, deterministic government scheme matching, exact financial loan calculations, and plain-language AI advisory explanations.

---

## 🌟 Key Features

- 🎙️ **Voice-Enabled Input**: Built-in speech-to-text using Web Speech API supporting regional languages for low-literacy users.
- 🎯 **Scheme Matching Engine**: Rule-based matching system that pairs user profiles (business type, location, investment, experience) with relevant government concessional loan schemes (e.g., NSFDC, Micro Finance Schemes).
- 🧮 **Deterministic Loan Calculator**: Python-powered accurate calculations for margin money, total loan amount, interest rates, and monthly EMI (no AI hallucinations on numbers).
- 🤖 **AI Advisory Explanation**: Generates simple, personalized, human-readable explanations of loan terms and business advisories.
- 📊 **Business Plan Summary**: Provides projected expense and income estimates tailored to the selected business type.
- 🗺️ **District Directory**: Location-aware assistance for finding relevant district authorities and agencies.

---

## 🏗️ Project Architecture

```
smart-india-hackethon/
├── backend/
│   ├── app/
│   │   ├── database/       # DB connection, seed data & scheme models
│   │   ├── models/         # SQLAlchemy models (Scheme, User)
│   │   ├── routes/         # FastAPI API endpoints (advisory, schemes)
│   │   ├── schemas/        # Pydantic data validation schemas
│   │   └── services/       # Scheme matching engine, Loan calculator & AI advisor
│   ├── scripts/            # Dataset exploration & scheme import scripts
│   ├── tests/              # Pytest backend tests
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
├── frontend/
│   ├── public/             # Static assets & SVG icons
│   ├── src/
│   │   ├── assets/         # App images & icons
│   │   ├── components/     # UI components (Navbar, Footer, ResultCard, MicButton, etc.)
│   │   ├── context/        # Multi-language Context API
│   │   ├── pages/          # Home, FormPage, SchemesPage, CalculatorPage
│   │   ├── services/       # API integration client
│   │   └── utils/          # Web Speech API helpers
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.js      # Vite configuration
├── docs/                   # PRD, Architecture, Rules, and UI/UX design documents
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python**: 3.9+
- **Node.js**: 18+ & npm

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in your API key:
   ```bash
   cp .env.example .env
   ```

5. **Run the Backend Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will be running at `http://localhost:8000`. API docs are available at `http://localhost:8000/docs`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install node packages:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.

---

## 🧪 Running Tests

### Backend Tests

Run unit tests for loan calculation and scheme matching using pytest:
```bash
cd backend
pytest
```

---

## 📜 Documentation

- [PRD (Product Requirement Document)](docs/PRD.md)
- [Architecture Document](docs/architecture.md)
- [UI/UX Specifications](docs/ui-ux.md)
- [Phases & Roadmap](docs/phases.doc.md)

---

## 🤝 Contributor Guidelines

Please refer to [`docs/rules.md`](docs/rules.md) for code styling and development guidelines.
