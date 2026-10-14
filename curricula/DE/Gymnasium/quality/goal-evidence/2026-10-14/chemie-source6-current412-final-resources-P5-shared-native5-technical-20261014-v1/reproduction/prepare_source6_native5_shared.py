from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, copy, shutil, os, re

E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
R=E/'chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1'
H=Path('tmp/checkpoint-chemie-20261014/source6-current412-native5-minimal-stock-host')
B=E/'chemie-source6-five-current412-kind-and-whole-candidate-on286-root-20261014-v1'
O=E/'chemie-source6-five-actual-current412-full-gate-author-20261014-v1'
VA=E/'chemie-source6-five-current412-original-PNG-independent-v-a-20261014-v1'
VB=E/'chemie-source6-five-current412-actual-PNG-targeted-V-independent-b-20261014-v1'
I=E/'chemie-source6-five-current412-actual-PNG-candidates-author-20261014-v1'
I286=E/'chemie-current407-joint-P5-native-D6-existing281-integration-technical-20261014-v1'
T=E/'chemie-current407-naturstoffe-P9-remediation-current-seven-shared-technical-20261014-v2'
def read(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def write(rel,x):p=R/rel;assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def exactcopy(p,rel):d=R/rel;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,d);assert p.read_bytes()==d.read_bytes();return d
R.mkdir(exist_ok=True);assert not (R/'GUARD.before.readonly-originals-and-active-carriers.json').exists()
seals=[B/'SEAL.finite-current412-genuine-kind-and-P5-stock-PASS.actual.json',VA/'SEAL.finite-five-current412-original-PNG-independent-V-a.after-stock-PASS.actual.json',VB/'SEAL.finite-five-original-PNG-current-whole-goal-V5-independent-b.actual.json']
for p in seals:
 for x in read(p)['files']:
  q=Path(x['path']);q=q if q.exists() else p.parent/q;actual=bind(q);assert actual['sha256']==x['sha256'] and actual['bytes']==x['bytes'],(p,x['path'])
