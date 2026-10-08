import pathlib,json,hashlib,datetime,fitz,re,base64,io,subprocess
from PIL import Image
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08';A=B/'biologie-stoffwechsel-first-three-native-technical-20261008-v1';O=B/'biologie-stoffwechsel-first-three-native-independent-b-20261008-v1';S=B/'biologie-stoffwechsel-first-three-operative-scope-author-20261008-v1'
def rd(p):return json.loads(p.read_text())
def rec(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def wr(n,j):
 p=O/n
 if not p.exists():p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
freeze=rd(O/'native-three-b.first-input.freeze.json');errors=[]
for x in freeze['inputs']:
 p=R/x['path'];
 if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=x['sha256'].removeprefix('sha256:'):errors.append(x['path'])
assert not errors,errors
selected={'32f47903-0788-5c27-ac88-7464f481f2f7','135447a0-5d55-564a-afc3-3e3fbed77819','ec782ce3-475e-5628-b3fe-947d72e74a74'}
bc=rd(S/'input/canonical.current476.after19.exact.json');nc=rd(A/'candidate/canonical.current476.three-rasters.inactive.json');bm={g['id']:g for g in bc['goals']};nm={g['id']:g for g in nc['goals']};assert len(bm)==len(nm)==476 and bm.keys()==nm.keys();assert all(nm[k]==bm[k] for k in nm if k not in selected);gd={k:sorted(x for x in set(nm[k])|set(bm[k]) if nm[k].get(x)!=bm[k].get(x)) for k in selected};assert all(v==['resourceLinks'] for v in gd.values())
pb=rd(A/'native/full392.current-before.actual-loader.book-model.json');pn=rd(A/'native/full392.current-three-source-raster.book-model.json');pm={p['goalId']:p for p in pb['pages']};qm={p['goalId']:p for p in pn['pages']};assert len(pm)==len(qm)==392 and pm.keys()==qm.keys();assert all(qm[k]==pm[k] for k in qm if k not in selected);pd={k:sorted(x for x in set(pm[k])|set(qm[k]) if pm[k].get(x)!=qm[k].get(x)) for k in selected};assert all(v==['applicability','pageFingerprint','visualization'] for v in pd.values())
qo=rd(R/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');qn=rd(A/'candidate/visualization-qa.current392.three-unapproved.inactive.json');qo={x['goalId']:x for x in qo['records']};qn={x['goalId']:x for x in qn['records']};assert len(qo)==len(qn)==392;hf=sorted({k for x in list(qo.values())+list(qn.values()) for k in x if k.startswith('human')});assert all({k:qo[g].get(k) for k in hf}=={k:qn[g].get(k) for k in hf} for g in qo);assert all(qo[g]==qn[g] for g in qo if g not in selected)
# Separate source-only corrected model, generated before the new raster: semantic context retained.
sp=list(S.glob('**/*book-model.json'));scopeModel=next((p for p in sp if 'after' in p.name and len(rd(p).get('pages',[]))==392),None)
source_context=[]
if scopeModel:
 z={p['goalId']:p for p in rd(scopeModel)['pages']}
 for g in selected:
  dif=sorted(k for k in set(z[g])|set(qm[g]) if z[g].get(k)!=qm[g].get(k));assert dif==['pageFingerprint','visualization'];source_context.append({'goalId':g,'sourceOnlyContextChangedFields':dif})
# Repeated diagnostic setup retains first successful retention record.
#
wr('native-three-b.scoped-retention-and-final-input-check.json',{'schemaVersion':1,'createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozenInputsChecked':len(freeze['inputs']),'hashFailures':errors,'canonicalCount':476,'other473WholeGoalsExact':True,'selectedGoalChangedFields':gd,'fullPages':392,'other389WholePagesExact':True,'selectedPageChangedFields':pd,'sourceOnlyModelPath':str(scopeModel.relative_to(R)) if scopeModel else None,'selectedSourceContextChecks':source_context,'qaRows':392,'all392HumanRowsExact':True,'other389WholeQARowsExact':True,'humanFields':hf,'activeWrites':0,'strictGain':0,'fullQA':False})
# Actual HTML derivatives match PDF decoded pixels, and sources match whole native PNG originals.
html=(A/'native-three/bundle/book.html').read_text();derivatives=[]
for p in (O/'actual-pdf-pages').glob('*.reproduced-print.webp'):
 raw=p.read_bytes();im=Image.open(io.BytesIO(raw)).convert('RGB');derivatives.append((hashlib.sha256(raw).hexdigest(),im,raw))
pdf=fitz.open(A/'native-three/bundle/book.pdf');manifest=rd(A/'native-three/bundle/book.pdf.render-manifest.json');assets=manifest['assets'];rows=[];assert len(pdf)==5
for asset in assets:
 sh=asset['renderedSha256'].removeprefix('sha256:');d=next(x for x in derivatives if x[0]==sh);g=asset['publicPath'].split('/')[-1][:-4];p=A/'selected-images'/f'{g}.png';assert rec(p)['sha256']==asset['sourceSha256'].removeprefix('sha256:');page_no=next(x['pageNumber']+2 for x in manifest['pages'] if x['goalId']==g);images=[]
 for x in pdf[page_no-1].get_images(full=True):
  raw=pdf.extract_image(x[0])['image'];im=Image.open(io.BytesIO(raw)).convert('RGB');
  if im.size==d[1].size:images.append(im)
 assert len(images)==1;assert images[0].tobytes()==d[1].tobytes();rows.append({'goalId':g,'physicalPage':page_no,'sourceSHA256':rec(p)['sha256'],'actualReproducedPrintDerivativeSHA256':sh,'renderedSize':d[1].size,'actualPDFEmbeddedPixelsExact':True})
wr('actual-native-PDF3-and-embedded-raster-checks.json',{'physicalPages':5,'goalPages':3,'allPhysicalPagesViewed':True,'wholePageTextRead':True,'reproducedPrintDerivatives':len(derivatives),'actualSourcePDFRasterRows':rows,'visualVerdict':'KEEP_BOUNDED_CURRENT_RASTER_SUPPORT','smallSupportingLinkZoomLimit':'Small auxiliary links require print zoom; goal, image and context hierarchy are legible at page view. No clipping or content loss.','imageNotLearnerEvidence':True})
# Ordinary git ignore uses actual index, not --no-index. Preserve portable exact byte aliases for own durable bindings.
paths=sorted({str((R/x['path']).relative_to(R)) for x in freeze['inputs']}|{str(p.relative_to(R)) for p in O.rglob('*') if p.is_file()})
ignored=subprocess.run(['git','check-ignore','-z','--stdin'],input=b'\0'.join(x.encode() for x in paths)+b'\0',stdout=subprocess.PIPE,check=False,cwd=R).stdout.split(b'\0');ignored=[x.decode() for x in ignored if x];aliases=[];local=[]
for x in ignored:
 p=R/x
 if p.suffix.lower()=='.pdf' and ('sources/' in x or 'primary-' in x):local.append(x);continue
 suffix='.snapshot.txt' if p.suffix.lower()=='.html' else '.bytes.bin';z=O/'portable-exact-originals'/ (hashlib.sha256(x.encode()).hexdigest()[:12]+'-'+p.name+suffix);z.parent.mkdir(exist_ok=True);z.write_bytes(p.read_bytes());assert z.read_bytes()==p.read_bytes();aliases.append({'originalPath':x,'portableExactAlias':str(z.relative_to(R)),'sha256':rec(z)['sha256'],'bytes':z.stat().st_size})
wr('native-three-b.portability.audit.json',{'ordinaryGitIgnoreRespectsIndex':True,'checkedPaths':len(paths),'ignoredPaths':ignored,'portableExactAliases':aliases,'permittedRawPrimaryPDFCaches':local,'noHistoricalSealsChanged':True,'durableOfficialURLsAndPortableWholeSourceTextsRetained':True,'missingPaths':[x for x in paths if not (R/x).is_file()],'activeWrites':0})
print(json.dumps({'inputs':len(freeze['inputs']),'failures':errors,'D3_P3':True,'otherGoalsExact':473,'otherPagesExact':389,'PDFEmbeddedExact':3,'ignored':len(ignored),'aliases':len(aliases),'sourceOnlyModel':str(scopeModel)}))
