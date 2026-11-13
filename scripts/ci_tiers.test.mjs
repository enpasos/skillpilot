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
  assert.ok(completeJobs.length >= 8, 'The complete check lost jobs')
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
  assert.doesNotMatch(commands('backend-quick-checks'), /--manifest/u)
})

test('the complete check runs the complete backend suite exactly once', () => {
  const runs = completeJobs.flatMap(name => jobs[name].steps.map(step => step.run ?? '')
    .filter(run => /(?<!test_)run_backend_ci\.py/u.test(run)))
  assert.equal(runs.length, 1, 'Exactly one complete-check step runs the backend suite')
  assert.match(runs[0], /--manifest "\$\{BACKEND_FAILURE_MANIFEST\}"/u)
  assert.doesNotMatch(runs[0], /--compile-only/u)
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

test('complete curriculum CI enforces the catalog and policy against the trusted base', () => {
  const graph = commands('graph-validation')
  const local = read('run_ci.sh')
  for (const command of ['npm run check:transitive-minimality', 'npm run test:curriculum-maturity-floors']) {
    assert.ok(graph.includes(command), `Remote curriculum gate missing: ${command}`)
    assert.ok(local.includes(command), `Local curriculum gate missing: ${command}`)
  }
  assert.match(local, /npm run check:curriculum-maturity-floors -- --base-ref origin\/main/u)
  const step = jobs['graph-validation'].steps.find(step => step.name === 'Verify committed curriculum quality status')
  assert.equal(step.env.MATURITY_POLICY_BASE, "${{ github.event.pull_request.base.sha || github.event.before || 'origin/main' }}")
  assert.match(step.run, /git fetch --no-tags --depth=1 origin/u)
  assert.match(step.run, /npm run check:curriculum-maturity-floors -- --base-ref "\$\{MATURITY_POLICY_BASE\}"/u)
  assert.equal(step['continue-on-error'], undefined)
  assert.ok(commands('curriculum-assessment-proofs').includes('npm run test:graph-gate-contracts'))
  const proofSteps = jobs['curriculum-assessment-proofs'].steps
  const restoreIndex = proofSteps.findIndex(step => step.name === 'Restore same-run verified goal-book publications')
  const pythonIndex = proofSteps.findIndex(step => step.name === 'Set up Python for curriculum proof receipts')
  const installIndex = proofSteps.findIndex(step => step.name === 'Install Python dependencies for curriculum proof receipts')
  const gateIndex = proofSteps.findIndex(step => step.run === 'npm run test:graph-gate-contracts')
  assert.ok(restoreIndex >= 0 && pythonIndex > restoreIndex && installIndex > pythonIndex && gateIndex > installIndex,
    'Python and its pinned release-model dependencies must be ready before the receipt gate')
  assert.equal(proofSteps[pythonIndex].uses, 'actions/setup-python@v6')
  assert.equal(proofSteps[pythonIndex].with['python-version'], '3.10')
  assert.equal(proofSteps[installIndex].run,
    'python -m pip install -r ../scripts/curriculum_package_validation_requirements.txt')
  assert.equal(proofSteps[installIndex]['continue-on-error'], undefined)
  const scripts = JSON.parse(read('app/package.json')).scripts
  assert.ok(scripts['test:graph-gate-contracts'].includes('npm run test:historical-review-receipts'))
  assert.match(scripts['test:historical-review-receipts'], /^python3 -B /u)
})

test('every semantic-route consumer fetches and inherits the exact PR or previous-push policy base', () => {
  const trustedBase = "${{ github.event.pull_request.base.sha || github.event.before || 'origin/main' }}"
  const consumers = Object.entries(jobs).filter(([, job]) => job.steps.some(step =>
    /npm run (?:validate:graph|test:hard-learning-routes)(?:\s|$)/u.test(step.run ?? '')))
  assert.deepEqual(consumers.map(([name]) => name).sort(), ['curriculum-assessment-proofs', 'graph-validation', 'quick-checks'])
  for (const [name, job] of consumers) {
    assert.equal(job.env.SEMANTIC_ROUTE_POLICY_BASE, trustedBase, `${name} must use PR base or push-before, never its own main head`)
    const fetchIndex = job.steps.findIndex(step => step.name === 'Fetch trusted semantic-route policy base')
    const consumerIndex = job.steps.findIndex(step => /npm run (?:validate:graph|test:hard-learning-routes)(?:\s|$)/u.test(step.run ?? ''))
    assert.ok(fetchIndex >= 0 && fetchIndex < consumerIndex, `${name} must fetch before semantic-route evaluation`)
    const fetch = job.steps[fetchIndex]
    assert.match(fetch.run, /set -euo pipefail/u)
    assert.match(fetch.run, /git fetch --no-tags --depth=1 origin "\$\{SEMANTIC_ROUTE_POLICY_BASE\}"/u)
    assert.match(fetch.run, /\+refs\/heads\/main:refs\/remotes\/origin\/main/u)
    assert.match(fetch.run, /git rev-parse --verify "\$\{SEMANTIC_ROUTE_POLICY_BASE\}\^\{commit\}"/u)
    assert.equal(fetch['continue-on-error'], undefined)
    assert.equal(job.steps[consumerIndex].env, undefined, `${name}'s consumer must inherit the verified job environment`)
  }
})
