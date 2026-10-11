"""One-use exact Economics M2 activation after inspecting both foreign reviews."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

parser = argparse.ArgumentParser()
parser.add_argument('--review-a', required=True)
parser.add_argument('--review-b', required=True)
args = parser.parse_args()

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def read(path):
    return json.loads(Path(path).read_text())

root = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-standard-source-availability-and-current-boundary-root-v1')
source = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-twenty-six-source-role-and-two-bounded-surrogate-author-v1/current-explicit-source-role-and-one-subsumption-surrogate-successor-v3')
destination = root / 'actual-reviewed-M2-activation'
assert not destination.exists(), 'single-use activation receipt already exists'
handoff = source / 'actual-final-25-source-only-role-and-one-real-subsumption-binding.current-author-v3.handoff.receipt.json'
assert digest(handoff) == 'a661d55958a0e3df028a50278873a24c65d430fa6016a5c77db7d80756c43ae7'
manifest = read(read(handoff)['manifest']['path'])
assert digest(read(handoff)['manifest']['path']) == '02f910d7fe07eeb380c4f9c0529608d6f24689bbddef5b32cb464acd0249bdbb'
for item in manifest['inputs']:
    assert digest(item['path']) == item['sha256'], item['path']

reviews = []
for path in [args.review_a, args.review_b]:
    assert not Path(path).is_absolute()
    record = read(path)
    # The root examines actual judgments before passing these exact whole files.
    reviews.append({'path': path, 'sha256': digest(path), 'wholeReview': record})
assert args.review_a != args.review_b
assert reviews[0]['sha256'] == '6f9fa847e30e9fa1046bc4faed7ea4e28826c1b170ffba2ce28614102f5ea2e6'
assert reviews[0]['wholeReview']['independentFromAuthor'] is True
assert reviews[0]['wholeReview']['summary']['overallBoundedSourceFollowupVerdict'] == 'KEEP'
assert reviews[1]['sha256'] == '0d5069490521061b283e997f95fcb2c50ecbe5fc98b42a220fc77925283e720b'
assert reviews[1]['wholeReview']['decision'] == 'KEEP_BOUNDED_V3_25_EXPLICIT_ROLE_CORRECTIONS_AND_ONE_NORM_SUBSUMPTION_SOURCE_RELATION'
assert reviews[1]['wholeReview']['humanReviewReleaseApprovalOrTrialClaim'] is False

index = read(source / read(handoff)['viewIndex'])
assert len(index['views']) == 32
can = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
assert digest(can) == 'c45874840ce8e35ca2db9d747c3876c8e54779ed97ab33a24d7ae11ba0810e13'
preserved = [
    can,
    Path('curricula/DE/Gymnasium/provenance/source-landscape-registry.json'),
    Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),
    Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'),
    Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'),
    Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current493-reviewed-20261009-v1/wirtschaftswissenschaften.semantic-kinds.json'),
    Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/whole-P336-only-two-current-reviewed-requires-input-fingerprint-successors.jsonl'),
    Path('curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-gk.view.json'),
    Path('curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-lk.view.json'),
    Path('app/scripts/config/goal-books/de-gym-economics-current-canonical.json'),
]
preserved += sorted(Path('curricula/DE/Gymnasium/canonical').glob('*.json'))
fingerprints = {str(path): digest(path) for path in preserved}

registry_path = Path('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json')
before_registry = read(registry_path)
assert len(before_registry['entries']) == 362
proposed = read(source / read(handoff)['sourceSurrogateEntry'])['entries']
assert len(proposed) == 1
entry = proposed[0].copy()
assert entry['status'] == 'candidate'
assert entry['landscapeId'] == '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
assert entry['goalId'] == 'dae93971-726c-56e5-8044-19dbd40febf7'
assert entry['requiredByGoalId'] == 'bd413a7c-775a-5318-813c-0b75578f9a11'
assert entry['jurisdiction'] == 'DE-BE'
entry['status'] = 'accepted'
assert not any(all(old.get(k) == entry[k] for k in ['landscapeId', 'goalId', 'jurisdiction', 'requiredByGoalId']) for old in before_registry['entries'])

for view in index['views']:
    candidate = Path(view['candidate']['path'])
    target = Path(view['prospectiveActivePath'])
    previous = Path(view['beforeView']['path'])
    assert digest(candidate) == view['candidate']['sha256']
    assert digest(previous) == view['beforeView']['sha256']
    read(candidate)
    if target.exists():
        assert target == previous
    else:
        assert view['courseProfile'] == 'LK' or view['jurisdiction'] == 'DE-BE'
    assert target.parent == Path('curricula/DE/Gymnasium/composition-views/wirtschaft')

destination.mkdir()
backup = destination / 'whole-predecessors'
backup.mkdir()
shutil.copyfile(registry_path, backup / registry_path.name)
installed = []
for view in index['views']:
    target = Path(view['prospectiveActivePath'])
    existed = target.exists()
    if existed:
        shutil.copyfile(target, backup / target.name)
    shutil.copyfile(view['candidate']['path'], target)
    assert digest(target) == view['candidate']['sha256']
    installed.append({'path': str(target), 'sha256': digest(target), 'existedBefore': existed})

after_registry = {**before_registry, 'entries': [*before_registry['entries'], entry]}
registry_path.write_text(json.dumps(after_registry, ensure_ascii=False, indent=2) + '\n')
actual_registry = read(registry_path)
assert actual_registry['entries'][:-1] == before_registry['entries']
assert actual_registry['entries'][-1] == entry
assert {k:v for k,v in actual_registry.items() if k != 'entries'} == {k:v for k,v in before_registry.items() if k != 'entries'}
for path, expected in fingerprints.items():
    assert digest(path) == expected, path

receipt = {
    'role': 'Actual bounded Economics M2 source/view activation after two independent scientific role/subsumption qualifications',
    'authorHandoff': {'path': str(handoff), 'sha256': digest(handoff)},
    'foreignReviews': reviews,
    'installedViews': installed,
    'wholePredecessorsPreserved': str(backup),
    'sourceRoleCountryGoalCorrections': 25,
    'sourceRoleScopeCorrections': 46,
    'all336GlobalAndNationalOrdinaryTargetsRetained': True,
    'unchangedWholeInputs': fingerprints,
    'surrogateRegistry': {'path': str(registry_path), 'sha256': digest(registry_path), 'all362PreviousEntriesExact': True, 'oneActuallyScientificallyReviewedAcceptedEntry': entry},
    'source125And208PartialStrengthsChanged': False,
    'newScientificStrictGoalClosures': 0,
    'newStrictBindingRestorations': 0,
    'maturityPendingActualNativeCentralEvaluation': True,
    'humanApprovalOrTrialClaimed': False,
    'gitCommitCreated': False,
}
receipt_path = destination / 'actual-two-reviewed-M2-source-views-and-one-subsumption-activation.receipt.json'
receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
read(receipt_path)
print(json.dumps({'receipt': str(receipt_path), 'sha256': digest(receipt_path), 'views': len(installed), 'nativeStatusEvaluationStillRequired': True}))
