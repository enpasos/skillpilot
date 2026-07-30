import { sanitizeSkillpilotId } from './skillpilotId'

export type PersonalizationStage =
  | 'SELECTION'
  | 'COMPLETE'
  | 'INVALID'
  | 'ROOT_FILTER'
  | 'DESCENDANT_FILTER'

export type PersonalizationOptionKind = 'VALUE' | 'SCOPE_VALUE' | 'COMPLETE_GROUP'

export interface PersonalizationOption {
  optionId: string
  stageId: string | null
  groupId: string | null
  groupInstanceId: string | null
  landscapeId: string | null
  landscapeLabel: string | null
  filterId: string | null
  filterLabel: string | null
  scopeKey: string | null
  scopeValue: string | null
  scopeLabel: string | null
  kind: PersonalizationOptionKind
}

export interface PersonalizationDecisionPrompt {
  stageLabel: string | null
  groupLabel: string | null
}

export interface PersonalizationCompletedDecision {
  rewindId: string
  stageId: string | null
  stageLabel: string | null
  groupId: string | null
  groupLabel: string | null
  groupInstanceId: string | null
  selectedOptions: PersonalizationOption[]
}

export interface PersonalizationDecisionSummary {
  stageId: string | null
  stageLabel: string | null
  groupId: string | null
  groupLabel: string | null
  groupInstanceId: string | null
  selectedOptions: PersonalizationOption[]
}

export interface PersonalizationPlan {
  stage: PersonalizationStage
  stageId: string | null
  stageLabel: string | null
  groupId: string | null
  groupLabel: string | null
  groupInstanceId: string | null
  minSelections: number
  maxSelections: number
  selectedCount: number
  options: PersonalizationOption[]
  displayOptions: PersonalizationOption[]
  navigationOptions: PersonalizationOption[]
  currentSelectedOptions: PersonalizationOption[]
  currentRewindId: string | null
  completedDecisions: PersonalizationCompletedDecision[]
  preservedDecisions: PersonalizationDecisionSummary[]
  pendingDecisions: PersonalizationDecisionPrompt[]
  canReopenMigratedPersonalization: boolean
  problemCode: string | null
}

export interface PersonalCurriculumEditorRequestOptions {
  apiBase?: string
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}

const PERSONALIZATION_STAGES = new Set<PersonalizationStage>([
  'SELECTION',
  'COMPLETE',
  'INVALID',
  'ROOT_FILTER',
  'DESCENDANT_FILTER',
])

const OPTION_KINDS = new Set<PersonalizationOptionKind>([
  'VALUE',
  'SCOPE_VALUE',
  'COMPLETE_GROUP',
])

const normalizeApiBase = (value?: string) => (value ?? '').trim().replace(/\/+$/u, '')

const runtimeApiBase = () => normalizeApiBase(import.meta.env?.VITE_API_BASE)

const asRecord = (value: unknown, message: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(message)
  }
  return value as Record<string, unknown>
}

const optionalString = (value: unknown): string | null => (
  typeof value === 'string' && value.trim() ? value.trim() : null
)

const opaqueString = (value: unknown): string | null => (
  typeof value === 'string' && value.trim() ? value : null
)

const requiredInteger = (value: unknown, field: string): number => {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`Invalid personalization plan: ${field}`)
  }
  return value as number
}

const parseOption = (value: unknown): PersonalizationOption => {
  const option = asRecord(value, 'Invalid personalization plan option')
  const optionId = opaqueString(option.optionId)
  const kind = optionalString(option.kind)
  if (!optionId || !kind || !OPTION_KINDS.has(kind as PersonalizationOptionKind)) {
    throw new Error('Invalid personalization plan option')
  }
  return {
    optionId,
    stageId: optionalString(option.stageId),
    groupId: optionalString(option.groupId),
    groupInstanceId: optionalString(option.groupInstanceId),
    landscapeId: optionalString(option.landscapeId),
    landscapeLabel: optionalString(option.landscapeLabel),
    filterId: optionalString(option.filterId),
    filterLabel: optionalString(option.filterLabel),
    scopeKey: optionalString(option.scopeKey),
    scopeValue: optionalString(option.scopeValue),
    scopeLabel: optionalString(option.scopeLabel),
    kind: kind as PersonalizationOptionKind,
  }
}

