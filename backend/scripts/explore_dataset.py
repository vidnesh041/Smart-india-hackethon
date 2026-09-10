import os
from pathlib import Path
from dotenv import load_dotenv
from datasets import load_dataset

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

hf_token = os.getenv("HF_TOKEN")

print("Loading dataset shrijayan/gov_myscheme...")
try:
    ds = load_dataset("shrijayan/gov_myscheme", token=hf_token)
    print(f"Dataset splits: {ds}")
    
    # Check default split
    split_name = list(ds.keys())[0]
    data = ds[split_name]
    print(f"Total rows in {split_name}: {len(data)}")
    print(f"Column names: {data.column_names}")
    
    print("\n--- First 2 Records Sample ---")
    for i in range(min(2, len(data))):
        print(f"\nRecord {i+1}:")
        for k, v in data[i].items():
            val_str = str(v)
            if len(val_str) > 200:
                val_str = val_str[:200] + "..."
            print(f"  {k}: {val_str}")
            
except Exception as e:
    print(f"Error loading dataset: {e}")
