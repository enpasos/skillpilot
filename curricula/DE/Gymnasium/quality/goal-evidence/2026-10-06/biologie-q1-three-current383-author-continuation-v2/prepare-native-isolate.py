#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare explicit physical candidate inputs; never modify the active curriculum."""
from pathlib import Path
import copy, hashlib, json, shutil

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
ISO = ROOT / 'tmp/biologie-q1-four-current383-native-author-20261006-v1'
assert not ISO.exists(), 'Use a new isolate; do not overwrite historical output'
ISO.mkdir(parents=True)

def read(path):
    return json.loads((ROOT / path).read_text())

def write(path, data):
    target = ISO / path
    target.parent.mkdir(parents=True, exist_ok=True)
    assert not target.is_symlink()
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def physical(path):
    source, target = ROOT / path, ISO / path
    assert source.is_file(), source
    target.parent.mkdir(parents=True, exist_ok=True)
    assert not target.is_symlink()
    shutil.copy2(source, target)

def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

for path in ['app/scripts', 'app/src', 'contracts', 'scripts']:
    shutil.copytree(ROOT / path, ISO / path, dirs_exist_ok=True)
for path in ['app/package.json', 'app/tsconfig.json', 'app/tsconfig.app.json']:
    if (ROOT / path).is_file(): physical(path)
(ISO / 'app/node_modules').symlink_to(ROOT / 'app/node_modules', target_is_directory=True)
(ISO / 'docs').symlink_to(ROOT / 'docs', target_is_directory=True)
(ISO / 'app/public').mkdir(parents=True, exist_ok=True)
for source in (ROOT / 'app/public').iterdir():
    if source.name != 'assets':
        (ISO / 'app/public' / source.name).symlink_to(source, target_is_directory=source.is_dir())
assets = ISO / 'app/public/assets'
assets.mkdir()
for source in (ROOT / 'app/public/assets').iterdir():
    if source.name != 'goal-visualizations':
        (assets / source.name).symlink_to(source, target_is_directory=source.is_dir())
public_bio = assets / 'goal-visualizations/biologie'
public_bio.mkdir(parents=True)
for source in (ROOT / 'app/public/assets/goal-visualizations/biologie').iterdir():
    (public_bio / source.name).symlink_to(source, target_is_directory=source.is_dir())

canon_path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
sem_path = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
qa_path = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
atlas_path = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
atlas = read(atlas_path)
paths = [canon_path, sem_path, qa_path, atlas['durationModelPolicyPath']]
paths += [
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md',
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',
]
paths += atlas['mappingPaths']
paths += [read(p)['sourceExtractionPath'] for p in atlas['mappingPaths']]
for p in [read(m)['sourceExtractionPath'] for m in atlas['mappingPaths']]:
    for d in read(p).get('sourceDocuments', []):
        if d.get('path') and (ROOT / d['path']).is_file(): paths.append(d['path'])
for p in sorted(set(paths)): physical(p)
shutil.copytree(OWN, ISO / REL)

canonical = read(canon_path)
by = {g['id']: g for g in canonical['goals']}
proposals = read(REL / 'proposed-three-goal-objects.candidate.json')['goals']
proposals.append(read(REL / 'replication-preservation-goal.candidate.json')['proposed'])
for proposal in proposals:
    current = by[proposal['id']]
    if proposal['id'].startswith('e70d8a85'):
        assert current == read(REL / 'replication-preservation-goal.candidate.json')['original']
    current.update(copy.deepcopy(proposal))
