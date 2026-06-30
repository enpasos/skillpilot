#!/usr/bin/env python3

from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
APP_ROOT = REPO_ROOT / "app"
TRACKER_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json"
SOURCE_LANDSCAPE_REGISTRY_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/source-landscape-registry.json"
CANONICAL_GOAL_PROVENANCE_REGISTRY_PATH = (
    REPO_ROOT / "curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json"
)
CANONICAL_GOAL_APPLICABILITY_OVERRIDE_REGISTRY_PATH = (
    REPO_ROOT / "curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json"
)
COMPOSITION_VIEW_PHYSICS_DIR = REPO_ROOT / "curricula/DE/Gymnasium/composition-views/physik"
ATOMIC_COUNT_SCRIPT_PATH = APP_ROOT / "scripts/reportCanonicalPhysicsStateAtomCounts.ts"
APP_TSX_PACKAGE_PATH = APP_ROOT / "node_modules/tsx"
ATOMIC_COUNT_METRICS = [
    ("sek1", "Sek I"),
    ("sek2Gk", "Sek II (GK)"),
    ("sek2Lk", "Sek II (LK)"),
]


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def mapping_count(repo_root: Path, mapping_files: list[str]) -> int:
    total = 0
    for rel_path in mapping_files:
        path = repo_root / rel_path
        if not path.exists():
            continue
        data = load_json(path)
        total += len(data.get("mappings", []))
    return total


def build_source_jurisdiction_index() -> dict[str, str]:
    data = load_json(SOURCE_LANDSCAPE_REGISTRY_PATH)
    index: dict[str, str] = {}
    for entry in data.get("entries", []):
        landscape_id = entry.get("landscapeId")
        jurisdiction = entry.get("jurisdiction")
        if isinstance(landscape_id, str) and isinstance(jurisdiction, str):
            index[landscape_id] = jurisdiction
    return index


def build_canonical_goal_provenance_index(landscape_id: str) -> dict[str, dict]:
    if not CANONICAL_GOAL_PROVENANCE_REGISTRY_PATH.exists():
        return {}
    data = load_json(CANONICAL_GOAL_PROVENANCE_REGISTRY_PATH)
    for entry in data.get("landscapes", []):
        if entry.get("landscapeId") != landscape_id:
            continue
        goal_provenance = entry.get("goalProvenance")
        if isinstance(goal_provenance, dict):
            return goal_provenance
    return {}


def build_canonical_goal_applicability_override_index(landscape_id: str) -> dict[str, dict]:
    if not CANONICAL_GOAL_APPLICABILITY_OVERRIDE_REGISTRY_PATH.exists():
        return {}
    data = load_json(CANONICAL_GOAL_APPLICABILITY_OVERRIDE_REGISTRY_PATH)
    for entry in data.get("landscapes", []):
        if entry.get("landscapeId") != landscape_id:
            continue
        overrides = entry.get("goalApplicabilityOverrides")
        if isinstance(overrides, dict):
            return overrides
    return {}


def normalize_goal_ref(ref: str) -> str:
    if ":" not in ref:
        return ref
    return ref.split(":", 1)[1]


