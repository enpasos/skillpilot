// SPDX-License-Identifier: Apache-2.0
/** Exercise real authored 1.2 Physics views through the complete map adapter.
 * In particular, stage/duration generation must not leave order endpoints to
 * a removed stage, even when atomic role retention still passes. */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import { compileCompositionView, readCompositionChildOrder, type CompositionView, type CompositionViewNode, type CompiledCompositionPreviewNode } from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { applyCompositionViewProjection, applyPersonalCurriculumProjection } from '../src/utils/compositionViewRuntime'
import { normalizeLearnerProjectedEntries, collapseLearnerSubjectRoots } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { deriveLearnerUnitMapPreview, PHYSICS_LANDSCAPE_ID } from '../src/components/learningUnitMap/learnerUnitMapPreview'
import { buildLearnerUnitMapProjection } from '../src/components/learningUnitMap/learnerUnitMapProjection'

const directory = fileURLToPath(new URL('../../curricula/DE/Gymnasium/', import.meta.url))
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const documents = readdirSync(`${directory}/canonical`).filter(name => name.endsWith('.json')).map(name => load(`${directory}/canonical/${name}`))
const sources = prepareLandscapeEntries(documents)
const ledgerFiles = (path: string): string[] => readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
  ? ledgerFiles(join(path, entry.name)) : entry.name.endsWith('.semantic-kinds.json') ? [join(path, entry.name)] : [])
const kinds = new Map(ledgerFiles(`${directory}/quality/release-model`).map(path => {
  const ledger = load(path)
  assert(ledger.decisions.every((decision: { decisionStatus: string }) => decision.decisionStatus === 'authoritative'))
  return [ledger.sourceLandscapeId, new Map<string, string>(ledger.decisions.map((decision: { goalId: string; semanticKind: string }) => [decision.goalId, decision.semanticKind]))] as const
}))
const canonical = documents.map(document => {
  const landscape = normalizeCanonicalLandscape(document)
  const ledger = kinds.get(landscape.landscapeId)
  if (ledger) {
    assert(landscape.goals.every(goal => ledger.has(goal.id)) && ledger.size === landscape.goals.length)
    landscape.goals = landscape.goals.map(goal => ({ ...goal, semanticKind: ledger.get(goal.id) }))
  }
  return landscape
})
const canonicalById = new Map(canonical.map(landscape => [landscape.landscapeId, landscape]))
const goalUniverse = { landscapeId: 'physics-validation-complete-canonical-universe', title: 'Complete canonical Gymnasium catalog', goals: canonical.flatMap(landscape => landscape.goals) }
const schemaId = 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json'
const schema = new Ajv2020({ allErrors: true, strict: false }).compile(load(fileURLToPath(new URL('../../contracts/composition-view/v1.2/composition-view.schema.json', import.meta.url))))
const comparableLabel = (label: string) => label.normalize('NFKC').toLocaleLowerCase('de-DE')
  .replace(/\s+/gu, ' ').replace(/^q[1-4][.:]\s*/u, '').replace(/^e-phase:\s*/u, '')
  .replace(/\s+\(sek(?:undarstufe)?\s*i{1,2}\)$/u, '').replace(/\s+\((?:gk|lk)\)$/u, '').trim()
const validateHeadings = (nodes: CompiledCompositionPreviewNode[], file: string, parent?: CompiledCompositionPreviewNode) => {
  for (const node of nodes) {
    assert(!parent || !comparableLabel(parent.label) || comparableLabel(parent.label) !== comparableLabel(node.label),
      `${file}: CPV-203 redundant heading ${parent?.label} -> ${node.label}`)
    validateHeadings(node.children, file, node)
  }
}
let checked = 0
const compileOnly = process.argv.includes('--compile-only')
const viewDirectory = process.argv.slice(2).find(argument => !argument.startsWith('--')) ?? `${directory}/composition-views/physik`
const jurisdiction = process.argv.find(argument => argument.startsWith('--jurisdiction='))?.split('=')[1]
const viewFiles = readdirSync(viewDirectory).filter(name => name.endsWith('.view.json')).sort()
assert.equal(viewFiles.length, 90, 'The input must contain the complete current Physics inventory.')
for (const name of viewFiles) {
  const view = load(`${viewDirectory}/${name}`) as CompositionView
  if (jurisdiction && (view.scope.jurisdiction ?? 'DE') !== (jurisdiction === 'DE' ? 'DE' : `DE-${jurisdiction}`)) continue
  if (view.$schema !== schemaId) continue
  assert(schema(view), `${name}: ${JSON.stringify(schema.errors)}`)
  const compiled = compileCompositionView(view, canonicalById.get(view.landscapeId) ?? null, goalUniverse, canonicalById)
  assert(!compiled.findings.some(finding => finding.severity === 'error'), `${name}: ${JSON.stringify(compiled.findings.filter(finding => finding.severity === 'error'))}`)
  validateHeadings(compiled.compiledRootNodes, name)
  const validate = (nodes: CompositionViewNode[]) => nodes.forEach(node => {
    if (node.kind !== 'structure') return
    readCompositionChildOrder(node.childOrder, node.children.filter(child => child.kind === 'structure').map(child => child.id))
    validate(node.children)
  })
  validate(view.rootNodes)
  if (compileOnly) { checked++; continue }
  const composed = normalizeLearnerProjectedEntries(applyCompositionViewProjection(sources, view))
  const projected = applyPersonalCurriculumProjection(composed, sources)
  const goalIndexAll = new Map(projected.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
  const { childrenByParent: visibleChildrenByParent } = collapseLearnerSubjectRoots(goalIndexAll, buildDirectChildrenMap(goalIndexAll))
  const rootGoals = [...goalIndexAll.values()].filter(goal => goal.landscapeId === PHYSICS_LANDSCAPE_ID && goal.tags.includes('root'))
  const visibleGoalIds = new Set<string>()
  const visit = (id: string) => { if (visibleGoalIds.has(id)) return; visibleGoalIds.add(id); (visibleChildrenByParent.get(id) ?? []).forEach(visit) }
  rootGoals.forEach(goal => visit(goal.id))
  const input = { rootGoals, goalIndexAll, visibleChildrenByParent, visibleGoalIds, landscapeSources: sources,
    canonicalGoalIndexAll: new Map(sources.flatMap(entry => entry.goals).map(goal => [goal.id, goal])) }
  const maximum = deriveLearnerUnitMapPreview(input).maxStep
  for (let step = 1; step <= maximum; step++) {
    const preview = deriveLearnerUnitMapPreview(input, step)
    const map = buildLearnerUnitMapProjection({ ...input, units: preview.units, after: preview.after })
    assert(!map.findings.some(finding => ['unknownUnit', 'afterNotSiblings', 'contradictoryAfter', 'selfAfter'].includes(finding.kind)),
      `${name}, step ${step}: ${JSON.stringify(map.findings)}`)
  }
  checked++
}
assert.equal(checked, jurisdiction ? jurisdiction === 'HE' ? 10 : 5 : 90,
  'Every view in the explicit validation scope must exercise the selected path.')
console.log(compileOnly
  ? `Physics stage view compiler preflight passed: ${checked} authored 1.2 views; schema, full formal compiler, headings and source endpoints.`
  : `Physics stage view product projection passed: ${checked} authored 1.2 views; schema, full formal compiler, headings, source endpoints, complete composition/personal-curriculum adapter and every nested preview step.`)
