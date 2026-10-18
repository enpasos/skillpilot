# SPDX-License-Identifier: Apache-2.0
"""Read-only config/view inventory. No model, projection, render or review."""
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).parent
OVERLAY = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-inactive-ci-checkpoint-20261018-v1/overlay')
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-corrected450-final-native/BASE450.full-current-positive.review.config.json')
ADAPTER = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-final-native-adapter')
CANONICAL = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
LEDGER = Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')

def load(path):
    return json.loads(Path(path).read_text())

def pin(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

audit = load(OUT / 'FACTS.active-native-D-owners-and-exact-local-binding-deltas.json')
assert pin(CANONICAL)['sha256'] == audit['startedAtInputPins'][0]['sha256'], 'Graph drift from measured native-owner cut'
native_goals = {r['goalId'] for r in audit['perGoal']}
ordinary = {r['goalId'] for r in load(LEDGER)['decisions'] if r['semanticKind'] == 'curricularAtomic'}
assert native_goals == ordinary and len(ordinary) == 450, 'Expected exact current450 native owner scope'
input_cache = {}
frozen_with_applicability = []
for r in audit['perGoal']:
    p = r['firstInput']
    if p not in input_cache:
        input_cache[p] = load(p)
    g = next(g for g in input_cache[p]['goals'] if g['goalId'] == r['goalId'])
    if 'applicability' in g['reviewContext']['page']:
        frozen_with_applicability.append(r['goalId'])

base_records = []
for p in sorted({r['baseConfigPath'] for r in audit['perGoal'] if r['baseConfigPath']}):
    q = Path(p)
    record = {'path': p, 'present': q.exists()}
    if q.exists():
        cfg = load(q)
        record.update({'pin': pin(q), 'landscapePath': cfg['landscapePath'], 'compositionViewPath': cfg.get('compositionViewPath'), 'compositionViewManifestPath': cfg.get('compositionViewManifestPath'), 'evidenceReviewPaths': cfg.get('evidenceReviewPaths', [])})
    base_records.append(record)
views = sorted(Path('curricula/DE/Gymnasium/composition-views/chemie').glob('*.view.json'))
assert len(views) == 41, 'Expected exactly41 current Chemistry composition views'
view_records = []
for q in views:
    old = OVERLAY / (str(q) + '.snapshot')
    assert old.exists(), 'Checkpoint view missing ' + str(old)
    view_records.append({'current': pin(q), 'checkpoint': pin(old), 'rawChangedSinceCheckpoint662': q.read_bytes() != old.read_bytes()})
view_names = {str(q) for q in views}
native_current_view_paths = {r['compositionViewPath'] for r in base_records if r['present'] and r['compositionViewPath'] in view_names}

cfg = load(BASE)
view = load(cfg['compositionViewPath'])
entries = []
def walk(nodes):
    for n in nodes:
        if n['kind'] == 'goalEntry':
            entries.append(n)
        elif n['kind'] == 'structure':
            walk(n.get('children', []))
        else:
            raise AssertionError('Full450 technical QA view should be explicit; found ' + n['kind'])
walk(view['rootNodes'])
assert len(entries) == 450 and {r['goalId'] for r in entries} == ordinary, 'Old full450 technical QA view no longer exactly targets450 ordinary goals'
assert all(r.get('projectionRole', 'target') == 'target' for r in entries), 'Unexpected QA view support role'
assert not cfg.get('compositionViewManifestPath'), 'Base source manifest boundary changed'

facts = {
    'role': 'PRE_FINAL_CONFIG_AND_SOURCE_DEPENDENCY_AUDIT_NOT_CURRENT_PAGE_ACCEPTANCE',
    'canonical': pin(CANONICAL),
    'activeConfigGroups': len(audit['activeConfigGroups']),
    'activeBaseConfigPaths': len(base_records),
    'presentActiveBaseConfigPaths': sum(r['present'] for r in base_records),
    'missingHistoricalActiveBaseConfigPaths': [r['path'] for r in base_records if not r['present']],
    'missingHistoricalActiveBatchConfigPaths': sorted({r['configPath'] for r in audit['perGoal'] if not r['configFilePresent']}),
    'baseConfigInventory': base_records,
    'frozenPageApplicabilityGoalIds': frozen_with_applicability,
    'presentActiveBaseConfigsUsingSourceManifest': [r['path'] for r in base_records if r['present'] and r['compositionViewManifestPath']],
    'presentActiveBaseConfigsDirectlyUsingCurrent41LearnerViews': sorted(native_current_view_paths),
    'current41ViewInputs': view_records,
    'current41RawChangedViewCount': sum(r['rawChangedSinceCheckpoint662'] for r in view_records),
    'existingFull450TechnicalQAView': {
        'baseConfig': pin(BASE), 'view': pin(cfg['compositionViewPath']),
        'directGoalEntryCount': len(entries), 'ordinaryScopeExact': True,
        'allEntriesTarget': True, 'sourceManifestConfigured': False,
        'oldEvidenceReviewPaths': cfg['evidenceReviewPaths'],
        'oldConfigIsHistoricalNotFinalPlan': True,
    },
    'sourceBoundaryFindings': [
        'No active frozen ordinary page has an applicability field. None of54 present historical base configs uses a composition-view source manifest; six historical base config files are absent, so their original config payloads cannot be inferred.',
        'The present native base configs do not directly use any of the41 live learner composition views. Live learner source/view changes therefore cannot be asserted as per-page D changes solely from raw view/source hashes.',
        'The inspected full450 technical QA view is450 explicit ordinary target entries under one fixed structure. It neither claims source entitlement nor contains any new assessment target. Its page direct dependency references still include new assessments as externalReverseRequires from the whole primary canonical graph.',
        'Native canonicalContext separately includes sourceRef, applicability and three applicability semantic fields. Future writes to those fields can change D context even if bilingual text and science goalFingerprint are unchanged.',
        'A final source-manifest atlas would materialize page applicability. Using it instead of the explicit technical QA view would change the chosen D context; this audit does not choose or validate such an expansion.',
        'Remaining TH/HB source metadata fixes, compiled applicability,75 machine releases and27 P context-owner transport are explicitly pending the final cut. Their final per-page/context effects must be measured, not predicted from this pre-final input.',
        'Missing historical batch/base config files are an existing reproducibility boundary. Frozen native inputs/resolutions remain readable and internally bound. New final configs must be authored instead of assuming those missing historical configs are runnable.',
    ],
    'stockSourcesRead': [pin(p) for p in [
        'app/scripts/goalBookModel.ts',
        'app/scripts/materializeGoalDescriptionRolloutBatch.ts',
        'app/scripts/validateGoalDescriptionReviewCampaign.ts',
        'app/scripts/validateGoalDescriptionDualRoundResolution.ts',
        'app/scripts/reportDeepUnderstandingRollout.ts',
        ADAPTER / 'native-d-final-input-generator.mjs',
        ADAPTER / 'native-d-final-context-adapter.mjs',
    ]],
    'fullModelBuilds': 0, 'renders': 0, 'newReviewerVotes': 0, 'normalWrites': 0,
}
(OUT / 'FACTS.active-config-and-source-boundaries.json').write_text(json.dumps(facts, indent=2) + '\n')
print(json.dumps({k: facts[k] for k in ['activeConfigGroups','activeBaseConfigPaths','presentActiveBaseConfigPaths','current41RawChangedViewCount','presentActiveBaseConfigsUsingSourceManifest','presentActiveBaseConfigsDirectlyUsingCurrent41LearnerViews','fullModelBuilds','renders','newReviewerVotes','normalWrites']}, indent=2))
