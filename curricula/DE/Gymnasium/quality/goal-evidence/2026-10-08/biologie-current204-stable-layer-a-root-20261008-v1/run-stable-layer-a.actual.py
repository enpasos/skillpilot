# SPDX-License-Identifier: Apache-2.0
"""Capture the ordinary stable204 dependent checks and measured Layer-A refresh."""
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
EXPECTED='82e0a67ecd7a1b765336349b66eb60279f91ea67a169c8667a08c93e5d68137d'
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
phase=sys.argv[1]
if phase=='prepare':
 central=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-split-reviewed-active-integration-root-v1/affected-check-central.stdout.actual.txt';report=read(central)
 assert report['blockingIssueCount']==0 and [(s['strictComplete'],s['denominator']) for s in report['subjects']]==[(807,807),(478,478),(173,378),(204,392)]
 write('stable204-current-strict-inputs.actual.json',{'centralReport':bind(central),'canonical':bind(CANON),'maturityFloors':bind(ROOT/'app/scripts/config/curriculum-maturity-floor-policy.json'),'machineOnly':True})
 ip=ROOT/'docs/legal/ai-transparency-inventory.json';before=read(ip);write('inventory-before.exact.json',before)
 r=run('ordinary-inventory-measured-layer-a-patch',['node','scripts/check_ai_transparency_inventory.mjs','--emit-layer-a-patch']);assert r.returncode==0,r.stderr
 after=json.loads('\n'.join(line[1:] for line in r.stdout.splitlines() if line.startswith('+')))
 def diff(a,b,prefix=''):
  if isinstance(a,dict) and isinstance(b,dict):
   changes=[]
   for k in sorted(set(a)|set(b)):
    p=prefix+'.'+k if prefix else k
    changes.extend([p] if k not in a or k not in b else diff(a[k],b[k],p))
   return changes
  return [] if a==b else [prefix]
 changed=diff(before,after)
 allowed={'goalVisualizations.canonicalGoalCount','goalVisualizations.count','goalVisualizations.fileExtensions.png','goalVisualizations.providerCounts','goalVisualizations.c2paStructure.detected','goalVisualizations.c2paStructure.notDetectedUrls'}
 assert all(f.startswith('artifactClasses.') and any(f.removeprefix('artifactClasses.')==k or f.removeprefix('artifactClasses.').startswith(k+'.') for k in allowed) for f in changed),changed
 a=before['artifactClasses']['goalVisualizations'];b=after['artifactClasses']['goalVisualizations']
 assert a['count']==1883 and b['count']==1913 and b['fileExtensions']['png']-a['fileExtensions']['png']==30
 assert b['canonicalGoalCount']-a['canonicalGoalCount']==2 and b['canonicalLandscapeFiles']==a['canonicalLandscapeFiles']
 assert b['fileExtensions']['jpg']==a['fileExtensions']['jpg']
 write('actual-measured-layer-a-delta-before-apply.json',{'onlyMeasuredOrdinaryLayerAFields':changed,'goalVisualizationsBefore':1883,'goalVisualizationsAfter':1913,'canonicalGoalCountDelta':2,'pngDelta':30,'policiesRightsHistoricalReleasesAndHumanApprovalsUnchanged':True,'emitterActualExitCode':0,'humanApproval':False})
 ip.write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n');write('inventory-after.exact.json',read(ip))
 assert run('ordinary-current-memory-report-all',['npm','--prefix','app','run','quality:memory-card-review:report:all']).returncode==0
 assert run('ordinary-current-status-regeneration',['npm','--prefix','app','run','quality:curriculum-status']).returncode==0
 assert run('nine-protected-maturity-floors',['npm','--prefix','app','run','check:curriculum-maturity-floors']).returncode==0
elif phase=='remaining':
 checks=[('ordinary-inventory-check',['node','scripts/check_ai_transparency_inventory.mjs']),('full-validate-schemas',['python','scripts/validate_schemas.py']),('portable-symlink-regression',['python','scripts/test_validate_schemas_symlinks.py']),('ordinary-committable-symlink-check',['python','-c',"import sys,json;sys.path.insert(0,'scripts');import validate_schemas;e=validate_schemas.curriculum_symlink_errors();print(json.dumps({'errorCount':len(e),'errors':e}));sys.exit(bool(e))"])]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(lambda x:run(*x),checks))
 assert all(r.returncode==0 for r in results),[(a,r.returncode) for (a,_),r in zip(checks,results)]
elif phase=='build':
 assert run('stable204-full-application-build',['npm','--prefix','app','run','build:application']).returncode==0
 assert run('built-local-ai-transparency-artifact',['node','scripts/verify_ai_transparency_artifact.mjs','backend/src/main/resources/static']).returncode==0
else:raise ValueError(phase)
