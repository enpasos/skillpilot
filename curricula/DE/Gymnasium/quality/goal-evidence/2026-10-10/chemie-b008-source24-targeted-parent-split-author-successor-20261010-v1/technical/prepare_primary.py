# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import requests,hashlib,json,tempfile,os,datetime,concurrent.futures
from bs4 import BeautifulSoup
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/m7-resumption-20261010/chemistry-source24-author'
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1')
OLD=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/primary-inputs')
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,b):
 p=R/p;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),str(p)
 if isinstance(b,dict):b=(json.dumps(b,ensure_ascii=False,indent=2)+'\n').encode()
 elif isinstance(b,str):b=b.encode()
 with tempfile.NamedTemporaryFile(dir=T,delete=False) as f:f.write(b);stage=f.name
 os.replace(stage,p)
original=json.loads((R/OLD/'actual-official-fetch.receipt.json').read_text())['documents']
def fetch(d):
 r=requests.get(d['requestedURL'],timeout=25);r.raise_for_status();name=d['name'];(T/(name+'.live-full-html.cache')).write_bytes(r.content)
 s=BeautifulSoup(r.content,'html.parser');main=s.find('main',id='main');assert main,name
 sections=main.find('div',id='content__sections');assert sections,name
 selected=[]
 for node in sections.children:
  if not getattr(node,'name',None):continue
  h=node.find('h2')
  if h and 'Lernbereich 2:' in h.get_text(' ',strip=True):break
  selected.append(str(node))
 text=BeautifulSoup('\n'.join(selected),'html.parser').get_text('\n',strip=True)+'\n'
 assert 'Lernbereich 1:' in text,name
 p=P/'primary'/f'{name}.whole-learning-area1.actual.txt';put(p,text)
 return {'name':name,'requestedURL':d['requestedURL'],'finalURL':r.url,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'statusCode':r.status_code,'wholeFetchedHTMLBytes':len(r.content),'wholeFetchedHTMLSha256':'sha256:'+hashlib.sha256(r.content).hexdigest(),'wholeFetchedHTMLIsLocalCacheNotAuthority':True,'frozenPriorWholeHTML':ref(OLD/f'{name}.html'),'currentWholeLearningArea1':ref(p),'remainingLearningAreasNotNewlyReviewed':True,'reviewGrant':False}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:docs=list(ex.map(fetch,[d for d in original if d['name'].startswith('by')]))
put(P/'primary/actual-current-official-BY-whole-learning-area1-fetch.receipt.json',{'schemaVersion':1,'documents':docs,'scope':'Whole actual process learning area1 for targeted Source24 author inspection only; not whole course/source approval','humanApproval':False,'activeWrites':False,'strictGain':0})
print(json.dumps({'wholeOfficialProcessAreasFetched':len(docs),'statusCodes':[x['statusCode'] for x in docs],'primaryPaths':[x['currentWholeLearningArea1']['path'] for x in docs]},indent=2))
