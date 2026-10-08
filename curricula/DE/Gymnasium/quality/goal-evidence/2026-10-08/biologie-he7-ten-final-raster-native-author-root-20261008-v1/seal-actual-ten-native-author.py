# SPDX-License-Identifier: Apache-2.0
"""Seal actual portable author inputs. Generation and technical passes are no approval."""
from pathlib import Path
import datetime
import hashlib
import json
import subprocess

D = Path(__file__).resolve().parent
R = D.parents[6]
I = R / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he7-ten-image-author-root-20261008-v1'
rel = lambda p: str(p.relative_to(R))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())

def write(p, value):
    with p.open('x') as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write('\n')

for name in ['guarded-ten-image-candidate', 'native-ten-PNG-page-campaign-P-author',
             'retained-A10-native-correct-existing-command', 'retained-M17-origin-closure-native']:
    assert read(D / (name + '.terminal.actual.json'))['exitCode'] == 0
assert read(D / 'actual-ten-native-physical-page-render.terminal.json')['exitCode'] == 0
n = D / 'native-raster-candidate/ten'
assert (n / 'book.pdf').read_bytes() == (n / 'bundle/book.pdf').read_bytes()
assert (n / 'book.html').read_bytes() == (n / 'bundle/book.html').read_bytes()
manifest = read(n / 'bundle/review-bundle-manifest.json')
model = read(n / 'book-model.json')
ids = [p['goalId'] for p in model['pages']]
assert len(ids) == 10
write(D / 'neutral-ten-current-raster-native-independent-review.entry.json', {
    'role': 'Ten current whole-goal author inputs; final independent D/P/V review pending',
    'operativeNativeBundle': rel(n / 'bundle'), 'operativePDF': rel(n / 'bundle/book.pdf'),
    'operativeHTML': rel(n / 'bundle/book.html'),
    'wholeFinalLandscape': rel(D / 'candidate/canonical.current474-ten-new-raster-author.json'),
    'pureCurrent391Model': rel(D / 'native-raster-candidate/full391.book-model.json'),
    'wholeSelectedGoals': rel(D / 'current10-whole-DEEN-goals.actual.json'),
    'twentyCompleteBilingualCases': rel(D / 'ten-whole-goals-twenty-complete-DEEN-cases.exact.json'),
    'wholePositiveCandidateProfiles': rel(D / 'ten-current-closed-contract.author.candidates.json'),
    'closedNativeP10': rel(D / 'native-raster-candidate/P10.actual-raster-author.review.jsonl'),
    'fullActualPNGsAndToolProvenance': rel(I / 'selected-ten-author-images.exact.json'),
    'actualWidthCaptures': rel(I / 'inspection-captures'),
    'actualPhysicalPageCaptures': rel(n / 'actual-physical-pages'),
    'physicalGoalPages': [{'goalId': gid, 'physicalPage': i + 3} for i, gid in enumerate(ids)],
    'wholeOfficialPrimaryPagesAndExactPdfSourceSha': rel(I / 'whole-official-source-pages/actual-complete-page-extraction.provenance.json'),
    'genuineWholeSourceScienceAndRetainedAM': rel(D / 'retained-ten-AM.actual-boundary.json'),
    'independentCampaignA': rel(n / 'round-a'), 'independentCampaignB': rel(n / 'round-b'),
    'reviewRequirements': [
        'Read each entire DE/EN goal, complete cases and whole profile; independently inspect actual full PNG and both360/680 captures plus actual physical PDF page.',
        'Use the actual ten-record native campaign for your own run and records. Seal first judgments before reading peer results.',
        'Practical goals require actual actions/protocols for a learner competence claim. Synthetic E1/G1 candidates do not establish experimental performance.',
        'Read entire official HE5.1/7.1/7.2 pages. No direct water-substrate proof from drought, gas identity from bubbles alone, gross-rate or gas-purity claim.',
        'Retain valid existing A/M decisions, shared17cards and8views. Do not claim human approval or regenerate a valid image without a concrete observed defect.',
    ],
    'generationIsNotApproval': True, 'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate',
    'realLearnerEvidence': False, 'humanApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0,
})
files = []
local = []
for base in [D, I]:
    for p in sorted(base.rglob('*')):
        if not p.is_file():
            continue
        check = subprocess.run(['git', 'check-ignore', '--no-index', rel(p)], cwd=R, capture_output=True, text=True)
        row = {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}
        if check.returncode == 0:
            assert p in [n / 'book.pdf', n / 'book.html'], 'Unexpected ignored operative author file: ' + rel(p)
            local.append({**row, 'operativePortableReplacement': rel(n / 'bundle' / p.name)})
            continue
        assert check.returncode == 1
        if p.is_symlink():
            target = p.resolve(strict=True)
            assert target.is_relative_to(D) and target.is_file()
            row.update(relativeLinkText=str(p.readlink()), resolvedPortableTarget=rel(target))
        files.append(row)
assert len([p for p in (n / 'actual-physical-pages').glob('*.png')]) == 10
out = D / 'ten-current-raster-native-author-input.first.freeze.json'
write(out, {'artifactKind': 'actual-portable-ten-current-raster-native-author-first-freeze',
            'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'frozenFiles': files, 'frozenFileCount': len(files),
            'ignoredRawLocalObservations': local,
            'genuinePriorWholeScienceSeals': read(D / 'retained-ten-AM.actual-boundary.json')['genuineIndependentWholeScienceSeals'],
            'actualNativeP10SchemaAndSemanticErrors': 0,
            'actualIndependentFinalDAndV': 'pending', 'humanApproval': False, 'activeWrites': 0,
            'strictGainClaimed': 0})
print(json.dumps({'firstAuthorSeal': rel(out), 'sha256': sha(out), 'portableFiles': len(files),
                  'nativeGoals': 10, 'newStrictCompletions': 0}))
