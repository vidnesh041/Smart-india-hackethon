import os
import sys
import re
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from dotenv import load_dotenv
load_dotenv(BASE_DIR / ".env")

from huggingface_hub import hf_hub_download
from app.database.db_connection import engine, SessionLocal, Base
from app.models.scheme_model import Scheme, VerificationLog, SchemeReport

def extract_financial_limits(text: str, default_min=10000.0, default_max=1000000.0):
    """
    Extracts numerical cost limits from scheme description or benefits text if mentioned.
    """
    if not text or not isinstance(text, str):
        return default_min, default_max
    
    # Check for Lakhs (e.g. 5 lakh, 10 Lakhs, 50,00,000)
    lakh_matches = re.findall(r'(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)', text, re.IGNORECASE)
    if lakh_matches:
        vals = [float(m) * 100000.0 for m in lakh_matches]
        min_c = min(vals) if min(vals) >= 10000 else default_min
        max_c = max(vals) if max(vals) >= 50000 else default_max
        return min_c, max_c
        
    # Check for direct INR figures (e.g. Rs. 50,000 or ₹1,00,000)
    inr_matches = re.findall(r'(?:rs\.?|inr|₹)\s*([\d,]+)', text, re.IGNORECASE)
    if inr_matches:
        nums = []
        for m in inr_matches:
            clean_num = m.replace(',', '')
            if clean_num.isdigit():
                val = float(clean_num)
                if 10000 <= val <= 100000000:
                    nums.append(val)
        if nums:
            min_c = min(nums)
            max_c = max(nums)
            if min_c == max_c:
                min_c = max(10000.0, min_c * 0.1)
            return min_c, max_c

    return default_min, default_max

def ensure_schema_columns():
    """Runs ALTER TABLE to expand columns and add any new columns to existing PostgreSQL tables."""
    from sqlalchemy import text
    with engine.connect() as conn:
        cols = [
            "ALTER TABLE schemes ALTER COLUMN scheme_name TYPE TEXT;",
            "ALTER TABLE schemes ALTER COLUMN scheme_name_hi TYPE TEXT;",
            "ALTER TABLE schemes ALTER COLUMN category TYPE TEXT;",
            "ALTER TABLE schemes ALTER COLUMN agency TYPE TEXT;",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS slug VARCHAR(255);",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS ministry TEXT;",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS department TEXT;",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Central / All India';",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS benefits TEXT;",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS apply_url TEXT;",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS official_source_url TEXT;",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'bulk_imported';",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP;",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS verification_notes TEXT;",
            "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();"
        ]
        for col_sql in cols:
            try:
                conn.execute(text(col_sql))
                conn.commit()
            except Exception as e:
                pass