def canonical_jurisdictions(repo_root: Path, landscape_rel_path: str) -> set[str]:
    data = load_json(repo_root / landscape_rel_path)
    landscape_id = data.get("landscapeId")
    goals = {
        goal["id"]: goal
        for goal in data.get("goals", [])
        if isinstance(goal, dict) and isinstance(goal.get("id"), str)
    }
    source_jurisdictions = build_source_jurisdiction_index()
    goal_provenance_index = build_canonical_goal_provenance_index(landscape_id) if isinstance(landscape_id, str) else {}
    goal_applicability_override_index = (
        build_canonical_goal_applicability_override_index(landscape_id) if isinstance(landscape_id, str) else {}
    )
    memo: dict[str, set[str]] = {}

    def goal_coverage(goal_id: str, visiting: set[str]) -> set[str]:
        if goal_id in memo:
            return memo[goal_id]
        if goal_id in visiting:
            return set()
        visiting.add(goal_id)
        goal = goals.get(goal_id, {})
        coverage: set[str] = set()

        provenance = goal_provenance_index.get(goal_id)
        if not isinstance(provenance, dict):
            provenance = goal.get("extendedData", {}).get("provenance", {})

        references = []
        source_landscape_id = provenance.get("sourceLandscapeId")
        if isinstance(source_landscape_id, str):
            references.append(source_landscape_id)
        additional = provenance.get("additionalSourceLandscapeIds")
        if isinstance(additional, list):
            references.extend(item for item in additional if isinstance(item, str))
        for reference in references:
            jurisdiction = source_jurisdictions.get(reference)
            if jurisdiction:
                coverage.add(jurisdiction)

        overrides = goal_applicability_override_index.get(goal_id)
        if not isinstance(overrides, dict):
            overrides = goal.get("extendedData", {}).get("applicabilityOverrides", {})
        override_jurisdictions = overrides.get("jurisdiction") if isinstance(overrides, dict) else None
        if isinstance(override_jurisdictions, list):
            coverage.update(item for item in override_jurisdictions if isinstance(item, str))

        inline_applicability = goal.get("applicability")
        inline_jurisdictions = inline_applicability.get("jurisdiction") if isinstance(inline_applicability, dict) else None
        if isinstance(inline_jurisdictions, list):
            coverage.update(item for item in inline_jurisdictions if isinstance(item, str))

        for child_ref in goal.get("contains", []) or []:
            if isinstance(child_ref, str):
                coverage.update(goal_coverage(normalize_goal_ref(child_ref), visiting))

        visiting.remove(goal_id)
        memo[goal_id] = coverage
        return coverage

    jurisdictions: set[str] = set()
    for goal_id in goals:
        jurisdictions.update(goal_coverage(goal_id, set()))
    return jurisdictions


def load_atomic_count_report() -> dict:
    if not APP_TSX_PACKAGE_PATH.exists():
        raise FileNotFoundError(
            f"Missing tsx runtime for atomic count report: {APP_TSX_PACKAGE_PATH.resolve().relative_to(REPO_ROOT)}"
        )
    if not ATOMIC_COUNT_SCRIPT_PATH.exists():
        raise FileNotFoundError(
            f"Missing atomic count script: {ATOMIC_COUNT_SCRIPT_PATH.resolve().relative_to(REPO_ROOT)}"
        )

    completed = subprocess.run(
        ["node", "--import", "tsx", str(ATOMIC_COUNT_SCRIPT_PATH.resolve().relative_to(APP_ROOT))],
        cwd=APP_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    try:
        return json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Failed to parse atomic count report JSON emitted by "
            f"{ATOMIC_COUNT_SCRIPT_PATH.resolve().relative_to(REPO_ROOT)}"
        ) from exc


def integer_corridor(reference_value: int, tolerance_percent: float) -> tuple[int, int]:
    tolerance_ratio = tolerance_percent / 100.0
    lower_bound = math.ceil(reference_value * (1.0 - tolerance_ratio))
    upper_bound = math.floor(reference_value * (1.0 + tolerance_ratio))
    return lower_bound, upper_bound


def corridor_status(value: int, lower_bound: int, upper_bound: int) -> str:
    if value < lower_bound:
        return "low"
    if value > upper_bound:
        return "high"
    return "ok"


def build_count_gate_next_step(
    display_name: str,
    issue_metric_labels: list[str],
    reference_label: str,
    tolerance_percent: float,
) -> str:
    if issue_metric_labels:
        issue_scope = ", ".join(f"`{label}`" for label in issue_metric_labels)
    else:
        issue_scope = "the missing stage-count data"
    return (
        f"Bring {display_name} into the {reference_label} atomic-count corridor on {issue_scope}: "
        "start with learner-facing physics composition views and applicability, then narrow any remaining "
        "gap through the smallest mapping/provenance delta that explains the missing visible atoms; "
        f"do not treat the lane as `cutover_ready` until all stage counts stay within `+-{int(tolerance_percent)}%` "
        f"of {reference_label}."
    )


def merge_count_gate_next_step(generic_next_step: str, state_next_step: str) -> str:
    normalized = state_next_step.strip()
    if not normalized:
        return generic_next_step
    if normalized.startswith("Keep ") or normalized.startswith("Maintain "):
        return generic_next_step
    return f"{generic_next_step} State-specific handling: {normalized}"


