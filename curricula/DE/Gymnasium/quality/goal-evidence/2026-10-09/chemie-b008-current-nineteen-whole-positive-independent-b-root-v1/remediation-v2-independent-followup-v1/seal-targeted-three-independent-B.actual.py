# SPDX-License-Identifier: Apache-2.0
"""Record the root's actual targeted science review and exact reuse checks."""
import csv
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

ROOT = next(parent for parent in Path(__file__).resolve().parents if (parent / "AGENTS.md").is_file() and (parent / ".git").exists())
HERE = Path(__file__).resolve().parent
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09"
AUTHOR = BASE / "chemie-b008-current-nineteen-whole-positive-author-v1"
REVISION = AUTHOR / "remediation-v2"


def read(path):
    return json.loads(path.read_text())


def binding(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def exact(ref):
    actual = binding(ROOT / ref["path"])
    assert actual == {k: ref[k] for k in actual}, ref["path"]
    return actual


def pointer(value, address):
    for part in address.split("/")[1:]:
        part = part.replace("~1", "/").replace("~0", "~")
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def digest_value(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def write_new(name, value):
    path = HERE / name
    with path.open("x") as stream:
        json.dump(value, stream, indent=2, ensure_ascii=False)
        stream.write("\n")
    return binding(path)


first = read(HERE / "targeted-three-current-original.input.first.freeze.json")
exact_inputs = [exact(ref) for ref in first["bindings"]]
entry = read(REVISION / "neutral-targeted-three-whole-positive-material-remediation-v2.author.entry.json")
changed = set(entry["changedGoalIds"])
old = read(AUTHOR / "nineteen.normal-positive-candidate-set.author-candidate.json")
new = read(REVISION / "nineteen.normal-positive-candidate-set.v2-final.author-candidate.json")
assert len(old["goals"]) == len(new["goals"]) == 19
unchanged = []
changed_actual = []
for original, current in zip(old["goals"], new["goals"]):
    assert original["goalId"] == current["goalId"]
    if original["goalId"] in changed:
        assert original != current
        changed_actual.append(current["goalId"])
    else:
        assert original == current
        unchanged.append({"goalId": current["goalId"], "wholeCandidateValueSha256": digest_value(current)})
assert len(unchanged) == 16 and set(changed_actual) == changed

archived = read(AUTHOR / "thirty-eight-whole-case-worked-transfer.supplement.author-candidate.json")
assert len(archived["entries"]) == 38
resolved_originals = []
for row in archived["entries"]:
    ref = row["wholeOriginalCase"]
    exact(ref["input"])
    value = pointer(read(ROOT / ref["input"]["path"]), ref["jsonPointer"])
    assert digest_value(value) == ref["valueSha256"]
    resolved_originals.append({"goalId": row["goalId"], "caseKey": row["caseKey"], "jsonPointer": ref["jsonPointer"], "valueSha256": digest_value(value)})

successors = read(REVISION / "four-operative-whole-case-successors.author-candidate.json")
assert len(successors["entries"]) == 4
for row in successors["entries"]:
    ref = row["wholeOriginalCaseBinding"]
    exact(ref["file"])
    original = pointer(read(ROOT / ref["file"]["path"]), ref["jsonPointer"])
    assert digest_value(original) == ref["valueSha256"]
    assert {**original, **row["replacementFields"]} == row["operativeWholeCase"]

blank_materials = []
for name, delimiter, leading_columns in [
    ("own-source-search-read-cite.learner-blank.csv", ",", 0),
    ("standard-check-and-temperature.learner-blank.csv", ",", 0),
    ("ligand-contact-comparison.learner-blank.tsv", "\t", 1),
]:
    path = REVISION / name
    rows = list(csv.reader(path.read_text().splitlines(), delimiter=delimiter))
    assert len(rows) > 1
    assert all(len(row) == len(rows[0]) and all(not cell for cell in row[leading_columns:]) for row in rows[1:])
    blank_materials.append({**binding(path), "headerColumns": len(rows[0]), "learnerRows": len(rows) - 1, "noCompletedLearnerReadingsOrResearch": True})

proof = write_new("actual-targeted-three-original-preservation-and-blank-materials.independent-B.json", {
    "schemaVersion": 1,
    "role": "actual-independent-technical-countercheck-after-substantive-science-reading",
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "actualInputBindings": exact_inputs,
    "unchangedWholeCandidates": unchanged,
    "changedWholeCandidateIds": changed_actual,
    "all38OriginalWholeCasePointers": resolved_originals,
    "operative4CasesExactlyOriginalPlusDeclaredFields": True,
    "blankLearnerMaterials": blank_materials,
    "historicalOriginalsWritten": False,
    "activeWrites": False,
    "strictGain": 0,
})

verdict = write_new("targeted-three-current-whole-material.first-followup.independent-B.verdict.json", {
    "schemaVersion": 1,
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "reviewer": "Codex/root; independent B; not the material author",
    "role": "targeted-independent-scientific-followup-on-three-changed-material-candidates",
    "reviewInputFirst": binding(HERE / "targeted-three-current-original.input.first.freeze.json"),
    "actualCandidate": binding(REVISION / "nineteen.normal-positive-candidate-set.v2-final.author-candidate.json"),
    "actualTechnicalPreservation": proof,
    "actualWholeOperativeFieldDiff": binding(HERE / "four-actual-operative-successors.independent-B.exact-field-diff.json"),
    "actualIndependentGeometryAndPrintableCheck": binding(HERE / "actual-finite-geometry-and-printable-materials.independent-B.json"),
    "reviewScope": "Only ROOT19-001, ROOT19-002 and CHEM19A-001 changed whole-material components; 16 prior independently reviewed whole candidates reused exactly.",
    "independenceDisclosure": {
        "wholePeerFollowupVerdictReadBeforeThisSeal": False,
        "peerOutcomeSummaryReceivedBeforeFinalMechanicalPreservationCheck": True,
        "rootSubstantivePrimaryProfileRecipeAndGeometryReadingPrecededThatSummary": True,
        "blindFirstClaim": False,
        "ownScientificReasonsAndCalculationsUsed": True,
        "authorOrPeerReasonsCopied": False,
    },
    "reviews": [
        {
            "goalId": "e81a4aed-9695-533e-8eb7-7a0c714346ea",
            "findingId": "ROOT19-001",
            "decision": "ACCEPT_BOUNDED_MATERIAL_CANDIDATE",
            "actualRead": "Whole DE/EN goal/profile, conductivity and unchanged dissolution cases, all operative replacements, blank standard log, worked example and ordinary author receipt.",
            "reasonDe": "0–5000 µS/cm deckt 1990±20, also 1970–2010, vollständig ab. Der kleinere 0–2000-Bereich dient ausdrücklich nur der Blindprobe, der Salzprobe mindestens 100 mS/cm. Anzeigeauflösung wird nicht als Genauigkeit oder bestandene Prüfung ausgegeben. Temperaturangleich auf tatsächlich gemessene 25 °C, Gerätespezifikation, Kompensation, Standardcharge/Gültigkeit, echte Rohanzeige und Abbruch werden operativ und im Kriterium verlangt. Die eigene höhere Planungsroute besitzt bereits einen ausreichenden Messbereich und bleibt unverändert.",
            "remainingBoundary": "Keine Messung oder menschliche Sicherheitsfreigabe durchgeführt; späterer Gerätestandard ist real zu prüfen, nicht durch die KI-Rechnung bestätigt.",
        },
        {
            "goalId": "5b1bb5d9-07b1-5ba9-b320-cc97be917c60",
            "findingId": "ROOT19-002",
            "decision": "ACCEPT_BOUNDED_MATERIAL_CANDIDATE",
            "actualRead": "Whole DE/EN goal/profile, both source-information cases and new scope/task/rubric fields, OWN-SOURCE-RESEARCH full DE/EN route, empty learner log, actual author reference examples, original BY9NTG complete LB1 passage and actual gesund.bund/UBA reference sections.",
            "reasonDe": "Die BY C9 NTG LB1-Pflicht vorgegebener UND selbst recherchierter Quellen wird als zusätzlicher präziser Quellenweg erhalten. Eigene Frage und Suche/Navigation, tatsächliches Öffnen und Lesen, genaue Fundstelle/Urheber/Datum/Abruf, fachliche Auswahl und Paraphrase, adressatengerechte Fassungen und neue Frage sind tatsächlich bearbeitbar und prüfbar. Vorgegebene Autorenquellen/Musterparaphrasen ersetzen die eigene Leistung nicht. Das kanonische ODER und andere Sek-I-Quellenwege bleiben erhalten. Lehrmodellzahlen werden nicht zu externen Befunden, Masse nicht zur Umweltbilanz und Haushaltsinformationen nicht zur tatsächlich ausgeführten Reinigung.",
            "remainingBoundary": "Die Originalquelle enthält tatsächlich diese Klausel; die beim Nachlauf geöffnete generische Lehrplan-Webseite lieferte keinen eigenen aktuellen Klauseltext. Keine nationale Partner-/Kurs-/Atlasfreigabe oder tatsächlich ausgeführte Lernendenrecherche.",
        },
        {
            "goalId": "86d34f1f-692d-5522-a9a4-a71c65b24de7",
            "findingId": "CHEM19A-001",
            "decision": "ACCEPT_BOUNDED_MATERIAL_CANDIDATE",
            "actualRead": "Whole DE/EN goal/profile, original CO2/H2O and complex receptor/enzyme demands, whole changed case plus fresh OH transfer, full finite recipe, both 28-atom poses, connectivity, all 60 printable cards/28 rods, independent planarity/angle/distance calculations and empty contact log.",
            "reasonDe": "Das hypothetische NH3+/Amid/Phenyl-Gerüst ist jetzt vollständig geometrisch aufbaubar. Beide Posen erhalten 28 Atome, Valenz/Bindungen, terminales +1, tetraedrische gesättigte Zentren sowie planaren Amid-/Phenylbereich. Die eigenen Berechnungen ergeben L-Kontakte 3,40/2,00/3,50 und 180°; L2 verändert allein den Ammoniumkontakt auf etwa 6,19. Rezeptorzentren und frei definierte Kontaktregeln sind Lehrmodell, kein berechnetes Protein oder klinischer Wirkstoff. Die frische OH-Gruppe erzeugt ausdrücklich ein anderes Derivat, repariert den alten Kontakt nicht und belegt keine stärkere Affinität. Analoge eigene Anordnung UND digitale theta-Tabelle, Bindungsverhältnisse/Geometrie UND Wirkstoff–Rezeptor/Substrat–Enzym, ES-Hydrolyse mit Wasser und erhaltenem Enzym sowie Modellkritik bleiben verpflichtend.",
            "remainingBoundary": "Keine tatsächliche Konstruktion, digitale Lernendendatei, Dockingmessung, reale Kd-Bestimmung oder klinische Wirkung nachgewiesen.",
        },
    ],
    "resolvedFindingsOnlyAtMaterialCandidateScope": ["ROOT19-001", "ROOT19-002", "CHEM19A-001"],
    "unchangedPriorMaterialCandidatesReused": 16,
    "freshTargetedMaterialCandidates": 3,
    "currentNativeD_P_A_M_VApproval": False,
    "wholeSource19AndNationalCourseApproval": False,
    "protected177ContextReviewComplete": False,
    "actualLearnerResearchPerformed": False,
    "physicalExperimentPerformed": False,
    "physicalCardsPrintedOrConstructed": False,
    "humanApproval": False,
    "humanTrial": False,
    "strictGain": 0,
    "newScientificClosures": 0,
    "restoredBindings": 0,
    "activeWrites": False,
})
seal = write_new("targeted-three-current-whole-material.first-followup.independent-B.freeze.json", {
    "schemaVersion": 1,
    "role": "immutable-root-science-followup-before-reading-whole-peer-followup-verdict",
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "bindings": [verdict, proof, binding(Path(__file__))],
    "peerSummaryExposureDisclosedInVerdict": True,
    "humanApproval": False,
    "strictGain": 0,
})
print(json.dumps({"actualExactInputs": len(exact_inputs), "unchangedWholeCandidates": 16, "resolvedWholeOriginalCases": 38, "freshMaterialCandidates": 3, "verdict": verdict, "seal": seal}, ensure_ascii=False))
