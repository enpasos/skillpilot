# SPDX-License-Identifier: Apache-2.0
"""Selected whole-object AUTHOR proposals. Writes this TMP evidence root only."""
import copy
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

R = Path('/home/enpasos/projects/skillpilot')
O = Path(__file__).parent
L = R / 'tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1'
V = R / 'tmp/chemie-m7-resumed-20261016/HE-admission-A-B-informed-author-successor-v2'
CP = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
BP = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.b007-normal-source-scope-20261011-v1.review.json'
SP = 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
def read(p): return json.loads(Path(p).read_text())
def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def fp(o): return sha(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())
def pin(p):
    p = Path(p)
    return {'path': str(p.relative_to(R)), 'sha256': sha(p.read_bytes()), 'bytes': p.stat().st_size}
def write(name, obj):
    p = O / name
    with p.open('x') as f: f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return pin(p)

can = read(L / CP)
assert sha((L / CP).read_bytes()) == 'sha256:a915d088f93133b04e073421ec6abd0b62aaebf4abdef391ca784feb79a26178'
base = {g['id']: g for g in can['goals']}
postv2 = copy.deepcopy(base)
v2cas = read(V / 'CAS.nine-selected-WHOLE-goals.A-B-informed-AUTHOR-v2.inactive.json')
for op in v2cas['operations']:
    assert base[op['goalId']] == op['before']
    postv2[op['goalId']] = op['after']
