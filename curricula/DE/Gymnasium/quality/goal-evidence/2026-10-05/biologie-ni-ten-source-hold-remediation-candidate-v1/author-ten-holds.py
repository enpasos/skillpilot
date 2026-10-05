# SPDX-License-Identifier: Apache-2.0
"""Produce inactive author proposals only; never writes outside this folder."""
import copy
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
EVIDENCE = HERE.parent
PRIOR = EVIDENCE / 'biologie-ni-five-existing-source-prerequisite-fixes-candidate-v1'
BASE = EVIDENCE / 'biologie-ni-five-current-adoption-candidate-v3/canonical.biologie.candidate.json'
ACTIVE = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
NI = ROOT / 'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf'
HEEXTRACT = ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.source-extraction.json'
SOURCES = HERE / 'sources'
NI_URL = 'https://cuvo.nibis.de/index.php?p=download&upload=18'
ORIENTATION = '2d451684-6e53-565e-a987-f362da919d2c'
VARIATION = '359e6313-cd86-54d1-bee5-8e680101dc32'
IDENTIFY = '0380f992-723a-513d-8c3f-8ca7f8e0394f'
PEDIGREE = '440854be-7f06-5678-91cb-ba8dcab56959'
EVOLUTION = '9f73b963-5fac-5a90-a993-d7b7c0cc8526'

def read(p): return json.loads(p.read_text())
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return str(p.relative_to(ROOT))
def write(name, value):
    p = HERE / name
    assert HERE in p.resolve().parents
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def binding(p): return {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}

active, base = read(ACTIVE), read(BASE)
assert len(active['goals']) == 441 and len(base['goals']) == 446
byid = {g['id']: g for g in base['goals']}
prior = read(PRIOR / 'four-missing-seki.goal-templates.candidate.json')['goalTemplates']
records = read(PRIOR / 'sixteen-source-bindings.before-after-and-holds.candidate.json')['bindingRecords']
record_byid = {r['sourceGoalId']: r for r in records}
edge = read(PRIOR / 'one-existing-prerequisite.before-after.candidate.json')

def source(sid):
    r = record_byid[sid]
    return {'sourceGoalId': sid, 'literalPrimaryClause': r['actualPrimaryClause'],
            'physicalPage': r['actualPrimaryPhysicalPage'], 'printedPage': r['actualPrimaryPhysicalPage'],
            'pdfPageIndex': r['actualPrimaryPhysicalPage'] - 1,
            'gradeBand': r['actualGradeBand'], 'stage': 'SekI',
            'sourceDocument': binding(NI), 'officialURL': NI_URL,
            'tableCell': r['sourceBefore']['sourceSpanText'],
            'textCache': binding(SOURCES / ('NI-physical-page-%03d.txt' % r['actualPrimaryPhysicalPage'])),
            'visualPageCache': binding(SOURCES / ('NI-physical-page-%03d.png' % r['actualPrimaryPhysicalPage']))}

SID = {
 'order': 'ni-biology-seki-kc2015-eg1-5-6-004-8e4a2294',
 'key': 'ni-biology-seki-kc2015-eg1-5-6-005-70402fb8',
 'levels': 'ni-biology-seki-kc2015-eg2-9-10-006-b8c86bad',
 'pedigree': 'ni-biology-seki-kc2015-fw6-009-b8768292',
 'variability': 'ni-biology-seki-kc2015-fw7-003-b3921cb7',
 'sexual': 'ni-biology-seki-kc2015-fw7-004-bfbb6db7',
 'species': 'ni-biology-seki-kc2015-fw7-005-7fd31b63',
 'species_concept': 'ni-biology-seki-kc2015-fw7-007-698f4159',
 'breeding': 'ni-biology-seki-kc2015-fw7-008-02728f99',
 'adaptation': 'ni-biology-seki-kc2015-fw7-011-8e9422f7',
 'interplay': 'ni-biology-seki-kc2015-fw7-012-8ed51e46',
 'adjustment': 'ni-biology-seki-kc2015-fw7-014-f0f9091d',
 'family': 'ni-biology-seki-kc2015-fw8-001-ddfc8318',
 'ancestor': 'ni-biology-seki-kc2015-fw8-002-c605cfe2',
 'vertebrates': 'ni-biology-seki-kc2015-fw8-003-5e22af22',
 'hierarchy': 'ni-biology-seki-kc2015-fw8-004-d7fd1464',
}

def template(key, sidkey, title, title_en, de, en, performance_de, performance_en, provided_de, provided_en,
             exclusions_de, exclusions_en, atomic_de, memory, memory_reason_de, memory_reason_en,
             requires=None, candidate_requires=None):
    s = source(SID[sidkey])
    return {'id': None, 'candidateKey': key, 'role': 'candidate_author', 'status': 'inactive_author_candidate',
      'title': title, 'titleEn': title_en, 'description': de, 'descriptionEn': en,
      'type': 'atomic', 'contains': [], 'weight': 1, 'tags': ['GK','LK','canonical','SekI'],
      'requires': requires if requires is not None else [ORIENTATION],
      'requiresCandidateKeys': candidate_requires or [], 'gradeBand': s['gradeBand'], 'stage': 'SekI',
      'applicability': {'jurisdiction': ['DE-NI']}, 'sourceGoalIds': [s['sourceGoalId']],
      'literalSourceBinding': s, 'positiveCompetence': performance_de, 'positiveCompetenceEn': performance_en,
      'providedModels': provided_de, 'providedModelsEn': provided_en,
      'excludedClaims': exclusions_de, 'excludedClaimsEn': exclusions_en,
      'atomicityAuthorRationale': atomic_de, 'semanticAtomicityDecision': 'author_proposal_atomic_pending_independent_review',
      'memorySuitabilityAuthorProposal': memory, 'memoryRationale': memory_reason_de, 'memoryRationaleEn': memory_reason_en,
      'sourceFullClauseClaim': 'proposed_route_only_pending_fresh_independent_source_and_native_D_reviews',
      'stableIdAssigned': False, 'nationwideProjectionAuthorized': False, 'humanApproval': False,
      'independentD2Passed': False, 'authoritativeAMRecordsCreated': False}

new = []
new.append(template('order_given_criteria', 'order',
 'Lebewesen nach vorgegebenen Kriterien ordnen', 'Order organisms using given criteria',
 'Die lernende Person kann Lebewesen oder biologische Beobachtungen nach vorgegebenen Kriterien in passende Gruppen oder Reihen ordnen.',
 'The learner can place organisms or biological observations into appropriate groups or sequences using given criteria.',
 ['Wendet dasselbe vorgegebene Kriterium konsistent auf alle Objekte an; bei mehreren Kriterien wird jedes ausdrücklich berücksichtigt.',
  'Ordnet einen neuen Materialsatz selbst; die gewählte Gruppe oder Position stimmt mit den beobachtbaren Merkmalen überein.'],
 ['Applies the same given criterion consistently to every object; explicitly considers each criterion when several are supplied.',
  'Independently orders a new set of material; the chosen group or position agrees with observable traits.'],
 ['Kriterien, Objektbilder oder kurze Merkmalsbefunde liegen vor; Sortierregeln dürfen erläutert werden, fertige Zuordnungen liegen nicht vor.'],
 ['Criteria and organism photographs or short trait observations are supplied; sorting rules may be clarified, completed placements are not supplied.'],
 ['Eigenständiges Erfinden von Kriterien, Artbestimmung, biologische Rangtaxa und Evolution werden nicht vorausgesetzt.'],
 ['Inventing criteria, species identification, biological taxonomic ranks and evolution are not prerequisites.'],
 'Eine einzige Kriterienanwendung im Ordnungsproblem; Gruppen und Reihen sind alternative Darstellungen derselben Leistung.',
 'no_memory_needed', 'Vorgegebene Kriterien werden angewendet; es wird kein fester Merkmals- oder Taxonbestand auswendig abgerufen.',
 'The supplied criteria are applied; no fixed set of traits or taxa must be recalled.'))

