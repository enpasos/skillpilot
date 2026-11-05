import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest, mathCanonicalPath } from './learningUnitsMathAuthoring'
import { requireNativeInventory } from './learningUnitsNativeMathInventory'
import { compactScalarArrays } from './learningUnits/compactJson'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const ROOT = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const MATH = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const ledger = 'DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const overview = 'DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'
const bytes = (path: string) => readFileSync(resolve(repo, path), 'utf8')
const parse = (path: string) => JSON.parse(bytes(path))
const hash = (value: unknown) => digest(canonicalJson(value))
const setDigest = (ids: string[]) => digest(JSON.stringify([...new Set(ids)].sort()))
export function nativeOfferScope(row: any) {
  const scope = row.requestedCompositionScope
  assert.ok(scope && scope.stage, `Unresolved native stage: ${row.scopeId}`)
  const jurisdiction = scope.jurisdiction ?? row.personalCurriculum?.[ROOT]?.filterId
  assert.ok(jurisdiction === 'ALL' || /^DE-[A-Z]{2}$/.test(jurisdiction), 'Missing exact jurisdiction')
  const result = { rootLandscapeId: ROOT, landscapeId: MATH, schoolForm: scope.schoolForm,
    jurisdiction, stage: scope.stage, durationModel: scope.durationModel ?? null,
    courseProfile: scope.stage === 'SekI' ? null : scope.courseProfile ?? null }
  assert.equal(result.schoolForm, 'Gymnasium')
  assert.equal([jurisdiction, result.stage, result.durationModel ?? '', result.courseProfile ?? ''].join('/'), row.scopeId,
    'Native dimensions differ from declared inventory identity')
  return result
}
export function physicalViewIds(ids: string[], resolvedViews: Record<string, any>) {
  return [...new Set(ids.flatMap(id => {
    if (!id.startsWith('merged:')) return [id]
    const sources = resolvedViews[id]?.mergedFromViewIds
    assert.ok(Array.isArray(sources) && sources.length > 1, `Native merged view lost its physical provenance: ${id}`)
    return sources as string[]
  }))].sort()
}

