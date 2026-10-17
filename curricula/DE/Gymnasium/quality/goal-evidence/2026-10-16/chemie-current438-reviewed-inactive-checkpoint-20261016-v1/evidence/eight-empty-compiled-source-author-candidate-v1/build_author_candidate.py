# SPDX-License-Identifier: Apache-2.0
"""Build only this disjoint inactive source8 candidate; never modify inputs."""
from pathlib import Path
import collections
import copy
import datetime
import hashlib
import json

R = Path('/home/enpasos/projects/skillpilot')
P = R / 'tmp/chemie-m7-resumed-20261016/eight-empty-compiled-source-next-author-preparation-v1'
O = Path(__file__).parent
L = R / 'tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1'
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
fp = lambda x: 'sha256:' + hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
rel = lambda p: str(Path(p).relative_to(R))
pin = lambda p: {'path': rel(p), 'sha256': sha(p), 'bytes': Path(p).stat().st_size}

def put(name, value):
    p = O / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return p

plan_path = P / 'PLAN.eight-existing-ordinary-source-and-scope-author-only.json'
assert sha(plan_path) == 'sha256:995381f6f780550e498d27ad808ac8deee9654b2d88dd1fdeefd44cf32069bdb'
plan = read(plan_path)
for item in read(P / 'INPUTPINS.actual-current-files-and-existing-source-proof-routes.json')['files']:
    assert sha(R / item['path']) == item['sha256'], item['path']
can_path = L / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert sha(can_path) == plan['baselineCanonical']['sha256']
by = {g['id']: g for g in read(can_path)['goals']}
before, after, sections, file_cases = {}, {}, collections.defaultdict(set), collections.defaultdict(set)

def load_file(input_path):
    p = Path(input_path)
    if not p.is_absolute():
        p = R / p
    logical = str(p.relative_to(L))
    assert logical.startswith('curricula/DE/Gymnasium/') and '..' not in Path(logical).parts
    if logical not in before:
        before[logical] = read(p)
        after[logical] = copy.deepcopy(before[logical])
    return logical, after[logical]

old_source_path = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-four-source-duties-explicit-compulsory-domain-carriers-author-20261014-v3/candidate/sources/HB-source.author-pending.json'
old_hb = read(old_source_path)
old_mapping_hb = read(old_source_path.with_name('HB-mapping.author-pending.json'))
old_rec_path = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-three-recycling-whole-source-duty-author-20261013-v3/OPERATIONS.thirteen-whole-source-cell-CAS.new-targets.author.json'
old_rec = read(old_rec_path)
case_by_name = {c['sourceCase']: c for c in plan['sourceCellCASPlan']}
case_by_id = {c['sourceGoalId']: c for c in plan['sourceCellCASPlan']}
author = '/root/chemie_native9_fresh_independent_a_20261016 (AUTHOR ONLY, NOT INDEPENDENT REVIEW)'
stamp = '2026-10-16'

# Reuse exactly the two existing primary-derived cells and dedicated passages.
hb_logical, hb_after = load_file(case_by_name['HB40']['currentSourceInput']['file'])
hb_ids = {case_by_name[k]['sourceGoalId'] for k in ['HB40', 'HB93']}
for g in old_hb['sourceGoals']:
    if g['id'] not in hb_ids:
        continue
    assert not any(q['id'] == g['id'] for q in hb_after['sourceGoals'])
    passages = [p for p in old_hb['passages'] if p['id'] == g['passageId']]
    assert len(passages) == 1
    assert not any(p['id'] == passages[0]['id'] for p in hb_after['passages'])
    hb_after['sourceGoals'].append(copy.deepcopy(g))
    hb_after['passages'].append(copy.deepcopy(passages[0]))
