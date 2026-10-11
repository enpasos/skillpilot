from pathlib import Path
from datetime import datetime,timezone
import argparse,collections,hashlib,json,subprocess,importlib.util,shutil,stat
R=Path('/home/enpasos/projects/skillpilot')
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-current-M7-commit-scope-portability-and-history-preflight-independent-c-READONLY-v1'
O.mkdir(exist_ok=True)
p=argparse.ArgumentParser();p.add_argument('--stable-author-seal',required=True);p.add_argument('--stable-author-sha',required=True);arg=p.parse_args()
def run(args):return subprocess.check_output(args,cwd=R)
def gitpaths(args):return [z.decode()for z in run(['git',*args,'-z']).split(b'\0')if z]
def shab(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def sha(f):
 h=hashlib.sha256()
 with open(f,'rb')as q:
  for b in iter(lambda:q.read(1024*1024),b''):h.update(b)
 return 'sha256:'+h.hexdigest()
def bind(f):f=Path(f);return {'path':str(f.relative_to(R)),'sha256':sha(f),'bytes':f.stat().st_size}
def load(f):return json.loads(Path(f).read_bytes())
def put(name,d):
 f=O/name
 if f.exists():raise RuntimeError('immutable collision '+name)
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');json.loads(f.read_bytes());return bind(f)
def before(ref,path):return run(['git','show',ref+':'+path])
def diff(a,b,path=''):
 if type(a)!=type(b):return [{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):return [z for k in sorted(set(a)|set(b))for z in ([{'path':path+'/'+k,'before':a.get(k),'after':b.get(k)}]if k not in a or k not in b else diff(a[k],b[k],path+'/'+k))]
 if isinstance(a,list):return [{'path':path,'before':a,'after':b}]if len(a)!=len(b)else[z for i,(q,w)in enumerate(zip(a,b))for z in diff(q,w,path+'/'+str(i))]
 return []if a==b else[{'path':path,'before':a,'after':b}]
start=datetime.now(timezone.utc).isoformat();head=run(['git','rev-parse','HEAD']).decode().strip();assert head=='b257970de283a1a7af8db4566a24feebb1996b1e',head
watchedstart={f:sha(R/f)for f in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','app/scripts/config/goal-books/de-gym-economics-current-canonical.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','docs/qa-ci/status/curriculum-quality-status.json','curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json']}
stable=R/arg.stable_author_seal;assert sha(stable)==('sha256:'+arg.stable_author_sha.removeprefix('sha256:'))
baseline='43461b906438572f4f3b64d056112f4189dca4f4'
modified=gitpaths(['diff','--name-only',head]);new=gitpaths(['ls-files','--others','--exclude-standard']);staged=gitpaths(['diff','--cached','--name-only']);assert staged==[],'Root staging changed before this readonly observation'
scopeallowed=['app/public/assets/goal-visualizations/wirtschaftswissenschaften/','app/scripts/config/goal-books/de-gym-economics-current-canonical.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json','curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/','docs/qa-ci/']
assert all(any(f.startswith(a)for a in scopeallowed)for f in modified),modified
historicalchanged=[f for f in modified if '/quality/goal-evidence/'in f or '/quality/goal-visualization-review/'in f];assert not historicalchanged
upadd=gitpaths(['diff','--name-only','--diff-filter=A',baseline,head]);upmod=gitpaths(['diff','--name-only','--diff-filter=MD',baseline,head]);assert upmod==['.gitattributes','docs/qa-ci/index.md'],upmod
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';BOOK='app/scripts/config/goal-books/de-gym-economics-current-canonical.json';REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';STATUS='docs/qa-ci/status/curriculum-quality-status.json';LED='curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'
cb=load(R/CAN);ca=json.loads(before(baseline,CAN));assert len(cb['goals'])==len(ca['goals'])==702;assert [g['id']for g in ca['goals']]==[g['id']for g in cb['goals']]
canchanges=diff(ca,cb);assert all('/resourceLinks'in d['path']for d in canchanges)
scientific=lambda d:{k:v for k,v in d.items()if k!='resourceLinks'}
assert all(scientific(a)==scientific(b)for a,b in zip(ca['goals'],cb['goals']))
resourceids=[b['id']for a,b in zip(ca['goals'],cb['goals'])if a.get('resourceLinks')!=b.get('resourceLinks')];assert len(resourceids)==15
ba=json.loads(before(baseline,BOOK));bb=load(R/BOOK);bookdiff=diff(ba,bb);assert [d['path']for d in bookdiff]==['/evidenceReviewPaths/0','/goalVisualizationQaPath']
pa=[json.loads(z)for z in before(baseline,ba['evidenceReviewPaths'][0]).splitlines()];pb=[json.loads(z)for z in (R/bb['evidenceReviewPaths'][0]).read_bytes().splitlines()];assert len(pa)==len(pb)==346;assert [q['goalId']for q in pa]==[q['goalId']for q in pb]
profilechanges=[{'goalId':b['goalId'],'deltas':diff(a['profile'],b['profile'])}for a,b in zip(pa,pb)if a['profile']!=b['profile']];assert len(profilechanges)==2;assert {q['goalId']:len(q['deltas'])for q in profilechanges}=={'3e26fb9e-634c-5454-b11f-1d925201182c':6,'13705b9f-9623-500b-80ba-4574b753a29c':2}
metachanges=[{'goalId':b['goalId'],'deltas':diff({k:v for k,v in a.items()if k!='profile'},{k:v for k,v in b.items()if k!='profile'})}for a,b in zip(pa,pb)if a!=b];assert len(metachanges)==17
for z in metachanges:
 permitted=['/profileFingerprint','/reason','/reviewedAt','/reviewer']if z['goalId']in {q['goalId']for q in profilechanges}else['/reviewInputFingerprint'];assert all(d['path']in permitted for d in z['deltas'])
ra=json.loads(before(baseline,REG));rb=load(R/REG);foreignreg=[]
for q in rb['subjects']:
 if q['subject']=='wirtschaftswissenschaften':continue
 old=next(z for z in ra['subjects']if z['subject']==q['subject']);assert q==old;foreignreg.append(q['subject'])
sa=json.loads(before(baseline,STATUS));sb=load(R/STATUS);byold={q['landscapeId']:q for q in sa['curricula']};foreignrows=[]
for q in sb['curricula']:
 if q['path']==CAN:continue
 assert q==byold[q['landscapeId']],q['subject'];foreignrows.append({'landscapeId':q['landscapeId'],'subject':q['subject'],'maturity':q['maturity'],'wholeExactM6Baseline':True})
assert len(foreignrows)==20
eco=next(q for q in sb['curricula']if q['path']==CAN);assert eco['maturity']=='M6';m7={z['id']:z['status']for z in eco['rules']};assert m7['CQR-303']!='pass'
for name in ['Mathematik','Physik']:
 q=next(z for z in sb['curricula']if z['subject']==name);assert q['maturity']=='M7';assert next(z for z in q['rules']if z['id']=='CQR-303')['status']=='pass'
root=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-first-M7-D9-and14-qualified-integration-root-v1';plan=load(root/'03-root-selected14-actual-inspection-and-independent-qualified-import-plan.receipt.json');copies=[]
for q in plan['records']:
 gid=q['goalId'];ps=[R/q['selectedAsset']['path'],R/f'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/{gid}/{gid}.png',R/f'app/public/assets/goal-visualizations/wirtschaftswissenschaften/{gid}/{gid}.png'];bs=[bind(p)for p in ps];assert all(z['sha256']==q['selectedAsset']['sha256']for z in bs);assert all(p.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n'for p in ps);copies.append({'goalId':gid,'selectedSourcePublicPNGWholeCopies':bs,'qualifiedCopyBindingExact':True,'newVisualReviewInThisPreflight':False})
detached=[]
for q in load(root/'07-eight-source-files-detached-and-original-local-alias-inodes-restored.receipt.json')['records']:
 p=R/q['activePath'];assert p.stat().st_nlink==1;assert sha(p)==q['activeQualifiedBytesUnchanged'];assert shab(before(baseline,q['activePath']))==q['originalPreImportBytesAndHeadExact'];detached.append({'activeBinding':bind(p),'nlink':p.stat().st_nlink,'originalM6BytesBinding':q['originalPreImportBytesAndHeadExact'],'originalAuditRepairReceiptReused':True})
huge='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-CI-current-head-source-view-and-test-contract-root-v1/actual-native35-before-after-ordered-scope-practice-source-quantity-parity.READONLY.json';hr=load(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-CI-current-head-source-view-and-test-contract-root-v1/13-byte-exact-compressed-transport-of-large-native35-parity.ROOT.receipt.json');gz=hr['portableRepositoryPath'];assert huge in new and huge not in staged;assert sha(R/huge)=='sha256:'+hr['historicalUncompressedSha256'];assert sha(R/gz)=='sha256:'+hr['portableSha256'];assert before(head,gz)==(R/gz).read_bytes()
own=lambda f:('/wirtschaft-'in f or '/wirtschaftswissenschaften/'in f or f.startswith('docs/qa-ci/wirtschaft-'))
ownnew=[f for f in new if own(f)];toParse=sorted({f for f in modified+ownnew if f.endswith(('.json','.jsonl'))and f!=huge})
parsed=[];errors=[];race=[]
for f in toParse:
 pth=R/f
 try:
  data=pth.read_bytes();bs=shab(data)
  if f.endswith('.jsonl'):
   rows=0
   for i,line in enumerate(data.splitlines(),1):
    if line.strip():json.loads(line);rows+=1
  else:json.loads(data);rows=1
  after=sha(pth)
  if after!=bs:race.append({'path':f,'before':bs,'end':after})
  parsed.append({'path':f,'sha256':bs,'bytes':len(data),'parsedJSONRecords':rows})
 except Exception as e:errors.append({'path':f,'error':str(e)})
assert not errors,errors;assert not race,race
spec=importlib.util.spec_from_file_location('preflight_original_validate_schemas',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);symlinkErrors=module.curriculum_symlink_errors(R);assert not symlinkErrors,symlinkErrors
gitcheck=subprocess.run(['git','diff','--check'],cwd=R,capture_output=True,text=True);assert gitcheck.returncode==0,gitcheck.stdout+gitcheck.stderr
# Actual preflight boundaries include native book proofs already completed by root, without rebuilding.
books=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-current267-plus-qualified-contexts-stable-integration-root-v1';bookproof=[]
for n in ['actual-native-five-book-publication-check.command-receipt.json','actual-native-five-book-original-source-freshness.command-receipt.json','actual-native-stable-five-book-publications.command-receipt.json']:
 d=load(books/n);assert d['exitCode']==0;raw=d['rawLog'];rp=Path(raw)if isinstance(raw,str)else Path(raw['path']);rp=rp if rp.is_absolute()else R/rp;bookproof.append({'completedCommandReceipt':bind(books/n),'actualRawLog':bind(rp),'exitCode':0,'noRebuildInThisPreflight':True})
science=put('actual702-CAN-only15-resource-links-and346-P-only-eight-wording-fields.READONLY.json',{'M6Base':baseline,'currentCAN':bind(R/CAN),'whole702GoalContractsExactExcludingResourceLinks':True,'orderedGoalIdsExact':True,'resourceChangedGoalIds':resourceids,'exactResourceFieldDeltas':canchanges,'bookConfig':bind(R/BOOK),'bookConfigTwoPointerDeltas':bookdiff,'currentP346':bind(R/bb['evidenceReviewPaths'][0]),'profileBodiesExact':344,'wholeRecordsExact':sum(a==b for a,b in zip(pa,pb)),'twoProfileScienceChanges':profilechanges,'seventeenRecordMetadataDeltas':metachanges,'otherExpectedNumbersCaseIdsCoverageRulesExact':True,'PScienceReReviewedHere':False,'original348StatusOrHumanPromotionClaim':False})
asset=put('actual42-PNG-whole-copy-parity-eight-detached-active-source-files.READONLY.json',{'copyGroups':copies,'wholePNGCopies':42,'sourceOldPNGAndPromptDetachedNlinkOne':detached,'newVisualReviewCount':0,'independentOriginalVisualEvidenceReusedFromRootSelected14Plan':bind(root/'03-root-selected14-actual-inspection-and-independent-qualified-import-plan.receipt.json')})
inventory=put('actual-434-to-mergedHEAD-and-current-owned-committable-file-inventories.READONLY.json',{'observedAtUtc':start,'M6Base':baseline,'mergedHEAD':head,'upstreamArchiveOnlyAddedFiles':upadd,'upstreamSharedDocsAttributesModifiedFiles':upmod,'currentModifiedTrackedFiles':modified,'wholeExistingTrackedQHistoricalFileModifications':historicalchanged,'allOwnNewCommittableAuditOrAssetFiles':ownnew,'ownNewFileBytes':sum((R/f).stat().st_size for f in ownnew if (R/f).is_file()),'gitIndexAtReadStart':staged,'explicitNeverStageOrDeleteLocalHugeDuplicate':{'binding':bind(R/huge),'untracked':True,'staged':False,'committedLosslessGzip':bind(R/gz),'gzipWholeExactCurrentMergedHEAD':True,'losslessTransportOriginalRootReceipt':bind(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-CI-current-head-source-view-and-test-contract-root-v1/13-byte-exact-compressed-transport-of-large-native35-parity.ROOT.receipt.json'),'unchangedRawSHAAndGzipSHAAgainstPriorLosslessReceipt':True,'freshDecompressionOrScientificApprovalClaim':False},'pendingAuditCandidatesRemainHistoryNotCompletionCounts':True,'newCodeOnlyInsideInactiveEvidencePackagesNotFunctionalRuntimeWiring':True})
parse=put('actual-all-current-new-owned-JSON-JSONL-parse-and-original-curriculum-symlink-check.READONLY.json',{'performedOnlyAfterStableAuthorSeal':bind(stable),'currentModifiedAndNewOwnedJSONOrJSONLParsed':len(parsed),'allFivePreflightReceiptsAlsoActuallyParsedImmediatelyAfterWrite':True,'individualPhysicalWholeBindings':parsed,'parseErrors':errors,'perFileParseRaces':race,'excludedHistoricalHugeDuplicatePath':huge,'reasonExcluded':'Historical local350MBduplicate already committed losslessly as gzip, explicitly protected from staging/deletion; not a new author JSON. Whole raw digest and committed gzip above verified.','curriculum_symlink_errors':symlinkErrors,'originalNativeFunctionPath':bind(R/'scripts/validate_schemas.py'),'globalSchemaOrBuildRun':False,'gitDiffCheckExitCode':gitcheck.returncode})
watched=[CAN,BOOK,REG,STATUS,LED,QA,bb['evidenceReviewPaths'][0],arg.stable_author_seal];wg=[bind(R/f)for f in watched]
endhead=run(['git','rev-parse','HEAD']).decode().strip();endstage=gitpaths(['diff','--cached','--name-only']);assert endhead==head;assert endstage==staged
actualWatchEnd=[{'path':f,'beforeSHA256':s,'endSHA256':sha(R/f),'exact':sha(R/f)==s}for f,s in watchedstart.items()];assert all(z['exact']for z in actualWatchEnd),actualWatchEnd
seal=put('SEALED-current-M7-commit-preflight-scope-history-copy-and-portability.READONLY.json',{'schemaVersion':1,'sealedAtUtc':datetime.now(timezone.utc).isoformat(),'status':'READONLY_SCOPE_AND_PORTABILITY_PREFLIGHT_KEEP_FINAL_ROOT_COMMIT_QS_OPEN','M6Base':baseline,'mergedHEAD':head,'endHEAD':endhead,'ownPriorAuthorshipDisclosure':'C previously authored targeted Economics Source/Course/HE-source-union and local practice candidates, and independently reviewed four root-authored image corrections. This preflight is mechanical scope/history/parity/portability verification, not another14-goal scientific review, image review, release or self-source approval.','canonical702ScientificContractsPreserved':True,'canonicalResourceLinkFollowers':15,'twoPProfilesWordingFields':8,'unchangedPProfileBodies':344,'currentWholeRecordExactCount':329,'foreignRegistrySubjectsExactM6Base':foreignreg,'foreignReportRowsWholeExactM6Base':foreignrows,'MathPhysicsM7FloorsPreserved':True,'currentEconomicsMaturity':eco['maturity'],'currentCQR303':m7['CQR-303'],'fiveCompletedRootBookProofsReused':bookproof,'newBuildsOrGlobalRuns':0,'newScienceReviews':0,'newVisualReviews':0,'sourceOrCourseNormExpansion':0,'runtimePrivacySecurityPluginFunctionalChanges':0,'activeWritesOrGitStageCommitRemoteActions':0,'indexAtEnd':endstage,'actualEndBindings':wg,'scienceScopeReceipt':science,'copyReceipt':asset,'committableInventory':inventory,'parseAndSymlinkReceipt':parse,'openBoundaries':['The14 native owner author successor is consumed as stable audit history here, not activated or counted; independent A/root qualification and actual final per-ID/native chain/nonloss remain separate.','Root must run its bundled final schemas and any required final status/floor checks for the actual commit epoch, stage only intended reviewed scope, and obtain actual GitHub CI after commit/push. This preflight does not establish CI for a future commit.','Economics remains honestlyM6 withCQR303open; partial candidates and preserved audit history are not strictM7completion counts.','The350MBhistorical local duplicate remains untracked and untouched; committed lossless gzip is the portable artifact.','No human approval/release or whole-source review restart is asserted.']})
shutil.copy2('/tmp/economics_m7_commit_preflight_c.py',O/'actual-independent-preflight-materialization.READONLY.py')
print(json.dumps({'seal':seal,'JSONJSONLParsed':len(parsed),'parseErrors':len(errors),'symlinkErrors':len(symlinkErrors),'trackedModified':len(modified),'ownNewAuditOrAssetFiles':len(ownnew),'currentMaturity':eco['maturity'],'strictM7Claim':False},ensure_ascii=False))
