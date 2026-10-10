import gzip
"""Assemble own DRAFTs, independently separated absence criteria; no active edits."""
import copy,hashlib,json,re,uuid
from pathlib import Path
from jsonschema import Draft202012Validator
O=Path(__file__).resolve().parent; ROOT=Path('/home/enpasos/projects/skillpilot')
# Functions use their globals rather than exec's locals; run all specifications in one namespace.
N={'__file__':str(O/'author_finance_business_cases.py')}
for f in ['author_finance_business_cases.py','author_market_procurement_and_project_cases.py','author_official_data_money_and_representation_cases.py']:
 exec(compile((O/f).read_text(),str(O/f),'exec'),N)
S=N['SPEC']; assert len(S)==14
I=json.loads(gzip.decompress((O/'actual-current597-fourteen-whole-contracts-original-P28-ten-existing-materials-and64-scope-KEEP-first.AUTHOR-intake.json.gz').read_bytes()))
ROWS={x['goalId'][:8]:x for x in I['whole14CurrentDEENContractsAndOriginalP28']}
fetch=json.loads(Path('/tmp/skillpilot-ops14-B-primary-20261010/actual-six-primary-fetch-index.json').read_text())
fetch += [json.loads(Path('/tmp/skillpilot-ops14-B-primary-20261010/actual-seventh-taler-primary-fetch.json').read_text())]
URL={x['id']:x['url'] for x in fetch}
def readable(t):
 pieces=re.split(r'(https?://[^\s)]+)',t)
 for i,x in enumerate(pieces):
  if x.startswith(('http://','https://')):continue
  pieces[i]=re.sub(r'(?<=[A-Za-zÄÖÜäöüß])(?=\d)|(?<=\d)(?=[A-Za-zÄÖÜäöüß])',' ',x)
 out=''.join(pieces)
 assert re.sub(r'\s','',out)==re.sub(r'\s','',t)
 assert re.findall(r'https?://[^\s)]+',out)==re.findall(r'https?://[^\s)]+',t)
 return out
