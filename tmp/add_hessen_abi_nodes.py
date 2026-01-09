import json
import uuid
from pathlib import Path

JSON_PATH = Path("/home/enpasos/projects/skillpilot/curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json")

Q1_ID = "31be9ac9-f1af-4ce6-9856-41d2ec65e9aa"
Q2_ID = "5079ea22-57d1-483b-b9cc-5bebefb77dbc"
Q3_ID = "4ab18312-0b43-461d-9154-3fba277baae7"
Q4_ID = "031b5000-16bb-430a-9c11-cb625f228bf4"
ROOT_ID = "ccf9569b-b0e4-4d76-98d5-65be461d4d76"

PLACEHOLDER_IDS = {
    "abi-lk-00000000-0000-0000-0000-000000000001",
    "abi-gk-00000000-0000-0000-0000-000000000002",
}


def generate_uuid(short_key: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"hessen-abi-math-{short_key}"))


def leaf_description(area, part, niveau, be, competency, example):
    return (
        "Der Lernende kann Abituraufgaben lösen, die nach folgenden Vorgaben gestellt wurden: "
        f"**{area}, {part}, {niveau} ({be} BE)** - {competency}. "
        f"Ein Beispiel für eine solche Aufgabe ist: {example}"
    )


def leaf_description_en(area, part, niveau, be, competency, example):
    return (
        "The learner can solve Abitur tasks that follow these specifications: "
        f"**{area}, {part}, {niveau} ({be} BE)** - {competency}. "
        f"An example of such a task is: {example}"
    )


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))

    existing_goals = data.get("goals", [])
    filtered_goals = []
    for goal in existing_goals:
        short_key = goal.get("shortKey", "")
        if short_key.startswith("abi_"):
            continue
        filtered_goals.append(goal)
    data["goals"] = filtered_goals

    # Remove placeholder IDs from root contains
    for goal in data["goals"]:
        if goal.get("id") == ROOT_ID:
            goal["contains"] = [
                gid for gid in goal.get("contains", []) if gid not in PLACEHOLDER_IDS
            ]
            break

    # IDs
    abi_lk_id = generate_uuid("abi_lk")
    abi_gk_id = generate_uuid("abi_gk")

    lk_t1_id = generate_uuid("abi_lk_t1")
    lk_t2_id = generate_uuid("abi_lk_t2")
    gk_t1_id = generate_uuid("abi_gk_t1")
    gk_t2_id = generate_uuid("abi_gk_t2")

    # Leaf IDs
    leaf_ids = {
        "abi_lk_t1_ana_n1": generate_uuid("abi_lk_t1_ana_n1"),
        "abi_lk_t1_ana_n2": generate_uuid("abi_lk_t1_ana_n2"),
        "abi_lk_t1_la_n1": generate_uuid("abi_lk_t1_la_n1"),
        "abi_lk_t1_la_n2": generate_uuid("abi_lk_t1_la_n2"),
        "abi_lk_t1_sto_n1": generate_uuid("abi_lk_t1_sto_n1"),
        "abi_lk_t1_sto_n2": generate_uuid("abi_lk_t1_sto_n2"),
        "abi_lk_t2_ana_b": generate_uuid("abi_lk_t2_ana_b"),
        "abi_lk_t2_la_c": generate_uuid("abi_lk_t2_la_c"),
        "abi_lk_t2_sto_d": generate_uuid("abi_lk_t2_sto_d"),
        "abi_gk_t1_ana_n1": generate_uuid("abi_gk_t1_ana_n1"),
        "abi_gk_t1_ana_n2": generate_uuid("abi_gk_t1_ana_n2"),
        "abi_gk_t1_la_n1": generate_uuid("abi_gk_t1_la_n1"),
        "abi_gk_t1_la_n2": generate_uuid("abi_gk_t1_la_n2"),
        "abi_gk_t1_sto_n1": generate_uuid("abi_gk_t1_sto_n1"),
        "abi_gk_t1_sto_n2": generate_uuid("abi_gk_t1_sto_n2"),
        "abi_gk_t2_ana_b": generate_uuid("abi_gk_t2_ana_b"),
        "abi_gk_t2_la_c": generate_uuid("abi_gk_t2_la_c"),
        "abi_gk_t2_sto_d": generate_uuid("abi_gk_t2_sto_d"),
    }

    new_goals = []

    # Main LK
    new_goals.append({
        "id": abi_lk_id,
        "shortKey": "abi_lk",
        "title": "Abiturprüfung Mathematik (LK)",
        "titleEn": "Mathematics Abitur Examination (Advanced Course)",
        "description": "Der Lernende kann die schriftliche Abiturprüfung Mathematik im Leistungskurs (100 BE) erfolgreich absolvieren. Dies umfasst Teil 1 (hilfsmittelfrei, 30 BE) und Teil 2 (mit Hilfsmitteln, 70 BE).",
        "descriptionEn": "The learner can successfully complete the written Abitur examination in mathematics at advanced level (100 BE). This includes Part 1 (without aids, 30 BE) and Part 2 (with aids, 70 BE).",
        "core": True,
        "weight": 3.0,
        "tags": ["LK"],
        "contains": [lk_t1_id, lk_t2_id],
        "requires": [Q1_ID, Q2_ID, Q3_ID, Q4_ID],
        "examples": [],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Abiturprüfung",
            "demandLevel": "AB3"
        },
        "sourceRef": "abi_2026_mathe_exam_blueprint.json"
    })

    # LK Teil 1
    new_goals.append({
        "id": lk_t1_id,
        "shortKey": "abi_lk_t1",
        "title": "Teil 1 Hilfsmittelfrei (LK, 30 BE)",
        "titleEn": "Part 1 Without Aids (LK, 30 BE)",
        "description": "Prüfungsteil 1: 6 Aufgaben à 5 BE - 4 Pflichtaufgaben Niveau 1 und 2 Wahlaufgaben Niveau 2.",
        "descriptionEn": "Exam Part 1: 6 tasks of 5 BE each - 4 mandatory level 1 tasks and 2 choice level 2 tasks.",
        "core": True,
        "weight": 2.0,
        "tags": ["LK"],
        "contains": [
            leaf_ids["abi_lk_t1_ana_n1"],
            leaf_ids["abi_lk_t1_ana_n2"],
            leaf_ids["abi_lk_t1_la_n1"],
            leaf_ids["abi_lk_t1_la_n2"],
            leaf_ids["abi_lk_t1_sto_n1"],
            leaf_ids["abi_lk_t1_sto_n2"],
        ],
        "requires": [],
        "examples": [],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Prüfungsteil 1",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_exam_blueprint.json"
    })

    # LK Teil 1 leaves
    new_goals.append({
        "id": leaf_ids["abi_lk_t1_ana_n1"],
        "shortKey": "abi_lk_t1_ana_n1",
        "title": "Analysis (Niveau 1, hilfsmittelfrei)",
        "titleEn": "Analysis (Level 1, without aids)",
        "description": leaf_description(
            "Analysis",
            "Prüfungsteil 1",
            "Niveau 1",
            5,
            "Ableitungen bestimmen und Tangentengleichungen aufstellen",
            "Gegeben ist f(x)=x^3-2x. a) Bestimme f'(x). (2 BE) b) Bestimme die Gleichung der Tangente an f im Punkt x=1. (3 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Analysis",
            "Part 1",
            "Level 1",
            5,
            "determine derivatives and set up tangent equations",
            "Given f(x)=x^3-2x. a) Determine f'(x). (2 BE) b) Determine the equation of the tangent to f at x=1. (3 BE).",
        ),
        "core": True,
        "weight": 1.0,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q1_ID],
        "examples": ["ABI_LK_A1"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Analysis",
            "demandLevel": "AB1"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_lk_t1_ana_n2"],
        "shortKey": "abi_lk_t1_ana_n2",
        "title": "Analysis (Niveau 2, hilfsmittelfrei)",
        "titleEn": "Analysis (Level 2, without aids)",
        "description": leaf_description(
            "Analysis",
            "Prüfungsteil 1",
            "Niveau 2",
            5,
            "Funktionenscharen analysieren und Parameterbedingungen bestimmen",
            "Gegeben ist die Schar f_a(x)=x^2-2ax. a) Bestimme die x-Koordinate des Scheitelpunkts in Abhängigkeit von a. (2 BE) b) Bestimme a, sodass der Scheitelpunkt auf der Geraden y=-4 liegt. (3 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Analysis",
            "Part 1",
            "Level 2",
            5,
            "analyze function families and determine parameter conditions",
            "Given the family f_a(x)=x^2-2ax. a) Determine the x-coordinate of the vertex depending on a. (2 BE) b) Determine a such that the vertex lies on the line y=-4. (3 BE).",
        ),
        "core": True,
        "weight": 1.2,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q1_ID, Q4_ID],
        "examples": ["ABI_LK_A6"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Analysis",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_lk_t1_la_n1"],
        "shortKey": "abi_lk_t1_la_n1",
        "title": "Lineare Algebra / Analytische Geometrie (Niveau 1, hilfsmittelfrei)",
        "titleEn": "Linear Algebra / Analytic Geometry (Level 1, without aids)",
        "description": leaf_description(
            "LA/AG",
            "Prüfungsteil 1",
            "Niveau 1",
            5,
            "Parallelität von Geraden begründen und Abstände berechnen",
            "Gegeben sind die Geraden g und h. a) Begründe, dass g parallel h gilt. (3 BE) b) Bestimme den Abstand der Geraden. (2 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "LA/AG",
            "Part 1",
            "Level 1",
            5,
            "justify parallel lines and compute distances",
            "Given the lines g and h. a) Justify that g is parallel to h. (3 BE) b) Determine the distance between the lines. (2 BE).",
        ),
        "core": True,
        "weight": 1.0,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q2_ID],
        "examples": ["ABI_LK_A3"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Lineare Algebra / Analytische Geometrie",
            "demandLevel": "AB1"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_lk_t1_la_n2"],
        "shortKey": "abi_lk_t1_la_n2",
        "title": "Lineare Algebra / Analytische Geometrie (Niveau 2, hilfsmittelfrei)",
        "titleEn": "Linear Algebra / Analytic Geometry (Level 2, without aids)",
        "description": leaf_description(
            "LA/AG",
            "Prüfungsteil 1",
            "Niveau 2",
            5,
            "Winkel zwischen Ebenen bestimmen und Schnittgeraden berechnen",
            "Gegeben sind die Ebenen E1: x+2y-z=3 und E2: 2x-y+2z=4. a) Bestimme den Winkel zwischen E1 und E2. (3 BE) b) Bestimme eine Gleichung der Schnittgeraden E1 cap E2. (2 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "LA/AG",
            "Part 1",
            "Level 2",
            5,
            "determine angles between planes and compute intersection lines",
            "Given the planes E1: x+2y-z=3 and E2: 2x-y+2z=4. a) Determine the angle between E1 and E2. (3 BE) b) Determine an equation of the intersection line E1 cap E2. (2 BE).",
        ),
        "core": True,
        "weight": 1.2,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q2_ID],
        "examples": ["ABI_LK_A7"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Lineare Algebra / Analytische Geometrie",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_lk_t1_sto_n1"],
        "shortKey": "abi_lk_t1_sto_n1",
        "title": "Stochastik (Niveau 1, hilfsmittelfrei)",
        "titleEn": "Stochastics (Level 1, without aids)",
        "description": leaf_description(
            "Stochastik",
            "Prüfungsteil 1",
            "Niveau 1",
            5,
            "bedingte Wahrscheinlichkeiten mit Sensitivität und Spezifität bestimmen",
            "Ein Test hat Sensitivität 0,95 und Spezifität 0,90. In einer Population sind 2% tatsächlich krank. a) Bestimme P(positiv). (3 BE) b) Bestimme P(krank|positiv). (2 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Stochastics",
            "Part 1",
            "Level 1",
            5,
            "determine conditional probabilities using sensitivity and specificity",
            "A test has sensitivity 0.95 and specificity 0.90. In a population, 2% are actually ill. a) Determine P(positive). (3 BE) b) Determine P(ill|positive). (2 BE).",
        ),
        "core": True,
        "weight": 1.0,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q3_ID],
        "examples": ["ABI_LK_A4"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Stochastik",
            "demandLevel": "AB1"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_lk_t1_sto_n2"],
        "shortKey": "abi_lk_t1_sto_n2",
        "title": "Stochastik (Niveau 2, hilfsmittelfrei)",
        "titleEn": "Stochastics (Level 2, without aids)",
        "description": leaf_description(
            "Stochastik",
            "Prüfungsteil 1",
            "Niveau 2",
            5,
            "Hypothesen formulieren und Testergebnisse ohne Rechner beurteilen",
            "Eine Firma behauptet Anteil \"zufrieden\" p=0,6. In einer Stichprobe n=10 sind x=3 zufrieden. a) Formuliere eine passende einseitige Hypothese H0/H1. (2 BE) b) Entscheide ohne Rechner plausibel, ob das Ergebnis eher gegen H0 spricht. (3 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Stochastics",
            "Part 1",
            "Level 2",
            5,
            "formulate hypotheses and assess test results without a calculator",
            "A company claims a satisfaction rate p=0.6. In a sample n=10, x=3 are satisfied. a) Formulate a suitable one-sided hypothesis H0/H1. (2 BE) b) Decide plausibly without a calculator whether the result speaks against H0. (3 BE).",
        ),
        "core": True,
        "weight": 1.2,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q3_ID],
        "examples": ["ABI_LK_A9"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Stochastik",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    # LK Teil 2
    new_goals.append({
        "id": lk_t2_id,
        "shortKey": "abi_lk_t2",
        "title": "Teil 2 Mit Hilfsmitteln (LK, 70 BE)",
        "titleEn": "Part 2 With Aids (LK, 70 BE)",
        "description": "Prüfungsteil 2: Analysis B (30 BE, Wahl), LA/AG C (20 BE, Pflicht), Stochastik D (20 BE, Pflicht). Rechnerunterstützung ist vorgesehen.",
        "descriptionEn": "Exam Part 2: Analysis B (30 BE, choice), LA/AG C (20 BE, mandatory), Stochastics D (20 BE, mandatory). Calculator support is expected.",
        "core": True,
        "weight": 2.0,
        "tags": ["LK"],
        "contains": [
            leaf_ids["abi_lk_t2_ana_b"],
            leaf_ids["abi_lk_t2_la_c"],
            leaf_ids["abi_lk_t2_sto_d"],
        ],
        "requires": [],
        "examples": [],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Prüfungsteil 2",
            "demandLevel": "AB3"
        },
        "sourceRef": "abi_2026_mathe_exam_blueprint.json"
    })

    new_goals.append({
        "id": leaf_ids["abi_lk_t2_ana_b"],
        "shortKey": "abi_lk_t2_ana_b",
        "title": "Analysis B (mit Hilfsmitteln, 30 BE)",
        "titleEn": "Analysis B (with aids, 30 BE)",
        "description": leaf_description(
            "Analysis",
            "Prüfungsteil 2",
            "B",
            30,
            "Kurvendiskussion, Integralrechnung, Grenzwerte, Parameterbestimmung und Tool-Dokumentation",
            "Gegeben ist f(x)=x*e^{-0,5x} (x>=0). a) Bestimme f'(x) und den Ort des Maximums. (6 BE) b) Berechne die Fläche A=int_0^6 f(x)dx. (6 BE) c) Bestimme lim_{x->infty} f(x). (3 BE) d) WTR/CAS: Bestimme näherungsweise x mit int_0^x f(t)dt = 1,5. (7 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Analysis",
            "Part 2",
            "B",
            30,
            "curve analysis, integrals, limits, parameter determination, and tool documentation",
            "Given f(x)=x*e^{-0.5x} (x>=0). a) Determine f'(x) and the location of the maximum. (6 BE) b) Compute the area A=int_0^6 f(x)dx. (6 BE) c) Determine lim_{x->infty} f(x). (3 BE) d) WTR/CAS: Approximate x with int_0^x f(t)dt = 1.5. (7 BE).",
        ),
        "core": True,
        "weight": 1.5,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q1_ID, Q4_ID],
        "examples": ["ABI_LK_B1"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Analysis",
            "demandLevel": "AB3"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_lk_t2_la_c"],
        "shortKey": "abi_lk_t2_la_c",
        "title": "Lineare Algebra / Analytische Geometrie C (mit Hilfsmitteln, 20 BE)",
        "titleEn": "Linear Algebra / Analytic Geometry C (with aids, 20 BE)",
        "description": leaf_description(
            "LA/AG",
            "Prüfungsteil 2",
            "C",
            20,
            "Ebenengleichungen, Lagebeziehungen, Winkelbestimmungen und Übergangsprozesse",
            "Gegeben sind A(1,2,0), B(5,2,2), C(1,6,2). a) Bestimme eine Koordinatenform der Ebene E. (5 BE) b) Untersuche die Lage einer Geraden g zu E und bestimme ggf. den Schnittpunkt. (5 BE) c) Bestimme den Winkel zwischen g und E. (4 BE) d) Bestimme einen Fixvektor v einer Übergangsmatrix M mit Mv=v und v1+v2=1. (4 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "LA/AG",
            "Part 2",
            "C",
            20,
            "plane equations, position relations, angle calculations, and transition processes",
            "Given A(1,2,0), B(5,2,2), C(1,6,2). a) Determine a coordinate form of plane E. (5 BE) b) Analyze the position of a line g relative to E and determine the intersection if applicable. (5 BE) c) Determine the angle between g and E. (4 BE) d) Determine a fixed vector v of a transition matrix M with Mv=v and v1+v2=1. (4 BE).",
        ),
        "core": True,
        "weight": 1.5,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q2_ID],
        "examples": ["ABI_LK_C"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Lineare Algebra / Analytische Geometrie",
            "demandLevel": "AB3"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_lk_t2_sto_d"],
        "shortKey": "abi_lk_t2_sto_d",
        "title": "Stochastik D (mit Hilfsmitteln, 20 BE)",
        "titleEn": "Stochastics D (with aids, 20 BE)",
        "description": leaf_description(
            "Stochastik",
            "Prüfungsteil 2",
            "D",
            20,
            "Binomialtest, Ablehnungsbereich, Fehlerarten und Normalverteilung mit inverser Fragestellung",
            "Ein Hersteller behauptet: Ausschussanteil p<=0,03. Stichprobe n=200, beobachtet x=11. a) Formuliere H0 und H1. (3 BE) b) WTR/CAS: Bestimme den Ablehnungsbereich für alpha=5%. (6 BE) c) Triff die Testentscheidung. (4 BE) d) Bestimme P(46<=Y<=58) für Y~N(50,4) und c mit P(Y<=c)=0,95. (3 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Stochastics",
            "Part 2",
            "D",
            20,
            "binomial test, rejection region, error types, and normal distribution with inverse questions",
            "A manufacturer claims defect rate p<=0.03. Sample n=200, observed x=11. a) Formulate H0 and H1. (3 BE) b) WTR/CAS: Determine the rejection region for alpha=5%. (6 BE) c) Make the test decision. (4 BE) d) Determine P(46<=Y<=58) for Y~N(50,4) and c with P(Y<=c)=0.95. (3 BE).",
        ),
        "core": True,
        "weight": 1.5,
        "tags": ["LK"],
        "contains": [],
        "requires": [Q3_ID],
        "examples": ["ABI_LK_D"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Stochastik",
            "demandLevel": "AB3"
        },
        "sourceRef": "abi_2026_mathe_lk.md"
    })

    # Main GK
    new_goals.append({
        "id": abi_gk_id,
        "shortKey": "abi_gk",
        "title": "Abiturprüfung Mathematik (GK)",
        "titleEn": "Mathematics Abitur Examination (Basic Course)",
        "description": "Der Lernende kann die schriftliche Abiturprüfung Mathematik im Grundkurs (80 BE) erfolgreich absolvieren. Dies umfasst Teil 1 (hilfsmittelfrei, 25 BE) und Teil 2 (mit Hilfsmitteln, 55 BE).",
        "descriptionEn": "The learner can successfully complete the written Abitur examination in mathematics at basic level (80 BE). This includes Part 1 (without aids, 25 BE) and Part 2 (with aids, 55 BE).",
        "core": True,
        "weight": 3.0,
        "tags": ["GK"],
        "contains": [gk_t1_id, gk_t2_id],
        "requires": [Q1_ID, Q2_ID, Q3_ID, Q4_ID],
        "examples": [],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Abiturprüfung",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_exam_blueprint.json"
    })

    # GK Teil 1
    new_goals.append({
        "id": gk_t1_id,
        "shortKey": "abi_gk_t1",
        "title": "Teil 1 Hilfsmittelfrei (GK, 25 BE)",
        "titleEn": "Part 1 Without Aids (GK, 25 BE)",
        "description": "Prüfungsteil 1: 5 Aufgaben à 5 BE - 3 Pflichtaufgaben Niveau 1 sowie je eine Wahlaufgabe Niveau 1 und Niveau 2.",
        "descriptionEn": "Exam Part 1: 5 tasks of 5 BE each - 3 mandatory level 1 tasks plus one choice task at level 1 and one at level 2.",
        "core": True,
        "weight": 2.0,
        "tags": ["GK"],
        "contains": [
            leaf_ids["abi_gk_t1_ana_n1"],
            leaf_ids["abi_gk_t1_ana_n2"],
            leaf_ids["abi_gk_t1_la_n1"],
            leaf_ids["abi_gk_t1_la_n2"],
            leaf_ids["abi_gk_t1_sto_n1"],
            leaf_ids["abi_gk_t1_sto_n2"],
        ],
        "requires": [],
        "examples": [],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Prüfungsteil 1",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_exam_blueprint.json"
    })

    # GK Teil 1 leaves
    new_goals.append({
        "id": leaf_ids["abi_gk_t1_ana_n1"],
        "shortKey": "abi_gk_t1_ana_n1",
        "title": "Analysis (Niveau 1, hilfsmittelfrei)",
        "titleEn": "Analysis (Level 1, without aids)",
        "description": leaf_description(
            "Analysis",
            "Prüfungsteil 1",
            "Niveau 1",
            5,
            "Funktionswerte berechnen und Nullstellen bestimmen",
            "Gegeben ist die Funktion f(x)=2x-1. a) Berechne f(3) und f(-2). (2 BE) b) Bestimme die Nullstelle von f. (3 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Analysis",
            "Part 1",
            "Level 1",
            5,
            "calculate function values and determine zeros",
            "Given the function f(x)=2x-1. a) Calculate f(3) and f(-2). (2 BE) b) Determine the zero of f. (3 BE).",
        ),
        "core": True,
        "weight": 1.0,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q1_ID],
        "examples": ["ABI_GK_A1"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Analysis",
            "demandLevel": "AB1"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_gk_t1_ana_n2"],
        "shortKey": "abi_gk_t1_ana_n2",
        "title": "Analysis (Niveau 2, hilfsmittelfrei)",
        "titleEn": "Analysis (Level 2, without aids)",
        "description": leaf_description(
            "Analysis",
            "Prüfungsteil 1",
            "Niveau 2",
            5,
            "Optimierungsaufgaben modellieren und begründen",
            "Ein Rechteck hat Umfang 40 cm. a) Stelle die Fläche A(x) als Funktion einer Seitenlänge x auf. (2 BE) b) Bestimme die Seitenlängen mit maximaler Fläche und begründe kurz. (3 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Analysis",
            "Part 1",
            "Level 2",
            5,
            "model and justify optimization problems",
            "A rectangle has perimeter 40 cm. a) Express the area A(x) as a function of side length x. (2 BE) b) Determine the side lengths with maximum area and justify briefly. (3 BE).",
        ),
        "core": True,
        "weight": 1.2,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q1_ID, Q4_ID],
        "examples": ["ABI_GK_A7"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Analysis",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_gk_t1_la_n1"],
        "shortKey": "abi_gk_t1_la_n1",
        "title": "Lineare Algebra / Analytische Geometrie (Niveau 1, hilfsmittelfrei)",
        "titleEn": "Linear Algebra / Analytic Geometry (Level 1, without aids)",
        "description": leaf_description(
            "LA/AG",
            "Prüfungsteil 1",
            "Niveau 1",
            5,
            "Richtungsvektoren bestimmen und Geradengleichungen aufstellen",
            "Gegeben sind die Punkte A(1,2,0) und B(5,0,2). a) Bestimme den Richtungsvektor AB. (2 BE) b) Gib eine Parametergleichung der Geraden g durch A und B an. (3 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "LA/AG",
            "Part 1",
            "Level 1",
            5,
            "determine direction vectors and set up line equations",
            "Given points A(1,2,0) and B(5,0,2). a) Determine the direction vector AB. (2 BE) b) Provide a parametric equation of the line g through A and B. (3 BE).",
        ),
        "core": True,
        "weight": 1.0,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q2_ID],
        "examples": ["ABI_GK_A2"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Lineare Algebra / Analytische Geometrie",
            "demandLevel": "AB1"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_gk_t1_la_n2"],
        "shortKey": "abi_gk_t1_la_n2",
        "title": "Lineare Algebra / Analytische Geometrie (Niveau 2, hilfsmittelfrei)",
        "titleEn": "Linear Algebra / Analytic Geometry (Level 2, without aids)",
        "description": leaf_description(
            "LA/AG",
            "Prüfungsteil 1",
            "Niveau 2",
            5,
            "Parallelität prüfen und Winkel zwischen Richtungsvektoren bestimmen",
            "Gegeben sind die Geraden g und h. a) Untersuche, ob g und h parallel sind. (3 BE) b) Bestimme den Winkel zwischen den Richtungsvektoren. (2 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "LA/AG",
            "Part 1",
            "Level 2",
            5,
            "check parallelism and determine angles between direction vectors",
            "Given the lines g and h. a) Examine whether g and h are parallel. (3 BE) b) Determine the angle between the direction vectors. (2 BE).",
        ),
        "core": True,
        "weight": 1.2,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q2_ID],
        "examples": ["ABI_GK_A8"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Lineare Algebra / Analytische Geometrie",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_gk_t1_sto_n1"],
        "shortKey": "abi_gk_t1_sto_n1",
        "title": "Stochastik (Niveau 1, hilfsmittelfrei)",
        "titleEn": "Stochastics (Level 1, without aids)",
        "description": leaf_description(
            "Stochastik",
            "Prüfungsteil 1",
            "Niveau 1",
            5,
            "Wahrscheinlichkeiten bei Ziehen mit Zurücklegen bestimmen",
            "In einer Urne liegen 3 rote und 2 blaue Kugeln. Es wird zweimal mit Zurücklegen gezogen. a) Bestimme P(rot, dann blau). (2 BE) b) Bestimme P(genau eine rote Kugel). (3 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Stochastics",
            "Part 1",
            "Level 1",
            5,
            "determine probabilities in draws with replacement",
            "An urn contains 3 red and 2 blue balls. Two draws are made with replacement. a) Determine P(red, then blue). (2 BE) b) Determine P(exactly one red ball). (3 BE).",
        ),
        "core": True,
        "weight": 1.0,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q3_ID],
        "examples": ["ABI_GK_A3"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Stochastik",
            "demandLevel": "AB1"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_gk_t1_sto_n2"],
        "shortKey": "abi_gk_t1_sto_n2",
        "title": "Stochastik (Niveau 2, hilfsmittelfrei)",
        "titleEn": "Stochastics (Level 2, without aids)",
        "description": leaf_description(
            "Stochastik",
            "Prüfungsteil 1",
            "Niveau 2",
            5,
            "bedingte Wahrscheinlichkeiten in Kontexten bestimmen",
            "In einer Klasse sind 60% der Lernenden mit dem Bus gekommen, 40% zu Fuß. Von den Busfahrenden sind 10% zu spät, von den Fußgehenden 5% zu spät. a) Bestimme P(zu spät). (3 BE) b) Bestimme P(Bus|zu spät). (2 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Stochastics",
            "Part 1",
            "Level 2",
            5,
            "determine conditional probabilities in context problems",
            "In a class, 60% arrived by bus and 40% on foot. Of the bus riders, 10% are late; of the walkers, 5% are late. a) Determine P(late). (3 BE) b) Determine P(bus|late). (2 BE).",
        ),
        "core": True,
        "weight": 1.2,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q3_ID],
        "examples": ["ABI_GK_A9"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Stochastik",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    # GK Teil 2
    new_goals.append({
        "id": gk_t2_id,
        "shortKey": "abi_gk_t2",
        "title": "Teil 2 Mit Hilfsmitteln (GK, 55 BE)",
        "titleEn": "Part 2 With Aids (GK, 55 BE)",
        "description": "Prüfungsteil 2: Analysis B (25 BE, Wahl), LA/AG C (15 BE, Pflicht), Stochastik D (15 BE, Pflicht). Rechnerunterstützung ist vorgesehen.",
        "descriptionEn": "Exam Part 2: Analysis B (25 BE, choice), LA/AG C (15 BE, mandatory), Stochastics D (15 BE, mandatory). Calculator support is expected.",
        "core": True,
        "weight": 2.0,
        "tags": ["GK"],
        "contains": [
            leaf_ids["abi_gk_t2_ana_b"],
            leaf_ids["abi_gk_t2_la_c"],
            leaf_ids["abi_gk_t2_sto_d"],
        ],
        "requires": [],
        "examples": [],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Prüfungsteil 2",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_exam_blueprint.json"
    })

    new_goals.append({
        "id": leaf_ids["abi_gk_t2_ana_b"],
        "shortKey": "abi_gk_t2_ana_b",
        "title": "Analysis B (mit Hilfsmitteln, 25 BE)",
        "titleEn": "Analysis B (with aids, 25 BE)",
        "description": leaf_description(
            "Analysis",
            "Prüfungsteil 2",
            "B",
            25,
            "Bestandsfunktionen, Extremwertbestimmung, Integrale, Grenzwerte und Tool-Dokumentation",
            "Eine Zuflussrate in ein Becken sei r(t)=6t*e^{-0,5t} (t>=0), Anfangsbestand B(0)=2 m^3. a) Bestimme B(t) als Bestand. (7 BE) b) Bestimme den Zeitpunkt, an dem r(t) maximal ist. (6 BE) c) Berechne die bis t=6 zugeflossene Wassermenge. (4 BE) d) WTR/CAS: Bestimme t mit B(t)=20. (4 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Analysis",
            "Part 2",
            "B",
            25,
            "stock functions, extrema, integrals, limits, and tool documentation",
            "An inflow rate into a tank is r(t)=6t*e^{-0.5t} (t>=0) with initial stock B(0)=2 m^3. a) Determine B(t) as the stock function. (7 BE) b) Determine when r(t) is maximal. (6 BE) c) Compute the total inflow up to t=6. (4 BE) d) WTR/CAS: Determine t with B(t)=20. (4 BE).",
        ),
        "core": True,
        "weight": 1.5,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q1_ID, Q4_ID],
        "examples": ["ABI_GK_B1"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Analysis",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_gk_t2_la_c"],
        "shortKey": "abi_gk_t2_la_c",
        "title": "Lineare Algebra / Analytische Geometrie C (mit Hilfsmitteln, 15 BE)",
        "titleEn": "Linear Algebra / Analytic Geometry C (with aids, 15 BE)",
        "description": leaf_description(
            "LA/AG",
            "Prüfungsteil 2",
            "C",
            15,
            "Ebenengleichung bestimmen, Lage eines Punktes prüfen, Winkel und Abstände berechnen",
            "Gegeben sind A(1,2,0), B(5,2,2), C(1,6,2). a) Bestimme eine Ebenengleichung von E in Koordinatenform. (5 BE) b) Prüfe, ob P(3,4,1) auf E liegt. (2 BE) c) Bestimme den Winkel zwischen einer Geraden g und E. (4 BE) d) Bestimme den Abstand des Punktes P von E. (4 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "LA/AG",
            "Part 2",
            "C",
            15,
            "determine plane equations, check point position, compute angles and distances",
            "Given A(1,2,0), B(5,2,2), C(1,6,2). a) Determine a plane equation of E in coordinate form. (5 BE) b) Check whether P(3,4,1) lies on E. (2 BE) c) Determine the angle between a line g and E. (4 BE) d) Determine the distance from point P to E. (4 BE).",
        ),
        "core": True,
        "weight": 1.5,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q2_ID],
        "examples": ["ABI_GK_C"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Lineare Algebra / Analytische Geometrie",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    new_goals.append({
        "id": leaf_ids["abi_gk_t2_sto_d"],
        "shortKey": "abi_gk_t2_sto_d",
        "title": "Stochastik D (mit Hilfsmitteln, 15 BE)",
        "titleEn": "Stochastics D (with aids, 15 BE)",
        "description": leaf_description(
            "Stochastik",
            "Prüfungsteil 2",
            "D",
            15,
            "Binomialtest, Ablehnungsbereich, Testentscheidung und inverse Fragestellung",
            "Ein Hersteller behauptet: Ausschussanteil p<=0,03. Stichprobe n=200, beobachtet x=11. a) Formuliere H0 und H1 und modellieren Sie mit X~Bin(n,p). (3 BE) b) WTR/CAS: Bestimme den Ablehnungsbereich für alpha=5%. (6 BE) c) Triff die Testentscheidung. (4 BE) d) Zeige qualitativ, dass bei größerem n Konfidenzintervalle enger werden. (2 BE).",
        ),
        "descriptionEn": leaf_description_en(
            "Stochastics",
            "Part 2",
            "D",
            15,
            "binomial test, rejection region, test decision, and inverse question",
            "A manufacturer claims defect rate p<=0.03. Sample n=200, observed x=11. a) Formulate H0 and H1 and model with X~Bin(n,p). (3 BE) b) WTR/CAS: Determine the rejection region for alpha=5%. (6 BE) c) Make the test decision. (4 BE) d) Show qualitatively that confidence intervals become narrower with larger n. (2 BE).",
        ),
        "core": True,
        "weight": 1.5,
        "tags": ["GK"],
        "contains": [],
        "requires": [Q3_ID],
        "examples": ["ABI_GK_D"],
        "dimensionTags": {
            "framework": "hessen-kc-2024",
            "phase": "Abitur",
            "area": "Stochastik",
            "demandLevel": "AB2"
        },
        "sourceRef": "abi_2026_mathe_gk.md"
    })

    data["goals"].extend(new_goals)

    # Update root contains
    for goal in data["goals"]:
        if goal.get("id") == ROOT_ID:
            contains = goal.get("contains", [])
            for new_id in [abi_lk_id, abi_gk_id]:
                if new_id not in contains:
                    contains.append(new_id)
            goal["contains"] = contains
            break

    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
