"""Reviewer-authored concrete markings. Arithmetic checks do not grade language."""
import json
from pathlib import Path
OUT=Path(__file__).resolve().parent
P=OUT.parent/'dgl1-whole-form-content-20261104-v1'
cases=[]
def case(name,submission,marks,cap=False):
    assert len(marks)==5 and all(0<=v<=m for v,m in zip(marks,[6,2,5,3,4]))
    raw=sum(marks); final=min(raw,14) if cap else raw
    cases.append({'case':name,'concreteSubmission':submission,'reviewerMarksByWrittenRubric':[{'part':i+1,'points':v} for i,v in enumerate(marks)],'rawScore':raw,'wholeCoreCapApplies':cap,'finalScore':final,'overallResult':'pass' if final>=15 else 'not_passed','separatePartMastery':False})
case('complete separation',"For y≠0: y^-2dy=dt; -1/y=t+K; y=-1/(t+K)=1/(C-t), C=-K arbitrary, intervals avoid C. Constant k forces k=0, omitted by division. 1=1/C gives C=1; y=1/(1-t), I=(-∞,1), pole 1 cannot be crossed and other branch lacks 0. Differentiate to (1-t)^-2=y², y(0)=1. z=t²+L, L=-2, domain R, derivative 2t and initial -2 checked.",[6,2,5,3,4])
case('reciprocal derivation is genuine solving',"On y≠0 choose u=1/y; u'=-y'/y²=-1. Integrate u=-t+C and invert. All denominator conditions and remaining work as in complete solution.",[6,2,5,3,4])
case('coefficient ansatz is genuine solving',"Choose y=1/(a+bt) with unknown a,b and nonzero denominator. Its derivative gives -b/(a+bt)²=1/(a+bt)², so b=-1 while a remains arbitrary. State family and denominator restriction. Complete all remaining work. No theorem claiming exhaustive solution classification is asserted.",[6,2,5,3,4])
case('unrenamed integration constant',"Correct separation keeps y=-1/(t+K). From y(0)=1 obtain K=-1. State the same particular, interval, zero, verification and direct case correctly.",[6,2,5,3,4])
case('guessed family plus all checks cannot pass',"Only writes y=1/(C-t), t≠C, without setup, integration or derivation. Zero, correct C=1 determination, interval, actual derivative/initial checks and all z work are complete.",[2,2,5,3,4],True)
case('method keyword is insufficient',"Adds only the words 'by separation' to the preceding guessed-family answer. No separated equation, integration or derivation appears anywhere.",[2,2,5,3,4],True)
case('no initial determination anywhere cannot pass',"Both general families are properly derived. State particular guesses 1/(1-t) and t²-2 and their correct intervals/checks, but explicitly make no substitution of either initial condition into either general family. All zero work is correct. Part3 earns particular+interval+pole=3; part5 earns general+interval+checks=3.",[6,2,3,3,3],True)
case('initial core may be supplied in direct case',"Derive the nonzero family and zero case correctly. For y merely guess 1/(1-t), but give its correct interval/pole explanation and checks. For z genuinely integrate t²+L and use z(0)=-2 to derive L=-2, with domain and checks.",[6,2,3,3,4])
case('direct-integration part is not a separate pass',"Parts1–4 exactly complete; part5 entirely blank.",[6,2,5,3,0])
case('zero case has no hidden pass gate',"Parts1,3,4,5 exactly complete; no constant-solution work anywhere.",[6,0,5,3,4])
case('exact fifteen-point ordinary pass',"Correct full separation, parameter and denominator restriction (6). Substitutes k into 0=k², obtains k=0 (1), but omits the link to division. Complete initial-family calculation and interval/pole reasoning (5); complete derivative and initial checks (3). Part5 entirely blank (0). Both core actions occur.",[6,1,5,3,0])
case('fourteen without missing-core cap',"Complete parts1,3,4; constant-solution and direct-integration parts both blank. Own family and initial specialization are present, but total is only14.",[6,0,5,3,0])
case('disconnected set is not one initial-value interval',"All derivations, zero and initial constants are correct. Instead of the interval gives R minus {1} and does not explain pole or branches. Correct derivative and initial checks are performed on their valid points. All z work correct.",[6,2,3,3,4])
case('single arithmetic slip with credited contradictory initial check',"Correct family and zero. Writes 1=1/C, then makes the isolated arithmetic slip C=-1. Consistently states y=1/(-1-t), I=(-1,∞) containing0, and explains pole -1. Correctly differentiates, verifies y'=y², and explicitly computes y(0)=-1≠1, recognizing failure of the original initial condition. Does not correct C. All z work correct. Part3 gets initial setup1, wrong constant0, follow-through expression1, interval1, pole1; part4 gets all3 for correctly performed checks. No second penalty for the same slip.",[6,2,4,3,4])
case('correct work under another heading receives credit',"Part1 box is blank, but under part4 gives the full valid separated equation, integration, free family, denominator restriction and actual checks. Every other requested action is complete. Allocate each performance once to its criterion.",[6,2,5,3,4])
case('verification omitted loses only its allocated points',"All requested derivation, zero, initial/interval and direct-case work are complete, but no derivative or initial verification for y appears anywhere.",[6,2,5,0,4])
assert len(cases)==16
author=json.loads((P/'author-rubric-counterchecks.json').read_text())
reviews=[]
for i,c in enumerate(author['cases'],1):
    if i==9:
        decision='NOT_ACCEPTED_AS_EXACT_17_POINT_EVIDENCE'
        reason='The stated submission explicitly computes and recognizes the wrong initial value. That is a correct initial-condition check and must receive its verification point under the written follow-through rule. The text does not fully specify every interval substep; an exact score17 is therefore not a reliable independent oracle. The fully specified reviewer case gives19 and no cap. At least the omitted verification point must not be denied merely because it exposes the earlier arithmetic slip.'
    elif i==10:
        decision='UNDERSPECIFIED_EXACT_POINT_ALLOCATION'
        reason='The prose describes a sound family with denominator restriction but assigns only5/6, and does not identify enough z-domain/check work to justify3/4. This cannot establish its exact15 score. The reviewer supplies an unambiguous15-point pass without adding any gate.'
    else:
        decision='ACCEPTED_INDEPENDENTLY'
        reason='The concrete actions and whole-core status agree with the written rubric. Equivalent derivation includes reciprocal and justified coefficient ansatz; a word or a derivative check of a guessed family alone does not.'
    reviews.append({'authorCaseNumber':i,'authorCase':c['case'],'reviewerDecision':decision,'reason':reason})
out={'status':'WRITTEN_WHOLE_RUBRIC_ACCEPTED_WITH_TWO_NONBLOCKING_AUTHOR_EXAMPLE_CORRECTIONS','total':20,'passAt':15,'capAt':14,'ordinarySingleOverallBinaryResult':True,'reviewerCases':cases,'reviewerCaseCount':16,'reviewOfAll13AuthorCases':reviews,'twoAuthorExampleIssuesDoNotChangeWrittenTaskOrRubric':True,'scoringAuthority':'The frozen written rubric and these concrete independent interpretations; author case numbers are not a semantic auto-grader.','newPartMasteryOrExhaustiveVariantRequirement':False}
(OUT/'independent-rubric-review.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':out['status'],'ownCases':len(cases),'authorCasesReviewed':len(reviews)}))
