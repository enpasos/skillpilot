# SPDX-License-Identifier: Apache-2.0
"""Retain the concrete failed input and change only technical P identifiers."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import shutil

repo = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
own = Path(__file__).resolve().parents[1]
host = repo / 'tmp/chemie-m7-resumed-20261015/equilibrium-P2-A2-rezeptfrei-M1-V1-reference-host-v1'
history = own / 'checks/P2-technical-ID-failed-inputs'
history.mkdir()


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(repo).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def write(p, d):
    temporary = p.with_name(p.name + '.partial')
    temporary.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, p)


records_path = own / 'normal/P2.current-image-bound.E1G1.ai-candidates.jsonl'
config_path = own / 'config/P2.current-image-bound.config.json'
run_path = own / 'normal/P2.actual-informed.run.json'
binding_path = own / 'BINDING.informed-P2-A2-M1-V1.actual.json'
archived = []
for p in [records_path, config_path, run_path, binding_path]:
    before = ref(p)
    target = history / p.name
    shutil.copyfile(p, target)
    archived.append({'originalPathAtFailure': before['path'], 'originalDigest': before['sha256'],
                     'exactPreservedFailedInput': ref(target)})
records = [json.loads(l) for l in records_path.read_text().splitlines()]
new_id = records[0]['reviewId'].lower()
new_run_id = records[0]['reviewRunIds'][0].lower()
for r in records:
    r['reviewId'] = new_id
    r['reviewRunIds'] = [new_run_id]
records_path.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))
config = json.loads(config_path.read_text())
config['reviewId'] = new_id
write(config_path, config)
run = json.loads(run_path.read_text())
run['runId'] = new_run_id
run['independenceGroupId'] = run['independenceGroupId'].lower()
run['completedAt'] = datetime.now(timezone.utc).isoformat()
run['outputDigest'] = ref(records_path)['sha256']
write(run_path, run)
for p in [records_path, config_path, run_path]:
    shutil.copyfile(p, host / p.relative_to(repo))
binding = json.loads(binding_path.read_text())
binding['P2Records'] = ref(records_path)
binding['technicalIdentifierCorrectionAtUTC'] = datetime.now(timezone.utc).isoformat()
binding['technicalCorrectionOnly'] = 'Lowercase review/run identifiers required by closed schema; no profile, goal, science, resource or fingerprint change.'
write(binding_path, binding)
old_records = [json.loads(l) for l in (history / records_path.name).read_text().splitlines()]
for a, b in zip(old_records, records):
    assert {k: v for k, v in a.items() if k not in ['reviewId', 'reviewRunIds']} == {k: v for k, v in b.items() if k not in ['reviewId', 'reviewRunIds']}
write(own / 'checks/CAS.P2.technical-ID-only-correction.actual.json', {
    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'concreteFailure': 'reviewId must match lowercase slug pattern; no scientific error',
    'failedInputHistory': archived, 'allProfilesScienceAndFingerprintsExact': True,
    'FIRSTsUnchanged': True, 'reviewIdAfter': new_id, 'runIdAfter': new_run_id,
    'currentRecords': ref(records_path), 'currentConfig': ref(config_path), 'currentRun': ref(run_path),
    'priorFailedCheckPreserved': ref(own / 'checks/P2.stock-check.command.actual.json'),
})
print('Preserved failed P2 inputs; corrected only technical review/run identifiers.')
