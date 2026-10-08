# SPDX-License-Identifier: Apache-2.0
"""Capture the ordinary stable-chem175-bio222 dependent checks and measured Layer-A refresh."""
from pathlib import Path
import concurrent.futures
import datetime
import hashlib
import json
import subprocess
import sys
import time

ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
CANON=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
EXPECTED='4ba55e4eccaf1892d4f541a0ef20eb0402170b1c6f2543e05ce7b00e30fa30a5'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(n,x):
 p=OUT/n
 with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
 return p
def run(label,argv):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 print('START '+label,flush=True)
 r=subprocess.run(argv,cwd=ROOT,capture_output=True,text=True)
 for k,v in [('stdout',r.stdout),('stderr',r.stderr)]:
  with (OUT/(label+'.'+k+'.actual.txt')).open('x') as f:f.write(v)
 write(label+'.terminal.actual.json',{'argv':argv,'startedAtUTC':start,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'elapsedSeconds':time.monotonic()-t,'stdout':bind(OUT/(label+'.stdout.actual.txt')),'stderr':bind(OUT/(label+'.stderr.actual.txt')),'actualStableBiologyCanonicalSha256':bind(CANON)['sha256'],'humanApproval':False})
 print('END '+label+' actualExitCode='+str(r.returncode),flush=True)
 return r
assert bind(CANON)['sha256']==EXPECTED

# Corrected from actual ordinary emitter results; old failed preparation remains immutable.
central=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-two-reviewed-active-integration-root-20261008-v1/affected-central.stdout.actual.txt'
report=read(central)
assert report['blockingIssueCount']==0 and [(s['strictComplete'],s['denominator']) for s in report['subjects']]==[(807,807),(478,478),(175,378),(222,392)]
ip=ROOT/'docs/legal/ai-transparency-inventory.json'
before=read(OUT/'inventory-before.exact.json');assert read(ip)==before
emitter=read(OUT/'ordinary-inventory-measured-layer-a-patch.terminal.actual.json');assert emitter['actualExitCode']==0
stdout=OUT/'ordinary-inventory-measured-layer-a-patch.stdout.actual.txt'
assert bind(stdout)==emitter['stdout']
after=json.loads('\n'.join(line[1:] for line in stdout.read_text().splitlines() if line.startswith('+')))
def diff(a,b,prefix=''):
 if isinstance(a,dict) and isinstance(b,dict):
  changes=[]
  for k in sorted(set(a)|set(b)):
   p=prefix+'.'+k if prefix else k
   changes.extend([p] if k not in a or k not in b else diff(a[k],b[k],p))
  return changes
 return [] if a==b else [prefix]
changed=diff(before,after)
expected={
 'artifactClasses.goalVisualizations.c2paStructure.detected',
 'artifactClasses.goalVisualizations.count',
 'artifactClasses.goalVisualizations.fileExtensions.jpg',
 'artifactClasses.goalVisualizations.fileExtensions.png',
 'artifactClasses.goalVisualizations.providerCounts.ChatGPT/Codex builtin image_gen',
 'artifactClasses.goalVisualizations.providerCounts.Google Gemini / Nano Banana Pro',
 'artifactClasses.goalVisualizations.providerCounts.OpenAI image_gen (Codex built-in)'}
assert set(changed)==expected,changed
a=before['artifactClasses']['goalVisualizations'];b=after['artifactClasses']['goalVisualizations']
assert (a['count'],b['count'])==(1913,1931)
assert b['fileExtensions']['png']-a['fileExtensions']['png']==19
assert b['fileExtensions']['jpg']-a['fileExtensions']['jpg']==-1
assert b['canonicalGoalCount']==a['canonicalGoalCount']==5920
assert b['canonicalLandscapeFiles']==a['canonicalLandscapeFiles']==21
oldJpg='chemie/c95f6059-d7c2-5bcd-b61e-95e3577efdb2/c95f6059-d7c2-5bcd-b61e-95e3577efdb2.jpg'
history=[bind(ROOT/base/oldJpg) for base in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']]
assert {x['sha256'] for x in history}=={'3d26d07d4c811667b3b5d619c14771172d811bb184ae4ea17b596ec96bb8a221'}
write('actual-measured-layer-a-delta-before-apply.v2.json',{'onlyMeasuredOrdinaryLayerAFields':changed,'goalVisualizationsBefore':1913,'goalVisualizationsAfter':1931,'canonicalGoalCountDelta':0,'pngDelta':19,'jpgDelta':-1,'explanation':'18 new primary evolution rasters plus one current Chemistry JPEG-to-PNG replacement; prior JPEG bytes retained in all three roots. Inventory counts current referenced primary visuals, not every historical file.','historicalJpgExactBindings':history,'emitterTerminal':bind(OUT/'ordinary-inventory-measured-layer-a-patch.terminal.actual.json'),'policiesRightsHistoricalReleasesAndHumanApprovalsUnchanged':True,'humanApproval':False})
ip.write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n')
write('inventory-after.exact.json',read(ip))
assert run('ordinary-current-memory-report-all',['npm','--prefix','app','run','quality:memory-card-review:report:all']).returncode==0
assert run('ordinary-current-status-regeneration',['npm','--prefix','app','run','quality:curriculum-status']).returncode==0
assert run('nine-protected-maturity-floors',['npm','--prefix','app','run','check:curriculum-maturity-floors']).returncode==0
