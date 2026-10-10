#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import json, pathlib, hashlib, datetime, collections
R = pathlib.Path('/home/enpasos/projects/skillpilot')
B = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
A = B / 'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1'
C = B / 'chemie-b008-C11-current-G1-competence-source-context-author-20261010-v1'
O = B / 'chemie-b008-current517-native-context-independent-b-20261010-v1'
def read(p): return json.loads((R/p).read_text())
def ref(p):
    b=(R/p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(name,obj):
    p=R/O/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return ref(O/name)
entry=read(A/'author-current517.final.entry.json')
expected={'author-current517.final.entry.json':'30524e0cc1e9de3a915f841b7ea969ac738d325b042e552b50a1bf1753fc7360','author-current517.final.freeze.json':'12c3a906ac9f56e6b4f1e1494d1149b69823c51b5c3cc144342b4d6430709688'}
for p,h in expected.items(): assert ref(A/p)['sha256']=='sha256:'+h
assert ref(C/'author-current-C11-G1.final.entry.json')['sha256']=='sha256:fe3ae92a92d7afe7ea73bb3b05b45ddb81f60490362af67513f592a55c505904'
assert ref(C/'author-current-C11-G1.final.freeze.json')['sha256']=='sha256:bdf0ce13adc6b759c218e69dea93426bcac78f7cab605dc9ed33212f82cac9a7'
whole=A/'candidate/whole517.inactive.machine-content-final-learner-copy-author.json'
assert ref(whole)['sha256']=='sha256:aeecc72676eed63a59336a6a7e67c9a8a87f7a13ee937864f66a48a8d156eee2'
goals={g['id']:g for g in read(whole)['goals']}; assert len(goals)==517
excluded={'pageNumber','navigationOrder','treeOrder','pageFingerprint'}
diff=read(A/'checks/whole398-native-before-after-all-page-deltas.actual.json')
changed=[]; exact=[]; changes=[]
for r in diff['wholePageComparisons']:
    old=r['wholeBeforePage'];new=r['wholeCurrentPage'];keys=[k for k in set(old)|set(new) if k not in excluded and old.get(k)!=new.get(k)]
    if keys: changed.append(r['goalId']); changes.append({'goalId':r['goalId'],'title':new['title'],'changedFields':sorted(keys)})
    else: exact.append(r['goalId'])
assert len(changed)==14 and len(exact)==384
pr=read(A/'checks/P25-plus-protected12-whole-profile-and-normal-context-candidate-bindings.json')
profileproof=[]; fps=[]
for r in pr['whole37Records']:
    old=r['oldWholeScientificRecord'];new=r['newWholeTechnicalCandidateRecord']
    assert old['profile']==new['profile']
    assert old['status']==new['status']=='needs_human_review'
    assert old['reviewAuthority']==new['reviewAuthority']=='ai_candidate'
    assert old['evidenceLevel']==new['evidenceLevel']=='E1' and old['maximumClaimScope']==new['maximumClaimScope']=='G1'
    fields=[k for k in set(old)|set(new) if old.get(k)!=new.get(k)]
    if old['reviewInputFingerprint']!=new['reviewInputFingerprint']:fps.append(r['goalId'])
    profileproof.append({'goalId':r['goalId'],'wholeScientificProfileExact':True,'changedRecordFields':sorted(fields),'oldReviewInputFingerprint':old['reviewInputFingerprint'],'currentReviewInputFingerprint':new['reviewInputFingerprint']})
assert len(profileproof)==37 and len(fps)==4
assert {x[:8] for x in fps}=={'75e2eff1','5b1bb5d9','9fc800d1','6c7ce93c'}
bindings=read(A/'checks/fourteen-genuine-whole-role-reasons-and-current-normal-bindings.json')
selected=[r for r in bindings['wholeBindings'] if r['requiredFinalIndependentCurrentContextReview']]
assert len(selected)==14
kind=[]
for r in selected:
    g=goals[r['goalId']]
    if g.get('examData'): k='practiceAssessment';reason='Eigene vollständige Aufgabe mit Lösung, obligatorischen Leistungsbelegen und numerischem Raster; terminale Prüfung, kein neues Inhaltslernziel.'
    elif g['id'].startswith('442c31c5'):k='programStructure';reason='Fachweite Navigationswurzel; contains erweitert den Einstieg, ohne eine neue assessable Kompetenz zu formulieren.'
    elif g.get('contains'):k='practiceAssessment';reason='Bündelt lokale Prüfungen beziehungsweise Übungswege; die neue contains-Kante verändert den Navigationsumfang, nicht den Prüfungscharakter.'
    else:k='curricularAtomic';reason='Die beobachtbare Frage-, Quellen-, Dokumentations- beziehungsweise Modellhandlung bleibt derselbe zusammenhängende Inhalt; die neue Voraussetzung ändert die didaktische Route.'
    assert k==r['independentBOriginalWholeRoleReason']['semanticKind']
    kind.append({'goalId':g['id'],'semanticKind':k,'currentDecision':'keep_current_role','ownReasonDe':reason,'priorRoleReasonsInherited':True})
assessment=[]
for g in goals.values():
    if g['id'][:8] in ['2f53dea4','ab315f52','7bfe515c','b406eff8','eed5eda3']:
        e=g['examData'];s=e['scoring'];steps=s['steps'];assert sum(x['points'] for x in steps)==s['maxPoints'];assert e['reviewStatus']=='released'
        assert g['requires']==e['coveredGoalIds'];assert '0 BE für diesen gesamten Schritt' in e['taskContent'];assert '0 BE für diesen gesamten Schritt' in e['solutionContent']
        ceiling=max(s['maxPoints']-x['points'] for x in steps);assert ceiling<s['passingPoints']
        artifact=R/e['sourceArtifactPath'];assert artifact.read_text().endswith(e['taskContent']+'\n')
        assessment.append({'goalId':g['id'],'coveredGoalIds':e['coveredGoalIds'],'maxPoints':s['maxPoints'],'passingPoints':s['passingPoints'],'highestMissingStepCeiling':ceiling,'missingRequiredDimensionCannotNumericallyPass':True,'scienceReviewInherited':'Existing sealed five-assessment/A01/SC01 science; current actual task, solution, metadata and numeric obligations inspected. No new host acceptance.'})
assert len(assessment)==5
src=B/'chemie-b008-phase-local-inquiry-model-society-terminal-author-20261010-v1/inputs/nine-frozen-source-scope-extracts.exact.json';sj=read(src)
assert len(sj['selectedGoalIds'])==9 and len(sj['operators'])==21
assert set(sj['selectedGoalIds'])=={i for x in assessment for i in x['coveredGoalIds']}
for x in sj['operators']: assert x['wholeDutyApproval']==x['wholeCourseApproval']==x['humanApproval']==False
audit=put('inspection/own-exactness-and-current-metadata.actual.json',{'schemaVersion':1,'reviewer':'Independent current B','whole':ref(whole),'whole398':{'changedCount':14,'unchangedCount':384,'changes':changes,'metadataExcluded':sorted(excluded)},'whole37':{'profileBodiesChanged':0,'reviewInputFingerprintsChanged':fps,'records':profileproof},'fourteenKindRecommendations':kind,'fiveActualAssessments':assessment,'nineWholeDuties21SourceOperators':{'input':ref(src),'goalCount':9,'operatorCount':21,'partialAndCourseLimitsInherited':True,'noNewSourceClearance':True}})
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
context={
'75e2eff1':{'decision':'keep_current_context','reasonDe':'Die selbst formulierte prüfbare Frage und bedingte Vorhersage ist der Einstieg, nicht die gesamte Versuchsdurchführung. Orientierung ist als Einstieg tragfähig; Teilchen-/Löse- und Bräunungsimpulse sind in den Fällen gegeben. Kontrollierte Bedingungen und Gegenbefund bleiben verlangt; die Antwort nennt keine eigenen Messungen.'},
'9fc800d1':{'decision':'keep_current_context','reasonDe':'R1/R2 sind bereitgestellte Daten mit offener Herkunfts-/Zeitinformation. Die Person muss selbst strukturieren und fehlende Metadaten offen lassen. Eine vorherige eigene Untersuchung ist deshalb für diese Dokumentationsroute nicht notwendig. Kalibration/Einheiten werden bereitgestellt; Faktor-2/4-Korrektur bleibt nachvollziehbare Dokumentation. Diese Route belegt keine eigene Erhebung.'},
'5b1bb5d9':{'decision':'keep_current_context','reasonDe':'Die Quellen enthalten die benötigten chemischen Aussagen und Bezugsgrößen. Quellenerschließung kann nach Orientierung beginnen, ohne schon die ganze obere Recherchekompetenz vorauszusetzen. Das kanonische ODER bleibt erhalten; auf BY C9 NTG verlangt die zusätzliche Route tatsächlich vorgegebene UND selbst recherchierte, geöffnete und gelesene Quellen sowie eigenes Such-/Zitierprodukt.'},
'6c7ce93c':{'decision':'keep_current_context_with_explicit_bounds','reasonDe':'Dalton vermittelt Atomerhaltung und die Unterscheidung von empirischem Gesetz, Hypothese und begrenztem Teilchenmodell. Diese Grundlage ist für den hier gewählten kanonischen Übergang zu eigener Modellwahl und Modellkritik sachlich passend. Dalton allein liefert keine Ion-/Dipol-, Gleichgewichts- oder Enzymkenntnisse: die konkreten Karten-/Ladungsregeln und Beobachtungen sind im jeweiligen Fall gegeben; Spezialmodelle behalten eigene Ziele. Die Kante ist eine didaktische Route, kein Nachweis, dass jede frühe source-spezifische Modellhandlung universell Dalton voraussetzt. Frühere BY-C8/C9-Teilbeiträge bleiben bis zur geprüften Stufen-/target-Entscheidung partiell. Analog ODER digital für den unteren Kern; der gewählte digitale Fall verlangt eigene Implementation und alle sechs Tests. Der obere UND-Umfang bleibt vollständig.'}}
first={'schemaVersion':1,'role':'FIRST sealed genuinely independent current native/context B judgement','sealedAt':now,'provider':'OpenAI','model':'Codex GPT-6 agent; exact model revision not exposed','currentPeerVerdictsReadBeforeSeal':False,'currentReviewerAVerdictsReadBeforeSeal':False,'currentRootSupplementVerdictsReadBeforeSeal':False,'blindScope':'Current final whole517 native/context round and current e5 G1 decision. Historical already-valid science and original role/source comparisons explicitly inherited, not rerun.','neutralInputs':[ref(A/'author-current517.final.entry.json'),ref(A/'author-current517.final.freeze.json'),ref(C/'author-current-C11-G1.final.entry.json'),ref(C/'author-current-C11-G1.final.freeze.json')],'wholeCandidate':ref(whole),'nativeGroups':{'current20':20,'current6':6,'protected12':12},'nativeD38Decision':'keep all 38 current bilingual descriptions/context as AI candidates; main e5 bundle has no P profile, so recommendation create refers to the separately reviewed current G1 candidate.','fourCurrentChangedPBindings':context,'actualAffectedPdfPagesInspected':ref(O/'inspection/actual-page-renders.json'),'inspectionExactness':audit,'fourteenCurrentKindDecisions':kind,'whole37PDecision':'All 37 complete profile scientific bodies retained exactly; changed four current bindings accepted for their bounded current route. Other 33 profile science/context decisions are inherited exact evidence, not fresh historical reviews.','fiveAssessmentsMetadataDecision':'Current released means machine content review only; actual required own work, alternative methods, incomplete section zero rules, passing floors and source/course holds survive. Final learner copy supplies NTG11 programme information and keeps technical holds outside the learner task.','C11e5':{'decision':'accept_current_E1_G1_competence_candidate_only','fullGoalReviewed':True,'wholeCasesReviewed':2,'freshTransfersReviewed':2,'requiredExpectations':['social','cultural','technological','historical','ecological','economic','empirical-validity'],'reasonDe':'Die zwei vollständigen Ozon-/Ammoniakfälle verlangen sechs konkrete Einflussdimensionen und eine eigenständige Bewertung von Ressourcen, Interessen und Grenzen. Die unabhängigen Transfers betreffen einen populären Beitrag ohne Messmethode sowie die Forderung nach ausschließlich positiven Ergebnissen; sie prüfen Gültigkeit und gesellschaftliche Wirkung an geänderter Struktur. Primärquellen, ausdrücklich modellhafte Zusatzkarten und eigene Folgerungen bleiben getrennt. Amtlich trägt C11.1.11 fünf benannte Dimensionen im NTG11-Programm; historische Perspektive und empirische Gültigkeit sind begründete erhaltene Operationalisierungen, nicht zusätzliche behauptete Amtswörter.','officialProgramme':'Chemie 11 (NTG)','officialCourseLevel':'unspecified','coursePlacementDecision':'HOLD unchanged; no GK/LK equivalence and no SourceAtlas fallback','heldAssessmentId':'eed5eda3-2daf-5d48-b935-23dadd622d9b','heldAssessmentPSelected':False,'positiveSelectionByThisReviewer':False,'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1'},'primarySourcesActuallyRead':['https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie','https://ozone.unep.org/20-questions-and-answers','https://www.unep.org/ozonaction/who-we-are/about-montreal-protocol','https://www.basf.com/global/en/who-we-are/history/chronology/1902-1924/1913','https://www.fhi.mpg.de/history'],'blockingCurrentScienceFindings':[],'scopeLimits':['No new national source/course clearance.','Own author responses are expected answers, not learner performance.','No human approval/trial or coach-host acceptance.','Independent P candidate does not decide C11 course/source applicability.','Normal D record checks remain to be run; this FIRST does not preclaim them.'],'operativeWrites':[],'gitGithubWrites':[],'activeGain':0,'math807Physics478':'Protected floors; outside review scope.'}
f=put('FIRST.current517-native-and-C11-G1.independent-b.json',first)
put('FIRST.current517-native-and-C11-G1.independent-b.freeze.json',{'schemaVersion':1,'sealedAt':now,'first':f,'currentPeerReadBeforeSeal':False})
print(json.dumps(f));print('AUDIT',audit['sha256'])
