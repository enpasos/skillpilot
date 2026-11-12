// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { loadOptionalHistoricalReviewContext } from './optionalHistoricalReviewContext'
import {
  fingerprintPrerequisiteReductionDocument as digest,
  PREREQUISITE_REDUCTION_CONTRACT,
  reviewBindingGoal,
} from './prerequisiteReductionProof'
import { generateDeepUnderstandingRollout } from './reportDeepUnderstandingRollout'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const scratch = resolve(repositoryRoot, 'tmp')
mkdirSync(scratch, { recursive: true })

test('historical reuse needs a real verified proof and missing or invalid proofs grant no comparison privilege', async () => {
  const directory = mkdtempSync(resolve(scratch, 'optional-review-context-'))
  try {
    const options = { repositoryRoot: directory, catalogPath: 'canonical', registryPath: 'proof.json' }
    const absent = await loadOptionalHistoricalReviewContext(options)
    assert.equal(absent.context, undefined)
    assert.match(absent.diagnostic!, /no declared proof; QA checks current goals only/u)
    writeFileSync(resolve(directory, 'proof.json'), '{invalid json')
    const malformed = await loadOptionalHistoricalReviewContext(options)
    assert.equal(malformed.context, undefined)
    assert.match(malformed.diagnostic!, /Historical review reuse is unavailable/u)

    mkdirSync(resolve(directory, 'canonical'))
    const atom = (id: string, requires: string[] = []) => ({ id, type: 'atomic', contains: [], requires })
    const before = { landscapeId: 'L', goals: [atom('q', ['p', 'r']), atom('p', ['r']), atom('r')] }
    const current = structuredClone(before)
    current.goals[0].requires = ['p']
    const registry = {
      schemaVersion: 1, proofContract: PREREQUISITE_REDUCTION_CONTRACT, auditScope: 'origin-source-landscape-closure',
      catalogSources: [{ path: 'canonical/L.json', landscapeId: 'L', baselineDocumentDigest: digest(before), currentDocumentDigest: digest(current) }],
      originalRequires: [{ source: 'L:q', requires: before.goals[0].requires }],
      removals: [{ source: 'L:q', prerequisite: 'L:r', witness: ['L:q', 'L:p', 'L:r'] }],
    }
    const canonicalPath = resolve(directory, 'canonical/L.json')
    const proofBytes = JSON.stringify(registry)
    writeFileSync(canonicalPath, JSON.stringify(current))
    writeFileSync(resolve(directory, 'proof.json'), proofBytes)
    const verified = await loadOptionalHistoricalReviewContext(options)
    assert.ok(verified.context)
    assert.equal(verified.diagnostic, undefined)
    assert.deepEqual(reviewBindingGoal(verified.context, 'L:q', current.goals[0]), before.goals[0])

    // A valid current graph may be a deliberate new state, not a migration of
    // the old one. It must not inherit the old review by discarding the failure.
    current.goals[0].requires = []
    const changedBytes = JSON.stringify(current)
    writeFileSync(canonicalPath, changedBytes)
    const changed = await loadOptionalHistoricalReviewContext(options)
    assert.equal(changed.context, undefined)
    assert.match(changed.diagnostic!, /QA checks current goals only/u)
    assert.equal(changed.diagnostic, malformed.diagnostic, 'status diagnostics do not depend on parser or filesystem error text')
    assert.ok(changed.detail)
    assert.notEqual(changed.detail, malformed.detail, 'specific verification evidence remains available in the log')
    assert.deepEqual(reviewBindingGoal(changed.context, 'L:q', current.goals[0]), current.goals[0])
    assert.notDeepEqual(reviewBindingGoal(changed.context, 'L:q', current.goals[0]), before.goals[0])
    assert.equal(readFileSync(canonicalPath, 'utf8'), changedBytes)
    assert.equal(readFileSync(resolve(directory, 'proof.json'), 'utf8'), proofBytes)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('current-only rollout reports stale historical goals and assessment bases as failed QA, never M7', async () => {
  const directory = mkdtempSync(resolve(scratch, 'current-only-review-'))
  try {
    const repoPath = (name: string) => relative(repositoryRoot, resolve(directory, name)).split('\\').join('/')
    const write = (name: string, value: unknown) => writeFileSync(resolve(directory, name), JSON.stringify(value))
    const original = { id: 'q', title: 'Current goal', type: 'atomic', contains: [], requires: ['r'],
      dimensionTags: { framework: 'fixture', demandLevel: 'AB1', phase: 'E' }, weight: 1 }
    const staleGoal = { ...original, requires: [] }
    const basisGoal = { ...original, extendedData: {
      applicabilityFromRequires: true,
      assessmentApplicabilityBasis: { kind: 'allOfGoalApplicability', goalRefs: ['r'] },
    } }
    const config = {
      $schema: 'https://skillpilot.com/schemas/deep-understanding-rollout/v1/deep-understanding-rollout-config.schema.json',
      schemaVersion: 1, reportId: 'current-only-review-fixture',
      subjects: [{
        subject: 'current-only-fixture', label: 'Current only fixture', landscapePath: repoPath('canonical.json'),
        semanticKindLedgerPath: repoPath('semantic.json'), semanticAtomicityConfigPath: repoPath('absent-atomicity.json'),
        memoryReviewConfigPath: repoPath('absent-memory.json'), visualizationQaPath: repoPath('absent-visualization.json'),
        resolutionIndexPaths: [], positiveEvidenceConfigPaths: [],
      }],
    }
    write('config.json', config)
    write('semantic.json', {
      sourceLandscapeId: 'L', sourceLandscapePath: repoPath('canonical.json'),
      sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1',
      decisions: [{ goalId: 'q', semanticKind: 'curricularAtomic', decisionStatus: 'authoritative',
        sourceFingerprint: fingerprintSemanticKindSourceGoal(original) }],
      counts: { total: 1, curricularAtomic: 1, curricularArea: 0, practiceAssessment: 0,
        programStructure: 0, memory: 0, runtimeSupport: 0, orientation: 0 },
    })
    const { context } = await loadOptionalHistoricalReviewContext({ repositoryRoot: directory, registryPath: 'absent-proof.json' })
    for (const goal of [staleGoal, basisGoal]) {
      write('canonical.json', { landscapeId: 'L', goals: [goal] })
      const report = await generateDeepUnderstandingRollout(repoPath('config.json'), context)
      assert.equal(Object.hasOwn(report, 'prerequisiteReductionProof'), false)
      assert.equal(report.subjects.length, 1)
      const subject = report.subjects[0]
      assert.equal(subject.denominator, null)
      assert.equal(subject.strictComplete, 0)
      assert.equal(subject.strictCompletionReady, false)
      assert.ok(subject.issues.some(issue => issue.includes('stale semantic-kind decision for q')))
      assert.ok(report.blockingIssueCount > 0)
    }
    assert.throws(() => buildGoalDescriptionCanonicalContext(reviewBindingGoal(context, 'L:q', basisGoal)),
      /requires a verified V8 baseline/u, 'Unavailable reuse never grants the V8 description exception.')
    write('invalid-config.json', { ...config, subjects: [] })
    await assert.rejects(generateDeepUnderstandingRollout(repoPath('invalid-config.json'), context),
      /Invalid deep-understanding rollout config/u, 'Optional proof reuse must not catch invalid QA configuration.')
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
