"""Apply only a separately prepared, hash-guarded portable Chemistry payload.

Default is read-only verification. --apply is a separate, explicit owner action.
No git staging/commit, generation, validation gates, publication or learner writes.
"""
from pathlib import Path
import argparse,base64,hashlib,json,os,stat,subprocess,tempfile,datetime

O=Path(__file__).resolve().parent
def digest(path):
 h=hashlib.sha256()
 with path.open('rb') as stream:
  for chunk in iter(lambda:stream.read(4*1024*1024),b''):h.update(chunk)
 return h.hexdigest()
def pin(path):return {'sha256':digest(path),'bytes':path.stat().st_size}
def within(root,path):
 try:path.resolve().relative_to(root.resolve());return True
 except ValueError:return False
def git(root,*args):return subprocess.run(['git','--no-optional-locks',*args],cwd=root,capture_output=True,text=True,check=True).stdout
def check_main_path(root,entry):
 target=root/entry['logicalPath'];expected=entry['mainBefore']
 for parent in target.parents:
  if parent==root:break
  if parent.is_symlink():
   raise AssertionError('A changed-file ancestor is a symlink; never write through it: '+str(parent))
 if expected['kind']=='absent':assert not target.exists() and not target.is_symlink(),str(target)
 else:
  assert target.is_file(),str(target)
  assert pin(target)=={key:expected[key] for key in ['sha256','bytes']},str(target)
  assert target.is_symlink()==expected['isSymlink'],str(target)
  if expected['isSymlink']:assert os.readlink(target)==expected['linkTarget'],str(target)
 return target

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--manifest',default=str(O/'MANIFEST.current439-portable-apply-plan.historical-source-successor-v2.json'))
 parser.add_argument('--repo',default='/home/enpasos/projects/skillpilot')
 parser.add_argument('--apply',action='store_true')
 args=parser.parse_args();mp=Path(args.manifest);manifest=json.loads(mp.read_text());root=Path(args.repo).resolve()
 assert root==Path(manifest['mainRoot']).resolve()
 assert git(root,'rev-parse','HEAD').strip()==manifest['mainHEAD']
 assert git(root,'status','--porcelain=v1','--untracked-files=no')==manifest['mainGitStatusBefore']
 if 'mainGitFullStatusBefore' in manifest:
  full_status=subprocess.run(['git','--no-optional-locks','status','--porcelain=v1','-z','--untracked-files=all'],cwd=root,capture_output=True,check=True).stdout
  assert full_status==base64.b64decode(manifest['mainGitFullStatusBefore']['base64'])
 for item in manifest['protectedMainCanonicalFiles']:
  assert pin(root/item['logicalPath'])=={key:item[key] for key in ['sha256','bytes']},item['logicalPath']
 for entry in manifest['files']:
  assert entry['gitMode'] in {0o644,0o755}
  assert not Path(entry['logicalPath']).is_absolute() and '..' not in Path(entry['logicalPath']).parts
  p=root/entry['logicalPath'];expected={'sha256':entry['sha256'],'bytes':entry['bytes']}
  for parent in p.parents:
   if parent==root:break
   if parent.is_symlink():assert not os.path.isabs(os.readlink(parent)) and within(root,parent),str(parent)
  if entry['action']=='reuse-existing-main-byte-exact':
   assert p.is_file() and pin(p)==expected,str(p)
   if p.is_symlink():
    assert not os.path.isabs(os.readlink(p)) and within(root,p),str(p)
  else:
   assert not Path(entry['payloadRelativePath']).is_absolute() and '..' not in Path(entry['payloadRelativePath']).parts
   payload=O/entry['payloadRelativePath'];assert within(O,payload) and payload.is_file() and not payload.is_symlink()
   assert pin(payload)==expected,str(payload);check_main_path(root,entry)
 assert manifest['historicalScientificBytesRewritten'] is False
 if not args.apply:
  print(json.dumps({'mode':'read-only-preflight','fileCount':len(manifest['files']),'writeCount':manifest['changedFileCount'],'mainMutated':False,'ownerPrerequisites':manifest['ownerPrerequisites']}));return
 assert digest(mp)!='39d5c9e6ee89ac2e85174b3aef1ed54a70119ad3f6b6156e114968e48d938669','Superseded unsafe plan: two historical source files would be overwritten; use the separately prepared successor plan.'
 assert not manifest['blockingApplyPrerequisites'],'Owner must resolve explicit manifest prerequisites before applying.'
 changed=[]
 # Activation is last, after exact dependent files exist. No other files are touched.
 ordered=sorted((e for e in manifest['files'] if e['action']!='reuse-existing-main-byte-exact'),key=lambda e:(e.get('activationFile',False),e['logicalPath']))
 for entry in ordered:
  target=check_main_path(root,entry);target.parent.mkdir(parents=True,exist_ok=True)
  assert within(root,target.parent)
  payload=O/entry['payloadRelativePath']
  fd,tmp=tempfile.mkstemp(prefix='.chemistry-portable-',dir=target.parent)
  try:
   with os.fdopen(fd,'wb') as out,payload.open('rb') as source:
    for chunk in iter(lambda:source.read(4*1024*1024),b''):out.write(chunk)
    out.flush();os.fsync(out.fileno())
   os.chmod(tmp,entry['gitMode']);os.replace(tmp,target)
  finally:
   if os.path.exists(tmp):os.unlink(tmp)
  assert pin(target)=={'sha256':entry['sha256'],'bytes':entry['bytes']}
  changed.append(entry['logicalPath'])
 for entry in manifest['files']:assert pin(root/entry['logicalPath'])=={'sha256':entry['sha256'],'bytes':entry['bytes']},entry['logicalPath']
 for item in manifest['protectedMainCanonicalFiles']:
  assert pin(root/item['logicalPath'])=={key:item[key] for key in ['sha256','bytes']},item['logicalPath']
 receipt={'role':'Actual explicit owner execution of prepared Chemistry file plan; no gates/commit/publication','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'manifestSha256':digest(mp),'changedPaths':changed,'allTargetBytesExact':True,'gitStatusAfter':git(root,'status','--porcelain=v1','--untracked-files=no'),'gatesRun':False,'gitCommitOrPush':False,'learnerStateChanged':False}
 out=O/('RECEIPT.actual-main-apply-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'.json');out.write_text(json.dumps(receipt,indent=2)+'\n')
 print(json.dumps({'mode':'apply','receipt':str(out),'sha256':digest(out),'changedFileCount':len(changed)}))
if __name__=='__main__':main()
