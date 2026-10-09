#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind the two genuine existing bounded derivation reviews, preserving whole holds."""
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors
def read(p):
    return json.loads(p.read_text())
def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(p, d):
    assert not p.exists(), p
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    assert read(p) == d

ad = BASE / 'chemie-b008-MV-kp-kc-derivation-source-placement-independent-a-v1'
bd = BASE / 'chemie-b008-MV-kp-kc-derived-whole-independent-b-resume-v1'
ae = ad / 'neutral-completed-one-derived-MV-LK-KpKc-independent-A.review.entry.json'
be = bd / 'neutral-completed-one-KpKc-bounded-source-P-AM-and-existing-raster.independent-b.entry.json'
aj, bj = read(ae), read(be)
av = ROOT / aj['ownScienceSourcePKindAMFirst']['path']
bv = ROOT / bj['ownScientificFirst']['path']
a, b = read(av), read(bv)
assert a['reviewer'] != b['reviewer']
assert not a['freshPeerOutcomesReadBeforeFIRST'] and not b['peerKpReviewsRead']
assert aj['actualAuthorNeutralEntry'] == bj['currentAuthorNeutralEntry']
assert a['decision'] == 'KEEP_BOUNDED_DERIVED_MATERIAL_AND_MV_LK_SOURCE_ROLE_AS_AI_CANDIDATE'
assert not a['freshMaterialBlockingFindings']
assert b['semanticAtomicityOwnWholeScientificDecision'] == 'atomic'
assert b['memoryOwnWholeScientificDecision'] == 'noMemoryNeeded'
assert a['semanticAtomicityDecision']['semanticAtomic']
assert a['memoryDecision']['status'] == 'no_memory_needed'
assert not aj['protected177GasSourceContextApproved']
assert not b['whole395SourceAtlasApproval']
inputs = [ae, be, av, bv,
          ad / 'one-derived-MV-LK-KpKc-completed-independent-A.final.freeze.json',
          bd / 'completed-one-KpKc-independent-b.final.freeze.json']
verified, caches, seen, historical_policy = [], [], set(), []
def verify(value):
    if isinstance(value, dict):
        path, sha = value.get('path'), value.get('sha256')
        if isinstance(path, str) and isinstance(sha, str) and len(sha.removeprefix('sha256:')) == 64:
            assert not Path(path).is_absolute(), path
            key = (path, sha)
            if key not in seen:
                seen.add(key)
                p = ROOT / path
                assert not p.is_symlink(), path
                actual = bind(p)
                if path == 'AGENTS.md' and actual['sha256'] != sha.removeprefix('sha256:'):
                    recovered = OUT / 'AGENTS.exact-prior-policy-input.recovered.md'
                    prior = bind(recovered)
                    assert prior['sha256'] == sha.removeprefix('sha256:')
                    assert prior['bytes'] == value['bytes']
                    added = '* Serialize JSON and JSONL with actual newline characters, then parse the\n  complete written files before sealing. Store raw command output as `.txt`.\n  Correct historical format errors with exact-byte raw archives and additive\n  valid successors; preserve scientific judgments and use normal validation.\n'
                    assert (ROOT / 'AGENTS.md').read_text().replace(added, '') == recovered.read_text()
                    historical_policy.append({'declaredHistoricalPath': path, 'exactOldInputBytes': prior, 'currentPolicy': actual, 'actualOnlyAddedPolicyText': added, 'classification': 'Additional serialization/portability requirement, no chemical/source/operator/learner evidence change. Exact old bytes retained; current JSON parsing and normal validation applied.', 'scientificReviewReperformed': False})
                    verified.append(prior)
                    return
                assert actual['sha256'] == sha.removeprefix('sha256:'), path
                if isinstance(value.get('bytes'), int):
                    assert actual['bytes'] == value['bytes'], path
                tracked = subprocess.run(['git', 'ls-files', '--error-unmatch', '--', path], cwd=ROOT, capture_output=True).returncode == 0
                ignored = subprocess.run(['git', 'check-ignore', '--quiet', '--', path], cwd=ROOT).returncode == 0 and not tracked
                (caches if ignored else verified).append(actual)
                if p.suffix == '.json':
                    read(p)
                elif p.suffix == '.jsonl':
                    for line in p.read_text().splitlines():
                        if line.strip():
                            json.loads(line)
        for x in value.values():
            verify(x)
    elif isinstance(value, list):
        for x in value:
            verify(x)
