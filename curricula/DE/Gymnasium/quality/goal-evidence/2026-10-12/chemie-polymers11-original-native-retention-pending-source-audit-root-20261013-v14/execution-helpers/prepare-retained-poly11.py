from pathlib import Path
import copy, hashlib, json, os

R = Path('/home/enpasos/projects/skillpilot')
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
P = E / 'chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9'
N = E / 'chemie-polymers11-original-native-retention-pending-source-audit-root-20261013-v14'
assert not N.exists()
rd = lambda p: json.loads(p.read_text())
rp = lambda p: str(p.relative_to(R))
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, data):
    assert not p.exists()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

plan = rd(P / 'INTEGRATION_PLAN.current231-original17-selected.pending-root.json')
affected = {'3aef6d91-04ff-5ec7-b92e-ccf330d9816a', '3e9eb5d0-3407-5a1e-9492-ad87f98d303d',
    '6eb14e47-187c-5ba1-8b08-a0ee95ad88a9', '8721d943-8368-5304-bd3c-7d7944099662',
    '9b942490-ad8f-52ba-8c5a-f8a9792b7db5', '2652caef-b557-58b9-9b28-70db62625ce5'}
selected = [g for g in plan['eligibleOriginalGoalIds'] if g not in affected]
assert len(selected) == 11 and affected <= set(plan['eligibleOriginalGoalIds'])
references = []
for name in ('descriptionIndex', 'positiveConfig', 'atomicityConfig', 'futureCanonical', 'futureQa'):
    row = plan[name]
    f = R / row['path']
    assert sha(f) == row['sha256'] and f.stat().st_size == row['bytes']
    references.append(copy.deepcopy(row))

idx = rd(R / plan['descriptionIndex']['path'])
idx['artifactSetId'] = 'chemie-polymers11-original-native-retention-pending-source-audit-20261013-v14'
idx['strictDescriptionReviewCompleteCount'] = 11
idx['descriptionReviewPercentage'] = round(11 / 402 * 100, 1)
for group in idx['groups']:
    group['artifactDirectory'] = os.path.relpath((P / group['artifactDirectory']).resolve(), N)
    group['resolvedGoalCount'] = 11
assert idx['groups'][0]['campaignGoalCount'] == 18
idx['resolutions'] = [row for row in idx['resolutions'] if row['goalId'] in selected]
for row in idx['resolutions']:
    f = P / row['resolutionPath']
    assert sha(f) == row['resolutionDigest']
    row['resolutionPath'] = os.path.relpath(f, N)
    references.append({'path': rp(f), 'sha256': sha(f), 'bytes': f.stat().st_size})
write(N / 'resolution-index.original11.aggregate-v1.inactive.json', idx)

for label, field, dest in (('positiveConfig', 'goalIds', 'P11'), ('atomicityConfig', 'leafGoalIds', 'A11')):
    conf = rd(R / plan[label]['path'])
    source = R / conf['reviewPath']
    references.append({'path': rp(source), 'sha256': sha(source), 'bytes': source.stat().st_size})
    lines = source.read_bytes().splitlines(keepends=True)
    retained = [line for line in lines if json.loads(line)['goalId'] in selected]
    assert len(retained) == 11
    target = N / ('positive' if label == 'positiveConfig' else 'atomicity') / (dest + '.original-records.raw-exact.jsonl')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b''.join(retained))
    assert all(line in lines for line in target.read_bytes().splitlines(keepends=True))
    conf['reviewPath'] = rp(target)
    conf['scope'][field] = selected
    conf['scope']['label'] = 'Inactive eleven retained original records; pending current primary-source and context impact audit'
    write(N / 'configs' / (dest + '.inactive.config.json'), conf)

write(N / 'TECHNICAL_SELECTION.pending-primary-impact.json', {
    'schemaVersion': 1, 'state': 'INACTIVE; source and context impact acceptance still required before root integration',
    'originalNativeCampaignGoalCount': 18, 'selectedOriginalRecordCount': 11,
    'selectedGoalIds': selected, 'newSharedPrimaryFindingAffectedGoalIds': sorted(affected),
    'originalThreeHeldGoalIds': plan['heldGoalIds'], 'currentStrictCount': 231, 'currentCurricularAtomicDenominator': 402,
    'newScientificReviewVotes': 0, 'actualStrictGain': 0, 'newNativeOrReviewCampaignCreated': False,
    'originalRunRecordResolutionAndProfileMetadataUnchanged': True,
    'sixApprovedImageCandidatesAreSeparateFromElevenGoalClosure': True,
    'references': references, 'humanApproval': False, 'humanTrial': False,
    'integrationForbiddenUntilMeasuredPrimarySourceAndPageContextAudit': True,
})
print(json.dumps({'inactiveRoot': rp(N), 'rawExactSelectedRecords': 11, 'strictGain': 0, 'sourceAuditPending': True}))
