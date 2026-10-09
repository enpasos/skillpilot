#!/usr/bin/env python3
"""Two reviewable draft competencies; no canonical/source/native adoption or approval."""
import copy
import datetime
import hashlib
import json
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
OLD_AUTHOR = HERE.parent / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
OLD_C = HERE.parent / 'biologie-evolution-systematics-behavior-eighteen-whole-independent-c-v1'
PARENT_ID = '430b2b73-641a-5122-bb6d-162b0d1eaf2d'

def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, obj):
    p = HERE / name
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canonical = json.loads(canonical_path.read_text())
parent = next(g for g in canonical['goals'] if g['id'] == PARENT_ID)
raw = json.loads((OLD_AUTHOR / 'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json').read_text())
assert next(r['wholeActiveGoal'] for r in raw['wholeCurrentGoalRows'] if r['goalId'] == PARENT_ID) == parent
source_rows = [r for r in raw['wholeOriginalSourceDutyRows'] if PARENT_ID in r['wholeCanonicalPartnerGoalIds']]
partner_ids = sorted({p for r in source_rows for p in r['wholeCanonicalPartnerGoalIds']})
partner_rows = [r for r in raw['wholeOriginalAndCurrentPartnerGoals'] if r['goalId'] in partner_ids]
assert len(source_rows) == 13 and len(partner_ids) == len(partner_rows) == 22
goals = {g['id']: g for g in canonical['goals']}
assert all(goals[p['goalId']] == p['wholeCurrentGoal'] for p in partner_rows)
ids = {
    'fossil-chronology-hypothesis-analysis': str(uuid.uuid5(uuid.UUID(PARENT_ID), 'fossil-chronology-hypothesis-analysis')),
    'cultural-evolution-current-human-and-biosphere-influences': str(uuid.uuid5(uuid.UUID(PARENT_ID), 'cultural-evolution-current-human-and-biosphere-influences')),
}
assert not set(ids.values()) & set(goals)
write('exact-parent-thirteen-source-duties-and-twenty-two-whole-partners.author-input.json', {
    'schemaVersion': 1, 'role': 'Exact original competency/source/partner inputs; no new science judgment',
    'createdAt': stamp, 'activeCanonical': bind(canonical_path), 'wholeOriginalParent': parent,
    'wholeOriginalSourceDutyRows': source_rows, 'wholeOriginalAndCurrentPartnerGoals': partner_rows,
    'originalWholeSourceFrameBinding': bind(OLD_AUTHOR / 'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json'),
    'protectedCurrentBaseline': {'wholeCanonicalNodes': 479, 'curricularAtoms': 394, 'strictCompleteBiology': 299},
    'historicalOriginalsRetained': True, 'activeWrites': [],
})

def child(key, title_de, title_en, description_de, description_en, topic_suffix):
    g = copy.deepcopy(parent)
    g.update({'id': ids[key], 'shortKey': 'canonical_biology_sek1_' + topic_suffix.lower(),
              'title': title_de, 'titleEn': title_en, 'description': description_de, 'descriptionEn': description_en,
              'contains': [], 'requires': list(parent['requires']), 'resourceLinks': []})
    g['dimensionTags']['topicCode'] = 'CANONICAL.BIOLOGY.SEK1.' + topic_suffix
    # These are reviewable body drafts, not a claim of inherited regional applicability.
    g['applicability'] = {'jurisdiction': ['DE-BY']}
    g['sourceRef'] = 'LehrplanPLUS Bayern Gymnasium Biologie, B10.4: bounded component of the whole fossil/cultural competence; author proposal, independent review pending'
    g['extendedData']['provenance']['sourceGoalId'] = parent['extendedData']['provenance']['sourceGoalId']
    return g

fossil = child('fossil-chronology-hypothesis-analysis',
    'Fossilbelege zur Evolution des Menschen zeitlich und hypothetisch auswerten',
    'Evaluate human-evolution fossil evidence chronologically and through hypotheses',
    'Die lernende Person kann aus Merkmalen und zeitlichen Angaben zu fossilen Funden begründete, begrenzte Hypothesen zur biologischen Evolution des modernen Menschen ableiten und eine zeitliche Reihenfolge rekonstruieren, ohne aus zeitlicher Abfolge allein eine direkte Vorfahrenfolge zu behaupten.',
    'The learner can derive justified, limited hypotheses about biological human evolution from traits and age information of fossil finds and reconstruct a chronological sequence without inferring a direct ancestor sequence from chronology alone.',
    'HUMAN_FOSSIL_EVIDENCE_CHRONOLOGY_HYPOTHESES')
