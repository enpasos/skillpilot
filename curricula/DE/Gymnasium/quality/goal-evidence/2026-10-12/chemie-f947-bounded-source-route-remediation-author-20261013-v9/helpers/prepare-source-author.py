# Apache-2.0. Inactive single-component source author proposal; no review votes.
from pathlib import Path
import collections, copy, datetime, hashlib, json, os, shutil

R = Path('/home/enpasos/projects/skillpilot')
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
F = E / 'chemie-f947-bounded-source-route-remediation-author-20261013-v9'
X = R / 'tmp/chemie-f947-source-author-overlay-20261013-v9'
G = 'f947cd04-952a-5a9d-9445-3ffc70e02c3c'
AUDIT = E / 'chemie-f947-one-explicit-task-fresh-independent-a-20261013-v8/source/whole-selected34-source-operator-route-partner-scope.actual.json'
CAN = R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
CONFIG = R / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
BASESHA = 'sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
rd = lambda p: json.loads(p.read_text())
h = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
rp = lambda p: str(p.relative_to(R))
bind = lambda p: {'path': rp(p), 'sha256': h(p), 'bytes': p.stat().st_size}

def wr(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists(): assert rd(p) == data, p
    else: p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

assert h(CAN) == BASESHA
audit = rd(AUDIT)
assert len(audit['rows']) == 34
config = rd(CONFIG)
selected = set(config['mappingPaths'])
row_by_source = {row['sourceGoalId']: row for row in audit['rows']}
false = {row['sourceGoalId'] for row in audit['rows'] if row['scientificComponentAssessment'].startswith('Literal clause')}
explicit = {row['sourceGoalId'] for row in audit['rows'] if row['scientificComponentAssessment'].startswith('Supports')}
generic = {row['sourceGoalId'] for row in audit['rows'] if row['scientificComponentAssessment'].startswith('Related')}
assert (len(false), len(explicit), len(generic)) == (24, 8, 2)
assert all('Polyadd' in row_by_source[id]['literalSourceText'] or 'Polyurethan' in row_by_source[id]['literalSourceText'] for id in explicit)
author_rows = []
for row in audit['rows']:
    id = row['sourceGoalId']
    author_rows.append({
        'sourceGoalId': id, 'literalSourceText': row['literalSourceText'], 'sourceRef': row['sourceRef'],
        'sourceSpan': row['literalSourceSpan'], 'courseLevel': row['courseLevel'],
        'sourceBinding': row['extractionBinding'], 'otherTargetPartners': [route['targetPartnerIds'] for route in row['currentMappingRoutes']],
        'authorProposal': 'remove only false f947 component or stop inherited component by boundary' if id in false else 'retain bounded explicit polyaddition/PU component' if id in explicit else 'retain generic partial component pending independent source judgment',
        'grounding': 'Own author reading of full literal; prior independent A finding retained as a finding, not a new author acceptance vote',
        'independentApproval': False, 'fullSourceClauseOrSiblingUnionApproved': False, 'practicalExecutionApproved': False,
    })
wr(F / 'source/selected34-literal-component-author-proposals.json', {
    'schemaVersion': 1, 'reviewAuthority': 'scientific_author_candidate', 'goalId': G,
    'explicitBoundedClauses': 8, 'genericPartialHeldClauses': 2, 'falseComponentsIncludingInheritedNI': 24,
    'independentSourceFinding': bind(AUDIT), 'records': author_rows,
})
(F / 'inputs').mkdir(parents=True, exist_ok=True)
shutil.copyfile(AUDIT, F / 'inputs/original-independentA-34-row-source-finding.exact.json')
shutil.copyfile(CAN, F / 'inputs/current-canonical523-current402.raw-exact.json')
shutil.copyfile(CONFIG, F / 'inputs/current-source-atlas-config.raw-exact.json')

all_mapping_files = [p for p in (R / 'curricula/DE').rglob('*.json') if 'mapping' in p.parts and 'quality' not in p.parts]
direct = []
plans = []
extra = []
for path in sorted(all_mapping_files):
    original = rd(path)
    rows = [row for row in original.get('mappings', []) if row.get('canonicalGoalId') == G]
    if not rows: continue
    for row in rows:
        if row.get('legacyGoalId') not in row_by_source:
            extra.append({'mappingPath': rp(path), 'row': row})
    direct.append({'mappingBinding': bind(path), 'selectedBySourceAtlas': rp(path) in selected,
                   'sourceLandscapeId': original.get('sourceLandscapeId'), 'sourceExtractionPath': original.get('sourceExtractionPath'),
                   'wholeDirectF947Rows': rows})
    removed = [row for row in rows if row.get('legacyGoalId') in false]
    if not removed: continue
    candidate = copy.deepcopy(original)
    candidate['mappings'] = [row for row in candidate['mappings'] if not (row.get('canonicalGoalId') == G and row.get('legacyGoalId') in false)]
    changed_decisions = []
    for decision in candidate.get('decisions', []):
        if decision.get('sourceGoalId') in false and G in decision.get('canonicalGoalIds', []):
            original_decision = next(row for row in original['decisions'] if row['sourceGoalId'] == decision['sourceGoalId'])
            decision['canonicalGoalIds'] = [id for id in decision['canonicalGoalIds'] if id != G]
            assert decision['canonicalGoalIds'], decision
            assert {k: v for k, v in decision.items() if k != 'canonicalGoalIds'} == {k: v for k, v in original_decision.items() if k != 'canonicalGoalIds'}
            changed_decisions.append(decision['sourceGoalId'])
    # Every other whole row, partner ID, reviewer metadata and source path stays exact.
    assert candidate['mappings'] == [row for row in original['mappings'] if row not in removed]
    for decision in candidate.get('decisions', []):
        old = next(row for row in original['decisions'] if row['sourceGoalId'] == decision['sourceGoalId'])
        assert decision == ({**old, 'canonicalGoalIds': [id for id in old['canonicalGoalIds'] if id != G]} if old['sourceGoalId'] in changed_decisions else old)
    rel = path.relative_to(R / 'curricula/DE/Gymnasium/mapping')
    old_owned = F / 'history/original-live-mapping-bytes' / rel
    old_owned.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, old_owned)
    future_name = path.stem + '.f947-component-author-pending-20261013-v9.json'
    future_live = path.parent / future_name
    candidate_owned = F / 'candidate/current-mapping-successors' / rel.parent / future_name
    wr(candidate_owned, candidate)
    archive_live = R / 'curricula/DE/Gymnasium/mapping/author-f947-route-history/quality/20261013-v9' / rel
    plans.append({'originalLiveBinding': bind(path), 'originalByteExactOwnedArchive': bind(old_owned),
                  'proposedFutureLivePath': rp(future_live), 'proposedFutureArchivePath': rp(archive_live),
                  'authorCandidateBinding': bind(candidate_owned), 'selectedBySourceAtlas': rp(path) in selected,
                  'removedOnlyFalseF947FlatRows': removed, 'changedOnlyF947DecisionComponents': changed_decisions,
                  'otherWholeRowsAndPartnerIdsExact': True, 'allSourceExtractionAndPrimaryBytesUnchanged': True,
                  'legacyReviewerMetadataRetainedForRemainingComponents': True, 'authorAmendmentNotIndependentlyApproved': True})
