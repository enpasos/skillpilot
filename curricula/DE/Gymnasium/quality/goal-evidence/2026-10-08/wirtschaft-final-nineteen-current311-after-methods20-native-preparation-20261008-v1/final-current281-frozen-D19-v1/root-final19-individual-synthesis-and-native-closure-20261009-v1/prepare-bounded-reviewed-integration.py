from pathlib import Path
import json, hashlib, copy, subprocess, datetime
root=Path.cwd()
base=Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-final-nineteen-current311-after-methods20-native-preparation-20261008-v1")
final=base/"final-current281-frozen-D19-v1"
out=final/"root-final19-individual-synthesis-and-native-closure-20261009-v1"
freeze=json.loads((final/"native-d-final19-current281.prepared-freeze.actual.successor-v2.json").read_text())
frame=Path(freeze["physicalIsolate"])
ids=set(freeze["newCandidateGoalIds"])
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def write(p,d): p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
def rows(p): return [json.loads(s) for s in Path(p).read_text().splitlines()]
assert len(ids)==19
core=[
"curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json",
"curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1/wirtschaftswissenschaften.semantic-kinds.json",
"curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json",
"curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_wirtschaft_und_recht_source_extraction_to_canonical_wirtschaft.review.json",
"curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json",
"curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json",
"app/scripts/config/goal-books/de-gym-economics-current-canonical.json",
"curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json"]
assert sha(core[0])=="0de09ec57ccc03c9ffd108d70c34dc299282208cbd2ac72091ae1e3c798cb020"
assert sha(core[1])=="af18b2c88f6844ec37e1035feb4158cf26a2971d2fcda839e837ac98a4d64890"
assert sha(core[2])=="29d752ff8b5b9a79ea96cac9c3bce8fe1e83cc988738a68b20ea829ccb5879f0"
assert sha(core[5])=="0070b2960b06631546b6efc48d97b0e27c23a69c6e006d99cb571a7d05ddfe33"
assert sha(core[6])=="3a34a4fff3401ca4fa5bd1465753b96d29bb8db6c6a22f58784e3b4624d4d4d4"
assert sha(core[3])=="2fc953519865b0cfc1ef934b6964b70a678dd982ae473cff8dbb8f9a53c79211"
assert sha(core[4])=="d2dc08524e33d419d0c5c38c2cc43432c880062680acf70c1a8f3c05bb0149eb"
for row in freeze["byteExactReturnedNativeFiles"]:
 for prefix in [root,frame]: assert sha(prefix/row["path"])==row["sha256"].removeprefix("sha256:")
impact=read(final/"actual-whole-current311-impact-against-current281.json")
strict=set(impact["currentStrictGoalIds"]);assert len(strict)==281 and not (strict&ids)
native=final/"native-d-final19-ordered-final-v2"
a=rows(next((native/"round-a/results").glob("*.records.jsonl")));b=rows(next((native/"round-b/results").glob("*.records.jsonl")))
assert {r["goalId"] for r in a}==ids=={r["goalId"] for r in b}
assert all(r["decision"]=="keep" and r["reviewAuthority"]=="ai_candidate" and r["recordStatus"]=="candidate" and r["evidenceProfileRecommendation"]=="none" for r in a+b)
index=read(native/"resolution-index.json");assert len(index["resolutions"])==19 and all(r["strictDescriptionComplete"] for r in index["resolutions"])
commands=read(out/"actual-native-commands/actual-completed-commands.json")
assert len(commands)==7
for c in commands:assert c["actualExitCode"]==0 and sha(c["outputPath"])==c["outputSha256"]
staged={}
comparisons={}
for path,key,identity,unchanged in [(core[0],"goals","id",370),(core[1],"decisions","goalId",370),(core[2],"records","goalId",292)]:
 old=read(path);new=read(frame/path);assert {k:v for k,v in old.items() if k!=key}=={k:v for k,v in new.items() if k!=key}
 om={r[identity]:r for r in old[key]};nm={r[identity]:r for r in new[key]};assert om.keys()==nm.keys()
 changed={gid for gid in om if om[gid]!=nm[gid]};assert changed==ids
 assert len(om)-len(changed)==unchanged,(path,len(om))
 staged[path]=copy.deepcopy(old);staged[path][key]=[nm[r[identity]] if r[identity] in ids else r for r in old[key]]
 assert staged[path]==new
 comparisons[path]={"changedGoalIds":sorted(changed),"otherWholeObjectsUnchanged":unchanged,"topLevelMetadataUnchanged":True}
for path in core[3:5]:
 old=read(path);new=read(frame/path)
 if path==core[3]:
  assert len(old["mappings"])==len(new["mappings"]) and len(old["decisions"])==len(new["decisions"])
  assert sum(x!=y for x,y in zip(old["mappings"],new["mappings"]))==2
  assert sum(x!=y for x,y in zip(old["decisions"],new["decisions"]))==2
  assert old["summary"]["exactMappings"]-2==new["summary"]["exactMappings"] and old["summary"]["partialMappings"]+2==new["summary"]["partialMappings"]
  assert {k:v for k,v in old.items() if k not in ["summary","mappings","decisions"]}=={k:v for k,v in new.items() if k not in ["summary","mappings","decisions"]}
 else:
  assert {k:v for k,v in old.items() if k!="sourceExtractionPath"}=={k:v for k,v in new.items() if k!="sourceExtractionPath"}
  assert (root/new["sourceExtractionPath"]).exists()
 staged[path]=new
