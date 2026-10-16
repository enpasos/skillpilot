# SPDX-License-Identifier: Apache-2.0
"""Rasterise the four actual goal pages of the already generated final PDF once."""
import datetime,hashlib,json,subprocess,time
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];B=OWN/'native-four/bundle';OUT=OWN/'pages';assert not OUT.exists();OUT.mkdir()
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
model=json.loads((B/'book-model.json').read_text());pdf=B/'book.pdf';before=ref(pdf)
argv=['pdftotext','-layout',str(pdf),'-'];t=subprocess.run(argv,capture_output=True,check=True);text=t.stdout.decode();parts=[p for p in text.split('\f') if p.strip()];assert len(parts)==6
(OUT/'whole-actual-six-PDF-pages.extracted-text.txt').write_bytes(t.stdout)
rows=[]
for page in model['pages']:
 matches=[(i+1,p) for i,p in enumerate(parts) if page['goalId'] in p];assert len(matches)==1,(page['goalId'],matches)
 physical,body=matches[0];assert physical==page['pageNumber']+2 and page['title'] in body
 prefix=OUT/f"PDF.physical-{physical:02d}.{page['goalId'][:8]}";cmd=['pdftoppm','-f',str(physical),'-l',str(physical),'-r','120','-png','-singlefile',str(pdf),str(prefix)]
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();clock=time.monotonic();r=subprocess.run(cmd,capture_output=True,check=True);png=prefix.with_suffix(prefix.suffix+'.png')
 assert png.read_bytes().startswith(b'\x89PNG\r\n\x1a\n');txt=prefix.with_suffix(prefix.suffix+'.txt');txt.write_text(body)
 rows.append({'goalId':page['goalId'],'goalPageNumber':page['pageNumber'],'physicalPdfPage':physical,'title':page['title'],'actualExtractedText':ref(txt),'actualFullPagePng':ref(png),'argv':cmd,'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-clock,3),'exitCode':r.returncode})
assert ref(pdf)==before
receipt={'schemaVersion':1,'role':'Actual exact PDF-page exports, no new book render or scientific review','pdf':before,'actualPhysicalPdfPages':len(parts),'actualGoalPages':len(rows),'fullPdfText':ref(OUT/'whole-actual-six-PDF-pages.extracted-text.txt'),'rows':rows,'rasterExports':4,'nativePrepareRuns':1,'nativeCheckRuns':1,'secondNativeBookRenders':0,'scientificReviewVotes':0}
(OWN/'checks/PAGES.actual-final-native4-pdf-to-png-and-text.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pdfPages':len(parts),'targetPages':len(rows),'actualPngExports':4,'pdfUnchanged':True,'newScienceVotes':0}))
