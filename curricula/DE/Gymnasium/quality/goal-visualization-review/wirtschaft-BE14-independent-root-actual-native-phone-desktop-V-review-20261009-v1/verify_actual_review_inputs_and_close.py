"""Verify unchanged inputs after Root's actual 42 image views; no automatic visual review."""
import datetime
import hashlib
import json
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[6]
OUT = Path(__file__).resolve().parent
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-BE-fourteen-specific-illustrations-author-20261009-v1'
EVIDENCE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-BE18-current300-whole-positive-tax-atomicity-memory-and-cards-author-v1'


def read(path):
    return json.loads(path.read_text())


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def binding(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': digest(path)}


manifest_path = AUTHOR / 'fourteen-selected-specific-PNG-candidates.pending-independent-V.manifest.json'
assert digest(manifest_path) == 'bd045f18fb85947c9103c509436652947aab94fe8dc4778ed8fca7f6790ae8eb'
manifest = read(manifest_path)
before = read(OUT / 'actual-inputs-before.guard.json')
for item in before['inputs']:
    assert digest(Path(item['path'])) == item['sha256'], item['path']

goals_path = EVIDENCE / 'whole-eighteen-new-goal-contracts.exact-sourceV3.candidate.json'
profiles_path = EVIDENCE / 'whole-eighteen-positive-v2-two-case-candidates.schema-successor-v2.json'
goals = {g['id']: g for g in read(goals_path)}
profiles = {p['goalId']: p for p in read(profiles_path)['goals']}
judgments_path = OUT / 'actual-individual-independent-root-three-size-judgments.in-progress.json'
judgments = read(judgments_path)
assert len(judgments) == len(manifest['records']) == 14
assert len({r['goalId'] for r in judgments}) == 14
assert [j['goalId'] for j in judgments] == [r['goalId'] for r in manifest['records']]

physical = []
for record, judgment in zip(manifest['records'], judgments):
    gid = record['goalId']
    assert record['wholeGoal'] == goals[gid]
    assert record['wholePositiveProfile'] == profiles[gid]
    assert len(profiles[gid]['profile']['applicationCaseBriefs']) == 2
    assert judgment['selectedCandidateSha256'] == record['selectedCandidateSha256']
    assert judgment['independentFromImageAuthor'] is True
    assert judgment['reviewer'] == '/root'
    assert judgment['imageAuthor'] == '/root/economics_visual_source_continuation'
    assert judgment['decision'] == 'KEEP' and judgment['findings'] == []
    assert all(judgment[k] is True for k in (
        'wholeGoalDEENAndP2ActuallyRead', 'actualNative1672x941Seen',
        'actualPhone360x203Seen', 'actualDesktop680x383Seen',
        'exactProviderPromptAndProvenanceActuallyRead'))
    candidate = REPO / record['selectedCandidatePath']
    assert digest(candidate) == record['selectedCandidateSha256']
    prompt = REPO / record['exactProviderPromptPath']
    assert digest(prompt) == record['exactProviderPromptSha256']
    assert gid not in prompt.read_text()
    provenance_path = REPO / record['provenanceReceiptPath']
    assert digest(provenance_path) == record['provenanceReceiptSha256']
    provenance = read(provenance_path)
    original = Path(provenance['actualOriginalGeneratedSourcePath'])
    assert candidate.read_bytes() == original.read_bytes()
    assert digest(original) == provenance['actualOriginalGeneratedSourceSha256']
    if 'actualEditReferencePath' in provenance:
        reference = REPO / provenance['actualEditReferencePath']
        assert digest(reference) == provenance['actualEditReferenceSha256']
    views = []
    for label, path, expected in (
        ('native', candidate, (1672, 941)),
        ('phone', candidate.parent / 'actual-author-inspection-derivatives/actual-360px.png', (360, 203)),
        ('desktop', candidate.parent / 'actual-author-inspection-derivatives/actual-680px.png', (680, 383)),
    ):
        with Image.open(path) as im:
            assert im.format == 'PNG' and im.size == expected
        views.append({'kind': label, **binding(path), 'dimensions': list(expected), 'actuallyViewedByRoot': True})
    physical.append({'goalId': gid, 'wholeGoalExact': True, 'wholeProfileExact': True,
                     'actualProvider': provenance['actualTool'],
                     'modelDisclosure': provenance['actualUnderlyingModel'],
                     'prompt': binding(prompt), 'provenance': binding(provenance_path),
                     'originalSourcePath': str(original), 'originalSourceSHA256': digest(original),
                     'views': views, 'selection': record['sourceSelection']})

final_judgments_path = OUT / 'actual-fourteen-individual-independent-native-phone-desktop-V-KEEP.json'
final_judgments_path.write_text(json.dumps(judgments, ensure_ascii=False, indent=2) + '\n')
norms_path = OUT / 'actual-fresh-primary-HGB-content/actual-fresh-four-primary-fetches.receipt.json'
norms = read(norms_path)
assert len(norms['attempts']) == 4
for norm in norms['attempts']:
    assert norm['actualHttpStatus'] == 200
    assert digest(REPO / norm['path']) == norm['sha256']

receipt = {
    'schemaVersion': 1,
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Root independent of all fourteen image authors; actual content and three-size visual review',
    'previousGoalTurnClassification': {'classification': 'no_progress',
        'reason': 'Previous response only supplied a commit message and made no authoritative curriculum change.'},
    'authorManifest': binding(manifest_path),
    'beforeGuard': binding(OUT / 'actual-inputs-before.guard.json'),
    'actualBeforeAfterUnchangedFiles': len(before['inputs']),
    'exactOriginalEighteenWholeGoalInput': binding(goals_path),
    'exactOriginalEighteenWholeProfileInput': binding(profiles_path),
    'actualWholeGoalObjectsRetained': 14,
    'actualWholeP2ProfilesRetained': 14,
    'actualWholeBilingualCasesRetained': 28,
    'independentJudgments': binding(final_judgments_path),
    'actualPhysicalImageViews': physical,
    'newIndependentMachineImageKEEP': 14,
    'unmodifiedGoodFirstCandidatesKEEP': 10,
    'fourAuthorCorrectionsActuallyIndependentlyConfirmed': ['detached magnifying hand',
        'dialogue response speaker', 'observer counting-device perspective', 'German crisis captions'],
    'formatDecision': 'All actual native PNG1672x941, near16:9. Friendly abstract clear comic; no alternate-ratio exception or programmatic replacement.',
    'factualScope': 'Image orientation against the exact current DE/EN contracts and full P2 profiles; not source evidence, assessment stimulus or learner performance.',
    'freshPrimaryLegalCorroboration': binding(norms_path),
    'allFourWholeHGBNormsActuallyReadByRoot': True,
    'historicalFailuresRetained': ['Initial web.open for HGB1/17/15 timed out; actual HTTP200 originals subsequently saved and read.',
        'Initial orchestration attempted to JSON-parse truncated command output; already written guard remained intact and compact output was read successfully.',
        'Two unrelated source-PDF extraction attempts failed because pdftotext and fitz were unavailable; no PDF source-reading claim follows.'],
    'liveCanonicalOrQAChanges': [],
    'liveStrictState': '300/311',
    'newStrictCurricularClosures': 0,
    'restoredLiveBindings': 0,
    'netStrictGain': 0,
    'sourceCountryOrCourseApproval': False,
    'independentDescriptionRoundsComplete': False,
    'humanApprovalOrTrial': False,
    'nextStep': 'Technical native import into an isolated current candidate using the actual provider/prompts; later verify final goal/source/page bindings and independent D rounds before live integration.',
}
path = OUT / 'actual-final-fourteen-independent-native-phone-desktop-V-review.receipt.json'
path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'receipt': binding(path), 'judgments': binding(final_judgments_path),
                  'guardedFilesUnchanged': len(before['inputs']), 'KEEP': 14, 'strictNet': 0}))
