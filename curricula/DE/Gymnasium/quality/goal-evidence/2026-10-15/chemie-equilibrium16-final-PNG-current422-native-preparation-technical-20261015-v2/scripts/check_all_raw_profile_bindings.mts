// SPDX-License-Identifier: Apache-2.0
import { readFileSync,writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const r=process.cwd(),o=resolve(r,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2')
const j=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const map=j(resolve(o,'checks/REBUILD.native16.current338-exact-physical-map.json')),h=resolve(r,map.executionHost)
const stock=await import(pathToFileURL(resolve(h,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const canon=j(resolve(h,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))
const sem=j(resolve(h,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'))
const profiles=readFileSync(resolve(o,'blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x))
const results=[]
for(const p of profiles){
 const g=canon.goals.find((x:any)=>x.id===p.goalId),s=sem.decisions.find((x:any)=>x.goalId===p.goalId)
 assert.equal(s.decisionStatus,'authoritative');assert.equal(s.semanticKind,'curricularAtomic')
 const digests:Record<string,string>={}
 for(const l of g.resourceLinks??[])if(l.type==='goal-visualization')digests[l.url]='sha256:'+createHash('sha256').update(readFileSync(resolve(h,'app/public',l.url.slice(1)))).digest('hex')
 const errors=stock.validatePositiveGoalEvidenceRecordSemantics(p,g,digests,s.semanticKind)
 assert.deepEqual(errors,[])
 assert.equal(p.evidenceLevel,'E0');assert.equal(p.maximumClaimScope,'G0');assert.deepEqual(p.reviewRunIds,[])
 results.push({goalId:p.goalId,resourceDigests:digests,goalFingerprint:p.goalFingerprint,reviewInputFingerprint:p.reviewInputFingerprint,profileFingerprint:p.profileFingerprint,stockSemanticErrors:errors})
}
writeFileSync(resolve(o,'checks/CHECK.rawP16-stock-fingerprints-and-semantics.actual.json'),JSON.stringify({role:'Technical current-byte fingerprint and schema-semantic validation only; no profile scientific judgment',unchangedStockHelper:'validatePositiveGoalEvidenceRecordSemantics',rows:results,count:16,errors:0,E0G0Unchanged:true,newScientificVotes:0},null,2)+'\n')
console.log('16 current raw E0/G0 profiles: unchanged stock fingerprint and semantic helper, zero errors; no scientific approval.')
