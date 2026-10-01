"""Apply the reviewed, bounded E-phase biology D dissent repair once.

The script asserts the old goal wording before writing. It preserves the historical
D campaigns and only changes the affected canonical goals, parent membership and
direct prerequisites. New reuse images are copied byte-identically from active PNGs.
"""

from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
from shutil import copyfile


ROOT = Path(__file__).resolve().parents[8]
CANON = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
ASSET = "assets/goal-visualizations/biologie"
O = "2d451684-6e53-565e-a987-f362da919d2c"

IDS = {
    "11e": "11e90f71-a9a4-5a57-b619-ad5d81e81f96",
    "7c": "7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f",
    "fc8": "fc8c4b02-02f2-5ad6-b481-224d36121da1",
    "5c": "5c2ce7b1-30ba-5e9c-99de-1ffac126ec13",
    "288": "28850d2e-062d-5341-ac66-bd787a8fc84f",
    "0db": "0dbe758c-73c8-530b-bbbd-fb55540f942f",
    "f539": "f539fe51-1f6f-5e04-abfe-af3d2e4d2aad",
    "018": "01819a6c-f965-5b33-8c4e-07affb3c659f",
    "ec88": "ec88fc1d-ee0f-5a01-9464-dc358241050e",
    "934": "9344c5ce-a07a-5d02-8c56-35320f19a934",
    "6199": "6199e4c7-06d1-559a-98ab-acf805a478ba",
    "d71": "d71e2310-2331-5e66-b7df-c2807fccb329",
    "1042": "1042bb24-96ba-553b-a956-abaf9c74dc43",
    "e063": "e063b97d-9e03-5094-8c73-72a3eeec803d",
    "e763": "e76315b1-2fed-525c-8efa-ca09da46f632",
    "d06": "d06adc48-b845-54af-b17c-06b5cb910b11",
    "198": "1984fd66-c117-5c29-87b3-1c1626e4ba81",
    "e148": "e1484671-208b-5ad1-a71d-7d994fb2174b",
}

CHANGES = {
    "11e": ("Kennzeichen des Lebens erläutern", "Explain characteristics of life",
            "Die lernende Person kann mehrere Kennzeichen des Lebens an einem konkreten Lebewesen mit Beobachtungsbefunden erläutern.",
            "The learner can explain several characteristics of life in a specific organism using observed evidence."),
    "7c": ("Zelltypen unterscheiden", "Distinguish cell types",
           "Die lernende Person kann prokaryotische und eukaryotische sowie pflanzliche und tierische Zellen anhand lichtmikroskopischer Befunde und ergänzender Zellmodelle vergleichen.",
           "The learner can compare prokaryotic and eukaryotic as well as plant and animal cells using light-microscope observations and supplementary cell models."),
    "fc8": ("Zellorganellen zuordnen", "Classify cell organelles",
            "Die lernende Person kann Aufbau und zentrale Funktionen ausgewählter Zellorganellen in einem Zellmodell begründet zuordnen.",
            "The learner can assign the structures and main functions of selected cell organelles in a cell model with reasons."),
    "5c": ("Proteinvermittelten Membrantransport erklären", "Explain protein-mediated membrane transport",
           "Die lernende Person kann aktiven und passiven Stofftransport durch Kanal- oder Carrierproteine anhand von Konzentrationsgefälle und Energieeinsatz unterscheiden.",
           "The learner can distinguish active and passive solute transport through channel or carrier proteins using concentration gradients and energy input."),
    "288": ("Proteinaufbau modellieren", "Model protein structure",
            "Die lernende Person kann aus Aminosäuren und Peptidbindungen den Aufbau einer Polypeptidkette modellieren und die vier Proteinstrukturebenen erläutern.",
            "The learner can model the formation of a polypeptide chain from amino acids and peptide bonds and explain the four levels of protein structure."),
    "0db": ("Enzymkatalyse beschreiben", "Describe enzyme catalysis",
            "Die lernende Person kann den Mechanismus der Enzymkatalyse an einem ausgewählten Beispiel erklären.",
            "The learner can explain the mechanism of enzyme catalysis using one selected example."),
    "f539": ("Temperaturabhängigkeit der Enzymaktivität deuten", "Interpret temperature dependence of enzyme activity",
              "Die lernende Person kann aus kontrollierten Daten die Temperaturabhängigkeit einer Enzymaktivität samt möglicher Denaturierung deuten.",
              "The learner can interpret the temperature dependence of an enzyme's activity, including possible denaturation, from controlled data."),
    "018": ("Enzymhemmung erklären", "Explain enzyme inhibition",
             "Die lernende Person kann das Prinzip kompetitiver und allosterischer Enzymhemmung an einem geeigneten Hemmstoffbeispiel erklären.",
             "The learner can explain the principles of competitive and allosteric enzyme inhibition using a suitable inhibitor example."),
    "ec88": ("Mitose und Meiose vergleichen", "Compare mitosis and meiosis",
              "Die lernende Person kann Mitose und Meiose anhand von Teilungszahl, Tochterzellzahl und Chromosomensatz vergleichen.",
              "The learner can compare mitosis and meiosis by number of divisions, daughter cells and chromosome sets."),
    "934": ("Eignung von Modellorganismen begründen", "Justify the suitability of model organisms",
             "Die lernende Person kann für eine einfache entwicklungsbiologische Forschungsfrage die Eignung von Drosophila oder C. elegans als Modellorganismus mit einer Übertragungsgrenze begründen.",
             "The learner can justify the suitability of Drosophila or C. elegans as a model organism for a simple developmental-biology question, including one limit of transfer."),
    "6199": ("Vom Einzeller zum Vielzeller", "From unicellular to multicellular",
              "Die lernende Person kann Einzeller, Zellverbände und Vielzeller anhand ihrer Zellorganisation als unterschiedliche Organisationsformen vergleichen.",
              "The learner can compare unicellular organisms, cell colonies and multicellular organisms as distinct forms of cellular organization."),
}

