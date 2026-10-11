from pathlib import Path
import subprocess,os,datetime,time,json,hashlib
ROOT=Path.cwd();O=Path(__file__).resolve().parent;NODE=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip(); TSX=str(ROOT/'app/node_modules/tsx/dist/cli.mjs');env=dict(os.environ)
env['PATH']=str(Path(NODE).parent)+':/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin:'+env['PATH'];env['LD_LIBRARY_PATH']='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu:'+env.get('LD_LIBRARY_PATH','');env['FONTCONFIG_FILE']='/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf';env['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH']='/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def run(label,args):
 log=O/(label+'.raw.txt');receipt=O/(label+'.command-receipt.json');assert not log.exists() and not receipt.exists();start=now();t=time.monotonic()
 with log.open('xb') as f:r=subprocess.run(args,cwd=ROOT,env=env,stdout=f,stderr=subprocess.STDOUT)
 result={'label':label,'argv':args,'repositoryRelativeWorkingDirectory':'.','startedAtUtc':start,'completedAtUtc':now(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':r.returncode,'rawLog':{'path':str(log.relative_to(ROOT)),'sha256':hashlib.sha256(log.read_bytes()).hexdigest(),'bytes':log.stat().st_size},'activeWrites':0,'DDecisions':0,'commandScope':'Native preparation/check only; no resolution/finalize or central/build rerun'}
 receipt.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'label':label,'exitCode':r.returncode,'elapsedSeconds':result['elapsedSeconds']}),flush=True)
 if r.returncode:raise SystemExit(r.returncode)
run('01b-native-current-full346-base-context',[NODE,TSX,str(O/'capture-native-full346-base-selected12-context.AUTHOR-INERT.mts'),str(O)])
config=str((O/'twelve-current-deferrals.native-batch.config.json').relative_to(ROOT))
run('02-native-twelve-deferrals-prepare',[NODE,TSX,str(ROOT/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'prepare','--config',config])
run('03-native-twelve-deferrals-check',[NODE,TSX,str(ROOT/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'check','--config',config])
