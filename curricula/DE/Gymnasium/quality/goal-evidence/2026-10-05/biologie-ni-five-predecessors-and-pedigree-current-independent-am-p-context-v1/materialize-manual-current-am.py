#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind already recorded manual A5/M5 science through existing native tools."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess

ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
# The author P-only isolate has no A/M CLI code. Both existing A/M tools accept
# the explicit inactive landscape, so execute their current repository copies.
ISO = ROOT
REL = str(OWN.relative_to(ROOT))
AUTHOR = OWN.parent / 'biologie-ni-ten-current-native-author-candidate-v2'
CAN = str((AUTHOR / 'canonical.biologie.current.inactive.snapshot.json').relative_to(ROOT))
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manual = read(OWN / 'manual-current-scientific-decisions.input.json')
goals = read(ROOT / CAN)['goals']
rows = manual['ordinaryDecisions']
assert len(rows) == 5 and all(r['atomicity'] == 'atomic' and r['memory'] == 'no_memory_needed' for r in rows)
ids = [r['goalId'] for r in rows]
selected = [next(g for g in goals if g['id'] == gid) for gid in ids]
now = datetime.now(timezone.utc).isoformat()
scienceguard = sha(OWN / 'manual-current-scientific-decisions.input.json')
receipts = []
for kind, rule, script in [('atomicity', 'semantic-atomicity-v1', 'semanticAtomicityReview.ts'),
                            ('memory', 'memory-card-review-v1', 'memoryCardReview.ts')]:
    reviewid = f'biologie-ni-five-current-root-independent-{kind}-20261005-v1'
    reviewpath = OWN / f'{kind}.five.current.review.jsonl'
    config = {'schemaVersion': 1, 'landscapeId': '08a43a1b-d97e-522c-9dfa-c950a493364e',
              'landscapePath': CAN, 'scope': {'label': 'Five manually independently reviewed current NI predecessor goals', 'leafGoalIds': ids},
              'reviewId': reviewid, 'ruleVersion': rule, 'reviewPath': str(reviewpath.relative_to(ROOT))}
    records = []
    for row in rows:
        record = {'schemaVersion': 1, 'reviewId': reviewid, 'ruleVersion': rule,
                  'landscapeId': config['landscapeId'], 'goalId': row['goalId'],
                  'fingerprint': 'pending_native_binding_after_completed_manual_science',
                  'reviewedAt': now, 'reviewer': manual['reviewer']}
        if kind == 'atomicity':
            record.update(status=row['atomicity'], semanticAtomic=True, reason=row['atomicityReason'])
        else:
            record.update(status=row['memory'], memoryUseful=False, memoryGoalIds=[], deckIds=[], reason=row['memoryReason'])
        records.append(record)
    reviewpath.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))
    if kind == 'memory':
        cardpath = OWN / 'memory.five.current.cards.review.jsonl'
        cardpath.write_text('')
        config['cardReviewPath'] = str(cardpath.relative_to(ROOT))
        config['reportPath'] = f'{REL}/memory.five.current.native.report.md'
    cp = OWN / f'{kind}.five.current.config.json'
    cp.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n')
    for label, extra in [('bind-manual-records', ['--write-fingerprints']), ('check-current', ['--mode=check'])]:
        command = ['app/node_modules/.bin/tsx', f'app/scripts/{script}', '--config=' + str(cp.relative_to(ROOT)), *extra]
        started = datetime.now(timezone.utc).isoformat()
        proc = subprocess.run(command, cwd=ISO, capture_output=True)
        streams = {}
        for stream, data in [('stdout', proc.stdout), ('stderr', proc.stderr)]:
            p = OWN / f'{kind}-{label}.{stream}.txt'
            p.write_bytes(data)
            streams[stream + 'Path'] = str(p.relative_to(ROOT))
            streams[stream + 'SHA256'] = sha(p)
        receipts.append({'command': command, 'cwd': str(ISO), 'startedAtUTC': started,
                         'completedAtUTC': datetime.now(timezone.utc).isoformat(),
                         'actualExitCode': proc.returncode, **streams})
        (OWN / 'native-current-manual-am.actual.receipt.json').write_text(json.dumps({
            'commands': receipts, 'manualScienceSHA256BeforeNative': scienceguard,
            'fingerprintsAreTechnicalBindingsNotScientificVerdicts': True,
            'humanApproval': False, 'humanTrial': False, 'activeWrites': 0}, ensure_ascii=False, indent=2) + '\n')
        print(kind, label, 'Exit', proc.returncode, flush=True)
        assert proc.returncode == 0, proc.stderr.decode()
    assert sha(OWN / 'manual-current-scientific-decisions.input.json') == scienceguard
(OWN / 'exact-reviewed-five-whole-author-goals.input.snapshot.json').write_text(
    json.dumps({'goalRecords': selected, 'samePublishedInputScopeAsFrozenD23': True,
                'nativeCanonicalPath': CAN, 'noHumanApprovalClaim': True}, ensure_ascii=False, indent=2) + '\n')
