from pathlib import Path
import json,copy,hashlib,datetime
R=Path.cwd(); E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'; O=Path(__file__).resolve().parent
L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1'
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'; G='5b1bb5d9-07b1-5ba9-b320-cc97be917c60'; N='3eb2a06c-d283-57aa-9eb4-088940c4801a'; T='69928892-ac71-553d-a35c-4f96f16b6d6e'
D=E/'chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/CHECK.actual-combined639-stock82-and39views.before-Fruit-practical-placement.json'
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(n,v):
 p=O/n;assert not p.exists(),str(p);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return p
can=read(L/C);assert pin(L/C)['sha256']=='sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9'
gb={g['id']:g for g in can['goals']};diag=read(D);now=datetime.datetime.now(datetime.timezone.utc).isoformat()
assert gb[N]['requires']==['8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566','42a84bca-d27e-581f-a43a-eee424f0504d',G]
assert gb[T]['requires']==[N] and gb[G]['requires']==['a9c22adc-b543-5b0c-a2d8-3189facdff08']
assert gb[G]['tags']==['GK','LK','canonical','SekI'] and 'DE-SH' in gb[G]['applicability']['jurisdiction']
write('FIRST.actual-CrossStage-target-placement-rationale.AUTHOR.inactive.json',{'recordKind':'Finite AUTHOR placement proposal only; no independent vote','createdAtUtc':now,'baseCanonical':pin(L/C),'actualDiagnostic':pin(D),'sourceLiteracyGoalWhole':gb[G],'directOrientationPrerequisiteWhole':gb[gb[G]['requires'][0]],'newSource032WholeGoal':gb[N],'existingEndpointId':T,'currentRoute':[T,N,G,gb[G]['requires'][0]],'observedMissingCurrentOrdinaryPrerequisite':G,'decision':'AUTHOR proposes existing5b as actual target in both actual SH CrossStage GK/LK views','rationale':'Both current views explicitly cover CrossStage and already contain a Sek I communication/inquiry section. Existing5b is a substantive source-literacy competence, already applicable to SH and GK/LK, that must be learned if unmastered before the new supplied-material process-chain goal. Its orientation prerequisite is already an explicit target. Append exactly one target leaf to the existing matching Sek I communication section. Do not infer that a learner has acquired this skill or relabel it prerequisiteOnly in the actual CrossStage scope. Source032 official optionality remains separate from the owner interim all-authored product target. No canonical competence, requires edge, card, source decision or M science changes.','newIndependentVotes':0,'normalWrites':0,'wholeM7':False,'HumanApproval':False,'HumanTrial':False})
ops=[]
for i,course in enumerate(['gk','lk'],1):
 normal=f'curricula/DE/Gymnasium/composition-views/chemie/de-sh-{course}.view.json';bp=L/normal;before=read(bp);after=copy.deepcopy(before)
 assert before['scope']=={'schoolForm':'Gymnasium','jurisdiction':'DE-SH','stage':'CrossStage','courseProfile':course.upper()}
 rows=[v for v in diag['views'] if v['file']==f'de-sh-{course}.view.json'];assert len(rows)==1 and rows[0]['viewSHA256']==pin(bp)['sha256']
 oldroute=next(t for t in rows[0]['terminals'] if t['goalId']==T);assert oldroute['outsideOrdinaryPrerequisites']==[G]
 sid=f'chemistry-de-sh-{course}-chemische-erkenntnisgewinnung-und-kommunikation-sek-i'
 def find(ns):
  out=[]
  for n in ns:
   if n.get('id')==sid:out.append(n)
   out+=find(n.get('children',[]))
  return out
 targets=find(after['rootNodes']);assert len(targets)==1
 targets[0]['children'].append({'kind':'goalEntry','goalId':G,'projectionRole':'target'})
 reconstruct=copy.deepcopy(after);removed=find(reconstruct['rootNodes'])[0]['children'].pop();assert reconstruct==before
 b=O/f'{i:02}.before.whole.actual-L639.exact.json';b.write_bytes(bp.read_bytes());a=write(f'{i:02}.after.whole.source-literacy-target.AUTHOR.inactive.json',after)
 ops.append({'operation':'compare-and-swap-whole-composition-view','normalPath':normal,'before':pin(b),'after':pin(a),'beforeWholeFileSha256':pin(bp)['sha256'],'soleChange':{'sectionId':sid,'append':removed},'scopeUnchanged':True,'allPreviousNodesAndRolesExact':True,'status':'DRAFT_INACTIVE_AUTHOR_PROPOSAL; two independent placement reviews pending','condition':'Refuse before-file drift; do not infer promotion from this author package'})
