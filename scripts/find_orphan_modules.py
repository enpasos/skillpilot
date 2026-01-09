#!/usr/bin/env python3
"""
Finds modules that are not referenced in any landscape file's contains arrays.
"""
import json
from pathlib import Path
from collections import defaultdict

def find_orphan_modules(base_dir: Path):
    """Find module IDs not referenced by any landscape."""
    
    json_dir = base_dir / "json"
    if not json_dir.exists():
        print(f"Directory not found: {json_dir}")
        return
    
    # Collect all module IDs and landscape references
    module_ids = {}  # id -> file
    landscape_contains = set()  # all IDs in contains arrays
    landscape_file = None
    
    for file_path in json_dir.glob("DE_BAY_U_TUM_*.de.json"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check if it's a landscape file
            is_landscape = any(x in file_path.name for x in ["BSC_", "MSC_", "PHYSIK", "INFORMATIK", "QST", "TMP_MASTER"])
            
            for goal in data.get('goals', []):
                goal_id = goal.get('id')
                
                if is_landscape:
                    landscape_file = file_path.name
                    # Collect all contains references
                    for cid in goal.get('contains', []):
                        landscape_contains.add(cid)
                else:
                    # It's a module file - get root goal ID
                    if goal.get('shortKey', '').endswith('_module'):
                        module_ids[goal_id] = file_path.name
                        
        except Exception as e:
            print(f"[ERROR] {file_path.name}: {e}")
    
    # Find orphans
    orphan_ids = set(module_ids.keys()) - landscape_contains
    
    print(f"\n=== Orphan Module Report for {base_dir.name} ===")
    print(f"Total modules: {len(module_ids)}")
    print(f"Referenced in landscape: {len(landscape_contains)}")
    print(f"Orphans (not referenced): {len(orphan_ids)}")
    
    if orphan_ids:
        print("\nOrphan modules:")
        for oid in sorted(orphan_ids):
            print(f"  {module_ids[oid]} -> {oid}")
    
    return orphan_ids, module_ids

if __name__ == "__main__":
    curricula = [
        Path("curricula/DE/BY/TUM/Physics/BSc_Physics"),
        Path("curricula/DE/BY/TUM/Physics/MSc_TMP"),
        Path("curricula/DE/BY/TUM/Informatics/BSc_Informatics"),
        Path("curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST"),
    ]
    
    for curr in curricula:
        find_orphan_modules(curr)
        print()
