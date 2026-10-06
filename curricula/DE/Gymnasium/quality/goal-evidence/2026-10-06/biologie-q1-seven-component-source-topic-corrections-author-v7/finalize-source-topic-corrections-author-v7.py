"""Bind the actual author delta, review inputs and preservation results, then freeze."""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import jsonschema

REPO = Path.cwd()
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
OUT = BASE / 'biologie-q1-seven-component-source-topic-corrections-author-v7'
V6 = BASE / 'biologie-q1-seven-component-native-source-preparation-author-v6'
FREEZE = OUT / 'source-topic-corrections.author-v7.final.freeze.json'
assert not FREEZE.exists(), 'Frozen history must not be changed'
NOW = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads(Path(path).read_text())

def put(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def binding(path):
    path = Path(path)
    return {'path': str(path.relative_to(REPO)), 'sha256': sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

effective = read(OUT / 'effective-native-inputs.author-v7.json')
native = read(OUT / 'native-source390-book383-to390-gui-superset-and-delta.actual.json')
deltas = read(OUT / 'eleven-topic-code-and-qualified-parent-deltas.author-v7.json')
assert native['sourceAtlas']['expected390NormalContract'] == 'PASS'
assert native['pureBookModel']['candidateDigestExactlyV6']
assert len(deltas['rows']) == 11
assert not (OUT / 'native-probe.actual.stderr.txt').read_text()
canonical = read(REPO / effective['canonicalEnvelope']['path'])
raw = json.loads(canonical['candidateCanonicalUTF8'])
semantic = read(REPO / effective['semanticEnvelope']['path'])['candidatePayload']
schema_checks = []
for value, schema_path in [(raw, 'docs/landscape-runtime.schema.json'),
                          (semantic, 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json')]:
    schema = read(REPO / schema_path)
    validator = jsonschema.validators.validator_for(schema)(schema)
    validator.validate(value)
    schema_checks.append({'contract': binding(REPO / schema_path), 'status': 'PASS', 'inputGoalCount': len(raw['goals'])})
active_path = BASE / 'chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
active = read(active_path)
active_rows = [{'path': row['path'], 'expectedSHA256': row['sha256'],
                'actualSHA256': sha256((REPO / row['path']).read_bytes()).hexdigest(),
                'exact': row['sha256'] == sha256((REPO / row['path']).read_bytes()).hexdigest()}
               for row in active['currentInputs']]
assert len(active_rows) == 19

plan = read(REPO / effective['caseBindings']['path'])
materials_path = REPO / plan['v5File']
assert binding(materials_path)['sha256'] == plan['v5SHA256']
materials = read(materials_path)
goal_input = read(REPO / effective['sevenGoalsAndPrerequisites']['path'])
new_goals = {goal['id']: goal for goal in goal_input['goals']}
def pointer(value, path):
    for part in path.split('/')[1:]:
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value

goal_rows = []
for component in plan['components']:
    if not component['ordinaryNewGoal']:
        continue
    goal = new_goals[component['proposedCanonicalGoalId']]
    cases = []
    for point in component['caseJSONPointers']:
        case = pointer(materials, point)
        cases.append({'JSONPointer': point, 'caseBody': case,
                      'caseBodyCanonicalJSONSHA256': sha256(json.dumps(case, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()})
    goal_rows.append({'goalId': goal['id'], 'candidateKey': component['candidateKey'], 'wholeGoal': goal,
                      'cases': cases, 'status': component['status'], 'reviewStatus': component['reviewStatus'],
                      'evidenceLevel': component['evidenceLevel'], 'gateLevel': component['gateLevel'],
                      'learnerEvidence': False, 'nativeProfileCreated': False})
assert len(goal_rows) == 7 and sum(len(row['cases']) for row in goal_rows) == 16
put('seven-goals-sixteen-complete-cases.fresh-review-input.snapshot.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'actual exact candidate texts and complete cases for fresh independent review',
    'sourceMaterial': binding(materials_path), 'sourceGoalContract': effective['sevenGoalsAndPrerequisites'],
    'caseBindingPlan': effective['caseBindings'], 'rows': goal_rows,
    'original24SourceCaseBodiesChanged': False, 'sevenNativeGoalObjectsChanged': False,
    'newNativePositiveEvidenceRecords': 0, 'machineReviewDoesNotClaimLearnerOrHumanEvidence': True,
})
review_paths = [OUT / 'effective-native-inputs.author-v7.json',
                OUT / 'eleven-topic-code-and-qualified-parent-deltas.author-v7.json',
                OUT / 'fresh-scoped-original-pdf-source-bindings.actual.json',
                OUT / 'native-source390-book383-to390-gui-superset-and-delta.actual.json',
                OUT / 'seven-goals-sixteen-complete-cases.fresh-review-input.snapshot.json']
review_paths += [REPO / row['envelope']['path'] for row in effective['sourceInputs']]
review_paths += [REPO / effective[key]['path'] for key in ['canonicalEnvelope', 'semanticEnvelope', 'sourceViews',
                 'sevenGoalsAndPrerequisites', 'caseBindings', 'sourceResidualContract', 'STCommonEntryScopeProof']]
review_paths += [materials_path]
review_paths += list(sorted((OUT / 'sources').glob('*.txt')))
unique = {str(path): path for path in review_paths}
common_inputs = [binding(path) for path in unique.values()]
put('review-request.independent-a-targeted-followup.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW,
    'requestedReview': 'targeted follow-up of the eleven original A findings; actual affected source/page/year/heading bindings plus propagated receipt and preservation delta',
    'exactInputs': common_inputs, 'originalAReviewScienceMemoryMaterial': effective['independentAExistingSevenScienceMemoryAndMaterialsDecision'],
    'originalAScopeReview': effective['independentAOriginalScopeReview'],
    'unchangedSevenTextsAtomicityMinPrerequisitesMemoryAnd16MaterialBindings': 'Reuse valid existing A decisions against exact preserved bodies; no restarted review of unchanged targets.',
    'requiredDecisionForEachFinding': 'KEEP or REVISE from personally read original official pages and actual changed fields, not from a SHA alone.',
    'fullExistingGUIPreservation': 'Native source proposals contain complete previous source targets; actual existing GUI views still retain all168 and436 current targets. New full GUI superset registration remains separately required.',
    'originalHoldsPreserved': True, 'freshNativeGatesAndVisualReviewRemainRequired': True,
    'authorCannotSelfApprove': True, 'humanApproval': False, 'humanTrial': False,
})
put('review-request.fresh-independent-b.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW,
    'requestedReview': 'fresh independent B scientific/source/operator/route/atomarity/minPrerequisite/Memory review of the actual seven complete DE/EN targets,16 complete bodies and13 source aspects',
    'exactInputs': common_inputs,
    'independence': 'Do not read original independent A conclusions or decision bodies. The effective input manifest lists retained evidence for audit, but use only author candidate actual bodies, changed source fields, native outputs and original official pages for your own decisions.',
    'sources': 'Read actual authoritative official PDFs/scoped excerpts, including document headings, years, printed/physical page bindings and MV unnumbered local subsection. Preserve broad originals and held routes.',
    'checks': ['seven actual description operator/scope meanings in German and English', '13 actual raw original component clauses and11 corrected qualified parent sections',
               'single semantic routine for each new target', 'six dependent targets need only the supplied carrier prerequisite',
               '16 complete cases and exact final UUID/pointer bindings with honest E1/G1 ai_candidate status',
               'seven individually reasoned Memory decisions; do not copy a bulk default',
               'actual normal390 SourceAtlas, old383/67 page and whole-goal preservation, both DAGs, full existing GUI target preservation; no seven-target replacement',
               'ST common entry phase is declared SekII/GK_LK technical derivation while rawCourseLevel remains unspecified',
               '3417 whole mutation/recombination, original ST default, SH cohorts and BY-oncology/PCR wider obligations remain held'],
    'visualScope': 'No image verdict is requested here; selected new raster author package needs separate actual independent scientific/visual V review.',
    'nativeD_P_A_M_VIntegrationApproval': False, 'humanApproval': False, 'humanTrial': False,
})
put('targeted-schema-preservation-and-gate-reuse.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'schemas': schema_checks,
    'activeCheckpoint': binding(active_path), 'actualActive19Inputs': active_rows,
    'all19ActiveInputsExactAtProbe': all(row['exact'] for row in active_rows),
    'historicalV6ClosureAndAInputsWereDigestVerified': effective['sourceHistoryClosureVerified'],
    'unchangedExpensiveNativeReviewInputs': {
        'canonicalEnvelope': effective['canonicalEnvelope'], 'semanticEnvelope': effective['semanticEnvelope'],
        'allSevenGoalObjects': 'exact v6', 'all24OriginalAuthorCases': binding(materials_path),
        'actualCandidateBookDigestExactlyV6': native['pureBookModel']['candidateDigestExactlyV6'],
        'allOld383AndNew7NativePages': 'Actual pure BookModel candidate digest equals independent v6 digest; no native page-text/context changes from this source-code metadata correction.',
        'sourceMaturityOrHashIsNotScientificApproval': True,
    },
    'newIndependentReviews': 'pending A affected-source follow-up and fresh B actual seven-target review',
    'originalBroadSourceHoldsStillOpen': True, 'oldCombinedFourOperativeImageAvailabilityHoldStillOpen': True,
    'newCurrentNativeD_P_A_M_VBindings': 'not created here; required before integration',
    'existingGUIFullTargetSets': native['existingFullGUIViewChecks'],
    'newGUIRegistration': 'pending complete source-specific target superset adoption; current views unchanged',
    'noFullBuildOrPDFRender': True, 'noGeneratedImageChange': True, 'noSRSNodesCardsDecksAdded': True,
    'activeWrites': False, 'strictGain': 0, 'newScientificClosures': 0, 'restoredActiveBindings': 0,
    'currentChemistry': '112/378', 'currentBiology': '67/383', 'protectedMathematics': '807/807 M7', 'protectedPhysics': '478/478 M7',
    'humanApproval': False, 'humanTrial': False, 'publicationOrDeployment': False,
})

command = ['git', 'diff', '--check', '--', str(OUT.relative_to(REPO))]
result = subprocess.run(command, capture_output=True, text=True)
assert result.returncode == 0, result.stderr
own_json = sorted(OUT.rglob('*.json'))
for path in own_json:
    read(path)
put('targeted-own-checks.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'nativeProbe': {'exitCode': 0, 'stdout': binding(OUT / 'native-probe.actual.stdout.txt'), 'stderr': binding(OUT / 'native-probe.actual.stderr.txt')},
    'ownJSONParsedBeforeFinalChecksAndFreeze': len(own_json), 'parseFailures': 0,
    'gitDiffCheck': {'command': command, 'exitCode': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr},
    'fullIntegrationGateRunClaimed': False,
})
files = []
for path in sorted(OUT.rglob('*')):
    if path.is_file() and path != FREEZE:
        row = binding(path)
        row['path'] = str(path.relative_to(OUT))
        files.append(row)
assert not any(path.is_symlink() for path in OUT.rglob('*'))
put(FREEZE.name, {
    'schemaVersion': 1, 'createdAtUTC': NOW,
    'role': 'frozen targeted source-topic correction AUTHOR v7; no independent or operative approval',
    'files': files, 'ownFileCount': len(files), 'ownBytes': sum(row['bytes'] for row in files),
    'newCorrectedSourceParentBindings': 11, 'BE_BB3_7ExactKeep': True,
    'exactReviewInputBindings': common_inputs,
    'sevenGoalUUIDsDescriptionsSemanticsRequiresAndMemoryInputsPreserved': True,
    'all464OldCanonicalIDsRetained': True, 'all383OldNativePagesExact': True, 'all67ProtectedStrictWholeGoalsAndPagesExact': True,
    'actualSourceAtlas': 'PASS390', 'actualBookPages': [383, 390], 'actualCandidateBookDigestExactlyV6': native['pureBookModel']['candidateDigestExactlyV6'],
    'actualExistingFullGUICurrentTargetsPreserved': [168, 436], 'newGUISupersetRegistrationStillPending': True,
    'freshAFollowupAndBReview': 'pending', 'nativeNewSevenD_P_A_M_V': 'pending', 'independentActualRasterVReview': 'pending',
    'historicalSourceHoldsRemain': True, 'activeWrites': False,
    'newScientificCompletions': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0,
    'currentChemistry': '112/378', 'currentBiology': '67/383',
    'protectedMathM7': '807/807', 'protectedPhysicsM7': '478/478',
    'humanApproval': False, 'humanTrial': False, 'publicationOrDeployment': False, 'integrableNow': False,
})
print(json.dumps({'freeze': binding(FREEZE), 'files': len(files), 'bytes': sum(row['bytes'] for row in files), 'all19ActiveExact': all(row['exact'] for row in active_rows), 'strictGain': 0}))