registry=read(core[5]);newreg=copy.deepcopy(registry);subject=next(s for s in newreg["subjects"] if s["subject"]=="wirtschaftswissenschaften")
indexpath=str(native/"resolution-index.json");ppath=str(base/"positive.config.json")
assert indexpath not in subject["resolutionIndexPaths"] and ppath not in subject["positiveEvidenceConfigPaths"]
subject["resolutionIndexPaths"].append(indexpath);subject["positiveEvidenceConfigPaths"].append(ppath)
oldam=subject["semanticAtomicityConfigPath"];oldmem=subject["memoryReviewConfigPath"]
subject["semanticAtomicityConfigPath"]=str(base/"atomicity.config.json");subject["memoryReviewConfigPath"]=str(base/"memory.config.json")
for kind,oldconfig,newconfig in [("atomicity",oldam,subject["semanticAtomicityConfigPath"]),("memory",oldmem,subject["memoryReviewConfigPath"])]:
 oldconf=read(oldconfig);newconf=read(newconfig);oldrows={r["goalId"]:r for r in rows(oldconf["reviewPath"])};newrows={r["goalId"]:r for r in rows(newconf["reviewPath"])}
 assert len(oldrows)==311==len(newrows);assert oldrows.keys()==newrows.keys()
 assert all(oldrows[g]==newrows[g] for g in oldrows if g not in ids)
 assert {g for g in oldrows if oldrows[g]!=newrows[g]}==ids
 comparisons[kind]={"independentlyReviewedCurrentGoalRows":19,"other292WholeRowsExact":True}
 if kind=="memory":
  assert sha(oldconf["cardReviewPath"])==sha(newconf["cardReviewPath"])
  assert oldconf["visibilityScopes"]==newconf["visibilityScopes"]
  assert len(rows(oldconf["cardReviewPath"]))==52
for old,new in zip(registry["subjects"],newreg["subjects"]):
 if old["subject"]!="wirtschaftswissenschaften":assert old==new
staged[core[5]]=newreg
book=read(core[6]);newbook=copy.deepcopy(book);evidence=read(base/"positive.config.json")["reviewPath"];assert evidence not in newbook["evidenceReviewPaths"];newbook["evidenceReviewPaths"].append(evidence)
assert newbook["publicationMode"]=="review";staged[core[6]]=newbook
p=rows(evidence);assert len(p)==19 and {r["goalId"] for r in p}==ids
assert all(r["profileRuleVersion"]=="positive-understanding-evidence-v2" and r["status"]=="needs_human_review" and r["reviewAuthority"]=="ai_candidate" and r["evidenceLevel"]=="E1" and r["maximumClaimScope"]=="G1" and len(r["profile"]["applicationCaseBriefs"])==2 for r in p)
assets=read(base/"actual-native-19-exact-prompts-three-PNG-CurrentAIHash-bindings.json")["rows"];assert len(assets)==19
copies=[]
for row in assets:
 assert row["goalId"] in ids and row["currentNativeAiApproval"] and row["humanApproved"] is False
 for binding in row["actualWholePNGPaths"]+[{"path":row["promptNativePath"],"sha256":row["promptNativeWholeSha256"]}]:
  path=binding["path"];expected=binding["sha256"].removeprefix("sha256:");assert sha(frame/path)==expected
  if (root/path).exists():assert sha(root/path)==expected,("preserve existing different asset",path)
  copies.append({"path":path,"sourcePath":str(frame/path),"sha256":expected,"existingRootSameBytes":(root/path).exists()})
protected=[]
for s in registry["subjects"]:
 if s["subject"] in ["mathematik","physik"]:
  for field in ["landscapePath","semanticKindLedgerPath","visualizationQaPath"]:
   path=s[field];current=(root/path).read_bytes();head=subprocess.run(["git","show","HEAD:"+path],check=True,capture_output=True).stdout;assert current==head
   protected.append({"path":path,"sha256":sha(path)})
assert len(protected)==6
ledger=read(core[7]);assert len(ledger["activeBatchConfigPaths"])==7
claim=str(final/"native-d-final19.ordered.final.batch.successor-v2.config.json")
assert claim not in ledger["activeBatchConfigPaths"]
for path in ledger["activeBatchConfigPaths"]:
 conf=read(path);assert not (set(conf["goalIds"])&ids)
guards=[{"path":path,"sha256":sha(path)} for path in core]
for path,data in staged.items():write(out/"staged"/path,data)
receipt={"schemaVersion":1,"preparedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"role":"root actual targeted reviewed integration preflight, no live writes yet","current311AtomicGoals":311,"strictBefore":281,"expectedStrictAfter":300,"newSubstantiveClosuresExpected":19,"restoredPreviouslyInvalidStrictClosures":0,"unchanged281CurrentStrictGoalIds":sorted(strict),"onlyAffectedGoalIds":sorted(ids),"wholeObjectComparisons":comparisons,"currentIndependentRecordsRead":38,"individualBilingualRootSynthesis":str(native/"synthesis-authoring.json"),"nativeSevenCommandsAllActuallyPassed":True,"immutableOriginalInputBindings":56,"guardedBeforeInputs":guards,"stagedWholeFiles":[{"path":path,"stagedPath":str(out/"staged"/path),"sha256":sha(out/"staged"/path)} for path in staged],"assetsToCopy":copies,"protectedMathPhysics":protected,"activeForeignLedgerClaims":ledger["activeBatchConfigPaths"],"ownClaimPath":claim,"humanReleaseAndTrialRemainSeparatePending":True,"relevantBerlinAndRouteBlockersStillOpen":True,"M7Achieved":False}
write(out/"actual-reviewed-final19-integration-preflight.json",receipt)
print(json.dumps({"preflight":str(out/"actual-reviewed-final19-integration-preflight.json"),"sha256":sha(out/"actual-reviewed-final19-integration-preflight.json"),"stagedFiles":len(staged),"assetCopies":len(copies),"expectedStrict":300}))

