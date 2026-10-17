import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { reviewPositiveGoalEvidenceConfig } from './capsule/app/scripts/positiveGoalEvidenceReview.ts'
const O=dirname(fileURLToPath(import.meta.url)), K=resolve(O,'capsule')
const h=JSON.parse(await readFile(resolve(O,'HANDOFF.exact-current-AM-P-prospective-integration.json'),'utf8'))
const results:any[]=[],seen=new Set<string>()
for(const path of h.stockChecksToRun.P.allConfigPaths){
 const r=reviewPositiveGoalEvidenceConfig(path)
 if(r.errors.length)throw new Error(path+': '+r.errors.join(' | '))
 for(const record of r.records){if(seen.has(record.goalId))throw new Error('Duplicate P owner '+record.goalId);seen.add(record.goalId)}
 results.push({configRelativePath:path,recordCount:r.records.length,counts:r.counts,errorCount:r.errors.length})
}
if(seen.size!==439)throw new Error('Incomplete P scope '+seen.size)
for(const expected of h.sourceGuards){const raw=await readFile(expected.path);if(createHash('sha256').update(raw).digest('hex')!==expected.sha256||raw.length!==expected.bytes)throw new Error('Source changed '+expected.path)}
const out={role:'Actual stock positive-evidence checks over exact current439 owner configs; schema/bindings only, scientific material findings remain open',atUTC:new Date().toISOString(),configCount:results.length,recordCount:seen.size,duplicateOwnerCount:0,results,sourceGuardsUnchanged:true,openMaterialGoalIds:h.openMaterialGoalIds,scientificClosureClaim:false,humanApproval:false,fullCentralRun:false}
await writeFile(resolve(O,'CHECK.actual-current439-P-stock-configs.json'),JSON.stringify(out,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({configCount:results.length,recordCount:seen.size,duplicateOwnerCount:0,stockErrors:0,materialFindingsRemainOpen:true}))
