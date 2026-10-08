# SPDX-License-Identifier: Apache-2.0
"""Ordinary affected checks in a disposable local capsule; no live writes."""
import copy, hashlib, json, shutil, subprocess, time
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
CAP = ROOT/'tmp/biologie-basis2-reviewed394-resumed-20261008-v1-capsule'
def read(p): return json.loads(Path(p).read_text())
def put(p,v):
    p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def bind(p):
    p=Path(p);return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
guard=read(OWN/'reviewed-basis2-current-adoption.guard.json')
for v in guard['before'].values():
    assert bind(ROOT/v['active']['path'])==v['active']
for v in guard['candidate'].values(): assert bind(ROOT/v['path'])==v
assert not CAP.exists();CAP.mkdir(parents=True)
source=read(ROOT/guard['candidate']['sourceInputs']['path'])
own_rel=OWN.relative_to(ROOT)
mutations={v['active']['path'] for v in guard['before'].values() if v['active']['path'].endswith('.json')}
mutations|={v['destination'] for v in guard['imageInstalls']}
mutations|={source['outputDirectory'],source['manifestPath'],source['navigationViewPath']}
mutations|={'app/scripts','tmp','backend/src/main/resources/static/assets/goal-visualizations/biologie'}
mutations.add(str(own_rel))
def fork(src,dest,rel):
    if rel==str(own_rel):
        dest.mkdir()
        for p in src.iterdir():
            if p.name=='verify-current-capsule-whole-page-frame.technical.mts': shutil.copyfile(p,dest/p.name)
            elif p.name=='checks':
                (dest/'checks').mkdir()
                for q in p.iterdir(): (dest/'checks'/q.name).symlink_to(q)
            else: (dest/p.name).symlink_to(p,target_is_directory=p.is_dir())
        return
    if rel==source['outputDirectory']:
        shutil.copytree(src,dest);return
    if rel=='app/scripts':
        dest.mkdir()
        for p in src.iterdir():
            if p.is_file() and p.suffix in {'.ts','.mts','.js','.mjs','.cjs'}:
                shutil.copyfile(p,dest/p.name)
            else: fork(p,dest/p.name,rel+'/'+p.name)
        return
    changed=[p for p in mutations if p==rel or p.startswith(rel+'/')]
    if rel=='tmp': dest.mkdir();return
    if not changed:
        dest.symlink_to(src,target_is_directory=src.is_dir());return
    if src.is_dir():
        dest.mkdir()
        for p in src.iterdir(): fork(p,dest/p.name,rel+'/'+p.name)
    else:
        dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
for p in ROOT.iterdir():
    if p.name=='.git': continue
    fork(p,CAP/p.name,p.name)
for label,v in guard['candidate'].items():
    target=CAP/guard['before'][label]['active']['path']
    assert not target.is_symlink();shutil.copyfile(ROOT/v['path'],target)
for v in guard['imageInstalls']:
    target=CAP/v['destination'];target.parent.mkdir(parents=True,exist_ok=True);assert not target.exists()
    shutil.copyfile(ROOT/v['source']['path'],target)
# The prepared directory is linked read-only as evidence except the genuine whole-frame
# checker, whose new own-folder technical report is intentional and never an active file.
# Place a regular copy at the original relative depth so its existing API imports resolve locally.
capsule_own=CAP/own_rel
assert capsule_own.is_dir() and not capsule_own.is_symlink()

def run(label,argv):
    out=OWN/'checks'/f'{label}.stdout.actual.txt';err=OWN/'checks'/f'{label}.stderr.actual.txt'
    assert not out.exists() and not err.exists()
    start=time.monotonic()
    with out.open('w') as stdout,err.open('w') as stderr: r=subprocess.run(argv,cwd=CAP,stdout=stdout,stderr=stderr)
    put(OWN/'checks'/f'{label}.terminal.actual.json',dict(argv=argv,ordinaryCapsuleRelativeRoot=str(CAP.relative_to(ROOT)),actualExitCode=r.returncode,elapsedSeconds=time.monotonic()-start,endedAtUtc=datetime.now(timezone.utc).isoformat(),stdout=bind(out),stderr=bind(err),activeWrites=0))
    print(json.dumps(dict(check=label,actualExitCode=r.returncode)),flush=True)
    assert r.returncode==0,(label,err.read_text()[-3000:],out.read_text()[-3000:])
    return out
