export type Abi26CourseLevel = 'GK' | 'LK'

export interface Abi26CampaignContext {
  slug: string
  source: string
  campaign: string
  medium: string
  courseLevel: Abi26CourseLevel
  skillpilotId?: string
}

export const ABI26_CAMPAIGN_SLUG = 'abi26-he-mathe-k1'
export const ABI26_MATH_CURRICULUM_ID = '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3'
export const ABI26_GPT_URL = 'https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt'
export const ABI26_FEEDBACK_URL = 'https://github.com/enpasos/skillpilot/issues/new/choose'
export const ABI26_CONTEXT_STORAGE_KEY = 'skillpilot_campaign_context'

export const ABI26_SCOPE_BY_LEVEL: Record<Abi26CourseLevel, string> = {
  GK: 'f204141c-c20b-504d-808c-6bcb426ce453',
  LK: 'be43163c-b2fb-5296-a1be-c97de53ee868',
}

export const ABI26_FOCUS_GOAL_BY_LEVEL: Record<Abi26CourseLevel, string> = {
  GK: '0ba923a8-1641-51a7-b01e-7860bf97d513',
  LK: 'bc60e300-96be-599a-89b6-8fcca380803d',
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

export const buildAbi26CockpitUrl = (context: Abi26CampaignContext, skillpilotId: string) => {
  const focusGoalId = ABI26_FOCUS_GOAL_BY_LEVEL[context.courseLevel]
  const params = new URLSearchParams()
  params.set('l', ABI26_MATH_CURRICULUM_ID)
  params.set('f', context.courseLevel)
  params.set('source', context.source)
  params.set('campaign', context.campaign)
  params.set('medium', context.medium)
  params.set('utm_source', context.source)
  params.set('utm_campaign', context.campaign)
  params.set('utm_medium', context.medium)
  params.set('start', ABI26_CAMPAIGN_SLUG)
  params.set('skillpilotId', skillpilotId)
  return `/learner/${focusGoalId}?${params.toString()}`
}

export const buildAbi26StartPrompt = (skillpilotId: string, context: Abi26CampaignContext) => {
  const levelLabel = context.courseLevel === 'LK' ? 'Leistungskurs (LK)' : 'Grundkurs (GK)'
  const focus = context.courseLevel === 'LK'
    ? 'Abiturprüfung Mathematik (LK)'
    : 'Abiturprüfung Mathematik (GK)'
  const activeGoal = context.courseLevel === 'LK'
    ? 'B1 (Analysis - "Die Hängebrücke")'
    : 'B1 (Analysis - "Das Algenwachstum")'
  return [
    'Bitte arbeite mit mir in meinem persönlichen SkillPilot-Kontext:',
    `- SkillPilot-ID: ${skillpilotId}`,
    '- Bundesland: Hessen',
    '- Schulbereich: Gymnasiale Oberstufe',
    '- Fach: Mathematik',
    `- Kursniveau: ${levelLabel}`,
    `- Fokus: ${focus}`,
    `- Aktives Lernziel: ${activeGoal}`,
    'Starte direkt im Prüfungsmodus',
  ].join('\n')
}
