"""Exact fieldwise scientific inputs; historical/peer reviewer metadata excluded."""
from pathlib import Path
import copy, datetime, hashlib, json, os
O=Path(__file__).resolve().parent;B=O.parent;C=O/'capsule'
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def put(p,obj):
 assert p.is_relative_to(O) and not p.exists();p.parent.mkdir(parents=True,exist_ok=True)
 raw=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode();json.loads(raw)
 with p.open('xb') as f:f.write(raw)
 return pin(p)
def pointer(obj,ptr):
 for part in ptr.lstrip('/').split('/'):
  key=part.replace('~1','/').replace('~0','~');obj=obj[int(key)] if isinstance(obj,list) else obj[key]
 return obj
def strip_case_metadata(value):
 if isinstance(value,list):return [strip_case_metadata(v) for v in value]
 if isinstance(value,dict):return {k:strip_case_metadata(v) for k,v in value.items() if k not in {'authorRemediation','newIndependentReviewStatus','reviewer','reviewRunIds','dissent','authorRecommendation','evidenceReview'}}
 return value
GOAL_FIELDS=['id','shortKey','title','titleEn','description','descriptionEn','type','nodeKind','semanticKind','phase','area','level','core','weight','tags','competencyRefs','dimensionTags','applicability','requires','contains','examples','sourceRef','resourceLinks','assessment','examData']
EXT_FIELDS=['provenance','scopeBoundary','acquisitionExtensions','skillPilotAcquisitionExtensions','prerequisiteRationale','applicabilityMappingInheritance','applicabilityOverrides','applicabilityFromRequires','splitOriginGoalId']
def goal_view(g):
 out={k:g[k] for k in GOAL_FIELDS if k in g};ext={k:g.get('extendedData',{})[k] for k in EXT_FIELDS if k in g.get('extendedData',{})}
 if ext:out['extendedData']=ext
 return out
plan=read(O/'PLAN.author14.exact-prospective-change-map.json');ids=plan['goalIds'];chosen=set(ids);R=C/plan['privateReviewRootRelativePath'];native=R/'native14'
manifest=read(native/'batch-manifest.json');base=read(C/plan['draftBatchConfigRelativePath']);base=read(C/base['baseGoalBookConfigPath'])
land=read(C/base['landscapePath']);goals={g['id']:g for g in land['goals']};model=read(native/'bundle/book-model.json');pages={p['goalId']:p for p in model['pages']}
records={json.loads(line)['goalId']:json.loads(line) for line in (C/base['evidenceReviewPaths'][0]).read_text().splitlines() if line.strip()}
first=read(native/'round-a/description-review-input.json');second=read(native/'round-b/description-review-input.json');assert first==second
registry_path=C/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json';registry={r['landscapeId']:r for r in read(registry_path)['entries']}
partners={gid:[] for gid in ids};mapping_pins={};original_pins={}
for root,dirs,names in os.walk(C/'curricula/DE/Gymnasium/mapping',followlinks=True):
 for name in names:
  if not name.endswith('.json') or 'chemistry' not in name.lower() or '.review' in name.lower():continue
  path=Path(root)/name;jur=path.relative_to(C/'curricula/DE/Gymnasium/mapping').parts[0];data=read(path)
  matches=[r for r in data.get('mappings',[]) if r.get('canonicalGoalId') in chosen and jur in goals[r['canonicalGoalId']].get('applicability',{}).get('jurisdiction',[])]
  if not matches:continue
  mapping_pins[str(path)]=pin(path);reg=registry.get(data.get('sourceLandscapeId'));files=[]
  if reg:
   for key in ['archiveSourcePath','sourcePath']:
    relative=reg.get(key)
    if not relative:continue
    source=C/relative
    if source.is_file() and str(source) not in {f['path'] for f in files}:
     original_pins[str(source)]=pin(source);files.append(original_pins[str(source)])
  for row in matches:partners[row['canonicalGoalId']].append({'currentJurisdiction':jur,'mappingPin':mapping_pins[str(path)],'mappingEntry':row,'sourceLandscapeId':data.get('sourceLandscapeId'),'sourceLandscapeRegistryEntry':reg,'originalSourceReadOnlyFilePins':files,'sourceGoalLocator':row.get('legacyGoalId')})

