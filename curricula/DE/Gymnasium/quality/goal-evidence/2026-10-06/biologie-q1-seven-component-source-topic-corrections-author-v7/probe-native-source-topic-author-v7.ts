import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel } from '../../../../../../../app/scripts/goalBookModel'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const repo = resolve('.')
const source = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-source-topic-corrections-author-v7')
const output = process.env.BIO_Q1_V7_NATIVE_OUTPUT ? resolve(process.env.BIO_Q1_V7_NATIVE_OUTPUT) : source
if (output === source && existsSync(resolve(source, 'source-topic-corrections.author-v7.final.freeze.json'))) throw new Error('Frozen author package: select a fresh BIO_Q1_V7_NATIVE_OUTPUT')
const sparse = resolve(output === source ? 'tmp/biologie-q1-seven-source-topic-author-v7' : output, 'sparse-root')
if (existsSync(sparse)) throw new Error('Choose a fresh native output; do not overwrite another probe')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const write = (path: string, value: unknown) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value, null, 2) + '\n') }
const input = (binding: any) => { const path = resolve(repo, binding.path); if (sha(path) !== binding.sha256) throw new Error('Changed input: ' + binding.path); return read(path) }
const effective = read(resolve(source, 'effective-native-inputs.author-v7.json'))
const envelope = input(effective.canonicalEnvelope)
const raw = JSON.parse(envelope.candidateCanonicalUTF8)
const semantic = input(effective.semanticEnvelope).candidatePayload
const currentConfig = read(resolve(repo, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'))
const config = structuredClone(currentConfig)
const linked = new Set<string>()
const link = (path: string) => { if (linked.has(path)) return; if (!existsSync(resolve(repo, path))) throw new Error('Missing ' + path); const dest = resolve(sparse, path); mkdirSync(dirname(dest), { recursive: true }); symlinkSync(resolve(repo, path), dest); linked.add(path) }
link(config.durationModelPolicyPath)
for (const snapshot of config.sourceDocumentSnapshots ?? []) link(snapshot.path)
for (const path of config.mappingPaths) {
  link(path)
  const mapping = read(resolve(repo, path)); link(mapping.sourceExtractionPath)
  const extraction = read(resolve(repo, mapping.sourceExtractionPath))
  for (const document of extraction.sourceDocuments?.length ? extraction.sourceDocuments : [extraction.sourceDocument]) if (document?.path) link(document.path)
}
write(resolve(sparse, config.landscapePath), raw)
write(resolve(sparse, config.semanticKindLedgerPath), semantic)
config.expectedCurricularAtomicGoalCount = 390
for (const row of effective.sourceInputs) {
  const value = input(row.envelope)
  if (value.prospectivePath !== row.prospectivePath) throw new Error('Path mismatch')
  write(resolve(sparse, row.prospectivePath), value.candidatePayload)
  if (row.kind === 'source-mapping') config.mappingPaths.push(row.prospectivePath)
}
const old = buildGoalBookSourceAtlasInputs(currentConfig, repo)
const atlas = buildGoalBookSourceAtlasInputs(config, sparse)
const oldIDs = new Set<string>(old.receipt.scopes.flatMap((scope: any) => scope.goalIds))
const candidateIDs = new Set<string>(atlas.receipt.scopes.flatMap((scope: any) => scope.goalIds))
const newIDs = Object.values(envelope.newCanonicalGoalIDs) as string[]
if (oldIDs.size !== 383 || candidateIDs.size !== 390 || atlas.receipt.omittedGoals.length || [...oldIDs].some(id => !candidateIDs.has(id))) throw new Error('Actual 383→390 source contract failed')
const currentRaw = read(resolve(repo, currentConfig.landscapePath))
const currentSemantic = read(resolve(repo, currentConfig.semanticKindLedgerPath))
const candidateCanonical = normalizeCanonicalLandscape(raw)
const currentCanonical = normalizeCanonicalLandscape(currentRaw)
const candidateGoals = new Map<string, any>(raw.goals.map((goal: any) => [goal.id, goal]))
const dag = (field: string) => { const active = new Set<string>(), done = new Set<string>(); let edges = 0; const visit = (id: string) => { if (active.has(id)) throw new Error(field + ' cycle ' + id); if (done.has(id)) return; const goal = candidateGoals.get(id); if (!goal) throw new Error(field + ' missing ' + id); active.add(id); for (const child of goal[field] ?? []) { edges++; visit(child.replace(raw.landscapeId + ':', '')) } active.delete(id); done.add(id) }; for (const id of candidateGoals.keys()) visit(id); return { nodes: done.size, edges, acyclic: true, allReferencesResolved: true } }
const dagResult = { requires: dag('requires'), contains: dag('contains') }
const bookConfig = read(resolve(repo, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
const qa = read(resolve(repo, bookConfig.goalVisualizationQaPath))
const assetDigests: Record<string, string> = {}
for (const record of qa.records) if (record.visualizationState === 'available') assetDigests[record.imageUrl] = 'sha256:' + sha(resolve(repo, record.publicAssetPath))
const model = (landscape: any, ledger: any, sourceAtlas: any) => {
  const manifest = JSON.parse(sourceAtlas.outputs[bookConfig.compositionViewManifestPath])
  return buildGoalBookModel({ landscape, semanticKindLedger: ledger, compositionViewManifest: manifest, compositionViewSources: manifest.sourcePaths.map((path: string) => ({ path, view: JSON.parse(sourceAtlas.outputs[path]) })), navigationView: JSON.parse(sourceAtlas.outputs[manifest.navigationViewPath]), durationModelPolicy: read(resolve(repo, config.durationModelPolicyPath)), goalVisualizationQa: qa, goalVisualizationAssetDigests: assetDigests, evidenceReviewSources: [], config: bookConfig })
}
const before = model(currentRaw, currentSemantic, old)
const after = model(raw, semantic, atlas)
const oldV6 = input(effective.previousNativeSourceBookReceipt)
if (before.pages.length !== 383 || after.pages.length !== 390) throw new Error('Wrong pure BookModel page count')
const afterPages = new Map<string, any>(after.pages.map((page: any) => [page.goalId, page]))
const oldGoals = new Map<string, any>(currentRaw.goals.map((goal: any) => [goal.id, goal]))
const scopeKeys = (value: any, id: string) => value.receipt.scopes.filter((scope: any) => scope.goalIds.includes(id)).map((scope: any) => scope.key)
const oldRows = before.pages.map((page: any) => {
  const next = afterPages.get(page.goalId)
  return { goalId: page.goalId, wholeGoalExact: JSON.stringify(oldGoals.get(page.goalId)) === JSON.stringify(candidateGoals.get(page.goalId)), pageFingerprintExact: page.pageFingerprint === next.pageFingerprint, goalFingerprintExact: page.goalFingerprint === next.goalFingerprint, sourceMembershipLosses: scopeKeys(old, page.goalId).filter((key: string) => !scopeKeys(atlas, page.goalId).includes(key)) }
})
if (oldRows.some((row: any) => !row.wholeGoalExact || !row.pageFingerprintExact || row.sourceMembershipLosses.length)) throw new Error('Current goal/page/scope loss')
const strictPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json'
const strict = read(resolve(repo, strictPath)).subjects.find((subject: any) => subject.subject.toLowerCase() === 'biologie')
if (strict.strictComplete !== 67 || strict.denominator !== 383) throw new Error('Changed protected report universe')
const protectedRows = oldRows.filter((row: any) => strict.strictCompleteGoalIds.includes(row.goalId))
const proposals = input(effective.sourceViews)
const sourceViewChecks = proposals.views.map((row: any) => {
  const view = normalizeCompositionView(row.view)
  const compiled = compileCompositionView(view, candidateCanonical)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(candidateCanonical.goals.map(goal => [goal.id, goal])))
  const scope = atlas.receipt.scopes.find((value: any) => value.key === row.scope)
  const oldScope = old.receipt.scopes.find((value: any) => value.key === row.scope)
  const sourceIDs = [...scope.goalIds].sort()
  const targetIDs = [...roles.targetGoalIds].sort()
  const missing = (oldScope?.goalIds ?? []).filter((id: string) => !roles.targetGoalIds.has(id))
  if (compiled.findings.some(finding => finding.severity === 'error') || JSON.stringify(sourceIDs) !== JSON.stringify(targetIDs) || missing.length) throw new Error('Incomplete source-scope superset ' + row.scope)
  return { scope: row.scope, currentSourceTargets: oldScope?.goalIds.length ?? 0, candidateSourceTargets: targetIDs.length, missingOldTargets: missing, sourceTargetsExact: true, prerequisiteOnlyGoalIds: [...roles.prerequisiteOnlyGoalIds], registeredGUILevel2View: false }
})
const guiViewChecks = ['curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json', 'curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json'].map(path => {
  const view = normalizeCompositionView(read(resolve(repo, path)))
  const previous = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(currentCanonical.goals.map(goal => [goal.id, goal])))
  const next = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(candidateCanonical.goals.map(goal => [goal.id, goal])))
  const compiled = compileCompositionView(view, candidateCanonical)
  const missing = [...previous.targetGoalIds].filter(id => !next.targetGoalIds.has(id))
  const added = [...next.targetGoalIds].filter(id => !previous.targetGoalIds.has(id))
  if (missing.length || added.length || compiled.findings.some(finding => finding.severity === 'error')) throw new Error('Existing full GUI view changed ' + path)
  return { path, sha256: sha(resolve(repo, path)), currentTargets: previous.targetGoalIds.size, candidateTargets: next.targetGoalIds.size, removedTargets: missing, addedTargets: added, fullExistingTargetsExact: true, sevenNewSourceComponentsStillNeedReviewedSupersetRegistration: true }
})
const oldDeltas = currentRaw.goals.map((goal: any) => ({ goalId: goal.id, fields: [...new Set([...Object.keys(goal), ...Object.keys(candidateGoals.get(goal.id))])].filter(key => JSON.stringify(goal[key]) !== JSON.stringify(candidateGoals.get(goal.id)[key])) })).filter((row: any) => row.fields.length)
if (oldDeltas.length !== 1 || oldDeltas[0].fields.join(',') !== 'contains') throw new Error('Unexpected old canonical delta')
const result = {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'actual isolated v7 author delta probe; not an independent approval',
  sourceAtlas: { current: 383, candidate: 390, expected390NormalContract: 'PASS', countOverrideUsed: false, omittedGoals: atlas.receipt.omittedGoals, scopeCount: atlas.receipt.scopes.length, counts: atlas.receipt.counts, original383Retained: true },
  pureBookModel: { currentPages: before.pages.length, candidatePages: after.pages.length, currentDigest: before.digest, candidateDigest: after.digest, candidateDigestExactlyV6: after.digest === oldV6.nativeBookModel.candidateDigest, noRenderOrFullBuild: true },
  old383PageAndWholeGoalRows: oldRows, protected67Rows: protectedRows, old464CanonicalIDCount: currentRaw.goals.length, candidate472CanonicalIDCount: raw.goals.length, oldWholeDeltas: oldDeltas,
  dag: dagResult, sourceViewChecks, existingFullGUIViewChecks: guiViewChecks,
  newSevenActualNativePages: after.pages.filter((page: any) => newIDs.includes(page.goalId)),
  newSourceWitnesses: atlas.receipt.scopes.map((scope: any) => ({ key: scope.key, newGoalIds: scope.goalIds.filter((id: string) => newIDs.includes(id)), witnesses: scope.witnesses.filter((witness: any) => newIDs.includes(witness.goalId)) })).filter((scope: any) => scope.newGoalIds.length),
  effectiveNativeInputs: atlas.receipt.inputBindings,
  originalInputSymlinks: [...linked].map(path => ({ path, sha256: sha(resolve(repo, path)) })),
  nativeCode: ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookModel.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts', 'app/src/utils/authoring/canonicalAuthoring.ts'].map(path => ({ path, sha256: sha(resolve(repo, path)) })),
  sparseRoot: relative(repo, sparse), fullLandscapeCopies: 0, physicalCanonicalOverlayCount: 1,
  oldWholeSourceHoldsAndStageCourseBoundariesPreserved: true, newNativeD_P_A_M_VApprovals: 0, activeWrites: false, strictGain: 0, restoredActiveBindings: 0, humanApproval: false, humanTrial: false,
}
write(resolve(output, 'native-source390-book383-to390-gui-superset-and-delta.actual.json'), result)
console.log(JSON.stringify({ sourceAtlas: 'PASS390', pureBookPages: [before.pages.length, after.pages.length], old383WholeGoalsAndPagesExact: true, protected67Exact: true, nativeBookDigestExactlyV6: result.pureBookModel.candidateDigestExactlyV6, dag: dagResult, sourceViews: sourceViewChecks.length, existingGUIViews: guiViewChecks.map(row => [row.currentTargets, row.candidateTargets]), activeWrites: false, strictGain: 0 }))
