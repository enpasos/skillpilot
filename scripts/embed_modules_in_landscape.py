#!/usr/bin/env python3
"""
Embeds module goals into landscape files for navigation to work properly.
The UI needs all goals in one file to navigate between them.
"""
import json
from pathlib import Path

def embed_modules_in_landscape(landscape_path: Path, json_dir: Path):
    """Embed all module goals into the landscape file."""
    
    # Load landscape
    with open(landscape_path, 'r', encoding='utf-8') as f:
        landscape = json.load(f)
    
    # Collect all goals from module files
    embedded_count = 0
    existing_ids = {g['id'] for g in landscape.get('goals', [])}
    
    for file_path in sorted(json_dir.glob("DE_BAY_U_TUM_*.de.json")):
        # Skip landscape file itself
        if file_path.name == landscape_path.name:
            continue
        if any(x in file_path.name for x in ["BSC_", "MSC_", "PHYSIK", "INFORMATIK", "QST", "TMP_MASTER"]):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                module_data = json.load(f)
            
            for goal in module_data.get('goals', []):
                if goal['id'] not in existing_ids:
                    landscape['goals'].append(goal)
                    existing_ids.add(goal['id'])
                    embedded_count += 1
                    
        except Exception as e:
            print(f"[ERROR] {file_path.name}: {e}")
    
    # Save updated landscape
    with open(landscape_path, 'w', encoding='utf-8') as f:
        json.dump(landscape, f, indent=4, ensure_ascii=False)
    
    print(f"Embedded {embedded_count} goals into {landscape_path.name}")
    print(f"Total goals in landscape: {len(landscape['goals'])}")
    return embedded_count

if __name__ == "__main__":
    curricula = [
        ("curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_MSC_QST.de.json",
         "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json"),
        ("curricula/DE/BY/TUM/Physics/BSc_Physics/json/DE_BAY_U_TUM_BSC_PHYSIK.de.json",
         "curricula/DE/BY/TUM/Physics/BSc_Physics/json"),
        ("curricula/DE/BY/TUM/Informatics/BSc_Informatics/json/DE_BAY_U_TUM_BSC_INFORMATIK.de.json",
         "curricula/DE/BY/TUM/Informatics/BSc_Informatics/json"),
        ("curricula/DE/BY/TUM/Physics/MSc_TMP/json/DE_BAY_U_TUM_TMP_MASTER.de.json",
         "curricula/DE/BY/TUM/Physics/MSc_TMP/json"),
    ]
    
    for landscape_path, json_dir in curricula:
        print(f"\n=== Processing {Path(landscape_path).name} ===")
        embed_modules_in_landscape(Path(landscape_path), Path(json_dir))
