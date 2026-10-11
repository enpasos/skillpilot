"""Assemble own inert DRAFT texts, never mutate live curriculum files."""
import runpy,json,hashlib,uuid
from pathlib import Path
O=Path(__file__).resolve().parent
globals().update(runpy.run_path(str(O/'author_twelve_whole_finance_integration_market_materials.py')))
for part in ('author_cases_integration_games.py','author_cases_competition_common_good_innovation.py'):
 exec(compile((O/part).read_text(),str(O/part),'exec'),globals())
assert len(SPEC)==12 and len({s['prefix'] for s in SPEC})==12
SOURCE_URLS={r['key']:r['requestedURL'] for r in json.loads(Path('/tmp/skillpilot-finance12-B-primary-20261010/actual-fetch-index.json').read_text())}
def build(s):
 g=ROWS[s['prefix']]['wholeGoal'];gid=g['id'];phase=g['dimensionTags']['phase']
 mid=str(uuid.uuid5(uuid.NAMESPACE_URL,'https://skillpilot.org/economics/current555-local-finance12/'+gid+'/two-case-v1'))
 sharedde=('**Rahmen und Bewertung.** Alle konkreten Zahlen, Personen, Organisationen und Entscheidungsfälle sind eigene erfundene Unterrichtsmodelle, soweit eine Quellenkarte nicht ausdrücklich einen datierten amtlichen Befund bezeichnet. Bearbeite beide unabhängigen Fälle mit je drei fachlichen Aufträgen. Insgesamt 24 Punkte, bestanden ab 15. Begründete alternative Urteile und nachvollziehbare Teilleistungen werden anerkannt; Verständnis kann an jeder passenden Stelle der Arbeit gezeigt werden. Es gibt keine Mindestpunktzahl je Auftrag und keine Fehlerfreiheits-, Wortlaut- oder zusätzliche Aufgabenquote. Für den vollständigen Leistungsvertrag muss die Kernleistung in beiden unterschiedlichen Anwendungen erkennbar werden: Fehlt in einer Variante vollständig '+s['essentialAbsentDe']+' oder wird sie durchgehend dem Material widersprechend ausgeführt, ist das gesamte Ergebnis auf höchstens 14 begrenzt. Ein einzelner Fehler, ein fehlendes Detail, eine vertretbare Gegenposition oder eine tatsächlich erkennbare unvollkommene Kernleistung löst diese Grenze nicht aus. Dieselbe Leistung wird nur einmal bepunktet; fehlende Evidenz wird nicht ergänzt. Quellenstand der selbst gelesenen amtlichen Karten: 10.10.2026.\n\n')
 shareden=('**Scope and grading.** All concrete figures, people, organisations and decisions are own invented teaching models unless a source card explicitly identifies a dated official observation. Work through both independent cases with three subject tasks each. Total 24 points, pass 15. Defensible alternative judgements and reasoned partial work are accepted; understanding can be shown anywhere appropriate in the submission. There is no task-specific minimum, perfection requirement, required wording or extra task quota. The whole performance contract requires recognisable core performance in both different applications: if one variation wholly lacks '+s['essentialAbsentEn']+' or consistently contradicts the supplied material on that core, the overall result is capped at 14. An isolated error, missing detail, defensible counterposition or recognisable imperfect core performance does not trigger the cap. Credit the same performance once and do not invent missing evidence. Official cards were read by the author on 10 October 2026.\n\n')
 tasksde=[];tasksen=[];solutionsde=[];solutionsen=[];steps=[]
 for ci,c in enumerate(s['cases']):
  tasksde.append('**Fall '+c['label']+'**\n\n'+c['dossierDe']+'\n\n'+'\n\n'.join(str(i+1)+'. '+t for i,t in enumerate(c['taskDe'])))
  tasksen.append('**Case '+c['label']+'**\n\n'+c['dossierEn']+'\n\n'+'\n\n'.join(str(i+1)+'. '+t for i,t in enumerate(c['taskEn'])))
  solutionsde.append('**Fall '+c['label']+' – nachvollziehbare Lösung**\n\n'+'\n\n'.join(str(i+1)+'. '+t for i,t in enumerate(c['solutionDe'])))
  solutionsen.append('**Case '+c['label']+' – reasoned solution**\n\n'+'\n\n'.join(str(i+1)+'. '+t for i,t in enumerate(c['solutionEn'])))
  for ti,r in enumerate(c['rubricDe']):steps.append({'id':'s'+str(ci*3+ti+1),'points':4,'description':c['label']+str(ti+1)+': '+r})
 links='\n\n'.join('['+key+']('+SOURCE_URLS[key]+')' for key in s['sources'])
 sourcesde=('\n\n**Amtliche Quellenanker.**\n\n'+links) if links else '\n\n**Herkunft.** Vollständig eigene Modellregeln und erfundene Daten; keine reale Rechts-/Produkt-/Politikpflicht wird behauptet.'
 sourcesen=('\n\n**Official source anchors.**\n\n'+links) if links else '\n\n**Origin.** Entirely own model rules and invented data; no actual legal, product or policy requirement is asserted.'
 return {'id':mid,'title':phase+': '+s['title'],'titleEn':phase+': '+s['titleEn'],
 'description':'Die lernende Person kann das Ziel „'+g['title']+'“ in zwei unabhängigen materialgestützten Fällen nachvollziehbar anwenden, die gegebenen Regeln und Daten erklären sowie begründete Entscheidungen und ihre Grenzen darstellen.',
 'descriptionEn':'The learner can apply the goal “'+g['titleEn']+'” in two independent material-based cases, explain the supplied rules and evidence, and present reasoned decisions with their limits.',
 'weight':1,'tags':g['tags']+['Practice','Assessment'],'contains':[],'requires':[gid],
 'dimensionTags':{'framework':'canonical-gymnasium-economics','demandLevel':'AB3','phase':phase},'phase':phase,'type':'atomic','extendedData':{'applicabilityFromRequires':True},
 'examData':{'reviewStatus':'draft','coveredGoalIds':[gid],'coveredStrands':[g['title']],'demandLevels':['AB1','AB2','AB3'],
 'taskContent':sharedde+'\n\n'.join(tasksde)+sourcesde,'taskContentEn':shareden+'\n\n'.join(tasksen)+sourcesen,
 'solutionContent':'Bewerte die ganze Arbeit anhand der sechs Rasterfelder und der eng begrenzten Kernleistungsregel; die folgenden Lösungen sind mögliche sachliche Wege, keine einzig zulässigen Formulierungen.\n\n'+'\n\n'.join(solutionsde),
 'solutionContentEn':'Grade the whole submission using the six rubric fields and narrowly bounded core-performance rule; these solutions are defensible routes, not the only accepted wording.\n\n'+'\n\n'.join(solutionsen),
 'scoring':{'maxPoints':24,'passingPoints':15,'steps':steps}}}
