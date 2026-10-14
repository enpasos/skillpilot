// SPDX-License-Identifier: Apache-2.0
// Bounded author technical check. It creates no selectable review or approval.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
const root = dirname(fileURLToPath(import.meta.url))
const repo = resolve(root, '../../../../../../..')
const req = createRequire(resolve(repo, 'app/package.json'))
const Ajv2020 = req('ajv/dist/2020.js').default
const api = await import(pathToFileURL(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const load = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (b: Buffer|string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const sorted = (x: any): any => Array.isArray(x) ? x.map(sorted) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, sorted(x[k])])) : x
const objectSha = (x: any) => sha(JSON.stringify(sorted(x)))
const envelope = load(resolve(root, 'author-profiles.ten.raw.json'))
const selected = load(resolve(root, 'inputs/whole-ten-current-goals.exact.json'))
const cases = load(resolve(root, 'materials/twenty-complete-DEEN-cases.author.json'))
const canonical = load(resolve(root, 'inputs/canonical551.current419.exact.json'))
const provenance = load(resolve(root, 'INPUTS.scope-provenance-and-role.actual.json'))
const schema = load(resolve(repo, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const validate = new Ajv2020({allErrors:true, strict:true}).compile({$schema:schema.$schema, $defs:schema.$defs, $ref:'#/$defs/profile'})
const errors: string[] = []
const details: any[] = []
if (envelope.profiles.length !== 10 || cases.cases.length !== 20 || canonical.goals.length !== 551) errors.push('Wrong exact scope sizes')
if (envelope.evidenceLevel !== 'E0' || envelope.maximumClaimScope !== 'G0' || !envelope.unreviewed || envelope.strictGain !== 0) errors.push('Excess author claim')
if (envelope.reviewRecordsCreated || envelope.activeConfigCreated || envelope.gateClearancesCreated.length || envelope.independentScientificReviewRunIds.length || envelope.learnerExecutions.length) errors.push('Unexpected approval/execution')
for (const item of provenance.exactInputs) {
  const local = readFileSync(resolve(root,item.localPath))
  const source = readFileSync(resolve(repo,item.sourcePath))
  if (!source.equals(local) || sha(local) !== item.sha256) errors.push('Exact source copy differs: '+item.localPath)
}
const criteria = sha(readFileSync(resolve(root,'inputs/positive-profile-criteria.exact.md')))
for (const [i,row] of envelope.profiles.entries()) {
  const goal = selected.goals[i]
  if (row.goalId !== goal.id || envelope.goalIds[i] !== goal.id || JSON.stringify(goal) !== JSON.stringify(canonical.goals.find((g: any)=>g.id===goal.id)) || objectSha(goal) !== row.wholeGoalObjectSha256) errors.push('Whole goal differs: '+row.goalId)
  if (!validate(row.profile)) errors.push(row.goalId+' schema: '+JSON.stringify(validate.errors))
  if (row.profile.expectations.length !== 4 || row.profile.applicationCaseBriefs.length !== 2 || row.fullCaseReferences.length !== 2) errors.push('Wrong four/two profile scope: '+row.goalId)
  const digests: Record<string,string> = {}
  const assets: any[] = []
  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    const path = resolve(repo,'app/public',link.url.slice(1)), bytes=readFileSync(path)
    digests[link.url]=sha(bytes)
    assets.push({url:link.url,path:relative(repo,path),sha256:sha(bytes),bytes:bytes.length,newVisualVote:false})
  }
  const goalFingerprint=api.fingerprintGoalForPositiveEvidence(goal,'curricularAtomic')
  const profileFingerprint=api.fingerprintPositiveGoalEvidenceProfile(row.profile)
  const reviewInputFingerprint=api.fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,digests,'curricularAtomic')
  // Ephemeral metadata only, discarded after the existing semantic helper.
  const carrier={goalId:goal.id,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,goalFingerprint,reviewInputFingerprint,profileFingerprint,status:'needs_human_review',reviewAuthority:'ai_candidate',profile:row.profile}
  errors.push(...api.validatePositiveGoalEvidenceRecordSemantics(carrier,goal,digests,'curricularAtomic'))
  for (const [j,ref] of row.fullCaseReferences.entries()) {
    const c=cases.cases[Number(ref.jsonPointer.split('/').at(-1))]
    if (!c || c.id !== ref.caseId || c.goalId !== goal.id || objectSha(c) !== ref.wholeCaseObjectSha256) errors.push('Full case mismatch: '+ref.caseId)
    if (!row.profile.applicationCaseBriefs[j].taskDemandDe.includes(c.id) || !row.profile.applicationCaseBriefs[j].taskDemandEn.includes(c.id)) errors.push('Missing explicit full case reference: '+c.id)
    for (const field of ['materialDe','materialEn','taskDemandDe','taskDemandEn','modelAnswerDe','modelAnswerEn']) if (!c[field]?.trim()) errors.push('Missing full bilingual case field: '+c.id+'/'+field)
    if (c.rubric.length !== 4 || JSON.stringify(c.rubric.map((r:any)=>r.expectationId)) !== JSON.stringify(['e1','e2','e3','e4'])) errors.push('Wrong exact four rubric mapping: '+c.id)
    for (const r of c.rubric) for (const field of ['fullCreditDe','fullCreditEn','partialCreditDe','partialCreditEn']) if (!r[field]?.trim()) errors.push('Missing bilingual criterion: '+c.id+'/'+field)
    if (c.executed || c.learnerWorkPresent || c.actualObservationRecords.length || c.actualPointsAwarded !== null || c.rubric.some((r:any)=>r.actualPointsAwarded !== null)) errors.push('Invented learner work/score: '+c.id)
    if (c.practicalExecutionRequired && !c.rubric.some((r:any)=>r.creditBasis.includes('practical'))) errors.push('Practical operator lacks actual observation requirement: '+c.id)
  }
  details.push({goalId:goal.id,goalFingerprint,profileFingerprint,reviewInputFingerprint,reviewCriteriaFingerprint:criteria,resourceDigests:digests,unchangedAssets:assets,technicalSchemaAndSemanticsValid:true,independentScientificApproval:false})
}
const byId=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const dag: any={}
for (const edge of ['requires','contains']) {
  const visited=new Set<string>(),active=new Set<string>();let count=0
  const visit=(id:string)=>{if(active.has(id)){errors.push(edge+' cycle at '+id);return}if(visited.has(id))return;active.add(id);const g:any=byId.get(id);for(const next of g[edge]??[]){count++;if(!byId.has(next))errors.push(edge+' unresolved '+next);else visit(next)}active.delete(id);visited.add(id)}
  for(const id of byId.keys())visit(String(id));dag[edge]={goalsVisited:visited.size,edges:count}
}
const report={schemaVersion:1,checkedAtUTC:new Date().toISOString(),role:'author/technical check only; no science vote',evidenceLevel:'E0',maximumClaimScope:'G0',scope:{wholeCanonical:551,profiles:10,expectations:40,fullCases:20,rubricCriteria:80},productionSources:['app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json'],selectableReviewRowsWritten:0,scientificReviewRuns:0,wholeGoalChanges:0,newGateClearances:0,dag,details,errors}
writeFileSync(resolve(root,'CHECK.raw-profile-schema-whole-CAS-and-full-cases.actual.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({profiles:10,expectations:40,cases:20,rubrics:80,errors}))
if(errors.length)process.exitCode=1
