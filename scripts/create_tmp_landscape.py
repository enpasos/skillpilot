#!/usr/bin/env python3
"""
Creates/updates the TMP Master landscape JSON to include all modules from the json folder.
"""
import json
import uuid
from pathlib import Path

SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")

def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))

def main():
    base_dir = Path("curricula/DE/BY/TUM/Physics/MSc_TMP")
    json_dir = base_dir / "json"
    output_file = json_dir / "DE_BAY_U_TUM_TMP_MASTER.de.json"
    
    # Collect all module root IDs
    module_ids = []
    for file_path in sorted(json_dir.glob("DE_BAY_U_TUM_*.de.json")):
        if "TMP_MASTER" in file_path.name:
            continue
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for goal in data.get('goals', []):
                if goal.get('shortKey', '').endswith('_module'):
                    module_ids.append(goal['id'])
                    break
        except:
            pass
    
    root_id = generate_deterministic_uuid("tum-landscape", "msc_tmp")
    
    landscape = {
        "title": "M.Sc. Theoretische und Mathematische Physik (TUM)",
        "titleEn": "M.Sc. Theoretical and Mathematical Physics (TUM)",
        "description": "Curriculum Master TMP an der TU München.",
        "descriptionEn": "Curriculum Master TMP at TU Munich.",
        "landscapeId": root_id,
        "locale": "de-DE",
        "subject": "Theoretische und Mathematische Physik",
        "frameworkId": "tum-msc-tmp",
        "filters": [{"id": "MSc", "label": "Master TMP"}],
        "goals": [{
            "id": root_id,
            "shortKey": "tum_msc_tmp",
            "title": "M.Sc. Theoretische und Mathematische Physik",
            "titleEn": "M.Sc. Theoretical and Mathematical Physics",
            "description": "Gesamtkompetenz des Masterstudiengangs TMP.",
            "descriptionEn": "Overall competence of the Master program TMP.",
            "core": True,
            "weight": 10,
            "phase": "Curriculum",
            "area": "Gesamtkompetenz",
            "tags": ["ects:120", "level:master"],
            "contains": module_ids,
            "requires": []
        }]
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(landscape, f, indent=4, ensure_ascii=False)
        
    print(f"Created TMP landscape with {len(module_ids)} modules at {output_file}")

if __name__ == "__main__":
    main()
