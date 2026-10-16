// SPDX-License-Identifier: Apache-2.0
// AUTHOR technical context check. No content review or approval vote.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

async function main() {
  const repo = process.cwd()
  const host = path.join(repo, 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
  const base = path.join(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HE-transitive-course-prerequisites-targeted-author-successor-20261016-v1/author-affected-contexts')
  const load = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
  const sha = (p: string) => createHash('sha256').update(fs.readFileSync(p)).digest('hex')
  const dependencies = [
    'app/src/utils/srsTags.ts',
    'app/src/components/srs/FlashcardDrill.tsx',
    'app/src/utils/authoring/compositionViewAuthoring.ts',
    'app/scripts/positiveGoalEvidenceProfileModel.ts',
    'app/scripts/goalEvidenceProfileModel.ts',
    'app/scripts/semanticAtomicityReview.ts',
    'app/scripts/memoryCardReview.ts',
  ]
  const { getSrsFilterTags } = await import(pathToFileURL(path.join(host, dependencies[0])).href)
  const { collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(path.join(host, dependencies[2])).href)
  const { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile } = await import(pathToFileURL(path.join(host, dependencies[3])).href)
  const canonicalPath = path.join(host, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
  const canonical = load(canonicalPath)
  assert.equal(sha(canonicalPath), 'd17b3219212d5157a3731cc54b8424cc07816835781984bcbeb3a98f4064268f')
  const goalById = new Map(canonical.goals.map((g: { id: string }) => [g.id, g]))
  const inventory = load(path.join(base, 'CONTEXT.actual-two-goals.author-inventory.json'))
  const targets = Object.keys(inventory.goals)
  const memories = ['1f2021c0-c633-5240-ae97-e58ecc9d48ca', 'ddde45b7-a3de-585b-b41e-3ae841349c87', 'e3e8582a-976b-5f0f-b31b-3cf59a4fff24']
  const deckPath = path.join(host, inventory.runtimeDeckPath)
  const deck = load(deckPath)
  const drillSource = fs.readFileSync(path.join(host, dependencies[1]), 'utf8')
  const fragment = drillSource.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/)
  assert.ok(fragment)
  const actualPredicate = new Function('card', 'filterTags', 'return ' + fragment[1])
  const selections = memories.map(id => {
    const memory = goalById.get(id) as any
    const tags = getSrsFilterTags(memory.tags)
    const selectedDeck = id === memories[2] ? load(path.join(host, 'app/public/data/de_gymnasium_chemistry_flashcards_organic_q1.de.json')) : deck
    const cards = selectedDeck.cards.filter((card: unknown) => actualPredicate(card, tags))
    if (id === memories[0]) assert.equal(cards.length, 11)
    else if (id === memories[1]) assert.deepEqual(cards.map((c: any) => c.id), ['chem_eq_q3_008'])
    else assert.deepEqual(cards.map((c: any) => c.id), ['chem_org_q1_001','chem_org_q1_002','chem_org_q1_003','chem_org_q1_004','chem_org_q1_005','chem_org_q1_006','chem_org_q1_007','chem_org_q1_008','chem_org_q1_009','chem_org_q1_010'])
    return { memoryGoalId: id, actualFilterTags: tags, actualOrderedSelectedCardIds: cards.map((c: any) => c.id), selectedWholeCards: cards, actualDeckId: selectedDeck.deckId, actualDeckSha256: sha(path.join(host, id === memories[2] ? 'app/public/data/de_gymnasium_chemistry_flashcards_organic_q1.de.json' : inventory.runtimeDeckPath)) }
  })
  const visibilityScopes = inventory.memoryVisibilityScopes.map((scope: any) => {
    const viewPath = path.join(host, scope.viewPath)
    const view = load(viewPath)
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
    return {
      label: scope.label, viewId: view.viewId, viewPath: scope.viewPath, actualViewSha256: sha(viewPath),
      roleByRelevantGoalId: Object.fromEntries([...targets, ...memories].map(id => [id, roles.targetGoalIds.has(id) ? 'target' : roles.prerequisiteOnlyGoalIds.has(id) ? 'prerequisiteOnly' : 'absent'])),
    }
  })
  const predictedPBindings = targets.map(id => {
    const goal = goalById.get(id) as any
    const p = inventory.goals[id].P.record
    const digests = Object.fromEntries(goal.resourceLinks.filter((r: any) => r.type === 'goal-visualization').map((r: any) => [r.url, 'sha256:' + sha(path.join(host, 'app/public', r.url))]))
    const baselineGoalFingerprint = fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
    const baselineReviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, p.reviewCriteriaFingerprint, digests, 'curricularAtomic')
    const profileFingerprint = fingerprintPositiveGoalEvidenceProfile(p.profile)
    assert.equal(baselineGoalFingerprint, p.goalFingerprint)
    assert.equal(baselineReviewInputFingerprint, p.reviewInputFingerprint)
    assert.equal(profileFingerprint, p.profileFingerprint)
    const variants = id.startsWith('98') ? [
      { name: 'root-planned-remove-only-Q1.3-cluster', requires: goal.requires.filter((r: string) => r !== '55f35372-d7a3-5299-bf9e-9828d6720366') },
      { name: 'author-optional-also-remove-unneeded-digestive-juices', requires: ['70b34ae7-4481-590c-9a02-516464750832', '197bc2c5-835e-59e7-9263-5684e89799cc'] },
    ] : [{ name: 'root-planned-qualitative-foundation', requires: ['0e3f849b-133d-57da-882c-0d67c3eb05b8'] }]
    return { goalId: id, baselineGoalFingerprint, baselineReviewInputFingerprint, profileFingerprint, variants: variants.map(v => {
      const next = { ...goal, requires: v.requires }
      const nextInput = fingerprintPositiveGoalEvidenceReviewInput(next, p.reviewCriteriaFingerprint, digests, 'curricularAtomic')
      assert.notEqual(nextInput, baselineReviewInputFingerprint)
      assert.equal(fingerprintGoalForPositiveEvidence(next, 'curricularAtomic'), baselineGoalFingerprint)
      return { ...v, predictedReviewInputFingerprint: nextInput, goalSemanticFingerprintUnchanged: true, wholeProfileFingerprintUnchanged: true, newIndependentReviewOrApproval: false }
    }) }
  })
  const receipt = {
    role: 'AUTHOR stock-selector and binding check; no content KEEP or acceptance', status: 'draft', evidenceLevel: 'E0', maximumClaimScope: 'G0', requiredIndependentReviews: 2, completedIndependentReviews: 0,
    canonicalSha256: sha(canonicalPath), canonicalGoalCount: canonical.goals.length,
    actualCodePins: dependencies.map(rel => ({ actualPath: path.relative(repo, path.join(host, rel)), sha256: sha(path.join(host, rel)) })),
    executedCardPredicate: fragment[1], actualRuntimeDeckSha256: sha(deckPath), selections, actualViewRoles: visibilityScopes, predictedPBindings,
    noNormalOrHMutation: true, noReviewLedgerMutation: true, noHumanApproval: true, noHumanTrial: true,
  }
  const destination = path.join(base, 'CHECK.actual-stock-SRS-viewroles-and-P-bindings.author.json')
  fs.writeFileSync(destination + '.tmp', JSON.stringify(receipt, null, 2) + '\n')
  fs.renameSync(destination + '.tmp', destination)
  process.stdout.write(JSON.stringify({ receipt: path.relative(repo, destination), selections: selections.map(s => ({ id: s.memoryGoalId, cards: s.actualOrderedSelectedCardIds })), heRoles: visibilityScopes.filter((v: any) => v.viewPath.includes('/de-he')), predictedPBindings }, null, 2) + '\n')
}
main().catch(error => { process.stderr.write(String(error) + '\n'); process.exitCode = 1 })
