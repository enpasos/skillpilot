from pathlib import Path
import json,gzip,hashlib,copy,shutil,sys
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Path(Path('/tmp/economics-independent678-root-out-path.txt').read_text().strip());C=Path(Path('/tmp/economics-independent678-root-cap-path.txt').read_text().strip())
H=R/sys.argv[1];NAVH=R/sys.argv[2]
I=Q/'wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1/actual-fieldwise678-foreign33-fiveNav359-references-author-index.json'
V2=I.parent/'twentyone-past-author-candidate-review-notes-only-successor-v2/actual-final-fieldwise678-V2-21note-only-full-before-after-binding-index.AUTHOR.json'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def get(b):
 p=R/b['path'];assert bind(p)==b;return rd(p)
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def raw(label):return json.loads(gzip.decompress((O/(label+'.raw.json.gz')).read_bytes()))
i=rd(I);v=rd(V2);h=rd(H);navh=rd(NAVH);old=get(i['wholeAfterCAN']);final=get(v['wholeAfterCAN'])
assert v['wholeBeforeCAN']==i['wholeBeforeCAN'] and v['viewRows']==i['viewRows']
bg={g['id']:g for g in old['goals']};fg={g['id']:g for g in final['goals']};new=set(i['newMaterialIds']);deltas=[]
for gid,b in bg.items():
 a=fg[gid]
 if a==b:continue
 x=copy.deepcopy(a);bn=b['examData']['reviewNote'];an=x['examData']['reviewNote'];x['examData']['reviewNote']=bn;assert x==b and gid in new
 assert 'wurde als inaktiver Autorenkandidat erstellt' in an and 'gesonderten unabhängigen Scope-Nachweis' in an
 deltas.append({'goalId':gid,'wholeBeforeReviewNote':bn,'wholeAfterReviewNote':an,'allOtherWholeFieldsExact':True,'actualRootTargetedChronologyReview':'KEEP: science and later scope remain separate, original author status is stated as past, human gates remain explicitly separate'})
