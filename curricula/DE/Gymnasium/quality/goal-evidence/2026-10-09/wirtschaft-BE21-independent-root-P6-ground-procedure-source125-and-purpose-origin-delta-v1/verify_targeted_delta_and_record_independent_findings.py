import datetime
import hashlib
import json
from decimal import Decimal
from pathlib import Path

OUT = Path(__file__).parent
AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-BE21-ground-procedure-split-power-P2-and-source125-bounded-author-successor-v1')
OLD = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-BE-two-product-power-gap-atoms-and-full-LK-insolvency-bounded-author-v1')


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    path = Path(path)
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()}


guard = read(OUT / 'actual-inputs-before.guard.json')
changed = [entry['path'] for entry in guard['files'] if binding(entry['path']) != entry]
assert not changed, changed
manifest = read(AUTHOR / 'actual-final-frozen-payload-manifest-after-terminal-primary-refresh.successor-v2.json')
assert all(binding(e['path']) == e for e in manifest['files'])
specs = read(AUTHOR / 'whole-four-positive-v2-eight-substantive-bilingual-case-author-specs.json')['goals']
records = [json.loads(s) for s in (AUTHOR / 'whole-four-positive-v2.review.inert-author-candidates.jsonl').read_text().splitlines() if s]
record_by_id = {r['goalId']: r for r in records}
for spec in specs:
    record = record_by_id[spec['goalId']]
    assert record['profile'] == spec['profile']
    assert record['status'] == 'needs_human_review' and record['reviewAuthority'] == 'ai_candidate'
    assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
old_lines = (OLD / 'whole-three-positive-v2.review.schema-valid-author-successor-v2.jsonl').read_text().splitlines()
new_lines = (AUTHOR / 'whole-four-positive-v2.review.inert-author-candidates.jsonl').read_text().splitlines()
old_product = next(s for s in old_lines if json.loads(s)['goalId'].startswith('0489'))
new_product = next(s for s in new_lines if json.loads(s)['goalId'].startswith('0489'))
assert old_product == new_product

old_source_path = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-BE-correct-primary-EQ-source-and-scope-author-v3/source-extraction/DE_BE_WIRTSCHAFT_SEKII_BERLIN2006_EP2010_AB2022.author-v3.source-extraction.json')
source_path = AUTHOR / 'source-extraction/DE_BE_WIRTSCHAFT_SEKII_BERLIN2006_EP2010_AB2022.ground-procedure-source125-successor-v5.source-extraction.json'
old_source, source = read(old_source_path), read(source_path)
old_rows = {s['id']: s for s in old_source['sourceGoals']}
rows = {s['id']: s for s in source['sourceGoals']}
same_ids = set(old_rows) & set(rows)
assert len(same_ids) == 123 and all(old_rows[i] == rows[i] for i in same_ids)
old_passages = {p['passageId']: p for p in old_source['passages']}
new_passages = {p['passageId']: p for p in source['passages']}
changed_passages = [i for i in old_passages if old_passages[i] != new_passages[i]]
assert changed_passages == ['be-correct:q.c41.kaufmann.lk']
old_passage, new_passage = old_passages[changed_passages[0]], new_passages[changed_passages[0]]
assert {k: v for k, v in old_passage.items() if k != 'sourceGoalIds'} == {k: v for k, v in new_passage.items() if k != 'sourceGoalIds'}

