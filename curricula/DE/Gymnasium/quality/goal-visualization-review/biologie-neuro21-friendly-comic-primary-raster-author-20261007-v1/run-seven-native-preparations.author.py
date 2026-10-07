#!/usr/bin/env python3
"""Execute unmodified native prepare; writes only its normal tmp packages and own receipts."""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess
OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[5]
RAW = OUT / 'current21-whole-goals-materials-source-bound-image-plans.author.raw.json'
plan = json.loads(RAW.read_text())
source = ROOT / plan['inputs'][0]['path']
canonical = json.loads(source.read_text())['candidateCanonical']['path']
native = OUT / 'first-seven/native-prepare-after-actual-initial-generation'
native.mkdir(parents=True, exist_ok=True)
helper = ROOT / 'scripts/prepare_goal_visualization.mjs'
common = ROOT / 'scripts/goal_visualization_common.mjs'
before = hashlib.sha256((ROOT / canonical).read_bytes()).hexdigest()
runs = []
for gid in plan['firstSevenOrder']:
    args = ['npm', '--prefix', 'app', 'run', 'visualization:prepare', '--', gid,
        '--landscape=' + canonical, '--subject=biologie', '--lang=de',
        '--provider=OpenAI / ChatGPT-Codex image generation', '--review-status=pilot']
    start = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(args, cwd=ROOT, capture_output=True, text=True)
    finish = datetime.datetime.now(datetime.timezone.utc).isoformat()
    folder = native / gid
    folder.mkdir(exist_ok=True)
    (folder / 'native-prepare.actual.stdout.txt').write_text(result.stdout)
    (folder / 'native-prepare.actual.stderr.txt').write_text(result.stderr)
    if result.returncode:
        raise RuntimeError(f'Native prepare failed for {gid}: {result.stderr}')
    for name in ['metadata.json', 'nano-banana-prompt.de.md']:
        shutil.copyfile(ROOT / 'tmp/goal-visualizations' / gid / name, folder / name)
    metadata = json.loads((folder / 'metadata.json').read_text())
    assert metadata['provider'] == 'OpenAI / ChatGPT-Codex image generation'
    current_goal = next(p['wholeStage02CandidateGoal'] for p in plan['plans'] if p['goalId'] == gid)
    assert metadata['description'] == current_goal['description']
    runs.append({'goalId': gid, 'argv': args, 'cwd': str(ROOT), 'startedAt': start,
        'finishedAt': finish, 'exitCode': result.returncode, 'nativeMetadata': metadata})
after = hashlib.sha256((ROOT / canonical).read_bytes()).hexdigest()
assert before == after
receipt = {'role': 'image author native preparation; not independent review',
    'actualNativePrepareCount': 7, 'canonicalPath': canonical,
    'candidateCanonicalSha256Before': before, 'candidateCanonicalSha256After': after,
    'productionPrepareHelperSha256': hashlib.sha256(helper.read_bytes()).hexdigest(),
    'productionCommonHelperSha256': hashlib.sha256(common.read_bytes()).hexdigest(),
    'actualChronology': 'The first seven initial generations, one pump correction and two typography corrections occurred before this native preparation. No date was backfilled. Preparation was completed before the remaining targeted edits and all imports/dry-runs.',
    'workflowDeviation': 'AGENTS.md requires prepare before manual/tool generation; this author did not do that before the ten actual early builtin calls. Those unchanged original outputs remain retained, with actual times and prompts. This is a workflow/provenance correction, not scientific approval or a claim that previously generated artwork is faulty merely from sequencing.',
    'activeWrites': False, 'onlyNormalTmpPrepareAndOwnReceiptWrites': True, 'runs': runs}
(native / 'seven-native-preparations.actual.receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'nativePrepareExit0': len(runs), 'actualCanonicalUnchanged': before == after}))
