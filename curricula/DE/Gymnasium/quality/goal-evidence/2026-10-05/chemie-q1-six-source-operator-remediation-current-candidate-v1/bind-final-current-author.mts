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
ids.add('47a40c98-ab20-5246-85e3-3abe5a9e95ed'); ids.add('0d59b62e-d3f9-5969-b961-0c5e26316c04')
const changed:any[]=[]
for(const d of sem.decisions){
 const fp=fingerprintSemanticKindSourceGoal(goals.get(d.goalId))
 if(fp===d.sourceFingerprint)continue
 if(!ids.has(d.goalId))throw Error('Unexpected source-kind payload change '+d.goalId)
 changed.push({goalId:d.goalId,before:d.sourceFingerprint,after:fp,semanticKind:d.semanticKind,newIndependentSemanticAtomicityApproval:false})
 d.sourceFingerprint=fp
}
if(sem.counts.curricularAtomic!==377||sem.counts.total!==475)throw Error('Unexpected inactive author kind denominator')
write(sempath,sem)
write(own+'/final-author-semantic-kind-bindings.actual.receipt.json',{changedBindings:changed,newAuthorDeclaredKindUnchanged:true,counts:sem.counts,newIndependentAApproval:false,authorCandidateOnly:true,humanApproval:false,humanTrial:false,activeWrites:0})
console.log(JSON.stringify({changedKindBindings:changed.length,prospectiveCurricularAtomic:377,newIndependentAApproval:false,activeWrites:0}))
