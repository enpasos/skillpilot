from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
import json,hashlib,requests,fitz
ROOT=Path.cwd();OWN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1'
targets=[('he-current-2026.pdf','https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf'),('he-original-2024.pdf','https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-chemie.pdf'),('by-10-ch.html','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch'),('by-10-ntg.html','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg'),('rp-mss-2022.pdf','https://bildung.rlp.de/lehrplaene/?tx_rlpbase_download%5Bitem%5D=67901&type=432522'),('eu1333-20260818.html','https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:02008R1333-20260818')]
def fetch(t):
 name,url=t
 try:
  r=requests.get(url,timeout=45);body=r.content;is_pdf=body.startswith(b'%PDF');blocked=b'not a robot' in body or b'JavaScript is disabled' in body
  valid=r.status_code==200 and not blocked and (is_pdf if name.endswith('.pdf') else len(body)>5000)
  p=OWN/'primary-inputs'/name
  if valid:p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_bytes(body)
  return {'url':url,'resolvedURL':r.url,'httpStatus':r.status_code,'contentType':r.headers.get('Content-Type'),'bytes':len(body),'sha256':'sha256:'+hashlib.sha256(body).hexdigest(),'validContent':valid,'antiBotPage':blocked,'savedPath':str(p.relative_to(ROOT)) if valid else None}
 except Exception as e:return {'url':url,'validContent':False,'error':str(e)}
with ThreadPoolExecutor(max_workers=6) as pool: rows=list(pool.map(fetch,targets))
for row in rows:
 if row['validContent'] and row['savedPath'].endswith('.pdf'):
  p=ROOT/row['savedPath'];doc=fitz.open(p);row['pageCount']=len(doc)
  (p.with_suffix('.txt')).write_text('\n'.join(f'\nPAGE {i+1}\n'+page.get_text() for i,page in enumerate(doc)))
  if 'he-' in p.name:
   matches=[i for i,page in enumerate(doc) if 'Q1.3' in page.get_text() and 'Substanzklasse der Carbonsäuren' in page.get_text() or 'Q1.5' in page.get_text() and 'Ascorbinsäure als Antioxidans' in page.get_text()]
   row['actualTargetPages']=[i+1 for i in matches]
   for i in matches:doc[i].get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(OWN/'primary-inputs'/f'{p.stem}-page-{i+1}.png')
(OWN/'targeted-primary-http-and-byte-bindings.actual.receipt.json').write_text(json.dumps({'observedAtUTC':datetime.now(timezone.utc).isoformat(),'rows':rows,'notGlobalSourceMigration':True,'activeWrites':0},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(rows))
