#!/usr/bin/env python3
"""Materialize a bounded author candidate; never writes active curriculum state."""
import json
import hashlib
import unicodedata
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
PREP = OUT.parent / 'chemie-b008-inquiry-targeted-continuation-candidate-v1'
CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
BATCH = ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-09-30/batch-008-global-inquiry-communication-current-9-v1.config.json'

def read(path): return json.loads(path.read_text())
def canonical_json(value): return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def digest(value): return 'sha256:'+hashlib.sha256(canonical_json(value).encode()).hexdigest()
def byte_digest(path): return 'sha256:'+hashlib.sha256(path.read_bytes()).hexdigest()
def write(name, value):
    path=OUT/name
    assert path.parent == OUT
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

now=datetime.now(timezone.utc).isoformat()
canonical=read(CANONICAL)
goals={g['id']:g for g in canonical['goals']}
batch=read(BATCH)
ids=batch['goalIds']
frozen=read(PREP/'D-findings.frozen.json')
old_inventory=read(PREP/'current-nine-inventory.json')
national=read(PREP/'national-current-source-binding-inventory.json')
findings={g['goalId']:g for g in frozen['goals']}
old={g['goalId']:g for g in old_inventory['goals']}
FAMILY=ids
PRESENTATION='fb41c82c-12c3-5f9a-9e8d-40f10c9fade9'
LAB='416dfd33-8b43-5c49-903c-9847b95e4208'
DALTON='9b5d6326-d27c-4ece-8c72-debda705464a'
LANGUAGE='95dc0ee5-a0af-5682-af32-d66e36fbeb50'

C=[]
def atom(key,family,stage,title,en,description,description_en,requires=(),retained_id=None,alternative=False):
    row={'candidateKey':key,'id':retained_id,'shortKey':'canonical_chemistry_'+key.replace('-','_'),
         'originGoalIds':[FAMILY[family-1]],'type':'atomic','contains':[],'weight':1,
         'stageCandidate':stage,'title':title,'titleEn':en,'description':description,'descriptionEn':description_en,
         'requiresCandidateReferences':list(requires),'alternativeOnly':alternative,
         'idAssignmentStatus':'retained_id_candidate' if retained_id else 'null_until_root_adoption',
         'atomicityAuthorPosition':'one_integrated_competence_candidate_not_independent_A_approval',
         'memoryAuthorPosition':{'decision':'no_memory_needed_candidate','reasonDe':'Anwendung, Erklärung oder begründete Entscheidung im Fall; keine isolierte Abrufleistung. Aktuelle unabhängige M-Bindung bleibt erforderlich.'},
         'humanApproval':False,'readyForStrictM7':False}
    row['authorSemanticCandidateFingerprint']=digest({k:row[k] for k in ['candidateKey','id','shortKey','stageCandidate','title','titleEn','description','descriptionEn','requiresCandidateReferences','contains']})
    C.append(row)
    return key

# 91238: the full source duty is retained across the inquiry sequence and the
# documentation/model goals; simple C8 and independent C9/10 are distinguished.
atom('sek1-question-hypothesis',1,'SekI',
     'Chemische Fragen und überprüfbare Hypothesen entwickeln','Develop chemical questions and testable hypotheses',
     'Die lernende Person kann aus einem Alltagsphänomen eine chemisch untersuchbare Frage ableiten und eine begründete Hypothese formulieren, deren Vorhersage sich durch Beobachtungen oder Messungen überprüfen lässt.',
     'The learner can derive an investigable chemical question from an everyday phenomenon and formulate a justified hypothesis whose prediction can be tested through observations or measurements.')
atom('sek1-guided-investigation',1,'SekI-entry',
     'Einfache chemische Untersuchungen hypothesengeleitet durchführen','Conduct simple hypothesis-guided chemical investigations',
     'Die lernende Person kann zur Prüfung einer chemischen Hypothese eine einfache Untersuchung planen, veränderte und konstant gehaltene Einflussgrößen unterscheiden und die Untersuchung unter Anleitung sicher durchführen.',
     'The learner can plan a simple investigation to test a chemical hypothesis, distinguish variables that are changed from those kept constant, and conduct the investigation safely under guidance.',
     ['sek1-question-hypothesis',LAB])
atom('sek1-independent-investigation',1,'SekI-progressed',
     'Chemische Untersuchungen selbstständig planen und durchführen','Plan and conduct chemical investigations independently',
     'Die lernende Person kann zu chemischen Alltags- und Technikphänomenen eine hypothesengeleitete qualitative oder quantitative Untersuchung selbstständig planen und sicher durchführen, indem sie Einflussgrößen kontrolliert und geeignete Arbeitstechniken einsetzt.',
     'The learner can independently plan and safely conduct a hypothesis-guided qualitative or quantitative investigation of chemical phenomena in everyday life or technology by controlling variables and using suitable laboratory methods.',
     ['sek1-question-hypothesis',LAB])
atom('upper-theory-guided-hypothesis',1,'SekII',
     'Chemische Hypothesen theoriegeleitet begründen','Justify chemical hypotheses using theory',
     'Die lernende Person kann aus Alltagssituationen oder chemischen Beobachtungen eine naturwissenschaftlich untersuchbare Frage entwickeln und mithilfe geeigneter chemischer Konzepte und Theorien eine überprüfbare Hypothese begründen.',
     'The learner can develop a scientifically investigable question from everyday situations or chemical observations and justify a testable hypothesis using suitable chemical concepts and theories.',
     ['sek1-question-hypothesis'])
atom('upper-independent-investigation',1,'SekII',
     'Chemische Untersuchungen zur Hypothesenprüfung selbstständig gestalten','Design chemical investigations for testing hypotheses independently',
     'Die lernende Person kann zur Prüfung chemischer Hypothesen, Aussagen oder Theorien qualitative und quantitative Untersuchungen selbstständig planen und mit geeigneten Analysemethoden und Arbeitstechniken sicher durchführen.',
     'The learner can independently plan and safely conduct qualitative and quantitative investigations to test chemical hypotheses, claims, or theories using suitable analytical and laboratory methods.',
     ['upper-theory-guided-hypothesis','sek1-independent-investigation'])

