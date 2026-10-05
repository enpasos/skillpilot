import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const out = dirname(fileURLToPath(import.meta.url))
const root = resolve(out, '../../../../../../..')
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const read = async (path: string) => JSON.parse(await readFile(resolve(root, path), 'utf8'))
const local = async (name: string) => JSON.parse(await readFile(resolve(out, name), 'utf8'))
const sha = async (path: string) => `sha256:${createHash('sha256').update(await readFile(resolve(root, path))).digest('hex')}`
const errors: string[] = []
const snapshot = await local('six-proposed.validation-snapshot.json')
const operative = await read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const desc = await local('six-finalized-description.candidates.json')
const companions = await local('two-preservation-companions.candidates.json')
const v2 = await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-candidate-v2/description-decisions.candidates.json')
const oldCompanions = await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-candidate-v2/split-companions.candidates.v3.json')
const goalById = new Map<string, any>(snapshot.goals.map((g: any) => [g.id, g]))
const currentById = new Map<string, any>(operative.goals.map((g: any) => [g.id, g]))
const ids = desc.goals.map((d: any) => d.goalId)
// Match ordinary JSON Schema behavior: required fields declared in a parent
// schema remain required inside its composition branches. Ajv's additional
// schema-authoring strictRequired lint would reject that valid schema layout.
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false })
addFormats(ajv)
ajv.addKeyword({
  keyword: 'x-skillpilot-caseInsensitiveUniqueItems', schemaType: 'boolean', type: 'array',
  validate: (enabled: boolean, values: unknown[]) => !enabled ||
    new Set(values.map(value => String(value).toLocaleLowerCase('en-US'))).size === values.length,
})
const runtimeValidator = ajv.compile(await read('docs/landscape-runtime.schema.json'))
if (!runtimeValidator(snapshot)) errors.push(`runtime schema: ${ajv.errorsText(runtimeValidator.errors)}`)
if (snapshot.goals.length !== operative.goals.length || goalById.size !== currentById.size) errors.push('Current goal universe was changed')
const changed: string[] = []
for (const [id, g] of goalById) {
  const before = currentById.get(id)
  if (!before) errors.push(`Unexpected ID ${id}`)
  if (JSON.stringify(g) !== JSON.stringify(before)) changed.push(id)
  if (!ids.includes(id) && JSON.stringify(g) !== JSON.stringify(before)) errors.push(`Outside-scope goal changed: ${id}`)
  for (const kind of ['requires', 'contains']) {
    for (const target of g[kind] ?? []) if (!goalById.has(target)) errors.push(`${id} ${kind}: absent ${target}`)
  }
}
for (const relation of ['requires', 'contains']) {
  const visiting = new Set<string>(), done = new Set<string>()
  const visit = (id: string) => {
    if (done.has(id)) return
    if (visiting.has(id)) { errors.push(`${relation} cycle: ${id}`); return }
    visiting.add(id)
    for (const target of goalById.get(id)?.[relation] ?? []) visit(target)
    visiting.delete(id); done.add(id)
  }
  for (const id of goalById.keys()) visit(id)
}
for (const d of desc.goals) {
  const before = currentById.get(d.goalId)
  if (JSON.stringify(before) !== JSON.stringify(d.currentGoal)) errors.push(`Before snapshot drift ${d.goalId}`)
  const prior = v2.goals.find((p: any) => p.goalId === d.goalId)
  for (const key of ['proposedTitleDe', 'proposedTitleEn', 'proposedDescriptionDe', 'proposedDescriptionEn', 'proposedRequires']) {
    if (JSON.stringify(d[key]) !== JSON.stringify(prior[key])) errors.push(`Unexpected v2 semantic change ${d.goalId} ${key}`)
  }
}
const recordSchema = await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const innerValidator = ajv.compile({ $schema: 'https://json-schema.org/draft/2020-12/schema', $defs: recordSchema.$defs, ...recordSchema.properties.profile })
const recordValidator = ajv.compile(recordSchema)
const pRecords = (await readFile(resolve(out, 'positive.validation-only.not-registered.review.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line))
for (const r of pRecords) {
  if (!recordValidator(r)) errors.push(`${r.goalId}: record ${ajv.errorsText(recordValidator.errors)}`)
  if (r.reviewAuthority !== 'ai_candidate' || r.recordStatus === 'approved') errors.push(`${r.goalId}: false authority`)
}
const oldP = await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-candidate-v1/positive-evidence.candidates.json')
const authoredP = await local('positive-evidence.candidates.json')
for (const r of authoredP.goals) {
  if (JSON.stringify(r.profile) !== JSON.stringify(oldP.goals.find((p: any) => p.goalId === r.goalId)?.profile)) errors.push(`Unexpected INNER-P change ${r.goalId}`)
}
for (const c of companions.goals) {
  if (c.stableGoalId !== null) errors.push(`Companion ID was minted: ${c.candidateKey}`)
  const old = oldCompanions.goals.find((p: any) => p.candidateKey === c.candidateKey)
  for (const key of ['proposedTitleDe', 'proposedTitleEn', 'proposedDescriptionDe', 'proposedDescriptionEn', 'profile']) {
    if (JSON.stringify(c[key]) !== JSON.stringify(old[key])) errors.push(`Companion content changed ${c.candidateKey} ${key}`)
  }
  if (!innerValidator(c.profile)) errors.push(`${c.candidateKey}: INNER profile ${ajv.errorsText(innerValidator.errors)}`)
  for (const id of c.requiresCandidate) if (!goalById.has(id)) errors.push(`Companion prerequisite missing ${id}`)
}
const bacteria = companions.goals.find((c: any) => c.candidateKey === 'bacterial-binary-fission')
if (bacteria.requiresCandidate.includes('e70d8a85-2dea-5165-919b-200fee9f4db4')) errors.push('Molecular replication remains universal bacterial prerequisite')
const beforeBindings = await local('author-input-bindings.json')
for (const b of beforeBindings.inputs) if (await sha(b.path) !== b.sha256) errors.push(`Inspected input changed ${b.path}`)
const receipt = {
  checkedAtUtc: new Date().toISOString(), status: errors.length ? 'fail' : 'pass_scoped_candidate_structure_and_binding_only',
  currentGoalUniverse: operative.goals.length, candidateGoalUniverse: snapshot.goals.length,
  scopedCurrentGoalIds: ids, changedCurrentIds: changed, newStableIds: 0,
  runtimeSchemaValidated: true, currentCandidateGraphsChecked: ['requires', 'contains'],
  sixDescriptionRequiresEqualReviewedV2: true, sixInnerProfilesEqualReviewedV1: true,
  sixAiCandidateRecordsSchemaChecked: pRecords.length, unmintedCompanionInnerProfilesSchemaChecked: companions.goals.length,
  unchangedCompanionDescriptionsAndInnerProfiles: true, binaryFissionPrerequisiteDeltaOnly: true,
  currentCanonicalHash: await sha('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),
  errors, humanApproval: false, activeWrites: false,
  limit: 'These targeted checks do not approve source preservation, views, current PDF D rounds, new stable IDs, actual integrated V, global Layer A, M7 or human acceptance.'
}
await writeFile(resolve(out, 'candidate-structure-and-binding.native.receipt.json'), JSON.stringify(receipt, null, 2)+'\n')
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
