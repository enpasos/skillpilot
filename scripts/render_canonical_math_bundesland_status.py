#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
TRACKER_PATH = REPO_ROOT / "curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json"


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


def canonical_jurisdictions(repo_root: Path, landscape_rel_path: str) -> set[str]:
    data = load_json(repo_root / landscape_rel_path)
    jurisdictions: set[str] = set()
    for goal in data.get("goals", []):
        applicability = goal.get("applicability", {})
        for jurisdiction in applicability.get("jurisdiction", []):
            jurisdictions.add(jurisdiction)
    return jurisdictions


def render() -> str:
    tracker = load_json(TRACKER_PATH)
    phase_scale = {entry["id"]: entry for entry in tracker["phaseScale"]}
    states = tracker["states"]
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
    applicability_count = sum(1 for state in states if state["jurisdiction"] in canonical_states)
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
    lines.append(f"- Canonical applicability present: `{applicability_count}/{len(states)}`")
    lines.append(f"- State-weighted rollout score: `{average_score}%`")
    lines.append(f"- States with active snapshots (`P2+`): `{snapshot_active_count}/{len(states)}`")
    lines.append(f"- States with structural anchors mapped (`P3+`): `{anchor_mapped_count}/{len(states)}`")
    lines.append(f"- States with reviewed corridor (`P4+`): `{corridor_ready_count}/{len(states)}`")
    lines.append(f"- States with broad coverage (`P5+`): `{broad_coverage_count}/{len(states)}`")
    for priority in sorted(priority_counts, key=lambda value: priority_order.get(value, 99)):
        lines.append(f"- Priority `{priority}`: `{priority_counts[priority]}`")
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
    for row in rows:
        if row["priority"] == "backlog":
            continue
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