sections[hb_logical].update(['sourceGoals', 'passages', 'qualityReview', 'pipelineStatus'])
file_cases[hb_logical].update(['HB40', 'HB93'])
previous_baseline = copy.deepcopy(hb_after['qualityReview']['sourceGoalCountPeerBaseline'])
hb_after['qualityReview']['sourceGoalCountPeerBaseline'] = {
    'accepted': False,
    'details': 'Actual author-candidate inventory:97 sourceGoals, consisting of95 unchanged current cells plus2 exact reused primary-derived HB36 cells. No new peer count or whole-source acceptance.'
}
hb_after['qualityReview']['source8AuthorCandidate'] = {
    'role': 'AUTHOR-ONLY inactive source restoration; independent review pending',
    'author': author,
    'previousWholeSourceGoalCountPeerBaseline': previous_baseline,
    'all95PreviousSourceGoalsExact': True,
    'addedSourceGoalIds': sorted(hb_ids),
    'exactReuseFrom': pin(old_source_path),
    'actualSourceGoalCount': len(hb_after['sourceGoals']),
    'originalHB050HB056AndOtherSourceCorrectionsPreserved': True,
    'wholeSourceApproval': False,
}
for step in hb_after['pipelineStatus']['steps']:
    for check in step.get('checks', []):
        if check['id'] == 'source-goals-created':
            check['details'] = '97 author-candidate sourceGoals:95 existing cells exact,2 exact primary-derived HB36/37 cells reused. Their current independent source/mapping review is pending.'
        if check['id'] == 'source-goal-count-peer-baseline':
            check['passed'] = False
            check['details'] = hb_after['qualityReview']['sourceGoalCountPeerBaseline']['details']

# The selected NW source cell receives only the already established page locator correction.
nw_case = case_by_name['NW']
nw_logical, nw_after = load_file(nw_case['currentSourceInput']['file'])
nw_cell = next(g for g in nw_after['sourceGoals'] if g['id'] == nw_case['sourceGoalId'])
for key in ['sourceRef', 'rawSourceSpan']:
    if isinstance(nw_cell.get(key), str):
        nw_cell[key] = nw_cell[key].replace('S. 23', 'S. 24')
if isinstance(nw_cell.get('sourceSpan'), dict):
    nw_cell['sourceSpan']['label'] = nw_cell['sourceSpan']['label'].replace('S. 23', 'S. 24')
sections[nw_logical].add('sourceGoals')
file_cases[nw_logical].add('NW')

def replace_selected(array, predicate, replacement):
    positions = [i for i, row in enumerate(array) if predicate(row)]
    first = positions[0] if positions else len(array)
    result = []
    for i, row in enumerate(array):
        if i == first:
            result.extend(copy.deepcopy(replacement))
        if not predicate(row):
            result.append(row)
    if not positions:
        result.extend(copy.deepcopy(replacement))
    return result

def historical_partition(sid):
    ops = [x for x in old_rec['operations'] if x['sourceGoalId'] == sid]
    assert ops
    first = ops[0]['proposedAfter']['mappingCells']
    assert all(x['proposedAfter']['mappingCells'] == first for x in ops)
    return copy.deepcopy(first)

