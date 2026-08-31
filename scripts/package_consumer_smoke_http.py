#!/usr/bin/env python3
"""HTTP assertions executed inside the package consumer's isolated network namespace."""

from __future__ import annotations

import hashlib
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Callable


BASE_URL = "http://127.0.0.1:18080"
OUTPUT_ROOT = Path("/opt/runtime-output")
EXPECTED_PATH = Path("/opt/skillpilot-runtime/expected.json")
CHECK_ORDER = (
    "app-shell.served",
    "catalog.package-discovery",
    "catalog.root-landscape-resolved",
    "landscape.transitive-runtime-closure",
    "offering.default-resolved",
    "composition-view.resolved",
    "learning.frontier-computed",
    "cards.deck-loaded",
    "cards.verified-recall-loaded",
    "resources.goal-visualization-bytes",
    # migration.aliases-loaded is completed from the filesystem trace.
    "source-evidence.goal-lookup",
    "fallback.legacy-route-rejected",
    "fallback.repository-data-unavailable",
    "fallback.raw-data-route-rejected",
)


class CheckFailure(RuntimeError):
    pass


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()


def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise CheckFailure(message)


def request(
    path: str,
    *,
    method: str = "GET",
    json_body: Any | None = None,
) -> tuple[int, dict[str, str], bytes]:
    body = None if json_body is None else canonical_json(json_body)
    headers = {"Accept": "application/json"}
    if body is not None:
        headers["Content-Type"] = "application/json"
    target = path if path.startswith("http://") else BASE_URL + path
    req = urllib.request.Request(target, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.status, dict(response.headers.items()), response.read()
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers.items()), error.read()


def json_response(path: str, *, method: str = "GET", json_body: Any | None = None) -> tuple[int, Any, bytes]:
    status, _headers, body = request(path, method=method, json_body=json_body)
    try:
        value = json.loads(body)
    except json.JSONDecodeError as error:
        raise CheckFailure(f"{path} did not return JSON: {error}") from error
    return status, value, body


def wait_until_ready() -> None:
    deadline = time.monotonic() + 180
    last_status: int | None = None
    while time.monotonic() < deadline:
        try:
            status, _headers, body = request("/api/health")
            last_status = status
            if status == 200 and json.loads(body).get("status") == "ok":
                return
        except (OSError, ValueError):
            pass
        time.sleep(0.25)
    raise CheckFailure(f"SkillPilot package consumer did not become ready (last status: {last_status})")


def find_skillpilot_id(value: Any) -> str | None:
    if isinstance(value, dict):
        candidate = value.get("skillpilotId")
        if isinstance(candidate, str) and candidate:
            return candidate
        for child in value.values():
            found = find_skillpilot_id(child)
            if found:
                return found
    elif isinstance(value, list):
        for child in value:
            found = find_skillpilot_id(child)
            if found:
                return found
    return None


def goal_ids(landscapes: list[dict[str, Any]]) -> set[str]:
    return {
        goal["id"]
        for landscape in landscapes
        for goal in landscape.get("goals", [])
        if isinstance(goal, dict) and isinstance(goal.get("id"), str)
    }


def select_verified_recall_fixture_pair(
    goals: list[dict[str, Any]],
    catalog_deck_ids: set[str],
) -> tuple[dict[str, Any], dict[str, Any]]:
    goals_by_id = {
        goal["id"]: goal
        for goal in goals
        if isinstance(goal, dict) and isinstance(goal.get("id"), str) and goal["id"]
    }
    for memory_goal in goals:
        if not isinstance(memory_goal, dict):
            continue
        requires = memory_goal.get("requires")
        deck_tags = [
            tag.removeprefix("srs-deck:")
            for tag in memory_goal.get("tags") or []
            if isinstance(tag, str) and tag.startswith("srs-deck:")
        ]
        if (
            memory_goal.get("type") != "atomic"
            or memory_goal.get("nodeKind") != "memory"
            or not isinstance(requires, list)
            or len(requires) != 1
            or not isinstance(requires[0], str)
            or len(deck_tags) != 1
            or deck_tags[0] not in catalog_deck_ids
        ):
            continue
        orientation_goal = goals_by_id.get(requires[0])
        if (
            orientation_goal is None
            or orientation_goal.get("type") != "atomic"
            or orientation_goal.get("semanticKind") != "orientation"
            or orientation_goal.get("requires") not in (None, [])
        ):
            continue
        return orientation_goal, memory_goal
    raise CheckFailure(
        "package has no visible atomic memory goal with exactly one visible, prerequisite-free atomic orientation requirement"
    )


