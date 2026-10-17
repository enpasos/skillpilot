const SEMANTIC_KINDS = new Set([
  'orientation',
  'curricularAtomic',
  'curricularArea',
  'practiceAssessment',
  'memory',
  'programStructure',
  'runtimeSupport',
])

const SEMANTIC_KIND_LEDGER_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json',
)

export const SEMANTIC_KIND_SOURCE_FINGERPRINT_CONTRACT_ID = (
  'semantic-kind-source-fingerprint-v1'
) as const

const createSchemaValidator = (schemaPath: string, includeFormats = false) => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  if (includeFormats) addFormats(ajv)
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as Record<string, unknown>
  return { ajv, validate: ajv.compile(schema) }
}

let cachedSemanticKindLedgerSchemaValidator: ReturnType<typeof createSchemaValidator> | null = null

const fail = (message: string): never => {
  throw new Error(`Goal-book model: ${message}`)
}

const nonEmptyString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    return fail(`${label} must be a non-empty string.`)
  }
  return value.trim()
}

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fail(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

const parseSemanticKindLedger = (
  value: unknown,
  rawLandscape: unknown,
  landscapeId: string,
  landscapePath: string,
): SemanticKindLedgerResult => {
  const validator = cachedSemanticKindLedgerSchemaValidator
    ?? (cachedSemanticKindLedgerSchemaValidator = createSchemaValidator(
      SEMANTIC_KIND_LEDGER_SCHEMA_PATH,
      true,
    ))
  if (!validator.validate(value)) {
    fail(`semantic-kind ledger violates its closed JSON Schema: ${validator.ajv.errorsText(
      validator.validate.errors,
      { separator: '; ' },
    )}.`)
  }
  const record = asRecord(value, 'semanticKindLedger')
  const ledgerId = nonEmptyString(record.ledgerId, 'semanticKindLedger.ledgerId')
  const sourceLandscapeId = nonEmptyString(
    record.sourceLandscapeId,
    'semanticKindLedger.sourceLandscapeId',
  )
  if (sourceLandscapeId !== landscapeId) {
    fail(`semantic-kind ledger targets ${sourceLandscapeId}, expected ${landscapeId}.`)
  }
  const sourceLandscapePath = nonEmptyString(
    record.sourceLandscapePath,
    'semanticKindLedger.sourceLandscapePath',
  )
  if (sourceLandscapePath !== landscapePath) {
    fail(`semantic-kind ledger binds ${sourceLandscapePath}, expected ${landscapePath}.`)
  }
  if (record.sourceFingerprintContractId !== SEMANTIC_KIND_SOURCE_FINGERPRINT_CONTRACT_ID) {
    fail(
      `semantic-kind ledger uses unsupported source fingerprint contract `
      + `${String(record.sourceFingerprintContractId)}.`,
    )
  }
  const decisions = Array.isArray(record.decisions)
    ? record.decisions
    : fail('semanticKindLedger.decisions must be an array.')

  const rawLandscapeRecord = asRecord(rawLandscape, 'landscape')
  const rawGoals = Array.isArray(rawLandscapeRecord.goals)
    ? rawLandscapeRecord.goals
    : fail('landscape.goals must be an array.')
  const rawGoalById = new Map<string, Record<string, unknown>>()
  rawGoals.forEach((rawGoal, index) => {
    const goal = asRecord(rawGoal, `landscape.goals[${index}]`)
    const goalId = nonEmptyString(goal.id, `landscape.goals[${index}].id`)
    if (rawGoalById.has(goalId)) fail(`duplicate canonical goal ID ${goalId}.`)
    rawGoalById.set(goalId, goal)
  })
  const canonicalGoalIds = new Set(rawGoalById.keys())
  const semanticKindByGoalId = new Map<string, string>()
  const actualCounts = new Map<string, number>([...SEMANTIC_KINDS].map((kind) => [kind, 0]))
  decisions.forEach((rawDecision, index) => {
    const decision = asRecord(rawDecision, `semanticKindLedger.decisions[${index}]`)
    const goalId = nonEmptyString(decision.goalId, `semanticKindLedger.decisions[${index}].goalId`)
    const semanticKind = nonEmptyString(
      decision.semanticKind,
      `semanticKindLedger.decisions[${index}].semanticKind`,
    )
    if (!SEMANTIC_KINDS.has(semanticKind)) {
      fail(`semantic-kind ledger has unsupported semanticKind ${semanticKind} for ${goalId}.`)
    }
    if (decision.decisionStatus !== 'authoritative') {
      fail(`semantic-kind decision for ${goalId} is not authoritative.`)
    }
    if (!canonicalGoalIds.has(goalId)) {
      fail(`semantic-kind ledger references unknown goal ${goalId}.`)
    }
    if (semanticKindByGoalId.has(goalId)) {
      fail(`semantic-kind ledger contains duplicate decision for ${goalId}.`)
    }
    const currentFingerprint = fingerprintSemanticKindSourceGoal(rawGoalById.get(goalId)!)
    if (decision.sourceFingerprint !== currentFingerprint) {
      fail(`stale semantic-kind decision for goal ${goalId}; expected ${currentFingerprint}.`)
    }
    semanticKindByGoalId.set(goalId, semanticKind)
    actualCounts.set(semanticKind, (actualCounts.get(semanticKind) ?? 0) + 1)
  })

  const missingGoalIds = [...canonicalGoalIds]
    .filter((goalId) => !semanticKindByGoalId.has(goalId))
  if (missingGoalIds.length > 0) {
    fail(`semantic-kind ledger has no authoritative decision for ${missingGoalIds.slice(0, 10).join(', ')}${missingGoalIds.length > 10 ? ' ...' : ''}.`)
  }

  const declaredCounts = asRecord(record.counts, 'semanticKindLedger.counts')
  SEMANTIC_KINDS.forEach((semanticKind) => {
    if (declaredCounts[semanticKind] !== actualCounts.get(semanticKind)) {
      fail(`semantic-kind ledger count for ${semanticKind} does not match its decisions.`)
    }
  })
  if (declaredCounts.total !== decisions.length || decisions.length !== canonicalGoalIds.size) {
    fail('semantic-kind ledger total count must match exactly every canonical goal.')
  }

  return { semanticKindByGoalId, ledgerId }
}
