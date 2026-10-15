import json,sys,hashlib,datetime
from pathlib import Path
A=Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1")
R=Path(__file__).parent
cases=json.loads((A/"materials/thirty-complete-DE-EN-cases.author.json").read_text())["cases"]
profiles=[json.loads(x) for x in (A/"candidate/fifteen-profiles.raw-E0G0.author.jsonl").read_text().splitlines()]
idx=int(sys.argv[1])-1
cs=cases[2*idx:2*idx+2]; p=profiles[idx]
common=["provenance","imageDependency","evidenceBoundary","futureObservationRecord","independenceConditions"]
if idx==0: print("COMMON CASE FIELDS",json.dumps({k:cs[0][k] for k in common},ensure_ascii=False))
for c in cs:
 for k in common:
  assert c[k]==cases[0][k], (c["caseId"],k)
 print("COMPLETE CASE with exact common fields referenced to lab15-01-a",json.dumps({k:v for k,v in c.items() if k not in common},ensure_ascii=False))
# The profile is decoded whole. Repeated task/solution/variation values are shown by exact equality references.
q=json.loads(json.dumps(p)); z=q["profile"]
for b,c in zip(z["applicationCaseBriefs"],cs):
 for lang,suf in [("de","De"),("en","En")]:
  for key,casekey in [("expectedPerformance","expectedReasoningAndSolution")]:
   assert b[key+suf]==c[casekey][lang]
   b[key+suf]="EXACT_REPEATED_CASE_FIELD "+c["caseId"]+"/"+casekey+"/"+lang
  assert b["taskDemand"+suf].endswith(c["actualTask"][lang]);b["taskDemand"+suf]="EXACT_TASK_PREFIX_AND_CASE_FIELD "+c["caseId"]+"/actualTask/"+lang
  assert b["understandingFocus"+suf].endswith(c["freshIndependentTransfer"][lang]);b["understandingFocus"+suf]="EXACT_BOUND_HASH_PREFIX_AND_CASE_FIELD "+c["caseId"]+"/freshIndependentTransfer/"+lang
for e in z["expectations"]:
 for lang,suf in [("de","De"),("en","En")]:
  vals=[next(x for x in c["criterionToObservableRubric"] if x["expectationId"]==e["id"])["criterionAndObservable"][lang].split(":",1)[1].lstrip() for c in cs]
  assert e["observablePerformance"+suf]==" ".join(vals)
  e["observablePerformance"+suf]="EXACT_JOIN_OF_BOTH_CASE_RUBRICS "+e["id"]+"/"+lang
for lang,suf in [("de","De"),("en","En")]:
 assert z["variationAxes"][0]["text"+suf]==" ".join(c["freshIndependentTransfer"][lang] for c in cs)
 z["variationAxes"][0]["text"+suf]="EXACT_JOIN_OF_BOTH_FRESH_TRANSFERS "+lang
print("COMPLETE RAW PROFILE with audited exact repeated fields",json.dumps(q,ensure_ascii=False))
log={"unit":idx+1,"goalId":p["goalId"],"timestampUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"completeCaseIds":[c["caseId"] for c in cs],"rawProfileReviewId":p["reviewId"],"displayMethod":"Complete non-redundant bilingual text; shared fields and exact repeated profile fields decoded and checked by equality, then referenced, not paraphrased.","profilesDecodedWhole":True}
with (R/"READ.units.actual.jsonl").open("a") as f:f.write(json.dumps(log)+"\n")
