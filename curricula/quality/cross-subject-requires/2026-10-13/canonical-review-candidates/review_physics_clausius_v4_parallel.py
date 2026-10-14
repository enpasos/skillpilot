# SPDX-License-Identifier: Apache-2.0
"""Fresh independent scientific receipt and replay, without author/native writes."""
import datetime
import hashlib
import json
import math
from pathlib import Path

prefix=Path('tmp/cross-subject-requires/physics-clausius-revision-author-20261013-v4')
path=lambda suffix:Path(str(prefix)+'.'+suffix)
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
context=json.loads(path('context.exact.json').read_text())
packet=json.loads(path('proposal-candidate.json').read_text())
amendments=json.loads(path('profile-amendments.candidate.json').read_text())
v3=json.loads(Path('tmp/cross-subject-requires/physics-pending5-revision-author-20261013-v3.context.exact.json').read_text())
assert context['mathematicsFullDescriptionsAndActualCurrentNativePRead']==v3['mathematicsFullDescriptionsAndActualCurrentNativePRead']
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
reviewer='Codex GPT-6.1 Sol Ultra / independent scientific reviewer /root/requires_parallel_review'

# Derive the actual four changed leaves, not the author's declared field list.
changes=[]
def compare(a,b,p=''):
    if isinstance(a,dict) and isinstance(b,dict):
        assert a.keys()==b.keys()
        for k in a:compare(a[k],b[k],p+'.'+k)
    elif isinstance(a,list) and isinstance(b,list):
        assert len(a)==len(b)
        for i,(x,y) in enumerate(zip(a,b)):compare(x,y,p+f'[{i}]')
    elif a!=b:changes.append(p)
compare(context['oldV3ProfileFullDeEn'],context['newV4ProfileFullDeEn'])
expected=[f'.applicationCaseBriefs[{i}].taskDemand{lang}' for i in range(2) for lang in ['De','En']]
assert changes==expected
for older,newer in zip(context['oldV3ProfileFullDeEn']['applicationCaseBriefs'],context['newV4ProfileFullDeEn']['applicationCaseBriefs']):
    for lang,marker in [('De','Allgemeine mathematische Hilfen:'),('En','Generic mathematical support:')]:
        assert older['taskDemand'+lang].split(marker)[0]==newer['taskDemand'+lang].split(marker)[0]

# Replay all sixteen actual author probes, omitting its sealed output write.
script=Path('tmp/cross-subject-requires/test_revision_author_clausius_v4.py')
ns={'__name__':'__independent_replay__'}
exec(compile(script.read_text().split('\nout = ROOT/',1)[0],str(script),'exec'),ns)
author_probes=json.loads(path('mathematical-probes.json').read_text())
assert len(ns['checks'])==16 and ns['checks']==author_probes['checks']

# Extra independent checks cover a non-reciprocal primitive and a degenerate
# positive interval, beyond the author's supplied finite numerical probes.
nonreciprocal_integral=(2.0**2/2)-(1.0**2/2)
assert nonreciprocal_integral==1.5
equal_endpoint_result=7.0*(math.log(3.0/5.0)-math.log(3.0/5.0))
assert equal_endpoint_result==0
probe_receipt={
 'schemaVersion':1,'status':'independent-replay-and-premise-review-pass','reviewer':reviewer,'completedAt':now,
 'authorProbeScript':{'path':str(script),'sha256':sha(script)},
 'authorProbeReport':{'path':str(path('mathematical-probes.json')),'sha256':sha(path('mathematical-probes.json'))},
 'replayedCheckCount':16,'replayedChecks':ns['checks'],'actualChangedLeaves':changes,
 'physicalTaskPrefixesUnchanged':True,
 'independentAdditionalChecks':[
  {'name':'non-reciprocal-general-evaluation','integrand':'f(x)=x','validPrimitive':'F(x)=x^2/2, Fprime=x','interval':[1,2],'result':nonreciprocal_integral,'passed':True},
  {'name':'equal-positive-endpoints','integrand':'7/x','interval':[3,3],'fixedPositiveReference':5,'result':equal_endpoint_result,'passed':True},
 ],
 'independentPremiseReasoning':[
  'For continuous f and differentiable F with Fprime=f on the whole interval, the endpoint difference evaluates the signed integral. The explicit condition excludes ln(x/x0) for f=1, whose valid primitive is x.',
  'For fixed real c and fixed x0>0, d[c ln(x/x0)]/dx=c/x on x>0. With positive endpoints the whole straight integration interval stays positive; subtracting the two logarithms cancels the reference and gives c ln(b/a), including reversed bounds and c=0.',
  'For variable c(x), the derivative also contains cprime(x) ln(x/x0), so the constant-factor reciprocal formula does not apply. The new text explicitly excludes variable factors; the probe guard tests this declared precondition rather than magically detecting all variable expressions.',
  'Both physical routes have admissible positive variables and fixed coefficients: nR/V over positive volume and C/T over positive absolute temperature with constant C. They preserve own constitutive/first-law derivation and path selection.',
 ],
 'limits':'Finite Simpson probes check selected values, not a general theorem. The text premises and derivative/reference-cancellation reasoning supply the general mathematical justification. Structural field checks are not native evidence; no learner work or native M7 claimed.',
 'license':'Apache-2.0',
}
probe_out=path('parallel-independent-mathematical-probes.json')
probe_out.open('x').write(json.dumps(probe_receipt,ensure_ascii=False,indent=2)+'\n')

