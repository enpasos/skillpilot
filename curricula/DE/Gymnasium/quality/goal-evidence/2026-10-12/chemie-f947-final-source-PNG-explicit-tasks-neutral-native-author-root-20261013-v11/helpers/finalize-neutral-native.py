# Apache-2.0. CAS and technical closure only; no scientific or human acceptance.
from pathlib import Path
import datetime, hashlib, importlib.util, json, os, subprocess
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N=E/'chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11'
F=E/'chemie-f947-bounded-source-route-remediation-author-20261013-v9';P=E/'chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9'
X=R/'tmp/chemie-f947-final-neutral-native-execution-20261013-v11';G='f947cd04-952a-5a9d-9445-3ffc70e02c3c'
rd=lambda p:json.loads(p.read_text());h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();rp=lambda p:str(p.relative_to(R));bind=lambda p:{'path':rp(p),'sha256':h(p),'bytes':p.stat().st_size}
def wr(p,d):
 assert p.is_relative_to(N) and not p.exists()
 parent=p.parent
 while parent!=R:
  assert parent.is_dir() and not parent.is_symlink(),parent;parent=parent.parent
 p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
selector=rd(N/'REVIEW_INPUTS.final-one-goal.neutral.json')
assert selector['currentCanonicalBinding']['sha256']=='sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
assert h(R/selector['currentCanonicalBinding']['path'])==selector['currentCanonicalBinding']['sha256']
def verify_bindings(value):
 if isinstance(value,dict):
  if isinstance(value.get('path'),str) and isinstance(value.get('sha256'),str):
   assert h(R/value['path'])==value['sha256'],value['path']
  for v in value.values():verify_bindings(v)
 elif isinstance(value,list):
  for v in value:verify_bindings(v)
verify_bindings(selector)
seal_bindings=[]
for path in [F/'FINAL.bounded-source-author-proposal.freeze.json',P/'FINAL.inactive-original17-adoption.freeze.json',E/'chemie-f947-mobile-clear-PU-raster-author-20261013-v9/FINAL.mobile-clear-author.seal.json',E/'chemie-f947-mobile-clear-actual-V-independent-20261013-v10/FINAL.independent-actual-V.seal.json',E/'chemie-f947-task-demand-complete-final-content-author-20261013-v10/FINAL.task-content-author.freeze.json']:
 data=rd(path);bindings=data.get('ownedFileBindings',data.get('ownedFiles',[]))
 for b in bindings:
  src=R/b['path'] if b['path'].startswith('curricula/') else path.parent/b['path']
  assert h(src)=='sha256:'+b['sha256'].removeprefix('sha256:'),(path,src)
 seal_bindings.append(bind(path))
plan=rd(N/'source/FINAL.source-route-author-plan.pending-scientific-judgment.json')
oldplan=rd(F/'SOURCE_ROUTE_PLAN.only-f947-components-author-pending.json')
assert len(plan['authorProposedSourceChanges'])==23
assert {i['originalLiveBinding']['path'] for i in plan['authorProposedSourceChanges']}=={i['originalLiveBinding']['path'] for i in oldplan['authorProposedSourceChanges']}
assert sum(len(i['removedOnlyFalseF947FlatRows']) for i in plan['authorProposedSourceChanges'])==54
for i in plan['authorProposedSourceChanges']:
 assert h(R/i['originalLiveBinding']['path'])==i['originalLiveBinding']['sha256']
 assert h(R/i['originalByteExactOwnedArchive']['path'])==i['originalLiveBinding']['sha256']
 original=rd(R/i['originalLiveBinding']['path']);expected=json.loads(json.dumps(original))
 expected['mappings']=[r for r in expected['mappings'] if r not in i['removedOnlyFalseF947FlatRows']]
 for d in expected.get('decisions',[]):
  if d['sourceGoalId'] in i['changedOnlyF947DecisionComponents']:d['canonicalGoalIds']=[id for id in d['canonicalGoalIds'] if id!=G]
 assert rd(R/i['authorCandidateBinding']['path'])==expected
 assert h(X/i['proposedFutureLivePath'])==i['authorCandidateBinding']['sha256']
 assert not (X/i['originalLiveBinding']['path']).exists()
 assert h(X/i['proposedFutureArchivePath'])==i['originalLiveBinding']['sha256']
 assert not (R/i['proposedFutureLivePath']).exists() and not (R/i['proposedFutureArchivePath']).exists()
transport=rd(F/'checks/historical-transport40-private-regular-byte-exact-prospective.actual.json')
for t in transport['records']:
 active=R/t['historicalInputPathUnchanged'];private=X/t['historicalInputPathUnchanged']
 assert active.is_symlink() and os.readlink(active)==t['currentHistoricalLinkTarget']
 assert not private.is_symlink() and h(private)==h(active)==t['expectedHistoricalContentSha256']
for b in ['economicsMemoryConfigBinding','currentQualityReportBinding']:
 assert h(R/transport[b]['path'])==transport[b]['sha256']
