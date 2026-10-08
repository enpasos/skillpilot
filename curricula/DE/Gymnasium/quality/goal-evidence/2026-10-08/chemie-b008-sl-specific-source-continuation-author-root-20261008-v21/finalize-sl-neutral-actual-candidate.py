# SPDX-License-Identifier: Apache-2.0
"""Seal only actual inactive author results, including genuine unresolved duties."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import ast
import hashlib
import importlib.util
import json
import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OLDER = OWN.parent.parent / '2026-10-07'
PREVIOUS = OLDER / 'chemie-b008-sh-current480-source-placement-author-v19'
assert not (OWN / 'author.final.freeze.json').exists()

def read(p):
    return json.loads(p.read_text())

def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(p, value):
    assert p.is_relative_to(OWN)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

previous_seal = read(PREVIOUS / 'author.final.freeze.json')
for item in previous_seal['payloads']:
    assert bind(ROOT / item['path']) == item
native = read(OWN / 'actual-native43-source-view-findings-three-SL-models-and-current177-contexts.json')
proposals = read(OWN / 'exact-sl-primary-course-components-and-three-view-proposals.author.json')
assert read(OWN / 'native-compiler.terminal.actual.json')['actualExitCode'] == 0
assert native['actualBeforeCPV009'] == 43 and native['actualAfterCPV009'] == 35
assert native['actualProtectedContextHolds'] == 8
assert all(not r['actualAfterFindings'] for r in native['actual43SourceViews'] if r['changedInThisPacket'])
assert len(proposals['specificPartialChildComponents']) == 38
assert len(proposals['immutableOriginal65SLDuties']) == 65
assert proposals['wholeCareerChoiceSourceCoverage'] is False
assert all(r['wholeDEENDescriptionsExactPriorV19'] for r in native['exact26WholeDescriptionsRetained'])
material = read(PREVIOUS / 'actual-bounded-primary-reading-and-unchanged-text-material-reuse.json')
for item in material['actual52WholeMaterialBodiesUnchanged'] + material['actual26WholeOldProfileBodiesUnchanged'] + [material['exactOriginalV11Binder']]:
    assert bind(ROOT / item['path']) == item
write(OWN / 'actual-unchanged52-material26-profile-reuse-and-original65-duties.json', {
    'role': 'Exact existing scientific profile/case reuse and original duty retention, not new independent approval',
    'actual52WholeMaterialBodiesUnchanged': material['actual52WholeMaterialBodiesUnchanged'],
    'actual26WholeOldProfileBodiesUnchanged': material['actual26WholeOldProfileBodiesUnchanged'],
    'exactOriginalV11Binder': material['exactOriginalV11Binder'],
    'priorScientificReviewNotRestarted': True,
    'all65OriginalSLDutyBindings': proposals['immutableOriginal65SLDuties'],
    'exactOriginalAll1646NationalDuties': proposals['immutableAll1646OriginalDuties'],
    'sourceWholeClosure': False, 'newIndependentScientificApproval': False,
    'actualLearnerPerformance': False, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
active = read(OWN / 'inputs/active-current480.json.bin')
candidate = read(OWN / 'candidate/canonical.current504-sl-source-metadata.author-candidate.json')
old = {g['id']: g for g in active['goals']}
new = {g['id']: g for g in candidate['goals']}
central = read(OWN.parent / 'biologie-stoffwechsel-nineteen-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt')
chemistry = next(s for s in central['subjects'] if s['subject'] == 'chemie')
assert chemistry['strictComplete'] == 177
for goal_id in chemistry['strictCompleteGoalIds']:
    assert {k: v for k, v in old[goal_id].items() if k != 'requires'} == {k: v for k, v in new[goal_id].items() if k != 'requires'}
active_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert active == read(active_path)
registry = read(ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
assert registry == read(OWN / 'inputs/active-rollout-registry.json.bin')
remaining = read(PREVIOUS / 'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json')
groups = Counter()
open_views = []
for row in native['actual43SourceViews']:
    if row['actualAfterCPV009']:
        groups[row['scope']['jurisdiction']] += row['actualAfterCPV009']
        open_views.append({'viewId': row['viewId'], 'scope': row['scope'], 'actualCPV009': row['actualAfterCPV009'], 'currentExactView': row['afterViewBinding'], 'actualFindings': row['actualAfterFindings']})
assert sum(groups.values()) == 35 and 'DE-SL' not in groups
remaining.update({'actualRemainingCPV009ByJurisdiction': dict(groups), 'actualRemainingCPV009': 35, 'actualCurrentRemainingSourceViews': open_views, 'actualEightProtectedContextHolds': [r for r in native['all177ProtectedActualPageContextComparisons'] if not r['currentPageExcludingPaginationExact']], 'all177CurrentStrictTextAndImageBodiesProtected': True, 'wholeSourceClosure': False})
write(OWN / 'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json', remaining)
write(OWN / 'bounded-neutral-sl-source-placement-review-entry.json', {
    'schemaVersion': 1,
    'role': 'Neutral actual complete SL explicit-view and source-component candidate; no peer review or release',
    'sealedPrevious': bind(PREVIOUS / 'author.final.freeze.json'),
    'freshCurrent177FieldRebase': bind(OWN / 'current480-three-way-bounded-field-rebase.actual.json'),
    'wholeSourceComponentsAndViewProposals': bind(OWN / 'exact-sl-primary-course-components-and-three-view-proposals.author.json'),
    'wholeCurrent504InactiveCandidate': bind(OWN / 'candidate/canonical.current504-sl-source-metadata.author-candidate.json'),
    'actual43AndThreeSLNativeModels': bind(OWN / 'actual-native43-source-view-findings-three-SL-models-and-current177-contexts.json'),
    'remainingOriginalDutiesAndEightContextHolds': bind(OWN / 'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json'),
    'unchangedScientific52Cases26Profiles': bind(OWN / 'actual-unchanged52-material26-profile-reuse-and-original65-duties.json'),
    'actualCompilerTerminal': bind(OWN / 'native-compiler.terminal.actual.json'),
    'specificSourceComponents': 38, 'uniqueExistingSpecificSourceGoals': 26,
    'wholeOriginalSLDuties': 65, 'nationalOriginalDuties': 1646,
    'threeExplicitSourceViews': 3, 'actualNativeCPV009Before': 43, 'actualNativeCPV009After': 35,
    'actualCurrentStrictBaseline': 177, 'actualCurrentAtomicBaseline': 378,
    'inactiveCandidateCurricularAtomic': 395,
    'sourceRoleDecision': 'AUTHOR_CANDIDATE_PENDING_TWO_INDEPENDENT_SOURCE_AND_PLACEMENT_REVIEWS',
    'ordinaryAtlasDecisionProjectionReadiness': 'PENDING: retained original family bindings must not be interpreted as automatic whole child coverage; explicit candidate views are the only projections actually compiled here',
    'wholeCareerChoiceAndComplexModelDomainsStillHold': True,
    'sourceGatePromotions': 0, 'newNativeDPReviews': 0,
    'newImages': 0, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
normal_spec = importlib.util.spec_from_file_location('normal_validate_schemas', ROOT / 'scripts/validate_schemas.py')
normal = importlib.util.module_from_spec(normal_spec)
normal_spec.loader.exec_module(normal)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
json_paths = []
for path in OWN.rglob('*'):
    assert not path.is_symlink()
    if path.is_file() and path.suffix == '.json':
        assert normal.validate_file(str(path.relative_to(ROOT)), schema), path
        json_paths.append(str(path.relative_to(ROOT)))
    elif path.is_file() and path.suffix == '.py':
        ast.parse(path.read_text())
# The actual candidate must itself satisfy the ordinary runtime schema, even
# though quality-owned evidence files are normally JSON-only receipts.
jsonschema.validate(candidate, schema)
nested = []
def verify(value, pointer):
    if isinstance(value, dict):
        if set(value) == {'path', 'sha256', 'bytes'}:
            assert bind(ROOT / value['path']) == value, (pointer, value)
            nested.append(pointer)
        else:
            for key, item in value.items():
                verify(item, pointer + '/' + key)
    elif isinstance(value, list):
        for index, item in enumerate(value):
            verify(item, pointer + '/' + str(index))
verify(proposals, '/proposals')
verify(read(OWN / 'bounded-neutral-sl-source-placement-review-entry.json'), '/entry')
write(OWN / 'normal-targeted-schema-and-exact-bindings.actual.json', {
    'role': 'Actual ordinary validation and exact binder checks, not scientific approval',
    'normalValidatorPath': bind(ROOT / 'scripts/validate_schemas.py'),
    'actualNormalJSONFiles': len(json_paths), 'wholeCandidateRuntimeSchemaPassed': True,
    'exactNestedBindingsVerified': len(nested), 'allPreviousSealedPayloadsVerified': len(previous_seal['payloads']),
    'actualCompilerExitCode': 0, 'actualThreeSLCompilerBlockingErrors': 0,
    'whole177ProtectedTextImageFieldsExact': True, 'actualEightContextHolds': 8,
    'activeChemistryCanonicalAndWholeRegistryExact': True,
    'all26Descriptions52Cases26ProfilesRetained': True,
    'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
(OWN / 'README.md').write_text('''# B008 v21: Saarland source components and explicit view candidates

Inactive AUTHOR candidate, strict +0 and active writes0. Actual Chemistry177/378
and all current text/image bodies retained; candidate504 whole/395 curricularAtomic.
The previous SH seal remains exact. This packet completes the prior SL reading-only
checkpoint with38 concrete partial components from26 current source goals,
11 source metadata proposals and three explicit source views. All65 original SL
and1646 national source duties remain retained. Both introduction branches and
GK/LK are separate; NW-only nitrogen duties are never imported into the language
branch. Concrete practical performance remains a real duty.

Actual regular compiler:43 ->35 CPV-009; the eight SL errors are absent in the
three explicit candidates. SL target pages98/157/168; other35 diagnostics remain.
All177 current strict text/image objects remain exact; the original eight affected
requires/reverseRequires contexts stay HOLD. All26 descriptions,26 profiles and52
whole DE/EN cases are unchanged accepted material; technical binding checks are
not new scientific approval. Actual complete source-page readings and retained
general source witnesses stay independently reviewable.

The ordinary atlas generator remains a separate pending check: original generic
family bindings retained in the mapping candidates do not prove all children are
source-supported. Only these three explicit view files were compiled. Career
choice, whole complex-model domains, all original practical duties and regional
source-union coverage remain open. A compiler pass does not settle source scope.
The first template-path failure is retained separately and corrected in this
unsealed caller; no product validator or quality floor changed.

Neutral entry: bounded-neutral-sl-source-placement-review-entry.json. Two
independent source/component/course/placement judgments and actual native D/P/A/M/V
work remain necessary before integration. No human approval, CI or deployment claim.
''')
seal = {'schemaVersion': 1, 'role': 'Inactive actual SL author first final seal, not approval', 'createdAtUtc': datetime.now(timezone.utc).isoformat(), 'currentStrict': 177, 'currentCurricularAtomic': 378, 'inactiveCandidateWhole': 504, 'inactiveCandidateCurricularAtomic': 395, 'actualCPV009Before': 43, 'actualCPV009After': 35, 'wholeSourceClosure': False, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False, 'payloads': [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]}
write(OWN / 'author.final.freeze.json', seal)
for item in seal['payloads']:
    assert bind(ROOT / item['path']) == item
print(json.dumps({'seal': bind(OWN / 'author.final.freeze.json'), 'payloads': len(seal['payloads']), 'actualTargetedNormalJSON': len(json_paths), 'candidateRuntimeSchema': 'PASS', 'actualCPV009': '43->35', 'strictGain': 0, 'activeWrites': 0}))