const parseDecisionPrompt = (value: unknown): PersonalizationDecisionPrompt => {
  const prompt = asRecord(value, 'Invalid personalization decision prompt')
  return {
    stageLabel: optionalString(prompt.stageLabel),
    groupLabel: optionalString(prompt.groupLabel),
  }
}

const parseCompletedDecision = (value: unknown): PersonalizationCompletedDecision => {
  const decision = asRecord(value, 'Invalid personalization completed decision')
  const rewindId = opaqueString(decision.rewindId)
  if (!rewindId || !Array.isArray(decision.selectedOptions)) {
    throw new Error('Invalid personalization completed decision')
  }
  const selectedOptions = decision.selectedOptions.map(parseOption)
  if (selectedOptions.some((option) => option.kind === 'COMPLETE_GROUP')) {
    throw new Error('Invalid personalization completed decision')
  }
  return {
    rewindId,
    stageId: optionalString(decision.stageId),
    stageLabel: optionalString(decision.stageLabel),
    groupId: optionalString(decision.groupId),
    groupLabel: optionalString(decision.groupLabel),
    groupInstanceId: optionalString(decision.groupInstanceId),
    selectedOptions,
  }
}

const parseDecisionSummary = (value: unknown): PersonalizationDecisionSummary => {
  const decision = asRecord(value, 'Invalid personalization decision summary')
  if (!Array.isArray(decision.selectedOptions)) {
    throw new Error('Invalid personalization decision summary')
  }
  const selectedOptions = decision.selectedOptions.map(parseOption)
  if (selectedOptions.some((option) => option.kind === 'COMPLETE_GROUP')) {
    throw new Error('Invalid personalization decision summary')
  }
  return {
    stageId: optionalString(decision.stageId),
    stageLabel: optionalString(decision.stageLabel),
    groupId: optionalString(decision.groupId),
    groupLabel: optionalString(decision.groupLabel),
    groupInstanceId: optionalString(decision.groupInstanceId),
    selectedOptions,
  }
}

export const parsePersonalizationPlan = (value: unknown): PersonalizationPlan => {
  const source = asRecord(value, 'Invalid personalization plan')
  const stage = optionalString(source.stage)
  if (!stage || !PERSONALIZATION_STAGES.has(stage as PersonalizationStage)) {
    throw new Error('Invalid personalization plan: stage')
  }
  const currentSelectedOptions = source.currentSelectedOptions ?? []
  const displayOptions = source.displayOptions ?? source.options
  const completedDecisions = source.completedDecisions ?? []
  const preservedDecisions = source.preservedDecisions ?? []
  if (!Array.isArray(source.options)
    || !Array.isArray(displayOptions)
    || !Array.isArray(source.navigationOptions)
    || !Array.isArray(currentSelectedOptions)
    || !Array.isArray(completedDecisions)
    || !Array.isArray(preservedDecisions)
    || !Array.isArray(source.pendingDecisions)) {
    throw new Error('Invalid personalization plan: option lists')
  }

  const minSelections = requiredInteger(source.minSelections, 'minSelections')
  const maxSelections = requiredInteger(source.maxSelections, 'maxSelections')
  const selectedCount = requiredInteger(source.selectedCount, 'selectedCount')
  if (maxSelections < minSelections || selectedCount > maxSelections) {
    throw new Error('Invalid personalization plan: cardinality')
  }

  const parsedStage = stage as PersonalizationStage
  const parsedOptions = source.options.map(parseOption)
  const parsedDisplayOptions = displayOptions
    .map(parseOption)
    .filter((option) => option.kind !== 'COMPLETE_GROUP')
  const plan: PersonalizationPlan = {
    stage: parsedStage,
    stageId: optionalString(source.stageId),
    stageLabel: optionalString(source.stageLabel),
    groupId: optionalString(source.groupId),
    groupLabel: optionalString(source.groupLabel),
    groupInstanceId: optionalString(source.groupInstanceId),
    minSelections,
    maxSelections,
    selectedCount,
    options: parsedOptions,
    displayOptions: parsedDisplayOptions,
    navigationOptions: source.navigationOptions.map(parseOption),
    currentSelectedOptions: currentSelectedOptions.map(parseOption),
    currentRewindId: opaqueString(source.currentRewindId),
    completedDecisions: completedDecisions.map(parseCompletedDecision),
    preservedDecisions: preservedDecisions.map(parseDecisionSummary),
    pendingDecisions: source.pendingDecisions.map(parseDecisionPrompt),
    canReopenMigratedPersonalization:
      source.canReopenMigratedPersonalization === true,
    problemCode: optionalString(source.problemCode),
  }

  if (
    (parsedStage === 'SELECTION'
      || parsedStage === 'ROOT_FILTER'
      || parsedStage === 'DESCENDANT_FILTER')
    && (
      !plan.stageId
      || !plan.stageLabel
      || !plan.groupId
      || !plan.groupLabel
      || !plan.groupInstanceId
      || plan.options.length === 0
    )
  ) {
    throw new Error('Invalid personalization plan: incomplete selection')
  }
  if (parsedStage === 'INVALID' && !plan.problemCode) {
    throw new Error('Invalid personalization plan: missing problem code')
  }
  return plan
}

