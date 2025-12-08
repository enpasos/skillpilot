
import json
import os
import sys

TARGET_DIR = "."

def scan_file(file_path):
    issues = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        def check_node(node):
            node_issues = []
            
            # Check 5: German content check (Rule 5)
            t_de = node.get("title", "")
            if not t_de or not isinstance(t_de, str) or len(t_de.strip()) == 0:
                 node_issues.append("title_missing_or_empty")

            d_de = node.get("description", "")
            if not d_de or not isinstance(d_de, str) or len(d_de.strip()) == 0:
                 node_issues.append("description_missing_or_empty")

            # Check 3: Untranslated or Placeholder
            t_en = node.get("titleEn", "")
            if t_en.startswith("[TODO]") or (t_de and t_en == t_de):
                 node_issues.append("titleEn_untranslated")
                 
            d_en = node.get("descriptionEn", "")
            if d_en.startswith("[TODO]") or (d_en and d_de and d_en == d_de):
                 node_issues.append("descriptionEn_untranslated")
                 
            if node_issues:
                issues.append({
                    "id": node.get("id", "unknown"),
                    "shortKey": node.get("shortKey", "unknown"),
                    "issues": node_issues
                })
            
            # Recurse
            if "contains" in node:
                for child in node["contains"]:
                    if isinstance(child, dict):
                        check_node(child)
            if "goals" in node:
                for child in node["goals"]:
                    if isinstance(child, dict):
                        check_node(child)

        check_node(data)
        return issues
    except Exception as e:
        return [{"error": str(e)}]

def main():
    report = {}
    global TARGET_DIR
    if len(sys.argv) > 1:
        TARGET_DIR = sys.argv[1]

    for root, dirs, files in os.walk(TARGET_DIR):
        for f in files:
            if f.endswith(".de.json"):
                full_path = os.path.join(root, f)
                file_issues = scan_file(full_path)
                if file_issues:
                    rel_path = os.path.relpath(full_path, TARGET_DIR)
                    report[rel_path] = file_issues
                    
    with open("localization_audit_report.json", "w", encoding='utf-8') as f:
        json.dump(report, f, indent=4)
        
    print(f"Report generated: localization_audit_report.json. Found issues in {len(report)} files.")

if __name__ == "__main__":
    main()
