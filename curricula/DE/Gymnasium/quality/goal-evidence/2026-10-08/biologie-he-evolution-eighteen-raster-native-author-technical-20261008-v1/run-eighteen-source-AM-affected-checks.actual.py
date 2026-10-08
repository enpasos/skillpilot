# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
import json,os,subprocess,tempfile
R=Path.cwd();D=Path(__file__).resolve().parent;P=str(D.relative_to(R));T='node';CLI='app/node_modules/tsx/dist/cli.mjs'
def put(name,o):
 p=D/'checks'/name;p.parent.mkdir(parents=True,exist_ok=True);b=o if isinstance(o,str)else json.dumps(o,ensure_ascii=False,indent=2)+'\n';assert not p.exists()
 fd,tmp=tempfile.mkstemp(prefix='.'+p.name+'.',suffix='.tmp',dir=p.parent)
 with os.fdopen(fd,'w')as f:f.write(b)
 os.replace(tmp,p)
def run(name,args):
 start=datetime.now(timezone.utc).isoformat();p=subprocess.run(args,cwd=R,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);log=name+'.stdout.actual.txt';put(log,p.stdout);r={'command':args,'startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':p.returncode,'stdoutPath':P+'/checks/'+log,'activeWrites':0,'humanApproval':False,'newIndependentReviewRun':False};put(name+'.terminal.actual.json',r);print(name,p.returncode,flush=True);assert p.returncode==0;return r
def atlas():
 c='app/scripts/config/goal-books/inactive/biologie-he-evolution-eighteen-raster-native-20261008-v1/atlas.inputs.json'
 return [run('SourceAtlas392-v3-native-generate',[T,CLI,'app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',c]),run('SourceAtlas392-v3-native-check',[T,CLI,'app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',c,'--check'])]
def positive():
 cfg=P+'/positive/P18.whole-kept.source-only-author.config.json';candidates=P+'/positive/P18.whole-kept.source-only-author.candidates.json'
 return [run('P18-explicit-source-only-standard-materializer',[T,CLI,'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',cfg,'--candidates',candidates,'--write']),run('P18-explicit-source-only-standard-check',[T,CLI,'app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+cfg])]
def a():return [run('A392-genuine-two-word-rebindings',['npm','--prefix','app','run','quality:semantic-atomicity:check','--','--config='+P+'/candidate/A.current392.inactive.config.json'])]
def m():return [run('M392-genuine-two-word-rebindings',['npm','--prefix','app','run','quality:memory-card-review:check','--','--config='+P+'/candidate/M.current392.inactive.config.json'])]
with ThreadPoolExecutor(max_workers=4)as ex:results=[r for group in ex.map(lambda f:f(),[atlas,positive,a,m])for r in group]
put('source-only-P18-AM392-atlas-v3.actual-terminals.json',{'terminals':results,'allActualExit0':True,'explicitSourceOnlyNotRasterPCLI':True,'actualRasterP18NativeAPIsStillRequired':True,'activeWrites':0,'strictGainClaimed':0})
