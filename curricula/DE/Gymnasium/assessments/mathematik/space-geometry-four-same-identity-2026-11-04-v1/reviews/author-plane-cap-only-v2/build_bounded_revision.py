"""Apply only the independently requested F-PLANE-01 ordinary-rubric change."""
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import difflib
import json

H=Path(__file__).resolve().parent
R=H.parents[2]
P=R/'tmp/approach-review-20261101/space-geometry-four-whole-forms-20261103-v1'
REVIEW=P/'astra-space-geometry-four-content-review-20261103-v1'
ID='fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc'
def digest(p):return sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':digest(p),'bytes':p.stat().st_size}
def load(p):return json.loads(p.read_text())
def save(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')

assert digest(REVIEW/'review.json')=='cce2626f0208d3a7a1e00a5c1147916f361ef16b35ff3fa18bfde81ebbbbe7a0'
review=load(REVIEW/'review.json')
assert len(review['findings'])==1 and review['findings'][0]['id']=='F-PLANE-01'
finding=review['findings'][0]
assert finding['counterexample']['rawTotal']==15
assert digest(R/finding['counterexample']['path'])==finding['counterexample']['sha256']
frozen=load(P/'review-input-manifest.json')
for row in frozen['files']:assert digest(R/row['path'])==row['sha256']

replacements={
 'de': (
  'Wird der Sonderfall a=1 bei der Lage zu F ausschließlich durch unzulässiges Teilen durch a-1 ausgeschlossen und nirgends sachgerecht aufgefangen, gilt dieselbe Kappung: Der zentrale Wechsel von einer Schnittgeraden zur ganzen Ebene ist dann nicht untersucht. Eine an anderer Stelle gezeigte korrekte Sonderfallbehandlung zählt.',
  'Dieselbe Kappung gilt, wenn über die gesamte Abgabe keine fachlich tragfähige Untersuchung des Sonderfalls a=1 bei der Lage zu F erkennbar ist. Der Wechsel von der Schnittgeraden für a≠1 zur ganzen Ebene für a=1 darf nicht vollständig fehlen. Dies gilt bei bloßem Auslassen ebenso wie bei Verlust des Falls durch unzulässiges Teilen durch a−1. Eine knappe begründete Feststellung E₁=F genügt; eine richtige Behandlung an anderer Stelle zählt. Ein einzelner lokaler Rechen- oder Übertragungsfehler allein löst weiterhin keine Kappung aus.'),
 'en': (
  'The same cap applies if the case a=1 relative to F is lost solely through invalid division by a-1 and is not handled correctly anywhere else: the central change from an intersection line to an entire plane has then not been investigated. A correct treatment of the exceptional case elsewhere counts.',
  'The same cap applies if no mathematically sound treatment of the exceptional case a=1 relative to F is evident anywhere in the submission. The change from an intersection line for a≠1 to the entire plane for a=1 must not be entirely absent. This includes simply omitting the case as well as losing it through invalid division by a−1. A concise justified statement that E₁=F is sufficient; a correct treatment elsewhere counts. A single local arithmetic or copying error alone still does not trigger the cap.'),
}
O=H/'replacements'
old_goal=load(P/ID/'proposed-whole-goal.draft.json')
new_goal=deepcopy(old_goal)
operations=[]
for lang,(before,after) in replacements.items():
    src=P/ID/f'rubric.{lang}.md'
    old=src.read_text();assert old.count(before)==1
    new=old.replace(before,after)
    assert old.count('$')==new.count('$')==0
    dst=O/ID/src.name;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(new)
    field='solutionContent'+('En' if lang=='en' else '')
    assert old_goal['examData'][field]==(P/ID/f'solution.{lang}.md').read_text()+'\n'+old
    new_goal['examData'][field]=(P/ID/f'solution.{lang}.md').read_text()+'\n'+new
    operations.append({'language':lang,'original':bind(src),'replacement':bind(dst),'exactReplacement':{'before':before,'after':after},'mirroredDisplayField':'examData.'+field})

old_key='lost-exception-through-invalid-division'
new_key='missing-or-invalid-special-case-a1'
contract=load(P/ID/'whole-contract.before-after.json')
assert contract['wholeProposedGoal']==old_goal
assert contract['capReasonKeys'].count(old_key)==1
new_contract=deepcopy(contract)
new_contract['wholeProposedGoal']=new_goal
new_contract['capReasonKeys']=[new_key if k==old_key else k for k in contract['capReasonKeys']]
all_contracts=load(P/'whole-current-and-proposed-contracts.json')
updated_all=deepcopy(all_contracts)
indices=[i for i,f in enumerate(all_contracts['forms']) if f['goalId']==ID]
assert len(indices)==1
updated_all['forms'][indices[0]]=new_contract
save(O/ID/'proposed-whole-goal.draft.json',new_goal)
save(O/ID/'whole-contract.before-after.json',new_contract)
save(O/'whole-current-and-proposed-contracts.json',updated_all)
for rel in [Path(ID)/'proposed-whole-goal.draft.json',Path(ID)/'whole-contract.before-after.json',Path('whole-current-and-proposed-contracts.json')]:
    operations.append({'original':bind(P/rel),'replacement':bind(O/rel),'mirrorOnly':True})
assert new_goal['examData']['scoring']==old_goal['examData']['scoring']
assert {k:v for k,v in new_goal['examData'].items() if k not in ['solutionContent','solutionContentEn']}=={k:v for k,v in old_goal['examData'].items() if k not in ['solutionContent','solutionContentEn']}
assert {k:v for k,v in new_goal.items() if k!='examData'}=={k:v for k,v in old_goal.items() if k!='examData'}
assert {k:v for k,v in updated_all.items() if k!='forms'}=={k:v for k,v in all_contracts.items() if k!='forms'}
assert [a for a,b in zip(all_contracts['forms'],updated_all['forms']) if a!=b]==[contract]

# Real reviewer counterexample: use its exact awarded steps, not invented points.
maxima={row['id']:row['points'] for row in old_goal['examData']['scoring']['steps']}
base=finding['counterexample']['rawScores']
assert set(base)==set(maxima) and sum(base.values())==15
cases=[]
def record(name,awards,reason,special_case_absent=False,invalid_division=False,local_error_only=False,old_generic_cap=False):
    assert set(awards)==set(maxima)
    assert all(0<=v<=maxima[k] and int(v*2)==v*2 for k,v in awards.items())
    raw=sum(awards.values())
    # These are explicit author judgments of the stated submission facts.
    old_cap=old_generic_cap or (special_case_absent and invalid_division and not local_error_only)
    new_cap=old_generic_cap or (special_case_absent and not local_error_only)
    before=min(raw,14) if old_cap else raw
    after=min(raw,14) if new_cap else raw
    cases.append({'id':name,'hypotheticalSubmissionFacts':reason,'awardsByUnchangedRubricStep':awards,
                  'rawPoints':raw,'oldV1CapApplies':old_cap,'oldV1Total':before,'oldV1BinaryPass':before>=15,
                  'newV2CapApplies':new_cap,'newV2Total':after,'newV2BinaryPass':after>=15,
                  'pointsAndOrdinaryThresholdUnchanged':True,'localArithmeticAloneIsNotCapReason':local_error_only})

record('exact-independent-fifteen-point-omission-counterexample',dict(base),
       'The complete bound Astra counterexample divides only under a!=1, gives E0 and E2, proves the exact common line and solves the point condition, but never treats the whole-plane intersection E1=F. This is the actual F-PLANE-01 submission.',special_case_absent=True)
assert cases[-1]['oldV1BinaryPass'] and cases[-1]['newV2Total']==14 and not cases[-1]['newV2BinaryPass']

invalid=dict(base)
record('same-missing-case-lost-by-invalid-division',invalid,
       'Use the same displayed work but erase the explicit a!=1 restriction and claim that division yields the line as the intersection with F for every a. The identity case is absent everywhere. Both rubrics cap this already invalid version.',special_case_absent=True,invalid_division=True)
assert cases[-1]['oldV1Total']==cases[-1]['newV2Total']==14

elsewhere=dict(base);elsewhere['examples']=2;elsewhere['exception']=2
record('concise-correct-special-case-elsewhere',elsewhere,
       'Add after part 4: Substituting a=1 gives E1: y+z=2, precisely the defining equation of F. Thus E1=F. This concise justified identity handles the whole-plane case, even without repeating the phrase entire plane or moving it into part 2. Credit E1 example and both exception points wherever shown.')
assert cases[-1]['rawPoints']==18 and cases[-1]['newV2BinaryPass'] and not cases[-1]['newV2CapApplies']

full=dict(maxima)
record('complete-correct-submission',full,'All work in the original unchanged model solution is supplied. The new sentence changes no correct result or points.')
assert cases[-1]['newV2Total']==20

local=dict(maxima);local['examples']=1;local['exception']=1
record('one-local-E1-right-side-copying-error-with-correct-method',local,
       'The student explicitly singles out a=1 and compares the normal/coefficient structure with F. In writing the substituted equation only, a+1=2 is copied as 3, leading to an erroneous distinct-parallel conclusion instead of identity. E0 and all other calculations are correct. Lose the E1 example point and the identity conclusion point; retain the correct exceptional-case method and traceable follow-through. This isolated copying error is not an entirely omitted central action.',local_error_only=True)
assert cases[-1]['rawPoints']==18 and cases[-1]['newV2BinaryPass'] and not cases[-1]['newV2CapApplies']

local_line=dict(maxima);local_line['intersection']=1
record('one-local-intersection-coordinate-error',local_line,
       'The a=1 identity is properly justified. One sign is copied wrongly in the displayed regular-case line after correctly solving the two conditions. Credit correct method and later traceable follow-through; one local error is not a new cap reason.',local_error_only=True)
assert cases[-1]['rawPoints']==19 and cases[-1]['newV2BinaryPass']

no_division=dict(base)
record('case-omitted-without-any-division',no_division,
       'The regular-case system is solved by an equivalent method without writing a division at all, while the a=1/F case remains entirely absent. The reason for omission does not affect the new cap.',special_case_absent=True)
assert cases[-1]['oldV1Total']==15 and cases[-1]['newV2Total']==14

relocated=dict(maxima);relocated['exception']=2
record('equivalent-general-proof-instead-of-duplicated-case',relocated,
       'The student proves the full intersection set in a general case formula, including E1 intersect F = F, in part 3. No separate repeated prose in part 2 is required. All unchanged rubric criteria are met.')
assert cases[-1]['newV2Total']==20

save(H/'bounded-rubric-counterchecks.json',{
 'status':'AUTHOR_BOUNDED_F_PLANE_01_DELTA_CHECKS_PASS_PENDING_INDEPENDENT_DELTA_REVIEW',
 'sourceFinding':bind(REVIEW/'review.json'),'realIndependentCounterexample':bind(REVIEW/'plane-cap-counterexample.de.md'),
 'caseCount':len(cases),'cases':cases,
 'allOriginalMaximaAndPassingPointsUnchanged':True,
 'noNewRuntimeGateOrPartialPass':True,
 'notAnIndependentReview':True,
 'noUnchangedAlgebraOrSSRRepeated':True,
})
patches=[]
for op in operations:
    before=R/op['original']['path'];after=R/op['replacement']['path']
    patches.extend(difflib.unified_diff(before.read_text().splitlines(keepends=True),after.read_text().splitlines(keepends=True),fromfile=op['original']['path'],tofile=op['replacement']['path']))
(H/'exact-delta.patch').write_text(''.join(patches))

# Verify all original frozen files, including all three PASS forms, are byte equal.
for row in frozen['files']:assert digest(R/row['path'])==row['sha256']
save(H/'bounded-delta-manifest.json',{
 'status':'NARROW_F_PLANE_01_RUBRIC_SUCCESSOR_PENDING_GENUINE_INDEPENDENT_DELTA_REVIEW',
 'originalContentManifest':bind(P/'review-input-manifest.json'),'independentWholeContentReview':bind(REVIEW/'review.json'),
 'findingId':'F-PLANE-01','changedGoalId':ID,'replacementFiles':operations,
 'onlyContentDelta':'Extend the existing ordinary total-score cap to a completely missing sound a=1/F special-case treatment regardless of omission cause. Correct work anywhere and local-error/follow-through protection retained.',
 'capReasonKey':{'before':old_key,'after':new_key},
 'maxPoints':20,'passingPoints':15,'cap':14,
 'taskSolutionMathematicsAndPointValuesByteUnchanged':True,
 'allOtherThreeFormsWholeByteUnchanged':True,
 'all52OriginalFrozenFilesByteUnchanged':True,
 'noNewCanonicalPolicyScopeRequiresOrRootChanges':True,
 'deltaCounterchecks':bind(H/'bounded-rubric-counterchecks.json'),'exactDelta':bind(H/'exact-delta.patch'),
 'boundedRevisionGenerator':bind(Path(__file__).resolve()),
 'reviewRequested':'Only corrected DE/EN cap wording, its two embedded display fields and mirrored contract/cap key; exact omission counterexample, invalid-division case, correct treatment elsewhere, and local-error protections. Reuse the genuine three-PASS/one-needs-revision whole-content review for unchanged content.',
 'unclaimed':['independent delta approval','A/M revalidation','release metadata/materialization','normal integration checks','Native','source/country decision','Root import'],
})
print(json.dumps({'status':'READY_FOR_BOUNDED_DELTA_REVIEW','replacements':len(operations),'countercheckCases':len(cases),'manifest':bind(H/'bounded-delta-manifest.json')}))
