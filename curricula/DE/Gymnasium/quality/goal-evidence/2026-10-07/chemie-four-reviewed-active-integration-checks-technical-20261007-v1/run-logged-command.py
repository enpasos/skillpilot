#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import datetime,hashlib,json,pathlib,subprocess,sys
OWN=pathlib.Path(__file__).resolve().parent;ROOT=OWN.parents[6]
name=sys.argv[1];argv=sys.argv[2:];assert name and argv
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
r=subprocess.run(argv,cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
end=datetime.datetime.now(datetime.timezone.utc).isoformat();out=OWN/'checks';out.mkdir(exist_ok=True)
for suffix,b in [('stdout.txt',r.stdout),('stderr.txt',r.stderr)]:
 with (out/(name+'.'+suffix)).open('xb') as f:f.write(b)
receipt={'command':argv,'cwd':str(ROOT),'startedAt':start,'completedAt':end,'exitCode':r.returncode,'stdoutPath':str((out/(name+'.stdout.txt')).relative_to(ROOT)),'stderrPath':str((out/(name+'.stderr.txt')).relative_to(ROOT)),'stdoutSha256':'sha256:'+hashlib.sha256(r.stdout).hexdigest(),'stderrSha256':'sha256:'+hashlib.sha256(r.stderr).hexdigest(),'technicalCheckOnly':True,'newScientificJudgment':False}
with (out/(name+'.result.json')).open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps({'check':name,'exitCode':r.returncode,'resultPath':str((out/(name+'.result.json')).relative_to(ROOT))}))
if r.returncode:print((r.stderr+r.stdout).decode(errors='replace')[-7000:])
sys.exit(r.returncode)