corrected_notes = {}
for case in plan['sourceCellCASPlan']:
    name, sid = case['sourceCase'], case['sourceGoalId']
    note = case['sourceAndCourseBoundary']
    if name == 'SN':
        note = ('Actual SN physical24/printed12: e5 covers only the introductory significance/use/handling competence as a PARTIAL contribution. '
                'The separate indented LEFT-column experimental investigation of acidic solutions with indicators is a real curricular part and remains required/unresolved by e5. '
                'The right column contains SE beside that experiment and contextual classification/acid-rain remarks beside the introduction. '
                'No experiment is deleted, optionalized, performed or certified by this material-based introduction. '
                'All five existing partner bindings remain partial, without a new approval of their full operators or of the whole composite source row.')
    if name == 'MV':
        note = ('Actual MV physical32/printed28 places the disposal-environmental-problem, rare-metal-extraction and recycling paragraph in Hinweise und Anregungen beside secondary electrochemical sources, with the explicit operator sind zu diskutieren. '
                'Physical5/printed1 explains that this right column includes both implementation suggestions and guidance on necessary/sufficient depth; it is not a blanket optionality flag. '
                'Keep the original column/status and this discussion requirement: do not relabel it as left-column Verbindliche Inhalte, and do not downgrade it to an arbitrary optional activity. '
                'Keep common GK/LK source occurrences and the original rare-metals qualifier, not a rare-earth synonym. '
                'The narrow f54/f9 contributions and retained c884 component remain partial; no unbounded whole-source/course approval or actual industrial recycling performance is claimed.')
    corrected_notes[name] = note
    for current in case['currentMappingAliases']:
        logical, data = load_file(current['file'])
        assert sha(L / logical) == current['wholeFileSHA256']
        old_rows = [r for r in data['mappings'] if r.get('legacyGoalId') == sid]
        old_decisions = [r for r in data.get('decisions', []) if r.get('sourceGoalId') == sid]
        if name in ['HH', 'MV', 'NW']:
            new_rows = historical_partition(sid)
        elif name.startswith('HB'):
            new_rows = [copy.deepcopy(r) for r in old_mapping_hb['mappings'] if r['legacyGoalId'] == sid]
            assert new_rows
        else:
            new_rows = copy.deepcopy(old_rows)
            for gid in case['existingOrdinaryTargetIds']:
                assert not any(r['canonicalGoalId'] == gid for r in new_rows)
                new_rows.append({'legacyGoalId': sid, 'canonicalGoalId': gid, 'matchType': 'partial', 'reviewDecisionId': sid})
        assert new_rows and len({(r['legacyGoalId'], r['canonicalGoalId']) for r in new_rows}) == len(new_rows)
        for r in new_rows:
            assert r['canonicalGoalId'] in by
        data['mappings'] = replace_selected(data['mappings'], lambda r: r.get('legacyGoalId') == sid, new_rows)
        sections[logical].update(['mappings', 'source8AuthorCandidate'])
        file_cases[logical].add(name)
        if 'decisions' in data:
            if old_decisions:
                assert len(old_decisions) == 1
                identity = old_decisions[0]
            else:
                historical = [r for r in old_mapping_hb['decisions'] if r['sourceGoalId'] == sid]
                assert len(historical) == 1
                identity = historical[0]
            # Do not carry previous independent-review stamps across changed target arrays.
            # The entire original selected decision remains in the exact before/after audit.
            decision = {k: copy.deepcopy(identity[k]) for k in [
                'sourceGoalId', 'topicCode', 'sourceSpan', 'sourceRef', 'sourcePage',
                'courseLevel', 'sourceScopeCondition',
            ] if k in identity}
            decision.update({
                'sourceGoalId': sid,
                'decision': 'pending_independent_review',
                'canonicalGoalIds': [r['canonicalGoalId'] for r in new_rows],
                'rationale': 'AUTHOR-only current source8 successor. ' + note + ' Existing source-cell component limits remain; no full-source/course or D/P/A/M/V approval is asserted.',
                'reviewedAt': '',
                'reviewer': '',
                'author': author,
                'authorCreatedAt': stamp,
                'authorOnly': True,
                'wholeSourceUnionApproved': False,
                'source8PreviousSelectedDecisionFingerprint': fp(old_decisions),
            })
            # No misleading one-strength shortcut when a retained partial and exact target coexist.
            if name == 'NW':
                decision.pop('matchType', None)
                if isinstance(decision.get('sourceSpan'), str):
                    decision['sourceSpan'] = decision['sourceSpan'].replace('S. 23', 'S. 24')
                elif isinstance(decision.get('sourceSpan'), dict):
                    decision['sourceSpan']['label'] = decision['sourceSpan']['label'].replace('S. 23', 'S. 24')
            elif all(r['matchType'] == 'partial' for r in new_rows):
                decision['matchType'] = 'partial'
            data['decisions'] = replace_selected(data['decisions'], lambda r: r.get('sourceGoalId') == sid, [decision])
            sections[logical].add('decisions')

# Truthful author-only counter/status envelope on affected mapping files, preserving exact history.
for logical, data in after.items():
    if '/mapping/' not in logical:
        continue
    metadata = {
        'role': 'AUTHOR-only inactive source8 candidate; all selected decisions await independent review',
        'author': author,
        'sourceCases': sorted(file_cases[logical]),
        'wholeSourceApproval': False,
        'wholeCourseApproval': False,
        'newIndependentVotes': 0,
        'HumanApproval': False,
        'HumanTrial': False,
    }
    if isinstance(data.get('status'), dict):
        metadata['previousWholeStatus'] = copy.deepcopy(before[logical]['status'])
        ds = data.get('decisions', [])
        status = data['status']
        counts = collections.Counter(d.get('decision') for d in ds)
        for key, value in {
            'totalSourceGoals': len(ds),
            'reviewedSourceGoals': sum(d.get('decision') != 'pending_independent_review' for d in ds),
            'mappedSourceGoals': counts['mapped'],
            'unreviewedSourceGoals': counts['pending_independent_review'],
        }.items():
            status[key] = value
        status['notes'] = str(status.get('notes', '')) + ' SOURCE8 AUTHOR successor: selected cells are pending independent review; original whole status is preserved in source8AuthorCandidate.previousWholeStatus. No whole-source/course acceptance.'
        sections[logical].add('status')
    elif 'status' in data:
        metadata['previousWholeStatus'] = copy.deepcopy(before[logical]['status'])
        data['status'] = 'author_candidate_pending_independent_review'
        sections[logical].add('status')
    data['source8AuthorCandidate'] = metadata

