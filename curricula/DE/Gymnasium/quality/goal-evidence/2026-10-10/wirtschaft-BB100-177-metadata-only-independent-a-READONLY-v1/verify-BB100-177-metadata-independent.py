import collections
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
AUTHOR = Q / 'wirtschaft-BB100-177-edges-one-new-qualified-partial-metadata-only-INERT-c-v1'
OWN = Q / 'wirtschaft-BB100-177-metadata-only-independent-a-READONLY-v1'
CAN = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
REG = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')

def read(p):
    return json.loads((ROOT / p).read_text())

def artifact(p):
    b = (ROOT / p).read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def exact_artifact(x):
    actual = artifact(Path(x['path']))
    return actual['sha256'] == x['sha256'].removeprefix('sha256:') and actual['bytes'] == x['bytes']

checks = []
def check(label, ok):
    checks.append({'check': label, 'passed': bool(ok)})
    assert ok, label

seal_path = AUTHOR / 'SEALED-BB100-177-current-proof-and-historical-closure-metadata-only.INERT.json'
seal = read(seal_path)
check('author seal SHA matches supplied immutable handoff', artifact(seal_path)['sha256'] == 'df7afa60f297dc69d010aedfa5c49b3fcb76ad4e9a8de0d214eb770a6b7e6024')
for x in seal['artifacts']:
    check('exact author artifact ' + x['path'], exact_artifact(x))
author_receipt = read(AUTHOR / 'actual-BB100-177-one-real-partial-qualified-proof-and-exact-old-closure-metadata-only.AUTHOR-INERT.receipt.json')
source_pair = author_receipt['pairs'][1]
mapping_pair = author_receipt['pairs'][0]
paths = [seal_path, CAN, REG, Path(source_pair['activePath']), Path(mapping_pair['activePath'])]
paths += [Path(x['path']) for x in seal['artifacts']]
paths += [Path(x['before']['path']) for x in author_receipt['pairs']]
source_before = read(AUTHOR / 'BBsource.active-BEFORE.EXACT.json')
source_after = read(Path(source_pair['candidate']['path']))
mapping_before = read(AUTHOR / 'BBmapping.A-v2-BEFORE.EXACT.json')
mapping_after = read(Path(mapping_pair['candidate']['path']))
closure = source_after['currentBoundedQualificationClosure']
paths += [Path(x['path']) for x in closure['actualIndependentProofs']]
before = {str(p): artifact(p) for p in dict.fromkeys(paths)}
for pair in author_receipt['pairs']:
    historical_before = copy.deepcopy(pair['before'])
    if pair is source_pair:
        historical_before['path'] = str(AUTHOR / 'BBsource.active-BEFORE.EXACT.json')
    check('historical author before binding ' + pair['activePath'], exact_artifact(historical_before))
    check('author candidate binding ' + pair['activePath'], exact_artifact(pair['candidate']))
current_source_hash = artifact(Path(source_pair['activePath']))['sha256']
check('active Source equals historical baseline or exact already integrated qualified candidate', current_source_hash in [artifact(AUTHOR / 'BBsource.active-BEFORE.EXACT.json')['sha256'], source_pair['candidate']['sha256']])
check('mapping input equals exact independently qualified A-v2 whole artifact', artifact(Path(mapping_pair['before']['path']))['sha256'] == artifact(AUTHOR / 'BBmapping.A-v2-BEFORE.EXACT.json')['sha256'])

