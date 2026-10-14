# SPDX-License-Identifier: Apache-2.0
"""Materialize the independent reviewer's individually reasoned scientific findings.

This creates scratch review inputs only. It neither authors goal revisions nor
updates any canonical or native-quality record. Repo fingerprint binding is
finalized by verify_physics_pending5_v3_parallel.ts.
"""
import datetime
import hashlib
import json
import math
from pathlib import Path

prefix = Path('tmp/cross-subject-requires/physics-pending5-revision-author-20261013-v3')
path = lambda suffix: Path(str(prefix) + '.' + suffix)
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
packet = json.loads(path('proposal-candidate.json').read_text())
context = json.loads(path('context.exact.json').read_text())
amendments = json.loads(path('profile-amendments.candidate.json').read_text())
reviewer = 'Codex GPT-6.1 Sol Ultra / independent scientific reviewer /root/requires_parallel_review'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

# Replay the author's actual eleven checks without executing its report write.
test_script = Path('tmp/cross-subject-requires/test_revision_author_pending5_v3.py')
namespace = {'__name__': '__independent_replay__'}
exec(compile(test_script.read_text().split('\nreport = {', 1)[0], str(test_script), 'exec'), namespace)
author_report = json.loads(path('constructive-tests.json').read_text())
assert namespace['checks'] == author_report['checks']
assert len(namespace['checks']) == 11

# Independently calculate the varying-force integrals: the author's check
# stores the correct analytic results as constants, rather than deriving them.
first_primitive = lambda t: t*t
second_primitive = lambda t: t*t - 4*t
first = first_primitive(1) - first_primitive(0)
second = second_primitive(2) - second_primitive(1)
assert (first, second, first+second) == (1, -1, 0)

# A concrete counterexample to the new P's unqualified generic evaluation rule.
actual_constant_integral = 1.0  # integral of f(x)=1 on [1,2]
stated_log_difference = math.log(2.0) - math.log(1.0)
assert not math.isclose(actual_constant_integral, stated_log_difference)

constructive = {
    'schemaVersion': 1,
    'status': 'independent_constructive_replay_with_generic_rule_counterexample',
    'reviewer': reviewer, 'completedAt': now,
    'replayedAuthorScript': {'path': str(test_script), 'sha256': sha(test_script)},
    'boundAuthorReport': {'path': str(path('constructive-tests.json')), 'sha256': sha(path('constructive-tests.json'))},
    'replayedActualChecks': namespace['checks'], 'replayedCheckCount': 11,
    'independentAdditionalChecks': [
        {'name': 'analytic-arbitrary-history-accumulation', 'passed': True,
         'forceHistory': '2t on [0,1], -2(2-t) on [1,2]',
         'primitives': ['t^2', 't^2-4t'], 'subintervalAccumulations': [first, second],
         'wholeAccumulation': first+second,
         'scientificFinding': 'Endpoint equality coexists with nonzero intermediate change. The force history is piecewise nonconstant and discontinuous at t=1; continuity was inaccurately asserted in the author script comment, but piecewise integrability suffices for the candidate suitable-history route.'},
        {'name': 'generic-primitive-association-counterexample', 'passed': True,
         'integrand': 'f(x)=1', 'interval': [1,2], 'correctIntegral': actual_constant_integral,
         'logPrimitiveDifference': stated_log_difference,
         'scientificFinding': 'F=ln(x/x0) is a primitive of 1/x. It does not evaluate arbitrary f without the condition F\u2032=f; both exact bilingual case aids omit this condition.'},
    ],
    'limits': 'Synthetic mathematical checks only; no actual free-fall acquisition, learner achievement, complete native D/P/A/M/V review or family completion. The two coverage-ID assertions check presence only. The reciprocal gas/solid checks do not test the missing general primitive condition.',
    'license': 'Apache-2.0',
}
out = path('parallel-independent-constructive-checks.json')
out.open('x').write(json.dumps(constructive, ensure_ascii=False, indent=2)+'\n')

