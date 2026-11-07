#!/usr/bin/env python3
"""Bounded private input capture; no current source, QA, authority or Git writes."""
import collections, datetime, hashlib, json, runpy, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
K = runpy.run_path(str(ROOT / 'scripts/visualization_review_git_capsule.py'))
ACCEPTED = '25a6f2164a81a7e6ae50db3557d20521fecf5124'
COMMIT = '42095f427223545968e452d494e4f982c196c7e2'
FAMILY = 'wirtschaft-q2-monetary-social-seventeen-image-author-20261008-v1'
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'
EFFECTIVE_QA = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-first-M7-D9-and14-qualified-integration-root-v1/qa346.current-reviewed14-preserved332.ROOT-QUALIFIED.json'
DISCOVERY = 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-six-embedded-economics-families/family-census.json'
BASE = 'curricula/DE/Gymnasium/quality/goal-visualization-review/' + FAMILY + '/'
INPUTS = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-monetary-social-seventeen-bilingual-positive-author-v1/'
now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
sha = lambda raw: hashlib.sha256(raw).hexdigest()
def dump(name, value):
    raw = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    (OUT / name).parent.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_bytes(raw)
    return {'path': str((OUT / name).relative_to(ROOT)), 'sha256': sha(raw)}
def relative(path):
    return K['relative'](path.removeprefix(str(ROOT) + '/'))

objects, graphs, refs = {}, {}, {}
def get_object(oid, kind):
    key = (oid, kind)
    if kind != 'blob' and key in graphs:
        return graphs[key]
    raw = K['git'](ROOT, 'cat-file', kind, oid)
    assert K['oid'](kind, raw) == oid, 'Raw Git framing/OID differs'
    objects[oid] = {'oid': oid, 'type': kind, 'bytes': len(raw), 'sha256': sha(raw)}
    if kind != 'blob': graphs[key] = raw
    return raw

# A complete actual parent route; neither rev-parse HEAD nor merge-base is authority.
route, seen = None, set()
pending = [(ACCEPTED, [])]
while pending:
    current, prefix = pending.pop()
    if current in seen: continue
    seen.add(current)
    raw = get_object(current, 'commit')
    parents = [line[7:].decode() for line in raw.split(b'\n\n', 1)[0].splitlines() if line.startswith(b'parent ')]
    node = {'oid': current, 'parents': parents, 'sha256': sha(raw)}
    if current == COMMIT:
        route = prefix + [node]
        break
    pending.extend((parent, prefix + [node]) for parent in reversed(parents))
assert route and route[0]['oid'] == ACCEPTED and route[-1]['oid'] == COMMIT

def original(path, digest=None, current=True):
    path = relative(path)
    raw = K['git'](ROOT, 'show', COMMIT + ':' + path)
    digest = digest.removeprefix('sha256:') if digest else sha(raw)
    ref = {'path': path, 'gitCommit': COMMIT, 'sha256': digest}
    oid = K['inclusion'](ref, get_object)  # unchanged raw OID/tree/path kernel
    assert sha(raw) == digest
    if current: assert sha((ROOT / path).read_bytes()) == digest, path
    previous = refs.get(path)
    assert not previous or previous['sha256'] == digest
    refs[path] = dict(ref, oid=oid, currentCopyRequired=current or bool(previous and previous['currentCopyRequired']))
    return ref, json.loads(raw) if path.endswith('.json') else raw

protected = [SOURCE, QA, EFFECTIVE_QA, 'app/scripts/goalVisualizationReviewedContext.ts',
    'app/scripts/lib/goalVisualizationEconomicsQ3Contexts.ts', 'app/scripts/lib/authenticatedGitEvidence.ts',
    'app/scripts/lib/qualifiedVisualizationContextAuthority.ts', 'scripts/visualization_review_git_capsule.py',
    'contracts/goal-visualization-context/v1/qualification.schema.json',
    'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json']