def response_frontier_ids(value: Any) -> list[str]:
    goals = value.get("goals") if isinstance(value, dict) else None
    require(isinstance(goals, list), "frontier response has no goals array")
    require(all(isinstance(goal_id, str) and goal_id for goal_id in goals), "frontier contains an invalid goal ID")
    return goals


def object_goal_ids(value: Any, field: str, label: str) -> list[str]:
    entries = value.get(field) if isinstance(value, dict) else None
    require(isinstance(entries, list), f"{label} has no {field} array")
    ids = [entry.get("id") for entry in entries if isinstance(entry, dict)]
    require(len(ids) == len(entries), f"{label} {field} contains a non-object goal")
    require(all(isinstance(goal_id, str) and goal_id for goal_id in ids), f"{label} {field} has an invalid goal ID")
    return ids


def require_fixture_frontier_state(value: Any, expected_goal_id: str, label: str) -> None:
    require(isinstance(value, dict), f"{label} is not an object")
    require(value.get("activeGoal") is None, f"{label} unexpectedly has an active goal")
    require(object_goal_ids(value, "frontier", label) == [expected_goal_id], f"{label} frontier differs")
    state_machine = value.get("stateMachine")
    require(isinstance(state_machine, dict), f"{label} has no stateMachine object")
    require(state_machine.get("requiredAction") == "setActiveGoal", f"{label} requiredAction differs")
    require(
        object_goal_ids(state_machine, "goalOptions", f"{label} stateMachine") == [expected_goal_id],
        f"{label} goalOptions differ",
    )


def activate_fixture_goal(
    learner_id: str,
    goal_id: str,
    *,
    expected_required_action: str,
) -> dict[str, Any]:
    status, state, body = json_response(
        f"/api/ui/learners/{urllib.parse.quote(learner_id, safe='')}/active-goal",
        method="POST",
        json_body={"goalId": goal_id, "redirect": False},
    )
    require(status == 200, f"fixture active-goal status is {status}: {body[:500]!r}")
    active_goal = state.get("activeGoal") if isinstance(state, dict) else None
    require(isinstance(active_goal, dict), "active-goal response has no activeGoal object")
    require(active_goal.get("id") == goal_id, "active-goal response selected a different goal")
    state_machine = state.get("stateMachine") if isinstance(state, dict) else None
    require(isinstance(state_machine, dict), "active-goal response has no stateMachine object")
    require(
        state_machine.get("requiredAction") == expected_required_action,
        "active-goal response has an unexpected required action",
    )
    if expected_required_action == "chooseMemoryMode":
        mode_options = state_machine.get("modeOptions")
        require(isinstance(mode_options, list), "memory active-goal response has no modeOptions")
        verify_options = [
            option
            for option in mode_options
            if isinstance(option, dict) and option.get("id") == "verify"
        ]
        require(len(verify_options) == 1, "memory active-goal response has no unique verify option")
        require(
            verify_options[0].get("action") == "startVerifiedRecall"
            and verify_options[0].get("target") == "gpt"
            and verify_options[0].get("goalId") == goal_id,
            "memory verify option is not bound to startVerifiedRecall for the active goal",
        )
    return {
        "activeGoalSelectionStatus": status,
        "activeGoalSelectionResponseSha256": sha256(body),
    }


def contains_answer_material_field(value: Any) -> bool:
    forbidden = {"answer", "back", "solution", "expectedanswer"}
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = "".join(character for character in str(key).lower() if character.isalnum())
            if normalized in forbidden or contains_answer_material_field(child):
                return True
    elif isinstance(value, list):
        return any(contains_answer_material_field(child) for child in value)
    return False