new.append(template('distinguish_organism_population', 'levels',
 'Individuum und Population unterscheiden', 'Distinguish an organism from a population',
 'Die lernende Person kann in biologischen Beobachtungen und Aussagen die Ebene eines einzelnen Organismus von der Ebene einer Population unterscheiden und die betrachtete Ebene angeben.',
 'The learner can distinguish the level of an individual organism from the level of a population in biological observations and statements and identify the level being considered.',
 ['Unterscheidet Veränderung oder Messung an einem Individuum von Verteilungen und Häufigkeiten in einer räumlich und zeitlich abgegrenzten Population derselben Art.',
  'Wechselt die Bezugsgröße nicht unbemerkt: Viele Messwerte an einem Organismus ergeben keine Population; eine Population ist keine Gruppe beliebiger Arten.'],
 ['Distinguishes change or measurement in one organism from distributions and frequencies in a spatially and temporally delimited population of one species.',
  'Keeps the unit of reference consistent: many measurements on one organism do not constitute a population; a population is not a group of arbitrary species.'],
 ['Der Begriff Population und die Grenzen der betrachteten Gruppe werden im Unterricht geklärt; Material nennt Ort, Zeit, Art und Messbezug, aber nicht die fertige Ebenenentscheidung.'],
 ['The population concept and the boundaries of the group are clarified during teaching; material supplies location, time, species and the measurement reference, but not the completed level decision.'],
 ['Molekül-, Ökosystem- und Biosphärenvernetzung sowie populationsgenetische Berechnungen sind keine Pflichtleistung dieses Ziels.'],
 ['Connecting molecular, ecosystem and biosphere levels and population-genetic calculations are not required performances of this goal.'],
 'Eine Bezugsgrößenunterscheidung, keine Sammlung unabhängiger Organisationsebenen.',
 'no_memory_needed', 'Die entscheidende Leistung ist das Anwenden der Bezugsgröße auf Beobachtungen; eine separate Definitionskarte ist dafür nicht notwendig.',
 'The essential performance is applying the unit of reference to observations; a separate definition card is unnecessary.'))

new.append(template('sexual_reproduction_variability_advantage', 'sexual',
 'Variabilitätsvorteil geschlechtlicher Fortpflanzung erläutern', 'Explain the variability advantage of sexual reproduction',
 'Die lernende Person kann den Vorteil der geschlechtlichen gegenüber der ungeschlechtlichen Fortpflanzung im Hinblick auf die Variabilität der Nachkommen anhand der Neukombination elterlicher Erbinformation erläutern.',
 'The learner can explain the advantage of sexual over asexual reproduction in terms of offspring variability by referring to new combinations of parental genetic information.',
 ['Vergleicht Nachkommen bei geschlechtlicher und ungeschlechtlicher Fortpflanzung unter vergleichbaren Bedingungen: Die elterliche Erbinformation wird geschlechtlich neu kombiniert; klonale Nachkommen übernehmen im einfachen Modell dieselbe Erbinformation, abgesehen von neuen Mutationen.',
  'Erläutert, dass mehr unterschiedliche erbliche Kombinationen die Bandbreite der Nachkommen vergrößern und bei veränderten Bedingungen unterschiedliche Chancen eröffnen können; kein garantiertes Überleben und kein stets überlegener Fortpflanzungserfolg.'],
 ['Compares offspring from sexual and asexual reproduction under comparable conditions: sexual reproduction combines parental genetic information; in the simple model, clonal offspring inherit the same genetic information except for new mutations.',
  'Explains that more distinct heritable combinations widen the range of offspring and can provide different opportunities under changed conditions; survival and universally superior reproductive success are not guaranteed.'],
 ['Nichtmolekulare Chromosomenmodelle und zwei Nachkommenserien sind verfügbar; die begründete Vergleichsaussage und der Variabilitätsvorteil müssen von der lernenden Person hergestellt werden.'],
 ['Non-molecular chromosome models and two offspring series are available; the learner must produce the reasoned comparison and the variability advantage.'],
 ['Kein DNA-Aufbau, keine Proteinbiosynthese, keine Fitnessberechnung und keine Behauptung, asexuelle Fortpflanzung erzeuge niemals Variation.'],
 ['No DNA structure, protein biosynthesis, fitness calculation or claim that asexual reproduction never produces variation.'],
 'Ein erklärender Vergleich mit genau einem Vergleichsaspekt, Variabilität; kein allgemeiner Strategienkatalog.',
 'no_memory_needed', 'Die bereits verfügbaren Rekombinationsmodelle tragen die Erklärung; eine neue Faktenkarte würde diese Vergleichsleistung nicht ersetzen.',
 'The already available recombination models support the explanation; a new fact card would not replace this comparative performance.',
 requires=[VARIATION, '0b55e592-3335-52e4-8b4f-79c53f32400b', '9e459608-bdea-55a1-b9c5-214bbd741be6']))

new.append(template('selected_native_tree_species_knowledge', 'species',
 'Heimische Laubbäume kennen und erkennen', 'Know and recognise selected native deciduous trees',
 'Die lernende Person kann innerhalb der ausgewählten Gruppe heimischer Laubbäume Rotbuche, Stieleiche, Hängebirke und Bergahorn an charakteristischen Merkmalen erkennen und benennen.',
 'The learner can recognise and name European beech, pedunculate oak, silver birch and sycamore maple within a selected group of native deciduous trees using characteristic traits.',
 ['Benennt die vier Arten an neuen geeigneten lebenden Exemplaren, Fotos oder Merkmalskombinationen selbst und verbindet jeden Namen mit zutreffenden, für diese Auswahl unterscheidenden Merkmalen.',
  'Artenkenntnis wird ohne eingeblendete Namen oder fertige Schlüsselantworten gezeigt; ein Bestimmungsschlüssel darf anschließend der Überprüfung dienen.'],
 ['Independently names the four species from new suitable living specimens, photographs or combinations of traits and associates each name with correct traits distinguishing the species within this selection.',
  'Species knowledge is demonstrated without displayed names or completed key answers; an identification key may then be used for verification.'],
 ['Die ausgewählte lokale Lerngruppe umfasst vier in Deutschland heimische Arten; mindestens Blätter und ein ergänzendes Rinden-, Knospen- oder Fruchtmerkmal werden im Unterricht an realen Befunden kennengelernt.',
  'Die vier Arten sind eine konkrete zulässige Auswahl, keine Behauptung über jeden Schulstandort; lokale Standortprüfung und gegebenenfalls andere gleichwertige Artenauswahl benötigen neue Karten- und Quellenbindungen.'],
 ['The selected local learning group comprises four species native to Germany; leaves and at least one additional bark, bud or fruit trait are learned from real observations.',
  'The four species form a concrete permitted selection, not a claim about every school site; checking the local site and substituting an equivalent selection require new card and source bindings.'],
 ['Nicht alle heimischen Arten, keine Gewässer- und Waldgesellschaftslehre und kein Fotosynthese-Pflichtpfad.',
  'Die Merkmale unterscheiden diese Vierergruppe; sie sind kein vollständiger europaweiter Artenbestimmungsschlüssel.'],
 ['Not all native species, aquatic or forest community theory, or a compulsory photosynthesis path.',
  'The traits distinguish this set of four; they are not a complete species-identification key for Europe.'],
 'Eine eng abgegrenzte Artenkenntniskompetenz in einer ausgewählten Organismengruppe; Name und Erkennen gehören zusammen.',
 'memory_required', 'Die Artennamen mit den unterscheidenden kompakten Merkmalskombinationen müssen ohne Antwortliste verfügbar sein. Vier neue Karten fehlen im bestehenden Kerndeck und bilden genau diese Auswahl ab.',
 'The species names and distinguishing compact trait combinations must be available without an answer list. Four new cards are absent from the existing core deck and represent exactly this selection.',
 requires=[IDENTIFY]))

