import os,pathlib,sys,json,hashlib,copy,uuid,stat,time
from types import SimpleNamespace
W=pathlib.Path(__file__).parent;sys.path.insert(0,str(W));from closed_namespace import CapturedView,run,SealedOutputs,write_json,P,fs_sha,sha
from trace_contract import NamespaceContract,runtime_for
from identity_qa_read_trace import authenticate_trace,calls,Process,RuntimeObservationContract
from identity_qa_read_launcher import require_actual_launch
from identity_qa_tool_tree import negative_metadata_locator
results=[]
def reject(case,kind,fn):
 try:fn()
 except (ValueError,TypeError,AssertionError,KeyError)as e:r={'case':case,'kind':kind,'denied':True,'errorType':type(e).__name__,'error':str(e)};results.append(r);print(json.dumps(r),flush=True);write_json(W/'negative-results.json',{'terminal':False,'results':results});return
 raise RuntimeError('NEGATIVE WAS ACCEPTED '+case)
def reset_file_guard(v,p):
 s=p.stat();old=v.guard[str(p)];assert fs_sha(p)==old[-1];v.guard[str(p)]=(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_ctime_ns,old[-1])
def reset_dir_guard(v,p):
 if str(p)in v.dirguard:
  s=p.lstat();v.dirguard[str(p)]=(s.st_dev,s.st_ino,s.st_mode,s.st_mtime_ns,s.st_ctime_ns)
def change_file(v,p,new,case):
 raw=p.read_bytes();mode=p.stat().st_mode;os.chmod(p,0o600);p.write_bytes(new)
 try:reject(case,'actual-private-file-mutation-prelaunch',v.verify)
 finally:p.write_bytes(raw);os.chmod(p,stat.S_IMODE(mode));reset_file_guard(v,p)
def changed_member(v,parent,name,case):
 p=parent/name;p.write_bytes(b'actual undeclared member')
 try:reject(case,'actual-private-directory-membership-mutation-prelaunch',v.verify)
 finally:p.unlink();reset_dir_guard(v,parent)
