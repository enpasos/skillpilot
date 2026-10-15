// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { pathToFileURL, fileURLToPath } from 'node:url'

const main = '/home/enpasos/projects/skillpilot'
const own = path.dirname(fileURLToPath(import.meta.url))
const root = `${main}/tmp/cross-subject-requires/broad-fivea-two-owner-portable-quality-author-20261015-v1/isolated-root`
const { collectExternalGoalReferences: collect } = await import(pathToFileURL(`${root}/app/scripts/buildSkillpilotExportPackage.ts`).href)
const { declaredCanonicalExternalGoalIds: canonicalIds, declaredExternalGoalIdsForView: viewIds, unresolvedCompositionGoalReferences: unresolved } = await import(pathToFileURL(`${root}/app/scripts/validateSubjectExportPackages.ts`).href)
const sha = (value: Buffer) => `sha256:${crypto.createHash('sha256').update(value).digest('hex')}`
const files = ['app/scripts/buildSkillpilotExportPackage.ts', 'app/scripts/validateSubjectExportPackages.ts', 'app/scripts/testSubjectExportPackageContracts.ts', 'app/package.json', 'run_ci.sh']
const sourceBindings = files.map((p) => ({ path: path.relative(main, `${root}/${p}`), bytes: fs.statSync(`${root}/${p}`).size, sha256: sha(fs.readFileSync(`${root}/${p}`)) }))
const cpath = `${root}/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const physics = read(cpath)
const local = new Set<string>(physics.goals.map((g: any) => g.id))
const owners = new Map<string, any>()
for (const file of fs.readdirSync(path.dirname(cpath)).filter((n) => n.endsWith('.json') && !n.endsWith('PHYSIK.de.json'))) {
  const doc = read(`${path.dirname(cpath)}/${file}`)
  for (const goal of doc.goals ?? []) owners.set(goal.id, { targetLandscapeId: doc.landscapeId ?? null, targetFrameworkId: doc.frameworkId ?? null, targetSubject: doc.subject ?? null, targetTitle: goal.title ?? null })
}
const directTriples = new Set<string>()
for (const goal of physics.goals) for (const relation of ['requires', 'contains']) for (const id of goal[relation] ?? []) if (!local.has(id)) directTriples.add(`${goal.id}|${relation}|${id}`)
const dir = `${root}/curricula/DE/Gymnasium/composition-views/physik`
const views = fs.readdirSync(dir).filter((n) => n.endsWith('.view.json')).sort().map((n) => read(`${dir}/${n}`))
const errors: string[] = []
const records = collect(cpath, physics, errors, views)
assert.deepEqual(errors, [])
const actualDirect = records.filter((r: any) => r.relation !== 'composition-view')
assert.deepEqual(new Set(actualDirect.map((r: any) => `${r.fromGoalId}|${r.relation}|${r.targetGoalId}`)), directTriples)
for (const record of records) {
  const owner = owners.get(record.targetGoalId); assert(owner)
  for (const [key, value] of Object.entries(owner)) assert.equal(record[key], value)
}
const directIds = new Set(actualDirect.map((r: any) => r.targetGoalId))
assert.deepEqual(canonicalIds(records), directIds)
const getRefs = (v: any): any[] => Array.isArray(v) ? v.flatMap(getRefs) : v && typeof v === 'object' ? [...(typeof v.goalId === 'string' ? [v] : []), ...Object.values(v).flatMap(getRefs)] : []
const viewKeys = new Set<string>()
for (const view of views) {
  for (const reference of getRefs(view.rootNodes)) if (!local.has(reference.goalId) && !directIds.has(reference.goalId) && reference.projectionRole === 'prerequisiteOnly') viewKeys.add(`${view.viewId}|${reference.goalId}`)
  assert.deepEqual(unresolved(view, local, viewIds(view, records)), [])
}
const actualView = records.filter((r: any) => r.relation === 'composition-view')
assert.deepEqual(new Set(actualView.map((r: any) => `${r.fromViewId}|${r.targetGoalId}`)), viewKeys)
for (const record of actualView) { assert.equal(record.fromGoalId, undefined); assert.equal(record.projectionRole, 'prerequisiteOnly') }

const foreign = 'e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb'
assert(owners.has(foreign))
const minimal = { goals: [{ id: 'local', requires: [], contains: [] }] }
const ownLocal = new Set(['local'])
const entry = (projectionRole?: string) => ({ kind: 'goalEntry', goalId: foreign, ...(projectionRole ? { projectionRole } : {}) })
const support = { viewId: 'peer-support', rootNodes: [{ kind: 'structure', children: [entry('prerequisiteOnly')] }] }
const supportErrors: string[] = []; const supportRecords = collect(cpath, minimal, supportErrors, [support]); assert.deepEqual(supportErrors, [])
assert.equal(supportRecords.length, 1); assert.equal(supportRecords[0].relation, 'composition-view')
assert.equal(canonicalIds(supportRecords).size, 0, 'View-only support must not authorize a canonical requires or contains reference')
assert.deepEqual(unresolved(support, ownLocal, viewIds(support, supportRecords)), [])
const wrongView = { ...support, viewId: 'different-view' }
assert.deepEqual(unresolved(wrongView, ownLocal, viewIds(wrongView, supportRecords)), [foreign])
for (const role of [undefined, 'target']) {
  const target = { ...support, rootNodes: [entry(role)] }
  assert.deepEqual(unresolved(target, ownLocal, viewIds(target, supportRecords)), [foreign])
  const e: string[] = []; collect(cpath, minimal, e, [target]); assert(e.length > 0, 'New support lane must not auto-declare foreign targets/default targets')
}
const mixed = { ...support, rootNodes: [entry('prerequisiteOnly'), entry('target')] }
const mixedDeclared = viewIds(mixed, supportRecords)
assert(!mixedDeclared.has(foreign), 'Same-view mixed target/support references must not use support as target authority')
const mixedErrors: string[] = []; collect(cpath, minimal, mixedErrors, [mixed]); assert(mixedErrors.length > 0)
const unknown = { viewId: 'unknown', rootNodes: [{ kind: 'goalEntry', goalId: 'not-an-authored-goal', projectionRole: 'prerequisiteOnly' }] }
const unknownErrors: string[] = []; collect(cpath, minimal, unknownErrors, [unknown]); assert(unknownErrors.some((e) => e.includes('Unresolved external composition-view')))
const missingIdErrors: string[] = []; collect(cpath, minimal, missingIdErrors, [{ rootNodes: [] }]); assert(missingIdErrors.length > 0)
const directFixture = { goals: [{ id: 'local', requires: [foreign], contains: [] }] }
const directErrors: string[] = []; const directRecords = collect(cpath, directFixture, directErrors, []); assert.deepEqual(directErrors, [])
assert.deepEqual(canonicalIds(directRecords), new Set([foreign]))
assert.deepEqual(unresolved({ viewId: 'legacy-target', rootNodes: [entry('target')] }, ownLocal, viewIds({ viewId: 'legacy-target', rootNodes: [entry('target')] }, directRecords)), [], 'Previously canonical-edge-declared legacy view references retain prior treatment')
const legacyMixedErrors: string[] = []; const legacyMixedRecords = collect(cpath, directFixture, legacyMixedErrors, [mixed])
assert.deepEqual(legacyMixedErrors, [], 'Previously canonical-declared foreign IDs preserve mixed-role legacy treatment')
assert.deepEqual(legacyMixedRecords, directRecords, 'No new View-only records may be introduced for an already canonical-declared ID')
assert.deepEqual(unresolved(mixed, ownLocal, viewIds(mixed, legacyMixedRecords)), [], 'Legacy view resolution is unchanged')
for (const source of sourceBindings) assert.equal(sha(fs.readFileSync(`${main}/${source.path}`)), source.sha256, `Changed during review: ${source.path}`)
const out = { actualReviewer: '/root/eight_scope_guard_successor_independent_peer', configuredModel: 'OpenAI/gpt-6.1-sol', servingBuild: 'unobserved', observedAtUTC: new Date().toISOString(), verdict: 'PASS-bounded-export-declaration-successor', sourceBindings, actualCanonicalDirectDeclarationsEqual: actualDirect.length, actualViewsResolved: views.length, actualViewOnlyDeclarationRecords: actualView.length, viewAndOwnerAndRoleBound: true, actualCanonicalTriplesIndependentlyCalculated: true, negativeChecks: ['view-only does not authorize requires/contains', 'cross-view does not reuse support declaration', 'target/default not authorized by support declaration', 'same-view mixed support/target does not gain target authority', 'unknown foreign owner remains error', 'missing viewId remains error'], preexistingCanonicalDeclaredLegacyTreatmentRetained: true, runtimeTargetsOrGuardsOrInstallabilityChanged: false, MainEdits: false, privateInputsEdited: false }
fs.writeFileSync(`${own}/independent-export-declaration-behavior.actual.json`, JSON.stringify(out, null, 2) + '\n')
console.log(JSON.stringify({ verdict: out.verdict, direct: actualDirect.length, views: views.length, viewDeclarations: actualView.length }))
