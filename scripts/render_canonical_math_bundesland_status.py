#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
TRACKER_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json"
SOURCE_LANDSCAPE_REGISTRY_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/source-landscape-registry.json"
CANONICAL_GOAL_PROVENANCE_REGISTRY_PATH = (
    REPO_ROOT / "curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json"
)
CANONICAL_GOAL_APPLICABILITY_OVERRIDE_REGISTRY_PATH = (
    REPO_ROOT / "curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json"
)


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
        goal_applicability_overrides = entry.get("goalApplicabilityOverrides")
        if isinstance(goal_applicability_overrides, dict):
            return goal_applicability_overrides
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


def render() -> str:
    tracker = load_json(TRACKER_PATH)
    phase_scale = {entry["id"]: entry for entry in tracker["phaseScale"]}
    states = tracker["states"]
    canonical_corridors = tracker.get("canonicalCorridors", [])
    steering_model = tracker.get("steeringModel", {})
    canonical_states = canonical_jurisdictions(REPO_ROOT, tracker["landscapePath"])
    priority_order = {"active": 0, "next_wave": 1, "backlog": 2}

    total_score = 0
    rows = []
    for state in sorted(
        states,
        key=lambda state: (
            priority_order.get(state["priority"], 99),
            -phase_scale[state["phase"]]["score"],
            state["jurisdiction"],
        ),
    ):
        phase = phase_scale[state["phase"]]
        score = phase["score"]
        total_score += score
        rows.append(
            {
                "jurisdiction": state["jurisdiction"],
                "display_name": state["displayName"],
                "phase_id": phase["id"],
                "phase_label": phase["label"],
                "score": score,
                "applicability": "yes" if state["jurisdiction"] in canonical_states else "no",
                "mapping_count": mapping_count(REPO_ROOT, state.get("mappingFiles", [])),
                "source_stage": state["sourceStage"],
                "priority": state["priority"],
                "next_step": state["nextStep"],
            }
        )

    average_score = round(total_score / len(states), 1) if states else 0.0
    coverage_count = sum(1 for state in states if state["jurisdiction"] in canonical_states)
    p2_score = phase_scale["P2"]["score"]
    p4_score = phase_scale["P4"]["score"]
    p5_score = phase_scale["P5"]["score"]
    snapshot_active_count = sum(
        1 for state in states if phase_scale[state["phase"]]["score"] >= p2_score
    )
    anchor_mapped_count = sum(
        1 for state in states if phase_scale[state["phase"]]["score"] >= phase_scale["P3"]["score"]
    )
    corridor_ready_count = sum(
        1 for state in states if phase_scale[state["phase"]]["score"] >= p4_score
    )
    broad_coverage_count = sum(
        1 for state in states if phase_scale[state["phase"]]["score"] >= p5_score
    )
    active_corridor_count = sum(
        1 for corridor in canonical_corridors if corridor.get("status") == "active"
    )
    priority_counts: dict[str, int] = {}
    for state in states:
        priority_counts[state["priority"]] = priority_counts.get(state["priority"], 0) + 1

    lines: list[str] = []
    lines.append("# Canonical Gymnasium Mathematics Bundeslaender Status")
    lines.append("")
    lines.append(f"Snapshot: `{tracker['updatedAt']}`")
    lines.append("")
    lines.append("This file is generated from:")
    lines.append("")
    lines.append(f"- `{TRACKER_PATH.relative_to(REPO_ROOT)}`")
    lines.append(f"- `{tracker['landscapePath']}`")
    lines.append("")
    lines.append("## Headline")
    lines.append("")
    lines.append(f"- Tracked states: `{len(states)}`")
    lines.append(f"- Canonical source coverage present: `{coverage_count}/{len(states)}`")
    lines.append(f"- State-weighted rollout score: `{average_score}%`")
    lines.append(f"- States with active snapshots (`P2+`): `{snapshot_active_count}/{len(states)}`")
    lines.append(f"- States with structural anchors mapped (`P3+`): `{anchor_mapped_count}/{len(states)}`")
    lines.append(f"- States with reviewed corridor (`P4+`): `{corridor_ready_count}/{len(states)}`")
    lines.append(f"- States with broad coverage (`P5+`): `{broad_coverage_count}/{len(states)}`")
    if canonical_corridors:
        lines.append(f"- Active canonical corridors: `{active_corridor_count}/{len(canonical_corridors)}`")
    for priority in sorted(priority_counts, key=lambda value: priority_order.get(value, 99)):
        lines.append(f"- Priority `{priority}`: `{priority_counts[priority]}`")
    lines.append("")
    if steering_model:
        lines.append("## Steering model")
        lines.append("")
        primary_work_unit = steering_model.get("primaryWorkUnit")
        if isinstance(primary_work_unit, str):
            lines.append(f"- Primary work unit: `{primary_work_unit}`")
        canonical_view_rule = steering_model.get("canonicalViewRule")
        if isinstance(canonical_view_rule, str):
            lines.append(f"- Canonical view rule: {canonical_view_rule}")
        state_view_rule = steering_model.get("stateViewRule")
        if isinstance(state_view_rule, str):
            lines.append(f"- State view rule: {state_view_rule}")
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
        lines.append("")
    if canonical_corridors:
        lines.append("## Canonical corridor register")
        lines.append("")
        lines.append("| Corridor | Status | Focus states | Next step |")
        lines.append("| --- | --- | --- | --- |")
        for corridor in canonical_corridors:
            focus_states = corridor.get("focusStates", [])
            focus_label = ", ".join(f"`{state}`" for state in focus_states if isinstance(state, str))
            lines.append(
                f"| `{corridor['id']}` {corridor['title']} | "
                f"`{corridor['status']}` | "
                f"{focus_label or '-'} | "
                f"{corridor['nextStep']} |"
            )
        lines.append("")
    lines.append("## Program phases")
    lines.append("")
    lines.append("| Program phase | Status |")
    lines.append("| --- | --- |")
    for phase in tracker["programPhases"]:
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
    lines.append("| State | Phase | Score | Applicability | Mappings | Source stage | Priority |")
    lines.append("| --- | --- | ---: | --- | ---: | --- | --- |")
    for row in rows:
        lines.append(
            f"| `{row['jurisdiction']}` {row['display_name']} | "
            f"`{row['phase_id']}` {row['phase_label']} | "
            f"`{row['score']}%` | "
            f"`{row['applicability']}` | "
            f"`{row['mapping_count']}` | "
            f"`{row['source_stage']}` | "
            f"`{row['priority']}` |"
        )
    lines.append("")
    lines.append("## Immediate queue")
    lines.append("")
    immediate_queue_rows = [row for row in rows if row["priority"] != "backlog"]
    if not immediate_queue_rows:
        lines.append("- none (`F6` complete; maintenance-only deltas remain)")
    for row in immediate_queue_rows:
        lines.append(
            f"- `{row['jurisdiction']}` (`{row['phase_id']}`, `{row['priority']}`): {row['next_step']}"
        )
    lines.append("")
    lines.append("## Next steps")
    lines.append("")
    for row in rows:
        lines.append(f"- `{row['jurisdiction']}`: {row['next_step']}")
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
