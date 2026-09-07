import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { fingerprintSemanticKindSourceGoal } from '../../../../../app/scripts/goalBookModel'
import { positiveGoalEvidenceReviewInputPayload } from '../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const stems = {
  p19: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-040-taylor-tools-integrals-19-v1',
  p2: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-040-series-split-2-v1',
}
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const unique = (rows: any[], key: string, id: string) => {
  const matches = rows.filter(row => row[key] === id); assert.equal(matches.length, 1, key + ': ' + id); return matches[0]
}
async function main() {
  assert.ok(process.argv.includes('--stable-confirmed'), 'Run only after root explicitly confirms final canonical and image-import stability')
  const lane = process.argv.includes('--lane=p2') ? 'p2' : 'p19'
  const stem = stems[lane]
  const configPath = stem + '.config.json', candidatePath = stem + '.candidates.json'
  const config = JSON.parse(readFileSync(configPath, 'utf8')), candidates = JSON.parse(readFileSync(candidatePath, 'utf8'))
  const authorContext = JSON.parse(readFileSync(stem + '.authoring-context.json', 'utf8'))
  const authorCheck = JSON.parse(readFileSync(stem + '.author-check-report.json', 'utf8'))
  assert.equal(authorCheck.candidateSha256, sha(readFileSync(candidatePath)), 'Author checks must bind the actual current bodies')
  assert.equal(candidates.goals.length, lane === 'p19' ? 19 : 2)
  assert.deepEqual(config.scope.goalIds, candidates.goals.map((goal: any) => goal.goalId))
  assert.deepEqual(config.reviewedResourceTypes, [])
  assert.equal(config.requireApproved, false)
  const landscape = JSON.parse(readFileSync(config.landscapePath, 'utf8')), kinds = JSON.parse(readFileSync(config.semanticKindLedgerPath, 'utf8'))
  const paths = [configPath, candidatePath, stem + '.authoring-context.json', stem + '.author-check-report.json', config.reviewCriteriaPath, config.landscapePath, config.semanticKindLedgerPath, stems.p19 + '.bind-current.ts']
  const sourceArtifacts = paths.map(path => ({ path, sha256: sha(readFileSync(path)) }))
  const criteriaFingerprint = sha(readFileSync(config.reviewCriteriaPath))
  const contexts: any[] = []
  const replacementIds = ['630bb145-9a3f-5c88-ab5a-fb69a9bb76e4', '74b5a01b-c086-51d0-bc66-046029c92ef7']
  for (const candidate of candidates.goals) {
    const goal = unique(landscape.goals, 'id', candidate.goalId), kind = unique(kinds.decisions, 'goalId', goal.id)
    assert.equal(kind.semanticKind, 'curricularAtomic'); assert.equal(kind.decisionStatus, 'authoritative')
    assert.equal(kind.sourceFingerprint, fingerprintSemanticKindSourceGoal(goal))
    assert.deepEqual(goal.contains, [])
    let textChanges: any[] = [], requiresBefore: any[]
    if (lane === 'p19') {
      const original = unique(authorContext.originalBoundGoalContexts, 'goalId', goal.id)
      for (const [field, originalField] of [['title', 'titleDe'], ['titleEn', 'titleEn'], ['description', 'descriptionDe'], ['descriptionEn', 'descriptionEn']]) {
        if (goal[field] !== original[originalField]) textChanges.push({ field, before: original[originalField], after: goal[field] })
      }
      if (textChanges.length) assert.ok(['3862890e-9ea9-4c62-bcf2-e354c9d8f306', '9441bb35-2a2f-4edc-9d8a-bc58c257054d'].includes(goal.id), 'Unreviewed text drift: ' + goal.id)
      if (goal.id.startsWith('3862890e')) {
        assert.equal(goal.description, 'Die lernende Person kann das bestimmte Integral als gemeinsamen Grenzwert von Ober- und Untersummen deuten und bei einer Änderungsrate als Bestandsänderung beschreiben, aus der zusammen mit dem Anfangsbestand der Endbestand entsteht.')
        assert.equal(goal.descriptionEn, 'The learner can interpret the definite integral as the common limit of upper and lower sums and, for a rate of change, describe it as the change in a quantity, which combines with the initial value to give the final value.')
      }
      if (goal.id.startsWith('9441bb35')) {
        assert.equal(goal.description, 'Die lernende Person kann zu einer gegebenen Startstelle aus dem Graphen einer Randfunktion den Verlauf der zugehörigen orientierten Flächeninhaltsfunktion qualitativ skizzieren und dabei positive und negative Flächenbeiträge berücksichtigen.')
        assert.equal(goal.descriptionEn, 'Given a starting point, the learner can qualitatively sketch the associated signed-area function from the graph of a boundary function, taking positive and negative area contributions into account.')
      }
      requiresBefore = original.canonicalContext.requires
      assert.deepEqual(goal.requires, requiresBefore.flatMap((id: string) => id === '12a8dffc-dea7-5f2c-b490-2a1a2bb6901b' ? replacementIds : [id]), 'Unexpected direct-relation drift: ' + goal.id)
      assert.deepEqual(goal.applicability ?? null, original.canonicalContext.applicability)
      assert.deepEqual(goal.dimensionTags, original.canonicalContext.dimensionTags)
    } else {
      const original = unique(authorContext.source.goals, 'id', goal.id)
      const omitResources = (g: any) => { const copy = structuredClone(g); delete copy.resourceLinks; return copy }
      assert.deepEqual(omitResources(goal), omitResources(original), 'Unreviewed split-goal drift')
      requiresBefore = original.requires
    }
    const visualizations = (goal.resourceLinks ?? []).filter((link: any) => link.type === 'goal-visualization').map((link: any) => {
      assert.ok(link.url.startsWith('/assets/goal-visualizations/'))
      const path = 'app/public' + link.url
      return { path, url: link.url, sha256: sha(readFileSync(path)), note: 'Inventory only; reviewedResourceTypes=[] and this P lane makes no image-QA approval claim.' }
    })
    contexts.push({
      goalId: goal.id, currentGoal: goal, effectiveSemanticKind: kind.semanticKind, semanticKindSourceFingerprint: kind.sourceFingerprint,
      textChangesSinceOriginalAuthoringInput: textChanges, requiresBefore, requiresAfter: goal.requires,
      prerequisites: goal.requires.map((id: string) => { const required = unique(landscape.goals, 'id', id); return { id, title: required.title, titleEn: required.titleEn, description: required.description, descriptionEn: required.descriptionEn, type: required.type, sourceRef: required.sourceRef ?? null } }),
      sourceReference: goal.sourceRef ?? null, activeVisualizationInventory: visualizations,
      nativeReviewInputPayload: positiveGoalEvidenceReviewInputPayload(goal, criteriaFingerprint, {}, kind.semanticKind),
      caseCoverage: candidate.profile.applicationCaseBriefs.map((c: any, index: number) => ({ caseId: c.id, expectationIds: goal.id.startsWith('5042fd2b') ? [candidate.profile.expectations[index].id] : candidate.profile.expectations.map((e: any) => e.id) })),
    })
  }
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
  assert.equal(records.length, candidates.goals.length)
  for (const record of records) {
    assert.equal(record.status, 'needs_human_review'); assert.equal(record.reviewAuthority, 'ai_candidate')
    assert.equal(record.evidenceLevel, 'E1'); assert.equal(record.maximumClaimScope, 'G1'); assert.deepEqual(record.reviewRunIds, [])
    assert.deepEqual(record.profile, unique(candidates.goals, 'goalId', record.goalId).profile)
  }
  const reviewBytes = records.map(record => JSON.stringify(record)).join('\n') + '\n'
  const receipt = {
    schemaVersion: 1, artifactType: lane === 'p19' ? 'math-b040-p19-final-context-v1' : 'math-b040-p2-final-context-v1', materializedAt: new Date().toISOString(),
    author: { provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', authority: 'ai_candidate', humanApprovalClaimed: false },
    stableDirection: 'Root explicitly confirmed final canonical and image-import stability before execution of this read-only native patch emitter.',
    sourceArtifacts, contexts,
    bindings: records.map(record => ({ goalId: record.goalId, goalFingerprint: record.goalFingerprint, reviewInputFingerprint: record.reviewInputFingerprint, profileFingerprint: record.profileFingerprint, reviewCriteriaFingerprint: record.reviewCriteriaFingerprint })),
    output: { path: config.reviewPath, sha256: sha(reviewBytes) },
    toolchain: { node: process.versions.node, nativeBuilder: 'app/scripts/materializePositiveGoalEvidenceCandidates.ts#buildPositiveGoalEvidenceCandidateRecords' },
    boundaries: ['Exactly the already-authored bodies are bound to current inputs; no new or changed body is generated during binding.', 'All records stay needs_human_review/ai_candidate/E1/G1 with empty reviewRunIds.', 'New independent tasks require learner reasoning without copying teaching graphics. Visualization QA remains separate and no new visual approval is asserted.', 'No canonical, registry, claims, D record, source, deck/card, book, generated aggregate QA or runtime file is changed.'],
  }
  let patch = '*** Begin Patch\n'
  for (const [path, bytes] of [[config.reviewPath, reviewBytes], [stem + '.context-receipt.json', JSON.stringify(receipt, null, 2) + '\n']]) {
    assert.equal(existsSync(path), false, 'Refuse overwrite: ' + path)
    patch += '*** Add File: ' + path + '\n' + bytes.trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n'
  }
  patch += '*** End Patch\n'
  for (const artifact of sourceArtifacts) assert.equal(sha(readFileSync(artifact.path)), artifact.sha256, 'Concurrent source drift: ' + artifact.path)
  for (const context of contexts) for (const visual of context.activeVisualizationInventory) assert.equal(sha(readFileSync(visual.path)), visual.sha256, 'Concurrent image drift')
  process.stdout.write(JSON.stringify({ patch, summary: { lane, profiles: records.length, reviewSha256: sha(reviewBytes), contextReceiptSha256: sha(JSON.stringify(receipt, null, 2) + '\n') } }))
}
void main()
