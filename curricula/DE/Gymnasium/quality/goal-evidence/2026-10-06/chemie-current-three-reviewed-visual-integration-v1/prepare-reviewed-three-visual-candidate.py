"""Prepare inert files only; never import into active roots."""
import copy
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
OWN = BASE / 'chemie-current-three-reviewed-visual-integration-v1'
SCRATCH = OWN / 'prospective-three-asset-check-layout'
CAN = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
QA = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
V6 = BASE / 'chemie-current-aromatic-delocalization-final-native-author-v6'
NOW = datetime.now(timezone.utc).isoformat()
if (OWN / 'three-reviewed-visual-integration.final.freeze.json').exists():
    raise SystemExit('This historical prepared dossier is already sealed; use a new package for any change.')

def read(p):
    return json.loads(Path(p).read_text())

def write(p, d):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def binding(p):
    p = Path(p)
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}

def stable(d):
    return 'sha256:' + hashlib.sha256(json.dumps(d, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def copied(src, dest):
    src, dest = Path(src), Path(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    assert src.read_bytes() == dest.read_bytes()
    return {'original': binding(src), 'preservedCopy': binding(dest), 'byteExact': True}

freeze_paths = {
    'two_A': BASE / 'chemie-current-two-visual-independent-a-v2/independent-v-a.final.freeze.json',
    'two_B': BASE / 'chemie-current-two-visual-independent-b-v2/independent-two-visual-b.final.freeze.json',
    'one_A': BASE / 'chemie-current-coordinate-bond-visual-independent-a-v4/independent-coordinate-visual-a.final.freeze.json',
    'one_B': BASE / 'chemie-current-coordinate-visual-independent-b-v4/independent-coordinate-visual-b.final.freeze.json',
}
freeze_checks = []
for key, p in freeze_paths.items():
    f = read(p)
    groups = {name: f.get(name, []) for name in ['files', 'inputBindings', 'externalInputs', 'externalBindings']}
    checks = []
    for group, entries in groups.items():
        for e in entries:
            actual = binding(e['path'])
            assert actual['sha256'] == e['sha256'], (key, group, e['path'])
            assert actual['bytes'] == e['bytes']
            checks.append({'group': group, **actual, 'matchesHistoricalPinNow': True})
    freeze_checks.append({'key': key, 'freeze': binding(p), 'actualChecks': checks})

a2p = BASE / 'chemie-current-two-visual-independent-a-v2/two-actual-visual-science-review.independent-a.json'
a2 = {r['goalId']: r for r in read(a2p)['rows']}
b2p = BASE / 'chemie-current-two-visual-independent-b-v2/candidate-native-ai-review-field-patches.independent-b.json'
b2 = {r['goalId']: r for r in read(b2p)['records']}
a4p = BASE / 'chemie-current-coordinate-bond-visual-independent-a-v4/actual-coordinate-raster-science-and-widths.independent-a.review.json'
a4 = read(a4p)
b4p = BASE / 'chemie-current-coordinate-visual-independent-b-v4/candidate-native-ai-review-field-patch.independent-b.json'
b4 = read(b4p)['records'][0]

specs = [
    ('b8d3b453-d638-5518-aab0-d84ec2e8567c', 'chemie-current-atomic-description-positive-gap-author-v2/visual-candidates/b8', 'attempt-01', 'two'),
    ('973c12d9-d863-5292-8c68-9c80cdacf9e2', 'chemie-current-atomic-description-positive-gap-author-v2/visual-candidates/carbonyl', 'attempt-01', 'two'),
    ('363c5740-8a3c-50b8-8c3a-5548c80c36ea', 'chemie-current-coordinate-bond-visual-correction-author-v4/visual-candidate', 'attempt-02', 'one'),
]
ids = [s[0] for s in specs]
binding_ids = ['3d3231f9-039d-5ce5-9e8e-af219c7fee08', '9decc36b-a69a-5599-a9f0-fcebdf0203d8']
before = read(QA)
after = copy.deepcopy(before)
before_rows = {r['goalId']: r for r in before['records']}
rows = {r['goalId']: r for r in after['records']}
goals = {g['id']: g for g in read(V6 / 'prospective-current378.canonical.author-candidate.json')['goals']}
model = read(V6 / 'qa-artifacts/full-prospective378.book-model.json')
pages = {p['goalId']: p for p in model['pages']}
assert len(before_rows) == len(before['records']) == 379
active_inputs = [binding(p) for p in [QA, CAN, 'AGENTS.md', 'docs/concept/skill-graph/atomic-goal-visualizations.md']]
write(OWN / 'active-chemie-qa.before.snapshot.json', before)
write(OWN / 'selected-five-v6-current-goal-page-bindings.snapshot.json', {
    'schemaVersion': 1, 'purpose': 'Exact final prospective v6 native inputs, not active integration or a new scientific review',
    'canonicalInput': binding(V6 / 'prospective-current378.canonical.author-candidate.json'),
    'bookModelInput': binding(V6 / 'qa-artifacts/full-prospective378.book-model.json'),
    'rows': [{'goalId': i, 'wholeGoal': goals[i], 'page': pages[i]} for i in ids + binding_ids],
})

archive, import_plans, provenances = [], [], []
for goal_id, folder, attempt, pair in specs:
    folder = BASE / folder
    candidate = folder / f'{attempt}.png'
    prompt = folder / f'{attempt}.prompt.md'
    h = binding(candidate)['sha256']
    b = b2[goal_id] if pair == 'two' else b4
    a = a2[goal_id] if pair == 'two' else a4
    assert b['goalId'] == goal_id and b['aiApproved'] == 'yes' and b['assetSha256'] == h
    assert a['decision'] in ['KEEP', 'KEEP_CORRECTED_CANDIDATE']
    a_raster = next(e for e in a['actualViewedImages'] if e['path'] == str(candidate)) if pair == 'two' else a['actualRaster']
    assert a_raster['sha256'] == h
    roots = ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']
    old_paths = [Path(root) / 'chemie' / goal_id / f'{goal_id}.jpg' for root in roots]
    assert all(binding(p)['sha256'] == before_rows[goal_id]['assetSha256'] for p in old_paths)
    old_prompt = Path(roots[0]) / 'chemie' / goal_id / 'prompt.de.md'
    for p in old_paths + [old_prompt]:
        archive.append(copied(p, OWN / 'historical-before' / p))
        active_inputs.append(binding(p))
    if pair == 'two':
        author_prov = folder / 'attempt-01.actual-author-science-visual-provenance.json'
        generation = read(author_prov)['generator']
        prompts = [binding(prompt)]
        a_time, a_reviewer = None, a['reviewer']
    else:
        author_prov = folder.parent / 'actual-selected-raster-science-format-browser-provenance.author.json'
        generation = {'provider': read(author_prov)['generator'], 'attempts': read(author_prov)['attempts']}
        prompts = [binding(folder / 'attempt-01.prompt.md'), binding(prompt)]
        a_time, a_reviewer = a['reviewedAtUTC'], a['role']
    pair_records = [
        {'role': 'independent V-A', 'reviewer': a_reviewer, 'reviewedAt': a_time,
         'timestampLimit': 'A-v2 has no separately recorded timestamp; no date invented' if a_time is None else None,
         'decision': a['decision'], 'reviewFile': binding(a2p if pair == 'two' else a4p), 'freeze': binding(freeze_paths[pair + '_A'])},
        {'role': 'independent V-B', 'reviewer': b['aiReviewer'], 'reviewedAt': b['aiReviewedAt'],
         'decision': 'KEEP', 'reviewFile': binding(b2p if pair == 'two' else b4p), 'freeze': binding(freeze_paths[pair + '_B'])},
    ]
    record = rows[goal_id]
    record.update({
        'title': goals[goal_id]['title'], 'description': goals[goal_id]['description'],
        'imageUrl': f'/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.png',
        'publicAssetPath': f'app/public/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.png',
        'canonicalAssetPath': f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/{goal_id}.png',
        'assetSha256': h, 'aiApproved': 'yes', 'aiApprovedAssetSha256': h,
        'aiReviewedAt': b['aiReviewedAt'], 'aiReviewer': f'V-A: {a_reviewer}; V-B: {b["aiReviewer"]}',
        'aiNotes': f'Exact PNG independently inspected at native/360/680 by both V-A and V-B. A evidence: {pair_records[0]["reviewFile"]["path"]}; B evidence: {pair_records[1]["reviewFile"]["path"]}. aiReviewedAt is the actual recorded B review timestamp. Generation is not approval; human fields unchanged; active D/P/M integration and final gates remain separate.',
    })
    # Legacy triage is rebased to actual new AI evidence, never old July review history.
    record.update({'umlautsCorrectChatGpt': 'yes', 'contentApprovedChatGpt': 'yes',
                   'chatGptReviewedAt': record['aiReviewedAt'], 'chatGptReviewer': record['aiReviewer'],
                   'chatGptNotes': record['aiNotes']})
    assert record['landscapePath'] == str(CAN)
    link = next(l for l in goals[goal_id]['resourceLinks'] if l.get('type') == 'goal-visualization' and l.get('role') == 'primary')
    assert link['url'] == record['imageUrl'] == pages[goal_id]['visualization']['url']
    assert pages[goal_id]['visualization']['originalDigest'] == h
    copies = []
    for root in roots:
        destination = Path(root) / 'chemie' / goal_id / f'{goal_id}.png'
        assert not destination.exists()
        prepared = SCRATCH / destination
        copied(candidate, prepared)
        copies.append({'source': binding(candidate), 'preparedCopy': binding(prepared), 'futureDestination': str(destination), 'operation': 'copy exact PNG bytes after final approval', 'currentlyAbsent': True})
    new_prompt = SCRATCH / roots[0] / 'chemie' / goal_id / 'prompt.de.md'
    text = (f'# Lernzielvisualisierung: {goals[goal_id]["title"]}\n\n'
            f'- SkillPilot-ID: `{goal_id}`\n- Beschreibung: {goals[goal_id]["description"]}\n'
            f'- Bild: `{goal_id}.png`\n- Public Asset: `{record["imageUrl"]}`\n'
            '- Provider: ChatGPT/Codex built-in image_gen; underlying model/version not reported.\n'
            '- Format: actual PNG, friendly abstract comic, near-native16:9; dimensions are in the author receipt.\n'
            '- Own didactic asset license: CC-BY-4.0. Provenance and quality approval remain separate.\n'
            f'- Exact author provenance: `{author_prov}`\n'
            f'- Old JPGs and old prompt preserved byteexact in `{OWN}/historical-before/`.\n'
            '- These are actual referenced-image edits; generation is not approval. No human approval/trial is asserted.\n\n')
    for e in prompts:
        text += f'## Exact generation prompt: {Path(e["path"]).name}\n\nSource: `{e["path"]}`; `{e["sha256"]}`.\n\n```text\n' + Path(e['path']).read_text().rstrip('\n') + '\n```\n\n'
    text += '## Two independent actual visual reviews\n\n' + '\n'.join(f'- {p["role"]}: `{p["reviewFile"]["path"]}`; {p["decision"]}; reviewedAt={p["reviewedAt"] or "not separately recorded"}.' for p in pair_records) + '\n'
    new_prompt.write_text(text)
    import_plans.append({'goalId': goal_id, 'copies': copies, 'sourcePrompt': {'prepared': binding(new_prompt), 'futureDestination': str(old_prompt), 'beforePreserved': True},
                         'futureRemoveOnlyAfterVerifiedArchiveAndNewCopies': [str(p) for p in old_paths], 'activeOriginalsUntouchedNow': True})
    provenances.append({'goalId': goal_id, 'candidate': binding(candidate), 'authorProvenance': binding(author_prov), 'actualGeneration': generation,
                        'actualGenerationPrompts': prompts, 'independentReviews': pair_records,
                        'scopeLimit': 'Current image/goal/page binding only. No new independent visual scientific round, no full source coverage, practical learner evidence or human release.',
                        'goalFingerprint': pages[goal_id]['goalFingerprint'], 'pageFingerprint': pages[goal_id]['pageFingerprint'], 'humanFields': {k: v for k, v in before_rows[goal_id].items() if k.startswith('human')}})

d_a = BASE / 'chemie-current-four-and-coordinate-native-d-blind-independent-a-v5/four/round-a/results/chemie-current-four-excluding-coordinate-blind-20261006-author-v5-first-pass-a.batch-001.records.jsonl'
d_b = BASE / 'chemie-current-coordinate-final-native-d-independent-b-v5/native-d-four/results/chemie-current-four-excluding-coordinate-blind-20261006-author-v5-first-pass-b.batch-001.records.jsonl'
binding_only = []
for i in binding_ids:
    rows[i]['description'] = goals[i]['description']
    witnesses = []
    for role, path in [('A', d_a), ('B', d_b)]:
        r = next(json.loads(line) for line in path.read_text().splitlines() if json.loads(line)['goalId'] == i)
        assert r['decision'] == 'keep' and r['currentDescriptionDe'] == goals[i]['description']
        assert r['goalFingerprint'] == pages[i]['goalFingerprint']
        witnesses.append({'role': role, 'file': binding(path), 'recordId': r['recordId'], 'decision': r['decision'], 'goalFingerprint': r['goalFingerprint'], 'reviewedSubsetPageFingerprint': r['pageFingerprint']})
    assert rows[i]['assetSha256'] == pages[i]['visualization']['originalDigest']
    assert {k: v for k, v in rows[i].items() if k != 'description'} == {k: v for k, v in before_rows[i].items() if k != 'description'}
    binding_only.append({'goalId': i, 'onlyChangedField': 'description', 'before': before_rows[i]['description'], 'after': rows[i]['description'],
                         'actualExistingImageAndAllHistoricalAIFieldsUnchanged': True, 'nativeVDescriptionBindingReason': 'Current native gate matches QA.description to the current goal.description',
                         'unchangedImageHash': rows[i]['assetSha256'], 'actualNativeIndependentPageReviewsReused': witnesses, 'newVisualScienceApprovalIssued': False})

other = [i for i in before_rows if i not in ids + binding_ids]
assert len(other) == 374 and all(rows[i] == before_rows[i] for i in other)
assert all({k: v for k, v in rows[i].items() if k.startswith('human')} == {k: v for k, v in before_rows[i].items() if k.startswith('human')} for i in rows)
assert all(rows[i]['landscapePath'] == before_rows[i]['landscapePath'] for i in rows)
assert {k: v for k, v in after.items() if k != 'records'} == {k: v for k, v in before.items() if k != 'records'}
write(OWN / 'prospective-current-active-path.chemie.qa.json', after)
write(OWN / 'two-existing-image-description-binding-only.receipt.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'rows': binding_only, 'newScientificClosures': 0, 'activeWrites': False})
write(OWN / 'four-sealed-independent-visual-reviews.actual-binding-verification.json', {'schemaVersion': 1, 'verifiedAtUTC': NOW, 'checks': freeze_checks, 'noHistoricalPinsChanged': True, 'newVisualScientificReview': False})
write(OWN / 'three-image-generation-and-dual-review-provenance.receipt.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'rows': provenances, 'historicalJulyReviewNotTransferred': True, 'humanApproval': False, 'humanTrial': False})
write(OWN / 'historical-before-byteexact-archive.manifest.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'entries': archive, 'jpgCopies': 9, 'oldSourcePrompts': 3, 'activeOriginalsUntouched': True})
write(OWN / 'three-assets-and-prompts.future-import-plan.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'operation': 'Inert preparation for root final integration only', 'plans': import_plans,
      'order': ['Verify immutable science/QA inputs and preserved archive', 'Integrate reviewed final v6 goal texts/resources and matching affected D/P/A/M records', 'Copy exact prepared three PNGs to all9 destinations and actual-generation prompts to three source destinations', 'Verify9 hashes before remove9 old JPG paths; keep this immutable history', 'Write prospective QA with3newactualAI blocks and2description-onlybindings', 'Run affected native asset/QA freshness/V checks, central strict report and required final bundled gates'],
      'notClaimed': ['active integration', 'new strict closure', 'human release', 'new independent V science'], 'activeWrites': False})
write(OWN / 'active-preservation-and-374-whole-row-guard.receipt.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'activeInputs': active_inputs,
      'allActiveInputHashesStillExact': all(binding(x['path']) == x for x in active_inputs), 'qaRecordCount': 379,
      'wholeUnchangedRowCount': 374, 'wholeUnchangedRowIds': other, 'wholeUnchangedRowsStableHashBefore': stable([before_rows[i] for i in other]),
      'wholeUnchangedRowsStableHashAfter': stable([rows[i] for i in other]), 'descriptionOnlyRowCount': 2, 'newRasterRowCount': 3,
      'all379HumanFieldsExactlyUnchanged': True, 'all379LandscapePathsExactlyUnchanged': True, 'qaTopLevelMetadataExactlyUnchanged': True,
      'historicalJulyImageApprovalsMovedToHistoryNotAppliedToNewPNGs': True, 'newScientificClosures': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0, 'activeWrites': False})

# Run the unchanged asset checker in a deliberately bounded three-goal scratch fixture.
# This checks only actual new asset paths/copy identity/prompt existence, not graph/source semantics.
fixture = {k: v for k, v in read(CAN).items() if k != 'goals'}
fixture['title'] = 'Bounded three already reviewed visual assets: technical scratch fixture'
fixture['goals'] = [goals[i] for i in ids]
write(SCRATCH / CAN, fixture)
copied('scripts/check_goal_visualization_assets.mjs', SCRATCH / 'scripts/check_goal_visualization_assets.mjs')
write(SCRATCH / 'scripts/config/historical-goal-visualization-assets.json', {'schemaVersion': 1, 'assets': []})
print('Prepared inert QA379:374whole exact,2description-only,3actual PNG; archive9JPG+3oldprompts; no active import')