# 49b13: documentation, interpretation and scrutiny of data are separate.
atom('process-data-documentation',2,'SekI+SekII-source-bounded',
     'Chemische Mess- und Recherchedaten nachvollziehbar dokumentieren','Document chemical measurements and researched data transparently',
     'Die lernende Person kann erhobene oder recherchierte chemische Daten mit Herkunft, Messgrößen, Einheiten und relevanten Untersuchungsbedingungen strukturiert dokumentieren und dabei Beobachtung und Deutung unterscheiden.',
     'The learner can document collected or researched chemical data in a structured way with their origin, measured quantities, units, and relevant investigation conditions, while distinguishing observation from interpretation.',
     [LAB])
atom('sek1-data-interpretation',2,'SekI',
     'Chemische Daten auf eine Hypothese beziehen','Relate chemical data to a hypothesis',
     'Die lernende Person kann erhobene oder recherchierte chemische Daten mit geeigneten Darstellungen und digitalen Werkzeugen, auch Tabellenkalkulation, auswerten, erkennbare Zusammenhänge unter Berücksichtigung möglicher Messfehler deuten und mit der Ausgangshypothese vergleichen.',
     'The learner can evaluate collected or researched chemical data using suitable representations and digital tools, including spreadsheets, interpret observable relationships while considering possible measurement errors, and compare them with the initial hypothesis.',
     ['sek1-question-hypothesis','process-data-documentation'])
atom('upper-quantitative-data-interpretation',2,'SekII',
     'Chemische Daten quantitativ auswerten und interpretieren','Evaluate and interpret chemical data quantitatively',
     'Die lernende Person kann erhobene oder recherchierte chemische Daten mit geeigneten mathematischen Verfahren und digitalen Werkzeugen quantitativ auswerten, Trends, Strukturen und Beziehungen interpretieren und daraus unter Einbezug fachübergreifender Bezüge begründete Aussagen zur Ausgangshypothese ableiten.',
     'The learner can evaluate collected or researched chemical data quantitatively using suitable mathematical methods and digital tools, interpret trends, structures, and relationships, and derive justified conclusions about the initial hypothesis while considering connections to other subjects.',
     ['upper-theory-guided-hypothesis','process-data-documentation','sek1-data-interpretation'])
atom('process-data-validity',2,'SekI-progressed+SekII-source-bounded',
     'Aussagekraft chemischer Daten und Fehlerquellen beurteilen','Assess the validity of chemical data and sources of error',
     'Die lernende Person kann die Gültigkeit erhobener oder recherchierter chemischer Daten begründet beurteilen, indem sie mögliche Mess- und Verfahrensfehler, Untersuchungsbedingungen sowie Grenzen und Tragweite der daraus abgeleiteten Aussagen berücksichtigt.',
     'The learner can assess the validity of collected or researched chemical data with justification by considering possible measurement and procedural errors, investigation conditions, and the limits and implications of the conclusions drawn.',
     ['process-data-documentation','sek1-data-interpretation'])

# f660: C8 inquiry development/answerability must not lose its first half.
atom('sek1-inquiry-scope-limits',3,'SekI',
     'Chemische Erkenntniswege und ihre Grenzen erläutern','Explain chemical inquiry and its limits',
     'Die lernende Person kann an einem chemischen Erkenntnisweg erklären, wie aus Fragestellung, Untersuchung, Daten und Deutung Wissen entsteht, begründen, welche Fragen chemische Methoden beantworten können, und Grenzen der gewonnenen Aussagen benennen.',
     'The learner can explain through a chemical inquiry process how questions, investigations, data, and interpretation produce knowledge, justify which questions chemical methods can answer, and identify limits of the resulting conclusions.',
     ['sek1-question-hypothesis','sek1-data-interpretation'])
atom('upper-own-inquiry-reflection',3,'SekII',
     'Den eigenen chemischen Erkenntnisprozess reflektieren','Reflect on one’s own chemical inquiry process',
     'Die lernende Person kann die eigenen chemischen Untersuchungsergebnisse und den eigenen Erkenntnisprozess reflektieren, indem sie ihre Entscheidungen, die Bedeutung der Befunde und verbleibende Unsicherheiten begründet prüft.',
     'The learner can reflect on their own chemical investigation results and inquiry process by examining their decisions, the significance of the findings, and remaining uncertainties with justification.',
     ['upper-quantitative-data-interpretation','process-data-validity'])
atom('upper-scientific-validity',3,'SekII',
     'Die Gültigkeit chemischer Erkenntnisse wissenschaftlich beurteilen','Assess the scientific validity of chemical knowledge',
     'Die lernende Person kann Möglichkeiten und Grenzen chemischer Erkenntnisgewinnung sowie die Gültigkeit ihrer Aussagen anhand von Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logischer Konsistenz und Vorläufigkeit begründet beurteilen und dabei Versuchsbedingungen und zuverlässige Beobachtungen berücksichtigen.',
     'The learner can assess the possibilities and limits of chemical inquiry and the validity of its claims using reproducibility, falsifiability, intersubjectivity, logical consistency, and provisionality, while considering experimental conditions and reliable observations.',
     ['sek1-inquiry-scope-limits','process-data-validity'])

# b632: no new presentation or discourse duplicate is introduced.
atom('sek1-source-information',4,'SekI',
     'Chemische Fragen mit passenden Quellen beantworten','Answer chemical questions using suitable sources',
     'Die lernende Person kann aus vorgegebenen oder selbst recherchierten Quellen die für eine chemische Frage relevanten Informationen auswählen, verständlich strukturieren und eine sachgerechte Antwort begründen.',
     'The learner can select information relevant to a chemical question from given or independently researched sources, structure it clearly, and justify an appropriate answer.')
