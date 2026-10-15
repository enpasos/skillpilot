# SPDX-License-Identifier: Apache-2.0
"""Prepare only two reviewed resources on sealed minimal542; no new votes."""
import copy
import hashlib
import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path

REPO = Path.cwd()
H = REPO / 'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
B = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
OUT = B / 'chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v1'
MIN = B / 'chemie-rest6-two-whole-atoms-on-final-source6-current412-minimal-inactive-technical-20261014-v1'
I292 = B / 'chemie-source6-current412-five-paired-native-whole-gates-existing287-integration-technical-20261014-v1'
T5 = B / 'chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1'
IMAGE_AUTHOR = B / 'chemie-rest6-two-original-PNG-candidates-author-20261014-v1'
VA = B / 'chemie-rest6-two-original-PNG-independent-v-a-20261014-v1'
VB = B / 'chemie-rest6-two-original-PNG-independent-v-b-20261014-v1'
PA = B / 'chemie-rest6-P2-new-images-whole-case-compatibility-independent-a-20261014-v1'
PR = B / 'chemie-rest6-P2-new-images-whole-case-compatibility-root-20261014-v1'
A = B / 'chemie-source-six-original-residual-duty-author-20261014-v1'
OA = B / 'chemie-source-six-original-residual-duty-source-P-A-M-independent-a-20261014-v1'
NORMAL_CAN = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
NORMAL_SEM = Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
NORMAL_QA = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
IDS = ['c3077d95-f3fe-5579-8493-cb92992809c4', 'e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd']
CAN = OUT / 'candidate/canonical542.current414.final-two-paired-V-resources.inactive.json'
SEM = OUT / 'candidate/semantic542.current414.same-existing-genuine-kind.closed-enum.own-address.json'
QA = OUT / 'candidate/QA.current414.preserve424-plus-two-paired-genuine-V.normal-stock.json'

def read(path):
    return json.loads(Path(path).read_text())

def rows(path):
    return [json.loads(line) for line in Path(path).read_text().splitlines() if line.strip()]

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def bind(path):
    path = Path(path)
    return {'path': str(path), 'sha256': sha(path), 'bytes': path.stat().st_size}

