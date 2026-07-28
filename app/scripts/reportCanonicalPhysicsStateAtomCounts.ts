import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertLearningGoal } from '../src/goalTypes'
import type { SkillLandscape } from '../src/landscapeTypes'
import { normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { buildVisibleChildrenMap, getRenderedChildIds } from '../src/utils/treeProjectionRuntime'

type CourseProfile = 'GK' | 'LK'

interface TrackerStateRecord {
  jurisdiction: string
  displayName: string
}

interface TrackerRecord {
  landscapePath: string
  states: TrackerStateRecord[]
}

interface StateAtomicCountRow {
  jurisdiction: string
  displayName: string
  sek1: number
  sek1Gk: number
  sek1Lk: number
  sek1CourseProfileMismatch: boolean
  sek2Gk: number
  sek2Lk: number
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const trackerPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json')
const compositionViewDir = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/physik')

function loadTracker(): TrackerRecord {
  return JSON.parse(readFileSync(trackerPath, 'utf8')) as TrackerRecord
}

function loadLandscape(landscapePath: string): {
  landscape: SkillLandscape
  entry: { meta: SkillLandscape; goals: ReturnType<typeof convertLearningGoal>[] }
} {
  const landscape = JSON.parse(readFileSync(resolve(repoRoot, landscapePath), 'utf8')) as SkillLandscape
  return {
    landscape,
    entry: {
      meta: landscape,
      goals: landscape.goals.map((goal) =>
        convertLearningGoal(goal, { landscapeId: landscape.landscapeId }),
      ),
    },
  }
}

function countVisibleAtomicGoalsForStage({
  baseEntry,
  jurisdiction,
  courseProfile,
  stageTitlePrefix,
  viewPath,
}: {
  baseEntry: { meta: SkillLandscape; goals: ReturnType<typeof convertLearningGoal>[] }
  jurisdiction: string
  courseProfile?: CourseProfile
  stageTitlePrefix: string
  viewPath: string
}): number {
  const rawView = JSON.parse(readFileSync(viewPath, 'utf8'))
  const view = normalizeCompositionView(rawView)
  const projectedEntry = applyCompositionViewProjection([baseEntry], view)[0]
  if (!projectedEntry) {
    throw new Error(`Projection failed for ${viewPath}`)
  }

  const allGoals = new Map(projectedEntry.goals.map((goal) => [goal.id, goal]))
  const personalConfig = courseProfile
    ? { [projectedEntry.meta.landscapeId]: { selected: true, filterId: courseProfile } }
    : {}
  const visibleChildrenByParent = buildVisibleChildrenMap(allGoals, jurisdiction, personalConfig, 'all')
  const stageGoal = projectedEntry.goals.find((goal) =>
    goal.title.startsWith(stageTitlePrefix) && (goal.tags ?? []).includes('synthetic:program-unit'),
  )

  if (!stageGoal) {
    throw new Error(`Stage "${stageTitlePrefix}" not found in ${viewPath}`)
  }

  const atomicGoalIds = new Set<string>()
  const visitedGoalIds = new Set<string>()

  const walk = (goalId: string) => {
    if (visitedGoalIds.has(goalId)) return
    visitedGoalIds.add(goalId)

    const goal = allGoals.get(goalId)
    if (!goal) return

    if ((goal.contains ?? []).length === 0) {
      atomicGoalIds.add(goalId)
      return
    }

    for (const childId of getRenderedChildIds(goalId, allGoals, visibleChildrenByParent)) {
      walk(childId)
    }
  }

  walk(stageGoal.id)
  return atomicGoalIds.size
}

function countStateRows(): {
  landscapeId: string
  landscapeTitle: string
  rows: StateAtomicCountRow[]
} {
  const tracker = loadTracker()
  const { landscape, entry: baseEntry } = loadLandscape(tracker.landscapePath)

  const rows = tracker.states.map((state): StateAtomicCountRow => {
    const viewSlug = state.jurisdiction.toLowerCase()
    const sek1ViewPath = resolve(compositionViewDir, `${viewSlug}-seki.view.json`)
    const gkViewPath = resolve(compositionViewDir, `${viewSlug}-gk.view.json`)
    const lkViewPath = resolve(compositionViewDir, `${viewSlug}-lk.view.json`)

    if (!existsSync(gkViewPath)) {
      throw new Error(`Missing GK view for ${state.jurisdiction}: ${gkViewPath}`)
    }
    if (!existsSync(lkViewPath)) {
      throw new Error(`Missing LK view for ${state.jurisdiction}: ${lkViewPath}`)
    }

    const sek1Counts = existsSync(sek1ViewPath)
      ? (() => {
          const count = countVisibleAtomicGoalsForStage({
            baseEntry,
            jurisdiction: state.jurisdiction,
            stageTitlePrefix: 'Sekundarstufe I',
            viewPath: sek1ViewPath,
          })
          return {
            sek1: count,
            sek1Gk: count,
            sek1Lk: count,
            sek1CourseProfileMismatch: false,
          }
        })()
      : (() => {
          const sek1Gk = countVisibleAtomicGoalsForStage({
            baseEntry,
            jurisdiction: state.jurisdiction,
            courseProfile: 'GK',
            stageTitlePrefix: 'Sekundarstufe I',
            viewPath: gkViewPath,
          })
          const sek1Lk = countVisibleAtomicGoalsForStage({
            baseEntry,
            jurisdiction: state.jurisdiction,
            courseProfile: 'LK',
            stageTitlePrefix: 'Sekundarstufe I',
            viewPath: lkViewPath,
          })

          return {
            sek1: Math.max(sek1Gk, sek1Lk),
            sek1Gk,
            sek1Lk,
            sek1CourseProfileMismatch: sek1Gk !== sek1Lk,
          }
        })()

    return {
      jurisdiction: state.jurisdiction,
      displayName: state.displayName,
      ...sek1Counts,
      sek2Gk: countVisibleAtomicGoalsForStage({
        baseEntry,
        jurisdiction: state.jurisdiction,
        courseProfile: 'GK',
        stageTitlePrefix: 'Sekundarstufe II',
        viewPath: gkViewPath,
      }),
      sek2Lk: countVisibleAtomicGoalsForStage({
        baseEntry,
        jurisdiction: state.jurisdiction,
        courseProfile: 'LK',
        stageTitlePrefix: 'Sekundarstufe II',
        viewPath: lkViewPath,
      }),
    }
  })

  return {
    landscapeId: landscape.landscapeId,
    landscapeTitle: landscape.title,
    rows,
  }
}

function main() {
  const report = countStateRows()
  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        landscapeId: report.landscapeId,
        landscapeTitle: report.landscapeTitle,
        rows: report.rows,
      },
      null,
      2,
    ),
  )
}

main()
