# SPDX-License-Identifier: Apache-2.0
"""Export actual bounded PDF pages and neutral exact page inputs; no D votes."""
from pathlib import Path
import datetime,hashlib,json,re,subprocess,sys
R=Path.cwd();O=Path(__file__).resolve().parents[1];label=sys.argv[1];assert label in ['six','neighbor-two'];B=O/('native-'+label);bundle=B/'bundle'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
f=load(O/'INPUTS.final-six-stable-bodies-images-and-successor-material.json');p=load(O/'PREPARED.exact-six-body-composition-and-current-binding-inventory.awaiting-b47.json');model=load(bundle/'book-model.json');inp=load(B/'round-a/description-review-input.json');assert (B/'round-a/description-review-input.json').read_bytes()==(B/'round-b/description-review-input.json').read_bytes()
assert len(model['pages'])==inp['goalCount']==(6 if label=='six' else 2)
pdf=bundle/'book.pdf';before=ref(pdf);result=subprocess.run(['pdftotext','-layout',str(pdf),'-'],capture_output=True,check=True);parts=result.stdout.decode().split('\f');P=O/('pages-'+label);assert not P.exists();P.mkdir();whole=P/'whole-actual-bounded-PDF.extracted-text.txt';whole.write_bytes(result.stdout)
canonical=load(R/f['canonical']['path']);by={g['id']:g for g in canonical['goals']};assets={r['goalId']:r for r in f['imageRows']};pages=[]
for g in inp['goals']:
 gid=g['goalId'];matches=[(i+1,t) for i,t in enumerate(parts) if re.search(r'Lernziel-ID\s+'+re.escape(gid)+r'\b',t)];assert len(matches)==1,(gid,len(matches));physical,text=matches[0];prefix=P/gid
 txt=P/(gid+'.actual-page.txt');txt.write_text(text)
 source=P/(gid+'.actual-whole-goal-and-page-input.json');put(source,{'schemaVersion':1,'wholeCurrentCanonicalGoal':by[gid],'actualStockDescriptionReviewInputGoal':g,'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'noReviewVerdicts':True})
 argv=['pdftoppm','-f',str(physical),'-l',str(physical),'-r','120','-png','-singlefile',str(pdf),str(prefix)];r=subprocess.run(argv,capture_output=True,check=True);png=Path(str(prefix)+'.png');assert png.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
 pages.append({'goalId':gid,'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'actualPhysicalPDFPage':physical,'goalPageNumber':g['reviewContext']['page']['pageNumber'],'actualWholeGoalAndPageInput':ref(source),'actualPagePng120dpi':ref(png),'actualWholePageText':ref(txt),'exactPrimaryImage':assets[gid]['physicalRepositorySource'],'profileIsNull':g['reviewContext']['evidenceProfile'] is None,'exportArgv':argv})
assert ref(pdf)==before
for side in ['a','b']:assert list((B/('round-'+side)/'results').iterdir())==[]
assert list((B/'resolutions').iterdir())==[]
selector=P/'NEUTRAL.actual-current-native-pages-and-review-input.selector.json';seal=P/'FILES.actual-current-native-pages-and-review-input.seal.json'
put(selector,{'schemaVersion':1,'role':'Neutral actual stock Native pages and complete current whole-goal/page inputs only; no own, historical or peer D judgments',
 'batch':label,'goalIds':[r['goalId'] for r in pages],'canonical':f['canonical'],'semantic':ref(R/f['semanticOutputPath']),'visualizationQA':f['visualizationQA'],
 'actualBookModel':ref(bundle/'book-model.json'),'actualBookHtml':ref(bundle/'book.html'),'actualBookPdf':before,'actualBundleManifest':ref(bundle/'manifest.json'),'actualBatchManifest':ref(B/'batch-manifest.json'),
 'roundAInput':ref(B/'round-a/description-review-input.json'),'roundACampaign':ref(B/'round-a/description-review-campaign.json'),'roundBInput':ref(B/'round-b/description-review-input.json'),'roundBCampaign':ref(B/'round-b/description-review-campaign.json'),
 'actualPages':pages,'wholePdfText':ref(whole),'Q2SevenWholeCurrentCasesAndRubrics':f['currentSevenWholeRoutes'],'otherWholeAvailableRawCasesAndRubrics':f['otherWholeCasesAndRubrics'],
 'literalQ2SourceAndMemoryBoundary':p['rawLiteralSourceAndMemory'],'actualFourBookCandidateProfiles':ref(R/f['finalBookProfilesPath']),
 'independenceBoundary':'Read exact whole canonical goals, actual pages, raw cases/material/rubrics and raw profiles. No prior/peer D judgments or synthesized D findings are supplied.',
 'additionalCurrentF4ExecutionMaterialMayArriveAsSeparateNeutralAddendum':True,'laterCaseMaterialAddendumDoesNotRerenderTheseExactPages':True,
 'newScientificVotes':0,'newDescriptionRecords':0,'HumanApproval':False,'HumanTrial':False,'finalSealPath':seal.relative_to(R).as_posix()})
files=sorted([x for x in P.rglob('*') if x.is_file()]+[x for x in B.rglob('*') if x.is_file()]);put(seal,{'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Exact actual bounded Native batch and page exports; neutral only','files':[ref(x) for x in files],'newScientificVotes':0})
print(json.dumps({'neutralSelector':ref(selector),'seal':ref(seal),'actualPages':len(pages),'actualModelDigest':model['digest'],'PDF':before,'pageFingerprints':{r['goalId']:r['pageFingerprint'] for r in pages}}),flush=True)