card_proof = read(AUTHOR / 'actual-exact-card-content-and-minimal-origin-deck-node-successor.proof.json')
old_deck = read(card_proof['previousDeck']['path'])
new_deck = read(card_proof['currentDeck']['path'])
old_cards = {c['id']: c for c in old_deck['cards']}
new_cards = {c['id']: c for c in new_deck['cards']}
assert set(old_cards) == set(new_cards) and len(new_cards) == 5
purpose = 'economics-insolvency-collective-creditors'
assert all(old_cards[i] == new_cards[i] for i in old_cards if i != purpose)
assert {k: v for k, v in old_cards[purpose].items() if k != 'originGoalIds'} == {k: v for k, v in new_cards[purpose].items() if k != 'originGoalIds'}
proc_id = '2790f704-116b-577d-aca7-b502d57a21f6'
assert new_cards[purpose]['originGoalIds'] == [proc_id]
am = {r['goalId']: r for r in read(AUTHOR / 'twenty-one-memory-decisions-only-ground-none-procedure-purpose-origin-successor.proposal.json')}
assert am[proc_id]['decisionProposal'] == 'memory_required'
assert am[proc_id]['cardIDs'] == [purpose]
assert am[proc_id]['deckIds'] == [new_deck['deckId']]
ground_id = 'f0b1bd59-a2ce-562b-bb63-6927f590dce2'
assert am[ground_id]['decisionProposal'] == 'no_memory_needed'
assert not am[ground_id]['memoryGoalIds'] and not am[ground_id]['deckIds']
nodes = read(AUTHOR / 'whole-four-memory-goals-only-commercial-origin-and-current-deck-binding-successor.json')
node = next(n for n in nodes if n['id'] == am[proc_id]['memoryGoalIds'][0])
assert proc_id in node['extendedData']['authorCandidate']['originGoalIds']
assert ground_id not in node['extendedData']['authorCandidate']['originGoalIds']
assert node['extendedData']['authorCandidate']['deckDraftBinding'] == binding(card_proof['currentDeck']['path'])

calculations = {
    'A_alone_below5': Decimal(4) < Decimal(5),
    'A_C6_when_exemption_supplied': Decimal(4) + Decimal(2) == Decimal(6),
    'B_C5_arithmetic_only_no_C_consent': Decimal(3) + Decimal(2) == Decimal(5),
    'D_alone6_below7': Decimal(6) < Decimal(7),
    'documented_D_F8_above7': Decimal(6) + Decimal(2) == Decimal(8),
    'C_F_asset_coverage_gap300000': Decimal(900000) - Decimal(600000) == Decimal(300000),
    'G_costs_shortfall6000': Decimal(8000) - Decimal(2000) == Decimal(6000),
    'G_assets_do_not_cover_costs': Decimal(2000) < Decimal(8000),
}
assert all(calculations.values())

