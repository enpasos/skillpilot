#!/usr/bin/env python3
"""
Fixes broken references in landscape files by removing IDs that don't exist.
"""
import json
import sys
from pathlib import Path

def fix_landscape(landscape_path: Path, json_dir: Path):
    """Remove contains references that don't exist in any JSON file."""
    
    # Collect all valid goal IDs from module files
    valid_ids = set()
    for file_path in json_dir.glob("DE_BAY_U_TUM_*.de.json"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for goal in data.get('goals', []):
                valid_ids.add(goal.get('id'))
        except Exception as e:
            print(f"[ERROR] Reading {file_path.name}: {e}")
    
    print(f"Found {len(valid_ids)} valid goal IDs in {json_dir}")
    
    # Load landscape
    with open(landscape_path, 'r', encoding='utf-8') as f:
        landscape = json.load(f)
    
    # Also add IDs from the landscape itself
    for goal in landscape.get('goals', []):
        valid_ids.add(goal.get('id'))
    
    # Fix broken references
    fixed_count = 0
    for goal in landscape.get('goals', []):
        original_contains = goal.get('contains', [])
        fixed_contains = [id for id in original_contains if id in valid_ids]
        
        if len(fixed_contains) != len(original_contains):
            removed = set(original_contains) - set(fixed_contains)
            print(f"[FIX] {goal.get('shortKey', goal.get('id')[:8])}: Removed {len(removed)} broken refs")
            for rid in removed:
                print(f"      - {rid}")
            goal['contains'] = fixed_contains
            fixed_count += len(removed)
    
    if fixed_count > 0:
        with open(landscape_path, 'w', encoding='utf-8') as f:
            json.dump(landscape, f, indent=4, ensure_ascii=False)
        print(f"\nFixed {fixed_count} broken references in {landscape_path.name}")
    else:
        print(f"\nNo broken references found in {landscape_path.name}")

if __name__ == "__main__":
    # Fix BSC_INFORMATIK
    fix_landscape(
        Path("curricula/DE/BY/TUM/Informatics/BSc_Informatics/json/DE_BAY_U_TUM_BSC_INFORMATIK.de.json"),
        Path("curricula/DE/BY/TUM/Informatics/BSc_Informatics/json")
    )
    
    print("\n" + "="*60 + "\n")
    
    # Fix TMP_MASTER
    fix_landscape(
        Path("curricula/DE/BY/TUM/Physics/MSc_TMP/json/DE_BAY_U_TUM_TMP_MASTER.de.json"),
        Path("curricula/DE/BY/TUM/Physics/MSc_TMP/json")
    )