new.append(template('breeding_selection_variants', 'breeding',
 'Züchtung durch Auswahl geeigneter Varianten erläutern', 'Explain breeding by selecting suitable variants',
 'Die lernende Person kann das Verfahren der Züchtung erläutern, indem sie beschreibt, wie Menschen Varianten mit gewünschten vererbbaren Merkmalen zur Fortpflanzung auswählen und diese Auswahl über Generationen wiederholen.',
 'The learner can explain the procedure of breeding by describing how people select variants with desired heritable traits for reproduction and repeat this selection across generations.',
 ['Wählt im Beispiel geeignete Eltern aus einer bereits unterschiedlichen Ausgangsgruppe und erläutert die Wiederholung der Auswahl bei den Nachkommen.',
  'Verbindet die menschliche Auswahl und die Vererbbarkeit des Merkmals damit, dass gewünschte Varianten über Generationen häufiger werden können; Auswahl erzeugt nicht zielgerichtet neue Varianten.'],
 ['Selects suitable parents from an already variable starting group and explains repeating the selection among their offspring.',
  'Connects human selection and the heritability of the trait with the possibility that desired variants become more frequent across generations; selection does not purposefully generate new variants.'],
 ['Ein gewünschtes Zuchtmerkmal, beobachtete Varianten und ein einfacher Hinweis auf dessen Vererbbarkeit werden vorgegeben; Auswahlentscheidung und Verfahrenszusammenhang sind Lernleistung.'],
 ['A desired breeding trait, observed variants and a simple indication that it is heritable are supplied; the selection decision and explanation of the procedure are learner performances.'],
 ['Keine Allelrechnung, Molekulargenetik, Mutationsinduktion oder allgemeine Domestikationsgeschichte; kein Versprechen identischer Nachkommen.'],
 ['No allele calculation, molecular genetics, induced mutation or general history of domestication; no promise of identical offspring.'],
 'Ein wiederholbares Auswahlverfahren; Generationen und Vererbbarkeit sind seine notwendigen kausalen Bestandteile.',
 'no_memory_needed', 'Die Leistung ist das Erläutern und Anwenden des Verfahrens anhand von Varianten; keine zusätzliche Faktenliste ist erforderlich.',
 'The performance is explaining and applying the procedure to variants; an additional fact list is unnecessary.', requires=[VARIATION]))

new.append(template('individual_adjustment_heritable_adaptation', 'adjustment',
 'Individuelle Anpassung und erbliche Angepasstheit unterscheiden', 'Distinguish individual adjustment from heritable adaptation',
 'Die lernende Person kann nicht-erbliche individuelle Anpassung von erblicher Angepasstheit unterscheiden, indem sie Veränderungen innerhalb eines individuellen Lebens mit erblichen Merkmalen und deren Entwicklung in Populationen über Generationen vergleicht.',
 'The learner can distinguish non-heritable individual adjustment from heritable adaptation by comparing changes during an individual lifetime with heritable traits and their development in populations across generations.',
 ['Ordnet etwa Muskelzuwachs durch Training als individuelle, nicht als solche vererbte Veränderung ein und grenzt davon eine erbliche, durch evolutionäre Prozesse in der Population entstandene Angepasstheit ab.',
  'Bezieht Vererbbarkeit, Zeitskala und Organismus- beziehungsweise Populationsebene auf die Entscheidung; individuelle Bedürftigkeit erzeugt keine zielgerichtete erbliche Anpassung.'],
 ['Identifies increased muscle size through training as an individual change that is not itself inherited and distinguishes it from a heritable adaptation that arose through evolutionary processes in a population.',
  'Uses heritability, timescale and organism versus population level to make the distinction; an individual need does not generate a purposefully inherited adaptation.'],
 ['Zwei geeignete Beispiele und Befunde zur Vererbbarkeit oder zeitlichen Entwicklung liegen vor; die Entscheidung wird nicht vorweggenommen.',
  'Nur die im Modell beschriebenen Fälle werden unterschieden; es wird keine universelle Aussage über alle epigenetischen Prozesse getroffen.'],
 ['Two suitable examples and observations about heritability or temporal development are supplied; the decision is not given in advance.',
  'Only the cases described by the model are distinguished; no universal claim about all epigenetic processes is made.'],
 ['Keine molekulare Epigenetik und keine Gleichsetzung jeder individuellen Änderung mit evolutionärer Angepasstheit.'],
 ['No molecular epigenetics or equation of every individual change with evolutionary adaptation.'],
 'Ein begründeter Kontrast zweier Anpassungsbegriffe; die Vergleichskriterien sind Bestandteile dieser einen Entscheidung.',
 'no_memory_needed', 'Der Kontrast wird an neuen Fällen begründet. Reine Merksatzkarten zu zwei Begriffen sind keine notwendige zusätzliche Leistung.',
 'The distinction is justified in new cases. Cards containing two verbal definitions are not a necessary additional performance.',
 requires=[], candidate_requires=['distinguish_organism_population','non_molecular_evolutionary_interplay']))

new.append(template('family_similarity_kinship_indication', 'family',
 'Familienähnlichkeiten als Indiz für Verwandtschaft deuten', 'Interpret family similarities as an indication of kinship',
 'Die lernende Person kann beobachtete Ähnlichkeiten in einer Familie als Indiz für biologische Verwandtschaft deuten und erläutern, dass eine Ähnlichkeit allein kein sicherer Nachweis ist.',
 'The learner can interpret observed similarities within a family as an indication of biological kinship and explain that similarity alone is not conclusive proof.',
 ['Stellt eine begründete Verbindung zwischen mehreren beobachtbaren Familienähnlichkeiten und möglicher gemeinsamer Abstammung beziehungsweise vererbten Merkmalen her.',
  'Bleibt bei der Aussage Indiz: ähnliche Umweltbedingungen oder zufällige Ähnlichkeiten sind möglich; biologische Verwandtschaft ist kein Werturteil über Familienformen.'],
 ['Makes a reasoned connection between several observable family similarities and possible common descent or inherited traits.',
  'Retains the status of an indication: similar environmental conditions or chance similarities are possible; biological kinship is not a value judgement about family forms.'],
 ['Fiktive Familienbilder oder einfache Merkmalsübersichten vermeiden private Familienabfragen. Vergleichsbefunde liegen vor; die Deutung ist nicht vorgegeben.'],
 ['Fictional family pictures or simple trait tables avoid asking about private families. Comparative observations are provided; the interpretation is not.'],
 ['Keine Stammbaumerbgangsdiagnose, monogenen Annahmen über reale komplexe menschliche Merkmale oder genetischen Verwandtschaftstests.'],
 ['No diagnosis of a pedigree inheritance pattern, single-gene assumptions about real complex human traits or genetic kinship testing.'],
 'Eine evidenzbezogene Deutung von Familienähnlichkeit, kein Stammbaumanalysen-Bündel.',
 'no_memory_needed', 'Ähnlichkeiten werden beobachtet und als begrenztes Indiz interpretiert; eine auswendig gelernte Merkmalsliste oder ein Vererbungslexikon ist nicht nötig.',
 'Similarities are observed and interpreted as limited evidence; no memorised trait list or inheritance glossary is required.'))

new.append(template('domestic_wild_common_ancestors', 'ancestor',
 'Ähnlichkeiten von Haus- und Wildtieren mit gemeinsamen Vorfahren erklären', 'Explain similarities of domestic and wild relatives through common ancestors',
 'Die lernende Person kann Ähnlichkeiten zwischen Haustieren und ihren wild lebenden Verwandten durch gemeinsame Vorfahren und die Weitergabe von Merkmalen an Nachkommen erklären.',
 'The learner can explain similarities between domestic animals and their wild relatives through common ancestors and the transmission of traits to offspring.',
 ['Verbindet beobachtbare gemeinsame körperliche Merkmale im Beispiel mit gemeinsamer Abstammung; gleiche Haltung oder gleicher Lebensraum sind keine vollständige Abstammungserklärung.',
  'Unterscheidet gemeinsame Vorfahren von der Behauptung, ein heute lebendes Wildtier sei der unmittelbare Vorfahr jedes heute lebenden Haustiers.'],
 ['Connects shared observable body traits in the example with common descent; similar husbandry or habitat does not fully explain descent.',
  'Distinguishes common ancestors from the claim that a wild animal living today is the immediate ancestor of every domestic animal living today.'],
 ['Geeignete Haus- und Wildtierverwandte und überprüfte einfache Abstammungsbefunde werden vorgegeben; gemeinsame Vorfahren als Ursache der Ähnlichkeit muss die lernende Person selbst erklären.'],
 ['Suitable domestic and wild relatives and verified simple observations about descent are supplied; the learner must explain common ancestors as the cause of their similarity.'],
 ['Keine aktuelle wilde Art wird pauschal zum unmittelbaren Stammvater erklärt; keine vollständige Domestikationsgeschichte, Taxonomie oder molekulare Phylogenie.'],
 ['No modern wild species is automatically described as the immediate ancestor; no complete domestication history, taxonomy or molecular phylogeny.'],
 'Eine kausale Abstammungserklärung für beobachtbare Haus-/Wildtierähnlichkeit.',
 'no_memory_needed', 'Abstammungsinformationen können als Material vorliegen; die Leistung ist eine kausale Erklärung, kein verbindlicher Katalog von Stammformen.',
 'Information about descent can be supplied as material; the performance is causal explanation rather than recall of a prescribed catalogue of ancestral forms.',
 requires=[], candidate_requires=['family_similarity_kinship_indication']))