# Exact existing target entries only; no newly authored ordinary goal or canonical mutation.
for placement in plan['scopeCASPlan']:
    logical, view = load_file(placement['viewPath'])
    assert sha(L / logical) == placement['wholeBeforeSHA256']
    anchor = placement['existingStructureId']
    def find(node):
        if isinstance(node, dict):
            if node.get('kind') == 'structure' and node.get('id') == anchor:
                return node
            for value in node.values():
                if isinstance(value, (dict, list)):
                    result = find(value)
                    if result is not None:
                        return result
        elif isinstance(node, list):
            for value in node:
                result = find(value)
                if result is not None:
                    return result
        return None
    node = find(view)
    assert node is not None
    node['children'].extend(copy.deepcopy(placement['appendOnlyExistingTargetEntries']))
    sections[logical].add('rootNodes')
    file_cases[logical].add('target-placement')

# Reviewable exact selected whole-cell pairs, including unchanged source cells.
cell_pairs = []
for case in plan['sourceCellCASPlan']:
    name, sid = case['sourceCase'], case['sourceGoalId']
    source_path = R / case['currentSourceInput']['file']
    logical = str(source_path.relative_to(L))
    source_before = before.get(logical) or read(source_path)
    source_after = after.get(logical) or source_before
    sb = [g for g in source_before['sourceGoals'] if g['id'] == sid]
    sa = [g for g in source_after['sourceGoals'] if g['id'] == sid]
    assert len(sa) == 1 and len(sb) == (0 if name.startswith('HB') else 1)
    mappings = []
    for current in case['currentMappingAliases']:
        logical_map = str((R / current['file']).relative_to(L))
        b, a = before[logical_map], after[logical_map]
        mappings.append({
            'logicalPath': logical_map,
            'beforeWholeSelectedMappingArray': [r for r in b['mappings'] if r.get('legacyGoalId') == sid],
            'afterWholeSelectedMappingArray': [r for r in a['mappings'] if r.get('legacyGoalId') == sid],
            'beforeWholeSelectedDecisionArray': [r for r in b.get('decisions', []) if r.get('sourceGoalId') == sid],
            'afterWholeSelectedDecisionArray': [r for r in a.get('decisions', []) if r.get('sourceGoalId') == sid],
        })
    cell_pairs.append({
        'sourceCase': name,
        'sourceGoalId': sid,
        'logicalSourcePath': logical,
        'beforeWholeSourceCell': sb[0] if sb else None,
        'afterWholeSourceCell': sa[0],
        'beforeWholeDedicatedPassages': [p for p in source_before['passages'] if p.get('id') == sa[0]['passageId']],
        'afterWholeDedicatedPassages': [p for p in source_after['passages'] if p.get('id') == sa[0]['passageId']],
        'mappingArrays': mappings,
        'sourceAndCourseBoundary': corrected_notes[name],
        'wholeSourceApproval': False,
    })

put('CELLS.nine-exact-whole-source-and-selected-mapping-before-after.AUTHOR.json', {
    'role': 'Nine exact selected whole source/mapping cell pairs; AUTHOR, no independent votes',
    'cells': cell_pairs,
})

# Mechanical guard: remove precisely selected cells/entries and recover all unrelated data.
selected = set(case_by_id)
checks = []
for logical, a in after.items():
    b = before[logical]
    if '/mapping/' in logical:
        for key, field in [('mappings', 'legacyGoalId'), ('decisions', 'sourceGoalId')]:
            assert [x for x in b.get(key, []) if x.get(field) not in selected] == [x for x in a.get(key, []) if x.get(field) not in selected]
        stripped_b = {k: v for k, v in b.items() if k not in ['mappings', 'decisions', 'status']}
        stripped_a = {k: v for k, v in a.items() if k not in ['mappings', 'decisions', 'status', 'source8AuthorCandidate']}
        assert stripped_b == stripped_a
    elif '/source-extraction/' in logical:
        assert [x for x in b['sourceGoals'] if x['id'] not in selected] == [x for x in a['sourceGoals'] if x['id'] not in selected]
        if logical == hb_logical:
            assert len(a['sourceGoals']) == len(b['sourceGoals']) + 2
            assert a['passages'][:len(b['passages'])] == b['passages']
            assert {k:v for k,v in a.items() if k not in ['sourceGoals','passages','qualityReview','pipelineStatus']} == {k:v for k,v in b.items() if k not in ['sourceGoals','passages','qualityReview','pipelineStatus']}
        else:
            assert {k:v for k,v in a.items() if k != 'sourceGoals'} == {k:v for k,v in b.items() if k != 'sourceGoals'}
    else:
        placement = next(p for p in plan['scopeCASPlan'] if str((R / p['viewPath']).relative_to(L)) == logical)
        ids = {g['goalId'] for g in placement['appendOnlyExistingTargetEntries']}
        def strip(node):
            if isinstance(node, list):
                return [strip(v) for v in node if not(isinstance(v, dict) and v.get('kind') == 'goalEntry' and v.get('goalId') in ids)]
            if isinstance(node, dict):
                return {k:strip(v) for k,v in node.items()}
            return node
        assert strip(a) == b
    assert a != b
    checks.append({'logicalPath': logical, 'allUnrelatedCellsAndFieldsExact': True})

