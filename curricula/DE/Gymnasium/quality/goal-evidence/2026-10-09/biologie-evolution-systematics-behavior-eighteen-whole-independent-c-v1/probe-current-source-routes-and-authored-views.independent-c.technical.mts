import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expandGoalBookSourceAtlasReceipt } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../..')
const author = resolve(here, '../biologie-evolution-systematics-behavior-eighteen-whole-author-v1')
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const bind = (p: string) => ({ path: relative(root, resolve(root, p)), sha256: `sha256:${createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex')}`, bytes: readFileSync(resolve(root, p)).length })
const raw = JSON.parse(readFileSync(resolve(author, 'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json'), 'utf8'))
const selected = new Set<string>(raw.selectedGoalIds)
const receiptPath = 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'
const configPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const config = read(configPath)
const receipt = expandGoalBookSourceAtlasReceipt(read(receiptPath)) as any
assert.equal(receipt.configSha256, bind(configPath).sha256)
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const canonical = read(canonicalPath)
assert.deepEqual(canonical, read(relative(root, resolve(author, 'input/current-canonical479-root23-successor.snapshot.json'))))
const originalRows = raw.wholeOriginalSourceDutyRows.map((r: any) => {
  assert.ok(config.mappingPaths.includes(r.mappingBinding.path))
  assert.equal(bind(r.mappingBinding.path).sha256, r.mappingBinding.sha256)
  assert.equal(bind(r.extractionBinding.path).sha256, r.extractionBinding.sha256)
  const mapping = read(r.mappingBinding.path)
  const index = Number(r.decisionJsonPointer.split('/').at(-1))
  assert.deepEqual(mapping.decisions[index], r.wholeOriginalDecision)
  const edges = mapping.mappings ?? mapping.edges ?? []
  assert.deepEqual(edges.filter((e: any) => e.legacyGoalId === r.wholeOriginalDecision.sourceGoalId), r.wholeOriginalMatchingEdges)
  const currentScopes = receipt.scopes.flatMap((s: any) => {
    const witnesses = s.witnesses.filter((w: any) => w.mappingPath === r.mappingBinding.path && w.sourceGoalId === r.wholeOriginalDecision.sourceGoalId)
    return witnesses.length ? [{ key: s.key, path: s.path, jurisdiction: s.jurisdiction, stage: s.stage, courseProfile: s.courseProfile, witnesses }] : []
  })
  return { rowId: r.rowId, sourceGoalId: r.wholeOriginalDecision.sourceGoalId, mappingBinding: bind(r.mappingBinding.path), decisionJsonPointer: r.decisionJsonPointer, extractionBinding: bind(r.extractionBinding.path), wholeDecisionAndEdgesValueExact: true, originalPartnerGoalIds: r.wholeCanonicalPartnerGoalIds, currentOrdinarySourceAtlasScopes: currentScopes }
})
const landscape = normalizeCanonicalLandscape(canonical)
const goals = new Map(landscape.goals.map(g => [g.id, g]))
const viewsDir = 'curricula/DE/Gymnasium/composition-views/biologie'
const views = readdirSync(resolve(root, viewsDir)).filter(n => n.endsWith('.json')).sort().map(name => {
  const p = `${viewsDir}/${name}`
  const view = normalizeCompositionView(read(p))
  const result = compileCompositionView(view, landscape)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
  return { binding: bind(p), viewId: view.viewId, scope: view.scope, selectedTargetGoalIds: [...roles.targetGoalIds].filter(id => selected.has(id)).sort(), selectedPrerequisiteOnlyGoalIds: [...roles.prerequisiteOnlyGoalIds].filter(id => selected.has(id)).sort(), errors: result.findings.filter(f => f.severity === 'error') }
})
assert.ok(views.every(v => v.errors.length === 0))
const currentGoals = canonical.goals.filter((g: any) => selected.has(g.id)).map((g: any) => ({ goalId: g.id, applicability: g.applicability ?? null, dimensionTags: g.dimensionTags ?? null, tags: g.tags ?? [], canonicalContainsParents: canonical.goals.filter((p: any) => (p.contains ?? []).includes(g.id)).map((p: any) => ({ id: p.id, title: p.title })) }))
const output = resolve(here, 'current35-ordinary-source-routes-and-eight-authored-views.actual.json')
assert.equal(existsSync(output), false)
writeFileSync(output, `${JSON.stringify({ schemaVersion: 1, role: 'Read-only regular receipt expansion and ordinary authored-view compilation; no new source/placement approval', createdAt: new Date().toISOString(), canonicalBinding: bind(canonicalPath), atlasConfigBinding: bind(configPath), atlasReceiptBinding: bind(receiptPath), original35DutyRows: originalRows, current18CanonicalMetadata: currentGoals, eightActualAuthoredViews: views, sourceQualificationIsNotScientificApproval: true, noRuntimeFallbackInferred: true, activeWrites: [], strictGain: 0 }, null, 2)}\n`)
console.log(JSON.stringify({ binding: bind(output), originalDuties: originalRows.length, authoredViews: views.length, errors: views.flatMap(v => v.errors).length }))
