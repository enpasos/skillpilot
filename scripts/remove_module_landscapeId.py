#!/usr/bin/env python3
"""
Removes landscapeId from module JSON files (only landscape files should have it).
This prevents modules from appearing as standalone curricula in the UI.
"""
import json
from pathlib import Path

def remove_landscape_id_from_modules(json_dir: Path):
    """Remove landscapeId from module files, keep only in landscape files."""
    
    modified = 0
    
    for file_path in json_dir.glob("DE_BAY_U_TUM_*.de.json"):
        # Skip landscape files (they should keep landscapeId)
        if any(x in file_path.name for x in ["BSC_", "MSC_", "PHYSIK", "INFORMATIK", "QST", "TMP_MASTER"]):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'landscapeId' in data:
                del data['landscapeId']
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                modified += 1
                print(f"[OK] Removed landscapeId from {file_path.name}")
                
        except Exception as e:
            print(f"[ERROR] {file_path.name}: {e}")
    
    return modified

if __name__ == "__main__":
    curricula = [
        Path("curricula/DE/BY/TUM/Physics/BSc_Physics/json"),
        Path("curricula/DE/BY/TUM/Physics/MSc_TMP/json"),
        Path("curricula/DE/BY/TUM/Informatics/BSc_Informatics/json"),
        Path("curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json"),
    ]
    
    total = 0
    for json_dir in curricula:
        print(f"\n=== Processing {json_dir.parent.name} ===")
        total += remove_landscape_id_from_modules(json_dir)
    
    print(f"\n=== Total: Removed landscapeId from {total} module files ===")
