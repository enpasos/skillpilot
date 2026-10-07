"""Read-only targeted binding/PNG/browser/numerical checks for this visual review."""
import hashlib,json,math,re
from datetime import datetime,timezone
from pathlib import Path
from PIL import Image
ROOT=Path('curricula/DE/Gymnasium/quality/goal-visualization-review')
AUTHOR=ROOT/'chemie-next25-seven-proven-defects-correction-author-20261006-v1'
OWN=ROOT/'chemie-next25-seven-corrections-independent-v-b-20261006-v1'
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def exact(r):
 x=bind(r['path']);assert x['sha256']==r['sha256'].removeprefix('sha256:') and x['bytes']==r['bytes'];return x
fp=AUTHOR/'seven-proven-raster-corrections.author-v1.final.freeze.json'
assert bind(fp)['sha256']=='22bdccf0580f09524039f67aa95a635c74c8bd22efee5b12d76d3f9e92965284'
f=read(fp);author_bindings=[exact(x) for x in f['files']];policy_bindings=[exact(x) for x in f['inputs']]
assert len(author_bindings)==70 and len(policy_bindings)==4
j=read(AUTHOR/'seven-selected-actual-pngs-and-current-goals.raw-independent-review-input.json')
can=read(j['currentCanonical']['path']);by={g['id']:g for g in can['goals']}
current_can_binding=bind(j['currentCanonical']['path'])
current_can_same=current_can_binding['sha256']==j['currentCanonical']['sha256'].removeprefix('sha256:')
report=read(j['strictReport']['path']);chem=next(s for s in report['subjects'] if s['subject']=='chemie')
exact(j['strictReport'])
assert chem['strictComplete']==127 and chem['denominator']==378
browser=read(OWN/'actual-browser-360-680-receipt.independent-b.json');assert len(browser['rows'])==14
rows=[]
for r in j['rows']:
 assert by[r['goalId']]==r['wholeCurrentGoal']
 assert r['goalId'] not in chem['strictCompleteGoalIds']
 asset=exact(r['selectedPNG']);old=[exact(x) for x in r['originalSourceFrontendBackendExactBefore']]
 assert len(old)==3 and len({x['sha256'] for x in old})==1
 exact(r['actualPrompt'])
 with Image.open(asset['path']) as im:
  size=list(im.size);assert im.format=='PNG' and size==r['nativeSize']
 views=[x for x in browser['rows'] if x['goalId']==r['goalId']]
 assert {x['requestedImageWidth'] for x in views}=={360,680}
 for v in views:
  exact(v['screenshot'])
  assert v['selectedAsset']==r['selectedPNG']
  m=v['metrics'];assert m['naturalWidth']==size[0] and m['naturalHeight']==size[1]
  assert m['objectFit']=='contain' and m['maxHeight']=='448px' and m['width']==v['requestedImageWidth']
  assert abs(m['height']-v['requestedImageWidth']*size[1]/size[0])<0.02
  with Image.open(v['screenshot']['path']) as im:
   assert im.width==v['requestedImageWidth'] and abs(im.height-m['height'])<=1
 rows.append({'goalId':r['goalId'],'wholeCurrentGoalExactlyRawInput':True,'wholeCurrentGoalStableSha256':hashlib.sha256(json.dumps(by[r['goalId']],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),'selectedPNG':asset,'actualPNGSize':size,'originalThreeCopies':old,'actualBrowserViews':views,'outsideBoundCurrentStrict127':True})
nist=read(OWN/'actual-NIST-neutral-ionization-retrieval.independent-b.json')
labels=[520,900,801,1086,1402,1314,1681,2081]
numerical=[]
for line,label in zip(nist['actualNeutralElementRows'],labels):
 fields=[x.strip() for x in line.split('|')]
 z,name,symbol=int(fields[0]),fields[1],fields[2]
 ev=float(fields[5]);kj=ev*1.602176634e-19*6.02214076e23/1000
 assert round(kj)==label
 numerical.append({'atomicNumber':z,'element':name,'symbol':symbol,'actualNISTFirstIonizationEV':ev,'derivedKJPerMol':kj,'roundedCandidateLabelKJPerMol':label,'candidateLabelMatchesRoundedReference':True})
assert len(numerical)==8
out={'schemaVersion':1,'checkedAtUTC':datetime.now(timezone.utc).isoformat(),'authorFreeze':bind(fp),'authorPayload70AndPolicy4Exact':True,'wholeSevenCurrentInputsExact':True,'currentCanonical':current_can_binding,'entireCurrentCanonicalExactRawInput':current_can_same,'canonicalFullEqualityAndSevenWholeEqualityNotConflated':True,'boundActualStrictReport':bind(j['strictReport']['path']),'strictCount127Denominator378HistoricalBoundReportNotNewGlobalRun':True,'allSevenOutsideStrict127':True,'assetAndActualBrowserRows':rows,'NISTNumericalReference':{'url':nist['requestedURL'],'rawResponseSha256':nist['responseSha256'],'conversion':'eV per atom × exact elementary charge 1.602176634e-19 J/eV × exact Avogadro constant6.02214076e23 mol-1 /1000','rows':numerical},'nativeDescriptionPositiveOrVisualGlobalGateCheckPerformed':False,'fullAppOrNativeBookAcceptance':False,'technicalChecksAreNotScienceOrSightApproval':True,'activeWrites':False}
(OWN/'actual-seven-goal-png-browser-and-numeric-bindings.independent-b.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'bindingCheck':'PASS','authorPayloads':70,'policyInputs':4,'wholeCurrentGoals':7,'originalAssetCopies':21,'selectedPNGs':7,'actualBrowserViews':14,'referenceNumbers':8,'fullCanonicalExact':current_can_same,'activeWrites':False}))
