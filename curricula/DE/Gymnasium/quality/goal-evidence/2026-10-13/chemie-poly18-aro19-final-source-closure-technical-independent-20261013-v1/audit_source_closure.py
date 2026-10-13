"""Bounded read-only technical comparison of existing source judgments and merged bytes.

This is neither a source-science re-review nor a D/P/A/M/V approval. Writes stay
inside this artifact's directory; no compiler, model, native build or image read.
"""
import copy
import datetime
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
E12 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
EX = ROOT / 'tmp/chemie-q4-current220-prep/combined-poly18-aro19-execution-20261013-v1'
PREP = ROOT / 'tmp/chemie-q4-current220-prep'

def read(p):
    return json.loads(Path(p).read_text())

def sha(p):
    return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()

def objsha(v):
    return 'sha256:' + hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def rel(p):
    return str(Path(p).relative_to(ROOT))

def ref(p):
    p = Path(p)
    return {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}

def write(name, d):
    (OUT / name).write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def verify_binding(b, base=ROOT):
    p = base / b['path']
    expected = b['sha256'].removeprefix('sha256:')
    assert sha(p).removeprefix('sha256:') == expected, str(p)
    if 'bytes' in b:
        assert p.stat().st_size == b['bytes'], str(p)
    return p

def verify_seal(p):
    d = read(p)
    entries = next((d[k] for k in ('files', 'entries', 'ownFiles', 'ownedFiles') if k in d), None)
    assert entries, p
    checked = []
    for b in entries:
        pp = ROOT / b['path'] if b['path'].startswith(('curricula/', 'docs/', 'app/', 'tmp/')) else p.parent / b['path']
        expected = b['sha256'].removeprefix('sha256:')
        assert sha(pp).removeprefix('sha256:') == expected, pp
        if 'bytes' in b:
            assert pp.stat().st_size == b['bytes'], pp
        checked.append(ref(pp))
    return {'seal': ref(p), 'checkedFileCount': len(checked), 'allExact': True}

def key(field, row):
    if field in ('passages', 'sourceGoals'):
        return row['id']
    if field == 'decisions':
        return row['sourceGoalId']
    return (row['legacyGoalId'], row['canonicalGoalId'])

def apply_op(doc, op):
    f = op['field']
    if op['identity'] is None:
        assert (f in doc) == op['beforePresent']
        if op['beforePresent']:
            assert doc[f] == op['before']
        if op['afterPresent']:
            doc[f] = copy.deepcopy(op['after'])
        else:
            doc.pop(f, None)
        return
    ident = tuple(op['identity']) if isinstance(op['identity'], list) else op['identity']
    rows = doc[f]
    idx = [i for i, r in enumerate(rows) if key(f, r) == ident]
    assert len(idx) == int(op['beforePresent']), (op['origin'], f, ident)
    if idx:
        assert rows[idx[0]] == op['before'], (op['origin'], f, ident)
        if op['afterPresent']:
            rows[idx[0]] = copy.deepcopy(op['after'])
        else:
            del rows[idx[0]]
    else:
        assert op['afterPresent']
        rows.append(copy.deepcopy(op['after']))

plan_path = PREP / 'combined-poly18-aro19-source-staging.after-SN-label-correction.actual.json'
plan = read(plan_path)
prep = read(EX / 'outputs/preparation.actual.json')
impact = read(EX / 'outputs/current-vs-final523-goal-P-A-M-D-and-source-input-impact.actual.json')
summary = read(EX / 'outputs/source-scope-actual-summary-and-checkpoint-handoff.json')
metadata = read(EX / 'outputs/ordinary-combined-compiler-actual-metadata-deltas.json')
atlas = read(EX / 'outputs/source-atlas.final-actual-receipt.json')
checkpoint = read(E12 / 'chemie231-source-first-inactive-checkpoint-root-20261013-v1/RESUME.inactive-checkpoint.actual.json')

