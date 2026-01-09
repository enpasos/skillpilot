import json
import uuid
import glob
import os
from pathlib import Path

def generate_uuid(name):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, name))

def bundle_qst():
    base_dir = Path("curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json")
    output_file = base_dir / "DE_BAY_U_TUM_MSC_QST.de.json"
    
    modules = []
    
    # Read all module JSONs
    for file_path in base_dir.glob("DE_BAY_U_TUM_*.de.json"):
        if file_path.name == "DE_BAY_U_TUM_MSC_QST.de.json":
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Assuming the first goal is the main module goal
            if 'goals' in data and len(data['goals']) > 0:
                modules.append(data['goals'][0]['id'])

    # Create the Program Structure
    program_id = generate_uuid("tum-msc-qst-program")
    catalog_id = generate_uuid("tum-msc-qst-modules")
    
    structure = {
        "title": "Master Quantum Science and Technology (DE, BY, TUM)",
        "titleEn": "Master Quantum Science and Technology (DE, BY, TUM)",
        "description": "Masterstudiengang QST an der TUM.",
        "descriptionEn": "Master program QST at TUM.",
        "landscapeId": generate_uuid("tum-msc-qst-landscape"),
        "locale": "de-DE",
        "subject": "QST",
        "frameworkId": "tum-msc-qst",
        "goals": [
            {
                "id": program_id,
                "shortKey": "msc_qst_program",
                "title": "M.Sc. QST - Gesamtstudiengang",
                "titleEn": "M.Sc. QST - Full Program",
                "description": "Gesamtstudiengang Quantum Science and Technology.",
                "descriptionEn": "Full program Quantum Science and Technology.",
                "core": True,
                "weight": 120,
                "phase": "Programm",
                "area": "Gesamt",
                "tags": ["program:msc_qst", "level:master"],
                "contains": modules,
                "requires": []
            }
        ]
    }
    
    # Physics JSON had `dimensionTags` which seem important for the UI grouping.
    # I will add simple ones.
    for goal in structure['goals']:
        goal['dimensionTags'] = {
            "framework": "tum-msc-qst",
            "phase": goal['phase'],
            "area": goal['area'],
            "topicCode": goal['shortKey']
        }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structure, f, indent=4, ensure_ascii=False)
    
    print(f"Generated {output_file} with {len(modules)} modules.")

if __name__ == "__main__":
    bundle_qst()