new.append(template('five_vertebrate_groups_traits', 'vertebrates',
 'Merkmale und Gemeinsamkeiten der fünf Wirbeltiergruppen nennen', 'Name distinguishing and shared traits of the five vertebrate groups',
 'Die lernende Person kann wichtige Unterscheidungsmerkmale von Säugetieren, Vögeln, Reptilien, Amphibien und Fischen sowie gemeinsame Merkmale dieser Wirbeltiergruppen nennen.',
 'The learner can name important distinguishing traits of mammals, birds, reptiles, amphibians and fishes and traits shared by these vertebrate groups.',
 ['Nennt zu jeder der fünf im KC genannten Gruppen passende wichtige Merkmale: Haare und Säugen; Federn; trockene verhornte Haut mit Schuppen und Lungenatmung; feuchte durchlässige Haut; für typische Fische Kiemen und Flossen.',
  'Nennt eine Wirbelsäule und ein inneres Stützskelett als Gemeinsamkeiten der hier verwendeten typischen Vertreter; verwechselt Fischschuppen nicht mit Hornschuppen der Reptilien und setzt Vogel nicht mit Flugfähigkeit gleich.',
  'Die klassische Schulgruppierung Reptilien wird ohne Vögel verwendet, Fische als traditionelle Gruppe; dies ist keine Behauptung über fünf gleichrangige monophyletische Klassen.'],
 ['Names suitable important traits for all five groups listed by the curriculum: hair and nursing; feathers; dry keratinised skin with scales and breathing through lungs; moist permeable skin; gills and fins for typical fishes.',
  'Names a backbone and an internal supporting skeleton as shared traits of the typical representatives used; does not confuse fish scales with reptilian horny scales or equate birds with flight.',
  'The traditional school grouping of reptiles excludes birds, and fishes is used as a traditional group; this is not a claim that these are five equally ranked monophyletic classes.'],
 ['Die fünf Gruppennamen bilden den Lernumfang; typische Vertreter können als Anschauungsmaterial dienen, die Merkmalsantworten müssen selbst genannt werden.',
  'Wichtige Merkmale werden als charakteristische Merkmale geeigneter Vertreter vermittelt, ohne falsche Universalregeln wie alle Säugetiere seien lebendgebärend oder alle Amphibien hätten Lungen.'],
 ['The five group names define the learning scope; typical representatives may provide context, but trait answers must be supplied by the learner.',
  'Important traits are taught as characteristic traits of suitable representatives without false universal rules such as all mammals give live birth or all amphibians have lungs.'],
 ['Kein ausschließlicher Säugetierorganvergleich, keine Artenliste aller Gruppen, keine Evolutionstheorie oder vollständige kladistische Systematik.'],
 ['Not solely mammalian organ comparisons, species lists for every group, evolutionary theory or complete cladistic taxonomy.'],
 'Eine vergleichende Merkmalskenntnis zu der exakt im KC abgegrenzten Fünfergruppe; gemeinsame und unterscheidende Merkmale bilden eine einheitliche Vergleichsmatrix.',
 'memory_required', 'Der Operator nennen verlangt verfügbare kompakte Merkmale für alle fünf Gruppen und gemeinsame Merkmale. Das bestehende Kerndeck enthält diese sechs Karten nicht.',
 'The operator name requires recall of compact traits for all five groups and shared traits. These six cards are absent from the existing core deck.'))

assert len(new) == 9 and all(t['id'] is None for t in new)
write('nine-missing-performance.DEEN.goal-templates.candidate.json', {'status':'inactive_author_candidate','role':'candidate_author','goalTemplates':new,'stableIdAssignments':[]})
write('four-prior-templates.referenced.candidate.json', {'status':'inactive_author_reference','input':binding(PRIOR/'four-missing-seki.goal-templates.candidate.json'),'goalTemplatesCopiedWithoutSemanticChange':prior,'rationale':'The four existing narrow NI templates remain necessary because corrected global 9f retains the molecular prerequisite. No duplicates of these four were authored.','independentReviewReusedAsNewD':False})

