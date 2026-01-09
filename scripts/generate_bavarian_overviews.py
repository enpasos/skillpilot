
import os
import json
import uuid
from glob import glob

CURRICULA_DIR = "curricula/DE/BY"
SCHOOL_TYPES = [
    "Berufsoberschule",
    "Fachoberschule",
    "Grundschule",
    "Gymnasium",
    "Mittelschule",
    "Realschule",
    "Wirtschaftsschule"
]

def generate_uuid(string):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, string))

def create_overview(school_type):
    dir_path = os.path.join(CURRICULA_DIR, school_type)
    if not os.path.exists(dir_path):
        print(f"Skipping {school_type}, directory not found.")
        return

    subject_files = glob(os.path.join(dir_path, "*.json"))
    
    contained_root_ids = []
    
    print(f"Processing {school_type}...")
    
    for file_path in subject_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # Find the root goal of this subject
                # Usually it's the one with "core": true or the first one?
                # In scraping, we often made the first goal the root.
                # Or we look for a goal that is not contained by any other in the same file?
                # Let's assume the first goal in the list is the root for now, or finding one with no parents within the file.
                
                # Better strategy: The scraper usually puts the main subject node as the first element or we can identify it by title matching the file name?
                # Actually, in the repaired files, we have a list of goals. One of them is the root.
                # Let's assume the one with "tags": ["root"] or similar? The scraper adds "root" tag? 
                
                # Let's rely on the scraper's behavior: "The first item in 'goals' list is usually the root."
                # Let's verify this assumption by checking if it is contained by anything else.
                
                goals = data.get("goals", [])
                if not goals:
                    continue
                    
                # Find root: a goal that is not in 'contains' of any other goal in this file
                all_contained = set()
                for g in goals:
                    if "contains" in g:
                        all_contained.update(g["contains"])
                
                root_candidates = [g for g in goals if g["id"] not in all_contained]
                
                if root_candidates:
                    # Pick the best candidate. If multiple, maybe picking the one that matches filename?
                    # Usually there is only one true root.
                    root_node = root_candidates[0]
                    contained_root_ids.append(root_node["id"])
                    print(f"  - Added {os.path.basename(file_path)} (Root ID: {root_node['id']})")
                else:
                    print(f"  - Warning: No root node found for {os.path.basename(file_path)}")

        except Exception as e:
            print(f"  - Error processing {file_path}: {e}")

    if not contained_root_ids:
        print(f"No subjects found for {school_type}, skipping overview generation.")
        return

    # Create Overview JSON
    overview_id = generate_uuid(f"DE-BY-{school_type}-Overview")
    root_goal_id = generate_uuid(f"DE-BY-{school_type}-Overview-Goal")
    
    overview_title = f"{school_type} (Bayern)"
    
    overview_data = {
        "id": overview_id,
        "title": overview_title,
        "titleEn": f"{school_type} (Bavaria)",
        "description": f"Curriculum overview for {school_type} in Bavaria.",
        "descriptionEn": f"Curriculum overview for {school_type} in Bavaria.",
        "country": "DE",
        "region": "BY",
        "schoolType": school_type,
        "subject": "Overview",
        "locale": "de-DE",
        "goals": [
            {
                "id": root_goal_id,
                "title": overview_title,
                "description": "Überblick über alle Fächer.",
                "type": "cluster",
                "contains": contained_root_ids,
                "tags": ["root", "overview"]
            }
        ]
    }
    
    # Save to file
    outfile = os.path.join(CURRICULA_DIR, f"DE_BY_{school_type}_Overview.json")
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(overview_data, f, indent=2, ensure_ascii=False)
    print(f"Created overview: {outfile}\n")

def main():
    for school_type in SCHOOL_TYPES:
        create_overview(school_type)

if __name__ == "__main__":
    main()
