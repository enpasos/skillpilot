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
export const ABI26_GPT_URL = ''
export const ABI26_FEEDBACK_URL = ''
export const ABI26_CONTEXT_STORAGE_KEY = 'skillpilot_package_campaign_disabled'
export const ABI26_SCOPE_BY_LEVEL: Record<Abi26CourseLevel, string> = { GK: '', LK: '' }
export const ABI26_FOCUS_GOAL_BY_LEVEL: Record<Abi26CourseLevel, string> = { GK: '', LK: '' }

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
