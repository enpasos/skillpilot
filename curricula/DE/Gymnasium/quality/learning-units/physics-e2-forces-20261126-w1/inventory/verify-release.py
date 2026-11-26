#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Independent W1 finite file/path/digest inventory; default is read-only.
External root values are command-line aliases, never published workspace paths.
--rebuild-tables OUT writes exact full tables outside the repository.
--expected-table-index INDEX independently recomputes and compares every byte.
"""
from pathlib import Path, PurePosixPath
import argparse, collections, gzip, hashlib, io, json, re, subprocess, sys, tarfile, tempfile

HERE=Path(__file__).resolve().parent
M=json.loads((HERE.parent/'evidence-manifest.json').read_text());P=M['auditPolicy']
HEX=re.compile(r'^(?:sha256:)?([a-fA-F0-9]{64})$')
EXT=re.compile(r'\.(?:jsonl?|md|jpg|jpeg|png|webp|svg|pdf|html|py|ts|mts|mjs|cjs|js|txt|gz|sh|yaml|yml|zip|csv|tsv|log|xml|sha256|patch)$',re.I)
a=argparse.ArgumentParser(description=__doc__)
a.add_argument('--repo',type=Path,required=True);a.add_argument('--base',required=True)
a.add_argument('--external-root',action='append',default=[],metavar='ALIAS=DIRECTORY')
a.add_argument('--anchor');a.add_argument('--index',action='store_true');a.add_argument('--native',action='store_true')
a.add_argument('--rebuild-tables',type=Path);a.add_argument('--expected-table-index',type=Path)
a.add_argument('--problem-limit',type=int,default=40);args=a.parse_args()
if args.problem_limit<0:raise SystemExit('Problem limit must be nonnegative')
if args.expected_table_index and M.get('expectedTableIndex'):
 if hashlib.sha256(args.expected_table_index.read_bytes()).hexdigest()!=M['expectedTableIndex']['sha256']:raise SystemExit('External table index SHA differs from compact manifest')
R=args.repo.resolve();D=P['dossier'];roots={'repo':R};problems=[]
for v in args.external_root:
 alias,sep,path=v.partition('=')
 if not sep or alias in roots or alias not in P['externalRoots']:raise SystemExit('Invalid external root alias')
 roots[alias]=Path(path).resolve()
for alias,rule in P['externalRoots'].items():
 if rule['required'] and (alias not in roots or not roots[alias].is_dir()):problems.append({'kind':'UNVERIFIED_external_root','root':alias})
def sha(b):return hashlib.sha256(b).hexdigest()
def js_numbers(v):
 if isinstance(v,float)and v.is_integer():return int(v)
 if isinstance(v,list):return[js_numbers(x)for x in v]
 if isinstance(v,dict):return{k:js_numbers(x)for k,x in v.items()}
 return v
def stable(v):return json.dumps(js_numbers(v),ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def git(*cmd,optional=False):
 p=subprocess.run(['git',*cmd],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
 if p.returncode and not optional:raise RuntimeError('Read-only Git operation failed: '+cmd[0])
 return None if p.returncode else p.stdout
base=args.base
if base!=M['baseCommit']:raise SystemExit('Unexpected delivery base')
if git('cat-file','-e',base+'^{commit}',optional=True)is None:raise SystemExit('Current clone lacks the supplied main base')
head=git('rev-parse','HEAD').decode().strip();anchor=git('rev-parse',(args.anchor or 'HEAD')+'^{commit}').decode().strip()
bootstrap=set(M['bootstrapPaths']);commits=[]
def live_scope():
 if args.anchor:paths=set(git('diff','--name-only',base,anchor).decode().splitlines())
 else:paths=set(git('diff','--name-only',base).decode().splitlines())|set(git('ls-files','--others','--exclude-standard').decode().splitlines())
 paths.update(str(p.relative_to(R))for p in(R/D).rglob('*')if p.is_file())
 return paths-bootstrap
scope=live_scope();initial_repo_scope=set(scope)
expected_bindings={x['path']:x for x in M['currentBindings']}
if scope!=set(expected_bindings):problems.append({'kind':'current_binding_domain_differs','addedPaths':sorted(scope-set(expected_bindings)),'missingPaths':sorted(set(expected_bindings)-scope)})
for name,row in expected_bindings.items():
 f=R/name
 if not f.is_file()or sha(f.read_bytes())!=row['sha256']:problems.append({'kind':'current_binding_raw_mismatch','path':name})
# No historical branch is fetched. Only this explicitly hashed local bundle is opened.
history_temp=tempfile.TemporaryDirectory(prefix='w1-local-history-')
history_dir=Path(history_temp.name)/'objects.git'
history=M['historicalGit'];bundle=roots[history['root']]/history['path']
if not bundle.is_file()or sha(bundle.read_bytes())!=history['sha256']:raise SystemExit('Historical Git bundle SHA mismatch')
subprocess.run(['git','init','--bare','-q',str(history_dir)],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
objects=git('rev-parse','--path-format=absolute','--git-path','objects').decode().strip()
(history_dir/'objects/info/alternates').write_text(objects+'\n')
verified=subprocess.run(['git','bundle','verify',str(bundle)],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
if verified.returncode:raise SystemExit('Local history bundle prerequisite verification failed')
unpacked=subprocess.run(['git','--git-dir='+str(history_dir),'bundle','unbundle',str(bundle)],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
if unpacked.returncode:raise SystemExit('Local history bundle could not be read')
def history_git(*cmd):
 q=subprocess.run(['git','--git-dir='+str(history_dir),*cmd],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
 return None if q.returncode else q.stdout

physical={};raw_index=collections.defaultdict(list);value_index=collections.defaultdict(list);suffix=collections.defaultdict(list);payload={};archives=[];archive_documents=[];document_origins=[]
def portable(value):
 if not isinstance(value,str)or not value.startswith('/'):return value
 # Immutable source literals are represented consistently across caller roots.
 # The exact original spelling remains available in the hashed original record.
 return '@immutable-source-literal:'+sha(value.encode())
def add(root,path,data,**extra):
 key=(root,path)
 if key in physical:return physical[key]
 digest=sha(data);same=[x for x in raw_index.get(digest,[])if(x['root'],x['path'])in payload]
 if same:
  previous=payload[(same[0]['root'],same[0]['path'])]
  if previous!=data:raise RuntimeError('Equal digest has different actual bytes')
  data=previous
 info={'root':root,'path':path,'sha256':digest,'bytes':len(data),**extra};physical[key]=info;payload[key]=data;raw_index[info['sha256']].append(info)
 names=[path,extra.get('declaredOriginalPath','')]
 for name in names:
  parts=PurePosixPath(name).parts
  for start in range(len(parts)):suffix['/'.join(parts[start:])].append(info)
 if EXT.search(path) and path.lower().endswith(('.json','.jsonl'))and '/inventory/snapshot-'not in path:
  try:
   v=parse(data,path);value_index[sha(stable(v))].append(info)
   if isinstance(v,dict):
    for field0 in ['digest','resolutionFingerprint','manifestFingerprint']:
     d0=v.get(field0)
     if isinstance(d0,str)and HEX.fullmatch(d0)and sha(stable({k:x for k,x in v.items()if k!=field0}))==d0.removeprefix('sha256:'):value_index[d0.removeprefix('sha256:')].append(info)
  except (ValueError,UnicodeDecodeError):pass
 return info
def parse(data,path):
 return [json.loads(line) if line.strip() else None for line in data.splitlines()] if path.endswith('.jsonl') else json.loads(data)
def fileinfo(alias,path):
 # Current bootstrap metadata is checked against Git below, never a table input.
 if alias=='repo'and path in bootstrap:return None
 if (alias,path)in physical:return physical[(alias,path)]
 if alias not in roots:return None
 p=(roots[alias]/path).resolve()
 if not p.is_relative_to(roots[alias]) or not p.is_file():return None
 return add(alias,path,p.read_bytes())
bootstrap_sources=[fileinfo('repo',x['path'])for x in M['verificationSources']]
if any(info is None for info in bootstrap_sources):raise RuntimeError('Missing inventory bootstrap source')
for rule in P.get('additionalRepositoryInputs',[]):
 info=fileinfo('repo',rule['path'])
 if not info or info['sha256']!=rule['sha256']:problems.append({'kind':'UNVERIFIED_named_repository_input','path':rule['path'],'expectedSha256':rule['sha256']})
for path in sorted(scope):
 info=fileinfo('repo',path)
 if info and path.endswith(('.json','.jsonl')):document_origins.append(info)
external_domains={}
for alias,root in sorted(roots.items()):
 if alias=='repo'or not P['externalRoots'][alias].get('enumerateAll',True):continue
 external_domains[alias]=set()
 for p in sorted(root.rglob('*')):
  if p.is_file()and not(alias=='taskWScratch'and p.name.startswith('inventory-')):
   relative=str(p.relative_to(root))
   if fileinfo(alias,relative):external_domains[alias].add(relative)
for rule in P.get('explicitExternalInputs',[]):
 info=fileinfo(rule['root'],rule['path'])
 if not info or info['sha256']!=rule['sha256']:problems.append({'kind':'explicit_external_input_mismatch','root':rule['root'],'path':rule['path']})
for rule in P['archives']:
 info=fileinfo(rule['root'],rule['path']);idx=fileinfo(rule['root'],rule['indexPath'])
 if not info or not idx:problems.append({'kind':'UNVERIFIED_archive_or_index','root':rule['root'],'path':rule['path']});continue
 j=parse(payload[(idx['root'],idx['path'])],idx['path']);expected={x['path']:x for x in j['files']};wanted=j.get('sha256') or (j.get('archive',{}).get('sha256')if isinstance(j.get('archive'),dict)else None)
 if wanted and wanted.removeprefix('sha256:')!=info['sha256']:raise RuntimeError('Archive/index digest mismatch')
 seen=set()
 with tarfile.open(fileobj=io.BytesIO(payload[(info['root'],info['path'])]),mode='r:gz') as tf:
  for member in tf.getmembers():
   if not member.isfile():continue
   name=member.name;data=tf.extractfile(member).read();entry=expected.get(name)
   if entry is None or sha(data)!=entry['sha256'].removeprefix('sha256:'):raise RuntimeError('Archive member/index mismatch: '+name)
   seen.add(name);v=add(info['root'],rule['path']+'!/'+name,data,kind='exact_archive_member',containerPath=rule['path'],containerSha256=info['sha256'],declaredOriginalPath=name)
   if name.startswith(D+'/') and name.endswith(('.json','.jsonl')) and '/inventory/snapshot-'not in name:archive_documents.append(v)
 if seen!=set(expected):raise RuntimeError('Archive indexed-member domain mismatch')
 archives.append({'root':info['root'],'path':info['path'],'sha256':info['sha256'],'indexPath':idx['path'],'indexSha256':idx['sha256'],'verifiedMembers':len(seen)})
# Retained authoring epochs may themselves be members of the complete archive.
# Walk their actual tar bytes recursively, retaining each enclosing origin.
expanded={(x['root'],x['path'])for x in archives}
while True:
 pending=[x for x in physical.values()if x['path'].endswith('.tar.gz')and(x['root'],x['path'])not in expanded]
 if not pending:break
 for info in pending:
  expanded.add((info['root'],info['path']));seen=set()
  with tarfile.open(fileobj=io.BytesIO(payload[(info['root'],info['path'])]),mode='r:gz')as tf:
   for member in tf.getmembers():
    if not member.isfile():continue
    name=member.name
    if PurePosixPath(name).is_absolute()or'..'in PurePosixPath(name).parts or name in seen:raise RuntimeError('Invalid or duplicate nested archive member')
    seen.add(name);data=tf.extractfile(member).read()
    v=add(info['root'],info['path']+'!/'+name,data,kind='exact_archive_member',containerPath=info['path'],containerSha256=info['sha256'],declaredOriginalPath=name,archiveOrigin=info)
    if name.startswith(D+'/')and name.endswith(('.json','.jsonl'))and '/inventory/snapshot-'not in name:archive_documents.append(v)
  archives.append({'root':info['root'],'path':info['path'],'sha256':info['sha256'],'verifiedMembers':len(seen),'memberIndexClaimed':False,'method':'Read actual retained nested source-epoch tar bytes and hash every member'})
# The authorized external render index binds both compressed and raw bytes.
# Its operational absolute root is not reused: the caller supplies the actual
# named alias and this policy supplies the finite relative collection path.
decoded_containers=set()
for rule in P.get('externalGzipIndices',[]):
 index=fileinfo(rule.get('indexRoot','repo'),rule['indexPath'])
 if not index:problems.append({'kind':'UNVERIFIED_external_gzip_index','path':rule['indexPath']});continue
 value=parse(payload[(index['root'],index['path'])],rule['indexPath']);rows=value['rows']
 if value.get('externalRootAlias')!=rule['root']or value.get('relativePrefix')!=rule['prefix']:raise RuntimeError('External gzip index does not match the supplied portable collection alias')
 if len(rows)!=rule['expectedMembers']:raise RuntimeError('External gzip member domain mismatch')
 names=set();verified_rows=[]
 for row in rows:
  if PurePosixPath(row['rawName']).name!=row['rawName']or PurePosixPath(row['gzipPath']).name!=row['gzipPath']or row['rawName']in names:raise RuntimeError('Invalid external gzip member name')
  names.add(row['rawName']);container_path=rule['prefix']+'/'+row['gzipPath'];info=fileinfo(rule['root'],container_path)
  if not info:problems.append({'kind':'UNVERIFIED_external_gzip_member','root':rule['root'],'path':container_path});continue
  packed=payload[(info['root'],info['path'])]
  if info['sha256']!=row['gzipSha256']or len(packed)!=row['gzipBytes']:raise RuntimeError('External gzip container binding mismatch')
  if packed[4:8]!=b'\x00\x00\x00\x00':raise RuntimeError('External gzip timestamp is not reproducible')
  data=gzip.decompress(packed)
  if sha(data)!=row['rawSha256']or len(data)!=row['rawBytes']:raise RuntimeError('External gzip raw binding mismatch')
  original=rule['declaredFormerDirectory']+'/'+row['rawName'];isjson=row['rawName'].endswith(('.json','.jsonl'))
  decoded=add(info['root'],container_path+'!/'+row['rawName'],data,kind='exact_gzip_decoded_raw',encoding='gzip-json'if isjson else'gzip-raw',containerPath=container_path,containerSha256=info['sha256'],declaredOriginalPath=original,indexPath=rule['indexPath'],indexSha256=index['sha256'])
  decoded_containers.add((info['root'],info['path']))
  verified_rows.append(row)
  if isjson:archive_documents.append(decoded)
 archives.append({'root':rule['root'],'path':rule['prefix'],'kind':'indexed_external_gzip_collection','indexPath':rule['indexPath'],'indexSha256':index['sha256'],'verifiedMembers':len(verified_rows),'rawBytes':sum(x['rawBytes']for x in verified_rows),'compressedBytes':sum(x['gzipBytes']for x in verified_rows)})
for rule in P.get('explicitDecodedInputs',[]):
 info=fileinfo(rule['root'],rule['path'])
 if not info:continue
 data=gzip.decompress(payload[(info['root'],info['path'])])
 if sha(data)!=rule['decodedSha256']or len(data)!=rule['decodedBytes']:raise RuntimeError('Explicit gzip decoded body mismatch')
 original=rule.get('artifactPath',rule['path'][:-3])
 add(info['root'],info['path']+'!/'+PurePosixPath(original).name,data,kind='exact_gzip_decoded_raw',encoding='gzip-json'if original.endswith(('.json','.jsonl'))else'gzip-raw',containerPath=info['path'],containerSha256=info['sha256'],declaredOriginalPath=original)
 decoded_containers.add((info['root'],info['path']))
# Large external CLI diagnostics are verified losslessly as streams. They are
# raw diagnostic inputs, not dossier-authored decision records or native JSON
# value assertions. No duplicate half-gigabyte raw file/body is created.
for rule in P.get('streamedExternalGzipBodies',[]):
 manifest=fileinfo(rule['root'],rule['manifestPath'])
 if not manifest:problems.append({'kind':'UNVERIFIED_streamed_gzip_manifest','root':rule['root'],'path':rule['manifestPath']});continue
 value=parse(payload[(manifest['root'],manifest['path'])],manifest['path'])
 if value['root']!=rule['root']or value['path']!=rule['path']:raise RuntimeError('Streamed gzip manifest collection differs')
 info=fileinfo(rule['root'],rule['path'])
 if not info:problems.append({'kind':'UNVERIFIED_streamed_gzip_body','root':rule['root'],'path':rule['path']});continue
 packed=payload[(info['root'],info['path'])]
 if info['sha256']!=value['gzipSha256']or len(packed)!=value['gzipBytes']:raise RuntimeError('Streamed gzip container differs')
 h=hashlib.sha256();size=0
 with gzip.GzipFile(fileobj=io.BytesIO(packed))as stream:
  while chunk:=stream.read(8*1024*1024):h.update(chunk);size+=len(chunk)
 if h.hexdigest()!=value['rawSha256']or size!=value['rawBytes']:raise RuntimeError('Streamed gzip raw bytes differ')
 path=info['path']+'!/'+value['rawName'];origin={'root':info['root'],'path':path,'sha256':h.hexdigest(),'bytes':size,'kind':'exact_streamed_gzip_decoded_raw','encoding':'gzip-streamed','containerPath':info['path'],'containerSha256':info['sha256'],'declaredOriginalPath':value['sourceScratchPath'],'declaredFormerRoot':rule['formerRoot'],'manifestPath':manifest['path'],'manifestSha256':manifest['sha256'],'nativeJsonValueAssertion':False}
 physical[(origin['root'],path)]=origin;raw_index[origin['sha256']].append(origin)
 for start in range(len(PurePosixPath(origin['declaredOriginalPath']).parts)):suffix['/'.join(PurePosixPath(origin['declaredOriginalPath']).parts[start:])].append(origin)
 decoded_containers.add((info['root'],info['path']));document_origins.append(manifest)
 archives.append({'root':info['root'],'path':info['path'],'kind':'indexed_streamed_external_gzip_body','manifestPath':manifest['path'],'manifestSha256':manifest['sha256'],'rawSha256':origin['sha256'],'rawBytes':size,'compressedBytes':len(packed),'verification':'All decoded bytes streamed through SHA256 and counted; no raw duplicate or authored-decision/native-value claim'})
# Compressed raw JSON bodies are measured separately from their containers.
for info in list(physical.values()):
 if info['path'].endswith(('.json.gz','.jsonl.gz')) and 'containerPath' not in info and(info['root'],info['path'])not in decoded_containers:
  data=gzip.decompress(payload[(info['root'],info['path'])]);original=info['path'][:-3]
  decoded=add(info['root'],info['path']+'!/'+PurePosixPath(original).name,data,kind='exact_gzip_decoded_raw',encoding='gzip-json',containerPath=info['path'],containerSha256=info['sha256'],declaredOriginalPath=original)
  if original.startswith(D+'/'):archive_documents.append(decoded)
for row in P['externalDocuments']:
 info=fileinfo(row['root'],row['path'])
 if info:document_origins.append({**info,'declaredOriginalPath':row['declaredOriginalPath']})
 else:problems.append({'kind':'UNVERIFIED_named_external_document','root':row['root'],'path':row['path']})
# Do not omit archived earlier record values merely because their operational path was reused.
seen_docs={(x.get('declaredOriginalPath',x['path']),x['sha256']) for x in document_origins}
for info in archive_documents:
 key=(info['declaredOriginalPath'],info['sha256'])
 if key not in seen_docs:document_origins.append(info);seen_docs.add(key)
def pointer(parts):return ''.join('/'+str(x).replace('~','~0').replace('/','~1') for x in parts)
def leaves(v,parts=(),ancestors=()):
 if isinstance(v,dict):
  for k,x in v.items():yield from leaves(x,parts+(k,),ancestors+(v,))
 elif isinstance(v,list):
  for n,x in enumerate(v):yield from leaves(x,parts+(n,),ancestors+(v,))
 elif isinstance(v,str):yield parts,v,ancestors
native=set(P['scopeValueFields']);bindings=[];digests=[];pathuses=[];baseline_cache={};git_cache={}
def candidates(record,text):
 out=[]
 if text.startswith('/assets/'):out0=fileinfo('repo','app/public'+text);out.extend([out0]if out0 else [])
 if not text.startswith('/'):
  parent=PurePosixPath(record.get('declaredOriginalPath',record['path'])).parent
  while True:
   q=str(parent/text);f=fileinfo('repo',q)
   if f and f not in out:out.append(f)
   if str(parent)=='.':break
   parent=parent.parent
 for item in suffix.get(text.lstrip('/'),[]):
  if item not in out:out.append(item)
 return out
def declared(parent,field):
 if field in native or field.endswith(('Fingerprint','ValueSha256')):return None
 if field=='rawSha256'and isinstance(parent.get('rawName'),str):return parent['rawName']
 if EXT.search(field):return field
 for suffix0 in ('RawSha256','Sha256','RawDigest','Digest'):
  if field.endswith(suffix0):
   prefix=field[:-len(suffix0)]
   for k in (prefix+'Path',prefix+'File',prefix):
    if isinstance(parent.get(k),str) and EXT.search(parent[k]):return parent[k]
 if field in {'sha256','digest','rawSha256','gzipSha256','sha','hash','assetSha256','beforeSha256','afterSha256'}:
  for k in ['path','file','externalPath','canonicalPath','canonicalAssetPath','assetPath','publicAssetPath','sourcePath','formerPath','parkedPath',*(['rawName']if field=='rawSha256'else[])]:
   if isinstance(parent.get(k),str):return parent[k]
 return None
def prior(path,expected):
 if path.startswith('/')or not EXT.search(path):return None
 for rev in [*P.get('preferredHistoricalCommits',[]),base,P['inspectedMergedBase'],*commits]:
  key=(rev,path)
  if key not in git_cache:git_cache[key]=history_git('show',rev+':'+path)
  data=git_cache[key]
  if data is not None and sha(data)==expected:return {'kind':'historical_git_raw','gitStore':'verified_local_bundle','commit':rev,'path':path,'sha256':expected,'bytes':len(data)}
 return None
for record in document_origins:
 try:value=parse(payload[(record['root'],record['path'])],record.get('declaredOriginalPath',record['path']))
 except (ValueError,UnicodeDecodeError):continue
 for parts,text,ancestors in leaves(value):
  ptr=pointer(parts);field=str(parts[-1])if parts else'';parent=ancestors[-1]if ancestors else{};m=HEX.fullmatch(text)
  originlabel={'recordRoot':record['root'],'record':record['path'],'recordSha256':record['sha256'],'pointer':ptr}
  if not m:
   if text.startswith(('curricula/','app/','backend/','scripts/','docs/','contracts/','/assets/')) and EXT.search(text):
    loc=candidates(record,text);pathuses.append({**originlabel,'declaredPath':portable(text),'status':'located'if loc else'not_currently_located','origins':loc[:4],'expectedRawHashAsserted':False})
   continue
  expected=m.group(1).lower();d=declared(parent,field);row={**originlabel,'sha256':expected,'field':field}
  if d:
   loc=candidates(record,d);exact=[x for x in loc if x['sha256']==expected];raw=exact or raw_index.get(expected,[]);vals=[x for x in loc if x in value_index.get(expected,[])];historical=None if raw or vals else prior(d,expected)
   if raw:row.update(contract='raw_path_binding'if exact else'recovered_exact_raw_path_binding',declaredPath=portable(d),origin=raw[0],originalOperationalLocationAsserted=bool(exact and exact[0]['root']=='repo'and'containerPath'not in exact[0]))
   elif vals:row.update(contract='parsed_json_value_path_binding',declaredPath=portable(d),origin=vals[0],nativeFunctionVerified=False)
   elif value_index.get(expected):row.update(contract='recovered_parsed_json_value_binding',declaredPath=portable(d),origin=value_index[expected][0],nativeFunctionVerified=False)
   elif historical:row.update(contract='historical_raw_path_binding',declaredPath=portable(d),origin=historical)
   else:row.update(contract='UNVERIFIED_declared_binding',declaredPath=portable(d),candidateLocations=len(loc));problems.append(row.copy())
   bindings.append(row.copy())
  elif field in native or field.endswith(('Fingerprint','ValueSha256')):row.update(contract='native_scoped_value',rawFileAssertion=False,nativeFunctionVerified=False)
  elif raw_index.get(expected):row.update(contract='measured_raw_content_digest',origin=raw_index[expected][0],originalOperationalLocationAsserted=False)
  else:row.update(contract='recorded_scoped_or_unresolved_value',rawFileAssertion=False,currentReproductionClaim=False)
  digests.append(row)
# Non-JSON source literals retain a separate weaker contract; no path association is invented.
text_docs=[i for i in physical.values()if i.get('declaredOriginalPath',i['path']).startswith(D+'/')and not i['path'].endswith(('.json','.jsonl'))and EXT.search(i['path'])]
for record in text_docs:
 try:text=payload[(record['root'],record['path'])].decode('utf-8')
 except UnicodeDecodeError:continue
 for number,line in enumerate(text.splitlines(),1):
  loclabel={'recordRoot':record['root'],'record':record['path'],'recordSha256':record['sha256'],'pointer':'line:'+str(number)}
  for m0 in re.finditer(r'(?<![a-fA-F0-9])(?:sha256:)?([a-fA-F0-9]{64})(?![a-fA-F0-9])',line):
   h0=m0.group(1).lower();r0={**loclabel,'sha256':h0,'contract':'text_literal_digest','rawPathAssertion':False}
   if raw_index.get(h0):r0.update(contract='measured_text_raw_content_digest',origin=raw_index[h0][0],originalOperationalLocationAsserted=False)
   digests.append(r0)
  for m0 in re.finditer(r'(?:curricula|app|backend|scripts|docs|contracts|tmp)/[^\s`<>\]\)"\x27]+',line):
   path0=m0.group().rstrip('.,;:');path0=path0.split('#',1)[0]
   if EXT.search(path0):
    loc=candidates(record,path0);pathuses.append({**loclabel,'declaredPath':portable(path0),'status':'located'if loc else'not_currently_located','origins':loc[:4],'expectedRawHashAsserted':False})
native_result={'requested':args.native,'status':'not_requested'}
if args.native:
 with tempfile.TemporaryDirectory(prefix='w1-inventory-native-')as temporary:
  table=Path(temporary)/'bindings.jsonl';table.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n'for x in bindings))
  p=subprocess.run([str(R/'app/node_modules/.bin/tsx'),str(HERE/'native-values.mts'),str(R),str(table),json.dumps({**{k:str(v)for k,v in roots.items()},'_historicalGit':str(history_dir)})],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  if p.returncode:problems.append({'kind':'native_value_integrity_failed','exitCode':p.returncode,'stderrUtf8Sha256':sha(p.stderr)});native_result={'requested':True,'status':'FAIL','exitCode':p.returncode}
  else:
   native_result={'requested':True,**json.loads(p.stdout)}
   for row in bindings+digests:
    if row.get('contract')in{'parsed_json_value_path_binding','recovered_parsed_json_value_binding'}:row['nativeFunctionVerified']=True
records=[]
for path in sorted(scope):
 info=fileinfo('repo',path);rec={'path':path,'present':info is not None,'role':expected_bindings.get(path,{}).get('role','unlisted'),'lifecycle':'current_file','currentApprovalClaim':False}
 if info:rec.update(sha256=info['sha256'],bytes=info['bytes'])
 relative=path.removeprefix(D+'/')
 explicit=P.get('earlierRecords',{}).get(relative)
 if explicit:rec.update(lifecycle='earlier_candidate_state',meaning=explicit['meaning'],successorPath=D+'/'+explicit['successor'])
 for rule in ([]if explicit else P['lifecycleRules']):
  if relative.startswith(rule['prefix']):rec.update(lifecycle=rule['lifecycle'],meaning=rule['meaning'],**({'successorPath':D+'/'+rule['successor']}if rule['successor']else{}));break
 if '__pycache__'in PurePosixPath(path).parts or path.endswith('.pyc'):rec.update(lifecycle='transient_local_derivative')
 records.append(rec)
# Every input is rehashed; a concurrent writer prevents a sealed result.
for info in list(physical.values()):
 if 'containerPath'in info:continue
 p=roots[info['root']]/info['path']
 if not p.is_file()or sha(p.read_bytes())!=info['sha256']:problems.append({'kind':'input_changed_during_measurement','root':info['root'],'path':info['path']})
for alias,expected in external_domains.items():
 root=roots[alias]
 actual={str(p.relative_to(root))for p in root.rglob('*')if p.is_file()and p.resolve().is_relative_to(root)and not(alias=='taskWScratch'and p.name.startswith('inventory-'))}
 if actual!=expected:problems.append({'kind':'external_input_domain_changed_during_measurement','root':alias,'addedPaths':sorted(actual-expected),'removedPaths':sorted(expected-actual)})
current_repo_scope=live_scope()
if current_repo_scope!=initial_repo_scope:problems.append({'kind':'repository_input_domain_changed_during_measurement'})
for name in sorted(set(expected_bindings)|bootstrap):
 current=(R/name).read_bytes()if(R/name).is_file()else None
 if args.index:
  staged=git('show',':'+name,optional=True)
  if staged!=current:problems.append({'kind':'index_byte_mismatch','path':name})
 if args.anchor:
  committed=git('show',anchor+':'+name,optional=True)
  if committed!=current:problems.append({'kind':'anchored_byte_mismatch','path':name})
# Explicit private-workspace spellings are rejected in current committed metadata.
private_parts=[(['home'],True),(['mnt','d'],True),(['tmp','skillpilot'],False)]
separators=[bytes([47]),bytes([126,49]),bytes([92,47]),bytes([37,50,70])]
workspace=re.compile(b'|'.join(re.escape(separator+separator.join(x.encode()for x in parts)+(separator if trailing else b''))for separator in separators for parts,trailing in private_parts),re.I)
for name in sorted(set(expected_bindings)|bootstrap):
 if name.startswith(D+'/')and(R/name).is_file()and name.endswith(('.md','.json','.jsonl','.py','.mts','.ts')):
  if workspace.search((R/name).read_bytes()):problems.append({'kind':'current_workspace_literal','path':name})
# Never republish account/workspace path literals from immutable records or errors.
outputs={'files':records,'path-bindings':bindings,'digest-contracts':digests,'path-uses':pathuses}
summary={'schemaVersion':1,'contract':'W1-independent-evidence-lifecycle-inventory-v1','baselineCommit':base,'historicalEvidenceBase':P['inspectedMergedBase'],'domainMode':'finite_delivery_source_snapshot','counts':{'changedFiles':len(records),'physicalOrigins':len(physical),'parsedRecordVersions':len(document_origins),'pathHashBindings':len(bindings),'digestLeaves':len(digests),'pathUsesWithoutHash':len(pathuses),'pathUsesNotLocatedWithoutExpectedHash':sum(x['status']=='not_currently_located'for x in pathuses),'unverified':len(problems)},'archives':archives,'externalRoots':[{'alias':k,'suppliedAndPresent':k in roots and roots[k].is_dir(),'required':v['required']}for k,v in P['externalRoots'].items()],'status':'PASS'if not problems else'UNSEALED','nativeSourceValueVerification':native_result,'problems':problems,'boundaries':P['boundaries'],'bootstrapPaths':sorted(bootstrap),'verificationSourceBindings':bootstrap_sources,'sourceFiles':list(physical.values())}
def jsonl(rows):return ''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n'for x in rows)
rendered={key+'.jsonl':jsonl(rows).encode()for key,rows in outputs.items()}
rendered['summary.json']=(json.dumps(summary,ensure_ascii=False,indent=2)+'\n').encode()
if args.rebuild_tables:
 output=args.rebuild_tables.resolve()
 if output.is_relative_to(R):raise SystemExit('Full inventory output must be outside the repository')
 if problems:raise SystemExit('Unverified inputs: refusing full table capture')
 output.mkdir(parents=True,exist_ok=True)
 descriptors=[]
 for name,data in rendered.items():
  dest=output/name
  if dest.exists()and dest.read_bytes()!=data:raise SystemExit('External full table is immutable; choose a new output directory')
  dest.write_bytes(data);descriptors.append({'path':name,'sha256':sha(data),'bytes':len(data)})
 index={'schemaVersion':1,'contract':'W1-external-rebuilt-full-inventory-v1','baseCommit':base,'files':descriptors}
 target=output/'table-index.json';body=(json.dumps(index,ensure_ascii=False,indent=2)+'\n').encode()
 if target.exists()and target.read_bytes()!=body:raise SystemExit('External table index is immutable')
 target.write_bytes(body)
if args.expected_table_index:
 expected_path=args.expected_table_index.resolve();expected_raw=expected_path.read_bytes()
 if M.get('expectedTableIndex')and sha(expected_raw)!=M['expectedTableIndex']['sha256']:raise SystemExit('External table index SHA differs from compact manifest')
 expected=json.loads(expected_raw)
 if expected['baseCommit']!=base or {x['path']for x in expected['files']}!=set(rendered):raise SystemExit('External table domain mismatch')
 for entry in expected['files']:
  data=rendered[entry['path']];stored=(expected_path.parent/entry['path']).read_bytes()
  if sha(data)!=entry['sha256']or len(data)!=entry['bytes']or stored!=data:raise SystemExit('External rebuilt table differs: '+entry['path'])
print(json.dumps({'status':'PASS'if not problems else'UNSEALED','counts':summary['counts'],'native':native_result,'baseCommit':base,'historySource':'verified_local_bundle','anchor':anchor if args.anchor else None,'indexChecked':args.index,'problems':problems[:args.problem_limit]},ensure_ascii=False,indent=2))
history_temp.cleanup()
sys.exit(0 if not problems else 1)
