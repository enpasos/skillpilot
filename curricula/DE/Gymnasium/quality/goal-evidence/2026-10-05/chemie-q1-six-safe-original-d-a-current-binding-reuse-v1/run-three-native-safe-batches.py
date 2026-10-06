# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime
import hashlib
import json
import shutil
import subprocess

R = Path.cwd()
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05')
OWN = BASE / 'chemie-q1-six-safe-original-d-a-current-binding-reuse-v1'
TECH = BASE / 'chemie-q1-two-new-four-current-independent-d-a-v1/native-current-d10-round-a'
AUTHOR = BASE / 'chemie-q1-quantitative-atomic-split-current-author-candidate-v1'
ISO = R / 'tmp/chemie-q1-quantitative-atomic-split-native-isolated-20261005-v1'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
for source in (R / OWN / 'results').iterdir():
    target = ISO / OWN / 'results' / source.name
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and sha(source) != sha(target): raise ValueError('Existing own result differs: ' + str(target))
    if not target.exists(): shutil.copyfile(source, target)
for row in json.loads((R / TECH / 'technical-current-d10-inputs.final.freeze.json').read_text())['files']:
    rel = Path(row['path'])
    target = ISO / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and sha(R / rel) != sha(target): raise ValueError('Existing technical input differs: ' + str(target))
    if not target.exists(): shutil.copyfile(R / rel, target)

campaign = json.loads((R / TECH / 'description-review-campaign.json').read_text())
receipts = []
for batch in campaign['batches'][1:4]:
    bid = batch['batchId']
    stem = 'native-safe-batch-' + str(batch['ordinal']).zfill(3)
    args = ['npm', '--prefix', 'app', 'run', 'validate:goal-description-review', '--',
        '--bundle', str(ISO / AUTHOR / 'native-finalbook/bundle/manifest.json'),
        '--input', str(ISO / TECH / 'description-review-input.json'),
        '--campaign', str(ISO / TECH / 'description-review-campaign.json'),
        '--run', str(ISO / OWN / 'results' / (bid + '.run.json')),
        '--batch-input', str(ISO / TECH / 'batches' / (bid + '.input.jsonl')),
        '--records', str(ISO / OWN / 'results' / (bid + '.records.jsonl'))]
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    p = subprocess.run(args, cwd=ISO, capture_output=True, text=True)
    finished = datetime.datetime.now(datetime.timezone.utc).isoformat()
    stdout = R / OWN / (stem + '.stdout.txt')
    stderr = R / OWN / (stem + '.stderr.txt')
    stdout.write_text(p.stdout)
    stderr.write_text(p.stderr)
    receipt = {'argv': args, 'cwd': str(ISO), 'startedAtUTC': started, 'completedAtUTC': finished, 'exitCode': p.returncode, 'batchId': bid, 'exactBatchGoalIds': batch['goalIds'], 'goalCount': 2, 'stdoutPath': str(stdout.relative_to(R)), 'stdoutSHA256': sha(stdout), 'stderrPath': str(stderr.relative_to(R)), 'stderrSHA256': sha(stderr), 'nativeValidatorScriptSHA256': sha(ISO / 'app/scripts/validateGoalDescriptionReviewCampaign.ts'), 'nativeRecordSchemaSHA256': sha(ISO / 'contracts/goal-description-review/v1/goal-description-review-record.schema.json'), 'resultCopyExact': all(sha(R / OWN / 'results' / (bid + suffix)) == sha(ISO / OWN / 'results' / (bid + suffix)) for suffix in ['.run.json', '.records.jsonl']), 'scope': 'Only this original independent reviewer six unchanged scientific records with targeted current binding reuse; exact two-goal batch; no four-other-goal review and no full campaign completion claim', 'newScientificReviews': 0, 'historicalBytesChanged': False, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False}
    (R / OWN / (stem + '.actual.receipt.json')).write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    receipts.append(receipt)
    print(json.dumps({'batchOrdinal': batch['ordinal'], 'exitCode': p.returncode, 'stdout': p.stdout, 'stderr': p.stderr}, ensure_ascii=False))
    if p.returncode: raise SystemExit(p.returncode)
(R / OWN / 'three-exact-native-two-goal-batches.actual-summary.json').write_text(json.dumps({'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'batches': receipts, 'actualNativeValidatedRecords': 6, 'allThreeBatchExitCodes': [i['exitCode'] for i in receipts], 'fullD10CampaignStillRequiresOtherFourIndependentRecords': True, 'newScienceClosures': 0, 'activeNetGain': 0}, ensure_ascii=False, indent=2) + '\n')
