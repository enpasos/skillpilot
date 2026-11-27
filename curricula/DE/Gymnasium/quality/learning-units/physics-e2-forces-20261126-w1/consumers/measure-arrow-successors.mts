// SPDX-License-Identifier: Apache-2.0
// Current A2 consumers and the unchanged individual K4 warning after the W1 cut.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'

const root = process.cwd()
const args = process.argv.slice(2)
assert(args[0] === '--output-dir' && args[1], 'Supply a fresh external --output-dir')
assert(args.length === 2 || (args.length === 3 && args[2] === '--write-current'))
const output = path.resolve(args[1])
assert(!output.startsWith(path.resolve(root, 'curricula') + path.sep), 'Full measurements stay outside curricula')
assert(!fs.existsSync(output), 'Keep previous measurements unchanged')
fs.mkdirSync(output, {recursive: true})
const read = (file: string) => JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'))
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const pin = (file: string) => ({path: file, sha256: hash(fs.readFileSync(path.resolve(root, file)))})
const load = (file: string) => import(pathToFileURL(path.resolve(root, file)).href)
const routes = await load('scripts/physics_arrow_route_validation.ts')
const warnings = await load('scripts/physics_arrow_applicability_review.ts')
const catalogPaths = fs.readdirSync(path.resolve(root, 'curricula/DE/Gymnasium/canonical'))
  .filter(name => name.endsWith('.json')).sort().map(name => `curricula/DE/Gymnasium/canonical/${name}`)
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const producerPath = 'curricula/DE/Gymnasium/quality/learning-units/physics-e2-forces-20261126-w1/consumers/measure-arrow-successors.mts'
const catalog = catalogPaths.map(read)
const initialInputs = [...catalogPaths, ledgerPath,
  'docs/qa-ci/applicability-accepted-warnings.json',
  'scripts/physics_arrow_route_validation.ts', 'scripts/physics_arrow_applicability_review.ts', producerPath].map(pin)
const consumers = routes.buildPhysicsArrowConsumerSuccessor(root, catalog, read(ledgerPath))
const warning = warnings.buildCurrentArrowWarningSuccessor(root)
const outputs = new Map<string, any>([
  [routes.arrowConsumerSuccessorPath, consumers],
  [warnings.arrowWarningSuccessorPath, warning],
])
for (const [file, value] of outputs) {
  const bytes = JSON.stringify(value, null, 2) + '\n'
  fs.writeFileSync(path.join(output, path.basename(file)), bytes)
  if (args[2] === '--write-current') {
    fs.mkdirSync(path.dirname(path.resolve(root, file)), {recursive: true})
    fs.writeFileSync(path.resolve(root, file), bytes)
  }
}
const routeAudit = routes.measurePhysicsArrowRoutes(root)
fs.writeFileSync(path.join(output, 'native-90-arrow-routes.actual.json'), JSON.stringify(routeAudit, null, 2) + '\n')
assert.equal(routeAudit.counts.views, 90)
assert.equal(routeAudit.consumerGoalIds.length, 28)
assert.deepEqual(routeAudit.violations, [], 'Current native arrow route projection failed')
warnings.loadAndVerifyArrowWarningDisposition(root)
for (const binding of initialInputs) assert.equal(pin(binding.path).sha256, binding.sha256, `Concurrent input change: ${binding.path}`)
for (const binding of warning.viewBindings) assert.equal(pin(binding.path).sha256, binding.sha256, `Concurrent view change: ${binding.path}`)
fs.writeFileSync(path.join(output, 'inputs.actual.json'), JSON.stringify(initialInputs, null, 2) + '\n')
console.log(JSON.stringify({status: 'PASS', writtenCurrent: args[2] === '--write-current',
  reviewedConsumers: consumers.consumerGoalIds.length, retainedA2Consumers: consumers.predecessorConsumerGoalIds.length,
  addedW1Consumers: consumers.addedGoalIds.length, individualWarning: warning.exactWarning.code,
  offers: warning.counts, countermodels: warning.countermodels.length}))