atom('upper-source-information',4,'SekII',
     'Chemische Informationen aus komplexen Quellen erschließen','Extract chemical information from complex sources',
     'Die lernende Person kann zu chemischen und pharmazeutischen Fragestellungen zielgerichtet in analogen und digitalen Medien recherchieren, relevante Informationen aus auch komplexen Darstellungsformen erschließen, strukturieren und begründete Schlussfolgerungen ableiten sowie verwendete Quellen belegen und Zitate kennzeichnen.',
     'The learner can research chemical and pharmaceutical questions purposefully in analogue and digital media, extract and structure relevant information from representations including complex ones, derive justified conclusions, cite the sources used, and mark quotations.',
     ['sek1-source-information',LANGUAGE])
atom('upper-source-criticism',4,'SekII',
     'Chemische Quellen auf Eignung und Vertrauenswürdigkeit prüfen','Assess chemical sources for suitability and trustworthiness',
     'Die lernende Person kann Aussagen und Darstellungsformen verschiedener selbstständig beschaffter chemischer Quellen vergleichen und deren Eignung, Aussagekraft und Validität anhand fachlicher Relevanz, Vertrauenswürdigkeit, Urheberschaft und Intention begründet beurteilen.',
     'The learner can compare claims and representations in different independently obtained chemical sources and assess their suitability, explanatory value, and validity using scientific relevance, trustworthiness, authorship, and intention.',
     ['upper-source-information'])
atom('sek1-criteria-arguments',4,'SekI',
     'Chemische Pro- und Kontra-Argumente kriterienbezogen abwägen','Weigh chemical arguments for and against using criteria',
     'Die lernende Person kann für einen chemischen Sachverhalt relevante Bewertungskriterien erkennen und Pro- und Kontra-Argumente anhand dieser Kriterien vergleichen und begründet gegeneinander abwägen.',
     'The learner can identify evaluation criteria relevant to a chemical issue, compare arguments for and against using those criteria, and weigh them with justification.',
     ['sek1-source-information'])

# 5428: both positions remain visible, including the valid integrated source.
atom('sek1-chemistry-society-careers-keep',5,'SekI',
     goals[FAMILY[4]]['title'],goals[FAMILY[4]]['titleEn'],
     goals[FAMILY[4]]['description'],goals[FAMILY[4]]['descriptionEn'],
     ['sek1-source-information'],FAMILY[4])
atom('sek1-chemical-applications-society',5,'SekI',
     'Gesellschaftliche Bedeutung chemischer Anwendungen erläutern','Explain the social significance of chemical applications',
     'Die lernende Person kann Aufgaben und Anwendungsbereiche der Chemie an konkreten Beispielen beschreiben und deren gesellschaftliche Bedeutung fachlich begründet diskutieren.',
     'The learner can describe tasks and areas of chemical application through concrete examples and discuss their social significance with scientific justification.',
     ['sek1-source-information'],alternative=True)
atom('sek1-chemistry-career-orientation',5,'SekI',
     'Chemische Berufsfelder für die Berufswahl einordnen','Relate chemistry career fields to career choices',
     'Die lernende Person kann anhand konkreter Aufgaben und Anwendungsbereiche der Chemie typische chemische Berufsfelder einordnen und ihre Bedeutung für die eigene Berufswahl erläutern.',
     'The learner can identify typical chemistry career fields through concrete tasks and application areas and explain their relevance to their own career choices.',
     ['sek1-chemical-applications-society'],alternative=True)

# 1df178: same integrated decision competence, shorter and source complete.
atom('process-criteria-decision',6,'SekI-progressed+SekII-source-bounded',
     goals[FAMILY[5]]['title'],goals[FAMILY[5]]['titleEn'],
     'Die lernende Person kann chemische Handlungsoptionen für lebensweltliche oder gesellschaftliche Entscheidungen entwickeln und begründet abwägen, indem sie ethische, ökologische, ökonomische und sicherheitsbezogene Kriterien sowie Chancen und Risiken berücksichtigt, eine Entscheidungsstrategie anwendet und Kriterien, Strategie und Entscheidung aus chemischer Perspektive einschließlich ihrer Möglichkeiten und Grenzen reflektiert.',
     'The learner can develop and weigh chemical options for everyday or social decisions with justification by considering ethical, ecological, economic, and safety criteria together with opportunities and risks, applying a decision strategy, and reflecting on the criteria, strategy, and decision from a chemical perspective, including its possibilities and limits.',
     ['sek1-criteria-arguments'],FAMILY[5])

# b3c9: the object of the judgment changes; no silent redistribution.
atom('upper-knowledge-influences',7,'SekII',
     goals[FAMILY[6]]['title'],goals[FAMILY[6]]['titleEn'],
     'Die lernende Person kann soziale, kulturelle, technologische, historische, ökologische und ökonomische Einflüsse auf die Entwicklung naturwissenschaftlichen Wissens an chemischen Beispielen beschreiben und begründet bewerten.',
     'The learner can describe and assess social, cultural, technological, historical, ecological, and economic influences on the development of scientific knowledge through chemical examples with justification.',
     ['sek1-chemistry-society-careers-keep','upper-source-criticism'])
atom('upper-chemical-effects-sustainability',7,'SekII',
     'Gesellschaftliche Folgen angewandter Chemie nachhaltig bewerten','Assess social impacts of applied chemistry for sustainability',
     'Die lernende Person kann gesellschaftliche Relevanz und ökologische Bedeutung sowie Auswirkungen chemischer Produkte, Methoden, Verfahren und Erkenntnisse in historischen und aktuellen Zusammenhängen aus ökologischer, ökonomischer und sozialer Perspektive im Sinne nachhaltiger Entwicklung bewerten und dabei Folgen des eigenen Handelns reflektieren.',
     'The learner can assess the social relevance, ecological significance, and impacts of chemical products, methods, processes, and findings in historical and current contexts from ecological, economic, and social perspectives for sustainable development, while reflecting on the consequences of their own actions.',
     ['process-criteria-decision','upper-source-criticism'])

