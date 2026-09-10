from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db_connection import get_db
from app.models.user_model import AdvisorySubmission
from app.schemas.user_schema import AdvisoryRequest, AdvisoryResponse, SchemeResponse, LoanStructure
from app.services.scheme_matcher import match_schemes
from app.services.loan_calculator import structure_loan
from app.services.ai_advisory import compute_business_viability, generate_advisory_narrative

router = APIRouter(prefix="/advisory", tags=["Advisory & Financial Structuring"])

@router.post("", response_model=AdvisoryResponse)
def generate_advisory(request: AdvisoryRequest, db: Session = Depends(get_db)):
    """
    Main advisory endpoint:
    1. Validates user business & investment inputs
    2. Matches the best government scheme from the database
    3. Computes deterministic loan structuring (margin, loan, EMI, interest)
    4. Computes business viability metrics
    5. Generates bilingual natural-language guidance
    6. Persists query log in database
    """
    try:
        # Step 1: Rule-based matching from DB
        matched_scheme, alternate_schemes = match_schemes(db, request)
        if not matched_scheme:
            raise HTTPException(
                status_code=404,
                detail="No matching government scheme found for the specified investment amount."
            )

        # Step 2: Deterministic Financial Calculation
        is_female = (request.gender or "").lower() == "female"
        loan_data = structure_loan(
            total_cost=request.investment_amount,
            margin_percent=matched_scheme.margin_percent,
            interest_rate=matched_scheme.interest_rate,
            tenure_years=matched_scheme.repayment_years,
            moratorium_months=matched_scheme.moratorium_months,
            is_women=is_female,
            interest_rebate_women=matched_scheme.interest_rebate_women
        )
        loan_structure = LoanStructure(**loan_data)

        # Step 3: Viability Assessment
        viability = compute_business_viability(
            investment_amount=request.investment_amount,
            business_type=request.business_type,
            monthly_emi=loan_structure.monthly_emi,
            experience_level=request.experience_level or "1-3 years"
        )

        # Format scheme responses
        scheme_response = SchemeResponse(
            id=matched_scheme.id,
            scheme_name=matched_scheme.scheme_name,
            scheme_name_hi=matched_scheme.scheme_name_hi,
            agency=matched_scheme.agency,
            category=matched_scheme.category,
            min_cost=matched_scheme.min_cost,
            max_cost=matched_scheme.max_cost,
            margin_percent=matched_scheme.margin_percent,
            govt_loan_percent=matched_scheme.govt_loan_percent,
            interest_rate=matched_scheme.interest_rate,
            interest_rebate_women=matched_scheme.interest_rebate_women,
            repayment_years=matched_scheme.repayment_years,
            moratorium_months=matched_scheme.moratorium_months,
            description=matched_scheme.description,
            description_hi=matched_scheme.description_hi,
            eligibility=matched_scheme.eligibility,
            eligibility_hi=matched_scheme.eligibility_hi,
            documents_required=matched_scheme.documents_required
        )

        alt_scheme_responses = [
            SchemeResponse(
                id=s.id,
                scheme_name=s.scheme_name,
                scheme_name_hi=s.scheme_name_hi,
                agency=s.agency,
                category=s.category,
                min_cost=s.min_cost,
                max_cost=s.max_cost,
                margin_percent=s.margin_percent,
                govt_loan_percent=s.govt_loan_percent,
                interest_rate=s.interest_rate,
                interest_rebate_women=s.interest_rebate_women,
                repayment_years=s.repayment_years,
                moratorium_months=s.moratorium_months,
                description=s.description,
                description_hi=s.description_hi,
                eligibility=s.eligibility,
                eligibility_hi=s.eligibility_hi,
                documents_required=s.documents_required
            ) for s in alternate_schemes
        ]

        # Step 4: Generate Narrative
        narrative = generate_advisory_narrative(
            request=request,
            scheme=scheme_response,
            loan=loan_structure,
            viability=viability
        )

        # Step 5: Save log
        submission = AdvisorySubmission(
            business_type=request.business_type,
            business_title=request.business_title,
            investment_amount=request.investment_amount,
            state=request.state,
            district=request.district,
            experience_level=request.experience_level,
            gender=request.gender,
            matched_scheme_id=matched_scheme.id,
            margin_money=loan_structure.margin_money,
            loan_amount=loan_structure.loan_amount,
            interest_rate=loan_structure.effective_interest_rate,
            monthly_emi=loan_structure.monthly_emi,
            ai_advisory_text=narrative["ai_advisory_text"],
            business_viability_summary=viability.viability_note
        )
        db.add(submission)
        db.commit()

        # Step 6: Return structured response
        return AdvisoryResponse(
            success=True,
            matched_scheme=scheme_response,
            alternate_schemes=alt_scheme_responses,
            loan_structure=loan_structure,
            business_viability=viability,
            ai_advisory_text=narrative["ai_advisory_text"],
            ai_advisory_text_hi=narrative["ai_advisory_text_hi"],
            business_action_plan=narrative["business_action_plan"],
            business_action_plan_hi=narrative["business_action_plan_hi"],
            application_steps=narrative["application_steps"],
            application_steps_hi=narrative["application_steps_hi"],
            disclaimer="This is an AI-assisted financial advisory calculation. Please verify all final terms with your nearest District State Channelizing Agency (SCA), DIC, or bank branch before applying."
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Unable to process advisory request at this time: {str(e)}"
        )
