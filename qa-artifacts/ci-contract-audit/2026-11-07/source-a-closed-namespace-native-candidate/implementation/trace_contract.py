# SPDX-License-Identifier: Apache-2.0
"""Namespace/run extension for the existing process/FD/read authenticator."""
import pathlib,os,re,hashlib,json,posixpath
from types import MappingProxyType
from closed_namespace import Entry,sha,P,W,require,lex,SealedOutputs,_OUTPUT,fs_sha
from identity_qa_read_trace import FileBinding,Handle,RuntimeObservationContract,annotation,c_string,number,calls,arguments
from identity_qa_tool_tree import negative_metadata_locator

def data_bytes(token):
 require(token.startswith('"')and token.endswith('"'),'Write buffer is truncated/non-string')
 text=token[1:-1];raw=bytearray();i=0;simple={'a':7,'b':8,'f':12,'n':10,'r':13,'t':9,'v':11,'\\':92,'"':34}
 while i<len(text):
  if text[i]!='\\':raw.extend(text[i].encode());i+=1;continue
  i+=1;m=re.match('[0-7]{1,3}',text[i:]);x=re.match('x([a-fA-F0-9]{2})',text[i:])
  if m:raw.append(int(m[0],8));i+=len(m[0])
  elif x:raw.append(int(x[1],16));i+=3
  else:require(text[i]in simple,'Unsupported write escape');raw.append(simple[text[i]]);i+=1
 return bytes(raw)

