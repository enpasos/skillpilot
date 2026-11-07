import pathlib,sys,json,time,traceback,os
W=pathlib.Path(__file__).parent;sys.path.insert(0,str(W));from closed_namespace import CapturedView,run,write_json,fs_sha,validate_output_inode
from trace_contract import NamespaceContract,runtime_for
from identity_qa_read_trace import authenticate_trace
v=CapturedView();results=[];write_json(W/'execution-code-pins.json',{'files':[{'path':str(p.relative_to(W)),'sha256':fs_sha(p)}for p in sorted([W/'closed_namespace.py',W/'trace_contract.py',W/'positive_suite.py',W/'negative_suite.py',W/'start_gate.c',W/'start_gate',*list((W/'code').glob('*.py'))])]})
for role in ['original','candidate']:
 sealed=None
 for mode in ['writer','reader']:
  print('START',role,mode,time.time(),flush=True);launch=run(v,role,entry='namespace-producer.ts'if mode=='writer'else'namespace-reader.ts',reader_outputs=sealed)
  try:
   print('NATIVE-TERMINAL',role,mode,launch.returncode,flush=True);c=NamespaceContract(launch);facts=authenticate_trace(launch.trace,launch.cwd,c,launch,runtime_for(launch));facts['currentRunIpcFacts']=c.ipc_facts;write_json(launch.evidence_directory/'authenticated.json',facts);write_json(launch.evidence_directory/'launch-receipt.json',launch.receipt());r={'role':role,'mode':mode,'exitCode':launch.returncode,'authenticated':True,'runId':launch.namespace.run_id,'evidence':str(launch.evidence_directory),'processes':facts['processCount'],'sourceReadCount':len(facts['actualSourceReadOrMapPaths']),'failures':len(facts['explicitToolProbeFailures']),'traceSha256':launch.trace_sha256,'output':dict(c.sealed_outputs.slots)if mode=='writer'else dict(sealed.slots)};results.append(r);print(json.dumps(r),flush=True)
   if mode=='writer':
    sealed=c.sealed_outputs
    try:sealed.verify(role,type('ForeignFrame',(),{'snapshot':'0'*64})())
    except ValueError as ex:r['staleSourceFrameDenied']=str(ex)
    else:raise RuntimeError('Foreign frame was accepted')
    try:validate_output_inode(v,W/'pair'/('original80'if role=='original'else'projectedA80')/'curricula/native-namespace-fixture/values.csv')
    except ValueError as ex:r['sourceAsOutputDenied']=str(ex)
    else:raise RuntimeError('Source inode accepted as output')
    alias=launch.namespace.scratch/'output-alias';os.link(next(iter(sealed.slots.values()))['physical'],alias)
    try:
     try:sealed.verify(role,v)
     except ValueError as ex:r['outputRwAliasDenied']=str(ex)
     else:raise RuntimeError('Output RW alias accepted')
    finally:alias.unlink()

  finally:launch.namespace.release()
  write_json(W/'positive-results.json',{'results':results,'terminal':len(results)==4})
print('ALL-TERMINAL',flush=True)
