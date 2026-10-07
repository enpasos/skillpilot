// SPDX-License-Identifier: Apache-2.0
// Technical relocation only. Actual science, campaigns, records, pages and
// judgments remain byte-exact; standard native tools generate the resolutions.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintGoalDescriptionRolloutSynthesisDecisionManifest } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'

const root = '/home/enpasos/projects/skillpilot'
const own = dirname(fileURLToPath(import.meta.url))
const prior = resolve(own, '../biologie-neuro21-final-native-paired-d-synthesis-technical-preparation-20261007-v1')
const sha = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const binding = (path: string) => ({path: relative(root, path), sha256: sha(readFileSync(path)), bytes: readFileSync(path).length})
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (path: string, value: unknown) => {
  mkdirSync(dirname(path), {recursive: true})
  writeFileSync(path, Buffer.isBuffer(value) ? value : `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'})
}
const copies: unknown[] = []
for (const scope of ['twenty', 'one']) {
  const from = resolve(prior, `native-d-${scope}`)
  const target = resolve(own, `native-current-d-${scope}`)
  const oldConfigPath = resolve(prior, `native-d-${scope}.batch.config.json`)
  const configPath = resolve(own, `native-current-d-${scope}.batch.config.json`)
  const config = load(oldConfigPath)
  config.outputDirectory = relative(root, target)
  write(configPath, config)
  for (const entry of readdirSync(from, {recursive: true, withFileTypes: true})) {
    if (!entry.isFile()) continue
    const path = resolve(entry.parentPath, entry.name)
    const name = relative(from, path)
    if (name.startsWith('resolutions/') || ['resolution-index.json', 'batch-manifest.json', 'synthesis-decisions.json'].includes(name)) continue
    const destination = resolve(target, name)
    write(destination, readFileSync(path))
    assert.equal(sha(readFileSync(path)), sha(readFileSync(destination)))
    copies.push({source: binding(path), destination: binding(destination), exact: true})
  }
  const batch = load(resolve(from, 'batch-manifest.json'))
  batch.configPath = relative(root, configPath)
  batch.configDigest = sha(readFileSync(configPath))
  write(resolve(target, 'batch-manifest.json'), batch)
  const synthesis = load(resolve(from, 'synthesis-decisions.json'))
  synthesis.batch.configDigest = batch.configDigest
  synthesis.batch.batchManifestDigest = sha(readFileSync(resolve(target, 'batch-manifest.json')))
  const {manifestFingerprint: _previous, ...payload} = synthesis
  synthesis.manifestFingerprint = fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload)
  write(resolve(target, 'synthesis-decisions.json'), synthesis)
  assert.deepEqual(synthesis.decisions, load(resolve(from, 'synthesis-decisions.json')).decisions)
}
write(resolve(own, 'native-current-routing.exact-review-pages-and-decisions.receipt.json'), {
  role: 'Technical routing for unchanged independently reviewed science',
  cause: 'Earlier lower-native preparation used a valid alternative resolutionId; upper native materializer requires its own exact standard serialization.',
  originalSealedArtifactsPreserved: true,
  newScientificReviews: 0,
  changedReviewDecisions: 0,
  copiedReviewAndPageBindings: copies,
  humanApproval: false, humanTrial: false,
})
console.log(JSON.stringify({exactCopiedArtifacts: copies.length, newScientificReviews: 0}))
