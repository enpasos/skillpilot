from pathlib import Path
import datetime,json,subprocess
own=Path(__file__).resolve().parent;root=own.parents[6]
argv=['node',str((own/'invoke-unchanged-spelling-collisions-chem-bio.author.mjs').relative_to(root))]
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
r=subprocess.run(argv,cwd=root,text=True,capture_output=True)
(own/'spelling-chem-bio.actual.stdout.txt').write_text(r.stdout)
(own/'spelling-chem-bio.actual.stderr.txt').write_text(r.stderr)
(own/'actual-spelling-chem-bio.cli.receipt.json').write_text(json.dumps({'schemaVersion':1,'documentType':'actual-cli-existing-five-spelling-collisions-chem-bio','argv':argv,'cwd':str(root),'startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'unchangedNativeFunctionActuallyCalled':True,'noGeneralUmlautStyleOrScienceSearch':True,'activeCurriculumWrites':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr}))
