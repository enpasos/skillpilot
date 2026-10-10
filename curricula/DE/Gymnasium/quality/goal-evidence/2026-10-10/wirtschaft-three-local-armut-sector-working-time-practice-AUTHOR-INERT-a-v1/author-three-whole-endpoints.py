from pathlib import Path
import json, copy, hashlib, datetime, uuid

ROOT = Path.cwd()
OUT = Path(__file__).parent
OUT.mkdir(exist_ok=True)
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(name, value):
    p = OUT / name
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    json.loads(p.read_text())
    return str(p.relative_to(ROOT))

CAN = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
REG = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
can = json.loads(CAN.read_text())
goals = {g['id']: g for g in can['goals']}
registry = json.loads(REG.read_text())
subject = next(s for s in registry['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
IDS = ['543bf91f-f6c6-5b1b-ba9e-43de321d8c7f', 'f1f73ebe-286a-52e8-a2e1-4383ece6e9ec', 'dd38e0c5-d77b-5893-815c-548ea2a84429']
records = {}
bindings = []
for config_path in subject['positiveEvidenceConfigPaths']:
    config = json.loads(Path(config_path).read_text())
    for line in Path(config['reviewPath']).read_text().splitlines():
        record = json.loads(line)
        if record['goalId'] in IDS:
            assert record['goalId'] not in records
            records[record['goalId']] = record
            bindings.append({'goalId':record['goalId'], 'configPath':config_path, 'configSha256':sha(config_path), 'reviewPath':config['reviewPath'], 'reviewSha256':sha(config['reviewPath']), 'wholeRecordLineSha256':hashlib.sha256(line.encode()).hexdigest()})
assert set(records) == set(IDS)
snapshot_path = write('three-whole-current-qualified-P-v2-records.EXACT.json', [records[g] for g in IDS])

# Ten material-specific criteria, two points each. Complete case demands and
# model answers are taken literally from current qualified P bodies, without
# adding another ordinary competence or a task quota.
rubrics = {
IDS[0]: [
 ('A1', 'Armutsquote R/S jeweils 40 % auf gleicher Grenze und Bezugsbevölkerung bestimmen.', 'Establish incidence of 40% in both regions with the same line and reference population.'),
 ('A2', 'Normierte Einkommenslücke R 12 %, S 8 % berechnen und gleiche Quote von unterschiedlicher Tiefe unterscheiden.', 'Calculate normalised gaps of 12% and 8%, distinguishing equal incidence from different depth.'),
 ('A3', 'Wasser-/Schulmängel und ohne Überschneidungsdaten die möglichen Bereiche R 30–50 %, S 35–55 % begründen.', 'Explain water/schooling deprivations and the possible ranges R 30–50%, S 35–55% without overlap data.'),
 ('A4', 'Abweichende monetäre und nichtmonetäre Befunde zu ihrem jeweiligen Messgegenstand erklären.', 'Explain different monetary and nonmonetary findings through the quantities measured.'),
 ('A5', 'Das pauschale Gleicharmuts-/Gesamtrangurteil anhand fehlender Gewichtung/Überschneidung sachgerecht begrenzen.', 'Limit blanket equal-poverty or overall-ranking claims using absent weighting and overlap information.'),
 ('B1', 'Nominale t1-Einkommen 108/180 auf real 90/150 umrechnen und äquivalente nominale Grenze 120 erkennen.', 'Convert nominal incomes 108/180 to real 90/150 and recognise the equivalent nominal line of 120.'),
 ('B2', 'Quote 40→30 % sowie 10 Prozentpunkte gegenüber 25 % relativer Veränderung unterscheiden.', 'Distinguish incidence falling from 40% to 30%, ten percentage points, and a 25% relative change.'),
 ('B3', 'Normierte Tiefe 10→3 % berechnen und die unverändert nominale Grenze 100 als unpassenden Vergleich begründen.', 'Calculate depth falling from 10% to 3% and explain why an unchanged nominal line of 100 is inappropriate.'),
 ('B4', 'Unveränderten Wasser-/Schulmangel 25 %/20 % mit verbesserten monetären Indikatoren vereinbar erklären.', 'Explain how unchanged water/schooling deprivation of 25%/20% coexists with improved monetary indicators.'),
 ('B5', 'Gruppenvergleich aus unverknüpften Querschnitten von unbewiesenen individuellen Einkommensverläufen trennen.', 'Separate population comparisons in unlinked cross-sections from unproved individual trajectories.')],
IDS[1]: [
 ('A1', 'Beschäftigungs- und Wertschöpfungsanteile der drei Sektoren getrennt deuten.', 'Interpret the three sectors’ employment and value-added shares separately.'),
 ('A2', 'Niedrigere durchschnittliche Landwirtschaftsproduktivität gegenüber Industrie/Dienstleistungen begründen; qualitative Erklärung reicht, zusätzliche Quotientenformel nicht verlangt.', 'Explain lower average agricultural productivity than industry/services; a qualitative explanation suffices and no extra ratio formula is required.'),
 ('A3', 'Produktivere Landwirtschaft und Übergang zu anderen Tätigkeiten als unterschiedliche bedingte Wachstumspfade analysieren.', 'Analyse more productive agriculture and movement into other activities as distinct conditional growth paths.'),
 ('A4', 'Die gegebenen Qualifikations-/Transportengpässe und Aufnahmefähigkeit anderer Sektoren in die Pfadbegründung einbeziehen.', 'Use supplied skills/transport bottlenecks and other sectors’ absorption capacity in the path analysis.'),
 ('A5', 'Sektordurchschnitt von individueller Produktivität und automatisch inklusiver Entwicklung abgrenzen.', 'Distinguish sector averages from individual productivity and automatically inclusive development.'),
 ('B1', 'Absolute landwirtschaftliche Wertschöpfung korrekt von 30 auf 36 ermitteln.', 'Correctly establish absolute agricultural value added rising from 30 to 36.'),
 ('B2', 'Sinkenden Anteil 30→24 % bei steigendem absolutem Output und Gesamtwachstum unterscheiden.', 'Distinguish a falling share of 30% to 24% from increasing absolute output and overall growth.'),
 ('B3', 'Dienstleistungswachstum anhand qualifizierter Stellen als bedingten Wachstumspfad analysieren.', 'Analyse services growth through skilled jobs as a conditional growth path.'),
 ('B4', 'Qualifikationszugang, fortbestehende informelle Arbeit und Teilhabegrenzen in die Analyse aufnehmen.', 'Include access to skills, persistent informal work and inclusion limits.'),
 ('B5', 'Keinen allgemeinen Haushaltswohlstandsgewinn aus bloßem Sektorwechsel folgern; Grenzen materialgebunden begründen.', 'Avoid inferring gains for every household from sector shifts alone and justify limits using the material.')],
IDS[2]: [
 ('A1', 'Stunden und VZÄ: vorher 2000/50, danach in beiden Modellen 1600/40 sachgerecht bestimmen.', 'Establish hours/FTE: initially 2000/50, then 1600/40 in both models.'),
 ('A2', '50 Köpfe bei K von 40 bei E trennen und nicht mit VZÄ gleichsetzen.', 'Distinguish 50 people in K from 40 in E, without equating headcount to FTE.'),
 ('A3', 'Wochenlöhne vorher 1000/K 800/weiterbeschäftigt E 1000, kein Betriebslohn für zehn Entlassene, unbekanntes sonstiges Einkommen berücksichtigen.', 'Use weekly firm wages of 1000 initially/800 in K/1000 for retained E workers, no firm wage for ten dismissed people, and unknown other income.'),
 ('A4', 'Beschäftigungs- und Verteilungseffekte trotz gleichem Stundenvolumen und 20 % Lohnminderung in K erklären.', 'Explain employment/distribution differences despite equal hours and the 20% wage reduction in K.'),
 ('A5', 'Nachfrage, Produktivität, Organisation, zulässige Vereinbarungen und fehlende Dauerbeschäftigungsgarantie in das bedingte Urteil einbeziehen.', 'Use demand, productivity, organisation, permitted agreements and absent long-term job guarantees in a conditional judgment.'),
 ('B1', 'Unverändert 360 Stunden/neun VZÄ/zwölf Köpfe bei bloß anderer zeitlicher Lage erklären.', 'Explain unchanged 360 hours/nine FTE/twelve people when only timing changes.'),
 ('B2', 'Unveränderten individuellen Wochenlohn 600 Euro aus 30 Stunden und 20 Euro begründen.', 'Explain unchanged weekly pay of 600 euros from 30 hours at 20 euros.'),
 ('B3', 'Fensterabdeckung: fünf unterschreiten sechs, sieben ergeben eine Reserve von einer Person; andere Fenster/Qualifikationen sind ausdrücklich gesichert.', 'Explain coverage: five is below six, seven gives one spare person; other windows/qualifications are expressly secured.'),
 ('B4', 'Tatsächlich zusätzliche Einstellung von bloßer Gleitzeit unterscheiden: 400 Stunden/zehn VZÄ/13 Köpfe.', 'Distinguish actual added hiring from flexitime alone: 400 hours/ten FTE/13 people.'),
 ('B5', 'Bessere zeitliche Passung von garantierter dauerhafter Beschäftigung/kausaler Bindung trennen und offene Nachfrage/Kosten/Umsetzung benennen.', 'Separate better timing from guaranteed lasting employment/causal retention and identify open demand/cost/implementation questions.')]
}
facets = {
IDS[0]: ('monetäre Quote; definierte Armutstiefe; nichtmonetäre Mängel; Vergleichsbedingungen; Begründung abweichender Befunde und Aussagegrenzen', 'monetary incidence; defined poverty depth; nonmonetary deprivation; comparison conditions; explanations of differing findings and claim limits'),
IDS[1]: ('Beschäftigung versus Wertschöpfung; Anteil versus absolute Produktion; bedingte Wachstumspfade; Qualifikation/Infrastruktur/Aufnahmefähigkeit; individuelle und inklusive Aussagegrenzen', 'employment versus value added; shares versus absolute production; conditional growth paths; skills/infrastructure/absorption capacity; individual and inclusion limits'),
IDS[2]: ('Arbeitsstunden und VZÄ; Beschäftigtenzahl; individuelles Einkommen und Verteilung; Dauer versus Lage der Arbeitszeit; bedingte Beschäftigungswirkungen und tatsächliche Abdeckung', 'hours and FTE; headcount; individual income and distribution; duration versus timing; conditional employment effects and actual coverage')
}
titles = {
IDS[0]: ('Armutsindikatoren in zwei vollständigen Datenfällen vergleichen', 'Compare poverty indicators in two complete data cases'),
IDS[1]: ('Sektorstrukturen und Wachstumspfade in zwei Datenfällen analysieren', 'Analyse sector structures and growth paths in two data cases'),
IDS[2]: ('Arbeitszeitwirkungen in zwei vollständigen Betriebsfällen analysieren', 'Analyse working-time effects in two complete business cases')
}
descs = {
IDS[0]: ('Die lernende Person kann in zwei vollständig bereitgestellten Datenfällen Armutsquote, definierte Armutstiefe und nichtmonetäre Mängel sachgerecht vergleichen, Preis- und Bezugsbedingungen prüfen und abweichende Befunde sowie begrenzte Gruppen- und Personenaussagen begründen.', 'The learner can compare poverty incidence, defined depth and nonmonetary deprivations in two fully supplied data cases, check price and reference conditions, and justify differing findings and the limits of population and individual claims.'),
IDS[1]: ('Die lernende Person kann in zwei vollständig bereitgestellten Datenfällen Beschäftigung und Wertschöpfung sektorbezogen analysieren, Anteile von absolutem Wachstum unterscheiden und Wachstumspfade anhand gegebener Qualifikations-, Infrastruktur- und Teilhabebedingungen begründen.', 'The learner can analyse sectoral employment and value added in two fully supplied data cases, distinguish shares from absolute growth, and justify growth paths through supplied skills, infrastructure and inclusion conditions.'),
IDS[2]: ('Die lernende Person kann in zwei vollständig bereitgestellten Betriebsfällen Arbeitsstunden, Vollzeitäquivalente, Beschäftigtenzahl und Einkommen analysieren, Dauer und zeitliche Lage der Arbeit unterscheiden und Beschäftigungswirkungen anhand der gegebenen Nachfrage- und Abdeckungsbedingungen begründen.', 'The learner can analyse hours, full-time equivalents, headcount and income in two fully supplied business cases, distinguish work duration from timing, and justify employment effects through supplied demand and coverage conditions.')
}
endpoints=[]
for gid in IDS:
    old=goals[gid];phase=old['dimensionTags']['phase'];levels=['LK'] if gid==IDS[2] else ['GK','LK'];f_de,f_en=facets[gid];r=rubrics[gid]
    assert len(r)==10 and len(records[gid]['profile']['applicationCaseBriefs'])==2
    pre_de=f'Alle Fälle und Zahlen sind fiktive Unterrichtsmaterialien. Bearbeite die beiden folgenden vollständigen Fälle. Insgesamt 20 BE, bestanden ab 12 BE; jeder der zehn ausgewiesenen Leistungsbereiche zählt bis 2 BE. Nachvollziehbare Teilleistungen und gleichwertige Darstellungen zählen, dieselbe Leistung wird nur einmal bewertet. Prüfe die ganze Kompetenz: {f_de}. Fehlt einer dieser fachlichen Aspekte in der gesamten Arbeit vollständig oder ist er durchgehend sachlich falsch, höchstens 11 BE. Einzelne Fehler, Lücken oder begründete Gegenpositionen lösen keine Begrenzung aus. Eine erkennbare fachliche Teilleistung an passender Stelle zählt. Es sind keine weiteren Aufgaben oder eine Lernendenzustimmung für Erfolg verlangt. Die gelieferten Definitionen und Modellannahmen gelten; keine zusätzliche Formel aus dem Gedächtnis wird verlangt.'
    pre_en=f'All cases and numbers are fictional teaching materials. Complete the following two complete cases. Total 20 points, pass at 12; each of the ten specified performance areas is worth up to 2 points. Reasoned partial work and equivalent representations count; credit the same work only once. Assess the whole competence: {f_en}. If one substantive aspect is wholly absent throughout the submission or consistently substantively false, cap at 11 points. Isolated errors, omissions or reasoned counterpositions do not trigger the cap; recognisable partial understanding at a relevant place counts. No further task or learner agreement is required for success. Supplied definitions and model assumptions apply; no extra formula recall is required.'
    tasks_de=[pre_de];tasks_en=[pre_en];sol_de=[];sol_en=[]
    for i,case in enumerate(records[gid]['profile']['applicationCaseBriefs'],1):
        tasks_de.append(f'**Fall {i} – 10 BE**\n\n'+case['taskDemandDe']);tasks_en.append(f'**Case {i} – 10 points**\n\n'+case['taskDemandEn']);sol_de.append(f'**Fall {i}: materialgebundene Sollleistung**\n\n'+case['expectedPerformanceDe']);sol_en.append(f'**Case {i}: evidence-based expected performance**\n\n'+case['expectedPerformanceEn'])
    sol_de.append('**Bewertungsraster**\n\n'+'\n'.join(f'{k}: 0–2 BE – {d}' for k,d,e in r)+'\n\nJe Bereich: 2 für sachlich tragfähige, hinreichend begründete Leistung; 1 für nachvollziehbare richtige Teilleistung; 0 bei fehlender oder sachlich falscher Leistung. Folgerechnungen mit begründetem eigenen Vorwert nicht nochmals bestrafen. Keine exakte Wortwahl und keine Perfektion verlangt. Maßgeblich sind die vorliegenden Materialien und die erläuterten Kriterien.')
    sol_en.append('**Scoring rubric**\n\n'+'\n'.join(f'{k}: 0–2 points – {e}' for k,d,e in r)+'\n\nFor each area: 2 for sufficiently justified, substantively valid work; 1 for a recognisable correct partial performance; 0 for missing or substantively false work. Do not penalise a justified follow-on calculation twice for the same initial error. No exact wording or perfection is required. Use the supplied material and stated criteria.')
    seed='https://skillpilot.com/canonical/economics/practice/'+gid+'/two-current-qualified-material-cases-v1'
    nid=str(uuid.uuid5(uuid.NAMESPACE_URL,seed));assert nid not in goals
    ep={'id':nid,'title':titles[gid][0],'titleEn':titles[gid][1],'description':descs[gid][0],'descriptionEn':descs[gid][1],'weight':1,'tags':['subject:Wirtschaft','canonical:gymnasium-de',*levels,'Practice','Assessment'],'contains':[],'requires':[gid],'examples':[],'type':'atomic','semanticKind':'practiceAssessment','phase':phase,'dimensionTags':{'framework':'canonical-gymnasium-economics','phase':phase,'courseLevels':levels,'demandLevel':'AB3'},'applicability':copy.deepcopy(old['applicability']),'extendedData':{'applicabilityFromRequires':True,'authorEvidenceStatus':'E1/G1 AI author candidate; needs independent whole material/rubric/scope review; no human approval','humanApproval':False,'assessmentPurpose':'Single whole existing ordinary contract; supplied current qualified P cases, not a curriculum source or SUR carrier','deterministicUUIDSeed':seed},'resourceLinks':[],'examData':{'reviewStatus':'needs_review','reviewNote':'New whole local assessment is AI-authored E1/G1 candidate with current already-qualified P case bodies; new scoring/scope requires independent qualification. No human or learner trial approval.','coveredGoalIds':[gid],'coveredStrands':[f_de],'demandLevels':['AB2','AB3'],'sourceArtifactPath':snapshot_path,'taskContent':'\n\n'.join(tasks_de),'taskContentEn':'\n\n'.join(tasks_en),'solutionContent':'\n\n'.join(sol_de),'solutionContentEn':'\n\n'.join(sol_en),'scoring':{'maxPoints':20,'passingPoints':12,'steps':[{'id':k,'points':2,'description':d} for k,d,e in r]}}}
    endpoints.append(ep)
write('three-whole-new-local-practice-goals-six-DEEN-cases-solutions-rubrics.AUTHOR-INERT.json',endpoints)
write('three-whole-current-ordinary-goals.EXACT.json',[goals[g] for g in IDS])
write('three-whole-old-broader-practices-untouched.EXACT.json',[g for g in can['goals'] if g['id'] in ['036ea7f9-2a33-502f-8729-983fa8054694','81f5e338-5720-54af-9793-a151736141f3','f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96']])

matrix_path=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current693-source-scope-and-pure-route-placement-fieldwise-COMPOSITION-INERT-v2/actual-nine-unique-visible-goals-failing-routes-and-all-existing-whole-direct-endpoints.READONLY.json')
matrix=json.loads(matrix_path.read_text());rows={r['goalId']:r for r in matrix['rows']}
clusters={IDS[0]:'5113c64b-405d-5f4b-bae9-70fe530b5e69',IDS[1]:'5113c64b-405d-5f4b-bae9-70fe530b5e69',IDS[2]:'a1c0e891-cb5b-56ef-9aa7-ac782e2099c3'}
manifest=[];cluster_cands={}
for ep,gid in zip(endpoints,IDS):
    old=goals[clusters[gid]];cl=cluster_cands.setdefault(old['id'],copy.deepcopy(old));cl['contains'].append(ep['id'])
    exactscopes=sorted(set(s.split(' [')[0] for s in rows[gid]['failedProjectionScopes']))
    manifest.append({'ordinaryGoalId':gid,'newPracticeGoalId':ep['id'],'wholeGoalCandidateFile':str((OUT/'three-whole-new-local-practice-goals-six-DEEN-cases-solutions-rubrics.AUTHOR-INERT.json').relative_to(ROOT)),'practiceClusterId':old['id'],'actualAssessedGoalIds':[gid],'actualRequires':[gid],'phase':ep['phase'],'courseLevels':ep['dimensionTags']['courseLevels'],'targetPlacementViewPaths':exactscopes,'exactFailedProjectionScopes':rows[gid]['failedProjectionScopes'],'proposedWholeGoalEntry':{'kind':'goalEntry','goalId':ep['id'],'displayLabel':ep['title'],'projectionRole':'target'},'scopeReason':'Only actual native missing ordinary-goal route scopes with genuine current supplied source performance; country+course roles explicitly authored. National projection follows same local target authority. No blanket country/LK addition or normative assessment-source claim.','actualNativeDerivedApplicabilityCaveat':'applicabilityFromRequires derives compiled country availability from the single prerequisite; authored views still decide targets. Native final CQR104 authority/expected-endpoint filter must be checked without changing compiler or widening countries blindly.'})
write('two-whole-existing-practice-clusters.BEFORE.EXACT.json',[goals[i] for i in cluster_cands])
write('two-whole-existing-practice-clusters-only-three-contains-appends.AUTHOR-INERT.json',list(cluster_cands.values()))
write('ROOT-PLAN-ready-three-goals-and-exact-existing-cluster-append-only-placement-manifest.AUTHOR-INERT.json',{'status':'INERT author handoff needs independent whole assessment review','goals':manifest,'clusterWholeCandidates':str((OUT/'two-whole-existing-practice-clusters-only-three-contains-appends.AUTHOR-INERT.json').relative_to(ROOT)),'oldClusterWeightAndAllOtherFieldsExact':True,'all693OldGoalObjectsUnchangedExceptTwoProposedContainsLists':True,'all346OrdinaryAndPAMBodiesExact':True,'noActiveWrites':True,'nativeSEMPracticeOnlyNewAndTwoClusterFPsPendingStableComposite':True,'noOrdinaryPRebindingOrScienceNeededFromTheseWholePracticeAdditions':True})
write('actual-author-three-whole-goals-six-current-qualified-case-parity-and-bindings.READONLY.json',{'actualAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'activeCanonicalBefore':{'path':str(CAN),'sha256':sha(CAN),'wholeGoals':len(can['goals'])},'activeRegistryBefore':{'path':str(REG),'sha256':sha(REG)},'currentQualifiedWholePBindings':bindings,'actualNativeMissingScopeMatrix':{'path':str(matrix_path),'sha256':sha(matrix_path)},'deterministicIds':[{'goalId':ep['id'],'seed':ep['extendedData']['deterministicUUIDSeed']} for ep in endpoints],'everyCurrentCaseTaskAndExpectedDEENVerbatimSubstringsRetained':all(all(case[k] in ep['examData'][dest] for k,dest in [('taskDemandDe','taskContent'),('taskDemandEn','taskContentEn'),('expectedPerformanceDe','solutionContent'),('expectedPerformanceEn','solutionContentEn')]) for ep,gid in zip(endpoints,IDS) for case in records[gid]['profile']['applicationCaseBriefs']),'allThreeOnlyActualAssessedGoalRequiredCovered':all(ep['requires']==ep['examData']['coveredGoalIds']==[gid] for ep,gid in zip(endpoints,IDS)),'allThreeCompleteScoring20Pass12Sum20':all(sum(s['points'] for s in ep['examData']['scoring']['steps'])==20 and ep['examData']['scoring']['maxPoints']==20 and ep['examData']['scoring']['passingPoints']==12 for ep in endpoints),'ownNoIndependentScienceApproval':True,'casesAlreadyQualifiedDoesNotQualifyNewRubricScope':True,'humanApproval':False,'M7DVCIClaim':False,'activeWrites':0})
print(json.dumps({'threeIds':[ep['id'] for ep in endpoints],'placements':[{'goalId':m['ordinaryGoalId'],'views':m['targetPlacementViewPaths']} for m in manifest]},ensure_ascii=False))
