import type { LearnerPlanStatus } from '../../src/learnerLearningPlanTypes'

/** Explicit server-response fixture; tests supply the text they expect to see. */
export const learnerPlanStatus = (
  asOf: string,
  landscapeIds: readonly string[] = [],
  overrides: Partial<LearnerPlanStatus> = {},
): LearnerPlanStatus => ({
  asOf,
  periodBasis: 'DAY',
  periodStart: asOf,
  periodEnd: asOf,
  timeZone: 'Europe/Berlin',
  language: 'de',
  evaluable: true,
  statusText: landscapeIds.length
    ? landscapeIds.map((id) => `${id.includes('phys') ? 'Physik' : 'Mathematik'}: Tagesziel 0 von 2 · im Plan`).join('\n')
    : 'Kein Lernplan eingerichtet.',
  noticeText: landscapeIds.length ? null : 'Kein Lernplan eingerichtet.',
  activeGoal: null,
  followLearningPlans: true,
  resumeAvailable: true,
  subjects: landscapeIds.map((landscapeId) => ({
    subjectKey: landscapeId,
    landscapeIds: [landscapeId],
    subjectLabel: landscapeId.includes('phys') ? 'Physik' : 'Mathematik',
    evaluable: true,
    periodText: 'Tagesziel 0 von 2',
    planStatusText: 'im Plan',
    subjectLine: `${landscapeId.includes('phys') ? 'Physik' : 'Mathematik'}: Tagesziel 0 von 2 · im Plan`,
    statusDirection: 'on_track',
    periodGauge: { completed: 0, target: 2, needlePosition: 0 },
    balanceGauge: { net: 0, typicalAmount: 2, scaleLimit: 4, needlePosition: 0, severeBehind: false, strongAhead: false },
    current: false,
    canContinue: true,
  })),
  unavailablePlanCount: 0,
  ...overrides,
})
