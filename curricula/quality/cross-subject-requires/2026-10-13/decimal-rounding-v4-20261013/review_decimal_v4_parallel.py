# SPDX-License-Identifier: Apache-2.0
"""Create exact-bound independent review metadata; no active or sealed-input writes."""
import datetime
import hashlib
import json
import math
import os
import subprocess
from fractions import Fraction
from pathlib import Path

base=Path('tmp/cross-subject-requires/decimal-rounding-v4-20261013')
outbase=Path('tmp/cross-subject-requires')
read=lambda p:json.loads(Path(p).read_text())
digest=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
binding=lambda p:{'path':str(p),'sha256':digest(Path(p).read_bytes()),'bytes':len(Path(p).read_bytes())}
canonical_sha=lambda x:digest(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
reviewer={'agentCanonicalName':'/root/requires_parallel_review','model':'GPT-6.1 Sol','reasoningEffort':'Ultra','role':'independent_scientific_candidate_reviewer','independentOfAuthor':'/root/requires_runtime_path','reviewAuthority':'ai_candidate','humanApprovalClaimed':False}
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
manifest=read(base/'sealed-author-package.index.json')
assert digest((base/'sealed-author-package.index.json').read_bytes())=='sha256:3b659b6a9c39c410ac9d4388d9d069238ee526746010792fa855ac94f6ac8e08'
for e in manifest['files']:
    actual=binding(e['path']);assert actual['sha256']==e['sha256'] and actual['bytes']==e['byteLength']
goal=read(base/'goal.author-candidate.json')['proposedGoal']
positive=read(base/'positive-profile.body.author-candidate.json')
description=read(base/'description-profile.body.author-candidate.json')
facts=read(base/'learner-facts.author-candidate.json')
teacher=read(base/'teacher-grading.author-candidate.json')
stems=read(base/'learner-prompts.author-candidate.json')
place_digits={'hundredths':2,'thousandths':3,'ten_thousandths':4}

def nearest(x,p):
    scaled=x*(10**p);lower=scaled.numerator//scaled.denominator
    remainder=scaled-lower
    return Fraction(lower+(remainder>=Fraction(1,2)),10**p)

def fixed(x,p):
    ticks=x*(10**p);assert ticks.denominator==1
    digits=str(ticks.numerator).zfill(p+1)
    return digits[:-p]+'.'+digits[-p:] if p else digits

cases=[]
rejects={k:[] for k in ['always_up','always_down','truncate','double_round_one_finer','wrong_place_one_coarser']}
for f in facts['cases']:
    x=Fraction(f['number']);p=place_digits[f['place']];q=Fraction(1,10**p)
    scaled=x/q;floor_tick=scaled.numerator//scaled.denominator
    lower=floor_tick*q;upper=lower if scaled==floor_tick else (floor_tick+1)*q
    result=nearest(x,p);tail=(x-lower)/q
    key=next(k for k in teacher['cases'] if k['id']==f['id'])
    assert result==Fraction(key['expectedRoundedValue']) and tail==Fraction(key['tailInTargetSteps'])
    assert lower==Fraction(key['lowerNeighbor']) and upper==Fraction(key['upperNeighbor'])
    assert (tail==Fraction(1,2))==key['exactTie']
    strategies={'always_up':upper,'always_down':lower,'truncate':lower,'double_round_one_finer':nearest(nearest(x,p+1),p),'wrong_place_one_coarser':nearest(x,p-1)}
    for strategy,value in strategies.items():
        assert value==Fraction(key['wrongStrategyOutputs'][strategy])
        if value!=result:rejects[strategy].append(f['id'])
    cases.append({'caseId':f['id'],'input':f['number'],'decimalPlaces':p,'exactTailFraction':str(tail),'roundedValue':fixed(result,p),'truncatedValue':fixed(lower,p),'exactTie':tail==Fraction(1,2),'independentlyComputedWith':'exact Fraction quotient/remainder, no Decimal quantize','strategyCounterexamples':{k:str(v) for k,v in strategies.items()},'teacherKeyMatches':True})
assert all(rejects.values())
assert nearest(Fraction('0'),2)==0 and nearest(Fraction('2.70'),1)==Fraction('2.7')
assert nearest(Fraction('0.095'),2)==Fraction('0.10')
probe={
 'schemaVersion':1,'status':'independent-exact-arithmetic-and-assessment-artifact-check-pass','reviewer':reviewer,'reviewedAt':now,
 'sealedPackageBinding':binding(base/'sealed-author-package.index.json'),
 'cases':cases,'rejectedNumericalStrategies':rejects,
 'independentAdditionalChecks':[{'input':'0','place':'hundredths','result':'0.00'},{'input':'2.70','place':'tenths','result':'2.7'},{'input':'0.095','place':'hundredths','result':'0.10'}],
 'actualAuthorReplays':[binding(outbase/'decimal-v4-arithmetic.parallel-independent-replay.json'),binding(outbase/'decimal-v4-stems.parallel-independent-replay.json')],
 'replayedBoundaryMeaning':'The actual renderer rejects ten extra learner fields, four numeric injections, a revealing ID and an injected place; poisoned real teacher keys change grading fields while leaving all twelve DE/EN stems unchanged. This was executed after code inspection. It proves the inert artifact join/schema boundary, not future coach or host withholding.',
 'diagnosticLimits':'Always-down and truncation are numerically identical on these nonnegative examples, but both fail the upward cases; a substantive explanation is needed to distinguish understanding. Wrong-coarser-place outputs may coincidentally equal30 or0, so equivalent representations are not falsely rejected. Every instantiated wrong strategy fails at least one appropriate case. Six cases are examples rather than a quota; none is empirical learner evidence.',
 'license':'Apache-2.0',
}
probe_path=outbase/'decimal-v4-probes.parallel-independent-review.json'
probe_path.open('x').write(json.dumps(probe,ensure_ascii=False,indent=2)+'\n')

source_reasons={
 'BB':('D decimal item on actual p40; E signed/rational item is separate. The broad extracted D-H rational summary is not exact coverage.','Level D; no single Gymnasium year is proved.'),
 'BE':('Same actual source PDF bytes as BB with a separately bound BE row; D decimal item and E rational item remain distinct. The old Berlin/Berlin label is historical noise, not the correct document title.','Level D; no single Gymnasium year is proved.'),
 'BW':('Competence18 at printed18/PDF20 rounds values and quantities contextually; supplied-place decimal operation is only a component. Adjacent competence19 on accuracy does not become mandatory precision-selection content.','Classes5/6, exact authored placement still absent in three relevant views.'),
 'BY':('M6.1.2 at p1 extends tenths/hundredths place values and rounds decimals by analogy with whole numbers. Neighboring fraction conversion does not make whole2f or whole natural-rounding a mandatory AND.','Year6.'),
 'HB':('p14 end-of-year6 standards combine natural/decimal rounding with estimation. Watermarked restriction is preserved; this atom covers only decimal rounding, not the entire standard.','By end ofyear6; binding-core-with-restriction remains qualified.'),
 'HE':('p26 chapter7.3 explicitly lists natural/decimal rounding in5/6; later rational/reals rounding and all periodic/negative scope are not claimed by this nonnegative finite core.','Band5/6; G8/G9 placement is not inferred from canonical phaseJ6.'),
 'HH':('p50 positive-decimal module7 separately lists rounding under number representation. The following arithmetic subsection is not part of that rounding item; OCR-interleaved source row is insufficient as an exact quote.','Classes5/6; positive-decimal source supports the bounded core, not signed rounding.'),
 'MV':('Printed16/PDF19 nests rounding under decimal fractions in broken numbers. Actual grade5 header at PDF17 and preceding natural-number unit at PDF18 distinguish decimal rounding from natural rounding.','Class5, not an automatic J6 promotion.'),
 'NI':('Actual printed/PDF41 names rounding/estimation separately from fraction/number-line representation and arithmetic. Historical S40 locator is not silently accepted.','Broad5-10 source and learning-area core do not determine one exact year.'),
 'NW':('p23 domain includes positive rational/finite decimals; p24 competence10 combines contextual rounding, estimate and verification. The supplied-place operation is partial coverage.','End of Erprobungsstufe in G9; exact placement remains pending.'),
 'RP':('Printed29/PDF33 requires appropriate rounding in contextual quantity calculations and links natural/fraction numbers. This supports a scalar decimal preparation component only, not the whole contextual competency or a direct prerequisite quote.','Orientierungsstufe; historical S32 locator is superseded only by this explicit sidecar.'),
 'SH':('p28 separates natural-number rounding from rational/decimal rounding; the decimal column includes terminating/recurring representations and place table. Only the nonnegative terminating component is covered.','Broad SekI5-10 label does not certify exactJ6.'),
 'SL':('p41 separately lists decimal rounding and applying known rounding rules, with place values nearby; fraction conversion, periodic notation and broader arithmetic remain separate.','Classes5/6, G9 source role retained.'),
 'SN':('Printed8/PDF20 includes estimating/rounding in common-fraction/decimal foundations. Preceding PDF19 independently confirms Klassenstufe5. Natural rounding and broader decimal arithmetic are neighboring content.','Class5, not a phaseJ6 source claim.'),
 'ST':('Printed28/PDF30 explicitly lists rounding decimals and extended place values as distinguishable operations; PDF28 confirms Schuljahrgaenge5/6. Broader fraction arithmetic is not required by this partial atom.','Band5/6; original source CC BY-SA3.0 footer retains third-party rights.'),
 'TH':('p13 class6 broken-number unit explicitly rounds decimals to specified places. Fraction/periodic conversions and contextual operations around it are outside this finite nonnegative component.','Class6; retained grade5-6/11-12-from2025-26 document role is not changed because of its Entwurfsfassung filename.'),
}
sources=[];env=dict(os.environ);env['LD_LIBRARY_PATH']=str(Path('tmp/ci-tools/poppler-root/usr/lib/x86_64-linux-gnu').resolve());tool=Path('tmp/ci-tools/poppler-root/usr/bin/pdftotext')
for cp in sorted((base/'retained-context/source-context-v3').glob('*.json')):
    c=read(cp);e=read(c['sourceExtractionBinding']['path'])
    assert binding(c['sourcePdfBinding']['path'])['sha256']==c['sourcePdfBinding']['sha256']
    assert binding(c['sourceExtractionBinding']['path'])['sha256']==c['sourceExtractionBinding']['sha256']
    row=next(g for g in e['sourceGoals'] if g['id']==c['sourceRowId'])
    passage=next(p for p in e['passages'] if p['id']==row['passageId'])
    assert canonical_sha(row)==c['exactSourceRowSha256'] and canonical_sha(passage)==c['exactSourcePassageSha256']
    page_checks=[]
    for pg in c['actualPageReads']:
        n=pg['physicalPdfPageOneBased'];text=subprocess.check_output([str(tool),'-layout','-f',str(n),'-l',str(n),c['sourcePdfBinding']['path'],'-'],env=env)
        assert digest(text)==pg['actualLayoutTextSha256']
        page_checks.append({'physicalPdfPageOneBased':n,'actualLayoutTextSha256':digest(text),'fullRelevantPageActuallyRead':True})
    state=c['jurisdiction'][3:];reason,grade=source_reasons[state]
    sources.append({'jurisdiction':c['jurisdiction'],'scientificPartialCoreGate':'PASS','nativeMappingAndExactPlacement':'pending','contextBinding':binding(cp),'pdfBinding':binding(c['sourcePdfBinding']['path']),'extractionBinding':binding(c['sourceExtractionBinding']['path']),'sourceRowId':row['id'],'sourceRowSha256':canonical_sha(row),'sourcePassageSha256':canonical_sha(passage),'actualPageReads':page_checks,'correctedLocator':c['correctedAuthorLocator'],'documentRoleRetained':c['sourceRoleUnchanged'],'independentPartialCoreReasoning':reason,'gradeBoundary':grade,'fullSourceCoverageClaimed':False,'universalTieRuleSourceQuoteClaimed':False,'prerequisiteEdgeSourceQuoteClaimed':False})
assert len(sources)==16 and sum(len(s['actualPageReads']) for s in sources)==19

# Read/bind actual central-owner P files, including the two extra foundations
# not contained in the author's compact two-profile retained context.
central_path=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
central=read(central_path);subject=next(s for s in central['subjects'] if s['subject']=='mathematik')
landscape=read(subject['landscapePath']);goals={g['id']:g for g in landscape['goals']}
ids=['fe07241a-b779-5f35-a82d-7aa51ae74f42','2f565855-bcd6-4da5-bc80-4b72a2d93d50','624764d6-becd-5f9b-ada3-0d4f9d143073','4eeab7d5-eeb3-579b-845e-1c52ffe9e89f']
math_reads=[]
for gid in ids:
    owners=[]
    for cfgpath in subject['positiveEvidenceConfigPaths']:
        cfg=read(cfgpath)
        if gid in cfg.get('scope',{}).get('goalIds',[]):owners.append((cfgpath,cfg))
    assert len(owners)==1
    cfgpath,cfg=owners[0];record=next(json.loads(line) for line in Path(cfg['reviewPath']).read_text().splitlines() if json.loads(line)['goalId']==gid)
    math_reads.append({'goalId':gid,'wholeCurrentGoalSha256PythonCanonicalJson':canonical_sha(goals[gid]),'centralOwnerConfigBinding':binding(cfgpath),'currentReviewFileBinding':binding(cfg['reviewPath']),'fullCurrentNativePBodySha256PythonCanonicalJson':canonical_sha(record['profile']),'completeGoalAndAllBilingualProfileFieldsActuallyRead':True,'existingNativeApprovalReaccepted':False})
read_receipt={
 'schemaVersion':1,'status':'actual-independent-read-and-exact-source-profile-bindings','reviewer':reviewer,'reviewedAt':now,
 'sealedPackageBinding':binding(base/'sealed-author-package.index.json'),
 'fullGoalAndProfileInputs':[binding(base/n) for n in ['goal.author-candidate.json','positive-profile.body.author-candidate.json','positive-evidence.author-candidate.jsonl','description-profile.body.author-candidate.json','description-evidence.author-candidate.jsonl','learner-facts.author-candidate.json','learner-prompts.author-candidate.json','teacher-grading.author-candidate.json','presentation-audience.contract.json','assessment-probes.author-candidate.json']],
 'sourceContextsAndSelectedRowsRead':16,'sourcePdfPageOccurrenceReads':19,'sourceJudgments':sources,
 'additionalActualGradeHeaderReads':[{'jurisdiction':'DE-SN','physicalPdfPageOneBased':19,'finding':'Actual Klassenstufe5 header read.'},{'jurisdiction':'DE-ST','physicalPdfPageOneBased':28,'finding':'Actual Schuljahrgaenge5/6 header read; surrounding PDF26/27/29 headers inspected.'}],
 'sourceExtractionTool':binding(tool),'fullThirdPartyPdfTextExported':False,
 'wholeExistingMathGoalAndFullBilingualPRead':math_reads,'orientationGoalRead':{'goalId':'65365dce-f33f-49d8-9516-42f75883aa86','wholeCurrentGoalSha256PythonCanonicalJson':canonical_sha(goals['65365dce-f33f-49d8-9516-42f75883aa86']),'mathCertificationClaimed':False},
 'priorIndependentReceiptBindings':[binding(Path(f'tmp/cross-subject-requires/decimal-rounding-{v}-20261013')/n) for v in ['v2','v3'] for n in ['index.independent-review-v1.json','independent-scientific-review-v1.json']],
 'priorReceiptReadExtent':'Full prior index/overall judgments, individual gate rationales, prerequisite judgments, constraints, cue findings and case/source meanings examined. Fresh V4 source rows/pages and actual bodies reviewed independently; no prior approval transferred.',
 'currentCentralOwnerRegistryBinding':binding(central_path),
 'licensing':{'technicalReadAndBindingMetadata':'Apache-2.0','ownScientificParaphrases':'CC-BY-4.0','attribution':'SkillPilot contributors','thirdPartySourcesAndPdfExtracts':'Original rights retained; page text was read, not exported or relicensed.'},
}
read_path=outbase/'decimal-v4-actual-read.parallel-independent-review.json'
read_path.open('x').write(json.dumps(read_receipt,ensure_ascii=False,indent=2)+'\n')

case_reasoning=[
 'Unmarked7.386 forces independent identification of8 hundredths and6 thousandths; six of ten smaller parts places the tail above half. Own7.39 versus7.38 exposes truncation/always-down, while explaining the ten-to-one grid remains necessary.',
 'Unmarked0.00327 requires the leading zero placeholders,3 thousandths,2 ten-thousandths and7 hundred-thousandths to be assigned correctly. The7/10-step remainder independently selects0.0033. Wrong coarse place0.003 fails.',
 'Unmarked29.995 does not announce an exact tie or carry. The learner identifies5/10 of a hundredth and performs all carries to30.00 under the common rule. 30 is equally valid with demonstrated requested-place meaning; no measurement precision claim follows.',
 'Unmarked4.7328 gives neither lower direction nor a named deciding digit. The tail28/100 of the target step remains below half despite later8; own4.73 refutes always-up/last-digit reasoning. Equal truncation here cannot certify general equivalence.',
 'Unmarked0.00031 does not provide0.000 or classify a zero-output case. Own zero follows from31/100 of a thousandth-step, with zero placeholders explained. A positive input may round to zero;0 and0.000 are value-equivalent.',
 'Unmarked1.2449 does not classify double rounding. Own direct1.24 follows from49/100 of the target step; first rounding to1.245 creates an artificial half and then1.25, so the separately computed counterstrategy fails. Explanation must use the original value.',
]
gates=[
 ('exact_sealed_package_and_current_inputs','PASS','57 sealed author files are hash/byte-bound; original index and post-seal validation retain exact bytes. The independent route peer rechecked110historical files and212current inputs and replayed all157views. Native row schema/fingerprint validation is technical shape evidence only.'),
 ('bounded_goal_domain_rule_and_bilingual_meaning','PASS','Given place, nonnegative terminating decimals and common nearest/larger-positive-tie convention agree in DE/EN. Supplied convention defines the operation without giving the case decision. Precision selection, significant-figure policy, signed/periodic transfer, independent fraction conversion/decimal subtraction are excluded.'),
 ('intrinsic_foundation_and_whole_atom_minimality','PASS','Real foundations remain: independently identify places/zero holders, explain adjacent ten-to-one units, choose the nearest grid value and carry/regroup. They are taught within the operation and must be shown independently. Whole2f adds equivalent/reduced fractions and independent scaled-line construction; natural-round adds context precision/input-range recovery;624adds another numeral system;4eeadds mixed rational representations and estimation advantages. None is universally necessary before this supported bounded operation. Orientation653 is a completion entry convention, not mathematics mastery.'),
 ('all_six_actual_initial_stems_are_uncued','PASS','All twelve literal DE/EN stems contain only their original number, supplied place, the same general nearest/tie rule and a neutral justification request. No direction/result/deciding-digit/half-case label/filled table is supplied; opaque ordinal IDs are not in the task sentences. The neutral post-answer truncation request is shared and supplies no result. V3 rejection remains valid for its older cued inputs.'),
 ('exact_arithmetic_and_five_bad_strategy_diagnostics','PASS','Independent rational-grid computation confirms all six values and teacher explanations. Always-up fails cases4/5/6; always-down and truncation fail1/2/3; double-round fails6; wrong-coarser-place fails1/2/4/6. Correct numbers alone do not establish all semantic aspects; coincidentally equivalent0/30representations are accepted with justified place meaning.'),
 ('teacher_boundary_inert_artifact_renderer','PASS','Executed schema/renderer tests reject ten leaked fields, four numeric injections, injected revealing ID/place, and malicious teacher task text. Changing actual teacher answer/diagnostic fields changes grading fields but leaves learner stems exact. Contract marks full D, P expectations/axes, answers and diagnostic fields teacher-only.'),
 ('future_teacher_boundary_and_actual_learner_exposure','pending','These artifact tests cannot prove a future coach will withhold full P/D context, nor prove unseen learner history. Actual final delivery context and host behavior require separate verification; instructional2.483and teacher-key exposure cannot become independent learner evidence.'),
 ('source16_partial_core_corrected_locators_and_retained_roles','PASS','All16exact source contexts and selected actual extraction rows/passages were checked, with19actual relevant PDF-page occurrence reads. Pages support a partial scalar decimal-rounding core, with correct early-D BB/BE and HH non-arithmetic anchors, NIprinted41/RPprinted29, source-specific grade bands and qualified HB/TH roles. No universal tie-rule quote or whole-source/exactJ6coverage is asserted.'),
 ('native_source_mapping_and_exact_stage_year_course_target_placement','pending','Sidecars do not activate source mappings or placements. BB/BE D does not give one year; MV/SNclass5,BY/THclass6,and broader5/6or5-10bands cannot all becomeJ6. Independent technical replay finds23lower/CrossStage placements missing inBW/BY/HE/RP/SH. All16exact accepted source/year/stage/course placements remain pending.'),
 ('P_and_D_bounded_content_and_assessment_design','PASS','Full P requires independent place/zero/ten-to-one explanation, nearest choice both ways, own half recognition/carry, zero-output and truncation contrast. Full D facets/non-evidence/misconceptions agree with that scope. Teacher explanations are mathematically sound. Six examples are diagnostic coverage, not six compulsory tasks; sufficient all-aspect multi-step transfer may occur in fewer integrated tasks. This is a raw content judgment, not actual native P or dual-D/synthesis.'),
 ('atomicity_kind_and_memory_semantic_suitability','PASS','Place identification, nearest choice, carrying and truncation contrast form the execution/meaning of one assessable rounding operation. Narrow taught foundations do not bundle full fraction/line/context-precision goals. CurricularAtomic and no separate universal-rule recall deck are scientifically suitable candidates; actual A/M/kind records remain pending.'),
 ('conditional_route_reports_and_effective_requirements','PASS','Independent peer replay confirms88Math/69Physics report bindings and no Physics target/tree changes under64conditional support entries. Candidate effective direct+contains requirements remain only orientation653, and REP remains unmastered/unpromoted. Both proposed Physics requires edges are absent from the simulation, so unchanged trees do not prove their future frontier behavior.'),
 ('reachable_authored_learning_routes_and_physics_edges','pending','Only31hypothetical Math target placements are inherited;23explicit lower/CrossStage placements are still required. PrerequisiteOnly lookup never makes the candidate learnable as a target. No new Physics f6/b615edge or universal signed/precision competency is approved; actual learner preparation and scope transitions require reviewed authored routes.'),
 ('all_actual_native_D_P_A_M_kind_V_M7_package_and_activation','pending','Author D/P rows are needs_human_review/ai_candidate with empty runIds; all actual native reviews, dual-D rounds/synthesis, P, A/M/kind, real imageV, source/placement/package checks and strict futureMath808plus current807preservation remain pending. No image, active goal/view/QA/source/runtime/learner edit, deployment or publication is created.'),
]
review={
 'schemaVersion':1,'status':'fresh_v4_scientific_source_core_and_uncued_P_D_design_pass_adoption_routes_and_native_gates_pending',
 'reviewer':reviewer,'reviewedAt':now,'goalId':goal['id'],'sealedAuthorPackageBinding':binding(base/'sealed-author-package.index.json'),
 'goalAuthorArtifactBinding':binding(base/'goal.author-candidate.json'),'positiveBodyBinding':binding(base/'positive-profile.body.author-candidate.json'),'descriptionBodyBinding':binding(base/'description-profile.body.author-candidate.json'),
 'learnerFactsBinding':binding(base/'learner-facts.author-candidate.json'),'learnerPromptsBinding':binding(base/'learner-prompts.author-candidate.json'),'teacherGradingBinding':binding(base/'teacher-grading.author-candidate.json'),
 'overallGate':'pending','scientificContentAndPartialSourceCoreGate':'PASS','actualUncuedAssessmentArtifactDesignGate':'PASS',
 'gates':[{'gate':name,'status':status,'rationale':reason,'nativeApproval':False} for name,status,reason in gates],
 'caseReviews':[{**c,'independentScientificJudgment':'PASS','rationale':reason,'actualLearnerEvidenceClaimed':False} for c,reason in zip(cases,case_reasoning)],
 'sourceJudgments':sources,
 'actualReadReceipt':binding(read_path),'meaningfulProbeReceipt':binding(probe_path),
 'independentTechnicalRoutePeer':binding(outbase/'decimal-v4-route.parallel-independent-review.json'),
 'sourceAndPrerequisiteEvidenceKind':'Own didactic sequencing/partial content support, not direct official universal AND-edge quotes.',
 'remainingBlockers':['Native independently accepted partial mappings and source-accurate stage/year/course placements in all16contexts, including23explicit lower/CrossStage routes.','Actual final-context native dualD+synthesis/P/A/M/kind and realV, plus strict futureMath808/current807preservation and graph/package checks.','Reviewed reachable target preparation routes; no target promotion from prerequisiteOnly or automatic learner Level2/focus change.','Actual teacher-field withholding/fresh learner exposure and any eventual Physics-edge/frontier application; inert artifact tests do not prove host behavior.'],
 'historyBoundary':'All prior v2 whole2f-edge rejection and v3 cued-prompt rejection/pending receipts retain their exact inputs and bytes. V4 is a fresh independently reviewed candidate. This reviewer did not author its goal/profile/source revisions.',
 'activationApproved':False,'nativeM7ApprovalClaimed':False,'humanApprovalClaimed':False,'nativeQualityApprovalsCreated':0,'newPhysicsRequiresEdgesApproved':[],
 'activeSourceQualityViewRuntimeOrLearnerStateChanged':False,
 'licensing':{'ownSubstantiveReview':'CC-BY-4.0','technicalReadReplayAndPreservationMetadata':'Apache-2.0','attribution':'SkillPilot contributors','thirdPartyOfficialSourcesAndPdfExtracts':'Original rights retained. No blanket mixed-package grant, source relicensing or inferred redistribution clearance.'},
}
review_path=outbase/'decimal-v4-science.parallel-independent-review.json'
review_path.open('x').write(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'scientificReview':binding(review_path),'actualReadReceipt':binding(read_path),'probeReceipt':binding(probe_path),'overallGate':review['overallGate'],'scientificGate':review['scientificContentAndPartialSourceCoreGate'],'uncuedDesignGate':review['actualUncuedAssessmentArtifactDesignGate']},indent=2))
