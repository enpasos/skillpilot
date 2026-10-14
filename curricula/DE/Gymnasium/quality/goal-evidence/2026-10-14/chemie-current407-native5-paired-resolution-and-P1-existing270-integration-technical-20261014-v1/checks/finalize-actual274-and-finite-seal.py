# Apache-2.0. Actual stock results and finite custody; no new scientific judgment.
from pathlib import Path
import json,hashlib,shutil,datetime,importlib.util
repo=Path.cwd();base=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
own=base/'chemie-current407-native5-paired-resolution-and-P1-existing270-integration-technical-20261014-v1'
old=base/'chemie-current407-central-existing262-plus-reviewed-eight-inactive-root-20261014-v1'
shared=base/'chemie-current407-Q3-four-plus2652-PE-shared-native5-first-pass-technical-20261014-v1'
q3=base/'chemie-q3-four-v3-reviewed-current407-integration-preparation-20261014-v1'
host=Path('tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host')
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,j):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def copy(src,dst):assert not dst.exists(),dst;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);assert src.read_bytes()==dst.read_bytes()
def chem(j):return next(s for s in j['subjects'] if s['subject']=='chemie')
for f in ['ACTUAL.current407-native5-existing270-chemistry-central-stock-report.json','ACTUAL.current407-native5-central-stock-run-timestamps.json']:copy(host/own/'receipts'/f,own/'receipts'/f)
for suffix in ['stdout','stderr']:copy(host/f'current407-native5-existing270-central.attempt3.actual.{suffix}.txt',own/f'receipts/current407-native5-final274.actual.{suffix}.txt')
reportpath=own/'receipts/ACTUAL.current407-native5-existing270-chemistry-central-stock-report.json';report=read(reportpath);s=chem(report)
assert s['strictComplete']==len(s['strictCompleteGoalIds'])==274 and s['denominator']==407 and s['remaining']==133
assert report['blockingIssueCount']==0 and not s['issues'] and len(s['requiredChecks'])==6 and all(c['status']=='pass' for c in s['requiredChecks'])
stdout=read(own/'receipts/current407-native5-final274.actual.stdout.txt');assert stdout['strictComplete']==274 and stdout['blockingIssueCount']==0
oldreport=old/'receipts/ACTUAL.current407-inactive-chemistry-central-stock-report.completed270.json';oldset=set(chem(read(oldreport))['strictCompleteGoalIds'])
protected=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie262-current402-closed34-active-adoption-root-20261013-v1/receipts/ACTUAL.full-registry-current402-five-gate-report.json');protectedset=set(chem(read(protected))['strictCompleteGoalIds'])
newset=set(s['strictCompleteGoalIds']);ids=read(own/'native-five/resolution-index.json')['batchGoalIds'];assert len(oldset)==270 and len(protectedset)==262 and oldset<=newset and protectedset<=newset and newset-oldset==set(ids[:4])
assert ids[4] in oldset
oldseal=old/'SEAL.finite-C407-completed270-and-preserved269-history.actual.json';assert sha(oldseal)=='sha256:d1acb48c782e6fddd92fc382060651b9918c2f93b6787474978dd3f55e1b31a1'
assert sha(oldreport)=='sha256:7f635ae6aaafde9391ee6bfd9958e563cbf958226cfd0821eaee0d2b358223ed'
assert sha(old/'receipts/ACTUAL.current407-inactive-chemistry-central-stock-report.json')=='sha256:41fe292475f0db70555f8636e99116bcc0a9744821aef0e193abd0edc4f0fd9b'
canonical=read(own/'candidate/canonical533.current407.N5.inactive.json');byid={g['id']:g for g in canonical['goals']}
cas=read(q3/'CAS.exact-four-whole-goals.before-after.actual.json');bodyrows=[]
for row in cas['rows']:
 gid=row['goalId'];assert byid[gid]==row['after'],gid
 bodyrows.append({'goalId':gid,'wholeCurrentGoalEqualsPreviouslyDualReviewedV3Successor':True,'wholeDEENGoal':byid[gid]})