visual_inputs = read(REL / 'visualization-final-candidate-inputs.v3.json')['records']
qa = read(qa_path)
for row in visual_inputs:
    gid = row['goalId']
    image_path = ROOT / row['candidatePath']
    assert sha(image_path) == row['sha256']
    target = public_bio / gid
    assert not target.exists(), 'No existing good image may be replaced'
    target.mkdir()
    shutil.copy2(image_path, target / (gid + '.png'))
    url = '/assets/goal-visualizations/biologie/' + gid + '/' + gid + '.png'
    by[gid]['resourceLinks'] = [{
        'type': 'goal-visualization', 'resourceType': 'image', 'role': 'primary',
        'skillpilotId': gid, 'title': 'Visualisierung: ' + by[gid]['title'],
        'url': url, 'provider': row['provider'], 'description': row['altText'],
        'altText': row['altText'], 'lang': 'de', 'license': 'CC-BY-4.0',
        'reviewStatus': 'pilot',
    }]
    record = next(r for r in qa['records'] if r['goalId'] == gid)
    assert record['visualizationState'] == 'missing'
    record.update(description=by[gid]['description'], visualizationState='available',
                  missingReason='', imageUrl=url, publicAssetPath='app/public' + url,
                  canonicalAssetPath=str(REL / 'visualization' / image_path.name),
                  assetSha256=row['sha256'])
    # Native review rendering only. No AI/human approval fields are changed.
write(canon_path, canonical)
write(qa_path, qa)
write(REL / 'prospective-canonical.snapshot.json', canonical)
write(REL / 'prospective-qa.no-approval.snapshot.json', qa)

patches = read(REL / 'HE-three-current-original-bullet-patches.candidate.json')
mapping = read(patches['baseMappingPath'])
extraction = read(patches['baseExtractionPath'])
new_mapping = str(REL / 'HE.current-three-and-replication.mapping.candidate.json')
new_extraction = str(REL / 'HE.current-three-original-bullets.extraction.candidate.json')
for patch in patches['rows']:
    sid = patch['sourceGoalId']
    current = next(g for g in extraction['sourceGoals'] if g['id'] == sid)
    assert current == patch['before']
    current.update(copy.deepcopy(patch['candidateAfter']))
    previous = [m for m in mapping['mappings'] if m['legacyGoalId'] == sid]
    assert len(previous) == 1
    mapping['mappings'] = [m for m in mapping['mappings'] if m['legacyGoalId'] != sid]
    for gid in patch['candidateCanonicalGoalIds']:
        row = copy.deepcopy(previous[0])
        row.update(canonicalGoalId=gid, matchType=patch['candidateMatchType'])
        mapping['mappings'].append(row)
    decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == sid)
    decision.update(canonicalGoalIds=patch['candidateCanonicalGoalIds'],
                    matchType=patch['candidateMatchType'],
                    rationale='Inactive current primary-source author candidate: ' + patch['reason'])
mapping.update(sourceExtractionPath=new_extraction)
write(new_mapping, mapping)
write(new_extraction, extraction)
atlas['mappingPaths'] = [new_mapping if p == patches['baseMappingPath'] else p
                         for p in atlas['mappingPaths']]
write(atlas_path, atlas)
book = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
book['outputPath'] = str(REL / 'prospective-full.book-model.json')
write(REL / 'book.config.json', book)
batch = read('curricula/DE/Gymnasium/quality/goal-description-review/biologie/rollout-v1/2026-10-05/m7-q1-genetics-open-remainder-three-current-20261005-v3.config.json')
batch.update(batchId='biologie-q1-four-current383-author-20261006-v1',
             bookId='de-gym-biologie-q1-four-current383-author-20261006-v1',
             title='Biologie Q1: drei offene Ziele und Replikationsbewahrung; inaktiver Kandidat',
             goalIds=[proposals[0]['id'], proposals[1]['id'], proposals[2]['id'], proposals[3]['id']],
             baseGoalBookConfigPath=str(REL / 'book.config.json'),
             outputDirectory=str(REL / 'native-four'))
write(REL / 'batch.config.json', batch)
boundary = {
    'isolationRoot': str(ISO), 'activeWrites': 0, 'humanApproval': False,
    'targetGoalIds': [g['id'] for g in proposals],
    'newGoalIDs': [], 'denominator': 383,
    'inputBindings': [{'path': p, 'sha256': sha(ROOT / p)} for p in sorted(set(paths))],
    'nativeSourceAndDPreparation': 'pending; author candidate only',
}
(OWN / 'native-isolation-input-boundary.actual.json').write_text(
    json.dumps(boundary, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'isolationRoot': str(ISO), 'physicalInputs': len(set(paths)),
                  'targetGoalIds': boundary['targetGoalIds'], 'activeWrites': 0}))
