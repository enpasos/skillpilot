"""Run only the three authorized original native input-bundle operations."""
from pathlib import Path
import datetime, json, os, subprocess

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
REL = str(OUT.relative_to(ROOT))
NODE = Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
ENV = os.environ.copy()
ENV['PATH'] = str(Path(NODE).parent) + ':/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin:' + ENV['PATH']
ENV['LD_LIBRARY_PATH'] = '/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu:' + ENV.get('LD_LIBRARY_PATH', '')
ENV['FONTCONFIG_FILE'] = '/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf'
ENV['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH'] = '/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'
def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()
def execute(label, command):
    start = now()
    result = subprocess.run(command, cwd=ROOT, env=ENV, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    raw = OUT / (label + '.raw.txt')
    with raw.open('x') as target:
        target.write(result.stdout)
    receipt = {'label': label, 'startedAtUtc': start, 'finishedAtUtc': now(), 'cwd': '.',
               'commandArgv': command, 'exitCode': result.returncode,
               'rawLog': str(raw.relative_to(ROOT)), 'activeWrites': 0, 'descriptionVerdicts': 0}
    with (OUT / (label + '.command-receipt.json')).open('x') as target:
        target.write(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'label': label, 'exitCode': result.returncode, 'rawLog': receipt['rawLog']}), flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)

assert not (OUT / 'native').exists(), 'Do not overwrite an existing native bundle'
execute('00-current-native-input-guards', ['python3', REL + '/capture-native-ten-input-bindings.READONLY.py'])
tsx = [NODE, 'app/node_modules/tsx/dist/cli.mjs']
execute('01-native-current-full346-base-selected10-context', tsx + [REL + '/capture-native-full346-base-selected10-context.AUTHOR-INERT.mts', REL])
native = tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts']
config = REL + '/ten-current-new-goals.native-batch.config.json'
execute('02-native-ten-new-goals-prepare', native + ['prepare', '--config', config])
execute('03-native-ten-new-goals-check', native + ['check', '--config', config])