def validate_verified_recall_prompt_response(response: Any, memory_goal_id: str) -> list[dict[str, Any]]:
    require(isinstance(response, dict), "verified recall response is not an object")
    require(response.get("goalId") == memory_goal_id, "verified recall goal differs")
    require(response.get("status") == "ready", f"verified recall is not ready: {response.get('status')}")
    cards = response.get("cards")
    require(isinstance(cards, list) and cards, "verified recall returned no prompt card")
    require(response.get("batchSize") == len(cards), "verified recall batchSize differs from prompt-card count")
    card_ids = [card.get("cardId") for card in cards if isinstance(card, dict)]
    require(len(card_ids) == len(cards), "verified recall returned a non-object prompt card")
    require(all(isinstance(card_id, str) and card_id for card_id in card_ids), "verified recall returned an invalid card ID")
    require(len(set(card_ids)) == len(card_ids), "verified recall returned duplicate card IDs")
    require(
        all(isinstance(card.get("prompt"), str) and card["prompt"].strip() for card in cards),
        "verified recall returned an empty prompt",
    )
    allowed_prompt_fields = {"cardId", "prompt", "category"}
    require(
        all(set(card).issubset(allowed_prompt_fields) for card in cards),
        "verified recall prompt card leaked fields outside the prompt contract",
    )
    require(not contains_answer_material_field(response), "verified recall response leaked answer material")
    return cards


