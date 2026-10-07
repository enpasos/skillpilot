from pathlib import Path
import json, hashlib, datetime
R=Path('.')
B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
P=B/'chemie-current-atomic-description-positive-gap-author-v2'
V1=B/'chemie-current-atomic-description-positive-gap-author-v1'
F=P/'description-positive-gap-author-v2.final.freeze.json'
assert not F.exists(),'Immutable stage already sealed'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def stable(x):return json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':'))
def value_digest(x):return 'sha256:'+hashlib.sha256(stable(x).encode()).hexdigest()
def delta(old,new,path=''):
 if type(old)!=type(new):return [{'pointer':path,'before':old,'after':new}]
 if isinstance(old,dict):
  out=[]
  for k in sorted(old.keys()|new.keys()):
   p=path+'/'+k.replace('~','~0').replace('/','~1')
   if k not in old:out.append({'pointer':p,'added':new[k]})
   elif k not in new:out.append({'pointer':p,'removed':old[k]})
   else:out.extend(delta(old[k],new[k],p))
  return out
 if isinstance(old,list):
  if len(old)!=len(new):return [{'pointer':path,'before':old,'after':new}]
  return [d for i,(a,b)in enumerate(zip(old,new))for d in delta(a,b,path+'/'+str(i))]
 return [] if old==new else [{'pointer':path,'before':old,'after':new}]
v1=read(V1/'description-positive-gap-author-v1.final.freeze.json')
for b in v1['files']:assert sha(R/b['path'])==b['sha256']
image=read(P/'two-visual-candidates.author-image-stage-v2.final.freeze.json')
for b in image['files']:assert sha(R/b['path'])==b['sha256']
for b in image['externalBeforeActiveImages']:assert sha(R/b['path'])==b['sha256']
peer_names=[
 ('D-A','chemie-current-fifteen-native-d-independent-a-v1/native-fifteen-d-independent-a.final.freeze.json','1879d77be72d36ad7d2db7548987ab4ae4f5d76f78ef82657581ba9a29026af4'),
 ('D-B','chemie-current-fifteen-native-d-independent-b-v1/native-d-fifteen.independent-b.final.freeze.json','e8c46706e1f2dfabd6a2989db6cc88318079e3d873d528a4b6b3e7de50446f5c'),
 ('P-A','chemie-current-fifteen-native-p-independent-a-v1/independent-p-a.final.freeze.json','afa3fcaa8585af48dc5c51f909b81bab7396466b3baa820b33dd9ad09cfd328f'),
 ('P-B','chemie-current-fifteen-native-positive-independent-b-v1/native-positive-fifteen.independent-b.final.freeze.json','83755011526d3493d4ee34cc1c09f22ed64acbc2bb7670c7852941b3a9577150'),
 ('V-A','chemie-current-two-visual-independent-a-v2/independent-v-a.final.freeze.json','5ae41009aba3efae357d2c64b6efac609ae5814f8850bf93ee98e2e8ad213632'),
 ('V-B','chemie-current-two-visual-independent-b-v2/independent-two-visual-b.final.freeze.json','888b721d06b0c13d7236674f525aee2680c8c039d8261ce9776c2feaf4476a8c')]
peers=[]
for role,name,digest in peer_names:
 p=B/name;assert sha(p)=='sha256:'+digest
 a=read(p);bindings=a.get('outputs',a.get('files',[]))
 for b in bindings:assert sha(R/b['path']).removeprefix('sha256:')==b['sha256'].removeprefix('sha256:')
 peers.append({'role':role,'finalFreeze':bind(p),'frozenOwnOutputsVerified':len(bindings),'historicalPreFinalOutputsAreNotFinalVerdicts':role=='D-B','newAuthorScienceApprovalClaimed':False})
old=read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
new=read(P/'prospective-current378.canonical.author-candidate.json')
oldg={g['id']:g for g in old['goals']};newg={g['id']:g for g in new['goals']}
assert oldg.keys()==newg.keys() and len(oldg)==479
protected=read(V1/'actual-inputs.before-native-preparation.json')['protectedStrictGoalIds']
assert len(protected)==112 and all(oldg[id]==newg[id]for id in protected)
assert len([id for id in oldg if oldg[id]==newg[id]])==474
mat0=read(V1/'thirty-complete-materials.de-en.author-candidates.json')['materials']
mat=read(P/'thirty-complete-materials.de-en.author-corrections.candidate.json')['materials']
s0=read(V1/'fifteen-positive-profile-specifications.author-candidates.json')['goals']
spec=read(P/'fifteen-positive-profile-specifications.author-corrections.candidate.json')['goals']
assert len(mat)==30 and len(spec)==15
assert len([a for a,b in zip(mat0,mat)if a==b])==25
assert len([a for a,b in zip(s0,spec)if a['profile']==b['profile']])==9
tech=read(P/'native-fifteen-prospective-schema-material-binding-checks.actual.json')
assert tech['closedNativeRecordSchema']=='PASS15' and tech['nativePureRecordSemantics']=='PASS15'
errors=tech['actualUnmodifiedFullProfileChecker']['errors'];assert len(errors)==4
assert all(any(id in e for id in ['b8d3b453','973c12d9'])for e in errors)
assert tech['actualUnmodifiedFullProfileChecker']['counts']=={'approved':0,'needsHumanReview':15,'rejected':0}
common=['3be2d0b7','e1214210','448815cc','b92bfa45','345fdca9','3899edf4','d4928773']
reuse=[]
for short in common:
 id=next(id for id in oldg if id.startswith(short));a=next(g for g in s0 if g['goalId']==id);b=next(g for g in spec if g['goalId']==id)
 assert oldg[id]==newg[id]and a['profile']==b['profile']
 cases=[c for c in mat if c['goalId']==id];beforecases=[c for c in mat0 if c['goalId']==id];assert cases==beforecases
 t=next(r for r in tech['rows']if r['goalId']==id);assert t['goalFingerprintSameAsV1']and t['reviewInputFingerprintSameAsV1']and t['profileFingerprintSameAsV1']
 reuse.append({'goalId':id,'wholeGoalDigest':value_digest(oldg[id]),'wholeCaseDigests':[{'caseId':c['caseId'],'digest':value_digest(c)}for c in cases],'profileBodyDigest':value_digest(a['profile']),'priorAndProspectiveGoalFingerprint':t['goalFingerprint'],'priorAndProspectiveReviewInputFingerprint':t['reviewInputFingerprint'],'priorAndProspectiveProfileFingerprint':t['profileFingerprint'],'wholeGoalCasesProfileBodyExact':True,'unchangedScienceReReviewRequired':False,'activeNativeBindingRevalidationStillRequired':True})