culture = child('cultural-evolution-current-human-and-biosphere-influences',
    'Gegenwärtige Einflüsse kultureller Evolution auf Mensch und Umwelt analysieren',
    'Analyze present influences of cultural evolution on humans and their environment',
    'Die lernende Person kann analysieren, wie sozial weitergegebenes und verändertes Wissen sowie technische oder kulturelle Praktiken den heutigen Menschen und seine Umwelt beeinflussen, biologische Vererbung von kultureller Weitergabe unterscheiden und Nutzen, Folgen und Grenzen anhand konkreter Belege begründen.',
    'The learner can analyze how socially transmitted and changing knowledge and technical or cultural practices influence humans today and their environment, distinguish biological inheritance from cultural transmission, and justify benefits, consequences and limits using concrete evidence.',
    'CULTURAL_EVOLUTION_PRESENT_HUMAN_ENVIRONMENT_INFLUENCES')
parent_cluster = copy.deepcopy(parent)
parent_cluster.update({'contains': list(ids.values()), 'type': 'cluster', 'weight': 2})
write('two-child-semantic-bodies-and-parent-cluster.author-candidate.json', {
    'schemaVersion': 1, 'role': 'Inactive begun split candidate; not a shadow canonical landscape or operative mapping',
    'createdAt': stamp, 'originalParentBinding': bind(canonical_path), 'originalParentId': PARENT_ID,
    'wholeOriginalParent': parent, 'candidateParentCluster': parent_cluster,
    'candidateChildren': [fossil, culture],
    'idDerivation': {'algorithm': 'UUIDv5', 'namespace': PARENT_ID, 'namesToIds': ids},
    'preservation': {'parentDescriptionDeEnAndProvenanceAndRequiresExact': True,
                     'allOriginalContainsAndRequiresElsewhereUntouched': True,
                     'parentIllustrationFutureRole': 'Retain a good independently reviewed parent overview at the cluster; no image bytes or active links changed here.'},
    'childApplicabilityStatus': 'DE-BY only as a proposed explicitly read shared original competency. All regional roles, including RP, remain separately pending; no copying of the parent twelve-country applicability as child approval.',
    'proposedFutureCountsIfFullyReviewedAndIntegrated': {'nodes': 481, 'curricularAtoms': 395, 'condition': 'Parent becomes curricularArea and two children become approved curricularAtomic; no such change executed or counted.'},
    'currentCountsUnchanged': {'nodes': 479, 'curricularAtoms': 394, 'strictCompleteBiology': 299},
    'status': 'ai_candidate_needs_human_review', 'independentApproval': False, 'activeWrites': [], 'strictGain': 0,
})

def case(cid, material_de, material_en, task_de, task_en, worked_de, worked_en, fresh_de, fresh_en, transfer_de, transfer_en):
    return {'caseId': cid, 'materialDe': material_de, 'materialEn': material_en,
            'taskDe': task_de, 'taskEn': task_en, 'workedResponseDe': worked_de, 'workedResponseEn': worked_en,
            'freshTransferTaskDe': fresh_de, 'freshTransferTaskEn': fresh_en,
            'workedFreshTransferDe': transfer_de, 'workedFreshTransferEn': transfer_en,
            'materialStatus': 'synthetic_author_case_no_real_trial', 'actualExperimentPerformed': False,
            'actualLearnerPerformance': False}

