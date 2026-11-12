# SPDX-License-Identifier: Apache-2.0
"""Repository-side semantic-kind comparisons; no graph logic or import-time IO."""

from __future__ import annotations

import hashlib
import json
import re
import stat
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping


REGISTRY_PATH = "curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json"
COMPARISON_FAMILY = "semantic-kind-source-fingerprint-v1"
PROOF_CONTRACT = "direct-atomic-leaf-prerequisite-reduction-v1"
CLUSTER_PROOF_CONTRACT = "atomic-descendant-covered-cluster-reduction-v2"
ORDERED_PROOF_CONTRACT = "ordered-atomic-materialization-and-cluster-reduction-v3"
CONTINUED_PROOF_CONTRACT = "continued-atomic-prerequisite-reduction-v4"
CLUSTER_TARGET_PROOF_CONTRACT = "atomic-cluster-target-normalization-v5"
APPEND_ONLY_PROOF_CONTRACT = "append-only-prerequisite-reduction-batches-v6"
APPLICABILITY_REFRESH_PROOF_CONTRACT = "prerequisite-reduction-applicability-refresh-v7"
BASIS_BOUND_PROOF_CONTRACT = "assessment-basis-bound-prerequisite-reduction-v8"
SOFTWARE_ROOT = Path(__file__).resolve().parents[1]
# Still one bounded attempt without fallback. The complete proof verification took
# 273 s before and 526 s after the remaining protected subjects were added, and a
# slower hosted runner exceeded the former 600-second bound on unchanged data.
NODE_VERIFIER_TIMEOUT_SECONDS = 1800


class PrerequisiteReductionBindingError(RuntimeError):
    """A declared comparison proof or its process binding is invalid."""


def require(condition: Any, message: str) -> None:
    if not condition:
        raise PrerequisiteReductionBindingError(message)


def digest(raw: bytes) -> str:
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def parse_json(raw: bytes) -> Any:
    def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in items:
            require(key not in result, f"Duplicate JSON member: {key}")
            result[key] = value
        return result

    def reject_constant(value: str) -> None:
        raise PrerequisiteReductionBindingError(f"Invalid JSON constant: {value}")

    return json.loads(raw, object_pairs_hook=pairs, parse_constant=reject_constant)


def exact_fields(value: Any, keys: set[str], label: str) -> None:
    require(isinstance(value, dict) and set(value) == keys, f"Invalid {label} fields")


def fingerprint_prerequisite_reduction_document(document: Mapping[str, Any]) -> str:
    """Python mirror of ``fingerprintPrerequisiteReductionDocument`` (app/scripts/prerequisiteReductionProof.ts).

    A proof binds each catalog document without its learning-unit layer, using the package
    build's own projection (``curriculum_learning_units.project_out_learning_units``) and the
    ECMAScript-compatible canonical JSON of the release compiler. This bridge does not
    recompute the proof: it delegates verification to the Node verifier and compares the
    caller snapshot with the complete source bytes.
    """
    import compile_curriculum_release_model as compiler  # Lazy: the compiler imports this bridge.
    import curriculum_learning_units as learning_units

    return digest(compiler.canonical_json_text(learning_units.project_out_learning_units(document)).encode("utf-8"))


@dataclass(frozen=True)
class SemanticKindReductionBindings:
    baseline_fingerprints: Mapping[str, str]
    provenance: Mapping[str, Any]