proof_specs = {
    'polymerV14': ('chemie-polymer20-source-ne-early-independent-a-20261013-v14', 'FINAL.independent-primary-source-and-NE-preflight.freeze.json'),
    'polymerV16': ('chemie-polymer20-targeted-source-course-fix-independent-a-20261013-v16', 'FINAL.targeted-source-course-partner-independent.freeze.json'),
    'polymerV18': ('chemie-polymer20-bounded-source-partner-fix-targeted-independent-a-20261013-v18', 'FINAL.bounded-source-partner-targeted-independent.freeze.json'),
    'aromaticsV6': ('chemie-aromatics20-primary-operator-early-independent-a-20261013-v6', 'SEAL.actual.json'),
    'aromaticsV8': ('chemie-aromatics20-targeted-source-and-case-fix-independent-a-20261013-v8', 'SEAL.actual.json'),
    'aromaticsV10': ('chemie-aromatics20-v9-bounded-source-and-Ar-fix-targeted-independent-a-20261013-v10', 'SEAL.actual.json'),
    'aromaticsV11': ('chemie-aromatics20-final-staged-SN-locators-targeted-independent-a-20261013-v11', 'SEAL.actual.json'),
}
proofs = {k: verify_seal(E12 / r / n) for k, (r, n) in proof_specs.items()}
proofs['checkpoint'] = verify_seal(E12 / 'chemie231-source-first-inactive-checkpoint-root-20261013-v1/SEAL.actual.json')

carriers = {r['originalBinding']['path']: r for r in plan['sourceAndMappingCarriers']}
assert len(carriers) == 80
expected = {}
physical = {}
carrier_checks = []
for origin, row in carriers.items():
    original = verify_binding(row['originalBinding'])
    expected[origin] = read(original)
    actual = EX / row['candidateBinding']['path']
    assert not actual.is_symlink() and actual.stat().st_nlink == 1, actual
    assert sha(actual) == row['candidateBinding']['sha256'], actual
    physical[origin] = read(actual)
    carrier_checks.append({'originalPath': origin, 'futurePath': row['candidateBinding']['path'], 'actualSHA256': sha(actual), 'physicalRegularFile': True})
for op in plan['wholeCellCASOperations']:
    apply_op(expected[op['origin']], op)

# Apply only the four objects actually approved in V10 and checked again in V11.
sn_patch_path = E12 / proof_specs['aromaticsV10'][0] / 'SN_LOCATOR_EXACT_CORRECTIONS.actual.json'
sn_patch = read(sn_patch_path)
sn_checks = []
for category in ('sourceCells', 'decisionCells'):
    for patch in sn_patch[category]:
        field, index = patch['pointer'].strip('/').split('/')
        doc = expected[patch['logicalPath']]
        i = int(index)
        assert doc[field][i] == patch['before']
        assert objsha(patch['after']) == patch['afterSha256']
        doc[field][i] = copy.deepcopy(patch['after'])
        assert physical[patch['logicalPath']][field][i] == patch['after']
        sn_checks.append({'logicalPath': patch['logicalPath'], 'pointer': patch['pointer'], 'sourceGoalId': patch['sourceGoalId'], 'afterObjectSHA256': objsha(patch['after']), 'exactAcceptedWholeObject': True})
assert len(sn_checks) == 4

for transport in plan['mergedExtractionTransportHeaders']:
    doc = expected[transport['originalMappingPath']]
    doc['sourceExtractionPath'] = transport['sourceExtractionPathAfter']
    for field, values in transport['existingDigestHeadersRewritten'].items():
        doc[field] = values['after'] if isinstance(values, dict) else values
for origin in carriers:
    assert expected[origin] == physical[origin], ('unexpected merged cell/header', origin)

for old in prep['retiredAliases']:
    assert not (EX / old).exists() and not (EX / old).is_symlink(), old
