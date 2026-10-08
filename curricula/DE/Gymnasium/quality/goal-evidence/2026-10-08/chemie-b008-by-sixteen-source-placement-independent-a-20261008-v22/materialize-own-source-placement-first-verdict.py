# SPDX-License-Identifier: Apache-2.0
"""Write the independent A review after actual primary/body readings."""
import copy
import datetime
import hashlib
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
A = Q / 'chemie-b008-by-sixteen-source-facet-author-root-20261008-v22'
O = Q / 'chemie-b008-by-sixteen-source-placement-independent-a-20261008-v22'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(p):
    return json.loads(Path(p).read_text())


def bind(p):
    p = Path(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def exact(row):
    assert bind(row['path']) == row, row['path']


def write(name, body):
    p = O / name
    assert not p.exists(), f'First output already exists: {p}'
    p.write_text(json.dumps(body, ensure_ascii=False, indent=2) + '\n')
    return bind(p)


first_input_path = O / 'first-current-input.freeze.json'
first_input = read(first_input_path)
for b in first_input['requiredFiles']:
    exact(b)
entry_path = A / 'neutral-sixteen-BY-source-components.author.entry.json'
entry = read(entry_path)
author_seal_path = A / 'author.first.freeze.json'
for b in read(author_seal_path)['payloads']:
    exact(b)
routes = read(entry['actualSixteenRoutesAndComponents']['path'])['rows']
partners = read(entry['actualWholeCurrentPartners']['path'])['wholePartners']
candidate = {g['id']: g for g in read(entry['previousWholeCurrent504Candidate']['path'])['goals']}
active_path = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
active = {g['id']: g for g in read(active_path)['goals']}
v12_inventory_path = Q.parent / '2026-10-07/chemie-b008-current169-routing-placement-author-v12/exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'
v12 = read(v12_inventory_path)
exact(v12['immutableOriginalInventory'])
assert len(v12['originalWholeDuties']) == 1646
assert [r['originalUnresolvedRoute'] for r in routes] == v12['originalUnresolvedFacetDutyRoutes']
assert len(routes) == 16
assert len({r['wholeCurrentSourceGoal']['id'] for r in routes}) == 15
assert len(partners) == 12 and all(p == active[p['id']] for p in partners)
partner_by_id = {g['id']: g for g in partners}
reading_receipts = read(entry['actualOfficialWholePrimaryReadings']['path'])['readings']
sections = {}
primary_readings = []
for r in reading_receipts:
    html_path = Path('tmp/chemie-b008-by-sixteen-primary-root-20261008-v1') / (r['key'] + '.current-official.html')
    b = html_path.read_bytes()
    assert hashlib.sha256(b).hexdigest() == r['sha256'] and len(b) == r['bytes']
    soup = BeautifulSoup(b, 'html.parser')
    h = next(h for h in soup.find_all('h2') if 'Lernbereich 1:' in h.get_text())
    section = h.parent.parent
    assert section.name == 'section'
    text = section.get_text(' ', strip=True)
    sha = hashlib.sha256(text.encode()).hexdigest()
    assert sha == r['wholeSectionTextSha256']
    sections[r['key']] = text
    h1 = soup.find('h1').get_text(' ', strip=True)
    assert h1 == r['wholeActualPageHeading']
    if r['key'] == 'C11-NTG':
        assert '(NTG)' in h1
    else:
        assert '12/13' in h1 and 'mindestens drei' in soup.get_text(' ', strip=True)
    primary_readings.append({
        'key': r['key'], 'actualFrozenWholeHtml': bind(html_path),
        'effectiveOfficialUrl': r['effectiveUrl'], 'wholeActualHeading': h1,
        'actualWholeLB1TextSha256': sha,
        'personallyReadCompleteLB1CompetenciesAndContents': True,
        'personallyReadWholeCoursePreambleAndChoiceNotices': True,
        'authorHttpObservationVerifiedAgainstFrozenHtml': {k: r[k] for k in ['status', 'fetchedAt', 'bytes', 'sha256']},
        'independentAAlsoOpenedCurrentOfficialPage': True,
        'independentOpenObservedContentType': 'text/html',
        'independentOpenNotClaimedByteIdenticalNewDownload': True,
    })

loaded = {}
source_ids = set()
original_edges = set()
routine_by_id = {}
for r in routes:
    for k in ['currentExtractionBinding', 'currentMappingBinding']:
        exact(r[k])
        loaded.setdefault(r[k]['path'], read(r[k]['path']))
    extraction = loaded[r['currentExtractionBinding']['path']]
    mapping = loaded[r['currentMappingBinding']['path']]
    source = r['wholeCurrentSourceGoal']
    source_ids.add(source['id'])
    assert source == next(g for g in extraction['sourceGoals'] if g['id'] == source['id'])
    assert r['wholeCurrentPassage'] == next(p for p in extraction['passages'] if p['id'] == source['passageId'])
    assert r['wholeOriginalDecision'] == next(d for d in mapping['decisions'] if d['sourceGoalId'] == source['id'])
    assert r['wholeOriginalCompatibleEdges'] == [m for m in mapping['mappings'] if m['legacyGoalId'] == source['id']]
    primary_key = 'C11-NTG' if source['sourceSpan'].startswith('C11.') else source['sourceSpan'].split('.')[0]
    assert re.sub(r'\s+', '', source['sourceText']) in re.sub(r'\s+', '', sections[primary_key])
    for e in r['wholeOriginalCompatibleEdges']:
        original_edges.add((e['legacyGoalId'], e['canonicalGoalId']))
    for pid in r['wholeOriginalDecision']['canonicalGoalIds']:
        assert pid in partner_by_id
    for c in r['proposedBoundedComponents']:
        assert c['wholeExistingInactiveRoutine'] == candidate[c['canonicalGoalId']]
        routine_by_id[c['canonicalGoalId']] = c['wholeExistingInactiveRoutine']
assert len(original_edges) == 22 and len(routine_by_id) == 10

reading_binding = write('three-whole-LB1-and-whole15-sources12-partners10-routines.independent-a.actual-reading.json', {
    'schemaVersion': 1, 'role': 'Own complete primary-section and whole-body reading receipt',
    'reviewer': '/root/curricula_live_diagnosis', 'createdAtUtc': now,
    'wholePrimaryReadings3': primary_readings,
    'wholeSourceGoals15PersonallyRead': [{'sourceGoalId': r['wholeCurrentSourceGoal']['id'],
                                        'sourceSpan': r['wholeCurrentSourceGoal']['sourceSpan'],
                                        'originalExtractionBinding': r['currentExtractionBinding']}
                                       for i, r in enumerate(routes)
                                       if r['wholeCurrentSourceGoal']['id'] not in {p['wholeCurrentSourceGoal']['id'] for p in routes[:i]}],
    'wholeActivePartners12PersonallyReadDEENAndAllMetadata': [g['id'] for g in partners],
    'wholeCurrentInactiveRoutines10PersonallyReadDEENAndAllMetadata': list(routine_by_id),
    'currentActivePartnerBodiesExact': True, 'currentInactiveRoutineBodiesExact': True,
    'originalSourceGoalsPassagesDecisionsAndCompatibleEdgesExact': True,
    'uniqueOriginalCompatiblePartnerEdges': 22,
    'sameIdActiveAndInactiveCandidateBodiesKeptDistinct': [g['id'] for g in partners if g['id'] in candidate and g != candidate[g['id']]],
    'currentVersionBoundary': 'The exact author-fetched official HTML of 2026-10-08 is frozen; current official pages also opened independently. No unproved historical G8/version or GK/LK equivalence is asserted.',
    'practicalCourseRepeated12And13SourceIdentitiesRetained': True,
    'newPeerBYReviewRead': False, 'rawThirdPartyFullHtmlRepublished': False,
    'profiles26AndCases52NotReReviewed': True, 'activeWrites': 0, 'humanApproval': False,
})

# These are the reviewer's own bounded interpretations following the actual
# readings, not an automatic copy of the author's proposed boundary prose.
own_component_notes = {
    ('BcP12.1.2', 'upper-theory-based-question-hypothesis'): ('Theoriegestützte Hypothesenbildung ist ausdrücklich vorhanden; der ganze LB1 setzt sie in den naturwissenschaftlichen Erkenntnisweg ein.', 'Eigenes Identifizieren einer Alltags-/Technikfrage, eigene Begründung und ausdrücklich vorhergesagter Gegenbefund werden durch diese Einzelrolle nicht vollständig verpflichtend belegt.'),
    ('BcP12.1.2', 'upper-hypothesis-investigation'): ('Hypothesenbezogene überwiegend selbstständige Planung, Modelleinsatz und tatsächliche Durchführung sind direkte Teilbeiträge; LB1 konkretisiert Arbeitsweisen und Sicherheit.', 'Qualitative und quantitative Verfahren, reale Durchführung und biologisch-chemische Forschungs-/Anwendungsgegenstände bleiben erhalten. Ein schriftlicher Profilfall bescheinigt keine Laborleistung.'),
    ('BcP12.1.3', 'data-validity'): ('Validitätsurteil und Mess-/Verfahrensfehler sind ausdrücklich verlangt; Inhalte nennen Variablenkontrolle, Kontrollen, Stichprobe und Labor-/Freilandbedingungen.', 'Die explizite anschließende Optimierung des Untersuchungsdesigns darf weder durch Datenkritik noch durch die bestehende allgemeine Partnerfamilie als erledigt ersetzt werden.'),
    ('BcP12.1.6', 'criteria-decision'): ('Ethische, soziale, ökologische und ökonomische Folgenbewertung liefert einen echten kriterialen Bewertungsteil.', 'Indirekte/direkte Folgen von Untersuchungen, biologischen Präparaten sowie Synthese/Isolierung bleiben eigene Gegenstände. Eine vollständige Handlungsoptionen-/Strategienroutine ist aus diesem Bewertungsbullet allein nicht belegt.'),
    ('C11.1.2', 'upper-hypothesis-investigation'): ('Selbstständige sicherheitsgerechte qualitative/quantitative Analysen passen als direkter Durchführungsteil der Routine; die ausdrücklich genannten analytischen Verfahren werden beibehalten.', 'Dünnschichtchromatographie und die angegebenen Säure-Base-/Redox-Titrationsbezüge bleiben in der Originalpflicht. Methodenwahl, tatsächliche Ausführung und Dokumentation sind nicht durch abstrakte Planung oder einen generischen Fall zertifiziert.'),
    ('C11.1.3', 'upper-model-use-criticism'): ('Modelle und digitale Simulationen zur Bearbeitung chemischer Fragen sind ausdrücklich genannt; die kompletten Inhalte behandeln Modelleigenschaften, Grenzen und Erweiterung.', 'Der Teilbeitrag belegt nicht alle Modellgegenstände der ganzen Routine, insbesondere Atombau/Periodizität und Gleichgewichte. Die zweite Familienroute desselben Sourcegoals bleibt eigenständig erhalten.'),
    ('C11.1.3', 'upper-theory-based-question-hypothesis'): ('Theoriebasierte Hypothesenbildung und davon ausgehende selbstständige Planung tragen einen echten Teil der Theorie-/Hypothesenroutine.', 'Die Quelle nennt chemische Fragestellungen als Ausgangspunkt; die selbst gefundene neue Alltags-/Technikfrage und das gesamte begründete Befund-/Gegenbefundpaar sind keine vollständig nachgewiesene zusätzliche Einzelbullet-Pflicht.'),
    ('C11.1.3', 'upper-hypothesis-investigation'): ('Überwiegend selbstständige hypothesenbezogene Untersuchungsplanung ist direkt vorhanden.', 'Die Durchführung wird in anderen LB1-Aussagen konkretisiert und bleibt erhalten; diese Planungsrolle allein ersetzt weder die vollständige Analytik noch reale sichere Durchführung und Protokollierung.'),
    ('C11.1.4', 'data-validity'): ('Validitätsurteil für erhobene und recherchierte Daten sowie Mess-/Verfahrensfehler sind direkte Beiträge, einschließlich digitaler Datenerhebung und Recherche.', 'Die ganze Datenroutine und ihre Begründungs-/Tragweitengrenzen bleiben als Gesamtziel erhalten; hier wird nur der tatsächlich gedeckte Teil und keine ganze Partnerunion freigegeben.'),
    ('C11.1.5', 'upper-quantitative-hypothesis-data-evaluation'): ('Tabellenkalkulation, Datenaufbereitung und Trends/Beziehungen mit Stützungs-/Falsifikationsbezug sind direkte quantitative und hypothetische Auswertungsteile.', 'Nicht jedes mathematische Verfahren, jeder quantitative Anwendungskontext oder jede fachübergreifend begründete Schlussfolgerung der ganzen Routine folgt aus diesem Bullet.'),
    ('C11.1.6', 'upper-model-use-criticism'): ('Komplexe organische Moleküle, Bindungsverhältnisse, Geometrien und die genannten Wirkstoff-/Rezeptor- bzw. Substrat-/Enzymbeziehungen liefern konkrete Modelldomänen; Simulationen sind direkt enthalten.', 'Beispiele und die unveränderte bzw.-Formulierung werden nicht zu einer Pflicht jedes denkbaren Moleküls oder jedes Beispiels erweitert. Atombau/Periodizität, Gleichgewichte und die ganze Modellkritikunion sind dadurch nicht geschlossen.'),
    ('C11.1.8', 'chemical-representation-transformation'): ('Sach-, Adressaten- und Situationsbezug der Darstellungsüberführung ist ausdrücklich vorhanden; chemisch-pharmazeutischer Gegenstand und Inhaltsabschnitt zur Darstellungswahl bleiben mitgelesen.', 'Korrekte Inhalte, Fachsprache, Bezugsgrößen und begründete Darstellungsgrenzen der ganzen Routine werden nicht allein durch eine gewählte Form als erfüllt behandelt.'),
    ('C11.1.9', 'upper-source-information'): ('Auch selbst beschaffte analoge/digitale Quellen sind ausdrücklich Ausgangspunkt; dies ist ein tatsächlicher selbstständiger Informationszugangsteil.', 'Komplexe Informationsauswahl/-interpretation, Schlussfolgerungen, Quellenbelege und Zitatkennzeichnung werden aus dem Eignungsbullet nicht als vollständige Einzelpflicht hergeleitet.'),
    ('C11.1.9', 'upper-source-criticism'): ('Die Eignungsprüfung von Quellen ist ausdrücklich vorhanden; der ganze Inhaltsabschnitt ergänzt kriteriengeleitete Internetquellenauswahl und Meinungsbeeinflussung.', 'Vollständiger Vergleich nach Aussagen, fachlicher Relevanz, Vertrauen, Urheberschaft, Intention und Validität bleibt aus dieser Rolle partiell. Das gesonderte SL/AHR-Urteil wird nicht nach Bayern übertragen.'),
    ('C11.1.10', 'criteria-decision'): ('Fachwissenschaftlich begründete Handlungsoptionen, Entscheidungsstrategien und Reflexion getroffener Entscheidungen sind direkte Routineteile; Priorisieren/Abwägen steht im ganzen Inhaltsabschnitt.', 'Die Originalkontexte Lebensmittel und Arzneimittel bleiben erhalten. Es wird keine medizinische Beratungsbefugnis oder vollständig erledigte regional/national gesamte Bewertungspflicht behauptet.'),
    ('C11.1.11', 'upper-knowledge-influences'): ('Soziale, kulturelle, technologische, ökologische und ökonomische Einflüsse auf Wissensentwicklung werden ausdrücklich beschrieben und bewertet.', 'Historische Gegenstände und alle Auswirkungen von Produkten/Verfahren sowie die ganze Source-/Partnerunion bleiben gesondert. Wissenschaftliche Gültigkeit wird nicht aus gesellschaftlicher Zustimmung abgeleitet; dieser sachliche Grenzsatz ersetzt keine historische Pflichtstelle.'),
}
for n in [2, 3, 6]:
    for (span, key), note in list(own_component_notes.items()):
        if span == f'BcP12.1.{n}':
            own_component_notes[(f'BcP13.1.{n}', key)] = note
component_verdicts = []
route_placement_verdicts = []
for r in routes:
    source = r['wholeCurrentSourceGoal']
    span = source['sourceSpan']
    practice = span.startswith('BcP')
    scope = {'jurisdiction': 'DE-BY', 'stage': 'SekII',
             'trackOrCourse': 'Separate Biologisch-chemisches Praktikum 12/13' if practice else 'Chemie 11, NTG',
             'courseProfile': 'UNRESOLVED_FROM_THIS_SOURCE',
             'sourceVersion': 'Frozen current official 2026-10-08 HTML; no older version inferred'}
    route_placement_verdicts.append({
        'originalRouteIndex': r['originalUnresolvedRoute']['originArrayIndex'],
        'sourceGoalId': source['id'], 'sourceSpan': span,
        'originalFamilyGoalId': r['originalUnresolvedRoute']['familyGoalId'],
        'verdict': 'ACCEPT_EXACT_SOURCE_SPECIFIC_SCOPE_ONLY', 'acceptedScope': scope,
        'ownReasonDe': ('Die amtlichen Routen 12 und 13 zeigen denselben 12/13-Kurs, bleiben aber zwei echte ursprüngliche Sourceidentitäten. Im Schuljahr werden praktische Tätigkeiten aus mindestens drei der sechs Bereiche 2–7 gewählt und biologischer/chemischer Schwerpunkt ausgewogen. Deren Erwartungen/Inhalte sind Anregungen und nicht sämtlich verpflichtend; LB1 wird an geeigneter Stelle berücksichtigt. Daraus folgt weder ein allgemeiner Chemie-GK-/LK-Target noch die Pflicht aller Wahlbereiche.' if practice else 'Die ganze offizielle Überschrift bezeichnet Chemie 11 ausdrücklich als NTG. Die Rolle ist in diesem Fach-/Jahrgangs-/Zweigkontext zulässig. CourseLevel=unspecified sowie technische GK-/LK-Tags des kanonischen Kindes belegen keinen bayerischen GK-/LK-Kurs und erlauben keine Ausdehnung auf alle Schulrichtungen.'),
        'ordinaryAtlasProjection': 'PENDING_WHOLE_DECISION_AND_ALL_PARTNER_PROJECTION',
        'wholeCurrentChildTargetScopeApproved': False,
        'globalJurisdictionOrCourseApplicabilityApproved': False,
        'originalChoiceRuleAndPracticalPerformanceObligationsRetained': True,
    })
    for c in r['proposedBoundedComponents']:
        positive, limit = own_component_notes[(span, c['candidateKey'])]
        component_verdicts.append({
            'originalRouteIndex': r['originalUnresolvedRoute']['originArrayIndex'],
            'sourceGoalId': source['id'], 'sourceSpan': span,
            'originalFamilyGoalId': r['originalUnresolvedRoute']['familyGoalId'],
            'canonicalChildGoalId': c['canonicalGoalId'], 'candidateKey': c['candidateKey'],
            'wholeCurrentInactiveRoutine': copy.deepcopy(c['wholeExistingInactiveRoutine']),
            'verdict': 'ACCEPT_EXACT_BOUNDED_SOURCE_COMPONENT', 'matchType': 'partial',
            'acceptedScope': copy.deepcopy(scope), 'ownActualSupportedContributionDe': positive,
            'ownUnresolvedWholeDutyAndOperatorBoundaryDe': limit,
            'allWholeCurrentOriginalPartnersRead': r['wholeOriginalDecision']['canonicalGoalIds'],
            'wholeOriginalSourceDutyCompleted': False, 'wholeChildSourceProofByThisRoleCompleted': False,
            'sourcePerformanceApproval': False, 'ordinaryAtlasProjection': 'PENDING',
            'newPOrScienceReview': False, 'humanApproval': False,
        })
assert len(component_verdicts) == 20

partner_notes = {
    '91238ba1-5c63-50c7-a4fd-9bbe492c6b61': 'Die ganze aktive Hypothesen-/Untersuchungsfamilie enthält Planung, Durchführung, Dokumentation und Modelle. Die BcP-/C11-Komponenten wählen daraus tatsächliche einzelne Handlungsteile; weder ein neuer Fragenursprung noch eine reale gesamte Untersuchung gilt damit als absolviert.',
    '49b13b33-34b7-5e4e-861c-b21082cb9922': 'Dokumentation, Mathematik, digitale Auswertung, Gültigkeit und Hypothesenbezug stehen im ganzen Partner. Die tatsächliche BcP-Designoptimierung darf durch diesen allgemeinen Text nicht verschwinden; Datenkritik und quantitative Auswertung bleiben verschiedene Teilrollen.',
    '1df17884-96ae-57d7-9da9-dbebd082596f': 'Der aktive Bewertungs-Partnerkörper und der inaktive aktualisierte Kriterienkörper desselben IDs bleiben getrennt erhalten. BcP-Folgen biologischer Präparate/Synthese/Isolierung und C11-Handlungsoptionen/Strategien werden nicht zu einer einzigen bereits erledigten Pflicht verrechnet.',
    '02634fdd-c8ba-591a-b240-77129b1bebb8': 'Maßlösung, Indikator, Durchführung, Volumina, Stöchiometrie und Konzentrationsbestimmung bleiben der ganze Titrationsgegenstand. Die zusätzliche generische Analysenkomponente ersetzt diesen benannten alten Partner nicht.',
    '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9': 'Redoxtitration, Durchführung, Auswertung und Redoxbegründung bleiben erhalten. Manganometrie ist ein Beispiel im kanonischen Partner, keine aus C11 neu erfundene ausschließliche Methode oder universell erfüllte praktische Leistung.',
    '978a6f25-0601-5457-9211-aab206c95603': 'Chromatographische Methode, Laufmittel, Chromatogramm/Rf und Reinstoffidentifikation bleiben erhalten. Das aus der Herkunft stammende LK-Label macht C11-NTG nicht zu einem LK und weist keinen tatsächlichen Laborvollzug nach.',
    'c7d4d9f7-d23f-44fc-bf22-3872e0f2b9a0': 'Der ganze Sicherheitscluster mit allen drei enthaltenen Referenzen bleibt Partner. Seine Kennzeichnungs-/Umgangs-/Entsorgungsfunktionen werden nicht durch schriftliche Analysenplanung als durchgeführte Sicherheitsleistung geschlossen; neue automatische Descendant-Quellendeckung wird nicht behauptet.',
    '277a3c20-6082-5a95-be08-c1e386efe79b': 'Der Partner umfasst Nutzung, Vergleich, Grenzen und Weiterentwicklung einschließlich komplexer organischer und molekularer Kontexte. Die tatsächliche C11-Modell-/Simulationsrolle ist eng benannt; sie schließt keine ganze Modell-Domänenunion und keine neue Wissenschafts-/P-Freigabe.',
    '15e73664-8c3f-5aa6-ac65-b455fc3ed6d6': 'Metall-/Ionen-/Elektronenpaarbindung, EPA-Geometrie und die zwei enthaltenen Referenzen bleiben unverändert. Ein Beitrag komplexer organischer Moleküldarstellungen ersetzt nicht automatisch alle Grundlagen und Nachfahren dieses Partners.',
    '92c99237-1c74-54fc-bf08-9191656afaa6': 'Molekülformel-Darstellungswechsel und Situationswahl bleiben der ganze Partner. Die allgemeinere chemisch-pharmazeutische Darstellungsrolle darf diesen konkreten Molekülgegenstand nicht aus der alten Partnerunion entfernen.',
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': 'Der ganze aktive Partner verlangt komplexe Quellen, Darstellungen, Präsentation, Zitate und Kriterien/Argumente. C11-Repräsentationsüberführung und Quelleneignung tragen getrennte Teilrollen; sie belegen nicht sämtliche Quellenkritik-/Präsentations-/Zitatoperatoren.',
    'b3c9c4b8-5575-5200-86cf-26c14ebcc3d8': 'Wissenseinflüsse sowie Produkt-/Verfahrensfolgen in aktuellen/historischen nachhaltigkeitsbezogenen Kontexten bleiben der ganze aktive Partner. Die C11-Einflüsse-Komponente deckt ihren benannten Teil; andere Gegenstände und Zeitbezüge verschwinden nicht.',
}
partner_boundaries = [{'wholeCurrentActivePartnerBody': copy.deepcopy(g),
                       'verdict': 'RETAIN_WHOLE_CURRENT_PARTNER_AS_REQUIRED_CONTEXT_NOT_COVERAGE_APPROVAL',
                       'ownWholePartnerBoundaryDe': partner_notes[g['id']],
                       'wholeOriginalPartnerUnionApproved': False,
                       'newSciencePOrVisualReviewPerformed': False} for g in partners]

verdict_binding = write('BY20-components16-placement12-partners.independent-a.first.verdicts.json', {
    'schemaVersion': 1, 'role': 'Independent actual SOURCE/PLACEMENT A first BY16 judgments',
    'reviewer': '/root/curricula_live_diagnosis', 'createdAtUtc': now,
    'neutralAuthorEntry': bind(entry_path), 'authorFirstSeal': bind(author_seal_path),
    'ownFirstInputFreeze': bind(first_input_path), 'ownActualReadingReceipt': reading_binding,
    'componentVerdicts20': component_verdicts, 'sourceSpecificPlacementVerdicts16': route_placement_verdicts,
    'wholeCurrentPartnerBoundaries12': partner_boundaries,
    'summary': {'originalFamilyRoutes': 16, 'uniqueWholeSourceGoals': 15,
                'acceptedExactPartialComponents': 20, 'wholeChildRoutineBodies': 10,
                'wholeCurrentPartnerBodies': 12, 'uniqueOriginalCompatibleEdges': 22,
                'actualWholePrimarySectionsAndPreambles': 3,
                'acceptedScope': 'Current C11 NTG or separate BcP12/13 only; GK/LK unresolved',
                'wholeDutyOrPerformanceApprovals': 0, 'wholeNationalSourceCoverageApprovals': 0,
                'ordinaryAtlasAndCPV35Resolution': 'SEPARATE_PENDING', 'newConcreteAuthorComponentBlockers': []},
    'wholeSourceAndPerformanceGatesRetained': ['Actual safe practical execution and methods named in original source',
                                              'BcP design optimization following validity/error judgment',
                                              'Practical original biological preparation/synthesis/isolation contexts',
                                              'Complete current child theory/hypothesis/model/source/representation obligations',
                                              'Whole 1646 original duties and all their unchanged decisions/compatible edges',
                                              'Real course/track/version projection before whole template applicability'],
    'previousOwnSLv21AndSLv23JudgmentsUnmodifiedAndNotTransferredToBY': True,
    'originalProfiles26AndCases52ScienceReviewsNotRestarted': True,
    'wholeNationalSourceUnionClosure': False, 'nativeDPAMVApproval': False,
    'newPeerBYReviewReadBeforeFirstSeal': False,
    'status': 'ai_candidate', 'qaStatus': 'needs_human_review',
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
mechanical_binding = write('targeted-exact-original-route-and-partner-guards.actual.json', {
    'schemaVersion': 1, 'createdAtUtc': now,
    'originalUnresolvedRoutes16ExactAgainstOwnFrozenV12Inventory': True,
    'originalImmutable1646WholeDutyInventoryExact': v12['immutableOriginalInventory'],
    'wholeSourceGoals15AndPassagesExactAgainstCurrentExtractions': True,
    'wholeOriginalDecisions15AndAllCompatibleEdges22ExactAgainstCurrentMappings': True,
    'wholeActivePartners12ExactAgainstCurrentCanonical': True,
    'wholeInactiveRoutines10ExactAgainstFrozen504Candidate': True,
    'wholePrimaryHtml3AndSectionHashes3Exact': True,
    'actualPersonallyReadFullBodyCount': {'originalSourceGoals': 15, 'activePartners': 12, 'inactiveRoutines': 10},
    'hashMismatches': [], 'checksAreNotScientificApproval': True,
    'ordinaryAtlasAndCompositionViewsWereNotMutatedOrRun': True,
    'noFullBuildOrQSRun': True, 'activeWrites': 0,
})
entry_binding = write('BY16-source-placement.independent-a.first.entry.json', {
    'schemaVersion': 1, 'role': 'Own genuine blinded SOURCE/PLACEMENT A BY16 result handoff',
    'createdAtUtc': now, 'neutralAuthorEntry': bind(entry_path),
    'firstVerdicts': verdict_binding, 'actualReadingReceipt': reading_binding,
    'mechanicalReceipt': mechanical_binding, 'ownFirstInputFreeze': bind(first_input_path),
    'firstSealPath': str(O / 'BY16-source-placement.independent-a.first-verdict.freeze.json'),
    'acceptedPartialComponents': 20, 'originalFamilyRoutes': 16,
    'sourceSpecificTrackCourseAndChoiceBoundariesPreserved': True,
    'ordinaryAtlasProjectionAndCPV35RemainSeparate': True,
    'wholeSourceDutyPerformanceAndNationalUnionApprovals': False,
    'newPeerBYReviewReadBeforeFirstSeal': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
readme_path = O / 'README.md'
assert not readme_path.exists()
readme_path.write_text('''# Bayern 16: unabhängiger SOURCE/PLACEMENT-A-Erstsatz

Die drei vollständigen amtlichen LB1 einschließlich Inhalte sowie die vollständigen
Kurs-/Wahlhinweise, 15 ganze Quellenziele, zwölf ganze aktuelle Partner und zehn
betroffene ganze inaktive Routinen wurden tatsächlich gelesen. Der Erstsatz wurde
ohne aktuelles BY-B-Urteil verfasst.

20 konkrete partielle Beiträge werden in ihren tatsächlichen Quellenkontexten
akzeptiert. Chemie 11 bleibt NTG; das Praktikum bleibt eigener Kurs 12/13 mit
praktischen Tätigkeiten aus mindestens drei der sechs Bereiche 2–7 und den
ausdrücklichen Nicht-Gesamtheit-/LB1-Regeln. GK/LK bleibt aus diesen Quellen
ungelöst. Die 12/13-Identitäten werden trotz gleicher Abschnittstexte erhalten.

Keine Quellenpflicht wird gelöscht oder durch eine generische Routine als
absolviert gezählt. Tatsächlicher Laborvollzug, Designoptimierung, benannte
Methoden und ursprüngliche Gegenstände bleiben erhalten. Die ganze nationale
Pflichtunion, Ordinary Atlas und CPV35 bleiben getrennt offen. Historische
SL-v21/v23-Erstseals und bestehende 26 Profile/52 Fälle werden nicht verändert.

Nur dieser eigene Ordner wurde geschrieben. Kein aktiver Write, Strict-Gain,
menschliche Freigabe oder menschliche Erprobung wird behauptet. Die vollständigen
fremden HTML-Seiten bleiben im lokalen Scratch und werden nicht neu veröffentlicht.
''')
all_inputs = {b['path']: b for b in first_input['requiredFiles']}
all_inputs[v12['immutableOriginalInventory']['path']] = v12['immutableOriginalInventory']
for b in all_inputs.values():
    exact(b)
owned = [bind(p) for p in sorted(O.iterdir()) if p.is_file()]
seal_binding = write('BY16-source-placement.independent-a.first-verdict.freeze.json', {
    'schemaVersion': 1, 'role': 'Immutable independent SOURCE/PLACEMENT A BY16 first verdict seal',
    'sealedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'neutralAuthorEntry': bind(entry_path), 'authorFirstSeal': bind(author_seal_path),
    'firstVerdicts': verdict_binding, 'resultEntry': entry_binding,
    'ownedArtifacts': owned, 'inputs': list(all_inputs.values()),
    'actualOwnedArtifacts': len(owned), 'actualFrozenInputs': len(all_inputs),
    'hashMismatches': [], 'newPeerBYReadBeforeFirstSeal': False,
    'acceptedExactPartialComponents20Only': True,
    'wholeDutyPerformanceOrNationalSourceUnionClosure': False,
    'ordinaryAtlasAndCPV35SeparatePending': True,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'entry': entry_binding, 'firstSeal': seal_binding,
                  'ownedArtifacts': len(owned), 'frozenInputs': len(all_inputs),
                  'partialComponentsAccepted': 20, 'newPeerBYRead': False,
                  'activeWrites': 0, 'strictGain': 0}, ensure_ascii=False, indent=2))
