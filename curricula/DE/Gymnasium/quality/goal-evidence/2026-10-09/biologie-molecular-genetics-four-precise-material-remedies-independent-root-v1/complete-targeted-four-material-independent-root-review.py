#!/usr/bin/env python3
"""Seal the actual bounded material review, preserving all historical FIRSTs."""
# SPDX-License-Identifier: Apache-2.0
import copy
from datetime import datetime, timezone
from fractions import Fraction
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
AUTHOR = OUT.parent / "biologie-molecular-genetics-twenty-three-whole-author-v1"
TARGETS = [
    "76ad2d40-496b-5fa8-97e8-7711f9859738",
    "a515e493-6f90-5371-9470-28a0cf50f087",
    "22711af8-1184-584c-9707-1192799bfa22",
    "0eddd781-90aa-5120-a24f-c7e38327162c",
]


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def binding(path):
    data = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write(name, data):
    path = OUT / name
    assert not path.exists(), f"Preserve existing historical artifact: {path}"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return binding(path)


def changes(before, after, prefix=""):
    if isinstance(before, dict) and isinstance(after, dict):
        return [p for key in sorted(before.keys() | after.keys()) for p in changes(before.get(key), after.get(key), f"{prefix}/{key}")]
    if isinstance(before, list) and isinstance(after, list) and len(before) == len(after):
        return [p for i, (old, new) in enumerate(zip(before, after)) for p in changes(old, new, f"{prefix}/{i}")]
    return [] if before == after else [prefix]


input_first = read(OUT / "four-targeted-material-remedies.actual-input-FIRST.freeze.json")
for expected in input_first["actualInputs"]:
    assert binding(ROOT / expected["path"]) == expected
versions = {v: read(AUTHOR / f"remediation-v{v}/twenty-three-whole46-bilingual-cases-and-P.v{v}.author-candidate.json") for v in [2, 3, 4]}
entries = {v: {r["goalId"]: r for r in data["entries"]} for v, data in versions.items()}
assert all(len(rows) == 23 for rows in entries.values())
assert set(entries[2]) == set(entries[3]) == set(entries[4])
for gid in entries[2]:
    assert entries[2][gid]["wholeCurrentGoal"] == entries[3][gid]["wholeCurrentGoal"] == entries[4][gid]["wholeCurrentGoal"]
    if gid in TARGETS[:3]:
        assert entries[3][gid] == entries[4][gid]
    elif gid != TARGETS[3]:
        assert entries[2][gid] == entries[3][gid] == entries[4][gid]
splice_delta = changes(entries[3][TARGETS[3]], entries[4][TARGETS[3]])
assert splice_delta == [
    "/newAuthoredWholeCases/0/workedFreshTransferDe", "/newAuthoredWholeCases/0/workedFreshTransferEn",
    "/wholeProfile/applicationCaseBriefs/0/expectedPerformanceDe", "/wholeProfile/applicationCaseBriefs/0/expectedPerformanceEn",
]
p_set = read(AUTHOR / "remediation-v4/twenty-three-whole-positive-profile-candidate-set.v4.author.json")
assert len(p_set["goals"]) == 23
for row in p_set["goals"]:
    assert row["profile"] == entries[4][row["goalId"]]["wholeProfile"]

# Independently derived complements, antiparallel primers and quantitative limits.
complement = str.maketrans("ATGC", "TACG")
models = []
for upper, lower, forward, reverse in [
    ("ATGCCTAAAGGT", "TACGGATTTCCA", "ATG", "ACC"),
    ("GCATTACCGAAT", "CGTAATGGCTTA", "GCA", "ATT"),
]:
    assert upper.translate(complement) == lower
    assert forward == lower[:3].translate(complement)
    assert reverse == upper[-3:].translate(complement)[::-1]
    models.append({"upper5to3": upper, "lower3to5": lower, "forward5to3": forward, "reverse5to3": reverse,
                   "reverseFullComplement5to3": lower[::-1], "antiparallelAnd5to3Extension": True})
