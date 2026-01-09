import json
import os
from pathlib import Path

def cleanup_orphans():
    base_dir = Path("curricula/DE/BY/TUM/Physics/BSc_Physics/json")
    landscape_file = base_dir / "DE_BAY_U_TUM_BSC_PHYSIK.de.json"
    
    if not landscape_file.exists():
        print(f"Error: {landscape_file} not found.")
        return

    # 1. Collect all referenced UUIDs from the Landscape
    # We must read files to map UUID -> Filename first
    uuid_to_file = {}
    file_to_uuid = {}
    
    for file_path in base_dir.glob("*.json"):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if 'goals' in data and len(data['goals']) > 0:
                     root_id = data['goals'][0]['id']
                     uuid_to_file[root_id] = file_path.name
                     file_to_uuid[file_path.name] = root_id
            except Exception:
                pass

    with open(landscape_file, 'r', encoding='utf-8') as f:
        landscape = json.load(f)
        
    reachable_ids = set()
    # Collect all 'contains' IDs from all nodes defined INSIDE the landscape file
    for goal in landscape['goals']:
        if 'contains' in goal:
            for child in goal['contains']:
                reachable_ids.add(child)
                
    # Also, we must recursively find children if the landscape references a Catalog file (which it does not, 
    # it references modules directly in this flattened world or references a catalog node which references modules).
    # Wait, in Physics JSON, the 'contains' IDs reference the MODULE root IDs directly? 
    # Yes, e.g. "bb31c6e3..." (Grundlagenphase) contains "f1307854..." (PH0001).
    
    # Identify Orphans
    landscape_filename = landscape_file.name
    count = 0
    
    for filename, root_id in file_to_uuid.items():
        if filename == landscape_filename:
            continue
            
        if root_id not in reachable_ids:
            print(f"Deleting orphan: {filename}")
            try:
                (base_dir / filename).unlink()
                count += 1
            except Exception as e:
                print(f"Failed to delete {filename}: {e}")
            
    print(f"Deleted {count} orphaned files.")

if __name__ == "__main__":
    cleanup_orphans()
