from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database.seed_data import seed_database
from app.routes.scheme_routes import router as scheme_router
from app.routes.advisory_routes import router as advisory_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is initialized and seeded on startup
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant for Rural Entrepreneurs (SIH 2026)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(scheme_router, prefix=settings.API_V1_PREFIX)
app.include_router(advisory_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_PREFIX
    }
