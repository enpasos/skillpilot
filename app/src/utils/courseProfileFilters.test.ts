import { getDisplayCourseProfileFilters } from './filterLabels'
import { goalMatchesFilter } from './goalFilters'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const assertEqual = <T>(actual: T, expected: T, message: string) => {
  assert(Object.is(actual, expected), `${message}: expected ${String(expected)}, got ${String(actual)}`)
}

const authoredProfiles = [
  { id: 'GK', label: 'Grundkurs' },
  { id: 'LK', label: 'Leistungskurs' },
]

const germanProfiles = getDisplayCourseProfileFilters(authoredProfiles, 'de')
assertEqual(
  germanProfiles.map((filter) => filter.id).join(','),
  'GK,LK,GK+LK',
  'the combined display option uses the canonical course-profile value',
)
assertEqual(
  germanProfiles[2]?.label,
  'Grund- und Leistungskurs',
  'the combined display option has the German learner-facing label',
)
assert(
  germanProfiles.every((filter) => filter.id !== 'ALL'),
  'new course-profile display options never synthesize the legacy ALL value',
)

const englishProfiles = getDisplayCourseProfileFilters(authoredProfiles, 'en')
assertEqual(
  englishProfiles[2]?.label,
  'Basic and advanced course',
  'the combined display option has the English learner-facing label',
)

const alreadyCombinedProfiles = getDisplayCourseProfileFilters([
  ...authoredProfiles,
  { id: 'GK+LK', label: 'Grund- und Leistungskurs' },
], 'de')
assertEqual(
  alreadyCombinedProfiles.filter((filter) => filter.id === 'GK+LK').length,
  1,
  'an authored canonical combined profile is not duplicated',
)

const legacyProfiles = getDisplayCourseProfileFilters([
  ...authoredProfiles,
  { id: 'ALL', label: 'Grund- und Leistungskurs' },
], 'de')
assertEqual(
  legacyProfiles.filter((filter) => filter.id === 'ALL').length,
  1,
  'an authored legacy combined profile remains readable',
)
assertEqual(
  legacyProfiles.filter((filter) => filter.id === 'GK+LK').length,
  0,
  'a legacy combined profile is not duplicated by a canonical display option',
)

const unscopedGoal = {}
const gkGoal = { applicability: { courseProfile: ['GK'] } }
const lkGoal = { tags: ['LK'] }
const sharedGoal = { applicability: { courseProfile: ['GK+LK'] } }

for (const [label, goal] of [
  ['unscoped', unscopedGoal],
  ['GK-only', gkGoal],
  ['LK-only', lkGoal],
  ['shared', sharedGoal],
] as const) {
  assert(
    goalMatchesFilter(goal, 'GK+LK'),
    `the combined course profile includes ${label} goals`,
  )
}

assert(goalMatchesFilter(gkGoal, 'GK'), 'GK includes GK-only goals')
assert(!goalMatchesFilter(lkGoal, 'GK'), 'GK excludes LK-only goals')
assert(goalMatchesFilter(lkGoal, 'LK'), 'LK includes LK-only goals')
assert(!goalMatchesFilter(gkGoal, 'LK'), 'LK excludes GK-only goals')
assert(goalMatchesFilter(sharedGoal, 'GK'), 'GK includes goals authored for both profiles')
assert(goalMatchesFilter(sharedGoal, 'LK'), 'LK includes goals authored for both profiles')
assert(goalMatchesFilter(gkGoal, 'ALL'), 'legacy ALL remains a readable wildcard')
assert(goalMatchesFilter(lkGoal, 'ALL'), 'legacy ALL includes LK-only goals')

console.log('course profile filter tests passed')
