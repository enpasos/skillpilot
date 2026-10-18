# SPDX-License-Identifier: Apache-2.0
"""Independent bounded technical second check; writes only its own evidence package."""
import collections,datetime,hashlib,json,subprocess,zipfile
from pathlib import Path
ROOT=Path.cwd();BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
B=BASE/'chemie-current450-evidence-watch-bounded-M6-acknowledgement-plan-technical-b-20261018-v1'
OUT=BASE/'chemie-current450-evidence-watch-independent-technical-second-check-a-20261018-v1'
HEAD='06a03ecbc193550b73d7d7b3af53a5a7e61b17fb';SEAL_SHA='8c9194385c3ca9ea0b8190e6bf00a1877dc0f7fa96f209b55a2f98e343ea29d3'
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def read(p):return json.loads(Path(p).read_text())
def write(name,d):
 p=OUT/name
 with p.open('x') as f:f.write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 return p
cache={};pins={}
def verify(p):
 k=p['path']
 if k not in pins:pins[k]=pin(k)
 actual=pins[k];assert actual=={x:p[x] for x in ['path','sha256','bytes']},k
 return actual

def pointer(document,p):
 if not p:return document
 assert p.startswith('/')
 for part in p[1:].split('/'):
  part=part.replace('~1','/').replace('~0','~');document=document[int(part)] if isinstance(document,list) else document[part]
 return document

def gitbytes(p):return subprocess.check_output(['git','show',HEAD+':'+str(p)])
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==HEAD
bseal_path=B/'SEAL.pre-install-plan.json';assert pin(bseal_path)['sha256']==SEAL_SHA
bseal=read(bseal_path);assert bseal['normalInstallationPerformed'] is False
for p in bseal['members']:verify(p)
plan=read(B/'PLAN.pending-independent-review-and-root-installation.json');bindings=read(B/'BINDINGS.142-paths-current-HEAD-and-existing-evidence.json');checks=read(B/'CHECK.actual-bounded-candidate-and142-bindings.json');protected=read(B/'PROTECTED.controls-tracker-and-floors.exact.json')
ns={'__file__':str((ROOT/'scripts/canonical_chemistry_evidence_watch.py').resolve()),'__name__':'independent_watch_readonly'};exec(compile(Path(ns['__file__']).read_text(),ns['__file__'],'exec'),ns)
manifest=ns['load_json'](ns['MANIFEST_PATH']);baseline_path=Path(manifest['baselinePath']);baseline_bytes=baseline_path.read_bytes();baseline=json.loads(baseline_bytes);verify(plan['candidate']);candidate=read(plan['candidate']['path'])
assert baseline_bytes==gitbytes(baseline_path)==(B/'history/chemistry-evidence-watch-baseline.before.exact.json').read_bytes()
state,changed,added,removed,unchanged=ns['diff_records'](manifest,baseline);post,cchanged,cadded,cremoved,cunchanged=ns['diff_records'](manifest,candidate)
assert [len(changed),len(added),len(removed),len(unchanged)]==[138,4,0,18]
assert not(cchanged or cadded or cremoved)
old={r['relativePath']:r for r in baseline['watchedFiles']};new={r['relativePath']:r for r in candidate['watchedFiles']};assert len(old)==156 and len(new)==160
compact=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
for p in unchanged:assert compact(old[p])==compact(new[p]),p
assert sorted(k for k in set(baseline)|set(candidate) if k!='watchedFiles' and baseline.get(k)!=candidate.get(k))==['updatedAt','watchedFileCount']
for p,r in new.items():
 assert r.get('hashMode','raw-bytes-v1')==ns['hash_mode'](p)
 if p in old:assert r.get('hashMode','raw-bytes-v1')==old[p].get('hashMode','raw-bytes-v1')
assert plan['proposedNormalWriteAllowlist']==[manifest['baselinePath'],manifest['statusViewPath'],manifest['deltaViewPath']]
assert plan['installationExecuted'] is False and plan['originalWatchExecutedForThisPlan'] is False
assert checks['normalWritesByThisTask']==0 and checks['newScienceDOrM7Votes']==0 and checks['humanApproval'] is False
for p in protected['files']:
 verify(p);assert Path(p['path']).read_bytes()==gitbytes(p['path'])
