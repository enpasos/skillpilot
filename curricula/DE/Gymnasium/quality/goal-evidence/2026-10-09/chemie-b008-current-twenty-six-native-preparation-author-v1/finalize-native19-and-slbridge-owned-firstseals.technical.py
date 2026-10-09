# SPDX-License-Identifier: Apache-2.0
"""Finalize actual technical candidates; no scientific acceptance is generated."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
SL = OWN / 'source-sl-bridge-author'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    assert not path.is_symlink(), path
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def write(path, value):
    assert path.is_relative_to(OWN)
    raw = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        assert path.read_bytes() == raw, path
    else:
        path.write_bytes(raw)
    return bind(path)

assert not (OWN / 'native19-technical-author.first.freeze.json').exists()
assert not (SL / 'sl-whole-duty-and-two-framework-bridge.first.freeze.json').exists()
stage = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-nineteen-whole-positive-pairing-root-v1/four-required-native-originals.exact-staged-proof.actual.json'
assert stage.exists()
requested = read(OWN / 'native/four-required-native19-originals.exact-index-request.json')['files']
assert len(requested) == 4
index_rows = []
for row in requested:
    path = ROOT / row['path']
    actual = bind(path)
    assert actual['sha256'] == row['sha256'].removeprefix('sha256:')
    assert actual['bytes'] == row['bytes']
    blob = subprocess.run(['git', 'show', ':' + row['path']], check=True, capture_output=True).stdout
    assert blob == path.read_bytes()
    index_rows.append({**actual, 'actualIndexBlobBytesExact': True})
ignore = subprocess.run(['git', 'check-ignore', '--stdin'], input=''.join(r['path'] + '\n' for r in requested), text=True, capture_output=True)
assert ignore.returncode == 1 and not ignore.stdout
index_path = OWN / 'checks/four-required-native19-originals.actual-index-byte-verification.json'
write(index_path, {'schemaVersion': 1, 'rootTargetedStageReceipt': bind(stage), 'ownActualIndexBlobChecks': index_rows,
                   'actualCheckIgnoreRespectsIndex': True, 'gitIgnoreExceptions': [], 'stageByThisAgent': [],
                   'sourceHTMLandPDFNotRebuilt': True, 'humanApproval': False})

sl_entry = SL / 'neutral-sixty-five-whole-SL-duties-and-two-upper-framework-operative.author.entry.json'
write(sl_entry, {'schemaVersion': 1,
                 'role': 'Neutral new operative source extraction/mapping candidates; genuine prior whole upper roles are reused as evidence and new source projection metadata remain pending',
                 'currentCanonicalGoalCount': 480, 'currentCurricularAtomicCount': 378, 'inactiveCanonicalGoalCount': 504, 'inactiveCurricularAtomicCount': 395,
                 'wholeOriginal65DutyAndPartnerInput': bind(SL / 'sixty-five-whole-original-SL-duties-and-current-partners.exact-neutral-input.json'),
                 'actualOriginalPrimaryPagesAndPairedSourceRoleInput': bind(SL / 'actual-original-primary-pages-and-paired-whole-source-role.input.json'),
                 'newOrdinarySourceExtraction': bind(SL / 'SL-upper-actual-numbered-KMK-standards.source-extraction.author-candidate.json'),
                 'newOrdinaryMappingCandidate': bind(SL / 'SL-upper-numbered-framework-to-two-routines.mapping.author-candidate.json'),
                 'ordinarySourceAtlasConfig': bind(SL / 'whole395-with-existing32-mappings-and-newSLbridge.normal-probe.author-candidate.json'),
                 'actualOrdinaryProbeAndSourceFacets': bind(SL / 'actual-nine-normal-facets-and-ordinary-source-probe.pending.json'),
                 'exactCurrentGuards': bind(SL / 'exact-current-whole-role-and-original-union.guards.json'),
                 'wholeUpperTargetIds': ['36666b4a-97af-51fc-9983-56cdcc7a8229', 'ac8b6c0f-98b2-5092-806d-d9498efbfa35'],
                 'sourceLearningEndpoint': 'DE-SL SekII GK/LK at end of Hauptphase/qualification; not EP',
                 'all65OriginalSourceGoalPassageAndMappingValuesExact': True, 'allCurrentOriginalMappingDecisionsExact': True,
                 'newSourcePayloadAndProjectionRequiresGenuineCurrentReview': True, 'newMappingReviewersAndDates': None,
                 'ordinarySourceAtlasStatus': 'HOLD: Missing reviewed mapping decision metadata: sl-chem-ahr-framework-2020-k1',
                 'nativeTwoDeferredUntilActualOperativeContextAdoption': True,
                 'lowerWholeRoleStillHold': '75e2eff1-f871-5461-9e3f-26d0b333ce2f',
                 'remainingSourceViewNodesHeld': 7, 'remainingSourceViewsHeld': 6, 'protectedContextReviewHolds': 8,
                 'newPartialSourceRowsDoNotCloseWholeOriginalSourceUnion': True, 'actualPracticalLearnerPerformanceCertified': False,
                 'newScientificReviews': [], 'newScientificClosures': 0, 'restoredBindings': 0, 'netStrictGain': 0,
                 'activeWrites': [], 'humanApproval': False, 'humanTrial': False, 'authorVerdictAuthorityClaimed': False})

spec = importlib.util.spec_from_file_location('ordinary_validate_schemas', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
selected = sorted(SL.glob('*.json')) + sorted((OWN / 'native-nineteen').rglob('*.json'))
selected += [OWN / 'neutral-current19-native-independent-review.entry.json', index_path]
errors = [str(p.relative_to(ROOT)) for p in selected if not validator.validate_file(str(p.relative_to(ROOT)), schema)]
assert not errors, errors
schema_proof = SL / 'ordinary-owned-source-and-native19-targeted-schema-check.actual.json'
write(schema_proof, {'schemaVersion': 1, 'ordinaryValidator': 'scripts/validate_schemas.py:validate_file',
                     'actualTargetedFileCount': len(selected), 'actualFiles': [str(p.relative_to(ROOT)) for p in selected],
                     'errors': errors, 'validatorMutations': [], 'sourceOrScientificApproval': False})

native_paths = set((OWN / 'native-nineteen').rglob('*'))
native_paths.update([OWN / 'neutral-current19-native-independent-review.entry.json', index_path,
                     OWN / 'validate-current19-normal-campaigns-and-bindings.technical.mts',
                     OWN / 'render-current19-native-review-candidate.technical.mts',
                     OWN / 'materialize-current19-sealed-author-profiles.technical.py',
                     OWN / 'input/current19-whole-original38-and38-worked-transfers.neutral.json',
                     OWN / 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json',
                     OWN / 'input/whole21-BY-source-duties36-edges79-occurrences.exact-neutral-input.json',
                     OWN / 'input/current-whole-source-partner-atomicity-memory-frame.neutral.json',
                     OWN / 'native/whole395.inactive-review-only.book-model.json',
                     OWN / 'native/whole378.same-canonical-root.before.book-model.json',
                     OWN / 'native/national359.actual-current-national-loader.book-model.json',
                     OWN / 'native/whole378-to-inactive395.substantive-page-context-deltas.actual.json',
                     OWN / 'checks/ordinary-native19-campaign-bindings-and-whole-materials.actual.json',
                     OWN / 'checks/ordinary-native19-existing-full-browser.actual-terminal.json'])
native_paths.update(p for p in (OWN / 'positive').glob('*') if 'P19' in p.name or p.name == 'neutral-current19-profile-and-worked-case-author-bindings.entry.json')
native_payloads = [bind(p) for p in sorted(native_paths) if p.is_file()]
native_seal = OWN / 'native19-technical-author.first.freeze.json'
write(native_seal, {'schemaVersion': 1, 'createdAtUtc': datetime.now(timezone.utc).isoformat(),
                    'role': 'First seal of actual inactive normal Native19/P19 technical author artifacts and actual index bytes; independent science/native/source reviews are separate',
                    'payloads': native_payloads, 'payloadCount': len(native_payloads), 'nativeHTMLPDFOriginalsExactAndIndexed': True,
                    'actualIndependentDResultsCreated': 0, 'allP19Status': 'ai_candidate/needs_human_review/E1/G1',
                    'wholeSourceAndCoursePlacementApproval': False, 'atomicityMemoryNewApprovals': 0,
                    'currentSourceViewAndEightProtectedContextHoldsRetained': True,
                    'activeWrites': [], 'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
sl_payloads = [bind(p) for p in sorted(SL.rglob('*')) if p.is_file()]
sl_payloads.extend([bind(OWN / 'prepare-sl-whole-duty-and-two-framework-bridge.technical.py'),
                    bind(OWN / 'check-sl-two-framework-bridge-existing-contracts.technical.mts')])
write(SL / 'sl-whole-duty-and-two-framework-bridge.first.freeze.json', {
    'schemaVersion': 1, 'createdAtUtc': datetime.now(timezone.utc).isoformat(), 'role': 'Immutable first neutral operative author source candidate; nine new decisions await genuine current review/adoption',
    'payloads': sl_payloads, 'payloadCount': len(sl_payloads), 'actualOld65DutyValuesExact': True,
    'currentOriginalSLMappingDecisionMutations': 0, 'newNormalFacetChecks': 'PASS9',
    'actualOrdinarySourceAtlasStatus': 'HOLD', 'newMetadataFabricated': False,
    'twoNativeSourcePagesDeferredUntilActualOperativeContextAdoption': True,
    'wholeOriginalSourceUnionClosed': False, 'strictGain': 0, 'activeWrites': [], 'humanApproval': False})
print(json.dumps({'native19FirstSeal': bind(native_seal), 'SLNeutralEntry': bind(sl_entry),
                  'SLFirstSeal': bind(SL / 'sl-whole-duty-and-two-framework-bridge.first.freeze.json'),
                  'normalTargetedSchemaFiles': len(selected), 'indexOriginalsExact': 4, 'strictGain': 0, 'activeWrites': 0}))
