#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare explicit current bindings while preserving every unrelated record."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, shutil
ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
PREP = OWN.parent / 'chemie-b010-five-corrected-image-current-candidate-v3'
ISO = ROOT / 'tmp/chemie-b010-five-corrected-native-isolated-20261005-v3'
REGISTRY = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def write(name, value): (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def subject_spans(text):
    pos = text.index('[', text.index('"subjects"')) + 1
    decoder = json.JSONDecoder(); result = {}
    while True:
        while text[pos].isspace() or text[pos] == ',': pos += 1
        if text[pos] == ']': return result
        value, length = decoder.raw_decode(text[pos:]); result[value['subject']] = (pos, pos + length, value, text[pos:pos+length]); pos += length

assert (OWN / 'native-finalbook/resolution-index.json').exists()
assert not (OWN / 'integration-plan.json').exists()
text = (ROOT / REGISTRY).read_text()
(OWN / 'central-registry.before.snapshot.json').write_text(text)
parts = subject_spans(text)
chem = copy.deepcopy(parts['chemie'][2])
new_ids = set(read(PREP / 'positive-evidence.config.json')['scope']['goalIds'])
new_index = str(REL / 'native-finalbook/resolution-index.json')
a_components, residual_proof, config_replacements = [], [], {}
for old_config_path in chem['semanticAtomicityConfigPaths']:
    old_config = read(ROOT / old_config_path)
    source = ROOT / old_config['reviewPath']
    lines = source.read_text().splitlines(keepends=True)
    records = [json.loads(line) for line in lines]
    removed = [r['goalId'] for r in records if r['goalId'] in new_ids]
    if not removed: continue
    label = 'ions-atomic-bonding' if len(removed) == 1 else 'element-groups-contexts'
    review_name = f'a-{label}-exact-residual.review.jsonl'
    config_name = f'a-{label}-exact-residual.config.json'
    kept = [line for line, row in zip(lines, records) if row['goalId'] not in new_ids]
    (OWN / review_name).write_text(''.join(kept))
    cfg = copy.deepcopy(old_config)
    cfg['reviewPath'] = str(REL / review_name)
    cfg['scope'] = {'label': old_config['scope']['label'] + '; exact unchanged residual, reviewed B010 five in separate current component',
                    'leafGoalIds': [json.loads(line)['goalId'] for line in kept]}
    write(config_name, cfg)
    config_replacements[old_config_path] = str(REL / config_name)
    a_components.append(config_name)
    residual_proof.append({'oldConfigPath': old_config_path, 'oldConfigSHA256': sha(ROOT / old_config_path),
        'oldReviewPath': old_config['reviewPath'], 'oldReviewSHA256': sha(source), 'newResidualReviewPath': str(REL / review_name),
        'newResidualReviewSHA256': sha(OWN / review_name), 'removedToExactCurrentA5': removed, 'keptRecordCount': len(kept),
        'everyKeptLineByteExactIncludingReviewIdRuleFingerprintDecisionAndReason': True, 'semanticPayloadModified': False})
assert len(residual_proof) == 2 and set(g for row in residual_proof for g in row['removedToExactCurrentA5']) == new_ids

for config_name, source_name in [('a-five.config.json', 'a-five.config.json'), ('positive-evidence.config.json', 'positive-evidence.config.json'), ('memory-full.config.json', 'latest-full-m-prospective.config.json')]:
    cfg = read(PREP / source_name)
    review_name = {'a-five.config.json': 'a-five.review.jsonl', 'positive-evidence.config.json': 'positive-evidence.review.jsonl', 'memory-full.config.json': 'memory-full.review.jsonl'}[config_name]
    shutil.copy2(ROOT / cfg['reviewPath'], OWN / review_name)
    cfg['reviewPath'] = str(REL / review_name)
    if 'cardReviewPath' in cfg:
        shutil.copy2(ROOT / cfg['cardReviewPath'], OWN / 'memory-full.cards.review.jsonl')
        cfg['cardReviewPath'] = str(REL / 'memory-full.cards.review.jsonl')
        cfg['reportPath'] = str(REL / 'memory-full.report.md')
    write(config_name, cfg)
    if config_name == 'a-five.config.json': a_components.append(config_name)
chem['semanticAtomicityConfigPaths'] = [config_replacements.get(p, p) for p in chem['semanticAtomicityConfigPaths']] + [str(REL / 'a-five.config.json')]
chem['positiveEvidenceConfigPaths'].append(str(REL / 'positive-evidence.config.json'))
chem['memoryReviewConfigPath'] = str(REL / 'memory-full.config.json')

# fcc already has one historical supersession. The singleton intermediate index
# remains intact as history, but cannot stay as another active owner of fcc.
fcc = 'fcc73fb5-7413-557f-aea3-b9692a66ee75'
sup = next(x for x in chem['resolutionSupersessions'] if x['goalId'] == fcc)
removed_single_index = sup['replacementIndexPath']
single = read(ROOT / removed_single_index)
assert [r['goalId'] for r in single['resolutions']] == [fcc]
chem['resolutionIndexPaths'].remove(removed_single_index)
sup['replacementIndexPath'] = new_index
chem['resolutionIndexPaths'].append(new_index)
owners = []
for gid in ['42a84bca-d27e-581f-a43a-eee424f0504d', 'b5086548-169e-5d63-a14a-dabf631fa013', 'd726e00e-1f87-5ba5-8c79-76ad4022365e']:
    matches = [path for path in chem['resolutionIndexPaths'] if path != new_index and any(r['goalId'] == gid for r in read(ROOT / path)['resolutions'])]
    assert len(matches) == 1
    item = {'goalId': gid, 'supersededIndexPath': matches[0], 'replacementIndexPath': new_index}
    chem['resolutionSupersessions'].append(item); owners.append(item)
chem_start, chem_end = parts['chemie'][:2]
replacement = json.dumps(chem, ensure_ascii=False, indent=2).replace('\n', '\n    ')
proposed = text[:chem_start] + replacement + text[chem_end:]
(OWN / 'central-registry.proposed.json').write_text(proposed)
after_parts = subject_spans(proposed)
assert all(parts[s][3] == after_parts[s][3] for s in parts if s != 'chemie')
snapshot = read(OWN / 'central-registry.before.snapshot.json')
write('central-chemie-future.config.json', {**snapshot, 'subjects': [chem]})
write('exact-existing-A-residual-preservation.actual.receipt.json', {'rows': residual_proof, 'allRetainedScientificRecordsByteExact': True,
    'onlyReviewedFiveNewAComponentAdded': True, 'existingComponentReviewIdsAndRulesNotTranslated': True, 'humanApproval': False, 'activeWrites': 0})
write('exact-registry-ownership-and-protected-subjects.actual.receipt.json', {'registryPath': REGISTRY,
    'beforeSHA256': sha(OWN / 'central-registry.before.snapshot.json'), 'prospectiveSHA256': sha(OWN / 'central-registry.proposed.json'),
    'protectedUnchangedRawSubjectEntries': [{'subject': s, 'sha256': hashlib.sha256(parts[s][3].encode()).hexdigest()} for s in parts if s != 'chemie'],
    'onlyChemieSubjectObjectChanged': True, 'newResolutionIndex': new_index, 'singletonFccIntermediateIndexRemovedFromCurrentRegistryOnly': removed_single_index,
    'singletonFccFileSHA256Preserved': sha(ROOT / removed_single_index), 'fccOriginalHistoricalSupersessionRetargetedToCurrentIndex': sup,
    'threeOtherExplicitCurrentSupersessions': owners, 'oldResolutionFilesDeleted': [], 'humanApproval': False, 'activeWrites': 0})

frozen = read(PREP / 'prepared.freeze.manifest.json')
assert len(frozen['exactFutureChangedInputs']) == 24
histories, removals = [], []
for label in ['sodium-surface', 'phosphate-arrow']:
    history_path = f'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b010-{label}-correction-20261005-v1/historical-preservation.before-any-import.json'
    history = read(ROOT / history_path)
    assert len(history['rows']) == 4 and history['status'] == 'exact_historical_bytes_preserved'
    for row in history['rows']:
        assert sha(ROOT / row['preservedCopyPath']) == row['sha256']
        assert sha(ROOT / row['originalPath']) == row['sha256']
        if row['originalPath'].endswith('.jpg'): removals.append({**row, 'reason': 'Replaced only after actual independent corrected-PNG and two native page reviews; archived exact original retained.'})
    histories.append({'receiptPath': history_path, 'receiptSHA256': sha(ROOT / history_path), 'fourExactHistoricalInputs': history['rows']})
assert len(removals) == 6
baseline_path = str((OWN.parent / 'chemie-biologie-commit-checkpoint-v1/central-current.report.json').relative_to(ROOT))
baseline = read(ROOT / baseline_path)
baseline_chem = next(s for s in baseline['subjects'] if s['subject'] == 'chemie')
assert baseline_chem['strictComplete'] == 85 and baseline_chem['denominator'] == 376
plan = {'schemaVersion': 1, 'status': 'reviewable_inactive_plan_waiting_native_future_report', 'preparedAtUTC': datetime.now(timezone.utc).isoformat(),
    'preparedV3FreezePath': str((PREP / 'prepared.freeze.manifest.json').relative_to(ROOT)), 'preparedV3FreezeSHA256': sha(PREP / 'prepared.freeze.manifest.json'),
    'explicitFuture24DeltaFiles': frozen['exactFutureChangedInputs'], 'unchanged49PlannedInputs': frozen['exactUnchangedPlannedInputs'],
    'currentNineDescriptionIndexPath': new_index, 'currentNineDescriptionIndexSHA256': sha(OWN / 'native-finalbook/resolution-index.json'),
    'centralRegistryPath': REGISTRY, 'currentChemieRawEntrySHA256': hashlib.sha256(parts['chemie'][3].encode()).hexdigest(),
    'proposedRegistryPath': str(REL / 'central-registry.proposed.json'), 'proposedChemie': chem,
    'protectedMathPhysRawEntries': {s: hashlib.sha256(parts[s][3].encode()).hexdigest() for s in ['mathematik', 'physik']},
    'unrelatedBiologieRegistryEntryPreservedAtApplication': True, 'scientificRecordResidualProofPath': str(REL / 'exact-existing-A-residual-preservation.actual.receipt.json'),
    'currentAComponentConfigPaths': [str(REL / p) for p in a_components], 'currentPositive5ConfigPath': str(REL / 'positive-evidence.config.json'),
    'currentFullM376ConfigPath': str(REL / 'memory-full.config.json'), 'existingPositiveFourProfilesUnchanged': True,
    'explicitArchivedOldImageRemovalPlan': removals, 'bothImageHistories': histories,
    'baselineCentralReportPath': baseline_path, 'baselineCentralReportSHA256': sha(ROOT / baseline_path), 'protectedCurrentStrict85GoalIds': baseline_chem['strictCompleteGoalIds'],
    'expectedFiveNewScientificGoalIds': sorted(new_ids), 'expectedFourCurrentBindingRepairGoalIds': [fcc] + [r['goalId'] for r in owners],
    'expectedFutureStrict90Of376': True, 'forceCountOrStatus': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0}
write('integration-plan.json', plan)

# Copy only this new own dossier into its physical leaf in the existing isolate.
dest = ISO / REL
assert not dest.exists()
shutil.copytree(OWN, dest, symlinks=False)
print(json.dumps({'reviewableDossier': str(REL), 'futureDeltaFiles': 24, 'futureUnchangedFiles': 49, 'exactAResiduals': len(residual_proof), 'oldJPGRemovalsPlannedOnly': 6, 'protectedStrictBaseline': 85}))
