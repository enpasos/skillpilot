// SPDX-License-Identifier: Apache-2.0
// Freezes the prerequisite-reduction proof: registry contract V9
// (`frozen-goal-scoped-prerequisite-reduction-v9`).
//
// Contracts V1 to V8 bind complete catalog documents, so their chain can only be replayed
// while the catalog still is the end state of the proof. Freezing verifies that chain one
// last time and records, for every goal whose reviews saw another value than today's goal,
// the reviewed value and the digest of today's goal. From then on review reuse is decided
// goal by goal and no process replays the history.
//
// Usage (from app/):
//   tsx scripts/freezePrerequisiteReductionProof.ts --freeze <parent registry path>
//       First freeze: the active registry must be the complete V8 proof. Its bytes move to
//       <parent registry path> (repository-relative) and the derived V9 registry becomes the
//       active one. With an active V9 registry of that parent the derivation is repeated.
//   tsx scripts/freezePrerequisiteReductionProof.ts --check
//       The active V9 registry equals the derivation from its frozen parent. Only possible
//       while the catalog still is the frozen state; it is the attestation of the freeze.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BASIS_BOUND_PREREQUISITE_REDUCTION_CONTRACT,
  GOAL_SCOPED_PREREQUISITE_REDUCTION_CONTRACT,
  PREREQUISITE_REDUCTION_REGISTRY_PATH,
  deriveGoalScopedPrerequisiteReductionRegistry,
} from './prerequisiteReductionProof'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const activeFile = resolve(root, PREREQUISITE_REDUCTION_REGISTRY_PATH)
const serialize = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
function fail(message: string): never {
  throw new Error(`Prerequisite reduction freeze: ${message}`)
}

async function derive(parentRegistryPath: string) {
  const started = Date.now()
  const { registry, provenSources, provenSourcesWithoutTransfer } =
    await deriveGoalScopedPrerequisiteReductionRegistry({ repositoryRoot: root, parentRegistryPath })
  const perLandscape = new Map<string, number>()
  for (const { source } of registry.transfers) {
    const landscapeId = source.split(':')[0]
    perLandscape.set(landscapeId, (perLandscape.get(landscapeId) ?? 0) + 1)
  }
  console.log(`Complete proof ${parentRegistryPath} verified in ${Math.round((Date.now() - started) / 1000)} s: `
    + `${registry.frozenCatalogSources.length} documents, ${provenSources} sources of proof operations, `
    + `${registry.transfers.length} goal-scoped transfers.`)
  for (const { path, landscapeId } of registry.frozenCatalogSources)
    console.log(`  ${String(perLandscape.get(landscapeId) ?? 0).padStart(5)}  ${path}`)
  // Operations can cancel out, for example a materialized edge that a later cut removes again.
  if (provenSourcesWithoutTransfer.length > 0)
    console.log(`${provenSourcesWithoutTransfer.length} sources of proof operations have a reviewed value equal to the frozen goal and need no transfer.`)
  return serialize(registry)
}

async function main() {
  const args = process.argv.slice(2)
  const active = readFileSync(activeFile)
  const contract = (JSON.parse(active.toString('utf8')) as { proofContract?: unknown; parentRegistryPath?: unknown })
  if (args.length === 1 && args[0] === '--check') {
    if (contract.proofContract !== GOAL_SCOPED_PREREQUISITE_REDUCTION_CONTRACT || typeof contract.parentRegistryPath !== 'string')
      fail(`${PREREQUISITE_REDUCTION_REGISTRY_PATH} is not a frozen V9 registry`)
    if (await derive(contract.parentRegistryPath) !== active.toString('utf8'))
      fail(`${PREREQUISITE_REDUCTION_REGISTRY_PATH} differs from the derivation of its frozen parent`)
    console.log(`${PREREQUISITE_REDUCTION_REGISTRY_PATH} equals the derivation of its frozen parent.`)
    return
  }
  if (args.length !== 2 || args[0] !== '--freeze') fail('usage: --freeze <parent registry path> | --check')
  const parentRegistryPath = args[1]
  const parentFile = resolve(root, parentRegistryPath)
  if (contract.proofContract === BASIS_BOUND_PREREQUISITE_REDUCTION_CONTRACT) {
    if (existsSync(parentFile) && !readFileSync(parentFile).equals(active))
      fail(`${parentRegistryPath} exists with other content`)
    writeFileSync(parentFile, active)
  } else if (contract.proofContract !== GOAL_SCOPED_PREREQUISITE_REDUCTION_CONTRACT || contract.parentRegistryPath !== parentRegistryPath) {
    fail(`the active registry is neither the complete V8 proof nor a V9 registry of ${parentRegistryPath}`)
  }
  // The active registry is replaced only after the complete proof has verified.
  writeFileSync(activeFile, await derive(parentRegistryPath))
  console.log(`Wrote ${PREREQUISITE_REDUCTION_REGISTRY_PATH}; frozen parent: ${parentRegistryPath}.`)
}

await main()
