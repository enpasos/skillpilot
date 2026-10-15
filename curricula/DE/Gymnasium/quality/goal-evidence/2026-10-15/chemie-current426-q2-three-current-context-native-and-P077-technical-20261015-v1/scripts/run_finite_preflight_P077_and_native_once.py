# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime,hashlib,json,subprocess,sys,time
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1]
plan=json.loads((OWN/'INPUTS.final-six-stable-bodies-images-and-successor-material.json').read_text());HOST=REPO/plan['executionHost'];checks=OWN/'checks';checks.mkdir(exist_ok=True)
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def command(label,args):
 receipt=checks/(label+'.receipt.json');assert not receipt.exists()
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();r=subprocess.run(args,cwd=REPO,capture_output=True)
 stdout=checks/(label+'.stdout.txt');stderr=checks/(label+'.stderr.txt');assert not stdout.exists() and not stderr.exists();stdout.write_bytes(r.stdout);stderr.write_bytes(r.stderr)
 receipt.write_text(json.dumps({'argv':args,'cwd':'.','startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':r.returncode,'stdout':ref(stdout),'stderr':ref(stderr),'actualInvocation':1},ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'action':label,'exitCode':r.returncode,'stdout':r.stdout.decode(),'stderr':r.stderr.decode()}),flush=True)
 if r.returncode:raise SystemExit('One actual action failed; exact receipt preserved, no automatic retry.')
tsx=str(HOST/'app/node_modules/tsx/dist/cli.mjs')
if sys.argv[1]=='preflight':
 command('01-source-FPs-P077-mechanical-and-actual-neighbor-contexts',['node',tsx,str(OWN/'scripts/prepare_mechanical_FPs_P077_and_actual_context_audit.mts'),str(OWN)])
 command('02-P077-stock-positive-profile-check',['node',tsx,str(HOST/'app/scripts/positiveGoalEvidenceReview.ts'),'--config='+(OWN/'config/P11.only077-image-input-transport.normal.config.json').relative_to(REPO).as_posix(),'--mode=check'])
elif sys.argv[1]=='native':
 assert json.loads((checks/'01c-actual-neighbor-contexts-final-corrected-serialization.receipt.json').read_text())['exitCode']==0
 for mode in ['prepare','check']:command('03-NATIVE-six-'+mode,['node',tsx,str(HOST/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',plan['nativeConfig']['path']])
elif sys.argv[1]=='P077-check':
 command('02-P077-stock-positive-profile-check',['node',tsx,str(HOST/'app/scripts/positiveGoalEvidenceReview.ts'),'--config='+(OWN/'config/P11.only077-image-input-transport.normal.config.json').relative_to(REPO).as_posix(),'--mode=check'])
elif sys.argv[1]=='native-corrected-public-hardlinks':
 assert (checks/'CORRECTION.native-public-root-selected-eight-readonly-hardlinks.json').exists()
 for mode in ['prepare','check']:command('03b-NATIVE-six-public-root-corrected-'+mode,['node',tsx,str(HOST/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',plan['nativeConfig']['path']])
elif sys.argv[1]=='native-neighbor-two':
 n=json.loads((OWN/'INPUTS.two-exact-Q2-causal-neighbor-contexts.json').read_text())
 command('04-NATIVE-neighbor-two-preflight',['node',tsx,str(OWN/'scripts/preflight_neighbor_two_exact_profile_and_config.mts'),str(OWN)])
 for mode in ['prepare','check']:command('04-NATIVE-neighbor-two-'+mode,['node',tsx,str(HOST/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',n['nativeConfig']['path']])
else:raise SystemExit('mode must be preflight or native')