# 1f354: keep both C12 clauses; the problem is placement and bound context.
atom('upper-scientific-discourse-keep',8,'SekII',
     goals[FAMILY[7]]['title'],goals[FAMILY[7]]['titleEn'],
     goals[FAMILY[7]]['description'],goals[FAMILY[7]]['descriptionEn'],
     ['upper-source-information',LANGUAGE],FAMILY[7])

# 277a: generic comparison keeps the progression demand; the higher application
# contains explicit complex molecules and interactions instead of deleting them.
atom('sek1-model-selection-comparison',9,'SekI',
     goals[FAMILY[8]]['title'],goals[FAMILY[8]]['titleEn'],
     'Die lernende Person kann geeignete analoge oder digitale Modelle und Simulationen zum Aufbau der Materie und zu chemischen Vorgängen auswählen und nutzen, ihre Eignung und Aussagekraft an Beobachtungen vergleichen, Grenzen benennen und den Bedarf zur Weiterentwicklung begründen.',
     'The learner can select and use suitable analogue or digital models and simulations of the structure of matter and chemical processes, compare their suitability and explanatory value against observations, identify limits, and justify the need for further development.',
     [DALTON])
atom('upper-model-use-criticism',9,'SekII',
     'Chemische Modelle in anspruchsvollen Fragestellungen kritisch einsetzen','Use chemical models critically in demanding questions',
     'Die lernende Person kann für chemische Fragestellungen geeignete analoge und digitale Modelle sowie Simulationen auswählen und zur Prüfung von Hypothesen, Aussagen oder Theorien nutzen, auch zu Bindungen, Molekülgeometrien und Wechselwirkungen komplexer organischer Moleküle in biochemischen und pharmazeutischen Kontexten, und ihre Aussagekraft, Grenzen sowie Weiterentwicklungsbedarf begründet beurteilen.',
     'The learner can select suitable analogue and digital models and simulations for chemical questions and use them to test hypotheses, claims, or theories, including bonds, molecular geometries, and interactions of complex organic molecules in biochemical and pharmaceutical contexts, and assess their explanatory value, limits, and need for further development with justification.',
     ['sek1-model-selection-comparison','upper-theory-guided-hypothesis'])

candidate_by_key={c['candidateKey']:c for c in C}
families=[]
decisions=['split_candidate','split_candidate','split_candidate','split_with_existing_presentation_reuse_HOLD',
           'KEEP_SPLIT_DISSENT_HOLD','concise_integrated_revision_candidate','split_and_placement_repair_candidate',
           'full_discourse_KEEP_after_placement_repair_candidate','stage_bounded_model_split_candidate']
for ordinal,gid in enumerate(ids,1):
    current=goals[gid]
    before={k:current.get(field,'') for k,field in [('titleDe','title'),('titleEn','titleEn'),('descriptionDe','description'),('descriptionEn','descriptionEn')]}
    assert before == findings[gid]['before'], f'Current selected goal text drift: {gid}'
    families.append({'ordinal':ordinal,'goalId':gid,'before':before,
                     'beforeGoalEvidenceFingerprintFromFrozenD':findings[gid]['currentGoalFingerprint'],
                     'beforePageFingerprintFromFrozenD':findings[gid]['currentPageFingerprint'],
                     'currentCanonicalNodeFingerprint':digest(current),
                     'historicalDDecisions':findings[gid]['existingDDecisions'],
                     'authorDecision':decisions[ordinal-1],
                     'afterCandidateKeys':[c['candidateKey'] for c in C if gid in c['originGoalIds'] and not c['alternativeOnly']],
                     'alternativeCandidateKeys':[c['candidateKey'] for c in C if gid in c['originGoalIds'] and c['alternativeOnly']],
                     'idStrategy':'Original split ID is not assigned to a narrowed child automatically. Root must decide stable-ID/mastery migration and reverse prerequisites before adoption.' if ordinal in [1,2,3,4,7,9] else 'Existing ID retention is proposed for the same integrated competence; independent review/context adoption remains required.',
                     'readyForStrictM7':False})

write('canonical-description-structure.candidates.json',{
    'schemaVersion':1,'artifactKind':'current_source_description_structure_author_candidate',
    'createdAt':now,'status':'ai_candidate','subject':'chemie','activeMutation':False,
    'candidateAuthor':'Codex candidate author on known frozen D findings; exact deployed model identifier not exposed',
    'notIndependentBlindD2':True,'PProfilesRead':False,'PProfilesAuthored':False,
    'sourceDHasBeenAuthoredBeforeAnyPRead':True,'strictCompletionsAdded':0,
    'families':families,'candidateAtoms':C,
    'reuseWithoutDuplicate':{'presentationGoalId':PRESENTATION,
       'currentTitle':goals[PRESENTATION]['title'],
       'currentDescription':goals[PRESENTATION]['description'],
       'assignment':'C11.1.8/C12-GA.1.19/.22 overlap; reuse candidate only, not blanket exact coverage.',
       'HOLD':'Current existing goal covers investigation results, not every chemical/pharmaceutical source presentation or analogue/digital medium. Scope, media and non-result presentation clauses require explicit root decision; no outside-nine text change and no duplicate presentation atom in this packet.',
       'discourseGoalId':FAMILY[7],
       'modelComparisonRelatedGoalIds':['321d801d-28e4-54a2-bd31-8c07bda2f392','f7f35d71-927a-511c-a49e-65a66794a9bc','81373fb7-2a4a-5b2c-acd0-b4e775acaa65'],
       'modelAssignment':'Process/model criticism differs from topic-specific modeling. Existing specialist goals remain unchanged; no assertion that a general model atom alone covers them.'}})

