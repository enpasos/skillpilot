import copy
import hashlib
import json
from fractions import Fraction as F
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
AUTHOR = BASE / 'wirtschaft-M4-two-legacy-trade-order-five-current-contracts-whole-remedy-author-v1'
FINAL = AUTHOR / 'final-current524-fieldwise-two-case-author-successor-v3'
BODY = FINAL / 'whole-two-current-UUIDs-five-contracts-two-case-DRAFT.final-author-v3.json'
CONTRACT = AUTHOR / 'whole-current-five-goal-contracts-and-original-P10.exact-input.json'
HANDOFF = FINAL / 'actual-final-two-legacy-five-whole-contracts-two-case-DRAFT.author-handoff.json'
CAN = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
CFG = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
OLD = BASE / 'wirtschaft-M4-two-remaining-legacy-trade-and-order-whole-science-independent-b-v1/actual-final-two-legacy-whole-materials-current-contract-scientific-REVISE.handoff.receipt.json'
PRIMARY = Path('/tmp/skillpilot-economics-legacy-remedy-independent-B-primary-20261010')

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p), 'sha256': sha(p), 'bytes': p.stat().st_size}
def dump(name, obj):
    p = OUT / name
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

assert sha(BODY) == 'e391f359dc2d5363a3ffec8b9c5240f322036e53144a6bf36d4d099bfeeee12d'
assert sha(CONTRACT) == 'bcb43aff16878b11cd41499943fba2e04256733cb2eef943964cfc95e02c9ce7'
assert sha(HANDOFF) == 'ee77391f4b81f1d0a207a69e5590b0f2520223d69505115670fcd2bbf87d3955'
assert sha(OLD) == 'd4522442a47386fe1aad0e68897238ea4603f408b8b64e2d0abfe14c205e1e05'
bodies = json.loads(BODY.read_text())
contracts = json.loads(CONTRACT.read_text())
current_can = json.loads(CAN.read_text())
current = {g['id']: g for g in current_can['goals']}
assert all(current[g['id']] == g for g in contracts['wholeGoals'])

def find_econ(x):
    if isinstance(x, dict):
        if 'positiveEvidenceConfigPaths' in x and any('wirtschaft-current' in p for p in x['positiveEvidenceConfigPaths']): return x
        for v in x.values():
            y = find_econ(v)
            if y: return y
    if isinstance(x, list):
        for v in x:
            y = find_econ(v)
            if y: return y

econ = find_econ(json.loads(CFG.read_text()))
assert econ
goal_ids = {g['id'] for g in contracts['wholeGoals']}
profiles = {}
profile_sources = []
for path in econ['positiveEvidenceConfigPaths']:
    cp = ROOT / path
    config = json.loads(cp.read_text())
    rp = ROOT / config['reviewPath']
    rows = [json.loads(line) for line in rp.read_text().splitlines() if line.strip()]
    selected = [r for r in rows if r.get('goalId') in goal_ids]
    if selected:
        profile_sources.append({'config': bind(cp), 'review': bind(rp), 'selectedGoalIds': [r['goalId'] for r in selected]})
        for r in selected: profiles[r['goalId']] = r
assert len(profiles) == 5
assert all(profiles[p['goalId']]['profile'] == p['profile'] for p in contracts['wholeP'])
assert sum(len(p['profile']['applicationCaseBriefs']) for p in contracts['wholeP']) == 10
inert = json.loads((FINAL / 'whole-current524-only-two-legacy-examData-successors.final-inert-author-v3.json').read_text())
inert_map = {g['id']: g for g in inert['goals']}
assert set(inert_map) == set(current)
assert len(current) == 524
for g in current_can['goals']:
    if g['id'] in {b['id'] for b in bodies}:
        before = copy.deepcopy(g); after = copy.deepcopy(inert_map[g['id']])
        before.pop('examData'); after.pop('examData')
        assert before == after
        assert inert_map[g['id']] == next(b for b in bodies if b['id'] == g['id'])
    else:
        assert inert_map[g['id']] == g
for b in bodies:
    assert b['requires'] == b['examData']['coveredGoalIds']
    assert b['examData']['reviewStatus'] == 'draft'
    assert b['examData']['scoring']['maxPoints'] == 30
    assert b['examData']['scoring']['passingPoints'] == 18
    for key in ['taskContent', 'solutionContent', 'taskContentEn', 'solutionContentEn']:
        assert isinstance(b['examData'][key], str) and len(b['examData'][key]) > 1500
input_ref = dump('whole-two-DRAFT-five-current-whole-contracts-P10-and-field-guards.independent-input.json', {
    'wholeTwo': bodies,
    'wholeFiveGoalAndOriginalP10': contracts,
    'actualCurrentPWholeContents': profiles,
    'currentCAN': bind(CAN),
    'currentRegistry': bind(CFG),
    'actualCurrentPBindings': profile_sources,
    'fiveGoalsWholeExact': True,
    'fiveProfileContentsWholeExact': True,
    'other522GoalsWholeExact': True,
    'twoChangesOnlyExamData': True,
    'originalREVISEUnchanged': bind(OLD)
})

checks = []
def ck(label, value, expected):
    value = F(value); expected = F(expected)
    assert value == expected, (label, value, expected)
    checks.append({'id': label, 'actualExact': str(value), 'expectedExact': str(expected), 'status': 'PASS'})