assert models[1]["reverseFullComplement5to3"] == "ATTCGGTAATGC"
mismatch_positions = [i for i, (a, b) in enumerate(zip("AAA", "ATT")) if a != b]
assert mismatch_positions == [1, 2] and 2 in mismatch_positions
expected_nonideal = Fraction(10) * Fraction(18, 10) ** 2
assert expected_nonideal == Fraction(162, 5)
counts = {"oneDuplexAfterTwoCycles": 1 * 2**2, "twoDuplexesAfterFiveCycles": 2 * 2**5,
          "threeDuplexesAfterFourCycles": 3 * 2**4, "newSingleUpperStrandsTwoOriginalTemplatesThreeOnePrimerCycles": 2 * 3}
assert list(counts.values()) == [4, 64, 48, 6]
lineages = [{"old": ["O-upper", "O-lower"], "cycle1New": ["N1-lower", "N1-upper"]},
            {"duplexes": [["O-upper", "N2-lower"], ["N1-lower", "N2-upper"], ["O-lower", "N2-upper"], ["N1-upper", "N2-lower"]]}]

stimuli = read(AUTHOR / "remediation-v3/complete24-chromosome-type-stimuli.two-distinct-cases-and-fresh-variation.author.json")
assert stimuli["types"] == [str(i) for i in range(1, 23)] + ["X", "Y"]
totals = {}
for group in ["case1", "case2", "fresh2"]:
    totals[group] = {}
    for label, row in stimuli[group].items():
        assert set(row) == set(stimuli["types"])
        assert all(isinstance(n, int) and n >= 0 for n in row.values())
        totals[group][label] = sum(row.values())
assert totals == {"case1": {"A": 46, "B": 47, "C": 45, "D": 69}, "case2": {"T": 47, "T2": 47, "R": 46}, "fresh2": {"Q": 47}}
assert all(stimuli["case1"]["D"][str(i)] == 3 for i in range(1, 23))
assert stimuli["case1"]["D"]["X"] + stimuli["case1"]["D"]["Y"] == 3
k_cases = entries[4][TARGETS[2]]["newAuthoredWholeCases"]
assert k_cases[0]["completeChromosomeCountStimulus"] == stimuli["case1"]
assert k_cases[1]["completeChromosomeCountStimulus"] == stimuli["case2"]
assert k_cases[1]["freshCompleteChromosomeCountStimulus"] == stimuli["fresh2"]
assert len(stimuli["plantFresh"]["types"]) * stimuli["plantFresh"]["referenceCopiesEach"] == 10
assert len(stimuli["plantFresh"]["types"]) * stimuli["plantFresh"]["candidateCopiesEach"] == 20

helper = read(AUTHOR / "remediation-v3/finite-GA-two-complete-strand-and-cycle-models.DEEN.author-material.json")
ga_cases = entries[4][TARGETS[1]]["newAuthoredWholeCases"]
helper_deltas = []
for old, new in zip(helper["cases"], ga_cases):
    old_body, new_body = copy.deepcopy(old), copy.deepcopy(new)
    new_body.pop("targetedMaterialSuccessorOf", None)
    delta = changes(old_body, new_body)
    assert delta == ["/rubric/0/criterionDe", "/rubric/0/criterionEn", "/rubricReference/path"]
    helper_deltas.append({"caseId": new["caseId"], "differentFields": delta,
                          "allStimulusTaskWorkedAndFreshTransferFieldsExact": True,
                          "historicalHelperRubricIsNotCurrentPApproval": True})
for ea_case in entries[4][TARGETS[0]]["newAuthoredWholeCases"]:
    expected = ea_case["corePrerequisiteExactBinding"]
    actual = binding(ROOT / expected["path"])
    assert "sha256:" + actual["sha256"] == expected["materialBinding"]["sha256"]
    assert actual["bytes"] == expected["materialBinding"]["bytes"]
