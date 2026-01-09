import json
import uuid
import re
from pathlib import Path
from datetime import datetime

# Deterministic UUID generation
SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")

def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))

def main():
    base_dir = Path("curricula/DE/BY/TUM/Informatics/BSc_Informatics")
    input_file = base_dir / "input" / "DE_BAY_U_TUM_xyz.txt"
    json_dir = base_dir / "json"
    output_file = json_dir / "DE_BAY_U_TUM_BSC_INFORMATIK.de.json"
    
    json_dir.mkdir(exist_ok=True, parents=True)

    # 1. Parse Input File with Clusters
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    clusters = []
    current_cluster = None
    
    # Init default cluster if none found
    default_cluster = {"name": "Allgemein", "modules": []}
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        # Cluster Header
        if line.startswith("#"):
            cluster_name = line.lstrip("#").strip()
            # If it looks like a commented out module, skip (e.g. # CIT... Bachelorarbeit)
            # BUT: In our format, # Abschluss is a header. # CIT000000 is a module.
            if re.match(r'^#\s*\w+\d+', line):
                 # It's a commented module
                 pass
            elif "Cluster" in line or "phase" in line or "Abschluss" in line:
                current_cluster = {"name": cluster_name, "modules": []}
                clusters.append(current_cluster)
            continue
            
        if line.startswith("$m"): continue

        # Header detection for URL template or similar (skip)
        if "http" in line: continue

        # Module Line: Code Title ...
        # Regex to parse: Code [Title] [Credits] [Semester]
        # e.g. IN0001 Einführung in die Informatik 6 1
        parts = line.split('\t')
        if len(parts) >= 4:
            code = parts[0].strip()
            # title = parts[1]
            # credits = parts[2]
            semester = parts[3].strip()
            
            if not current_cluster:
                current_cluster = default_cluster
                clusters.append(current_cluster)
                
            current_cluster["modules"].append({
                "code": code,
                "semester": semester
            })
        elif len(parts) >= 1:
             # Try space split if tab failed
             # IN0001 ... ... 1
             match = re.match(r'^(\w+)\s+.*?\s+(\d+)$', line)
             if match:
                 code = match.group(1)
                 semester = match.group(2)
                 if not current_cluster:
                    current_cluster = default_cluster
                    clusters.append(current_cluster)
                 current_cluster["modules"].append({"code": code, "semester": semester})

    # 2. Build Landscape JSON
    root_id = generate_deterministic_uuid("tum-landscape", "bsc_informatik")
    
    landscape = {
        "title": "B.Sc. Informatik (TUM)",
        "titleEn": "B.Sc. Informatics (TUM)",
        "description": "Curriculum Bachelor Informatik an der TU München.",
        "descriptionEn": "Curriculum Bachelor Informatics at TU Munich.",
        "locale": "de-DE",
        "subject": "Informatik",
        "frameworkId": "tum-bsc-informatik",
        "goals": []
    }
    
    # Root Goal
    root_goal = {
        "id": root_id,
        "shortKey": "tum_bsc_informatik",
        "title": "B.Sc. Informatik",
        "titleEn": "B.Sc. Informatics",
        "description": "Gesamtkompetenz des Bachelorstudiengangs Informatik.",
        "descriptionEn": "Overall competence of the Bachelor program Informatics.",
        "core": True,
        "weight": 10,
        "phase": "Curriculum",
        "area": "Gesamtkompetenz",
        "contains": []
    }
    
    # Process Clusters
    for i, cluster in enumerate(clusters):
        cluster_name = cluster['name']
        cluster_id = generate_deterministic_uuid("tum-cluster", f"bsc_inf_{i}_{cluster_name}")
        root_goal["contains"].append(cluster_id)
        
        cluster_goal = {
            "id": cluster_id,
            "shortKey": f"tum_bsc_inf_c{i+1}",
            "title": cluster_name,
            "titleEn": cluster_name, # translate if needed
            "description": f"Phase: {cluster_name}",
            "descriptionEn": f"Phase: {cluster_name}",
            "core": True,
            "weight": 5,
            "phase": "Bereich",
            "area": "Struktur",
            "contains": [] 
        }
        
        # Group by Semester within Cluster
        modules_by_sem = {}
        for mod in cluster["modules"]:
            sem = mod["semester"]
            if sem not in modules_by_sem:
                modules_by_sem[sem] = []
            modules_by_sem[sem].append(mod)
            
        for sem, mods in sorted(modules_by_sem.items()):
            sem_id = generate_deterministic_uuid("tum-semester", f"bsc_inf_{cluster_name}_sem{sem}")
            cluster_goal["contains"].append(sem_id)
            
            sem_goal = {
                "id": sem_id,
                "shortKey": f"tum_bsc_inf_c{i+1}_s{sem}",
                "title": f"{sem}. Fachsemester",
                "titleEn": f"{sem}. Semester",
                "description": f"Module des {sem}. Semesters in {cluster_name}",
                "descriptionEn": f"Modules of the {sem}. semester in {cluster_name}",
                "core": True,
                "weight": 2,
                "phase": "Semester",
                "area": "Struktur",
                "contains": [],
                "tags": [f"semester:{sem}"]
            }
            
            # Add Modules
            for mod in mods:
                # Generate Module UUID (must match scraper!)
                # Scraper uses: generate_deterministic_uuid("tum-module", code)
                # No, scraper uses generate_deterministic_uuid("tum-module", code) ? 
                # Scraper logic: uuid.uuid5(SKILLPILOT_NAMESPACE, f"tum-module/{code}")
                # My helper: generate_deterministic_uuid("tum-module", code) -> f"tum-module/{code}"
                mod_id = generate_deterministic_uuid("tum-module", mod['code'])
                sem_goal["contains"].append(mod_id)
                # We assume the module JSON exists or will be created
            
            landscape["goals"].append(sem_goal)
            
        landscape["goals"].append(cluster_goal)
        
    landscape["goals"].insert(0, root_goal)
    
    # Save
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(landscape, f, indent=4, ensure_ascii=False)
        
    print(f"Created landscape at {output_file}")
    
if __name__ == "__main__":
    main()
