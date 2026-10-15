// SPDX-License-Identifier: Apache-2.0
// Technical image transport only. Calls the unchanged stock materializer; no new P judgment.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const root=process.cwd()
const own=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2')
const mapping=JSON.parse(readFileSync(resolve(own,'checks/REBUILD.native16.current338-exact-physical-map.json'),'utf8'))
const stock=await import(pathToFileURL(resolve(root,mapping.executionHost,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const oldPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium16-current422-native-preparation-technical-20261015-v1/blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl')
const oldLines=readFileSync(oldPath,'utf8').trimEnd().split('\n')
const old=oldLines.map(x=>JSON.parse(x))
const gid='f0f2c5f8-06f1-5774-a176-d96505727acf'
const one=old.find(x=>x.goalId===gid)
const candidate={schemaVersion:1,authoringContract:'positive-understanding-evidence-candidates-v1',reviewId:one.reviewId,reviewedAt:one.reviewedAt,reviewer:one.reviewer,goals:[{goalId:gid,reason:one.reason,evidenceLevel:'E0',maximumClaimScope:'G0',dissent:one.dissent,profile:one.profile}]}
const config={schemaVersion:2,reviewId:one.reviewId,landscapeId:one.landscapeId,landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semanticKindLedgerPath:'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',reviewCriteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewedResourceTypes:['goal-visualization'],scope:{goalIds:[gid]}}
const built=await stock.buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidate})
assert.equal(built.length,1)
const result={...one}
for(const key of ['goalFingerprint','reviewInputFingerprint','profileFingerprint'])result[key]=built[0][key]
assert.deepEqual(result,built[0])
assert.deepEqual(result.profile,one.profile)
assert.notEqual(result.reviewInputFingerprint,one.reviewInputFingerprint)
assert.equal(result.goalFingerprint,one.goalFingerprint)
assert.equal(result.profileFingerprint,one.profileFingerprint)
const outputLines=oldLines.map((line,i)=>old[i].goalId===gid?JSON.stringify(result):line)
writeFileSync(resolve(own,'blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl'),outputLines.join('\n')+'\n')
writeFileSync(resolve(own,'checks/CAS.rawP16-only-Pourbaix-image-review-input-binding.stock-actual.json'),JSON.stringify({role:'Technical raw E0/G0 input transport only, no scientific profile approval',unchangedStockMaterializer:'app/scripts/materializePositiveGoalEvidenceCandidates.ts',actualStockBuildCalled:true,goalId:gid,before:{goalFingerprint:one.goalFingerprint,reviewInputFingerprint:one.reviewInputFingerprint,profileFingerprint:one.profileFingerprint},after:{goalFingerprint:result.goalFingerprint,reviewInputFingerprint:result.reviewInputFingerprint,profileFingerprint:result.profileFingerprint},onlyChangedField:'reviewInputFingerprint',other15WholeRowsByteExact:true,all16ProfileBodiesExact:true,whole32CasesUnchanged:true,rawStatus:'needs_human_review',rawAuthority:'ai_candidate',evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],newScientificVotes:0},null,2)+'\n')
console.log(JSON.stringify({onlyChangedGoalId:gid,before:one.reviewInputFingerprint,after:result.reviewInputFingerprint,all16ProfileBodiesExact:true,other15WholeRowsExact:true,E0G0:true,newScientificVotes:0}))
