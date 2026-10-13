from pathlib import Path
import copy, hashlib, json, os

R = Path('/home/enpasos/projects/skillpilot')
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
P = E / 'chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9'
O = E / 'chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1'
N = E / 'chemie-polymers4-original-native-retention-pending-source-audit-root-20261013-v15'
assert not N.exists()
rd = lambda p: json.loads(p.read_text())
rp = lambda p: str(p.relative_to(R))
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, data):
    assert not p.exists()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

plan = rd(P / 'INTEGRATION_PLAN.current231-original17-selected.pending-root.json')
partition_path = E / 'chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13/source/HB34-batch-plus-three-primary-actual-dependency-partition.author.json'
partition = rd(partition_path)
selected = [g for g in plan['eligibleOriginalGoalIds'] if g in partition['original17WithNoDirectNewlyDisputedRow']]
assert len(selected) == 4
assert set(selected).isdisjoint(partition['original17WithNewlyDisputedSourceRow'])
assert len(partition['original17WithNewlyDisputedSourceRow']) == 13
write(N / 'source/dependency-partition.author.snapshot.not-acceptance.json', partition)
references = []
for name in ('descriptionIndex', 'positiveConfig', 'atomicityConfig', 'futureCanonical', 'futureQa'):
    row = plan[name]; f = R / row['path']
    assert sha(f) == row['sha256'] and f.stat().st_size == row['bytes']
    references.append(copy.deepcopy(row))

idx = rd(R / plan['descriptionIndex']['path'])
idx['artifactSetId'] = 'chemie-polymers4-original-native-retention-pending-source-audit-20261013-v15'
idx['strictDescriptionReviewCompleteCount'] = 4
idx['descriptionReviewPercentage'] = round(4 / 402 * 100, 1)
for group in idx['groups']:
    group['artifactDirectory'] = os.path.relpath((P / group['artifactDirectory']).resolve(), N)
    group['dualSummaryPath'] = os.path.relpath((P / group['dualSummaryPath']).resolve(), N)
    group['resolvedGoalCount'] = 4
assert idx['groups'][0]['campaignGoalCount'] == 18
idx['resolutions'] = [row for row in idx['resolutions'] if row['goalId'] in selected]
for row in idx['resolutions']:
    f = P / row['resolutionPath']; assert sha(f) == row['resolutionDigest']
    row['resolutionPath'] = os.path.relpath(f, N)
    references.append({'path': rp(f), 'sha256': sha(f), 'bytes': f.stat().st_size})
write(N / 'resolution-index.original4.aggregate-v1.inactive.json', idx)

live_landscape = R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert sha(live_landscape) == plan['expectedActiveStartCanonical']['sha256']
live = rd(live_landscape); future = rd(R / plan['futureCanonical']['path'])
future_by_id = {g['id']: g for g in future['goals']}
changed_images = [row for row in plan['sixPreviouslyApprovedActualAssetBindings'] if row['goalId'] in selected]
assert len(changed_images) == 3
image_ids = {row['goalId'] for row in changed_images}
for i, g in enumerate(live['goals']):
    if g['id'] in image_ids: live['goals'][i] = copy.deepcopy(future_by_id[g['id']])
canonical = N / 'candidate/canonical523.current402.three-resource-only.inactive.json'
write(canonical, live)
qa_live = rd(R / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
qa_new = {g['goalId']: g for g in rd(R / plan['futureQa']['path'])['records']}
qa_live['records'] = [copy.deepcopy(qa_new[g['goalId']]) if g['goalId'] in image_ids else g for g in qa_live['records']]
qa = N / 'candidate/QA.current-plus-three-original-actual-V.inactive.json'
write(qa, qa_live)

for label, field, dest in (('positiveConfig', 'goalIds', 'P4'), ('atomicityConfig', 'leafGoalIds', 'A4')):
    conf = rd(R / plan[label]['path']); source = R / conf['reviewPath']
    references.append({'path': rp(source), 'sha256': sha(source), 'bytes': source.stat().st_size})
    lines = source.read_bytes().splitlines(keepends=True)
    retained = [line for line in lines if json.loads(line)['goalId'] in selected]
    assert len(retained) == 4
    target = N / ('positive' if label == 'positiveConfig' else 'atomicity') / (dest + '.original-records.raw-exact.jsonl')
    target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(b''.join(retained))
    conf['reviewPath'] = rp(target); conf['landscapePath'] = rp(canonical)
    conf['scope'][field] = selected
    conf['scope']['label'] = 'Inactive four retained original records; pending measured current primary-source and context impact audit'
    write(N / 'configs' / (dest + '.inactive.config.json'), conf)

model_conf = rd(O / 'configs/whole402.inactive.config.json')
model_conf['landscapePath'] = rp(canonical)
model_conf['goalVisualizationQaPath'] = rp(qa)
model_conf['evidenceReviewPaths'] = [model_conf['evidenceReviewPaths'][0], rp(N / 'positive/P4.original-records.raw-exact.jsonl')]
model_conf['outputPath'] = rp(N / 'models/whole402.current231-plus-original4.inactive.json')
write(N / 'configs/whole402.inactive.config.json', model_conf)
write(N / 'TECHNICAL_SELECTION.pending-primary-impact.json', {
    'schemaVersion': 1, 'state': 'INACTIVE; measured source/course/ancestor/page-context proof still required before root integration',
    'originalNativeCampaignGoalCount': 18, 'selectedOriginalRecordCount': 4, 'selectedGoalIds': selected,
    'newSharedPrimaryFindingAffectedGoalIds': partition['original17WithNewlyDisputedSourceRow'],
    'originalThreeHeldGoalIds': plan['heldGoalIds'], 'currentStrictCount': 231, 'currentCurricularAtomicDenominator': 402,
    'newScientificReviewVotes': 0, 'actualStrictGain': 0, 'newNativeOrReviewCampaignCreated': False,
    'originalRunRecordResolutionAndProfileMetadataUnchanged': True,
    'selectedThreeOriginalApprovedImageBindings': changed_images,
    'futureCanonical': {'path': rp(canonical), 'sha256': sha(canonical), 'bytes': canonical.stat().st_size},
    'futureQa': {'path': rp(qa), 'sha256': sha(qa), 'bytes': qa.stat().st_size},
    'references': references, 'humanApproval': False, 'humanTrial': False,
    'integrationForbiddenUntilMeasuredPrimarySourceAndPageContextAudit': True,
})
print(json.dumps({'inactiveRoot': rp(N), 'rawExactSelectedRecords': 4, 'resourceOnlyCandidateChanges': 3, 'strictGain': 0, 'sourceAuditPending': True}))
