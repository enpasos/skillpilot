import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const validator = fileURLToPath(new URL('./validateGraph.ts', import.meta.url))
const tsx = fileURLToPath(new URL('../node_modules/tsx/dist/cli.mjs', import.meta.url))
const LOCAL = '11111111-1111-4111-8111-111111111111'
const FOREIGN = '22222222-2222-4222-8222-222222222222'
const OTHER = '33333333-3333-4333-8333-333333333333'
const SOURCE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const TARGET = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const OTHER_GOAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'

type Goal = { id: string; requires?: string[]; contains?: string[] }
type Landscape = { landscapeId: string; goals: Goal[]; language?: string }
const landscape = (landscapeId: string, goals: Goal[], language = 'de'): Landscape => ({
  landscapeId, goals, language,
})

/** Launch the actual production entry point with its normal cwd-based discovery. */
function runValidator(landscapes: Landscape[]) {
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-general-graph-reference-'))
  const curricula = join(root, 'curricula')
  const app = join(root, 'app')
  const writeJson = (path: string, value: unknown) => {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, JSON.stringify(value))
  }
  try {
    mkdirSync(app)
    for (const [index, value] of landscapes.entries()) {
      writeJson(join(curricula, 'fixture', 'canonical', `${index}.${value.language}.json`), {
        landscapeId: value.landscapeId,
        title: `Fixture ${value.landscapeId}`,
        goals: value.goals.map((goal) => ({
          title: `Goal ${goal.id}`,
          description: 'An independently assessable fixture competence.',
          weight: 1,
          ...goal,
        })),
      })
    }
    writeJson(join(curricula, 'curriculum_manifest.json'), {
      curricula: [...new Set(landscapes.map((value) => value.landscapeId))]
        .map((id) => ({ id, title: `Fixture ${id}` })),
    })
    // The real CLI always reads this independent, scoped Mathematics authority.
    // No Mathematics landscape is selected by these reference-only fixtures.
    writeJson(join(curricula, 'DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'), {
      sourceLandscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', decisions: [],
    })
    const result = spawnSync(process.execPath, [tsx, validator], {
      cwd: app,
      encoding: 'utf8',
      timeout: 20_000,
      env: { ...process.env, VALIDATE_GRAPH_STRICT_RULES: '1' },
    })
    assert.equal(result.error, undefined, result.error?.message)
    return { status: result.status, output: result.stdout + result.stderr }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

for (const relation of ['requires', 'contains'] as const) {
  test(`actual CLI rejects ambiguous foreign ${relation} across logical owners`, () => {
    const result = runValidator([
      landscape(LOCAL, [{ id: SOURCE, [relation]: [TARGET] }]),
      landscape(FOREIGN, [{ id: TARGET }]),
      landscape(OTHER, [{ id: TARGET }]),
    ])
    assert.equal(result.status, 1, result.output)
    assert.match(result.output, /ambiguous.*reference|reference.*ambiguous/iu)
    assert.ok(result.output.includes(FOREIGN) && result.output.includes(OTHER), result.output)
  })
}

test('actual CLI prefers a local definition over multiple foreign owners', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: [TARGET] }, { id: TARGET }]),
    landscape(FOREIGN, [{ id: TARGET }]),
    landscape(OTHER, [{ id: TARGET }]),
  ])
  assert.equal(result.status, 0, result.output)
})

test('actual CLI resolves an explicit owner even when the endpoint has multiple owners', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: [`${FOREIGN}:${TARGET}`] }]),
    landscape(FOREIGN, [{ id: TARGET }]),
    landscape(OTHER, [{ id: TARGET }]),
  ])
  assert.equal(result.status, 0, result.output)
})

test('actual CLI resolves a unique unqualified foreign owner', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: [TARGET] }]),
    landscape(FOREIGN, [{ id: TARGET }]),
  ])
  assert.equal(result.status, 0, result.output)
})

test('actual CLI counts DE/EN serializations as one logical foreign owner', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: [TARGET] }]),
    landscape(FOREIGN, [{ id: TARGET }], 'de'),
    landscape(FOREIGN, [{ id: TARGET }], 'en'),
  ])
  assert.equal(result.status, 0, result.output)
})

