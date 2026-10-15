import datetime
import hashlib
import json
import shutil
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent
REPO = next(p for p in OUT.parents if (p / 'AGENTS.md').is_file())
PREP = OUT.parent / 'chemie-bw-lk-memory-support-current422-native13-context-preparation-technical-root-20261015-v1'
NATIVE = PREP / 'native-thirteen-v2'

def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path':p.relative_to(REPO).as_posix(),'sha256':digest(p),'bytes':p.stat().st_size}

def write(p, data):
    with p.open('x') as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

first_path = OUT / 'FIRST.original-independent-D13-science.json'
first = json.loads(first_path.read_text())
first_seal = json.loads((OUT/'FIRST.original-independent-D13-science.seal.json').read_text())
assert first_seal['sha256'] == digest(first_path)
assert first_seal['normalResultsExistAtSeal'] is False
copies = []
for sub in ['bundle', 'round-a']:
    for src in sorted((NATIVE/sub).rglob('*')):
        if not src.is_file():
            continue
        assert not src.is_symlink(), src
        assert 'results' not in src.relative_to(NATIVE/sub).parts
        dst = OUT / sub / src.relative_to(NATIVE/sub)
        dst.parent.mkdir(parents=True,exist_ok=True)
        assert not dst.exists(), dst
        shutil.copyfile(src,dst)
        assert src.read_bytes() == dst.read_bytes()
        copies.append({'source':binding(src),'copy':binding(dst),'byteExact':True})
write(OUT/'checks/TRANSPORT.assigned-round-a-and-bundle.byte-CAS.json',
      {'role':'Technical exact copies after FIRST; no scientific changes',
       'copies':copies,'mutatedSourceFiles':0,'pathMetadataRewrites':0,'peerRoundsCopied':0})

selector = json.loads((PREP/'INPUTS.final-native13.physical-exact-selector.json').read_text())
source_grid = OUT.parent/'chemie-bw-lk-memory-support-selection-author-20261015-v1/sources/forty-whole-required-goals-card-origin-source-projection-grid.author.json'
source_rows = [x for x in json.loads(source_grid.read_text())['rows'] if x['goalId'] in selector['scopeGoalIds']]
primary_paths = [REPO/'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json',
                 REPO/'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_CHEMIE_SEKII_BP2016_V2.source-extraction.json']
passage_ids = sorted({g['passageId'] for x in source_rows for g in (
    [a['wholeSourceGoal'] for a in x['existingDirectBWMappingEdges']]
    + x['authorSupportingSourceClausesForMissingDirectEdge'])})
source_clauses = sum(len(x['existingDirectBWMappingEdges'])+len(x['authorSupportingSourceClausesForMissingDirectEdge']) for x in source_rows)
source_passages = [g for p in primary_paths for g in json.loads(p.read_text())['passages'] if g['id'] in passage_ids]
assert len(source_passages)==len(passage_ids)==12
aliases_path=OUT.parent/'chemie-bw-lk-six-card-defects-scientific-remediation-author-root-20261015-v1/REBUILD.six-normal-data-deck-aliases.six-card-successor.json'
aliases=json.loads(aliases_path.read_text())['aliases']
deck_bindings=[binding(REPO/a['candidateSource']['path']) for a in aliases]
write(OUT/'inspection/READ.actual-native-and-external-scientific-context.receipt.json',{
    'schemaVersion':1,'role':'Actual reading receipt, not another scientific vote',
    'reviewerId':first['reviewerId'],'nativeReviewStartedAt':first['startedAt'],
    'nativeReviewCompletedAt':first['completedAt'],'actualSeenPages':list(range(1,16)),
    'frontPagesSeen':[1,2],'goalPdfPageMap':[{'goalId':g,'nativeGoalPage':n,'physicalPDFPage':n+2} for n,g in enumerate(selector['scopeGoalIds'],1)],
    'actualSeenRasters':[binding(p) for p in sorted((OUT/'inspection/raster').glob('*.png'))],
    'nativePDF':selector['nativePDF'],'nativeHTML':selector['nativeHTML'],
    'nativeBookModel':selector['nativeBookModel'],'nativeReviewInput':selector['nativeReviewInput'],
    'htmlArticleGoalIdsRead':selector['scopeGoalIds'],'modelPageGoalIdsRead':selector['scopeGoalIds'],
    'wholeProfilesRead':13,'wholeApplicationCaseBriefsRead':32,
    'extraWholeCasesRead':{'pK':['G2-C1','G2-C2'],'Q3':['q3-10-a','q3-10-b'],
       'Q4GoalIds':['801790f9-be3a-51fe-9b0f-3452c1bba887','4a08f31f-204c-5339-9d9f-5d2af28d5d5c','dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5'],'Q4CaseCount':11},
    'scientificInputBindings':selector['scientificReviewInputs'],
    'selectedCorrectedDeckBindingsRead':deck_bindings,'selectedCardFrontsAndBacksRead':41,
    'completeNewMemoryGoalsRead':6,'ordinaryGoalPrerequisiteParentAndSuccessorTextsRead':True,
    'externalSourceGrid':binding(source_grid),'sourceGridRowsUsed':13,'sourceClauseRowsRead':source_clauses,
    'actualPrimaryExtractionBindingsRead':[binding(p) for p in primary_paths],
    'wholePrimaryPassageIdsRead':passage_ids,'wholePrimaryPassagesRead':12,
    'sourceBindingsPresentInNativePages':False,'nativePrintedSourceBlocksPresent':False,
    'sourceClaim':'External selector-bound source matrix and complete relevant BW primary extraction passages were read separately; no whole-course source approval.',
    'fourIndirectPartialHoldsCleared':False,'nineResidualSourceCourseHoldsCleared':False,
    'peerDRecordsRead':0,'newPAMVVotes':0,'humanApproval':False,'humanTrial':False,
    'originalFIRST':binding(first_path)})