ck('order-A-hourly-change', F('14.10') - F('13.20'), F('0.90'))
ck('order-A-optional-relative-change', (F('14.10') - F('13.20')) / F('13.20'), F(3, 44))
ck('order-A-two-item-burden', 420000 - 180000, 240000)
ck('order-A-demand-decline', F(85 - 100, 100), F(-3, 20))
ck('order-B-spare-capacity', 100 - 95, 5)
ck('order-B-benefit-after', 100 - 80, 20)
ck('order-B-available-before', 0 + 100, 100)
ck('order-B-available-after', 200 + (100 - 80), 220)
ck('order-B-net-gain', 220 - 100, 120)
ck('order-B-retained-marginal-share', F(200 - 80, 200), F(3, 5))
ck('order-B-withdrawal-share', F(80, 200), F(2, 5))
ck('trade-A-import-unit', 30 + 5, 35)
ck('trade-A-domestic-unit', 70 + 1, 71)
ck('trade-A-import-total', (30 + 5) * 100, 3500)
ck('trade-A-domestic-total', (70 + 1) * 100, 7100)
ck('trade-A-cleaner-unit', 15 + 5, 20)
ck('trade-A-cleaner-larger-total', (15 + 5) * 300, 6000)
ck('trade-A-cleaner-total-change', 6000 - 3500, 2500)
ck('trade-A-cleaner-unit-share', F(20, 35), F(4, 7))
ck('trade-A-cleaner-total-share', F(6000, 3500), F(12, 7))
ck('trade-A-cleaner-versus-unequal-domestic-total', 7100 - 6000, 1100)
ck('trade-A-quota-units-below-baseline', 100 - 60, 40)
ck('trade-A-full-pass-through-tariff-price', 50 + 10, 60)
ck('trade-A-price-gap-after-tariff', 70 - 60, 10)
ck('trade-A-relative-model-tariff', F(10, 50), F(1, 5))
ck('trade-B-import-unit', 20 + 2, 22)
ck('trade-B-local-unit', 50 + 1, 51)
ck('trade-B-import-total', 22 * 100, 2200)
ck('trade-B-local-total', 51 * 100, 5100)
ck('trade-B-cleaner-unit', 10 + 2, 12)
ck('trade-B-cleaner-larger-total', 12 * 300, 3600)
ck('trade-B-cleaner-total-change', 3600 - 2200, 1400)
ck('trade-B-cleaner-production-unit-change', F(10 - 20, 20), F(-1, 2))
ck('trade-B-cleaner-full-unit-share', F(12, 22), F(6, 11))
ck('trade-B-cleaner-total-share', F(3600, 2200), F(18, 11))
ck('trade-B-cleaner-water-total', 6 * 300, 1800)
ck('trade-B-local-water-total', 2 * 100, 200)
ck('trade-B-water-total-ratio-unequal-quantity', F(1800, 200), 9)
calc_ref = dump('actual-independent-38-Fraction-model-calculations.json', {'actualExecutedCheckCount': len(checks), 'method': 'Own exact Fraction calculations of stipulated figures, not author results or current actual tariff rates', 'checks': checks})
assert len(checks) == 38

# Manual substantive grades below are independent reviewer decisions. This
# script validates the disclosed ranges, sums, and literal essential-absence
# cap only; it is not an automated scientific or learner grading engine.
works = []
def add(body_index, label, answers, marks, reasons, cap_reason=None, expected=None):
    maxima = [s['points'] for s in bodies[body_index]['examData']['scoring']['steps']]
    assert len(answers) == len(marks) == len(reasons) == 4
    assert all(isinstance(m, int) and 0 <= m <= limit for m, limit in zip(marks, maxima))
    raw = sum(marks)
    final = min(raw, 17) if cap_reason else raw
    if expected is not None: assert final == expected
    works.append({'id': label, 'materialId': bodies[body_index]['id'], 'wholeFourTaskSubmission': answers,
        'manualCriterionDecisions': [{'task': i + 1, 'maximum': maxima[i], 'points': marks[i], 'reason': reasons[i]} for i in range(4)],
        'rawPoints': raw, 'essentialAbsenceCapApplied': bool(cap_reason), 'capReason': cap_reason,
        'finalPoints': final, 'result': 'PASS' if final >= 18 else 'FAIL',
        'role': 'Independent synthetic complete counterwork, not a real learner or human approval'})

