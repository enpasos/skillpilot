import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess
import time

repo = Path('.').resolve()
own_relative = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-rest26-source-role-independent-review-b-v1')
own = repo / own_relative
scratch = Path('/tmp/skillpilot-economics-M2-rest26-independent-B-capsule-root.txt').read_text().strip()
node = Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def run(mode):
    output = own / f'actual-final-{mode}-native-review.output.json'
    raw = own / f'actual-final-{mode}-native-review.raw.txt'
    command = [node, str(repo / 'app/node_modules/tsx/dist/cli.mjs'), str(own / 'review_current25_roles_and_subsumption.mts'), str(repo), str(Path(scratch) / mode), str(output), mode]
    started = time.time()
    result = subprocess.run(command, cwd=repo, capture_output=True, text=True)
    raw.write_text(result.stdout + result.stderr)
    receipt = {'command': ['pinned-node20', 'app/node_modules/tsx/dist/cli.mjs', str(own_relative / 'review_current25_roles_and_subsumption.mts'), 'REPOSITORY_ROOT', f'PRIVATE_CAPSULE_{mode}', str(own_relative / output.name), mode], 'actualNativeProcessExitCode': result.returncode, 'elapsedSeconds': round(time.time() - started, 3), 'actualRawOutput': {'path': str(own_relative / raw.name), 'sha256': sha(raw)}, 'nativePredicatesModified': False, 'productionSourceSHA256': sha(repo / 'app/scripts/generateCurriculumQualityStatus.ts')}
    if output.exists():
        receipt['actualOutput'] = {'path': str(own_relative / output.name), 'sha256': sha(output)}
    (own / f'actual-final-{mode}-native-review.command-exit.json').write_text(json.dumps(receipt, indent=2) + '\n')
    return {'mode': mode, 'actualNativeProcessExitCode': result.returncode, 'stdout': result.stdout[-1600:], 'stderr': result.stderr[-2400:]}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    for result in executor.map(run, ['pending', 'accepted', 'wrong-anchor', '764-retarget']):
        print(json.dumps(result))