source_allowed = {'pipelineStatus', 'currentBoundedQualificationClosure', 'historicalPreAdditionalPartialEdgeQualificationClosureExact', 'historicalPreAdditionalPartialEdgePipelineStatusExact'}
mapping_allowed = {'boundedAdditionalMarketSourceFacetAuthoring', 'currentBoundedAdditionalSourceFacetStatus', 'historicalAdditionalSourceFacetAuthorStatusExact', 'historicalAdditionalMarketSourceFacetAuthoringExact', 'currentBoundedQualificationClosure'}
check('whole Source semantic bodies, passages, parents, documents, qualityReview and earlier histories exact', {k: v for k, v in source_before.items() if k not in source_allowed} == {k: v for k, v in source_after.items() if k not in source_allowed})
check('all177 edges,100 decisions, summary, status and previous mapping histories exact', {k: v for k, v in mapping_before.items() if k not in mapping_allowed} == {k: v for k, v in mapping_after.items() if k not in mapping_allowed})
check('whole prior176/145 Source closure preserved exact', source_after['historicalPreAdditionalPartialEdgeQualificationClosureExact'] == source_before['currentBoundedQualificationClosure'])
check('whole prior Source pipeline preserved exact', source_after['historicalPreAdditionalPartialEdgePipelineStatusExact'] == source_before['pipelineStatus'])
check('whole pending A-edge author status preserved exact', mapping_after['historicalAdditionalSourceFacetAuthorStatusExact'] == mapping_before['currentBoundedAdditionalSourceFacetStatus'])
check('whole pending A-edge author reasoning preserved exact', mapping_after['historicalAdditionalMarketSourceFacetAuthoringExact'] == mapping_before['boundedAdditionalMarketSourceFacetAuthoring'])

def pipeline_without_details(x):
    y = copy.deepcopy(x)
    for step in y['steps']:
        for c in step['checks']:
            c.pop('details', None)
    return y
check('every pipeline step status, dependency and actual passed flag exact; only details update', pipeline_without_details(source_before['pipelineStatus']) == pipeline_without_details(source_after['pipelineStatus']))
check('Source and Mapping current bounded qualification metadata equal', closure == mapping_after['currentBoundedQualificationClosure'])
check('source100 and passages27 unchanged', len(source_after['sourceGoals']) == 100 and len(source_after['passages']) == 27)
decisions = collections.Counter(x['matchType'] for x in mapping_after['decisions'])
edges = collections.Counter(x['matchType'] for x in mapping_after['mappings'])
check('actual current100 decisions31exact69partial', dict(decisions) == {'partial': 69, 'exact': 31})
check('actual current177 edges31exact146partial', dict(edges) == {'partial': 146, 'exact': 31})
for k, expected in [('currentSourceGoals', 100), ('currentDecisions', 100), ('exactDecisions', 31), ('partialDecisions', 69), ('currentMappingEdges', 177), ('exactEdges', 31), ('partialEdges', 146)]:
    check('current counter ' + k, closure[k] == expected)
check('unchanged valid-history91 and already qualified9 scope preserved', closure['validUnchangedHistoricalRows'] == source_before['currentBoundedQualificationClosure']['validUnchangedHistoricalRows'] == 91 and closure['actuallyQualifiedCurrentRows'] == source_before['currentBoundedQualificationClosure']['actuallyQualifiedCurrentRows'] == 9)
can = read(CAN)
ids = {x['id'] for x in can['goals']}
check('current693 canonical identities actual', len(ids) == 693)
check('all100 source decisions mapped to existing current canonical IDs', all(x['decision'] == 'mapped' and set(x['canonicalGoalIds']).issubset(ids) for x in mapping_after['decisions']))
check('all177 mapping edges resolve to actual canonical IDs', all(x['canonicalGoalId'] in ids for x in mapping_after['mappings']))
for x in closure['actualIndependentProofs']:
    check('actual qualified evidence bytes ' + x['path'], exact_artifact(x))
