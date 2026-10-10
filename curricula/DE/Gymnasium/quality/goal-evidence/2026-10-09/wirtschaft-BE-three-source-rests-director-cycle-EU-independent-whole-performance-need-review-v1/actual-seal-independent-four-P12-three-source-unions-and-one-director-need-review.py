"""Seal the independently read, bounded economics review; never alter live input."""
from __future__ import annotations
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file() and (p / 'curricula').is_dir())
OWN = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-three-source-rests-Montan-director-cycle-and-EU-current-2026-bounded-author-v1'
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-BE21-source125-ground-GK-LK-actual-binnenkursiv-scope-author-successor-v6/source-extraction/DE_BE_WIRTSCHAFT_SEKII_BERLIN2006_EP2010_AB2022.source125-ground-binnenkursiv-GK-LK-successor-v6.source-extraction.json'
REVIEWER = '/root/economics_source3_independent_final_performance_need'
NEW = '912ab267-ee00-581b-a31c-dfc0b3587184'

def read(p: Path):
    return json.loads(p.read_text())

def digest(p: Path):
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'wholeBytes': p.stat().st_size}

def write(name: str, obj):
    p = OWN / name
    assert not p.exists(), f'Immutable review output already exists: {p}'
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    assert read(p) == obj
    return digest(p)

