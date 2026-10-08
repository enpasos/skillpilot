# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import concurrent.futures
import datetime
import json
import subprocess
import time

ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file() and (p / 'app').is_dir())
OUT = Path(__file__).resolve().parent
TSX = ['node', 'app/node_modules/tsx/dist/cli.mjs']

def run(name, argv):
    terminal = OUT / ('affected-' + name + '.terminal.actual.json')
    assert not terminal.exists()
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    t = time.monotonic()
    stdout, stderr = [OUT / ('affected-' + name + '.' + stream + '.actual.txt') for stream in ['stdout', 'stderr']]
    with stdout.open('w') as o, stderr.open('w') as e:
        result = subprocess.run(argv, cwd=ROOT, stdout=o, stderr=e)
    data = {'argv': argv, 'actualExitCode': result.returncode, 'startedAtUTC': started, 'finishedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'elapsedSeconds': time.monotonic() - t, 'stdout': str(stdout.relative_to(ROOT)), 'stderr': str(stderr.relative_to(ROOT)), 'humanApproval': False}
    terminal.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'check': name, 'actualExitCode': result.returncode, 'elapsedSeconds': data['elapsedSeconds']}), flush=True)
    return result.returncode


for name in ['source-generation','source-current','V-normalization','V-current','A392','M392','installed-image-copies']:
    terminal=json.loads((OUT/('affected-'+name+'.terminal.actual.json')).read_text())
    assert terminal['actualExitCode']==0, name
assert json.loads((OUT/'actual-active392-book-and-preserved204-bindings.technical.json').read_text())['all204PreviousStrictWholePagesAndFingerprintsExact']
assert run('P18-current-v2', TSX + ['app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+str((OUT/'positive/P18.paired-machine-current392.current-binding-v2.config.json').relative_to(ROOT))])==0
old = json.loads((OUT / 'before/curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json').read_text())
current = json.loads((ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json').read_text())
selected = set(json.loads((OUT.parent / 'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1/neutral-eighteen-current-raster-native-author-review.entry.json').read_text())['goalIds'])
old_by, current_by = [{r['goalId']: r for r in x['records']} for x in [old, current]]
assert len(current_by) == 392
assert all(current_by[g] == r for g, r in old_by.items() if g not in selected)
assert all({k: v for k, v in current_by[g].items() if k.startswith('human')} == {k: v for k, v in r.items() if k.startswith('human')} for g, r in old_by.items())
assert run('central', TSX + ['app/scripts/reportDeepUnderstandingRollout.ts', '--mode=check', '--format=json']) == 0
report = json.loads((OUT / 'affected-central.stdout.actual.txt').read_text())
before = json.loads((OUT.parent / 'biologie-he9-split-reviewed-active-integration-root-v1/affected-check-central.stdout.actual.txt').read_text())
before_by, after_by = [{r['subject']: r for r in x['subjects']} for x in [before, report]]
for s in ['mathematik', 'physik', 'chemie']:
    assert before_by[s] == after_by[s], s
b, a = before_by['biologie'], after_by['biologie']
assert set(b['strictCompleteGoalIds']).issubset(a['strictCompleteGoalIds'])
gain = set(a['strictCompleteGoalIds']) - set(b['strictCompleteGoalIds'])
assert gain == selected, (gain, selected)
assert a['strictComplete'] == 222 and a['denominator'] == 392
actual = {'actualCentralExitCode': 0, 'subjects': [{k: r[k] for k in ['subject', 'strictComplete', 'denominator', 'percentage', 'remaining', 'gates']} for r in report['subjects']], 'netStrictGain': 18, 'newScientificClosures': sorted(gain), 'restoredExistingStrictBindingsCount': 0, 'retained204StrictIds': True, 'otherThreeSubjectsExact': True, 'other374WholeQARowsAnd392HumanFieldsExact': True, 'denominatorDelta': 0, 'noHistoricalReviewRestart': True, 'humanApproval': False, 'humanTrial': False}
(OUT / 'strict-current-eighteen-new-scientific-closures.actual.json').write_text(json.dumps(actual, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(actual, ensure_ascii=False), flush=True)
