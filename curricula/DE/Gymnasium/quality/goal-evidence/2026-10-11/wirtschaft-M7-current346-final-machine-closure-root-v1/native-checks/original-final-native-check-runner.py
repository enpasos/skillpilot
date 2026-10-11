import concurrent.futures
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path('/tmp/skillpilot-economics-M7-final-root-checks-20261011')
OUT.mkdir(exist_ok=True)
NODE = Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
ENV = dict(os.environ)
ENV['PATH'] = str(Path(NODE).parent) + ':/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin:' + ENV['PATH']
ENV['LD_LIBRARY_PATH'] = '/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu:' + ENV.get('LD_LIBRARY_PATH','')
ENV['FONTCONFIG_FILE'] = '/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf'
ENV['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH'] = '/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'

def run(label, argv):
    log = OUT / (label+'.raw.txt')
    receipt = OUT / (label+'.command-receipt.json')
    assert not log.exists() and not receipt.exists()
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    t = time.monotonic()
    with log.open('wb') as f:
        done = subprocess.run(argv,cwd=ROOT,env=ENV,stdout=f,stderr=subprocess.STDOUT)
    result = {'label':label,'actualArgv':argv,'actualCwd':str(ROOT),'startedAt':started,
        'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':done.returncode,
        'status':'PASS' if done.returncode==0 else 'FAIL',
        'rawLog':{'path':str(log),'sha256':'sha256:'+hashlib.sha256(log.read_bytes()).hexdigest(),'bytes':log.stat().st_size},
        'scientificReviewOrHumanApprovalClaim':False}
    receipt.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    assert json.loads(receipt.read_text()) == result
    print(json.dumps({k:result[k] for k in ('label','status','exitCode','elapsedSeconds')}),flush=True)
    if done.returncode: print(log.read_text()[-5000:],flush=True)
    return result

def native(script,*args):
    return [NODE,str(ROOT/'app/node_modules/tsx/dist/cli.mjs'),str(ROOT/'app/scripts'/script),*args]

phase = sys.argv[1]
if phase == 'schema':
    results = [run('full-curriculum-schema',['python','scripts/validate_schemas.py'])]
    if results[-1]['exitCode']==0:
        results.append(run('all-current-goal-UUIDs',['python','scripts/validate_goal_ids_uuid.py']))
elif phase == 'central':
    results = [run('central-current346-generation',native('generateCurriculumQualityStatus.ts'))]
    if results[-1]['exitCode']==0:
        current = json.loads((ROOT/'docs/qa-ci/status/curriculum-quality-status.json').read_text())
        economics = next(x for x in current['curricula'] if x['subject']=='Wirtschaftswissenschaften')
        rule = next(x for x in economics['rules'] if x['id']=='CQR-303')
        assert economics['maturity']=='M7' and rule['status']=='pass', (economics['maturity'],rule)
        for subject in ('Mathematik','Physik'):
            protected = next(x for x in current['curricula'] if x['subject']==subject)
            assert protected['maturity']=='M7'
            assert next(x for x in protected['rules'] if x['id']=='CQR-303')['status']=='pass'
        before = json.loads((ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-current267-plus-qualified-contexts-stable-integration-root-v1/actual-central-current291.EXACT.json').read_text())
        assert [x for x in before['curricula'] if x['subject']!='Wirtschaftswissenschaften']==[x for x in current['curricula'] if x['subject']!='Wirtschaftswissenschaften']
        print(json.dumps({'actualCentralEconomics':'M7','CQR303':'pass','MathPhysics':'M7','foreignRowsWholeExact':20,'generatedAt':current['generatedAt']}),flush=True)
        # Only the completed Economics floor advances; all existing foreign policies remain exact.
        policy_path=ROOT/'app/scripts/config/curriculum-maturity-floor-policy.json'
        policy=json.loads(policy_path.read_text())
        econ_floor=next(x for x in policy['floors'] if x['subject']=='Wirtschaftswissenschaften')
        assert econ_floor['minimumMaturity']=='M6'
        econ_floor['minimumMaturity']='M7'
        econ_floor['reason']='Economics M7 reached on 11 October 2026: every current curricularAtomic goal has strict current D/P/A/M/V closure, all required native checks pass, and CQR-303 passes in the actual central report. The established M6 core and memory requirements remain mandatory. Human review, release and trial gates are separate.'
        policy_path.write_text(json.dumps(policy,ensure_ascii=False,indent=2)+'\n')
        assert json.loads(policy_path.read_text())==policy
        tasks=[('central-current346-freshness',native('generateCurriculumQualityStatus.ts','--check')),
               ('protected-maturity-floors-including-economics-M7',['npm','--prefix','app','run','check:curriculum-maturity-floors']),
               ('final-current-full-five-gate-report',native('reportDeepUnderstandingRollout.ts','--format=json'))]
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            results += list(executor.map(lambda x:run(*x),tasks))
elif phase == 'application':
    results = [run('integrated-application-build',['npm','--prefix','app','run','build:application'])]
elif phase == 'docs':
    tasks=[('documentation-links',['npm','--prefix','app','run','check:docs-links']),
           ('documentation-indexes',['npm','--prefix','app','run','check:docs-indexes']),
           ('generated-status-registry',['npm','--prefix','app','run','check:generated-status-registry']),
           ('git-diff-whitespace',['git','diff','--check'])]
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        results=list(executor.map(lambda x:run(*x),tasks))
else:
    raise SystemExit('Expected schema, central, application or docs')
summary = OUT / (phase+'.phase-receipt.json')
assert not summary.exists()
summary.write_text(json.dumps({'phase':phase,'status':'PASS' if all(x['exitCode']==0 for x in results) else 'FAIL','results':results},ensure_ascii=False,indent=2)+'\n')
raise SystemExit(0 if all(x['exitCode']==0 for x in results) else 1)
