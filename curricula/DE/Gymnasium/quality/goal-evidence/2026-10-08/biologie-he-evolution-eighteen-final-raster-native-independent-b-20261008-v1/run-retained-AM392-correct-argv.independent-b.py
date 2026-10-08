from pathlib import Path
import json,subprocess,time,datetime
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;AUTHOR=OWN.parent/'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1'
rel=lambda p:str(p.relative_to(ROOT))
def wr(n,x):
 with (OWN/n).open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
results=[]
for gate,script in [('A','semanticAtomicityReview.ts'),('M','memoryCardReview.ts')]:
 cp=OWN/(gate+'392-retained-native.independent-b.config.json')
 if not cp.exists():
  cfg=json.load(open(AUTHOR/('candidate/'+gate+'.current392.inactive.config.json')));cfg['reportPath']=rel(OWN/(gate+'392-retained-native.independent-b.actual.md'));wr(cp.name,cfg)
 argv=['app/node_modules/.bin/tsx','app/scripts/'+script,'--config='+rel(cp),'--mode=check']+(['--write-report'] if gate=='M' else [])
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(argv,capture_output=True,text=True);label=gate+'392-retained-correct-argv-native'
 for suffix,value in [('stdout',p.stdout),('stderr',p.stderr)]:
  with (OWN/(label+'.'+suffix+'.actual.txt')).open('x') as f:f.write(value)
 rec={'argv':argv,'cwd':str(ROOT),'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'elapsedSeconds':time.monotonic()-t,'stdoutPath':rel(OWN/(label+'.stdout.actual.txt')),'stderrPath':rel(OWN/(label+'.stderr.actual.txt'))};wr(label+'.terminal.actual.json',rec);results.append(rec);print(label,p.returncode,p.stdout[-1500:],p.stderr[-300:]);assert p.returncode==0
wr('retained-AM392-correct-argv-and-initial-diagnostic.independent-b.actual.json',{'actualCorrectedRuns':results,'initialFailurePreserved':rel(OWN/'A392-retained-standard-native.terminal.actual.json'),'cause':'Reviewer invocation incorrectly used two-token --config and generic --write-report for A. Standard parser requires --config=path, and A has no --write-report switch. Standard scripts untouched.','allFinalNestedExitCodesActuallyZero':True,'nativeFormDoesNotResolveV1AnatomicalHOLD':True,'ordinaryPCLIPendingInstallation':True,'activeWrites':0,'humanApproval':False})
