#!/usr/bin/env python3
"""
Prunes orphaned nodes (unreachable from root) from the Hessen Mathematics curriculum.
"""
import json
from pathlib import Path
from hessen_upper_secondary_paths import resolve_hessen_upper_secondary_landscape_path

def main():
    json_path = resolve_hessen_upper_secondary_landscape_path("math")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    root_id = "ccf9569b-b0e4-4d76-98d5-65be461d4d76"
    
    # helper map
    id_to_goal = {g["id"]: g for g in data["goals"]}
    
    if root_id not in id_to_goal:
        print("Error: Root node not found!")
        return

    # BFS to find all reachable nodes
    reachable = set()
    queue = [root_id]
    reachable.add(root_id)
    
    while queue:
        current_id = queue.pop(0)
        current_goal = id_to_goal.get(current_id)
        
        if not current_goal:
            continue
            
        children = current_goal.get("contains", [])
        for child_id in children:
            if child_id not in reachable:
                reachable.add(child_id)
                queue.append(child_id)

    # Identify orphans
    all_ids = set(id_to_goal.keys())
    orphans = all_ids - reachable
    
    print(f"Total goals: {len(all_ids)}")
    print(f"Reachable goals: {len(reachable)}")
    print(f"Orphaned goals: {len(orphans)}")
    
    if orphans:
        print("Orphans found:")
        for orphan_id in orphans:
            goal = id_to_goal[orphan_id]
            print(f"- {goal.get('shortKey', 'no-key')}: {goal.get('title', 'No Title')} ({orphan_id})")
        
        # Prune
        data["goals"] = [g for g in data["goals"] if g["id"] in reachable]
        
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Pruned {len(orphans)} orphaned goals.")
    else:
        print("No orphaned goals found.")

if __name__ == "__main__":
    main()