guardpaths=[Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'),*seals]
write('GUARD.before.readonly-originals-and-active-carriers.json',{'atUTC':datetime.now(timezone.utc).isoformat(),'bindings':[bind(p) for p in guardpaths],'parentHWasNotReadOrWritten':True})
basepath=B/'candidate/canonical539.current412-on-actual286.minimal-CAS.json'
can=read(basepath);original=copy.deepcopy(can);ci={x['id']:x for x in can['goals']}
ops=read(VA/'candidate/CAS.five-whole-goals-resource-only-proposals-for-reviewed-original-PNGs.json')['wholeGoalOperations']
ids=[x['goalId'] for x in ops];sel=set(ids);assert len(sel)==5
qa0=I286/'candidate/QA.current407-three-genuine-PNG.normal-stock-419.inactive.json';qa=read(qa0);oldqa=copy.deepcopy(qa);assert len(qa['records'])==419
ar={x['goalId']:x for x in read(VA/'candidate/QA5.actual-first-independent-V-a-KEEP.delta-selection.json')['records']}
br={x['goalId']:x for x in read(VB/'QA/five-original-PNG-current-whole-goal.V5-independent-b.actual.qa.json')['records']}
neutral=read(I/'NEUTRAL.five-final-original-PNG-candidates-whole-current-goals-for-independent-V.json');ir={x['goalId']:x for x in neutral['rows']}
paired=[];assets=[]
cp=R/'candidate/canonical539.current412.final-five-paired-V-resources.inactive.json'
for op in ops:
 id=op['goalId'];assert ci[id]==op['beforeWholeGoal'];ci[id]=copy.deepcopy(op['afterWholeGoalResourceOnlyProposal'])
 # Replace list entry explicitly; dictionary indices alone do not mutate its parent list.
 can['goals']=[ci[g['id']] for g in can['goals']]
 a=ar[id];b=br[id];asset=ir[id]['selectedOriginalPixels'];assert bind(Path(asset['path']))==asset
 assert a['aiApproved']==b['aiApproved']=='yes' and a['humanApproved']==b['humanApproved']=='no'
 assert a['assetSha256']==b['assetSha256']==a['aiApprovedAssetSha256']==b['aiApprovedAssetSha256']==asset['sha256']
 row=copy.deepcopy(a);row['landscapePath']=str(cp)
 for k in ['aiNotes','chatGptNotes']:row[k]='Original independent V5-A:\n'+a[k]+'\n\nOriginal independent V5-B:\n'+b[k]
 for k in ['aiReviewer','chatGptReviewer']:row[k]=a[k]+'; '+b[k]
 for k in ['aiReviewedAt','chatGptReviewedAt']:row[k]=max(a[k],b[k])
 qa['records'].append(row)
 paired.append({'goalId':id,'exactOriginalPixels':asset,'sourceAWholeQA':a,'sourceBWholeQA':b,'afterWholeQA':row,'wholeGoalBefore':op['beforeWholeGoal'],'wholeGoalAfterResourceOnly':ci[id],'noNewVoteOrDateInvented':True,'aggregateDateIsLatestOriginalReviewInstant':True})
 src=Path(asset['path']);url=ci[id]['resourceLinks'][0]['url'];d=R/'public-root'/url.lstrip('/');d.parent.mkdir(parents=True,exist_ok=True);os.link(src,d)
 assets.append({'goalId':id,'original':asset,'publicRootReadOnlyHardlink':bind(d),'wholeResourceLink':ci[id]['resourceLinks'][0],'canonicalAlias':row['canonicalAssetPath'],'publicAlias':row['publicAssetPath'],'detachBeforeAnyMutation':True})
assert len(can['goals'])==539 and sum(g==ci[g['id']] for g in original['goals'])==534
assert qa['records'][:419]==oldqa['records']
write(cp.relative_to(R),can);qp=write('candidate/QA.current412.preserve419-plus-five-genuine-paired-V.inactive.json',qa)
sp=exactcopy(B/'candidate/semantic539.current412.actual-paired-kind-science.json','candidate/semantic539.current412.exact-existing-kind-records.json')
write('candidate/CAS.five-resources-and-five-paired-V-QA.actual.json',{'beforeCanonical':bind(basepath),'afterCanonical':bind(cp),'beforeQA419':bind(qa0),'afterQA424':bind(qp),'rows':paired,'all534OtherWholeGoalsExact':True,'all539DEENRequiresApplicabilityExact':True,'all419OldWholeQARowsExact':True,'kindLedgerByteExact':bind(sp),'originalScientificSeals':[bind(p) for p in seals],'noD_P_M_Kind_SourceCourseOrHumanNewVote':True,'activeOrParentHWrites':False})
write('inputs/EXACT.five-original-PNGs-normal-aliases-and-original-review-bindings.json',{'assets':assets,'originalVisualNeutral':bind(I/'NEUTRAL.five-final-original-PNG-candidates-whole-current-goals-for-independent-V.json'),'originalAQA':bind(VA/'candidate/QA5.actual-first-independent-V-a-KEEP.delta-selection.json'),'originalBQA':bind(VB/'QA/five-original-PNG-current-whole-goal.V5-independent-b.actual.qa.json')})
for src,rel in [(O/'cases/whole-five-goals-ten-complete-bilingual-application-cases.author.json','cases/whole-five-goals-ten-complete-bilingual-cases.exact-original.json'),(O/'inputs/whole-six-original-source-conditions-seven-carrier-unions.exact-from-sealed-plan.json','sources/whole-six-original-source-conditions-seven-carrier-unions.exact-original.json'),(O/'inputs/whole-neighbour-source-operators-and-all-current-partners.not-cleared.json','sources/whole-neighbour-source-operators-and-all-current-partners.exact-original.json'),(O/'inputs/whole-seven-static-programme-candidates.exact-from-sealed-plan.json','sources/whole-seven-static-programme-candidates.UNREGISTERED.exact-original.json'),(O/'P/criteria.whole-five-author-E0-G0.md','shared/P-criteria.exact-original.md')]:exactcopy(src,rel)
oldneutral=read(O/'NEUTRAL.exact-five-stable-whole-goals-current280-to-prospective412-author-inputs.json')
primaries=[]
for x in oldneutral['actualWholePrimaryBindings']:
 p=Path(x['completeAlreadyBoundLayoutTextRead']['path']);assert bind(p)==x['completeAlreadyBoundLayoutTextRead'];d=exactcopy(p,'primary/'+p.name);primaries.append({'original':bind(p),'exactOwnCopy':bind(d)})
for x in oldneutral['wholeOriginalPdfBindings']:assert bind(Path(x['path']))==x
write('inputs/WHOLE.current-five-DEEN-prerequisites-successors-parents-and-source-unions.json',{'canonical':bind(cp),'goals':[{'goalId':id,'wholeCurrentGoal':ci[id],'wholeDirectPrerequisites':[ci[x] for x in ci[id].get('requires',[])],'wholeReversePrerequisites':[g for g in can['goals'] if id in g.get('requires',[])],'wholeContainmentParents':[g for g in can['goals'] if id in g.get('contains',[])]} for id in ids],'originalFullUnionCompanion':bind(O/'WHOLE.five-goals-prerequisites-successors-source-course-and-full-partner-unions.author.json'),'wholePrimaryWindows':primaries,'originalPDFs':oldneutral['wholeOriginalPdfBindings'],'sourceViewsAndSevenPartialUnionsRemainAuthorCandidates':True,'noNewWholeCourseOrSelectionGrant':True})
for name in ['native-prompt.md','native-criteria.md']:exactcopy(T/'shared'/name,'shared/'+name)
prompt=R/'shared/native-prompt.md';prompt.write_text(prompt.read_text()+'\n# Bound Source6 common input\nRead the companion selector, all ten complete bilingual cases/materials/answers/rubrics, whole source cells and seven carrier unions, full primary windows and explicit choice conditions. Source/placement proposals are unregistered author candidates. A technically valid P or V record does not grant whole-source or compulsory course scope. Do not read current peer verdicts. No D records exist yet.\n')
pc=read(B/'config/P5.actual-independent-a.current412-genuine-kind.config.json');pc.update(landscapePath=str(cp),semanticKindLedgerPath=str(sp),reviewPath=str(R/'positive/P5.current-images.technical-transport-of-genuine-a.review.jsonl'))
write('configs/P5.current-images.genuine-independent-a.config.json',pc)
bc=read(T/'configs/whole407.current-seven.stock-base.config.json');bc.update(bookId='chemie-source6-current412-five-full-context',title='Chemie – fünf quellengebundene Ergänzungsziele im vollständigen aktuellen Kontext',landscapePath=str(cp),semanticKindLedgerPath=str(sp),goalVisualizationQaPath=str(qp),evidenceReviewPaths=[pc['reviewPath']],outputPath=str(R/'models/whole412.actual-stock-model.json'));write('configs/whole412.stock-base.config.json',bc)
batch=read(T/'configs/native-seven.current-P7.shared-first-pass.batch.config.json');batch.update(batchId='chemie-source6-current412-five-shared-first-pass-20261014-v1',bookId='chemie-source6-current412-five-first-pass',title='Chemie – fünf vollständige quellengebundene Ergänzungsseiten',baseGoalBookConfigPath=str(R/'configs/whole412.stock-base.config.json'),goalIds=ids,outputDirectory=str(R/'native-five'),promptPath=str(prompt),criteriaPath=str(R/'shared/native-criteria.md'),publicRoot=str(R/'public-root'));write('configs/native-five.shared-first-pass.batch.config.json',batch)
write('STATUS.resources-ready-P-image-context-addendum-pending.json',{'atUTC':datetime.now(timezone.utc).isoformat(),'goalIds':ids,'wholeGoalCount':539,'curricularAtomsExpected':412,'oldQA419Retained':True,'candidateQARecordCount':424,'genuinePairedV':5,'PImageContextAddendumPending':True,'PTransportNotYetMaterialized':True,'DVotes':0,'strictGainClaim':0,'activeOrParentHWrites':False})
# A small static module host, separate from every former or root-owned host.
assert not H.exists();H.mkdir()
def hostcopy(p):d=H/p;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,d)
seen=set()
def deps(p):
 if p in seen:return
 seen.add(p);hostcopy(p)
 for spec in re.findall(r'(?:from\s*|import\s*\()\s*[\"\']([^\"\']+)[\"\']',p.read_text()):
  if not spec.startswith('.'):continue
  raw=p.parent/spec;opts=[raw,Path(str(raw)+'.ts'),Path(str(raw)+'.tsx'),Path(str(raw)+'.js'),raw/'index.ts']
  if raw.suffix=='.js':opts.append(raw.with_suffix('.ts'))
  q=next((q for q in opts if q.is_file()),None)
  if q:deps(Path(os.path.normpath(q)))
