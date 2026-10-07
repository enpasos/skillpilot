#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Public primary retrieval and input snapshot, entirely in this new author dossier."""
import datetime
import hashlib
import json
import pathlib
import subprocess
import urllib.request
from bs4 import BeautifulSoup

OUT = pathlib.Path(__file__).resolve().parent
ROOT = pathlib.Path(__file__).resolve().parents[7]
DAY = OUT.parent
ROUTING = DAY / 'biologie-neuro-th-hh-forty-reviewed-components-native-overlay-preparation-v1'
PRIMARY = OUT / 'primary'
PRIMARY.mkdir(exist_ok=True)
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
def rel(p): return str(p.relative_to(ROOT))
def write(name,j):
    p=OUT/name
    assert not p.exists(), p
    p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')

route_freeze=read(ROUTING/'native-overlay-preparation-v1.final.freeze.json')
for b in route_freeze['files']:
    assert sha(ROUTING/b['path'])==b['sha256'], b['path']
receipt_path=ROOT/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'
receipt=read(receipt_path)
bindings={b['path']:b for b in receipt['inputBindings']}
extra=[
    'AGENTS.md',
    'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-he-original-spelling-nw-two-source-components-author-v3/NW.two-bacterial-source-components.author-v3.candidate.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-he-original-spelling-nw-two-source-components-author-v3/NW.two-bacterial-component-mappings.author-v3.candidate.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-he-original-spelling-nw-two-source-components-author-v3/he-raw-nw-two-components.author-v3.final.freeze.json',
]
for p in [receipt_path,ROUTING/'native-overlay-preparation-v1.final.freeze.json']+[ROOT/x for x in extra]:
    bindings[rel(p)]={'path':rel(p),'sha256':sha(p)}
for b in bindings.values(): assert sha(ROOT/b['path'])==b['sha256'], b['path']
initial_receipt = {
    'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'routingFreeze':{'path':rel(ROUTING/'native-overlay-preparation-v1.final.freeze.json'),'sha256':sha(ROUTING/'native-overlay-preparation-v1.final.freeze.json'),'all58FrozenFilesExact':True},
    'actualInputBindings':list(bindings.values()),
    'activeWrites':False,'gitMutation':False,'newScientificApproval':False,
}
if not (OUT/'current-inputs-and-routing.initial.actual.receipt.json').exists():
    write('current-inputs-and-routing.initial.actual.receipt.json',initial_receipt)
else:
    for b in read(OUT/'current-inputs-and-routing.initial.actual.receipt.json')['actualInputBindings']:
        assert sha(ROOT/b['path'])==b['sha256'], b['path']
urls={
    'HE.current-official.pdf':('https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'),
    'BY13-EA.current-official.html':('https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/erhoeht',None),
    'BY13-GA.current-official.html':('https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/grundlegend',None),
    'NW.current-official.pdf':('https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_bi_klp_-3413_2019_06_23_0.pdf','curricula/DE/Gymnasium/input/NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf'),
}
downloads=[]
for name,(url,local) in urls.items():
    p=PRIMARY/name
    request=urllib.request.Request(url,headers={'User-Agent':'SkillPilot public curriculum author verification'})
    with urllib.request.urlopen(request,timeout=60) as response:
        data=response.read(); p.write_bytes(data)
        d={'url':url,'finalUrl':response.url,'httpStatus':response.status,'contentType':response.headers.get('Content-Type'),'bytes':len(data),'savedPath':rel(p),'sha256':sha(p),'retrievedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    if local:
        d['existingLocalDocumentPath']=local;d['existingLocalDocumentSha256']=sha(ROOT/local)
        d['byteExactWithExistingLocalDocument']=sha(p)==sha(ROOT/local)
        assert d['byteExactWithExistingLocalDocument'], d
    else:
        soup=BeautifulSoup(data,'html.parser')
        for node in soup(['script','style']):node.decompose()
        text=soup.get_text('\n',strip=True)
        textpath=PRIMARY/name.replace('.html','.actual-text.txt')
        textpath.write_text(text+'\n');d['actualTextPath']=rel(textpath);d['actualTextSha256']=sha(textpath)
    downloads.append(d)
for name,source,page in [('HE43',PRIMARY/'HE.current-official.pdf',43),('HE33',PRIMARY/'HE.current-official.pdf',33),('NW35',PRIMARY/'NW.current-official.pdf',35)]:
    for suffix,args in [('actual-text.txt',['-layout']),('actual-bbox.html',['-bbox-layout'])]:
        subprocess.run(['pdftotext','-f',str(page),'-l',str(page),*args,str(source),str(PRIMARY/(name+'.'+suffix))],check=True)
    subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-singlefile','-scale-to','1800','-png',str(source),str(PRIMARY/(name+'.actual-raster'))],check=True)
write('fresh-official-primary-retrieval.actual.receipt.json',{
    'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'retrievals':downloads,
    'generatedActualLocalPDFRasters':['HE43.actual-raster.png','HE33.actual-raster.png','NW35.actual-raster.png'],
    'rasterGenerationIsNotViewing':True,'actualViewingPending':True,
    'activeWrites':False,'globalBuild':False,'centralRun':False,
})
print(json.dumps({'status':'FRESH_PRIMARY_BYTES_AND_LOCAL_RASTERS_READY_VIEW_PENDING','retrievals':[{'name':pathlib.Path(d['savedPath']).name,'sha256':d['sha256'],'bytes':d['bytes']} for d in downloads]},ensure_ascii=False))
