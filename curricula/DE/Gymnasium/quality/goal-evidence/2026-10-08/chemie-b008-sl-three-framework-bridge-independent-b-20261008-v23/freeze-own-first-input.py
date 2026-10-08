import pathlib,json,hashlib,datetime,fitz
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08';A=B/'chemie-b008-sl-three-framework-bridge-author-root-20261008-v23';O=B/'chemie-b008-sl-three-framework-bridge-independent-b-20261008-v23';O.mkdir(exist_ok=True)
def rd(p):return json.loads(p.read_text())
def rec(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
se=rd(A/'author.first.freeze.json');e=rd(A/'neutral-three-current-SL-framework-bridges.author.entry.json');docs=rd(A/'actual-framework-documents-and-whole-page-readings.author.json');bridge=rd(A/'current-SL-subject-to-framework-binding.author.json');receipts=se['payloads']+[rec(A/'author.first.freeze.json')]+[e['previousAuthorSeal'],e['wholePreviousAuthorEntry']];receipts += [rec(B/'chemie-b008-sl-specific-source-placement-independent-b-20261008-v21/source-placement-b.first-verdict.seal.json')]
for d in docs['documents']:
 p=R/d['localWholePrimaryCachePath'];receipts.append({**rec(p),'sourceKey':d['key'],'expectedSHA256':d['actualHttpReceipt']['sha256']});assert rec(p)['sha256']==d['actualHttpReceipt']['sha256']
for d in bridge['upperCourseReferences']+bridge['lowerCurrentFrameworkReferences']:receipts.append(d['actualLocalDocumentBinding'])
receipts += [bridge['currentUpperExtractionBinding'],rd(A/'three-whole-current-targets-and-evidence-bridges.author-candidate.json')['wholeCandidateBinding']]
fail=[]
for x in receipts:
 if rec(R/x['path'])['sha256']!=x['sha256'].removeprefix('sha256:'):fail.append(x['path'])
assert not fail;paths={x['path']:x for x in receipts};(O/'sl-framework-b.first-input.freeze.json').write_text(json.dumps({'createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputs':list(paths.values()),'inputHashFailures':fail,'peerNewSLSourceAReadBeforeFirstSeal':False,'oldOwnV21SealImmutable':True,'activeWrites':0,'strictGain':0},ensure_ascii=False,indent=2)+'\n')
readings=[]
for d in docs['documents']:
 readings.append((d['key'],R/d['localWholePrimaryCachePath'],[x['physicalPage'] for x in d['actuallyReadWholePages']]))
for d in bridge['upperCourseReferences']+bridge['lowerCurrentFrameworkReferences']:
 readings.append((d.get('wholeExistingSourceDocumentReference',{}).get('key',pathlib.Path(d['actualLocalDocumentBinding']['path']).stem),R/d['actualLocalDocumentBinding']['path'],[x['physicalPage'] for x in d['actuallyReadWholePages']]))
whole=[]
for key,p,pgs in readings:
 doc=fitz.open(p)
 for n in pgs:
  text=doc[n-1].get_text();whole.append({'sourceKey':key,'sourcePath':str(p.relative_to(R)),'physicalPage':n,'wholeTextSHA256':hashlib.sha256(text.encode()).hexdigest(),'wholeActualPageText':text,'wholePageReadPendingB':True})
(O/'whole-original-pages.actual-independent-b.input.json').write_text(json.dumps({'rows':whole,'pageCount':len(whole),'documentCount':len(readings),'rawThirdPartyPDFRepublication':False,'durableURLs':[{ 'key':d['key'],'url':d['portableSourceRoute']} for d in docs['documents']]},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipts':len(paths),'pages':len(whole),'documents':len(readings),'hashFailures':fail}))
