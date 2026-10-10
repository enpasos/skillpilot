// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
const author = `${base}/biologie-bio8-targeted-text-and-source-author-successor-20261010-v4`
const prior = `${base}/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3`
const own = `${base}/biologie-bio8-v4-targeted-genuine-independent-a-20261010-v1`
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const landscape = read(`${author}/candidate/whole483-final-text-source-image.inactive.json`)
const kinds = new Map(read(`${author}/candidate/kinds396.author-classification-only.json`).decisions.map((row: any) => [row.goalId, row.semanticKind]))
const current = read(`${author}/native/affected-current-native/round-a/description-review-input.json`)
const inherited = read(`${prior}/native/nineteen-final-current-native/round-a/description-review-input.json`)
const protectedIds = ['a515e493-6f90-5371-9470-28a0cf50f087', '8f6933b1-6e02-5512-acf2-a90a7fb9cb75', 'ceb54223-197c-5289-a9c6-19358912e144']
const inputs = [...current.goals, ...inherited.goals.filter((row: any) => protectedIds.includes(row.goalId))]
const rows = inputs.map((input: any) => {
  const goal = landscape.goals.find((row: any) => row.id === input.goalId)
  const source = input.goalId === '374e6de5-0747-57cb-99e3-e50ccb371124'
    ? `${author}/native/portable-affected3/bundle/asset-copies/${input.goalId}.png`
    : protectedIds.includes(input.goalId)
      ? `${prior}/native/portable-final19/bundle/asset-copies/${input.goalId}.png`
      : `${author}/native/portable-affected3/bundle/asset-copies/${input.goalId}.png`
  const digest = `sha256:${createHash('sha256').update(readFileSync(source)).digest('hex')}`
  const digests = Object.fromEntries(goal.resourceLinks.filter((link: any) => link.type === 'goal-visualization').map((link: any) => [link.url, digest]))
  const profile = input.reviewContext.evidenceProfile
  const errors = validatePositiveGoalEvidenceRecordSemantics(profile, goal, digests, kinds.get(goal.id) as string)
  const currentRequiresEqual = JSON.stringify([...goal.requires].sort()) === JSON.stringify([...input.canonicalContext.requires].sort())
  if (!currentRequiresEqual) errors.push('native canonicalContext requires differs from whole current goal')
  return { goalId: goal.id, currentAssetPath: source, currentAssetDigest: digest, goalFingerprint: input.goalFingerprint, nativePageFingerprint: input.pageFingerprint, profileFingerprint: profile.profileFingerprint, reviewInputFingerprint: profile.reviewInputFingerprint, currentRequiresEqual, normalPRecordSemanticErrors: errors }
})
const result = { schemaVersion: 1, normalRepositoryFunction: 'validatePositiveGoalEvidenceRecordSemantics', scope: 'three changed contexts and three inherited protected requires contexts', records: rows, errorCount: rows.reduce((count: number, row: any) => count + row.normalPRecordSemanticErrors.length, 0), humanApproval: 0, strictActiveGain: 0 }
writeFileSync(resolve(own, 'current-six-P-native-bindings.normal.actual.json'), `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result, null, 2))
if (result.errorCount) process.exitCode = 1
