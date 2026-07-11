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
        return {"status": status, "bytes": len(body), "bodySha256": sha256(body)}

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
        memory_goal = next(
            (
                goal for goal in goals
                if goal.get("nodeKind") == "memory"
                or "memorization" in (goal.get("tags") or [])
            ),
            None,
        )
        require(memory_goal is not None, "package landscape has no memorization goal")
        learner_id = context["learnerId"]
        status, response, body = json_response(
            f"/api/ai/de/learners/{urllib.parse.quote(learner_id, safe='')}/verified-recall/start",
            method="POST",
            json_body={"goalId": memory_goal["id"], "batchSize": 1},
        )
        require(status == 200, f"verified recall status is {status}: {body[:500]!r}")
        require(response.get("goalId") == memory_goal["id"], "verified recall goal differs")
        require(response.get("status") == "ready", f"verified recall is not ready: {response.get('status')}")
        require(isinstance(response.get("cards"), list) and response["cards"], "verified recall returned no prompt card")
        return {"status": status, "goalId": memory_goal["id"], "promptCount": len(response["cards"]), "bodySha256": sha256(body)}

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
