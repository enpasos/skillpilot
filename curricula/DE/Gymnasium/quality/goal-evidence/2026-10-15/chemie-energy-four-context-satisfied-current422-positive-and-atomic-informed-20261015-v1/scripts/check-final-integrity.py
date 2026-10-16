from pathlib import Path
import json,hashlib,datetime,math
repo=Path('/home/enpasos/projects/skillpilot');E=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15';R=E/'chemie-energy-four-context-satisfied-current422-positive-and-atomic-informed-20261015-v1';D=E/'chemie-energy20-final-current422-native-fresh-independent-c-20261015-v1';Q=E/'chemie-energy-eleven-kept-current422-positive-and-atomic-informed-20261015-v1';B=E/'chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1';C=E/'chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1'
load=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();lines=lambda p:[json.loads(l) for l in p.read_text().splitlines() if l.strip()];rel=lambda p:str(p.relative_to(repo));bind=lambda p:{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
f=load(R/'science/FIRST.informed-P4-and-A4.original.json');assert sha(R/'science/FIRST.informed-P4-and-A4.original.json')=='sha256:0c0e920c2ca9942bf9e23755f33bdb04b0dc75b9fa1ab8009cdeb0d0834e3d33'
sealed=[]
for directory,name,digest in [(D,'FILES.finite-independent-c-D20.seal.json','sha256:e86cad7759a133a18c16459739ff392f040260b1c3bdb8825691ed8ce2929ad0'),(Q,'FILES.finite-informed-P11-A11.seal.json','sha256:9f242da664c646b6768f30bed7b939f4468533bfd7ec778d93f980930c0b23d8')]:
 s=directory/name;assert sha(s)==digest
 for item in load(s)['files']:
  p=repo/item['path'];assert sha(p)==item['sha256'] and p.stat().st_size==item['bytes'],p
 sealed.append({'seal':bind(s),'unchangedFiles':load(s)['fileCount']})
assert sha(B/'materials/forty-two-whole-DE-EN-cases.exact-no-change.json')=='sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe'
assert sha(B/'candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl')=='sha256:411286bce6bceb995523f8b4974291d0ebc3a53344805ac0cdd5904a8d23132c'
original=load(B/'materials/forty-two-whole-DE-EN-cases.exact-no-change.json')['cases'];om={c['id']:c for c in original};cases=load(R/'materials/four-whole-cases8.targeted-informed-successor.json')['cases'];assert len(original)==42 and len(cases)==8
expected=set(f['scopeGoalIds']);assert len(expected)==4 and {c['goalId'] for c in cases}==expected
assert expected.isdisjoint(set(load(Q/'science/FIRST.informed-P11-and-A11.original.json')['scopeGoalIds']))
changes=[]
for c in cases:
 assert set(c)==set(om[c['id']]) and not c['imageRequired']
 for k,v in c.items():
  if v!=om[c['id']][k]:changes.append({'caseId':c['id'],'field':k,'before':om[c['id']][k],'after':v})
assert changes==load(R/'materials/CAS.whole-case-fields.actual.json')['changes']
assert len(changes)==25 and len({c['caseId'] for c in changes})==5
prior=load(D/'FIRST.final-reaffirmed-after-source-closure20.json')['decisions'];dd=load(R/'science/OWN.original-D4-dissents.exact-preserved.json')['decisions'];assert dd==[next(d for d in prior if d['goalId']==i) for i in f['scopeGoalIds']] and all(d['decision']=='revise' for d in dd)
p4=lines(R/'normal/P4.final-current.image-bound.candidates.jsonl');a4=lines(R/'normal/A4.current-context.semantic-atomicity.candidates.jsonl');raw={r['goalId']:r for r in lines(B/'candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl')};assert len(p4)==4 and len(a4)==4 and {r['goalId'] for r in p4}=={r['goalId'] for r in a4}==expected
assert sum(r['profile']!=raw[r['goalId']]['profile'] for r in p4)==3
assert all(r['profile']==next(j['P']['profile'] for j in f['judgments'] if j['goalId']==r['goalId']) for r in p4)
assert all((r['status'],r['reviewAuthority'],r['evidenceLevel'],r['maximumClaimScope'])==('needs_human_review','ai_candidate','E1','G1') for r in p4)
assert all((r['status'],r['semanticAtomic'])==('atomic',True) for r in a4)
assert all(r['goalFingerprint']==raw[r['goalId']]['goalFingerprint'] and r['reviewInputFingerprint']==raw[r['goalId']]['reviewInputFingerprint'] for r in p4)
run=load(R/'normal/P4.final-informed.run.json');assert run['outputDigest']==sha(R/'normal/P4.final-current.image-bound.candidates.jsonl') and run['role']=='synthesizer' and run['blindToOtherRuns'] is False
bindings=load(R/'checks/P4.actual-native-resource-and-input-bindings.json');host=repo/bindings['sourceRoot'];assert len(bindings['entries'])==4 and all(b['originalNativeE0InputBindingPreserved'] for b in bindings['entries'])
for b in bindings['entries']:
 assert len(b['resourceDigests'])==1
 for url,digest in b['resourceDigests'].items():assert sha(host/'app/public'/url.lstrip('/'))==digest
canonical=load(C/'candidate/canonical560.current422.three-wording-four-alt.author.json');gm={g['id']:g for g in canonical['goals']};native=load(repo/load(B/'INPUTS.final-native20-v3.physical-selector.json')['wholeCanonical560']['path']);nm={g['id']:g for g in native['goals']};assert all(gm[i]==nm[i] for i in expected)
cache=load(Q/'checks/REBUILD.own-small-stock-PA-host.actual.json')
for item in cache['stockPhysicalFiles']:
 assert sha(repo/item['source'])==item['sha256'] and sha(host/item['normalAlias'])==item['sha256']
blank=load(R/'materials/future-observation-records8.explicitly-blank.json')['records'];assert len(blank)==8
for b in blank:assert not b['actualLearnerOrLaboratoryTrial'] and all(b[k] is None for k in ['observedAt','learnerResponseDe','learnerResponseEn','observedPerformance','assessorJudgment'])
for p in R.rglob('*.json'):load(p)
for p in R.rglob('*.jsonl'):lines(p)
checks=load(R/'checks/TARGETED.normal-PA.actual-results.json');assert len(checks['results'])==3 and all(c['exitCode']==0 for c in checks['results'])
# Independent arithmetic of the actually supplied teaching-model quantities; not learner/lab outcomes.
Qn=1/(0.10*math.sqrt(0.21));ev=1.229-8.314*298.15/(2*96485)*math.log(Qn);ev4=1.229-8.314*298.15/(4*96485)*math.log(Qn**2)
assert abs(ev-1.1894)<5e-5 and abs(ev-ev4)<1e-12
h=-0.05916*14;o=1.229-0.05916*14;assert abs((o-h)-1.229)<1e-12
nums={'role':'Arithmetic verification of supplied fictional model answer keys; no actual learner/lab observation','fuelCellSupply':{'kWhPer100km':9*55,'kgCO2Per100km':9*55*.4},'Nernst298_15K':{'dimensionlessQ':Qn,'E_V':ev,'E_doubledReaction_V':ev4,'pH14H2_V':h,'pH14O2_V':o,'pH14Cell_V':o-h},'efficiencyWithDeclaredExactInputs':{'A_electrical_percent':[100*(3-.1)/10,100*(3+.1)/10],'A_nominal_percent':[100*(3+5-.2)/10,100*(3+5+.2)/10],'A_used_percent':[100*(3+2-.1)/10,100*(3+2+.1)/10],'B_electrical_percent':[100*(12-.1)/20,100*(12+.1)/20],'B_nominal_percent':[100*(12+5-.2)/20,100*(12+5+.2)/20],'B_used_percent':[100*(12+2-.1)/20,100*(12+2+.1)/20],'EVsocket_percent':100*16.4/20,'EVfuelToWheel_percent':100*16.4/(20/.4),'combustionFuelToWheel_percent':100*15/60,'EVsocketFor15Wheel_kWh':15/.82,'EVfuelFor15Wheel_kWh':15/.82/.4},'climateAccountsOnly':{'base_gPerMJ':20+15+5-71+71,'landScenario_gPerMJ':20+15+5-71+71+80,'baseSaving_percent':100*(95-40)/95,'equalWheelBio_g':1.2*40,'equalWheelBioLand_g':1.2*120,'equalWheelBaseSaving_percent':100*(95-1.2*40)/95,'H2gross_kg':.1+.2+.05,'H2netWithEvidencedHeat_kg':.35-.2*.25,'H2newHeatCredit_kg':.2*.02,'H2newNet_kg':.35-.2*.02}}
(R/'checks/ARITHMETIC.supplied-models.actual.json').write_text(json.dumps(nums,indent=2)+'\n')
report={'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'passed','preservedPriorPackages':sealed,'allOriginal4DDissentsExactAndStillRevise':True,'original42CasesAnd20ProfilesByteExact':True,'scopeOnlyAssigned4CurrentContexts':True,'all4WholeGoalContextsExactNativeV3':True,'actualImageHashesAndReviewInputBindingsExact':4,'E1G1AiCandidateNeedsHumanReview':4,'normalAtomicRecords':4,'wholeProfileBodyUnchanged':1,'wholeProfileSuccessors':3,'wholeCases':8,'unchangedCases':3,'wholeCaseSuccessors':5,'caseFieldDeltas':25,'blankFutureRecords':8,'normalStockOperationsExit0':3,'reusedPhysicalStockModules':4,'additionalCacheBytes':0,'additionalDependencyCacheBytes':0,'maxAdditionalCacheBytes':10*1024*1024,'existingReadOnlyHostPhysicalCopiedBytes':77417,'ownScientificFirstPreservedBeforeNormalRecords':True,'arithmeticVerifiedWithinExplicitModelBounds':True,'noNewBlindDOrMVOrSourceCourseHumanApproval':True}
(R/'checks/FINAL.integrity-and-scope.actual.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
