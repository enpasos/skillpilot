# SPDX-License-Identifier: Apache-2.0
"""Prepare inactive raster/native candidates after two genuine science reviews."""
from pathlib import Path
import copy
import hashlib
import json
import re
import shutil

D = Path(__file__).resolve().parent
R = D.parents[6]
S = D.parent / 'biologie-he7-foundations-cells-photosynthesis-ten-whole-science-author-20261008-v1'
I = R / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he7-ten-image-author-root-20261008-v1'
OLD = D.parent / 'biologie-he9-eighteen-final-raster-native-author-root-20261008-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        f.write(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n')

seals = []
for folder, name, expected in [
    ('biologie-he7-foundations-cells-photosynthesis-ten-science-first-independent-a-20261008-v1',
     'first-ten-whole-science-source-performance.independent-a.exact.freeze.json',
     '813715b4a8e55832a66e77251d38a0fac4b952238d8c69b302ccf043029d6a55'),
    ('biologie-he7-ten-whole-science-source-P-independent-b-20261008-v1',
     'ten-whole-source-P-scientific.independent-b.final-portability.freeze.json',
     'c25c4ac38bbce9609311750ecec0f0f4b0396be6ebe36be8c7d507a2483ebe23'),
]:
    p = D.parent / folder / name
    assert sha(p) == expected
    payload = read(p)
    checked = 0
    for field in ['ownFiles', 'frozenFiles', 'requiredPortableAuthorFiles']:
        for row in payload.get(field, []):
            f = R / row['path']
            assert sha(f) == row['sha256'].removeprefix('sha256:')
            assert f.stat().st_size == row['bytes']
            checked += 1
    seals.append({'path': str(p.relative_to(R)), 'sha256': expected, 'actualCheckedFiles': checked})

whole = read(S / 'current-ten-whole-DEEN-goals.actual.json')['wholeGoals']
assert len(whole) == 10
write(D / 'current10-whole-DEEN-goals.actual.json', {'goals': whole, 'activeWrites': 0})
candidate = read(S / 'P10.twenty-whole-DEEN-cases.author.candidates.json')
assert [g['goalId'] for g in candidate['goals']] == [g['id'] for g in whole]
write(D / 'ten-current-closed-contract.author.candidates.json', candidate)
old_cases = read(S / 'ten-whole-goals-twenty-complete-DEEN-cases.author.json')
materials = {'goals': [{'goalId': g['id'], 'cases': [c for c in old_cases['wholeCases'] if c['goalId'] == g['id']]} for g in whole]}
assert all(len(g['cases']) == 2 for g in materials['goals'])
write(D / 'ten-whole-goals-twenty-complete-DEEN-cases.exact.json', materials)
markdown = ['# Biologie: zehn ganze Ziele, zwanzig vollständige bilinguale Fälle', '',
            'Eigene synthetische Materialien. Keine behauptete Lernendenleistung oder menschliche Freigabe.', '']
for g in materials['goals']:
    markdown += ['## ' + g['goalId'], '']
    for c in g['cases']:
        markdown += ['### ' + c['id'], '']
        for lang in ['de', 'en']:
            markdown += ['#### ' + lang.upper(), '', c['material'][lang], '', c['task'][lang], '', c['modelAnswer'][lang], '']
write(D / 'ten-whole-goals-twenty-complete-DEEN-cases.exact.md', '\n'.join(markdown) + '\n')
config = read(OLD / 'native18.neutral.batch.config.json')
config.update(batchId='biologie-he7-ten-current391-author-20261008-v1',
              bookId='biologie-he7-ten-current391-author-v1',
              title='Biologie – Grundlagen, Zellen und Fotosynthese', goalIds=[g['id'] for g in whole],
              outputDirectory=str((D / 'native-raster-candidate').relative_to(R)))
write(D / 'native10.neutral.batch.config.json', config)
write(D / 'retained-ten-AM.actual-boundary.json', {
    'genuineIndependentWholeScienceSeals': seals,
    'sourceAuthorSeal': {'path': str((S / 'ten-whole-science-native-P10-author-input.first.freeze.json').relative_to(R)),
                         'sha256': sha(S / 'ten-whole-science-native-P10-author-input.first.freeze.json')},
    'sourceWholePrimaryPages': str((I / 'whole-official-source-pages/actual-complete-page-extraction.provenance.json').relative_to(R)),
    'unchangedGoalDescriptions': 10, 'existingAMDecisionsRetained': True,
    'requiredSharedMemoryOriginClosure': str((S / 'M.shared-memory-origin-closure.exact-retained-current.config.json').relative_to(R)),
    'existingSharedCards': 17, 'visibilityViews': 8, 'newCards': 0,
    'practicalExperimentOrLearnerEvidenceClaimed': False,
    'newNativeIndependentDAndV': 'pending', 'humanApproval': False, 'strictGainClaimed': 0,
})
for name in ['A10.exact-retained-current', 'M.shared-memory-origin-closure.exact-retained-current']:
    cfg = read(S / (name + '.config.json'))
    cfg['landscapePath'] = str((D / 'candidate/canonical.current474-ten-new-raster-author.json').relative_to(R))
    cfg['reportPath'] = str((D / 'native-raster-candidate' / (name + '.actual-report.md')).relative_to(R))
    write(D / (name + '.inactive-native.config.json'), cfg)

prep = (OLD / 'prepare-final-eighteen-raster-candidate.guarded.py').read_text()
prep = prep.replace('eighteen', 'ten').replace('current18', 'current10')
prep = re.sub(r'\b18\b', '10', prep)
write(D / 'prepare-final-ten-raster-candidate.guarded.py', prep)
native = (OLD / 'materialize-final-eighteen-native-author.mts').read_text()
native = native.replace('biologie-he9-eighteen', 'biologie-he7-ten').replace('eighteen', 'ten')
native = native.replace('current18', 'current10').replace('native18', 'native10').replace('P18', 'P10').replace('373', '381')
native = re.sub(r'\b18\b', '10', native)
native = re.sub(r'\b40\b', '20', native)
native = native.replace('achtzehn aktuelle Ziele zu Flora und Fauna', 'Grundlagen, Zellen und Fotosynthese')
native = native.replace("'../biologie-he9-nineteen-current391-science-author-root-v1/actual-whole-HE-G9-9-1-to-9-4-primary-reading.author.receipt.json'",
                        json.dumps(str((I / 'whole-official-source-pages/actual-complete-page-extraction.provenance.json').relative_to(R))))
native = native.replace('Fachliche unabhängige Reviews und menschliche Prüfung stehen aus; kein Nachweis einer Lernendenleistung.',
                        'Zwei unabhängige ganze Quellen- und Fachreviews liegen vor; finale aktuelle Raster-/Buchseitenreviews und menschliche Prüfung stehen aus. Kein Nachweis einer Lernendenleistung.')
write(D / 'materialize-final-ten-native-author.mts', native)
write(D / 'selected-ten-current-author-handoff.actual.json', {
    'selectedImageManifest': {'path': str((I / 'selected-ten-author-images.exact.json').relative_to(R)),
                             'sha256': sha(I / 'selected-ten-author-images.exact.json')},
    'wholeSourceScienceSeals': seals, 'portableWholeSourcePages': str((I / 'whole-official-source-pages').relative_to(R)),
    'nativePreparationIsNotApproval': True, 'activeWrites': 0,
})
print(json.dumps({'wholeSelectedGoals': 10, 'completeBilingualCases': 20,
                  'genuineScienceSeals': seals, 'newCards': 0, 'activeWrites': 0}))
