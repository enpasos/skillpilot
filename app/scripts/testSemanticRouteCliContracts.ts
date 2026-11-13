// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { loadGraphValidationLandscapes } from './lib/graphValidationInventory'
import { loadSemanticRouteInventory, type SemanticRoutePolicy } from './lib/semanticRouteInventory'
import { PHYSICS_QA_STAGE_VIEWS } from './lib/physicsQaStageTargets'

const original = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const policyPath = 'app/scripts/config/semantic-route-coverage.json'
const biologyPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const biologyLedgerPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const physicsViewPaths = new Set(PHYSICS_QA_STAGE_VIEWS.map(view => resolve(original, view.path)))

function materializeLiveInputs(source: string, target: string): void {
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const path = join(source, entry.name), output = join(target, entry.name)
    if (entry.isDirectory()) {
      if (['quality', 'input', 'archive'].includes(entry.name)) symlinkSync(path, output, 'dir')
      else materializeLiveInputs(path, output)
    } else if (path.includes('/canonical/') || physicsViewPaths.has(path) || [
      'prerequisite-reduction-proof-registry.json',
      'prerequisite-reduction-proof-registry-v8-politics-economics-20261111.json',
    ].includes(entry.name)) copyFileSync(path, output)
    else symlinkSync(path, output)
  }
}

