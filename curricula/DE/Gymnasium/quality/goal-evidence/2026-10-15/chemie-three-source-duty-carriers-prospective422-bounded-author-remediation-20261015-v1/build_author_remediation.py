# SPDX-License-Identifier: Apache-2.0
"""Bounded author successor. Writes only this new, inactive author directory."""
import copy
import hashlib
import json
import subprocess
from fractions import Fraction
from pathlib import Path

import jsonschema

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
E14 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14'
BASE = E14 / 'chemie-four-source-duties-explicit-compulsory-domain-carriers-author-20261014-v3'
SEL = E14 / 'chemie-source-three-goals-materials-and-images-review-selector-root-20261014-v1'
CURRENT = E14 / 'chemie-acid7-two-description-one-image-current419-native-successor-technical-20261014-v3/candidate/canonical551.current419.three-author-deltas.exact.json'
PRIOR = SEL / 'candidate/canonical554.prospective422.three-source-goals-plus-current-acid-deltas.inactive.json'
PRIOR_THREE = SEL / 'candidate/three-whole-prospective-goals.with-three-image-candidates.json'
MATERIAL = BASE / 'materials/eleven-complete-cases.v3.bound.author.json'
PROFILES = BASE / 'candidate/author-profiles.three.raw.json'
REPORT = E14 / 'chemie-NAT9-current419-isolated-integration-technical-20261014-v1/receipts/ACTUAL.current419-NAT9-D2-D5-final.central.stock-report.json'
A = OWN.parent / 'chemie-three-source-duty-carriers-prospective422-fresh-independent-a-20261015-v1'
G40 = '40f2db27-0ebe-5f03-941d-708aebcc64b7'
G93 = '93a7ce4d-1c90-568c-9368-cac423011ef9'
GDYE = 'd815960a-21ab-5a42-8b23-ecd20d03db19'
OLD_REQ = '7a05a1ce-45d3-571e-be51-afcd8dfd33ca'
NEW_REQ = '8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566'
PURE = '42a84bca-d27e-581f-a43a-eee424f0504d'
LAB = '416dfd33-8b43-5c49-903c-9847b95e4208'
SAFETY = '13d4f336-ab16-54a7-9479-c920b458f385'
CLUSTER = '266a2b2a-9ee2-52f6-ae09-59343da9a60b'


def load(p):
    return json.loads(p.read_text())


def sha(b):
    return 'sha256:' + hashlib.sha256(b).hexdigest()


def objsha(x):
    return sha(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def ref(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p.read_bytes()), 'bytes': p.stat().st_size}


def write(name, x):
    p = OWN / name
    assert not (OWN / 'FILES.finite-own-artifacts.seal.json').exists(), 'Sealed packet is immutable'
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')


def differences(a, b, path=''):
    if a == b:
        return []
    if isinstance(a, dict) and isinstance(b, dict):
        return [q for k in sorted(a.keys() | b.keys())
                for q in differences(a.get(k), b.get(k), path + '/' + k)]
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        return [q for i, (v, w) in enumerate(zip(a, b)) for q in differences(v, w, path + '/' + str(i))]
    return [{'jsonPointer': path, 'before': a, 'after': b}]


def affected(old, new, completed):
    changed = {k for k in old.keys() | new.keys() if old.get(k) != new.get(k)}
    rows = []
    for gid in completed:
        neighbors = set()
        for graph in (old, new):
            g = graph.get(gid, {})
            neighbors.update(g.get('requires', []) + g.get('contains', []))
            neighbors.update(g['id'] for g in graph.values()
                             if gid in g.get('requires', []) + g.get('contains', []))
        hits = sorted(neighbors & changed)
        if old.get(gid) != new.get(gid) or hits:
            rows.append({'goalId': gid, 'ownBodyChanged': old.get(gid) != new.get(gid),
                         'changedDirectNeighborBodies': hits})
    return rows