fossil_cases = [
case('fossils-mosaic-order-and-overlap',
    'Konstruierte Fossilkarten, keine realen Fund- oder Patientendaten. Alter vor heute: F1 4,0–3,5 Millionen Jahre, Schädelvolumen 380 cm³, Beckenfragment mit Hinweisen auf aufrechten Gang; F2 2,2–1,9 Millionen Jahre, 650 cm³, mehrere passende Hinweise auf aufrechten Gang; F3 0,30–0,20 Millionen Jahre, 1350 cm³, im Modell stärker menschenähnliche Zahnmerkmale. Die Merkmale sind didaktisch reduziert; Alter und Ähnlichkeit beweisen keine direkte Abstammung.',
    'Constructed fossil cards, not real finds or patient data. Age before present: F1 4.0–3.5 million years, cranial volume380 cm³, pelvic fragment suggesting upright walking; F2 2.2–1.9 million years,650 cm³, several compatible upright-walking traits; F3 0.30–0.20 million years,1350 cm³, more human-like dental traits in this model. Traits are reduced for teaching; age and similarity do not prove direct ancestry.',
    'Ordne die drei Zeitintervalle. Leite eine begründete Hypothese zum Verhältnis von aufrechtem Gang und größerem Schädelvolumen ab. Prüfe die Aussage „F1 wurde zu F2, daraus wurde F3“. Nenne eine fehlende Information.',
    'Order the three age intervals. Derive a justified hypothesis about upright walking versus larger cranial volume. Examine “F1 became F2, which became F3”. Name one missing piece of information.',
    'F1 ist älter als F2, F2 älter als F3. Im Modell treten Hinweise auf aufrechten Gang bereits bei kleinem Schädelvolumen auf; die Merkmale können sich mosaikartig verändern. Die zeitliche Reihenfolge erlaubt keine direkte F1→F2→F3-Vorfahrenkette. Seitenzweige, Lücken und unsichere Funktionsdeutungen bleiben möglich. Weitere Fossilmerkmale und eine unabhängig begründete Verwandtschaftsanalyse wären nötig; „älter“ bedeutet nicht „weniger entwickelt“.',
    'F1 is older than F2 and F2 older than F3. In this model, upright-walking evidence occurs with small cranial volume; traits may change mosaically. The temporal order does not establish a direct F1→F2→F3 ancestor chain. Side branches, missing samples and uncertain functional interpretations remain possible. More fossil traits and an independently supported relationship analysis are needed; “older” does not mean “less evolved”.',
    'Eine neue Karte F4 ist 2,6–2,1 Millionen Jahre alt, besitzt ein Schädelvolumen von450 cm³ und deutliche Hinweise auf aufrechten Gang. Welche Reihenfolge lässt sich jetzt sicher rekonstruieren? Welche Hypothese bleibt begrenzt gestützt?',
    'New F4 is2.6–2.1 million years old, has450 cm³ cranial volume and strong upright-walking evidence. Which order is now certain? Which hypothesis remains supported within limits?',
    'F1 liegt vor F4 und F2; beide liegen vor F3. Die Intervalle von F4 und F2 überlappen: deren einzelne Fundalter sind nicht sicher geordnet. Aufrechter Gang bei kleinem Schädelvolumen bleibt im Modell belegt. Die neue Karte stärkt ein Merkmalsmosaik, keine lineare Fortschritts- oder direkte Vorfahrenfolge.',
    'F1 precedes both F4 and F2, and both precede F3. F4/F2 intervals overlap, so their individual find ages cannot be ordered confidently. Upright walking with small cranial volume remains supported in the model. The new card strengthens a mosaic of traits, not a linear progress or direct ancestor chain.'),
case('habitat-hypothesis-and-provenance',
    'Konstruierte, im Ausgangsfall am ursprünglichen Ablagerungsort erhaltene Befunde: X 3,1–2,9 Millionen Jahre, Beckenmerkmale mit gut begründeten Hinweisen auf aufrechten Gang, Pollen einer bewaldeten Umgebung; Y 2,8–2,5 Millionen Jahre, ähnliche Gangmerkmale, offenes Wald-Grasland-Mosaik; Z 2,6–2,3 Millionen Jahre, teilweise abweichende Gangmerkmale, überwiegend offene Umgebung. Die Pollen stammen aus zeitlich passenden Sedimenten. Hypothese H lautet: „Aufrechter Gang konnte erstmals ausschließlich in baumloser Savanne entstehen.“ Dies ist eine prüfbare, absichtlich strenge Modellhypothese.',
    'Constructed finds initially preserved in their original deposits: X3.1–2.9 million years, pelvic traits strongly supporting upright walking, pollen from a wooded environment; Y2.8–2.5 million years, similar walking traits, open woodland/grassland mosaic; Z2.6–2.3 million years, partly different walking traits, mainly open environment. Pollen comes from age-matched sediments. H states: “Upright walking could first arise exclusively in treeless savannah.” This is an intentionally strict testable model hypothesis.',
    'Rekonstruiere die gesicherte und die unsichere zeitliche Ordnung. Prüfe H mit dem vollständigen X-Befund. Erkläre, weshalb die Daten keine einzelne Ursache für aufrechten Gang beweisen und kein Fortschrittsschema liefern.',
    'Reconstruct the certain and uncertain chronological order. Test H against the complete X find. Explain why these data prove neither a single cause of upright walking nor a progress sequence.',
    'X liegt vor Y und Z; Y und Z sind wegen überlappender Intervalle nicht sicher geordnet. Unter den genannten Herkunfts- und Altersannahmen widerspricht X der ausschließlichen Baumlosigkeitsbedingung: aufrechter Gang ist mit bewaldeter Umgebung vereinbar. Der Zusammenhang belegt keine Ursache; Ernährung, Fortbewegung, klimatische Veränderungen und Merkmalsdeutung brauchen weitere Tests. Unterschiedliche, gleichzeitig mögliche Formen sind keine notwendige Leiter zum modernen Menschen.',
    'X precedes Y and Z; overlapping intervals prevent ordering Y and Z confidently. Given the provenance and age assumptions, X contradicts exclusive treelessness: upright walking is compatible with woodland. Association establishes no cause; food, movement, climate and trait interpretation need further tests. Different potentially coexisting forms are no necessary ladder toward modern humans.',
    'Nachträglich wird eine Umlagerung des X-Fossils nachgewiesen; sein ursprüngliches Sediment ist unbekannt. Darf X weiterhin H widerlegen? Welcher gezielte Befund wäre nötig?',
    'X was later shown to have been redeposited; its original sediment is unknown. Can X still refute H? What targeted evidence is needed?',
    'Nein: Die zuvor angenommene Zuordnung von Gangmerkmalen, Alter und Waldpollen ist für X nicht mehr gesichert. Die Widerlegung mit X fällt aus; H ist dadurch nicht bewiesen. Ein unabhängig datierter, nicht umgelagerter Fund mit verlässlichen Gangmerkmalen und passendem Umweltkontext könnte den Test wieder tragen.',
    'No: the assumed association between X walking traits, age and woodland pollen is no longer secure. The X-based refutation fails; that does not prove H. An independently dated, undisturbed find with reliable walking traits and matching environmental context could restore the test.'),
]
culture_cases = [
case('irrigation-transmission-and-current-tradeoffs',
    'Konstruierte Ortschronik: In Jahr0 leben1000 Menschen in einer Gemeinde; die Modell-Ernährungsmenge liegt bei2000 Einheiten pro Person, Ernteausfälle bei20 Prozent und angrenzende Feuchtgebiete bei100 ha. Bis Jahr10 werden Bewässerungsbau und Anbauwissen in Familien und Schule weitergegeben und verändert. Die Werte betragen dann1300 Menschen,2800 Ernährungseinheiten,8 Prozent Ernteausfälle und40 ha Feuchtgebiet. Gleichzeitig ändern sich Wetter und Handel. Keine Werte sind reale Messungen; die Daten enthalten keine Allelfrequenzen oder Belege vererbter erworbener Fertigkeiten.',
    'Constructed local chronicle: year0 has1000 inhabitants, model food supply2000 units per person, crop failure20 percent and100 ha adjacent wetland. By year10, irrigation construction and farming knowledge have been transmitted and modified through families and school. Values are then1300 people,2800 food units,8 percent crop failure and40 ha wetland. Weather and trade also change. These are not real measurements and include no allele frequencies or evidence that acquired skills are genetically inherited.',
    'Erkläre den kulturellen Weitergabeweg und unterscheide ihn von biologischer Vererbung. Analysiere einen Nutzen für heutige Menschen und eine Umweltfolge. Prüfe, ob die Chronik alle Veränderungen allein durch Bewässerung erklärt.',
    'Explain cultural transmission and distinguish it from biological inheritance. Analyze one present human benefit and one environmental consequence. Test whether irrigation alone explains every change in the chronicle.',
    'Menschen erlernen, dokumentieren und verändern Bewässerungs- und Anbauverfahren; Weitergabe kann zwischen nicht verwandten Personen und Generationen erfolgen. Fertigkeiten werden dadurch nicht zu vererbten Allelen. Höhere Versorgung und geringere Ausfälle können Ernährung und Besiedlung erleichtern; Wetlandverlust verändert Lebensräume und mögliche Artenvielfalt. Wetter, Handel und weitere Faktoren verhindern eine eindeutige alleinige Kausaldeutung. Kulturelle Evolution ist kein unvermeidlicher Fortschritt und kein Wertvergleich zwischen Menschengruppen.',
    'People learn, document and modify irrigation/farming procedures; transmission can cross non-relatives and generations. Skills do not thereby become inherited alleles. Higher supply and fewer failures may ease nutrition and settlement; wetland loss changes habitats and possible biodiversity. Weather, trade and other factors prevent attributing all changes solely to irrigation. Cultural evolution is no inevitable progress and no ranking of human groups.',
    'Eine trockene Folgeperiode erhöht durch Bewässerung den Salzgehalt des Bodens; trotz überliefertem Wissen sinkt die Versorgung auf1800 Einheiten. Wie verändert dies die Bewertung? Welche Information wäre für eine Gegenmaßnahme nötig?',
    'A subsequent dry period makes irrigation increase soil salinity; despite transmitted knowledge, supply falls to1800 units. How does this change the assessment? What information would a countermeasure require?',
    'Der Nutzen ist bedingt: Eine technische Praxis kann unter veränderten Bedingungen eigene Risiken erzeugen. Wissen muss geprüft und verändert werden; genetische Vererbung oder eine allgemeine Überlegenheit folgt nicht. Benötigt werden verlässliche Salz- und Wasserbilanzdaten sowie vergleichbare Verfahren, um Folgen einer konkreten Änderung zu beurteilen. Keine reale Maßnahme oder erfolgreiche Durchführung wird hier behauptet.',
    'Benefits are conditional: a technical practice can create risks under changed conditions. Knowledge needs testing and modification; no genetic inheritance or general superiority follows. Reliable salt/water-balance data and comparable procedures are needed to assess a specific change. No actual intervention or successful implementation is claimed.'),
case('sanitation-cumulative-knowledge-and-biosphere',
    'Konstruierter Vergleich zweier Städte: A führt ein über Generationen entwickeltes Abwassersystem ein; dokumentierte Modell-Krankheitsfälle sinken von30 auf8 pro1000 Einwohner. StadtB ohne zeitgleiche Umstellung liegt bei28 pro1000; beide verändern zugleich Bevölkerungszahl und andere Lebensbedingungen. In A wird Abwasser mikrobiologisch gereinigt, während erhöhte Nährstoffeinträge unterhalb des Auslasses beobachtet werden. Pläne und Wartungswissen werden gelehrt und verbessert; die Tabelle belegt keine Veränderung menschlicher Gene und gibt keine individuelle medizinische Empfehlung.',
    'Constructed comparison of two cities: A introduces a wastewater system developed across generations; recorded model illness cases fall from30 to8 per1000 people. B without a simultaneous change has28 per1000; both populations and other living conditions also change. A treats wastewater microbiologically while increased nutrient input is observed downstream of the outlet. Designs and maintenance knowledge are taught and improved. The table proves no human genetic change and provides no individual medical advice.',
    'Analysiere, wodurch dies kulturelle Evolution illustriert, und begründe Folgen für heutige Menschen und die Biosphäre. Trenne eine plausible Wirkung von einem durch die Tabelle bewiesenen Kausalzusammenhang. Erkläre eine Grenze der Fortschrittsbehauptung.',
    'Analyze how this illustrates cultural evolution and justify effects on humans today and the biosphere. Distinguish a plausible effect from causation proved by the table. Explain a limit of the progress claim.',
    'Das System baut auf sozial weitergegebenem, veränderbarem Technik- und Wartungswissen auf. Eine geringere Erregerbelastung ist als menschlicher Nutzen plausibel; die Vergleichszahlen allein beweisen sie wegen weiterer Veränderungen nicht als einzige Ursache. Nährstoffeinträge können Gewässergemeinschaften verändern. Kumulative Kultur kann Gesundheit und Lebensräume unterschiedlich beeinflussen; kein genetischer Erwerb gelernter Verfahren, keine unvermeidliche Verbesserung und keine universelle Rangordnung werden daraus abgeleitet.',
    'The system builds on socially transmitted, revisable engineering/maintenance knowledge. Reduced pathogen exposure is a plausible human benefit; other changes prevent the comparison alone from proving it as the sole cause. Nutrient input can change aquatic communities. Cumulative culture can affect health and habitats differently; it implies neither genetic acquisition of learned procedures, inevitable improvement nor a universal ranking.',
    'Ein Hochwasser setzt die Anlage vorübergehend außer Betrieb; Fälle steigen auf24 pro1000. Eine neue Betriebsanleitung wird öffentlich weitergegeben. Was zeigt das über kulturelle und biologische Evolution und die Umweltabhängigkeit der Technik?',
    'A flood temporarily disables the plant and cases rise to24 per1000. A revised operating guide is publicly transmitted. What does this show about cultural versus biological evolution and environmental dependence?',
    'Der geänderte Betriebskontext begrenzt den technischen Nutzen; die Wissensweitergabe kann schnell auch ohne genetische Änderung erfolgen. Die Zahlen sind mit einem Beitrag der Anlage vereinbar, beweisen aber weiterhin nicht die einzige Ursache. Eine belastbare Prüfung müsste gleichartige Expositionen, Betriebszustand und andere Bedingungen berücksichtigen. Die kulturelle Anpassung ist hier eine Vorschrift und keine nachgewiesene erfolgreiche Durchführung.',
    'Changed operating conditions limit technical benefit; knowledge can spread rapidly without genetic change. The figures are compatible with a plant contribution but still do not establish it as the sole cause. A sound test would examine comparable exposures, operating status and other conditions. The cultural adaptation here is a proposed guide, not demonstrated successful execution.'),
]

