// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs } from './goalBookModel'
import { loadGoalDescriptionRolloutBase } from './materializeGoalDescriptionRolloutBatch'
import {
  fingerprintPrerequisiteReductionDocument,
  PREREQUISITE_REDUCTION_CONTRACT,
  PREREQUISITE_REDUCTION_REGISTRY_PATH,
} from './prerequisiteReductionProof'

// Exercise the actual native batch base loader: an unchanged reviewed goal
// needs the verified reduction context, while runtime edges stay current.
const temporaryParent = fileURLToPath(new URL('../node_modules/.tmp/', import.meta.url))
await mkdir(temporaryParent, { recursive: true })
const repositoryRoot = await mkdtemp(join(temporaryParent, 'rollout-proof-context-'))
const landscapePath = 'curricula/DE/Gymnasium/canonical/proof-test.json'
const goal = (id: string, requires: string[] = []) => ({
  id, title: `Goal ${id}`, description: `Explain and apply ${id}.`,
  type: 'atomic', weight: 1, contains: [], requires,
  dimensionTags: { framework: 'fixture', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'fixture' },
})
const before = {
  landscapeId: 'proof-test', title: 'Verified rollout fixture', locale: 'de-DE',
  goals: [goal('q', ['p', 'r']), goal('p', ['r']), goal('r')],
}
const current = structuredClone(before)
current.goals[0].requires = ['p']
const registry = {
  schemaVersion: 1,
  proofContract: PREREQUISITE_REDUCTION_CONTRACT,
  auditScope: 'origin-source-landscape-closure',
  catalogSources: [{ path: landscapePath, landscapeId: before.landscapeId,
    baselineDocumentDigest: fingerprintPrerequisiteReductionDocument(before),
    currentDocumentDigest: fingerprintPrerequisiteReductionDocument(current) }],
  originalRequires: [{ source: 'proof-test:q', requires: ['p', 'r'] }],
  removals: [{ source: 'proof-test:q', prerequisite: 'proof-test:r', witness: ['proof-test:q', 'proof-test:p', 'proof-test:r'] }],
}
const save = async (path: string, value: unknown) => {
  const target = join(repositoryRoot, path)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`)
}

try {
  await save(landscapePath, current)
  await save('view.json', {
    viewId: 'proof-test-view', landscapeId: before.landscapeId,
    scope: { schoolForm: 'Fixture', stage: 'Fixture' },
    rootNodes: [{ kind: 'structure', id: 'subject', label: 'Subject',
      children: ['r', 'p', 'q'].map(goalId => ({ kind: 'canonicalSubtree', goalId })) }],
  })
  await save('semantic-kinds.json', {
    $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/curriculum-ontology-profile.schema.json',
    documentType: 'semantic-kind-ledger', ledgerFormatVersion: 1,
    ledgerId: 'fixture-semantic-kinds', profileId: 'fixture-semantic-kinds', profileVersion: '1.0.0',
    sourceLandscapeId: before.landscapeId, sourceLandscapePath: landscapePath,
    sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1',
    reviewMethod: 'one-time-reviewed-pilot-migration-v1',
    counts: { curricularAtomic: 3, curricularArea: 0, practiceAssessment: 0, programStructure: 0,
      memory: 0, runtimeSupport: 0, orientation: 0, total: 3 },
    decisions: before.goals.map(source => ({ goalId: source.id,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(source), semanticKind: 'curricularAtomic',
      decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-curricular-atomic' })),
  })
  await save('qa.json', { records: [] })
  await save('book.config.json', {
    schemaVersion: 1, bookId: 'proof-test-book', title: 'Proof test book', landscapePath,
    compositionViewPath: 'view.json', semanticKindLedgerPath: 'semantic-kinds.json',
    goalVisualizationQaPath: 'qa.json', publicationMode: 'review', evidenceReviewPaths: [],
    outputPath: 'output/book-model.json',
  })
  await assert.rejects(() => loadGoalDescriptionRolloutBase('book.config.json', repositoryRoot),
    /stale semantic-kind decision for goal q/u, 'Without a proof, strict current checks remain in force.')
  await save(PREREQUISITE_REDUCTION_REGISTRY_PATH, registry)
  await assert.rejects(() => loadGoalBookBuildInputs('book.config.json', repositoryRoot),
    /stale semantic-kind decision for goal q/u, 'The omitted-context regression must actually be reproduced.')
  const { model } = await loadGoalDescriptionRolloutBase('book.config.json', repositoryRoot)
  assert.deepEqual(model.pages.map(page => page.goalId), ['r', 'p', 'q'])
  assert.deepEqual(model.pages.find(page => page.goalId === 'q')!.requires.map(ref => ref.goalId), ['p'],
    'Historical review reuse must never restore the removed runtime prerequisite.')
  registry.removals[0].witness = ['proof-test:q', 'proof-test:r']
  await save(PREREQUISITE_REDUCTION_REGISTRY_PATH, registry)
  await assert.rejects(() => loadGoalDescriptionRolloutBase('book.config.json', repositoryRoot),
    /Prerequisite reduction proof:/u, 'A malformed declared proof must fail rather than fall back.')
  console.log('Native rollout verified proof context passed: strict missing proof, bound reuse, current runtime edges, rejected tampering.')
} finally {
  await rm(repositoryRoot, { recursive: true, force: true })
}
