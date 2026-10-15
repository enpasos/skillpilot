// SPDX-License-Identifier: Apache-2.0
import{readFileSync,writeFileSync}from'node:fs'
import{createHash}from'node:crypto'
import{fingerprintSemanticKindSourceGoal}from'../../../../../../../../app/scripts/goalBookModel.ts'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
const O=E+'chemie-carbonyl-two-final-wording-and-visual-remediation-author-root-20261015-v1/'
const beforePath=E+'chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1/candidate-v2/semantic560.one-mechanism-description-source-binding.author-v2.json'
const canonicalPath=O+'candidate/canonical560.current422.two-wording-two-PNG.author.json'
const outputPath=O+'candidate/semantic560.two-description-source-identities.author.json'
const before=JSON.parse(readFileSync(beforePath,'utf8')),after=structuredClone(before),canonical=JSON.parse(readFileSync(canonicalPath,'utf8'))
const ids=['f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528','6d3a2bad-8c67-5964-a720-375f138adaba'],changes=[]
for(const id of ids){const d=after.decisions.find((d:any)=>d.goalId===id),old=structuredClone(d),g=canonical.goals.find((g:any)=>g.id===id);d.sourceFingerprint=fingerprintSemanticKindSourceGoal(g);changes.push({goalId:id,before:old,after:structuredClone(d)})}
if(JSON.stringify(before.decisions.filter((d:any)=>!ids.includes(d.goalId)))!==JSON.stringify(after.decisions.filter((d:any)=>!ids.includes(d.goalId))))throw Error('Other semantic decision changed')
for(const d of after.decisions){if(d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(canonical.goals.find((g:any)=>g.id===d.goalId)))throw Error('Stale semantic source '+d.goalId)}
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
writeFileSync(outputPath,JSON.stringify(after,null,2)+'\n',{flag:'wx'})
writeFileSync(O+'CAS.two-semantic-source-identities-only.json',JSON.stringify({role:'Technical identities after genuine original author text decisions; no semantic atomicity or other gate approval',beforePath,beforeSHA256:hash(beforePath),canonicalPath,canonicalSHA256:hash(canonicalPath),outputPath,outputSHA256:hash(outputPath),changes,other558DecisionsExact:true,currentStockSourceBindings:560,classificationAndBasisUnchanged:true,newAtomicityVotes:0,newStrict:0,humanApproval:false,activeWrites:0},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({outputPath,outputSHA256:hash(outputPath),other558DecisionsExact:true,currentStockSourceBindings:560,newAtomicityVotes:0}))
