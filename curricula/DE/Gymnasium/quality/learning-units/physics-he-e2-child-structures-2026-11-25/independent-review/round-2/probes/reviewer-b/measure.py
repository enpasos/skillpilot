"""Check the E.2 cut using exact Git objects and the four old plan captures."""
from collections import defaultdict
from functools import cache
from pathlib import Path
import hashlib
import json
import re
import subprocess

OLD = "19c14af91e"
NEW = "4f963b4b78"
V1 = "a88f17523b"
ROOT = "curricula/DE/Gymnasium/"
VIEWS = ROOT + "composition-views/physik/"
RECORD = ROOT + "quality/learning-units/physics-he-e2-child-structures-2026-11-25/"
JAVA = "backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java"
E2 = "physics-e2-newton-and-conservation"
E5 = "he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089"
def git(*args):
    return subprocess.check_output(["git",*args])

def read(rev, path):
    return json.loads(git("show", rev + ":" + path))

cat = {}
owners = {}
for path in git("ls-tree", "-r", "--name-only", NEW, ROOT+"canonical").decode().splitlines():
    if path.endswith(".de.json"):
        doc = read(NEW, path)
        cat.update({g["id"]:g for g in doc["goals"]})
        owners.update({g["id"]:doc["subject"] for g in doc["goals"]})

@cache
def atoms(goal):
    children = cat[goal].get("contains",[])
    if not children:
        return {goal}
    return set.union(*(atoms(c) for c in children))

@cache
def needs(goal):
    direct = {ref.split(":")[-1] for ref in cat[goal].get("requires",[])}
    return direct.union(*(needs(p) for p in direct))

def nodes(view):
    def walk(n, path):
        if n.get("id"):
            path = path + (n["id"],)
        yield path, n
        for child in n.get("children",[]):
            yield from walk(child,path)
    for node in view["rootNodes"]:
        yield from walk(node,())

def entries(view, section):
    return [(p,n) for p,n in nodes(view) if section in p and "goalId" in n and (n.get("projectionRole") != "prerequisiteOnly" or n.get("acquisitionPlacement"))]

def selected(view, section, course):
    scope = {i for _,n in entries(view,section) for i in atoms(n["goalId"])}
    return {i for i in scope if course in cat[i].get("tags",[]) or not ({"GK","LK"} & set(cat[i].get("tags",[])))}

def placements(view):
    result = {}
    for path,n in nodes(view):
        if n.get("acquisitionPlacement"):
            assert n["goalId"] not in result and n["projectionRole"]=="prerequisiteOnly"
            result[n["goalId"]] = path[-1]
    return result

out = {}
record = read(NEW,RECORD+"regrouping.actual.json")
structure = read(NEW,RECORD+"independent-review/structure.actual.json")
files = git("diff","--name-only",OLD,NEW,"--",VIEWS).decode().splitlines()
assert len(files)==8
assert not git("diff","--name-only",V1,NEW,"--",VIEWS)
assert not git("diff","--name-only","948f2a419d",OLD,"--",VIEWS)
assert not git("diff","--name-only","948f2a419d",NEW,"--",ROOT+"canonical")
out["trees"] = {rev:git("rev-parse",rev+":"+VIEWS[:-1]).decode().strip() for rev in (OLD,NEW,V1,"948f2a419d")}
out["moves"] = []
out["mathDemand"] = {}
math = {g["goalId"] for g in record["preparationPlaces"]["goals"] if g["subject"]=="Mathematik"}
for path in files:
    file = Path(path).name
    before, after = (read(rev,path) for rev in (OLD,NEW))
    left, right = placements(before),placements(after)
    assert set(left)==set(right)
    moves = [[file,i,left[i],right[i]] for i in sorted(left) if left[i]!=right[i]]
    out["moves"] += moves
    if "-lk" not in file: continue
    demands = defaultdict(lambda:defaultdict(set))
    for p,n in entries(after,"physics-e-phase"):
        if n.get("projectionRole")=="prerequisiteOnly":continue
        for goal in atoms(n["goalId"]):
            for prep in math & needs(goal):
                demands[prep][p[p.index("physics-e-phase")+1]].add(goal)
    assert set(demands)==math
    assert all(set(places)=={E5} for places in demands.values())
    out["mathDemand"][file] = {prep:[{"id":i,"title":cat[i]["title"],"exam":bool(cat[i].get("examData"))} for i in sorted(places[E5])] for prep,places in sorted(demands.items())}
