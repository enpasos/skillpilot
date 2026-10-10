// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-native-context-independent-b-20261010-v1'
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-machine-content-native-readiness-author-20261010-v1'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const first=read(own+'/FIRST.current517-native-and-C11-G1.independent-b.json')
const whole=read(author+'/candidate/whole517.inactive.machine-content-final-learner-copy-author.json')
const ledger=read(author+'/candidate/current517-final-learner-copy-semantic-kinds.portable.inactive.json')
const book=await import(pathToFileURL(path.resolve('app/scripts/goalBookModel.ts')).href)
const by=new Map(whole.goals.map((g:any)=>[g.id,g]))
const rows=first.fourteenCurrentKindDecisions.map((d:any)=>{
 const g=by.get(d.goalId)
 const fp=book.fingerprintSemanticKindSourceGoal(g)
 const l=ledger.decisions.find((x:any)=>x.goalId===d.goalId)
 assert.equal(fp,l.sourceFingerprint)
 assert.equal(d.semanticKind,l.semanticKind)
 return {...d,currentSourceFingerprint:fp,currentWholeGoal:g,authority:'independent_ai_recommendation',operativeClassification:false,humanApproval:false}
})
assert.equal(rows.length,14)
fs.writeFileSync(own+'/inspection/current-fourteen-kind-context-bindings.actual.json',JSON.stringify({schemaVersion:1,role:'Own substantive role reasons sealed first; normal current source fingerprints computed by unmodified goalBookModel API',firstPath:own+'/FIRST.current517-native-and-C11-G1.independent-b.json',rows,normalRulesChanges:0,operativeWrites:[]},null,2)+'\n')
console.log('Current independent B role/context bindings valid: 14')
