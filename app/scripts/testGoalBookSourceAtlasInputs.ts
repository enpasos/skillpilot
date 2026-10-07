import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
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
  // Seven independently reviewed genetics atoms extend the preserved 383-goal atlas.
  assert.deepEqual(biology.receipt.counts, { canonicalCurricularAtomicGoals: 390, publishedCurricularAtomicGoals: 390, sourceViews: 22, unresolvedSourceScopeDecisions: 0, omittedGoals: 0 })
  // Current direct source bindings add methylation in BY/HE, transcription
  // factors in BY, and the separate bacterial-fission atom in HE LK.
  assert.deepEqual(biology.receipt.scopes.filter(s => s.stage === 'SekII').map(s => [s.key, s.goalIds.length]), [
    ['DE-BY/SekII/GK', 90], ['DE-BY/SekII/LK', 117], ['DE-HE/SekII/GK', 77], ['DE-HE/SekII/LK', 159],
    ['DE-ST/SekII/GK', 3], ['DE-ST/SekII/LK', 3],
  ])
  // Direct source scope remains bounded: prerequisite availability does not
  // become source coverage; ST's common entry phase is projected into both
  // technical upper-secondary course routes, never into its SekI target set.
  for (const [goalId, expectedScopes] of [
    ['ac9e824f-003c-50ac-8751-2b8456004c63', ['DE-BB/SekI/', 'DE-BE/SekI/']],
    ['5eb7c923-469d-5934-b1e8-292e1bb40d95', ['DE-SN/SekI/', 'DE-TH/SekI/']],
    ['bfb5dfb6-8e35-5452-b581-96e061d8b826', ['DE-ST/SekII/GK', 'DE-ST/SekII/LK']],
    ['3a0d6c82-f9f0-5ad1-bb0b-b948e4450d04', ['DE-MV/SekI/', 'DE-ST/SekII/GK', 'DE-ST/SekII/LK']],
    ['9d830422-acc7-5fa8-aee9-4dae4cedbf49', ['DE-MV/SekI/']],
    ['d0c3e6a7-581b-57bd-8027-e940c6b77af8', ['DE-MV/SekI/', 'DE-SN/SekI/', 'DE-ST/SekII/GK', 'DE-ST/SekII/LK', 'DE-TH/SekI/']],
    ['aab2a358-b2ee-57a5-a957-8fb9845506b1', ['DE-TH/SekI/']],
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
  assert.deepEqual(chemistry.receipt.counts, { canonicalCurricularAtomicGoals: 378, publishedCurricularAtomicGoals: 359, sourceViews: 48, unresolvedSourceScopeDecisions: 496, omittedGoals: 19 })
  assert.equal(chemistry.receipt.omittedGoals.filter(g => g.reason === 'unresolved-source-scope').length, 8)
  assert.equal(chemistry.receipt.omittedGoals.filter(g => g.reason === 'no-reviewed-mapped-source-witness').length, 11)
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
    ['DE-BY/SekI/', 91], ['DE-BY/SekII/GK', 111], ['DE-BY/SekII/LK', 142], ['DE-HE/SekII/GK', 112], ['DE-HE/SekII/LK', 141],
  ], 'HE-only integration must preserve BY source coverage and the HE GK scope')
  assert.deepEqual([...new Set(chemistry.receipt.scopes.flatMap(s => s.witnesses.filter(w => w.profileBasis === 'authored-view').map(() => s.jurisdiction)))].sort(), ['DE-BB', 'DE-BE'])
  // Every grouped witness expands back to the exact original provenance record.
  for (const [subject, result] of [['biology', biology], ['chemistry', chemistry]] as const) {
    assert.deepEqual(expandGoalBookSourceAtlasReceipt(compactGoalBookSourceAtlasReceipt(result.receipt)), result.receipt)
    const configPath = `app/scripts/config/goal-books/de-gym-${subject}-national-atlas.inputs.json`
    const config = readGoalBookSourceAtlasInputConfig(configPath, root)
    const snapshotPaths = new Set(config.sourceDocumentSnapshots?.map(snapshot => snapshot.path))
    // Biology retains its 16 original snapshots and the corrected Hessen KC PDF.
    assert.equal(snapshotPaths.size, subject === 'biology' ? 17 : 30)
    const checkoutRoot = mkdtempSync(resolve(tmpdir(), 'skillpilot-atlas-without-downloads-'))
    try {
      // Copy only the required repository inputs and published derivation, not
      // any authoring PDF cache: both real atlases must pass in a fresh checkout.
      const paths = new Set([configPath, ...result.receipt.inputBindings.map(binding => binding.path), ...Object.keys(result.outputs)])
      for (const path of paths) if (!snapshotPaths.has(path)) {
        mkdirSync(dirname(resolve(checkoutRoot, path)), { recursive: true })
        copyFileSync(resolve(root, path), resolve(checkoutRoot, path))
      }
      assert.deepEqual(checkGoalBookSourceAtlasInputs(configPath, checkoutRoot), result)
    } finally {
      rmSync(checkoutRoot, { recursive: true, force: true })
    }
  }
  console.log('PASS source-atlas input derivation, offline snapshot/binding/boundary checks and current Biology/Chemistry coverage without PDF downloads')
}
