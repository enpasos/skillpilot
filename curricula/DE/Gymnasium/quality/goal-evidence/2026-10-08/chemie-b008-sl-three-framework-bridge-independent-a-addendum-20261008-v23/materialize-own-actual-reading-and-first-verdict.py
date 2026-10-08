#!/usr/bin/env python3
"""Materialize this reviewer's actual readings and decisions; no active writes."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

import fitz

Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
A = Q / 'chemie-b008-sl-three-framework-bridge-author-root-20261008-v23'
O = Q / 'chemie-b008-sl-three-framework-bridge-independent-a-addendum-20261008-v23'
PREVIOUS = Q / 'chemie-b008-sl-specific-source-placement-independent-a-20261008-v21'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def verify(row):
    assert binding(row['path']) == row, row['path']


def write(name, value):
    path = O / name
    assert not path.exists(), f'Immutable output already exists: {path}'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)


first_input_path = O / 'first-current-input.freeze.json'
first_input = read(first_input_path)
for row in first_input['requiredFiles']:
    verify(row)
author_entry_path = A / 'neutral-three-current-SL-framework-bridges.author.entry.json'
author_entry = read(author_entry_path)
author_first_seal_path = A / 'author.first.freeze.json'
for row in read(author_first_seal_path)['payloads']:
    verify(row)
prior_first_path = PREVIOUS / 'sl-specific-source-placement.independent-a.first-verdict.freeze.json'
prior_first = read(prior_first_path)
verify(prior_first['firstVerdicts'])
prior = read(prior_first['firstVerdicts']['path'])
for row in prior_first['ownedArtifacts']:
    verify(row)
author_readings = read(A / 'actual-framework-documents-and-whole-page-readings.author.json')
subject_bridge = read(A / 'current-SL-subject-to-framework-binding.author.json')
target_candidates = read(A / 'three-whole-current-targets-and-evidence-bridges.author-candidate.json')
verify(target_candidates['wholeCandidateBinding'])
canonical = read(target_candidates['wholeCandidateBinding']['path'])
canonical_by_id = {g['id']: g for g in canonical['goals']}
for row in target_candidates['rows']:
    assert row['wholeCurrentInactiveGoal'] == canonical_by_id[row['goalId']]

# Exactly the complete physical pages this reviewer actually read. Author-only
# additional pages are deliberately excluded from the personal-reading receipt.
own_read_pages = {
    'KMK2020-Chemie-AHR': [10, 11, 12, 13, 14, 17, 18, 19],
    'KMK2024-Chemie-MSA': [2, 5, 11],
    'KMK2004-Chemie-MSA': [7, 10, 13, 14],
    'SL-MEDIA-2019-ACADEMIC-MIRROR': [1, 2, 3, 4, 8, 9, 12, 13, 16, 17],
}
documents = []
for doc in author_readings['documents']:
    p = Path(doc['localWholePrimaryCachePath'])
    actual = binding(p)
    http = doc['actualHttpReceipt']
    assert actual['sha256'] == http['sha256'] and actual['bytes'] == http['bytes']
    pdf = fitz.open(p)
    assert len(pdf) == http['physicalPages']
    author_pages = {r['physicalPage']: r for r in doc['actuallyReadWholePages']}
    pages = []
    for number in own_read_pages[doc['key']]:
        text_sha = hashlib.sha256(pdf[number - 1].get_text().encode()).hexdigest()
        assert text_sha == author_pages[number]['wholeActualPageTextSha256']
        pages.append({'physicalPage': number, 'actualWholePageTextSha256': text_sha,
                      'personallyReadWholePageByIndependentA': True})
    documents.append({'key': doc['key'], 'actualLocalWholeBytes': actual,
                      'portablePrimaryRoute': doc['portableSourceRoute'],
                      'authorObservedHttpReceiptNotOwnRequest': copy.deepcopy(http),
                      'scopeAndVersionBoundary': doc['scopeAndVersionBoundary'],
                      'personalWholePageReadings': pages})
for group in ['upperCourseReferences', 'lowerCurrentFrameworkReferences']:
    for ref in subject_bridge[group]:
        row = ref['actualLocalDocumentBinding']
        verify(row)
        pdf = fitz.open(row['path'])
        pages = []
        for author_page in ref['actuallyReadWholePages']:
            number = author_page['physicalPage']
            sha = hashlib.sha256(pdf[number - 1].get_text().encode()).hexdigest()
            assert sha == author_page['wholeActualPageTextSha256']
            pages.append({'physicalPage': number, 'actualWholePageTextSha256': sha,
                          'personallyReadWholePageByIndependentA': True})
        documents.append({'key': ref.get('wholeExistingSourceDocumentReference', {}).get('key', Path(row['path']).stem),
                          'actualLocalWholeBytes': row, 'personalWholePageReadings': pages,
                          'originalSourceDocumentReference': ref.get('wholeExistingSourceDocumentReference'),
                          'wholeOriginalLocalSubjectDocumentReadTargetedly': True})
actual_read_page_count = sum(len(d['personalWholePageReadings']) for d in documents)
assert actual_read_page_count == 35
reading_path = write('actual35-whole-primary-pages.independent-a.reading-receipt.json', {
    'schemaVersion': 1, 'reviewer': '/root/curricula_live_diagnosis', 'createdAtUtc': now,
    'role': 'Own actual primary-page readings, not copied author or peer judgments',
    'documents': documents, 'actualPersonalWholePages': actual_read_page_count,
    'exactWholeTargetBodies3PersonallyReadInDEAndEN': True,
    'mediaOfficialRequest': {'source': 'Frozen author observation, not an independent A HTTP request',
                             'receipt': author_readings['officialMediaRequest']},
    'currentOfficialMediaBytesVerified': False,
    'mediaMirrorIsNotCurrentOfficialResponse': True,
    'mediaTableGradeProgressionNotStrictlyBinding': True,
    'media2019DoesNotAloneCloseUpperScientificSourceCriticism': True,
    'lowerCurrentPhysical3IsContentsNotACompetencyMandate': True,
    'prior38SpecificComponentReadingsNotReplaced': prior['readingReceipt'],
    'newPeerFrameworkReviewRead': False, 'rawThirdPartyPdfRepublished': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False,
})

def source(doc, pages, standards, contribution):
    return {'documentKey': doc, 'physicalWholePagesActuallyRead': pages,
            'standardOrSectionLocators': standards, 'ownBoundedInterpretationDe': contribution}

upper_framework = [
    source('KMK2020-Chemie-AHR', [14], ['2: common course levels and qualification-phase endpoint'],
           'Die präzisierten Standards gelten für beide Anforderungsniveaus bis zum Ende der Qualifikationsphase. Unterschiede in Vertiefung, Komplexität und Selbststeuerung bleiben; weder EP-Abschluss noch maximale LK-Tiefe wird für GK behauptet.'),
    source('SL-CH-SEKII-GK-2023-2025', [3, 4, 6], ['binding process competencies', 'AHR-based subject framework'],
           'Der aktuelle GK-Lehrplan macht Kommunikation und Bewertung verbindlich, konkretisiert das Fach auf AHR-Basis und berücksichtigt alle Kompetenzbereiche. Dies trägt die fachliche Einbindung der genannten AHR-Kompetenzen als Oberstufen-Lernziel, nicht als nachgewiesene Lernerleistung.'),
    source('SL-CH-SEKII-LK-2023-2025', [3, 4, 6], ['binding process competencies', 'AHR-based subject framework'],
           'Der aktuelle LK-Lehrplan enthält dieselbe verbindliche Prozess- und AHR-Verknüpfung. Das ist ein curricular begründeter Brückenschluss und keine erfundene zusätzliche Tabellenzeile oder neue SourceID.'),
]
rows = []
for row in target_candidates['rows']:
    goal_id = row['goalId']
    goal = copy.deepcopy(row['wholeCurrentInactiveGoal'])
    base = {'goalId': goal_id, 'wholeUnchangedCurrentInactiveGoal': goal,
            'wholeDEENDescriptionActuallyReviewed': True,
            'wholeCurrentTargetExactIn504Candidate': True,
            'ordinarySourceDecisionProjectionAdopted': False,
            'wholeNationalOrOriginalSourceDutyUnionClosed': False,
            'nativeDPAMVApproval': False, 'humanApproval': False}
    if goal_id == 'ac8b6c0f-98b2-5092-806d-d9498efbfa35':
        base.update({
            'verdict': 'ACCEPT_WHOLE_SL_GK_LK_QUALIFICATION_TARGET_SOURCE_ROLE',
            'sourceScope': {'jurisdiction': 'DE-SL', 'stage': 'SekII', 'courseProfiles': ['GK', 'LK'],
                            'learningEndpoint': 'End of qualification/main phase; not end of EP'},
            'priorOwnFinding': None, 'newFinding': None,
            'wholeTextCoverage': [
                source('KMK2020-Chemie-AHR', [12, 17, 18], ['chemical application domains', 'K1', 'K2', 'K8', 'K12'],
                       'K1 trägt zielgerichtete analoge/digitale Recherche, K2 die Auswahl auch aus komplexen Darstellungen, K8 Strukturierung, Interpretation und fachliche Schlussfolgerungen, K12 Quellenbeleg und Zitatkennzeichnung. Chemisch-pharmazeutische Fragen sind fachliche Anwendungskontexte; keine medizinische Entscheidungsbefugnis. Selbstständige Recherche ist als erworbene Kompetenz gemeint, ohne für GK die maximale Selbststeuerung des LK zu behaupten.'),
            ] + copy.deepcopy(upper_framework),
            'additionalMediaContribution': source('SL-MEDIA-2019-ACADEMIC-MIRROR', [12, 16, 17], ['2.1', '2.2', '4.3', '4.4'],
                       'Recherche, Aufbereitung, Quellenzuordnung und Zitieren unterstützen Teilaspekte zusätzlich. Der AHR-Brückenschluss hängt nicht von einer unbewiesenen aktuellen amtlichen Byteidentität oder strikt kumulativen Klassenstufentabelle ab.'),
            'ownReasonDe': 'Der gesamte konkrete Zieltext hat über die tatsächlich gelesenen AHR-Einzelstandards und die aktuellen verbindlichen SL-GK/LK-Prozessvorgaben einen ausreichenden fachlichen Quellenbezug. Die Quelle wird als gemeintes qualifikationsphasiges Lernziel akzeptiert; Vollquellendeckung anderer Länder, aller alten Source-Duties oder tatsächliche Lernendenautonomie werden damit nicht festgestellt.',
        })
    elif goal_id == '36666b4a-97af-51fc-9983-56cdcc7a8229':
        base.update({
            'verdict': 'ACCEPT_NEW_WHOLE_SL_GK_LK_QUALIFICATION_TARGET_SOURCE_ROLE',
            'sourceScope': {'jurisdiction': 'DE-SL', 'stage': 'SekII', 'courseProfiles': ['GK', 'LK'],
                            'learningEndpoint': 'End of qualification/main phase; not end of EP'},
            'priorOwnFinding': 'A21SL-UPPER-CRITICISM-TARGET',
            'priorOwnFindingDisposition': 'RESOLVED_FOR_THIS_EXACT_TARGET_SCOPE_BY_NEW_ACTUAL_FRAMEWORK_EVIDENCE',
            'historicalFindingWasValidForThenAvailableEvidence': True,
            'newFinding': None,
            'wholeTextCoverage': [
                source('KMK2020-Chemie-AHR', [17, 18, 19], ['K1', 'K3', 'K4', 'K12', 'B1', 'B2', 'B3', 'B4', 'E12'],
                       'K3 liefert den Aussagenvergleich zwischen Quellen/Darstellungen, K4 Herkunft und Vertrauen, K12 Urheberschaft; B1/B2 fachliches Urteil und Richtigkeit, B3 Angemessenheit, Grenzen und Tragweite, B4 Intention im Kontext der Quellenauswahl. K1 Zweckpassung und B3 tragen Eignung für eine konkrete Frage. Validität wird als begründete fachliche Belastbarkeit/Geltungsgrenze verstanden, gestützt durch B2/B3 und E12; keine absolute Wahrheitsgarantie und kein wörtliches Einzelbullet mit allen Zielwörtern. Die Erläuterung der Bewertungskompetenz fordert begründete kriteriale Urteile.'),
            ] + copy.deepcopy(upper_framework),
            'additionalMediaContribution': source('SL-MEDIA-2019-ACADEMIC-MIRROR', [13, 16], ['2.3', '4.3'],
                       'Vergleich von Medienberichten, Beteiligtenintention und Herkunft sind zusätzliche Teilbeiträge. Die Medienfamilie allein würde fachliche Relevanz, Vertrauen und Gültigkeitsgrenzen nicht vollständig decken.'),
            'ownReasonDe': 'Die neue Quelle verändert den fachlichen Nachweis tatsächlich: Nun sind die vorher fehlenden Vergleichsgegenstände und Kriterien ausdrücklich aufgelöst. Der aktuelle SL-Fachrahmen bindet diese AHR-Prozesskompetenzen für GK und LK ein. Mein früherer HOLD wird nur für diesen ganzen Oberstufen-Zieltext und dessen SL-GK/LK-Zulässigkeit aufgehoben; der alte Erstseal bleibt unverändert. Die Plastik-Bewertung wird weiterhin nur als damaliger Teilbeitrag verstanden.',
        })
    else:
        assert goal_id == '75e2eff1-f871-5461-9e3f-26d0b333ce2f'
        base.update({
            'verdict': 'KEEP_HOLD_WHOLE_SL_LOWER_TARGET_SOURCE_AND_PLACEMENT_SCOPE',
            'sourceScope': {'jurisdiction': 'DE-SL', 'stage': 'SekI'},
            'priorOwnFinding': 'A21SL-LOWER-HYPOTHESIS-TARGET',
            'priorOwnFindingDisposition': 'REMAINS_OPEN_WITH_ACKNOWLEDGED_NEW_PARTIAL_SUPPORT',
            'newFinding': None,
            'newGenuinePartialContribution': source('KMK2024-Chemie-MSA', [2, 5, 11], ['E1.1', 'E1.2', 'E1.3', 'E1.5', 'MSA endpoint'],
                       'E1.1 nennt nun ausdrücklich die Entwicklung chemisch prüfbarer Fragen und Hypothesen. E1.2 trägt Prüfung durch Untersuchungen. Das ist mehr als der alte Vergleich, aber der ganze Zieltext fordert zusätzlich selbst begründete Hypothese und vorausgesagten bestätigenden oder widersprechenden Befund. Diese Zusätze werden aus den gelesenen Stellen nicht als vollständige verbindliche Pflicht festgestellt.'),
            'historicalComparisonOnly': source('KMK2004-Chemie-MSA', [7, 10, 13, 14], ['E1', 'E2', 'theory/hypothesis-guided inquiry'],
                       'Die frühere Fassung liefert Fragenentwicklung und hypothesenbezogene Untersuchungsplanung, aber keine vollständige eigene begründete Hypothesenbildung mit explizitem Gegenbefund. Ihre ausschließliche Übernahme im aktuellen SL-Lehrplan ist nicht bewiesen.'),
            'currentSLGradeScope': source('SL current grade8/grade9 chemistry', [3, 7], ['current subject MSA-oriented competency model'],
                       'Die tatsächlichen aktuellen Rahmenpassagen verweisen auf das Abschluss-Kompetenzmodell. Seite 3 ist jeweils ein Inhaltsverzeichnis. Die Zuordnung genau dieses ganzen Zieltextes als verpflichtende Klasse-8-/Klasse-9-Leistung und eine eindeutige Fassungsbrücke werden damit nicht nachgewiesen.'),
            'unresolvedWholeObligations': ['independent justification of the self-formulated hypothesis',
                                          'explicit expected supporting or contradicting finding',
                                          'actual current SL grade/scope/version bridge for the whole target'],
            'ownReasonDe': 'Den echten zusätzlichen E1.1-Beitrag akzeptiere ich partiell. Er ersetzt weder die beiden verbleibenden konkreten Zieloperatoren noch einen belegten Unterstufen-/Jahrgangsbezug. AHR-Endstandards der SekII dürfen diese SekI-Lücke nicht schließen. Deshalb bleibt die ganze SL-Unterstufen-Target-Zulässigkeit im HOLD.',
        })
    rows.append(base)

view_effects = []
for prior_view in prior['viewWholeTargetScopeVerdicts3']:
    verify(prior_view['candidateView'])
    lower = prior_view['wholeScope']['stage'] == 'SekI'
    view_effects.append({
        'viewId': prior_view['viewId'], 'wholeScope': prior_view['wholeScope'],
        'actualUnchangedCandidateView': prior_view['candidateView'],
        'actualUnchangedExplicitTargetReferences': prior_view['actualWholeTargetScope'],
        'actualUnchangedPrerequisiteOnlyReferences': prior_view['authoredPrerequisiteOnlyScope'],
        'priorOwnScopeVerdict': prior_view['verdict'],
        'targetedAddendumDisposition': 'KEEP_WHOLE_LOWER_TARGET_SCOPE_HOLD' if lower else 'PREVIOUS_CRITICISM_SCOPE_HOLD_RESOLVED_BY_NEW_FRAMEWORK_SOURCE_ROLE',
        'remainingConcreteFindingIds': ['A21SL-LOWER-HYPOTHESIS-TARGET'] if lower else [],
        'ownReasonDe': ('Der ungeänderte SekI-Zielumfang enthält weiterhin den ganzen Hypothesen-Target-Knoten. Die neue Abschlussstandards-Teilrolle trägt dessen ganze Operatorpflicht und Jahrgangszuordnung nicht.' if lower else 'Der ungeänderte GK-/LK-Zielumfang erhält für den bisher blockierten Quellenkritik-Target nun einen vollständigen curricular begründeten AHR/SL-Bezug. Dies löst genau meinen vorherigen Scope-Befund; vorhandene andere Rollen werden aus dem unveränderten Erstreview wiederverwendet. Die reguläre Atlas-Entscheidungsprojektion bleibt eine gesonderte offene Aufgabe.'),
        'otherExistingComponentDecisionsReusedFromOwnExactFirstSeal': binding(prior_first_path),
        'ordinaryDecisionProjectionPending': True, 'integrationReadyClaim': False,
        'wholeOriginalSourceDutyUnionClosed': False, 'nativeDPAMVApproval': False,
    })

verdict_binding = write('three-whole-framework-source-placement.independent-a.first-addendum.verdicts.json', {
    'schemaVersion': 1, 'role': 'Independent SOURCE/PLACEMENT A genuine targeted first addendum',
    'reviewer': '/root/curricula_live_diagnosis', 'createdAtUtc': now,
    'neutralAuthorEntry': binding(author_entry_path), 'authorFirstSeal': binding(author_first_seal_path),
    'ownFirstCurrentInputFreeze': binding(first_input_path), 'actualOwnReadingReceipt': reading_path,
    'previousOwnHistoricalFirstSealUnmodified': binding(prior_first_path),
    'wholeCurrentTargetVerdicts3': rows, 'targetedExistingWholeViewConsequences3': view_effects,
    'summary': {'wholeSLQualificationTargetSourceRolesAccepted': 2,
                'priorOwnConcreteWholeFindingsResolvedOnNewActualEvidence': ['A21SL-UPPER-CRITICISM-TARGET'],
                'priorOwnConcreteWholeFindingsStillOpen': ['A21SL-LOWER-HYPOTHESIS-TARGET'],
                'newConcreteFindings': [], 'actualPersonallyReadWholePrimaryPages': 35,
                'newPartialsAcceptedWithoutWholeClosure': ['KMK2024 MSA E1.1 question and hypothesis development'],
                'separateOrdinarySourceDecisionProjection': 'PENDING'},
    'unchangedEvidenceReuse': {'specificSLComponents38': 'Own exact v21 partial decisions retained, not rescored',
                              'sourceIds26': 'No new IDs manufactured',
                              'profiles26Cases52': 'Scientific reuse untouched; not re-reviewed here',
                              'wholeSLDuties65AndNationalDuties1646': 'No original whole-duty closure claimed',
                              'careerChoiceComplexModelAndPracticalDuties': 'Original boundaries remain',
                              'nativeContextHolds8': 'Unaffected and not cleared by this source addendum'},
    'newPeerFrameworkReviewReadBeforeFirstSeal': False,
    'status': 'ai_candidate', 'qaStatus': 'needs_human_review', 'E1G1': 'unchanged',
    'wholeNationalSourceUnionClosure': False, 'activeWrites': 0, 'strictGain': 0,
    'humanApproval': False, 'humanTrial': False,
})

extra_inputs = [binding(prior_first['firstVerdicts']['path'])]
extra_inputs += [v['candidateView'] for v in prior['viewWholeTargetScopeVerdicts3']]
all_inputs = {r['path']: r for r in first_input['requiredFiles'] + extra_inputs}
for row in all_inputs.values():
    verify(row)
entry_binding = write('three-framework-bridge.independent-a.first-addendum.entry.json', {
    'schemaVersion': 1, 'role': 'Own blinded actual SOURCE/PLACEMENT A framework addendum result',
    'createdAtUtc': now, 'neutralAuthorEntry': binding(author_entry_path),
    'firstVerdicts': verdict_binding, 'actualPrimaryReadingReceipt': reading_path,
    'ownFirstInputFreeze': binding(first_input_path), 'previousOwnFirstSealUnmodified': binding(prior_first_path),
    'firstSealPath': str(O / 'three-framework-bridge.independent-a.first-addendum.freeze.json'),
    'twoUpperWholeSLSourceRolesAccepted': True, 'lowerWholeTargetStillHOLD': True,
    'ordinaryAtlasProjectionPending': True, 'nativeDPApproval': False,
    'wholeOriginalSourceDutiesClosed': False, 'wholeNationalSourceUnionClosed': False,
    'newPeerFrameworkReviewReadBeforeFirstSeal': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
mechanical_binding = write('targeted-bindings-and-historical-preservation.actual.json', {
    'schemaVersion': 1, 'createdAtUtc': now,
    'actualFrozenInputCount': len(all_inputs), 'hashMismatches': [],
    'allAuthorFirstPayloadsExact': True, 'ownInitial20InputFreezeExact': True,
    'previousOwnFirstSealAndOwnedArtifactsExact': True,
    'wholeCandidateGoals3ExactIn504': True, 'unchangedViewBindings3Exact': True,
    'actualPersonalPageTextHashes35ExactAgainstOriginalPdfBytes': True,
    'noFullBuildOrQSRun': True, 'activeWrites': 0,
    'notAReplacementForTheGenuineScientificJudgments': True,
})
readme = O / 'README.md'
assert not readme.exists()
readme.write_text('''# Eigenes SOURCE/PLACEMENT-A-Addendum: SL v23

Die Ersturteile wurden unabhängig vor aktuellen Peerurteilen geschrieben. 35
tatsächliche ganze Primärseiten und drei vollständige aktuelle DE/EN-Zieltexte
wurden gelesen. Die historischen v21-Urteile und Erstseals bleiben unverändert.

Der tatsächliche AHR-2020-Bezug über die aktuellen SL-GK-/LK-Fachrahmen trägt
beide Oberstufen-Zieltexte bis zum Ende der Qualifikationsphase. Das beseitigt
gezielt den früheren Quellenkritik-Scope-Befund. Der Unterstufen-HOLD bleibt:
Hypothesenbegründung, erwarteter bestätigender/Gegenbefund sowie die konkrete
aktuelle SL-Jahrgangs-/Fassungsbrücke sind nicht vollständig belegt.

Die reguläre Atlas-Entscheidungsprojektion bleibt offen. 38 alte partielle
Komponenten, 65 ganze SL-Pflichten, 1646 nationale Pflichten, 26 Profile/52
Fälle und acht Kontext-HOLDs werden nicht umgeschrieben oder geschlossen.
Keine aktiven Writes, kein Strict-Gain, keine menschliche Freigabe/Erprobung.

Primär-PDFs werden nicht erneut veröffentlicht; die dokumentierten URLs und
lokalen Byte-/Seitenbindungen bleiben prüfbar. Der Uni-Mirror von 2019 ist
ausdrücklich kein nachgewiesener aktueller amtlicher Download. Für die
Oberstufenentscheidung ist dieser Mirror nur zusätzlicher Teilbeitrag.
''')
owned = [binding(p) for p in sorted(O.iterdir()) if p.is_file()]
first_seal = write('three-framework-bridge.independent-a.first-addendum.freeze.json', {
    'schemaVersion': 1, 'role': 'Immutable independent SOURCE/PLACEMENT A first addendum seal',
    'sealedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'neutralAuthorEntry': binding(author_entry_path), 'authorFirstSeal': binding(author_first_seal_path),
    'firstVerdicts': verdict_binding, 'resultEntry': entry_binding,
    'ownedArtifacts': owned, 'inputs': list(all_inputs.values()),
    'actualOwnedArtifacts': len(owned), 'actualFrozenInputs': len(all_inputs),
    'actualPersonalWholePrimaryPages': 35, 'hashMismatches': [],
    'newPeerFrameworkReviewReadBeforeFirstSeal': False,
    'wholeLowerScopeStillHOLD': True, 'ordinarySourceDecisionProjectionPending': True,
    'wholeOriginalAndNationalSourceDutyClosure': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'entry': entry_binding, 'firstSeal': first_seal,
                  'ownedArtifacts': len(owned), 'inputs': len(all_inputs),
                  'actualPersonallyReadWholePrimaryPages': 35,
                  'upperWholeSLTargetSourceRolesAccepted': 2,
                  'remainingWholeHold': 'A21SL-LOWER-HYPOTHESIS-TARGET'}, ensure_ascii=False, indent=2))
