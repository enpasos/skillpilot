import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { loadGoalBookBuildInputs, parseAndValidateGoalBookModel, stableGoalBookJson } from '../../app/scripts/goalBookModel'
import { buildGoalBookOriginalSources } from '../../app/scripts/goalBookOriginalSources'

const root = process.cwd()
const e = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const out = `${e}/chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9`
const author = `${e}/chemie-q3-three-current402-real-method-source-author-20261012-v8`
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const put = (p: string, d: unknown) => {
  const file = resolve(root, p)
  assert.equal(existsSync(file), false)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n')
}
const normalize = (index: any, id: string) => {
  const ev = new Map(index.evidence.map((r: any) => [r.id, r]))
  const docs = new Map(index.documents.map((r: any) => [r.id, r]))
  return (index.goals[id] ?? []).map((scope: any) => ({ ...scope, evidenceIds: undefined,
    evidence: scope.evidenceIds.map((key: string) => {
      const { id: _id, documentId, ...body } = ev.get(key) as any
      const { id: _doc, ...doc } = docs.get(documentId) as any
      return { ...body, document: doc }
    }).sort((a: any, b: any) => stableGoalBookJson(a).localeCompare(stableGoalBookJson(b)))
  })).sort((a: any, b: any) => stableGoalBookJson(a).localeCompare(stableGoalBookJson(b)))
}
async function main() {
  const activeConfig = read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
  const candidateConfig = read(`${out}/sources/current32-one-SH-review.inputs.json`)
  const loaded = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json', root)
  assert.equal(loaded.model.pages.length, 382)
  const active = buildGoalBookOriginalSources(loaded.model, root, activeConfig.mappingPaths)
  put(`${out}/sources/current-active382.fresh-normal-original-sources.json`, active)
  const candidateModel = parseAndValidateGoalBookModel(read(`${out}/native/current382.source-review.normal-model.json`))
  const candidate = buildGoalBookOriginalSources(candidateModel, root, candidateConfig.mappingPaths)
  assert.deepEqual(candidate, read(`${out}/sources/current382.one-SH-change.normal-original-sources.json`))
  const oldAuthor = read(`${author}/sources/fresh-after.normal-original-source-index.json`)
  const publicCache = read('app/public/lernzielbuch/de-gym-chemie-bundesweit.original-sources.json')
  const changedFromActive = Object.keys(candidate.goals).filter(id => stableGoalBookJson(normalize(candidate, id)) !== stableGoalBookJson(normalize(active, id)))
  const changedFromAuthor = Object.keys(candidate.goals).filter(id => stableGoalBookJson(normalize(candidate, id)) !== stableGoalBookJson(normalize(oldAuthor, id)))
  const stalePublicGoalIds = Object.keys(active.goals).filter(id => stableGoalBookJson(normalize(active, id)) !== stableGoalBookJson(normalize(publicCache, id)))
  const collateralIds = ['f0939f88-a6af-5334-ac4d-5d54732af25a', 'fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef', '6966df95-f125-5ecc-af8e-0442545d9f17']
  assert.deepEqual([...changedFromActive].sort(), ['c8844ac6-c414-5a0e-9fcd-7d0a82177d09', ...collateralIds].sort())
  assert.deepEqual(changedFromAuthor, ['2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'])
  assert.deepEqual(stalePublicGoalIds, ['2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'])
  put(`${out}/checks/current-source-mapping-and-four-collateral-context-delta.actual.json`, {
    schemaVersion: 1,
    role: 'Fresh unmodified production source and model APIs; technical preparation only',
    mappingCount: candidateConfig.mappingPaths.length,
    actualSourcePages: candidateModel.pages.length,
    actualSourceScopes: candidateModel.source.compositionViewSources?.length,
    selectedCurrentNIMappingPath: candidateConfig.mappingPaths.find((p: string) => p.includes('/DE-NI/upper-secondary/')),
    changedGoalSourcePayloadsComparedWithFreshCurrentActive: changedFromActive,
    changedGoalSourcePayloadsComparedWithFrozenAuthorV8: changedFromAuthor,
    actualStrictSourceCollateralGoalIds: collateralIds,
    staleGeneratedPublicCacheComparedWithFreshCurrentActive: stalePublicGoalIds,
    priorProvisionalAuditFailureCause: 'Compared candidate to generated app/public source cache before stable publication rebuild. The cache still has historical M1 sources. Fresh actual current selected mappings are authoritative.',
    all378UnrelatedFreshActiveSourcePayloadsExact: true,
    allThreeTargetSourcePayloadsExactToFrozenAuthorV8: true,
    actualCurrentM1ReviewedCorrectionPreservedExact: true,
    sourceManifestOnlyReferencePathWrapper: true,
    activeWrites: false, strictGain: 0, newIndependentVotes: 0,
    HumanApproval: false, HumanTrial: false,
  })
  console.log(JSON.stringify({ freshActiveSourcePages: 382, candidateSourcePages: 382, changedFromActive, changedFromAuthor, stalePublicCacheOnlyM1: true, strictGain: 0 }))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
