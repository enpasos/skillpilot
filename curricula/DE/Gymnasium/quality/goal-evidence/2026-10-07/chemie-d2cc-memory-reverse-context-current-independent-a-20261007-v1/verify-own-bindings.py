#!/usr/bin/env python3
import datetime,hashlib,json,pathlib,subprocess
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OWN=pathlib.Path(__file__).resolve().parent
AUTHOR=OWN.parent/'chemie-d2cc-memory-reverse-context-current-neutral-author-20261007-v1'
def read(p):return json.loads(p.read_text())
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
checks=[]
def check(name,condition,details=None):
    checks.append({'name':name,'pass':bool(condition),'details':details})
    if not condition:raise AssertionError(name)
freeze=read(AUTHOR/'author.final.freeze.json')
check('author final freeze identity',digest((AUTHOR/'author.final.freeze.json').read_bytes())=='sha256:de0d883bf9f352a34397e7d6bd86ee638923a09185b17804c74a809251825624')
for f in freeze['files']:
    p=AUTHOR/f['path'];check('frozen payload '+f['path'],digest(p.read_bytes())==f['sha256'] and p.stat().st_size==f['bytes'])
neutral=read(AUTHOR/'native/one/current-neutral-full-input.json')
delta=read(AUTHOR/'actual-page-context-delta.json');before=delta['before'];after=delta['after']
changed=sorted(k for k in set(before)|set(after) if before.get(k)!=after.get(k))
check('only full-book two expected page fields changed',changed==['externalReverseRequires','pageFingerprint'],changed)
memory=neutral['newMemorySupportGoal'];goal=neutral['wholeSelectedGoals'][0]
check('downstream memory requires selected indicator goal',memory['requires']==[goal['id']] and memory['nodeKind']=='memory' and memory['contains']==[])
check('only correct full-book new memory reverse link',before['externalReverseRequires']==[] and len(after['externalReverseRequires'])==1 and after['externalReverseRequires'][0]['goalId']==memory['id'] and after['externalReverseRequires'][0]['title']==memory['title'] and after['externalReverseRequires'][0]['canonicalUrl'].endswith('#goal-'+memory['id']))
check('selected prerequisite unchanged',goal['requires']==[x['goalId'] for x in after['requires']] and memory['id'] not in goal['requires'])
native=OWN/'native-d-one';inp=read(native/'description-review-input.json');g=inp['goals'][0];page=g['reviewContext']['page']
model=read(AUTHOR/'native/one/book-model.json')
check('actual native model exact review page',len(model['pages'])==1 and model['pages'][0]==page)
check('unchanged goal fingerprint through all actual contexts',before['goalFingerprint']==after['goalFingerprint']==page['goalFingerprint']==g['goalFingerprint']=='sha256:ac9de7e503ad973109172b3c35acf3a6a29c588d2262d6a4b6eeaa436561dda3')
check('native and full-book current fingerprints kept distinct',page['pageFingerprint']=='sha256:49c3619edd75442687e618974e5db3ad97a59fbdb5992e296a188481dd810173' and after['pageFingerprint']=='sha256:86992d152979bc5a932c796bdaee78f6d1b2055a2d8d9b4c0a38c1f9b9cea352')
check('native scope only converts links to external context',page['requires']==[] and page['reverseRequires']==[] and [x['goalId'] for x in page['externalPrerequisites']]==goal['requires'] and [x['goalId'] for x in page['externalReverseRequires']]==[memory['id']]+[x['goalId'] for x in after['reverseRequires']])
check('whole DE EN exact native values',all(g[k]==goal[v] for k,v in [('currentTitleDe','title'),('currentTitleEn','titleEn'),('currentDescriptionDe','description'),('currentDescriptionEn','descriptionEn')]))
check('unchanged image and substantive page content',all(before[k]==after[k]==page[k] for k in ['title','description','breadcrumbs','chapterIds','visualization','evidenceReview']))
asset=ROOT/'app/public'/page['visualization']['url'].lstrip('/')
check('actual unchanged frontend image bytes',digest(asset.read_bytes())==page['visualization']['originalDigest']=='sha256:cf6f69ccb31591750a925603b9930d57edb0f9f0112c6512b28ad674a561f7f8')
bundle=read(native/'review-bundle-manifest.json')
pdf=AUTHOR/'native/one/book.pdf';pdfartifact=next(x for x in bundle['artifacts'] if x['role']=='book_pdf')
check('actual PDF native bundle exact bytes',digest(pdf.read_bytes())==pdfartifact['digest'] and pdf.stat().st_size==pdfartifact['bytes'])
txt=subprocess.run(['pdftotext','-f','3','-l','3','-layout',str(pdf),'-'],text=True,capture_output=True,check=True).stdout
(OWN/'checks').mkdir(exist_ok=True);(OWN/'checks/actual-pdf-physical3.fresh.txt').write_text(txt)
check('actual physical page identifies selected and downstream goals',goal['id'] in txt and memory['id'] in txt and 'Direkt aufbauende Ziele außerhalb dieses Buchs' in txt and 'Säuren- und Basennamen mit Formeln' in txt and 'Lösungen und Löslichkeit beschreiben' in txt)
check('fresh supplied and own PDF raster exact',digest((AUTHOR/'native/one/actual-goal-pages/page-3.png').read_bytes())==digest((OWN/'inspection-captures/actual-pdf-physical3.png').read_bytes()))
a=read(native/'description-review-campaign.json');b=read(AUTHOR/'native/one/round-b/description-review-campaign.json')
check('blind native A B metadata separate',all(a[k]!=b[k] for k in ['campaignId','roundId','independenceGroupId']) and all(a[k]==b[k] for k in ['bundleFingerprint','bookDigest','reviewInputFingerprint']) and a['blindToOtherReviews'] and b['blindToOtherReviews'] and a['reviewPass']==b['reviewPass']=='first_pass' and a['batchSize']==b['batchSize']==20)
batch=a['batches'][0];raw=native/'results'/(batch['batchId']+'.records.jsonl');run=read(native/'results'/(batch['batchId']+'.run.json'));records=[json.loads(l) for l in raw.read_text().splitlines()]
check('persisted raw native output exact order digest terminal',run['status']=='completed' and run['outputDigest']==digest(raw.read_bytes()) and [r['goalId'] for r in records]==batch['goalIds']==run['goalIds'] and records[0]['decision']=='keep' and records[0]['pageFingerprint']==page['pageFingerprint'] and run['blindToOtherRuns'])
seal=read(OWN/'first-scientific-pass.seal.json')
for f in seal['payloads']:
    p=OWN/f['path'];check('own scientific seal intact '+f['path'],digest(p.read_bytes())==f['digest'] and p.stat().st_size==f['bytes'])
result={'status':'PASS','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorPayloadCount':len(freeze['files']),'checks':checks,'reviewAuthority':'ai_candidate','humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGain':0,'historicalSourcePImageScienceRestudied':False}
(OWN/'checks/own-freeze-current-context-page-bindings.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS: 36 frozen author payloads, exact two-key delta, actual PDF3/context/image bindings and native D1 raw/seal.')
