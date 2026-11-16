import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {buildApplicabilityCompilation} from '../../app/scripts/applicabilityCompiler'
const path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const before=readFileSync(path), sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
assert.equal(sha(before),'721585772259388d11c4b6f1e6539099c375e6527828d62369acd6df6539e52c')
const catalog=readdirSync('curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.json')).sort().map(f=>({file:'curricula/DE/Gymnasium/canonical/'+f,landscape:JSON.parse(readFileSync('curricula/DE/Gymnasium/canonical/'+f,'utf8'))}))
const c=catalog.find(s=>s.file===path)!.landscape
const ordinary=['677a192d-8bbe-57fc-bb7a-1c1ed5fba32b','d61ea362-f6c3-5eab-ac30-2d0e265ac0f6']
const tasks=['7c2a3450-9b82-54e6-b302-358a964b34ec','fbaeed34-81a0-5955-9777-bf103002feee']
for(const id of ordinary){const g=c.goals.find((g:any)=>g.id===id)!;g.extendedData={...g.extendedData,applicabilityMappingInheritance:'boundary'};g.applicability={jurisdiction:['DE-BY']}}
for(const id of tasks)c.goals.find((g:any)=>g.id===id)!.applicability={jurisdiction:['DE-BY']}
const result=buildApplicabilityCompilation(catalog), physics=result.reports.find(r=>r.landscapeId===c.landscapeId)!
const rows=[...ordinary,...tasks].map(id=>physics.goals.find(g=>g.goalId===id)!)
for(const row of rows)assert.deepEqual(row.compiledApplicability,{jurisdiction:['DE-BY']})
assert.equal(physics.findings.filter(f=>f.code==='APV-203').length,0)
assert.equal(sha(readFileSync(path)),sha(before))
const candidate=JSON.stringify(c,null,2)+'\n'
writeFileSync('tmp/physics-applicability-boundary-20261115/candidate.json',candidate)
writeFileSync('tmp/physics-applicability-boundary-20261115/native-proof.actual.json',JSON.stringify({at:new Date().toISOString(),beforeSha256:sha(before),candidateSha256:sha(candidate),nativeFunction:'buildApplicabilityCompilation',catalogRoots:catalog.length,summary:physics.summary,rows,allPhysicsWarnings:physics.findings.filter(f=>f.severity==='warning'),activeSourceWrites:false},null,2)+'\n')
console.log(JSON.stringify({candidateSha256:sha(candidate),rows:rows.map(g=>({goalId:g.goalId,compiledApplicability:g.compiledApplicability,evidence:g.evidence})),summary:physics.summary}))
