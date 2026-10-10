from pathlib import Path
import json, hashlib, datetime, math
import jsonschema
O=Path(__file__).resolve().parent
ROOT=O.parents[6]
OLD='648224f4-cc8f-5f41-9cae-6d783cd1ae77'; LAW='5aaf5abf-5e70-57c6-b030-1d08a35d17b8'; EMU='79d244e0-049e-59e9-a2fb-b8f8670b315a'
F='f6bc5493-e138-5717-a027-e0579c80d687'; Q='0b3dbe47-9b98-5540-92e5-a8edf1693b96'; PARENT='3e0d8fbc-f383-5505-a30e-7c4f125342bb'
def read(n):return json.loads((O/n).read_text())
def h(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def save(n,d):(O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
old=read('history/canonical.actual-base.exact.json'); new=read('candidates/landscape.author-only.INERT.json')
a={g['id']:g for g in old['goals']}; b={g['id']:g for g in new['goals']}
assert len(a)==len(old['goals'])==679 and len(b)==len(new['goals'])==680
assert set(b)-set(a)=={LAW} and not set(a)-set(b)
changed={i for i in a if a[i]!=b[i]}; assert changed=={OLD,EMU,F,Q,PARENT}
assert b[PARENT]['contains']==a[PARENT]['contains']+[LAW]
assert {k:v for k,v in b[PARENT].items() if k!='contains'}=={k:v for k,v in a[PARENT].items() if k!='contains'}
assert {k:v for k,v in b[EMU].items() if k!='applicability'}=={k:v for k,v in a[EMU].items() if k!='applicability'}
assert b[EMU]['applicability']['jurisdiction']==a[EMU]['applicability']['jurisdiction']+['DE-NI']
schema=ROOT/'docs/landscape-runtime.schema.json'
jsonschema.Draft202012Validator(json.loads(schema.read_text())).validate(new)
for field in ['requires','contains']:
 state={}
 def walk(i):
  assert state.get(i)!=1,(field,i)
  if state.get(i)==2:return
  state[i]=1
  for j in b[i].get(field,[]):assert j in b;walk(j)
  state[i]=2
 for i in b:walk(i)
assert read('candidates/two-whole-practices.INERT.json')==[b[F],b[Q]]
assert read('candidates/three-whole-content-goals.scope-candidate.INERT.json')==[b[OLD],b[LAW],b[EMU]]
assert b[F]['requires']==b[F]['examData']['coveredGoalIds']==[OLD,LAW,EMU]
assert b[Q]['requires']==b[Q]['examData']['coveredGoalIds']==a[Q]['requires']+[LAW,EMU]
for gid,maximum,passing,points in [(F,40,25,[7,6,7,7,6,7]),(Q,44,27,[6,6,6,6,6,14])]:
 e=b[gid]['examData'];assert e['reviewStatus']=='needs_review'
 assert e['scoring']['maxPoints']==maximum and e['scoring']['passingPoints']==passing
 assert [s['points'] for s in e['scoring']['steps']]==points and sum(points)==maximum
 assert b[gid]['applicability']==a[gid]['applicability'] and b[gid]['tags']==a[gid]['tags']
 for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:assert e[k].strip() and '??' not in e[k]
for k in ['taskContent','taskContentEn']:
 s=a[Q]['examData'][k];t=b[Q]['examData'][k]
 assert s[s.index('**M1'):s.index('**M6')]==t[t.index('**M1'):t.index('**M6')]
 assert s[s.index('\n1.'):s.index('\n6.')]==t[t.index('\n1.'):t.index('\n6.')]
for k in ['solutionContent','solutionContentEn']:
 s=a[Q]['examData'][k];t=b[Q]['examData'][k];assert s[:s.index('\n6.')]==t[:t.index('\n6.')]
assert a[Q]['examData']['scoring']['steps'][:5]==b[Q]['examData']['scoring']['steps'][:5]
rows=read('source-notes/all165-selected-source-row-and-union-proposals.INERT.json')['rows']
assert len(rows)==165 and len({(r['sourceSet'],r['wholeOriginalSourceGoalId']) for r in rows})==165
for n in range(1,21):
 sid=f'{n:02d}';gs={g['id']:g for g in read(f'history/source-{sid}.selected-whole-original-rows.exact-objects.json')}
 rel=read(f'history/source-{sid}.whole-original-union-relations.exact-objects.json'); selected=[r for r in rows if r['sourceSet']==sid]
 assert {r['wholeOriginalSourceGoalId'] for r in selected}==set(gs)
 for r in selected:
  gid=r['wholeOriginalSourceGoalId'];orig=[x for x in rel if x['legacyGoalId']==gid]
  assert r['wholeOriginalStructuredRowDigest']==h(json.dumps(gs[gid],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
  assert r['originalOwnRelations']==[x for x in orig if x['canonicalGoalId'] in [OLD,EMU]]
  assert r['everyUnrelatedOriginalUnionRelationRetained']==[x for x in orig if x['canonicalGoalId'] not in [OLD,EMU]]
  assert r['newWholeMappingApproval']==False and r['noMutation']==True
roles=read('source-notes/sixteen-whole-country-source-vs-author-extension-roles.INERT.json')
assert len(roles['countries'])==16 and roles['original15EMUCountryUnion']==a[EMU]['applicability']['jurisdiction']
extensions=read('source-notes/six-explicit-authored-whole-Practice-extension-scopes.INERT.json')
assert extensions['originalf6bcTargetCountries']==a[F]['applicability']['jurisdiction']
assert extensions['original0b3dTargetCountries']==a[Q]['applicability']['jurisdiction']
assert len(extensions['extensionScopes'])==6
for r in extensions['extensionScopes']:
 practices=[x['goalId'] for x in r['practiceGoalEntries']]
 assert practices==[i for i in [F,Q] if r['jurisdiction'] in a[i]['applicability']['jurisdiction']]
 actual={i for p in practices for i in b[p]['examData']['coveredGoalIds']}
 target={x['goalId'] for x in r['contentGoalEntries']};pre={x['goalId'] for x in r['prerequisiteOnlyGoalEntries']}
 assert target==actual and not pre&target
 closure=set()
 def collect(i):
  for j in b[i].get('requires',[]):
   if j not in closure:closure.add(j);collect(j)
 for i in actual:collect(i)
 assert pre==closure-actual
 assert all(x['projectionRole']=='target' for x in r['practiceGoalEntries']+r['contentGoalEntries'])
 assert all(x['projectionRole']=='prerequisiteOnly' for x in r['prerequisiteOnlyGoalEntries'])
profiles=read('candidates/positive-profiles.native-bound.INERT.json'); previous=read('history/three-sealed-own-profile-substantive-inputs.exact.json');pmap={r['goalId']:r for r in previous}
assert {r['goalId'] for r in profiles}=={OLD,LAW,EMU}
for r in profiles:
 assert r['profile']==pmap[r['goalId']]['profile'] and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1'
 assert r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review' and r['reviewRunIds']==[]
native=read('checks/native-positive-candidates.actual.json')
assert len(native['ownNativeRecordChecks'])==3 and native['originalWholeContractBindingChecks']==[]
assert native['generationParametersFingerprint']==h((O/'generation-metadata.actual.json').read_bytes())
facts={'f6bc_A':{'oldTrancheInterest':100*.03,'newTrancheInterest':100*.07,'extraTrancheInterest':100*(.07-.03),'fictionalBridgeNowLater':[4,4.2]},'f6bc_B':{'oldTrancheInterest':20*.02,'newTrancheInterest':20*.06,'extraTrancheInterest':20*(.06-.02),'fictionalBridgeNowLater':[.8,.9]},'0b3d_III':{'oldTrancheInterest':20*.02,'newTrancheInterest':20*.06,'extraTrancheInterest':20*(.06-.02)},'0b3d_IV':{'oldTrancheInterest':10*.03,'newTrancheInterest':10*.04,'extraTrancheInterest':10*(.04-.03)}}
assert math.isclose(facts['f6bc_A']['extraTrancheInterest'],4) and math.isclose(facts['f6bc_B']['extraTrancheInterest'],.8) and math.isclose(facts['0b3d_IV']['extraTrancheInterest'],.1)
save('checks/actual-added-case-numerics.author-calculation.json',{'status':'passed_local_given_model_arithmetic','facts':facts,'noUnaffectedHistoricalCaseRerating':True,'notLearnerEvidence':True})
parsed=0
for p in O.rglob('*'):
 assert not p.is_symlink()
 if p.is_file() and p.suffix=='.json':json.loads(p.read_text());parsed+=1
 elif p.is_file() and p.suffix=='.jsonl':
  for line in p.read_text().splitlines():json.loads(line)
  parsed+=1
save('checks/whole-own-schema-DAG-history-source-scope-preservation.actual.json',{'status':'passed_local_whole_author_schema_DAG_native_P_history_and_scope_preservation','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originalAndCandidateGoalCounts':[679,680],'newStableOwnPreviouslyAuthoredGoalId':LAW,'modifiedExistingObjectsOnly':sorted(changed),'allOther674WholeObjectsUnchanged':True,'originalEMUWholeProseTaxonomyRequiresImageUnchanged':True,'EMUOnlyScopeAddition':'DE-NI explicit authored extension, no primary mandate claimed','wholeOriginalPracticeTargetCountrySetsUnchanged':True,'whole0b3dM1toM5TaskSolutionScoringExact':True,'preservedOriginalPerformanceMarks':{'f6bc':24,'0b3d':36},'addedActualPerformanceMarks':{'f6bc':16,'0b3d':8},'threeWholeProfileSubstantivePayloadsExactlyPreserved':True,'nativePositiveProfilesChecked':3,'unaffectedHistoricalPOr685CaseRerating':False,'selectedWholeSourceRowsPreserved':165,'everyUnrelatedSourceUnionRelationPreserved':True,'sourceSets':20,'explicitExtensionCountryScopes':6,'countryRoleProposals':16,'wholePrimaryCourseQualification':'open; actual bounded findings are separate from explicit owned extensions','schemaPath':str(schema.relative_to(ROOT)),'schemaDigest':h(schema.read_bytes()),'requiresDAG':True,'containsDAG':True,'ownJsonJsonlParsed':parsed,'independentContentReviewClaimed':False,'humanApprovalClaimed':False,'learnerTrialClaimed':False,'otherDRoundResultsReadOrCompared':False,'activeWrites':False,'imagesGenerated':False})
files=[{'path':str(p.relative_to(O)),'bytes':p.stat().st_size,'digest':h(p.read_bytes())} for p in sorted(O.rglob('*')) if p.is_file() and p.name not in ['SEALED-unreviewed-INERT-handoff.json','SEALED-unreviewed-INERT-handoff.json.sha256']]
seal={'status':'sealed_INERT_unreviewed_author_handoff','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','needsHumanReview':True,'wholeContentIds':[OLD,LAW,EMU],'wholePracticeIds':[F,Q],'existingPracticeTargetsExplicitlyPreserved':True,'primaryMandatesAndOwnedExtensionsSeparate':True,'generationParametersFingerprint':native['generationParametersFingerprint'],'generationMetadataPath':'generation-metadata.actual.json','actualNativeToolchain':native['actualToolchain'],'artifactCount':len(files),'artifacts':files,'sourceCourseAMCardsRoutesPracticePDVAndHumanGates':'independent stable whole review open; no native M6, visual approval or release claim','unaffectedHistoricalPOr685CaseRerating':False,'freshBlindDRounds':'not run; only after stable common state','canonicalConfigurationRegistryLedgerBooksOrCardsWrites':False,'newImagesGenerated':False}
save('SEALED-unreviewed-INERT-handoff.json',seal)
sp=O/'SEALED-unreviewed-INERT-handoff.json';(O/'SEALED-unreviewed-INERT-handoff.json.sha256').write_text(hashlib.sha256(sp.read_bytes()).hexdigest()+'  '+sp.name+'\n')
print(json.dumps({'status':seal['status'],'artifactCount':len(files),'sealDigest':h(sp.read_bytes()),'wholeTechnicalCheck':'passed'},ensure_ascii=False))
