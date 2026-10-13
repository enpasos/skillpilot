#!/usr/bin/env python3
# Apache-2.0. Conditional source proposals only; no operative writes.
import copy, json
from collections import Counter
from pathlib import Path
own = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-residual-source-duty-author-20261013-v3')
assert not (own / 'FINAL.finite-residual-source-duty-author.freeze.json').exists(), 'Immutable sealed author root; use a new root.'
p = own / 'candidate/three-conditional-full-source-decision-and-mapping-CAS.author.json'
d = json.loads(p.read_text())
v2 = json.loads(Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-source-and-view-remediation-author-20261013-v2/source-component-five-cell-and-three-mapping-CAS.author.json').read_text())
for row in d['conditionalSourceDecisionCAS']:
    after = row['conditionalProposedWholeDecisionCell']
    after['decision'] = 'mapped'
    after['rationale'] = 'Inaktiver V3-Autorvorschlag: bestehende Partner erhalten; eigenständige Klassifikationsoperation ergänzt. Diese bedingte whole-cell-Zuordnung gilt erst nach unabhängiger Fachprüfung und tatsächlicher gewählter Programm-/Quellenregistrierung. Keine allgemeine Landes-/Kursfreigabe und kein Vollständigkeitspass.'
    row['historicalReviewFieldsApplyOnlyToOriginalPartners'] = 'reviewedAt/reviewer are carried as exact historical metadata of the old decision and do not review or approve the new V3 target edge. Independent review of the full proposed cell remains pending.'
    row['conditionalMappedStatusNonoperative'] = 'The conditional proposed whole cell uses mapped for a structurally coherent future registration; it is not written to the operative mapping or compiler.'
measurement = []
for path in sorted({r['expectedWholeMappingBaseBinding']['path'] for r in d['conditionalSourceDecisionCAS']}):
    f = next(f for f in v2['wholeMappingGuardsAndCellCAS'] if f['expectedWholeMappingBinding']['path'] == path)
    full = json.loads(Path(path).read_text())
    for cell in f['decisionCellCompareAndSwap']:
        i = int(cell['jsonPointer'].split('/')[-1])
        assert full['decisions'][i] == cell['expectedBeforeWholeCell']
        full['decisions'][i] = cell['proposedAfterWholeCell']
    before = {'sourceDecisionRows': len(full['decisions']), 'distinctSourceGoalIdsInDecisions': len({r['sourceGoalId'] for r in full['decisions']}), 'decisionStatusRowCounts': dict(sorted(Counter(r['decision'] for r in full['decisions']).items())), 'rawDecisionTargetEdges': sum(len(r['canonicalGoalIds']) for r in full['decisions'])}
    for k, value in f['namedMeasuredCountUnits']['afterProposed'].items():
        if k.startswith('compatibility'):
            before[k] = value
    after = copy.deepcopy(before)
    for row in [r for r in d['conditionalSourceDecisionCAS'] if r['expectedWholeMappingBaseBinding']['path'] == path]:
        old = row['expectedAfterV2WholeDecisionCell']['decision']
        if old != 'mapped':
            after['decisionStatusRowCounts'][old] -= 1
            after['decisionStatusRowCounts']['mapped'] += 1
        after['rawDecisionTargetEdges'] += 1
        after['compatibilityMappingEdgeRows'] += 1
        after['compatibilityMapping' + row['conditionalCompatibilityMappingAddition']['matchType'].title() + 'EdgeRows'] += 1
    assert sum(before['decisionStatusRowCounts'].values()) == before['sourceDecisionRows']
    assert sum(after['decisionStatusRowCounts'].values()) == after['sourceDecisionRows']
    measurement.append({'expectedWholeMappingBaseBinding': f['expectedWholeMappingBinding'], 'afterReviewedV2NamedCountUnits': before, 'conditionalV3NamedCountUnitsIfActualSelectionRegistrationResolved': after, 'summaryObjectPresent': 'summary' in full, 'noSummaryFieldInvented': True, 'operativeApplication': False})
d['namedConditionalCountUnitsAndWholeMappingGuards'] = measurement
d['wholeConditionalReviewAndActualSelectionRemainHOLD'] = True
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'conditionalWholeCellsClarified': len(d['conditionalSourceDecisionCAS']), 'wholeMappingCountGuards': len(measurement), 'noOperativeWrites': True}))
