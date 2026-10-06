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
 'baseline-full-model': tsx + ['app/scripts/buildGoalBookModel.ts',rel+'/baseline-book.config.json'],
 'source-atlas-materialization': tsx + ['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',meta['atlasPath']],
 'source-atlas-check': tsx + ['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',meta['atlasPath'],'--check'],
 'future-full-model': tsx + ['app/scripts/buildGoalBookModel.ts',rel+'/book.config.json'],
 'atomicity-seven-existing-check': tsx + ['app/scripts/semanticAtomicityReview.ts','--config='+rel+'/atomicity.seven-existing.config.json','--mode=check'],
 'memory-seven-plus-traced-node-check': tsx + ['app/scripts/memoryCardReview.ts','--config='+rel+'/memory.seven-plus-traced-node.config.json','--mode=check'],
 'memory-shared-origin-closure-check': tsx + ['app/scripts/memoryCardReview.ts','--config='+rel+'/memory.shared-origin-closure.config.json','--mode=check'],
 'memory-seven-existing-check': tsx + ['app/scripts/memoryCardReview.ts','--config='+rel+'/memory.seven-existing.config.json','--mode=check'],
 'atomicity-full-existing-check': tsx + ['app/scripts/semanticAtomicityReview.ts','--config='+rel+'/full-atomicity.existing.config.json','--mode=check'],
 'memory-full-existing-check': tsx + ['app/scripts/memoryCardReview.ts','--config='+rel+'/full-memory.existing.config.json','--mode=check'],
 'positive-author-materialization': tsx + ['app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',rel+'/positive.validation-only.config.json','--candidates',rel+'/positive-evidence.candidates.json','--write'],
 'positive-author-check': tsx + ['app/scripts/positiveGoalEvidenceReview.ts','--config='+rel+'/positive.validation-only.config.json','--mode=check'],
 'd-seven-prepare': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',rel+'/batch.config.json'],
 'd-seven-check': tsx + ['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',rel+'/batch.config.json'],
 'original-sources': tsx + [rel+'/compile-original-sources.mts'],
 'views-and-context': tsx + [rel+'/check-views-and-context.mts'],
 'current-protection': tsx + ['app/scripts/reportDeepUnderstandingRollout.ts','--config='+rel+'/future-protection-biology-only.config.json','--mode=check','--format=json'],
 'qa-current-check': tsx + ['app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=biologie','--check'],
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