reused=[PRESENTATION,LAB,DALTON,LANGUAGE,'321d801d-28e4-54a2-bd31-8c07bda2f392','f7f35d71-927a-511c-a49e-65a66794a9bc','81373fb7-2a4a-5b2c-acd0-b4e775acaa65']
structural=[]
for gid in ids:
    g=goals[gid]
    structural.append({'goalId':gid,'beforeCanonicalGoal':g,
       'directContainsParents':[{'goalId':x['id'],'title':x['title']} for x in goals.values() if gid in x.get('contains',[])],
       'directRequires':g.get('requires',[]),
       'directReverseRequires':[{'goalId':x['id'],'title':x['title'],'insideNine':x['id'] in ids,
                                 'candidateImpact':'No automatic rewrite. Verify what competence this dependent really requires; retain existing outside-nine node unchanged unless root separately authorizes a necessary targeted adoption.'}
                                for x in goals.values() if gid in x.get('requires',[])],
       'priorBookContext':{k:v for k,v in old[gid]['book'].items() if k not in ['resourceLinks','reviewInput']},
       'oldAFingerprint':old[gid]['atomicity'].get('currentFingerprint'),
       'oldMFingerprint':old[gid]['memory'].get('currentFingerprint'),
       'oldVisualBinding':old[gid]['visualization']})
write('current-input-graph-bindings.snapshot.json',{
    'schemaVersion':1,'checkedAt':now,'canonicalPath':str(CANONICAL.relative_to(ROOT)),
    'canonicalByteDigestAtAuthoring':byte_digest(CANONICAL),'batchPath':str(BATCH.relative_to(ROOT)),
    'inputDigests':{str(p.relative_to(ROOT)):byte_digest(p) for p in [BATCH,PREP/'D-findings.frozen.json',PREP/'current-nine-inventory.json',PREP/'national-current-source-binding-inventory.json']},
    'selectedGoals':structural,'reuseContextGoals':[goals[x] for x in reused],
    'protectedOutsideNineCount':len(goals)-len(ids),
    'protectedOutsideNineNodeFingerprints':{gid:digest(g) for gid,g in goals.items() if gid not in ids},
    'scopeGuard':'All outside-nine canonical goals, including the currently strictly complete 79, are read-only in this candidate package. This count is a parent checkpoint, not a newly verified central M7 total.'})

# Author-reviewed BY source clause routing. Source-level exact/partial edges are
# NOT automatically inherited by new goals. Destinations name obligations.
ROUTES={
 1:{'C8.1.3':['sek1-question-hypothesis','sek1-guided-investigation'],
    'C9-NTG.1.3':['sek1-question-hypothesis','sek1-independent-investigation'],
    'C10-HG_SG_MUG_WWG_SWG.1.3':['sek1-question-hypothesis','sek1-independent-investigation'],
    'C10-HG_SG_MUG_WWG_SWG.1.7':['upper-model-use-criticism'],
    'C10-NTG.1.2':['sek1-independent-investigation','process-data-documentation','sek1-data-interpretation'],
    'C10-NTG.1.3':['sek1-question-hypothesis','sek1-independent-investigation'],
    'C11.1.2':['upper-independent-investigation'],
    'C11.1.3':['upper-theory-guided-hypothesis','upper-independent-investigation','upper-model-use-criticism'],
    'C12-GA.1.8':['upper-theory-guided-hypothesis'],
    'C12-GA.1.9':['upper-independent-investigation','process-data-documentation','upper-model-use-criticism']},
 2:{'C8.1.2':['process-data-documentation','sek1-data-interpretation'],
    'C8.1.4':['sek1-data-interpretation'],
    'C9-NTG.1.2':['process-data-documentation','sek1-data-interpretation'],
    'C9-NTG.1.4':['sek1-data-interpretation','process-data-validity'],
    'C10-HG_SG_MUG_WWG_SWG.1.2':['process-data-documentation','sek1-data-interpretation'],
    'C10-HG_SG_MUG_WWG_SWG.1.4':['sek1-data-interpretation','process-data-validity'],
    'C10-NTG.1.2':['process-data-documentation','sek1-data-interpretation'],
    'C11.1.4':['process-data-validity'],'C11.1.5':['upper-quantitative-data-interpretation'],
    'C12-GA.1.7':['upper-quantitative-data-interpretation'],
    'C12-GA.1.10':['process-data-documentation','upper-quantitative-data-interpretation','upper-model-use-criticism'],
    'C12-GA.1.12':['upper-quantitative-data-interpretation'],
    'C12-GA.1.20':['upper-source-information','upper-quantitative-data-interpretation'],
    'C12-GA.1.27':['process-data-validity','upper-source-criticism'],
    'C12-GA.3.3':['process-data-validity','upper-source-criticism'],
    'C12-EA.1.10':['upper-quantitative-data-interpretation','upper-model-use-criticism'],
    'C12-EA.1.12':['upper-quantitative-data-interpretation']},
 3:{'C8.1.5':['sek1-inquiry-scope-limits'],'C9-NTG.1.5':['sek1-inquiry-scope-limits'],
    'C10-HG_SG_MUG_WWG_SWG.1.5':['sek1-inquiry-scope-limits'],
    'C12-GA.1.14':['upper-own-inquiry-reflection'],'C12-GA.1.15':['upper-scientific-validity'],
    'C12-GA.1.27':['process-data-validity'],'C12-GA.1.30':['process-criteria-decision']},
 4:{'C8.1.10':['sek1-source-information'],'C8.1.11':['sek1-criteria-arguments'],
    'C9-NTG.1.9':['sek1-source-information'],'C9-NTG.1.10':['sek1-criteria-arguments'],
    'C10-HG_SG_MUG_WWG_SWG.1.9':['sek1-source-information','REUSE:'+PRESENTATION],
    'C10-HG_SG_MUG_WWG_SWG.1.12':['sek1-source-information','sek1-criteria-arguments'],
    'C11.1.8':['REUSE:'+PRESENTATION],'C11.1.9':['upper-source-criticism'],
    'C12-GA.1.16':['upper-source-information'],'C12-GA.1.17':['upper-source-information'],
    'C12-GA.1.18':['upper-source-criticism'],'C12-GA.1.19':['REUSE:'+PRESENTATION],
    'C12-GA.1.20':['upper-source-information'],'C12-GA.1.22':['REUSE:'+PRESENTATION],
    'C12-GA.1.23':['upper-source-information','upper-source-criticism'],
    'C12-GA.1.26':['upper-source-criticism'],'C12-GA.1.27':['upper-source-criticism'],
    'C12-GA.3.3':['upper-source-criticism','process-data-validity']},
 5:{'C9-HG_SG_MUG_WWG_SWG.1.13':['sek1-chemistry-society-careers-keep'],
    'C12-GA.1.29':['process-criteria-decision'],'C12-GA.1.31':['upper-chemical-effects-sustainability']},
 6:{'C10-HG_SG_MUG_WWG_SWG.1.11':['process-criteria-decision'],
    'C10-HG_SG_MUG_WWG_SWG.1.13':['process-criteria-decision'],'C11.1.10':['process-criteria-decision'],
    'C12-GA.1.25':['process-criteria-decision'],'C12-GA.1.28':['process-criteria-decision'],
    'C12-GA.1.29':['process-criteria-decision'],'C12-GA.1.30':['process-criteria-decision'],
    'C12-GA.1.33':['upper-chemical-effects-sustainability','process-criteria-decision'],
    'C12-GA.1.34':['process-criteria-decision'],'C13-EA.1.28':['process-criteria-decision']},
 7:{'C11.1.11':['upper-knowledge-influences'],'C12-GA.1.31':['upper-chemical-effects-sustainability'],
    'C12-GA.1.33':['upper-chemical-effects-sustainability']},
 8:{'C12-GA.1.21':['upper-scientific-discourse-keep'],'C12-GA.1.24':['upper-scientific-discourse-keep']},
 9:{'C8.1.6':['sek1-model-selection-comparison'],'C8.1.7':['sek1-model-selection-comparison'],
    'C8.2.2':['sek1-model-selection-comparison'],'C9-HG_SG_MUG_WWG_SWG.1.7':['sek1-model-selection-comparison'],
    'C9-HG_SG_MUG_WWG_SWG.2.2':['sek1-model-selection-comparison'],
    'C9-NTG.1.6':['sek1-model-selection-comparison'],'C9-NTG.2.4':['sek1-model-selection-comparison'],
    'C10-HG_SG_MUG_WWG_SWG.1.6':['sek1-model-selection-comparison'],
    'C10-HG_SG_MUG_WWG_SWG.1.7':['sek1-model-selection-comparison'],
    'C11.1.3':['upper-model-use-criticism'],'C11.1.6':['upper-model-use-criticism'],
    'C12-GA.1.4':['upper-model-use-criticism','REUSE:81373fb7-2a4a-5b2c-acd0-b4e775acaa65'],
    'C12-GA.1.6':['upper-model-use-criticism'],
    'C12-GA.1.9':['upper-model-use-criticism','upper-independent-investigation','process-data-documentation'],
    'C12-GA.1.10':['upper-model-use-criticism','upper-quantitative-data-interpretation'],
    'C12-GA.1.11':['upper-model-use-criticism'],'C12-GA.1.13':['upper-model-use-criticism'],
    'C12-GA.1.25':['upper-model-use-criticism'],'C12-EA.1.10':['upper-model-use-criticism']}
}

