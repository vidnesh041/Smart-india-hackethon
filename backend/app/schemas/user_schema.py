from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AdvisoryRequest(BaseModel):
    business_type: str = Field(..., description="Type of business (e.g. Dairy, Grocery/Kirana, Tailoring, Poultry, Solar/E-Rickshaw)")
    business_title: Optional[str] = Field(None, description="Specific business idea or title")
    investment_amount: float = Field(..., gt=0, description="Total project cost or investment needed in INR")
    gender: Optional[str] = Field("General", description="Gender of entrepreneur (Male, Female, Other)")
    state: Optional[str] = Field(None, description="State of the entrepreneur")
    district: Optional[str] = Field(None, description="District / Village location")
    experience_level: Optional[str] = Field("1-3 years", description="Experience level: New / 1-3 years / 3+ years")
    preferred_language: Optional[str] = Field("hi", description="Preferred response language: hi or en")

class SchemeResponse(BaseModel):
    id: int
    slug: Optional[str] = None
    scheme_name: str
    scheme_name_hi: Optional[str] = None
    agency: Optional[str] = "Government of India"
    ministry: Optional[str] = None
    department: Optional[str] = None
    state: Optional[str] = "Central / All India"
    category: Optional[str] = "General"
    min_cost: Optional[float] = 10000.0
    max_cost: Optional[float] = 1000000.0
    margin_percent: Optional[float] = 10.0
    govt_loan_percent: Optional[float] = 90.0
    interest_rate: Optional[float] = 5.0
    interest_rebate_women: Optional[float] = 0.0
    repayment_years: Optional[int] = 5
    moratorium_months: Optional[int] = 6
    description: Optional[str] = ""
    description_hi: Optional[str] = None
    benefits: Optional[str] = None
    eligibility: Optional[str] = ""
    eligibility_hi: Optional[str] = None
    documents_required: Optional[str] = None
    apply_url: Optional[str] = None
    official_source_url: Optional[str] = None
    verification_status: Optional[str] = "bulk_imported"
    is_active: Optional[bool] = True

    class Config:
        from_attributes = True

class SchemesPageResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    schemes: List[SchemeResponse]

    class Config:
        from_attributes = True

class LoanStructure(BaseModel):
    total_project_cost: float
    margin_percent: float
    margin_money: float
    loan_percent: float
    loan_amount: float
    nominal_interest_rate: float
    effective_interest_rate: float
    interest_rebate_applied: float
    tenure_years: int
    moratorium_months: int
    monthly_emi: float
    total_interest: float
    total_repayment: float

class BusinessViability(BaseModel):
    estimated_monthly_revenue: float
    estimated_monthly_expense: float
    monthly_loan_emi: float
    estimated_net_monthly_profit: float
    is_viable: bool
    viability_score: int # 1 to 100
    viability_note: str
    viability_note_hi: str

class AdvisoryResponse(BaseModel):
    success: bool
    matched_scheme: SchemeResponse
    alternate_schemes: List[SchemeResponse] = []
    loan_structure: LoanStructure
    business_viability: BusinessViability
    ai_advisory_text: str
    ai_advisory_text_hi: str
    business_action_plan: List[str]
    business_action_plan_hi: List[str]
    application_steps: List[str]
    application_steps_hi: List[str]
    disclaimer: str

class SchemeReportCreate(BaseModel):
    scheme_id: int
    report_text: str
