# SPDX-License-Identifier: Apache-2.0
"""Transport exact sealed inputs; independent A native results remain pending.

No scientific decisions, active changes, or central measurement occur here.
Run from the repository root. Never rerun after the integration's finite seal.
"""
import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
E15 = REPO / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15"
OLD_NATIVE = E15 / "chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1"
B = E15 / "chemie-acid-analytics-ten-current419-successor-independent-b-resumed-20261015-v2"
BASE = REPO / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid7-current419-paired-D6-retained059-P7A7M2V1-inactive-integration-technical-20261014-v4"


def load(p):
    return json.loads(p.read_text())


def binding(p):
    data = p.read_bytes()
    return {"path": p.relative_to(REPO).as_posix(), "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def dump(relative, data):
    dest = OWN / relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    assert load(dest) == data
    return dest


def main():
    assert not (OWN / "FILES.finite-integration.seal.json").exists()
    for row in load(B / "FILES.finite-original-independent-b.seal.json")["files"]:
        source = Path(row["path"])
        if not source.is_absolute():
            source = REPO / source if str(source).startswith("curricula/") else B / source
        actual = binding(source)
        assert actual["sha256"] == row["sha256"] and actual["bytes"] == row["bytes"], source
    source_config = BASE / "config/chemie-current419-acid7-D6-retained059-P7A7M2V1.final.normal.inactive.config.json"
    central = load(source_config)
    central["reportId"] = "chemie-acid10-current419-original-independent-P10-A7-paired-native-inactive-20261015-v1"
    subject = central["subjects"][0]
    assert subject["subject"] == "chemie"
    original_b = load(B / "NEUTRAL.original-independent-b-exact-output-selector.json")
    aliases = []
    for label, key, source_key, stem in (
        ("P", "positiveEvidenceConfigPaths", "positiveConfig", "P10.original-B.normal-address.inactive.config.json"),
        ("A", "semanticAtomicityConfigPaths", "atomicityConfig", "A10.original-B.normal-address.inactive.config.json"),
    ):
        source = REPO / original_b["outputBindings"][source_key]["path"]
        before = load(source)
        after = json.loads(json.dumps(before))
        after["landscapePath"] = subject["landscapePath"]
        if label == "P":
            after["semanticKindLedgerPath"] = subject["semanticKindLedgerPath"]
        target = dump("config/" + stem, after)
        subject[key].append(target.relative_to(REPO).as_posix())
        delta_keys = [k for k in set(before) | set(after) if before.get(k) != after.get(k)]
        assert set(delta_keys) <= {"landscapePath", "semanticKindLedgerPath"}
        aliases.append({"role": label + " exact existing science; address transport only", "source": binding(source), "target": binding(target), "changedFields": delta_keys, "reviewRecordsAndOriginalRunManifestsUnchanged": True})
    dump("config/central.current419.P10-A7-awaiting-native-pair.inactive.config.json", central)
    dump("checks/CONFIG.original-B-address-only-transport.json", {"schemaVersion": 1, "role": "Technical config addressing, not scientific rebinding", "rows": aliases, "actualCanonicalBytes": binding(REPO / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid7-two-description-one-image-current419-native-successor-technical-20261014-v3/candidate/canonical551.current419.three-author-deltas.exact.json"), "canonicalContentChanges": 0, "scientificApprovalsCreated": 0, "strictGainClaimed": 0})

    destination = OWN / "native-ten"
    assert not destination.exists(), "Never replace a prepared or reviewed integration container"
    shutil.copytree(OLD_NATIVE / "native-ten-current", destination)
    for label in ("a", "b"):
        assert not list((destination / f"round-{label}/results").iterdir())
    shutil.copytree(B / "D/round-b", destination / "round-b", dirs_exist_ok=True)
    cfg = load(OLD_NATIVE / "config/native10.current419.normal-prepare-only.config.json")
    cfg["outputDirectory"] = destination.relative_to(REPO).as_posix()
    config_path = dump("config/native10.exact-bundle-transport.config.json", cfg)
    manifest_path = destination / "batch-manifest.json"
    manifest = load(manifest_path)
    previous_manifest = binding(OLD_NATIVE / "native-ten-current/batch-manifest.json")
    manifest["configPath"] = config_path.relative_to(REPO).as_posix()
    manifest["configDigest"] = binding(config_path)["sha256"]
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    for p in (OLD_NATIVE / "native-ten-current/bundle").rglob("*"):
        if p.is_file():
            assert p.read_bytes() == (destination / "bundle" / p.relative_to(OLD_NATIVE / "native-ten-current/bundle")).read_bytes()
    dump("checks/NATIVE.exact-bundle-and-B-transport-A-pending.json", {"schemaVersion": 1, "role": "Exact current native input transport; no rendering or scientific judgment", "originalNativeManifest": previous_manifest, "transportedNativeManifest": binding(manifest_path), "onlyManifestAddressFieldsChanged": ["configPath", "configDigest"], "allBundleBytesExact": True, "originalBRound": original_b["outputBindings"]["nativeCampaign"], "roundAResultsEmpty": True, "DPairReady": False, "strictGainClaimed": 0})

    sparse = load(OLD_NATIVE / "checks/REBUILD.current419-sparse-native-ten.physical-map.actual.json")
    modules = {row["path"]: row for row in sparse["stockPhysicalModules"]}
    queue = [REPO / p for p in ("app/scripts/semanticAtomicityReview.ts", "app/scripts/memoryCardReview.ts", "app/scripts/generateGoalVisualizationQaLedgers.ts")]
    visited = set()
    while queue:
        source = queue.pop()
        if source in visited:
            continue
        visited.add(source)
        assert source.is_file() and source.is_relative_to(REPO)
        modules[source.relative_to(REPO).as_posix()] = binding(source)
        for target in re.findall(r"\bfrom\s*['\"](\.{1,2}/[^'\"]+)['\"]", source.read_text()):
            raw = (source.parent / target).resolve()
            candidates = [raw, Path(str(raw) + ".ts"), Path(str(raw) + ".tsx"), Path(str(raw) + ".mjs"), raw / "index.ts"]
            found = next((p for p in candidates if p.is_file()), None)
            assert found, (source, target)
            queue.append(found)
    sparse["stockPhysicalModules"] = [modules[p] for p in sorted(modules)]
    sparse["executionHost"] = "tmp/chemie-m7-resumed-20261015/acid10-current419-integration-host"
    sparse["role"] = "Reconstruct exact frozen current419 base plus root config transport; no scientific decisions"
    sparse["legacyQaDispositionDiscoveryInput"] = load(BASE / "checks/REBUILD.current419-final.alias50-assets428-plus-currentM.physical-map.actual.json")["legacyQaDispositionDiscoveryInput"]
    dump("checks/REBUILD.current419-P10-A7-native-pair.physical-map.json", sparse)
    dump("STARTED.integration-input-transport.json", {"schemaVersion": 1, "startedAtUTC": datetime.now(timezone.utc).isoformat(), "role": "Root technical integration input transport only; source/description disputes remain open", "sourceCentralConfig": binding(source_config), "independentBSelector": binding(B / "NEUTRAL.original-independent-b-exact-output-selector.json"), "nativeAStillPending": True, "centralReportExecuted": False, "previousActualStrict": 312, "denominator": 419, "newStrictClosuresClaimed": 0, "activeIntegration": False, "humanApproval": False, "humanTrial": False})
    print(json.dumps({"PConfigsAdded": 1, "AConfigsAdded": 1, "nativeBundleCopiedExactly": True, "BRoundCopiedExactly": True, "ARoundPending": True, "stockPhysicalModuleCount": len(modules), "stockModuleBytes": sum(x["bytes"] for x in modules.values()), "centralReportExecuted": False}))


if __name__ == "__main__":
    main()
