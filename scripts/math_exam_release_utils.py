#!/usr/bin/env python3
"""Shared release-anchor resolution for the Hessen 2026 math exam pipeline."""

from __future__ import annotations


def format_release_ref(release_ref: dict) -> str:
    return (
        f"examYear={release_ref.get('examYear')}, "
        f"kind={release_ref.get('kind')}, "
        f"courseLevel={release_ref.get('courseLevel')}"
    )


def release_key(release_ref: dict) -> tuple[int | None, str | None, str | None]:
    return (
        release_ref.get("examYear"),
        release_ref.get("kind"),
        release_ref.get("courseLevel"),
    )


def resolve_release_collection_specs(goals: list[dict], collections: list[dict]) -> tuple[list[dict], list[str]]:
    errors: list[str] = []
    expected_by_key: dict[tuple[int | None, str | None, str | None], dict] = {}
    expected_exam_years: set[int] = set()

    for collection in collections:
        release_ref = collection.get("releaseRef")
        if not isinstance(release_ref, dict):
            continue

        key = release_key(release_ref)
        if key in expected_by_key:
            errors.append(
                f"Collection {collection['id']} duplicates releaseRef {format_release_ref(release_ref)} "
                f"already used by {expected_by_key[key]['id']}."
            )
            continue

        if collection.get("kind") != release_ref.get("kind"):
            errors.append(
                f"Collection {collection['id']} kind {collection.get('kind')} does not match "
                f"releaseRef {format_release_ref(release_ref)}."
            )
        if collection.get("courseLevel") != release_ref.get("courseLevel"):
            errors.append(
                f"Collection {collection['id']} courseLevel {collection.get('courseLevel')} does not match "
                f"releaseRef {format_release_ref(release_ref)}."
            )

        expected_by_key[key] = collection
        if isinstance(release_ref.get("examYear"), int):
            expected_exam_years.add(release_ref["examYear"])

    resolved_goals_by_key: dict[tuple[int | None, str | None, str | None], dict] = {}
    for goal in goals:
        release = goal.get("release")
        if not isinstance(release, dict) or release.get("status") != "released":
            continue

        key = release_key(release)
        if key not in expected_by_key:
            if release.get("examYear") in expected_exam_years:
                errors.append(
                    f"Unexpected released goal {goal['id']} ({goal.get('shortKey') or goal['title']}) "
                    f"with {format_release_ref(release)}."
                )
            continue

        if key in resolved_goals_by_key:
            other = resolved_goals_by_key[key]
            errors.append(
                f"Duplicate released goal anchors for {format_release_ref(release)}: "
                f"{other['id']} and {goal['id']}."
            )
            continue

        resolved_goals_by_key[key] = goal

    resolved_specs: list[dict] = []
    for collection in collections:
        release_ref = collection.get("releaseRef")
        if not isinstance(release_ref, dict):
            resolved_specs.append({**collection})
            continue

        key = release_key(release_ref)
        goal = resolved_goals_by_key.get(key)
        if goal is None:
            errors.append(
                f"Collection {collection['id']} expects a released curriculum anchor for "
                f"{format_release_ref(release_ref)} but none was found."
            )
            continue

        resolved_specs.append(
            {
                **collection,
                "resolvedLandscapeGoalId": goal["id"],
                "resolvedLandscapeShortKey": goal.get("shortKey"),
            }
        )

    return resolved_specs, errors


def require_release_collection_specs(goals: list[dict], collections: list[dict]) -> list[dict]:
    resolved_specs, errors = resolve_release_collection_specs(goals, collections)
    if errors:
        raise ValueError("\n".join(errors))
    return resolved_specs


def collection_accepts_course_level(collection_course_level: str, task_course_level: str) -> bool:
    if task_course_level == "BOTH":
        return collection_course_level in {"GK", "LK"}
    return collection_course_level == task_course_level


def task_belongs_to_collection(
    collection: dict,
    task_course_level: str,
    production_track: str,
    ancestors: set[str],
) -> bool:
    if not collection_accepts_course_level(collection["courseLevel"], task_course_level):
        return False

    if collection["kind"] == "offer":
        landscape_goal_id = collection.get("resolvedLandscapeGoalId")
        return bool(landscape_goal_id and landscape_goal_id in ancestors)

    if collection["kind"] == "master":
        return production_track in {"abi_offer", "phase_practice", "process_practice"}

    return False
