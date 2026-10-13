import json,pathlib,sys
b=pathlib.Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers-three-visual-Pscope-atomicity-author-successor-20261013-v3")
goals=json.loads((b/"selected20.resource-only-future-tuples.inactive.json").read_text())["goals"]
cases=json.loads((b/"whole40.expanded-cases.author-successor.json").read_text())["cases"]
profiles=json.loads((b/"whole20.profile-payloads.author-successor.json").read_text())["profiles"]
ids=[json.loads(x)["goalId"] for x in (b/"reviewable18.normal-v2.author-successor.jsonl").read_text().splitlines()]
for ix in range(int(sys.argv[1]),int(sys.argv[2])):
 gid=ids[ix];g=next(x for x in goals if x["id"]==gid);cs=[x for x in cases if x["goalId"]==gid];p=next(x for x in profiles if x["goalId"]==gid)["profile"]
 print("GOAL",ix,json.dumps({k:v for k,v in g.items() if k not in ("resourceLinks","extendedData","dimensionTags","applicability")},ensure_ascii=False,separators=(",",":")))
 for c in cs:
  print("CASE",json.dumps({k:v for k,v in c.items() if k not in ("rubric","expectationCoverage","goalId","dataOrigin","languageParity","executionClaim","gradingBoundary","visualizationRequired")},ensure_ascii=False,separators=(",",":")))
  for r in c["rubric"]:
   assert r["criterionDe"]=="Zeigt fallbezogen: "+r["fullCreditDe"] and r["criterionEn"]=="Demonstrates for this case: "+r["fullCreditEn"]
   print("RUBRIC",json.dumps({k:v for k,v in r.items() if k in ("expectationId","maximumPoints","fullCreditDe","fullCreditEn")},ensure_ascii=False,separators=(",",":")))
  assert all(x["fullWholeExpectationClaim"] is False for x in c["expectationCoverage"])
 print("PROFILE",json.dumps({k:v for k,v in p.items() if k!="applicationCaseBriefs"},ensure_ascii=False,separators=(",",":")))
 for bf in p["applicationCaseBriefs"]:
  c=next(c for c in cs if c["caseId"]==bf["id"])
  for d,e in [("taskDemandDe","taskDe"),("taskDemandEn","taskEn"),("expectedPerformanceDe","modelAnswerDe"),("expectedPerformanceEn","modelAnswerEn")]:assert bf[d]==c[e]
  for lang,prefix,suffix in [("De","Fallbezogene Aspekte: "," Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall."),("En","Case-specific aspects: "," Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.")]:
   assert bf["understandingFocus"+lang]==prefix+" / ".join(r["fullCredit"+lang] for r in c["rubric"])+suffix
  print("BRIEF_EXACT_REUSE_PROOF",bf["id"],"task/modelAnswer/rubricFocus all exact")
