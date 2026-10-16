# SPDX-License-Identifier: Apache-2.0
"""Prepare a new sparse, inactive stock host. No review outcomes are produced."""
import hashlib
import json
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
OWN = Path(__file__).resolve().parents[1]
REL = OWN.relative_to(REPO).as_posix()
E14 = REPO / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14"
AUTHOR = E14 / "chemie-acid-analytics-remaining-ten-whole-material-and-profile-author-20261014-v1"
CURRENT = E14 / "chemie-acid7-current419-paired-D6-retained059-P7A7M2V1-inactive-integration-technical-20261014-v4"
N6 = E14 / "chemie-acid7-two-description-one-image-current419-native-successor-technical-20261014-v3"
HOST = REPO / "tmp/chemie-resume-20261015/remaining10-native-host"


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def bind(path):
    return {"path": path.relative_to(REPO).as_posix(), "sha256": sha(path), "bytes": path.stat().st_size}


def write(name, value):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


assert not HOST.exists(), "An entirely new ignored host is required"
assert not (OWN / "config").exists(), "Preparation already started"
for sub in ("inputs", "config", "checks", "receipts"):
    (OWN / sub).mkdir(parents=True, exist_ok=True)

neutral_path = AUTHOR / "NEUTRAL.exact-ten-whole-material-profile-author-inputs.json"
neutral = read(neutral_path)
goal_ids = neutral["goalIds"]
assert len(goal_ids) == 10 and len(set(goal_ids)) == 10
external = [bind(neutral_path), bind(AUTHOR / neutral["finiteSealPath"])]
for row in neutral["inputBindings"]:
    path = AUTHOR / row["path"]
    assert sha(path) == row["sha256"] and path.stat().st_size == row["bytes"], path
    external.append(bind(path))
author_seal = read(AUTHOR / neutral["finiteSealPath"])
# Bind the original finite seal exactly; check every row regardless of its
# historical naming convention without altering that predecessor.
seal_rows = next(author_seal[k] for k in ("files", "artifacts", "rows", "ownedFiles") if k in author_seal)
for row in seal_rows:
    path = AUTHOR / row["path"]
    if not path.exists():
        path = REPO / row["path"]
    assert sha(path) == row["sha256"] and path.stat().st_size == row["bytes"], path

current_neutral = read(CURRENT / "NEUTRAL.final-inactive-integration-and-physical-resume.json")
external.extend([bind(CURRENT / "NEUTRAL.final-inactive-integration-and-physical-resume.json"), bind(CURRENT / "FINAL.integration.receipt.json"), bind(CURRENT / "FILES.finite-final-inactive-integration.seal.json")])
physical_map_path = REPO / current_neutral["physical50Aliases428AssetsAndMSourceMap"]["path"]
physical = read(physical_map_path)
external.append(bind(physical_map_path))
for row in physical["aliases"]:
    source = REPO / row["physicalRepositorySource"]["path"]
    assert sha(source) == row["physicalRepositorySource"]["sha256"], source
for row in physical["selectedCurrentAssetRows"]:
    source = REPO / row["physicalRepositorySource"]["path"]
    assert sha(source) == row["physicalRepositorySource"]["sha256"], source

canonical_path = REPO / current_neutral["currentFullCanonical551"]["path"]
assert sha(canonical_path) == "sha256:b07e023f03a7c573e2b823c491e030c0ca1b5d530b17116de2b4a3d8010d0339"
canonical = read(canonical_path)
by_id = {g["id"]: g for g in canonical["goals"]}
author_goals = read(AUTHOR / "inputs/whole-ten-current-goals.exact.json")
assert len(by_id) == 551
assert author_goals["goalIds"] == goal_ids
assert author_goals["goals"] == [by_id[g] for g in goal_ids]
old_by_id = {g["id"]: g for g in read(AUTHOR / "inputs/canonical551.current419.exact.json")["goals"]}
changed = [gid for gid in by_id if by_id[gid] != old_by_id[gid]]
assert set(changed) == {"2a8a13b8-f96a-5ff1-92fa-fe6c19973a0e", "d7461c15-6992-5342-b899-6c490ee0cbb7", "48115ff7-7aca-5d0b-a9e7-7fc6c78434ef"}
context = []
for gid in goal_ids:
    goal = by_id[gid]
    neighbor_ids = sorted(set(goal.get("requires", [])) | set(goal.get("contains", [])) | {i for i, g in by_id.items() if gid in g.get("requires", []) or gid in g.get("contains", [])})
    context.append({"goalId": gid, "wholeCurrentGoal": goal, "directRequires": goal.get("requires", []), "directContains": goal.get("contains", []), "directRequiredBy": [i for i,g in by_id.items() if gid in g.get("requires",[])], "directParents": [i for i,g in by_id.items() if gid in g.get("contains",[])], "wholeCurrentDirectNeighbors": [by_id[i] for i in neighbor_ids], "neighborsChangedSinceAuthorBase": [i for i in neighbor_ids if old_by_id[i] != by_id[i]]})
