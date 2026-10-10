from pathlib import Path
import json,copy,hashlib,re
R=Path('/home/enpasos/projects/skillpilot')
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-macro-contracts-coherent-local-material-author-v1'
N=O/'three-real-core-bypasses-separated-scoring-and-truthful-primary-bindings-author-successor-v4'
N.mkdir(exist_ok=False)
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
oldp=O/'whole-nine-macro-twelve-current-contracts-two-case-materials.DRAFT-readable-author-v3.json'
old=json.loads(oldp.read_text()); new=copy.deepcopy(old)
policies={
'1a56a8a7-c81f-5dd2-94ac-93bc6cba8eab':(
'Wird der Schöpfungs-/Tilgungszusammenhang oder die Verbindung von Zinswirkung und symmetrischem mittelfristigem Inflationsziel in beiden Fällen vollständig ausgelassen oder durchgehend falsch erklärt, wird die Gesamtpunktzahl höchstens 14. Einzelne Rechen- oder Detailfehler lösen diese Grenze nicht aus.',
'Die Gesamtpunktzahl beträgt höchstens 14, wenn die Kredit-/Einlagenschöpfung in Fall A vollständig ausgelassen oder durchgehend falsch erklärt wird. Dieselbe Grenze gilt unabhängig davon, wenn der Tilgungszusammenhang in Fall B vollständig ausgelassen oder durchgehend falsch erklärt wird, oder wenn die Verbindung von Zinswirkung und symmetrischem mittelfristigem Inflationsziel in beiden Fällen vollständig fehlt oder durchgehend falsch erklärt wird. Eine richtige Tilgungsdarstellung ersetzt keine völlig fehlende oder durchgehend falsche Schöpfungsdarstellung. Sinnvolle richtige Teildarstellungen zählen; einzelne Rechen- oder Detailfehler lösen diese Grenze nicht aus.',
'If either the creation/repayment relationship or the link between rate effects and the symmetric medium-term inflation target is wholly absent or consistently wrong across both cases, cap the total at 14. Isolated arithmetic/detail errors do not trigger the cap.',
'Cap the total at 14 if the loan/deposit creation in case A is wholly absent or consistently wrong. The same limit independently applies if the repayment relationship in case B is wholly absent or consistently wrong, or if the link between rate effects and the symmetric medium-term inflation target is wholly absent or consistently wrong in both cases. Correct repayment does not replace entirely absent or consistently wrong creation. Meaningful correct partial explanations count; isolated arithmetic or detail errors do not trigger this limit.'),
'd2e3a826-53d0-55c9-92eb-2522ae73f2bb':(
'Wenn in beiden Fällen entweder die modellgestützte Produktion-/Beschäftigungsbeziehung vollständig fehlt/durchgehend falsch ist oder die eigenständige Diagnose und multiperspektivische Mechanismenabwägung insgesamt vollständig fehlen, höchstens 14 Punkte. Sinnvolle unvollständige Darstellungen beider Kernleistungen lösen diese Begrenzung nicht aus.',
'Höchstens 14 Punkte gelten, wenn die modellgestützte Produktion-/Beschäftigungsbeziehung in beiden Fällen vollständig fehlt oder durchgehend falsch erklärt wird. Unabhängig davon gilt diese Grenze, wenn die eigenständige Auswahl und Begründung plausibler Ausgangsursachen in beiden Fällen vollständig fehlt oder durchgehend falsch ist. Eine richtige Maßnahmenabwägung ersetzt keine vollständig fehlende Ausgangsdiagnose. Ebenfalls höchstens 14 gelten, wenn die multiperspektivische Mechanismenabwägung insgesamt vollständig fehlt oder durchgehend falsch ist. Sinnvolle richtige Teildiagnosen, unvollständige Mechanismenabwägungen und andere begründete Ursachen- oder Politikurteile zählen; einzelne Rechen- oder Detailfehler lösen die Begrenzung nicht aus.',
'If either the model-based output/employment relationship is entirely absent or consistently wrong in both cases, or independent diagnosis and multiperspective mechanism-based evaluation are wholly absent overall, award at most 14. Meaningful incomplete demonstrations of both core performances do not trigger this limit.',
'Award at most 14 if the model-based output/employment relationship is wholly absent or consistently wrong in both cases. Independently apply this limit if independent selection and justification of plausible initial causes is wholly absent or consistently wrong in both cases. Correct policy evaluation does not replace entirely absent initial diagnosis. The same limit applies if multiperspective mechanism-based evaluation is wholly absent or consistently wrong overall. Meaningful correct partial diagnoses, incomplete mechanism-based evaluations and differently justified causal or policy judgments count; isolated arithmetic or detail errors do not trigger the limit.'),
'5caf53b7-c603-58ed-b5f2-3d47e1c98141':(
'Ebenso höchstens 14, wenn historische Problem-/Annahmenanalyse und heutige interessengeleitete Fiskal-/Public-Choice-Verwendung insgesamt vollständig fehlen.',
'Unabhängig davon gelten höchstens 14, wenn die historische Problem-/Annahmenanalyse vollständig fehlt oder durchgehend falsch ist. Dieselbe Grenze gilt gesondert, wenn die angewandte Fiskal-/Public-Choice-Perspektive im aktuellen Fall vollständig fehlt oder durchgehend falsch ist, oder wenn die fallbezogene Analyse der dokumentierten interessengeleiteten Theorieverwendung vollständig fehlt oder durchgehend falsch ist. Eine richtige historische Analyse ersetzt keine vollständig fehlende aktuelle Perspektiven- oder Interessenanalyse; richtige unvollständige Leistungen zählen.',
'The same limit applies if historical problem/assumption analysis and current interested fiscal/public-choice use are entirely absent overall.',
'Independently apply the same limit if historical problem/assumption analysis is wholly absent or consistently wrong. Separately apply this limit if the applied fiscal/public-choice perspective in the current case is wholly absent or consistently wrong, or if the case-based analysis of documented interested use of theory is wholly absent or consistently wrong. Correct historical analysis does not replace entirely absent current perspective or interest analysis; correct incomplete performances count.')}
deltas=[]
for m in new:
 if m['id'] not in policies:continue
 od,nd,oe,ne=policies[m['id']]
 for fld,prev,nxt in [('taskContent',od,nd),('solutionContent',od,nd),('taskContentEn',oe,ne),('solutionContentEn',oe,ne)]:
  s=m['examData'][fld];assert s.count(prev)==1,(m['id'],fld,s.count(prev));m['examData'][fld]=s.replace(prev,nxt)
  deltas.append({'materialId':m['id'],'field':'examData.'+fld,'exactBefore':prev,'exactAfter':nxt})
