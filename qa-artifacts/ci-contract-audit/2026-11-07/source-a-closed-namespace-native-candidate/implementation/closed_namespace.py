# SPDX-License-Identifier: Apache-2.0
"""Closed native mechanics only. No VerifiedSourcePair/OriginalQa/CandidateQa minting."""
import os,sys,json,hashlib,stat,pathlib,posixpath,subprocess,fcntl,select,time,signal,re,uuid
from types import MappingProxyType
from dataclasses import dataclass
P=pathlib.Path; W=P(__file__).parent;sys.path.insert(0,str(W/'code'))
from identity_qa_private_capture import require,verify_private_hardlinks
from identity_qa_read_trace import FileBinding,calls,c_string,annotation,number
from identity_qa_read_launcher import ReadLaunchEvidence,_TOKEN as LAUNCH_TOKEN,_producer_trace
_NS=object();_RUN=object();_OUTPUT=object()
def sha(b):return hashlib.sha256(b).hexdigest()
def fs_sha(p):return sha(P(p).read_bytes())
def write_json(p,d):P(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def kind(p):
 s=p.lstat();return 'symlink'if stat.S_ISLNK(s.st_mode)else'directory'if stat.S_ISDIR(s.st_mode)else'file'if stat.S_ISREG(s.st_mode)else'special'
def lex(p):return posixpath.normpath(str(p))
@dataclass(frozen=True)
class Entry:
 visible:str;physical:str|None;kind:str;category:str;sha256:str|None=None;bytes:int=0;target:str|None=None;executable:bool=False;role:str|None=None;origin:str='';device:int|None=None;inode:int|None=None
class CapturedView:
 def __init__(self):
  require(fs_sha(W/'capture-inputs.json')=='85ff31b0a32e744086123784af446a04c6a11b11db8f81da3bce211e08851de9','Capture manifest differs from fixed controller pin');require(fs_sha(W/'captured-tools/capture.json')=='a7df539067a63ffa4557f648cde0da69acbcd50e5374ae41af6e8986f7eac874','Tool closure manifest differs from fixed controller pin');self.capture=json.loads((W/'capture-inputs.json').read_text());self.tool=json.loads((W/'captured-tools/capture.json').read_text());self.entries={};self.mounts=[];self.guard={};self.dirguard={};self.skeleton=None
  for role,folder in [('original','original80'),('candidate','projectedA80')]:
   root=W/'pair'/folder;visible='/qa/pair/'+folder;self.add_tree(root,visible,'source',role)
   self.mounts.append((str(root),visible,'ro','source'))
   for row in self.capture['files']:
    if row['role']==role:require(self.entries[visible+'/'+row['path']].sha256==row['sha256'],'Independent source binding differs')
   self.add_tree(W/'dependencies',visible+'/app/node_modules','dependency',role)
   self.mounts.append((str(W/'dependencies'),visible+'/app/node_modules','ro','dependency'))
  for e in self.tool['entries']:
   v=e['visible'];self.add(Entry(v,e.get('physical'),e['kind'],'tool',e.get('sha256'),e.get('bytes',0),e.get('target'),e.get('executable',False),origin=e.get('provenance','captured ELF closure')))
   if e['kind']=='file':self.mounts.append((e['physical'],v,'ro','tool'))
  gate=W/'start_gate';self.add(Entry('/qa/toolchain/bin/start-gate',str(gate),'file','tool',fs_sha(gate),gate.stat().st_size,executable=True,origin='actual fixed static pre-exec bootstrap'))
  self.mounts.append((str(gate),'/qa/toolchain/bin/start-gate','ro','tool'))
  self.node='/qa/toolchain/bin/node';self.elf_candidates={lex(e['path'])for e in self.tool['elfFamilies']['optionalCandidates']};self.elf_candidates|={lex(e['path'])for e in self.tool['elfFamilies'].get('optionalDirectoryCandidates',[])}
  self.elf_candidates|={lex(e['path'])for e in self.tool['elfFamilies'].get('optionalConfigurations',[])}
  self.required={v for v,e in self.entries.items()if e.kind=='file'}
  for path in ['/','/qa','/qa/pair','/qa/toolchain','/qa/toolchain/bin','/qa/toolchain/lib','/qa/toolchain/lib/node','/qa/home','/run','/run/qa','/tmp','/proc','/dev','/dev/shm','/sys']:
   self.ensure_dirs(path)
  self.token=_NS;self.snapshot=self._signature()
 def add(self,e):
  if e.physical and e.kind=='directory':
   st=P(e.physical).lstat();self.dirguard[e.physical]=(st.st_dev,st.st_ino,st.st_mode,st.st_mtime_ns,st.st_ctime_ns)
  old=self.entries.get(e.visible)
  if old and old.kind!='directory':require(old==e,'Ambiguous namespace entry '+e.visible)
  self.entries[e.visible]=e;self.ensure_dirs(str(P(e.visible).parent))
  if e.physical and e.kind=='file':
   s=P(e.physical).stat();self.guard[e.physical]=(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_ctime_ns,e.sha256)
 def ensure_dirs(self,path):
  path=lex(path)
  for p in [P(path),*P(path).parents]:
   v=str(p)
   if v not in self.entries:self.entries[v]=Entry(v,None,'directory','skeleton',origin='controller-created exact skeleton')
 def add_tree(self,root,visible,category,role):
  self.add(Entry(visible,str(root),'directory',category,role=role,origin='complete actual physical directory census'))
  for directory,dirs,files in os.walk(root,followlinks=False):
   for name in sorted(dirs+files):
    p=P(directory)/name;v=visible+'/'+str(p.relative_to(root));k=kind(p);require(k!='special','Special captured source/dependency input')
    self.add(Entry(v,str(p),k,category,fs_sha(p)if k=='file'else None,p.stat().st_size if k=='file'else 0,os.readlink(p)if k=='symlink'else None,bool(p.stat().st_mode&0o111)if k=='file'else False,role,'complete captured tree'))
 def _signature(self):return sha(json.dumps([e.__dict__ for _,e in sorted(self.entries.items())],sort_keys=True).encode())
 def members(self,path,entries=None):
  entries=self.entries if entries is None else entries
  if not hasattr(self,'_members_entries')or self._members_entries is not entries:
   index={}
   for v,e in entries.items():
    if v=='/':continue
    index.setdefault(str(P(v).parent),[]).append((P(v).name,e.kind))
   self._members_entries=entries;self._members_index={k:tuple(sorted(v))for k,v in index.items()}
  return self._members_index.get(lex(path),())
 def resolve(self,path,follow=True,entries=None):
  entries=self.entries if entries is None else entries
  path=lex(path);seen=set()
  while True:
   require(path not in seen,'Cyclic namespace alias');seen.add(path);parts=P(path).parts[1:]
   for i in range(1,len(parts)+1):
    p='/'+('/'.join(parts[:i]));e=entries.get(p)
    if e and e.kind=='symlink'and(follow or i<len(parts)):
     path=lex(posixpath.join(e.target if e.target.startswith('/')else posixpath.join(str(P(p).parent),e.target),*parts[i:]));break
   else:return path,entries.get(path)
 def verify(self):
  require(self.token is _NS,'Actual captured view required');require(self._signature()==self.snapshot,'Captured namespace binding graph changed')
  for p,expected in self.guard.items():
   s=P(p).stat();actual=(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_ctime_ns,fs_sha(p));require(actual==expected,'Captured file/inode changed '+p)
  for path,expected in self.dirguard.items():
   st=P(path).lstat();require((st.st_dev,st.st_ino,st.st_mode,st.st_mtime_ns,st.st_ctime_ns)==expected,'Captured directory inode/metadata changed '+path)
  # Count all actual private hardlinks, not just reported rows. No input may share an output inode.
  verify_private_hardlinks(W)
  for role,folder in [('original','original80'),('candidate','projectedA80')]:
   root=W/'pair'/folder;expected={r['path']:('file',None) for r in self.capture['files']if r['role']==role}
   expected['app/node_modules']=('directory',None);expected['docs/qa-ci/status/namespace-report.json']=('file',None)
   for row in self.capture.get('sourceAliases',[]):
    if row['role']==role:expected[row['path']]=('symlink',row['target'])
   for path in list(expected):
    for parent in P(path).parents:
     if str(parent)!='.':expected.setdefault(str(parent),('directory',None))
   actual={}
   for d,ds,fs in os.walk(root,followlinks=False):
    for name in ds+fs:
     p=P(d)/name;k=kind(p);actual[str(p.relative_to(root))]=(k,os.readlink(p)if k=='symlink'else None)
   require(actual==expected,'Complete source namespace membership/type/alias changed')
  dep_expected={r['path']:(r['kind'],r.get('target'))for r in self.capture['dependencies']};dep_actual={}
  for d,ds,fs in os.walk(W/'dependencies',followlinks=False):
   for name in ds+fs:
    p=P(d)/name;k=kind(p);dep_actual[str(p.relative_to(W/'dependencies'))]=(k,os.readlink(p)if k=='symlink'else None)
  require(dep_actual==dep_expected,'Complete dependency membership/type/alias changed')
  return self
def validate_output_inode(view,path):
 st=P(path).stat();require(stat.S_ISREG(st.st_mode)and st.st_nlink==1,'Output has a readable/writable inode alias');require((st.st_dev,st.st_ino)not in {(v[0],v[1])for v in view.guard.values()},'Output/source/tool inode overlap');return st

class SealedOutputs:
 def __init__(self,token,role,run_id,slots,writer_trace,view_signature=None):
  require(token is _OUTPUT,'Actual quiescent writer output needed');self.token=token;self.role=role;self.run_id=run_id;self.slots=MappingProxyType(slots);self.writer_trace=writer_trace;require(isinstance(view_signature,str)and re.fullmatch('[a-f0-9]{64}',view_signature),'Output needs exact frozen input frame');self.view_signature=view_signature
 def verify(self,role,view=None):
  require(self.token is _OUTPUT and self.role==role,'Output belongs to another role/run');require(view is None or self.view_signature==view.snapshot,'Stale output belongs to another frozen source/tool namespace frame')
  for v,e in self.slots.items():
   if view is not None:validate_output_inode(view,e['physical'])
   st=P(e['physical']).stat();require((st.st_dev,st.st_ino)==(e['device'],e['inode'])and fs_sha(e['physical'])==e['sha256']and st.st_nlink==1,'Sealed output bytes/inode/alias changed')
class EffectiveNamespace:
 def __init__(self,view,role,run_id,scratch,slots,root,entries,mount_records,bootstrap,reader=None):
  self.token=_RUN;self.view=view;self.role=role;self.run_id=run_id;self.scratch=scratch;self.slots=slots;self.root=root;self.entries=entries;self.mount_records=mount_records;self.bootstrap=bootstrap;self.reader=reader;self.trace_sha256=None;self.launch=None;self.lease_fd=None
 def require_bound_launch(self,launch,trace,cwd,root,role):
  require(self.token is _RUN and self.launch is launch and self.trace_sha256==sha(trace.encode()),'Actual namespace/launch binding differs')
  require(str(cwd)==str(launch.cwd)and str(root)==str(launch.root)and role==self.role,'Wrong namespace role/cwd/root')
 def lookup(self,path,follow=True):
  # Input aliases resolve against the virtual graph, never host Path.resolve.
  return self.view.resolve(path,follow,self.entries)
 def physical(self,path):
  v,e=self.lookup(path);require(e is not None and e.physical,'Unbound physical namespace file '+str(path));return P(e.physical)
 def verify(self):
  require(self.lease_fd is not None,'Preparation lease was not retained through postconditions')
  probe=os.open(W/'pair/.preparation.lock',os.O_RDWR|os.O_CLOEXEC)
  try:
   try:fcntl.flock(probe,fcntl.LOCK_EX|fcntl.LOCK_NB)
   except BlockingIOError:pass
   else:raise ValueError('Preparation lease is not actually held')
  finally:os.close(probe)
  self.view.verify();self.reader.verify(self.role,self.view)if self.reader else None
 def release(self):
  if self.lease_fd is not None:fcntl.flock(self.lease_fd,fcntl.LOCK_UN);os.close(self.lease_fd);self.lease_fd=None

def mount_rows(text):
 out=[]
 for line in text.splitlines():
  a,b=line.split(' - ',1);x=a.split();y=b.split();out.append({'id':int(x[0]),'parent':int(x[1]),'device':x[2],'root':x[3],'target':x[4],'flags':x[5].split(','),'filesystem':y[0],'source':y[1],'superFlags':y[2].split(',')})
 return out

def run(view,role,entry='namespace-producer.ts',reader_outputs=None,inject=None):
 require(type(view)is CapturedView and view.token is _NS,'Actual namespace input capability required');view.verify()
 require(role in ['original','candidate'],'Wrong role');require(entry in ['namespace-producer.ts','namespace-reader.ts'],'Entry/import anchor is not in the pinned command manifest');folder='original80'if role=='original'else'projectedA80';visible='/qa/pair/'+folder;runid=uuid.uuid4().hex;runroot=W/'runs'/runid;runroot.mkdir(parents=True);scratch=runroot/'scratch';scratch.mkdir();slotroot=runroot/'outputs';slotroot.mkdir();root=runroot/'skeleton';root.mkdir();ev=runroot/'evidence';ev.mkdir();home=f'/qa/home/{role}/{runid}';scratchVisible=f'/run/qa/{role}/{runid}';entries=dict(view.entries);mounts=list(view.mounts);slots={}
 if reader_outputs:reader_outputs.verify(role,view)
 outputPath=visible+'/docs/qa-ci/status/namespace-report.json'
 if not reader_outputs:
  slot=slotroot/'namespace-report.json';fd=os.open(slot,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);os.close(fd);require(validate_output_inode(view,slot)and slot.stat().st_nlink==1,'Fresh output aliases input')
  slots[outputPath]={'physical':str(slot),'initialSha256':fs_sha(slot),'device':slot.stat().st_dev,'inode':slot.stat().st_ino};mounts.append((str(slot),outputPath,'rw','run-output'))
 else:
  e=reader_outputs.slots[outputPath];mounts.append((e['physical'],outputPath,'ro','sealed-output'));entries[outputPath]=Entry(outputPath,e['physical'],'file','output',e['sha256'],e['bytes'],role=role,origin='quiescent actual writer '+reader_outputs.run_id)
 for p in [home,scratchVisible,'/tmp','/dev/shm']:
  cur=P(p)
  for q in [cur,*cur.parents]:
   if str(q)not in entries:entries[str(q)]=Entry(str(q),None,'directory','skeleton',origin='fresh role/run scaffold')
 # Create the exact synthetic filesystem. Never resolve an absolute guest alias on the host.
 for v,e in sorted(entries.items(),key=lambda x:(len(P(x[0]).parts),x[0])):
  if v=='/':continue
  if e.category in ['source','dependency'] and not any(v==m[1] for m in mounts):continue
  target=root/v.lstrip('/')
  if any(entries.get(str(p))and entries[str(p)].kind=='symlink'for p in P(v).parents):continue
  target.parent.mkdir(parents=True,exist_ok=True)
  if e.kind=='directory':target.mkdir(exist_ok=True)
  elif e.kind=='symlink':target.symlink_to(e.target)
  else:target.touch(exist_ok=True)
 # Host physical sources are held by immutable FD identities during kernel mount construction.
 fds=[];args=['/usr/bin/bwrap','--die-with-parent','--unshare-net','--unshare-pid','--clearenv','--setenv','HOME',home,'--setenv','TMPDIR',scratchVisible,'--setenv','PATH','/qa/toolchain/bin','--setenv','LC_ALL','C','--setenv','NODE_PATH','','--setenv','TSX_DISABLE_CACHE','1']
 fd=os.open(root,os.O_RDONLY|os.O_DIRECTORY|os.O_CLOEXEC);fds.append(fd);args+=['--ro-bind-fd',str(fd),'/']
 expected=[]
 for physical,target,mode,category in mounts:
  fd=os.open(physical,os.O_RDONLY|os.O_CLOEXEC);fds.append(fd);s=os.fstat(fd);expected.append({'physical':physical,'target':target,'mode':mode,'category':category,'device':s.st_dev,'inode':s.st_ino});args+=['--bind-fd'if mode=='rw'else'--ro-bind-fd',str(fd),target]
 # Runtime write scopes have no payload at creation and no input inode sharing.
 empty=W/'empty-runtime';empty.mkdir(exist_ok=True);emptyfd=os.open(empty,os.O_RDONLY|os.O_DIRECTORY|os.O_CLOEXEC);fds.append(emptyfd);st=os.fstat(emptyfd);expected.append({'physical':str(empty),'target':'/dev/shm','mode':'ro','category':'empty-runtime','device':st.st_dev,'inode':st.st_ino})
 args+=['--proc','/proc','--dev','/dev','--bind',str(scratch),scratchVisible,'--bind',str(scratch),'/tmp','--ro-bind-fd',str(emptyfd),'/dev/shm','--chdir',visible+'/app']
 nodeargv=['/qa/toolchain/bin/node','--import','tsx',visible+'/app/scripts/'+entry]
 if inject=='foreign-argv':nodeargv.insert(1,'--trace-warnings')
 gateargv=['/qa/toolchain/bin/start-gate',*nodeargv];args+=['--',*gateargv]
 if inject=='extra-root-member':(root/'undeclared-root-member').touch()
 if inject=='prefilled-home':(root/home.lstrip('/')/'foreign-cache').write_bytes(b'old-cache')
 if inject=='writable-source':
  i=args.index('--ro-bind-fd',args.index('--ro-bind-fd')+1);args[i]='--bind-fd'
 trace=ev/'recorder.strace';from identity_qa_read_trace import TRACE_OPTIONS
 command=['/usr/bin/strace',*TRACE_OPTIONS,'-o',str(trace),*args]
 lock=os.open(W/'pair/.preparation.lock',os.O_RDWR|os.O_CLOEXEC);fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
 with open('/dev/null','rb')as stdin:
  p=subprocess.Popen(command,stdin=stdin,stdout=subprocess.PIPE,stderr=subprocess.PIPE,pass_fds=fds,close_fds=True,env={'PATH':'/usr/bin:/bin','LC_ALL':'C'});pipeStats={1:os.fstat(p.stdout.fileno()),2:os.fstat(p.stderr.fileno())};readable=select.select([p.stdout],[],[],15)[0];line=p.stdout.readline()if readable else b''
  try:
   require(line.startswith(b'NAMESPACE_GATE_READY:'),'Bootstrap did not reach verified namespace gate: '+repr(line));text=trace.read_text();matches=re.findall(r'^(\d+) execve\("/qa/toolchain/bin/start-gate"',text,re.M);require(matches,'Actual bootstrap exec missing');gatepid=int(matches[-1]);require(not re.search(r'execve\("/qa/toolchain/bin/node"',text),'Producer executed before actual mount verification');childRoot=P(f'/proc/{gatepid}/root');actualMounts=mount_rows(P(f'/proc/{gatepid}/mountinfo').read_text());rootstat=childRoot.stat();require((rootstat.st_dev,rootstat.st_ino)==(root.stat().st_dev,root.stat().st_ino),'Child root is not the actual synthetic scaffold');require(tuple(sorted((x.name,kind(x))for x in childRoot.iterdir()))==view.members('/',entries),'Actual root membership differs')
   mountProof=[]
   for e in expected:
    actual=(childRoot/e['target'].lstrip('/')).stat();require((actual.st_dev,actual.st_ino)==(e['device'],e['inode']),'Kernel mount source identity differs '+e['target']);m=max((x for x in actualMounts if e['target']==x['target']or e['target'].startswith(x['target'].rstrip('/')+'/')),key=lambda x:len(x['target']));require(('ro'in m['flags'])==(e['mode']=='ro'),'Effective readonly mount differs '+e['target']);mountProof.append(dict(e,effectiveMount=m))
   devices={'null':(1,3),'zero':(1,5),'full':(1,7),'random':(1,8),'urandom':(1,9),'tty':(5,0)}
   for name,devnum in devices.items():
    st=(childRoot/'dev'/name).stat();require(stat.S_ISCHR(st.st_mode)and(os.major(st.st_rdev),os.minor(st.st_rdev))==devnum,'Unexpected runtime device '+name)
   allowedMounts={'/','/proc','/dev','/dev/pts',*['/dev/'+x for x in devices],scratchVisible,'/tmp',*[x['target']for x in expected]}
   require(all(m['target']in allowedMounts for m in actualMounts),'Undeclared effective child mount')
   rootmount=next(m for m in actualMounts if m['target']=='/');require('ro'in rootmount['flags'],'Synthetic root is not actually RO')
   for m in actualMounts:
    if 'rw'in m['flags']:require(m['target']in ['/proc','/dev','/dev/pts',*['/dev/'+x for x in devices],scratchVisible,'/tmp',*[x['target']for x in expected if x['mode']=='rw']],'Unexpected writable mount')
   require(not list((childRoot/home.lstrip('/')).iterdir()),'Run HOME was prefilled')
   require(not list((childRoot/scratchVisible.lstrip('/')).iterdir()),'Run scratch was prefilled')
   skeletonMembership=[]
   coverRoots=[e['target']for e in expected if e['category']in ['source','dependency']]+['/proc','/dev',scratchVisible,'/tmp']
   for v,e in entries.items():
    if e.kind!='directory'or e.physical is not None or any(v==prefix or v.startswith(prefix+'/')for prefix in coverRoots):continue
    actualDir=childRoot/v.lstrip('/');actualMembers=tuple(sorted((x.name,kind(x))for x in actualDir.iterdir()));expectedMembers=view.members(v,entries);require(actualMembers==expectedMembers,'Actual closed scaffold membership differs '+v);skeletonMembership.append({'visible':v,'members':actualMembers})
   # Same directory inode + readonly bind + independent full census ties every visible member, not a parent-name whitelist.
   sourceMounts=[x for x in expected if x['category']in ['source','dependency']]
   for source in sourceMounts:
    visibleRoot=childRoot/source['target'].lstrip('/');require(visibleRoot.stat().st_ino==P(source['physical']).stat().st_ino,'Actual source view was substituted')
   expectedRoot={x.name:kind(x)for x in root.iterdir()};bootstrap={'hostPid':gatepid,'readyLine':line.decode(),'producerExecBeforeVerification':False,'rootIdentity':{'dev':rootstat.st_dev,'ino':rootstat.st_ino},'rootMembers':expectedRoot,'closedScaffoldDirectories':skeletonMembership,'mounts':mountProof,'completeMountTable':actualMounts,'actualFdTargets':{q.name:os.readlink(q)for q in P(f'/proc/{gatepid}/fd').iterdir()},'controllerMountNamespace':os.readlink('/proc/self/ns/mnt'),'childMountNamespace':os.readlink(f'/proc/{gatepid}/ns/mnt')};require(set(bootstrap['actualFdTargets'])=={'0','1','2'},'Bootstrap inherited undeclared input descriptor');os.kill(gatepid,signal.SIGCONT);out,err=p.communicate(timeout=60)
  except BaseException:
   
   if 'gatepid' in locals():
    try:os.kill(gatepid,signal.SIGKILL)
    except ProcessLookupError:pass
   p.kill();p.communicate(timeout=10);raise
  finally:
   for fd in fds:os.close(fd)
   if p.returncode!=0:fcntl.flock(lock,fcntl.LOCK_UN);os.close(lock)
 require(p.returncode==0,'Native producer failed '+err.decode(errors='replace'));recorder=trace.read_text();producer,nspids,boundary,aborted=_producer_trace(recorder,tuple(args),tuple(nodeargv),bootstrap_argv=tuple(gateargv));ns=EffectiveNamespace(view,role,runid,scratch,slots,root,entries,mountProof,bootstrap,reader_outputs);context={'kernelBootId':P('/proc/sys/kernel/random/boot_id').read_text().strip(),'kernelRelease':os.uname().release,'producerExecutable':'/qa/toolchain/bin/node','producerSha256':view.entries['/qa/toolchain/bin/node'].sha256,'straceSha256':fs_sha('/usr/bin/strace'),'bwrapSha256':fs_sha('/usr/bin/bwrap'),'environment':{'HOME':home,'TMPDIR':scratchVisible,'PATH':'/qa/toolchain/bin','LC_ALL':'C','NODE_PATH':'','TSX_DISABLE_CACHE':'1'},'explicitProfile':'cache-disabled first mechanics probe, identical both roles; not a silent production profile change'};stdio={0:MappingProxyType({'kind':'stdin-null','path':'/dev/null','deviceMajor':1,'deviceMinor':3}),**{n:MappingProxyType({'kind':'output-pipe','pipeInode':s.st_ino})for n,s in pipeStats.items()}};launch=ReadLaunchEvidence(LAUNCH_TOKEN,root=P(visible),role=role,cwd=P(visible+'/app'),argv=tuple(nodeargv),command=tuple(command),trace=producer,returncode=p.returncode,stdout=out,stderr=err,stdio=MappingProxyType(stdio),tool_context=MappingProxyType(context),trace_sha256=sha(producer.encode()),recorder_trace=recorder,recorder_trace_sha256=sha(recorder.encode()),producer_boundary=boundary,namespace_process_ids=nspids,evidence_directory=ev,readonly_dependency_mounts=(),aborted_identity_observations=aborted,readonly_namespace_parents=(),namespace=ns);ns.trace_sha256=launch.trace_sha256;ns.launch=launch;ns.lease_fd=lock;ns.verify();write_json(ev/'kernel-namespace-proof.json',bootstrap);(ev/'producer.strace').write_text(producer);(ev/'stdout').write_bytes(out);(ev/'stderr').write_bytes(err);return launch
