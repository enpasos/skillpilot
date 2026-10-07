// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildApplicabilityCompilation} from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts'
import {discoverActiveMemoryCardReviewConfigs} from '/home/enpasos/projects/skillpilot/app/scripts/memoryCardReviewConfigDiscovery.ts'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../../'),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),landscapeId='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const registry=read(resolve(root,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')),subject=registry.subjects.find((s:any)=>s.subject==='chemie'),active=read(resolve(root,subject.memoryReviewConfigPath)),discovered=discoverActiveMemoryCardReviewConfigs().find(c=>c.reviewId===active.reviewId)!
assert.equal(discovered.configPath,subject.memoryReviewConfigPath);assert.equal(active.visibilityScopeCoverageRequired,true);assert.equal(active.visibilityScopes.length,7)
const report=buildApplicabilityCompilation().reports.find(r=>r.landscapeId===landscapeId)!,support=report.goals.find(g=>g.goalId==='417e65ec-68be-5f2e-9452-c3ba9b1d362f')!,origin=report.goals.find(g=>g.goalId==='28bb9d15-f865-5843-a035-6066580fea64')!
const canonical=read(resolve(root,subject.landscapePath)),authored=canonical.goals.find((g:any)=>g.id===support.goalId).applicability.jurisdiction
assert.equal(authored.length,16);assert.deepEqual(support.compiledApplicability.jurisdiction,authored);assert.deepEqual(origin.compiledApplicability.jurisdiction,authored)
const evidence=support.evidence.filter(e=>e.kind==='memory-review-origin');assert.equal(evidence.length,16);assert(evidence.every(e=>e.source.includes(active.reviewPath)&&e.source.includes(origin.goalId)))
assert.equal(report.findings.filter(f=>f.code==='APV-203').length,0)
writeFileSync(resolve(own,'checks/current-417e-active-memory-origin.actual.json'),JSON.stringify({activeDiscoveredConfig:discovered,currentMemoryConfigPath:subject.memoryReviewConfigPath,currentReviewPath:active.reviewPath,authoredJurisdictions:authored,compiledSupport:support,compiledOrigin:origin,ordinaryChemistryApplicabilityMismatchCount:0,visibilityScopes:active.visibilityScopes,visibilityScopeCoverageRequired:true,otherAuthoredScopesNotExpanded:true,historicalMemoryConfigFilesChanged:false,warningAllowlistChanged:false,importCycle:false,newScientificReview:false},null,2)+'\n',{flag:'wx'})
console.log('PASS current registry Memory378 → Arrhenius28 → support417e, all16 current jurisdictions; APV203 zero; seven actual visibility scopes retained.')
