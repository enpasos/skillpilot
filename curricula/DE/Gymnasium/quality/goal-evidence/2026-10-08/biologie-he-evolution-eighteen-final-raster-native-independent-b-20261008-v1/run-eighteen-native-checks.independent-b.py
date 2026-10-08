from pathlib import Path
import json,subprocess,hashlib,datetime,time
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;AUTHOR=OWN.parent/'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1'
def rel(p):return str(p.relative_to(ROOT))
def write(n,x):
 p=OWN/n
 with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
 return p
runs=[]
def run(label,argv):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(argv,capture_output=True,text=True)
 for suffix,value in [('stdout',p.stdout),('stderr',p.stderr)]:
  with (OWN/(label+'.'+suffix+'.actual.txt')).open('x') as f:f.write(value)
 receipt={'argv':argv,'cwd':str(ROOT),'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'elapsedSeconds':time.monotonic()-t,'stdoutPath':rel(OWN/(label+'.stdout.actual.txt')),'stderrPath':rel(OWN/(label+'.stderr.actual.txt'))};write(label+'.terminal.actual.json',receipt);runs.append(receipt);print(label,p.returncode,p.stdout[-700:],p.stderr[-700:]);return p.returncode
assert run('D18-P18-actual-native-api',['app/node_modules/.bin/tsx',rel(OWN/'check-eighteen-exact-inactive-native-D-P.independent-b.mts')])==0
q=AUTHOR/'native-eighteen-author/eighteen/round-b'
assert run('D18-standard-native-independent-b',['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',rel(q/'review-bundle-manifest.json'),'--input',rel(q/'description-review-input.json'),'--campaign',rel(q/'description-review-campaign.json'),'--batches-dir',rel(q/'batches'),'--results-dir',rel(OWN/'round-b/results')])==0
for gate,script in [('A','semanticAtomicityReview.ts'),('M','memoryCardReview.ts')]:
 cfg=json.load(open(AUTHOR/('candidate/'+gate+'.current392.inactive.config.json')));cfg['reportPath']=rel(OWN/(gate+'392-retained-native.independent-b.actual.md'));cp=write(gate+'392-retained-native.independent-b.config.json',cfg)
 assert run(gate+'392-retained-standard-native',['app/node_modules/.bin/tsx','app/scripts/'+script,'--config',rel(cp),'--mode=check','--write-report'])==0
write('eighteen-native-terminal-checks.independent-b.actual.json',{'runs':runs,'allNestedExitCodesActuallyZero':True,'ordinaryPCLI':'pending_public_installation; actual native closed schema/semantics read exact original PNG bytes','nativePassDoesNotResolveVisualHOLD':True,'noActiveWrites':True,'humanApproval':False})
