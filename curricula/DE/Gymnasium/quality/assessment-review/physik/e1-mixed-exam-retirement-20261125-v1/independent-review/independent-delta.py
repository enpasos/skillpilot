"""Recompute the retirement diff and offered exam witnesses from the two Git trees."""
import json
import subprocess
from collections import defaultdict
from copy import deepcopy

BASE = "3e6af47aec2f7f3046c316e8d4981858b943c4a6"
HEAD = "e36e7579f89a108a17d87e7010449fe2d4cae3ab"
MIXED = "a9562b05-c54d-5635-9244-3f7dd24a8642"
ROOT = "curricula/DE/Gymnasium/"
CAT = ROOT + "canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json"
VIEWS = ROOT + "composition-views/physik/"
MATERIAL = ROOT + "materials/physics/he-e1-motion-practice.json"
KINDS = ROOT + "quality/release-model/physik.semantic-kinds.json"
MEMBERSHIPS = "scripts/generate_laender_physics_stage_views.memberships.json"

def git(*args):
    return subprocess.check_output(["git", *args])

def read(ref, path):
    return json.loads(git("show", ref + ":" + path))

def changed(a, b):
    return sorted(k for k in a.keys() | b.keys() if a.get(k) != b.get(k) or (k in a) != (k in b))

def indexed(rows, key):
    result = {r[key]:r for r in rows}
    assert len(result) == len(rows)
    return result

catalogs = [read(ref, CAT) for ref in (BASE, HEAD)]
assert changed(*catalogs) == ["goals"]
old, new = [indexed(c["goals"], "id") for c in catalogs]
assert list(old) == list(new)
goals = {i: changed(old[i],new[i]) for i in changed(old,new)}
assert set(goals) == {MIXED, "424b07df-bf66-5d7f-99f5-f28b32ad1f22", "151edbf8-eb68-5ef7-8786-43e56a281b0b"}
assert goals[MIXED] == ["applicability", "extendedData"]
for i in goals.keys() - {MIXED}:
    assert goals[i] == ["contains"]
    assert [k for k in old[i]["contains"] if k != MIXED] == [k for k in new[i]["contains"] if k != MIXED]
assert not any(MIXED in g.get("requires",[]) for g in old.values())
def all_goals(ref, physics):
    result = dict(physics)
    files = git("ls-tree","-r","--name-only",ref,ROOT+"canonical/").decode().splitlines()
    for f in files:
        if f.endswith(".de.json") and f != CAT:
            for row in read(ref,f)["goals"]:
                assert row["id"] not in result
                result[row["id"]]=row
    return result
before_catalog,after_catalog=all_goals(BASE,old),all_goals(HEAD,new)
def projection(doc, catalog):
    # A direct entry is more specific than a subtree, followed by shortest
    # subtree distance and then target role in an otherwise equal tie.
    assignments = {}
    structures = set()

    def expand(goal_id, role, direct, depth):
        goal = catalog[goal_id]
        if not goal.get("contains"):
            rank = (direct, -depth, role == "target")
            if goal_id not in assignments or rank > assignments[goal_id][0]:
                assignments[goal_id] = (rank, role)
        elif not direct:
            for child in goal["contains"]:
                expand(child, role, False, depth + 1)

    def walk(node):
        if node["kind"] == "structure":
            structures.add(node["id"])
            for child in node["children"]:
                walk(child)
        else:
            assert node["kind"] in ("canonicalSubtree", "goalEntry")
            expand(node["goalId"], node.get("projectionRole", "target"), node["kind"] == "goalEntry", 0)

    for node in doc["rootNodes"]:
        walk(node)
    by_role = defaultdict(set)
    for goal_id, (_, role) in assignments.items():
        by_role[role].add(goal_id)
    return by_role, structures


def expected_view(before, path):
    result = deepcopy(before)
    national = path.endswith(("de-de-gym-sekii-physics-gk.view.json", "de-de-gym-sekii-physics-lk.view.json"))
    course_gk = path.endswith("de-de-gym-sekii-physics-gk.view.json")
    corrections = []
    acquisition = "physics-acquisition-" + MIXED
    topic = "physics-canonical-board-topic-physics-e-phase-230345f3-c360-4963-b390-ab94e3e2c864"

    def visit(node):
        if node.get("goalId") == MIXED:
            corrections.append("remove exam reference")
            return False
        if node.get("kind") != "structure":
            return True
        node["children"] = [child for child in node["children"] if visit(child)]
        if national and node["id"] == acquisition:
            assert not node["children"]
            corrections.append("remove empty acquisition structure")
            return False
        if national and node["id"] == topic:
            assert node.pop("childOrder") == {"after": []}
            corrections.append("remove empty sibling-order declaration")
        if course_gk:
            for edge in node.get("childOrder", {}).get("after", []):
                if (edge["unit"] == "physics-canonical-board-topic-physics-e-phase-82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3"
                        and edge["after"] == "physics-acquisition-761a0879-fc15-5d0c-a2b7-2b439efecd5b"):
                    edge["after"] = "physics-acquisition-82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3"
                    corrections.append("update GK generated predecessor")
        return True

    result["rootNodes"] = [node for node in result["rootNodes"] if visit(node)]
    return result, corrections


witnesses = ["de1ed3f0", "6345871e", "bcc56921", "f41e4e30", "dfd2628f", "3791c574",
             "dd99528a", "7c0b94b9", "f13ca187", "a8dc0290"]
def learning_set(roles, goals):
    found = set().union(*roles.values())
    pending = list(found)
    while pending:
        current = pending.pop()
        for reference in goals[current].get("requires", []):
            goal_id = reference.rsplit(":", 1)[-1]
            assert goal_id in goals, (current, goal_id)
            if goal_id not in found:
                found.add(goal_id)
                pending.append(goal_id)
    return found


