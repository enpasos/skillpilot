#!/usr/bin/env python3
"""
Regenerates module JSONs from raw txt files in input/raw/ directories.
This bypasses the API and uses the pre-scraped data.
"""
import json
import uuid
import re
from pathlib import Path
from typing import Dict, List, Tuple

SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")

def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_raw_file(filepath: Path) -> Dict:
    """Parse a raw module txt file into structured data."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    data = {}
    
    # Code
    match = re.search(r'^code:\s*(.+)$', content, re.MULTILINE)
    data['code'] = match.group(1).strip() if match else ""
    
    # Title (simplified: 'title:' or legacy: 'title_de:')
    match = re.search(r'^title:\s*(.+)$', content, re.MULTILINE)
    if not match:
        match = re.search(r'^title_de:\s*(.+)$', content, re.MULTILINE)
    data['title_de'] = match.group(1).strip() if match else ""
    
    match = re.search(r'^title_en:\s*(.+)$', content, re.MULTILINE)
    data['title_en'] = match.group(1).strip() if match else data['title_de']
    
    # ECTS
    match = re.search(r'^ects:\s*(\d+)', content, re.MULTILINE)
    data['ects'] = match.group(1) if match else "5"
    
    # Content (simplified: 'content:' or legacy: 'content_de:/content_en:')
    content_match = re.search(r'^content:\s*(.*?)(?=^outcomes:|^preconditions:|$)', content, re.MULTILINE | re.DOTALL)
    if not content_match:
        content_match = re.search(r'^content_en:\s*(.*?)(?=^outcomes|^preconditions|$)', content, re.MULTILINE | re.DOTALL)
    if not content_match:
        content_match = re.search(r'^content_de:\s*(.*?)(?=^content_en:|^outcomes|^preconditions|$)', content, re.MULTILINE | re.DOTALL)
    data['content_en'] = clean_text(content_match.group(1)) if content_match else ""
    data['content_de'] = data['content_en']  # Use same for both
    
    # Outcomes (extract list items) - try simplified first, then legacy
    outcomes_match = re.search(r'^outcomes:\s*(.*?)(?=^preconditions:|$)', content, re.MULTILINE | re.DOTALL)
    if not outcomes_match:
        outcomes_match = re.search(r'^outcomes_en:\s*(.*?)(?=^preconditions|$)', content, re.MULTILINE | re.DOTALL)
    if not outcomes_match:
        outcomes_match = re.search(r'^outcomes_de:\s*(.*?)(?=^outcomes_en:|^preconditions|$)', content, re.MULTILINE | re.DOTALL)
    
    data['outcomes'] = []
    if outcomes_match:
        outcomes_text = outcomes_match.group(1)
        # Parse dash-prefixed or numbered items
        items = re.findall(r'-\s*(?:\d+\.\s*)?(.+?)(?=\n-|\n\n|$)', outcomes_text, re.DOTALL)
        data['outcomes'] = [clean_text(item) for item in items if clean_text(item) and len(clean_text(item)) > 10]
    
    # Split content into topics
    content_text = data['content_en'] or data['content_de']
    if content_text:
        # Try dash bullet split (lines starting with -)
        if re.search(r'(?:^|\n)\s*-\s+\w', content_text):
            topics = re.split(r'(?:^|\n)\s*-\s+', content_text)
        else:
            # Fallback to sentence split for long paragraphs
            topics = re.split(r'(?<=[.!?])\s+(?=[A-Z])', content_text)
        data['content_topics'] = [clean_text(t) for t in topics if clean_text(t) and len(clean_text(t)) > 10]
    else:
        data['content_topics'] = []
    
    return data

def create_module_json(data: Dict, output_path: Path):
    """Create a module JSON file from parsed data."""
    code = data['code']
    title = data['title_de'] or data['title_en']
    title_en = data['title_en'] or data['title_de']
    ects = data['ects']
    
    module_id = generate_deterministic_uuid("tum-module", code)
    
    # Build description
    description = data['content_en'] or data['content_de'] or f"Modul {code}"
    
    module_json = {
        "title": f"{title} (TUM, Modul {code})",
        "titleEn": f"{title_en} (TUM, Module {code})",
        "description": description[:2000],  # Limit length
        "descriptionEn": description[:2000],
        "landscapeId": generate_deterministic_uuid("tum-module-landscape", code),
        "locale": "de-DE",
        "subject": "TUM-Module",
        "frameworkId": f"tum-{code.lower()}",
        "goals": []
    }
    
    # Root module goal
    root_goal = {
        "id": module_id,
        "shortKey": f"tum_{code.lower()}_module",
        "title": f"{title} (Modul {code})",
        "titleEn": f"{title_en} (Module {code})",
        "description": description[:1000],
        "descriptionEn": description[:1000],
        "core": True,
        "weight": float(ects),
        "phase": "Modul",
        "area": "Gesamtkompetenz",
        "tags": [f"module:{code}", f"ects:{ects}"],
        "contains": [],
        "requires": [],
        "sourceRef": f"https://academics.nat.tum.de/org/mh/details/mod/{code}"
    }
    
    goals = [root_goal]
    
    # Add learning outcomes
    for i, outcome in enumerate(data['outcomes'], 1):
        outcome_id = generate_deterministic_uuid("tum-outcome", f"{code}_lo{i}")
        root_goal["contains"].append(outcome_id)
        
        goals.append({
            "id": outcome_id,
            "shortKey": f"tum_{code.lower()}_lo{i}",
            "title": outcome[:80] if len(outcome) > 80 else outcome,
            "titleEn": "Learning Outcome",
            "description": outcome,
            "descriptionEn": outcome,
            "core": True,
            "weight": 0.0,
            "phase": "Modul",
            "area": "Kompetenz",
            "tags": [f"module:{code}"],
            "contains": [],
            "requires": []
        })
    
    # Add content topics as "Wissen" goals
    for i, topic in enumerate(data['content_topics'], 1):
        topic_id = generate_deterministic_uuid("tum-content", f"{code}_ct{i}")
        root_goal["contains"].append(topic_id)
        
        goals.append({
            "id": topic_id,
            "shortKey": f"tum_{code.lower()}_ct{i}",
            "title": topic[:80] if len(topic) > 80 else topic,
            "titleEn": topic[:80] if len(topic) > 80 else topic,
            "description": topic,
            "descriptionEn": topic,
            "core": False,
            "weight": 0.0,
            "phase": "Modul",
            "area": "Wissen",
            "tags": [f"module:{code}"],
            "contains": [],
            "requires": []
        })
    
    module_json["goals"] = goals
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(module_json, f, indent=4, ensure_ascii=False)
    
    return len(goals)

def main():
    import sys
    
    if len(sys.argv) > 1:
        base_dir = Path(sys.argv[1])
    else:
        base_dir = Path("curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST")
    
    raw_dir = base_dir / "input" / "raw"
    json_dir = base_dir / "json"
    
    if not raw_dir.exists():
        print(f"Raw directory not found: {raw_dir}")
        return
    
    json_dir.mkdir(exist_ok=True, parents=True)
    
    total = 0
    for raw_file in sorted(raw_dir.glob("DE_BAY_U_TUM_*.txt")):
        code = raw_file.stem.replace("DE_BAY_U_TUM_", "")
        output_file = json_dir / f"DE_BAY_U_TUM_{code}.de.json"
        
        try:
            data = parse_raw_file(raw_file)
            node_count = create_module_json(data, output_file)
            print(f"[OK] {code}: {node_count} nodes ({len(data['outcomes'])} outcomes, {len(data['content_topics'])} topics)")
            total += 1
        except Exception as e:
            print(f"[ERROR] {code}: {e}")
    
    print(f"\nRegenerated {total} modules from raw files.")

if __name__ == "__main__":
    main()
