# SPDX-License-Identifier: Apache-2.0
"""Run ordinary P tooling on the two independently reviewed whole profiles."""
from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib
import subprocess
import importlib.util
from copy import deepcopy

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OUT = BASE / 'biologie-evolution-two-material-findings-independent-b-followup-v1'
AUTHOR = BASE / 'biologie-evolution-two-material-findings-author-successor-v1'
ENTRY = AUTHOR / 'neutral-whole18-two-material-findings-author-successor.targeted-independent-review.entry.json'
REVIEW_ID = OUT.name
TARGETS = ['0db20819-ee94-54c6-8ecb-aff8c9b7419e', 'e3167331-f855-5030-9673-29f55a7b4230']
NOW = datetime.now(timezone.utc).isoformat()

def read(p):
    return json.loads(Path(p).read_text())

def binding(p):
    p = Path(p)
    assert not p.is_absolute() and p.is_file()
    assert not any(q.is_symlink() for q in [p, *p.parents])
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(p)

entry = read(ENTRY)
first_path = OUT / 'two-materials.independent-b.science-FIRST.freeze.json'
first_binding = binding(first_path)
first = read(first_path)
for b in first['sealedArtifacts']:
    assert binding(b['path']) == b
verdict = read(OUT / 'two-materials.independent-b.science-FIRST.verdict.json')
assert verdict['twoMaterialCorrectionsIndependentlyScientificallyAccepted'] is True
assert verdict['materialFindingResolutions'] == 2 and verdict['strictGain'] == 0
protected = [Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),
             Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),
             Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),
             Path('docs/qa-ci/status/curriculum-quality-status.json')]
before = [binding(p) for p in protected]
original_candidate = read(entry['wholePositiveCandidateSet18']['path'])
own_candidate = deepcopy(original_candidate)
own_candidate['reviewId'] = REVIEW_ID
own_candidate['reviewedAt'] = NOW
own_candidate['reviewer'] = 'Codex /root/evo12_visual_independent_b; targeted independent two-material followup after science-FIRST; model variant unexposed'
own_candidate['goals'] = [deepcopy(r) for r in original_candidate['goals'] if r['goalId'] in TARGETS]
assert [r['goalId'] for r in own_candidate['goals']] == TARGETS
for r in own_candidate['goals']:
    r['reason'] = ('Own targeted scientific followup accepts the corrected material finding on this exact whole profile and both full bilingual synthetic cases. '
                   'Finite-key ambiguity and carbon-bearing radiocarbon suitability were independently checked; own science-FIRST precedes tooling. '
                   'This is an AI candidate, not learner achievement or human approval. The original seven source/course holds, ordinal14 atomarity hold, '
                   'native D/P and actual image gates remain separate and open. No whole18 review restart or task-label quota.')
    assert r['profile'] == next(x['profile'] for x in original_candidate['goals'] if x['goalId'] == r['goalId'])
candidate_binding = write('two-whole-positive-profile-candidate-set.independent-b.scoped-P2.json', own_candidate)
config = read(entry['normalP18Config']['path'])
config['reviewId'] = REVIEW_ID
config['reviewPath'] = str(OUT / 'two-whole-positive.independent-b.scoped-P2.review.jsonl')
config['scope'] = {'label': 'Only two exact corrected Evo18 whole profiles after own targeted independent science-FIRST; other16 and all source/atomarity holds retained', 'goalIds': TARGETS}
config_binding = write('two-whole-positive.independent-b.scoped-P2.config.json', config)
terminals = []

def run(name, argv):
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(argv, capture_output=True)
    ended = datetime.now(timezone.utc).isoformat()
    stdout_path, stderr_path = OUT / (name + '.stdout.actual.txt'), OUT / (name + '.stderr.actual.txt')
    assert not stdout_path.exists() and not stderr_path.exists()
    stdout_path.write_bytes(result.stdout)
    stderr_path.write_bytes(result.stderr)
    terminal = write(name + '.terminal.actual.json', {
        'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'actual ordinary scoped P2 terminal after own science FIRST, no active integration',
        'argv': argv, 'startedAt': started, 'finishedAt': ended, 'exitCode': result.returncode,
        'stdout': binding(stdout_path), 'stderr': binding(stderr_path),
        'scienceFIRSTAlreadySealed': first_binding, 'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review',
        'humanApproval': False, 'humanTrial': False, 'strictGain': 0, 'activeWrites': []
    })
    terminals.append(terminal)
    print(result.stdout.decode(errors='replace'), end='')
    assert result.returncode == 0, result.stderr.decode(errors='replace')

