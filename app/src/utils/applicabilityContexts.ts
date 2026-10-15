/** Exact reviewed eligibility over existing scope dimensions; never enrollment or source evidence. */
export const APPLICABILITY_CONTEXT_KEYS = ['schoolForm', 'jurisdiction', 'stage', 'durationModel', 'courseProfile'] as const
export interface ApplicabilityContext {
  schoolForm: 'Gymnasium'
  jurisdiction: string
  stage: 'SekI' | 'SekII'
  durationModel: 'G8' | 'G9' | null
  courseProfile: 'GK' | 'LK' | null
}
type ContextGoal = { extendedData?: Record<string, unknown>, applicability?: unknown }
const jurisdictionPattern = /^DE(?:-(?:BB|BE|BW|BY|HB|HE|HH|MV|NI|NW|RP|SH|SL|SN|ST|TH))?$/u
const own = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key)

export const hasApplicabilityContexts = (goal: ContextGoal): boolean =>
  !!goal.extendedData && own(goal.extendedData, 'applicabilityContexts')

/** Every key is required. Null is a literal resolved non-applicable value, never a wildcard. */
export const normalizeCompleteApplicabilityContext = (raw: unknown): ApplicabilityContext | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  if (!APPLICABILITY_CONTEXT_KEYS.every((key) => own(value, key))) return null
  const token = (key: string) => value[key]
  const schoolForm = token('schoolForm')
  const jurisdiction = token('jurisdiction')
  const stage = token('stage')
  const durationModel = token('durationModel')
  const courseProfile = token('courseProfile')
  if (schoolForm !== 'Gymnasium' || typeof jurisdiction !== 'string' || !jurisdictionPattern.test(jurisdiction)) return null
  if (stage !== 'SekI' && stage !== 'SekII') return null
  if (durationModel !== null && durationModel !== 'G8' && durationModel !== 'G9') return null
  if (stage === 'SekI' ? courseProfile !== null : courseProfile !== 'GK' && courseProfile !== 'LK') return null
  return { schoolForm, jurisdiction, stage, durationModel, courseProfile } as ApplicabilityContext
}


/** Keep unresolved dimensions absent. SekI has no course selector by contract;
 * duration:null is accepted only when the caller explicitly resolved it. */
export const toSelectedApplicabilityScope = (raw: unknown): Record<string, unknown> | undefined => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const scope = { ...raw as Record<string, unknown> }
  if (scope.stage === 'SekI') scope.courseProfile = null
  return scope
}

/** Refine only an explicitly selected combined course/stage using its actual
 * source branch. Source metadata cannot supply an unresolved learner duration. */
export const resolveApplicabilityBranchScope = (rawSelected: unknown, rawSource: unknown): Record<string, unknown> | undefined => {
  const selected = toSelectedApplicabilityScope(rawSelected)
  if (!selected || !rawSource || typeof rawSource !== 'object' || Array.isArray(rawSource)) return undefined
  const source = rawSource as Record<string, unknown>
  const result = { ...selected }
  for (const key of APPLICABILITY_CONTEXT_KEYS) {
    if (!own(source, key)) continue
    if (key === 'courseProfile' && result.stage === 'SekI' && source.courseProfile === null
      && (selected.stage === 'SekI' || selected.stage === 'CrossStage')) result.courseProfile = null
    else if (key === 'courseProfile' && (selected.courseProfile === 'GK+LK' || selected.courseProfile === 'ALL')
      && (source.courseProfile === 'GK' || source.courseProfile === 'LK')) result.courseProfile = source.courseProfile
    else if (key === 'stage' && selected.stage === 'CrossStage' && (source.stage === 'SekI' || source.stage === 'SekII')) result.stage = source.stage
    else if (selected[key] !== source[key]) return undefined
  }
  if (result.stage === 'SekI') result.courseProfile = null
  return result
}

export const parseApplicabilityContexts = (goal: ContextGoal): {
  present: boolean, contexts: ApplicabilityContext[], errors: string[]
} => {
  if (!hasApplicabilityContexts(goal)) return { present: false, contexts: [], errors: [] }
  const raw = goal.extendedData!.applicabilityContexts
  const errors: string[] = []
  if (goal.applicability !== undefined) errors.push('applicabilityContexts cannot coexist with legacy applicability.')
  if (goal.extendedData && own(goal.extendedData, 'applicabilityOverrides')) errors.push('applicabilityContexts cannot coexist with applicabilityOverrides.')
  if (!Array.isArray(raw)) return { present: true, contexts: [], errors: [...errors, 'applicabilityContexts must be an array.'] }
  const contexts: ApplicabilityContext[] = []
  const seen = new Set<string>()
  raw.forEach((entry, index) => {
    const context = normalizeCompleteApplicabilityContext(entry)
    if (!context || Object.keys(entry as object).some((key) => !APPLICABILITY_CONTEXT_KEYS.includes(key as typeof APPLICABILITY_CONTEXT_KEYS[number]))) {
      errors.push(`applicabilityContexts[${index}] must be a closed, complete five-dimension context.`)
      return
    }
    const key = JSON.stringify(context)
    if (seen.has(key)) errors.push(`applicabilityContexts[${index}] duplicates an earlier context.`)
    seen.add(key)
    contexts.push(context)
  })
  return { present: true, contexts, errors }
}

export const goalMatchesApplicabilityContext = (goal: ContextGoal, selectedScope?: unknown): boolean => {
  const parsed = parseApplicabilityContexts(goal)
  if (!parsed.present) return true
  if (parsed.errors.length) return false
  const selected = normalizeCompleteApplicabilityContext(selectedScope)
  if (!selected) return false
  return parsed.contexts.some((context) => APPLICABILITY_CONTEXT_KEYS.every((key) => context[key] === selected[key]))
}

/** Package-v1 does not negotiate these new authoritative semantics. */
export const assertPackageV1HasNoApplicabilityContexts = (landscapes: { goals?: ContextGoal[] }[]): void => {
  if (landscapes.some((landscape) => landscape.goals?.some(hasApplicabilityContexts))) {
    throw new Error('Package-v1 cannot admit applicabilityContexts; an explicitly supported successor runtime contract is required.')
  }
}
