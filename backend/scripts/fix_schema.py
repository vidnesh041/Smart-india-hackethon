import sys
sys.path.insert(0, '.')
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path('.') / '.env')

from app.database.db_connection import engine
from sqlalchemy import text

print("=== Current column types in 'schemes' table ===")
with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT column_name, data_type, character_maximum_length "
        "FROM information_schema.columns "
        "WHERE table_name='schemes' "
        "ORDER BY ordinal_position;"
    ))
    for row in result:
        print(row)

    print("\n=== Forcing all string columns to TEXT ===")
    stmts = [
        "ALTER TABLE schemes ALTER COLUMN scheme_name TYPE TEXT USING scheme_name::TEXT;",
        "ALTER TABLE schemes ALTER COLUMN scheme_name_hi TYPE TEXT USING scheme_name_hi::TEXT;",
        "ALTER TABLE schemes ALTER COLUMN category TYPE TEXT USING category::TEXT;",
        "ALTER TABLE schemes ALTER COLUMN agency TYPE TEXT USING agency::TEXT;",
        "ALTER TABLE schemes ALTER COLUMN apply_url TYPE TEXT USING apply_url::TEXT;",
        "ALTER TABLE schemes ALTER COLUMN official_source_url TYPE TEXT USING official_source_url::TEXT;",
    ]
    for s in stmts:
        try:
            conn.execute(text(s))
            conn.commit()
            print("OK:", s[:80])
        except Exception as e:
            print("Skip:", s[:60], "|", str(e)[:100])

print("\nDone.")
