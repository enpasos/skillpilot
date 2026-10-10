"""Finite current-source comparison: operative211, historical candidate217,220.

All inputs remain read-only; only this new independent package gets output.
"""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-source-adoption-technical-successor-20261010-v1"


def read(path):
    return json.loads(Path(path).read_text())


def ref(path):
    data = Path(path).read_bytes()
    return {"path": Path(path).relative_to(ROOT).as_posix(),
            "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}


entry = read(AUTHOR / "neutral-three-BW-source-adoption.independent-review.entry.json")
current = read(OUT / "inputs/operative211.before.exact.review.json")
historic = read(ROOT / entry["original217Mapping"]["path"])
after = read(ROOT / entry["sourceSuccessor"]["path"])
key = lambda row: (row["legacyGoalId"], row["canonicalGoalId"])
base = {key(r): r for r in current["mappings"]}
middle = {key(r): r for r in historic["mappings"]}
future = {key(r): r for r in after["mappings"]}
assert len(base) == 211 and len(middle) == 217 and len(future) == 220
assert set(base) < set(middle) < set(future)
new6 = [r for r in historic["mappings"] if key(r) not in base]
new3 = [r for r in after["mappings"] if key(r) not in middle]
changes = [{"sourceGoalId":k[0],"canonicalGoalId":k[1],"before":base[k],"after":middle[k]}
           for k in base if base[k] != middle[k]]
assert len(new6) == 6 and len(new3) == 3 and len(changes) == 3
generic_ids = ["91238ba1-5c63-50c7-a4fd-9bbe492c6b61", "49b13b33-34b7-5e4e-861c-b21082cb9922"]
assert {key(r) for r in new6} == {(s,g) for s in entry["sourceGoalIds"] for g in generic_ids}
assert all(r["matchType"] == "partial" and r["reviewDecisionId"] == r["legacyGoalId"] for r in new6)
for change in changes:
    before, later = change["before"], change["after"]
    assert before["matchType"] == "exact" and later["matchType"] == "partial"
    assert {k:v for k,v in before.items() if k!="matchType"} == {k:v for k,v in later.items() if k!="matchType"}
    assert before["legacyGoalId"] in entry["sourceGoalIds"]
assert all(future[k] == middle[k] for k in middle)
assert [r["matchType"] for r in new3] == ["partial","exact","exact"]
assert [(r["legacyGoalId"],r["canonicalGoalId"]) for r in new3] == list(zip(entry["sourceGoalIds"],entry["newGoalIds"]))
assert len(current["decisions"]) == len(after["decisions"]) == 126
changed_decisions=[]
for old, latest in zip(current["decisions"],after["decisions"]):
    assert old["sourceGoalId"] == latest["sourceGoalId"]
    if old["sourceGoalId"] not in entry["sourceGoalIds"]:
        assert old == latest
    else:
        changed_decisions.append({"sourceGoalId":old["sourceGoalId"],"before":old,"after":latest})
        assert old["decision"] == latest["decision"] == "mapped"
        assert old["canonicalGoalIds"][0] == latest["canonicalGoalIds"][0]
        assert set(old["canonicalGoalIds"]) < set(latest["canonicalGoalIds"])
        assert latest["matchType"] == "partial"
assert len(changed_decisions) == 3
proof={"schemaVersion":1,"role":"independent actual operative-base source delta; distinct from prior217 transport FIRST",
       "inputBindings":[ref(OUT/"inputs/operative211.before.exact.review.json"),entry["original217Mapping"],entry["sourceSuccessor"]],
       "operativeBasePartnerCount":211,"historicalInactiveCandidatePartnerCount":217,"candidatePartnerCount":220,
       "unchanged208OriginalPartnerRowsExact":True,"all211OriginalPartnerIdentitiesRetained":True,
       "threeExistingExactToPartialCorrections":changes,"sixNewGenericPartialPartnerEdges":new6,
       "threeNewPracticalPartnerEdges":new3,"whole126DecisionInventoryPreserved":True,
       "other123WholeDecisionBodiesExact":True,"threeChangedWholeDecisions":changed_decisions,
       "author217IsNotActualOperativeBase":True,"actualExitCode":0,"activeWrites":0,"strictGain":0}
(OUT/"operative211-to-217-to-220.whole-delta.actual.json").write_text(json.dumps(proof,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"actualExitCode":0,"operativeBase":211,"historicalCandidate":217,"successor":220,
                  "unchangedPartnerRows":208,"typeDowngrades":3,"genericAddedPartial":6,"practicalAdded":3,
                  "allOriginalPartnerIdentitiesRetained":True,"other123WholeDecisionsExact":True},indent=2))
