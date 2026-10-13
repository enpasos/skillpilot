#!/usr/bin/env python3
# Apache-2.0. Finite inactive author seal; no active or Git operations.
import hashlib, json
from datetime import datetime, timezone
from pathlib import Path
OWN = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-residual-source-duty-author-20261013-v3')
E13 = OWN.parent
FINAL = OWN / 'FINAL.finite-residual-source-duty-author.freeze.json'
assert not FINAL.exists(), 'Immutable sealed root; create a successor.'
def read(p): return json.loads(Path(p).read_text())
def bind(p):
    p = Path(p); b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
def write(name, obj):
    with (OWN / name).open('x') as f: f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
roots = [
    (E13 / 'chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1', 'FINAL.finite-inactive-author.freeze.json'),
    (E13 / 'chemie-e594-two-route-source-and-view-remediation-author-20261013-v2', 'FINAL.finite-inactive-source-view-author.freeze.json'),
    (E13 / 'chemie-e594-two-child-actual-images-author-20261013-v1', 'FINAL.finite-two-actual-child-images-author.freeze.json'),
]
unchanged = []
for folder, name in roots:
    seal = read(folder / name)
    for b in seal['outputFiles']: assert bind(b['path']) == b
    unchanged.append({'immutableSeal': bind(folder / name), 'allOutputFilesByteGuardsMatch': True, 'checkedOutputFileCount': len(seal['outputFiles'])})
external = {}
def guard(value):
    if isinstance(value, dict):
        if all(k in value for k in ['path', 'sha256', 'bytes']) and isinstance(value['path'], str):
            b = {k: value[k] for k in ['path', 'sha256', 'bytes']}
            assert bind(b['path']) == b, b['path']
            if not b['path'].startswith(str(OWN) + '/'):
                external[b['path']] = b
        for v in value.values(): guard(v)
    elif isinstance(value, list):
        for v in value: guard(v)
for p in OWN.rglob('*.json'): guard(read(p))
write('checks/finite-read-only-input-and-immutable-predecessor-guards.actual.json', {
    'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'immutablePredecessorRoots': unchanged,
    'exactFiniteExternalInputBindings': [external[k] for k in sorted(external)],
    'allExistingWholeFileBindingsMatch': True, 'activeWrites': False, 'noFullCopiedCanonOrBookModels': True,
    'privateExecutionCleanup': {'reason': 'Shared filesystem became full while preparing this bounded author root.', 'removedOnlyOwnRegenerableImportCopies': 4, 'removedBytes': 5486740, 'pathPrefix': 'tmp/chemie-e594-two-child-actual-images-exec-20261013-v1/', 'subtrees': ['app/public/assets/goal-visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie'], 'eachRemovedPNGMatchedImmutableCandidateSha256BeforeRemoval': True, 'originalBuiltinFilesAndImmutableCandidateAssetsRetained': True, 'notAnActiveAssetChange': True}
})
v1 = roots[0][0]; v2 = roots[1][0]; image = roots[2][0]
peer = E13 / 'chemie-e594-source-view-remediation-scientific-independent-a-20261013-v2'
write('NEUTRAL.residual-source-duty.inactive-author.input-selector.json', {
    'schemaVersion': 1, 'role': 'Neutral finite inactive V3 AUTHOR source-duty refinement; independent review and selected-program registration still held',
    'wholeClassificationGoalAndParentCAS': bind(OWN / 'candidate/two-full-classification-goals-and-dye-parent-whole-CAS.author.json'),
    'boundedSemanticFingerprintFields': bind(OWN / 'candidate/three-bounded-semantic-fingerprint-transport-proposals.author.json'),
    'exactWholeSourceCellsAndDistinctOperators': bind(OWN / 'exact-whole-source-cells-and-distinct-operators.author.json'),
    'conditionalWholeSourceDecisionCASAndCountGuards': bind(OWN / 'candidate/three-conditional-full-source-decision-and-mapping-CAS.author.json'),
    'wholeUnregisteredReviewViewBindingsAndHOLD': bind(OWN / 'selected-module-review-view-bodies-and-registration-HOLD.author.json'),
    'wholeOptionalFormationDutyDraftsOutsideCanonical': bind(OWN / 'whole-RP33-source-and-two-entire-optional-duty-HOLD.author.json'),
    'wholeSelectedProgramRulesAndFourHOLDs': bind(OWN / 'full-selected-program-scope-conditions-and-four-HOLD-disposition.author.json'),
    'twoFullDEENPositiveProfiles': bind(OWN / 'positive/two-full-DEEN-classification-profiles.author.json'),
    'fourFullDEENAlternativeTransferCases': bind(OWN / 'positive/four-full-DEEN-classification-transfer-cases.author.json'),
    'limitedStockTechnicalChecks': bind(OWN / 'checks/stock-bounded-canonical-view-CAS-and-positive-bindings.actual.json'),
    'finiteActualInputGuards': bind(OWN / 'checks/finite-read-only-input-and-immutable-predecessor-guards.actual.json'),
    'primaryContextRead': bind(OWN / 'checks/full-primary-context-read-and-immutable-inputs.actual.json'),
    'unchangedV1ScientificGoalAndCaseRoot': bind(v1 / roots[0][1]),
    'unchangedAcceptedV2SourceViewCorrections': bind(v2 / roots[1][1]),
    'genuineIndependentV2Finding': bind(peer / 'SCIENTIFIC.REMEDIATION.REPORT.md'),
    'genuineIndependentV2Freeze': bind(peer / 'FINAL.independent-source-view-remediation.freeze.json'),
    'unchangedActualSynthesisChildPNGs': bind(image / roots[2][1]),
    'synthesisWholeGoalBodiesCasesProfilesAndParentOverviewUnchanged': True,
    'noNewRegisteredDefaultViewsOrNormalMappedEdges': True, 'wholeGoalAndConditionalSourceAcceptancePending': True,
    'actualOptionalModuleSelectionPending': True, 'finalCompiledPageAndProfileFingerprintBindingPending': True,
    'noTaskQuotaOrAutomaticMastery': True, 'noScienceGateOrIndependentVotes': True,
    'activeWrites': False, 'gitOperations': False, 'humanApproval': False, 'humanTrial': False
})
files = sorted(p for p in OWN.rglob('*') if p.is_file())
assert all(not p.is_symlink() and p.stat().st_size > 0 for p in files)
for p in files:
    if p.suffix == '.json': read(p)
