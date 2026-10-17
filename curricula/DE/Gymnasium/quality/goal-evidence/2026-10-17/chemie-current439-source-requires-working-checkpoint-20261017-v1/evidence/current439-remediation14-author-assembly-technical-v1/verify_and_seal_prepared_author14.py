from pathlib import Path
import datetime,hashlib,json,os,subprocess
O=Path(__file__).resolve().parent;C=O/'capsule'
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def put(p,obj):
 assert not p.exists();raw=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode();json.loads(raw)
 with p.open('xb') as f:f.write(raw)
 return pin(p)
plan=read(O/'PLAN.author14.exact-prospective-change-map.json');selector_path=O/'SELECTOR.clean-remediation14-reviewer-inputs.sealed.json';s=read(selector_path);v=read(s['view']['path'])
native=Path(s['nativeRoot']);cfg=plan['draftBatchConfigRelativePath'];N=Path(plan['sourceRoot'])
guards={p['path']:p for p in read(O/'INPUTS.final-actual-P4-V4-material-pins.json')['sourceGuards']}
for p in s['sourcePartnerPins']:guards[p['path']]=p
for expected in guards.values():assert pin(expected['path'])==expected,expected['path']
first=read(native/'round-a/description-review-input.json');second=read(native/'round-b/description-review-input.json');assert first==second
assert s['goalIds']==[g['goalId'] for g in v['goals']]==[g['goalId'] for g in first['goals']]
for safe,raw in zip(v['goals'],first['goals']):
 assert safe['reviewContext']['evidenceProfile']['profile']==raw['reviewContext']['evidenceProfile']['profile']
 assert safe['canonicalContext']==raw['canonicalContext']
 assert safe['reviewContext']['page']=={k:value for k,value in raw['reviewContext']['page'].items() if k!='evidenceReview'}
 assert all(k not in safe['reviewContext']['evidenceProfile'] for k in ['reason','reviewer','reviewRunIds','dissent','reviewedAt','reviewId'])
 for key in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','goalFingerprint','pageFingerprint']:
  if key in raw:assert safe[key]==raw[key]
assert len(v['goals'])==14 and len(read(O/'MATERIAL.28c-five-whole-operative-cases.no-review-metadata.json')['cases'])==5
argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(C/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'check','--config',cfg]
result=subprocess.run(argv,cwd=C,text=True,capture_output=True,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'),check=False)
for name,text in [('stdout',result.stdout),('stderr',result.stderr)]:
 path=O/f'CHECK.stock-prepared-native14.{name}.txt';assert not path.exists()
 with path.open('xb') as f:f.write(text.encode())
assert result.returncode==0,result.stderr
ledger_rel=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
assert (C/ledger_rel).read_bytes()==(N/ledger_rel).read_bytes()
assert pin(C/ledger_rel)['sha256']=='3359f212b650c6cf95f8c6208ab114f12e6efae1a8ff92b87469be5aad85e706'
for ref in read(C/ledger_rel)['activeBatchConfigPaths']:assert (C/ref).read_bytes()==(N/ref).read_bytes()
for expected in guards.values():assert pin(expected['path'])==expected,expected['path']
model=read(native/'bundle/book-model.json');assert len(model['pages'])==14
assert not (C/plan['privateReviewRootRelativePath']/'book-model.full439.author-input-base.draft.json').exists()
artifact_pins=[]
for p in sorted(O.rglob('*')):
 if p.is_file() and not p.is_symlink() and 'capsule' not in p.relative_to(O).parts:artifact_pins.append(pin(p))
out={'schemaVersion':1,'role':'Verified bounded14 author input assembly, not a scientific synthesis/approval',
 'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PREPARED_FOR_FRESH_INDEPENDENT_D_P_REVIEW',
 'privateCapsule':str(C),'cleanReviewerSelector':pin(selector_path),'cleanScientificView':s['view'],
 'configRelativePath':cfg,'nativeRoot':str(native),'stockPreparedCheck':{'argv':argv,'exitCode':0,'actualStdout':result.stdout,'stdout':pin(O/'CHECK.stock-prepared-native14.stdout.txt'),'stderr':pin(O/'CHECK.stock-prepared-native14.stderr.txt')},
 'initialPrepareAttemptFailedPathSafetyOnly':read(O/'EXECUTION.one-native14-stock-prepare.completed.json'),
 'documentedBoundedRetrySucceeded':read(O/'EXECUTION.native14-stock-prepare-retry.completed.json'),
 'exactProspectiveChanges':{'descriptions':plan['descriptionGoalIds'],'profiles':plan['profileGoalIds'],'images':plan['visualGoalIds'],'distinctGoalCount':14,'canonicalOtherWholeGoalsUnchanged':642,'POtherWholeLinesUnchanged':425,'PProfileBodiesUnchanged':433},
 'stockFingerprintBindings':pin(O/'CHECK.actual-author14-stock-fingerprints-and-exact-profile-retention.json'),
 'actualP4AndV4SourcePackageCopies':pin(O/'INPUTS.final-actual-P4-V4-material-pins.json'),
 'fiveWhole28cCases':pin(O/'MATERIAL.28c-five-whole-operative-cases.no-review-metadata.json'),
 'sourceGuardsBeforeAndAfterIdentical':True,'sourceGuardCount':len(guards),'sourceGuards':list(guards.values()),
 'twentyUnionLedgerExact':pin(C/ledger_rel),'newBatchRegisteredInLedger':False,'currentPrimarySourceNUnchanged':True,
 'historicalOrPeerReviewMetadataAvailableInScientificView':False,'wholeAuthoredProfileBodiesAndMaterialsPreserved':True,
 'actualIndependentVMetadataOnly':True,'newAorMDecisionsAuthored':False,'independentDPorAcceptanceAuthored':False,
 'remainingDependencies':['Fresh independent native14 ROUND-A and ROUND-B FIRSTs and exact candidate stock records/runs.',
  'Parent integration of the separately actual independent A/M4 evidence; no fabricated A/M rebinding approval.',
  'Any later synthesis, current-context impact binding, registry activation and full machine gates remain separate parent work.'],
 'humanApproval':False,'humanTrial':False,'fullCentralOrM7Run':False,'full439PublicationGenerated':False,'boundedBookPageCount':14,
 'supportingTechnicalArtifactPins':artifact_pins}
receipt=put(O/'RECEIPT.guarded-remediation14-author-input-assembly.sealed.json',out)
# Seal only local input files. Linked, independently evolving source trees are not traversed.
for root,dirs,names in os.walk(O,followlinks=False):
 dirs[:]=[d for d in dirs if not (Path(root)/d).is_symlink()]
 for name in names:
  p=Path(root)/name
  if p.is_file() and not p.is_symlink():p.chmod(0o444)
print(json.dumps({'receipt':receipt,'selector':pin(selector_path),'view':s['view'],'sourceGuardCount':len(guards),'stockCheck':result.stdout,'bookDigest':s['bookDigest'],'bundleFingerprint':s['bundleFingerprint'],'rounds':[{k:r[k] for k in ['round','campaignId','roundId','batchId','batchInputFingerprint']} for r in s['rounds']]}))
