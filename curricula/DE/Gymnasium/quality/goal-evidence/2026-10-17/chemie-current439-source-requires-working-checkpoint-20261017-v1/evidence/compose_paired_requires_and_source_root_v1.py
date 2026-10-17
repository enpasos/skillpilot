import json, pathlib, hashlib, datetime, collections
E=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017')
R=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=E/'current439-paired-requires-and-source-root-synthesis-v1'
OUT.mkdir(exist_ok=True)
def read(p):return json.loads(pathlib.Path(p).read_text())
def pin(p):
 p=pathlib.Path(p); b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,o):
 p=OUT/name; assert not p.exists(),p; p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return pin(p)
checked={}
def verify_pins(o):
 if isinstance(o,dict):
  if isinstance(o.get('path'),str) and isinstance(o.get('sha256'),str):
   p=pathlib.Path(o['path'])
   if p.is_absolute() and p.is_file():
    actual=checked.setdefault(str(p),pin(p));assert actual['sha256']==o['sha256'].removeprefix('sha256:'),(p,actual['sha256'],o['sha256'])
    if 'bytes' in o:assert actual['bytes']==o['bytes'],p
  for v in o.values():verify_pins(v)
 elif isinstance(o,list):
  for v in o:verify_pins(v)
selectors=[E/'current439-three-requires-pairs-informed-A-after-fresh-C-v1/SELECTOR.informed-A-three-pairs.after-C.sealed.json',E/'current439-three-requires-pairs-informed-B-after-fresh-C-v1/SELECTOR.informed-B-after-C.sealed.json',E/'current439-three-requires-pairs-fresh-independent-c-v1/SELECTOR.independent-three-pairs-C.sealed.json',E/'current439-source-surrogate-necessity-independent-a-v1/SELECTOR.source-surrogate-necessity-independent-a.FIRST.sealed.json',E/'current439-source-surrogate-necessity-independent-b-v1/SELECTOR.independent-b-FIRST.sealed.json']
for p in selectors:verify_pins(read(p))
A3=read(E/'current439-three-requires-pairs-informed-A-after-fresh-C-v1/INFORMED.A.three-physical-pairs.after-C.frozen.json')
B3=read(E/'current439-three-requires-pairs-informed-B-after-fresh-C-v1/FIRST.additive-informed-B-after-C.scientific-judgments.json')
C3=read(E/'current439-three-requires-pairs-fresh-independent-c-v1/FIRST.independent-scientific-review.json')
key=lambda x:(x['prerequisiteGoalId'],x['directDependentGoalId'])
b3={key(x):x for x in B3['decisions']};c3={key(x):x for x in C3['decisions']};three=[]
for a in A3['decisions']:
 b=b3[key(a)];c=c3[key(a)];assert a['informedVerdict']==b['verdict']==c['verdict']
 three.append({'prerequisiteGoalId':key(a)[0],'directDependentGoalId':key(a)[1],'resolvedPhysicalVerdict':b['verdict'],'AInformedAfterC':a,'BInformedAfterC':b,'CFreshBlind':c,'sourceCourse315DecisionsAutomaticallyChanged':False,'graphApplied':False})
