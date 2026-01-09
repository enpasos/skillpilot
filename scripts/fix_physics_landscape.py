import json
import uuid
import sys
from pathlib import Path

def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))

def main():
    base_dir = Path("curricula/DE/BY/TUM/Physics/BSc_Physics/json")
    landscape_path = base_dir / "DE_BAY_U_TUM_BSC_PHYSIK.de.json"
    
    if not landscape_path.exists():
        print(f"Landscape not found at {landscape_path}")
        return

    with open(landscape_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Basic mapping of structure (simplified for repair)
    # We will search specifically for "Grundlagenphase" contents and update them.
    
    # Define the sets of modules for each phase (approximate based on known curriculum)
    # S1-S4
    basics = [
        "PH0001", "PH0002", "PH0003", "PH0004", # Exp Physics
        "PH0005", "PH0006", "PH0007", "PH0008", # Theo Physics
        "MA9201", "MA9202", "MA9203", "MA9204", # Math
        "PH0014", "PH0015", "PH0016", # Labs / Praktika
        "CH1104", "CH0104", # Chemistry (Check input for exact code)
        "CIT513016" # Informatics
    ]
    
    # Check what files actually exist to avoid dead links
    existing_codes = []
    for f in base_dir.glob("DE_BAY_U_TUM_*.de.json"):
        if "BSC_PHYSIK" in f.name: continue
        # Extract code from filename: DE_BAY_U_TUM_{CODE}.de.json
        code = f.name.replace("DE_BAY_U_TUM_", "").replace(".de.json", "")
        existing_codes.append(code)

    print(f"Found {len(existing_codes)} existing module files.")

    # Helper to find node by shortKey
    def find_node(key_suffix):
        for node in data['goals']:
            if node.get('shortKey', '').endswith(key_suffix):
                return node
        return None

    # 1. Update Basics (Grundlagenphase)
    basics_node = find_node("bsc_physik_base")
    if basics_node:
        new_contains = []
        # Add modules from known list if they exist
        for code in basics:
            if code in existing_codes:
                mod_id = generate_deterministic_uuid("tum-module", code)
                if mod_id not in new_contains:
                    new_contains.append(mod_id)
        
        # Also auto-add PH00xx basics if not in list
        for code in existing_codes:
            if code.startswith("PH00"):
                 if int(code[2:]) < 25: # Arbitrary cutoff for basics
                     mod_id = generate_deterministic_uuid("tum-module", code)
                     if mod_id not in new_contains:
                         new_contains.append(mod_id)

        print(f"Updating Basics with {len(new_contains)} modules.")
        basics_node['contains'] = new_contains

    # Write back
    with open(landscape_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print("Landscape updated.")

if __name__ == "__main__":
    main()
