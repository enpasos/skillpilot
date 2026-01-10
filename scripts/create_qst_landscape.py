#!/usr/bin/env python3
"""
Creates/updates the QST Master landscape JSON from xyz.txt hierarchy.
"""
import json
import uuid
import re
from pathlib import Path

SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")

def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))

def main():
    base_dir = Path("curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST")
    input_file = base_dir / "input" / "DE_BAY_U_TUM_xyz.txt"
    json_dir = base_dir / "json"
    output_file = json_dir / "DE_BAY_U_TUM_MSC_QST.de.json"
    
    json_dir.mkdir(exist_ok=True, parents=True)

    # Parse Input File
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    clusters = []
    current_cluster = None
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped: 
            continue
        if line_stripped.startswith("$m"): 
            continue
        if "http" in line_stripped: 
            continue

        # Cluster detection
        if line_stripped.startswith("#"):
            cluster_name = line_stripped.lstrip("#").strip()
            current_cluster = {"name": cluster_name, "modules": []}
            clusters.append(current_cluster)
            continue

        # Module Line
        parts = line_stripped.split('\t')
        if len(parts) >= 2:
            code = parts[0].strip()
            title = parts[1].strip() if len(parts) > 1 else ""
            credits = parts[2].strip() if len(parts) > 2 else ""
            semester = parts[3].strip() if len(parts) > 3 else ""
            
            if not re.search(r'\d', code):
                continue
                
            module_entry = {"code": code, "title": title, "credits": credits, "semester": semester}
            
            if current_cluster:
                current_cluster["modules"].append(module_entry)

    # Build Landscape JSON
    root_id = generate_deterministic_uuid("tum-landscape", "msc_qst")
    
    landscape = {
        "title": "M.Sc. Quantum Science and Technology (TUM)",
        "titleEn": "M.Sc. Quantum Science and Technology (TUM)",
        "description": "Curriculum Master QST an der TU München.",
        "descriptionEn": "Curriculum Master QST at TU Munich.",
        "landscapeId": root_id,
        "locale": "de-DE",
        "subject": "Quantum Science and Technology",
        "frameworkId": "tum-msc-qst",
        "filters": [{"id": "MSc", "label": "Master QST"}],
        "goals": []
    }
    
    root_goal = {
        "id": root_id,
        "shortKey": "tum_msc_qst",
        "title": "M.Sc. Quantum Science and Technology",
        "titleEn": "M.Sc. Quantum Science and Technology",
        "description": "Gesamtkompetenz des Masterstudiengangs Quantum Science and Technology.",
        "descriptionEn": "Overall competence of the Master program Quantum Science and Technology.",
        "core": True,
        "weight": 10,
        "phase": "Curriculum",
        "area": "Gesamtkompetenz",
        "tags": ["ects:120", "level:master"],
        "contains": [],
        "requires": []
    }
    
    goals_list = [root_goal]
    
    for ci, cluster in enumerate(clusters):
        cluster_id = generate_deterministic_uuid("tum-cluster", f"msc_qst_{cluster['name'][:30]}")
        root_goal["contains"].append(cluster_id)
        
        cluster_goal = {
            "id": cluster_id,
            "shortKey": f"tum_msc_qst_c{ci+1}",
            "title": cluster["name"],
            "titleEn": cluster["name"],
            "description": f"Bereich: {cluster['name']}",
            "descriptionEn": f"Area: {cluster['name']}",
            "core": ci == 0,  # Only Pflichtbereich is core
            "weight": 5 if ci == 0 else 3,
            "phase": "Bereich",
            "area": "Struktur",
            "contains": [],
            "requires": []
        }
        
        for mod in cluster.get("modules", []):
            mod_id = generate_deterministic_uuid("tum-goal-root", mod["code"])
            cluster_goal["contains"].append(mod_id)
        
        goals_list.append(cluster_goal)
    
    landscape["goals"] = goals_list
    
    # Save
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(landscape, f, indent=4, ensure_ascii=False)
        
    print(f"Created QST landscape at {output_file}")
    print(f"Total goals in landscape: {len(goals_list)}")
    for cluster in clusters:
        print(f"  Cluster: {cluster['name']} ({len(cluster['modules'])} modules)")

if __name__ == "__main__":
    main()
