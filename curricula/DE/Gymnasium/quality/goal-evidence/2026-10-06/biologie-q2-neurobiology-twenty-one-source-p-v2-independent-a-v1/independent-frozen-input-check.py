# SPDX-License-Identifier: Apache-2.0
"""Read only frozen author inputs; emit independently calculated review diagnostics."""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = OUT.parent / 'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
write = lambda n, x: (OUT / n).write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
final_path = AUTHOR / 'author-neurobiology21-source-p-v2.with-exact-rp-raw-source.final.freeze.json'
final = read(final_path)
base = read(ROOT / final['baseFreeze']['path'])
assert sha(final_path) == '1bb3bf75afe6682b0388bb0cb200afb0de1d5f52b82e82e66e41922cd419d391'
assert sha(ROOT / final['baseFreeze']['path']) == final['baseFreeze']['sha256']
verified = []
for category, entries in [('base', base['files']), ('additive', final['additiveFiles'])]:
    for entry in entries:
        file = ROOT / entry['path']
        actual = sha(file)
        assert actual == entry['sha256'], entry['path']
        assert file.stat().st_size == entry['bytes'], entry['path']
        verified.append({'category': category, 'path': entry['path'], 'sha256': actual})
assert len(base['files']) == 311 and len(final['additiveFiles']) == 16
scope = read(AUTHOR / 'independent-review.actual.thirteen-and-eight-scope.json')
ids = {r['goalId'] for r in scope['nativeSourceBackedThirteen'] + scope['stillOpenEight']}
before = read(AUTHOR / 'canonical.current464.baseline.snapshot.json')['goals']
after = read(AUTHOR / 'canonical.current464.author-v2.candidate.json')['goals']
assert [g['id'] for g in before] == [g['id'] for g in after]
assert len(after) == 464
assert all(a == b for a, b in zip(before, after) if a['id'] not in ids)
assert all(a.get('requires') == b.get('requires') and a.get('contains') == b.get('contains') for a, b in zip(before, after))
science_changes = []
for a, b in zip(before, after):
    fields = [k for k in ['title', 'titleEn', 'description', 'descriptionEn'] if a.get(k) != b.get(k)]
    if fields:
        science_changes.append({'goalId': b['id'], 'fields': fields})
assert len(science_changes) == 5
profiles = read(AUTHOR / 'positive-evidence.author-v2.candidates.json')['goals']
with zipfile.ZipFile(AUTHOR / 'neurobiology21-author-v2.review-inputs-and-native-evidence.zip') as archive:
    # The authored predecessor only. Independent A/B ledgers are never opened here.
    old = json.loads(archive.read('sealed-predecessor-inputs/biologie-q2-neurobiology-twenty-one-current-author-candidate-v1/positive-evidence.candidates.json'))['goals']
    oldmap = {g['goalId']: g for g in old}
changed_profiles = [g['goalId'] for g in profiles if g['profile'] != oldmap[g['goalId']]['profile']]
assert {x[:8] for x in changed_profiles} == {'a46cafde', '8b23f8fb', 'c05e217f'}
assert sum(len(g['profile']['applicationCaseBriefs']) for g in profiles) == 42

oldatlas = read(AUTHOR / 'native-baseline/source-atlas.actual.book-model.json')
newatlas = read(AUTHOR / 'additive-rp-exact-raw-source-final-v2/sourceAtlas.after-exact-rp-raw-source.actual.book-model.json')
oldfull = read(AUTHOR / 'native-baseline/full383.actual.book-model.json')
newfull = read(AUTHOR / 'additive-rp-exact-raw-source-final-v2/fullCatalogue.after-exact-rp-raw-source.actual.book-model.json')
assert len(oldatlas['pages']) == 383 and len(newatlas['pages']) == 375
assert len(oldfull['pages']) == len(newfull['pages']) == 383
oldpages = {g['goalId']: g for g in oldatlas['pages']}
newpages = {g['goalId']: g for g in newatlas['pages']}
actualbacked = set(newpages) & ids
assert actualbacked == {r['goalId'] for r in scope['nativeSourceBackedThirteen']}
protected = [r for r in read(AUTHOR / 'current21-and-protected67.actual.wholepage-source-scope-delta.json')['records'] if r['bucket'] == 'protected67_D_anchor_union']
assert len(protected) == 67
oldf = {g['goalId']: g for g in oldfull['pages']}
newf = {g['goalId']: g for g in newfull['pages']}
assert all(oldf[r['goalId']] == newf[r['goalId']] for r in protected)
protected_deltas = []
for r in protected:
    key = r['goalId']
    a, b = oldpages[key], newpages[key]
    fields = sorted(k for k in set(a) | set(b) if a.get(k) != b.get(k))
    assert fields == r['source-atlas']['changedFields'], key
    if fields:
        impact = 'source_applicability_loss_requires_author_remedy' if 'applicability' in fields else 'presentation_order_or_in_scope_link_binding_only'
        protected_deltas.append({'goalId': key, 'title': b['title'], 'fields': fields, 'impact': impact, 'scienceTextChanged': False, 'sourceViewKeysLost': sorted(set(r['beforeSourceViewKeys']) - set(r['afterSourceViewKeys'])), 'bindingApproval': False})
