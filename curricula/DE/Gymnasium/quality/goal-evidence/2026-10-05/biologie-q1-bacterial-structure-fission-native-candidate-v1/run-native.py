#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Capture real terminal native checks on this inactive physical isolate."""
import json, pathlib, subprocess, sys, time
from datetime import datetime, timezone
root = pathlib.Path.cwd()
own = pathlib.Path(__file__).resolve().parent
rel = own.relative_to(root).as_posix()
meta = json.loads((own / 'prospective-paths.json').read_text())
iso = pathlib.Path(meta['isolationRoot'])
step = sys.argv[1]
tsx = ['app/node_modules/.bin/tsx']
commands = {
    'baseline-full-model': tsx + ['app/scripts/buildGoalBookModel.ts', rel + '/baseline-book.config.json'],
    'atomicity-two-fingerprints': tsx + ['app/scripts/semanticAtomicityReview.ts', '--config=' + rel + '/atomicity.two-author.config.json', '--mode=check', '--write-fingerprints'],
    'memory-two-fingerprints': tsx + ['app/scripts/memoryCardReview.ts', '--config=' + rel + '/memory.two-author.config.json', '--mode=check', '--write-fingerprints'],
    'source-atlas-materialization': tsx + ['app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', meta['atlasPath']],
    'source-atlas-check': tsx + ['app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', meta['atlasPath'], '--check'],
    'future-full-model': tsx + ['app/scripts/buildGoalBookModel.ts', rel + '/book.config.json'],
    'future-full-model-after-qa-normalization': tsx + ['app/scripts/buildGoalBookModel.ts', rel + '/book.config.json'],
    'positive-author-materialization': tsx + ['app/scripts/materializePositiveGoalEvidenceCandidates.ts', '--config=' + rel + '/positive.validation-only.config.json', '--candidates=' + rel + '/positive-evidence.candidates.json', '--write'],
    'positive-author-materialization-corrected-cli': tsx + ['app/scripts/materializePositiveGoalEvidenceCandidates.ts', '--config', rel + '/positive.validation-only.config.json', '--candidates', rel + '/positive-evidence.candidates.json', '--write'],
    'positive-author-check': tsx + ['app/scripts/positiveGoalEvidenceReview.ts', '--config=' + rel + '/positive.validation-only.config.json', '--mode=check'],
    'atomicity-full-check': tsx + ['app/scripts/semanticAtomicityReview.ts', '--config=' + rel + '/full-atomicity.candidate.config.json', '--mode=check'],
    'memory-full-check': tsx + ['app/scripts/memoryCardReview.ts', '--config=' + rel + '/full-memory.candidate.config.json', '--mode=check'],
    'd-two-prepare': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', '--config=' + rel + '/batch.config.json', '--mode=prepare'],
    'd-two-prepare-corrected-cli': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'prepare', '--config', rel + '/batch.config.json'],
    'd-two-check': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'check', '--config', rel + '/batch.config.json'],
    'd-three-current-context-prepare': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'prepare', '--config', rel + '/batch.config.json'],
    'd-three-current-context-check': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'check', '--config', rel + '/batch.config.json'],
    'd-three-prerequisite-order-prepare': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'prepare', '--config', rel + '/batch.config.json'],
    'd-three-prerequisite-order-check': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'check', '--config', rel + '/batch.config.json'],
    'd-three-final-physical-prepare': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'prepare', '--config', rel + '/batch.config.json'],
    'd-three-final-physical-check': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'check', '--config', rel + '/batch.config.json'],
    'native-original-sources': tsx + [rel + '/compile-current-original-sources.mts'],
    'native-original-sources-corrected-export-field': tsx + [rel + '/compile-current-original-sources.mts'],
    'native-final-D3-original-sources': tsx + [rel + '/compile-current-original-sources.mts'],
    'native-final-D3-original-sources-after-preparation': tsx + [rel + '/compile-current-original-sources.mts'],
    'native-final-D3-physical-original-sources': tsx + [rel + '/compile-current-original-sources.mts'],
    'native-views-and-context': tsx + [rel + '/check-native-views-and-context.mts'],
    'qa-author-normalization': tsx + ['app/scripts/generateGoalVisualizationQaLedgers.ts', '--subject=biologie'],
    'qa-author-freshness-check': tsx + ['app/scripts/generateGoalVisualizationQaLedgers.ts', '--subject=biologie', '--check'],
    'future-bio-protection': tsx + ['app/scripts/reportDeepUnderstandingRollout.ts', '--config=' + rel + '/future-protection-biology-only.config.json', '--mode=check', '--format=json'],
    'future-bio-protection-after-native-qa-normalization': tsx + ['app/scripts/reportDeepUnderstandingRollout.ts', '--config=' + rel + '/future-protection-biology-only.config.json', '--mode=check', '--format=json'],
}
assert step in commands, step
receipt_path = own / (step + '.actual.receipt.json')
assert not receipt_path.exists(), 'Do not overwrite captured terminal evidence'
t = time.monotonic()
p = subprocess.run(commands[step], cwd=iso, capture_output=True)
(own / (step + '.stdout.txt')).write_bytes(p.stdout)
(own / (step + '.stderr.txt')).write_bytes(p.stderr)
receipt = {'recordedAtUTC': datetime.now(timezone.utc).isoformat(), 'argv': commands[step],
           'cwd': str(iso), 'exitCode': p.returncode, 'elapsedSeconds': time.monotonic() - t,
           'stdoutPath': rel + '/' + step + '.stdout.txt', 'stderrPath': rel + '/' + step + '.stderr.txt',
           'humanApproval': False, 'activeWrites': 0}
receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'step': step, 'exitCode': p.returncode, 'elapsedSeconds': receipt['elapsedSeconds']}))
if p.returncode:
    print(p.stderr.decode()[-3000:])
    print(p.stdout.decode()[-3000:])
sys.exit(p.returncode)
