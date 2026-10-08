import concurrent.futures
import datetime
import json
from pathlib import Path
import subprocess
import time

ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file() and (p / 'app').is_dir() and (p / 'curricula').is_dir())
OUT = Path(__file__).resolve().parent
TECH = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-split-four-reviewed-integration-preparation-technical-20261008-v1'
plan = json.loads((TECH / 'ready-root-reviewed-guarded-integration-plan.portable-v3.technical.json').read_text())

def run(i, argv):
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    t = time.monotonic()
    stdout = OUT / f'affected-check-{i}.stdout.actual.txt'
    stderr = OUT / f'affected-check-{i}.stderr.actual.txt'
    terminal = OUT / f'affected-check-{i}.terminal.actual.json'
    assert not terminal.exists()
    with stdout.open('w') as o, stderr.open('w') as e:
        actual = subprocess.run(argv, cwd=ROOT, stdout=o, stderr=e)
    data = {'argv': argv, 'actualExitCode': actual.returncode, 'startedAtUTC': started, 'finishedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'elapsedSeconds': time.monotonic()-t, 'stdout': str(stdout.relative_to(ROOT)), 'stderr': str(stderr.relative_to(ROOT)), 'humanApproval': False}
    terminal.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'check': i, 'actualExitCode': actual.returncode, 'elapsedSeconds': data['elapsedSeconds']}), flush=True)
    return actual.returncode

for i in range(4):
    assert run(i, plan['mustRunAfterApply'][i]['argv']) == 0
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    futures = [pool.submit(run, i, plan['mustRunAfterApply'][i]['argv']) for i in range(4, 9)]
    exits = [f.result() for f in futures]
assert exits == [0]*5, exits
old = json.loads((OUT / 'before/curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json').read_text())
new = json.loads((ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json').read_text())
og, ng = ({r['goalId']: r for r in x['records']} for x in [old, new])
parent = plan['oldStableParentId']
selected = set(plan['selectedGoalIds'])
assert len(ng) == 392
assert sum(g != parent and g not in selected for g in og) == 388
assert all(ng[g] == r for g, r in og.items() if g != parent and g not in selected)
assert all({k:v for k,v in ng[g].items() if k.startswith('human')} == {k:v for k,v in r.items() if k.startswith('human')} for g,r in og.items() if g != parent)
(OUT / 'ordinary-active-QA388-rows-and390-human-fields-exact.actual.json').write_text(json.dumps({'actualOrdinaryGeneratorAndCheckExitCodes': [0,0], 'actual392Rows': len(ng), 'other388WholeRowsExact': True, 'retained390HumanFieldsExact': True, 'humanApproval': False}, indent=2)+'\n')
argv = ['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/reportDeepUnderstandingRollout.ts','--mode=check','--format=json']
assert run('central', argv) == 0
report = json.loads((OUT / 'affected-check-central.stdout.actual.txt').read_text())
baseline = json.loads((ROOT / plan['baselineCentralReport']['path']).read_text())
before = {s['subject']:s for s in baseline['subjects']}
after = {s['subject']:s for s in report['subjects']}
for s in ['mathematik','physik','chemie']:
    assert after[s] == before[s], s
b, a = before['biologie'], after['biologie']
assert set(b['strictCompleteGoalIds']).issubset(a['strictCompleteGoalIds'])
newids = set(a['strictCompleteGoalIds']) - set(b['strictCompleteGoalIds'])
assert newids == set(plan['newChildGoalIds']), newids
assert a['strictComplete'] == 204 and a['denominator'] == 392
actual = {'actualCentralExitCode':0, 'subjects':[{k:s[k] for k in ['subject','strictComplete','denominator','percentage','remaining','gates']} for s in report['subjects']], 'netStrictGain':2, 'newScientificClosures': sorted(newids), 'restoredExistingStrictBindingsCount':0, 'retained202BiologyStrictIdsExact':True, 'otherThreeSubjectObjectsExact':True, 'denominatorDelta':1, 'humanApproval':False, 'humanTrial':False}
(OUT / 'strict-current-two-new-scientific-closures.actual.json').write_text(json.dumps(actual, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(actual, ensure_ascii=False),flush=True)
