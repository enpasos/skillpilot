import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
const require=createRequire(path.resolve('app/package.json'))
const ts=require('typescript')
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-six-exact-existing-P-record-retentions-technical-20261016-v1'
const sourcePath='app/scripts/semanticAtomicityReview.ts'
const source=fs.readFileSync(sourcePath,'utf8')
const tree=ts.createSourceFile(sourcePath,source,ts.ScriptTarget.Latest,true)
const names=new Set(['normalizeText','stableJson','getSemanticPayload','fingerprintGoal'])
const declarations=tree.statements.filter((n:any)=>ts.isFunctionDeclaration(n)&&names.has(n.name?.text)).map((n:any)=>n.getText(tree))
if(declarations.length!==4)throw Error('Expected exact four stock declarations')
const literal=declarations.join('\n\n')+'\n'
fs.writeFileSync(root+'/checks/STOCK-A-fingerprint-four-declarations.verbatim.ts',literal)
const js=ts.transpileModule(literal,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText
const fingerprint=new Function('createHash',js+'\nreturn fingerprintGoal')(createHash)
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const pin=(p:string)=>({path:p,sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size})
const origin=JSON.parse(fs.readFileSync(root+'/ORIGIN.six-whole-byte-exact-original-P-lines.json','utf8'))
const canonicalPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-joint578-current-semantic-ledger-technical-20261016-v1/candidate/CANONICAL.joint578.two-memory-bodies-appended.technical-preview.json'
const goals=new Map(JSON.parse(fs.readFileSync(canonicalPath,'utf8')).goals.map((g:any)=>[g.id,g]))
const rows=origin.goalIds.map((id:string)=>({goalId:id,currentAFingerprint: fingerprint(goals.get(id),'semantic-atomicity-v1')}))
fs.writeFileSync(root+'/checks/READONLY.A6-current-stock-fingerprints.json',JSON.stringify({role:'Readonly fingerprint locator for existing A records; no A checker, materialization or science vote',stockSource:pin(sourcePath),verbatimDeclarations:pin(root+'/checks/STOCK-A-fingerprint-four-declarations.verbatim.ts'),canonical:pin(canonicalPath),rows},null,2)+'\n')
process.stdout.write(JSON.stringify(rows,null,2)+'\n')
