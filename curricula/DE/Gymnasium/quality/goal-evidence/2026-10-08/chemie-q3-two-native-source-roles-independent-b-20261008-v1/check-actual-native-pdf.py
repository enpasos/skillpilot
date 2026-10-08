"""Read actual PDF objects; match assets by goal ID, not manifest sort order."""
import pathlib, json, hashlib, fitz
out=pathlib.Path(__file__).resolve().parent
author=out.parent/'chemie-q3-two-native-source-roles-resume-technical-20261008-v1'
pdf=author/'native/two/book.pdf'
doc=fitz.open(pdf)
manifest=json.loads((author/'native/two/book.pdf.render-manifest.json').read_text())
ids=['d9cce642-4f89-57f8-832a-abeb62586195','3eada74b-25b8-55dc-811a-acb473196f53']
checks=[]
for n,goalid in enumerate(ids):
    page=doc[n+2];text=page.get_text();images=[]
    for img in page.get_images(full=True):
        data=doc.extract_image(img[0]);images.append({'sha256':'sha256:'+hashlib.sha256(data['image']).hexdigest(),'width':data['width'],'height':data['height'],'format':data['ext']})
    expected=next(a for a in manifest['assets'] if goalid in a['publicPath'])
    checks.append({'goalId':goalid,'physicalPage':n+3,'imageCount':len(images),'actualEmbeddedImages':images,'expectedDerivative':expected,'derivativeBytesMatch':any(i['sha256']==expected['renderedSha256'] and i['width']==expected['renderedWidth'] and i['height']==expected['renderedHeight'] for i in images),'textContainsDescription':'Die lernende Person kann' in text,'completeExtractedPageText':text})
digest='sha256:'+hashlib.sha256(pdf.read_bytes()).hexdigest()
result={'physicalPages':len(doc),'actualPdfSha256':digest,'manifestSha256Exact':digest==manifest['artifactSha256'],'pages':checks,'allPassed':len(doc)==4 and digest==manifest['artifactSha256'] and all(c['derivativeBytesMatch'] and c['textContainsDescription'] for c in checks)}
(out/'actual-native-pdf-pages-and-raster-derivative-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Actual PDF physical pages:',len(doc),'actual derivative hashes and dimensions match:',result['allPassed'])
assert result['allPassed']