history_checks = []
for hist in plan['historicalRetention']['links']:
    p = EX / hist['historicalInputPath']
    assert p.exists() and not p.is_symlink(), p
    assert sha(p) == hist['afterRegularBytesSHA256'] == hist['beforeResolvedBytesSHA256'], p
    history_checks.append({'path': hist['historicalInputPath'], 'actualSHA256': sha(p), 'regularAndOriginalBytesExact': True})
assert len(history_checks) == 106
cp_future = {r['futureLiveBinding']['path']: r for r in checkpoint['candidateCarriers']}
for row in carriers.values():
    preserved = verify_binding(cp_future[row['candidateBinding']['path']]['inactiveCheckpointBinding'])
    assert preserved.read_bytes() == (EX / row['candidateBinding']['path']).read_bytes()

v16 = E12 / proof_specs['polymerV16'][0]
poly_plan = read(v16 / 'BOUNDED_PARTNER_ANCESTOR_FIXES.complete31-and42-carriers.independent.json')
poly_whole = read(v16 / 'PROTECTED19.whole-target-source-component-fit.independent.json')
v14 = E12 / proof_specs['polymerV14'][0]
poly_early = read(v14 / 'PER_GOAL.20-contexts-and-three-shared-protected-source-findings.independent.json')
poly_matrix = read(v14 / 'BATCH_MATRIX.52-deltas-and-110-exact-transports.independent.json')
v8 = E12 / proof_specs['aromaticsV8'][0]
aro_components = read(v8 / 'SOURCE_PARTNER_COMPONENT_FINDINGS.actual.json')
aro_method = read(v8 / 'CASE_AND_METHOD_PARTNER_FINDINGS.actual.json')
v6 = E12 / proof_specs['aromaticsV6'][0]
aro_early = read(v6 / 'PER_GOAL_FINDINGS.actual.json')

# Exact existing component plan, never a whole source-target union approval.
pair_checks = []
for p in poly_plan['rows']:
    doc = physical[p['originalLiveMappingPath']]
    d = next(r for r in doc['decisions'] if r['sourceGoalId'] == p['sourceGoalId'])
    assert d['decision'] == p['proposedDecision']
    assert d['canonicalGoalIds'] == p['proposedBoundedCanonicalGoalIds']
    actual_ids = {r['canonicalGoalId'] for r in doc['mappings'] if r['legacyGoalId'] == p['sourceGoalId']}
    assert actual_ids == set(p['proposedBoundedCanonicalGoalIds'])
    pair_checks.append({'sourceGoalId': p['sourceGoalId'], 'originalMappingPath': p['originalLiveMappingPath'], 'componentPlan': 'polymerV16', 'exactTargetsAndDecision': True})

aro_removed = []
aro_keep = []
for p in aro_components['components']:
    keep = p['finding'].startswith('KEEP')
    for route in p['routes']:
        origin = aro_components['mappingPaths'][route['mappingPathRef']]['logicalPath']
        doc = physical[origin]
        present = any(r['legacyGoalId'] == p['sourceGoalId'] and r['canonicalGoalId'] == p['targetGoalId'] for r in doc['mappings'])
        assert present == keep, ('accepted component presence', p['sourceGoalId'], p['targetGoalId'], origin)
    target = aro_keep if keep else aro_removed
    target.append((p['sourceGoalId'], p['targetGoalId']))
assert len(aro_keep) == 179 and len(aro_removed) == 128
all_final_witnesses = [w for r in impact['rows'] for w in r['finalSourceWitnesses']]
for s, t in aro_removed:
    assert not any(w['sourceGoalId'] == s and w['mappedTargetGoalId'] == t for w in all_final_witnesses), ('removed source inherited again', s, t)

