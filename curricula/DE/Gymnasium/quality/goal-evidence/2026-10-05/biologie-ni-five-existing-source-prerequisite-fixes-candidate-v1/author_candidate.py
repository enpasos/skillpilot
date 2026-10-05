# Apache-2.0. Source-bound author proposals; never writes an active file.
from pathlib import Path
import copy, hashlib, json

P = Path(__file__).resolve().parent
ROOT = P.parents[6]
BASE = P.parent / 'biologie-ni-five-current-adoption-candidate-v3'
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def write(name, data):
    (P / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
PDF = ROOT / 'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf'
active = read(CANONICAL)
staged = read(BASE / 'canonical.biologie.candidate.json')
goals = {g['id']: g for g in staged['goals']}
active_goals = {g['id']: g for g in active['goals']}
source = read(BASE / 'ni.current-source.candidate.json')
source_goals = {g['id']: g for g in source['sourceGoals']}
mapping = read(BASE / 'ni.current-mapping.candidate.json')
decisions = {d['sourceGoalId']: d for d in mapping['decisions']}
paths = read(BASE / 'dna-native-effective-require-paths.candidate.json')
strict = read(BASE / 'strict37.ids.metadata-only.json')

IDS = {
    'identify': '0db20819-ee94-54c6-8ecb-aff8c9b7419e',
    'pedigree': '440854be-7f06-5678-91cb-ba8dcab56959',
    'systematics': '9dff0360-c2e9-5e43-af8b-87e264281cf7',
    'evolution': '9f73b963-5fac-5a90-a993-d7b7c0cc8526',
    'mutation': 'ffef97e3-12d6-5090-9816-46ab9e57fae2',
    'protein': '475eebb4-4eb0-524f-b1ec-4a672bf856d2',
    'dna': '0daa79f6-8f61-5506-98f9-65db83062ba8',
    'simpleInheritance': 'b8fc739d-f5de-5f83-92fe-28dc6597add5',
    'identifyAids': '0380f992-723a-513d-8c3f-8ca7f8e0394f',
    'orientation': '2d451684-6e53-565e-a987-f362da919d2c',
    'cells': 'b1dff57f-329e-5264-b2b9-2db71a0b2172',
    'variation': '359e6313-cd86-54d1-bee5-8e680101dc32',
    'geneProduct': '0263fb84-33b1-52a3-a47e-dad56be7c9bc',
    'assortment': '0b55e592-3335-52e4-8b4f-79c53f32400b',
    'exchange': '9e459608-bdea-55a1-b9c5-214bbd741be6',
}

# Exact normative sentences from the actual 2015 competence table, with visual
# column assignment. PDF line-end hyphenation is joined only for words.
clauses = {
 'ni-biology-seki-kc2015-eg1-5-6-004-8e4a2294': (75, '5/6', 'ordnen nach vorgegebenen Kriterien.'),
 'ni-biology-seki-kc2015-eg1-5-6-005-70402fb8': (75, '5/6', 'bestimmen Lebewesen mithilfe von Bestimmungsschlüsseln, z. B. Bäume und Sträucher.'),
 'ni-biology-seki-kc2015-eg2-9-10-006-b8c86bad': (77, '9/10', 'unterscheiden zwischen der individuellen Ebene des Organismus und der Populationsebene.'),
 'ni-biology-seki-kc2015-fw6-009-b8768292': (87, '9/10', 'erläutern die Folgen von Diploidie und Rekombination im Rahmen von Familienstammbaumanalysen.'),
 'ni-biology-seki-kc2015-fw7-003-b3921cb7': (89, '9/10', 'erklären Variabilität durch Mutation – ohne molekulargenetische Betrachtung – und durch Rekombination.'),
 'ni-biology-seki-kc2015-fw7-004-bfbb6db7': (89, '9/10', 'erläutern die Vorteile der geschlechtlichen gegenüber der ungeschlechtlichen Fortpflanzung im Hinblick auf Variabilität.'),
 'ni-biology-seki-kc2015-fw7-005-7fd31b63': (89, '5/6', 'verfügen über Artenkenntnis innerhalb einer ausgewählten Organismengruppe, z. B. heimische Bäume und Sträucher auf dem Schulgelände.'),
 'ni-biology-seki-kc2015-fw7-007-698f4159': (89, '9/10', 'unterscheiden zwischen verschiedenen Arten unter Verwendung eines einfachen Artbegriffs (Art als Fortpflanzungsgemeinschaft).'),
 'ni-biology-seki-kc2015-fw7-008-02728f99': (90, '5/6', 'erläutern das Verfahren der Züchtung durch Auswahl von geeigneten Varianten.'),
 'ni-biology-seki-kc2015-fw7-011-8e9422f7': (90, '9/10', 'erklären Angepasstheiten als Folge von Evolutionsprozessen auf der Grundlage von Variabilität und Selektion in Populationen.'),
 'ni-biology-seki-kc2015-fw7-012-8ed51e46': (90, '9/10', 'erklären Evolutionsprozesse durch das Zusammenspiel von Mutation, Rekombination und Selektion.'),
 'ni-biology-seki-kc2015-fw7-014-f0f9091d': (90, '9/10', 'unterscheiden zwischen nicht-erblicher individueller Anpassung und erblicher Angepasstheit.'),
 'ni-biology-seki-kc2015-fw8-001-ddfc8318': (91, '5/6', 'deuten Ähnlichkeiten in der Familie als Indiz für Verwandtschaft.'),
 'ni-biology-seki-kc2015-fw8-002-c605cfe2': (91, '5/6', 'erklären Ähnlichkeiten zwischen Haustieren und ihren wild lebenden Verwandten mit gemeinsamen Vorfahren.'),
 'ni-biology-seki-kc2015-fw8-003-5e22af22': (91, '5/6', 'nennen wichtige Unterscheidungsmerkmale und Gemeinsamkeiten von Wirbeltiergruppen (Säugetiere – Vögel – Reptilien – Amphibien – Fische).'),
 'ni-biology-seki-kc2015-fw8-004-d7fd1464': (91, '7/8', 'ordnen Arten anhand von morphologischen und anatomischen Ähnlichkeiten in ein hierarchisches System ein.'),
}
assert set(clauses) == {w['sourceGoalId'] for p in paths['paths'] for w in p['sourceBindings']}

templates = [
 {
  'id': None, 'candidateKey': 'morphological_hierarchical_classification',
  'title': 'Arten anhand körperlicher Merkmale hierarchisch einordnen',
  'titleEn': 'Classify species hierarchically using body traits',
  'description': 'Die lernende Person kann Arten anhand morphologischer und anatomischer Ähnlichkeiten in ein hierarchisches System einordnen und die Zuordnung mit den verwendeten Merkmalen begründen.',
  'descriptionEn': 'The learner can classify species in a hierarchical system using morphological and anatomical similarities and justify the placement with the traits used.',
  'requires': [IDS['identifyAids']], 'requiresCandidateKeys': [],
  'gradeBand': '7/8', 'sourceGoalIds': ['ni-biology-seki-kc2015-fw8-004-d7fd1464'],
  'positiveCompetence': ['Mehrere Ebenen einer biologischen Gruppierung sind unterscheidbar; gemeinsame Morphologie/Anatomie trägt die Zuordnung.', 'Die lernende Person ordnet neue vorgegebene Organismen selbst anhand unterscheidender Gemeinsamkeiten ein.'],
  'providedModels': ['Die benutzten hierarchischen Ebenen und ein korrektes Beispiel sind als Lesekonvention verfügbar; Merkmalsbefunde sind Material, die Zuordnung ist Lernleistung.'],
  'excludedClaims': ['Molekulare Phylogenie, historische Systematikbewertungen und Familienstammbäume werden hierdurch nicht beherrscht.', 'Der neue Atom ersetzt weder die vollständige Wirbeltiergruppen-Artenkenntnis aus Jg.5/6 noch das allgemeine Ordnen nach beliebigen Kriterien.'],
  'atomicityAuthorRationale': 'Eine einzelne Einordnungskompetenz; Begründen macht den verwendeten Klassifikationsgrund überprüfbar.',
 },
 {
  'id': None, 'candidateKey': 'simple_reproductive_species_concept',
  'title': 'Arten als Fortpflanzungsgemeinschaft unterscheiden',
  'titleEn': 'Distinguish species as reproductive communities',
  'description': 'Die lernende Person kann an geeigneten Beispielen Arten mit einem einfachen Artbegriff als Fortpflanzungsgemeinschaft unterscheiden, indem sie Informationen zur Fortpflanzung und zur Fruchtbarkeit der Nachkommen verwendet.',
  'descriptionEn': 'The learner can distinguish species in suitable examples using a simple species concept as a reproductive community, using information about reproduction and the fertility of offspring.',
  'requires': [IDS['identifyAids']], 'requiresCandidateKeys': [],
  'gradeBand': '9/10', 'sourceGoalIds': ['ni-biology-seki-kc2015-fw7-007-698f4159'],
  'positiveCompetence': ['Die Entscheidung nutzt Fortpflanzungsgemeinschaft und Fortpflanzungsfähigkeit der Nachkommen, nicht bloß äußerliche Gleichheit.', 'Verschieden aussehende Individuen können derselben Art angehören; ähnliche Individuen müssen dies nicht.'],
  'providedModels': ['Artspezifische Fortpflanzungs- und Fruchtbarkeitsbefunde liegen vor; das fachliche Kriterium wird gelernt und im neuen Beispiel selbst angewendet.', 'Die Beispiele betreffen sexuell reproduzierende Organismen, bei denen das einfache Kriterium anwendbar ist.'],
  'excludedClaims': ['Die einfache Definition löst nicht sämtliche Grenzen biologischer Artkonzepte.', 'Morphologischer/phylogenetischer Artkonzeptvergleich und Artbildungsmechanismen bleiben eigene Oberstufenkompetenzen.'],
  'atomicityAuthorRationale': 'Eine einzelne Artunterscheidung anhand eines verbindlichen einfachen Kriteriums.',
 },
 {
  'id': None, 'candidateKey': 'non_molecular_mutation_recombination_variability',
  'title': 'Variabilität durch Mutation und Rekombination erklären',
  'titleEn': 'Explain variability through mutation and recombination',
  'description': 'Die lernende Person kann an einfachen Beispielen erklären, wie Veränderungen von Genen durch Mutation und neue Kombinationen vorhandener Erbinformation durch Rekombination Unterschiede zwischen Individuen einer Art hervorbringen.',
  'descriptionEn': 'The learner can use simple examples to explain how changes to genes through mutation and new combinations of existing genetic information through recombination produce differences between individuals of the same species.',
  'requires': [IDS['variation'], IDS['geneProduct'], IDS['assortment'], IDS['exchange']], 'requiresCandidateKeys': [],
  'gradeBand': '9/10', 'sourceGoalIds': ['ni-biology-seki-kc2015-fw7-003-b3921cb7'],
  'positiveCompetence': ['Mutation verändert Gene; Rekombination kombiniert vorhandene Erbinformation neu.', 'Die lernende Person erklärt kausal, wie sich dadurch erblich bedingte Unterschiede ergeben können, ohne die Veränderung als bedarfs- oder zielgesteuert darzustellen.', 'Unterschiede zwischen Gene/Genprodukt/Merkmal sowie Veränderungen/Neukombinationen tragen die Erklärung; alle Mutationen müssen weder sichtbar noch nützlich sein.'],
  'providedModels': ['Ein einfaches Gen–Genprodukt–Merkmal-Schema und konkrete vor/nach-Befunde zu Merkmalen bzw. Chromosomenkombinationen können vorliegen; die Kausalzuordnung und Abgrenzung sind Lernleistung.', 'Der neue Atom verwendet die im NI5-Paket unverändert vorgegebenen Chromosomenmodelle. Modelle erklären keine DNA-Sequenzveränderungsmechanismen.'],
  'excludedClaims': ['Kein Nachweis von Substitution, Deletion, Insertion, Duplikation, Leserasteränderung, Transkription, Translation, Nukleotiden oder DNA-Replikation.', 'Die beiden bestehenden Rekombinationsatome werden textlich und semantisch unverändert wiederverwendet.'],
  'atomicityAuthorRationale': 'Eine einzelne kausale Variabilitätserklärung mit zwei biologisch unterscheidbaren Ursachen; keine zweite Prüfung molekularer Mutationstypen.',
 },
 {
  'id': None, 'candidateKey': 'non_molecular_evolutionary_interplay',
  'title': 'Evolution durch Variabilität und Selektion erklären',
  'titleEn': 'Explain evolution through variability and selection',
  'description': 'Die lernende Person kann an einem einfachen Beispiel erklären, wie Mutation und Rekombination erbliche Variabilität bereitstellen und Selektion über unterschiedliche Überlebens- und Fortpflanzungserfolge die Häufigkeit erblicher Varianten in einer Population über Generationen verändert, sodass Angepasstheiten entstehen können.',
  'descriptionEn': 'The learner can use a simple example to explain how mutation and recombination provide heritable variability and how selection through differences in survival and reproductive success changes the frequency of heritable variants in a population over generations, so that adaptations can arise.',
  'requires': [IDS['variation']], 'requiresCandidateKeys': ['non_molecular_mutation_recombination_variability'],
  'gradeBand': '9/10', 'sourceGoalIds': ['ni-biology-seki-kc2015-fw7-011-8e9422f7', 'ni-biology-seki-kc2015-fw7-012-8ed51e46'],
  'positiveCompetence': ['Alle drei Funktionen werden in einer durchgängigen kausalen Erklärung verknüpft; Selektion erzeugt keine bedarfsgerechten Mutationen.', 'Überlebensunterschiede allein genügen nicht ohne Unterschied im Fortpflanzungserfolg und Vererbbarkeit.', 'Die Häufigkeit in der Population verändert sich über Generationen; das einzelne Individuum mutiert nicht zielgerichtet wegen eines neuen Bedarfs.'],
  'providedModels': ['Eine einfache Folge von Varianten-/Nachkommenbefunden sowie der Umweltkontext sind vorgegeben; der kausale Zusammenhang wird nicht als fertige Lösung vorgegeben.', 'Häufigkeiten werden qualitativ aus Material verglichen; es gibt keine zusätzliche Allelfrequenz-, Fitnesskurven- oder Populationsmodell-Rechenkompetenz.'],
  'excludedClaims': ['Selektion ist keine Quelle neuer genetischer Varianten.', 'Diese integrierte Evolutionserklärung ersetzt nicht Züchtungsverfahren, einfache Verwandtschaftserklärung oder den ausdrücklichen Vergleich von nicht-erblicher Anpassung und erblicher Angepasstheit.'],
  'atomicityAuthorRationale': 'Ein Evolutionsprozess mit einer kausalen Funktionskette; Angepasstheit ist Ergebnis dieser Kette, keine zweite unabhängige Routine.',
 },
]
for t in templates:
    t.update({'contains': [], 'type': 'atomic', 'tags': ['GK', 'LK', 'canonical', 'SekI'], 'weight': 1,
              'applicability': {'jurisdiction': ['DE-NI']}, 'status': 'author_candidate', 'humanApproval': False,
              'stableIdAssigned': False, 'nationwideProjectionAuthorized': False,
              'sourceOperatorsPreserved': [clauses[s][2] for s in t['sourceGoalIds']],
              'independentD2Passed': False, 'semanticAtomicityDecision': 'candidate_only', 'memoryDecision': 'not_reviewed'})
write('four-missing-seki.goal-templates.candidate.json', {'status': 'author_candidate', 'goalTemplates': templates, 'stableIdAssignments': 0})

delta = {
 'goalId': IDS['pedigree'], 'field': '/requires',
 'before': goals[IDS['pedigree']]['requires'],
 'after': [IDS['simpleInheritance'], IDS['orientation']],
 'beforeGoal': goals[IDS['pedigree']],
 'afterGoal': {**goals[IDS['pedigree']], 'requires': [IDS['simpleInheritance'], IDS['orientation']]},
 'allDEENTextFieldsUnchanged': True,
 'scientificRationale': 'Familienstammbaumanalyse benötigt eine diploide Allel-/Vererbungsbeziehung und dominant/rezessive Deutung. Nukleotide, Doppelhelix und DNA-Replikationsmechanismus tragen die sichtbare monohybride Verteilung nicht. Das vorhandene b8fc verankert die reale Erbgangskompetenz und setzt die vereinfachte Meiose voraus.',
 'stage': 'NI FW6 Ende Jg.10; die globale autosomale/gonosomale Semantik bleibt vollständig erhalten.',
 'requiredAssessmentContext': ['Eine korrekt erläuterte Familien-/Stammbaumlegende liegt vor.', 'Ein fachlich korrektes vereinfachtes Gonosomenmodell ist bei gonosomalem Material gegeben. Das Modell ist Kontext und kein zusätzlicher Leistungsnachweis.', 'Die lernende Person muss autosomale/gonosomale und dominante/rezessive Möglichkeiten am Befund selbst plausibilisieren und Grenzen begründen.', 'Für NI FW6-009 muss das Material eine eigene Erklärung der Folgen von Diploidie und Rekombination ermöglichen. Dominant/rezessive Etikettierung allein erfüllt diesen Operator nicht.'],
 'authorStatus': 'candidate_requires_independent_description_context_review',
 'sourceCoverageClaim': 'partial_pending_actual_evidence_context',
 'humanApproval': False, 'independentD2Passed': False,
}
write('one-existing-prerequisite.before-after.candidate.json', delta)
patched = copy.deepcopy(staged)
next(g for g in patched['goals'] if g['id'] == IDS['pedigree'])['requires'] = delta['after']
write('canonical.edge-only.inactive.candidate.json', patched)

reuse = [
 {'need': 'NI Jg.5/6 Bestimmungsschlüssel', 'reuseGoalId': IDS['identifyAids'], 'verdict': 'reuse', 'reason': 'Explizite operative Bestimmungskompetenz; analoge Bestimmungsschlüssel sind eine native Teilmenge der vorhandenen Bestimmungshilfen. Ein echtes Schlüsselfallmaterial ist Pflicht. Keine neue DNA-/Systematikvoraussetzung.'},
 {'need': 'NI Jg.9/10 monohybride Familienstammbaumanalyse', 'reuseGoalId': IDS['pedigree'], 'verdict': 'reuse_requires_context_hold', 'reason': 'Volle vorhandene Semantik bleibt; nur fachfremde DNA-Voraussetzung wird ersetzt. Diploidie/Rekombination darf nicht durch bloßes Benennen von Erbgangslabels ersetzt werden.'},
 {'need': 'Hierarchische morphologische/anatomische Einordnung', 'testedGoalIds': [IDS['systematics'], IDS['identifyAids'], '5c7f0085-7ca8-5a67-bc87-57319acec749', 'bdbb1a13-f448-5536-86ab-894805e2f6be'], 'verdict': 'missing_explicit_seki_competence', 'candidateKey': templates[0]['candidateKey'], 'reason': 'Ansatzvergleich/Bewertung ist breiter und SekII; Identifizieren ist kein hierarchisches Ordnen; Homo-sapiens-Ziel fordert Molekularmerkmale; einzelnes Säugetierorgan-Ziel deckt keine taxonomische Einordnung.'},
 {'need': 'Einfacher Artbegriff als Fortpflanzungsgemeinschaft', 'testedGoalIds': ['b56a5408-ed84-57f2-a9dd-d1a67496fdd1', '002543f9-2d14-5c57-99b4-fb4bf7e53734', IDS['systematics']], 'verdict': 'missing_explicit_seki_competence', 'candidateKey': templates[1]['candidateKey'], 'reason': 'Artkonzeptvergleich und Artbildungsmechanismen sind zusätzliche Oberstufenaufgaben. Die einzelne einfache Artunterscheidung ist nicht gleichbedeutend mit ihrem vollständigen Beherrschen.'},
 {'need': 'Nichtmolekulare Variabilität durch Mutation und Rekombination', 'testedGoalIds': [IDS['mutation'], IDS['evolution'], IDS['variation'], IDS['geneProduct'], IDS['assortment'], IDS['exchange'], '183f3c47-ec20-5b98-8024-77ebd1c48abf'], 'verdict': 'missing_explicit_seki_causal_integration', 'candidateKey': templates[2]['candidateKey'], 'reason': 'NI5 trennt Phänomen/Genprodukt/Chromosomenrekombination; keines erklärt Mutation als Ursache. Molekulare Mutationskategorien samt Transkription/Translation überschreiten die explizite Stufengrenze. Die neue Integration verbreitert die bestehenden NI5-Atome nicht.'},
 {'need': 'Nichtmolekulares Evolutionszusammenspiel auf Populationsebene', 'testedGoalIds': [IDS['evolution'], '6bfcb8da-e337-5395-a50a-848f6a3abf4d', 'ac69483b-6a77-573d-a7c0-add32bb867e2', '183f3c47-ec20-5b98-8024-77ebd1c48abf'], 'verdict': 'missing_source_faithful_scientifically_correct_integration', 'candidateKey': templates[3]['candidateKey'], 'reason': '9f nennt Selektion irrtümlich als Ursache genetischer Variation und hängt an molekularer Mutation. Auswahlformen, Zustand der Angepasstheit oder weiterführende Biodiversitätskompetenz ersetzen die einfache kausale Funktionskette nicht.'},
]
write('all-canonical-reuse-inspection.candidate.json', {'status': 'author_candidate', 'entireCanonicalRead': True, 'recordsInspected': len(goals), 'activeRecordsInspected': len(active_goals), 'scope': 'Only competency needs of the five existing NI endpoints and their witnessed prerequisites', 'queries': ['Ordnen/Systematik/Morphologie/Anatomie/Arten/Bestimmung', 'Vererbung/Stammbaum/Diploidie/Chromosomen', 'Mutation/Variabilität/Rekombination/Selektion/Evolution/Angepasstheit'], 'findings': reuse, 'allCanonicalTitlesAndDescriptions': [{'goalId': g['id'], 'title': g['title'], 'description': g['description'], 'titleEn': g.get('titleEn'), 'descriptionEn': g.get('descriptionEn'), 'contains': g['contains'], 'requires': g['requires']} for g in goals.values()]})

routes = {
 'ni-biology-seki-kc2015-eg1-5-6-004-8e4a2294': ([], [], 'HOLD', 'Ordnen nach vorgegebenen Kriterien bleibt normativ Pflicht. 55b ordnet Kennzeichen des Lebendigen, nicht allgemein Organismen nach vorgegebenen Kriterien. Das neue hierarchische Ziel aus Jg.7/8 ersetzt nicht automatisch diese einfache Jg.5/6-Methodenkompetenz.'),
 'ni-biology-seki-kc2015-eg1-5-6-005-70402fb8': ([IDS['identifyAids']], [], 'retarget_existing', 'Retarget ausschließlich auf echte SekI-Schlüsselkompetenz; vorhandenes 350 ist nur Pflanzen-Teilbezug, keine Voraussetzung, alle Tiere beherrschen zu müssen.'),
 'ni-biology-seki-kc2015-eg2-9-10-006-b8c86bad': ([], [], 'HOLD', 'Die echte Originalklausel steht S77, EG2 Zeile8, Ende Jg.10. Das Unterscheiden der individuellen Organismusebene und der Populationsebene bleibt Pflicht. Bloßes Beschreiben von Mutations-/Selektionsursachen oder Vergleich von Artkonzepten ist dafür keine identische prüfbare Kompetenz. Der neue Evolutionskandidat liefert einen geeigneten Inhaltskontext, ersetzt aber keine ausdrückliche Umsetzung des Unterscheiden-Operators.'),
 'ni-biology-seki-kc2015-fw6-009-b8768292': ([IDS['pedigree']], [], 'reuse_with_prerequisite_delta_context_hold', 'Diploidie/Rekombination im Familienstammbaum werden als ursprünglicher Operator erhalten; tatsächlicher D-Kontext muss diese Erklärung tragen, über reines autosomal/dominant Etikettieren hinaus.'),
 'ni-biology-seki-kc2015-fw7-003-b3921cb7': ([], [templates[2]['candidateKey']], 'retarget_new_template', 'Genänderung und Neukombination auf NI-SekI-Stufe; volle molekulare Mutation/Proteinbiosynthese bleibt global intakt.'),
 'ni-biology-seki-kc2015-fw7-004-bfbb6db7': ([], [], 'HOLD', 'Der normative Vorteil geschlechtlicher gegenüber ungeschlechtlicher Fortpflanzung hinsichtlich Variabilität bleibt offen: 1d beschreibt Teilung und 4e12 vergleicht Vogel-/Fischstrategien. Rekombinationsmodelle allein belegen den vergleichenden Vorteilsoperator nicht.'),
 'ni-biology-seki-kc2015-fw7-005-7fd31b63': ([IDS['identifyAids'], '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd'], [], 'reuse_partial_context_hold', 'Jg.5/6 Artenkenntnis in einer tatsächlich ausgewählten Gruppe muss durch benannte relevante Arten und Merkmale im Aufgabenmaterial geprüft werden. Methodenkompetenz allein beweist keine Artenkenntnis.'),
 'ni-biology-seki-kc2015-fw7-007-698f4159': ([], [templates[1]['candidateKey']], 'retarget_new_template', 'Einfachen Fortpflanzungsgemeinschaftsbegriff bewahren statt historische/aktuelle Systematik oder vollständige Artkonzeptvergleiche zu verlangen.'),
 'ni-biology-seki-kc2015-fw7-008-02728f99': ([], [], 'HOLD', 'Züchtung durch gezielte Auswahl geeigneter vorhandener Varianten in Jg.5/6 ist eine eigene überprüfbare Erklärung. Beschreiben von Domestikation (bac3) oder Oberstufen-Selektionsmodi genügt dem Operator nicht nachweisbar.'),
 'ni-biology-seki-kc2015-fw7-011-8e9422f7': ([], [templates[3]['candidateKey']], 'retarget_new_template', 'Einfacher Populationsprozess macht Angepasstheit aus Variabilität/Selektion kausal erklärbar; keine molekularen Aufgaben oder alleopatrische/sympatrische Artbildungsanforderung.'),
 'ni-biology-seki-kc2015-fw7-012-8ed51e46': ([], [templates[3]['candidateKey']], 'retarget_new_template', 'Alle drei Funktionen korrekt zusammenführen. Das Herstellen neuer Varianten und das Verändern ihrer Häufigkeiten werden ausdrücklich unterschieden.'),
 'ni-biology-seki-kc2015-fw7-014-f0f9091d': ([], [], 'HOLD', 'Unterscheiden nicht-erblicher individueller Anpassung und erblicher Angepasstheit bleibt eigener normativer Operator. Weder b8fc-Erbgangsanalyse noch bloßes Deuten eines Säugetiermerkmals erfüllt ihn automatisch.'),
 'ni-biology-seki-kc2015-fw8-001-ddfc8318': ([], [], 'HOLD', 'Jg.5/6 Ähnlichkeiten in der Familie als Indiz deuten darf nicht an Jg.9/10 Familienstammbaumanalyse mit autosomal/gonosomal/dominant/rezessiv gebunden werden. Indiz heißt nicht Beweis oder sichere Erbgangsfeststellung.'),
 'ni-biology-seki-kc2015-fw8-002-c605cfe2': ([], [], 'HOLD', 'Die verlangte Erklärung von Haustier-/Wildtierähnlichkeit aus gemeinsamen Vorfahren bleibt Pflicht. Domestikationsaspekte beschreiben ist keine belegte identische kausale Abstammungserklärung; 9f-Mutationsbeschreibung ist ebenfalls unpassend.'),
 'ni-biology-seki-kc2015-fw8-003-5e22af22': ([], [], 'HOLD', 'Alle fünf ausdrücklich genannten Wirbeltiergruppen und ihre Unterscheidungsmerkmale/Gemeinsamkeiten erhalten. Bestimmen einzelner Arten, ein Säugetierorgan oder hierarchisches Klassifizieren erfüllt diesen Nennen-Operator nicht vollständig.'),
 'ni-biology-seki-kc2015-fw8-004-d7fd1464': ([], [templates[0]['candidateKey']], 'retarget_new_template', 'Jg.7/8 hierarchische Einordnung aus Morphologie/Anatomie, keine Vermischung mit historischem Ansatzvergleich, DNA-Merkmalen oder einem Identifikationsschlüssel allein.'),
}
binding_records, source_deltas = [], []
five = {IDS[k] for k in ['identify', 'pedigree', 'systematics', 'evolution', 'mutation']}
for sid, (page, grade, sentence) in clauses.items():
    s = source_goals[sid]; d = decisions[sid]
    reuses, keys, status, reason = routes[sid]
    old_five = [i for i in d['canonicalGoalIds'] if i in five]
    retained_outside = [i for i in d['canonicalGoalIds'] if i not in five]
    removed = [i for i in old_five if i not in reuses]
    binding_records.append({'sourceGoalId': sid, 'sourceBefore': s, 'mappingDecisionBefore': d,
       'actualPrimaryClause': sentence, 'actualPrimaryPhysicalPage': page, 'actualGradeBand': grade,
       'endpointBindingsBefore': old_five, 'candidateEndpointBindingsRemoved': removed,
       'proposedReuseGoalIds': reuses, 'proposedNewGoalReferences': [{'goalId': None, 'candidateKey': k} for k in keys],
       'otherExistingMappingsRetainedButNotReapproved': retained_outside,
       'authorVerdict': status, 'scientificRationale': reason,
       'fullCoverageClaim': False, 'independentSourceReviewPassed': False, 'humanApproval': False,
       'sourceOperatorProtectedEvenWhenHold': True})
    corrections = {'sourceText': {'before': s['sourceText'], 'after': sentence},
                   'metadata/sourcePage': {'before': s['metadata']['sourcePage'], 'after': page},
                   'metadata/grades': {'before': s['metadata'].get('grades'), 'after': grade}}
    if sentence is None:
        source_deltas.append({'sourceGoalId': sid, 'status': 'HOLD_SOURCE_LITERAL', 'proposedCorrections': None, 'preserveHistoricalRecord': True, 'rationale': reason})
    else:
        source_deltas.append({'sourceGoalId': sid, 'status': 'author_candidate', 'proposedCorrections': corrections,
          'sourceRefAfter': f'Niedersachsen Kerncurriculum Naturwissenschaften Gymnasium Sekundarbereich I 2015, Biologie, {s["topicCode"]}, Schuljahrgänge {grade}, S. {page}.',
          'sourceIdPreserved': True, 'historicalReviewerStatusNotRewritten': True,
          'sourceDocumentKeyUnchanged': True, 'sourceSpanMustBeReboundToActualTableCell': True})
write('sixteen-source-bindings.before-after-and-holds.candidate.json', {'status': 'author_candidate', 'scope': 'All actual source bindings of the five witnessed endpoints only', 'bindingRecords': binding_records, 'mappingMutation': False, 'sourceFullCoverageClaim': False})
write('primary-source.extraction-corrections.candidate.json', {'status': 'author_candidate', 'candidateCorrections': source_deltas,
    'primarySourceURL': source['sourceDocument']['url'], 'primaryPDFDigest': sha(PDF),
    'officialCurrentDownloadDigest': sha(P/'sources/official-current-download.pdf'),
    'officialCurrentBytesEqualRepository': sha(PDF) == sha(P/'sources/official-current-download.pdf'),
    'visualPagesActuallyInspected': [75,77,87,89,90,91], 'remainingExtractedPages': [79,80,88],
    'stageBoundary': 'S87 explicitly places DNA structure and identical replication, protein biosynthesis and point mutation in SekII; S89 explicitly restricts mutation to the phenomenological descriptive level in SekI.',
    'sourceIDTextCorrectionIsNotNewApproval': True})

context_ids = {i for p in paths['paths'] for i in p['goalPath']}
for i in [IDS['simpleInheritance'], IDS['identifyAids']]:
    context_ids.add(i)
frontier = list(context_ids)
while frontier:
    i = frontier.pop()
    for r in goals[i]['requires']:
        if r not in context_ids:
            context_ids.add(r); frontier.append(r)
context_ids.update(i for t in templates for i in t['requires'])
for i in list(context_ids):
    context_ids.update(g['id'] for g in goals.values() if i in g['requires'])
write('actual-five-and-intermediates.DEEN-context.snapshot.json', {'status': 'author_candidate', 'base': str(BASE.relative_to(ROOT)/'canonical.biologie.candidate.json'),
    'goals': [goals[i] for i in sorted(context_ids)],
    'activeAndStagedEndpointBodiesEqual': all(active_goals[i] == goals[i] for i in five),
    'activeAndStagedOnlyPriorNI5PlacementDeltas': [i for i in active_goals if active_goals[i] != goals[i]],
    'unmodifiedGlobalOberstufe': [IDS[k] for k in ['identify','systematics','evolution','mutation','protein','dna']],
    'newNI5BodiesPreservedExactly': [IDS[k] for k in ['variation','geneProduct','assortment','exchange']] + ['36d3bf01-e68b-55be-8e20-5652ada36a51']})

write('strict37.inputs.metadata-only.json', strict)
write('input-bindings.receipt.json', {'status': 'author_candidate', 'reviewAuthority': 'ai_author_candidate', 'humanApproval': False,
    'readBindings': [{'path': str(p.relative_to(ROOT)), 'digest': sha(p)} for p in [CANONICAL,PDF,BASE/'canonical.biologie.candidate.json',BASE/'ni.current-source.candidate.json',BASE/'ni.current-mapping.candidate.json',BASE/'dna-native-effective-require-paths.candidate.json',BASE/'strict37.ids.metadata-only.json']],
    'writtenDirectoryOnly': str(P.relative_to(ROOT)), 'activeWrites': 0, 'PContentsRead': False, 'viewsQARead': False,
    'imageEdits': 0, 'historicalReviewRestart': False, 'nationalExpansion': False, 'newStableIDs': 0,
    'priorNI5CandidatesAreInputsOnly': True, 'publishedReleaseWrites': 0})
print(json.dumps({'authorCandidate': True, 'onePrerequisiteDelta': 1, 'newNullIdTemplates': len(templates), 'sourceRows': len(clauses), 'sourceRowsWithHold': sum('HOLD' in x['authorVerdict'].upper() for x in binding_records), 'activeWrites': 0}))