file_ops = []
for logical in sorted(after):
    p = put('after/' + logical, after[logical])
    file_ops.append({
        'logicalPath': logical,
        'before': pin(L / logical),
        'after': pin(p),
        'modifiedSections': sorted(sections[logical]),
        'sourceCases': sorted(file_cases[logical]),
    })
assert len(file_ops) == 30
assert sum('/composition-views/' in x['logicalPath'] for x in file_ops) == 10
assert sum('/mapping/' in x['logicalPath'] for x in file_ops) == 18
assert sum('/source-extraction/' in x['logicalPath'] for x in file_ops) == 2
assert sha(can_path) == plan['baselineCanonical']['sha256']
put('CAS.guarded-thirty-whole-files.source8.AUTHOR.inactive.json', {
    'role': 'Executable guarded inactive AUTHOR CAS manifest; independent source/scope review pending',
    'repoRoot': str(R),
    'baselineRoot': str(L),
    'protectedRoots': [str(R), str(L), str(P), str(O)],
    'baselineCanonical': pin(can_path),
    'sourcePlan': pin(plan_path),
    'selectedCellPairs': pin(O / 'CELLS.nine-exact-whole-source-and-selected-mapping-before-after.AUTHOR.json'),
    'fileOperations': file_ops,
    'noCanonicalOrRawApplicabilityOrOrdinaryEdits': True,
    'newIndependentVotes': 0,
    'HumanApproval': False,
    'HumanTrial': False,
    'M7Claim': False,
})
put('CHECK.finite-unrelated-cell-exactness-and-scope-author-only.json', {
    'role': 'Mechanical AUTHOR preparation only; no compiler/D/P/global run',
    'fileChecks': checks,
    'counts': {'wholeAfterFiles':30,'mappingFiles':18,'sourceExtractionFiles':2,'viewFiles':10,'sourceCells':9,'existingOrdinaryPlacements':12,'newOrdinaryGoals':0,'newIndependentVotes':0},
    'allCurrent639GoalObjectsAndCanonicalBytesUnchanged': True,
    'allUnrelatedMappingAndSourceCellsExact': True,
    'HB95ExistingSourceCellsExactAndTwoOldPrimaryCellsReusedExactly': True,
    'SNLeftIndicatorExperimentRemainsRealAndUncoveredByE5': True,
    'HH_MV_NW_PartialRetentionsAndNarrowPartitionsReused': True,
    'noRorL4Mutations': True,
    'HumanApproval': False,
    'HumanTrial': False,
    'M7Claim': False,
})
put('ADDENDUM.SN-original-plan-column-precision.AUTHOR.json', {
    'role':'Additive correction to preserved original plan, not a source review vote',
    'originalPlan':pin(plan_path),
    'actualSource':'SN original PDF physical24/printed12',
    'correction':'The indented indicator experiment is on the LEFT as a genuine own curricular component; only SE is beside it on the right. The old plan grouped it too broadly with right-column suggestions. The candidate explicitly preserves this operator and binds e5 only partial significance/use/handling.',
    'ordinaryBodyUnchanged':True,
    'wholeCompositeSourceCoverageClaim':False,
})
print(json.dumps({'wholeAfterFiles':len(file_ops),'mappingFiles':18,'sourceFiles':2,'views':10,'placements':12,'sourceCells':len(cell_pairs),'noMutationsOutsideAuthorTmp':True,'totalAfterBytes':sum(x['after']['bytes'] for x in file_ops)},indent=2))
