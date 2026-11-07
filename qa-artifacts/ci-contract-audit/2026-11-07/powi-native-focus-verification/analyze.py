import pathlib,json,hashlib,gzip,collections,copy,sys
P=pathlib.Path('/dev/shm/powi-native-validated-20261107')
J=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode();H=lambda b:hashlib.sha256(b).hexdigest();load=lambda p:json.loads(p.read_text())
comparison={};detail=[]
casekey=lambda c:(c['author'],c['focusKey'],c['state'],c['strict'])
required=['allowed','richFrontier','simpleFrontier','requiredOrientationIds','missingDirectLevel2References','scopeGoalIds','projectedFocusIds','plannedIds','inputMastery']
for version in ['origin-main','branch']:
 before_path=P/f'validated-{version}-baseline.json';after_path=P/f'validated-{version}-candidate.json'
 if not before_path.exists() or not after_path.exists():
  comparison[version]={'status':'still-running-not-evaluated'};continue
 before=load(before_path);after=load(after_path);summary=[]
 assert before['actualSourceSha256']=='49e68eedeac6a891a0327551bfbe7c9d31a44573d97b464b69b49d5023511c94'
 assert after['actualSourceSha256']=='29d02016b7e31b5683b1d51196e21c68ab4a310b8a88aa1a09bd5f30d1ee2eef'
 assert len(before['rows'])==len(after['rows'])==4
 for a,b in zip(before['rows'],after['rows']):
  assert a['key']==b['key'] and a['validPersonalCurriculum'] is True and b['validPersonalCurriculum'] is True
  assert a['personalizationPlan']['stage']==b['personalizationPlan']['stage']=='COMPLETE'
  assert a['personalCurriculumSubjectIds']==b['personalCurriculumSubjectIds']==['51b60137-46e8-5498-973e-ea38bb32f327']
  row={'context':a['key'],'validPersonalCurriculumBeforeAndAfter':True,'targetCount':len(a['targetGoalIds']),'supportCount':len(a['supportGoalIds']),'compositionViewIds':a['compositionViewIds'],'syntheticLegacyCompatibilityFixture':a['syntheticLegacyCompatibilityFixture'],'cases':len(a['cases']),'deltas':dict.fromkeys(required,0),'targetSupportVisibleStructuralSetsUnchanged':all(a[k]==b[k] for k in ['targetGoalIds','supportGoalIds','visibleGoalIds','structuralGoalIds','compositionViewIds','compositionViewApplied']),'fullTransitivePrerequisiteSetDeltas':0,'fullTransitivePrerequisiteOrderOnlyDeltas':0,'publicExceptionsBefore':0,'publicExceptionsAfter':0,'configurationHoldCases':0,'privateAllowedTrueBefore':sum(bool(c['allowed']) for c in a['cases']),'privateAllowedTrueAfter':sum(bool(c['allowed']) for c in b['cases']),'nativeTopologyListsBefore':sum(isinstance(c.get('fullNativeTransitivePrerequisites'),list) for c in a['cases']),'uniqueAuthorFocusStrictMasteryInputs':len({json.dumps([c['author'],c['focusRoots'],c['strict'],c['inputMastery']],sort_keys=True) for c in a['cases']}),'nativeWideningFunctionUnchanged':a.get('nativeWideningFunctionAfterExplicitCurrentRootMastery')==b.get('nativeWideningFunctionAfterExplicitCurrentRootMastery')}
  assert row['targetSupportVisibleStructuralSetsUnchanged']
  assert len(a['cases'])==len(b['cases'])
  for x,y in zip(a['cases'],b['cases']):
   assert casekey(x)==casekey(y)
   diffs={k:{'before':x.get(k),'after':y.get(k)} for k in required if x.get(k)!=y.get(k)}
   for k in diffs:row['deltas'][k]+=1
   for side,c in [('Before',x),('After',y)]:
    row['publicExceptions'+side]+=sum(isinstance(c.get(k),dict) and 'exception' in c[k] for k in ['richFrontier','simpleFrontier'])
   if x['missingDirectLevel2References'] or y['missingDirectLevel2References']:row['configurationHoldCases']+=1
   tx=x.get('fullNativeTransitivePrerequisites');ty=y.get('fullNativeTransitivePrerequisites')
   if isinstance(tx,list) and isinstance(ty,list):
    if set(tx)!=set(ty):row['fullTransitivePrerequisiteSetDeltas']+=1
    elif tx!=ty:row['fullTransitivePrerequisiteOrderOnlyDeltas']+=1
   if diffs:detail.append({'runtime':version,'context':a['key'],'author':x['author'],'focusKey':x['focusKey'],'focusRoots':x['focusRoots'],'state':x['state'],'strict':x['strict'],'inputMastery':x['inputMastery'],'scopeGoalIds':x['scopeGoalIds'],'deltas':diffs})
  summary.append(row)
 comparison[version]={'status':'terminal-native-results','rows':summary,'cases':sum(r['cases'] for r in summary),'totalDeltas':{k:sum(r['deltas'][k] for r in summary) for k in required},'qualifiedOwnerResolverHelperNegatives':before['resolverNegatives'],'actualLearnerStateRead':before['actualLearnerStateRead'] or after['actualLearnerStateRead'],'repositoryWritesAllowed':before['repositoryWritesAllowed'] or after['repositoryWritesAllowed'],'repositoryCallsBefore':before['repositoryCalls'],'repositoryCallsAfter':after['repositoryCalls']}
(P/'native-comparison.json').write_bytes(J(comparison));(P/'runtime-delta.details.json.gz').write_bytes(gzip.compress(J(detail),mtime=0))
print(json.dumps({k:{'status':v['status'],'cases':v.get('cases'),'totalDeltas':v.get('totalDeltas')} for k,v in comparison.items()},ensure_ascii=False))
