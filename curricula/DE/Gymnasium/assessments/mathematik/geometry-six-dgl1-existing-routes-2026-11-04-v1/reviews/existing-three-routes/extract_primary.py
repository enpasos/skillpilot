from pathlib import Path
import json,hashlib,subprocess
F=Path(__file__).resolve().parent;R=F.parents[2];D=F/'primary-texts';D.mkdir(exist_ok=True);states=['BB','BE','HB','HH','MV','NI','NW','SH','SL','SN','ST','BW','RP'];docs={}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for state in states:
 paths=list((R/('curricula/DE/Gymnasium/input/'+state+'/lower-secondary/source-extraction')).glob('*MATHEMATIK*.source-extraction.json'))
 assert paths,state
 for p in paths:
  d=json.loads(p.read_text())
  for row in d.get('sourceDocuments',[d['sourceDocument']]):
   if row.get('path'):docs[row['path']]={'jurisdiction':state,**row,'extractionPath':str(p.relative_to(R))}
p=R/'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json';d=json.loads(p.read_text());row=d['sourceDocument'];docs[row['path']]={'jurisdiction':'HE',**row,'extractionPath':str(p.relative_to(R))}
out=[]
for i,(rel,row) in enumerate(docs.items()):
 p=R/rel;target=D/(row['jurisdiction']+'-'+str(i)+'.txt')
 if p.exists():
  r=subprocess.run(['pdftotext','-layout',str(p),str(target)],capture_output=True,text=True);assert r.returncode==0,(p,r.stderr);row.update({'pdfSha256':sha(p),'actualLocalOriginalRead':True,'textFile':str(target.relative_to(F)),'textSha256':sha(target),'physicalPages':len(target.read_text().split('\f'))-1})
 else:row['actualLocalOriginalRead']=False
 out.append(row)
(F/'primary-document-inventory.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps([{k:r[k] for k in ['jurisdiction','path','actualLocalOriginalRead'] if k in r} for r in out],indent=2))
