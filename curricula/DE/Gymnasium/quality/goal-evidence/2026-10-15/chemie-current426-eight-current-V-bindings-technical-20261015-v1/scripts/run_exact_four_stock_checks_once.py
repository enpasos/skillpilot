# SPDX-License-Identifier: Apache-2.0
"""Exactly one QA generation, freshness, coverage and full426 stock predicate call."""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess

REPO=Path.cwd(); OWN=Path(__file__).resolve().parents[1]
plan=json.loads((OWN/'INPUTS.frozen-original-eight-V-and-three-link-authors.json').read_text())
HOST=REPO/plan['executionHost']; checks=OWN/'checks'; checks.mkdir(exist_ok=True)
assert not (checks/'RUN.once-four-stock-actions.receipt.json').exists()
def ref(p):
    b=p.read_bytes(); return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
records=[]
def run(label,args):
    started=datetime.datetime.now(datetime.timezone.utc).isoformat()
    result=subprocess.run(args,cwd=REPO,text=True,capture_output=True)
    stdout=checks/(label+'.stdout.txt');stderr=checks/(label+'.stderr.txt')
    assert not stdout.exists() and not stderr.exists()
    stdout.write_text(result.stdout);stderr.write_text(result.stderr)
    receipt={'action':label,'argv':args,'cwd':'.','startedAtUTC':started,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
             'exitCode':result.returncode,'stdout':ref(stdout),'stderr':ref(stderr)}
    p=checks/(label+'.receipt.json');p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');records.append(ref(p))
    print(json.dumps({'action':label,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr}),flush=True)
    return result.returncode
tsx=str(HOST/'app/node_modules/tsx/dist/cli.mjs')
gen=str(HOST/'app/scripts/generateGoalVisualizationQaLedgers.ts')
rc=run('01-QA443-stock-generation',['node',tsx,gen,'--subject=chemie'])
if rc!=0: raise SystemExit('Generation failed once; stop and diagnose exact receipt.')
final=REPO/plan['finalQAOutputPath'];assert not final.exists();shutil.copyfile(HOST/plan['normalQAPath'],final)
run('02-QA443-stock-freshness',['node',tsx,gen,'--check','--subject=chemie'])
run('03-QA443-stock-approval-coverage',['node',tsx,str(HOST/'app/scripts/checkGoalVisualizationQaApprovalCoverage.ts'),'--subject=chemie'])
run('04-full426-stock-V-and-readonly-P077',['node',tsx,str(OWN/'scripts/check_exact_source426_V_and_readonly_077_P.mts'),str(OWN/'INPUTS.frozen-original-eight-V-and-three-link-authors.json'),str(checks/'FULL426.source-fingerprints-strict-V-and-readonly-P077.actual.json')])
(checks/'RUN.once-four-stock-actions.receipt.json').write_text(json.dumps({'schemaVersion':1,'actualActions':records,'exactlyOneCallEach':True,'newCentralNativeBuildOrGitCommands':0,'generatedQA':ref(final)},ensure_ascii=False,indent=2)+'\n')