source_rows=[]
for ordinal,gid in enumerate(ids,1):
    for binding in old[gid]['sourceBindings']:
        source=binding['source']; span=source['sourceSpan']; destinations=ROUTES[ordinal].get(span,[])
        assert destinations, (ordinal,span)
        lower=span.startswith(('C8','C9','C10'))
        live_status='targeted_primary_section_read'
        if span.startswith('C13') or span=='C12-GA.3.3': live_status='extraction_read_only_primary_clause_not_rechecked_HOLD'
        scope='SekI' if lower else 'SekII'
        if span=='C10-HG_SG_MUG_WWG_SWG.1.7' and ordinal==1:
            destinations=['sek1-model-selection-comparison']
        source_rows.append({'oldCanonicalGoalId':gid,'sourceGoalId':source['id'],'sourceSpan':span,
          'priorMatchType':binding['mapping']['matchType'],'stageFromNormativeUnit':scope,
          'courseFromExtraction':source.get('courseLevel'),
          'destinationCandidateReferences':destinations,'sourceOccurrences':source.get('sourceOccurrences',[]),
          'verification':live_status,'adoptionStatus':'HOLD_until_independent_current_source_and_D_resolution',
          'preservationNote':'Each destination covers its own clause only. Prior exact does not become exact for every split child. Topic/analysis methods, independence, actual stage, media and citation demands must survive the source-specific assignment.'})

PRIMARY=[
 ('BY-C8','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie','C8.1 expectations and contents','SekI; NTG year8','Guided entry; mainly qualitative inquiry; digital capture/spreadsheets already included; question answerability and model development present.'),
 ('BY-C9-CH','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch','C9.1.13','SekI; HG/SG/MuG/WWG/SWG year9','Applications, social significance and career choices form an explicitly connected requirement; does not settle atomicity dissent.'),
 ('BY-C9-NTG','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg','C9.1 and C9.2 model comparison','SekI; NTG year9','Increasing quantitative inquiry; familiar data independently, unfamiliar with help; error interpretation; researched sources and pro/contra comparison.'),
 ('BY-C10-CH','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch','C10.1','SekI; HG/SG/MuG/WWG/SWG year10','Independent inquiry/documentation, data validity, knowledge limits, binding models, prepared scientific sources and guided ethical decisions plus systematic action strategies.'),
 ('BY-C10-NTG','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg','C10.1','SekI; NTG year10','Independent inquiry includes complex everyday/technical phenomena, qualitative or quantitative plans, independent documentation and data interpretation.'),
 ('BY-C11','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie','C11.1','SekII; year11','Theory-guided largely independent investigation, analysis methods, error validity, spreadsheets, complex molecular/biochemical/pharmaceutical models, representation and influences on knowledge.'),
 ('BY-C12-GA','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend','C12.1.1–1.4','SekII; gA','Quantitative maths, theory and model testing, interdisciplinary data interpretation, own-process/formal validity, complex sources with citation, full discussion and standpoint exchange, sustainable impacts and decision strategy reflection.'),
 ('BY-C12-EA','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht','C12.1 corresponding digital/interpretation clauses','SekII; eA','Specific eA clauses retained; occurrences at C13 are not newly independently approved.'),
 ('NI-I','https://cuvo.nibis.de/index.php?p=download&upload=18','pp.51–61 targeted mapped inquiry/model/data/application clauses','SekI; years5–10','Read-only source helper inspected official KC2015. Inquiry questions and experiments are distinct; diagrams and error interpretation have explicit progression.'),
 ('NI-II','https://cuvo.nibis.de/index.php?p=download&upload=362','pp.12–21 targeted mapped model/discourse/inquiry/source/data clauses','SekII; EP/Q, gA/eA per clause','Read-only source helper inspected official KC2022. All23 1f354 mappings are SekII; isolated argument/reflection does not prove the complete dialogue goal.'),
 ('BW-I','https://www.bildungsplaene-bw.de/,Lde/BP2016BW_ALLG_GYM_CH.V2_IK_8-9-10_01_01','3.2.1.1 items4 and12','SekI; years8–10 V2','Read-only source helper inspected official HTML. Separation investigations and explanations of everyday/technical use must retain their content-specific claims.')]