before = {path: sha((ROOT / path).read_bytes()) for path in protected}
source = json.loads((ROOT / SOURCE).read_bytes())
goals = {g['id']: g for g in source['goals']}
qa = {r['goalId']: r for r in json.loads((ROOT / QA).read_bytes())['records']}
effective = {r['goalId']: r for r in json.loads((ROOT / EFFECTIVE_QA).read_bytes())['records']}
old_index = json.loads((ROOT / protected[-1]).read_bytes())
existing = {row['goalId'] for row in old_index['rows']}
selected = [row for row in json.loads((ROOT / DISCOVERY).read_bytes())['rows'] if row['family'] == FAMILY]
assert len(selected) == 17 and len({row['goalId'] for row in selected}) == 17
owner_ref, old_source = original(SOURCE, current=False)
assert old_source['landscapeId'] == source['landscapeId']
old_ids = {g['id'] for g in old_source['goals']}
rows, candidates = [], []
for selected_row in selected:
    goal_id = selected_row['goalId']; assert goal_id in old_ids and goal_id not in existing
    review_ref, r = original(selected_row['originalReview']['path'], selected_row['originalReview']['sha256'])
    assert r['goalId'] == goal_id and r['decision'] == 'KEEP'
    corrected = r.get('correctedCandidateVersion') == 'correction-v2'
    suffix = 'correction-v2/' if corrected else ''
    assert review_ref['path'] == BASE + 'independent-review/' + goal_id + '/' + suffix + 'independent-image-review.receipt.json'
    asset_ref, asset = original(r['assetPath'], r['assetSha256'])
    assert asset_ref['path'] == BASE + goal_id + '/' + suffix + goal_id + '.png'
    deps = [review_ref, owner_ref, asset_ref]
    for derivative in r['derivatives']:
        dref, _ = original(derivative['path'], derivative['sha256']); deps.append(dref)
    gen_ref, gen = original(r['generationRecordPath'], r['generationRecordSha256']); deps.append(gen_ref)
    assert gen['goalId'] == goal_id and gen['candidatePath'] == asset_ref['path'] and gen['sha256'] == asset_ref['sha256']
    ctx = {'landscapeId': source['landscapeId'], 'goalId': goal_id, 'subject': 'wirtschaftswissenschaften',
        'title': r['goalTitle'], 'description': r['goalDescription'], 'assetSha256': 'sha256:' + asset_ref['sha256']}
    if not corrected:
        whole_ref, whole = original(r['authorCandidateBilingualGoalPath'], r['authorCandidateBilingualGoalSha256']); deps.append(whole_ref)
        matches = [g for g in whole if g['id'] == goal_id]; assert len(matches) == 1
        assert matches[0]['title'] == ctx['title'] and matches[0]['description'] == ctx['description']
        assert matches[0]['titleEn'] == r['authorCandidateEnglishTitle'] and matches[0]['descriptionEn'] == r['authorCandidateEnglishDescription']
        ctx.update(titleEn=r['authorCandidateEnglishTitle'], descriptionEn=r['authorCandidateEnglishDescription'],
            demandLevel=matches[0]['dimensionTags']['demandLevel'])
        prep_ref, prep = original(r['nativeBeforeGenerationReceiptPath'], r['nativeBeforeGenerationReceiptSha256']); deps.append(prep_ref)
        commands = [command for command in prep['actualCommands'] if command['goalId'] == goal_id]; assert len(commands) == 1
        copies = commands[0]['actualMetadataAndPromptCopies']
    else:
        prior_ref, prior = original(r['preservedOriginalIndependentReceiptPath'], r['preservedOriginalReceiptSha256']); deps.append(prior_ref)
        assert prior['decision'] == 'REJECT' and prior['blockingFindings'] and prior['goalTitle'] == ctx['title'] and prior['goalDescription'] == ctx['description']
        prior_asset_ref, _ = original(prior['assetPath'], prior['assetSha256']); deps.append(prior_asset_ref)
        prompt_ref, _ = original(r['actualPromptPath'], r['actualPromptSha256']); deps.append(prompt_ref)
        prep_ref, prep = original(gen['nativePreparationReceipt']); deps.append(prep_ref)
        assert prep['goalId'] == goal_id and prep['exitCode'] == 0
        copies = prep['nativeCopiedFiles']
        assert 'English authored successor and D/P gates not attested' in r['goalTextStatus']
    for entry in copies:
        ref, value = original(entry['path'], entry['sha256']); deps.append(ref)
        if entry['path'].endswith('/metadata.json'):
            assert value['skillpilotId'] == goal_id and value['title'] == ctx['title'] and value['description'] == ctx['description']
    goal = goals[goal_id]
    links = [link for link in goal.get('resourceLinks', []) if link.get('type') == 'goal-visualization' and link.get('role', 'primary') == 'primary']
    assert len(links) == 1
    image_url = links[0]['url']; public = 'app/public' + image_url
    canonical = 'curricula/DE/Gymnasium/visualizations/' + image_url.removeprefix('/assets/goal-visualizations/')
    for path in [public, canonical]:
        digest = sha((ROOT / path).read_bytes()); before[path] = digest; assert digest == asset_ref['sha256']
    for row in [qa[goal_id], effective[goal_id]]:
        assert row['landscapeId'] == source['landscapeId'] and row['imageUrl'] == image_url
        assert row['publicAssetPath'] == public and row['canonicalAssetPath'] == canonical
        assert row['aiApproved'] == 'yes' and row['aiApprovedAssetSha256'] == row['assetSha256'] == ctx['assetSha256']
        assert row['humanApproved'] == 'no'
    mismatch = [key for key in ['title', 'description', 'titleEn', 'descriptionEn'] if key in ctx and ctx[key] != goal.get(key)]
    if 'demandLevel' in ctx and ctx['demandLevel'] != goal.get('dimensionTags', {}).get('demandLevel'): mismatch.append('demandLevel')
    assert not mismatch
    receipt = {'schemaVersion': 1, 'kind': 'visualization-reviewed-context-qualification',
        'normalization': 'skillpilot-visualization-display-whitespace-v1',
        'reviewProfile': 'economics-q2-monetary-social-embedded-v1', 'context': ctx,
        'originalReview': review_ref, 'originalInput': review_ref, 'ownerSource': owner_ref, 'reviewedAsset': asset_ref,
        'originalDecision': r['decision'], 'reviewedAt': r['reviewedAt'], 'reviewer': r['independentReviewer'],
        'originalReason': r['actualInspection']['fachlichePruefung'], 'qualification': {'qualifiedAt': now,
            'qualifier': 'private-closed-format-proposal-awaiting-independent-review',
            'reason': 'Technical original-context candidate only. No fresh image review, active acceptance or human approval.'}}
    receipt_ref = dump('private-receipts/' + goal_id + '.json', receipt)
    candidates.append(dict(receipt_ref, goalId=goal_id))
    rows.append({'goalId': goal_id, 'originalReview': review_ref, 'originalInput': review_ref,
        'reviewedAsset': asset_ref, 'context': ctx, 'originalDependencies': deps,
        'current': dict(ctx, **{key: goal.get(key) for key in ['title', 'description', 'titleEn', 'descriptionEn']},
            demandLevel=goal.get('dimensionTags', {}).get('demandLevel'),
            imageUrl=image_url, publicAssetPath=public, canonicalAssetPath=canonical),
        'originalReviewedAt': r['reviewedAt'], 'originalReviewer': r['independentReviewer'],
        'corrected': corrected, 'reviewScope': 'DE-only explicitly attested' if corrected else 'DE plus actual supplied bilingual author input',
        'currentQaMachineApproval': True, 'humanApproval': False, 'duplicatesQualified57': False})

