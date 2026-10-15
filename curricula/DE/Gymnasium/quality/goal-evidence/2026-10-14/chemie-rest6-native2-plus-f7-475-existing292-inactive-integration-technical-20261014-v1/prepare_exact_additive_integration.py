# SPDX-License-Identifier: Apache-2.0
"""Only exact paired native2 and genuine additive f7/475 selections on I292."""
import copy
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

B = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
OUT = B / 'chemie-rest6-native2-plus-f7-475-existing292-inactive-integration-technical-20261014-v1'
T = B / 'chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v2'
T1 = B / 'chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v1'
DA = B / 'chemie-rest6-current414-native-two-whole-description-independent-a-20261014-v1'
DB = B / 'chemie-rest6-current414-native-two-description-independent-b-root-20261014-v2'
R = B / 'chemie-f7-475-original-D11-D15-whole-container-current-selection-retention-technical-20261014-v1'
I292 = B / 'chemie-source6-current412-five-paired-native-whole-gates-existing287-integration-technical-20261014-v1'
H = Path('tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host')
NORMAL_CAN = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
NORMAL_SEM = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
IDS = ['c3077d95-f3fe-5579-8493-cb92992809c4', 'e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd']

def read(p):
    return json.loads(Path(p).read_text())

def sha(p):
    return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()

def binding(p):
    p = Path(p)
    return {'path': str(p), 'sha256': sha(p), 'bytes': p.stat().st_size}

def dump(p, x):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')

def ensure_host_file(p):
    p = Path(p)
    assert p.is_file(), p
    target = H / p
    if target.exists():
        assert sha(target) == sha(p), ('existing H file differs; do not overwrite', p)
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        os.link(p, target)

