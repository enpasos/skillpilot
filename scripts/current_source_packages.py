# SPDX-License-Identifier: Apache-2.0
"""Resolve versioned official extractions for build-time readers from the source registry."""
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

REGISTRY = Path("curricula/DE/Gymnasium/provenance/source-landscape-registry.json")


def row_hash(row):
    data = json.dumps(row, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    return hashlib.sha256(data.encode()).hexdigest()


def checked_file(root, binding):
    path = binding["path"]
    relative = Path(path)
    if relative.is_absolute() or ".." in relative.parts or not path.startswith("curricula/"):
        raise ValueError(f"Invalid source package path: {path}")
    data = (root / path).read_bytes()
    if hashlib.sha256(data).hexdigest() != binding["sha256"]:
        raise ValueError(f"Stale source package binding: {path}")
    return data


def indexed(rows, key):
    result = {}
    for row in rows:
        value = row[key]
        if not isinstance(value, str) or not value or value in result:
            raise ValueError(f"Missing or duplicate source package {key}: {value}")
        result[value] = row
    if not result:
        raise ValueError(f"Empty source package inventory: {key}")
    return result


def validate_edition(root, entry, edition):
    source = json.loads(checked_file(root, edition["extraction"]))
    review = json.loads(checked_file(root, edition["review"]))
    checked_file(root, edition["document"])
    if (review["sourceExtractionPath"] != edition["extraction"]["path"]
            or source["sourceDocument"]["path"] != edition["document"]["path"]
            or source["sourceLandscapeId"] != entry["landscapeId"]
            or review["sourceLandscapeId"] != entry["landscapeId"]
            or source["jurisdiction"] != entry["jurisdiction"]
            or source["subject"] != entry["packageScope"]["subject"]
            or source["stage"] != entry["packageScope"]["stage"]
            or review["targetLandscapeId"] != entry["packageScope"]["targetLandscapeId"]):
        raise ValueError(f"Inconsistent source package identity: {edition['id']}")
    goals = indexed(source["sourceGoals"], "id")
    decisions = indexed(review["decisions"], "sourceGoalId")
    passages = indexed(source["passages"], "id")
    if goals.keys() != decisions.keys() or any(row["passageId"] not in passages for row in goals.values()):
        raise ValueError(f"Incomplete source package review or orphaned ID: {edition['id']}")
    pairs = [(mapping["legacyGoalId"], mapping["canonicalGoalId"]) for mapping in review["mappings"]]
    expected = {(row_id, target) for row_id, decision in decisions.items() for target in decision["canonicalGoalIds"]}
    if set(pairs) != expected or len(pairs) != len(expected):
        raise ValueError(f"Inconsistent source package mapping pairs: {edition['id']}")
    if edition["format"] == "literal-v1":
        for row_id, row in goals.items():
            decision = decisions[row_id]
            targets = decision["canonicalGoalIds"]
            if (decision.get("decision") not in {"mapped", "needsCanonicalGoal"}
                    or (decision["decision"] == "mapped") != bool(targets)
                    or len(set(targets)) != len(targets)):
                raise ValueError(f"Incomplete mapping decision: {row_id}")
            if (decision.get("sourceGoalSha256") != row_hash(row)
                    or decision["sourceSpan"] != row["sourceSpan"]):
                raise ValueError(f"Changed reviewed source row: {row_id}")
    elif edition["format"] != "retained-v1":
        raise ValueError(f"Unknown source package format: {edition['format']}")


def current_packages(root):
    registry = json.loads((root / REGISTRY).read_text())
    packages = []
    occurrences = Counter(entry.get("landscapeId") for entry in registry["entries"])
    paths = set()
    for entry in registry["entries"]:
        if "sourcePackages" not in entry:
            continue
        scope = entry["packageScope"]
        if not all(scope.get(key) for key in ("subject", "stage", "schoolType", "validity", "targetLandscapeId")):
            raise ValueError("Incomplete versioned source scope")
        editions = indexed(entry["sourcePackages"], "id")
        current = [edition for edition in editions.values() if edition["status"] == "current"]
        if len(current) != 1 or occurrences[entry["landscapeId"]] != 1:
            raise ValueError(f"Expected exactly one current source package: {entry['landscapeId']}")
        if any(edition["status"] not in {"current", "draft", "historical"} for edition in editions.values()):
            raise ValueError("Unknown source package status")
        active = current[0]
        validate_edition(root, entry, active)
        item = {"landscapeId": entry["landscapeId"], "jurisdiction": entry["jurisdiction"], **scope}
        for field in ("extraction", "review"):
            registered = [edition[field]["path"] for edition in editions.values()]
            if len(set(registered)) != len(registered) or paths.intersection(registered):
                raise ValueError(f"Ambiguous source package paths: {registered}")
            paths.update(registered)
            item[field] = {**active[field], "registered": registered}
        packages.append(item)
    return packages


if __name__ == "__main__":
    print(json.dumps(current_packages(Path(sys.argv[1]).resolve()), ensure_ascii=False))
