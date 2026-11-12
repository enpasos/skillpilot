"""Learning units in the landscape placement layer (runtime contract 1.2).

A learning unit is a ``programUnits`` entry with ``kind: "learningUnit"``; an
``own`` goal placement assigns one atomic goal to exactly one unit; reviewed
coverage evidence (rule R2) sits on the unit as ``coverageReviews``, so goal objects
stay byte-identical when a review is added or refreshed.

This module is shared by the release compiler, the independent release-model
validator and the finished-package validator. It reads no learner state and
derives no recognition. It provides

* the exact projection that removes every learning-unit field for the 1.0 and
  1.1 contracts,
* the structural validity rules R1, R3, R4, non-empty total scope, an acyclic
  learning-unit hierarchy and current R2 coverage-review bindings, evaluated
  over the normative prerequisite relation (inherit along ``contains``, expand
  to atoms, close transitively; paths may leave the unit and the landscape),
* the build step that verifies coverage-review bindings and turns repository
  review records into package-local review artifacts.
"""

from __future__ import annotations

import copy
import hashlib
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Sequence

try:
    from . import curriculum_package_learning_unit_contracts as contracts
except ImportError:  # Direct CLI execution from scripts/.
    import curriculum_package_learning_unit_contracts as contracts


LEARNING_UNIT_KIND = "learningUnit"
OWN_RELATION = "own"
LEARNING_UNIT_FIELDS = frozenset({"labelEn", "promise", "promiseEn", "revision", "coverageReviews"})
REVIEW_ARTIFACT_KIND = "coverage-review"
REVIEW_MEDIA_TYPES = {".md": "text/markdown", ".json": "application/json"}
FINDING_CODES = (
    "LU-UNIT", "LU-REF", "LU-ATOMIC", "LU-KIND", "LU-GRAPH", "LU-UNIT-ID", "LU-CHILD", "LU-HIERARCHY",
    "LU-PLACEMENT", "LU-EMPTY-SCOPE", "LU-R1", "LU-R2-EVIDENCE", "LU-R3", "LU-R4-MULTIPLE",
    "LU-R4-UNOWNED",
)


class LearningUnitError(ValueError):
    """A learning-unit input cannot be compiled or projected."""


class UnitGraphError(ValueError):
    """A prerequisite reference or relation of the canonical graph is invalid."""


@dataclass(frozen=True)
class Finding:
    code: str
    landscape_id: str
    message: str
    unit_id: str | None = None
    goal_id: str | None = None

    def as_dict(self) -> dict[str, Any]:
        result: dict[str, Any] = {"code": self.code, "landscapeId": self.landscape_id, "message": self.message}
        if self.unit_id is not None:
            result["unitId"] = self.unit_id
        if self.goal_id is not None:
            result["goalId"] = self.goal_id
        return result


# --------------------------------------------------------------------------- kinds

def _lower(value: Any) -> str:
    return value.strip().lower() if isinstance(value, str) else ""


def _tags(goal: Mapping[str, Any]) -> list[str]:
    tags = goal.get("tags")
    return [tag for tag in tags if isinstance(tag, str)] if isinstance(tags, list) else []


def is_assessment(goal: Mapping[str, Any]) -> bool:
    """Mirrors CompletionProfileCompiler.isAssessment."""
    return (_lower(goal.get("nodeKind")) == "exam" or goal.get("examData") is not None
            or _lower(goal.get("semanticKind")) in {"practiceassessment", "assessment"})


def is_memory(goal: Mapping[str, Any]) -> bool:
    """Mirrors CompletionProfileCompiler.isMemory."""
    extended = goal.get("extendedData")
    return (_lower(goal.get("nodeKind")) == "memory"
            or _lower(goal.get("semanticKind")) in {"memory", "memorization"}
            or (isinstance(extended, dict) and isinstance(extended.get("vocabularySource"), str))
            or any(tag.startswith("srs-deck") or tag == "memorization" for tag in _tags(goal)))


def is_orientation(goal: Mapping[str, Any]) -> bool:
    """Mirrors CompletionProfileCompiler.isOrientation."""
    kind = goal.get("semanticKind")
    if isinstance(kind, str) and kind.strip():
        return kind.strip().lower() == "orientation"
    return any(_lower(tag) in {"orientation", "motivation"} for tag in _tags(goal))


def goal_kinds(goal: Mapping[str, Any]) -> list[str]:
    kinds = [name for name, predicate in (("assessment", is_assessment), ("memory", is_memory),
                                          ("orientation", is_orientation)) if predicate(goal)]
    return kinds or ["ordinary"]


# -------------------------------------------------------------------- canonical hash