reported = [[v["file"],g["goalId"],v["from"],v["to"]] for g in record["preparationPlaces"]["goals"] for v in g["views"]]
history = [[Path(v["file"]).name,g["id"],g["before"][0][-1],g["after"][0][-1]] for v in structure["changed"] for g in v["acquisitionPlacementMoves"]]
assert sorted(reported)==sorted(out["moves"])==sorted(history)
assert len(reported)==30
suite = git("show",NEW+":"+JAVA).decode().split("void planStoredForForcesBeforeTheCutKeepsTheGravitationGoals")[1]
fragment = suite[suite.index("var moved ="):suite.index("assertThat(currentSection)")]
fixture = re.findall(r'"([0-9a-f]{8}-[0-9a-f-]{27})"',fragment)
out["plans"] = {}
for course in ["GK","LK"]:
    path = VIEWS+f"de-he-sekii-{course.lower()}.view.json"
    oldset,newset = (selected(read(rev,path),E2,course) for rev in (OLD,NEW))
    delta=set(fixture if course=="LK" else fixture[:-1])
    assert oldset - newset == delta and not (newset - oldset)
    assert len(oldset)==32
    captures={}
    for pilot in ["false","true"]:
        cap=read(NEW,RECORD+f"independent-review/reviewer-b/captured-{course}-{pilot}.json")
        b=json.loads(cap["storedBlockJson"])[0]
        assert len(b["atomicGoalIds"])==len(set(b["atomicGoalIds"]))==32
        assert set(b["atomicGoalIds"])==oldset==set(cap["scope"])
        assert b["startDate"]==b["endDate"]=="2026-11-23"
        assert cap["revision"]==1 and not cap["staleAtCapture"]
        assert b["goalIds"]==[b["goalId"]] and E2 in b["goalId"]
        captures[pilot]={"rawBlockSha256":hashlib.sha256(cap["storedBlockJson"].encode()).hexdigest(),"scopeFingerprint":cap["scopeFingerprint"],"date":b["startDate"]}
    assert captures["false"]==captures["true"]
    out["plans"][course]={"oldSorted":sorted(oldset),"newSorted":sorted(newset),"movedSorted":sorted(delta),"matchedCapturedSet":True,"captures":captures}
out["testNextEligibleMoved"]={i:sorted(needs(i)&set(fixture)) for i in fixture}
examids={i for i in cat if i.startswith(("22561c66","72649cf5"))}
assert not any(examids & set(g.get("requires",[])) for g in cat.values())
out["basicCourseOnlyExams"]={i:{"title":cat[i]["title"],"tags":cat[i]["tags"],"canonicalDependents":[]} for i in sorted(examids)}
oldNative = read(NEW,RECORD+"independent-review/reviewer-b/coach.actual.json")
parent = next(v for k,v in oldNative.items() if k.startswith("parent-"))
gravity = fixture[0]
frontierCases = [dict(course=x["course"],pilot=x["pilot"],gravityInE2Frontier=gravity in x["e2Frontier"]) for x in parent["REVIEWB"] if x["case"]=="none"]
assert len(frontierCases)==4 and all(x["gravityInE2Frontier"] for x in frontierCases)
out["predecessorPublicStart"] = [dict(course=x["course"],pilot=x["pilot"],regularAction=x["reconciledAction"],selectActiveGoal=x["resumeByChoosingInOriginalFocus"]) for x in parent["REVIEWBPLAN"]]
out["predecessorE2Frontier"] = frontierCases
assert len(out["predecessorPublicStart"])==4 and all(x["selectActiveGoal"]=="ok" for x in out["predecessorPublicStart"])
out["cards"]={}
for lang in ["de","en"]:
    deck=read(NEW,ROOT+f"memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.{lang}.json")
    origins={g["goalId"]:[] for g in record["movedToE5"]}
    for card in deck["cards"]:
        for i in set(card.get("originGoalIds",[])) & origins.keys():
            origins[i].append(card["id"])
    out["cards"][lang]=origins

Path(__file__).with_name("measure.actual.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
print([(course,len(p["oldSorted"]),len(p["newSorted"])) for course,p in out["plans"].items()])
print("Math demand sets", {tuple(x["id"][:8] for x in v) for d in out["mathDemand"].values() for v in d.values()})
print("Cards",out["cards"]["de"])
