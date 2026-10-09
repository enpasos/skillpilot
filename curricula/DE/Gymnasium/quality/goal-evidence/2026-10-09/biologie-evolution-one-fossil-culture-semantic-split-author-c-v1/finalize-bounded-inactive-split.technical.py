#!/usr/bin/env python3
"""Finite checkpoint of an unapproved author candidate. No installations."""
import datetime
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
AUTHOR = HERE.parent / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

def bind(p):
    p = p if isinstance(p, Path) else ROOT / p
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, obj):
    p = HERE / name
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

def pointer(body, path):
    for token in path.split('/')[1:]:
        token = token.replace('~1', '/').replace('~0', '~')
        body = body[int(token)] if isinstance(body, list) else body[token]
    return body

source = json.loads((HERE / 'exact-parent-thirteen-source-duties-and-twenty-two-whole-partners.author-input.json').read_text())
canon_path = ROOT / source['activeCanonical']['path']
assert bind(canon_path) == source['activeCanonical'], 'Active canonical changed; do not silently rebind'
canon = json.loads(canon_path.read_text())
goals = {g['id']: g for g in canon['goals']}
assert len(goals) == 479
assert goals[source['wholeOriginalParent']['id']] == source['wholeOriginalParent']
assert len(source['wholeOriginalSourceDutyRows']) == 13
assert len(source['wholeOriginalAndCurrentPartnerGoals']) == 22
assert all(goals[r['goalId']] == r['wholeCurrentGoal'] for r in source['wholeOriginalAndCurrentPartnerGoals'])
current = json.loads((HERE / 'two-child-four-whole-bilingual-cases-and-P.readable-v2.author-candidate.json').read_text())
semantic = json.loads((HERE / 'two-child-semantic-bodies-and-parent-cluster.author-candidate.json').read_text())
assert [r['wholeCandidateGoal'] for r in current['entries']] == semantic['candidateChildren']
assert not {e['goalId'] for e in current['entries']} & set(goals)
assert all(e['wholeCandidateGoal']['requires'] == source['wholeOriginalParent']['requires'] for e in current['entries'])
profile_receipt = json.loads((HERE / 'two-proposed-P-v2.ordinary-schema-and-semantics.actual.json').read_text())
assert profile_receipt['actualExit'] == 0

inputs = {}
def remember(binding):
    assert bind(binding['path']) == binding, binding['path']
    inputs[binding['path']] = binding

remember(source['activeCanonical'])
remember(source['originalWholeSourceFrameBinding'])
for row in source['wholeOriginalSourceDutyRows']:
    remember(row['mappingBinding'])
    remember(row['extractionBinding'])
    mapping = json.loads((ROOT / row['mappingBinding']['path']).read_text())
    assert pointer(mapping, row['decisionJsonPointer']) == row['wholeOriginalDecision']
for p in [AUTHOR / 'primary/BY10.actual-official.txt', AUTHOR / 'primary/RP-original-full-affected-topic-pages.txt',
          AUTHOR / 'input/profile-criteria.original.md', ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
          ROOT / 'app/scripts/positiveGoalEvidenceProfileModel.ts', ROOT / 'scripts/validate_schemas.py']:
    remember(bind(p))

spec = importlib.util.spec_from_file_location('ordinary_schema_validator', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
own_parsed = []
for p in sorted(HERE.glob('*.json')):
    json.loads(p.read_text())
    own_parsed.append(bind(p))
for p in sorted(HERE.glob('*.jsonl')):
    for line in p.read_text().splitlines():
        if line.strip():
            json.loads(line)
    own_parsed.append(bind(p))

cache_docs = {}
for row in source['wholeOriginalSourceDutyRows']:
    for doc in row['originalSourceDocuments']:
        path = doc.get('localPath') or doc.get('path')
        if not path:
            continue
        p = ROOT / path
        if not p.is_file():
            cache_docs[path] = {'path': path, 'role': 'historical_primary_locator_not_required_runtime_input', 'exists': False, 'portableSnapshotClaimed': False}
            continue
        tracked = subprocess.run(['git', 'ls-files', '--error-unmatch', path], cwd=ROOT, capture_output=True).returncode == 0
        ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input=path + '\n', cwd=ROOT, text=True, capture_output=True).returncode == 0
        cache_docs[path] = {**bind(p), 'exists': True, 'tracked': tracked, 'ignored': ignored,
                            'role': 'local_working_primary_cache_not_required_committable_input' if ignored else 'existing_primary_content_input',
                            'portableSnapshotClaimed': not ignored}

