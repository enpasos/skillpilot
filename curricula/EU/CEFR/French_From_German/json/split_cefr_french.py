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
    # They move to sub-files now.
    # for lid in LEVEL_IDS.values():
    #     if lid in goals_map:
    #         main_goals_list.append(goals_map[lid])
    #     else:
    #         print(f"Warning: Level ID {lid} not found in map.")

    ids_to_move = set()
    level_files_content = {}
    
    global_visited = set()
    global_visited.add(ROOT_ID)
    for lid in LEVEL_IDS.values():
        global_visited.add(lid)

    # Custom Descriptions
    CEFR_META = {
        "A1": {"title": "A1 (Einstieg)", "desc": "Elementare Sprachverwendung; kann sich vorstellen, einfache Fragen beantworten."},
        "A2": {"title": "A2 (Grundlagen)", "desc": "Elementare Sprachverwendung; kann einfache Informationen in Routine-Situationen austauschen."},
        "B1": {"title": "B1 (Mittelstufe)", "desc": "Selbstständige Sprachverwendung; kann sich in vertrauten Situationen verständigen und Meinungen äußern."},
        "B2": {"title": "B2 (Gute Mittelstufe)", "desc": "Selbstständige Sprachverwendung; kann komplexere Texte verstehen und sich spontan und fließend verständigen."},
        "C1": {"title": "C1 (Fortgeschritten)", "desc": "Kompetente Sprachverwendung; kann in fast allen Situationen anwenden und komplexe Themen verstehen."},
        "C2": {"title": "C2 (Exzellent)", "desc": "Kompetente Sprachverwendung; beherrscht die Sprache fast muttersprachlich."}
    }

    for lvl, lid in LEVEL_IDS.items():
        if lid not in goals_map:
            continue
            
        print(f"Processing Level {lvl}...")
        level_goal = goals_map[lid]
        
        # Update Root Goal Title/Desc
        meta = CEFR_META.get(lvl, {})
        new_title_suffix = meta.get("title", lvl)
        new_desc = meta.get("desc", level_goal["description"])
        
        level_goal["title"] = f"Französisch {new_title_suffix}"
        level_goal["description"] = new_desc
        
        level_descendants = []
        visited_local = set()
        
        children = level_goal.get("contains", [])
        for child_id in children:
            if child_id not in visited_local:
                level_descendants.append(child_id)
                level_descendants.extend(get_descendants(child_id, goals_map, visited_local))
        
        lvl_goals_objects = []
        
        # Add Level Node as first object
        lvl_goals_objects.append(level_goal)
        ids_to_move.add(lid)
        
        for gid in level_descendants:
            if gid in goals_map:
                lvl_goals_objects.append(goals_map[gid])
                ids_to_move.add(gid)
                global_visited.add(gid)
        
        # Create file content
        level_data = {
            "title": f"Französisch {new_title_suffix}",
            "titleEn": f"French (CEFR {lvl})",
            "description": new_desc,
            "descriptionEn": f"Sub-curriculum for Level {lvl}",
            "landscapeId": str(uuid.uuid4()),
            "locale": data["locale"],
            "subject": data["subject"],
            "frameworkId": data["frameworkId"], 
            "goals": lvl_goals_objects
        }
        
        # Add 'root' tag to the first goal
        if lvl_goals_objects:
            first_goal = lvl_goals_objects[0]
            if "tags" not in first_goal:
                first_goal["tags"] = []
            if "root" not in first_goal["tags"]:
                first_goal["tags"].append("root")

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
    
    # Helper: ensure clean title/description 
    main_data["title"] = main_data["title"].replace(" (Structure)", "")
    main_data["titleEn"] = main_data["titleEn"].replace(" (Structure)", "")

    save_json("EU_EUR_L_CEFR_FRENCH.de.json", main_data)
    
    for lvl, content in level_files_content.items():
        filename = f"EU_EUR_L_CEFR_FRENCH_{lvl}.de.json"
        save_json(filename, content)

if __name__ == "__main__":
    main()