paths=git("ls-tree","-r","--name-only",BASE,VIEWS).decode().splitlines()
assert paths==git("ls-tree","-r","--name-only",HEAD,VIEWS).decode().splitlines()
placements = {}
delta={};same=[];offered=defaultdict(lambda:defaultdict(list))
for p in paths:
    if not p.endswith(".view.json"):continue
    a,b=[git("show",r+":"+p) for r in (BASE,HEAD)]; da,db=map(json.loads,(a,b))
    (pa,sa),(pb,sb)=projection(da,before_catalog),projection(db,after_catalog)
    key=db["viewId"]
    expected, operations = expected_view(da,p)
    assert expected == db, key
    assert MIXED not in pb["prerequisiteOnly"]
    assert not (pb["target"] - pa["target"])
    assert pa["prerequisiteOnly"]==pb["prerequisiteOnly"]
    assert MIXED not in pb["target"]
    assert pa["target"]-pb["target"] == ({MIXED} if a!=b else set())
    placements[key] = (pa["target"], pb["target"])
    before_learning = learning_set(pa, before_catalog)
    after_learning = learning_set(pb, after_catalog)
    assert before_learning - after_learning == ({MIXED} if a != b else set())
    assert not after_learning - before_learning
    if a != b:
        delta[key] = {"removedStructures": sorted(sa - sb), "addedStructures": sorted(sb - sa),
                      "operations": operations,
                      "learningSetBefore": len(before_learning), "learningSetAfter": len(after_learning)}
    else:
        same.append(key)
    for i in pb["target"]:
        if i[:8] in witnesses:offered[i[:8]][db["scope"].get("jurisdiction","national")].append(key)
assert (len(delta),len(same)) == (64,26)
def all_offers(prefix):
    return {view for values in offered[prefix].values() for view in values}

for witness in ("de1ed3f0", "6345871e", "bcc56921", "7c0b94b9", "3791c574"):
    assert not set(delta) - all_offers(witness), witness
assert not set(delta) - (all_offers("a8dc0290") | all_offers("f13ca187"))
mat0,mat1=[read(ref,MATERIAL) for ref in (BASE,HEAD)]
assert mat0["unit"].pop("assessmentGoalId")==MIXED and mat0==mat1
k0,k1=[read(ref,KINDS) for ref in (BASE,HEAD)]
assert changed(k0,k1)==["decisions"]
sk0,sk1=[indexed(k["decisions"],"goalId") for k in (k0,k1)]
assert list(sk0)==list(sk1) and changed(sk0,sk1)==sorted(goals)
assert all(changed(sk0[k],sk1[k])==["sourceFingerprint"] for k in goals)
m0,m1=[read(ref,MEMBERSHIPS) for ref in (BASE,HEAD)]
def diff_membership(a,b,path):
    if a==b:return []
    if isinstance(a,list):
        assert a.count(MIXED)==1 and [v for v in a if v!=MIXED]==b
        return [path]
    assert isinstance(a, dict) and isinstance(b, dict) and a.keys() == b.keys()
    return [q for k in a for q in diff_membership(a[k],b[k],path+"/"+k)]
memberships=diff_membership(m0,m1,"")
assert len(memberships)==4
hessian=git("diff","-U0",BASE,HEAD,"--","scripts/generate_hessen_physics_stage_views.py").decode().splitlines()
line_changes=[l for l in hessian if l.startswith(("+","-")) and not l.startswith(("---","+++"))]
assert len(line_changes)==3 and all(l.startswith("-") for l in line_changes) and sum(MIXED in l for l in line_changes)==1
def named_exams(goal_id, targets):
    return {exam for exam in targets if exam in new and new[exam].get("examData") and
            (goal_id in new[exam].get("requires", []) or
             goal_id in new[exam]["examData"].get("coveredGoalIds", []))}

claims = {}
for goal_id in old[MIXED]["examData"]["coveredGoalIds"]:
    if new[goal_id]["contains"]:
        continue
    views = {view_id: pair for view_id, pair in placements.items() if goal_id in pair[1]}
    offered_with_relation = defaultdict(list)
    no_link = []
    lost_only_prerequisite = []
    newly_no_link = []
    for view_id, (old_targets, targets) in views.items():
        alternatives = named_exams(goal_id, targets)
        for exam in sorted(alternatives):
            offered_with_relation[exam].append(view_id)
        if not alternatives:
            no_link.append(view_id)
            if MIXED in old_targets:
                newly_no_link.append(view_id)
        if MIXED in old_targets and goal_id in old[MIXED]["requires"]:
            if not any(goal_id in new[e].get("requires", []) for e in alternatives):
                lost_only_prerequisite.append(view_id)
    claims[goal_id] = {
        "targetViews": len(views), "otherListedExamsInGoalTargetViews": offered_with_relation,
        "viewsWithNoRemainingNamedExam": no_link, "newlyWithoutNamedExam": newly_no_link,
        "viewsLosingOnlyExamNamingGoalAsPrerequisite": lost_only_prerequisite}
print(json.dumps({"base":BASE,"head":HEAD,"namedExamCoverageByGoalTargetView":claims,"changedGoals":goals,"viewsRemovedMixed":delta,"byteIdenticalViews":same,"activeWitnessesByJurisdictionAndView":offered,"materialRemoved":"/unit/assessmentGoalId","semanticKindFingerprints":sorted(goals),"membershipRemovals":memberships,"hessianPlacementLinesRemoved":line_changes},indent=2,ensure_ascii=False,sort_keys=True))
