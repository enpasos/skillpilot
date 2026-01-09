import json
import os
from pathlib import Path

def find_orphans():
    base_dir = Path("curricula/DE/BY/TUM/Physics/BSc_Physics/json")
    landscape_file = base_dir / "DE_BAY_U_TUM_BSC_PHYSIK.de.json"
    
    if not landscape_file.exists():
        print(f"Error: {landscape_file} not found.")
        return

    # 1. Collect all referenced UUIDs from the Landscape
    referenced_uuids = set()
    referenced_files = set() # To track which files correspond (heuristic)
    
    with open(landscape_file, 'r', encoding='utf-8') as f:
        landscape = json.load(f)
        
    def collect_uuids(node):
        if 'id' in node:
            referenced_uuids.add(node['id'])
        if 'contains' in node:
            for child_id in node['contains']:
                referenced_uuids.add(child_id)
                # Note: 'contains' lists UUIDs. We cannot know the filename from UUID alone easily 
                # UNLESS we read all files and map UUID -> Filename.
                
    # Collecting recursively is tricky if 'contains' just has IDs. 
    # Better approach: Read ALL JSON files, map UUID -> Filename. 
    # then see which UUIDs are in the Landscape's tree.
    
    uuid_to_file = {}
    file_to_uuid = {}
    
    print("Scanning all JSON files...")
    for file_path in base_dir.glob("*.json"):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                # Assuming top-level 'goals' list exists and first item is the main Module/Program goal
                if 'goals' in data and len(data['goals']) > 0:
                     root_id = data['goals'][0]['id']
                     uuid_to_file[root_id] = file_path.name
                     file_to_uuid[file_path.name] = root_id
            except Exception as e:
                print(f"Error reading {file_path.name}: {e}")

    # Now verify which of these root IDs are actually reachable from the Landscape Root
    landscape_root_id = landscape['goals'][0]['id']
    
    reachable_ids = set()
    stack = [landscape_root_id]
    
    # We need a global lookup for "contains" of all nodes to traverse the graph (files are separate nodes)
    # But wait, the Landscape file only contains the STRUCTURAL nodes (Program, Catalogs).
    # The LEAF nodes (Modules) are referenced by ID in the 'contains' of Catalog nodes.
    # So we need to collect ALL 'contains' IDs from all nodes defined INSIDE the landscape file.
    
    for goal in landscape['goals']:
        if 'contains' in goal:
            for child in goal['contains']:
                reachable_ids.add(child)
    
    # Identify Orphans
    orphans = []
    
    # exclude the landscape file itself
    landscape_filename = landscape_file.name
    
    for filename, root_id in file_to_uuid.items():
        if filename == landscape_filename:
            continue
            
        if root_id not in reachable_ids:
            orphans.append(filename)
            
    print(f"Found {len(orphans)} orphaned files:")
    for o in sorted(orphans):
        print(o)

if __name__ == "__main__":
    find_orphans()
