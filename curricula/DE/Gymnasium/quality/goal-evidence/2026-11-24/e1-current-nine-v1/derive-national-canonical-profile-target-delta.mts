// SPDX-License-Identifier: Apache-2.0
// Derive the exact target delta through the native compiler; record is immutable history.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { normalizeCanonicalLandscape, resolveCanonicalNodeType } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
const root=process.cwd(), old='42af44fbc3^'
const cp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', kp='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const get=(p:string,before:boolean)=>before?execFileSync('git',['show',`${old}:${p}`],{cwd:root,maxBuffer:20*1024*1024}):readFileSync(resolve(root,p))
const sha=(b:Buffer)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
function run(before:boolean){
 const phys=normalizeCanonicalLandscape(JSON.parse(get(cp,before).toString())), kinds=new Map(JSON.parse(get(kp,before).toString()).decisions.map((d:any)=>[d.goalId,d.semanticKind]));phys.goals=phys.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))
 const rest=['MATHEMATIK','CHEMIE'].map(s=>normalizeCanonicalLandscape(JSON.parse(readFileSync(resolve(root,`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${s}.de.json`),'utf8'))))
 const universe={landscapeId:'e1-native-physics-and-math-profile-delta',title:'Independent native profile delta',goals:[...phys.goals,...rest.flatMap(d=>d.goals)]}, byid=new Map(universe.goals.map(g=>[g.id,g]));const total=new Set<string>(),profiles=[]
 for(const profile of ['gk','lk']){
  const path=`curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-${profile}.view.json`,raw=get(path,before),view=normalizeCompositionView(JSON.parse(raw.toString())),compiled=compileCompositionView(view,phys,universe)
  const errors=compiled.findings.filter(f=>f.severity==='error');if(errors.length)throw new Error(JSON.stringify(errors))
  const ids=new Set<string>();function visit(nodes:any[]){for(const n of nodes){if(n.kind==='goal'&&n.sourceGoalId){const g=byid.get(n.sourceGoalId)!;if(resolveCanonicalNodeType(g)==='atomic'&&kinds.get(g.id)==='curricularAtomic')ids.add(g.id)}visit(n.children)}}visit(compiled.compiledRootNodes);ids.forEach(i=>total.add(i));profiles.push({path,sha256:sha(raw),targetGoalIds:[...ids].sort()})
 }
 return {union:[...total].sort(),profiles}
}
const before=run(true),current=run(false),added=current.union.filter(i=>!before.union.includes(i)),removed=before.union.filter(i=>!current.union.includes(i));const expected=['0fee53f2-1c02-5b12-9b6c-aa9fa462d921','1e459a1b-4159-5049-84eb-9928129c1610','262f807a-30d0-503e-986f-856cbd048e8e','d9a6ea85-f7e8-5cbd-afe9-62596e22040d'].sort();if(before.union.length!==420||current.union.length!==424||JSON.stringify(added)!==JSON.stringify(expected)||removed.length)throw new Error(JSON.stringify({before:before.union.length,current:current.union.length,added,removed}))
const output={schemaVersion:1,contract:'e1-native-canonical-gk-lk-profile-delta-v1',beforeCommit:execFileSync('git',['rev-parse',old],{cwd:root,encoding:'utf8'}).trim(),beforeCount:before.union.length,currentCount:current.union.length,addedGoalIds:added,removedGoalIds:removed,before,current,method:'Both old/current GK+LK views pass the native composition compiler with Physics/Mathematics/Chemistry universe; collect only compiled atomic curricularAtomic target nodes. Same native algorithm as testPhysicsGoalBookInputs canonicalProfileTargetIds; preserve every old ID.'}
if(process.argv.includes('--write')) throw new Error('Historical receipt is immutable; print the rederived result for comparison instead');
process.stdout.write(JSON.stringify(output,null,2)+'\n');console.log('Native canonical profile union420→424; exact TV/LAWS/FALL/VEC, zero removals.')
