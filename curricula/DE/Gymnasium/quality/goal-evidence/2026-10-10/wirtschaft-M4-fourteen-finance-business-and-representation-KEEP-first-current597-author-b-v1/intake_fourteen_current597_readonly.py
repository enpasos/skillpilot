from pathlib import Path
import hashlib
import json

R = Path('/home/enpasos/projects/skillpilot')
O = Path(__file__).resolve().parent
CAN = R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
FROZEN = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-finance-integration-and-market-institutions-whole-material-author-b-v1/whole-current597-immutable-economics-before-finance12.exact.json'
REG = R / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
RAW = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current597-legal-social-independent-combined-scope-review-v1/actual-after597-native-independent.raw.json'

def read(p):
    return json.loads(p.read_text())

def binding(p):
    v = p.read_bytes()
    return {'path': str(p.relative_to(R)), 'sha256': hashlib.sha256(v).hexdigest(), 'bytes': len(v)}

assert CAN.read_bytes() == FROZEN.read_bytes()
assert binding(FROZEN)['sha256'] == '6118557f37604ddd3fa5c5b8a418ee9d0061c570dfeea14a12d29ee7cb4addf3'
goals = {g['id']: g for g in read(FROZEN)['goals']}
assert len(goals) == 597
prefixes = ['c4f27b51', '8328f308', 'ae7b3074', '8e8a672e', '04c17efe', '83779981', '9a1a3f9b', '273809d9', '489b6d7b', '15d18bd1', 'e90586d8', '53829f76', '685624a0', '860ead33']
ids = []
for prefix in prefixes:
    matches = [i for i in goals if i.startswith(prefix)]
    assert len(matches) == 1
    ids.append(matches[0])
subject = next(s for s in read(REG)['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
profiles, profile_bindings = {}, []
for config_path in subject['positiveEvidenceConfigPaths']:
    config = R / config_path
    review = R / read(config)['reviewPath']
    profile_bindings.append({'config': binding(config), 'reviewWholeBytes': binding(review)})
    for line in review.read_text().splitlines():
        if line.strip():
            p = json.loads(line)
            assert p['goalId'] not in profiles
            profiles[p['goalId']] = p
assert len(profiles) == 336 and len(profile_bindings) == 43
raw = read(RAW)
assert raw['goalCount'] == 597 and len(raw['allScopeRows']) == 64
materials = {m['id']: m for m in raw['materials']}
missing = [{'goalId': i, 'viewPath': s['viewPath'], 'jurisdiction': s['jurisdiction'], 'scopeFilters': s['scopeFilters']} for s in raw['allScopeRows'] for i in s['missingEffectiveTerminalTargetIds']]
assert len(missing) == 512 and len({r['goalId'] for r in missing}) == 81
old_ids = sorted({m['id'] for m in raw['materials'] if any(i in goals[m['id']]['examData'].get('coveredGoalIds', []) for i in ids)})
rows = []
for i in ids:
    contexts = []
    direct_materials = [m for m in old_ids if i in goals[m]['examData'].get('coveredGoalIds', [])]
    for s in raw['allScopeRows']:
        if i not in s['missingEffectiveTerminalTargetIds']:
            continue
        checks = []
        visible = set(s['visibleAllAtomicIds'])
        course = s['scopeFilters'][0]
        for mid in direct_materials:
            m = materials[mid]
            g = goals[mid]
            absent = sorted(set(m['wholeMaterialPrerequisites']) - visible)
            course_fits = course in g['tags']
            jurisdiction_fits = s['jurisdiction'] in m['actualCompiled']['compiledApplicability'].get('jurisdiction', [])
            checks.append({'materialId': mid, 'wholeNativeMandatoryClosure': m['wholeMaterialPrerequisites'], 'wholeCurrentCompiledRow': m['actualCompiled'], 'missingWholePrerequisiteIds': absent, 'courseFits': course_fits, 'jurisdictionFits': jurisdiction_fits, 'materialAlreadyVisible': mid in s['actualTerminalIds'], 'closureEligibleForThisMissingContext': not absent and course_fits and jurisdiction_fits, 'scientificWholeEvidenceMustBeIndependentlyBoundBeforeAccessAuthoring': True})
        contexts.append({'viewPath': s['viewPath'], 'jurisdiction': s['jurisdiction'], 'scopeFilters': s['scopeFilters'], 'wholeExistingMaterialChecks': checks})
    rows.append({'goalId': i, 'wholeCurrentDEENGoal': goals[i], 'wholeOriginalPositiveRecord': profiles[i], 'wholeExistingDirectCoveredMaterialIds': direct_materials, 'actualMissingScopeContexts': contexts})
result = {'role': 'AUTHOR B readonly KEEP-first intake, no new scientific verdict or scope approval', 'immutableWholeCurrent597': binding(FROZEN), 'activeWhole597ActualAtIntake': binding(CAN), 'wholeRegistry': binding(REG), 'wholeSemanticLedger': binding(R / subject['semanticKindLedgerPath']), 'whole43OriginalConfigAndProfileBindings': profile_bindings, 'foreignActualCurrent597FullNative': binding(RAW), 'actualGlobalMissingOccurrences': 512, 'actualGlobalMissingUniqueIDs': 81, 'whole14CurrentDEENContractsAndOriginalP28': rows, 'wholeTenExistingMaterials': [{'wholeCurrentMaterial': goals[i], 'wholeForeignActualNativeClosureAndCompilation': materials[i]} for i in old_ids], 'all64WholeScopeRows': raw['allScopeRows'], 'selectedMissingOccurrences': sum(len(r['actualMissingScopeContexts']) for r in rows), 'selectedMissingUniqueGoalIds': len([r for r in rows if r['actualMissingScopeContexts']]), 'strictNewClosures': 0, 'restoredActiveBindings': 0, 'activeWrites': 0, 'newImages': 0, 'humanApprovalOrTrialClaim': False, 'historicalWholeReviewRestart': False}
output = O / 'actual-current597-fourteen-whole-contracts-original-P28-ten-existing-materials-and64-scope-KEEP-first.AUTHOR-intake.json'
assert not output.exists()
output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'output': binding(output), 'selectedMissingOccurrences': result['selectedMissingOccurrences'], 'rows': [{'goalId': r['goalId'], 'title': r['wholeCurrentDEENGoal']['title'], 'actualMissingContexts': len(r['actualMissingScopeContexts']), 'eligibleExistingClosureContexts': sum(any(m['closureEligibleForThisMissingContext'] for m in c['wholeExistingMaterialChecks']) for c in r['actualMissingScopeContexts'])} for r in rows]}, ensure_ascii=False))
