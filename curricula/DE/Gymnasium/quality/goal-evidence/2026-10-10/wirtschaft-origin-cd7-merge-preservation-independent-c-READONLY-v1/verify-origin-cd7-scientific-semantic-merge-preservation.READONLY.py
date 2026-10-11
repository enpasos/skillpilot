import pathlib,json,hashlib,datetime,subprocess,copy
P=pathlib.Path;q=P('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');o=q/'wirtschaft-origin-cd7-merge-preservation-independent-c-READONLY-v1'
load=lambda p:json.loads(P(p).read_text());sha=lambda b:hashlib.sha256(b).hexdigest();bind=lambda p:{'path':str(p),'sha256':sha(P(p).read_bytes()),'bytes':P(p).stat().st_size};git=lambda *a:subprocess.check_output(['git',*a])
bp=o/'preserved-remote-cd7-and-qualified-Economics-d2dbac-before.EXACT.json';base=load(bp);checks={}
def ck(k,v):
 checks[k]=bool(v)
 if not v:raise AssertionError(k)
def exact(b,label):ck(label,bind(b['path'])=={k:b[k] for k in ['path','sha256','bytes']})
ck('preservedQualifiedBeforeSnapshotExact',bind(bp)['sha256']=='cbd6935120f4ebf4d8bd105507e525ba3e7bcacea5aee28a36c019868f3ac2e1')
regp='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=load(regp);subs={s['subject']:s for s in reg['subjects']}
ck('currentEconomicsRegistryWholeExactToQualifiedBefore',subs['wirtschaftswissenschaften']==base['localEconomicRegistryWholeEntry'])
ck('currentChemistryRegistryWholeExactToRemote',subs['chemie']==base['remoteChemistryRegistryWholeEntry'])
for old in base['otherRegistryEntriesCurrent']:ck('otherRegistryWholeExact:'+old['subject'],subs[old['subject']]==old)
ck('allOtherRegistryRootFieldsExactToRemote', {k:v for k,v in reg.items() if k!='subjects'}==base['remoteRegistryOtherFields'])
for b in base['localEconomicScientificAndQAInputBindings']:exact(b,'qualifiedEconomicsWholeInputExact:'+b['path'])
for b in base['remoteChemistryDirectRegistryInputs']:exact(b,'directChemistryRegistryReferenceRemoteExact:'+b['path'])
strict=[b for b in base['remoteChangedBindings195'] if b['strictRemoteChemistryScienceOrAsset'] and not b['sharedMetadataPossible']]
for b in strict:exact(b,'upstreamChangedChemistryWholeRemoteExact:'+b['path'])
# No upstream foreign content review is restarted: preserve exact authoritative remote bytes.
rootbase=P('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final702-current346-M6-source-scope-and-foreign-floor-independent-c-READONLY-v1/preserved-original-foreign20-and807-input-before-baseline.EXACT.json');foreign=load(rootbase);remoteChanged={b['path']:b for b in base['remoteChangedBindings195']};foreignChecks=[]
for b in foreign['foreignDirectInputs']+foreign['allForeignCanonicalWholeBodies']+foreign['qualityImplementationBodies']:
 if b['path']=='app/scripts/generateCurriculumQualityStatus.ts':
  ck('explicitQualifiedEconomicsOnlyAssessedTargetCodeBodyExact',bind(b['path'])['sha256']=='514bab03b7c041655e0063a4bf6ecb7ac4cd51edda9581e76182e980aa384957');continue
 if b['path'] in remoteChanged:
  rb=remoteChanged[b['path']];exact(rb,'explicitUpstreamSuccessorProtectedInputExact:'+b['path']);foreignChecks.append({'path':b['path'],'expected':'new remote cd7 exact','sha256':rb['sha256']})
 else:
  expected={**b,'sha256':b['sha256'].replace('sha256:','')};exact(expected,'allOtherProtectedForeignWholeInputExact:'+b['path']);foreignChecks.append({'path':b['path'],'expected':'qualified protected baseline exact','sha256':expected['sha256']})