write("inputs/ten-whole-current-bodies-and-direct-neighbors.exact.json", {"schemaVersion": 1, "role": "technical current context, no scientific verdict", "canonicalBinding": bind(canonical_path), "goalIds": goal_ids, "wholeTenUnchangedFromFrozenAuthor": True, "currentWholeCanonicalChangesSinceAuthor": changed, "rows": context})

original_claim = AUTHOR / "inputs/original17.claim.exact.config.json"
claim = read(original_claim)
ledger_path = REPO / "curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json"
ledger = read(ledger_path)
original_claim_path = read(AUTHOR / "INPUTS.scope-provenance-and-role.actual.json")["exactInputs"][0]["sourcePath"]
assert sha(REPO / original_claim_path) == sha(original_claim)
assert original_claim_path in ledger["activeBatchConfigPaths"]
assert len(claim["goalIds"]) == 17 and set(goal_ids) <= set(claim["goalIds"])
write("checks/CAS.original17-ownership-read-only.actual.json", {"schemaVersion": 1, "originalClaim": bind(REPO / original_claim_path), "liveLedgerBefore": bind(ledger_path), "originalClaimStillLive": True, "selectedTenAreSubsetOfOriginal17": True, "newClaimAdded": False, "ledgerWritten": False, "claimConfigsWritten": 0})
external.extend([bind(REPO / original_claim_path), bind(ledger_path)])

HOST.mkdir(parents=True)


def branch(path):
    if path.is_symlink():
        children = list(path.resolve(strict=True).iterdir())
        path.unlink()
        path.mkdir()
        for child in children:
            (path / child.name).symlink_to(child, target_is_directory=child.is_dir())
    elif not path.exists():
        path.mkdir()
    assert path.is_dir() and not path.is_symlink(), path


def leaf(path):
    current = HOST
    for part in path.relative_to(HOST).parts[:-1]:
        current /= part
        branch(current)
    if path.is_file() or path.is_symlink():
        path.unlink()
    else:
        assert not path.exists(), path


def link(source, destination):
    leaf(destination)
    destination.symlink_to(source)


def copy(source, destination):
    leaf(destination)
    shutil.copy2(source, destination)


for source in REPO.iterdir():
    if source.name not in ("app", "tmp", ".git"):
        (HOST / source.name).symlink_to(source, target_is_directory=source.is_dir())
(HOST / "app").mkdir()
for source in (REPO / "app").iterdir():
    if source.name != "scripts":
        (HOST / "app" / source.name).symlink_to(source, target_is_directory=source.is_dir())
(HOST / "app/scripts").mkdir()

# Copy only the transitive local import graph. Physical script paths are needed
# for unchanged stock import.meta.url repository-root calculations.
pending = [REPO / "app/scripts/materializeGoalDescriptionRolloutBatch.ts"]
modules = {}
pattern = re.compile(r"(?:from\s*|import\s*\(|require\s*\()\s*['\"](\.[^'\"]+)['\"]")
while pending:
    source = pending.pop()
    if source in modules:
        continue
    modules[source] = bind(source)
    copy(source, HOST / source.relative_to(REPO))
    for spec in pattern.findall(source.read_text()):
        base = source.parent / spec
        choices = [base, *[Path(str(base) + ext) for ext in (".ts", ".tsx", ".mjs", ".mts", ".js", ".json")], *[base / ("index" + ext) for ext in (".ts", ".tsx", ".js")]]
        dependency = next((p.resolve() for p in choices if p.is_file()), None)
        assert dependency is not None, (source, spec)
        assert dependency.is_relative_to(REPO), dependency
        pending.append(dependency)

