import type {
  PersonalizationOption,
  PersonalizationPlan,
} from '../utils/personalCurriculumEditorApi'

export type Abi26CourseLevel = 'GK' | 'LK'

export interface Abi26CampaignContext {
  slug: string
  source: string
  campaign: string
  medium: string
  courseLevel: Abi26CourseLevel
  skillpilotId?: string
}

export type Abi26PersonalCurriculumConfig = Record<string, { selected: boolean; filterId?: string }>

// Repository campaigns bind concrete curriculum and goal IDs. They are not a
// package capability and are deliberately disabled in this build mode.
export const ABI26_CAMPAIGN_SLUG = ''
export const ABI26_ROOT_CURRICULUM_ID = ''
export const ABI26_MATH_LANDSCAPE_ID = ''
export const ABI26_ROOT_FILTER_ID = ''
export const ABI26_DURATION_MODEL = ''
export const ABI26_GPT_URL = ''
export const ABI26_FEEDBACK_URL = ''
export const ABI26_CONTEXT_STORAGE_KEY = 'skillpilot_package_campaign_disabled'
export const ABI26_SCOPE_BY_LEVEL: Record<Abi26CourseLevel, string> = { GK: '', LK: '' }
export const ABI26_FOCUS_GOAL_BY_LEVEL: Record<Abi26CourseLevel, string> = { GK: '', LK: '' }
export const resolveAbi26PersonalizationOption = (
  plan: PersonalizationPlan,
  courseLevel: Abi26CourseLevel,
): PersonalizationOption | undefined => {
  void plan
  void courseLevel
  return undefined
}
export type Abi26PersonalizationRepairAction =
  | { kind: 'COMPLETE' }
  | { kind: 'APPLY_OPTION'; optionId: string }
  | { kind: 'RESTART' }
  | { kind: 'UNAVAILABLE' }
export const resolveAbi26PersonalizationRepairAction = (
  plan: PersonalizationPlan,
  courseLevel: Abi26CourseLevel,
  configMatchesCampaign: boolean,
  hasRestarted: boolean,
): Abi26PersonalizationRepairAction => {
  void plan
  void courseLevel
  void configMatchesCampaign
  void hasRestarted
  return { kind: 'UNAVAILABLE' }
}

export const extractAbi26CampaignContext = (params: URLSearchParams): Abi26CampaignContext => {
  void params
  return {
    slug: ABI26_CAMPAIGN_SLUG,
    source: 'disabled',
    campaign: ABI26_CAMPAIGN_SLUG,
    medium: 'disabled',
    courseLevel: 'GK',
  }
}

export const saveAbi26CampaignContext = (context: Abi26CampaignContext) => {
  void context
}
export const isAbi26PersonalizationInitialized = (
  skillpilotId: string,
  courseLevel: Abi26CourseLevel,
): boolean => {
  void skillpilotId
  void courseLevel
  return false
}
export const markAbi26PersonalizationInitialized = (
  skillpilotId: string,
  courseLevel: Abi26CourseLevel,
) => {
  void skillpilotId
  void courseLevel
}
export const loadAbi26CampaignContext = (): Abi26CampaignContext | null => null
export const buildAbi26PersonalCurriculumConfig = (
  courseLevel: Abi26CourseLevel,
  baseConfig: Abi26PersonalCurriculumConfig = {},
): Abi26PersonalCurriculumConfig => {
  void courseLevel
  return { ...baseConfig }
}
export const buildAbi26CockpitUrl = (context: Abi26CampaignContext) => {
  void context
  return '/'
}
export const buildAbi26StartPrompt = (context: Abi26CampaignContext) => {
  void context
  return ''
}
