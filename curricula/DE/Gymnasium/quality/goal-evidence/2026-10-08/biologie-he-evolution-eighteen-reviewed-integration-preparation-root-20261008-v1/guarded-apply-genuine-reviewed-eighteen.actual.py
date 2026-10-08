# SPDX-License-Identifier: Apache-2.0
"""Adopt only genuine reviewed current evolution inputs; preserve old artifacts."""
from pathlib import Path
import datetime
import hashlib
import json
import shutil

ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file() and (p / 'app').is_dir())
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
AUTHOR = BASE / 'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1'
CORRECTED = BASE / 'biologie-he-evolution-one-cat-raster-native-followup-technical-20261008-v2'

def read(p):
    return json.loads(p.read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, data):
    if p.exists():
        assert read(p) == data, ('immutable output would change', str(p))
        return
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}

def verify_file(b):
    p = ROOT / b['path']
    assert p.is_file(), ('missing input', b['path'])
    assert sha(p) == b['sha256'].removeprefix('sha256:'), ('changed input', b['path'])
    if 'bytes' in b:
        assert p.stat().st_size == b['bytes']
    return p

SEALS = [
    ('biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1/eighteen-current204-raster-native-author.first-input.freeze.json', '9cc7c31975a3ede287fb4ec0350c7f2f4a75bf44b9445df31a264b5195d59680', ['ownFiles', 'authorizedInactiveAtlasFiles']),
    ('biologie-he-evolution-eighteen-final-raster-native-independent-a-20261008-v1/completed-original-eighteen-native-D-P-V.independent-a.final.freeze.json', '4f38e4f8b9e5bae08d2b618e22357d7d95d0d7c46b0d4f933149546d69261ad3', ['ownFiles']),
    ('biologie-he-evolution-eighteen-final-raster-native-independent-b-20261008-v1/eighteen-current-D-P-V-independent-b.completed-with-one-HOLD.final.freeze.json', '2f2d6f6c4fe399beb21eb0465c5b8e271b1fef805aab1bf195552b144a90ef93', ['files']),
    ('biologie-he-evolution-one-cat-anatomy-targeted-independent-a-20261008-v2/completed-current-one-D-P-V-and-required-P18-bindings.independent-a.final.freeze.json', 'b0c63d0d02f54609e41b4de499d1f8b3a7d3b14e6da257d0662f3040a98830a0', ['ownFiles']),
    ('biologie-he-evolution-one-cat-raster-native-independent-b-targeted-20261008-v2/one-current-D-P-V-independent-b.completed.final.freeze.json', '186ca8e358ab784490210310052f96bad34f9ab37cfdd74568d90d8243021379', ['files']),
    ('biologie-he-evolution-eighteen-required-link-metadata-P18-independent-b-20261008-v1/targeted-technical-metadata-P18.independent-b.completed.freeze.json', '071f87854d6e52864fc6eb3588d80ae13e10f8b843ced8dd0af26997e270aa2a', ['files']),
    ('biologie-he-evolution-eighteen-decision-locators-independent-a-20261008-v3/independent-a.decision-locators-v3.final.freeze.json', 'd2da6ffcf26a9f3faefeb09590e59748cce12fb1554b2ae5da655a952368de3d', ['ownFiles']),
    ('biologie-he-evolution-eighteen-decision-locators-independent-b-20261008-v3/eighteen-source-v3-independent-b.final-portable.freeze.json', 'b78017bdcda64e4670d38595d10a89c88cdcf4f8bef5599897b0f26b57855bc1', ['ownFiles']),
]
verified = []
for path, expected, keys in SEALS:
    p = BASE / path
    assert sha(p) == expected, ('changed seal', path)
    s = read(p)
    actual_keys = [k for k in keys if k in s]
    if not actual_keys:
        actual_keys = [k for k in ['files', 'ownFiles', 'frozenFiles'] if isinstance(s.get(k), list)]
    assert actual_keys, ('unknown sealed file layout', path)
    count = 0
    for k in actual_keys:
        for b in s[k]:
            if 'path' not in b and 'relativePath' in b:
                b = {**b, 'path': str((p.parent / b['relativePath']).relative_to(ROOT))}
            elif path.startswith('biologie-he-evolution-eighteen-decision-locators-independent-a-'):
                # This existing seal explicitly lists paths relative to its
                # own dossier; other seals use repository-relative paths.
                b = {**b, 'path': str((p.parent / b['path']).relative_to(ROOT))}
            verify_file(b)
            count += 1
    verified.append({'seal': binding(p), 'actualVerifiedFiles': count})

