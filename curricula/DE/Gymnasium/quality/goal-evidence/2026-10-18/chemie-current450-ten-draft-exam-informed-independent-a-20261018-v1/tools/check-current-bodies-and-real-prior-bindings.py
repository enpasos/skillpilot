# SPDX-License-Identifier: Apache-2.0
"""Finite exact-current and historical science reuse; no new review judgment."""
import hashlib
import json
from pathlib import Path

N=Path('curricula/DE/Gymnasium/quality/goal-evidence')
I=N/'2026-10-18/chemie-current450-ten-draft-exam-neutral-current-inputs-20261018-v1'
OLD=N/'2026-10-16'
def read(p):return json.loads(Path(p).read_text())
def pin(p):
    b=Path(p).read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
seal=pin(I/'SEAL.neutral-current-ten-exam-inputs.no-scientific-approval.json')
assert seal['sha256']=='91d7f1cc1a09e3b7c35cb91ae93bb4bd9b07c184ca4bbe9e35d59c04e1123022'
for f in read(seal['path'])['files']:assert pin(f['path'])==f
current=read(I/'INPUT.ten-whole-current-draft-exam-goals.exact.json')
canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
goals={g['id']:g for g in read(canonical)['goals']}
for g in current:assert g==goals[g['id']]
sem=read(I/'INPUT.actual-referenced-goal-semantics.no-new-scientific-judgment.json')
for g in sem:assert g=={k:goals[g['id']][k] for k in g}
prior_a_path=OLD/'chemie-seven-HE-historical-exams-fresh-independent-a-20261016-v1/FIRST.seven-whole-exam-science-and-interface.independent-a.frozen.json'
prior_b_path=OLD/'chemie-seven-HE-historical-exam-science-interface-independent-b-20261016-v1/science.FIRST.seven-complete-exams.independent-b.json'
pa=read(prior_a_path);pb=read(prior_b_path)
cas_path=OLD/'chemie-seven-HE-historical-exam-atomic-interface-and-material-author-successor-20261016-v1/CAS.seven-WHOLE-exams.current639.AUTHOR.inactive.json'
cas=read(cas_path);assert pin(cas_path)['sha256']=='d80ff21215ed5699b8b37cb8dfc6085c3ccd7ef2385f243b3fc20c06aa6a4675'
assert pa['inputCAS']['sha256']=='sha256:'+pin(cas_path)['sha256']
assert pb['inputWholeCASSHA256']=='sha256:'+pin(cas_path)['sha256']
rows=[]
for g in current[:7]:
    old=next(x for x in cas['operations'] if x['goalId']==g['id'])
    ar=next(x for x in pa['rows'] if x['goalId']==g['id']);br=next(x for x in pb['examDecisions'] if x['goalId']==g['id'])
    assert ar['decision']=='KEEP' and br['decision'].startswith('KEEP')
    assert old['afterWholeObjectFingerprint']==ar['afterWholeObjectFingerprint']
    assert old['afterWholeObjectFingerprint']=='sha256:'+digest(old['after'])
    equal={k:g['examData'][k]==old['after']['examData'][k] for k in ('taskContent','solutionContent','scoring','coveredGoalIds')}
    assert all(equal[k] for k in ('taskContent','solutionContent','scoring'))
    assert sum(s['points'] for s in g['examData']['scoring']['steps'])==g['examData']['scoring']['maxPoints']
    old_requires=set(old['after']['requires']);new_requires=set(g['requires'])
    rows.append(dict(goalId=g['id'],wholeCurrentObjectSHA256=digest(g),wholeGoalExactlyPriorReviewedAfter=g==old['after'],priorReviewedAfterObjectSHA256=digest(old['after']),bodyFieldEquality=equal,requiresExactlyPriorReviewedAfter=g['requires']==old['after']['requires'],removedAdmissionIds=sorted(old_requires-new_requires),addedAdmissionIds=sorted(new_requires-old_requires),removedDirectCoveredIds=sorted(set(old['after']['examData']['coveredGoalIds'])-set(g['examData']['coveredGoalIds'])),priorA=pin(prior_a_path),priorB=pin(prior_b_path),priorScienceNotNewCurrentVote=True))
assert sum(r['wholeGoalExactlyPriorReviewedAfter'] for r in rows)==5
he_a_path=OLD/'chemie-global145-fresh-independent-exam-a-20261016-v1/REVIEW145.independent-a.machine-exam-content-and-scope.json'
he_b_path=OLD/'chemie-global145-fresh-independent-exam-b-20261016-v1/E16.review-b.structured-decision.actual.json'
ha=read(he_a_path);hb=read(he_b_path);candidate_path=ha['candidatePath'];candidate=read(candidate_path)
assert pin(candidate_path)['sha256']=='251afcd83ecae4b658b90357a31f2740b3dd6370a804f9680ab9e852f4d64dba'
assert ha['candidateSha256']==hb['candidateSha256']=='sha256:'+pin(candidate_path)['sha256']
assert ha['machineExamContentDecision']==hb['boundedExamContentDecision']=='KEEP'
he=[]
for g in current[7:9]:
    equal={k:g['examData'][k]==candidate['examData'][k] for k in ('taskContent','solutionContent','scoring','coveredGoalIds')};assert all(equal.values())
    he.append(dict(goalId=g['id'],bodyFieldEquality=equal,wholeCurrentObjectSHA256=digest(g),sharedExactReviewedContentCandidate=pin(candidate_path),priorA=pin(he_a_path),priorB=pin(he_b_path),priorJudgmentsAreSharedBodyNotCurrentAdmissionApproval=True))
assert current[7]['examData']['taskContent']==current[8]['examData']['taskContent']
assert current[7]['examData']['solutionContent']==current[8]['examData']['solutionContent']
assert current[7]['examData']['scoring']==current[8]['examData']['scoring']
print(json.dumps(dict(status='PASS_EXACT_CURRENT_AND_ACTUAL_PRIOR_BINDINGS_ONLY',neutralSeal=seal,canonical=pin(canonical),wholeCurrentInput=pin(I/'INPUT.ten-whole-current-draft-exam-goals.exact.json'),referencedCurrentSemantics=pin(I/'INPUT.actual-referenced-goal-semantics.no-new-scientific-judgment.json'),currentWholeExamsExactlyCanonical=10,currentReferencedSemanticObjectsExactlyCanonical=len(sem),priorSevenWholeCAS=pin(cas_path),seven=rows,HE=he,priorOriginalFilesNotMutated=True,normalWrites=0,newScientificJudgmentsFromThisCheck=False),ensure_ascii=False,indent=2))
