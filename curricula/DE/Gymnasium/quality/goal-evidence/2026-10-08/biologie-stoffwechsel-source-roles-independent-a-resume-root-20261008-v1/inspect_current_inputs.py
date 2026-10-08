"""Freeze and inspect the unchanged and affected inputs for source review A.

This records binding facts; scientific/source verdicts are written separately.
"""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = OUT.parent / 'biologie-stoffwechsel-resume-author-20261008-v1'


def read(path):
    return json.loads(path.read_text())


def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha256(data).hexdigest(), 'bytes': len(data)}


def save(name, value):
    path = OUT / name
    if path.exists():
        raise RuntimeError(f'Existing review artifact must stay unchanged: {path}')
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


entry = read(AUTHOR / 'neutral-author-continuation.entry.json')
freeze = read(AUTHOR / 'author-first-input-output.freeze.json')
all_bindings = freeze['inputs'] + freeze['outputs']
for expected in all_bindings:
    assert binding(ROOT / expected['path']) == expected, expected['path']

scope = read(AUTHOR / 'source19.complete-operator-scope-candidates.author.json')
regional = read(AUTHOR / 'all45-regional-duties-all293-partners.exact-retained.author.json')
canon_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canon = {g['id']: g for g in read(canon_path)['goals']}
for g in scope['goals']:
    assert g['wholeCurrentGoal'] == canon[g['goalId']], g['goalId']
    for c in g['actualPrimaryComponents']:
        page = ROOT / c['wholeOriginalPagePath']
        assert sha256(page.read_bytes()).hexdigest() == c['wholeOriginalPageSha256'].removeprefix('sha256:')
        actual = '\n'.join(page.read_text().splitlines()[c['firstTextLine1Based'] - 1:c['lastTextLine1Based']])
        assert actual == c['originalText'], c['recordId']

source_path = ROOT / freeze['inputs'][2]['path']
mapping_path = ROOT / freeze['inputs'][1]['path']
source_before = read(source_path)
mapping_before = read(mapping_path)
source_after = read(AUTHOR / 'HE-source144.source19-operative.author-candidate.json')
mapping_after = read(AUTHOR / 'HE-mapping144.source19-operative.author-candidate.review.json')
selected_source_ids = {g['sourceGoalId'] for g in scope['goals']}
before_rows = {g['id']: g for g in source_before['sourceGoals']}
after_rows = {g['id']: g for g in source_after['sourceGoals']}
assert before_rows.keys() == after_rows.keys()
assert len(before_rows) == 144
retained_ids = set(before_rows) - selected_source_ids
assert len(retained_ids) == 125
assert all(before_rows[i] == after_rows[i] for i in retained_ids)
before_decisions = {g['sourceGoalId']: g for g in mapping_before['decisions']}
after_decisions = {g['sourceGoalId']: g for g in mapping_after['decisions']}
assert before_decisions.keys() == after_decisions.keys()
assert all(before_decisions[i] == after_decisions[i] for i in retained_ids)
assert len(mapping_before['mappings']) == len(mapping_after['mappings'])
changed_mapping_rows = []
for old, new in zip(mapping_before['mappings'], mapping_after['mappings']):
    assert {k: v for k, v in old.items() if k != 'matchType'} == {k: v for k, v in new.items() if k != 'matchType'}
    if old != new:
        assert old['legacyGoalId'] in selected_source_ids
        assert old['matchType'] == 'exact' and new['matchType'] == 'partial'
        changed_mapping_rows.append({'before': old, 'after': new})
assert len(changed_mapping_rows) == 19
for guard in regional['mappingExtractionGuards']:
    for expected in guard.values():
        assert binding(ROOT / expected['path']) == expected, expected['path']

partner_ids = {r['canonicalGoalId'] for duty in regional['sourceGoals'] for r in duty['allPartnerRows']}
assert all(i in canon for i in partner_ids)
partner_context = [{
    'sourceKey': duty['sourceKey'],
    'sourceDescription': duty['wholeRetainedExtractionGoal'].get('description'),
    'allPartnerRows': duty['allPartnerRows'],
    'wholeCurrentPartnerBodies': [canon[r['canonicalGoalId']] for r in duty['allPartnerRows']],
    'selected19DirectPartners': [r['canonicalGoalId'] for r in duty['allPartnerRows'] if r['canonicalGoalId'] in entry['goalIds']],
} for duty in regional['sourceGoals']]
save('all45-source-duties-and-actual293-current-partner-bodies.input.json', {
    'schemaVersion': 1, 'role': 'Input to independent A source scope review, not approval',
    'sourceDuties': partner_context, 'sourceApproval': False,
})
facts = {
    'schemaVersion': 1,
    'checkedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Actual binding facts before independent source verdict A',
    'authorFreezeEntriesVerified': len(all_bindings),
    'wholeCurrentGoalBodiesExact': len(scope['goals']),
    'completeHE144SourceIdsExact': len(before_rows),
    'unaffectedSourceRowsAndDecisionsExact': len(retained_ids),
    'allHEMappingPartnerIdentitiesExact': True,
    'selectedHEMappingRowsWithExactToPartialCorrection': changed_mapping_rows,
    'regionalMappingAndExtractionBindingsVerified': len(regional['mappingExtractionGuards']),
    'regionalSourceDuties': len(partner_context),
    'regionalCompletePartnerRows': sum(len(d['allPartnerRows']) for d in partner_context),
    'regionalUniqueCurrentPartnerGoals': len(partner_ids),
    'scientificOrSourceVerdictFromHashes': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
}
save('actual-input-binding-inspection.before-verdict.json', facts)
save('independent-a-first-input.freeze.json', {
    'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(),
    'reviewerId': 'codex-root-independent-source-review-a',
    'independenceGroupId': 'root-stoffwechsel-source-resume-a-20261008',
    'authorRole': False, 'blindToNewIndependentBResults': True,
    'inputs': all_bindings + [binding(AUTHOR / 'author-first-input-output.freeze.json'), binding(OUT / 'all45-source-duties-and-actual293-current-partner-bodies.input.json')],
    'sourceVerdict': 'PENDING_ACTUAL_ORIGINAL_OPERATOR_AND_SCOPE_REVIEW',
})
print(json.dumps(facts, ensure_ascii=False))