class NamespaceContract:
 def __init__(self,launch):
  self.namespace=launch.namespace;self.ns=self.namespace;self.view=self.ns.view;self.role=launch.role;self.root=launch.root;self.mount_views=();self.files={};self.directories={};self.expected_tool_failures=set();self.required_discovery={'curricula/DE/Gymnasium/canonical'}if launch.argv[-1].endswith('/namespace-producer.ts')else set();self.aliases={};self.external_files={};self.external_directory_metadata={};self.mutable={};self.write_facts=[];self.authorized_events=[];self.launch=launch
  self.ipc_facts=[];self.scratch_prefixes=[launch.tool_context['environment']['TMPDIR'],'/tmp'];self.source_transport=self.root/'curricula/native-namespace-fixture/values.csv';self.expected_transport_sha=self.view.entries[str(self.source_transport)].sha256
  for v,e in self.ns.entries.items():
   logical=str(P(v).relative_to(self.root))if P(v).is_relative_to(self.root)and P(v)!=self.root else v
   if e.kind=='directory':self.directories[logical]=self.view.members(v,self.ns.entries)
   if e.kind=='file'and e.category in ['source','tool','dependency','output']:self.files[logical]=e.sha256
  self.anchors={v for v,e in self.ns.entries.items()if e.kind=='file'and e.role==self.role and(P(v).suffix in ['.js','.cjs','.mjs','.ts']or P(v).name=='package.json'and'/app/'in v)}
  self.node_dirs=set();self.package_scope=set();anchor_parents={P(a).parent for a in self.anchors};parents=set(anchor_parents)
  for parent in anchor_parents:parents.update(parent.parents)
  for parent in parents:
   if parent.name!='node_modules':self.node_dirs.add(str(parent/'node_modules'))
   self.package_scope.add(str(parent/'package.json'));self.package_scope.add(str(parent/'tsconfig.json'))
  home=launch.tool_context['environment']['HOME'];self.node_dirs|={home+'/.node_modules',home+'/.node_libraries','/qa/toolchain/lib/node'}
  self.case_probe=''.join(c.lower()if c.upper()==c else c.upper()for c in str(launch.cwd));self.case_probe_module=self.view.entries[str(self.root)+'/app/node_modules/get-tsconfig/dist/index.mjs'].sha256
  self.node_sha=launch.tool_context['producerSha256'];self.allowed_exec={self.view.node};self.allowed_exec|={v for v,e in self.ns.entries.items()if e.category=='dependency'and e.executable and v.startswith(str(self.root))and v.endswith('/@esbuild/linux-x64/bin/esbuild')}
 def check_exec(self,path,args,proc,event):
  actual=tuple(c_string(x)for x in arguments(args[1][1:-1]));expected=(self.view.node,'--import','tsx',str(self.root)+'/app/scripts/'+P(self.launch.argv[-1]).name)if str(path)==self.view.node else(str(path),'--service=0.27.2','--ping')
  require(actual==expected,'Foreign executable argv/import anchor');env={c_string(x).split('=',1)[0]:c_string(x).split('=',1)[1]for x in arguments(args[2][1:-1])};require(env==dict(self.launch.tool_context['environment'],PWD=str(self.launch.cwd)),'Changed executable environment');require(proc.cwd[0]==self.launch.cwd,'Unexpected subprocess cwd')
 def verify_bytes_and_aliases(self):
  self.ns.verify()
 def file_size(self,path):
  key=self.scratch_key(path)
  if key in self.mutable:return len(self.mutable[key]['bytes'])
  v,e=self.ns.lookup(path);require(e is not None,'Unknown input size');return e.bytes
 def file_digest(self,path):
  key=self.scratch_key(path)
  if key in self.mutable:return sha(bytes(self.mutable[key]['bytes']))
  for v,slot in self.ns.slots.items():
   if str(path)==v:return fs_sha(slot['physical'])
  v,e=self.ns.lookup(path);require(e and e.physical,'Missing file binding');return fs_sha(e.physical)
 def is_directory(self,path):
  key=self.scratch_key(path)
  if key is not None:return key==''or key in self.mutable and self.mutable[key]['kind']=='directory'
  _,e=self.ns.lookup(path);return e is not None and e.kind=='directory'
 def scratch_key(self,path):
  path=lex(path)
  for prefix in self.scratch_prefixes:
   if path==prefix:return ''
   if path.startswith(prefix+'/'):return path[len(prefix)+1:]
  return None
 def physical_scratch(self,key):return self.ns.scratch/key
 def resolve(self,attempted,actual=None,operation=None):
  path=str(attempted);require('..'not in P(path).parts,'Dot-dot virtual traversal unsupported; not a host resolve fallback')
  key=self.scratch_key(path)
  if key is not None:
   require(operation not in ['execve','execveat'],'Executable scratch is outside the pinned command manifest')
   if key=='':return P(path),None,path
   require(key in self.mutable,'Uncreated run-scratch path '+path);m=self.mutable[key]
   if m['kind']=='directory':self.directories[path]=tuple(sorted((x[len(key)+1:],v['kind'])for x,v in self.mutable.items()if x.startswith(key+'/')and'/'not in x[len(key)+1:]));return P(path),None,path
   return P(path),FileBinding('source'if key=='source-transport.csv'else'output',sha(bytes(m['bytes'])),'actual current-run byte-preserving source transport of '+str(self.source_transport)if key=='source-transport.csv'else'tracked current-run scratch'),str(self.source_transport.relative_to(self.root))if key=='source-transport.csv'else path
  nofollow=operation in ['lstat','readlink','readlinkat'];v,e=self.ns.lookup(path,not nofollow);require(e is not None,'Unbound namespace input '+path)
  if actual is not None:require(lex(actual)==v,'Actual kernel FD path differs from virtual resolution '+str(actual)+' != '+v)
  if e.role is not None:require(e.role==self.role,'Cross-role source/tool read rejected '+v)
  if e.kind=='file':
   require(e.category in ['source','tool','dependency','output'],'Not an input file capability')
   if operation in ['execve','execveat']:require(v in self.allowed_exec and e.executable,'Foreign executable input')
   binding=FileBinding(e.category,e.sha256,e.origin)
  else:binding=None
  logical=str(P(v).relative_to(self.root))if P(v).is_relative_to(self.root)and P(v)!=self.root else v
  return P(v),binding,logical
 def prove_negative_lookup(self,event,path,proc):
  start,end,pid,operation,args,result=event;path=str(path);key=self.scratch_key(path)
  if key is not None:
   negative_metadata_locator(event,P(path),proc.cwd[0])
   # Fresh scratch absence is temporal: the model contains every traced mutator.
   require(result.startswith('-1 ENOENT '),'Scratch absence is not ENOENT');require(key not in self.mutable,'Existing mutable member cannot prove absence');require(operation in ['open','openat','stat','statx','newfstatat','access','mkdir'],'Unsupported scratch absence');return {'category':'fresh-temporally-tracked-scratch-absence','path':path,'pid':pid,'traceEntry':start,'sourceInput':False}
  require(proc.executable==P(self.view.node),'Lookup family is not bound Node executable');require(path not in self.view.required,'Required source/tool payload is missing, never optional');flags,at,pathname=negative_metadata_locator(event,P(path),proc.cwd[0])
  case=path==self.case_probe and operation=='access'and args[1:]==['F_OK'];elf=lex(path)in self.view.elf_candidates
  node=lex(path)in self.package_scope or any(path==d or path.startswith(d+'/')for d in self.node_dirs)
  require(elf or node or case,'Outside derived Node/ELF family '+path)
  if operation in ['open','openat']:require(elf or path.endswith('/package.json')or path.endswith('/tsconfig.json'),'Missing source/payload open is not generic dependency metadata')
  # Independently complete immutable parent up through root; do not consult host Path.resolve.
  parts=P(path).parts;parent='/'
  for i in range(1,len(parts)):
   child='/'+('/'.join(parts[1:i+1]));resolved,e=self.ns.lookup(child,False)
   if e is None:
    _,pentry=self.ns.lookup(parent);require(pentry and pentry.kind=='directory','Missing parent lacks complete actual RO membership')
    members=self.view.members(parent,self.ns.entries);require(P(child).name not in dict(members),'Existing member cannot be an absence')
    return {'category':'derived-elf-loader-absence'if elf else'derived-captured-get-tsconfig-invertCase-cwd-absence'if case else'derived-node-search-absence','path':path,'firstMissing':child,'completeParent':parent,'membershipSha256':sha(json.dumps(members).encode()),'pid':pid,'execSha256':self.node_sha,'traceEntry':start,'flags':flags,'algorithmModuleSha256':self.case_probe_module if case else None,'errno':'ENOENT','laterRequiredLibrariesBound':sorted(self.view.tool['elfFamilies']['protectedRequiredPaths'])if elf and'protectedRequiredPaths'in self.view.tool['elfFamilies']else None}
   parent=child
  raise ValueError('Negative event addresses an existing namespace member '+path)
 def open_write(self,path,flags,failed,args,result,proc,Handle,handles,event):
  path=str(path);key=self.scratch_key(path);slot=self.ns.slots.get(path)
  require(key is not None or slot is not None,'Write outside exact current output/scratch contract '+path)
  require(not failed,'Unexpected failed allowed writer open');require('O_TMPFILE'not in flags and'O_APPEND'not in flags,'Unsupported write grammar')
  if slot:
   key='@output:'+path
   if key not in self.mutable:self.mutable[key]={'bytes':bytearray(),'kind':'file','sealed':False,'physical':slot['physical'],'path':path,'writers':0}
  else:
   parent=str(P(key).parent);require(parent=='.'or parent in self.mutable and self.mutable[parent]['kind']=='directory','Scratch parent not traced/created')
   if key not in self.mutable:self.mutable[key]={'bytes':bytearray(),'kind':'file','sealed':False,'physical':str(self.physical_scratch(key)),'path':path,'writers':0}
  m=self.mutable[key];require(not m['sealed'],'Write after scratch/source transport has been sealed/read');require(annotation(result)==path,'Writer kernel FD identity differs')
  if'O_TRUNC'in flags:m['bytes']=bytearray()
  handle=Handle(P(path),None,key,False,transport='run-writer');handle.write_position=0;handle.mutable_key=key;m['writers']+=1;handles.append(handle);proc.fds[number(result)]=(handle,'O_CLOEXEC'in flags);self.write_facts.append({'operation':'open-write','path':path,'pid':event[2],'traceEntry':event[0],'flags':flags,'initialFresh':len(m['bytes'])==0})
 def before_read_open(self,path,proc,checked,event):
  key=self.scratch_key(path)
  if key is None:return
  m=self.mutable.get(key)
  if m and m['kind']=='file':
   require(m['writers']==0,'Scratch source reader overlaps a live writer');m['sealed']=True
   if key=='source-transport.csv':require(sha(bytes(m['bytes']))==self.expected_transport_sha,'Temporary source bytes changed/reclassified')
   self.write_facts.append({'operation':'seal-current-source-transport'if key=='source-transport.csv'else'seal-current-scratch-read','path':str(path),'sha256':sha(bytes(m['bytes'])),'sourceBinding':str(self.source_transport)if key=='source-transport.csv'else None})
 def handle_operation(self,event,proc,fd):
  start,end,pid,name,args,result=event;failed=result.startswith('-1 ')
  if name=='ioctl':
   fd(proc,args[0]);h=proc.fds[number(args[0])][0];require((args[1]=='TCGETS'and result.startswith('-1 ENOTTY ')and h.transport in ['launcher-stdin','launcher-output','internal-control'])or(args[1:]in [['FIONBIO','[1]']]and result=='0'and h.transport in ['launcher-output','internal-control']),'Unmeasured ioctl/FD ingress');self.ipc_facts.append({'operation':'ioctl '+args[1],'pid':pid,'result':'ENOTTY'if failed else'0','origin':h.logical,'payloadIngress':False});return True
  if name=='socket':
   require(not failed and args==['AF_UNIX','SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK','0'] and proc.executable==P(self.view.node),'Unmeasured socket creation');identity=annotation(result);require(re.fullmatch(r'UNIX-STREAM:\[\d+\]',identity or ''),'Missing socket kernel identity');proc.fds[number(result)]=(Handle(P(identity),None,'unconnected-current-run-socket',False,transport='unconnected-socket'),True);self.ipc_facts.append({'operation':name,'pid':pid,'identity':identity,'payloadReadAuthorized':False});return True
  if name=='connect':
   fd(proc,args[0]);h=proc.fds[number(args[0])][0];m=re.fullmatch(r'\{sa_family=AF_UNIX, sun_path=("(?:[^"\\]|\\.)*")\}',args[1]);require(h.transport=='unconnected-socket'and m is not None,'External/unbound socket');path=c_string(m[1]);expected=self.scratch_prefixes[0]+'/tsx-'+str(os.getuid())+'/1.pipe';require(path==expected and result.startswith('-1 ENOENT ') and self.scratch_key(path)not in self.mutable,'Only proved absent current-run TSX notification endpoint allowed');self.ipc_facts.append({'operation':name,'pid':pid,'path':path,'result':'ENOENT','freshScratch':True,'payloadIngress':False});return True
  if name=='socketpair':
   require(not failed and args[:3]==['AF_UNIX','SOCK_STREAM|SOCK_CLOEXEC','0']and proc.executable==P(self.view.node),'Foreign socketpair');tokens=arguments(args[3][1:-1]);require(len(tokens)==2,'Incomplete pair');identities=[annotation(x)for x in tokens];require(all(re.fullmatch(r'UNIX-STREAM:\[\d+\]',x or '')for x in identities)and identities[0]!=identities[1],'Missing pair identities')
   for token,identity in zip(tokens,identities):proc.fds[number(token)]=(Handle(P(identity),None,'internal:socketpair',False,transport='internal-control'),True)
   self.ipc_facts.append({'operation':name,'pid':pid,'identities':identities,'origin':'actual current-run socketpair; descendant-only FD inheritance; no external connect/SCM_RIGHTS'});return True
  if name in ['write','writev','pwrite64','pwritev','pwritev2']:
   require(not failed,'Failed writer operation');fd(proc,args[0]);handle=proc.fds[number(args[0])][0]
   if handle.transport in ['launcher-output','internal-control']:return True
   require(handle.transport=='run-writer','Unbound writer FD');m=self.mutable[handle.mutable_key];require(not m['sealed'],'Post-read mutable write rejected')
   if name in ['write','pwrite64']:buf=data_bytes(args[1])
   else:
    bufs=re.findall(r'iov_base=("(?:[^"\\]|\\.)*"), iov_len=(\d+)',args[1]);require(bufs and args[1].count('iov_base=')==len(bufs),'Incomplete writev bytes');buf=b''.join(data_bytes(x)[:int(n)]for x,n in bufs)
   count=number(result);require(len(buf)>=count,'Truncated writer payload');buf=buf[:count];offset=number(args[3])if name=='pwrite64'else getattr(handle,'write_position',0);require(name not in ['pwritev','pwritev2'],'Unsupported vectored position grammar');data=m['bytes'];data.extend(b'\0'*max(0,offset+count-len(data)));data[offset:offset+count]=buf;handle.write_position=offset+count;self.write_facts.append({'operation':name,'path':str(handle.path),'pid':pid,'traceEntry':start,'offset':offset,'bytes':count,'payloadSha256':sha(buf)});return True
  if name=='close':
   n=number(args[0]);handle=proc.fds.get(n,(None,None))[0]
   if handle and handle.transport=='run-writer'and not failed:self.mutable[handle.mutable_key]['writers']-=1
   return False
  if name in ['mkdir','mkdirat']:
   path=c_string(args[1]if name=='mkdirat'else args[0]);require(path.startswith('/'),'Relative scratch mkdir unsupported');key=self.scratch_key(path);require(key is not None and key not in ['',None],'mkdir outside fresh scratch');require(not failed or'EEXIST'in result,'Unexpected mkdir error')
   if failed:require(key in self.mutable,'EEXIST without current-run membership')
   else:require(key not in self.mutable,'Duplicate scratch creation');self.mutable[key]={'kind':'directory'}
   self.write_facts.append({'operation':name,'path':path,'pid':pid,'traceEntry':start});return True
  if name in ['mprotect','msync']:
   require(not failed,'Failed memory operation');require(name!='msync','File-backed mapped writes unsupported');return True
  if name in ['ftruncate','truncate','rename','renameat','renameat2','link','linkat','unlink','unlinkat','rmdir','symlink','symlinkat','copy_file_range','sendfile','socket','socketpair','connect','accept','accept4','sendmsg','recvmsg','bind','listen','close_range']:
   raise ValueError('Run operation not yet supported/never skipped '+name)
  return False
 def finish_authentication(self,source_reads,discoveries,facts):
  spec=json.loads((W/'pair'/('original80'if self.role=='original'else'projectedA80')/'namespace-fixture.json').read_text())
  if self.launch.argv[-1].endswith('/namespace-producer.ts'):
   required={e['path']for e in spec['catalog']+spec['assets']}|{spec['csv']['path'],'namespace-fixture.json','app/scripts/namespace-producer.ts'};require(required<=source_reads,'Independent source/asset selector census was not fully read')
  else:
   expected=str(self.root)+'/'+spec['output'];row=next((v for(k,path),v in facts.items()if k=='output'and path==spec['output']),None);require(row and 'read'in row['observedOperations'],'Separate checker did not actually read sealed writer bytes');require(row['sha256']==self.ns.reader.slots[expected]['sha256'],'Reader output differs from current sealed writer')
 def finish_writes(self,processes,exited,events):
  require(set(processes)<=exited,'Surviving writer process')
  for key,m in self.mutable.items():
   if m['kind']!='file':continue
   actual=P(m['physical']);require(actual.is_file()and actual.stat().st_nlink==1,'Run file missing/aliases an input');require(actual.read_bytes()==bytes(m['bytes']),'Actual run bytes differ from complete observed writes '+key)
  if self.ns.slots:
   sealed={}
   for path,slot in self.ns.slots.items():
    key='@output:'+path;require(key in self.mutable and self.mutable[key]['bytes'],'Old/empty/unwritten report cannot count fresh');s=P(slot['physical']).stat();require((s.st_dev,s.st_ino)==(slot['device'],slot['inode']),'Output inode changed');sealed[path]={'physical':slot['physical'],'sha256':fs_sha(slot['physical']),'bytes':s.st_size,'inode':s.st_ino,'device':s.st_dev};os.chmod(slot['physical'],0o400)
   self.sealed_outputs=SealedOutputs(_OUTPUT,self.role,self.ns.run_id,sealed,self.launch.trace_sha256,self.view.snapshot)


