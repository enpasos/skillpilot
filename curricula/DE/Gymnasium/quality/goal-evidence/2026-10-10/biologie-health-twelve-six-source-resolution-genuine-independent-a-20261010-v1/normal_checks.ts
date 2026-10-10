import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs, checkGoalBookSourceAtlasInputs, expandGoalBookSourceAtlasReceipt } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { loadGoalBookBuildInputs, writeGoalBookModel } from '../../../../../../../app/scripts/goalBookModel'

async function main() {
  const root = process.cwd()
  const date = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
  const own = date + 'biologie-health-twelve-six-source-resolution-genuine-independent-a-20261010-v1'
  const author = date + 'biologie-health-twelve-six-source-bindings-resolution-author-successor-20261010-v2'
  const beforeAuthor = date + 'biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1'
  const read = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
  const sha = (p: string) => 'sha256:' + createHash('sha256').update(fs.readFileSync(p)).digest('hex')
  const write = (p: string, v: unknown) => fs.writeFileSync(path.join(root, p), JSON.stringify(v, null, 2) + '\n')
  const initialFirstSha = sha(path.join(root, own, 'FIRST.six-source-resolution-independent-a.inspection.json'))
  assert.equal(initialFirstSha, 'sha256:76a243cfeba1097db5ca2eaf5887a62a3ebe820557754d2248666fcf35f5404b')
  const capsule = fs.mkdtempSync(path.join(os.tmpdir(), 'skillpilot-bio12-six-source-A-'))
  try {
    const inputs = read(author + '/inputs/all-normal-source-inputs.actual-regular-portable-bindings.json')
    for (const r of inputs.records) {
      const b = r.actualRegularPortableBinding
      const actual = path.join(root, b.path)
      assert.equal(fs.lstatSync(actual).isSymbolicLink(), false)
      assert.equal(sha(actual), b.sha256)
      assert.equal(b.sha256, r.normalExpectedSha256)
      const diagnosticAlias = path.join(capsule, r.normalLogicalInputPathDiagnosticOnly)
      fs.mkdirSync(path.dirname(diagnosticAlias), { recursive: true })
      fs.symlinkSync(actual, diagnosticAlias)
    }
    const config = read(author + '/sources/current394-six-resolution.normal.config.json')
    const result = buildGoalBookSourceAtlasInputs(config, capsule)
    for (const [name, content] of Object.entries(result.outputs)) {
      const output = path.join(capsule, name)
      fs.mkdirSync(path.dirname(output), { recursive: true })
      fs.writeFileSync(output, content)
      const retained = path.join(root, author, 'sources/normal-output', path.basename(name))
      assert.equal(fs.readFileSync(retained, 'utf8'), content, 'Normal derived output differs: ' + name)
    }
    fs.writeFileSync(path.join(capsule, 'source-config.json'), JSON.stringify(config, null, 2) + '\n')
    const checked = checkGoalBookSourceAtlasInputs('source-config.json', capsule)
    assert.deepEqual(checked.receipt, result.receipt)
    const after: any = result.receipt
    const before: any = expandGoalBookSourceAtlasReceipt(read(beforeAuthor + '/sources/normal-output/source-projection.receipt.json'))
    const beforeConfig = read(beforeAuthor + '/sources/after394-atlas.targeted-source.normal.config.json')
    const protectedIds: string[] = read(date + 'biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1/inputs/current353-protected.ids.json').current353
    assert.equal(new Set(protectedIds).size, 353)
    assert.equal(after.scopes.length, 24)
    assert.equal(after.counts.canonicalCurricularAtomicGoals, 394)
    assert.equal(after.counts.publishedCurricularAtomicGoals, 394)
    assert.equal(after.counts.unresolvedSourceScopeDecisions, 0)
    assert.equal(after.counts.omittedGoals, 0)
    const key = (w: any, cfg: any) => {
      const pair = cfg.mappingPaths.indexOf(w.mappingPath)
      assert.ok(pair >= 0)
      return JSON.stringify([pair, w.sourceGoalId, w.mappedTargetGoalId, w.goalId, w.coverage, w.profileBasis, w.fallbackViewPath ?? null])
    }
    const scopeDeltas: any[] = []
    const removed: any[] = []
    for (const old of before.scopes) {
      const current = after.scopes.find((s: any) => s.viewId === old.viewId)
      assert.ok(current)
      const a = new Set<string>(old.witnesses.map((w: any) => key(w, beforeConfig)))
      const b = new Set<string>(current.witnesses.map((w: any) => key(w, config)))
      const lost = [...a].filter(k => !b.has(k)).map(k => JSON.parse(k))
      const gained = [...b].filter(k => !a.has(k))
      assert.equal(gained.length, 0)
      removed.push(...lost)
      scopeDeltas.push({ viewId: old.viewId, beforeGoals: old.goalIds.length, afterGoals: current.goalIds.length, removedGoalIds: old.goalIds.filter((id: string) => !current.goalIds.includes(id)), addedGoalIds: current.goalIds.filter((id: string) => !old.goalIds.includes(id)), removedWitnesses: lost, allOtherWitnessSemanticsExact: true })
    }
    assert.equal(removed.length, 8)
    assert.equal(removed.filter(r => r[4] === 'direct').length, 5)
    assert.equal(removed.filter(r => r[4] === 'inherited').length, 3)
    const changedViews = scopeDeltas.filter(r => r.removedGoalIds.length || r.addedGoalIds.length)
    assert.equal(changedViews.length, 1)
    assert.equal(changedViews[0].viewId, 'de-gym-biologie-bundesweit-source-de-hh-seki')
    assert.deepEqual(changedViews[0].removedGoalIds.sort(), ['0e1065b9-9d1d-5299-b900-32c74d352e56', 'a6f57e17-9f0c-5327-91bc-c6f31ff375a2'])
    const beforeIds = new Set<string>(before.scopes.flatMap((s: any) => s.goalIds))
    const afterIds = new Set<string>(after.scopes.flatMap((s: any) => s.goalIds))
    assert.deepEqual([...beforeIds].sort(), [...afterIds].sort())
    assert.ok(protectedIds.every(id => beforeIds.has(id) && afterIds.has(id)))
    const authoredModel = read(author + '/native/current394-six-resolution.actual-normal-model.json')
    const frozenInputs = read(author + '/FINAL.six-source-bindings-neutral-author.freeze.json')
    const frozenBindings = [...frozenInputs.ownBindings, ...frozenInputs.externalBindings]
    for (const b of frozenBindings) {
      const alias = path.join(capsule, b.path)
      if (fs.existsSync(alias)) continue
      const actual = path.join(root, b.path)
      assert.equal(sha(actual), b.sha256)
      fs.mkdirSync(path.dirname(alias), { recursive: true })
      fs.symlinkSync(actual, alias)
    }
    const publicAliases: any[] = []
    for (const p of authoredModel.pages) {
      if (!p.visualization) continue
      const v = p.visualization
      const aliases = frozenBindings.filter((b: any) => b.sha256 === v.originalDigest && b.path.endsWith('.png'))
      assert.ok(aliases.length, 'No frozen real PNG matches current model: ' + p.goalId)
      const aliasPath = 'app/public/' + v.url.replace(/^\//, '')
      const alias = path.join(capsule, aliasPath)
      if (!fs.existsSync(alias)) {
        fs.mkdirSync(path.dirname(alias), { recursive: true })
        fs.symlinkSync(path.join(root, aliases[0].path), alias)
      }
      assert.equal(sha(alias), v.originalDigest)
      publicAliases.push({ goalId: p.goalId, diagnosticRuntimePath: aliasPath, actualFrozenPng: aliases[0], expectedDigestExact: true })
    }
    const modelConfig = read(author + '/native/current394-six-resolution.normal.config.json')
    const additionalModelInputs: any[] = []
    for (const name of [modelConfig.landscapePath, modelConfig.semanticKindLedgerPath, modelConfig.goalVisualizationQaPath, modelConfig.compositionViewManifestPath, ...modelConfig.evidenceReviewPaths, ...(modelConfig.externalLandscapePaths ?? [])]) {
      const actual = path.join(root, name)
      assert.equal(fs.lstatSync(actual).isSymbolicLink(), false)
      const b = { path: name, sha256: sha(actual), bytes: fs.statSync(actual).size }
      additionalModelInputs.push(b)
      const alias = path.join(capsule, name)
      if (fs.existsSync(alias)) continue
      fs.mkdirSync(path.dirname(alias), { recursive: true })
      fs.symlinkSync(actual, alias)
    }
    const loaded = await loadGoalBookBuildInputs(author + '/native/current394-six-resolution.normal.config.json', capsule)
    assert.deepEqual(loaded.model, authoredModel, 'Independent normal native model differs from sealed author model')
    const beforeModel = read(beforeAuthor + '/native/current394-source-corrected.actual-normal-model.json')
    const byId = new Map(beforeModel.pages.map((p: any) => [p.goalId, p]))
    const pageDeltas: any[] = []
    const protectedPages: any[] = []
    for (const p of loaded.model.pages) {
      const old: any = byId.get(p.goalId)
      assert.ok(old)
      assert.equal(old.goalFingerprint, p.goalFingerprint)
      const fields = Object.keys(p).filter(k => JSON.stringify(old[k]) !== JSON.stringify((p as any)[k]))
      if (fields.length) {
        assert.deepEqual(fields.sort(), ['applicability', 'pageFingerprint'])
        pageDeltas.push({ goalId: p.goalId, changedFields: fields, beforeApplicability: old.applicability, afterApplicability: p.applicability, beforePageFingerprint: old.pageFingerprint, afterPageFingerprint: p.pageFingerprint })
      }
      if (protectedIds.includes(p.goalId)) {
        assert.deepEqual(old, p)
        protectedPages.push({ goalId: p.goalId, goalFingerprint: p.goalFingerprint, pageFingerprint: p.pageFingerprint, wholePageExact: true })
      }
    }
    assert.equal(protectedPages.length, 353)
    assert.equal(pageDeltas.length, 2)
    await writeGoalBookModel(loaded.model, path.join(root, own, 'checks/current394.actual-independent-normal-model.json'))
    write(own + '/checks/normal-source-atlas-and-native-model.actual.json', {
      schemaVersion: 1,
      normalApi: ['buildGoalBookSourceAtlasInputs', 'checkGoalBookSourceAtlasInputs', 'expandGoalBookSourceAtlasReceipt', 'loadGoalBookBuildInputs', 'writeGoalBookModel'],
      pureExecutionCapsuleOutsideCurricula: true,
      capsuleAliasesBoundToExactRegularCommittableInputBytes: 99,
      generatedSourceOutputsByteExactToAuthor: Object.keys(result.outputs).length,
      countsBefore: before.counts, countsAfter: after.counts,
      sourceViews: 24, canonicalCurricularAtomicUnion: 394,
      wholeReceiptWitnessesBefore: before.scopes.reduce((n: number, s: any) => n + s.witnesses.length, 0),
      wholeReceiptWitnessesAfter: after.scopes.reduce((n: number, s: any) => n + s.witnesses.length, 0),
      removedWitnesses: removed.length, removedDirect: 5, removedInherited: 3,
      scopeDeltas, protected353GoalIds: protectedIds, protected353IdSetExact: true,
      current394NormalModelExactToSealedAuthor: true,
      modelRuntimeAssetAliasesUseOnlyFrozenExactRegularPngBytes: publicAliases,
      modelInputsIndependentlyReadAndBoundAfterFIRST: additionalModelInputs,
      allModelNormalizedInputDigestsExactToFrozenAuthorModel: true,
      pageDeltas, wholePageCount: 394, exactWholeNativePages: 392,
      protected353NativePageExactCount: protectedPages.length, protected353Pages: protectedPages,
      all394GoalContentEvidenceFingerprintsExact: true,
      semanticFIRSTPreserved: initialFirstSha === sha(path.join(root, own, 'FIRST.six-source-resolution-independent-a.inspection.json')),
      sourceMappingCompletionClaimed: false, unresolvedCanonicalSourceRequirements: 1,
      humanApproved: 0, strictGain: 0, activeWrites: []
    })
    console.log(JSON.stringify({ normalSourceBuildCheckExit0: true, normalWholeNativeModelExit0: true, sourceViews: 24, canonicalUnion: 394, sourceWitnessesBefore: 3294, sourceWitnessesAfter: 3286, removedDirect: 5, removedInherited: 3, protected353WholePagesExact: true, changedApplicabilityOnlyPages: 2, remainingHB037NeedsCanonicalGoal: true, strictGain: 0, humanApproved: 0 }))
  } finally {
    fs.rmSync(capsule, { recursive: true, force: true })
  }
}
main().catch(err => { console.error(err); process.exit(1) })