EXPECTED_OLD = {
    "11e": "Die lernende Person kann Organisationsstufen von der Zelle bis zum Organismus und Kennzeichen des Lebens erläutern.",
    "7c": "Die lernende Person kann pro- und eukaryotische, pflanzliche und tierische Zellen mikroskopisch vergleichen.",
    "fc8": "Die lernende Person kann Aufbau und zentrale Funktionen wichtiger Organellen beschreiben und den Endosymbiontentheorie-Bezug herstellen.",
    "5c": "Die lernende Person kann Membranmodelle darstellen und Diffusion, Osmose sowie aktiven/passiven Transport erklären.",
    "288": "Die lernende Person kann Aminosäuren, Peptidbindung und Proteinstrukturebenen erläutern.",
    "0db": "Die lernende Person kann den Ablauf biokatalytischer Prozesse an Beispielen erklären.",
    "f539": "Die lernende Person kann Temperatur-, pH- und Substratabhängigkeit der Enzymaktivität deuten.",
    "018": "Die lernende Person kann kompetitive und allosterische Hemmungen erklären und Alltagsbeispiele nennen.",
    "ec88": "Die lernende Person kann Zellzyklusabschnitte sowie Unterschiede zwischen Mitose und Meiose erläutern.",
    "934": "Die lernende Person kann Bedeutung von Drosophila oder C. elegans erläutern.",
    "6199": "Die lernende Person kann Organisationsstufen vom Einzeller zum Vielzeller anhand der Endosymbiontentheorie erklären.",
}

