"""Serialize actual blind targeted B successor judgments; only this output is written."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json

ROOT=Path(__file__).resolve().parents[8]
OWN=Path(__file__).resolve().parent.parent
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
A2=BASE/'chemie-q3-thirteen-current402-live-context-author-20261012-v2'
A3=BASE/'chemie-q3-thirteen-current402-four-images-author-20261012-v3'
B2=BASE/'chemie-q3-thirteen-current402-independent-b-20261012-v2'
REL=OWN.relative_to(ROOT).as_posix()
RID=OWN.name
GROUP='chemie-q3-thirteen-blind-successor-b-20261012'
NOW=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads(Path(p).read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def stable(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def write(p,o):
 p=OWN/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def lines(p,rows):
 p=OWN/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in rows))
def without_resources(g):return {k:v for k,v in g.items() if k!='resourceLinks'}
def context_semantics(gs):return [without_resources(g) for g in gs]

old=read(A2/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json')
current=read(A3/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json')
tuples=current['selected13WholeTuples'];old_by={t['goalId']:t for t in old['selected13WholeTuples']}
bundle=read(OWN/'bundle/manifest.json');campaign=read(OWN/'description/description-review-campaign.json')
din=read(OWN/'description/description-review-input.json');batch=campaign['batches'][0]
old_d={r['goalId']:r for r in map(json.loads,(B2/'description/results/original-b.batch-001.records.jsonl').read_text().splitlines())}
old_p=read(B2/'positive/P13.full-scientific-decisions.original-b.json')
science={r['goalId']:r['rationale'] for r in old_p['rows']}
science[next(t['goalId'] for t in tuples if t['goalId'].startswith('56bc6377'))]='The old graphical-determination defect is resolved. I read all four actual scaled PNGs and both language versions of the complete main and fresh tasks, models and scoring. Main A tangent points (0;0.72) and (30;0.54) give -0.0060 mol/(L s); secant (0;0.80) to (20;0.60) gives -0.0100. Normalize by coefficient 2. Fresh amount slope -0.0120 mol/s divided by 2 L preserves the concentration rate. Main gas tangent (0;9) to (120;39) gives 0.25 mL/s, compared with secants 0.40 and 0.20; fresh tangent (0;2) to (50;26) gives 0.48 mL/s. Conversion by 24 L/mol and solution volume is correct. Tolerances are realistic and propagated; numbers without graphical derivation do not suffice. Provided diagrams assess evaluation, not experimental recording or graph construction.'
science[next(t['goalId'] for t in tuples if t['goalId'].startswith('b8c8f70f'))]='Retain the verified quantitative Faraday calculations and genuine efficiency/charge-number transfer. The corrected English qualitative model explicitly compares deposited Cu amount in moles with Ag amount at equal passed charge; it correctly separates mass through molar mass. The new PNG has a series ammeter and no voltmeter-current branch. The qualitative case is only a bounded HE contribution and does not authorize compulsory HE calculations.'

# Exact comparisons support retained science; no copied author decision is a B vote.
comparisons=[]
for t in tuples:
 o=old_by[t['goalId']]
 assert without_resources(t['wholeGoal'])==without_resources(o['wholeGoal'])
 assert t['normalOriginalSourcePayload']==o['normalOriginalSourcePayload']
 scopes={k:context_semantics(t[k])==context_semantics(o[k]) for k in ['actualPrerequisiteWholeGoals','actualParentWholeGoals','actualReverseRequiresWholeGoals']}
 assert all(scopes.values())
 comparisons.append({'goalId':t['goalId'],'canonicalScientificFieldsEqual':True,'allRequiresAndContainsAndApplicabilityEqual':True,'wholeSourcePayloadEqual':True,'neighbourScientificContextsEqual':scopes,'resourceBindingChanged':t['imageKeepBinding']['currentDigest']!=o['imageKeepBinding']['currentDigest'],'profileChanged':t['positiveRecord']['profile']!=o['positiveRecord']['profile'],'priorOwnDecisionRetainedAfterExplicitContextComparison':not t['goalId'].startswith('56bc6377')})
old_cases=read(A2/'positive/whole28.material-task-model-scoring-transfer.de-en.author.json')['cases']
new_cases=read(A3/'positive/whole28.material-task-model-scoring-transfer.de-en.author.json')['cases']
oc={c['caseId']:c for c in old_cases};case_comparisons=[]
for c in new_cases:
 a={k:v for k,v in oc[c['caseId']].items() if k!='wholeCurrentGoal'};b={k:v for k,v in c.items() if k!='wholeCurrentGoal'}
 case_comparisons.append({'caseId':c['caseId'],'completeScientificBodyEqual':a==b,'priorBodyDigest':sha(stable(a).encode()),'currentBodyDigest':sha(stable(b).encode()),'changedFields':[k for k in set(a)|set(b) if a.get(k)!=b.get(k)]})
assert sum(c['completeScientificBodyEqual'] for c in case_comparisons)==25
write('checks/explicit-context-and-case-comparison.original-b.json',{'goalComparisons':comparisons,'whole28CaseComparisons':case_comparisons,'whole25ScientificBodiesUnchanged':25,'all656LiteralSourceRowsRetainedFromOwnOriginalReview':True,'literalRowsPath':current['wholeSourceDutyContextPath'],'literalRowsSha256':sha((ROOT/current['wholeSourceDutyContextPath']).read_bytes()),'noHistoricalPeerJudgmentsUsed':True})

# Actual normal D round: current fingerprints; scientific judgment is retained.
drun=RID+'-D-original-successor';prun=RID+'-P-original-successor';drecords=[]
for g in din['goals']:
 r=copy.deepcopy(old_d[g['goalId']]);r.update(recordId=RID+'-D-'+g['goalId'],runId=drun,campaignId=campaign['campaignId'],roundId=campaign['roundId'],bundleFingerprint=bundle['bundleFingerprint'],bookDigest=bundle['bookModelDigest'],evidenceProfileRecommendation='none')
 r.update({k:g[k] for k in ['goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
 r['rationale']='Own sealed v2 description KEEP retained after exact whole scientific-goal and neighbouring-context comparison; new normal page/image binding independently checked. '+science[g['goalId']]
 drecords.append(r)
dp='description/results/'+batch['batchId']+'.records.jsonl';lines(dp,drecords)

def run(runid,out,criteria,role,extra=None):
 arts=[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if role!='assessment_adversarial_reviewer' or a['role']!='book_model']
 for a in arts:
  if a['role']=='review_criteria':a['digest']=criteria
 return {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'provider':'OpenAI Codex session','model':'GPT-6 session identity; exact serving model revision unavailable','role':role,'promptFamilyId':'chemie-q3-thirteen-targeted-independent-b','promptFingerprint':bundle['promptFingerprint'],'criteriaFingerprint':criteria,'generationParametersFingerprint':sha(stable({'mode':'actual blind targeted manual scientific and pixel review','samplingParameters':'unavailable'}).encode()),'independenceGroupId':GROUP,'blindToOtherRuns':True,'goalIds':[t['goalId'] for t in tuples],'inputArtifacts':arts,'startedAt':datetime.fromtimestamp((OWN/'description/description-review-campaign.json').stat().st_mtime,timezone.utc).isoformat(),'completedAt':NOW,'status':'completed','outputDigest':sha((OWN/out).read_bytes()),'toolchainVersion':'normal-repository-tools-20261012',**(extra or {})}
write('description/results/'+batch['batchId']+'.run.json',run(drun,dp,bundle['criteriaFingerprint'],'subject_reviewer',{'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':sha((OWN/'description/batches'/f"{batch['batchId']}.input.jsonl").read_bytes())}]}))
ps=[];decisions=[]
for t in tuples:
 r=copy.deepcopy(t['positiveRecord']);r.update(reviewId=RID,reviewer='codex-targeted-independent-b-original',reviewedAt=NOW,reviewRunIds=[prun],reason=science[t['goalId']],dissent=[],status='needs_human_review',reviewAuthority='ai_candidate',evidenceLevel='E1',maximumClaimScope='G1');ps.append(r)
 decisions.append({'goalId':t['goalId'],'decision':'pass_bounded_current_goal_science','rationale':science[t['goalId']],'wholeCurrentProfileReviewedOrRetainedAfterExactComparison':True,'wholeBilingualCaseBodyReview':'three changed bodies fully reread; 25 exact bodies retained from own sealed full review','caseIds':[c['caseId'] for c in t['wholeMaterialCases']],'sourceUnionApproved':False,'actualLearnerPerformance':False,'humanApproval':False})
lines('positive/P13.independent-b.review.jsonl',ps)
pc=read(A3/'positive/P13.author.inactive.config.json');pc.update(reviewId=RID,reviewPath=REL+'/positive/P13.independent-b.review.jsonl',reviewRunManifestPaths=[REL+'/positive/P13.independent-b.run.json']);write('positive/P13.independent-b.inactive.config.json',pc)
write('positive/P13.independent-b.run.json',run(prun,'positive/P13.independent-b.review.jsonl',ps[0]['reviewCriteriaFingerprint'],'assessment_adversarial_reviewer'))
write('positive/P13.targeted-scientific-decisions.original-b.json',{'rows':decisions,'pass':13,'hold':0,'E1G1Only':True,'sourceScopeAndOperatorHoldsRemainSeparate':True})

# Unchanged A/M records are exact own-original records, checked against v3.
for folder in ['atomicity','memory']:
 for name in ['three.independent-b.review.jsonl']+(['three.independent-b.cards.review.jsonl'] if folder=='memory' else []):
  dst=OWN/folder/name;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes((B2/folder/name).read_bytes())
 cfg=read(B2/folder/'three.independent-b.inactive.config.json');cfg['landscapePath']=pc['landscapePath'];cfg['reviewPath']=REL+'/'+folder+'/three.independent-b.review.jsonl'
 if folder=='memory':cfg['cardReviewPath']=REL+'/memory/three.independent-b.cards.review.jsonl'
 write(folder+'/three.independent-b.inactive.config.json',cfg)

visual_notes={
 '5a24dae0':'At native and 360/680, concentration feed, compressed gas, heated endothermic system and catalyst with both directions are visible main motifs. A+B to C+D, 2A(g) to B(g), A+B+heat to C and unchanged catalyst equilibrium are correct. Generic colored particles are illustrative, not a literal stoichiometric count. Mobile orientation defect resolved.',
 '545a2e56':'Exactly nine abstract markers before and directly after compression, three blue/four white/two green in both. Volume V to V/2 at constant T and composition gives doubled partial pressures. Delta gas coefficient is -2, so Qp,new=Qp,old/4; from equilibrium Qp<Kp drives NH3 formation. Main compression motif and essential formula remain readable at 360/680. No implication that composition doubles instantly.',
 'c0463225':'Exactly one N2 symbol (two atoms), three H2 and two NH3 symbols match the 1:3:2 coefficients. Kc exponents 2/(1,3) and positive square-root rearrangement are correct for supplied equilibrium concentrations. The diagram is orientation, not complete material-balance solving; the unchanged P quadratic task supplies that operation. Main routine legible at 360/680.',
 'b8c8f70f':'Actual PNG places A in series, positive anode and negative cathode, Ag+ + e- to Ag. Q=7200 C, n(e)=0.0746 mol, n(Ag)=0.0746 mol and m=8.05 g are correct for the ideal complete-current-efficiency example. Old voltmeter branch and false electron arrow absent. Circuit and conversion stages legible at 360/680; secondary numeric text is teaching detail.',
 'e62c6c58':'Actual retained composition now explicitly labels k as Geschwindigkeitskonstante. Plot is ln(k) against 1/T in K^-1; descending fit and m=-Ea/R, Ea=-mR are correct. Main diagram and activation-energy result legible at 360/680. This orientation plot supplies no numerical assessed slope and is correctly separate from the rate assessment graphs.'}
old_v={r['goalId']:r for r in read(B2/'visualization/V13.actual-pixels.original-b.json')['rows']};v=[]
for t in tuples:
 changed=t['goalId'][:8] in visual_notes;ib=t['imageKeepBinding'];assert sha((ROOT/ib['currentActualAssetPath']).read_bytes())==ib['currentDigest']
 r={'goalId':t['goalId'],'assetPath':ib['currentActualAssetPath'],'assetSha256':ib['currentDigest'],'decision':'keep_approved_ai_candidate','actualNewPixelsViewed':changed,'retainedOwnOriginalActualPixelReview':not changed,'finding':visual_notes.get(t['goalId'][:8],old_v[t['goalId']]['finding']),'views':['actual native PNG','actual 360 capture','actual 680 capture','normal native HTML and PDF'] if changed else old_v[t['goalId']]['views'],'currentContextCompared':True,'humanApproval':False,'humanTrial':False};v.append(r)
write('visualization/V13.targeted-actual-pixels.original-b.json',{'rows':v,'newActualNativePngsReviewed':5,'retainedExactGoodAssets':8,'pass':13,'hold':0,'nativeCurrentAffectedHtmlPages':6,'nativeCurrentAffectedPdfPages':6,'assessmentActualHtmlPages':4,'assessmentActualPdfPages':4,'clippingFindings':[],'fourByThreeRuleApplicable':False,'allOriginalAssetsPreserved':True})

# B's source decisions are local contributions. Every original broader duty survives.
reasons={
 '20f92ba0':('hold_coupled_source_component','MV explicitly requires kinetic MWG derivation. Applying K or describing dynamic equilibrium at81373 does not derive it. No exact sibling has that derivation competence.'),
 '5a24dae0':('hold_coupled_source_component','BW3.3.2(7) explicitly requires experiment investigation. d2d735 covers concentration only;91238 owns general method but lacks a reviewed specific temperature/pressure package. MV kinetic derivation also survives.'),
 '545a2e56':('hold_coupled_source_component','Optimization calculations are sound. BW historical achievements of Haber/Bosch are not supplied by current cases. Actual chromatography978a6 has the right competence, but corrected source assignment and specific evidence remain unproved; generic5a709 cannot replace it.'),
 '882630ba':('hold_coupled_source_component','BY source criticism has exact36666 ownership. BW3.3.2(9) additionally asks for Haber/Bosch achievements. Candidate9f892 has historical valuation semantics but only BY/HE applicability and no specific historical material; no BW closure is inferred.'),
 'c0463225':('eligible_bounded_current_goal','All five own current direct rows have genuine MWG/Haber-Bosch content. The extended HE Q3.1 duty is LK-only and explicitly includes unequal sums/quadratics; preserved whole q3-07-c covers balance, two roots, physical rejection and substitution. No new specific source hold for this calculation competence.'),
 'b8c8f70f':('hold_authored_scope_selection','HE Q3.3 requires Faraday laws without calculations. The clarified qualitative contribution is correct but cannot select the whole quantitative target as HE compulsory.0c9fe only links electrolysis/redox equilibrium and does not explicitly own complete qualitative Faraday laws.'),
 '96fd8608':('eligible_bounded_current_goal','BY GA/EA8.2 retains spatial redox separation atf093 and work from loaded simultaneous U/I/t at96fd. Work calculation/energy interpretation are complete and preserved. Other broad voltage, Nernst and data-acquisition rows keep separate duties at exact partners and are not declared wholly closed.'),
 '93b914d4':('hold_coupled_source_component','Electrolysis/storage efficiency is bounded sound.7dc80 genuinely owns photochemical water splitting/artificial photosynthesis; its specific full evidence remains open. TH hydrogen preparation/collection/detection needs actual method criteria.580b owns gas detection only; no actual experiment is claimed.'),
 '0908b3a2':('eligible_bounded_current_goal','Current description and cases fully explain oxygen/acid corrosion, local cells and donor-acceptor chemistry. This is the explanation contribution only. NI experiment rows005/006, SN experiment row070-07 and TH pupil experiment row118 remain open broad/operator components; supplied cases do not carry them. TH Fe2+/OH- detection has no exact detection sibling among the current listed partners;580b covers gases only.'),
 '94a62b39':('eligible_bounded_current_goal','Current cases explain passive/active protection, sacrificial coupling, defects and bounded economic/ecological judgment. Keep that complete goal contribution. NI corrosion-protection execution and SN/TH corrosion experiments remain separate unclosed broad clauses; general91238 provides a method home, not reviewed specific procedure/detection criteria.'),
 '56bc6377':('hold_coupled_source_component','Graphical-evaluation defect resolved. TH printed43/PDF48 basic investigation and increased measurement recording/graph construction remain untested; do not invent a TH hypothesis clause.536030 investigation and49b13 data documentation are genuine homes but need specific material/criteria. BY actually requires hypothesis planning and safe execution under general competencies.'),
 '3ce81f96':('hold_coupled_source_component','Current four-factor qualitative collision explanation remains good. HB original24 includes pressure and quantitative factor effects;138381 derives mechanisms from rate laws and does not determine reaction order.536030 keeps investigation responsibility, but specific planning/execution and pressure/quantitative coverage remain unproved.'),
 'e62c6c58':('hold_authored_scope_selection','RP52 Arrhenius occurs under optional deepening/interconnection. No actual authored choice is supplied. HB original24 LK requires reaction order and SN1/SN2, not Arrhenius; a4bac has exact mechanism comparison,138381 does not by wording determine order.')}
sr=[]
for t in tuples:
 decision,reason=reasons[t['goalId'][:8]]
 sr.append({'goalId':t['goalId'],'currentWholeGoalScientificContribution':'pass','sourceDecision':decision,'rationale':reason,'eligibleBoundedScientificClosure':decision=='eligible_bounded_current_goal','wholeBroadSourceUnionApproved':False,'scopeOrOperatorWorkMayBeOwnedByOtherGoals':True,'machineM7RequiresHumanLaboratorySession':False,'actualExperimentOrLearnerPerformanceClaim':False,'humanApproval':False})
write('sources/per-goal-bounded-contributions-and-remaining-holds.original-b.json',{'rows':sr,'eligibleBoundedScientificGoalIds':[r['goalId'] for r in sr if r['eligibleBoundedScientificClosure']],'remainingGoalBoundHolds':[r['goalId'] for r in sr if not r['eligibleBoundedScientificClosure']],'broaderCorrosionExperimentAndIonDetectionDutiesRemainOpen':True,'whole656SourceUnionApproved':False,'source381And497DoNotGrantClearance':True,'baselineStrict':212,'denominator':402,'strictGain':0,'activeIntegration':False})
write('sources/additional-broad-component-observations.original-b.json',{'findings':[{'component':'NI q-redox3 rows005/006','wholeSourceObligation':'Conduct corrosion and iron-ion detection experiments; conduct corrosion-protection experiments','currentPartners':['91238ba1-5c63-50c7-a4fd-9bbe492c6b61','0908b3a2-9937-57de-8bfb-35a6de54aa1f','94a62b39-d4a2-5882-99d1-6886ead07726'],'boundedExplanationAndEvaluationRetained':True,'fullOperatorEvidenceOpen':True},{'component':'TH corrosion row118, SN LK electrochemistry070-07','wholeSourceObligation':'Investigate iron corrosion and detect Fe2+ and OH-; experimentally investigate local cells/corrosion','specificOwnerProblem':'TH partners include580b gas detection, which does not detect these ions. Other ionic-model goals do not supply that procedure. SN partner list has no actual experiment-method goal. Preserve full duties for precise reconciliation.','boundedExplanationAndProtectionScienceRetained':True,'fullOperatorEvidenceOpen':True}],'notHumanTrialPrerequisite':True,'notAnAutomaticVetoOfValidBoundedGoals':True,'authorSiblingLedgerIsNotCoverageProof':True})
write('review-protocol.original-successor-b.json',{'reviewId':RID,'blindOriginalSuccessor':True,'ownSealedOriginalV2Used':True,'ownV2SealSha256':sha((B2/'ORIGINAL.judgment-seal.json').read_bytes()),'noCurrentSuccessorAOrRootJudgmentReadBeforeSeal':True,'noHistoricalPeerJudgmentsRead':True,'authorProposalsNotVotes':True,'actualFivePngNative360680Reviewed':True,'actualAffectedSixNativeHtmlPdfReviewed':True,'fourScaledMainFreshPlotsAndEightAssessmentHtmlPdfPagesReviewed':True,'changedThreeWholeBilingualCasesReviewed':True,'retained25ExactWholeScientificBodies':25,'currentD13RetainedWithNormalBindingRevalidation':True,'ownA3M3ExactRetainedAfterContextComparison':True,'wholeCurrent402Denominator':402,'baselineStrictOnly':212,'allAIRecordsCandidate':True,'E1G1Only':True,'humanApproval':False,'humanTrial':False,'actualExperimentPerformance':False,'noActiveOrGitWrites':True})
print('Targeted original B written: D13 KEEP; P13 bounded pass; V13 KEEP; A3/M3 exact retained; four bounded goals eligible; nine goal-bound source/scope holds; wider corrosion operator duties explicitly retained.')