old_proofs = source_before['currentBoundedQualificationClosure']['actualIndependentProofs']
check('all earlier three qualification proof bindings preserved exact', closure['actualIndependentProofs'][:3] == old_proofs and len(closure['actualIndependentProofs']) == 4)
addition = closure['additionalActuallyQualifiedPartialSourceEdge']
proof = read(Path(addition['independentProof']['path']))
check('C is independent from original partial-edge author A', 'not mapping author A' in proof['reviewer'])
check('C actual receipt qualifies exact BB whole A-v2 mapping input bytes', any(x['candidate']['path'] == mapping_pair['before']['path'] and exact_artifact(x['candidate']) for x in proof['qualifiedPairs']))
check('C exact individual KEEP for new bounded BB edge', any(x['jurisdiction'] == 'BB' and x['sourceGoalId'] == addition['sourceGoalId'] and x['canonicalGoalId'] == addition['canonicalGoalId'] and x['matchType'] == addition['matchType'] == 'partial' and x['decision'] == 'KEEP_bounded_actual_partial_source_union' and x['independentQualification'] is True for x in proof['individualDecisions']))
check('new edge actually exists in exact177 mapping', any(x['legacyGoalId'] == addition['sourceGoalId'] and x['canonicalGoalId'] == addition['canonicalGoalId'] and x['matchType'] == 'partial' for x in mapping_after['mappings']))
check('GK compulsory19 and LK selected26 boundary explicit', 'GK19' in addition['originalPrimaryScope'] and 'selected' in addition['originalPrimaryScope'] and 'no universalLK' in addition['originalPrimaryScope'])
check('AI and pending native truth: no new Whole100 review/human/M6/M7/CI claim', closure['newWhole100ScientificReviewClaim'] is False and closure['newWhole100MappingReviewClaim'] is False and closure['humanApproval'] is False and closure['M6M7OrCIClaim'] is False and closure['nativeWholeCurrentM2M3M6StillPending'] is True)
after = {str(p): artifact(p) for p in dict.fromkeys(paths)}
check('all actual input/endguards byte exact; active Source/Mapping/CAN/REG untouched', before == after)

receipt = {
    'schemaVersion': 1,
    'reviewedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'independent_KEEP_metadata_only_BB100_177_bounded_history_and_actual_C6_qualification',
    'reviewer': {'provider': 'OpenAI', 'model': 'GPT-6', 'runtime': 'Codex', 'agent': 'economics_final56_current_round_a', 'exactModelRevision': 'not_exposed', 'samplingParameters': 'not_exposed'},
    'independenceBoundary': 'Independent from C metadata author. A authored the six partial-edge proposal; this receipt does not self-qualify those scientific edges. Their separate actual independent C6 KEEP is reused with exact bytes. Earlier own NAIRU/P and 7c scope authorship disclosed; no new blind D or historical whole100 Source review.',
    'individualDecisions': [
        {'artifact': source_pair['candidate'], 'decision': 'KEEP', 'reason': 'Source100,27 passages and all whole semantic/provenance/qualityReview fields exact. Every pipeline passed/status/dependency field stays exact; details now accurately name the independently qualified partial successor and177/146 counters. The complete prior176/145 closure and pipeline remain exact as history.'},
        {'artifact': mapping_pair['candidate'], 'decision': 'KEEP', 'reason': 'All177 actual mapping edges and100 decisions remain exact to the independently C-qualified A-v2 artifact. Pending author objects are archived whole without alteration; current metadata cites the actual C6 individual BB KEEP. No whole-partial→whole expansion or universal LK obligation is claimed.'}
    ],
    'inputsBefore': list(before.values()),
    'inputsEnd': list(after.values()),
    'activeSourceAlreadyEqualsQualifiedCandidateAtOwnReviewStart': current_source_hash == source_pair['candidate']['sha256'],
    'historicalBeforeActivePointerNowSuperseded': 'The author before.source path originally denoted historical active bytes d9c4af..., retained exactly in BBsource.active-BEFORE.EXACT.json. At this read-only review start active Source already equals the proposed qualified candidate2fdcf997...; no assertion of the historical source bytes still being live is made.',
    'checks': checks,
    'sourceRows': 100,
    'passages': 27,
    'unchangedValidHistoricalSourceRows': 91,
    'earlierQualifiedCurrentSourceRows': 9,
    'actualMappingDecisions': dict(decisions),
    'actualMappingEdges': dict(edges),
    'wholeHistoricalSourceReviewClaim': False,
    'M6M7OrCIClaim': False,
    'DOrVApprovalClaim': False,
    'humanApproval': False,
    'observedLearnerPerformance': False,
    'activeWrites': 0
}
output = OWN / 'actual-BB100-177-status-proof-history-metadata-only-independent-KEEP.SEALED.receipt.json'
(ROOT / output).write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'receipt': artifact(output), 'checks': len(checks), 'failedChecks': 0, 'activeWrites': 0}))
