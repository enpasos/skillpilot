# SPDX-License-Identifier: Apache-2.0
"""Seal genuine terminal review with actual portable input and symlink guard."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import os
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he7-ten-final-raster-native-author-root-20261008-v1'
PRIOR = OWN.parent / 'biologie-he7-foundations-cells-photosynthesis-ten-science-first-independent-a-20261008-v1'
IMAGE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he7-ten-image-author-root-20261008-v1'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    with p.open('x') as stream: stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
first = OWN / 'first-current-ten-D-P-V.independent-a.exact.freeze.json'
assert sha(first) == 'dd4d666689f4e9cc2e5e736f485ecda00fc24be33381a7972eac02ed2232ff7c'
for b in read(first)['ownFiles']: assert bind(ROOT / b['path']) == b
assert read(OWN / 'D10.native.terminal.actual.json')['actualTerminalExitCode'] == 0
assert read(OWN / 'P10.native.terminal.actual.json')['actualTerminalExitCode'] == 0
positive = read(OWN / 'P10.exact-inactive-native-api.independent-a.actual.json')
assert positive['configuredGoals'] == positive['needsHumanReview'] == 10
assert positive['schemaErrors'] == positive['semanticErrors'] == positive['approved'] == 0
prior = read(PRIOR / 'first-ten-whole-science-source-performance.independent-a.exact.freeze.json')
author_seal = AUTHOR / 'ten-current-raster-native-author-input.first.freeze.json'
declared = read(author_seal)['frozenFiles'] + prior['ownFiles'] + prior['requiredPortableAuthorFiles']
paths = {b['path']: b for b in declared}
for p in [author_seal, first, PRIOR / 'first-ten-whole-science-source-performance.independent-a.exact.freeze.json']:
    paths[str(p.relative_to(ROOT))] = bind(p)
for im in read(IMAGE / 'selected-ten-author-images.exact.json')['images']:
    for name in ['path', 'promptPath', 'toolProvenancePath']:
        p = ROOT / im[name]; paths[im[name]] = bind(p)
    cp = IMAGE / 'inspection-captures' / im['goalId'] / 'chromium-captures.actual.json'
    paths[str(cp.relative_to(ROOT))] = bind(cp)
    for r in read(cp)['captures']: paths[r['path']] = bind(ROOT / r['path'])
for p in OWN.rglob('*'):
    if p.is_file(): paths[str(p.relative_to(ROOT))] = bind(p)
checked_links = []
for rel, b in paths.items():
    p = ROOT / rel
    assert p.is_file(), rel
    assert sha(p) == b['sha256'] and p.stat().st_size == b['bytes'], rel
    if p.is_symlink():
        target = p.resolve(strict=True); link = os.readlink(p)
        assert not Path(link).is_absolute()
        assert target.is_relative_to(AUTHOR)
        assert str(target.relative_to(ROOT)) in paths
        if 'relativeLinkText' in b: assert link == b['relativeLinkText']
        if 'resolvedPortableTarget' in b: assert str(target.relative_to(ROOT)) == b['resolvedPortableTarget']
        checked_links.append({'path': rel, 'actualRelativeLink': link, 'actualResolvedTarget': str(target.relative_to(ROOT)), 'exists': True})
git_argv = ['git', 'check-ignore', '--no-index', '--verbose', *sorted(paths)]
ignored = subprocess.run(git_argv, capture_output=True, text=True)
assert ignored.returncode in [0,1] and not ignored.stderr.strip(), ignored.stdout + ignored.stderr
# Verbose check-ignore also reports explicit !negations. Those existing
# standard bundle rules include files; they are not ignored input findings.
matched_rules = [line for line in ignored.stdout.splitlines() if line.strip()]
excluded_rules = [line for line in matched_rules if not line.split('\t',1)[0].split(':',2)[2].startswith('!')]
assert not excluded_rules, '\n'.join(excluded_rules)
for p in OWN.rglob('*'):
    if p.is_file() and p.suffix == '.json': read(p)
    elif p.is_file() and p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip(): json.loads(line)
guard = {'schemaVersion': 1, 'recordedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Actual independent A final operative-input portability guard', 'requiredFiles': list(paths.values()),
    'actualRequiredCount': len(paths), 'actualGitCheckIgnore': {'argv': git_argv, 'terminalExitCode': ignored.returncode, 'stdout': ignored.stdout, 'stderr': ignored.stderr, 'matchedExistingIncludeNegations': matched_rules, 'actualExcludedRules': excluded_rules},
    'ignoredRequired': 0, 'checkedContainedRelativeImageLinks': checked_links, 'brokenSymlinks': 0,
    'operativeBookPDF': str((AUTHOR / 'native-raster-candidate/ten/bundle/book.pdf').relative_to(ROOT)),
    'operativeBookHTML': str((AUTHOR / 'native-raster-candidate/ten/bundle/book.html').relative_to(ROOT)),
    'portableContract': 'Use bundle/book.pdf and bundle/book.html artifactAccessPath. Raw rendered outputs and local official PDF cache are historical observations, not required live build/check inputs.',
    'ignoredHistoricalPDFBoundary': 'Prior own source-author localPDF was honestly observed and remains in historical provenance; whole portable official extracts/current hash observation are the source dependency. No ignore exception, force-add, hash-only science or historical seal rewrite.',
    'firstSealBeforeAnyPeerFinalBReading': True, 'peerFinalBFilesRead': 0, 'activeWrites': 0}
write(OWN / 'actual-final-required-input-portability-symlink.guard.json', guard)
write(OWN / 'completed-native-D10-P10-V10.independent-a.final.freeze.json', {
    'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(), 'role': 'Genuine completed independent A HE7 whole-ten final raster/native review',
    'genuineOwnFirstJudgment': bind(first), 'authorInput': bind(author_seal),
    'retainedOwnWholeScienceFirst': bind(PRIOR / 'first-ten-whole-science-source-performance.independent-a.exact.freeze.json'),
    'ownFiles': [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],
    'genuineNativeD10': {'terminalExitCode': 0, 'results': 'round-a/results', 'wholeRecords': 10, 'decisionsKeep': 10},
    'genuineNativeP10': {'closedSchemaErrors': 0, 'currentGoalPNGSemanticErrors': 0, 'needsHumanReview': 10, 'approved': 0, 'wholeScopedProfilesSciencePass': 10},
    'actualV10': {'fullPNGs': 10, 'width360': 10, 'width680': 10, 'wholeNativePages': 10, 'KEEP': 10, 'HOLD': 0},
    'retainedAAndM': 'Valid unchanged existing decisions/shared17cards/eightviews retained; this phase does not invent new card reviews or actual learner performance.',
    'blockingFindings': [], 'portability': {'requiredFiles': len(paths), 'ignoredRequired': 0, 'brokenSymlinks': 0},
    'peerFinalBFilesRead': 0, 'realLearnerEvidence': False, 'actualExperiments': 0,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': 0, 'strictGainClaimed': 0,
    'nextRequiredWork': 'Pair with genuinely independent final B, synthesize native actual10 D/P/V and current-baseline guarded plan, then Root affected integration/central check; no strict completion claim from this review alone.'})
final = OWN / 'completed-native-D10-P10-V10.independent-a.final.freeze.json'
print(json.dumps({'finalSeal': bind(final), 'nativeD10': 0, 'nativeP10': 0, 'VKEEP': 10, 'requiredPortable': len(paths), 'ignored': 0, 'brokenSymlinks': 0, 'peerFinalBFilesRead': 0, 'activeWrites': 0, 'strictGainClaimed': 0}))
