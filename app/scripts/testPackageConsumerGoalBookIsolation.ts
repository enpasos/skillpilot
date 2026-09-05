import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transformWithEsbuild, type Plugin, type PluginOption } from 'vite'

import viteConfig from '../vite.config'
import * as unavailable from '../src/packageConsumer/goalBookPublicationUnavailable'
import * as publication from '../src/utils/goalBookPublicationRegistry'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const registryPath = path.join(appRoot, 'src/utils/goalBookPublicationRegistry.ts')
const adapterPath = path.join(appRoot, 'src/packageConsumer/goalBookPublicationUnavailable.ts')
const importerPath = path.join(appRoot, 'src/components/CoursePlanLearningBook.tsx')
const policyName = 'skillpilot-package-consumer-source-policy'

// Catch stale transitive smoke bindings before the expensive frontend build.
// The Python contract/smoke gates remain the authoritative independent checks.
const repoRoot = path.resolve(appRoot, '..')
const runnerPath = 'scripts/run_package_consumer_smoke.py'
const runnerBytes = await readFile(path.join(repoRoot, runnerPath))
const vitePin = runnerBytes.toString('utf8').match(/^\s*"app\/vite\.config\.ts": "([a-f0-9]{64})",$/mu)
assert.ok(vitePin, 'the package smoke must explicitly pin the Vite source policy')
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
assert.equal(sha256(await readFile(path.join(appRoot, 'vite.config.ts'))), vitePin[1],
  'the package smoke Vite pin must match the reviewed build configuration')
const readinessPolicy = JSON.parse(await readFile(path.join(repoRoot,
  'contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json'), 'utf8'))
assert.equal(readinessPolicy.consumerSmokeRunner.path, runnerPath)
assert.equal(readinessPolicy.consumerSmokeRunner.bytes, runnerBytes.length)
assert.equal(readinessPolicy.consumerSmokeRunner.sha256, sha256(runnerBytes),
  'the readiness policy must bind the smoke runner after helper pins change')

assert.deepEqual(Object.keys(unavailable).sort(), Object.keys(publication).sort(),
  'the adapter exposes every registry runtime export needed by linking before tree-shaking')
assert.deepEqual(unavailable.GOAL_BOOK_PUBLICATION_REGISTRY, [],
  'installed packages carry no repository publication definitions')
assert.ok(Object.isFrozen(unavailable.GOAL_BOOK_PUBLICATION_REGISTRY))
assert.equal(unavailable.DEFAULT_GOAL_BOOK_ID, '')
assert.equal(unavailable.GOAL_BOOK_INDEX_URL, '')

for (const definition of publication.GOAL_BOOK_PUBLICATION_REGISTRY) {
  assert.equal(publication.goalBookDefinitionById(definition.bookId), definition)
  assert.equal(publication.goalBookDefinitionByLandscapeId(definition.landscapeId), definition,
    'the ordinary WebGUI retains its registered book definitions')
  assert.match(publication.goalBookRoute(definition.bookId), /^\/lernzielbuch(?:\?book=|$)/u,
    'the ordinary WebGUI retains its public book routes')
}
for (const input of ['', 'unknown-package-goal', ...publication.GOAL_BOOK_PUBLICATION_REGISTRY.flatMap(
  ({ landscapeId, bookId }) => [landscapeId, bookId],
)]) {
  assert.equal(unavailable.goalBookDefinitionById(input), undefined,
    'package mode cannot resolve a repository book by ID')
  assert.equal(unavailable.goalBookDefinitionByLandscapeId(input), undefined,
    'package mode never fabricates a repository book definition')
  assert.throws(() => unavailable.goalBookRoute(input), /unavailable.*package-consumer/iu,
    'an accidental package-mode route call fails closed instead of navigating')
}
for (const builder of [unavailable.goalBookModelUrl, unavailable.goalBookPdfUrl, unavailable.goalBookRenderManifestUrl]) {
  for (const definition of [...publication.GOAL_BOOK_PUBLICATION_REGISTRY, undefined]) {
    assert.throws(() => Reflect.apply(builder, undefined, [definition]), /unavailable.*package-consumer/iu,
      'every package-mode artifact URL builder rejects real and absent publication definitions')
  }
}

