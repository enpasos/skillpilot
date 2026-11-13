import assert from 'node:assert/strict'
import test from 'node:test'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { withVerificationInputSnapshot, type VerificationInputReader } from './lib/verificationInputSnapshot'
import { discoverActiveMemoryCardReviewConfigs } from './memoryCardReviewConfigDiscovery'
import { buildApplicabilityCompilation, getAllJsonFiles, withApplicabilityInputSnapshot, type ApplicabilityInputSnapshot } from './applicabilityCompiler'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'

test('snapshot rejects changed, added and deleted discovered mapping inputs, including same-length changes', async () => {
  const root = mkdtempSync(join(tmpdir(), 'applicability-input-generation-'))
  const mapping = join(root, 'mapping.json')
  try {
    for (const change of ['content', 'new', 'deleted'] as const) {
      writeFileSync(mapping, '{"scope":"HE"}')
      await assert.rejects(withVerificationInputSnapshot(reader => {
        const paths = getAllJsonFiles(root, [], reader)
        assert.deepEqual(paths, [mapping])
        assert.equal(reader.readText(mapping), '{"scope":"HE"}')
        if (change === 'content') writeFileSync(mapping, '{"scope":"BY"}')
        if (change === 'new') writeFileSync(join(root, 'new.json'), '{}')
        if (change === 'deleted') rmSync(mapping)
        // These are immutable captured inputs, never a second ambient read.
        assert.equal(reader.readText(mapping), '{"scope":"HE"}')
      }), /Verification inputs changed/u)
      rmSync(join(root, 'new.json'), { force: true })
    }
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('absent optional inputs cannot appear during a successful generation and handles expire', async () => {
  const root = mkdtempSync(join(tmpdir(), 'applicability-optional-input-'))
  const missing = join(root, 'optional.json')
  let escaped: VerificationInputReader | undefined
  try {
    await assert.rejects(withVerificationInputSnapshot(reader => {
      escaped = reader
      assert.equal(reader.exists(missing), false)
      assert.throws(() => reader.readText(missing), { code: 'ENOENT' })
      writeFileSync(missing, '{}')
    }), /Verification inputs changed/u)
    assert.throws(() => escaped!.readText(missing), /snapshot is closed/u)
    await withVerificationInputSnapshot(reader => assert.equal(reader.readText(missing), '{}'))
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('active Memory discovery uses the same bound reader for configuration and file membership', async () => {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  mkdirSync(join(repoRoot, 'tmp'), { recursive: true })
  const root = mkdtempSync(join(repoRoot, 'tmp', 'memory-snapshot-generation-'))
  const local = (path: string) => relative(repoRoot, join(root, path))
  const config = { reviewId: 'snapshot', landscapeId: 'snapshot-landscape', landscapePath: local('landscape.json'),
    ruleVersion: 'fixture', scope: {}, reviewPath: local('records.jsonl') }
  const write = (path: string, value: unknown) => writeFileSync(join(root, path), JSON.stringify(value))
  try {
    mkdirSync(join(root, 'configs'))
    write('landscape.json', { landscapeId: config.landscapeId })
    write('configs/current.config.json', config)
    write('registry.json', { subjects: [{ landscapePath: config.landscapePath, memoryReviewConfigPath: local('configs/current.config.json') }] })
    await assert.rejects(withVerificationInputSnapshot(reader => {
      assert.equal(discoverActiveMemoryCardReviewConfigs(local('configs'), local('registry.json'), reader).length, 1)
      write('configs/current.config.json', { ...config, scope: { changed: true } })
    }), /Verification inputs changed/u)
    write('configs/current.config.json', config)
    await assert.rejects(withVerificationInputSnapshot(reader => {
      discoverActiveMemoryCardReviewConfigs(local('configs'), local('registry.json'), reader)
      write('configs/new.config.json', { ...config, reviewId: 'new' })
    }), /Verification inputs changed/u)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('compiler reuses only ambient inputs, preserves complete output and recompiles changed canonical frames', async () => {
  const goal: LearningGoal = { id: 'snapshot-goal', title: 'Fixture', description: 'Fixture', weight: 1,
    requires: [], contains: [], dimensionTags: { framework: 'test', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'J8' },
    extendedData: { applicabilityOverrides: { jurisdiction: ['DE-HE'] } } }
  const landscape: SkillLandscape = { landscapeId: 'snapshot-landscape', locale: 'de-DE', title: 'Fixture', description: 'Fixture', goals: [goal] }
  const supplied = [{ file: join(tmpdir(), 'snapshot-landscape.json'), landscape }]
  const before = structuredClone(supplied)
  const expected = buildApplicabilityCompilation(supplied)
  let escaped: ApplicabilityInputSnapshot | undefined
  await withApplicabilityInputSnapshot(snapshot => {
    escaped = snapshot
    const first = buildApplicabilityCompilation(supplied, snapshot)
    assert.deepEqual(first, expected)
    first.reports[0].goals[0].compiledApplicability.jurisdiction!.push('DE-BY')
    assert.deepEqual(buildApplicabilityCompilation(supplied, snapshot), expected, 'returned output cannot poison cached evidence')
    assert.deepEqual(supplied, before)
    goal.extendedData = { applicabilityOverrides: { jurisdiction: ['DE-BY'] } }
    const changed = buildApplicabilityCompilation(supplied, snapshot)
    assert.deepEqual(changed.reports[0].goals[0].compiledApplicability.jurisdiction, ['DE-BY'])
    assert.notDeepEqual(changed, expected, 'a supplied frame is never a cached compilation result')
  })
  assert.throws(() => buildApplicabilityCompilation(supplied, escaped), /closed applicability input snapshot/u)
  assert.throws(() => buildApplicabilityCompilation(supplied, {} as ApplicabilityInputSnapshot), /Unregistered/u)
})


test('proof and auditor detect edits after their own import, before lazy compiler loading', () => {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const root = mkdtempSync(join(repoRoot, 'tmp', 'proof-code-generation-'))
  try {
    for (const module of ['prerequisiteReductionProof', 'auditTransitiveMinimality', 'learningUnitLayerProjection', 'historicalReviewDependencyScope']) {
      const scripts = join(root, module, 'app', 'scripts')
      mkdirSync(scripts, { recursive: true })
      writeFileSync(join(root, module, 'package.json'), JSON.stringify({ type: 'module' }))
      for (const name of ['prerequisiteReductionProof', 'auditTransitiveMinimality', 'learningUnitLayerProjection'])
        copyFileSync(join(repoRoot, 'app', 'scripts', `${name}.ts`), join(scripts, `${name}.ts`))
      mkdirSync(join(scripts, 'lib'), { recursive: true })
      copyFileSync(join(repoRoot, 'app', 'scripts', 'lib', 'historicalReviewDependencyScope.ts'),
        join(scripts, 'lib', 'historicalReviewDependencyScope.ts'))
      const proofPath = join(scripts, 'prerequisiteReductionProof.ts')
      const changedPath = join(scripts, ...(module === 'historicalReviewDependencyScope' ? ['lib'] : []), `${module}.ts`)
      const script = `import { readFileSync, writeFileSync } from 'node:fs';
        import { pathToFileURL } from 'node:url';
        const proof = await import(pathToFileURL(${JSON.stringify(proofPath)}).href);
        writeFileSync(${JSON.stringify(changedPath)}, readFileSync(${JSON.stringify(changedPath)}, 'utf8') + ' // changed generation');
        try { await proof.loadVerifiedPrerequisiteReductionContext({ repositoryRoot: ${JSON.stringify(root)} }); process.exitCode = 9; }
        catch (error) { if (!/implementation changed since module load/u.test(String(error))) throw error; }`
      const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', script],
        { cwd: join(repoRoot, 'app'), encoding: 'utf8', timeout: 15000 })
      assert.equal(result.status, 0, result.stdout + result.stderr)
    }
  } finally { rmSync(root, { recursive: true, force: true }) }
})