# Ordinary goals exist in the package before memory-goal and card proposals.
TREES = [
 ('beech','Rotbuche','European beech', 'Meist ovale Blätter mit leicht welligem Rand; glatte graue Rinde und lange spitze Knospen.', 'Usually oval leaves with a slightly wavy margin; smooth grey bark and long pointed buds.', 'https://www.floraweb.de/php/artenhome.php?suchnr=2357'),
 ('oak','Stieleiche','Pedunculate oak', 'Gelappte Blätter mit sehr kurzem Blattstiel; Eicheln. Diese Kombination unterscheidet die Stieleiche in der ausgewählten Vierergruppe.', 'Lobed leaves with a very short leaf stalk; acorns. This combination distinguishes pedunculate oak within the selected set of four.', 'https://www.floraweb.de/php/artenhome.php?suchnr=4685'),
 ('birch','Hängebirke','Silver birch', 'Dreieckige bis rautenförmige, doppelt gesägte Blätter; weiße, sich ablösende Rinde, bei älteren Bäumen unten dunkel und rissig.', 'Triangular to diamond-shaped leaves with a double-toothed margin; white peeling bark, dark and fissured at the base of older trees.', 'https://www.floraweb.de/php/artenhome.php?name-use-id=829'),
 ('maple','Bergahorn','Sycamore maple', 'Gegenständige, meist fünflappige Blätter mit grob gezähnten Lappen; Früchte mit zwei Flügeln.', 'Opposite, usually five-lobed leaves with coarsely toothed lobes; two-winged fruits.', 'https://www.wald.rlp.de/wald/baeume-unserer-waelder/bergahorn'),
]
VERTEBRATES = [
 ('shared','Welche Gemeinsamkeiten besitzen die typischen Vertreter der fünf Wirbeltiergruppen?', 'What do typical representatives of the five vertebrate groups share?', 'Eine Wirbelsäule und ein inneres Stützskelett aus Knochen oder Knorpel.', 'A backbone and an internal supporting skeleton made of bone or cartilage.', '29-1-chordates'),
 ('mammals','Welche wichtigen Merkmale kennzeichnen Säugetiere?', 'Which important traits characterise mammals?', 'Haare zumindest in einem Lebensabschnitt; Jungtiere werden mit Milch ernährt. Nicht alle Säugetiere sind lebendgebärend.', 'Hair during at least one life stage; young are fed milk. Not all mammals give live birth.', '29-6-mammals'),
 ('birds','Welches Körpermerkmal kennzeichnet Vögel?', 'Which body-covering trait characterises birds?', 'Federn. Flugfähigkeit ist kein notwendiges Merkmal aller Vögel.', 'Feathers. The ability to fly is not required of all birds.', '29-5-birds'),
 ('reptiles','Welche Merkmale kennzeichnen Reptilien in der klassischen Schulgruppierung ohne Vögel?', 'Which traits characterise reptiles in the traditional school grouping that excludes birds?', 'Trockene Haut mit verhornten Schuppen und Atmung mit Lungen; Fischschuppen sind keine Hornschuppen.', 'Dry skin with keratinised scales and breathing through lungs; fish scales are not horny scales.', '29-4-reptiles'),
 ('amphibians','Welches wichtige Hautmerkmal kennzeichnet Amphibien?', 'Which important skin trait characterises amphibians?', 'Feuchte, durchlässige Haut; Hautatmung ist möglich. Lungen oder Kiemen hängen von Art und Lebensabschnitt ab.', 'Moist, permeable skin; breathing through the skin is possible. Lungs or gills depend on species and life stage.', '29-3-amphibians'),
 ('fishes','Welche Merkmale kennzeichnen die typischen Fische der Schulbeispiele?', 'Which traits characterise typical fishes used in school examples?', 'Kiemen zur Atmung im Wasser und Flossen zur Fortbewegung. Es werden typische Vertreter verglichen; eine Schuppenpflicht für alle Fische wird nicht behauptet.', 'Gills for breathing in water and fins for movement. Typical representatives are compared; not all fishes are claimed to have scales.', '29-2-fishes'),
]
memory_specs = [
 ('selected_native_tree_species_knowledge','native_tree_species_memory','de_gymnasium_biology_native_tree_species', 'Heimische Laubbäume: Namen und Merkmale merken','Recall names and traits of native deciduous trees'),
 ('five_vertebrate_groups_traits','vertebrate_groups_memory','de_gymnasium_biology_vertebrate_groups', 'Wirbeltiergruppen: Merkmale merken','Recall vertebrate group traits'),
]
memgoals, traces = [], []
for origin, key, deck, title, titleen in memory_specs:
    memgoals.append({'id':None,'candidateKey':key,'nodeKind':'memory','semanticKind':'memorization','type':'atomic','contains':[],
      'title':title,'titleEn':titleen,'description':'Die lernende Person kann die kompakten Namen und Merkmale des zugehörigen Lerndecks zuverlässig aus dem Gedächtnis abrufen.',
      'descriptionEn':'The learner can reliably recall the compact names and traits in the corresponding learning deck.',
      'weight':1,'tags':['GK','LK','canonical','SekI','memorization','srs-deck:'+deck], 'requires':[], 'requiresCandidateKeys':[origin],
      'gradeBand':'5/6','applicability':{'jurisdiction':['DE-NI']},'deckId':deck,'originCandidateKeys':[origin],
      'status':'inactive_author_candidate','role':'candidate_author','stableIdAssigned':False,'humanApproval':False})
    cardsde, cardsen = [], []
    if origin == 'selected_native_tree_species_knowledge':
        for suffix, name, nameen, traits, traitsen, url in TREES:
            cid='biology_native_tree_species_'+suffix
            front=f'Welche Baumart unserer ausgewählten Lerngruppe passt zu diesen Merkmalen? {traits}'
            fronten=f'Which tree species in our selected learning group matches these traits? {traitsen}'
            cardsde.append({'id':cid,'front':front,'back':name+'. '+traits,'category':'Heimische Laubbäume','tags':['GK','LK','SekI']})
            cardsen.append({'id':cid,'front':fronten,'back':nameen+'. '+traitsen,'category':'Native deciduous trees','tags':['GK','LK','SekI']})
            traces.append({'cardId':cid,'deckId':deck,'originGoalId':None,'originCandidateKey':origin,'memoryGoalId':None,'memoryCandidateKey':key,
              'cardAuthorProposal':'kept','necessaryAuthorProposal':True,'whyNecessary':'Species name plus compact identifying traits must be available from memory; application to unseen material remains ordinary-goal assessment.',
              'factPrimaryURL':url,'factRetrievalDate':'2026-10-05','factTextKind':'own_paraphrase_of_botanical_description','independentCardReviewPassed':False})
    else:
        for suffix, front, fronten, back, backen, section in VERTEBRATES:
            cid='biology_vertebrate_groups_'+suffix
            cardsde.append({'id':cid,'front':front,'back':back,'category':'Wirbeltiergruppen','tags':['GK','LK','SekI']})
            cardsen.append({'id':cid,'front':fronten,'back':backen,'category':'Vertebrate groups','tags':['GK','LK','SekI']})
            traces.append({'cardId':cid,'deckId':deck,'originGoalId':None,'originCandidateKey':origin,'memoryGoalId':None,'memoryCandidateKey':key,
              'cardAuthorProposal':'kept','necessaryAuthorProposal':True,'whyNecessary':'The literal source names all five groups and requires stating shared and distinguishing traits; no group can be omitted.',
              'factPrimaryURL':'https://openstax.org/books/biology-2e/pages/'+section,'factRetrievalDate':'2026-10-05','factTextKind':'own_paraphrase_of_primary_textbook','independentCardReviewPassed':False})
    for language, cards in [('de',cardsde),('en',cardsen)]:
        write('memory-deck.'+deck+'.'+language+'.inactive.candidate.json', {'deckId':deck,'title':title if language=='de' else titleen,'landscapeId':base['landscapeId'],'cards':cards,'status':'inactive_author_candidate'})
    origin_template=next(t for t in new if t['candidateKey']==origin)
    origin_template['proposedMemoryGoalIds']=[None]
    origin_template['proposedMemoryCandidateKeys']=[key]
    origin_template['proposedDeckIds']=[deck]
write('nine-missing-performance.DEEN.goal-templates.candidate.json', {'status':'inactive_author_candidate','role':'candidate_author','goalTemplates':new,'stableIdAssignments':[]})
write('two-memory-goals.DEEN.templates.candidate.json', {'status':'inactive_author_candidate','goalTemplates':memgoals,'stableIdAssignments':[]})
write('ten-card-origin-traces.candidate.json', {'status':'inactive_author_proposal_not_card_ledger','cardCount':len(traces),'originTraces':traces,'activeCardsAdded':0,'reviewerRequired':'Fresh independent M/card reviewer; resolve real origin and memory goal IDs before authoritative records.'})
write('memory-visibility-and-adoption-plan.candidate.json', {
 'status':'inactive_plan','existingCoreDeckInputs':[binding(ROOT/'curricula/DE/Gymnasium/memory-decks/de_gymnasium_biology_flashcards_core.de.json'),binding(ROOT/'curricula/DE/Gymnasium/memory-decks/de_gymnasium_biology_flashcards_core.en.json')],
 'existingCoreCardCount':17,'existingCoreDeckCoversTheseProposedCards':False,
 'requiredOrdinaryOrigins':[s[0] for s in memory_specs],
 'proposedDeckIds':[s[2] for s in memory_specs],
 'visibilityScopes':[{'jurisdiction':'DE-NI','stage':'SekI','gradeBand':'5/6','ordinaryCandidateKey':o,'memoryCandidateKey':m,'projectionRoleForBoth':'target','deckId':d,'currentVisibilityProven':False} for o,m,d,*_ in memory_specs],
 'adoptionChecks':['Assign reviewed stable IDs to ordinary goals first, then to memory goals; replace every null origin/memory ID with the corresponding current ID.',
 'Write individually reviewed goal fingerprints and kept necessary-card traces only after independent source/D/A/M/card reviews.',
 'Place canonical public memory nodes alongside the corresponding ordinary target goals, using stable subtree/goal references and explicit target role in the same resolved NI5/6 view.',
 'For every configured visibility scope, compile the actual reviewed composition view and assert that each visible memory_required ordinary goal has at least one referenced visible memory goal in that same scope.',
 'Ensure no dangling ordinary origin, orphan memory node, unreviewed active primary card, duplicate card or language count mismatch; preserve existing core deck and its unrelated origins.',
 'Re-run targeted native effectiveRequires after final placements because inherited cluster prerequisites can invalidate this unplaced result.',
 'Only then run the central required QA/protected-floor gates in the authorised adoption task; no floor status is claimed here.'],
 'noMemoryBlanketDecision':False,'authoritativeGoalOrCardRecordsCreated':False})

