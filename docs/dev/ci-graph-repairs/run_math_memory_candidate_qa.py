#!/usr/bin/env python3
"""Run the unchanged native deep-QA producer with two read-only candidate overlays."""
import errno
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'tmp/math-memory-candidate-5cb-qa'
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
LEDGER = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
CANDIDATE = ROOT / 'tmp/math-memory-pilot-5cb-current-candidate.json'
DRAFT = ROOT / 'tmp/math-memory-pilot-5cb-current-ledger-DRAFT.json'


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    assert digest(ROOT / SOURCE) == 'e0ff0cafccf0f638c4cb36d5a252480ccc7062750619ef0452a447775bf96fe1'
    assert digest(CANDIDATE) == 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6'
    impact = json.loads((ROOT / 'tmp/math-memory-pilot-5cb-kind-impact.json').read_bytes())
    assert digest(DRAFT) == impact['privateLedgerDraft']['sha256']
    assert digest(ROOT / LEDGER) == impact['originalLedger']['sha256']
    OUT.mkdir(exist_ok=True)
    (OUT / 'tmp').mkdir(exist_ok=True)
    code_paths = ['app/scripts/goalBookModel.ts', 'app/scripts/reportDeepUnderstandingRollout.ts',
                  'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/positiveGoalEvidenceReview.ts',
                  'app/scripts/semanticAtomicityReview.ts', 'app/scripts/memoryCardReview.ts',
                  'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json',
                  'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json']
    code = [{'path': path, 'sha256': digest(ROOT / path)} for path in code_paths]
    before = {str(path.relative_to(ROOT)): digest(path) for path in (ROOT / 'curricula/DE/Gymnasium/canonical').glob('*.de.json')}
    assert len(before) == 21
    prefix = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/',
              '--dev-bind', '/dev', '/dev', '--proc', '/proc',
              '--ro-bind', str(CANDIDATE), str(ROOT / SOURCE),
              '--ro-bind', str(DRAFT), str(ROOT / LEDGER),
              '--bind', str(OUT), str(OUT), '--setenv', 'TMPDIR', str(OUT / 'tmp'),
              '--setenv', 'TSX_DISABLE_CACHE', '1', '--chdir', str(ROOT / 'app'), '--']
    preflight = '''import errno,hashlib,json,sys
rows=json.loads(sys.argv[1]);result=[]
for path,expected in rows:
 assert hashlib.sha256(open(path,'rb').read()).hexdigest()==expected
 try:
  open(path,'ab');raise AssertionError('candidate input is writable')
 except OSError as exc:
  assert exc.errno==errno.EROFS
 result.append({'path':path,'actualSha256':expected,'readOnly':True})
print(json.dumps(result))
'''
    probes = [(str(ROOT / SOURCE), digest(CANDIDATE)), (str(ROOT / LEDGER), digest(DRAFT))]
    probe = subprocess.run(prefix + ['python3', '-B', '-c', preflight, json.dumps(probes)],
                           capture_output=True, text=True, check=True)
    (OUT / 'preflight.json').write_text(probe.stdout)
    command = ['node', str(ROOT / 'app/node_modules/tsx/dist/cli.mjs'),
               str(ROOT / 'app/scripts/reportDeepUnderstandingRollout.ts'), '--mode=check', '--format=json']
    (OUT / 'invocation.json').write_text(json.dumps({'command': prefix + command, 'code': code,
                                                   'sourceBefore': before, 'inputs': probes}, indent=2) + '\n')
    with (OUT / 'report.json').open('wb') as out, (OUT / 'stderr.log').open('wb') as err:
        result = subprocess.run(prefix + command, cwd=ROOT / 'app', stdout=out, stderr=err)
    assert {path: digest(ROOT / path) for path in before} == before, 'Host canonical source changed during isolated QA'
    assert all(digest(ROOT / row['path']) == row['sha256'] for row in code), 'QA implementation changed during run'
    assert digest(ROOT / LEDGER) == impact['originalLedger']['sha256']
    receipt = {'purpose': 'isolated-current-Math-Memory-candidate-native-deep-QA',
               'exitCode': result.returncode, 'sourceApplied': False, 'kindDraftApprovalClaimed': False,
               'inputs': probes, 'preflightReadOnly': True, 'hostSourcesUnchanged': True,
               'codeUnchanged': True, 'code': code,
               'stdoutSha256': digest(OUT / 'report.json'), 'stderrSha256': digest(OUT / 'stderr.log')}
    if result.returncode == 0:
        report = json.loads((OUT / 'report.json').read_bytes())
        receipt['blockingIssueCount'] = report['blockingIssueCount']
        receipt['subjects'] = [{key: row[key] for key in ('subject', 'denominator', 'strictComplete', 'remaining', 'strictCompletionReady')}
                               for row in report['subjects']]
        assert report['blockingIssueCount'] == 0
        assert len(report['subjects']) == 5
        assert all(row['strictCompletionReady'] for row in report['subjects'])
    (OUT / 'result.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt))
    raise SystemExit(result.returncode)


if __name__ == '__main__':
    main()
