import json
import os
import argparse
import sys

# Valid keys order for Root Landscape
ROOT_KEYS_ORDER = [
    "landscapeId", "locale", "subject", "frameworkId", 
    "title", "titleEn", "description", "descriptionEn", 
    "filters", "goals"
]

# Valid keys order for Goals
GOAL_KEYS_ORDER = [
    "id", "shortKey", "title", "titleEn", "description", "descriptionEn",
    "core", "weight", "phase", "area", "tags",
    "contains", "requires", "examples", "dimensionTags"
]

def reorder_dictionary(d, order_list):
    """
    Returns a new dictionary with keys sorted according to order_list.
    Keys not in order_list are appended at the end sorted alphabetically.
    """
    new_d = {}
    # 1. Official keys in order
    for k in order_list:
        if k in d:
            new_d[k] = d[k]
    # 2. Extra keys
    extra_keys = sorted([k for k in d.keys() if k not in order_list])
    for k in extra_keys:
        new_d[k] = d[k]
    return new_d

def audit_node(node, path, issues, is_root=False):
    """
    Audit a single node (Root or Goal).
    path: string identifier for reporting
    issues: list to append issues to
    is_root: boolean
    """
    
    # Rule 5: German Title/Description existence
    if not node.get("title"):
        issues.append(f"[{path}] Missing 'title' (German)")
    if not node.get("description"):
        issues.append(f"[{path}] Missing 'description' (German)")

    # Rule 2: English Fields Missing
    if "titleEn" not in node:
        issues.append(f"[{path}] Missing 'titleEn'")
        # Auto-fill for fix (will be handled by caller re-saving, but we need to insert it)
        node["titleEn"] = node.get("title", "") # Temporary fill to ensure key exists for simple fix
    
    if "descriptionEn" not in node:
        issues.append(f"[{path}] Missing 'descriptionEn'")
        node["descriptionEn"] = node.get("description", "")

    # Rule 3: Untranslated Content (Simple heuristic)
    # Only flag if German is not empty and English equals German
    title_de = node.get("title", "")
    title_en = node.get("titleEn", "")
    if title_de and title_de == title_en:
         issues.append(f"[{path}] 'titleEn' identical to 'title' (Untranslated?)")
    
    desc_de = node.get("description", "")
    desc_en = node.get("descriptionEn", "")
    
    # Ignore empty descriptions for this check, but if both are present and equal, flag it.
    if desc_de and desc_de == desc_en:
         issues.append(f"[{path}] 'descriptionEn' identical to 'description' (Untranslated?)")

    # Rule 4: Reorder
    # We return the reordered node
    order = ROOT_KEYS_ORDER if is_root else GOAL_KEYS_ORDER
    return reorder_dictionary(node, order)

def process_file(filepath, fix=False):
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"ERROR: Could not parse {filepath}: {e}")
        return

    # Process Root
    new_data = audit_node(data, "ROOT", issues, is_root=True)

    # Process Goals
    if "goals" in data and isinstance(data["goals"], list):
        new_goals = []
        for i, goal in enumerate(data["goals"]):
            goal_id = goal.get("id", f"goal_{i}")
            new_goal = audit_node(goal, f"Goal {goal_id}", issues, is_root=False)
            new_goals.append(new_goal)
        new_data["goals"] = new_goals
    
    # Special: Check if filename corresponds to rules (optional but good)
    
    if issues:
        print(f"\nFile: {filepath}")
        for issue in issues:
            print(f"  - {issue}")
    
    if fix:
        # Re-write file to enforce order and add missing keys
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4, ensure_ascii=False)
            f.write('\n') 

def main():
    parser = argparse.ArgumentParser(description="Audit curriculum JSON files.")
    parser.add_argument("--fix", action="store_true", help="Apply fixes (reorder keys, add missing placeholders)")
    parser.add_argument("paths", nargs='+', help="Files or directories to audit")
    
    args = parser.parse_args()

    for path in args.paths:
        if os.path.isfile(path):
            if path.endswith(".de.json"):
                process_file(path, args.fix)
        elif os.path.isdir(path):
            for root, dirs, files in os.walk(path):
                for file in files:
                    if file.endswith(".de.json"):
                        process_file(os.path.join(root, file), args.fix)

if __name__ == "__main__":
    main()
