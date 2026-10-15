# SPDX-License-Identifier: Apache-2.0
"""Check all finite own files and preserve the immutable first-science seal."""
import hashlib
import json
import struct
from datetime import datetime, timezone
from pathlib import Path

R = Path(__file__).resolve().parents[8]
O = Path(__file__).resolve().parents[1]
A = O.parent / "chemie-source6-five-current412-actual-PNG-candidates-author-20261014-v1"


def bind(p):
    b = p.read_bytes()
    return {"path": str(p.relative_to(R)), "bytes": len(b), "sha256": "sha256:" + hashlib.sha256(b).hexdigest()}


def write(p, x):
    assert not p.exists(), f"Preserve existing {p}"
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + "\n")


first = O / "FIRST-SCIENCE-SEAL.five-original-PNG-V5-independent-b.actual.json"
assert bind(first)["sha256"] == "sha256:18fb2b3f7dac448c9233f66400fa38165758ca4acf30db6ca498fb0d57720f3b"
first_data = json.loads(first.read_text())
author_seal = A / "SEAL.finite-source6-five-current-original-artifacts.actual.json"
author_bind = bind(author_seal)
assert author_bind["sha256"].startswith("sha256:40f46d36") and author_bind["sha256"].endswith("948b38")
json.loads(author_seal.read_text())
neutral = R / first_data["originalExactNeutral"]["path"]
assert bind(neutral) == first_data["originalExactNeutral"]
inputs = json.loads((R / first_data["pixelAndGoalBindings"]["path"]).read_text())
originals = []
for row in inputs["wholeFiveOriginalRows"]:
    png = R / row["selectedOriginalPixels"]["path"]
    assert bind(png) == row["selectedOriginalPixels"]
    b = png.read_bytes()
    assert b[:8] == b'\x89PNG\r\n\x1a\n'
    dimensions = list(struct.unpack('>II', b[16:24]))
    assert dimensions == row["dimensions"] == [1672, 941]
    for k in ["prompt", "reconstructionPrompt"]:
        assert bind(R / row[k]["path"]) == row[k]
    originals.append({"goalId": row["goalId"], "actualOriginal": bind(png), "format": "PNG", "dimensions": dimensions,
                      "prompt": row["prompt"], "reconstructionPrompt": row["reconstructionPrompt"]})

parsed, embedded, errors = [], [], []


def check_bindings(x):
    if isinstance(x, dict):
        if {"path", "bytes", "sha256"}.issubset(x) and isinstance(x["path"], str) and x["sha256"].startswith("sha256:"):
            p = R / x["path"]
            try:
                actual = bind(p)
                assert actual["bytes"] == x["bytes"] and actual["sha256"] == x["sha256"]
                assert "tmp/" not in actual["path"] and not p.is_symlink()
                embedded.append(actual)
            except Exception as e:
                errors.append({"binding": x, "error": str(e)})
        for v in x.values():
            check_bindings(v)
    elif isinstance(x, list):
        for v in x:
            check_bindings(v)


for p in sorted(O.rglob('*')):
    if not p.is_file():
        continue
    assert not p.is_symlink()
    if p.suffix == '.json':
        x = json.loads(p.read_text())
        parsed.append({"file": bind(p), "kind": "JSON"})
        check_bindings(x)
    elif p.suffix == '.jsonl':
        lines = [json.loads(v) for v in p.read_text().splitlines() if v.strip()]
        parsed.append({"file": bind(p), "kind": "JSONL", "records": len(lines)})
        check_bindings(lines)
assert not errors, errors
write(O / "checks/ACTUAL.finite-own-JSON-JSONL-full-parse-and-exact-embedded-bindings.json", {
    "schemaVersion": 1, "checkedAtUTC": datetime.now(timezone.utc).isoformat(), "status": "PASS",
    "parsedFiles": parsed, "embeddedFileBindingsVerified": len(embedded), "errors": errors,
    "fiveActualOriginalFormatsAndPrompts": originals,
    "firstScienceSealUnchanged": bind(first), "noSymlinksOrIgnoredTmpInputs": True,
})
science = [json.loads(x) for x in (R / first_data["scienceRecords"]["path"]).read_text().splitlines()]
qa = O / "QA/five-original-PNG-current-whole-goal.V5-independent-b.actual.qa.json"
assert len(json.loads(qa.read_text())["records"]) == 5
for f in [
    "ACTUAL.stock-normal-approval-coverage.receipt.json",
    "ACTUAL.stock-imported-types-actual-tsc.receipt.json",
    "ACTUAL.five-typed-QA-stock-model-and-approval-functions.json",
    "ACTUAL.stock-curriculum-symlink-guard.before-final-seal.json",
]:
    assert json.loads((O / 'checks' / f).read_text())["status"] == "PASS"
