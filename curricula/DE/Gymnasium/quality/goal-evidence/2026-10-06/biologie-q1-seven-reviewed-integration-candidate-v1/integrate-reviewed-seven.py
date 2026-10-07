# SPDX-License-Identifier: Apache-2.0
"""Integrate exact independently reviewed inputs; completion requires fresh native checks."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
import shutil

ROOT = Path.cwd().resolve()
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
OWN = BASE / 'biologie-q1-seven-reviewed-integration-candidate-v1'
PREPARED = BASE / 'biologie-q1-seven-final-native-review-inputs-author-v1'
CANONICAL = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
KINDS = Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
QA = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
REGISTRY = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
read = lambda p: json.loads(Path(p).read_text())
def binding(p):
    p = Path(p)
    return {'path': str(p), 'sha256': sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def write(p, x, new=False):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x' if new else 'w') as f:
        json.dump(x, f, ensure_ascii=False, indent=2)
        f.write('\n')

pins = [
    (PREPARED/'final-native-review-inputs.author-v1.freeze.json', '7594c80e665828238463b965f12b18df845a3c17fbfe19dc17e1ed35a5247d70'),
    (BASE/'biologie-q1-seven-final-native-d-independent-a-v1/independent-d-a.final.freeze.json', '5a145212d6a28432d16f3e5a90e1d1ed954ec81d4a25b51d787c771ff31a805e'),
    (BASE/'biologie-q1-seven-final-native-d-independent-b-v1/native-d-independent-b.final.freeze.json', 'cabe0e8086badbf29488f7c18184f8669f07d5cf67a7dfca9f6acebf8bf4aadf'),
    (BASE/'biologie-q1-seven-final-native-positive-independent-a-v1/independent-p-a.final.freeze.json', 'ac5d341dcd070f5e04b1529360248238dd216361ec0f39c5fa34c6ac846e0d8d'),
    (BASE/'biologie-q1-seven-final-native-p-independent-b-v1/native-p-independent-b.final.freeze.json', '1060c36a615c9bac782a8b8dc8c35846097e4eb919df95ac1ebb23fd7446eac1'),
    (BASE/'biologie-q1-seven-reviewed-integration-independent-b-v1/targeted-integration-independent-b.final.freeze.json', 'bae3414415f26bde4bcb6c71ae67cb371bfe2eaae0631a64e9a01752460b86f6'),
    (Path('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-seven-new-visuals-independent-v-qa-v1/independent-visual-review.final.freeze.json'), '6320646059702bb78de426ea84a14238fc463a060b664e7e5e5639aa12d685cb'),
]
for p, expected in pins:
    assert binding(p)['sha256'] == expected, p
    freeze = read(p)
    files = freeze.get('files', freeze.get('ownFiles', freeze.get('ownOutputs')))
    assert files is not None, p
    for r in files:
        q = Path(r['path']) if r['path'].startswith('curricula/') else p.parent/r['path']
        assert binding(q)['sha256'] == r['sha256'].removeprefix('sha256:'), q

guards_path = BASE/'chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
guards = read(guards_path)['currentInputs']
for g in guards:
    assert binding(g['path'])['sha256'] == g['sha256'].removeprefix('sha256:'), g['path']
old = read(CANONICAL)
candidate = read(OWN/'canonical-390.integration-candidate.json')
old_by_id = {g['id']: g for g in old['goals']}
new_by_id = {g['id']: g for g in candidate['goals']}
ids = read(PREPARED/'qa-artifacts/native-input-and-preservation-verification.actual.json')['selectedGoalIds']
assert len(ids) == 7 and len(candidate['goals']) == 472
old_changes = [gid for gid,g in old_by_id.items() if g != new_by_id[gid]]
assert old_changes == ['e8d54127-d42e-51f5-bfa5-51d826069f95'], old_changes
root_id = old_changes[0]
assert {k:v for k,v in old_by_id[root_id].items() if k != 'contains'} == {k:v for k,v in new_by_id[root_id].items() if k != 'contains'}
assert new_by_id[root_id]['contains'] == old_by_id[root_id]['contains'] + ['d32d7a5e-26ac-5019-85f2-c994e2c6e795']
assert all('authorCandidate' not in new_by_id[gid].get('extendedData', {}) for gid in ids)
qa_before = read(QA)
visual = read('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-seven-new-visuals-independent-v-qa-v1/seven-native-v-input-records.candidate.json')
old_qa_ids = {r['goalId'] for r in qa_before['records']}
assert not old_qa_ids.intersection(ids)
image_author = BASE/'biologie-q1-seven-new-visuals-author-v1'
selected = read(image_author/'seven-selected-images-and-alt-text.author-candidate.json')['decisions']
copied_assets = []
for r in selected:
    for output in r['nativeHelperOutputs']:
        src = Path(output['path'])
        dest = Path(str(src).split('/native-helper-output/', 1)[1])
        assert not dest.exists(), dest
        assert binding(src)['sha256'] == output['sha256'], src
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        assert src.read_bytes() == dest.read_bytes()
        copied_assets.append({'source': binding(src), 'destination': binding(dest)})
write(CANONICAL, candidate)
semantic = read(OWN/'semantic-kinds-390.integration-candidate.json')
semantic['sourceLandscapePath'] = str(CANONICAL)
write(KINDS, semantic)
for r in visual['records']:
    q = r['plannedNativeRecord']
    assert q['landscapePath'] == str(CANONICAL)
    assert q['title'] == new_by_id[q['goalId']]['title'] and q['description'] == new_by_id[q['goalId']]['description']
    assert binding(q['publicAssetPath'])['sha256'] == q['aiApprovedAssetSha256'].removeprefix('sha256:')
    qa_before['records'].append(q)
write(QA, qa_before)

source_refs = [
    str(BASE/'biologie-q1-eleven-source-topic-v7-independent-a-followup-v1/independent-a-followup-current-v2.final.freeze.json'),
    str(BASE/'biologie-q1-mv-heading-location-v8-independent-a-followup-v1/independent-a-v8-followup.final.freeze.json'),
    str(BASE/'biologie-q1-seven-native-v7-independent-b-v1/mv-heading-v8-targeted-followup.final.freeze.json'),
]
# Use actual existing freeze names rather than inventing a reviewer receipt route.
source_refs = [str(p) for name in ['biologie-q1-eleven-source-topic-v7-independent-a-followup-v1','biologie-q1-mv-heading-location-v8-independent-a-followup-v1','biologie-q1-seven-native-v7-independent-b-v1'] for p in sorted((BASE/name).glob('*freeze*.json'))]
assert len(source_refs) >= 3
source_changes = []
new_mapping_paths = []
actual_source_bindings = read(PREPARED/'qa-artifacts/native-input-and-preservation-verification.actual.json')['sourceBindings']
for region in ['BE','BB','SN','TH','MV','ST']:
    source_row = next(r for r in actual_source_bindings if r['region']==region and r['kind']=='source-extraction')
    mapping_row = next(r for r in actual_source_bindings if r['region']==region and r['kind']=='source-mapping')
    source_target = Path(read(source_row['sourceEnvelope']['path'])['prospectivePath'])
    mapping_target = Path(read(mapping_row['sourceEnvelope']['path'])['prospectivePath'])
    assert not source_target.exists() and not mapping_target.exists()
    extraction = read(PREPARED/f'inputs/source-components/{region}.source-extraction.candidate.json')
    mapping = read(PREPARED/f'inputs/source-components/{region}.mapping.candidate.json')
    metadata_deltas = []
    review = extraction.get('qualityReview')
    if isinstance(review, dict) and 'status' in review:
        metadata_deltas.append({'field':'qualityReview.status','before':review['status'],'after':'machine_reviewed_bounded_components'})
        review['status'] = 'machine_reviewed_bounded_components'
    mapping['sourceExtractionPath'] = str(source_target)
    mapping['reviewStatus'] = 'machine_reviewed_bounded_components'
    for d in mapping['decisions']:
        assert d['wholeOriginalSourceCoverage'] is False
        metadata_deltas.append({'sourceGoalId':d['sourceGoalId'],'field':'independentReviewStatus','before':d['independentReviewStatus'],'after':'machine_reviewed_by_two_independent_reviews'})
        d['independentReviewStatus'] = 'machine_reviewed_by_two_independent_reviews'
    mapping['machineReviewEvidence'] = {'authority':'ai','independentSourceReviewFreezePaths':source_refs,'finalCurrentNativeDescriptionRoundFreezePaths':[str(p) for p,_ in pins[1:3]],'wholeOriginalSourceCoverage':False,'humanApproval':False,'originalAuthorRationalesPreservedAsAuthored':True}
    write(source_target, extraction, True)
    write(mapping_target, mapping, True)
    source_changes.append({'region':region,'extraction':binding(source_target),'mapping':binding(mapping_target),'onlyReviewedMetadataAndPathDeltas':metadata_deltas,'wholeOriginalSourceCoverage':False})
    new_mapping_paths.append(str(mapping_target))
atlas_path = Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
atlas = read(atlas_path)
assert atlas['expectedCurricularAtomicGoalCount'] == 383
atlas['expectedCurricularAtomicGoalCount'] = 390
atlas['mappingPaths'].extend(new_mapping_paths)
write(atlas_path, atlas)

view_changes = []
for p in sorted((OWN/'views').glob('*.json')):
    dest = Path('curricula/DE/Gymnasium/composition-views/biologie')/p.name
    view_changes.append({'previous':binding(dest),'candidate':binding(p)})
    shutil.copyfile(p,dest)
    view_changes[-1]['current'] = binding(dest)
for lane in ['atomicity','memory']:
    cfg = read(OWN/f'full-{lane}.candidate.config.json')
    cfg['landscapePath'] = str(CANONICAL)
    if lane == 'memory':
        for scope in cfg['visibilityScopes']:
            scope['viewPath'] = str(Path('curricula/DE/Gymnasium/composition-views/biologie')/Path(scope['viewPath']).name)
    write(OWN/f'full-{lane}.current.config.json',cfg,True)
p_b = BASE/'biologie-q1-seven-final-native-p-independent-b-v1'
p_records = p_b/'positive-evidence.seven.independent-b.review.jsonl'
records = [json.loads(l) for l in p_records.read_text().splitlines() if l.strip()]
assert [r['goalId'] for r in records] == ids
assert all(r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' for r in records)
dest_p = OWN/'positive.seven.independent-current.review.jsonl'
assert not dest_p.exists()
shutil.copyfile(p_records,dest_p)
p_config = read(BASE/'biologie-q1-seven-final-native-positive-author-v1/positive-evidence.seven.author-candidates.config.json')
p_config.update({'reviewId':records[0]['reviewId'],'landscapePath':str(CANONICAL),'semanticKindLedgerPath':str(KINDS),'reviewPath':str(dest_p)})
p_config['scope']['label'] = 'Seven current native positive profiles after two independent machine P reviews; human review remains pending'
write(OWN/'positive.seven.independent-current.config.json',p_config,True)
registry = read(REGISTRY)
subject = next(r for r in registry['subjects'] if r['subject']=='biologie')
subject['semanticAtomicityConfigPath'] = str(OWN/'full-atomicity.current.config.json')
subject['memoryReviewConfigPath'] = str(OWN/'full-memory.current.config.json')
subject['resolutionIndexPaths'].append(str(OWN/'native-d-seven/resolution-index.json'))
subject['positiveEvidenceConfigPaths'].append(str(OWN/'positive.seven.independent-current.config.json'))
write(REGISTRY, registry)
write(OWN/'qa-artifacts/reviewed-seven-active-integration.stage-1.actual.json', {
    'schemaVersion':1,'createdAtUTC':datetime.now(timezone.utc).isoformat(),'role':'actual integration of independently reviewed seven-goal candidate; fresh active central/native checks still required',
    'inputFreezePins':[{'path':str(p),'sha256':h} for p,h in pins], 'current19InputsVerifiedBeforeIntegration':guards,
    'old464IdsPreserved':True,'oldGoalFieldChanges':{'rootContainsOnly':root_id},'sevenNewGoalIds':ids,
    'currentCurricularAtomicCount':390,'actualCopiedAssets':copied_assets,'sourceChanges':source_changes,'wholeOriginalSourceIssuesClosed':0,
    'fullCurrentGUIViews':view_changes,'registeredNativeDIndex':str(OWN/'native-d-seven/resolution-index.json'),
    'nativeActiveChecks':'pending','strictCompletionsCountedNow':0,'newScientificCompletionsCountedNow':0,'restoredActiveBindingsCountedNow':0,
    'humanApproval':False,'humanTrial':False,'runtimeCodeChanged':False,'publication':False,'deployment':False,
},True)
print(json.dumps({'integratedReviewedCandidateGoals':7,'currentAtomicCount':390,'nativeActiveChecks':'pending','strictGainClaimed':0,'originalSourceHoldsClosed':0,'humanApproval':False}))
