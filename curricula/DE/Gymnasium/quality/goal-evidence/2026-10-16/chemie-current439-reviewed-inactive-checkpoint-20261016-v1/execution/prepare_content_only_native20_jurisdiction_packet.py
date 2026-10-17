# SPDX-License-Identifier: Apache-2.0
"""Content parity and reviewer-input routing only, never scientific approvals."""
from pathlib import Path
import hashlib
import json

R = Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
F = T / 'native20-jurisdiction-frozen-current641-review-capsule-v1'
N = F / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-stable-jurisdiction-only-first20-private-L6-technical-20261016-v1/native-twenty'
O = T / 'native20-jurisdiction-content-only-own-first-inputs-v2-complete'
assert not O.exists()
O.mkdir()
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
pin = lambda p: {'path': str(p.relative_to(R)), 'sha256': sha(p), 'bytes': p.stat().st_size}
raw = read(N / 'round-a/description-review-input.json')
ids = {g['goalId'] for g in raw['goals']}
owners = {r['goalId']: r for r in map(json.loads, (T / 'baseline-D437-selected-owner-binding-index-technical-a-v1/INDEX.actual-selected-D437-owner-and-bindings.jsonl').read_text().splitlines())}
apv = read(T / 'applicability641-jurisdiction-sync-technical-a-v1/STOCK.raw-full-Chemistry641-applicability-report.json')
ab = {g['goalId']: g for g in apv['goals']}
old_p_path = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-paired-two-priors-and-BB-BE-LK-private-L6-technical-20261016-v1/P439.exact437-retained-whole-lines-two-own-current-contexts.for-native-model.jsonl'
old_p = {r['goalId']: r for r in map(json.loads, old_p_path.read_text().splitlines())}
qa_path = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'


def collect_qa(j):
    found = {}
    def visit(x):
        if isinstance(x, dict):
            if x.get('goalId') in ids:
                found[x['goalId']] = x
            for k, v in x.items():
                if k in ids:
                    found[k] = v
                visit(v)
        elif isinstance(x, list):
            for v in x:
                visit(v)
    visit(j)
    return found


old_v = collect_qa(read(T / 'chemie-combined639-two-GK-priors-final-review-capsule-v1' / qa_path))
current_v = collect_qa(read(F / qa_path))
assert set(old_v) == ids == set(current_v)


def strip(x):
    if isinstance(x, dict):
        return {k: strip(v) for k, v in x.items() if not any(w in k.lower() for w in ['review', 'author', 'proposal', 'pipeline', 'status', 'approved'])}
    if isinstance(x, list):
        return [strip(v) for v in x]
    return x


cache = {}
rows = []
checks = []
for g in raw['goals']:
    goal_id = g['goalId']
    owner = owners[goal_id]
    old_input_path = F / owner['rounds'][0]['reviewInputPath']
    if old_input_path not in cache:
        cache[old_input_path] = read(old_input_path)
    old = next(x for x in cache[old_input_path]['goals'] if x['goalId'] == goal_id)
    oc, cc = old['canonicalContext'], g['canonicalContext']
    assert {k: v for k, v in oc.items() if k != 'applicability'} == {k: v for k, v in cc.items() if k != 'applicability'}, ('context', goal_id)
    assert owner['goalFingerprint'] == g['goalFingerprint'], ('goalFP', goal_id)
    assert all(old[k] == g[k] for k in ['currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']), ('texts', goal_id)
    profile = g['reviewContext']['evidenceProfile']['profile']
    assert old_p[goal_id]['profile'] == profile, ('profile', goal_id)
    assert old_v[goal_id] == current_v[goal_id], ('oldVrow', goal_id)
    page = g['reviewContext']['page']
    assert ab[goal_id]['compiledApplicability']['jurisdiction'] == cc['applicability']['jurisdiction'], ('APV', goal_id)
    image = F / 'app/public' / page['visualization']['url'].lstrip('/')
    assert sha(image) == page['visualization']['originalDigest'], ('image', goal_id)
    capture = T / 'native20-jurisdiction-actual-PDF-pages' / f"page-{page['pageNumber'] + 2:02d}.png"
    assert capture.is_file(), ('nativePage', goal_id)
    row = {k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn', 'canonicalContext']}
    row.update({
        'oldCanonicalContext': oc,
        'actualCurrentBoundPage': strip(page),
        'wholeUnderstandingProfileBody': profile,
        'profileFingerprint': g['reviewContext']['evidenceProfile']['profileFingerprint'],
        'actualPrimaryImage': pin(image),
        'actualNativePageCapture': pin(capture),
        'compiledJurisdictionVisibilityEvidence': strip(ab[goal_id]),
        'scopeMeaning': 'Compiled jurisdiction availability includes mapping/containment/requires closure, not official compulsory whole-goal duties or full source coverage. Stage, course, titles, descriptions, profile and image are unchanged.',
    })
    out = O / f"CONTENT.{page['pageNumber']:02d}.{goal_id}.json"
    out.write_text(json.dumps(row, ensure_ascii=False, indent=2) + '\n')
    read(out)
    rows.append(pin(out))
    checks.append({'goalId': goal_id, 'contextDiff': ['applicability'], 'bothLanguageTextsExact': True, 'semanticGoalFingerprintExact': True, 'wholePProfileExactAgainstRetainedOldP439': True, 'wholeVQARowExactAgainst437Baseline': True, 'actualCurrentImageDigestVerified': True, 'historicalDHasEmbeddedReviewContext': isinstance(old.get('reviewContext'), dict)})
manifest = {
    'role': 'Content-only current native twenty page/context repair inputs; no peer or author decisions',
    'contents': rows, 'actualPDF': pin(N / 'bundle/book.pdf'),
    'frozenReviewCapsuleRoot': str(F.relative_to(R)), 'technicalContentParity': checks,
    'unsealedDraftCorrection': 'Historical D inputs may legitimately have null reviewContext; profile continuity is checked against retained original P439 rows, V against437-baseline QA rows. Three initial unsealed draft contents remain history and are not selected.',
    'priorOutcomeFieldsIncluded': False,
    'firstStage': 'Own current page/context FIRST before original stock campaign metadata or peer result outcomes',
    'finalCurrentContextMatchRequiredBeforeCounting': True, 'batchPreparedNotCompleted': True,
    'fullCurrent439CentralReportRun': False, 'M7': False, 'HumanApproval': False,
}
p = O / 'INPUTS.content-only-twenty-current-native-pages-and-applicability-contexts.json'
p.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'manifest': pin(p), 'contentGoals': len(rows), 'textProfileAndVRowsUnchanged': True}))