output = [bind(p) for p in files]
write(FINAL.name, {
    'schemaVersion': 1, 'role': 'Finite immutable inactive AUTHOR V3 residual source-duty seal; not an integrated release or independent approval',
    'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'neutralInputSelector': bind(OWN / 'NEUTRAL.residual-source-duty.inactive-author.input-selector.json'),
    'outputFiles': output, 'sealedOutputFileCountExcludingThisSeal': len(output), 'sealedOutputBytesExcludingThisSeal': sum(b['bytes'] for b in output),
    'finiteScientificDesign': {'wholeNewClassificationGoalBodies': 2, 'existingWholeDyeParentCAS': 1, 'fullDEENProfiles': 2, 'fullDEENAlternativeTransferCases': 4, 'conditionalWholeSourceDecisionCAS': 3, 'unregisteredWholeReviewViews': 2, 'wholeOptionalFormationDraftsHeldOutsideCanonical': 2},
    'measuredInactiveProposalOnly': {'baselineV1Goals': 525, 'baselineV1ProposedCurricularAtoms': 403, 'V3GoalsIfLaterAcceptedIntegrated': 527, 'V3CurricularAtomsIfLaterAcceptedIntegrated': 405, 'checkpoint523Goals402CurricularAtomsNotReplacedByAuthorCount': True},
    'remainingWholeHOLDs': ['RP6.2_SELECTED_SCOPE', 'RP_CLASSIFICATION_OPERATOR', 'SN_CHROMOPHORE_CLASSIFICATION_OPERATOR', 'RP3.3_OPTIONAL_PRODUCT_CONTEXT'],
    'fullNormalCompilerScopeAndPageRebindOwnedByRootPendingHere': True,
    'immutablePredecessorRootsPreserved': True, 'noRuntimeUXOrCoreScopePermissionChanges': True,
    'noOperativeSourceOrViewRegistration': True, 'noDPAorMVVotesOrScienceApproval': True,
    'activeWrites': False, 'gitOperations': False, 'humanApproval': False, 'humanTrial': False
})
for b in read(FINAL)['outputFiles']: assert bind(b['path']) == b
assert set(str(p) for p in OWN.rglob('*') if p.is_file()) == set(b['path'] for b in output) | {str(FINAL)}
print(json.dumps({'seal': bind(FINAL), 'sealedOutputs': len(output), 'allOwnFilesIncludingSeal': len(output) + 1, 'outputBytesWithoutSeal': sum(b['bytes'] for b in output), 'allExactGuardsMatch': True, 'HOLDsRemain': True}))