def expectation(eid, understanding_de, understanding_en, performance_de, performance_en):
    return {'id': eid, 'essentialUnderstandingDe': understanding_de, 'essentialUnderstandingEn': understanding_en,
            'observablePerformanceDe': performance_de, 'observablePerformanceEn': performance_en}

fossil_expectations = [
expectation('essential-1', 'Merkmale und Zeitangaben liefern unterschiedliche Belegbeiträge; unsichere oder überlappende Intervalle begrenzen die Rekonstruktion.', 'Traits and age data contribute different evidence; uncertain or overlapping intervals constrain reconstruction.', 'Rekonstruiert die belegte zeitliche Ordnung und kennzeichnet unsichere Relationen ausdrücklich anhand der vollständigen Fundkarten.', 'Reconstructs the supported order and explicitly identifies uncertain relations using complete find cards.'),
expectation('essential-2', 'Eine begründete Evolutionshypothese trennt Merkmalsdeutung und Umweltzusammenhang von direkter Abstammung, Fortschrittsleiter oder gesicherter Ursache.', 'A justified evolutionary hypothesis separates trait interpretation and environmental association from direct ancestry, a progress ladder or established causation.', 'Leitet eine mit konkreten Fossilmerkmalen begründete Hypothese ab, prüft Gegenbelege und erläutert Herkunfts- und Aussagegrenzen sowie eine passende weitere Prüfung.', 'Derives a hypothesis justified by specific fossil traits, tests counterevidence, explains provenance and inference limits and identifies a suitable further check.'),
]
culture_expectations = [
expectation('essential-1', 'Kulturelle Evolution beruht auf sozialer Weitergabe und Veränderung von Wissen oder Praktiken; erworbene Fertigkeiten sind keine automatisch genetisch vererbten Merkmale.', 'Cultural evolution involves social transmission and modification of knowledge or practices; acquired skills are not automatically genetically inherited traits.', 'Erklärt am konkreten Material den Weitergabe- und Veränderungsweg und grenzt kulturelle Veränderung ausdrücklich von genetischer Vererbung ab.', 'Explains transmission and modification using specific material and explicitly distinguishes cultural change from genetic inheritance.'),
expectation('essential-2', 'Kulturelle Praktiken können heutige menschliche Lebensbedingungen und die Biosphäre verändern; Nutzen und Risiken sind kontextabhängig, Korrelation genügt nicht als Ursachenbeweis.', 'Cultural practices can change present human conditions and the biosphere; benefits and risks depend on context, and correlation alone is no proof of cause.', 'Analysiert mit konkreten Belegen einen menschlichen Nutzen und eine Umweltfolge, begrenzt Kausalaussagen und revidiert die Bewertung bei veränderten Bedingungen ohne Fortschritts- oder Gruppenhierarchie.', 'Uses concrete evidence to analyze a human benefit and environmental consequence, limits causal claims and revises assessment under changed conditions without a progress or group hierarchy.'),
]