changed=[m['id'] for m,o in zip(new,old) if m!=o];assert set(changed)==set(policies)
for m,o in zip(new,old):
 a=copy.deepcopy(m);b=copy.deepcopy(o)
 for f in ('taskContent','solutionContent','taskContentEn','solutionContentEn'):a['examData'].pop(f);b['examData'].pop(f)
 assert a==b
 for f in ('taskContent','solutionContent','taskContentEn','solutionContentEn'):
  if m['id'] not in policies:assert m['examData'][f]==o['examData'][f]
dump(N/'whole-nine-current-macro-materials.only-three-core-scoring-successors.DRAFT-author-v4.json',new)
dump(N/'actual-twelve-DEEN-text-paragraph-only-scoring-deltas.json',deltas)
# Exact current baseline and current profiles; no whole-old-frame overwrite.
canp=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';can=json.loads(canp.read_text());assert len(can['goals'])==524
(N/'whole-current524.before.exact.json').write_bytes(canp.read_bytes())
inp=json.loads((O/'whole-twelve-current504-macro-contracts-and-qualified-original-P24.exact-intake.json').read_text()); cg={x['id']:x for x in can['goals']}
book=json.loads((R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json').read_text());dump(N/'actual-current-book-config-before.exact.json',book)
ps=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current524-six-qualified-110-20261010-v10/whole-current336-original-positive-profiles685cases-no-profile-or-input-change.jsonl'; prs={x['goalId']:x for x in map(json.loads,ps.read_text().splitlines())}
current=[]
for x in inp:
 gid=x['wholeGoal']['id'];assert cg[gid]==x['wholeGoal'];assert prs[gid]==x['wholePositiveRecord'];current.append(x)
dump(N/'whole-twelve-current524-contracts-and-original-P24.exact-reused.json',current)
candidate=copy.deepcopy(can);assert all(m['id'] not in cg for m in new);candidate['goals'].extend(new)
dump(N/'whole-current524-plus-nine-current-DRAFT533.no-nav-or-view-approval.inert-author-v4.json',candidate)
# Exact foreign counterworks, replayed as foreign evidence, not falsely counted as own works.
B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-macro-twelve-whole-science-independent-b-v1'
workp=B/'actual-thirty-own-whole-submissions120-manual-rubric-decisions-and-three-real-bypasses.json'; allw=json.loads(workp.read_text()); rows=[]
for w in allw['works']:
 if w['workId'].startswith('real-'):
  assert w['materialId'] in policies and w['finalPoints']>=15
  rows.append({'originalWholeForeignWork':copy.deepcopy(w),'originalInput':ref(workp),'authorAppliedNewLimit':14,'newTotal':min(w['rawPoints'],14),'newResult':'FAIL','why':{'1a56a8a7-c81f-5dd2-94ac-93bc6cba8eab':'Case A creation consistently wrong, independently of correct repayment.','d2e3a826-53d0-55c9-92eb-2522ae73f2bb':'Both independent initial diagnoses wholly absent, independently of correct evaluation.','5caf53b7-c603-58ed-b5f2-3d47e1c98141':'Entire applied current fiscal/public-choice and documented interested-use work absent, independently of correct history.'}[w['materialId']],'authorReplayNotIndependentNewScience':True})
assert len(rows)==3;dump(N/'actual-three-exact-original-foreign-whole-bypasses.author-replay14-FAIL.json',rows)
dump(N/'actual-current524-fieldwise-impact-and-boundaries.json',{'role':'AUTHOR_ONLY_SCORING_FOLLOWUP','newPracticeMaterialCount':9,'actuallyChangedNewMaterialBodies':3,'changedTextFields':12,'allSixForeignKEEPWholeMaterialsExact':True,'allTwelveOrdinaryGoalsWholeExact':True,'allTwelveOriginalP24WholeExact':True,'all336OrdinaryGoalsP685Unchanged':True,'factsTasksOutsideExactParagraphsRubricPointsRequiresCoverageTagsStatusExact':True,'passingPointsAllRetained':15,'maxPointsAllRetained':24,'navViewsSourceRegistryQAAssetsWrites':0,'existing524WholeGoalsExact':True,'existingBookOwnerComparisonPerformed':False,'whole533SourceHashChanges':True,'newMaterialNativeSEMSourceFpMustBindFinalQualifiedBodies':True,'foreignScoringFollowupPending':True,'strictGain':0,'baseCanonical':ref(canp),'baseP':ref(ps),'originalForeignReceipt':ref(B/'actual-final-nine-macro-whole-material-six-KEEP-three-REVISE-independent-b.handoff.receipt.json')})
dump(N/'actual-initial-scoring-candidate-files.json',{'wholeNine':ref(N/'whole-nine-current-macro-materials.only-three-core-scoring-successors.DRAFT-author-v4.json'),'whole533':ref(N/'whole-current524-plus-nine-current-DRAFT533.no-nav-or-view-approval.inert-author-v4.json'),'current12P':ref(N/'whole-twelve-current524-contracts-and-original-P24.exact-reused.json')})
print(str(N));print(sha(N/'whole-nine-current-macro-materials.only-three-core-scoring-successors.DRAFT-author-v4.json'))
