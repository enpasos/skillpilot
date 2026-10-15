# SPDX-License-Identifier: Apache-2.0
"""Freeze selected whole input bodies; no fingerprints, checks or judgment."""
from pathlib import Path
import hashlib
import json
import os

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
E15 = OWN.parent
IDS = ['a8ddb351-3501-5b6d-a908-c82a5d2f14d4', 'f0f2c5f8-06f1-5774-a176-d96505727acf']
AUTHOR = E15 / 'chemie-equilibrium-four-source-scope-candidate-author-20261015-v1'
PREVIOUS = E15 / 'chemie-equilibrium-two-and-analgesic-term-current422-informed-P2-A2-M1-V1-20261015-v1'


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def write(p, d):
    assert not p.exists()
    t = p.with_name(p.name + '.partial')
    t.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    os.replace(t, p)


for folder in ['inputs', 'science', 'browser', 'checks', 'normal', 'config', 'records', 'qa']:
    (OWN / folder).mkdir(exist_ok=True)
selector_path = AUTHOR / 'NEUTRAL.finite-four-source-scope-candidate-author.selector.json'
assert ref(selector_path)['sha256'] == 'sha256:4c8b8027b0e05914ea6d32d36271661c2af588a30cefb333bfac8fa5dcdbfbad'
selector = read(selector_path)
for key in ['canonical', 'semanticSourceIdentityOnly', 'whole32CaseCorpusExact', 'whole16ProfileCorpusExact',
            'wholeEightCasesAndFourProfilesExact']:
    assert ref(REPO / selector[key]['path']) == selector[key]
canonical = read(REPO / selector['canonical']['path'])
goals = {g['id']: g for g in canonical['goals']}
previous = read(PREVIOUS / 'SELECTION.final-informed-P2-A2-and-rezeptfrei-M1-V1.json')
old_canonical = read(REPO / previous['finalCanonical']['path'])
old_goals = {g['id']: g for g in old_canonical['goals']}
assert len(goals) == len(old_goals) == 560
assert all(goals[g] == old_goals[g] for g in goals if g not in IDS)
for gid in IDS:
    assert {k: v for k, v in goals[gid].items() if k not in ['description', 'descriptionEn']} == {k: v for k, v in old_goals[gid].items() if k not in ['description', 'descriptionEn']}
selected = read(REPO / selector['wholeEightCasesAndFourProfilesExact']['path'])
corpus = read(REPO / selector['whole32CaseCorpusExact']['path'])['cases']
profiles = [json.loads(l) for l in (REPO / selector['whole16ProfileCorpusExact']['path']).read_text().splitlines()]
assert len(selected['cases']) == 8 and len(selected['profiles']) == 4
assert all(c in corpus for c in selected['cases'])
assert all(p in profiles for p in selected['profiles'])
last_input = read(PREVIOUS / 'inputs/whole-three-contexts-two-profiles-six-cases.actual.json')
assert all(c in selected['cases'] for c in last_input['wholeEquilibriumCases4'])
assert all(p in selected['profiles'] for p in last_input['wholeProfiles2'])
images = {
    IDS[0]: REPO / f'curricula/DE/Gymnasium/visualizations/chemie/{IDS[0]}/{IDS[0]}.jpg',
    IDS[1]: E15 / f'chemie-pourbaix-one-missing-image-author-root-20261015-v1/candidate/visualizations/chemie/{IDS[1]}/{IDS[1]}.png',
}
Mbase = previous['M1']['whole422Records']
Qbase = previous['V1']['wholeQA438Candidate']
assert ref(REPO / Mbase['path']) == Mbase and ref(REPO / Qbase['path']) == Qbase
M = [json.loads(l) for l in (REPO / Mbase['path']).read_text().splitlines()]
Q = read(REPO / Qbase['path'])['records']
for gid in IDS:
    assert next(r for r in Q if r['goalId'] == gid)['assetSha256'] == ref(images[gid])['sha256']
write(OWN / 'inputs/two-whole-final-contexts-four-profiles-eight-cases.actual.json', {
    'schemaVersion': 1, 'role': 'Whole final science input, author-origin disclosed; no expected verdict',
    'neutralAuthorSelector': ref(selector_path), 'authorSeal': ref(AUTHOR / selector['finiteSeal']),
    'finalCanonical': selector['canonical'], 'finalSemantic': selector['semanticSourceIdentityOnly'],
    'oldCanonical': previous['finalCanonical'], 'whole32Cases': selector['whole32CaseCorpusExact'],
    'whole16Profiles': selector['whole16ProfileCorpusExact'],
    'wholeContexts': [{'goal': goals[g], 'wholeDirectPrerequisites': [goals[p] for p in goals[g]['requires']],
                       'wholeDirectParents': [p for p in goals.values() if g in p.get('contains', [])],
                       'actualCurrentNativeImage': ref(images[g])} for g in IDS],
    'wholePriorGoals': [old_goals[g] for g in IDS],
    'wholeProfiles4': selected['profiles'], 'wholeCases8': selected['cases'],
    'targetProfiles2': [p for p in profiles if p['goalId'] in IDS],
    'targetCases4': [c for c in corpus if c['goalId'] in IDS],
    'unchangedE0IAWholeCasesProfilesExactToImmediatelyPreviousActualReading': True,
    'M422Baseline': Mbase, 'QA438Baseline': Qbase,
    'wholePriorM2': [m for m in M if m['goalId'] in IDS],
    'wholePriorQA2': [q for q in Q if q['goalId'] in IDS],
    'wholeOfficialSourceAndPartnerReferencesOnly': selector['wholeOfficialAntecedentsAndPartnerUnions'],
    'sourceComponentsAndLKDeclaration': 'Eight unreviewed author components; decisions[] is empty. No official source evidence or resolved D/source/course grant is inferred.',
    'fourSourceCourseHoldsRemainOpen': True, 'newDOpinion': False,
    'materialOriginDisclosure': 'Original16 material author; not author of the two current bounded goal descriptions. New informed role, no blind independence claim.',
    'other558WholeGoalObjectsExact': True, 'onlyTwoDEENDescriptionFieldsDiffer': True,
    'sourceImageCopies': 0, 'normalBindings': 0,
})
print(json.dumps({'wholeGoals': 2, 'wholeProfiles': 4, 'wholeCases': 8, 'targetCases': 4, 'normalBindings': 0}))
