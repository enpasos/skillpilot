const fs=require('fs'),os=require('os'),path=require('path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'skillpilot-copyfile-mode-'));
const source=path.join(dir,'source.bin'),target=path.join(dir,'target.bin');
try{
 fs.writeFileSync(source,'mode fixture');fs.chmodSync(source,0o444);
 fs.writeFileSync(target,'mode fixture');fs.chmodSync(target,0o644);
 const before=(fs.statSync(target).mode&0o777).toString(8);
 fs.copyFileSync(source,target);
 const after=(fs.statSync(target).mode&0o777).toString(8);
 if(before!=='644'||after!=='444')throw new Error('expected direct-copy mode reset was not reproduced');
 console.log(JSON.stringify({sourceMode:(fs.statSync(source).mode&0o777).toString(8),existingTargetModeBefore:before,existingTargetModeAfter:after,bugReproduced:true,productionFilesChanged:false}));
}finally{fs.rmSync(dir,{recursive:true,force:true});}
