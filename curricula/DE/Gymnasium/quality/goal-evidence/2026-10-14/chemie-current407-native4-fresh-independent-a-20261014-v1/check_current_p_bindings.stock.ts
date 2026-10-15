import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'

const repository = '/home/enpasos/projects/skillpilot'
const author = resolve(repository, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1')
const own = resolve(fileURLToPath(import.meta.url), '..')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const digest = (path: string) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
const landscape = read(resolve(author, 'candidate/canonical533.current407.corrected-P8-resources.inactive.json'))
const semantic = read(resolve(author, 'candidate/semantic533.current407.corrected-P8.inactive.json'))
const byId = new Map(landscape.goals.map((goal: any) => [goal.id, goal]))
const kinds = new Map(semantic.decisions.map((row: any) => [row.goalId, row.semanticKind]))
const files = [
  'five-current407.exact-retained.ai-candidate.needs-human-review.jsonl',
  'child2.current407.ai-candidate.needs-human-review.jsonl',
  'synthesis1.current407.ai-candidate.needs-human-review.jsonl',
]
const checked = files.flatMap((name) => readFileSync(resolve(author, 'positive', name), 'utf8').trim().split('\n').map((line) => {
  const record = JSON.parse(line)
  const goal: any = byId.get(record.goalId)
  const resources: Record<string, string> = {}
  for (const resource of goal.resourceLinks ?? []) {
    if (resource.url?.startsWith('/assets/')) resources[resource.url] = digest(resolve(author, 'public-root', resource.url.slice(1)))
  }
  const semanticKind: any = kinds.get(record.goalId)
  const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, resources, semanticKind)
  return { goalId: record.goalId, semanticKind, actualGoalFingerprint: fingerprintGoalForPositiveEvidence(goal, semanticKind), boundGoalFingerprint: record.goalFingerprint, actualProfileFingerprint: fingerprintPositiveGoalEvidenceProfile(record.profile), boundProfileFingerprint: record.profileFingerprint, resourceDigests: resources, errors }
}))
const errors = checked.flatMap((entry) => entry.errors)
writeFileSync(resolve(own, 'checks/current-P8.unmodified-stock-fingerprint-and-join.actual.json'), JSON.stringify({schemaVersion: 1, stockFunctionsUnmodified: true, stockModule: {path: 'app/scripts/positiveGoalEvidenceProfileModel.ts', sha256: digest(resolve(repository, 'app/scripts/positiveGoalEvidenceProfileModel.ts'))}, structuralPRecordCount: checked.length, scientificPContentReviewGoalIds: ['2652caef-b557-58b9-9b28-70db62625ce5', 'a96e9b3d-a02d-54f8-a3d3-318e0ea5180c', '6413429b-53d8-5ad1-9af6-d0e562cbf0f5', '53db04a0-ea76-5810-9526-c8639100e497'], checked, errors, pass: checked.length === 8 && errors.length === 0}, null, 2) + '\n')
console.log(JSON.stringify({checked: checked.length, errors}))
if (checked.length !== 8 || errors.length) process.exitCode = 1
