// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-three-current383-author-continuation-v2'
const p='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const landscape=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const by=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const selected=new Set(read(own+'/batch.config.json').goalIds)
const ledger=read(p),changes:any[]=[]
assert.equal(ledger.counts.curricularAtomic,383)
for (const r of ledger.decisions) {
  const current=fingerprintSemanticKindSourceGoal(by.get(r.goalId) as any)
  if(selected.has(r.goalId)) {
    assert.equal(r.semanticKind,'curricularAtomic')
    if(current!==r.sourceFingerprint)changes.push({goalId:r.goalId,before:r.sourceFingerprint,after:current})
    r.sourceFingerprint=current
  } else assert.equal(r.sourceFingerprint,current,'Unexpected unaffected classification drift '+r.goalId)
}
writeFileSync(p,JSON.stringify(ledger,null,2)+'\n')
writeFileSync(own+'/semantic-kind.candidate.json',JSON.stringify(ledger,null,2)+'\n')
writeFileSync(own+'/semantic-kind.candidate-binding.receipt.json',JSON.stringify({
  changes,classification:'Four existing ordinary assessable curricular atoms retain their existing kind in this inactive candidate.',
  denominator:383,newIds:[],semanticAtomicityApproval:false,humanApproval:false,activeWrites:0,
},null,2)+'\n')
console.log(JSON.stringify({retainedCurricularAtoms:383,selectedTargets:4,classificationBindingsChanged:changes.length,activeWrites:0}))