def dump(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def text(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value)

def main():
    assert sha(MIN / 'SEAL.finite-minimal542-prospective414-P2-kind-AM-existing-science-technical.actual.json') == '75ccce5539684f9543ebaf6d5c3432b86005e6beeace721b5432991e0d302eba'
    assert sha(VA / 'FINAL-SEAL.actual-two-PNG-independent-V-a-QA2.json') == '07fb8f8618e73f7b16993c3cae76420c6e369cc294f45a3d0ae6b4d5ed9d7103'
    assert sha(VB / 'SEAL.finite-two-original-PNG-independent-v-b.actual.json') == 'a6effde609fc465a3524c1072a802ca77b2bbef375652abb4bc4d5bede2d531c'
    assert sha(PA / 'FIRST-SCIENCE-SEAL.actual-two-PNG-whole-P2-context-independent-a.json') == '49acd2d36df876de1f5f581f146bd353695843d84e2a3aeaf6f18ff1ee1c15ea'
    before = {}
    for key, normal in [('canonical', NORMAL_CAN), ('semantic', NORMAL_SEM), ('QA', NORMAL_QA)]:
        source = H / normal
        frozen = OUT / f'before/H-I292.{key}.byte-exact.json'
        frozen.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, frozen)
        before[key] = {'hostPath': str(source), 'snapshot': bind(frozen), 'linkCountBefore': source.stat().st_nlink}
    assert before['canonical']['snapshot']['sha256'] == '0eec676ef1c12d52af04fcee501341747ebad70b360d55498006cc872fe5c2bb'
    assert before['semantic']['snapshot']['sha256'] == 'c29eceb786e35f1925bf54e42b4c27c33f24a5898b140f3193e9e5e69697459a'
    assert before['QA']['snapshot']['sha256'] == 'acbe3b2f8d8265ed7f7bf7dbb27a3ce07e1b885adc206bccc45e0630073eae2f'
    protected_measure = I292 / 'MEASURE.actual292-of412-source6-five-new-core-closures-preserved287.actual.json'
    central_config = I292 / 'config/chemie-current412-source6-five-on-existing287.inactive.config.json'
    dump(OUT / 'before/EXACT.H-I292-lease-baseline-and-central-config-preservation.json', {
        'schemaVersion': 1, 'measuredAtUTC': datetime.now(timezone.utc).isoformat(), 'host': str(H), 'normalFiles': before,
        'I292Measure': bind(protected_measure), 'I292CentralConfig': bind(central_config),
        'protected292': read(protected_measure)['strictCompleteGoalIds'], 'latestCompletedCentralCount': 292,
        'noNewCentralRunAuthorizedBeforeDualD2': True,
    })
    neutral = read(IMAGE_AUTHOR / 'NEUTRAL.exact-two-whole-goal-final-PNG-candidates-independent-V.json')
    candidate = read(MIN / 'candidate/canonical542.prospective414.on-final-source6-539.minimal-inactive.json')
    source_candidate = copy.deepcopy(candidate)
    goals = {goal['id']: goal for goal in candidate['goals']}
    for image in neutral['selectedImages']:
        goal = goals[image['goalId']]
        assert not goal['resourceLinks']
        goal['resourceLinks'] = [{
            'type': 'goal-visualization', 'resourceType': 'image', 'role': 'primary', 'skillpilotId': goal['id'],
            'title': f"Visualisierung: {goal['title']}",
            'url': f"/assets/goal-visualizations/chemie/{goal['id']}/{goal['id']}.png",
            'provider': 'OpenAI / ChatGPT-Codex built-in image_gen',
            'description': f"Visualisierung zum Lernziel: {goal['title']}.", 'altText': image['altDe'],
            'lang': 'de', 'license': 'CC-BY-4.0', 'reviewStatus': 'pilot',
        }]
    for old, current in zip(source_candidate['goals'], candidate['goals']):
        expected = copy.deepcopy(old)
        if old['id'] in IDS:
            expected['resourceLinks'] = current['resourceLinks']
        assert current == expected
    dump(CAN, candidate)
    sem = read(MIN / 'candidate/semantic542.prospective414.paired-existing-science.closed-enum.json')
    sem['ledgerId'] = 'chemie-rest6-current414-two-final-resources-existing-genuine-kinds-20261014-v1'
    sem['sourceLandscapePath'] = str(CAN)
    dump(SEM, sem)
    normal_sem = copy.deepcopy(sem)
    normal_sem['sourceLandscapePath'] = str(NORMAL_CAN)
    dump(OUT / 'candidate/semantic542.current414.same-existing-genuine-kind.normal-alias.json', normal_sem)
    qa = read(OUT / 'before/H-I292.QA.byte-exact.json')
    assert len(qa['records']) == 424
    a_rows = {row['goalId']: row for row in read(VA / 'QA2.actual-independent-V-a-KEEP.typed-delta-selection.json')['records']}
    b_rows = {row['goalId']: row for row in read(VB / 'QA.two-actual-KEEP-only.native-typed-fields.proposals.json')}
    imported = []
    for goal_id in IDS:
        a, b = a_rows[goal_id], b_rows[goal_id]
        assert a['aiApproved'] == b['aiApproved'] == 'yes' and a['aiApprovedAssetSha256'] == b['aiApprovedAssetSha256']
        row = copy.deepcopy(a)
        row['landscapePath'] = str(NORMAL_CAN)
        row['canonicalAssetPath'] = f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/{goal_id}.png'
        row['aiReviewer'] = f"{a['aiReviewer']}; {b['aiReviewer']}"
        row['aiNotes'] = f"Original actual V-A: {a['aiNotes']} Original actual V-B: {b['aiNotes']} Exact two original scientific final seals are bound in this technical packet. No new review by transporter."
        qa['records'].append(row)
        imported.append({'goalId': goal_id, 'originalA': a, 'originalB': b, 'currentTypedMergedRow': row})
    assert qa['records'][:424] == read(OUT / 'before/H-I292.QA.byte-exact.json')['records']
    dump(QA, qa)
    dump(OUT / 'QA/PROVENANCE.actual-paired-V2-only-two-added-records.json', {'schemaVersion': 1, 'existing424RowsUnchanged': True, 'selectedOriginalRecords': imported, 'newHumanReview': False, 'newVScienceByTransporter': False})
    p_original = rows(MIN / 'P/P2.original-c307-and-corrected-e5d.existing-genuine-a.technical-selection.review.jsonl')
    p_rows = copy.deepcopy(p_original)
    p_id = 'chemie-rest6-current414-two-images-whole-p-existing-a-technical-transport-20261014-v1'
    for row in p_rows:
        row['reviewId'] = p_id
    p_path = OUT / 'P/P2.current-two-images.original-genuine-a-science.technical-transport.review.jsonl'
    text(p_path, ''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in p_rows))
    criteria_path = OUT / 'P/criteria.whole-two-current-corrected-material-and-actual-image-context.md'
    criteria = (MIN / 'P/criteria.current-two-whole-designs-corrected-four-case-material.technical-transport.md').read_text()
    criteria += '\n## Actual newly reviewed image context\n\nBoth unchanged whole designs and every rubric remain required. Images are teaching support, no image-recognition-only pass. Exact independent A first-science image-context seal: ' + str(PA / 'FIRST-SCIENCE-SEAL.actual-two-PNG-whole-P2-context-independent-a.json') + '\nRoot actual image-context seal (image author, not independent V): ' + str(PR / 'SEAL.first-actual-two-image-P-context-addendum-root.json') + '\n'
    for image in neutral['selectedImages']:
        criteria += f"\n{image['goalId']} PNG {image['image']['path']} SHA256 {image['image']['sha256']}\n"
    text(criteria_path, criteria)
    p_cfg = read(MIN / 'config/P2.original-genuine-a-science.current-corrected-material.config.json')
    p_cfg.update(reviewId=p_id, landscapePath=str(CAN), semanticKindLedgerPath=str(SEM), reviewPath=str(p_path), reviewCriteriaPath=str(criteria_path))
    dump(OUT / 'configs/P2.current-final-images.original-genuine-a.config.json', p_cfg)
    old_m_cfg_path = I292 / 'config/M412.existing407-plus-genuine-five.normal-alias.config.json'
    m_cfg = read(old_m_cfg_path)
    old_m_rows = rows(m_cfg['reviewPath'])
    assert len(old_m_rows) == 412
    new_m_rows = rows(OA / 'M/two-whole-goals.genuine-independent-a.m.review.jsonl')
    for row in new_m_rows:
        row['reviewId'] = m_cfg['reviewId']
    assert all(row['status'] == 'no_memory_needed' for row in new_m_rows)
    m_path = OUT / 'M/M414.original412-plus-two-genuine-a.only-new-reviewId-carrier-transport.jsonl'
    text(m_path, ''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in old_m_rows + new_m_rows))
    m_cfg['reviewPath'] = str(m_path)
    m_cfg['reportPath'] = str(OUT / 'checks/M414.normal-stock.md')
    dump(OUT / 'configs/M414.existing412-plus-two-genuine-a.normal-alias.config.json', m_cfg)
    dump(OUT / 'M/PROVENANCE.original412-exact-two-original-science-reviewId-only.json', {
        'schemaVersion': 1, 'old412Config': bind(old_m_cfg_path), 'old412Review': bind(read(old_m_cfg_path)['reviewPath']),
        'twoGenuineOriginalRows': bind(OA / 'M/two-whole-goals.genuine-independent-a.m.review.jsonl'),
        'original412WholeRecordsIdentical': True, 'newTwoChangedFields': ['reviewId'],
        'originalReasonsDatesStatusesFingerprintsAndNoMemoryDecisionsRetained': True,
        'nineOriginalVisibilityScopesPreserved': True, 'M311AcquisitionHoldsCleared': False, 'sourceOrScopeGrant': False,
    })
    for lane in ['A', 'M']:
        for tag in ['independent-a', 'independent-root']:
            cfg = read(MIN / f'config/{lane}2.existing-genuine-{tag}.new-candidate-address-only.config.json')
            cfg['landscapePath'] = str(CAN)
            dump(OUT / f'configs/{lane}2.existing-genuine-{tag}.final-resources-address-only.config.json', cfg)
    book_cfg = read(T5 / 'configs/whole412.stock-base.config.json')
    book_cfg.update(bookId='chemie-rest6-current414-two-full-context', title='Chemie – zwei vollständige Ergänzungsziele im aktuellen Kontext',
        landscapePath=str(CAN), semanticKindLedgerPath=str(SEM), goalVisualizationQaPath=str(QA),
        evidenceReviewPaths=book_cfg['evidenceReviewPaths'] + [str(p_path)], outputPath=str(OUT / 'models/whole414.actual-stock-model.json'))
    dump(OUT / 'configs/whole414.stock-base.config.json', book_cfg)
    for name in ['native-prompt.md', 'native-criteria.md']:
        text(OUT / f'shared/{name}', (T5 / f'shared/{name}').read_text())
    batch = read(T5 / 'configs/native-five.shared-first-pass.batch.config.json')
    batch.update(batchId='chemie-rest6-current414-two-shared-first-pass-20261014-v1', bookId='chemie-rest6-current414-two-first-pass',
        title='Chemie – zwei vollständige quellengebundene Ergänzungsseiten', baseGoalBookConfigPath=str(OUT / 'configs/whole414.stock-base.config.json'),
        goalIds=IDS, outputDirectory=str(OUT / 'native-two'), promptPath=str(OUT / 'shared/native-prompt.md'),
        criteriaPath=str(OUT / 'shared/native-criteria.md'), publicRoot='app/public')
    dump(OUT / 'configs/native-two.shared-first-pass.batch.config.json', batch)
    old_goals = {goal['id']: goal for goal in read(OUT / 'before/H-I292.canonical.byte-exact.json')['goals']}
    protected = read(protected_measure)['strictCompleteGoalIds']
    assert len(protected) == 292 and all(old_goals[gid] == goals[gid] for gid in protected)
    source6_ids = read(T5 / 'configs/native-five.shared-first-pass.batch.config.json')['goalIds']
    relation_checks = []
    for gid in source6_ids:
        def relations(index):
            return {'parents': sorted(g['id'] for g in index.values() if gid in g.get('contains', [])),
                    'reverseRequires': sorted(g['id'] for g in index.values() if gid in g.get('requires', [])),
                    'requires': index[gid].get('requires', []), 'contains': index[gid].get('contains', [])}
        assert old_goals[gid] == goals[gid] and relations(old_goals) == relations(goals)
        relation_checks.append({'goalId': gid, 'wholeGoalAndResourcesUnchanged': True, 'oldImmediateRelations': relations(old_goals), 'currentImmediateRelations': relations(goals)})
    dump(OUT / 'checks/PRESERVATION.actual292-whole-goals-five-Source6-immediate-context-and-ancestor-root-delta.no-old-D-rehash.json', {
        'schemaVersion': 1, 'all292WholeGoalsAndResourcesExactlyPreserved': True, 'protected292': protected,
        'source6FiveActualWholeAndImmediateRelationComparisons': relation_checks,
        'rootWholeObjectChanged': {'goalId': '442c31c5-c561-5c7a-90bb-2335d779175c', 'onlyDelta': 'append d11fc507 to contains', 'rawWeightStill': 1.2},
        'allAncestorsOrOldDInputsClaimedWholeByteIdentical': False, 'oldDIndexesOrRunsOrRecordsRewritten': 0,
        'noHashRefreshOrNewReviewForProtected292': True, 'noNewCentralResult': True,
    })
    source_inputs = read(A / 'INPUTS.whole-original-six-and-primary-course-contexts.actual.json')
    full_cases = read(neutral['wholeCorrectedFourCaseMaterials']['path'])
    dump(OUT / 'companions/COMPLETE.two-current-whole-goals-four-full-DEEN-cases-and-profiles.json', {
        'schemaVersion': 1, 'wholeCurrentGoals': [goals[gid] for gid in IDS], 'wholeCurrentFourCaseCarrier': full_cases,
        'wholeCurrentProfiles': p_rows, 'originalGoalTaskProfileAndRubricScienceUnchanged': True,
        'PInputFingerprintsSetByStockHelperAfterActualImageContextScience': True,
    })
    primary_rows = source_inputs['firstAuthorPrimaryBindings']['originalPrimaries']
    selected_primaries = [row for row in primary_rows if any('/' + state + '/' in row['path'] for state in ['BB', 'BE', 'SN'])]
    selected_texts = [row for row in source_inputs['fullPrimaryContextTextBindings'] if any(term in row['path'] for term in ['Teil_C_RLP_GOST_2022', 'sachsen-2025'])]
    dump(OUT / 'companions/COMPLETE.original-source-cells-course-contexts-unactivated-unions-and-held-scope.json', {
        'schemaVersion': 1, 'dataRoleOnlyNotApprovalOracle': True,
        'wholeOriginalSixBaseline': read(A / 'inputs/whole-six-original-source-baseline.exact.json'),
        'wholeSourceCASProposalsSevenComponentsNotApplied': read(A / 'CAS.six-whole-source-cells-five-carriers-and-one-parent-literal-restoration.author-only.json'),
        'originalAuthorityPDFs': selected_primaries, 'fullPrimaryLayoutTextBindings': selected_texts,
        'sourceCourseFrames': {'BB_BE': source_inputs['firstAuthorPrimaryBindings']['fullRelevantSectionsRead']['BB_BE'], 'SN': source_inputs['firstAuthorPrimaryBindings']['fullRelevantSectionsRead']['SN']},
        'all542WholeContext': bind(CAN), 'c307Exact52UnresolvedAcquisition': bind(A / 'HOLD.BB-BE-c307-exact52-current-ordinary-acquisition-goals.no-blanket-scope-grant.json'),
        'scopeLimits': ['BB/BE c307 LK elementary mechanism only; no GK, physical synthesis or unique real pathway grant', 'SN e5d introductory supplied-material duty; mandatory parent retained, right-column recommendations remain recommendation', 'No operative source-view/carrier adoption; old52 acquisition holds remain', 'Old d2 practical goal/Source7 historical votes are not newly cleared by this D2 preparation'],
    })
    print(json.dumps({'prepared': str(OUT), 'nodes': len(candidate['goals']), 'kindAtomic': sem['counts']['curricularAtomic'], 'QA': len(qa['records']), 'MRows': len(old_m_rows + new_m_rows), 'protectedWholeObjects': len(protected), 'Hmutated': False}))

if __name__ == '__main__':
    main()
