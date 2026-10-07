from pathlib import Path
import datetime,json,subprocess
own=Path(__file__).resolve().parent
root=own.parents[6]
assert not (own/'actual-native-source-atlas-test.cli.receipt.json').exists()
argv=['app/node_modules/.bin/tsx',str((own/'invoke-actual-native-source-atlas-test.author.mts').relative_to(root))]
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
r=subprocess.run(argv,cwd=root,text=True,capture_output=True)
(own/'native-source-atlas-test.actual.stdout.txt').write_text(r.stdout)
(own/'native-source-atlas-test.actual.stderr.txt').write_text(r.stderr)
(own/'actual-native-source-atlas-test.cli.receipt.json').write_text(json.dumps({'schemaVersion':1,'documentType':'actual-native-source-atlas-test-function-cli-receipt','argv':argv,'cwd':str(root),'startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'actualTestFunctionCallInRunner':'testGoalBookSourceAtlasInputs()','actualTestInvocationCount':1,'mereImportWasNotCountedAsTest':True,'nativeHelpersAndAssertionsUnmodified':True,'nativeTemporaryFixturesActuallyCreatedAndRemoved':True,'activeCurriculumWrites':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr}))
