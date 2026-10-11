from pathlib import Path
import json,hashlib,datetime,math
import jsonschema
ROOT=Path(__file__).resolve().parents[7];O=Path(__file__).resolve().parent
DD='dd38e0c5-d77b-5893-815c-548ea2a84429';PO='543bf91f-f6c6-5b1b-ba9e-43de321d8c7f';V='776457c2-8bb3-53b9-838b-a028319175fb';PAY='a5009946-62bb-5e6a-8c92-732d02e8fd70';POL='da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0';S='f1f73ebe-286a-52e8-a2e1-4383ece6e9ec';F='f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96';Q='036ea7f9-2a33-502f-8729-983fa8054694'
def h(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def save(n,d):(O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
old=json.loads((O/'history/canonical.actual-base.exact.json').read_text());new=json.loads((O/'candidates/landscape.author-only.INERT.json').read_text());a={g['id']:g for g in old['goals']};b={g['id']:g for g in new['goals']}
assert len(a)==len(old['goals'])==679 and len(b)==len(new['goals'])==679 and set(a)==set(b)
changed={g for g in a if a[g]!=b[g]};assert changed=={DD,PO,F,Q}
assert all(a[g]==b[g] for g in [V,PAY,POL,S])
assert b[DD]==json.loads((O/'history/sealed-dd38-retained-goal.exact.json').read_text())
povdoc=json.loads((O/'history/sealed-543b-da734-goals.exact.json').read_text());pov={g['id']:g for g in povdoc['revisedWholeGoals']+povdoc['unchangedReusedWholeGoals']}
assert b[PO]==pov[PO] and b[POL]==pov[POL]
schemaPath=ROOT/'docs/landscape-runtime.schema.json';jsonschema.Draft202012Validator(json.loads(schemaPath.read_text())).validate(new)
def dag(field):
 state={}
 def walk(i):
  assert state.get(i)!=1,f'{field} cycle: {i}'
  if state.get(i)==2:return
  state[i]=1
  for j in b[i].get(field,[]):assert j in b;walk(j)
  state[i]=2
 for i in b:walk(i)
dag('requires');dag('contains')
assert b[F]['requires']==b[F]['examData']['coveredGoalIds']==[DD,V,PAY]
assert b[Q]['requires']==b[Q]['examData']['coveredGoalIds']==[S,PO,POL]
assert {g['id'] for g in json.loads((O/'candidates/six-whole-content-successor-goals.INERT.json').read_text())}=={DD,V,PAY,PO,POL,S}
assert json.loads((O/'candidates/two-whole-practices.INERT.json').read_text())==[b[F],b[Q]]
for gid,mx,passing,steps in [(F,40,25,[4,4,10,4,4,14]),(Q,50,30,[10,15,10,15])]:
 ex=b[gid]['examData'];assert ex['reviewStatus']=='needs_review' and ex['scoring']['maxPoints']==mx and ex['scoring']['passingPoints']==passing and [s['points'] for s in ex['scoring']['steps']]==steps and sum(steps)==mx
 assert a[gid].get('contains',[])==b[gid]['contains']
 assert b[gid]['applicability']=={'jurisdiction':['DE-HE']} and b[gid]['extendedData']['applicabilityFromRequires']==True
 for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
  assert b[gid]['examData'][k].strip() and '??' not in b[gid]['examData'][k]
# Numerical implications from the actual supplied own case parameters; these are author calculations, not learner evidence.
facts={'f08':{'KHours':100*32,'EHours':80*40,'KFTE':100*32/40,'EFTE':80*40/40,'headcounts':[100,80],'weeklyIncome':[40*20,32*20],'proportionalIncomeChange':32/40-1,'serviceHours':20*40,'serviceCoverageOldNewRequired':[10,14,12],'XJobPoints':3+2+1,'YJobPoints':4+3+3,'XJobHourlyPay':8+2*(3+2+1),'YJobHourlyPay':8+2*(4+3+3),'eightHourTimePieceIJ':[8*20,8*40*0.5,8*50*0.5],'GperPerson':[.1*p/20 for p in [100000,200000,0]],'QFGbyPeriod':[[1000,1000,500],[0,1000,1000],[1000,1000,0]]},'036ea':{'relativeSectorMeans':[20/60,30/15,50/25],'RGap':20*(100-50)+20*(100-90),'SGap':40*(100-80),'RDepth':(20*50+20*10)/10000,'SDepth':(40*20)/10000,'waterSchoolUnionBoundsR':[max(30,20),min(100,30+20)],'waterSchoolUnionBoundsS':[max(20,35),min(100,20+35)],'agriculturalAbsoluteOutput':[100*.3,150*.24],'agriculturalAbsoluteChange':150*.24-100*.3,'agriculturalRelativeChange':150*.24/(100*.3)-1,'T1RealIncome':[108/1.2,180/1.2],'T1NominalThreshold':100*1.2,'T0T1Incidence':[80/200,50/200],'T0T1Gap':[80*(100-75),50*(100-108/1.2)],'T0T1Depth':[80*(100-75)/(200*100),50*(100-108/1.2)/(200*100)],'incidencePercentagePointChange':(50/200-80/200)*100,'incidenceRelativeChange':(50/200)/(80/200)-1,'accessHelpPlusRestTransferFits':200+800<=1000,'accessHelpPlusFullTrainingDoesNotFit':200+1000>1000}}
assert facts['f08']['eightHourTimePieceIJ']==[160,160,200] and facts['f08']['GperPerson']==[500,1000,0]
assert facts['036ea']['RGap']==1200 and facts['036ea']['SGap']==800 and facts['036ea']['T1RealIncome']==[90,150] and math.isclose(facts['036ea']['incidenceRelativeChange'],-.375)
save('checks/actual-case-numerics.author-calculation.json',{'status':'passed_local_actual_given_case_arithmetic','facts':facts,'authority':'own author technical calculation; no independent content judgement or learner evidence'})
rows=json.loads((O/'source-notes/all84-selected-row-restoration-and-remap-proposals.INERT.json').read_text())['rows'];assert len(rows)==84 and len({(r['mappingSourceSet'],r['wholeOriginalSourceGoalId']) for r in rows})==84
for sid in [f'{n:02d}' for n in range(1,19)]:
 gs={g['id']:g for g in json.loads((O/f'history/source-{sid}.selected-whole-original-rows.exact-objects.json').read_text())};rel=json.loads((O/f'history/source-{sid}.whole-original-row-union-relations.exact-objects.json').read_text());selected=[r for r in rows if r['mappingSourceSet']==sid];assert {r['wholeOriginalSourceGoalId'] for r in selected}==set(gs)
 for r in selected:
  gid=r['wholeOriginalSourceGoalId'];assert r['wholeOriginalSourceRowDigest']==h(json.dumps(gs[gid],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
  orig=[x for x in rel if x['legacyGoalId']==gid];assert r['originalOwnRelations']==[x for x in orig if x['canonicalGoalId'] in [DD,PO]] and r['unrelatedOriginalUnionRelationsPreserved']==[x for x in orig if x['canonicalGoalId'] not in [DD,PO]]
  assert set(r['proposedExistingDestinations'])<=set(a) and not r['wholeGoalSourceQualificationClaimed'] and not r['independentMappingDecisionClaimed']
components=json.loads((O/'source-notes/bounded-actual-primary-components.INERT.json').read_text())['components'];assert len(components)==11 and all(set(c['proposedExistingFacetIds'])<=set(a) and c['wholeMappingQualification']=='open' for c in components)
roles=json.loads((O/'source-notes/whole-country-and-course-role-proposals.INERT.json').read_text());assert len(roles['countries'])==12 and roles['candidatePracticeJurisdictionProposal']==['DE-HE'];assert all(r['wholeSourceCourseQualification']=='open' and r['noActualLearnerProjectionWrite'] for r in roles['countries'])
for r in roles['countries']:
 if r['jurisdiction']!='DE-HE':assert r['f08RoleProposal'].startswith('withheld') and r['036eaRoleProposal'].startswith('withheld')
images=json.loads((O/'source-notes/six-bound-original-images.actual-inspection.json').read_text())['images'];assert len(images)==6
for i in images:assert h((ROOT/i['repositoryPath']).read_bytes())==i['digest'] and i['actualVisualInspectionPerformed']
records=json.loads((O/'candidates/positive-profiles.native-bound.INERT.json').read_text());assert {r['goalId'] for r in records}=={DD,PO,POL}
originalProfiles=[json.loads((O/'history/sealed-dd38-retained-positive.exact.json').read_text())]+[json.loads(s) for s in (O/'history/sealed-543b-da734-positive.exact.jsonl').read_text().splitlines()];pmap={r['goalId']:r for r in originalProfiles}
for r in records:assert r['profile']==pmap[r['goalId']]['profile'] and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review' and r['reviewRunIds']==[]
native=json.loads((O/'checks/native-positive-candidates.actual.json').read_text());assert len(native['originalWholeContractBindingChecks'])==6 and len(native['ownNativeRecordChecks'])==3 and native['generationParametersFingerprint']==h((O/'generation-metadata.actual.json').read_bytes())
parsed=0
for p in O.rglob('*'):
 assert not p.is_symlink(),str(p)
 if not p.is_file():continue
 if p.suffix=='.json':json.loads(p.read_text());parsed+=1
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():json.loads(line)
  parsed+=1
save('checks/whole-own-schema-DAG-history-source-preservation.actual.json',{'status':'passed_local_whole_landscape_schema_DAG_native_P_and_history_preservation','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'originalAndCandidateGoalCounts':[len(a),len(b)],'newOrRemovedGoalIds':[],'modifiedExistingObjectsOnly':sorted(changed),'wholeReusedContentGoalsUnchanged':[V,PAY,POL,S],'wholeOwnEarlierSealedRetainedCandidatesUnchanged':[DD,PO,POL],'allOther675WholeGoalObjectsUnchanged':True,'requiresDAG':True,'containsDAG':True,'schemaPath':str(schemaPath.relative_to(ROOT)),'schemaDigest':h(schemaPath.read_bytes()),'sixHistoricalPAndThreeOwnReboundProfilesNativeChecked':True,'threeWholeProfileSubstantivePayloadsExactlyPreserved':True,'preservedOriginalPerformanceMarks':{'f08':24,'036ea':40},'actualAddedPerformanceMarks':{'f08':16,'036ea':10},'everyOriginalSelectedSourceRowAndEveryUnrelatedUnionRelationPreserved':True,'selectedSourceRows':84,'sourceSets':18,'boundedSourceComponents':11,'openCountryRoleProposals':12,'actualOriginalImageInspections':6,'newImagesGenerated':False,'ownJsonJsonlParsed':parsed,'sourceCourseAMCardsRoutesPracticeDPositiveVisualHumanGates':'open; local checks establish technical author validity only','otherDRoundResultsReadOrCompared':False,'activeCanonicalConfigurationRegistryLedgerCardsOrBooksWrites':False,'humanApprovalClaimed':False,'learnerTrialClaimed':False})
files=[]
for p in sorted(O.rglob('*')):
 if p.is_file() and p.name not in ['SEALED-unreviewed-INERT-handoff.json','SEALED-unreviewed-INERT-handoff.json.sha256']:files.append({'path':str(p.relative_to(O)),'bytes':p.stat().st_size,'digest':h(p.read_bytes())})
seal={'status':'sealed_INERT_unreviewed_author_handoff','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'authority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','needsHumanReview':True,'newCanonicalGoalIds':[],'wholeContentSuccessorGoalIds':[DD,V,PAY,PO,POL,S],'wholePracticeSuccessorIds':[F,Q],'generationParametersFingerprint':native['generationParametersFingerprint'],'generationMetadataPath':'generation-metadata.actual.json','actualNativeToolchain':native['actualToolchain'],'artifactCount':len(files),'artifacts':files,'independentWholeReview':'open','sourceCountryCourseQualification':'open; only actual choice-conditioned HE author proposals, no source-qualified release','wholeAMCardsRoutesPracticePDVAndHumanGates':'open','freshNativeBlindDRounds':'not run for this candidate state; follow only at stable whole state','otherDRoundResultsCompared':False,'canonicalOrActiveWrites':False,'newImagesGenerated':False}
save('SEALED-unreviewed-INERT-handoff.json',seal);p=O/'SEALED-unreviewed-INERT-handoff.json';(O/'SEALED-unreviewed-INERT-handoff.json.sha256').write_text(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n')
print(json.dumps({'status':seal['status'],'artifactCount':len(files),'sealDigest':h(p.read_bytes()),'wholeTechnicalCheck':'passed','activeWrites':False,'newGoalIds':[]},ensure_ascii=False))
