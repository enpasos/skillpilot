"""Concrete author rubric judgments, not an automated semantic grader."""
from pathlib import Path
import json
H=Path(__file__).resolve().parent;pack=json.loads((H/'author-package.json').read_text());forms=pack['forms'];cases=[]
def case(idx,label,awards,cap,expected,reason):
 d=json.loads((H/forms[idx]['contentPath']).read_text())['examDataContent'];steps=d['scoring']['steps'];assert len(awards)==len(steps)
 for score,row in zip(awards,steps):assert 0<=score<=row['points']
 raw=sum(awards);total=min(raw,14) if cap else raw;passed=total>=d['scoring']['passingPoints'];assert passed==expected
 cases.append({'goalId':forms[idx]['goalId'],'submission':label,'authorAwardedPointsByStep':dict(zip([r['id'] for r in steps],awards)),'rawTotal':raw,'normalRubricCapApplies':cap,'ordinaryTotal':total,'singleBinaryResult':'pass' if passed else 'not-passed','mathematicalRationale':reason,'judgmentOrigin':'AUTHOR_MANUAL_COUNTERCASE_NOT_PRODUCTION_GRADER'})
case(0,'Complete exact reference',[6,3,6,5],False,True,'All requested actions present.')
case(0,'Concise correct general formula derived from line intersection; concise image/kernel/idempotence analysis',[5,2,5,4],False,True,'One derivation and short structural reasoning suffice; no required narrative length.')
case(0,'Correct memorised concrete and general matrices, point and properties, but no geometric derivation anywhere',[2,3,6,4],True,False,'The matrix-determining action is wholly missing even though final matrices are right.')
case(0,'Derived matrix and all numerical work, no structural investigation at all',[6,3,0,5],True,False,'Structural investigation is absent; raw total already below pass.')
case(0,'One sign copied incorrectly in P; valid intersection, checked point and traceable structure',[4.5,3,5,4],False,True,'Local transcription error is not wholesale absence of either core action.')
case(0,'Omitted parallel-direction exception but all concrete work and general derivation correct',[6,3,6,3],False,True,'One omitted boundary discussion is scored, not a separate sub-pass requirement.')
case(1,'Complete full fixed sets',[3,5,5,5,2],False,True,'All systems and complete solution sets present.')
case(1,'Correct short Gaussian elimination; one missing explicit general-point check',[3,4,5,4,2],False,True,'Brief equivalent elimination and global solution sets count.')
case(1,'Only memorised axis/plane/origin/whole-space labels; no concrete LGS setup or solution',[2,2,2,2,1],True,False,'Shape labels do not supply the specified LGS method.')
case(1,'A and B only contain two example points each; full C system solved',[3,1,1,5,2],True,False,'No whole nontrivial fixed set derived; sample checks cannot prove completeness.')
case(1,'One arithmetic slip in C with traceable work and correct nontrivial sets elsewhere',[3,5,5,2,2],False,True,'One local failure does not trigger the core-action cap.')
case(1,'B omitted; all other cases completed',[3,5,0,5,2],False,True,'A supplies complete nontrivial full-set LGS work; B is not a compulsory separate pass.')
case(1,'Correctly answers that C has only the origin rather than no fixed point',[3,4,4,5,2],False,True,'Origin is mathematically mandatory for a linear map.')
case(2,'Complete coordinate views, full image sets, sketches, shadow',[4,5,7,4],False,True,'All projection and interpretation actions present.')
case(2,'Short correct line and surface image reasoning, no decorative illustration',[4,5,6,4],False,True,'Simple labelled sketches suffice; no polished diagram expected.')
case(2,'Only isolated projected corners and a shadow point; no entire line/surface image',[4,1,3,3],True,False,'Point computations alone do not establish the demanded whole object images.')
case(2,'Correct images and areas but no context or geometric interpretation anywhere',[3,4,5,3],True,False,'Every interpretation is absent.')
case(2,'One image coordinate copied wrongly; sound rules and follow-through',[3,4,6,4],False,True,'Local slip does not erase full-set or interpretation action.')
case(2,'One sketch missing but sound full image sets and all interpretations',[4,5,6.5,4],False,True,'Single sketch omission is partial-credit loss only.')
case(2,'Uses h with zero projected direction as a point, not a line',[4,5,6,3],False,True,'Degenerate image correctly classified.')
case(3,'Complete cross-product normal and both areas with parameter cases',[7,3,5,5],False,True,'Both explicit target applications present.')
case(3,'Short computed cross product, two dot checks and magnitude area; one vertex probe omitted',[7,2.5,5,4],False,True,'Concise correct mathematics counts.')
case(3,'Correct cross-product normal and plane; no magnitude area calculation anywhere',[7,3,2,3],True,False,'Area application is wholly absent.')
case(3,'Guessed normal and correct norm numbers but no traceable cross-product formation/application',[2,3,3,3],True,False,'The explicitly requested vector-product use is absent.')
case(3,'Cross product reversed with correct acknowledged sign and unchanged areas',[6,3,5,4],False,True,'Nonzero reversed normal and norm area are valid; ordered product sign may lose one point.')
case(3,'Single multiplication slip in cross product, verified traceable norm and area follow-through',[5,2,4,4],False,True,'One local calculation error is not wholesale loss of a target application.')
case(3,'Incorrect 3t instead of 3|t| but otherwise complete',[7,3,5,2],False,True,'Negative-parameter error loses its points without creating a second mastery condition.')
case(3,'Omitted degenerate t=0 reasoning but all other work correct',[7,3,5,3],False,True,'Boundary omission is scored normally, not made a separate passing gate.')
# Ordinary threshold boundary independent of content judgments.
for f in forms:
 scoring=json.loads((H/f['contentPath']).read_text())['examDataContent']['scoring'];assert sum(r['points'] for r in scoring['steps'])==20;assert scoring['passingPoints']==15
report={'status':'PASS_AUTHOR_RUBRIC_ARITHMETIC_AND_CONCRETE_COUNTERCASES_PENDING_INDEPENDENT_REVIEW','cases':cases,'caseCount':len(cases),'limitations':'Award allocations and cap judgments are explicit author interpretations of the rubric, not an automated semantic marking system or independent approval. One ordinary total only; no side evidence, sub-passes or prerequisite mastery.'}
(H/'author-rubric-counterchecks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':report['status'],'countercases':len(cases)}))
