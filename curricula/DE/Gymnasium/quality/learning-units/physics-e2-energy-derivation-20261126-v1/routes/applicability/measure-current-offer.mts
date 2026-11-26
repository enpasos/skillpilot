// SPDX-License-Identifier: Apache-2.0
// Run from the repository root with --phase=before or --phase=after.
// This records exact current offers and native findings; it changes no catalog or view.
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root = process.cwd()
const dynamic = (path: string) => import(pathToFileURL(resolve(root, path)).href)
const {buildApplicabilityCompilation} = await dynamic('app/scripts/applicabilityCompiler.ts')
const {collectRenderedAtomicGoalIdsFromCompositionView, buildEffectiveRequiresEdges, createRouteProfiles} = await dynamic('app/scripts/generateCurriculumQualityStatus.ts')
const {normalizeCompositionView, collectCompositionProjectionRoleGoalIds} = await dynamic('app/src/utils/authoring/compositionViewAuthoring.ts')
const {buildRouteCatalogContext, restrictForeignRouteSupport} = await dynamic('app/scripts/lib/routeCatalogContext.ts')
const {restrictCompositionStageRouteSupport} = await dynamic('app/scripts/lib/compositionStageRouteMembership.ts')
const phase = process.argv.find(value => value.startsWith('--phase='))?.slice(8)
if (!['before', 'after'].includes(phase ?? '')) throw Error('Use --phase=before or --phase=after')
const startedAt = new Date().toISOString()
const out = 'curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/routes/applicability'
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const bind = (path: string) => ({path, sha256: sha(readFileSync(resolve(root, path)))})
const physicsId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const ids = ['2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b', 'e0085acf-af64-5c73-8abf-85a5bbfbdaa6']
const expectedViews = [
  'de-he-gym-physics-gk-g8', 'de-he-gym-physics-gk-g9', 'de-he-gym-physics-gk',
  'de-he-gym-physics-lk-g8', 'de-he-gym-physics-lk-g9', 'de-he-gym-physics-lk',
  'de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk',
  'de-sl-gym-physics-gk', 'de-sl-gym-physics-lk', 'de-sl-gym-sekii-physics-gk', 'de-sl-gym-sekii-physics-lk',
  'de-sn-gym-physics-lk', 'de-sn-gym-sekii-physics-lk',
].sort()
const catalogDir = 'curricula/DE/Gymnasium/canonical'
const paths = readdirSync(resolve(root, catalogDir)).filter(n => n.endsWith('.json')).sort().map(n => `${catalogDir}/${n}`)
const catalog = paths.map(read)
const physics = catalog.find(c => c.landscapeId === physicsId)
const physicsPath = paths[catalog.indexOf(physics)]
const byId = new Map<string, any>(catalog.flatMap(c => c.goals.map((g: any) => [g.id, g])))
console.log('Compiling current native applicability')
const compilation = buildApplicabilityCompilation(catalog.map((landscape: any, i: number) => ({file: resolve(root, paths[i]), landscape})))
const report = compilation.reports.find((r: any) => r.landscapeId === physicsId)!
const compiled = new Map<string, any>(report.goals.map((g: any) => [g.goalId, g.compiledApplicability.jurisdiction ?? []]))
const context = buildRouteCatalogContext(physics, catalog).landscape
const effective = buildEffectiveRequiresEdges(context)
const anchors = [...new Set<string>(createRouteProfiles(root).filter((p: any) => p.landscapeId === physicsId).flatMap((p: any) => p.motivationAnchorGoalIds))]
const physicsGoalIds = new Set<string>(physics.goals.map((g: any) => g.id))
const viewDir = 'curricula/DE/Gymnasium/composition-views/physik'
const files = readdirSync(resolve(root, viewDir)).filter(n => n.endsWith('.view.json')).sort().map(n => `${viewDir}/${n}`)
console.log('Measuring all 90 authored and native projected offers')
const views = files.map(file => {
  const view = normalizeCompositionView(read(file))
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  const filters = [view.scope.courseProfile, view.scope.durationModel].filter((v): v is string => typeof v === 'string')
  const projectedTargets = collectRenderedAtomicGoalIdsFromCompositionView(physics, resolve(root, file), filters, false, 'CrossStage', [], catalog)
  const visible = collectRenderedAtomicGoalIdsFromCompositionView(physics, resolve(root, file), filters, true, 'CrossStage', [], catalog)
  const targets = new Set<string>(projectedTargets)
  if (view.scope.jurisdiction) {
    for (const id of [...targets]) if (!compiled.get(id)?.includes(view.scope.jurisdiction)) targets.delete(id)
    for (const id of [...visible]) if (!compiled.get(id)?.includes(view.scope.jurisdiction)) visible.delete(id)
  }
  restrictForeignRouteSupport(visible, targets, physicsGoalIds, effective, anchors)
  restrictCompositionStageRouteSupport(visible, targets, effective, anchors)
  return {...bind(file), viewId: view.viewId, scope: view.scope, goals: ids.map(goalId => ({
    goalId, authoredTarget: roles.targetGoalIds.has(goalId), authoredPrerequisiteOnly: roles.prerequisiteOnlyGoalIds.has(goalId),
    projectedTargetBeforeApplicability: projectedTargets.has(goalId), nativeRenderedTarget: targets.has(goalId), nativeRenderedVisible: visible.has(goalId),
  }))}
})
const equals = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
for (const id of ids) for (const field of ['authoredTarget', 'projectedTargetBeforeApplicability', 'nativeRenderedTarget', 'nativeRenderedVisible']) {
  const actual = views.filter(v => (v.goals.find(g => g.goalId === id) as any)[field]).map(v => v.viewId).sort()
  if (!equals(actual, expectedViews)) throw Error(`${id}: ${field} differs from exact 14 offers`)
}
if (views.length !== 90 || views.some(v => v.goals.some(g => g.authoredPrerequisiteOnly))) throw Error('Unexpected view count or support-only leak')
const outsideOfferLeaks = views.filter(v => !expectedViews.includes(v.viewId) && v.goals.some(g => g.authoredTarget || g.authoredPrerequisiteOnly || g.projectedTargetBeforeApplicability || g.nativeRenderedTarget || g.nativeRenderedVisible))
const key = (w: any) => [w.code, w.landscapeId, w.goalId ?? '', w.dimension ?? '', w.value ?? ''].join('|')
const warnings = [...new Map<string, any>(report.findings.filter((f: any) => f.severity === 'warning').map((f: any) => [[f.severity, key(f), f.message].join('|'), f])).values()]
const registryPath = 'docs/qa-ci/applicability-accepted-warnings.json'
const registry = read(registryPath)
const entries = registry.acceptedWarnings.filter((w: any) => w.code !== 'APV-202' && w.landscapeId === physicsId)
const acceptedKeys = new Set(entries.map(key)), currentKeys = new Set(warnings.map(key))
const active = warnings.filter(w => !acceptedKeys.has(key(w)))
const obsolete = entries.filter((w: any) => !currentKeys.has(key(w)))
const nFindings = warnings.filter(w => ids.includes(w.goalId))
const expectedKeys = ['APV-201|' + physicsId + '|' + ids[0] + '|jurisdiction|', 'APV-201|' + physicsId + '|' + ids[1] + '|jurisdiction|', 'APV-203|' + physicsId + '|' + ids[0] + '|jurisdiction|'].sort()
if (!equals(nFindings.map(key).sort(), expectedKeys)) throw Error('N warning keys changed')
if (phase === 'before' && (!equals(active.map(key).sort(), expectedKeys) || obsolete.length)) throw Error('Unexpected predecessor warning debt')
if (phase === 'after' && (active.length || obsolete.length || entries.length !== 18)) throw Error('Acceptance did not resolve exactly the three N warnings')
const ancestors = new Set<string>([ids[0]])
let added = true
while (added) { added = false; for (const g of physics.goals) if (!ancestors.has(g.id) && (g.contains ?? []).some((id: string) => ancestors.has(id))) { ancestors.add(g.id); added = true } }
const derivationReport = report.goals.find((g: any) => g.goalId === ids[0])!
const mappingSources = [...new Set<string>(derivationReport.evidence.filter((e: any) => e.kind === 'mapping').map((e: any) => e.source))]
const inheritedSignals = mappingSources.map(path => {
  const rows = (read(path).mappings ?? []).flatMap((row: any, index: number) => ancestors.has(row.canonicalGoalId) && row.canonicalGoalId !== ids[0] ? [{rowPointer: `/mappings/${index}`, legacyGoalId: row.legacyGoalId, canonicalGoalId: row.canonicalGoalId, canonicalTitle: byId.get(row.canonicalGoalId)?.title, matchType: row.matchType}] : [])
  const witnesses = new Map<string, any>()
  for (const row of rows) { const key = `${row.canonicalGoalId}|${row.matchType}`; if (!witnesses.has(key)) witnesses.set(key, row) }
  return {...bind(path), ancestorMappingRowCount: rows.length, ancestorMappingWitnesses: [...witnesses.values()]}
})
const beforeRegistry = read(`${out}/accepted-warnings.predecessor.json`)
if (!equals(registry.acceptedWarnings.slice(0, beforeRegistry.acceptedWarnings.length), beforeRegistry.acceptedWarnings)) throw Error('Existing acceptance rows changed')
const output = {
  schema: 'physics-e2-energy-applicability-offer-audit-v1', phase, startedAt, completedAt: new Date().toISOString(),
  method: 'Fresh native applicability compilation plus separate authored role expansion and native composition projection, with course/duration filters, compiled jurisdiction filtering and foreign/stage support restrictions. Applicability filtering only removes projected targets; it creates none.',
  landscapeId: physicsId, canonicalPhysics: bind(physicsPath), canonicalCatalog: paths.map(bind),
  compiler: bind('app/scripts/applicabilityCompiler.ts'), projection: bind('app/scripts/generateCurriculumQualityStatus.ts'),
  overrideRegistry: bind('curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json'),
  reviewedGoals: ids.map(goalId => ({goalId, canonicalGoalJsonStringifySha256: sha(JSON.stringify(byId.get(goalId))), authoredApplicability: byId.get(goalId).applicability, nativeCompiledReport: report.goals.find((g: any) => g.goalId === goalId)})),
  findings: nFindings, exactWarningKeys: expectedKeys,
  counts: {views: views.length, exactTargetViewsPerGoal: expectedViews.length, outsideOfferLeaks: outsideOfferLeaks.length, supportOnlyLeaks: 0,
    physicsRawWarnings: warnings.length, physicsAcceptedWarnings: warnings.length - active.length, physicsActiveWarnings: active.length, physicsObsoleteAcceptedWarnings: obsolete.length, retainedRegistryRows: beforeRegistry.acceptedWarnings.length},
  acceptanceRegistry: bind(registryPath), retainedRegistry: bind(`${out}/accepted-warnings.predecessor.json`),
  retainedRowSequenceSha256: sha(JSON.stringify(beforeRegistry.acceptedWarnings)),
  inheritedAncestorIds: [...ancestors].filter(id => id !== ids[0]).sort(), inheritedMappingSignals: inheritedSignals,
  exactOfferedViewIds: expectedViews, outsideOfferLeaks, views,
  limitations: ['Compiler-surplus jurisdictions do not establish an official derivation requirement.', 'SN GK recommendation remains outside the regular offer.', 'This audit changes neither learner results nor applicability/compiler gates. Source decisions and assessment release are separate bound evidence.'],
}
const outputPath = `${out}/current-offer.${phase}.actual.json`
if (process.argv.includes('--check')) {
  const existing = read(outputPath)
  const stable = ({startedAt: _start, completedAt: _end, ...value}: any) => value
  if (!equals(stable(existing), stable(output))) throw Error('Current inputs differ from the retained audit; write a new successor')
} else {
  if (existsSync(resolve(root, outputPath))) throw Error('Retained audit already exists; use --check or a new successor')
  writeFileSync(resolve(root, outputPath), JSON.stringify(output, null, 2) + '\n')
}
console.log(JSON.stringify(output.counts))