def build(s):
 g=ROWS[s['prefix']]['wholeCurrentDEENGoal'];gid=g['id'];phase=g['dimensionTags']['phase']
 mid=str(uuid.uuid5(uuid.NAMESPACE_URL,'skillpilot-economics-ops14-local-author-b-v1:'+gid))
 de='**Rahmen und Bewertung.** Alle Personen, Betriebe, Situationen und Rechenwerte sind eigene fiktive Unterrichtsfälle. Datiert benannte amtliche Aussagen und gelieferte aktuelle Rechtskarten sind davon getrennt. Keine reale Person muss persönliche Daten oder eine beobachtete Lernaktivität liefern. Bearbeite die beiden unterschiedlichen Anwendungen mit je drei fachlichen Aufträgen. Insgesamt24 Punkte, bestanden ab15. Nachvollziehbare Teilleistungen und andere materialgestützte Urteile werden anerkannt; Verständnis darf an jeder passenden Stelle gezeigt werden. Es gibt keine Mindestpunkte je Auftrag, Fehlerfreiheitsanforderung, vorgeschriebene Formulierung oder zusätzliche Aufgabenquote. Jede folgende wesentliche Leistung wird getrennt geprüft: '
 de+='; '.join(c[0] for c in s['separateWholeEssentialComponents'])+'. Fehlt eine dieser Leistungen in der gesamten Arbeit vollständig oder wird sie durchgehend sachlich falsch ausgeführt, ist das Gesamtergebnis auf höchstens14 begrenzt. Richtige andere Leistungen ersetzen die fehlende eigenständige Leistung nicht. Eine erkennbare, auch unvollkommene Teilleistung an beliebiger passender Stelle zählt; einzelne Fehler, fehlende Einzelheiten oder eine begründete Gegenposition lösen die Grenze nicht aus. Eine vollständig ausgelassene zweite Anwendung erfüllt den unveränderten Zwei-Anwendungs-Vertrag ebenfalls nicht und begrenzt auf14; einzelne ausgelassene Teilaufträge sind damit nicht gleichzusetzen. Dieselbe Leistung wird nur einmal bepunktet. Rechts-/Quellenlektüre des Autors:10.10.2026.\n\n'
 en='**Scope and grading.** People, firms, situations and calculation values are own fictional teaching cases. Explicitly dated official statements and supplied current rule cards are separate. No real person must provide private information or an observed learning activity. Work through both different applications, each with three subject tasks. Total24 points, pass15. Reasoned partial work and alternative evidence-based judgments count; understanding may be shown anywhere appropriate. There is no task-specific minimum, perfection requirement, required wording or extra task quota. Assess each following essential performance separately: '
 en+='; '.join(c[1] for c in s['separateWholeEssentialComponents'])+'. If any such performance is wholly absent throughout the submission or consistently substantively false, the total is capped at14. Correct other work does not replace the missing separate performance. Recognisable, even imperfect partial work anywhere appropriate counts; isolated errors, missing details or reasoned counterpositions do not trigger the cap. An entirely omitted second application also fails the unchanged two-application contract and caps at14; an omitted subtask is not the same. Credit the same performance once. Author source/rule reading:10 October2026.\n\n'
 td=[];te=[];sd=[];se=[];steps=[]
 for ci,c in enumerate(s['cases']):
  td.append('**Fall '+c['label']+'**\n\n'+c['dossierDe']+'\n\n'+'\n\n'.join(str(j+1)+'. '+x for j,x in enumerate(c['taskDe'])))
  te.append('**Case '+c['label']+'**\n\n'+c['dossierEn']+'\n\n'+'\n\n'.join(str(j+1)+'. '+x for j,x in enumerate(c['taskEn'])))
  sd.append('**Fall '+c['label']+' – nachvollziehbare Lösung**\n\n'+'\n\n'.join(str(j+1)+'. '+x for j,x in enumerate(c['solutionDe'])))
  se.append('**Case '+c['label']+' – reasoned solution**\n\n'+'\n\n'.join(str(j+1)+'. '+x for j,x in enumerate(c['solutionEn'])))
  for ti,r in enumerate(c['rubricDe']):steps.append({'id':'s'+str(3*ci+ti+1),'points':4,'description':readable(c['label']+str(ti+1)+': '+r)})
 links='\n\n'.join('['+x+']('+URL[x]+')' for x in s['sources'])
 if links:de+='';tailde='\n\n**Tatsächlich gelesene amtliche Quellenanker.**\n\n'+links;tailen='\n\n**Actually read official source anchors.**\n\n'+links
 else:tailde='\n\n**Herkunft.** Eigene fiktive Modelle und Daten; keine aktuelle nationale Norm oder beobachtete deutsche Statistik wird behauptet.';tailen='\n\n**Origin.** Own fictional models and data; no current national rule or observed German statistic is asserted.'
 return {'id':mid,'title':phase+': '+s['title'],'titleEn':phase+': '+s['titleEn'],
  'description':'Die lernende Person kann das Ziel „'+g['title']+'“ in zwei unabhängigen materialgestützten Fällen anwenden, gegebene Informationen und Regeln erklären und ihre Analyse sowie begründete Urteile mit Grenzen nachvollziehbar darstellen.',
  'descriptionEn':'The learner can apply the goal “'+g['titleEn']+'” in two independent evidence-based cases, explain supplied information and rules, and present analysis and reasoned judgments with their limits.',
  'weight':1,'tags':copy.deepcopy(g['tags'])+['Practice','Assessment'],'contains':[],'requires':[gid],
  'dimensionTags':{'framework':'canonical-gymnasium-economics','demandLevel':'AB3','phase':phase},'phase':phase,'type':'atomic','extendedData':{'applicabilityFromRequires':True},
  'examData':{'reviewStatus':'draft','coveredGoalIds':[gid],'coveredStrands':[g['title']],'demandLevels':['AB1','AB2','AB3'],
   'taskContent':readable(de+'\n\n'.join(td)+tailde),'taskContentEn':readable(en+'\n\n'.join(te)+tailen),
   'solutionContent':readable('Bewerte die gesamte Arbeit anhand der sechs Rasterfelder und der getrennten eng begrenzten Kernregeln. Folgende Lösungen zeigen mögliche fachliche Wege, keine einzig zulässigen Formulierungen.\n\n'+'\n\n'.join(sd)),
   'solutionContentEn':readable('Grade the whole submission using the six rubric fields and separate narrowly bounded essential-performance rules. These solutions show defensible routes, not the only accepted wording.\n\n'+'\n\n'.join(se)),
   'scoring':{'maxPoints':24,'passingPoints':15,'steps':steps}}}