findings = [
    {
        'goalId': '4c9b844f-a5fb-595b-935f-27cbc66610ae',
        'positiveDelta': 'KEEP', 'semanticAtomicity': 'atomic', 'demandLevel': 'AB2',
        'wholeCaseIds': [c['id'] for c in record_by_id['4c9b844f-a5fb-595b-935f-27cbc66610ae']['profile']['applicationCaseBriefs']],
        'reasonDe': 'Ein belegter Wirkungszusammenhang von Entscheidungsbedingungen zu wirtschaftlichen Optionen. Fall1 nennt B/C ausdrücklich nur rechnerisch: C-Zustimmung, Koalition und Beschluss werden nicht erfunden; A/C ist an die genannte Ausnahme gebunden. Vetoänderung entfernt nur eine notwendige Sperre. Fall2 belegt separat Agenda3Mai, tatsächliche8D/F-Ja10Mai und wirksamen Text1Juni; vereinfachtes Verfahren und gleicher Zugang sind konkret, keine sofortige Einzelzulassung oder sichere Einsparung. DE/EN unterscheiden Daten und Grenzen gleich. Unterschiedliche Veto-/Agenda-/Zugangsmechanismen bilden frischen Transfer statt bloßen Zahlenwechsel.',
        'resolvedOriginalFindingIds': ['POWER_C_COALITION_CONSENT_NOT_GIVEN', 'POWER_ADOPTED_ECONOMIC_RULE_NOT_SPECIFIED'],
        'memoryDecision': 'no_memory_needed', 'memoryReason': 'Alle fiktiven Entscheidungsregeln sind gegeben; der Wirkungszusammenhang ist eine Analyse und verlangt keinen zusätzlichen Institutionsabruf.'
    },
    {
        'goalId': ground_id, 'positiveDelta': 'KEEP', 'semanticAtomicity': 'atomic', 'demandLevel': 'AB2',
        'wholeCaseIds': [c['id'] for c in record_by_id[ground_id]['profile']['applicationCaseBriefs']],
        'reasonDe': 'Ein einziger begründeter Vergleich gesetzlicher Insolvenzgründe nach bereitgestellten Normen. A ist17 trotz positiven Reinvermögens; B ist18 mit24-Monats-Prognose und Schuldnerantrag; C ist19 mit300000Deckungslücke und fehlender überwiegend wahrscheinlicher12-Monats-Fortführung. D/E/F sind echte Gegenfälle: verfügbare Finanzierung, bilanzielle Verluste ohne Zahlungsunfähigkeit, Fortführungs-Ausnahme. Aktuelle Zahlungsfähigkeit schließt18/19 nicht aus. Keine selbständige Verfahrensroutine, erfundene Prozentgrenze oder zusätzliche Antragspflichtleistung. Ganze DE/EN-Anforderungen/Erwartungen/Foki stimmen fachlich überein.',
        'resolvedOriginalFindingIds': ['F0_INDEPENDENT_GROUND_AND_PROCEDURE_ROUTINES', 'F0_STALE_CURRENT_DISPOSITION_REASON'],
        'memoryDecision': 'no_memory_needed', 'memoryReason': 'Normen/Horizonte/Tatsachen sind vollständig gegeben; normgestütztes Vergleichen braucht keine neue Rechtsnorm-Abrufkarte.',
        'sourceCourseDisposition': 'BLOCK_LK_ONLY_SCOPE',
        'actualNewFindingId': 'SOURCE125_GROUNDS_ACTUAL_ITALIC_GK_CONTENT',
        'actualNewFinding': 'Amtliche PDF22: eigenes Arial-ItalicMT-Span Insolvenzgründe; Kapitel5.1 PDF27 sagt jeweils nur kursiv für GK-Q1 Kaufmann. Source125/V5 und f0 dürfen nicht als LK-only freigegeben werden. Präziser GK/LK-Scope-Nachfolger erforderlich, Inhalt/P2 nicht erneut authoren.'
    },
    {
        'goalId': proc_id, 'positiveDelta': 'KEEP', 'semanticAtomicity': 'atomic', 'demandLevel': 'AB2',
        'wholeCaseIds': [c['id'] for c in record_by_id[proc_id]['profile']['applicationCaseBriefs']],
        'reasonDe': 'Eine abgegrenzte Erklärung des gewöhnlichen Verfahrens bei jeweils gegebenem Grund und vollständigem zulässigem Antrag. C unterscheidet Antrag, tatsächlichen gerichtlichen Beschluss, ausdrücklich normale Verwalterbestellung und kollektiven Zweck ohne Zahlungs-/Schließungsgarantie. G kontrastiert6000fehlende Kostenmasse ohne Vorschuss/Stundung:26-Abweisung trotz Grund/Antrag, keine fiktive Auszahlung an einen Lieferanten. DE/EN stellen dieselben Tatsachen und Grenzen dar. Grundvergleich wird ausdrücklich nicht geprüft; allgemeine Gesetzesanwendung als Voraussetzung bleibt plausibel, kein unberechtigtes f0-Gating.',
        'resolvedOriginalFindingIds': ['F0_INDEPENDENT_GROUND_AND_PROCEDURE_ROUTINES'],
        'memoryDecision': 'memory_required', 'memoryReason': 'Nur der bereits unabhängig notwendige kompakte kollektive Gläubigerzweck erhält diesen tatsächlichen Verfahrensatom als Origin. Keine neue Prozedur-Abrufkarte und kein Wiederaufleben der entfernten Cashkarte.',
        'purposeCardOriginDelta': 'KEEP', 'sourceCourseDisposition': 'KEEP_BOUNDED_LK_Q1_FACET_ONLY',
        'scopeReason': 'PDF22 zeigt Grundzüge der Insolvenzordnung aufrecht; Kapitel5.2 PDF29 ordnet ganzen Kaufmannbereich LK-Q1 zu. Das ist keine ganze Kurs-/Quellenabdeckungsfreigabe.'
    },
]
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
individual_path = OUT / 'actual-three-individual-whole-P6-AM-atomicity-and-source-scope-delta-decisions.json'
individual_path.write_text(json.dumps({'createdAt': now, 'reviewer': '/root independent of original bounded author', 'findings': findings, 'decimalChecks': calculations, 'unchangedProductRecordLineExactAndPriorKEEPRetained': True, 'source123WholeRows56WholePassagesRetained': True, 'purposeCardWholeDEENContentsExact': True, 'fourOtherWholeCommercialCardsExact': True, 'nativeMemoryVisibilityApproved': False, 'humanApproval': False}, ensure_ascii=False, indent=2) + '\n')
after = {'createdAt': now, 'files': [binding(e['path']) for e in guard['files']], 'wholeBeforeAfterExact': True}
(OUT / 'actual-inputs-after.guard.json').write_text(json.dumps(after, ensure_ascii=False, indent=2) + '\n')
receipt = {
    'createdAt': now, 'reviewer': '/root independent machine reviewer',
    'authorFrozenManifest': binding(AUTHOR / 'actual-final-frozen-payload-manifest-after-terminal-primary-refresh.successor-v2.json'),
    'actualInputsGuarded': len(guard['files']), 'wholeBeforeAfterExact': True,
    'actualRead': {'wholeCurrentGoals': 4, 'newWholeProfiles': 3, 'newWholeDEENCases': 6, 'caseBilingualFields': 36, 'currentOfficialWholeInsONorms': [17,18,19,13,16,26,27,1], 'wholeSourceRows': 2, 'changedWholeSourcePassage': 1, 'actualWholePrimaryRasterPagesViewed': [22,27,28], 'actualWholePrimaryTextPagesRead': [22,27,28,29,30], 'actualWholePurposeCard': True, 'actualWholeCommercialMemoryNode': True},
    'newPositiveKeeps': 3, 'individuallyCurrentAtomicDecisions': 3,
    'resolvedPriorFindings': ['POWER_C_COALITION_CONSENT_NOT_GIVEN','POWER_ADOPTED_ECONOMIC_RULE_NOT_SPECIFIED','F0_INDEPENDENT_GROUND_AND_PROCEDURE_ROUTINES','F0_STALE_CURRENT_DISPOSITION_REASON'],
    'newSourceScopeBlock': 'SOURCE125_GROUNDS_ACTUAL_ITALIC_GK_CONTENT',
    'individualDecisions': binding(individual_path),
    'actualPrimaryRasterAndSpanProof': [binding(OUT / n) for n in ['actual-official-whole-PDF22-printed18.png','actual-official-PDF22-original-italic-and-upright-span-evidence.json','actual-official-whole-PDF27-chapter5.png','actual-official-whole-PDF28-chapter5.png']],
    'freshBrowserAttempt': {'InsO26': 'actual full official page read', 'InsO17And19': '400 timeout; current unchanged full official captured text actually read instead', 'BerlinPDF': '429; actual unchanged previously captured official33-page PDF819d98 read and rendered instead'},
    'nativeStatusPreserved': {'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1'},
    'notClaimed': ['twoDescriptionRounds','finalVisualBindings','wholeSource125Coverage','wholeBerlinCourseApproval','nativeMemoryVisibility','humanReview','fieldTrials','publication'],
    'currentLiveStrict': '300/311', 'newLiveStrictClosures': 0, 'restoredLiveBindings': 0, 'netLiveGain': 0,
    'nextActualAction': 'Original author creates precise same-content GK/LK ground scope successor; then actual delta verification. Four necessary missing visuals and both D rounds remain separate.'
}
final = OUT / 'actual-independent-three-P6-atomicity-memory-purpose-origin-and-source125-italic-scope-finding.receipt.json'
final.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'receipt': binding(final), 'newPositiveKeeps':3, 'newAtomicKeeps':3, 'purposeOriginDelta':'KEEP', 'newSourceScopeBlock':receipt['newSourceScopeBlock'], 'inputsBeforeAfterExact':50, 'netLiveGain':0}))
