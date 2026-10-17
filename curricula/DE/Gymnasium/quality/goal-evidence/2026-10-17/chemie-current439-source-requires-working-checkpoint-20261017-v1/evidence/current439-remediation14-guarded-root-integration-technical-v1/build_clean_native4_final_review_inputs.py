"""Project only actual scientific fields from a separately prepared native4 successor."""
from pathlib import Path
import copy,datetime,hashlib,json,sys
O=Path(__file__).resolve().parent;K=O/'capsule';B=O.parent
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def verify(expected):
 actual=pin(expected['path']);assert actual['sha256']==expected['sha256'] and actual['bytes']==expected['bytes'],expected['path']
def put(p,obj):
 assert p.is_relative_to(O) and not p.exists();p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
 return pin(p)
def pointer(obj,ptr):
 for part in ptr.lstrip('/').split('/'):
  key=part.replace('~1','/').replace('~0','~');obj=obj[int(key)] if isinstance(obj,list) else obj[key]
 return obj
def strip_meta(value):
 if isinstance(value,list):return [strip_meta(v) for v in value]
 if isinstance(value,dict):return {k:strip_meta(v) for k,v in value.items() if k not in {'authorRemediation','newIndependentReviewStatus','reviewer','reviewRunIds','dissent','authorRecommendation','evidenceReview','authorStatus','independentApproval','independentReview'}}
 return value
prep_path=Path(sys.argv[1]);prep=read(prep_path);version=sys.argv[2]
assert prep['capsule']==str(K) and version=='v3'
R=K/prep['reviewRootRelativePath'];native=Path(prep['nativeRoot']);ids=prep['goalIds'];chosen=set(ids)
assert len(chosen)==4
old_view_path=B/'current439-remediation14-author-assembly-technical-v1/REVIEW.remediation14.whole-scientific-content.no-review-metadata.json'
assert pin(old_view_path)['sha256']=='ad7697eac18a77b8516062b4b27fe3793a6d4888cfe1d79f6327f709106ec8b8'
old=read(old_view_path);old_rows={g['goalId']:g for g in old['goals']}
manifest=read(native/'batch-manifest.json');cfg=read(K/prep['configRelativePath']);base=read(K/cfg['baseGoalBookConfigPath'])
model=read(native/'bundle/book-model.json');pages={p['goalId']:p for p in model['pages']}
assert len(pages)==4
raw=read(native/'round-a/description-review-input.json');assert raw==read(native/'round-b/description-review-input.json')
assert ids==[g['goalId'] for g in raw['goals']]
records={json.loads(l)['goalId']:json.loads(l) for l in (K/base['evidenceReviewPaths'][0]).read_text().splitlines() if l.strip()}
assert len(records)==439
land=read(K/base['landscapePath']);goals={g['id']:g for g in land['goals']}
assert pin(K/base['landscapePath'])['sha256']==old['sourceCanonicalPin']['sha256']
materials=prep['operativeV3MaterialPins'];by_source={item['source']['path']:item for item in materials}
bindings_pin=prep['operativeMaterialBindings'];verify(bindings_pin);bindings=read(bindings_pin['path'])['bindings']
operative=[]
for b in bindings:
 assert b['goalId'] in chosen
 source=b['wholeMaterial'];verify(source);item=by_source[source['path']];private=item['privateCopy'];verify(private)
 assert private['sha256']==source['sha256'] and private['bytes']==source['bytes']
 whole=pointer(read(private['path']),source['jsonPointer'])
 operative.append({'assignedGoalId':b['goalId'],'caseId':b['caseId'],'profileCasePointer':b.get('profileCasePointer'),
  'sourceFile':{k:source[k] for k in ['path','sha256','bytes']},'privateFile':private,'sourceJsonPointer':source['jsonPointer'],
  'wholeOperativeCase':strip_meta(whole)})
assert len(operative)==9 and len([c for c in operative if c['assignedGoalId'].startswith('28c90')])==5
material_pin=put(R/'MATERIAL.current4-v3-whole-operative-cases.no-review-metadata.json',{
 'role':'Exact final operative current4 v3 whole cases; author/reviewer status metadata excluded; old calculation cases are provenance only',
 'cases':operative,'bindingSourcePin':bindings_pin,'replacedV1BoundariesAndOld28cCalculationScoringOperative':False,'actualLearnerAttainmentClaim':False})