canon = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
assert sha(canon) == '82e0a67ecd7a1b765336349b66eb60279f91ea67a169c8667a08c93e5d68137d'
current = read(canon)
candidate = OUT / 'candidate/canonical.current476.guide-complete-link-metadata.inactive.json'
future = read(candidate)
ids = set(read(AUTHOR / 'neutral-eighteen-current-raster-native-author-review.entry.json')['goalIds'])
assert len(ids) == 18 and len(current['goals']) == len(future['goals']) == 476
old_by = {g['id']: g for g in current['goals']}
new_by = {g['id']: g for g in future['goals']}
assert set(old_by) == set(new_by)
assert all(new_by[g] == old_by[g] for g in old_by if g not in ids)
assert sum(g not in ids for g in old_by) == 458
word_ids = {'302c6d6d-bf10-5dbc-adda-65e4b5c63e49', '35b016d8-ed2c-570c-ab64-ac39f8f962b2'}
word_changes = []
for g in ids:
    before, after = dict(old_by[g]), dict(new_by[g])
    assert not before.get('resourceLinks'), ('good previous image must be kept', g)
    links = after.pop('resourceLinks')
    assert len(links) == 1
    link = links[0]
    assert link['skillpilotId'] == g and link['reviewStatus'] == 'pilot'
    assert link['resourceType'] == 'image' and link['type'] == 'goal-visualization'
    assert link['license'] == 'CC-BY-4.0' and link['lang'] == 'de'
    if g in word_ids:
        changed = {k for k in before if before[k] != after[k]}
        assert changed == ({'descriptionEn'} if g.startswith('302c') else {'description', 'descriptionEn'})
        word_changes.extend({'goalId': g, 'field': k, 'before': before[k], 'after': after[k]} for k in changed)
        for k in changed:
            after[k] = before[k]
    assert before == after
assert len(word_changes) == 3

metadata_a = read(BASE / 'biologie-he-evolution-one-cat-anatomy-targeted-independent-a-20261008-v2/required-link-metadata-P18.independent-a.v2.actual-confirmation.json')
metadata_b = read(BASE / 'biologie-he-evolution-eighteen-required-link-metadata-P18-independent-b-20261008-v1/required-link-metadata-P18-targeted-technical.independent-b.receipt.json')
assert metadata_a['P18ClosedSchemaErrors'] == metadata_a['P18NativeSemanticErrors'] == 0
assert metadata_a['newScientificReviews'] == 0 and metadata_a['all18GenuineWholePProfilesAnd36CasesRetained']
assert metadata_b['whole392NativePageObjectsAndFingerprintsExactByActualStandardCompiler']
assert len(metadata_b['exactCurrent18MetadataAndPBindings']) == 18
for r in metadata_b['exactCurrent18MetadataAndPBindings']:
    assert r['schemaErrors'] == r['semanticErrors'] == 0
    assert r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate'
    verify_file(r['actualCurrentPNG'])
    verify_file(r['actualCurrentProvenance'])

qa = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
next_qa = OUT / 'candidate/visualization-qa.current392.paired-eighteen.future-active.json'
old_q, new_q = [{r['goalId']: r for r in read(p)['records']} for p in [qa, next_qa]]
assert len(old_q) == len(new_q) == 392
assert all(new_q[g] == old_q[g] for g in old_q if g not in ids)
assert all({k: v for k, v in new_q[g].items() if k.startswith('human')} == {k: v for k, v in old_q[g].items() if k.startswith('human')} for g in old_q)
for g in ids:
    assert new_q[g]['aiApproved'] == 'yes'
    assert new_q[g]['aiApprovedAssetSha256'] == new_q[g]['assetSha256']
    assert new_q[g]['humanApproved'] == 'no'

registry = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
next_registry = read(registry)
entry = next(s for s in next_registry['subjects'] if s['subject'] == 'biologie')
old_index = str((OUT / 'original-frame-native-d-eighteen-v2/resolution-index.json').relative_to(ROOT))
new_index = str((OUT / 'original-frame-native-d-one-current-subset-v4/resolution-index.json').relative_to(ROOT))
assert all(p not in entry['resolutionIndexPaths'] for p in [old_index, new_index])
entry['resolutionIndexPaths'].extend([old_index, new_index])
entry.setdefault('resolutionSupersessions', []).append({'goalId': '7008979d-7890-5f7b-ad07-27b8bb597cbe', 'supersededIndexPath': old_index, 'replacementIndexPath': new_index})
p_config = str((OUT / 'positive/P18.paired-machine-current392.future-active.config.json').relative_to(ROOT))
entry['positiveEvidenceConfigPaths'].append(p_config)

atlas = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
next_atlas = read(atlas)
inactive = read(ROOT / 'app/scripts/config/goal-books/inactive/biologie-he-evolution-eighteen-raster-native-20261008-v1/atlas.inputs.json')
assert len(next_atlas['mappingPaths']) == len(inactive['mappingPaths']) == 29
assert sum(a != b for a, b in zip(next_atlas['mappingPaths'], inactive['mappingPaths'])) == 1
next_atlas['mappingPaths'] = inactive['mappingPaths']
# Exact already independently checked operative144 rows: no deletion of the
# existing NeuroGK2 HOLD, no whole144 source-release approval is implied.
source_path = next(p for p in next_atlas['mappingPaths'] if 'evolution18-decision-locators' in p)
source = read(ROOT / source_path)
assert len(source['decisions']) == 144 and len(source['mappings']) == 158
assert next(d for d in source['decisions'] if d['sourceGoalId'] == 'ca155d02-5fae-5222-85a4-881c0a69b0de')['decision'] == 'needs_canonical_goal'

