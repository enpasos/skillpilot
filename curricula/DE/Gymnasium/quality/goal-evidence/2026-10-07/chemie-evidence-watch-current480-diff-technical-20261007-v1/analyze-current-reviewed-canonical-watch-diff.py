# SPDX-License-Identifier: Apache-2.0
"""Readonly native watch analysis; writes evidence only inside this dossier."""
from pathlib import Path
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import subprocess

root = Path.cwd()
own = Path(__file__).resolve().parent
integration = own.parent / 'chemie-four-plus-d2cc-reviewed-integration-preparation-technical-20261007-v1'
rel = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
read = lambda p: json.loads(p.read_text())
def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(root)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
watch_script = root / 'scripts/canonical_chemistry_evidence_watch.py'
module_spec = importlib.util.spec_from_file_location('canonical_chemistry_evidence_watch_readonly', watch_script)
watch = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(watch)
manifest_path = root / 'curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json'
manifest = read(manifest_path)
baseline_path = root / manifest['baselinePath']
baseline = read(baseline_path)
assert baseline['updatedAt'] == '2026-10-07T09:30:06Z'
original_baseline = baseline_path.read_bytes()
original_current = (root / rel).read_bytes()
old_path = integration / 'before' / rel
before = read(old_path)
current = read(root / rel)
assert current == read(integration / 'candidate/canonical.json')
assert original_current == (integration / 'candidate/canonical.json').read_bytes()
head_bytes = subprocess.check_output(['git', 'show', 'HEAD:' + rel])
assert head_bytes == old_path.read_bytes()
mode = watch.hash_mode(rel)
def evidence_sha(value):
    return hashlib.sha256(watch.canonical_evidence_payload(deepcopy(value))).hexdigest()
old_hash = evidence_sha(before)
new_hash = evidence_sha(current)
baseline_row = next(row for row in baseline['watchedFiles'] if row['relativePath'] == rel)
assert mode == baseline_row['hashMode'] == 'canonical-evidence-json-v1'
assert old_hash == baseline_row['sha256'] == '2e63a6cf788cdc63aba5ce87f6717b8b5e94fb6993375ef15a45d83fc91cebcb'
assert new_hash == '283f74fc9517b682961c10e4ea537c8246a753ccd3ec589814bbbf5a8ed0f98b'
delta, changed, added_paths, removed_paths, unchanged = watch.diff_records(manifest, baseline)
assert changed == [rel] and not added_paths and not removed_paths
history_path = own / 'before/chemistry-evidence-watch-baseline-20261007-093006.exact.json.bin'
history_path.parent.mkdir(parents=True, exist_ok=True)
with history_path.open('xb') as handle:
    handle.write(original_baseline)
baseline_binding = bind(history_path)
old = {g['id']: g for g in before['goals']}
new = {g['id']: g for g in current['goals']}
support = '417e65ec-68be-5f2e-9452-c3ba9b1d362f'
parent = 'f97b9c87-16d0-58fd-bcb2-c51574aa36d0'
context = 'd2ccd1d5-56f7-583f-9724-e97441367f91'
ids = ['9e656697-fc05-5aa9-9aca-871af2e89eb7', 'f0939f88-a6af-5334-ac4d-5d54732af25a', '28bb9d15-f865-5843-a035-6066580fea64', '1c1420c2-a8e2-520f-8015-6df637a973bd']
assert len(old) == 479 and len(new) == 480
assert list(new)[:-1] == list(old)
assert set(new) - set(old) == {support} and not set(old) - set(new)
assert {k: v for k, v in before.items() if k != 'goals'} == {k: v for k, v in current.items() if k != 'goals'}
changes = []
for goal_id, old_goal in old.items():
    if old_goal == new[goal_id]:
        continue
    fields = []
    for key in sorted(set(old_goal) | set(new[goal_id])):
        if old_goal.get(key) == new[goal_id].get(key):
            continue
        category = ('presentation_only_excluded_by_existing_watch_mode' if key == 'resourceLinks' else
                    'existing_current_primary_source_provenance_binding' if key == 'extendedData' else
                    'reviewed_didactic_prerequisite_sequence' if key == 'requires' else
                    'reviewed_memory_support_composition_scope' if key == 'contains' else
                    'reviewed_whole_bilingual_goal_semantics')
        fields.append({'field': key, 'before': old_goal.get(key), 'after': new[goal_id].get(key), 'category': category, 'includedInCurrentNativeWatchHash': key != 'resourceLinks'})
    changes.append({'goalId': goal_id, 'wholeCurrentGoalTitle': new[goal_id]['title'], 'fullChangedFieldValues': fields})
