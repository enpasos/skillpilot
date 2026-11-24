import sys,json,subprocess
from pathlib import Path
p=Path(sys.argv[1]);model=sys.argv[2];cmd=['codex','exec','--ignore-user-config','--skip-git-repo-check','-C',str(p),'--sandbox','read-only','--model',model,'-c','model_reasoning_effort="ultra"','--output-schema',str(p/'output.schema.json'),'--output-last-message',str(p/'response.json'),'--json']
for f in json.load(open(p/'attached-images.json')):cmd+=['--image',str(p/f)]
cmd+=['-'];(p/'invocation.json').write_text(json.dumps({'argv':cmd,'stdinFile':'driver-prompt.txt'},indent=2)+'\n')
with open(p/'driver-prompt.txt','rb') as inp,open(p/'events.jsonl','wb') as out,open(p/'stderr.log','wb') as err:result=subprocess.run(cmd,stdin=inp,stdout=out,stderr=err)
(p/'exit-code.txt').write_text(str(result.returncode)+'\n');sys.exit(result.returncode)
