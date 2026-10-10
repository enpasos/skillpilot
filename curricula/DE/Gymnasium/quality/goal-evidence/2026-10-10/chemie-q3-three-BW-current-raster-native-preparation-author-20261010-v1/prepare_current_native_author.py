# SPDX-License-Identifier: Apache-2.0
"""Actual normal, inactive native preparation. No active integration or review."""
from pathlib import Path
import datetime
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile

ROOT = Path.cwd()
DIR = Path(__file__).resolve().parent
PREFIX = DIR.relative_to(ROOT).as_posix()
OLD = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09"
AUTHOR = f"{OLD}/chemie-q3-three-BW-context-bound-practical-companions-author-v1"
META = f"{OLD}/chemie-q3-three-BW-practical-companion-raster-device-metadata-author-successor-v2"
SOURCE = f"{OLD}/chemie-q3-three-BW-SOURCE002-partial-concentration-author-successor-v2"
REVIEW_B = f"{OLD}/chemie-q3-three-BW-practical-companions-independent-b-v1"
IDS = ["d2d735de-bede-5310-8aeb-8bb7562c7b75", "a0f6ba09-f072-5887-a797-fa369453c62a", "7b39fa19-fec3-575e-9324-a3226b703358"]
STAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()

def put(name, value):
    p = DIR / name
    p.parent.mkdir(parents=True, exist_ok=True)
    encoded = value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()
    if p.exists():
        assert p.read_bytes() == encoded, f"Refusing different existing bytes: {p}"
        return p.relative_to(ROOT).as_posix()
    if isinstance(value, bytes):
        p.write_bytes(value)
    else:
        p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return p.relative_to(ROOT).as_posix()

def read(path):
    return json.loads((ROOT / path).read_text())

def copy(source, destination):
    return put(destination, (ROOT / source).read_bytes())

def bind(p):
    return {"path": p.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "bytes": p.stat().st_size}

assert not (DIR / "author.final.freeze.json").exists(), "Frozen package must never be regenerated"
canonical = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json"
registry_path = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
registry = read(registry_path)
subject = next(s for s in registry["subjects"] if s["subject"] == "chemie")
copy(canonical, "inputs/current-canonical480.exact.json")
copy(subject["semanticKindLedgerPath"], "inputs/current-semantic-kinds.exact.json")
copy(subject["visualizationQaPath"], "inputs/current-visualization-qa.exact.json")
copy(registry_path, "inputs/current-central-registry.exact.json")
copy("curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json", "inputs/current-whole-duration-policy154.exact.json")
central = f"{OLD}/biologie-sh-two-current-context-reviewed-integration-technical-20261009-v1/checks/post-duration-current-central-five-gate.actual.json"
copy(central, "inputs/current-central-five-gate.exact.json")
copy(f"{META}/candidate/whole484.only-a0f6-accessibility-device-word.inactive.json", "candidate/current484-three-practical-raster.inactive.json")
copy(f"{META}/candidate/three-selected-assets-and-accessible-metadata.device-word-only.successor.json", "inputs/three-existing-raster-metadata-successor.exact.json")
copy(f"{SOURCE}/candidate/whole-BW126-220-partners.concentration-partial-successor.review.json", "candidate/BW126-220-partners-concentration-partial.inactive.review.json")
copy(f"{AUTHOR}/candidate/whole-BW126.source-extraction.json", "inputs/whole-BW126.source-extraction.exact.json")
copy(f"{AUTHOR}/inputs/whole-original-126-duty-217-edge-mapping.exact.json", "inputs/whole-original-BW126-217-mapping.exact.json")
copy(f"{AUTHOR}/inputs/chemistry-existing-review-criteria.md", "inputs/chemistry-existing-review-criteria.exact.md")
for course in ("gk", "lk"):
    copy(f"{AUTHOR}/candidate/BW-{course}.learner-view.inactive-successor.json", f"candidate/BW-{course}.learner-view.inactive.json")
for name in ("whole-six-new-practical-protocol-cases.de-en.author-candidate.json", "whole-original40-DEEN-cases.exact-retained.json", "six-current-whole-theory-cases.exact-selected.json", "three-current-whole-theory-P-profiles.exact-retained.json"):
    copy(f"{AUTHOR}/science/{name}", f"science/{name}")
rows = read(f"{META}/candidate/three-selected-assets-and-accessible-metadata.device-word-only.successor.json")["rows"]
assert [r["goalId"] for r in rows] == IDS
for row in rows:
    gid = row["goalId"]
    assert row["nativeDimensions"] == [1672, 941]
    copy(row["selectedPNG"]["path"], f"assets/chemie/{gid}/{gid}.png")
    assert hashlib.sha256((DIR / f"assets/chemie/{gid}/{gid}.png").read_bytes()).hexdigest() == row["selectedPNG"]["sha256"]

capsule = Path(tempfile.mkdtemp(prefix="chemie-three-current-native-", dir=ROOT / "tmp"))
for name in ("app/scripts", "app/src", "contracts"):
    shutil.copytree(ROOT / name, capsule / name, ignore=shutil.ignore_patterns("node_modules", "dist", "__pycache__"))