handoff_path = AUTHOR / 'actual-final-three-source-rests-one-new-executive-four-P12-bounded-author-handoff.receipt.json'
assert digest(handoff_path)['sha256'] == '29643d5e33d0a3bc1cb0ce17a5a18074a058fbe98a307ea5707fc78b339fb54a'
handoff = read(handoff_path)
guard_refs = read(AUTHOR / 'inputs/whole-current-frozen-inputs.before.guard.json') + handoff['artifacts'] + [digest(handoff_path), digest(ROOT / 'app/scripts/positiveGoalEvidenceProfileModel.ts'), digest(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), digest(ROOT / 'docs/landscape-runtime.schema.json'), digest(ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json')]
guards = {}
for ref in guard_refs:
    path = ROOT / ref['path']
    assert path.is_file() and not path.is_symlink(), ref['path']
    actual = digest(path)
    assert actual['sha256'] == ref['sha256'].removeprefix('sha256:'), actual
    guards[ref['path']] = actual

contracts = read(AUTHOR / 'whole-four-goal-contracts.three-exact-one-new.author.json')
profiles_path = AUTHOR / 'whole-four-current-real-resource-P12.native-bound.author.jsonl'
profiles = [json.loads(line) for line in profiles_path.read_text().splitlines()]
unions = read(AUTHOR / 'whole-three-source-performance-unions-and-explicit-LK-course-proposals.author.json')
rows = {r['id']: r for r in read(SOURCE)['sourceGoals']}
current419 = read(AUTHOR / 'whole-frozen418-plus-one-executive419.inert-CAN.candidate.json')
by_id = {g['id']: g for g in current419['goals']}
for union in unions:
    assert union['wholeCurrent125SourceRow'] == rows[union['sourceGoalId']]
    expected = hashlib.sha256(json.dumps(rows[union['sourceGoalId']], ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    assert expected == union['wholeSourceRowHash']
    for g in union['wholeContractUnion']:
        assert by_id[g['id']] == g, g['id']
for g in contracts:
    assert by_id[g['id']] == g

runtime_schema = read(ROOT / 'docs/landscape-runtime.schema.json')
goal_schema = {'$schema': runtime_schema['$schema'], '$defs': runtime_schema['$defs'], '$ref': '#/$defs/goal'}
goal_errors = [f"{g['id']}: {e.message}" for g in contracts for e in Draft202012Validator(goal_schema).iter_errors(g)]
positive_schema = read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
positive_errors = [f"{p['goalId']}: {e.message}" for p in profiles for e in Draft202012Validator(positive_schema).iter_errors(p)]
assert not goal_errors and not positive_errors, (goal_errors, positive_errors)
for edge in ['contains', 'requires']:
    done, active = set(), set()
    def visit(gid):
        assert gid not in active, f'{edge} cycle at {gid}'
        if gid in done:
            return
        active.add(gid)
        for child in by_id[gid].get(edge, []):
            assert child in by_id, f'Unknown {edge} id {child}'
            visit(child)
        active.remove(gid)
        done.add(gid)
    for gid in by_id:
        visit(gid)

numeric = []
def check(name, actual, expected):
    assert actual == expected, (name, actual, expected)
    numeric.append({'name': name, 'actual': str(actual), 'expected': str(expected), 'passed': True})
D = Decimal
check('Demand-model denominator 1-c', D(1)-D('.8'), D('.2'))
check('Initial autonomous expenditure', D(20)+D(20)+D(20), D(60))
check('Initial equilibrium output', D(60)/D('.2'), D(300))
check('After-investment autonomous expenditure', D(20)+D(10)+D(20), D(50))
check('After-investment equilibrium output', D(50)/D('.2'), D(250))
check('Model multiplier', D(1)/D('.2'), D(5))
check('Model investment change', D(10)-D(20), D(-10))
check('Model output change', D(250)-D(300), D(-50))
check('Model change consistency', D(-10)*D(5), D(-50))
check('Stipulated supply capacity percentage', (D(270)-D(300))/D(300)*100, D(-10))
check('Stipulated supply price-index percentage', (D(108)-D(100))/D(100)*100, D(8))
check('Own independent transfer initial Y, c=.75', (D(30)+D(20)+D(30))/(D(1)-D('.75')), D(320))
check('Own independent transfer after I=16', (D(30)+D(16)+D(30))/(D(1)-D('.75')), D(304))
check('Own transfer delta', D(304)-D(320), D(-16))
check('Appointment total support', 2+4, 6)
check('Appointment total opposition', 3+2, 5)
check('Full board size', 6+5, 11)
check('Whole-board support majority', 6 > 11/2, True)
check('Section6-group minimum opposing majority', 5//2+1, 3)
check('Three of five block appointment and revocation', 3 > 5/2, True)
check('Two of five alone do not prove special veto', 2 > 5/2, False)
for opposing in range(6):
    check(f'Independent complete five-member opposition boundary {opposing}', opposing > 5/2, opposing >= 3)
for name, signed, effective in [('ECSC',1951,1952),('EEC',1957,1958),('Maastricht',1992,1993),('Lisbon',2007,2009)]:
    check(f'{name}: signature precedes entry into force', signed < effective, True)
check('CAP institutional dated sequence', (20250514 < 20251216 < 20251218 < 20251231 < 20260123), True)
number_ref = write('actual-independent-thirty-two-numeric-vote-and-chronology-boundaries.json', {'reviewer': REVIEWER, 'independentChecks': len(numeric), 'results': numeric, 'historicalOilAndCurrentCAPDatesVerifiedFromOfficialSources': True, 'hypotheticalEconomyNumbersAreNotHistoricalMeasurements': True})

counteranswers = [
    {'goalId': NEW, 'caseId': 'appointment-whole-board-majority-does-not-remove-group-opposition', 'syntheticAnswerDe': 'Insgesamt stehen sechs gegen fünf Stimmen. Damit ist K bestellt, denn nur die Mehrheit im ganzen Aufsichtsrat zählt. K erhält dann einen weiteren Arbeitnehmerstuhl im Aufsichtsrat.', 'independentJudgment': 'INSUFFICIENT_UNDERSTANDING', 'reasonDe': 'Die richtige Gesamtzählung ersetzt nicht die besondere Gegenmehrheit 3/5. Das Ergebnis verstößt gegen den gelieferten §13 und verwechselt das gleichberechtigte Leitungsmitglied mit einem Aufsichtsratsstuhl.'},
    {'goalId': NEW, 'caseId': 'revocation-group-boundary-and-equal-executive-coordination', 'syntheticAnswerDe': 'Drei Arbeitnehmer können den Widerruf verhindern. Bei zwei Gegenstimmen ist L sicher abgesetzt. Solange L bleibt, darf L die Umorganisation alleine verbindlich festlegen, weil er die Arbeitnehmer vertritt.', 'independentJudgment': 'INSUFFICIENT_UNDERSTANDING', 'reasonDe': 'Das spezielle Hindernis ist bei 2/5 lediglich nicht nachgewiesen; weitere Voraussetzungen bleiben ausdrücklich ungeklärt. Die Alleinentscheidung missachtet das Zusammenwirken mit dem Gesamtorgan, und Gruppeninteressen schaffen keine allgemeine Weisungsvollmacht.'},
    {'goalId': 'bc3f895f-38d7-534b-998d-8d60fcbbb900', 'caseId': 'historical-oil-trigger-and-two-transparent-models', 'syntheticAnswerDe': '1973 sank das wirkliche Nationaleinkommen nachweislich von 300 auf 250. Daher beweist die Ölkrise den gemessenen Multiplikator fünf. Die tatsächlichen Preise waren konstant; auch 270 und 108 berechnet dieses Nachfragemodell.', 'independentJudgment': 'INSUFFICIENT_UNDERSTANDING', 'reasonDe': 'Die Rechnung des fiktiven Nachfragemodells stimmt, wird aber unzulässig als historischer Messbefund ausgegeben. Das getrennte Angebotsmodell hat ausdrücklich andere Annahmen; dessen 270/108 sind Vorgaben, keine Ergebnisse der ersten Gleichung.'},
    {'goalId': 'bc3f895f-38d7-534b-998d-8d60fcbbb900', 'caseId': 'mixed-shocks-and-demand-model-boundary', 'syntheticAnswerDe': 'Weniger Energie und höhere Kosten beweisen, dass allein das Angebotsmodell ausreicht. Sinkende Konsumpläne können wir ignorieren. Die Inflation steigt mit Sicherheit; weitere Annahmen oder Daten brauchen wir nicht.', 'independentJudgment': 'INSUFFICIENT_UNDERSTANDING', 'reasonDe': 'Der gleichzeitig gegebene Nachfragekanal wird ignoriert. Das Angebotsmodell setzt gerade konstante Nachfrage voraus; kein einzelnes Modell erklärt den kombinierten Fall vollständig oder belegt eine sichere Dominanz und Inflationsrichtung.'},
    {'goalId': '8c4d53d1-2617-5e5d-9234-f12d19e38322', 'caseId': 'dated-european-development-and-institutional-powers', 'syntheticAnswerDe': '1957 wurde bereits die heutige EU mit denselben Parlamentsrechten gegründet. Die Direktwahl von 1979 änderte sämtliche Steueranhörungen automatisch in gemeinsame Gesetzgebung. Im Rat der EU entscheiden heute die Staats- und Regierungschefs als weiterer ordentlicher Gesetzgeber.', 'independentJudgment': 'INSUFFICIENT_UNDERSTANDING', 'reasonDe': 'EEC und spätere EU werden verwechselt, heutige Zuständigkeiten rückprojiziert und die Direktwahl mit einer pauschalen Verfahrensänderung gleichgesetzt. Rat der EU und Europäischer Rat sind unterschiedliche Institutionen.'},
    {'goalId': '96c2c114-8474-5e4c-bfcf-c9e526c8c9ad', 'caseId': 'actual-2026-cap-multilevel-simplification-and-recording-boundary', 'syntheticAnswerDe': 'Die Kommission hat die Basisgesetzgebung alleine beschlossen. Vereinfachung beendet sämtliche Pflanzenschutzaufzeichnungen. Die 215 Millionen sind schon gemessener Erfolg. T darf die fehlenden Daten als passend behandeln und ebenso garantiert sparen.', 'independentJudgment': 'INSUFFICIENT_UNDERSTANDING', 'reasonDe': 'Initiative, gemeinsame Basisrechtsetzung, nachgeordnete Akte und nationaler Vollzug werden vermischt. Die allgemeine Aufzeichnungspflicht bleibt bestehen; Prognose und tatsächliche Wirkung sowie geeignete und fehlende Daten sind zu trennen.'},
]
counter_ref = write('actual-independent-six-substantive-synthetic-counteranswers-and-essential-boundaries.json', {'reviewer': REVIEWER, 'answers': counteranswers, 'everyAnswerFailsAtLeastOneEssentialAspect': True, 'gradingRubricOrLearnerTrialClaimed': False, 'evaluationMethod': 'Each complete synthetic answer was substantively compared by the independent reviewer with the actual supplied case, bilingual expectations and primary-source boundaries; no keyword or automated token heuristic.'})

need = {
    'reviewer': REVIEWER, 'originalAuthor': '/root/economics_merge_audit', 'goalId': NEW, 'wholeCurrentContract': by_id[NEW],
    'decision': 'KEEP', 'need': 'NEW_SEPARATE_CONTENT_GOAL_REQUIRED', 'semanticAtomicity': 'atomic', 'semanticAtomic': True,
    'needReasonDe': 'Der verbindliche LK-Montanbereich umfasst neben Betriebsverfassung und Aufsichtsratsbeteiligung den eigenständigen Leitungsaspekt des §13. Die ganzen bestehenden Verträge 776 und fab leisten Betriebsratsrechte beziehungsweise Sitz-/Stimmenbedingungen des Aufsichtsrats; daraus folgt weder die besondere Bestellungs-/Widerrufsgrenze eines Arbeitsdirektors noch seine gleichberechtigte Leitungsrolle. 6d4 stellt den allgemeinen Funktionsaufbau dar und ersetzt diese spezielle Anwendung ebenfalls nicht. Der amtliche Berliner Wortlaut nennt Montanmitbestimmung, nicht ausdrücklich eine frei erfundene umfassende Rechtsprüfungsquote. Die neue Leistung operationalisiert diese zentrale institutionelle Besonderheit anhand vollständig gelieferter Normen und Fälle.',
    'atomicityReasonDe': 'Ein Kern: die besondere rechtliche Stellung des Arbeitsdirektors im Montanunternehmen fallbezogen anwenden. Bestellung und Widerruf sind zwei Anwendungen derselben §13-Gegenmehrheitsgrenze. Die gleichberechtigte Leitungsrolle und Abgrenzung zu Aufsichtsrat/Betriebsrat erklären, für welches Organ diese Grenze gilt; sie sind keine unabhängigen Arbeitsvertrags-, Tarif- oder freien Bewertungsroutinen.',
    'demandLevel': 'AB2', 'taxonomyReasonDe': 'Materialgebundene institutionelle Einordnung und Anwendung gegebener Bedingungen; keine neue Rechtsrecherche oder ungestützte normative Entscheidung.',
    'minimumRequires': ['6d4a38df-527c-534b-8c0a-c6b546dae5b1'], 'requiresReasonDe': 'Der grundlegende Unternehmensaufbau unterstützt die Unterscheidung von Leitung und Aufsicht. Die aktuelle Norm und ausdrücklich gekennzeichnete §6-Gruppe werden geliefert; zusätzliches fab- oder 776-Mastery ist für diesen engen Anwendungsgegenstand keine notwendige Eingangshürde.',
    'memoryDecision': 'no_memory_needed', 'memoryGoalIds': [], 'deckIds': [], 'cardsCreated': 0,
    'memoryReasonDe': 'Norm, Organrolle, Gruppenzugehörigkeit und Stimmenzahlen liegen im Material bereit. Die zentrale Leistung besteht in Anwendung und begrenztem Schluss, nicht im unerlässlichen freien Abruf von Paragraphen, Jahreszahlen oder Sitzkontingenten. Eine neue Karte würde keine tatsächlich erforderliche Abrufleistung stützen.',
    'newRequiredCardVisibilityCheck': 'not applicable: no required memory goal or new card; no existing cards/decks/visibility scopes changed',
    'narrowPrimaryScope': {'jurisdiction': 'DE-BE', 'stage': 'SekII', 'courseLevel': 'LK', 'phase': 'Q2', 'mandatory': True, 'basis': 'Actual native PDF23 upright Montan bullet plus whole actual Chapter5.1/5.2 pages27/28/29; LK Personal/Organisation in WW2. This is a narrow primary requirement, not whole canonical target-role/native mapping approval.'},
    'DTwoIndependentWholePageReviewsApproved': False, 'VApproved': False, 'wholeCourseApproved': False, 'nativeIntegrationApproved': False, 'humanApproval': False, 'strictGain': 0,
    'imageNeedDe': 'Eigenständiges Motiv für gleichberechtigte Leitung und getrennte geschützte §6-Gruppe/Bestellungs- und Widerrufsgrenze. Das gute fab-Bild zeigt Aufsichtsrat und bleibt KEEP; es darf nicht als Arbeitsdirektor-/Leitungsfreigabe umgewidmet werden.'
}
need_ref = write('actual-independent-one-new-director-whole-Need-atomicity-AB2-minimal-requires-and-memory-KEEP.json', need)

p_reasons = {
    'bc3f895f-38d7-534b-998d-8d60fcbbb900': 'Die zwei unveränderten Fälle tragen Nachfrage-/Zinsketten mit Modellgrenzen. Der echte datierte Ölpreisauslöser wird von eigenen 300→250-Nachfragezahlen sowie vorgegebenen 270/108-Angebotsdaten getrennt. Der zweite neue kombinierte Gegenfall verlangt Prüfung der Konstanzannahmen, Ergänzung und messbare Beobachtung; weder ein geschätzter historischer Multiplikator noch sichere Inflationsdominanz wird behauptet.',
    '8c4d53d1-2617-5e5d-9234-f12d19e38322': 'Zwei gültige alte Verfahren bleiben exakt. Der zusätzliche ganze Entwicklungsfall verbindet wirtschaftliche Integration, Direktwahl, Maastricht-Mitentscheidung und Lissabon-Kompetenzklärung mit veränderten Rechten; er verlangt eine Widerlegung der Rückprojektion und eine richtige Abgrenzung Rat/Europäischer Rat. Die Jahresdaten allein ersetzen die institutionelle Begründung nicht.',
    '96c2c114-8474-5e4c-bfcf-c9e526c8c9ad': 'Die zwei gültigen älteren Agrar-/Umwelt-/Handelsfälle bleiben exakt. Der tatsächlich datierte CAP-Fall trennt Kommissionsinitiative, gemeinsame Annahme, Sekundärakte und nationalen Vollzug. Die allgemeine Pflanzenschutzdokumentation bleibt erhalten, Aufwandprognosen bleiben Prognosen, und Datenbedingungen im S/T-Vergleich verhindern eine garantierte Entlastung oder pauschale Aufhebung von Umweltrechten.',
    NEW: 'Beide ganze neue Fälle prüfen die Besonderheit des §13 am richtigen Organ und an ausdrücklich nach §6 gewählten Mitgliedern. 3/5 Gegenstimmen verhindern Bestellung und Widerruf trotz 6/11 Gesamtmehrheit; 2/5 beweisen nur das Fehlen dieses speziellen Hindernisses. Gleichberechtigte Leitung und enges Einvernehmen begründen weder einen Aufsichtsratsstuhl noch unbegrenzte Alleinmacht.',
}
p_judgments = []
for p in profiles:
    p_judgments.append({'goalId': p['goalId'], 'decision': 'KEEP', 'decisionScope': 'CURRENT_WHOLE_BILINGUAL_PROFILE_CONTENT', 'wholeGoalContract': next(g for g in contracts if g['id'] == p['goalId']), 'wholePRecordFingerprint': p['profileFingerprint'], 'goalFingerprint': p['goalFingerprint'], 'reviewInputFingerprint': p['reviewInputFingerprint'], 'wholeCasesReviewed': [c['id'] for c in p['profile']['applicationCaseBriefs']], 'allSixCaseFieldsAndEveryAnchorDEENActuallyRead': True, 'comparisonDe': p_reasons[p['goalId']], 'unresolvedFindingIds': [], 'statusRetained': p['status'], 'reviewAuthorityRetained': p['reviewAuthority'], 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'observedLearnerUnderstanding': False, 'humanApproval': False, 'newVisualizationApproval': False, 'strictGain': 0})
p_ref = write('four-individual-whole-P12-independent-content-KEEP-judgments.json', {'reviewer': REVIEWER, 'judgments': p_judgments, 'KEEP': 4, 'REVISE': 0, 'BLOCK': 0})

source_reasons = [
    'Die gültige ganze776-Betriebsratsleistung und die unabhängig geprüfte ganze fab-Aufsichtsratsleistung bleiben unverändert. Der neue ganze912-Leitungskern ergänzt die eigenständige Montanbesonderheit des §13 mit Bestellungs-/Widerrufsgegenmehrheit und gleichberechtigter Leitung. Die institutionellen Ebenen werden im ganzen Verbund erklärt, ohne Betriebsrat, Aufsichtsrat und Vertretungsorgan gleichzusetzen.',
    'Die gültige ganze a773-Leistung liefert Messung, Indikatoren und bedingten Verlauf. bc3 ergänzt einen echten datierten historischen Auslöser, zwei transparent getrennte Nachfrage-/Angebotsmodelle und einen kombinierten Gegenfall mit beobachtbaren Grenzen. Der amtliche Beispielscharakter begründet keine Quote aller historischen Denkschulen; ein einzelner Trigger wird nicht als vollständige gemessene historische Theorie ausgegeben.',
    'Die ganze8c4-Leistung verbindet tatsächliche wirtschaftliche und institutionelle Entwicklung mit Zuständigkeiten und Verfahren. Die ganze96c-Leistung ergänzt den datierten realen2025/2026-Agrarkonflikt und einen begrenzten datenabhängigen Lösungsweg für Entlastung bei fortbestehender Kontrolle. Initiative, gemeinsame Annahme und Durchführung sind auseinandergehalten; S/T liefert bedingte Konfliktlösungsmöglichkeiten statt eines behaupteten garantierten Reformeffekts.'
]
source_judgments = []
for index, union in enumerate(unions):
    row = union['wholeCurrent125SourceRow']
    source_judgments.append({'sourceAspectId': row['id'], 'wholeExactCurrentV6SourceRow': row, 'wholeSourceRowHash': union['wholeSourceRowHash'], 'decision': 'KEEP', 'decisionScope': 'ONLY_CURRENT_BOUNDED_WHOLE_SOURCE_FACET_PERFORMANCE_UNION_CONTENT', 'acceptedWholePerformanceUnionGoalIds': union['goalIds'], 'wholePerformanceComparisonDe': source_reasons[index], 'remainingWholeSourcePerformance': 'None in this bounded performance union. Source125/native mapping, whole canonical course roles, new goal D/V and integration remain separately pending.', 'trueBoundedCourseEvidence': {'jurisdiction': 'DE-BE', 'stage': 'SekII', 'courseLevel': 'LK', 'phase': row['phase'], 'mandatory': True, 'basis': f"Exact current V6 source row plus actually viewed native original PDF{row['sourceLocator']['currentOfficialPdfPage']} and whole Chapter5.1/5.2 native pages27/28/29. Typography and annual assignment, never canonical tags or phase inference.", 'wholeCanonicalTargetRole': 'NOT_APPROVED_BY_THIS_SOURCE_CONTENT_REVIEW', 'nativeMappingDecision': None, 'nativeApplicability': 'not approved'}, 'currentnessLimit': 'Historical1973 and treaty dates remain dated historical evidence; CAP statement23January2026 and December2025 adoption remain dated current-case anchors, not assertions about every later legislative change. Legal§§1/6/13 freshly read9October2026. No whole EUR-Lex legislative-text approval.', 'sourceFacetContentCandidateAccepted': True, 'wholeSource125CoverageApproved': False, 'wholeCourseApproved': False, 'humanApproval': False, 'strictNetGain': 0})
source_ref = write('three-individual-whole-current-source-facet-performance-union-KEEP-judgments.json', {'schemaVersion': 1, 'reviewer': REVIEWER, 'judgments': source_judgments, 'KEEP': 3, 'REVISE': 0, 'BLOCK': 0, 'historicalBlockedJudgmentsRetained': True})

primary = {
    'reviewer': REVIEWER, 'reviewDate': '2026-10-09',
    'berlin': {'officialUrl': 'https://www.berlin.de/sen/bildung/unterricht/faecher-rahmenlehrplaene/rahmenlehrplaene/rahmenlehrplan-wirtschaftswissenschaft-go-teil-c.pdf', 'originalPDFSha256': '819d98a549e1b3afdd9c374dd34a1706d87359c1f26b9a79717c105e5401421c', 'wholeNativeOriginalPagesActuallyViewed': [23,25,26,27,28,29], 'nativeScale': '1.5; each complete893x1263page independently viewed', 'boundedOwnObservation': 'Montan bullet upright/LK-Q2; cycle headline italic but parenthetical explanation details upright/LK-Q3; whole EU4.4upright/LK-Q4. Whole chapter5 limits GK to italic content and assigns the actual LK themes. No33page-wide verification claim.'},
    'actuallyWholeCurrentNormsRead': [{'url': f'https://www.gesetze-im-internet.de/montanmitbestg/__{n}.html', 'scope': 'complete current individual norm including all paragraphs', 'readDate': '2026-10-09'} for n in [1,6,13]],
    'actuallyWholeOfficialHistoricalBodiesRead': [{'url': f'https://european-union.europa.eu/principles-countries-history/history-eu/{span}_en', 'scope': 'complete substantive timeline body'} for span in ['1970-79','1990-99','2000-09']] + [{'url': 'https://european-union.europa.eu/principles-countries-history/principles-and-values/founding-agreements_en', 'scope': 'complete substantive founding-agreements overview, not linked full treaties'}],
    'actuallyWholeOfficialCAPBodiesRead': [
        {'url': 'https://agriculture.ec.europa.eu/media/news/commission-delivers-further-cap-simplification-eur215-million-farmers-and-national-administrations-2026-01-23_en', 'scope': 'complete actual substantive news body and background; not all linked secondary acts', 'publicationDate': '2026-01-23'},
        {'url': 'https://www.consilium.europa.eu/en/press/press-releases/2025/12/18/council-signs-off-simplification-of-common-agricultural-policy/', 'scope': 'complete actual substantive official press body; not linked whole legislation', 'publicationDate': '2025-12-18'},
        {'url': 'https://www.europarl.europa.eu/news/de/press-room/20251211IPR32163/einfachere-regeln-und-mehr-hilfen-fur-landwirte', 'scope': 'complete actual substantive German official press body, independently read as fallback; English/EnglishPDF requests returned an anti-bot page', 'publicationDate': '2025-12-16', 'originalRawHashClaimed': False}
    ],
    'truthfulRetrievalBoundaries': ['Fresh directBerlinPDFrequest and firstwebscreenshotreturned429; exact previously received819d...historicaloriginal was independently hashed, rendered and actually viewed.', 'EnglishEPURL andEPEnglishPDF returned anti-bot material; that material was not counted as source. The actual officialGermanbody supports date, parliamentary decision and council adoption pending at that date.', 'No full EUR-Lex regulation or treaty text was read or approved in this package.'],
    'completeExtractedPDFOrPressTextNewlyCommitted': False, 'quotationWordsInOwnAids': 0, 'humanSourceOrRightsApproval': False,
    'unchangedValidPriorUnionConstituentReuse': [digest(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-P13-P26-Montan-independent-whole-positive-source-need-atomicity-memory-review-v1/actual-final-independent-P13-P26-source16-Montan-Need-AM-M-current-laws-bounded-review.receipt.json')]
}
primary_ref = write('actual-independent-whole-primary-reading-receipt-and-own-boundaries.json', primary)

copy_path = OWN / 'whole-four-independent-content-KEEP-P12.author-native-byteexact.jsonl'
assert not copy_path.exists()
copy_path.write_bytes(profiles_path.read_bytes())
assert copy_path.read_bytes() == profiles_path.read_bytes()
assert len([json.loads(line) for line in copy_path.read_text().splitlines()]) == 4
native_result = read(OWN / 'actual-independent-four-P12-current-contract-image-native-result.json')
assert native_result['nativeErrors'] == [] and native_result['wholeCases'] == 12 and native_result['wholeOldCasesExact'] == 6
sys.path.insert(0,str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors
symlink_errors = curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
for path in OWN.iterdir():
    if path.suffix == '.json': read(path)
    if path.suffix == '.jsonl':
        for line in path.read_text().splitlines(): json.loads(line)
own_paths = [p.relative_to(ROOT).as_posix() for p in OWN.iterdir() if p.is_file()]
ignored = subprocess.run(['git','check-ignore','--no-index','--stdin'], cwd=ROOT, input='\n'.join(own_paths)+'\n', text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout, ignored.stdout
for path, before in guards.items():
    assert digest(ROOT/path) == before, path
guard_ref = write('actual-whole-author-current-historical-input-guards-and-scoped-schema-graph-portability.json', {'wholeExactInputs': list(guards.values()), 'inputCount': len(guards), 'allWholeInputsExactBeforeAfter': True, 'wholeGoalSchemaErrors': goal_errors, 'wholePositiveSchemaErrors': positive_errors, 'whole419RequiresAndContainsGraphErrors': [], 'nativeFourP12Errors': [], 'oldWholeCasesExact': 6, 'newSubstantiveCases': 6, 'curriculumSymlinkErrors': symlink_errors, 'ignoredOwnMandatoryPaths': [], 'wholeWrittenJSONAndJSONLParsed': True, 'temporaryPrimaryAndDependenciesOutsideCurricula': True, 'noLiveEdits': True})
artifacts = [digest(p) for p in sorted(OWN.iterdir()) if p.is_file()]
final = {'createdAt': datetime.now(timezone.utc).isoformat(), 'reviewId': OWN.name, 'reviewer': REVIEWER, 'originalAuthor': '/root/economics_merge_audit', 'authorHandoff': digest(handoff_path), 'wholeFourP12': digest(copy_path), 'PContentJudgments': p_ref, 'PCounts': {'KEEP': 4, 'REVISE': 0, 'BLOCK': 0, 'wholeCases': 12, 'unchangedValidWholeOldCases': 6, 'newWholeCases': 6}, 'newDirectorWholeNeedAtomicityTaxMemory': need_ref, 'qualifiedWholeSourcePerformanceJudgments': source_ref, 'SourceCounts': {'KEEP': 3, 'REVISE': 0, 'BLOCK': 0}, 'actualPrimaryReading': primary_ref, 'actualIndependentNumerics': number_ref, 'actualSyntheticCounteranswers': counter_ref, 'scopedNativeAndGuardChecks': guard_ref, 'artifacts': artifacts, 'strictCurrentReference': {'closed': 300, 'currentCurricularAtomic': 311, 'maturity': 'M2', 'netGain': 0, 'newActiveScientificCompletions': 0, 'restoredActiveBindings': 0}, 'newDirectorVisualizationStillPendingAtThisPReceipt': True, 'newDirectorDTwoIndependentWholePagesPending': True, 'wholeSource125CoverageApproved': False, 'wholeCourseApproved': False, 'nativeMappingOrLiveIntegrationApproved': False, 'humanApprovalOrTrial': False, 'publishedOrDeployed': False, 'nextStep': 'Root may reconcile exactly three qualified source-performance judgments, preserving source125/whole-course boundaries. Independently review the separately generated912PNG and two actual current wholeDpages, then integrate only reviewed current semantics and native evidence bindings.'}
ref = write('actual-final-independent-four-P12-three-qualified-source-unions-and-one-new-director-Need-AM-M-KEEP.receipt.json', final)
print(json.dumps({'finalReceipt': ref, 'PKEEP': 4, 'sourcePerformanceKEEP': 3, 'newNeedAMMKEEP': NEW, 'nativeErrors': 0, 'numericChecks': len(numeric), 'oldCasesExact': 6, 'counteranswers': 6, 'inputGuards': len(guards), 'strictGain': 0}, ensure_ascii=False, indent=2))
