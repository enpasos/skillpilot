// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..')
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const prior=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-six-unreserved-current378-whole-P-source-author-v1')
const goalId='62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2'
const baseline=readFileSync(join(prior,'native/positive-six.author-candidate.records.jsonl'),'utf8').split('\n').filter(Boolean).map((x:string)=>JSON.parse(x)).find((x:any)=>x.goalId===goalId)
const record=structuredClone(baseline)
const cases=read(join(here,'two-whole-raw-cases.de-en.author-candidate.json')).cases
const { fingerprintPositiveGoalEvidenceProfile }=await import(pathToFileURL(join(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
record.reviewId='chemie-62bd-current378-whole-source-role-author-v2'
record.reviewedAt=new Date().toISOString()
record.reviewer='chemistry_open_packets author; independent D/P/source review pending'
record.reason='New targeted source-role science and a complete second metal-extraction path in one whole bilingual case; one salt whole case retained exact. Current goal/image semantic bindings unchanged. Nine source-duty coverage author candidates and three true whole-source holds; no approval.'
record.dissent=['BB/BE metallic/alloy source rows currently include an unrelated molecular-interaction partner; no operative correction integrated.','HB whole process operator requires inference from own-performed experiments; current RAW/lab-cluster union does not cover it.','Nine other whole source duties are author coverage candidates, not independent approvals.','E1/G1 authored materials; no actual learner performance, Human Approval or Human Trial.']
record.profile.expectations[0].observablePerformanceDe=cases.map((x:any)=>x.learnerTask.de).join(' Zweiter Fall: ')
record.profile.expectations[0].observablePerformanceEn=cases.map((x:any)=>x.learnerTask.en).join(' Second case: ')
record.profile.applicationCaseBriefs=cases.map((x:any)=>({id:x.caseLocalKey,taskDemandDe:x.material.de.join(' ')+' '+x.learnerTask.de+' Transfer: '+x.transferOrCountercase.de.task,
 taskDemandEn:x.material.en.join(' ')+' '+x.learnerTask.en+' Transfer: '+x.transferOrCountercase.en.task,
 expectedPerformanceDe:x.expectedResponseOrSolution.de+' Transfer: '+x.transferOrCountercase.de.expected,
 expectedPerformanceEn:x.expectedResponseOrSolution.en+' Transfer: '+x.transferOrCountercase.en.expected,
 understandingFocusDe:x.essentialUnderstanding.de,understandingFocusEn:x.essentialUnderstanding.en}))
record.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(record.profile)
if (record.status!=='needs_human_review' || record.reviewAuthority!=='ai_candidate' || record.reviewRunIds.length)throw new Error('Invalid claim inheritance')
writeFileSync(join(here,'positive-one.author-candidate.records.jsonl'),JSON.stringify(record)+'\n')
const config=read(join(prior,'native/positive-six.inactive.config.json'))
config.reviewId=record.reviewId;config.reviewPath=relative(root,join(here,'positive-one.author-candidate.records.jsonl'))
config.scope={label:'One unchanged current material-path goal, new whole source-role author candidates and unresolved original whole source holds',goalIds:[goalId]}
writeFileSync(join(here,'positive-one.inactive.config.json'),JSON.stringify(config,null,2)+'\n')
console.log(JSON.stringify({authoredPProfiles:1,wholeCases:2,changedScienceCases:1,retainedExactCases:1,currentGoalAndImageBindingsExact:true,approved:0,activeWrites:false}))