order_full = [
    '0,90 EUR mehr je Stunde; die optionalen 6,82% folgen aus 0,90/13,20. 420000−180000=240000 ist nur der Rest dieser zwei Posten, kein vollständiger Gewinn oder Arbeitsplatzbeweis. Liberal würden flexible relative Preise und freier Eintritt Ressourcen umlenken; gerade langsame Preise und konzentrierte Macht begrenzen das hier. Keynes erklärt 100→85 durch Nachfrage-/Einkommensrückwirkung bei freien Kapazitäten: zeitweise Ausgaben könnten helfen, wenn sie ankommen. Ordoliberal braucht durchgesetzte allgemeine Wettbewerbs-/Haftungsregeln und Prüfung des vermuteten Kartells; diese löst die Nachfragelücke nicht allein. Staatliche Aufträge und Regeln können sich ergänzen, ohne identische Begründung.',
    'Private Preise/Mengen bestehen in allen Marktvarianten. Hier kommt tatsächliche Kartellprüfung gegen private Macht plus beitragsfinanzierte Risikosicherung hinzu: soziale Marktwirtschaft ist kein freier Markt ohne Regeln und kein Plan jeder Menge. Eine höhere Lohnuntergrenze kann Erwerbseinkommen sichern, aber Kostenweitergabe, Arbeitszeit und Absatzreaktionen fehlen. Ich würde zunächst gezielte Transfers/Qualifikation und Wettbewerbsprüfung verbinden, wenn Finanzierung und Erreichbarkeit funktionieren; Beschäftigte erhalten Schutz, Betriebe müssen Kosten und Nachfrage tragen, Beitrags-/Steuerzahler finanzieren. Ablehnung des Mindestlohns ist keine Ablehnung jeder Sicherung, und zusätzliche Nachfrage ersetzt keine Kartellprüfung.',
    'Bei stabiler Nachfrage und 95% Nutzung ist die A-Diagnose nicht einfach übertragbar. Liberal sind Kosten- und Preissignale nützlich, aber exklusive Verträge sperren Zugang. Keynes muss verbleibende 5% Kapazität, Bedarf und Reaktionsfristen prüfen: Ausgaben können eher Preise oder Engpässe treiben. Ordoliberal zielt durch durchsetzbare allgemeine Zugangsregeln unmittelbar auf Exklusivität. Ein öffentlicher Kauf löst diese Verträge nicht. Daher zuerst Regeln und soziale Absicherung verbinden, Nachfragehilfe erst bei belegter Restlücke; Regeln sind kein staatlicher Produktionsplan.',
    'Ohne Arbeit 100 EUR. Mit Arbeit 200+20=220, Zuwachs120. Gegenüber voller Beibehaltung der Leistung ist der Nettoanreiz kleiner, aber nicht null. Privatpreise und Wettbewerb bleiben, allgemeine Regeln öffnen Zugang und Sicherung schützt Einkommen; ein ungesicherter Markt hätte die Risikoteilung nicht, Mengenplanung ersetzt die dezentrale Wahl. Schutz, Arbeitskosten, Eintritt und begrenzte Beiträge/Steuern können konfligieren. Tatsächlicher Eintritt neuer Anbieter, Inanspruchnahme, Beschäftigungs-/Kostenreaktionen und Finanzierung wären notwendig, statt Wirksamkeit aus dem guten Ziel zu folgern.'
]
full_reason = ['All three applied causal diagnoses, state roles, limits and qualified calculation', 'Concrete decentralised/competition/social institution comparison and conditional alternative stakeholder analysis', 'Independent transfer distinguishes entry barriers and high capacity use through all three actual mechanisms', 'Correct net incentive and concrete institutional/protection/funding comparison with evidence need']
add(0, 'order-full-alternative-transfer-rule-priority', order_full, [7, 8, 8, 7], full_reason, expected=30)
order_other = copy.deepcopy(order_full)
order_other[1] = 'Die Ordnung verbindet privat gesetzte Preise mit unabhängiger Kartellprüfung und beitragsfinanzierter Sicherung. Das unterscheidet sie sowohl vom Markt ohne Schutz-/Wettbewerbsinstitutionen als auch von zentral gewählten Mengen. Ich gewichte angemessene Arbeitseinkommen höher und befürworte die Lohnanhebung zusammen mit befristeter Qualifikation/Abfederung, falls tatsächliche Produktivität, Preisweitergabe und Finanzierung geprüft werden. Betriebe tragen die verbleibende Modellbelastung240000 nur in diesen Posten; Beschäftigte können von Schutz profitieren, Nachfrage und Jobs bleiben offen. Wettbewerbsschutz und Transfers ergänzen unterschiedliche Mechanismen, keine Beschäftigungsgarantie.'
order_other[2] += ' Abweichend könnte eine eng begrenzte öffentliche Investition neben der Regelreform sinnvoll sein, wenn gerade die übrigen5% geeignete Ressourcen und Bedarf nachweislich liefern; ich behaupte nicht, 95% bedeute keinerlei freie Kapazität.'
add(0, 'order-full-different-legitimate-policy-weights', order_other, [7, 8, 8, 7], full_reason, expected=30)
order_partial = [
    'A: Liberal flexible Kosten-/Preissignale bei Zugang, Keynes Nachfrageausfall mit freien Kapazitäten, Ordo durchsetzbare Wettbewerbsregeln gegen private Macht. Langsame Anpassung begrenzt den ersten, Regeln allein lösen den Nachfrageausfall nicht. Lohn+0,90; Kosten minus Erlöse240000, nicht voller Gewinn.',
    'Privatpreise plus Kartellprüfung plus beitragsfinanzierte Versicherung bleiben Marktkoordination mit Sicherung. Reine Mengenplanung unterscheidet sich; ein Markt ohne diese Institutionen schützt Risiken/Wettbewerb nicht so. Mindestlohn kann schützen, kostet aber Anpassung; eine gezielte Transferalternative braucht Finanzierung. Ich lasse die Verteilungsdetails zwischen allen Gruppen unvollständig.',
    'B: Zugangssperre begrenzt liberale Selbstanpassung, Ordo-Regeln können sie adressieren. Keynes muss erst fragen, ob bei95% wirklich weitere Nachfrage ohne Engpass hilft. Ausgaben allein heben keinen Exklusivvertrag auf; Regeln plus Schutz bedingt sinnvoll. Weitere Maßnahmengewichte bleiben offen.',
    '100→220, Netto+120: teilweiser Entzug verringert, vernichtet den Anreiz aber nicht. Markt bleibt privat, Wettbewerbsregeln und Sozialschutz ergänzen. Finanzierung und Inanspruchnahme prüfen; eine detaillierte Gegenüberstellung zur Planwirtschaft fehlt hier.'
]
add(0, 'order-fair-incomplete-real-three-view-and-institution-work', order_partial, [6, 6, 6, 6], ['Core three-way mechanisms/states present, one comparison detail omitted', 'Real institution contrast; stakeholder/alternative detail incomplete', 'Real transfer/limit/core state mechanisms; policy comparison incomplete', 'Correct incentive/core institution distinction; planning contrast incomplete'], expected=24)
order_min = [
    'Liberal private Kostenanpassung bei offenem Zugang; Keynes Nachfragerückfluss bei freien Kapazitäten; Ordo Wettbewerbsaufsicht gegen Macht. Hier langsame Anpassung und Kartellverdacht. Staatsrollen folgen den verschiedenen Mechanismen. Lohn+0,90; die vollständige Kostenabgrenzung lasse ich aus.',
    'Private Preise, geprüfter Wettbewerb und Versicherungsbeiträge verbinden Markt und Schutz. Das ist keine Mengenplanung; ohne Institutionen fehlen Risiko- und Machtkontrolle. Beschäftigte werden geschützt, Beiträge müssen finanziert werden. Alternativen und Unternehmerreaktionen bespreche ich nicht weiter.',
    'Offener Zugang ist liberal begrenzt durch Exklusivität, ordoliberale Regeln greifen die Sperre an; Keynes muss bei95% Restressourcen prüfen. Nachfrage allein löst keinen Vertrag. Eine ausdrückliche Maßnahmeentscheidung und genaue Kapazitätswirkung lasse ich offen.',
    '200+20=220 statt100, also120 zusätzlich. Entzug schwächt Anreiz, lässt ihn positiv. Privatpreise, Regeln und Risikoteilung sind Markt mit sozialem Schutz statt Mengenplanung. Finanzierung ist begrenzt; detaillierten Evidenzbedarf liefere ich nicht.'
]
add(0, 'order-fair-real-core-at-pass-boundary', order_min, [4, 5, 4, 5], ['All three real mechanisms/state roles, missing detailed comparison/cost interpretation', 'Real three-part institution contrast, alternative/actor detail missing', 'All three meaningful transferred views and access distinction, policy/limit detail missing', 'Correct income/institution core, funding/evidence evaluation incomplete'], expected=18)
no_views = [
    '14,10−13,20=0,90; 420000−180000=240000, nur die zwei Posten und kein voller Gewinn. Ich stelle keine drei Diagnose-/Wirkungsweg-/Staatsrollen gegenüber.',
    order_full[1],
    'Nachfrage allein hebt den Exklusivvertrag nicht auf; bei95% müssen Restressourcen geprüft werden. Regeln und soziale Sicherung bedingt sinnvoll, Umsetzung prüfen. Ich stelle auch in B keinerlei liberale, keynesianische und ordoliberale Diagnose oder Staatsrolle gegenüber.',
    order_full[3]
]
add(0, 'order-completely-missing-three-view-core-both-cases', no_views, [1, 8, 4, 7], ['Qualified calculation only; required three-way performance entirely absent', full_reason[1], 'Conditional decision and entry/capacity limits only; three views absent', full_reason[3]], 'Literal first17-cap: entire applied three-view diagnosis/mechanism/state comparison absent across both cases', expected=17)
no_order = [
    order_full[0],
    'Mindestlohn kann Beschäftigten Einkommen sichern, aber Firmenkosten, Nachfrage und Finanzierung sind offen; gezielte Transfers brauchen Mittel. Ich vergleiche keine Ordnung und erkläre kein Zusammenwirken von Privatpreisen, Wettbewerbsschutz und sozialer Institution.',
    order_full[2],
    'Verfügbar100→220, netto120. Entzug dämpft aber beseitigt nicht den Modellanreiz. Finanzierung und tatsächliche Beschäftigung/Inanspruchnahme prüfen. Ich gebe keinen Ordnungsvergleich und keine Verbindung von Marktkoordination, Wettbewerbsregeln und sozialer Absicherung.'
]
add(0, 'order-completely-missing-institution-order-core-both-cases', no_order, [7, 2, 8, 3], [full_reason[0], 'Conditional actor/alternative work only; institution/order core absent', full_reason[2], 'Income and conditional protection/incentive/finance evidence only; institution contrast absent'], 'Literal second17-cap: concrete decentralised-competition-social order connection absent overall', expected=17)
add(0, 'order-numbers-only-not-understanding', ['0,90;240000.', 'Keine Erklärung.', '95% und5%.', '100;220;120.'], [1, 0, 0, 1], ['Only stipulated figures', 'No mechanism or institution work', 'Only supplied capacity numbers', 'Only correct incentive calculation'], 'Both institution and applied three-view essentials absent', expected=2)

