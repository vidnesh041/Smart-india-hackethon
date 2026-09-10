"""
Scheme Matcher Service
Deterministic rule-based government credit scheme matching from the database.
"""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.scheme_model import Scheme
from app.schemas.user_schema import AdvisoryRequest

def match_schemes(db: Session, request: AdvisoryRequest) -> Tuple[Optional[Scheme], List[Scheme]]:
    """
    Matches the user's business profile and investment requirement against active schemes.
    Returns: (best_matched_scheme, alternate_qualifying_schemes)
    """
    cost = request.investment_amount
    business_type_lower = (request.business_type or "").lower()
    business_title_lower = (request.business_title or "").lower()
    combined_desc = f"{business_type_lower} {business_title_lower}"
    is_female = (request.gender or "").lower() == "female"

    # Fetch all active schemes
    all_schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
    if not all_schemes:
        return None, []

    # Priority 1: Exact Cost Range Matches
    qualifying_schemes = [
        s for s in all_schemes 
        if s.min_cost <= cost <= s.max_cost
    ]

    # If no exact match within bounds, find the closest tier
    if not qualifying_schemes:
        # Sort by distance from investment amount
        all_schemes_sorted = sorted(
            all_schemes,
            key=lambda s: min(abs(cost - s.min_cost), abs(cost - s.max_cost))
        )
        qualifying_schemes = all_schemes_sorted[:2]

    # Scoring / Ranking logic for qualifying schemes
    def score_scheme(scheme: Scheme) -> int:
        score = 0
        scheme_name_lower = scheme.scheme_name.lower()
        scheme_cat_lower = scheme.category.lower()

        # Women exclusivity and priority
        is_women_only_scheme = "mahila" in scheme_name_lower or "women" in scheme_cat_lower
        if is_female:
            if is_women_only_scheme:
                score += 80
            elif scheme.interest_rebate_women > 0:
                score += 20
        else:
            if is_women_only_scheme:
                score -= 100  # Do not prioritize women-only schemes for male applicants


        # Green / Eco-friendly priority
        green_keywords = ["solar", "bio-gas", "rickshaw", "green", "clean", "organic"]
        if any(kw in combined_desc for kw in green_keywords):
            if "green" in scheme_name_lower or "solar" in scheme_cat_lower:
                score += 45

        # Category keyword match
        if any(w in scheme_cat_lower for w in ["dairy", "cattle", "milk", "buffalo", "cow"]) and any(w in combined_desc for w in ["dairy", "milk", "doodh", "cow", "buffalo", "cattle"]):
            score += 30
        elif any(w in scheme_cat_lower for w in ["retail", "shop", "grocery", "kirana"]) and any(w in combined_desc for w in ["shop", "kirana", "retail", "grocery", "dukaan"]):
            score += 30
        elif any(w in scheme_cat_lower for w in ["tailor", "garment", "sewing"]) and any(w in combined_desc for w in ["tailor", "sewing", "kapda", "silai", "boutique"]):
            score += 30
        elif any(w in scheme_cat_lower for w in ["transport", "vehicle", "auto"]) and any(w in combined_desc for w in ["transport", "auto", "vehicle", "rickshaw"]):
            score += 30

        # Lowest interest rate gives higher score
        score += int((10.0 - scheme.interest_rate) * 5)

        return score

    ranked_schemes = sorted(qualifying_schemes, key=score_scheme, reverse=True)
    best_scheme = ranked_schemes[0]
    alternate_schemes = [s for s in ranked_schemes[1:] if s.id != best_scheme.id]

    return best_scheme, alternate_schemes