ledgerp='curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json';currentLedger=load(ledgerp);bl=json.loads(git('show',base['mergeBase']+':'+ledgerp));old=base['localLedgerBefore'];up=base['remoteLedgerBefore'];newpaths=currentLedger['activeBatchConfigPaths'];ownadd=set(old['activeBatchConfigPaths'])-set(bl['activeBatchConfigPaths']);retired=set(bl['activeBatchConfigPaths'])-set(up['activeBatchConfigPaths']);expected=set(up['activeBatchConfigPaths'])|ownadd
ck('wholeLedgerRootFieldsPreserved', {k:v for k,v in currentLedger.items() if k!='activeBatchConfigPaths'}=={k:v for k,v in up.items() if k!='activeBatchConfigPaths'})
ck('ledgerExactRemotePlusSixOwnedEconomicAdditions',set(newpaths)==expected and len(newpaths)==len(expected)==12 and len(ownadd)==6)
ck('oneReviewedOldChemistryBatchRetiredAsRemote',len(retired)==1 and not (retired&set(newpaths)))
for p in ownadd:ck('ownEconomicLedgerPathPreserved:'+p,p in newpaths)
for p in up['activeBatchConfigPaths']:ck('remoteLedgerPathPreserved:'+p,p in newpaths)
# Two atlas receipts have exactly one technical shared-policy hash successor, qualified independently by A.
atlas=q/'wirtschaft-BW43-remote-cd7-two-atlas-policy-SHA-only-independent-a-READONLY-v1/SEALED-independent-post-cd7-active-two-foreign-atlas-SHA-only.READONLY.json'
ck('twoAtlasTechnicalIndependentASealExact',bind(atlas)['sha256']=='8a9ddc79686f71e21069b38a787b7c63107fca7c20e5f2e2b4dea47d22911eac')
az=load(atlas)
for b in az.get('artifacts',[]):
 ck('twoAtlasIndependentArtifactExact:'+b['path'],bind(b['path'])=={**b,'sha256':b['sha256'].replace('sha256:','')})
receipt={'status':'KEEP_merge_scientific_and_semantic_preservation_only_generated_final_report_pending','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'/root/economics_common_source_course_independent_c','checks':checks,'before':bind(bp),'remoteCommit':base['remoteCommit'],'qualifiedLocalCheckpoint':base['qualifiedLocalCheckpointCommit'],'remoteChangedWholeChemistryScienceAssetsAndViewsExact':len(strict),'directRemoteChemistryRegistryBindingsExact':len(base['remoteChemistryDirectRegistryInputs']),'qualifiedEconomicWholeInputsExact':len(base['localEconomicScientificAndQAInputBindings']),'allOtherProtectedInputChecks':len(foreignChecks),'protectedInputChecks':foreignChecks,'registrySubjectMerge':'Whole Chemistry entry exact cd7; whole Economics entry exact qualified d2dbac; Math/Physics/Biology entries exact before.','ledger':{'currentPaths':len(newpaths),'remotePaths':len(up['activeBatchConfigPaths']),'ownAdditions':sorted(ownadd),'completedRemoteChemistryRetirement':sorted(retired)},'twoAtlasTechnicalOnlyAQualification':bind(atlas),'foreignScientificReviewRestart':False,'activeWrites':0,'globalGeneratorOrBuild':False,'finalGeneratedReportPending':True,'wholeMergedM6OrCIClaim':False,'humanReviewClaim':False}
p=o/'actual-remote-cd7-science-registry-ledger-and235-Economics-whole-preservation.READONLY.json';p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'path':str(p),'sha256':bind(p)['sha256'],'checks':len(checks),'strictRemoteFiles':len(strict),'remoteChemistryRefs':111,'economicInputs':235,'generatedReportPending':True}))