current = read(verify_binding(prep['currentCanonical']))
final_path = EX / 'outputs/canonical523.current402.final-compiled.json'
final = read(final_path)
assert sha(final_path) == impact['finalCanonical']['sha256']
current_by = {g['id']: g for g in current['goals']}
final_by = {g['id']: g for g in final['goals']}
assert set(current_by) == set(final_by) and len(final_by) == 523
boundary_ids = [r['goalId'] for r in prep['mergedInputChanges'] if r['owner'] in ('polymer', 'aromatics') and final_by[r['goalId']].get('extendedData', {}).get('applicabilityMappingInheritance') == 'boundary']
assert len(boundary_ids) == 40
for gid in boundary_ids:
    assert all(w['coverage'] == 'direct' for w in all_final_witnesses if w['goalId'] == gid), ('boundary inherited witness', gid)
metadata_additions = []
for r in metadata['compiledMetadataChanges']:
    added = sorted(set(r['after'].get('jurisdiction', [])) - set(r['before'].get('jurisdiction', [])))
    if added:
        metadata_additions.append({'goalId': r['goalId'], 'addedJurisdictions': added})
assert not metadata_additions

def witness_key(w):
    return (w['scope'], w['sourceGoalId'], w['mappedTargetGoalId'], w['coverage'], w['profileBasis'])

by_impact = {r['goalId']: r for r in impact['rows']}
poly_covered = {r['goalId']: {'artifact': ref(v16 / 'PROTECTED19.whole-target-source-component-fit.independent.json'), 'pointer': '/rows/' + str(i), 'judgment': r['changedSourceAttachmentDecision'], 'limit': r['reason']} for i, r in enumerate(poly_whole['rows'])}
for i, r in enumerate(poly_early['rows']):
    if r['goalId'] not in poly_covered:
        poly_covered[r['goalId']] = {'artifact': ref(v14 / 'PER_GOAL.20-contexts-and-three-shared-protected-source-findings.independent.json'), 'pointer': '/rows/' + str(i), 'judgment': r['scientificSourceOperatorFinding'], 'limit': 'Earlier whole current body checked; V16/V18 exact retained corrections only, not full source/partner union.'}
aro_covered = defaultdict(list)
for i, p in enumerate(aro_components['components']):
    gids = set(p['actualInheritedProtected231GoalIds']) | {p['targetGoalId']}
    for gid in gids:
        aro_covered[gid].append({'pointer': '/components/' + str(i), 'sourceGoalId': p['sourceGoalId'], 'targetGoalId': p['targetGoalId'], 'judgment': p['finding'], 'reasonRef': p['scientificReasonRef']})
aro_early_by = {r['goalId']: (i, r) for i, r in enumerate(aro_early['goalFindings'])}
aro_remove_index = {(p['sourceGoalId'], p['targetGoalId']): i for i, p in enumerate(aro_components['components']) if not p['finding'].startswith('KEEP')}
method = aro_method['existingResearchPartner']
aro_covered[method['goalId']].append({'artifact': ref(v8 / 'CASE_AND_METHOD_PARTNER_FINDINGS.actual.json'), 'pointer': '/existingResearchPartner', 'judgment': method['status'], 'limit': method['limits']})

