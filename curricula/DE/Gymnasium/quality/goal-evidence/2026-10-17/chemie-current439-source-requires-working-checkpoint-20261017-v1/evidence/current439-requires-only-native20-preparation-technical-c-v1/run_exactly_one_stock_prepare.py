from pathlib import Path
from datetime import datetime,timezone
import subprocess,json,time,os
O=Path(__file__).resolve().parent;C=O/'capsule'
h=json.loads((O/'HANDOFF.private-requires20-and-guarded-root18-CAS.json').read_text())
byPath={x['originalPath']:x['originalWholeObject'] for x in h['source18OriginalConfigs']}
markers=[]
for old in h['changedOldClaimScopes']:
 cfg=byPath[old['oldActiveReference']];markers.extend([old['oldActiveReference'],cfg['outputDirectory'],cfg['batchId']])
processes=[];unreadable=0
for p in Path('/proc').iterdir():
 if not p.name.isdigit() or int(p.name)==os.getpid():continue
 try:
  cmd=(p/'cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace')
  matches=[m for m in markers if m in cmd]
  if matches:processes.append({'pid':int(p.name),'command':cmd,'matchingOldClaimMarkers':matches})
 except (OSError,ProcessLookupError):unreadable+=1
roster={'atUTC':datetime.now(timezone.utc).isoformat(),'role':'Fresh command roster immediately before own single stock prepare','matchingOldClaimProcesses':processes,'unreadableOrRacingProcesses':unreadable,'observationNotLock':True,'rosterScope':'Current affected old claim commands only; no old-round validation'}
p=O/'GUARD.roster-at-prepare-start.json';assert not p.exists();p.write_text(json.dumps(roster,indent=2)+'\n');assert not processes,processes
config=h['newBatchConfigPath'];command=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(C/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'prepare','--config',config]
started=datetime.now(timezone.utc).isoformat();t=time.monotonic();meta={'command':command,'cwd':str(C),'startedAt':started,'environmentOverrides':{'TSX_DISABLE_CACHE':'1','NO_COLOR':'1'},'stockPrepareInvocation':1,'observationTimeoutRerun':False,'fullCentralOrStandalone439CompilerPdf':False,'newScienceVotes':0}
p=O/'EXECUTION.single-stock-native20-prepare.started.json';assert not p.exists();p.write_text(json.dumps(meta,indent=2)+'\n')
with (O/'EXECUTION.single-stock-native20-prepare.stdout.txt').open('xb') as stdout,(O/'EXECUTION.single-stock-native20-prepare.stderr.txt').open('xb') as stderr:
 process=subprocess.Popen(command,cwd=C,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'),stdout=stdout,stderr=stderr)
 print(json.dumps({'event':'stock-prepare-started','pid':process.pid,'atUTC':started}),flush=True)
 rc=process.wait()
meta.update(exitCode=rc,finishedAt=datetime.now(timezone.utc).isoformat(),elapsedSeconds=time.monotonic()-t,pid=process.pid)
p=O/'EXECUTION.single-stock-native20-prepare.completed.json';assert not p.exists();p.write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(meta,indent=2),flush=True);print((O/'EXECUTION.single-stock-native20-prepare.stdout.txt').read_text()[-4500:],flush=True);print((O/'EXECUTION.single-stock-native20-prepare.stderr.txt').read_text()[-4500:],flush=True)
raise SystemExit(rc)
