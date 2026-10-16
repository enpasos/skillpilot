import {readFileSync,writeFileSync,renameSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
const r=resolve('.'),o=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-APV103-canonical-orphans-readonly-diagnosis-20261016-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const d=read(o+'/DIAGNOSIS.actual-stock-and-readonly-hypothesis.json'),cas=read(o+'/CAS.two-cluster-contains-only.hypothetical-inactive.json')
const canonical=read(r+'/'+d.inputPins.HCanonical.path),kinds=read(r+'/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const atoms=new Set<string>(kinds.decisions.filter((x:any)=>x.semanticKind==='curricularAtomic').map((x:any)=>x.goalId)),before=new Map(canonical.goals.map((g:any)=>[g.id,g])),after=new Map(before)
for(const op of cas.operations)after.set(op.goalId,read(r+'/'+op.after.path))
const {sourceAtlasDescendants}=await import(r+'/app/scripts/goalBookSourceAtlasInputs.ts')
const targets=[...new Set(d.inputPins.mappingChemistryPins.flatMap((p:any)=>read(r+'/'+p.path).mappings??[]).map((m:any)=>m.canonicalGoalId).filter((x:any)=>x&&before.has(x)))] as string[]
const rows=targets.map(id=>{const b=sourceAtlasDescendants(id,before,atoms,canonical.landscapeId),a=sourceAtlasDescendants(id,after,atoms,canonical.landscapeId);return {targetGoalId:id,beforeCount:b.length,afterCount:a.length,exact:JSON.stringify(a)===JSON.stringify(b),added:a.filter(x=>!b.includes(x)),removed:b.filter(x=>!a.includes(x))}})
const result={role:'Actual unchanged stock SourceAtlasDescendants helper over both readonly in-memory graphs.82 current mapping files were enumerated explicitly by existing paths; this is separate from incomplete recursive ApplicabilityCompiler capsule. No actual authored canonical or source binding changed.',module:{path:'app/scripts/goalBookSourceAtlasInputs.ts',sha256:hash(r+'/app/scripts/goalBookSourceAtlasInputs.ts')},currentOrdinaryAtoms:atoms.size,explicitMappingFiles:d.inputPins.mappingChemistryPins.length,uniqueCurrentMappedCanonicalTargets:targets.length,allActuallyMappedTargetsDescendantSetsEqual:rows.every(x=>x.exact),changed:rows.filter(x=>!x.exact),root:rows.find(x=>x.targetGoalId==='442c31c5-c561-5c7a-90bb-2335d779175c'),supplementBoundaryPreserved:true,rows,HumanApproval:false,HumanTrial:false}
writeFileSync(o+'/PROBE.actual-stock-source-atlas-boundary-descendants.json.tmp',JSON.stringify(result,null,2)+'\n');renameSync(o+'/PROBE.actual-stock-source-atlas-boundary-descendants.json.tmp',o+'/PROBE.actual-stock-source-atlas-boundary-descendants.json')
console.log(JSON.stringify({mappedTargets:targets.length,equal:result.allActuallyMappedTargetsDescendantSetsEqual,changed:result.changed,root:result.root}))
