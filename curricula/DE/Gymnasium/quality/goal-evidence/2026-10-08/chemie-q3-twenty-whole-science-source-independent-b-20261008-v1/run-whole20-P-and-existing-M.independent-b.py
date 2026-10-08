import hashlib,json,pathlib,subprocess,time
from datetime import datetime,timezone
ROOT=pathlib.Path(__file__).resolve().parents[7];OUT=pathlib.Path(__file__).resolve().parent
AUTHOR=OUT.parent/'chemie-q3-twenty-whole-science-source-author-20261008-v1'
def rel(p):return str(p.relative_to(ROOT))
def write(p,data):p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
config=json.loads((AUTHOR/'memory/current378.existing-reuse.native.config.json').read_text())
config['reportPath']=rel(OUT/'M378-retained-decisions-native-visibility.independent-b.actual.md')
write(OUT/'M378-retained-native-visibility.independent-b.config.json',config)
jobs=[('P20-actual-closed-native-api',['app/node_modules/.bin/tsx',rel(OUT/'check-whole20-inactive-P-source-kind.independent-b.mts')]),('M378-retained-native-visibility',['app/node_modules/.bin/tsx','app/scripts/memoryCardReview.ts','--config='+rel(OUT/'M378-retained-native-visibility.independent-b.config.json'),'--mode=check','--write-report'])]
results=[]
for name,argv in jobs:
 started=time.monotonic();r=subprocess.run(argv,cwd=ROOT,capture_output=True)
 stdout=OUT/(name+'.stdout.actual.txt');stderr=OUT/(name+'.stderr.actual.txt')
 stdout.write_bytes(r.stdout);stderr.write_bytes(r.stderr)
 receipt={'argv':argv,'cwd':str(ROOT),'exitCode':r.returncode,'elapsedSeconds':time.monotonic()-started,'stdoutPath':rel(stdout),'stderrPath':rel(stderr),'stdoutSha256':hashlib.sha256(r.stdout).hexdigest(),'stderrSha256':hashlib.sha256(r.stderr).hexdigest()}
 write(OUT/(name+'.terminal.actual.json'),receipt);results.append(receipt)
 print(name,'exit',r.returncode);print(r.stdout.decode());print(r.stderr.decode())
write(OUT/'P20-M378-terminal-actual-checks.independent-b.json',{'recordedAt':datetime.now(timezone.utc).isoformat(),'checks':results,'nativePassIsScienceApproval':False,'activeWrites':0,'humanApproval':False})
if any(r['exitCode'] for r in results):raise SystemExit(1)
