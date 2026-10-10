from pathlib import Path
import json,hashlib,datetime
import jsonschema
O=Path(__file__).resolve().parent;ROOT=O.parents[6];D=O.parent/'wirtschaft-dd38-543b-source-course-f08-036ea-followers-AUTHOR-INERT-round-b-v1'
DD='dd38e0c5-d77b-5893-815c-548ea2a84429';V='776457c2-8bb3-53b9-838b-a028319175fb';PAY='a5009946-62bb-5e6a-8c92-732d02e8fd70';PO='543bf91f-f6c6-5b1b-ba9e-43de321d8c7f';POL='da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0';S='f1f73ebe-286a-52e8-a2e1-4383ece6e9ec';F='f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96';Q='036ea7f9-2a33-502f-8729-983fa8054694'
def read(n):return json.loads((O/n).read_text())
def h(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def save(n,d):(O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
seal=read('history/predecessor-seal.exact.json');assert seal['artifactCount']==len(seal['artifacts'])==104
assert h((D/'SEALED-unreviewed-INERT-handoff.json').read_bytes())=='sha256:249d319d706855bf1887399c020da71fae00357bb76d9c3a942d317d3627a7f4'
for f in seal['artifacts']:
 p=D/f['path'];assert p.stat().st_size==f['bytes'] and h(p.read_bytes())==f['digest']
old={g['id']:g for g in read('history/original-canonical.exact.json')['goals']};predecessor={g['id']:g for g in read('history/sealed-predecessor-landscape.exact.json')['goals']};new=read('candidates/landscape.author-only.INERT.json');b={g['id']:g for g in new['goals']}
assert len(old)==len(predecessor)==len(b)==len(new['goals'])==679 and set(b)==set(old)
changed={i for i in b if b[i]!=predecessor[i]};assert changed=={F,Q,V,PAY,POL}
for i in changed:assert {k:v for k,v in b[i].items() if k!='applicability'}=={k:v for k,v in predecessor[i].items() if k!='applicability'}
assert b[DD]==predecessor[DD] and b[PO]==predecessor[PO] and b[S]==predecessor[S]
assert read('candidates/two-whole-practices.INERT.json')==[b[F],b[Q]]
assert read('candidates/six-whole-content-successor-goals.INERT.json')==[b[x] for x in [DD,V,PAY,PO,POL,S]]
for p in [F,Q]:
 assert b[p]['applicability']==old[p]['applicability'] and b[p]['tags']==old[p]['tags']
 assert b[p]['examData']==predecessor[p]['examData'] and b[p]['requires']==predecessor[p]['requires']==b[p]['examData']['coveredGoalIds']
assert len(b[F]['applicability']['jurisdiction'])==11 and len(b[Q]['applicability']['jurisdiction'])==5
for p,covered in [(F,[DD,V,PAY]),(Q,[S,PO,POL])]:
 assert b[p]['examData']['coveredGoalIds']==covered
 assert all(set(b[p]['applicability']['jurisdiction'])<=set(b[i]['applicability']['jurisdiction']) for i in covered)
for i in [V,PAY,POL,S]:assert b[i].get('resourceLinks',[])==predecessor[i].get('resourceLinks',[])
schema=ROOT/'docs/landscape-runtime.schema.json';jsonschema.Draft202012Validator(json.loads(schema.read_text())).validate(new)
for field in ['requires','contains']:
 state={}
 def walk(i):
  assert state.get(i)!=1,(field,i)
  if state.get(i)==2:return
  state[i]=1
  for j in b[i].get(field,[]):assert j in b;walk(j)
  state[i]=2
 for i in b:walk(i)
roles=read('source-notes/twelve-whole-country-primary-vs-existing-extension-roles.INERT.json');scopes=read('source-notes/seventeen-explicit-existing-learner-scope-role-proposals.INERT.json')['scopes']
assert len(roles['countries'])==12 and len(scopes)==17
assert {r['scope']['jurisdiction'] for r in scopes if r['scope']['courseProfile']=='GK'}==set(old[Q]['applicability']['jurisdiction'])
assert len({tuple(sorted(r['scope'].items())) for r in scopes})==17
seenF=set();seenQ={'GK':set(),'LK':set()}
for r in scopes:
 country=r['scope']['jurisdiction'];profile=r['scope']['courseProfile'];practices=[x['goalId'] for x in r['practiceGoalEntries']]
 assert practices==[p for p in [F,Q] if country in old[p]['applicability']['jurisdiction'] and profile in old[p]['tags']]
 if F in practices:assert profile=='LK';seenF.add(country)
 if Q in practices:seenQ[profile].add(country)
 targets={i for p in practices for i in b[p]['examData']['coveredGoalIds']};assert {x['goalId'] for x in r['contentGoalEntries']}==targets
 closure=set()
 def collect(i):
  for j in b[i].get('requires',[]):
   if j not in closure:closure.add(j);collect(j)
 for i in targets:collect(i)
 assert {x['goalId'] for x in r['prerequisiteOnlyGoalEntries']}==closure-targets
 if profile=='GK':assert r['POLGKScopePlacement']['goalId']==POL and r['POLGKScopePlacement']['jurisdiction']==country
 assert all(x['projectionRole']=='target' for x in r['practiceGoalEntries']+r['contentGoalEntries'])
 assert all(x['projectionRole']=='prerequisiteOnly' for x in r['prerequisiteOnlyGoalEntries'])
assert seenF==set(old[F]['applicability']['jurisdiction'])
assert all(c==set(old[Q]['applicability']['jurisdiction']) for c in seenQ.values())
nativeRoles=read('checks/native-bounded-composition-role-fragments.actual.json');assert nativeRoles['boundedScopesChecked']==17 and all(r['errorCount']==0 for r in nativeRoles['results'])
assert all(r['directGKda734TargetPreserved'] for r in nativeRoles['results'] if r['scope']['courseProfile']=='GK')
profiles=read('candidates/positive-profiles.native-bound.INERT.json');orig={r['goalId']:r for r in read('history/six-whole-substantive-profile-inputs.exact-objects.json')}
assert len(profiles)==6 and {r['goalId'] for r in profiles}=={DD,V,PAY,PO,POL,S}
for r in profiles:assert r['profile']==orig[r['goalId']]['profile'] and r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[]
native=read('checks/native-positive-candidates.actual.json');assert len(native['ownNativeRecordChecks'])==6 and native['originalWholeContractBindingChecks']==[] and native['generationParametersFingerprint']==h((O/'generation-metadata.actual.json').read_bytes())
bindings=read('source-notes/actual-own-additive-input-binding-and-independence.json')
for f in bindings['copiedOwnInputs']:assert h((O/f['to']).read_bytes())==f['digest'] and h((ROOT/f['from']).read_bytes())==f['digest']
parsed=0
for p in O.rglob('*'):
 assert not p.is_symlink()
 if p.is_file() and p.suffix=='.json':json.loads(p.read_text());parsed+=1
 elif p.is_file() and p.suffix=='.jsonl':
  for line in p.read_text().splitlines():json.loads(line)
  parsed+=1
save('checks/whole-additive-role-history-scope-and-native-binding.actual.json',{'status':'passed_local_whole_additive_history_schema_DAG_material_scope_and_P_binding','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'predecessor104ArtifactsAndSealExact':True,'originalAndCandidateGoalCounts':[679,679],'modifiedPredecessorGoalIdsOnly':sorted(changed),'onlyWholeApplicabilityFieldsModified':True,'wholeSubstantiveGoalsPracticeMaterialsSolutionsScoringAndSixPProfilesExact':True,'fourGoodExistingGoalImageLinksUnchanged':True,'oldTargetCountrySetsExplicitlyRetained':{'f08':11,'036ea':5},'oldTechnicalProfileSetsPreserved':{'f08':['LK'],'036ea':['GK','LK']},'boundedNativeCompiledAdditiveRoleFragments':17,'POLGKAuthoredTargetScopesOnly':['DE-BE','DE-HE','DE-NI','DE-NW','DE-SH'],'globalTagsUnchanged':True,'nativeTechnicalProfileRebindings':6,'actualSchemaPath':str(schema.relative_to(ROOT)),'actualSchemaDigest':h(schema.read_bytes()),'requiresDAG':True,'containsDAG':True,'parsedOwnJsonJsonlFiles':parsed,'newSourceReadOrWholeHistoricalCaseRerating':False,'otherDResultsRead':False,'wholeSourceCountryCourseM6ViewReleaseApprovalClaimed':False,'activeWrites':False,'imagesGenerated':False})
files=[{'path':str(p.relative_to(O)),'bytes':p.stat().st_size,'digest':h(p.read_bytes())} for p in sorted(O.rglob('*')) if p.is_file() and p.name not in ['SEALED-additive-INERT-handoff.json','SEALED-additive-INERT-handoff.json.sha256']]
out={'status':'sealed_additive_INERT_unreviewed_role_retention_handoff','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','needsHumanReview':True,'wholePracticeIds':[F,Q],'preservedWholeOriginalCountryTargets':{'f08':11,'036ea':5},'boundedAdditiveAuthoredScopes':17,'mustMergeWithExistingWholeScopes':True,'standaloneCompleteScopes':False,'predecessor104ArtifactSealDigest':bindings['sourcePredecessorSealDigest'],'generationParametersFingerprint':native['generationParametersFingerprint'],'generationMetadataPath':'generation-metadata.actual.json','actualNativeToolchain':native['actualToolchain'],'artifactCount':len(files),'artifacts':files,'wholePrimaryQualificationAndCurrentM6AndIndependentGates':'open; stable common-core binding and tests by root','newGoalIds':[],'otherDResultsCompared':False,'activeWrites':False,'imagesGenerated':False,'newTaskOrCaseQuota':False}
save('SEALED-additive-INERT-handoff.json',out);p=O/'SEALED-additive-INERT-handoff.json';(O/'SEALED-additive-INERT-handoff.json.sha256').write_text(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n')
print(json.dumps({'status':out['status'],'artifactCount':len(files),'sealDigest':h(p.read_bytes()),'wholeTechnicalCheck':'passed','boundedAuthoredScopes':17},ensure_ascii=False))
