"""
Pydantic schemas for Module 1 & Module 2 API endpoints (PS 26091).
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Module 2: Financial Plan Request & Response
class FinancialPlanRequest(BaseModel):
    available_margin_capital: float = Field(..., gt=0, description="Available margin capital in INR (10% of total project cost)")
    location: Optional[str] = Field("", description="Village / Block / District name")
    business_category: Optional[str] = Field("", description="Category of proposed business (e.g. Dairy, Retail, Textiles)")

class RepaymentScheduleEntry(BaseModel):
    quarter: int
    amount_due: float
    principal_payment: float
    interest_payment: float
    remaining_balance: float
    is_moratorium: bool
    note: str

class FinancialPlanResponse(BaseModel):
    out_of_scope: bool
    margin_capital: float
    project_cost: float
    loan_amount: float
    scheme_selected: Optional[str] = None
    scheme_selected_hi: Optional[str] = None
    interest_rate: Optional[float] = None
    tenure_years: Optional[int] = None
    moratorium_months: Optional[int] = None
    repayment_schedule: List[RepaymentScheduleEntry] = []
    estimated_working_capital_during_moratorium: Optional[float] = None
    message: str

# Module 1: Feasibility Report Request & Response
class FeasibilityReportRequest(BaseModel):
    location: str = Field(..., description="Geographic location (Village / Block / District)")
    business_category: str = Field(..., description="Proposed business category")
    project_cost: float = Field(..., gt=0, description="Total project cost in INR (calculated from Module 2)")

class SWOTGrid(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class CompetitorMappingInfo(BaseModel):
    estimated_count: int
    data_source: str
    summary: str

class FeasibilityReportResponse(BaseModel):
    market_reach: str
    opportunity_analysis: str
    swot: SWOTGrid
    threats_identification: List[str]
    competitor_mapping: CompetitorMappingInfo
    product_market_value: str
    disclaimer: str = "This feasibility analysis is AI-generated guidance based on available local data. Please validate with a local market visit before finalizing your plan."
