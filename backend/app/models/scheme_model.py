from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON, func
from app.database.db_connection import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=True)
    scheme_name = Column(String(500), nullable=False)
    scheme_name_hi = Column(String(500), nullable=True)
    agency = Column(String(255), default="Government of India")
    ministry = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    state = Column(String(100), default="Central / All India")
    category = Column(String(255), default="Business & Entrepreneurship")
    
    # Financial terms (deterministic numbers)
    min_cost = Column(Float, default=10000.0)        # In INR
    max_cost = Column(Float, default=1000000.0)      # In INR
    max_loan_amount = Column(Float, nullable=True)   # Max Loan limit in INR (1.25L or 45L)
    margin_percent = Column(Float, default=10.0)    # Entrepreneur's share (10%)
    govt_loan_percent = Column(Float, default=90.0) # Concessional loan share (90%)
    interest_rate = Column(Float, default=5.0)       # % per annum
    interest_rebate_women = Column(Float, default=0.0) # Rebate for women
    repayment_years = Column(Integer, default=5)    # Tenure in years
    moratorium_months = Column(Integer, default=6)  # Moratorium months
    
    # Text details
    description = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    eligibility = Column(Text, nullable=False)
    eligibility_hi = Column(Text, nullable=True)
    documents_required = Column(Text, nullable=True)
    apply_url = Column(String(500), nullable=True)
    official_source_url = Column(String(500), nullable=True)
    
    # Verification & Trust (Feature B)
    verification_status = Column(String(30), default="bulk_imported") # 'bulk_imported', 'auto_verified', 'officially_verified', 'flagged'
    last_verified_at = Column(DateTime, nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=True)
    checked_at = Column(DateTime, default=func.now())
    ai_finding = Column(Text, nullable=True)
    match_status = Column(String(30), nullable=True) # 'matched', 'mismatch', 'unreachable'
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    reviewed_by_human = Column(Boolean, default=False)

class SchemeReport(Base):
    __tablename__ = "scheme_reports"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=True)
    report_text = Column(Text, nullable=False)
    reported_at = Column(DateTime, default=func.now())
    status = Column(String(20), default="pending") # 'pending', 'resolved', 'dismissed'