trade_full = [
    'A: Übergang2023–25; russischer Antrag12.05.2025, Mitteilung19.05, EU lehnt22.05 ab. Definitives EU-Regime01.01.2026 ist kein durch den Antrag ausgelöster Strafakt. Panelantrag10.07, Vertagung24.07, Einrichtung25.09.2026: keine Sachentscheidung, keine belegte Vergeltung. EU Klimabegründung und Russlands Rechtsvorwurf sind verschiedene Interessen/Behauptungen. B: April18-Lizenzpflicht; Oktobermaßnahmen/Sicherheitsbegründung;70 am07.11.2025 suspendiert genau sechs Oktoberakte bis10.11.2026. Der Bericht28.09.2026 nach20.–23.09-Gesprächen berichtet Verlängerung gemeinsamer Arrangements bis10.01.2027, keine Aufhebung aller Aprilpflichten. EU Plan03.12.2025 und Ratsmandat04.03.2026 reagieren durch Versorgung/Recycling; am Datum noch Verhandlung, kein endgültiges Gesetz. Lizenzzeiten/Unsicherheit beeinflussen Inputkosten/Absatz, Frachtraten oder Macht wirken zugleich; Zeitfolge beweist keine Monokausalität.',
    'A: Import35 und lokal71kg/Einheit, bei100 also3500/7100. Sauberer Import20×300=6000: pro Einheit geringer, gegenüber3500 insgesamt mehr, gegenüber7100 weniger bei ungleichen Mengen. B:22/51, bei1002200/5100; sauber12×300=3600 gegenüber2200mehr trotz halbierter Produktionsintensität. Wasser1800 gegenüber lokaler100er-Menge200m³: unterschiedliche Mengen, kein reines Qualitätsurteil. Gleiche Funktion, Zeitraum/Menge, Strommix, andere Schäden, Wasserstress und durchgesetzte Regeln prüfen. Transportdistanz allein und ausländischer Standort beweisen keine schlechtere Bilanz; hypothetische Mengenszenarien sind keine gemessene CBAM-Wirkung.',
    'A:50+10=60, weiter10unter70 bei voller Weitergabe. Zoll schützt möglicherweise Anbieter, belastet Verbraucher und Vorproduktfirmen;60erQuote kann Knappheit/Renten verschieben ohne Umweltgarantie. Emissionsbezug behandelt saubere Produktion anders, benötigt Messung/Regelkontrolle; offener Handel mit überprüften Standards/Anpassungshilfe trägt Finanzierungs-/Umsetzungskosten. B: Kontingent kann knappe Inputs weiter einschränken, Zweitlieferant mindert Abhängigkeit erst bei Lieferfähigkeit/Preis/Qualität. Anerkennung gleichwertiger Sicherheitsprüfungen spart doppelte Prüfung bei tatsächlicher Vergleichbarkeit, nicht bloß behaupteter Sicherheit; Inputfirmen/Verbraucher profitieren möglicherweise, heimische Anbieter verlieren Schutz, Kontrollkosten bleiben.',
    'A würde ich kontrollierte Emissionsbehandlung und finanzierte Anpassung gegenüber pauschaler Quote gewichten, nur bei zuverlässiger Messung, funktional gleicher Grundlage und Regeln. B lieber Diversifizierung/Recycling und belegte Prüfequivalenz, sofern Lieferzeit, Qualität und Umweltbilanz stimmen. Andere begründete Gewichte möglich. Beschäftigte/Hersteller, Verbraucher/Inputfirmen und Partner tragen andere Kosten. Nachfrage-/Umlenkungseffekt kann eine bessere Stückbilanz insgesamt verschlechtern. Panel und berichtete Aussetzung können Unsicherheit ändern, garantieren keine günstigen Inputs. Aktuellen konkreten Lizenzstand, Weitergabe und Mengen samt Wasser-/Regelkontrolldaten messen; Umweltziel und Sicherheitsbehauptung sind keine Erfolgsbeweise.'
]
trade_reason = ['Both dated actual conflict sequences/status, claims versus findings and nonmonocausal feedback', 'Both complete production/transport chains, scale, unequal quantity and ecological rule/system boundaries', 'At least two real instruments per case with correct price and affected groups/conditions', 'Conditional criteria/groups/environment/feedback/evidence judgement without predetermined political answer']
add(1, 'trade-full-dossier-and-open-emissions-priority', trade_full, [8, 7, 8, 7], trade_reason, expected=30)
trade_other = copy.deepcopy(trade_full)
trade_other[3] = 'A kann eine befristete Quote gerechtfertigt sein, falls eine belegte akute Anpassungs-/Versorgungssituation schwerer wiegt als Verbraucher-/Vorproduktkosten, aber60statt100 ist kein ökologischer Wirksamkeitsbeweis und muss kontrolliert/ausgelaufen werden. Verlässlicher emissionsbezogener Ausgleich/offene Anpassungshilfe wäre die Alternative mit Mess-/Finanzierungsbedarf. B priorisiere sichere Diversifizierung und gegebenenfalls begrenzte Vorräte statt sofortiger Anerkennung, solange wirkliche Sicherheit/Qualität nicht belegt sind; nach Nachweis kann Anerkennung Kosten reduzieren. Versorgung der Inputfirmen, heimische Produzenten, Beschäftigte, Verbraucher und Partner haben Zielkonflikte. Panel ist keine Sachentscheidung, Aussetzungsbericht keine Totalfreigabe. Nachfrage/Umlenkung verändert Gesamtemissionen trotz sauberem Stückwert. Aktuelle Lizenzen, Lieferzeit, Pass-through und vollständige Mengen/Wasser-/Kontrolldaten entscheiden; keine Garantie oder erfundene Vergeltung.'
add(1, 'trade-full-different-legitimate-protection-weights', trade_other, [8, 7, 8, 7], trade_reason, expected=30)
trade_partial = [
    'A definitives CBAM01.01.2026, Russland beantragte12.05.2025 Konsultationen, EU lehnte22.05 ab; Panel25.09.2026 noch kein Urteil. EU Klimaziel und Russlands Rechtsvorwurf unterscheiden. B Aprilpflichten,70 suspendiert bestimmte Oktoberakte; Bericht28.09 nennt gemeinsamen Zeitraum bis10.01.2027, nicht sämtliche Lizenzaufhebung. EU Ratsposition04.03 ist ein Mandat. Preise können auch wegen Frachten steigen; einige Zwischendaten bleiben aus.',
    'A35/71 bei1003500/7100; sauber20bei3006000: bessere Einheit, mehr als3500total. B22/51 bei1002200/5100; sauber12bei3003600mehr. Mengen sind ungleich; Wasserstress/Kontrolle offen. Ich rechne Wasser nicht vollständig und diskutiere andere Medien nur kurz.',
    'A Import60nachZoll, Abstand10. Zoll schützt Anbieter eventuell und belastet Inputkunden; Quote beschränkt Menge und kann Knappheit verschärfen. Emissionsbezug braucht Messung. B Quote versus Zweitlieferant/äquivalente Prüfung: abhängig von Preis, Liefertreue und echter Sicherheit; einzelne Gruppen-/Finanzierungsdetails fehlen.',
    'A bedingt überprüfbaren Ausgleich, B bedingt Lieferdiversifikation, weil Inputversorgung und kontrollierte Umweltwirkungen zählen. Mengenverschiebung kann den Stückvorteil aufheben. Panel/berichtete Aussetzung garantieren keine Normalisierung; Daten über Lizenzen, Menge und Wasser fehlen. Eine ausdrückliche weitere Gruppenabwägung und genauerer Rückkopplungsweg bleiben aus.'
]
add(1, 'trade-fair-incomplete-real-all-three-cores', trade_partial, [5, 5, 5, 4], ['Real two dated/status sequences and claims, intermediate detail incomplete', 'Real both full chains/scale, water/other media detail incomplete', 'Real alternative instruments/groups/conditions, detailed delivery/groups incomplete', 'Real conditional criteria and evidence, detailed group/feedback work incomplete'], expected=19)
trade_min = [
    'A Russland12.05.2025 Antrag, definitive EU Anwendung01.01.2026, Panel25.09.2026 kein Urteil. Klimaziel und Rechtsvorwurf sind nicht Wirkung und Entscheidung. B70aus2025 suspendiert nur bestimmte Oktoberakte, aktueller Ministeriumsbericht28.09.2026 nennt gemeinsamen Zeitraum bis10.01.2027, keine Totalaufhebung. Die EU Ratsposition ist nur Verhandlungsmandat; die übrige vollständige Folge und Rückkopplung lasse ich aus.',
    'A35/71bei1003500/7100, sauber20×3006000. B22/51bei1002200/5100, sauber12×3003600. Mehr Menge kann bessere Intensität aufheben, Mengen sind ungleich; Wasser-/Regelkontrolldaten fehlen. Vertiefte Verlagerungs-/Umweltmedienanalyse fehlt.',
    'A Zoll60, Abstand10, Verbraucher/Inputnutzer zahlen möglicherweise mehr; Quote kann Knappheit erzeugen. Offener kontrollierter Handel/Anpassungshilfe braucht Mittel. B Kontingent begrenzt schon knappe Menge, Zweitlieferant braucht tatsächliche Lieferung; wirklich gleichwertige Tests können Doppelaufwand mindern ohne Sicherheitsverzicht. Nicht alle Gruppen und Durchsetzungsdetails sind vollständig.',
    'A bedingt offenen emissionskontrollierten Handel statt Menge, B bedingt Diversifikation statt Knappheitsverstärkung. Hersteller-/Inputkundenziele konfligieren. Stückwert genügt bei größerer Menge nicht; aktuelle Lizenzen und Umweltkontrolle prüfen. Detaillierte Rückkopplung und alle Gruppen bleiben unvollständig.'
]
add(1, 'trade-fair-real-all-three-cores-at-pass-boundary', trade_min, [4, 4, 6, 4], ['Meaningful current two-case action/status/claim distinction, chronology/feedback details missing', 'Meaningful both complete chains/scale boundary, water/relocation detail missing', 'Both genuine alternatives/calculation/groups/conditions, some stakeholder/enforcement detail missing', 'Genuine conditional two-case decision/environment/evidence, incomplete feedback'], expected=18)
no_current = copy.deepcopy(trade_full)
no_current[0] = 'Ich nenne keinerlei wirklichen datierten politischen/rechtlichen Schritt, Reaktion oder Status in A/B. EU und China haben irgendwie andere Interessen; mehr wird nicht analysiert.'
no_current[3] = 'A bedingt überprüfbare Emissionsbehandlung zum Schutz von Klima und Inputkunden, B bedingt Diversifikation bei Preis/Qualität. Produzenten und Verbraucher haben Kostenkonflikte. Bessere Stückwerte können durch größere Mengen überkompensiert werden. Ich nenne keine aktuelle Konfliktfolge, Handlung, Reaktion oder Status; genaue Evidenzanforderungen lasse ich aus.'
add(1, 'trade-entire-current-dated-status-core-absent', no_current, [0, 7, 8, 4], ['Current real dated action/response/status wholly absent', trade_reason[1], trade_reason[2], 'Criterion/group judgments only, no actual status or concrete feedback/evidence detail'], 'Literal dated actual action/response/status17-cap across both cases', expected=17)
no_ecology = copy.deepcopy(trade_full)
no_ecology[1] = 'Ich gebe keine Produktions-/Transport-/Mengen-/Systemgrenzenrechnung oder ökologische Analyse. Näher ist automatisch besser, mehr Umweltinformation brauche ich nicht.'
no_ecology[3] = 'A bedingt Anpassung statt Quote wegen Inputkunden/heimischen Beschäftigten, B Diversifikation bei sicherer Lieferung. Panel bleibt kein Urteil und Aussetzung keine Totalfreigabe. Konkrete Lizenzen und Kostenweitergabe prüfen; ökologische Produktion, Transport, Mengen, Wasser, Kontrolle oder Systemgrenzen diskutiere ich nicht.'
add(1, 'trade-entire-ecological-chain-scale-boundary-core-absent', no_ecology, [8, 0, 8, 4], [trade_reason[0], 'Complete ecological performance absent/persistently wrong', trade_reason[2], 'Only real two conditional group choices; requested ecological feedback/evidence work absent'], 'Literal concrete production/transport/quantity/system-boundary17-cap', expected=17)
no_instruments = copy.deepcopy(trade_full)
no_instruments[2] = '50+10=60, Abstand10. Ich vergleiche in keinem Fall konkrete Optionen, ihre Gruppenwirkungen oder Bedingungen.'
no_instruments[3] = 'Panel ist kein Urteil,70keine Totalfreigabe. Nachfrage/Umlenkung kann Umweltmengen verändern und Wasser-/Kontrolldaten fehlen. Ich entscheide nicht zwischen Optionen, vergleiche keine Betroffenen und lege keine Instrumentenbedingungen vor.'
add(1, 'trade-entire-instrument-group-conditional-core-absent', no_instruments, [8, 7, 1, 3], [trade_reason[0], trade_reason[1], 'Correct price arithmetic only, no instrument/group performance', 'Environmental feedback and concrete evidence/status only, conditional option/group judgement absent'], 'Literal conditional instrument/group17-cap', expected=17)
wrong_status = copy.deepcopy(trade_full)
wrong_status[0] = 'CBAM ist imOktober2026nur angedacht und nie angewendet. Russlands Antrag ist ein rechtskräftiges WTO-Urteil;25.09war sichereVergeltung.70hebt alleAprilpflichten auf und gilt unverändert ohneweiterenBericht, EU Ratsmandat ist schonfertig geltendesRecht. Beide politischenBegründungenbeweisen Rechtmäßigkeit; allein dieseSchritte verursachenjeden Preis.'
wrong_status[3] = 'A bedingt kontrolliertes Emissionsinstrument wegen Klima/Inputkunden; B bedingt Diversifikation bei Lieferung/Preis für Produzenten und Verbraucher. Mengenverschiebung kann Stückgewinn überkompensieren. Qualität, Wasser, Kostenweitergabe nachweisen. Der sichere WTO-Schuldspruch und endgültige Totalfreigabe/gesetzliche Ratsänderung machen jede weitere Statusprüfung unnötig.'
add(1, 'trade-persistently-false-dated-legal-status-cannot-pass-on-other-work', wrong_status, [0, 7, 8, 6], ['Actual application/request/panel/notice/report/mandate consistently conflated or false', trade_reason[1], trade_reason[2], 'Real conditional group/environment/feedback work, false status loses evidence/status credit'], 'Literal persistently wrong actual current action/response/status17-cap', expected=17)
add(1, 'trade-numbers-only-not-understanding', ['2025;2026;2027.', '35;71;3500;7100;20;6000;22;51;2200;5100;12;3600.', '60;10.', 'Keine Abwägung.'], [0, 4, 1, 0], ['Copied dates are no status/action analysis', 'Correct main figures but no ecological scale/boundary interpretation', 'Correct price only', 'No criteria/groups/feedback/evidence analysis'], 'All three essential performances absent', expected=5)
assert len(works) == 16
work_ref = dump('actual-sixteen-own-whole-submissions64-manual-criterion-decisions-and-six-core-guards.json', {
    'wholeWorkCount': len(works), 'manualCriterionCount': 4 * len(works), 'works': works,
    'interpretation': 'Literal two separate order and three separate trade17-point essential-absence limits. Persistent incorrect status separately tested. Genuine incomplete work at18/19 remains PASS. These are scientific review counterworks, not learner-state evidence.'})

