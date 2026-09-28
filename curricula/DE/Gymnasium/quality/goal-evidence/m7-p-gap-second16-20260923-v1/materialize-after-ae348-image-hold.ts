import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPositiveGoalEvidenceCandidateRecords,
} from '../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from '../../../../../../app/scripts/positiveGoalEvidenceReview'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const directory = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-second16-20260923-v1'
const heldGoalId = 'ae3483e3-4712-56a1-a881-2e1f8a1a8df9'
const original = {
  config: `${directory}/image-bound-10.config.json`,
  review: `${directory}/image-bound-10.review.jsonl`,
  candidates: `${directory}/image-bound-10.candidates.json`,
}
const originalSha256 = {
  config: '905fbfb054d1ddfa6b1305959e17d1cd735e68232d44abab9a122f99804f01ec',
  review: '1ed2448a0c724a13fc8b5d202e22059ae50e534c743bf963490c0db3bd7297eb',
  candidates: '062467f1c9b39f714d0530c5fb79da640a0e8f8d6d590af350bcb7737d6ff326',
}
const retained = {
  config: `${directory}/image-bound-9-retained-after-ae348-hold.config.json`,
  review: `${directory}/image-bound-9-retained-after-ae348-hold.review.jsonl`,
}
const textOnly = {
  config: `${directory}/ae348-text-only-after-image-hold.config.json`,
  review: `${directory}/ae348-text-only-after-image-hold.review.jsonl`,
  candidates: `${directory}/ae348-text-only-after-image-hold.candidates.json`,
}

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const read = (path: string) => readFileSync(resolve(repoRoot, path))
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const jsonlBytes = (records: readonly string[]) => Buffer.from(`${records.join('\n')}\n`)

async function main() {
const mode = process.argv[2]
assert(process.argv.length === 3 && ['--write', '--check'].includes(mode),
  'Usage: npx tsx materialize-after-ae348-image-hold.ts --write|--check')

const sourceBytes = {
  config: read(original.config),
  review: read(original.review),
  candidates: read(original.candidates),
}
for (const key of Object.keys(sourceBytes) as Array<keyof typeof sourceBytes>) {
  assert(digest(sourceBytes[key]) === originalSha256[key], `Historical ${key} changed`)
}

const sourceConfig = JSON.parse(sourceBytes.config.toString('utf8')) as PositiveGoalEvidenceReviewConfig
const sourceCandidates = JSON.parse(sourceBytes.candidates.toString('utf8'))
const sourceLines = sourceBytes.review.toString('utf8').trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
assert(sourceConfig.scope.goalIds.length === 10 && sourceRecords.length === 10
  && sourceCandidates.goals.length === 10, 'Expected the historical ten-goal bundle')
assert(sourceConfig.scope.goalIds.every((id, index) => (
  sourceRecords[index].goalId === id && sourceCandidates.goals[index].goalId === id
)), 'Historical scope, candidate and review order differ')
assert(sourceConfig.scope.goalIds.filter((id) => id === heldGoalId).length === 1,
  'Expected one held image-bound goal')
const heldIndex = sourceConfig.scope.goalIds.indexOf(heldGoalId)
const heldSourceRecord = sourceRecords[heldIndex]
const heldSourceCandidate = sourceCandidates.goals[heldIndex]
assert(heldSourceRecord.status === 'needs_human_review'
  && heldSourceRecord.reviewAuthority === 'ai_candidate', 'Original ae348 record is not an AI candidate')
assert(JSON.stringify(heldSourceRecord.profile) === JSON.stringify(heldSourceCandidate.profile),
  'Historical candidate and review profile differ')

const retainedConfig: PositiveGoalEvidenceReviewConfig = {
  ...sourceConfig,
  reviewPath: retained.review,
  scope: {
    label: 'Nine unchanged image-bound Math P-v2 AI candidates retained after ae348 image hold',
    goalIds: sourceConfig.scope.goalIds.filter((id) => id !== heldGoalId),
  },
}
const textConfig: PositiveGoalEvidenceReviewConfig = {
  ...sourceConfig,
  reviewId: 'canonical-math-m7-p-gap-second16-ae348-text-only-after-image-hold-20260927-v1',
  reviewPath: textOnly.review,
  reviewedResourceTypes: [],
  scope: {
    label: 'ae348 current-text-only P-v2 AI candidate; visualization remains on V HOLD',
    goalIds: [heldGoalId],
  },
}
const textCandidates = {
  ...sourceCandidates,
  reviewId: textConfig.reviewId,
  reviewedAt: '2026-09-27T00:32:08.000Z',
  reviewer: 'OpenAI Codex text-only subject recheck; AI candidate only',
  goals: [{
    ...heldSourceCandidate,
    reason: 'Die zwei vollständig bezifferten OC-/Gütekurven-Fälle tragen die fachliche Prüfung von Null- und Alternativanforderung auch ohne Bild. Dies ist ein textgebundener P-v2-Kandidat; das zurückgezogene Bild bleibt V HOLD.',
    dissent: [
      'The former image-bound reviewInputFingerprint is stale after withdrawal of the ae348 goal-visualization link. This record binds only the current goal text and criteria; it does not review, approve or restore the held JPG sha256:b9013afe10e856219dda6c340873f618565e9786a981b2a82c6f23da20b6189c.',
    ],
  }],
}
const currentLandscape = JSON.parse(read(sourceConfig.landscapePath).toString('utf8'))
const heldGoal = currentLandscape.goals.find((goal: { id: string }) => goal.id === heldGoalId)
assert(heldGoal && !heldGoal.resourceLinks?.some((link: { type: string }) => link.type === 'goal-visualization'),
  'ae348 still has a canonical goal-visualization link')
const currentTextRecord = (await buildPositiveGoalEvidenceCandidateRecords({
  config: textConfig,
  candidateSet: textCandidates,
}))[0]
assert(currentTextRecord.goalId === heldGoalId && currentTextRecord.reviewAuthority === 'ai_candidate'
  && currentTextRecord.status === 'needs_human_review', 'Text-only candidate changed authority or status')

const outputs: Array<[string, Buffer]> = [
  [retained.config, jsonBytes(retainedConfig)],
  [retained.review, jsonlBytes(sourceLines.filter((_, index) => index !== heldIndex))],
  [textOnly.config, jsonBytes(textConfig)],
  [textOnly.candidates, jsonBytes(textCandidates)],
  [textOnly.review, jsonlBytes([JSON.stringify(currentTextRecord)])],
]
for (const [path, expected] of outputs) {
  const absolute = resolve(repoRoot, path)
  if (!existsSync(absolute)) {
    assert(mode === '--write', `${path} is missing`)
    writeFileSync(absolute, expected, { flag: 'wx' })
  } else {
    assert(readFileSync(absolute).equals(expected), `${path} differs from the verified source derivation`)
  }
}
for (const path of [retained.config, textOnly.config]) {
  const result = reviewPositiveGoalEvidenceConfig(path)
  assert(result.errors.length === 0, `${path}: ${result.errors.join('; ')}`)
}
console.log('Verified 9 byte-identical retained image-bound AI candidates and 1 current text-only ae348 AI candidate; no approvals added.')
}

void main()
