from pathlib import Path
import datetime
import hashlib
import json

own = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-next-molecular-genetics-twenty-three-preparation-a-v1')
def bind(path):
    data = Path(path).read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(path, value):
    with path.open('x', encoding='utf-8') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')

input_path = own / 'next-package.input.json'
input = json.loads(input_path.read_text())
for binding in input['allRelevantActualInputBindings']:
    assert bind(binding['path']) == binding, binding['path']
material_dir = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1/retained-material')
material_paths = [material_dir / 'standard-code-sun.author-material.svg', material_dir / 'standard-code-sun.codon-data.actual.json']
codon_data = json.loads(material_paths[1].read_text())
dependency_path = own / 'exact-historical-code-wheel-material-dependency.bindings.json'
write(dependency_path, {'schemaVersion': 1, 'role': 'Actual historical candidate case dependencies are retained by exact bytes; no new V or P review', 'files': [bind(p) for p in material_paths], 'codonDataTopLevelKeys': list(codon_data), 'relatedGoalId': 'e349d8c4-2ba3-5360-bd44-13457e5c0aa3', 'newReview': False, 'humanApproval': False})
source_frame = json.loads((own / 'open118-whole-source-duty-and-partner-frame.neutral.json').read_text())
selected = set(input['selectedGoalIds'])
selected_rows = [r for r in source_frame['rows'] if any(g['goalId'] in selected for g in r['linkedOpenGoals'])]
selected_partners = {key for r in selected_rows for key in r['wholeCanonicalPartnerGoalIds']}
assert len(selected_rows) == 38 and len(selected_partners) == 44
assert not selected & set(input['preserveExactStrict262GoalIds'])
assert not selected & set(input['preserveExactReviewed14GoalIds'])
assert len(input['preserveExactStrict262GoalIds']) == 262 and len(input['preserveExactReviewed14GoalIds']) == 14
assert input['newPProfilesWrittenByThisPreparation'] == input['newPCasesWrittenByThisPreparation'] == 0
entry_path = own / 'completed-open118-next-twenty-three-neutral-preparation.handoff.entry.json'
write(entry_path, {
    'schemaVersion': 1,
    'role': 'Completed current Biology open118 diagnosis and disjoint23 next-package neutral handoff; no author expansion or new independent gate decisions',
    'preparedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'neutralNextPackageInput': bind(input_path),
    'prioritizedPlan': bind(own / 'prioritized-next-package-plan.md'),
    'fullOpen118Inventory': bind(own / 'current118-open-goals-gates-source-ownership.neutral.json'),
    'wholeSourcePartnerFrame': bind(own / 'open118-whole-source-duty-and-partner-frame.neutral.json'),
    'twoExactHistoricalCaseMaterials': bind(own / 'two-existing-genetic-code-and-protein-mechanism-candidates.exact-neutral-reuse.json'),
    'exactCodeWheelDependencies': bind(dependency_path),
    'wholeBilingual118Reading': bind(own / 'whole-open118-bilingual-description-reading.txt'),
    'actualPrimaryContexts': bind(own / 'three-actual-primary-routing-contexts.receipt.json'),
    'currentScope': {'denominator': 394, 'strictPreserved': 276, 'preservedPrevious262': 262, 'preservedReviewed14': 14, 'open': 118, 'allOpenMissingD': 118, 'allOpenMissingP': 118, 'allOpenMissingV': 118, 'currentA': 394, 'currentM': 394},
    'selectedPackage': {'goals': 23, 'goalIds': input['selectedGoalIds'], 'currentSourceWholeDecisions': 38, 'wholeCanonicalPartners': 44, 'historicalExactReuseGoals': 2, 'historicalBilingualReuseCases': 4, 'newProfiles': 0, 'newCases': 0, 'excludedOtherOpenGoals': 95, 'activeBiologyLedgerReservations': 0, 'reservationMadeByThisPreparation': False},
    'selectedCurrentSourceDutyRowIds': [r['rowId'] for r in selected_rows],
    'allInputBindingsVerifiedCurrent': True,
    'all118FullDEENDescriptionsRead': True,
    'actualSelectedBY9BY12GAEAGeneticsSectionsRead': True,
    'otherPrimarySourceOperatorsIndependentlyReviewedHere': False,
    'newIndependentGateApprovals': 0,
    'sourceCourseHoldsLifted': False,
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0, 'activeWrites': [],
})
freeze_path = own / 'next-package.preparation.first.freeze.json'
write(freeze_path, {'schemaVersion': 1, 'role': 'Immutable neutral current open118 diagnosis and disjoint23 preparation first freeze', 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'entry': bind(entry_path), 'outputs': [bind(p) for p in sorted(own.rglob('*')) if p.is_file() and p != freeze_path], 'strictGain': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': []})
print(json.dumps({'entry': bind(entry_path), 'input': bind(input_path), 'firstFreeze': bind(freeze_path)}, indent=2))
