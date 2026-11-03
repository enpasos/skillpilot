import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  phaseCompatibilityProfile,
  validatePhaseCompatibility,
  type PhaseCompatibilityGoal,
} from './lib/phaseCompatibilityValidation'

const canonical = {
  landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
  frameworkId: 'canonical-gymnasium-math',
}
const native = { landscapeId: 'native-he', frameworkId: 'hessen-kc-2024' }
const goal = (id: string, phase: string, requires: string[] = []): PhaseCompatibilityGoal => ({
  id, title: id, phase, requires,
})
const pair = (phase: string, prerequisitePhase: string) => [goal('consumer', phase, ['prerequisite']), goal('prerequisite', prerequisitePhase)]
const check = (
  profile: { landscapeId: string; frameworkId?: string },
  goals: PhaseCompatibilityGoal[],
  effective: Record<string, string[]> = {},
) => validatePhaseCompatibility({ ...profile, goals }, (id) => effective[id] ?? goals.find((entry) => entry.id === id)?.requires ?? [])

assert.equal(phaseCompatibilityProfile(canonical), 'reference-phase-metadata')
for (const profile of [native, { ...canonical, frameworkId: 'wrong' },
  { landscapeId: canonical.landscapeId }, { ...canonical, landscapeId: 'other-math' },
  { landscapeId: 'other-canonical-subject', frameworkId: 'canonical-gymnasium-physics' }]) {
  assert.equal(phaseCompatibilityProfile(profile), 'legacy-acquisition-order')
  assert.equal(check(profile, pair('E', 'Q1')).length, 1, `strict profile ${JSON.stringify(profile)}`)
}
for (const [phase, prerequisite] of [['E', 'Q1'], ['J8', 'J10'], ['S1', 'S2'], ['9.1', '9.2'], ['Q4', 'Abitur']]) {
  const findings = check(native, pair(phase, prerequisite))
  assert.equal(findings.length, 1)
  assert.match(findings[0], /has direct prerequisite/)
}
for (const [phase, prerequisite] of [['E', 'E'], ['Q1', 'E'], ['J10', 'J8'], ['S2', 'S1'], ['Q4', 'GLOBAL']]) {
  assert.deepEqual(check(native, pair(phase, prerequisite)), [])
}
const inherited = [goal('consumer', 'E'), goal('prerequisite', 'Q1')]
assert.match(check(native, inherited, { consumer: ['prerequisite', 'prerequisite'] })[0], /has inherited\/effective prerequisite/)
assert.equal(check(native, inherited, { consumer: ['prerequisite', 'prerequisite'] }).length, 1)
assert.equal(check(native, [goal('consumer', 'E', ['native-he:prerequisite']), goal('prerequisite', 'Q1')]).length, 1)
assert.deepEqual(check(native, [goal('consumer', 'E', ['foreign:prerequisite']), goal('prerequisite', 'Q1')]), [])

for (const [phase, prerequisite] of [['J10', 'E'], ['J10', 'Q2'], ['Q2', 'Q4'], ['Q1', 'Q4']]) {
  const goals = pair(phase, prerequisite)
  const before = structuredClone(goals)
  assert.deepEqual(check(canonical, goals), [])
  assert.deepEqual(goals, before, 'the profile never rewrites phase or prerequisite data')
}

// Exercise the real CLI, including its inheritance and unconditional structural checks.
const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixture = mkdtempSync(join(tmpdir(), 'skillpilot-phase-compatibility-'))
try {
  const cwd = join(fixture, 'app')
  const curricula = join(fixture, 'curricula')
  mkdirSync(cwd)
  mkdirSync(curricula)
  const ledger = join(curricula, 'DE/Gymnasium/quality/release-model')
  mkdirSync(ledger, { recursive: true })
  writeFileSync(join(ledger, 'mathematik.semantic-kinds.json'), JSON.stringify({ sourceLandscapeId: canonical.landscapeId, decisions: [] }))
  const run = (
    profile: { landscapeId: string; frameworkId?: string },
    goals: Array<PhaseCompatibilityGoal & { contains?: string[] }>,
  ) => {
    writeFileSync(join(curricula, 'fixture.json'), JSON.stringify({ ...profile, title: 'Phase fixture', goals: goals.map((entry) => ({
      ...entry, description: entry.title, weight: 1, contains: entry.contains ?? [],
    })) }))
    const result = spawnSync(process.execPath, [join(appRoot, 'node_modules/tsx/dist/cli.mjs'), join(appRoot, 'scripts/validateGraph.ts')], {
      cwd, encoding: 'utf8', env: { ...process.env, VALIDATE_GRAPH_STRICT_RULES: '1' },
    })
    assert.ifError(result.error)
    return { status: result.status, output: result.stdout + result.stderr }
  }
  const direct = run(native, pair('E', 'Q1'))
  assert.equal(direct.status, 1)
  assert.match(direct.output, /❌ .*\[GVR-002\].*has direct prerequisite/)
  const inheritedResult = run(native, [
    { ...goal('parent', 'E', ['prerequisite']), contains: ['consumer'] },
    goal('consumer', 'E'), goal('prerequisite', 'Q1'),
  ])
  assert.match(inheritedResult.output, /❌ .*\[GVR-002\] Goal consumer.*has inherited\/effective prerequisite/)
  const mismatch = run({ ...canonical, frameworkId: 'wrong' }, pair('E', 'Q1'))
  assert.match(mismatch.output, /❌ .*\[GVR-002\].*has direct prerequisite/)
  const reference = run(canonical, pair('E', 'Q1'))
  assert.doesNotMatch(reference.output, /\[GVR-002\]/)
  const unknown = run(canonical, [goal('consumer', 'E', ['missing'])])
  assert.equal(unknown.status, 1)
  assert.match(unknown.output, /❌ .*requires missing id missing/)
  const invalidPhase = run(canonical, [goal('consumer', 'NOT_A_PHASE')])
  assert.match(invalidPhase.output, /❌ .*invalid phase NOT_A_PHASE/)
  const cycle = run(canonical, [
    { ...goal('parent', 'E', ['prerequisite']), contains: ['consumer'] },
    goal('consumer', 'E'), goal('prerequisite', 'Q1', ['consumer']),
  ])
  assert.equal(cycle.status, 1)
  assert.match(cycle.output, /❌ .*Cycle detected in effective_requires \(with inheritance\)/)
} finally {
  rmSync(fixture, { recursive: true, force: true })
}

console.log('Phase compatibility profiles, strict native direct/inherited checks and unconditional structural CLI checks passed.')
