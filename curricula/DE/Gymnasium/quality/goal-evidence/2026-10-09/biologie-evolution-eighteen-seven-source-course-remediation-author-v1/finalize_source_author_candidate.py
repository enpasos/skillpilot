#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finish an inactive bounded author package with real scoped terminal receipts."""
from pathlib import Path
import json,hashlib,subprocess,sys,datetime,importlib.util
import jsonschema
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[6];REL=BASE.relative_to(ROOT).as_posix()
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads((ROOT/p).read_text())
def put(p,d):
 q=BASE/p;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return q.relative_to(ROOT).as_posix()
def bind(p):
 q=ROOT/p if isinstance(p,str) else p;b=q.read_bytes();return {'path':q.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def run(argv,label):
 r=subprocess.run(argv,cwd=ROOT,text=True,capture_output=True)
 (BASE/f'checks/{label}.actual.stdout.txt').write_text(r.stdout)
 (BASE/f'checks/{label}.actual.stderr.txt').write_text(r.stderr)
 return {'argv':argv,'cwd':'.','exitCode':r.returncode,'stdout':bind(BASE/f'checks/{label}.actual.stdout.txt'),'stderr':bind(BASE/f'checks/{label}.actual.stderr.txt')}

# An actual limited scope preview, not a fictitious full HE-LK learner default.
canon=read(REL+'/input/current-canonical479.exact.json')
limited={'$schema':'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json','viewFormatVersion':'1.0','viewId':'de-he-gym-sekii-biology-lk-limited-Q2-1-source-role-preview-author-candidate','landscapeId':canon['landscapeId'],'language':'de-DE','title':'HE LK Q2.1: begrenzte überprüfte Quellenrolle, kein vollständiger Standard-Lehrgang','scope':{'schoolForm':'Gymnasium','jurisdiction':'DE-HE','stage':'SekII','courseProfile':'LK'},'rootNodes':[{'kind':'structure','id':'HE-Q2-1-limited-reviewed-source-role','label':'Teilrolle Q2.1: synthetische Evolutionstheorie / nicht-naturwissenschaftliche Vorstellungen','children':[{'kind':'goalEntry','goalId':'ac40db32-5dc7-5c43-8771-bf805d24aa3b','projectionRole':'target'}]}]}
put('candidate/composition-views/HE-LK-Q2-1-limited-core-source-role-preview.view.json',limited)
current_views=sorted((ROOT/'curricula/DE/Gymnasium/composition-views/biologie').glob('*.view.json'))
view_scopes=[{'binding':bind(p),'viewId':json.loads(p.read_text())['viewId'],'scope':json.loads(p.read_text())['scope']} for p in current_views]
assert len(current_views)==8
assert not any(v['scope'].get('jurisdiction')=='DE-HE' and v['scope'].get('stage')=='SekII' for v in view_scopes)
code_paths=['app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts','backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java','backend/src/main/java/com/skillpilot/backend/service/LearnerService.java']
put('actual-book-catalog-vs-HE-learner-scope-and-Hox-primary-boundaries.json',{
 'schemaVersion':1,'role':'actual-code-and-authored-view-boundary-review-author-candidate','codeBindings':[bind(p) for p in code_paths],'currentBiologyAuthoredViews':view_scopes,
 'bookCatalogRoot':'app/scripts/config/goal-books','actualRepositoryLearnerViewRoot':'curricula/DE/Gymnasium/composition-views','bookSourceAtlasIsPersonalCurriculumDefault':False,
 'actualCodeReading':'buildGoalBookSourceAtlasInputs output guard limits outputs to app/scripts/config/goal-books. CompositionViewService loads only DE/Gymnasium/composition-views below configured curricula root. Learner scope dimensions schoolForm/jurisdiction/stage/durationModel/courseProfile; no Q1.5 election predicate. LearnerService nonauthoritative unmatched-view branch can retain filtered fallback goals. This static reading is not evidence from private learner sessions.',
 'currentActualHE_SekII_LKAuthoredLearnerViewExists':False,'currentDefaultLearnerExclusionOfHoxProven':False,
 'HoxCurrentPrimarySupport':{'HE':{'source':'HE current2025 printed38+40','role':'Q1.5 chosen topic, LK Homeobox genes plus regulation in development; supplementary Evo-Devo transfer, not universal LK duty','catalogWitnessAllowed':True,'wholeSourceApproval':False},'BY':{'actualCurrentOfficialPage':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht','actualReading':'B12.2.2 supports regulation, development/specialization, transcription factors, enhancers/silencers and stem cells; whole page has no Hox literal. Development/regulation alone does not discharge the specific whole Evo-Devo goal.','wholeSpecificHoxSourceProven':False},'MV_SH_BW_NWCurrentConfiguredPdfSearch':{'actualReading':'Configured available original official PDFs were searched after pdftotext -layout for Hox/Homeobox/Homöobox; no matching explicit alternative was found. This is bounded to these configured PDFs, not a universal absence claim.','wholeSpecificHoxSourceProven':False},'BWOtherActualOfficialSource':{'url':'https://www.bildungsplaene-bw.de/SonBiowiss_OS','locus':'BPE5.7 and6.1','support':'Actual Hox complexes/expression and developmental evidence for evolution.','scope':'Sondergebiete der Biowissenschaften, modular subject of berufliche Gymnasien; not the current ordinary general-Gymnasium biology source scope.','currentAtlasSourceAdded':False,'reasonNotUsed':'Different subject/program plus selected modules; adding it as ordinary nationwide Gymnasium biology would silently broaden the reviewed scope.'}},
 'bookCatalog394TechnicalCandidate':REL+'/candidate/source-atlas.whole479-book-catalog-with-optional-witness.inputs.json','mandatoryOnly393DiagnosticIsNotCompleteCatalog':True,
 'HEExplicitSelectedQ1_5CandidateViewId':'de-he-gym-sekii-biology-lk-Q1-5-explicitly-selected-author-candidate','HEExplicitSelectedQ1_5CandidateIsAutoRegistered':False,
 'limitedCorePreviewViewId':limited['viewId'],'limitedCorePreviewIsFullHE_LKStandard':False,'otherCurrentHEMandatoryAndElectiveDutyConditionsFullyReviewed':False,
 'nextConcreteIntegrationStep':'Independently review the optional book witness and actual HE-Q1.5 raw source span. Keep book-catalog394 independent of learner defaults. For a learner default, review all current HE mandatory/elective conditions, author the full ordinary HE-SekII-LK view without unselected elective targets and bind an actual explicit selection route before indexing the Q1.5 candidate. Do not register both same-scope views in the current automatic matcher and call the chosen topic enforced. No compiler or learner runtime was changed in this package.',
 'sourceAndLearnerWholeCourseApproval':False,'humanApproval':False,'strictGain':0})

# All inputs still have exactly the frozen bytes; no active write or hidden source mutation.
freeze=read(REL+'/source-remediation.input-FIRST.freeze.json')
input_results=[{'expected':b,'actual':bind(b['path']),'equal':bind(b['path'])==b} for b in freeze['inputBindings']]
assert all(x['equal'] for x in input_results)
original_frame=read(REL+'/input/whole35-duty30-partner-original-frame.exact.json')
assert len(original_frame['wholeOriginalSourceDutyRows'])==35
assert len(original_frame['wholeOriginalAndCurrentPartnerGoals'])==30
actual_current=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
assert actual_current==canon
expanded=read(REL+'/candidate/current479-plus-one-assessable-behaviour-companion.canonical.json')
assert expanded['goals'][:479]==canon['goals'] and len(expanded['goals'])==480
diffs=read(REL+'/source-and-view.exact-semantic-diffs.actual.json')
advanced={'1e78d6eb-1f49-59c1-9617-6ea445d3fe65','c2f8c542-9386-5a18-bf7e-52698b932242','9dff0360-c2e9-5e43-af8b-87e264281cf7'}
source_invariants=[]
for item in diffs['sourceSuccessors']:
 orig=read(item['original']['path']);new=read(item['successor']['path'])
 if item['kind']=='source-extraction':
  assert [g['id'] for g in orig['sourceGoals']]==[g['id'] for g in new['sourceGoals']]
  modified=[a['id'] for a,b in zip(orig['sourceGoals'],new['sourceGoals']) if a!=b]
  source_invariants.append({'source':item['successor'],'originalAllSourceGoalIdsRetained':True,'changedSourceGoalIds':modified,'unchangedSourceGoalRowsRetainedExact':len(orig['sourceGoals'])-len(modified)})
 else:
  assert [d['sourceGoalId'] for d in orig['decisions']]==[d['sourceGoalId'] for d in new['decisions']]
  for d in new['decisions']:
   removed=set(d.get('authorQualification',{}).get('removedUnsupportedWholeSourceTargets',[]))
   assert not removed&set(d['canonicalGoalIds'])
   for edge in new['mappings']:
    if edge.get('legacyGoalId',edge.get('sourceGoalId'))==d['sourceGoalId']:
     assert edge['canonicalGoalId'] not in removed
  changed_decisions=[a['sourceGoalId'] for a,b in zip(orig['decisions'],new['decisions']) if a!=b]
  source_invariants.append({'mapping':item['successor'],'allOriginalDecisionIdsRetained':True,'changedDecisionIds':changed_decisions,'unrelatedDecisionRowsRetainedExact':len(orig['decisions'])-len(changed_decisions)})

# Scoped schema validation uses existing ordinary schemas, without exclusions.
runtime_schema=read('docs/landscape-runtime.schema.json');view_schema=read('contracts/curriculum-package/v1/composition-view.schema.json')
runtime_paths=[REL+'/input/current-canonical479.exact.json',REL+'/candidate/current479-plus-one-assessable-behaviour-companion.canonical.json']
view_paths=[p.relative_to(ROOT).as_posix() for p in (BASE/'candidate/composition-views').glob('*.view.json')]+[REL+'/candidate/conditional/RP-SekI-plus-ancestry-behaviour-companion.view.json']
for p in runtime_paths:jsonschema.validate(read(p),runtime_schema)
for p in view_paths:jsonschema.validate(read(p),view_schema)
spec=importlib.util.spec_from_file_location('validate_schemas',ROOT/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
symlink_errors=module.curriculum_symlink_errors(ROOT);assert not symlink_errors,symlink_errors
ignored=subprocess.run(['git','check-ignore','--no-index',REL],cwd=ROOT,text=True,capture_output=True);assert ignored.returncode==1,ignored.stdout
terminals=[]
terminals.append(run(['app/node_modules/.bin/tsx',REL+'/run_scoped_normal_checks.ts'],'ordinary-scoped-source-and-view-checks'))
assert terminals[-1]['exitCode']==0,terminals[-1]
terminals.append(run(['python3',REL+'/selection_simulation.py','--n','100','--generations','5','--replicates','40','--seed','7301'],'second-parameters-selection-simulation'))
assert terminals[-1]['exitCode']==0
sim2=read(REL+'/checks/second-parameters-selection-simulation.actual.stdout.txt')
parse_results=[]
for p in sorted(BASE.rglob('*')):
 if p.is_symlink():raise AssertionError('Candidate must be portable regular files: '+str(p))
 if p.suffix=='.json':
  v=json.loads(p.read_text());parse_results.append({'binding':bind(p),'fullyParsed':True})
put('checks/whole-input-preservation-scoped-schema-and-portability.actual.json',{'schemaVersion':1,'inputBytesResults':input_results,'allInputsStillExact':True,'whole35DutyRowsRetainedExact':True,'whole30PartnerRowsRetainedExact':True,'current479GoalObjectsRetainedExact':True,'conditional480First479GoalObjectsRetainedExact':True,'sourceAndMappingRowInvariants':source_invariants,'runtimeSchemaValidatedPaths':runtime_paths,'compositionViewSchemaValidatedPaths':view_paths,'fullJsonParseRecordsBeforeFinalSeal':parse_results,'curriculumSymlinkErrors':symlink_errors,'candidatePackageIgnored':False,'noAbsoluteOrEscapingSymlinks':True,'actualScopedTerminalChecks':terminals,'secondSyntheticSoftwareParameterRun':{'n':100,'replicates':40,'seed':7301,'actualCompletedAuthorReplicateRuns':120,'terminalMeanBrownFrequencies':{c['name']:c['meanBrownFrequencyByGeneration'][-1] for c in sim2['conditions']},'learnerPerformance':False},'completeBuildOrGlobalScienceRerun':False,'currentStrictGain':0,'activeWrites':False,'humanApproval':False})

qualification=read(REL+'/seven-source-author-qualification-and-remaining-fields.actual.json')
author_decisions=[]
for condition in qualification['originalSevenWholeClosureConditions']:
 fid=condition['findingId']
 author_decisions.append({'findingId':fid,'necessaryWholeClosureConditionRetained':condition['necessaryClosureEvidence'],'actualAuthorSuccessorRows':[r for r in qualification['qualificationRows'] if fid in r['findingIds']],'authorJudgment':'genuine bounded source/material/placement correction prepared; independent whole finding closure pending','independentFindingClosed':False,'sourceApproved':False,'humanApproval':False})
put('seven-source-course-remediation.author-scientific-FIRST.verdict.json',{'schemaVersion':1,'role':'author-first-judgment-not-independent-review','createdAt':NOW,'inputFirstFreeze':bind(REL+'/source-remediation.input-FIRST.freeze.json'),'findings':author_decisions,'wholeOriginalDutyRows':35,'wholeOriginalPartnerGoals':30,'unchangedBaseCanonicalGoalObjects':479,'currentAtomicDenominator':394,'newConditionalCompanionIds':['7d2da9ab-aed0-562b-a99a-840825fca009'],'actualMethodProtocols':5,'actualAuthorSoftwareParameterSets':2,'performedHumanOperation':False,'actualLearnerPerformance':False,'bookOptionalSourceWitnessIsUniversalLearnerDuty':False,'sourceApproval':False,'independentApproval':False,'humanApproval':False,'humanTrial':False,'strictGain':0,'activeWrites':False})

handover={'schemaVersion':1,'role':'neutral-whole-source-and-view-author-successor-for-two-independent-reviews','createdAt':NOW,'currentStrictBio':{'strict':299,'denominator':394},'currentCanon479Exact':bind(REL+'/input/current-canonical479.exact.json'),'conditionalCanon480NotForNative18UntilIndependentCompanionReview':bind(REL+'/candidate/current479-plus-one-assessable-behaviour-companion.canonical.json'),'whole35Duty30PartnerOriginalFrame':bind(REL+'/input/whole35-duty30-partner-original-frame.exact.json'),'exactCurrentSourceViewSemanticDiffs':bind(REL+'/source-and-view.exact-semantic-diffs.actual.json'),'sourceSuccessors':diffs['sourceSuccessors'],'viewSuccessors':diffs['viewSuccessors'],'additionalSHGeneFlowSource':bind(REL+'/candidate/source-extractions/SH-SekII-E13-E15-gene-flow.additional-source.json'),'additionalSHGeneFlowMapping':bind(REL+'/candidate/mappings/SH-SekII-E13-E15-gene-flow.additional.review.json'),'bookCatalog394OptionalWitnessNormalConfig':bind(REL+'/candidate/source-atlas.whole479-book-catalog-with-optional-witness.inputs.json'),'mandatoryOnly393DiagnosticNormalConfig':bind(REL+'/candidate/conditional/source-atlas.whole479-mandatory-only-diagnostic.inputs.json'),'actualNormalSourceAtlasChecks':bind(REL+'/checks/ordinary-whole-source-atlas-diagnostics.actual.json'),'actualNormalCompositionChecks':bind(REL+'/checks/ordinary-composition-view-compile.actual.json'),'actualBookVsLearnerBoundary':bind(REL+'/actual-book-catalog-vs-HE-learner-scope-and-Hox-primary-boundaries.json'),'methodAssessmentMaterials':bind(REL+'/material/five-source-faithful-executable-method-protocols.author-candidate.json'),'actualAuthorSoftwareExecution':bind(REL+'/checks/executable-software-operation.actual.receipt.json'),'newRPCompanionFullMaterial':bind(REL+'/material/RP-ancestry-behaviour-two-full-bilingual-material-cases.author-candidate.json'),'existingOwnerSearchAndCompanionNeeds':bind(REL+'/existing-method-owner-search-and-companion-needs.actual.json'),'affectedProtected299ContextIds':bind(REL+'/affected-current-protected299.source-page-context-list.actual.json'),'sourceAndCourseRemainingFields':bind(REL+'/seven-source-author-qualification-and-remaining-fields.actual.json'),'authorFirstJudgment':bind(REL+'/seven-source-course-remediation.author-scientific-FIRST.verdict.json'),'normalInputSchemaPortabilityActualTerminalChecks':bind(REL+'/checks/whole-input-preservation-scoped-schema-and-portability.actual.json'),'requestedIndependentReview':'Two actual independent targeted reviews must read primary page/operator/course limits and the full35/30 original frame, all changed extraction/decision/legacy edges and views, actual method protocols/software, RP companion DE/EN whole text and2cases; retain unresolved dissent. Author successor is not independent source or whole-course approval.','stillOpen':['full HE-LK learner standard mandatory/elective scope and explicit actual Q1.5 selection route','all7 independent source/course closures','RP companion independent atomarity/semantic kind/D/P/M/V','existing430b independent atomarity finding','required independent method-owner context/material approvals','complete30-partner duty closure not inferred'],'strictGain':0,'newStrictScientificClosures':0,'restoredExistingStrictBindings':0,'activeWrites':False,'independentApproval':False,'humanApproval':False,'humanTrial':False}
entry=put('neutral-whole35-partner30-seven-source-author-successor.independent-review.entry.json',handover)
# Final binds every regular package artifact except itself. No circular seal binding.
all_files=[bind(p) for p in sorted(BASE.rglob('*')) if p.is_file() and p.name!='seven-source-author-successor.final.freeze.json']
put('seven-source-author-successor.final.freeze.json',{'schemaVersion':1,'role':'author-final-package-byte-seal-not-quality-approval','createdAt':NOW,'neutralEntry':bind(entry),'files':all_files,'fileCount':len(all_files),'sourceApproval':False,'independentApproval':False,'humanApproval':False,'strictGain':0,'activeWrites':False})
print(json.dumps({'entry':entry,'entryBinding':bind(entry),'finalSeal':bind(REL+'/seven-source-author-successor.final.freeze.json'),'fileCount':len(all_files),'sourceSuccessorPairs':7,'authoredSekIViewSuccessors':4,'normalViewChecks':7,'bookCatalog394Technical':True,'mandatoryOnlyDiagnostic393HOLD':True,'wholeHE_LKDefaultApproved':False,'newConditionalRPGoalIds':['7d2da9ab-aed0-562b-a99a-840825fca009'],'currentStrictBio':'299/394','strictGain':0},ensure_ascii=False))
