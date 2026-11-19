// Repository curriculum IDs: the package-consumer build replaces this module
// with `src/packageConsumer/learnerUnitMapPreviewSubjects.ts` (see vite.config.ts).
export const MATHEMATICS_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const PHYSICS_LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
/** The unit map preview covers these subjects only, identified by landscape ID. */
export const UNIT_MAP_PREVIEW_SUBJECT_IDS: readonly string[] = [MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID]

export const HESSE_PHYSICS_E_MEMORY_GOAL_ID = '9f2f5ab8-0ae4-5792-b831-82a05af5895c'
export const HESSE_PHYSICS_E1_ASSESSMENT_GOAL_ID = 'a9562b05-c54d-5635-9244-3f7dd24a8642'
export const HESSE_PHYSICS_PRACTICE_VIEW_IDS: ReadonlySet<string> = new Set([
  'de-he-gym-physics-gk', 'de-he-gym-physics-lk',
  'de-he-gym-physics-gk-g8', 'de-he-gym-physics-lk-g8',
  'de-he-gym-physics-gk-g9', 'de-he-gym-physics-lk-g9',
  'de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk',
])
