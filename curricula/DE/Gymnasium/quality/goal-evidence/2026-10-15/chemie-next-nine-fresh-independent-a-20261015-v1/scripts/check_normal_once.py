import datetime
import json
import pathlib
import subprocess
import sys

repo = pathlib.Path(sys.argv[1]).resolve()
lane = sys.argv[2]
own = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-next-nine-fresh-independent-a-20261015-v1')
out = repo / own
host = repo / 'tmp/chemie-m7-resumed-20261015/next-nine-independent-a-normal-stock-host-v1'
settings = json.loads((out / 'normal/binding.inputs.json').read_text())
prefix = [str(repo / 'app/node_modules/.bin/tsx'), '--tsconfig', str(repo / 'app/tsconfig.app.json')]
commands = {
    'D9': prefix + [str(host / 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts'),
                    '--bundle', str(repo / settings['bundle']),
                    '--input', str(repo / settings['descriptionInput']),
                    '--campaign', str(repo / settings['campaign']),
                    '--batches-dir', str(repo / settings['batchesDirectory']),
                    '--results-dir', str(out / 'normal/D9')],
    'P6': prefix + [str(host / 'app/scripts/positiveGoalEvidenceReview.ts'),
                    '--config=' + str(own / 'normal/P6.config.json'), '--mode=check'],
    'A6-fingerprint-bind': prefix + [str(host / 'app/scripts/semanticAtomicityReview.ts'),
                    '--config=' + str(own / 'normal/A6.config.json'), '--write-fingerprints'],
    'A6': prefix + [str(host / 'app/scripts/semanticAtomicityReview.ts'),
                    '--config=' + str(own / 'normal/A6.config.json'), '--mode=check'],
}
if lane not in commands:
    raise SystemExit('Unknown targeted lane')
receipt_path = out / f'checks/{lane}.stock.actual.json'
if receipt_path.exists():
    raise SystemExit('Receipt already exists; preserve it and do not repeat this targeted check')
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
result = subprocess.run(commands[lane], cwd=host / 'app', capture_output=True)
completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
(out / f'checks/{lane}.stock.stdout.actual.txt').write_bytes(result.stdout)
(out / f'checks/{lane}.stock.stderr.actual.txt').write_bytes(result.stderr)
receipt = {
    'schemaVersion': 1,
    'role': 'Actual single targeted stock invocation receipt; no scientific acceptance claim',
    'lane': lane,
    'argv': commands[lane],
    'cwd': str(host / 'app'),
    'startedAtUTC': started,
    'completedAtUTC': completed,
    'exitCode': result.returncode,
    'stockModuleUnmodified': True,
    'newNativeBuild': False,
    'sourceOrHumanOrM7Approval': False,
    'activeWrites': False,
    'gitWrites': False,
}
receipt_path.write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'lane': lane, 'exitCode': result.returncode, 'receipt': str(receipt_path.relative_to(repo))}))
print(result.stdout.decode('utf-8', errors='replace'))
if result.stderr:
    print(result.stderr.decode('utf-8', errors='replace'), file=sys.stderr)
raise SystemExit(result.returncode)
