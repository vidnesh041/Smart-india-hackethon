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

def test_match_micro_finance_scheme(db_session):
    req = AdvisoryRequest(
        business_type="Dairy Farm",
        business_title="2 cows milk unit",
        investment_amount=80000.0,
        gender="Male"
    )
    scheme, alts = match_schemes(db_session, req)
    assert scheme is not None
    assert scheme.min_cost <= 80000.0 <= scheme.max_cost
    assert len(alts) >= 0

def test_match_term_loan_scheme(db_session):
    req = AdvisoryRequest(
        business_type="Agro Processing",
        business_title="Flour Mill Unit",
        investment_amount=1000000.0,
        gender="Male"
    )
    scheme, alts = match_schemes(db_session, req)
    assert scheme is not None
    assert scheme.min_cost <= 1000000.0 <= scheme.max_cost
    assert len(alts) >= 0
