import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel'

async function main(){
 const root=process.cwd(), own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
 const ledger=JSON.parse(await readFile(resolve(own,'candidate/semantic560.exact-no-change.json'),'utf8'))
 const goals=JSON.parse(await readFile(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1/candidate/canonical560.current422.three-wording-four-alt.author.json'),'utf8')).goals
 const before=structuredClone(ledger),changes=[]
 for(const row of ledger.decisions){
   const goal=goals.find((g:any)=>g.id===row.goalId), expected=fingerprintSemanticKindSourceGoal(goal)
   if(row.sourceFingerprint!==expected){changes.push({goalId:row.goalId,before:row.sourceFingerprint,after:expected,semanticKind:row.semanticKind,decisionBasis:row.decisionBasis});row.sourceFingerprint=expected}
 }
 if(changes.length!==3||changes.some(c=>c.semanticKind!=='curricularAtomic'))throw new Error('Unexpected semantic radius')
 for(let i=0;i<ledger.decisions.length;i++){const a={...ledger.decisions[i]},b={...before.decisions[i]};delete a.sourceFingerprint;delete b.sourceFingerprint;if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('Semantic decision changed')}
 const path=resolve(own,'candidate/semantic560.three-description-source-bindings.json'), bytes=JSON.stringify(ledger,null,2)+'\n'
 await writeFile(path,bytes)
 const mappingPath=resolve(own,'checks/REBUILD.four-final-contexts.physical-map.json'),map=JSON.parse(await readFile(mappingPath,'utf8'))
 const alias=map.aliases.find((r:any)=>r.normalHostAlias==='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
 const oldAlias=structuredClone(alias)
 alias.physicalRepositorySource={path:path.slice(root.length+1),sha256:'sha256:'+createHash('sha256').update(bytes).digest('hex'),bytes:Buffer.byteLength(bytes)}
 await writeFile(resolve(root,map.executionHost,alias.normalHostAlias),bytes)
 await writeFile(mappingPath,JSON.stringify(map,null,2)+'\n')
 await writeFile(resolve(own,'checks/CAS.three-semantic-source-bindings-only.json'),JSON.stringify({role:'Technical binding of existing unchanged ordinary semantic classifications after authorized three description edits;no new semantic approval',changes,whole560SemanticClassificationsExact:true,ordinaryAtomic:422,other557SemanticRowsExact:true,beforeAlias:oldAlias,afterAlias:alias,newD:0,newP:0,newA:0,newM:0,newV:0},null,2)+'\n')
 console.log(JSON.stringify({semanticSourceBindings:3,unchangedSemanticClassifications:560,ordinaryAtomic:422}))
}
main().catch(e=>{console.error(e);process.exit(1)})