assert TARGETS[1] in entries[4][TARGETS[0]]["wholeCurrentGoal"]["requires"]

primary_dir = OUT.parent / "biologie-next-molecular-genetics-twenty-three-preparation-a-v1/primary-routing-context"
primary_bindings = [binding(primary_dir / f"BY12-{course}.actual-official{suffix}") for course in ["GA", "EA"] for suffix in [".html", ".full-text.txt"]]
for gid in TARGETS:
    for case in entries[4][gid]["newAuthoredWholeCases"]:
        assert case["actualExperimentPerformed"] is False and case["actualLearnerPerformance"] is False
        assert case["rubricScope"] == "whole_evidence_pair_reference_not_individual_case_score"

now = datetime.now(timezone.utc).isoformat()
check = write("four-material-deltas-independent-complements-counts-and-boundaries.actual-check.json", {
    "schemaVersion": 1, "createdAt": now, "inputFirst": binding(OUT / "four-targeted-material-remedies.actual-input-FIRST.freeze.json"),
    "inputBindingsVerified": len(input_first["actualInputs"]), "wholeGoalsExactV2V3V4": 23,
    "untouchedWholeEntriesExactV2V3V4": 19, "threeMaterialEntriesExactV3V4": 3,
    "spliceV3V4OnlyFourActualFields": splice_delta, "ordinaryProfileBodiesExact": 23,
    "independentlyDerivedDNAModels": models, "independentLineages": lineages, "independentPCRCounts": counts,
    "nonidealExpectedYield": str(expected_nonideal), "wrongReversePrimerMismatchZeroBasedPositions": mismatch_positions,
    "independentChromosomeTotals": totals, "plantTwoSetTenAndFourSetTwenty": True,
    "helperCurrentCaseDeltas": helper_deltas, "actualPrimaryInputs": primary_bindings,
    "checksHaveNoScientificApprovalAuthority": True, "errors": [], "activeWrites": False, "strictGain": 0,
})
science = write("four-targeted-v4-material-remedies.independent-root.scientific-FIRST.json", {
    "schemaVersion": 1, "reviewer": "Root independent bounded material reviewer", "reviewedAt": now,
    "firstBeforeFreshPeerMaterialFollowupRead": True, "rootAuthoredTheseBiologyMaterials": False,
    "knownOriginalFindings": "Original B strand/cycle/karyogram holds and premature-stop precision note; own earlier two-fidelity FIRST. No fresh peer material-followup verdict read.",
    "actualReadingScope": "Four whole current goals/profiles and eight complete DE/EN cases; unchanged splice fields reused exactly from own v2 review. BY12 GA 2.3/2.4 and EA 2.3 actual primary HTML/text. No new whole23 or whole38-source approval.",
    "technicalDerivations": check,
    "boundedScientificDecisions": [
        {"goalId": TARGETS[0], "decision": "SUPPORTED_BOUNDED_SCIENTIFIC_MATERIAL", "reason": "Finite complete antiparallel old/new strand models and two explicit PCR cycles now permit the actual comparison. GA core is bound and remains a prerequisite. EA proofreading and base-excision recognition/restoration/ligase, control lesions and residual-error limits remain separate; PCR enzymes do not substitute for repair and proofreading cannot rescue a misplaced primer."},
        {"goalId": TARGETS[1], "decision": "SUPPORTED_BOUNDED_SCIENTIFIC_MATERIAL", "reason": "Heat separation, supplied annealing, thermostable 5-prime-to-3-prime extension, retained DNA primers and semiconservative cell comparison are explicit in two distinct models. 64/48 ideal results, 32.4 expectation, mismatched reverse primer and six new single strands in a one-primer linear model are coherent. Short primers and temperatures are openly finite supplied models, not real protocols; repair is not mandatory GA content."},
        {"goalId": TARGETS[2], "decision": "SUPPORTED_BOUNDED_SCIENTIFIC_MATERIAL", "reason": "All 24 chromosome types are supplied without mutation labels. Independently counted 46/47/45/69 and distinct 47/47/46 plus fresh 47 correctly separate one-type aneuploidy from complete-set triploidy. Triploid XXY is three sex chromosomes, not three of each X/Y. Plant 10-to-20 is set multiplication. Phenotype, function, possible disease and small sequence changes remain distinct and bounded by karyogram resolution."},
        {"goalId": TARGETS[3], "decision": "SUPPORTED_TARGETED_TWO_LANGUAGE_PRECISION", "reason": "Premature termination can shorten a translated polypeptide; it does not directly shorten mRNA. Decay through NMD is appropriately conditional on transcript/cell context. The original functional compatible-exon case and separate selection scope remain intact; more transcript variants do not establish more functional proteins."},
    ],
    "supplementalScholarlyReading": {"url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10685860/", "title": "How to get away with nonsense: Mechanisms and consequences of escape from nonsense-mediated RNA decay", "doi": "10.1002/wrna.1560", "readScope": "Abstract and Introduction including premature termination, position dependence and escape; not an archived full-article binding or a curricular source replacement", "paraphrase": "Premature termination can recruit RNA surveillance, but decay efficiency and escape depend on transcript features and cellular context."},
    "materialUsabilityFindings": [{
        "findingId": "BIO4-ROOT-V4-WORD-BOUNDARIES", "status": "HOLD_BEFORE_NATIVE_MATERIAL_INTEGRATION", "goalIds": TARGETS[:3],
        "observedExamples": ["Ergänzt tatsächliche alte/neuekomplementäreStränge mitEnden", "Completes actualold/newcomplementarystrands/ends,comparessemiconservativecellcopying", "Andere vollständige fiktive Anzahlmatrix; hierT/T2/R, weiterhinalleTypen1–22", "Asecond complete fictional count matrix T/T2/R,againalltypes1–22"],
        "affectedScope": "Actual DE/EN stimulus, task, response, transfer and corresponding profile/rubric prose for six new replication/PCR/karyogram cases; not unchanged scientific goals or 19 other entries.",
        "requiredRemedy": "Restore ordinary word boundaries in a new bounded author successor, preserving DNA sequences, counts, model conditions, complete matrix rows, EA/GA distinction, operative criteria and historical FIRSTs. Check actual resulting prose; no broader stylistic rewrite.",
    }],
    "bindingPrecisionNotes": ["The GA helper carries exact scientific stimulus/task/response/transfer fields but two historical criterion texts and its older rubric-reference path. Bind the current operative whole-case/profile criteria for P; the helper alone is material, not current P approval."],
    "machineNativeDescriptionApproval": False, "currentNativePVApproval": False,
    "newWhole23SourceReview": False, "humanApproval": False, "humanTrial": False,
    "newStrictClosures": 0, "restoredStrictBindings": 0, "netStrictGain": 0,
})
entry = write("neutral-completed-four-targeted-v4-materials-independent-root.review.entry.json", {
    "schemaVersion": 1, "reviewId": "biology-molecular-four-material-root-20261009-v4",
    "scientificFirst": science, "actualTechnicalCheck": check,
    "scienceScope": "Four bounded scientific material remedies supported; three current materials require actual word-boundary correction before native integration.",
    "activeWrites": False, "humanApproval": False, "strictGain": 0,
})
freeze = write("four-targeted-v4-materials.independent-root.scientific-FIRST.freeze.json", {
    "schemaVersion": 1, "createdAt": now, "actualOwnInputFirst": binding(OUT / "four-targeted-material-remedies.actual-input-FIRST.freeze.json"),
    "actualOutputs": [check, science, entry, binding(Path(__file__))], "preserveOriginals": True,
    "freshPeerFollowupVerdictReadBeforeOwnFirst": False,
})
print(json.dumps({"entry": entry, "firstFreeze": freeze, "scienceSupported": 4, "materialUsabilityHoldGoals": 3, "strictGain": 0}))
