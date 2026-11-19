import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertLearningGoal } from '../src/goalTypes'
import type { SkillLandscape } from '../src/landscapeTypes'
import { countStageTargetAtomsFromFile, stageCountSourceBinding } from './lib/stateStageAtomCounts'

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
  durationModel,
}: {
  baseEntry: { meta: SkillLandscape; goals: ReturnType<typeof convertLearningGoal>[] }
  jurisdiction: string
  courseProfile?: CourseProfile
  stageTitlePrefix: string
  viewPath: string
  durationModel?: string
}): number {
  return countStageTargetAtomsFromFile(baseEntry.meta, viewPath, {
    jurisdiction, courseProfile, durationModel,
    stage: stageTitlePrefix === 'Sekundarstufe I' ? 'SekI' : 'SekII',
  })
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

function hesseDurationRows() {
  const { landscape } = loadLandscape(loadTracker().landscapePath)
  return ['G8', 'G9'].map(durationModel => {
    const suffix = durationModel.toLowerCase()
    const count = (stage: 'SekI' | 'SekII', courseProfile?: CourseProfile) => {
      const name = stage === 'SekI' ? `de-he-seki-${suffix}.view.json` : `de-he-${courseProfile!.toLowerCase()}-${suffix}.view.json`
      return countStageTargetAtomsFromFile(landscape, resolve(compositionViewDir, name), {
        jurisdiction: 'DE-HE', stage, courseProfile, durationModel,
      })
    }
    return { jurisdiction: 'DE-HE', displayName: 'Hessen', durationModel,
      sek1: count('SekI'), sek2Gk: count('SekII', 'GK'), sek2Lk: count('SekII', 'LK') }
  })
}

function main() {
  const report = countStateRows()
  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        landscapeId: report.landscapeId,
        landscapeTitle: report.landscapeTitle,
        sourceInputs: stageCountSourceBinding(loadTracker().landscapePath, compositionViewDir, repoRoot),
        countingBasis: 'Unique canonical subject target atoms in authored stage views; excludes support-only atoms and synthetic/cluster nodes; overlapping tracks form a set union. No prerequisite closure or learner mastery.',
        durationBasis: 'State rows use duration-neutral authored views; Hessen G8/G9 are reported separately.',
        rows: report.rows,
        durationRows: hesseDurationRows(),
      },
      null,
      2,
    ),
  )
}

main()