assert len(direct) == 39 and sum(len(x['wholeDirectF947Rows']) for x in direct) == 82
assert len(plans) == 23 and sum(len(x['removedOnlyFalseF947FlatRows']) for x in plans) == 51
assert {r['row']['legacyGoalId'] for r in extra} == {'c6d28506-6412-4ce8-9b4f-f1b451a73a18'}
he_snapshot = R / 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_CHEMIE.de.json.snapshot'
he_goal = next(g for g in rd(he_snapshot)['goals'] if g['id'] == extra[0]['row']['legacyGoalId'])
assert 'Polyurethan' in he_goal['description']
wr(F / 'source/all-active-flat-aliases39-direct82.author-inventory.json', {
    'schemaVersion': 1, 'goalId': G, 'allActiveDirectFiles': len(direct), 'allActiveDirectRows': 82,
    'affectedFiles': len(plans), 'falseDirectFlatRowsToRemove': 51, 'falseSelectedRows': 23,
    'unknownRemainingDirectSourceIds': [], 'legacyDifferentHEIdRetained': {'sourceSnapshot': bind(he_snapshot), 'wholeSourceGoal': he_goal, 'mappingInstances': extra},
    'records': direct, 'authorSourceVote': False,
})
replacement = {p['originalLiveBinding']['path']: p['proposedFutureLivePath'] for p in plans}
future_config = copy.deepcopy(config)
future_config['mappingPaths'] = [replacement.get(path, path) for path in config['mappingPaths']]
selected_successors = sum(path in replacement for path in config['mappingPaths'])
assert selected_successors == 10  # NI's selected ancestor mapping stays exact; the leaf boundary removes its inheritance.
wr(F / 'candidate/source-atlas-author-current-config.json', future_config)
boundary = rd(CAN)
goal = next(g for g in boundary['goals'] if g['id'] == G)
goal.setdefault('extendedData', {})['applicabilityMappingInheritance'] = 'boundary'
wr(F / 'candidate/canonical523-current402.boundary-only.author.json', boundary)
wr(F / 'SOURCE_ROUTE_PLAN.only-f947-components-author-pending.json', {
    'schemaVersion': 1, 'goalId': G, 'currentCanonical': bind(CAN), 'current402Protected231': True,
    'authorProposedSourceChanges': plans, 'selectedSourceReviewSuccessors': selected_successors,
    'archiveRule': 'Retain byte-exact old versions in an exact quality directory; existing discovery skips quality. New current successors retain every other component. No old bytes are edited.',
    'historicalExternalPathReferencesNeedExplicitRootIntegrationAudit': True,
    'canonicalBoundaryProposal': bind(F / 'candidate/canonical523-current402.boundary-only.author.json'),
    'scopeCorrectionAfterNormalCompilationPending': True, 'overridesUsedForPruning': False,
    'independentSourceApproval': False, 'practicalExecutionApproval': False, 'newScientificCompletion': 0,
    'sourcePrimaryAndExtractionWrites': False, 'proposedActiveIntegration': False, 'plannedActiveOrGitWrites': False,
})