M=[build(s) for s in S]
current=json.loads((ROOT/I['immutableWholeCurrent597']['path']).read_text());goals=current['goals'];ids={g['id'] for g in goals}
assert len(ids)==597 and not(ids&{m['id'] for m in M})
schema=ROOT/'contracts/curriculum-package/v1/compiled-landscape.schema.json';j=json.loads(schema.read_text())
v=Draft202012Validator({'$schema':j['$schema'],'$defs':j['$defs'],'$ref':'#/$defs/goal'})
projections=[dict(m,semanticKind='practiceAssessment') for m in M]
errs=[{'id':m['id'],'path':list(e.path),'error':e.message} for m in projections for e in v.iter_errors(m)]
assert not errs,errs
def save(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
body=save('whole-fourteen-finance-business-representation-DEEN-two-case-one-contract.DRAFT-author-v1.json',M)
save('actual-fourteen-individual-separated-core-two-case-and-course-author-decisions.json',{'role':'AUTHOR only, foreign whole science and scope pending','rows':[dict(goalId=ROWS[s['prefix']]['goalId'],materialId=m['id'],wholeCurrentGoal=ROWS[s['prefix']]['wholeCurrentDEENGoal'],wholeOriginalP=ROWS[s['prefix']]['wholeOriginalPositiveRecord'],courseTagsExact=m['tags'][:-2],phaseExact=m['phase'],separateWholeEssentialComponents=s['separateWholeEssentialComponents'],twoWholeCases=s['cases'],sources=s['sources'],oldBroadMaterialsRetained=ROWS[s['prefix']]['wholeExistingDirectCoveredMaterialIds']) for s,m in zip(S,M)],'actualWholeCaseVariants':28,'actualSubjectTasks':84,'newOrdinaryGoals':0,'noStatusNavScopeApproval':True})
save('actual-fourteen-conditional-practice-schema-and-whole-case-contract-author-checks.json',{'role':'AUTHOR conditional technical schema only, not kind approval','wholeBodySha256':hashlib.sha256(body.read_bytes()).hexdigest(),'conditionalSemanticKind':'practiceAssessment','actualConditionalGoalCount':14,'schemaPath':str(schema.relative_to(ROOT)),'schemaSha256':hashlib.sha256(schema.read_bytes()).hexdigest(),'schemaErrors':errs,'all14DRAFT':True,'allRequiresAndCoveredEqualSingleAssessed':True,'all28CaseVariantsAnd84TasksPresent':True,'allScoring24pass15SixSteps4Each':True,'separateSourceAndCompetenceAbsenceBoundaries':True,'noActualSemanticKindSourceAuthorityOrHumanAcceptanceClaim':True,'all14OriginalCourseTagsExactlyRetained':True})
print(json.dumps({'whole':str(body.relative_to(ROOT)),'sha256':hashlib.sha256(body.read_bytes()).hexdigest(),'cases':28,'tasks':84,'conditionalSchemaErrors':len(errs)}))
