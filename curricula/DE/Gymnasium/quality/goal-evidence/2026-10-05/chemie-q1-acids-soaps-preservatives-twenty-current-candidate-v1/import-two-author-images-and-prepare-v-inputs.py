from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil, subprocess

ROOT = Path.cwd().resolve()
REL = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1')
OWN = ROOT / REL
ISO = ROOT / 'tmp/chemie-q1-acids-soaps-preservatives-twenty-native-isolated-20261005-v1'
IMAGE_REL = Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-three-missing-image-candidate-20261005-v1')
CAN = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'

def read(p): return json.loads(Path(p).read_text())
def sha(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p, value):
    p = Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.is_symlink(), 'Refuse active symlink write: ' + str(p)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (OWN / 'eight-current-visual-inputs.freeze.json').exists()
freeze = read(ROOT / IMAGE_REL / 'author-image-inputs.final.freeze.json')
for row in freeze['files']:
    assert sha(ROOT / row['path']) == row['sha256'], 'Changed image-author frozen input'

alts = {
    'ca216bc6-5205-5b46-abbd-fd5628e4ca5b': 'Comiczeichnung zum Aciditätsvergleich: Ethanol und Ethansäure geben jeweils ein Proton ab. Beim Ethanolat liegt die negative Ladung an einem Sauerstoff; beim einzelnen Acetat-Ion ist sie über zwei Sauerstoffatome verteilt, mit gleich dargestellten C–O-Bindungen und einer gemeinsamen negativen Gesamtladung. Die stabilere konjugierte Base wird mit stärkerer Säure verknüpft.',
    '6765f741-42a6-55c5-a218-81b883b1f5ae': 'Drei Bildfelder zeigen Fett mit drei Estergruppen und Natronlauge, die Bildung von Glycerin und drei Natrium-Fettsäuresalzen bei der Verseifung sowie das Aussalzen mit Natriumchlorid. Seife bildet eine getrennte obere Phase; Wasser und Glycerin bleiben in der unteren wässrigen Phase.',
    'a3788e40-b540-5bed-be37-b33053528422': 'Dreiteilige Zeichnung mit Carboxygruppe und saurem Charakter, Indikator und Natriumhydrogencarbonat, der homologen Reihe von Methan- bis Butansäure und vollständigen Strukturformeln von Ethan- und Butansäure.',
    '667bc303-e9b8-570b-84f1-61cc8bdfd006': 'Die Zeichnung vergleicht Veresterung und saure Esterhydrolyse mit entgegengesetzten Reaktionspfeilen sowie alkalische Hydrolyse zu einem Carboxylatsalz und einem Alkohol mit einem einzelnen Vorwärtspfeil. Fruchtaromen, Parfum und Lebensmittelaromen dienen als Alltagsbeispiele.',
    '6966df95-f125-5ecc-af8e-0442545d9f17': 'Schematische Zeichnung amphiphiler Seifenteilchen mit hydrophilem Kopf und hydrophobem Schwanz. An einer Wasser-Öl-Grenzfläche und um ein Fetttröpfchen sind die Köpfe zum Wasser und die Schwänze zum Fett angeordnet.',
    '1837690e-cfb1-5b1c-96c8-0fb40d6d5d69': 'Drei Bildfelder zu Temperatur, Wasserhärte mit Calcium- und Magnesiumionen und Tensidkonzentration führen zu einer Waschmaschine als gemeinsamem Beispiel für die Waschwirkung. Thermometer, Teilchenbilder und verschieden gefüllte Dosierlöffel veranschaulichen die Einflussgrößen.',
    '8a491e3b-5d0b-51d3-9b14-0977ec035dd6': 'Das Bild vergleicht temporäre und permanente Wasserhärte mit Ionen in Bechergläsern, Erwärmung und Niederschlagsbildung beziehungsweise gelösten Salzen. Ein zusätzliches Bildfeld zeigt eine EDTA-Titration mit Farbumschlag und einer Rechnung zur Gesamthärte.',
    'db66635f-f1d1-5f70-bcc0-fed1ae424e52': 'Zwei Bildfelder zeigen die Entfärbung eines farbigen Nachweisreagenzes durch eine Ascorbinsäureprobe und ein Schema der Elektronenabgabe von Ascorbinsäure an ein Oxidationsmittel. Das Schema zeigt oxidierte Ascorbinsäure und ein reduziertes Teilchen.',
}
new_ids = ['ca216bc6-5205-5b46-abbd-fd5628e4ca5b', '6765f741-42a6-55c5-a218-81b883b1f5ae']
resume_local_copy_freeze = (OWN / 'eight-visual-target-and-old-qa.before.snapshot.json').exists()
before_saved = read(OWN / 'eight-visual-target-and-old-qa.before.snapshot.json') if resume_local_copy_freeze else None
before_can = before_saved['canonical'] if before_saved else read(ISO / CAN)
before_qa = before_saved['qa'] if before_saved else read(ISO / QA)
active_hashes = {p: sha(ROOT / p) for p in [CAN, QA, 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json']}
assert not (ISO / CAN).is_symlink() and not (ISO / QA).is_symlink()
requests = read(ROOT / IMAGE_REL / 'actual-initial-generation.requests.json')
edits = read(ROOT / IMAGE_REL / 'actual-targeted-edit.requests.json')
soap_edit = read(ROOT / IMAGE_REL / 'actual-soap-readability-edit.request.json')
terminal = []
for goal_id in ([] if resume_local_copy_freeze else new_ids):
    selected = next(r for r in freeze['selectedCurrentImages'] if r['goalId'] == goal_id)
    assert sha(ROOT / selected['sourceCandidatePath']) == selected['pngSHA256']
    key = 'chem-q1-acidity' if goal_id.startswith('ca216') else 'chem-q1-soap'
    initial = next(r for r in requests if r['key'] == key)['prompt']
    matching_edits = [r['prompt'] for r in edits if ('acidity' in r.get('key', '')) == goal_id.startswith('ca216') and ('ascorbic' not in r.get('key', ''))]
    if goal_id.startswith('6765'): matching_edits = [soap_edit['prompt']]
    prompt_path = OWN / (goal_id[:8] + '.actual-generation-and-edit-history.prompt.md')
    prompt_path.write_text('# Actual generation and targeted edit history\n\n' + initial + ''.join('\n\n## Actual targeted edit\n\n' + p for p in matching_edits) + '\n')
    for p in [f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/{goal_id}.png', f'app/public/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.png', f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.png', f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/prompt.de.md', f'curricula/DE/Gymnasium/visualizations/chemie/{goal_id}/image-reconstruction-prompt.de.md']:
        out = ISO / p
        if out.is_symlink():
            content = out.read_bytes(); out.unlink(); out.write_bytes(content)
        for parent in out.parents:
            if parent == ISO: break
            assert not parent.is_symlink(), 'Output directory escapes isolation'
    args = ['node', 'scripts/import_goal_visualization.mjs', '--goal', goal_id, '--image', str(ROOT / selected['sourceCandidatePath']), '--landscape', CAN, '--subject', 'chemie', '--lang', 'de', '--provider', 'OpenAI / ChatGPT-Codex image generation', '--review-status', 'pilot', '--license', 'CC-BY-4.0', '--description', 'Comic-PNG-Kandidat als qualitative Lernhilfe; Erzeugung ist keine fachliche oder menschliche Freigabe und kein Nachweis einer praktischen Durchführung.', '--alt-text', alts[goal_id], '--prompt', str(prompt_path)]
    started = datetime.now(timezone.utc).isoformat(); run = subprocess.run(args, cwd=ISO, text=True, capture_output=True)
    (OWN / (goal_id[:8] + '-native-image-import.stdout.txt')).write_text(run.stdout)
    (OWN / (goal_id[:8] + '-native-image-import.stderr.txt')).write_text(run.stderr)
    terminal.append({'goalId': goal_id, 'args': args, 'cwd': str(ISO), 'startedAtUTC': started, 'endedAtUTC': datetime.now(timezone.utc).isoformat(), 'actualExitCode': run.returncode, 'sourceCandidatePath': selected['sourceCandidatePath'], 'sourceCandidateSHA256': selected['pngSHA256'], 'actualGeneratorTool': 'image_gen.imagegen', 'actualModelId': 'not exposed; not inferred', 'independentApproval': 'pending', 'humanApproval': False})
    assert run.returncode == 0, run.stderr

canonical = read(ISO / CAN); qa = read(ISO / QA)
for g in canonical['goals']:
    if g['id'] not in alts: continue
    primary = next(l for l in g['resourceLinks'] if l.get('type') == 'goal-visualization' and l.get('role') == 'primary')
    primary['altText'] = alts[g['id']]
    primary['title'] = 'Visualisierung: ' + g['title']
for r in qa['records']:
    if r['goalId'] not in alts: continue
    # Old image/target reviews are archived in before_qa and the immutable history.
    # A current-target pending block is deliberately not an approval.
    for k in ['aiApprovedAssetSha256', 'aiReviewer', 'aiNotes', 'chatGptReviewer', 'chatGptNotes', 'humanReviewer', 'humanIssueDescription']: r[k] = ''
    for k in ['aiReviewedAt', 'chatGptReviewedAt', 'humanReviewedAt']: r[k] = None
    for k in ['aiApproved', 'umlautsCorrectChatGpt', 'contentApprovedChatGpt', 'humanApproved', 'humanIssueIdentified']: r[k] = 'no'
write(ISO / CAN, canonical); write(ISO / QA, qa)
if not resume_local_copy_freeze:
    write(OWN / 'eight-visual-target-and-old-qa.before.snapshot.json', {'canonical': before_can, 'qa': before_qa, 'candidateScope': list(alts), 'priorValidUnchangedSevenImagesRemainUntouched': True})
else:
    for goal_id in new_ids:
        stdout = OWN / (goal_id[:8] + '-native-image-import.stdout.txt')
        stderr = OWN / (goal_id[:8] + '-native-image-import.stderr.txt')
        assert 'Imported goal visualization and updated canonical JSON.' in stdout.read_text() and not stderr.read_text()
        terminal.append({'goalId': goal_id, 'actualExitCode': 0, 'exitCodeEvidence': 'Initial script passed both subprocess returncode assertions and reached the later local-file copy assertion; existing native stdout/stderr retained unchanged.', 'stdoutSHA256': sha(stdout), 'stderrSHA256': sha(stderr), 'cwd': str(ISO), 'actualGeneratorTool': 'image_gen.imagegen', 'actualModelId': 'not exposed; not inferred', 'independentApproval': 'pending', 'humanApproval': False})
    write(OWN / 'existing-six-asset-local-copy-guard.erratum.receipt.json', {'status': 'CORRECTED_local_isolation_copy_guard_before_V_freeze', 'firstAttempt': 'Both native imports and QA generation succeeded; real-file assertion for existing source/backend KEEP copies then stopped. Public KEEP files were already detached, but source/backend read-only input symlinks needed detachment for a complete physical frozen copy.', 'correction': 'Detach existing identical image inputs as local real files before copying; keep already exported new-image copies byte-exact.', 'activeWriteEvents': 0, 'activeContentDeltas': 0, 'pixelChanges': 0, 'notAnImageFindingOrReview': True})

historical_ledger_inputs = []
# The native scanner deliberately uses Dirent.isFile, so read-only leaf symlinks
# are not collected. Supply its historical disposition MD inputs as real copies
# rather than changing the native scanner or unrelated current deferral records.
for source in sorted((ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review').rglob('chemie-*.md')):
    if not source.is_file(): continue
    p = source.relative_to(ROOT); out = ISO / p
    if out.is_symlink():
        out.unlink(); shutil.copy2(source, out)
    assert not out.is_symlink() and sha(out) == sha(source)
    historical_ledger_inputs.append({'path': str(p), 'sha256': sha(source), 'unchangedHistoricalInputCopyOnly': True})
write(OWN / 'native-qa-historical-disposition-input-copies.actual.receipt.json', {'status': 'PASS_real_native_disposition_inputs_without_history_changes', 'inputs': historical_ledger_inputs, 'nativeCodeUnchanged': True, 'activeWrites': 0, 'sourceReason': 'Native isFile scanner cannot collect read-only symlink leaves; detached identical MD inputs preserve unrelated current deferrals.'})
args = ['app/node_modules/.bin/tsx', 'app/scripts/generateGoalVisualizationQaLedgers.ts', '--subject=chemie']
run = subprocess.run(args, cwd=ISO, text=True, capture_output=True)
(OWN / 'native-candidate-v-qa-generate.stdout.txt').write_text(run.stdout); (OWN / 'native-candidate-v-qa-generate.stderr.txt').write_text(run.stderr)
assert run.returncode == 0, run.stderr
current_qa = read(ISO / QA)
current_rows = []
files = []
for goal_id in alts:
    g = next(g for g in canonical['goals'] if g['id'] == goal_id)
    link = next(l for l in g['resourceLinks'] if l.get('type') == 'goal-visualization' and l.get('role') == 'primary')
    q = next(r for r in current_qa['records'] if r['goalId'] == goal_id)
    assert q['title'] == g['title'] and q['description'] == g['description'] and q.get('aiApproved', 'no') == 'no' and q['humanApproved'] == 'no'
    copied = []
    for p in [q['canonicalAssetPath'], q['publicAssetPath'], 'backend/src/main/resources/static/' + link['url'].lstrip('/')]:
        if (ISO / p).is_symlink():
            content = (ISO / p).read_bytes(); (ISO / p).unlink(); (ISO / p).write_bytes(content)
        assert not (ISO / p).is_symlink()
        dest = OWN / 'visual-review-input-tree' / p; dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists(): shutil.copy2(ISO / p, dest)
        assert sha(dest) == sha(ISO / p) == q['assetSha256']
        copied.append({'futureActivePath': p, 'frozenCopyPath': str(dest.relative_to(ROOT)), 'sha256': sha(dest), 'bytes': dest.stat().st_size})
    files.extend(copied)
    current_rows.append({'goalId': goal_id, 'currentOperativeGoal': g, 'currentPrimaryLink': link, 'pendingCurrentTargetQaRecord': q, 'oldQaRecord': next(r for r in before_qa['records'] if r['goalId'] == goal_id), 'imageDecision': 'NEW_inactive_candidate' if goal_id in new_ids else 'KEEP_existing_pixels_pending_targeted_independent_binding', 'preliminaryAuthorConcern': 'HOLD_pending_independent_actual_review_of_overgeneral_harmless_neutralized_labels' if goal_id.startswith('db666') else 'HOLD_pending_independent_actual_review_of_EDTA_scope_and_Mg_boiling_product' if goal_id.startswith('8a491') else 'No author approval claimed; original360680 independent review pending', 'threeExactFutureCopies': copied, 'humanApproval': False, 'scientificOrVisualApprovalByAuthor': False})
before_other = {r['goalId']: r for r in before_qa['records'] if r['goalId'] not in alts}
after_other = {r['goalId']: r for r in current_qa['records'] if r['goalId'] not in alts}
assert before_other == after_other, 'Unrelated QA records changed'
assert all(sha(ROOT / p) == s for p, s in active_hashes.items()), 'Active root content changed during import'
write(OWN / 'eight-current-visual-inputs.candidate.json', {'authority': 'informed_author_inputs_only', 'currentAtomicDenominator': 376, 'status': 'FROZEN_exact_current_inputs_for_independent_original360680_review', 'rows': current_rows, 'generatorAuthorFreezePath': str(IMAGE_REL / 'author-image-inputs.final.freeze.json'), 'generatorAuthorFreezeSHA256': sha(ROOT / IMAGE_REL / 'author-image-inputs.final.freeze.json'), 'actualNativeImportCommands': terminal, 'nativeQaGeneratorExitCode': run.returncode, 'allOtherQaRecordsUnchanged': True, 'activeWritesThisStage': 0, 'priorSameByteCardWriteEventDisclosedSeparately': str(REL / 'card-ledger-same-byte-write-isolation.erratum.receipt.json'), 'strictNetDelta': 0, 'humanApproval': False})
file_list = files + [{'path': str(REL / 'eight-current-visual-inputs.candidate.json'), 'sha256': sha(OWN / 'eight-current-visual-inputs.candidate.json'), 'bytes': (OWN / 'eight-current-visual-inputs.candidate.json').stat().st_size}]
write(OWN / 'eight-current-visual-inputs.freeze.json', {'status': 'FROZEN_exact_eight_current_target_visual_inputs_not_approval', 'preparedAtUTC': datetime.now(timezone.utc).isoformat(), 'goalIds': list(alts), 'files': file_list, 'newImages': new_ids, 'unchangedExistingPixelCount': 6, 'independentApproval': 'pending', 'humanApproval': False, 'activeWritesThisStage': 0, 'strictNetDelta': 0})
print(json.dumps({'status': 'FROZEN_eight_current_visual_inputs', 'nativeImportExitCodes': [r['actualExitCode'] for r in terminal], 'nativeQaGeneratorExitCode': run.returncode, 'copiesFrozen': len(files), 'freezeSHA256': sha(OWN / 'eight-current-visual-inputs.freeze.json'), 'strictNetDelta': 0, 'activeWritesThisStage': 0}))