export function prepareOfferBindings(raw: any, config: any, catalog: any) {
  requireNativeInventory(raw); assert.equal(raw.scopes.length, 182)
  assert.equal(config.schemaVersion, 1)
  const nativeByScope = new Map(raw.scopes.map((row: any) => [row.scopeId, row]))
  const definitionByRef = new Map<string, any>()
  for (const entry of catalog.contracts) {
    assert.equal(digest(bytes(`curricula/${entry.path}`)), entry.sha256)
    for (const [path, expected] of Object.entries(entry.inputs)) assert.equal(digest(bytes(`curricula/${path}`)), expected, `Frozen contract input drift: ${path}`)
    const definition = parse(`curricula/${entry.path}`)
    definitionByRef.set(`${definition.contractId}@${definition.revision}`, definition)
  }
  for (const selection of config.rootSelections) {
    assert.ok(definitionByRef.has(`${selection.contractId}@${selection.revision}`), 'Unknown selected root')
    assert.equal(new Set(selection.scopeIds).size, selection.scopeIds.length, 'Duplicate root scope')
    for (const scopeId of selection.scopeIds) assert.ok(nativeByScope.has(scopeId), `Not an actual offered configuration ${scopeId}`)
  }
  const source = parse(mathCanonicalPath)
  assert.equal(digest(bytes(mathCanonicalPath)), raw.nativeMapperInputSha256[mathCanonicalPath], 'Canonical changed after native proof')
  const activeViewPaths = new Map<string, string>()
  const mappingPaths: string[] = []
  for (const path of Object.keys(raw.nativeMapperInputSha256).sort()) {
    if (!path.startsWith('curricula/DE/Gymnasium/')) continue
    if (path.includes('/composition-views/mathematik/') && path.endsWith('.json')) {
      const view = parse(path); if (view.landscapeId === MATH && view.viewId) activeViewPaths.set(view.viewId, path.substring('curricula/'.length))
    }
    if (path.includes('/mapping/') && path.endsWith('.json') && !path.endsWith('.review.json') && !path.includes('/quality/')) {
      const map = parse(path)
      if (map.version && map.targetLandscapeId === MATH && Array.isArray(map.mappings) && !map.reviewId && !map.sourceExtractionPath && !map.decisions) mappingPaths.push(path.substring('curricula/'.length))
    }
  }
  // The actual runtime mapping service joins direct state mappings before its authored view projection.
  // Unrelated sources/extractions/reviews parsed during catalog discovery remain proof-only.
  const common = [mathCanonicalPath.substring('curricula/'.length), overview, ledger,
    'DE/Gymnasium/provenance/source-landscape-registry.json',
    'DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
    'DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json']
  const inputs: Record<string, string> = {}
  const addInput = (path: string) => {
    const sha = digest(bytes(`curricula/${path}`)); const nativeSha = raw.nativeMapperInputSha256[`curricula/${path}`]
    if (nativeSha) assert.equal(sha, nativeSha, `Current projection input drift: ${path}`)
    inputs[path] = sha
  }
  common.forEach(addInput)
  const rows = raw.scopes.map((row: any) => {
    assert.equal(row.projectionResolved, true); assert.equal(row.prerequisiteCompilationResolved, true)
    const viewIds = physicalViewIds(row.compositionViewIds, row.resolvedSubjectViews)
    const viewPaths = viewIds.map(id => { const path = activeViewPaths.get(id); assert.ok(path, `Missing physical native view ${id}`); return path })
    const scope = nativeOfferScope(row)
    // ALL consumes all authored mappings; a state scope consumes just that state's mappings.
    const usedMappings = mappingPaths.filter(path => scope.jurisdiction === 'ALL' || path.includes(`/mapping/${scope.jurisdiction}/`))
    const inputPaths = [...new Set([...common, ...usedMappings, ...viewPaths])].sort(); inputPaths.forEach(addInput)
    const rootContractRefs = config.rootSelections.filter((selection: any) => selection.scopeIds.includes(row.scopeId))
      .map(({ contractId, revision }: any) => ({ contractId, revision }))
    const owned = new Set<string>(); const visited = new Set<string>()
    const walk = (ref: any) => {
      const key = `${ref.contractId}@${ref.revision}`; assert.ok(!visited.has(key), `Duplicate child acquisition path ${row.scopeId}: ${key}`); visited.add(key)
      const definition = definitionByRef.get(key); assert.ok(definition)
      const unit = source.programUnits.find((value: any) => value.id === definition.sourceBinding.programUnitId)
      assert.ok(unit?.learningUnit); assert.equal(unit.learningUnit.contractId, ref.contractId); assert.equal(unit.learningUnit.revision, ref.revision)
      assert.equal(unit.learningUnit.placementRevision, definition.sourceBinding.placementRevision)
      const acquisition = source.goalPlacements.filter((value: any) => value.unitId === unit.id && value.acquisition).map((value: any) => value.goalId).sort()
      assert.deepEqual(acquisition, [...definition.ownGoalIds].sort(), `Current acquisition binding differs ${key}`)
      for (const id of definition.ownGoalIds) {
        assert.ok(row.targetAtomicGoalIds.includes(id), `Selected root Own outside actual native target ${row.scopeId}: ${id}`)
        assert.ok(!owned.has(id), `Duplicate direct owner ${row.scopeId}: ${id}`); owned.add(id)
      }
      for (const child of definition.requiredChildContractRefs) walk(child)
    }
    rootContractRefs.forEach(walk)
    return { scope, coverage: 'partial', compositionViewIds: viewIds, inputPaths,
      targetSetSha256: setDigest(row.targetAtomicGoalIds), prerequisiteOnlySetSha256: setDigest(row.prerequisiteOnlyGoalIds), rootContractRefs }
  })
  assert.equal(new Set(rows.map(row => canonicalJson(row.scope))).size, 182, 'Nonunique actual ScopeKey')
  const proof = { schemaVersion: 1, semantics: 'actual-native-current-offer-binding-proof-v1', revision: config.revision,
    offeredScopeCount: rows.length, resolvedScopeCount: rows.length, partialScopeCount: rows.length,
    originalCurricularGoalIdsRetained: 807, targetAtomicUnionCount: new Set(raw.scopes.flatMap((row: any) => row.targetAtomicGoalIds)).size,
    emptyRootScopeCount: rows.filter(row => !row.rootContractRefs.length).length,
    selectedRootScopeCounts: config.rootSelections.map((selection: any) => ({ contractId: selection.contractId, revision: selection.revision, count: selection.scopeIds.length })),
    duplicateSelectedOwnPaths: 0, sameContractHistoricalInputsRewritten: 0,
    sourceSha256: digest(bytes(mathCanonicalPath)), nativeReportSha256: hash(raw), nativeInputManifestSha256: hash(raw.nativeMapperInputSha256),
    proofOnlyNativeInputCount: Object.keys(raw.nativeMapperInputSha256).length,
    runtimeInputCount: Object.keys(inputs).length, runtimeInputSha256: inputs,
    rowSetSha256: hash(rows), selectionConfigSha256: hash(config),
    boundary: 'Partial exact current offer selection only; no complete Mathematics, human trial, M7, package, HTTP or host acceptance claim.' }
  const proofPath = `docs/dev/learning-units-mathematics-current-offers-${config.revision}.json`
  const proofBytes = `${compactScalarArrays(proof)}\n`
  const reviewInput = { revision: config.revision, resolverRevision: 'native-personal-curriculum-offers-v1', inputs, offers: rows, proofSha256: digest(proofBytes) }
  const binder = { schemaVersion: 1, semantics: 'current-learning-unit-offers-v1', revision: config.revision,
    resolverRevision: 'native-personal-curriculum-offers-v1', inputs, reviewRef: config.reviewRef,
    proof: { path: proofPath, sha256: digest(proofBytes) }, offers: rows }
  return { binder, proofPath, proofBytes, reviewInput, reviewedInputSha256: hash(reviewInput) }
}

