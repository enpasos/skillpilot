// Repository curriculum IDs: the package-consumer build replaces this module
// with `src/packageConsumer/learnerUnitMapPreviewSubjects.ts` (see vite.config.ts).
import motionPractice from '../../../../curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json'
import type { MapPracticeMaterial } from './types'

export const HESSE_PHYSICS_E1_PRACTICE: MapPracticeMaterial = motionPractice
export const MATHEMATICS_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const PHYSICS_LANDSCAPE_ID = motionPractice.unit.landscapeId
/** The unit map preview covers these subjects only, identified by landscape ID. */
export const UNIT_MAP_PREVIEW_SUBJECT_IDS: readonly string[] = [MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID]

export const HESSE_PHYSICS_E_MEMORY_GOAL_ID = motionPractice.unit.flashcardGoalId
export const HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID = motionPractice.unit.assessmentGoalId
export const HESSE_PHYSICS_PRACTICE_VIEW_IDS: ReadonlySet<string> = new Set(motionPractice.unit.viewIds)
