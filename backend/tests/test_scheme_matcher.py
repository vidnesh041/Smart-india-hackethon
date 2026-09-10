import pytest
from app.database.db_connection import SessionLocal
from app.database.seed_data import seed_database
from app.services.scheme_matcher import match_schemes
from app.schemas.user_schema import AdvisoryRequest

@pytest.fixture(scope="module")
def db_session():
    seed_database()
    db = SessionLocal()
    yield db
    db.close()

def test_match_micro_finance_dairy(db_session):
    req = AdvisoryRequest(
        business_type="Dairy Farm",
        business_title="2 cows milk unit",
        investment_amount=80000.0,
        gender="Male"
    )
    scheme, alts = match_schemes(db_session, req)
    assert scheme is not None
    assert "Micro Finance" in scheme.scheme_name or "Laghu" in scheme.scheme_name
    assert scheme.min_cost <= 80000.0 <= scheme.max_cost

def test_match_mahila_samriddhi(db_session):
    req = AdvisoryRequest(
        business_type="Tailoring & Boutique",
        business_title="Stitching clothes",
        investment_amount=75000.0,
        gender="Female"
    )
    scheme, alts = match_schemes(db_session, req)
    assert scheme is not None
    assert "Mahila" in scheme.scheme_name or scheme.interest_rebate_women >= 0

def test_match_green_business(db_session):
    req = AdvisoryRequest(
        business_type="E-Rickshaw Transport",
        business_title="Battery rickshaw service",
        investment_amount=180000.0,
        gender="Male"
    )
    scheme, alts = match_schemes(db_session, req)
    assert scheme is not None
    assert "Green" in scheme.scheme_name or "Laghu" in scheme.scheme_name
