
import json
import os
import sys

# Target directory (Default to current, but script will process recursively)
TARGET_DIR = "."

# Stats
stats = {
    "files_processed": 0,
    "nodes_checked": 0,
    "missing_fields_fixed": 0,
    "untranslated_flagged": 0,
    "reordered": 0
}

def reorder_node(node):
    """
    Rebuilds the node dictionary to enforce strict field ordering.
    Desired order: id, shortKey, title, titleEn, description, descriptionEn, ... others
    """
    ordered = {}
    
    # keys to enforce at top
    priority_keys = ["id", "shortKey", "title", "titleEn", "description", "descriptionEn"]
    
    # Add priority keys if they exist (or should exist)
    for k in priority_keys:
        if k in node:
            ordered[k] = node[k]
            
    # Add remaining keys
    for k, v in node.items():
        if k not in priority_keys:
            ordered[k] = v
            
    return ordered

def process_node(node, file_name):
    """
    Recursively validates and fixes a node.
    """
    stats["nodes_checked"] += 1
    
    # 2. Check Missing Fields
    if "title" in node:
        if "titleEn" not in node:
            # Fix missing titleEn
            node["titleEn"] = "[TODO] " + node["title"]
            stats["missing_fields_fixed"] += 1

        # 3. Check Untranslated
        if node["titleEn"] == node["title"]:
             stats["untranslated_flagged"] += 1
    
    if "description" in node:
        if "descriptionEn" not in node:
             # Fix missing descriptionEn
            node["descriptionEn"] = "[TODO] " + node["description"]
            stats["missing_fields_fixed"] += 1
            
        if "descriptionEn" in node and node["descriptionEn"] == node["description"]:
             stats["untranslated_flagged"] += 1

    # Recurse into 'contains'
    if "contains" in node and isinstance(node["contains"], list):
        new_contains = []
        for child in node["contains"]:
            if isinstance(child, dict): # Ensure it's a node object
                new_contains.append(process_node(child, file_name))
            else:
                new_contains.append(child) # Keep strings/UUIDs as is
        node["contains"] = new_contains

    # Recurse into 'goals' (Root level)
    if "goals" in node and isinstance(node["goals"], list):
        new_goals = []
        for child in node["goals"]:
            if isinstance(child, dict):
                new_goals.append(process_node(child, file_name))
            else:
                new_goals.append(child)
        node["goals"] = new_goals
        
    # 4. Reorder
    return reorder_node(node)

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f) # 1. Duplicates handled implicitly by parser (last win)
            
        # Process Root (Landscape)
        new_data = process_node(data, os.path.basename(file_path))
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4, ensure_ascii=False)
            
        stats["files_processed"] += 1
        return True
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    global TARGET_DIR
    if len(sys.argv) > 1:
        TARGET_DIR = sys.argv[1]

    print(f"Starting Deep Localization Remediation in {TARGET_DIR}...")
    
    target_files = []
    for root, dirs, files in os.walk(TARGET_DIR):
        for f in files:
            if f.endswith(".de.json"):
                target_files.append(os.path.join(root, f))
    
    target_files.sort()
    print(f"Found {len(target_files)} files.")
    
    for f in target_files:
        # print(f"Processing {f}...")
        process_file(f)
        
    print("\n--- Summary ---")
    print(f"Files Processed: {stats['files_processed']}")
    print(f"Nodes Checked: {stats['nodes_checked']}")
    print(f"Missing Fields Fixed (Placeholder Added): {stats['missing_fields_fixed']}")
    print(f"Untranslated/Identical Fields Flagged: {stats['untranslated_flagged']}")
    print("Done.")

if __name__ == "__main__":
    main()
