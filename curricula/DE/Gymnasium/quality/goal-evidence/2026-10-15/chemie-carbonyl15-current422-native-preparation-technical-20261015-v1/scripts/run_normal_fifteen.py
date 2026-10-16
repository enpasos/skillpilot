from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,time
R=Path.cwd();O=Path(__file__).resolve().parents[1];REL=O.relative_to(R).as_posix()
assert not (O/'FILES.finite-carbonyl15-native-technical.seal.json').exists()
mapping=json.loads((O/'checks/REBUILD.carbonyl15-current422.physical-map.json').read_text());H=R/mapping['executionHost']
previous=O/'checks/COMMANDS.normal-native15-prepare-check.json'
prior=json.loads(previous.read_text()) if previous.exists() else {}
receipts=prior.get('commands',[]);preflights=prior.get('physicalModulePreflights',[])
def preflight(phase):
    rows=[]
    for r in mapping['stockPhysicalModules']:
        p=H/r['path'];assert p.is_file() and not p.is_symlink();assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256'];rows.append(r['path'])
    assert len(rows)==31
    assert 'app/scripts/generateGoalVisualizationQaLedgers.ts' in rows and 'app/scripts/goalVisualizationQaModel.ts' in rows
    return {'phase':phase,'actualAtUTC':datetime.now(timezone.utc).isoformat(),'stockPhysicalModules':31,'dynamicQAChildAndModelExact':True,'QAExecuted':False}
for mode in ['prepare','check']:
    preflights.append(preflight('before-'+mode))
    cmd=[str(R/'app/node_modules/.bin/tsx'),str(H/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',REL+'/config/native15.normal-prepare-only.config.json']
    start=datetime.now(timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(cmd,cwd=H,capture_output=True,text=True)
    attempt=1+sum(r['name']=='native15-stock-'+mode for r in receipts)
    output=O/'checks'/('COMMAND.native15-stock-'+mode+'.attempt-'+str(attempt)+'.actual.txt');output.write_text('argv: '+json.dumps(cmd)+'\ncwd: '+str(H)+'\nexitCode: '+str(p.returncode)+'\nstdout:\n'+p.stdout+'\nstderr:\n'+p.stderr)
    receipts.append({'name':'native15-stock-'+mode,'argv':cmd,'cwd':mapping['executionHost'],'startedAtUTC':start,'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'output':output.relative_to(R).as_posix(),'outputSHA256':'sha256:'+hashlib.sha256(output.read_bytes()).hexdigest()})
    (O/'checks/COMMANDS.normal-native15-prepare-check.json').write_text(json.dumps({'commands':receipts,'physicalModulePreflights':preflights,'newScientificVotes':0,'centralExecuted':False},indent=2)+'\n')
    print(json.dumps({'mode':mode,'exitCode':p.returncode,'elapsedSeconds':round(time.monotonic()-t,3),'stdout':p.stdout,'stderr':p.stderr[-5000:]}),flush=True)
    if p.returncode:raise SystemExit(p.returncode)
