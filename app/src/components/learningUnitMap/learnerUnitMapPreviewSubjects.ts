// Repository curriculum IDs: the package-consumer build replaces this module
// with `src/packageConsumer/learnerUnitMapPreviewSubjects.ts` (see vite.config.ts).
import type { MapPracticeMaterial } from './types'

declare const __UNIT_MAP_LEARNING_MATERIALS__: readonly MapPracticeMaterial[]
export const UNIT_MAP_LEARNING_MATERIALS: readonly MapPracticeMaterial[] =
  typeof __UNIT_MAP_LEARNING_MATERIALS__ === 'undefined' ? [] : __UNIT_MAP_LEARNING_MATERIALS__
export const MATHEMATICS_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const PHYSICS_LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
/** The unit map preview covers these subjects only, identified by landscape ID. */
export const UNIT_MAP_PREVIEW_SUBJECT_IDS: readonly string[] = [MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID]
