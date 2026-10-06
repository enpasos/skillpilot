#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);ISO=ROOT/'tmp/chemie-q1-seven-reviewed-integration-candidate-v3-native-root'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def run(name,args):
 start=datetime.now(timezone.utc).isoformat();p=subprocess.run(['app/node_modules/.bin/tsx',*args],cwd=ISO,capture_output=True);out=OWN/(name+'.stdout.txt');err=OWN/(name+'.stderr.txt');out.write_bytes(p.stdout);err.write_bytes(p.stderr);r={'command':['app/node_modules/.bin/tsx',*args],'cwd':str(ISO),'startedAtUTC':start,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':p.returncode,'stdoutPath':str(out.relative_to(ROOT)),'stdoutSHA256':sha(out),'stderrPath':str(err.relative_to(ROOT)),'stderrSHA256':sha(err),'activeWrites':0,'humanApproval':False,'humanTrial':False};write(OWN/(name+'.actual.receipt.json'),r);print(json.dumps({'name':name,'exitCode':p.returncode,'stdout':p.stdout.decode()[:1600],'stderr':p.stderr.decode()[:2000]}),flush=True);return p,r
for src in OWN.rglob('*'):
 if src.is_file():dst=ISO/src.relative_to(ROOT);dst.parent.mkdir(parents=True,exist_ok=True);assert not dst.is_symlink();shutil.copy2(src,dst)
p,r=run('safe-current-source-atlas-generate',['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']);assert p.returncode==0
p,r=run('safe-current-entire-page-and-source-check',[str(REL/'verify-safe-entire-current-pages.mts')])
for name in ['native-safe-seven-entire-current-page-comparison.actual.json','native-safe-current-source-atlas.original-sources.json','native-safe-current-full.book-model.json','native-safe-current-full-source-selection.actual.json']:
 src=ISO/REL/name
 if src.is_file():json.loads(src.read_text());shutil.copy2(src,OWN/name)
assert p.returncode==0
plan=json.loads((OWN/'integration-plan.json').read_text())
for row in plan['explicitFutureDeltaFiles']:
 if '/source-views/de-gym-chemistry-national-atlas/' in row['futureActivePath'] or row['futureActivePath'].endswith(('de-gym-chemistry-national-atlas.sources.json','de-gym-chemistry-national-atlas.view.json')):
  src=ISO/row['futureActivePath'];shutil.copy2(src,ROOT/row['prospectiveCopyPath']);row['sha256']=sha(src)
write(OWN/'integration-plan.json',plan)
p,r=run('safe-current-source-atlas-check',['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','--check']);assert p.returncode==0
p,r=run('safe-future-chemie-central',['app/scripts/reportDeepUnderstandingRollout.ts',f'--config={REL}/central-chemie-future.config.json','--mode=check','--format=json'])
if p.stdout:
 try:
  report=json.loads(p.stdout);write(OWN/'safe-future-chemie-central.report.json',report);subject=report['subjects'][0];print(json.dumps({k:subject[k] for k in ['subject','strictComplete','denominator','gates','issues','requiredChecks']},ensure_ascii=False),flush=True)
 except ValueError:raise
assert p.returncode==0
