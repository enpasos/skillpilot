"""Run original native checks and record their actual results, without new reviews."""
import concurrent.futures
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

PACKAGE = Path(__file__).resolve().parent
ROOT = PACKAGE.parents[6]
NODE = Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
TSX = str(ROOT / 'app/node_modules/tsx/dist/cli.mjs')
ENV = dict(os.environ)
ENV['PATH'] = str(Path(NODE).parent) + ':/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin:' + ENV['PATH']
ENV['LD_LIBRARY_PATH'] = '/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu:' + ENV.get('LD_LIBRARY_PATH', '')
ENV['FONTCONFIG_FILE'] = '/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf'
ENV['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH'] = '/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def run(label, argv):
    log = PACKAGE / f'actual-native-{label}.raw.txt'
    receipt = PACKAGE / f'actual-native-{label}.command-receipt.json'
    assert not log.exists() and not receipt.exists(), 'Preserve prior actual command evidence'
    started = now()
    monotonic = time.monotonic()
    with log.open('wb') as output:
        completed = subprocess.run(argv, cwd=ROOT, env=ENV, stdout=output, stderr=subprocess.STDOUT)
    result = dict(label=label, actualArgv=argv, actualCwd=str(ROOT), startedAt=started,
                  completedAt=now(), elapsedSeconds=round(time.monotonic()-monotonic, 3),
                  exitCode=completed.returncode, status='PASS' if completed.returncode == 0 else 'FAIL',
                  rawLog=dict(path=str(log.relative_to(ROOT)), bytes=log.stat().st_size,
                              sha256='sha256:' + hashlib.sha256(log.read_bytes()).hexdigest()),
                  scope='Original native check; no new scientific review or human approval')
    receipt.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(dict(label=label, status=result['status'], exitCode=completed.returncode,
                          elapsedSeconds=result['elapsedSeconds'], log=result['rawLog']['path'])), flush=True)
    return result

def native(script, *args):
    return [NODE, TSX, str(ROOT/'app/scripts'/script), *args]

phase = sys.argv[1]
if phase == 'bindings':
    tasks = [(f'positive-{p.name[:2]}', native('positiveGoalEvidenceReview.ts', '--config='+str(p.relative_to(ROOT)), '--mode=check'))
             for p in sorted((PACKAGE/'positive-configs').glob('*.config.json'))]
    assert len(tasks) == 6
    tasks += [
        ('economics-QA-freshness', native('generateGoalVisualizationQaLedgers.ts', '--check', '--subject=wirtschaftswissenschaften')),
        ('economics-QA-approval-coverage', native('checkGoalVisualizationQaApprovalCoverage.ts', '--subject=wirtschaftswissenschaften')),
    ]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(lambda task: run(*task), tasks))
elif phase == 'status':
    results = [run('central-current-generation', native('generateCurriculumQualityStatus.ts'))]
    if results[-1]['exitCode'] == 0:
        tasks = [
            ('central-current-freshness', native('generateCurriculumQualityStatus.ts', '--check')),
            ('protected-maturity-floors', ['npm','--prefix','app','run','check:curriculum-maturity-floors']),
            ('current-five-gate-report', native('reportDeepUnderstandingRollout.ts', '--format=json')),
        ]
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            results += list(executor.map(lambda task: run(*task), tasks))
elif phase == 'books':
    results = [run('economics-book-model', native('buildGoalBookModel.ts', 'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'))]
    if results[-1]['exitCode'] == 0:
        results.append(run('stable-five-book-publications', ['npm','--prefix','app','run','build:goal-books']))
    if all(r['exitCode'] == 0 for r in results):
        tasks = [
            ('five-book-original-source-freshness', ['npm','--prefix','app','run','check:goal-book-original-sources']),
            ('five-book-publication-check', ['npm','--prefix','app','run','check:goal-book-publication']),
        ]
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            results += list(executor.map(lambda task: run(*task), tasks))
else:
    raise SystemExit('Expected bindings, status, or books')

summary = PACKAGE / f'actual-native-{phase}.phase-receipt.json'
assert not summary.exists()
summary.write_text(json.dumps(dict(recordedAt=now(), phase=phase, results=results,
                    status='PASS' if all(r['exitCode'] == 0 for r in results) else 'FAIL',
                    m7CompletionClaim=False, humanApprovalClaim=False), ensure_ascii=False, indent=2)+'\n')
sys.exit(0 if all(r['exitCode'] == 0 for r in results) else 1)
