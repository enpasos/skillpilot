# SPDX-License-Identifier: Apache-2.0
"""Narrow inert author revision; never writes active or previous evidence files."""
from pathlib import Path
import copy
import hashlib
import json
import sys
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
PREVIOUS = OWN.with_name(OWN.name[:-2] + "v1")
TARGET = "ffef97e3-12d6-5090-9816-46ab9e57fae2"
CASE = "missense-in-frame-loss-and-copy-trace"
PROTECTED = "a46cafde-7359-5249-8754-19aaa3174ba4"
NOW = datetime.now(timezone.utc).isoformat()


def read(p):
    return json.loads(Path(p).read_text())


def relative(p):
    return str(Path(p).resolve().relative_to(ROOT))


def digest(b):
    return hashlib.sha256(b).hexdigest()


def binding(p):
    b = Path(p).read_bytes()
    return {"path": relative(p), "sha256": digest(b), "bytes": len(b)}


def write(p, value):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("x") as f:
        if isinstance(value, str):
            f.write(value)
        else:
            f.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def snapshot(p, inputs):
    p = Path(p).resolve()
    existing = next((r for r in inputs if r["originalPathAtUse"] == relative(p)), None)
    if existing:
        return existing
    b = p.read_bytes()
    dest = OWN / "declared-input-snapshots" / f"{len(inputs)+1:03d}-{p.name}.bin"
    dest.parent.mkdir(exist_ok=True)
    with dest.open("xb") as f:
        f.write(b)
    row = {**binding(dest), "originalPathAtUse": relative(p), "originalSHA256AtUse": digest(b), "exactByteSnapshot": True}
    inputs.append(row)
    return row


def diffs(before, after, prefix=""):
    if before == after:
        return []
    if isinstance(before, dict) and isinstance(after, dict):
        result = []
        for key in sorted(set(before) | set(after)):
            path = prefix + "/" + key
            if key not in before:
                result.append({"field": path, "operation": "add", "after": after[key]})
            elif key not in after:
                result.append({"field": path, "operation": "remove", "before": before[key]})
            else:
                result += diffs(before[key], after[key], path)
        return result
    return [{"field": prefix, "operation": "replace", "before": before, "after": after}]


def row_key(row, collection):
    if collection == "mappings":
        return (row["legacyGoalId"], row["canonicalGoalId"])
    return row.get("sourceGoalId") or row["id"]


def row_changes(before, after, collection):
    b = {row_key(r, collection): r for r in before}
    a = {row_key(r, collection): r for r in after}
    assert len(b) == len(before) and len(a) == len(after)
    rows = []
    for key in sorted(set(b) | set(a), key=str):
        if b.get(key) != a.get(key):
            rows.append({"identity": list(key) if isinstance(key, tuple) else key, "before": b.get(key), "after": a.get(key), "fieldChanges": diffs(b.get(key), a.get(key))})
    return rows


