from pathlib import Path
import datetime, hashlib, json, os, subprocess, time
O=Path(__file__).resolve().parent;C=O/'capsule'
plan=json.loads((O/'PLAN.author14.exact-prospective-change-map.json').read_text())
refs=json.loads((O/'INPUTS.final-actual-P4-V4-material-pins.json').read_text())
for p in refs['sourceGuards']:
 raw=Path(p['path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==p['sha256'] and len(raw)==p['bytes'],p['path']
argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(C/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'prepare','--config',plan['draftBatchConfigRelativePath']]
started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
meta={'role':'One actual bounded native14 stock prepare; no central report or full439 PDF/build output','argv':argv,'cwd':str(C),'startedAtUTC':started,'stockPrepareInvocation':1,'goalCount':14,'humanApproval':False}
p=O/'EXECUTION.one-native14-stock-prepare.started.json';assert not p.exists();p.write_text(json.dumps(meta,indent=2)+'\n')
with (O/'EXECUTION.one-native14-stock-prepare.stdout.txt').open('xb') as out,(O/'EXECUTION.one-native14-stock-prepare.stderr.txt').open('xb') as err:
 result=subprocess.run(argv,cwd=C,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'),stdout=out,stderr=err,check=False)
meta.update(exitCode=result.returncode,finishedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),elapsedSeconds=time.monotonic()-t)
p=O/'EXECUTION.one-native14-stock-prepare.completed.json';assert not p.exists();p.write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(meta));print((O/'EXECUTION.one-native14-stock-prepare.stdout.txt').read_text()[-3000:]);print((O/'EXECUTION.one-native14-stock-prepare.stderr.txt').read_text()[-4000:])
raise SystemExit(result.returncode)
