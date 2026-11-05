/** Exercise the real registered book loaders while historical QA binaries are
 * unavailable. No repository file is moved, deleted or copied for this check. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import promises from 'node:fs/promises'
import { syncBuiltinESMExports } from 'node:module'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const policy = JSON.parse(execFileSync('python3', ['-B', resolve(repositoryRoot, 'scripts/check_ci_curriculum_checkout.py'), '--policy'], { encoding: 'utf8' })) as {
  semantics: string; omittedQualityBinaryPattern: string; retainedExactPaths: string[]
}
assert.equal(policy.semantics, 'curriculum-ci-sparse-checkout-v1')
const omittedQualityBinary = new RegExp(policy.omittedQualityBinaryPattern, 'u')
const retainedExactPaths = new Set(policy.retainedExactPaths)
const observed = new Set<string>()
const excludedRequiredInputs = new Set<string>()
const requireSelectedInput = (value: unknown) => {
  const path = value instanceof URL ? fileURLToPath(value)
    : Buffer.isBuffer(value) ? value.toString() : typeof value === 'string' ? value : null
  if (path === null) return
  const local = relative(repositoryRoot, resolve(path)).replaceAll('\\', '/')
  if (local.startsWith('../') || isAbsolute(local)) return
  if (omittedQualityBinary.test(local) && !retainedExactPaths.has(local)) excludedRequiredInputs.add(local)
  if (!local.includes('/node_modules/')) observed.add(local)
}
const patch = (target: object, names: string[]) => {
  const mutable = target as Record<string, (...args: unknown[]) => unknown>
  for (const name of names) {
    const original = mutable[name]
    mutable[name] = Object.assign(function (...args: unknown[]) {
      requireSelectedInput(args[0])
      return Reflect.apply(original, target, args)
    }, original)
  }
}
patch(fs, ['readFileSync', 'readFile', 'existsSync', 'statSync', 'accessSync', 'realpathSync'])
patch(promises, ['readFile', 'stat', 'access', 'realpath'])
syncBuiltinESMExports()

const { GOAL_BOOK_PUBLICATION_REGISTRY } = await import('../src/utils/goalBookPublicationRegistry')
const { loadGoalBookBuildInputs } = await import('./goalBookModel')
const { buildGoalBookOriginalSources, goalBookOriginalSourceMappingPaths } = await import('./goalBookOriginalSources')
const { verifyGoalBookSourceAtlasInputs } = await import('./checkGoalBookPublication')
const reports = []
for (const definition of GOAL_BOOK_PUBLICATION_REGISTRY) {
  const before = new Set(observed)
  const configPath = `app/${definition.configPath}`
  verifyGoalBookSourceAtlasInputs({ bookId: definition.bookId, configPath: resolve(repositoryRoot, configPath) }, repositoryRoot)
  const { model } = await loadGoalBookBuildInputs(configPath, repositoryRoot)
  const sources = buildGoalBookOriginalSources(model, repositoryRoot,
    goalBookOriginalSourceMappingPaths(model, repositoryRoot, configPath))
  assert.equal(model.book.id, definition.bookId)
  assert.ok(sources)
  reports.push({ bookId: definition.bookId, newObservedInputs: [...observed].filter(path => !before.has(path)).length })
}
// A nonempty corpus and the shared metadata paths prove this did not replace
// the real source loaders with a mocked success.
assert.equal(reports.length, GOAL_BOOK_PUBLICATION_REGISTRY.length)
assert.ok(reports.length > 0)
assert.ok([...observed].some(path => path.includes('/quality/') && path.endsWith('.json')))
assert.ok([...observed].some(path => path.startsWith('app/public/assets/goal-visualizations/')))
const report = { semantics: 'registered-book-sparse-input-closure-v1', publications: reports,
  observedInputCount: observed.size, excludedRequiredInputs: [...excludedRequiredInputs].sort(), observedInputs: [...observed].sort() }
const reportArgument = process.argv.find(argument => argument.startsWith('--report='))
if (reportArgument) {
  const output = resolve(reportArgument.slice('--report='.length))
  assert.ok(relative(repositoryRoot, output).startsWith('tmp/'), 'evidence belongs in private tmp/')
  await promises.writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
}
assert.deepEqual([...excludedRequiredInputs].sort(), [],
  'Retain these exact actual source/metadata inputs in the sparse checkout; do not weaken the book checks')
console.log(`Registered book sparse input closure passed: ${reports.length} actual models/source indexes; ${observed.size} observed inputs; no required historical QA binary omitted.`)
