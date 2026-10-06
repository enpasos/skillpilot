import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

root = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
author = root / 'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2'
review = root / 'biologie-q2-neurobiology-twenty-one-source-p-v2-independent-a-v1'
out = root / 'biologie-neuro-outside-fifty-two-source-restoration-worklist-v1'
out.mkdir(exist_ok=True)
assert not (out / 'outside-source-worklist.final.freeze.json').exists()
now = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    path = Path(path)
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}


def write(name, content):
    (out / name).write_text(json.dumps(content, ensure_ascii=False, indent=2) + '\n')


impact = read(review / 'independent-preservation-and-impact.actual.receipt.json')
file_pairs = read(author / 'source-candidate-files.actual.exact-deltas.json')['files']
holds = read(author / 'final-source.actual.partial-partner-preservation-and-whole-holds.json')['actualCurrentWholeSourceDecisionHolds']
canonical_path = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
canonical = read(canonical_path)
by_id = {g['id']: g for g in canonical['goals']}
inputs = {str(canonical_path): binding(canonical_path)}
map_pairs = {row['originalPath']: row for row in file_pairs if '/mapping/' in row['originalPath']}
source_cache = {}
packages = {}
for map_path, pair in map_pairs.items():
    original = read(map_path)
    candidate = read(pair['candidatePath'])
    assert binding(map_path)['sha256'] == pair['originalSha256']
    assert binding(pair['candidatePath'])['sha256'] == pair['candidateSha256']
    inputs[map_path] = binding(map_path)
    inputs[pair['candidatePath']] = binding(pair['candidatePath'])
    source_path = original['sourceExtractionPath']
    if source_path not in source_cache:
        extraction = read(source_path)
        source_cache[source_path] = (extraction, {g['id']: g for g in extraction.get('sourceGoals', extraction.get('goals', []))})
        inputs[source_path] = binding(source_path)
        primary = extraction.get('sourceDocument', {}).get('localPath') or extraction.get('sourceDocument', {}).get('path')
        if primary and Path(primary).is_file():
            inputs[primary] = binding(primary)
    packages[map_path] = (original, candidate, source_path)

held_details = []
for hold in holds:
    original, candidate, source_path = packages[hold['mappingPath']]
    source_id = hold['sourceGoalId']
    original_goal = source_cache[source_path][1].get(source_id)
    decisions_before = [d for d in original.get('decisions', []) if d.get('sourceGoalId') == source_id]
    decisions_after = [d for d in candidate.get('decisions', []) if d.get('sourceGoalId') == source_id]
    assert len(decisions_after) == 1 and decisions_after[0]['decision'] != 'mapped'
    targets = set(hold['canonicalGoalIdsRetainedAsDebt'])
    original_relations = [m for m in original.get('mappings', []) if m.get('legacyGoalId', m.get('sourceGoalId')) == source_id]
    original_extraction = source_cache[source_path][0]
    held_details.append({
        'mappingPath': hold['mappingPath'], 'candidateMappingPath': map_pairs[hold['mappingPath']]['candidatePath'],
        'jurisdiction': original.get('jurisdiction'), 'sourceLandscapeId': original.get('sourceLandscapeId'),
        'originalSourceGoalId': source_id, 'originalSourceGoalRecord': original_goal,
        'extractionSourcePath': source_path, 'extractionStage': original_extraction.get('stage'),
        'primaryDocument': original_extraction.get('sourceDocument'),
        'originalDecisionObjects': decisions_before, 'currentCandidateDecision': decisions_after[0],
        'originalRelationObjects': original_relations,
        'retainedDebtCanonicalTargets': [{'id': goal_id, 'title': by_id[goal_id]['title'], 'description': by_id[goal_id]['description']} for goal_id in sorted(targets)],
        'actualPrimaryRawTextReadInThisWorklist': False,
        'sourceGoalDescriptionIsNotAutomaticallyAnOfficialRawBullet': True,
        'wholeSourceCoverageApproved': False,
    })
assert len(held_details) == 31

pairs = []
for view in impact['outside21SourceViewTargetLosses']:
    jurisdiction, stage, course = view['key'].split('/')
    for goal_id in view['removedOutside21Ids']:
        anchors = []
        for item in held_details:
            if item['jurisdiction'] != jurisdiction:
                continue
            if goal_id not in {x['id'] for x in item['retainedDebtCanonicalTargets']}:
                continue
            anchors.append({'originalMappingPath': item['mappingPath'], 'candidateMappingPath': item['candidateMappingPath'],
                            'sourceLandscapeId': item['sourceLandscapeId'], 'sourceGoalId': item['originalSourceGoalId'],
                            'sourceExtractionPath': item['extractionSourcePath'], 'extractionStage': item['extractionStage'],
                            'sourceRef': (item['originalSourceGoalRecord'] or {}).get('sourceRef'),
                            'primaryDocument': item['primaryDocument'],
                            'exactStageOrCourseCoverageNotInferred': True})
        pairs.append({'goalId': goal_id, 'title': by_id[goal_id]['title'],
                      'canonicalDescription': by_id[goal_id]['description'],
                      'lostViewKey': view['key'], 'viewJurisdiction': jurisdiction, 'viewStage': stage,
                      'viewCourseProfile': course, 'heldSourceDebtAnchors': anchors,
                      'candidateRemedyStatus': 'pending_actual_primary_component_and_scope_review',
                      'nativeGoalVisibilityRestored': False, 'scientificApproval': False})