export const buildPersonalCurriculumEditorEndpoint = (
  skillpilotId: string,
  action:
    | 'personalization-plan'
    | 'personalization-options'
    | 'personalization-reopen'
    | 'personalization-rewind'
    | 'personalization-restart',
  apiBase?: string,
) => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID')
  }
  const base = normalizeApiBase(apiBase === undefined ? runtimeApiBase() : apiBase)
  return `${base}/api/ui/learners/${encodeURIComponent(sanitizedId)}/${action}`
}

const readPlanResponse = async (response: Response): Promise<PersonalizationPlan> => {
  if (!response.ok) {
    const message = (await response.text()).trim()
    throw new Error(message || `Personalization request failed (${response.status})`)
  }
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Invalid personalization plan response')
  }
  return parsePersonalizationPlan(body)
}

export const requestPersonalizationPlan = async (
  skillpilotId: string,
  options: PersonalCurriculumEditorRequestOptions = {},
): Promise<PersonalizationPlan> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildPersonalCurriculumEditorEndpoint(
      skillpilotId,
      'personalization-plan',
      options.apiBase,
    ),
    {
      credentials: 'include',
      signal: options.signal,
    },
  )
  return readPlanResponse(response)
}

export const applyPersonalizationOption = async (
  skillpilotId: string,
  optionId: string,
  options: PersonalCurriculumEditorRequestOptions = {},
): Promise<PersonalizationPlan> => {
  if (!optionId.trim()) {
    throw new Error('Missing personalization option')
  }
  const response = await (options.fetchImpl ?? fetch)(
    buildPersonalCurriculumEditorEndpoint(
      skillpilotId,
      'personalization-options',
      options.apiBase,
    ),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId }),
      signal: options.signal,
    },
  )
  return readPlanResponse(response)
}

export const restartPersonalization = async (
  skillpilotId: string,
  options: PersonalCurriculumEditorRequestOptions = {},
): Promise<PersonalizationPlan> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildPersonalCurriculumEditorEndpoint(
      skillpilotId,
      'personalization-restart',
      options.apiBase,
    ),
    {
      method: 'POST',
      credentials: 'include',
      signal: options.signal,
    },
  )
  return readPlanResponse(response)
}

export const reopenMigratedPersonalization = async (
  skillpilotId: string,
  options: PersonalCurriculumEditorRequestOptions = {},
): Promise<PersonalizationPlan> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildPersonalCurriculumEditorEndpoint(
      skillpilotId,
      'personalization-reopen',
      options.apiBase,
    ),
    {
      method: 'POST',
      credentials: 'include',
      signal: options.signal,
    },
  )
  return readPlanResponse(response)
}

export const rewindPersonalization = async (
  skillpilotId: string,
  rewindId: string,
  options: PersonalCurriculumEditorRequestOptions = {},
): Promise<PersonalizationPlan> => {
  if (!rewindId.trim()) {
    throw new Error('Missing personalization rewind reference')
  }
  const response = await (options.fetchImpl ?? fetch)(
    buildPersonalCurriculumEditorEndpoint(
      skillpilotId,
      'personalization-rewind',
      options.apiBase,
    ),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewindId }),
      signal: options.signal,
    },
  )
  return readPlanResponse(response)
}
