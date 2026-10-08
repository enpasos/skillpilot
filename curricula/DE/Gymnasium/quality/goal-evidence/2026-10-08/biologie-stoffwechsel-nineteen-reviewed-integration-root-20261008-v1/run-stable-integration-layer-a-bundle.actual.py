# SPDX-License-Identifier: Apache-2.0
"""Bundle dependent reports, schema validation and the application build at this stable integration."""
import hashlib,json,subprocess,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
def read(p):return json.loads(Path(p).read_text())
def bind(p):return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def put(p,v):
    assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def run(label,argv):
    out=OWN/f'{label}.stdout.actual.txt';err=OWN/f'{label}.stderr.actual.txt';assert not out.exists() and not err.exists()
    start=time.monotonic()
    with out.open('w') as stdout,err.open('w') as stderr:r=subprocess.run(argv,cwd=ROOT,stdout=stdout,stderr=stderr)
    result=dict(argv=argv,actualExitCode=r.returncode,elapsedSeconds=time.monotonic()-start,endedAt=datetime.now(timezone.utc).isoformat(),stdout=bind(out),stderr=bind(err))
    put(OWN/f'{label}.terminal.actual.json',result)
    print(json.dumps(dict(check=label,actualExitCode=r.returncode,elapsedSeconds=result['elapsedSeconds'])),flush=True)
    assert r.returncode==0,(label,out.read_text()[-3000:],err.read_text()[-3000:])
    return result
central=read(OWN/'affected-central.stdout.actual.txt')
assert read(OWN/'affected-central.terminal.actual.json')['actualExitCode']==0 and central['blockingIssueCount']==0
subjects={s['subject']:s for s in central['subjects']}
assert [(subjects[s]['strictComplete'],subjects[s]['denominator']) for s in ['mathematik','physik','chemie','biologie']]==[(807,807),(478,478),(177,378),(241,392)]
cli=['node','app/node_modules/tsx/dist/cli.mjs'];checks=[]
registry=read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
for name in ['chemie','biologie']:
    config=next(s['memoryReviewConfigPath'] for s in registry['subjects'] if s['subject']==name)
    checks.append(run('stable-memory-report-'+name,cli+['app/scripts/memoryCardReview.ts','--write-report','--config='+config]))
checks.append(run('stable-curriculum-status',cli+['app/scripts/generateCurriculumQualityStatus.ts']))
checks.append(run('stable-protected-maturity-floors',cli+['app/scripts/checkCurriculumMaturityFloors.ts']))
checks.append(run('stable-ai-inventory',['node','scripts/check_ai_transparency_inventory.mjs']))
checks.append(run('stable-full-validate-schemas',['python3','scripts/validate_schemas.py']))
checks.append(run('stable-full-application-build',['npm','--prefix','app','run','build:application']))
checks.append(run('stable-diff-whitespace',['git','diff','--check']))
put(OWN/'stable-integration-layer-a-bundle.actual.json',dict(finishedAt=datetime.now(timezone.utc).isoformat(),central=bind(OWN/'affected-central.stdout.actual.txt'),checks=checks,allTerminalExitCodesZero=True,subjects=[{k:s[k] for k in ['subject','strictComplete','denominator','percentage','remaining']} for s in central['subjects']],fullM7GoalStillOpen=True,humanReleaseGatesUnchanged=True,humanApproval=False,humanTrial=False,noCommitPushDeploymentOrPublication=True))
print(json.dumps(dict(stableLayerABundle='PASS',checks=len(checks),fullM7GoalStillOpen=True)),flush=True)