# Family-pedigree source use is a context performance of existing 440, not a duplicate content atom.
pedigree_context = {
 'status':'inactive_author_source_DAM_context','role':'candidate_author','goalId':PEDIGREE,
 'sourceBinding':source(SID['pedigree']),'globalDEENBodyPreserved':True,'globalGoalBefore':byid[PEDIGREE],
 'requiresBefore':edge['before'],'requiresAfterProposed':edge['after'],
 'positiveCompetence':['In einem Familienstammbaum die Folgen von Diploidie erläutern: Im einfachen autosomalen Ein-Merkmal-Modell liegen zwei erbliche Varianten vor; eine stammt von jedem Elternteil. Ein rezessives Merkmal kann bei Eltern mit unauffälligem Phänotyp verdeckt vorliegen und bei einem Kind sichtbar werden.',
 'Die Folgen der Rekombination beziehungsweise Neukombination elterlicher Erbinformation erläutern: Bei Keimzellbildung wird jeweils eine Variante für dieses Merkmal weitergegeben; bei Befruchtung können unterschiedliche Kombinationen entstehen, weshalb Geschwister im Familienstammbaum unterschiedliche Merkmalsausprägungen haben können.',
 'Die plausiblen Erbgänge aus der sichtbaren Verteilung mit eigenen möglichen Allelkombinationen begründen; aus endlichen Stammbäumen keine unveränderlichen Nachkommenquoten ableiten.',
 'Der ganze erhaltene 440-Kompetenzumfang bleibt maßgeblich: plausible autosomale oder gonosomale sowie dominante oder rezessive Erbgänge und Deutungsgrenzen. Für einen monohybriden autosomalen Fall ist Diploidie direkt anwendbar; bei gegebenen gonosomalen Modellen wird ein männliches X-Merkmal nicht fälschlich als zweikopisch beschrieben.'],
 'positiveCompetenceEn':['Explain the consequences of diploidy within a family pedigree: in the simple autosomal one-trait model two inherited variants are present, one from each parent. Parents with an unaffected phenotype may carry a recessive variant that becomes visible in a child.',
 'Explain the consequences of recombination or new combinations of parental genetic information: gamete formation transmits one variant for this trait; fertilisation can create different combinations, so siblings in the family pedigree may show different trait expressions.',
 'Justify plausible inheritance patterns from the visible distribution using self-produced possible allele combinations; do not infer fixed offspring ratios from a finite pedigree.',
 'Preserve the entire 440 competence: plausible autosomal or sex-linked and dominant or recessive patterns and interpretive limits. Diploidy applies directly to the autosomal example; a male X-linked trait is not incorrectly represented as having two copies.'],
 'providedModels':['Korrekte Symbollegende, ein in sich stimmiger fiktiver Stammbaum mit einem Merkmal und Beobachtungsbefunde; auf Nachfrage verständliche Notationskonventionen für alle betrachteten Erbgangsarten.',
 'Allele sind nichtmolekulare Modellzeichen. Es werden keine fertigen Genotypzuordnungen, keine erbgangsspezifische Diagnose und keine ausformulierte Diploidie-/Rekombinationserklärung als Aufgabenmaterial geliefert.'],
 'providedModelsEn':['A correct symbol legend, a coherent fictional one-trait pedigree and observations; understandable notation conventions for all considered inheritance patterns when needed.',
 'Alleles are non-molecular model symbols. Completed genotype placements, an inheritance diagnosis and a finished explanation of diploidy or recombination are not supplied as task material.'],
 'sourceRestriction':'S87: cytological/chromosomal and strongly simplified models; molecular DNA/protein mechanisms belong to SekII.',
 'recombinationScopeBoundary':'A monohybrid pedigree does not by itself demonstrate crossing-over or independent assortment of multiple loci. Those cytological mechanisms remain separate NI5base0b55/9e45 goals. This route must show the consequences of new parental combinations inside the family pedigree, not pretend a monohybrid ratio proves segment exchange.',
 'atomicityAuthorRationale':'An existing single pedigree-interpretation goal; the source explanation is the causal basis of the pedigree justification, so no independent second atom is created.',
 'memorySuitabilityAuthorProposal':'no_memory_needed','memoryRationale':'Two-copy inheritance and new combinations are applied and explained using the model. No fixed human chromosome count, disease catalogue or allele glossary is required for this source use; existing unrelated chromosome cards remain unchanged.',
 'requiresFreshIndependentSourceAndNativeDReview':True,'sourceCoverageApproved':False,'humanApproval':False}
write('existing-440-family-pedigree.full-clause-context.candidate.json',pedigree_context)

# A truthful global scientific correction, preserving all current prerequisites and applicability.
fixed_description = 'Die lernende Person kann beschreiben, wie Mutation genetische Varianten entstehen lässt und Rekombination vorhandene Erbinformation neu kombiniert, und wie Selektion durch unterschiedlichen Fortpflanzungserfolg die Häufigkeit erblicher Varianten in Populationen verändert.'
fixed_description_en = 'The learner can describe how mutation produces genetic variants and recombination creates new combinations of existing genetic information, and how selection changes the frequencies of heritable variants in populations through differences in reproductive success.'
global_after = copy.deepcopy(byid[EVOLUTION]); global_after['description']=fixed_description;global_after['descriptionEn']=fixed_description_en
he_url=read(SOURCES/'HE-download.receipt.json')
global_fix={'status':'inactive_global_scientific_correction_proposal','role':'candidate_author','goalId':EVOLUTION,
 'before':byid[EVOLUTION],'after':global_after,'changedFields':['description','descriptionEn'],
 'scientificDefect':'Selection is not a cause that generates new genetic variants. Mutation produces new variants; recombination creates new combinations; selection changes frequencies through differential reproductive success and can maintain existing variation.',
 'requiresPreserved':True,'molecularScopePreserved':True,'jurisdictionAndProvenancePreserved':True,
 'HEPrimaryWorkingPDF':binding(SOURCES/'HE-kc-biology-2024.working.pdf'),'HEIndependentDownloadReceipt':he_url,
 'literalPrimaryBindings':[{'physicalPage':36,'printedPage':36,'heading':'Q1.1 Von der DNA zum Protein','course':'grundlegendes Niveau (Grundkurs und Leistungskurs)','literal':'grundlegende Prinzipien der Evolution: Rekombination, Mutation','textCache':binding(SOURCES/'HE-physical-page-036.txt')},
 {'physicalPage':40,'printedPage':40,'heading':'Q2.1 Evolutionsgedanken','course':'grundlegendes Niveau (Grundkurs und Leistungskurs)','literal':'weitere grundlegende Prinzipien der Evolution: Selektion, Verwandtschaft, Variation, Fitness, Isolation, Drift, Artbildung, Biodiversität, Koevolution, populationsgenetischer Artbegriff','textCache':binding(SOURCES/'HE-physical-page-040.txt')},
 {'physicalPage':21,'printedPage':21,'heading':'Basiskonzept Entwicklung','kind':'supporting_conceptual_context','paraphrase':'Sexual reproduction increases variation through recombination; variation together with selection supports species change.','textCache':binding(SOURCES/'HE-physical-page-021.txt')}],
 'HEExtractionCorrectionProposal':{'sourceGoalId':'99776111-acc2-4497-bc79-caef32de4a25','sourceExtractionInput':binding(HEEXTRACT),
 'defect':'The current literal source fields repeat the scientifically false authored goal sentence rather than the actual primary bullet.',
 'newQ1LiteralSourceText':'grundlegende Prinzipien der Evolution: Rekombination, Mutation',
 'keepRawHistoricalAuthoredWordingAsHistoricalOnly':True,'rebindActualTableBulletPage':36,
 'Q1MappingConsequence':'Q1.1.5 alone cannot justify selection as a Q1 literal obligation. Replace the false literal binding and assess Q1 mutation/recombination as a partial contribution to the corrected wider canonical goal.',
 'Q2MappingConsequence':'Selection must be bound to its actual Q2.1 literal bullet or supporting concept context; the complete Q2 bullet is much wider and its other normative items remain mapped through their own existing goals.',
 'sourceScopeNotTrimmed':True,'historicalExtractionFilesMutated':False},
 'NISourceReuseAfterFix':'Still unsuitable as the compulsory NI SekI path: ffef and its DNA/protein prerequisites are preserved. Existing narrow non_molecular_evolutionary_interplay template is therefore not a duplicate.',
 'semanticAtomicityAuthorProposal':'Integrated relation among generation/recombination of variation and frequency change; fresh global A review required because wording and source bindings change.',
 'memoryAuthorProposal':'no_memory_needed','memoryAuthorRationale':'Requires causal distinction and explanation using worked population examples, not memorising a new list; global current M records must nevertheless be rebound after review.',
 'openGlobalHolds':['Fresh independent review of every actual regional source binding listed in the inventory; their complete regional primary PDFs were not all retrieved in this NI author task.',
 'Correct HE source extraction and exact/partial decisions without erasing the remaining full Q1/Q2 normative scope.',
 'Fresh DEEN native D/A/M and affected context bindings before adoption; this inactive scientific proposal is not an approved global repair.'],
 'independentD2Passed':False,'humanApproval':False}
write('global-9f.DEEN-scientific-fix-and-source-correction.candidate.json',global_fix)
inactive = copy.deepcopy(base)
for g in inactive['goals']:
    if g['id']==PEDIGREE: g['requires']=edge['after']
    if g['id']==EVOLUTION: g['description']=fixed_description;g['descriptionEn']=fixed_description_en
