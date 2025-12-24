import json
import os
import copy
import uuid

# Configuration
INPUT_FILENAME = "EU_EUR_L_CEFR_FRENCH.de.json"
ROOT_ID = "d4b9935d-df28-45aa-abf1-fea99f1fce02"
LEVEL_IDS = {
    "A1": "5d319918-3472-47b4-9d10-f5fbe76fbfaf",
    "A2": "69af5a55-d21b-40ed-acd8-1abeeb1f9084",
    "B1": "742cf035-7ffc-45e5-ab3b-7286bf9cf3d0",
    "B2": "54c727b7-3b34-4654-b777-aa898982ee8a",
    "C1": "997411ac-10ff-48f0-8e87-c56b5b234a6c",
    "C2": "95fc9826-c240-4b05-a4eb-1e1d121770c1"
}

def load_json(path):
    print(f"Loading {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    print(f"Saving {path}...")
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def get_descendants(goal_id, goals_map, visited):
    if goal_id in visited:
        return []
    visited.add(goal_id)
    
    goal = goals_map.get(goal_id)
    if not goal:
        return []
    
    descendants = []
    
    if "contains" in goal:
        for child_id in goal["contains"]:
            descendants.append(child_id)
            descendants.extend(get_descendants(child_id, goals_map, visited))
            
    return descendants

def main():
    if not os.path.exists(INPUT_FILENAME):
        print(f"Error: {INPUT_FILENAME} not found.")
        return

    data = load_json(INPUT_FILENAME)
    all_goals = data["goals"]
    goals_map = {g["id"]: g for g in all_goals}

    if ROOT_ID not in goals_map:
        print("Root ID not found!")
        return

    main_goals_list = []
    # Add Root
    main_goals_list.append(goals_map[ROOT_ID])
    
    # Add Level Nodes (A1-C2)
    for lid in LEVEL_IDS.values():
        if lid in goals_map:
            main_goals_list.append(goals_map[lid])
        else:
            print(f"Warning: Level ID {lid} not found in map.")

    ids_to_move = set()
    level_files_content = {}
    
    global_visited = set()
    global_visited.add(ROOT_ID)
    for lid in LEVEL_IDS.values():
        global_visited.add(lid)

    for lvl, lid in LEVEL_IDS.items():
        if lid not in goals_map:
            continue
            
        print(f"Processing Level {lvl}...")
        level_goal = goals_map[lid]
        
        level_descendants = []
        visited_local = set()
        
        children = level_goal.get("contains", [])
        for child_id in children:
            if child_id not in visited_local:
                level_descendants.append(child_id)
                level_descendants.extend(get_descendants(child_id, goals_map, visited_local))
        
        lvl_goals_objects = []
        for gid in level_descendants:
            if gid in goals_map:
                lvl_goals_objects.append(goals_map[gid])
                ids_to_move.add(gid)
                global_visited.add(gid)
        
        level_data = {
            "title": f"Französisch (CEFR {lvl})",
            "titleEn": f"French (CEFR {lvl})",
            "description": f"Teilcurriculum für Niveau {lvl}",
            "descriptionEn": f"Sub-curriculum for Level {lvl}",
            "landscapeId": str(uuid.uuid4()),
            "locale": data["locale"],
            "subject": data["subject"],
            "frameworkId": data["frameworkId"], 
            "goals": lvl_goals_objects
        }
        level_files_content[lvl] = level_data

    # Check for orphans
    all_ids = set(goals_map.keys())
    orphans = all_ids - global_visited
    
    if orphans:
        print(f"Warning: {len(orphans)} goals are orphans. Keeping them in Main.")
        for oid in orphans:
            main_goals_list.append(goals_map[oid])

    # Construct Main File
    main_data = copy.deepcopy(data)
    main_data["goals"] = main_goals_list
    main_data["title"] += " (Structure)"
    main_data["titleEn"] += " (Structure)"

    save_json("EU_EUR_L_CEFR_FRENCH.de.json", main_data)
    
    for lvl, content in level_files_content.items():
        filename = f"EU_EUR_L_CEFR_FRENCH_{lvl}.de.json"
        save_json(filename, content)

if __name__ == "__main__":
    main()
