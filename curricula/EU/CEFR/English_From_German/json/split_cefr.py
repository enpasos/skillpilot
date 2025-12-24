import json
import os
import copy
import uuid

# Configuration
INPUT_FILENAME = "EU_EUR_L_CEFR_ENGLISH.de.json"
ROOT_ID = "2da53bd3-673b-49ed-8cfe-7f88a0d6a8f0"
LEVEL_IDS = {
    "A1": "08b48ebe-94ea-40b6-872d-1db8d9defab3",
    "A2": "2c0aa7e1-7e98-41f3-907f-af5d4d807f20",
    "B1": "606b8710-a6fe-4ae8-996c-8b9a2ea5b007",
    "B2": "481d7658-d58a-4abb-9d99-935ad62d9fec",
    "C1": "6c4cece4-466c-48c3-96b4-a31689736c49",
    "C2": "55954002-72b1-4c19-84af-86f2aa56f6aa"
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
    # Note: We mark as visited, but for this specific subgraph traversal
    # we don't want to block other levels if they share nodes (unlikely in tree).
    # But strictly, if a node is shared, it should probably be in one file or duplicated?
    # We will assume a Tree structure for now.
    visited.add(goal_id)
    
    goal = goals_map.get(goal_id)
    if not goal:
        return []
    
    descendants = []
    
    if "contains" in goal:
        for child_id in goal["contains"]:
            # Recurse on child
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

    # Verify Root and Levels exist
    if ROOT_ID not in goals_map:
        print("Root ID not found!")
        return

    main_goals_list = []
    # Add Root
    main_goals_list.append(goals_map[ROOT_ID])
    
    # Add Level Nodes (A1-C2) to Main
    for lid in LEVEL_IDS.values():
        if lid in goals_map:
            main_goals_list.append(goals_map[lid])
        else:
            print(f"Warning: Level ID {lid} not found in map.")

    ids_to_move = set()
    level_files_content = {}
    
    # Global visited to ensure no overlap if possible
    global_visited = set()
    global_visited.add(ROOT_ID)
    for lid in LEVEL_IDS.values():
        global_visited.add(lid)

    for lvl, lid in LEVEL_IDS.items():
        if lid not in goals_map:
            continue
            
        print(f"Processing Level {lvl}...")
        level_goal = goals_map[lid]
        
        # Traverse children
        # We start traversal from the children of the Level Node
        # The Level Node itself stays in Main.
        
        level_descendants = []
        visited_local = set()
        
        children = level_goal.get("contains", [])
        for child_id in children:
            if child_id not in visited_local:
                level_descendants.append(child_id)
                level_descendants.extend(get_descendants(child_id, goals_map, visited_local))
        
        # Collect goal objects
        lvl_goals_objects = []
        for gid in level_descendants:
            if gid in goals_map:
                lvl_goals_objects.append(goals_map[gid])
                ids_to_move.add(gid)
                global_visited.add(gid)
        
        # Create file content
        level_data = {
            "title": f"Englisch (CEFR {lvl})",
            "titleEn": f"English (CEFR {lvl})",
            "description": f"Teilcurriculum für Niveau {lvl}",
            "descriptionEn": f"Sub-curriculum for Level {lvl}",
            "landscapeId": str(uuid.uuid4()), # New UUID
            "locale": data["locale"],
            "subject": data["subject"],
            # Same frameworkId so they belong to the same logical system
            "frameworkId": data["frameworkId"], 
            "goals": lvl_goals_objects
        }

        # Add 'root' tag to the first goal to ensure it's hidden by backend logic
        if lvl_goals_objects:
            first_goal = lvl_goals_objects[0]
            if "tags" not in first_goal:
                first_goal["tags"] = []
            if "root" not in first_goal["tags"]:
                first_goal["tags"].append("root")

        level_files_content[lvl] = level_data

    # Check for orphans (goals not reachable from A1-C2)
    # We exclude Root and Levels from the check (already in global_visited)
    all_ids = set(goals_map.keys())
    orphans = all_ids - global_visited
    
    if orphans:
        print(f"Warning: {len(orphans)} goals are orphans (not reachable from Levels). Keeping them in Main.")
        for oid in orphans:
            main_goals_list.append(goals_map[oid])

    # Construct Main File
    main_data = copy.deepcopy(data)
    main_data["goals"] = main_goals_list
    # Helper: update title/description of main to reflect it's the structure
    # main_data["title"] += " (Structure)"
    # main_data["titleEn"] += " (Structure)"

    # Save Everything
    save_json("EU_EUR_L_CEFR_ENGLISH.de.json", main_data)
    
    for lvl, content in level_files_content.items():
        filename = f"EU_EUR_L_CEFR_ENGLISH_{lvl}.de.json"
        save_json(filename, content)

if __name__ == "__main__":
    main()