def _canonical(value: Any) -> str:
    # Same binding convention as contracts/assessment-completion/v1 and the
    # TypeScript reference: sorted keys, preserved array order, compact JSON.
    # Inputs whose serialization differs between Jackson, JavaScript and Python
    # are rejected rather than hashed differently.
    if isinstance(value, dict):
        return "{" + ",".join(json.dumps(key, ensure_ascii=False) + ":" + _canonical(value[key])
                              for key in sorted(value)) + "}"
    if isinstance(value, list):
        return "[" + ",".join(_canonical(item) for item in value) + "]"
    if isinstance(value, bool) or value is None:
        return json.dumps(value)
    if isinstance(value, int):
        if abs(value) > 2**53 - 1:
            raise UnitGraphError(f"Review-bound content must use safe integers, found {value}")
        return str(value)
    if isinstance(value, float):
        if not value.is_integer() or abs(value) > 2**53 - 1:
            raise UnitGraphError(f"Review-bound content must use integer numbers, found {value}")
        return str(int(value))
    if isinstance(value, str):
        if any(ord(char) < 0x20 and char not in "\b\t\n\f\r" for char in value):
            raise UnitGraphError("Review-bound content contains an unsupported control character")
        return json.dumps(value, ensure_ascii=False)
    raise UnitGraphError(f"Unsupported review-bound JSON value: {type(value).__name__}")


def canonical_hash(value: Any) -> str:
    return "sha256:" + hashlib.sha256(_canonical(value).encode("utf-8")).hexdigest()


def assessment_review_revisions(goal: Mapping[str, Any]) -> dict[str, str]:
    data = goal.get("examData")
    if (not isinstance(data, dict) or not isinstance(data.get("taskContent"), str)
            or not isinstance(data.get("solutionContent"), str) or not isinstance(data.get("scoring"), dict)):
        raise UnitGraphError(f"Assessment {goal.get('id')} lacks a task, solution or rubric")
    return {
        "taskRevision": canonical_hash({"taskContent": data["taskContent"], "solutionContent": data["solutionContent"]}),
        "rubricRevision": canonical_hash(data["scoring"]),
    }


# --------------------------------------------------------------------------- graph

class UnitGraph:
    """Canonical skill graph with the normative effective prerequisite relation."""

    def __init__(self, landscapes: Iterable[Mapping[str, Any]]) -> None:
        self.goals: dict[str, Mapping[str, Any]] = {}
        self.landscape_of: dict[str, str] = {}
        self.keys_by_id: dict[str, list[str]] = {}
        self.children: dict[str, list[str]] = {}
        self.parents: dict[str, list[str]] = {}
        for landscape in landscapes:
            landscape_id = landscape.get("landscapeId")
            goals = landscape.get("goals")
            if not isinstance(landscape_id, str) or not landscape_id or not isinstance(goals, list):
                raise UnitGraphError("Canonical landscape without ID or goals")
            for goal in goals:
                goal_id = goal.get("id") if isinstance(goal, dict) else None
                if not isinstance(goal_id, str) or not goal_id:
                    raise UnitGraphError(f"Goal without ID in {landscape_id}")
                key = f"{landscape_id}:{goal_id}"
                if key in self.goals:
                    raise UnitGraphError(f"Duplicate goal {key}")
                self.goals[key] = goal
                self.landscape_of[key] = landscape_id
                self.keys_by_id.setdefault(goal_id, []).append(key)
        self._atoms: dict[str, list[str]] = {}
        self._direct: dict[str, list[str]] = {}
        self._reach: dict[str, frozenset[str]] = {}
        self._resolve_errors: dict[str, str] = {}
        for key, goal in self.goals.items():
            contains = goal.get("contains")
            try:
                resolved = sorted({self.resolve(ref, self.landscape_of[key]) for ref in (contains or [])})
            except UnitGraphError as error:
                # Malformed hierarchy is reported only where a unit depends on it.
                self._resolve_errors[key] = str(error)
                resolved = []
            self.children[key] = resolved
        for key, children in self.children.items():
            for child in children:
                self.parents.setdefault(child, []).append(key)

    def resolve(self, ref: Any, from_landscape: str) -> str:
        """Same resolution order as the TypeScript reference and the minimality auditor."""
        if not isinstance(ref, str) or not ref.strip():
            raise UnitGraphError(f"Empty goal reference in {from_landscape}")
        if ":" in ref:
            parts = ref.split(":")
            key = f"{parts[0] or from_landscape}:{parts[1]}"
            if len(parts) != 2 or key not in self.goals:
                raise UnitGraphError(f"Unknown goal reference {ref}")
            return key
        local = f"{from_landscape}:{ref}"
        if local in self.goals:
            return local
        matches = self.keys_by_id.get(ref, [])
        if len(matches) != 1:
            raise UnitGraphError(f"{'Ambiguous' if matches else 'Unknown'} goal reference {ref} from {from_landscape}")
        return matches[0]

    def has(self, key: str) -> bool:
        return key in self.goals

    def is_atomic(self, key: str) -> bool:
        return not self.children[key]

    def atomic_keys(self, landscape_id: str) -> list[str]:
        return sorted(key for key in self.goals if self.landscape_of[key] == landscape_id and not self.children[key])

    def atoms(self, key: str) -> list[str]:
        known = self._atoms.get(key)
        if known is not None:
            return known
        if key in self._resolve_errors:
            raise UnitGraphError(self._resolve_errors[key])
        result: set[str] = set()
        active: list[str] = []
        stack: list[tuple[str, bool]] = [(key, False)]
        on_path: set[str] = set()
        while stack:
            current, leaving = stack.pop()
            if leaving:
                on_path.discard(current)
                active.pop()
                continue
            if current in on_path:
                raise UnitGraphError("contains cycle: " + " -> ".join([*active, current]))
            if current in self._resolve_errors:
                raise UnitGraphError(self._resolve_errors[current])
            children = self.children[current]
            if not children:
                result.add(current)
                continue
            on_path.add(current)
            active.append(current)
            stack.append((current, True))
            stack.extend((child, False) for child in reversed(children))
        atoms = sorted(result)
        self._atoms[key] = atoms
        return atoms

    def _ancestors(self, key: str) -> list[str]:
        seen: set[str] = set()
        queue = list(self.parents.get(key, []))
        while queue:
            parent = queue.pop()
            if parent in seen:
                continue
            seen.add(parent)
            queue.extend(self.parents.get(parent, []))
        return sorted(seen)

    def direct_atomic_requires(self, key: str) -> list[str]:
        """One step of the inherited, atomically expanded relation for an atom."""
        known = self._direct.get(key)
        if known is not None:
            return known
        result: set[str] = set()
        for source in [key, *self._ancestors(key)]:
            requires = self.goals[source].get("requires")
            for ref in requires or []:
                result.update(self.atoms(self.resolve(ref, self.landscape_of[source])))
        direct = sorted(result)
        self._direct[key] = direct
        return direct

    def reach(self, key: str) -> frozenset[str]:
        """Everything an atom requires directly or transitively (itself only on a cycle)."""
        known = self._reach.get(key)
        if known is not None:
            return known
        seen: set[str] = set()
        queue = list(self.direct_atomic_requires(key))
        while queue:
            current = queue.pop()
            if current in seen:
                continue
            seen.add(current)
            queue.extend(self.direct_atomic_requires(current))
        result = frozenset(seen)
        self._reach[key] = result
        return result


