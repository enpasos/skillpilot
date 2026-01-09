#!/usr/bin/env python3
"""
Audit module granularity and delete files with < 20 nodes for regeneration.
Usage: python scripts/audit_granularity.py [path_to_json_dir]
"""
import json
import sys
from pathlib import Path

def audit_granularity(json_dir: Path, threshold: int = 20):
    deleted_count = 0
    
    print(f"Auditing modules in {json_dir} (Threshold: {threshold} nodes)")
    
    for file_path in json_dir.glob("DE_BAY_U_TUM_*.de.json"):
        # Skip landscape files
        if any(x in file_path.name for x in ["BSC_", "MSC_", "PHYSIK", "INFORMATIK", "QST"]):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            goals = data.get('goals', [])
            count = len(goals)
            
            if count < threshold:
                print(f"[DELETE] {file_path.name}: {count} nodes (Triggering regeneration)")
                file_path.unlink()
                deleted_count += 1
            else:
                print(f"[OK] {file_path.name}: {count} nodes")
                
        except Exception as e:
            print(f"[ERROR] Could not read {file_path.name}: {e}")

    print(f"Audit complete. Deleted {deleted_count} files for regeneration.")
    return deleted_count

if __name__ == "__main__":
    if len(sys.argv) > 1:
        json_dir = Path(sys.argv[1])
    else:
        json_dir = Path("curricula/DE/BY/TUM/Physics/BSc_Physics/json")
    
    audit_granularity(json_dir)