assert not json.loads((O / "checks/ACTUAL.candidate-original-and-normal-asset-alias-existence-and-SHA.json").read_text())["normalAliasImportComplete"]
ended = datetime.now(timezone.utc).isoformat()
manifest = O / "FINAL.finite-five-original-PNG-current-whole-goal-V5-independent-b.actual.manifest.json"
write(manifest, {
    "schemaVersion": 1, "role": "GENUINE_FRESH_INDEPENDENT_V5_B_EXACT_PIXEL_IMAGE_REVIEW",
    "startedAtUTC": first_data["startedAtUTC"], "scienceEndedAtUTC": first_data["scienceCompletedAtUTC"], "technicalEndedAtUTC": ended,
    "provider": "OpenAI", "model": "GPT-6 Codex", "modelRevision": None, "samplingParameters": None,
    "independenceGroupId": first_data["independenceGroupId"],
    "currentV5AOutcomesReadBeforeFirstScienceSeal": False,
    "currentV5AOutcomesReadBeforeFinalTechnicalSeal": False,
    "historicalExposureDisclosure": "Own previous Source6A whole-goal/P/A/M/kind science known and disclosed; no current V5-A image outcomes read. Author retry instructions are provenance, not approval.",
    "originalAuthorSeal": author_bind, "exactNeutral": bind(neutral), "immutableOwnFirstScienceSeal": bind(first),
    "wholeGoalsRead": 5, "actualOriginalNativePNGsViewed": 5, "ownActualChromium360And680ScreenshotsViewed": 10,
    "scientificResults": [{"goalId": x["goalId"], "decision": x["decision"], "exactOriginal": x["originalSelectedPixels"]} for x in science],
    "typedActualIndependentV5BQACandidates": bind(qa),
    "stockChecks": {"typedQaStockModelNormalizerStatusApproval": "PASS", "actualTscStockImportedTypes": "PASS", "normalApprovalCoverageCLI": "PASS_CANDIDATE5_ONLY", "allOwnJsonJsonlAndEmbeddedBindings": "PASS", "globalCurriculumSymlinkGuard": "PASS"},
    "preservedBoundaries": [
        "All five normal canonical/public asset aliases remain absent and pending exact-byte import; candidate QA canonicalAssetPath binds actual reviewed evidence original.",
        "Before any later central run, check every selected QA canonicalAssetPath and public alias exists and has the exact approved SHA; no QA or gate waiver.",
        "The 539/412 canonical whole goal bodies and resources are unchanged; new image imports require honest downstream resource/native bindings.",
        "This is image V science only: no Human, D/P/A/M, kind authority, whole-source/course, active runtime or strict-completion claim.",
        "No image generation/edit, active/H-host/engine/registry/Git mutation."
    ],
    "newHumanApprovals": 0, "newCentralStrictCompletions": 0,
    "filesBeforeManifest": [bind(p) for p in sorted(O.rglob('*')) if p.is_file()],
    "licenses": "Own review content CC-BY-4.0; technical helpers Apache-2.0; original image/source grants preserved.",
})
seal = O / "SEAL.finite-five-original-PNG-current-whole-goal-V5-independent-b.actual.json"
write(seal, {
    "schemaVersion": 1, "role": "FINITE_V5_B_FINAL_SEAL_AFTER_OWN_BLIND_FIRST_SCIENCE",
    "sealedAtUTC": datetime.now(timezone.utc).isoformat(), "manifest": bind(manifest), "firstScienceSeal": bind(first),
    "files": [bind(p) for p in sorted(O.rglob('*')) if p.is_file()],
    "noCurrentPeerOutcomesRead": True, "noActiveHHostEngineRegistryGitMutation": True,
})
# Parse every complete final JSON/JSONL too and verify exact final file bindings.
for p in O.rglob('*'):
    if p.is_file() and p.suffix == '.json':
        json.loads(p.read_text())
    elif p.is_file() and p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip(): json.loads(line)
for row in json.loads(seal.read_text())["files"]:
    assert bind(R / row["path"]) == row
assert bind(first)["sha256"] == "sha256:18fb2b3f7dac448c9233f66400fa38165758ca4acf30db6ca498fb0d57720f3b"
print(json.dumps({"manifest": bind(manifest), "finalSeal": bind(seal)}, ensure_ascii=False, indent=2))
