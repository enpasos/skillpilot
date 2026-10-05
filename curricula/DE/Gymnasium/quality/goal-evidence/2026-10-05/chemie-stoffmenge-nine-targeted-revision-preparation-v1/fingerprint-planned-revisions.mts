// SPDX-License-Identifier: Apache-2.0
// Targeted curriculum binding preparation; this is not a scientific review.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const planned = JSON.parse(readFileSync(resolve(own, 'two-frozen-rounds-targeted-adjudication.candidate.json'), 'utf8'))
const canonical = read(planned.canonicalBefore.path)
const kind = read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const registry = read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const subject = registry.subjects.find((row: any) => row.subject === 'chemie')
const memoryConfig = read(subject.memoryReviewConfigPath)
const lines = (path: string) => readFileSync(resolve(root, path), 'utf8').trim().split('\n').map(line => JSON.parse(line))
const memoryRows = lines(memoryConfig.reviewPath)
const atomicityRows = subject.semanticAtomicityConfigPaths.flatMap((path: string) => {
  const config = read(path)
  return lines(config.reviewPath).map((row: any) => ({ configPath: path, reviewPath: config.reviewPath, row }))
})
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (value: any): string => Array.isArray(value)
  ? `[${value.map(stable).join(',')}]`
  : value && typeof value === 'object'
    ? `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(',')}}`
    : JSON.stringify(value)
const fingerprint = (goal: any, ruleVersion: string) => {
  const payload = { ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '', title: normalize(goal.title), titleEn: normalize(goal.titleEn), description: normalize(goal.description), descriptionEn: normalize(goal.descriptionEn), phase: normalize(goal.dimensionTags?.phase), area: normalize(goal.dimensionTags?.area), topicCode: normalize(goal.dimensionTags?.topicCode), nodeKind: normalize(goal.nodeKind) }
  return `sha256:${createHash('sha256').update(stable(payload)).digest('hex')}`
}
const output = planned.targetedDescriptionDeltas.map((delta: any) => {
  const before = canonical.goals.find((goal: any) => goal.id === delta.goalId)
  const after = { ...before, ...delta.after }
  const beforeKind = kind.decisions.find((row: any) => row.goalId === delta.goalId)
  const a = atomicityRows.filter((entry: any) => entry.row.goalId === delta.goalId)
  const m = memoryRows.filter((row: any) => row.goalId === delta.goalId)
  if (a.length !== 1 || m.length !== 1) throw new Error(`Nonunique A/M: ${delta.goalId}`)
  if (beforeKind.sourceFingerprint !== fingerprintSemanticKindSourceGoal(before)) throw new Error(`Stale kind: ${delta.goalId}`)
  if (a[0].row.fingerprint !== fingerprint(before, a[0].row.ruleVersion)) throw new Error(`Stale A: ${delta.goalId}`)
  if (m[0].fingerprint !== fingerprint(before, m[0].ruleVersion)) throw new Error(`Stale M: ${delta.goalId}`)
  return { goalId: delta.goalId, beforeKind, afterKind: { ...beforeKind, sourceFingerprint: fingerprintSemanticKindSourceGoal(after) }, atomicity: { ...a[0], afterFingerprint: fingerprint(after, a[0].row.ruleVersion) }, memory: { configPath: subject.memoryReviewConfigPath, reviewPath: memoryConfig.reviewPath, beforeRecord: m[0], afterFingerprint: fingerprint(after, m[0].ruleVersion) } }
})
writeFileSync(resolve(own, 'validated-planned-binding-fingerprints.json'), `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), purpose: 'Validate old bindings and derive bindings for separately reviewed planned semantic changes. Hash derivation is not a fachliche approval.', goals: output }, null, 2)}\n`)
console.log(JSON.stringify({ plannedRevisions: output.length, oldKindAndAMBindingsValidated: true, activeChanges: false }))