def main():
    seals = [
        (T / 'SEAL.finite-current414-two-prompt-corrected-native-FIRST_PASS-v2.stock-PASS.actual.json', '29404c5c9ac12ee9577a394ae30fd0ffe43192d53871f5f41fd20c1a13dc8817'),
        (DA / 'SEAL.finite-current414-native-two-genuine-independent-a-original-round-a.stock-PASS.actual.json', 'a75af03946f701683c72be7342b6f54b82f4efeeadc04cce7122c994236c034c'),
        (DB / 'SEAL.finite-current414-original-two-native-D-B-root.stock-PASS.json', 'a0fb1cd98a0947cf57f98978d0655f660b823225f95e84ecbb79035428c1b824'),
        (R / 'SEAL.finite-original-D11-D15-normal-retention-only-f7-475-current-selection.actual.json', 'd3528174557ecccacbea405406f8b6580b925df525ad41bf33793403cadf4e77'),
    ]
    for p, expected in seals:
        assert sha(p) == 'sha256:' + expected
    source_native = T / 'native-two'
    target_native = OUT / 'native-two'
    for source in source_native.rglob('*'):
        if source.is_file() and source.name != 'batch-manifest.json':
            target = target_native / source.relative_to(source_native)
            target.parent.mkdir(parents=True, exist_ok=True)
            os.link(source, target)
    config_source = T / 'configs/native-two.shared-first-pass.batch.config.json'
    config = read(config_source)
    original_config = copy.deepcopy(config)
    config['outputDirectory'] = str(target_native)
    config_path = OUT / 'config/native-two.original-common-v2.materialization-address-only.config.json'
    dump(config_path, config)
    old_manifest = read(source_native / 'batch-manifest.json')
    manifest = copy.deepcopy(old_manifest)
    manifest['configPath'] = str(config_path)
    manifest['configDigest'] = sha(config_path)
    dump(target_native / 'batch-manifest.json', manifest)
    for name, source_root in [('round-a', DA / 'results'), ('round-b', DB / 'round-b/results')]:
        result_dir = target_native / name / 'results'
        result_dir.mkdir(parents=True, exist_ok=True)
        for source in source_root.iterdir():
            if source.is_file():
                os.link(source, result_dir / source.name)
        records_file = next(result_dir.glob('*.records.jsonl'))
        records = [json.loads(line) for line in records_file.read_text().splitlines() if line.strip()]
        assert [record['goalId'] for record in records] == IDS
        assert all(record['decision'] == 'keep' and record['evidenceProfileRecommendation'] == 'none' for record in records)
    (target_native / 'resolutions').mkdir(exist_ok=True)
    authoring = {
        'schemaVersion': 1, 'manifestId': 'chemie-rest6-current414-two-original-independent-paired-technical-synthesis-20261014-v1',
        'synthesizedBy': 'Codex normal technical synthesis of actual first-sealed native D2 A/B; no new scientific vote',
        'decisions': [{
            'goalId': goal_id, 'resolutionDecision': 'keep_current', 'evidenceRound': 'first',
            'rationaleDe': 'Beide tatsächlichen unabhängigen Ersturteile KEEP/none betreffen exakt dasselbe vollständige aktuelle DE/EN-/Seiten-/P-/Bild-/Kontexttuple des korrigierten Commonv2. Die eigenständigen Verständnisformulierungen bleiben in beiden Originalrecords erhalten; diese normale Synthese wählt die erste Evidenzkette, ohne eine neue Fachstimme oder Quellen-/Kurs-/M6-/Humanfreigabe zu erfinden.',
            'rationaleEn': 'Both actual independently first-sealed KEEP/none judgments concern exactly the same whole current bilingual/page/profile/image/context tuple of corrected Commonv2. The independent understanding formulations remain in both original records; this normal synthesis selects the first evidence chain without inventing another scientific vote or source/course/M6/human approval.',
        } for goal_id in IDS],
    }
    dump(target_native / 'synthesis-authoring.json', authoring)
    provenance = {
        'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
        'actualOriginalScientificSeals': [binding(p) for p, _ in seals],
        'originalCommonConfig': binding(config_source), 'materializationOnlyConfig': binding(config_path),
        'configWholeFieldsDifferent': [key for key in config if config[key] != original_config[key]],
        'batchManifestTechnicalAddressFieldsOnly': ['configPath', 'configDigest'],
        'originalCampaignInputPromptCriteriaBookGoalPageRecordRunMetadataUnchanged': True,
        'sourceNativeOriginalBatchManifest': binding(source_native / 'batch-manifest.json'),
        'newMaterializationBatchManifest': binding(target_native / 'batch-manifest.json'),
        'noOriginalCommonOrReviewFileWritten': True, 'newScientificVotesBySynthesis': 0,
    }
    assert provenance['configWholeFieldsDifferent'] == ['outputDirectory']
    dump(OUT / 'PROVENANCE.exact-native2-original-science-and-only-materialization-address-CAS.json', provenance)
    base_path = I292 / 'config/chemie-current412-source6-five-on-existing287.inactive.config.json'
    base = read(base_path)
    assert sha(base_path) == 'sha256:bb45a5bf12e2f6fd26ffa602ea3ac6baa745069d15693f481db25b67364fbe4f'
    central = copy.deepcopy(base)
    central['reportId'] = 'chemie-current414-rest2-native2-and-f7-475-existing292-inactive-20261014-v1'
    subject = next(s for s in central['subjects'] if s['subject'] == 'chemie')
    old_subject = next(s for s in base['subjects'] if s['subject'] == 'chemie')
    assert len(subject['resolutionSupersessions']) == 131 and len(subject['resolutionWithdrawals']) == 1
    cas = read(R / 'CAS.exact-D11-D15-full-originals-only-f7-475-current-selection.ADDITIVE-NOT-APPLIED.json')
    # Two new current whole goals, exact normal-source aliases only.
    p2 = read(T1 / 'configs/P2.current-final-images.original-genuine-a.config.json')
    p2['landscapePath'] = NORMAL_CAN
    p2['semanticKindLedgerPath'] = NORMAL_SEM
    p2_path = OUT / 'config/P2.actual-final-material-images.original-a.normal-alias.config.json'
    dump(p2_path, p2)
    a2 = read(T1 / 'configs/A2.existing-genuine-independent-a.final-resources-address-only.config.json')
    a2['landscapePath'] = NORMAL_CAN
    a2_path = OUT / 'config/A2.original-genuine-a.normal-alias.config.json'
    dump(a2_path, a2)
    subject['resolutionIndexPaths'].append(str(target_native / 'resolution-index.json'))
    subject['semanticAtomicityConfigPaths'].append(str(a2_path))
    subject['positiveEvidenceConfigPaths'].append(str(p2_path))
    subject['memoryReviewConfigPath'] = str(T1 / 'configs/M414.existing412-plus-two-genuine-a.normal-alias.config.json')
    # Apply only the explicit append arrays to the new414 selection; never copy
    # the retention packet's old whole412 central-config candidate.
    for key, values in cas['append'].items():
        assert key in ['resolutionIndexPaths', 'resolutionSupersessions', 'resolutionWithdrawals', 'semanticAtomicityConfigPaths', 'positiveEvidenceConfigPaths']
        for value in values:
            assert value not in subject[key], (key, value)
            subject[key].append(value)
    assert subject['resolutionSupersessions'][:131] == old_subject['resolutionSupersessions']
    assert subject['resolutionWithdrawals'][:1] == old_subject['resolutionWithdrawals']
    assert len(subject['resolutionSupersessions']) == 149 and len(subject['resolutionWithdrawals']) == 5
    for key in ['resolutionIndexPaths', 'semanticAtomicityConfigPaths', 'positiveEvidenceConfigPaths']:
        assert subject[key][:len(old_subject[key])] == old_subject[key]
    central_path = OUT / 'config/chemie-current414-rest2-native2-and-f7-475-on-existing292.inactive.config.json'
    dump(central_path, central)
    dump(OUT / 'CAS.additive-I292-selection-to-current414-no-source-or-active-adoption.json', {
        'schemaVersion': 1, 'baseConfig': binding(base_path), 'current414Config': binding(central_path),
        'prior292AllDPASelectionsAnd131EdgesAndOneWithdrawalPreserved': True,
        'native2Index': str(target_native / 'resolution-index.json'),
        'twoNewAtomA2P2NormalAliases': [binding(a2_path), binding(p2_path)],
        'memory414Preserved': subject['memoryReviewConfigPath'], 'QA426NormalAliasPreserved': subject['visualizationQaPath'],
        'exactRetentionAppend': cas['append'], 'normalNative414BaseAlreadyInstalled': True,
        'oldWhole412RetentionConfigCopied': False, 'centralRunPerformed': False,
        'hypotheticalFourExtraClosuresNotMeasured': True,
    })
    old_goals = {g['id']: g for g in read(T1 / 'before/H-I292.canonical.byte-exact.json')['goals']}
    current_goals = {g['id']: g for g in read(H / NORMAL_CAN)['goals']}
    protected = read(I292 / 'MEASURE.actual292-of412-source6-five-new-core-closures-preserved287.actual.json')['strictCompleteGoalIds']
    assert all(old_goals[gid] == current_goals[gid] for gid in protected)
    changes = []
    for gid in protected:
        old_reverse = sorted(g['id'] for g in old_goals.values() if gid in g.get('requires', []))
        current_reverse = sorted(g['id'] for g in current_goals.values() if gid in g.get('requires', []))
        if old_reverse != current_reverse:
            changes.append({'goalId': gid, 'wholeOldGoal': old_goals[gid], 'wholeCurrentGoal': current_goals[gid], 'oldReverseConsumers': old_reverse, 'currentReverseConsumers': current_reverse, 'addedConsumerWholeGoals': [current_goals[i] for i in set(current_reverse) - set(old_reverse)], 'oldGoalDutyOrOwnPrerequisitesChanged': False})
    assert [row['goalId'] for row in changes] == ['d4928773-3be8-5cf1-907c-ef07c96751e8']
    dump(OUT / 'checks/BOUNDARY.one-existing-prerequisite-new-reverse-consumer.whole-duty-preserved.no-old-D-rehash.json', {
        'schemaVersion': 1, 'old292WholeGoalsExactlyUnchanged': True, 'actualChangedReverseRelations': changes,
        'newConsumerDoesNotCreateNewMasteryDutyInOldD492': True, 'oldDRecordsRunManifestsOrIndicesRehashed': False,
        'sourceOrAcquisitionHoldsCleared': False,
    })
    # Retention packet is already finite and small; only its direct chemistry
    # files are staged, plus exact referenced P/A science streams if absent.
    for source in R.rglob('*'):
        if source.is_file():
            ensure_host_file(source)
    for config_file in [a2_path, p2_path] + [Path(p) for p in cas['append']['semanticAtomicityConfigPaths'] + cas['append']['positiveEvidenceConfigPaths']]:
        cfg = read(config_file)
        for key in ['reviewPath', 'reviewCriteriaPath', 'cardReviewPath']:
            if isinstance(cfg.get(key), str):
                ensure_host_file(cfg[key])
    for source in OUT.rglob('*'):
        if source.is_file():
            ensure_host_file(source)
    print(json.dumps({'prepared': str(OUT), 'originalNativeRecordsExact': 4, 'native2WholeCurrentBindingsUnchanged': True, 'supersessionEdges': 149, 'withdrawals': 5, 'M414Preserved': True, 'QA426Preserved': True, 'centralRun': False}))

if __name__ == '__main__':
    main()
