/** GVR-002 is a compatibility profile, separate from structural graph validity. */
export interface PhaseCompatibilityGoal {
  id: string
  title: string
  phase: string
  requires: readonly string[]
}

interface PhaseCompatibilityLandscape {
  landscapeId: string
  frameworkId?: string
  goals: readonly PhaseCompatibilityGoal[]
}

export function phaseCompatibilityProfile(
  landscape: Pick<PhaseCompatibilityLandscape, 'landscapeId' | 'frameworkId'>,
): 'legacy-acquisition-order' | 'reference-phase-metadata' {
  // Mixed jurisdiction reference labels are not a global first-acquisition order.
  return landscape.landscapeId === '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
    && landscape.frameworkId === 'canonical-gymnasium-math'
    ? 'reference-phase-metadata'
    : 'legacy-acquisition-order'
}

function comparablePhaseRank(phase: string): number | null {
  const upper = phase.toUpperCase()
  const sMatch = upper.match(/^S(\d{1,2})$/)
  if (sMatch) return 100 + Number(sMatch[1])

  const jMatch = upper.match(/^J(\d{1,2})$/)
  if (jMatch) return 200 + Number(jMatch[1])

  const yearLevelMatch = upper.match(/^(\d{1,2})(?:\.(\d{1,2}))?$/)
  if (yearLevelMatch) {
    const year = Number(yearLevelMatch[1])
    if (year >= 5 && year <= 13) {
      const part = yearLevelMatch[2] ? Number(yearLevelMatch[2]) / 100 : 0
      return 200 + year + part
    }
  }

  // Preserve the legacy ordering, including mixed Sek-I/upper-stage bridges.
  if (upper === 'E') return 300
  if (upper === 'Q1') return 310
  if (upper === 'Q2') return 320
  if (upper === 'Q3') return 330
  if (upper === 'Q4') return 340
  if (upper === 'ABITUR') return 350
  return null
}

/** Checks only local phase compatibility; callers retain reference, vocabulary and DAG checks. */
export function validatePhaseCompatibility(
  landscape: PhaseCompatibilityLandscape,
  effectiveRequires: (goalId: string) => readonly string[],
): string[] {
  if (phaseCompatibilityProfile(landscape) === 'reference-phase-metadata') return []

  const localMap = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const localGoal = (raw: string): PhaseCompatibilityGoal | undefined => {
    if (!raw.includes(':')) return localMap.get(raw)
    const [landscapeId, goalId] = raw.split(':', 2)
    return (landscapeId || landscape.landscapeId) === landscape.landscapeId ? localMap.get(goalId) : undefined
  }
  const findings: string[] = []
  const reported = new Set<string>()
  for (const goal of landscape.goals) {
    const goalRank = comparablePhaseRank(goal.phase)
    if (goalRank === null) continue
    for (const raw of effectiveRequires(goal.id)) {
      const prerequisite = localGoal(raw)
      if (!prerequisite) continue
      const prerequisiteRank = comparablePhaseRank(prerequisite.phase)
      if (prerequisiteRank === null || prerequisiteRank <= goalRank) continue
      const key = `${goal.id}->${prerequisite.id}`
      if (reported.has(key)) continue
      reported.add(key)
      const direct = goal.requires.some((ref) => localGoal(ref)?.id === prerequisite.id)
      const edgeType = direct ? 'direct' : 'inherited/effective'
      findings.push(`Goal ${goal.id} (${goal.title}, phase ${goal.phase}) has ${edgeType} prerequisite ${prerequisite.id} (${prerequisite.title}, phase ${prerequisite.phase}), which points to a later phase.`)
    }
  }
  return findings
}
