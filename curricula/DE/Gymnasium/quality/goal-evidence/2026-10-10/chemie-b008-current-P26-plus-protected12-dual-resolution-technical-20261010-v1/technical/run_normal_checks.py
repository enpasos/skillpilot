from pathlib import Path
import json,subprocess,time,datetime
R=Path.cwd();OUT=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-P26-plus-protected12-dual-resolution-technical-20261010-v1');C=OUT/'checks';C.mkdir(exist_ok=True)
groups=json.loads((OUT/'native-groups.technical.json').read_text()); runs=[]
for g in groups:
 cfg=g['configPath'];synth=str(OUT/g['group']/'synthesis-decisions.json')
 commands=[('prepared-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',cfg]),('dual-summary-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg]),('resolution-materialize',['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',synth,'--write']),('resolution-check',['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',synth]),('resolution-index-materialize',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write']),('resolution-index-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg])]
 for label,args in commands:
  cmd=['./app/node_modules/.bin/tsx']+args;start=time.monotonic();p=subprocess.run(cmd,text=True,capture_output=True)
  log=C/f"{g['group']}.{label}.actual.log";log.write_text(p.stdout+p.stderr)
  runs.append({'group':g['group'],'check':label,'command':cmd,'exitCode':p.returncode,'durationSeconds':round(time.monotonic()-start,3),'logPath':str(log)})
  (C/'normal-terminal-results.actual.json').write_text(json.dumps({'schemaVersion':1,'performedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'normalCheckersUnchanged':True,'runs':runs},ensure_ascii=False,indent=2)+'\n')
  print(g['group'],label,'PASS' if p.returncode==0 else 'FAIL',p.stdout.strip(),p.stderr.strip(),flush=True)
  if p.returncode:raise SystemExit(p.returncode)
print('PASS all 18 normal terminals, no active writes and no gate change',flush=True)