test('actual CLI rejects a missing endpoint', () => {
  const result = runValidator([landscape(LOCAL, [{ id: SOURCE, requires: [TARGET] }])])
  assert.equal(result.status, 1, result.output)
  assert.match(result.output, /missing/iu)
})

for (const owner of [OTHER, 'unknown-owner']) {
  test(`actual CLI never falls back from explicit wrong owner ${owner}`, () => {
    const result = runValidator([
      landscape(LOCAL, [{ id: SOURCE, requires: [`${owner}:${TARGET}`] }]),
      landscape(FOREIGN, [{ id: TARGET }]),
      landscape(OTHER, [{ id: OTHER_GOAL }]),
    ])
    assert.equal(result.status, 1, result.output)
    assert.match(result.output, /missing/iu)
  })
}

for (const reference of [`:${TARGET}`, `${FOREIGN}:`, `${FOREIGN}:${TARGET}:suffix`, ` ${TARGET} `]) {
  test(`actual CLI rejects malformed reference ${JSON.stringify(reference)}`, () => {
    const result = runValidator([
      landscape(LOCAL, [{ id: SOURCE, requires: [reference] }]),
      landscape(FOREIGN, [{ id: TARGET }]),
    ])
    assert.equal(result.status, 1, result.output)
    assert.match(result.output, /invalid.*reference|missing/iu)
  })
}

test('actual CLI compares UUID endpoint values and preserves authored local graph keys', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: [TARGET.toUpperCase()] }, { id: TARGET }]),
  ])
  assert.equal(result.status, 0, result.output)
})

test('actual CLI detects ambiguity across different UUID spellings', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: [TARGET] }]),
    landscape(FOREIGN, [{ id: TARGET.toUpperCase() }]),
    landscape(OTHER, [{ id: TARGET }]),
  ])
  assert.equal(result.status, 1, result.output)
  assert.match(result.output, /ambiguous/iu)
})

test('actual CLI uses UUID value semantics for qualified foreign endpoints', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: [`${FOREIGN}:${TARGET.toUpperCase()}`] }]),
    landscape(FOREIGN, [{ id: TARGET }]),
  ])
  assert.equal(result.status, 0, result.output)
})

test('actual CLI leaves legacy symbolic identities exact without rewriting', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: ['legacy_token'] }]),
    landscape(FOREIGN, [{ id: 'legacy_token' }]),
  ])
  assert.equal(result.status, 0, result.output)
})

test('actual CLI never folds case for legacy symbolic identities', () => {
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: ['LEGACY_TOKEN'] }]),
    landscape(FOREIGN, [{ id: 'legacy_token' }]),
  ])
  assert.equal(result.status, 1, result.output)
})

test('actual CLI rejects a case-varied UUID self-reference', () => {
  const result = runValidator([landscape(LOCAL, [{ id: SOURCE, requires: [SOURCE.toUpperCase()] }])])
  assert.equal(result.status, 1, result.output)
  assert.match(result.output, /itself/iu)
})

for (const duplicate of [TARGET, TARGET.toUpperCase()]) {
  test(`actual CLI rejects conflicting local definitions ${duplicate}`, () => {
    const result = runValidator([landscape(LOCAL, [
      { id: SOURCE, requires: [TARGET] },
      { id: TARGET },
      { id: duplicate, requires: [SOURCE] },
    ])])
    assert.equal(result.status, 1, result.output)
    assert.match(result.output, /\[G05\].*Duplicate logical goal id/iu)
    assert.match(result.output, /cannot select one local topology/iu)
  })
}

test('actual CLI retains the local cycle check across UUID endpoint spellings', () => {
  const result = runValidator([landscape(LOCAL, [
    { id: SOURCE, requires: [TARGET.toUpperCase()] },
    { id: TARGET, requires: [SOURCE.toUpperCase()] },
  ])])
  assert.equal(result.status, 1, result.output)
  assert.match(result.output, /Cycle detected in requires/iu)
})

test('actual CLI keeps qualified owner namespaces exact', () => {
  const owner = 'abcdefab-cdef-4abc-8def-abcdefabcdef'
  const result = runValidator([
    landscape(LOCAL, [{ id: SOURCE, requires: [`${owner.toUpperCase()}:${TARGET}`] }]),
    landscape(owner, [{ id: TARGET }]),
  ])
  assert.equal(result.status, 1, result.output)
  assert.match(result.output, /missing reference/iu)
})
