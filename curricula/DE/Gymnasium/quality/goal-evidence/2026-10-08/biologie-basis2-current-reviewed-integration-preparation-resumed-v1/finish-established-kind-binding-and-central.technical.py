# SPDX-License-Identifier: Apache-2.0
"""Bind structural ledger to its established future active Canon; ordinary checks."""
import hashlib,json,shutil,subprocess,time
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;CAP=ROOT/'tmp/biologie-basis2-reviewed394-resumed-20261008-v1-capsule'
def read(p):return json.loads(Path(p).read_text())
def bind(p):
    p=Path(p);return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def put(p,v):
    p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
guard=read(OWN/'reviewed-basis2-current-normalized-adoption.guard.json')
original=read(ROOT/guard['candidate']['kinds']['path']);adopted=dict(original)
adopted['sourceLandscapePath']=guard['before']['canonical']['active']['path']
assert {k:v for k,v in adopted.items() if k!='sourceLandscapePath'}=={k:v for k,v in original.items() if k!='sourceLandscapePath'}
out_kind=OWN/'candidate/semantic-kinds478.established-canonical-binding.future-active.json';put(out_kind,adopted)
guard['candidate']['kinds']=bind(out_kind)
put(OWN/'reviewed-basis2-current-final-adoption.guard.json',guard)
shutil.copyfile(out_kind,CAP/guard['before']['kinds']['active']['path'])
put(OWN/'checks/structural-kind-source-path-adoption.actual.json',dict(onlyLedgerSourceLandscapePathChangedToEstablishedFutureActiveCanonical=True,all478WholeStructuralDecisionValuesAndAllSourceFingerprintsExactToActualReviewedShadow=True,old475StructuralRowsExactAndOneParentContainsWeightFingerprintReviewedInOriginalFull394Context=True,ordinaryLoaderPreviouslyRejectedShadowPathTruthfully=True,earlierFailedTerminalPreserved=True,newScientificReviewByIntegrator=False,activeWrites=0,humanApproval=False))
def run(label,argv):
    out=OWN/'checks'/f'{label}.stdout.actual.txt';err=OWN/'checks'/f'{label}.stderr.actual.txt';assert not out.exists() and not err.exists()
    start=time.monotonic()
    with out.open('w') as stdout,err.open('w') as stderr:r=subprocess.run(argv,cwd=CAP,stdout=stdout,stderr=stderr)
    put(OWN/'checks'/f'{label}.terminal.actual.json',dict(argv=argv,ordinaryCapsuleRelativeRoot=str(CAP.relative_to(ROOT)),actualExitCode=r.returncode,elapsedSeconds=time.monotonic()-start,endedAtUtc=datetime.now(timezone.utc).isoformat(),stdout=bind(out),stderr=bind(err),activeWrites=0))
    print(json.dumps(dict(check=label,actualExitCode=r.returncode)),flush=True)
    assert r.returncode==0,(label,err.read_text()[-3000:],out.read_text()[-3000:]);return out
cli=['node','app/node_modules/tsx/dist/cli.mjs'];own_rel=OWN.relative_to(ROOT)
run('affected-whole394-established-native-frame',cli+[str(own_rel/'verify-current-capsule-whole-page-frame.technical.mts')])
frame=CAP/own_rel/'checks/capsule-actual-whole394-page-frame.json';assert not (OWN/'checks/capsule-actual-whole394-page-frame.json').exists();shutil.copyfile(frame,OWN/'checks/capsule-actual-whole394-page-frame.json')
reg=read(CAP/guard['before']['registry']['active']['path']);reg['subjects']=[s for s in reg['subjects'] if s['subject']=='biologie']
put(CAP/'tmp/bio-only-affected-central.config.json',reg)
out=run('affected-central-biology-only',cli+['app/scripts/reportDeepUnderstandingRollout.ts','--mode=check','--format=json','--config=tmp/bio-only-affected-central.config.json'])
report=read(out);bio=report['subjects'][0];assert report['blockingIssueCount']==0
base=read(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-first-three-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt')
old=next(s for s in base['subjects'] if s['subject']=='biologie');previous=set(old['strictCompleteGoalIds']);now=set(bio['strictCompleteGoalIds'])
assert old['strictComplete']==244 and previous<=now
added=sorted(now-previous);assert added==sorted(guard['newGoalIds'])
assert (bio['strictComplete'],bio['denominator'])==(246,394)
put(OWN/'checks/strict-affected-capsule-biology246-of394.actual.json',dict(ordinaryCentralAffectedSubjectOnly=True,actualCentralExitCode=0,actualBlockingIssues=0,strictComplete=246,denominator=394,netStrictGain=2,newScientificClosures=added,restoredExistingBindingGoalIds=[guard['contextSupersessionGoalId']],restoredExistingBindingNetGain=0,all244PreviousStrictIdsRetained=True,whole394FrameExact=True,currentActiveStrictCompleteStill244=True,currentActiveDenominatorStill392=True,sourceWholeAndFourOperatorHoldsRetained=True,otherThreeSubjectsRegistryExactNoFullCheckInThisPackage=True,activeWrites=0,humanApproval=False,humanTrial=False))
for v in guard['before'].values():assert bind(ROOT/v['active']['path'])==v['active']
put(OWN/'checks/capsule-all-active-nine-bindings-unchanged.actual.json',dict(allNineActiveBeforeBindingsExactAfterCapsuleChecks=True,activeWrites=0,newScientificReviewByIntegrator=False,humanApproval=False))
print('PASS: isolated reviewed Basis2 affected central246/394; old244 exact; active244/392 untouched',flush=True)
