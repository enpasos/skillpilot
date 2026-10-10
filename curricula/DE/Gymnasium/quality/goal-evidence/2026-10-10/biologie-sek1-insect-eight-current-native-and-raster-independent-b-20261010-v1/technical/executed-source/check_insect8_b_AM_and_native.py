# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,subprocess,datetime
from PIL import Image,ImageChops
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=B/'biologie-sek1-insect-eight-current-native-and-raster-independent-b-20261010-v1';A=B/'biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1';S=B/'biologie-sek1-insect-eight-frog-adult-targeted-raster-native-author-successor-v2'
def ref(p):
 p=pathlib.Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return dict(path=str(p.relative_to(R)),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def put(p,x):
 p=O/p;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
 return ref(p)
e=json.load(open(A/'neutral-eight-current-insect-native.independent-review.entry.json'));ids=e['goalIds'];x=json.load(open(A/'inputs/existing394-atomicity-memory-cards-and-visibility.exact.references.json'))
for b in x['inputs']:assert ref(b['path'])==b
base=B/'biologie-q1-eight-reviewed-integration-technical-portable-successor-v2';landscape=S/'candidate/whole479-with-eight-rasters-fcc-adult.inactive.json';configs=[]
for label,n in [('A','A394.future-active.config.json'),('M','M394.future-active.config.json')]:
 c=json.load(open(base/'candidate'/n));raw=(R/c['reviewPath']).read_bytes().splitlines(keepends=True);selected=[line for line in raw if json.loads(line)['goalId'] in ids];assert len(selected)==8
 rp=O/'atomicity-memory'/(label+'8.unchanged-retained.exact.jsonl');rp.parent.mkdir(parents=True,exist_ok=True)
 with rp.open('xb') as f:f.write(b''.join(selected))
 records=[json.loads(v) for v in selected]
 assert all(r['status']==('atomic' if label=='A' else 'no_memory_needed') for r in records)
 assert all(not r.get('memoryGoalIds') and not r.get('deckIds') for r in records) if label=='M' else True
 out={k:c[k] for k in ['schemaVersion','reviewId','ruleVersion','landscapeId']};out.update(landscapePath=str(landscape.relative_to(R)),reviewPath=str(rp.relative_to(R)),scope=dict(label='Exactly8 current insect goals: exact original A/M records retained, current normal fingerprint check only; no new whole atomicity/memory review',leafGoalIds=ids))
 if label=='M':
  cp=O/'atomicity-memory/M8.zero-scoped-cards.actual.jsonl';cp.open('xb').close();out['cardReviewPath']=str(cp.relative_to(R));out['visibilityScopes']=c['visibilityScopes'];out['visibilityScopeCoverageRequired']=True
 cfg=put('atomicity-memory/'+label+'8.current-normal-fingerprint-only.config.json',out);configs.append((label,cfg))
for label,cfg in configs:
 cmd=['npx','--prefix','app','tsx','app/scripts/'+('semanticAtomicityReview.ts' if label=='A' else 'memoryCardReview.ts'),'--config='+cfg['path'],'--mode=check'];r=subprocess.run(cmd,capture_output=True,text=True)
 for role,text in [('stdout',r.stdout),('stderr',r.stderr)]:
  p=O/'normal'/(label+'8-normal-check.'+role+'.actual.txt');p.write_text(text)
 receipt=put('normal/'+label+'8-normal-check.actual.json',dict(schemaVersion=1,role='Actual unchanged normal CLI targeted current fingerprint check only; original whole A/M review retained',command=cmd,config=cfg,stdout=ref(O/'normal'/(label+'8-normal-check.stdout.actual.txt')),stderr=ref(O/'normal'/(label+'8-normal-check.stderr.actual.txt')),exitCode=r.returncode,retainedOriginalRecords=8,newWholeAtomicityMemoryApproval=False,activeWrites=False,humanApproval=False,strictNetGain=0));print(json.dumps(dict(role=label,exitCode=r.returncode,stdout=r.stdout[-2200:],stderr=r.stderr[-1000:]),ensure_ascii=False));assert r.returncode==0
# Capture provenance checked from actual bound full source pages. PDF pixel verification recomputes pages without retaining extracted PDF text.
import fitz
pdfchecks=[]
for pkg,entry,htmlname,pdfname in [(A,e,'actual-whole-native8-html-captures.technical.json','actual-whole-native8-PDF-captures.technical.json'),(S,json.load(open(S/'neutral-current-fcc-adult-raster-native.independent-review.entry.json')),'actual-whole-native1-html-captures.technical.json','actual-whole-native1-PDF-captures.technical.json')]:
 h=json.load(open(pkg/'checks'/htmlname));p=json.load(open(pkg/'checks'/pdfname));print('capture keys',pkg.name,list(h),list(p))
 html_path=h.get('normalHTMLPath');assert html_path and ref(html_path)['sha256']==h['normalHTMLSha256']
 for c in h['captures']:
  assert ref(c['capture']['path'])==c['capture'];assert c['actualOriginalBoundRasterDecoded']['complete'];assert (c['actualOriginalBoundRasterDecoded']['width'],c['actualOriginalBoundRasterDecoded']['height'])==(1672,941)
 pdfref=p['normalPDF'];assert ref(pdfref['path'])==pdfref
 d=fitz.open(R/pdfref['path']);assert d.page_count==p['actualPDFTotalPages']
 for c in p['actualCaptures']:
  cap=c['capture'];assert ref(cap['path'])==cap;page=d[c['actualPDFPhysicalPage']-1];im=Image.open(R/cap['path']);scale=im.width/page.rect.width
  matches=[]
  for z in [2.02,2,scale]:
   pix=page.get_pixmap(matrix=fitz.Matrix(z,z),alpha=False);render=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
   if render.size==im.size and ImageChops.difference(render,im.convert('RGB')).getbbox() is None:matches.append(z)
  assert matches,(cap['path'],im.size,page.rect,scale)
  text=page.get_text();assert c['goalId'] in text;pdfchecks.append(dict(goalId=c['goalId'],pdf=pdfref,physicalPage=c['actualPDFPhysicalPage'],capture=cap,pixelExactFromActualPDF=True,renderScale=matches[0],wholePage=True,cropped=False,wholeGoalIDPresent=True))
put('normal/actual-native-capture-source-bindings.actual.json',dict(schemaVersion=1,role='Actual PDF whole-page pixel recomputation and original native capture provenance verification; substantive views already recorded independently',wholePDFPagesPixelExact=len(pdfchecks),PDFChecks=pdfchecks,wholeHTMLCaptureMetadataAndOriginalRasterDecodedVerified=True,actualOriginalNativeHTMLPDFViews=16,actualSuccessorNativeHTMLPDFViews=2,fullExtractedPDFTextWrittenUnderCurricula=False,authorScientificApprovalInherited=False,activeWrites=False,humanApproval=False,strictNetGain=0,errors=[],exitCode=0))
print(json.dumps(dict(A8='PASS',M8='PASS',actualWholePDFCapturePixelBindings=len(pdfchecks),exitCode=0)))
