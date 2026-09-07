import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { normalizeCanonicalLandscape } from '../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  normalizeCompositionView,
} from '../../../../../../app/src/utils/authoring/compositionViewAuthoring'

// Read-only, one-off proposal/checker. Apply the emitted patch explicitly.
// No runtime filtering, tag inference, source claims, or mastery conversion.
const stage = 'curricula/DE/Gymnasium/quality/goal-visualization-review/physics-c648-slit-split-v1/'
const receiptPath = stage + 'existing-minima-scope-v3.adoption-receipt.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const manifestPath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
const minimumId = 'c64820e1-c0ee-4342-9225-f981650f0c52'
const singleId = 'f6a3a602-1e45-5018-b0ff-3d49933cf634'
const sha = (value: string) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const read = (path: string) => readFileSync(path, 'utf8')
const canonical = normalizeCanonicalLandscape(JSON.parse(read(canonicalPath)))
const math = normalizeCanonicalLandscape(JSON.parse(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')))
const goalUniverse = { ...canonical, goals: [...canonical.goals, ...math.goals] }
const goals = new Map(canonical.goals.map(goal => [goal.id, goal]))
const minimum = goals.get(minimumId)!
assert.deepEqual(minimum.applicability, { jurisdiction: ['DE-BW'] })
assert.equal(minimum.extendedData?.applicabilityMappingInheritance, 'boundary')
const manifest = JSON.parse(read(manifestPath)) as { sourcePaths: string[] }
assert.equal(manifest.sourcePaths.length, 64)
const targetIds = (raw: unknown) => collectCompositionProjectionRoleGoalIds(
  normalizeCompositionView(raw).rootNodes, goals,
).targetGoalIds
const setHash = (ids: Set<string>) => sha(json([...ids].sort()))
const inputBinding = {
  manifestPath, manifestSha256: sha(read(manifestPath)),
  canonicalPath,
  // Status-only assessment review writes do not alter this structural proof.
  containsGraphSha256: sha(json(canonical.goals.map(g => ({ id: g.id, contains: g.contains })))),
  minimumGoalSha256: sha(json(minimum)),
}
const isTargetScope = (raw: unknown) => {
  const { scope } = normalizeCompositionView(raw)
  return scope.jurisdiction === 'DE-BW' && scope.courseProfile === 'LK'
}

if (process.argv.includes('--check')) {
  const receipt = JSON.parse(read(receiptPath))
  assert.deepEqual(receipt.inputBinding, inputBinding)
  assert.equal(receipt.views.length, 64)
  assert.equal(receipt.views.filter((v: { changed: boolean }) => v.changed).length, 56)
  for (const proof of receipt.views) {
    const bytes = read(proof.path)
    assert.equal(sha(bytes), proof.afterSha256, proof.path + ' bytes changed')
    const raw = JSON.parse(bytes)
    const targets = targetIds(raw)
    assert.equal(targets.has(minimumId), isTargetScope(raw), proof.path + ' incorrect minima scope')
    assert.equal(setHash(targets), proof.afterTargetSetSha256)
    assert.deepEqual(compileCompositionView(normalizeCompositionView(raw), canonical, goalUniverse)
      .findings.filter(f => f.severity === 'error'), [])
  }
  console.log('PASS: 64 views, 56 exact minima-only target exclusions; BW-LK retained; no tag-derived scope changes.')
} else {
  assert.equal(existsSync(receiptPath), false, 'Do not overwrite the historical scope proposal')
  const patches: string[] = []
  const proofs = manifest.sourcePaths.map(path => {
    const beforeBytes = read(path)
    const before = JSON.parse(beforeBytes)
    const view = normalizeCompositionView(before)
    const beforeTargets = targetIds(before)
    const after = structuredClone(before)
    const changed = view.scope.jurisdiction !== 'DE-BW' && beforeTargets.has(minimumId)
    if (changed) {
      assert.notEqual(view.scope.jurisdiction, 'DE-BY')
      after.rootNodes.push({ kind: 'goalEntry', goalId: minimumId, projectionRole: 'prerequisiteOnly' })
    }
    const afterTargets = targetIds(after)
    const removed = [...beforeTargets].filter(id => !afterTargets.has(id)).sort()
    const added = [...afterTargets].filter(id => !beforeTargets.has(id)).sort()
    assert.deepEqual(removed, changed ? [minimumId] : [])
    assert.deepEqual(added, [])
    assert.equal(afterTargets.has(minimumId), isTargetScope(after))
    assert.deepEqual(compileCompositionView(normalizeCompositionView(after), canonical, goalUniverse)
      .findings.filter(f => f.severity === 'error'), [])
    const afterBytes = changed ? json(after) : beforeBytes
    if (changed) {
      const left = beforeBytes.trimEnd().split('\n'), right = afterBytes.trimEnd().split('\n')
      let first = 0
      while (left[first] === right[first]) first++
      const context = Math.max(0, first - 4)
      patches.push('*** Update File: ' + path + '\n@@\n'
        + left.slice(context, first).map(line => ' ' + line).join('\n') + '\n'
        + left.slice(first).map(line => '-' + line).join('\n') + '\n'
        + right.slice(first).map(line => '+' + line).join('\n') + '\n*** End of File\n')
    }
    return {
      path, jurisdiction: view.scope.jurisdiction, stage: view.scope.stage,
      courseProfile: view.scope.courseProfile, changed,
      beforeSha256: sha(beforeBytes), afterSha256: sha(afterBytes),
      beforeTargetCount: beforeTargets.size, afterTargetCount: afterTargets.size,
      beforeTargetSetSha256: setHash(beforeTargets), afterTargetSetSha256: setHash(afterTargets),
      removedTargetGoalIds: removed, addedTargetGoalIds: added,
      singleSlitTargetUnchanged: beforeTargets.has(singleId) === afterTargets.has(singleId),
    }
  })
  assert.equal(proofs.filter(p => p.changed).length, 56)
  const receipt = {
    schemaVersion: 1, preparedAt: '2026-09-07', package: 'physics-existing-diffraction-minima-scope-v3',
    authorization: 'Root explicitly approved the 56 minima-only authored-view overrides after the CQR-003 and atlas countercheck.',
    diagnosis: 'The physics atlas reads authored composition targets, not the separate applicability compiler result. Broad electromagnetic-wave subtrees in 14 jurisdictions still included the newly narrowed BW-LK minima goal. This is source-view debt, not stale generated bytes or a changed export fallback.',
    semantics: 'The explicit goalEntry overrides inherited target membership by the existing specificity rule. The stable goal remains available solely to prerequisite checks; no target visibility, progress obligation, or mastery conversion is introduced.',
    limitation: 'The pre-existing single-slit target in GK views is unchanged. Course tags alone are not authority to remove it; concrete original curricular course-level evidence is required for any separate correction.',
    notClaimed: { newSourceReview: true, humanAssessmentApproval: true, runtimeChange: true, automaticMasteryMigration: true },
    inputBinding, views: proofs,
  }
  patches.push('*** Add File: ' + receiptPath + '\n' + json(receipt).trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n')
  process.stdout.write('*** Begin Patch\n' + patches.join('') + '*** End Patch\n')
}
