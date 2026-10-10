from pathlib import Path
import datetime
import json
import subprocess
import time

OUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-original-seven-plus-current-fcc-one-dual-resolution-technical-20261010-v1')
CHECKS = OUT / 'checks'
CHECKS.mkdir(exist_ok=True)
groups = json.loads((OUT / 'native-groups.technical.json').read_text())
runs = []
for group in groups:
    config = group['configPath']
    synthesis = str(OUT / group['group'] / 'synthesis-decisions.json')
    commands = [
        ('prepared-check', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'check', '--config', config]),
        ('dual-summary-check', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'summarize', '--config', config]),
        ('resolution-materialize', ['app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', config, '--synthesis-manifest', synthesis, '--write']),
        ('resolution-check', ['app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', config, '--synthesis-manifest', synthesis]),
        ('resolution-index-materialize', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', config, '--write']),
        ('resolution-index-check', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', config]),
    ]
    for label, args in commands:
        command = ['./app/node_modules/.bin/tsx'] + args
        started = time.monotonic()
        result = subprocess.run(command, text=True, capture_output=True)
        log = CHECKS / f"{group['group']}.{label}.actual.log.txt"
        log.write_text(result.stdout + result.stderr)
        runs.append({'group': group['group'], 'check': label, 'command': command,
                     'exitCode': result.returncode, 'durationSeconds': round(time.monotonic() - started, 3), 'logPath': str(log)})
        (CHECKS / 'normal-terminal-results.actual.json').write_text(json.dumps({
            'schemaVersion': 1, 'performedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'normalCheckersUnchanged': True, 'runs': runs,
        }, ensure_ascii=False, indent=2) + '\n')
        print(group['group'], label, 'PASS' if result.returncode == 0 else 'FAIL', result.stdout.strip(), result.stderr.strip(), flush=True)
        if result.returncode:
            raise SystemExit(result.returncode)
print('PASS all12 normal terminals; original7strict+1genuinehistoricaldefer and current1strict; no active writes', flush=True)
