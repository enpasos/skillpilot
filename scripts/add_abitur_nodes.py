#!/usr/bin/env python3
"""
Adds Abiturprüfung (LK and GK) nodes to the Hessen Mathematics curriculum.
"""
import json
import uuid
import re
from pathlib import Path
from hessen_upper_secondary_paths import (
    resolve_hessen_upper_secondary_abi_directory,
    resolve_hessen_upper_secondary_landscape_path,
)

def generate_uuid(seed: str) -> str:
    """Generate deterministic UUID from seed string."""
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"hessen-abi-math-{seed}"))

def extract_tasks_from_markdown(file_path: Path) -> dict:
    """
    Extracts tasks from the given Markdown file.
    Returns a dictionary mapping task IDs (e.g., 'A1', 'B1', 'C', 'D') to their full description text.
    """
    if not file_path.exists():
        print(f"Error: Markdown file not found at {file_path}")
        return {}

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    tasks = {}
    
    # Regex to find task headers like "### A1 ..." or "## B1 ..."
    # We capture the identifier (A1, B1, C, etc.)
    # and then capture everything until the next '---' or end of string.
    
    # Pattern explanation:
    # ^#{2,3}\s+       : Starts with ## or ### and whitespace
    # ([A-Z][0-9]?)    : Group 1: The ID (A1, A10, B1, C, D)
    # .*?\n            : Rest of the header line
    # (.*?)            : Group 2: The content (non-greedy)
    # (?=\n---|$)      : Lookahead for next separator or end of file
    
    pattern = re.compile(r'^#{2,3}\s+([A-Z][0-9]*)\s.*?\n(.*?)(?=\n---|\Z)', re.DOTALL | re.MULTILINE)
    
    for match in pattern.finditer(content):
        task_id = match.group(1)
        task_text = match.group(2).strip()
        tasks[task_id] = task_text

    return tasks

