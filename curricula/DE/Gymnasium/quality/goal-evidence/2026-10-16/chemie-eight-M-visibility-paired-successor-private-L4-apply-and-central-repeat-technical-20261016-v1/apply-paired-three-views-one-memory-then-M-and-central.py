# SPDX-License-Identifier: Apache-2.0
"""Prepared technical script. No writes or subprocesses without exact Root authorization + A/B science seals."""
import argparse,copy,datetime,hashlib,json,os,pathlib,subprocess,time
R=pathlib.Path('/home/enpasos/projects/skillpilot')
L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1'
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/'
A=E+'chemie-eight-M-visibility-three-generic-views-one-memory-metadata-author-successor-20261016-v1/'
O=E+'chemie-eight-M-visibility-paired-successor-private-L4-apply-and-central-repeat-technical-20261016-v1/'
T=E+'chemie-current437-six-current-native-bindings-private-L4-central-check-technical-20261016-v1/'
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
MC='curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'
CC=T+'central.current437.P6-normal-kind-address-only.after-measured-failure.inactive.config.json'
SELECTOR=A+'OUTPUTS.three-view-one-memory-metadata.AUTHOR.inactive.selector.json'
AUDIT=A+'ADDENDUM.actual-current437-D-page-context-fingerprints-and-one-memory-kind-binding-delta.technical.json'
BASE='sha256:36975262a3d66998c75cca5c9bbe899d57f98b2614edcbded2baec4833e77903'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def encoded(o):return (json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode()
def pin(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def verify(p):
 path=R/p['path'];assert sha(path)==p['sha256'],p['path'];return path
p=argparse.ArgumentParser();p.add_argument('--execute-with-root-authorization',type=pathlib.Path);args=p.parse_args()
if not args.execute_with_root_authorization:
 print(json.dumps({'status':'PREPARED_NOT_EXECUTED','requires':'Explicit Root authorization selecting two actual independent KEEP whole-science/seal artifacts for exact author selector and allowing memory277 technical semantic fingerprint binding','privateCapsule':str(L.relative_to(R)),'mutations':['three exact whole-view CAS','existing277 whole-metadata CAS','only existing277 semantic sourceFingerprint technical rebinding'],'then':['actual stock M437/58-memory check','current437 D context retention check','one actual corrected-P6 central repeat only if M0 and D delta0'],'M7Claim':False},indent=2));raise SystemExit(0)
auth=read(args.execute_with_root_authorization);assert auth['authorizedBy']=='/root';assert auth['explicitExecutePrivateL4ThreeViewsOneMemoryAndOneCentralRepeat'] is True;assert auth['allowTechnicalMemory277SemanticSourceFingerprintOnly'] is True
assert auth['authorSelector']=={'path':SELECTOR,'sha256':'sha256:8c41a2ea8867555907100e27eaebb656afbb27d49aa185b973db9cfb4ddf2b83'}
verify(auth['authorSelector']);assert len(auth['independentReviews'])==2;assert {x['round'] for x in auth['independentReviews']}=={'A','B'}
for peer in auth['independentReviews']:
 assert peer['wholeScopeDecision']=='KEEP';assert peer['reviewerRole']=='independent';assert peer['authorSelectorSHA256']==auth['authorSelector']['sha256'];verify(peer['actualScience']);verify(peer['actualSeal'])
assert sha(R/AUDIT)=='sha256:b7903dc4946c3d69286849d9e4cb3a81aa144297a042d83a1179745374c2bc3a';audit=read(R/AUDIT);assert audit['currentOwnerCount']==437;assert audit['ordinaryReviewContextFingerprintChangedIds']==[];assert audit['actualFull437BaseInMemoryComparison']['all437WholePagesExact'] is True
out=R/O;assert not (out/'EXECUTION.private-L4-CAS.apply.json').exists(),'one-shot application already started';assert sha(L/C)==BASE
mcas=read(R/(A+'CAS.one-WHOLE-existing277.acquisition-course-union-only.AUTHOR.inactive.json'));vcas=read(R/(A+'CAS.three-WHOLE-generic-views.exact-six-existing-memory-target-entries.AUTHOR.inactive.json'));assert len(mcas['operations'])==1;assert len(vcas['operations'])==3
for k in ['wholeViewCAS','wholeMemoryMetadataCAS','primarySourceWholeObjects','cardsOriginsAndCurrentRecords','actualFiniteStockCheck']:
 verify(read(R/SELECTOR)[k])
land=read(L/C);original=copy.deepcopy(land);by={g['id']:g for g in land['goals']};mop=mcas['operations'][0];assert by[mop['goalId']]==mop['beforeWhole']
for op in vcas['operations']:assert sha(L/op['viewPath'])==op['beforeFileSHA256'];assert read(L/op['viewPath'])==op['beforeWhole']
semantic=read(L/SEM);semantic_before=copy.deepcopy(semantic);assert len(semantic['decisions'])==639
kind_delta=audit['semanticKindTechnicalBindingDeltas'];assert len(kind_delta)==1 and kind_delta[0]['goalId']==mop['goalId'];sd=next(d for d in semantic['decisions'] if d['goalId']==mop['goalId']);assert sd['sourceFingerprint']==kind_delta[0]['before'];assert sd['semanticKind']=='memory';sd['sourceFingerprint']=kind_delta[0]['after']
assert all(a==b for a,b in zip(semantic_before['decisions'],semantic['decisions']) if a['goalId']!=mop['goalId'])
mc=read(L/MC);assert len((L/mc['reviewPath']).read_text().splitlines())==437;assert len((L/mc['cardReviewPath']).read_text().splitlines())==79
first_report=R/(T+'CENTRAL.actual-current437-L4.raw.stdout.json');first_report_sha=sha(first_report)
protected=[MC,mc['reviewPath'],mc['cardReviewPath'],CC]
cc=read(L/CC)['subjects'][0];protected+=cc['resolutionIndexPaths']+cc['semanticAtomicityConfigPaths']+cc['positiveEvidenceConfigPaths']+[cc['visualizationQaPath']]
protected_pins={rel:sha(L/rel) for rel in set(protected)};writes=[]
def detach_parent(p):
 assert p.is_relative_to(L) and p!=L
 cur=L
 for part in p.relative_to(L).parts:
  cur=cur/part
  if cur.is_symlink():
   origin=cur.resolve();children=list(origin.iterdir());cur.unlink();cur.mkdir()
   for child in children:(cur/child.name).symlink_to(child)
   writes.append({'operation':'detach-private-parent-symlink','path':str(cur.relative_to(L)),'origin':str(origin)})
  elif not cur.exists():cur.mkdir()
  assert cur.is_dir() and not cur.is_symlink()
def put(rel,data):
 dest=L/rel;detach_parent(dest.parent);prior=dest.lstat() if dest.exists() or dest.is_symlink() else None
 if prior:dest.unlink()
 with dest.open('xb') as f:f.write(data)
 assert not dest.is_symlink() and dest.stat().st_nlink==1
 writes.append({'operation':'write-detached-private-leaf','path':rel,'priorNlink':prior.st_nlink if prior else 0,'afterNlink':1,'sha256':sha(dest)})
def emit(n,o):
 dest=out/n
 with dest.open('xb') as f:f.write(encoded(o))
def preserved():
 assert all(sha(L/rel)==fp for rel,fp in protected_pins.items());assert sha(first_report)==first_report_sha;assert len(read(L/C)['goals'])==639
emit('INPUT.actual-root-authorization-and-paired-science-pins.json',auth)
for g in land['goals']:
 if g['id']==mop['goalId']:g.clear();g.update(copy.deepcopy(mop['afterWhole']))
assert all(g==by0 for g,by0 in zip(land['goals'],original['goals']) if g['id']!=mop['goalId'])
put(C,encoded(land))
for op in vcas['operations']:put(op['viewPath'],encoded(op['afterWhole']))
put(SEM,encoded(semantic));preserved()
emit('EXECUTION.private-L4-CAS.apply.json',{'role':'Paired exact author CAS technical materialization only','rootAuthorization':pin(args.execute_with_root_authorization),'beforeCanonicalSHA256':BASE,'afterCanonical':pin(L/C),'changedWholeGoalIds':[mop['goalId']],'changedWholeViews':[o['viewPath'] for o in vcas['operations']],'technicalSemanticBindingOnly':kind_delta,'ordinary437Exact':True,'other638GoalsExact':True,'other638KindDecisionsExact':True,'protectedInputsExact':protected_pins,'detachedPrivateWrites':writes,'newIndependentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False})
node=['node','--preserve-symlinks','--preserve-symlinks-main','app/node_modules/tsx/dist/cli.mjs'];env=os.environ.copy();env.update({'NODE_OPTIONS':'--preserve-symlinks --preserve-symlinks-main','NO_COLOR':'1'})
def run(label,cmd):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();result=subprocess.run(cmd,cwd=L,env=env,capture_output=True)
 (out/(label+'.raw.stdout.txt')).write_bytes(result.stdout);(out/(label+'.raw.stderr.txt')).write_bytes(result.stderr)
 receipt={'command':cmd,'cwd':str(L.relative_to(R)),'startedAt':start,'elapsedSeconds':time.monotonic()-t,'exitCode':result.returncode,'canonical':pin(L/C),'stdout':pin(out/(label+'.raw.stdout.txt')),'stderr':pin(out/(label+'.raw.stderr.txt')),'newIndependentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False};emit('EXECUTION.'+label+'.json',receipt);preserved();return result
m=run('actual-stock-M437-after-paired-visibility-successor',node+['app/scripts/memoryCardReview.ts','--config='+MC,'--mode=check'])
if m.returncode:raise SystemExit('Stock M failed; central deliberately not invoked. Inspect exact raw report.')
# Context retention is per current owner; no page rerender or reinterpretation of historical review records.
probe=out/'check-applied437-D-context-retention.mts'
assert probe.exists()
d=run('actual-current437-D-context-retention-after-apply',node+[str(probe)])
if d.returncode:raise SystemExit('D context delta/check failed; central deliberately not invoked.')
central=run('actual-single-central-repeat-after-M0-and-D0',node+['app/scripts/reportDeepUnderstandingRollout.ts','--config='+CC,'--mode=check','--format=json'])
try:report=json.loads(central.stdout)
except Exception:report={'unparseableStockOutput':True}
emit('MANIFEST.actual-paired-successor-M-and-one-central-repeat.technical.json',{'role':'Actual bounded paired-author technical application and one central repeat; no M7 activation','canonical':pin(L/C),'authorSelector':auth['authorSelector'],'independentReviews':auth['independentReviews'],'stockMExitCode':m.returncode,'currentDContextExitCode':d.returncode,'centralExitCode':central.returncode,'actualCentralReport':report,'protectedOriginalInputsExact':True,'firstCentralReportUnmodified':first_report_sha,'knownOpenGates':['APV203152 metadata differences not accepted by this operation','HE145/327 admission provenance/science HOLD remains separate unless Root supplies later actual pair evidence','Human approval/trial and broader M7/activation gates remain separate'],'normalR_H_K_L_L2_L3Writes':0,'newIndependentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False})
print(json.dumps({'stockMExitCode':m.returncode,'currentDContextExitCode':d.returncode,'centralExitCode':central.returncode,'root':O,'M7Claim':False},indent=2));raise SystemExit(central.returncode)
