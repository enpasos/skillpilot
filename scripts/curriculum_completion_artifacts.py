"""Portable static completion documents and their existing review bindings.

The backend graph compiler remains authoritative for learner completion. This
module checks static policy references, closed JSON contracts, canonical review
input hashes and mechanical repository-to-package locator normalization.
"""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
from typing import Any, Mapping, Callable

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

try:
    from .curriculum_package_completion_contracts import ARTIFACT_SCHEMA_ID, PROFILE_SCHEMA_ID, SCOPE_SCHEMA_ID
except ImportError:  # Direct CLI execution from scripts/.
    from curriculum_package_completion_contracts import ARTIFACT_SCHEMA_ID, PROFILE_SCHEMA_ID, SCOPE_SCHEMA_ID


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")


def digest(value: Any) -> str:
    return "sha256:" + hashlib.sha256(canonical_bytes(value)).hexdigest()


def _targets(scope: Mapping[str, Any], goals: Mapping[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    done: set[str] = set()
    active: set[str] = set()
    stack = [(goal, False) for goal in reversed(scope["targetRootIds"])]
    while stack:
        goal_id, leaving = stack.pop()
        if leaving:
            active.remove(goal_id)
            done.add(goal_id)
            continue
        if goal_id in active:
            raise ValueError(f"Cycle in completion scope: {goal_id}")
        if goal_id in done:
            continue
        goal = goals.get(goal_id)
        if not isinstance(goal, dict):
            raise ValueError(f"Unresolved completion scope goal: {goal_id}")
        active.add(goal_id)
        stack.append((goal_id, True))
        children = goal.get("contains", [])
        if not children:
            result[goal_id] = goal
        else:
            stack.extend((child, False) for child in reversed(children))
    return dict(sorted(result.items()))


def _prerequisite_context(targets: Mapping[str, Any], goals: Mapping[str, Any]) -> dict[str, set[str]]:
    """Independently check static atomic references; never calculate learner completion."""
    parents: dict[str, set[str]] = {goal_id: set() for goal_id in goals}
    for goal_id, goal in goals.items():
        for child in goal.get("contains", []):
            if child not in parents:
                raise ValueError(f"Unknown contains reference: {child}")
            parents[child].add(goal_id)
    atom_cache: dict[str, set[str]] = {}
    edges: dict[str, set[str]] = {}
    pending = list(targets)
    while pending:
        goal_id = pending.pop()
        if goal_id in edges:
            continue
        inherited: set[str] = set()
        ancestors = [goal_id]
        visited: set[str] = set()
        while ancestors:
            ancestor = ancestors.pop()
            if ancestor in visited:
                continue
            visited.add(ancestor)
            inherited.update(goals[ancestor].get("requires", []))
            ancestors.extend(parents[ancestor])
        prerequisites: set[str] = set()
        for reference in inherited:
            if reference not in atom_cache:
                atom_cache[reference] = set(_targets({"targetRootIds": [reference]}, goals))
            prerequisites.update(atom_cache[reference])
        edges[goal_id] = prerequisites
        pending.extend(prerequisites - edges.keys())
    # Cycle detection is limited to this prerequisite-closed completion context.
    counts = {goal_id: 0 for goal_id in edges}
    for references in edges.values():
        for reference in references:
            counts[reference] += 1
    ready = [goal_id for goal_id, count in counts.items() if count == 0]
    visited_count = 0
    while ready:
        goal_id = ready.pop()
        visited_count += 1
        for reference in edges[goal_id]:
            counts[reference] -= 1
            if counts[reference] == 0:
                ready.append(reference)
    if visited_count != len(edges):
        raise ValueError("Cycle in expanded completion prerequisites")
    return edges


def review_bindings(profile: Mapping[str, Any], scope: Mapping[str, Any], goals: Mapping[str, Any]) -> dict[str, str]:
    targets = _targets(scope, goals)
    tasks: dict[str, Any] = {}
    rubrics: dict[str, Any] = {}
    for goal_id, goal in targets.items():
        if str(goal.get("nodeKind") or "").lower() != "exam" and goal.get("examData") is None and str(goal.get("semanticKind") or "").lower() not in {"assessment", "practiceassessment"}:
            continue
        data = goal.get("examData") or {}
        if not isinstance(data.get("taskContent"), str) or not isinstance(data.get("solutionContent"), str) or not isinstance(data.get("scoring"), dict):
            raise ValueError(f"Completion assessment lacks task/solution/rubric: {goal_id}")
        tasks[goal_id] = {"taskContent": data["taskContent"], "solutionContent": data["solutionContent"]}
        rubrics[goal_id] = data["scoring"]
    if not tasks:
        raise ValueError("Completion scope has no required assessment")
    edges = _prerequisite_context(targets, goals)
    protected = set(profile.get("protectedGoalIds", []))
    if not protected.issubset(edges):
        raise ValueError("Protected completion goal lies outside its prerequisite context")
    rule_ids: set[str] = set()
    for rule in profile["rules"]:
        if rule["ruleId"] in rule_ids:
            raise ValueError("Duplicate completion waiver rule identity")
        rule_ids.add(rule["ruleId"])
        if not set(rule["assessmentGoalIds"]).issubset(tasks):
            raise ValueError("Waiver rule references an assessment outside its target scope")
        reachable: set[str] = set()
        pending = [reference for assessment in rule["assessmentGoalIds"] for reference in edges[assessment]]
        while pending:
            reference = pending.pop()
            if reference not in reachable:
                reachable.add(reference)
                pending.extend(edges[reference])
        for goal_id in rule["waivableGoalIds"]:
            if goal_id not in reachable:
                raise ValueError(f"Waivable goal is not a strict assessment prerequisite: {goal_id}")
            goal = goals[goal_id]
            kind = str(goal.get("semanticKind") or "").strip().lower()
            tags = goal.get("tags") or []
            orientation = kind == "orientation" or (not kind and any(str(tag).strip().lower() in {"orientation", "motivation"} for tag in tags))
            memory = str(goal.get("nodeKind") or "").lower() == "memory" or kind in {"memory", "memorization"} or isinstance((goal.get("extendedData") or {}).get("vocabularySource"), str) or any(str(tag).startswith("srs-deck") or tag == "memorization" for tag in tags)
            assessment = goal.get("nodeKind") == "exam" or goal.get("examData") is not None or kind in {"assessment", "practiceassessment"}
            if goal_id in protected or orientation or memory or assessment:
                raise ValueError(f"Waiver references a protected goal: {goal_id}")
    return {
        "scopeRevision": digest({"scope": scope, "targetGoals": list(targets.values())}),
        "taskRevision": digest(next(iter(tasks.values())) if len(tasks) == 1 else tasks),
        "rubricRevision": digest(next(iter(rubrics.values())) if len(rubrics) == 1 else rubrics),
    }


def validators(repo: Path) -> dict[str, Draft202012Validator]:
    paths = [
        repo / "contracts/curriculum-package/v1/runtime-catalog.schema.json",
        repo / "contracts/curriculum-package/v1.1/runtime-catalog.schema.json",
        repo / "contracts/curriculum-package/v1.1/completion-artifact.schema.json",
        repo / "contracts/assessment-completion/v1/profile.schema.json",
        repo / "contracts/assessment-completion/v1/scope.schema.json",
    ]
    documents = [json.loads(path.read_bytes()) for path in paths]
    registry = Registry().with_resources((document["$id"], Resource.from_contents(document)) for document in documents)
    return {document["$id"]: Draft202012Validator(document, registry=registry) for document in documents}


def schema_for_coverage(repo: Path, schema: Mapping[str, Any]) -> dict[str, Any]:
    """Resolve the extension's pinned schema references for field-registry coverage."""
    documents = {key: validator.schema for key, validator in validators(repo).items()}

    def expand(node: Any, root: Mapping[str, Any], active: frozenset[str] = frozenset()) -> Any:
        if isinstance(node, list):
            return [expand(value, root, active) for value in node]
        if not isinstance(node, dict):
            return node
        reference = node.get("$ref")
        result = {key: expand(value, root, active) for key, value in node.items() if key not in {"$ref", "$defs"}}
        if isinstance(reference, str):
            document_id, _, pointer = reference.partition("#")
            target_root = documents[document_id] if document_id else root
            identity = (document_id or str(root.get("$id"))) + "#" + pointer
            if identity not in active:
                target: Any = target_root
                for part in pointer.lstrip("/").split("/") if pointer else []:
                    target = target[part.replace("~1", "/").replace("~0", "~")]
                inherited = expand(target, target_root, active | {identity})
                result = {**inherited, **result}
        return result

    return expand(dict(schema), schema)


def _source_path(repo: Path, relative: str) -> Path:
    path = (repo / relative).resolve()
    if not path.is_relative_to((repo / "curricula").resolve()) or not path.is_file():
        raise ValueError(f"Completion authoring input must be a curriculum file: {relative}")
    return path


def canonicalize_exported_target_sets(repo: Path, configuration: Mapping[str, Any],
                                      source_landscape: Mapping[str, Any], compiled_landscape: Mapping[str, Any],
                                      normalizer: Any, serialize: Callable[[Any], bytes]) -> dict[str, Any]:
    """Canonicalize declared sets before raw portable review hashes are bound.

    Source review input objects remain untouched. The export retains every field
    and ordered array, including generated fields; only registry-declared sets in
    the reviewed target objects receive the same order as the RDF normal form.
    """
    source_goals = {goal["id"]: goal for goal in source_landscape["goals"]}
    target_ids: set[str] = set()
    # Check every original review before constructing any exported target copy.
    for entry in configuration["profiles"]:
        profile = json.loads(_source_path(repo, entry["profilePath"]).read_bytes())
        scope = json.loads(_source_path(repo, entry["scopePath"]).read_bytes())
        binding = review_bindings(profile, scope, source_goals)
        if any(profile["review"][name] != value for name, value in binding.items()):
            raise ValueError("Stale source completion review")
        target_ids.update(_targets(scope, source_goals))

    def ordered_copy(value: Any, path: str) -> Any:
        if isinstance(value, dict):
            return {key: ordered_copy(child, path + "/" + key.replace("~", "~0").replace("/", "~1"))
                    for key, child in value.items()}
        if not isinstance(value, list):
            return copy.deepcopy(value)
        children = [ordered_copy(child, f"{path}/{index}") for index, child in enumerate(value)]
        entry = normalizer.registry.direct("canonical-landscape", path)
        if entry is not None and entry.data.get("classification") == "set":
            keys = [serialize(normalizer.normalize("canonical-landscape", child, f"{path}/{index}"))
                    for index, child in enumerate(children)]
            if len(set(keys)) != len(keys):
                raise ValueError(f"Duplicate item in registry-declared completion target set: {path}")
            children = [child for _key, child in sorted(zip(keys, children), key=lambda item: item[0])]
        return children

    result = copy.deepcopy(compiled_landscape)
    result["goals"] = [ordered_copy(goal, f"/goals/{index}") if goal["id"] in target_ids else goal
                       for index, goal in enumerate(result["goals"])]
    return result


def compile_documents(repo: Path, configuration: Mapping[str, Any], source_landscape: Mapping[str, Any],
                      compiled_landscape: Mapping[str, Any]) -> tuple[list[tuple[str, str, str, Any]], list[dict[str, Any]]]:
    """Verify source approval first, then bind the equivalent exported definitions.

    Exported goal locators and explicit compatible node types may differ from
    repository authoring.  The existing release compiler owns those mechanical
    transformations.  The portable review retains both sets of input hashes.
    """
    checks = validators(repo)
    source_goals = {goal["id"]: goal for goal in source_landscape["goals"]}
    exported_goals = {goal["id"]: goal for goal in compiled_landscape["goals"]}
    output = configuration["outputDirectory"].rstrip("/")
    if output != "data/completion":
        raise ValueError("Invalid completion output directory")
    documents: list[tuple[str, str, str, Any]] = []
    inputs: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for entry in configuration["profiles"]:
        profile_source = entry["profilePath"]
        scope_source = entry["scopePath"]
        profile = json.loads(_source_path(repo, profile_source).read_bytes())
        scope = json.loads(_source_path(repo, scope_source).read_bytes())
        checks[PROFILE_SCHEMA_ID].validate(profile)
        checks[SCOPE_SCHEMA_ID].validate(scope)
        if profile["levelScopeRef"] != scope["id"]:
            raise ValueError("Completion profile and supplied scope identity differ")
        source_binding = review_bindings(profile, scope, source_goals)
        if any(profile["review"][name] != value for name, value in source_binding.items()):
            raise ValueError("Stale source completion review")
        portable_binding = review_bindings(profile, scope, exported_goals)
        profile = copy.deepcopy(profile)
        profile["review"].update(portable_binding)
        review_paths = {profile["review"]["reference"], *(rule["reviewRef"] for rule in profile["rules"])}
        renamed_reviews: dict[str, str] = {}
        for reference in sorted(review_paths):
            source = _source_path(repo, reference)
            if source.suffix != ".md":
                raise ValueError("Completion authoring reviews must be Markdown")
            original = source.read_text(encoding="utf-8")
            suffix = hashlib.sha256(reference.encode("utf-8")).hexdigest()[:16]
            path = f"{output}/reviews/{profile['id']}-{suffix}.json"
            renamed_reviews[reference] = path
            content = original + "\n\n## Portable package normalization\n\n" + (
                "The release compiler verified the existing source review before rewriting package-local locators. "
                "These are static curriculum bindings, not learner evidence or a new grading gate.\n\n"
            ) + "```json\n" + json.dumps({"source": source_binding, "portable": portable_binding}, sort_keys=True, indent=2) + "\n```\n"
            review = {"mediaType": "text/markdown", "content": content,
                      "sha256": hashlib.sha256(content.encode("utf-8")).hexdigest()}
            documents.append(("completion-rule-review", path, path, {
                "artifactFormatVersion": 1, "artifactKind": "review", "id": path, "definition": review}))
            inputs.append({"sourcePath": reference, "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                           "artifactPath": path})
        profile["review"]["reference"] = renamed_reviews[profile["review"]["reference"]]
        for rule in profile["rules"]:
            rule["reviewRef"] = renamed_reviews[rule["reviewRef"]]
        for kind, definition, source_path in [("profile", profile, profile_source), ("scope", scope, scope_source)]:
            key = (kind, definition["id"])
            if key in seen:
                raise ValueError("Duplicate completion artifact identity")
            seen.add(key)
            path = f"{output}/{kind}s/{definition['id']}.json"
            wrapper = {"artifactFormatVersion": 1, "artifactKind": kind, "id": definition["id"], "definition": definition}
            checks[ARTIFACT_SCHEMA_ID].validate(wrapper)
            documents.append((f"completion-{kind}", definition["id"], path, wrapper))
            inputs.append({"sourcePath": source_path,
                           "sourceSha256": hashlib.sha256(_source_path(repo, source_path).read_bytes()).hexdigest(),
                           "artifactPath": path})
    if not documents:
        raise ValueError("Completion package input must contain a reviewed profile")
    for _role, _id, _path, wrapper in documents:
        checks[ARTIFACT_SCHEMA_ID].validate(wrapper)
    return sorted(documents, key=lambda item: (item[0], item[1])), sorted(inputs, key=lambda item: item["sourcePath"])


def validate_package_documents(documents: list[tuple[str, str, str, Any]], goals: Mapping[str, Any]) -> None:
    """Independent package-side references and review hashes; no filesystem fallback."""
    scopes: dict[str, Any] = {}
    profiles: dict[str, Any] = {}
    reviews: set[str] = set()
    for role, logical_id, path, wrapper in documents:
        definition = wrapper["definition"]
        if wrapper["id"] != logical_id:
            raise ValueError("Completion artifact identity differs from its semantic binding")
        if role == "completion-rule-review":
            if logical_id != path or hashlib.sha256(definition["content"].encode("utf-8")).hexdigest() != definition["sha256"]:
                raise ValueError("Completion review identity or content digest differs")
            reviews.add(path)
        elif role == "completion-scope":
            if logical_id in scopes or definition["id"] != logical_id:
                raise ValueError("Duplicate completion scope identity")
            scopes[logical_id] = definition
        elif role == "completion-profile":
            if logical_id in profiles or definition["id"] != logical_id:
                raise ValueError("Duplicate completion profile identity")
            profiles[logical_id] = definition
        else:
            raise ValueError("Unknown completion artifact role")
    for profile in profiles.values():
        scope = scopes.get(profile["levelScopeRef"])
        if scope is None:
            raise ValueError("Completion scope is missing")
        if profile["review"]["reference"] not in reviews or any(rule["reviewRef"] not in reviews for rule in profile["rules"]):
            raise ValueError("Completion review is missing")
        bindings = review_bindings(profile, scope, goals)
        if any(profile["review"][name] != value for name, value in bindings.items()):
            raise ValueError("Stale packaged completion review")