for name in ['positiveGoalEvidenceReview.ts','buildGoalBookModel.ts','materializeGoalDescriptionRolloutBatch.ts','generateGoalVisualizationQaLedgers.ts']:deps(Path('app/scripts')/name)
os.symlink(Path('app/node_modules').resolve(),H/'app/node_modules')
for p in Path('contracts').rglob('*.schema.json'):
 if 'fixtures' not in p.parts:hostcopy(p)
view=Path('curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json');hostcopy(view)
for p in R.rglob('*'):
 if not p.is_file():continue
 d=H/p;d.parent.mkdir(parents=True,exist_ok=True)
 if '/public-root/' in str(p):os.link(p,d)
 else:shutil.copy2(p,d)
oldH=Path('tmp/checkpoint-chemie-20261014/p9-current-seven-v2-minimal-stock-host');aliases=0
for p in (oldH/'app/public/assets/goal-visualizations/chemie').rglob('*'):
 if p.is_file():d=H/p.relative_to(oldH);d.parent.mkdir(parents=True,exist_ok=True);os.link(p,d);aliases+=1
for a in assets:
 for rel in [a['canonicalAlias'],a['publicAlias']]:
  d=H/rel;d.parent.mkdir(parents=True,exist_ok=True);assert not d.exists();os.link(Path(a['original']['path']),d)
write('checks/HOST.minimal-static-module-and-readonly-asset-bindings.json',{'host':str(H),'staticModules':[bind(p) for p in sorted(seen)],'oldPublicAssetAliases':aliases,'newNormalRawAliases':10,'immutableHardlinksDetachBeforeWrite':True,'noParentHCopyOrWrites':True,'noWholeHistoryOrOtherSubjects':True})
print(json.dumps({'root':str(R),'host':str(H),'oldWholeGoalsPreserved':534,'QAold':419,'QAnewTotal':424,'genuinePairedV':5,'staticModules':len(seen),'oldPublicAliases':aliases,'PAddendumPending':True,'newDRecords':0}))