aliases = []
for row in physical["aliases"]:
    source = REPO / row["physicalRepositorySource"]["path"]
    link(source, HOST / row["normalHostAlias"])
    aliases.append({**row, "materialization": "immutable source symlink; stock prepare/check only read this alias"})
assets = []
selected_asset_bytes = 0
for row in physical["selectedCurrentAssetRows"]:
    source = REPO / row["physicalRepositorySource"]["path"]
    link(source, HOST / row["normalCanonicalDestination"])
    public_destination = HOST / row["normalPublicDestination"]
    selected = row["goalId"] in goal_ids
    if selected:
        copy(source, public_destination)
        selected_asset_bytes += source.stat().st_size
        assert public_destination.resolve().is_relative_to((HOST / "app/public").resolve())
    else:
        link(source, public_destination)
    assets.append({**row, "publicMustBePhysicalWithinHostPublicRoot": selected, "publicMaterialization": "independent physical bytes" if selected else "immutable source symlink"})
assert sum(r["publicMustBePhysicalWithinHostPublicRoot"] for r in assets) == 10

base = read(N6 / "config/whole419.native-preparation-only.stock-base.config.json")
base.update({"bookId": "chemie-acid-analytics-ten-current419-native-full-base-20261015-v1", "title": "Chemie – aktueller vollständiger Kontext der zehn Analytik- und Pufferziele", "outputPath": REL + "/candidate/whole419.stock-base.model.not-materialized.json"})
write("config/whole419.current-normal.stock-base.config.json", base)
batch = read(AUTHOR / "config/ten-whole-current419.author-scope.claim.config.json")
batch.update({"batchId": "chemie-acid-analytics-ten-current419-native-20261015-v1", "bookId": "chemie-acid-analytics-ten-current419-native-20261015-v1", "title": "Chemie – zehn bestehende Analytik- und Pufferziele im aktuellen Gesamtkontext", "baseGoalBookConfigPath": REL + "/config/whole419.current-normal.stock-base.config.json", "outputDirectory": REL + "/native-ten-current", "printDerivativeProfile": "bounded-atlas"})
write("config/native10.current419.normal-prepare-only.config.json", batch)
for key in ("promptPath", "criteriaPath"):
    external.append(bind(REPO / batch[key]))
for path in base["evidenceReviewPaths"]:
    external.append(bind(REPO / path))

write("checks/REBUILD.current419-sparse-native-ten.physical-map.actual.json", {"schemaVersion": 1, "role": "technical reconstruction, not science", "executionHost": HOST.relative_to(REPO).as_posix(), "sourcePhysicalMap": bind(physical_map_path), "aliases": aliases, "selectedCurrentAssetRows": assets, "stockPhysicalModules": list(modules.values()), "physicalPublicSelectedCount": 10, "physicalPublicSelectedBytes": selected_asset_bytes, "unselectedPublicLeaves": "symlinks to existing immutable physical repository inputs", "fullTreeCopies": 0, "hardlinksCreated": 0, "mainOrEarlierHostWrites": False, "normalStockCommands": [["app/node_modules/.bin/tsx", "app/scripts/materializeGoalDescriptionRolloutBatch.ts", mode, "--config", REL + "/config/native10.current419.normal-prepare-only.config.json"] for mode in ("prepare", "check")]})
write("inputs/FROZEN.external-input-bindings.before-prepare.json", {"schemaVersion": 1, "createdAtUTC": datetime.now(timezone.utc).isoformat(), "bindings": external, "role": "technical provenance only", "scientificVotes": 0})
print(json.dumps({"root": REL, "host": HOST.relative_to(REPO).as_posix(), "goalCount": len(goal_ids), "canonicalGoals": len(by_id), "normalAliases": len(aliases), "assets": len(assets), "physicalPublicLeaves": 10, "physicalModuleCount": len(modules), "physicalModuleBytes": sum(r["bytes"] for r in modules.values()), "selectedAssetBytes": selected_asset_bytes, "scientificVotes": 0}))
