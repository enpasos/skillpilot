// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
const root=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const at=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const map=get('checks/REBUILD.final-current422.alias50-selected433.physical-map.json'),host=resolve(root,map.executionHost)
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(host,'app/scripts/goalBookModel.ts')).href)
const {isGoalVisualizationAiApproved}=await import(pathToFileURL(resolve(host,'app/scripts/goalVisualizationQaModel.ts')).href)
const cfg=get('config/central.current422.lab2-plus-existing-carbonyl3.inactive.config.json'),s=cfg.subjects[0]
const can=JSON.parse(readFileSync(resolve(host,s.landscapePath),'utf8')),sem=JSON.parse(readFileSync(resolve(host,s.semanticKindLedgerPath),'utf8'))
assert.equal(can.goals.length,554);assert.equal(sem.counts.curricularAtomic,422)
const G=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]))
assert.deepEqual(sem.decisions.filter((d:any)=>d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(G.get(d.goalId))),[])
const dag=(field:string)=>{const done=new Set<string>(),pending=new Set<string>();const walk=(id:string)=>{assert.ok(!pending.has(id),`${field} cycle at ${id}`);if(done.has(id))return;pending.add(id);for(const r of G.get(id)?.[field]??[]){assert.ok(G.has(r));walk(r)}pending.delete(id);done.add(id)};for(const id of G.keys())walk(id);return done.size}
assert.equal(dag('requires'),554);assert.equal(dag('contains'),554)
const aliases=new Map(map.aliases.map((r:any)=>[r.normalHostAlias,r.physicalRepositorySource.path]))
const actual=(p:string)=>(aliases.get(p)??p) as string
const seen=new Map<string,string>(),duplicates:any[]=[]
for(const key of ['positiveEvidenceConfigPaths','semanticAtomicityConfigPaths']){
 for(const p of s[key]){const c=at(actual(p));assert.equal(c.landscapePath,s.landscapePath);if(c.semanticKindLedgerPath)assert.equal(c.semanticKindLedgerPath,s.semanticKindLedgerPath)
  for(const l of readFileSync(resolve(root,actual(c.reviewPath)),'utf8').trim().split('\n').filter(Boolean)){const r=JSON.parse(l),k=key+':'+r.goalId;if(seen.has(k))duplicates.push({k,one:seen.get(k),two:p});seen.set(k,p)}
 }
}
assert.deepEqual(duplicates,[])
const hold=get('checks/P3.actual-full-current-selection-no-overlap-explicit-open.json');assert.equal(hold.selectedCarbonylRows.length,0)
for(const id of hold.targetedCarbonylIds)assert.ok(!seen.has('positiveEvidenceConfigPaths:'+id))
const q=JSON.parse(readFileSync(resolve(host,s.visualizationQaPath),'utf8'))
const lab=['62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2','e7c3d20e-4b13-560b-b8ee-c5abca8cc624'],visual=[...hold.targetedCarbonylIds,...lab]
for(const id of visual){const r=q.records.find((r:any)=>r.goalId===id);assert.ok(isGoalVisualizationAiApproved(r),id);for(const p of [r.publicAssetPath,r.canonicalAssetPath]){const b=readFileSync(resolve(host,p));assert.equal('sha256:'+createHash('sha256').update(b).digest('hex'),r.assetSha256)}}
const mc=at(actual(s.memoryReviewConfigPath)),mr=readFileSync(resolve(root,actual(mc.reviewPath)),'utf8').trim().split('\n').map(l=>JSON.parse(l));assert.equal(mr.length,422)
for(const id of lab){assert.ok(seen.has('positiveEvidenceConfigPaths:'+id));assert.ok(seen.has('semanticAtomicityConfigPaths:'+id));assert.equal(mr.find((r:any)=>r.goalId===id).status,'no_memory_needed')}
for(const r of map.stockPhysicalModules){const b=readFileSync(resolve(host,r.path));assert.equal('sha256:'+createHash('sha256').update(b).digest('hex'),r.sha256)}
for(const r of map.aliases){const b=readFileSync(resolve(host,r.normalHostAlias));assert.equal('sha256:'+createHash('sha256').update(b).digest('hex'),r.physicalRepositorySource.sha256)}
const result={pass:true,role:'Targeted exact technical merge preflight, zero scientific votes',wholeGoals:554,denominator:422,rawRequiresDAG:true,containsDAG:true,semanticSourceFingerprintsExact:true,PADuplicateRows:0,P3SelectedRows:0,P3GatesRemainOpen:true,LAB2P2Selected:true,LAB2ExistingA_M_VExactReuse:true,stockCurrentVPredicatePassIds:visual,memory422Unchanged:true,physicalNormalAliases:map.aliases.length,physicalStockModules:map.stockPhysicalModules.length,selectedAssets:map.selectedCurrentAssetRows.length,newScientificVotes:0,activeIntegration:false}
writeFileSync(resolve(own,'checks/CHECK.final-inputs-before-single-central.actual.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result))
