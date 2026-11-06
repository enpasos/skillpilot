// SPDX-License-Identifier: Apache-2.0
// The unchanged native context reader executes only against the private shallow repository.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createVisualizationContextVerifier } from '../../../../app/scripts/goalVisualizationReviewedContext.ts'
const [mini, acceptedCommit, acceptedCensus] = process.argv.slice(2)
assert.ok(mini && acceptedCommit && acceptedCensus, 'Explicit independent anchor and census digest required')
const censusPath = 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-first-two-families/family-census.json'
const censusRaw = readFileSync(resolve(mini, censusPath))
const hash = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
assert.equal(hash(censusRaw), acceptedCensus)
const census = JSON.parse(censusRaw.toString())
assert.equal(census.acceptedRepositoryCommit, acceptedCommit)
const git = (...args: string[]) => {
  const result = spawnSync('git', ['--no-replace-objects', '-C', mini, ...args], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}
assert.equal(git('rev-parse', '--is-shallow-repository'), 'true')
assert.equal(git('rev-parse', 'HEAD'), acceptedCommit)
assert.equal(git('remote'), '')
assert.equal(existsSync(resolve(mini, '.git/objects/info/alternates')), false)
const verify = createVisualizationContextVerifier({ repositoryRoot: mini, acceptedRepositoryCommit: acceptedCommit })
const results = []
for (const entry of census.candidateReceipts) {
  const raw = readFileSync(resolve(mini, entry.path))
  assert.equal(hash(raw), entry.sha256)
  const receipt = JSON.parse(raw.toString())
  const name = receipt.context.subject === 'mathematik' ? 'MATHEMATIK' : 'WIRTSCHAFT'
  const source = JSON.parse(readFileSync(resolve(mini, `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`), 'utf8'))
  const goal = source.goals.find((goal: any) => goal.id === receipt.context.goalId)
  assert.ok(goal)
  const primary = goal.resourceLinks.filter((link: any) => link.type === 'goal-visualization' && (!link.role || link.role === 'primary'))
  assert.equal(primary.length, 1)
  const url = primary[0].url
  const current = { landscapeId: source.landscapeId, goalId: goal.id, subject: receipt.context.subject,
    title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    demandLevel: goal.dimensionTags?.demandLevel, imageUrl: url, publicAssetPath: 'app/public' + url,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + url.slice('/assets/goal-visualizations/'.length),
    assetSha256: 'sha256:' + hash(readFileSync(resolve(mini, 'app/public' + url))) }
  const result = verify({ path: entry.path, sha256: entry.sha256 }, current)
  assert.equal(result.ok, true, JSON.stringify({ goalId: goal.id, result }))
  results.push({ goalId: goal.id, subject: receipt.context.subject, originalProfile: receipt.reviewProfile, ok: result.ok })
}
assert.equal(results.length, 18)
console.log(JSON.stringify({ status: 'PASS-unchanged-native-reader-in-real-private-shallow-repository',
  acceptedCommit, acceptedCensusSha256: acceptedCensus, nativeReaderSha256: hash(readFileSync(new URL('../../../../app/scripts/goalVisualizationReviewedContext.ts', import.meta.url))),
  shallow: true, alternates: false, remote: false, originals: results, actualNativePositiveCases: results.length,
  fullProducerExecuted: false, fullQaOrRuntimeApprovalClaimed: false, sourceWritesPerformed: false }, null, 2))
