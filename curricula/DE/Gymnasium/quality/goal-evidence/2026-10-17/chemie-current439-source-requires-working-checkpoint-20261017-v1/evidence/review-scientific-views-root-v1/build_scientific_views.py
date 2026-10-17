import copy,datetime,hashlib,json
from pathlib import Path
O=Path(__file__).resolve().parent;B=O.parent
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,j):
 assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');return pin(p)
GOAL_FIELDS=['id','shortKey','title','titleEn','description','descriptionEn','type','nodeKind','semanticKind','phase','area','level','core','weight','tags','competencyRefs','dimensionTags','applicability','requires','contains','examples','sourceRef','resourceLinks','assessment','examData']
EXT_FIELDS=['provenance','scopeBoundary','acquisitionExtensions','prerequisiteRationale','applicabilityMappingInheritance','applicabilityFromRequires']
P_FIELDS=['goalId','goalFingerprint','profileRuleVersion','profileFingerprint','status','reviewAuthority','evidenceLevel','maximumClaimScope','profile']
def goal_view(g):
 if not isinstance(g,dict):return g
 v={k:g[k] for k in GOAL_FIELDS if k in g}
 ext=g.get('extendedData',{});safe={k:ext[k] for k in EXT_FIELDS if k in ext}
 if safe:v['extendedData']=safe
 return v
packages=[
 ('requires20',B/'current439-requires-only-native20-preparation-technical-c-v1/SELECTOR.clean-current-native20-reviewer-inputs.sealed.json','1d7d28b1ca939583b38a2760e871746770fa4d0920b482b1443c326f1bb79e6d'),
 ('P13',B/'current439-P13-native-preparation-technical-root-v1/SELECTOR.clean-current-native13-reviewer-inputs.sealed.json','45ac7189db1533bbda09ca83b03f007a78269903a57db3e80b51cd4e855be3c7'),
 ('mixed18',B/'current439-remaining-mixed18-preparation-technical-c-v1/SELECTOR.clean-current-native18-reviewer-inputs.sealed.json','b31969c32adc7b450881d87d6f7243bc6150194febfcbc979b79fe5c1f774492')]
results=[]
for name,sel,sha in packages:
 assert pin(sel)['sha256']==sha;s=read(sel);root=Path(s['nativeRoot'])
 first_path=root/'round-a/description-review-input.json';second_path=root/'round-b/description-review-input.json'
 first=read(first_path);second=read(second_path);assert first==second
 supplement_pin=next(p for p in s['cleanSupplementPins'] if 'whole-C-whole-P-and-teacher-source-context' in p['path'])
 assert pin(supplement_pin['path'])['sha256']==supplement_pin['sha256']
 supplement=read(supplement_pin['path']);by={r['goalId']:r for r in supplement['rows']};rows=[]
 for g in first['goals']:
  row=by[g['goalId']];ctx=copy.deepcopy(g['reviewContext']);P=ctx['evidenceProfile']
  safeP={k:P[k] for k in P_FIELDS if k in P};safePage={k:v for k,v in ctx['page'].items() if k!='evidenceReview'}
  safe={k:v for k,v in g.items() if k!='reviewContext'}
  safe['reviewContext']={'page':safePage,'evidenceProfile':safeP}
  teacher=copy.deepcopy(row['teacherContext'])
  for k in ['currentDirectPrerequisiteWholeGoals','currentDirectParentWholeClusters']:
   if k in teacher:teacher[k]=[goal_view(x) for x in teacher[k]]
  safe['currentCanonicalScientificFields']=goal_view(row['currentWholeCanonicalGoal'])
  safe['teacherContext']=teacher
  safe['currentDirectSourcePartnersForAuthoredJurisdictions']=row['currentDirectSourcePartnersForAuthoredJurisdictions']
  assert safeP['profile']==row['currentWholePositiveEvidenceRecord']['profile']
  assert safe['canonicalContext']==g['canonicalContext']
  assert safe['reviewContext']['page']['visualization']==ctx['page']['visualization']
  rows.append(safe)
 view={'schemaVersion':1,'role':'Exact current scientific input projection; historical review metadata unavailable in this view',
  'scope':name,'goalIds':s['goalIds'],'originalReviewInputFingerprint':first['reviewInputFingerprint'],
  'originalBundleFingerprint':s['bundleFingerprint'],'originalBookDigest':s['bookDigest'],
  'sourceInputPins':[pin(first_path),pin(second_path),supplement_pin],
  'selectionRule':'Complete current DE/EN, canonicalContext, whole P.profile and current page/link/image objects copied unchanged. P reason/reviewer/reviewRunIds/dissent and page.evidenceReview omitted. Raw canonical authorDraft/authorRemediation/review-result fields omitted. Source provenance and authored scope/acquisition/prerequisite rationale retained as current claims to check, never acceptance evidence.',
  'nativeInputsEdited':False,'newScienceVotes':0,'humanApproval':False,'goals':rows}
 vp=O/f'REVIEW.{name}.whole-scientific-content.no-historical-review-metadata.json';vpin=write(vp,view)
 selector={'role':'Reviewers read this scientific view for actual judgments; raw native files only for technical serialization after FIRST',
  'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'view':vpin,
  'originalFrozenSelector':pin(sel),'nativeRoot':str(root),'capsule':s['capsule'],
  'goalIds':s['goalIds'],'rounds':s['rounds'],'bundleArtifactPins':s['bundleArtifactPins'],
  'technicalBindingRule':'Use original frozen campaign/batch/input fingerprints and exact native artifacts. This view does not create a new campaign or rewrite any judgment. Do not dump original reviewContext or P wrappers; reason can contain earlier reviewer decisions.',
  'currentProfileStatusIsInputDataNotAcceptance':True,'reviewOutcomesPredetermined':False,'newScienceVotes':0,'humanApproval':False}
 sp=O/f'SELECTOR.{name}.scientific-view-for-independent-review.json';spin=write(sp,selector);results.append({'scope':name,'selector':spin,'view':vpin})
write(O/'RECEIPT.actual-fieldwise-scientific-projections-three-frozen-packages.json',{'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'results':results,'allNativeInputsUnchanged':True,'fieldSelectionDoesNotConstituteReview':True,'newScienceVotes':0})
print(json.dumps(results))
