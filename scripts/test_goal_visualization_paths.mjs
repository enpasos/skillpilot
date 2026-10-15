// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { goalVisualizationAssetSegments } from './goal_visualization_paths.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const prefix = '/assets/goal-visualizations/'
const traffic = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
const acceleration = 'e4b38061-1f28-43ad-8371-a3e7c0e81856'
const nested = `${prefix}physik/${traffic}/model-boundaries-v2/${traffic}.png`
assert.deepEqual(goalVisualizationAssetSegments(nested), ['physik', traffic, 'model-boundaries-v2', `${traffic}.png`])
assert.deepEqual(goalVisualizationAssetSegments(`${prefix}physik/${traffic}/${traffic}.jpg`), ['physik', traffic, `${traffic}.jpg`])

const unsafe = [
  '', '/assets/other/physik/id/id.png', '//assets/goal-visualizations/physik/id/id.png',
  `${prefix}physik/id`, `${prefix}physik/id/`, `${prefix}physik//id.png`,
  `${prefix}physik/./id.png`, `${prefix}physik/../id.png`,
  `${prefix}physik/id/v2/../id.png`, `${prefix}physik/id/v2/./id.png`,
  `${prefix}physik/id/v2//id.png`, `${prefix}physik/id\\v2/id.png`,
  `${prefix}physik/id/id.png?x=1`, `${prefix}physik/id/id.png#x`,
  `${prefix}physik/id/%2e%2e/id.png`, `${prefix}physik/id/%2E%2E/id.png`,
  `${prefix}physik/id/%252e%252e/id.png`, `${prefix}physik/id/v2%2fid.png`,
  `${prefix}physik/id/v2%5Cid.png`, `${prefix}physik/id/%00/id.png`,
  `${prefix}physik/id/id.png\n`, `${prefix}physik/id/id.png\r`,
  `${prefix}physik/id/id.png\u0000`, `${prefix}physik/id/id.png\t`,
  `${prefix}physik/id/naïve.png`, `${prefix}physik/id/..／id.png`,
]
for (const value of unsafe) assert.equal(goalVisualizationAssetSegments(value), null, JSON.stringify(value))

// Every current legacy URL retains exactly the previous three-component map.
let legacyMappings = 0
const canonicalDir = path.join(repoRoot, 'curricula/DE/Gymnasium/canonical')
for (const name of fs.readdirSync(canonicalDir).filter((n) => n.endsWith('.json'))) {
  const document = JSON.parse(fs.readFileSync(path.join(canonicalDir, name), 'utf8'))
  for (const goal of document.goals ?? []) for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    const legacy = link.url.match(/^\/assets\/goal-visualizations\/([^/]+)\/([^/]+)\/([^/]+)$/u)
    if (!legacy) continue
    const next = goalVisualizationAssetSegments(link.url)
    assert(next, link.url)
    assert.equal(path.join('canonical', ...next), path.join('canonical', legacy[1], legacy[2], legacy[3]), link.url)
    legacyMappings++
  }
}
assert(legacyMappings > 1000)

