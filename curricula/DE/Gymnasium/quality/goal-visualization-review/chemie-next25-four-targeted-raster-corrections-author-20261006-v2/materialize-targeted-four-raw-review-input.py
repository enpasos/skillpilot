"""Freeze inert generated PNG candidates; generation is not approval."""
import copy
import datetime
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[5]
V1 = OWN.parent / 'chemie-next25-seven-proven-defects-correction-author-20261006-v1'
A = OWN.parent / 'chemie-next25-seven-corrections-independent-v-a-20261006-v1'
B = OWN.parent / 'chemie-next25-seven-corrections-independent-v-b-20261006-v1'

def bind(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def verify_freeze(base, filename):
    f = base / filename
    obj = json.loads(f.read_text())
    for item in obj['files']:
        path = ROOT / item['path'] if item['path'].startswith('curricula/') else base / item['path']
        assert bind(path)['sha256'].removeprefix('sha256:') == item['sha256'].removeprefix('sha256:'), item['path']
    return {'freeze': bind(f), 'actualOwnFilesVerified': len(obj['files'])}

verified = [verify_freeze(V1, 'seven-proven-raster-corrections.author-v1.final.freeze.json'),
            verify_freeze(A, 'independent-v-a.final.freeze.json'),
            verify_freeze(B, 'independent-v-b-seven-corrections.final.freeze.json')]
raw = json.loads((V1 / 'seven-selected-actual-pngs-and-current-goals.raw-independent-review-input.json').read_text())
canon_path = ROOT / raw['currentCanonical']['path']
canon_before = canon_path.read_bytes()
assert bind(canon_path) == raw['currentCanonical']
current = {g['id']: g for g in json.loads(canon_before)['goals']}
assert len(current) == 479
va = {r['goalId']: r for r in json.loads((A / 'independent-v-a.decisions.actual.json').read_text())['rows']}
vb = {r['goalId']: r for r in json.loads((B / 'independent-v-b-seven-asset-verdicts.json').read_text())['records']}
attempts = {'965ca297': 1, '747c5777': 2, '49235cbe': 1, '5e2eb826': 2}
observations = {
 '965ca297': 'Exactly2 Al3+ and3 O2-; single large example, ratio2:3, formulaAl2O3 and charge balance0; omitted insets are represented in unchanged P material, not claimed as pictured.',
 '747c5777': 'Large delta signs, continuous qualitative envelopes, correct HCl and linear CO2, opposite CO2 bond-dipole arrows and consistent blue-positive/red-negative key. Attempt1 imprecise bond-cancellation header was rejected; attempt2 says bond dipoles cancel.',
 '49235cbe': 'Four actual rounded first-ionization values900/801/1402/1314, common zero baseline, Be>B and N>O>Be/B. Selected elements not an equally spaced atomic-number interpolation. Qualitative multi-electron1s<2s<2p model with n/l mapping; no assigned emission spectrum.',
 '5e2eb826': 'Exactly8 full small cubes, same perspective, revised approximatelyhalf corresponding edge dimensions. Attempt1 still too small and retained as rejected. Independent geometrical and actual360/680 checks remain required.'
}
calls = []
rows = []
for initial in raw['rows']:
    row = copy.deepcopy(initial)
    goal = row['goalId']
    short = goal.split('-')[0]
    assert current[goal] == row['wholeCurrentGoal']
    assert row['selectedPNG']['sha256'] == va[goal]['assetHash']
    assert row['selectedPNG']['sha256'].removeprefix('sha256:') == vb[goal]['assetSha256']
    for old in row['originalSourceFrontendBackendExactBefore']:
        assert bind(ROOT / old['path']) == old
    row['firstIndependentReviewA'] = bind(A / 'independent-v-a.decisions.actual.json')
    row['firstIndependentReviewB'] = bind(B / 'independent-v-b-seven-asset-verdicts.json')
    if short in attempts:
        row['priorSelectedPNG'] = row['selectedPNG']
        row['priorActualPrompt'] = row['actualPrompt']
        image = OWN / 'selected' / goal / (goal + '.png')
        prompt = OWN / f'{short}-actual-generation-prompt.attempt{attempts[short]}.txt'
        row['selectedPNG'] = bind(image)
        row['actualPrompt'] = bind(prompt)
        row['selectedAttempt'] = attempts[short]
        with Image.open(image) as im:
            assert im.format == 'PNG'
            row['nativeSize'] = list(im.size)
        row['authorSight'] = observations[short]
        row['pendingIndependentMachineV'] = True
        row['currentDecisionState'] = 'NEW_TARGETED_RASTER_CANDIDATE_PENDING_INDEPENDENT_V2'
        argv = ['node', 'scripts/import_goal_visualization.mjs', goal, str(image),
                '--landscape=curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
                '--subject=chemie', '--provider=ChatGPT/Codex builtin image generation',
                '--review-status=candidate', '--license=CC-BY-4.0', '--prompt=' + str(prompt), '--dry-run']
        proc = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
        (OWN / f'{short}.import-dry-run.actual.stdout.txt').write_text(proc.stdout)
        (OWN / f'{short}.import-dry-run.actual.stderr.txt').write_text(proc.stderr)
        calls.append({'argv': argv, 'exitCode': proc.returncode, 'dryRun': True})
        assert proc.returncode == 0, proc.stderr
    else:
        assert va[goal]['decision'] == 'KEEP'
        assert vb[goal]['independentV_BDecision'] == 'KEEP'
        row['pendingIndependentMachineV'] = False
        row['currentDecisionState'] = 'UNCHANGED_EXACT_PNG_WITH_VALID_PRIOR_INDEPENDENT_A_B_KEEP; NOT_ACTIVE_APPROVAL'
    rows.append(row)
assert canon_path.read_bytes() == canon_before
write('seven-exact-assets-four-targeted-current-corrections.raw-v2-review-input.json', {
 'schemaVersion': 1, 'documentType': 'inert raw current seven PNG input with only four targeted corrections',
 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'rows': rows,
 'currentCanonical': bind(canon_path), 'strictReport': raw['strictReport'],
 'actualCurrent479WholeAndSevenFullDEENRead': True,
 'currentActiveOriginal21CopiesExact': True, 'priorWhole70AndV_A32V_B26ActuallyVerified': verified,
 'threeUnchangedPNGsReuseExactIndependentKEEP': True, 'fourNewPNGsIndependentReviewsPending': True,
 'provider': 'ChatGPT/Codex builtin image generation', 'exposedModelId': None,
 'friendlyComicLandscapeFormat': True, 'nativeSizeDecision': 'Use near16:9 native1672x941 instead of unnecessary resizing. Actual360/680 candidate review pending.',
 'activeWrites': False, 'newScientificStrictClosures': 0, 'restoredStrictClosures': 0, 'strictNetGain': 0,
 'newHumanApproval': False, 'newHumanTrial': False})
write('four-existing-import-helper-dry-runs.actual.receipt.json', {
 'documentType': 'actual current importer four PNG dry-runs', 'calls': calls,
 'actualAllFourExitZero': True, 'actualCurrentCanonicalBytesBeforeAfterExact': True,
 'nativeAssetsImported': False, 'newMachineApproval': False})
print(json.dumps({'currentWholeGoals': len(current), 'reviewRows': len(rows), 'newPNGReviewRows': len(attempts), 'threeValidKEEPsReused': True, 'actualDryRunExitCodes': [x['exitCode'] for x in calls], 'strictNetGain': 0}))