assert len(deltas)==21 and set(bg)==set(fg)
assert get(h['wholeFinalAfterCAN'])==final
assert v['wholeAfterCAN']['sha256'] in json.dumps(navh), 'foreign Nav final seal must bind actual final237c wholeCAN'
before=raw('actual-before645-independent-root');after=raw('actual-after678-independent-root');neg=[raw('actual-negative-'+s+'678-independent-root') for s in ['reference','support','illegal-whole-closure']]
rule=lambda a:next(x for x in a['route']['rules'] if x['id']=='CQR-104');m0=rule(before)['metrics'];m1=rule(after)['metrics']
assert (m0['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute'],m0['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute'])==(174,33)
assert (m1['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute'],m1['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute'])==(0,0)
assert all(r['status']=='pass' for r in after['route']['rules'])
assert all(rule(n)['status']=='fail' for n in neg)
assert rule(neg[0])['metrics']['projectionScopesMissingTerminalAutonomyGoals']==1
assert rule(neg[1])['metrics']['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']==12 and rule(neg[1])['metrics']['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==4
assert rule(neg[2])['metrics']['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']==6 and rule(neg[2])['metrics']['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==2
assert after['compiler']['summary']=={'goals':678,'errors':0,'warnings':0,'diagnostics':1457}
roles=[]
for b,a in zip(before['all64NativeScopeRows'],after['all64NativeScopeRows']):
 assert (b['viewPath'],b['jurisdiction'])==(a['viewPath'],a['jurisdiction'])
 preserved={}
 for k in ['ordinaryTargets','ordinarySupport','memoryTargets','memorySupport','orientationTargets','orientationSupport','prerequisiteOnlyAtomicIds']:
  assert a[k]==b[k];preserved[k]=a[k]
 for k in ['allTargetAtomicIds','allSupportAtomicIds']:assert set(a[k])-new==set(b[k])
 roles.append({'scopeKey':a['viewPath']+'|'+a['jurisdiction'],'wholeExistingRolesExact':preserved,'newPracticeTargets':sorted(set(a['allTargetAtomicIds'])-set(b['allTargetAtomicIds']))})
assert len(roles)==64 and sum(len(x['wholeExistingRolesExact']['ordinaryTargets']) for x in roles)==6974
bc={x['goalId']:x for x in before['compiler']['goals']};ac={x['goalId']:x for x in after['compiler']['goals']}
changed={x for x in bc if bc[x]!=ac[x]};assert changed=={'96183c48-b499-54d7-8530-578f6ff40207','14c05eec-87af-5fd6-832a-4f5d9d280e66','1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc','a1c0e891-cb5b-56ef-9aa7-ac782e2099c3','0fb8833c-4017-5052-819a-ecb5f6ebb36f','5113c64b-405d-5f4b-bae9-70fe530b5e69'}
for b,a in zip(before['source']['jurisdictions'],after['source']['jurisdictions']):assert {k:x for k,x in b.items() if k not in ['visibleGoals','visibleClusterGoals']}=={k:x for k,x in a.items() if k not in ['visibleGoals','visibleClusterGoals']}
assert {k:x for k,x in before['source'].items() if k not in ['rawAtomicGoals','jurisdictions']}=={k:x for k,x in after['source'].items() if k not in ['rawAtomicGoals','jurisdictions']}
ctx=after['individualWholeMaterialContextBindings'];materials={x['id']:x for x in after['wholeReviewedMaterialRows']};assert len(ctx)==2112 and len(materials)==33
assert all(x['actualVisibleTarget']==x['actualEntireClosureEligible'] for x in ctx)
vis=[x for x in ctx if x['actualVisibleTarget']];exc=[x for x in vis if x['coveredExistingPrerequisiteOnlyIds']];assert len(vis)==718 and len(exc)==16
intl=[x for x in exc if x['materialId']!='306e72b4-5795-5393-accb-bcdb92fdb575'];policy=[x for x in exc if x['materialId']=='306e72b4-5795-5393-accb-bcdb92fdb575'];assert len(intl)==12 and len(policy)==4
assert all(x['jurisdiction']=='DE-BE' and not x['missingWholePrerequisiteIds'] for x in intl)
assert all(x['jurisdiction'] in ['DE-BY','DE-HE'] and x['courseProfile']=='GK' and x['coveredExistingPrerequisiteOnlyIds']==['94264f00-d0b2-564c-8338-747228390c20'] and len(x['wholeMandatoryClosureIds'])==8 and not x['missingWholePrerequisiteIds'] for x in policy)
held=[]
for x in ctx:
 covered=materials[x['materialId']]['wholeGoal']['examData']['coveredGoalIds'][0]
 if x['courseFits'] and x['jurisdiction'] in ac[covered]['compiledApplicability']['jurisdiction'] and x['missingWholePrerequisiteIds']:assert not x['actualVisibleTarget'];held.append(x)
assert len(held)==22 and all(x['courseProfile']=='GK' for x in held)
stage=rd(O/'actual-independent-current645-physical-guards-and678-fieldwise-science-nav-views-stage.root.json')
assert all(bind(R/g['path'])==g for g in stage['physical645Inputs']) and bind(R/stage['activeSEM']['path'])==stage['activeSEM']
oldGuard=rd(Q/'wirtschaft-current645-company-finance-consumer-labour48-active-root-v1/actual-current645-fortyeight506-before-mutation-whole-input-guards.json');guards=oldGuard['protectedWholeInputs'];assert len(guards)==1144 and all(bind(R/g['path'])==g for g in guards)
assert (C/CAN).read_bytes()==(R/i['wholeAfterCAN']['path']).read_bytes()
for x in i['viewRows']:assert (C/x['activePath']).read_bytes()==(R/x['candidate']['path']).read_bytes() and bind(R/x['activePath'])=={'path':x['activePath'],'sha256':x['before']['sha256'],'bytes':x['before']['bytes']}
shutil.copyfile(R/v['wholeAfterCAN']['path'],C/CAN)
obs=save('actual-own678-whole2112-contexts718-accesses22-held16-existingPOnly-and64-role-decisions.root.json',{'role':'ROOT independent whole scope; unchanged scientific bodies reused under three valid whole science seals','actual33WholeMaterialScopeRows':after['wholeReviewedMaterialRows'],'actual2112WholeContextDecisions':ctx,'actual718QualifiedVisibleBindings':718,'actual22GKCompletePrerequisiteClosuresHeld':held,'actual16ExistingPOnlyExceptions':exc,'actual64WholeRoles':roles,'ordinaryTargetOccurrences':6974,'all640OtherWhole645GoalsExact':True,'all645PriorPracticeContractsAndScopeRolesRemainExact':True,'allOld48ScopeDecisionsReusedReason':'All original 645 non-navigation bodies including old48 materials remain exact; all their compiler rows and existing native target/support sets retain exact values. Only new33 practice leaves are added. Old whole-science/scope seals stay unchanged; this is not a restart or new review of them.','source16_2134Unsupported0Unmapped0ExactExceptAdditiveStructuralAndPracticeCounts':True,'actualNationalNonEligibleNewPracticeOccurrencesExcluded':11,'all7RouteRulesPass':True,'beforeAfter104Metrics':[m0,m1],'allThreeOwnGenuineNegativeRules':[rule(x) for x in neg],'newIndependentCurricularScienceClosures':0,'restoredStrictBindings':0,'strictNet':0,'humanApproval':False,'activeWrites':0})
temporal=save('actual-own21-reviewNote-only-targeted-final237c-chronology-followup.root.json',{'actualOriginalNativeCAN':i['wholeAfterCAN'],'actualFinalCAN':v['wholeAfterCAN'],'actualWholeNativeScopeSemanticsExact':True,'actual21IndividualWholeNoteDecisions':deltas,'foreignNavStatusMeaningSeal':bind(NAVH),'freshNativeRerunRequired':False,'reason':'Only administrative notes changed to a truthful past tense. IDs, source claims, tasks, answers, grading, requires, contains, applicability, tags and all views are exact. Separate official semantic-source fingerprints must follow these21 practice notes; no science or scope approval is inferred from hashes.','activeWrites':0})
shutil.copyfile(__file__,O/'actual-own-final-678-review-helper.py')
manifest=save('actual-final-independent678-portable-whole-evidence.manifest.json',{'files':[bind(p) for p in sorted(O.rglob('*')) if p.is_file()],'activeWrites':0})
seal=save('actual-final-current678-remaining33-combined-scope-nav-status-independent-KEEP.handoff.receipt.json',{'decision':'KEEP_BOUNDED_CURRENT678_REMAINING33_WHOLE_SCOPE_NAV_STATUS_INTERACTION','reviewer':'/root','independentFromScopeAuthor':'/root/economics_m2_source_independent_a','wholeAuthorFinalHandoff':bind(H),'wholeAuthorFinalIndex':bind(V2),'wholeBefore645':v['wholeBeforeCAN'],'wholeInert678':v['wholeAfterCAN'],'foreignIndividualWholeNavStatusPOnlyPurposeReview':bind(NAVH),'qualified33WholeScienceSeals':[v[k] for k in ['internationalScienceReceipt','operationsScienceReceipt','policyScienceReceipt']],'ownFreshNative645Baseline':bind(O/'actual-before645-independent-root.raw.json.gz'),'ownFreshNative678Positive':bind(O/'actual-after678-independent-root.raw.json.gz'),'ownThreeActualNegatives':bind(O/'actual-three-independent678-native-negative-commands.root.json'),'ownActualWholeContextAndRoleDecisions':obs,'ownActual21AdministrativeNoteFollowup':temporal,'ownPortableManifest':manifest,'actualGoalCount':678,'actualNewPracticeReferences':359,'actualNewCountryReferences':359,'actualNewNationalExplicitReferences':0,'actual33MaterialBindings':718,'actualContexts':2112,'actualHeldGKCompleteClosures':22,'actualQualifiedPracticeOverExistingPOnlyBindings':16,'wholeOrdinaryTargetIds336SourceEvidence16_2134Memory10Cards66AndP336685Exact':True,'actualBeforeAfterRouteOccurrences':[174,0],'actualBeforeAfterRouteGoalIds':[33,0],'actualNetRouteOccurrenceGain':174,'actualNetDistinctRouteGoalGain':33,'newIndependentCurricularScienceClosures':0,'restoredStrictBindings':0,'strictNet':0,'allSevenRouteRulesPassInPrivateCandidate':True,'centralM6':'pending qualified technical integration and actual central/floor run','all1144ProtectedWholeInputsPass':True,'humanReviewReleaseTrials':'separate pending','activeWrites':0})
print(json.dumps({'final':seal,'all7RouteRulesPass':True,'routeGain':174,'remainingRouteIds':0,'strictNet':0}))
