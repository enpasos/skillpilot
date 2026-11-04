import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const repo=process.cwd(),H=dirname(fileURLToPath(import.meta.url));
const require=createRequire(resolve(repo,'app/package.json'));
const ts=require('typescript'),katex=require('katex');
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const packet=load(resolve(H,'whole-current-and-proposed-contracts.json'));
const current=load(resolve(repo,packet.canonicalPath));
const am=load(resolve(H,'registered-current-AM-context.json'));
function calcFromActualReader(path){
 const src=readFileSync(resolve(repo,path),'utf8');
 const ast=ts.createSourceFile(path,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const names=new Set(['normalizeText','stableJson','getSemanticPayload','fingerprintGoal']);
 const funcs=ast.statements.filter(s=>ts.isFunctionDeclaration(s)&&names.has(s.name?.text));
 const code=ts.transpileModule(funcs.map(s=>s.getFullText(ast)).join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 return new Function('createHash',`${code}\nreturn fingerprintGoal;`)(createHash);
}
const bindingRows=[],formRows=[];let equations=0;
for(const f of packet.forms){
 const orig=f.wholeCurrentGoal,prop=f.wholeProposedGoal;
 assert.deepEqual(current.goals.find(g=>g.id===f.goalId),orig,'finite original goal changed');
 assert.deepEqual(Object.keys(prop).filter(k=>JSON.stringify(prop[k])!==JSON.stringify(orig[k])).sort(),['examData','nodeKind']);
 assert.equal(prop.nodeKind,'exam');assert.deepEqual(prop.examData.coveredGoalIds,[f.goalId]);
 assert.equal(prop.examData.scoring.maxPoints,20);assert.equal(prop.examData.scoring.passingPoints,15);
 assert.equal(prop.examData.scoring.steps.reduce((a,s)=>a+s.points,0),20);
 assert.equal(prop.examData.reviewStatus,'draft');
 const e=load(resolve(H,f.goalId,'reviewed-execution-contract.json'));assert.deepEqual(e,prop.examData);
 for(const [loc,suffix] of [['de',''],['en','En']]){
  const task=readFileSync(resolve(H,f.goalId,`task.${loc}.md`),'utf8');
  const sol=readFileSync(resolve(H,f.goalId,`solution.${loc}.md`),'utf8');
  const rub=readFileSync(resolve(H,f.goalId,`rubric.${loc}.md`),'utf8');
  assert.equal(e[`taskContent${suffix}`],task);assert.equal(e[`solutionContent${suffix}`],sol+'\n'+rub);
  for(const [kind,text] of [['task',task],['solution',sol],['rubric',rub]]){
   const re=/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g;let m;
   while((m=re.exec(text))){katex.renderToString(m[1]??m[2],{displayMode:m[1]!==undefined,throwOnError:true,strict:'error',trust:false});equations++;}
   assert.equal((text.replace(re,'').match(/\$/g)||[]).length,0,`${kind}.${loc} unmatched math delimiter`);
  }
 }
 for(const [lane,reader] of [['semantic-atomicity','app/scripts/semanticAtomicityReview.ts'],['memory-card-review','app/scripts/memoryCardReview.ts']]){
  const cfg=load(resolve(repo,am[lane].configPath));
  const raw=readFileSync(resolve(repo,cfg.reviewPath),'utf8').split(/\r?\n/);
  const line=raw.findIndex(s=>{try{return JSON.parse(s).goalId===f.goalId}catch{return false}});
  const row=JSON.parse(raw[line]);const saved=am[lane].rows.find(r=>r.goalId===f.goalId);assert.deepEqual(row,saved);
  const calc=calcFromActualReader(reader),before=calc(orig,cfg.ruleVersion),after=calc(prop,cfg.ruleVersion);
  assert.equal(before,row.fingerprint);assert.notEqual(before,after);
  bindingRows.push({lane,goalId:f.goalId,configPath:am[lane].configPath,reviewPath:cfg.reviewPath,lineNumber:line+1,wholeCurrentRow:row,actualReader:reader,actualReaderSha256:sha(resolve(repo,reader)),beforeFingerprint:before,proposedFingerprint:after,semanticFieldChange:'nodeKind: empty -> exam; all original semantic fields unchanged',authorSemanticRecheckNeeded:true,independentApproval:false});
 }
 formRows.push({goalId:f.goalId,finiteOriginalObjectStillExact:true,changedFields:['nodeKind','examData'],bilingualArtifactEmbeddingExact:true,scoringTotal:20,passingTotal:15,onlyOwnIdCovered:true,originalMetadataAndPreparationUnchanged:true});
}
writeFileSync(resolve(H,'author-contract-AM-and-katex-check.json'),JSON.stringify({status:'AUTHOR_TECHNICAL_CHECKS_PASS_NOT_INDEPENDENT_APPROVAL',formRows,formulaRenderCount:equations,katexVersion:katex.version,katexOptions:{throwOnError:true,strict:'error',trust:false},amRows:bindingRows,noLedgerWrites:true},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',forms:formRows.length,currentAMRows:bindingRows.length,formulaRenderCount:equations}));