# --------------------------------------------------------------------- projection

def is_learning_unit(unit: Any) -> bool:
    return isinstance(unit, dict) and unit.get("kind") == LEARNING_UNIT_KIND


def has_learning_unit_content(landscape: Mapping[str, Any]) -> bool:
    if "learningUnitCoverage" in landscape:
        return True
    if any(is_learning_unit(unit) for unit in landscape.get("programUnits") or []):
        return True
    return any(isinstance(item, dict) and item.get("relation") == OWN_RELATION for item in landscape.get("goalPlacements") or [])


def project_out_learning_units(landscape: Mapping[str, Any]) -> dict[str, Any]:
    """Return the exact 1.0/1.1 view: every learning-unit field removed, nothing else changed.

    Coverage reviews leave with their units; goal objects are never touched. A
    list that becomes empty only because of the projection is removed, so the
    result equals the landscape as authored before its first learning unit.
    """
    result = copy.deepcopy(dict(landscape))
    result.pop("learningUnitCoverage", None)
    units = result.get("programUnits")
    learning_unit_ids: set[str] = set()
    if isinstance(units, list):
        learning_unit_ids = {unit.get("id") for unit in units if is_learning_unit(unit)}
        kept = [unit for unit in units if not is_learning_unit(unit)]
        for unit in kept:
            if isinstance(unit, dict) and unit.get("parentUnitId") in learning_unit_ids:
                raise LearningUnitError(
                    f"Program unit {unit.get('id')} of kind {unit.get('kind')} cannot have a learning-unit parent")
        if kept or not units:
            result["programUnits"] = kept
        else:
            del result["programUnits"]
    placements = result.get("goalPlacements")
    if isinstance(placements, list):
        kept_placements = [item for item in placements
                           if not (isinstance(item, dict) and (item.get("relation") == OWN_RELATION
                                                               or item.get("unitId") in learning_unit_ids))]
        if kept_placements or not placements:
            result["goalPlacements"] = kept_placements
        else:
            del result["goalPlacements"]
    return result


def learning_unit_counts(landscape: Mapping[str, Any]) -> dict[str, int]:
    units = [unit for unit in landscape.get("programUnits") or [] if is_learning_unit(unit)]
    own = [item for item in landscape.get("goalPlacements") or []
           if isinstance(item, dict) and item.get("relation") == OWN_RELATION]
    reviews = sum(len(unit.get("coverageReviews") or []) for unit in units)
    return {"learningUnits": len(units), "ownPlacements": len(own), "coverageReviews": reviews}


# --------------------------------------------------------------------- validation

UNIT_FIELDS = frozenset({"id", "kind", "label", "labelEn", "promise", "promiseEn", "revision", "parentUnitId", "order",
                         "coverageReviews"})
REVIEW_FIELDS = frozenset({"assessmentGoalId", "goalIds", "reference", "taskRevision", "rubricRevision"})
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
REVISION = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}-v[1-9][0-9]*$")
SHA256_REVISION = re.compile(r"^sha256:[0-9a-f]{64}$")
REPOSITORY_PATH = re.compile(r"^(?!/)(?!.*(?:^|/)\.\.(?:/|$))[A-Za-z0-9._/-]+$")