write('CAS.two-whole-SH-views.existing-source-literacy-target.AUTHOR.inactive.json',{'recordKind':'Finite two-whole-view AUTHOR CAS; target placement only','createdAtUtc':now,'baseCanonical':pin(L/C),'baseCapsulePath':str(L.relative_to(R)),'operations':ops,'independentReviewersRequired':2,'newIndependentVotes':0,'normalWrites':0,'canonicalWrites':0,'sourceMappingWrites':0,'cardWrites':0,'activeRegistryWrites':0,'GitActions':0,'HumanApproval':False,'HumanTrial':False})
# Only classify the already existing bounded diagnostic; do not clear historical findings.
oldRows=[(v,t) for v in diag['views'] for t in v['terminals'] if t['outsideOrdinaryPrerequisites'] and t['goalId']!=T]
newRows=[(v,t) for v in diag['views'] for t in v['terminals'] if t['outsideOrdinaryPrerequisites'] and t['goalId']==T]
primary=[{'file':v['file'],'goalId':t['goalId'],'outsideOrdinaryPrerequisites':t['outsideOrdinaryPrerequisites']} for v in diag['views'] if v['file'].startswith('de-he') for t in v['terminals'] if t['goalId'].startswith(('14577339','327'))]
summary={'recordKind':'Separate classification of the existing root diagnostic; no fresh global adjudication or historical-exam repair','input':pin(D),'totalViews':len(diag['views']),'terminalRows':sum(len(v['terminals']) for v in diag['views']),'existingOutsideRowsIncludingNew699':len(oldRows)+len(newRows),'existingOutsideReferencesIncludingNew699':sum(len(t['outsideOrdinaryPrerequisites']) for v,t in oldRows+newRows),'exactNew699OutsideRows':len(newRows),'exactNew699OutsideReferences':sum(len(t['outsideOrdinaryPrerequisites']) for v,t in newRows),'otherPreexistingOutsideRows':len(oldRows),'otherPreexistingOutsideReferences':sum(len(t['outsideOrdinaryPrerequisites']) for v,t in oldRows),'HEprimary145and327':primary,'SHOtherExistingFindings':[{'file':v['file'],'terminal':t} for v,t in oldRows if v['file'].startswith('de-sh')],'fruitPracticalAlreadyVisibleViews':[v['file'] for v in diag['views'] if v.get('newFruitPracticalVisible')],'interpretation':'Only new699 source-literacy omission is addressed here. Other existing diagnostic closure rows remain separate open routing findings; this classification makes no blanket source/course/exam release or new primary-blocker determination. Fruit practice already visible in eight applicable HE/generic views; no new Fruit placement is proposed.','historicalExamFixes':0,'newIndependentVotes':0,'normalWrites':0}
write('SEPARATE.existing39-diagnostic-counts-and-unchanged-historical-findings.json',summary)
print(json.dumps({'root':str(O.relative_to(R)),'CAS':pin(O/'CAS.two-whole-SH-views.existing-source-literacy-target.AUTHOR.inactive.json'),'actualScope':'CrossStage both SH GK/LK','change':'one existing5b explicittarget appended to each matching SekI communication section','otherOldOutsideRows':len(oldRows),'normalWrites':0}))