def gid(prefix): return next(i for i in base if i.startswith(prefix))
new, old, classes = gid('459724'), gid('8721'), gid('3e9e')
selected = [gid(p) for p in ['145773', '32705', 'c21a', '954b', 'e6cb']]
profiles = {}
central = read(R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current437-six-current-native-bindings-private-L4-central-check-technical-20261016-v1/central.current437.P6-normal-kind-address-only.after-measured-failure.inactive.config.json')['subjects'][0]
needed = [gid(p) for p in ['3e9e', '3aef', '2652', 'c21a', '2cf86', '801790', '4bdb']]
for path in central['positiveEvidenceConfigPaths']:
    cp = L / path
    if not cp.exists(): cp = R / path
    cfg = read(cp)
    scope = set(cfg.get('scope', {}).get('goalIds', []))
    wanted = scope.intersection(needed)
    if not wanted: continue
    rp = L / cfg['reviewPath']
    if not rp.exists(): rp = R / cfg['reviewPath']
    for line in rp.read_text().splitlines():
        rec = json.loads(line)
        if rec.get('goalId') in wanted:
            assert rec['goalId'] not in profiles
            profiles[rec['goalId']] = {'config': pin(cp), 'review': pin(rp), 'wholeOriginalRecord': rec}
assert set(profiles) == set(needed)
casespath = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-final-fiftythree-current402-source-native-independent-a-20261013-v1/inputs/whole74BilingualCases.json'
cases = [c for c in read(casespath)['cases'] if c['goalId'] in needed]
material = write('INPUT.selected-WHOLE-current-goals-P-records-and-FULL-linked-polymer-materials.json', {
    'role': 'Exact read-only selected source material; historical review status is not a new author vote',
    'canonical': pin(L / CP), 'wholeGoals': [base[i] for i in dict.fromkeys(selected + needed + [gid('2cf86'), old, new])],
    'currentSelectedPRecords': profiles, 'fullLinkedPolymerCases': cases, 'fullMaterialContainer': pin(casespath),
    'twoWholeExamMaterialsSolutionsRubrics': [base[gid('954b')], base[gid('e6cb')]],
    'ordinaryAndExamTasksNotAuthoredOrRevisedHere': True,
})

# Read and pin the actual official BY pages. Keep them separate from authored content.
primaries = []
for course in ['erhoeht', 'grundlegend']:
    url = 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/' + course
    p = O / ('PRIMARY.BY-C12-' + course + '.actual.html')
    data = urlopen(url, timeout=40).read()
    with p.open('xb') as f: f.write(data)
    assert 'unterscheiden verschiedene Systeme'.encode() in data
    if course == 'erhoeht': assert 'Mesomeriemodell'.encode() in data
    primaries.append({'url': url, 'actualWholeHTML': pin(p)})
sx = read(L / SP)
source_ids = ['b246897e-21d3-5b31-82e8-7736de8a112c', 'aaed261c-20d8-5529-ab11-3d8cfa68bc0a', 'ed3c553b-c6eb-5462-a2ad-307e6e4d74a4']
sg = {g['id']: g for g in sx['sourceGoals']}
sources = write('INPUT.actual-BY-two-foundations-WHOLE-sources-primary-pages.json', {
    'sourceExtraction': pin(L / SP), 'wholeSourceGoals': [sg[i] for i in source_ids], 'actualPrimaryPages': primaries,
    'courseDistinction': 'C12GA5.3/EA5.3 both source occurrences are retained. Benzene resonance support comes only from the actual EA/LK5.6 and5.7, never a BY-GK aromatic duty.',
})

science = write('AUTHOR.bounded-routing-and-BY-acquisition-proposal.frozen.json', {
    'role': 'AUTHOR only, no independent KEEP or gate closure', 'canonical': pin(L / CP),
    'sealedV2Retained': pin(V / 'OUTPUTS.nine-wholes-five-views-A-B-informed-author-v2.selector.json'),
    'actualMaterials': material, 'actualBYSources': sources,
    'recycling': {
        'common459': 'Actual new459 and reviewed HEQ2.2 common source cells are input, not authored again. Add459 as actual target to both HE courses; replace8721 only in GK admission/view, keep8721 plus459 in LK admission/view.',
        'c21': 'Replace the unnecessarily broad8721 prerequisite by existing3e9. Whole c21 materials provide same-PE recyclability, collection assumptions, functional units, carbon/land/water/cost information and limits. Its independent demand is evidence-based raw-material/lifecycle judgement, not deriving hydrolytic or monomer recovery. Existing3e9 whole P explicitly teaches thermoplastic chain motion and remelting. Keep c21 whole competence and all materials;2cf already requires2652 separately and remains whole exact.',
        '954b': 'Remove8721 from prerequisites. Existing3e9 plus6eb suffice for supplied thermoplast/PS radical and ABS property case. The supplied96/120 data give80%; sorting and unknown recyclate properties are provided. Neither hydrolysis nor monomer recovery is asked. Existing3e9 whole P includes remelting. Keep all30/18 tasks, answers and rubric exact.',
        'e6cb': 'Remove8721 from prerequisites. Retain799/3e9/9b942 for functional groups, polymer classes and supplied linear-trimer condensation. Mechanical/compost/thermal route data are printed. No own ester hydrolysis or PE cycle derivation is assessed. Keep all30/18 tasks, answers and rubric exact.',
        'coverage': 'Do not substitute full459 for8721 in either old paper. Remove8721 from unqualified coveredGoalIds; retain its actual bounded mechanical/disposal contribution as explicit partial-context metadata. Neither old paper alone assesses all459 (in particular monomer recovery) or8721. Passing marks only the endpoint. Common459 is learned and assessed through its own complete two-case ordinary P; both primary exams require it as course admission, not re-examination.',
        'remainingAuthority': 'Proposed route remedy pending two nonauthor informed followups. No whole-source, current D/P/A/M/V or M7 release inferred from this bounded draft.',
    },
    'BY': {
        'actualNewLoss': 'Root39role diagnostic finds BY-LK17ab→4bdb,b8d3→4bdb,0cf2→801 missing. These are actual new direct-prior losses, separate from three old197→621 cluster priors.',
        '801': 'Place unchanged existing801 as actual BY-LK target. Actual current whole P concerns open/closed/isolated boundaries, conserved heat/work and supplied simple closed-system balances; BY C12GA/EA5.3 explicitly requires system distinctions and heat/work in closed variable-volume systems with internal-energy/enthalpy distinction. Add partial801 contribution to that source cell while retaining whole4928 edge/decision history.',
        '4bdb': 'Place unchanged existing4bdb as actual BY-LK target. Its whole P models delocalized benzene, equal bond lengths, resonance-contributor limits and stabilization/substitution. Actual BY C12EA5.6/5.7 require aromatic bonding/reactivity with mesomeric/orbital and energetic models and contributor model limits. Preserve currentac700/b44 partners; add partial4bdb contribution. No BY-GK view or course tag change.',
    },
    'normalWrites': False, 'newIndependentVotes': 0, 'HumanApproval': False, 'HumanTrial': False, 'M7Claim': False,
})

ops = []
for i in selected:
    b = postv2[i]
    a = copy.deepcopy(b)
    reason = ''
    if i == gid('145773'):
        assert old in a['requires'] and new not in a['requires']
        a['requires'] = [new if x == old else x for x in a['requires']]
        reason = 'HE-GK common459 replaces broad8721; no removal of common mechanical/monomer recovery operator.'
    elif i == gid('32705'):
        assert old in a['requires'] and new not in a['requires']
        a['requires'].append(new)
        reason = 'HE-LK learns both new common459 and unchanged increased-level whole8721.'
    elif i == gid('c21a'):
        assert a['requires'] == [old]
        a['requires'] = [classes]
        reason = 'Whole supplied raw-material comparison needs plastic class/structure foundations, not independent hydrolysis; actual c21/2cf P is pinned.'
    else:
        a['requires'] = [x for x in a['requires'] if x != old]
        a['examData']['coveredGoalIds'] = [x for x in a['examData']['coveredGoalIds'] if x != old]
        reason = 'Full paper supplies disposal/recycling data. Existing3e9 covers remelting; neither full8721 nor full459 is assessed. No paper/task/scoring change.'
    meta = {'status': 'inactive-AUTHOR-pending-two-nonauthor-informed-followups', 'package': str(O.relative_to(R)), 'science': science,
            'beforeWholeGoalFingerprint': fp(b), 'reason': reason, 'noIndependentVote': True, 'allTasksSolutionsScoringAndImagesExact': True}
    if i in [gid('145773'), gid('32705')]:
        rc = a['extendedData']['routeCoverage']
        meta['previousRouteScopeAssertionsWhole'] = {k: rc[k] for k in ['admissionMeaning', 'remainingLegacyTerminalDuties', 'currentCourseTargetAdmissionCount']}
        oldm = copy.deepcopy(a['extendedData']['targetedAdmissionAuthorSuccessor'])
        meta['previousV2ScopeAssertionsWhole'] = oldm
        rc['currentDirectRequiresObjectCount'] = len(a['requires'])
        rc['currentDirectRequiresAtomicObjectCount'] = len(a['requires'])
        rc['currentCourseTargetAdmissionCount'] = oldm['proposedCourseTargetAdmissionCount'] + (i == gid('32705'))
        rc['admissionMeaning'] = 'Proposed bounded HE course admission; common459 retained for both courses and whole8721 retained only for LK. The seven directly assessed IDs and complete44/27 paper remain exact. Independent current admission/source followups are pending.'
        rc['remainingLegacyTerminalDuties'] = 'HOLD pending actual nonauthor reviews and affected-scope technical validation. The bounded recycling route remedy is a proposal, not whole-course or M7 release.'
        tm = a['extendedData']['targetedAdmissionAuthorSuccessor']
        tm['status'] = 'inactive-V2-plus-bounded-recycling-route-addendum-pending-independent-followup'
        tm['proposedDirectAdmissionCount'] = len(a['requires'])
        tm['proposedCourseTargetAdmissionCount'] = rc['currentCourseTargetAdmissionCount']
        tm['knownOpenWholeOperatorHoldGoalIds'] = [x for x in tm.get('knownOpenWholeOperatorHoldGoalIds', []) if x != old]
        tm['boundedRecyclingRemedyPendingNonauthorReview'] = True
    if i in [gid('954b'), gid('e6cb')]:
        meta['previousCoveredGoalIdsWhole'] = b['examData']['coveredGoalIds']
        meta['partialAssessedContexts'] = [
            {'goalId': old, 'claim': 'Supplied mechanical/disposal case aspects only; no whole hydrolytic-recycling/PE-cycle coverage or acquisition duty.', 'wholeGoalCoverage': False},
            {'goalId': new, 'claim': 'Mechanical-route/quality/conditional ecological aspects only; monomer recovery is absent.', 'wholeGoalCoverage': False},
        ]
    a.setdefault('extendedData', {})['boundedRecyclingRouteAuthorAddendum'] = meta
    ops.append({'operation': 'replace-whole-goal-if-before-exact', 'goalId': i, 'beforeStage': 'exact-selected-V2-after' if i in [gid('145773'), gid('32705')] else 'actual-current-L6-whole',
                'before': b, 'beforeWholeGoalFingerprint': fp(b), 'after': a, 'afterWholeGoalFingerprint': fp(a)})
write('CAS.five-WHOLE-goals.post-V2-recycling-route-AUTHOR.inactive.json', {'role': 'AUTHOR only; apply after selectedV2 whole-goal operations and existing640 append', 'baseCanonical': pin(L / CP), 'selectedV2': pin(V / 'OUTPUTS.nine-wholes-five-views-A-B-informed-author-v2.selector.json'), 'operations': ops, 'noNormalWrites': True, 'newIndependentVotes': 0})

views = []
for op in read(V / 'CAS.four-WHOLE-HE-views.A-B-informed-AUTHOR-v2.inactive.json')['operations']:
    assert read(L / op['path']) == op['before']
    b, a = op['after'], copy.deepcopy(op['after'])
    changed = []
    def change(ns):
        for n in ns:
            if n.get('goalId') == old:
                if a['scope']['courseProfile'] == 'GK':
                    n.clear(); n.update({'kind': 'goalEntry', 'goalId': new, 'projectionRole': 'target'})
                else:
                    changed.append('append')
                changed.append(n)
            if 'children' in n:
                change(n['children'])
                if a['scope']['courseProfile'] == 'LK' and any(c.get('goalId') == old for c in n['children']):
                    ix = next(j for j, c in enumerate(n['children']) if c.get('goalId') == old)
                    n['children'].insert(ix, {'kind': 'goalEntry', 'goalId': new, 'projectionRole': 'target'})
    change(a['rootNodes'])
    assert len(changed) == (1 if a['scope']['courseProfile'] == 'GK' else 2)
    views.append({'operation': 'replace-whole-view-if-before-exact', 'path': op['path'], 'beforeStage': 'exact-selected-V2-four-HE-after', 'before': b, 'after': a,
                  'beforeWholeViewFingerprint': fp(b), 'afterWholeViewFingerprint': fp(a), 'delta': 'GK8721→459 target' if a['scope']['courseProfile'] == 'GK' else 'add459 target;8721 whole target exact'})
write('CAS.four-WHOLE-HE-views.post-V2-common459-AUTHOR.inactive.json', {'operations': views, 'noOtherRoleChanges': True, 'noNormalWrites': True})

byop = read(V / 'CAS.ONE-BY-LK-WHOLE-view-existing-cf270-actual-TARGET.AUTHOR-v2.inactive.json')
assert read(L / byop['path']) == byop['before']
byb, bya = byop['after'], copy.deepcopy(byop['after'])
inserted = []
def insert_by(ns):
    for prefix, prior in [('17ab', gid('4bdb')), ('0cf2', gid('801790'))]:
        for ix, n in enumerate(ns):
            if n.get('goalId', '').startswith(prefix):
                ns.insert(ix, {'kind': 'goalEntry', 'goalId': prior, 'projectionRole': 'target'})
                inserted.append(prior)
                break
    for n in ns:
        if 'children' in n: insert_by(n['children'])
insert_by(bya['rootNodes'])
assert set(inserted) == {gid('4bdb'), gid('801790')} and len(inserted) == 2
write('CAS.ONE-WHOLE-BY-LK-view.post-V2-two-existing-foundations-TARGET.AUTHOR.inactive.json', {
    'operation': 'replace-whole-view-if-before-exact', 'path': byop['path'], 'beforeStage': 'exact-selected-V2-one-BY-LK-after-with-cf270',
    'before': byb, 'beforeWholeViewFingerprint': fp(byb), 'after': bya, 'afterWholeViewFingerprint': fp(bya),
    'addedTargetGoalIds': inserted, 'existingCF270AdditionExact': True, 'allOtherViewsAndOrdinaryBodiesExact': True, 'science': science, 'noNormalWrites': True,
})

bm = read(L / BP)
cells = []
for sid in source_ids:
    ix = [i for i, m in enumerate(bm['mappings']) if m['legacyGoalId'] == sid]
    di = next(i for i, d in enumerate(bm['decisions']) if d['sourceGoalId'] == sid)
    b = {'mappings': [bm['mappings'][i] for i in ix], 'decision': bm['decisions'][di]}
    a = copy.deepcopy(b)
    target = gid('801790') if sid == source_ids[0] else gid('4bdb')
    assert target not in a['decision']['canonicalGoalIds']
    a['mappings'].append({'legacyGoalId': sid, 'canonicalGoalId': target, 'matchType': 'partial', 'reviewDecisionId': sid})
    dec = a['decision']
    dec['canonicalGoalIds'].append(target)
    dec.pop('reviewer', None); dec.pop('reviewedAt', None)
    dec['rationale'] = 'Inactive bounded AUTHOR partial contribution: ' + ('Existing801 contributes system distinctions and conserved heat/work, including the supplied closed-system pV model. Whole4928 remains the exact internal-energy/enthalpy source partner.' if target == gid('801790') else 'Existing4bdb contributes the benzene delocalization, stabilization and resonance-model aspect of the actual EA/LK aromatic operator. Existing wholeac700/b44 partner is retained; this partial contribution is not full-source closure.')
    dec['boundedAuthorAddition'] = {'status': 'inactive-pending-two-nonauthor-source-followups', 'science': science, 'historicalWholeDecision': b['decision'], 'historicalWholeMappingRows': b['mappings'], 'allOldPartnersExact': True, 'newViewTargetOnly': 'BY-LK', 'sourceOccurrencesAndOfficialCourseScopesExact': True, 'noIndependentVote': True}
    cells.append({'sourceGoalId': sid, 'wholeSourceGoal': sg[sid], 'mappingRowIndices': ix, 'decisionIndex': di, 'before': b, 'beforeWholeCellFingerprint': fp(b), 'after': a, 'afterWholeCellFingerprint': fp(a)})
write('CAS.three-WHOLE-BY-source-cells.two-foundation-partial-contributions.AUTHOR.inactive.json', {
    'role': 'AUTHOR source contributions only, no independent mapped-content approval', 'mapping': pin(L / BP), 'sourceExtraction': pin(L / SP), 'operations': cells,
    'disjointFromV2BiuretCell': True, 'allOtherMappingsAndDecisionsExact': True, 'noNormalWrites': True,
})

# Pin already integrated reviewed common cells rather than proposing their old bytes again.
oldsourcecas = read(R / 'tmp/chemie-m7-resumed-20261016/HE-recycling-shared-operator-author-candidate-v1/CAS.one-common-recycling-WHOLE-source-cell-seven-aliases.AUTHOR.inactive.json')
current_cells = []
for oldop in oldsourcecas['operations']:
    rel = oldop['mapping']['path'].split('/curricula/', 1)[1]
    mp = L / ('curricula/' + rel)
    data = read(mp); sid = oldop['sourceGoalId']
    cell = {'mappings': [x for x in data['mappings'] if x['legacyGoalId'] == sid], 'decision': next(x for x in data['decisions'] if x['sourceGoalId'] == sid)}
    assert any(m['canonicalGoalId'] == new for m in cell['mappings'])
    current_cells.append({'mapping': pin(mp), 'wholeCurrentCell': cell, 'wholeCurrentCellFingerprint': fp(cell), 'inputOnlyNotProposedAgain': True})
write('INPUT.seven-current-already-integrated-common459-source-cells.readonly.json', {'operations': current_cells, 'noNewSourceVote': True})
print(json.dumps({'prepared': str(O.relative_to(R)), 'fiveGoalOps': len(ops), 'HEViews': len(views), 'BYNewTargetIds': inserted, 'BYCells': len(cells), 'science': science}, indent=2))