assert bindings['head']==plan['head']==checks['head']==HEAD
records=bindings['records'];assert len(records)==142 and len({r['path'] for r in records})==142
assert {r['path'] for r in records}==set(changed+added)
assert collections.Counter(r['category'] for r in records)=={'canonical':1,'source':22,'mapping':78,'view':41}
perpath=[];pointer_count=0;integration_files=set();runtime_count=0
for r in records:
 path=r['path'];raw=Path(path).read_bytes();assert raw==gitbytes(path)
 h=r['headRawBytes'];assert h['path']==path and h['sha256']==sha(raw) and h['bytes']==len(raw) and h['commit']==HEAD
 assert h['gitBlob']==subprocess.check_output(['git','rev-parse',HEAD+':'+path],text=True).strip()
 assert r['change']==('changed' if path in changed else 'added')
 assert r['beforeWatchRecord']==old.get(path) and compact(r['candidateWatchRecord'])==compact(new[path])
 assert r['candidateWatchRecord']['sha256']==state['currentRecords'][path]['sha256']
 assert r['technicalRecognitionOnly'] is True and r['effectiveHashMode']==ns['hash_mode'](path)
 current_pin_witnesses=[];view_closure_witnesses=[];source_rules=[];runtime_witnesses=[];integration_refs=[]
 for ref in r['evidence']:
  verify(ref);f=ref['path']
  if f not in cache:cache[f]=read(f)
  doc=cache[f];node=pointer(doc,ref['jsonPointer']);pointer_count+=1
  assert isinstance(ref['scope'],str) and ref['scope']
  if isinstance(node,dict) and node.get('path')==path and node.get('sha256')==sha(raw):current_pin_witnesses.append({'path':f,'jsonPointer':ref['jsonPointer']})
  if '/closure/views/' in ref['jsonPointer']:
   assert node['path']==path and node['viewCompilerErrors']==0 and node['missingProjectedPrerequisitePairs']==[] and node['missingAtomicTargetOrExplicitSupportPairs']==[]
   view_closure_witnesses.append({'path':f,'jsonPointer':ref['jsonPointer']})
  if isinstance(node,dict) and node.get('id') in ['CQR-000','CQR-003','CQR-004','CQR-005']:
   assert node['status']=='pass';source_rules.append(node['id'])
  if f.endswith('POST.final-test-byte-integrity.receipt.json'):
   assert node['path']==path and node['currentSha256']==sha(raw) and node['unchangedSinceAuthorizedInstall'] is True;runtime_witnesses.append({'path':f,'jsonPointer':ref['jsonPointer']})
  if 'integration' in f.lower() and ('RECEIPT.' in f or 'actual-byte-checks.receipt' in f):integration_refs.append({'path':f,'jsonPointer':ref['jsonPointer']});integration_files.add(f)
 assert current_pin_witnesses,path
 if r['category']=='view':assert len(view_closure_witnesses)==1,path
 if r['category'] in ['source','mapping']:assert set(source_rules)=={'CQR-000','CQR-003','CQR-004','CQR-005'},path
 if runtime_witnesses:runtime_count+=1
 perpath.append({'path':path,'change':r['change'],'category':r['category'],'headRawSha256':sha(raw),'headBytes':len(raw),'watchHashMode':r['effectiveHashMode'],'allPointerReferencesVerified':len(r['evidence']),'exactCurrentInputWitnesses':current_pin_witnesses,'currentAll41ClosureWitnesses':view_closure_witnesses,'existingIntegrationWitnesses':integration_refs,'runtimeAfterByteWitnesses':runtime_witnesses})
assert runtime_count==20
# Explicit history verification; a real failed-CI archive is never relabelled as a local reconstruction.
archive=B/'history/failed-run39124585152-artifact12135642700.zip'
with zipfile.ZipFile(archive) as z:
 assert len(z.namelist())==2
 for member in z.namelist():assert z.read(member)==(B/'history'/('failed-CI.'+member)).read_bytes()
for key in ['statusViewPath','deltaViewPath']:
 p=manifest[key];assert (B/'history'/('before-normal.'+Path(p).name)).read_bytes()==gitbytes(p)
