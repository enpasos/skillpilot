"""Deterministic PDF viewing derivatives for technical render inspection only."""
from pathlib import Path
import fitz,json,hashlib
O=Path(__file__).resolve().parents[1];R=next(p for p in O.parents if (p/'AGENTS.md').is_file())
assert not (O/'FILES.finite-carbonyl15-native-technical.seal.json').exists()
p=O/'native15/bundle/book.pdf';d=fitz.open(p);v=O/'views';v.mkdir(exist_ok=True)
rows=[];texts=[]
for i,page in enumerate(d):
 f=v/f'page-{i+1:02}.png';pix=page.get_pixmap(matrix=fitz.Matrix(1.2,1.2),alpha=False);pix.save(f);text=page.get_text();texts.append(f'=== Physical PDF page {i+1} ===\n'+text)
 rows.append({'physicalPageNumber':i+1,'imagePath':f.relative_to(R).as_posix(),'imageSHA256':'sha256:'+hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size,'width':pix.width,'height':pix.height,'textCharacters':len(text),'unicodeReplacementCharacters':text.count('\ufffd'),'embeddedImageOccurrences':len(page.get_images())})
(v/'all-seventeen.actual-pdf-text.txt').write_text('\n\n'.join(texts))
receipt={'schemaVersion':1,'role':'PDF rendered page derivatives for human/agent technical inspection; no D/V vote','pdf':{'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size},'physicalPages':len(d),'renderScale':1.2,'pages':rows,'visualInspectionCompleted':False,'newScientificVotes':0}
(O/'checks/PDF.actual-seventeen-rendered-views.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'pages':len(d),'viewBytes':sum(r['bytes'] for r in rows),'replacementCharacters':sum(r['unicodeReplacementCharacters'] for r in rows)}))
