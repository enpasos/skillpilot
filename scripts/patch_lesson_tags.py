import os
import json
import re

def patch_lesson_tags(root_dir):
    print(f"Scanning {root_dir}...")
    pattern = re.compile(r".*_l(\d+)_vocabulary$")
    
    modified_count = 0
    
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".de.json") and "CEFR" in subdir:
                filepath = os.path.join(subdir, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    file_modified = False
                    
                    if "goals" in data:
                        for goal in data["goals"]:
                            match = pattern.match(goal.get("id", ""))
                            if match:
                                lesson_num = int(match.group(1))
                                lesson_tag = f"lesson_{lesson_num}"
                                
                                tags = goal.get("tags", [])
                                if lesson_tag not in tags:
                                    print(f"Adding {lesson_tag} to {goal['id']} in {file}")
                                    tags.append(lesson_tag)
                                    goal["tags"] = tags
                                    file_modified = True
                    
                    if file_modified:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=4, ensure_ascii=False)
                        modified_count += 1
                        
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

    print(f"Patch complete. Modified {modified_count} files.")

if __name__ == "__main__":
    patch_lesson_tags("curricula/EU/CEFR")
