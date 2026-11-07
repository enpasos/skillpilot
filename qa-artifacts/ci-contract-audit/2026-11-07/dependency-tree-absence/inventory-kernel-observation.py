#!/usr/bin/env python3
"""Replay recorded metadata only. Does not create a launch/QA capability."""
import argparse
import hashlib
import json
from pathlib import Path
import sys
from urllib.parse import urlparse,unquote

parser=argparse.ArgumentParser()
parser.add_argument('--repo-root',type=Path,required=True)
parser.add_argument('--evidence-root',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args();sys.dont_write_bytecode=True
sys.path.insert(0,str(args.repo_root/'scripts'))
from identity_qa_read_trace import calls,c_string,traced_pid,number,arguments

capture=json.loads((args.evidence_root/'capture-receipt.json').read_text())
entries={r['path']:r for r in capture['entries']}
rows=[]
for role in ('original','candidate'):
    directory=args.evidence_root/role
    launch=json.loads((directory/'launch.json').read_text())
    trace=(directory/'producer.strace').read_text()
    if hashlib.sha256(trace.encode()).hexdigest()!=launch['traceSha256']:raise ValueError('Recorded producer trace hash differs')
    recorder=(directory/'controller/interpreted-recorder.strace').read_bytes()
    if hashlib.sha256(recorder).hexdigest()!=launch['recorderTraceSha256']:raise ValueError('Recorded interpreted snapshot hash differs')
    events=calls(trace);executable={};groups={launch['producerBoundary']['hostPid']:launch['producerBoundary']['hostPid']}
    for event in events:
        start,end,pid,operation,fields,result=event
        if operation in ('clone','clone3','fork','vfork') and not result.startswith('-1 '):
            child=traced_pid(result);groups[child]=groups[pid] if 'CLONE_THREAD' in ','.join(fields) else child
            executable[child]=executable.get(pid)
        if operation=='execve' and number(result)==0:
            executable[pid]=(c_string(fields[0]),tuple(c_string(token) for token in arguments(fields[1][1:-1])))
        if operation not in ('open','openat') or c_string(fields[0 if operation=='open' else 1])!='/proc/sys/vm/overcommit_memory':continue
        exe,argv=executable[pid];context=launch['toolKernelContext']
        if exe!=context['producerExecutable']:raise ValueError('A different child executable needs a different explicit tool binding')
        capture_arguments=[]
        for token in argv:
            if token.startswith('file://'):
                uri=urlparse(token)
                if uri.netloc:raise ValueError('Unexpected nonlocal file URI')
                token=unquote(uri.path)
            path=Path(token)
            if path.is_absolute() and path.is_relative_to(capture['root']):
                relative=path.relative_to(capture['root']).as_posix()
                item=entries.get(relative)
                if not item or item['kind']!='file':raise ValueError('Invocation argument is not a bound captured file')
                capture_arguments.append(dict(item))
        fd=number(result);following=[]
        for later in events:
            if later[0]>start and later[2]==pid and later[3] in ('read','close') and number(later[4][0])==fd:
                following.append(later)
                if later[3]=='close':break
        if not following or following[-1][3]!='close' or sum(number(e[5]) for e in following if e[3]=='read')!=1:
            raise ValueError('Observed exact one-byte read/close chain differs')
        rows.append({'role':role,'hostPid':pid,'hostThreadGroup':groups[pid],
            'namespaceThreadGroup':launch['namespaceProcessIds'][str(groups[pid])],
            'executable':exe,'executableSha256':context['producerSha256'],
            'executableProvenance':'separately-bound actual Node tool; not contained in dependency capture',
            'actualExecArgv':list(argv),'capturedInvocationFiles':capture_arguments,'captureTreeSha256':capture['treeSha256'],
            'producerTraceSha256':launch['traceSha256'],'recorderSnapshotSha256':launch['recorderTraceSha256'],
            'kernelContext':{key:context[key] for key in ('kernelRelease','kernelMachine','kernelBootId')},
            'observation':{'path':'/proc/sys/vm/overcommit_memory','open':event,'readAndClose':following,
                           'bytesReported':1,'contentSha256':None,'immutableCurriculumInput':False},
            'runtimePermissionGranted':False})
args.output.write_text(json.dumps({'purpose':'recorded-metadata-replay-only-no-capability-or-runtime-permission',
    'observations':rows,'count':len(rows),'newRuntimeRule':False,'sourceAQaValidityClaimed':False},indent=2)+'\n')
print(json.dumps({'observations':len(rows),'path':'/proc/sys/vm/overcommit_memory','permissionGranted':False}))