class NamespaceRuntime(RuntimeObservationContract):
 """Explicit measured Node + pinned static esbuild runtime observations, no source bytes."""
 OBSERVED_PATHS=RuntimeObservationContract.OBSERVED_PATHS|frozenset(['/dev/null','/proc/self/mountinfo','/sys/kernel/mm/transparent_hugepage/hpage_pmd_size'])
 def check_event(self,launch,proc,path,operation,failed,actual,flags):
  node=P(launch.namespace.view.node);esbuild=P(str(launch.root)+'/app/node_modules/@esbuild/linux-x64/bin/esbuild')
  require(proc.executable in ([esbuild]if path in ['/proc/self/mountinfo','/sys/kernel/mm/transparent_hugepage/hpage_pmd_size']else[node]),'Runtime observation from wrong executable')
  if path=='/dev/null'and actual is not None:require(actual=='/dev/null','Wrong null device path')
  if path=='/sys/kernel/mm/transparent_hugepage/hpage_pmd_size':require(flags=='O_RDONLY'and failed and failed.startswith('-1 ENOENT '),'Wrong Go optional hugepage probe')

def runtime_for(launch):
 observed=set();fds=set()
 for _,_,_,op,args,res in calls(launch.trace):
  pos=1 if op in ['openat','openat2','statx','newfstatat','readlinkat']else 0
  if op in ['open','openat','openat2','readlink','readlinkat','stat','statx','lstat','newfstatat']and args[pos].startswith('"'):observed.add(c_string(args[pos]))
  if op=='fcntl'and args[1:]==['F_SETFD','FD_CLOEXEC']and res.startswith('-1 EBADF'):fds.add(number(args[0]))
 paths={}
 for p in observed&NamespaceRuntime.OBSERVED_PATHS:
  if p==NamespaceRuntime.NODE_VM_PATH:paths[p]=NamespaceRuntime.measured_node_vm_rule()
  elif p.startswith('/sys/'):paths[p]={'operations':['openat'],'resultClass':'ENOENT-probe'}
  elif p=='/proc/self/exe':paths[p]={'operations':['readlink'],'resultClass':'volatile-kernel-observation'}
  else:paths[p]={'operations':['openat','read','pread64','readv','newfstatat','close'],'resultClass':'volatile-kernel-observation'}
 return NamespaceRuntime(launch.tool_context['producerSha256'],launch.tool_context['kernelRelease'],launch.trace_sha256,paths,sorted(fds))