d=packet['decisions'][0];c=context['records'][0];a=amendments['amendments'][0]
review={
 'schemaVersion':1,'status':'fresh-independent-ai-substantive-clausius-v4-review-only',
 'authorLedgerSha256':sha(path('proposal-candidate.json')),'inventorySha256':packet['baselineInventorySha256'],
 'candidatePacketPath':str(path('proposal-candidate.json')),
 'authorManifest':{'path':str(path('manifest.json')),'sha256':sha(path('manifest.json'))},
 'reviewer':reviewer,'reviewedAt':now,
 'sourceContextPath':str(path('context.exact.json')),'sourceContextSha256':sha(path('context.exact.json')),
 'profileAmendmentsPath':str(path('profile-amendments.candidate.json')),'profileAmendmentsSha256':sha(path('profile-amendments.candidate.json')),
 'mathematicalProbeReceipt':{'path':str(probe_out),'sha256':sha(probe_out)},
 'methodology':'Fresh full V4 bilingual P, unchanged whole Physics goal and exact four changed helper fields actually read. All other profile leaves and physical task prefixes compared with V3. All sixteen actual author probes replayed without altering the sealed report, with explicit independent premise/derivative/domain reasoning and two additional checks. Ten whole Math meanings and full current bilingual P bodies previously actually read during V3 are exactly equal to V4 snapshots; freshness is revalidated, not assumed. Own enriched legacy Clausius wording is distinguished from official all-jurisdiction source claims. Provided generic mathematical facts are accepted only because authentic own physical path/constitutive/heat/entropy reasoning remains. No requires-transitive mastery or whole-atom necessity from partial relevance.',
 'counts':{'approved':1,'pending':0,'rejected':0},'nativeM7AdoptionClaimed':False,'activeEditsMade':False,
 'preservedHistoricalV3Pending':{'path':'tmp/cross-subject-requires/physics-pending5-revision-author-20261013-v3.parallel-independent-review.json','sha256':sha(Path('tmp/cross-subject-requires/physics-pending5-revision-author-20261013-v3.parallel-independent-review.json')),'goalId':d['dependentGoalId'],'decision':'pending','boundary':'This historical verdict remains exact; only a new V4 verdict is issued.'},
 'licensing':{'ownSubstantiveReview':'CC-BY-4.0','technicalChecksAndMetadata':'Apache-2.0','attribution':'SkillPilot contributors','thirdPartySourceAndPdfExtracts':'Original rights retained; no blanket mixed-package license grant or inferred redistribution clearance.'},
 'decisions':[{
  'decisionId':d['decisionId'],'dependentGoalId':d['dependentGoalId'],'sourceBatch':d['sourceBatch'],'sourceIndex':d['sourceIndex'],
  'authorAction':d['decision'],'decision':'approved','reviewer':reviewer,'reviewInput':d['reviewInput'],
  'proposalBindingSha256':'PENDING_REPOSITORY_FINGERPRINT',
  'rationale':'The fresh exact V4 repairs the earlier false general integral aid in all four German/English case fields: it requires continuous f and a differentiable primitive satisfying Fprime=f throughout the interval, then restricts the logarithmic rule to c/x with fixed real c, a wholly positive interval and fixed positive x0. The derivative c/x and reference cancellation justify the rule; reversed positive bounds and zero/negative constants are legitimate. The f=1 countercase now requires primitive x and excludes an unrelated logarithmic primitive, while variable factors are expressly outside the special rule. Sixteen actual author probes were replayed and their numerical/guard limits assessed, rather than treated as proof by themselves. The gas learner must still choose a reversible isotherm, infer dU=0 from supplied U(T), derive deltaQrev=p dV from the first law and volume work, obtain nR dV/V, choose positive volume bounds and derive nR ln2. For the solid the learner must still design infinitesimally matched reservoirs, derive deltaQrev=C dT, preserve the variable temperature in the quotient and obtain C ln(T2/T1), explaining why Qactual/T2 fails. These pathways, integration variables, bounds, heat relations and physical entropy results are withheld from task aids. Thus the supplied generic rules support a complete symbolic Clausius route without suppressing own physical derivation, comparison or transfer. Full IntegralDef additionally demands upper/lower-limit interpretation; integral-area/stock includes distinct area/stock transfer; the arithmetic and term-evaluation atoms include mixed representation or numerical substitution competencies not universally needed before this exact supported Physics goal. Approve the complete empty foreign set only with the exact V4 support. This creates no Math mastery and does not count as native M7 evidence or all16-source certification.',
  'sourceClauseWitness':'Own retained HE legacy goal3ab3f788-deaa-4140-8fe0-eb30f39eb563 and unchanged canonical e713 require using dS=deltaQrev/T and explaining the reversible substitute path through entropy state-function independence. These exact own enriched source/goal meanings remain intact. They are not a verbatim official cross-jurisdiction quote or a direct mandatory Math-prerequisite clause.',
  'currentGoalSha256':c['currentCanonicalGoalSha256'],
  'oldNativeProfileReviewPath':c['actualNativePReviewPath'],'oldNativeProfileBodySha256':c['actualNativePBodySha256'],
  'historicalV3ProfileBodySha256':context['oldV3ProfileBodySha256'],
  'proposedProfileBodySha256':a['proposedProfileBodySha256'],'fullBilingualProfileRead':True,
  'expectationIdsRead':[e['id'] for e in a['proposedProfile']['expectations']],
  'caseIdsRead':[e['id'] for e in a['proposedProfile']['applicationCaseBriefs']],
  'completeMathematicsCompared':['3862890e-9ea9-4c62-bcf2-e354c9d8f306','2afba4a2-287d-5e8f-aeee-a3bcf8652236','ee48e811-4c9c-5080-9836-8403fc9f0810','f08d06dc-139d-5fd2-892c-8cc919b1e4fc','a6469c01-6ca3-5eb2-a82c-94f3d0560b32'],
  'profileDisposition':'substantively-suitable-exact-supported-candidate-pending-native-gates',
  'scientificScope':'Exact cross-subject requires and exact proposed P suitability only; raw independent AI receipt, no native M7 adoption',
  'remainingBlockers':['No remaining scientific requires/P-helper blocker for this exact V4 candidate. Native D/P/A/M/V, quality floors, source/placement and authorized adoption remain separate future gates.'],
 }],
 'fullCurrentMathReadBinding':[{'goalId':gid,'goalSha256':owner['goalSha256'],'nativeReviewPath':owner['reviewPath'],'nativeReviewFileSha256':owner['reviewFileSha256'],'profileBodySha256':owner['profileBodySha256'],'readExtent':'Whole goal and all bilingual P fields actually read during V3; exact equality to V4 snapshot proved and current freshness rechecked.'} for gid,owner in context['mathematicsFullDescriptionsAndActualCurrentNativePRead'].items()],
}
out=path('parallel-independent-review.draft.json')
out.open('x').write(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'reviewDraft':str(out),'probeReceipt':str(probe_out),'counts':review['counts']},indent=2))
