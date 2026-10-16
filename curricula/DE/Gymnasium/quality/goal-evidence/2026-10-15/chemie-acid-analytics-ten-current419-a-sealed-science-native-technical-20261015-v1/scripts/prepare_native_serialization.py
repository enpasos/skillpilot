"""Technical serialization inputs only. Original sealed A remains read-only."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
import shutil

ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent.parent
DAY = OWN.parent
ORIGINAL = DAY / 'chemie-acid-analytics-ten-current419-successor-fresh-independent-a-20261015-v1'
NATIVE = DAY / 'chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1'
AUTHOR = DAY / 'chemie-acid-analytics-ten-current419-bounded-author-remediation-20261015-v1'


def load(path):
    return json.loads(path.read_text())


def rel(path):
    return path.resolve().relative_to(ROOT).as_posix()


def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def binding(path):
    data = path.read_bytes()
    return {'path': rel(path), 'sha256': digest(data), 'bytes': len(data)}


def write(name, obj):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


def jsonl(name, rows):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in rows))


def verify(ref, label):
    path = Path(ref['path'])
    if not path.is_absolute():
        path = ROOT / path
    actual = binding(path)
    assert actual['sha256'] == ref['sha256'], (label, actual, ref)
    if 'bytes' in ref:
        assert actual['bytes'] == ref['bytes'], (label, actual, ref)
    return {'label': label, **actual, 'matches': True}


def main():
    assert (ROOT / 'app/scripts/materializePositiveGoalEvidenceCandidates.ts').is_file()
    assert OWN.is_relative_to(ROOT)
    first_path = ORIGINAL / 'FIRST.independent-scientific-result.json'
    first = load(first_path)
    seal = load(ORIGINAL / 'FIRST.files.immutable-seal.json')
    inventory = load(ORIGINAL / 'FIRST.actual-read-inventory.json')
    checks = [verify(ref, 'original-FIRST-seal') for ref in seal['files']]
    checks += [verify(ref, 'original-A-actual-read-input') for ref in inventory['physicalInputs']]
    checks += [verify(ref, 'original-A-source-page-document') for ref in inventory['sourcePages']]
    assert seal['peerOutcomesReadBeforeSeal'] is False
    assert first['peerOutcomesReadBeforeFirst'] is False
    assert first['humanApproval'] is False and first['activeIntegration'] is False

    native_selector = load(NATIVE / 'NEUTRAL.exact-ten-current419-native-pages-whole-material-and-profile-review-inputs.json')
    author_selector = load(AUTHOR / 'NEUTRAL.exact-ten-bounded-author-successor-inputs.json')
    for key in ('currentWholeCanonical', 'currentSemanticLedger', 'completeDEENCases', 'completeRawV2Profiles', 'completeCurrentTenWholeGoals', 'exactExistingMVAndHHCard'):
        checks.append(verify(author_selector[key], 'successor-' + key))
    for key in ('nativeBookModel', 'nativeBundleManifest', 'nativePDF', 'nativeHTML', 'nativeWholeReviewInput', 'nativePDFRenderManifest', 'productionFingerprints'):
        checks.append(verify(native_selector[key], 'native-' + key))
    for key in ('campaign', 'reviewInput', 'batchInput'):
        checks.append(verify(native_selector['rounds']['a'][key], 'original-frozen-native-A-' + key))
    assert list((NATIVE / 'native-ten-current/round-a/results').iterdir()) == []

    canonical_path = ROOT / author_selector['currentWholeCanonical']['path']
    canonical = load(canonical_path)
    goals = {goal['id']: goal for goal in canonical['goals']}
    raw = load(AUTHOR / 'author-profiles.ten.raw.json')
    raw_by_id = {row['goalId']: row for row in raw['profiles']}
    goal_ids = [row['goalId'] for row in first['rows']]
    assert goal_ids == author_selector['goalIds'] == raw['goalIds']
    for row in first['rows']:
        goal = goals[row['goalId']]
        whole_digest = digest(json.dumps(goal, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())
        assert whole_digest == row['wholeGoalObjectSha256'] == raw_by_id[row['goalId']]['wholeGoalObjectSha256']
        assert row['P'] == 'pass_design_candidate_only'

    round_path = OWN / 'native/round-a'
    assert not round_path.exists(), 'Do not overwrite an existing owned round copy.'
    round_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(NATIVE / 'native-ten-current/round-a', round_path)
    (OWN / 'provenance').mkdir(exist_ok=True)
    shutil.copyfile(first_path, OWN / 'provenance/ORIGINAL-A.scientific-result.exact.json')
    (OWN / 'reuse').mkdir(exist_ok=True)
    shutil.copyfile(NATIVE / 'inputs/current-ten-M-V-whole-records-and-HH-card.exact-reuse.json', OWN / 'reuse/current-ten-M-V-and-HH.exact.json')
    (OWN / 'materials').mkdir(exist_ok=True)
    shutil.copyfile(AUTHOR / 'materials/twenty-complete-DEEN-cases.author.json', OWN / 'materials/twenty-complete-DEEN-cases.author.json')

    criteria_original = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid7-current419-paired-D6-retained059-P7A7M2V1-inactive-integration-technical-20261014-v4/inputs/P.criteria.original-exact.md'
    criteria_path = OWN / 'inputs/P.criteria.original-exact.md'
    criteria_path.parent.mkdir(exist_ok=True)
    shutil.copyfile(criteria_original, criteria_path)
    production = load(NATIVE / 'checks/PRODUCTION.D-pages-P-inputs-and-raw-profile-fingerprints.actual.json')
    assert digest(criteria_path.read_bytes()) == production['criteriaFingerprint']
    review_id = 'chemie-acid10-sealed-original-a-design-native-20261015-v1'
    reviewer = ('Original sealed independent scientific reviewer A; FIRST 2026-10-15T07:01:16.223542+00:00; '
                'technical serialization only, original reviewer identity/model not recorded')
    p_config = {
        '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
        'schemaVersion': 2, 'reviewId': review_id,
        'goalFingerprintRuleVersion': 'goal-evidence-v1',
        'profileRuleVersion': 'positive-understanding-evidence-v2',
        'landscapeId': canonical['landscapeId'],
        'landscapePath': rel(canonical_path),
        'semanticKindLedgerPath': author_selector['currentSemanticLedger']['path'],
        'reviewCriteriaPath': rel(criteria_path),
        'reviewPath': rel(OWN / 'P/P10.E1G1.design-only.ai-candidate.records.jsonl'),
        'reviewRunManifestPaths': [],
        'reviewedResourceTypes': ['goal-visualization'],
        'requireApproved': False,
        'scope': {'label': 'Ten goal-bound designs warranted by original sealed A FIRST; no observed learner/laboratory performance', 'goalIds': goal_ids},
    }
    write('config/P10.normal-E1G1-ai-candidate.inactive.config.json', p_config)
    candidates = {
        'schemaVersion': 1,
        'authoringContract': 'positive-understanding-evidence-candidates-v1',
        'reviewId': review_id,
        'reviewedAt': first['createdAtUTC'],
        'reviewer': reviewer,
        'goals': [{
            'goalId': row['goalId'],
            'reason': '\n\n'.join((row['rationaleDe'], row['materialAdequacy'], row['sourceAndCourseApproval'])),
            'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
            'dissent': first['retainedHolds'],
            'profile': raw_by_id[row['goalId']]['profile'],
        } for row in first['rows']],
    }
    (OWN / 'P').mkdir(exist_ok=True)
    write('P/P10.sealed-A-warranted-candidate-set.json', candidates)

    a_review_id = 'chemie-acid10-sealed-original-a-atomicity-native-20261015-v1'
    a_config = {
        'schemaVersion': 1, 'reviewId': a_review_id,
        'ruleVersion': 'semantic-atomicity-v1',
        'landscapeId': canonical['landscapeId'],
        'landscapePath': rel(canonical_path),
        'reviewPath': rel(OWN / 'A/A10.original-A-current-native.records.jsonl'),
        'scope': {'label': 'Original sealed A: seven atomic and three explicit developer-review holds', 'leafGoalIds': goal_ids},
    }
    write('config/A10.normal-original-A-with-three-holds.inactive.config.json', a_config)
    a_records = [{
        'schemaVersion': 1, 'reviewId': a_review_id,
        'ruleVersion': 'semantic-atomicity-v1', 'landscapeId': canonical['landscapeId'],
        'goalId': row['goalId'], 'fingerprint': 'pending-stock-helper',
        'status': row['A'],
        'semanticAtomic': True if row['A'] == 'atomic' else None,
        'reviewedAt': first['createdAtUTC'], 'reviewer': reviewer,
        'reason': row['rationaleDe'],
    } for row in first['rows']]
    jsonl('A/A10.original-A-current-native.records.jsonl', a_records)

    provenance = {
        'schemaVersion': 1,
        'createdAtUTC': datetime.now(timezone.utc).isoformat(),
        'role': 'technical serialization of existing sealed independent A; not a new scientific reviewer',
        'originalScientificResult': binding(first_path),
        'exactPortableScientificResultCopy': binding(OWN / 'provenance/ORIGINAL-A.scientific-result.exact.json'),
        'originalImmutableSeal': binding(ORIGINAL / 'FIRST.files.immutable-seal.json'),
        'originalActualReadInventory': binding(ORIGINAL / 'FIRST.actual-read-inventory.json'),
        'originalIndependentCalculations': binding(ORIGINAL / 'FIRST.independent-calculations.actual.json'),
        'originalInputCheck': binding(ORIGINAL / 'CHECK.input-bindings.before-science.json'),
        'originalScientificRoleVerbatim': first['role'],
        'originalReviewerRoleVerbatim': inventory['reviewerRole'],
        'originalCreatedAtUTC': first['createdAtUTC'],
        'originalPeerOutcomesReadBeforeFirst': first['peerOutcomesReadBeforeFirst'],
        'originalReviewerIdentity': 'not recorded in sealed FIRST',
        'originalProviderAndModel': 'not recorded in sealed FIRST',
        'serializationScientificVotes': 0,
        'serializationIsNewIndependentReview': False,
        'peerBOutcomesRead': False,
        'originalATextReadAsSerializationSource': True,
        'nativeDescriptionEvidenceConstruction': {
            'rationale': 'Exact original A rationaleDe, unedited.',
            'essentialAndObservable': 'Concatenation in original order of all four bilingual raw-profile expectations reviewed by original A.',
            'transfer': 'Concatenation in original order of all raw-profile bilingual variation axes reviewed by original A.',
            'newScientificInterpretation': False,
        },
        'nativeAtomicityRepresentation': {
            'originalNeedsDeveloperReviewSemanticAtomic': False,
            'nativeNeedsDeveloperReviewSemanticAtomic': None,
            'reason': 'Stock semanticAtomicityReview schema requires null for needs_developer_review; preserves the open status and exact rationale, never upgrades to atomic.',
        },
        'nativeDescriptionRunManifest': None,
        'nativeDescriptionRunHold': 'Original FIRST has no reviewer run manifest. The native independent campaign requires a bound independent run; a technical synthesizer is not an independent round under validateGoalDescriptionReviewDualRound.ts. No provider/model/run identity or blindness flag is invented.',
        'nativeRoundAOriginal': native_selector['rounds']['a'],
        'wholeCanonical': author_selector['currentWholeCanonical'],
        'semanticLedger': author_selector['currentSemanticLedger'],
        'rawProfiles': author_selector['completeRawV2Profiles'],
        'completeDEENCases': author_selector['completeDEENCases'],
        'successorSelector': binding(AUTHOR / 'NEUTRAL.exact-ten-bounded-author-successor-inputs.json'),
        'nativeSelector': binding(NATIVE / 'NEUTRAL.exact-ten-current419-native-pages-whole-material-and-profile-review-inputs.json'),
        'PReviewRunIds': [],
        'PReviewRunIdsReason': 'No new independent P generation run is invented; the original sealed A is the exact scientific warrant, with native stock candidate records remaining E1/G1.',
        'rawDesignE0G0IsUnchanged': True,
        'retainedHoldsVerbatim': first['retainedHolds'],
        'originalCountsVerbatim': first['counts'],
        'existingMAndVAndHH': binding(OWN / 'reuse/current-ten-M-V-and-HH.exact.json'),
        'newMOrVVotes': 0, 'humanApproval': False, 'humanTrial': False,
        'actualLearnerOrLaboratoryExecutions': 0,
        'activeIntegration': False, 'strictGain': 0,
    }
    write('provenance/ORIGINAL-A.provenance-and-field-serialization.json', provenance)
    write('checks/CHECK.original-FIRST-seal-and-exact-input-bindings.before-serialization.json', {
        'schemaVersion': 1, 'allMatched': True, 'bindingCount': len(checks),
        'checks': checks, 'originalFrozenRoundAResultsStillEmpty': True,
        'peerBOutcomesRead': False,
    })
    print(json.dumps({'checks': len(checks), 'goals': len(goal_ids), 'nativeRoundCopy': rel(round_path), 'scientificVotesCreated': 0}))


if __name__ == '__main__':
    main()