run('normal-materialize-P2', ['app/node_modules/.bin/tsx', 'app/scripts/materializePositiveGoalEvidenceCandidates.ts',
    '--config', config_binding['path'], '--candidates', candidate_binding['path'], '--write'])
run('normal-check-P2', ['app/node_modules/.bin/tsx', 'app/scripts/positiveGoalEvidenceReview.ts',
    '--config=' + config_binding['path'], '--mode=check'])
records_path = Path(config['reviewPath'])
records = [json.loads(line) for line in records_path.read_text().splitlines() if line.strip()]
assert len(records) == 2 and [r['goalId'] for r in records] == TARGETS
author_records = {r['goalId']: r for r in (json.loads(line) for line in Path(entry['normalP18CandidateRecords']['path']).read_text().splitlines() if line.strip())}
for r in records:
    a = author_records[r['goalId']]
    assert r['profile'] == a['profile']
    for key in ['goalFingerprint', 'profileFingerprint', 'reviewInputFingerprint', 'reviewCriteriaFingerprint']:
        assert r[key] == a[key], (r['goalId'], key)
    assert r['reviewAuthority'] == 'ai_candidate' and r['status'] == 'needs_human_review'
    assert r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1'
    assert r['reviewRunIds'] == []
spec = importlib.util.spec_from_file_location('ordinary_schema', 'scripts/validate_schemas.py')
normal_schema = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normal_schema)
runtime_schema = read('docs/landscape-runtime.schema.json')
parsed_json = []
for p in OUT.glob('*.json'):
    read(p)
    assert normal_schema.validate_file(str(p), runtime_schema)
    parsed_json.append(binding(p))
assert binding(first_path) == first_binding
for b in first['sealedArtifacts']:
    assert binding(b['path']) == b
after = [binding(p) for p in protected]
assert before == after, 'An active input changed concurrently; do not claim unchanged without recording it.'
assert binding(entry['currentWhole479ExactInactiveSnapshot']['path'])['sha256'] == before[0]['sha256']

# Collect exact operative file bindings without treating URLs, diagnostic strings,
# source titles or scientific descriptions as files. Every structured binding and
# every standard configured Path below is verified, no allowlist of missing files.
portable_records = []

def walk(obj):
    if isinstance(obj, dict):
        if all(k in obj for k in ['path', 'sha256', 'bytes']):
            actual = binding(obj['path'])
            assert actual == {k: obj[k] for k in ['path', 'sha256', 'bytes']}, obj['path']
            portable_records.append(actual)
        for key, value in obj.items():
            if key in ['landscapePath', 'semanticKindLedgerPath', 'reviewCriteriaPath', 'reviewPath'] and isinstance(value, str):
                portable_records.append(binding(value))
            walk(value)
    elif isinstance(obj, list):
        for value in obj:
            walk(value)

for p in OUT.glob('*.json'):
    walk(read(p))
