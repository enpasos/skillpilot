#!/usr/bin/env python3
"""Prepare one actually read LK source clause, preserving historical bytes."""
# SPDX-License-Identifier: Apache-2.0
import copy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
BASE = OUT.parent
SOURCE = "mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-gleichgewichte-009-dc7fb7b0"
TARGET = "a8ddb351-3501-5b6d-a908-c82a5d2f14d4"
ORIGINAL_PARTNER = "580b3616-f121-5d82-ac6b-fc24f145fbdc"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def bind(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def write(name, data):
    path = OUT / name
    assert not path.exists(), f"Do not replace historical author input: {path}"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return bind(path)


plan_path = BASE / "chemie-b008-source-atlas-rest-twenty-neutral-planning-a-v1/next-source-atlas-rest20-whole-source-context.planning-candidate.input.json"
landscape_path = BASE / "chemie-b008-current-twenty-six-native-preparation-author-v1/candidate/canonical504-current26-resource-links.inactive.json"
extraction_path = ROOT / "curricula/DE/Gymnasium/input/MV/upper-secondary/source-extraction/DE_MV_CHEMIE_SEKII_RAHMENPLAN_ERPROBUNGSFASSUNG_2022.source-extraction.json"
mapping_path = ROOT / "curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json"
primary_path = ROOT / "curricula/DE/Gymnasium/input/MV/Chemie_Gymnasium_11_12_Erprobungsfassung.pdf"
plan, landscape, extraction, mapping = [load(p) for p in [plan_path, landscape_path, extraction_path, mapping_path]]
goals = {g["id"]: g for g in landscape["goals"]}
source = next(g for g in extraction["sourceGoals"] if g["id"] == SOURCE)
passage = next(p for p in extraction["passages"] if p["id"] == source["passageId"])
decision_index, decision = next((i, d) for i, d in enumerate(mapping["decisions"]) if d["sourceGoalId"] == SOURCE)
edges = [{"jsonPointer": f"/mappings/{i}", "wholeOriginalEdge": e} for i, e in enumerate(mapping["mappings"]) if e["legacyGoalId"] == SOURCE]
assert decision["canonicalGoalIds"] == [ORIGINAL_PARTNER]
assert len(edges) == 1 and edges[0]["wholeOriginalEdge"]["canonicalGoalId"] == ORIGINAL_PARTNER
assert source["sourceText"] == "Zusammenhang zwischen KC und Kp mithilfe der Zustandsgleichung idealer Gase ableiten"

proposal = copy.deepcopy(decision)
proposal.update({
    "canonicalGoalIds": [TARGET], "matchType": "partial", "reviewedAt": "2026-10-09",
    "reviewer": "/root (author candidate; independent review pending)",
    "rationale": "Tatsächlich gelesener Primärsatz im LK-Zusatzblock, physische PDF-Seite27/gedruckte23, Spalte Hinweise und Anregungen: Kc/Kp aus idealer Gasgleichung ableiten. Kandidatenroute zum aktuellen Kp/Kc-Atom deckt Umrechnung unter diesen Modellannahmen; ein nachvollziehbarer Herleitungsfall und begründete Modell-/Einheitsgrenzen sind vor D/P-Abschluss erforderlich. Die alte exakte Zuordnung desselben Satzes zu O2/CO2/H2-Nachweisreaktionen ist semantisch unbegründet und wird in dieser gezielten Kandidatenentscheidung nicht als gültige Quelle fortgeschrieben. Das Gasnachweisziel, alle seine anderen Klauseln und der alte Review bleiben erhalten. Keine pauschale HE/BY-Pflicht, kein GK-Auftrag und keine gesamte Gasgleichgewichts-/Quellenfamilienfreigabe.",
})
new_edge = {"legacyGoalId": SOURCE, "canonicalGoalId": TARGET, "matchType": "partial", "reviewDecisionId": SOURCE}
inputs = [bind(p) for p in [plan_path, landscape_path, extraction_path, mapping_path, primary_path, OUT / "primary/MV-actual-physical-page-026.txt", OUT / "primary/MV-actual-physical-page-027.txt", OUT / "primary/MV-actual-physical-page-027.png"]]
item = write("one-whole-KpKc-goal-actual-MV-clause-and-original-gas-partner.author-candidate.json", {
    "schemaVersion": 1, "role": "One bounded actual-primary source author candidate; no scientific independence or active approval",
    "author": "/root", "createdAt": datetime.now(timezone.utc).isoformat(), "actualInputs": inputs,
    "wholeCurrentProspectiveTarget": goals[TARGET], "wholeOriginalSourceGoal": source,
    "wholeOriginalPassage": passage, "wholeOriginalDecision": decision,
    "originalDecisionJsonPointer": f"/decisions/{decision_index}", "wholeOriginalEdges": edges,
    "wholeOriginalPartner": goals[ORIGINAL_PARTNER],
    "allOtherOriginalGasPartnerMappingEdgesUnchanged": [e for e in mapping["mappings"] if e["canonicalGoalId"] == ORIGINAL_PARTNER and e["legacyGoalId"] != SOURCE],
    "proposedCurrentDecision": proposal, "proposedCurrentEdge": new_edge,
    "actualPrimaryReading": {
        "wholeOriginalPageTextRead": [26, 27], "actualRasterViewed": 27,
        "printedPageForKpKc": 23, "oldExtractedPrinted22DoesNotLocateKpKcClause": True,
        "actualColumn": "Hinweise und Anregungen", "actualCourseBlock": "zusätzlich für den Leistungskurs",
        "adjacentBindingContent": "Massenwirkungsgesetz: Berechnungen zu weiteren chemischen Gleichgewichten; MWG bei Gasgleichgewichten",
        "LKInstructionWording": "Der Zusammenhang zwischen KC und Kp mithilfe der Zustandsgleichung idealer Gase ist abzuleiten.",
        "notMislabelledAsLeftVerbindlicheInhalteBullet": True,
        "originalPrimaryAndExtractionUnchanged": True,
    },
    "scientificAuthorConditions": {
        "dimensionalConvention": "With dimensional textbook quotients Kp=product(pi^nu_i), Kc=product(ci^nu_i), pi=ciRT, hence Kp=Kc(RT)^deltaNuGas. Units, R and concentration/pressure conventions must match. Negative, positive and zero gas-mole change need genuine examples.",
        "normalizedConvention": "With dimensionless p_i/p0 and c_i/c0 quotients, Kp=Kc(RT*c0/p0)^deltaNuGas. Omitting standards while claiming dimensionless constants is not accepted.",
        "modelLimits": "Same balanced reaction, gas species only in deltaNu, fixed common temperature, ideal gases; high-pressure nonideality needs fugacities, not blind use of this formula. Pure solids/liquids do not add gas exponents. Converted numerical quotients and the thermodynamic activity constant must not be conflated.",
        "scopeAdditionPending": "An exact MV-LK placement and its current page/context/applicability bindings require independent review. Existing BY/HE tags are neither a source witness nor automatically extended.",
        "oldGasPartnerDuty": "Keep the complete gas-identification goal and its actual source duties. Preserve historical incorrect exact edge as input evidence; do not count it as current Kp/Kc coverage. Affected protected gas goal contexts require targeted real binding review before integration.",
    },
    "ordinaryFullSourceAtlasApproval": False, "ordinary395GuardLowered": False,
    "sourceOrCourseMetadataHashOnlyApproval": False, "independentReviews": [],
    "currentGoalD_P_A_M_VApproval": False, "newStrictClosures": 0,
    "historicalArtifactsRewritten": False, "activeWrites": False, "humanApproval": False, "humanTrial": False,
})
first = write("one-actual-MV-clause-and-gas-partner.author-first.freeze.json", {
    "schemaVersion": 1, "role": "Actual one-source author input FIRST before independent reviews",
    "createdAt": datetime.now(timezone.utc).isoformat(), "inputs": inputs, "output": item,
    "oldFalseExactMappingApprovalReused": False, "activeWrites": False, "humanApproval": False,
})
entry = write("neutral-one-MV-KpKc-primary-clause-and-preserved-original-gas-goal.author-review.entry.json", {
    "schemaVersion": 1, "role": "Neutral one actual-primary author entry for independent whole source/goal/partner review",
    "input": item, "authorFirst": first, "targetGoalId": TARGET, "originalGasPartnerId": ORIGINAL_PARTNER,
    "wholeSourceFamilyOrSource395Approval": False, "activeWrites": False, "strictGain": 0, "humanApproval": False,
})
print(json.dumps({"entry": entry, "input": item, "first": first}, ensure_ascii=False))
