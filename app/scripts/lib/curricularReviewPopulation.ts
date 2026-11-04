import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../../src/landscapeTypes'
import { fingerprintSemanticKindSourceGoal } from '../goalBookModel'
import { parseSemanticKindLedger } from './semanticKindLedger'

const boundGoals = new WeakSet<LearningGoal>()

/** Execution form does not replace the authoritative curricular classification. */
export function isAuthoritativeCurricularReviewGoal(goal: LearningGoal): boolean | undefined {
  return boundGoals.has(goal) ? goal.semanticKind === 'curricularAtomic' : undefined
}

/** Use the existing strict ledger/schema/fingerprint validator, never unchecked tags. */
export function bindCurricularReviewLandscape(
  landscape: SkillLandscape, ledger: unknown, landscapePath: string,
): SkillLandscape {
  const { semanticKindByGoalId } = parseSemanticKindLedger(
    ledger, landscape, landscape.landscapeId, landscapePath, fingerprintSemanticKindSourceGoal,
  )
  return { ...landscape, goals: landscape.goals.map(goal => {
    const bound = { ...goal, semanticKind: semanticKindByGoalId.get(goal.id) as LearningGoal['semanticKind'] }
    boundGoals.add(bound)
    return bound
  }) }
}

export function loadCurricularReviewLandscape(
  landscape: SkillLandscape, absolutePath: string, repoRoot: string,
): SkillLandscape {
  const directory = resolve(repoRoot, 'curricula/DE/Gymnasium/quality/release-model')
  if (!existsSync(directory)) return landscape
  const matches = readdirSync(directory).filter(name => name.endsWith('.semantic-kinds.json'))
    .map(name => JSON.parse(readFileSync(resolve(directory, name), 'utf8')))
    .filter(ledger => ledger.sourceLandscapeId === landscape.landscapeId)
  if (!matches.length) return landscape // Existing legacy landscapes without a ledger.
  if (matches.length !== 1) throw new Error('Ambiguous authoritative semantic-kind ledger')
  return bindCurricularReviewLandscape(landscape, matches[0], relative(repoRoot, absolutePath).replaceAll('\\', '/'))
}
