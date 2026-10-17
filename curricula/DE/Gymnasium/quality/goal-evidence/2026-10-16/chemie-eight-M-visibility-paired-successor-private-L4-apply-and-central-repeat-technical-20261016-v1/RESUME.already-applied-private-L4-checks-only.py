# SPDX-License-Identifier: Apache-2.0
"""One-shot checks-only continuation after Root's applied CAS and caller-relative pin error. Never reapplies CAS."""
import copy,datetime,hashlib,json,os,pathlib,subprocess,time
R=pathlib.Path('/home/enpasos/projects/skillpilot');L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1';E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/'
A=E+'chemie-eight-M-visibility-three-generic-views-one-memory-metadata-author-successor-20261016-v1/';O=E+'chemie-eight-M-visibility-paired-successor-private-L4-apply-and-central-repeat-technical-20261016-v1/';T=E+'chemie-current437-six-current-native-bindings-private-L4-central-check-technical-20261016-v1/';N=E+'chemie-combined639-two-gk-priors-native-two-private-l4-technical-20261016-v1/'
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';MC='curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';CC=T+'central.current437.P6-normal-kind-address-only.after-measured-failure.inactive.config.json';out=R/O
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):p=p.absolute();return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def emit(n,obj):
 with(out/n).open('xb')as f:f.write((json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode())
def verify(p):assert sha(R/p['path'])==p['sha256'],p['path']
assert not(out/'EXECUTION.RESUMPTION.preflight-already-applied-state.json').exists(),'resumption already started'
authpath=(out/'ROOT.explicit-actual-paired-finite-private-application.authorization.json').absolute();auth=read(authpath);assert auth['authorizedBy']=='/root';assert auth['explicitExecutePrivateL4ThreeViewsOneMemoryAndOneCentralRepeat']and auth['allowTechnicalMemory277SemanticSourceFingerprintOnly'];verify(auth['authorSelector']);assert auth==read(out/'INPUT.actual-root-authorization-and-paired-science-pins.json')
for p in auth['independentReviews']:assert p['wholeScopeDecision']=='KEEP';verify(p['actualScience']);verify(p['actualSeal'])
assert len(auth['independentReviews'])==2;assert {p['round']for p in auth['independentReviews']}=={'A','B'}
# Immutable prepared bytes remain exactly those in the sealed preparation manifest.
prepared=read(out/'MANIFEST.prepared-technical-apply-not-executed.json')
for p in prepared['files']:verify(p)
selector=read(R/auth['authorSelector']['path'])
for k in['wholeViewCAS','wholeMemoryMetadataCAS','actualFiniteStockCheck']:verify(selector[k])
mc=read(L/MC);cc=read(L/CC)['subjects'][0];composition=read(R/(T+'COMPOSITION.actual-private-L4-six-current-native-bindings.technical-receipt.json'))
basepath=R/(E+'chemie-current437-four-current-contexts-root-native-resolution-synthesis-technical-20261016-v1/CANONICAL639.current-L4.inactive-stable-scientific-candidate.json');assert sha(basepath)=='sha256:36975262a3d66998c75cca5c9bbe899d57f98b2614edcbded2baec4833e77903';baseline=read(basepath);mop=read(R/selector['wholeMemoryMetadataCAS']['path'])['operations'][0];vops=read(R/selector['wholeViewCAS']['path'])['operations'];expected=copy.deepcopy(baseline);oldby={g['id']:g for g in baseline['goals']};assert oldby[mop['goalId']]==mop['beforeWhole'];expected['goals']=[copy.deepcopy(mop['afterWhole'])if g['id']==mop['goalId']else g for g in expected['goals']];assert read(L/C)==expected
# Explicitly verify other638 whole objects, all437 ordinary objects, and whole SEM successor.
assert all(a==b for a,b in zip(read(L/C)['goals'],baseline['goals'])if a['id']!=mop['goalId'])
sem_base_path=R/(N+'SEMANTIC639.current-l4.two-source-bindings-not-new-science.json');assert sha(sem_base_path)=='sha256:896d0c0d132f8d77cdd8de2b499f19cdef18e5c3fd2aed3fb56c2139dce18943';sem_base=read(sem_base_path);sem_expected=copy.deepcopy(sem_base);auditpath=R/(A+'ADDENDUM.actual-current437-D-page-context-fingerprints-and-one-memory-kind-binding-delta.technical.json');assert sha(auditpath)=='sha256:b7903dc4946c3d69286849d9e4cb3a81aa144297a042d83a1179745374c2bc3a';audit=read(auditpath);delta=audit['semanticKindTechnicalBindingDeltas'][0]
for d in sem_expected['decisions']:
 if d['goalId']==mop['goalId']:assert d['sourceFingerprint']==delta['before'];d['sourceFingerprint']=delta['after']
assert read(L/SEM)==sem_expected;ord_ids={d['goalId']for d in sem_base['decisions']if d['semanticKind']=='curricularAtomic'};assert len(ord_ids)==437
view_proof=read(R/selector['actualFiniteStockCheck']['path']);changed={o['viewPath']:o for o in vops}
for v in view_proof['all39RoleAndCourseChecks']:
 if v['path']in changed:assert read(L/v['path'])==changed[v['path']]['afterWhole']
 else:assert sha(L/v['path'])==v['sha256']
owned=[]
for rel in[C,SEM]+list(changed):
 p=L/rel;assert not p.is_symlink()and p.stat().st_nlink==1;cur=p.parent
 while cur!=L:assert not cur.is_symlink();cur=cur.parent
 owned.append({'path':rel,'nlink':p.stat().st_nlink,'parentsPhysical':True,'sha256':sha(p)})
assert len(owned)==5
# Full existing M/card/A/P/D/V proof inputs retain their actual earlier sealed evidence bytes.
protected={}
def protect(rel,reference=None,expected_sha=None):
 p=L/rel;assert p.exists(),rel
 if reference is not None:assert p.read_bytes()==reference.read_bytes(),rel
 if expected_sha is not None:assert sha(p)==expected_sha,rel
 protected[rel]=sha(p)
protect(CC,R/CC);protect(MC,expected_sha=next(x['sha256']for x in composition['writeDetachmentLog']if x.get('path')==MC));protect(mc['reviewPath'],R/mc['reviewPath']);protect(mc['cardReviewPath'],R/mc['cardReviewPath']);assert len((L/mc['reviewPath']).read_text().splitlines())==437;assert len((L/mc['cardReviewPath']).read_text().splitlines())==79
for rel in cc['resolutionIndexPaths']+cc['semanticAtomicityConfigPaths']+cc['positiveEvidenceConfigPaths']:protect(rel,R/rel)
for rel in cc['semanticAtomicityConfigPaths']+cc['positiveEvidenceConfigPaths']:
 cfg=read(L/rel)
 for k in ['reviewPath','reviewPaths']:
  for rp in([cfg[k]]if isinstance(cfg.get(k),str)else cfg.get(k,[])):protect(rp,R/rp)
protect(cc['visualizationQaPath'],R/(T+'QA460.actual-six-current-independent-A-successors.other454-exact.json'))
for row in audit['currentDPerGoalChecks']:protect(row['boundInputPath'],R/row['boundInputPath'])
for mod in composition['stockModules']:
 protect(mod['path'],expected_sha=mod['L4']['sha256'])
first=R/(T+'CENTRAL.actual-current437-L4.raw.stdout.json');first_sha=sha(first);assert first_sha=='sha256:f879159f5e760aac3eaaa991a350b7778a6534055e3027139b9d452bdde4b4c5';canon_sha=sha(L/C);sem_sha=sha(L/SEM)
for n in['EXECUTION.private-L4-CAS.apply.json','EXECUTION.actual-stock-M437-after-paired-visibility-successor.json','EXECUTION.actual-current437-D-context-retention-after-apply.json','EXECUTION.actual-single-central-repeat-after-M0-and-D0.json']:assert not(out/n).exists(),n
emit('EXECUTION.prior-caller-relative-authpath.failure.receipt.json',{'role':'Truthful parent-reported failed prior invocation, independently verified post-apply state; no fabricated raw process trace','reportedBy':'/root','reportedInvocationIssue':'Relative authorization argument caused pin(args.execute_with_root_authorization).relative_to(R) ValueError after all five detached private writes and before postapply receipt or M/D/central','reportedPreparedScriptPhase':'line75 pin(args...)','actualPreparedScriptUnmodifiedAndManifestBound':True,'actualAuthorizationInputReceiptExists':True,'actualAfterWholesVerified':True,'M_D_CentralNotStartedInPriorAttempt':'Root explicitly reports none; no execution receipts/output files existed at continuation preflight','noCASReapplicationOrRollback':True,'HumanApproval':False,'HumanTrial':False,'M7Claim':False})
receipt={'role':'Checks-only truthful postapply resumption; CAS were applied by Root failed caller-relative-path invocation','rootAuthorization':pin(authpath),'beforeCanonical':pin(basepath),'currentAfterCanonical':pin(L/C),'changedWholeGoalIds':[mop['goalId']],'changedViewPaths':list(changed),'other638WholeGoalsExact':True,'ordinary437WholeGoalsExact':True,'other638WholeKindDecisionsExact':True,'memory277ClassificationAndAllNonFingerprintKindFieldsExact':True,'currentFiveLeavesOwned':owned,'protectedProofInputCount':len(protected),'protectedProofInputsSHA256':protected,'M437RecordsExact':True,'card79RecordsExact':True,'firstCentralReport':pin(first),'noCASRewriteOrRollbackInResumption':True,'newIndependentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False}
emit('EXECUTION.RESUMPTION.preflight-already-applied-state.json',receipt);emit('EXECUTION.private-L4-CAS.apply.json',receipt)
def unchanged():
 assert sha(L/C)==canon_sha and sha(L/SEM)==sem_sha and sha(first)==first_sha
 assert all(sha(L/rel)==fp for rel,fp in protected.items())
node=['node','--preserve-symlinks','--preserve-symlinks-main','app/node_modules/tsx/dist/cli.mjs'];env=os.environ.copy();env.update({'NODE_OPTIONS':'--preserve-symlinks --preserve-symlinks-main','NO_COLOR':'1'})
def run(label,cmd):
 emit('STARTED.'+label+'.json',{'command':cmd,'cwd':str(L.relative_to(R)),'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootAuthorization':pin(authpath)})
 t=time.monotonic();result=subprocess.run(cmd,cwd=L,env=env,capture_output=True)
 for suffix,data in[('raw.stdout.txt',result.stdout),('raw.stderr.txt',result.stderr)]:
  with(out/(label+'.'+suffix)).open('xb')as f:f.write(data)
 emit('EXECUTION.'+label+'.json',{'command':cmd,'cwd':str(L.relative_to(R)),'elapsedSeconds':time.monotonic()-t,'exitCode':result.returncode,'canonical':pin(L/C),'stdout':pin(out/(label+'.raw.stdout.txt')),'stderr':pin(out/(label+'.raw.stderr.txt')),'newIndependentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False});unchanged();print(json.dumps({'completed':label,'exitCode':result.returncode}),flush=True);return result
m=run('actual-stock-M437-after-paired-visibility-successor',node+['app/scripts/memoryCardReview.ts','--config='+MC,'--mode=check'])
if m.returncode:raise SystemExit('M failed; D and central not started. Inspect raw actual report.')
d=run('actual-current437-D-context-retention-after-apply',node+[str((out/'check-applied437-D-context-retention.mts').absolute())])
if d.returncode:raise SystemExit('D context check failed; central not started.')
c=run('actual-single-central-repeat-after-M0-and-D0',node+['app/scripts/reportDeepUnderstandingRollout.ts','--config='+CC,'--mode=check','--format=json'])
report=json.loads(c.stdout);emit('MANIFEST.actual-paired-successor-M-and-one-central-repeat.technical.json',{'role':'Actual checks-only technical resumption of Root-applied paired successor; no M7 promotion','rootAuthorization':pin(authpath),'authorSelector':auth['authorSelector'],'independentReviews':auth['independentReviews'],'canonical':pin(L/C),'semantic639':pin(L/SEM),'MExitCode':m.returncode,'finiteDExitCode':d.returncode,'centralExitCode':c.returncode,'actualCentralReport':report,'protectedProofInputsRetained':len(protected),'firstCentralReportUnmodified':pin(first),'noExtraCASWrites':True,'knownOpenExternalGates':auth['knownOpenGates'],'newIndependentVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False});print(json.dumps({'MExitCode':m.returncode,'finiteDExitCode':d.returncode,'centralExitCode':c.returncode,'root':O,'M7Claim':False}),flush=True);raise SystemExit(c.returncode)