requests = json.loads((PRIMARY/'actual-independent-requests.json').read_text())
for key in ['wto-ds639', 'wto-notice', 'ec-cbam']:
    r = next(r for r in requests if r['key'] == key)
    assert r['status'] == 200 and sha(Path(r['originalCache'])) == r['sha256']
assert '25 September 2026' in (PRIMARY/'wto-ds639.parsed.txt').read_text()
assert '22 May 2025' in (PRIMARY/'wto-ds639.parsed.txt').read_text()
primary_ref = dump('actual-eight-independent-official-primary-readings-bounded-aids-and-truthful-access-history.json', {
    'authority': 'Independent machine curriculum scientific reading; no human or legal-release approval',
    'checkedAt': '2026-10-10',
    'fullOfficialTextsOutsideRepository': True,
    'sources': [
        {'key':'ec-cbam','url':next(r['url'] for r in requests if r['key']=='ec-cbam'),'reading':'Actual EU main body confirms transition2023–2025 and definitive regime from1January2026, including iron/steel. Embedded-emission pricing/carbon-leakage rationale is an objective, not measured success. Teaching tariff10 and total production/transport figures are explicitly fictional, not legal certificate bases.', 'access':'Fresh nativeWeb plus ownGET200; whole actual source body read'},
        {'key':'wto-ds639','url':next(r['url'] for r in requests if r['key']=='wto-ds639'),'reading':'Actual Secretariat summary: request12May2025, EU refusal22May2025, panel request10July2026, deferral24July, establishment25September. Claims and procedural steps are no merits decision or evidenced retaliation.', 'access':'NativeWeb402 preserved; separate ownGET200 actual complete dispute body read'},
        {'key':'wto-notice','url':next(r['url'] for r in requests if r['key']=='wto-notice'),'reading':'Actual initiation notice attributes legal allegations to Russia and explains consultation then potential panel process; allegation is not a compliance finding.', 'access':'NativeWeb402 preserved; separate ownGET200 actual notice read'},
        {'key':'mofcom18','url':next(r['url'] for r in requests if r['key']=='mofcom18'),'reading':'Actual dated4April2025 item list and concluding clauses require export licences for specified rare-earth items; issued-effective notice. Source expressly labels English a reference translation and Chinese authentic. It is distinct from the six October acts named in70.', 'access':'Fresh nativeWeb whole187-line body incl176–186 read; ownrequests DNS failure recorded'},
        {'key':'mofcom70','url':next(r['url'] for r in requests if r['key']=='mofcom70'),'reading':'Actual Chinese operative paragraph suspends55/56/57/58/61/62 from7November2025 until10November2026. Notice18 is not included; this is no proof of repeal of all April licensing.', 'access':'Fresh nativeWeb whole operative/date body read; ownrequests DNS failure recorded'},
        {'key':'mofcom28sep','url':next(r['url'] for r in requests if r['key']=='mofcom28sep'),'reading':'Actual Chinese ministry report28September2026 describes20–23September talks. SectionVIII reports agreed extension of joint arrangements until10January2027 with continuing discussions. Reported negotiated arrangements are distinguished from the text of70 and universal licence repeal.', 'access':'Fresh nativeWeb full ten-section report, especiallyVIII, independently read; ownrequests DNS failure recorded'},
        {'key':'mofcom12oct','url':next(r['url'] for r in requests if r['key']=='mofcom12oct'),'reading':'Official dated12October2025 remarks describe9October controls, licensing rather than total bans and security interests. This is the ministry position, no neutral proof of limited impacts or WTO legality. Independent official search result additionally confirms publication date.', 'access':'Fresh nativeWeb actual statement and separate official dated search body; ownrequests DNS failure recorded'},
        {'key':'council','url':next(r['url'] for r in requests if r['key']=='council'),'reading':'Actual4March2026 Council press release names3December2025 RESourceEU plan and negotiating mandate for CRMA amendments, supply diversification/recycling and next negotiations. Its dated mandate is not a claim that all subsequent legislation is finished.', 'access':'Fresh nativeWeb whole actual body read; ownGET403 recorded, not counted as original successfulHTML'}
    ],
    'ownRequestsStatusAndCacheBindings': requests,
    'ownNativeToolReturnBindings': [bind(PRIMARY/n) for n in ['mofcom-full-toolreturn.json','council-ec-full-toolreturn.json','mofcom-date-toolreturn.json']],
    'setupFailureBeforeRequests': 'First own requests-parser command exited1 because bs4 unavailable, before any requests/results. Corrected to standard-library HTMLParser, then actual8parallel requests completed. No source-success claim from failed command.'
})