assert len(protected_deltas) == 26
for r in protected:
    for field in ['requires', 'reverseRequires']:
        a = [{k: v for k, v in link.items() if k != 'pageNumber'} for link in oldpages[r['goalId']][field]]
        b = [{k: v for k, v in link.items() if k != 'pageNumber'} for link in newpages[r['goalId']][field]]
        assert a == b, (r['goalId'], field)
for page in newatlas['pages']:
    for field in ['requires', 'reverseRequires']:
        for link in page[field]:
            target = newpages[link['goalId']]
            assert (link['anchor'], link['pageNumber']) == (target['anchor'], target['pageNumber'])
holds = []
for file in (AUTHOR / 'source-candidates').glob('mapping-*.json'):
    for d in read(file)['decisions']:
        if d['decision'] == 'needs_canonical_goal' and set(d.get('canonicalGoalIds', [])) & ids:
            holds.append({'candidateFile': str(file.relative_to(ROOT)), 'sourceGoalId': d['sourceGoalId']})
assert len(holds) == 31
lost = []
for v in read(AUTHOR / 'native20.actual.before-after-target-idsets.json')['views']:
    outside = [key for key in v['removedGoalIds'] if key not in ids]
    assert outside == v['removedOutsideCurrent21Ids']
    lost.append({'key': v['key'], 'removedOutside21Ids': outside})
assert sum(len(v['removedOutside21Ids']) for v in lost) == 187

rp = read(AUTHOR / 'additive-rp-exact-raw-source-final-v2/RP.extraction.exact-raw-source.author-v2.candidate.json')
rpkey = final['finalEffectiveInputOverrides'][0]['selectedSourceGoalId']
rprow = next(r for r in rp['sourceGoals'] if r['id'] == rpkey)
assert rprow['sourceText'] == rprow['rawSourceText']
assert 'in verschiedenen Problemstellungen' in rprow['rawSourceText'] and 'Synapsengifte, Drogen' in rprow['rawSourceText']
assert (rprow['printedPage'], rprow['physicalPage']) == (36, 38)
he = read(AUTHOR / 'source-candidates/extraction-02.author-v2.candidate.json')
herow = next(r for r in he['sourceGoals'] if r['id'] == 'bfd043fc-7eb7-5ff5-90ab-e2d978d21aa0')
assert 'neurophysiologische' in herow['rawSourceText']
write('input-integrity.actual.receipt.json', {'schemaVersion': 1, 'finalCompoundFreezeSha256': sha(final_path), 'verifiedBaseFiles': 311, 'verifiedAdditiveFiles': 16, 'allFrozenBytesExact': True, 'verifiedFiles': verified, 'effectiveRPOverrideSha256': sha(AUTHOR / 'additive-rp-exact-raw-source-final-v2/RP.extraction.exact-raw-source.author-v2.candidate.json'), 'independentPriorConclusionsUsed': False, 'integrityIsScienceApproval': False})
write('independent-preservation-and-impact.actual.receipt.json', {'schemaVersion': 1, 'canonicalGoalIdsPreserved': 464, 'outside21WholeGoalsExact': 443, 'allRequiresContainsExact': True, 'scientificTextChanges': science_changes, 'innerProfilesChanged': changed_profiles, 'innerProfilesExact': 18, 'bilingualSyntheticCases': 42, 'observedLearnerDemonstrations': 0, 'originalSourceAtlasContract': {'expected': 383, 'actual': len(newatlas['pages']), 'status': 'FAIL'}, 'nativeSourceBackedGoalIds': sorted(actualbacked), 'openSelectedGoalIds': sorted(ids - actualbacked), 'actualWholeOriginalSourceHolds': holds, 'protected67FullWholepagesExact': True, 'protected67SourceAtlasBindingDeltas': protected_deltas, 'protectedRequiresReverseRequiresSemanticLinkTargetsExact': True, 'all375AtlasLinkDestinationsValid': True, 'outside21SourceViewTargetLossesCount': 187, 'outside21SourceViewTargetLosses': lost, 'integrationReady': False, 'm7Approval': False})
print(json.dumps({'baseFiles': 311, 'additiveFiles': 16, 'canonicalIds': 464, 'outside21Exact': 443, 'scienceChanges': 5, 'changedInnerProfiles': 3, 'syntheticCases': 42, 'sourceAtlas383Contract': 'FAIL375', 'selectedBacked': 13, 'selectedOpen': 8, 'protectedAtlasBindingDeltas': 26, 'outside21TargetLosses': 187}))
