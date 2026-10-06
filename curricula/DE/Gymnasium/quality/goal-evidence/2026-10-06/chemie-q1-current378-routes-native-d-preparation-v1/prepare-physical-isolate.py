from pathlib import Path
import hashlib, json, shutil, os, datetime

ROOT = Path('/home/enpasos/projects/skillpilot')
REL = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1')
OWN = ROOT / REL
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
ROUTE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
V2 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-controls-author-remediation-v2'
ISO = ROOT / 'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
SEED = ROOT / 'tmp/chemie-q1-he-quantitative-routes-author-20261006-v1-native-scope'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
def copy(rel):
    src, dst = ROOT / rel, ISO / rel
    if src.is_dir(): shutil.copytree(src, dst, dirs_exist_ok=True)
    else:
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

assert not ISO.exists(), 'Fresh physical isolate must not already exist'
verified = []
for base, name, expected, relative in [(OLD, 'reviewed-integration.final.freeze.json', 407, False), (ROUTE, 'author-candidate.final.freeze.json', 35, False), (V2, 'author-controls-remediation.final.freeze.json', 5, True)]:
    freeze = base / name
    obj = json.loads(freeze.read_text())
    assert len(obj['files']) == expected
    for f in obj['files']:
        path = (base if relative else ROOT) / f['path']
        assert sha(path) == f['sha256'].removeprefix('sha256:'), path
        assert path.stat().st_size == f['bytes'], path
    verified.append({'path': str(freeze.relative_to(ROOT)), 'sha256': sha(freeze), 'verifiedFileCount': expected})

# copytree copies file bytes. The old seed has hardlinks; none are retained here.
shutil.copytree(SEED, ISO)
for rel in ['app/scripts', 'app/src', 'contracts', 'scripts', 'curricula/DE/Gymnasium/canonical', 'curricula/DE/Gymnasium/provenance', 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views', 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json', 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json', 'app/package.json', 'package.json']:
    if (ROOT / rel).exists(): copy(rel)

# Reset all mapping lanes to the actual current tree for the fresh 376 baseline.
for p in (ROOT / 'curricula/DE').rglob('*mapping*.json'):
    if '/quality/' not in str(p): copy(p.relative_to(ROOT))

atlas_cfg = json.loads((ROOT / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json').read_text())
for f in atlas_cfg['sourceDocumentSnapshots']: copy(f['path'])
for f in atlas_cfg['mappingPaths'] + atlas_cfg.get('fallbackViewPaths', []): copy(f)
qa = json.loads((ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json').read_text())
for row in qa['records']:
    path = row.get('publicAssetPath')
    if path and (ROOT / path).is_file(): copy(path)

# Plan targets, including exact deletions, must start at live current bytes.
plan = json.loads((OLD / 'guarded-apply-plan.json').read_text())
for row in plan['writes'] + plan['deletes']:
    target = row['targetPath']
    actual = ROOT / target
    expected = row.get('beforeSHA256')
    assert (sha(actual) if actual.is_file() else None) == expected, f'Current before guard changed: {target}'
    if actual.is_file(): copy(target)
    elif (ISO / target).exists(): (ISO / target).unlink()

node_modules = ISO / 'app/node_modules'
assert not node_modules.exists()
node_modules.symlink_to(ROOT / 'app/node_modules', target_is_directory=True)

# Keep config identity and model paths stable, but all outputs are in this new scope.
cfg = json.loads((OLD / 'full-current.metadata-corrected.config.json').read_text())
cfg['outputPath'] = str(REL / 'native-models/full-current376.book-model.json')
write(ISO / REL / 'full-current376.config.json', cfg)
cfg['outputPath'] = str(REL / 'native-models/full-current378-routes-v2.book-model.json')
write(ISO / REL / 'full-current378-routes-v2.config.json', cfg)

shared = []
for p in ISO.rglob('*'):
    if not p.is_file() or p.is_symlink(): continue
    rel = p.relative_to(ISO)
    for origin in [ROOT / rel, SEED / rel]:
        if origin.is_file() and os.path.samestat(p.stat(), origin.stat()): shared.append(str(rel))
assert not shared, shared[:10]
receipt = {'schemaVersion': 1, 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'isolatePath': str(ISO), 'seedReadOnlyPath': str(SEED), 'verifiedAuthorFreezes': verified, 'allRegularFilesPhysicallyCopied': True, 'mutableFileInodeSharingWithLiveOrSeed': shared, 'onlyDependencySymlink': str(node_modules), 'baselineCanonicalSHA256': sha(ISO / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'), 'nativeCodeCopiedUnchanged': ['app/scripts', 'app/src', 'contracts', 'scripts'], 'guardedPlanWrites': len(plan['writes']), 'guardedPlanDeletes': len(plan['deletes']), 'activeWrites': False, 'scienceReviewDecision': None, 'humanApproval': False}
write(OWN / 'physical-base-isolation.actual.receipt.json', receipt)
print(json.dumps({'isolatePath': str(ISO), 'verifiedFiles': [407,35,5], 'beforeGuards': len(plan['writes'])+len(plan['deletes']), 'sharedMutableFiles': len(shared)}))