failed_log=(B/'history/failed-job117666923952.log').read_text();assert 'Canonical Chemistry evidence-watch self-test passed.' in failed_log and 'changed=138 added=4 removed=0' in failed_log
failed_delta=(B/'history/failed-CI.canonical-gymnasium-chemistry-evidence-watch-delta.md').read_text();assert '138' in failed_delta and all(p in failed_delta for p in changed+added)
# Read the report meaning, not just its digest: M6 plus unresolved CQR-303 and scoped machine results only.
central=read('docs/qa-ci/status/curriculum-quality-status.json');chem=next(c for c in central['curricula'] if c['landscapeId']=='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0');assert chem['maturity']=='M6'
r303=next(r for r in chem['rules'] if r['id']=='CQR-303');assert r303['status']!='pass'
follow=BASE/'chemie-current450-six-header-AP-all41-followup-technical-20261018-v1/SEAL.readonly-final737-checkpoint.json';fs=read(follow)
assert fs['status']=='PASS' and fs['actualExitCode']==0 and fs['chemistryCompilerGoals']==737 and fs['chemistryCompilerErrors']==0 and fs['chemistryCompilerWarnings']==88
assert fs['storedDerivedApplicabilityMismatches']==0 and fs['missingProjectedPairs']==0 and fs['missingAtomicRolePairs']==0 and fs['transitiveAtomicPairs']==73315
assert fs['newScienceNativeM7OrHumanApproval'] is False and fs['normalWrites']==0
assert any(word in bindings['temporalQualification'] for word in ['predate','precede']) and 'No fresh full source-evaluator run is claimed' in bindings['temporalQualification']
assert 'incomplete' in bindings['RPQualification'] and 'not close' in bindings['RPQualification']
# Verify the exact proposed plan and all normal/control/evidence inputs remain immutable through this review.
assert pin(bseal_path)['sha256']==SEAL_SHA
for p in bseal['members']:verify(p)
assert baseline_path.read_bytes()==baseline_bytes
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==HEAD
pathcheck=write('CHECK.independent142-HEAD-pointer-and-history-comparison.json',{'role':'READ_ONLY_TECHNICAL_PATH_COMPARISON_NOT_SCIENTIFIC_REVIEW','head':HEAD,'pathCount':142,'source':22,'mapping':78,'view':41,'canonical':1,'verifiedEvidencePointerCount':pointer_count,'uniqueEvidenceFileCount':len(cache),'currentRuntimeAfterByteWitnesses':runtime_count,'records':perpath,'normalWrites':0,'newScientificOrNativeVotes':0})
receipt=write('REVIEW.independent-bounded-M6-watch-plan.actual.json',{'role':'INDEPENDENT_INFORMED_TECHNICAL_SECOND_CHECK_OF_BOUNDED_M6_SNAPSHOT_ACKNOWLEDGEMENT','status':'PASS','reviewerId':'/root/chemie_final_native_round_a_20261018','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':HEAD,'planSeal':pin(bseal_path),'plan':pin(B/'PLAN.pending-independent-review-and-root-installation.json'),'candidate':pin(plan['candidate']['path']),'contractRead':pin('docs/dev/canonical-gymnasium-chemistry-evidence-watch-review-2026-10-10.md'),'originalBaseline':pin(baseline_path),'baselineCount':156,'candidateCount':160,'actualCurrentDelta':{'changed':138,'added':4,'removed':0,'unchanged':18},'actualCandidateStockDelta':{'changed':0,'added':0,'removed':0},'all18CompleteOldRecordValuesAndKeyOrderPreserved':True,'hashModesUnchanged':True,'changedTopLevelMetadataOnly':['updatedAt','watchedFileCount'],'all142RawFilesExactlyMatchHEAD':True,'allEvidenceFilePinsAndPointersVerified':True,'verifiedEvidencePointerCount':pointer_count,'uniqueEvidenceFileCount':len(cache),'exactNormalWriteAllowlist':plan['proposedNormalWriteAllowlist'],'priorBaselineNormalViewsActualFailedCIArchiveAndDeltaPreserved':True,'allProtectedControlTrackerRegistryAndMaturityFloorBytesUnchanged':True,'existingEvidenceMeaning':['Existing source/course CQR-000/003/004/005 machine results plus concrete partial-source integration transitions; no scientific reopen or new whole-source credit.','Actual post-six-header applicability/all41 follow-up:737 goals,0 errors,88 retained warnings,0 stored/derived differences,73315 atomic closure pairs and0 gaps.','Existing task/orientation/pH integrations and final canonical raw pin;20 actual runtime path-after witnesses preserve mapping/review boundaries.','10:19 source evaluator and11:36:54 central M6 report precede six header fixes; their transition receipts and11:41 follow-up are combined without claiming a fresh full source reevaluation.','RP full versus selected-unit23 carriers stay distinct and incomplete; SH removed runtime decision is cumulative, not identical to the whole source ledger.'],'resolvedPreSealMechanicalFindings':['Final builder uses actual tuple stock API and watchedFiles field.','Final plan normal MD allowlist matches unchanged manifest docs/dev paths.'],'unresolvedTechnicalFindings':[],'decisionScope':'PASS only for installing the exact acknowledged M6 input snapshot after root authorization and rechecking all pinned identities. No permission to change goals, mappings, views, controls, tracker, registry or maturity floors. B must preserve actual normal watch execution results additively.','scientificBoundary':'Hashes identify bytes and routing only. This second check supplies no scientific, D/P/A/M/V, M7 or human approval. CQR-303,190 remaining strict completions, existing content findings, inactive native runs and source pipeline holds remain open.','normalBaselineInstalledByReviewer':False,'normalWrites':0,'fullBuildsOrSourceReevaluations':0,'newScientificOrNativeVotes':0,'humanApproval':False,'newCIPassClaimed':False,'pathComparison':pin(pathcheck)})
seal=write('SEAL.independent-bounded-M6-watch-plan.json',{'role':'INDEPENDENT_TECHNICAL_SECOND_CHECK_NOT_SCIENTIFIC_APPROVAL','status':'PASS','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':[pin(OUT/'check_sealed_plan_readonly.py'),pin(pathcheck),pin(receipt)],'authorPlanSeal':pin(bseal_path),'head':HEAD,'normalWrites':0,'newScientificOrNativeVotes':0})
print(json.dumps({'status':'PASS','receipt':pin(receipt),'seal':pin(seal),'pathComparison':pin(pathcheck),'pointerCount':pointer_count,'uniqueEvidenceFiles':len(cache),'normalWrites':0},ensure_ascii=False))