receipt={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'AUTHOR final prospective candidate verification; not independent M7 approval','historicalV1':bind(V1/'description-positive-gap-author-v1.final.freeze.json'),'all49V1OwnFilesExact':True,'immutableActualImageStage':bind(P/'two-visual-candidates.author-image-stage-v2.final.freeze.json'),'priorFinalIndependentReviewBindings':peers,'threeDescriptionCorrectionsFourFields':read(P/'three-goal-text-corrections.author-candidate.json')['rows'],'actualCurrentCanonical':bind(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'prospectiveCanonical':bind(P/'prospective-current378.canonical.author-candidate.json'),'protected112WholeGoalsExact':True,'all474OtherWholeGoalPayloadsExact':True,'changedWholeGoalIds':[id for id in oldg if oldg[id]!=newg[id]],'materialLiteralDeltas':[{'caseId':a['caseId'],'changedFields':delta(a,b)}for a,b in zip(mat0,mat)if a!=b],'profileBodyLiteralDeltas':[{'goalId':a['goalId'],'changedFields':delta(a['profile'],b['profile'])}for a,b in zip(s0,spec)if a['profile']!=b['profile']],'unchanged25WholeCases':[a['caseId']for a,b in zip(mat0,mat)if a==b],'unchanged9WholeProfileBodies':[a['goalId']for a,b in zip(s0,spec)if a['profile']==b['profile']],'sevenCommonPriorIndependentScienceKeepExactReuse':reuse,'fiveTargetedFutureDGoalIds':[r['goalId']for r in tech['rows']if not r['reviewInputFingerprintSameAsV1']],'eightTargetedFuturePUnionGoalIds':[r['goalId']for r in tech['rows']if not r['reviewInputFingerprintSameAsV1']or not r['profileFingerprintSameAsV1']],'nativeClosedRecordSchemaAndPureSemantics':'PASS15','fullNativeCurrentBinding':'HOLD_TWO_INACTIVE_PNG_ADDRESSES_FOUR_DOCUMENTED_ERRORS','twoIndependentVisualKeepsSeparateFromNativeIntegration':True,'sourcePageContextBoundaryHoldsRetained':['622f generic halogen image and text KEEP; limited organic HE-Q1.1 source/page coverage hold remains, final D-B prefinal BLOCK not reused','363c exact whole tartrate-complex geometry/donor-site/source coverage not approved by text/orbital fixes','National496SourceAtlas unresolved decisions and all regional course/stage limits remain'],'humanApproval':False,'humanTrial':False,'actualLearnerEvidence':False,'newScientificClosures':0,'restoredActiveBindings':0,'strictNetGain':0,'activeWrites':False,'GitOperations':False}
(P/'final-v2-author-deltas-preservation-and-reuse.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in P.rglob('*')if p.is_file()and p!=F)
assert not any(p.is_symlink()for p in files)
freeze={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'AUTHOR v2 final inactive narrow corrections and exact actual prospective inputs; independent final native D/P followup pending','scopeGoalIds':[g['goalId']for g in spec],'immutableHistoricalV1':bind(V1/'description-positive-gap-author-v1.final.freeze.json'),'immutableImageStage':bind(P/'two-visual-candidates.author-image-stage-v2.final.freeze.json'),'actualPriorFinalReviewBindings':peers,'fileCount':len(files),'bytes':sum(p.stat().st_size for p in files),'files':[bind(p)for p in files],'currentChemistryStrictBaseline':112,'currentChemistryAtomicDenominator':378,'newScientificClosures':0,'restoredActiveBindings':0,'strictNetGain':0,'nativeCurrentIntegrationApproval':False,'humanApproval':False,'humanTrial':False,'activeWrites':False,'nextStage':'Separate v3 inactive native D-five/P-eight input preparation with unchanged production helpers and actual current helper binding'}
F.write_text(json.dumps(freeze,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'finalFreeze':bind(F),'frozenFiles':len(files),'frozenBytes':freeze['bytes'],'wholeUnchangedCases':25,'wholeUnchangedProfileBodies':9,'sevenJointScienceKeepExactReuse':7,'nativeDFollowup':len(receipt['fiveTargetedFutureDGoalIds']),'nativePFollowup':len(receipt['eightTargetedFuturePUnionGoalIds']),'strictNetGain':0}))
