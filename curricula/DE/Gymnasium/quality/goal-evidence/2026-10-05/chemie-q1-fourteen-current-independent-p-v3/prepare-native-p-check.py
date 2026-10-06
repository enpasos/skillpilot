"""Apache-2.0: isolate unchanged native P tools and exact frozen author inputs."""
from pathlib import Path
import hashlib
import json
import shutil
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-positive-current-author-v2'
Q1 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1'
ISO = OWN / 'native-isolated'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert ROOT.name == 'skillpilot', ROOT
assert not ISO.exists(), 'Use a new isolated output rather than overwriting an earlier receipt.'
freeze_path = AUTHOR / 'author-package.final.freeze.json'
assert sha(freeze_path) == '4318141ef4a36189001c47be322988befac67f9eac3324fcdcfa8d4e9c7a3a66'
freeze = json.loads(freeze_path.read_text())
for entry in freeze['files']:
    path = ROOT / entry['path']
    assert sha(path) == entry['sha256'], entry['path']
    assert path.stat().st_size == entry['bytes'], entry['path']

candidate_path = AUTHOR / 'positive-evidence.candidates.json'
candidate = json.loads(candidate_path.read_text())
assert len(candidate['goals']) == 14
assert sum(len(x['profile']['applicationCaseBriefs']) for x in candidate['goals']) == 28
model_path = Q1 / 'native-finalbook/bundle/book-model.json'
assert sha(model_path) == 'b7b461081bfc9691e924d6d92349c0873ae0d47e54c6e711befde7df5be5d4cd'
model = json.loads(model_path.read_text())
pages = {x['goalId']: x for x in model['pages']}
canon_rel = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
ledger_rel = Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
criteria_rel = Path('curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
canon_path = Q1 / 'prospective-input-tree' / canon_rel
canon = json.loads(canon_path.read_text())
goals = {x['id']: x for x in canon['goals']}
inputs = []

def copy(src, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    assert sha(src) == sha(dest)
    inputs.append({'sourcePath': str(src.relative_to(ROOT)), 'isolatedPath': str(dest.relative_to(ISO)), 'sha256': sha(src), 'bytes': src.stat().st_size})

for name in ['materializePositiveGoalEvidenceCandidates.ts', 'positiveGoalEvidenceReview.ts', 'positiveGoalEvidenceProfileModel.ts', 'goalEvidenceProfileModel.ts']:
    copy(ROOT / 'app/scripts' / name, ISO / 'app/scripts' / name)
copy(ROOT / 'app/package.json', ISO / 'app/package.json')
copy(ROOT / 'app/src/landscapeTypes.ts', ISO / 'app/src/landscapeTypes.ts')
(ISO / 'app/node_modules').symlink_to(ROOT / 'app/node_modules', target_is_directory=True)
for rel in [Path('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), Path('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'), Path('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')]:
    copy(ROOT / rel, ISO / rel)
copy(canon_path, ISO / canon_rel)
copy(Q1 / 'prospective-input-tree' / ledger_rel, ISO / ledger_rel)
copy(ROOT / criteria_rel, ISO / criteria_rel)
copy(candidate_path, ISO / 'p.candidates.json')

image_receipts = []
for spec in candidate['goals']:
    gid = spec['goalId']
    goal = goals[gid]
    page = pages[gid]
    assert goal['description'] == page['description'], gid
    for link in goal.get('resourceLinks', []):
        if link.get('type') != 'goal-visualization':
            continue
        rel = Path('app/public') / link['url'].lstrip('/')
        retained = Q1 / 'visual-review-input-tree-v2' / rel
        source = retained if retained.exists() else ROOT / rel
        copy(source, ISO / rel)
        assert 'sha256:' + sha(source) == page['visualization']['originalDigest'], gid
        assert link['altText'] == page['visualization']['altText'], gid
        image_receipts.append({'goalId': gid, 'url': link['url'], 'sha256': sha(source), 'altText': link['altText'], 'nativeBookGoalFingerprint': page['goalFingerprint'], 'nativeBookPageFingerprint': page['pageFingerprint']})

config = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    'schemaVersion': 2,
    'reviewId': candidate['reviewId'],
    'goalFingerprintRuleVersion': 'goal-evidence-v1',
    'profileRuleVersion': 'positive-understanding-evidence-v2',
    'landscapeId': canon['landscapeId'],
    'landscapePath': str(canon_rel),
    'semanticKindLedgerPath': str(ledger_rel),
    'reviewCriteriaPath': str(criteria_rel),
    'reviewPath': 'p.review.jsonl',
    'reviewRunManifestPaths': [],
    'reviewedResourceTypes': ['goal-visualization'],
    'requireApproved': False,
    'scope': {'label': 'Fourteen separately scientifically reviewed authored AI candidates; E1/G1, human review pending', 'goalIds': [x['goalId'] for x in candidate['goals']]},
}
write(ISO / 'p.config.json', config)
write(OWN / 'positive-evidence.native-isolated.config.json', config)
write(OWN / 'independent-input-and-isolation.actual.receipt.json', {
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'authorFreezePath': str(freeze_path.relative_to(ROOT)), 'authorFreezeSHA256': sha(freeze_path),
    'verifiedFrozenAuthorFiles': len(freeze['files']),
    'candidatePath': str(candidate_path.relative_to(ROOT)), 'candidateSHA256': sha(candidate_path),
    'sourceBookModelPath': str(model_path.relative_to(ROOT)), 'sourceBookModelSHA256': sha(model_path),
    'nativeToolCopiesUnmodified': True, 'privateDataRead': False, 'activeWrites': 0,
    'inputs': inputs, 'imageBindings': image_receipts,
    'scienceReviewIsSeparateFromNativeSchemaValidation': True,
    'fullGoalObjectsRemainOldFrozenQ1FutureNotLatestIntegration': True,
    'rebaseStillRequiredAfterB010Integration': True,
})
print(f'Prepared exact isolated inputs: 14 profiles, 28 cases, {len(image_receipts)} image bindings, {len(inputs)} input copies')
