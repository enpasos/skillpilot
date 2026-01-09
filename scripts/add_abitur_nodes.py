#!/usr/bin/env python3
"""
Adds Abiturprüfung (LK and GK) nodes to the Hessen Mathematics curriculum.
"""
import json
import uuid
from pathlib import Path

def generate_uuid(seed: str) -> str:
    """Generate deterministic UUID from seed string."""
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"hessen-abi-math-{seed}"))

def main():
    json_path = Path("curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json")
    
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 1, Niveau 1 (5 BE)** – Ableitungen bestimmen, Tangentengleichungen aufstellen, bestimmte Integrale berechnen. Ein Beispiel für eine solche Aufgabe ist: Gegeben ist f(x)=x³-2x. a) Bestimme f'(x). (2 BE) b) Bestimme die Gleichung der Tangente an f im Punkt x=1. (3 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 1, Level 1 (5 BE)** – determine derivatives, set up tangent equations, calculate definite integrals.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 1, Niveau 2 (5 BE)** – Grenzwerte untersuchen, Funktionenscharen analysieren, Modellierungsaufgaben. Ein Beispiel für eine solche Aufgabe ist: Untersuche den Grenzwert lim_{x→∞}(ln(x)-ln(x+1)) und deute das Ergebnis. (5 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 1, Level 2 (5 BE)** – investigate limits, analyze function families, modelling tasks.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 1, Niveau 1 (5 BE)** – Geraden auf Parallelität prüfen, Abstände berechnen. Ein Beispiel für eine solche Aufgabe ist: Gegeben sind die Geraden g und h. a) Begründe, dass g∥h gilt. (3 BE) b) Bestimme den Abstand der Geraden. (2 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 1, Level 1 (5 BE)** – check lines for parallelism, calculate distances.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 1, Niveau 2 (5 BE)** – Winkel zwischen Ebenen, Schnittgeraden, Markov-Prozesse. Ein Beispiel für eine solche Aufgabe ist: Gegeben sind die Ebenen E₁: x+2y-z=3 und E₂: 2x-y+2z=4. a) Bestimme den Winkel zwischen E₁ und E₂. (3 BE) b) Bestimme eine Gleichung der Schnittgeraden. (2 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 1, Level 2 (5 BE)** – angles between planes, intersection lines, Markov processes.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 1, Niveau 1 (5 BE)** – Bedingte Wahrscheinlichkeiten, Sensitivität/Spezifität. Ein Beispiel für eine solche Aufgabe ist: Ein Test hat Sensitivität 0,95 und Spezifität 0,90. In einer Population sind 2% tatsächlich krank. a) Bestimme P(positiv). (3 BE) b) Bestimme P(krank|positiv). (2 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 1, Level 1 (5 BE)** – conditional probabilities, sensitivity/specificity.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 1, Niveau 2 (5 BE)** – Hypothesentests, Argumentieren mit Gegenbeispielen. Ein Beispiel für eine solche Aufgabe ist: Behauptung: „Wenn zwei Ereignisse die gleiche Wahrscheinlichkeit haben, sind sie unabhängig." Widerlege die Behauptung durch ein Gegenbeispiel mit kurzer Begründung. (5 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 1, Level 2 (5 BE)** – hypothesis tests, reasoning with counterexamples.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 2 (30 BE)** – Kurvendiskussion, Integralrechnung, Grenzwerte, Parameterbestimmung, WTR/CAS-Dokumentation. Ein Beispiel für eine solche Aufgabe ist: Gegeben ist f(x)=x·e^(-0,5x). a) Bestimme f'(x) und den Ort des Maximums. b) Berechne die Fläche A=∫₀⁶ f(x)dx. c) Bestimme lim_{x→∞} f(x). d) WTR/CAS: Bestimme näherungsweise x mit ∫₀ˣ f(t)dt = 1,5.",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 2 (30 BE)** – curve analysis, integral calculus, limits, parameter determination, calculator documentation.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 2 (20 BE)** – Ebenengleichungen, Lagebeziehungen, Winkel, Markov-Prozesse, Fixvektoren. Ein Beispiel für eine solche Aufgabe ist: Gegeben sind A(1,2,0), B(5,2,2), C(1,6,2). a) Bestimme eine Koordinatenform der Ebene E. b) Untersuche die Lage einer Geraden g zu E. c) Bestimme einen Fixvektor für eine Übergangsmatrix M.",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 2 (20 BE)** – plane equations, position relations, angles, Markov processes, fixed vectors.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 2 (20 BE)** – Hypothesentest mit Ablehnungsbereich (WTR/CAS), Fehler 1./2. Art, Normalverteilung inkl. inverse Fragestellung. Ein Beispiel für eine solche Aufgabe ist: Ein Hersteller behauptet Ausschussanteil p≤0,03. Stichprobe n=200, beobachtet x=11. a) Formuliere H₀ und H₁. b) WTR/CAS: Bestimme den Ablehnungsbereich für α=5%. c) Erkläre Fehler 1. und 2. Art. d) Bestimme P(46≤Y≤58) für Y~N(50,4) und c mit P(Y≤c)=0,95.",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 2 (20 BE)** – hypothesis test with rejection region (calculator), type I/II errors, normal distribution including inverse questions.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 1, Niveau 1 (5 BE)** – Funktionswerte berechnen, Nullstellen bestimmen, Ableitungen. Ein Beispiel für eine solche Aufgabe ist: Gegeben ist die Funktion f(x)=2x-1. a) Berechne f(3) und f(-2). (2 BE) b) Bestimme die Nullstelle von f. (3 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 1, Level 1 (5 BE)** – calculate function values, determine zeros, derivatives.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 1, Niveau 2 (5 BE)** – Extremwertaufgaben, Modellierung. Ein Beispiel für eine solche Aufgabe ist: Ein Rechteck hat Umfang 40 cm. a) Stelle die Fläche A(x) als Funktion einer Seitenlänge x auf. (2 BE) b) Bestimme die Seitenlängen mit maximaler Fläche und begründe kurz. (3 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 1, Level 2 (5 BE)** – optimization problems, modelling.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 1, Niveau 1 (5 BE)** – Richtungsvektoren, Geradengleichungen, Normalenvektoren. Ein Beispiel für eine solche Aufgabe ist: Gegeben sind die Punkte A(1,2,0) und B(5,0,2). a) Bestimme den Richtungsvektor AB. (2 BE) b) Gib eine Parametergleichung der Geraden g durch A und B an. (3 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 1, Level 1 (5 BE)** – direction vectors, line equations, normal vectors.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 1, Niveau 2 (5 BE)** – Parallelität prüfen, Winkel zwischen Richtungsvektoren. Ein Beispiel für eine solche Aufgabe ist: Gegeben sind die Geraden g und h. a) Untersuche, ob g und h parallel sind. (3 BE) b) Bestimme den Winkel zwischen den Richtungsvektoren. (2 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 1, Level 2 (5 BE)** – check parallelism, angles between direction vectors.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 1, Niveau 1 (5 BE)** – Wahrscheinlichkeiten bei Urnenexperimenten, Binomialverteilung. Ein Beispiel für eine solche Aufgabe ist: In einer Urne liegen 3 rote und 2 blaue Kugeln. Es wird zweimal mit Zurücklegen gezogen. a) Bestimme P(rot, dann blau). (2 BE) b) Bestimme P(genau eine rote Kugel). (3 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 1, Level 1 (5 BE)** – probabilities in urn experiments, binomial distribution.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 1, Niveau 2 (5 BE)** – Bedingte Wahrscheinlichkeiten, Baumdiagramme. Ein Beispiel für eine solche Aufgabe ist: In einer Klasse sind 60% der Lernenden mit dem Bus gekommen, 40% zu Fuß. Von den Busfahrenden sind 10% zu spät, von den Fußgehenden 5% zu spät. a) Bestimme P(zu spät). (3 BE) b) Bestimme P(Bus|zu spät). (2 BE)",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 1, Level 2 (5 BE)** – conditional probabilities, tree diagrams.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Analysis, Prüfungsteil 2 (25 BE)** – Bestandsfunktionen, Kurvendiskussion, Grenzwerte, WTR/CAS-Dokumentation. Ein Beispiel für eine solche Aufgabe ist: Eine Zuflussrate in ein Becken sei r(t)=6t·e^(-0,5t). Zu Beginn sind B(0)=2 m³ im Becken. a) Bestimme B(t) als Bestand. b) Bestimme den Zeitpunkt, an dem r(t) maximal ist. c) Berechne die bis t=6 zugeflossene Wassermenge. d) WTR/CAS: Bestimme t, zu dem B(t)=20 gilt.",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Analysis, Part 2 (25 BE)** – stock functions, curve analysis, limits, calculator documentation.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **LA/AG, Prüfungsteil 2 (15 BE)** – Ebenengleichungen, Punkt auf Ebene prüfen, Winkel Gerade-Ebene, Abstand Punkt-Ebene. Ein Beispiel für eine solche Aufgabe ist: Gegeben sind A(1,2,0), B(5,2,2), C(1,6,2). Die Ebene E geht durch A,B,C. a) Bestimme eine Ebenengleichung in Koordinatenform. b) Untersuche, ob P(3,4,1) auf E liegt. c) Bestimme den Winkel zwischen einer Geraden g und E. d) Bestimme den Abstand von P zu E.",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **LA/AG, Part 2 (15 BE)** – plane equations, check point on plane, angle line-plane, distance point-plane.",
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
            "description": "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: **Stochastik, Prüfungsteil 2 (15 BE)** – Binomialtest mit WTR/CAS, Ablehnungsbereich, Testentscheidung, inverse Fragestellung. Ein Beispiel für eine solche Aufgabe ist: Ein Hersteller behauptet Ausschussanteil p≤0,03. Stichprobe n=200, beobachtet x=11. a) Modellieren Sie mit X~Bin(n,p) und formulieren Sie H₀ und H₁. b) WTR/CAS: Bestimmen Sie den Ablehnungsbereich für α=5%. c) Treffen Sie die Testentscheidung. d) Zeigen Sie qualitativ, dass bei größerem n Konfidenzintervalle enger werden.",
            "descriptionEn": "The learner can solve Abitur tasks based on the following specifications: **Stochastics, Part 2 (15 BE)** – binomial test with calculator, rejection region, test decision, inverse questions.",
            "core": True,
            "weight": 1.5,
            "tags": ["GK"],
            "contains": [],
            "requires": [q3_id],
            "examples": ["ABI_GK_D"],
            "dimensionTags": {"framework": "hessen-kc-2024", "phase": "Abitur", "area": "Stochastik", "demandLevel": "AB2"}
        }
    ]
    
    # Add new goals to the end
    data["goals"].extend(new_goals)
    
    # Add Abitur nodes to root goal's contains array
    for goal in data["goals"]:
        if goal["id"] == root_id:
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
