import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { normalizeCanonicalLandscape } from '../../../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

// Read-only proposal: no source or generated-input writes. The optional chain
// extension is kept separate because its target successor needs scope review.
const read = (path: string) => readFileSync(path, 'utf8')
const json = (path: string) => JSON.parse(read(path))
const bytes = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const sha = (value: Buffer | string) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const canonical = normalizeCanonicalLandscape(json(canonicalPath))
const math = normalizeCanonicalLandscape(json(mathPath))
const universe = { ...canonical, goals: [...canonical.goals, ...math.goals] }
const landscapes = new Map([[canonical.landscapeId, canonical], [math.landscapeId, math]])
const goals = new Map(canonical.goals.map(goal => [goal.id, goal]))
const manifestPath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
const manifest = json(manifestPath)
const base = 'curricula/DE/Gymnasium/composition-views/physik/'
const heIds = ['853dbe54-85b0-59ab-8f3a-000c2b7746ec', '658cf33d-a0c2-5d47-801a-3dbcd5cac074']
const chainId = '3b50255a-6b01-578b-8f5c-4383536a3221'
if (process.argv.includes('--include-decay-chain')) heIds.push(chainId)
const assignments = new Map<string, string[]>([
  [base + 'de-he-gk.view.json', heIds],
  [base + 'de-he-sekii-gk.view.json', heIds],
  [base + 'de-rp-gk.view.json', ['fbecbd60-5db3-51e8-94be-d66b066ffa06']],
  [base + 'de-rp-sekii-gk.view.json', ['fbecbd60-5db3-51e8-94be-d66b066ffa06']],
])
const targets = (view: unknown) => collectCompositionProjectionRoleGoalIds(normalizeCompositionView(view).rootNodes, goals).targetGoalIds
const sorted = (ids: Set<string>) => [...ids].sort()
const patches: string[] = []
const proof = manifest.sourcePaths.map((path: string) => {
  const beforeBytes = read(path), before = JSON.parse(beforeBytes), after = structuredClone(before)
  const expectedRemoved = assignments.get(path) ?? []
  if (expectedRemoved.length) {
    assert.equal(before.scope.courseProfile, 'GK')
    assert.equal(before.scope.jurisdiction, path.includes('/de-he-') ? 'DE-HE' : 'DE-RP')
    for (const goalId of expectedRemoved) after.rootNodes.push({ kind: 'goalEntry', goalId, projectionRole: 'prerequisiteOnly' })
  }
  const beforeTargets = targets(before), afterTargets = targets(after)
  const removed = sorted(new Set([...beforeTargets].filter(id => !afterTargets.has(id))))
  const added = sorted(new Set([...afterTargets].filter(id => !beforeTargets.has(id))))
  assert.deepEqual(removed, [...expectedRemoved].sort(), path + ': unexpected removed target')
  assert.deepEqual(added, [], path + ': unexpected added target')
  assert.deepEqual(compileCompositionView(normalizeCompositionView(before), canonical, universe, landscapes).findings, [], path + ': current compiler finding')
  assert.deepEqual(compileCompositionView(normalizeCompositionView(after), canonical, universe, landscapes).findings, [], path + ': proposed compiler finding')
  const afterBytes = expectedRemoved.length ? bytes(after) : beforeBytes
  if (expectedRemoved.length) {
    const left = beforeBytes.trimEnd().split('\n'), right = afterBytes.trimEnd().split('\n')
    let first = 0
    while (left[first] === right[first]) first++
    patches.push('*** Update File: ' + path + '\n@@\n' + left.slice(first - 4, first).map(line => ' ' + line).join('\n') + '\n' + left.slice(first).map(line => '-' + line).join('\n') + '\n' + right.slice(first).map(line => '+' + line).join('\n') + '\n*** End of File\n')
  }
  return {
    path, scope: before.scope,
    beforeSha256: sha(beforeBytes), proposedAfterSha256: sha(afterBytes),
    beforeTargetSetSha256: sha(bytes(sorted(beforeTargets))), proposedAfterTargetSetSha256: sha(bytes(sorted(afterTargets))),
    removedTargetGoalIds: removed, addedTargetGoalIds: added,
    targetSuccessorsOfChain: canonical.goals.filter(goal => goal.requires.includes(chainId) && afterTargets.has(goal.id)).map(goal => ({ goalId: goal.id, title: goal.title, chainRemainsTarget: afterTargets.has(chainId) })),
    findings: [],
  }
})
assert.equal(proof.length, 64)
assert.equal(proof.filter((row: any) => row.removedTargetGoalIds.length).length, 4)
const evidencePaths = [
  'curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf',
  'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_PHYSIK_SEKII_KC2024.source-extraction.json',
  'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  'curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf',
  'curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_PHYSIK_SEKII_MSS_SOURCE_EXTRACTION_DRAFT.source-extraction.json',
  'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
]
console.log(JSON.stringify({
  schemaVersion: 1, status: 'proposal_only_not_applied',
  variant: process.argv.includes('--include-decay-chain') ? 'four_goals_eight_overrides_chain_successor_unresolved' : 'three_goals_six_overrides',
  sourceBindings: [canonicalPath, mathPath, manifestPath, ...evidencePaths].map(path => ({ path, sha256: sha(readFileSync(path)) })),
  semantics: 'Direct prerequisiteOnly goalEntry overrides the inherited target role of the existing canonicalSubtree. Canonical IDs, source mappings, LK views, mastery and runtime code remain unchanged.',
  atlasPath: 'goalBookModel.ts compileGoalBookViewSource -> normalizeAtlasApplicability: the authored SekII views supply the course-profile scopes; CrossStage is used for remaining SekI membership and learner navigation. Both variants must be corrected, not only the CrossStage view.',
  views: proof,
  patch: '*** Begin Patch\n' + patches.join('') + '*** End Patch\n',
}, null, 2))