findings = {
 8: {
  'decision': 'pending',
  'rationale': 'The exact new bilingual P repairs the source mismatch: actual supervised acquisition, independently extracted calibrated raw observations, uncertainty and a post-determination literature comparison are now compulsory, not an OR alternative to ready-made data. It still requires own graphical determination of g and a law with initial conditions. However, this is an unresolved granularity_gap: retaining c65 only preserves the old graph technically. Full current c65 assesses evaluating given function terms and interpreting input/output, not experimental acquisition, graphical rate/model inference or uncertainty. A v-t straight-line route does not prove that the complete linear-function, rational-arithmetic, variable-term or function-evaluation atoms are universally needed beforehand. No complete universal Math set or no-Math route has been substantiated. The synthetic finite-difference check is correct but cannot satisfy acquisition or resolve that sequencing gap.',
  'sourceClauseWitness': 'HE E.1 bullet9 he-phys-sekii-e-1-b09-a01-74f473d9, actual official PDF page30: acquisition, graphical representation, determination of g, deviation from literature and mathematical model/time-position law. BW3.3.5.1(3) bw-phys-seki-3-3-5-1-b03-a01-bc80009b: experimentally record and interpret motion diagrams. The new P preserves these obligations.',
  'profileDisposition': 'source-breadth-repair-substantively-supported-requires-set-unresolved',
  'mathReadIds': ['c65ecabf-d00b-4e2d-99ae-b64692325ffb','af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186','4eeab7d5-eeb3-579b-845e-1c52ffe9e89f','ee48e811-4c9c-5080-9836-8403fc9f0810','f08d06dc-139d-5fd2-892c-8cc919b1e4fc','a6469c01-6ca3-5eb2-a82c-94f3d0560b32'],
  'remainingBlockers': ['Complete minimal universal prior Math set remains unresolved; baseline c65 is not independently endorsed.', 'Candidate native D/P/A/M/V and real acquisition evidence remain separate future gates.'],
 },
 10: {
  'decision': 'pending',
  'rationale': 'The author now withholds both signed work values and the net balance. The learner must calculate +30 J, -10 J and +20 J from supplied longitudinal force magnitudes and 2.5 m, and independently assign signs and compute +6.75-2.25=+4.50 J in the spring case. This preserves the mandatory elementary calculations in BY Ph9.1.3. Providing geometric force components and unsigned area magnitudes removes optional trigonometric and area-finding methods without providing the physical signs, balance or choice of system. The point-mass sled qualifier and enlarged sled/surface system make the thermal-energy reasoning coherent. But the author explicitly leaves granularity_gap: own decimal products and signed subtraction are required, and no minimal complete Math prior set or expressly supported route avoiding those prior competencies has been proved. Full rational-arithmetic atoms include mixed fractions/decimals, representation choice and operation/estimation transfer; broader relevance alone cannot make all of them hard AND prerequisites.',
  'sourceClauseWitness': 'BY Ph9.1.3 c1facc77-5590-5495-9257-48ff27195dd7 explicitly combines work/energy interpretation with simple calculations; Ph9.1.4 46a5bb03-8eb6-5b71-a3c4-a66fc173e314 distinguishes force, energy, work and power. The new P retains own calculations and physical distinctions. Ph9.3.7 on heat is related context, not direct proof of a required Math atom.',
  'profileDisposition': 'source-breadth-repair-substantively-supported-requires-set-unresolved',
  'mathReadIds': ['4eeab7d5-eeb3-579b-845e-1c52ffe9e89f','ee48e811-4c9c-5080-9836-8403fc9f0810','f08d06dc-139d-5fd2-892c-8cc919b1e4fc','a6469c01-6ca3-5eb2-a82c-94f3d0560b32','2afba4a2-287d-5e8f-aeee-a3bcf8652236'],
  'remainingBlockers': ['Minimal complete prior Math set for required elementary products and signed net sums remains unresolved.', 'Native evidence gates remain future work.'],
 },
 25: {
  'decision': 'approved',
  'rationale': 'The new mandatory case requires a genuine non-collinear 2D collision inference: outgoing arrows (2,1) and (2,-1) are not parallel. Their resultant is withheld; using the supplied general head-to-tail drawing rule, the learner constructs a four-cell eastward total and compares it with the independently constructed initial total. With the 1 kg m/s-per-cell calibration this is also an own quantitative momentum balance, so supplying individual component momenta does not suppress BW3.3.5.3(6). The learner still chooses the system, relates the result to absent external impulse, distinguishes single-body from total conservation, reconciles 8 J to 5 J kinetic-energy decrease with internal energy, and reasons about a northward external impulse. Qualitative unequal-mass recoil and nonzero initial drift remain. Full c63 requires both plane/space component addition and subtraction with geometric interpretation; it is broader than this expressly supported planar construction. Full rational-number representation/estimation or numerical velocity-ratio computation are not universal prior competencies for the retained goal. Approval attaches only to this exact profile support and complete empty foreign set; it grants no Math mastery and is not native M7 acceptance.',
  'sourceClauseWitness': 'BY Ph10.2.1 713ad139-bcb8-5a71-a520-3f194a0f8754 requires inference from 2D motion and distinction from energy conservation; the new mandatory puck case supplies that breadth. BW3.3.5.3(6) bw-phys-seki-3-3-5-3-b06-a01-6ea47dbb requires quantitative momentum balance with suitable states, retained through own scaled resultant construction. HE E.2 bullets9/12 cover momentum conservation/recoil without prescribing the whole c63 atom.',
  'profileDisposition': 'substantively-suitable-exact-candidate-pending-native-gates',
  'mathReadIds': ['c63bbffd-8d1c-5fe2-a428-db194e6fe592','4eeab7d5-eeb3-579b-845e-1c52ffe9e89f','a6469c01-6ca3-5eb2-a82c-94f3d0560b32'],
  'remainingBlockers': ['No scientific requires blocker for this exact supported candidate; native D/P/A/M/V and authorized adoption remain separate.'],
 },
 32: {
  'decision': 'approved',
  'rationale': 'The exact new P supplies differentiation of a finite sum/constant factor, instantaneous-rate meaning, opposite-component cancellation, and the general signed-accumulation theorem. It separately teaches the definitions p_i=m_i v_i and J_ext=A[F_ext]. It does not give dP/dt=F_ext or DeltaP=J_ext as task aids. The learner must apply Newton II to each fixed-mass body, choose the total sum, classify forces relative to the chosen material boundary, invoke Newton III to cancel simultaneous internal pairs, and only then obtain the general total-rate and arbitrary suitable-history interval balance. Repeating for one cart changes the collision force to external, preserving authentic proof transfer. The separate pulse case leaves the first nonzero change versus zero final change independent and explicitly rejects zero rate at one instant as a constancy proof. Constant momentum throughout requires zero net external force throughout the differentiable process. The provided generic support covers plane/space components without requiring full c63 or b1 tangent-context mastery, and does not presume separate Kraftstoss mastery. Full IntegralDef additionally demands upper/lower-sum limit interpretation, which neither the zero-rate proof nor this supplied general accumulation route universally needs. This resolves the original minimality erratum on fresh exact inputs; historical approvals/erratum remain attached to older inputs.',
  'sourceClauseWitness': 'Own retained HE legacy goal0c7a1a3d-ca41-4795-8b60-0ba555e1b804 requires deriving momentum conservation from Newton and discussing validity. Current canonical f524 description adds materially closed/inertial/external-impulse precision. Actual official HE PDF page30 E.2 covers Newton axioms, inertial frame and momentum conservation; it is contextual support, not a verbatim all16-jurisdiction mandate for this enriched proof or any Math edge.',
  'profileDisposition': 'substantively-suitable-exact-candidate-pending-native-gates',
  'mathReadIds': ['c63bbffd-8d1c-5fe2-a428-db194e6fe592','b1dcc191-d046-50de-984a-ee5c17157628','3862890e-9ea9-4c62-bcf2-e354c9d8f306','2afba4a2-287d-5e8f-aeee-a3bcf8652236','4eeab7d5-eeb3-579b-845e-1c52ffe9e89f'],
  'remainingBlockers': ['No scientific requires blocker for this exact supported candidate; native D/P/A/M/V and authorized adoption remain separate.'],
 },
 69: {
  'decision': 'pending',
  'rationale': 'The physical source/goal repair is sufficient: ideal-gas pV=nRT, U(T), first law and reversible volume work are explicit model facts, while selection of an isothermal reversible replacement path, dU=0, deltaQ_rev=p dV, integration variable/bounds and nR ln2 remain own physical reasoning. The solid case likewise retains own reservoir-sequence construction, deltaQ_rev=C dT, variable-temperature quotient and C ln(T2/T1), with no final entropy formula supplied. Symbolic calculation preserves the goal without requiring arbitrary numerical expression evaluation. Nevertheless this exact new bilingual support states F(x)=ln(x/x0) is a primitive of 1/x and then gives integral_a^b f(x)dx=F(b)-F(a) without the condition Fprime=f. Taken as the claimed general evaluation rule it is false: f=1 on [1,2] integrates to1, whereas this F gives ln2. The eleven author checks only use reciprocal logarithmic routes and therefore cannot establish the missing association for general f. Hold the exact no_cross_subject_required decision pending an additive author revision that explicitly states Fprime=f, or explicitly limits this rule to 1/x with constant factors. Do not rebind or silently correct the current candidate. This is a support-correctness blocker, not evidence that all of IntegralDef, integral-area/stock, mixed rational arithmetic, variable-term reading or numerical substitution must be hard AND prerequisites.',
  'sourceClauseWitness': 'Own retained HE legacy goal3ab3f788-deaa-4140-8fe0-eb30f39eb563 and unchanged canonical e713 require using dS=deltaQ_rev/T and justifying a reversible replacement path by state-function independence. These are own enriched goal texts, not official verbatim certification across all16 jurisdictions. Their required physical reasoning is preserved; the pending issue is the exact new mathematical aid.',
  'profileDisposition': 'physical-reasoning-preserved-mathematical-aid-condition-needs-additive-correction',
  'mathReadIds': ['3862890e-9ea9-4c62-bcf2-e354c9d8f306','2afba4a2-287d-5e8f-aeee-a3bcf8652236','ee48e811-4c9c-5080-9836-8403fc9f0810','f08d06dc-139d-5fd2-892c-8cc919b1e4fc','a6469c01-6ca3-5eb2-a82c-94f3d0560b32'],
  'remainingBlockers': ['Explicitly associate each integrand f with a primitive F satisfying Fprime=f, or limit the given evaluation rule to the reciprocal integrand; publish a fresh additive author binding.', 'Native evidence gates remain future work.'],
 },
}

