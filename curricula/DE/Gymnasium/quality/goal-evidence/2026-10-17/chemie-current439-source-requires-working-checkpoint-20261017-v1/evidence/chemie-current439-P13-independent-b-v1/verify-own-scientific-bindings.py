import pathlib,json,hashlib,datetime
O=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-P13-independent-b-v1')
I=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-P13-native-preparation-technical-root-v1')
W=json.loads((I/'CLEAN.current13-whole-C-whole-P-and-teacher-source-context.json').read_text())
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
pins=[]
for p in [W['sourceCanonicalPin'],W['sourceP439Pin'],W['sourceRegistryPin'],*W['currentMappingFilePins'],*W['originalSourceReadOnlyPins']]:
 actual=sha(p['path']);assert actual==p['sha256'].removeprefix('sha256:'),(p['path'],actual)
 pins.append({'path':p['path'],'sha256':actual,'bytes':pathlib.Path(p['path']).stat().st_size})
C=json.loads(pathlib.Path(W['sourceCanonicalPin']['path']).read_text())
goals=C['goals'];byid={g['id']:g for g in goals}
P={r['goalId']:r for r in map(json.loads,pathlib.Path(W['sourceP439Pin']['path']).read_text().splitlines())}
sv=json.loads(pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/review-scientific-views-root-v1/REVIEW.P13.whole-scientific-content.no-historical-review-metadata.json').read_text())
safe={g['goalId']:g for g in sv['goals']}
def scientific_subset_exact(actual,sanitized):
 if isinstance(sanitized,dict):
  return isinstance(actual,dict) and all(k in actual and scientific_subset_exact(actual[k],v) for k,v in sanitized.items())
 if isinstance(sanitized,list):
  return isinstance(actual,list) and len(actual)==len(sanitized) and all(scientific_subset_exact(a,b) for a,b in zip(actual,sanitized))
 return actual==sanitized
prereq=[];parents=[];checks=[]
for r in W['rows']:
 gid=r['goalId'];own=next(json.loads(p.read_text()) for p in O.glob('read-goal-*.profile-only.json') if json.loads(p.read_text())['goalId']==gid)
 assert byid[gid]==r['currentWholeCanonicalGoal']
 assert P[gid]==r['currentWholePositiveEvidenceRecord']
 assert own['profile']==P[gid]['profile']
 assert own['canonicalContext']==safe[gid]['canonicalContext']
 assert own['teacherContext']==r['teacherContext']
 assert scientific_subset_exact(own['teacherContext'],safe[gid]['teacherContext'])
 for k,v in own['text'].items():assert safe[gid][k]==v
 for g in r['teacherContext']['currentDirectPrerequisiteWholeGoals']:
  assert byid[g['id']]==g;prereq.append(g['id'])
 for g in r['teacherContext']['currentDirectParentWholeClusters']:
  assert byid[g['id']]==g;parents.append(g['id'])
 checks.append({'goalId':gid,'wholeCanonicalExact':True,'wholePRecordExactTechnicalOnly':True,'scientificProfileReadExact':True,'safeProjectionTextAndContextExact':True})

# Compare only the explicitly approved scientific paths in the operative source.
S=json.loads((O/'CLEAN.1df.two-whole-operative-case-materials.no-review-metadata.json').read_text())
sp=pathlib.Path(S['sourcePin']['path']);assert sha(sp)==S['sourcePin']['sha256'];src=json.loads(sp.read_text())
casebindings=[]
for case in S['cases']:
 ptr=case['sourceJsonPointer'];node=src
 for bit in ptr.strip('/').split('/'):
  node=node[int(bit)] if isinstance(node,list) else node[bit]
 # Source counterpart may carry other historical metadata; never emit it.
 allowed=list(case['wholeScientificCase'])
 for key,val in case['wholeScientificCase'].items():assert node['wholeOperativeCase'][key]==val,(ptr,key)
 assert node['authoredWorkedTaskAndTransferResponse']==case['wholeWorkedTaskAndTransferResponse']
 assert node['freshTransferResponseSuccessor']==case['wholeFreshTransferResponseSuccessor']
 casebindings.append({'caseKey':case['wholeScientificCase']['caseKey'],'sourceJsonPointer':ptr,'approvedScientificFieldsExact':allowed,'scientificFieldsRelativePointer':'/wholeOperativeCase','wholeWorkedResponseRelativePointer':'/authoredWorkedTaskAndTransferResponse','freshResponseRelativePointer':'/freshTransferResponseSuccessor','wrapperFieldsNotEmitted':True})

result={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verifiedPins':pins,'canonicalGoalCount':len(goals),'positiveEvidenceRecordCount':len(P),'own13Bindings':checks,'prerequisiteOccurrences':len(prereq),'uniquePrerequisites':len(set(prereq)),'teacherParentOccurrences':len(parents),'uniqueTeacherParents':len(set(parents)),'safeTeacherSanitizationNote':'The safe view omits only splitOriginGoalId from the fat-structure prerequisite extendedData; all retained scientific teacher fields are exactly equal. Whole own teacher inputs are exact canonical objects.','supplementSourcePin':S['sourcePin'],'supplementScientificBindings':casebindings,'scienceInferenceFromMatchingHashes':False,'noGlobalSourceCoverageClaim':True,'noHumanApprovalClaim':True}
(O/'verification.actual-current-C-P-teachers-primary-input-bindings.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['canonicalGoalCount','positiveEvidenceRecordCount','prerequisiteOccurrences','uniquePrerequisites','teacherParentOccurrences','uniqueTeacherParents']},ensure_ascii=False))
