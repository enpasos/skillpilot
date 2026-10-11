import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { LearningGoal } from '../src/landscapeTypes'
import {
  type GoalEvidenceReviewRecord,
  validateGoalEvidenceRecordSemantics,
} from './goalEvidenceProfileModel'
import {
  POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
  type PositiveGoalEvidenceReviewRecord,
  validatePositiveGoalEvidenceRecordSemantics,
} from './positiveGoalEvidenceProfileModel'

export type GoalBookEvidenceReviewRecord = (
  GoalEvidenceReviewRecord | PositiveGoalEvidenceReviewRecord
)

const createValidator = (version: 1 | 2) => {
  const schemaPath = fileURLToPath(new URL(
    `../../contracts/goal-evidence/v${version}/goal-evidence-profile.schema.json`,
    import.meta.url,
  ))
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as Record<string, unknown>
  return { ajv, validate: ajv.compile(schema) }
}

const validators = new Map<1 | 2, ReturnType<typeof createValidator>>()

export function parseGoalBookEvidenceReviewRecord(
  rawRecord: unknown,
  label: string,
): GoalBookEvidenceReviewRecord {
  const version = rawRecord !== null && typeof rawRecord === 'object'
    ? (rawRecord as Record<string, unknown>).schemaVersion
    : undefined
  if (version !== 1 && version !== 2) {
    throw new Error(`Goal-book model: ${label} violates the closed goal-evidence schema: unsupported schemaVersion.`)
  }
  let validator = validators.get(version)
  if (!validator) {
    validator = createValidator(version)
    validators.set(version, validator)
  }
  if (!validator.validate(rawRecord)) {
    throw new Error(`Goal-book model: ${label} violates the closed goal-evidence schema: ${validator.ajv.errorsText(
      validator.validate.errors,
      { separator: '; ' },
    )}.`)
  }
  const record = rawRecord as GoalBookEvidenceReviewRecord
  if (
    record.schemaVersion === 1
    && record.ruleVersion !== POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION
  ) {
    throw new Error(`Goal-book model: ${label}.ruleVersion must be ${POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION}.`)
  }
  return record
}

export function validateGoalBookEvidenceReviewRecordSemantics(
  record: GoalBookEvidenceReviewRecord,
  goal: LearningGoal | undefined,
  resourceDigests: Readonly<Record<string, string>> = {},
  effectiveSemanticKind?: string,
): string[] {
  return record.schemaVersion === 2
    ? validatePositiveGoalEvidenceRecordSemantics(
      record,
      goal,
      resourceDigests,
      effectiveSemanticKind,
    )
    : validateGoalEvidenceRecordSemantics(
      record,
      goal,
      resourceDigests,
      effectiveSemanticKind,
    )
}
