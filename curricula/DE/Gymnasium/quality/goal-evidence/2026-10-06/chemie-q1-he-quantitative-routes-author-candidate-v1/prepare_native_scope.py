# SPDX-License-Identifier: Apache-2.0
"""Seed an ignored native read-only-input isolate for the inactive candidate."""
from pathlib import Path
import hashlib
import json
import os
import shutil

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
ISOLATE = ROOT / 'tmp/chemie-q1-he-quantitative-routes-author-20261006-v1-native-scope'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

rows = []
def seed(source, target_relative=None, link=True):
    target_relative = target_relative or str(source.relative_to(ROOT))
    target = ISOLATE / target_relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        assert sha(target) == sha(source), target
        return
    if link:
        os.link(source, target)
    else:
        shutil.copy2(source, target)
    rows.append({'path': target_relative, 'sourcePath': str(source.relative_to(ROOT)), 'sha256': sha(source), 'bytes': source.stat().st_size, 'sharedReadOnlyInput': link})

assert not ISOLATE.exists(), 'Use a new isolate version rather than mutate an earlier result'
for source in (ROOT / 'curricula/DE/Gymnasium/canonical').glob('*.json'):
    if str(source.relative_to(ROOT)) != CANON:
        seed(source)
for source in (ROOT / 'curricula/DE').rglob('*.json'):
    if 'mapping' in source.parts and 'quality' not in source.parts:
        seed(source)
for name in ['source-landscape-registry.json', 'canonical-goal-provenance-registry.json', 'canonical-goal-applicability-override-registry.json']:
    seed(ROOT / 'curricula/DE/Gymnasium/provenance' / name)
registry = json.loads((ROOT / 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json').read_text())
for entry in registry['entries']:
    for key in ['sourcePath', 'archivePath']:
        relative = entry.get(key)
        if isinstance(relative, str) and relative.endswith('.json') and (ROOT / relative).exists():
            seed(ROOT / relative)
review_dir = ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review'
for source in review_dir.glob('*.config.json'):
    seed(source)
    config = json.loads(source.read_text())
    if isinstance(config.get('reviewPath'), str):
        seed(ROOT / config['reviewPath'])
for relative in ['app/scripts/applicabilityCompiler.ts', 'app/src/utils/jurisdictionMetadata.ts']:
    seed(ROOT / relative, link=False)
seed(OLD / 'prospective-input-tree' / CANON, CANON, link=False)
plan = json.loads((OLD / 'guarded-apply-plan.json').read_text())
overlays = []
for row in plan['writes']:
    target = row['targetPath']
    if target.startswith('curricula/') and target.endswith('.json') and 'quality' not in Path(target).parts and target != CANON:
        destination = ISOLATE / target
        if destination.exists():
            destination.unlink()  # Only isolate links, never original input bytes.
        seed(ROOT / row['sourcePath'], target, link=False)
        overlays.append(target)
manifest = {'schemaVersion': 1, 'documentType': 'inactive-native-scope-input-receipt', 'nativeRoot': str(ISOLATE.relative_to(ROOT)), 'sourceCanonicalSHA256': sha(ISOLATE / CANON), 'operativeMappingDiscovery': 'physical mapping directories outside quality, matching the current status generator; no historical/candidate mapping copies are operative', 'historicalReviewedCandidateOverlays': overlays, 'inputRows': rows, 'activeWrites': False, 'humanApproval': False, 'fullQualityStatusOrBuildRun': False}
(OWN / 'native-scope-inputs.actual.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Seeded {len(rows)} exact inputs in ignored native isolate; source and live bytes remain read-only.')
