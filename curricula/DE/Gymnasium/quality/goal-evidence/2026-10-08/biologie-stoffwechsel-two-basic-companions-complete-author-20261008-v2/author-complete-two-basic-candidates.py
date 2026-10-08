#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Actual authored supplementary packet. No active or frozen input writes."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).resolve().parent
OLD = OWN.parent / 'biologie-stoffwechsel-two-basic-companions-author-20261008-v1'
SCOPE = OWN.parent / 'biologie-stoffwechsel-first-three-operative-scope-author-20261008-v1'
NATIVE3 = OWN.parent / 'biologie-stoffwechsel-first-three-native-technical-20261008-v1'
IDS = ['0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1']
PARENT = '860c80f9-e463-598b-8ef8-79f65c12f235'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def put(name, data):
    path = OWN / name
    assert not path.exists(), str(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return bind(path)

goals = read(OLD / 'goals/two-whole-DEEN-goal-templates.ai-candidate.json')['goalTemplates']
axes = read(OLD / 'positive/two-understanding-profile-author-inputs.pending-native-v2.json')['rows']
cases = read(OLD / 'cases/four-complete-DEEN-material-task-model-scoring-fresh-transfer.author.json')['cases']
assert [g['id'] for g in goals] == IDS and len(cases) == 4
profiles = []
for row in axes:
    goal_id = row['goalId']
    selected_cases = [c for c in cases if c['goalId'] == goal_id]
    assert len(selected_cases) == 2
    prefix = 'basic-respiration' if goal_id == IDS[0] else 'basic-photo-coupling'
    # These are positive expectations for the actual author cases. They are
    # not learner observations, performed experiments, or independent verdicts.
    performances = ([
        ('Stelle die Stoffumwandlung als Wortgleichung mit richtigen Edukten und Produkten dar und erkläre am Muskel- oder Samenmodell den Stoffumsatz.', 'Represent conversion using a word equation with correct reactants and products and explain it in the muscle or seed model.'),
        ('Erkläre am Modell nutzbare chemische Energie und Wärme kausal und widerlege Energieerschaffung aus Sauerstoff.', 'Explain usable chemical energy and heat causally in the model and refute energy creation from oxygen.'),
        ('Unterscheide Zellatmung und Lungenventilation; erkläre Pflanzenatmung im Licht und Dunkeln und bearbeite die frische Stoff-/Energievariation.', 'Distinguish cell respiration and lung ventilation; explain plant respiration in light and darkness and answer the fresh material/energy variation.')
    ] if goal_id == IDS[0] else [
        ('Erkläre anhand des vorgegebenen Modells die Überführung von Lichtenergie und die Versorgung des Stoffaufbaus durch die lichtabhängige Reaktion.', 'Explain conversion of light energy and the supply to synthesis by light-dependent reactions using the supplied model.'),
        ('Verknüpfe das benötigte Kohlenstoffdioxid und die chemischen Mittel kausal; prüfe, warum mehr Licht fehlenden Kohlenstoff nicht ersetzt.', 'Causally connect required carbon dioxide and chemical resources; evaluate why more light does not replace missing carbon.'),
        ('Erkläre die kurze Modell-Nachwirkung eines Vorrats und widerlege ausschließlich nachts und unbegrenzte Unabhängigkeit; beantworte die frische Variation.', 'Explain the brief model effect of a reserve and refute exclusively nocturnal or unlimited independence; answer the fresh variation.')
    ])
    expectations = []
    for i, (de, en) in enumerate(performances):
        expectations.append({'id': f'{prefix}-understanding-{i+1}', 'essentialUnderstandingDe': row['requiredUnderstandingDe'][i], 'essentialUnderstandingEn': row['requiredUnderstandingEn'][i], 'observablePerformanceDe': de, 'observablePerformanceEn': en})
    briefs = []
    for c in selected_cases:
        briefs.append({'id': c['caseId'],
            'taskDemandDe': c['material']['textDe'] + ' ' + c['task']['textDe'] + ' Frischer getrennt zu beantwortender Transfer im Autorenmodell: ' + c['freshTransfer']['textDe'],
            'taskDemandEn': c['material']['textEn'] + ' ' + c['task']['textEn'] + ' Fresh separately answered transfer in the author model: ' + c['freshTransfer']['textEn'],
            'expectedPerformanceDe': c['modelResponse']['textDe'] + ' Transfer: ' + c['freshTransfer']['modelAnswerDe'],
            'expectedPerformanceEn': c['modelResponse']['textEn'] + ' Transfer: ' + c['freshTransfer']['modelAnswerEn'],
            'understandingFocusDe': ' '.join(row['requiredUnderstandingDe']),
            'understandingFocusEn': ' '.join(row['requiredUnderstandingEn'])})
    profiles.append({'goalId': goal_id, 'profile': {'archetype': 'concept', 'expectations': expectations,
        'coverageExpectations': {'requiredExpectationIds': [x['id'] for x in expectations], 'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 2, 'freshVariationRequired': True, 'independentTransferRequired': True},
        'variationAxes': [{'id': prefix + '-actual-author-context', 'textDe': selected_cases[0]['material']['textDe'] + ' Gegenkontext: ' + selected_cases[1]['material']['textDe'], 'textEn': selected_cases[0]['material']['textEn'] + ' Contrasting context: ' + selected_cases[1]['material']['textEn']}],
        'applicationCaseBriefs': briefs}})
put('positive/two-whole-positive-understanding-profile-bodies.author.json', {'schemaVersion': 1, 'goals': profiles, 'wholeCasesPath': bind(OLD / 'cases/four-complete-DEEN-material-task-model-scoring-fresh-transfer.author.json'), 'actualAuthorProfiles': 2, 'wholeCases': cases, 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'independentReviewsPending': True, 'actualLearnerPerformance': False, 'performedExperiments': False})

atlas = read(SCOPE / 'candidate/ordinary-current392-source-atlas.inputs.json')
source_duties = read(SCOPE / 'input/twenty-current-whole-source-duties-and-decisions.exact.json')['rows']
partners = read(SCOPE / 'input/all268-current-whole-partner-bodies-after19.exact.json')['rows']
assert len(source_duties) == 20 and len(partners) == 268
source_roles = read(OLD / 'sources/actual-full-primary-pages-and-bounded-source-roles.author.json')
basic_resp_ordinals = [r['sourceOrdinal'] for r in source_roles['basisRespirationSourceRoles']]
assert basic_resp_ordinals == [1, 2, 3, 4, 11, 13, 14, 15, 17, 18, 19, 20]
selected = {r['wholeSourceDuty']['id']: r for r in source_duties if r['sourceOrdinal'] in basic_resp_ordinals}
paths = []
mapping_diffs = []
checks = []
for number, original_path in enumerate(atlas['mappingPaths'], 1):
    original = read(ROOT / original_path)
    after = copy.deepcopy(original)
    changed = []
    additions = []
    for decision in after['decisions']:
        source_id = decision['sourceGoalId']
        if source_id not in selected:
            continue
        row = selected[source_id]
        added = [IDS[0]] + ([IDS[1]] if row['sourceOrdinal'] == 15 else [])
        assert not set(added).intersection(decision['canonicalGoalIds'])
        before = copy.deepcopy(decision)
        decision['canonicalGoalIds'] += added
        role = ('Die echte regionale Teilpflicht nennt Grundprinzip/Bedeutung/stofflichen Umsatz und nutzbare Energie der Zellatmung. Das neue begrenzte Basisziel verwendet eine Wortgleichung als Darstellung desselben Stoff-/Energiezusammenhangs; dies behauptet keine wörtliche Wortgleichungspflicht in Quellen, die nur ein Prinzip nennen. Es ist kein Ersatz für Bruttogleichungen oder praktische CO2-/Wärmenachweise und keine molekulare Drei-Stufen-Pflicht.')
        if row['sourceOrdinal'] == 15:
            role += ' Die sächsische Klasse9 nennt zusätzlich ausdrücklich die Wechselwirkung der lichtabhängigen und lichtunabhängigen Reaktion. Dafür ist das separate einfache Kopplungsziel passend; die ganze SN-Pflicht enthält weiterhin Bruttogleichung, Bedingungen und echte CO2-/Wärmeexperimente.'
        decision['rationale'] += '\n\nZusätzlicher isolierter Basis2-Autorenkandidat 2026-10-08, aktuelle unabhängige Quellenprüfung ausstehend: ' + role + ' Alle alten tatsächlichen Partner und die ganze amtliche Pflicht bleiben erhalten; keine Whole-Duty-Freigabe.'
        decision['reviewedAt'] = '2026-10-08'
        decision['reviewer'] = 'Codex author candidate; two independent source and current native reviews pending'
        changed.append(source_id)
        for goal_id in added:
            additions.append({'legacyGoalId': source_id, 'canonicalGoalId': goal_id, 'matchType': 'partial', 'reviewDecisionId': f'bio-basic2-author-20261008-{row["sourceOrdinal"]:02d}-{goal_id}'})
        mapping_diffs.append({'sourceOrdinal': row['sourceOrdinal'], 'wholeOriginalDuty': row['wholeSourceDuty'], 'wholeBeforeDecisionAfterScope3': before, 'wholeAfterDecisionWithBasic2': copy.deepcopy(decision), 'newOrdinaryTargetIds': added, 'boundedContributionDe': role, 'originalWholeDutyClosed': False, 'reviewAuthority': 'ai_candidate', 'independentSourceReview': 'PENDING'})
    after['mappings'] += additions
    if changed:
        result = put(f'candidate/mappings/{number:02d}-{Path(original_path).name}', after)
        paths.append(result['path'])
        assert {k: v for k, v in after.items() if k not in ['mappings', 'decisions']} == {k: v for k, v in original.items() if k not in ['mappings', 'decisions']}
        assert [d for d in after['decisions'] if d['sourceGoalId'] not in changed] == [d for d in original['decisions'] if d['sourceGoalId'] not in changed]
        assert after['mappings'][:len(original['mappings'])] == original['mappings']
        for d in after['decisions']:
            if d['sourceGoalId'] in changed:
                assert sorted(d['canonicalGoalIds']) == sorted(m['canonicalGoalId'] for m in after['mappings'] if m['legacyGoalId'] == d['sourceGoalId'])
        checks.append({'before': bind(ROOT / original_path), 'after': result, 'changedWholeDecisions': len(changed), 'newEdges': len(additions), 'allOtherWholeDecisionsExact': True, 'allExistingPartnerRowsExact': True, 'allOtherTopLevelValuesExact': True})
    else:
        paths.append(original_path)
        checks.append({'before': bind(ROOT / original_path), 'unchangedFileReusedExactly': True})
assert len(mapping_diffs) == 12 and sum(len(d['newOrdinaryTargetIds']) for d in mapping_diffs) == 13
put('candidate/ordinary-basic2-after-scope3-source-atlas.inputs.json', {**atlas, 'mappingPaths': paths})
put('sources/actual-twelve-duty-thirteen-new-ordinary-edges.author.diff.json', {'schemaVersion': 1, 'rows': mapping_diffs, 'wholeOriginalDuties': source_duties, 'all268WholeOriginalPartnerBodies': partners, 'mappingChecks': checks, 'old20FalseEdgesRemainRemoved': True, 'HEFull3Unchanged': True, 'fourOperatorHoldsExactKeep': bind(SCOPE / 'candidate/four-original-operator-HOLDs.exact-KEEP.json'), 'actualFullPrimaryRoleInputs': bind(OLD / 'sources/actual-full-primary-pages-and-bounded-source-roles.author.json'), 'newWholeDutyApprovals': 0, 'activeWrites': 0})

# This placement is reviewed here as an author decision. Independent decisions
# and target-scope/source review stay pending; nothing is promoted to M7.
put('atomicity-memory/actual-two-author-atomicity-memory-and-placement.rationale.json', {'schemaVersion': 1, 'role': 'Actual substantive author decisions; not independent review or M7 completion',
    'rows': [
        {'goalId': IDS[0], 'semanticAtomic': True, 'semanticKind': 'curricularAtomic', 'atomicityReasonDe': 'Eine atomare Achse erklärt den Stoff-/Energiezusammenhang der aeroben Zellatmung. Wortgleichung, nutzbare chemische Energie, Arbeit/Wärme und Pflanzen-/Ventilations-Gegenkontext sind Darstellung und kausale Anwendung derselben Achse. Keine molekularen Drei-Stufen-Erklärungen, Bruttogleichungsrechnung oder praktische Versuchsplanung werden als mitabgeschlossen behauptet.', 'memoryDecision': 'no_memory_needed', 'memoryUseful': False, 'memoryReasonDe': 'Die Kompetenz verlangt die kausale Verknüpfung und den frischen Transfer am bereitgestellten Modell. Die vier Stoffnamen werden im Material und im Bild angeboten; ein eigenes Abrufdeck würde diese Erklärkompetenz nicht nachweisen. Zwei ganze Modelle plus getrennte frische Variationen tragen die Autoren-P-Erwartungen; keine isolierte Benennungs- oder Kartenpflicht wurde in den Originalrollen identifiziert.'},
        {'goalId': IDS[1], 'semanticAtomic': True, 'semanticKind': 'curricularAtomic', 'atomicityReasonDe': 'Eine atomare Achse erklärt die funktionale Kopplung der zwei Reaktionsgruppen im vereinfachten Modell. Die Nacht-Fehlvorstellung, Vorratsgrenze und fehlender Kohlenstoff sind direkte Gegenfälle derselben Abhängigkeit. Keine vollständigen Calvin-Phasen, ATP/NADPH-Abrufliste, Z-Schema oder eigenständigen Experimente.', 'memoryDecision': 'no_memory_needed', 'memoryUseful': False, 'memoryReasonDe': 'Die beiden Funktionsnamen und Ressourcen werden im Modell bereitgestellt. Kausales Erklären, Dunkel-Vorratsgrenze und unabhängiger Kohlenstofftransfer prüfen Verständnis; ein eigenes Namen-/Enzymdeck ist dafür fachlich nicht erforderlich.'}
    ],
    'placement': {'parentGoalId': PARENT, 'parentTitle': 'Fotosynthese und Zellatmung (Sek I)', 'appendTwoContainsChildren': IDS, 'weightBefore': 5, 'weightAfter': 7, 'rationaleDe': 'Beide Grundlagenkompetenzen gehören zum bestehenden Sek-I-Stoff-/Energiecluster. Seine fünf alten Kinder bleiben exakt und in derselben Reihenfolge; die zwei neuen Atome werden angehängt. Die vorhandene Zell-Grundlagenvoraussetzung des Clusters bleibt erhalten. Nur das Kopplungsziel benötigt zusätzlich das existierende Fotosynthese-Wortmodell. Kein bestehendes Ziel erhält eine neue requires-Kante, keine Schwerpunkt-/Kurssemantik wird aus dem Thema geraten.'},
    'structuralKindAuthorityInInactiveShadowOnly': 'Normal authoritative structural classification based on actual author semantic examination; closed decisionBasis reviewed-current-pilot-curricular-atomic is not an independent A/D/P/M/V approval. Independent A/B are pending.',
    'newMemoryGoalIds': [], 'newDecks': [], 'newCards': [], 'existing392MemoryRecordsAndCardBytesKeep': True, 'existingVisibilityScopeConfigKeep': True, 'actualDagAndWholePageContextChecks': 'PENDING technical materialization in this packet', 'independentAMReview': 'PENDING', 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0})
put('checks/upstream-immutable-input-bindings.author.json', {'schemaVersion': 1, 'bindings': [bind(OLD / 'neutral-two-real-basic-companions.author.entry.json'), bind(OLD / 'two-real-basic-companions.author.first-binding.freeze.json'), bind(SCOPE / 'neutral-three-current-operative-source-scope.author.entry.json'), bind(SCOPE / 'three-current-operative-source-scope.author.first-binding.freeze.json'), bind(NATIVE3 / 'neutral-current-first-three-native.technical.entry.json'), bind(NATIVE3 / 'native-three.first-materialization.freeze.json')], 'newIndependentApproval': False, 'activeWrites': 0})
print(json.dumps({'wholeAuthorProfiles': 2, 'wholeOriginalCasesRetained': 4, 'newMappedEdges': 13, 'selectedSourceDuties': 12, 'wholeOriginalDuties': 20, 'wholeOriginalPartnersRetained': 268, 'independentReviewStatus': 'PENDING', 'activeWrites': 0}))
