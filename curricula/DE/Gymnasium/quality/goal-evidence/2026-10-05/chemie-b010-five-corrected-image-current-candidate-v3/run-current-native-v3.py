#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Run the unchanged native producers against explicitly reviewed image imports."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil, subprocess

ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
ISO = ROOT / 'tmp/chemie-b010-five-corrected-native-isolated-20261005-v3'
PRIOR = OWN.parent / 'chemie-b010-five-prospective-current-candidate-v1'
POSITIVE = OWN.parent / 'chemie-b010-five-independent-positive-review-v2'

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def write(p, value):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.is_symlink(): p.unlink()
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def copy_own(name, source):
    if Path(source).resolve() != (OWN / name).resolve():
        shutil.copy2(source, OWN / name)
    dest = ISO / REL / name
    assert dest.parent.resolve() == dest.parent, 'Own output directory must be physical'
    if dest.is_symlink(): dest.unlink()
    shutil.copy2(source, dest)

assert not (OWN / 'native-finalbook').exists(), 'Do not overwrite a prepared book'
imports = read(OWN / 'final-reviewed-image-imports.input.json')
assert imports['machineVisualReviewPassed'] is True
assert imports['humanApproval'] is False
assert {r['goalId'] for r in imports['images']} == {
    '16a80de2-b5e0-5467-a9b3-5860730d7d8b', '1f5ee84f-245a-5a1e-a260-f960f26523e9'
}
for row in imports['images']:
    assert sha(ROOT / row['imagePath']) == row['imageSHA256']
    assert sha(ROOT / row['reviewReceiptPath']) == row['reviewReceiptSHA256']
    assert row['altText'] and row['promptPath']
    for base in ['curricula/DE/Gymnasium/visualizations/chemie', 'app/public/assets/goal-visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie']:
        parent = ISO / base / row['goalId']
        assert parent.resolve() == parent, f'Writable image parent must be physical: {parent}'

baseline = read(OWN / 'isolation-ready.actual.receipt.json')
for row in baseline['nativeCurrentCodeFiles']:
    if row['path'].startswith('app/scripts/config/'): continue
    assert sha(ISO / row['path']) == row['sha256'], row['path']
    assert sha(ROOT / row['path']) == row['sha256'], row['path']
assert sha(PRIOR / 'prepared.freeze.manifest.json') == baseline['priorPreparedFreezeSHA256']

candidate = read(POSITIVE / 'positive-evidence.candidates.json')
config = read(PRIOR / 'positive-evidence.config.json')
config['reviewId'] = candidate['reviewId']
config['reviewPath'] = str(REL / 'positive-evidence.review.jsonl')
config['scope']['label'] = 'Five exact independently scientifically reviewed AI profiles; native current final image bindings, E1/G1, human review pending'
write(OWN / 'positive-evidence.config.json', config)
copy_own('positive-evidence.config.json', OWN / 'positive-evidence.config.json')
copy_own('positive-evidence.candidates.json', POSITIVE / 'positive-evidence.candidates.json')
assert sha(OWN / 'positive-evidence.candidates.json') == sha(POSITIVE / 'positive-evidence.candidates.json')

terminal = []
def run(name, args):
    start = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(args, cwd=ISO, text=True, capture_output=True)
    (OWN / f'{name}.stdout.txt').write_text(result.stdout)
    (OWN / f'{name}.stderr.txt').write_text(result.stderr)
    terminal.append({'name': name, 'args': args, 'cwd': str(ISO), 'startedAtUTC': start, 'endedAtUTC': datetime.now(timezone.utc).isoformat(), 'actualExitCode': result.returncode,
                     'stdoutPath': str(REL / f'{name}.stdout.txt'), 'stdoutSHA256': sha(OWN / f'{name}.stdout.txt'),
                     'stderrPath': str(REL / f'{name}.stderr.txt'), 'stderrSHA256': sha(OWN / f'{name}.stderr.txt')})
    write(OWN / 'native-preparation-terminal.receipt.json', {'status': 'in_progress' if result.returncode == 0 else 'HOLD_native_failure', 'commands': terminal, 'humanApproval': False, 'strictClosure': 0, 'activeWrites': 0})
    print(json.dumps({'command': name, 'actualExitCode': result.returncode, 'stdout': result.stdout[:700], 'stderr': result.stderr[:700]}), flush=True)
    assert result.returncode == 0, f'{name}: {result.stderr}'

for row in imports['images']:
    run(f'import-{row["goalId"][:8]}-PNG', ['node', 'scripts/import_goal_visualization.mjs', '--goal', row['goalId'], '--image', str(ROOT / row['imagePath']),
        '--landscape', 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', '--subject', 'chemie', '--lang', 'de',
        '--provider', 'ChatGPT/Codex built-in imagegen', '--review-status', 'pilot', '--license', 'CC-BY-4.0', '--description', row['description'], '--alt-text', row['altText'], '--prompt', str(ROOT / row['promptPath'])])