campaign=json.loads((OUT/'round-a/description-review-campaign.json').read_text())
inp=json.loads((OUT/'round-a/description-review-input.json').read_text())
bundle=json.loads((OUT/'round-a/review-bundle-manifest.json').read_text())
batch=campaign['batches'][0]
assert len(campaign['batches'])==1
run_id='chemie-memory13-current422-native-independent-a-20261015-run-01'
records=[]
for g,j in zip(inp['goals'],first['judgments']):
    assert g['goalId']==j['goalId']
    record={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion':1,'recordId':run_id+'.'+g['goalId'],'runId':run_id,
        'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
        'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision':j['normalDecision'],'understandingEvidence':j['understandingEvidence'],
        'rationale':j['rationaleDe']+' / '+j['rationaleEn'],
        'evidenceProfileContract':'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation':j['evidenceProfileRecommendation'],
        'recordStatus':'candidate','reviewAuthority':'ai_candidate'}
    records.append(record)
records_path=OUT/'round-a/results'/f"{batch['batchId']}.records.jsonl"
with records_path.open('x') as f:
    for r in records:
        f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
assert len([json.loads(x) for x in records_path.read_text().splitlines()])==13
params={'systemModelIdentity':'GPT-6','samplingParameters':'not exposed by execution environment','workMode':'independent targeted native D13 context review'}
write(OUT/'checks/GENERATION.parameters-disclosure.json',params)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],
    'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],
    'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
    'provider':'OpenAI','model':'GPT-6','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-review-v2',
    'promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':digest(OUT/'checks/GENERATION.parameters-disclosure.json'),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,
    'goalIds':batch['goalIds'],
    'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]
       +[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
    'startedAt':first['startedAt'],'completedAt':first['completedAt'],'status':'completed',
    'outputDigest':digest(records_path),'toolchainVersion':'skillpilot-stock-goal-description-review-v2'}
write(OUT/'round-a/results'/f"{batch['batchId']}.run.json",run)
write(OUT/'NORMAL.assigned-round-a.selector.json',{
    'schemaVersion':1,'role':'Independent A normal result selector; original FIRST sealed before normal materialization',
    'reviewerId':first['reviewerId'],'runId':run_id,
    'FIRST':binding(first_path),'FIRSTSeal':binding(OUT/'FIRST.original-independent-D13-science.seal.json'),
    'bundle':binding(OUT/'round-a/review-bundle-manifest.json'),
    'input':binding(OUT/'round-a/description-review-input.json'),
    'campaign':binding(OUT/'round-a/description-review-campaign.json'),
    'batchInput':binding(OUT/'round-a/batches'/f"{batch['batchId']}.input.jsonl"),
    'run':binding(OUT/'round-a/results'/f"{batch['batchId']}.run.json"),
    'records':binding(records_path),
    'readReceipt':binding(OUT/'inspection/READ.actual-native-and-external-scientific-context.receipt.json'),
    'goalIds':batch['goalIds'],'decisionCounts':{'keep':13},
    'newStrictClosures':0,'sourceCourseHoldsCleared':False,'newPAMVVotes':0,
    'activeIntegration':False,'humanApproval':False,'humanTrial':False})
print(json.dumps({'runId':run_id,'records':len(records),'copies':len(copies),'FIRSTUnchanged':digest(first_path)==first_seal['sha256']}))