write(OUT / 'candidate/registry.only-biologie-D18-D1-P18.future-active.json', next_registry)
write(OUT / 'candidate/atlas.inputs.only-reviewed-source-pointer.future-active.json', next_atlas)
replacements = [
    (canon, candidate),
    (qa, next_qa),
    (ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json', AUTHOR / 'candidate/semantic-kinds.current476.two-reviewed-word-patches.future-active.json'),
    (ROOT / 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json', AUTHOR / 'candidate/A.current392.future-active.config.json'),
    (ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json', AUTHOR / 'candidate/M.current392.future-active.config.json'),
    (atlas, OUT / 'candidate/atlas.inputs.only-reviewed-source-pointer.future-active.json'),
    (registry, OUT / 'candidate/registry.only-biologie-D18-D1-P18.future-active.json'),
]
protected = [ROOT / p for p in [
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
    'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
    'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
    'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',
    'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
]]
protected_before = [binding(p) for p in protected]
old_images = {r['goalId']: r for r in read(ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he-evolution-eighteen-image-author-root-20261008-v1/selected-eighteen-whole-goal-image-author-candidates.exact.json')['images']}
selected = read(CORRECTED / 'selected-eighteen-one-corrected-seventeen-exact.author-input.json')['images']
operations = []
for image in selected:
    g = image['goalId']
    assert sha(ROOT / image['selectedPath']) == image['sha256']
    source_dir = (ROOT / image['actualSource']['path']).parent
    version = 2 if g == '7008979d-7890-5f7b-ad07-27b8bb597cbe' else old_images[g]['selectedVersion']
    prefix = 'candidate-v' + str(version)
    for prefix_root in ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']:
        operations.append((ROOT / image['selectedPath'], ROOT / prefix_root / 'biologie' / g / (g + '.png')))
    if g == '7008979d-7890-5f7b-ad07-27b8bb597cbe':
        prompt, provenance = source_dir / (prefix + '.prompt.md'), source_dir / (prefix + '.provenance.json')
    else:
        prompt = verify_file(old_images[g]['prompt'])
        provenance = verify_file(old_images[g]['provenance'])
    for source_file, target_name in [(prompt, 'prompt.de.md'), (provenance, 'generation-provenance.json')]:
        operations.append((source_file, ROOT / 'curricula/DE/Gymnasium/visualizations/biologie' / g / target_name))
assert len(operations) == 90
for src, target in operations:
    assert src.is_file() and not target.exists(), ('non-new or missing asset operation', str(target))

before = OUT / 'before'
for target, src in replacements:
    assert src.is_file() and target.is_file()
    snapshot = before / target.relative_to(ROOT)
    assert not snapshot.exists()
    snapshot.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(target, snapshot)
write(OUT / 'reviewed-eighteen-pre-apply-guard.actual.json', {
    'schemaVersion': 1, 'role': 'Root integration exact guard of genuine independent reviews, no new scientific review',
    'actualAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'actualVerifiedSeals': verified,
    'protectedFiles': protected_before, 'other458WholeGoalsExact': True, 'actualThreeWordFieldCorrections': word_changes,
    'other374WholeQARowsExact': True, 'all392HumanFieldsExact': True, 'preserved144RowsAnd158Edges': True,
    'existingNeuroGK2SourceHOLDPreserved': True, 'noNewSeventeenReviews': True, 'distinctActualOriginalD18AndCurrentD1': True,
    'correctedOneUsesItsOwnGenuineCurrentSubsetContext': True, 'replacements': [{'target': binding(t), 'source': binding(s)} for t, s in replacements],
    'newAssetOperations': [{'source': binding(s), 'target': str(t.relative_to(ROOT))} for s, t in operations],
    'newScientificClosuresBeforeCentral': 0, 'humanApproval': False, 'humanTrial': False,
})
for target, src in replacements:
    shutil.copyfile(src, target)
    assert sha(src) == sha(target)
for src, target in operations:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, target)
    assert sha(src) == sha(target)
for b in protected_before:
    verify_file(b)
write(OUT / 'genuine-eighteen-applied-central-pending.actual.json', {'schemaVersion': 1, 'actualAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'replacedFiles': [str(t.relative_to(ROOT)) for t, s in replacements], 'newAssetCopies': 90, 'onlyBiologyRegistryChanged': True, 'unchangedCurrentAtomicDenominator': 392, 'historicalSealedArtifactsChanged': False, 'humanApproval': False, 'humanTrial': False, 'newStrictGainClaimed': 0, 'requiredAffectedChecksAndCentralPending': True})
print(json.dumps({'guardedEighteenApply': 'PASS', 'replacements': 7, 'newExactAssetCopies': 90, 'centralPending': True}))
