from pathlib import Path
from collections import defaultdict
import datetime
import hashlib
import json

root = Path('.')
base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
own = base / 'biologie-next-molecular-genetics-twenty-three-preparation-a-v1'
central_path = base / 'biologie-upper-science-fourteen-reviewed-integration-root-v1/checks/current-central-all-four-stable.stdout.actual.txt'
rollout_path = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
ledger_path = Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
atlas_inputs_path = Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
bound = {}

def bind(path):
    path = Path(path)
    data = path.read_bytes()
    result = {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
    bound[str(path)] = result
    return result

def load(path):
    bind(path)
    return json.loads(Path(path).read_text())

def value_digest(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def write(path, value):
    with path.open('x', encoding='utf-8') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')

report = load(central_path)
subject = next(x for x in report['subjects'] if x['subject'] == 'biologie')
config = next(x for x in load(rollout_path)['subjects'] if x['subject'] == 'biologie')
landscape = load(subject['landscapePath'])
goals = {g['id']: g for g in landscape['goals']}
current_ids = set(subject['currentGoalIds'])
strict_ids = set(subject['strictCompleteGoalIds'])
open_ids = current_ids - strict_ids
assert len(current_ids) == 394 and len(strict_ids) == 276 and len(open_ids) == 118
assert subject['gates'] == {'currentDescriptionResolutions': 276, 'currentPositiveEvidenceProfiles': 276, 'currentSemanticAtomicityDecisions': 394, 'currentMemoryReviewDecisions': 394, 'currentVisualizationQaRecords': 276}
assert not subject['issues'] and all(r['status'] == 'pass' for r in subject['requiredChecks'])
bind('app/scripts/reportDeepUnderstandingRollout.ts')

selected = [g['id'] for g in landscape['goals'] if g['id'] in open_ids
    and g.get('sourceRef', '').split(', ')[-1].startswith(('B12-EA.2.', 'B12-GA.2.', 'B9.3.'))
    and not any(word in g['title'] for word in ['Beratung', 'Diagnostik', 'ethisch', 'Stammzellen'])]
assert len(selected) == 23 and not set(selected) & strict_ids

ledger = load(ledger_path)
active_batches = [dict(configPath=p, wholeConfig=load(p)) for p in ledger['activeBatchConfigPaths']]
active_biology = [row for row in active_batches if row['wholeConfig'].get('subject') == 'biologie']
assert active_biology == []
historical = defaultdict(list)
for path in Path('curricula/DE/Gymnasium/quality/goal-description-review/biologie').rglob('*.config.json'):
    try:
        obj = json.loads(path.read_text())
    except (ValueError, UnicodeError):
        continue
    if not obj.get('batchId'):
        continue
    hits = set(obj.get('goalIds', [])) & open_ids
    if not hits:
        continue
    binding = bind(path)
    for goal_id in hits:
        historical[goal_id].append({'config': binding, 'batchId': obj['batchId'], 'currentlyReservedInActiveLedger': False})

qa = {r['goalId']: r for r in load(config['visualizationQaPath'])['records']}
kinds = {r['goalId']: r for r in load(config['semanticKindLedgerPath'])['decisions']}
am = {}
for gate, field in [('A', 'semanticAtomicityConfigPath'), ('M', 'memoryReviewConfigPath')]:
    c = load(config[field])
    p = Path(c['reviewPath'])
    file_binding = bind(p)
    rows = {}
    for index, line in enumerate(p.read_text().splitlines(), 1):
        if not line.strip():
            continue
        obj = json.loads(line)
        rows[obj['goalId']] = {'file': file_binding, 'line': index, 'wholeOriginalRecord': obj}
    am[gate] = rows

for path in config['resolutionIndexPaths'] + config['positiveEvidenceConfigPaths']:
    bind(path)

parents = defaultdict(set)
for g in landscape['goals']:
    for child in g.get('contains', []):
        parents[child].add(g['id'])

def eligible_ancestors(goal_id):
    found = set()
    todo = list(parents[goal_id])
    while todo:
        key = todo.pop()
        if key in found:
            continue
        found.add(key)
        if goals[key].get('extendedData', {}).get('applicabilityMappingInheritance') != 'boundary':
            todo.extend(parents[key])
    return found

ancestors = {key: eligible_ancestors(key) for key in open_ids}
relevant_targets = open_ids | set().union(*ancestors.values())
atlas = load(atlas_inputs_path)
source_rows = []
by_goal_sources = defaultdict(list)
unresolved_source_goals = []
source_partner_ids = set()
for map_path in atlas['mappingPaths']:
    mapping = load(map_path)
    ext_path = mapping.get('sourceExtractionPath')
    if not ext_path:
        unresolved_source_goals.append({'mappingPath': map_path, 'reason': 'missing sourceExtractionPath'})
        continue
    extraction = load(ext_path)
    sg_by_id = {row['id']: row for row in extraction.get('sourceGoals', [])}
    passage_by_id = {row['id']: row for row in extraction.get('passages', [])}
    edges = mapping.get('mappings', [])
    for decision_index, decision in enumerate(mapping.get('decisions', [])):
        target_ids = decision.get('canonicalGoalIds', [])
        if not target_ids or not (set(target_ids) & relevant_targets):
            continue
        source_id = decision.get('sourceGoalId')
        sg = sg_by_id.get(source_id)
        if sg is None:
            unresolved_source_goals.append({'mappingPath': map_path, 'decisionIndex': decision_index, 'sourceGoalId': source_id, 'reason': 'source goal absent from bound extraction'})
        partner_ids = [key for key in target_ids if key in goals]
        source_partner_ids.update(partner_ids)
        linked = [key for key in sorted(open_ids) if key in target_ids or set(target_ids) & ancestors[key]]
        row_id = f'source-duty-{len(source_rows) + 1:04d}'
        source_rows.append({
            'rowId': row_id,
            'mappingBinding': bind(map_path), 'decisionJsonPointer': f'/decisions/{decision_index}',
            'wholeOriginalDecision': decision,
            'wholeOriginalMatchingEdges': [edge for edge in edges if edge.get('reviewDecisionId') == source_id or edge.get('legacyGoalId') == source_id],
            'extractionBinding': bind(ext_path),
            'wholeResolvedSourceGoal': sg,
            'wholeResolvedPassage': passage_by_id.get(sg.get('passageId')) if sg else None,
            'originalSourceDocuments': extraction.get('sourceDocuments', [extraction.get('sourceDocument')]),
            'wholeCanonicalPartnerGoalIds': partner_ids,
            'linkedOpenGoals': [{'goalId': key, 'bindingOrigin': 'direct' if key in target_ids else 'ancestor-with-boundary-preserved'} for key in linked],
            'newSourceApproval': False,
        })
        for key in linked:
            by_goal_sources[key].append(row_id)

frame_path = own / 'open118-whole-source-duty-and-partner-frame.neutral.json'
write(frame_path, {
    'schemaVersion': 1,
    'role': 'Exact currently configured source clauses, whole passages and canonical partner context for open goal preparation; original mapping decisions preserved as context only',
    'atlasInputs': bind(atlas_inputs_path), 'rows': source_rows,
    'canonicalWholePartnerGoals': [{'goalId': key, 'wholeGoal': goals[key], 'canonicalJsonPointer': f"/goals/{next(i for i,g in enumerate(landscape['goals']) if g['id'] == key)}", 'wholeGoalValueSha256': value_digest(goals[key])} for key in sorted(source_partner_ids)],
    'unresolvedSourceBindings': unresolved_source_goals,
    'sourceApproval': False, 'wholeCourseApproval': False, 'humanApproval': False,
})

candidate_path = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1/eleven-resolved-current-components-twentyfour-exact-cases.author.json')
existing = load(candidate_path)
reusable = {}
for index, component in enumerate(existing['components']):
    key = component.get('actualExistingCanonicalGoalId')
    if key not in selected:
        continue
    assert component['wholeCurrentGoal'] == goals[key]
    body = component['completeComponentAndCasesExactV5']
    reusable[key] = {'source': bind(candidate_path), 'jsonPointer': f'/components/{index}/completeComponentAndCasesExactV5', 'wholeGoalDescriptionExactCurrent': True, 'wholeCandidateMaterialValueSha256': value_digest(body), 'completeBilingualCases': len(body['tasks']), 'caseIds': [t['caseId'] for t in body['tasks']], 'reuseMode': 'historical bounded material input; current profile/native/source approval still required'}
assert len(reusable) == 2

reuse_path = own / 'two-existing-genetic-code-and-protein-mechanism-candidates.exact-neutral-reuse.json'
write(reuse_path, {'schemaVersion': 1, 'role': 'Unchanged whole bilingual historical author material reuse for two actual open current IDs; no inherited approval', 'rows': [{'goalId': key, 'binding': reusable[key], 'wholeCurrentGoal': goals[key], 'wholeHistoricalCandidateMaterial': next(c['completeComponentAndCasesExactV5'] for c in existing['components'] if c.get('actualExistingCanonicalGoalId') == key)} for key in selected if key in reusable], 'newApproval': False, 'humanApproval': False})

primary_receipt = load(own / 'three-actual-primary-routing-contexts.receipt.json')
for row in primary_receipt['records']:
    bind(row['htmlPath'])
    bind(row['fullTextPath'])

rows = []
for key in sorted(open_ids):
    g = goals[key]
    v = qa.get(key)
    assert v and v['visualizationState'] == 'missing' and v['missingReason'] == 'no_primary_link'
    assert not g.get('resourceLinks')
    rows.append({
        'goalId': key, 'selectedForNextPackage': key in selected,
        'wholeActiveGoal': g,
        'activeCanonicalJsonPointer': f"/goals/{next(i for i,item in enumerate(landscape['goals']) if item['id'] == key)}",
        'wholeActiveGoalValueSha256': value_digest(g),
        'currentSemanticKindDecision': kinds[key],
        'currentGates': {'D': 'missing_current_description_resolution', 'P': 'missing_current_positive_evidence_profile', 'A': 'current_preserve_exact', 'M': 'current_preserve_exact', 'V': 'missing_primary_link_and_current_approved_asset'},
        'gateDerivation': 'The actual central strict intersection has 276 members; each D/P/V ready set has exactly276 members and contains that intersection. Therefore those ready sets equal the strict set, and each remaining ID is missing all three. A/M ready sets each equal the entire394-ID scope. This is a set/count proof using the actual report and central implementation, not a new scientific review.',
        'currentAOriginalBinding': am['A'][key],
        'currentMOriginalBinding': am['M'][key],
        'currentWholeVisualizationQaRecord': v,
        'originalSourceRef': g.get('sourceRef'),
        'originalWholeProvenance': g.get('extendedData', {}).get('provenance'),
        'currentSourceDutyFrameRows': by_goal_sources[key],
        'sourceCoverageApprovalByThisPreparation': False,
        'activeLedgerOwnership': [],
        'historicalBatchMentionsNotActiveReservations': historical[key],
        'existingCandidateReuse': reusable.get(key),
    })
inventory_path = own / 'current118-open-goals-gates-source-ownership.neutral.json'
write(inventory_path, {'schemaVersion': 1, 'role': 'Actual current open118 neutral intake, whole DE/EN descriptions and original source/ledger bindings; no new reviews', 'centralReport': bind(central_path), 'canonical': bind(subject['landscapePath']), 'rows': rows, 'humanApproval': False, 'strictGain': 0})

fourteen = load(base / 'biologie-upper-science-fourteen-reviewed-integration-root-v1/strict-current-fourteen-new-closures.actual.json')
baseline_path = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie262-commit-checkpoint-root-20261008-v1/current-central-all-four-stable.stdout.actual.txt')
baseline = next(x for x in load(baseline_path)['subjects'] if x['subject'] == 'biologie')
baseline_ids = set(baseline['strictCompleteGoalIds'])
assert len(baseline_ids) == 262 and baseline_ids <= strict_ids
new14 = strict_ids - baseline_ids
assert len(new14) == 14 and not new14 & set(selected)

input_path = own / 'next-package.input.json'
write(input_path, {
    'schemaVersion': 1, 'packageId': 'biologie-next-molecular-genetics-twenty-three-existing-current-preparation-v1',
    'role': 'Neutral preparation of next existing-goal author package; no independent acceptance or active integration',
    'preparedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'centralReport': bind(central_path), 'centralCurrent': subject,
    'preserveExactStrict262GoalIds': sorted(baseline_ids), 'preserveExactReviewed14GoalIds': sorted(new14),
    'open118Inventory': bind(inventory_path), 'currentWholeSourcePartnerFrame': bind(frame_path),
    'activeLedger': bind(ledger_path), 'activeBiologyReservationsFound': [],
    'selectedGoalCount': len(selected), 'selectedGoalIds': selected,
    'selectedWholeGoalRows': [row for key in selected for row in rows if row['goalId'] == key],
    'selectionReason': 'Twenty-three existing open IDs share the concrete BY9 genetics/BY12 GA-EA genetics source frame and can be authored in one finite mechanism/inheritance package. All have D/P/V gaps and already-current A/M. Whole GA/EA variants and two SekI mutation limits are retained. The remaining95 open IDs are excluded from this package.',
    'selectedCurrentMissingGates': {'D': 23, 'P': 23, 'V': 23, 'A': 0, 'M': 0},
    'selectedUnchangedCurrentResources': 'All23 currently have no resourceLinks and QA no_primary_link. No existing asset is replaced or reapproved in this preparation.',
    'existingWholeMaterialReuse': bind(reuse_path), 'existingWholeMaterialReuseGoals': list(reusable), 'existingWholeMaterialReuseBilingualCases': 4,
    'newPProfilesWrittenByThisPreparation': 0, 'newPCasesWrittenByThisPreparation': 0,
    'actualPrimaryRoutingContexts': primary_receipt,
    'primaryContextReadScope': 'Current entire BY12 EA/GA genetics learning-area sections and BY9 genetics section were read for package scope; all other source clauses remain bound current extraction context and require subsequent actual primary review.',
    'requiredNextRoles': {'materialAuthor': 'separate prospective author phase, reuse four exact historical cases and complete whole23/46 heterogeneous cases where supported', 'independentAandB': 'two genuine independent whole science/source/P reviews after author first freeze', 'nativeD': 'two blind ordinary rounds on final exact native23 pages', 'P': 'ordinary final-resource/profile/case binding after independent whole material judgments', 'V': 'actual original/360/680 raster reviews on newly needed23 assets in a separate authorized production phase', 'AM': 'preserve current23 exact records; targeted fresh review only if semantics actually changes'},
    'preservedScopeLimits': ['No whole source or course HOLD is lifted', 'All original source operators, course/stage/duration/content duties and existing source partners survive', 'BY12 EA repair-enzymes/organisation-level/crossing/epigenetics extras are not projected universally onto GA; SekI meiosis/phenotype limits remain', 'Synthetic datasets and hypothetical interventions are material candidates, not real experiments or learner evidence', 'No clinical efficacy, personal treatment or actual learner performance is claimed', 'No current Chemistry Source22 or AM-B judgments were read', 'No historical reviews are restarted or rewritten'],
    'allRelevantActualInputBindings': list(bound.values()),
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0, 'activeWrites': [],
})
with (own / 'whole-open118-bilingual-description-reading.txt').open('x', encoding='utf-8') as out:
    for row in rows:
        g = row['wholeActiveGoal']
        out.write(f"{row['goalId']} | {g['title']}\nDE: {g['description']}\nEN: {g.get('descriptionEn', '')}\n\n")
print(json.dumps({'selectedGoalIds': selected, 'selected': len(selected), 'open': len(rows), 'sourceDutyRows': len(source_rows), 'wholeSourcePartners': len(source_partner_ids), 'unresolvedSourceBindings': len(unresolved_source_goals), 'selectedDirectHistoricalMaterialReuse': len(reusable), 'selectedWithHistoricalBatches': sum(bool(historical[k]) for k in selected), 'input': bind(input_path)}, indent=2))