receipt = write('bounded-split.actual-json-P-schema-portability-and-preservation.checkpoint.json', {
    'schemaVersion': 1, 'createdAt': stamp, 'role': 'Technical author checkpoint; science and independent review pending',
    'commands': [['python3', str(Path(__file__).relative_to(ROOT))], profile_receipt['command']],
    'wholeParentExact': True, 'wholeSourceDutiesExact': 13, 'wholePartnerGoalsExactCurrent': 22,
    'allOriginalMappingDecisionsByteAndValueExact': True,
    'activeCanonicalByteExact': source['activeCanonical'], 'activeNodeCount': 479,
    'current394Atoms299StrictProtectedBaseline': 'Unchanged active canonical and no active writes; no new central run or closure claimed',
    'candidateChildCount': 2, 'constructedBilingualWholeCases': 4,
    'currentProposedPRecordSchemaAndSemantics': bind(HERE / 'two-proposed-P-v2.ordinary-schema-and-semantics.actual.json'),
    'parsedOwnJSONAndJSONL': own_parsed, 'curriculumSymlinkErrors': symlink_errors,
    'requiredPortableInputs': list(inputs.values()), 'originalSourceDocumentCacheTruth': list(cache_docs.values()),
    'independentApprovals': [], 'humanApproval': False, 'activeWrites': [], 'strictGain': 0,
})

entry = write('neutral-begun-two-child-whole-candidate.commit-checkpoint.entry.json', {
    'schemaVersion': 1, 'createdAt': stamp, 'role': 'Neutral inactive begun author handoff; unapproved two-child split',
    'originalParentId': source['wholeOriginalParent']['id'],
    'candidateGoalIds': [e['goalId'] for e in current['entries']],
    'exactOriginalInputs': bind(HERE / 'exact-parent-thirteen-source-duties-and-twenty-two-whole-partners.author-input.json'),
    'wholeGoalAndParentClusterCandidates': bind(HERE / 'two-child-semantic-bodies-and-parent-cluster.author-candidate.json'),
    'currentWholePAndFourConstructedBilingualCases': bind(HERE / 'two-child-four-whole-bilingual-cases-and-P.readable-v2.author-candidate.json'),
    'currentNormalPAuthorSpecifications': bind(HERE / 'two-normal-positive-profile-specs.readable-v2.author-candidate.json'),
    'proposedGoalAndKindBoundPRecords': bind(HERE / 'two-proposed-whole-P-v2.ai-candidate.records.jsonl'),
    'sourcePlacementAndSemanticProposalsPending': bind(HERE / 'semantic-kind-atomicity-memory-and-exact-source-placement-proposals.pending.json'),
    'explicitAuthorDraftSuccessorDeltas': bind(HERE / 'bounded-readable-v2-author-deltas.actual.json'),
    'technicalChecksOnly': receipt,
    'currentBaseline': {'nodes': 479, 'atoms': 394, 'strictBiology': 299, 'activeCanonical': source['activeCanonical']},
    'conditionalFutureIfIndependentlyReviewedAndIntegrated': {'nodes': 481, 'atoms': 395, 'currentActive': False},
    'openGates': [
        'Two independent whole child science/P judgments; no current reviewed child exists',
        'Parent/child atomicity and memory decisions; proposed kind fingerprints are candidate-only',
        'All thirteen whole source duties and twenty-two partners plus jurisdiction/stage/course and regional learner projections',
        'RP TF12 ancestry-to-selected-human-behaviour duty source-duty-0276 remains unassigned/HOLD; do not claim either clean child covers it',
        'BY named Savannenhypothese source context remains whole: the synthetic habitat exclusivity test alone is not a historical first-origin demonstration',
        'New child primary images, actual phone usability, native pages and genuine paired D/P/V',
        'Actual future DAG/ancestor weights/source inheritance and protected old394/current299 contexts if integration is proposed',
    ],
    'historicalDraftsAndOriginalReviewsUnchanged': True,
    'independentApprovals': [], 'humanApproval': False, 'sourceOrNativeApproval': False,
    'status': 'inactive_ai_candidate_needs_human_review_E1_G1', 'activeWrites': [], 'strictGain': 0,
    'noFurtherWorkAtThisCheckpoint': True,
})

outputs = [bind(p) for p in sorted(HERE.iterdir()) if p.is_file()]
first = write('begun-two-child-author.commit-checkpoint.FIRST.freeze.json', {
    'schemaVersion': 1, 'createdAt': stamp, 'role': 'First actual bounded author checkpoint freeze; not a blind independent review',
    'neutralEntry': entry, 'inputs': list(inputs.values()), 'outputs': outputs,
    'independentScienceNativeImageSourceReviews': [], 'activeWrites': [], 'strictGain': 0,
})
assert bind(canon_path) == source['activeCanonical']
for b in list(inputs.values()) + outputs + [first]:
    assert bind(b['path']) == b, b['path']
final = write('begun-two-child-author.commit-checkpoint.final.freeze.json', {
    'schemaVersion': 1, 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Final byte verification of the begun inactive author checkpoint only',
    'neutralEntry': entry, 'firstFreeze': first, 'inputs': list(inputs.values()), 'outputs': outputs,
    'verifiedBindingCount': len(inputs) + len(outputs) + 1, 'mismatches': [],
    'activeCanonicalStillByteExact': source['activeCanonical'], 'independentApprovals': [],
    'activeWrites': [], 'strictGain': 0, 'noFurtherWritesAuthorizedForThisCheckpoint': True,
})
print(json.dumps({'entry': entry, 'firstFreeze': first, 'finalFreeze': final, 'sourceDuties': 13, 'partners': 22, 'PRecords': 2, 'PActualExit': 0, 'symlinkErrors': 0, 'strictGain': 0, 'openRPFacet': True}))
