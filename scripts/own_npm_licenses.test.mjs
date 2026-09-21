import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// These are SkillPilot's own active software packages, not dependency licenses,
// versioned content-package rights, or immutable provider-plugin release history.
const ownPackageRoots = [
  'app',
  'ai/claude/app',
  'ai/openai app',
  'ai/openai custom gpt',
  'ai/openai custom gpt/action-regression',
  'tools/demo-video',
]

// These existing manifests are byte-bound in the connector source contract
// pinned by the published Claude plugin. The central grant covers our code without rebinding that
// release merely to add metadata. Any explicit contrary license still fails.
const hashBoundPackageRoots = new Set(['app', 'ai/claude/app'])

for (const packageRoot of ownPackageRoots) {
  test(`${packageRoot}: own npm license and lockfile root agree`, () => {
    const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, packageRoot, 'package.json'), 'utf8'))
    if (hashBoundPackageRoots.has(packageRoot)) {
      assert.ok(manifest.license === undefined || manifest.license === 'Apache-2.0')
      assert.match(readFileSync(resolve(repositoryRoot, 'LICENSE'), 'utf8'), /Apache License\s+Version 2\.0/u)
      const scope = readFileSync(resolve(repositoryRoot, 'LICENSING.md'), 'utf8')
      assert.match(scope, /Apache License, Version 2\.0/u)
    } else {
      assert.equal(manifest.license, 'Apache-2.0')
    }
    const lockPath = resolve(repositoryRoot, packageRoot, 'package-lock.json')
    if (existsSync(lockPath)) {
      const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
      assert.equal(lock.packages?.['']?.license, manifest.license)
      assert.equal(lock.packages?.['']?.name, manifest.name)
      assert.equal(lock.packages?.['']?.version, manifest.version)
    }
  })
}