def _text(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


@dataclass
class _Unit:
    """One learning unit as derived from the placement layer."""

    landscape_id: str
    unit_id: str
    own_goal_ids: list[str] = field(default_factory=list)
    child_unit_ids: list[str] = field(default_factory=list)
    reviews: list[dict[str, Any]] = field(default_factory=list)
    own: dict[str, str] = field(default_factory=dict)
    valid: bool = True

    @property
    def key(self) -> str:
        return f"{self.landscape_id}:{self.unit_id}"


@dataclass
class _Catalog:
    landscape_id: str
    completeness: str
    units: list[_Unit]


@dataclass(frozen=True)
class UnitSummary:
    landscape_id: str
    unit_id: str
    own_goals: dict[str, int]
    total_scope: int
    structurally_valid: bool
    goals_without_reviewed_coverage: list[str]


@dataclass(frozen=True)
class LandscapeLedger:
    landscape_id: str
    completeness: str
    atomic_goals: int
    owned_goals: int
    unowned_goals: dict[str, int]


@dataclass(frozen=True)
class ValidationResult:
    findings: list[Finding]
    units: list[UnitSummary]
    ledgers: list[LandscapeLedger]


def _goal_id(key: str) -> str:
    return key.split(":", 1)[1]


def _empty_kinds() -> dict[str, int]:
    return {"assessment": 0, "memory": 0, "orientation": 0, "ordinary": 0}


def _derive(landscapes: Sequence[Mapping[str, Any]], findings: list[Finding]) -> tuple[list[_Catalog], set[str]]:
    """Read learning units from the placement layer and report every malformed declaration.

    The declaration format is closed: a field outside the contract is a finding.
    """
    catalogs: list[_Catalog] = []
    invalid: set[str] = set()
    for landscape in landscapes:
        landscape_id = str(landscape.get("landscapeId"))

        def report(code: str, message: str, unit_id: str | None = None, goal_id: str | None = None) -> None:
            if unit_id:
                invalid.add(f"{landscape_id}:{unit_id}")
            findings.append(Finding(code, landscape_id, message, unit_id, goal_id))

        program_units = [unit for unit in landscape.get("programUnits") or [] if isinstance(unit, dict)]
        kind_of: dict[str, Any] = {}
        units: dict[str, _Unit] = {}
        declarations: dict[str, Mapping[str, Any]] = {}
        for unit in program_units:
            unit_id = unit.get("id") if isinstance(unit.get("id"), str) else ""
            learning = unit.get("kind") == LEARNING_UNIT_KIND
            if unit_id in kind_of:
                if learning or kind_of[unit_id] == LEARNING_UNIT_KIND:
                    report("LU-UNIT-ID", f"Program unit ID {unit_id} is declared more than once", unit_id)
                continue
            kind_of[unit_id] = unit.get("kind")
            if not learning:
                stray = [name for name in sorted(LEARNING_UNIT_FIELDS) if name in unit]
                if stray:
                    report("LU-UNIT", f"Program unit {unit_id} of kind {unit.get('kind')} carries learning-unit fields: {', '.join(stray)}")
                continue
            units[unit_id] = _Unit(landscape_id, unit_id)
            declarations[unit_id] = unit
            problems = [] if SLUG.match(unit_id) else ["id is not a lowercase slug"]
            problems += [f"{name} is missing" for name in ("label", "labelEn", "promise", "promiseEn") if not _text(unit.get(name))]
            if not (isinstance(unit.get("revision"), str) and REVISION.match(unit["revision"])):
                problems.append("revision is not YYYY-MM-DD-vN")
            if "order" in unit and (isinstance(unit["order"], bool) or not isinstance(unit["order"], int)):
                problems.append("order is not an integer")
            problems += [f"field {name} is not part of the contract" for name in unit if name not in UNIT_FIELDS]
            for problem in problems:
                report("LU-UNIT", f"Learning unit {unit_id}: {problem}", unit_id)
        # The parent requires the unit as a child; both ends are learning units.
        for unit in program_units:
            parent_value = unit.get("parentUnitId")
            if parent_value is None or not isinstance(unit.get("id"), str):
                continue
            parent = str(parent_value)
            child = units.get(unit["id"])
            if child is not None and parent in units:
                units[parent].child_unit_ids.append(child.unit_id)
            elif child is not None:
                report("LU-CHILD", f"Parent {parent} of learning unit {child.unit_id} is not a learning unit of this landscape", child.unit_id)
            elif parent in units:
                report("LU-CHILD", f"Program unit {unit['id']} of kind {unit.get('kind')} names learning unit {parent} as parent", parent)
        owner: dict[str, list[str]] = {}
        seen: set[tuple[str, str]] = set()
        for placement in landscape.get("goalPlacements") or []:
            if not isinstance(placement, dict):
                continue
            goal_id, unit_id = str(placement.get("goalId")), str(placement.get("unitId"))
            unit = units.get(unit_id)
            if placement.get("relation") != OWN_RELATION:
                if unit is not None:
                    report("LU-PLACEMENT", f"Placement of {goal_id} in learning unit {unit_id} uses relation "
                           f"{placement.get('relation')}; a learning unit takes only \"own\"", unit_id, goal_id)
                continue
            if unit is None:
                report("LU-PLACEMENT", f"Goal {goal_id} is owned by {unit_id}, which is not a learning unit of this landscape",
                       goal_id=goal_id)
                continue
            if placement.get("context") is not None:
                report("LU-PLACEMENT", f"Ownership of {goal_id} by {unit_id} carries a context; ownership is not scope-specific "
                       "in this contract version", unit_id, goal_id)
            if (goal_id, unit_id) in seen:
                report("LU-PLACEMENT", f"Ownership of {goal_id} by {unit_id} is declared more than once", unit_id, goal_id)
                continue
            seen.add((goal_id, unit_id))
            unit.own_goal_ids.append(goal_id)
            owner.setdefault(goal_id, []).append(unit_id)
        # Reviewed coverage (R2) belongs to the unit's local contract and sits on the unit entry.
        for unit_id, unit in units.items():
            reviews = declarations[unit_id].get("coverageReviews")
            if reviews is None:
                continue
            if not isinstance(reviews, list):
                report("LU-R2-EVIDENCE", f"Learning unit {unit_id}: coverageReviews is not a list", unit_id)
                continue
            reviewed_assessments: set[str] = set()
            for review in reviews:
                assessment = review.get("assessmentGoalId") if isinstance(review, dict) else None
                assessment_id = assessment if isinstance(assessment, str) else None
                goal_ids = review.get("goalIds") if isinstance(review, dict) else None
                goal_ids = goal_ids if isinstance(goal_ids, list) else []
                well_formed = (isinstance(review, dict) and set(review) == REVIEW_FIELDS and _text(assessment_id)
                               and len(goal_ids) > 0 and all(_text(value) for value in goal_ids)
                               and len(set(goal_ids)) == len(goal_ids)
                               and isinstance(review.get("reference"), str) and bool(REPOSITORY_PATH.match(review["reference"]))
                               and isinstance(review.get("taskRevision"), str) and bool(SHA256_REVISION.match(review["taskRevision"]))
                               and isinstance(review.get("rubricRevision"), str) and bool(SHA256_REVISION.match(review["rubricRevision"])))
                if not well_formed:
                    report("LU-R2-EVIDENCE", f"A coverage review of {unit_id} is malformed: it has exactly assessmentGoalId, goalIds, "
                           "a repository-relative reference and sha256 task and rubric revisions", unit_id, assessment_id)
                    continue
                if assessment_id in reviewed_assessments:
                    report("LU-R2-EVIDENCE", f"Learning unit {unit_id} reviews assessment {assessment_id} more than once",
                           unit_id, assessment_id)
                    continue
                reviewed_assessments.add(assessment_id)
                unit.reviews.append(dict(review))
        coverage = landscape.get("learningUnitCoverage")
        if coverage is not None and coverage not in ("partial", "complete"):
            report("LU-UNIT", f"learningUnitCoverage is {json.dumps(coverage)}; it is \"partial\" or \"complete\"")
        if units or coverage in ("partial", "complete"):
            catalogs.append(_Catalog(landscape_id, "complete" if coverage == "complete" else "partial", list(units.values())))
    return catalogs, invalid


def validate_learning_units(
    landscapes: Sequence[Mapping[str, Any]],
    *,
    review_reference_exists: Callable[[str], bool] | None = None,
    graph: UnitGraph | None = None,
) -> list[Finding]:
    """Findings only; see :func:`evaluate_learning_units`."""
    return evaluate_learning_units(landscapes, review_reference_exists=review_reference_exists, graph=graph).findings


def evaluate_learning_units(
    landscapes: Sequence[Mapping[str, Any]],
    *,
    review_reference_exists: Callable[[str], bool] | None = None,
    graph: UnitGraph | None = None,
) -> ValidationResult:
    """Validate every learning unit of every landscape; prerequisite paths may cross landscapes.

    ``review_reference_exists`` checks a coverage-review reference; ``None``
    skips the existence check (it is mandatory inside a package).
    """
    findings: list[Finding] = []
    catalogs, invalid = _derive(landscapes, findings)
    try:
        graph = graph or UnitGraph(landscapes)
    except UnitGraphError as error:
        for catalog in catalogs:
            findings.append(Finding("LU-GRAPH", catalog.landscape_id, str(error)))
            for unit in catalog.units:
                findings.append(Finding("LU-GRAPH", catalog.landscape_id, str(error), unit.unit_id))
        return ValidationResult(findings, [], [])

    units = [unit for catalog in catalogs for unit in catalog.units]
    for unit in units:
        unit.valid = unit.key not in invalid

    def fail(unit: _Unit, code: str, message: str, goal_id: str | None = None) -> None:
        unit.valid = False
        findings.append(Finding(code, unit.landscape_id, message, unit.unit_id, goal_id))

    for unit in units:
        for goal_id in unit.own_goal_ids:
            key = f"{unit.landscape_id}:{goal_id}"
            if not graph.has(key):
                fail(unit, "LU-REF", f"Own goal {goal_id} is not a goal of landscape {unit.landscape_id}", goal_id)
            elif not graph.is_atomic(key):
                fail(unit, "LU-ATOMIC", f"Own goal {goal_id} is a cluster; a unit owns atomic goals only", goal_id)
            elif len(kinds := goal_kinds(graph.goals[key])) > 1:
                fail(unit, "LU-KIND", f"Own goal {goal_id} is classified as {' and '.join(kinds)}", goal_id)
            else:
                unit.own[key] = kinds[0]

    # Hierarchy: acyclic; total scope T(U) = Own(U) united with T of every child.
    by_key = {unit.key: unit for unit in units}
    scopes: dict[str, set[str]] = {}
    state: dict[str, str] = {}
    cyclic: set[str] = set()

    def visit(key: str, trail: list[str]) -> set[str] | None:
        if state.get(key) == "done":
            return scopes.get(key)
        if state.get(key) == "active":
            loop = [*trail[trail.index(key):], key]
            for member in dict.fromkeys(loop):
                if member not in cyclic:
                    cyclic.add(member)
                    fail(by_key[member], "LU-HIERARCHY", "Unit hierarchy cycle: " + " -> ".join(_goal_id(item) for item in loop))
            return None
        state[key] = "active"
        entry = by_key[key]
        scope = set(entry.own)
        defined = True
        for child in entry.child_unit_ids:
            child_scope = visit(f"{entry.landscape_id}:{child}", [*trail, key])
            if child_scope is None:
                defined = False
            else:
                scope |= child_scope
        state[key] = "done"
        if not defined or key in cyclic:
            return None
        scopes[key] = scope
        return scope

    for unit in units:
        visit(unit.key, [])
    for unit in units:
        scope = scopes.get(unit.key)
        if scope is not None and not scope:
            fail(unit, "LU-EMPTY-SCOPE", "Total scope is empty; a unit needs own goals or required children with goals")
        elif scope is None and unit.key not in cyclic:
            fail(unit, "LU-HIERARCHY", "Total scope is undefined because a required child unit lies on a hierarchy cycle")

    # R4, first half: no goal has two directly owning units.
    owners: dict[str, list[_Unit]] = {}
    for unit in units:
        for key in unit.own:
            owners.setdefault(key, []).append(unit)
    for key, owning in owners.items():
        if len(owning) > 1:
            names = ", ".join(entry.unit_id for entry in owning)
            for entry in owning:
                fail(entry, "LU-R4-MULTIPLE", f"Goal {_goal_id(key)} is owned by {names}; exactly one unit owns a goal", _goal_id(key))

    reviewed_by_unit: dict[str, set[str]] = {}
    for unit in units:
        assessments = [key for key, kind in unit.own.items() if kind == "assessment"]
        memories = [key for key, kind in unit.own.items() if kind == "memory"]
        ordinary = [key for key, kind in unit.own.items() if kind == "ordinary"]
        reviewed: set[str] = set()
        reviewed_by_unit[unit.key] = reviewed
        try:
            for key in unit.own:
                if key in graph.reach(key):
                    fail(unit, "LU-GRAPH", f"Goal {_goal_id(key)} requires itself transitively", _goal_id(key))
            assessed = {atom for key in assessments for atom in graph.reach(key)}
            memorized = {atom for key in memories for atom in graph.reach(key)}
            # R1: an own assessment requires the goal; a path that leads only to a memory goal does not count.
            for key in ordinary:
                if key in assessed:
                    continue
                fail(unit, "LU-R1", f"Goal {_goal_id(key)} is required only by an own memory goal; an own assessment must require it"
                     if key in memorized else
                     f"Goal {_goal_id(key)} lies on no prerequisite path from an own assessment of the unit", _goal_id(key))
            # R3: every coverage claim of an own assessment is a goal that assessment requires.
            coverage: dict[str, set[str]] = {}
            for assessment in assessments:
                keys, problems = _coverage_keys(graph, assessment)
                coverage[assessment] = set(keys)
                for problem in problems:
                    fail(unit, "LU-R3", f"Assessment {_goal_id(assessment)} coverage: {problem}", _goal_id(assessment))
                for key in keys:
                    if key not in graph.reach(assessment):
                        fail(unit, "LU-R3", f"Assessment {_goal_id(assessment)} claims coverage of {_goal_id(key)} without requiring it",
                             _goal_id(assessment))
            # R2 evidence must be founded and current wherever it is claimed.
            for review in unit.reviews:
                assessment_id = review["assessmentGoalId"]
                assessment = f"{unit.landscape_id}:{assessment_id}"
                if unit.own.get(assessment) != "assessment":
                    fail(unit, "LU-R2-EVIDENCE", f"Coverage review of {assessment_id}, which is not an own assessment of "
                         f"unit {unit.unit_id}", assessment_id)
                    continue
                if review_reference_exists is not None and not review_reference_exists(review["reference"]):
                    fail(unit, "LU-R2-EVIDENCE", f"Review record {review['reference']} does not exist", assessment_id)
                try:
                    revisions = assessment_review_revisions(graph.goals[assessment])
                except UnitGraphError as error:
                    fail(unit, "LU-R2-EVIDENCE", str(error), assessment_id)
                    continue
                if revisions["taskRevision"] != review["taskRevision"] or revisions["rubricRevision"] != review["rubricRevision"]:
                    fail(unit, "LU-R2-EVIDENCE", f"Coverage review of {assessment_id} is stale: task or rubric changed since the review",
                         assessment_id)
                    continue
                for goal_id in review["goalIds"]:
                    key = f"{unit.landscape_id}:{goal_id}"
                    if unit.own.get(key) != "ordinary":
                        fail(unit, "LU-R2-EVIDENCE", f"Reviewed goal {goal_id} is not an own ordinary goal of the unit", assessment_id)
                    elif key not in graph.reach(assessment):
                        fail(unit, "LU-R2-EVIDENCE", f"Reviewed goal {goal_id} is not required by assessment {assessment_id}", assessment_id)
                    elif key not in coverage[assessment]:
                        fail(unit, "LU-R2-EVIDENCE", f"Reviewed goal {goal_id} is missing from coveredGoalIds of {assessment_id}",
                             assessment_id)
                    else:
                        reviewed.add(key)
        except UnitGraphError as error:
            fail(unit, "LU-GRAPH", str(error))

    summaries = []
    for unit in units:
        own_goals = _empty_kinds()
        for kind in unit.own.values():
            own_goals[kind] += 1
        summaries.append(UnitSummary(
            unit.landscape_id, unit.unit_id, own_goals, len(scopes.get(unit.key, ())), unit.valid,
            sorted(_goal_id(key) for key, kind in unit.own.items()
                   if kind == "ordinary" and key not in reviewed_by_unit[unit.key])))

    # R4, second half: a landscape declared complete leaves no atomic goal without an owner.
    ledgers = []
    for catalog in catalogs:
        atomic = graph.atomic_keys(catalog.landscape_id)
        unowned = _empty_kinds()
        for key in atomic:
            if key in owners:
                continue
            unowned[goal_kinds(graph.goals[key])[0]] += 1
            if catalog.completeness == "complete":
                findings.append(Finding("LU-R4-UNOWNED", catalog.landscape_id,
                                        f"Goal {_goal_id(key)} has no owning unit although the landscape declares "
                                        "learningUnitCoverage \"complete\"", None, _goal_id(key)))
        ledgers.append(LandscapeLedger(catalog.landscape_id, catalog.completeness, len(atomic),
                                       sum(1 for key in atomic if key in owners), unowned))
    return ValidationResult(findings, summaries, ledgers)


def _coverage_keys(graph: UnitGraph, assessment: str) -> tuple[list[str], list[str]]:
    data = graph.goals[assessment].get("examData")
    declared = data.get("coveredGoalIds") if isinstance(data, dict) else None
    if declared is None:
        return [], []
    if not isinstance(declared, list):
        return [], ["coveredGoalIds is not a list"]
    keys: list[str] = []
    problems: list[str] = []
    for ref in declared:
        try:
            key = graph.resolve(ref, graph.landscape_of[assessment])
        except UnitGraphError as error:
            problems.append(str(error))
            continue
        if graph.is_atomic(key):
            keys.append(key)
        else:
            problems.append(f"{ref} is a cluster; coverage names atomic goals")
    return keys, problems


def require_valid(findings: Sequence[Finding], context: str) -> None:
    if findings:
        preview = "; ".join(f"{item.code} {item.unit_id or '-'} {item.goal_id or '-'}: {item.message}" for item in findings[:8])
        raise LearningUnitError(f"{context}: {len(findings)} learning-unit finding(s): {preview}")


# --------------------------------------------------------------- review artifacts

def iter_coverage_reviews(landscape: Mapping[str, Any]) -> Iterable[dict[str, Any]]:
    """Every coverage-review object on the landscape's learning units (mutable when the landscape is)."""
    for unit in landscape.get("programUnits") or []:
        if is_learning_unit(unit) and isinstance(unit.get("coverageReviews"), list):
            yield from (review for review in unit["coverageReviews"] if isinstance(review, dict))


def review_artifact_path(reference: str) -> str:
    return f"{contracts.REVIEW_OUTPUT_DIRECTORY}/{hashlib.sha256(reference.encode('utf-8')).hexdigest()[:16]}.json"


def review_wrapper(path: str, media_type: str, content: str) -> dict[str, Any]:
    return {
        "artifactFormatVersion": 1,
        "artifactKind": REVIEW_ARTIFACT_KIND,
        "id": path,
        "definition": {
            "mediaType": media_type,
            "content": content,
            "sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
        },
    }


def _review_source(repo: Path, relative: str) -> Path:
    if relative.startswith("/") or "\\" in relative or any(part in {"", ".", ".."} for part in relative.split("/")):
        raise LearningUnitError(f"Coverage review reference must be a repository-relative path: {relative}")
    path = repo / relative
    curricula = (repo / "curricula").resolve()
    try:
        resolved = path.resolve(strict=True)
    except OSError as error:
        raise LearningUnitError(f"Coverage review record does not exist: {relative}") from error
    if path.is_symlink() or not resolved.is_relative_to(curricula) or not resolved.is_file():
        raise LearningUnitError(f"Coverage review record must be a regular curriculum file: {relative}")
    if path.suffix not in REVIEW_MEDIA_TYPES:
        raise LearningUnitError(f"Coverage review record must be Markdown or JSON: {relative}")
    return resolved


def compile_coverage_reviews(
    repo: Path, compiled_landscape: Mapping[str, Any], graph_landscapes: Sequence[Mapping[str, Any]] | None = None,
) -> tuple[dict[str, Any], list[tuple[str, str, str, dict[str, Any]]], list[dict[str, Any]]]:
    """Verify every unit and coverage review, then rewrite review references to package artifacts.

    Bindings are checked against the exported task, solution and rubric. The
    review text is shipped unchanged with its SHA-256; repository paths remain
    only in build metadata.
    """
    def source_exists(reference: str) -> bool:
        try:
            _review_source(repo, reference)
        except LearningUnitError:
            return False
        return True

    landscapes = list(graph_landscapes) if graph_landscapes is not None else [compiled_landscape]
    require_valid(validate_learning_units(landscapes, review_reference_exists=source_exists),
                  f"Learning units of {compiled_landscape.get('landscapeId')}")
    result = copy.deepcopy(dict(compiled_landscape))
    documents: dict[str, tuple[str, str, str, dict[str, Any]]] = {}
    inputs: dict[str, dict[str, Any]] = {}
    for review in iter_coverage_reviews(result):
        reference = review["reference"]
        source = _review_source(repo, reference)
        raw = source.read_bytes()
        try:
            content = raw.decode("utf-8")
        except UnicodeDecodeError as error:
            raise LearningUnitError(f"Coverage review record is not UTF-8: {reference}") from error
        media_type = REVIEW_MEDIA_TYPES[source.suffix]
        if media_type == "application/json":
            try:
                json.loads(content)
            except ValueError as error:
                raise LearningUnitError(f"Coverage review record is not JSON: {reference}") from error
        path = review_artifact_path(reference)
        documents[path] = (contracts.REVIEW_ROLE, path, path, review_wrapper(path, media_type, content))
        inputs[reference] = {"sourcePath": reference, "sourceSha256": hashlib.sha256(raw).hexdigest(), "artifactPath": path}
        review["reference"] = path
    return (result, [documents[path] for path in sorted(documents)],
            [inputs[reference] for reference in sorted(inputs)])


def validate_review_documents(documents: Sequence[tuple[str, str, str, Any]]) -> dict[str, dict[str, Any]]:
    """Independent package-side identity and content digest check; returns reviews by path."""
    reviews: dict[str, dict[str, Any]] = {}
    for role, logical_id, path, wrapper in documents:
        if role != contracts.REVIEW_ROLE:
            raise LearningUnitError(f"Unknown learning-unit artifact role {role}")
        if not isinstance(wrapper, dict) or set(wrapper) != {"artifactFormatVersion", "artifactKind", "id", "definition"}:
            raise LearningUnitError("Coverage review wrapper is not closed")
        definition = wrapper.get("definition")
        if (wrapper.get("artifactFormatVersion") != 1 or wrapper.get("artifactKind") != REVIEW_ARTIFACT_KIND
                or wrapper.get("id") != logical_id or logical_id != path or not isinstance(definition, dict)
                or set(definition) != {"mediaType", "content", "sha256"}
                or definition.get("mediaType") not in REVIEW_MEDIA_TYPES.values()
                or not isinstance(definition.get("content"), str)
                or hashlib.sha256(definition["content"].encode("utf-8")).hexdigest() != definition.get("sha256")):
            raise LearningUnitError(f"Coverage review identity or content digest differs: {path}")
        if path in reviews:
            raise LearningUnitError(f"Duplicate coverage review artifact {path}")
        reviews[path] = wrapper
    return reviews


def validate_package_learning_units(
    landscapes: Sequence[Mapping[str, Any]], review_documents: Sequence[tuple[str, str, str, Any]],
) -> list[Finding]:
    """Fail-closed package check: unit rules plus exact review-artifact resolution."""
    reviews = validate_review_documents(review_documents)
    referenced = {review["reference"] for landscape in landscapes for review in iter_coverage_reviews(landscape)
                  if isinstance(review.get("reference"), str)}
    findings = validate_learning_units(landscapes, review_reference_exists=lambda path: path in reviews)
    for orphan in sorted(set(reviews) - referenced):
        findings.append(Finding("LU-R2-EVIDENCE", "-", f"Coverage review artifact {orphan} is not referenced by any landscape"))
    return findings


# ---------------------------------------------------------------- schema access

_VALIDATORS: dict[Path, dict[str, Any]] = {}


def schema_validators(repo: Path) -> dict[str, Any]:
    """Offline validators for the 1.2 schemas; the catalog resolves its pinned V1 references."""
    cached = _VALIDATORS.get(repo)
    if cached is not None:
        return cached
    from jsonschema import Draft202012Validator, FormatChecker
    from referencing import Registry, Resource

    v1 = repo / "contracts/curriculum-package/v1"
    v12 = repo / "contracts/curriculum-package" / contracts.CONTRACT_DIRECTORY_NAME
    paths = [
        v1 / "runtime-catalog.schema.json",
        v12 / "runtime-catalog.schema.json",
        v12 / "compiled-landscape.schema.json",
        v12 / "learning-unit-coverage-review.schema.json",
        v12 / "release-model-build-profile.schema.json",
    ]
    documents = [json.loads(path.read_bytes()) for path in paths]
    registry = Registry().with_resources((document["$id"], Resource.from_contents(document)) for document in documents)
    result: dict[str, Any] = {}
    for document in documents:
        Draft202012Validator.check_schema(document)
        result[document["$id"]] = Draft202012Validator(document, registry=registry, format_checker=FormatChecker())
    _VALIDATORS[repo] = result
    return result


LEARNING_UNIT_SCHEMA_IDS = frozenset({
    contracts.CATALOG_SCHEMA_ID, contracts.LANDSCAPE_SCHEMA_ID, contracts.REVIEW_SCHEMA_ID, contracts.BUILD_PROFILE_SCHEMA_ID,
})
