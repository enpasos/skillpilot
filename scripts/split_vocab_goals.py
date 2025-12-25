import os
import json
import re

def split_goals(language_dir, lang_code):
    print(f"Splitting goals in {language_dir}...")
    
    levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    
    for level in levels:
        filename = f"EU_EUR_L_CEFR_{lang_code.upper()}_{level}.de.json"
        filepath = os.path.join(language_dir, filename)
        
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        new_goals = []
        modified = False
        
        # Regex to match vocabulary goals: cefr_{level}_l{num}_vocabulary
        # e.g. cefr_a1_l01_vocabulary
        pattern = re.compile(rf"cefr_{level.lower()}_l(\d+)_vocabulary")
        
        for goal in data["goals"]:
            match = pattern.match(goal["id"])
            
            # Check if this is a vocab goal AND doesn't already have 'reading/writing' split
            # Heuristic: if title already contains (Lesen), skip
            if match and "(Lesen)" not in goal["title"] and "(Reading)" not in goal.get("titleEn", ""):
                print(f"  Splitting {goal['id']}...")
                lesson_num = int(match.group(1)) # e.g. 1
                
                # 1. Modify Original Goal to be "Reading" (Forward)
                goal_fwd = goal # Edit in place
                goal_fwd["title"] = f"{goal_fwd['title']} (Lesen)"
                if "titleEn" in goal_fwd:
                    goal_fwd["titleEn"] = f"{goal_fwd['titleEn']} (Reading)"
                
                # Add Forward Selector Tag
                tags = goal_fwd.get("tags", [])
                sel_tag_fwd = f"select:l{lesson_num}_fwd"
                if sel_tag_fwd not in tags:
                    tags.append(sel_tag_fwd)
                goal_fwd["tags"] = tags
                
                new_goals.append(goal_fwd)
                
                # 2. Create New Goal for "Writing" (Reverse)
                goal_rev = json.loads(json.dumps(goal_fwd)) # Deep copy
                
                # Update ID and Titles
                goal_rev["id"] = f"{goal_fwd['id']}_rev" # e.g. cefr_a1_l01_vocabulary_rev
                goal_rev["title"] = goal_rev["title"].replace("(Lesen)", "(Schreiben)")
                if "titleEn" in goal_rev:
                    goal_rev["titleEn"] = goal_rev["titleEn"].replace("(Reading)", "(Writing)")
                
                # Update Tags: Replace fwd with rev
                rev_tags = [t for t in goal_rev["tags"] if t != sel_tag_fwd]
                rev_tags.append(f"select:l{lesson_num}_rev")
                goal_rev["tags"] = rev_tags
                
                # Update references in PARENT goals?
                # The parent (Lesson Goal) contains the original ID. It needs to contain the new ID too.
                # We'll handle this in a second pass over the `new_goals` list or just append here and patch parents later?
                # Easier: Just collect the ID pair and patch parents at the end of file processing.
                
                new_goals.append(goal_rev)
                modified = True
            else:
                new_goals.append(goal)
        
        data["goals"] = new_goals
        
        if modified:
            # Patch Parent Containers
            # Any goal that contained the original ID should now also contain the rev ID
            # Map: Original -> Rev
            rev_map = {}
            for g in new_goals:
                if g["id"].endswith("_rev"):
                    original_id = g["id"][:-4]
                    rev_map[original_id] = g["id"]
            
            for goal in data["goals"]:
                if "contains" in goal:
                    new_contains = []
                    for child_id in goal["contains"]:
                        new_contains.append(child_id)
                        if child_id in rev_map:
                            if rev_map[child_id] not in goal["contains"]:
                                print(f"    Adding {rev_map[child_id]} to container {goal['id']}")
                                new_contains.append(rev_map[child_id])
                    goal["contains"] = new_contains
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"  Saved updates to {filename}")

if __name__ == "__main__":
    base_dir = "curricula/EU/CEFR"
    
    # Process English
    split_goals(os.path.join(base_dir, "English_From_German/json"), "ENGLISH")
    
    # Process French
    split_goals(os.path.join(base_dir, "French_From_German/json"), "FRENCH")
