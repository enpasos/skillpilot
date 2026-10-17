#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Build inactive, exactly two whole-view proposals; never write the source host."""
import hashlib
import json
from pathlib import Path

R = Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
A = T / 'BB-BE-eleven-existing9fef-prior-acquisition-boundary-readonly-v1'
O = Path(__file__).parent

def read(p):
    return json.loads(p.read_text())

def sha(b):
    return 'sha256:' + hashlib.sha256(b).hexdigest()

def pin(p):
    b = p.read_bytes()
    return dict(path=str(p.relative_to(R)), sha256=sha(b), bytes=len(b))

def fp(x):
    return sha(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())

def out(n, j):
    with (O / n).open('x', encoding='utf-8') as h:
        h.write(json.dumps(j, ensure_ascii=False, indent=2) + '\n')

i = read(A / 'INPUT.exact-current-fourteen-whole-goals-and-fourteen-whole-P-records.readonly.json')
f = read(A / 'FIRST.readonly-eleven-BB-BE-crossstage-acquisition-boundary.science.frozen.json')
k = read(A / 'CHECK.actual-two-scopes-stock-roles-shortest-paths-and-four-source-witnesses.readonly.json')
can = L / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
c = read(can)
by = {g['id']: g for g in c['goals']}
assert pin(can)['sha256'] == 'sha256:42312988d68fccc65a15339bcb0b9d46a8d1800455a1858d3e3cb141090bc5e3'
assert all(by[g['id']] == g for g in i['wholeCurrentGoals'])
ids = i['knownElevenGoalIds']
out('AUTHOR.science-existing-source-and-acquisition-only-before-mechanics.frozen.json', {
    'role': 'AUTHOR justification, not an independent review or approval',
    'auditFIRST': pin(A / 'FIRST.readonly-eleven-BB-BE-crossstage-acquisition-boundary.science.frozen.json'),
    'currentCanonical': pin(can),
    'inputDrift': {'auditCanonical': f['canonical'], 'currentNodeCount': len(c['goals']),
                   'selectedFourteenWholeGoalsExact': True, 'twoSelectedViewsByteExact': True},
    'science': f['conclusion'], 'primarySources': f['primarySources'],
    'eachExistingWholeAndMaterialRationale': f['eleven'],
    'scope': 'Only existing BB/BE CrossStage LK views. Preserve SekI acquisition and official E-phase selected-theme status. Owner all-authored-topic policy supplies the target policy, not a universal official SekII obligation.',
    'proposal': 'Add exactly eleven explicit existing leaf targets per view inside the existing matching chapters. Keep every prior target/support/reference exact. Do not expand cluster wrappers and their additional children.',
    'sourceCellsNeedChange': False,
    'sourceReason': 'The actual source atlas already yields BB/BE direct/inherited source applicability for all11. Primary upper p19/21 clarifies full EPA/isomerism operator fit; historical partial source decisions are not upgraded or asserted to cover whole source topics.',
    'requiresSemantics': 'Keep every canonical goal/prerequisite, P profile, card and image exact. Other existing IUPAC/EPA goals are not automatic mastery aliases. Target, not prerequisiteOnly, supplies acquisition in these CrossStage scopes.',
    'status': 'DRAFT AUTHOR inactive; independent exact source/scope followups pending',
    'newIndependentVotes': 0, 'RorL6Writes': 0, 'HumanApproval': False, 'M7Claim': False,
})
ops = []
diffs = []
for j in ['bb', 'be']:
    rel = f'curricula/DE/Gymnasium/composition-views/chemie/de-{j}-lk.view.json'
    before = read(L / rel)
    expected = next(s for s in k['scopes'] if s['scope']['jurisdiction'] == f'DE-{j.upper()}')
    assert pin(L / rel)['sha256'] == expected['view']['sha256']
    assert before == expected['wholeView']
    after = json.loads(json.dumps(before))
    chapters = after['rootNodes'][0]['children'][1]['children']
    atom = next(n for n in chapters if n['id'].endswith('atombau-bindungsmodelle-molekulgeometrie-und-polaritat'))
    groups = next(n for n in chapters if n['id'].endswith('stoffgruppen'))
    atom['children'].insert(0, {'kind': 'goalEntry', 'goalId': ids[10], 'projectionRole': 'target'})
    ns = []
    for n in groups['children']:
        if n.get('goalId') == '61446285-4415-5bd9-9fdc-c19bb9ec1b02':
            ns.extend({'kind': 'goalEntry', 'goalId': z, 'projectionRole': 'target'} for z in [ids[6], ids[5], ids[4]])
        if n.get('goalId') == '667bc303-e9b8-570b-84f1-61cc8bdfd006':
            ns.extend({'kind': 'goalEntry', 'goalId': z, 'projectionRole': 'target'} for z in [ids[1], ids[0]])
        ns.append(n)
        if n.get('goalId') == '15e73664-8c3f-5aa6-ac65-b455fc3ed6d6':
            ns.extend({'kind': 'goalEntry', 'goalId': z, 'projectionRole': 'target'} for z in [ids[9], ids[8], ids[7]])
        if n.get('goalId') == '61446285-4415-5bd9-9fdc-c19bb9ec1b02':
            ns.extend({'kind': 'goalEntry', 'goalId': z, 'projectionRole': 'target'} for z in [ids[3], ids[2]])
    groups['children'] = ns

    def strip(nodes):
        return [dict(n, **({'children': strip(n['children'])} if 'children' in n else {}))
                for n in nodes if n.get('goalId') not in ids]

    assert strip(after['rootNodes']) == before['rootNodes']
    counts = dict.fromkeys(ids, 0)

    def walk(nodes):
        for n in nodes:
            if n.get('goalId') in counts:
                counts[n['goalId']] += 1
            walk(n.get('children', []))

    walk(after['rootNodes'])
    assert set(counts.values()) == {1}
    bn = f'BEFORE.de-{j}-lk.whole-view.json'
    an = f'AFTER.de-{j}-lk.whole-view.AUTHOR.inactive.json'
    out(bn, before)
    out(an, after)
    ops.append({'operation': 'replaceWholeCompositionView', 'targetPath': rel,
                'expectedCurrentFileSha256': pin(L / rel)['sha256'],
                'beforeWholeFingerprint': fp(before), 'afterWholeFingerprint': fp(after),
                'beforeFile': pin(O / bn), 'afterFile': pin(O / an),
                'before': before, 'after': after})
    diffs.append({'viewId': before['viewId'], 'scope': before['scope'],
                  'addedExplicitTargetGoalIds': ids, 'addedOccurrences': 11,
                  'priorExistingNodesAndRelativeOrderExact': True,
                  'supportChanges': 0, 'extraWrapperExpansion': False,
                  'chapterPlacement': {'existingAtomBondingChapter': [ids[10]],
                                       'existingStoffgruppenChapter': ids[:10]}})
out('CAS.two-whole-BB-BE-CrossStage-LK-views.eleven-existing-acquisition-targets.AUTHOR.inactive.json', {
    'role': 'Inactive AUTHOR whole-view proposal; independent reviews required before application',
    'canonicalBinding': pin(can),
    'wholeFingerprintRule': 'sha256 of UTF8 recursively key-sorted compact JSON, ensure_ascii=false; file pins bind original bytes',
    'scienceFIRST': pin(O / 'AUTHOR.science-existing-source-and-acquisition-only-before-mechanics.frozen.json'),
    'operations': ops, 'exactDeltas': diffs,
    'canonicalGoalBodyChanges': 0, 'sourceMappingChanges': 0, 'P_A_M_D_VChanges': 0,
    'RorL6Writes': 0, 'applied': False, 'M7Claim': False, 'HumanApproval': False,
})
print(json.dumps({'canonical': pin(can), 'twoViews': diffs}, ensure_ascii=False))
