"""Apache-2.0. Capture actual ordinary CLI execution without synthesizing validation results."""
from pathlib import Path
import subprocess,datetime,json,hashlib,sys
R=Path('/home/enpasos/projects/skillpilot');O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1');kind=sys.argv[1];cap=R/'tmp/chemie-q4-current220-prep/execution'
config={ 'A18':O/'configs/A18.author.inactive.config.json','M402':O/'configs/M402.inactive.config.json','P18':O/'configs/P18.author.inactive.config.json','native-prepare':O/'configs/native-D18.final-current231.batch.config.json','native-check':O/'configs/native-D18.final-current231.batch.config.json'}[kind]
module={'A18':'semanticAtomicityReview.ts','M402':'memoryCardReview.ts','P18':'positiveGoalEvidenceReview.ts','native-prepare':'materializeGoalDescriptionRolloutBatch.ts','native-check':'materializeGoalDescriptionRolloutBatch.ts'}[kind]
cwd=cap if kind in ['P18','native-prepare','native-check']else R
argv=['app/node_modules/.bin/tsx','app/scripts/'+module]
argv+=([kind.removeprefix('native-'),'--config',str(config)]if kind.startswith('native-')else['--config='+str(config),'--mode='+('report'if kind=='A18'else'check')])
base=R/O/'checks'/('FINAL.'+kind+'.normal');started=datetime.datetime.now(datetime.timezone.utc).isoformat()
with open(str(base)+'.stdout.txt','wb')as out,open(str(base)+'.stderr.txt','wb')as err:r=subprocess.run(argv,cwd=cwd,stdout=out,stderr=err)
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();rec=dict(schemaVersion=1,argv=argv,cwd=str(cwd.relative_to(R))if cwd!=R else '.',startedAtUTC=started,completedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),exitCode=r.returncode,configPath=str(config),configSha256=sha(R/config),productionModuleSha256=sha(R/'app/scripts'/module),executedModuleSha256=sha(cwd/'app/scripts'/module),stdoutPath=str(base.relative_to(R))+'.stdout.txt',stdoutSha256=sha(Path(str(base)+'.stdout.txt')),stderrPath=str(base.relative_to(R))+'.stderr.txt',stderrSha256=sha(Path(str(base)+'.stderr.txt')),newScientificVotes=0)
Path(str(base)+'.execution.actual.json').write_text(json.dumps(rec,indent=2)+'\n');print(json.dumps(dict(kind=kind,exitCode=r.returncode,executionPath=str(base.relative_to(R))+'.execution.actual.json')));print(Path(str(base)+'.stdout.txt').read_text()[-4000:]);print(Path(str(base)+'.stderr.txt').read_text()[-4000:]);sys.exit(r.returncode)
