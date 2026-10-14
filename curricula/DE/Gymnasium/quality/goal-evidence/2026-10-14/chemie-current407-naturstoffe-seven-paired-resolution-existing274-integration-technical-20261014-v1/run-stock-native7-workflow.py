# Apache-2.0. Exact unchanged normal stock CLI sequence, owned outputs only.
import datetime,json,pathlib,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;rel=str(O.relative_to(R));cfg=rel+'/native-seven.inactive-copy.batch.config.json'
commands=[
 ('summarize',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write']),
 ('synthesis-manifest',['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',rel+'/native-seven/synthesis-authoring.technical-no-new-vote.json','--write']),
 ('resolutions',['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',rel+'/native-seven/synthesis-decisions.json','--write']),
 ('finalize',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write'])]
for name,args in commands:
 command=['./app/node_modules/.bin/tsx',*args];started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(command,cwd=R,text=True,capture_output=True)
 out=O/f'checks/STOCK.N7.{name}.actual.json';assert not out.exists();out.write_text(json.dumps({'schemaVersion':1,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':command,'cwd':str(R),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'newScientificVotes':0},ensure_ascii=False,indent=2)+'\n')
 print(name,p.returncode,p.stdout.strip(),p.stderr.strip(),flush=True)
 if p.returncode:raise SystemExit(p.returncode)
