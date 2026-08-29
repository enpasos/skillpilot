import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

/* eslint-disable @typescript-eslint/no-explicit-any */
type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const conservationSubtreeId = 'e9d616d8-685f-4129-a36f-dae7a280bae7'
const advancedMomentumDerivationId = 'f524f05c-4456-4fc3-a1f7-f40741fc1f16'
const viewRoot = 'curricula/DE/Gymnasium/composition-views/physik'

const jurisdictionsWithInheritedGkTarget = [
  'bb', 'be', 'hb', 'he', 'hh', 'mv', 'ni', 'nw', 'rp', 'sh', 'sl', 'sn', 'st', 'th',
] as const

const expectedViewNames = [
  'de-de-gym-physics-gk.view.json',
  'de-de-gym-sekii-physics-gk.view.json',
  ...jurisdictionsWithInheritedGkTarget.flatMap((jurisdiction) => [
    `de-${jurisdiction}-gk.view.json`,
    `de-${jurisdiction}-sekii-gk.view.json`,
  ]),
].sort()

const expectedViewNameSet = new Set(expectedViewNames)
const override = {
  kind: 'goalEntry',
  goalId: advancedMomentumDerivationId,
  projectionRole: 'prerequisiteOnly',
}

const absolute = (path: string): string => resolve(repoRoot, path)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')

const countDirectEntries = (value: unknown, goalId: string): JsonRecord[] => {
  if (Array.isArray(value)) return value.flatMap((entry) => countDirectEntries(entry, goalId))
  if (!value || typeof value !== 'object') return []
  const record = value as JsonRecord
  return [
    ...(record.kind === 'goalEntry' && record.goalId === goalId ? [record] : []),
    ...Object.values(record).flatMap((entry) => countDirectEntries(entry, goalId)),
  ]
}

const locateConservationChildren = (value: unknown): JsonRecord[][] => {
  if (Array.isArray(value)) {
    const ownsSubtree = value.some((entry) =>
      entry?.kind === 'canonicalSubtree' && entry.goalId === conservationSubtreeId)
    return [
      ...(ownsSubtree ? [value as JsonRecord[]] : []),
      ...value.flatMap((entry) => locateConservationChildren(entry)),
    ]
  }
  if (!value || typeof value !== 'object') return []
  return Object.values(value as JsonRecord).flatMap((entry) => locateConservationChildren(entry))
}

const allViewNames = readdirSync(absolute(viewRoot))
  .filter((name) => name.endsWith('.view.json'))
  .sort()

const physicsViews = allViewNames.map((name) => {
  const path = `${viewRoot}/${name}`
  return { name, path, view: JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord }
}).filter(({ view }) => view.landscapeId === physicsLandscapeId)

const actualExpectedViews = physicsViews
  .filter(({ name }) => expectedViewNameSet.has(name))
  .map(({ name }) => name)
  .sort()
if (JSON.stringify(actualExpectedViews) !== JSON.stringify(expectedViewNames)) {
  throw new Error(`Expected GK view set drifted: ${JSON.stringify(actualExpectedViews)}`)
}

const outputs = new Map<string, string>()
const beforeDigests: Record<string, string> = {}
const afterDigests: Record<string, string> = {}
let inserted = 0
let alreadyCurrent = 0

for (const { name, path, view } of physicsViews) {
  const courseProfile = String(view.scope?.courseProfile ?? '')
  const directEntries = countDirectEntries(view, advancedMomentumDerivationId)
  const expected = expectedViewNameSet.has(name)

  if (expected) {
    if (courseProfile !== 'GK') throw new Error(`${name}: expected GK course profile`)
    const containers = locateConservationChildren(view)
    if (containers.length !== 1) {
      throw new Error(`${name}: expected exactly one inherited conservation subtree, found ${containers.length}`)
    }
    if (directEntries.length > 1) throw new Error(`${name}: duplicate direct f524 overrides`)

    if (directEntries.length === 1) {
      const entry = directEntries[0]
      if (
        entry.kind !== override.kind
        || entry.goalId !== override.goalId
        || entry.projectionRole !== override.projectionRole
        || Object.keys(entry).length !== 3
      ) throw new Error(`${name}: unexpected direct f524 override shape`)
      alreadyCurrent += 1
    } else {
      const children = containers[0]
      const subtreeIndex = children.findIndex((entry) =>
        entry.kind === 'canonicalSubtree' && entry.goalId === conservationSubtreeId)
      if (subtreeIndex < 0) throw new Error(`${name}: conservation subtree disappeared`)
      children.splice(subtreeIndex + 1, 0, { ...override })
      inserted += 1
    }

    const finalDirectEntries = countDirectEntries(view, advancedMomentumDerivationId)
    if (
      finalDirectEntries.length !== 1
      || finalDirectEntries[0].projectionRole !== 'prerequisiteOnly'
    ) throw new Error(`${name}: failed to materialize exact prerequisite-only override`)

    const before = readFileSync(absolute(path), 'utf8')
    const after = serializeJson(view)
    beforeDigests[name] = sha256(before)
    afterDigests[name] = sha256(after)
    outputs.set(path, after)
    continue
  }

  if (courseProfile === 'GK' && directEntries.length !== 0) {
    throw new Error(`${name}: unexpected direct f524 entry outside the bounded 30-view fix`)
  }
  if (courseProfile === 'LK' && directEntries.length !== 0) {
    throw new Error(`${name}: LK view must retain inherited target without a direct override`)
  }
}

if (expectedViewNames.length !== 30 || outputs.size !== 30) {
  throw new Error(`Bounded view count drifted: expected=30 outputs=${outputs.size}`)
}

for (const [path, bytes] of outputs) {
  const current = readFileSync(absolute(path), 'utf8')
  if (writeMode && current !== bytes) writeFileSync(absolute(path), bytes)
}

const planDigest = sha256(JSON.stringify({
  goalId: advancedMomentumDerivationId,
  inheritedFrom: conservationSubtreeId,
  projectionRole: 'prerequisiteOnly',
  viewNames: expectedViewNames,
  afterDigests,
}))

console.log(
  `${writeMode ? 'WRITE' : inserted === 0 ? 'CHECK' : 'PLAN'} physics_f524_course_projection `
  + `views=30 inserted=${inserted} alreadyCurrent=${alreadyCurrent} planSha256=${planDigest}`,
)
if (!writeMode && inserted > 0) {
  console.log(`Pending files: ${expectedViewNames.map((name) => basename(name)).join(', ')}`)
}
