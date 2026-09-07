import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { normalizeCanonicalLandscape } from '../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../app/src/utils/authoring/compositionViewAuthoring'

// Pure patch emitter; --check verifies the composed v3 + two-view v4 result.
const stage = 'curricula/DE/Gymnasium/quality/goal-visualization-review/physics-c648-slit-split-v1/'
const previousPath = stage + 'existing-minima-scope-v3.adoption-receipt.json'
const receiptPath = stage + 'single-slit-he-scope-v4.adoption-receipt.json'
const extractionPath = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_PHYSIK_SEKII_KC2024.source-extraction.json'
const sourceGoalId = 'he-phys-sekii-q3-1-b13-a01-03a9ca89'
const singleId = 'f6a3a602-1e45-5018-b0ff-3d49933cf634'
const minimumId = 'c64820e1-c0ee-4342-9225-f981650f0c52'
const paths = ['de-he-gk', 'de-he-sekii-gk'].map(name => 'curricula/DE/Gymnasium/composition-views/physik/' + name + '.view.json')
const read = (path: string) => readFileSync(path, 'utf8')
const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n'
const sha = (v: string | Buffer) => 'sha256:' + createHash('sha256').update(v).digest('hex')
const previous = JSON.parse(read(previousPath))
const canonical = normalizeCanonicalLandscape(JSON.parse(read(previous.inputBinding.canonicalPath)))
const math = normalizeCanonicalLandscape(JSON.parse(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')))
const universe = { ...canonical, goals: [...canonical.goals, ...math.goals] }
const goals = new Map(canonical.goals.map(g => [g.id, g]))
const targets = (v: unknown) => collectCompositionProjectionRoleGoalIds(normalizeCompositionView(v).rootNodes, goals).targetGoalIds
const setSha = (v: Set<string>) => sha(json([...v].sort()))
const source = JSON.parse(read(extractionPath))
const sourceGoal = source.sourceGoals.find((g: { id: string }) => g.id === sourceGoalId)
assert.equal(sourceGoal.courseLevel, 'LK')
assert.match(sourceGoal.sourceText, /^Einzelspalt mit monochromatischem Licht/)
const sourceBinding = {
  extractionPath, extractionSha256: sha(read(extractionPath)), sourceGoal,
  originalDocument: source.sourceDocument,
  originalDocumentSha256: sha(readFileSync(source.sourceDocument.path)),
  originalPrintedPage: 41,
  observedHeading: 'erhöhtes Niveau (Leistungskurs)',
}
if (process.argv.includes('--check')) {
  const receipt = JSON.parse(read(receiptPath))
  assert.equal(receipt.previousReceiptSha256, sha(read(previousPath)))
  assert.deepEqual(receipt.sourceBinding, sourceBinding)
  assert.equal(receipt.views.length, 2)
  for (const oldProof of previous.views) {
    const bytes = read(oldProof.path), view = JSON.parse(bytes), currentTargets = targets(view)
    const followup = receipt.views.find((v: { path: string }) => v.path === oldProof.path)
    assert.equal(sha(bytes), followup?.afterSha256 ?? oldProof.afterSha256)
    assert.equal(setSha(currentTargets), followup?.afterTargetSetSha256 ?? oldProof.afterTargetSetSha256)
    assert.equal(currentTargets.has(minimumId), view.scope.jurisdiction === 'DE-BW' && view.scope.courseProfile === 'LK')
    if (followup) {
      assert.equal(followup.beforeSha256, oldProof.afterSha256)
      assert.deepEqual(followup.removedTargetGoalIds, [singleId])
      assert.equal(currentTargets.has(singleId), false)
    }
    assert.deepEqual(compileCompositionView(normalizeCompositionView(view), canonical, universe).findings.filter(f => f.severity === 'error'), [])
  }
  console.log('PASS: composed 64-view check; 56 minima-only exclusions plus two source-proven HE-GK single-slit exclusions, no further target changes.')
} else {
  assert.equal(existsSync(receiptPath), false, 'Preserve the historical two-view receipt')
  const patches: string[] = []
  const views = paths.map(path => {
    const beforeBytes = read(path), before = JSON.parse(beforeBytes)
    assert.equal(before.scope.jurisdiction, 'DE-HE')
    assert.equal(before.scope.courseProfile, 'GK')
    const oldProof = previous.views.find((v: { path: string }) => v.path === path)
    assert.equal(sha(beforeBytes), oldProof.afterSha256)
    const after = structuredClone(before)
    after.rootNodes.push({ kind: 'goalEntry', goalId: singleId, projectionRole: 'prerequisiteOnly' })
    const beforeTargets = targets(before), afterTargets = targets(after)
    assert.deepEqual([...beforeTargets].filter(id => !afterTargets.has(id)), [singleId])
    assert.deepEqual([...afterTargets].filter(id => !beforeTargets.has(id)), [])
    assert.deepEqual(compileCompositionView(normalizeCompositionView(after), canonical, universe).findings.filter(f => f.severity === 'error'), [])
    const afterBytes = json(after)
    const left = beforeBytes.trimEnd().split('\n'), right = afterBytes.trimEnd().split('\n')
    let first = 0
    while (left[first] === right[first]) first++
    patches.push('*** Update File: ' + path + '\n@@\n' + left.slice(first - 4, first).map(l => ' ' + l).join('\n') + '\n' + left.slice(first).map(l => '-' + l).join('\n') + '\n' + right.slice(first).map(l => '+' + l).join('\n') + '\n*** End of File\n')
    return { path, beforeSha256: sha(beforeBytes), afterSha256: sha(afterBytes), beforeTargetSetSha256: setSha(beforeTargets), afterTargetSetSha256: setSha(afterTargets), removedTargetGoalIds: [singleId], addedTargetGoalIds: [] }
  })
  const receipt = {
    schemaVersion: 1, preparedAt: '2026-09-07', package: 'physics-single-slit-he-original-source-scope-v4',
    authorization: 'Root specifically approved these two HE-GK overrides after checking the original LK course-level source; no other jurisdiction may be changed from tags alone.',
    sourceBinding, previousReceiptPath: previousPath, previousReceiptSha256: sha(read(previousPath)),
    semantics: 'Explicit authored non-target membership under the existing prerequisiteOnly specificity rule. No removal of stable canonical IDs or mastery conversion.',
    validation: 'This receipt extends v3 only at its two listed paths. Use this helper --check for the combined final64-view proof; the unchanged v3 receipt remains the historical pre-followup evidence.',
    claims: { newOriginalDocumentPublication: false, humanReview: false, tagInferredCourseScope: false, runtimeChange: false },
    views,
  }
  patches.push('*** Add File: ' + receiptPath + '\n' + json(receipt).trimEnd().split('\n').map(l => '+' + l).join('\n') + '\n')
  process.stdout.write('*** Begin Patch\n' + patches.join('') + '*** End Patch\n')
}