qa_relative = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
qa = read(ISO / qa_relative)
qa_before = {r['goalId']: dict(r) for r in qa['records']}
canon = read(ISO / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
goals = {g['id']: g for g in canon['goals']}
updated = []
for source in imports['nativeVisualFieldSources']:
    assert sha(ROOT / source['path']) == source['sha256']
    for fields in read(ROOT / source['path'])['records']:
        if fields['goalId'] not in source['adoptGoalIds']: continue
        goal = goals[fields['goalId']]
        assert fields['title'] == goal['title'] and fields['description'] == goal['description']
        assert fields['aiApproved'] == 'yes'
        link = next(l for l in goal['resourceLinks'] if l['type'] == 'goal-visualization' and l.get('role', 'primary') == 'primary')
        actual = 'sha256:' + sha(ISO / ('app/public' + link['url']))
        assert fields['assetSha256'] == fields['aiApprovedAssetSha256'] == actual
        row = next(r for r in qa['records'] if r['goalId'] == goal['id'])
        row.update(fields)
        row.update({'imageUrl': link['url'], 'publicAssetPath': 'app/public' + link['url'],
            'canonicalAssetPath': 'curricula/DE/Gymnasium/visualizations/chemie/' + goal['id'] + '/' + Path(link['url']).name})
        # These are explicit machine image judgments. Existing human fields stay
        # exactly as recorded and are not upgraded by this binding operation.
        for key in ['humanApproved', 'humanIssueIdentified', 'humanIssueDescription', 'humanReviewedAt', 'humanReviewer']:
            assert row[key] == qa_before[goal['id']][key]
        updated.append(goal['id'])
assert len(updated) == len(set(updated)) == 4
for row in qa['records']:
    if row['goalId'] not in updated: assert row == qa_before[row['goalId']]
write(ISO / qa_relative, qa)
write(OWN / 'native-current-four-V-adoption.actual.receipt.json', {
    'sourceInputs': imports['nativeVisualFieldSources'], 'exactAdoptedGoalIds': updated,
    'unrelatedRecordsExactlyUnchanged': len(qa['records']) - len(updated),
    'humanFieldsExactlyPreserved': True, 'historicalJPGReviewsNotAppliedToNewPNGs': True,
    'humanApproval': False, 'activeWrites': 0})

# No historical hash patch: the native producer reads the final imported raw
# canonical bytes and rebuilds the complete SourceAtlas receipt and views.
run('source-atlas-generate', ['app/node_modules/.bin/tsx', 'app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'])
run('source-atlas-check', ['app/node_modules/.bin/tsx', 'app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json', '--check'])
run('p-five-native-materialize', ['app/node_modules/.bin/tsx', 'app/scripts/materializePositiveGoalEvidenceCandidates.ts', '--config', str(REL / 'positive-evidence.config.json'), '--candidates', str(REL / 'positive-evidence.candidates.json'), '--write'])
run('p-five-native-check', ['app/node_modules/.bin/tsx', 'app/scripts/positiveGoalEvidenceReview.ts', f'--config={REL}/positive-evidence.config.json', '--mode=check'])
run('final-nine-book-prepare', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'prepare', '--config', str(REL / 'batch.config.json')])
run('final-nine-book-check', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'check', '--config', str(REL / 'batch.config.json')])

for prefix, script in [('a-five', 'semanticAtomicityReview.ts'), ('m-five', 'memoryCardReview.ts'), ('latest-full-m-prospective', 'memoryCardReview.ts')]:
    # Images do not alter these science fingerprints; verify, never write them.
    run(f'{prefix}-final-check', ['app/node_modules/.bin/tsx', f'app/scripts/{script}', f'--config={REL}/{prefix}.config.json', '--mode=check'])

shutil.copytree(ISO / REL / 'native-finalbook', OWN / 'native-finalbook')
for leaf in ['positive-evidence.review.jsonl', 'future-full.book-model.json', 'm-five.report.json', 'latest-full-m-prospective.report.json']:
    if (ISO / REL / leaf).exists(): shutil.copy2(ISO / REL / leaf, OWN / leaf)
model = read(OWN / 'native-finalbook/bundle/book-model.json')
manifest = read(OWN / 'native-finalbook/batch-manifest.json')
render = read(OWN / 'native-finalbook/bundle/book.pdf.render-manifest.json')
assert len(model['pages']) == 9 and manifest['curriculumAtomicDenominatorAtPreparation'] == 376
assert not list((OWN / 'native-finalbook/round-a/results').iterdir())
assert not list((OWN / 'native-finalbook/round-b/results').iterdir())
write(OWN / 'native-preparation-terminal.receipt.json', {'status': 'PASS_inactive_native_preparation_only', 'commands': terminal,
    'goalPages': 9, 'physicalPages': render['physicalPageCount'], 'nativeModelDigest': model['digest'],
    'bundleFingerprint': manifest['artifacts']['bundleFingerprint'], 'reviewInputFingerprint': manifest['artifacts']['reviewInputFingerprint'],
    'curricularAtomicDenominator': 376, 'D2ResultDirectoriesEmpty': True, 'DReviewsConducted': 0,
    'PProfilesScientificallyReviewedByIndependentRoot': 5, 'PStatusNeedsHumanReview': 5, 'PApprovedHuman': 0,
    'imageImportsAlreadyIndependentlyMachineReviewed': 2, 'newScientificAuthorshipChangesByThisAgent': 0,
    'strictClosure': 0, 'humanApproval': False, 'activeWrites': 0})
