// SPDX-License-Identifier: Apache-2.0
// Isolated proposed-split inputs after own scientific FIRST; no active writes.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const root = process.cwd()
const here = dirname(fileURLToPath(import.meta.url))
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const bind = (p: string) => ({ path: relative(root,p), sha256: `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`, bytes:readFileSync(p).length })
const write = (n: string, data: any) => {
  const p = resolve(here,n)
  if (existsSync(p)) throw new Error(`Do not overwrite ${p}`)
  writeFileSync(p,JSON.stringify(data,null,2)+'\n')
  json(p)
  return bind(p)
}
const verify = (b: any) => {
  const actual = bind(resolve(root,b.path))
  if (actual.sha256 !== b.sha256 || actual.bytes !== b.bytes) throw new Error(`Input changed: ${b.path}`)
}
const input = json(resolve(here,'two-children-full-goals-four-cases-source13-partners22.science-only.input.json'))
const seal = json(resolve(here,'two-semantic-children.independent-A.science-FIRST.freeze.json'))
verify(seal.wholeScienceInput); verify(seal.scientificVerdict)
const science = json(resolve(root,seal.scientificVerdict.path))
if (science.childJudgments.length !== 2 || science.childJudgments.some((j:any)=>j.semanticKind!=='curricularAtomic' || !j.semanticAtomic || j.PWholeGoalScience!=='SUPPORTED for this exact candidate whole goal')) throw new Error('Own bounded science judgment missing')
const original = json(resolve(root,input.exactOriginalInputBindings.exactOriginalInputs.path))
verify(original.activeCanonical)
const baseline = json(resolve(root,original.activeCanonical.path))
const proposed = structuredClone(baseline)
const parentIndex = proposed.goals.findIndex((g:any)=>g.id===input.wholeOriginalParent.id)
if (parentIndex<0 || JSON.stringify(proposed.goals[parentIndex])!==JSON.stringify(input.wholeOriginalParent)) throw new Error('Parent changed')
if (input.wholeCandidateChildren.some((c:any)=>proposed.goals.some((g:any)=>g.id===c.id))) throw new Error('Child already active')
proposed.goals[parentIndex]=structuredClone(input.candidateParentCluster)
proposed.goals.push(...structuredClone(input.wholeCandidateChildren))
const landscape = write('isolated-proposed481-parent-area-two-children.validation-snapshot.json',proposed)
const kindsOriginalPath = resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-systematics-behavior-eighteen-whole-author-v1/input/current-kinds394-root23-landscape-path-only.candidate.json')
const kinds = json(kindsOriginalPath)
const model = await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
const parentKind = kinds.decisions.find((r:any)=>r.goalId===input.wholeOriginalParent.id)
parentKind.semanticKind='curricularArea'
parentKind.sourceFingerprint=model.fingerprintSemanticKindSourceGoal(input.candidateParentCluster)
parentKind.decisionBasis='independent-A-science-FIRST-reviewed-inactive-parent-area-validation-only'
for (const child of input.wholeCandidateChildren) {
  kinds.decisions.push({goalId:child.id,sourceFingerprint:model.fingerprintSemanticKindSourceGoal(child),semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'independent-A-science-FIRST-reviewed-inactive-child-validation-only'})
}
// Authoritative only within this explicitly inactive validation snapshot.
// No current ledger, source, placement, native D/P/V or human approval follows.
kinds.sourceLandscapePath=landscape.path
kinds.reviewMethod='independent-A-science-FIRST-inactive-proposed-split-validation-only'
kinds.counts.curricularAtomic=395; kinds.counts.curricularArea=47; kinds.counts.total=481
const kindBinding=write('isolated-proposed395-atomic47-area.semantic-kinds.validation-only.json',kinds)
const authorEntry = json(resolve(root,input.neutralAuthorEntry.path))
verify(authorEntry.proposedGoalAndKindBoundPRecords)
const originalRecordBytes=readFileSync(resolve(root,authorEntry.proposedGoalAndKindBoundPRecords.path))
const records=originalRecordBytes.toString('utf8').trim().split(/\r?\n/u).map((l:string)=>JSON.parse(l))
if (records.length!==2 || records.some((r:any,i:number)=>r.goalId!==input.wholeCandidateChildren[i].id || r.status!=='needs_human_review' || r.reviewAuthority!=='ai_candidate' || r.evidenceLevel!=='E1' || r.maximumClaimScope!=='G1' || JSON.stringify(r.profile)!==JSON.stringify(input.wholeChildProfilesAndCases[i].wholeProfile))) throw new Error('Exact AI candidate status/profile mismatch')
const recordsPath=resolve(here,'two-proposed-child-P2.exact-author-candidate-records.jsonl')
if (existsSync(recordsPath)) throw new Error('Do not overwrite own record copy')
writeFileSync(recordsPath,originalRecordBytes)
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-systematics-behavior-eighteen-whole-author-v1/input/profile-criteria.original.md'
const config=write('two-proposed-child-P2.isolated-validation.config.json',{
  $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  schemaVersion:2,reviewId:records[0].reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
  landscapeId:baseline.landscapeId,landscapePath:landscape.path,semanticKindLedgerPath:kindBinding.path,
  reviewCriteriaPath:criteriaPath,reviewPath:relative(root,recordsPath),reviewRunManifestPaths:[],reviewedResourceTypes:[],requireApproved:false,
  scope:{label:'Two independently science-reviewed inactive proposed children; bounded normal-P validation only; Source/Course/placement/native/V/human gates remain open',goalIds:input.wholeCandidateChildren.map((c:any)=>c.id)},
})
verify(original.activeCanonical); verify(seal.wholeScienceInput); verify(seal.scientificVerdict)
const receipt=write('isolated-normal-P2-input-creation.actual.json',{
  schemaVersion:1,createdAt:new Date().toISOString(),role:'Exact proposed-split validation inputs after own science FIRST; no active integration',
  ownScienceFIRST:bind(resolve(here,'two-semantic-children.independent-A.science-FIRST.freeze.json')),
  baseline:original.activeCanonical,originalKindLedger:bind(kindsOriginalPath),landscape,kindLedger:kindBinding,
  records:bind(recordsPath),recordsByteExactAuthorCopy:true,config,criteria:bind(resolve(root,criteriaPath)),
  inactiveNodeCount:481,inactiveCurricularAtomicCount:395,inactiveCurricularAreaCount:47,
  onlyExistingParentKindChangedAndTwoChildrenAdded:true,
  kindAuthorityScope:'Local isolated validation of own independently science-reviewed proposed goals. Current active kind ledger and source/placement/native approvals are unchanged; neither an integrated release nor M7 is asserted.',
  nativeApproval:false,sourceApproval:false,projectionApproval:false,currentVApproval:false,humanApproval:false,humanTrial:false,
  newScientificStrictClosures:0,restoredBindings:0,strictGain:0,activeWrites:[],
})
console.log(JSON.stringify({receipt,config,proposedRecords:2,strictGain:0},null,2))