def prepare_verified_recall_fixture(
    learner_id: str,
    goals: list[dict[str, Any]],
    catalog_deck_ids: set[str],
) -> tuple[dict[str, Any], dict[str, Any]]:
    orientation_goal, memory_goal = select_verified_recall_fixture_pair(goals, catalog_deck_ids)
    orientation_id = orientation_goal["id"]
    memory_id = memory_goal["id"]
    encoded_learner_id = urllib.parse.quote(learner_id, safe="")

    preferences_status, _preferences_headers, preferences_body = request(
        f"/api/ui/learners/{encoded_learner_id}/preferences",
        method="PUT",
        json_body={"autoPilot": False},
    )
    require(preferences_status == 200, f"fixture AutoPilot update status is {preferences_status}")
    learner_status, learner, learner_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}"
    )
    require(learner_status == 200, f"fixture learner status is {learner_status}")
    require(isinstance(learner, dict) and learner.get("autoPilot") is False, "fixture AutoPilot is not false")

    scope_ids = [orientation_id, memory_id]
    scope_status, scope_state, scope_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/scope",
        method="POST",
        json_body={"goalIds": scope_ids},
    )
    require(scope_status == 200, f"fixture multi-root scope status is {scope_status}: {scope_body[:500]!r}")
    require_fixture_frontier_state(scope_state, orientation_id, "fixture scope state")

    frontier_status, frontier, frontier_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/frontier"
    )
    require(frontier_status == 200, f"fixture initial frontier status is {frontier_status}")
    initial_frontier_ids = response_frontier_ids(frontier)
    require(
        initial_frontier_ids == [orientation_id],
        "fixture initial frontier is not exactly the orientation requirement",
    )

    before_block_status, before_block_state, before_block_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/state"
    )
    require(before_block_status == 200, f"fixture precondition state status is {before_block_status}")
    require_fixture_frontier_state(before_block_state, orientation_id, "fixture precondition state")

    blocked_status, _blocked_state, blocked_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/active-goal",
        method="POST",
        json_body={"goalId": memory_id, "redirect": False},
    )
    require(blocked_status == 409, f"memory activation before orientation completion returned {blocked_status}")
    after_block_status, after_block_state, after_block_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/state"
    )
    require(after_block_status == 200, f"fixture post-rejection state status is {after_block_status}")
    require_fixture_frontier_state(after_block_state, orientation_id, "fixture post-rejection state")
    require(after_block_body == before_block_body, "rejected memory activation changed learner state")

    orientation_activation = activate_fixture_goal(
        learner_id,
        orientation_id,
        expected_required_action="orientActiveGoal",
    )
    before_half_status, before_half_state, before_half_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/state"
    )
    require(before_half_status == 200, f"fixture pre-marker state status is {before_half_status}")
    require(
        isinstance(before_half_state, dict)
        and isinstance(before_half_state.get("activeGoal"), dict)
        and before_half_state["activeGoal"].get("id") == orientation_id
        and isinstance(before_half_state.get("stateMachine"), dict)
        and before_half_state["stateMachine"].get("requiredAction") == "orientActiveGoal",
        "fixture pre-marker state is not the active orientation state",
    )
    half_status, _half_response, half_body = json_response(
        f"/api/ai/de/learners/{encoded_learner_id}/mastery",
        method="POST",
        json_body={"goalId": orientation_id, "mastery": {orientation_id: 0.5}},
    )
    require(half_status == 400, f"non-binary orientation marker returned {half_status}")
    after_half_status, after_half_state, after_half_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/state"
    )
    require(after_half_status == 200, f"fixture post-marker-rejection state status is {after_half_status}")
    require(after_half_state == before_half_state, "rejected non-binary orientation marker changed state projection")
    require(after_half_body == before_half_body, "rejected non-binary orientation marker changed learner state")

    completion_status, completion, completion_body = json_response(
        f"/api/ai/de/learners/{encoded_learner_id}/mastery",
        method="POST",
        json_body={"goalId": orientation_id, "mastery": {orientation_id: 1.0}},
    )
    require(completion_status == 200, f"fixture orientation completion status is {completion_status}")
    require(isinstance(completion, dict) and completion.get("saved") is True, "orientation completion was not saved")
    require(completion.get("savedGoalId") == orientation_id, "orientation completion saved a different goal")
    require(completion.get("savedMastery") == 1.0, "orientation completion did not save marker 1.0")
    require_fixture_frontier_state(completion, memory_id, "fixture completion response")

    successor_state_status, successor_state, successor_state_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/state"
    )
    require(successor_state_status == 200, f"fixture successor state status is {successor_state_status}")
    require_fixture_frontier_state(successor_state, memory_id, "fixture successor state")
    successor_status, successor, successor_body = json_response(
        f"/api/ui/learners/{encoded_learner_id}/frontier"
    )
    require(successor_status == 200, f"fixture successor frontier status is {successor_status}")
    successor_ids = response_frontier_ids(successor)
    require(successor_ids == [memory_id], "fixture successor frontier is not exactly the memory goal")

    memory_activation = activate_fixture_goal(
        learner_id,
        memory_id,
        expected_required_action="chooseMemoryMode",
    )
    return memory_goal, {
        "fixtureKind": "ephemeral-technical-orientation-completion-marker",
        "fixtureAutoPilot": False,
        "fixtureAutoPilotUpdateStatus": preferences_status,
        "fixtureAutoPilotUpdateResponseSha256": sha256(preferences_body),
        "fixtureLearnerResponseSha256": sha256(learner_body),
        "fixtureScopeGoalIds": scope_ids,
        "fixtureScopeResponseSha256": sha256(scope_body),
        "fixtureInitialFrontierResponseSha256": sha256(frontier_body),
        "fixturePreconditionMemoryActivationStatus": blocked_status,
        "fixturePreconditionMemoryActivationResponseSha256": sha256(blocked_body),
        "fixturePreconditionStateUnchanged": True,
        "fixtureOrientationGoalId": orientation_id,
        "fixtureOrientationActivation": orientation_activation,
        "fixtureRejectedNonBinaryOrientationMarker": 0.5,
        "fixtureRejectedNonBinaryOrientationMarkerStatus": half_status,
        "fixtureRejectedNonBinaryOrientationMarkerResponseSha256": sha256(half_body),
        "fixtureRejectedMarkerStateUnchanged": True,
        "orientationFixtureCompletionMarker": 1.0,
        "fixtureOrientationCompletionResponseSha256": sha256(completion_body),
        "fixtureSuccessorStateResponseSha256": sha256(successor_state_body),
        "fixtureSuccessorFrontierResponseSha256": sha256(successor_body),
        "fixtureMemoryActivation": memory_activation,
    }