const flattenPlugins = async (options: PluginOption[]): Promise<Plugin[]> => {
  const plugins: Plugin[] = []
  for (const option of options) {
    const resolved = await option
    if (Array.isArray(resolved)) plugins.push(...await flattenPlugins(resolved))
    else if (resolved) plugins.push(resolved)
  }
  return plugins
}

assert.equal(typeof viteConfig, 'function')
assert.ok(typeof viteConfig === 'function')
const packageConfig = await viteConfig({ command: 'build', mode: 'package-consumer' })
const packagePlugins = await flattenPlugins(packageConfig.plugins ?? [])
const policies = packagePlugins.filter(({ name }) => name === policyName)
assert.equal(policies.length, 1, 'the real Vite config installs exactly one package source policy')
const policy = policies[0]
assert.equal(policy.enforce, 'pre', 'the boundary must resolve before ordinary source loading')
for (const mode of ['production', 'development']) {
  const config = await viteConfig({ command: 'build', mode })
  assert.equal((await flattenPlugins(config.plugins ?? [])).some(({ name }) => name === policyName), false,
    `${mode} must not replace the production publication registry`)
}

// Exercise the actual policy hooks without starting Vite, writing build output,
// or recursively invoking the package build whose pre-hook runs this test.
const context = { error: (message: string): never => { throw new Error(message) } }
const resolveHook = policy.resolveId
assert.ok(resolveHook)
const resolve = typeof resolveHook === 'function' ? resolveHook : resolveHook.handler
for (const specifier of [
  '../utils/goalBookPublicationRegistry',
  '../utils/goalBookPublicationRegistry.ts',
  '../utils/goalBookPublicationRegistry.ts?isolation-test#module',
  registryPath,
]) {
  const suffix = specifier.includes('?') ? '?isolation-test#module' : ''
  assert.equal(await Reflect.apply(resolve, context, [specifier, importerPath, {}]), `${adapterPath}${suffix}`,
    `the real package resolver isolates ${specifier}`)
}
assert.equal(await Reflect.apply(resolve, context, ['../utils/localTeacherCoursePlan', importerPath, {}]), null,
  'unrelated course-planning modules are not replaced')

const parsedHook = policy.moduleParsed
assert.ok(parsedHook)
const parsed = typeof parsedHook === 'function' ? parsedHook : parsedHook.handler
assert.throws(() => Reflect.apply(parsed, context, [{ id: registryPath }]), /Repository-only module/u,
  'a bypassed resolver cannot admit the original registry into the module graph')
assert.doesNotThrow(() => Reflect.apply(parsed, context, [{ id: adapterPath }]))

const bundleHook = policy.generateBundle
assert.ok(bundleHook)
const generate = typeof bundleHook === 'function' ? bundleHook : bundleHook.handler
const chunkWith = (moduleId: string) => ({ probe: { type: 'chunk', modules: { [moduleId]: {} } } })
assert.throws(() => Reflect.apply(generate, context, [{}, chunkWith(registryPath), false]), /Repository-only module/u,
  'the final chunk gate also rejects the original registry')
assert.doesNotThrow(() => Reflect.apply(generate, context, [{}, chunkWith(adapterPath), false]))

const adapterSource = await readFile(adapterPath, 'utf8')
const transformed = await transformWithEsbuild(adapterSource, adapterPath, { loader: 'ts', sourcemap: false })
assert.doesNotMatch(transformed.code, /goalBookPublicationRegistry/u,
  'the adapter type import must be erased, never reintroducing a runtime dependency')
for (const { landscapeId, bookId } of publication.GOAL_BOOK_PUBLICATION_REGISTRY) {
  assert.ok(!transformed.code.includes(landscapeId) && !transformed.code.includes(bookId),
    'the adapter runtime contains neither repository curriculum IDs nor book IDs')
}

console.log('Package-consumer goal-book isolation passed: unavailable adapter, mode-scoped resolution and graph/chunk guards.')
