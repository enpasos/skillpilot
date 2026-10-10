import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig,expandGoalBookSourceAtlasReceipt} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookSourceAtlasInputs.ts';
const R='/home/enpasos/projects/skillpilot';
const O=path.join(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-shared-policy-foreign-atlas-binding-only-READONLY-v1');
fs.mkdirSync(O,{recursive:true});
const hash=(b:any)=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const meta=(p:string)=>fs.existsSync(path.join(R,p))?({path:p,sha256:hash(fs.readFileSync(path.join(R,p))),bytes:fs.statSync(path.join(R,p)).size}):({path:p,missingLocalPinnedInput:true});
function diff(a:any,b:any,p='',acc:any[]=[]):any[]{
 if(JSON.stringify(a)===JSON.stringify(b))return acc;
 if(a===null||b===null||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b)){acc.push({path:p,before:a,after:b});return acc;}
 const keys=new Set([...Object.keys(a),...Object.keys(b)]);for(const k of keys)diff(a[k],b[k],p+'/'+k,acc);return acc;
}
const books:any[]=[];
for(const configPath of ['app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json']){
 const config=readGoalBookSourceAtlasInputConfig(configPath,R);
 const beforeConfig=meta(configPath);
 const native=buildGoalBookSourceAtlasInputs(config,R);
 const changed:any[]=[];const same:any[]=[];
 for(const [p,expected] of Object.entries(native.outputs)){
  const old=fs.readFileSync(path.join(R,p),'utf8');
  if(old===expected){same.push({path:p,sha256:hash(old)});continue;}
  const before=JSON.parse(old);const after=JSON.parse(expected);
  const jsonDiff=diff(before,after);
  const expandedOld=p.endsWith('source-projection.receipt.json')?expandGoalBookSourceAtlasReceipt(before):before;
  const expandedNew=p.endsWith('source-projection.receipt.json')?expandGoalBookSourceAtlasReceipt(after):after;
  const readableDiff=diff(expandedOld,expandedNew);
  const resolved=readableDiff.map(d=>{
   const m=/^\/inputBindings\/(\d+)\//.exec(d.path);return {...d,...(m?{bindingPath:expandedNew.inputBindings[Number(m[1])]?.path}:{})};
  });
  const noBindings=(r:any)=>Object.fromEntries(Object.entries(r).filter(([k])=>k!=='inputBindings'));
  changed.push({path:p,beforeSha256:hash(old),afterSha256:hash(expected),jsonDifferences:jsonDiff,expandedDifferences:resolved,wholeExpandedReceiptExceptInputBindingsExact:JSON.stringify(noBindings(expandedOld))===JSON.stringify(noBindings(expandedNew))});
 }
 books.push({bookId:config.bookId,configBefore:beforeConfig,configAfter:meta(configPath),nativeCurrentCounts:native.receipt.counts,changedOutputs:changed,wholeUnchangedOutputs:same,actualCurrentBindingGuards:native.receipt.inputBindings.map(b=>({...b,actualMatchesCurrent:meta(b.path).missingLocalPinnedInput?'nativeOriginalSnapshotFallbackBinding':meta(b.path).sha256===b.sha256})),newSourceReview:native.receipt.claims.newSourceReview,newSemanticAtomicityReview:native.receipt.claims.newSemanticAtomicityReview});
}
const result={role:'READONLY_original_native_atlas_build_function_diff_only_no_publication_write',nativeModule:meta('app/scripts/goalBookSourceAtlasInputs.ts'),books,activeWrites:0,fullBookOrPDFBuilds:0,foreignScienceReviewClaim:false,method:'Original exported native buildGoalBookSourceAtlasInputs only; compare every generated output byte and losslessly expanded source receipt field against current files. Never calls write-generation or broad publication/build.'};
fs.writeFileSync(path.join(O,'actual-two-foreign-native-source-atlases-shared-policy-binding-only.READONLY.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(books.map(b=>({bookId:b.bookId,counts:b.nativeCurrentCounts,changed:b.changedOutputs.map((x:any)=>({path:x.path,diff:x.expandedDifferences,restExact:x.wholeExpandedReceiptExceptInputBindingsExact})),wholeExactOutputs:b.wholeUnchangedOutputs.length,allInputGuardMatches:b.actualCurrentBindingGuards.every((x:any)=>x.actualMatchesCurrent)})),null,2));
