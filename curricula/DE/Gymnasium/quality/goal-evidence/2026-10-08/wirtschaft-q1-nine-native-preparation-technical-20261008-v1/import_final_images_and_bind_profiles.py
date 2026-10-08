"""Apache-2.0. Native candidate preparation in a physical isolate; no active writes."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
AUTHOR = OWN.parent / 'wirtschaft-q1-europe-tax-nine-bilingual-positive-author-v2'
IMAGE_ROOT = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q1-nine-image-author-20261008-v1'
SELECTION = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q1-nine-independent-image-review-20261008-v1/actual-final-nine-KEEP-after-one-correction.receipt.json'
ALTS = SELECTION
CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
BASE = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'


def sha(path):
    return 'sha256:' + hashlib.sha256(Path(path).read_bytes()).hexdigest()


def read(path):
    return json.loads(Path(path).read_text())


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def main():
    receipt = OWN / 'final-image-import-positive-binding.actual.json'
    if receipt.exists():
        raise ValueError('Preserve the existing final import receipt; use a separate version for a changed candidate.')
    started = datetime.now(timezone.utc).isoformat()
    isolate = Path(read(OWN / 'physical-isolate.initial.actual.json')['physicalIsolate'])
    assert isolate.is_dir() and not isolate.is_symlink()
    ids = read(AUTHOR / 'goal-ids.json')
    assert sha(SELECTION) == 'sha256:6abf12658953f8c712056c1107b3043c257da1d7ad39f3a70dd2aa7b1aef57ff'
    selected = read(SELECTION)
    assert selected['finalKeepCount'] == 9 and selected['finalRejectCount'] == selected['openFindings'] == 0
    assert selected['reviewer']['independentOfImageAuthor'] is True and selected['humanApprovalClaimed'] is False
    selection_by_id = {item['goalId']: item for item in selected['selection']}
    assert set(selection_by_id) == set(ids)
    alts = {gid: row['altText'] for gid, row in selection_by_id.items()}
    current_goals = {row['id']: row for row in read(isolate / CANONICAL)['goals']}
    checked = []
    for goal_id in ids:
        row = selection_by_id[goal_id]
        asset = ROOT / row['candidatePath']
        review_path = ROOT / row['independentReceiptPath']
        actual_review = read(review_path)
        item = {'goalId': goal_id, 'assetPath': row['candidatePath'],
                'assetSha256': 'sha256:' + row['assetSha256'],
                'reviewReceiptPath': row['independentReceiptPath'],
                'reviewReceiptSha256': 'sha256:' + row['independentReceiptSha256']}
        assert sha(asset) == item['assetSha256'] == 'sha256:' + actual_review['assetSha256']
        assert sha(review_path) == item['reviewReceiptSha256']
        assert actual_review['goalId'] == goal_id and actual_review['decision'] == row['decision'] == 'KEEP'
        assert actual_review['aiApproved'] == 'yes' and actual_review['openFindings'] == []
        assert actual_review['humanApprovalClaimed'] is False and actual_review['reviewer']['independentOfImageAuthor'] is True
        inspections = actual_review['inspections']
        assert len(inspections) == 3 and all(part['actualViewImage'] is True for part in inspections)
        assert {part['width'] for part in inspections} >= {360, 680}
        assert asset.suffix.lower() == '.png' and actual_review['formatDecision']['format'] == 'PNG'
        assert actual_review['actualGenerator'] == 'OpenAI Codex image_gen'
        assert current_goals[goal_id]['title'] == actual_review['currentTitleDe']
        assert current_goals[goal_id]['description'] == actual_review['currentDescriptionDe']
        prompt = ROOT / actual_review['promptPath']
        generation = ROOT / actual_review['generationReceiptPath']
        assert sha(prompt) == 'sha256:' + actual_review['promptSha256']
        assert sha(generation) == 'sha256:' + actual_review['generationReceiptSha256']
        assert read(generation)['provider'] == actual_review['actualGenerator']
        assert isinstance(alts[goal_id], str) and alts[goal_id].strip()
        assert alts[goal_id] == actual_review['altTextCandidateFromActualMotif']
        for derivative in inspections:
            assert sha(ROOT / derivative['path']) == 'sha256:' + derivative['sha256']
        checked.append((item, actual_review, asset, prompt, generation, review_path))
    # All inputs are checked before the first isolate mutation.
    logs = OWN / 'actual-native-import-logs'
    logs.mkdir(exist_ok=False)
    runs = []

    def run(name, command):
        run_start = datetime.now(timezone.utc).isoformat()
        result = subprocess.run(command, cwd=isolate, capture_output=True, text=True)
        (logs / (name + '.stdout.txt')).write_text(result.stdout)
        (logs / (name + '.stderr.txt')).write_text(result.stderr)
        runs.append({'name': name, 'command': command, 'cwd': str(isolate),
                     'startedAt': run_start, 'completedAt': datetime.now(timezone.utc).isoformat(),
                     'exitCode': result.returncode,
                     'stdoutPath': str((logs / (name + '.stdout.txt')).relative_to(ROOT)),
                     'stderrPath': str((logs / (name + '.stderr.txt')).relative_to(ROOT))})
        assert result.returncode == 0, result.stdout + '\n' + result.stderr

    root_before = {'canonical': sha(ROOT / CANONICAL), 'qa': sha(ROOT / QA),
                   'semkind': sha(ROOT / (BASE + '/wirtschaftswissenschaften.semantic-kinds.json'))}
    for source in [SELECTION, ALTS] + [p for _, _, asset, prompt, generation, review in checked for p in [asset, prompt, generation, review]]:
        target = isolate / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        assert sha(source) == sha(target)
    for index, (item, actual_review, asset, prompt, _, _) in enumerate(checked):
        goal_id = item['goalId']
        run(f'image-{index+1:02}-{goal_id}', [
            'node', 'scripts/import_goal_visualization.mjs', goal_id, str(asset.relative_to(ROOT)),
            '--landscape', CANONICAL, '--subject', 'wirtschaftswissenschaften', '--lang', 'de',
            '--provider', actual_review['actualGenerator'], '--review-status', 'approved_ai',
            '--license', 'CC-BY-4.0', '--alt-text', alts[goal_id], '--prompt', str(prompt.relative_to(ROOT))])
    tsx = 'app/node_modules/.bin/tsx'
    run('generate-current-qa303', [tsx, 'app/scripts/generateGoalVisualizationQaLedgers.ts', '--subject', 'wirtschaftswissenschaften'])
    qa = read(isolate / QA)
    assert len(qa['records']) == 303
    by_id = {record['goalId']: record for record in qa['records']}
    for item, actual_review, _, _, _, _ in checked:
        record = by_id[item['goalId']]
        assert record['visualizationState'] == 'available' and record['assetSha256'] == item['assetSha256']
        for path_key in ['publicAssetPath', 'canonicalAssetPath']:
            assert sha(isolate / record[path_key]) == item['assetSha256']
        record.update({'aiApproved': 'yes', 'aiApprovedAssetSha256': item['assetSha256'],
                       'aiReviewedAt': actual_review['reviewedAt'][:10],
                       'aiReviewer': actual_review['reviewer']['agentIdentity'],
                       'aiNotes': 'Actual independent image review: ' + item['reviewReceiptPath'] + ' (' + item['reviewReceiptSha256'] + '). '
                                  + actual_review['actualSubjectReview'] + ' '
                                  + actual_review['actualMotifAndLegibility'] + ' '
                                  + actual_review['actualActorPerspectiveReview'],
                       'humanApproved': 'no', 'humanReviewedAt': None, 'humanReviewer': ''})
    assert sum(r['visualizationState'] == 'available' for r in qa['records']) == 60
    write(isolate / QA, qa)
    run('qa-current-check', [tsx, 'app/scripts/generateGoalVisualizationQaLedgers.ts', '--subject', 'wirtschaftswissenschaften', '--check'])
    run('candidate-semkind-final-image-binding', [tsx, str(REL / 'bind-candidate-semkind.mts')])
    candidate = read(AUTHOR / 'positive.candidates.json')
    landscape = read(isolate / CANONICAL)
    p_config = {
        '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
        'schemaVersion': 2, 'reviewId': candidate['reviewId'],
        'goalFingerprintRuleVersion': 'goal-evidence-v1', 'profileRuleVersion': 'positive-understanding-evidence-v2',
        'landscapeId': landscape['landscapeId'], 'landscapePath': CANONICAL,
        'semanticKindLedgerPath': BASE + '/wirtschaftswissenschaften.semantic-kinds.json',
        'reviewCriteriaPath': str(AUTHOR.relative_to(ROOT) / 'authoring-review.criteria.md'),
        'reviewPath': str(REL / 'positive-final-images.records.candidate.jsonl'),
        'reviewedResourceTypes': ['goal-visualization'], 'requireApproved': False,
        'scope': {'label': 'Economics Q1 nine final-image-bound AI profile candidates; human approval separate', 'goalIds': ids}}
    config_rel = REL / 'positive-final-images.candidate.config.json'
    write(isolate / config_rel, p_config)
    run('materialize-positive-final-image-candidates', [tsx, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts',
                                                     '--config', str(config_rel), '--candidates', str(AUTHOR.relative_to(ROOT) / 'positive.candidates.json'), '--write'])
    run('positive-final-image-current-check', [tsx, 'app/scripts/positiveGoalEvidenceReview.ts', '--config=' + str(config_rel), '--mode=check'])
    records = [json.loads(line) for line in (isolate / p_config['reviewPath']).read_text().splitlines() if line.strip()]
    assert len(records) == 9 and [r['goalId'] for r in records] == ids
    assert all(r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate' and r['reviewRunIds'] == [] for r in records)
    # Return only inert candidate/preparation artifacts, never active source or QA paths.
    snapshot_paths = {'candidate-canonical.final-images.inert.json': CANONICAL,
                      'candidate-semantic-kinds.final-images.inert.json': BASE + '/wirtschaftswissenschaften.semantic-kinds.json',
                      'candidate-qa303.final-images.inert.json': QA,
                      'positive-final-images.candidate.config.json': str(config_rel),
                      'positive-final-images.records.candidate.jsonl': p_config['reviewPath']}
    snapshots = []
    for target_name, source_rel in snapshot_paths.items():
        shutil.copy2(isolate / source_rel, OWN / target_name)
        snapshots.append({'path': str((OWN / target_name).relative_to(ROOT)), 'sha256': sha(OWN / target_name), 'isolateSourcePath': source_rel})
    assert root_before == {'canonical': sha(ROOT / CANONICAL), 'qa': sha(ROOT / QA),
                          'semkind': sha(ROOT / (BASE + '/wirtschaftswissenschaften.semantic-kinds.json'))}
    write(receipt, {'schemaVersion': 1, 'role': 'technical_preparer', 'startedAt': started,
                    'completedAt': datetime.now(timezone.utc).isoformat(), 'physicalIsolate': str(isolate),
                    'selectionPath': str(SELECTION.relative_to(ROOT)), 'selectionSha256': sha(SELECTION),
                    'altTextPath': str(ALTS.relative_to(ROOT)), 'altTextSha256': sha(ALTS),
                    'selectedActualAssetCount': 9, 'importedAssetCount': 9, 'candidateQaRecords': 303,
                    'machineApprovedCurrentImages': 9, 'inheritedRootMachineApprovedImageGoals': 51, 'humanApprovedImages': 0,
                    'positiveCurrentAiCandidates': 9, 'independentDescriptionReviews': 0,
                    'preparedDescriptionBatches': 0, 'activeWrites': 0, 'newStrictClosures': 0,
                    'unchangedRootInputHashes': root_before, 'nativeCommands': runs, 'returnedInertSnapshots': snapshots,
                    'limits': ['Actual image approval is the cited independent machine review, not this import.',
                               'Positive profiles remain needs_human_review/ai_candidate with no fabricated runs.',
                               'Candidate-only semantic-kind source bindings preserve classifications, not claim fachliche re-review.',
                               'Final native D prepare waits for the actual current Root68 context overlay and native whole-page parity; this import itself freezes no D batch.']})
    print(json.dumps({'physicalIsolate': str(isolate), 'nativeImportCount': 9, 'nativeQa303Check': 'passed',
                      'positiveFinalImageCandidates': 9, 'activeWrites': 0, 'preparedDescriptionBatches': 0}))


if __name__ == '__main__':
    main()
