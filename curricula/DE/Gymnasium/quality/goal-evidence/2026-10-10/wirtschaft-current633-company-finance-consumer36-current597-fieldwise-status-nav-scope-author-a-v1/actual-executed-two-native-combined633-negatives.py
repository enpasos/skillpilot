from pathlib import Path
import json,os,subprocess
ROOT=Path('/home/enpasos/projects/skillpilot');O=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current633-company-finance-consumer36-current597-fieldwise-status-nav-scope-author-a-v1';CAP=Path('/tmp/economics-combined633-current597-author-a-ltxjeoi7/capsule');VR=Path('curricula/DE/Gymnasium/composition-views/wirtschaft');NODE='/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node'
def guard(p):assert p.resolve().is_relative_to(CAP.resolve()) and not p.is_symlink() and not os.path.samefile(p,ROOT/p.relative_to(CAP))
def restore(n):p=CAP/VR/n;guard(p);p.write_bytes((O/'whole-after35views'/n).read_bytes())
def saveview(n,x,label):p=CAP/VR/n;guard(p);b=(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode();p.write_bytes(b);a=O/('whole-'+label+'-view.author.json');assert not a.exists();a.write_bytes(b)
def drop(n,gid,label):
 p=CAP/VR/n;guard(p);x=json.loads(p.read_text());count=[0]
 def w(n):
  if not isinstance(n,dict):return
  for k,v in n.items():
   if isinstance(v,list):
    out=[]
    for z in v:
     if isinstance(z,dict) and z.get('kind')=='goalEntry' and z.get('goalId')==gid and z.get('projectionRole','target')=='target':count[0]+=1
     else:out.append(z)
    n[k]=out
    for z in out:w(z)
   elif isinstance(v,dict):w(v)
 w(x);assert count[0]==1;saveview(n,x,label)
def run(label):subprocess.run([NODE,'--import','tsx','scripts/companyFinanceConsumer36Current597Combined633ScopeAuthorA.mts',str(CAP),str(O),str(ROOT),label],cwd=CAP/'app',check=True)
try:
 drop('de-bb-gym-economics-gk.view.json','d876a7e3-9b19-51c5-86e3-4b123dffcb99','negative-BB-GK-consumption-options-material-one-refdrop');run('own-negative-BB-GK-consumption-options-material-one-refdrop-author-A');restore('de-bb-gym-economics-gk.view.json')
 n='de-he-gym-economics-gk.view.json';x=json.loads((CAP/VR/n).read_text());gid='622b3b81-e7b8-5d02-801f-e30b764f2054';text=json.dumps(x);assert gid not in text;x['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':gid,'displayLabel':'Echte Negativprobe: Journalistik trotz fehlender Pflichtvoraussetzungen','projectionRole':'target'});saveview(n,x,'negative-HE-GK-journalism-hidden-whole-closure-access-injection');run('own-negative-HE-GK-journalism-hidden-whole-closure-access-injection-author-A')
finally:
 restore('de-bb-gym-economics-gk.view.json');restore('de-he-gym-economics-gk.view.json')
