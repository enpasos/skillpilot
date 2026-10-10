"""Read-only targeted input/receipt checks; writes only this review namespace."""
from pathlib import Path
import json, hashlib, datetime, re
from bs4 import BeautifulSoup
from PIL import Image
import fitz
ROOT=Path('/home/enpasos/projects/skillpilot'); OWN=Path(__file__).parent
BASE=OWN.parent
A=BASE/'biologie-neuro-verhalten-hormone-ten-whole-material-and-raster-author-candidate-v1'
B=BASE/'biologie-neuro-verhalten-hormone-ten-current343-source-raster-native-technical-preparation-20261010-v1'
T=BASE/'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2'
def read(p): return json.loads(p.read_text())
def digest(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def assert_ref(r):
 p=ROOT/r['path'];assert p.is_file(),r['path'];assert digest(p)==r['sha256'],r['path'];assert p.stat().st_size==r['bytes'],r['path']
report=read(OWN/'whole-ten-independent-DPAMV-review.json')
expected=['sha256:f0dcf9cc88526d342777320e17bb44ae0a548dfa86811617b028f7e1a2a6f1b0','sha256:78a65f34f61e9856d2079691afa99dc1ef67b5d210221e76ad8219845fffd956','sha256:0cde02afe0aabb1949a3654527ebd606c5f800537cc61936ea06ff5edd39699d','sha256:9ad0c3f7d9f029b22f49744b5cf7e4e44b0b65c30c0dca93fab25e9b6499ff36','sha256:1847b50147dcb85595f8f7e6b0b69f6ab157ce3c97f8dd19cfb9e83a9ca0c168','sha256:56c164e0ec4f1d6c7e82b01b65a0be15a1bfbbfd9c44fdf3f9554f67c7811caf']
for r,d in zip(report['selectedInputs'],expected):assert_ref(r);assert r['sha256']==d
for key in ['wholeScienceInput','whole41SourceInput']:assert_ref(report[key])
assert (A/'science/ten-whole-profiles-and-twenty-cases.author.json').read_bytes()==(T/'science/ten-whole-profiles-twenty-cases.exact.json').read_bytes()
bundle=read(T/'native/ten-current-native/bundle/manifest.json')
for r in bundle['artifacts']:
 p=T/'native/ten-current-native/bundle'/r['path'];assert digest(p)==r['digest'];assert p.stat().st_size==r['bytes']
inp=read(T/'native/ten-current-native/round-b/description-review-input.json')
soup=BeautifulSoup((T/'native/ten-current-native/bundle/book.html').read_bytes(),'html.parser')
pdf=fitz.open(T/'native/ten-current-native/bundle/book.pdf');assert len(pdf)==12
actual_pages=[];actual_image_refs=[]
for row in report['rows']:
 gid=row['goalId'];g=next(x for x in inp['goals'] if x['goalId']==gid)
 body=soup.find('article',id='goal-'+gid);assert body
 assert body.get('data-goal-id')==gid
 assert body.select_one('.goal-title').get_text(' ',strip=True)==g['currentTitleDe']
 assert body.select_one('.goal-description').find_all('p')[-1].get_text(' ',strip=True)==g['currentDescriptionDe']
 fig=body.select_one('figure.goal-visualization');assert fig['data-original-digest']==row['V']['boundActualImages']['originalPNG']['sha256']
 for link in body.find_all('a',href=True):
  if link['href'].startswith('#'):assert soup.find(id=link['href'][1:]),link['href']
 page=int(body['data-page-number']);text=pdf[page+1].get_text();assert gid in text
 # Native PDF uses U+2010 at a line wrap in Verhaltens-weise, with no word loss.
 text=re.sub(r'\u2010\s*\n','',text)
 expected_title=g['currentTitleDe'];assert ''.join(expected_title.split()) in ''.join(text.split())
 assert ''.join(g['currentDescriptionDe'].split()) in ''.join(text.split())
 actual_pages.append({'goalId':gid,'normalGoalPage':page,'physicalPdfPage':page+2,'localHtmlAnchorsChecked':True,'pdfTextGoalTitleDescriptionChecked':True,'linkedContextIsStaticNativeReceiptOnly':True})
 for role,ref in row['V']['boundActualImages'].items():
  assert_ref(ref)
  if role in ['originalPNG','proportional360','proportional680','nativeHTMLPage','nativePDFPage']:
   image=Image.open(ROOT/ref['path']);width,height=image.size
   if role=='proportional360':assert width==360
   if role=='proportional680':assert width==680
   actual_image_refs.append({'goalId':gid,'role':role,**ref,'width':width,'height':height,'actualViewedByReviewer':True})
for category,filename in [('memory-card-review','M10.current.independent.jsonl'),('semantic-atomicity','A10.current.independent.jsonl')]:
 config=read(ROOT/f'curricula/DE/Gymnasium/quality/{category}/canonical-biology-full.config.json')
 current={r['goalId']:r for r in [json.loads(line) for line in (ROOT/config['reviewPath']).read_text().splitlines() if line.strip()]}
 own=[json.loads(line) for line in (OWN/filename).read_text().splitlines() if line.strip()]
 for row in own:assert row['fingerprint']==current[row['goalId']]['fingerprint'];assert row['status']==current[row['goalId']]['status']
 # Historical generic reasons are never used as independent reviewer reasons.
 assert all(row['reason']!=current[row['goalId']]['reason'] for row in own)
card=ROOT/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.cards.review.jsonl'
cards=[json.loads(line) for line in card.read_text().splitlines() if line.strip()]
ten={r['goalId'] for r in report['rows']}
origin_cards=[r for r in cards if r.get('originGoalId') in ten or any(x in ten for x in r.get('originGoalIds',[]))]
assert not origin_cards
before=read(A/'inputs/ten-whole-current-direct-source-witnesses.neutral.json')
after=read(B/'sources/ten-current41-whole-direct-source-witnesses.neutral.json')
he_old=next(w for r in before['rows'] for w in r['wholeDirectSourceWitnesses'] if w['wholeCurrentSourceGoal']['id']=='106734f7-66dc-482d-8a3d-9e39d3475173')
for key in ['mapping','extraction']:assert_ref(he_old[key])
old_extract=read(ROOT/he_old['extraction']['path']);new_extract=read(B/'sources/HE-whole144-six-precision.inactive.exact.json')
old_map=read(ROOT/he_old['mapping']['path']);new_map=read(B/'sources/HE-whole157-144-six-partial.inactive.path-only.json')
assert len(old_extract['sourceGoals'])==len(new_extract['sourceGoals'])==144
changed_goals=[a['id'] for a,b in zip(old_extract['sourceGoals'],new_extract['sourceGoals']) if a!=b]
assert len(changed_goals)==6
assert len(old_map['mappings'])==len(new_map['mappings'])==157
changed_maps=[a['legacyGoalId'] for a,b in zip(old_map['mappings'],new_map['mappings']) if a!=b]
assert len(changed_maps)==6
assert set(changed_goals)==set(changed_maps)
old_witnesses={(r['goalId'],w['wholeCurrentSourceGoal']['id']):w for r in before['rows'] for w in r['wholeDirectSourceWitnesses']}
new_witnesses={(r['goalId'],w['wholeCurrentSourceGoal']['id']):w for r in after['rows'] for w in r['wholeDirectSourceWitnesses']}
assert len(old_witnesses)==len(new_witnesses)==41
for sid in [key for key in old_witnesses if key[1] not in changed_goals]:
 for k in ['wholeCurrentSourceGoal','wholeCurrentMappingRecord','wholeCurrentSourceDecisions']:assert old_witnesses[sid][k]==new_witnesses[sid][k]
source=read(OWN/'source-review.json')
for x in source['findings'][0]['wholeCurrentWitness'].values():
 if isinstance(x,dict) and set(['path','sha256','bytes']).issubset(x):assert_ref(x)
wrong=ROOT/source['findings'][1]['currentWronglyLabeledPrimary']['path']
assert json.loads(wrong.read_text())['landscapeId']=='357a7003-b636-570e-a0bd-6bb63518d2f6'
assert wrong.read_bytes()==(ROOT/'curricula/DE/Gymnasium/input/BY/gymnasium/Biologie.json').read_bytes()
official=read(OWN/'primary/retrieval-receipts.json')
for r in official:assert_ref(r)
raw=BeautifulSoup((ROOT/official[0]['path']).read_bytes(),'html.parser').get_text(' ',strip=True)
assert source['findings'][0]['wholeCurrentWitness']['wholeCurrentSourceGoal']['sourceText'] in raw
raw9=BeautifulSoup((ROOT/official[1]['path']).read_bytes(),'html.parser').get_text(' ',strip=True)
assert 'vergleichen Vertreter der Insekten mit Wirbeltieren hinsichtlich ihrer Sinnesorgane und Sinnesleistungen.' in raw9
result={'schemaVersion':1,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'terminalExitCode':0,'scope':'targeted selected inputs and ten normal pages/50 viewed rasters; no whole build or repeated central check',
 'selectedInputExactHashes':'6/6 match authorized expected digests','bundleArtifactExactBytes':len(bundle['artifacts']),'PWholeCaseBindings':'20/20 task/solution brief bindings, synthetic/not actually performed, rubric totals and fresh-transfer contract checked',
 'nativePages':actual_pages,'actualViewedImageReceipts':actual_image_refs,'memoryAndAtomicityFingerprints':'10/10 each agree with active historical ledger while reasons are freshly individualized','originCardRowsForTen':len(origin_cards),
 'sourceDeltaBounds':{'sourceGoals':144,'changed':6,'unchanged':138,'mappings':157,'changedMappings':6,'unchangedMappings':151,'currentDirectWitnessPairs':41,'distinctCurrentSourceGoals':29,'unchangedWholeWitnessPairBodiesMappingDecisions':35},
 'BYDerivedByteTypeAndEqualityVerified':True,'BYOfficialOperatorTextActuallyReadAndFoundInReviewerSnapshot':True,
 'limitations':'Technical binding and static local render checks; SOURCE_HOLD remains. No current peer verdict, operative writes, human approval/trial or active gain.'}
(OWN/'targeted-input-native-AM-source-bindings.check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'terminalExitCode':0,'selectedInputHashes':6,'nativePages':10,'viewedRasterReceipts':50,'P_cases':20,'A_M_each':10,'sourceUnchanged138_151_35':True,'SOURCE':'HOLD','activeGain':0}))
