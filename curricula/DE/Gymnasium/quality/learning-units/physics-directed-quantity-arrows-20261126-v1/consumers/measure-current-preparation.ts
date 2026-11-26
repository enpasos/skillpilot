// SPDX-License-Identifier: Apache-2.0
// Technical current-input successor; content approval remains in native review records.
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

async function main() {
  const [repository, output] = process.argv.slice(2)
  assert(repository && output && !fs.existsSync(output))
  const root = path.resolve(repository), baseline = 'eb77c4fb68'
  const digest = (raw: Buffer | string) => createHash('sha256').update(raw).digest('hex')
  const inputs = new Map<string, Buffer>()
  const bytes = (p: string) => {
    if (!inputs.has(p)) inputs.set(p, fs.readFileSync(path.join(root, p)))
    return inputs.get(p)!
  }
  const read = (p: string) => JSON.parse(bytes(p).toString('utf8'))
  const historicalBytes = (p: string) => execFileSync('git', ['show', `${baseline}:${p}`],
    {cwd: root, maxBuffer: 64 * 1024 * 1024})
  const {normalizeCanonicalLandscape} = await import(pathToFileURL(path.join(root,
    'app/src/utils/authoring/canonicalAuthoring.ts')).href)
  const normalizePath = 'app/src/utils/authoring/canonicalAuthoring.ts'
  assert.deepEqual(bytes(normalizePath), historicalBytes(normalizePath))
  const e1Path = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/dprime-passmark-successor-20261124/current-stage-preparation.actual.json'
  const hRoot = 'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/inventory/'
  const paths = [e1Path, ...['current-stage', 'conservation', 'vector-scale', 'individual-momenta']
    .map(name => `${hRoot}${name}-preparation.successor.actual.json`),
    'curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/consumers/current-stage-preparation.successor.actual.json']
  const e1 = read(paths[0]), h = read(paths[1])
  const pins = new Map<string, any>(e1.payloads.map((r: any) => [r.goalId,
    {goalId: r.goalId, rawSha256: r.rawSha256, normalizedSha256: r.normalizedSha256}]))
  function update(before: any, current: any) {
    assert.deepEqual(pins.get(before.goalId), before)
    assert.equal(before.goalId, current.goalId)
    pins.set(current.goalId, current)
  }
  for (const r of h.changes) update(r.before, r.current)
  for (const r of h.additionalPreparationPayloads) {assert(!pins.has(r.goalId)); pins.set(r.goalId, r)}
  for (const p of paths.slice(2)) {
    const record = read(p)
    for (const r of record.changes ?? [record]) update(r.before, r.current)
  }
  assert.equal(pins.size, 219)
  const canonicalPaths = ['PHYSIK', 'MATHEMATIK', 'CHEMIE'].map(subject =>
    `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${subject}.de.json`)
  const priorDocs = canonicalPaths.map(p => JSON.parse(historicalBytes(p).toString('utf8')))
  const currentDocs = canonicalPaths.map(read)
  const landscape = (docs: any[]) => ({...docs[0], goals: docs.flatMap(d => d.goals)})
  const priorUniverse = landscape(priorDocs), currentUniverse = landscape(currentDocs)
  const priorRaw = new Map<string, any>(priorUniverse.goals.map((g: any) => [g.id, g]))
  const currentRaw = new Map<string, any>(currentUniverse.goals.map((g: any) => [g.id, g]))
  const priorNormalized = new Map<string, any>(normalizeCanonicalLandscape(priorUniverse).goals.map((g: any) => [g.id, g]))
  const currentNormalized = new Map<string, any>(normalizeCanonicalLandscape(currentUniverse).goals.map((g: any) => [g.id, g]))
  const pin = (id: string, raw: Map<string, any>, normalized: Map<string, any>) => ({goalId: id,
    rawSha256: digest(JSON.stringify(raw.get(id))), normalizedSha256: digest(JSON.stringify(normalized.get(id)))})
  const changes: any[] = []
  for (const [id, previous] of pins) {
    assert.deepEqual(pin(id, priorRaw, priorNormalized), previous, `immutable H payload ${id}`)
    const current = pin(id, currentRaw, currentNormalized)
    if (JSON.stringify(previous) === JSON.stringify(current)) continue
    const a = priorRaw.get(id), b = currentRaw.get(id)
    const changedFields = [...new Set([...Object.keys(a), ...Object.keys(b)])]
      .filter(field => JSON.stringify(a[field]) !== JSON.stringify(b[field])).sort()
    if (id === 'ad984bb6-e225-432a-952d-d83cda40b7f8') {
      assert.deepEqual(changedFields, ['resourceLinks'])
    } else {
      assert.deepEqual(changedFields, ['requires'])
      assert.deepEqual(b.requires, [...a.requires,'b77a7e93-22f9-5722-a4cc-f18a149ab030'])
    }
    changes.push({goalId: id, changedFields, before: previous, current, beforeGoal: a, currentGoal: b})
  }
  const changedIds = changes.map(row => row.goalId).sort()
  function closure(goals: Map<string, any>, goalId: string) {
    const result = new Set<string>(), pending = [...(goals.get(goalId)?.requires ?? [])]
    while (pending.length) {
      const id = pending.pop()!.split(':').at(-1)!
      if (result.has(id)) continue
      const g = goals.get(id)
      assert(g && !g.contains?.length, id)
      result.add(id); pending.push(...(g.requires ?? []))
    }
    return [...result].sort()
  }
  const closures = h.closures.map((r: any) => {
    const beforeIds = closure(priorRaw, r.goalId), currentIds = closure(currentRaw, r.goalId)
    assert.equal(beforeIds.length, r.currentCount)
    return {goalId: r.goalId, priorDisposition: r.priorDisposition,
      beforeIds, currentIds, previousCount: beforeIds.length, currentCount: currentIds.length,
      added: currentIds.filter(id => !beforeIds.includes(id)), removed: beforeIds.filter(id => !currentIds.includes(id))}
  })
  for (const c of closures) {
    assert.deepEqual(c.removed, [])
    if (c.added.length) assert.deepEqual(c.added, ['b77a7e93-22f9-5722-a4cc-f18a149ab030'])
  }
  const additions = [...new Set<string>(closures.flatMap((c: any) => c.added))].filter(id => !pins.has(id))
  const additionalPreparationPayloads = additions.map(id => pin(id, currentRaw, currentNormalized))
  const inputPins = [...inputs].map(([p, raw]) => ({path: p, sha256: digest(raw)}))
  for (const p of inputPins) assert.equal(digest(fs.readFileSync(path.join(root, p.path))), p.sha256, p.path)
  const predecessorPath = paths.at(-1)!
  const report = {schemaVersion: 1, contract: 'physics-directed-quantity-arrows-current-stage-preparation-successor-v1',
    measuredAt: new Date().toISOString(), baselineCommit: baseline,
    predecessor: {path: predecessorPath, sha256: digest(bytes(predecessorPath)), payloadCount: 219},
    historicalChain: paths.map(p => ({path: p, sha256: digest(bytes(p))})),
    method: 'Replay the complete immutable E.1/H/N preparation-pin chain against the pre-A2 raw and natively normalized catalog, then enumerate every changed current payload and every current closure. This is technical binding, not a new content or source approval.',
    historicalPayloadCount: 219, currentPayloadCount: 219 + additions.length, additionalPreparationPayloads, retainedOtherPayloads: 219 - changes.length,
    changes, closures, learnerResultTransfer: false, subjectMatterApprovalClaimed: false,
    inputs: inputPins}
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'})
  console.log(JSON.stringify({payloads: pins.size, changedIds, changedClosures: closures.filter((c: any) => c.added.length || c.removed.length).length}))
}
main().catch(error => {console.error(error); process.exit(1)})
