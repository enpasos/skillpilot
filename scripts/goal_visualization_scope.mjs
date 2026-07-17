const EXCLUDED_NODE_KINDS = new Set(['memory', 'exam', 'tutor'])
const EXCLUDED_TAGS = new Set([
  'memorization',
  'motivation',
  'orientation',
  'practice',
  'assessment',
])

const normalizedTags = (goal) => (
  Array.isArray(goal?.tags)
    ? goal.tags
      .filter((tag) => typeof tag === 'string')
      .map((tag) => tag.trim().toLowerCase())
    : []
)

/**
 * Canonical goal-visualization coverage applies to ordinary atomic learning
 * goals. Motivation/orientation, assessment, memory and tool/runtime nodes
 * have their own presentation or QA lanes and must not inflate this scope.
 */
export function isOrdinaryAtomicGoalForVisualization(goal) {
  if (!goal || typeof goal !== 'object' || Array.isArray(goal)) return false
  if (Array.isArray(goal.contains) && goal.contains.length > 0) return false
  if (goal.contains !== undefined && goal.contains !== null && !Array.isArray(goal.contains)) return false

  const nodeKind = typeof goal.nodeKind === 'string' ? goal.nodeKind.trim().toLowerCase() : ''
  if (EXCLUDED_NODE_KINDS.has(nodeKind)) return false
  if (goal.examData !== undefined) return false

  const tags = normalizedTags(goal)
  if (tags.some((tag) => EXCLUDED_TAGS.has(tag))) return false
  if (tags.some((tag) => tag.startsWith('srs-deck:'))) return false
  return true
}

export function normalizeGoalVisualizationSubject(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