cli=['node','app/node_modules/tsx/dist/cli.mjs']
run('affected-source-refresh',cli+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',guard['before']['sourceInputs']['active']['path']])
run('affected-source-current',cli+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',guard['before']['sourceInputs']['active']['path'],'--check'])
run('affected-P2',cli+['app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+str((own_rel/'positive/P2.future-active.config.json'))])
run('affected-A394',cli+['app/scripts/semanticAtomicityReview.ts','--mode=check','--config='+str((own_rel/'atomicity-memory/A394.future-active.config.json'))])
run('affected-M394',cli+['app/scripts/memoryCardReview.ts','--mode=check','--config='+str((own_rel/'atomicity-memory/M394.future-active.config.json'))])
run('affected-V394-freshness',cli+['app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=biologie','--check'])
run('affected-whole394-native-frame',cli+[str(own_rel/'verify-current-capsule-whole-page-frame.technical.mts')])
copy_frame=capsule_own/'checks/capsule-actual-whole394-page-frame.json'
assert not (OWN/'checks/capsule-actual-whole394-page-frame.json').exists()
shutil.copyfile(copy_frame,OWN/'checks/capsule-actual-whole394-page-frame.json')
reg=read(CAP/guard['before']['registry']['active']['path'])
reg['subjects']=[s for s in reg['subjects'] if s['subject']=='biologie']
capcfg=CAP/'tmp/bio-only-affected-central.config.json';put(capcfg,reg)
out=run('affected-central-biology-only',cli+['app/scripts/reportDeepUnderstandingRollout.ts','--mode=check','--format=json','--config=tmp/bio-only-affected-central.config.json'])
report=read(out);bio=report['subjects'][0];assert report['blockingIssueCount']==0
baseline=read(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-first-three-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt')
old=next(s for s in baseline['subjects'] if s['subject']=='biologie')
old_ids=set(old['strictCompleteGoalIds']);new_ids=set(bio['strictCompleteGoalIds'])
assert old['strictComplete']==244 and old_ids<=new_ids
added=sorted(new_ids-old_ids);assert added==sorted(guard['newGoalIds'])
assert (bio['strictComplete'],bio['denominator'])==(246,394)
put(OWN/'checks/strict-affected-capsule-biology246-of394.actual.json',dict(ordinaryCentralAffectedSubjectOnly=True,actualCentralExitCode=0,actualBlockingIssues=0,strictComplete=246,denominator=394,netStrictGain=2,newScientificClosures=added,restoredExistingBindingGoalIds=[guard['contextSupersessionGoalId']],restoredExistingBindingNetGain=0,all244PreviousStrictIdsRetained=True,whole394FrameExact=True,currentActiveStrictCompleteStill244=True,currentActiveDenominatorStill392=True,sourceWholeAndFourOperatorHoldsRetained=True,otherThreeSubjectsRegistryExactNoFullCheckInThisPackage=True,activeWrites=0,humanApproval=False,humanTrial=False))
for v in guard['before'].values(): assert bind(ROOT/v['active']['path'])==v['active']
put(OWN/'checks/capsule-all-active-nine-bindings-unchanged.actual.json',dict(allNineActiveBeforeBindingsExactAfterCapsuleChecks=True,activeWrites=0,newScientificReviewByIntegrator=False,humanApproval=False))
print('PASS: isolated genuine reviewed Basis2 affected central 246/394; old244 exact; active244/392 untouched',flush=True)