def run() -> int:
    expected = json.loads(EXPECTED_PATH.read_text(encoding="utf-8"))
    evidence_dir = OUTPUT_ROOT / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    context: dict[str, Any] = {"expected": expected}
    results: list[dict[str, Any]] = []

    checks: dict[str, Callable[[], dict[str, Any]]] = {}

    def check(check_id: str) -> Callable[[Callable[[], dict[str, Any]]], Callable[[], dict[str, Any]]]:
        def register(function: Callable[[], dict[str, Any]]) -> Callable[[], dict[str, Any]]:
            checks[check_id] = function
            return function
        return register

    @check("app-shell.served")
    def app_shell() -> dict[str, Any]:
        status, headers, body = request("/")
        text = body.decode("utf-8")
        require(status == 200, f"app shell status is {status}")
        require("text/html" in headers.get("Content-Type", ""), "app shell is not HTML")
        require('<div id="root"></div>' in text, "app shell has no React root")
        require('/assets/' in text, "app shell has no built frontend asset")
        supervision_status, _supervision_headers, supervision_body = request(
            "/api/ui/teacher-supervision/v1/workspaces",
            method="POST",
            json_body={},
        )
        require(
            supervision_status == 404,
            f"first-party teacher supervision is active in the package consumer: {supervision_status}",
        )
        return {
            "status": status,
            "bytes": len(body),
            "bodySha256": sha256(body),
            "teacherSupervisionStatus": supervision_status,
            "teacherSupervisionBodySha256": sha256(supervision_body),
        }

    @check("catalog.package-discovery")
    def catalog_discovery() -> dict[str, Any]:
        status, catalog, body = json_response("/api/ui/curriculum-catalog")
        require(status == 200, f"catalog status is {status}")
        require(catalog.get("catalogApiVersion") == "1.2", "unexpected catalog API version")
        require(catalog.get("generationSha256") == expected["activeLockSha256"], "catalog generation differs from active lock")
        packages = catalog.get("packages")
        require(isinstance(packages, list) and len(packages) == 1, "catalog must expose exactly one package")
        package = packages[0]
        lock = expected["selectedPackage"]
        for key in ("packageId", "packageVersion", "releaseId", "contentDigest"):
            require(package.get(key) == lock[key], f"catalog package {key} differs from active lock")

        # Exercise the production curriculum overview as well. In package mode
        # its optional quality projection must come from a package artifact or
        # be explicitly empty; it must never probe the repository QA ledgers.
        curricula_status, curricula, curricula_body = json_response("/api/ui/curricula")
        require(curricula_status == 200, f"curricula overview status is {curricula_status}")
        overviews = curricula.get("curricula") if isinstance(curricula, dict) else None
        require(isinstance(overviews, list) and overviews, "curricula overview is empty")
        for overview in overviews:
            require(isinstance(overview, dict), "curricula overview contains a non-object entry")
            require(overview.get("qualityMaturity") is None, "package overview leaked repository quality maturity")
            for quality_field in (
                "qualityGoals",
                "qualityAtomicGoals",
                "qualityWarnings",
                "qualityFailures",
            ):
                require(overview.get(quality_field) == 0, f"package overview has non-empty {quality_field}")
            require(overview.get("subjectQuality") == [], "package overview leaked repository subject quality")
        context["catalog"] = catalog
        return {
            "status": status,
            "bodySha256": sha256(body),
            "generationSha256": catalog["generationSha256"],
            "packageCount": len(packages),
            "curriculaOverviewStatus": curricula_status,
            "curriculaOverviewCount": len(overviews),
            "curriculaOverviewBodySha256": sha256(curricula_body),
            "qualityProjection": "explicit-empty",
        }

    @check("catalog.root-landscape-resolved")
    def root_landscape() -> dict[str, Any]:
        catalog = context["catalog"]
        roots = catalog.get("rootLandscapeIds")
        require(isinstance(roots, list) and roots, "catalog has no root landscape")
        root_id = roots[0]
        status, landscape, body = json_response(f"/api/ui/landscapes/{urllib.parse.quote(root_id, safe='')}")
        require(status == 200, f"root landscape status is {status}")
        require(landscape.get("landscapeId") == root_id, "resolved landscape ID differs")
        require(isinstance(landscape.get("goals"), list) and landscape["goals"], "root landscape has no goals")
        context["rootId"] = root_id
        context["rootLandscape"] = landscape
        return {"status": status, "rootLandscapeId": root_id, "bodySha256": sha256(body), "goalCount": len(landscape["goals"])}

    @check("landscape.transitive-runtime-closure")
    def landscape_closure() -> dict[str, Any]:
        root_id = context["rootId"]
        status, closure, body = json_response(
            f"/api/ui/landscapes/{urllib.parse.quote(root_id, safe='')}/closure?lang=de"
        )
        require(status == 200, f"landscape closure status is {status}")
        require(isinstance(closure, list) and closure, "landscape closure is empty")
        actual_ids = {entry.get("landscapeId") for entry in closure if isinstance(entry, dict)}
        expected_ids = {entry["landscapeId"] for entry in context["catalog"]["landscapes"]}
        require(actual_ids == expected_ids, f"closure landscape set differs: {actual_ids} != {expected_ids}")
        ids = goal_ids(closure)
        require(ids, "landscape closure contains no goals")
        dangling: list[str] = []
        for landscape in closure:
            for goal in landscape.get("goals", []):
                for relation in ("contains", "requires"):
                    for target in goal.get(relation, []) or []:
                        if target not in ids:
                            dangling.append(f"{goal.get('id')}:{relation}:{target}")
        require(not dangling, f"closure has dangling hard goal references: {dangling[:3]}")
        context["closure"] = closure
        return {"status": status, "bodySha256": sha256(body), "landscapeCount": len(closure), "goalCount": len(ids)}

    @check("offering.default-resolved")
    def default_offering() -> dict[str, Any]:
        root_id = context["rootId"]
        descriptor = next(item for item in context["catalog"]["landscapes"] if item["landscapeId"] == root_id)
        offering_id = descriptor.get("defaultOfferingId")
        require(isinstance(offering_id, str) and offering_id, "root landscape has no default offering")
        offering_descriptor = next(
            (item for item in context["catalog"]["offerings"] if item["offeringId"] == offering_id), None
        )
        require(offering_descriptor is not None, "default offering is absent from catalog")
        status, resolved, body = json_response(
            f"/api/ui/composition-views/offerings/{urllib.parse.quote(offering_id, safe='')}"
        )
        require(status == 200, f"default offering status is {status}")
        require(resolved.get("landscapeId") == root_id, "default offering resolved a foreign landscape")
        context["offering"] = offering_descriptor
        context["resolvedView"] = resolved
        return {"status": status, "offeringId": offering_id, "viewId": resolved.get("viewId"), "bodySha256": sha256(body)}

    @check("composition-view.resolved")
    def composition_view() -> dict[str, Any]:
        offering = context["offering"]
        params = {"landscapeId": offering["landscapeId"], **offering["scope"]}
        query = urllib.parse.urlencode(params)
        status, resolved, body = json_response(f"/api/ui/composition-views/match?{query}")
        require(status == 200, f"composition-view match status is {status}")
        prior = context["resolvedView"]
        require(resolved.get("viewId") == prior.get("viewId"), "scope match differs from default-offering resolution")
        require(isinstance(resolved.get("rootNodes"), list) and resolved["rootNodes"], "composition view has no roots")
        return {"status": status, "viewId": resolved["viewId"], "rootCount": len(resolved["rootNodes"]), "bodySha256": sha256(body)}

    @check("learning.frontier-computed")
    def learning_frontier() -> dict[str, Any]:
        status, created, create_body = json_response("/api/ui/learners", method="POST", json_body={})
        require(status == 200, f"learner creation status is {status}")
        learner_id = find_skillpilot_id(created)
        require(learner_id is not None, "learner creation returned no SkillPilot ID")
        root_id = context["rootId"]
        curriculum_status, _headers, curriculum_body = request(
            f"/api/ui/learners/{urllib.parse.quote(learner_id, safe='')}/curriculum",
            method="PUT",
            json_body={"curriculumId": root_id},
        )
        require(curriculum_status == 200, f"learner curriculum selection status is {curriculum_status}")
        status, frontier, frontier_body = json_response(
            f"/api/ui/learners/{urllib.parse.quote(learner_id, safe='')}/frontier"
        )
        require(status == 200, f"frontier status is {status}")
        require(isinstance(frontier, dict) and isinstance(frontier.get("goals"), list), "frontier response has no goals array")
        frontier_ids = frontier["goals"]
        require(frontier_ids, "selected package curriculum produced an empty frontier")
        require(
            all(isinstance(goal_id, str) and goal_id for goal_id in frontier_ids),
            "frontier contains an invalid goal ID",
        )
        closure_ids = goal_ids(context["closure"])
        foreign_ids = sorted(set(frontier_ids) - closure_ids)
        require(not foreign_ids, f"frontier contains goals outside the package closure: {foreign_ids[:3]}")
        context["learnerId"] = learner_id
        return {
            "status": status,
            "curriculumId": root_id,
            "curriculumSelectionStatus": curriculum_status,
            "curriculumSelectionResponseSha256": sha256(curriculum_body),
            "learnerResponseSha256": sha256(create_body),
            "frontierResponseSha256": sha256(frontier_body),
            "frontierGoalCount": len(frontier_ids),
        }

    @check("cards.deck-loaded")
    def deck_loaded() -> dict[str, Any]:
        deck = context["catalog"]["decks"][0]
        status, value, body = json_response(deck["href"])
        require(status == 200, f"deck status is {status}")
        require(value.get("deckId") == deck["deckId"], "deck ID differs from catalog")
        require(isinstance(value.get("cards"), list) and value["cards"], "deck has no cards")
        context["deck"] = deck
        return {"status": status, "deckId": deck["deckId"], "cardCount": len(value["cards"]), "bodySha256": sha256(body)}

    @check("cards.verified-recall-loaded")
    def verified_recall() -> dict[str, Any]:
        goals = context["rootLandscape"]["goals"]
        learner_id = context["learnerId"]
        catalog_deck_ids = {
            deck["deckId"]
            for deck in context["catalog"].get("decks", [])
            if isinstance(deck, dict) and isinstance(deck.get("deckId"), str) and deck["deckId"]
        }
        memory_goal, fixture_evidence = prepare_verified_recall_fixture(
            learner_id,
            goals,
            catalog_deck_ids,
        )
        status, response, body = json_response(
            f"/api/ai/de/learners/{urllib.parse.quote(learner_id, safe='')}/verified-recall/start",
            method="POST",
            json_body={"goalId": memory_goal["id"], "batchSize": 1},
        )
        require(status == 200, f"verified recall status is {status}: {body[:500]!r}")
        cards = validate_verified_recall_prompt_response(response, memory_goal["id"])
        return {
            **fixture_evidence,
            "status": status,
            "goalId": memory_goal["id"],
            "promptCount": len(cards),
            "bodySha256": sha256(body),
        }

    @check("resources.goal-visualization-bytes")
    def visualization_bytes() -> dict[str, Any]:
        resource = next(
            item for item in context["catalog"]["resources"]
            if item.get("resourceKind") == "goal-visualization" and item.get("delivery") == "embedded"
        )
        status, headers, body = request(resource["href"])
        require(status == 200, f"visualization resource status is {status}")
        require(sha256(body) == resource["sha256"], "visualization bytes differ from catalog SHA-256")
        require(len(body) == resource["bytes"], "visualization byte count differs from catalog")
        require(headers.get("Content-Type", "").startswith("image/"), "visualization has no image media type")
        alias_status, _alias_headers, alias_body = request(resource["publicUrl"])
        require(alias_status == 200, f"visualization public alias status is {alias_status}")
        require(alias_body == body, "visualization public alias differs from versioned resource bytes")
        return {
            "status": status,
            "resourceId": resource["resourceId"],
            "bytes": len(body),
            "bodySha256": sha256(body),
            "publicAliasBodySha256": sha256(alias_body),
        }

    @check("source-evidence.goal-lookup")
    def source_evidence() -> dict[str, Any]:
        discovery = context["catalog"]["sourceEvidence"][0]
        goal = discovery["goals"][0]
        jurisdiction = goal["jurisdictions"][0]
        href = f"{discovery['href']}/{urllib.parse.quote(goal['goalId'], safe='')}"
        generation = context["catalog"]["generationSha256"]
        status, value, body = json_response(
            f"{href}?{urllib.parse.urlencode({'generation': generation, 'jurisdiction': jurisdiction})}"
        )
        require(status == 200, f"source-evidence lookup status is {status}")
        require(value.get("generationSha256") == generation, "source-evidence generation differs")
        require(value.get("goalId") == goal["goalId"], "source-evidence goal differs")
        wrong_status, _headers, _wrong_body = request(
            f"{href}?{urllib.parse.urlencode({'generation': '0' * 64, 'jurisdiction': jurisdiction})}"
        )
        missing_status, _headers, _missing_body = request(
            f"{href}?{urllib.parse.urlencode({'jurisdiction': jurisdiction})}"
        )
        require(wrong_status == 404, f"wrong generation was not rejected: {wrong_status}")
        require(missing_status == 400, f"missing generation was not rejected: {missing_status}")
        return {
            "status": status,
            "goalId": goal["goalId"],
            "jurisdiction": jurisdiction,
            "bodySha256": sha256(body),
            "wrongGenerationStatus": wrong_status,
            "missingGenerationStatus": missing_status,
        }

    @check("fallback.legacy-route-rejected")
    def legacy_rejected() -> dict[str, Any]:
        status, _headers, body = request(expected["legacyDeckRoute"])
        require(status == 404, f"legacy deck route returned {status}")
        return {"status": status, "route": expected["legacyDeckRoute"], "bodySha256": sha256(body)}

    @check("fallback.repository-data-unavailable")
    def repository_data_unavailable() -> dict[str, Any]:
        routes = [
            "/data/goal-source-rationales-math-public.json",
            "/data/goal-source-rationales-physics-public.json",
            "/data/__package_consumer_poison__.json",
        ]
        statuses = []
        bodies = []
        for route in routes:
            status, _headers, body = request(route)
            statuses.append(status)
            bodies.append(sha256(body))
        require(statuses == [404, 404, 404], f"repository data fallback status differs: {statuses}")
        return {"routes": routes, "statuses": statuses, "bodySha256": bodies}

    @check("fallback.raw-data-route-rejected")
    def raw_data_rejected() -> dict[str, Any]:
        routes = [expected["rawDeckRoute"], "/data/runtime/catalog.json", "/data/canonical/mathematik.landscape.json"]
        statuses = [request(route)[0] for route in routes]
        require(statuses == [404, 404, 404], f"raw package data route status differs: {statuses}")
        return {"routes": routes, "statuses": statuses}

    try:
        wait_until_ready()
    except Exception as error:  # noqa: BLE001 - report the bounded runtime failure.
        failure = {"code": "CONSUMER_STARTUP_FAILED", "message": str(error)}
        (OUTPUT_ROOT / "http-smoke.json").write_bytes(canonical_json({"checks": [], "diagnostics": [failure]}))
        return 1

    diagnostics: list[dict[str, str]] = []
    blocked = False
    for check_id in CHECK_ORDER:
        evidence_path = evidence_dir / f"{check_id}.json"
        if blocked:
            results.append({"id": check_id, "result": "not-run", "evidenceSha256": None})
            continue
        try:
            evidence = {"id": check_id, "result": "passed", "evidence": checks[check_id]()}
            evidence_bytes = canonical_json(evidence)
            evidence_path.write_bytes(evidence_bytes)
            results.append({"id": check_id, "result": "passed", "evidenceSha256": sha256(evidence_bytes)})
        except Exception as error:  # noqa: BLE001 - each failure becomes external evidence.
            evidence = {"id": check_id, "result": "failed", "message": str(error)}
            evidence_bytes = canonical_json(evidence)
            evidence_path.write_bytes(evidence_bytes)
            results.append({"id": check_id, "result": "failed", "evidenceSha256": sha256(evidence_bytes)})
            diagnostics.append({"code": "FUNCTIONAL_CHECK_FAILED", "message": f"{check_id}: {error}"})
            blocked = True

    output = {"checks": results, "diagnostics": diagnostics}
    (OUTPUT_ROOT / "http-smoke.json").write_bytes(canonical_json(output))
    return 0 if not diagnostics else 1


if __name__ == "__main__":
    sys.exit(run())
