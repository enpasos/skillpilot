// Independent reviewer invocation of current reader functions and KaTeX.
// Writes only in this private review directory.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.cwd(),out=dirname(fileURLToPath(import.meta.url));
const require=createRequire(resolve(root,'app/package.json'));
const ts=require('typescript'),katex=require('katex');
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const input=load(resolve(out,'input-verification.actual.json'));
function reader(rel){
 const p=resolve(root,rel),source=readFileSync(p,'utf8');
 const ast=ts.createSourceFile(p,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const names=new Set(['normalizeText','stableJson','getSemanticPayload','fingerprintGoal']);
 const functions=ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.has(n.name?.text));
 assert(functions.some(n=>n.name.text==='fingerprintGoal'));
 const transpiled=ts.transpileModule(functions.map(n=>n.getFullText(ast)).join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 return {fingerprint:new Function('createHash',transpiled+'\nreturn fingerprintGoal;')(createHash),sourceSha256:hash(p),path:rel};
}
const lanes=[['A','semantic-atomicity','app/scripts/semanticAtomicityReview.ts'],['M','memory-card-review','app/scripts/memoryCardReview.ts']];
const rows=[];const rendering=[];
for(const [lane,dir,readerPath] of lanes){
 const r=reader(readerPath),configPath=`curricula/DE/Gymnasium/quality/${dir}/canonical-math-full.config.json`;
 const cfg=load(resolve(root,configPath));
 const raw=readFileSync(resolve(root,cfg.reviewPath),'utf8').split(/\r?\n/).filter(Boolean);
 assert.equal(raw.length,807);
 for(const f of input.forms){
  const line=raw.findIndex(x=>JSON.parse(x).goalId===f.goalId);assert(line>=0);
  const record=JSON.parse(raw[line]);const before=r.fingerprint(f.before,cfg.ruleVersion),after=r.fingerprint(f.after,cfg.ruleVersion);
  assert.equal(record.fingerprint,before);assert.notEqual(after,before);
  const revert={...f.after};delete revert.nodeKind;assert.equal(r.fingerprint(revert,cfg.ruleVersion),before);
  rows.push({lane,goalId:f.goalId,lineNumber:line+1,config:{path:configPath,sha256:hash(resolve(root,configPath))},originalReviewFile:{path:cfg.reviewPath,sha256:hash(resolve(root,cfg.reviewPath))},actualReader:{path:r.path,sha256:r.sourceSha256},originalRawLine:raw[line],originalWholeRow:record,beforeFingerprint:before,proposedFingerprint:after,onlyFingerprintFieldChanged:'nodeKind',wholeCurrentObjectSha256:f.wholeCurrentObjectSha256,wholeProposedObjectSha256:f.wholeProposedObjectSha256});
 }
}
for(const f of input.forms){
 const base=dirname(resolve(root,f.contractPath));
 for(const lang of ['de','en'])for(const name of ['task','solution','rubric']){
  const p=resolve(base,`${name}.${lang}.md`),source=readFileSync(p,'utf8');
  const re=/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g;let match,count=0;
  while((match=re.exec(source))!==null){
   katex.renderToString(match[1]??match[2],{displayMode:match[1]!==undefined,throwOnError:true,strict:'error',trust:false});count++;
  }
  assert.equal((source.replace(re,'').match(/\$/g)||[]).length,0,'unmatched dollar in '+p);
  rendering.push({path:relative(root,p),sha256:hash(p),expressions:count});
 }
}
const report={status:'PASS_ACTUAL_READER_BINDINGS_AND_KATEX',reviewerAgent:'/root/astra_six_math_whole_forms',checkedAtUTC:new Date().toISOString(),rows,katex:{version:katex.version,options:{throwOnError:true,strict:'error',trust:false},files:rendering,totalExpressions:rendering.reduce((a,x)=>a+x.expressions,0),errors:0},approvalNotDerivedFromThisTechnicalCheck:true,writes:'Private review directory only'};
writeFileSync(resolve(out,'reader-and-rendering.actual.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,registeredRows:rows.length,mathExpressions:report.katex.totalExpressions,sourceFiles:rendering.length}));