SPLITS = [
    ("11e", "d71", "Organisationsstufen eines Vielzellers erläutern", "Explain levels of organization in a multicellular organism",
     "Die lernende Person kann Zelle, Gewebe, Organ und Organismus an einem vielzelligen Lebewesen in ihrer Beziehung erläutern.",
     "The learner can explain how cell, tissue, organ and organism relate in one multicellular living thing.",
     [O, "8d35381e-d646-512c-b0c2-bb90c4974208", "e0d04e58-1591-5230-bfa6-5c685b56d25b"],
     "Das bestehende Pflanzenbild zeigt oben Zelle, Blattgewebe, Blattorgan und ganze Pflanze als Organisationsstufen; die unteren vier Lebenskennzeichen sind ergänzender Bildkontext."),
    ("fc8", "1042", "Endosymbiontentheorie erklären", "Explain endosymbiotic theory",
     "Die lernende Person kann die Endosymbiontentheorie als Modell für die Entstehung eukaryotischer Zellen mit Mitochondrien und Chloroplasten erläutern.",
     "The learner can explain endosymbiotic theory as a model for the origin of eukaryotic cells with mitochondria and chloroplasts.",
     [IDS["fc8"], IDS["7c"], O],
     "Unter den Zellmodellen zeigen zwei vereinfachte Bildfolgen die Aufnahme früherer Bakterien als Modell für Mitochondrien und Chloroplasten; das Bild zeigt keine unabhängigen Belege wie eigene DNA."),
    ("5c", "e063", "Ein einfaches Biomembranmodell darstellen", "Depict a simple biomembrane model",
     "Die lernende Person kann eine Biomembran als Lipiddoppelschicht mit eingelagerten Transportproteinen und selektiver Durchlässigkeit schematisch darstellen.",
     "The learner can schematically depict a biomembrane as a lipid bilayer with embedded transport proteins and selective permeability.",
     [IDS["fc8"], O],
     "Alle drei Bildfelder zeigen die vereinfachte Lipiddoppelschicht als Grenze; Kanal und Pumpe sind Beispiele eingelagerter Proteine. Das Bild benennt die polaren und unpolaren Lipidseiten nicht ausdrücklich."),
    ("5c", "e763", "Diffusion und Osmose erklären", "Explain diffusion and osmosis",
     "Die lernende Person kann bei veränderten Konzentrationsbedingungen die Richtung von Diffusion und osmotischer Wasserbewegung an einer geeigneten Membran erklären.",
     "The learner can explain the direction of diffusion and osmotic water movement across a suitable membrane when concentration conditions change.",
     [IDS["e063"], O],
     "Die oberen zwei Bildfelder zeigen Teilchenbewegung entlang eines Gefälles und Wasserbewegung durch einen Kanal zur Seite mit höherer Konzentration gelöster Stoffe; das untere ATP-Feld ist ergänzender Kontrast."),
    ("f539", "d06", "pH-Abhängigkeit der Enzymaktivität deuten", "Interpret pH dependence of enzyme activity",
     "Die lernende Person kann aus kontrollierten Daten die pH-Abhängigkeit einer Enzymaktivität mit einem Aktivitätsoptimum deuten.",
     "The learner can interpret an enzyme's pH-dependent activity and its optimum from controlled data.",
     [IDS["0db"], O],
     "Das mittlere Bildfeld zeigt eine qualitative Aktivitätskurve mit pH-Optimum und ein vereinfachtes Enzym-Substrat-Modell; die anderen Faktoren sind ergänzender Vergleich."),
    ("f539", "198", "Substratabhängigkeit der Enzymaktivität deuten", "Interpret substrate dependence of enzyme activity",
     "Die lernende Person kann aus kontrollierten Daten erklären, warum die Enzymaktivität bei steigender Substratmenge schließlich ein Sättigungsplateau erreicht.",
     "The learner can use controlled data to explain why enzyme activity eventually reaches a saturation plateau as substrate amount rises.",
     [IDS["0db"], O],
     "Das rechte Bildfeld zeigt eine qualitative Sättigungskurve; drei getrennte Enzyme binden jeweils höchstens ein Substrat, weitere Substrate bleiben frei."),
    ("ec88", "e148", "Zellzyklusabschnitte erläutern", "Explain stages of the cell cycle",
     "Die lernende Person kann G1-, S-, G2- und M-Phase einer eukaryotischen Zelle einordnen und die DNA-Verdopplung vor der Zellteilung erklären.",
     "The learner can order the G1, S, G2 and M phases of a eukaryotic cell and explain DNA replication before cell division.",
     [O], None),
]


