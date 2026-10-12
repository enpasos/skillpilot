import json,sys
from pathlib import Path
P=Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2/sources/ALL32.raw-mapping-decisions-sourceGoals-occurrences-passages.selected11.json")
D=json.loads(P.read_text()); SEEN={}
PACKETS=[]
for si,source in enumerate(D["sources"]):
 rows=[(i,r) for i,r in enumerate(D["rows"]) if r["mappingPath"]==source["mappingPath"]]
 lits=[]; scopes=[]
 for ri,r in rows:
  scope={"originalRowIndex":ri,"mappingDecisionIndex":r["mappingDecisionIndex"],"rawDecision":r["rawMappingDecision"],"selectedContributions":r["selectedGoalContributions"]}
  scope["rawDecision"]={k:v for k,v in scope["rawDecision"].items() if k not in ["rationale","reviewer","reviewedAt"]}
  for typ,ob in [("wholeSourceGoal",r["wholeSourceGoal"]),*[("wholePassage",p) for p in r["wholePassages"]],*[("occurrence",p) for p in r["allSourceOccurrences"]]]:
   out={k:v for k,v in ob.items() if k not in ["title","description","sourceText","rawSourceText","parentBulletText","rawParentBulletText","rawText","text"]}
   for k,v in ob.items():
    if k in ["title","description","sourceText","rawSourceText","parentBulletText","rawParentBulletText","rawText","text"] and isinstance(v,str):
     if v in SEEN: out[k+"ExactLiteralReference"]=SEEN[v]
     else:
      key=f"source{si}:row{ri}:{typ}:{k}";SEEN[v]=key;lits.append({"literalId":key,"literal":v});out[k+"ExactLiteralReference"]=key
   scope.setdefault(typ,[]).append(out)
  scopes.append(scope)
 PACKETS.append({"sourceIndex":si,"sourceMetadata":source,"scopes":scopes,"wholeLiteralTextsFirstOccurrence":lits})
for i in map(int,sys.argv[1:]):
 p=PACKETS[i];sm=p["sourceMetadata"]
 print("SOURCE",i,sm["jurisdiction"],sm["stage"],sm["mappingPath"],sm["sourceExtractionPath"],"selected:",sm["selectedRawDecisionIndices"])
 for sc in p["scopes"]:
  g=sc["wholeSourceGoal"][0];d=sc["rawDecision"]
  print("ROW",sc["originalRowIndex"],"INDEX",sc["mappingDecisionIndex"],"SRC",d.get("sourceGoalId"),"LEVEL",g.get("courseLevel"),"GOALS",[v[:8] for v in d.get("canonicalGoalIds",[])],"SELECTED",[(v["goalId"][:8],v.get("role")) for v in sc["selectedContributions"]])
  print("SPAN:",d.get("sourceSpan"))
 for li in p["wholeLiteralTextsFirstOccurrence"]:
  if li["literalId"].endswith("wholeSourceGoal:description") and li["literal"].startswith("Die lernende Person kann ") and li["literal"].endswith(" fachlich einordnen und anwenden."): continue
  print(li["literalId"],li["literal"])