locator=B/'current439-remediation14-neutral-whole-material-locators-root-v1/LOCATOR.28c-whole-current-cases-no-review-metadata.json';assert pin(locator)['sha256']=='fdde9b53d2aa076693ce31d4a9d6cc9489b987f60247b504e26fdcb3cc218e89'
operative=[];material_guards=[pin(locator)]
for item in read(locator)['materialFiles']:
 expected=item['originalFile'];assert pin(expected['path'])==expected;material_guards.append(expected);source=read(expected['path'])
 for ptr in item['jsonPointers']:
  whole=pointer(source,ptr);operative.append({'assignedGoalId':'28c90c6a-3020-5c51-ac40-d802f3f12d2d','caseId':whole.get('caseId',whole.get('id')),'sourceFile':expected,'sourceJsonPointer':ptr,'wholeOperativeCase':strip_case_metadata(whole)})
case_pin=put(O/'MATERIAL.28c-five-whole-operative-cases.no-review-metadata.json',{'role':'Complete assigned operative material/task/model-answer/rubric fields copied exactly; only author/reviewer judgment metadata omitted','cases':operative,'sourcePins':material_guards,'actualLearnerAttainmentClaim':False})
material=read(O/'INPUTS.final-actual-P4-V4-material-pins.json')
authored_materials=[{'role':'Five whole bilingual actual authored targeted P cases','pin':pin(material['P4WholeMaterials'])},
 {'role':'Exact authored P4 case/profile field assignment','pin':pin(material['P4MaterialBindings'])},
 {'role':'Whole bilingual cf270 authored procedure/tasks/expected answers/rubrics','pin':pin(O/'input-copies/cf270Material/authored-material.de-en.md')},
 {'role':'Five existing currently assigned whole 28c cases, including four-point base case','pin':case_pin}]
rows=[]
P_FIELDS=['goalId','goalFingerprint','reviewInputFingerprint','profileRuleVersion','profileFingerprint','status','reviewAuthority','evidenceLevel','maximumClaimScope','profile']
for g in first['goals']:
 gid=g['goalId'];ctx=g['reviewContext'];P=ctx['evidenceProfile'];safeP={k:P[k] for k in P_FIELDS if k in P}
 assert safeP['profile']==records[gid]['profile']
 safe={k:v for k,v in g.items() if k!='reviewContext'}
 safe['reviewContext']={'page':{k:v for k,v in ctx['page'].items() if k!='evidenceReview'},'evidenceProfile':safeP}
 safe['currentCanonicalScientificFields']=goal_view(goals[gid])
 safe['teacherContext']={'currentDirectPrerequisiteWholeGoals':[goal_view(goals[r]) for r in goals[gid].get('requires',[]) if r in goals],
  'currentDirectParentWholeClusters':[goal_view(parent) for parent in land['goals'] if gid in parent.get('contains',[])],
  'currentPageContext':{k:pages[gid].get(k) for k in ['pageNumber','navigationOrder','treeOrder','breadcrumbs','chapterIds','requires','reverseRequires','externalPrerequisites','externalReverseRequires']},
  'authoredCurrentApplicability':goals[gid].get('applicability')}
 safe['currentDirectSourcePartnersForAuthoredJurisdictions']=partners[gid]
 safe['wholeAuthoredMaterialReferences']=authored_materials
 rows.append(safe)
