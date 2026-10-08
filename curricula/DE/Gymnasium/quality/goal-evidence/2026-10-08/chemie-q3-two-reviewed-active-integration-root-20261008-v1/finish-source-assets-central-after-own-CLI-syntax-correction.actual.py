# SPDX-License-Identifier: Apache-2.0
import json,hashlib,subprocess,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;TECH=OWN.parent/'chemie-q3-two-reviewed-integration-preparation-technical-20261008-v1'
def read(p):return json.loads(Path(p).read_text())
def bind(p):p=Path(p);return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def write(p,x):assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def run(label,argv):
 out=OWN/f'{label}.stdout.actual.txt';err=OWN/f'{label}.stderr.actual.txt';assert not out.exists() and not err.exists();start=time.monotonic()
 with out.open('w') as stdout,err.open('w') as stderr:r=subprocess.run(argv,cwd=ROOT,stdout=stdout,stderr=stderr)
 result=dict(label=label,argv=argv,actualExitCode=r.returncode,elapsedSeconds=time.monotonic()-start,endedAt=datetime.now(timezone.utc).isoformat(),stdout=bind(out),stderr=bind(err));write(OWN/f'{label}.terminal.actual.json',result);print(json.dumps(dict(check=label,actualExitCode=r.returncode,elapsedSeconds=result['elapsedSeconds'])),flush=True)
 assert r.returncode==0,(label,err.read_text()[-4000:],out.read_text()[-4000:]);return out
cli=['node','app/node_modules/tsx/dist/cli.mjs'];cfg=lambda p:str(p.relative_to(ROOT))
run('affected-source-current-v2',cli+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','--check'])
run('affected-installed-image-copies',['node','scripts/check_goal_visualization_assets.mjs'])
out=run('affected-central',cli+['app/scripts/reportDeepUnderstandingRollout.ts','--mode=check','--format=json'])
current=read(out);baseline=read(OWN.parent/'biologie-he-evolution-eighteen-reviewed-integration-preparation-root-20261008-v1/affected-central.stdout.actual.txt');old={s['subject']:s for s in baseline['subjects']};now={s['subject']:s for s in current['subjects']};assert current['blockingIssueCount']==0
for subject in ['mathematik','physik','biologie']:assert old[subject]==now[subject],subject
c=now['chemie'];b=old['chemie'];assert c['denominator']==b['denominator']==378;assert c['strictComplete']==175;oldids=set(b['strictCompleteGoalIds']);newids=set(c['strictCompleteGoalIds']);assert oldids<=newids;added=sorted(newids-oldids);assert added==sorted(['9f0d6d4c-f918-5a44-a9a2-7732c4e338f3','c95f6059-d7c2-5bcd-b61e-95e3577efdb2'])
summary=dict(actualCentralExitCode=0,subjects=[dict(subject=s['subject'],strictComplete=s['strictComplete'],denominator=s['denominator'],percentage=s['percentage'],remaining=s['remaining'],gates=s['gates']) for s in current['subjects']],netStrictGain=2,newScientificClosures=added,restoredExistingStrictBindingsCount=0,retained173ChemStrictIds=True,otherThreeSubjectsExact=True,denominatorDelta=0,existing201ADecisionsRetainedWithGenuineTwoNew=True,goodOriginal15JPEGKEEP=True,historicalFaulty16JPEGExactRetainedAllThreeRoots=True,all379RawQAHumanFieldsRetained=True,allOther18SourceHoldsRetained=True,noHistoricalReviewRestart=True,humanApproval=False,humanTrial=False)
write(OWN/'strict-current-two-new-scientific-closures.actual.json',summary);print(json.dumps(summary),flush=True)