# Disposable overlay. Copied compiler/discovery bytes retain their normal root-relative behavior.
assert not X.exists(), X
for directory, dirs, files in os.walk(R / 'curricula', followlinks=False):
    relative = Path(directory).relative_to(R)
    target_dir = X / relative
    target_dir.mkdir(parents=True, exist_ok=True)
    if 'quality' in dirs:
        source_quality = Path(directory) / 'quality'
        private_quality = target_dir / 'quality'
        private_quality.mkdir()
        for child in source_quality.iterdir():
            destination = private_quality / child.name
            if child.name == 'goal-book-publication':
                destination.mkdir()
                for file in child.iterdir():
                    if file.is_file(): shutil.copyfile(file, destination / file.name)
                    else: (destination / file.name).symlink_to(file, target_is_directory=file.is_dir())
            else: destination.symlink_to(child, target_is_directory=child.is_dir())
        dirs.remove('quality')
    for name in files:
        if name.endswith('.json'):
            (target_dir / name).symlink_to(Path(directory) / name)
(X / 'app/scripts').mkdir(parents=True, exist_ok=True)
for name in ['applicabilityCompiler.ts', 'memoryCardReviewConfigDiscovery.ts']:
    shutil.copyfile(R / 'app/scripts' / name, X / 'app/scripts' / name)
(X / 'app/src').symlink_to(R / 'app/src', target_is_directory=True)
(X / 'app/node_modules').symlink_to(R / 'app/node_modules', target_is_directory=True)
for path in config.get('sourceDocumentSnapshots', []):
    source = R / path['path']
    dest = X / path['path']
    if source.is_file() and not dest.exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.symlink_to(source)
wr(F / 'checks/disposable-overlay-preparation.actual.json', {
    'schemaVersion': 1, 'overlayPath': rp(X), 'canonicalBaselineSha256': h(CAN),
    'unmodifiedExecutedModuleCopies': [bind(X / 'app/scripts' / p) for p in ['applicabilityCompiler.ts', 'memoryCardReviewConfigDiscovery.ts']],
    'readThroughSourceAndQualityInputs': True, 'mutableQualityParentAndGoalBookPublicationLedgersPrivateRegular': True, 'sourceHistoryEdits': False,
})
print(json.dumps({'authorPlans': 23, 'selectedSuccessors': selected_successors, 'falseDirectRows': 51, 'explicitClauses': 8, 'genericHeld': 2, 'inheritedNIBoundaryCandidate': True, 'activeWrites': False, 'overlay': rp(X)}))