view={'schemaVersion':1,'role':'Exact remediation14 whole scientific inputs; no historical or peer review metadata',
 'goalIds':ids,'goalCount':14,'originalReviewInputFingerprint':first['reviewInputFingerprint'],
 'originalBundleFingerprint':manifest['artifacts']['bundleFingerprint'],'originalBookDigest':manifest['artifacts']['bookModelDigest'],
 'currentWholeProfileBodiesRetained':True,'sourceCanonicalPin':pin(C/base['landscapePath']),
 'sourceP439PinForTechnicalBindingOnly':pin(C/base['evidenceReviewPaths'][0]),
 'sourceSemanticKindsPinForTechnicalBindingOnly':pin(C/base['semanticKindLedgerPath']),
 'sourceRegistryPin':pin(registry_path),'currentMappingFilePins':list(mapping_pins.values()),'originalSourceReadOnlyPins':list(original_pins.values()),
 'wholeAuthoredMaterialReferences':authored_materials,'neutralCurrent28cMaterialLocator':pin(locator),
 'selectionRule':'Complete current descriptions, profile bodies, canonical context, pages and image objects copied fieldwise. P reason/reviewer/reviewRunIds/dissent/reviewedAt/reviewId, page.evidenceReview, author recommendations and independent V/A/M/D findings are excluded. Current statuses and technical bindings are inputs, not acceptance.',
 'sourceBoundary':'Raw authored jurisdiction/source partners are claims to inspect, not comprehensive source coverage or a scientific outcome. Synthetic material is not actual learner performance.',
 'newScientificVotes':0,'humanApproval':False,'nativeInputsEdited':False,'goals':rows}
view_pin=put(O/'REVIEW.remediation14.whole-scientific-content.no-review-metadata.json',view)
rounds=[]
for label,key in [('round-a','first'),('round-b','second')]:
 bind=manifest['artifacts']['rounds'][key];rd=native/label
 rounds.append({'round':label,'campaignId':bind['campaignId'],'roundId':bind['roundId'],'independenceGroupId':bind['independenceGroupId'],'batchId':bind['batchId'],'batchInputFingerprint':bind['batchInputFingerprint'],
  'inputPins':[pin(rd/'review-bundle-manifest.json'),pin(rd/'description-review-input.json'),pin(rd/'description-review-campaign.json'),pin(rd/'batches'/(bind['batchId']+'.input.jsonl'))]})
bundle_pins=[pin(p) for p in sorted((native/'bundle').rglob('*')) if p.is_file()]
check_sourcepins=list(mapping_pins.values())+list(original_pins.values())+material_guards
for expected in check_sourcepins:assert pin(expected['path'])==expected,expected['path']
selector={'schemaVersion':1,'role':'Frozen bounded remediation14 scientific reviewer entry point; neutral operative fields only',
 'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PREPARED_FOR_INDEPENDENT_REVIEW_NOT_ACCEPTED',
 'view':view_pin,'capsule':str(C),'nativeRoot':str(native),'goalIds':ids,'goalCount':14,'currentAtomicDenominator':439,
 'configPin':pin(C/plan['draftBatchConfigRelativePath']),'batchManifestPin':pin(native/'batch-manifest.json'),
 'bookDigest':manifest['artifacts']['bookModelDigest'],'bundleFingerprint':manifest['artifacts']['bundleFingerprint'],'reviewInputFingerprint':manifest['artifacts']['reviewInputFingerprint'],
 'rounds':rounds,'bundleArtifactPins':bundle_pins,'wholeAuthoredMaterialReferences':authored_materials,
 'currentCanonicalPin':pin(C/base['landscapePath']),'currentP439PinForTechnicalSerializationOnly':pin(C/base['evidenceReviewPaths'][0]),
 'currentSEM650PinForTechnicalSerializationOnly':pin(C/base['semanticKindLedgerPath']),
 'sourcePartnerPins':check_sourcepins,
 'technicalBindingRule':'Use frozen native fingerprints and campaigns. Read this safe view and whole operative materials for science; raw P wrappers only for technical serialization after own sealed FIRST. No wrapper or QA-note dumps.',
 'currentProfileStatusIsInputDataNotAcceptance':True,'AandMFourActualReviewSeparate':True,'outcomesPredetermined':False,'humanApproval':False,'newScientificVotes':0}
sp=put(O/'SELECTOR.clean-remediation14-reviewer-inputs.sealed.json',selector)
print(json.dumps({'selector':sp,'view':view_pin,'nativeRoot':str(native),'rounds':rounds,'mappingFiles':len(mapping_pins),'originalSourceFiles':len(original_pins),'whole28cCases':len(operative)},ensure_ascii=False))
