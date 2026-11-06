import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { buildApplicabilityCompilation } from '../../app/scripts/applicabilityCompiler'
import { evaluateRouteProfile, routeProfiles } from '../../app/scripts/generateCurriculumQualityStatus'
const root = resolve(import.meta.dirname, '../..')
const path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
const raw = readFileSync(resolve(root, path))
const landscape = JSON.parse(raw.toString())
const profile = routeProfiles.find(profile => profile.landscapeId === landscape.landscapeId)!
const compilation = buildApplicabilityCompilation()
const viewsRoot = resolve(root, 'curricula/DE/Gymnasium/composition-views/informatik')
const scratch = mkdtempSync(resolve(tmpdir(), 'cqr104-actual-projections-'))
const rows = []
try {
  for (const name of readdirSync(viewsRoot).filter(name => name.endsWith('.view.json')).sort()) {
    const file = resolve(viewsRoot, name), viewRaw = readFileSync(file), view = JSON.parse(viewRaw.toString())
    if (view.scope.stage !== profile.compositionViewStage && view.scope.stage !== 'CrossStage') continue
    for (const jurisdiction of view.scope.jurisdiction ? [view.scope.jurisdiction] : compilation.summary.supportedValues) {
      // For national views, make the existing native loop's country explicit.
      // Keep the authored tree, roles, course and duration; no goal-set algorithm is copied.
      const projectedView = structuredClone(view)
      projectedView.scope.jurisdiction = jurisdiction
      const input = resolve(scratch, name.replace('.view.json', '') + '-' + jurisdiction + '.view.json')
      writeFileSync(input, JSON.stringify(projectedView))
      const scope = evaluateRouteProfile(landscape, profile, compilation, [input])
      const rule = scope.rules.find(rule => rule.id === 'CQR-104')!
      if (rule.metrics?.evaluatedProjectionScopes !== 1) throw new Error('Native scope count differs')
      rows.push({ sourceView: 'curricula/DE/Gymnasium/composition-views/informatik/' + name,
        sourceViewSha256: createHash('sha256').update(viewRaw).digest('hex'), viewId: view.viewId,
        authoredScope: view.scope, jurisdiction, status: rule.status, metrics: rule.metrics,
        details: rule.details?.map(detail => detail.replace(input, 'AUTHORED-VIEW:' + name)) })
    }
  }
  console.log(JSON.stringify({ source: { path, sha256: createHash('sha256').update(raw).digest('hex') },
    boundary: 'Existing route evaluator and native tree/filter functions. National loop iterations made explicit on private copies of unchanged authored view trees.',
    projectionCount: rows.length, emptyProjectionCount: rows.filter(row => row.metrics?.projectionScopesWithoutExpectedTerminalAutonomyGoals === 1).length,
    passCount: rows.filter(row => row.status === 'pass').length, rows }, null, 2))
} finally { rmSync(scratch, { recursive: true, force: true }) }