decisions_ref = dump('actual-two-individual-five-whole-contract-P10-scientific-followup-KEEP.json', {
    'status': 'KEEP', 'authority': 'Independent machine scientific material review only',
    'originalWholeREVISE': bind(OLD),
    'individuallyReviewed': [
        {'materialId':bodies[0]['id'],'decision':'KEEP','coveredGoalIds':bodies[0]['examData']['coveredGoalIds'],
         'performance':'Two distinct economic situations explicitly compare all three supplied liberal/Keynesian/ordoliberal diagnoses, adjustment mechanisms, state roles and limits. Demand loss versus largely utilised capacity/private barriers prevents one-school labels replacing causal comparison. Both actual market institutions combine decentralised prices, competition rules and social protection against unprotected market and central quantity planning. Transfer/incentive/finance conflict is real; public rules are not planning, protection goals not effects.',
         'PBindings':{'1da809f7':'A actual competition/social-insurance/decentralised coordination, B entry rules plus benefit withdrawal/funding and order distinction', 'f43676a2':'Same-case all-three causal/state comparison in A and independent transfer to B, alternatives/complementarity and limits'},
         'findingResolution':'Original minimum-wage-only30/30 work lacks required performance in this new body. Own whole omissions score20raw→17 separately for the three-view and institutional-order essentials; own real partial18/24 and alternate policy30 remain PASS. No perfection or fixed policy criterion.'},
        {'materialId':bodies[1]['id'],'decision':'KEEP','coveredGoalIds':bodies[1]['examData']['coveredGoalIds'],
         'performance':'Two actual dated official conflict dossiers distinguish operative CBAM, requests/panel, specific licensing/suspension and reported arrangements from final legal findings, total repeal and causal certainty. Fictional full production/transport/scale/water boundaries and unequal quantities are explicitly reasoned in both cases. Two or more trade options per case are compared through groups, mechanisms, true equivalence and conditions; criterion judgments admit defensible protection or openness weights.',
         'PBindings':{'604cde3e':'A tariff/quantity/emissions/open-adjustment alternatives, B quota/diversification/genuinely equivalent test recognition with consumers/input firms/industry and cost conditions', '54049ed4':'A actual consultation/refusal/panel status and B controls/notice/report/European negotiating sequence plus interests/input-cost/freight competing causes', '4cd0c6d8':'Both complete production+transport chains and per-unit/total distinction; larger-volume scenarios, water/media/verified rules and nonautomatic displacement impacts'},
         'findingResolution':'Original undated generic protection discussion is not accepted as current dated analysis or environmental whole understanding. Own actual chronological-core absence19→17, environmental-core absence20→17, instrument-core absence19→17, persistently false legal status21→17. Fair core work18/19 and opposite defensible policy30 pass.'}
    ],
    'actualReview': {'wholeDEENMaterials':2,'wholeCurrentGoalContracts':5,'wholeOriginalPRecords':5,'actualPCaseCount':10,'ownFractionChecks':len(checks),'ownWholeWorks':len(works),'manualCriterionDecisions':4*len(works)},
    'scientificCorrectionsAuthoredByReviewer':0,'candidateScienceQualified':2,'newStrictGoalClosures':0,'restoredRouteBindings':0,
    'notClaimed':['active integration','new source coverage','new country or course applicability','complete native Scope/CQR104 approval','positive-evidence human approval','M4/M6/M7','human review/release/classroom trial'],
    'remaining':'Both are DRAFT until separate foreign-qualified machine release/status binding. Current source/country/course/full-closure/view, semantic/P fingerprints and central floors remain Root integration checks.'
})