def import_real_schemes():
    print("Step 1: Creating/updating database tables in Supabase...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_columns()
    db = SessionLocal()
    
    try:
        hf_token = os.getenv("HF_TOKEN")
        print("Step 2: Downloading authentic Indian Government Schemes dataset from Hugging Face...")
        csv_path = hf_hub_download(
            repo_id="smartduketech/indian-government-schemes-2025",
            filename="Schemes.csv",
            repo_type="dataset",
            token=hf_token
        )
        print(f"Downloaded dataset to: {csv_path}")
        
        df = pd.read_csv(csv_path)
        print(f"Total schemes in raw dataset: {len(df)}")
        
        # Filter for business, credit, entrepreneurship, agriculture, artisans, msme, self-employment
        keywords = [
            'business', 'entrepreneur', 'agriculture', 'rural', 'credit', 'loan', 
            'banking', 'skill', 'msme', 'dairy', 'artisan', 'finance', 'women',
            'subsidy', 'self-employment', 'handloom', 'khadi', 'poultry', 'fisheries'
        ]
        pattern = '|'.join(keywords)
        
        cat_match = df['category'].fillna('').str.lower().str.contains(pattern)
        name_match = df['name'].fillna('').str.lower().str.contains(pattern)
        desc_match = df['description'].fillna('').str.lower().str.contains('loan|credit|subsidy|grant|margin|finance|business|micro|enterprise|self-employed')
        
        filtered_df = df[cat_match | name_match | desc_match].copy()
        print(f"Filtered relevant business/credit schemes: {len(filtered_df)}")
        
        # Deduplicate by slug / name
        filtered_df.drop_duplicates(subset=['name'], inplace=True)
        print(f"Unique schemes to import: {len(filtered_df)}")
        
        # Check existing schemes in DB
        existing_slugs = set(s[0] for s in db.query(Scheme.slug).all() if s[0])
        existing_names = set(s[0] for s in db.query(Scheme.scheme_name).all())
        
        imported_count = 0
        
        for _, row in filtered_df.iterrows():
            name = str(row['name']).strip() if pd.notna(row['name']) else "Government Scheme"
            slug = str(row['slug']).strip() if pd.notna(row['slug']) else None
            
            if slug and slug in existing_slugs:
                continue
            if name in existing_names:
                continue
                
            desc = str(row['description']).strip() if pd.notna(row['description']) else "Government scheme for rural and micro entrepreneurs."
            benefits = str(row['benefits']).strip() if pd.notna(row['benefits']) else ""
            eligibility = str(row['eligibility_text']).strip() if pd.notna(row['eligibility_text']) else "Please check official guidelines for detailed eligibility."
            docs = str(row['documents_required']).strip() if pd.notna(row['documents_required']) else "Aadhaar Card, Bank Passbook, Identity Proof, Address Proof"
            
            category = str(row['category']).strip() if pd.notna(row['category']) else "Business & Entrepreneurship"
            ministry = str(row['ministry']).strip() if pd.notna(row['ministry']) else "Government of India"
            dept = str(row['department']).strip() if pd.notna(row['department']) else None
            state = str(row['state']).strip() if pd.notna(row['state']) else "Central / All India"
            
            official_url = str(row['official_url']).strip() if pd.notna(row['official_url']) else f"https://www.myscheme.gov.in/schemes/{slug}" if slug else "https://www.myscheme.gov.in"
            apply_url = str(row['apply_url']).strip() if pd.notna(row['apply_url']) else official_url
            
            # Determine financial structuring
            combined_text = f"{desc} {benefits}"
            min_c, max_c = extract_financial_limits(combined_text)
            
            # Interest rate determination
            interest_rate = 5.0 # Concessional default
            if 'interest' in combined_text.lower():
                int_matches = re.findall(r'(\d+(?:\.\d+)?)\s*%\s*(?:interest|p\.?a\.?|per annum)?', combined_text, re.IGNORECASE)
                if int_matches:
                    for im in int_matches:
                        val = float(im)
                        if 1.0 <= val <= 18.0:
                            interest_rate = val
                            break
                            
            # Margin money default (typically 5% to 15%)
            margin_percent = 10.0
            if max_c <= 150000:
                margin_percent = 5.0
            elif max_c >= 2500000:
                margin_percent = 15.0
                
            govt_loan_percent = 100.0 - margin_percent
            
            # Tenure
            repayment_years = 5
            if max_c <= 100000:
                repayment_years = 3
            elif max_c >= 2000000:
                repayment_years = 7
                
            moratorium_months = 6 if repayment_years >= 5 else 3
            
            # Women rebate
            interest_rebate_women = 1.0 if 'women' in (category + desc + name).lower() or str(row.get('eligibility_gender', '')).lower() == 'female' else 1.0

            scheme = Scheme(
                slug=slug,
                scheme_name=name,
                scheme_name_hi=name, # Bilingual representation
                agency=ministry if ministry else "Government of India",
                ministry=ministry,
                department=dept,
                state=state,
                category=category,
                min_cost=float(min_c),
                max_cost=float(max_c),
                margin_percent=float(margin_percent),
                govt_loan_percent=float(govt_loan_percent),
                interest_rate=float(interest_rate),
                interest_rebate_women=float(interest_rebate_women),
                repayment_years=int(repayment_years),
                moratorium_months=int(moratorium_months),
                description=desc[:5000],
                description_hi=desc[:5000],
                benefits=benefits[:5000] if benefits else None,
                eligibility=eligibility[:5000],
                eligibility_hi=eligibility[:5000],
                documents_required=docs[:2000],
                apply_url=apply_url,
                official_source_url=official_url,
                verification_status="bulk_imported",
                is_active=True
            )
            db.add(scheme)
            imported_count += 1
            
            # Batch commit every 100 records
            if imported_count % 100 == 0:
                db.commit()
                print(f"Imported {imported_count} schemes...", flush=True)

        db.commit()
        total_in_db = db.query(Scheme).count()
        print(f"\nSUCCESS: Imported {imported_count} new real schemes. Total schemes in Supabase: {total_in_db}", flush=True)

    except Exception as e:
        db.rollback()
        print(f"Error during scheme import: {repr(e)}", flush=True)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    import_real_schemes()
