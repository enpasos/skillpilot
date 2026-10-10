import json,pathlib,hashlib,shutil,os
R=pathlib.Path('/home/enpasos/projects/skillpilot'); O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-company-whole-science-independent-merge-audit-v1'
def read(p):return json.loads(pathlib.Path(p).read_text())
def rec(p):
 p=pathlib.Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,d):
 p=O/n;assert not p.exists(),p;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return rec(p)
hp=pathlib.Path('/tmp/economics-company12-root-author-final-path.txt').read_text().strip();h=read(hp); original=read(R/h['wholeOriginalDRAFT12']['path']); bodies=read(R/h['wholeDRAFT12']['path']);before=read(R/h['actualCurrent597ReadOnly']['path']);after=read(R/h['wholeCurrent609ThreeFindingsInertNoScope']['path']);intake=read(O/'actual-whole-twelve-current-contract-P24-and-frozen-original-bodies-intake.independent.json'); judgments=read(O/'actual-final-twelve-whole-DEEN-company-science-after-three-real-corrections.individual-KEEP.json')
assert len(original)==len(bodies)==12 and len(before['goals'])==597 and len(after['goals'])==609
bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']}; assert len(bg)==597 and len(ag)==609
assert all(ag[k]==v for k,v in bg.items());assert set(ag)-set(bg)=={g['id'] for g in bodies};assert all(ag[g['id']]==g for g in bodies)
for g,b in zip(bodies,original):
 assert g['id']==b['id'] and {k:v for k,v in g.items() if k!='examData'}=={k:v for k,v in b.items() if k!='examData'}
 assert g['examData']['reviewStatus']=='draft'
 for k,v in g['examData'].items():
  if k not in ('taskContent','taskContentEn','solutionContent','solutionContentEn'):assert v==b['examData'][k]
for typ in ['contains','requires']:
 state={}
 def visit(k):
  if state.get(k)==1:raise AssertionError('cycle '+typ+' '+k)
  if state.get(k)==2:return
  state[k]=1
  for c in ag[k].get(typ,[]):assert c in ag,(k,c);visit(c)
  state[k]=2
 for k in ag:visit(k)