for p in inputs:
    verify(bind(p))
    verify(read(p))
assert not curriculum_symlink_errors(ROOT)
first = OUT / 'one-derived-KpKc-source-P-AM-existing-judgments.technical-input.freeze.json'
write(first, {'schemaVersion': 1, 'role': 'Existing actual independent FIRST inputs, no new science review', 'inputs': [bind(p) for p in inputs], 'verifiedBindings': verified, 'historicalPolicyBytePreservingResolution': historical_policy, 'ignoredWorkingCachesNotOperative': caches, 'normalSymlinkErrors': []})
pair = OUT / 'one-derived-KpKc-source-P-AM-genuine-existing-pair.actual.json'
write(pair, {'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(), 'role': 'Technical pair of actual existing bounded source/science/text-P/A/M reviews', 'goalId': bj['goalId'], 'reviewers': [a['reviewer'], b['reviewer']], 'inputFirst': bind(first), 'sameWholeAuthorInput': aj['actualAuthorNeutralEntry'], 'wholeBilingualGoalAndTwoBilingualCasesGenuinelyReadByBoth': True, 'sourceScope': {'jurisdiction': 'DE-MV', 'stage': 'SekII', 'courseProfile': 'LK', 'physicalPage': 27, 'printedPage': 23, 'coverage': 'partial derivation contribution only'}, 'independentAOutcome': aj['outcomes'], 'independentBSourceConclusion': b['boundedSourceConclusion'], 'independentBMaterialConclusion': b['wholePAndTwoCasesConclusion'], 'semanticAtomicity': 'atomic', 'memoryDecision': 'no_memory_needed', 'historicalExistingRasterHoldsPreserved': b['findings'], 'actualLaterPNGVisualPairSeparate': bind(BASE / 'chemie-b008-MV-kp-kc-readable-raster-actual-V-pairing-technical-b-v1/completed-one-current-Kp-actual-V-pairing.technical.entry.json'), 'whole395SourceAtlasApproved': False, 'wholeRegisteredProgrammeApproved': False, 'protected177GasContextApproved': False, 'nativeDPAndCurrentRasterPApproved': False, 'allIndependentContextHoldsRetained': a['remainingContextHolds'], 'nonblockingWordBoundaryAdvisoryRetained': b['nonblockingTextAdvisory'], 'historicalReviewsNotReperformed': True, 'activeImport': False, 'currentChemieDenominator': 378, 'candidate395RemainsInactive': True, 'strictGain': 0, 'newScientificM7Closures': 0, 'restoredM7Bindings': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': []})
entry = OUT / 'neutral-completed-derived-KpKc-genuine-source-P-AM-pair.entry.json'
write(entry, {'schemaVersion': 1, 'role': 'Actual completed bounded technical pair, no current full chemistry completion', 'pair': bind(pair), 'inputFirst': bind(first), 'independentMaterialSourceAMComponents': 1, 'remainingWholeSourceProgrammeNativeAndProtectedGasContext': True, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': []})
seal = OUT / 'one-derived-KpKc-source-P-AM-pair.technical.final.freeze.json'
write(seal, {'schemaVersion': 1, 'entry': bind(entry), 'outputs': [bind(p) for p in sorted(OUT.iterdir()) if p.is_file() and p != seal], 'strictGain': 0})
print(json.dumps({'entry': bind(entry), 'seal': bind(seal), 'verifiedBindings': len(verified), 'ignoredWorkingCaches': len(caches), 'strictGain': 0}))