unique = {r['path']: r for r in portable_records}
ignore = subprocess.run(['git', 'check-ignore', '--stdin'], input=('\n'.join(unique) + '\n').encode(), capture_output=True)
assert ignore.returncode == 1 and ignore.stdout == b'', ignore.stdout.decode()
checks = write('two-materials.independent-b.scoped-P2-binding-schema-and-portability.actual.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'actual ordinary P2 checks and exact portability after independent scientific FIRST',
    'createdAt': datetime.now(timezone.utc).isoformat(), 'ownScienceFIRST': first_binding,
    'normalP2Config': config_binding, 'normalP2Candidates': candidate_binding,
    'normalP2Records': binding(records_path), 'actualTerminals': terminals,
    'configuredGoals': 2, 'approved': 0, 'needsHumanReview': 2, 'rejected': 0, 'blockingIssues': 0,
    'bothFullProfilesExactlyEqualToReviewedSuccessor': True,
    'bothGoalCriteriaProfileAndReviewInputFingerprintsEqualToExactSuccessor': True,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'ordinaryScopedJSONParserAndClassifier': 'scripts/validate_schemas.py validate_file for each own JSON; no runtime landscape reinterpretation of evidence',
    'ownJSONCompleteParseCountBeforeThisReceipt': len(parsed_json), 'ownJSONBindings': parsed_json,
    'operativeBindingCount': len(unique), 'operativeBindings': list(unique.values()),
    'missingBindings': 0, 'symlinks': 0, 'absoluteOperativePaths': 0, 'ignoredBindings': 0,
    'activeInputsBefore': before, 'activeInputsAfter': after, 'activeInputsUnchanged': True,
    'originalAuthorAndReviewBytesUnchanged': True,
    'all18WholeCurrentGoalsPreserved': True, 'all36CasesPreservedAfterOnly12ActualChangesMasked': True,
    'other16WholeMaterialEntriesAndPositiveProfilesExactlyUnchanged': True,
    'whole35SourceDuties30PartnerGoalsPreserved': True,
    'remainingAtomarityFindingExact': entry['remainingAtomarityFindingExact'],
    'remainingSourceAndCourseHoldsExact': entry['remainingSourceAndCourseHoldsExact'],
    'materialFindingResolutions': 2, 'newScientificClosures': 0, 'restoredBindings': 0,
    'whole18Approval': False, 'wholeSourceApproval': False, 'wholeCourseApproval': False,
    'currentNativeDPApproval': False, 'currentVApproval': False, 'humanApproval': False, 'humanTrial': False,
    'actualLearnerPerformance': False, 'actualExperimentPerformed': False, 'strictGain': 0,
    'fullQAOrBuildRun': False, 'activeWrites': []
})
neutral = write('neutral-completed-two-materials-independent-b.followup.entry.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'completed genuine independent B targeted two-material followup; not a new whole18 review',
    'neutralAuthorEntry': binding(ENTRY), 'targetFindingIds': entry['targetFindingIds'], 'targetWholeGoalIds': TARGETS,
    'scienceFIRST': first_binding, 'scienceVerdict': binding(OUT / 'two-materials.independent-b.science-FIRST.verdict.json'),
    'fullTwoGoalProfilesFourBilingualCases': binding(OUT / 'two-materials.independent-b.exact-whole-two-goals-profiles-four-bilingual-cases.input.json'),
    'ownActual12FieldDiffAndExact16Whole36Preservation': binding(OUT / 'two-materials.independent-b.actual-12-field-diff-and-whole-frame-preservation.json'),
    'ownIndependentPrimaryReading': binding(OUT / 'two-materials.independent-b.bounded-primary-reference-reading.receipt.json'),
    'ordinaryScopedP2AndExactPortability': checks,
    'findingOutcomes': [{'findingId': i, 'status': 'resolved_on_exact_successor_material_only'} for i in entry['targetFindingIds']],
    'remainingAtomarityFindingExact': entry['remainingAtomarityFindingExact'],
    'remainingSourceAndCourseHoldsExact': entry['remainingSourceAndCourseHoldsExact'],
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'peerFollowupRead': False, 'whole18Approval': False, 'wholeSourceApproval': False, 'wholeCourseApproval': False,
    'currentNativeDPApproval': False, 'currentVApproval': False, 'humanApproval': False, 'humanTrial': False,
    'actualLearnerPerformance': False, 'actualExperimentPerformed': False,
    'materialFindingResolutions': 2, 'newScientificClosures': 0, 'restoredBindings': 0, 'strictGain': 0, 'activeWrites': []
})
assert normal_schema.validate_file(checks['path'], runtime_schema)
assert normal_schema.validate_file(neutral['path'], runtime_schema)
payloads = [binding(p) for p in sorted(OUT.iterdir()) if p.is_file()]
final = write('two-materials.independent-b.followup.final.freeze.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'final sealed portable bounded independent two-material B followup; histories preserved',
    'completedNeutralEntry': neutral, 'sealedPayloads': payloads,
    'scienceFIRSTBeforeAuthorChecksAndOwnP2': True, 'peerFollowupRead': False,
    'materialFindingResolutions': 2, 'newScientificClosures': 0, 'restoredBindings': 0, 'strictGain': 0,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'whole18Approval': False, 'wholeSourceApproval': False, 'wholeCourseApproval': False,
    'currentNativeDPApproval': False, 'currentVApproval': False,
    'humanApproval': False, 'humanTrial': False, 'actualLearnerPerformance': False, 'actualExperimentPerformed': False,
    'activeWrites': [], 'nextRequiredWork': 'separate operative seven source/course holds and ordinal14 atomarity remedy; native D/P/V remain separate'
})
assert normal_schema.validate_file(final['path'], runtime_schema)
for b in read(final['path'])['sealedPayloads']:
    assert binding(b['path']) == b
print(json.dumps({'entry': neutral, 'finalFreeze': final, 'P2': {'needsHumanReview': 2, 'approved': 0, 'blockingIssues': 0}, 'strictGain': 0}, ensure_ascii=False))
