"""Guarded local integration of this fully reviewed inactive BIO-v4 candidate.

Default is read-only. --apply is for the root integrator after its own review.
Only the exact 38 proposed current inputs and the Biology registry entry are
eligible writes. Other current subject entries are carried forward unchanged.
No Git, publication, runtime, private-data or in-flight-ledger operation occurs.
"""
from hashlib import sha256
from pathlib import Path
import argparse
import json
import os
import tempfile

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
assert ROOT == Path("/home/enpasos/projects/skillpilot")

def digest(path):
    return "sha256:" + sha256(path.read_bytes()).hexdigest()

def load(path):
    return json.loads(path.read_text())

def checked_path(relative):
    path = ROOT / relative
    assert path.resolve().is_relative_to(ROOT), "Path leaves the repository."
    assert not path.is_symlink(), "An active input must be a regular file."
    return path

def replace_atomically(target, payload):
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(prefix="." + target.name + ".bio-v4-", dir=target.parent, delete=False) as handle:
        temporary = Path(handle.name)
        handle.write(payload)
    try:
        os.replace(temporary, target)
    finally:
        temporary.unlink(missing_ok=True)

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--apply", action="store_true")
args = parser.parse_args()
freeze = load(OUT / "integration-candidate.final.freeze.json")
for frozen in freeze["files"]:
    assert digest(checked_path(frozen["path"])) == frozen["sha256"], "Frozen v4 evidence changed."
guard = load(OUT / "active-input-before.guard.json")
manifest = load(OUT / "proposed-active-inputs.freeze.json")
guards = {entry["path"]: entry for entry in guard["files"]}
pending = []
for entry in manifest["files"]:
    expected = guards[entry["path"]]
    source = checked_path(entry["preparedPath"])
    target = checked_path(entry["path"])
    assert digest(source) == entry["sha256"] == expected["afterSha256"]
    assert not target.exists() or target.is_file(), "An active path is not a file."
    actual = digest(target) if target.is_file() else None
    assert actual in [expected["beforeSha256"], expected["afterSha256"]], "A current scoped input changed after review: " + entry["path"]
    if actual != entry["sha256"]:
        pending.append((target, source.read_bytes()))

registry_path = checked_path(guard["registryPath"])
registry = load(registry_path)
biology = [entry for entry in registry["subjects"] if entry["subject"] == "biologie"]
assert len(biology) == 1
assert biology[0] in [guard["currentBioEntryBefore"], guard["futureBioEntry"]], "Current Biology registry changed after review."
other_subjects_before = {entry["subject"]: entry for entry in registry["subjects"] if entry["subject"] != "biologie"}
registry["subjects"] = [guard["futureBioEntry"] if entry["subject"] == "biologie" else entry for entry in registry["subjects"]]
assert {entry["subject"]: entry for entry in registry["subjects"] if entry["subject"] != "biologie"} == other_subjects_before
registry_bytes = (json.dumps(registry, ensure_ascii=False, indent=2) + "\n").encode()
registry_changed = load(registry_path) != registry

if args.apply:
    for target, payload in pending:
        replace_atomically(target, payload)
    if registry_changed:
        replace_atomically(registry_path, registry_bytes)

print(json.dumps({
    "mode": "applied reviewed current inputs" if args.apply else "read-only preflight",
    "pendingOrWrittenInputFiles": len(pending),
    "bioRegistryEntryChanged": registry_changed,
    "otherRegistrySubjectsPreserved": sorted(other_subjects_before),
    "nativeFutureEvidence": "40/364 with all previous 38 IDs; final active check remains required",
    "activeInputsWritten": args.apply,
    "humanApproval": False,
    "actualCurrentStrictClosureClaim": False,
}))
