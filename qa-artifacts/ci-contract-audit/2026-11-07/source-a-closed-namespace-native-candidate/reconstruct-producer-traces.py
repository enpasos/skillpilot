#!/usr/bin/env python3
"""Losslessly reconstruct the selected trace from the complete exact recorder."""
import pathlib,sys,json,gzip,hashlib,argparse
sys.dont_write_bytecode=True;B=pathlib.Path(__file__).parent;sys.path.insert(0,str(B/'implementation/existing-engine'));from identity_qa_read_launcher import _producer_trace
p=argparse.ArgumentParser();p.add_argument('--output',type=pathlib.Path,required=True);a=p.parse_args();assert a.output.is_absolute()and a.output.is_relative_to('/dev/shm');a.output.mkdir(parents=True,exist_ok=True)
for label in ['original-writer','original-reader','candidate-writer','candidate-reader']:
 e=B/'runs'/label;r=json.loads((e/'launch-receipt.json').read_text());raw=gzip.decompress((e/'recorder.strace.gz').read_bytes());assert hashlib.sha256(raw).hexdigest()==r['recorderTraceSha256'];cmd=r['command'];sandbox=tuple(cmd[cmd.index('/usr/bin/bwrap'):]);argv=tuple(r['argv']);trace,_,_,_=_producer_trace(raw.decode(),sandbox,argv,bootstrap_argv=('/qa/toolchain/bin/start-gate',*argv));assert hashlib.sha256(trace.encode()).hexdigest()==r['traceSha256'];target=a.output/(label+'.producer.strace');assert not target.exists();target.write_text(trace);print(label,r['traceSha256'])