evidence = [input_ref, calc_ref, work_ref, primary_ref, decisions_ref]
manifest_ref = dump('actual-two-real-legacy-five-contracts-independent-b.portable-freeze.manifest.json', {
    'inputs':[bind(BODY),bind(CONTRACT),bind(HANDOFF),bind(OLD),bind(CAN),bind(CFG)],
    'evidence':evidence,
    'historicalAuthorAndOriginalReviewUnmodified':True,
    'noActiveWrites':True,
    'artifactRole':'Additive independent scientific followup, own whole manuscripts and calculations; no native/currentScope claim from authorprobes'
})
receipt = dump('actual-final-two-real-legacy-order-trade-whole-science-independent-b-KEEP.handoff.receipt.json', {
    'status':'KEEP','authority':'Independent machine material science; separate human gates pending',
    'wholeReviewedCandidate':bind(BODY), 'authorHandoff':bind(HANDOFF), 'currentFiveGoalP10':bind(CONTRACT),
    'originalREVISEUnchanged':bind(OLD), 'evidence':evidence, 'manifest':manifest_ref,
    'materialIds':[b['id'] for b in bodies], 'scientificallyQualifiedWholeMaterials':2,
    'actualOwnFractionChecks':len(checks),'actualOwnWholeWorks':len(works),'actualManualCriterionDecisions':4*len(works),
    'actualCurrentFiveWholeGoalsAndProfileContentsExact':True,
    'all522OtherCurrentGoalsExactInInertAuthorCandidate':True,
    'DEENParity':'Actual whole paired tasks/solutions/rubrics read; current outer legacy titleEn/descriptionEn unchanged, no unsolicited style edit',
    'newStrictGoalClosures':0,'newSourceClaims':0,'restoredRouteBindings':0,
    'scopeStatusSemanticPBooksCentralReleaseGatesRemainSeparate':True,
    'next':'Root may bind a machine-only status successor; an independent current full-closure/country/course/view review and final protected-floor central integration remain required.'
})
print(json.dumps({'receipt':receipt,'checks':len(checks),'wholeWorks':len(works),'manualMarks':4*len(works),'status':'KEEP'},ensure_ascii=False))
