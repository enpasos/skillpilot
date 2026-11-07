from pathlib import Path
import json,hashlib,os,tempfile,shutil,datetime,subprocess
w=Path(__file__).resolve().parent;d=json.loads((w/'preflight.json').read_bytes());root=Path(d['root']);sha=lambda b:hashlib.sha256(b).hexdigest()
r=json.loads((w/'normal-producer-result.json').read_bytes());assert r['exitCode']==0,'Producer failed: no host report transfer allowed'
assert all(sha((root/p).read_bytes())==digest for p,digest in d['protectedInputHashes'].items()),'Protected input changed'
assert all(sha((root/x['path']).read_bytes())==x['sha256'] for x in d['codePins']),'Frozen code changed'
assert sha((w/'chemistry-report.md').read_bytes())==d['outputsBefore'][d['chemistryReportPath']]['sha256'],'Chemistry QA report changed: retain RAM output for diagnosis'
status=w/'status'; prefix='docs/qa-ci/status/'
allowed={row['reportPath'] for row in d['activeMemoryConfigs'] if row['reportPath'].startswith(prefix)}|{prefix+'curriculum-quality-status.json',prefix+'curriculum-quality-status.md'}
changes=[]
for p in status.rglob('*'):
 if not p.is_file():continue
 local=prefix+p.relative_to(status).as_posix();new=p.read_bytes();old=d['outputsBefore'].get(local)
 if not old or sha(new)!=old['sha256']:
  assert local in allowed,'Unexpected report writer: '+local
  changes.append({'path':local,'beforeSha256':None if old is None else old['sha256'],'beforeBytes':None if old is None else old['bytes'],'afterSha256':sha(new),'afterBytes':len(new)})
for local,old in d['outputsBefore'].items():
 assert sha((root/local).read_bytes())==old['sha256'],'Host output changed independently before transfer: '+local
 if local.startswith(prefix):assert (status/local[len(prefix):]).is_file(),'Unexpected deleted status file'
report=json.loads((status/'curriculum-quality-status.json').read_bytes());assert len(report['curricula'])==21
# Retained old 22:41 artifacts are still available as their exact committed bytes.
originalCommit=subprocess.check_output(['git','--no-optional-locks','rev-parse','1a49bc24e7'],cwd=root).decode().strip();oldHistory=[]
for local in [prefix+'curriculum-quality-status.json',prefix+'curriculum-quality-status.md']:
 raw=subprocess.check_output(['git','--no-optional-locks','show',originalCommit+':'+local],cwd=root)
 oldHistory.append({'path':local,'commit':originalCommit,'sha256':sha(raw),'equalsBefore':sha(raw)==d['outputsBefore'][local]['sha256']})
 assert oldHistory[-1]['equalsBefore']
(w/'generated-deltas-before-transfer.json').write_text(json.dumps({'generatedAt':report.get('generatedAt'),'changes':changes,'oldHistory':oldHistory,'chemistryQaByteIdentical':True},indent=2)+'\n')
reserve=16*1024*1024
assert shutil.disk_usage(root).free>=max(row['afterBytes'] for row in changes)+reserve,'Insufficient root space for private atomic report replacement'
applied=[]
for row in changes:
 target=root/row['path'];new=status/row['path'][len(prefix):]
 assert sha(target.read_bytes())==row['beforeSha256']
 assert shutil.disk_usage(root).free>=row['afterBytes']+reserve
 handle,name=tempfile.mkstemp(prefix='.v54-cqr-output-',dir=target.parent)
 try:
  with os.fdopen(handle,'wb') as out:
   with new.open('rb') as source:shutil.copyfileobj(source,out)
   out.flush();os.fsync(out.fileno());os.fchmod(out.fileno(),0o644)
  assert sha(Path(name).read_bytes())==row['afterSha256']
  os.replace(name,target)
  directory=os.open(target.parent,os.O_RDONLY)
  try:os.fsync(directory)
  finally:os.close(directory)
 finally:
  if os.path.lexists(name):os.unlink(name)
 assert sha(target.read_bytes())==row['afterSha256'] and target.stat().st_mode&0o777==0o644
 applied.append(row['path'])
 assert target.stat().st_nlink==1
assert all(sha((root/p).read_bytes())==digest for p,digest in d['protectedInputHashes'].items())
assert all(sha((root/x['path']).read_bytes())==x['sha256'] for x in d['codePins'])
assert sha((root/d['chemistryReportPath']).read_bytes())==d['outputsBefore'][d['chemistryReportPath']]['sha256']
result={'transferredAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'generatedAt':report.get('generatedAt'),'changes':changes,'applied':applied,'oldHistory':oldHistory,'protectedInputCount':len(d['protectedInputHashes']),'protectedInputsUnchanged':True,'frozen20PinsUnchanged':True,'chemistryQaUnchanged':True,'privateOwnInodeAtomicReplacement':True,'reserveBytes':reserve,'rootFreeAfter':shutil.disk_usage(root).free}
(w/'transfer-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