scope_rows = []
required_ids = set(summary['canonicalMetadataChangedGoalIds']) | set(summary['protected231SourceWitnessSetChangedGoalIds'])
for gid in sorted(required_ids):
    r = by_impact[gid]
    ow = {witness_key(w) for w in r['currentSourceWitnesses']}
    nw = {witness_key(w) for w in r['finalSourceWitnesses']}
    sources = []
    if gid in poly_covered:
        sources.append({'reviewChain': ['polymerV14', 'polymerV16', 'polymerV18'], **poly_covered[gid]})
    if gid in aro_covered:
        sources.append({'reviewChain': ['aromaticsV8', 'aromaticsV10', 'aromaticsV11'], 'artifact': ref(v8 / 'SOURCE_PARTNER_COMPONENT_FINDINGS.actual.json'), 'componentPointers': [x['pointer'] for x in aro_covered[gid] if x['pointer'].startswith('/components/')], 'methodComponent': next((x for x in aro_covered[gid] if x['pointer'] == '/existingResearchPartner'), None), 'limit': 'Only the listed bounded components; no full-source, full-partner or research/practical performance union.'})
    if gid in aro_early_by and not sources:
        idx, early = aro_early_by[gid]
        sources.append({'reviewChain': ['aromaticsV6', 'aromaticsV8', 'aromaticsV10', 'aromaticsV11'], 'artifact': ref(v6 / 'PER_GOAL_FINDINGS.actual.json'), 'pointer': '/goalFindings/' + str(idx), 'judgment': early['actualPrimaryOperatorBasis'], 'actualEarlierFinding': early['finding'], 'earlierPreflightDecision': early['preflightDecision'], 'laterCorrection': 'Only exact accepted direct-route binding/inheritance boundary and scoped source-cell correction are transported. V6 was an early preflight, not a full-source-union or final D approval.', 'limit': 'For4b the V6 body included research and was later restored; this reference reuses primary I/M operator facts only, never the rejected compound body. Actual lab/research execution is not certified.'})
    removed_pair_refs = [{'artifact': ref(v8 / 'SOURCE_PARTNER_COMPONENT_FINDINGS.actual.json'), 'pointer': '/components/' + str(aro_remove_index[(w[1], w[2])])} for w in sorted(ow - nw) if (w[1], w[2]) in aro_remove_index]
    # Changed parent/assessment metadata can be solely a child-union consequence.
    # It is a compiler derivation, not a new curricular source approval for that parent.
    if gid == 'b7b5df21-78f3-5408-89f1-36deed450695':
        source_state = 'KNOWN_SEPARATE_FULL_OFFICIAL_ENTITLEMENT_HOLD'
    elif gid == 'f85b4651-50ea-5b42-b193-3465c05257a7' and not nw:
        source_state = 'PROTECTED_SOURCE_ENTITLEMENT_ABSENT_AFTER_ACCEPTED_REMOVAL_HOLD'
    elif not sources and not (nw - ow) and len(removed_pair_refs) == len(ow - nw):
        source_state = 'DERIVED_ACCEPTED_ANCESTOR_COMPONENT_REMOVAL_NO_NEW_ENTITLEMENT'
    elif not sources and not r['sourceComponentWitnessSetChanged']:
        source_state = 'DERIVED_METADATA_OR_TRANSPORT_ONLY_NO_NEW_COMPONENT'
    elif sources:
        source_state = 'EXISTING_BOUNDED_SOURCE_JUDGMENT_TRANSPORTED'
    else:
        source_state = 'MISSING_EXISTING_COMPONENT_JUDGMENT_REQUIRES_ROOT_DECISION'
    scope_rows.append({'goalId': gid, 'title': r['title'], 'protectedCurrent231': r['isProtected231'], 'compiledMetadataChanged': gid in summary['canonicalMetadataChangedGoalIds'], 'requiresFreshNativeDContext': bool(r['canonicalDescriptionContextChangedFields']), 'protectedD16': gid in summary['protected231CanonicalDContextChangedGoalIds'], 'protectedSource69': gid in summary['protected231SourceWitnessSetChangedGoalIds'], 'canonicalDContextChangedFields': r['canonicalDescriptionContextChangedFields'], 'sourceWitnessSetChanged': r['sourceComponentWitnessSetChanged'], 'scopeSetChanged': r['sourceScopeSetChanged'], 'retainedWitnessComponents': len(ow & nw), 'removedWitnessComponents': len(ow - nw), 'addedWitnessComponents': len(nw - ow), 'finalRemainingWitnessComponents': len(nw), 'zeroReviewedMappedSourceWitnesses': not nw, 'sourceAttachmentStatus': source_state, 'existingSourceJudgmentRefs': sources, 'acceptedAncestorRemovalRefs': removed_pair_refs, 'fullSourceOrPartnerUnionApproved': False, 'finalDescriptionReviewApproval': False})

