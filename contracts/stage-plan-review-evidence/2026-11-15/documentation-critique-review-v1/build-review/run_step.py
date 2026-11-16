#!/usr/bin/env python3
"""Compact named step logger: explicit argv, cwd, timestamps, exit and byte pins."""
import sys,pathlib,json,subprocess,datetime,hashlib,time
out=pathlib.Path(__file__).resolve().parent;root=out.parents[2]
if len(sys.argv)<4:raise SystemExit('usage: run_step.py LABEL CWD COMMAND [ARG ...]')
label,cwd,*cmd=sys.argv[1:]
log=out/(label+'.log');receipt=out/(label+'.actual.json')
assert not log.exists() and not receipt.exists(), 'Use a fresh label; evidence is immutable'
start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
with log.open('w') as f:
 p=subprocess.run(cmd,cwd=root/cwd,stdout=f,stderr=subprocess.STDOUT,text=True)
end=datetime.datetime.now(datetime.timezone.utc).isoformat()
record={'label':label,'cwd':str(root/cwd),'argv':cmd,'start':start,'end':end,'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'log':str(log.relative_to(root)),'logSha256':hashlib.sha256(log.read_bytes()).hexdigest()}
receipt.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(record,ensure_ascii=False))
if p.returncode:print(log.read_text(errors='replace')[-6000:])
else:print('\n'.join(log.read_text(errors='replace').splitlines()[-18:]))
raise SystemExit(p.returncode)