assert {r['goalId'] for r in changes} == set(ids) | {parent}
assert len([g for g in old if old[g] == new[g]]) == 474
assert old[context] == new[context]
assert new[parent]['contains'] == old[parent]['contains'] + [support]
assert new[support]['requires'] == [context]
def reverse(universe, goal_id):
    return sorted(g['id'] for g in universe.values() if goal_id in g.get('requires', []))
reverse_before = reverse(old, context)
reverse_after = reverse(new, context)
assert reverse_after == sorted(reverse_before + [support])

def resolve_payload(directory, row):
    path = row['path']
    return root / path if path.startswith(('curricula/', 'app/', 'backend/', 'docs/', 'scripts/')) else directory / path
def verify_seal(path, expected=None):
    if expected:
        assert bind(path)['sha256'] == expected.removeprefix('sha256:')
    data = read(path)
    rows = data.get('payloads', data.get('files', data.get('ownFiles')))
    assert isinstance(rows, list)
    for row in rows:
        payload = resolve_payload(path.parent, row)
        digest = row.get('digest', row.get('sha256')).removeprefix('sha256:')
        assert bind(payload)['sha256'] == digest and payload.stat().st_size == row['bytes'], payload
    return {'seal': bind(path), 'actualPayloadsVerified': len(rows), 'role': data.get('role', data.get('documentType')), 'historicalJudgmentNotRepeated': True}
source_seals = read(integration / 'checks/source-seals.actual.json')
verified = {key: verify_seal(root / row['seal']['path'], row['seal']['sha256']) for key, row in source_seals.items()}
verified['technicalIntegration'] = verify_seal(integration / 'technical.final.sealed.json')
dual = read(integration / 'checks/native-D4-D1-prepared-dual-synthesis.actual.json')
assert len(dual['D']) == 2
for segment in dual['D']:
    assert segment['nativePreparedBatchPASS'] and segment['nativeDualSummaryPASS'] and segment['nativeSynthesisPASS']
    assert all(not row['errors'] and row['nativeLowerDescriptionComplete'] for row in segment['resolutions'])
positive = read(integration / 'positive/P4-sealed-science-lineage.technical.json')
assert len(positive['records']) == 4 and positive['cases'] == 8
assert all(r['bodyExact'] and r['statusAndAuthorityAndE1G1AndDissentExact'] and not r['newBlindPManifestInvented'] for r in positive['records'])
for row in positive['records']:
    assert (root / row['currentFreshA']).is_file() and (root / row['currentFreshB']).is_file()
atomic_memory = read(integration / 'checks/native-all-current-A-and-M378-real-views.actual.json')
assert all(row['exitCode'] == 0 for row in atomic_memory['A'])
assert atomic_memory['M']['exitCode'] == 0
visibility = read(integration / 'checks/seven-exact-current-visibility-bindings.actual.json')
assert len(visibility['views']) == 7 and visibility['visibilityScopeCoverageRequired']
for row in visibility['views']:
    assert (root / row['reviewedSnapshot']['path']).read_bytes() == (root / row['actualCurrentView']['path']).read_bytes()
    assert bind(root / row['actualCurrentView']['path'])['sha256'] == row['actualCurrentView']['sha256'].removeprefix('sha256:')
