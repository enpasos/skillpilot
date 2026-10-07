import datetime,hashlib,json,pathlib,fitz,re
root=pathlib.Path('/home/enpasos/projects/skillpilot')
base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
author=base+'chemie-current-atomic-description-positive-gap-author-v1/'
own=base+'chemie-current-fifteen-native-d-independent-b-v1/'
inputs={}
def bind(p):
 b=(root/p).read_bytes();inputs[p]=dict(path=p,sha256=hashlib.sha256(b).hexdigest(),bytes=len(b));return b
def read(p):return json.loads(bind(p))
freeze=read(author+'native-d-stage-v1.final.freeze.json')
assert inputs[author+'native-d-stage-v1.final.freeze.json']['sha256']=='67643647266f6dbb6661e7b4e6636e509694bd6215d8976c9730ecc1af16adbf'
verified=[];skipped=[];drift=[]
for item in freeze['files']+freeze['externalNativeInputBindings']:
 p=item['path']
 if '/round-a/' in p:skipped.append(dict(path=p,reason='Blind B: peer-round input bytes not read'));continue
 b=bind(p);actual=inputs[p]['sha256'];expected=item.get('sha256',item.get('digest','')).replace('sha256:','')
 if actual!=expected or len(b)!=item['bytes']:drift.append(dict(path=p,expected=item,actual=inputs[p]))
 verified.append(inputs[p])
assert not drift,json.dumps(drift)
model=read(author+'native-d-fifteen/bundle/book-model.json')
pdfManifest=read(author+'native-d-fifteen/bundle/book.pdf.render-manifest.json')
assert pdfManifest['physicalPageCount']==17 and pdfManifest['goalPageCount']==15
doc=fitz.open(stream=bind(author+'native-d-fifteen/bundle/book.pdf'),filetype='pdf')
assert len(doc)==17
images=[]
for page in model['pages']:
 id=page['goalId'];vis=page['visualization'];public=vis['url'];asset=next(a for a in pdfManifest['assets'] if a['publicPath']==public)
 copies=[f'curricula/DE/Gymnasium/visualizations/chemie/{id}/{id}.jpg','app/public'+public,'backend/src/main/resources/static'+public]
 hashes=['sha256:'+hashlib.sha256(bind(p)).hexdigest() for p in copies]
 assert len(set(hashes))==1 and hashes[0]==vis['originalDigest']==asset['sourceSha256']
 physical=page['pageNumber']+2;pdfPage=doc[physical-1]
 embedded=pdfPage.get_images(full=True);assert len(embedded)==1
 im=doc.extract_image(embedded[0][0]);embedDigest='sha256:'+hashlib.sha256(im['image']).hexdigest()
 assert embedDigest==asset['renderedSha256']
 dest=own+f'actual-pages/embedded-{page["pageNumber"]:02d}.jpg';(root/dest).write_bytes(im['image'])
 # Chromium inserts U+2010 at actual line wrapping; retain all other glyphs.
 text=pdfPage.get_text();normalize=lambda t:re.sub(r'\s+','',re.sub('[\u2010]\\n','',t))
 assert id in text and normalize(page['description']) in normalize(text)
 images.append(dict(goalId=id,goalPage=page['pageNumber'],physicalPage=physical,originalCopies=copies,originalSha256=hashes[0],embeddedPDFSha256=embedDigest,embeddedOutputPath=dest,renderManifestExactlyMatched=True,wholeDescriptionActuallyExtracted=True,goalIdActuallyExtracted=True,publicationApproved=vis['approvedForPublication'],modelQaStatus=vis['qaStatus']))
he=read('curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024_CURRENT2026.source-extraction.json')
sourcePath=he['sourceDocument']['path'];bind(sourcePath)
passages=[dict(topicCode=p['topicCode'],page=p['page'],literalPassageSourcePath=p.get('sourcePath'),actualSourceDocumentPath=sourcePath,rawText=p.get('rawText')) for p in he['passages'] if p['topicCode'] in ['E.3','Q1.1','Q1.2','Q2.1']]
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
(root/own/'actual-author-freeze-and-material-bindings.independent-b.json').write_text(json.dumps(dict(schemaVersion=1,createdAtUTC=now,authorFreezeSha256=inputs[author+'native-d-stage-v1.final.freeze.json']['sha256'],verifiedAuthorInputCount=len(verified),skippedBlindPeerInputs=skipped,actualAuthorInputDrift=drift,physicalPDFPages=17,goalPages=15,images=images,primaryOriginalSource=he['sourceDocument'],primaryPassages=passages,actualInputs=list(inputs.values()),PAuthorStageIncluded=False,peerAResultsRead=False,newVisualizationApproval=False,activeWrites=False,humanApproval=False),ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(status='PASS',authorVerified=len(verified),blindPeerInputsSkipped=len(skipped),originalImages=15,originalCopies=45,actualEmbeddedPDFImages=15)))
