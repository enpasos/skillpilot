// The unit map preview names repository subjects by landscape ID. An installed
// package brings its own catalog, so this build has no preview subjects and the
// learner map reports itself as unavailable instead of drawing a board.
import type { MapPracticeMaterial } from '../components/learningUnitMap/types'

export const UNIT_MAP_LEARNING_MATERIALS: readonly MapPracticeMaterial[] = []
export const MATHEMATICS_LANDSCAPE_ID = ''
export const PHYSICS_LANDSCAPE_ID = ''
export const UNIT_MAP_PREVIEW_SUBJECT_IDS: readonly string[] = Object.freeze([])
