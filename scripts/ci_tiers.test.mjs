// SPDX-License-Identifier: Apache-2.0
// The CI workflow has a quick tier for every push and a complete check for
// main and for pull requests that are not drafts. These tests keep the two
// tiers apart and keep the parallel jobs of the complete check complete.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const require = createRequire(new URL('../app/package.json', import.meta.url))
const { load: loadYaml } = require('js-yaml')
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const workflow = loadYaml(read('.github/workflows/ci.yml'))
const jobs = workflow.jobs

const quickTier = [
  'action-regression-ci',
  'openai-mcp-app-ci',
  'claude-connector-v1-ci',
  'openai-v1-public-edge-ci',
  'quick-checks',
  'backend-quick-checks',
]
const completeCondition = "${{ github.event_name != 'pull_request' || !github.event.pull_request.draft }}"
const completeJobs = Object.keys(jobs).filter(name => !quickTier.includes(name))
const commands = (name) => jobs[name].steps.map(step => step.run ?? '').join('\n')
const needs = (name) => [jobs[name].needs ?? []].flat()

test('marking a draft ready starts the complete check for that head', () => {
  assert.deepEqual(workflow.on.pull_request.types, ['opened', 'synchronize', 'reopened', 'ready_for_review'])
  assert.deepEqual(workflow.on.pull_request.branches, ['main'])
  assert.deepEqual(workflow.on.push.branches, ['main'])
  assert.ok('workflow_dispatch' in workflow.on, 'A complete check must be startable by hand')
  assert.deepEqual(workflow.on.pull_request.paths, workflow.on.push.paths)
})

test('the quick tier always runs and never waits for another job', () => {
  for (const name of quickTier) {
    assert.ok(jobs[name], `Missing quick-tier job: ${name}`)
    assert.equal(jobs[name].if, undefined, `${name} must run for draft pull requests too`)
    assert.deepEqual(needs(name), [], `${name} must not wait for another job`)
    assert.equal(jobs[name]['continue-on-error'], undefined, `${name} must be able to fail the run`)
  }
})

test('every other job belongs to the complete check and cannot be skipped otherwise', () => {
  assert.ok(completeJobs.length >= 9, 'The complete check lost jobs')
  for (const name of completeJobs) {
    assert.equal(jobs[name].if, completeCondition, `${name} must run exactly when the complete check runs`)
    assert.equal(jobs[name]['continue-on-error'], undefined, `${name} must be able to fail the run`)
    for (const dependency of needs(name)) {
      assert.ok(completeJobs.includes(dependency), `${name} may only wait for a complete-check job`)
    }
  }
})

test('jobs that consume the goal books wait for the same-run verified build', () => {
  const consumers = completeJobs.filter(name => jobs[name].steps.some(
    step => /^actions\/download-artifact@/u.test(step.uses ?? '') && /^goal-book-/u.test(step.with?.name ?? '')))
  assert.ok(consumers.length >= 6, 'Expected the application, curriculum and backend jobs to consume the goal books')
  for (const name of consumers) {
    assert.deepEqual(needs(name), ['goal-book-publication'], `${name} must wait for the goal-book build`)
    const artifact = jobs[name].steps.find(step => /^actions\/download-artifact@/u.test(step.uses ?? ''))
    assert.match(artifact.with.name, /^goal-book-(?:publication|catalog)-\$\{\{ github\.sha \}\}$/u,
      `${name} must restore the artifact of its own run`)
  }
})

test('the quick tier only repeats checks; it never is the only place of one', () => {
  const complete = completeJobs.map(commands).join('\n')
  for (const command of [
    'npm run lint',
    'npm run validate:graph',
    'python scripts/validate_schemas.py',
    '-p test_run_backend_ci.py',
  ]) {
    assert.ok(commands('quick-checks').includes(command) || commands('backend-quick-checks').includes(command),
      `Quick tier lost its early repeat: ${command}`)
    assert.ok(complete.includes(command), `The complete check must contain: ${command}`)
  }
  // The type-check and the compile are part of the complete application and backend builds.
  assert.match(commands('quick-checks'), /npx --no-install tsc -b/u)
  assert.match(complete, /npm run build:application/u)
  assert.match(commands('backend-quick-checks'), /run_backend_ci\.py --compile-only/u)
  assert.doesNotMatch(commands('backend-quick-checks'), /--manifest|--partition/u)
})

test('the parallel backend jobs run every partition exactly once', () => {
  const source = read('scripts/run_backend_ci.py')
  const declared = source.match(/^CI_PARTITIONS = \(([^)]*)\)$/mu)?.[1]
    .split(',').map(name => name.trim().replaceAll('"', '')).filter(Boolean)
  assert.ok(declared?.length, 'scripts/run_backend_ci.py must declare CI_PARTITIONS')
  const used = []
  for (const name of completeJobs) {
    const matrix = jobs[name].strategy?.matrix?.partition
    for (const step of jobs[name].steps) {
      const partition = (step.run ?? '').match(/run_backend_ci\.py --partition (\S+)/u)?.[1]
      if (!partition) continue
      if (partition === '"${BACKEND_PARTITION}"') {
        assert.equal(step.env?.BACKEND_PARTITION, '${{ matrix.partition }}')
        assert.equal(jobs[name].strategy['fail-fast'], false, 'One failing partition must not cancel the other')
        used.push(...matrix)
      } else {
        used.push(partition)
      }
      assert.match(step.run, /--manifest "\$\{BACKEND_FAILURE_MANIFEST\}"/u)
    }
  }
  assert.deepEqual([...used].sort(), [...declared].sort())
  assert.equal(new Set(used).size, used.length, 'A backend partition must not run twice')
  assert.doesNotMatch(completeJobs.map(commands).join('\n'), /(?<!test_)run_backend_ci\.py(?! --partition)/u,
    'The complete check must name its backend partition')
})

test('split jobs keep the environment of the job they were split from', () => {
  const stepNames = (name) => jobs[name].steps.map(step => step.name ?? step.uses)
  const until = (name, last) => stepNames(name).slice(0, stepNames(name).indexOf(last) + 1)
  const restore = 'Restore same-run verified goal-book publications'
  assert.deepEqual(until('goal-book-contracts', restore), until('frontend-ci', restore))
  for (const name of ['curriculum-assessment-proofs', 'curriculum-integrated-build', 'curriculum-package-contracts']) {
    assert.deepEqual(until(name, restore), until('graph-validation', restore))
    assert.equal(jobs[name]['runs-on'], jobs['graph-validation']['runs-on'])
    assert.deepEqual(jobs[name].defaults, jobs['graph-validation'].defaults)
  }
  assert.equal(jobs['goal-book-contracts']['runs-on'], jobs['frontend-ci']['runs-on'])
  assert.deepEqual(jobs['goal-book-contracts'].defaults, jobs['frontend-ci'].defaults)
})
