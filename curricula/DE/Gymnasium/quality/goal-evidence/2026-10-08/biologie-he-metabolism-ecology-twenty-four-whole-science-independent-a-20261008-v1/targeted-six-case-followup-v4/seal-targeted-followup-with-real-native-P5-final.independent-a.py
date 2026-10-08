# SPDX-License-Identifier: Apache-2.0
"""Append a portable final handoff without editing either scientific first seal."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[7]
FIRST = OWN.parent
BASE = FIRST.parent / "biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1"
AUTHOR = FIRST.parent / "biologie-he-metabolism-ecology-six-case-targeted-remediation-author-root-20261008-v4"


def read(path):
    return json.loads(path.read_text())


def binding(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def verify(pin):
    path = ROOT / pin["path"]
    assert path.is_file() and not path.is_symlink(), pin["path"]
    assert binding(path) == pin, pin["path"]
    return path


def put(name, value):
    with (OWN / name).open("x") as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


old_first = FIRST / "whole24-science-source-P.independent-a.first.freeze.json"
new_first = OWN / "six-whole-case-five-profile-followup.independent-a.first.freeze.json"
assert binding(old_first)["sha256"] == "56c15bf222e85f5ab92a69c5063d9cfd6f3b9aaa461690f611623dad64b3f58e"
assert binding(new_first)["sha256"] == "cff6af833694799329b32865bd3af1760fde568acfeeb9c611ef085007896c12"
required_paths = {old_first, new_first}
for seal_path in [old_first, new_first, BASE / "whole24-source-science-P14-author.first-input.freeze.json", AUTHOR / "six-case-only-remediation.author.first-input.freeze.json"]:
    required_paths.add(seal_path)
    seal = read(seal_path)
    for pin in seal.get("ownFiles", seal.get("files", [])):
        required_paths.add(verify(pin))
    if "requiredPortableInputs" in seal:
        portable = verify(seal["requiredPortableInputs"])
        required_paths.add(portable)
        for pin in read(portable)["requiredFiles"]:
            required_paths.add(verify(pin))
for path in FIRST.iterdir():
    if path.is_file():
        required_paths.add(path)
for path in OWN.iterdir():
    if path.is_file():
        required_paths.add(path)
native = read(OWN / "P5.source-only-closed-native-actual-after-science-first.independent-a.receipt.json")
for pin in native["exactRequiredInputBindings"]:
    required_paths.add(verify(pin))
assert native["nativeMaterializerErrors"] == 0
assert native["actualPublicNativeReviewApiErrors"] == []
assert native["statusCounts"] == {"approved": 0, "needsHumanReview": 5, "rejected": 0}
assert native["reviewedResourceTypes"] == []
command = read(OWN / "P5.public-source-only-native-check.actual.command.json")
assert command["actualExitCode"] == 0
stdout = (OWN / "P5.public-source-only-native-check.actual.stdout.txt").read_text()
assert "Needs human review: 5" in stdout and "Approved: 0" in stdout and "Blocking issues: 0" in stdout
ignore = subprocess.run(["git", "check-ignore", "--no-index", *[str(path.relative_to(ROOT)) for path in sorted(required_paths)]], cwd=ROOT, capture_output=True, text=True)
assert ignore.returncode == 1 and not ignore.stdout.strip(), ignore.stdout
json_count = jsonl_count = 0
for path in sorted(required_paths):
    assert path.is_file() and not path.is_symlink(), str(path)
    if path.suffix == ".json":
        read(path)
        json_count += 1
    if path.suffix == ".jsonl":
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
        jsonl_count += 1
now = datetime.now(timezone.utc).isoformat()
guard = {
    "schemaVersion": 1, "checkedAt": now,
    "actualRequiredFileBindings": [binding(path) for path in sorted(required_paths)],
    "actualRequiredFileCount": len(required_paths),
    "gitCheckIgnoreActual": {"exitCode": ignore.returncode, "stdout": ignore.stdout, "stderr": ignore.stderr, "ignoredRequiredInputs": 0},
    "brokenOrExternalRequiredSymlinks": 0, "actualJSONParsed": json_count, "actualJSONLParsed": jsonl_count,
    "bothOwnScientificFirstSealsByteUnchanged": [binding(old_first), binding(new_first)],
    "ordinaryClosedP5NativeApiErrors": [], "ordinaryClosedP5ActualPublicCLIExit": 0,
    "sourceOnlyReviewedResourceTypes": [], "reviewedRaster": False,
    "historicalSourceOnlyP14AndOldCasesUnmodified": True,
    "originalWholeSourceHoldsAndCompoundHoldsStillOpen": True,
    "noUnusedLocalPDFHTMLInputsRequired": True,
    "currentPeerBRead": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("final-own-six-case-followup-portable-transitive-inputs.actual.json", guard)
entry = {
    "schemaVersion": 1, "createdAt": now,
    "kind": "Neutral completed independent A six-case scientific followup plus genuine source-only native P5 check; final raster D/P/V pending",
    "originalIndependentWhole24ScienceFirstSeal": binding(old_first),
    "genuineOwnSixCaseScienceFirstSeal": binding(new_first),
    "genuineScientificWholeCaseAndProfileVerdicts": binding(OWN / "whole-six-case-five-profile-genuine-scientific-followup.independent-a.first.verdicts.json"),
    "exact42Cases19Profiles24GoalsRetained": binding(OWN / "actual-six-case-five-profile-exact-retain-portability.independent-a.json"),
    "nativeSourceOnlyP5Config": binding(OWN / "P5.current-source-only.actual-native.config.json"),
    "nativeSourceOnlyP5Records": binding(OWN / "P5.current-source-only.actual-native.review.jsonl"),
    "actualNativeP5ApiAndClosedSchemaReceipt": binding(OWN / "P5.source-only-closed-native-actual-after-science-first.independent-a.receipt.json"),
    "actualPublicP5CLI": binding(OWN / "P5.public-source-only-native-check.actual.command.json"),
    "actualPortableTransitiveInputs": binding(OWN / "final-own-six-case-followup-portable-transitive-inputs.actual.json"),
    "finalFreezePath": str((OWN / "completed-six-case-five-profile-science-and-source-only-P5.independent-a.final.freeze.json").relative_to(ROOT)),
    "wholeCorrectedCaseKEEP": 6, "wholeCorrectedProfilesKEEPScientificCandidate": 5,
    "ownOriginalP9FindingsResolved": ["A24-P09-HYPOTHESIS", "A24-P09-FERMENTATION-IDENTIFICATION"],
    "nativeSourceOnlyP5": {"actualPublicCLIExit": 0, "nativeSchemaSemanticsErrors": 0, "approved": 0, "needsHumanReview": 5},
    "remainingScienceSourceHolds": "Original source1/2/3 and whole compound8/16 retain genuine open findings; eight authored optional source roles are not named-mandatory or whole-source approvals. No actual reviewed raster/native D/V is claimed.",
    "nextEligibleNativeAuthorOrdinalsOnThisAReading": [4, 5, 6, 7, 9, 10, 15, 20, 21, 22, 23],
    "nextStep": "Combine only with a separately genuine independent B result, then author/review actual native raster pages for eligible goals. Source/whole compound remediation remains separately required; unchanged accepted science and images retain their own valid evidence.",
    "currentPeerBRead": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("completed-six-case-five-profile-science-and-source-only-P5.independent-a.exact-handoff.entry.json", entry)
seal = {
    "schemaVersion": 1, "sealedAt": now,
    "kind": "Completed own genuine six-case scientific followup and actual native source-only P5, with both scientific first seals preserved",
    "ownFiles": [binding(path) for path in sorted(OWN.iterdir()) if path.is_file()],
    "originalScientificFirstSeal": binding(old_first), "followupScientificFirstSeal": binding(new_first),
    "requiredPortableInputClosure": binding(OWN / "final-own-six-case-followup-portable-transitive-inputs.actual.json"),
    "peerCurrentBRead": False, "nativeD_VOrFinalRasterP": "PENDING_NOT_CLAIMED",
    "activeWrites": 0, "strictGainClaimed": 0, "approved": 0,
    "humanApproval": False, "humanTrial": False,
}
put("completed-six-case-five-profile-science-and-source-only-P5.independent-a.final.freeze.json", seal)
print(json.dumps({
    "actualPortableRequiredFiles": len(required_paths), "ignoredRequiredInputs": 0, "brokenRequiredInputs": 0,
    "sourceOnlyP5ActualCLIExit": 0, "needsHumanReview": 5, "approved": 0,
    "genuineSixCaseScientificKEEP": 6, "oldFindingsAndSourceHoldsPreserved": True,
    "finalSeal": binding(OWN / "completed-six-case-five-profile-science-and-source-only-P5.independent-a.final.freeze.json"),
    "entry": binding(OWN / "completed-six-case-five-profile-science-and-source-only-P5.independent-a.exact-handoff.entry.json"),
}, ensure_ascii=False))
