from pathlib import Path
import datetime
import hashlib
import importlib.util
import json
import shutil
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent / 'eleven-existing-foreign-KEEP-physical-input-restoration-v1'
OUT.mkdir(exist_ok=False)
BASE = ROOT / 'curricula/DE/Gymnasium/quality'
GENERIC = BASE / 'goal-visualization-review/wirtschaft-by-ten-specific-illustrations-independent-B-20261009-v1/actual-ten-selection-seven-originalKEEP-three-targeted-correctionKEEP.receipt.json'
CONTRACT = BASE / 'goal-evidence/2026-10-09/wirtschaft-contract-types-one-independent-B-20261009-v1/actual-independent-479-native-360-680-image.review.receipt.json'
QA_PATH = BASE / 'goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10/candidate-qa311.current403.inert.json'


def binding(p):
    p = Path(p)
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'wholeBytes': len(raw)}


def write(name, obj):
    p = OUT / name
    assert not p.exists()
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return binding(p)


generic = json.loads(GENERIC.read_bytes())
contract = json.loads(CONTRACT.read_bytes())
qa = {r['goalId']: r for r in json.loads(QA_PATH.read_bytes())['records']}
selected = [{'goalId': row['goalId'], 'asset': row['asset'], 'prompt': row['actualPrompt'], 'independentReceipt': row['independentReceipt'], 'selection': row['selection']} for row in generic['records']]
selected.append({'goalId': contract['goalId'], 'asset': contract['asset'], 'prompt': contract['actualPrompt'], 'independentReceipt': binding(CONTRACT), 'selection': 'unchanged foreign independent contract479 PNG KEEP'})
assert len(selected) == 11
planned = []
source_guards = [binding(GENERIC), binding(CONTRACT), binding(QA_PATH)]
for row in selected:
    gid = row['goalId']
    png = ROOT / row['asset']['path']
    prompt = ROOT / row['prompt']['path']
    source = binding(png)
    prompt_source = binding(prompt)
    assert source['sha256'] == row['asset']['sha256'].removeprefix('sha256:')
    assert prompt_source['sha256'] == row['prompt']['sha256'].removeprefix('sha256:')
    assert qa[gid]['assetSha256'] == qa[gid]['aiApprovedAssetSha256'] == 'sha256:' + source['sha256']
    assert qa[gid]['aiApproved'] == 'yes'
    raw = png.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n' and raw[12:16] == b'IHDR'
    width, height = struct.unpack('>II', raw[16:24])
    source_guards += [source, prompt_source, binding(ROOT / row['independentReceipt']['path'])]
    targets = [ROOT / qa[gid]['canonicalAssetPath'], ROOT / qa[gid]['publicAssetPath'], ROOT / 'backend/src/main/resources/static/assets/goal-visualizations/wirtschaftswissenschaften' / gid / (gid + '.png')]
    canonical_prompt = targets[0].parent / 'prompt.de.md'
    pairs = [(png, target, 'PNG canonical/public/optional backend exact mirror') for target in targets] + [(prompt, canonical_prompt, 'whole original actual provider prompt exact bytes')]
    before = []
    for src, target, role in pairs:
        assert not target.is_symlink(), target
        if target.exists():
            assert binding(target)['sha256'] == binding(src)['sha256'], ('Existing different target must remain untouched', target)
        before.append({'path': str(target.relative_to(ROOT)), 'beforeExists': target.exists(), 'before': binding(target) if target.exists() else None, 'source': binding(src), 'role': role})
    planned.append({'goalId': gid, 'wholeQualifiedQARow': qa[gid], 'independentVisualDecisionSource': row['independentReceipt'], 'selectedAsset': source, 'actualProviderPrompt': prompt_source, 'realPNGDimensions': [width, height], 'selectedFormat': 'PNG exact prior approved format retained', 'selection': row['selection'], 'targets': before})
write('actual-eleven-assets-and-prompts-before-whole-target-and-input.guard.json', {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'captureTiming': 'After exact foreign KEEP/image/prompt inputs read, before physical copies.', 'inputFiles': source_guards, 'planned': planned})

after = []
for row in planned:
    restored = []
    for target in row['targets']:
        src = ROOT / target['source']['path']
        dst = ROOT / target['path']
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists():
            shutil.copyfile(src, dst)
        actual = binding(dst)
        assert actual['sha256'] == target['source']['sha256'] and actual['wholeBytes'] == target['source']['wholeBytes']
        restored.append({**target, 'after': actual, 'action': 'KEEP exact existing bytes' if target['beforeExists'] else 'copy exact independently reviewed input bytes'})
    after.append({**row, 'targets': restored})
for original in source_guards:
    assert binding(ROOT / original['path']) == original

required_committable = [t['path'] for row in planned for t in row['targets'] if t['path'].startswith('curricula/')]
check = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(required_committable) + '\n', capture_output=True, text=True, cwd=ROOT)
raw_check = check.stdout + check.stderr
(OUT / 'command-required-canonical-eleven-PNG-prompt-git-check-ignore.actual-output.txt').write_text(raw_check)
assert check.returncode == 1 and not check.stdout.strip(), 'Required canonical candidate input is ignored'
spec = importlib.util.spec_from_file_location('schema_check', ROOT / 'scripts/validate_schemas.py')
validation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validation)
symlink_errors = validation.curriculum_symlink_errors(str(ROOT))
assert not symlink_errors, symlink_errors
receipt = write('actual-final-eleven-existing-foreign-KEEP-PNG-prompt-standard-input-restoration.receipt.json', {
    'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'Authorized byte-exact physical input restoration only; no new image generation, visual/scientific judgment, QA overwrite or runtime code/deployment.',
    'scope': 'Ten exact selected Generic PNGs (seven original KEEP and three independently accepted corrections) plus one foreign KEEP479 PNG.',
    'assets': after, 'PNGCount': 11, 'originalProviderPromptCount': 11, 'canonicalPNGCopies': 11, 'publicPNGCopies': 11, 'optionalBackendMirrorCopies': 11,
    'requiredCanonicalPromptTargets': 11, 'requiredCanonicalInputCount': len(required_committable), 'requiredCanonicalInputIgnored': [], 'requiredCheckIgnoreActualExitCode': check.returncode,
    'repositoryCurriculumSymlinkErrors': symlink_errors, 'allSourceWholeBytesUnchanged': True, 'historicalSourceAndQABytesUnchanged': True,
    'newScientificReview': False, 'newVReviewOrApproval': False, 'humanApproval': False, 'strictNetGain': 0, 'source23BB2fab912Mutation': False,
    'canonicalGoalOrRegistryWrites': 0, 'copiedPNGReencode': False, 'copiedPromptRewriting': False,
    'runtimeCopiesAreLocalGeneratedMirrors': True, 'publicationOrDeployment': False,
})
print(json.dumps({'receipt': receipt, 'PNG11': 11, 'prompt11': 11, 'targetWholeFileCopies': 44, 'ignoredRequired': 0, 'curriculumSymlinkErrors': 0}, indent=2))
