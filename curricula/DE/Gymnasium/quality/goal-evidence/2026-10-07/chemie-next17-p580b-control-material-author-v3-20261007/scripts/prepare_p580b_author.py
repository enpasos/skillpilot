#!/usr/bin/env python3
"""Inert single-profile revision. Reuse sealed D17; write only this new dossier."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
ROOT = OUT.parents[6]
BASE = OUT.parent / 'chemie-next17-targeted-description-routing-context-author-v2-20261007'
B = OUT.parent / 'chemie-next17-targeted-independent-d-b-p-binding-20261007-v1'
ID = '580b3616-f121-5d82-ac6b-fc24f145fbdc'
REVIEW = OUT.name
NOW = datetime.now(timezone.utc).isoformat()
if (OUT / 'final-own-files-and-reused-inputs.freeze.json').exists():
    raise SystemExit('Sealed dossier; use a new version folder')

def read(path):
    return json.loads(path.read_text())

def write(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def pin(path):
    b = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def verify_base():
    manifest = read(BASE / 'final-own-files.freeze.json')
    for item in manifest['files']:
        path = BASE / item['path']
        b = path.read_bytes()
        assert hashlib.sha256(b).hexdigest() == item['sha256'] and len(b) == item['bytes'], path
    assert len(manifest['files']) == len([p for p in BASE.rglob('*') if p.is_file() and p.name != 'final-own-files.freeze.json'])
    return {'manifest': pin(BASE / 'final-own-files.freeze.json'), 'filesChecked': len(manifest['files']), 'mismatches': 0}

base_check = verify_base()
b_doc = read(B / 'independent-first-pass.judgments.json')
finding = next(f for f in b_doc['openFindings'] if f['goalId'] == ID)
assert finding['findingId'] == 'chem17-targeted-b-gas-air-control-reference-unsupported-damp-splint'
assert pin(B / 'final-own-files-and-reviewed-inputs.freeze.json')['sha256'] == '74f4b74bfa94ffdd66921f7d283f6346f413aaa07a9981532cb284520460bef7'
write('inputs/actual-independent-b-580b-finding.excerpt.json', {
    'documentType': 'Exact selected finding from sealed independent B; author input, not author independent judgment',
    'sourceDocument': pin(B / 'independent-first-pass.judgments.json'),
    'sourceFreeze': pin(B / 'final-own-files-and-reviewed-inputs.freeze.json'),
    'finding': finding,
})

old_profiles = read(BASE / 'candidate/positive-evidence17.author-candidate-set.json')
new_profiles = copy.deepcopy(old_profiles)
new_profiles.update({'reviewId': REVIEW, 'reviewedAt': NOW, 'reviewer': 'AUTHOR /root/chem17_current_independent_a; single P580b control-reference revision; no independent or human approval'})
old_cases = read(BASE / 'candidate/complete34-bilingual-material-cases.author.json')
new_cases = copy.deepcopy(old_cases)
new_cases['documentType'] = 'AUTHOR v3 complete34 bilingual material cases; only P580b case1 control-reference sentence is revised'
old_sentences = {
    'de': 'Die Kontrollen zeigen, dass weder ein feuchter Span noch das verwendete Kalkwasser schon ohne passendes Gas positiv reagiert.',
    'en': 'The controls show that neither a damp splint nor the supplied limewater already gives a positive result without the relevant gas.',
}
new_sentences = {
    'de': 'Die Luftkontrolle zeigt unter den dokumentierten Bedingungen kein Wiederaufflammen des Spans und die CO2-freie Kontrolle klares Kalkwasser; beide dienen als Vergleich für die positiven Beobachtungen bei A und B.',
    'en': 'Under the documented conditions, the air control shows no splint relighting and the CO2-free control leaves limewater clear; both provide a comparison with the positive observations for A and B.',
}
case1 = next(c for c in new_cases['cases'] if c['goalId'] == ID and c['caseId'].endswith('case-1'))
target = next(g for g in new_profiles['goals'] if g['goalId'] == ID)
for lang, suffix in [('de', 'De'), ('en', 'En')]:
    old = old_sentences[lang]
    new = new_sentences[lang]
    assert case1['expectedPerformance'][lang].count(old) == 1
    case1['expectedPerformance'][lang] = case1['expectedPerformance'][lang].replace(old, new)
    for parent, key in [(target['profile']['expectations'][0], 'observablePerformance'+suffix), (target['profile']['applicationCaseBriefs'][0], 'expectedPerformance'+suffix)]:
        assert parent[key].count(old) == 1
        parent[key] = parent[key].replace(old, new)
target['reason'] = 'AUTHOR v3 single correction: replace the unreported damp-splint control claim in the bilingual case1 reference and matching profile response with the actually supplied air/CO2-free control observations. Independent review of this revision is pending; no real learner, human approval, active write or strict gain.'
target['dissent'] = ['Prior independent B P580b revise finding triggered this author correction; this author package does not record independent closure.']
target['evidenceLevel'] = 'E1'
target['maximumClaimScope'] = 'G1'
write('candidate/positive17.corrected-author-candidate-set.json', new_profiles)
single = copy.deepcopy(new_profiles)
single['goals'] = [target]
write('candidate/positive1.p580b.author-candidate-set.json', single)
write('candidate/complete34-bilingual-material-cases.author-v3.json', new_cases)

def diffs(left, right, path=''):
    if isinstance(left, dict) and isinstance(right, dict):
        return [d for key in sorted(left.keys() | right.keys()) for d in diffs(left.get(key), right.get(key), path+'/'+key)]
    if isinstance(left, list) and isinstance(right, list) and len(left) == len(right):
        return [d for i, (l, r) in enumerate(zip(left, right)) for d in diffs(l, r, path+'/'+str(i))]
    return [] if left == right else [{'pointer': path, 'before': left, 'after': right}]

old_target = next(g for g in old_profiles['goals'] if g['goalId'] == ID)
old_target_cases = [c for c in old_cases['cases'] if c['goalId'] == ID]
new_target_cases = [c for c in new_cases['cases'] if c['goalId'] == ID]
profile_diff = diffs(old_target['profile'], target['profile'])
case_diff = diffs(old_target_cases, new_target_cases)
assert len(profile_diff) == 4 and len(case_diff) == 2
assert all(before == after for before, after in zip(old_profiles['goals'], new_profiles['goals']) if before['goalId'] != ID)
assert all(before == after for before, after in zip(old_cases['cases'], new_cases['cases']) if before['goalId'] != ID)
assert old_target_cases[1] == new_target_cases[1]
for key in ['material', 'taskDemand', 'specificBoundaryOrCounterexample']:
    assert old_target_cases[0][key] == new_target_cases[0][key]

canonical = read(BASE / 'candidate/canonical.whole-current-plus-targeted-corrections.json')
whole_goal = next(g for g in canonical['goals'] if g['id'] == ID)
write('candidate/whole580b-bilingual-profile-and-two-cases.author-v3.json', {
    'documentType': 'Targeted complete bilingual AUTHOR P580b v3 for new independent A+B read',
    'goalId': ID, 'authority': 'ai_candidate', 'status': 'needs_human_review',
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'strictNetGain': 0, 'humanApproval': False, 'independentApproval': False,
    'wholeUnchangedGoal': whole_goal,
    'wholeCorrectedProfile': target['profile'],
    'completeCorrectedMaterialCases': new_target_cases,
    'exactProfileChanges': profile_diff,
    'exactCaseChanges': case_diff,
    'authorControlInterpretation': {'de': 'Nur die berichtete Luftkontrolle ohne Wiederaufflammen und die klare CO2-freie Kalkwasserkontrolle werden interpretiert. Keine Spanfeuchte, Feuchtigkeitskontrolle, Reinheits- oder vollständige O2-Abwesenheitsbehauptung wird ergänzt.', 'en': 'Interpret only the reported air control without relighting and clear CO2-free limewater blank. No splint moisture, moisture control, purity or complete oxygen-absence claim is added.'},
})
write('candidate/exact-control-sentence-diff.author-v3.json', {
    'documentType': 'Exact single-fault AUTHOR patch; unchanged supplied material/task/boundary/case2/other16 profiles',
    'goalId': ID, 'caseId': case1['caseId'], 'oldSentences': old_sentences, 'newSentences': new_sentences,
    'profileChanges': profile_diff, 'completeCaseChanges': case_diff,
    'other16WholeCandidateSpecsUnchanged': True, 'other32CompleteCasesUnchanged': True,
    'supplied580bCase1MaterialTaskAndBoundaryUnchanged': True, 'whole580bCase2Unchanged': True,
    'unchangedD17Reused': True, 'strictNetGain': 0, 'independentApproval': False,
})

config = read(BASE / 'configs/positive-evidence17.author-candidates.config.json')
config['reviewId'] = REVIEW
config['reviewPath'] = (OUT / 'candidate/positive1.p580b.author-candidates.review.jsonl').relative_to(ROOT).as_posix()
config['scope'] = {'label': 'AUTHOR v3 single P580b control-reference correction; ai_candidate/E1G1; independent read pending; D17/HOLDs/source/context unchanged', 'goalIds': [ID]}
write('configs/positive1.p580b.author-candidates.config.json', config)

reuse_names = [
    'candidate/canonical.whole-current-plus-targeted-corrections.json',
    'candidate/semantic-kinds.candidate.json', 'candidate/full378-context.view.json',
    'candidate/two-bounded-direct-source-routes.author.json',
    'candidate/bounded-primary-witnesses17.author.json', 'candidate/preserved-holds.author.json',
    'candidate/positive-evidence17.author-candidate-set.json',
    'candidate/complete34-bilingual-material-cases.author.json',
    'candidate/positive-evidence17.author-candidates.review.jsonl',
    'configs/native-d-seventeen.batch.config.json',
    'native-d-seventeen/bundle/book.pdf', 'native-d-seventeen/bundle/book.html',
    'native-d-seventeen/bundle/book-model.json', 'native-d-seventeen/bundle/manifest.json',
    'native-d-seventeen/round-a/description-review-input.json',
    'native-d-seventeen/round-b/description-review-input.json',
    'inputs/current-retained-images/'+ID+'.jpg',
]
image_url = next(l['url'] for l in whole_goal['resourceLinks'] if l['type'] == 'goal-visualization')
current_asset = ROOT / 'app/public' / image_url.lstrip('/')
asset_copy = BASE / 'inputs/current-retained-images' / (ID+'.jpg')
assert current_asset.read_bytes() == asset_copy.read_bytes()
write('inputs/reused-exact-inputs.manifest.json', {
    'documentType': 'AUTHOR P580b v3 reused sealed D17/current candidate/context/source/HOLD inputs; no D rebuild',
    'role': 'AUTHOR', 'createdAtUTC': NOW, 'strictNetGain': 0,
    'baseV2CompleteFreezeCheck': base_check,
    'independentBFindingFreeze': pin(B / 'final-own-files-and-reviewed-inputs.freeze.json'),
    'reusedInputs': [pin(BASE / n) for n in reuse_names],
    'unchanged580bCurrentVisualizationAsset': pin(current_asset),
    'nativePConfigReusesUnchangedLandscapeAndSemanticKind': True,
    'noNewDInputOrModelOrBook': True,
    'pairedReviewReuseLimit': 'Prior D17 and other16 P judgments are historical judgments on their unchanged exact inputs. This author version does not promote or recreate them as its own approval. New580b P judgment must be supplied independently.',
})
print(json.dumps({'dossier': OUT.relative_to(ROOT).as_posix(), 'targetedProfiles': 1, 'profileStringChanges': len(profile_diff), 'completeCaseStringChanges': len(case_diff), 'other16ProfilesUnchanged': True, 'nativeDRebuild': False, 'strictNetGain': 0}))