function main() {
  const args = process.argv.slice(2); const value = (key: string) => { const index = args.indexOf(key); return index < 0 ? undefined : args[index + 1] }
  assert.equal(['--prepare', '--stage', '--apply', '--check'].filter(flag => args.includes(flag)).length, 1, 'Choose exactly --prepare, --stage, --apply or --check')
  const config = parse(value('--config') ?? 'app/scripts/config/learning-units/math-current-offer-roots.json')
  const raw = parse(value('--native') ?? 'tmp/math-learning-units/native-backend.raw.json')
  const catalogPath = 'curricula/DE/Gymnasium/learning-units/catalog.json'; const catalog = parse(catalogPath)
  const result = prepareOfferBindings(raw, config, catalog)
  const candidate = args.includes('--prepare')
  if (!candidate) {
    const receipt = parse(`curricula/${config.reviewReceiptPath}`)
    assert.equal(receipt.schemaVersion, 1); assert.equal(receipt.semantics, 'learning-unit-offer-review-v1')
    assert.equal(receipt.decision, 'approved'); assert.ok(receipt.independentReviewer?.trim())
    assert.equal(receipt.reviewedInputSha256, result.reviewedInputSha256, 'Offer review inputs changed')
    assert.equal(receipt.reviewPath, config.reviewRef)
    for (const path of [config.reviewRef, config.reviewReceiptPath]) result.binder.inputs[path] = digest(bytes(`curricula/${path}`))
  }
  const binderPath = `curricula/DE/Gymnasium/learning-units/offers/${config.revision}.json`
  const binderBytes = `${compactScalarArrays(result.binder)}\n`
  const artifacts = new Map([[binderPath, binderBytes], [result.proofPath, result.proofBytes]])
  if (candidate) {
    const output = value('--output') ?? `tmp/math-learning-units/current-offers/${config.revision}`
    artifacts.set('review-input.json', `${compactScalarArrays({ reviewedInputSha256: result.reviewedInputSha256, reviewInput: result.reviewInput })}\n`)
    for (const [path, data] of artifacts) { const destination = resolve(repo, output, path); mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, data) }
  } else {
    if (!args.includes('--stage')) {
      const next = { ...catalog, currentOfferBinding: { path: binderPath.substring('curricula/'.length), sha256: digest(binderBytes) } }
      artifacts.set(catalogPath, `${JSON.stringify(next, null, 2)}\n`)
    }
    for (const [path, data] of artifacts) {
      if (args.includes('--check') || path === binderPath && existsSync(resolve(repo, path))) assert.equal(bytes(path), data, `Immutable binder/generator drift ${path}`)
    }
    if (!args.includes('--check')) for (const [path, data] of artifacts) { mkdirSync(dirname(resolve(repo, path)), { recursive: true }); writeFileSync(resolve(repo, path), data) }
  }
  console.log(JSON.stringify({ revision: config.revision, scopeCount: result.binder.offers.length,
    inputs: Object.keys(result.binder.inputs).length, reviewedInputSha256: result.reviewedInputSha256, candidateOnly: candidate }))
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
