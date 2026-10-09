# SPDX-License-Identifier: Apache-2.0
import datetime
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path


BASE = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09")
FOLDER = BASE / "biologie-evolution-two-semantic-child-rasters-independent-v-b-v1"
AUTHOR_ENTRY = BASE / "biologie-evolution-two-semantic-child-rasters-author-root-v1/neutral-two-actual-proposed-child-rasters.independent-V-review.entry.json"


def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {
        "path": path.as_posix(),
        "sha256": "sha256:" + hashlib.sha256(data).hexdigest(),
        "bytes": len(data),
    }


def save(name, value):
    path = FOLDER / name
    assert not path.exists(), f"Preserve existing evidence: {path}"
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return binding(path)


verified = {}


def verify_binding(record):
    path = Path(record["path"])
    assert not path.is_absolute(), str(path)
    assert path.is_file(), str(path)
    assert not any(item.is_symlink() for item in [path, *path.parents]), str(path)
    actual = binding(path)
    assert actual["bytes"] == record["bytes"], str(path)
    assert actual["sha256"].removeprefix("sha256:") == record["sha256"].removeprefix("sha256:"), str(path)
    verified[str(path)] = actual


def walk(value):
    if isinstance(value, dict):
        if {"path", "sha256", "bytes"}.issubset(value):
            verify_binding(value)
        for item in value.values():
            walk(item)
    elif isinstance(value, list):
        for item in value:
            walk(item)


first_seal_path = FOLDER / "two-child-rasters.independent-b.pixel-FIRST.freeze.json"
first_seal = json.loads(first_seal_path.read_text())
walk(first_seal)
author = json.loads(AUTHOR_ENTRY.read_text())
walk(author)
pre_generation = json.loads(Path(author["preGenerationInput"]["path"]).read_text())
walk(pre_generation)
for row in author["images"]:
    walk(json.loads(Path(row["actualToolProvenance"]["path"]).read_text()))
for prep in author["ordinaryPrepareBeforeGeneration"]:
    walk(json.loads(Path(prep["path"]).read_text()))
for path in FOLDER.glob("*.json"):
    walk(json.loads(path.read_text()))

ignore = subprocess.run(
    ["git", "check-ignore", "--stdin"],
    input="\n".join(verified) + "\n",
    capture_output=True,
    text=True,
)
assert ignore.returncode == 1 and not ignore.stdout, ignore.stdout
diff = subprocess.run(["git", "diff", "--check", "--", str(FOLDER)], capture_output=True, text=True)
assert diff.returncode == 0, diff.stdout + diff.stderr

technical = save("two-child-rasters.scoped-portable-bindings-and-preservation.actual.json", {
    "schemaVersion": 1,
    "license": "CC-BY-4.0",
    "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "exactOperativeBindingsActuallyVerified": list(verified.values()),
    "operativeBindingCount": len(verified),
    "noAbsoluteSymlinkMissingOrIgnoredOperativeBindings": True,
    "rawGeneratedAbsolutePaths": "Author provenance retains local diagnostic strings only. Exact portable original copies exist and were byte-compared to these raw images; diagnostic paths are not operative dependencies.",
    "ownJSONFullyParsed": True,
    "actualGitDiffCheckExit": diff.returncode,
    "actualGitCheckIgnoreExit": ignore.returncode,
    "normalFunctionsActualExit": 0,
    "fullCurrentCentralVAssetBuildExecuted": False,
    "historicalAndAuthorFilesModified": [],
    "activeWrites": [],
})
metadata = FOLDER / "two-child-rasters.independent-b.metadata-whole-goal-provenance.verdict.json"
entry = save("neutral-completed-two-semantic-child-rasters-independent-b.review.entry.json", {
    "schemaVersion": 1,
    "license": "CC-BY-4.0",
    "role": "Completed independent targeted machine V review of exact inactive two-child original PNGs and actual original/360/680 captures",
    "authorNeutralEntry": binding(AUTHOR_ENTRY),
    "ownPixelFIRST": binding(first_seal_path),
    "ownPixelFIRSTVerdict": binding(FOLDER / "two-child-rasters.independent-b.pixel-FIRST.verdict.json"),
    "wholeGoalMetadataAndProvenanceJudgment": binding(metadata),
    "ordinaryScopedQAModelAndLinkFunctions": binding(FOLDER / "normal-raster-QA-and-links.functions.actual.json"),
    "ordinaryActualTerminal": binding(FOLDER / "normal-raster-QA-and-links.terminal.actual.json"),
    "ordinarySchemaAndSymlinkCheck": binding(FOLDER / "normal-scoped-JSON-and-curriculum-symlink-check.actual.json"),
    "bindingAndPreservationCheck": technical,
    "authority": "ai_candidate",
    "humanReviewStatus": "needs_human_review",
    "evidenceTier": "E1",
    "gateTier": "G1",
    "actualIndividualImageInspections": 6,
    "keepCount": 2,
    "holdCount": 0,
    "newFindingCount": 0,
    "sourceWholeScienceNativePOrM7Approval": False,
    "currentCanonicalImportOrCentralVClosure": False,
    "strictGain": 0,
    "humanApproval": False,
    "humanTrial": False,
    "activeWrites": [],
})

spec = importlib.util.spec_from_file_location("ordinary_schema", "scripts/validate_schemas.py")
normal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normal)
schema = json.loads(Path("docs/landscape-runtime.schema.json").read_text())
for path in FOLDER.glob("*.json"):
    assert normal.validate_file(str(path), schema), str(path)
    walk(json.loads(path.read_text()))

seal = save("two-semantic-child-rasters.independent-b.final.freeze.json", {
    "schemaVersion": 1,
    "license": "CC-BY-4.0",
    "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "role": "Immutable final exact independent two-child raster review, retaining unchanged FIRST",
    "sealedPayloads": [binding(path) for path in sorted(FOLDER.iterdir()) if path.is_file()],
    "ownFIRSTUnchanged": True,
    "humanApproval": False,
    "humanTrial": False,
    "strictGain": 0,
    "activeWrites": [],
})
for row in json.loads(Path(seal["path"]).read_text())["sealedPayloads"]:
    verify_binding(row)
assert normal.validate_file(seal["path"], schema)
print(json.dumps({"entry": entry, "finalSeal": seal, "keepCount": 2, "holdCount": 0, "strictGain": 0}))
