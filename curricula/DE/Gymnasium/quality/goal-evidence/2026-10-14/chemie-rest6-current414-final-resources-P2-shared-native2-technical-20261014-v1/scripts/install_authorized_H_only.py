# SPDX-License-Identifier: Apache-2.0
"""Exclusive temporary H lease, exact finite chemistry dependencies only."""
import importlib.util
import json
import os
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO = Path.cwd()
B = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
OUT = B / 'chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v1'
spec = importlib.util.spec_from_file_location('prep', REPO / OUT / 'scripts/prepare_exact_two.py')
prep = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = prep
spec.loader.exec_module(prep)
H = prep.H

def exact_copy(source, target):
    source, target = Path(source), Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_name(target.name + '.rest6-detached-write')
    assert not tmp.exists()
    shutil.copyfile(source, tmp)
    os.replace(tmp, target)
    assert prep.sha(source) == prep.sha(target)

def ensure_dependency(relative):
    relative = Path(relative)
    source, target = REPO / relative, H / relative
    assert source.is_file(), source
    if target.exists():
        assert prep.sha(source) == prep.sha(target), ('existing dependency mismatch, do not overwrite', relative)
        return {'path': str(relative), 'sha256': prep.sha(source), 'action': 'existing_exact_readonly'}
    target.parent.mkdir(parents=True, exist_ok=True)
    os.link(source, target)
    return {'path': str(relative), 'sha256': prep.sha(source), 'action': 'new_exact_immutable_hardlink'}