NI=[
 ('91238','ni-chemistry-seki-kc2015-st-5-6-1-kompetenz-009-cefc90e9','sek1-question-hypothesis','SekI;5/6','simple investigable question'),
 ('91238','ni-chemistry-seki-kc2015-st-5-6-2-kompetenz-002-12e99e3c','sek1-guided-investigation','SekI;5/6','hypothesis testing experiment'),
 ('91238','ni-chemistry-sekii-kc2022-q-energie-2-kompetenz-010-eea7a7d4','upper-independent-investigation','SekII;Q;gA/eA','plan and perform suitable experiment'),
 ('91238','ni-chemistry-sekii-kc2022-q-protolyse-1-kompetenz-005-e69bf651','TOPIC_SPECIFIC_CALCULATION_HOLD','SekII;Q','concentration calculation, not an investigation routine'),
 ('49b13','ni-chemistry-seki-kc2015-st-7-8-3-kompetenz-006-9d0149df','process-data-documentation','SekI;7/8','diagram representation overlaps presentation; do not assign full source coverage mechanically'),
 ('49b13','ni-chemistry-seki-kc2015-cr-7-8-2-kompetenz-003-c3f40133','sek1-data-interpretation','SekI;7/8','measurement deviations and interpretation; also mapped to91238'),
 ('49b13','ni-chemistry-seki-kc2015-st-9-10-5-kompetenz-008-a748d8f3','TOPIC_SPECIFIC_CALCULATION_HOLD','SekI;9/10','quantity equations; must remain topic-specific'),
 ('b632','ni-chemistry-seki-kc2015-st-9-10-7-kompetenz-014-48099c71','sek1-source-information','SekI;9/10','factual checking of ingredient information; not a mandate for formal upper source criticism'),
 ('b632','ni-chemistry-sekii-kc2022-q-ggw-2-kompetenz-006-2568194e','upper-source-information+upper-source-criticism','SekII;Q;gA/eA','research and source trustworthiness'),
 ('b632','ni-chemistry-sekii-kc2022-q-energie-2-kompetenz-011-d9243b16','upper-source-information+REUSE:'+PRESENTATION,'SekII;Q;eA only','research AND presentation; eA restriction and presentation clause remain HOLD'),
 ('1f354','ni-chemistry-sekii-kc2022-ep-1-kompetenz-016-0d7f4112','upper-scientific-discourse-keep','SekII;EP;common','discussion of model limits is a partial clause, not full discourse proof'),
 ('1f354','ni-chemistry-sekii-kc2022-ep-2-kompetenz-004-06673272','upper-scientific-discourse-keep','SekII;EP;common','substance/particle-level argument is a partial clause, not full discourse proof'),
 ('277a','ni-chemistry-sekii-kc2022-ep-5-kompetenz-004-4ce22172','GENERAL_TECHNICAL_MODEL_HOLD','SekII;EP;common','schematic technical process explanation must not become complex biochemistry'),
 ('277a','ni-chemistry-sekii-kc2022-ep-1-kompetenz-016-0d7f4112','upper-model-use-criticism','SekII;EP;common','model limits; content-specific prerequisites remain required'),
 ('1df178','ni-chemistry-seki-kc2015-cr-9-10-3-kompetenz-017-07635182','process-criteria-decision','SekI;9/10','multiperspective evaluation of social relevance; does not alone cover every decision criterion'),
 ('5428','bw-chem-seki-3-2-1-1-b12-a01-303db451','APPLICATION_EXPLANATION_HOLD','SekI;8–10','everyday/technical uses explained through properties; do not substitute career or knowledge-influence judgment'),
 ('91238','bw-chem-seki-3-2-1-1-b04-a01-8362bfb0','sek1-independent-investigation','SekI;8–10','plan and conduct separation experiment; retain actual separation methods')]
targeted=[]
for prefix,sid,dest,stage,note in NI:
    matches=[row for row in national['directBindings'] if row['source']['id']==sid]
    assert matches, sid
    wanted=[row for row in matches if row['mapping']['canonicalGoalId'].startswith(prefix)]
    assert wanted, (prefix,sid)
    for row in wanted:
        targeted.append({'sourceGoalId':sid,'oldCanonicalGoalId':row['mapping']['canonicalGoalId'],
          'mappingPath':row['mappingPath'],'priorMatchType':row['mapping']['matchType'],
          'sourceSpan':row['source'].get('sourceSpan'),'courseLevel':row['source'].get('courseLevel'),
          'actualStageAndCourse':stage,'destinationObligation':dest,'note':note,
          'verification':'targeted_official_primary_source_read_by_read_only_helper',
          'adoptionStatus':'HOLD_current_independent_clause_assignment'})

