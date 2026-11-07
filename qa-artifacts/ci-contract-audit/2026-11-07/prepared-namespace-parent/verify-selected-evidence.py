#!/usr/bin/env python3
"""Check a small historical mechanics archive, never mint QA authority."""
import argparse
import ast
import hashlib
import io
import json
import lzma
from pathlib import Path
import tarfile

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[3]


class EvidenceArchive:
    def __init__(self):
        self.index=json.loads((BASE/'payload-index.json').read_bytes())
        path=ROOT/self.index['archive']
        assert path.parent==BASE
        raw=path.read_bytes()
        assert len(raw)==self.index['archiveBytes'] and hashlib.sha256(raw).hexdigest()==self.index['archiveSha256']
        tar=lzma.decompress(raw)
        assert len(tar)==self.index['tarRawBytes'] and hashlib.sha256(tar).hexdigest()==self.index['tarRawSha256']
        self.archive=tarfile.open(fileobj=io.BytesIO(tar),mode='r:')
        members=self.archive.getmembers()
        assert all(m.isfile() and m.name.startswith('sha256/') and len(m.name)==71 for m in members)
        assert len(members)==self.index['uniqueBlobs']==len({m.name for m in members})
        self.files={}
        for row in self.index['files']:
            logical=row['logicalPath']
            assert not Path(logical).is_absolute() and all(p not in ('.','..') for p in Path(logical).parts)
            assert logical not in self.files and row['archiveMember']=='sha256/'+row['sha256']
            raw=self.archive.extractfile(row['archiveMember']).read()
            assert len(raw)==row['bytes'] and hashlib.sha256(raw).hexdigest()==row['sha256']
            self.files[logical]=raw
            if logical.endswith('.py'):ast.parse(raw)
        assert len(self.files)==self.index['fileCount']
        assert {row['archiveMember'] for row in self.index['files']}=={m.name for m in members}

    def json(self,name):return json.loads(self.files[name])


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-current-code',action='store_true')
    args=parser.parse_args();evidence=EvidenceArchive();tests=native=0
    for suite in ('namespace-parent','prepared-namespace','lifecycle','node-vm','tool-tree','trace','launcher','recorder'):
        prefix='final-tests/'+suite+'/'
        execution=evidence.json(prefix+'execution.json')
        result_name=prefix+'native-cases/'+('native-runs.json' if suite in ('launcher','trace') else 'results.json')
        result=evidence.json(result_name)
        assert execution['exitCode']==result['errors']==result['failures']==result['skips']==0
        tests+=result['testsRun'];native+=len(result.get('actualNativeRuns',[]))
    assert (tests,native)==(49,67)
    ts=evidence.json('final-layout-ts/results.json')
    assert {r['role'] for r in ts['runs']}=={'original','candidate'} and len(ts['runs'])==2
    for run in ts['runs']:
        assert run['producerExitCode']==0 and run['authentication']['status']=='blocked'
        assert len(run['parentAbsenceFacts'])==1 and not run['sourceAQaValidityClaimed']
        fact=run['parentAbsenceFacts'][0]
        assert not fact['payloadReadAuthorized'] and not fact['sourceInput']
        assert fact['operation']=='statx' and fact['errno']=='ENOENT'
        assert run['authentication']['firstFinding'].endswith(str(Path(fact['root']).parent/'node_modules'))
    pins=evidence.json('final-tests/code-pins.json')
    for row in pins:
        assert hashlib.sha256(evidence.files['final-tests/frozen-code/'+Path(row['path']).name]).hexdigest()==row['sha256']
        if args.check_current_code:assert hashlib.sha256((ROOT/row['path']).read_bytes()).hexdigest()==row['sha256']
    assert sorted(p.name for p in (ROOT/'scripts').glob('test_*identity_qa*py'))==[
        'test_identity_qa_private_capture.py','test_prepare_identity_qa_candidate.py']
    print(json.dumps({'purpose':'selected-historical-mechanics-evidence-verification-not-QA-acceptance',
        'logicalFiles':len(evidence.files),'uniqueBlobs':evidence.index['uniqueBlobs'],
        'tests':tests,'actualNativeRuns':native,'tsProducerExits':[r['producerExitCode'] for r in ts['runs']],
        'fullReadAuthenticationPassed':False,'currentCodeChecked':args.check_current_code,
        'sourceAQaValidityClaimed':False},indent=2))


if __name__=='__main__':main()