pins = {'kind': 'private-closed-q2-family-original-pins-awaiting-review', 'acceptedRepositoryCommit': ACCEPTED,
    'originalCommit': COMMIT, 'family': FAMILY, 'goalIds': [row['goalId'] for row in rows],
    'originalReferences': [refs[key] for key in sorted(refs)], 'ownerSource': owner_ref}
pins_ref = dump('private-family-pins.json', pins)
dump('raw-git-proof.json', {'kind': 'unchanged-kernel-raw-git-parent-tree-path-proof',
    'kernel': {'path': 'scripts/visualization_review_git_capsule.py', 'sha256': before['scripts/visualization_review_git_capsule.py']},
    'acceptedRepositoryCommit': ACCEPTED, 'parentRoute': route, 'originalCommit': COMMIT,
    'objects': sorted(objects.values(), key=lambda row: row['oid']),
    'originalReferences': pins['originalReferences'], 'newReviewClaimed': False})
dump('candidate-index.json', {'schemaVersion': 1, 'kind': 'private-additional-existing-context-family-candidate',
    'acceptedRepositoryCommit': ACCEPTED, 'activeInputPins': [{'path': p, 'sha256': h} for p, h in before.items()],
    'privateFamilyPins': pins_ref, 'candidateReceipts': candidates, 'rows': rows,
    'existingQualified57NewDuplicates': 0, 'existingProfileNewPasses': 0,
    'activeNewQualified': 0, 'newAiReviews': 0, 'newHumanApprovals': 0, 'runtimeActivationAllowed': False})
assert all(sha((ROOT / path).read_bytes()) == digest for path, digest in before.items())
print(json.dumps({'family': FAMILY, 'candidates': len(rows), 'originalReferences': len(refs),
    'rawGitObjects': len(objects), 'rawCommitRoute': len(route), 'pinsSha256': pins_ref['sha256'],
    'bytesWritten': sum(path.stat().st_size for path in OUT.rglob('*') if path.is_file()), 'activeWrites': False}))