write(own/'CHECK.exact-current-four-whole-bodies-versus-original-dual-reviewed-v3-CAS.actual.json',{'schemaVersion':1,'sourceCAS':bind(q3/'CAS.exact-four-whole-goals.before-after.actual.json'),'wholeCurrentBodiesActuallyCompared':bodyrows,'native5OriginalAAndBWholeCurrentBindingStockValid':True,'newScienceVotesByIntegrator':0})
# All five selected V tuples require both physical asset copies and actual current approval bytes.
qa=read(host/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');qaids={r['goalId']:r for r in qa['records']};vrows=[]
for gid in ids:
 r=qaids[gid];links=[l for l in byid[gid]['resourceLinks'] if l.get('role')=='primary' and l.get('type')=='goal-visualization'];assert len(links)==1 and links[0]['url']==r['imageUrl']
 assert r['aiApproved']=='yes' and r['aiApprovedAssetSha256']==r['assetSha256']
 pub=host/r['publicAssetPath'];can=host/r['canonicalAssetPath'];assert pub.exists() and can.exists() and sha(pub)==sha(can)==r['assetSha256']
 vrows.append({'goalId':gid,'wholeQARow':r,'publicAlias':r['publicAssetPath'],'canonicalAssetPath':r['canonicalAssetPath'],'bothActualPathsExist':True,'actualBytesSha256':sha(pub),'matchesActualApprovedBytes':True})
assert (host/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json').read_bytes()==(own/'candidate/QA.current407.N5.current270-exact-except-two-reviewed-PNGs.inactive.json').read_bytes()
write(own/'CHECK.all-five-selected-QA-public-and-canonical-paths-against-actual-approved-bytes.actual.json',{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':vrows,'allFivePass':True,'freshnessAloneNotUsedAsAssetExistenceProof':True,'newPixelVotes':0})
p1=[json.loads(l) for l in (own/'P/P1.2652.new-PE.E0-G0.original.byte-exact.jsonl').read_text().splitlines() if l.strip()];assert len(p1)==1 and p1[0]['evidenceLevel']=='E0' and p1[0]['maximumClaimScope']=='G0' and p1[0]['reviewAuthority']=='ai_candidate'
receipt={'schemaVersion':1,'role':'Actual genuine completed finite Chemistry stock run, not a new scientific review','sessionId':4589,'exitCode':0,'exitProvenance':'Direct tools.write_stdin completion for session4589 returned exit_code0; exact final stdout/stderr and full report copied unchanged.','timestamps':read(own/'receipts/ACTUAL.current407-native5-central-stock-run-timestamps.json'),'command':['node','app/node_modules/tsx/dist/cli.mjs',str(own/'checks/run-native5-existing270-central-stock.mts')],'privateWorkingDirectory':str(host),'fullReport':bind(reportpath),'stdout':bind(own/'receipts/current407-native5-final274.actual.stdout.txt'),'stderr':bind(own/'receipts/current407-native5-final274.actual.stderr.txt'),'allSixStockChecksPass':True,'blockingIssueCount':0,'unchangedStockEngine':True,'priorFailedAnd272RunsPreserved':True,'activeAliasMutation':False,'newScientificVotes':0}
write(own/'receipts/ACTUAL.completed-session4589-final274-stock-run.receipt.json',receipt)
measure={'schemaVersion':1,'measuredAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Actual inactive current407 candidate after dual-native5 and exact existing science integration','strictComplete':274,'denominator':407,'percentage':'67.3%','remaining':133,'fullStockReport':bind(reportpath),'actualCompletedRunReceipt':bind(own/'receipts/ACTUAL.completed-session4589-final274-stock-run.receipt.json'),'allSixStockChecksPass':True,'blockingIssueCount':0,'previous270StrictIds':sorted(oldset),'protected262StrictIds':sorted(protectedset),'all270PreviousStrictIdsPreserved':True,'all262ActiveStrictIdsPreserved':True,'lostPrevious270Ids':sorted(oldset-newset),'lostActive262Ids':sorted(protectedset-newset),'exactFourNewClosures':sorted(newset-oldset),'selected2652AlreadyCounted':True,'selected2652ProfileE0G0':True,'old2652E1G1WholeOriginalPreserved':bind(own/'inputs/P2652.previous-valid-E1-G1.selected-original.byte-exact.jsonl'),'nativeD5GenuineFirstPassOriginalRecordsAndRunsExact':True,'newScientificVotesByThisIntegrator':0,'sourceWholeHB021Approved':False,'sourceNineQ3HoldsRemain':True,'source34SixDisagreementsRemain':True,'lastBroadSourceMaturity':'M1','M6SourceHoldsRemain':True,'activeStrictComplete':262,'activeDenominator':402,'activeWrites':False,'humanApproval':False,'humanTrial':False,'actualLearnerPerformance':False,'actualExperimentPerformance':False,'commitReady':False,'newGitHubGreen':False}
write(own/'MEASURE.actual274-current407-native5-plus-four-preserved270-and262.actual.json',measure)
doc=Path('docs/qa-ci/chemie262-five-gate-integration-source-holds-2026-10-14.md');assert '274/407' in doc.read_text() and 'aktiv weiterhin 262/402' in doc.read_text()
manifest={'schemaVersion':1,'role':'Finite technically integrated genuine paired Native5 on current270 successor; no new science by integrator','startedAtUTC':read(own/'INPUTS.exact-independent-seals-and-original-metadata-transport.actual.json')['startedAtUTC'],'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provider':'OpenAI Codex','model':'GPT-6 session identity; exact serving model revision and sampling unknown','scopeGoalIds':ids,'canonicalCandidate':bind(own/'candidate/canonical533.current407.N5.inactive.json'),'semanticNormalAliasCandidate':bind(own/'candidate/semantic533.current407.N5.normal-alias.inactive.json'),'operativeQACandidate':bind(own/'candidate/QA.current407.N5.current270-exact-except-two-reviewed-PNGs.inactive.json'),'rawSharedWholeQAAndTransientFullRegenerationAreNotOperative':True,'normalCurrentNative5ResolutionIndex':bind(own/'native-five/resolution-index.json'),'normalCentralChemistryOnlyConfig':bind(own/'config/chemie-current407-native5-existing270.inactive.config.json'),'exactFourBodyCAS':bind(own/'CHECK.exact-current-four-whole-bodies-versus-original-dual-reviewed-v3-CAS.actual.json'),'allFivePhysicalAssetAndApprovalBindings':bind(own/'CHECK.all-five-selected-QA-public-and-canonical-paths-against-actual-approved-bytes.actual.json'),'actualFinalMeasurement':bind(own/'MEASURE.actual274-current407-native5-plus-four-preserved270-and262.actual.json'),'sourceAndHumanHoldsRemain':True,'sourceMaturityM1LastMeasuredBroadly':True,'noNewScientificVotes':True,'noHumanClaim':True,'noActiveAdoptionOrGitOperation':True}
write(own/'FINAL.native5-existing270-to-actual274-technical-integration.manifest.json',manifest)
inputs=[bind(oldseal),bind(oldreport),bind(protected),bind(shared/'SEAL.finite-current407-Q3-four-plus2652-PE-shared-native5-first-pass-inputs.actual.json'),bind(q3/'SEAL.finite-four-reviewed-v3-current407-technical-integration.actual.json'),bind(q3/'CAS.exact-four-whole-goals.before-after.actual.json'),bind(doc)]
for s in read(own/'INPUTS.exact-independent-seals-and-original-metadata-transport.actual.json')['seals']:
 f=Path(s['path']);assert sha(f)==s['sha256'];inputs.append(bind(f))
parsed=[]
for f in sorted(own.rglob('*')):
 assert not f.is_symlink(),f
 if f.is_file() and f.suffix in ['.json','.jsonl']:
  rows=[json.loads(l) for l in f.read_text().splitlines() if l.strip()] if f.suffix=='.jsonl' else [read(f)];parsed.append({'path':str(f),'records':len(rows),'sha256':sha(f)})
spec=importlib.util.spec_from_file_location('stock',repo/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);errors=m.curriculum_symlink_errors(str(repo));assert not errors,errors
for f in inputs:assert sha(Path(f['path']))==f['sha256']
write(own/'checks/finite-final274-all-JSON-JSONL-parse-original-seals-history-protected-sets-and-stock-guard.actual.json',{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'parsed':parsed,'allFiniteOwnedJsonJsonlParsed':True,'stockCurriculumSymlinkErrors':errors,'stockGuardPass':True,'all262And270Retained':True,'exact4NewIds':sorted(newset-oldset),'allSelectedPublicAndCanonicalVPathsActuallyChecked':True,'actual274SixPassZeroBlockers':True,'historical269270And272ReceiptsUnchanged':True})
outputs=[bind(f) for f in sorted(own.rglob('*')) if f.is_file() and not f.name.startswith('SEAL.')]
seal={'schemaVersion':1,'role':'finite_native5_dual_current407_actual274_technical_integration_without_active_or_source_adoption','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputBindings':inputs,'outputBindings':outputs,'fileCount':len(outputs),'totalBytes':sum(x['bytes'] for x in outputs),'actualFinalStrict':274,'denominator':407,'exactNewClosures':sorted(newset-oldset),'all262ProtectedAnd270CandidateIdsPreserved':True,'stockSixChecksPass':True,'stockGlobalSymlinkGuardPass':True,'allFiniteOwnedJSONJSONLFullyParsed':True,'allFiveSelectedActualApprovedPublicAndCanonicalAssetBytesChecked':True,'sourceM1AndM6HoldsRemain':True,'newIntegratorScienceVotes':0,'humanApproval':False,'activeWrites':False,'registryWrites':False,'engineWrites':False,'gitWrites':False,'commitReady':False}
sp=own/'SEAL.finite-native5-dual-existing270-actual274-technical-integration.actual.json';write(sp,seal);read(sp)
print(json.dumps({'strict':274,'denominator':407,'new4':sorted(newset-oldset),'retained262and270':True,'seal':sha(sp),'measure':sha(own/'MEASURE.actual274-current407-native5-plus-four-preserved270-and262.actual.json'),'fileCount':len(outputs),'bytes':seal['totalBytes']}))
