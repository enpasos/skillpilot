import assert from 'node:assert/strict'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeAtomicAuthoringFile } from './atomicAuthoringFile'
import { digest } from './learningUnitsMathAuthoring'

interface ScopeNode { kind: string; goalId?: string; projectionRole?: string; children?: ScopeNode[] }
interface ScopeView { viewId: string; scope: Record<string, unknown>; rootNodes: ScopeNode[]; [key: string]: unknown }
interface ViewConfig { schemaVersion: number; offers: Array<{ viewId: string; path: string; scope: Record<string, string>; omittedDirectGoalIds?: string[]; prerequisiteOnlyGoalIds?: string[] }>; prerequisiteOnlyGoalIds: string[] }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export function scopedViews(template: ScopeView, config: ViewConfig) {
  assert.equal(config.schemaVersion, 1)
  assert.ok(Array.isArray(template.rootNodes))
  const seen = new Set<string>()
  return config.offers.map((offer) => {
    assert.ok(!seen.has(offer.viewId), 'Duplicate scoped view'); seen.add(offer.viewId)
    assert.equal(offer.scope.schoolForm, 'Gymnasium'); assert.equal(offer.scope.stage, 'SekI')
    assert.match(offer.scope.jurisdiction, /^DE-[A-Z]{2}$/)
    const view = structuredClone(template)
    view.viewId = offer.viewId; view.scope = offer.scope
    const omitted = new Set(offer.omittedDirectGoalIds ?? [])
    const retain = (nodes: ScopeNode[]): ScopeNode[] => nodes.flatMap(node => {
      if (node.goalId && omitted.has(node.goalId)) return []
      if (!node.children) return [node]
      const children = retain(node.children)
      return children.length ? [{ ...node, children }] : []
    })
    view.rootNodes = retain(view.rootNodes)
    const supports = [...config.prerequisiteOnlyGoalIds, ...(offer.prerequisiteOnlyGoalIds ?? [])]
    assert.equal(new Set(supports).size, supports.length, 'Duplicate authored scope override')
    for (const goalId of supports) {
      assert.ok(!view.rootNodes.some((node) => node.kind === 'goalEntry' && node.goalId === goalId), 'Duplicate direct scope override')
      view.rootNodes.unshift({ kind: 'goalEntry', goalId, projectionRole: 'prerequisiteOnly' })
    }
    return { path: offer.path, view }
  })
}
function main() {
  const config = JSON.parse(readFileSync(resolve(root, 'app/scripts/config/learning-units/math-monotonicity-seki-offers.json'), 'utf8'))
  const template = readFileSync(resolve(root, 'curricula', config.templatePath), 'utf8')
  assert.equal(digest(template), config.templateSha256, 'Shared view template drift')
  const args = process.argv.slice(2), index = args.indexOf('--view')
  const selected = index < 0 ? undefined : args[index + 1]
  assert.ok(process.argv.includes('--check') || selected, 'Writing shared-template scopes requires one explicit --view; preserve other authored views')
  if (selected) {
    assert.ok(config.offers.some((offer: { viewId: string }) => offer.viewId === selected), 'Unknown selected authored view')
    config.offers = config.offers.filter((offer: { viewId: string }) => offer.viewId === selected)
  }
  for (const { path, view } of scopedViews(JSON.parse(template), config)) {
    const bytes = `${JSON.stringify(view, null, 2)}\n`; const destination = resolve(root, 'curricula', path)
    if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), bytes, `Scoped view drift: ${path}`)
    else {
      mkdirSync(dirname(destination), { recursive: true })
      writeAtomicAuthoringFile(destination, bytes)
    }
  }
  console.log(`Verified ${config.offers.length} selected shared-template SekI views with authored omissions and prerequisite-only roles`)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
