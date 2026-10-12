#!/usr/bin/env python3
import datetime,json,pathlib,subprocess,sys
own=pathlib.Path(__file__).resolve().parent
repo=pathlib.Path('/home/enpasos/projects/skillpilot')
label=sys.argv[1]; argv=sys.argv[2:]
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
r=subprocess.run(argv,cwd=repo,text=True,capture_output=True)
finished=datetime.datetime.now(datetime.timezone.utc).isoformat()
(own/'checks'/f'{label}.stdout.txt').write_text(r.stdout)
(own/'checks'/f'{label}.stderr.txt').write_text(r.stderr)
receipt={'argv':argv,'startedAtUTC':started,'finishedAtUTC':finished,'exitCode':r.returncode,'stdoutPath':str((own/'checks'/f'{label}.stdout.txt').relative_to(repo)),'stderrPath':str((own/'checks'/f'{label}.stderr.txt').relative_to(repo)),'targetGoalIds':['e81a4aed-9695-533e-8eb7-7a0c714346ea','793189f8-78bd-5204-848b-fd2bbc12e458'],'humanApproval':False,'humanTrial':False}
(own/'checks'/f'{label}.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'check':label,'exitCode':r.returncode,'stdout':r.stdout if len(r.stdout)<2500 else r.stdout[:1500]+' [remaining raw output retained in stdoutPath]','stderr':r.stderr if len(r.stderr)<1500 else r.stderr[:1000]}))
sys.exit(r.returncode)
