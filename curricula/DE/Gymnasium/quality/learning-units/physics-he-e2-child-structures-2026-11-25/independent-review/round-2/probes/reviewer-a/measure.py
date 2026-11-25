#!/usr/bin/env python3
"""Independent pinned-blob measurement; never imports an author's or reviewer's code."""
import hashlib
import json
import pathlib
import subprocess
from collections import defaultdict
from functools import lru_cache

BASE = "19c14af91e"
HEAD = "4f963b4b78"
OLD = "a88f17523b"
VIEWDIR = "curricula/DE/Gymnasium/composition-views/physik"
RECORDDIR = "curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25"
OUT = pathlib.Path(__file__).resolve().parent
REPO = pathlib.Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())

def git(*args):
    return subprocess.check_output(["git", *args], cwd=REPO)

@lru_cache(None)
def blob(ref, path):
    return git("show", f"{ref}:{path}")

def doc(ref, path):
    return json.loads(blob(ref, path))

goals = {}
owners = {}
for name in git("ls-tree", "-r", "--name-only", HEAD, "curricula/DE/Gymnasium/canonical").decode().splitlines():
    if name.endswith(".json"):
        d = doc(HEAD, name)
        for g in d["goals"]:
            goals[g["id"]] = g
            owners[g["id"]] = d["subject"]

@lru_cache(None)
def atoms(gid):
    children = goals[gid].get("contains", [])
    return frozenset().union(*(atoms(c) for c in children)) if children else frozenset([gid])

@lru_cache(None)
def prereqs(gid):
    direct = goals[gid].get("requires", [])
    return frozenset(direct).union(*(prereqs(c) for c in direct))

def walk(nodes, path=()):
    for n in nodes:
        yield n, path
        yield from walk(n.get("children", []), path + ((n["id"],) if n.get("kind") == "structure" else ()))

def roles(view):
    # Explicit entries override canonical-subtree inheritance; nearest occurrence wins,
    # with target winning ties. This is the published role_atoms contract, reimplemented.
    assigned = {}
    for n, _ in walk(view["rootNodes"]):
        if "goalId" not in n:
            continue
        role = n.get("projectionRole", "target")
        def visit(gid, depth=0):
            rank = (2 if n["kind"] == "goalEntry" else 1, -depth, role == "target")
            if gid not in assigned or rank > assigned[gid][0]:
                assigned[gid] = rank, role
            if n["kind"] == "canonicalSubtree":
                for c in goals[gid].get("contains", []):
                    visit(c, depth + 1)
        visit(n["goalId"])
    return {r: {g for g, (_, rr) in assigned.items() if rr == r and not goals[g].get("contains")}
            for r in ("target", "prerequisiteOnly")}

def acquisitions(view):
    result = defaultdict(list)
    for n, path in walk(view["rootNodes"]):
        if n.get("acquisitionPlacement") is True:
            result[n["goalId"]].append(list(path))
    return dict(result)

def section_atoms(view, section):
    node = next(n for n, _ in walk(view["rootNodes"]) if n.get("id") == section)
    result = set()
    for n, _ in walk([node]):
        if "goalId" in n:
            if n.get("acquisitionPlacement") is True or n.get("projectionRole", "target") == "target":
                result.update(atoms(n["goalId"]) if n["kind"] == "canonicalSubtree" else [n["goalId"]])
    return result

def plan_atoms(view, section):
    # Source roles alone are deliberately NOT course applicability. The ordinary
    # subject plan also uses the learner's GK/LK tags. Explicit acquisition goals
    # are promoted into the subject selection. Neither E.2 has a unit policy that
    # declares additional voluntary exams.
    candidate = section_atoms(view, section)
    targets = roles(view)["target"] | set(acquisitions(view))
    course = view["scope"]["courseProfile"]
    def applicable(gid):
        profiles = set(goals[gid].get("tags", [])) & {"GK", "LK"}
        return not profiles or course in profiles
    return {g for g in candidate & targets if owners[g] == "Physik" and applicable(g)}

record = doc(HEAD, RECORDDIR + "/regrouping.actual.json")
record_moves = {(x["goalId"], v["file"], v["from"], v["to"])
                for x in record["preparationPlaces"]["goals"] for v in x["views"]}
original_path = REPO / "tmp/e1-handover/reviews/e2-child-structures/structure.actual.json"
original = json.loads(original_path.read_bytes())
original_moves = {(m["id"], pathlib.Path(v["file"]).name, m["before"][0][-1], m["after"][0][-1])
                  for v in original["changed"] for m in v["acquisitionPlacementMoves"]}
files = git("ls-tree", "-r", "--name-only", HEAD, VIEWDIR).decode().splitlines()
changed = [p for p in files if blob(BASE, p) != blob(HEAD, p)]
summary = {"base": git("rev-parse", BASE).decode().strip(), "head": git("rev-parse", HEAD).decode().strip(),
           "previous": git("rev-parse", OLD).decode().strip(), "originalMeasurementSha256": hashlib.sha256(original_path.read_bytes()).hexdigest(),
           "allViews": len(files), "changed": len(changed), "unchanged": len(files) - len(changed), "views": [], "plans": []}
