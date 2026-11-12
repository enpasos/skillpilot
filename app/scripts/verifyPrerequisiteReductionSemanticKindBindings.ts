// SPDX-License-Identifier: Apache-2.0
// Repository-side bridge for the existing semantic-kind comparison family only.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import {
  fingerprintPrerequisiteReductionDocument,
  loadVerifiedPrerequisiteReductionContext,
  PREREQUISITE_REDUCTION_REGISTRY_PATH,
  reviewBindingGoal,
  verifiedPrerequisiteReductionCatalogSources,
  verifiedPrerequisiteReductionSummary,
} from './prerequisiteReductionProof'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Prerequisite reduction semantic-kind binding: ${message}`)
}

export async function verifyPrerequisiteReductionSemanticKindBindings(
  sourcePath: string,
  repositoryRoot = REPOSITORY_ROOT,
) {
  const sourceFile = resolve(repositoryRoot, sourcePath)
  ensure(relative(repositoryRoot, sourceFile).split(sep).join('/') === sourcePath,
    'canonical source must use its exact repository-relative path')
  const context = await loadVerifiedPrerequisiteReductionContext({ repositoryRoot })
  ensure(context, 'no declared prerequisite reduction registry')
  const proof = verifiedPrerequisiteReductionSummary(context)
  ensure(proof, 'missing verified proof summary')
  const registryFile = resolve(repositoryRoot, PREREQUISITE_REDUCTION_REGISTRY_PATH)
  const registryBytes = readFileSync(registryFile)
  ensure(digest(registryBytes) === proof.registryDigest, 'registry changed after verification')
  // The document the capability loader read. Contracts V1 to V8 also bind it in the registry;
  // the goal-scoped V9 registry binds single goals, so the loaded catalog is the reference.
  const binding = verifiedPrerequisiteReductionCatalogSources(context)?.find(({ path }) => path === sourcePath)
  ensure(binding, 'canonical source is not in the verified catalog')
  const sourceBytes = readFileSync(sourceFile)
  const document = JSON.parse(sourceBytes.toString('utf8')) as {
    landscapeId: string; goals: Array<Record<string, unknown> & { id: string }>
  }
  ensure(binding.landscapeId === document.landscapeId
    && binding.currentDocumentDigest === fingerprintPrerequisiteReductionDocument(document),
  'full canonical source differs from the verified catalog')
  const goals = document.goals.map((goal) => ({
    goalId: goal.id,
    currentFingerprint: fingerprintSemanticKindSourceGoal(goal),
    baselineFingerprint: fingerprintSemanticKindSourceGoal(reviewBindingGoal(
      context, `${document.landscapeId}:${goal.id}`, goal,
    )),
  }))
  ensure(sourceBytes.equals(readFileSync(sourceFile)), 'canonical source changed during verification')
  ensure(registryBytes.equals(readFileSync(registryFile)), 'registry changed during verification')
  return {
    schemaVersion: 1,
    comparisonFamily: 'semantic-kind-source-fingerprint-v1',
    source: { path: sourcePath, landscapeId: document.landscapeId, sha256: digest(sourceBytes) },
    proof,
    goals,
  }
}

async function main() {
  const args = process.argv.slice(2)
  let sourcePath: string | undefined, repositoryRoot = REPOSITORY_ROOT
  for (let index = 0; index < args.length; index += 2) {
    const value = args[index + 1]
    ensure(value && !value.startsWith('--'), `missing value for ${args[index]}`)
    if (args[index] === '--canonical-source' && sourcePath === undefined) sourcePath = value
    else if (args[index] === '--repository-root') repositoryRoot = resolve(value)
    else throw new Error(`Unknown or duplicate argument: ${args[index]}`)
  }
  ensure(sourcePath, '--canonical-source is required')
  process.stdout.write(`${JSON.stringify(await verifyPrerequisiteReductionSemanticKindBindings(sourcePath, repositoryRoot))}\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${String(error)}\n`)
    process.exitCode = 1
  })
}