def render() -> str:
    tracker = load_json(TRACKER_PATH)
    phase_scale = {entry["id"]: entry for entry in tracker["phaseScale"]}
    states = tracker["states"]
    canonical_corridors = tracker.get("canonicalCorridors", [])
    steering_model = tracker.get("steeringModel", {})
    canonical_states = canonical_jurisdictions(REPO_ROOT, tracker["landscapePath"])
    atomic_count_policy = tracker.get("atomicCountPolicy", {})
    atomic_count_report = load_atomic_count_report() if atomic_count_policy else {}
    atomic_count_rows = atomic_count_report.get("rows", []) if isinstance(atomic_count_report, dict) else []
    atomic_count_by_jurisdiction = {
        row["jurisdiction"]: row
        for row in atomic_count_rows
        if isinstance(row, dict) and isinstance(row.get("jurisdiction"), str)
    }
    cutover_gate = atomic_count_policy.get("cutoverGate", {}) if isinstance(atomic_count_policy, dict) else {}
    cutover_gate_enabled = bool(cutover_gate.get("enabled"))
    cutover_gate_fallback_phase_id = (
        cutover_gate.get("fallbackPhase", "P5") if cutover_gate_enabled else None
    )
    cutover_gate_fallback_source_stage = (
        cutover_gate.get("fallbackSourceStage", "subtree_adopted")
        if cutover_gate_enabled
        else None
    )
    cutover_gate_partial_failure_priority = (
        cutover_gate.get("partialFailurePriority", "next_wave")
        if cutover_gate_enabled
        else None
    )
    cutover_gate_full_failure_priority = (
        cutover_gate.get("fullFailurePriority", "active")
        if cutover_gate_enabled
        else None
    )
    reference_jurisdiction = atomic_count_policy.get("referenceJurisdiction")
    reference_label = atomic_count_policy.get("referenceLabel", reference_jurisdiction)
    tolerance_percent = float(atomic_count_policy.get("tolerancePercent", 20)) if atomic_count_policy else 20.0
    reference_counts = (
        atomic_count_by_jurisdiction.get(reference_jurisdiction)
        if isinstance(reference_jurisdiction, str)
        else None
    )
    corridor_bounds = {
        key: integer_corridor(int(reference_counts[key]), tolerance_percent)
        for key, _label in ATOMIC_COUNT_METRICS
        if isinstance(reference_counts, dict) and isinstance(reference_counts.get(key), int)
    }
    priority_order = {"active": 0, "next_wave": 1, "backlog": 2}

    rows = []
    stage_corridor_pass_counts = {key: 0 for key, _label in ATOMIC_COUNT_METRICS}
    full_corridor_pass_count = 0
    for state in states:
        phase = phase_scale[state["phase"]]
        atomic_counts = atomic_count_by_jurisdiction.get(state["jurisdiction"])
        count_corridor = "n/a"
        count_corridor_detail = "no automatic count data"
        count_issue_metric_labels: list[str] = []
        if isinstance(atomic_counts, dict) and corridor_bounds:
            if state["jurisdiction"] == reference_jurisdiction:
                count_corridor = "reference"
                count_corridor_detail = f"reference lane `{reference_label}`"
            else:
                issues = []
                for metric_key, metric_label in ATOMIC_COUNT_METRICS:
                    metric_value = atomic_counts.get(metric_key)
                    if not isinstance(metric_value, int):
                        issues.append(f"{metric_label} missing")
                        continue
                    lower_bound, upper_bound = corridor_bounds[metric_key]
                    metric_status = corridor_status(metric_value, lower_bound, upper_bound)
                    if metric_status == "ok":
                        stage_corridor_pass_counts[metric_key] += 1
                    else:
                        count_issue_metric_labels.append(metric_label)
                        issues.append(f"{metric_label} {metric_status}")
                if atomic_counts.get("sek1CourseProfileMismatch") is True:
                    issues.append(f"Sek I GK/LK mismatch ({atomic_counts.get('sek1Gk')} vs {atomic_counts.get('sek1Lk')})")
                if issues:
                    count_corridor = "out"
                    count_corridor_detail = ", ".join(issues)
                else:
                    count_corridor = "ok"
                    count_corridor_detail = "all stage counts within Hessen corridor"
                    full_corridor_pass_count += 1

        effective_phase = phase
        effective_source_stage = state["sourceStage"]
        effective_priority = state["priority"]
        effective_next_step = state["nextStep"]
        count_gate_status = "n/a" if count_corridor == "n/a" else "pass"
        if state["jurisdiction"] == reference_jurisdiction and count_corridor == "reference":
            count_gate_status = "reference"
        elif cutover_gate_enabled and count_corridor == "out":
            if (
                isinstance(cutover_gate_fallback_phase_id, str)
                and cutover_gate_fallback_phase_id in phase_scale
            ):
                fallback_phase = phase_scale[cutover_gate_fallback_phase_id]
                if fallback_phase["score"] < effective_phase["score"]:
                    effective_phase = fallback_phase
            if isinstance(cutover_gate_fallback_source_stage, str):
                effective_source_stage = cutover_gate_fallback_source_stage
            if len(count_issue_metric_labels) == len(ATOMIC_COUNT_METRICS):
                if isinstance(cutover_gate_full_failure_priority, str):
                    effective_priority = cutover_gate_full_failure_priority
            elif isinstance(cutover_gate_partial_failure_priority, str):
                effective_priority = cutover_gate_partial_failure_priority
            effective_next_step = merge_count_gate_next_step(
                build_count_gate_next_step(
                    state["displayName"],
                    count_issue_metric_labels,
                    str(reference_label),
                    tolerance_percent,
                ),
                state["nextStep"],
            )
            count_gate_status = "blocked"

        rows.append(
            {
                "jurisdiction": state["jurisdiction"],
                "display_name": state["displayName"],
                "tracked_phase_id": phase["id"],
                "tracked_phase_label": phase["label"],
                "tracked_score": phase["score"],
                "score": effective_phase["score"],
                "effective_phase_id": effective_phase["id"],
                "effective_phase_label": effective_phase["label"],
                "effective_source_stage": effective_source_stage,
                "effective_priority": effective_priority,
                "effective_next_step": effective_next_step,
                "applicability": "yes" if state["jurisdiction"] in canonical_states else "no",
                "mapping_count": mapping_count(REPO_ROOT, state.get("mappingFiles", [])),
                "source_stage": state["sourceStage"],
                "priority": state["priority"],
                "notes": state["notes"],
                "next_step": state["nextStep"],
                "atomic_counts": atomic_counts,
                "count_corridor": count_corridor,
                "count_corridor_detail": count_corridor_detail,
                "count_issue_metric_labels": count_issue_metric_labels,
                "count_gate_status": count_gate_status,
            }
        )

    rows.sort(
        key=lambda row: (
            priority_order.get(row["effective_priority"], 99),
            -row["score"],
            -len(row["count_issue_metric_labels"]),
            row["jurisdiction"],
        )
    )

    total_score = sum(row["score"] for row in rows)
    average_score = round(total_score / len(states), 1) if states else 0.0
    tracked_state_count = len(states)
    source_coverage_count = sum(1 for state in states if state["jurisdiction"] in canonical_states)
    snapshots_active_count = sum(1 for row in rows if row["score"] >= phase_scale["P2"]["score"])
    anchors_mapped_count = sum(1 for row in rows if row["score"] >= phase_scale["P3"]["score"])
    first_corridor_count = sum(1 for row in rows if row["score"] >= phase_scale["P4"]["score"])
    broad_coverage_count = sum(1 for row in rows if row["score"] >= phase_scale["P5"]["score"])
    cutover_ready_count = sum(1 for row in rows if row["score"] >= phase_scale["P6"]["score"])
    active_corridor_count = sum(1 for corridor in canonical_corridors if corridor.get("status") == "active")
    counted_rows = [
        row
        for row in rows
        if isinstance(row.get("atomic_counts"), dict)
    ]
    counted_non_reference_rows = [
        row
        for row in counted_rows
        if row["jurisdiction"] != reference_jurisdiction
    ]
    priority_counts: dict[str, int] = {}
    for row in rows:
        priority = row["effective_priority"]
        priority_counts[priority] = priority_counts.get(priority, 0) + 1
    count_gate_blocked_count = sum(1 for row in rows if row["count_gate_status"] == "blocked")

    queue = sorted(
        [row for row in rows if row["effective_priority"] in {"active", "next_wave"}],
        key=lambda row: (priority_order.get(row["effective_priority"], 99), row["display_name"]),
    )

    lines: list[str] = []
    lines.append("# Canonical Gymnasium Physics Bundeslaender Status")
    lines.append("")
    lines.append(f"Snapshot: `{tracker['updatedAt']}`")
    lines.append("")
    lines.append("This file is generated from:")
    lines.append("")
    lines.append(f"- `{TRACKER_PATH.resolve().relative_to(REPO_ROOT)}`")
    lines.append(f"- `{tracker['landscapePath']}`")
    lines.append(f"- `{ATOMIC_COUNT_SCRIPT_PATH.resolve().relative_to(REPO_ROOT)}`")
    lines.append(f"- `{COMPOSITION_VIEW_PHYSICS_DIR.resolve().relative_to(REPO_ROOT)}`")
    lines.append("")
    lines.append("## Headline")
    lines.append("")
    lines.append(f"- Tracked states: `{tracked_state_count}`")
    lines.append(f"- Canonical source coverage present: `{source_coverage_count}/{tracked_state_count}`")
    lines.append(f"- Operational state-weighted rollout score (count-gated): `{average_score}%`")
    lines.append(f"- States with active snapshots (`P2+`): `{snapshots_active_count}/{tracked_state_count}`")
    lines.append(f"- States with structural anchors mapped (`P3+`): `{anchors_mapped_count}/{tracked_state_count}`")
    lines.append(f"- States with reviewed corridor (`P4+`): `{first_corridor_count}/{tracked_state_count}`")
    lines.append(f"- States with broad coverage (`P5+`): `{broad_coverage_count}/{tracked_state_count}`")
    lines.append(f"- States operationally cutover-ready (`P6` after count gate): `{cutover_ready_count}/{tracked_state_count}`")
    lines.append(f"- Active canonical corridors: `{active_corridor_count}/{len(canonical_corridors)}`")
    if reference_counts and corridor_bounds:
        lines.append(f"- Atomic-count reference lane: `{reference_jurisdiction}` {reference_label}")
        lines.append(
            "- Hessen reference counts: "
            + ", ".join(
                f"`{metric_label} {reference_counts[metric_key]}`"
                for metric_key, metric_label in ATOMIC_COUNT_METRICS
            )
        )
        lines.append(
            f"- Hessen corridor (`+-{int(tolerance_percent)}%`): "
            + ", ".join(
                f"`{metric_label} {corridor_bounds[metric_key][0]}-{corridor_bounds[metric_key][1]}`"
                for metric_key, metric_label in ATOMIC_COUNT_METRICS
            )
        )
        lines.append(
            "- Non-reference states within corridor on all three stage counts: "
            f"`{full_corridor_pass_count}/{len(counted_non_reference_rows)}`"
        )
        for metric_key, metric_label in ATOMIC_COUNT_METRICS:
            lines.append(
                f"- {metric_label} within corridor: "
                f"`{stage_corridor_pass_counts[metric_key]}/{len(counted_non_reference_rows)}`"
            )
        if cutover_gate_enabled:
            lines.append(f"- Count-gated states blocked from `cutover_ready`: `{count_gate_blocked_count}`")
    for priority in sorted(priority_counts, key=lambda value: priority_order.get(value, 99)):
        lines.append(f"- Priority `{priority}`: `{priority_counts[priority]}`")
    lines.append("")
    lines.append("## Steering model")
    lines.append("")
    lines.append(f"- Primary work unit: `{steering_model.get('primaryWorkUnit', 'narrow_reviewed_corridor')}`")
    lines.append(f"- Canonical view rule: {steering_model.get('canonicalViewRule', '')}")
    lines.append(f"- State view rule: {steering_model.get('stateViewRule', '')}")
    if cutover_gate_enabled and reference_counts and corridor_bounds:
        lines.append(
            f"- Count gate rule: states outside the {reference_label} `+-{int(tolerance_percent)}%` "
            f"stage-count corridor are operationally capped at `{cutover_gate_fallback_phase_id}` / "
            f"`{cutover_gate_fallback_source_stage}` until the corridor passes."
        )

    execution_sequence = steering_model.get("executionSequence", [])
    if execution_sequence:
        lines.append("- Execution sequence:")
        for step in execution_sequence:
            lines.append(f"  - {step}")

    atom_admission_rule = steering_model.get("atomAdmissionRule", [])
    if atom_admission_rule:
        lines.append("- Canonical atom admission:")
        for step in atom_admission_rule:
            lines.append(f"  - {step}")

    if canonical_corridors:
        lines.append("")
        lines.append("## Canonical corridor register")
        lines.append("")
        lines.append("| Corridor | Status | Focus states | Next step |")
        lines.append("| --- | --- | --- | --- |")
        for corridor in canonical_corridors:
            focus_states = ", ".join(f"`{state}`" for state in corridor.get("focusStates", []))
            lines.append(
                f"| `{corridor['id']}` {corridor['title']} | `{corridor['status']}` | {focus_states} | {corridor['nextStep']} |"
            )

    if reference_counts and corridor_bounds:
        lines.append("")
        lines.append("## Atomic count corridor")
        lines.append("")
        lines.append(
            f"Hessen (`{reference_jurisdiction}`) is the reference lane. "
            f"All other states should stay within `+-{int(tolerance_percent)}%` of the Hessen stage counts."
        )
        lines.append("")
        if cutover_gate_enabled and count_gate_blocked_count == 0:
            lines.append(
                "Current state: all non-reference states are within the corridor on all three stage counts. "
                "The count gate is therefore fully passed nationwide and no state is operationally blocked from "
                "`cutover_ready`; the remaining work is maintenance only."
            )
            lines.append("")
        elif cutover_gate_enabled:
            lines.append(
                f"Operational gate: out-of-corridor states are capped at `{cutover_gate_fallback_phase_id}` / "
                f"`{cutover_gate_fallback_source_stage}`. Full three-stage failures escalate to "
                f"`{cutover_gate_full_failure_priority}`, partial failures to `{cutover_gate_partial_failure_priority}`."
            )
            lines.append("")
        lines.append("| State | Sek I | Sek II (GK) | Sek II (LK) | Corridor | Detail |")
        lines.append("| --- | ---: | ---: | ---: | --- | --- |")
        for row in rows:
            atomic_counts = row.get("atomic_counts")
            if not isinstance(atomic_counts, dict):
                lines.append(
                    f"| `{row['jurisdiction']}` {row['display_name']} | - | - | - | "
                    f"`{row['count_corridor']}` | {row['count_corridor_detail']} |"
                )
                continue
            sek1_label = f"`{atomic_counts['sek1']}`"
            if atomic_counts.get("sek1CourseProfileMismatch") is True:
                sek1_label = f"`{atomic_counts['sek1']}` (`GK {atomic_counts.get('sek1Gk')}` / `LK {atomic_counts.get('sek1Lk')}`)"
            lines.append(
                f"| `{row['jurisdiction']}` {row['display_name']} | "
                f"{sek1_label} | "
                f"`{atomic_counts['sek2Gk']}` | "
                f"`{atomic_counts['sek2Lk']}` | "
                f"`{row['count_corridor']}` | "
                f"{row['count_corridor_detail']} |"
            )

    lines.append("")
    lines.append("## Program phases")
    lines.append("")
    lines.append("| Program phase | Status |")
    lines.append("| --- | --- |")
    for phase in tracker.get("programPhases", []):
        lines.append(f"| `{phase['id']}` {phase['title']} | `{phase['status']}` |")

    lines.append("")
    lines.append("## State phase scale")
    lines.append("")
    lines.append("| Phase | Score | Meaning |")
    lines.append("| --- | ---: | --- |")
    for phase in tracker["phaseScale"]:
        lines.append(f"| `{phase['id']}` {phase['label']} | `{phase['score']}%` | {phase['description']} |")

    lines.append("")
    lines.append("## State view")
    lines.append("")
    lines.append("| State | Operational phase | Tracked phase | Score | Applicability | Mappings | Count corridor | Source stage | Priority |")
    lines.append("| --- | --- | --- | ---: | --- | ---: | --- | --- | --- |")
    for row in rows:
        lines.append(
            f"| `{row['jurisdiction']}` {row['display_name']} | "
            f"`{row['effective_phase_id']}` {row['effective_phase_label']} | "
            f"`{row['tracked_phase_id']}` {row['tracked_phase_label']} | "
            f"`{row['score']}%` | "
            f"`{row['applicability']}` | "
            f"`{row['mapping_count']}` | "
            f"`{row['count_corridor']}` | "
            f"`{row['effective_source_stage']}` | "
            f"`{row['effective_priority']}` |"
        )

    lines.append("")
    lines.append("## Immediate queue")
    lines.append("")
    if not queue:
        lines.append("- none (`F6` complete; maintenance-only deltas remain)")
    else:
        for row in queue:
            lines.append(
                f"- `{row['jurisdiction']}` (`{row['effective_phase_id']}`, `{row['effective_priority']}`): {row['effective_next_step']}"
            )

    lines.append("")
    lines.append("## Next steps")
    lines.append("")
    for row in rows:
        lines.append(f"- `{row['jurisdiction']}`: {row['effective_next_step']}")

    lines.append("")
    lines.append("## Regeneration")
    lines.append("")
    lines.append("```bash")
    lines.append(tracker["renderCommand"])
    lines.append("```")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    tracker = load_json(TRACKER_PATH)
    output_path = REPO_ROOT / tracker["quickViewPath"]
    output_path.write_text(render(), encoding="utf-8")


if __name__ == "__main__":
    main()
