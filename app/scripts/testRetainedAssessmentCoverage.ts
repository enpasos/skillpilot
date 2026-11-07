// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { captureCurriculumSource, createRetainedCoverageContext, coverageSha256, exactMeaningEvidenceMatches,
  INFO_FIRST, INFO_HELD, protectedAssessmentMeaning, RETAINED_INFO_OWNER as OWNER,
  stableCoverageJson, verifyRetainedHistory, type ExactMeaningEvidence } from './lib/retainedAssessmentCoverage'
import { hasCompletePassingCurriculumExamReadiness } from './lib/curriculumAssessmentValidation'
import { discoverCurriculumAssessmentScope, evaluateCurriculumExamReadiness } from './generateCurriculumQualityStatus'
import { collectCurriculumMaturityFloorFailures } from './checkCurriculumMaturityFloors'
const root = resolve(import.meta.dirname, '../..')
const reference = resolve(root, 'contracts/curriculum-assessment-coverage/v1/informatics')
const historyRaw = gunzipSync(readFileSync(resolve(reference, 'historical-informatics-source.json.gz')))
const inventoryRaw = readFileSync(resolve(reference, 'history-inventory.json'))
const original: SkillLandscape = JSON.parse(historyRaw.toString())
interface TestInventory { owner: string; definitions: Array<{ goalId: string; historicalGoalObjectSha256: string; coverage: { state: string; resolvedAtomicGoalIds?: string[] } }> }
const inventory = JSON.parse(inventoryRaw.toString()) as TestInventory
const fields = (value: unknown): Record<string, unknown> => value as Record<string, unknown>
const clone = () => structuredClone(original)
const goal = (s: SkillLandscape, id: string): LearningGoal => s.goals.find(g => g.id === id)!
const Q3 = ['8877a2e6-ebf8-5b73-a88b-56d5145a20ba','0c346dc1-fdcc-5563-9154-28623d354574']
const CLUSTER = '31026f4a-629b-571f-b45d-a87f47a09d9e', ADDITION = '875cb53c-b48d-5b2b-8cb0-e20f27534f16'
const undeclared = inventory.definitions.filter((r) => r.coverage.state === 'undeclared').map((r) => r.goalId) as string[]
const oldAtoms = (id: string): string[] => { const row = inventory.definitions.find(r => r.goalId === id); assert.ok(row?.coverage.resolvedAtomicGoalIds); return row.coverage.resolvedAtomicGoalIds }
const bind = (source: SkillLandscape, views: string[] = []) => {
  const captured = captureCurriculumSource('fixtures/captured-informatics-source.json', JSON.stringify(source)) as SkillLandscape
  const definitions = captured.goals.filter(g => g.examData || g.nodeKind === 'exam').map(g => g.id).sort()
  const retainedCoverage = createRetainedCoverageContext(root, captured, definitions, [], views)!
  // Native current scope discovery is separately exercised; isolate the finite
  // retained/structure contract from unrelated published route configuration.
  const expectedScope = Object.freeze({ landscapeId: OWNER, definitionGoalIds: Object.freeze(definitions), requiredGoalIds: Object.freeze([] as string[]), discoveryIssues: Object.freeze([] as string[]), retainedCoverage })
  const rules = evaluateCurriculumExamReadiness(captured, [], [captured], expectedScope)
  return { source: captured, scope: expectedScope, manifest: retainedCoverage.manifest, rules,
    structure: rules.find(r => r.id === 'CQR-204')! }
}
const row = (bundle: ReturnType<typeof bind>, id: string) => bundle.manifest.rows.find(r => r.goalId === id)!
const fails = (s: SkillLandscape, id: string, code: string) => assert.ok(row(bind(s), id).issues.some(i => i.startsWith(code)), `${id}: ${code}`)
const results: Array<{ id: string; checks: string; status: string }> = []
const group = (id: string, checks: string, execute: () => void) => { execute(); results.push({ id, checks, status: 'pass' }); console.log(`retained coverage ${id}: pass (${checks})`) }
group('T01', 'bound actual24; six generic placeholders plus four known missing-input materials remain hard', () => {
  const b = bind(clone()); assert.equal(b.manifest.status,'pass'); assert.equal(b.manifest.rows.length,24)
  assert.equal(b.manifest.rows.filter(r => r.decision === 'declared-preserved').length,14)
  assert.equal(b.manifest.rows.filter(r => r.decision === 'undeclared-preserved').length,10)
  assert.equal(b.structure.status,'fail'); assert.equal(b.structure.assessmentValidation!.failingGoalIds.length,10)
  for (const id of ['b86e8ab3-2c12-5b6b-b515-1e7d457c99c2','d13e297f-505d-576a-9a86-11ab4d7896c9',
    'd9892508-97b5-529e-9b9e-c4889fba2166','4e0668e3-edca-57f4-b258-df87f23d2b4e']) {
    assert.ok(b.structure.details?.some(detail => detail.startsWith(id + ': missing concrete ER/')))
  }
})
for (const [index, id] of Q3.entries()) group(`T0${index+2}`, `native isolated Q3 ${[21,18][index]}→${[22,19][index]}`, () => {
  const s = clone(); goal(s,CLUSTER).contains!.push(ADDITION)
  goal(s,Q3[1-index]).examData!.coveredGoalIds = oldAtoms(Q3[1-index])
  const b = bind(s); assert.deepEqual(b.manifest.failingGoalIds,[id])
  const r = row(b,id); assert.ok(r.issues.includes('coverage-added')); assert.equal(r.coverage!.historyAtomicGoalKeys!.length,[21,18][index])
  assert.equal(r.coverage!.currentAtomicGoalKeys.length,[22,19][index]); assert.equal(b.structure.status,'fail')
})
group('T04', 'actual frozen V2 source both Q3 drifts independently found', () => {
  const path = resolve(import.meta.dirname,'fixtures/retained-assessment-coverage/informatics-v2.json.gz')
  const raw = gunzipSync(readFileSync(path)); const pin=JSON.parse(readFileSync(resolve(import.meta.dirname,'fixtures/retained-assessment-coverage/informatics-v2.pin.json'),'utf8'))
  assert.equal(pin.rawSha256,'7586e38b7c96688bc8c5f02b2e2b1327284d271c73404693c9f872d29422d661');assert.equal(coverageSha256(raw),pin.rawSha256); const s=JSON.parse(raw.toString()); const b=bind(s)
  for (const id of Q3) assert.ok(row(b,id).issues.includes('coverage-added'))
})
group('T05', 'all14 explicit native pins; UNKNOWN not replaced; no V2 blanket pass', () => {
  const s=clone();goal(s,CLUSTER).contains!.push(ADDITION)
  for (const id of Q3) goal(s,id).examData!.coveredGoalIds=oldAtoms(id)
  const b=bind(s); assert.equal(b.manifest.status,'pass'); assert.equal(b.manifest.rows.filter(r=>r.historyKind==='declared').length,14)
  for(const id of undeclared) assert.equal(Object.hasOwn(row(b,id),'coverage'),false)
})
group('T06', 'same-cardinality atom swap and removal fail', () => {
  for(const swap of [true,false]) { const s=clone(), ids=oldAtoms(Q3[0]);goal(s,Q3[0]).examData!.coveredGoalIds=swap?[...ids.slice(1),ADDITION]:ids.slice(1)
    fails(s,Q3[0],'coverage-removed'); if(swap) fails(s,Q3[0],'coverage-added') }
})
group('T07', 'own and covered protected meaning; unknown fields not ignored', () => {
  for(const id of [Q3[0],oldAtoms(Q3[0])[0]]) {const s=clone();goal(s,id).description+=' Eine weitere Kompetenz.';fails(s,Q3[0],'meaning-change-unproved')}
  const s=clone();fields(goal(s,Q3[0])).newRecognitionClaim=true;fails(s,Q3[0],'meaning-change-unproved')
})
group('T08', 'task solution rubric and threshold changes blocked', () => {
  for(const key of ['taskContent','solutionContent','rubric','threshold']) {const s=clone(),e=goal(s,Q3[0]).examData!
    if(key==='rubric')e.scoring.steps[0].description+=' weiter';else if(key==='threshold')e.scoring.passingPoints++;else e[key]+=' weiter'
    fails(s,Q3[0],'meaning-change-unproved') }
})
group('T09', 'exact evidence pins positive; stale pins owner source meaning and atoms negative', () => {
  const old=protectedAssessmentMeaning(goal(original,Q3[0]),true),updated=fields(structuredClone(old));updated.title=String(updated.title)+' redaktionell'
  const pins=[{path:'original',sha256:coverageSha256('independent original review')},{path:'recheck',sha256:coverageSha256('independent bounded recheck')}]
  const evidence:ExactMeaningEvidence={kind:'exact-equivalence-binding',owner:OWNER,goalId:Q3[0],sourceSha256:'exact-source',oldMeaningSha256:coverageSha256(stableCoverageJson(old)),newMeaningSha256:coverageSha256(stableCoverageJson(updated)),atomicGoalKeys:oldAtoms(Q3[0]).map(id=>`${OWNER}:${id}`),evidencePins:pins,rationale:'Exact bounded editorial repair independently reviewed.'}
  const read=(p:string)=>Buffer.from(p==='original'?'independent original review':'independent bounded recheck')
  const matches=(e:unknown)=>exactMeaningEvidenceMatches(e as ExactMeaningEvidence,OWNER,Q3[0],'exact-source',old,updated,evidence.atomicGoalKeys!,read)
  assert.equal(matches(evidence),true)
  for(const patch of [{owner:'foreign'},{sourceSha256:'stale'},{newMeaningSha256:'stale'},{atomicGoalKeys:[]},{evidencePins:[...pins.slice(0,1),{path:'recheck',sha256:'new'}]},{approved:true}])assert.equal(matches(patch.approved?patch:{...evidence,...patch}),false)
  const s=clone();goal(s,Q3[0]).title+=' redaktionell';fails(s,Q3[0],'meaning-change-unproved')
})
group('T10', 'all ten unchanged ABSENT own contracts preserved without coverage member', () => {
  const b=bind(clone());assert.equal(undeclared.length,10)
  for(const id of undeclared){assert.equal(row(b,id).decision,'undeclared-preserved');assert.equal(Object.hasOwn(row(b,id),'coverage'),false)}
})
group('T11', 'every ABSENT→empty/null/list and new claim fails', () => {
  for(const id of undeclared)for(const refs of [[],null,[oldAtoms(Q3[0])[0]]]){const s=clone();fields(goal(s,id).examData).coveredGoalIds=refs;fails(s,id,'undeclared-transition')}
  const s=clone();fields(goal(s,undeclared[0]).examData).recognizesOtherGoals=true;fails(s,undeclared[0],'meaning-change-unproved')
})
group('T12', 'direct inherited transitive requires never become coverage', () => {
  const s=clone();goal(s,Q3[0]).requires=[ADDITION];goal(s,CLUSTER).requires=[ADDITION];goal(s,ADDITION).requires=[oldAtoms(Q3[0])[0]]
  assert.equal(bind(s).manifest.status,'pass')
})
group('T13', 'history exact source/inventory pins, internal row owner and contents', () => {
  assert.deepEqual(verifyRetainedHistory(historyRaw,inventoryRaw).issues,[])
  for(const mutate of [(x:TestInventory)=>x.definitions.pop(),(x:TestInventory)=>x.definitions.push(x.definitions[0]),(x:TestInventory)=>x.owner='foreign',(x:TestInventory)=>x.definitions[0].historicalGoalObjectSha256='new']){const x=JSON.parse(inventoryRaw.toString());mutate(x);assert.ok(verifyRetainedHistory(historyRaw,Buffer.from(JSON.stringify(x))).issues.length)}
  const changed=clone();goal(changed,Q3[0]).title+=' new';assert.ok(verifyRetainedHistory(Buffer.from(JSON.stringify(changed)),inventoryRaw).issues.includes('history-binding-invalid'))
})
group('T14', 'view absence review draft preserve24; source deletion/type change fail', () => {
  const s=clone();goal(s,Q3[0]).examData!.reviewStatus='draft';goal(s,Q3[0]).phase='private';assert.equal(bind(s).manifest.status,'pass')
  const missing=clone();missing.goals=missing.goals.filter(g=>g.id!==Q3[0]);fails(missing,Q3[0],'missing-historical-definition')
  const cluster=clone();goal(cluster,Q3[0]).contains=[ADDITION];fails(cluster,Q3[0],'non-atomic-exam')
})
group('T15', 'native missing cycle duplicate foreign malformed refs fail closed', () => {
  for(const refs of [['missing'],[`foreign:${oldAtoms(Q3[0])[0]}`],[`:${oldAtoms(Q3[0])[0]}`],[`${OWNER}:${oldAtoms(Q3[0])[0]}:extra`],null,[],[null]]){const s=clone();fields(goal(s,Q3[0]).examData).coveredGoalIds=refs;assert.equal(row(bind(s),Q3[0]).decision,'fail')}
  for(const contains of [null, {}, 'malformed', [null], [`foreign:${oldAtoms(Q3[0])[0]}`]]) {const s=clone();fields(goal(s,CLUSTER)).contains=contains;fails(s,Q3[0],'unresolved-reference')}
  const cyc=clone();goal(cyc,CLUSTER).contains!.push(CLUSTER);fails(cyc,Q3[0],'unresolved-reference')
  const dup=clone();dup.goals.push(structuredClone(goal(dup,oldAtoms(Q3[0])[0])));fails(dup,Q3[0],'duplicate-definition')
  const qualified=clone();goal(qualified,Q3[0]).examData!.coveredGoalIds=oldAtoms(Q3[0]).map(id=>`${OWNER}:${id}`);assert.equal(row(bind(qualified),Q3[0]).decision,'declared-preserved')
})
group('T16', 'captured immutable source vs later fresh bytes and stale frame', () => {
  const s=clone(),b=bind(s);goal(s,Q3[0]).description+=' caller mutation';assert.equal(row(b,Q3[0]).decision,'declared-preserved')
  assert.ok(Object.isFrozen(b.source.goals[0]));assert.throws(()=>{b.source.goals[0].title='mutated'})
  const fresh=bind(s);assert.notEqual(fresh.manifest.frameDigest,b.manifest.frameDigest);assert.equal(fresh.manifest.status,'fail')
  const mismatched=evaluateCurriculumExamReadiness(fresh.source,[],[fresh.source],b.scope).find(r=>r.id==='CQR-204')!;assert.equal(mismatched.status,'fail');assert.ok(mismatched.assessmentValidation!.discoveryIssues.some(i=>i.startsWith('current-frame-invalid')))
})
group('T17', 'missing duplicate fabricated CQR204 manifests are rejected by native consumer', () => {
  const b=bind(clone()); const nativeScope=discoverCurriculumAssessmentScope(b.source,[],[b.source]);assert.equal(nativeScope.retainedCoverage!.manifest.status,'pass')
  for(const rules of [[],[b.structure,b.structure],b.rules.map(r=>({...r,status:'pass',assessmentValidation:{...r.assessmentValidation!,retainedCoverageManifest:{...b.manifest,rows:[],status:'pass'}}}))])assert.equal(hasCompletePassingCurriculumExamReadiness(rules,OWNER,b.scope),false)
})
group('T18', 'missing fabricated replayed expected context and policy IDs never opt out', () => {
  const b=bind(clone());for(const scope of [undefined,{...b.scope,retainedCoverage:undefined},JSON.parse(JSON.stringify(b.scope)),{...b.scope,retainedCoverage:{manifest:b.manifest}}])assert.equal(hasCompletePassingCurriculumExamReadiness(b.rules,OWNER,scope),false)
  for(const policyId of ['default','changed-policy'])assert.ok(collectCurriculumMaturityFloorFailures({curricula:[{landscapeId:OWNER,frameworkId:'fixture',subject:'Fixture',maturity:'M7',rules:b.rules}]},{schemaVersion:1,policyId,baselineDate:'2026-08-20',exceptions:[],knownPreBaselineRegressions:[],floors:[{landscapeId:OWNER,frameworkId:'fixture',subject:'Fixture',minimumMaturity:'M6',reason:'required retained contract'}]},new Map([[OWNER,b.scope]])).some(f=>f.includes('assessment reports')))
})
group('T19', 'new20 first binding pending; unknown standalone and alias remain unregistered', () => {
  const s=clone(),e=structuredClone(goal(s,Q3[0]));e.id=INFO_FIRST;e.examData!.coveredGoalIds=oldAtoms(Q3[0]).slice(0,20);s.goals.push(e);fails(s,INFO_FIRST,'first-binding-pending')
  const standalone=clone(),n=structuredClone(goal(standalone,undeclared[0]));n.id='11111111-1111-4111-8111-111111111111';standalone.goals.push(n);fails(standalone,n.id,'unregistered-introduction')
})
group('T20', 'held HE absent positive; active source/view appearance hard fail', () => {
  assert.ok(!bind(clone()).manifest.introductionGoalIds.includes(INFO_HELD))
  const s=clone(),e=structuredClone(goal(s,Q3[0]));e.id=INFO_HELD;s.goals.push(e);fails(s,INFO_HELD,'held-introduction')
  const dir=mkdtempSync(resolve(tmpdir(),'retained-views-'));try{const p=resolve(dir,'held.view.json');writeFileSync(p,JSON.stringify({viewId:'held-negative',landscapeId:OWNER,scope:{stage:'CrossStage'},rootNodes:[{kind:'goalEntry',goalId:INFO_HELD}]}));assert.ok(bind(clone(),[p]).manifest.discoveryIssues.some(i=>i.startsWith('held-introduction')))}finally{rmSync(dir,{recursive:true,force:true})}
})
export const retainedCoverageTestResults = results
console.log(JSON.stringify({retainedCoverageGroups:results.length,groups:results}))

await import('./testRetainedAssessmentHeldView')