def profile_for(expectations, cases):
    for c in cases:
        c['rubric'] = [{'expectationId': e['id'], 'rubricScope': 'pair_reference_not_single_case_quota',
                       'criterionDe': e['observablePerformanceDe'], 'criterionEn': e['observablePerformanceEn'],
                       'actualEvidenceLocations': ['workedResponseDe', 'workedResponseEn', 'workedFreshTransferDe', 'workedFreshTransferEn'],
                       'rubricNoteDe': 'Nur im jeweiligen Fall tatsächlich gezeigte Aspekte zählen; die Kriterien beschreiben die gesamte Kompetenz im Paar, keine zusätzliche Aufgabe als feste Quote.',
                       'rubricNoteEn': 'Count only aspects actually shown in the individual case; the criteria describe the whole competency across the pair, not a fixed extra-task quota.'} for e in expectations]
    return {'archetype': 'explanation', 'expectations': expectations,
            'coverageExpectations': {'requiredExpectationIds': [e['id'] for e in expectations], 'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 2, 'freshVariationRequired': True, 'independentTransferRequired': True},
            'variationAxes': [{'id': 'distinct-complete-material-contexts', 'textDe': 'Zwei unterschiedliche vollständige Belegkontexte verlangen eigene Auswertung und begründete Grenzen.', 'textEn': 'Two distinct complete evidence contexts demand independent interpretation and justified limits.'}, {'id': 'changed-evidence-or-operating-premise', 'textDe': 'Eine neue Herkunftsunsicherheit oder veränderte Rahmenbedingung verändert die zulässige Folgerung.', 'textEn': 'New provenance uncertainty or a changed operating condition alters the justified inference.'}],
            'applicationCaseBriefs': [{'id': c['caseId'], 'taskDemandDe': c['materialDe'] + '\n\nAuftrag: ' + c['taskDe'] + '\n\nFrische Variation: ' + c['freshTransferTaskDe'], 'taskDemandEn': c['materialEn'] + '\n\nTask: ' + c['taskEn'] + '\n\nFresh variation: ' + c['freshTransferTaskEn'], 'expectedPerformanceDe': c['workedResponseDe'] + '\n\nTransfer: ' + c['workedFreshTransferDe'], 'expectedPerformanceEn': c['workedResponseEn'] + '\n\nTransfer: ' + c['workedFreshTransferEn'], 'understandingFocusDe': ' '.join(e['essentialUnderstandingDe'] for e in expectations), 'understandingFocusEn': ' '.join(e['essentialUnderstandingEn'] for e in expectations)} for c in cases]}

entries = []
for g, expectations, cases in [(fossil, fossil_expectations, fossil_cases), (culture, culture_expectations, culture_cases)]:
    entries.append({'goalId': g['id'], 'wholeCandidateGoal': g, 'wholeProfile': profile_for(expectations, cases), 'newAuthoredWholeCases': cases,
                    'status': 'ai_candidate_needs_human_review', 'independentAtomicity': 'PENDING', 'independentMemory': 'PENDING', 'currentNative': 'PENDING', 'currentV': 'PENDING', 'humanApproval': False})
write('two-child-four-whole-bilingual-cases-and-P.author-candidate.json', {'schemaVersion': 1, 'role': 'Begun whole material/profile draft for later independent review; no current binding or approval', 'createdAt': stamp, 'entries': entries, 'parentOriginalCompetenceUnionPreserved': True, 'RPAncestryToSelectedBehaviourDutyNotDeclaredCovered': True, 'strictGain': 0})
candidate_set = {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1', 'reviewId': HERE.name,
                 'reviewedAt': stamp, 'reviewer': 'Codex /root/biology_resume_candidate actual author of these two draft children, not their independent reviewer',
                 'goals': [{'goalId': e['goalId'], 'profile': e['wholeProfile'], 'reason': 'Whole author draft with two heterogeneous complete synthetic cases and fresh transfers; independent science/atomicity/source/course/placement/native/V and human gates pending. The RP ancestry-to-selected-behaviour source obligation is explicitly retained as a separate unresolved facet and is not claimed by this cultural draft.', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'dissent': []} for e in entries]}
write('two-normal-positive-profile-specs.author-candidate.json', candidate_set)
write('semantic-kind-atomicity-memory-and-exact-source-placement-proposals.pending.json', {
    'schemaVersion': 1, 'role': 'Author reasons and explicit pending proposals; no authoritative ledger or independent review',
    'parentProposal': {'goalId': PARENT_ID, 'semanticKind': 'curricularArea', 'reason': 'Fossil chronology/hypothesis interpretation and present cultural-effect analysis can be independently assessed; the parent preserves the original whole competency as an area.', 'independentReview': 'PENDING'},
    'childProposals': [{'goalId': e['goalId'], 'semanticKind': 'curricularAtomic', 'atomicityProposal': 'atomic', 'atomicityAuthorReason': ('One evidence-to-evolution-hypothesis interpretation using chronological constraints; ordering and limiting inference are facets of the same evidence judgment.' if e['goalId'] == fossil['id'] else 'One analysis of how culturally transmitted practices influence present humans/environment; transmission mechanism, consequences and conditional inference are facets of that analysis.'), 'memoryProposal': 'no_memory_needed', 'memoryAuthorReason': 'Context-varying analysis with supplied data rather than compact fixed-answer recall; no required cards inferred.', 'independentAtomicityAndMemory': 'PENDING'} for e in entries],
    'originalCompetenceFacetDistribution': [{'originalFacet': 'Merkmale fossiler Funde → begrenzte Hypothesen zur biologischen Evolution', 'candidateChildId': fossil['id']}, {'originalFacet': 'zeitliche Reihenfolge eines Evolutionsprozesses rekonstruieren', 'candidateChildId': fossil['id']}, {'originalFacet': 'Bedeutung kultureller Evolution für heutige Menschen in ihrer Umwelt analysieren', 'candidateChildId': culture['id']}],
    'whole13SourceRowsRetainedInExactInput': True, 'whole22PartnersRetainedInExactInput': True,
    'sourceRoleProposals': [{'rowId': r['rowId'], 'sourceGoalId': r['wholeResolvedSourceGoal']['id'], 'mappingBinding': r['mappingBinding'], 'decisionJsonPointer': r['decisionJsonPointer'], 'originalWholePartnerGoalIds': r['wholeCanonicalPartnerGoalIds'], 'proposedNewRoles': ([{'childGoalId': fossil['id'], 'roleDe': 'Fossilmerkmale, zeitliche Rekonstruktion und Hypothesenanalyse als Teilbeitrag'}, {'childGoalId': culture['id'], 'roleDe': 'Kulturelle Evolution und gegenwärtige Mensch-Umwelt-Folgen als Teilbeitrag'}] if r['rowId'] == 'source-duty-0072' else [{'childGoalId': culture['id'], 'roleDe': 'Kulturelle Evolution und heutige Einflüsse auf Menschheit/Biosphäre; separater begrenzter Teilbeitrag'}] if r['rowId'] == 'source-duty-0277' else []), 'status': 'PENDING_full_source_partner_and_projection_review', 'existingDecisionOrEdgeChanged': False} for r in source_rows],
    'specificRPWholeDutyHold': {'rowId': 'source-duty-0276', 'sourceGoalId': next(r['wholeResolvedSourceGoal']['id'] for r in source_rows if r['rowId'] == 'source-duty-0276'), 'wholeDutyDe': 'Wissen über die Abstammung des Menschen anwenden, um ausgewählte Verhaltensweisen des Menschen, z. B. Stressreaktion, zu erklären', 'actualPrimaryLocus': {'physicalPage': 48, 'printedPage': 46, 'topic': 'TF12 Biologische Anthropologie'}, 'preservedOriginalSolePartner': PARENT_ID, 'candidateChildAssigned': None, 'status': 'HOLD_separate_unresolved_whole_source_facet', 'reason': 'The two clean proposed children preserve the original parent description but do not claim the additional ancestry-to-behaviour routine. An independently reviewed suitable SekI partner/companion or explicit targeted facet is still required; no upper LK primate substitute and no duty dropped.'},
    'placementProposal': {'currentCanonicalParent': 'dc39fe71-10c0-591d-9491-44b53e38f5e1', 'parentContainsTwoNewChildren': list(ids.values()), 'childrenRequires': parent['requires'], 'noChildRequiresOtherChild': True, 'regionalAuthoredViewsAndApplicability': 'PENDING; do not automatically expand every broad parent mapping to both new children. Retain full original required regional content and whole partner unions.', 'noDefaultPrerequisiteOnlyInferred': True},
    'neededIndependentGates': ['whole child science/P2', 'atomicity parent/children', 'memory decisions', 'all actual source/course/placement changes and RP duty preservation', 'current child Native/D/P/V with required images', 'protected old394/current299 context checks'],
    'activeWrites': [], 'strictGain': 0,
})
print(json.dumps({'candidateFolder': str(HERE.relative_to(ROOT)), 'childIds': ids, 'wholeSourceDuties': len(source_rows), 'wholePartners': len(partner_rows), 'profiles': 2, 'newWholeBilingualCases': 4, 'currentAtomCount': 394, 'strictGain': 0}, indent=2))
