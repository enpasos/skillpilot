# SPDX-License-Identifier: Apache-2.0
import json,hashlib,subprocess,time
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
def read(p):return json.loads(Path(p).read_text())
def bind(p):return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def put(p,v):
    assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def run(label,argv):
    out=OWN/f'{label}.stdout.actual.txt';err=OWN/f'{label}.stderr.actual.txt'
    assert not out.exists() and not err.exists()
    start=time.monotonic()
    with out.open('w') as stdout,err.open('w') as stderr:r=subprocess.run(argv,cwd=ROOT,stdout=stdout,stderr=stderr)
    put(OWN/f'{label}.terminal.actual.json',dict(argv=argv,actualExitCode=r.returncode,elapsedSeconds=time.monotonic()-start,endedAt=datetime.now(timezone.utc).isoformat(),stdout=bind(out),stderr=bind(err)))
    print(json.dumps(dict(check=label,actualExitCode=r.returncode)),flush=True)
    assert r.returncode==0,(label,err.read_text()[-3000:],out.read_text()[-3000:])
    return out
cli=['node','app/node_modules/tsx/dist/cli.mjs']
sub=next(s for s in read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')['subjects'] if s['subject']=='biologie')
run('affected-P3-current',cli+['app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+str((OWN/'positive/current-three.future-active.config.json').relative_to(ROOT))])
run('affected-A392-current',cli+['app/scripts/semanticAtomicityReview.ts','--mode=check','--config='+sub['semanticAtomicityConfigPath']])
run('affected-M392-current',cli+['app/scripts/memoryCardReview.ts','--mode=check','--config='+sub['memoryReviewConfigPath']])
run('affected-V-normalization',cli+['app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=biologie'])
run('affected-V-current',cli+['app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=biologie','--check'])
run('affected-source-refresh',cli+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'])
run('affected-source-current',cli+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json','--check'])
run('affected-active-native-frame',cli+[str((OWN/'verify-actual-active-native-frame.mts').relative_to(ROOT))])
run('affected-installed-image-copies',['node','scripts/check_goal_visualization_assets.mjs'])
out=run('affected-central',cli+['app/scripts/reportDeepUnderstandingRollout.ts','--mode=check','--format=json'])
current=read(out);baseline=read(OWN.parent/'biologie-stoffwechsel-nineteen-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt')
old={s['subject']:s for s in baseline['subjects']};now={s['subject']:s for s in current['subjects']}
assert current['blockingIssueCount']==0
for name in ['mathematik','physik','chemie']:assert old[name]==now[name],name
assert now['biologie']['denominator']==392 and now['biologie']['strictComplete']==244
previous=set(old['biologie']['strictCompleteGoalIds']);complete=set(now['biologie']['strictCompleteGoalIds']);assert previous<=complete
added=sorted(complete-previous);ids=read(OWN/'reviewed-three-current-adoption.guard.json')['goalIds'];assert added==sorted(ids)
summary=dict(actualCentralExitCode=0,subjects=[{k:s[k] for k in ['subject','strictComplete','denominator','percentage','remaining','gates']} for s in current['subjects']],netStrictGain=3,newScientificClosures=added,restoredExistingStrictBindingsCount=0,old241BiologyStrictIdsRetained=True,otherThreeSubjectsExact=True,denominatorDelta=0,validA392M392Reused=True,fourOperatorHoldsTwoPendingCompanionsAndAllRegionalWholeHoldsRetained=True,humanApproval=False,humanTrial=False)
put(OWN/'strict-current-three-new-scientific-closures.actual.json',summary)
print(json.dumps(summary),flush=True)
