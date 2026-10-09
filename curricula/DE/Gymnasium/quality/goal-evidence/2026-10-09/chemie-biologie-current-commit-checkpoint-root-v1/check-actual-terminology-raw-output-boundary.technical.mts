// SPDX-License-Identifier: Apache-2.0
// Executes the actual current receipt classifier, not a copied implementation.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,readdirSync,rmSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname,sep} from 'node:path'
import ts from '../../../../../../../app/node_modules/typescript/lib/typescript.js'
const root=resolve('.'),srcPath='app/scripts/checkTerminology.ts',src=readFileSync(srcPath,'utf8')
const code=src.slice(src.indexOf('const capturedCommandOutputs ='),src.indexOf('function collectScannableFiles'))
assert.ok(code.includes('function isCapturedCommandOutput'));assert.ok(src.includes('if (isCapturedCommandOutput(path, contents)) return []'))
const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText
const get=()=>new Function('repoRoot','toPosixPath','dirname','resolve','readdirSync','readFileSync','createHash',js+'; return isCapturedCommandOutput;')(root,(p:string)=>p.split(sep).join('/'),dirname,resolve,readdirSync,readFileSync,createHash)
const dir='tmp/terminology-bound-execution-output-actual-regression-root-v1';mkdirSync(dir,{recursive:true})
const output=dir+'/fixture.stderr.actual.txt',receipt=dir+'/fixture.terminal.actual.json';const contents='Captured checker diagnostic: '+String.fromCodePoint(108,101,97,114,110,105,110,103,32,108,97,110,100,115,99,97,112,101)+'\n';writeFileSync(output,contents)
const hash=createHash('sha256').update(contents).digest('hex'),binding={path:output,sha256:'sha256:'+hash,bytes:Buffer.byteLength(contents)}
const results:any[]=[]
const check=(name:string,expected:boolean)=>{const actual=get()(output,contents);assert.equal(actual,expected,name);results.push({name,expected,actual})}
rmSync(receipt,{force:true});check('Filename alone never exempts an unbound raw-looking file',false)
const write=(value:any)=>writeFileSync(receipt,JSON.stringify(value,null,2)+'\n')
write({argv:['fixture-command'],exitCode:1,stderr:binding});check('Exactly bound genuine failed-command capture is data',true)
write({actualChecks:[{argv:['fixture-command'],exitCode:0,stderr:binding}]});check('Exactly bound captured output in a real batch receipt is data',true)
write({argv:['fixture-command'],exitCode:1,stderr:{...binding,sha256:'sha256:'+'0'.repeat(64)}});check('Wrong hash cannot exempt new or edited authored wording',false)
write({argv:['fixture-command'],exitCode:1,stderr:{...binding,bytes:binding.bytes+1}});check('Wrong byte count cannot exempt a changed capture',false)
write({argv:'not-a-command-array',exitCode:1,stderr:binding});check('A plain file binding is not an execution receipt',false)
write({argv:['fixture-command'],stderr:binding});check('Without an actual terminal exit no exemption',false)
write({argv:['fixture-command'],exitCode:1,stderr:binding});assert.equal(get()(dir+'/actual-generator-prompt.en.md',contents),false);results.push({name:'Actual authored/provider prompt remains in scope regardless of receipt text',expected:false,actual:false})
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-biologie-current-commit-checkpoint-root-v1/actual-terminology-command-output-boundary.regression.json'
writeFileSync(out,JSON.stringify({schemaVersion:1,role:'Meaningful regression of the actual current raw-output classifier and its exact byte/path bindings',actualCheckerPath:srcPath,actualCheckerSha256:'sha256:'+createHash('sha256').update(src).digest('hex'),results,allPassed:true,noScientificOrHumanApproval:true},null,2)+'\n')
console.log('PASS actual terminology execution-data boundary: '+results.length+' meaningful cases; unbound or changed authored text remains checked')
