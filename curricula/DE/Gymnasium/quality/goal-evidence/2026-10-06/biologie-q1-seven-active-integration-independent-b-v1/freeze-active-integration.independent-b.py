import datetime, hashlib, json, pathlib, sys
repo=pathlib.Path('/home/enpasos/projects/skillpilot')
base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
own=base+'biologie-q1-seven-active-integration-independent-b-v1/'
inputs={}
def bind(path):
 b=(repo/path).read_bytes();r=dict(path=path,sha256=hashlib.sha256(b).hexdigest(),bytes=len(b));inputs[path]=r;return r
def read(path): bind(path);return json.loads((repo/path).read_bytes())
freezes=[
 base+'biologie-q1-seven-native-v7-independent-b-v1/independent-b-v7.first-pass.final.freeze.json',
 base+'biologie-q1-seven-native-v7-independent-b-v1/independent-b-v8-targeted-followup.final.freeze.json',
 base+'biologie-q1-seven-final-native-d-independent-b-v1/native-d-independent-b.final.freeze.json',
 base+'biologie-q1-seven-reviewed-integration-independent-b-v1/targeted-integration-independent-b.final.freeze.json',
 base+'biologie-q1-seven-final-native-p-independent-b-v1/native-p-independent-b.final.freeze.json',
]
historical_outputs=[]; historical_inputs={}
for freeze in freezes:
 d=read(freeze)
 for r in d.get('ownOutputs',d.get('ownSupplementalOutputs',[])):
  path=r['path'] if r['path'].startswith('curricula/') else str(pathlib.PurePosixPath(freeze).parent/r['path'])
  actual=bind(path)
  if actual['sha256']!=r['sha256'].removeprefix('sha256:') or actual['bytes']!=r['bytes']: raise AssertionError('Historical own output changed: '+path)
  historical_outputs.append(dict(path=path,sha256=actual['sha256'],sourceFreeze=freeze,byteExact=True))
 for r in d.get('actualInputs',[]):
  path=r['path']
  immutable_author=path.startswith(base) and ('-author-v' in path) and 'independent-a' not in path
  original_source=(path.startswith('curricula/DE/Gymnasium/mapping/') or path.startswith('curricula/DE/Gymnasium/input/')) and '/source-components/' not in path
  if not(immutable_author or original_source):continue
  actual=bind(path)
  if actual['sha256']!=r['sha256'].removeprefix('sha256:') or actual['bytes']!=r['bytes']: raise AssertionError('Historical immutable input changed: '+path)
  historical_inputs[path]=dict(path=path,sha256=actual['sha256'],bytes=actual['bytes'],byteExact=True)
continuity=dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),historicalOwnOutputs=historical_outputs,historicalImmutableAuthorAndOriginalSourceInputs=list(historical_inputs.values()),historicalAllSelectedBytesExact=True,historicalScientificReviewsRestarted=False,authorV6V7V8HistoryUnmodified=True,peerAReviewOutputsRead=False,activeWrites=False)
(repo/own/'historical-evidence-byte-continuity.independent-b.actual.json').write_text(json.dumps(continuity,indent=2)+'\n')
if '--history-only' in sys.argv:
 print(json.dumps(dict(historicalSelectedInputs=len(historical_inputs),historicalOutputs=len(historical_outputs),allBytesExact=True,overallActiveIntegration='REVISE_PENDING_SCOPE_AND_CARRIER_IMAGE',finalFreezeCreated=False)))
 raise SystemExit(0)
if not (repo/own/'final-ready-after-scope-and-carrier-image.review.json').exists():
 raise SystemExit('No final freeze: actual CQR carrier role and owner-reported image fault remain open. New final native D/P/V evidence is required.')
for report in ['active-deltas.independent-b.actual.json','native-active-contexts-and-scopes.independent-b.actual.json']:
 d=read(own+report)
 for r in d['allActualInputs']:
  actual=bind(r['path'])
  if actual['sha256']!=r['sha256'] or actual['bytes']!=r['bytes']:raise AssertionError('Reviewed input changed since final actual check: '+r['path'])
for path in [
 'AGENTS.md',
 'app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts',
 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts',
 'app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts',
 'app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts',
 base+'biologie-q1-seven-reviewed-integration-candidate-v1/full-atomicity.current.config.json',
 base+'biologie-q1-seven-reviewed-integration-candidate-v1/full-atomicity.review.jsonl',
 base+'biologie-q1-seven-reviewed-integration-candidate-v1/full-memory.current.config.json',
 base+'biologie-q1-seven-reviewed-integration-candidate-v1/full-memory.review.jsonl',
 base+'biologie-q1-seven-reviewed-integration-candidate-v1/full-memory.cards.review.jsonl',
 base+'biologie-q1-seven-reviewed-integration-candidate-v1/positive.seven.independent-current.config.json',
 base+'biologie-q1-seven-reviewed-integration-candidate-v1/qa-artifacts/reviewed-seven-st-course-review-status.stage-3.actual.json',
 base+'biologie-q1-seven-reviewed-integration-candidate-v1/qa-artifacts/unchanged-gui-reference-layout.actual.json',
]:bind(path)
checks=read(own+'native-active-checks.independent-b.actual.json')
if not checks['allActualExitCodesZero']:raise AssertionError('Native check failed')
outputs=[]
for file in sorted((repo/own).rglob('*')):
 if file.is_file() and not file.is_symlink() and file.name!='active-integration.independent-b.final.freeze.json':
  b=file.read_bytes(); outputs.append(dict(path=str(file.relative_to(repo/own)),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b)))
out=dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),role='Independent B final actual active integration delta review; bounded seven Biology Q1 goals / 13 original-source components',verdict='KEEP',actualInputs=list(inputs.values()),ownOutputs=outputs,old383WholeGoalsAndNativePageFingerprintsExact=True,old67ActuallyExistingPublicPNGBytesExact=True,old383QARecordValuesExact=True,new7ImagesAllThreeCopiesExact=True,nativeSourceAtlas=dict(published=390,total=390,sourceViews=22,omitted=0),completeGUI=dict(SekI=[168,174],CrossStageGK=[436,443]),nativeCurrentChecks=dict(A=390,M=390,cards=27,memoryVisibilityChecks=17,P=7,DB=7,allExitCodes=0),currentPStatus='needs_human_review',currentPAuthority='ai_candidate',currentPEvidence='E1/G1',thirteenBoundedSourcePromotions='KEEP; only review/provenance/routing and three already-reviewed ST status qualifiers',wholeOriginalSourceClearance=False,peerAReviewOutputsRead=False,historicalReviewsRestarted=False,historicalAuthorAndOwnEvidenceSelectedBytesExact=True,centralFullCheckPerformedByThisReviewer=False,fullPDFRebuiltByThisReviewer=False,activeWrites=False,gitOperation=False,humanApproval=False,humanTrial=False,learnerEvidence=False,publicationOrDeployment=False)
path=repo/own/'active-integration.independent-b.final.freeze.json';path.write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(dict(path=str(path.relative_to(repo)),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),actualInputs=len(inputs),ownOutputs=len(outputs),verdict='KEEP')))
