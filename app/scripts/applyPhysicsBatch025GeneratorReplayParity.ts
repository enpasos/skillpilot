import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import * as ts from 'typescript'

type OutputState = 'before' | 'after'
type PlannedFile = { path: string; bytes: string; state: OutputState }

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const paths = {
  shGenerator: 'app/scripts/generateShPhysicsSourceExtraction.ts',
  slGenerator: 'app/scripts/generateSlPhysicsSourceExtraction.ts',
  snGenerator: 'app/scripts/generateSnPhysicsSourceExtraction.ts',
} as const

const outputPaths = [paths.shGenerator, paths.slGenerator, paths.snGenerator] as const
const expectedBeforeHashes: Record<string, string> = {
  [paths.shGenerator]: 'b899ba520e0b63c0bd34836c89ec55ddaffd0e1d77e43d6af1c36e13890083e6',
  [paths.slGenerator]: '433b268a61ca5aad0d8302edaa204f7416f38797d681b326aaafb1ae2f751d77',
  [paths.snGenerator]: 'c70cd0913f7e347d62c709d1a9864001d607b256b11472415fe848268eac895e',
}
const expectedAfterHashes: Record<string, string> = Object.fromEntries(
  outputPaths.map((path) => [path, 'PENDING']),
)
expectedAfterHashes[paths.shGenerator] = '14fbc87a1f979ccb504307d7133242857d3142304fa29f26634cedb6bfd56447'
expectedAfterHashes[paths.slGenerator] = '8b09c38e5207eff34a47c8e0c3fbd024deab1902ed5f923e8092b81a4bbfb2b5'
expectedAfterHashes[paths.snGenerator] = '52287eb6456337a85069a4dfa7d4a342e3fb518b7f7f6f0e4e3d7a912d21b47d'
const expectedPlanSha256 = '3cd1934a5bd4399771eb5f7baa2a2eaa1f47abb252f028516cd93be0cec719ae'

const protectedViewHashes: Record<string, string> = {
  'curricula/DE/Gymnasium/composition-views/physik/de-sh-gk.view.json':
    'bde11403c0fe34f1babf27494348a91eb213daa6af4891b764f8539807c5926e',
  'curricula/DE/Gymnasium/composition-views/physik/de-sh-lk.view.json':
    '195028cc97b34d0c552bf0a341b909e1fb0d86a32659278dcf0ce78cfc6275a0',
  'curricula/DE/Gymnasium/composition-views/physik/de-sh-sekii-gk.view.json':
    'a439edccc944a0d278b4a345e2c541cccd6fbba11782877f989424375535958b',
  'curricula/DE/Gymnasium/composition-views/physik/de-sh-sekii-lk.view.json':
    '029d3a8a6b35458eaf2769a34086892206e60482178190688778839f81f0ff1c',
  'curricula/DE/Gymnasium/composition-views/physik/de-sl-gk.view.json':
    '811146a9adb5444f5ff3da9e6c157bee7dbde6bc4faabc99bb07e05c30ea8c41',
  'curricula/DE/Gymnasium/composition-views/physik/de-sl-lk.view.json':
    'a2ed3dc605dc30e8af2087fedd7eb5c3475ac1839650c958b8c20639818bebdf',
  'curricula/DE/Gymnasium/composition-views/physik/de-sl-sekii-gk.view.json':
    'eb8e310625be3091b615b559ac9d27f198a9d45008bd039752468305f81a1cfd',
  'curricula/DE/Gymnasium/composition-views/physik/de-sl-sekii-lk.view.json':
    '712c99bc04fd3dfea4be0f99110d7ef8893ce1a5a1bb0b54fdcb9c0a2e17daab',
  'curricula/DE/Gymnasium/composition-views/physik/de-sn-gk.view.json':
    '75274946b9b33e661633675ff6628582308ff8a688c748a507eb641372a26ecc',
  'curricula/DE/Gymnasium/composition-views/physik/de-sn-lk.view.json':
    '65e5afc496589f726dad2044fe2842e72eddc366dd8e83025ba385955ee49046',
  'curricula/DE/Gymnasium/composition-views/physik/de-sn-sekii-gk.view.json':
    '396006ac426ee370610012036ca4f8114ae0f951f2ad4e0d8231459c0ce3450e',
  'curricula/DE/Gymnasium/composition-views/physik/de-sn-sekii-lk.view.json':
    '80db3bb90ae57525bcf734ff90d95203ff9e67aa5100774956b92add67f59ece',
}