threepin=write('RECEIPT.three-physical-dissents.scientifically-resolved-after-frozen-FIRSTs.json',{'schemaVersion':1,'role':'Root technical collation of actual frozen scientific arguments; no extra independent review','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewSelectors':[pin(x) for x in selectors[:3]],'decisions':three,'counts':dict(collections.Counter(x['resolvedPhysicalVerdict'] for x in three)),'oldFIRSTsPreserved':True,'sourceRegistryApprovalClaimed':False,'newStrictGlobalGoalClosures':0,'humanApprovalClaimed':False})
A=read(E/'current439-source-surrogate-necessity-independent-a-v1/REVIEW.all315-candidate-pairs.FIRST-independent-a.json')
AG=read(E/'current439-source-surrogate-necessity-independent-a-v1/REVIEW.all83-groups.all323-jurisdiction-dockets.FIRST-independent-a.json')
B=read(E/'current439-source-surrogate-necessity-independent-b-v1/FIRST-JURISDICTION-PAIR-DECISIONS.frozen.json')
bm={(x['goalId'],x['jurisdiction']):x for x in B['pairs']};ad={x['docketInstanceId']:x for g in AG['groups'] for x in g['jurisdictionReviews']}
Cpath=E/'current439-requires-closure-source-surrogate-neutral-preparation-technical-v1/science/C650.whole-current-authored-goal-content.json'
C=read(Cpath);goals={g['id']:g for g in C['goals']}
registry_path=R/'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json';registry=read(registry_path);existing={(x['landscapeId'],x['goalId'],x['jurisdiction'],x['requiredByGoalId']) for x in registry['entries']}
proofs=[];entries=[];pending=[]
for a in A['candidatePairs']:
 b=bm[a['goalId'],a['jurisdiction']]
 if a['decision']!=b['decision'] or a['decision']!='approve':continue
 path=b['selectedLiteralRequiresPath'];assert len(path)==2,path
 pre,dep=path;assert pre==a['goalId'] and pre in goals[dep]['requires'];assert not goals[dep].get('contains')
 assert not a['knownOpenSourceFlags'] and not b['knownOpenSourceFlags']
 assert not b['prerequisiteTargetCoursesWithoutSameCourseWholePath'];assert not b['endpointNotATargetInAnyCurrentStateScope'];assert not b['chainIncludesSeparateBcPProgram']
 assert all(x['physicalNecessityDecision']=='approve' for x in b['everyIntermediateEdgeJudgment'])
 aa=[ad[x] for x in a['allDocketInstanceIds'] if ad[x]['decision']=='approve']
 assert aa and all(all(x['physicalDecision']=='approve' for x in r['routeNecessityReview']) for r in aa)
 ba={x['anchorId']:x for x in [b['selectedEndpointAnchor'],*b['sameEndpointWitnessAlternatives']]}
 common=set(a['qualifiedSupportingAnchorIds'])&set(ba)
 for r in aa:
  verify_pins(r['originalPrimaryProofs'])
 verify_pins(b['sourceOriginalReading'])
 if not common:
  pending.append({'goalId':pre,'jurisdiction':a['jurisdiction'],'samePhysicalPath':path,'AUsedOriginalSourceAnchors':a['qualifiedSupportingAnchorIds'],'BReviewedSameEndpointAlternatives':[x['anchorId'] for x in b['sameEndpointWitnessAlternatives']],'AScientificDockets':aa,'BScientificPair':b,'technicalStatus':'pending-explicit-adjudication-of-adjacent-same-page-anchors; no registry acceptance generated'})
  continue
 ak={x['anchorId']:x for r in aa for x in r['scientificallyUsedSourceAnchors']}
 assert common<=set(ak)
 for anchorid in common:
  assert ak[anchorid]['endpointGoalId']==ba[anchorid]['endpointGoalId']==dep
  assert ak[anchorid]['sourceCellId']==ba[anchorid]['sourceCellId']
  assert ak[anchorid]['sourceGoalId']==ba[anchorid]['sourceGoalId']
 proof={'goalId':pre,'jurisdiction':a['jurisdiction'],'requiredByGoalId':dep,'wholeLiteralPath':path,'commonActualScientificSourceAnchorIds':sorted(common),'AWholePairDecision':a,'AWholeScientificDockets':aa,'BWholeScientificPair':b,'technicalState':'paired-scientific-acquisition-support; inactive draft, pending final-graph/current-scope stock validation','newStrictGlobalGoalClosure':False}
 proofs.append(proof)
 entry={'landscapeId':C['landscapeId'],'goalId':pre,'jurisdiction':a['jurisdiction'],'evidenceType':'requires-closure','requiredByGoalId':dep,'status':'accepted','rationale':'Gezielt unabhängig geprüfte Erwerbsunterstützung über die aktuelle atomare Voraussetzungskante zu '+dep+'. '+b['scientificReasonDe']+' Die Quellen-, Kurs-, Themenwahl- und Programmbeschränkungen bleiben erhalten; keine Behauptung einer ausdrücklich offiziellen Pflicht dieses Vorziels, tatsächlicher Lernendenleistung oder menschlicher Freigabe. Gepaarte aktuelle Nachweise: current439-paired-requires-and-source-root-synthesis-v1/PROOF.paired21-same-scientific-anchor.requires-source-acquisition-support.json.'}
 assert (entry['landscapeId'],pre,entry['jurisdiction'],dep) not in existing
 entries.append(entry)
assert len(entries)==21 and len(pending)==1
proofpin=write('PROOF.paired21-same-scientific-anchor.requires-source-acquisition-support.json',{'role':'Root bounded technical pairing; no new independent scientific review','reviewSelectors':[pin(x) for x in selectors[3:]],'originalCanonical':pin(Cpath),'pairs':proofs,'counts':{'pairedPositivePairKeys':22,'sameExplicitScientificSourceAnchor':21,'pendingAdjacentSamePageAnchorQualification':1},'noMainActivation':True,'noM7Claim':True,'noHumanApprovalClaim':True})
pendpin=write('HOLD.one-MV-mol-to-titration-adjacent-original-source-anchors.json',{'cases':pending,'newStrictGlobalGoalClosures':0})
draft={'schemaVersion':registry['schemaVersion'],'entries':registry['entries']+entries};assert draft['entries'][:len(registry['entries'])]==registry['entries']
draftpin=write('canonical-goal-surrogate-evidence-registry.paired21.INACTIVE.PENDING-final-context-stock-check.json',draft)
receipt=write('SELECTOR.paired3-physical-and-paired21-source.technical-collation.sealed.json',{'role':'Technical root composition; source registry is inactive and not a standalone M7 proof','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'oldRegistry':pin(registry_path),'oldRegistryEntriesPreservedExactly':340,'chemistryDraftEntriesAdded':21,'physicalDisputesResolved':3,'currentCanonical':pin(Cpath),'outputPins':[threepin,proofpin,pendpin,draftpin],'verifiedImmutablePins':list(checked.values()),'pending':['Final revised requires graph must preserve all selected approved paths','Actual normal compiled applicability requires-closure evidence and complete course-context checks','MV adjacent same-page source anchor qualification','Normal source gate, CQR303 and all protected floors','No goal science or human approval inferred from hashes'],'newStrictGlobalGoalClosures':0,'MainWrites':0,'KMutations':0,'fullBuilds':0})
print(json.dumps({'selector':receipt,'registry':draftpin,'proof':proofpin,'three':threepin,'pending':pendpin},ensure_ascii=False,indent=2))
