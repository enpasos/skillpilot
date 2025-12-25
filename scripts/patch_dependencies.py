import os
import json
import re

def get_level_root_id(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Find the root goal of this level file
            # Heuristic: It's the goal that contains "cefr_{level}_module_01" or has tag "A1"/"A2"/etc + "root"
            for goal in data.get("goals", []):
                if "root" in goal.get("tags", []):
                    # Check if it looks like a level root
                    # Often it has title "English A1 (Einstieg)" or similar
                    return goal["id"]
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return None

def patch_dependencies(language_dir, lang_code):
    print(f"Processing {language_dir}...")
    
    levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    level_root_ids = {} # Map "A1" -> UUID
    
    # 1. Harvest Root IDs for all levels
    for level in levels:
        filename = f"EU_EUR_L_CEFR_{lang_code.upper()}_{level}.de.json"
        filepath = os.path.join(language_dir, filename)
        if os.path.exists(filepath):
            root_id = get_level_root_id(filepath)
            if root_id:
                level_root_ids[level] = root_id
                print(f"  Found Root ID for {level}: {root_id}")
            else:
                print(f"  Warning: No root ID found for {level} in {filename}")
        else:
            print(f"  Warning: File not found: {filename}")

    # 2. Patch Files
    for i, level in enumerate(levels):
        filename = f"EU_EUR_L_CEFR_{lang_code.upper()}_{level}.de.json"
        filepath = os.path.join(language_dir, filename)
        
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        
        # A. Level Dependencies (Inter-file)
        # If this is A2 (index 1), it requires A1 (index 0)
        if i > 0:
            prev_level = levels[i-1]
            prev_id = level_root_ids.get(prev_level)
            
            if prev_id:
                # Find current level's root goal and add requires
                current_root_id = level_root_ids.get(level)
                for goal in data["goals"]:
                    if goal["id"] == current_root_id:
                        reqs = goal.get("requires", [])
                        if prev_id not in reqs:
                            print(f"  [{level}] Adding dependency: Level {level} requires {prev_level} ({prev_id})")
                            reqs.append(prev_id)
                            goal["requires"] = reqs
                            modified = True
                        break

        # B. Lesson Dependencies (Intra-file)
        # Goal ID pattern: cefr_{level_lower}_lesson_{nn} -> e.g. cefr_a1_lesson_02
        # We need to map 02 -> 01
        
        # Build map of lesson Number -> ID
        lesson_map = {} # 1 -> "id_of_lesson_1"
        pattern = re.compile(rf"cefr_{level.lower()}_lesson_(\d+)")
        
        for goal in data["goals"]:
            match = pattern.match(goal["id"])
            if match:
                num = int(match.group(1))
                lesson_map[num] = goal["id"]
        
        # Apply dependencies
        for num, l_id in lesson_map.items():
            if num > 1:
                prev_num = num - 1
                prev_l_id = lesson_map.get(prev_num)
                
                if prev_l_id:
                    # Find the goal for current lesson
                    for goal in data["goals"]:
                        if goal["id"] == l_id:
                            reqs = goal.get("requires", [])
                            if prev_l_id not in reqs:
                                print(f"  [{level}] Adding dependency: Lesson {num} requires Lesson {prev_num}")
                                reqs.append(prev_l_id)
                                goal["requires"] = reqs
                                modified = True
                            break
                            
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"  Saved updates to {filename}")
        else:
            print(f"  No changes needed for {filename}")

if __name__ == "__main__":
    base_dir = "curricula/EU/CEFR"
    
    # Process English
    patch_dependencies(os.path.join(base_dir, "English_From_German/json"), "ENGLISH")
    
    # Process French
    patch_dependencies(os.path.join(base_dir, "French_From_German/json"), "FRENCH")
