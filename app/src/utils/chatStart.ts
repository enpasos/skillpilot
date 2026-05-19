import { sanitizeSkillpilotId } from './skillpilotId'

export interface ChatStartResponse {
  startCode: string
  expiresAt: string
  prompt: string
}

export interface ChatStartInput {
  skillpilotId: string
  language: string
  selectedCurriculum?: string
  promptContext?: string
  client?: string
}

export const requestChatStart = async ({
  skillpilotId,
  language,
  selectedCurriculum,
  promptContext,
  client = 'web',
}: ChatStartInput): Promise<ChatStartResponse> => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID')
  }

  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const url = apiBase
    ? `${apiBase}/api/ui/learners/${sanitizedId}/chat-start`
    : `/api/ui/learners/${sanitizedId}/chat-start`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      client,
      selectedCurriculum: selectedCurriculum || undefined,
      promptContext: promptContext || undefined,
    }),
  })

  if (!res.ok) {
    const message = (await res.text()).trim()
    throw new Error(message || `Failed to create SkillPilot start code (${res.status})`)
  }

  return await res.json() as ChatStartResponse
}