assert len(pairs) == 187
distinct = sorted({item['goalId'] for item in pairs})
assert len(distinct) == 52
write('outside52.actual-source-debt-and-view-worklist.json', {
    'schemaVersion': 1, 'createdAtUTC': now,
    'kind': 'mechanically derived targeted authoring worklist; no source or goal approval',
    'outsidePackageDistinctCanonicalGoals': 52, 'lostGoalViewPairs': 187,
    'wholeSourceDecisionHolds': 31, 'goalViewPairs': pairs, 'heldOriginalSourceRecords': held_details,
    'candidateTwoNWComponentsAlreadyInSeparateV3': ['49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd', '5b2571d9-f079-52b2-b21b-8f389c7409f4'],
    'sourceComponentAuthoringRule': 'Read each actual primary page and separate declared author aspects from original whole bullets. Retain literal whole obligation and residual debt. Current authored extraction labels, prior partial rows and source hashes alone are not source review.',
    'doNotRestoreWholeMappedDecisionAsShortcut': True,
    'originalAtlasExpectedCount': 383, 'originalAtlasActualCount': 375,
    'originalAtlasGate': 'FAIL', 'activeWrites': False, 'newStrictCompletions': 0,
    'restoredActiveBindings': 0, 'humanApproval': False, 'humanTrial': False,
})
groups = {}
for item in pairs:
    j = item['viewJurisdiction']
    groups.setdefault(j, {'goalIds': set(), 'pairs': 0, 'views': set()})
    groups[j]['goalIds'].add(item['goalId']); groups[j]['pairs'] += 1; groups[j]['views'].add(item['lostViewKey'])
summary = {j: {'distinctGoalCount': len(v['goalIds']), 'goalViewPairs': v['pairs'], 'views': sorted(v['views']), 'goalIds': sorted(v['goalIds'])} for j, v in sorted(groups.items())}
write('regional-disjoint-source-work-package-planning.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': now,
    'ownershipRecommendation': 'split authoring by jurisdiction mapping/extraction inputs; the same canonical goal may occur in independent views, so keep canonical editing under one integrator',
    'regions': summary, 'scientificSourceReviewsPerformed': 0,
    'pairsWithDirectHeldDebtAnchor': sum(bool(x['heldSourceDebtAnchors']) for x in pairs),
    'pairsRequiringAdditionalNativeSourceTrace': sum(not x['heldSourceDebtAnchors'] for x in pairs),
})
verification = root / 'chemie-q1-current378-active-integration-verification-v1'
checkpoint = read(verification / 'final-current-machine-checks-and-inputs.actual.json')['currentInputs']
for row in checkpoint:
    assert binding(row['path']) == row
write('actual-inputs-and-active-preservation.json', {
    'schemaVersion': 1, 'createdAtUTC': now, 'inputBindings': list(inputs.values()),
    'activeCurrentCheckpointInputs': checkpoint,
    'chemistryStrict': 112, 'chemistryAtoms': 378, 'biologyStrict': 67, 'biologyAtoms': 383,
    'activeWrites': False, 'newStrictCompletions': 0,
})
text = '''# Neurobiology: 52 outside goals, 187 lost source-view bindings

This mechanically derived worklist identifies actual original source-debt anchors for the independently observed candidate projection losses. It is not a source, description, task or mapping approval. It retains 31 whole-source decision holds and distinguishes 52 goal IDs from 187 goal/view pairs. The original 383 atlas contract remains FAIL at 375.

The detailed JSON includes current canonical descriptions, whole original extraction records and decisions, their primary document pointers, the precise lost views and matching held debt anchors. Source extraction descriptions may be authored operationalizations: they must not be copied as official original bullets. No primary raw text is claimed read by this worklist.

The next author should split by jurisdiction, read actual primary pages, propose only genuinely supported components with exact original parent text, preserve residual whole-bullet obligations and prove each source-stage/course target through the unchanged native compiler. Existing source rows, hashes and a prior mapped decision do not discharge this work. Pairs without a direct held anchor require native source tracing first. The two NW bacterial components already have a separate v3 author proposal; avoid duplicating them.

This worklist makes no canonical, runtime or active source edits. Current active strict coverage remains Chemistry 112/378 and Biology 67/383, with Mathematics and Physics M7 unchanged. Restored active bindings and new strict completions are zero. Human approval and trial remain separate.
'''
(out / 'README.md').write_text(text)
(out / 'materialize-source-restoration-worklist.py').write_bytes(Path(__file__).read_bytes())
external = [binding(review / 'independent-preservation-and-impact.actual.receipt.json'),
            binding(author / 'source-candidate-files.actual.exact-deltas.json'),
            binding(author / 'final-source.actual.partial-partner-preservation-and-whole-holds.json')]
files = [binding(p) for p in sorted(out.iterdir()) if p.is_file()]
write('outside-source-worklist.final.freeze.json', {'schemaVersion': 1, 'createdAtUTC': now,
    'freezeId': 'biologie-neuro-outside52-source-restoration-worklist-v1', 'files': files,
    'externalInputBindings': external, 'scientificReviewOrApproval': False, 'strictGain': 0})
print(json.dumps({'out': str(out), 'freeze': binding(out / 'outside-source-worklist.final.freeze.json'),
    'regions': {j: {k: v for k, v in row.items() if k != 'goalIds'} for j, row in summary.items()},
    'pairsWithDirectAnchor': sum(bool(x['heldSourceDebtAnchors']) for x in pairs), 'activeInputsExact': len(checkpoint)}))
