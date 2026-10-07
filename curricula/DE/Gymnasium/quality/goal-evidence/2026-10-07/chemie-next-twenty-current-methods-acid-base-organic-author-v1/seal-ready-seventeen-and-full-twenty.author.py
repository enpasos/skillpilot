"""Seal only this inert dossier; active inputs are read and pinned."""
import json, pathlib, hashlib, datetime
from jsonschema import Draft202012Validator, FormatChecker
R=pathlib.Path.cwd();B=pathlib.Path(__file__).resolve().parent
def raw_sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p,base=R):return dict(path=p.relative_to(base).as_posix(),sha256=raw_sha(p),bytes=p.stat().st_size)
def put(n,obj):
    p=B/n;t=p.with_name(p.name+'.tmp');t.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');t.replace(p)
now=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
r=json.loads((B/'twenty-current-whole-source-image-context-routing.author.json').read_text())
ids17=r['prerequisiteSafeOrderedGoalIds'][:17]
records17=[json.loads(l) for l in (B/'positive-evidence.seventeen.author-candidates.review.jsonl').read_text().splitlines()]
records20=[json.loads(l) for l in (B/'positive-evidence.twenty.author-candidates.review.jsonl').read_text().splitlines()]
cfg17=json.loads((B/'positive-evidence.seventeen.author-candidates.config.json').read_text())
pv=Draft202012Validator(json.loads((R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json').read_text()),format_checker=FormatChecker())
cv=Draft202012Validator(json.loads((R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json').read_text()),format_checker=FormatChecker())
assert not list(cv.iter_errors(cfg17))
assert len(records17)==17 and [x['goalId'] for x in records17]==ids17
assert all(not list(pv.iter_errors(x)) for x in records17)
assert all(records17[i]['profile']==records20[i]['profile'] and records17[i]['profileFingerprint']==records20[i]['profileFingerprint'] and records17[i]['goalFingerprint']==records20[i]['goalFingerprint'] and records17[i]['reviewInputFingerprint']==records20[i]['reviewInputFingerprint'] for i in range(17))
assert not any(x['dissent'] for x in records17)
checks=[
 ('D20 prepare and current check','native-d-twenty-prepare-check.actual','app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config '+(B/'native-d-twenty.batch.config.json').relative_to(R).as_posix()),
 ('D17 prepare','native-d-seventeen-prepare.actual','app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts prepare --config '+(B/'native-d-seventeen.batch.config.json').relative_to(R).as_posix()),
 ('D17 current check','native-d-seventeen-check.actual','app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config '+(B/'native-d-seventeen.batch.config.json').relative_to(R).as_posix()),
 ('P20 final candidate-set exact current native check','native-positive-twenty-final-check.actual','app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config '+(B/'positive-evidence.twenty.author-candidates.config.json').relative_to(R).as_posix()+' --candidates '+(B/'positive-evidence.twenty.author-candidate-set.json').relative_to(R).as_posix()),
 ('P17 native current check','native-positive-seventeen-check.actual','app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config='+(B/'positive-evidence.seventeen.author-candidates.config.json').relative_to(R).as_posix()+' --mode=check')
]
actual=[]
for label,stem,argv in checks:
    stdout=B/'qa-artifacts'/f'{stem}.stdout.txt';stderr=B/'qa-artifacts'/f'{stem}.stderr.txt'
    assert stdout.exists() and stderr.exists() and stdout.stat().st_size>0
    assert stderr.stat().st_size==0,(stem,stderr.read_text())
    actual.append(dict(label=label,argv=argv,observedExitCode=0,stdout=pin(stdout),stderr=pin(stderr)))
put('qa-artifacts/native-seventeen-and-twenty-actual-terminal.receipt.json',dict(documentType='Actual tool-observed targeted native terminal results; not independent D/P approval',recordedAtUTC=now,checks=actual,nativeD17Goals=17,nativeD20Goals=20,nativeP17Candidates=17,nativeP20Candidates=20,recordSchema17PASS=True,unchangedSeventeenWholeProfilesAndActualGoalInputFingerprintsComparedToTwenty=True,unresolvedThreeHolds=True,strictNetGain=0,humanApproval=False))
inputs={};mismatches=[]
def collect(x):
    if isinstance(x,list):
        for y in x:collect(y)
    elif isinstance(x,dict):
        if isinstance(x.get('path'),str) and isinstance(x.get('sha256'),str):
            p=R/x['path'];expected=x['sha256'].removeprefix('sha256:')
            if p.exists() and p.is_file():
                actualhash=raw_sha(p)
                if expected!=actualhash:mismatches.append(dict(path=x['path'],expected=expected,actual=actualhash))
                if not p.is_relative_to(B):inputs[p.relative_to(R).as_posix()]=pin(p)
        for v in x.values():collect(v)
for p in B.rglob('*.json'):
    if p.name.endswith('.freeze.json'):continue
    collect(json.loads(p.read_text()))
# Earlier neutral Source3 stage remains immutable, including its original pins.
sf=json.loads((B/'source-three-neutral-raw-author-input.stage.freeze.json').read_text());collect(sf)
assert not mismatches,mismatches
mandatory=['AGENTS.md','LICENSING.md','docs/concept/skill-graph/atomic-goal-visualizations.md','scripts/validate_schemas.py','app/package.json','app/package-lock.json','app/scripts/goalBookModel.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/createGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/goalBookRenderer.ts','app/scripts/exportGoalBookReviewBundle.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/memoryCardReview.ts','app/scripts/semanticAtomicityReview.ts','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-gk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-lk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-seki-chemistry.view.json','curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json']
for p in mandatory:
    actual=R/p;assert actual.exists(),p;inputs[p]=pin(actual)
raw=json.loads((B/'twenty-direct-current-source-mapping-witnesses.author.json').read_text())
for p in raw['sourceMappingFiles']:
    inputs[p]=pin(R/p)
base=B.relative_to(R).as_posix()
put('exact-current17-and-separate20-native-review-routing.author.raw.json',dict(documentType='Neutral final raw AUTHOR routing: independent 17 next, three exact separate HOLDs',role='AUTHOR',currentWholeCanon=pin(R/r['currentWholeCanonical']['path']),currentAtomicDenominator=378,currentWholeGoalCount=479,currentStrict152Report=r['reportBinding'],goalIds17=ids17,wholeGoals17=[x['wholeCurrentGoal'] for x in r['rows'][:17]],fullCurrent378Model=pin(B/'qa-artifacts/full-current378.book-model.json'),nativeD17={'roundA':base+'/native-d-seventeen/round-a/description-review-campaign.json','roundB':base+'/native-d-seventeen/round-b/description-review-campaign.json','realBundle':base+'/native-d-seventeen/bundle/','physicalPDFPages':19},nativeP17={'config':base+'/positive-evidence.seventeen.author-candidates.config.json','records':base+'/positive-evidence.seventeen.author-candidates.review.jsonl','fullMaterialCases':base+'/thirty-four-complete-bilingual-material-cases.author-review17.json','caseCount':34,'languageBodies':68,'independentReviews':0},sourceGuide=base+'/seventeen-bounded-primary-source-components-and-two-split-source-routing.author.json',existingAMVTechnicalRouting=base+'/twenty-current-whole-source-image-context-routing.author.json',existingCardAndViewBindings=base+'/selected-existing-memory-two-decks-twenty-three-current-card-bindings.author.json',separateHoldGoalIds=r['prerequisiteSafeOrderedGoalIds'][17:],separateFull20AuthorMaterials=base+'/forty-complete-bilingual-material-cases.author.json',noFullSourceClosure=True,activeWrites=False,strictNetGain=0,humanApproval=False))
put('qa-artifacts/final-own-input-currentness.actual.json',dict(documentType='Actual original bound-input verification at inert author sealing',checkedAtUTC=now,inputCount=len(inputs),mismatches=mismatches,wholeCurrentTwentyGoalsUnchanged=True,currentProtectedStrict152Excluded=True,reserved23Excluded=True,ownSource3EarlierFreezeUnchanged=True,activeWrites=False,newStrictClosures=0))
stagefiles=[]
stage_names={'native-d-seventeen.batch.config.json','positive-evidence.seventeen.author-candidate-set.json','positive-evidence.seventeen.author-candidates.config.json','positive-evidence.seventeen.author-candidates.review.jsonl','thirty-four-complete-bilingual-material-cases.author-review17.json','exact-current17-and-separate20-native-review-routing.author.raw.json','seventeen-bounded-primary-source-components-and-two-split-source-routing.author.json','selected-existing-memory-two-decks-twenty-three-current-card-bindings.author.json','twenty-current-whole-source-image-context-routing.author.json','README.md'}
for p in sorted(B.rglob('*')):
    if p.is_file() and (p.relative_to(B).as_posix().startswith('native-d-seventeen/') or p.relative_to(B).as_posix() in stage_names):stagefiles.append(pin(p,B))
put('seventeen-current-native-d-p-author-inputs.stage.freeze.json',dict(documentType='Immutable unreviewed AUTHOR17 exact native D/P input stage, net0',frozenAtUTC=now,ownPayloadPathBase='dossierDirectory',inputPathBase='repositoryRoot',ownFiles=stagefiles,inputBindings=list(inputs.values()),newIndependentReviews=0,strictNetGain=0,humanApproval=False,threeSeparateHoldsExcluded=True))
own=[pin(p,B) for p in sorted(B.rglob('*')) if p.is_file() and p.name!='twenty-current-methods-acid-base-organic-author-v1.final.freeze.json' and not p.name.endswith('.tmp')]
put('twenty-current-methods-acid-base-organic-author-v1.final.freeze.json',dict(documentType='Immutable own AUTHOR20 complete material/native preparation with separately ready AUTHOR17 stage; no independent or human approval',frozenAtUTC=now,ownPayloadPathBase='dossierDirectory',inputPathBase='repositoryRoot',ownFiles=own,inputBindings=list(inputs.values()),ownFilesCount=len(own),ownBytes=sum(x['bytes'] for x in own),author20Goals=20,author20CompleteCases=40,ready17Goals=17,ready17CompleteCases=34,threeUnresolvedGoalIds=r['prerequisiteSafeOrderedGoalIds'][17:],nativeD20TechnicalPASS=True,nativeD17TechnicalPASS=True,nativeP20TechnicalPASS=True,nativeP17TechnicalPASS=True,newIndependentDReviews=0,newIndependentPReviews=0,newVisualApprovals=0,actualSourceClosure=False,actualLearnerEvidence=False,humanApproval=False,humanTrial=False,newScientificClosures=0,restoredActiveBindings=0,strictNetGain=0,activeWrites=False))
for fname in ['seventeen-current-native-d-p-author-inputs.stage.freeze.json','twenty-current-methods-acid-base-organic-author-v1.final.freeze.json']:
    f=B/fname;x=json.loads(f.read_text())
    assert all(raw_sha(B/a['path'])==a['sha256'] for a in x['ownFiles'])
    assert all(raw_sha(R/a['path'])==a['sha256'] for a in x['inputBindings'])
    print(json.dumps(dict(file=str(f.relative_to(R)),sha256=raw_sha(f),ownFiles=len(x['ownFiles']),ownBytes=sum(z['bytes'] for z in x['ownFiles']),externalInputs=len(x['inputBindings']),mismatches=0)))
