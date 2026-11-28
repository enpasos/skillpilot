// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import type { LearningGoal } from '../src/landscapeTypes'

type GoalDocument = { goals: LearningGoal[] }
type FilePins = { files: { path: string; sha256: string; bytes: number }[] }
type Asset = { svg: string; png: string; svgSha256: string; pngSha256: string; solutionOnly: boolean; proposedPublicUrl: string }

const root=resolve(import.meta.dirname,'../..')
const quality='curricula/DE/Gymnasium/quality/assessment-review/mathematik/diagram-route-repair-20261115-v1'
const source='curricula/DE/Gymnasium/assessments/mathematik/seki/j7/diagram-route-repair-20261115-v1'
const read=<T>(path:string):T=>JSON.parse(readFileSync(resolve(root,path),'utf8')) as T
const sha=(path:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')
const canonical=read<GoalDocument>('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const byId=new Map(canonical.goals.map(g=>[g.id,g]))
const definitions=read<LearningGoal[]>(source+'/assessment-definitions.json')
const frozen=read<LearningGoal[]>(quality+'/frozen-review-v2/proposed/'+source+'/assessment-definitions.json')
const receipt=read<{ decision: string; humanApproval: boolean }>(quality+'/independent-review-v2/review-receipt.actual.json')
assert.equal(receipt.decision,'content_approved_for_integration')
assert.equal(receipt.humanApproval,false)
assert.equal(sha(quality+'/independent-review-v2/review.md'),
 'sha256:f4765ff1849799c2dd3bf69f26aa557ef10870f1729529723dec2deba2d7c901')
for(const version of ['v1','v2']) {
 const dir=quality+'/frozen-review-'+version
 const entry=read<FilePins>(dir+'/review-entry.json')
 for(const pin of entry.files) {
  assert.equal(sha(dir+'/'+pin.path),pin.sha256,`Changed immutable ${version} evidence: ${pin.path}`)
  assert.equal(readFileSync(resolve(root,dir,pin.path)).length,pin.bytes)
 }
}
const expected=[
 ['axes','f4fda40d-dca5-510b-bd6d-f7874b3d7b9b','80c232f1-8f72-5829-9dbe-5a610ccab3be',10],
 ['trends','d9c49084-084e-5142-859c-33c53403ccf1','496f16a0-c031-5753-b988-d6cd3cab595e',16],
 ['claims','c76fae5e-70e6-5f20-9abe-e9e790d95324','fcfbff12-bd03-52ec-b242-a693212b3d2b',8],
 ['correction','57bf531d-0920-5424-bef4-f704f5462477','d668c22d-caeb-5e91-8980-721c931a2bcf',12],
] as const
assert.equal(definitions.length,4)
const withoutReleaseMetadata=(g:LearningGoal)=>{
 const c=structuredClone(g)
 assert(c.examData)
 delete c.examData.reviewStatus;delete c.examData.reviewNote
 return c
}
for(const [key,id,covered,max] of expected) {
 const goal=byId.get(id),author=definitions.find(g=>g.id===id),approved=frozen.find(g=>g.id===id)
 assert(goal && author && approved, `Missing reviewed goal: ${id}`)
 assert.deepEqual(goal,author,`Source/runtime drift: ${key}`)
 assert.deepEqual(withoutReleaseMetadata(goal),withoutReleaseMetadata(approved),`Unreviewed content/rubric change: ${key}`)
 const e=goal.examData
 assert(e && approved.examData && e.reviewNote)
 assert.equal(e.reviewStatus,'released')
 assert.ok(e.reviewNote.includes(quality+'/independent-review-v2/review.md'))
 assert.deepEqual(goal.requires,[covered]);assert.deepEqual(e.coveredGoalIds,[covered])
 assert.equal(goal.extendedData?.applicabilityFromRequires,true)
 assert.equal(goal.extendedData?.applicabilityMappingInheritance,'boundary')
 assert.deepEqual(goal.applicability,byId.get(covered)?.applicability)
 assert.equal(e.scoring.maxPoints,max);assert.equal(e.scoring.passingPoints,max)
 assert.equal(e.scoring.steps.reduce((n,s)=>n+s.points,0),max)
 for(const step of e.scoring.steps) {
  assert.equal(step.points,2)
  assert.ok(max-1<e.scoring.passingPoints,'A partial essential criterion must not be compensated')
  for(const marker of ['2:','1:','0:'])assert.ok(step.description.includes(marker))
 }
 for(const field of ['taskContent','taskContentEn'] as const) {
  assert(e[field])
  assert.equal(e[field],approved.examData[field])
  assert.ok(!/passingPoints|Bestehensgrenze|General essential-criteria grading policy|Allgemeine Bewertung der Kernkriterien/u.test(e[field]),
   'Task fields must not expose evaluation material before submission')
 }
 for(const lang of ['de','en']) {
  const active=readFileSync(resolve(root,source,key+'.'+lang+'.md'),'utf8')
  const old=readFileSync(resolve(root,quality,'frozen-review-v2/proposed',source,key+'.'+lang+'.md'),'utf8')
  assert.equal(active,old.replace('DRAFT / needs_review · CC-BY-4.0 · SkillPilot',
    'Machine content review released · CC-BY-4.0 · SkillPilot'))
 }
}
const material=read<Asset[]>(quality+'/frozen-review-v2/asset-manifest.json')
const taskUrls=new Set<string>()
for(const goal of definitions)for(const field of ['taskContent','taskContentEn'] as const) {
 const body=goal.examData?.[field]
 assert(body)
 for(const m of body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/gu))taskUrls.add(m[1])
}
for(const asset of material) {
 for(const format of ['svg','png'] as const) assert.equal(sha(asset[format].replace(/^proposed\//u,'')),asset[format==='svg'?'svgSha256':'pngSha256'])
 if(asset.solutionOnly)assert.equal(taskUrls.has(asset.proposedPublicUrl),false)
}
const input=read<GoalDocument>(quality+'/frozen-review-v1/inputs/current-four-goals-and-task5.json')
const originalTask5=input.goals.find((g)=>g.id==='af96c2fc-194e-55af-ac0f-8afda17bf3cd')
assert(originalTask5?.examData?.coveredGoalIds)
const expectedTask5=structuredClone(originalTask5)
assert(expectedTask5.examData?.coveredGoalIds)
const diagramId='d668c22d-caeb-5e91-8980-721c931a2bcf'
expectedTask5.requires=expectedTask5.requires.filter((id:string)=>id!==diagramId)
expectedTask5.examData.coveredGoalIds=expectedTask5.examData.coveredGoalIds.filter((id:string)=>id!==diagramId)
assert.deepEqual(byId.get(expectedTask5.id),expectedTask5,'Task5 must change only its false diagram prerequisite and coverage')
const originalParent=input.goals.find((g)=>g.id==='811d6d09-130e-47b2-aba8-a5c401fe3251')
assert(originalParent)
const parent=byId.get(originalParent.id)
assert(parent)
assert.deepEqual(parent.contains,[...originalParent.contains,...expected.map(([,id])=>id)])
assert.equal(parent.weight,13)
const semantic=read<{ counts: { curricularAtomic: number }; decisions: { goalId: string; semanticKind: string }[] }>('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')
// The four reviewed planar vector goals raise the curricular total from 807 to 811.
assert.equal(semantic.counts.curricularAtomic, 811, 'Unexpected number of curricular Mathematics goals')
for(const [,id] of expected)assert.equal(semantic.decisions.find(d=>d.goalId===id)?.semanticKind,'practiceAssessment')
console.log('Math diagram assessment release guards passed: exact approved content/assets, essential scoring, task/solution separation and narrow Task5 correction.')