write('source-requirements-and-scope-deltas.candidates.json',{
 'schemaVersion':1,'artifactKind':'bounded_current_source_clause_preservation_author_candidate','createdAt':now,
 'status':'ai_candidate','primarySources':[{'sourceKey':key,'url':url,'readSection':section,'actualScope':scope,'authorParaphrase':note} for key,url,section,scope,note in PRIMARY],
 'sourceReadLimits':'Known findings informed the author. Source helper is a read-only coauthor, not blind D2. BY section reads cover affected 8/9/10/11/12 duties; C12.3.3 and C13 individual source occurrences remain explicitly unverified. No broad independent re-review of unchanged national goals.',
 'BYDirectClauseRouting':source_rows,'targetedOtherStateClauseRouting':targeted,
 'nationalInventory':{'path':str((PREP/'national-current-source-binding-inventory.json').relative_to(ROOT)),
   'byteDigest':byte_digest(PREP/'national-current-source-binding-inventory.json'),
   'selectedDirectMappingCount':len(national['directBindings']),'perGoal':national['selectedGoalSummary'],
   'noDirectHEBindingsInCurrentSelectedMappingInputs':True,
   'claim':'1646 recorded edges are impact evidence; they are not a scientific approval. Uninspected clauses retain their source coverage obligations and remain HOLD for migration.'},
 'commonRequirements':[
   'Hypothesis must generate an observable prediction; question competence is separate from investigative execution.',
   'Documentation records where data came from and conditions; interpretation connects evidence with the hypothesis.',
   'Selection, comparison and judgment must stay tied to an actual chemical issue; finite cases are evidence, not permission to narrow normative coverage.',
   'Digital capture and spreadsheets are already present at BY C8; do not use digital tools alone as a stage divider.',
   'Model comparison includes limitations and justified development already in SekI; do not delete it as upper-only.',
   'Sources are mapped clause by clause. Source validity, presentation, argument weighing and constructive discourse do not substitute for each other.'],
 'separateRequirements':{
   'guidedEntry':'C8 mainly qualitative, guided basic work; accessible concrete everyday phenomena.',
   'progressedSekI':'C9/10 increasing quantitative planning, independent familiar work, complexity and explicit data validity; not uniformly simplified to C8.',
   'SekII':'Theory-based largely independent qual/quant investigation, mathematical methods and interdisciplinary interpretation, formal scientific validity, complex source/media work, advanced molecule interactions and complete discussion.',
   'stageSensitiveAssessment':'1df178 shared integrated wording uses source-bounded tasks: C10 guided ethical evaluation and independent action strategy; C11/C12 more independent criteria/strategy reflection. A common goal does not authorize an upper task in every lower view.'},
 'scopeDeltas':[
   {'goalId':FAMILY[6],'change':'Remove from lower chapter, place both knowledge-influence and sustainable-effect candidates in an actual reviewed upper composition/book context. No chapter rename substitutes for the placement.'},
   {'goalId':FAMILY[7],'change':'Full unchanged discussion text requires an actual SekII book path. All direct current NI rows are also SekII.'},
   {'goalId':FAMILY[2],'change':'Formal criteria and own-process reflection move to explicit SekII candidates; SekI retains knowledge development, answerability and bounded conclusion limits.'},
   {'goalId':FAMILY[8],'change':'Complex organic/biochemical/pharmaceutical requirement goes to upper candidate; lower model use/comparison/development stays intact.'},
   {'goalId':FAMILY[3],'change':'No duplicate presentation node; existing fb41 reuse stays HOLD where its current investigation-result scope is narrower than source-required presentation.'},
   {'goalId':FAMILY[4],'change':'Retain explicit KEEP versus SPLIT disagreement and normatively connected career choice; no adjudication by this author.'}],
 'notAdopted':True,'strictCompletionsAdded':0})

# Bounded candidate validation: these assertions verify artifact consistency,
# never the actual five gates or correctness of an unreviewed competency.
allrefs=[ref for c in C for ref in c['requiresCandidateReferences']]
assert all(ref in goals or ref in candidate_by_key for ref in allrefs)
for c in C:
    assert c['description'].startswith('Die lernende Person kann ')
    assert c['descriptionEn'].startswith('The learner can ')
    assert c['id'] is None or c['id'] in ids
assert len(families)==9
visited=set(); visiting=set()
def visit(key):
    assert key not in visiting, f'candidate cycle: {key}'
    if key in visited: return
    visiting.add(key)
    for ref in candidate_by_key[key]['requiresCandidateReferences']:
        if ref in candidate_by_key: visit(ref)
    visiting.remove(key);visited.add(key)
for key in candidate_by_key: visit(key)
latest=read(CANONICAL)
latest_goals={g['id']:g for g in latest['goals']}
assert all(digest(latest_goals[gid])==digest(goals[gid]) for gid in ids), 'Selected canonical input changed during authoring'
write('candidate-validation.receipt.json',{
 'schemaVersion':1,'checkedAt':now,'selectedFamilyCount':len(families),
 'selectedCandidateAtomCount':len([c for c in C if not c['alternativeOnly']]),
 'alternativeAtomCount':len([c for c in C if c['alternativeOnly']]),
 'newIdsRemainNull':True,'beforeTextsMatchCurrentCanonicalAndFrozenD':True,
 'allCandidatePrerequisiteReferencesResolved':True,'candidateInternalRequiresAcyclic':True,
 'activeCanonicalSelectedGoalsUnchangedDuringAuthoring':True,
 'protectedOutsideNineSnapshotStored':True,'noPFilesRead':True,
 'BYClauseRoutingCount':len(source_rows),'targetedNIAndBWClauseRoutingCount':len(targeted),
 'coverageValidation':'Candidate consistency only. No independent scientific source/D/P/A/M/V approval, no built book pages, no operative adoption, no central M7 increment.'})
print(json.dumps({'output':str(OUT),'families':len(families),'selectedAtoms':len([c for c in C if not c['alternativeOnly']]),'alternativeAtoms':2,'BYRoutes':len(source_rows),'targetedOtherStateRoutes':len(targeted)},ensure_ascii=False))