M=[build(s) for s in SPEC]
(O/'whole-twelve-local-finance-integration-market.DEEN-two-real-cases.DRAFT-author-v1.json').write_text(json.dumps(M,ensure_ascii=False,indent=2)+'\n')
(O/'twelve-individual-whole-contract-core-and-case-author-decisions.json').write_text(json.dumps({'role':'AUTHOR only; no foreign scientific or scope approval','rows':[{'goalId':ROWS[s['prefix']]['goalId'],'newMaterialId':m['id'],'phase':m['phase'],'courseTags':ROWS[s['prefix']]['wholeGoal']['tags'],'wholeCaseCount':2,'actualSubjectTaskCount':6,'wholeGoalAndPUnchanged':True,'requiresExactlyAssessedGoal':True,'coveredExactlyAssessedGoal':True,'essentialAbsentDe':s['essentialAbsentDe'],'essentialAbsentEn':s['essentialAbsentEn'],'sources':s['sources'],'wholeCases':s['cases']} for s,m in zip(SPEC,M)]},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actualBodies':len(M),'wholeCases':24,'subjectTasks':72,'DRAFT':all(m['examData']['reviewStatus']=='draft' for m in M),'sha256':hashlib.sha256((O/'whole-twelve-local-finance-integration-market.DEEN-two-real-cases.DRAFT-author-v1.json').read_bytes()).hexdigest()}))