def main():
    before = prep.read(OUT / 'before/EXACT.H-I292-lease-baseline-and-central-config-preservation.json')
    for value in before['normalFiles'].values():
        assert prep.sha(value['hostPath']) == value['snapshot']['sha256'], ('lease baseline changed', value)
    neutral = prep.read(prep.IMAGE_AUTHOR / 'NEUTRAL.exact-two-whole-goal-final-PNG-candidates-independent-V.json')
    asset_rows = []
    for image in neutral['selectedImages']:
        gid = image['goalId']
        for key, name in [('image', f'{gid}.png'), ('prompt', 'prompt.de.md'), ('reconstruction', 'image-reconstruction-prompt.de.md'), ('provenance', 'provenance.json')]:
            source = Path(image[key]['path'])
            assert prep.sha(source) == image[key]['sha256'].removeprefix('sha256:')
            relative = Path('curricula/DE/Gymnasium/visualizations/chemie') / gid / name
            target = H / relative
            assert not target.exists(), ('unexpected existing Rest6 asset', target)
            exact_copy(source, target)
            asset_rows.append({'source': prep.bind(source), 'hostTarget': str(relative), 'sha256': prep.sha(target)})
        source = Path(image['image']['path'])
        public_relative = Path('app/public/assets/goal-visualizations/chemie') / gid / f'{gid}.png'
        target = H / public_relative
        assert not target.exists()
        exact_copy(source, target)
        asset_rows.append({'source': prep.bind(source), 'hostTarget': str(public_relative), 'sha256': prep.sha(target)})
        portable = OUT / 'public-root/assets/goal-visualizations/chemie' / gid / f'{gid}.png'
        portable.parent.mkdir(parents=True, exist_ok=True)
        os.link(source, portable)
    dependencies = []
    configs = [prep.read(p) for p in (OUT / 'configs').glob('*.json')]
    for config in configs:
        for key in ['reviewPath', 'cardReviewPath', 'compositionViewPath']:
            if isinstance(config.get(key), str):
                path = config[key]
                if not path.startswith(str(OUT)):
                    dependencies.append(ensure_dependency(path))
        for path in config.get('evidenceReviewPaths', []):
            if not path.startswith(str(OUT)):
                dependencies.append(ensure_dependency(path))
        for scope in config.get('visibilityScopes', []):
            dependencies.append(ensure_dependency(scope['viewPath']))
    # New scoped candidate/config/M/P/criteria files only; no historical tree copy.
    installed = []
    for source in sorted(OUT.rglob('*')):
        if source.is_file():
            target = H / source
            assert not target.exists(), target
            target.parent.mkdir(parents=True, exist_ok=True)
            os.link(REPO / source, target)
            installed.append({'path': str(source), 'sha256': prep.sha(source)})
    # Atomic replacement detaches each normal H alias before mutation. Main repo
    # and original I292 snapshots/configs are never written.
    for source, relative in [
        (prep.CAN, prep.NORMAL_CAN),
        (OUT / 'candidate/semantic542.current414.same-existing-genuine-kind.normal-alias.json', prep.NORMAL_SEM),
        (prep.QA, prep.NORMAL_QA),
    ]:
        exact_copy(source, H / relative)
    canonical = prep.read(prep.CAN)
    qa = prep.read(prep.QA)
    qa_by_id = {row['goalId']: row for row in qa['records']}
    selected = []
    failures = []
    for goal in canonical['goals']:
        for link in goal.get('resourceLinks', []):
            if link.get('type') != 'goal-visualization':
                continue
            row = qa_by_id.get(goal['id'])
            if not row or row.get('imageUrl') != link['url']:
                failures.append({'goalId': goal['id'], 'reason': 'missing matching selected QA row'})
                continue
            canonical_asset = H / row['canonicalAssetPath']
            public_asset = H / row['publicAssetPath']
            url_asset = H / 'app/public' / link['url'].lstrip('/')
            expected = row['assetSha256'].removeprefix('sha256:')
            if row.get('aiApproved') == 'yes' and row.get('aiApprovedAssetSha256', '').removeprefix('sha256:') != expected:
                failures.append({'goalId': goal['id'], 'reason': 'QA approved and actual asset SHA disagree'})
            actuals = {str(path.relative_to(H)): prep.sha(path) if path.is_file() else None for path in [canonical_asset, public_asset, url_asset]}
            if any(value != expected for value in actuals.values()):
                failures.append({'goalId': goal['id'], 'reason': 'canonical/public/url selected bytes mismatch or absent', 'expected': expected, 'actual': actuals})
            selected.append({'goalId': goal['id'], 'expectedActualAndApprovedIfApprovedSHA256': expected, 'actualPaths': actuals, 'AIStatusUnchanged': row.get('aiApproved')})
    assert not failures, failures
    for key in ['I292Measure', 'I292CentralConfig']:
        value = before[key]
        assert prep.sha(value['path']) == value['sha256']
        if (H / value['path']).exists():
            assert prep.sha(H / value['path']) == value['sha256']
    module_rows = []
    for module in ['goalBookModel.ts', 'positiveGoalEvidenceReview.ts', 'positiveGoalEvidenceProfileModel.ts', 'semanticAtomicityReview.ts', 'memoryCardReview.ts', 'materializeGoalDescriptionRolloutBatch.ts', 'goalBookRenderer.ts']:
        path = Path('app/scripts') / module
        assert prep.sha(path) == prep.sha(H / path), ('modified Stock module', path)
        module_rows.append(prep.bind(path))
    prep.dump(OUT / 'checks/APPLIED.exclusive-H-two-resource-only-426-QA-and-414-M-preparation.actual.json', {
        'schemaVersion': 1, 'completedAtUTC': datetime.now(timezone.utc).isoformat(), 'explicitTemporaryHLease': True,
        'host': str(H), 'assetImports': asset_rows, 'onlyNecessaryDirectDependencies': dependencies,
        'scopedImmutablePacketFilesInstalled': installed, 'normalAliasesDetachedBeforeWrite': True,
        'all292WholeGoalPayloadsAndI292ConfigReportMeasurePreserved': True,
        'normalStockModulesUnmodified': module_rows, 'noSourceViewsCarriersDIndexesActiveOrGitWrites': True,
    })
    prep.dump(OUT / 'checks/PREFLIGHT.all-current-selected-QA-canonical-and-public-aliases-against-same-approved-bytes.actual.json', {
        'schemaVersion': 1, 'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'status': 'PASS',
        'selectedCurrentResourceRowsChecked': len(selected), 'rows': selected, 'failures': failures,
        'allSelectedCanonicalAndPublicAliasExistenceAndSHAsActuallyVerified': True,
        'heldAIStatusesNotConvertedToApproval': True, 'beforeAnyCentralRun': True,
    })
    print(json.dumps({'status': 'PASS', 'HOnlyAssetImports': len(asset_rows), 'normalAliasesDetached': 3, 'QARecords': len(qa['records']), 'currentSelectedResourceRowsActuallyByteChecked': len(selected), 'centralRun': False}))

if __name__ == '__main__':
    main()
