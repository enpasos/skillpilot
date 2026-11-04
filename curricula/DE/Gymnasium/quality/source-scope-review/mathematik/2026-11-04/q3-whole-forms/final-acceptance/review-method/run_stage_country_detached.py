from pathlib import Path
import json,subprocess,time,hashlib,os,datetime
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;D=O/'normal-eleven';C=O/'normal-default-host';row=json.loads((D/'stage-country.attempt3.execution.json').read_text());out=D/'stage-country.attempt5.stdout.txt';err=D/'stage-country.attempt5.stderr.txt';assert not out.exists();tmp=C/'tmp'
if tmp.exists():
 assert not any(tmp.iterdir()),'Previous unfinished fixture must be preserved and assessed';tmp.rmdir()
assert not tmp.exists();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();before=sha(C/'app/scripts/testMathCountrySekICompositionViews.ts');assert before=='f3279a960643a978c23f8b7a426792937a1c9aeeb840c4eb9745d35997983f55';started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
with out.open('w')as so,err.open('w')as se:r=subprocess.run(row['argv'],cwd=row['cwd'],env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1'),stdout=so,stderr=se)
assert sha(C/'app/scripts/testMathCountrySekICompositionViews.ts')==before
row.update(attempt=5,exitCode=r.returncode,seconds=round(time.monotonic()-t,2),stdout={'path':str(out.relative_to(R)),'sha256':sha(out)},stderr={'path':str(err.relative_to(R)),'sha256':sha(err)},privateTmpAbsentAtInvocation=True,finalQASha256=before,startedAt=started,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),detachedOwnSupervisor=True);(D/'stage-country.attempt5.execution.json').write_text(json.dumps(row,indent=2)+'\n');print('stage-country',r.returncode,row['seconds'],flush=True)
