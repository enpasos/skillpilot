import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest } from './learningUnitsMathAuthoring'
import { compactScalarArrays } from './learningUnits/compactJson'
import { requireNativeInventory } from './learningUnitsNativeMathInventory'
import { collectNativeMathProjectionInputs } from './learningUnitsMathOfferBindings'
import { createNativeProjectionEvidence, discoverProjectionInputs, validateNativeProjectionEvidence } from './nativeProjectionEvidence'
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export function prepareMathProjectionEvidence(raw: unknown) {
  requireNativeInventory(raw)
  assert.deepEqual(raw.discoveryFailures, [], 'Native offered scope discovery failed')
  assert.equal(raw.scopes.length, 182, 'Actual Mathematics offered denominator changed; review it explicitly')
  const projected = collectNativeMathProjectionInputs(raw)
  const landscapeId = projected.source.landscapeId as string
  const inputs = Object.fromEntries(Object.entries(projected.inputs).map(([path, sha]) => [`curricula/${path}`, sha]))
  for (const [path, sha] of Object.entries(inputs)) assert.equal(raw.nativeMapperInputSha256[path], sha, `Consumed semantic input lacks actual native binding: ${path}`)
  assert.ok(raw.nativeImplementationInputSha256 && Object.keys(raw.nativeImplementationInputSha256 as object).length > 0, 'Missing native resolver/harness/build/declaration input bindings; rerun the current native adapter')
  assert.equal(raw.nativeImplementationBindingSemantics, 'captured-before-native-execution-and-equal-after-v1', 'Native implementation inputs were not bound at actual execution')
  for (const [path, expected] of Object.entries(raw.nativeImplementationInputSha256 as Record<string, string>)) {
    assert.equal(digest(readFileSync(resolve(repo, path))), expected, `Native implementation input changed: ${path}`)
    inputs[path] = expected
  }
  assert.ok(raw.nativeRuntimeDependencySha256 && Object.keys(raw.nativeRuntimeDependencySha256 as object).length > 0, 'Missing executed native dependency bindings')
  const inputDiscovery = [
    { directory: 'curricula/DE/Gymnasium/composition-views', kind: 'compositionView' as const },
    { directory: 'curricula', kind: 'goalMapping' as const },
    { directory: 'backend/src/main/java', kind: 'javaSources' as const },
  ].map(descriptor => ({ ...descriptor, paths: discoverProjectionInputs(repo, landscapeId, descriptor) }))
  // Bind unused candidate views too: changing one can affect native view matching.
  for (const descriptor of inputDiscovery) for (const path of descriptor.paths) {
    const sha = digest(readFileSync(resolve(repo, path)))
    const bound = descriptor.kind === 'javaSources' ? (raw.nativeImplementationInputSha256 as Record<string, string>)[path] : raw.nativeMapperInputSha256[path]
    assert.equal(bound, sha, `Projection candidate missing/drifted after actual native run: ${path}`)
    inputs[path] = sha
  }
  const goalIds = new Set(projected.source.goals.map((goal: any) => goal.id))
  for (const { row } of projected.rows) for (const [id, requirements] of Object.entries(row.atomicPrerequisites)) {
    assert.ok(goalIds.has(id), `Native demand leaves the currently bound landscape: ${id}`)
    for (const requirement of requirements as string[]) assert.ok(goalIds.has(requirement), `Foreign demand requires an explicit additional source adapter: ${requirement}`)
  }
  return createNativeProjectionEvidence({ landscapeId, landscapeSourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', resolverRevision: 'native-personal-curriculum-offers-v1', inputs,
    runtimeDependencySha256: raw.nativeRuntimeDependencySha256 as Record<string, string>,
    inputDiscovery, rows: projected.rows.map(({ inputPaths, ...row }) => ({ ...row, inputPaths: inputPaths.map(path => `curricula/${path}`) })) })
}
function main() {
  const args = process.argv.slice(2); const value = (key: string) => { const index = args.indexOf(key); return index < 0 ? undefined : args[index + 1] }
  const nativePath = value('--native'); const outputPath = value('--output')
  assert.ok(nativePath && outputPath, 'Required: --native <actual-backend.raw.json> --output <projection.json> [--run-native] [--check]')
  if (args.includes('--run-native')) execFileSync('./gradlew', ['--no-daemon', '--max-workers=1', '--init-script',
    '../app/scripts/learningUnits/nativeMathInventory.init.gradle', 'nativeMathOfferingInventory', `-PlearningUnitNativeOutput=${resolve(repo, nativePath)}`], {
    cwd: resolve(repo, 'backend'), stdio: 'inherit', env: { ...process.env, GRADLE_USER_HOME: process.env.GRADLE_USER_HOME ?? resolve(repo, 'tmp/chatgpt-coach-gradle-user-home') },
  })
  const raw = JSON.parse(readFileSync(resolve(repo, nativePath), 'utf8'))
  const result = prepareMathProjectionEvidence(raw)
  validateNativeProjectionEvidence(result, repo, result.landscapeId)
  const bytes = `${compactScalarArrays(result)}\n`
  const output = resolve(repo, outputPath)
  if (args.includes('--check')) assert.equal(readFileSync(output, 'utf8'), bytes, 'Native static projection changed')
  else { mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, bytes) }
  console.log(JSON.stringify({ scopes: result.scopes.length, staticInputs: Object.keys(result.inputs).length,
    targetUnion: Object.keys(result.targetAtomicMembership).length, sha256: digest(bytes), check: args.includes('--check') }))
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
