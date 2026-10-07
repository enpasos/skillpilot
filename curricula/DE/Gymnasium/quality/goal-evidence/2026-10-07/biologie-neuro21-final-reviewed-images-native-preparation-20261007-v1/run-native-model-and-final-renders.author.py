# SPDX-License-Identifier: Apache-2.0
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
NATIVE = OUT / 'isolated-repository'
operations = []

def run(name, argv):
    start = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
    terminal = OUT / 'terminal' / 'native-model-and-render'
    terminal.mkdir(parents=True, exist_ok=True)
    stdout, stderr = terminal / (name + '.stdout.txt'), terminal / (name + '.stderr.txt')
    stdout.write_text(result.stdout); stderr.write_text(result.stderr)
    receipt = {'role':'actual native technical author execution','name':name,'argv':argv,'cwd':str(ROOT),
               'startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':result.returncode,
               'stdout':stdout.relative_to(ROOT).as_posix(),'stderr':stderr.relative_to(ROOT).as_posix(),
               'activeWrites':False,'newScientificApproval':False}
    (terminal / (name + '.receipt.json')).write_text(json.dumps(receipt,indent=2)+'\n')
    operations.append(receipt)
    print(json.dumps({'name':name,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr}),flush=True)
    if result.returncode:
        raise RuntimeError(name + ' failed')

run('native-final-model-attempt-03', [str(ROOT/'app/node_modules/.bin/tsx'), str(OUT/'build-final-native-model-and-binding-inputs.author.mts')])
for name in ['twenty','one']:
    bundle = OUT / ('native-final-' + name)
    run('native-final-' + name + '-html-pdf', [str(ROOT/'app/node_modules/.bin/tsx'), str(ROOT/'app/scripts/renderGoalBook.ts'),
        '--model',str(bundle/'book-model.json'), '--feedback-base-url','https://skillpilot.com/lernziel-feedback',
        '--public-root',str(NATIVE/'app/public'), '--html',str(bundle/'book.html'), '--pdf',str(bundle/'book.pdf'),
        '--print-derivative-profile','bounded-atlas'])
(OUT/'actual-native-model-and-final-render-operations.author.receipt.json').write_text(json.dumps({
    'role':'technical author final native model and 20+1 image-bearing HTML/PDF rendering',
    'successfulFull390ModelBuilds':1,'earlierModelParseFailureRetained':'native-model-attempt-01.actual-failure.author.json',
    'nativeRendersPerSubset':{'html':1,'pdf':1},'operations':operations,'activeWrites':False,'generatorInvoked':False,
    'globalBuildsOrTests':False,'newIndependentApproval':False,'humanApproval':False,'humanTrial':False,'strictGain':0},indent=2)+'\n')
