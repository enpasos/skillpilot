#!/usr/bin/env python3
"""Capture actual inputs to a bounded independent material review, without live edits."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
CAN = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
REG = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
MIDS = ['86fff38f-57d7-5365-a9a2-b8c22d193bd6', 'c7f78820-f5e3-55ac-9a49-9ff747c6bfaa', '99eff8ba-bc92-5f08-8882-36f1b179101b', 'a761eb96-1ae3-5702-bd3c-4a260889c2f4']
bindings = []

def bind(path):
    p = ROOT / path
    b = p.read_bytes()
    row = {'path': str(path), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b), 'symlink': p.is_symlink()}
    if row not in bindings:
        bindings.append(row)
    return row

def dump(name, obj):
    p = OUT / name
    assert not p.exists(), f'Historical evidence must not be overwritten: {p}'
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

current = json.loads((ROOT / CAN).read_text())
goals = {g['id']: g for g in current['goals']}
materials = [goals[x] for x in MIDS]
gids = list(dict.fromkeys(x for g in materials for x in g['examData']['coveredGoalIds']))
assert len(gids) == 10
reg = json.loads((ROOT / REG).read_text())
entry = next(x for x in reg['subjects'] if x['subject'] == 'wirtschaftswissenschaften')
profiles = []
for config_path in entry['positiveEvidenceConfigPaths']:
    config = json.loads((ROOT / config_path).read_text())
    if not set(gids).intersection(config.get('scope', {}).get('goalIds', [])):
        continue
    bind(config_path)
    bind(config['reviewPath'])
    for line in (ROOT / config['reviewPath']).read_text().splitlines():
        row = json.loads(line)
        if row.get('goalId') in gids:
            profiles.append({'configPath': config_path, 'reviewPath': config['reviewPath'], 'wholeCurrentPositiveEvidenceProfile': row})
assert len(profiles) == len(gids)
assert {x['wholeCurrentPositiveEvidenceProfile']['goalId'] for x in profiles} == set(gids)
bind(CAN); bind(REG); bind('AGENTS.md')
casecount = sum(len(x['wholeCurrentPositiveEvidenceProfile']['profile']['applicationCaseBriefs']) for x in profiles)
dump('actual-current496-four-whole-bodies-ten-whole-DEEN-contracts-and-all-P-contexts.exact.json', {
    'schemaVersion': 1, 'capturedAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': '/root/economics_m2_views_independent_b', 'canonicalInput': bind(CAN),
    'currentGoalCount': len(current['goals']), 'registryInput': bind(REG),
    'wholeMaterials': materials, 'wholeOrdinaryGoals': [goals[x] for x in gids],
    'wholeCurrentProfileRows': profiles, 'actualApplicationCases': casecount,
    'profileStatuses': sorted({x['wholeCurrentPositiveEvidenceProfile']['status'] for x in profiles}),
    'claimBoundary': 'No source, profile status, human review, release status or live material changes.'
})

prior_paths = [
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-seven-materials-and-real-regime-independent-a-v1/actual-nine-binding-cuts-and-whole-15aa-F-V-calculation-counterworks-rubric-scientific-KEEP.independent-a.json',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-six-phase-gates-whole-material-independent-a-v1/actual-seven-old-whole-materials-nine-unproved-coverage-and-one-task-rubric-scientific-REVISE.independent-a.json',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-six-phase-gates-whole-material-independent-a-v1/actual-five-practice-clusters-six-nonuniversal-content-gates-scientific-KEEP.independent-a.json',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/four-reviewed-profile-materials-and-explicit-five-support-scope-author-v13/actual-stable-reviewed407-P311-seven-owner-route-scope-and-material-handoff.receipt.json',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-four-real-route-materials-independent-root-v1/actual-independent-four-whole-profile-route-materials-and-machine-release.receipt.json',
 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-four-real-route-materials-independent-root-v1/whole-four-KEEP-terminal-goals.only-machine-material-status-released.json'
]
prior = []
for path in prior_paths:
    prior.append({'input': bind(path), 'wholeArtifact': json.loads((ROOT / path).read_text())})
dump('actual-six-relevant-prior-review-artifacts.whole-read-inputs.json', prior)
searches = []
for expression in ['86fff38f|c7f78820|99eff8ba|a761eb96', 'e3174af8|cf1b260a|27af1f1d|f1a9ebbd']:
    args = ['rg', '-l', expression, 'curricula/DE/Gymnasium/quality/goal-evidence']
    result = subprocess.run(args, cwd=ROOT, text=True, capture_output=True)
    assert result.returncode == 0
    paths = result.stdout.splitlines()
    searches.append({'argv': args, 'exitCode': result.returncode, 'stdoutTruncated': False,
                     'matchFileCount': len(paths), 'allMatchedPaths': paths, 'stderr': result.stderr})
dump('actual-complete-rg-prior-body-and-provenance-review-search.json', {
    'searches': searches,
    'relevantArtifactsWholeRead': [x['input'] for x in prior],
    'interpretation': [
        'The A nine-cut KEEP explicitly does not qualify remaining whole body coverage; its separate 15aa science is retained unchanged.',
        'The five-cluster KEEP proves non-universality of six inherited gates, not body coverage.',
        'The old407 handoff retains the forty-three old whole examData and separately cites four NEW reviewed materials. Its old retention hash is not a review of these four old bodies.',
        'The whole released four NEW materials have different IDs from all four bodies in this review.',
        'The ID/provenance inventory contains whole snapshots, description/source/applicability evidence and targeted binding reviews. No valid whole assessment review of the ten currently remaining claims was identified in inspected review artifacts.',
        'This is a first bounded remaining-coverage review, not a restart of the qualified historical nine-cut or 15aa work.'
    ]
})
new_four = prior[-1]['wholeArtifact']
if isinstance(new_four, dict):
    new_four = new_four.get('goals', new_four.get('materials', []))
assert {x['id'] for x in new_four}.isdisjoint(MIDS)
dump('actual-input-bindings.before-independent-remaining-coverage-verdict.json', {
    'inputs': bindings, 'allInputsPhysicallyRead': True, 'symlinkCount': sum(x['symlink'] for x in bindings),
    'currentCanonicalGoalCount': len(current['goals']), 'materials': len(materials),
    'ordinaryContracts': len(gids), 'applicationCases': casecount,
    'materialBodyAuthorsAreLegacyNotThisReviewer': True,
    'reviewerEarlierAuthoredNineFalseBindingCutsOnly': True,
    'remainingClaimsNotApprovedByEarlierCuts': True,
    'activeWrites': 0, 'newImages': 0
})
print(json.dumps({'outputDirectory': str(OUT.relative_to(ROOT)), 'CAN': bind(CAN), 'materials': len(materials), 'contracts': len(gids), 'applicationCases': casecount, 'inputs': len(bindings), 'searchCounts': [x['matchFileCount'] for x in searches]}))
