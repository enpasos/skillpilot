#!/usr/bin/env python3
"""
Creates/updates the Physics BSc landscape JSON from xyz.txt hierarchy.
Parses # (Cluster), ## (Semester), ### (Category), #### (Catalog) markers.
"""
import json
import uuid
import re
from pathlib import Path

SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")

def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))

def main():
    base_dir = Path("curricula/DE/BY/TUM/Physics/BSc_Physics")
    input_file = base_dir / "input" / "DE_BAY_U_TUM_xyz.txt"
    json_dir = base_dir / "json"
    output_file = json_dir / "DE_BAY_U_TUM_BSC_PHYSIK.de.json"
    
    json_dir.mkdir(exist_ok=True, parents=True)

    # Parse Input File
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # State machine for parsing hierarchy
    clusters = []  # List of cluster dicts
    current_cluster = None
    current_semester = None
    current_category = None
    current_catalog = None
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped: 
            continue
        if line_stripped.startswith("$m"): 
            continue
        if "http" in line_stripped: 
            continue
        if line_stripped.startswith("Bachelor") or line_stripped.startswith("Physik") or "ECTS" in line_stripped:
            continue

        # Hierarchy detection (# ## ### ####)
        if line_stripped.startswith("####"):
            # Catalog (e.g., "Katalog KTA")
            catalog_name = line_stripped.lstrip("#").strip()
            current_catalog = {"name": catalog_name, "modules": []}
            if current_category:
                if "catalogs" not in current_category:
                    current_category["catalogs"] = []
                current_category["catalogs"].append(current_catalog)
            continue
        elif line_stripped.startswith("###"):
            # Category (e.g., "Fortgeschrittene Experimentalphysik")
            cat_name = line_stripped.lstrip("#").strip()
            current_category = {"name": cat_name, "modules": [], "catalogs": []}
            current_catalog = None
            if current_semester:
                if "categories" not in current_semester:
                    current_semester["categories"] = []
                current_semester["categories"].append(current_category)
            continue
        elif line_stripped.startswith("##"):
            # Semester (e.g., "1. Semester")
            sem_name = line_stripped.lstrip("#").strip()
            current_semester = {"name": sem_name, "modules": [], "categories": []}
            current_category = None
            current_catalog = None
            if current_cluster:
                if "semesters" not in current_cluster:
                    current_cluster["semesters"] = []
                current_cluster["semesters"].append(current_semester)
            continue
        elif line_stripped.startswith("#"):
            # Cluster (e.g., "Grundlagenphase")
            cluster_name = line_stripped.lstrip("#").strip()
            # Check if it's a comment for a module (# PH0041) vs a cluster header
            if re.match(r'^[A-Z]{2,}\d+', cluster_name):
                # It's a commented module line, skip
                continue
            # Check if it's a placeholder like "Wahlkatalog technische Grundlagen"
            # These are inline comments, not clusters
            if not ("phase" in cluster_name.lower() or "abschluss" in cluster_name.lower()):
                # Skip inline comments
                continue
            current_cluster = {"name": cluster_name, "semesters": []}
            current_semester = None
            current_category = None
            current_catalog = None
            clusters.append(current_cluster)
            continue

        # Module Line: CODE\tTitle\tCredits\tSemester
        parts = line_stripped.split('\t')
        if len(parts) >= 2:
            code = parts[0].strip()
            title = parts[1].strip() if len(parts) > 1 else ""
            credits = parts[2].strip() if len(parts) > 2 else ""
            semester = parts[3].strip() if len(parts) > 3 else ""
            
            # Skip non-module codes (e.g., "Wahlmodule")
            if not re.search(r'\d', code):
                continue
                
            module_entry = {"code": code, "title": title, "credits": credits, "semester": semester}
            
            # Add to appropriate container
            if current_catalog:
                current_catalog["modules"].append(module_entry)
            elif current_category:
                current_category["modules"].append(module_entry)
            elif current_semester:
                current_semester["modules"].append(module_entry)
            elif current_cluster:
                # Direct module under cluster (no semester specified)
                if "modules" not in current_cluster:
                    current_cluster["modules"] = []
                current_cluster["modules"].append(module_entry)

    # Build Landscape JSON
    root_id = generate_deterministic_uuid("tum-landscape", "bsc_physik")
    
    landscape = {
        "title": "B.Sc. Physik (TUM)",
        "titleEn": "B.Sc. Physics (TUM)",
        "description": "Curriculum Bachelor Physik an der TU München.",
        "descriptionEn": "Curriculum Bachelor Physics at TU Munich.",
        "landscapeId": root_id,
        "locale": "de-DE",
        "subject": "Physik",
        "frameworkId": "tum-bsc-physik",
        "filters": [{"id": "BSc", "label": "Bachelor Physik"}],
        "goals": []
    }
    
    root_goal = {
        "id": root_id,
        "shortKey": "tum_bsc_physik",
        "title": "B.Sc. Physik",
        "titleEn": "B.Sc. Physics",
        "description": "Gesamtkompetenz des Bachelorstudiengangs Physik.",
        "descriptionEn": "Overall competence of the Bachelor program Physics.",
        "core": True,
        "weight": 10,
        "phase": "Curriculum",
        "area": "Gesamtkompetenz",
        "tags": ["ects:180"],
        "contains": [],
        "requires": []
    }
    
    goals_list = [root_goal]
    
    def add_module_refs(container, parent_contains):
        """Add module UUID references to parent's contains list."""
        for mod in container.get("modules", []):
            mod_id = generate_deterministic_uuid("tum-module", mod["code"])
            if mod_id not in parent_contains:
                parent_contains.append(mod_id)
    
    for ci, cluster in enumerate(clusters):
        cluster_id = generate_deterministic_uuid("tum-cluster", f"bsc_physik_{cluster['name'][:20]}")
        root_goal["contains"].append(cluster_id)
        
        cluster_goal = {
            "id": cluster_id,
            "shortKey": f"tum_bsc_ph_c{ci+1}",
            "title": cluster["name"],
            "titleEn": cluster["name"],
            "description": f"Phase: {cluster['name']}",
            "descriptionEn": f"Phase: {cluster['name']}",
            "core": True,
            "weight": 5,
            "phase": "Bereich",
            "area": "Struktur",
            "contains": [],
            "requires": []
        }
        
        # Direct modules under cluster
        add_module_refs(cluster, cluster_goal["contains"])
        
        # Semesters
        for si, semester in enumerate(cluster.get("semesters", [])):
            sem_id = generate_deterministic_uuid("tum-semester", f"bsc_physik_{cluster['name'][:10]}_{semester['name'][:10]}")
            cluster_goal["contains"].append(sem_id)
            
            # Extract semester number for tag
            sem_num_match = re.search(r'(\d+)', semester["name"])
            sem_num = sem_num_match.group(1) if sem_num_match else str(si+1)
            
            sem_goal = {
                "id": sem_id,
                "shortKey": f"tum_bsc_ph_c{ci+1}_s{sem_num}",
                "title": semester["name"],
                "titleEn": semester["name"].replace("Semester", "Semester"),
                "description": f"Module des {semester['name']} in {cluster['name']}",
                "descriptionEn": f"Modules of {semester['name']} in {cluster['name']}",
                "core": True,
                "weight": 2,
                "phase": "Semester",
                "area": "Struktur",
                "contains": [],
                "requires": [],
                "tags": [f"semester:{sem_num}"]
            }
            
            # Direct modules under semester
            add_module_refs(semester, sem_goal["contains"])
            
            # Categories (e.g., Fortgeschrittene Experimentalphysik)
            for cati, category in enumerate(semester.get("categories", [])):
                cat_id = generate_deterministic_uuid("tum-category", f"bsc_physik_{category['name'][:20]}")
                sem_goal["contains"].append(cat_id)
                
                cat_goal = {
                    "id": cat_id,
                    "shortKey": f"tum_bsc_ph_cat{cati+1}",
                    "title": category["name"],
                    "titleEn": category["name"],
                    "description": f"Wahlbereich: {category['name']}",
                    "descriptionEn": f"Elective area: {category['name']}",
                    "core": False,
                    "weight": 1,
                    "phase": "Wahlbereich",
                    "area": "Struktur",
                    "contains": [],
                    "requires": []
                }
                
                # Direct modules under category
                add_module_refs(category, cat_goal["contains"])
                
                # Catalogs (KTA, KM)
                for catli, catalog in enumerate(category.get("catalogs", [])):
                    catl_id = generate_deterministic_uuid("tum-catalog", f"bsc_physik_{catalog['name'][:20]}")
                    cat_goal["contains"].append(catl_id)
                    
                    catl_goal = {
                        "id": catl_id,
                        "shortKey": f"tum_bsc_ph_catl{catli+1}",
                        "title": catalog["name"],
                        "titleEn": catalog["name"],
                        "description": f"Katalog: {catalog['name']}",
                        "descriptionEn": f"Catalog: {catalog['name']}",
                        "core": False,
                        "weight": 1,
                        "phase": "Katalog",
                        "area": "Struktur",
                        "contains": [],
                        "requires": []
                    }
                    add_module_refs(catalog, catl_goal["contains"])
                    goals_list.append(catl_goal)
                    
                goals_list.append(cat_goal)
            
            goals_list.append(sem_goal)
        
        goals_list.append(cluster_goal)
    
    landscape["goals"] = goals_list
    
    # Save
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(landscape, f, indent=4, ensure_ascii=False)
        
    print(f"Created Physics landscape at {output_file}")
    print(f"Total goals in landscape: {len(goals_list)}")
    
    # Summary
    for cluster in clusters:
        print(f"  Cluster: {cluster['name']}")
        for sem in cluster.get("semesters", []):
            mod_count = len(sem.get("modules", []))
            cat_count = len(sem.get("categories", []))
            print(f"    {sem['name']}: {mod_count} modules, {cat_count} categories")

if __name__ == "__main__":
    main()
