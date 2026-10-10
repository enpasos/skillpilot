"""Append actual root follow-up; final blind A/B campaigns stay separate."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10"
OWN = Path(__file__).resolve().parents[1]
CURRENT = BASE / "biologie-stoffwechsel-eight-two-findings-current-raster-native-technical-successor-20261010-v3"
OLD = BASE / "biologie-stoffwechsel-eight-current-raster-native-technical-preparation-20261010-v2"


def bind(path):
    path = Path(path)
    if not path.is_absolute():
        path = ROOT / path
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def write_once(path, value):
    with path.open("x") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


entry = json.loads((CURRENT / "neutral-current-native-eight-two-findings.entry.json").read_text())
old_entry = json.loads((OLD / "neutral-current-native-eight.entry.json").read_text())
before = json.loads((ROOT / old_entry["coreInputs"]["wholeScience8Cases16"]["path"]).read_text())
after = json.loads((ROOT / entry["coreInputs"]["wholeScience8Cases16"]["path"]).read_text())
old_records = {record["goalId"]: record for record in before["records"]}
new_records = {record["goalId"]: record for record in after["records"]}
ferment_id = "8e2244e1-8616-5f24-859f-8e10df1c887b"
enzyme_id = "e467ee54-7773-595f-ac1c-a60a5b7be2cf"
assert {gid for gid in old_records if old_records[gid] != new_records[gid]} == {ferment_id}
assert old_records[ferment_id]["cases"][1] == new_records[ferment_id]["cases"][1]
assert [case["id"] for r in before["records"] for case in r["cases"]] == [case["id"] for r in after["records"] for case in r["cases"]]
for gid in old_records:
    assert old_records[gid]["profile"]["expectations"] == new_records[gid]["profile"]["expectations"]
    if gid != ferment_id:
        assert old_records[gid] == new_records[gid]

math = []
for group, concentrations, gas in [("active_glucose", [76, 80, 84], [36, 38, 40]), ("no_added_glucose", [4.2, 6.3, 4.2], [2, 3, 2])]:
    for c, v in zip(concentrations, gas):
        mmol = c * .02
        formed_ml = mmol * 25.2
        fraction = v / formed_ml
        assert .9 <= fraction <= 1
        math.append({"group": group, "ethanolMmolPerL": c, "ethanolMmol": mmol, "modelFormedCO2Ml": formed_ml, "collectedCO2Ml": v, "fraction": fraction})
assert 80 * .02 / 2 * .180156 < .4

bindings = [bind(OWN / "FIRST.original-v2.actual-independent-b.json"), bind(OWN / "FIRST.original-v2.seal.json"), bind(CURRENT / "neutral-current-native-eight-two-findings.entry.json")]
bindings += list(entry["coreInputs"].values())
view_bindings = {gid: entry["actualCurrentRastersAndNativeCaptures"][gid] for gid in [enzyme_id, ferment_id]}
for values in view_bindings.values():
    bindings += list(values.values())
for ref in bindings:
    assert bind(ref["path"]) == ref

output = OWN / "FOLLOWUP.two-findings-and-current-v3.actual-root.json"
write_once(output, {
    "schemaVersion": 1,
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "role": "Actual targeted root scientific and visual follow-up; supports integration, does not replace the two normal independent blind current campaigns",
    "reviewer": "Codex /root; not author of either correction",
    "bindings": bindings,
    "actualCurrentViews": view_bindings,
    "actualViewCounts": {"newEnzymeOriginalPNG": 1, "newEnzyme360": 1, "newEnzyme680": 1, "currentWholeHTMLPages": 2, "currentWholePDFPages": 2},
    "findingResolution": [
        {"id": "B-V-01", "status": "resolved_in_current_candidate", "goalId": enzyme_id, "actualFindingDe": "Neue v4-PNG tatsächlich in Original/360/680 und ganzer current HTML/PDF-Seite gesehen: Heft entfernt, keine falsch ausgerichtete Schreibfläche mehr. Drei gleiche Röhrchenvolumina, 10/30/60 °C, gleiche Mengen und gleiche Messzeit bleiben sichtbar, keine neue konkrete fachliche oder lesbare Schwäche. 1672×941 freundliche comicartige Landschaft erhalten. Ganze native Seite mit aktuellem Text, externen Voraussetzungen, internem Nachfolger und vollständigem Footer ohne Cropping."},
        {"id": "B-P-01", "status": "resolved_in_current_candidate", "goalId": ferment_id, "actualFindingDe": "Ganzen korrigierten c1 mit DE/EN-Material, Aufgaben, vollständiger Lösung, Fresh-Transfer samt Lösung, Grenzen, Rubrik und Brief tatsächlich gelesen. 20,0ml, 30°C, 1bar, trockener CO₂-Anteil und 25,2l/mol sind explizit. 80mmol/l×0,020l=1,60mmol Ethanol→40,32ml Modell-CO₂; gesammelt38ml≈94,25%, innerhalb deklarierter90–100%-Grenze. Alle aktiven und no-glucose-Kontrollpaare geprüft. Nicht gesammelte Anteile sind Modellgrenze, keine gemessene Rückgewinnung. 0,1441g modellverbrauchte Glucose liegen unter bereitgestellten0,40g. Inaktivierte Gruppe bleibt unter Nachweisgrenzen, frischer Atmungs-Transfer unverändert. Ganze aktuelle HTML/PDF-Seite ist vollständig; Stoffbilanz bleibt separate P-Evidenz statt Bildbeschriftung. Keine tatsächliche Messung/Lernerprobung behauptet."},
    ],
    "independentlyRecomputedSixPairs": math,
    "actualWholeSciencePreservation": {"sevenOtherWholeRecordsExact": True, "fermentationC2WholeExact": True, "all16CaseIdsExact": True, "allEightExpectationsWholeExact": True},
    "sixOtherNativePages": "Earlier actual whole-v2 views retained only with exact page/model/context identity; global book digest changes are technical binding updates, not new scientific review",
    "additiveOriginalFirstWordingCorrection": "Die frühere Hygieneseiten-Notiz 'beide Sprachen' ist zu präzisieren: tatsächlich sichtbare native Seiten sind deutsch; die ganzen DE/EN-Zielkörper und DE/EN-Profile/Fälle wurden separat gelesen. Keine englische Seitenansicht wird behauptet. Original FIRST bleibt unverändert.",
    "finalNormalIndependentAAndB": "PENDING; separately assigned reviewers must finish their current normal campaigns before active adoption",
    "evidenceLevel": "E1",
    "maximumClaimScope": "G1",
    "status": "ai_candidate",
    "reviewAuthority": "needs_human_review",
    "humanApproval": False,
    "humanTrial": False,
    "learnerWork": False,
    "activeWrites": False,
    "historicalWrites": False,
    "newStrictCompletions": 0,
    "restoredActiveBindings": 0,
    "strictNetGain": 0,
})
write_once(OWN / "FOLLOWUP.current-v3.freeze.json", {"schemaVersion": 1, "role": "Append-only current targeted root follow-up seal", "ownBindings": [bind(output), bind(__file__)], "externalBindings": bindings, "hashVerificationIsScientificReview": False, "strictNetGain": 0, "humanApproval": False})
print(json.dumps({"followup": bind(output), "freeze": bind(OWN / "FOLLOWUP.current-v3.freeze.json"), "newActualViews": 7, "openOriginalRootFindingsInCandidate": 0, "activeGain": 0}))