actual_moves = set()
for p in changed:
    before, after = doc(BASE, p), doc(HEAD, p)
    name = pathlib.Path(p).name
    old_place, new_place = acquisitions(before), acquisitions(after)
    moves = []
    for gid in sorted(set(old_place) | set(new_place)):
        if old_place.get(gid) != new_place.get(gid):
            moves.append({"goalId": gid, "title": goals[gid]["title"], "subject": owners[gid],
                          "before": old_place.get(gid, []), "after": new_place.get(gid, [])})
            assert len(old_place.get(gid, [])) == len(new_place.get(gid, [])) == 1
            actual_moves.add((gid, name, old_place[gid][0][-1], new_place[gid][0][-1]))
    rb, ra = roles(before), roles(after)
    learn_b = set().union(*rb.values())
    learn_a = set().union(*ra.values())
    learn_b |= set().union(*(prereqs(gid) for gid in learn_b))
    learn_a |= set().union(*(prereqs(gid) for gid in learn_a))
    saved = next(x for x in record["views"]["files"] if x["file"] == name)
    summary["views"].append({"file": name,
       "baseBlob": git("rev-parse", f"{BASE}:{p}").decode().strip(),
       "headBlob": git("rev-parse", f"{HEAD}:{p}").decode().strip(),
       "previousBlob": git("rev-parse", f"{OLD}:{p}").decode().strip(),
       "identicalToPrevious": blob(HEAD, p) == blob(OLD, p),
       "recordBeforeShaMatches": saved["beforeSha256"] == hashlib.sha256(blob(BASE, p)).hexdigest(),
       "recordAfterShaMatches": saved["afterSha256"] == hashlib.sha256(blob(HEAD, p)).hexdigest(),
       "rolesEqual": rb == ra, "learningEqual": learn_b == learn_a,
       "preparationMoves": moves})
    if name.startswith("de-he-sekii"):
        b = plan_atoms(before, "physics-e2-newton-and-conservation")
        a = plan_atoms(after, "physics-e2-newton-and-conservation")
        test_moved = {"eb0ffdea-c12d-56df-b7e8-c0297d2f8aff", "a42f91a4-0d21-5aa9-ae11-f48be6f2e431",
                      "594f7f21-6b8a-531c-8424-5f1dcbaf0f23", "9c328f68-41ed-55dd-9e02-34414a6246f2"}
        if after["scope"]["courseProfile"] == "LK":
            test_moved.add("e359f8bb-6106-44aa-9edf-694528d2d2a9")
        summary["plans"].append({"file": name, "beforeCount": len(b), "afterCount": len(a), "before": sorted(b), "after": sorted(a),
                                 "removed": sorted(b-a), "added": sorted(a-b), "testReconstructedSetEqualsPredecessor": a | test_moved == b})
summary["allHeadViewsIdenticalToPrevious"] = all(blob(HEAD, p) == blob(OLD, p) for p in files)
summary["preparationComparison"] = {"distinctGoals": len({x[0] for x in actual_moves}), "moves": len(actual_moves),
      "recordExactlyMatches": actual_moves == record_moves, "originalExactlyMatches": actual_moves == original_moves,
      "recordOnly": sorted(record_moves-actual_moves), "actualOnly": sorted(actual_moves-record_moves),
      "originalOnly": sorted(original_moves-actual_moves)}
math_ids = [x["goalId"] for x in record["preparationPlaces"]["goals"] if x["subject"] == "Mathematik"]
summary["mathDemand"] = []
for p in changed:
    view = doc(HEAD, p)
    if view["scope"]["courseProfile"] != "LK":
        continue
    for gid in math_ids:
        demands = defaultdict(list)
        for n, path in walk(view["rootNodes"]):
            if "physics-e-phase" not in path or "goalId" not in n or n.get("projectionRole", "target") != "target":
                continue
            for target in atoms(n["goalId"]):
                if gid in prereqs(target):
                    demands[path[path.index("physics-e-phase")+1]].append(target)
        summary["mathDemand"].append({"file": pathlib.Path(p).name, "goalId": gid,
                                     "places": acquisitions(view)[gid],
                                     "demandByTopicInEPhase": {k: sorted(set(v)) for k,v in demands.items()}})
(OUT / "measurement.actual.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"views": [{k:v for k,v in x.items() if k != "preparationMoves"} for x in summary["views"]],
                  "allHeadViewsIdenticalToPrevious": summary["allHeadViewsIdenticalToPrevious"],
                  "preparationComparison": summary["preparationComparison"],
                  "plans": [{k:v for k,v in x.items() if k not in ("before", "after")} for x in summary["plans"]]}, ensure_ascii=False, indent=2))
