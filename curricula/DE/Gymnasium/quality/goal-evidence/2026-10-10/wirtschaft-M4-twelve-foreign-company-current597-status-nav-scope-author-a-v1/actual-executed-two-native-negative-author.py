from pathlib import Path
import json,os,subprocess,hashlib
ROOT=Path('/home/enpasos/projects/skillpilot');O=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-foreign-company-current597-status-nav-scope-author-a-v1';CAP=Path('/tmp/economics-company12-current597-author-a-e3_teq0o/capsule');VR=Path('curricula/DE/Gymnasium/composition-views/wirtschaft');NODE='/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node'
def guard(p):assert p.resolve().is_relative_to(CAP.resolve()) and not p.is_symlink() and not os.path.samefile(p,ROOT/p.relative_to(CAP))
def restore(n):p=CAP/VR/n;guard(p);p.write_bytes((O/'whole-after35views'/n).read_bytes())
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
 w(x);assert count[0]==1,(n,gid,count);b=(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode();p.write_bytes(b);(O/('whole-'+label+'-view.author.json')).write_bytes(b)
def run(label):subprocess.run([NODE,'--import','tsx','scripts/company12Current597WholeStatusNavScopeAuthorA.mts',str(CAP),str(O),str(ROOT),label],cwd=CAP/'app',check=True)
restore('de-he-gym-economics-lk.view.json')
try:
 drop('de-be-gym-economics-gk.view.json','6bb351e1-dfda-5e3d-9e96-fc14419bd24f','negative-BE-GK-framework-material-refdrop');run('own-negative-BE-GK-framework-material-one-refdrop-author-A');restore('de-be-gym-economics-gk.view.json')
 drop('de-he-gym-economics-lk.view.json','7a55332e-7c1d-531a-8679-e18592e74ea2','negative-HE-LK-true-AI-required-ordinary-target-drop');run('own-negative-HE-LK-true-AI-required-ordinary-target-drop-author-A')
finally:
 restore('de-be-gym-economics-gk.view.json');restore('de-he-gym-economics-lk.view.json')
