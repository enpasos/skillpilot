"""Preserve whole scientific profiles; correct four prematurely exposed tasks."""

import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = next(p for p in ROOT.parents if (p / ".git").exists())
AUTHOR = ROOT.parent / "chemie-current447-final-four-scope-corrections-author-20261018-v3"
author_path = AUTHOR / "AUTHOR.complete-eight-profiles-three-goals-and-operative-materials.pending.json"
material_path = AUTHOR / "MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json"
author = json.loads(author_path.read_text())
materials = json.loads(material_path.read_text())["materials"]


def pin(path):
    data = path.read_bytes()
    return {"path": str(path.relative_to(REPO)), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


# Exact baseline-only wording. Changed conditions remain in the original staged
# material and, for sugar/hydrogenation, the separate fresh application brief.
tasks = {
    0: {
        "de": "Beschreibe die Prozesskette mit Stoff- und Trennprinzipien. Beurteile und bewerte A/B für Zucker im Alltag nach je mindestens einem ökologischen, ökonomischen und sozialen Kriterium. Lege eine nachvollziehbare Gewichtung offen, entscheide bedingt und nenne gezielt benötigte Informationen. Unterschiedliche begründete Gewichtungen sind zulässig; fehlende Sozialdaten sind keine bewiesenen Verstöße.",
        "en": "Describe the process and its substance/separation principles. Judge and evaluate A/B as everyday sugar suppliers using environmental, economic and social criteria. Make a defensible weighting explicit, give a conditional decision and identify missing information. Different justified weightings are acceptable; absent labour documentation does not prove violations.",
    },
    1: {
        "de": "Leite beide Kennzahlen mit Einheiten aus den Stoffmengenverhältnissen ab und berechne A–C. Stelle die Kennzahlen den Strukturmerkmalen gegenüber: Zahl/Masse von Estergruppen versus Doppelbindungen. Erkläre, warum der Kennzahlwert eines Gemisches keine einzige Molekülstruktur identifiziert. Prüfe die Aussage „hohe Verseifungszahl bedeutet viele Doppelbindungen“.",
        "en": "Derive both values with units from consumption stoichiometry and calculate A–C. Link each index to its structural basis: ester groups per mass versus double bonds per mass. Explain why a mixture index does not identify one molecular structure. Test the claim that high saponification value means many double bonds.",
    },
    2: {
        "de": "Leite für U/S/K begründete relative Aussagen zu Ungesättigtheit und mittlerer Restlänge ab. Formuliere eine bedingte Oxidations-/Haltbarkeitserwartung, ohne ein Verfallsdatum zu erfinden. Nenne einen sinnvollen kontrollierten Vergleich, ohne neue Lagerexperimente als bereits durchgeführt auszugeben.",
        "en": "Infer bounded relative unsaturation and average residue length for U/S/K. State a conditional oxidation/shelf-life expectation without inventing expiry dates. Propose a controlled comparison without claiming an experiment has occurred.",
    },
    3: {
        "de": "Zeichne die Bilanz für die vollständige Fetthärtung mit Stoffmengenverhältnis und markiere addierte H-Atome. Begründe den Bezug zwischen Struktur, Packung und Konsistenz. Trenne katalytische Hydrierung von Esterhydrolyse und vom bereits bekannten ionischen HX-Additionsmechanismus.",
        "en": "Draw the complete hardening balance with molar ratio and added H atoms. Link structure, packing and consistency. Distinguish catalytic hydrogenation from ester hydrolysis and the previously known ionic HX-addition mechanism.",
    },
}

output = {
    "schemaVersion": 1,
    "status": "author_candidate_pending_independent_delta_review",
    "active": False,
    "scientificApprovalClaim": False,
    "nativeDReviewClaim": False,
    "humanApproval": False,
    "actualLearnerPerformanceRecorded": False,
    "M7Claim": False,
    "inputPins": [pin(author_path), pin(material_path)],
    "findingIds": ["B-DELIVERY-2", "B-DELIVERY-3", "B-DELIVERY-4"],
    "boundary": "Four baseline case briefs, eight taskDemand fields only. Whole givens, calculations, solutions, rubrics, requirements and fresh fields remain intact in the immutable original staged materials. The same answer never supplies two independent demonstrations; there is no extra task quota.",
    "records": [],
    "changes": [],
}
for ri, material_indices in [(2, [0]), (3, [1, 2]), (4, [3])]:
    record = author["records"][ri]
    old = record["wholeProposedProfile"]
    new = copy.deepcopy(old)
    for ci, mi in enumerate(material_indices):
        material = materials[mi]
        for locale, suffix in [("de", "De"), ("en", "En")]:
            field = "taskDemand" + suffix
            marker = "Ganzes zugeordnetes Material: " if locale == "de" else "Complete assigned material: "
            brief = material["given" + suffix] + "\n" + tasks[mi][locale]
            brief += "\n" + marker + str(material_path.relative_to(REPO)) + "#/materials/" + str(mi)
            new["applicationCaseBriefs"][ci][field] = brief
            output["changes"].append({"goalId": record["goalId"], "caseIndex": ci, "field": field, "before": old["applicationCaseBriefs"][ci][field], "after": brief})
    output["records"].append({"goalId": record["goalId"], "wholeProposedProfile": new})

assert len(output["changes"]) == 8
assert len(output["records"]) == 3
destination = ROOT / "AUTHOR.three-whole-profiles-four-staged-baselines.pending.json"
assert not destination.exists(), "Do not overwrite an existing candidate"
destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(pin(destination)))
