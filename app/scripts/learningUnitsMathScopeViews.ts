import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from './learningUnitsMathAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export function scopedViews(template: any, config: any) {
  assert.equal(config.schemaVersion, 1)
  assert.ok(Array.isArray(template.rootNodes))
  const seen = new Set<string>()
  return config.offers.map((offer: any) => {
    assert.ok(!seen.has(offer.viewId), 'Duplicate scoped view'); seen.add(offer.viewId)
    assert.equal(offer.scope.schoolForm, 'Gymnasium'); assert.equal(offer.scope.stage, 'SekI')
    assert.match(offer.scope.jurisdiction, /^DE-[A-Z]{2}$/)
    const view = structuredClone(template)
    view.viewId = offer.viewId; view.scope = offer.scope
    for (const goalId of config.prerequisiteOnlyGoalIds) {
      assert.ok(!view.rootNodes.some((node: any) => node.kind === 'goalEntry' && node.goalId === goalId), 'Duplicate direct scope override')
      view.rootNodes.unshift({ kind: 'goalEntry', goalId, projectionRole: 'prerequisiteOnly' })
    }
    return { path: offer.path, view }
  })
}
function main() {
  const config = JSON.parse(readFileSync(resolve(root, 'app/scripts/config/learning-units/math-monotonicity-seki-offers.json'), 'utf8'))
  const template = readFileSync(resolve(root, 'curricula', config.templatePath), 'utf8')
  assert.equal(digest(template), config.templateSha256, 'Shared view template drift')
  for (const { path, view } of scopedViews(JSON.parse(template), config)) {
    const bytes = `${JSON.stringify(view, null, 2)}\n`; const destination = resolve(root, 'curricula', path)
    if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), bytes, `Scoped view drift: ${path}`)
    else { mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, bytes) }
  }
  console.log(`Verified ${config.offers.length} shared-template SekI views; two explicit support overrides, no copied goal content`)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