def main() -> None:
    before = CANON.read_bytes()
    doc = json.loads(before)
    goals = doc["goals"]
    by_id = {goal["id"]: goal for goal in goals}
    assert len(by_id) == len(goals)
    assert all(IDS[key] not in by_id for key in ("d71", "1042", "e063", "e763", "d06", "198", "e148"))
    for key, expected in EXPECTED_OLD.items():
        assert by_id[IDS[key]]["description"] == expected, f"stale source goal {key}"

    for key, (title, title_en, desc, desc_en) in CHANGES.items():
        goal = by_id[IDS[key]]
        goal.update(title=title, titleEn=title_en, description=desc, descriptionEn=desc_en)
        for link in goal.get("resourceLinks", []):
            if link.get("type") == "goal-visualization":
                link["title"] = f"Visualisierung: {title}"

    # Only altered didactic dependencies. Non-target content and historical
    # review/evidence files are untouched.
    by_id[IDS["5c"]]["requires"] = [IDS["e063"], IDS["e763"], O]
    by_id[IDS["018"]]["requires"] = [IDS["0db"], O]
    by_id[IDS["ec88"]]["requires"] = [IDS["e148"], O]
    by_id[IDS["6199"]]["requires"] = [IDS["d71"], O]
    for short, requires in {
        "861fbc18": [IDS["e763"], O],
        "7a79fda6": [IDS["e063"], O],
    }.items():
        match = next(goal for goal in goals if goal["id"].startswith(short))
        match["requires"] = requires

    reused = []
    for source_key, new_key, title, title_en, desc, desc_en, requires, alt in SPLITS:
        source = by_id[IDS[source_key]]
        goal = deepcopy(source)
        goal["id"] = IDS[new_key]
        goal["title"] = title
        goal["titleEn"] = title_en
        goal["description"] = desc
        goal["descriptionEn"] = desc_en
        goal["requires"] = requires
        goal["applicability"] = {"jurisdiction": ["DE-HE"]}
        if new_key == "1042":
            # Official E.1.6 contains the endosymbiotic-theory source point.
            goal["extendedData"]["provenance"]["sourceGoalId"] = "0d171371-3d91-49b7-a16d-d640a3094628"
        if alt is None:
            goal.pop("resourceLinks", None)
        else:
            assert len(goal["resourceLinks"]) == 1
            link = goal["resourceLinks"][0]
            link["skillpilotId"] = goal["id"]
            link["title"] = f"Visualisierung: {title}"
            link["url"] = f"/{ASSET}/{goal['id']}/{goal['id']}.png"
            link["description"] = alt
            link["altText"] = alt
            link["reviewStatus"] = "ai_candidate"
            reused.append((IDS[source_key], goal["id"]))
        by_id[goal["id"]] = goal
        index = goals.index(source)
        goals.insert(index if new_key == "e148" else index + 1, goal)
        parents = [parent for parent in goals if source["id"] in parent.get("contains", [])]
        assert len(parents) == 1, (new_key, parents)
        parent = parents[0]
        parent_index = parent["contains"].index(source["id"])
        parent["contains"].insert(parent_index if new_key == "e148" else parent_index + 1, goal["id"])

    assert len(goals) == 437, len(goals)  # 430 old + seven curricular atoms
    assert len({g["id"] for g in goals}) == len(goals)
    # A local graph check catches accidental cycles before file replacement.
    for edge in ("requires", "contains"):
        visited, active = set(), set()

        def visit(goal_id: str) -> None:
            if goal_id in active:
                raise AssertionError(f"{edge} cycle at {goal_id}")
            if goal_id in visited:
                return
            active.add(goal_id)
            for child in by_id[goal_id].get(edge, []):
                assert child in by_id, (edge, goal_id, child)
                visit(child)
            active.remove(goal_id)
            visited.add(goal_id)

        for goal in goals:
            visit(goal["id"])

    for source_id, new_id in reused:
        source_path = ROOT / "curricula/DE/Gymnasium/visualizations/biologie" / source_id / f"{source_id}.png"
        assert source_path.is_file(), source_path
        original_hash = sha256(source_path.read_bytes()).hexdigest()
        for relative in (
            "curricula/DE/Gymnasium/visualizations/biologie",
            "app/public/assets/goal-visualizations/biologie",
            "backend/src/main/resources/static/assets/goal-visualizations/biologie",
        ):
            target_dir = ROOT / relative / new_id
            target_dir.mkdir(parents=True, exist_ok=True)
            target = target_dir / f"{new_id}.png"
            assert not target.exists(), target
            copyfile(source_path, target)
            assert sha256(target.read_bytes()).hexdigest() == original_hash
        prompt = ROOT / "curricula/DE/Gymnasium/visualizations/biologie" / new_id / "prompt.de.md"
        prompt.write_text(
            f"# Vorhandenes Bild wiederverwendet\n\nFür `{new_id}` wurde das bereits fachlich und visuell geprüfte "
            f"PNG von `{source_id}` bytegleich übernommen (SHA-256 `{original_hash}`). "
            "Es wurde kein neues Bild erzeugt. Die Teilzielbindung, der fokussierte Alt-Text "
            "und die maschinelle V-Entscheidung werden separat dokumentiert.\n",
            encoding="utf-8",
        )

    encoded = (json.dumps(doc, ensure_ascii=False, indent=2) + "\n").encode()
    temporary = CANON.with_suffix(".json.m7-ephase-tmp")
    temporary.write_bytes(encoded)
    temporary.replace(CANON)
    print(json.dumps({
        "beforeSha256": sha256(before).hexdigest(),
        "afterSha256": sha256(encoded).hexdigest(),
        "oldGoalCount": 430,
        "newGoalCount": len(goals),
        "newGoalIds": [IDS[key] for key in ("d71", "1042", "e063", "e763", "d06", "198", "e148")],
        "reusedImageBindings": reused,
    }, indent=2))


if __name__ == "__main__":
    main()
