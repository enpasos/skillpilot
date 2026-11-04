import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const repo=process.cwd();
const out=dirname(fileURLToPath(import.meta.url));
const base=dirname(out);
const load=p=>JSON.parse(readFileSync(resolve(repo,p),'utf8'));
const sha=p=>createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex');
const pin=p=>({path:relative(repo,resolve(repo,p)),sha256:sha(p)});
const ts=createRequire(resolve(repo,'app/package.json'))('typescript');
function readExactFingerprintFunction(path) {
  const source = readFileSync(resolve(repo, path), 'utf8');
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = new Set(['normalizeText', 'stableJson', 'getSemanticPayload', 'fingerprintGoal']);
  const parts = ast.statements.filter(s => ts.isFunctionDeclaration(s) && names.has(s.name?.text));
  assert(parts.some(s => s.name.text === 'fingerprintGoal'));
  const code = ts.transpileModule(parts.map(s => s.getFullText(ast)).join('\n'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  let payload;
  const captureHash = algorithm => {
    const hash = createHash(algorithm);
    const wrapper = {
      update(text) { payload = JSON.parse(text); hash.update(text); return wrapper; },
      digest(encoding) { return hash.digest(encoding); },
    };
    return wrapper;
  };
  const fingerprint = new Function('createHash', `${code}\nreturn fingerprintGoal;`)(captureHash);
  return (goal, rule) => {
    const result = fingerprint(goal, rule);
    return { fingerprint: result, semanticPayload: payload };
  };
}

const contracts=load(`${base}/whole-current-and-proposed-contracts.json`);
const context=load(`${base}/registered-sixteen-am-and-existing-log-memory-context.json`);
const rows=[];
for(const entry of context.rows){
 for(const p of [entry.config,entry.reviewFile])assert.equal(sha(p.path),p.sha256);
 const cfg=load(entry.config.path);
 assert.equal(cfg.reviewPath,entry.reviewFile.path);
 const raw=readFileSync(resolve(repo,cfg.reviewPath),'utf8').trimEnd().split(/\r?\n/);
 assert.equal(raw.length,807);
 assert.deepEqual(JSON.parse(raw[entry.lineNumber-1]),entry.wholeCurrentRow);
 const contract=contracts.forms.find(f=>f.goalId===entry.wholeCurrentRow.goalId);
 const reader=entry.lane==='A'?'app/scripts/semanticAtomicityReview.ts':'app/scripts/memoryCardReview.ts';
 const calc=readExactFingerprintFunction(reader);
 const before=calc(contract.wholeCurrentGoal,cfg.ruleVersion);
 const after=calc(contract.wholeProposedGoal,cfg.ruleVersion);
 assert.equal(before.fingerprint,entry.wholeCurrentRow.fingerprint);
 const changed=Object.keys(before.semanticPayload).filter(k=>JSON.stringify(before.semanticPayload[k])!==JSON.stringify(after.semanticPayload[k]));
 assert.deepEqual(changed,['nodeKind']);assert.equal(before.semanticPayload.nodeKind,'');assert.equal(after.semanticPayload.nodeKind,'exam');
 rows.push({lane:entry.lane,goalId:contract.goalId,lineNumber:entry.lineNumber,config:entry.config,reviewFile:entry.reviewFile,actualReader:pin(reader),originalRawLine:raw[entry.lineNumber-1],originalWholeRow:entry.wholeCurrentRow,independentlyComputedBefore:before,independentlyComputedAfter:after,changedSemanticPayloadFields:changed});
}
const result={status:'SIXTEEN_CURRENT_INPUTS_AND_ACTUAL_READER_FINGERPRINTS_VERIFIED_NOT_SEMANTIC_VERDICTS',execution:'Actual current function declarations extracted through TypeScript AST; no main or write mode invoked.',context:pin(`${base}/registered-sixteen-am-and-existing-log-memory-context.json`),contracts:pin(`${base}/whole-current-and-proposed-contracts.json`),populationReader:pin('app/scripts/lib/curricularReviewPopulation.ts'),rows};
writeFileSync(resolve(out,'am-binding-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',rows:rows.length,oldFingerprintsMatched:rows.length,changedFields:['nodeKind']}));