def load_verified_semantic_kind_bindings(
    repository_root: Path,
    source_path: Path,
    source_document: Mapping[str, Any],
    current_fingerprints: Mapping[str, str],
) -> SemanticKindReductionBindings | None:
    """Invoke the existing Node verifier independently for this repository tool.

    An absent registry keeps the original strict comparison and needs no Node.
    No caller can supply a receipt or turn a declared invalid proof into absence.
    """
    try:
        registry_path = repository_root / REGISTRY_PATH
        try:
            registry_stat = registry_path.lstat()
        except FileNotFoundError:
            return None
        require(stat.S_ISREG(registry_stat.st_mode), "Registry must be a regular file")
        registry_bytes = registry_path.read_bytes()
        relative_source = source_path.relative_to(repository_root).as_posix()
        source_bytes = source_path.read_bytes()
        # JSON text comparison preserves types as well as fields outside sourceFP.
        serialize = lambda value: json.dumps(value, sort_keys=True, allow_nan=False)
        require(serialize(parse_json(source_bytes)) == serialize(source_document),
                "Full canonical source differs from the caller snapshot")
        completed = subprocess.run(
            ["node", "--import", "tsx", "scripts/verifyPrerequisiteReductionSemanticKindBindings.ts",
             "--canonical-source", relative_source, "--repository-root", str(repository_root)],
            cwd=SOFTWARE_ROOT / "app", capture_output=True, timeout=NODE_VERIFIER_TIMEOUT_SECONDS, check=False,
        )
        require(completed.returncode == 0,
                "Node prerequisite reduction verification failed: "
                + completed.stderr.decode("utf-8", errors="replace")[-4000:])
        receipt = parse_json(completed.stdout)
        exact_fields(receipt, {"schemaVersion", "comparisonFamily", "source", "proof", "goals"}, "receipt")
        require(type(receipt["schemaVersion"]) is int and receipt["schemaVersion"] == 1
                and receipt["comparisonFamily"] == COMPARISON_FAMILY, "Invalid comparison contract")
        source = receipt["source"]
        exact_fields(source, {"path", "landscapeId", "sha256"}, "source binding")
        require(source == {"path": relative_source, "landscapeId": source_document["landscapeId"],
                           "sha256": digest(source_bytes)}, "Canonical source byte or owner binding differs")
        proof = receipt["proof"]
        exact_fields(proof, {"proofContract", "mode", "auditScope", "registryPath", "registryDigest", "affectedGoalIds"}, "proof summary")
        require(proof["proofContract"] in (PROOF_CONTRACT, CLUSTER_PROOF_CONTRACT,
                                          ORDERED_PROOF_CONTRACT, CONTINUED_PROOF_CONTRACT,
                                          CLUSTER_TARGET_PROOF_CONTRACT, APPEND_ONLY_PROOF_CONTRACT,
                                          APPLICABILITY_REFRESH_PROOF_CONTRACT, BASIS_BOUND_PROOF_CONTRACT)
                and proof["mode"] == "current-or-certified-baseline-comparison"
                and proof["auditScope"] == "origin-source-landscape-closure"
                and proof["registryPath"] == REGISTRY_PATH
                and proof["registryDigest"] == digest(registry_bytes), "Registry byte or proof contract binding differs")
        affected = proof["affectedGoalIds"]
        require(isinstance(affected, list) and affected
                and all(isinstance(value, str) and re.fullmatch(r"[^:\s]+:[^:\s]+", value) for value in affected)
                and affected == sorted(set(affected)), "Invalid affected goal inventory")
        goals = source_document.get("goals")
        require(isinstance(goals, list) and all(isinstance(goal, dict) and isinstance(goal.get("id"), str) for goal in goals),
                "Invalid caller goal inventory")
        goal_ids = [goal["id"] for goal in goals]
        require(len(goal_ids) == len(set(goal_ids)) and set(goal_ids) == set(current_fingerprints),
                "Caller fingerprint coverage differs from its source")
        rows = receipt["goals"]
        require(isinstance(rows, list) and len(rows) == len(goal_ids), "Receipt goal coverage differs")
        baseline: dict[str, str] = {}
        for row in rows:
            exact_fields(row, {"goalId", "currentFingerprint", "baselineFingerprint"}, "goal fingerprint")
            goal_id = row["goalId"]
            require(isinstance(goal_id, str) and goal_id in current_fingerprints and goal_id not in baseline,
                    "Receipt has an unknown or duplicate goal")
            require(row["currentFingerprint"] == current_fingerprints[goal_id],
                    f"Node/Python current fingerprint differs for {goal_id}")
            require(isinstance(row["baselineFingerprint"], str)
                    and re.fullmatch(r"sha256:[0-9a-f]{64}", row["baselineFingerprint"]), "Invalid baseline fingerprint")
            require(row["baselineFingerprint"] == row["currentFingerprint"]
                    or f"{source['landscapeId']}:{goal_id}" in affected, "Undeclared historical goal fingerprint")
            baseline[goal_id] = row["baselineFingerprint"]
        require(source_bytes == source_path.read_bytes(), "Canonical source changed during verification")
        require(registry_bytes == registry_path.read_bytes(), "Registry changed during verification")
        return SemanticKindReductionBindings(baseline, {
            **proof, "comparisonFamily": COMPARISON_FAMILY, "canonicalSource": source,
        })
    except PrerequisiteReductionBindingError:
        raise
    except (OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError) as error:
        raise PrerequisiteReductionBindingError(f"Prerequisite reduction binding failed: {error}") from error
