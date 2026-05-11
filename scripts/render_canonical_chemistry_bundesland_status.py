#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
TRACKER_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json"
QUALITY_STATUS_PATH = REPO_ROOT / "docs/qa-ci/status/curriculum-quality-status.json"
SOURCE_EXTRACTION_ROOT = REPO_ROOT / "curricula/DE/Gymnasium/input"
CHEMISTRY_FRAMEWORK_ID = "canonical-gymnasium-chemistry"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def mapping_count(mapping_files: list[str]) -> int:
    total = 0
    for rel_path in mapping_files:
        path = REPO_ROOT / rel_path
        if not path.exists():
            continue
        data = load_json(path)
        mappings = data.get("mappings")
        if isinstance(mappings, list):
            total += len(mappings)
    return total


def chemistry_quality_status() -> dict:
    data = load_json(QUALITY_STATUS_PATH)
    for curriculum in data.get("curricula", []):
        if curriculum.get("frameworkId") == CHEMISTRY_FRAMEWORK_ID:
            return curriculum
    raise RuntimeError(f"Missing {CHEMISTRY_FRAMEWORK_ID} in {QUALITY_STATUS_PATH.relative_to(REPO_ROOT)}")


def quality_by_jurisdiction(quality: dict) -> dict[str, dict]:
    coverage = quality.get("jurisdictionCoverage", {})
    jurisdictions = coverage.get("jurisdictions", [])
    return {
        entry["jurisdiction"]: entry
        for entry in jurisdictions
        if isinstance(entry, dict) and isinstance(entry.get("jurisdiction"), str)
    }


def chemistry_source_extractions_by_jurisdiction() -> dict[str, dict]:
    result: dict[str, dict] = {}
    for path in SOURCE_EXTRACTION_ROOT.rglob("*.source-extraction.json"):
        data = load_json(path)
        if data.get("subject") != "Chemie":
            continue
        jurisdiction = data.get("jurisdiction")
        if not isinstance(jurisdiction, str):
            continue
        source_goals = data.get("sourceGoals")
        source_goal_count = len(source_goals) if isinstance(source_goals, list) else 0
        entry = result.setdefault(jurisdiction, {"files": 0, "sourceGoals": 0, "paths": []})
        entry["files"] += 1
        entry["sourceGoals"] += source_goal_count
        entry["paths"].append(str(path.relative_to(REPO_ROOT)))
    return result


def source_status(entry: dict | None, extracted_source_goals: int = 0) -> str:
    if not entry:
        if extracted_source_goals > 0:
            return "extracted_pending_mapping"
        return "missing"
    source_atomic = int(entry.get("sourceAtomicGoals") or 0)
    source_mapped = int(entry.get("sourceMappedToViewAtomicGoals") or 0)
    unsupported = int(entry.get("unsupportedAssignedAtomicGoals") or 0)
    partial = int(entry.get("partialSourceLinkedAtomicGoals") or 0)
    if source_atomic == 0:
        if extracted_source_goals > 0:
            return "extracted_pending_mapping"
        return "missing"
    if source_mapped == source_atomic and unsupported == 0 and partial == 0:
        return "clean"
    return "needs_review"


