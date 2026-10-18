from pathlib import Path
import json,sys
p=Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-retained-target42-explicit-own-acquisition-scope-author-20261017-v1/SCOPE42.whole-current-goals-profiles-and-112-explicit-acquisition-decisions.author.json")
rows=json.loads(p.read_text())["rows"]
for index in map(int,sys.argv[1:]):
 r=rows[index];g=r["wholeGoalBefore"]
 print("ROW",index,"GOAL",json.dumps({k:v for k,v in g.items() if k not in ["extendedData","resourceLinks"]},ensure_ascii=False))
 print("EXISTINGBOUNDS",json.dumps({k:v for k,v in g.get("extendedData",{}).items() if k not in ["provenance","historicalProvenanceBefore20261005Q1Candidate"]},ensure_ascii=False))
 print("SCOPES",json.dumps([(x["proposedExtension"]["jurisdiction"],[(v["stage"],v["courseProfile"]) for v in x["exactExistingViewBindings"]]) for x in r["jurisdictionDecisions"]]))
 print("PROFILE",json.dumps(r["wholeCurrentNativePositiveEvidence"]["profile"],ensure_ascii=False))
