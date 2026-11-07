#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Replay the bounded German proposal without modifying any repository file.

Only Python's standard library and the recorded local Git objects are needed.
The adjacent manifest contains the complete case context and AI decisions; its
historical tmp-file hashes are provenance, never runtime inputs to this script.
Goal-node effective closure and atomic-normalized closure are checked separately.
Existing unrelated catalog cycles are counted, not accepted as valid graphs.
"""

import argparse
import hashlib
import json
import subprocess
import sys
from collections import defaultdict
from pathlib import Path


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def stable(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":")).encode()


def closure(keys, edges):
    """Exact nonempty-path closure: iterative Kosaraju then component-DAG sets."""
    indices = {key: index for index, key in enumerate(keys)}
    adjacency = [[indices[target] for target in sorted(edges.get(key, set()))]
                 for key in keys]
    reverse = [[] for _ in keys]
    for source, targets in enumerate(adjacency):
        for target in targets:
            reverse[target].append(source)
    visited, finish = set(), []
    for start in range(len(keys)):
        if start in visited:
            continue
        visited.add(start)
        stack = [(start, 0)]
        while stack:
            source, index = stack[-1]
            if index == len(adjacency[source]):
                finish.append(source)
                stack.pop()
                continue
            target = adjacency[source][index]
            stack[-1] = (source, index + 1)
            if target not in visited:
                visited.add(target)
                stack.append((target, 0))
    component, members = [-1] * len(keys), []
    for start in reversed(finish):
        if component[start] != -1:
            continue
        index, part, stack = len(members), [], [start]
        component[start] = index
        while stack:
            source = stack.pop()
            part.append(source)
            for target in reverse[source]:
                if component[target] == -1:
                    component[target] = index
                    stack.append(target)
        members.append(part)
    children, degree = [set() for _ in members], [0] * len(members)
    own = [sum(1 << value for value in part) for part in members]
    cyclic = [len(part) > 1 or part[0] in adjacency[part[0]] for part in members]
    for source, targets in enumerate(adjacency):
        for target in targets:
            left, right = component[source], component[target]
            if left != right:
                children[left].add(right)
    for targets in children:
        for target in targets:
            degree[target] += 1
    order = [index for index, value in enumerate(degree) if value == 0]
    for source in order:
        for target in children[source]:
            degree[target] -= 1
            if degree[target] == 0:
                order.append(target)
    require(len(order) == len(members), "SCC condensation unexpectedly cyclic")
    reached = [0] * len(members)
    for source in reversed(order):
        bits = own[source] if cyclic[source] else 0
        for target in children[source]:
            bits |= own[target] | reached[target]
        reached[source] = bits
    return [reached[component[index]] for index in range(len(keys))], sum(cyclic)


def digest_relation(keys, values, kind):
    result = hashlib.sha256()
    result.update(("german-repair-global-nonempty-closure-v1:" + kind + "\0").encode())
    width = (len(keys) + 7) // 8
    for key, bits in zip(keys, values):
        raw = key.encode()
        result.update(len(raw).to_bytes(8, "big"))
        result.update(raw)
        result.update(bits.to_bytes(width, "big"))
    return result.hexdigest()


class Catalog:
    def __init__(self, documents):
        self.nodes, by_id = {}, defaultdict(list)
        for document in documents:
            owner = document["landscapeId"]
            for goal in document["goals"]:
                key = owner + ":" + goal["id"]
                require(key not in self.nodes, "Duplicate logical goal: " + key)
                self.nodes[key] = (owner, goal)
                by_id[goal["id"]].append(key)
        self.keys, self.by_id = sorted(self.nodes), by_id
        self.contains = {
            key: sorted({self.resolve(raw, owner) for raw in goal.get("contains", [])})
            for key, (owner, goal) in self.nodes.items()
        }
        self.authored = {
            key: {self.resolve(raw, owner) for raw in goal.get("requires", [])}
            for key, (owner, goal) in self.nodes.items()
        }
        self.parents = {key: [] for key in self.keys}
        for parent, children in self.contains.items():
            for child in children:
                self.parents[child].append(parent)
        incoming = {key: len(self.parents[key]) for key in self.keys}
        self.topology = [key for key in self.keys if incoming[key] == 0]
        for parent in self.topology:
            for child in self.contains[parent]:
                incoming[child] -= 1
                if incoming[child] == 0:
                    self.topology.append(child)
        require(len(self.topology) == len(self.keys), "Fixed contains graph is cyclic")
        self.atoms = {}
        for key in reversed(self.topology):
            self.atoms[key] = ({key} if not self.contains[key] else
                               set().union(*(self.atoms[c] for c in self.contains[key])))
        self.atom_keys = [key for key in self.keys if not self.contains[key]]

    def resolve(self, raw, owner):
        require(isinstance(raw, str) and raw, "Empty or non-string reference")
        if ":" in raw:
            parts = raw.split(":")
            require(len(parts) == 2 and all(parts), "Malformed qualified reference: " + raw)
            key = raw
        elif owner + ":" + raw in self.nodes:
            key = owner + ":" + raw
        else:
            matches = self.by_id.get(raw, [])
            require(len(matches) == 1, "Missing or ambiguous reference: " + raw)
            key = matches[0]
        require(key in self.nodes, "Missing exact reference: " + key)
        return key

    def effective(self):
        edges = {key: set(self.authored[key]) for key in self.keys}
        origins = {key: {target: key for target in self.authored[key]} for key in self.keys}
        for parent in self.topology:
            for child in self.contains[parent]:
                for target in sorted(edges[parent]):
                    if target not in edges[child]:
                        origins[child][target] = origins[parent][target]
                    edges[child].add(target)
        return edges, origins

    def atomic(self, edges):
        return {key: set().union(*(self.atoms[t] for t in edges[key]))
                for key in self.atom_keys}

    def remove_origin(self, source, target):
        require(target in self.authored[source], "Missing authored removal origin")
        owner, goal = self.nodes[source]
        raw = goal.get("requires", [])
        matching = [ref for ref in raw if self.resolve(ref, owner) == target]
        require(len(matching) == 1, "Removal must identify exactly one serialized reference")
        self.authored[source].remove(target)
        goal["requires"] = [ref for ref in raw if self.resolve(ref, owner) != target]

    def is_ancestor(self, ancestor, child):
        visited, pending = set(), list(self.parents[child])
        while pending:
            key = pending.pop()
            if key == ancestor:
                return True
            if key not in visited:
                visited.add(key)
                pending.extend(self.parents[key])
        return False

    def validate_path(self, edges, path):
        require(len(path) >= 2, "A witness needs a real nonempty path")
        for source, target in zip(path, path[1:]):
            require(target in edges.get(source, set()), "Invalid witness hop: " + source + " -> " + target)

    def validate_origins(self, path, evidence):
        require(len(evidence) == len(path) - 1, "Missing witness origin evidence")
        for left, right, row in zip(path, path[1:], evidence):
            origin = row["authoredOriginKey"]
            require(row["fromKey"] == left and row["toKey"] == right, "Witness origin endpoints mismatch")
            require(right in self.authored.get(origin, set()), "Witness origin no longer authored")
            require(origin == left or self.is_ancestor(origin, left), "Witness origin is not an ancestor")
            require(row["mode"] == ("direct" if origin == left else "inherited"), "Incorrect origin mode")


def witness(edges, start, target, allowed=None):
    queue, previous = [start], {start: None}
    for current in queue:
        for child in sorted(edges.get(current, set())):
            if allowed is not None and current != start and (current, child) not in allowed:
                continue
            if child in previous:
                continue
            previous[child] = current
            queue.append(child)
            if child == target:
                path = [target]
                while path[0] != start:
                    path.insert(0, previous[path[0]])
                return path
    return None


def self_test():
    keys = ["a", "b", "c", "d"]
    require(closure(keys, {"a": {"b"}, "b": {"c"}, "c": {"b"}})[0] == [6, 6, 6, 0],
            "Closure SCC/ordinary/disconnected control failed")
    require(closure(keys, {"a": {"a"}})[0] == [1, 0, 0, 0], "Nonempty self closure control failed")
    catalog = Catalog([{"landscapeId": "L", "goals": [
        {"id": "parent", "contains": ["child"], "requires": ["p"]},
        {"id": "child", "requires": ["p"]}, {"id": "p"},
    ]}])
    before, _ = catalog.effective()
    catalog.remove_origin("L:child", "L:p")
    require(catalog.effective()[0] == before, "Inherited duplicate control failed")
    catalog.remove_origin("L:parent", "L:p")
    after, _ = catalog.effective()
    require(not after["L:parent"] and not after["L:child"], "Origin removal did not remove inherited copies")
    try:
        catalog.validate_path(after, ["L:child", "L:p"])
    except ValueError:
        pass
    else:
        raise ValueError("Forged surviving witness was accepted")


def load_catalog(repo_root, manifest):
    baseline = manifest["catalogBaseline"]
    commit = baseline["gitCommit"]
    require(len(commit) == 40 and all(c in "0123456789abcdef" for c in commit), "Invalid recorded Git commit")
    documents, paths = [], set()
    for source in baseline["sourceFiles"]:
        path = source["sourceFile"]
        require(path not in paths and not Path(path).is_absolute() and ".." not in Path(path).parts,
                "Duplicate or unsafe catalog path")
        paths.add(path)
        result = subprocess.run(["git", "-C", str(repo_root), "show", commit + ":" + path],
                                check=True, capture_output=True)
        require(sha256(result.stdout) == source["sha256"], "Catalog SHA mismatch: " + path)
        document = json.loads(result.stdout)
        require(document["landscapeId"] == source["landscapeId"], "Catalog owner mismatch")
        documents.append(document)
    require(documents, "Empty recorded catalog")
    return documents


def verify(repo_root, manifest_path, include_witnesses=False):
    manifest = json.loads(manifest_path.read_bytes())
    require(manifest["humanApproval"] is False, "This verifier cannot grant human approval")
    documents = load_catalog(repo_root, manifest)
    graph = Catalog(documents)
    source_files = manifest["catalogBaseline"]["sourceFiles"]
    sources = [s for s in source_files if s["sourceFile"] == manifest["sourceFile"]]
    require(len(sources) == 1 and sources[0]["sha256"] == manifest["sourceBaselineSha256"],
            "Review source does not match its recorded catalog")
    owner = sources[0]["landscapeId"]
    require(len(graph.keys) == manifest["catalogBaseline"]["nodeCount"], "Catalog node count mismatch")
    require(len(graph.atom_keys) == manifest["catalogBaseline"]["atomicGoalCount"], "Atomic count mismatch")
    before_effective, _ = graph.effective()
    before_goal, goal_cycles = closure(graph.keys, before_effective)
    before_atom, atom_cycles = closure(graph.keys, graph.atomic(before_effective))
    goal_hash = digest_relation(graph.keys, before_goal, "R_effective+")
    atom_hash = digest_relation(graph.keys, before_atom, "R_atomic+")
    semantic_before = {key: sha256(stable({k: v for k, v in goal.items() if k != "requires"}))
                       for key, (_, goal) in graph.nodes.items()}
    ids, pairs, approved_hops, removals, holds = set(), set(), set(), [], []
    rows = manifest["cases"]
    for index, case in enumerate(rows):
        case_id = case["caseId"]
        require(case_id not in ids and case["index"] == index, "Duplicate or reordered case")
        ids.add(case_id)
        source, target = owner + ":" + case["source"]["id"], owner + ":" + case["prerequisite"]["id"]
        require((source, target) not in pairs, "Repeated authored edge in review")
        pairs.add((source, target))
        require(target in graph.authored[source], "Reviewed edge is not authored in baseline")
        require(case["humanApproval"] is False and case["applied"] is False, "Proposal state mismatch")
        review = case["review"]
        require(review.get("sourceId", review.get("sourceGoalId")) == case["source"]["id"] and
                review.get("prerequisiteId", review.get("prerequisiteGoalId")) == case["prerequisite"]["id"],
                "Review decision refers to a different edge")
        require(review.get("didacticReason", review.get("reason")), "Missing individual AI rationale")
        for context in [case["source"], case["prerequisite"], *case["witnessNodes"]]:
            goal = graph.nodes[owner + ":" + context["id"]][1]
            for field in ["title", "titleEn", "description", "descriptionEn", "tags", "type", "dimensionTags"]:
                require(context.get(field) == goal.get(field), "Source context mismatch: " + case_id + ":" + field)
        path = [owner + ":" + node["id"] for node in case["witnessNodes"]]
        require(path[0] == source and path[-1] == target, "Baseline witness endpoints mismatch")
        graph.validate_path(before_effective, path)
        if review["decision"] == "remove_redundant_direct_edge":
            approved_hops.update(zip(path[1:], path[2:]))
            removals.append((case, source, target))
        else:
            require(review["decision"] == "retain_direct_pending_path_review", "Unknown decision")
            holds.append(case)

    steps = []
    for case, source, target in removals:
        graph.remove_origin(source, target)
        effective, _ = graph.effective()
        path = witness(effective, source, target)
        require(path is not None, "No post-removal/reinherited witness: " + case["caseId"])
        after_goal, _ = closure(graph.keys, effective)
        after_atom, _ = closure(graph.keys, graph.atomic(effective))
        require(after_goal == before_goal, "Global effective closure changed: " + case["caseId"])
        require(after_atom == before_atom, "Global atomic closure changed: " + case["caseId"])
        recorded = case["sequentialValidation"]
        require(recorded["caseId"] == case["caseId"] and recorded["sourceKey"] == source and
                recorded["removedPrerequisiteKey"] == target, "Recorded step edge mismatch")
        require(recorded["postRemovalWitness"][0] == source and recorded["postRemovalWitness"][-1] == target,
                "Recorded step witness endpoints mismatch")
        graph.validate_path(effective, recorded["postRemovalWitness"])
        graph.validate_origins(recorded["postRemovalWitness"], recorded["postRemovalWitnessOrigins"])
        steps.append({"caseId": case["caseId"], "postRemovalWitness": path})

    final_effective, _ = graph.effective()
    for case, source, target in removals:
        require(witness(final_effective, source, target, approved_hops) is not None,
                "Final witness needs an unreviewed intermediary: " + case["caseId"])
        recorded = case["finalSurvivingWitness"]
        path = recorded["goalKeys"]
        require(path[0] == source and path[-1] == target, "Final witness endpoints mismatch")
        graph.validate_path(final_effective, path)
        graph.validate_origins(path, recorded["hopOrigins"])
        require(all(pair in approved_hops for pair in zip(path[1:], path[2:])), "Unreviewed final witness hop")
    require(all(semantic_before[key] == sha256(stable({k: v for k, v in goal.items() if k != "requires"}))
                for key, (_, goal) in graph.nodes.items()), "A non-requires field changed in memory")
    summary = manifest["summary"]
    require((summary["reviewedCases"], summary["conditionalRemoveProposals"], summary["retainedPendingPathReview"])
            == (len(rows), len(removals), len(holds)), "Recorded summary mismatch")
    expected = manifest["verification"]
    actual = {"stepCount": len(steps), "effectiveClosureSha256": goal_hash, "atomicClosureSha256": atom_hash,
              "effectiveClosurePairCount": sum(value.bit_count() for value in before_goal),
              "atomicClosurePairCount": sum(value.bit_count() for value in before_atom),
              "existingUnrelatedGlobalEffectiveCyclicComponents": goal_cycles,
              "existingUnrelatedGlobalAtomicCyclicComponents": atom_cycles}
    for key, value in actual.items():
        require(expected[key] == value, "Recorded verification mismatch: " + key)
    require([s["caseId"] for s in expected["steps"]] == [s["caseId"] for s in steps], "Recorded step ordering mismatch")
    require(expected["verifierSha256"] == sha256(Path(__file__).read_bytes()), "Versioned verifier SHA mismatch")
    result = {"status": "PASS", "readOnly": True, "humanApproval": False,
              "manifestSha256": sha256(manifest_path.read_bytes()), "catalogCommit": manifest["catalogBaseline"]["gitCommit"],
              "catalogSources": len(source_files), "checkedGoalKeys": len(graph.keys),
              "reviewedCases": len(rows), "conditionalRemovalProposals": len(removals), "heldCases": len(holds),
              "globalEffectiveClosurePreservedAtEveryStep": True, "globalAtomicClosurePreservedAtEveryStep": True,
              "allFinalWitnessesSurvive": True, "requiresOnlyChangesInMemory": True, **actual}
    if include_witnesses:
        result["steps"] = steps
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[3],
                        help="Repository containing the recorded local Git objects")
    parser.add_argument("--manifest", type=Path, default=Path(__file__).with_name("german-minimality-review-2026-11-06.json"),
                        help="Self-contained reviewed proposal manifest")
    parser.add_argument("--include-witnesses", action="store_true", help="Include recomputed sequential witnesses in stdout")
    parser.add_argument("--self-test", action="store_true", help="Run only the positive/negative small-graph controls")
    args = parser.parse_args()
    try:
        self_test()
        result = ({"status": "PASS", "selfTest": True, "readOnly": True} if args.self_test else
                  verify(args.repo_root.resolve(), args.manifest.resolve(), args.include_witnesses))
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "FAIL", "readOnly": True, "error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
