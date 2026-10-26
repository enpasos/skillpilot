export const GOAL_VISUALIZATION_LINK_FIELDS = [
  'skillpilotId', 'role', 'title', 'provider', 'description', 'altText',
  'lang', 'license', 'reviewStatus',
] as const

export type SubjectExportVisualizationMetadata = Record<(typeof GOAL_VISUALIZATION_LINK_FIELDS)[number], string>

export const parseSubjectExportVisualizationMetadata = (
  link: Readonly<Record<string, unknown>>,
  context: string,
  issues: string[],
): SubjectExportVisualizationMetadata | null => {
  const values: SubjectExportVisualizationMetadata = {
    skillpilotId: '', role: '', title: '', provider: '', description: '',
    altText: '', lang: '', license: '', reviewStatus: '',
  }
  let valid = true
  for (const field of GOAL_VISUALIZATION_LINK_FIELDS) {
    // Canonical image links may omit description. The package's descriptive
    // metadata then repeats their existing alt text without changing the link.
    const value = field === 'description' && link.description === undefined
      ? link.altText
      : link[field]
    if (typeof value !== 'string' || value.trim().length === 0) {
      issues.push(`${context}: missing non-empty ${field}.`)
      valid = false
    } else {
      values[field] = value
    }
  }
  return valid ? values : null
}
