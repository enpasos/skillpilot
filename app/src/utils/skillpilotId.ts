export const sanitizeSkillpilotId = (value: string | null | undefined): string => {
  if (!value) return ''
  return value.replace(/[\s\u200B-\u200D\u2060\uFEFF]+/gu, '').trim()
}