refs=[{'role':'Nine exact final operative whole cases: four corrected material-boundary cases and five 28c qualitative interpretation projections','pin':material_pin}]
P_FIELDS=['goalId','goalFingerprint','reviewInputFingerprint','profileRuleVersion','profileFingerprint','status','reviewAuthority','evidenceLevel','maximumClaimScope','profile']
rows=[];mapping_pins={};source_pins={}
for g in raw['goals']:
 gid=g['goalId'];o=old_rows[gid];ctx=g['reviewContext'];P=ctx['evidenceProfile'];safeP={k:P[k] for k in P_FIELDS if k in P}
 assert safeP['profile']==records[gid]['profile']
 safe={k:v for k,v in g.items() if k!='reviewContext'}
 safe['reviewContext']={'page':{k:v for k,v in ctx['page'].items() if k!='evidenceReview'},'evidenceProfile':safeP}
 safe['currentCanonicalScientificFields']=copy.deepcopy(o['currentCanonicalScientificFields'])
 for key,value in safe['currentCanonicalScientificFields'].items():
  if key=='extendedData':assert all(goals[gid].get(key,{}).get(k)==v for k,v in value.items()),(gid,key)
  else:assert goals[gid].get(key)==value,(gid,key)
 safe['teacherContext']=copy.deepcopy(o['teacherContext'])
 safe['teacherContext']['currentPageContext']={key:pages[gid].get(key) for key in ['pageNumber','navigationOrder','treeOrder','breadcrumbs','chapterIds','requires','reverseRequires','externalPrerequisites','externalReverseRequires']}
 safe['currentDirectSourcePartnersForAuthoredJurisdictions']=copy.deepcopy(o['currentDirectSourcePartnersForAuthoredJurisdictions'])
 for partner in safe['currentDirectSourcePartnersForAuthoredJurisdictions']:
  mp=partner['mappingPin'];mapping_pins[mp['path']]=mp
  for p in partner['originalSourceReadOnlyFilePins']:source_pins[p['path']]=p
 safe['wholeAuthoredMaterialReferences']=refs
 safe['operativeCurrentMaterialAssignment']=[{k:c[k] for k in ['caseId','profileCasePointer','privateFile','sourceJsonPointer']} for c in operative if c['assignedGoalId']==gid]
 safe['retainedOriginalMaterialsRole']='Original calculation cases and previous assessment boundaries remain source history only; the final operative whole cases above govern this review.'
 rows.append(safe)
guards={p['path']:p for p in prep['sourceGuards']}
for item in materials:
 for p in [item['source'],item['privateCopy']]:guards[p['path']]=p
for p in list(mapping_pins.values())+list(source_pins.values()):guards[p['path']]=p
for p in guards.values():verify(p)
view={'schemaVersion':1,'role':'Exact current4 v3 whole scientific input; no historical or peer judgments',
 'goalIds':ids,'goalCount':4,'originalReviewInputFingerprint':raw['reviewInputFingerprint'],
 'originalBundleFingerprint':manifest['artifacts']['bundleFingerprint'],'originalBookDigest':manifest['artifacts']['bookModelDigest'],
 'sourceCanonicalPin':pin(K/base['landscapePath']),'sourceP439PinForTechnicalBindingOnly':pin(K/base['evidenceReviewPaths'][0]),
 'sourceSemanticKindsPinForTechnicalBindingOnly':pin(K/base['semanticKindLedgerPath']),
 'sourceRegistryPin':old['sourceRegistryPin'],'currentMappingFilePins':list(mapping_pins.values()),'originalSourceReadOnlyPins':list(source_pins.values()),
 'wholeAuthoredMaterialReferences':refs,'operativeAssignmentSourcePin':bindings_pin,
 'selectionRule':'Complete actual descriptions, canonical contexts, profile bodies, page fields, source partners and operative V3 cases copied fieldwise. P wrapper reason/reviewer/run IDs, page evidenceReview, prior V/A/M/D findings and author recommendations excluded.',
 'sourceBoundary':'Source partners are claims to inspect; selection and matching hashes establish no scientific acceptance. Synthetic materials are not actual learner performance.',
 'replacedHistoricalMaterialAssignmentsOperative':False,'newScientificVotes':0,'humanApproval':False,'nativeInputsEdited':False,'goals':rows}
