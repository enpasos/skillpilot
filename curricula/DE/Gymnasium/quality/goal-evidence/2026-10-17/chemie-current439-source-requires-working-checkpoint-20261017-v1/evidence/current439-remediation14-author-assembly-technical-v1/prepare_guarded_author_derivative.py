"""Prepare a private thin-COW author derivative; no reviews or frozen inputs."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

O = Path(__file__).resolve().parent
B = O.parent
N = B / 'current439-AV-and-native-registry-integration-root-v1/capsule'
C = O / 'capsule'
R = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-author-assembly-technical-v1')
CANON = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
LEDGER = Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-all-seven-current439-native-central-preparation-technical-a-v1/base.full439.current-all-seven-HB7f.private.config.json')
SOURCES = {
    'description4': ('chemie-four-explicit-source-model-description-conditions-author-root-v1/C650.exact-other-goals-four-description-conditions.author-candidate.json', '1a8cd5afd9774db4d172a847f262716a496c2a1acaedafcefd659535367156d6'),
    'profile91cd': ('chemie-91cd-permanent-dipole-P-targeted-author-root-v1/P91cd.whole-profile.targeted-permanent-dipole.author-candidate.json', '43ea57e26a039638723ee0ebebe3b05f5e302f3826056cc715b6ab469aaa783c'),
    'profileCf270': ('chemie-cf270-biuret-controlled-procedure-author-v1/candidate.profile.json', 'd5f6de6ee00594b328bbc9d4ea8071196f644b69010309992a75ea5481cf77bf'),
    'cf270Material': ('chemie-cf270-biuret-controlled-procedure-author-v1/authored-material.de-en.md', 'c588d50993d057500c8b37954b5d27f335a2502f6b4c94c145a4f2ab3bba020b'),
    'image4Selector': ('chemie-four-real-image-defects-author-root-v1/SELECTOR.four-selected-image-candidates-for-independent-review.json', 'e17564106f3146f47b2ac00d37efd9d74c4e1fa5bae89885bbe7c2881673f09c'),
}
PIDS = ['91cd4728-b811-562a-970b-18b81dfb4bdf', 'cf270aaf-235a-55a7-94a2-c4d9d7570a6b',
        'f85b4651-50ea-5b42-b193-3465c05257a7', 'b8d3b453-d638-5518-aab0-d84ec2e8567c',
        '188bd684-e894-5753-8a50-798220b04d97', '5c8f0bbb-103a-579f-87fc-c997afe4fd18']

def read(path):
    return json.loads(Path(path).read_text())

def pin(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()

guards = {}
def guard(path, expected_sha=None):
    actual = pin(path)
    if expected_sha is not None:
        assert actual['sha256'] == expected_sha.removeprefix('sha256:'), str(path)
    if actual['path'] in guards:
        assert guards[actual['path']] == actual
    guards[actual['path']] = actual
    return actual

localized = []
def own(path):
    assert path == C or C in path.parents
    if path == C:
        assert path.is_dir() and not path.is_symlink()
        return
    own(path.parent)
    if path.is_symlink():
        original = path.resolve(strict=True)
        assert original.is_dir()
        path.unlink()
        path.mkdir()
        for child in original.iterdir():
            (path / child.name).symlink_to(child, target_is_directory=child.is_dir())
        localized.append({'path': str(path), 'previousAlias': str(original)})
    elif not path.exists():
        path.mkdir()
        localized.append({'path': str(path), 'created': True})
    assert path.is_dir() and not path.is_symlink()

writes = []
def private_file(path, raw):
    assert path.is_relative_to(O)
    if path.is_relative_to(C):
        own(path.parent)
        if path.is_symlink():
            path.unlink()
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists() and not path.is_symlink(), str(path)
    with path.open('xb') as stream:
        stream.write(raw)
    actual = pin(path)
    writes.append(actual)
    return actual

assert not C.exists() and not C.is_symlink(), 'A fresh derivative is required'
base = read(N / BASE)
canonical = read(N / CANON)
before_by_id = {goal['id']: goal for goal in canonical['goals']}
for key, (relative, expected) in SOURCES.items():
    guard(B / relative, expected)
candidate = read(B / SOURCES['description4'][0])
assert {key: value for key, value in candidate.items() if key != 'goals'} == {key: value for key, value in canonical.items() if key != 'goals'}
assert [goal['id'] for goal in candidate['goals']] == [goal['id'] for goal in canonical['goals']]
description_deltas = []
for goal in candidate['goals']:
    old = before_by_id[goal['id']]
    changes = sorted(key for key in set(old) | set(goal) if old.get(key) != goal.get(key))
    if changes:
        assert changes == ['description', 'descriptionEn'], (goal['id'], changes)
        description_deltas.append({'goalId': goal['id'], 'title': goal['title'], 'changedFields': changes,
                                   'before': {key: old[key] for key in changes}, 'authorCandidate': {key: goal[key] for key in changes}})
assert len(description_deltas) == 4

image_selector = read(B / SOURCES['image4Selector'][0])
images = image_selector['candidates']
assert len(images) == 4 and len({image['goalId'] for image in images}) == 4
description_ids = [item['goalId'] for item in description_deltas]
image_ids = [image['goalId'] for image in images]
assert len(set(description_ids + PIDS + image_ids)) == 14
model = read(N / base['outputPath'])
positions = {page['goalId']: index for index, page in enumerate(model['pages'])}
goal_ids = sorted(description_ids + PIDS + image_ids, key=positions.__getitem__)
assert len(goal_ids) == 14 and len(model['pages']) == 439 and len(canonical['goals']) == 650

source_p_path = N / base['evidenceReviewPaths'][0]
p_rows = [json.loads(line) for line in source_p_path.read_text().splitlines() if line.strip()]
p_by_id = {row['goalId']: row for row in p_rows}
assert len(p_rows) == 439 and all(goal_id in p_by_id for goal_id in goal_ids)
assert all(p_by_id[goal_id]['status'] == 'needs_human_review' and p_by_id[goal_id]['reviewAuthority'] == 'ai_candidate' for goal_id in goal_ids)
qa = read(N / base['goalVisualizationQaPath'])
qa_by_id = {record['goalId']: record for record in qa['records']}
ledger_raw = (N / LEDGER).read_bytes()
guard(N / LEDGER, '3359f212b650c6cf95f8c6208ab114f12e6efae1a8ff92b87469be5aad85e706')
ledger = json.loads(ledger_raw)
assert len(ledger['activeBatchConfigPaths']) == 20
for relative in [str(CANON), str(BASE), base['compositionViewPath'], base['semanticKindLedgerPath'],
                 base['goalVisualizationQaPath'], base['outputPath'], *base['evidenceReviewPaths'], *ledger['activeBatchConfigPaths']]:
    guard(N / relative)
for relative in ['app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/goalEvidenceProfileModel.ts',
                 'app/scripts/goalBookModel.ts', 'app/scripts/goalBookEvidenceReviewLoader.ts',
                 'app/scripts/materializeGoalDescriptionRolloutBatch.ts',
                 'app/src/utils/authoring/canonicalAuthoring.ts',
                 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
                 'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json']:
    guard(N / relative)
for goal_id in goal_ids:
    current_qa = qa_by_id[goal_id]
    guard(N / current_qa['publicAssetPath'])
    guard(N / current_qa['canonicalAssetPath'])
for image in images:
    guard(image['path'], image['sha256'])
    assert pin(image['path'])['bytes'] == image['bytes']

private_file(O / 'GUARDS.original-inputs.before.json', encode({'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'sourceRoot': str(N), 'pins': list(guards.values()), 'scope': 'Actual author14 source inputs only; evolving N synthesis/resolution trees are excluded.'}))
C.mkdir()
for child in N.iterdir():
    (C / child.name).symlink_to(child, target_is_directory=child.is_dir())
private_file(C / LEDGER, ledger_raw)
for relative in ledger['activeBatchConfigPaths']:
    private_file(C / relative, (N / relative).read_bytes())
assert (C / LEDGER).read_bytes() == ledger_raw

for key, (relative, _) in SOURCES.items():
    source = B / relative
    private_file(O / 'input-copies' / key / source.name, source.read_bytes())
for key, relative in [('canonical', str(CANON)), ('profiles439', base['evidenceReviewPaths'][0]),
                      ('semanticKinds650', base['semanticKindLedgerPath']), ('visualizationQa', base['goalVisualizationQaPath']),
                      ('baseConfig', str(BASE)), ('baseModel', base['outputPath'])]:
    source = N / relative
    private_file(O / 'original-input-history' / key / source.name, source.read_bytes())

candidate_by_id = {goal['id']: goal for goal in candidate['goals']}
image_changes = []
for image in images:
    goal_id = image['goalId']
    links = candidate_by_id[goal_id]['resourceLinks']
    matches = [(index, link) for index, link in enumerate(links) if link.get('type') == 'goal-visualization' and link.get('role') == 'primary']
    assert len(matches) == 1
    index, link = matches[0]
    old = copy.deepcopy(link)
    url = f'/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.png'
    link['url'] = url
    link['provider'] = image_selector['provider']
    link['reviewStatus'] = 'needs_review'
    assert sorted(key for key in set(old) | set(link) if old.get(key) != link.get(key)) == ['provider', 'reviewStatus', 'url']
    canonical_image = Path(f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/{goal_id}.png')
    public_image = Path('app/public') / url.lstrip('/')
    raw = Path(image['path']).read_bytes()
    for destination in [C / canonical_image, C / public_image]:
        private_file(destination, raw)
        assert pin(destination)['sha256'] == image['sha256']
    image_changes.append({'goalId': goal_id, 'resourceJsonPointer': f'/resourceLinks/{index}', 'beforeResource': old,
                          'authorCandidateResource': copy.deepcopy(link), 'sourceImage': guard(image['path']),
                          'candidateCanonicalAssetPath': str(canonical_image), 'candidatePublicAssetPath': str(public_image),
                          'candidateImageUrl': url, 'candidateStatus': 'UNAPPROVED_AUTHOR_CANDIDATE'})
private_file(C / CANON, encode(candidate))

canonical_changed = []
for goal in candidate['goals']:
    old = before_by_id[goal['id']]
    changes = sorted(key for key in set(old) | set(goal) if old.get(key) != goal.get(key))
    if changes:
        canonical_changed.append({'goalId': goal['id'], 'changedFields': changes})
assert len(canonical_changed) == 8
assert all(item['changedFields'] == (['description', 'descriptionEn'] if item['goalId'] in description_ids else ['resourceLinks']) for item in canonical_changed)

draft_base = copy.deepcopy(base)
draft_base.update(bookId='chemie-current439-remediation14-author-candidate-base-20261017-v1',
                  title='Chemie – privater Autorenstand für 14 begrenzte Nachbesserungen',
                  semanticKindLedgerPath=str(R / 'SEM650.same-kinds-four-description-source-bindings.author-draft.json'),
                  goalVisualizationQaPath=str(R / 'QA.four-unapproved-image-author-bindings.draft.json'),
                  evidenceReviewPaths=[str(R / 'P439.author14-bindings.draft.jsonl')],
                  outputPath=str(R / 'book-model.full439.author-input-base.draft.json'))
base_relative = str(R / 'base.full439.remediation14.author-draft.config.json')
private_file(C / base_relative, encode(draft_base))
batch = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
         'schemaVersion': 1, 'batchId': 'chemie-current439-remediation14-author-candidate-20261017-v1',
         'subject': 'chemie', 'subjectLabel': 'Chemie', 'bookId': 'chemie-current439-remediation14-author-candidate-20261017-v1',
         'title': 'Chemie – 14 begrenzte Beschreibungs-, Profil- und Bildkandidaten',
         'baseGoalBookConfigPath': base_relative, 'goalIds': goal_ids, 'outputDirectory': str(R / 'native14'),
         'feedbackBaseUrl': 'https://skillpilot.com/lernziel-feedback',
         'promptPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
         'criteriaPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
         'printDerivativeProfile': 'bounded-atlas'}
batch_relative = str(R / 'remediation14.batch.config.json')
private_file(C / batch_relative, encode(batch))

safe_bodies = []
for goal_id in goal_ids:
    goal = candidate_by_id[goal_id]
    selected_profile = read(B / SOURCES['profile91cd'][0]) if goal_id == PIDS[0] else read(B / SOURCES['profileCf270'][0]) if goal_id == PIDS[1] else p_by_id[goal_id]['profile']
    safe_bodies.append({'goalId': goal_id, 'currentAuthorCandidateGoal': goal, 'profile': selected_profile,
                        'profileSource': 'actual authored whole profile' if goal_id in PIDS[:2] else 'unchanged current source body; P4 author successor still pending' if goal_id in PIDS[2:] else 'unchanged current source body',
                        'profileStatus': p_by_id[goal_id]['status'], 'profileAuthority': p_by_id[goal_id]['reviewAuthority'],
                        'evidenceLevel': p_by_id[goal_id]['evidenceLevel'], 'maximumClaimScope': p_by_id[goal_id]['maximumClaimScope']})
private_file(O / 'DRAFT.current14-scientific-bodies.no-old-review-metadata.json', encode({'role': 'Draft operative author candidate bodies only; not frozen independent review inputs', 'goalIds': goal_ids, 'rows': safe_bodies, 'pendingAuthoredProfileGoalIds': PIDS[2:], 'pendingIndependentVisualReviewGoalIds': image_ids}))

plan = {'schemaVersion': 1, 'role': 'Exact bounded remediation14 author assembly plan; technical preparation only',
        'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'status': 'PRIVATE_DRAFT_NOT_FROZEN',
        'sourceRoot': str(N), 'privateCapsule': str(C), 'privateReviewRootRelativePath': str(R),
        'goalIds': goal_ids, 'descriptionGoalIds': description_ids, 'profileGoalIds': PIDS, 'visualGoalIds': image_ids,
        'goalCounts': {'description': 4, 'profile': 6, 'visual': 4, 'distinct': 14, 'canonicalChanged': 8, 'canonicalWhollyUnchanged': 642},
        'exactDescriptionCandidateDeltas': description_deltas, 'exactImageCandidateResourceDeltas': image_changes,
        'actualP2ProfileSources': {PIDS[0]: guard(B / SOURCES['profile91cd'][0]), PIDS[1]: guard(B / SOURCES['profileCf270'][0])},
        'actualCf270WholeMaterial': guard(B / SOURCES['cf270Material'][0]),
        'pendingP4AuthorDirectory': str(B / 'chemie-mixed18-four-targeted-P-gaps-author-successor-v1'),
        'pendingDependencies': ['Exact sealed P4 author selector, profile pointers and whole operative materials.',
                                'Final independent V review bound to the exact selected four image bytes; no approval inferred.',
                                'Mechanical stock P goal/reviewInput/profile fingerprints for all14 plus schema/semantic checks.',
                                'Separate actual A/M decisions for the four changed descriptions; no fabricated rebinding approval.'],
        'plannedNecessaryTechnicalBindings': ['Four SEM sourceFingerprint values only; all650 semanticKind decisions remain exact.',
                                             'Four private QA asset/resource bindings with every approval marker unset or no; no V review or human approval authored.',
                                             'Fourteen needs_human_review/ai_candidate P envelopes bound to exact current candidate goal/resources; only six explicit author profile bodies may change.',
                                             'Changed P envelope metadata states author assembly only; prior reviewer metadata is archived, never attributed to new content.',
                                             'Safe reviewer views expose complete operative bodies/materials but exclude reason, reviewer, historical D judgments and author recommendations.'],
        'draftBaseConfigRelativePath': base_relative, 'draftBatchConfigRelativePath': batch_relative,
        'ledgerExact': {'source': guard(N / LEDGER), 'privateCopy': pin(C / LEDGER), 'activeReferences': 20, 'newBatchRegistered': False},
        'canonicalChanges': canonical_changed, 'stockPrepareInvocations': 0, 'bookBuildInvocations': 0,
        'pdfGenerated': False, 'nativeInputsFrozen': False, 'reviewDecisionsAuthored': False, 'humanApproval': False,
        'sourcePinsBeforeAndAfter': list(guards.values()), 'localizedPrivatePaths': localized, 'privateWrites': writes}
for path, expected in guards.items():
    assert pin(path) == expected, ('Source changed', path)
assert (C / LEDGER).read_bytes() == ledger_raw
for relative in ledger['activeBatchConfigPaths']:
    assert (C / relative).read_bytes() == (N / relative).read_bytes()
private_file(O / 'PLAN.author14.exact-prospective-change-map.json', encode(plan))
print(json.dumps({'privateCapsule': str(C), 'plan': pin(O / 'PLAN.author14.exact-prospective-change-map.json'),
                  'sourceGuardCount': len(guards), 'goalIds': goal_ids, 'ledgerExact': pin(C / LEDGER),
                  'draftBatchConfigRelativePath': batch_relative, 'status': plan['status']}, ensure_ascii=False))