(capsule / "app/node_modules").symlink_to((ROOT / "app/node_modules").resolve(), target_is_directory=True)
public = capsule / "app/public"
public.mkdir(parents=True)
for p in (ROOT / "app/public").iterdir():
    if p.name != "assets":
        (public / p.name).symlink_to(p.resolve(), target_is_directory=p.is_dir())
(public / "assets").mkdir()
for p in (ROOT / "app/public/assets").iterdir():
    if p.name != "goal-visualizations":
        (public / "assets" / p.name).symlink_to(p.resolve(), target_is_directory=p.is_dir())
viz = public / "assets/goal-visualizations"
viz.mkdir()
for p in (ROOT / "app/public/assets/goal-visualizations").iterdir():
    if p.name != "chemie":
        (viz / p.name).symlink_to(p.resolve(), target_is_directory=p.is_dir())
(viz / "chemie").mkdir()
for p in (ROOT / "app/public/assets/goal-visualizations/chemie").iterdir():
    (viz / "chemie" / p.name).symlink_to(p.resolve(), target_is_directory=p.is_dir())
for gid in IDS:
    destination = viz / "chemie" / gid
    assert not destination.exists(), "New assets must not already be active"
    shutil.copytree(DIR / "assets/chemie" / gid, destination)
# Old frozen sources stay read only; current input cache remains execution only.
old_caps = capsule / OLD
old_caps.parent.mkdir(parents=True, exist_ok=True)
old_caps.symlink_to((ROOT / OLD).resolve(), target_is_directory=True)
current_inputs = capsule / "curricula/DE/Gymnasium/input"
current_inputs.parent.mkdir(parents=True, exist_ok=True)
current_inputs.symlink_to((ROOT / "curricula/DE/Gymnasium/input").resolve(), target_is_directory=True)
mapping_caps = capsule / "curricula/DE/Gymnasium/mapping"
mapping_caps.symlink_to((ROOT / "curricula/DE/Gymnasium/mapping").resolve(), target_is_directory=True)
shutil.copytree(DIR, capsule / PREFIX)
(capsule / "curricula/DE/Gymnasium/quality/goal-evidence/prompts").symlink_to((ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/prompts").resolve(), target_is_directory=True)

terminals = []
def run(label, args, cwd):
    start = datetime.datetime.now(datetime.timezone.utc).isoformat()
    process = subprocess.run(args, cwd=cwd, text=True, capture_output=True)
    out = put(f"terminal/{label}.stdout.actual.txt", process.stdout.encode())
    err = put(f"terminal/{label}.stderr.actual.txt", process.stderr.encode())
    record = {"label": label, "argv": args, "executionCwdDiagnosticOnly": str(cwd), "startedAt": start, "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "actualExitCode": process.returncode, "stdout": bind(ROOT / out), "stderr": bind(ROOT / err)}
    terminals.append(record)
    print(json.dumps({"label": label, "actualExitCode": process.returncode, "stdoutTail": process.stdout[-2200:], "stderrTail": process.stderr[-600:]}, ensure_ascii=False), flush=True)
    put(f"terminal/{label}.terminal.actual.json", record)
    assert process.returncode == 0, f"Actual failure in {label}; saved terminal logs"

tsx = str((ROOT / "app/node_modules/.bin/tsx").resolve())
run("normal-current-context-and-source-atlas", [tsx, f"{PREFIX}/prepare_current_contexts.author.mts", "--capsule", str(capsule)], ROOT)
shutil.copytree(DIR, capsule / PREFIX, dirs_exist_ok=True)
run("normal-P3-current-resource-materializer", [tsx, "app/scripts/materializePositiveGoalEvidenceCandidates.ts", "--config", f"{PREFIX}/positive/current-three.author.config.json", "--candidates", f"{PREFIX}/positive/current-three.technical-author-candidates.json", "--write"], capsule)
run("normal-P3-current-resource-check", [tsx, "app/scripts/positiveGoalEvidenceReview.ts", f"--config={PREFIX}/positive/current-three.author.config.json", "--mode=check"], capsule)
shutil.copy2(capsule / PREFIX / "positive/current-three.author.review.jsonl", DIR / "positive/current-three.author.review.jsonl")
run("normal-native3-prepare", [tsx, "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "prepare", "--config", f"{PREFIX}/native/three.current.batch.config.json"], capsule)
run("normal-native3-check", [tsx, "app/scripts/materializeGoalDescriptionRolloutBatch.ts", "check", "--config", f"{PREFIX}/native/three.current.batch.config.json"], capsule)
shutil.copytree(capsule / PREFIX / "native/three", DIR / "native/three")
put("checks/completed-normal-current-native-preparation.actual.json", {"schemaVersion": 1, "preparedAt": STAMP, "role": "Actual inactive normal author preparation, not an independent science review or active adoption", "terminals": terminals, "fullCandidateAtomicPages": 381, "nativePracticalPages": 3, "priorStrictProtected": 177, "newScientificClosures": 0, "restoredActiveBindings": 0, "strictGain": 0, "activeWrites": 0, "humanApproval": False, "temporaryCapsuleDiagnosticOnly": str(capsule), "rootNodeModulesNeverRemoved": True, "allOperativeOutputsCopiedToRealPortablePackageFiles": True})
print(json.dumps({"completedNormalTerminals": len(terminals), "actualNativePages": 3, "activeWrites": 0, "strictGain": 0}))