const helper = `const ensureBatch025VelocityTargetPlacement = (view: Record<string, unknown>): void => {
  const velocityGoalId = 'bf8517a9-142b-5789-826a-767f3b277998'
  const motions: Array<Record<string, unknown>> = []
  const acceleratedStructures: Array<Record<string, unknown>> = []
  const velocityReferences: Array<Record<string, unknown>> = []
  const visit = (nodes: Array<Record<string, unknown>>): void => {
    for (const node of nodes) {
      if (node.id === 'physics-e1-motion') motions.push(node)
      if (node.id === 'physics-e1-accelerated-and-free-fall') acceleratedStructures.push(node)
      if (node.goalId === velocityGoalId) velocityReferences.push(node)
      if (Array.isArray(node.children)) {
        visit(node.children as Array<Record<string, unknown>>)
      }
    }
  }
  if (!Array.isArray(view.rootNodes)) throw new Error('Batch-025 composition rootNodes missing')
  const rootNodes = view.rootNodes as Array<Record<string, unknown>>
  visit(rootNodes)
  if (motions.length !== 1 || acceleratedStructures.length !== 1 || velocityReferences.length !== 1) {
    throw new Error(
      \`Batch-025 placement cardinality drifted: motion=\${motions.length} accelerated=\${acceleratedStructures.length} velocity=\${velocityReferences.length}\`,
    )
  }
  const motion = motions[0]
  const accelerated = acceleratedStructures[0]
  const inheritedReference = velocityReferences[0]
  if (
    motion.kind !== 'structure'
    || accelerated.kind !== 'structure'
    || !Array.isArray(motion.children)
    || !Array.isArray(accelerated.children)
  ) {
    throw new Error('Batch-025 motion or accelerated structure shape drifted')
  }
  const motionChildren = motion.children as Array<Record<string, unknown>>
  const acceleratedChildren = accelerated.children as Array<Record<string, unknown>>
  const acceleratedIndexes = motionChildren
    .map((child, index) => child === accelerated ? index : -1)
    .filter((index) => index >= 0)
  const inheritedIndexes = acceleratedChildren
    .map((child, index) => child === inheritedReference ? index : -1)
    .filter((index) => index >= 0)
  if (acceleratedIndexes.length !== 1) {
    throw new Error('Batch-025 accelerated structure is not exactly one direct motion child')
  }
  if (
    inheritedIndexes.length !== 1
    || inheritedReference.kind !== 'goalEntry'
    || inheritedReference.projectionRole !== 'prerequisiteOnly'
  ) {
    throw new Error('Batch-025 inherited velocity reference is not the expected direct prerequisiteOnly goalEntry')
  }
  acceleratedChildren.splice(inheritedIndexes[0], 1)
  const targetReference: Record<string, unknown> = {
    kind: 'canonicalSubtree',
    goalId: velocityGoalId,
  }
  const acceleratedIndex = acceleratedIndexes[0]
  motionChildren.splice(acceleratedIndex, 0, targetReference)

  const postReferences: Array<Record<string, unknown>> = []
  const collectPostReferences = (nodes: Array<Record<string, unknown>>): void => {
    for (const node of nodes) {
      if (node.goalId === velocityGoalId) postReferences.push(node)
      if (Array.isArray(node.children)) {
        collectPostReferences(node.children as Array<Record<string, unknown>>)
      }
    }
  }
  collectPostReferences(rootNodes)
  if (
    postReferences.length !== 1
    || postReferences[0] !== targetReference
    || motionChildren[acceleratedIndex] !== targetReference
    || motionChildren[acceleratedIndex + 1] !== accelerated
    || acceleratedChildren.some((child) => child.goalId === velocityGoalId)
  ) {
    throw new Error('Batch-025 target placement postcondition failed')
  }
}`

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const stagingPath = (path: string): string => `${absolute(path)}.b025-generator-parity-staging`

function assertSha256(path: string, expected: string, label: string): void {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const actual = sha256(readFileSync(absolute(path)))
  if (actual !== expected) throw new Error(`${label}: ${path} drifted (${actual} != ${expected})`)
}

function assertProtectedViews(label: string): void {
  for (const [path, expected] of Object.entries(protectedViewHashes)) {
    assertSha256(path, expected, label)
  }
}

function insertHelper(source: string, anchor: string, label: string): string {
  if (source.includes('const ensureBatch025VelocityTargetPlacement = (')) return source
  const first = source.indexOf(anchor)
  if (first < 0 || source.indexOf(anchor, first + anchor.length) >= 0) {
    throw new Error(`${label}: expected one helper anchor`)
  }
  return `${source.slice(0, first)}${helper}\n\n${source.slice(first)}`
}

function insertCall(source: string, call: string, label: string): string {
  const after = `${call}\n  ensureBatch025VelocityTargetPlacement(${call.includes('(view)') ? 'view' : 'template'})`
  if (source.includes(after)) return source
  const first = source.indexOf(call)
  if (first < 0 || source.indexOf(call, first + call.length) >= 0) {
    throw new Error(`${label}: expected one call anchor`)
  }
  return `${source.slice(0, first)}${after}${source.slice(first + call.length)}`
}

function buildGenerator(path: string): string {
  let source = readFileSync(absolute(path), 'utf8')
  if (path === paths.shGenerator) {
    source = insertHelper(source, 'const addShSpecificViewEntries = (', 'SH generator')
    source = insertCall(source, '  addShSpecificViewEntries(view)', 'SH generator')
  } else {
    source = insertHelper(source, 'const addMissingMappedGoalsToView = (', `${path} generator`)
    source = insertCall(source, '  addMissingMappedGoalsToView(template, suffix)', `${path} generator`)
  }
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: path,
    reportDiagnostics: true,
  })
  const errors = (transpiled.diagnostics ?? []).filter((diagnostic) => (
    diagnostic.category === ts.DiagnosticCategory.Error
  ))
  if (errors.length > 0) throw new Error(`${path}: generated TypeScript syntax failed`)
  return source
}

