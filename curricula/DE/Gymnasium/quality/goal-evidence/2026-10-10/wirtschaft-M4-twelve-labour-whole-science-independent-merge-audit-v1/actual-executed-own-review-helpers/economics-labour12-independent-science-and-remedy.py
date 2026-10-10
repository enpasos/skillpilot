import pathlib,json,hashlib,copy,shutil
R=pathlib.Path('/home/enpasos/projects/skillpilot');Q='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
D=R/(Q+'wirtschaft-M4-twelve-labour-society-one-contract-local-whole-material-author-b-v1');O=R/(Q+'wirtschaft-M4-twelve-labour-whole-science-independent-merge-audit-v1')
def bind(p):
 p=pathlib.Path(p);p=p if p.is_absolute() else R/p;raw=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def write(n,x):(O/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
intake=json.loads((O/'actual-whole-twelve-labour-original-DEEN-goals-P24-and-bodies.independent-intake.json').read_text());rows=intake['wholeGoalsPAndBodies'];w=json.loads((O/'actual-thirtysix-whole-labour-independent-two-case-submissions432-criterion-decisions.json').read_text())['allWorks']
H=D/'one-real-income-and-education-distribution-separated-essential-author-successor-v3/actual-final-one-real-income-and-education-separate-whole-boundary.author-handoff-v3.json';h=json.loads(H.read_text());old=json.loads((R/h['wholePredecessor12']['path']).read_text());new=json.loads((R/h['wholeFinal12']['path']).read_text())
assert bind(h['wholePredecessor12']['path'])==h['wholePredecessor12'] and bind(h['wholeFinal12']['path'])==h['wholeFinal12']
diff=[]
def compare(a,b,p):
 if type(a)!=type(b):diff.append({'member':p,'before':a,'after':b});return
 if isinstance(a,dict):
  assert a.keys()==b.keys()
  for k in a:compare(a[k],b[k],p+'/'+k)
 elif isinstance(a,list):
  assert len(a)==len(b)
  for i,(av,bv) in enumerate(zip(a,b)):compare(av,bv,p+'/'+str(i))
 elif a!=b:diff.append({'member':p,'before':a,'after':b})
compare(old,new,'/materials')
assert [x['member'] for x in diff]==['/materials/4/examData/taskContent','/materials/4/examData/taskContentEn']
for d in diff:assert d['before'].split('\n\n',1)[1]==d['after'].split('\n\n',1)[1]
rationales=[
'Solis and Nivo vary concrete timing and information/protection problems under actual§80/87. Whole tasks and marks require forms/functions plus independent worker and firm judgments and conditional lawful transfer, not universal veto or protected-rule waiver.',
'The GKV and pension cases separately distinguish fresh dated primary models from law/observations. Actual funding and distribution mechanisms plus alternative burdens are assessed in both fictional periods. All amounts recomputed; each required branch/source perspective is individually protected.',
'Historical social roles and contemporary care/access conditions genuinely vary. Actual rates distinguish application from selection and population admissions; social expectations never prove innate ability. Policy access mechanisms and alternative evidence are demanded and fair choices remain open.',
'At least two supplied teaching lenses compare the same platform and school problems, their focus and limits. No attributed literal theorist quotation, compulsory named-theorist quota, universal individual diagnosis or causal proof is fabricated.',
'Whole goal explicitly describes income AND educational distribution with bounded causes. Original income-only plus valid causal discussion work reaches20 while all actual educational distribution is absent; original generic resource-OR-opportunity cap does not protect the separate entire dimension. Requires targeted REVISE, not perfect table/quotation demand.',
'Global permanent relocation and temporary demand cases distinguish structural causes and fitting measures. Actual ILO employment/search/availability versus German register/programme rules and distinct denominators are independently checked; conditional difference4indexpoints is not guaranteed causal impact.',
'Actual individual/collective parties, binding/scope, favourable variation, real work dependency and law-constrained organisation are assessed in two changed situations. Both employee and employer organisational judgments are essential, with no blanket published-tariff applicability.',
'Both applications distinguish individual,economic and societal meanings of work and concrete involuntary insecurity from voluntary protected training. Care/civic work are not collapsed into inactivity, health/blame are not inferred, and observed indexes do not establish sole cause.',
'Actual reviewer-written simulated records distinguish observation, own guided activity, interview and advertising. Criteria-based assessment and multiple revisable biographies are required in both settings. No actual completed placement, personal disclosure or statutory admission guarantee is claimed.',
'Job requirements are distinct from personal/team performance. All own pay computations are exact; worker and firm judgments separately address concrete incentives/distribution/control and preserved floor/base pay. Alternative conditional weights remain valid.',
'Culture practices link plausibly to motivation while motivation differs from satisfaction. Recomputed repeated-cross-section indicators and business revenue/cost/profit conflict support bounded causal judgments, not guaranteed success or same-person tracking.',
'Both supplied cross-sections require distinct work,family/household and education changes. Overlap,capability versus actual access/use and participation versus completion are explicitly separated; none implies automatic moral ranking or unique causal explanation.'
]
decisions=[]
for i,r in enumerate(rows):
 decisions.append({'materialId':r['material']['id'],'goalId':r['wholeCurrentGoal']['id'],'wholeCurrentGoal':r['wholeCurrentGoal'],'wholeOriginalP':r['wholeOriginalP'],'wholeOriginalMaterial':r['material'],'actualWholeDEENTaskSolutionRubricAndPRead':True,'originalDecision':'REVISE' if i==4 else 'KEEP','independentWholeContractRationale':rationales[i],'actualFullWork':w[i],'actualFairWork':w[12+i],'actualCoreCounterwork':w[24+i],'actualPrimarySourceApprovalOnlyForSuppliedBoundedFacts':True,'scopeNavStatusOrHumanApproval':False})
original={'role':'INDEPENDENT original whole twelve scientific decisions; actual36own works, not author tests','wholeOriginalBodies':h['wholePredecessor12'],'decisions':decisions,'wholeKEEP':11,'wholeREVISE':1,'strictGain':0}
write('actual-original-twelve-labour-eleven-whole-KEEP-one-entire-education-absence-REVISE.independent.json',original)
# Independently regrade the very same original complete20 work, with unchanged manual marks.
regrade=copy.deepcopy(w[28]);assert regrade['rawPoints']==20 and regrade['actualOriginalPassAt15']
regrade.update({'actualFinalV3Points':14,'actualFinalV3PassAt15':False,'actualV3SeparateEducationBoundaryTriggered':True,'oldWholeAnswersAndIndividualMarksExact':True})
extra=[]
def added(kind,ans,marks,capReason=None):
 assert len(ans)==len(marks)==6;raw=sum(sum(v) for v in marks);score=min(raw,14) if capReason else raw
 extra.append({'materialId':new[4]['id'],'kind':kind,'sixWholeWrittenAnswers':ans,'twelveIndividualMarks':marks,'rawPoints':raw,'actualWholeV3BoundaryReason':capReason,'actualFinalPoints':score,'passAt15':score>=15,'reviewerWorkOnly':True})
full=w[4]['sixWholeWrittenAnswers']
added('independent-entire-income-distribution-absent-mirror-counterwork',[
'Ich lasse jede tatsächliche Beschreibung der gegebenen Einkommensverteilung vollständig aus. Keine Mittelwerte, Streuung oder Anteile der L/M-Daten erscheinen anderswo. Die ganze Dimension wird bewusst nicht geleistet.',
'Arbeitsstunden, Qualifikationen und Zugang zu Stellen könnten monatliche Einkommensbeträge verändern. Keine Ursache ist ohne Vergleich gesichert; aus einer Gruppe folgt kein individuelles Versagen. Ich beschreibe dabei weiterhin keine tatsächliche Einkommensverteilung.',
'Ich würde Stunden und Entgelt gleicher Tätigkeit bei ähnlichen Qualifikationen sowie reale Zugangswege untersuchen. Vermögen und notwendige Kosten bleiben zusätzliche mögliche Bedingungen; passende Ausgangs-/Zeitvergleiche wären nötig. Vorhandene L/M-Verteilung wird nicht dargestellt.',
full[3],full[4],full[5]],[[0,0],[2,2],[2,2],[2,2],[2,2],[2,2]],'Die gesamte konkrete Einkommensverteilung fehlt; zutreffende Bildungs-/Zugangsverteilung und Ursachenprüfung ersetzen sie nicht.')
added('independent-fair-education-distribution-anywhere-no-subtask-quota',[
'L/M haben beide2000 Mittelwert, aber L spannt1000bis3000,M1800bis2200; niedrige Werte sind ungleich verteilt. Der fiktive1500Marker ist kein gesetzliches Armutsmaß; weitere Lebensbedingungen fehlen.',
'Stunden und Ausbildung können Beträge verändern; ihre Ursache ist aus den Tabellen nicht bewiesen. Zugang könnte auch eine Rolle spielen, ohne eindeutige Individualdiagnose.',
'Diesen Teilauftrag lasse ich aus. Eine passende Ursachenprüfung zeige ich ausdrücklich bei B3; ich liefere keinen perfekten separaten A-Prüfplan.',
'Auch diesen Antwortplatz nutze ich nicht für eine eigene Tabelle. Tatsächliche Bildungswerte werden bei B2 nachvollziehbar dargestellt; Antwortposition ist nicht gleich Kompetenz.',
'Zur Bildungs-/Zugangsverteilung: R hat80%Abschlüsse gegen50%inS, also30Prozentpunkte Abstand. Beratung erreicht70%versus30%,40Punkte. Das sind Gruppenanteile, keine Angabe, ob dieselbe Person Beratung und Abschluss hat. Beratung könnte Information verändern; Zeit/Verkehr und frühere Leistungen könnten ebenfalls wirken, nicht angeborene Gruppenfähigkeit.',
'Ich würde individuelle Vorleistungen, tatsächliche Beratungsteilnahme und spätere Abschlüsse bei passenden Gruppen über Zeit vergleichen. Auswahl und andere Änderungen können verzerren. Die konkrete unterschiedliche Bildungsverteilung und eine begrenzte Ursachenprüfung sind damit gezeigt, trotz vollständig ausgelassenem A3.'],[[1,2],[1,2],[0,0],[2,2],[2,2],[2,2]])
added('independent-fair-partial-distributions-with-omitted-detail',[
'L und M mitteln2000. L hat die größere Spanne2000 gegen400; ich berechne die genaue niedrige Quote nicht. Gleiche Mittelwerte sind nicht gleiche Einkommen oder gesamte Ressourcen.',
'Stunden, Qualifikation und Zugang könnten Unterschiede erklären, nicht die Tabelle selbst. Ich benenne keine endgültige Ursache und keine persönliche Schuld.',
'Vergleichbare Stundenentgelte und Tätigkeiten mit Zugangsbedingungen prüfen; Vermögen/Kosten und Auswahl fehlen. Der Plan bleibt kurz.',
'R80% und S50% mit Abschluss unterscheiden sich um30Punkte; Beratung70%gegen30%. Ich schreibe den zweiten Abstand nicht aus, verwechsle aber keine individuelle Verknüpfung mit einer Gruppentabelle.',
'Erreichbare Beratung kann Wege öffnen, Zeit/Verkehr können Zugang begrenzen. Vorleistungen und Selbstselektion bleiben alternative Ursachen.',
'Vorherige individuelle Bedingungen, tatsächliche Beratung und spätere Abschlüsse vergleichen; passende Vergleichsgruppen und Vortrends wären nötig. Kein sicheres Ursache-/Begabungsurteil folgt.'],[[1,2],[1,2],[1,2],[1,2],[2,1],[2,1]])
assert extra[0]['rawPoints']==20 and extra[0]['actualFinalPoints']==14
assert extra[1]['passAt15'] and extra[1]['rawPoints']==18
assert extra[2]['passAt15'] and extra[2]['rawPoints']==18
write('actual-one-real-labour-two-field-remedy-three-whole-new-works-and-original20-regrade.independent.json',{'role':'INDEPENDENT actual bounded remedy comparison and newly written fair/counterworks','wholeAuthorSuccessorHandoff':bind(H),'wholeFinalBodies':h['wholeFinal12'],'actualChangedFields':diff,'otherElevenWholeBodiesExact':True,'allExamTasksAfterFirstParagraphSolutionsRubricsPointsRequiresCoveredTagsDraftStatusExact':True,'old20CounterworkActuallyRegraded':regrade,'actualThreeNewWholeWorks':extra,'actualNewCriterionDecisions':36,'actualPrior432ManualDecisionsReusedUnchanged':True,'totalDistinctReviewerWrittenWorks':39,'totalManualCriterionDecisions':468,'meaningfulPartialAnywhereCounts':True,'noTaskQuotaOrPerfectWorkDemand':True,'scientificSuccessorDecision':'KEEP'})
for item in [H,R/h['wholeFinal12']['path']]:
 dest=O/'whole-inputs'/item.relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists();shutil.copyfile(item,dest)
base=json.loads((R/intake['inputBindings'][2]['path']).read_text());assert len(base['goals'])==597
before=copy.deepcopy(base);base['goals']+=new;assert base['goals'][:597]==before['goals'] and len({g['id'] for g in base['goals']})==609
write('whole-current609-final-twelve-labour-V3-DRAFT-only-independent-schema-input.inert.json',base)
write('actual-final-twelve-labour-current-contract-P24-and-whole-material-individual-scientific-decisions.independent.json',{'role':'INDEPENDENT bounded whole scientific KEEP; not course/source/human release','wholeOriginalDecisionHistory':bind(O/'actual-original-twelve-labour-eleven-whole-KEEP-one-entire-education-absence-REVISE.independent.json'),'wholeFinalBodies':h['wholeFinal12'],'actualWholeKEEPCount':12,'decisions':[{'materialId':m['id'],'goalId':m['examData']['coveredGoalIds'][0],'scientificDecision':'KEEP','wholeFinalMaterial':m,'wholeCurrentGoal':rows[i]['wholeCurrentGoal'],'wholeOriginalP':rows[i]['wholeOriginalP'],'rationale':rationales[i] if i!=4 else 'Exactly two task DE/EN essential boundaries now independently protect income and education/access. Original20education-absent and separate20income-absent works cap14; genuine18anywhere/no-A3 and18partial distribution works PASS. Other task text, solutions, points, originalP and allotherfields remain exact.','basis':'Actual original complete whole science reused for11; bounded actual two-field remedy independently read for1','draftStatusRetained':m['examData']['reviewStatus']=='draft'} for i,m in enumerate(new)],'actualActiveWrites':0,'newOrdinaryGoalsOrProfileCases':0,'newMemoryOrImages':0,'strictGain':0,'scopeNavStatusSourceMappingSEMOrHumanApproval':False})
print(json.dumps({'actualTwoFieldDelta':len(diff),'wholeScienceKEEP':12,'actualOriginal20Now':14,'newFairPASS':[extra[1]['rawPoints'],extra[2]['rawPoints']],'wholeSchemaInputGoalCount':609,'actualDistinctWholeWorks':39,'actualManualMarks':468}))
