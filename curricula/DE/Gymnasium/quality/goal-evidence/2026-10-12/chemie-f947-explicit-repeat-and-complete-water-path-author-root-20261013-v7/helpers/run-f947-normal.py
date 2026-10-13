from pathlib import Path
import subprocess,json,hashlib,datetime,sys
R=Path('/home/enpasos/projects/skillpilot'); C=R/'tmp/chemie-q4-current220-prep/execution'; F=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-explicit-repeat-and-complete-water-path-author-root-20261013-v7')
kind=sys.argv[1]; module='materializeGoalDescriptionRolloutBatch.ts' if kind in ['prepare','check'] else 'positiveGoalEvidenceReview.ts'
args=[kind,'--config',str(F/'configs/native-D1.batch.config.json')] if kind in ['prepare','check'] else ['--mode=check','--config='+str(F/'configs/P1.author.inactive.config.json')]
argv=['app/node_modules/.bin/tsx','app/scripts/'+module]+args
out=R/F/'checks'/('normal-'+kind);out.parent.mkdir(parents=True,exist_ok=True)
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
with Path(str(out)+'.stdout.txt').open('wb') as o,Path(str(out)+'.stderr.txt').open('wb') as e:
 p=subprocess.run(argv,cwd=C,stdout=o,stderr=e)
h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
record=dict(schemaVersion=1,startedAtUTC=started,completedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),argv=argv,cwd=str(C.relative_to(R)),exitCode=p.returncode,productionModuleSha256=h(R/'app/scripts'/module),executedModuleSha256=h(C/'app/scripts'/module),stdoutSha256=h(Path(str(out)+'.stdout.txt')),stderrSha256=h(Path(str(out)+'.stderr.txt')),newScientificVotes=0,humanApproval=False)
Path(str(out)+'.actual.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record));print(Path(str(out)+'.stdout.txt').read_text()[-3500:]);print(Path(str(out)+'.stderr.txt').read_text()[-3500:]);sys.exit(p.returncode)