def prepare():
    if (OWN / "author.final.freeze.json").exists():
        raise RuntimeError("Author v2 is already sealed")
    previous_freeze = read(PREVIOUS / "author.final.freeze.json")
    previous_errors = [r["path"] for r in previous_freeze["payloads"] if binding(ROOT / r["path"])["sha256"] != r["sha256"]]
    assert not previous_errors, previous_errors
    inputs = []
    essential = [ROOT / "AGENTS.md", ROOT / "LICENSING.md", PREVIOUS / "author.final.freeze.json", PREVIOUS / "README.md", PREVIOUS / "four-current-native-whole-goals-cases-source-review-input.author.raw.json", PREVIOUS / "native/positive-four.current-author-candidate.jsonl", PREVIOUS / "native/positive-four.actual-resource-binding.validation.json", PREVIOUS / "declared-input-snapshot-index.actual.json", ROOT / "app/scripts/positiveGoalEvidenceProfileModel.ts", ROOT / "app/scripts/goalEvidenceProfileModel.ts", ROOT / "contracts/goal-evidence/v2/goal-evidence-profile.schema.json"]
    for p in essential:
        snapshot(p, inputs)
    raw = read(PREVIOUS / "four-current-native-whole-goals-cases-source-review-input.author.raw.json")
    records = [json.loads(s) for s in (PREVIOUS / "native/positive-four.current-author-candidate.jsonl").read_text().splitlines() if s.strip()]
    changed = copy.deepcopy(records)
    profile = next(r for r in changed if r["goalId"] == TARGET)["profile"]
    case = next(c for c in profile["applicationCaseBriefs"] if c["id"] == CASE)
    original = copy.deepcopy(case)
    before_de = "Ein anderer codierender DNA-Strang 5′-ATG TTT GGC AAG TAA-3′ wird mit vier neuen, voneinander getrennten Varianten und einer Code-Tabelle gezeigt:"
    before_en = "A different coding DNA strand 5′-ATG TTT GGC AAG TAA-3′ is shown with four new separate variants and a codon table:"
    after_de = "Gezeigt ist ein markierter Ausschnitt am Ende eines längeren Enzymgens: codierender DNA-Strang 5′-ATG TTT GGC AAG TAA-3′ im vorgegebenen Leserahmen. Der davorliegende Genabschnitt und der von ihm codierte Proteinabschnitt bleiben in allen Varianten unverändert und sind nicht abgebildet; die gezeigte Folge codiert nur den C-terminalen Proteinabschnitt vor dem Stopcodon, kein vollständiges Enzym. Dazu werden vier neue, voneinander getrennte Varianten und eine Code-Tabelle gezeigt:"
    after_en = "A marked excerpt at the end of a longer enzyme gene is shown: coding DNA strand 5′-ATG TTT GGC AAG TAA-3′ in the supplied reading frame. The preceding gene region and the protein region it encodes remain unchanged in all variants and are not shown; the displayed sequence encodes only the C-terminal protein segment before the stop codon, not a complete enzyme. Four new separate variants and a codon table are supplied:"
    assert case["taskDemandDe"].startswith(before_de)
    assert case["taskDemandEn"].startswith(before_en)
    case["taskDemandDe"] = case["taskDemandDe"].replace(before_de, after_de, 1).replace("Aktivitätswerte des codierten Enzyms", "Aktivitätswerte des vollständigen codierten Enzyms", 1)
    case["taskDemandEn"] = case["taskDemandEn"].replace(before_en, after_en, 1).replace("lower activity of the encoded enzyme", "lower activity of the complete encoded enzyme", 1)
    assert {c["field"] for c in diffs(original, case)} == {"/taskDemandDe", "/taskDemandEn"}
    for row in raw["wholeFourGoals"]:
        row["wholeNativePAuthorCandidate"] = next(r for r in changed if r["goalId"] == row["goalId"])
        image = PREVIOUS / "selected-existing-images" / f"{row['goalId']}.png"
        snapshot(image, inputs)
        dest = OWN / "selected-existing-images" / image.name
        dest.parent.mkdir(exist_ok=True)
        with dest.open("xb") as f:
            f.write(image.read_bytes())
    write(OWN / "native/positive-four.current-author-candidate.jsonl", "".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n" for r in changed))
    write(OWN / "four-current-native-whole-goals-cases-source-review-input.author.raw.json", raw)
    write(OWN / "ffef-case2-DE-EN-exact-context-delta.author.json", {"role": "Author context clarification only; scientific acceptance remains independent", "goalId": TARGET, "caseId": CASE, "before": original, "after": case, "fieldChanges": diffs(original, case), "expectedAnswersChanged": False, "DNAAndVariantSequencesChanged": False})

    old_index = read(PREVIOUS / "declared-input-snapshot-index.actual.json")["inputs"]
    merge_rows = []
    for path in sorted((PREVIOUS / "source-overlays-inert").glob("*.candidate-envelope.json")):
        envelope = read(path)
        base_ref = next(i for i in old_index if i["originalPathAtUse"] == envelope["replacesPath"] and i["sha256"] == envelope["currentBaseline"]["sha256"])
        snapshot(path, inputs)
        snapshot(ROOT / base_ref["path"], inputs)
        live_ref = snapshot(ROOT / envelope["replacesPath"], inputs)
        base = read(ROOT / base_ref["path"])
        candidate = envelope["candidatePayload"]
        live = read(ROOT / live_ref["path"])
        collection_rows = {}
        candidate_protected = []
        base_protected = []
        for collection in ["mappings", "decisions", "sourceGoals"]:
            if collection in base:
                changes = row_changes(base[collection], candidate[collection], collection)
                drift = row_changes(base[collection], live[collection], collection)
                collection_rows[collection] = {"identityFields": ["legacyGoalId", "canonicalGoalId"] if collection == "mappings" else ["sourceGoalId"] if collection == "decisions" else ["id"], "baseCount": len(base[collection]), "candidateCount": len(candidate[collection]), "liveCountAtInspection": len(live[collection]), "authorChanges": changes, "liveDriftAtInspection": drift}
                candidate_protected += [r for r in candidate[collection] if PROTECTED in json.dumps(r)]
                base_protected += [r for r in base[collection] if PROTECTED in json.dumps(r)]
        top_base = {k: v for k, v in base.items() if k not in collection_rows}
        top_candidate = {k: v for k, v in candidate.items() if k not in collection_rows}
        assert top_base == top_candidate
        assert base_protected == candidate_protected
        merge_rows.append({"envelope": binding(path), "activeTargetPath": envelope["replacesPath"], "sealedAuthorBase": envelope["currentBaseline"], "sealedAuthorBaseSnapshot": base_ref, "liveInputAtInspection": live_ref, "collections": collection_rows, "topLevelAuthorChanges": [], "a46ObjectsUnchangedByAuthorOverlay": True, "wholeFileReplacementAuthorized": False})
    protected_rows = []
    for path in sorted((ROOT / "curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary").glob("*.review.json")):
        value = read(path)
        rows = [r for r in value.get("mappings", []) if r.get("canonicalGoalId") == PROTECTED and r.get("legacyGoalId") == "41b81d9c-e22d-4af7-8b89-eaf26e1ddaa8"]
        if not rows:
            continue
        ref = snapshot(path, inputs)
        protected_rows.append({"path": relative(path), "inputAtInspection": ref, "mappings": rows, "decisions": [r for r in value.get("decisions", []) if PROTECTED in json.dumps(r)], "preservationRule": "Refetch at integration; keep every current LK-only correction. These rows are a time-stamped inspection, never restoration instructions."})
    write(OWN / "source-overlay-field-level-guarded-merge.author.json", {"role": "Technical field changes only; this neither rebases active inputs nor grants source approval", "mappingLaneCount": sum("/mapping/" in r["activeTargetPath"] for r in merge_rows), "extractionFileCount": sum("/input/" in r["activeTargetPath"] for r in merge_rows), "rows": merge_rows, "mergeRule": "Refetch active file; locate each stable row identity; apply only author field changes after checking before values, or accept already matching after values. Preserve all other live fields and rows, including seven HE LK-only a46 corrections. Removed rows require equality to sealed before; added rows require absence or exact after. Stop on conflicts. Recompute derived summaries with existing native tooling only after review and authorized integration.", "protectedGoalId": PROTECTED, "a46ScientificRouteChangeProposedHere": False, "activeWrites": 0})
    write(OWN / "seven-HE-a46-live-route-preservation.author.json", {"role": "Read-only integration guard; parallel Root corrections may be newer than this snapshot", "legacyCommonRouteId": "41b81d9c-e22d-4af7-8b89-eaf26e1ddaa8", "requiredBoundedLKSourceId": "0842e366-88bc-53d6-a93e-19a4a662e31e", "a46GoalId": PROTECTED, "legacyCommonRowsStillPresentAtInspection": len(protected_rows), "rows": protected_rows, "rootReportsSevenLKOnlyCorrectionsBeingIntegrated": True, "acceptanceRequirement": "Before integration refetch all seven relevant HE files and preserve Root's latest corrections exactly. Never restore exact mapping for a46 from older author/base payloads. This snapshot does not claim the corrections have already happened.", "activeWrites": 0})
    write(OWN / "declared-input-snapshot-index.actual.json", {"role": "Exact inputs actually read in this author revision", "inputs": inputs, "previousOwnPayloadVerificationAtUse": {"payloadCount": len(previous_freeze["payloads"]), "errors": previous_errors}, "humanApproval": False})


def seal():
    if (OWN / "author.final.freeze.json").exists():
        raise RuntimeError("Author v2 is already sealed")
    records = [json.loads(s) for s in (OWN / "native/positive-four.current-author-candidate.jsonl").read_text().splitlines() if s.strip()]
    old_records = [json.loads(s) for s in (PREVIOUS / "native/positive-four.current-author-candidate.jsonl").read_text().splitlines() if s.strip()]
    raw = read(OWN / "four-current-native-whole-goals-cases-source-review-input.author.raw.json")
    original_raw = read(PREVIOUS / "four-current-native-whole-goals-cases-source-review-input.author.raw.json")
    validation = read(OWN / "native/positive-four.actual-resource-binding.validation.json")
    assert not validation["errors"] and len(validation["resourceDigests"]) == 4
    original_profiles = {r["goalId"]: r["profile"] for r in old_records}
    changed_profiles = {r["goalId"]: r["profile"] for r in records}
    profile_changes = []
    record_changes = []
    case_rows = []
    text = ["# Four whole native P author candidates: complete DE/EN cases\n", "Author candidates only: needs_human_review / ai_candidate, E1/G1, no independent run IDs or human approval.\n"]
    for old, current in zip(old_records, records):
        assert old["goalId"] == current["goalId"]
        changes = diffs(old["profile"], current["profile"])
        if old["goalId"] != TARGET:
            assert not changes
        else:
            assert len(changes) == 1 and changes[0]["field"] == "/applicationCaseBriefs"
            for old_case, current_case in zip(old["profile"]["applicationCaseBriefs"], current["profile"]["applicationCaseBriefs"]):
                if old_case["id"] == CASE:
                    assert {c["field"] for c in diffs(old_case, current_case)} == {"/taskDemandDe", "/taskDemandEn"}
                else:
                    assert old_case == current_case
        profile_changes.append({"goalId": current["goalId"], "changed": bool(changes), "wholeProfileFingerprint": current["profileFingerprint"]})
        record_changes.append({"goalId": current["goalId"], "fieldChanges": diffs(old, current)})
        goal = next(r for r in raw["wholeFourGoals"] if r["goalId"] == current["goalId"])["wholeCandidateGoal"]
        text += [f"\n## {goal['title']} / {goal['titleEn']}\n\n{current['goalId']}\n", f"\nDE: {goal['description']}\n\nEN: {goal['descriptionEn']}\n"]
        for case in current["profile"]["applicationCaseBriefs"]:
            case_rows.append({"goalId": current["goalId"], "case": case})
            text.append(f"\n### {case['id']}\n")
            for field, label in [("taskDemandDe", "Aufgabe DE"), ("taskDemandEn", "Task EN"), ("expectedPerformanceDe", "Erwartete Leistung DE"), ("expectedPerformanceEn", "Expected performance EN"), ("understandingFocusDe", "Verständnisfokus DE"), ("understandingFocusEn", "Understanding focus EN")]:
                text.append(f"\n**{label}:** {case[field]}\n")
    stripped = copy.deepcopy(raw)
    for row in stripped["wholeFourGoals"]:
        row["wholeNativePAuthorCandidate"] = next(r for r in old_records if r["goalId"] == row["goalId"])
    assert stripped == original_raw
    write(OWN / "full-eight-P-cases.complete-DE-EN.author.json", {"role": "Reviewer-ready whole untruncated author cases", "cases": case_rows, "casesUnchanged": 7, "onlyTwoContextFieldsChanged": True, "ownScientificApproval": False})
    write(OWN / "full-eight-P-cases.complete-DE-EN.author.md", "".join(text))
    write(OWN / "precise-v1-v2-delta-and-preservation.actual.author.json", {"role": "Exact author differences, including native binding metadata", "substantiveChangedFields": [f"{TARGET}/profile/applicationCaseBriefs/{CASE}/taskDemandDe", f"{TARGET}/profile/applicationCaseBriefs/{CASE}/taskDemandEn"], "profileSummary": profile_changes, "wholeRecordDifferences": record_changes, "otherSevenCasesExact": True, "allEightExpectedAnswerAndFocusPairsExact": True, "wholeCurrentAndCandidateGoalsExact": True, "nativeDWholeInputsExact": True, "elevenExistingComponentsAndTwentyFourCompleteCasesExact": True, "allSourceBoundsAndHoldsExact": True, "selectedExistingPNGBytesExact": True, "nativeBindingCorrection": "v1 filtered link.type=image and supplied no digests; v2 uses native goal-visualization links and binds exact unchanged selected PNGs. Four reviewInputFingerprints change as technical metadata; only ffef profileFingerprint changes substantively.", "activeWrites": 0, "previousDossierWrites": 0, "ownScientificApproval": False, "strictGain": 0})
    write(OWN / "README.md", """# Bio Q1 four: narrow author v2 excerpt clarification

Author preparation only. Native candidates remain `needs_human_review`,
`ai_candidate`, E1/G1, with empty independent review run IDs. This dossier
assigns no scientific approval, machine completion, human approval or trial.

Read `four-current-native-whole-goals-cases-source-review-input.author.raw.json`
and `native/positive-four.current-author-candidate.jsonl` for the complete four
whole DE/EN goals and whole current P profiles. All eight cases are also printed
without truncation in `full-eight-P-cases.complete-DE-EN.author.md` and JSON.

Only ffef case `missense-in-frame-loss-and-copy-trace` taskDemandDe/En changes:
the DNA is a marked terminal excerpt of a longer enzyme gene; the preceding
gene/protein region is unchanged and omitted; activity refers to the complete
enzyme. DNA/variant sequences, all expected answers/focus fields and the other
seven cases are exact. `ffef-case2-DE-EN-exact-context-delta.author.json` gives
the exact before/after text. All whole goal, source, image and hold fields of
the v1 raw input remain exact.

The v1 P preparation selected the wrong link type and supplied empty image
digests. The existing native API now binds all four unchanged selected PNGs
using `goal-visualization`; the four review-input fingerprints are refreshed
as technical metadata and only ffef's profile fingerprint changes. The frozen
schema and actual native semantic check return zero errors. This binding is
not scientific review, an active-image CLI check or independent approval.

Native D pages, contracts, PDFs and source-context pages are unchanged and
remain in the sealed sibling v1 dossier; physical goal pages are 3–6. Their
existing v1 final freeze remains intact. No new D/visual verdict is supplied.

`source-overlay-field-level-guarded-merge.author.json` supplies exact keyed
before/after row and field changes for thirteen mapping lanes and four source
extractions. It is a read-only future integration plan. Apply only these
changes after refetching live files and checking conflicts; preserve all live
unrelated fields, especially Root's seven HE a46 LK-only corrections. Never
restore an old `exact` a46 route from an author payload. Source bounds and
whole-source HOLDs are inherited unchanged; this plan grants no source approval.

`declared-input-snapshot-index.actual.json` records exact bytes actually read.
`author.final.freeze.json` freezes all own payloads and input snapshots and
verifies the previous 384 own payloads. Live originals may advance during
Root integration; input snapshots bind the inspected state, and integration
must refetch. Prior dossiers, active files and validators are unmodified.

Own tasks/goals/media: CC-BY-4.0. Technical scripts/QA routing: Apache-2.0.
Third-party sources keep their existing rights. Strict gain: 0.
""")
    inputs = read(OWN / "declared-input-snapshot-index.actual.json")["inputs"]
    previous = read(PREVIOUS / "author.final.freeze.json")
    previous_errors = [r["path"] for r in previous["payloads"] if binding(ROOT / r["path"])["sha256"] != r["sha256"]]
    assert not previous_errors
    input_checks = [{"originalPathAtUse": r["originalPathAtUse"], "expectedSHA256AtUse": r["originalSHA256AtUse"], "actualSHA256AtSeal": binding(ROOT / r["originalPathAtUse"])["sha256"], "snapshotMatches": binding(ROOT / r["path"])["sha256"] == r["sha256"]} for r in inputs]
    assert all(r["snapshotMatches"] for r in input_checks)
    payloads = [binding(p) for p in sorted(OWN.rglob("*")) if p.is_file()]
    write(OWN / "author.final.freeze.json", {"schemaVersion": 1, "createdAtUTC": NOW, "role": "Immutable narrow author-v2 input/own payload seal; no approval", "payloads": payloads, "declaredInputs": inputs, "originalInputChecksAtSeal": input_checks, "originalInputsDriftedAtSeal": [r["originalPathAtUse"] for r in input_checks if r["expectedSHA256AtUse"] != r["actualSHA256AtSeal"]], "previousAuthorFreeze": binding(PREVIOUS / "author.final.freeze.json"), "previousOwnPayloadCountVerifiedAtSeal": len(previous["payloads"]), "previousOwnPayloadErrors": previous_errors, "onlySubstantivePContextFieldsChanged": 2, "otherSevenPCaseBriefsExact": True, "expectedAnswerAndFocusPairsExact": 8, "wholeGoalsAndSourceBoundsExact": True, "nativePSchemaAndSemanticErrors": 0, "exactExistingPNGNativeBindings": 4, "sourceMappingLanePlanCount": 13, "sourceExtractionPlanCount": 4, "independentReviewRequired": True, "ownScientificApproval": False, "activeWrites": 0, "historicalWrites": 0, "humanApproval": False, "humanTrial": False, "strictGain": 0})
    print(json.dumps({"own": relative(OWN), "payloads": len(payloads), "inputs": len(inputs), "nativePErrors": 0, "substantiveChangedFields": 2, "otherSevenCasesExact": True, "ownApproval": False, "strictGain": 0}))


if __name__ == "__main__":
    {"prepare": prepare, "seal": seal}[sys.argv[1]]()