write('canonical.existing-two-changes.inactive.candidate.json',inactive)

mapping_inventory=[]
def walk(value, path=()):
    if isinstance(value,dict):
        if EVOLUTION in value.get('canonicalGoalIds',[]) or value.get('canonicalGoalId')==EVOLUTION or value.get('targetGoalId')==EVOLUTION:
            yield path,value
        for k,v in value.items(): yield from walk(v,path+(str(k),))
    elif isinstance(value,list):
        for i,v in enumerate(value): yield from walk(v,path+(str(i),))
for p in sorted((ROOT/'curricula/DE/Gymnasium/mapping').rglob('*.json')):
    if 'biolog' not in p.name.lower():continue
    try:j=read(p)
    except (ValueError,UnicodeDecodeError):continue
    matches=[{'jsonPath':'.'.join(path),'currentRecord':value,'afterTargetId':EVOLUTION,
              'afterTargetBodyDigest':'sha256:'+hashlib.sha256(json.dumps(global_after,sort_keys=True,ensure_ascii=False).encode()).hexdigest(),
              'bindingConsequence':'Current target-body-bound review is stale on adoption; complete regional source operator, stage, breadth and prerequisite audit required. No automatic exact-match retention.'} for path,value in walk(j)]
    if matches:mapping_inventory.append({'input':binding(p),'matchingRecordCount':len(matches),'records':matches})
write('global-9f.current-mapping-binding-consequences.candidate.json',{'status':'inactive_inventory_not_reapproval','goalId':EVOLUTION,'files':mapping_inventory,'matchingFileCount':len(mapping_inventory),'matchingRecordCount':sum(len(i['records']) for i in mapping_inventory),'sourceOrMappingFilesChanged':0,'regionalSourceReviewComplete':False})

# All old endpoint and retained target bodies are explicitly considered, without approving them by association.
reasons={
 IDENTIFY:'Appropriate actual key-aid performance in the NI5/6 key context. Aids must specifically include a real identification key. Does not alone establish remembered species knowledge or hierarchy.',
 PEDIGREE:'Appropriate existing pedigree interpretation with proposed non-molecular prerequisite and explicit source-DAM context; no approved full-source claim before fresh review.',
 EVOLUTION:'Scientifically wrong active DEEN wording and molecular prerequisite path; proposed correction retains that path, so no NI SekI reuse.',
 '55bdfb1d-5c14-5b1c-bc8e-4ab428ef59ba':'Orders a fixed set of life characteristics, not arbitrary organisms or observations by given criteria.',
 '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd':'Wild/useful plant distinction plus traits is a limited plant contribution; neither full key competence nor remembered knowledge of the selected species group.',
 '4d1b2991-9279-591f-a0b1-0ff184ffd8e5':'Upper-stage molecular-to-biosphere conceptual network is much wider and not an assessable individual/population distinction.',
 'b56a5408-ed84-57f2-a9dd-d1a67496fdd1':'Upper-stage comparison of three species concepts is wider than simple reproductive-community use and is not individual/population distinction.',
 '8be0001b-4fe0-5ea1-9d61-b3c4bbb16660':'Disease pedigree interpretation can be supporting context but does not explicitly require explaining both diploidy and recombination consequences.',
 'b8fc739d-f5de-5f83-92fe-28dc6597add5':'Simple dominant/recessive inheritance supports 440 but does not cover the entire family source explanation or individual/non-heritable contrast.',
 '1d2b1038-dcd5-529a-b085-9e14f1d58c76':'Describes mitosis and simplified meiosis, not explaining variability through mutation plus recombination, sex/asex variability advantage or evolutionary interplay.',
 '4e12ba43-a58c-5611-8c43-3cc0c8465e33':'Bird/fish reproduction strategy comparison does not require sex/asex comparison by variability.',
 'bac3e333-d044-559e-8d8e-b8eff4af2b56':'Describes development/domestication of one mammal; exact causal selection breeding procedure and common-ancestor explanation are absent.',
 '6bfcb8da-e337-5395-a50a-848f6a3abf4d':'Three modes of natural selection are much wider than NI5/6 artificial breeding and do not cover the complete mutation/recombination/selection source interplay.',
 '002543f9-2d14-5c57-99b4-fb4bf7e53734':'Allopatric/sympatric speciation is a specific upper-stage mechanism comparison, not the full basic population adaptation or mechanism interplay source performance.',
 'ac40db32-5dc7-5c43-8771-bf805d24aa3b':'Contrasts theories; naming or contrasting a theory does not establish a concrete causal explanation of the source mechanisms.',
 'ac69483b-6a77-573d-a7c0-add32bb867e2':'Interprets mammal trait suitability for habitat, not population evolutionary causation or individual/non-heritable versus heritable distinction.',
 '7008979d-7890-5f7b-ad07-27b8bb597cbe':'Broad fossils/homology/endosymbiosis evidence does not explicitly interpret family similarity or explain domestic/wild common ancestry at NI5/6.',
 'bdbb1a13-f448-5536-86ab-894805e2f6be':'Mammal organ structure/function does not cover traits and commonalities of all five vertebrate groups.',
 '9dff0360-c2e9-5e43-af8b-87e264281cf7':'Evaluates historical/current classification approaches with pedigree/evolution-evidence prerequisites; not given-criterion ordering or simple morphological hierarchy.',
 '0db20819-ee94-54c6-8ecb-aff8c9b7419e':'Trait/aids identification is neither five-group knowledge nor hierarchical placement; its effective path also includes upper-stage classification.',
 'ffef97e3-12d6-5090-9816-46ab9e57fae2':'Molecular mutation-type explanation with DNA/protein path directly conflicts with NI SekI restriction.',
 'f95b3b49-dacd-5d17-be2d-98b404b709c3':'Genuine identification knowledge for plants AND animals of a forest OR body of water; both its wider habitat scope and its native photosynthesis-cluster route differ from a selected NI5/6 tree group. Narrowing its global body/prerequisites would lose its existing HE scope.',
 'ebf5730d-4e40-5d16-ae93-05106bcd2f70':'Habitat typing/subareas is not species knowledge; its requires contains the photosynthesis/cell-respiration cluster.',
}
all_current_text='\n'.join(json.dumps(g,ensure_ascii=False) for g in base['goals'])
patterns={
 'order':r'ordn|sort|criter|kriter|classif',
 'levels':r'population|organism|individ|ebene',
 'sexual':r'fortpflanz|reproduc|rekom|recomb|asexual|geschlecht',
 'species':r'artenkennt|species|bestimm|pflanz|baum|tree|habitat',
 'breeding':r'zücht|zucht|breed|domest|selekt|select',
 'adjustment':r'anpass|angepass|adapt|heritable|erblic',
 'family':r'famil|verwand|kinship|pedigree',
 'ancestor':r'vorfahr|ancestor|wild|haustier|domestic',
 'vertebrates':r'wirbelt|vertebr|mammal|säuget|vögel|birds|amphib|reptil|fische|fishes',
 'pedigree':r'diploid|rekom|recomb|stammbaum|pedigree',
}
scan=[]
for g in base['goals']:
    body=' '.join(str(g.get(k,'')) for k in ['title','titleEn','description','descriptionEn'])
    hits=[k for k,p in patterns.items() if re.search(p,body,re.I)]
    scan.append({'goalId':g['id'],'semanticKind':g.get('nodeKind') or g.get('type'), 'isContentLeafCandidate':not g.get('contains'),
                 'searchTopicHits':hits,'actualDEEN':{k:g.get(k) for k in ['title','titleEn','description','descriptionEn']},'requires':g.get('requires',[]),'contains':g.get('contains',[])})
write('all-current441-and-NI5base446.DEEN.inspection.snapshot.json',{'status':'author_input_inspection_not_D_review','activeInput':binding(ACTIVE),'baseInput':binding(BASE),'active441FullSnapshot':active,'NI5base446FullSnapshot':base,'full446SemanticSearchRows':scan,'all446Searched':True,'fullIndependentGoalReviewClaim':False})
reuse_rows=[]
for r in records:
    targets=list(dict.fromkeys(r['mappingDecisionBefore']['canonicalGoalIds']+r['otherExistingMappingsRetainedButNotReapproved']))
    reuse_rows.append({'sourceBinding':source(r['sourceGoalId']), 'oldTargetsInspected':[{'goalId':i,'actualDEENBody':{k:byid[i].get(k) for k in ['title','titleEn','description','descriptionEn']},'actualRequires':byid[i].get('requires',[]),'authorReuseReason':reasons[i], 'oldBindingReapproved':False} for i in targets]})
