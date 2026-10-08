from pathlib import Path
import hashlib
import json
import subprocess
from datetime import datetime, timezone

root=Path.cwd(); own=Path(__file__).resolve().parent
author=own.parent/'biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1'
read=lambda p:json.loads(p.read_text())
def bind(p):
    data=p.read_bytes()
    return {'path':p.relative_to(root).as_posix(),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
def write(name,value):
    with (own/name).open('x') as out: json.dump(value,out,ensure_ascii=False,indent=2);out.write('\n')
ids=read(author/'neutral-whole24-source-science-and-whole48-independent-review.author.entry.json')['goalIds']
clear_ordinals=[4,6,7,9,10,15,20,21,22,23]
selected=[ids[n-1] for n in clear_ordinals]
rows=(author/'rebase-current/P14.source-only.exact-retained.author.review.jsonl').read_text().splitlines(keepends=True)
selected_lines=[line for line in rows if json.loads(line)['goalId'] in selected]
assert [json.loads(line)['goalId'] for line in selected_lines]==selected
records=own/'P10.own-clear-source-only.exact-author-records.jsonl'
with records.open('x') as out: out.write(''.join(selected_lines))
config=read(author/'rebase-current/P14.source-only.current.author.config.json')
config['reviewPath']=records.relative_to(root).as_posix()
config['scope']={'label':'Own independent B clear intersection10; exact retained author records; source-only, actual whole Science first sealed, no raster D/V','goalIds':selected}
write('P10.own-clear-source-only.exact-author-records.config.json',config)
commands=[('P10-source-only-native-API',['app/node_modules/.bin/tsx',str((own/'check-own-clear-ten-source-only-P.independent-b.mts').relative_to(root))]),
          ('P10-source-only-ordinary-standard-CLI',['npm','--prefix','app','run','quality:positive-goal-evidence:check','--','--config='+str((own/'P10.own-clear-source-only.exact-author-records.config.json').relative_to(root))])]
for label,argv in commands:
    started=datetime.now(timezone.utc).isoformat();result=subprocess.run(argv,cwd=root,capture_output=True)
    for channel,data in [('stdout',result.stdout),('stderr',result.stderr)]:
        with (own/f'{label}.{channel}.actual.txt').open('xb') as out: out.write(data)
    write(f'{label}.terminal.actual.json',{'schemaVersion':1,'actualArgv':argv,'actualStartedAt':started,'actualCompletedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':result.returncode,
        'stdout':bind(own/f'{label}.stdout.actual.txt'),'stderr':bind(own/f'{label}.stderr.actual.txt'),'sourceOnlyNoRaster':True,'currentPeerRead':False,'activeWrites':0})
    print(label, 'actual exit',result.returncode)
    print(result.stdout.decode())
    if result.returncode: print(result.stderr.decode());raise SystemExit(result.returncode)
