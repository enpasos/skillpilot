import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { CanonicalAuthoringGoal } from '../src/utils/authoring/canonicalAuthoring'
import type {
  CompositionStructureNode,
  CompositionView,
  CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>
type SemanticKindLedger = JsonRecord & { counts?: Record<string, number> }

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const unexpected = process.argv.slice(2).filter((argument) => !['--write', '--check'].includes(argument))
if (unexpected.length > 0 || (writeMode && checkMode)) throw new Error('Use at most one of --write or --check')

const expectedPlannedCorpusSha256: string = 'sha256:544576deea945a551baee7095c63210b852e3b06452ac15db5aacb6f881e1175'
const landscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const motivationId = '5c44b9ba-9b05-4774-95d5-073230d3fc4f'
const localOrientationId = '70b358bf-da6d-53ba-8393-51d5c2365b04'
const routeRootSpecs = [
  {
    goalId: '7badac4d-2874-5b3a-87e8-bf8f4440b2a6',
    before: [localOrientationId],
    after: [localOrientationId, motivationId],
  },
  {
    goalId: 'a684bec1-ba59-59d0-98d2-4ca37236f64c',
    before: [],
    after: [motivationId],
  },
  {
    goalId: '512f81af-1480-56a8-ae52-af3aa1a6a859',
    before: [],
    after: [motivationId],
  },
] as const
const fingerprintGoalIds = [
  localOrientationId,
  ...routeRootSpecs.map(({ goalId }) => goalId),
] as const
const rpPrerequisiteOnlyGoalIds = [
  '51de4fd9-6827-5b3d-b2ca-5e27ba961a7f',
  'b60f63b6-e70b-5557-9f54-86d42fa80325',
  'bf8517a9-142b-5789-826a-767f3b277998',
] as const
const crossStageOnlyGoalIds = new Set(rpPrerequisiteOnlyGoalIds.slice(0, 2))
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindsPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const rpViews = [
  'curricula/DE/Gymnasium/composition-views/physik/de-rp-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-rp-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-rp-sekii-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-rp-sekii-lk.view.json',
] as const

const absolute = (path: string) => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const serialize = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const digest = (value: string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const outputs = new Map<string, string>()

const canonical = readJson(canonicalPath)
if (canonical.landscapeId !== landscapeId || canonical.subject !== 'Physik') throw new Error('Unexpected Physics landscape')
const goals = canonical.goals as CanonicalAuthoringGoal[]
const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
if (goalById.size !== goals.length || goals.length !== 710) throw new Error('Canonical Physics goal boundary drifted')
const localOrientation = goalById.get(localOrientationId)
if (!localOrientation || localOrientation.semanticKind !== 'orientation') throw new Error('Local solid-state orientation is missing')
if ((localOrientation.requires?.length ?? 0) === 1 && localOrientation.requires[0] === motivationId) localOrientation.requires = []
else if ((localOrientation.requires?.length ?? 0) !== 0) throw new Error('Local orientation must remain prerequisite-free')
for (const { goalId, before, after } of routeRootSpecs) {
  const goal = goalById.get(goalId)
  if (!goal || goal.type !== 'atomic' || (goal.contains?.length ?? 0) !== 0) throw new Error(`${goalId}: route root is not atomic`)
  const current = goal.requires ?? []
  if (JSON.stringify(current) === JSON.stringify(before)) goal.requires = [...after]
  else if (JSON.stringify(current) !== JSON.stringify(after)) throw new Error(`${goalId}: requires outside bounded before/after state`)
}
outputs.set(canonicalPath, serialize(canonical))

const semanticKinds = readJson(semanticKindsPath) as SemanticKindLedger
for (const goalId of fingerprintGoalIds) {
  const decision = (semanticKinds.decisions as JsonRecord[]).find((entry) => entry.goalId === goalId)
  if (!decision || decision.decisionStatus !== 'authoritative') throw new Error(`${goalId}: missing semantic-kind decision`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goalById.get(goalId)!)
}
if (semanticKinds.counts?.total !== 710 || semanticKinds.counts?.curricularAtomic !== 464) throw new Error('Semantic-kind denominator drifted')
outputs.set(semanticKindsPath, serialize(semanticKinds))

const walk = (nodes: CompositionViewNode[], visitor: (node: CompositionViewNode) => void): void => {
  for (const node of nodes) {
    visitor(node)
    if (Array.isArray(node.children)) walk(node.children, visitor)
  }
}
for (const path of rpViews) {
  const view = readJson(path) as CompositionView
  if (view.scope?.jurisdiction !== 'DE-RP') throw new Error(`${path}: not a DE-RP view`)
  const isSekIIOnly = path.includes('-sekii-')
  for (const goalId of rpPrerequisiteOnlyGoalIds) {
    if (isSekIIOnly && crossStageOnlyGoalIds.has(goalId)) continue
    const matches: CompositionViewNode[] = []
    walk(view.rootNodes, (node) => { if (node.goalId === goalId) matches.push(node) })
    if (matches.length === 0) {
      if (isSekIIOnly || goalId === rpPrerequisiteOnlyGoalIds[2]) throw new Error(`${path}: missing bounded direct goal ${goalId}`)
      let routeStructure: CompositionStructureNode | undefined
      walk(view.rootNodes, (node) => {
        if (node.kind === 'structure' && node.id === 'physics-seki-route-prerequisites') routeStructure = node
      })
      if (!routeStructure || !Array.isArray(routeStructure.children)) throw new Error(`${path}: missing route prerequisite structure`)
      routeStructure.children.push({ kind: 'goalEntry', goalId, projectionRole: 'prerequisiteOnly' })
    } else {
      for (const node of matches) node.projectionRole = 'prerequisiteOnly'
    }
  }
  outputs.set(path, serialize(view))
}

const plannedCorpusSha256 = digest(stableJson([...outputs].map(([path, bytes]) => ({ path, sha256: digest(bytes) }))))
if (expectedPlannedCorpusSha256 !== 'PENDING' && plannedCorpusSha256 !== expectedPlannedCorpusSha256) {
  throw new Error(`Planned corpus drifted: ${plannedCorpusSha256} != ${expectedPlannedCorpusSha256}`)
}
const changed = [...outputs].filter(([path, bytes]) => readFileSync(absolute(path), 'utf8') !== bytes)
if (writeMode) {
  execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repoRoot, stdio: 'inherit' })
  for (const [path, bytes] of changed) writeFileSync(absolute(path), bytes)
} else if (checkMode && changed.length > 0) {
  throw new Error(`Physics checkpoint repair is not materialized: ${changed.map(([path]) => path).join(', ')}`)
}
console.log(`CHECK physics_checkpoint_route_view_repair ${writeMode ? 'WRITE' : checkMode ? 'PASS' : 'PLAN'} routes=3 orientationPrerequisites=0 rpOverrides=8 files=${outputs.size} changed=${changed.length}`)
console.log(`PLANNED_CORPUS_SHA256 ${plannedCorpusSha256}`)
console.log(`PLANNED_PATHS ${changed.map(([path]) => path).join(',') || '-'}`)