function makeFixture(): string {
  const fixture = mkdtempSync(join(tmpdir(), 'skillpilot-semantic-cli-'))
  mkdirSync(join(fixture, 'app/scripts/config'), { recursive: true })
  symlinkSync(join(original, 'app/src'), join(fixture, 'app/src'), 'dir')
  for (const entry of readdirSync(join(original, 'app/scripts'))) {
    if (entry !== 'config') symlinkSync(join(original, 'app/scripts', entry), join(fixture, 'app/scripts', entry))
  }
  for (const entry of readdirSync(join(original, 'app/scripts/config'))) {
    if (entry === 'semantic-route-coverage.json') copyFileSync(join(original, policyPath), join(fixture, policyPath))
    else symlinkSync(join(original, 'app/scripts/config', entry), join(fixture, 'app/scripts/config', entry))
  }
  for (const entry of ['contracts', 'scripts', 'docs']) symlinkSync(join(original, entry), join(fixture, entry), 'dir')
  materializeLiveInputs(join(original, 'curricula'), join(fixture, 'curricula'))
  // The isolated Git base contains the newly required Biology scope. No object,
  // ref, index, source or evidence byte in the working repository is written.
  const git = (...args: string[]) => execFileSync('git', args, { cwd: fixture, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  git('init', '--quiet')
  git('add', policyPath)
  git('-c', 'user.name=Semantic route fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture base')
  git('update-ref', 'refs/remotes/origin/main', 'HEAD')
  return fixture
}

function runCli(fixture: string, baseRef = 'origin/main') {
  const result = spawnSync(process.execPath, [join(original, 'app/node_modules/tsx/dist/cli.mjs'), join(original, 'app/scripts/validateGraph.ts')], {
    cwd: join(fixture, 'app'), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, CI: 'true', SEMANTIC_ROUTE_POLICY_BASE: baseRef },
  })
  assert.equal(result.signal, null)
  assert.ifError(result.error)
  return { status: result.status, output: result.stdout + result.stderr }
}

test('actual validate:graph CLI rejects route and Git-base coverage mutations', async t => {
  const fixture = makeFixture()
  const policyBytes = readFileSync(join(fixture, policyPath))
  try {
    await t.test('unchanged isolated live inventory exits zero', () => {
      const result = runCli(fixture)
      assert.equal(result.status, 0, result.output)
      assert.match(result.output, /landscape\(s\) passed validation/)
    })
    await t.test('removing a Biology motivation segment fails the actual semantic gate', () => {
      const landscapeBytes = readFileSync(join(fixture, biologyPath))
      const landscape = JSON.parse(landscapeBytes.toString('utf8'))
      const goalId = '19fe5734-ea3e-5e3f-bd69-692955787168'
      const goal = landscape.goals.find((candidate: { id: string }) => candidate.id === goalId)
      goal.requires = []
      writeFileSync(join(fixture, biologyPath), JSON.stringify(landscape))
      for (const path of ['curricula/DE/Gymnasium/quality', 'curricula/DE/Gymnasium/quality/goal-book-publication']) {
        rmSync(join(fixture, path))
        mkdirSync(join(fixture, path))
        for (const entry of readdirSync(join(original, path))) symlinkSync(join(original, path, entry), join(fixture, path, entry))
      }
      const ledger = JSON.parse(readFileSync(join(fixture, biologyLedgerPath), 'utf8'))
      // Keep the original reviewed kind, with a current mutation-fixture
      // fingerprint, so stale evidence cannot mask the route assertion.
      ledger.decisions.find((decision: { goalId: string }) => decision.goalId === goalId).sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
      rmSync(join(fixture, biologyLedgerPath))
      writeFileSync(join(fixture, biologyLedgerPath), JSON.stringify(ledger))
      const result = runCli(fixture)
      assert.equal(result.status, 1, result.output)
      assert.match(result.output, new RegExp(`\\[GVR-012\\].*${goalId}.*missing direct atomic motivation`))
      writeFileSync(join(fixture, biologyPath), landscapeBytes)
      rmSync(join(fixture, biologyLedgerPath))
      symlinkSync(join(original, biologyLedgerPath), join(fixture, biologyLedgerPath))
    })
    await t.test('required Biology coverage cannot become pending against Git base', () => {
      const changed = JSON.parse(policyBytes.toString('utf8')) as SemanticRoutePolicy
      Object.assign(changed.scopes.find(scope => scope.scopeId === 'canonical-biology-sek2')!, {
        status: 'pending-route-evidence', reason: 'Attempted scope downgrade',
      })
      writeFileSync(join(fixture, policyPath), JSON.stringify(changed))
      const result = runCli(fixture)
      assert.equal(result.status, 1, result.output)
      assert.match(result.output, /required coverage lowered: canonical-biology-sek2/)
      writeFileSync(join(fixture, policyPath), policyBytes)
    })
    await t.test('required Physics coverage cannot become pending against Git base', () => {
      const changed = JSON.parse(policyBytes.toString('utf8')) as SemanticRoutePolicy
      Object.assign(changed.scopes.find(scope => scope.scopeId === 'canonical-physics-sek2')!, {
        status: 'pending-route-evidence', reason: 'Attempted scope downgrade',
      })
      writeFileSync(join(fixture, policyPath), JSON.stringify(changed))
      const result = runCli(fixture)
      assert.equal(result.status, 1, result.output)
      assert.match(result.output, /required coverage lowered: canonical-physics-sek2/)
      writeFileSync(join(fixture, policyPath), policyBytes)
    })
    await t.test('the actual CLI reads isolated Physics stage roles rather than cached original-repository targets', () => {
      const originals = PHYSICS_QA_STAGE_VIEWS.filter(view => view.stage === 'SekII').map(view => {
        const path = join(fixture, view.path)
        return { path, bytes: readFileSync(path) }
      })
      const changeRole = (nodes: Array<Record<string, unknown>>) => {
        for (const node of nodes) {
          if (node.kind === 'structure') changeRole(node.children as Array<Record<string, unknown>>)
          else if (node.goalId === '68034218-8f3e-5f7f-ae4e-ed057dd4e44e') node.projectionRole = 'prerequisiteOnly'
        }
      }
      try {
        for (const entry of originals) {
          const view = JSON.parse(entry.bytes.toString('utf8'))
          changeRole(view.rootNodes)
          writeFileSync(entry.path, JSON.stringify(view))
        }
        const result = runCli(fixture)
        assert.equal(result.status, 1, result.output)
        assert.match(result.output, /\[GVR-012\].*74a32716-2b46-5d96-8b57-3f6edb90e088.*no route through an ordinary curricular atomic goal/)
      } finally {
        originals.forEach(entry => writeFileSync(entry.path, entry.bytes))
      }
    })
    await t.test('Mathematics stage-bound route nodes cannot be widened against Git base', () => {
      const changed = JSON.parse(policyBytes.toString('utf8')) as SemanticRoutePolicy
      changed.ledgerSources[0]!.routeNodeScope = 'canonical-prerequisites'
      writeFileSync(join(fixture, policyPath), JSON.stringify(changed))
      const result = runCli(fixture)
      assert.equal(result.status, 1, result.output)
      assert.match(result.output, /route-node boundary changed/)
      writeFileSync(join(fixture, policyPath), policyBytes)
    })
    await t.test('explicit previous-push SHA works without origin/main and still rejects a downgrade', () => {
      const git = (...args: string[]) => execFileSync('git', args, { cwd: fixture, encoding: 'utf8' })
      const previousPushSha = git('rev-parse', 'refs/remotes/origin/main').trim()
      git('update-ref', '-d', 'refs/remotes/origin/main')
      const control = runCli(fixture, previousPushSha)
      assert.equal(control.status, 0, control.output)
      const changed = JSON.parse(policyBytes.toString('utf8')) as SemanticRoutePolicy
      Object.assign(changed.scopes.find(scope => scope.scopeId === 'canonical-biology-sek2')!, {
        status: 'pending-route-evidence', reason: 'Attempted main-push downgrade',
      })
      writeFileSync(join(fixture, policyPath), JSON.stringify(changed))
      const rejected = runCli(fixture, previousPushSha)
      assert.equal(rejected.status, 1, rejected.output)
      assert.match(rejected.output, /required coverage lowered: canonical-biology-sek2/)
      writeFileSync(join(fixture, policyPath), policyBytes)
      git('update-ref', 'refs/remotes/origin/main', previousPushSha)
    })
    await t.test('an absent explicit Git base never falls back to a weaker policy', () => {
      const result = runCli(fixture, '0'.repeat(40))
      assert.equal(result.status, 1, result.output)
      assert.match(result.output, /git rev-parse --verify 0000000000000000000000000000000000000000/)
    })
    await t.test('a selector view changed after evaluation invalidates the snapshot', async () => {
      const inventory = await loadSemanticRouteInventory(fixture, loadGraphValidationLandscapes(join(fixture, 'curricula')), 'origin/main')
      const path = join(fixture, PHYSICS_QA_STAGE_VIEWS[0].path)
      const before = readFileSync(path)
      try {
        writeFileSync(path, Buffer.concat([before, Buffer.from('\n')]))
        assert.throws(inventory.assertInputsCurrent, /input changed during audit/)
      } finally {
        writeFileSync(path, before)
      }
    })
    await t.test('a canonical input changed after evaluation invalidates the snapshot', async () => {
      const inventory = await loadSemanticRouteInventory(fixture, loadGraphValidationLandscapes(join(fixture, 'curricula')), 'origin/main')
      const before = readFileSync(join(fixture, biologyPath))
      writeFileSync(join(fixture, biologyPath), Buffer.concat([before, Buffer.from('\n')]))
      assert.throws(inventory.assertInputsCurrent, /input changed during audit/)
    })
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