missing = [r['goalId'] for r in scope_rows if r['sourceAttachmentStatus'].startswith('MISSING')]
protected_missing = [r['goalId'] for r in scope_rows if r['protectedSource69'] and r['goalId'] in missing]
write('TECHNICAL.exact-closure-checks.json', {'schemaVersion': 1, 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'status': 'PASS_EXACT_TECHNICAL_TRANSPORT', 'inputPlan': ref(plan_path), 'finalCanonical': ref(final_path), 'existingIndependentSeals': proofs, 'wholeCellCASOperationsChecked': len(plan['wholeCellCASOperations']), 'actualCandidateCarrierCount': len(carrier_checks), 'actualCarriers': carrier_checks, 'noUnexpectedWholeCellOrHeaderChanges': True, 'acceptedFourSNLocatorObjects': sn_checks, 'retiredOldAliasCount': len(prep['retiredAliases']), 'allRetiredAliasesAbsent': True, 'historicalRegularOriginalInputs': history_checks, 'all80CommittedInactiveSnapshotsExact': True, 'polymerComplete42ComponentRowsChecked': len(pair_checks), 'aromaticsRemovedPairs': len(aro_removed), 'aromaticsKeptBoundedPairs': len(aro_keep), 'removedAliasOrInheritedWitnessLeaks': 0, 'all40InheritanceBoundaryGoalsDirectOnly': True, 'metadata48AllJurisdictionChangesAreRemovals': True, 'currentSourceAtlasCounts': atlas['counts'], 'newSourceScienceOrDPAMVM7Votes': 0, 'humanApproval': False, 'activeOrGitWrites': False, 'normalCompilerModelNativeBuildRuns': 0})
write('SCOPE.changed48-protectedD16-source69.approval-map.json', {'schemaVersion': 1, 'kind': 'Finite reused-scoped-source-judgment map; actual D and source attachment scopes remain distinct', 'status': 'PASS_TECHNICAL_TRANSPORT_WITH_EXPLICIT_SOURCE_ENTITLEMENT_HOLDS', 'existingIndependentSeals': proofs, 'counts': {'metadata': len(summary['canonicalMetadataChangedGoalIds']), 'protectedDContext': len(summary['protected231CanonicalDContextChangedGoalIds']), 'protectedSourceAttachment': len(summary['protected231SourceWitnessSetChangedGoalIds']), 'unionRows': len(scope_rows)}, 'rows': scope_rows, 'missingExistingSourceComponentJudgmentGoalIds': missing, 'protectedSource69MissingExistingJudgmentGoalIds': protected_missing, 'protectedSourceEntitlementAbsentAfterAcceptedRemoval': ['f85b4651-50ea-5b42-b193-3465c05257a7'], 'separateKnownHolds': ['b7b5df21-78f3-5408-89f1-36deed450695: full Friedel-Crafts alkylation/acylation entitlement remains HOLD', 'f85b4651-50ea-5b42-b193-3465c05257a7: protected MO-diagram/bond-order atom now has zero actual mapped witnesses; V8 explicitly removes hybridisation/sigma-pi clauses142/144/146 as non-entitlement', '413c5 polymer corrosion official full-entitlement HOLD and 9d viscose/rubber HOLD remain outside eligible37'], 'final23OmittedGoals': summary['omittedGoals'], 'finalIndependentDescriptionPairPending': True, 'currentClosed231NotRegrantedByTechnicalHashEquality': True, 'noWholeSourceOrPartnerUnionApproval': True, 'newScienceGateVotes': 0})
print(json.dumps({'technicalChecks': 'PASS', 'proofSealFileCounts': {k: v['checkedFileCount'] for k, v in proofs.items()}, 'protectedSourceMissing': protected_missing, 'allMissingGoalIds': missing, 'scopeCounts': {'metadata': 48, 'protectedD': 16, 'protectedSource': 69, 'union': len(scope_rows)}}, ensure_ascii=False))
