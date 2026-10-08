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
AUTHOR = OWN.parent / 'wirtschaft-q3-trade-finance-sixteen-bilingual-positive-author-v1'
IMAGE_ROOT = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q3-trade-finance-sixteen-independent-image-review-20261008-v1'
SELECTION = IMAGE_ROOT / 'actual-final-sixteen-selection-13originalKEEP-3correctedKEEP.receipt.json'
ALTS = IMAGE_ROOT / 'actual-final-sixteen-alttexts.candidate.json'
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
    assert sha(SELECTION)=='sha256:569b6add7269ffca33de82dc19693653926ee0c20c5c4c1b1e7a403b9efe337b'
    assert sha(ALTS)=='sha256:57591409159a7fac603d9b535c0b3f0c348197f413ef8d26820341ca640c6da8'
    selected=read(SELECTION); alts={row['goalId']:row['altTextCandidateFromActualMotif'] for row in read(ALTS)}
    assert selected['counts']['KEEP']==16 and selected['counts']['openImageFindings']==0 and selected['counts']['REJECT']==0
    assert len(selected['rows'])==16 and {i['goalId'] for i in selected['rows']}==set(ids) and set(alts)==set(ids)
    selected['rows']=sorted(selected['rows'],key=lambda i:ids.index(i['goalId']))
    goals={g['id']:g for g in read(AUTHOR/'whole-goals.candidate.json')}
    checked=[]
    def prefixed(h):return h if h.startswith('sha256:') else 'sha256:'+h
    for raw in selected['rows']:
        item={'goalId':raw['goalId'],'assetPath':raw['candidatePath'],'assetSha256':'sha256:'+raw['assetSha256'],'reviewReceiptPath':raw['independentReceiptPath'],'reviewReceiptSha256':'sha256:'+raw['independentReceiptSha256']}
        asset=ROOT/item['assetPath']; review_path=ROOT/item['reviewReceiptPath'];r=read(review_path);g=goals[item['goalId']]
        assert sha(asset)==item['assetSha256'] and sha(review_path)==item['reviewReceiptSha256']
        assert r['goalId']==g['id'] and r['decision']=='KEEP' and r.get('openFindings',[])==[]
        assert r['humanApprovalClaimed'] is False
        author_independent=r.get('independentOfAuthor',r.get('reviewer',{}).get('independentOfImageAuthor'))
        assert author_independent is True
        if 'wholeCurrentPreparedGoal' in r:
            assert r['wholeCurrentPreparedGoal']==g
        else:
            assert r.get('currentGoalTitle',r.get('currentTitleDe'))==g['title']
            assert r.get('currentGoalDescriptionDe',r.get('currentDescriptionDe'))==g['description']
            assert r.get('currentGoalDescriptionEn',r.get('currentDescriptionEn'))==g['descriptionEn']
        assert prefixed(r.get('imageSha256',r.get('assetSha256')))==item['assetSha256']
        views=r.get('actualInspectedViews',r.get('inspections'))
        assert isinstance(views,list) and any(v['path']==item['assetPath'] for v in views)
        assert any(v.get('width')==360 for v in views) and any(v.get('width')==680 for v in views)
        for v in views:assert sha(ROOT/v['path'])==prefixed(v['sha256'])
        assert asset.suffix=='.png' and (r.get('format')=='PNG' or r.get('formatDecision',{}).get('format')=='PNG')
        generation=asset.parent/'generation.actual.json';gen=read(generation)
        assert gen['provider']=='OpenAI Codex image_gen' and prefixed(gen['assetSha256'])==item['assetSha256']
        prompt=asset.parent/('actual-prompt.txt' if (asset.parent/'actual-prompt.txt').exists() else 'prompt.actual.txt')
        assert prompt.exists() and alts[g['id']]==r['altTextCandidateFromActualMotif'] and isinstance(alts[g['id']],str) and alts[g['id']].strip()
        reviewer=r.get('reviewerAgent',r.get('reviewer',{}).get('agentIdentity'))
        assert reviewer and reviewer!='/root'
        notes=r.get('rationaleDe',r.get('actualSubjectReview',''))
        inspection_notes=r.get('actualActorPerspectiveAndReadabilityReview','')
        projected={'provider':gen['provider'],'reviewDate':r['reviewedAt'],'independentReviewer':reviewer,
                   'actualInspection':{'fachlichePruefung':notes,'phone':inspection_notes,'desktop':'Actual width680 inspection recorded in the cited independent receipt.','actorPerspective':'Actor-perspective finding and native/360/680 views are documented in the cited independent receipt.'}}
        checked.append((item,projected,asset,prompt,generation,review_path))
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
            '--provider', actual_review['provider'], '--review-status', 'approved_ai',
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
                       'aiReviewedAt': actual_review['reviewDate'],
                       'aiReviewer': actual_review['independentReviewer'],
                       'aiNotes': 'Actual independent image review: ' + item['reviewReceiptPath'] + ' (' + item['reviewReceiptSha256'] + '). '
                                  + actual_review['actualInspection']['fachlichePruefung'] + ' '
                                  + actual_review['actualInspection']['phone'] + ' '
                                  + actual_review['actualInspection']['desktop'] + ' '
                                  + actual_review['actualInspection']['actorPerspective'],
                       'humanApproved': 'no', 'humanReviewedAt': None, 'humanReviewer': ''})
    assert sum(r['visualizationState'] == 'available' for r in qa['records']) == 141
    for r in qa['records']:
        if r['goalId'] in set(ids):r['aiNotes']=' '.join(r['aiNotes'].split())
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
        'scope': {'label': 'Economics Q3 trade/finance sixteen final-image-bound AI profile candidates; human approval separate', 'goalIds': ids}}
    config_rel = REL / 'positive-final-images.candidate.config.json'
    write(isolate / config_rel, p_config)
    run('materialize-positive-final-image-candidates', [tsx, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts',
                                                     '--config', str(config_rel), '--candidates', str(AUTHOR.relative_to(ROOT) / 'positive.candidates.json'), '--write'])
    run('positive-final-image-current-check', [tsx, 'app/scripts/positiveGoalEvidenceReview.ts', '--config=' + str(config_rel), '--mode=check'])
    records = [json.loads(line) for line in (isolate / p_config['reviewPath']).read_text().splitlines() if line.strip()]
    assert len(records) == 16 and [r['goalId'] for r in records] == ids
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
    root_after = {'canonical':sha(ROOT/CANONICAL),'qa':sha(ROOT/QA),'semkind':sha(ROOT/(BASE+'/wirtschaftswissenschaften.semantic-kinds.json'))}
    write(receipt, {'schemaVersion': 1, 'role': 'technical_preparer', 'startedAt': started,
                    'completedAt': datetime.now(timezone.utc).isoformat(), 'physicalIsolate': str(isolate),
                    'selectionPath': str(SELECTION.relative_to(ROOT)), 'selectionSha256': sha(SELECTION),
                    'altTextPath': str(ALTS.relative_to(ROOT)), 'altTextSha256': sha(ALTS),
                    'selectedActualAssetCount': 16, 'importedAssetCount': 16, 'candidateQaRecords': 303,
                    'machineApprovedCurrentImages': 16, 'inheritedRootMachineApprovedImageGoals': 125, 'humanApprovedImages': 0,
                    'positiveCurrentAiCandidates': 16, 'independentDescriptionReviews': 0,
                    'preparedDescriptionBatches': 0, 'activeWrites': 0, 'newStrictClosures': 0,
                    'capturedRootInputHashesBefore': root_before, 'currentRootInputHashesAfter':root_after, 'concurrentRootContextChanged':root_before!=root_after, 'nativeCommands': runs, 'returnedInertSnapshots': snapshots,
                    'limits': ['Actual image approval is the cited independent machine review, not this import.',
                               'Positive profiles remain needs_human_review/ai_candidate with no fabricated runs.',
                               'Candidate-only semantic-kind source bindings preserve classifications, not claim fachliche re-review.',
                               'Final native D prepare still requires author package acceptance and preserves separate independent rounds.']})
    print(json.dumps({'physicalIsolate': str(isolate), 'nativeImportCount': 16, 'nativeQa303Check': 'passed',
                      'positiveFinalImageCandidates': 16, 'activeWrites': 0, 'preparedDescriptionBatches': 0}))


if __name__ == '__main__':
    main()
