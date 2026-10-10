# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,subprocess,io
from PIL import Image,ImageChops
import fitz
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=B/'biologie-sek1-insect-eight-current-native-and-raster-independent-b-20261010-v1';A=B/'biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1';S=B/'biologie-sek1-insect-eight-frog-adult-targeted-raster-native-author-successor-v2'
def ref(p):
 p=pathlib.Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return dict(path=str(p.relative_to(R)),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def put(p,x):
 with (O/p).open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
pdfchecks=[]
for pkg,n in [(A,8),(S,1)]:
 h=json.load(open(pkg/'checks'/f'actual-whole-native{n}-html-captures.technical.json'));p=json.load(open(pkg/'checks'/f'actual-whole-native{n}-PDF-captures.technical.json'));assert ref(h['normalHTMLPath'])['sha256']==h['normalHTMLSha256']
 for c in h['captures']:
  assert ref(c['capture']['path'])==c['capture'];assert c['actualOriginalBoundRasterDecoded']['complete'];assert (c['actualOriginalBoundRasterDecoded']['width'],c['actualOriginalBoundRasterDecoded']['height'])==(1672,941)
 pdfref=p['normalPDF'] if n==8 else p['actualPDF'];assert ref(pdfref['path'])==pdfref;d=fitz.open(R/pdfref['path']);assert d.page_count==(p['actualPDFTotalPages'] if n==8 else p['actualPdfinfoPages'])
 cs=p['actualCaptures'] if n==8 else [dict(goalId='fcc20f50-8eb3-5d6c-b37f-5be13c7d314e',actualPDFPhysicalPage=p['actualLearningPagePhysicalIndex'],capture=p['capture'])]
 for c in cs:
  cap=c['capture'];assert ref(cap['path'])==cap;page=c['actualPDFPhysicalPage'];opts=['-scale-to-x','1200','-scale-to-y','-1'] if n==8 else ['-scale-to','1700'];cmd=['pdftoppm','-f',str(page),'-l',str(page),'-singlefile','-png',*opts,str(R/pdfref['path'])];r=subprocess.run(cmd,capture_output=True);assert r.returncode==0;raster=Image.open(io.BytesIO(r.stdout)).convert('RGB');bound=Image.open(R/cap['path']).convert('RGB');assert raster.size==bound.size and ImageChops.difference(raster,bound).getbbox() is None;assert c['goalId'] in d[page-1].get_text();pdfchecks.append(dict(goalId=c['goalId'],pdf=pdfref,physicalPage=page,capture=cap,pixelExactFromActualPDF=True,normalRenderer='pdftoppm',renderOptions=opts,wholePage=True,cropped=False,wholeGoalIDPresent=True))
put('normal/actual-native-capture-source-bindings.actual.json',dict(schemaVersion=1,role='Actual full PDF page pixel recomputation and bound native HTML provenance; substantive whole views already recorded independently',wholePDFPagesPixelExact=9,PDFChecks=pdfchecks,wholeHTMLCaptureMetadataAndOriginalRasterDecodedVerified=True,actualOriginalNativeHTMLPDFViews=16,actualSuccessorNativeHTMLPDFViews=2,technicalProbeHistoryDe='Erster lokaler Pixelvergleich mit PyMuPDF war wegen anderem Renderer nicht pixelgleich und stoppte nach A/M8 PASS. Original8-Captures sind exakt Poppler -scale-to-x1200/-scale-to-y-1, neueFCC exakt Poppler -scale-to1700; anschließender tatsächlicher Vergleich aller9 PNG-Pixel mit gebundenen ganzen PDF-Seiten PASS. Keine Bild-/Wissenschaftsbefunde aus dem Rendererunterschied abgeleitet.',fullExtractedPDFTextWrittenUnderCurricula=False,authorScientificApprovalInherited=False,activeWrites=False,humanApproval=False,strictNetGain=0,errors=[],exitCode=0))
print(json.dumps(dict(actualWholePDFCapturePixelBindings=len(pdfchecks),exitCode=0)))
