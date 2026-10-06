// SPDX-License-Identifier: Apache-2.0
// Kind classification for an inactive author tree; no A or source approval.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
const root=process.cwd()
if(!root.endsWith('/tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1'))throw Error('Own isolated tree required')
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-six-source-operator-remediation-current-candidate-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const write=(p:string,v:any)=>writeFileSync(resolve(root,p),JSON.stringify(v,null,2)+'\n')
const canonical=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const goals=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
const sempath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const sem=read(sempath),before=structuredClone(sem)
const ids=new Set<string>(read(own+'/six-explicit-scientific-field-deltas.candidate.json').rows.map((r:any)=>r.goalId))
ids.add('47a40c98-ab20-5246-85e3-3abe5a9e95ed')
const changed:any[]=[]
for(const d of sem.decisions){
 const fp=fingerprintSemanticKindSourceGoal(goals.get(d.goalId))
 if(fp===d.sourceFingerprint)continue
 if(!ids.has(d.goalId))throw Error('Unexpected source-kind payload change '+d.goalId)
 changed.push({goalId:d.goalId,before:d.sourceFingerprint,after:fp,semanticKind:d.semanticKind,newIndependentSemanticAtomicityApproval:false})
 d.sourceFingerprint=fp
}
const newId='0d59b62e-d3f9-5969-b961-0c5e26316c04'
if(sem.decisions.some((d:any)=>d.goalId===newId))throw Error('New author proposal already classified')
// This is the existing closed classification vocabulary. The author actually
// inspected the type: content competence, not memory/practice/orientation.
// It is not the separate independent semantic-atomicity approval gate.
sem.decisions.push({goalId:newId,sourceFingerprint:fingerprintSemanticKindSourceGoal(goals.get(newId)),semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-curricular-atomic'})
sem.decisions.sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId))
if(sem.counts.curricularAtomic!==376||sem.counts.total!==474)throw Error('Unexpected active kind denominator')
sem.counts.curricularAtomic++;sem.counts.total++
for(const [k,v] of Object.entries(before.counts))if(!['curricularAtomic','total'].includes(k)&&sem.counts[k]!==v)throw Error('Protected other kind count changed')
write(sempath,sem)
write(own+'/author-semantic-kind-bindings.actual.receipt.json',{changedBindings:changed,newAuthorDeclaredKind:{goalId:newId,semanticKind:'curricularAtomic'},counts:sem.counts,newIndependentAApproval:false,authorCandidateOnly:true,humanApproval:false,humanTrial:false,activeWrites:0})
console.log(JSON.stringify({changedKindBindings:changed.length,prospectiveCurricularAtomic:377,newIndependentAApproval:false,activeWrites:0}))
