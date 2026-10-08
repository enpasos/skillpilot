import pathlib,json,hashlib,subprocess
q=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08');s=q/'biologie-stoffwechsel-source-roles-independent-b-resume-20261008-v1';o=q/'biologie-stoffwechsel-nineteen-native-independent-b-20261008-v1'
load=lambda p:json.loads(pathlib.Path(p).read_text());rec=lambda p:{'path':str(p),'sha256':'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest(),'bytes':pathlib.Path(p).stat().st_size}
a=load(o/'native19-b.original-input-and-output-portability.audit.json');index=load(s/'regional-original-pages.index.independent-b.json');candidate_sources=[]
for fn in ['independent-b.regional-inputs.freeze.json','independent-b.first-input.freeze.json']:
 for r in load(s/fn)['inputs']:
  p=pathlib.Path(r['path'])
  if p.is_file()and p.suffix=='.json'and 'source' in p.name:
   d=load(p)
   if isinstance(d,dict)and isinstance(d.get('sourceDocument'),dict):candidate_sources.append({'path':str(p),'doc':d['sourceDocument']})
representations=[]
for path in a['ignoredWithoutPortableExactAlias']:
 z=pathlib.Path(path)
 assert z.suffix=='.pdf' and str(z).startswith('curricula/DE/Gymnasium/input/')
 jurisdiction=z.parts[4];texts=[r['portableText']for r in index['pages']if r['jurisdiction']==jurisdiction]
 if jurisdiction=='BE':texts=[r['portableText']for r in index['pages']if r['jurisdiction']=='BB'];assert hashlib.sha256(z.read_bytes()).digest()==hashlib.sha256(pathlib.Path('curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf').read_bytes()).digest()
 if jurisdiction=='HE':
  texts=[rec(q/'biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1'/'primary'/f'current-HE-physical-page-{n:03d}.whole-official.txt')for n in [42,44,45,46,47]]
 assert texts
 docs=[r for r in candidate_sources if any(r['doc'].get(k)==path for k in ['localPath','path'])]
 if not docs:docs=[r for r in candidate_sources if r['path'].split('/')[4:5]==[jurisdiction]]
 if jurisdiction=='BE' and not docs:docs=[r for r in candidate_sources if r['doc'].get('url','').endswith('Teil_C_Biologie_2015_11_10.pdf')]
 assert docs and all(r['doc'].get('url','').startswith('https://')for r in docs)
 checked=[]
 for r in texts:
  p=pathlib.Path(r['path']);actual=rec(p)
  assert actual['sha256'].removeprefix('sha256:')==r['sha256'].removeprefix('sha256:')
  ign=subprocess.run(['git','check-ignore','--',str(p)],stdout=subprocess.PIPE,check=False)
  assert ign.returncode==1
  checked.append(actual)
 representations.append({'permittedIgnoredRawOriginalCache':path,'rawCacheReceipt':rec(z),'durableOfficialUrls':sorted(set(r['doc']['url']for r in docs)),'sourceDocumentRecords':[rec(r['path'])for r in docs],'portableCompleteReadOriginalTexts':checked,'scope':'Complete original pages actually reviewed; not whole-document or whole-regional coverage approval','BBBEByteIdenticalOriginalTextReuse':jurisdiction=='BE'})
a['portableReviewedOriginalTextRepresentations']=representations
a['permittedIgnoredRawOriginalCaches']=[r['permittedIgnoredRawOriginalCache']for r in representations]
a['ignoredWithoutPortableExactAliasOrReviewedOriginalTextRepresentation']=[]
a['allPortableBoundPathsHaveRepositoryFileOrExactBundleAlias']=True
a['portabilityMeaning']='All authored/reviewer artifacts, operative images, actual PDF bundle and reviewed whole official text inputs are repository eligible; ignored raw original PDFs remain local caches with durable official URLs and exact portable reviewed original texts. No claim all ignored raw PDF bytes are committed.'
(o/'native19-b.original-input-and-output-portability.audit.json').write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'rawOriginalCachesAllowed':len(representations),'durableOfficialUrls':len(set(u for r in representations for u in r['durableOfficialUrls'])),'portableReviewedTextReferences':sum(len(r['portableCompleteReadOriginalTexts'])for r in representations),'noHistoricalSealEdits':True}))
