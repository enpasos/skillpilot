import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import { GLOBAL_STAGE_SCOPE_CONFIG_IDS } from './personalCurriculumStageScope'
import { SKILLPILOT_GPT_URL_DE } from './skillpilotGpt'

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

export const ABI26_CAMPAIGN_SLUG = 'abi26-he-mathe-k1'
export const ABI26_ROOT_CURRICULUM_ID = CANONICAL_GYMNASIUM_ROOT_ID
export const ABI26_MATH_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const ABI26_ROOT_FILTER_ID = 'DE-HE'
export const ABI26_GPT_URL = SKILLPILOT_GPT_URL_DE
export const ABI26_FEEDBACK_URL = 'https://github.com/enpasos/skillpilot/issues/new/choose'
export const ABI26_CONTEXT_STORAGE_KEY = 'skillpilot_campaign_context'

export const ABI26_SCOPE_BY_LEVEL: Record<Abi26CourseLevel, string> = {
  GK: '9ad83149-3cb7-5b87-a617-3eae3715a50c',
  LK: '464a6024-a2f8-53b4-84e0-d7b9df22a0b1',
}

export const ABI26_FOCUS_GOAL_BY_LEVEL: Record<Abi26CourseLevel, string> = {
  GK: '53de0639-c08b-53dc-8f70-9b519b7ecbbd',
  LK: '68a262fc-43f4-5d23-af30-853870bfd45b',
}

const sanitizeValue = (value: string | null, maxLength = 120) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.replace(/[^\w\-./: ]+/g, '').slice(0, maxLength)
}

const parseCourseLevel = (value: string | null): Abi26CourseLevel => {
  const normalized = value?.trim().toUpperCase()
  return normalized === 'LK' ? 'LK' : 'GK'
}

export const extractAbi26CampaignContext = (params: URLSearchParams): Abi26CampaignContext => {
  const source = sanitizeValue(params.get('source') || params.get('utm_source')) || 'direct'
  const campaign = sanitizeValue(params.get('campaign') || params.get('utm_campaign')) || ABI26_CAMPAIGN_SLUG
  const medium = sanitizeValue(params.get('medium') || params.get('utm_medium')) || 'link'
  const courseLevel = parseCourseLevel(params.get('courseLevel') || params.get('track') || params.get('f'))
  return {
    slug: ABI26_CAMPAIGN_SLUG,
    source,
    campaign,
    medium,
    courseLevel,
  }
}

export const saveAbi26CampaignContext = (context: Abi26CampaignContext) => {
  try {
    localStorage.setItem(ABI26_CONTEXT_STORAGE_KEY, JSON.stringify(context))
  } catch {
    // Ignore storage errors for private mode/restricted browsers.
  }
}

export const loadAbi26CampaignContext = (): Abi26CampaignContext | null => {
  try {
    const raw = localStorage.getItem(ABI26_CONTEXT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Abi26CampaignContext>
    if (!parsed || parsed.slug !== ABI26_CAMPAIGN_SLUG) return null
    return {
      slug: ABI26_CAMPAIGN_SLUG,
      source: sanitizeValue(parsed.source || '') || 'direct',
      campaign: sanitizeValue(parsed.campaign || '') || ABI26_CAMPAIGN_SLUG,
      medium: sanitizeValue(parsed.medium || '') || 'link',
      courseLevel: parseCourseLevel(parsed.courseLevel || 'GK'),
      skillpilotId: sanitizeValue(parsed.skillpilotId || '', 80) || undefined,
    }
  } catch {
    return null
  }
}

export const buildAbi26PersonalCurriculumConfig = (
  courseLevel: Abi26CourseLevel,
  baseConfig: Abi26PersonalCurriculumConfig = {},
): Abi26PersonalCurriculumConfig => {
  const next: Abi26PersonalCurriculumConfig = {}

  Object.entries(baseConfig).forEach(([landscapeId, value]) => {
    next[landscapeId] = {
      ...value,
      selected: false,
    }
  })

  next[ABI26_ROOT_CURRICULUM_ID] = {
    ...baseConfig[ABI26_ROOT_CURRICULUM_ID],
    selected: true,
    filterId: ABI26_ROOT_FILTER_ID,
  }
  next[ABI26_MATH_LANDSCAPE_ID] = {
    ...baseConfig[ABI26_MATH_LANDSCAPE_ID],
    selected: true,
    filterId: courseLevel,
  }
  next[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1] = {
    ...baseConfig[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1],
    selected: false,
  }
  next[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2] = {
    ...baseConfig[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2],
    selected: true,
  }

  return next
}

export const buildAbi26CockpitUrl = (context: Abi26CampaignContext) => {
  const focusGoalId = ABI26_FOCUS_GOAL_BY_LEVEL[context.courseLevel]
  const params = new URLSearchParams()
  params.set('l', ABI26_ROOT_CURRICULUM_ID)
  params.set('f', ABI26_ROOT_FILTER_ID)
  params.set('courseLevel', context.courseLevel)
  params.set('track', context.courseLevel)
  params.set('source', context.source)
  params.set('campaign', context.campaign)
  params.set('medium', context.medium)
  params.set('utm_source', context.source)
  params.set('utm_campaign', context.campaign)
  params.set('utm_medium', context.medium)
  params.set('start', ABI26_CAMPAIGN_SLUG)
  return `/learner/${focusGoalId}?${params.toString()}`
}

export const buildAbi26StartPrompt = (context: Abi26CampaignContext) => {
  const levelLabel = context.courseLevel === 'LK' ? 'Leistungskurs (LK)' : 'Grundkurs (GK)'
  const focus = context.courseLevel === 'LK'
    ? 'Abiturprüfung Mathematik (LK)'
    : 'Abiturprüfung Mathematik (GK)'
  const activeGoal = context.courseLevel === 'LK'
    ? 'B1 (Analysis - "Die Hängebrücke")'
    : 'B1 (Analysis - "Das Algenwachstum")'
  return [
    'Bitte arbeite mit mir in meinem persönlichen SkillPilot-Kontext:',
    '- Bundesland: Hessen',
    '- Schulbereich: Gymnasiale Oberstufe',
    '- Fach: Mathematik',
    `- Kursniveau: ${levelLabel}`,
    `- Fokus: ${focus}`,
    `- Aktives Lernziel: ${activeGoal}`,
    '- Matheformat im Chat: Verwende Formeln ausschließlich als ChatGPT-kompatibles LaTeX: inline \\(...\\), abgesetzt \\[...\\].',
    '- Verwende keine Dollar-Delimiter wie $...$ oder $$...$$; wandle vorhandene Dollar-Formeln nur an den Begrenzern um.',
    'Starte direkt im Prüfungsmodus',
  ].join('\n')
}