def main():
    base_path = resolve_hessen_upper_secondary_abi_directory("math")
    json_path = resolve_hessen_upper_secondary_landscape_path("math")
    
    # Parse Markdown files
    lk_file = base_path / "abi_2026_mathe_lk.md"
    gk_file = base_path / "abi_2026_mathe_gk.md"
    
    print(f"Reading LK tasks from {lk_file}")
    lk_tasks = extract_tasks_from_markdown(lk_file)
    print(f"Found LK tasks: {list(lk_tasks.keys())}")
    
    print(f"Reading GK tasks from {gk_file}")
    gk_tasks = extract_tasks_from_markdown(gk_file)
    print(f"Found GK tasks: {list(gk_tasks.keys())}")

    # Helper to safely get task text
    def get_task_text(tasks, task_id):
        if task_id not in tasks:
            print(f"Warning: Task {task_id} not found in source markdown.")
            return "Aufgabentext konnte nicht geladen werden."
        return tasks[task_id]

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # IDs for prerequisites (Q1-Q4 overview nodes)
    q1_id = "31be9ac9-f1af-4ce6-9856-41d2ec65e9aa"  # Q1 Analysis
    q2_id = "5079ea22-57d1-483b-b9cc-5bebefb77dbc"  # Q2 Linalg/AG
    q3_id = "4ab18312-0b43-461d-9154-3fba277baae7"  # Q3 Stochastik
    q4_id = "031b5000-16bb-430a-9c11-cb625f228bf4"  # Q4 Vertiefung
    root_id = "ccf9569b-b0e4-4d76-98d5-65be461d4d76"  # Root math_go
    
    # Generate new IDs
    abi_lk_id = generate_uuid("abi_lk")
    abi_gk_id = generate_uuid("abi_gk")
    
    # Teil 1 IDs
    lk_t1_id = generate_uuid("lk_t1")
    gk_t1_id = generate_uuid("gk_t1")
    
    # Teil 2 IDs
    lk_t2_id = generate_uuid("lk_t2")
    gk_t2_id = generate_uuid("gk_t2")
    
    # Aufgabentyp IDs for LK
    lk_t1_ana_n1_id = generate_uuid("lk_t1_ana_n1")
    lk_t1_ana_n2_id = generate_uuid("lk_t1_ana_n2")
    lk_t1_la_n1_id = generate_uuid("lk_t1_la_n1")
    lk_t1_la_n2_id = generate_uuid("lk_t1_la_n2")
    lk_t1_sto_n1_id = generate_uuid("lk_t1_sto_n1")
    lk_t1_sto_n2_id = generate_uuid("lk_t1_sto_n2")
    lk_t2_ana_id = generate_uuid("lk_t2_ana")
    lk_t2_la_id = generate_uuid("lk_t2_la")
    lk_t2_sto_id = generate_uuid("lk_t2_sto")
    
    # Aufgabentyp IDs for GK
    gk_t1_ana_n1_id = generate_uuid("gk_t1_ana_n1")
    gk_t1_ana_n2_id = generate_uuid("gk_t1_ana_n2")
    gk_t1_la_n1_id = generate_uuid("gk_t1_la_n1")
    gk_t1_la_n2_id = generate_uuid("gk_t1_la_n2")
    gk_t1_sto_n1_id = generate_uuid("gk_t1_sto_n1")
    gk_t1_sto_n2_id = generate_uuid("gk_t1_sto_n2")
    gk_t2_ana_id = generate_uuid("gk_t2_ana")
    gk_t2_la_id = generate_uuid("gk_t2_la")
    gk_t2_sto_id = generate_uuid("gk_t2_sto")
    
    new_goals = [
        # ============= ABITUR LK =============
        {
            "id": abi_lk_id,
            "shortKey": "abi_lk",
            "title": "Abiturprüfung Mathematik (LK)",
            "titleEn": "Abitur Exam Mathematics (Advanced Course)",
            "description": "Der Lernende kann die schriftliche Abiturprüfung Mathematik im Leistungskurs (100 BE) erfolgreich ablegen. Dies umfasst Teil 1 (hilfsmittelfrei, 30 BE) und Teil 2 (mit WTR/CAS, 70 BE).",
            "descriptionEn": "The learner can successfully complete the written Abitur exam in Mathematics at advanced level (100 BE). This includes Part 1 (without aids, 30 BE) and Part 2 (with calculator, 70 BE).",
            "core": True,
            "weight": 3.0,
            "tags": ["LK"],
            "contains": [lk_t1_id, lk_t2_id],
            "requires": [q1_id, q2_id, q3_id, q4_id],
            "examples": [],
            "dimensionTags": {
                "framework": "hessen-kc-2024",
                "demandLevel": "AB3",
                "phase": "Abitur",
                "area": "Prüfung",
                "topicCode": "ABI"
            },
            "sourceRef": "Landesabitur 2026, Hinweise Kap. 19"
        },
        
        # LK Teil 1
        {
            "id": lk_t1_id,
            "shortKey": "abi_lk_t1",
            "title": "Teil 1: Hilfsmittelfrei (LK)",
            "titleEn": "Part 1: Without Aids (LK)",
            "description": "Prüfungsteil 1 (30 BE): 6 Aufgaben à 5 BE – 4 Pflichtaufgaben Niveau 1 + 2 Wahlaufgaben Niveau 2.",
            "descriptionEn": "Exam Part 1 (30 BE): 6 tasks à 5 BE – 4 mandatory tasks level 1 + 2 choice tasks level 2.",
            "core": True,
            "weight": 2.0,
            "tags": ["LK"],
            "contains": [lk_t1_ana_n1_id, lk_t1_ana_n2_id, lk_t1_la_n1_id, lk_t1_la_n2_id, lk_t1_sto_n1_id, lk_t1_sto_n2_id],
            "requires": [],
            "examples": [],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Teil1"}
        },
        
        # LK Teil 1 - Analysis Niveau 1
        {
            "id": lk_t1_ana_n1_id,
            "shortKey": "abi_lk_t1_ana_n1",
            "title": "Analysis (Niveau 1, hilfsmittelfrei)",
            "titleEn": "Analysis (Level 1, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 1, Niveau 1 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'A1')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 1, Level 1 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["LK"],
            "contains": [],
            "requires": [q1_id],
            "examples": ["ABI_LK_A1", "ABI_LK_A2"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Analysis", "demandLevel": "AB1"}
        },
        
        # LK Teil 1 - Analysis Niveau 2
        {
            "id": lk_t1_ana_n2_id,
            "shortKey": "abi_lk_t1_ana_n2",
            "title": "Analysis (Niveau 2, hilfsmittelfrei)",
            "titleEn": "Analysis (Level 2, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 1, Niveau 2 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'A5')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 1, Level 2 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["LK"],
            "contains": [],
            "requires": [q1_id, q4_id],
            "examples": ["ABI_LK_A5", "ABI_LK_A6"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Analysis", "demandLevel": "AB2"}
        },
        
        # LK Teil 1 - LA/AG Niveau 1
        {
            "id": lk_t1_la_n1_id,
            "shortKey": "abi_lk_t1_la_n1",
            "title": "Lineare Algebra/Geometrie (Niveau 1, hilfsmittelfrei)",
            "titleEn": "Linear Algebra/Geometry (Level 1, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 1, Niveau 1 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'A3')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 1, Level 1 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["LK"],
            "contains": [],
            "requires": [q2_id],
            "examples": ["ABI_LK_A3"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "LA/AG", "demandLevel": "AB1"}
        },
        
        # LK Teil 1 - LA/AG Niveau 2
        {
            "id": lk_t1_la_n2_id,
            "shortKey": "abi_lk_t1_la_n2",
            "title": "Lineare Algebra/Geometrie (Niveau 2, hilfsmittelfrei)",
            "titleEn": "Linear Algebra/Geometry (Level 2, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 1, Niveau 2 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'A7')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 1, Level 2 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["LK"],
            "contains": [],
            "requires": [q2_id],
            "examples": ["ABI_LK_A7", "ABI_LK_A8"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "LA/AG", "demandLevel": "AB2"}
        },
        
        # LK Teil 1 - Stochastik Niveau 1
        {
            "id": lk_t1_sto_n1_id,
            "shortKey": "abi_lk_t1_sto_n1",
            "title": "Stochastik (Niveau 1, hilfsmittelfrei)",
            "titleEn": "Stochastics (Level 1, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 1, Niveau 1 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'A4')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 1, Level 1 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["LK"],
            "contains": [],
            "requires": [q3_id],
            "examples": ["ABI_LK_A4"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Stochastik", "demandLevel": "AB1"}
        },
        
        # LK Teil 1 - Stochastik Niveau 2
        {
            "id": lk_t1_sto_n2_id,
            "shortKey": "abi_lk_t1_sto_n2",
            "title": "Stochastik (Niveau 2, hilfsmittelfrei)",
            "titleEn": "Stochastics (Level 2, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 1, Niveau 2 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'A10')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 1, Level 2 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["LK"],
            "contains": [],
            "requires": [q3_id],
            "examples": ["ABI_LK_A9", "ABI_LK_A10"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Stochastik", "demandLevel": "AB2"}
        },
        
        # LK Teil 2
        {
            "id": lk_t2_id,
            "shortKey": "abi_lk_t2",
            "title": "Teil 2: Mit Hilfsmitteln (LK)",
            "titleEn": "Part 2: With Aids (LK)",
            "description": "Prüfungsteil 2 (70 BE): Analysis B (30 BE, Wahl), LA/AG C (20 BE, Pflicht), Stochastik D (20 BE, Pflicht). WTR/CAS erlaubt.",
            "descriptionEn": "Exam Part 2 (70 BE): Analysis B (30 BE, choice), LA/AG C (20 BE, mandatory), Stochastics D (20 BE, mandatory). Calculator allowed.",
            "core": True,
            "weight": 2.0,
            "tags": ["LK"],
            "contains": [lk_t2_ana_id, lk_t2_la_id, lk_t2_sto_id],
            "requires": [],
            "examples": [],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Teil2"}
        },
        
        # LK Teil 2 - Analysis
        {
            "id": lk_t2_ana_id,
            "shortKey": "abi_lk_t2_ana",
            "title": "Analysis B (mit Hilfsmitteln, 30 BE)",
            "titleEn": "Analysis B (with aids, 30 BE)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 2 (30 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'B1')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 2 (30 BE)**.",
            "core": True,
            "weight": 1.5,
            "tags": ["LK"],
            "contains": [],
            "requires": [q1_id, q4_id],
            "examples": ["ABI_LK_B1", "ABI_LK_B2"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Analysis", "demandLevel": "AB3"}
        },
        
        # LK Teil 2 - LA/AG
        {
            "id": lk_t2_la_id,
            "shortKey": "abi_lk_t2_la",
            "title": "Lineare Algebra/Geometrie C (mit Hilfsmitteln, 20 BE)",
            "titleEn": "Linear Algebra/Geometry C (with aids, 20 BE)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 2 (20 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'C')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 2 (20 BE)**.",
            "core": True,
            "weight": 1.5,
            "tags": ["LK"],
            "contains": [],
            "requires": [q2_id],
            "examples": ["ABI_LK_C"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "LA/AG", "demandLevel": "AB3"}
        },
        
        # LK Teil 2 - Stochastik
        {
            "id": lk_t2_sto_id,
            "shortKey": "abi_lk_t2_sto",
            "title": "Stochastik D (mit Hilfsmitteln, 20 BE)",
            "titleEn": "Stochastics D (with aids, 20 BE)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 2 (20 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(lk_tasks, 'D')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 2 (20 BE)**.",
            "core": True,
            "weight": 1.5,
            "tags": ["LK"],
            "contains": [],
            "requires": [q3_id],
            "examples": ["ABI_LK_D"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Stochastik", "demandLevel": "AB3"}
        },
        
        # ============= ABITUR GK =============
        {
            "id": abi_gk_id,
            "shortKey": "abi_gk",
            "title": "Abiturprüfung Mathematik (GK)",
            "titleEn": "Abitur Exam Mathematics (Basic Course)",
            "description": "Der Lernende kann die schriftliche Abiturprüfung Mathematik im Grundkurs (80 BE) erfolgreich ablegen. Dies umfasst Teil 1 (hilfsmittelfrei, 25 BE) und Teil 2 (mit WTR/CAS, 55 BE).",
            "descriptionEn": "The learner can successfully complete the written Abitur exam in Mathematics at basic level (80 BE). This includes Part 1 (without aids, 25 BE) and Part 2 (with calculator, 55 BE).",
            "core": True,
            "weight": 3.0,
            "tags": ["GK"],
            "contains": [gk_t1_id, gk_t2_id],
            "requires": [q1_id, q2_id, q3_id, q4_id],
            "examples": [],
            "dimensionTags": {
                "framework": "hessen-kc-2024",
                "demandLevel": "AB2",
                "phase": "Abitur",
                "area": "Prüfung",
                "topicCode": "ABI"
            },
            "sourceRef": "Landesabitur 2026, Hinweise Kap. 19"
        },
        
        # GK Teil 1
        {
            "id": gk_t1_id,
            "shortKey": "abi_gk_t1",
            "title": "Teil 1: Hilfsmittelfrei (GK)",
            "titleEn": "Part 1: Without Aids (GK)",
            "description": "Prüfungsteil 1 (25 BE): 5 Aufgaben à 5 BE – 3 Pflichtaufgaben Niveau 1 + 1 Wahlaufgabe Niveau 1 + 1 Wahlaufgabe Niveau 2.",
            "descriptionEn": "Exam Part 1 (25 BE): 5 tasks à 5 BE – 3 mandatory level 1 + 1 choice level 1 + 1 choice level 2.",
            "core": True,
            "weight": 2.0,
            "tags": ["GK"],
            "contains": [gk_t1_ana_n1_id, gk_t1_ana_n2_id, gk_t1_la_n1_id, gk_t1_la_n2_id, gk_t1_sto_n1_id, gk_t1_sto_n2_id],
            "requires": [],
            "examples": [],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Teil1"}
        },
        
        # GK Teil 1 - Analysis Niveau 1
        {
            "id": gk_t1_ana_n1_id,
            "shortKey": "abi_gk_t1_ana_n1",
            "title": "Analysis (Niveau 1, hilfsmittelfrei)",
            "titleEn": "Analysis (Level 1, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 1, Niveau 1 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'A1')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 1, Level 1 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["GK"],
            "contains": [],
            "requires": [q1_id],
            "examples": ["ABI_GK_A1", "ABI_GK_A4"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Analysis", "demandLevel": "AB1"}
        },
        
        # GK Teil 1 - Analysis Niveau 2
        {
            "id": gk_t1_ana_n2_id,
            "shortKey": "abi_gk_t1_ana_n2",
            "title": "Analysis (Niveau 2, hilfsmittelfrei)",
            "titleEn": "Analysis (Level 2, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 1, Niveau 2 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'A7')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 1, Level 2 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["GK"],
            "contains": [],
            "requires": [q1_id, q4_id],
            "examples": ["ABI_GK_A7"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Analysis", "demandLevel": "AB2"}
        },
        
        # GK Teil 1 - LA/AG Niveau 1
        {
            "id": gk_t1_la_n1_id,
            "shortKey": "abi_gk_t1_la_n1",
            "title": "Lineare Algebra/Geometrie (Niveau 1, hilfsmittelfrei)",
            "titleEn": "Linear Algebra/Geometry (Level 1, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 1, Niveau 1 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'A2')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 1, Level 1 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["GK"],
            "contains": [],
            "requires": [q2_id],
            "examples": ["ABI_GK_A2", "ABI_GK_A5"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "LA/AG", "demandLevel": "AB1"}
        },
        
        # GK Teil 1 - LA/AG Niveau 2
        {
            "id": gk_t1_la_n2_id,
            "shortKey": "abi_gk_t1_la_n2",
            "title": "Lineare Algebra/Geometrie (Niveau 2, hilfsmittelfrei)",
            "titleEn": "Linear Algebra/Geometry (Level 2, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 1, Niveau 2 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'A8')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 1, Level 2 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["GK"],
            "contains": [],
            "requires": [q2_id],
            "examples": ["ABI_GK_A8"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "LA/AG", "demandLevel": "AB2"}
        },
        
        # GK Teil 1 - Stochastik Niveau 1
        {
            "id": gk_t1_sto_n1_id,
            "shortKey": "abi_gk_t1_sto_n1",
            "title": "Stochastik (Niveau 1, hilfsmittelfrei)",
            "titleEn": "Stochastics (Level 1, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 1, Niveau 1 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'A3')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 1, Level 1 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["GK"],
            "contains": [],
            "requires": [q3_id],
            "examples": ["ABI_GK_A3", "ABI_GK_A6"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Stochastik", "demandLevel": "AB1"}
        },
        
        # GK Teil 1 - Stochastik Niveau 2
        {
            "id": gk_t1_sto_n2_id,
            "shortKey": "abi_gk_t1_sto_n2",
            "title": "Stochastik (Niveau 2, hilfsmittelfrei)",
            "titleEn": "Stochastics (Level 2, without aids)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 1, Niveau 2 (5 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'A9')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 1, Level 2 (5 BE)**.",
            "core": True,
            "weight": 1.0,
            "tags": ["GK"],
            "contains": [],
            "requires": [q3_id],
            "examples": ["ABI_GK_A9"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Stochastik", "demandLevel": "AB2"}
        },
        
        # GK Teil 2
        {
            "id": gk_t2_id,
            "shortKey": "abi_gk_t2",
            "title": "Teil 2: Mit Hilfsmitteln (GK)",
            "titleEn": "Part 2: With Aids (GK)",
            "description": "Prüfungsteil 2 (55 BE): Analysis B (25 BE, Wahl), LA/AG C (15 BE, Pflicht), Stochastik D (15 BE, Pflicht). WTR/CAS erlaubt.",
            "descriptionEn": "Exam Part 2 (55 BE): Analysis B (25 BE, choice), LA/AG C (15 BE, mandatory), Stochastics D (15 BE, mandatory). Calculator allowed.",
            "core": True,
            "weight": 2.0,
            "tags": ["GK"],
            "contains": [gk_t2_ana_id, gk_t2_la_id, gk_t2_sto_id],
            "requires": [],
            "examples": [],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Teil2"}
        },
        
        # GK Teil 2 - Analysis
        {
            "id": gk_t2_ana_id,
            "shortKey": "abi_gk_t2_ana",
            "title": "Analysis B (mit Hilfsmitteln, 25 BE)",
            "titleEn": "Analysis B (with aids, 25 BE)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 2 (25 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'B1')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 2 (25 BE)**.",
            "core": True,
            "weight": 1.5,
            "tags": ["GK"],
            "contains": [],
            "requires": [q1_id, q4_id],
            "examples": ["ABI_GK_B1", "ABI_GK_B2"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Analysis", "demandLevel": "AB2"}
        },
        
        # GK Teil 2 - LA/AG
        {
            "id": gk_t2_la_id,
            "shortKey": "abi_gk_t2_la",
            "title": "Lineare Algebra/Geometrie C (mit Hilfsmitteln, 15 BE)",
            "titleEn": "Linear Algebra/Geometry C (with aids, 15 BE)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 2 (15 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'C')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 2 (15 BE)**.",
            "core": True,
            "weight": 1.5,
            "tags": ["GK"],
            "contains": [],
            "requires": [q2_id],
            "examples": ["ABI_GK_C"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "LA/AG", "demandLevel": "AB2"}
        },
        
        # GK Teil 2 - Stochastik
        {
            "id": gk_t2_sto_id,
            "shortKey": "abi_gk_t2_sto",
            "title": "Stochastik D (mit Hilfsmitteln, 15 BE)",
            "titleEn": "Stochastics D (with aids, 15 BE)",
            "description": f"Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 2 (15 BE)**. Ein Beispiel für eine solche Aufgabe ist:\n\n{get_task_text(gk_tasks, 'D')}",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 2 (15 BE)**.",
            "core": True,
            "weight": 1.5,
            "tags": ["GK"],
            "contains": [],
            "requires": [q3_id],
            "examples": ["ABI_GK_D"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Stochastik", "demandLevel": "AB2"}
        }
    ]
    
    # IDEMPOTENCY FIX: Remove any existing goals that have IDs we are about to add
    new_goal_ids = {g["id"] for g in new_goals}
    original_count = len(data["goals"])
    
    # Filter out any goals that have an ID present in our new set
    data["goals"] = [g for g in data["goals"] if g["id"] not in new_goal_ids]
    
    removed_count = original_count - len(data["goals"])
    if removed_count > 0:
        print(f"Removed {removed_count} existing/duplicate goals to prevent collisions.")

    # Add new goals to the end
    data["goals"].extend(new_goals)
    
    # Add Abitur nodes to root goal's contains array
    for goal in data["goals"]:
        if goal["id"] == root_id:
            # We don't need to check for existence because "contains" is a list.
            # But we should avoid duplicate IDs in "contains".
            # Let's clean up contains first.
            
            # Remove any of our new IDs from existing contains to avoid duplicates if specific ones were there
            # (Though currently we only add abi_lk_id and abi_gk_id)
            goal["contains"] = [cid for cid in goal["contains"] if cid not in [abi_lk_id, abi_gk_id]]
            
            # Add them back
            goal["contains"].append(abi_lk_id)
            goal["contains"].append(abi_gk_id)
            break
            
    # Save
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Added {len(new_goals)} Abiturprüfung goals to {json_path.name}")
    print(f"- Abitur LK: {abi_lk_id}")
    print(f"- Abitur GK: {abi_gk_id}")

if __name__ == "__main__":
    main()
