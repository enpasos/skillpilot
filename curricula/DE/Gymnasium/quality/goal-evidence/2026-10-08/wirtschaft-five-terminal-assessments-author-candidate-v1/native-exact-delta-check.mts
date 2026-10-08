import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel'

const here = dirname(fileURLToPath(import.meta.url))
const before = JSON.parse(readFileSync(join(here, 'before.landscape.json.snapshot'), 'utf8'))
const candidate = JSON.parse(readFileSync(join(here, 'candidate.landscape.json.snapshot'), 'utf8'))
const manifest = JSON.parse(readFileSync(join(here, 'candidate-manifest.json'), 'utf8'))
const previousGoals = new Map(before.goals.map((g: any) => [g.id, g]))
const changed = candidate.goals.filter((g: any) => JSON.stringify(g) !== JSON.stringify(previousGoals.get(g.id)))
const expected = new Set(manifest.changedGoalIds)
const failures: string[] = []
const allStableFields = ['id', 'requires', 'contains', 'tags', 'weight', 'phase', 'dimensionTags', 'type', 'applicability', 'extendedData', 'provenance']
const records = changed.map((g: any) => {
  const old: any = previousGoals.get(g.id)
  if (!expected.has(g.id)) failures.push(`Unexpected changed goal ${g.id}`)
  for (const field of allStableFields) {
    if (JSON.stringify(old[field]) !== JSON.stringify(g[field])) failures.push(`Unexpected changed field ${g.id}/${field}`)
  }
  if (g.examData.reviewStatus !== 'draft') failures.push(`Unreviewed candidate is not draft ${g.id}`)
  if (g.examData.scoring.steps.reduce((sum: number, s: any) => sum + s.points, 0) !== 30) failures.push(`Points mismatch ${g.id}`)
  if (g.examData.scoring.passingPoints !== old.examData.scoring.passingPoints) failures.push(`Threshold changed ${g.id}`)
  if (!g.examData.coveredGoalIds.every((id: string) => g.requires.includes(id))) failures.push(`Coverage outside readiness ${g.id}`)
  return {goalId: g.id, beforeNativeSourceFingerprint: fingerprintSemanticKindSourceGoal(old), candidateNativeSourceFingerprint: fingerprintSemanticKindSourceGoal(g), candidateReviewStatus: g.examData.reviewStatus, retainedDirectPrerequisites: g.requires.length, actualDirectAssessedGoals: g.examData.coveredGoalIds.length}
})
if (changed.length !== 5 || expected.size !== 5) failures.push('Expected exactly five assessment deltas')
if (JSON.stringify(before.goals.map((g: any) => g.id)) !== JSON.stringify(candidate.goals.map((g: any) => g.id))) failures.push('Goal ID/order changed')
const unchangedOrdinary = candidate.goals.filter((g: any) => !g.contains?.length && !g.examData && !g.tags?.includes('memorization') && !g.tags?.some((t: string) => t.startsWith('srs-deck:')) && g.id !== '6bf2d1cc-e745-50dd-a617-71c06a6c6945' && g.id !== 'de_gymnasium_economics_memory_cards')
if (unchangedOrdinary.length !== 303) failures.push(`Expected ordinary universe 303; found ${unchangedOrdinary.length}`)
if (unchangedOrdinary.some((g: any) => JSON.stringify(g) !== JSON.stringify(previousGoals.get(g.id)))) failures.push('Ordinary curricular goal changed')
const receipt = {schemaVersion: 1, kind: 'author-targeted-exact-delta-and-native-binding-check', reviewer: '/root/economics_layer_a', isIndependentReview: false, status: failures.length ? 'failed' : 'pass', isActiveIntegration: false, hashAlgorithm: 'sha256', candidateSha256: createHash('sha256').update(readFileSync(join(here, 'candidate.landscape.json.snapshot'))).digest('hex'), nativeSourceFingerprintImplementation: 'app/scripts/goalBookModel.ts#fingerprintSemanticKindSourceGoal', changedAssessmentGoals: records, unchangedOrdinaryCurricularAtomicCount: unchangedOrdinary.length, newStrictCompletions: 0, restoredDescriptionOrPositiveEvidenceBindings: 0, newNativeAssessmentBindingsRequired: 5, qualifications: ['This author check verifies precise deltas and schema/native source bindings, not independent fachliche acceptance.', 'Each assessment success records only its own assessment goal. Retained prerequisites and covered goal IDs do not imply prerequisite mastery or 100% phase mastery.', 'Native semantic-kind successor records must bind the integrated released form after independent assessment acceptance; draft fingerprints are not released fingerprints.', 'Actual candidates remain draft until independently accepted.'], failures}
writeFileSync(join(here, 'native-exact-delta-and-bindings.actual.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({status: receipt.status, changedAssessmentGoals: changed.length, unchangedOrdinaryCurricularAtomicCount: unchangedOrdinary.length, failures}))
if (failures.length) process.exitCode = 1