for p in [X/N.relative_to(R),X/'curricula/DE/Gymnasium/quality',X/'curricula/DE/Gymnasium/quality/goal-book-publication',X/'app/public']:
 cur=X
 for part in p.relative_to(X).parts:
  cur=cur/part;assert cur.is_dir() and not cur.is_symlink(),cur
for a in rd(N/'inputs/referenced-seals-and-current-private-transport.actual.json')['actualPublicAssetBindings']:
 assert h(X/a['publicAssetPath'])==a['sha256']
 if a['newSevenPrivateRegular']:assert not (X/a['publicAssetPath']).is_symlink()
active_sem=R/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
assert active_sem.read_bytes()==subprocess.check_output(['git','show','HEAD:'+rp(active_sem)],cwd=R)
assert (N/'positive/P17.original-author-native-bound.raw-exact.jsonl').read_bytes()==(P/'positive/P17.original-author-native-bound.raw-exact.jsonl').read_bytes()
assert (N/'memory/M402.original-valid.raw-exact.jsonl').read_bytes()==(P/'memory/M402.original-valid.raw-exact.jsonl').read_bytes()
for name in ['P-check.actual.json','M-check.final-private-data.actual.json','native-prepare.actual.json','native-check.actual.json']:assert rd(N/'checks'/name)['exitCode']==0
for r in ['a','b']:assert not list((N/'native-D1'/f'round-{r}'/'results').iterdir())
assert not list((N/'native-D1/resolutions').iterdir())
spec=importlib.util.spec_from_file_location('stock_validate_schemas',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
links=module.curriculum_symlink_errors(str(R));assert links==[],links
owned=sorted(p for p in N.rglob('*') if p.is_file());assert not any(p.is_symlink() for p in N.rglob('*'))
counts={'json':0,'jsonl':0}
for p in owned:
 if p.suffix=='.json':rd(p);counts['json']+=1
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line)
  counts['jsonl']+=1
wr(N/'checks/final-neutral-native-source-CAS-structured-symlink-and-private-closure.actual.json',{'schemaVersion':1,'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'oldSealedRootsVerifiedWholeAndUnchanged':seal_bindings,'new23SuccessorsOnlyF947ComponentChangesVerified':True,'directCompatibilityComponentsRemoved':54,'historicalTransport40PrivateExactAndActiveUntouched':True,'economicsConfigurationAndReportUnchanged':True,'allSevenPrivatePNGsActualDigestExact':True,'allMutableOutputParentChainsPrivate':True,'currentActiveSemanticLedgerExactHEAD':bind(active_sem),'canonicalBaseStill9a685':True,'normalPAndFinalMAndNativePrepareCheckAllExitZero':True,'nativePDFActual3Pages':True,'whole402Other401AndProtected231PageChecksPassed':True,'bothFreshReviewCampaignsAndResolutionOutputsStillPending':True,'globalCurriculumSymlinkErrors':links,'ownedStructuredFilesParsed':counts,'ownedRootContainsNoSymlinks':True,'noActiveHistoricalOrGitWritesInThisNewPacket':True,'previousSourceAuthorOverlayIncidentRetainedAndDisclosedInOriginalSeal':True,'newIndependentScientificVotes':0,'newStrictCompletions':0,'humanApproval':False})
owned=sorted(p for p in N.rglob('*') if p.is_file())
seal=N/'FINAL.final-source-PNG-explicit-tasks-neutral-native-author.freeze.json'
wr(seal,{'schemaVersion':1,'role':'inactive-final-one-goal-neutral-author-native-preparation','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalIds':[G],'currentCurricularAtomicDenominator':402,'protectedCurrentStrictComplete':231,'newStrictCompletions':0,'newIndependentScientificVotes':0,'sourceAcceptance':False,'genericHBPartialClassificationStillHeld':True,'SH005PracticalSourceUnionStillHeld':True,'fullPracticalExecutionAccepted':False,'humanApproval':False,'currentCanonicalBase':selector['currentCanonicalBinding'],'neutralSelectorBinding':bind(N/'REVIEW_INPUTS.final-one-goal.neutral.json'),'nativeBatchBinding':bind(N/'native-D1/batch-manifest.json'),'actualPDFPages':3,'oneRenderingAfterFinalSourceInputs':True,'bothIndependentFirstPassResultsPending':True,'normalChecksPassed':['stock P1 v2 input binding','stock full402 M/card/visibility','stock source/applicability APIs','stock full402 BookModel/parser and protected231/original17 page comparison','stock native prepare/check','current source CAS','structured JSON/JSONL parsing','global curriculum symlink validation'],'priorSealsRetained':seal_bindings,'noActiveHistoricalOrGitWritesInThisNewPacket':True,'previousSourceAuthorOverlayIncidentDisclosedSeparately':True,'ownedFileCount':len(owned),'ownedFileBindings':[bind(p) for p in owned]})
for b in rd(seal)['ownedFileBindings']:assert h(R/b['path'])==b['sha256']
print(json.dumps({'finalSeal':rp(seal),'sha256':h(seal),'ownedFiles':len(owned),'ownedBytes':sum(p.stat().st_size for p in owned),'freshPairPending':True,'strictGain':0}))