write('sixteen-all-old-endpoints-and-retained-targets.reuse-inspection.candidate.json', {'status':'inactive_author_inspection','records':reuse_rows,'additionalClosestAlternatives':[{'goalId':i,'actualBody':byid[i],'reason':reasons[i]} for i in ['f95b3b49-dacd-5d17-be2d-98b404b709c3','ebf5730d-4e40-5d16-ae93-05106bcd2f70']],'oldMappingsBlindlyReapproved':False})

route_refs={
 'order':('candidate','order_given_criteria'), 'key':('existing',IDENTIFY), 'levels':('candidate','distinguish_organism_population'),
 'pedigree':('existing',PEDIGREE), 'variability':('candidate','non_molecular_mutation_recombination_variability'),
 'sexual':('candidate','sexual_reproduction_variability_advantage'), 'species':('candidate','selected_native_tree_species_knowledge'),
 'species_concept':('candidate','simple_reproductive_species_concept'), 'breeding':('candidate','breeding_selection_variants'),
 'adaptation':('candidate','non_molecular_evolutionary_interplay'), 'interplay':('candidate','non_molecular_evolutionary_interplay'),
 'adjustment':('candidate','individual_adjustment_heritable_adaptation'), 'family':('candidate','family_similarity_kinship_indication'),
 'ancestor':('candidate','domestic_wild_common_ancestors'), 'vertebrates':('candidate','five_vertebrate_groups_traits'),
 'hierarchy':('candidate','morphological_hierarchical_classification'),
}
full_routes=[]
for sidkey,(kind,target) in route_refs.items():
    r=record_byid[SID[sidkey]]
    full_routes.append({'sourceGoalId':SID[sidkey],'sourceBinding':source(SID[sidkey]),'status':'inactive_full_clause_route_proposed',
      'canonicalGoalIdsAfterProposed':[target] if kind=='existing' else [],'candidateKeysAfterProposed':[target] if kind=='candidate' else [],
      'oldFullMappingRecord':r['mappingDecisionBefore'],
      'replaceThisSourceScopedTargetListOnly':True,'otherRegionalMappingsUntouched':True,
      'oldTargetsNotUsedAsCompleteClauseProof':[i for i in r['mappingDecisionBefore']['canonicalGoalIds'] if not (kind=='existing' and i==target)],
      'fullClauseOperatorAndBreadthPreserved':True,'familyContextReference':'existing-440-family-pedigree.full-clause-context.candidate.json' if sidkey=='pedigree' else None,
      'keyContextRequirement':'Use an actual complete identification key; learner follows key decisions and checks result on a new organism, not a pre-labelled answer.' if sidkey=='key' else None,
      'proposedClosure':'Complete source clause has an explicit author route; no current source-ledger coverage or adoption approval.',
      'authorScopeUnresolvedClausePart':False,'adoptionHolds':['Fresh independent source review of this full clause route','Fresh actual native Book-D reviews after real stable IDs, placements and complete current context','Current A/M and memory-card/visibility binding where required'],
      'currentCoverageApproved':False,'humanApproval':False})
assert len(full_routes)==16
write('sixteen-full-clause-routes.candidate.json',{'status':'inactive_author_candidate','role':'candidate_author','routes':full_routes,'sourceClausesProposed':16,'currentSourceCoverageClaim':False,'remainingAuthorScopeClauseHolds':[],'global9fAdoptionHoldsRetained':global_fix['openGlobalHolds']})

ten=[]
for k in ['order','levels','pedigree','sexual','species','breeding','adjustment','family','ancestor','vertebrates']:
    kind,target=route_refs[k]
    ten.append({'holdPart':k,'sourceGoalId':SID[k],'afterProposed':{'existingGoalId':target if kind=='existing' else None,'candidateKey':target if kind=='candidate' else None},
      'resolutionAuthorProposal':'reuse_existing_440_with_source_bound_causal_context' if k=='pedigree' else 'narrow_new_DEEN_template_after_existing_reuse_inspection',
      'normativeClauseDropped':False,'noMolecularRequiredPath':'verified_by_separate_native_receipt','approvedCoverage':False})
write('ten-hold-remediation.summary.candidate.json',{'status':'inactive_author_candidate','role':'candidate_author','tenParts':ten,'newOrdinaryTemplates':9,'existing440Reuse':1,'unchangedPriorTemplatesReferenced':4,'newMemoryGoalTemplates':2,'newCards':10,'stableIdsAssigned':0,'newIndependentDReviewClaim':False,'machineM7Claim':False,'humanApproval':False})

# Input fingerprints bind exact current context, candidates and all inspected mapping records.
inputs=[ACTIVE,BASE,NI,HEEXTRACT,PRIOR/'four-missing-seki.goal-templates.candidate.json',PRIOR/'sixteen-source-bindings.before-after-and-holds.candidate.json',PRIOR/'one-existing-prerequisite.before-after.candidate.json',PRIOR/'primary-source.extraction-corrections.candidate.json',PRIOR/'canonical.edge-only.inactive.candidate.json',ROOT/'AGENTS.md',ROOT/'docs/qa-ci/curriculum-mapping-workbench.md',ROOT/'app/src/hooks/useLandscapes.ts',ROOT/'app/src/utils/authoring/canonicalAuthoring.ts',ROOT/'curricula/DE/Gymnasium/memory-decks/de_gymnasium_biology_flashcards_core.de.json',ROOT/'curricula/DE/Gymnasium/memory-decks/de_gymnasium_biology_flashcards_core.en.json']
inputs += [ROOT/i['input']['path'] for i in mapping_inventory]
write('exact-author-input-bindings.json',{'status':'author_inputs_frozen_before_independent_reviews','createdAtUTC':datetime.now(timezone.utc).isoformat(),'inputs':[binding(p) for p in dict.fromkeys(inputs)],'priorIndependentSourceReviewAFolderUntouched':True,'PContentsRead':False,'PContentsCreated':False,'foreignCurrentDReviewOutputsRead':False})
for n in [103,104]:
    subprocess.run(['pdftotext','-f',str(n),'-l',str(n),'-layout',str(NI),str(SOURCES/('NI-physical-page-%03d.txt'%n))],check=True)
write('source-stage-and-operator-author-bindings.json',{'status':'inactive_author_binding','sourceClauses':[source(r['sourceGoalId']) for r in records],
 'operatorDefinitionPages':[binding(SOURCES/('NI-physical-page-%03d.txt'%n)) for n in [103,104]],
 'stageRestrictions':[{'page':87,'binding':binding(SOURCES/'NI-physical-page-087.txt'),'restriction':'Cytological/chromosomal mitosis and meiosis; strongly simplified gene/genproduct/trait relation in SekI; molecular DNA structure, replication, protein biosynthesis and point mutation deepening in SekII.'},
 {'page':89,'binding':binding(SOURCES/'NI-physical-page-089.txt'),'restriction':'Mutation in SekI is phenomenological/descriptive; molecular genetics follows in SekII.'}],
 'operatorDecisions':{'ordnen':'Consistent application of given criteria; no compulsory invention of hierarchy.','unterscheiden':'Apply the relevant distinction, not merely list vocabulary.','deuten':'Put observations into an explanatory context; family similarity stays an indication.','erläutern':'Make the procedure or causal consequence intelligible using additional information.','erklären':'Show the causal connection; do not substitute naming or description of an unrelated example.','nennen':'State elements without demanding an extra evolutionary theory explanation.','verfügen über Artenkenntnis':'Knowledge of names and recognition traits within a concrete selected group, not just use of an answer-producing key.'},
 'noStageColumnCollapsed':True,'fiveSixBreedingAndKinshipDoNotRequireDNA':True})
print(json.dumps({'ordinaryNew':len(new),'priorReferenced':len(prior),'memoryNew':len(memgoals),'cards':len(traces),'fullClauseRoutes':len(full_routes),'tenHolds':len(ten),'global9fBindingFiles':len(mapping_inventory),'writesOutsideAuthorizedFolder':0}))