// Exercise the actual asset checker on a bounded physical fixture, retaining
// root-containment, owner/filename and exact three-copy hash checks.
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'skillpilot-visualization-paths-'))
let nativeChecks = 0
try {
  fs.mkdirSync(path.join(fixture, 'scripts/config'), { recursive: true })
  for (const name of ['check_goal_visualization_assets.mjs', 'goal_visualization_paths.mjs', 'deploy_goal_visualizations.ts']) {
    fs.copyFileSync(path.join(repoRoot, 'scripts', name), path.join(fixture, 'scripts', name))
  }
  // Native checker also uses the established scope contract.
  fs.copyFileSync(path.join(repoRoot, 'scripts/goal_visualization_scope.mjs'), path.join(fixture, 'scripts/goal_visualization_scope.mjs'))
  const source = JSON.parse(fs.readFileSync(path.join(canonicalDir, 'DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), 'utf8'))
  const doc = { ...source, goals: source.goals.filter((g) => [traffic, acceleration].includes(g.id)) }
  assert.equal(doc.goals.length, 2)
  const goal = doc.goals.find((g) => g.id === traffic)
  const oldRelative = `physik/${traffic}/${traffic}.jpg`
  const history = JSON.parse(fs.readFileSync(path.join(repoRoot, 'scripts/config/historical-goal-visualization-assets.json'), 'utf8'))
  const oldPin = history.assets.find((a) => a.path === oldRelative)
  assert(oldPin)
  fs.writeFileSync(path.join(fixture, 'scripts/config/historical-goal-visualization-assets.json'), JSON.stringify({ schemaVersion: 1, reason: 'Bounded test retains the actual old traffic JPG.', assets: [oldPin] }))
  const roots = ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']
  // Bootstrap from the versioned canonical and App assets. Backend static assets
  // are ignored build outputs and must not be required before deployment runs.
  for (const root of roots.slice(0, 2)) {
    for (const g of doc.goals) {
      const url = g.resourceLinks.find((l) => l.type === 'goal-visualization').url
      const relative = url.slice(prefix.length)
      const target = path.join(fixture, root, relative)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.copyFileSync(path.join(repoRoot, root, relative), target)
      if (root.startsWith('curricula/')) {
        fs.copyFileSync(path.join(repoRoot, root, path.dirname(relative), 'prompt.de.md'), path.join(path.dirname(target), 'prompt.de.md'))
      }
    }
    const retained = path.join(fixture, root, oldRelative)
    fs.mkdirSync(path.dirname(retained), { recursive: true })
    fs.copyFileSync(path.join(repoRoot, root, oldRelative), retained)
  }
  // Pin the actual App inputs before the production deployer refreshes its two
  // output roots, so an incorrect tracked App copy cannot be masked by generation.
  const fixtureAssets = [
    ...doc.goals.map((g) => g.resourceLinks.find((l) => l.type === 'goal-visualization').url.slice(prefix.length)),
    oldRelative,
  ]
  for (const relative of fixtureAssets) {
    assert.deepEqual(
      fs.readFileSync(path.join(fixture, roots[1], relative)),
      fs.readFileSync(path.join(fixture, roots[0], relative)),
      `tracked App visualization differs from the canonical source: ${relative}`,
    )
  }
  assert.equal(fs.existsSync(path.join(fixture, roots[2])), false)
  const deployment = spawnSync(process.execPath, [
    path.join(repoRoot, 'app/node_modules/tsx/dist/cli.mjs'),
    path.join(fixture, 'scripts/deploy_goal_visualizations.ts'),
  ], { encoding: 'utf8' })
  assert.equal(deployment.status, 0, deployment.stderr)
  const docPath = path.join(fixture, 'curricula/DE/Gymnasium/canonical/two-current.json')
  fs.mkdirSync(path.dirname(docPath), { recursive: true })
  const run = (success, contains = '') => {
    fs.writeFileSync(docPath, JSON.stringify(doc))
    const result = spawnSync(process.execPath, [path.join(fixture, 'scripts/check_goal_visualization_assets.mjs')], { encoding: 'utf8' })
    if (success) assert.equal(result.status, 0, result.stderr)
    else {
      assert.notEqual(result.status, 0)
      assert((result.stderr + result.stdout).includes(contains), result.stderr)
    }
    nativeChecks++
  }
  run(true)
  const link = goal.resourceLinks.find((l) => l.type === 'goal-visualization')
  const originalUrl = link.url
  link.url = originalUrl.replace(`/${traffic}/`, '/wrong-owner/')
  run(false, 'url must use safe path segments')
  link.url = originalUrl.replace(`${traffic}.png`, 'wrong-name.png')
  run(false, 'image filename must be')
  link.url = originalUrl.replace('/model-boundaries-v2/', '/%2e%2e/')
  run(false, 'url must use safe path segments')
  link.url = originalUrl
  const backend = path.join(fixture, roots[2], originalUrl.slice(prefix.length))
  fs.appendFileSync(backend, 'changed')
  run(false, 'asset hashes differ')
} finally {
  fs.rmSync(fixture, { recursive: true, force: true })
}
console.log(`Goal visualization paths passed: ${legacyMappings} exact legacy mappings, ${unsafe.length} rejected unsafe inputs, nested version accepted, ${nativeChecks} actual bounded native asset-checker cases.`)