v=CapturedView();csv=W/'pair/original80/curricula/native-namespace-fixture/values.csv';change_file(v,csv,b'','N03-empty-source-stub');change_file(v,csv,b'wrong bytes','N03-wrong-source-bytes');changed_member(v,csv.parent,'undeclared-source.json','N03-extra-directory-member')
alias=W/'pair/original80/curricula/native-asset-alias';target=os.readlink(alias);alias.unlink();alias.symlink_to('/etc/passwd')
try:reject('N04-authored-alias-swap-external','actual-private-alias-mutation-prelaunch',v.verify)
finally:alias.unlink();alias.symlink_to(target);reset_dir_guard(v,alias.parent)
foreign=pathlib.Path('/dev/shm')/('outside-closed-capture-'+uuid.uuid4().hex);os.link(csv,foreign)
try:reject('N04-private-source-inode-external-hardlink','actual-inode-alias-mutation-prelaunch',v.verify)
finally:foreign.unlink();reset_file_guard(v,csv)
lib=pathlib.Path(next(e['physical']for e in v.tool['entries']if e['kind']=='file'and e['visible'].endswith('/libc.so.6')));change_file(v,lib,lib.read_bytes()[:-1]+b'X','N07-wrong-required-library-hash')
conf=pathlib.Path(next(e['physical']for e in v.tool['entries']if e['visible']=='/etc/ld.so.conf'));change_file(v,conf,b'/foreign/host/libs\n','N07-foreign-loader-config')
for inject,case in [('writable-source','N04-actual-source-RO-to-RW-overlay'),('extra-root-member','N04-actual-root-extra-member'),('prefilled-home','N10-actual-prefilled-HOME')]:reject(case,'actual-native-namespace-barrier-mutation',lambda inject=inject:run(v,'original',inject=inject))
reject('N05-unlisted-entry-import-anchor','actual-factory-prelaunch-command-manifest',lambda:run(v,'original',entry='foreign.ts'))
reject('N09-forged-stale-output-JSON','actual-output-factory-token-rejection',lambda:SealedOutputs(object(),'original','old-run',{'report':{'sha256':'0'*64}},'0'*64))
# One genuine fresh native writer supplies actual launch/FD/lookup/output observations for strict mutations.
launch=run(v,'original');c=NamespaceContract(launch)
try:
 facts=authenticate_trace(launch.trace,launch.cwd,c,launch,runtime_for(launch));write_json(launch.evidence_directory/'authenticated.json',facts);write_json(launch.evidence_directory/'launch-receipt.json',launch.receipt());sealed=c.sealed_outputs;events=calls(launch.trace);negative=next(e for e in events if e[3]=='access'and e[5].startswith('-1 ENOENT ')and'/QA/'in e[4][0]);pid=negative[2];proc=Process([launch.cwd],{},pid,P(v.node));path=P(c.case_probe)
 reject('N05-old-role-trace','genuine-launch-context-countercase',lambda:require_actual_launch(launch,launch.trace,launch.cwd,launch.root,'candidate'))
 reject('N05-wrong-cwd','genuine-launch-context-countercase',lambda:require_actual_launch(launch,launch.trace,launch.root,launch.root,launch.role))
 reject('N05-modified-trace-surviving-child','actual-launch-byte-binding-countercase-not-native-rerun',lambda:require_actual_launch(launch,'\n'.join(launch.trace.splitlines()[:-1])+'\n',launch.cwd,launch.root,launch.role))
 def mutated_event(**kw):
  row=list(negative)
  for k,val in kw.items():row[{'args':4,'result':5,'op':3}[k]]=val
  return tuple(row)
 reject('N06-EACCES','synthetic-mutation-of-actual-native-negative-event',lambda:c.prove_negative_lookup(mutated_event(result='-1 EACCES (Permission denied)'),path,proc))
 reject('N06-W_OK','synthetic-mutation-of-actual-native-negative-event',lambda:c.prove_negative_lookup(mutated_event(args=[negative[4][0],'W_OK']),path,proc))
 required=str(launch.root)+'/curricula/native-namespace-fixture/values.csv';event=(0,0,pid,'openat',['AT_FDCWD<'+str(launch.cwd)+'>',json.dumps(required),'O_RDONLY|O_CLOEXEC'],'-1 ENOENT (No such file or directory)')
 reject('N06-required-source-cannot-be-optional','synthetic-mutation-with-genuinely-bound-required-source',lambda:c.prove_negative_lookup(event,P(required),proc))
 wrong=(0,0,pid,'openat',['AT_FDCWD<'+str(launch.cwd)+'>','"/node_modules/pkg/package.json"','O_WRONLY|O_CREAT, 0600'],'-1 ENOENT (No such file or directory)')
 reject('N06-write-flags-as-absence','synthetic-negative-open-mutation',lambda:c.prove_negative_lookup(wrong,P('/node_modules/pkg/package.json'),proc))
 wrongdir=(0,0,pid,'openat',['77</foreign-parent>','"package.json"','O_RDONLY'],'-1 ENOENT (No such file or directory)')
 reject('N05-wrong-dirfd-locator','synthetic-negative-dirfd-mutation',lambda:negative_metadata_locator(wrongdir,P('/node_modules/package.json'),launch.cwd))
 unexpected=(0,0,pid,'access',['"/not-derived-parent/absent"','F_OK'],'-1 ENOENT (No such file or directory)')
 reject('N06-unexpected-basename-parent','synthetic-negative-family-mutation',lambda:c.prove_negative_lookup(unexpected,P('/not-derived-parent/absent'),proc))
 reject('N09-surviving-writer-state','process-quiescence-countercase',lambda:c.finish_writes({pid:proc},set(),events))
 reject('N09-cross-role-sealed-cache','actual-minted-output-role-countercase',lambda:sealed.verify('candidate'))
 slot=P(next(iter(sealed.slots.values()))['physical']);raw=slot.read_bytes();os.chmod(slot,0o600);slot.write_bytes(b'{"old":true}\n')
 try:reject('N09-old-report-bytes-presented-current','actual-sealed-output-byte-mutation',lambda:sealed.verify('original'))
 finally:slot.write_bytes(raw);os.chmod(slot,0o400)
 untracked=(0,0,pid,'openat',['AT_FDCWD<'+str(launch.cwd)+'>','"/qa/untracked.json"','O_WRONLY|O_CREAT, 0600'],'19</qa/untracked.json>')
 reject('N09-untracked-write-outside-slots','actual-writer-handler-countercase',lambda:c.open_write(P('/qa/untracked.json'),'O_WRONLY|O_CREAT',None,untracked[4],untracked[5],proc,__import__('identity_qa_read_trace').Handle,[],untracked))
 socket=next(e for e in events if e[3]=='connect');sproc=Process([launch.cwd],{},pid,P(v.node));create=next(e for e in events if e[3]=='socket');c.handle_operation(create,sproc,lambda p,t:None);fdtoken=socket[4][0];fdnum=__import__('identity_qa_read_trace').number(create[5]);fdtoken=str(fdnum)+'<'+__import__('identity_qa_read_trace').annotation(create[5])+'>';external=(0,0,pid,'connect',[fdtoken,'{sa_family=AF_UNIX, sun_path="/foreign/ingress.sock"}','110'],'-1 ENOENT (No such file or directory)')
 reject('N10-external-socket-input','synthetic-mutation-of-actual-native-socket-observation',lambda:c.handle_operation(external,sproc,lambda p,t:p.fds[fdnum][0].path))
 scratch=P(launch.tool_context['environment']['TMPDIR'])/'source-transport.csv';m=c.mutable['source-transport.csv'];old=bytes(m['bytes']);m['bytes']=bytearray(b'forged temp source')
 try:reject('N10-temp-source-cannot-be-relabelled-tool','source-linked-current-run-transport-byte-countercase',lambda:c.before_read_open(scratch,proc,None,(0,0,pid,'openat',[],'0')))
 finally:m['bytes']=bytearray(old)
 reject('N10-executable-scratch','namespace-exec-capability-countercase',lambda:c.resolve(scratch,operation='execve'))
 write_json(W/'negative-results.json',{'terminal':False,'results':results,'allDenied':all(r['denied']for r in results),'genuineCountercaseBase':{'runId':launch.namespace.run_id,'evidence':str(launch.evidence_directory),'traceSha256':launch.trace_sha256},'note':'Kinds distinguish actual filesystem/native namespace mutations from synthetic event/launch capability countercases. No synthetic countercase is a new native full run.'});print('ALL-NEGATIVE-TERMINAL',len(results),flush=True)
finally:launch.namespace.release()

foreign=run(v,'original',inject='foreign-argv')
try:
 reject('N05-actual-native-foreign-argv','actual-native-successful-foreign-argv-then-authentication-denied',lambda:authenticate_trace(foreign.trace,foreign.cwd,NamespaceContract(foreign),foreign,runtime_for(foreign)))
finally:foreign.namespace.release()
j=json.loads((W/'negative-results.json').read_text());j['terminal']=True;j['results']=results;j['allDenied']=all(r['denied']for r in results);j['actualForeignArgvRun']={'runId':foreign.namespace.run_id,'evidence':str(foreign.evidence_directory),'exitCode':foreign.returncode,'traceSha256':foreign.trace_sha256};write_json(W/'negative-results.json',j);print('FINAL-ALL-NEGATIVE-TERMINAL',len(results),flush=True)
