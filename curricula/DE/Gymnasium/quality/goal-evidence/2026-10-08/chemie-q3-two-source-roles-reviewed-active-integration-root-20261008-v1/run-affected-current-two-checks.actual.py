# SPDX-License-Identifier: Apache-2.0
import json, hashlib, subprocess, time
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path.cwd(); OWN=Path(__file__).resolve().parent
TECH=OWN.parent/'chemie-q3-two-source-roles-reviewed-integration-preparation-technical-20261008-v1'
def read(p): return json.loads(Path(p).read_text())
def bind(p): return dict(path=str(p.relative_to(ROOT)), sha256=hashlib.sha256(p.read_bytes()).hexdigest(), bytes=p.stat().st_size)
def put(p,v):
    assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def run(label,argv):
    out=OWN/f'{label}.stdout.actual.txt';err=OWN/f'{label}.stderr.actual.txt'
    assert not out.exists() and not err.exists()
    start=time.monotonic()
    with out.open('w') as stdout,err.open('w') as stderr:
        result=subprocess.run(argv,cwd=ROOT,stdout=stdout,stderr=stderr)
    put(OWN/f'{label}.terminal.actual.json',dict(argv=argv,actualExitCode=result.returncode,elapsedSeconds=time.monotonic()-start,endedAt=datetime.now(timezone.utc).isoformat(),stdout=bind(out),stderr=bind(err)))
    print(json.dumps(dict(check=label,actualExitCode=result.returncode)),flush=True)
    assert result.returncode==0,(label,err.read_text()[-3000:],out.read_text()[-3000:])
    return out
cli=['node','app/node_modules/tsx/dist/cli.mjs']
run('affected-P2-current',cli+['app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+str((TECH/'positive/current-two.future-active.config.json').relative_to(ROOT))])
run('affected-A2-current',cli+['app/scripts/semanticAtomicityReview.ts','--mode=check','--config='+str((TECH/'atomicity/current-two.future-active.config.json').relative_to(ROOT))])
subject=next(s for s in read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')['subjects'] if s['subject']=='chemie')
run('affected-M378-current',cli+['app/scripts/memoryCardReview.ts','--mode=check','--config='+subject['memoryReviewConfigPath']])
run('affected-V-normalization',cli+['app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=chemie'])
run('affected-V-current',cli+['app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=chemie','--check'])
run('affected-source-refresh',cli+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'])
run('affected-source-current',cli+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','--check'])
run('affected-active-native-frame',cli+[str((OWN/'verify-actual-active-native-frame.mts').relative_to(ROOT))])
run('affected-installed-image-copies',['node','scripts/check_goal_visualization_assets.mjs'])
out=run('affected-central',cli+['app/scripts/reportDeepUnderstandingRollout.ts','--mode=check','--format=json'])
current=read(out);baseline=read(TECH/'before/current-central175-222.actual.json')
old={s['subject']:s for s in baseline['subjects']};now={s['subject']:s for s in current['subjects']}
assert current['blockingIssueCount']==0
for name in ['mathematik','physik','biologie']: assert old[name]==now[name],name
assert now['chemie']['denominator']==378 and now['chemie']['strictComplete']==177
previous=set(old['chemie']['strictCompleteGoalIds']);complete=set(now['chemie']['strictCompleteGoalIds'])
assert previous<=complete
added=sorted(complete-previous)
assert added==sorted(['d9cce642-4f89-57f8-832a-abeb62586195','3eada74b-25b8-55dc-811a-acb473196f53'])
summary=dict(actualCentralExitCode=0,subjects=[{k:s[k] for k in ['subject','strictComplete','denominator','percentage','remaining','gates']} for s in current['subjects']],netStrictGain=2,newScientificClosures=added,restoredExistingStrictBindingsCount=0,old175ChemStrictIdsRetained=True,otherThreeSubjectsExact=True,denominatorDelta=0,sourceWholeHoldsRetained=16,humanApproval=False,humanTrial=False)
put(OWN/'strict-current-two-new-scientific-closures.actual.json',summary)
print(json.dumps(summary),flush=True)