view_pin=put(R/'REVIEW.current4-v3.whole-scientific-content.no-review-metadata.json',view)
rounds=[]
for label,key in [('round-a','first'),('round-b','second')]:
 bind=manifest['artifacts']['rounds'][key];rd=native/label
 rounds.append({'round':label,**{k:bind[k] for k in ['campaignId','roundId','independenceGroupId','batchId','batchInputFingerprint']},
  'inputPins':[pin(rd/'review-bundle-manifest.json'),pin(rd/'description-review-input.json'),pin(rd/'description-review-campaign.json'),pin(rd/'batches'/(bind['batchId']+'.input.jsonl'))]})
selector={'schemaVersion':1,'role':'Frozen final bounded current4 v3 scientific reviewer entry point',
 'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PREPARED_FOR_INDEPENDENT_REVIEW_NOT_ACCEPTED',
 'view':view_pin,'capsule':str(K),'nativeRoot':str(native),'goalIds':ids,'goalCount':4,'currentAtomicDenominator':439,
 'configPin':pin(K/prep['configRelativePath']),'batchManifestPin':pin(native/'batch-manifest.json'),
 'bookDigest':manifest['artifacts']['bookModelDigest'],'bundleFingerprint':manifest['artifacts']['bundleFingerprint'],'reviewInputFingerprint':manifest['artifacts']['reviewInputFingerprint'],
 'rounds':rounds,'bundleArtifactPins':[pin(p) for p in sorted((native/'bundle').rglob('*')) if p.is_file()],
 'wholeAuthoredMaterialReferences':refs,'operativeMaterialBindings':bindings_pin,
 'currentCanonicalPin':pin(K/base['landscapePath']),'currentP439PinForTechnicalSerializationOnly':pin(K/base['evidenceReviewPaths'][0]),
 'currentSEM650PinForTechnicalSerializationOnly':pin(K/base['semanticKindLedgerPath']),
 'sourcePartnerPins':list(mapping_pins.values())+list(source_pins.values()),'sourceGuardCount':len(guards),'sourceGuards':list(guards.values()),
 'technicalBindingRule':'Use exact native fingerprints and campaign fields. Read safe view and actual whole operative V3 materials before own FIRST; raw wrappers only for technical serialization afterward. Old calculation cases and replaced assessment boundaries are not operative.',
 'currentProfileStatusIsInputDataNotAcceptance':True,'replacedHistoricalMaterialAssignmentsOperative':False,'outcomesPredetermined':False,'humanApproval':False,'newScientificVotes':0}
selector_pin=put(R/'SELECTOR.clean-current4-v3-reviewer-inputs.sealed.json',selector)
for safe,g in zip(view['goals'],raw['goals']):
 assert safe['canonicalContext']==g['canonicalContext']
 assert safe['reviewContext']['evidenceProfile']['profile']==g['reviewContext']['evidenceProfile']['profile']
 assert safe['reviewContext']['page']=={k:v for k,v in g['reviewContext']['page'].items() if k!='evidenceReview'}
 for key in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','goalFingerprint','pageFingerprint']:assert safe[key]==g[key]
for p in guards.values():verify(p)
receipt=put(O/'RECEIPT.final-current4-v3-clean-input-projection.sealed.json',{'role':'Technical exact-field bounded input projection, no science judgments',
 'selector':selector_pin,'view':view_pin,'preparation':pin(prep_path),'operativeMaterial':material_pin,'goalCount':4,'operativeCaseCount':len(operative),
 'nativeRoundInputsExactAndEqual':True,'profileBodiesTextContextsPagesExact':True,'sourceGuardCount':len(guards),'sourceGuardsUnchanged':True,
 'frozen14Unchanged':True,'V2ArtifactsPreservedUnchanged':True,'humanApproval':False,'newScientificVotes':0,'fullCentralOrBuild':False})
for p in sorted(R.rglob('*')):
 if p.is_file() and not p.is_symlink():p.chmod(0o444)
for p in [O/'RECEIPT.final-current4-v3-clean-input-projection.sealed.json']:p.chmod(0o444)
print(json.dumps({'selector':selector_pin,'view':view_pin,'receipt':receipt,'nativeRoot':str(native),'rounds':rounds,'bookDigest':selector['bookDigest'],'bundleFingerprint':selector['bundleFingerprint']}))