current_kinds_path = root / 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
current_kinds = read(current_kinds_path)
assert current_kinds == read(integration / 'candidate/semantic-kinds.future-active.json')
support_kind = next(row for row in current_kinds['decisions'] if row['goalId'] == support)
assert support_kind['semanticKind'] == 'memory' and current_kinds['counts']['curricularAtomic'] == 378
source_bindings = []
for goal_id in ids:
    source_id = new[goal_id]['extendedData']['provenance']['sourceGoalId']
    stage = 'lower-secondary' if goal_id == ids[0] else 'upper-secondary'
    filename = 'DE_HE_CHEMIE_SEKI_G9.source-extraction.json' if stage == 'lower-secondary' else 'DE_HE_CHEMIE_SEKII_KC2024_CURRENT2026.source-extraction.json'
    path = root / f'curricula/DE/Gymnasium/input/HE/{stage}/source-extraction/{filename}'
    source = read(path)
    actual = next(g for g in source['sourceGoals'] if g['id'] == source_id)
    source_bindings.append({'goalId': goal_id, 'newAlreadyReviewedSourceGoalId': source_id, 'currentExistingSourceExtraction': bind(path), 'currentExistingSourceGoalValueSha256': hashlib.sha256(json.dumps(actual, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest(), 'sourceBodyChangedInThisWatchDelta': False, 'sourceScopeOrWholeCountryClearanceClaimed': False})
full_diff = own / 'actual-whole479-to480-canonical-field-diff-and-watch-effect.json'
write(full_diff, {'role': 'Actual structural JSON and unchanged-native-watch-mode technical diff; not a new scientific review', 'immutableBefore479': bind(old_path), 'exactCurrent480': bind(root / rel), 'exactPreviouslyReviewedCurrent480Candidate': bind(integration / 'candidate/canonical.json'), 'nativeWatchScript': bind(watch_script), 'baselineImmutableHistory': baseline_binding, 'beforeNativeEvidenceHash': old_hash, 'afterNativeEvidenceHash': new_hash, 'baselineHashExactlyReproducedFromHEADAndBeforeSnapshot': True, 'unchangedTopLevelMetadataAndOriginalGoalOrder': True, 'removedGoals': [], 'changedExistingGoals': changes, 'addedWholeReviewedMemoryGoal': new[support], 'unchangedWholeOldGoals': 474, 'actualContextGoalWholeUnchanged': {'goalId': context, 'wholeGoalExact': True, 'reverseRequiresBefore': reverse_before, 'reverseRequiresAfter': reverse_after, 'effect': 'Only new downstream memory support references the unchanged indicator competence; d2cc direct requires was not changed'}, 'unrelatedGoalSourceRouteMetadataChanges': 0, 'existingFourPrimarySourceBindingWitnesses': source_bindings, 'presentationOnlyResourceChangesExcluded': 4, 'watchFilterBroadenedOrWeakened': False, 'semanticKindCurricularAtomicBeforeAndAfter': 378, 'sourceClearanceOrGateStatusRaisedByThisAnalysis': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
coverage_path = own / 'actual-existing-independent-review-and-native-binding-lineage.verification.json'
write(coverage_path, {'role': 'Actual integrity/coverage verification of existing reviews; no additional independent scientific verdict', 'actualVerifiedExistingSeals': verified, 'wholeGoalSourceScopeScienceFor9e28': [bind(root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-four-current-independent-a-20261007-v1/first-scientific-observations.json'), bind(root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-four-current-independent-b-20261007-v2/first-scientific-observations.actual.json')], 'twoCorrectedPNGWholeGoalAndCurrentSourceContextScience': [verified['correctedA'], verified['correctedB']], 'actualAdded417eReverseD2ccContextReviews': [verified['contextA'], verified['contextB']], 'currentD4AndD1DualResolution': bind(integration / 'checks/native-D4-D1-prepared-dual-synthesis.actual.json'), 'currentP4ActualEightUnchangedWholeCasesAndTruthfulE1G1Status': bind(integration / 'positive/P4-sealed-science-lineage.technical.json'), 'initialNativeAStale28DiagnosticNotCountedAsPASS': bind(integration / 'checks/native-A2-M378.actual.json'), 'subsequentNativeAllCurrentAAndM378RealViewsPASS': bind(integration / 'checks/native-all-current-A-and-M378-real-views.actual.json'), 'retained28AtomicityActualPairedScienceAndBinding': bind(integration / 'checks/retained-28-atomicity-current-binding.actual.json'), 'sevenExactRealMemoryVisibilityViews': bind(integration / 'checks/seven-exact-current-visibility-bindings.actual.json'), 'memoryScopeTargetBeforeAfterProof': bind(integration / 'checks/seven-actual-view-before-after-target-counts.json'), 'actualCurrentSelectedV173AndProtected169Bindings': bind(integration / 'checks/V173-actual-selected-bindings-and-protected169.actual.json'), 'actualSourceAtlas48UnchangedViews': bind(integration / 'checks/current48-source-atlas-views-exact.actual.json'), 'actualCurrentKind417e': support_kind, 'allChangedIncludedCanonicalFieldsMatchExistingReviewedCandidateExactly': True, 'allUnrelatedCanonicalFieldsExact': True, 'notNewScientificSourceOrPageReview': True, 'noNewFullCountrySourceCoverage': True, 'noHumanOrRuntimeAcceptance': True, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
entry = own / 'neutral-readonly-watch-diff-recommendation.entry.json'
write(entry, {'role': 'Readonly recommendation for genuine reviewed-change technical synchronization; native baseline capture has not been executed', 'actualStructuralDiff': bind(full_diff), 'actualVerifiedExistingReviewLineage': bind(coverage_path), 'oldWatchBaselineExactImmutableSnapshot': baseline_binding, 'nativeHashModeUnchanged': mode, 'actualWatchChangedPaths': changed, 'actualWatchAddedPaths': added_paths, 'actualWatchRemovedPaths': removed_paths, 'actualUnchangedWatchedPaths': len(unchanged), 'recommendedAction': 'After retaining this immutable old baseline and passing the Root stable-integration gates, run existing native capture-baseline then render-delta/render-status and check-delta. This synchronizes already reviewed canonical changes; it is not a subject-matter review, gate lowering or M7 gain.', 'existingNativeCommands': ['python scripts/canonical_chemistry_evidence_watch.py capture-baseline', 'python scripts/canonical_chemistry_evidence_watch.py render-delta', 'python scripts/canonical_chemistry_evidence_watch.py render-status', 'python scripts/canonical_chemistry_evidence_watch.py self-test', 'python scripts/canonical_chemistry_evidence_watch.py check-delta'], 'newScientificContentOrReviewsIntroduced': False, 'pendingM7SourceOrCandidateHoldsStillOpen': True, 'activeBaselineChangedHere': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
(own / 'README.md').write_text('''# Chemistry evidence watch: actual current480 diff

Readonly analysis for the commit checkpoint. Exactly one watched path differs, with no added/removed watch paths. The native hash mode is unchanged: it excludes only goal-visualization resource-link metadata and retains texts, graph relations, source provenance and memory scope. The before479 sealed snapshot and HEAD reproduce the09:30 baseline2e63a6cf exactly; current480 matches the already reviewed/technically sealed integration candidate exactly and yields283f74fc.

The full JSON field diff records four existing goal changes plus the parent contains append and the one added reviewed memory417e.474 old whole goal bodies and all top-level metadata/order are unchanged. No applicability or other source scope field of an existing goal changes. D2cc itself, including its direct requires, is whole-value exact: its actual reverse context gains only the downstream memory goal. The new memory is outside the unchanged378 curricularAtomic denominator.

Existing scientific judgments remain original evidence, not repeated reviews: paired9e/28 whole text/source/case science, final corrected f093/1c actual PNG/source/page/P-compatible A/B judgments, genuine d2cc reverse-context A/B, actual compact-card decisions and seven current real visibility scopes. All original seals and actual payload bytes are verified. The original stale28 A-check diagnostic remains history; the subsequent current A/M pass and paired28 binding are authoritative. Technical packaging and hash verification are never called new scientific review or human approval.

Old rolling watch baseline bytes are preserved here as an immutable exact .json.bin snapshot. No baseline capture, active file change, new source closure, M7 completion or quality-floor change was performed. A native baseline synchronization is recommended only as technical registration of these already reviewed changes after the Root stable-integration checks. Keep all pending candidate/source holds and separate human release gates.

Neutral entry: neutral-readonly-watch-diff-recommendation.entry.json. Full changed values, actual hash effects and verified existing review/validation references are provided in the two linked JSON artifacts.
''')
assert baseline_path.read_bytes() == original_baseline
assert (root / rel).read_bytes() == original_current
seal = own / 'readonly-current480-watch-diff-analysis.freeze.json'
write(seal, {'schemaVersion': 1, 'role': 'Actual readonly native watch structural-diff and prior-review verification, no new science', 'recordedAt': datetime.now(timezone.utc).isoformat(), 'baselineNativeHashBefore': old_hash, 'currentNativeHashAfter': new_hash, 'changedWatchPaths': 1, 'currentEqualsExistingSealedReviewedCandidate': True, 'activeBaselineUntouched': True, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'payloads': [bind(p) for p in sorted(own.rglob('*')) if p.is_file()]})
for row in read(seal)['payloads']:
    assert bind(root / row['path']) == row
print(json.dumps({'readonlyAnalysisSeal': bind(seal), 'neutralEntry': bind(entry), 'verifiedExistingSeals': len(verified), 'verifiedExistingPayloads': sum(v['actualPayloadsVerified'] for v in verified.values()), 'oldBaselineExactlyReproduced': True, 'currentEqualsReviewedCandidate': True, 'activeWrites': 0, 'recommendation': 'Native baseline technical synchronization after Root integration checks; no new science or M7 gain'}))
