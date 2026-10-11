from pathlib import Path
import json,hashlib,shutil
O=Path(__file__).resolve().parent;ROOT=Path('/home/enpasos/projects/skillpilot')
def read(p):return json.loads(p.read_text())
def binding(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
cp=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';raw=cp.read_bytes();can=json.loads(raw);gs={g['id']:g for g in can['goals']}
regp=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=read(regp);subject=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften')
configs=[];prs={};allrecords=[]
for p in subject['positiveEvidenceConfigPaths']:
 cfgp=ROOT/p;cfg=read(cfgp);reviewp=ROOT/cfg['reviewPath']
 rows=[json.loads(line) for line in reviewp.read_text().splitlines() if line.strip()]
 configs.append({'config':binding(cfgp),'actualReview':binding(reviewp),'actualRecordCount':len(rows)})
 for r in rows:
  assert r['goalId'] not in prs,r['goalId'];prs[r['goalId']]=r;allrecords.append(r)
assert len(configs)==43 and len(allrecords)==336
assert sum(len(r['profile']['applicationCaseBriefs']) for r in allrecords)==685
intake=read(O/'whole-current555-twelve-DEEN-contracts-original-P-and-existing-materials.KEEP-first-author-intake.json')
guards=[]
for r in intake['rows']:
 gid=r['goalId'];assert gs[gid]==r['wholeGoal'],gid;assert prs[gid]==r['wholeOriginalP'],gid
 guards.append({'goalId':gid,'wholeCurrentGoal':gs[gid],'wholeCurrentOriginalP':prs[gid],'goalWholeExactTo555':True,'originalPWholeExactTo555':True})
assert raw==cp.read_bytes(),'active CAN changed during bounded snapshot read'
snap=O/('whole-current'+str(len(gs))+'-immutable-economics-before-finance12.exact.json');snap.write_bytes(raw)
R={'role':'Actual current whole-contract and original-P endguards, not a fresh scientific review','currentCAN':binding(snap),'originalActiveReadPath':str(cp.relative_to(ROOT)),'currentGoalCount':len(gs),'wholeOriginalPositiveRecordCount':336,'wholeOriginalApplicationCaseCount':685,'whole43CurrentPositiveConfigBindings':configs,'wholeTwelveGoalAndP24Guards':guards,'actualTwelveOriginalCaseCount':sum(len(r['wholeCurrentOriginalP']['profile']['applicationCaseBriefs']) for r in guards),'noActiveWrite':True,'noOrdinaryDescriptionRequiresPChange':True}
(O/'actual-current-whole-twelve-contracts-original-P24-and43-P336685-endguards.AUTHOR.json').write_text(json.dumps(R,ensure_ascii=False,indent=2)+'\n')
base=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
history=[
 ('5472665e-6e62-57a3-bd67-2171b3356d48','wirtschaft-three-Q3-FX-finance-macro-independent-whole-material-review-v1','whole-three-independent-KEEP-Q3-materials.only-machine-material-status-released.inert.json','actual-final-independent-three-Q3-FX-finance-macro-whole-materials-KEEP.receipt.json'),
 ('0b3dbe47-9b98-5540-92e5-a8edf1693b96','wirtschaft-four-Q3-EU-private-criminal-global-trade-independent-whole-material-review-v1','whole-four-Q3-materials.independently-reviewed-machine-released.inert.candidate.json','actual-final-independent-four-Q3-EU-private-criminal-global-trade-whole-materials-KEEP.receipt.json'),
 ('c659edea-7786-59b3-90f3-9c9983388c83','wirtschaft-four-real-route-materials-independent-root-v1','whole-four-KEEP-terminal-goals.only-machine-material-status-released.json','actual-four-individual-whole-material-source-performance-and-rubric-decisions.json'),
 ('9341cdc0-f45a-5e2b-ae90-55950bab91d9','wirtschaft-Q1-Q4-fifteen-five-coherent-material-independent-whole-review-v1','whole-five-KEEP-material-bodies.machine-released-inert-independent-candidate.json','five-individual-whole-DEEN-task-solution-rubric-independent-KEEP-decisions.json'),
 ('f32592d4-e11d-5b87-841d-346f0859cf35','wirtschaft-four-Q2-money-skills-hearing-competition-independent-seven-findings-delta-review-v1','whole-four-Q2-seven-findings-resolved.machine-released.inert.reviewed-candidate.json','actual-final-independent-four-Q2-v8-seven-findings-resolved-KEEP.receipt.json'),
 ('75f67cb9-70bf-5035-adff-05b22889916b','wirtschaft-four-E40-environment-finance-production-team-independent-whole-material-review-v1','whole-four-current-materials.only-two-independent-machine-material-statuses-released.inert.json','actual-final-independent-four-E40-whole-materials-two-KEEP-two-REVISE-and-actual-artefact-counterexamples.receipt.json'),
]
def objects(j):
 if isinstance(j,dict):
  if 'id'in j and 'examData'in j:yield j
  for v in j.values():yield from objects(v)
 elif isinstance(j,list):
  for v in j:yield from objects(v)
K=[]
for gid,folder,bfile,rfile in history:
 bp=base/folder/bfile;rp=base/folder/rfile
 old=next(g for g in objects(read(bp)) if g['id']==gid);assert old==gs[gid],gid
 K.append({'materialId':gid,'actualWholeCurrentMaterial':gs[gid],'wholeReviewedPredecessor':binding(bp),'actualIndependentWholeScienceReceipt':binding(rp),'allWholeGoalFieldsIncludingTaskSolutionRubricRequiresCoverageTagsStatusExact':True,'validExistingScientificReviewReused':True,'newScientificReviewPerformed':False})
native=read(O/'actual-current555-twelve-existing-whole-materials-full-native64-closure-KEEP-first-intake.author.json')
summary=[]
for row in native['rows']:
 ordinarycontexts=set();held=[];already=[]
 for m in row['existingWholeMaterials']:
  for s in m['actual64Scopes']:
   if not s['ordinaryContractTarget']:continue
   key=(s['view'],s['jurisdiction'],s['courseProfile']);ordinarycontexts.add(key)
   rec={'materialId':m['materialId'],**s}
   if not s['missingClosure'] and s['countryCompatible'] and s['courseCompatible']:
    assert s['wholeMaterialTarget'],rec;already.append(rec)
   else:held.append(rec)
 summary.append({'goalId':row['goalId'],'actualRecordedTargetContextCount':len(ordinarycontexts),'actualExistingWholeEligibleAlreadyVisible':already,'actualWholeContextBoundariesHeld':held,'newOrdinaryScopeOrFundamentalsProposed':False})
(O/'actual-six-existing-whole-Science-KEEP-reuse-and-individual64-closure-boundaries.AUTHOR.json').write_text(json.dumps({'role':'KEEP-first reuse; existing full science is preserved, no new broad review','actualCurrentWholeBindingFrame':binding(snap),'currentExistingSixWholeMaterialBindings':K,'actual555Native64IntakeReusedAsDatedTechnicalIntake':True,'noCurrent577RoutePASSInferred':True,'actualIndividualWholeClosureBoundaries':summary,'newEligibleExistingReferenceGapCount':0,'newSmallerMaterialScienceStillPending':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'current':len(gs),'currentSHA':binding(snap)['sha256'],'twelveWholeGoalsP24Exact':True,'all43P336Cases685':True,'sixValidExistingWholeKEEPexact':True}))
