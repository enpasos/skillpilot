// Resumed field-leased candidate. New course claims require the explicit source scope below.
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const clone = (v: any) => JSON.parse(JSON.stringify(v))
const hash = (v: any) => 'sha256:' + createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex')
const assert = (v: any, message: string) => { if (!v) throw new Error(message) }
export const ids = {
  S: 'af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93', T: '37013646-f13a-5faf-954c-940f2fd7502f',
  B: 'c52d55c3-b687-586c-b0f9-8ffcd1069424', DM: '3d466956-04fb-58d7-9008-ad8090f8706d',
  DE: 'b4772b06-b10c-52dd-841b-a96ffb7c7e28', G: '1b060e79-dc2d-5e4e-abb5-42eca39f9cc7',
  U: 'db0394ca-297c-5892-b414-525ec186f928', K: '497f1311-17d6-56ff-afb1-422a738e5c16',
  C1: 'c9405043-bdc0-5995-8b4d-5bb56d97d05d', C2: 'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
  C3: '5db07785-8cca-50d5-81a9-e0264d344af9', astro: 'b59cb1ef-05c2-5b09-abb3-8b6903ca0fd6',
}
const all = [ids.S, ids.T, ids.B, ids.DM, ids.DE, ids.G, ids.U]
const parents = [ids.C1, ids.C2, ids.C3]
const groups: Record<string, string[]> = { [ids.C1]: [ids.S, ids.T], [ids.C2]: [ids.B, ids.DM, ids.DE], [ids.C3]: [ids.G, ids.U] }
const authoredTargets: Record<string, string[]> = {
  DE: all, 'DE-HE': all, 'DE-BY': [ids.S, ids.B, ids.DM, ids.G],
  'DE-BW': [ids.B, ids.DM, ids.G, ids.U], 'DE-RP': [ids.B, ids.G, ids.U],
  'DE-SL': [ids.S, ids.G], 'DE-SN': [ids.S], 'DE-TH': [ids.T],
}
const entry = (goalId: string, role = 'target') => ({ kind: 'goalEntry', goalId, ...(role === 'target' ? {} : { projectionRole: role }) })
export async function buildViewCandidates({ root, beforeLandscape, afterLandscape, externalGoals = [] }: any) {
  const native = await import(pathToFileURL(resolve(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
  const beforeById = new Map<string, any>([...externalGoals, ...beforeLandscape.goals].map((g: any) => [g.id, g]))
  const afterById = new Map<string, any>([...externalGoals, ...afterLandscape.goals].map((g: any) => [g.id, g]))
  const dir = 'curricula/DE/Gymnasium/composition-views/physik'
  const paths = readdirSync(resolve(root, dir)).filter(p => p.endsWith('.view.json')).sort().map(p => dir + '/' + p)
  const atlas = 'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json'
  paths.push(atlas)
  const files: any[] = [], proof: any[] = [], leases: any[] = []
  for (const path of paths) {
    const beforeText = readFileSync(resolve(root, path), 'utf8'), before = JSON.parse(beforeText), after = clone(before)
    const jurisdiction = before.scope.jurisdiction ?? 'DE', stage = before.scope.stage
    const isPureSekI = stage === 'SekI'
    const isStaged = ['DE-SL', 'DE-SN', 'DE-TH'].includes(jurisdiction)
    // BY GA-ASTRO and BW 3.5.7 Basisfach are not source authority for LK.
    // Retain unrelated historical branches, but do not promote any new child there.
    const unsupportedCourse = ['DE-BY', 'DE-BW'].includes(jurisdiction) && before.scope.courseProfile === 'LK'
    const allowed = new Set(isPureSekI || unsupportedCourse || (['DE-SL', 'DE-SN'].includes(jurisdiction) && stage === 'SekII') ? [] : (authoredTargets[jurisdiction] ?? []))
    const q4Allowed = isStaged ? new Set<string>() : allowed
    let replacements = 0
    const replace = (nodes: any[], ancestors: string[] = []): any[] => nodes.flatMap(node => {
      if (node.kind === 'structure') return [{ ...node, children: replace(node.children, [...ancestors, node.id]) }]
      const oldId = node.goalId
      if (oldId !== ids.astro && !parents.includes(oldId)) return [clone(node)]
      leases.push({ path, ancestors, beforeNode: clone(node), beforeNodeDigest: hash(node) })
      replacements++
      const role = node.projectionRole ?? 'target'
      if (oldId === ids.astro) {
        assert(role === 'target', path + ': unexpected prerequisite-only astro subtree')
        return [{
          kind: 'structure', id: 'physics-b040-astrophysics', label: node.displayLabel ?? beforeById.get(ids.astro).title,
          children: beforeById.get(ids.astro).contains.flatMap((id: string) => parents.includes(id)
            ? groups[id].filter(g => q4Allowed.has(g)).map(g => entry(g))
            : [{ kind: (afterById.get(id)?.contains?.length ? 'canonicalSubtree' : 'goalEntry'), goalId: id }]),
        }]
      }
      if (jurisdiction === 'DE-BW' && ancestors.includes('physics-bw-sekii-3-5-4')) {
        assert(oldId === ids.C2 && role === 'target', path + ': unexpected BW wave reference')
        return [] // Existing e713 Doppler target stays exactly where it was.
      }
      let candidates = groups[oldId]
      if (jurisdiction === 'DE-BW' && oldId === ids.C3) candidates = [ids.G, ids.B, ids.DM, ids.U]
      if (jurisdiction === 'DE-BY' && oldId === ids.C3) candidates = [ids.G, ids.DM]
      if (jurisdiction === 'DE-BY' && oldId === ids.C2) candidates = [ids.B]
      return candidates.filter(g => role === 'prerequisiteOnly' || q4Allowed.has(g)).map(g => entry(g, role))
    })
    if (!isPureSekI) after.rootNodes = replace(after.rootNodes)
    if (!isPureSekI && isStaged && allowed.size) {
      const anchorId = jurisdiction === 'DE-TH' ? 'physics-e-phase' : 'physics-seki'
      const anchors: any[] = []
      const visit = (nodes: any[]) => nodes.forEach(n => { if (n.id === anchorId) anchors.push(n); visit(n.children ?? []) })
      visit(after.rootNodes)
      assert(anchors.length === 1, path + ': exact stage anchor unavailable ' + anchorId)
      leases.push({ path, stageAnchorId: anchorId, previousChildIds: anchors[0].children.map((n: any) => n.id ?? n.goalId) })
      anchors[0].children.push({
        kind: 'structure', id: 'physics-b040-source-local-astronomy',
        label: jurisdiction === 'DE-TH' ? 'Gravitation: Gezeiten (Einführungsphase)'
          : jurisdiction === 'DE-SL' ? 'Wahlthema Astronomie (Jahrgang 10, naturwissenschaftlicher Zweig)'
          : 'Aufbau des Sonnensystems (Jahrgang 10)',
        children: [...allowed].map(g => entry(g)),
      })
    }
    // Explicitly scoped foundations for retained astronomy targets, not new state curricular targets.
    // S/G/B are the reviewed replacements for the old broad prerequisite packages.
    const projected = native.collectCompositionProjectionRoleGoalIds(after.rootNodes, afterById)
    const required = new Set<string>()
    const collectRequires = (id: string) => {
      for (const r of afterById.get(id)?.requires ?? []) if (!required.has(r)) { required.add(r); collectRequires(r) }
    }
    for (const id of projected.targetGoalIds) collectRequires(id)
    const prerequisites = !isPureSekI ? [ids.S, ids.G, ids.B].filter(g => required.has(g) && !projected.targetGoalIds.has(g) && !projected.prerequisiteOnlyGoalIds.has(g)) : []
    if (prerequisites.length) {
      // Current B034 adds separate support structures; never overwrite them or
      // mistake them for the learner's existing subject/stage root.
      const roots = after.rootNodes.filter((n: any) => n.kind === 'structure' &&
        ['physics-root', 'physics-sekii', 'physics-bw-sekii', 'physics-national-atlas'].includes(n.id))
      assert(roots.length === 1, path + ': exact subject/stage structure anchor unavailable ' + roots.map((n: any) => n.id).join(','))
      roots[0].children.push(...prerequisites.map(g => entry(g, 'prerequisiteOnly')))
    }
    const baseProjection = native.collectCompositionProjectionRoleGoalIds(before.rootNodes, beforeById)
    const projection = native.collectCompositionProjectionRoleGoalIds(after.rootNodes, afterById)
    const compiled = native.compileCompositionView(native.normalizeCompositionView(after), afterLandscape, { ...afterLandscape, goals: [...afterById.values()] })
    const errors = compiled.findings.filter((f: any) => f.severity === 'error')
    assert(errors.length === 0, path + ': native composition errors ' + JSON.stringify(errors))
    const count = new Map<string, number>()
    const countNodes = (nodes: any[]) => nodes.forEach(n => { if (n.sourceGoalId) count.set(n.sourceGoalId, (count.get(n.sourceGoalId) ?? 0) + 1); countNodes(n.children ?? []) })
    countNodes(compiled.compiledRootNodes)
    assert([...count.values()].every(n => n <= 1), path + ': duplicate learner-visible goal')
    const removed = [...baseProjection.targetGoalIds].filter(g => !projection.targetGoalIds.has(g))
    assert(removed.every(g => [...parents, ids.astro].includes(g)), path + ': unrelated target removed ' + removed.join(','))
    const actualTargets = all.filter(g => projection.targetGoalIds.has(g))
    assert(JSON.stringify([...actualTargets].sort()) === JSON.stringify([...allowed].sort()), path + ': wrong authored target set')
    if (jurisdiction === 'DE' && !isPureSekI) assert(count.get(ids.K) === 1, path + ': existing Kepler must occur once')
    for (const g of actualTargets) assert(count.get(g) === 1, path + ': target not visible exactly once ' + g)
    const text = JSON.stringify(after, null, 2) + '\n'
    const changed = JSON.stringify(after) !== JSON.stringify(before)
    if (changed) files.push({ path, before: beforeText, after: text })
    proof.push({
      path, jurisdiction, stage, changed, replacedReferences: replacements,
      beforeDigest: hash(beforeText), afterDigest: hash(changed ? text : beforeText),
      nativeErrorCount: errors.length, nativeWarnings: compiled.findings.filter((f: any) => f.severity === 'warning'),
      duplicateVisibleGoalCount: 0, keplerVisibleCount: count.get(ids.K) ?? 0,
      newTargetGoalIds: actualTargets, newPrerequisiteOnlyGoalIds: all.filter(g => projection.prerequisiteOnlyGoalIds.has(g)),
      removedOldTargetIds: removed, preservedOtherTargetCount: [...baseProjection.targetGoalIds].filter(g => !removed.includes(g)).length,
      stagedTargetAnchor: isStaged && allowed.size ? (jurisdiction === 'DE-TH' ? 'physics-e-phase' : 'physics-seki') : null,
      memoryBVisible: projection.targetGoalIds.has(ids.B), memory266Visible: projection.targetGoalIds.has('266b6cf8-d49d-5197-862c-9998fcf179a5'),
    })
  }
  assert(proof.filter(p => p.changed && p.jurisdiction !== 'DE').length === 64, 'Expected 64 changed state views')
  assert(proof.filter(p => p.changed && p.jurisdiction === 'DE' && p.path !== atlas).length === 4, 'Expected 4 changed national views')
  assert(proof.find(p => p.path === atlas)?.changed, 'Atlas not changed')
  const leasePath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/physics100-split-implementation-v1/view-field-leases.json')
  const boundLeases = JSON.parse(readFileSync(leasePath, 'utf8')).views
  const reconciliation = leases.map((lease: any) => {
    let prior = boundLeases.find((old: any) => old.path === lease.path
      && JSON.stringify(old.ancestors ?? []) === JSON.stringify(lease.ancestors ?? [])
      && (old.beforeNode?.goalId ?? old.stageAnchorId) === (lease.beforeNode?.goalId ?? lease.stageAnchorId))
    if (!prior && parents.includes(lease.beforeNode?.goalId) &&
      lease.ancestors?.at(-1)?.startsWith('b034-preserved-')) {
      const outer = lease.ancestors.slice(0, -1)
      prior = boundLeases.find((old: any) => old.path === lease.path &&
        old.beforeNode?.goalId === ids.astro && old.beforeNode.kind === 'canonicalSubtree' &&
        (old.beforeNode.projectionRole ?? 'target') === 'target' &&
        JSON.stringify(old.ancestors) === JSON.stringify(outer))
      assert(prior && JSON.stringify(lease.beforeNode) === JSON.stringify({ kind: 'canonicalSubtree', goalId: lease.beforeNode.goalId }),
        'Current B034-expanded astro child is not the exact prior target reference: ' + lease.path)
      assert(beforeById.get(ids.astro).contains.includes(lease.beforeNode.goalId), 'Historical astro parent membership changed')
      return { path: lease.path, historical: prior, current: lease,
        decision: 'explicit-current-reconciliation: B034 expanded the historically bound astro subtree into a same-stage b034-preserved wrapper; replace only its exact three old parent references, preserving the wrapper and every current sibling. No historical children list is replayed.' }
    }
    assert(prior, 'No historical lease for ' + lease.path)
    if (lease.beforeNode) assert(JSON.stringify(prior.beforeNode) === JSON.stringify(lease.beforeNode), 'Historical touched node drift: ' + lease.path)
    // A stage-children array is no longer an authoritative whole-field lease.
    // Specific new append operations are bound to current before/after in the new plan.
    return { path: lease.path, historical: prior, current: lease,
      decision: JSON.stringify(prior) === JSON.stringify(lease) ? 'unchanged-exact-historical-lease'
        : 'preserve-current-stage-neighbours; old whole-child-list is not replayed; append separately leased new source-local node' }
  })
  return { files, receipt: { checkedViewsIncludingAtlas: proof.length, changedStateViews: 64, changedNationalViews: 4, changedAtlasViews: 1, proof, leases, reconciliation } }
}