book=read(R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'); ppath=R/book['evidenceReviewPaths'][0];prows=[json.loads(x) for x in ppath.read_text().splitlines() if x.strip()];pm={x['goalId']:x for x in prows};assert len(prows)==len(pm)==336
originalP=next(x['immutableOwnSnapshot'] for x in intake['originalWholeInputGuards'] if x['actualOriginal']['path'].endswith('.jsonl'));assert ppath.read_bytes()==(R/originalP['path']).read_bytes()
case_count=sum(len(x['profile']['applicationCaseBriefs']) for x in prows);assert case_count==685
for row in intake['wholeReadCurrentGoalP24']:
 g=row['wholeCurrentGoal'];assert bg[g['id']]==g;assert pm[g['id']]==row['wholeOriginalPositiveEvidence']
assert len(judgments['individualWholeScientificJudgments'])==12
# Technical input byte guards are separate from the scientific reading and judgments.
guards={}
def collect(v,label):
 if isinstance(v,dict):
  if isinstance(v.get('path'),str) and isinstance(v.get('sha256'),str):
   p=pathlib.Path(v['path']);p=p if p.is_absolute() else R/p
   assert p.is_file() and not p.is_symlink(),p
   rr=rec(p);assert rr['sha256']==v['sha256'],(label,p,rr['sha256'],v['sha256']);guards[rr['path']]=rr
  for k,x in v.items():collect(x,label+'/'+k)
 elif isinstance(v,list):
  for i,x in enumerate(v):collect(x,label+'/'+str(i))
collect(h,'rootV4');collect(intake['originalWholeInputGuards'],'ownOriginalSnapshots')
# Preserve actual executable independent helpers without running/recounting unchanged science.
helpers=O/'independent-executed-helpers';helpers.mkdir(exist_ok=False)
for n in ['economics-company12-independent-works.py','economics-company-ai-counter.py','economics-company-quality-counter.py','economics-company12-independent-calculations-and-project.py','economics-company12-independent-regrade.py','economics-company12-independent-followup.py','economics-company12-independent-decisions.py','economics-company12-native-schema.mjs','economics-company12-native-schema-successor-v2.mjs','economics-company12-independent-final-seal.py']:
 shutil.copyfile('/tmp/'+n,helpers/n)
# Own final snapshots make the qualified foreign body portable.
for key in ['wholeDRAFT12','wholeCurrent609ThreeFindingsInertNoScope','wholeActualCurrent597Followup']:
 p=R/h[key]['path'];dest=O/'whole-inputs'/h[key]['path'];dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists();shutil.copyfile(p,dest);assert rec(dest)['sha256']==h[key]['sha256']
dest=O/'whole-inputs'/pathlib.Path(hp).relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(hp,dest)
activeguard=write('actual-final-current597-P336685-and-whole609-field-boundary.endguard.json',{'reviewer':'/root/economics_merge_audit','actualCurrent597':h['actualCurrent597ReadOnly'],'actualP336685':rec(ppath),'wholeP336OriginalBytesExact':True,'wholeSelected12GoalsAndP24Exact':True,'whole609':h['wholeCurrent609ThreeFindingsInertNoScope'],'all597ExistingWholeGoalsExact':True,'newWholeMaterial12Only':True,'all12WholeRequiresCoveredTagsScoring24_15AndDraftStatusExact':True,'bothDAGAndAllReferencesPass':True,'ordinaryContractProfileOrSourceMutations':0,'activeWrites':0})
# All previously created own evidence stays immutable. The new manifest covers every current member except itself and the final receipt.
manifest=write('actual-final-portable-input-and-independent-output-whole-byte-manifest.json',{'method':'Actual whole-file byte preservation only. Scientific judgments are separately written from whole readings, independent works and current primary readings; hashes do not supply science.','externalDeclaredInputs':list(guards.values()),'actualGuardedExternalWholeFiles':len(guards),'ownWholeEvidenceFiles':[rec(p) for p in sorted(O.rglob('*')) if p.is_file()],'ownWholeFilesBeforeManifest':sum(p.is_file() for p in O.rglob('*'))})
follow=read(O/'actual-five-whole-independent-V4-followup-regradings-and-genuine-fair-partial-works.json');audited=read(O/'actual-thirtysix-whole-independent-company-works-individual-marking-audited-successor-v2.json');calc=read(O/'actual-independent-rational-calculations-network-JIS-zipper-and-executed-project-results.json'); schema=read(O/'actual-whole609-runtime-schema-and-real-missing-required-task-negative.independent.json');assert schema['schemaValid'] and schema['missingActualRequiredGermanTaskRejected'];assert follow['allFiveActualFinalScores']==[14,14,14,21,20]
final=write('actual-final-twelve-company-whole-DEEN-science-three-real-remedies-independent-KEEP.handoff.receipt.json',{
 'reviewer':'/root/economics_merge_audit','role':'independent whole scientific reviewer; no author of these twelve bodies or their three remedies','scientificVerdict':'KEEP_all12','qualifiedFinalAuthorHandoff':rec(hp),'qualifiedFinalWhole12':h['wholeDRAFT12'],'current597AndP24Intake':rec(O/'actual-whole-twelve-current-contract-P24-and-frozen-original-bodies-intake.independent.json'),'actualIndividualFinal12ScientificJudgments':rec(O/'actual-final-twelve-whole-DEEN-company-science-after-three-real-corrections.individual-KEEP.json'),
 'actualOriginalNineKEEPThreeREVISE':rec(O/'actual-original-twelve-whole-DEEN-company-science-nine-KEEP-three-REVISE.individual-judgments.json'),'targetedFollowup':rec(O/'actual-five-whole-independent-V4-followup-regradings-and-genuine-fair-partial-works.json'),
 'wholeFinal12DEENTasksSolutionsRubricsAndAllCurrent12GoalsP24ActuallyRead':True,'actualOriginalBodiesNineWholeExact':True,'actualThreeTargetedRemedies':{'JIS':'Only two actual solution strings correct the independently derived mismatch positions 2 and 4.','AI':'Four boundary strings separately protect whole privacy/autonomy and concrete group/fairness performance.','process':'Four boundary strings separately protect whole case-specific quality performance and flexibility/limits.'},'actualFinalComparedLeafStringDeltas':10,
 'independentAuditedCompleteWorks':rec(O/'actual-thirtysix-whole-independent-company-works-individual-marking-audited-successor-v2.json'),'actualDistinctWholeSixAnswerWorks':39,'actualDistinctManualCriterionMarks':936,'countMethod':'36 audited complete works/864 individual marks plus3 genuinely new followup works/72 marks. Two original bypasses are reused and regraded, not counted as new works. Earlier own draft mark corrections and failed schema-negative assumption are retained as explicit history.',
 'actualOriginalCoreAbsenceScores':[19,19],'actualFinalRegradedCoreAbsenceScores':[14,14],'actualAdditionalPrivacyAbsenceRaw15Final14':True,'actualGenuineImperfectFollowupScores':[21,20],'fairPartialWithoutPerfectDetailOrTaskQuota':True,
 'actualIndependentRationalNetworkAndSequenceChecks':110,'actualIndependentCalculationsAndExecutedProject':rec(O/'actual-independent-rational-calculations-network-JIS-zipper-and-executed-project-results.json'),'projectExecution':'Actual JSON table recalculations, textual diagrams and explicitly labelled one-reviewer role simulation; no real external group, persons or messages claimed. Separate solo negative is preserved.',
 'actualNineCurrentPrimaryNormReadings':rec(O/'actual-nine-current-official-primary-norm-whole-reading-and-bounded-source-limits.independent.json'),'primaryReadLimits':'Eight official individual norm pages read directly; LkSG6 direct timeout retained and complete official indexed paragraphs1-5 actually read. No full statute/PDF or broader host acceptance inferred.',
 'actualRuntimeSchemaAndRequiredTaskNegative':rec(O/'actual-whole609-runtime-schema-and-real-missing-required-task-negative.independent.json'),'actualCorrectedSchemaCommand':['node','/tmp/economics-company12-native-schema-successor-v2.mjs'],'actualCorrectedSchemaExitCode':0,'originalFailedSchemaAssumption':rec(O/'actual-original-schema-negative-assumption-rejected.execution-history.json'),'runtimeSchemaBoundary':'Actual609 valid and missing required German task rejected. English is optional in runtime schema; bilingual whole completeness was independently read, not proved by that negative.',
 'wholeCurrentEndguards':activeguard,'portableManifest':manifest,'machineDraftStatusesRemainDraft12':True,'nativeSEMClassificationOrFPAdapterWritten':False,'scientificKindSuitability':'Each whole local assessment is scientifically suitable as practiceAssessment; this receipt does not itself materialize a native SEM ledger.',
 'sourceCoverageOrJurisdictionCourseScopeApproval':False,'navigationOrViewReleaseApproval':False,'humanApproval':False,'ordinaryGoalProfileCardOrImageChanges':0,'activeWrites':0,'newStrictScientificClosures':0,'strictNetGain':0,'M4M6M7WholeStatusClaimed':False,'next':'Separate foreign status/nav/scope authoring from exact qualified final whole bodies, then independent scope qualification and guarded Root integration.'})
print(json.dumps({'final':final,'manifest':manifest,'externalGuards':len(guards),'ownManifestFiles':json.load(open(R/manifest['path']))['ownWholeFilesBeforeManifest'],'currentP336Cases':case_count,'actualDistinctWorks':39,'actualDistinctMarks':936},ensure_ascii=False))
