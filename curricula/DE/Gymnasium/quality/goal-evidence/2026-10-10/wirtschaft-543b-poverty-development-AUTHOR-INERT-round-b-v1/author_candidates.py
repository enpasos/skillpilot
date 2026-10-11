#!/usr/bin/env python3
"""Prepare only repository-local INERT author candidates; never edit active inputs."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import shutil

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
BOOK = 'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
ORIGINAL = '543bf91f-f6c6-5b1b-ba9e-43de321d8c7f'
REUSE = 'da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0'
MACRO = '04809186-3f65-579d-b300-af9ed3e100c1'
PRACTICE = '036ea7f9-2a33-502f-8729-983fa8054694'
REVIEW_ID = 'wirtschaft-543b-poverty-development-author-inert-round-b-v1'
STAMP = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

def digest(b):
    return 'sha256:' + hashlib.sha256(b).hexdigest()

def write_json(name, value):
    p = OUT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def localized(i, de, en):
    return {'id': i, 'textDe': de, 'textEn': en}

def expectation(i, de, en, performance_de, performance_en):
    return {'id': i, 'essentialUnderstandingDe': de, 'essentialUnderstandingEn': en,
            'observablePerformanceDe': performance_de, 'observablePerformanceEn': performance_en}

def case(i, demand_de, demand_en, performance_de, performance_en, focus_de, focus_en):
    return {'id': i, 'taskDemandDe': demand_de, 'taskDemandEn': demand_en,
            'expectedPerformanceDe': performance_de, 'expectedPerformanceEn': performance_en,
            'understandingFocusDe': focus_de, 'understandingFocusEn': focus_en}

def coverage(ids):
    # Existing v2 schema structure, not an added quota of tasks or case labels.
    return {'requiredExpectationIds': ids, 'alternativeExpectationGroups': [],
            'minimumIndependentDemonstrations': 2, 'freshVariationRequired': True,
            'independentTransferRequired': True}

canonical_bytes = (ROOT / CANONICAL).read_bytes()
landscape = json.loads(canonical_bytes)
by_id = {g['id']: g for g in landscape['goals']}
book_bytes = (ROOT / BOOK).read_bytes()
book = json.loads(book_bytes)
assert len(book['evidenceReviewPaths']) == 1
p_path = book['evidenceReviewPaths'][0]
p_bytes = (ROOT / p_path).read_bytes()
selected_ids = {ORIGINAL, REUSE, MACRO,
    'fed15db6-e700-514d-a65e-6c2a34f1c81a', '4fef149e-84c0-59af-b056-0a0bf97dbecd',
    'b8c7458a-7642-53bf-b20e-d2a715ff6ed7', 'f1f73ebe-286a-52e8-a2e1-4383ece6e9ec',
    '4cccf0da-a0f4-593a-9bf3-4a68c790af40', 'e5560c43-c25a-5356-a282-c602945219ae'}
selected_p = {}
for line in p_bytes.splitlines(keepends=True):
    record = json.loads(line)
    if record.get('goalId') in selected_ids:
        assert record['goalId'] not in selected_p
        selected_p[record['goalId']] = (record, line)
assert selected_ids == set(selected_p)

# Retain byte-exact source files and the target's actual historical materials.
(OUT / 'history/materials').mkdir(parents=True, exist_ok=True)
(OUT / 'references').mkdir(parents=True, exist_ok=True)
(OUT / 'history/canonical.original.bytes.json').write_bytes(canonical_bytes)
(OUT / 'history/current-book-config.original.bytes.json').write_bytes(book_bytes)
(OUT / 'history/original-543b.positive.record.jsonl').write_bytes(selected_p[ORIGINAL][1])
(OUT / 'history/original-da734.positive.record.jsonl').write_bytes(selected_p[REUSE][1])
write_json('history/original-543b.goal.json', by_id[ORIGINAL])
write_json('history/original-036ea.practice.goal.json', by_id[PRACTICE])
materials = []
for link in by_id[ORIGINAL].get('resourceLinks', []):
    assert link['type'] == 'goal-visualization'
    source = ROOT / 'app/public' / link['url'].lstrip('/')
    target = OUT / 'history/materials' / source.name
    shutil.copyfile(source, target)
    materials.append({'resourceLink': link, 'sourcePath': str(source.relative_to(ROOT)),
        'historyPath': str(target.relative_to(OUT)), 'sha256': digest(source.read_bytes()),
        'byteExact': source.read_bytes() == target.read_bytes()})
write_json('history/materials.manifest.json', materials)
(OUT / 'references/selected-operative-positive-records.exact.jsonl').write_bytes(
    b''.join(selected_p[i][1] for i in sorted(selected_ids)))
reference_goal_ids = selected_ids | {PRACTICE, 'd0ad0bbf-93ab-52f4-adda-9bb4e3571928',
    '6bf2d1cc-e745-50dd-a617-71c06a6c6945'}
write_json('references/whole-neighbor-goals.current.json',
    [by_id[i] for i in sorted(reference_goal_ids)])

# One competency survives under its established mastery identity. Strategy
# competencies are referenced by existing identities rather than duplicated.
candidate_goal = copy.deepcopy(by_id[ORIGINAL])
candidate_goal.update({
    'title': 'Armutsindikatoren sachgerecht vergleichen',
    'titleEn': 'Compare poverty indicators appropriately',
    'description': 'Die lernende Person kann Armutsquote, Armutstiefe und nichtmonetäre Mangelindikatoren anhand ihrer Messgegenstände und Vergleichsbedingungen vergleichen und abweichende Befunde begründen.',
    'descriptionEn': 'The learner can compare poverty incidence, poverty depth and nonmonetary deprivation indicators through what they measure and the conditions for comparison, and explain differing findings.',
    'semanticKind': 'curricularAtomic',
    # The existing approved image depicts both former facets; retain it only in
    # history until whole-goal and visualization follow-up review is complete.
    'resourceLinks': [],
})
candidate_landscape = copy.deepcopy(landscape)
candidate_landscape['goals'] = [candidate_goal if g['id'] == ORIGINAL else g
    for g in candidate_landscape['goals']]
write_json('candidate.landscape.INERT.json', candidate_landscape)
write_json('whole-goal.candidates.INERT.json', {
    'schemaVersion': 1, 'authoringContract': 'inert-goal-atomization-author-v1',
    'activationState': 'INERT', 'landscapeId': landscape['landscapeId'],
    'revisedWholeGoals': [candidate_goal],
    'unchangedReusedWholeGoals': [by_id[REUSE], by_id[MACRO],
        by_id['4fef149e-84c0-59af-b056-0a0bf97dbecd']],
    'newGoalIds': [], 'preservedOriginalGoalId': ORIGINAL,
    'semanticAtomicReviewDecision': None,
})

measurement = {
    'archetype': 'data',
    'expectations': [
        expectation('indicator-objects',
            'Die Armutsquote zählt Personen unter einer festgelegten Einkommensgrenze. Die hier definierte Armutstiefe berücksichtigt positive Einkommenslücken und bezieht sie auf Grenze und gesamte Bezugsbevölkerung. Wasser- oder Schulunterversorgung misst einen anderen Mangel. Gleiche Quote lässt unterschiedliche Tiefe zu; mehrere Mangelquoten bilden ohne Angaben zu Überschneidungen keinen gemeinsamen Gesamtwert.',
            'Poverty incidence counts people below a specified income line. Poverty depth as defined here accounts for positive income gaps relative to the line and the full reference population. Lack of safe water or schooling measures another deprivation. Equal incidence allows different depth; multiple deprivation rates do not form one total without overlap information.',
            'Die Person berechnet aus angegebenen Verteilungen die Quote und die definierte normierte Lücke, erklärt unterschiedliche Befunde und ordnet nichtmonetäre Quoten ihrem jeweiligen Messgegenstand zu. Bei fehlenden Überschneidungsdaten gibt sie einen begründeten möglichen Bereich statt einer scheinbar exakten Gesamtquote an.',
            'The learner calculates incidence and the defined normalised gap from supplied distributions, explains differing findings, and links nonmonetary rates to their measured deprivation. When overlap data are missing, they give a justified possible range rather than a seemingly exact combined rate.'),
        expectation('comparability-and-claims',
            'Ein Armutsvergleich benötigt eine ausgewiesene Grenze, ein gemeinsames Preisniveau sowie klare Bezugsgruppen und Zeitpunkte. Ein sinkender monetärer Indikator ist mit unveränderter nichtmonetärer Unterversorgung vereinbar. Wiederholte Querschnittsdaten beschreiben Gruppenlagen, ohne den Einkommensverlauf jeder einzelnen Person zu belegen.',
            'A poverty comparison needs a stated line, a common price basis, and clear populations and dates. A falling monetary indicator can coexist with unchanged nonmonetary deprivation. Repeated cross-sectional data describe population outcomes without establishing every individual income trajectory.',
            'Die Person bringt nominale Einkommen und Armutsgrenze auf dieselbe Preisbasis, vergleicht die so gewonnenen Indikatoren und unterscheidet Prozentpunkte von relativer Veränderung. Sie begründet anhand der Daten, welche Aussagen über monetäre und nichtmonetäre Armut sowie einzelne Menschen möglich sind.',
            'The learner places nominal incomes and the poverty line on the same price basis, compares the resulting indicators, and distinguishes percentage points from relative change. They use the data to justify the available claims about monetary and nonmonetary poverty and individual people.'),
    ],
    'coverageExpectations': coverage(['indicator-objects', 'comparability-and-claims']),
    'variationAxes': [
        localized('income-distribution', 'Gleiche Quote bei unterschiedlichen Lücken; Veränderung von Quote und Tiefe im Zeitvergleich.', 'Equal incidence with different gaps; changes in incidence and depth over time.'),
        localized('price-and-reference', 'Einheitliche reale Grenze oder nominale Daten mit vorgegebener Preisumrechnung; ausgewiesene Bezugsbevölkerung.', 'A common real line or nominal data with a supplied price conversion; an explicit reference population.'),
        localized('nonmonetary-measure', 'Wasser- und Schulzugang sowie bekannte oder fehlende Überschneidungen zwischen Mangelgruppen.', 'Water and schooling access, with known or missing overlap between deprived groups.'),
    ],
    'applicationCaseBriefs': [
        case('equal-incidence-different-depth',
            'Zwei fiktive Regionen R und S haben je 100 Einwohnerinnen und Einwohner. Alle Einkommen sind reale Monatsbeträge in derselben Recheneinheit; die Armutsgrenze beträgt in beiden Regionen 100. Als arm gilt Einkommen unter 100. In R verdienen 20 Personen 50, weitere 20 verdienen 90 und die übrigen 60 verdienen 140. In S verdienen 40 Personen 80 und die übrigen 60 verdienen 140. Definiert ist die Armutstiefe als Summe aller positiven Lücken zur Grenze, geteilt durch 100 mal Einwohnerzahl. In R fehlen 30 Personen sicherer Wasserzugang und 20 verlässlicher Schulzugang; in S sind es 20 und 35 Personen. Die Überschneidungen der Mangelgruppen sind nicht angegeben. Berechne und vergleiche Armutsquote und Tiefe. Prüfe die Aussage, beide Regionen seien gleich arm. Bestimme außerdem den möglichen Anteil mit mindestens einem der beiden nichtmonetären Mängel und erläutere, weshalb kein eindeutiger Gesamtrang folgt.',
            'Two fictional regions R and S each have 100 residents. All incomes are real monthly amounts in the same accounting unit; the poverty line is 100 in both regions. Income below 100 counts as poor. In R, 20 people earn 50, another 20 earn 90, and the remaining 60 earn 140. In S, 40 people earn 80 and the remaining 60 earn 140. Poverty depth is defined as the sum of all positive gaps to the line divided by 100 times the population. In R, 30 people lack safe water and 20 lack reliable schooling; in S, the numbers are 20 and 35. Overlap between deprived groups is not supplied. Calculate and compare incidence and depth. Examine the claim that both regions are equally poor. Also identify the possible share with at least one of the two nonmonetary deprivations and explain why no unique overall ranking follows.',
            'Beide Quoten sind 40 %. R hat eine Einkommenslücke von 20×50+20×10=1.200 und Tiefe 12 %; S hat 40×20=800 und Tiefe 8 %. Der gleiche Anteil unter der Grenze verdeckt unterschiedliche durchschnittliche Lücken. Der Anteil mit Wasser- oder Schulmangel liegt in R zwischen 30 % und 50 %, in S zwischen 35 % und 55 %. Die unteren Grenzen gelten bei vollständiger Einbettung der kleineren Gruppe, die oberen bei fehlender Überschneidung. R zeigt größere monetäre Tiefe, S mehr Schulmangel; Wasserbefund und unbekannte Überschneidung erlauben kein vollständiges Rangurteil. Eine eigene nachvollziehbare Darstellung derselben Größen ist gleichwertig.',
            'Both incidence rates are 40%. R has an income gap of 20×50+20×10=1,200 and depth of 12%; S has 40×20=800 and depth of 8%. An equal share below the line conceals different average gaps. The share lacking water or schooling ranges from 30% to 50% in R and 35% to 55% in S. The lower bounds assume the smaller group is wholly contained in the larger; the upper bounds assume no overlap. R has greater monetary depth, while S has more schooling deprivation; the water findings and unknown overlap do not establish a complete ranking. An equivalent justified representation of these quantities is equally valid.',
            'Unterschiedliche Messgegenstände und begrenzte Zusammenfassung mehrerer Mangelquoten.',
            'Different measured objects and the limits of combining several deprivation rates.'),
        case('prices-time-and-persistent-deprivation',
            'Zwei anonyme Querschnittserhebungen eines fiktiven Gebietes erfassen zu t0 und t1 jeweils 200 Personen; individuelle Personenverläufe sind nicht verknüpft. Die reale Monatsarmutsgrenze in Preisen von t0 beträgt 100. Zu t0 verdienen 80 Personen real 75 und 120 Personen real 120. Das Preisniveau steigt bis t1 um 20 %; nominale t1-Beträge werden durch 1,20 geteilt, um t0-Kaufkraft zu erhalten. Zu t1 verdienen 60 Personen nominal 108 und 140 Personen nominal 180. Armutstiefe ist wieder die Summe positiver realer Einkommenslücken geteilt durch reale Grenze mal Bezugsbevölkerung. In beiden Erhebungen fehlen jeweils 50 Personen sicherer Wasserzugang und 40 verlässlicher Schulzugang. Vergleiche Armutsquote und Tiefe auf gemeinsamer Preisbasis. Beurteile die Rechnung mit einer unverändert nominalen Grenze von 100 sowie die Aussagen, Armut sei in jeder Dimension gesunken und jedem bisher armen Menschen gehe es besser.',
            'Two anonymous cross-sectional surveys of a fictional region each cover 200 people at t0 and t1; individual trajectories are not linked. The real monthly poverty line in t0 prices is 100. At t0, 80 people earn a real 75 and 120 earn a real 120. The price level rises by 20% by t1; nominal t1 amounts are divided by 1.20 to obtain t0 purchasing power. At t1, 60 people earn a nominal 108 and 140 earn a nominal 180. Depth is again the sum of positive real income gaps divided by the real line times the reference population. In both surveys, 50 people lack safe water and 40 lack reliable schooling. Compare incidence and depth at a common price basis. Assess using an unchanged nominal line of 100 and the claims that poverty fell in every dimension and every previously poor person is better off.',
            'Zu t1 entsprechen 108 und 180 nominal real 90 und 150; die passende nominale Grenze wäre 120. Die Quote sinkt von 80/200=40 % auf 60/200=30 %: 10 Prozentpunkte bzw. 25 % relativ. Die Tiefe sinkt von 80×25/(100×200)=10 % auf 60×10/(100×200)=3 %. Eine nominale Grenze von 100 würde zu t1 fälschlich niemanden als arm zählen. Wasser- und Schulmangel bleiben bei 25 % bzw. 20 %. Damit sind Verbesserungen der monetären Gruppenindikatoren belegt, keine Verbesserung aller Armutsdimensionen. Ohne verknüpfte Personendaten ist auch der Verlauf jedes ehemals armen Menschen offen.',
            'At t1, nominal 108 and 180 equal real 90 and 150; the appropriate nominal line would be 120. Incidence falls from 80/200=40% to 60/200=30%: 10 percentage points or 25% relatively. Depth falls from 80×25/(100×200)=10% to 60×10/(100×200)=3%. A nominal line of 100 would incorrectly count nobody as poor at t1. Water and schooling deprivation remain at 25% and 20%. The monetary population indicators improve, while improvement in every poverty dimension is unproved. Without linked individual records, every formerly poor person’s trajectory remains unknown.',
            'Vergleichbare Kaufkraft, unterschiedliche Armutsdimensionen und Gruppen- gegenüber Personenaussagen.',
            'Comparable purchasing power, distinct poverty dimensions, and population versus individual claims.'),
    ],
}

strategy = {
    'archetype': 'concept',
    'expectations': [expectation('diagnosis-mechanism-access',
        'Armutsbekämpfung verbindet materielle Sicherung mit nutzbarem Zugang zu Versorgung und gesellschaftlicher Teilhabe. Transfers verändern verfügbare Einkommen unmittelbar, während Versorgung oder Qualifizierung andere Engpässe unter eigenen Zeit-, Kapazitäts- und Zugangsbedingungen bearbeiten. Ein relativer Einkommensindikator beschreibt eine Einkommenslage, ohne sämtliche Mängel zu erfassen. Budget, tatsächliche Erreichbarkeit und überprüfbare Ergebnisse tragen den Vergleich.',
        'Poverty reduction combines material security with usable access to services and social participation. Transfers change disposable income directly, while services or training address other bottlenecks under their own timing, capacity and access conditions. A relative-income measure describes income circumstances without capturing every deprivation. Budgets, actual reach and verifiable outcomes support comparison.',
        'Die Person ordnet Transfers, zugängliche Versorgung oder Qualifizierung den angegebenen Ursachen zu, erklärt ihre Einkommens- und Zugangswege und vergleicht sie nach Bedürfnissen, Erreichbarkeit, Finanzierung und Zeitraum. Sie begründet eine durch die Daten tragbare Priorität oder Kombination und benennt passende Ergebnisindikatoren und verbleibende Bedingungen.',
        'The learner links transfers, accessible services or training to the supplied causes, explains their income and access mechanisms, and compares needs, reach, funding and timing. They justify a priority or combination supported by the data and identify suitable outcome indicators and remaining conditions.')],
    'coverageExpectations': coverage(['diagnosis-mechanism-access']),
    'variationAxes': [
        localized('poverty-and-access', 'Relatives Einkommen und Mobilität; Wohnkosten, Qualifikation und geringer Zugang zu bestehenden Hilfen.', 'Relative income and mobility; housing costs, qualifications and low access to existing support.'),
        localized('channel-and-time', 'Unmittelbare Einkommenshilfe, tatsächlich nutzbare Versorgung und bedingte längerfristige Beschäftigungschancen.', 'Immediate income support, usable provision and conditional longer-term employment opportunities.'),
        localized('budget-and-capacity', 'Nicht doppelt verwendbarer Etat; tatsächliche Angebots-, Stellen- und Teilnahmegrenzen.', 'A budget that cannot be spent twice; actual service, vacancy and participation limits.'),
    ],
    'applicationCaseBriefs': [
        case('income-line-and-mobility-access',
            'Ein fiktiver Einpersonenhaushalt mit Äquivalenzgewicht 1 hat monatlich verfügbares Einkommen 900; der gleichartig gemessene Median beträgt 2.000. Das Material definiert die Armutsrisikogrenze als 60 % des Medians. Es gibt nahe Arbeits- und soziale Angebote, aber keine nutzbare Verkehrsanbindung des Haushalts. Für diesen Vergleich kann die Kommune monatlich höchstens 600 ausgeben. Option T ist ein verlässlich zugänglicher Transfer von 300 monatlich an den Haushalt; die öffentliche Ausgabe beträgt 300. Option B ist ein barrierefrei erreichbarer Bus an fünf Tagen pro Woche, ohne Fahrpreis für den Haushalt; einschließlich Betrieb und Zugang kostet er die Kommune 600 monatlich. Arbeitsplätze sind nicht zugesichert, und zusätzliche Haushaltseinkommen werden nicht prognostiziert. Vergleiche die Optionen anhand des Einkommens- und Zugangsproblems. Begründe eine Priorität oder eine weitere konkret finanzierte Alternative und nenne Daten, an denen tatsächlicher Erfolg erkennbar wäre.',
            'A fictional single-person household with an equivalence weight of 1 has monthly disposable income of 900; the median measured on the same basis is 2,000. The material defines the poverty-risk line as 60% of the median. Nearby work and social services exist, but the household has no usable transport connection. The municipality can spend at most 600 per month for this comparison. Option T is a reliably accessible monthly transfer of 300 to the household, costing the municipality 300. Option B is an accessibly reachable bus five days a week, with no household fare; operations and access cost the municipality 600 per month. Jobs are not assured and no extra household income is forecast. Compare the options against the income and access problems. Justify a priority or another explicitly funded alternative and identify data that would show actual success.',
            'Die Grenze beträgt 1.200, die Einkommenslücke 300. Ein tatsächlich ankommender Transfer von 300 erreicht die Grenze; er stellt die fehlende Verkehrsverbindung nicht her. Der Bus ermöglicht unter den angegebenen Bedingungen Wege zu vorhandenen Angeboten, erhöht aber nicht schon das gemessene Einkommen und garantiert keine Anstellung. Beide vollständigen Optionen gleichzeitig kosten 900 und überschreiten den Etat. Eine begründete Priorität ist zulässig; ein Mix benötigt konkret veränderte Kosten und Leistungen, die nicht gegeben sind. Geeignete Ergebnisdaten sind tatsächliches verfügbares Einkommen, Nutzbarkeit und erfolgte Wege sowie gegebenenfalls Beschäftigung; Busbereitstellung oder bewilligter Transfer allein belegen nicht die Beseitigung sämtlicher Teilhabehürden.',
            'The line is 1,200 and the income gap 300. An actually received transfer of 300 reaches the line but does not create the missing transport link. Under the supplied conditions, the bus enables journeys to existing opportunities; it does not itself raise measured income or assure employment. Both complete options together cost 900 and exceed the budget. A justified priority is valid; a combination needs explicitly changed costs and service levels not supplied here. Suitable outcome data include actual disposable income, usable and completed journeys, and possibly employment. Providing a bus or approving a transfer alone does not establish removal of every participation barrier.',
            'Einkommenslage und nutzbaren Zugang getrennt diagnostizieren und im finanzierten Strategievergleich verbinden.',
            'Diagnose income circumstances and usable access separately and connect them in a funded strategy comparison.'),
        case('housing-training-low-take-up',
            'In einem zweiten fiktiven Stadtfall haben 100 Einpersonenhaushalte mit Äquivalenzgewicht 1 jeweils verfügbares Monatseinkommen 1.000 bei einer Armutsrisikogrenze von 1.200; monatliche Wohnkosten betragen jeweils 500. Fehlende anerkannte Qualifikationen begrenzen Arbeitschancen. Von den 100 Haushalten nutzen derzeit nur 40 vorhandene Hilfen; Sprachhürden und komplizierte Anträge sind dokumentiert. Die Kommune hat für die Maßnahmen monatlich 25.000. Wohnhilfe von 200 pro Haushalt kostet für alle 100 Haushalte 20.000 monatlich. Ein sechsmonatiger barrierefrei zugänglicher Qualifizierungskurs mit Abendterminen für 100 Teilnehmende kostet ebenfalls 20.000 monatlich; 30 passende Stellen sind aktuell nachgewiesen, individuelle Anstellungen oder spätere weitere Stellen nicht zugesichert. Verständliche aufsuchende Beratung kostet 5.000 monatlich, verbessert die Antragsmöglichkeit, garantiert jedoch keine vollständige Nutzung. Zusätzlicher Wohnraum ist nicht gegeben. Vergleiche Wirkungswege, Zeit und Zugang und begründe einen finanzierbaren Mix mit passenden Ergebnisindikatoren.',
            'In a second fictional urban case, 100 single-person households with an equivalence weight of 1 each have monthly disposable income of 1,000 with a poverty-risk line of 1,200; each pays monthly housing costs of 500. Missing recognised qualifications limit employment opportunities. Currently only 40 of the 100 households use existing support; language barriers and complex applications are documented. The municipality has 25,000 per month for the measures. Housing aid of 200 per household costs 20,000 per month for all 100 households. A six-month accessibly offered training course with evening sessions for 100 participants also costs 20,000 per month; 30 suitable jobs are currently confirmed, while individual hiring and additional future jobs are unassured. Understandable outreach advice costs 5,000 per month and improves the opportunity to apply without guaranteeing full take-up. No additional housing is supplied. Compare mechanisms, timing and access and justify a funded combination with suitable outcome indicators.',
            'Wohnhilfe kann bei tatsächlichem Zugang die verfügbaren Mittel unmittelbar um 200 erhöhen und die genannte Einkommensgrenze erreichen; sie schafft keinen zusätzlichen Wohnraum. Qualifizierung bearbeitet eine andere Ursache erst über Teilnahme, Abschluss und passende Beschäftigung. 100 Kursplätze sind keine 100 gesicherten Arbeitsplätze; derzeit sind 30 Stellen ausgewiesen. Beratung bearbeitet konkrete Zugangshürden, bleibt in ihrer tatsächlichen Nutzung zu prüfen. Wohnhilfe plus Beratung oder Kurs plus Beratung kostet jeweils 25.000; alle drei zusammen kosten 45.000. Eine andere Zuteilung benötigt ausgewiesene Teilmengen und Kosten. Die Person begründet die Priorität anhand der Bedürfnisse und prüft nach Umsetzung tatsächlich erhaltene Hilfe, Wohnstabilität, Nutzung, Abschlüsse, Beschäftigung und Einkommen. Anmeldung und Ausgabe sind noch keine dauerhaft beseitigte Armut.',
            'If actually accessed, housing aid can immediately increase disposable resources by 200 and reach the stated income line; it creates no additional housing. Training addresses another cause through attendance, completion and suitable employment. One hundred training places are not one hundred assured jobs; 30 jobs are currently documented. Advice addresses specific access barriers, with actual take-up still to be examined. Housing aid plus advice or training plus advice each costs 25,000; all three cost 45,000. Another allocation needs stated quantities and costs. The learner justifies a priority against needs and checks actual receipt, housing stability, take-up, completion, employment and income after implementation. Enrolment and spending do not yet establish lasting elimination of poverty.',
            'Unterschiedliche Ursachen, tatsächliche Reichweite und Kapazität bestimmen eine tragbare Kombination.',
            'Different causes, actual reach and capacity determine a feasible combination.'),
    ],
}

write_json('candidate-positive-criteria.INERT.json', {
    'contract': 'positive-understanding-evidence-v2', 'authority': 'ai_candidate',
    'purpose': 'Author-side whole-profile criteria for the two explicitly bound INERT goal objects; no independent D/P acceptance or human approval.',
    'criteria': ['One assessable content competency per revised goal.',
        'Positive bilingual understanding and observable content performances.',
        'Fully supplied fictional bilingual cases, internally consistent quantities and genuine content variation.',
        'Preserve existing competencies through existing goal IDs, with no duplicate strategy atom.',
        'E1/G1, needs_human_review; sources, country scopes and all release-quality effects remain open.'],
    'coverageInterpretation': 'The existing v2 schema requires minimumIndependentDemonstrations=2 and two authored case briefs. These describe evidence variation in this profile. They do not add a quota of task labels, completed cases, or further tasks after sufficient substantive evidence; apply AGENTS.md mastery rules.',
})
write_json('positive.candidates.INERT.json', {
    'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
    'reviewId': REVIEW_ID, 'reviewedAt': STAMP, 'reviewer': 'Codex INERT author, round B',
    'goals': [
        {'goalId': ORIGINAL, 'reason': 'INERT author candidate: retain the established curricularAtomic ID for poverty measurement only; the former strategic facet is preserved in history and referenced through existing competencies. No independent review, source acceptance, human approval or observed learner evidence is claimed.', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'profile': measurement},
        {'goalId': REUSE, 'reason': 'INERT author candidate for an unchanged existing strategy competency. The whole canonical goal object and its scope are reused unchanged; the two fully supplied bilingual cases elaborate its existing P contract. No extension of course or country applicability, independent review or human approval is claimed.', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'profile': strategy},
    ],
})

followers = []
for g in landscape['goals']:
    locations = [k for k in ('requires', 'contains') if ORIGINAL in g.get(k, [])]
    if ORIGINAL in g.get('examData', {}).get('coveredGoalIds', []):
        locations.append('examData.coveredGoalIds')
    if locations:
        followers.append({'goalId': g['id'], 'title': g['title'], 'locations': locations,
            'requires': g.get('requires', []), 'contains': g.get('contains', []),
            'coveredGoalIds': g.get('examData', {}).get('coveredGoalIds', [])})

write_json('effects-and-reuse-plan.INERT.json', {
    'activationState': 'INERT', 'newGoalIds': [], 'revisedGoalId': ORIGINAL,
    'strategyCompetencyIdsReused': [REUSE, MACRO, '4fef149e-84c0-59af-b056-0a0bf97dbecd'],
    'currentDirectFollowers': followers,
    'definiteUnresolvedCoverageCorrection': {
        'goalId': PRACTICE,
        'affectedTasks': ['examData.taskContent A 2: transfer versus production support',
            'examData.taskContent B 2: transfer versus basic provision',
            'examData.taskContentEn A 2 and B 2, solutions and scoring s2/s4'],
        'existingRequires': by_id[PRACTICE]['requires'],
        'existingCoveredGoalIds': by_id[PRACTICE]['examData']['coveredGoalIds'],
        'proposedRequiresIfStrategyScopeIsProven': by_id[PRACTICE]['requires'] + [REUSE],
        'proposedCoveredGoalIdsIfStrategyScopeIsProven': by_id[PRACTICE]['examData']['coveredGoalIds'] + [REUSE],
        'strategyPContract': {'goalId': REUSE, 'sourcePath': p_path,
            'profileFingerprint': selected_p[REUSE][0]['profileFingerprint']},
        'status': 'blocked_for_activation_pending_source_course_country_projection_and_whole_practice_review',
        'reason': 'Narrowed 543b no longer supplies assessment coverage for strategic judgments. Existing da734 supplies that competency but is Q2/LK with a different country set. Adding its ID alone would hide or wrongly widen the GK/five-country assessment through applicabilityFromRequires. The original complete assessment remains preserved in history. No task demand or historical breadth is silently removed.',
    },
    'requiresDisposition': [
        {'goalId': MACRO, 'candidateRequires': by_id[MACRO]['requires'], 'action': 'retain_measurement_prerequisite_provisionally', 'reason': 'Its own whole DE/EN and P contract supplies macro strategy comparison; 543b now means measurement only. No transfer-versus-services prior mastery may be inferred from 543b. A new da734 prerequisite is not justified automatically.'},
        {'goalId': '4fef149e-84c0-59af-b056-0a0bf97dbecd', 'candidateRequires': by_id['4fef149e-84c0-59af-b056-0a0bf97dbecd']['requires'], 'action': 'retain_measurement_prerequisite_provisionally', 'reason': 'Its own whole P supplies inclusion/sustainability strategy judgment. Recheck the actual didactic route; no inherited strategy mastery from narrowed 543b.'},
        {'goalId': 'e5560c43-c25a-5356-a282-c602945219ae', 'candidateRequires': by_id['e5560c43-c25a-5356-a282-c602945219ae']['requires'], 'action': 'retain_measurement_prerequisite_provisionally', 'reason': 'Its own P supplies microfinance mechanism, risk and social-evidence judgment. Recheck the whole route without treating poverty measurement as proof of strategy mastery.'},
        {'goalId': 'd0ad0bbf-93ab-52f4-adda-9bb4e3571928', 'action': 'keep_existing_543b_and_0480_references_no_new_atom', 'reason': 'A later reviewed Q4 view may explicitly reference existing da734 to retain the old policy facet where source-authorised. Do not insert a second visible copy or infer role/course/country applicability. Current canonical contains is unchanged.'},
    ],
    'wholeFollowupGatesOpen': ['normative_source_fidelity_and_source_to_canonical_mappings',
        'DE_BE_DE_HE_DE_NI_DE_NW_DE_SH_GK_LK_scope_and_existing_strategy_scope_gap',
        'independent_whole_DE_EN_D_and_P_review', 'semantic_atomicity_ledger_and_goal_description_fingerprints',
        'M_memory_suitability_and_K_card_origin_deck_and_visibility_review',
        'practice_requires_coveredGoalIds_bilingual_tasks_solutions_scoring_and_projection',
        'V_image_fit_asset_hashes_and_complete_affected_image_sequence_review',
        'A_composition_views_unique_visible_parent_target_frontier_progress_and_mastery_continuation',
        'curriculum_quality_status_and_protected_maturity_floors'],
    'stateIntegrity': 'Existing mastery of historical broad 543b is not evidence of mastery of da734 or 0480. Do not transfer or create mastery values. Any migration policy and continuation test remain open.',
    'visualization': 'Old 543b asset is byte-exact in history, removed from the revised INERT goal link list only. No image is generated or newly approved. Neighbour assets and image sequences need follow-up review if any active binding is later changed.',
    'sourceScopeWarning': 'No course or country labels are copied from 543b to da734/0480. Their semantic reuse is not proof of scoped curricular coverage.',
    'noTaskQuotaAdded': True,
})

write_json('author-source-manifest.INERT.json', {
    'activationState': 'INERT', 'authorTask': '543b poverty/development whole-contract atomization, no D-round access',
    'canonicalSource': {'path': CANONICAL, 'sha256': digest(canonical_bytes)},
    'operativePBindingSource': {'path': BOOK, 'sha256': digest(book_bytes),
        'note': 'Canonical resourceLinks of inspected goals are image links only; the actual P carrier is bound by this current book configuration, not directly by resourceLinks.'},
    'operativePSource': {'path': p_path, 'sha256': digest(p_bytes),
        'selectedGoalIds': sorted(selected_ids),
        'selectionPolicy': 'Only selected whole positive profiles and administrative binding fields were inspected. Raw selected P records are retained exactly. No D results, rounds or syntheses were opened.'},
    'originalScope': {'tags': by_id[ORIGINAL]['tags'], 'applicability': by_id[ORIGINAL]['applicability'],
        'phase': by_id[ORIGINAL]['dimensionTags']['phase']},
    'reusedStrategyScopes': [{'goalId': i, 'tags': by_id[i]['tags'],
        'applicability': by_id[i]['applicability'], 'phase': by_id[i]['dimensionTags']['phase']}
        for i in (REUSE, MACRO, '4fef149e-84c0-59af-b056-0a0bf97dbecd')],
    'newUuidCount': 0,
    'publicationDeploymentOrActiveFileMutation': False,
})
print(json.dumps({'out': str(OUT), 'revisedGoalId': ORIGINAL, 'reusedStrategyGoalId': REUSE,
    'existingMacroStrategyGoalId': MACRO, 'newGoalIds': [], 'newPProfiles': 2}, ensure_ascii=False))