def main():
    assert ROOT.joinpath('AGENTS.md').exists()
    tiny = {'a': {'id': 'a', 'requires': [], 'contains': []}}
    linked = {**tiny, 'b': {'id': 'b', 'requires': ['a'], 'contains': []}}
    unlinked = {**tiny, 'b': {'id': 'b', 'requires': [], 'contains': []}}
    assert affected(tiny, linked, ['a'])[0]['changedDirectNeighborBodies'] == ['b']
    assert affected(linked, tiny, ['a'])[0]['changedDirectNeighborBodies'] == ['b']
    assert affected(tiny, unlinked, ['a']) == [] and affected(tiny, tiny, ['a']) == []
    assert sha(CURRENT.read_bytes()) == 'sha256:b07e023f03a7c573e2b823c491e030c0ca1b5d530b17116de2b4a3d8010d0339'
    assert sha(PRIOR.read_bytes()) == 'sha256:f47727adf9ff315ab272cc0e26232c7433201267f57c04c5b59058731328a265'
    old3 = load(PRIOR_THREE)
    goals = copy.deepcopy(old3)
    by3 = {g['id']: g for g in goals}
    assert by3[G93]['requires'] == [PURE, OLD_REQ]
    by3[G93]['requires'] = [PURE, NEW_REQ]
    assert differences(old3, goals) == [{'jsonPointer': '/1/requires/1', 'before': OLD_REQ, 'after': NEW_REQ}]
    write('candidate/three-whole-goals.bounded-author.json', goals)
    new_goal_path = OWN / 'candidate/three-whole-goals.bounded-author.json'

    old_material = load(MATERIAL)
    cases = copy.deepcopy(old_material['cases'])
    bycase = {c['id']: c for c in cases}
    i1, i2, i3 = [bycase[k] for k in ['HB-I1', 'HB-I2', 'HB-I3']]
    i1['materialDe'] += ' Alle genannten Grammwerte bilanzieren ausschließlich die gelösten Stoffe N und Z. Massen der Lösungsmittel sind nicht gegeben. Ein N-Massenanteil wird hier nur auf die Summe N+Z bezogen; die Reinheit oder Zusammensetzung der gesamten Flüssigphase ist damit nicht bestimmt.'
    i1['materialEn'] += ' Every stated gram value balances only the dissolved substances N and Z. Solvent masses are not supplied. An N mass fraction here refers only to the sum N+Z; it does not determine the purity or composition of the whole liquid phase.'
    i1['taskDemandDe'] = i1['taskDemandDe'].replace('Beurteile Reinheit, Ausbeutegrenze', 'Beurteile den N-Massenanteil innerhalb der bilanzierten gelösten Stoffe N+Z (nicht der gesamten Flüssigphase), die Rückgewinnungsgrenze')
    i1['taskDemandEn'] = i1['taskDemandEn'].replace('Assess purity, recovery', 'Assess the N mass fraction within the balanced dissolved substances N+Z (not the whole liquid phase), recovery')
    i1['modelAnswerDe'] = i1['modelAnswerDe'].replace('Die angereicherte Fraktion enthält90%N und gewinnt90%des ursprünglich enthaltenen N zurück; das ist weder völlige Reinheit noch quantitative Rückgewinnung.', 'In O beträgt der N-Massenanteil innerhalb der bilanzierten gelösten Stoffe 0.18/(0.18+0.02)=90 % (anfangs 0.20/(0.20+0.10)≈66.7 %). Die N-Rückgewinnung beträgt dagegen 0.18/0.20=90 %. Die Nenner sind verschieden; ohne Lösungsmittelmassen folgt keine Reinheit der gesamten Flüssigphase. Auch die bilanzierten gelösten Stoffe sind kein reines N, und nicht alles N wird in O zurückgewonnen.')
    i1['modelAnswerEn'] = i1['modelAnswerEn'].replace('The enriched fraction is90%N and recovers90%of initial N, not complete purity or quantitative recovery.', 'In O, the N mass fraction within the balanced dissolved substances is 0.18/(0.18+0.02)=90% (initially 0.20/(0.20+0.10)≈66.7%). N recovery instead is 0.18/0.20=90%. The denominators differ; without solvent masses no whole-liquid-phase purity follows. Even the balanced solutes are not pure N, and O does not recover all N.')
    i1['rubric'][2]['fullCreditDe'] = '90 % N-Massenanteil nur an N+Z: 0.18/(0.18+0.02); 90 % N-Rückgewinnung: 0.18/0.20. Nenner unterschieden, ohne Lösungsmittelmasse keine Reinheit der gesamten Flüssigphase behauptet; Isolierung ohne neue Bindungsbildung erklärt.'
    i1['rubric'][2]['fullCreditEn'] = '90% N mass fraction only within N+Z: 0.18/(0.18+0.02); 90% N recovery: 0.18/0.20. Distinguishes denominators, makes no whole-liquid-phase purity claim without solvent mass, and explains isolation without new bonds.'

    i2['materialDe'] += ' Die Prozentzahlen sind ausschließlich Massenanteile innerhalb der bilanzierten gelösten Stoffe P+Q. Lösungsmittelmassen und mögliche nicht charakterisierte Verunreinigungen sind nicht angegeben; deshalb ist die Reinheit der gesamten Flüssigphase oder einer vollständig charakterisierten Probe daraus nicht bestimmbar. Ein selektiver Trennmechanismus wird in diesem Identitäts-/Herkunftsfall nicht geliefert.'
    i2['materialEn'] += ' The percentages are mass fractions only within the balanced dissolved substances P+Q. Solvent masses and possible uncharacterized impurities are unspecified, so purity of the whole liquid phase or a fully characterized sample cannot be determined. This identity/origin case supplies no selective separation mechanism.'
    i2['taskDemandDe'] += ' Benenne ausdrücklich P+Q als Bezugsmasse der angegebenen Anteile und grenze sie von der gesamten Flüssigphase ab; erfinde keinen hier nicht gegebenen Trennmechanismus.'
    i2['taskDemandEn'] += ' Explicitly identify P+Q as the reference mass for the stated fractions and distinguish it from the whole liquid phase; do not invent an absent separation mechanism.'
    i2['modelAnswerDe'] += ' Die Angaben 95 %/5 % und 10 %/90 % beziehen sich nur auf die jeweils bilanzierte P+Q-Masse, nicht auf die gesamte Flüssigphase. Ohne Lösungsmittel- und weitere Verunreinigungsdaten ist deren Reinheit offen. Dieser Fall prüft Identität und Herkunft; er liefert keinen zweiten kausalen Trennmechanismus.'
    i2['modelAnswerEn'] += ' The 95%/5% and 10%/90% values refer only to the balanced P+Q mass in each fraction, not the whole liquid phase. Its purity remains undetermined without solvent and further impurity data. This case checks identity and origin and supplies no second causal separation mechanism.'
    i2['rubric'][1]['fullCreditDe'] += ' Prozentwerte ausdrücklich nur an der bilanzierten gelösten P+Q-Masse, nicht an der gesamten Flüssigphase, festgemacht.'
    i2['rubric'][1]['fullCreditEn'] += ' Explicitly restricts percentages to the balanced dissolved P+Q mass, not the whole liquid phase.'
    i2['rubric'][3]['fullCreditDe'] += ' Fehlende Lösungsmittel-/weitere Verunreinigungsdaten und fehlenden Trennmechanismus nicht erfunden.'
    i2['rubric'][3]['fullCreditEn'] += ' Does not invent absent solvent/further impurity data or a separation mechanism.'

    i3['materialDe'] = i3['materialDe'].replace('Es gibt keinen Stoffverlust und keinen weiteren Bestandteil.', 'Für die bilanzierten gelösten Stoffe U und V gibt es keinen Verlust und keinen weiteren bilanzierten gelösten Bestandteil. Die Massen des flüssigen Transportmittels und der festen Oberfläche gehören nicht zu dieser U+V-Bilanz. Lösungsmittelmassen sind nicht gegeben. U-Massenanteile beziehen sich ausschließlich auf die Summe U+V, nicht auf die gesamte Flüssigphase.')
    i3['materialEn'] = i3['materialEn'].replace('There is no substance loss or additional component.', 'There is no loss of the balanced dissolved substances U and V or additional balanced dissolved component. The liquid carrier and solid surface masses are outside this U+V balance. Solvent masses are not supplied. U mass fractions refer only to the sum U+V, not the whole liquid phase.')
    i3['taskDemandDe'] = i3['taskDemandDe'].replace('den U-Anteil in F1', 'den U-Massenanteil an den bilanzierten gelösten Stoffen U+V in F1 (nicht an der gesamten Flüssigphase)')
    i3['taskDemandEn'] = i3['taskDemandEn'].replace('the U fraction in F1', 'the U mass fraction within the balanced dissolved substances U+V in F1 (not the whole liquid phase)')
    i3['modelAnswerDe'] = i3['modelAnswerDe'].replace('F1 enthält 0.10/0.11, also rund 90.9 % U;', 'Der U-Massenanteil innerhalb der bilanzierten gelösten Stoffe in F1 beträgt 0.10/(0.10+0.01), also rund 90.9 % (anfangs 0.12/(0.12+0.08)=60 %);').replace('Unterschiedliche Bezugsgrößen erklären die unterschiedlichen Anteile; F1 ist weder völlig rein noch enthält sie alles U.', 'Die Nenner U+V in F1 und anfängliches U erklären die unterschiedlichen Anteile. Ohne Lösungsmittelmasse ist die Reinheit der gesamten Flüssigphase nicht bestimmt; die bilanzierten gelösten Stoffe sind ebenfalls nicht reines U, und F1 enthält nicht alles U.')
    i3['modelAnswerEn'] = i3['modelAnswerEn'].replace('F1 contains 0.10/0.11, about 90.9% U,', 'The U mass fraction within the balanced dissolved substances in F1 is 0.10/(0.10+0.01), about 90.9% (initially 0.12/(0.12+0.08)=60%),').replace('Different reference quantities explain the different proportions; F1 is neither completely pure nor contains all U.', 'The denominators U+V in F1 and initial U explain the different proportions. Without solvent mass, whole-liquid-phase purity is undetermined; the balanced solutes are not pure U either, and F1 does not contain all U.')
    i3['rubric'][2]['fullCreditDe'] = 'Anreicherung von Synthese und vollständiger Rückgewinnung getrennt. Bei den Zahlen rund 90.9 % U an U+V in F1: 0.10/(0.10+0.01), gegenüber rund 83.3 % U-Rückgewinnung: 0.10/0.12. Fehlende Lösungsmittelmasse verhindert jede Reinheitsangabe für die gesamte Flüssigphase; kein reines U behauptet.'
    i3['rubric'][2]['fullCreditEn'] = 'Distinguishes enrichment from synthesis and complete recovery. With the values, about 90.9% U within U+V in F1: 0.10/(0.10+0.01), versus about 83.3% U recovery: 0.10/0.12. Absent solvent mass prevents a whole-liquid-phase purity claim; does not claim pure U.'
    write('materials/eleven-complete-cases.remediated.author.json', {
        'schemaVersion': 1, 'licenseForOwnTaskContent': 'CC-BY-4.0',
        'authorOnly': True, 'evidenceLevel': 'E0', 'maximumClaimScope': 'G0',
        'caseCount': 11, 'rubricCount': 44, 'priorWholeMaterial': ref(MATERIAL),
        'changedWholeCaseIds': ['HB-I1', 'HB-I2', 'HB-I3'],
        'otherEightWholeCaseObjectsExact': True, 'cases': cases})
    new_material_path = OWN / 'materials/eleven-complete-cases.remediated.author.json'

    old_profiles = load(PROFILES)
    profiles = copy.deepcopy(old_profiles['profiles'][:2])
    p40 = profiles[0]['profile']
    e = p40['expectations'][2]
    e['essentialUnderstandingDe'] = 'Physikalische Isolierung trennt vorhandene Moleküle. Der Massenanteil am bilanzierten gelösten Stoffgemisch ist von der Rückgewinnung zu unterscheiden; ohne Lösungsmittelmasse ist keine Reinheit der gesamten Flüssigphase gegeben. Anreicherung ist weder Synthese noch vollständige Reinigung.'
    e['essentialUnderstandingEn'] = 'Physical isolation separates existing molecules. Mass fraction within the balanced dissolved mixture differs from recovery; without solvent mass, whole-liquid-phase purity is undetermined. Enrichment is neither synthesis nor complete purification.'
    e['observablePerformanceDe'] = 'Sie erklärt unveränderte Molekülidentität und Gemischstatus. Sie nennt N+Z bzw. U+V (in I2 P+Q) als Bezugsmasse der gelösten Stoffanteile, anfängliches N bzw. U als Nenner der Rückgewinnung und begründet, warum daraus keine Reinheit der gesamten Flüssigphase folgt.'
    e['observablePerformanceEn'] = 'The learner explains unchanged molecular identity and mixture status, identifies N+Z or U+V (P+Q in I2) as the solute mass-fraction denominator and initial N or U as the recovery denominator, and explains why no whole-liquid-phase purity follows.'
    p40['variationAxes'][1]['textDe'] = 'Anteil an den bilanzierten gelösten Stoffen/Rückgewinnung gegenüber nicht bestimmter Reinheit der gesamten Flüssigphase, gleiche Summenformel/verschiedene Konstitution und verschiedene Herkunft/dieselbe bestätigte Struktur unterscheiden.'
    p40['variationAxes'][1]['textEn'] = 'Distinguish balanced-solute mass fraction/recovery from undetermined whole-liquid-phase purity, equal formula/different constitution and different origin/the same confirmed structure.'
    briefs = p40['applicationCaseBriefs']
    briefs[0]['expectedPerformanceDe'] = 'D/(1+D) erklärt 0.18 g N und 0.02 g Z in O; 0.18/(0.18+0.02)=90 % N an N+Z unterscheidet sich im Nenner von 0.18/0.20=90 % N-Rückgewinnung. Ohne Lösungsmittelmasse keine Reinheit der gesamten Flüssigphase. N bleibt chemisch unverändert.'
    briefs[0]['expectedPerformanceEn'] = 'D/(1+D) explains 0.18 g N and 0.02 g Z in O; 0.18/(0.18+0.02)=90% N within N+Z differs in denominator from 0.18/0.20=90% N recovery. No whole-liquid-phase purity follows without solvent mass. N remains chemically unchanged.'
    briefs[1]['expectedPerformanceDe'] += ' Prozentwerte gelten nur an der bilanzierten gelösten P+Q-Masse, nicht an der gesamten Flüssigphase; Lösungsmittel- und weitere Verunreinigungsdaten fehlen.'
    briefs[1]['expectedPerformanceEn'] += ' Percentages apply only within the balanced dissolved P+Q mass, not the whole liquid phase; solvent and further impurity data are absent.'
    briefs[2]['expectedPerformanceDe'] += ' 0.10/(0.10+0.01)≈90.9 % U an U+V und 0.10/0.12≈83.3 % U-Rückgewinnung sind verschiedene Bezugsgrößen; die Reinheit der gesamten Flüssigphase ist ohne Lösungsmittelmasse nicht bestimmbar.'
    briefs[2]['expectedPerformanceEn'] += ' 0.10/(0.10+0.01)≈90.9% U within U+V and 0.10/0.12≈83.3% U recovery use different denominators; whole-liquid-phase purity is undetermined without solvent mass.'
    for b in briefs:
        b['taskDemandDe'] += ' Begrenze Stoffanteile ausdrücklich auf die bilanzierte gelöste Stoffmasse und unterscheide Rückgewinnung sowie die nicht bestimmte gesamte Flüssigphase.'
        b['taskDemandEn'] += ' Explicitly bound solute fractions to the balanced dissolved-substance mass and distinguish recovery and the undetermined whole liquid phase.'
    assert profiles[1]['profile'] == old_profiles['profiles'][1]['profile']
    for row in profiles:
        row['wholeGoalObjectSha256'] = objsha(by3[row['goalId']])
        row['wholeGoalReference'] = {**ref(new_goal_path), 'jsonPointer': '/' + str([g['id'] for g in goals].index(row['goalId']))}
        for cr in row['fullCaseReferences']:
            cr['path'] = str(new_material_path.relative_to(ROOT))
            cr['wholeCaseObjectSha256'] = objsha(bycase[cr['caseId']])
        for b in row['profile']['applicationCaseBriefs']:
            for lang in ['De', 'En']:
                b['taskDemand' + lang] = b['taskDemand' + lang].replace('materials/eleven-complete-cases.v3.bound.author.json', str(new_material_path.relative_to(ROOT)))
    p93_without_path_rebind = json.loads(json.dumps(profiles[1]['profile']).replace(str(new_material_path.relative_to(ROOT)), 'materials/eleven-complete-cases.v3.bound.author.json'))
    assert p93_without_path_rebind == old_profiles['profiles'][1]['profile'], '93 P science remains exact; only case-reference paths change'
    write('candidate/two-profiles.raw.author.json', {
        'schemaVersion': 1, 'artifactKind': 'raw-positive-understanding-evidence-v2-author-shapes',
        'role': 'bounded author remediation, not independent review',
        'licenseForOwnTaskContent': 'CC-BY-4.0', 'profileRuleVersion': 'positive-understanding-evidence-v2',
        'profileSchemaReference': 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json#/$defs/profile',
        'evidenceLevel': 'E0', 'maximumClaimScope': 'G0', 'unreviewed': True,
        'learnerExecutions': [], 'independentScientificReviewRunIds': [], 'reviewRecordsCreated': False,
        'activeConfigCreated': False, 'gateClearancesCreated': [], 'priorRawProfiles': ref(PROFILES),
        'profiles': profiles,
        'unchangedDyeProfileReference': {**ref(PROFILES), 'jsonPointer': '/profiles/2',
                                       'wholeProfileRowSha256': objsha(old_profiles['profiles'][2])},
        'i2IsIdentityOriginTransferOnly': True, 'i1AndI3SupplyDifferentSeparationMechanisms': True,
        'formalDPAMVAndSourceViewAcquisitionStatus': 'OPEN; no integration, no new or restored strict closure'})

    current = load(CURRENT)
    prior = load(PRIOR)
    revised = copy.deepcopy(prior)
    revised['goals'] = [by3.get(g['id'], g) for g in revised['goals']]
    cb = {g['id']: g for g in current['goals']}
    pb = {g['id']: g for g in prior['goals']}
    rb = {g['id']: g for g in revised['goals']}
    completed = load(REPORT)['subjects'][0]['strictCompleteGoalIds']
    assert len(completed) == 305 and all(cb[k] == rb[k] for k in completed)
    assert [g for g in pb if pb[g] != rb[g]] == [G93]
    parent = 'd11fc507-4fae-5f2f-bd84-c3dbc9c43daf'
    assert [g for g in cb if cb[g] != rb[g]] == [parent]
    write('candidate/whole-object-delta.author.json', {
        'schemaVersion': 1, 'role': 'inactive author proposal only', 'licenseForOwnContent': 'CC-BY-4.0',
        'current419Baseline': ref(CURRENT), 'priorProspective422Baseline': ref(PRIOR),
        'priorThreeImageBoundWholeGoals': ref(PRIOR_THREE), 'successorThreeWholeGoals': ref(new_goal_path),
        'objectHashRule': 'SHA-256 of UTF-8 JSON, sorted keys, compact separators, unescaped Unicode',
        'rows': [{'goalId': a['id'], 'current419Presence': a['id'] in cb,
                  'status': 'author-requires-edge-revision' if a != b else 'whole-object-KEEP',
                  'before': a, 'after': b, 'beforeObjectSha256': objsha(a), 'afterObjectSha256': objsha(b),
                  'fieldDeltas': differences(a, b)} for a, b in zip(old3, goals)],
        'changedExistingCurrent419ObjectsAlreadyInPrior422': [parent],
        'newChangeFromPrior422': [{'goalId': G93, 'jsonPointer': '/requires/1', 'before': OLD_REQ, 'after': NEW_REQ}],
        'viewsMappingCanonicalAndRegistryWritten': False, 'strictClosuresGranted': 0})
    write('CHECK.context-union.actual.json', {
        'schemaVersion': 1, 'role': 'bounded structural context observation, not scientific clearance',
        'algorithm': 'Both old and new complete graph versions; own body and outgoing/reverse requires/contains neighbor-body union',
        'inputs': [ref(CURRENT), ref(PRIOR), ref(REPORT), ref(new_goal_path)],
        'priorStrictCount': 305, 'all305OwnBodiesExact': True,
        'currentB07ToRemediated422': affected(cb, rb, completed),
        'priorProspective422ToRemediated422': affected(pb, rb, completed),
        'prior422ToRemediated422AllGoalContexts': affected(pb, rb, sorted(pb)),
        'currentB07ToRemediated422AllExistingGoalContexts': affected(cb, rb, sorted(cb)),
        'regressionPropertiesPassed': ['added reverse dependency', 'removed reverse dependency', 'unrelated addition', 'unchanged graph'],
        'allCurrent419WholeBodyChanges': [{'goalId': k, 'fieldDeltas': differences(cb[k], rb[k])} for k in cb if cb[k] != rb[k]],
        'nativeDRebindingPending': True, 'strictClosuresGranted': 0})

    selected = {PURE, NEW_REQ, OLD_REQ, LAB, SAFETY, CLUSTER,
                '5a709938-e0f5-42b7-94f0-cfded08963a2', '5a30273a-98d5-5163-bb16-c250b7ed4e7f',
                'a8800c36-d13c-5f63-962c-cf18c3795c63', '9b5d6326-d27c-4ece-8c72-debda705464a',
                '6c7ce93c-7675-51da-bc0c-7d0257f7ff7d', '86d34f1f-692d-5522-a9a4-a71c65b24de7',
                '707998c1-872d-582d-a2d6-14e7d967cbdb', '7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6',
                '326d45bf-9f77-57d5-a054-93e76b034dd5', 'fcc73fb5-7413-557f-aea3-b9692a66ee75',
                'a9c22adc-b543-5b0c-a2d8-3189facdff08', *cb[OLD_REQ]['requires']}
    write('inputs/current-b07.selected-whole-goals.exact.json', {
        'schemaVersion': 1, 'source': ref(CURRENT), 'licenseForOwnGoalContent': 'CC-BY-4.0',
        'allSelectedWholeObjectsExact': True, 'goals': [cb[k] for k in sorted(selected)]})
    old_hold = load(BASE / 'AUTHOR.prerequisites-given-background-and-acquisition-holds.json')
    write('AUTHOR.findings-prerequisite-sufficiency-and-HOLDs.json', {
        'schemaVersion': 1, 'authorOnly': True, 'role': 'author response to disclosed review, not an independent vote',
        'licenseForOwnContent': 'CC-BY-4.0', 'reviewExposure': [ref(A / 'SCIENCE.typed-three-goal-review.json'),
             ref(BASE / 'inputs/history/v2-B-FIRST.science.exact.json')],
        'findings': [
            {'id': 'A-SRC3-P40-SOLUTE-BASIS', 'authorResponse': 'candidate-remediated; independent confirmation pending',
             'changedCases': ['HB-I1', 'HB-I2', 'HB-I3'], 'changedProfileGoalId': G40,
             'basisDe': 'Ausschließlich bilanzierte gelöste N+Z-, P+Q- bzw. U+V-Masse; kein getrockneter Rückstand wird als tatsächlich hergestellt behauptet. Lösungsmittelmassen fehlen, daher keine Reinheit der gesamten Flüssigphase. Rückgewinnung hat die anfängliche Wirkstoffmasse als Nenner.',
             'basisEn': 'Only balanced dissolved N+Z, P+Q or U+V mass; no actual dried residue is claimed. Solvent masses are absent, so whole-liquid-phase purity is undetermined. Recovery uses initial active-substance mass as denominator.',
             'i2Scope': 'identity/origin transfer only; no supplied selective mechanism; no second mechanism credit'},
            {'id': 'A-SRC3-93-PREREQUISITE-MINIMALITY', 'authorResponse': 'one-edge candidate revision; independent whole-goal/context confirmation pending',
             'before': [PURE, OLD_REQ], 'after': [PURE, NEW_REQ],
             'wholeGoalSufficiencyDe': '42a84 verlangt das Unterscheiden von Elementen, Verbindungen und Gemischen anhand von Stoff- und Teilchenvorstellungen; dies trägt den Vergleich von Extrakt, isoliertem P/N und geänderter Molekülart D. Das ganze 8d4 verlangt die Abgrenzung chemischer Reaktionen durch Bildung neuer Stoffe von physikalischen Vorgängen und die Grenze bloßer Farb-/Temperaturbeobachtung. Dies trägt Analyse/Trennung gegenüber gegebener Synthese. W1 liefert Strukturänderung, Reaktionsgleichung, Probenreinheit, Enzymwerte und eine als Vorhersage markierte Bindungsmodellidee; W2 liefert Trennung, Reinstofftests und das widerlegte Modell. Modell-Daten-Abgleich, kontrollierte Folgeschritte und Grenzen der Ursachenzuordnung sind die zu erwerbende Zielrelation von 93, nicht als vorhandene Simulationskompetenz vorausgesetzt. Es wird weder ein Mechanismus hergeleitet noch Software oder ein Versuch durchgeführt.',
             'wholeGoalSufficiencyEn': 'Whole 42a84 distinguishes elements, compounds and mixtures using substance/particle ideas, supporting comparison of extract, isolated P/N and changed species D. Whole 8d4 distinguishes chemical reactions forming new substances from physical changes and explains why color/temperature alone is inconclusive, supporting analysis/separation versus the supplied synthesis. W1 supplies structural change, reaction equation, sample purity, enzyme data and an explicitly predicted binding-model idea; W2 supplies separation, pure-substance tests and the contradicted model. Comparing models with data, controlled next steps and attribution limits are the relation to acquire in 93, not assumed prior simulation competence. No mechanism derivation, software use or experiment is requested.',
             'counterexampleToOldRequiresDe': 'Eine Person kann sämtliche W1/W2-Erklärungen materialgestützt leisten, ohne radikalische Substitution oder elektrophile Addition mechanistisch darzustellen, Esterhydrolyse/Reversibilität zu bilanzieren oder Elektronen-/Protonenübertragungen zu vergleichen. Diese vier ganzen Pfade sind echte Ziele, aber für genau diese Relation keine notwendigen Voraussetzungen.',
             'counterexampleToOldRequiresEn': 'A learner can explain all supplied W1/W2 relations without representing radical substitution or electrophilic addition mechanisms, balancing ester hydrolysis/reversibility, or comparing electron/proton transfers. Those four whole pathways remain real goals but are unnecessary prerequisites for this relation.',
             'rejectedBroaderAlternatives': [
                 {'goalIds': ['6c7ce93c-7675-51da-bc0c-7d0257f7ff7d', '86d34f1f-692d-5522-a9a4-a71c65b24de7'], 'reason': 'whole goals require own selection/use/comparison of models and simulations across broader systems; not required by supplied model cards'},
                 {'goalIds': ['707998c1-872d-582d-a2d6-14e7d967cbdb'], 'reason': 'whole goal requires computer molecular-model representation; no software task supplied'},
                 {'goalIds': ['a8800c36-d13c-5f63-962c-cf18c3795c63'], 'reason': 'whole inquiry-method goal stays unchanged and is not made an implicit mandatory HB domain target; historical reuse dissent retained'}],
             'realAcquirability': 'OPEN: stock target presence is necessary but not proof of teachable whole prerequisites. Transitive 266a working-method cluster contains actual lab-method and laboratory-safety goals. Their performance and acquisition are not established by theoretical W1/W2 or by listing the cluster. No prior mastery, practical equivalence, target role or jurisdiction applicability is inferred.'},
            {'goalId': GDYE, 'decision': 'KEEP exact whole goal, two materials, raw P and three original image references; no new defect established'}],
        'unchangedW1W2WholeCases': True,
        'historicalDisagreementPreserved': {'reference': ref(BASE / 'AUTHOR.minimality-counterexamples-and-v2-dissent.preserved.json'),
            'meaning': 'Historical B preferred scoped reuse of a880; this author packet does not erase dissent or convert the chosen explicit carriers into independent approvals.'},
        'inheritedHOLDsExactWholeObject': old_hold,
        'inheritedHOLDInterpretation': 'Historical 2/22/9 missing-atomic-target observations remain as provenance, not current recomputed counts. Only 93 edge is proposed narrower; source/course and practical lab/safety contained acquisition HOLDs remain OPEN. New bounded stock report distinguishes clusters from atomic targets.',
        'sourceDutyLimits': ['HB LK compulsory 4.3 isolation and research-interplay duties only; no HB GK insertion', 'BW Leistungsfach selected dye family only; official other families remain alternatives', 'No complete source/course closure from new target insertion'],
        'memoryAuthorDesignOnly': [{'goalId': k, 'recommendation': 'no_memory_needed', 'reason': 'Given data and causal explanation/transfer suffice; no independent compact recall requirement established; formal current M binding pending'} for k in [G40, G93, GDYE]],
        'atomicityAuthorDesignOnly': 'One bounded explanatory relation per whole goal; exact same descriptions; requires edit does not grant current independent atomicity clearance.',
        'formalDPAMVIntegration': False, 'newStrictClosures': 0, 'restoredStrictClosures': 0,
        'humanApprovalOrTrialClaimed': False})

    schema = load(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
    validator = jsonschema.Draft202012Validator({'$ref': '#/$defs/profile', '$defs': schema['$defs']})
    for p in profiles:
        validator.validate(p['profile'])
        assert p['evidenceLevel'] == 'E0' and p['maximumClaimScope'] == 'G0'
        assert p['wholeGoalObjectSha256'] == objsha(by3[p['goalId']])
        for cr in p['fullCaseReferences']:
            assert cr['wholeCaseObjectSha256'] == objsha(cases[int(cr['jsonPointer'].split('/')[-1])])
    changed_cases = [a['id'] for a, b in zip(old_material['cases'], cases) if a != b]
    assert changed_cases == ['HB-I1', 'HB-I2', 'HB-I3']
    for c in cases:
        assert not c['executed'] and not c['learnerWorkPresent'] and c['evidenceLevel'] == 'E0' and c['maximumClaimScope'] == 'G0'
        assert len(c['rubric']) == 4 and c['maximumPoints'] == 12
    assert sum(len(c['rubric']) for c in cases) == 44
    calc = {'I1_N_to_O': Fraction(9, 10), 'I1_Z_to_O': Fraction(1, 5),
            'I1_N_share_of_N_plus_Z_initial': Fraction(20, 30),
            'I1_N_share_of_N_plus_Z_O': Fraction(18, 20), 'I1_N_recovery_O': Fraction(18, 20),
            'I3_U_share_of_U_plus_V_initial': Fraction(12, 20),
            'I3_U_share_of_U_plus_V_F1': Fraction(10, 11), 'I3_U_recovery_F1': Fraction(10, 12)}
    assert Fraction(18, 100) + Fraction(2, 100) == Fraction(20, 100)
    assert Fraction(2, 100) + Fraction(8, 100) == Fraction(10, 100)
    assert Fraction(10, 100) + Fraction(2, 100) == Fraction(12, 100)
    assert Fraction(1, 100) + Fraction(7, 100) == Fraction(8, 100)
    write('CHECK.calculations-profile-schema-and-case-delta.actual.json', {
        'schemaVersion': 1, 'role': 'author technical checks; no executed learner evidence',
        'profileSchema': ref(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),
        'profileSchemaRowsPassed': 2, 'unchanged93ScientificProfileExceptExplicitCasePaths': True,
        'calculations': {k: {'exactRatio': str(v), 'percent': float(100*v)} for k, v in calc.items()},
        'I1N_ZAndI3U_VMassBalancesExact': True, 'allAmountsReferOnlyToBalancedSolutes': True,
        'wholeLiquidPurityComputable': False, 'changedCases': changed_cases, 'otherEightCasesExact': True,
        'caseCount': 11, 'rubricCount': 44,
        'wholeCaseFieldDeltas': [{'caseId': a['id'], 'fieldDeltas': differences(a, b)} for a, b in zip(old_material['cases'], cases) if a != b],
        'raw40ProfileFieldDeltas': differences(old_profiles['profiles'][0]['profile'], profiles[0]['profile']),
        'mechanismCredit': {'HB-I1': True, 'HB-I2': False, 'HB-I3': True},
        'errors': [], 'newStrictClosures': 0})

    source_rows = []
    for rel, pages, quote, paraphrase in [
        ('curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf', [36, 37],
         'Isolierung von Wirkstoffen aus Naturstoffen.',
         'Physical page36 supplies isolation and analysis/synthesis/model interplay duties; page37 places 4.3 compulsorily in LK. This does not establish entire course acquisition.'),
        ('curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf', [42],
         'anwendungsorientierte Forschung und Entwicklung am Beispiel einer weiteren ausgewählten Stoffgruppe',
         'Physical page42, printed40, section3.4.8(4), applies to Leistungsfach; the selected dyes route is one allowed family, not a cumulative requirement for all example families.')]:
        p = ROOT / rel
        extracts = []
        normalized_pages = []
        for page in pages:
            args = ['pdftotext', '-f', str(page), '-l', str(page), '-layout', str(p), '-']
            b = subprocess.check_output(args)
            normalized_pages.append(' '.join(b.decode().split()))
            extracts.append({'physicalPage': page, 'extractionCommand': ['pdftotext', '-f', str(page), '-l', str(page), '-layout', rel, '-'], 'fullPageExtractSHA256': sha(b), 'fullPageTextCommittedHere': False})
        assert any(quote in s for s in normalized_pages), 'Short official excerpt must match a directly re-extracted page'
        source_rows.append({'source': ref(p), 'rightsholder': 'official third-party curriculum; no relicensing',
                            'shortOperatorExcerpt': quote, 'ownScopedParaphrase': paraphrase, 'directlyReextractedPhysicalPages': extracts})
    write('SOURCE.official-page-fingerprints-and-scoped-operators.json', {'schemaVersion': 1, 'role': 'bounded author source verification; not complete source/course review', 'sources': source_rows})
    print(json.dumps({'ownDirectory': str(OWN.relative_to(ROOT)), 'changedGoalsFromPrior422': [G93],
                      'changedCases': changed_cases, 'profilesSchemaPassed': 2,
                      'currentB07AffectedPrior305Contexts': len(affected(cb, rb, completed)),
                      'prior422AffectedPrior305Contexts': len(affected(pb, rb, completed)), 'strictClosures': 0}))


if __name__ == '__main__':
    main()