if (outputPaths.length !== 3 || new Set(outputPaths).size !== 3) {
  throw new Error('Generator replay correction must contain exactly three output files')
}
assertProtectedViews('Protected correct target view')

const pendingBindings = [
  ...Object.entries(expectedBeforeHashes).filter(([, value]) => value === 'PENDING'),
  ...Object.entries(expectedAfterHashes).filter(([, value]) => value === 'PENDING'),
  ...(expectedPlanSha256 === 'PENDING' ? [['plan', 'PENDING']] : []),
]
if ((writeMode || checkMode) && pendingBindings.length > 0) {
  throw new Error(`Refusing ${writeMode ? '--write' : '--check'} while bindings remain PENDING`)
}

const plannedFiles: PlannedFile[] = outputPaths.map((path) => {
  const current = sha256(readFileSync(absolute(path)))
  const before = expectedBeforeHashes[path]
  const after = expectedAfterHashes[path]
  if (current !== before && (after === 'PENDING' || current !== after)) {
    throw new Error(`${path}: current generator is neither exact before nor exact after`)
  }
  const state: OutputState = after !== 'PENDING' && current === after ? 'after' : 'before'
  const bytes = buildGenerator(path)
  const plannedHash = sha256(bytes)
  if (after !== 'PENDING' && plannedHash !== after) throw new Error(`${path}: planned after-hash drifted`)
  return { path, bytes, state }
})

const outputBindings = plannedFiles.map(({ path, bytes }) => ({
  path,
  beforeSha256: expectedBeforeHashes[path],
  afterSha256: sha256(bytes),
}))
const planSha256 = sha256(stableJson({
  contract: 'physics-b025-generator-replay-parity-v1',
  outputBindings,
  protectedViewHashes,
  semanticInvariant: {
    goalId: 'bf8517a9-142b-5789-826a-767f3b277998',
    kind: 'canonicalSubtree',
    projectionRole: 'target',
    parentStructureId: 'physics-e1-motion',
    beforeStructureId: 'physics-e1-accelerated-and-free-fall',
    expectedViewCount: 12,
  },
}))
if (expectedPlanSha256 !== 'PENDING' && planSha256 !== expectedPlanSha256) {
  throw new Error(`Generator replay correction plan drifted (${planSha256} != ${expectedPlanSha256})`)
}

const updates = plannedFiles.filter(({ state }) => state === 'before')
if (checkMode) {
  if (updates.length > 0) throw new Error(`CHECK failed: ${updates.length} generator(s) remain before-state`)
  for (const file of plannedFiles) {
    if (existsSync(stagingPath(file.path))) {
      throw new Error(`CHECK failed: unexpected staging beside after-state output ${file.path}`)
    }
  }
}

if (writeMode) {
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  const alreadyAfter = new Set(
    plannedFiles.filter(({ state }) => state === 'after').map(({ path }) => path),
  )
  const assertAlreadyAfter = (label: string): void => {
    for (const path of alreadyAfter) {
      assertSha256(path, expectedAfterHashes[path], label)
    }
  }
  for (const path of alreadyAfter) {
    if (existsSync(stagingPath(path))) throw new Error(`${path}: unexpected staging beside after-state output`)
  }
  for (const file of updates) {
    const staging = stagingPath(file.path)
    mkdirSync(dirname(staging), { recursive: true })
    if (existsSync(staging)) {
      if (sha256(readFileSync(staging)) !== sha256(file.bytes)) throw new Error(`${file.path}: stale staging`)
    } else {
      writeFileSync(staging, file.bytes, { encoding: 'utf8', flag: 'wx' })
    }
  }
  for (const file of updates) {
    const afterHash = expectedAfterHashes[file.path]
    const staging = stagingPath(file.path)
    assertProtectedViews('Protected correct target view immediately before rename')
    assertAlreadyAfter('Already-after generator immediately before rename')
    assertSha256(staging, afterHash, 'Staged generator immediately before rename')
    assertSha256(file.path, expectedBeforeHashes[file.path], 'Generator target immediately before rename')
    renameSync(staging, absolute(file.path))
    alreadyAfter.add(file.path)
    assertAlreadyAfter('Already-after generator immediately after rename')
    assertProtectedViews('Protected correct target view immediately after rename')
  }
}

console.log(`MODE ${writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN'}`)
console.log(`PLAN_SHA256 ${planSha256} binding=${expectedPlanSha256}`)
console.log(`SCOPE generators=3 protectedViews=12 pending=${pendingBindings.length}`)
console.log(`OUTPUT_HASHES ${JSON.stringify(Object.fromEntries(outputBindings.map((entry) => [entry.path, entry.afterSha256])))}`)
console.log('SEMANTICS bf8517 target canonicalSubtree sibling-before accelerated/free-fall; views unchanged')
