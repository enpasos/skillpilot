import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { verifyGoalBookSourceAtlasInputs } from './checkGoalBookPublication'
import {
  buildGoalBookSourceAtlasInputs,
  checkGoalBookSourceAtlasInputs,
  compactGoalBookSourceAtlasReceipt,
  expandGoalBookSourceAtlasReceipt,
  readGoalBookSourceAtlasInputConfig,
  sourceAtlasDescendants,
  sourceAtlasFacet,
  type GoalBookSourceAtlasInputConfig,
} from './goalBookSourceAtlasInputs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const testGoalBookSourceAtlasInputs = (): void => {
  assert.deepEqual(sourceAtlasFacet([{ stage: 'Sekundarstufe I' }], 'stage'), ['SekI'])
  assert.deepEqual(sourceAtlasFacet([{ tags: ['phase:SekI'] }, { stage: 'SekI+SekII' }], 'stage'), ['SekI'])
  assert.deepEqual(sourceAtlasFacet([{ phase: 'Q1', title: 'LK', core: false }], 'stage'), [])
  assert.deepEqual(sourceAtlasFacet([{ stage: 'SekI+SekII' }], 'stage'), [])
  assert.equal(sourceAtlasFacet([{ stage: 'SekI' }, { stage: 'SekII' }], 'stage'), null)
  assert.deepEqual(sourceAtlasFacet([{ courseLevel: 'GK_LK+LK' }], 'courseProfile'), ['GK', 'LK'])
  assert.deepEqual(sourceAtlasFacet([{ courseLevel: 'both' }, { courseLevel: 'LK' }], 'courseProfile'), ['LK'])
  assert.deepEqual(sourceAtlasFacet([{ courseLevel: 'unspecified' }], 'courseProfile'), [])
  assert.equal(sourceAtlasFacet([{ courseLevel: 'GK' }, { courseLevel: 'LK' }], 'courseProfile'), null)
  const tree = new Map([
    ['root', { id: 'root', contains: ['ordinary', 'boundary', 'excluded'] }],
    ['ordinary', { id: 'ordinary', contains: [] }],
    ['boundary', { id: 'boundary', contains: ['supplement'], extendedData: { applicabilityMappingInheritance: 'boundary' } }],
    ['supplement', { id: 'supplement', contains: [] }],
    ['excluded', { id: 'excluded', contains: [], extendedData: { applicabilityProjection: 'excluded' } }],
  ])
  const atomIds = new Set(['ordinary', 'supplement', 'excluded'])
  assert.deepEqual(sourceAtlasDescendants('root', tree, atomIds, 'landscape'), ['ordinary'])
  assert.deepEqual(sourceAtlasDescendants('boundary', tree, atomIds, 'landscape'), ['supplement'])
  assert.throws(() => sourceAtlasDescendants('unknown', tree, atomIds, 'landscape'), /Unknown mapped canonical target/)

  // A private fixture verifies failures without touching canonical/source/public files.
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'skillpilot-source-atlas-test-'))
  const write = (path: string, value: unknown) => {
    const absolute = resolve(fixtureRoot, path)
    mkdirSync(dirname(absolute), { recursive: true })
    writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`)
  }
  try {
    const actual = readGoalBookSourceAtlasInputConfig('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json', root)
    const config: GoalBookSourceAtlasInputConfig = { ...actual, sourceDocumentSnapshots: [], expectedJurisdictions: ['DE-HE'], expectedCurricularAtomicGoalCount: 1, mappingPaths: ['mapping.json'], landscapePath: 'landscape.json', semanticKindLedgerPath: 'ledger.json', durationModelPolicyPath: 'duration.json' }
    const goal = { id: '00000000-0000-4000-8000-000000000001', title: 'Fixture', description: 'Fixture', type: 'atomic', contains: [], requires: [], phase: 'Q1', courseLevel: 'LK' }
    const landscape = { landscapeId: '00000000-0000-4000-8000-000000000002', title: 'Biologie', subject: 'Biologie', goals: [goal] }
    const mapping = { sourceLandscapeId: 'fixture-source', targetLandscapeId: landscape.landscapeId, sourceExtractionPath: 'source.json', decisions: [{ sourceGoalId: 'source-goal', decision: 'mapped', canonicalGoalIds: [goal.id], reviewer: 'existing-fixture-review', reviewedAt: '2026-01-01', rationale: 'Fixture only' }], mappings: [{ legacyGoalId: 'ignored', canonicalGoalId: 'not-a-goal' }] }
    const source = { sourceLandscapeId: 'fixture-source', subject: 'Biologie', jurisdiction: 'DE-HE', stage: 'SekI', sourceDocument: { key: 'doc', path: 'doc.txt', official: true, title: 'Fixture document', url: 'https://example.org/source' }, sourceGoals: [{ id: 'source-goal', sourceRef: 'Fixture passage' }] }
    write('landscape.json', landscape)
    write('ledger.json', { sourceLandscapeId: landscape.landscapeId, decisions: [{ goalId: goal.id, semanticKind: 'curricularAtomic', decisionStatus: 'authoritative', sourceFingerprint: fingerprintSemanticKindSourceGoal(goal) }] })
    const duration = JSON.parse(readFileSync(resolve(root, actual.durationModelPolicyPath), 'utf8'))
    duration.decisions = duration.decisions.filter((d: { subject: string, jurisdiction: string }) => d.subject === 'Biologie' && d.jurisdiction === 'DE-HE')
    write('duration.json', duration)
    write('mapping.json', mapping)
    write('source.json', source)
    write('doc.txt', 'fixture source bytes')
    const pdfPath = 'curricula/DE/Gymnasium/input/HE/fixture.pdf'
    const snapshot = { path: pdfPath, url: source.sourceDocument.url, sha256: `sha256:${createHash('sha256').update(readFileSync(resolve(fixtureRoot, 'doc.txt'))).digest('hex')}` }
    const snapshotConfig = { ...config, sourceDocumentSnapshots: [snapshot] }
    write('source.json', { ...source, sourceDocument: { ...source.sourceDocument, path: pdfPath } })
    // A clean checkout has no ignored PDF downloads and must derive identical bytes.
    const offline = buildGoalBookSourceAtlasInputs(snapshotConfig, fixtureRoot)
    write(pdfPath, 'fixture source bytes')
    assert.deepEqual(buildGoalBookSourceAtlasInputs(snapshotConfig, fixtureRoot), offline)
    write(pdfPath, 'corrupted local cache')
    assert.throws(() => buildGoalBookSourceAtlasInputs(snapshotConfig, fixtureRoot), /Source document snapshot mismatch/)
    rmSync(resolve(fixtureRoot, pdfPath))
    assert.throws(() => buildGoalBookSourceAtlasInputs(config, fixtureRoot), /ENOENT/)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...snapshotConfig, sourceDocumentSnapshots: [snapshot, snapshot] }, fixtureRoot), /Duplicate source document snapshot/)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...snapshotConfig, sourceDocumentSnapshots: [{ ...snapshot, sha256: 'sha256:invalid' }] }, fixtureRoot), /Invalid source snapshot digest/)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...snapshotConfig, sourceDocumentSnapshots: [{ ...snapshot, url: 'https://example.org/wrong-source' }] }, fixtureRoot), /Source snapshot URL mismatch/)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...snapshotConfig, sourceDocumentSnapshots: [snapshot, { ...snapshot, path: 'curricula/DE/Gymnasium/input/HE/unused.pdf' }] }, fixtureRoot), /Unused source document snapshot/)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...snapshotConfig, sourceDocumentSnapshots: [{ ...snapshot, path: 'curricula/DE/Gymnasium/input/../outside.pdf' }] }, fixtureRoot), /Invalid source snapshot path/)
    rmSync(resolve(fixtureRoot, 'source.json'))
    assert.throws(() => buildGoalBookSourceAtlasInputs(snapshotConfig, fixtureRoot), /ENOENT/, 'A snapshot must never replace the required source extraction')
    const htmlPath = 'curricula/DE/Gymnasium/quality/goal-evidence/fixture/primary/official.html'
    const htmlBytes = '<!doctype html><html><body>Reviewed official source fixture</body></html>\n'
    const htmlSnapshot = { path: htmlPath, url: source.sourceDocument.url, sha256: `sha256:${createHash('sha256').update(htmlBytes).digest('hex')}` }
    const htmlConfig = { ...config, sourceDocumentSnapshots: [htmlSnapshot] }
    assert.throws(() => buildGoalBookSourceAtlasInputs(htmlConfig, fixtureRoot), /ENOENT/, 'An HTML snapshot must never replace the required source extraction')
    write('source.json', { ...source, sourceDocument: { ...source.sourceDocument, path: htmlPath } })
    const offlineHtml = buildGoalBookSourceAtlasInputs(htmlConfig, fixtureRoot)
    mkdirSync(dirname(resolve(fixtureRoot, htmlPath)), { recursive: true })
    writeFileSync(resolve(fixtureRoot, htmlPath), htmlBytes)
    assert.deepEqual(buildGoalBookSourceAtlasInputs(htmlConfig, fixtureRoot), offlineHtml, 'A matching HTML download must preserve the exact offline derivation')
    writeFileSync(resolve(fixtureRoot, htmlPath), '<html>Corrupted download</html>\n')
    assert.throws(() => buildGoalBookSourceAtlasInputs(htmlConfig, fixtureRoot), /Source document snapshot mismatch/)
    rmSync(resolve(fixtureRoot, htmlPath))
    assert.throws(() => buildGoalBookSourceAtlasInputs(config, fixtureRoot), /ENOENT/, 'An undeclared HTML source document remains a required input')
    for (const path of [
      'app/official.html',
      'curricula/DE/other/official.html',
      'curricula/DE/Gymnasium/../official.html',
      'curricula/DE/Gymnasium/./quality/official.html',
      'curricula/DE/Gymnasium//quality/official.html',
      'curricula/DE/Gymnasium/quality/official.json',
    ]) {
      assert.throws(() => buildGoalBookSourceAtlasInputs({ ...htmlConfig, sourceDocumentSnapshots: [{ ...htmlSnapshot, path }] }, fixtureRoot), /Invalid source snapshot path/)
    }
    write('source.json', source)
    rmSync(resolve(fixtureRoot, 'doc.txt'))
    assert.throws(() => buildGoalBookSourceAtlasInputs(config, fixtureRoot), /ENOENT/, 'Non-snapshot source inputs remain mandatory')
    write('doc.txt', 'fixture source bytes')
    write('config.json', config)
    const initial = buildGoalBookSourceAtlasInputs(config, fixtureRoot)
    assert.deepEqual(initial.receipt.scopes.map(s => [s.stage, s.courseProfile]), [['SekI', null]], 'Canonical Q1/LK metadata must not infer source scope')
    for (const [path, bytes] of Object.entries(initial.outputs)) {
      mkdirSync(dirname(resolve(fixtureRoot, path)), { recursive: true })
      writeFileSync(resolve(fixtureRoot, path), bytes)
    }
    checkGoalBookSourceAtlasInputs('config.json', fixtureRoot)
    write('book.inputs.json', config)
    write('book.json', {
      bookId: config.bookId,
      landscapePath: config.landscapePath,
      semanticKindLedgerPath: config.semanticKindLedgerPath,
      compositionViewManifestPath: config.manifestPath,
    })
    const publication = { bookId: config.bookId, configPath: resolve(fixtureRoot, 'book.json') }
    verifyGoalBookSourceAtlasInputs(publication, fixtureRoot)
    write('doc.txt', 'changed bytes')
    assert.throws(() => checkGoalBookSourceAtlasInputs('config.json', fixtureRoot), /Stale generated atlas input/)
    assert.throws(() => verifyGoalBookSourceAtlasInputs(publication, fixtureRoot), (error: unknown) =>
      error instanceof Error && error.message.includes('Stale generated atlas input:')
      && error.message.includes('source-projection.receipt.json') && error.message.length < 500,
    'publication preflight rejects stale source bindings before rendering with a bounded file-specific error')
    write('doc.txt', 'fixture source bytes')
    write('source.json', { ...source, stage: 'SekII' })
    assert.throws(() => buildGoalBookSourceAtlasInputs(config, fixtureRoot), /Source-scope uncertainty changed/)
    write('source.json', { ...source, sourceLandscapeId: 'wrong-source' })
    assert.throws(() => buildGoalBookSourceAtlasInputs(config, fixtureRoot), /Source landscape mismatch/)
    write('source.json', source)
    write('mapping.json', { ...mapping, decisions: [] })
    assert.throws(() => buildGoalBookSourceAtlasInputs(config, fixtureRoot), /Incomplete source decision coverage/)
    write('mapping.json', mapping)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...config, navigationViewPath: 'curricula/global.view.json' }, fixtureRoot), /must remain book-local/)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...config, navigationViewPath: 'app/scripts/config/goal-books/../../outside.view.json' }, fixtureRoot), /must remain book-local/)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...config, subject: 'Chemie' }, fixtureRoot), /Canonical landscape subject mismatch/)
    assert.throws(() => buildGoalBookSourceAtlasInputs({ ...config, fallbackViewPaths: ['curricula/DE/Gymnasium/composition-views/chemie/de-bb-gk.view.json'] }, fixtureRoot), /authorized only for Chemistry/)
    const fallbackPath = 'curricula/DE/Gymnasium/composition-views/chemie/de-bb-gk.view.json'
    const chemistryConfig = { ...config, subject: 'Chemie', fallbackViewPaths: [fallbackPath] }
    write('landscape.json', { ...landscape, subject: 'Chemie' })
    const fallback = { viewId: 'fixture-authored-gk', landscapeId: landscape.landscapeId, scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BB', stage: 'SekII', courseProfile: 'GK' }, rootNodes: [{ kind: 'goalEntry', goalId: goal.id }] }
    for (const [change, error] of [
      [{ jurisdiction: 'DE-BY' }, /Unsupported fallback jurisdiction/],
      [{ stage: 'SekI' }, /Invalid fallback stage/],
      [{ courseProfile: 'unspecified' }, /Invalid fallback course/],
      [{ durationModel: 'G8' }, /Unexpected fallback duration/],
    ] as const) {
      write(fallbackPath, { ...fallback, scope: { ...fallback.scope, ...change } })
      assert.throws(() => buildGoalBookSourceAtlasInputs(chemistryConfig, fixtureRoot), error)
    }
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true })
  }

  const biology = checkGoalBookSourceAtlasInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json', root)
  // The reviewed current universe has four new atoms and two former atoms
  // converted to clusters. The source atlas must publish the current397 atoms.
  assert.deepEqual(biology.receipt.counts, { canonicalCurricularAtomicGoals: 397, publishedCurricularAtomicGoals: 397, sourceViews: 24, unresolvedSourceScopeDecisions: 0, omittedGoals: 0 })
  const reflectionGoalId = '55036b74-af78-5217-9e43-c5bdc975c958'
  const hbReflectionSourceId = 'hb-biology-seki-bp2006-2022-3-1-koerperleistungen-gesundheit-037-a47d64cd'
  const hbAddictionSourceId = 'hb-biology-seki-bp2006-2022-3-2-sinne-wahrnehmung-051-a74ab90c'
  assert.deepEqual(biology.receipt.scopes.filter(s => s.goalIds.includes(reflectionGoalId)).map(s => s.key), ['DE-HB/SekI/'])
  const reflectionWitnesses = biology.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.goalId === reflectionGoalId))
  assert.deepEqual(reflectionWitnesses.map(w => [w.sourceGoalId, w.mappedTargetGoalId, w.coverage]), [
    [hbReflectionSourceId, reflectionGoalId, 'direct'],
  ], 'HB037 must cover reflection on nature objects, without importing broader health or method competencies')
  // General health/drug operators do not establish these two specific
  // competencies; the genuine current-context reviews retain that boundary.
  for (const goalId of ['0e1065b9-9d1d-5299-b900-32c74d352e56', 'a6f57e17-9f0c-5327-91bc-c6f31ff375a2']) {
    assert.deepEqual(biology.receipt.scopes.filter(s => s.goalIds.includes(goalId)).map(s => s.key), [
      'DE-BY/SekI/', 'DE-HB/SekI/', 'DE-MV/SekI/', 'DE-SN/SekI/', 'DE-ST/SekI/', 'DE-TH/SekI/',
    ], `${goalId}: no unsupported HE or HH source scope`)
  }
  // Removing a false direct or inherited witness must not remove the goal's
  // other, independently supported routes or reintroduce the false witness.
  for (const [scopeKey, sourceGoalId, goalId] of [
    ['DE-HB/SekI/', hbReflectionSourceId, '26aa47b7-e5cc-5131-8980-0ec3271758b6'],
    ['DE-HB/SekI/', hbReflectionSourceId, '6ae33a8e-874c-53ee-858f-c64f1848cfbc'],
    ['DE-HB/SekI/', hbAddictionSourceId, '3d822550-c14a-52ee-9908-6bcb873afdd6'],
    ['DE-HB/SekI/', hbAddictionSourceId, '5a5eeff5-ae97-5b5b-bc80-df03eba8e095'],
    ['DE-HB/SekI/', hbAddictionSourceId, '5dd66bfd-616f-5a2a-be7c-49aaf12581a0'],
  ]) {
    const scope = biology.receipt.scopes.find(s => s.key === scopeKey)!
    assert.ok(scope.goalIds.includes(goalId), `${goalId}: valid source routes remain available`)
    assert.ok(scope.witnesses.every(w => w.goalId !== goalId || w.sourceGoalId !== sourceGoalId), `${goalId}: no false HB source witness`)
  }
  const flowerOnlySource = biology.receipt.scopes.find(s => s.key === 'DE-SL/SekI/')!
  assert.ok(flowerOnlySource.goalIds.includes('4e12ba43-a58c-5611-8c43-3cc0c8465e33'), 'Other reviewed routes still cover animal development')
  assert.ok(flowerOnlySource.witnesses.every(w => w.goalId !== '4e12ba43-a58c-5611-8c43-3cc0c8465e33' || w.sourceGoalId !== 'sl-biology-seki-nw56-2012-pfl5-003-b5650cc6'), 'A flower operator must not cover animal development')
  // Current independent source reviews correct the selected neurobiology and
  // genetic-method scopes without closing broad source HOLDs. HE Q1.2 vector
  // methods are an elevated-course operator, so their old GK route is removed.
  assert.deepEqual(biology.receipt.scopes.filter(s => s.stage === 'SekII').map(s => [s.key, s.goalIds.length]), [
    ['DE-BY/SekII/GK', 93], ['DE-BY/SekII/LK', 123], ['DE-HE/SekII/GK', 80], ['DE-HE/SekII/LK', 160],
    ['DE-SH/SekII/GK', 1], ['DE-SH/SekII/LK', 1],
    ['DE-ST/SekII/GK', 6], ['DE-ST/SekII/LK', 6],
  ])
  // Technical carrier successors keep the official source identity. Select the
  // active carrier from its config and extraction instead of a dated filename.
  const biologyInputConfig = readGoalBookSourceAtlasInputConfig('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json', root)
  type BiologySourceMapping = {
    sourceLandscapeId: string
    sourceExtractionPath: string
    mappings: { legacyGoalId: string; canonicalGoalId: string; matchType: string }[]
    decisions: { sourceGoalId: string; canonicalGoalIds: string[]; matchType: string }[]
  }
  const currentBiologyMapping = (sourceLandscapeId: string, jurisdiction: string, stage: string) => {
    const candidates = biologyInputConfig.mappingPaths.map(path => ({
      path,
      mapping: JSON.parse(readFileSync(resolve(root, path), 'utf8')) as BiologySourceMapping,
    })).filter(({ mapping }) => mapping.sourceLandscapeId === sourceLandscapeId)
      .filter(({ mapping }) => {
        const extraction = JSON.parse(readFileSync(resolve(root, mapping.sourceExtractionPath), 'utf8'))
        assert.equal(extraction.sourceLandscapeId, sourceLandscapeId, 'Active carrier must retain the exact official source identity')
        return extraction.jurisdiction === jurisdiction && extraction.subject === 'Biologie' && extraction.stage === stage
      })
    assert.equal(candidates.length, 1, `${sourceLandscapeId}: one active carrier for the exact source, jurisdiction and stage`)
    return candidates[0]
  }
  const heBiologyMappingPath = currentBiologyMapping('3e56aa75-c76c-4de5-883b-0aac98297846', 'DE-HE', 'SekII').path
  const heVectorGoalId = '528a3cd3-4a4d-550d-939a-8dc8656446e4'
  const heVectorSourceGoalId = '46f4ea54-367f-4f40-b3f2-0d7fd4dff90e'
  const heGk = biology.receipt.scopes.find(s => s.key === 'DE-HE/SekII/GK')!
  const heLk = biology.receipt.scopes.find(s => s.key === 'DE-HE/SekII/LK')!
  assert.ok(!heGk.goalIds.includes(heVectorGoalId), 'HE Q1.2 LK vector methods must not create a GK target')
  assert.ok(heGk.witnesses.every(w => w.sourceGoalId !== heVectorSourceGoalId), 'The elevated-course source must provide no GK witness')
  assert.ok(heLk.goalIds.includes(heVectorGoalId), 'The independently reviewed HE LK route must remain available')
  assert.deepEqual(heLk.witnesses.filter(w => w.goalId === heVectorGoalId && w.sourceGoalId === heVectorSourceGoalId).map(w => [w.sourceGoalId, w.mappedTargetGoalId, w.mappingPath]), [[
    heVectorSourceGoalId, heVectorGoalId,
    heBiologyMappingPath,
  ]], 'Retain the exact bounded HE source contribution without whole-course approval')
  for (const formerAtomId of ['523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0', 'd11b3b18-deec-5d1a-bff6-512cddf595a2']) {
    assert.ok(biology.receipt.scopes.every(s => !s.goalIds.includes(formerAtomId)), 'A current cluster must never be published as a curricular atomic target')
  }
  // The corrected HE source operator provides no direct gene-flow witness.
  // The independently reviewed SH E13/E15 component supplies only this bounded
  // supplemental route through its active mapping; no whole-course approval.
  const geneFlowGoalId = 'e5f97788-c2ac-5f42-b5a5-55605b563a79'
  const geneFlowMappingPath = 'curricula/DE/Gymnasium/mapping/DE-SH/source-components/sh_biology_gene_flow_bounded_source_contribution.reviewed-20261009-v1.review.json'
  assert.deepEqual(biology.receipt.scopes.filter(s => s.goalIds.includes(geneFlowGoalId)).map(s => s.key), [
    'DE-SH/SekII/GK', 'DE-SH/SekII/LK',
  ])
  for (const key of ['DE-SH/SekII/GK', 'DE-SH/SekII/LK']) {
    const scope = biology.receipt.scopes.find(s => s.key === key)!
    assert.deepEqual(scope.goalIds, [geneFlowGoalId], 'The SH source component must not import the whole evolution branch')
    assert.deepEqual(scope.witnesses.map(w => [w.sourceGoalId, w.mappedTargetGoalId, w.coverage, w.profileBasis]), [
      ['sh-biology-sekii-fa2023-e13-e15-migration-genfluss-source-component', geneFlowGoalId, 'direct', 'source-metadata'],
    ], 'Gene flow must retain its exact SH E13/E15 source operator')
    assert.deepEqual(scope.witnesses.map(w => w.mappingPath), [geneFlowMappingPath],
      'A book-local author candidate must not replace the active independently reviewed SH mapping')
  }
  for (const key of ['DE-HE/SekII/GK', 'DE-HE/SekII/LK']) {
    const scope = biology.receipt.scopes.find(s => s.key === key)!
    assert.ok(scope.witnesses.every(w => w.goalId !== geneFlowGoalId), 'An authored HE transfer must not be presented as a direct source witness')
  }
  // The reviewed BY chromatography duty does not cover light-harvesting
  // complex structure/function; retain its removal from both source routes.
  const lightHarvestingGoalId = 'ec782ce3-475e-5628-b3fe-947d72e74a74'
  for (const key of ['DE-BY/SekII/GK', 'DE-BY/SekII/LK']) {
    const scope = biology.receipt.scopes.find(s => s.key === key)!
    assert.ok(!scope.goalIds.includes(lightHarvestingGoalId), `Chromatography must not place light-harvesting complexes in ${key}`)
    assert.ok(scope.witnesses.every(w => w.goalId !== lightHarvestingGoalId), `No false light-harvesting source witness in ${key}`)
  }
  // Direct source scope remains bounded: prerequisite availability does not
  // become source coverage; ST's common entry phase is projected into both
  // technical upper-secondary course routes, never into its SekI target set.
  for (const [goalId, expectedScopes] of [
    ['0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', ['DE-BB/SekI/', 'DE-BE/SekI/', 'DE-MV/SekI/', 'DE-NW/SekI/', 'DE-SH/SekI/', 'DE-SN/SekI/', 'DE-ST/SekI/', 'DE-TH/SekI/']],
    ['32483d30-2162-50a5-a6cc-05b7f2467ab1', ['DE-SN/SekI/']],
    ['ac9e824f-003c-50ac-8751-2b8456004c63', ['DE-BB/SekI/', 'DE-BE/SekI/']],
    ['5eb7c923-469d-5934-b1e8-292e1bb40d95', ['DE-SN/SekI/', 'DE-TH/SekI/']],
    ['bfb5dfb6-8e35-5452-b581-96e061d8b826', ['DE-ST/SekII/GK', 'DE-ST/SekII/LK']],
    ['3a0d6c82-f9f0-5ad1-bb0b-b948e4450d04', ['DE-MV/SekI/', 'DE-ST/SekII/GK', 'DE-ST/SekII/LK']],
    ['9d830422-acc7-5fa8-aee9-4dae4cedbf49', ['DE-MV/SekI/']],
    ['d0c3e6a7-581b-57bd-8027-e940c6b77af8', ['DE-MV/SekI/', 'DE-SN/SekI/', 'DE-ST/SekII/GK', 'DE-ST/SekII/LK', 'DE-TH/SekI/']],
    ['aab2a358-b2ee-57a5-a957-8fb9845506b1', ['DE-TH/SekI/']],
    // HE's reviewed common sensory-organ operator supports these bounded
    // visual/auditory routes; its brain overview belongs only to LK.
    ['146d70e0-b494-59fa-b8b6-29da18b36893', ['DE-BY/SekI/', 'DE-HE/SekII/GK', 'DE-HE/SekII/LK']],
    ['97a15c19-c345-589e-8b3c-9f2b97a60095', ['DE-BY/SekI/', 'DE-HE/SekII/GK', 'DE-HE/SekII/LK']],
    ['2706c28e-1c21-50de-8a63-c450f5fe8b07', ['DE-BY/SekI/', 'DE-HE/SekII/LK', 'DE-MV/SekI/', 'DE-SN/SekI/', 'DE-ST/SekI/', 'DE-TH/SekI/']],
    ['4f631f78-e13a-58e5-9092-f4db0b8d377a', ['DE-BY/SekII/LK', 'DE-HE/SekII/LK']],
    ['8b23f8fb-555d-5720-b5f2-dd6f28a0e786', ['DE-BY/SekII/LK']],
    ['97b24279-def0-5ce6-8726-a1cac9cd38ad', ['DE-BY/SekII/LK', 'DE-HE/SekII/LK']],
    ['9b966664-906b-5a5d-8008-cae18de043aa', ['DE-BY/SekII/GK', 'DE-BY/SekII/LK']],
    ['485ef1c3-8997-52b7-91f5-b1ddf179013d', ['DE-BY/SekII/LK', 'DE-HE/SekII/LK']],
    ['afde0001-d7d7-5ed3-8a60-383e8da5620e', ['DE-HE/SekII/LK']],
    ['11675f1a-5de2-5926-be78-1e8275f19f5b', ['DE-BY/SekII/LK']],
    ['a46cafde-7359-5249-8754-19aaa3174ba4', ['DE-BY/SekII/LK', 'DE-HE/SekII/LK']],
    ['c9a06264-cce2-54dd-9604-46dd5949f02e', ['DE-BY/SekII/LK', 'DE-HE/SekII/LK']],
    ['f6280154-d57c-599c-94bf-73313005a6df', ['DE-BY/SekII/GK', 'DE-BY/SekII/LK', 'DE-HE/SekII/GK', 'DE-HE/SekII/LK']],
    // BY names the PCR mechanism within its replication/PCR comparison.
    ['a3f483ce-126e-595c-999c-aa4d95106221', ['DE-BY/SekII/GK', 'DE-BY/SekII/LK', 'DE-HE/SekII/GK', 'DE-HE/SekII/LK']],
  ] as const) {
    assert.deepEqual(biology.receipt.scopes.filter(s => s.goalIds.includes(goalId)).map(s => s.key), expectedScopes, `${goalId}: exact independently reviewed source scope`)
    assert.ok(biology.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.goalId === goalId)).every(w => w.coverage === 'direct'), `${goalId}: no inherited source-coverage claim`)
  }
  const pcrGoalId = 'a3f483ce-126e-595c-999c-aa4d95106221'
  const byPcrSourceGoalId = '2170fbb3-d82f-56d1-bf7e-03f1cf9a3146'
  const { path: byBiologyMappingPath, mapping: byBiologyMapping } = currentBiologyMapping(
    '357a7003-b636-570e-a0bd-6bb63518d2f6', 'DE-BY', 'SekI+SekII',
  )
  assert.deepEqual(byBiologyMapping.mappings.filter(row => row.canonicalGoalId === pcrGoalId)
    .map(row => [row.legacyGoalId, row.canonicalGoalId, row.matchType]), [
    [byPcrSourceGoalId, pcrGoalId, 'partial'],
  ], 'BY PCR requires its explicit mechanism contribution; broad method mappings cannot supply it')
  for (const key of ['DE-BY/SekII/GK', 'DE-BY/SekII/LK']) {
    const scope = biology.receipt.scopes.find(s => s.key === key)!
    assert.deepEqual(scope.witnesses.filter(w => w.goalId === pcrGoalId)
      .map(w => [w.sourceGoalId, w.mappedTargetGoalId, w.coverage, w.profileBasis, w.mappingPath]), [
      [byPcrSourceGoalId, pcrGoalId, 'direct', 'source-metadata', byBiologyMappingPath],
    ], 'Retain the direct PCR-principle witness without inherited or complete-comparison coverage')
  }
  // Phylogenetic tree construction and human-family pedigrees use distinct
  // original operators. Preserve the genuine partial reroute and the separate
  // family operator without converting either into whole-source coverage.
  const phylogeneticSourceGoalId = '550a30ba-48e0-5822-8733-38683473e37e'
  const phylogeneticConstructionGoalId = '35b016d8-ed2c-570c-ab64-ac39f8f962b2'
  const familySourceGoalId = 'f368e24c-c167-5f00-82ba-2bbab5597740'
  const familyPedigreeGoalId = '440854be-7f06-5678-91cb-ba8dcab56959'
  for (const [sourceGoalId, goalId, matchType] of [
    [phylogeneticSourceGoalId, phylogeneticConstructionGoalId, 'partial'],
    [familySourceGoalId, familyPedigreeGoalId, 'exact'],
  ] as const) {
    assert.deepEqual(byBiologyMapping.mappings.filter(row => row.legacyGoalId === sourceGoalId)
      .map(row => [row.canonicalGoalId, row.matchType]), [[goalId, matchType]],
    'The actual original source operator must retain its reviewed individual target and coverage limit')
    assert.deepEqual(byBiologyMapping.decisions.filter(row => row.sourceGoalId === sourceGoalId)
      .map(row => [row.canonicalGoalIds, row.matchType]), [[[goalId], matchType]],
    'Source decision and materialized mapping must agree without broadening the operator')
    for (const key of ['DE-BY/SekII/GK', 'DE-BY/SekII/LK']) {
      const scope = biology.receipt.scopes.find(s => s.key === key)!
      assert.deepEqual(scope.witnesses.filter(w => w.sourceGoalId === sourceGoalId)
        .map(w => [w.goalId, w.mappedTargetGoalId, w.coverage, w.profileBasis, w.mappingPath]), [
        [goalId, goalId, 'direct', 'source-metadata', byBiologyMappingPath],
      ], 'The source must provide exactly its direct reviewed contribution in both BY profiles')
    }
  }
  assert.ok(biology.receipt.scopes.every(scope => scope.witnesses.every(w =>
    w.sourceGoalId !== phylogeneticSourceGoalId || w.goalId !== familyPedigreeGoalId)),
  'The phylogenetic tree operator must never supply human-family pedigree coverage')
  // The reviewed gel-method binding adds this existing atom to both BY profiles.
  const gelGoalId = '8eb86a82-122d-5cae-8f80-bb2850b29c2f'
  for (const key of ['DE-BY/SekII/GK', 'DE-BY/SekII/LK']) {
    const scope = biology.receipt.scopes.find(s => s.key === key)!
    assert.ok(scope.goalIds.includes(gelGoalId), `Gelelektrophorese must remain in ${key}`)
    assert.deepEqual(scope.witnesses.filter(w => w.goalId === gelGoalId).map(w => [w.sourceGoalId, w.mappedTargetGoalId, w.coverage, w.profileBasis]), [
      ['43240b1a-10e4-5c51-ad89-92dbed53d3f1', gelGoalId, 'direct', 'source-metadata'],
    ], 'The gel-method scope must retain its direct GA/EA source witness')
  }
  assert.ok(biology.receipt.scopes.filter(s => s.stage === 'SekII').every(s => s.witnesses.every(w => w.coverage === 'direct')), 'No coarse mapped-cluster inheritance into biology GK/LK')
  const chemistry = checkGoalBookSourceAtlasInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json', root)
  // Three reviewed content atoms replace one former compound atom (+2).
  // The source atlas publishes HE LK use and ascorbic-acid analysis; the authored
  // quantitative paraben transfer remains explicitly outside source coverage.
  // B007 adds six reviewed content atoms in place of two compound atoms (+4).
  // Current447 retains own acquisition separately: five new source-backed goals enter;
  // the salicylate production goal loses the moved societal drug-impact witness.
  // Current450 retains the three distinct HB industrial-sugar/fat duties.
  // The later independently reviewed source bindings add ten existing atoms;
  // The integrated RP elective quality, SN GK film-fixing and TH LK comparison
  // source bindings add three existing atoms. Current454 retains the reviewed
  // source additions and the narrow ST Q-method correction. Current455 adds
  // the ester property atom and preserves its reviewed source components;
  // 32 goals remain omitted and all504 source-scope HOLDs remain.
  assert.deepEqual(chemistry.receipt.counts, { canonicalCurricularAtomicGoals: 455, publishedCurricularAtomicGoals: 423, sourceViews: 48, unresolvedSourceScopeDecisions: 504, omittedGoals: 32 })
  const stEnergyGoalId = '87d8cc68-fe82-5273-9e43-c18b566ecb6c'
  const stMathematicalMethodsSourceId = 'st-chemistry-sekii-process-standard-q-e-mathematical-methods'
  assert.deepEqual(chemistry.receipt.scopes.filter(scope => scope.jurisdiction === 'DE-ST')
    .flatMap(scope => scope.witnesses.filter(w => w.goalId === stEnergyGoalId)
      .map(w => [scope.key, w.sourceGoalId, w.mappedTargetGoalId, w.coverage, w.profileBasis])), [
    ['DE-ST/SekII/GK', stMathematicalMethodsSourceId, stEnergyGoalId, 'direct', 'source-metadata'],
    ['DE-ST/SekII/LK', stMathematicalMethodsSourceId, stEnergyGoalId, 'direct', 'source-metadata'],
  ], 'ST supports only the reviewed Q lambda/DeltaE method component; chromatography supplies no87d8 witness')
  assert.ok(!chemistry.receipt.scopes.find(scope => scope.key === 'DE-ST/SekI/')!.goalIds.includes(stEnergyGoalId),
    'The unsupported chromatography relation must not retain87d8 in the ST SekI source projection')
  // Keep the reviewed C10 child routes when newer process-competency mappings
  // are integrated. Visibility inherited from their parent cannot replace
  // these direct, bounded source witnesses.
  const byChemistryMappingPath = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.b007-normal-source-scope-20261011-v1.review.json'
  const byChemistryMapping = JSON.parse(readFileSync(resolve(root, byChemistryMappingPath), 'utf8')) as {
    mappings: { legacyGoalId: string; canonicalGoalId: string; matchType: string }[]
    decisions: { sourceGoalId: string; canonicalGoalIds: string[] }[]
  }
  const bySekI = chemistry.receipt.scopes.find(s => s.key === 'DE-BY/SekI/')!
  for (const [goalId, sourceGoalId, matchType] of [
    ['597ac03c-d25f-5c34-a87c-52c059c87295', '7b5310e2-3b69-5a45-8966-f8523ea42fb9', 'partial'],
    ['9751b6d8-cde3-527b-b37c-babb6cee79d2', '7c68f201-5b73-5b1f-8576-cc1a23fafb83', 'exact'],
  ] as const) {
    assert.deepEqual(byChemistryMapping.mappings.filter(row => row.legacyGoalId === sourceGoalId
      && row.canonicalGoalId === goalId).map(row => row.matchType), [matchType],
    'A later integration must retain the independently reviewed C10 child mapping')
    assert.deepEqual(byChemistryMapping.decisions.filter(row => row.sourceGoalId === sourceGoalId)
      .map(row => row.canonicalGoalIds), [['08b44b8f-e407-5a1f-82dc-e70e598022cf', goalId]],
    'The source decision must retain its reviewed child without importing its sibling')
    assert.deepEqual(bySekI.witnesses.filter(w => w.sourceGoalId === sourceGoalId
      && w.mappedTargetGoalId === goalId).map(w => [w.goalId, w.coverage, w.profileBasis, w.mappingPath]),
    [[goalId, 'direct', 'source-metadata', byChemistryMappingPath]],
    'A direct C10 child witness must survive alongside historical parent routing')
  }
  // HB232 adds distinct reviewed partial source contributions. The original
  // BW operators retain their own exact scopes and direct identity.
  for (const [goalId, sourceGoalId, scopes, hbSourceGoalIds, heStandardId] of [
    ['d2d735de-bede-5310-8aeb-8bb7562c7b75', 'bw-chem-sekii-3-3-2-b07-a01-2cd72615', ['DE-BW/SekII/GK', 'DE-BW/SekII/LK'], ['hb-chemistry-sekii-gyo2022-clause-p22-1.1-process-gk_lk-01'], 'he-chemistry-sekii-kc2024-current2026-standard-e5'],
    ['a0f6ba09-f072-5887-a797-fa369453c62a', 'bw-chem-sekii-3-4-2-b06-a01-99efae9b', ['DE-BW/SekII/LK'], [], 'he-chemistry-sekii-kc2024-current2026-standard-s15'],
    ['7b39fa19-fec3-575e-9324-a3226b703358', 'bw-chem-sekii-3-4-7-b06-a01-46c58b93', ['DE-BW/SekII/LK'], ['hb-chemistry-sekii-gyo2022-clause-p31-3.2-content-gk_lk-02', 'hb-chemistry-sekii-gyo2022-clause-p31-3.2-process-gk_lk-01'], 'he-chemistry-sekii-kc2024-current2026-standard-e5'],
  ] as const) {
    const hbScopes = hbSourceGoalIds.length ? ['DE-HB/SekII/GK', 'DE-HB/SekII/LK'] : []
    const heScopes = ['DE-HE/SekII/GK', 'DE-HE/SekII/LK']
    assert.deepEqual(chemistry.receipt.scopes.filter(s => s.goalIds.includes(goalId)).map(s => s.key), [...scopes, ...hbScopes, ...heScopes],
      'Retain exact BW/HB scopes and only the separately reviewed common HE2026 standard contribution')
    assert.deepEqual(chemistry.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.goalId === goalId)
      .map(w => [s.key, w.sourceGoalId, w.mappedTargetGoalId, w.coverage, w.profileBasis])),
    [...scopes.map(scope => [scope, sourceGoalId, goalId, 'direct', 'source-metadata']),
      ...hbScopes.flatMap(scope => hbSourceGoalIds.map(hbSourceGoalId => [scope, hbSourceGoalId, goalId, 'direct', 'source-metadata'])),
      ...heScopes.map(scope => [scope, heStandardId, goalId, 'direct', 'source-metadata'])],
    'Each practical goal must retain its own direct source operator; direct identity is not full source-clause approval')
  }
  const prescribedSolutionGoalId = '1351706f-4ea6-56e9-951b-87b24cbcdee8'
  const prescribedSolutionSourceId = 'd6ad6ab1-1c9a-5101-9b26-d2ed456d3089'
  assert.deepEqual(byChemistryMapping.mappings.filter(row => row.legacyGoalId === prescribedSolutionSourceId
    && row.canonicalGoalId === prescribedSolutionGoalId).map(row => row.matchType), ['partial'],
  'The prescribed practical component must retain direct partial source support without claiming calculation or the whole source clause')
  assert.deepEqual(bySekI.witnesses.filter(w => w.sourceGoalId === prescribedSolutionSourceId
    && w.mappedTargetGoalId === prescribedSolutionGoalId).map(w => [w.goalId, w.coverage, w.profileBasis, w.mappingPath]),
  [[prescribedSolutionGoalId, 'direct', 'source-metadata', byChemistryMappingPath]],
  'A prerequisite closure must not replace the prescribed practical component source witness')
  const bwPracticalMapping = JSON.parse(readFileSync(resolve(root,
    'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'), 'utf8')) as {
    mappings: { legacyGoalId: string; canonicalGoalId: string; matchType: string }[]
  }
  assert.deepEqual(bwPracticalMapping.mappings.filter(row =>
    row.legacyGoalId === 'bw-chem-sekii-3-3-2-b07-a01-2cd72615'
    && row.canonicalGoalId === 'd2d735de-bede-5310-8aeb-8bb7562c7b75').map(row => row.matchType), ['partial'],
  'The concentration investigation must not become exact coverage of the whole pressure/temperature/concentration duty')
  assert.equal(chemistry.receipt.omittedGoals.filter(g => g.reason === 'unresolved-source-scope').length, 6)
  assert.equal(chemistry.receipt.omittedGoals.filter(g => g.reason === 'no-reviewed-mapped-source-witness').length, 26)
  const knowledgeInfluencesGoalId = 'e5a5dcd8-053c-55fd-b5c7-bba93779da53'
  assert.deepEqual(chemistry.receipt.omittedGoals.filter(g => g.goalId === knowledgeInfluencesGoalId), [
    { goalId: knowledgeInfluencesGoalId, reason: 'unresolved-source-scope' },
  ], 'Machine QA completion must not resolve the C11 source-scope HOLD')
  assert.ok(chemistry.receipt.scopes.every(s => !s.goalIds.includes(knowledgeInfluencesGoalId)))
  assert.ok(chemistry.receipt.scopes.every(s => s.witnesses.every(w => w.goalId !== knowledgeInfluencesGoalId)))
  for (const [goalId, sourceGoalId] of [
    ['0d59b62e-d3f9-5969-b961-0c5e26316c04', 'he-chem-sekii-q1-5-b05-a01-e1183390'],
    ['3d6699ae-ebbd-5a55-8798-b809a9d74f0a', 'he-chem-sekii-q1-5-b04-a01-6d016bf3'],
  ]) {
    assert.deepEqual(chemistry.receipt.scopes.filter(s => s.goalIds.includes(goalId)).map(s => s.key), ['DE-HE/SekII/LK'], 'The new HE LK source atoms must not be imported into another source scope')
    assert.deepEqual(chemistry.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.goalId === goalId).map(w => [s.key, w.sourceGoalId, w.mappedTargetGoalId, w.coverage, w.profileBasis])), [
      ['DE-HE/SekII/LK', sourceGoalId, goalId, 'direct', 'source-metadata'],
    ], 'Paraben use and ascorbic-acid analysis must retain their distinct direct source operators')
  }
  const quantitativeParabenGoalId = '18819a59-2442-530f-a7c3-26755398ec66'
  assert.deepEqual(chemistry.receipt.omittedGoals.filter(g => g.goalId === quantitativeParabenGoalId), [
    { goalId: quantitativeParabenGoalId, reason: 'no-reviewed-mapped-source-witness' },
  ], 'An authored quantitative transfer must not be presented as the source paraben-use operator')
  assert.ok(chemistry.receipt.scopes.every(s => !s.goalIds.includes(quantitativeParabenGoalId)))
  // Each newly published atom must retain precisely its accepted direct
  // partial source identities. This does not confer whole official-source credit.
  const newChemistrySourceWitnesses = [
    ['DE-BB/SekI/', 'bb-chemistry-seki-rlp2015-3-10-055-8067e94d', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-BE/SekI/', 'be-chemistry-seki-rlp2015-3-10-055-8067e94d', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-BW/SekI/', 'bw-chem-seki-3-2-1-1-b13-a01-1e95d177', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-BY/SekI/', '64973c76-d058-5e82-8d8d-239e473b4abc', 'cd9ec99b-b694-5673-863c-55528e31250a'],
    ['DE-HE/SekI/', 'he-chem-seki-8-1-f03-a01-e8972452', '8b2d351e-e44f-5385-9b89-13ef54b5918f'],
    ['DE-HE/SekII/GK', 'he-chem-sekii-e-3-b07-a01-72b742ac', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-HE/SekII/LK', 'he-chem-sekii-e-3-b07-a01-72b742ac', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-HE/SekII/LK', 'he-chem-sekii-q3-3-b10-a01-f814c697', '0e3f849b-133d-57da-882c-0d67c3eb05b8'],
    ['DE-HH/SekI/', 'de-hh-chemie-seki-bildungsplan-2014-2018-3-1-uf-j10-012-da87b9a0', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-HH/SekI/', 'de-hh-chemie-seki-bildungsplan-2014-2018-3-2-inhalte-064-4ba24dc7', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-HH/SekII/GK', 'de-hh-chemie-sekii-bildungsplan-2022-2-3-044-7c750b14', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-HH/SekII/LK', 'de-hh-chemie-sekii-bildungsplan-2022-2-3-044-7c750b14', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-MV/SekI/', 'mv-chem-seki-mv-ch-seki-2021-j10-funktionelle-gruppen-005-00aefcdc', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-MV/SekI/', 'mv-chem-seki-mv-ch-seki-2021-j10-funktionelle-gruppen-008-352e7117', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-MV/SekII/GK', 'mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-gleichgewichte-003-5609e8fa', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-MV/SekII/LK', 'mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-gleichgewichte-003-5609e8fa', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-NI/SekII/GK', 'ni-chemistry-sekii-kc2022-ep-3-kompetenz-008-92b23769', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-NI/SekII/GK', 'ni-chemistry-sekii-kc2022-ep-3-kompetenz-009-a0d908ad', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-NI/SekII/GK', 'ni-chemistry-sekii-kc2022-q-makro-nano-kompetenz-002-6ed76938', '4955f745-b946-5d3d-82d6-5e52dc8549a3'],
    ['DE-NI/SekII/GK', 'ni-chemistry-sekii-kc2022-q-makro-nano-kompetenz-006-592991dc', 'f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7'],
    ['DE-NI/SekII/GK', 'ni-chemistry-sekii-kc2022-q-organik-4-kompetenz-002-05581320', 'f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7'],
    ['DE-NI/SekII/LK', 'ni-chemistry-sekii-kc2022-ep-3-kompetenz-008-92b23769', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-NI/SekII/LK', 'ni-chemistry-sekii-kc2022-ep-3-kompetenz-009-a0d908ad', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-NI/SekII/LK', 'ni-chemistry-sekii-kc2022-q-makro-nano-kompetenz-002-6ed76938', '4955f745-b946-5d3d-82d6-5e52dc8549a3'],
    ['DE-NI/SekII/LK', 'ni-chemistry-sekii-kc2022-q-makro-nano-kompetenz-006-592991dc', 'f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7'],
    ['DE-NI/SekII/LK', 'ni-chemistry-sekii-kc2022-q-organik-3-kompetenz-014-d68a5383', 'b7b5df21-78f3-5408-89f1-36deed450695'],
    ['DE-NI/SekII/LK', 'ni-chemistry-sekii-kc2022-q-organik-4-kompetenz-002-05581320', 'f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7'],
    ['DE-NI/SekII/LK', 'ni-chemistry-sekii-kc2022-q-protolyse-3-kompetenz-009-2cb0e209', 'c61b2a7a-fb0f-5a76-92e9-771c789fa816'],
    ['DE-NI/SekII/LK', 'ni-chemistry-sekii-kc2022-q-redox-3-kompetenz-013-d68aa68e', '0e3f849b-133d-57da-882c-0d67c3eb05b8'],
    ['DE-NW/SekII/GK', 'de-nw-chemie-sekii-klp-2022-EF-organische-stoffklassen-bewertungskompetenz-001-1d335640', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-NW/SekII/LK', 'de-nw-chemie-sekii-klp-2022-EF-organische-stoffklassen-bewertungskompetenz-001-1d335640', 'a25a19ed-aec3-59cc-ae28-31d98746cb9d'],
    ['DE-RP/SekII/LK', 'rp-chem-sekii-rp-ch-sekii-2022-baustein-16-2-003-47fbbe54', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-RP/SekII/LK', 'rp-chem-sekii-rp-ch-sekii-2022-baustein-7-1-002-b737a24c', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-SH/SekII/GK', 'de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-030-5d25c671', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-SH/SekII/GK', 'de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-031-247f5e51', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-SH/SekII/LK', 'de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-030-5d25c671', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-SH/SekII/LK', 'de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-031-247f5e51', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-SL/SekII/LK', 'sl-chem-sekii-sl-ch-sekii-lk-2023-2025-p022-002-cd00fca0', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-SL/SekII/LK', 'sl-chem-sekii-sl-ch-sekii-lk-2023-2025-p073-003-87264536', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-SN/SekII/LK', 'sn-chem-sekii-sn-ch-jahrgangsstufe-11-leistungskurs-lb2-043-02-6ee8b8e4', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-SN/SekII/LK', 'sn-chem-sekii-sn-ch-jahrgangsstufe-11-leistungskurs-lb4-048-02-8cfdba0a', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-ST/SekI/', 'st-chem-seki-st-schuljahrgang-9-ausgewahlte-derivate-der-alkane-untersuchen-199-f5728801', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-ST/SekII/LK', 'st-chem-sekii-st-schuljahrgange-11-12-ean-chemische-gleichgewichte-qualitativ-und-quantitativ-betrachten-123-08e296e3', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-TH/SekII/GK', 'th-chem-sekii-th-ch-sekii-4-1-3-chemisches-gleichgewicht-gleichgewichtsreaktionen-051-03-001362ed', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-TH/SekII/GK', 'th-chem-sekii-th-ch-sekii-4-1-5-verbindungen-bestimmen-098-01-fd1ae715', 'cc5a626a-dc85-57e2-b422-259f92901545'],
    ['DE-TH/SekII/LK', 'th-chem-sekii-th-ch-sekii-4-1-3-chemisches-gleichgewicht-gleichgewichtsreaktionen-051-03-001362ed', '2d16528c-1424-5999-b3d2-af4593a147fc'],
    ['DE-TH/SekII/LK', 'th-chem-sekii-th-ch-sekii-4-1-5-verbindungen-bestimmen-098-01-fd1ae715', 'cc5a626a-dc85-57e2-b422-259f92901545'],
  ]
  const newChemistrySourceGoalIds = new Set(newChemistrySourceWitnesses.map(row => row[2]))
  assert.equal(newChemistrySourceGoalIds.size, 10)
  assert.deepEqual(chemistry.receipt.scopes.flatMap(scope => scope.witnesses
    .filter(w => newChemistrySourceGoalIds.has(w.goalId))
    .map(w => [scope.key, w.sourceGoalId, w.goalId, w.mappedTargetGoalId, w.coverage, w.profileBasis]))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  newChemistrySourceWitnesses.map(([scope, source, goal]) => [scope, source, goal, goal, 'direct', 'source-metadata'])
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  'Newly published Chemistry atoms must keep exact reviewed source/course identities without inherited or whole-source substitution')
  // These four direct scope witnesses explain the later 410 -> 413 refresh.
  // RP and SN retain their official optional units; TH remains elevated LK.
  // A direct witness does not close the whole source unit or adjacent experiment.
  const checkpointChemistryWitnesses = [
    ['DE-RP/SekII/GK', 'rp-chem-sekii-rp-ch-sekii-2022-baustein-2-3-005-6ff85354', '4a7dee38-1056-5e27-acec-e6a12f58109f',
      'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current454-joint-source-integration-technical-20261018-v1/candidate/sources/20.RP.selected-unit23-quality-GK-LK.source-extraction.json'],
    ['DE-RP/SekII/LK', 'rp-chem-sekii-rp-ch-sekii-2022-baustein-2-3-005-6ff85354', '4a7dee38-1056-5e27-acec-e6a12f58109f',
      'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current454-joint-source-integration-technical-20261018-v1/candidate/sources/20.RP.selected-unit23-quality-GK-LK.source-extraction.json'],
    ['DE-SN/SekII/GK', 'sn-chem-sekii-sn-ch-jahrgangsstufe-11-grundkurs-wb1-011-01-81755658', 'f4f7f028-10db-53f9-bdae-456e0c6d0896',
      'curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current454-nineteen-target-source-gaps-author-20261018-v1/components/02-colour-and-context-components/candidate/sources/DE-SN.whole-selected-source-plus-whole-clauses.pending.json'],
    ['DE-TH/SekII/LK', 'th-chem-sekii-th-ch-sekii-4-1-8-synthesen-171-03-99c1b0d0', '0559cec7-330b-57f1-a409-31cf1b4ac9fb',
      'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.b007-normal-source-scope-20261011-v1.review.json',
      'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-19/chemie-current455-62de-three-source-bridges-and-NI-open-author-20261019-v1/candidate/sources/TH.current236-plus-one-whole-property-clause.source-extraction.json'],
  ] as const
  const checkpointChemistryGoalIds = new Set<string>(checkpointChemistryWitnesses.map(row => row[2]))
  assert.equal(checkpointChemistryGoalIds.size, 3)
  assert.deepEqual(chemistry.receipt.scopes.flatMap(scope => scope.witnesses
    .filter(w => checkpointChemistryGoalIds.has(w.goalId))
    .map(w => [scope.key, w.sourceGoalId, w.goalId, w.mappedTargetGoalId, w.coverage, w.profileBasis, w.mappingPath, w.sourceExtractionPath])),
  checkpointChemistryWitnesses.map(([scope, source, goal, mapping, extraction]) =>
    [scope, source, goal, goal, 'direct', 'source-metadata', mapping, extraction]),
  'The checkpoint must retain only the four reviewed RP GK/LK, SN GK and TH LK source witnesses')
  assert.ok(chemistry.receipt.omittedGoals.every(g => !checkpointChemistryGoalIds.has(g.goalId)))
  const rpCheckpointExtraction = JSON.parse(readFileSync(resolve(root, checkpointChemistryWitnesses[0][4]), 'utf8'))
  const rpCheckpointSource = rpCheckpointExtraction.sourceGoals.find((g: { id: string }) => g.id === checkpointChemistryWitnesses[0][1])
  assert.equal(rpCheckpointSource.courseLevel, 'GK_LK')
  assert.deepEqual(rpCheckpointSource.sourceScopeExact.courseProfiles, ['GK', 'LK'])
  assert.equal(rpCheckpointSource.sourceScopeExact.officialOptional, true)
  assert.equal(rpCheckpointSource.sourceScopeExact.actualLearnerChoice, false)
  const snCheckpointExtraction = JSON.parse(readFileSync(resolve(root, checkpointChemistryWitnesses[2][4]), 'utf8'))
  const snCheckpointSource = snCheckpointExtraction.sourceGoals.find((g: { id: string }) => g.id === checkpointChemistryWitnesses[2][1])
  assert.equal(snCheckpointSource.courseLevel, 'GK')
  assert.equal(snCheckpointSource.topicCode, 'SN-CH-jahrgangsstufe-11-grundkurs-WB1')
  assert.equal(snCheckpointSource.parentBulletText, 'Kennen der Vorgänge beim Fixieren eines Films')
  const thCheckpointExtraction = JSON.parse(readFileSync(resolve(root, checkpointChemistryWitnesses[3][4]), 'utf8'))
  const thCheckpointSource = thCheckpointExtraction.sourceGoals.find((g: { id: string }) => g.id === checkpointChemistryWitnesses[3][1])
  assert.equal(thCheckpointSource.courseLevel, 'LK')
  assert.deepEqual(thCheckpointSource.sourceScopeExact.courseProfiles, ['LK'])
  assert.equal(thCheckpointSource.sourceScopeExact.officialOptional, false)
  assert.equal(thCheckpointSource.sourceScopeExact.adjacentStructureAndPracticalDutiesNotClosed, true)
  const formerCompoundGoalId = 'd3cd250f-5221-589d-aa1c-44a4692d1acb'
  assert.ok(chemistry.receipt.scopes.every(s => !s.goalIds.includes(formerCompoundGoalId)), 'The former compound atom is now a cluster, not an atlas atom')
  assert.ok(chemistry.receipt.omittedGoals.every(g => g.goalId !== formerCompoundGoalId))
  // HE Q4.1's explicit Gibbs-Helmholtz calculation adds the quantitative
  // Gibbs goal to LK; the separately sourced enthalpy/Hess goal stays available.
  const quantitativeGibbsGoalId = 'dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5'
  const gibbsCalculationSourceId = 'he-chem-sekii-q4-1-b07-a01-a1a44a81'
  assert.deepEqual(chemistry.receipt.scopes.flatMap(s => s.witnesses
    .filter(w => w.sourceGoalId === gibbsCalculationSourceId)
    .map(w => [s.key, w.goalId, w.mappedTargetGoalId, w.coverage, w.profileBasis])), [
    ['DE-HE/SekII/LK', quantitativeGibbsGoalId, quantitativeGibbsGoalId, 'direct', 'source-metadata'],
  ], 'The Gibbs-Helmholtz operator must directly supply the quantitative Gibbs goal in HE LK only')
  assert.ok(chemistry.receipt.scopes.find(s => s.key === 'DE-HE/SekII/LK')!.goalIds.includes(quantitativeGibbsGoalId))
  assert.ok(!chemistry.receipt.scopes.find(s => s.key === 'DE-HE/SekII/GK')!.goalIds.includes(quantitativeGibbsGoalId),
    'The reviewed LK calculation must not widen the HE GK scope')
  assert.deepEqual(chemistry.receipt.scopes.filter(s => s.jurisdiction === 'DE-BY' || (s.jurisdiction === 'DE-HE' && s.stage === 'SekII')).map(s => [s.key, s.goalIds.length]), [
    ['DE-BY/SekI/', 101], ['DE-BY/SekII/GK', 118], ['DE-BY/SekII/LK', 149], ['DE-HE/SekII/GK', 149], ['DE-HE/SekII/LK', 177],
  ], 'Reviewed Chemistry routes must retain their exact BY/HE source scopes')
  assert.deepEqual([...new Set(chemistry.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.profileBasis === 'authored-view').map(() => s.jurisdiction)))].sort(), ['DE-BB', 'DE-BE'])
  // Every grouped witness expands back to the exact original provenance record.
  for (const [subject, result] of [['biology', biology], ['chemistry', chemistry]] as const) {
    assert.deepEqual(expandGoalBookSourceAtlasReceipt(compactGoalBookSourceAtlasReceipt(result.receipt)), result.receipt)
    const configPath = `app/scripts/config/goal-books/de-gym-${subject}-national-atlas.inputs.json`
    const config = readGoalBookSourceAtlasInputConfig(configPath, root)
    const snapshotPaths = new Set(config.sourceDocumentSnapshots?.map(snapshot => snapshot.path))
    // Biology's reviewed whole-source inputs now bind six primary PDFs as
    // mandatory committed files; the still-used download aliases remain declared.
    assert.equal(snapshotPaths.size, subject === 'biology' ? 20 : 30)
    if (subject === 'biology') {
      const snapshots = new Map(config.sourceDocumentSnapshots?.map(snapshot => [snapshot.path, snapshot]))
      const primaryDirectory = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1/primary'
      for (const [cachePath, primaryName, expectedSha256] of [
        ['curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf', 'BB-whole-current.original.pdf', 'sha256:e9a386033898659b9c2fe865886f00632403f2242c91e0844afed811a906d1b9'],
        ['curricula/DE/Gymnasium/input/BE/lower-secondary/Teil_C_Biologie_2015_11_10.pdf', 'BE-whole-current.original.pdf', 'sha256:e9a386033898659b9c2fe865886f00632403f2242c91e0844afed811a906d1b9'],
        ['curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-biologie-sachsen-2025.pdf', 'SN-whole-current.original.pdf', 'sha256:bde9c7af4c25fe1c6346abcb544626514a9e5c1d6c2528b2764df15430156252'],
        ['curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf', 'ST-whole-current.original.pdf', 'sha256:58b106c65a71478a096f31cf8e9743a238a59aec085414ac472ee0ab5da10c38'],
      ]) {
        const cache = snapshots.get(cachePath)
        const primary = snapshots.get(`${primaryDirectory}/${primaryName}`)
        assert.ok(cache && primary, `Both current source path aliases must remain declared: ${cachePath}`)
        assert.equal(cache.sha256, expectedSha256)
        assert.equal(primary.sha256, expectedSha256)
        assert.equal(cache.url, primary.url, 'Path aliases must identify the same official source document')
      }
    }
    const checkoutRoot = mkdtempSync(resolve(tmpdir(), 'skillpilot-atlas-without-downloads-'))
    try {
      // A local ignored file must not conceal a missing deployment input. Copy
      // only Git-tracked mandatory inputs, with declared source caches absent.
      const paths = new Set([configPath, ...result.receipt.inputBindings.map(binding => binding.path), ...Object.keys(result.outputs)])
      const mandatoryPaths = [...paths].filter(path => !snapshotPaths.has(path))
      const resolvedPaths = new Map(mandatoryPaths.map(path => [path, relative(realpathSync(root), realpathSync(resolve(root, path)))]))
      // Query just this book's input closure: the complete repository index can
      // exceed the subprocess output limit because it retains review history.
      const queryPaths = [...new Set([...mandatoryPaths, ...resolvedPaths.values()])]
      const trackedPaths = new Set(execFileSync('git', ['ls-files', '--cached', '-z', '--', ...queryPaths.map(path => `:(literal)${path}`)], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean))
      for (const path of mandatoryPaths) {
        assert.ok(trackedPaths.has(path), `${subject}: mandatory source-atlas input must be Git-tracked: ${path}`)
        const resolvedPath = resolvedPaths.get(path)!
        assert.ok(trackedPaths.has(resolvedPath), `${subject}: mandatory source-atlas input target must be Git-tracked: ${path} -> ${resolvedPath}`)
        mkdirSync(dirname(resolve(checkoutRoot, path)), { recursive: true })
        copyFileSync(resolve(root, path), resolve(checkoutRoot, path))
      }
      for (const path of snapshotPaths) assert.equal(existsSync(resolve(checkoutRoot, path)), false, `${subject}: the checkout fixture must omit every declared source cache: ${path}`)
      assert.deepEqual(checkGoalBookSourceAtlasInputs(configPath, checkoutRoot), result)
    } finally {
      rmSync(checkoutRoot, { recursive: true, force: true })
    }
  }
  console.log('PASS source-atlas input derivation, offline PDF/HTML snapshot/binding/boundary checks and current Biology/Chemistry coverage with only Git-tracked mandatory inputs')
}
