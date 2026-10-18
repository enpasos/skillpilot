#!/usr/bin/env python3
"""Finite technical assembly; no normal writes or scientific verdicts."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17'
OUT = Path(__file__).resolve().parents[1]
OLD = BASE / 'chemie-current439-source-requires-working-checkpoint-20261017-v1/evidence/paired-all-seven-packages-and-HB7f-actual-current650-technical-v1/PROSPECTIVE.whole39views.all-seven-and-HB7f.PENDING-final-union-approval.json.snapshot'
FOUR = BASE / 'chemie-current441-HB232-complete-view-integration-candidates-20261017-v1/views'
AUTHOR = BASE / 'chemie-current441-HB-eight-direct-priors-science-author-20261017-v1/AUTHOR.eight-prior-ten-edge-and-two-LK-role-successors.pending.json'
SCI_A = BASE / 'chemie-current441-HB-eight-direct-priors-independent-a-20261017-v1/FIRST.json'
SCI_B = BASE / 'chemie-current441-HB-eight-direct-priors-whole-edge-scope-independent-b-20261017-v1/FIRST.independent-eight-prior-ten-edge-two-LK-role.json'
LOWER = BASE / 'chemie-current441-HB-lower14-current-whole-union-author-20261017-v3/AUTHOR.fourteen-current-whole-source-unions.pending.json'
CANON = BASE / 'chemie-current442-C653-SEM653-paired-ten-requires-integration-20261017-v1/C653.Lower14-ten-paired-requires.PENDING-final-scope-context.json.snapshot'
RESOURCE = '04ebfc99-dbac-539e-95db-642addcaca8c'
SUBSTITUTION = '3899edf4-a809-54b1-8ee7-4e67aa82dc7c'

def read(p):
    return json.loads(p.read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def object_sha(v):
    return hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def pin(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}

def write(name, value):
    p = OUT / name
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return pin(p)

def at(v, pointer):
    for k in pointer.split('/')[1:]:
        v = v[int(k)] if isinstance(v, list) else v[k]
    return v

def occurrences(view):
    rows = []
    def walk(node, pointer, parents):
        if node['kind'] == 'structure':
            parents = parents + [{'id': node['id'], 'label': node['label'], 'pointer': pointer}]
        if node['kind'] in ('goalEntry', 'canonicalSubtree'):
            rows.append({'goalId': node['goalId'], 'pointer': pointer, 'kind': node['kind'], 'role': node.get('projectionRole', 'target'), 'explicitProjectionRole': 'projectionRole' in node, 'parents': parents})
        for i, child in enumerate(node.get('children', [])):
            walk(child, pointer + '/children/' + str(i), parents)
    for i, node in enumerate(view['rootNodes']):
        walk(node, '/rootNodes/' + str(i), [])
    return rows

def main():
    assert sha(OLD) == '00cf1869bd0baaed88be6f382fb84c109c1473f17b95992835bcf0984121edb4'
    assert sha(AUTHOR) == '8117926ddf8b90145e4db449bd57730a4d0a793b22985a5cfab05e33495a2988'
    assert sha(SCI_A) == '34d514cd5ef89a72cfd9e85efb4f1a3e2d44196bf84e600f0481cd92f204f87c'
    assert sha(SCI_B) == '75c0295a00756c69f18b6b027c9fdddc56e901835fc4c92bfb1a2e7748b3391e'
    assert sha(CANON) == 'cb3c432cc7b6875b55d8ea58acceb0048cdda7a532441dc122abb09a4b51c056'
    old, author, a, b, lower, canonical = map(read, [OLD, AUTHOR, SCI_A, SCI_B, LOWER, CANON])
    assert len(old) == 39
    assert len(canonical['goals']) == 653
    for z, av, bv in zip(author['tenExactRequiresSuccessors'], a['edgeDecisions'], b['edgeDecisions']):
        assert z['proposalId'] == av['proposalId'] == bv['proposalId']
        assert av['decision'] == bv['verdict'] == 'ACCEPT'
        assert z['afterRequiresExact'] == av['afterRequiresExact'] == bv['afterRequiresExact']
    replacements, patches = {}, []
    for name in ['de-hb-gk.view.json', 'de-hb-lk.view.json', 'de-hb-sekii-gk.view.json', 'de-hb-sekii-lk.view.json']:
        source = FOUR / name
        v = read(source)
        before = copy.deepcopy(v)
        # Pure contract metadata: the full authored candidate bodies remain exact.
        v.update({'$schema': 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json', 'viewFormatVersion': '1.0', 'language': 'de'})
        applied = []
        for i, role in enumerate(author['twoExplicitLKViewRoleCandidates']):
            if role['viewId'] != v['viewId']:
                continue
            av, bv = a['explicitLKRoleDecisions'][i], b['ownHBRoleDecisions'][i]
            assert av['decision'] == bv['verdict'] == 'ACCEPT'
            assert av['acceptedPendingJsonPatch'] == bv['pendingJsonPatch'] == role['pendingJsonPatch']
            assert role['exactScope'] == v['scope']
            parent = at(v, role['exactParentStructureRef']['jsonPointer'])
            assert object_sha(parent) == role['exactParentStructureRef']['objectSHA256']
            assert not any(z['goalId'] == SUBSTITUTION for z in occurrences(v))
            patch = role['pendingJsonPatch']
            parent['children'].append(copy.deepcopy(patch['value']))
            applied.append({'patch': patch, 'basis': 'Exact separately sealed author/A8/B8 own LK role; no inferred import or official source credit.'})
        if v['scope']['stage'] == 'CrossStage':
            path = '/rootNodes/0/children/2/children/1'
            parent = at(v, path)
            expected_id = 'chemistry-hb-' + v['scope']['courseProfile'].lower() + '-lower-1'
            assert parent['id'] == expected_id
            assert parent['label'] == 'Die Erde als Rohstofflieferant'
            assert not any(z['goalId'] == RESOURCE for z in occurrences(v))
            patch = {'op': 'add', 'path': path + '/children/-', 'value': {'kind': 'goalEntry', 'goalId': RESOURCE, 'projectionRole': 'target'}}
            applied.append({'patch': patch, 'parentBeforeObjectSHA256': object_sha(parent), 'basis': 'Paired Lower14 source21 whole actual-practice successor; existing HB Lower raw-material branch and exact own D/P/A/M/V evidence. Lower only, no new source-whole credit.'})
            parent['children'].append(copy.deepcopy(patch['value']))
        else:
            assert not any(z['goalId'] == RESOURCE for z in occurrences(v))
        # Reproduce the full body using only the four authorized append operations.
        reconstructed = copy.deepcopy(before)
        reconstructed.update({k: v[k] for k in ['$schema', 'viewFormatVersion', 'language']})
        for p in applied:
            at(reconstructed, p['patch']['path'].rsplit('/children/-', 1)[0])['children'].append(copy.deepcopy(p['patch']['value']))
        assert reconstructed == v
        replacements[v['viewId']] = v
        output_pin = write('views/' + name, v)
        patches.append({'viewId': v['viewId'], 'scope': v['scope'], 'input': pin(source), 'output': output_pin, 'beforeObjectSHA256': object_sha(before), 'afterObjectSHA256': object_sha(v), 'contractMetadataOnlyAdded': ['$schema', 'viewFormatVersion', 'language'], 'exactAppendOperations': applied, 'allOtherBodyFieldsAndOrderedChildrenExact': True})
    views, retention = [], []
    inserted = False
    for i, v in enumerate(old):
        if v['scope'].get('jurisdiction') == 'DE-HB':
            if not inserted:
                views.extend(replacements[z] for z in ['de-hb-gym-chemistry-gk', 'de-hb-gym-chemistry-lk', 'de-hb-gym-sekii-chemistry-gk', 'de-hb-gym-sekii-chemistry-lk'])
                inserted = True
            continue
        ni = len(views)
        views.append(copy.deepcopy(v))
        assert views[-1] == v
        retention.append({'viewId': v['viewId'], 'beforePointer': '/' + str(i), 'afterPointer': '/' + str(ni), 'objectSHA256': object_sha(v), 'wholeObjectExact': True, 'scopeUnchanged': True})
    assert len(views) == 41 and len(retention) == 37
    assert len({v['viewId'] for v in views}) == 41
    lower_ids = sorted({g for z in lower['records'] for g in z['exactProposedPartialCarrierUnionGoalIds']})
    assert len(lower_ids) == 13 and RESOURCE in lower_ids
    role_rows = []
    for gid in lower_ids:
        row = {'goalId': gid, 'sourceDecisionIndices': [z['sourceDecisionIndexZeroBased'] for z in lower['records'] if gid in z['exactProposedPartialCarrierUnionGoalIds']], 'viewRoles': []}
        for v in replacements.values():
            found = [z for z in occurrences(v) if z['goalId'] == gid]
            assert len(found) <= 1
            if v['scope']['stage'] == 'CrossStage':
                assert len(found) == 1 and found[0]['role'] == 'target' and found[0]['kind'] == 'goalEntry'
            if gid == RESOURCE and v['scope']['stage'] == 'SekII':
                assert found == []
            row['viewRoles'].append({'viewId': v['viewId'], 'scope': v['scope'], 'actualOccurrences': found, 'absent': not found})
        role_rows.append(row)
    whole_pin = write('VIEWS41.whole-current653-Lower14-eight-priors.PENDING-final-context.json', views)
    nw_old_index = next(i for i, v in enumerate(old) if v['viewId'] == 'de-nw-gym-chemistry-lk')
    nw_new_index = next(i for i, v in enumerate(views) if v['viewId'] == 'de-nw-gym-chemistry-lk')
    nw = old[nw_old_index]
    (OUT / 'retained').mkdir(exist_ok=True)
    nw_pin = write('retained/de-nw-lk.exact-whole39-member.view.json', nw)
    write('LOCATOR.exact-NW-LK-whole-view-and-support-root.pending-question.json', {'artifactType': 'neutral locator for separately authorized NW scope question; no applied role patch', 'retainedWholeView': nw_pin, 'objectSHA256': object_sha(nw), 'oldWhole39': {**pin(OLD), 'jsonPointer': '/' + str(nw_old_index)}, 'newWhole41': {**whole_pin, 'jsonPointer': '/' + str(nw_new_index)}, 'consumer': {'goalId': 'a4bac92b-d685-5cb6-94c8-c9b8b878d125', 'jsonPointer': '/rootNodes/0/children/1/children/7/children/1', 'role': 'target by omitted default'}, 'existingGeneralPrerequisiteOnlyRoot': None, 'soleExistingPrerequisiteOnlyNode': {'jsonPointer': '/rootNodes/0/children/5/children/2', 'goalId': 'cd9ec99b-b694-5673-863c-55528e31250a', 'parentLabel': 'Ethanol: Eigenschaften, Körperwirkungen und begründete Risiken', 'appropriateFor3899': False}, 'smallestNeutralExistingContainer': {'jsonPointer': '/rootNodes', 'possibleAppendPointer': '/rootNodes/-', 'futureValueRequiresSeparateAuthorization': {'kind': 'goalEntry', 'goalId': SUBSTITUTION, 'projectionRole': 'prerequisiteOnly'}, 'targetOrProgressImport': False}, 'phaseToRoleInference': False, 'patchApplied': False, 'scopeScienceDecision': 'pending separate root task'})
    write('RETENTION.exact37-nonHB-and-four-HB-deltas.json', {'artifactType': 'pure technical whole39-to-whole41 derivation', 'whole39Input': pin(OLD), 'whole41Output': whole_pin, 'unchangedNonHBViews': retention, 'replacementHBViews': patches, 'unchangedNonHBRelativeOrder': True, 'oldHBViewsReplaced': [v['viewId'] for v in old if v['scope'].get('jurisdiction') == 'DE-HB'], 'noNewScienceReview': True, 'normalActivation': False})
    write('ROLES.actual-thirteen-Lower14-carriers-and-two-3899-roles.json', {'artifactType': 'actual explicit node roles and parents, not ID membership alone', 'lowerAuthor': pin(LOWER), 'actualUniqueLower14Carriers': 13, 'newLowerGoalCount': 1, 'existingLowerCarrierCount': 12, 'rows': role_rows, 'own3899Roles': [{'viewId': v['viewId'], 'scope': v['scope'], 'occurrences': [z for z in occurrences(v) if z['goalId'] == SUBSTITUTION]} for v in replacements.values()], 'new04ebSourceWholeCredit': False, 'lowerIntoSekIITargetInference': False, 'allPreviousSupportRolesRetained': True})
    write('INPUTS.exact-technical-assembly.json', {'artifactType': 'exact technical integration input pins', 'canonical': pin(CANON), 'canonicalPairedIntegrationReceipt': pin(CANON.parent / 'RECEIPT.technical-C653-SEM653-paired-ten-requires.json'), 'canonicalPairedIntegrationSeal': pin(CANON.parent / 'SEAL.json'), 'SEM653': pin(CANON.parent / 'SEM653.Lower14-ten-paired-requires.current-source-bindings.PENDING-native-context.json'), 'oldWhole39': pin(OLD), 'authorEight': pin(AUTHOR), 'scienceA8': pin(SCI_A), 'scienceA8Seal': pin(SCI_A.parent / 'SEAL.json'), 'scienceB8': pin(SCI_B), 'scienceB8Seal': pin(SCI_B.parent / 'SEAL.json'), 'lower14AuthorV3': pin(LOWER), 'lower14PairedIntegration': pin(BASE / 'chemie-current442-lower14-paired-C-P-M-source-integration-20261017-v1/RECEIPT.paired-Lower14-C-P-M-source-integration.json'), 'originalOwnLower14Science': pin(BASE / 'chemie-current442-HB-lower14-whole-source-independent-b-20261017-v1/FIRST.independent-lower14-whole-source-review.json'), 'ownLower14V3TargetedFollowup': pin(BASE / 'chemie-current442-HB-lower14-E2-5338-informed-followup-independent-b-20261017-v1/FOLLOWUP.informed-E2-5338-v3.science.json'), 'new04ebActualV': pin(BASE / 'chemie-current442-HB-lower14-whole-source-independent-b-20261017-v1/FIRST.independent-v-04eb.json'), 'new04ebOwnM': pin(BASE / 'chemie-current442-04eb-v3-whole-M-independent-b-20261017-v1/FIRST.independent-whole04eb-v3-M.json'), 'normalFilesWritten': False, 'newScientificAcceptance': False})
    print(json.dumps({'whole41': whole_pin, 'unchangedNonHB': len(retention), 'HBViews': len(replacements), 'lowerCarrierCount': len(role_rows), 'exactAuthorizedAppendOperations': sum(len(z['exactAppendOperations']) for z in patches)}, indent=2))

if __name__ == '__main__':
    main()