review = {
 'schemaVersion': 1, 'status': 'independent_ai_substantive_exact_v3_candidate_review_only',
 'authorLedgerSha256': sha(path('proposal-candidate.json')),
 'inventorySha256': packet['baselineInventorySha256'],
 'candidatePacketPath': str(path('proposal-candidate.json')),
 'authorManifest': {'path':str(path('manifest.json')), 'sha256':sha(path('manifest.json'))},
 'reviewer':reviewer, 'reviewedAt':now,
 'sourceContextPath':str(path('context.exact.json')), 'sourceContextSha256':sha(path('context.exact.json')),
 'profileAmendmentsPath':str(path('profile-amendments.candidate.json')), 'profileAmendmentsSha256':sha(path('profile-amendments.candidate.json')),
 'methodology':'Full current bilingual Physics meanings and all old/new DE/EN P expectations, coverage, axes and cases actually read. Ten full current Math goals and their native DE/EN P bodies read and used as complete atoms, not title matches. Relevant HE/BY/BW source extraction clauses and actual HE official PDF page30 independently read; mapping noise is not proof. Own legacy goal texts for enriched Newton/Clausius are explicitly distinguished from official clauses. All eleven actual constructive checks replayed without mutating their sealed report, plus independently derived force accumulations and a generic primitive-rule counterexample. Provided mathematical facts may remove universal prior whole-atom necessity only when own physics and source-required quantitative/experimental breadth remain. No requires-transitive mastery, target promotion, human approval or native M7 adoption asserted. Review judges exact supported candidate sequencing, not every jurisdiction\u2019s full curriculum coverage.',
 'counts':{'approved':2,'pending':3,'rejected':0},
 'nativeM7AdoptionClaimed':False, 'activeEditsMade':False,
 'constructiveChecksPath':str(path('parallel-independent-constructive-checks.json')),
 'constructiveChecksSha256':sha(path('parallel-independent-constructive-checks.json')),
 'licensing':{'ownSubstantiveReview':'CC-BY-4.0','technicalChecksAndMetadata':'Apache-2.0','attribution':'SkillPilot contributors','thirdPartySources':'Original rights retained; no blanket package grant or redistribution clearance inferred.'},
 'decisions':[],
 'fullCurrentMathRead': [{'goalId':k,'goalSha256':v['goalSha256'],'nativeReviewPath':v['reviewPath'],'nativeReviewFileSha256':v['reviewFileSha256'],'profileBodySha256':v['profileBodySha256'],'readExtent':'whole goal plus all bilingual expectations/coverage/axes/application cases'} for k,v in context['mathematicsFullDescriptionsAndActualCurrentNativePRead'].items()],
}
for d in packet['decisions']:
 f=findings[d['sourceIndex']]
 c=next(x for x in context['records'] if x['goalId']==d['dependentGoalId'])
 a=next(x for x in amendments['amendments'] if x['goalId']==d['dependentGoalId'])
 review['decisions'].append({
  'decisionId':d['decisionId'],'dependentGoalId':d['dependentGoalId'], 'sourceBatch':d['sourceBatch'],'sourceIndex':d['sourceIndex'],
  'authorAction':d['decision'],'decision':f['decision'],'reviewer':reviewer,'reviewInput':d['reviewInput'],
  'proposalBindingSha256':'PENDING_REPOSITORY_FINGERPRINT',
  'rationale':f['rationale'],'sourceClauseWitness':f['sourceClauseWitness'],
  'currentGoalSha256':c['currentCanonicalGoalSha256'],
  'oldNativeProfileReviewPath':c['actualNativePReviewPath'],
  'oldNativeProfileBodySha256':c['actualNativePBodySha256'],
  'proposedProfileBodySha256':a['proposedProfileBodySha256'],
  'fullBilingualProfileRead':True,
  'expectationIdsRead':[e['id'] for e in a['proposedProfile']['expectations']],
  'caseIdsRead':[e['id'] for e in a['proposedProfile']['applicationCaseBriefs']],
  'completeMathematicsCompared':f['mathReadIds'],
  'sourceEvidenceKind':'didacticSequencing-not-direct-universal-prerequisite-quote',
  'scientificScope':'Exact cross-subject requires and exact proposed P suitability; raw AI receipt, not native M7 evidence',
  'profileDisposition':f['profileDisposition'],'remainingBlockers':f['remainingBlockers'],
 })
draft=path('parallel-independent-review.draft.json')
draft.open('x').write(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'reviewDraft':str(draft),'constructiveReceipt':str(out),'counts':review['counts']},indent=2))
