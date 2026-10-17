from pathlib import Path
import os,shutil,hashlib,json,subprocess,datetime
src=Path('/home/enpasos/.gradle/wrapper/dists/gradle-9.7.1-bin');out=Path('/mnt/e/skillpilot-chemie-L7-20261017/relocated-unused-gradle-wrapper-9.7.1-20261017');dst=out/'cache';shadow=src.with_name(src.name+'.verified-relocation-original-shadow-20261017')
assert src.is_dir() and not src.is_symlink() and not out.exists() and not shadow.exists()
def unused():
 for proc in ['java','gradle']:
  p=subprocess.run(['pgrep','-a','-x',proc],capture_output=True,text=True);assert p.returncode==1 and not p.stdout
 p=subprocess.run(['lsof','+D',str(src)],capture_output=True,text=True);assert p.returncode==1 and not p.stdout

def manifest(root):
 rows=[]
 for cur,dirs,files in os.walk(root,followlinks=False):
  for name in sorted(dirs+files):
   p=Path(cur)/name;relative=str(p.relative_to(root))
   if p.is_symlink():rows.append({'path':relative,'kind':'symlink','target':os.readlink(p)})
   elif p.is_file():rows.append({'path':relative,'kind':'file','bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
   elif p.is_dir():rows.append({'path':relative,'kind':'directory'})
   else:raise RuntimeError(str(p))
 return sorted(rows,key=lambda r:r['path'])
unused();out.mkdir();before=manifest(src);(out/'MANIFEST.before.json').write_text(json.dumps(before,indent=2)+'\n');shutil.copytree(src,dst,symlinks=True,copy_function=shutil.copy2);after=manifest(dst);assert before==after;(out/'MANIFEST.byte-identical-copy.json').write_text(json.dumps(after,indent=2)+'\n');unused();src.rename(shadow)
try:
 src.symlink_to(dst,target_is_directory=True);assert manifest(src)==before
except BaseException:
 if src.is_symlink():src.unlink()
 shadow.rename(src);raise
assert manifest(shadow)==before;shutil.rmtree(shadow)
receipt={'role':'Byte-preserving relocation of independently checked unused rebuildable Gradle wrapper distribution cache; original lookup path remains usable through a directory symlink','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originalPath':str(src),'targetPath':str(dst),'entryCount':len(before),'regularFileBytes':sum(r.get('bytes',0) for r in before),'copyExactlyVerified':True,'originalPathSymlinkExactlyVerified':True,'activeJavaGradleProcessesBeforeAndAfterCopy':0,'openFilesBeforeAndAfterCopy':0,'verifiedTemporaryOriginalCacheRemovedOnlyAfterCopyAndLookupVerification':True,'repositoryContentPrivateLearnerDataPublishedArtifactsTouched':False}
p=out/'RECEIPT.verified-unused-wrapper-cache-relocation.json';p.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({**receipt,'receipt':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}),flush=True)
