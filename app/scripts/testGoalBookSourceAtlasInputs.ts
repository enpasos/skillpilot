import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
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
    write('doc.txt', 'changed bytes')
    assert.throws(() => checkGoalBookSourceAtlasInputs('config.json', fixtureRoot), /Stale generated atlas input/)
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
  // Two independently reviewed basic metabolism companions add bounded direct
  // source routes; all earlier current atoms remain in the atlas.
  assert.deepEqual(biology.receipt.counts, { canonicalCurricularAtomicGoals: 394, publishedCurricularAtomicGoals: 394, sourceViews: 24, unresolvedSourceScopeDecisions: 0, omittedGoals: 0 })
  // Current independent source reviews correct the selected neurobiology
  // scopes and add explicit component routes without closing broad source HOLDs.
  assert.deepEqual(biology.receipt.scopes.filter(s => s.stage === 'SekII').map(s => [s.key, s.goalIds.length]), [
    ['DE-BY/SekII/GK', 91], ['DE-BY/SekII/LK', 121], ['DE-HE/SekII/GK', 82], ['DE-HE/SekII/LK', 160],
    ['DE-SH/SekII/GK', 1], ['DE-SH/SekII/LK', 1],
    ['DE-ST/SekII/GK', 6], ['DE-ST/SekII/LK', 6],
  ])
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
  ] as const) {
    assert.deepEqual(biology.receipt.scopes.filter(s => s.goalIds.includes(goalId)).map(s => s.key), expectedScopes, `${goalId}: exact independently reviewed source scope`)
    assert.ok(biology.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.goalId === goalId)).every(w => w.coverage === 'direct'), `${goalId}: no inherited source-coverage claim`)
  }
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
  assert.deepEqual(chemistry.receipt.counts, { canonicalCurricularAtomicGoals: 398, publishedCurricularAtomicGoals: 378, sourceViews: 48, unresolvedSourceScopeDecisions: 496, omittedGoals: 20 })
  // Keep the reviewed C10 child routes when newer process-competency mappings
  // are integrated. Visibility inherited from their parent cannot replace
  // these direct, bounded source witnesses.
  const byChemistryMappingPath = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json'
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
  for (const [goalId, sourceGoalId, scopes] of [
    ['d2d735de-bede-5310-8aeb-8bb7562c7b75', 'bw-chem-sekii-3-3-2-b07-a01-2cd72615', ['DE-BW/SekII/GK', 'DE-BW/SekII/LK']],
    ['a0f6ba09-f072-5887-a797-fa369453c62a', 'bw-chem-sekii-3-4-2-b06-a01-99efae9b', ['DE-BW/SekII/LK']],
    ['7b39fa19-fec3-575e-9324-a3226b703358', 'bw-chem-sekii-3-4-7-b06-a01-46c58b93', ['DE-BW/SekII/LK']],
  ] as const) {
    assert.deepEqual(chemistry.receipt.scopes.filter(s => s.goalIds.includes(goalId)).map(s => s.key), scopes,
      'The practical contribution must retain its reviewed BW course scope without importing Sek I or other jurisdictions')
    assert.deepEqual(chemistry.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.goalId === goalId)
      .map(w => [s.key, w.sourceGoalId, w.mappedTargetGoalId, w.coverage, w.profileBasis])),
    scopes.map(scope => [scope, sourceGoalId, goalId, 'direct', 'source-metadata']),
    'Each practical goal must retain its own direct source operator; direct identity is not full source-clause approval')
  }
  const bwPracticalMapping = JSON.parse(readFileSync(resolve(root,
    'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'), 'utf8')) as {
    mappings: { legacyGoalId: string; canonicalGoalId: string; matchType: string }[]
  }
  assert.deepEqual(bwPracticalMapping.mappings.filter(row =>
    row.legacyGoalId === 'bw-chem-sekii-3-3-2-b07-a01-2cd72615'
    && row.canonicalGoalId === 'd2d735de-bede-5310-8aeb-8bb7562c7b75').map(row => row.matchType), ['partial'],
  'The concentration investigation must not become exact coverage of the whole pressure/temperature/concentration duty')
  assert.equal(chemistry.receipt.omittedGoals.filter(g => g.reason === 'unresolved-source-scope').length, 9)
  assert.equal(chemistry.receipt.omittedGoals.filter(g => g.reason === 'no-reviewed-mapped-source-witness').length, 11)
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
  const formerCompoundGoalId = 'd3cd250f-5221-589d-aa1c-44a4692d1acb'
  assert.ok(chemistry.receipt.scopes.every(s => !s.goalIds.includes(formerCompoundGoalId)), 'The former compound atom is now a cluster, not an atlas atom')
  assert.ok(chemistry.receipt.omittedGoals.every(g => g.goalId !== formerCompoundGoalId))
  assert.deepEqual(chemistry.receipt.scopes.filter(s => s.jurisdiction === 'DE-BY' || (s.jurisdiction === 'DE-HE' && s.stage === 'SekII')).map(s => [s.key, s.goalIds.length]), [
    ['DE-BY/SekI/', 96], ['DE-BY/SekII/GK', 117], ['DE-BY/SekII/LK', 148], ['DE-HE/SekII/GK', 112], ['DE-HE/SekII/LK', 141],
  ], 'Reviewed Chemistry routes must retain their exact BY/HE source scopes')
  assert.deepEqual([...new Set(chemistry.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.profileBasis === 'authored-view').map(() => s.jurisdiction)))].sort(), ['DE-BB', 'DE-BE'])
  // Every grouped witness expands back to the exact original provenance record.
  for (const [subject, result] of [['biology', biology], ['chemistry', chemistry]] as const) {
    assert.deepEqual(expandGoalBookSourceAtlasReceipt(compactGoalBookSourceAtlasReceipt(result.receipt)), result.receipt)
    const configPath = `app/scripts/config/goal-books/de-gym-${subject}-national-atlas.inputs.json`
    const config = readGoalBookSourceAtlasInputConfig(configPath, root)
    const snapshotPaths = new Set(config.sourceDocumentSnapshots?.map(snapshot => snapshot.path))
    // Biology retains the whole-source primary files, all still-used cache
    // aliases from unchanged component extractions, and five HTML sources.
    assert.equal(snapshotPaths.size, subject === 'biology' ? 26 : 30)
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
