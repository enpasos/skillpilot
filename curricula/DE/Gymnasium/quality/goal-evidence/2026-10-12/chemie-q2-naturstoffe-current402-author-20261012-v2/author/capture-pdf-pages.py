# SPDX-License-Identifier: Apache-2.0
import pathlib,json,subprocess
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2');out=B/'native/actual-whole-pdf-pages';out.mkdir(exist_ok=True);rows=[]
for n in [1,2]:
 d=B/'native'/f'batch-{n}';m=json.loads((d/'book-model.json').read_text());man=json.loads((d/'book.pdf.render-manifest.json').read_text());front=man['frontMatterPageCount']
 for p in m['pages']:
  page=p['pageNumber']+front;dest=out/(p['goalId']+'.actual');r=subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-scale-to-x','1000','-scale-to-y','-1','-singlefile','-png',str(d/'book.pdf'),str(dest)],capture_output=True,text=True)
  if r.returncode:raise RuntimeError(r.stderr)
  t=subprocess.run(['pdftotext','-f',str(page),'-l',str(page),str(d/'book.pdf'),'-'],capture_output=True,text=True)
  if t.returncode:raise RuntimeError(t.stderr)
  rows.append({'goalId':p['goalId'],'physicalPage':page,'sourcePdfPath':str(d/'book.pdf'),'capturePath':str(dest)+'.png','extractedTextCharacters':len(t.stdout)});(out/(p['goalId']+'.actual.txt')).write_text(t.stdout)
(B/'checks/29.actual-native-PDF-page-captures.json').write_text(json.dumps({'records':rows,'renderManifestsPhysicalPages':[17,16],'goalPages':len(rows)},indent=2)+'\n');print(json.dumps({'capturedPDFGoalPages':len(rows)}))