def render() -> str:
    tracker = load_json(TRACKER_PATH)
    quality = chemistry_quality_status()
    coverage = quality.get("jurisdictionCoverage", {})
    quality_index = quality_by_jurisdiction(quality)
    extraction_index = chemistry_source_extractions_by_jurisdiction()
    phase_scale = {entry["id"]: entry for entry in tracker["phaseScale"]}
    states = tracker["states"]
    canonical_corridors = tracker.get("canonicalCorridors", [])
    steering_model = tracker.get("steeringModel", {})
    priority_order = {"active": 0, "next_wave": 1, "backlog": 2}

    rows = []
    for state in states:
        jurisdiction = state["jurisdiction"]
        phase = phase_scale[state["phase"]]
        quality_entry = quality_index.get(jurisdiction)
        extraction_entry = extraction_index.get(jurisdiction, {})
        extracted_source_goals = int(extraction_entry.get("sourceGoals") or 0)
        rows.append(
            {
                "jurisdiction": jurisdiction,
                "displayName": state["displayName"],
                "phaseId": state["phase"],
                "phaseLabel": phase["label"],
                "score": phase["score"],
                "visibleAtomicGoals": int((quality_entry or {}).get("visibleAtomicGoals") or 0),
                "sourceAtomicGoals": int((quality_entry or {}).get("sourceAtomicGoals") or 0),
                "sourceMappedToViewAtomicGoals": int(
                    (quality_entry or {}).get("sourceMappedToViewAtomicGoals") or 0
                ),
                "unsupportedAssignedAtomicGoals": int(
                    (quality_entry or {}).get("unsupportedAssignedAtomicGoals") or 0
                ),
                "extractedSourceGoals": extracted_source_goals,
                "sourceExtractionFiles": int(extraction_entry.get("files") or 0),
                "sourceStatus": source_status(quality_entry, extracted_source_goals),
                "mappings": mapping_count(state.get("mappingFiles", [])),
                "sourceStage": state["sourceStage"],
                "priority": state["priority"],
                "notes": state["notes"],
                "nextStep": state["nextStep"],
            }
        )

    queue = sorted(
        [row for row in rows if row["priority"] in {"active", "next_wave"}],
        key=lambda row: (
            priority_order.get(row["priority"], 99),
            row["score"],
            row["displayName"],
        ),
    )

    phase_score = {entry["id"]: entry["score"] for entry in tracker["phaseScale"]}
    active_corridor_count = sum(1 for corridor in canonical_corridors if corridor.get("status") == "active")
    extracted_goal_total = sum(int(entry.get("sourceGoals") or 0) for entry in extraction_index.values())
    extraction_file_total = sum(int(entry.get("files") or 0) for entry in extraction_index.values())
    priority_counts: dict[str, int] = {}
    for row in rows:
        priority = row["priority"]
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

    lines: list[str] = []
    lines.append("# Canonical Gymnasium Chemistry Bundeslaender Status")
    lines.append("")
    lines.append(f"Snapshot: `{tracker['updatedAt']}`")
    lines.append("")
    lines.append("This file is generated from:")
    lines.append("")
    lines.append(f"- `{TRACKER_PATH.relative_to(REPO_ROOT)}`")
    lines.append(f"- `{tracker['landscapePath']}`")
    lines.append(f"- `{QUALITY_STATUS_PATH.relative_to(REPO_ROOT)}`")
    lines.append(f"- Chemistry `*.source-extraction.json` files under `{SOURCE_EXTRACTION_ROOT.relative_to(REPO_ROOT)}`")
    lines.append(f"- `{Path(__file__).relative_to(REPO_ROOT)}`")
    lines.append("")
    lines.append("## Headline")
    lines.append("")
    lines.append(f"- Tracked states: `{len(states)}`")
    lines.append(
        "- Source inventories readable and registered: "
        f"`{coverage.get('sourceCompleteJurisdictions', 0)}/{coverage.get('totalJurisdictions', len(states))}`"
    )
    lines.append(
        "- Source-backed projections clean: "
        f"`{coverage.get('cleanJurisdictions', 0)}/{coverage.get('totalJurisdictions', len(states))}`"
    )
    lines.append(f"- Source atomic goals: `{coverage.get('sourceAtomicGoals', 0)}`")
    lines.append(f"- Source atomic goals mapped into views: `{coverage.get('sourceMappedToViewAtomicGoals', 0)}`")
    lines.append(f"- Extracted Chemistry source goals in local source-extraction files: `{extracted_goal_total}`")
    lines.append(f"- Local Chemistry source-extraction files: `{extraction_file_total}`")
    lines.append(f"- Unsupported assigned atomic goals: `{coverage.get('unsupportedAssignedAtomicGoals', 0)}`")
    lines.append(
        f"- States with source extraction active (`P2+`): "
        f"`{sum(1 for row in rows if row['score'] >= phase_score['P2'])}/{len(states)}`"
    )
    lines.append(
        f"- States with clean source-backed projection (`P4+`): "
        f"`{sum(1 for row in rows if row['score'] >= phase_score['P4'])}/{len(states)}`"
    )
    lines.append(
        f"- States with broad coverage (`P5+`): "
        f"`{sum(1 for row in rows if row['score'] >= phase_score['P5'])}/{len(states)}`"
    )
    lines.append(
        f"- States operationally cutover-ready (`P6`): "
        f"`{sum(1 for row in rows if row['score'] >= phase_score['P6'])}/{len(states)}`"
    )
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
            focus_states = ", ".join(
                f"`{state}`"
                for state in corridor.get("focusStates", [])
                if isinstance(state, str)
            )
            lines.append(
                f"| `{corridor['id']}` {corridor['title']} | "
                f"`{corridor['status']}` | "
                f"{focus_states or '-'} | "
                f"{corridor['nextStep']} |"
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
    lines.append(
        "| State | Operational phase | Score | Visible atoms | Source atoms | Extracted source goals | "
        "Extraction files | Source mapped | Unsupported | Mappings | Source status | Source stage | Priority |"
    )
    lines.append("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |")
    for row in rows:
        lines.append(
            f"| `{row['jurisdiction']}` {row['displayName']} | "
            f"`{row['phaseId']}` {row['phaseLabel']} | "
            f"`{row['score']}%` | "
            f"`{row['visibleAtomicGoals']}` | "
            f"`{row['sourceAtomicGoals']}` | "
            f"`{row['extractedSourceGoals']}` | "
            f"`{row['sourceExtractionFiles']}` | "
            f"`{row['sourceMappedToViewAtomicGoals']}` | "
            f"`{row['unsupportedAssignedAtomicGoals']}` | "
            f"`{row['mappings']}` | "
            f"`{row['sourceStatus']}` | "
            f"`{row['sourceStage']}` | "
            f"`{row['priority']}` |"
        )
    lines.append("")

    lines.append("## Immediate queue")
    lines.append("")
    if not queue:
        lines.append("- none")
    else:
        for row in queue:
            lines.append(
                f"- `{row['jurisdiction']}` (`{row['phaseId']}`, `{row['priority']}`): {row['notes']}"
            )
    lines.append("")

    lines.append("## Next steps")
    lines.append("")
    for row in rows:
        lines.append(f"- `{row['jurisdiction']}`: {row['nextStep']}")
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
