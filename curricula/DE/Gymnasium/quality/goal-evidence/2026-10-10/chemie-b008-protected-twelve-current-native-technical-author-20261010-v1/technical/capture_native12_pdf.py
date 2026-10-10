# SPDX-License-Identifier: Apache-2.0
"""All twelve actual native PDF pages; capture is not scientific approval."""
from pathlib import Path
import hashlib,json,fitz
R=Path.cwd();D=Path(__file__).resolve().parent.parent;B=D/'native/current-12/bundle'
def ref(f):
 b=f.read_bytes();return {'path':str(f.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
manifest=json.loads((B/'manifest.json').read_text());renderer=json.loads((B/'book.pdf.render-manifest.json').read_text());pdf=fitz.open(B/'book.pdf')
assert renderer['goalPageCount']==12 and pdf.page_count==12+renderer['frontMatterPageCount'];captures=[]
for row in manifest['goals']:
 index=renderer['frontMatterPageCount']+row['pageNumber']-1;page=pdf[index];assert row['goalId']in page.get_text()
 f=D/'native/captures/pdf-whole-pages'/f"{row['goalId']}.actual-whole-pdf-page.png";f.parent.mkdir(parents=True,exist_ok=True);pix=page.get_pixmap(matrix=fitz.Matrix(96/72,96/72));pix.save(f)
 captures.append({'goalId':row['goalId'],'physicalPageIndexZeroBased':index,'physicalPageNumber':index+1,'wholeGoalPageNumber':row['pageNumber'],'captureDpi':96,'captureDimensions':[pix.width,pix.height],'normalWholePdf':ref(B/'book.pdf'),'wholeRendererManifest':ref(B/'book.pdf.render-manifest.json'),'goalFingerprint':row['goalFingerprint'],'pageFingerprint':row['pageFingerprint'],'capture':ref(f)})
pdf.close();assert len(captures)==12 and len({x['goalId']for x in captures})==12
(D/'checks/actual-whole12-native-pdf-captures.technical.json').write_text(json.dumps({'schemaVersion':1,'role':'All actual normal PDF goal pages captured at96dpi; not mobile delivery or independent approval','captures':captures,'actualWholePdfPageCount':12,'independentApproval':False,'humanApproval':False,'activeWrites':[],'strictGain':0},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actualWholePdfPageCount':12,'allPdfGoalIdsConfirmed':True,'independentApproval':False}))
