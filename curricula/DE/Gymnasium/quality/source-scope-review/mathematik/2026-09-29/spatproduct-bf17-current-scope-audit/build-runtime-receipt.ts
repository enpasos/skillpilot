import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectAuthoritativeTargetAtomicGoalIds } from '../../../../../../../../app/scripts/compositionViewSourceCoverage'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../..')
const relative = (path: string) => resolve(root, path)
const read = (path: string) => JSON.parse(readFileSync(relative(path), 'utf8'))
const sha256 = (path: string) => `sha256:${createHash('sha256').update(readFileSync(relative(path))).digest('hex')}`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const viewDirectory = 'curricula/DE/Gymnasium/composition-views/mathematik'
const pdfPaths = [
  'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf',
  'curricula/DE/Gymnasium/input/SL/LP_Ma_GOS_HP_G-Kurs_2016_Stand_2019.pdf',
]
const sourceExtractionPaths = readdirSync(relative('curricula/DE/Gymnasium/input'))
  .map((state) => {
    const directory = `curricula/DE/Gymnasium/input/${state}/upper-secondary/source-extraction`
    try {
      const name = readdirSync(relative(directory)).find((file) => file.includes('MATHEMATIK') && file.endsWith('.source-extraction.json'))
      return name ? `${directory}/${name}` : null
    } catch {
      return null
    }
  })
  .filter((path): path is string => path !== null)
const spatproduct = '944dd479-9f30-5acb-ab32-3ea0b6dc8e06'
const extendedFunction = 'bf17cada-3ccd-5d9a-b9e3-42065cfdbb01'
const spatVolume = 'a594dec0-3977-5c43-9432-d4254a7f6130'
const lkDerivation = 'e9181209-1506-59df-9053-17f36b91bb06'
const volumeExam = '1878f680-095c-511d-aaed-e98393f7fde9'
const auditedGoalIds = [spatproduct, extendedFunction, spatVolume, lkDerivation, volumeExam]
const canon = read(canonicalPath)

const nodes = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.flatMap(nodes)
  if (value && typeof value === 'object') {
    const item = value as Record<string, unknown>
    return [item, ...Object.values(item).flatMap(nodes)]
  }
  return []
}

const views = readdirSync(relative(viewDirectory))
  .filter((name) => name.endsWith('.view.json'))
  .map((name) => {
    const path = `${viewDirectory}/${name}`
    const raw = read(path)
    const scope = raw.scope ?? {}
    if (scope.stage === 'SekI' || !['GK', 'LK'].includes(scope.courseProfile)) return null
    const targets = collectAuthoritativeTargetAtomicGoalIds(canon, raw)
    const entries = nodes(raw.rootNodes)
    const directRole = (goalId: string) => entries
      .filter((entry) => entry.kind === 'goalEntry' && entry.goalId === goalId)
      .map((entry) => entry.projectionRole ?? 'target')
    return {
      path,
      sha256: sha256(path),
      jurisdiction: scope.jurisdiction,
      courseProfile: scope.courseProfile,
      stage: scope.stage ?? null,
      durationModel: scope.durationModel ?? null,
      targets: Object.fromEntries(auditedGoalIds.map((goalId) => [goalId, targets.has(goalId)])),
      directGoalEntryRoles: Object.fromEntries(auditedGoalIds.map((goalId) => [goalId, directRole(goalId)])),
    }
  })
  .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
  .sort((left, right) => left.path.localeCompare(right.path))

const heGK = views.filter((view) => view.jurisdiction === 'DE-HE' && view.courseProfile === 'GK')
const heLK = views.filter((view) => view.jurisdiction === 'DE-HE' && view.courseProfile === 'LK')
const bfGKTargets = views.filter((view) => view.courseProfile === 'GK' && view.targets[extendedFunction])
const bfStateGKTargets = bfGKTargets.filter((view) => typeof view.jurisdiction === 'string')
const bfNationalGKTargets = bfGKTargets.filter((view) => view.jurisdiction === undefined)
const slGK = views.filter((view) => view.jurisdiction === 'DE-SL' && view.courseProfile === 'GK')
assert.equal(heGK.length, 4)
assert.ok(heGK.every((view) => !view.targets[spatproduct] && !view.targets[extendedFunction] && !view.targets[spatVolume] && !view.targets[lkDerivation]))
assert.ok(heGK.every((view) => view.targets[volumeExam]))
assert.ok(heGK.every((view) => [spatproduct, spatVolume, lkDerivation].every((goalId) => view.directGoalEntryRoles[goalId].includes('prerequisiteOnly'))))
assert.equal(heLK.length, 4)
assert.ok(heLK.every((view) => view.targets[spatproduct] && view.targets[extendedFunction]))
assert.equal(bfGKTargets.length, 34)
assert.equal(bfStateGKTargets.length, 32)
assert.equal(bfNationalGKTargets.length, 2)
assert.equal(slGK.length, 2)
assert.ok(slGK.every((view) => view.targets[spatproduct]))
const exam = canon.goals.find((goal: Record<string, unknown>) => goal.id === volumeExam)
const examinedCompetencies = [
  '288633c1-f61c-5b48-af7e-a80357f96cad',
  '9460c3ff-e72d-4107-bc73-087d217200aa',
  '5f548596-9bc3-532e-88a0-81d5029809e9',
  '5390691d-1b7c-5572-9589-a69c2bba9a27',
]
assert.deepEqual(exam?.requires, examinedCompetencies)
assert.deepEqual(exam?.examData?.coveredGoalIds, examinedCompetencies)

const primarySourceSearch = sourceExtractionPaths.flatMap((extractionPath) => {
  const extraction = read(extractionPath)
  const jurisdiction = extraction.jurisdiction as string
  if (!bfStateGKTargets.some((view) => view.jurisdiction === jurisdiction)) return []
  const documents = extraction.sourceDocuments ?? (extraction.sourceDocument ? [extraction.sourceDocument] : [])
  const selected = documents.filter((doc: Record<string, unknown>) => {
    if (typeof doc.path !== 'string' || doc.path.includes('Entwurfsfassung')) return false
    return jurisdiction !== 'DE-SL' || doc.key === 'SL_GOS_MATHEMATIK_GK_2019'
  })
  return selected.map((doc: Record<string, string>) => {
    const text = execFileSync('pdftotext', ['-layout', relative(doc.path), '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    const pages = [...text.matchAll(/logist/giu)].map((match) => text.slice(0, match.index).split('\f').length)
    return {
      jurisdiction,
      sourceExtractionPath: extractionPath,
      sourceDocumentKey: doc.key,
      pdfPath: doc.path,
      pdfSha256: sha256(doc.path),
      literalLogisticHits: pages.length,
      literalLogisticPdfPages: [...new Set(pages)].sort((a, b) => a - b),
    }
  })
}).sort((left, right) => `${left.jurisdiction}:${left.sourceDocumentKey}`.localeCompare(`${right.jurisdiction}:${right.sourceDocumentKey}`))
assert.equal(new Set(primarySourceSearch.map((source) => source.jurisdiction)).size, 14)

const receipt = {
  schemaVersion: 1,
  auditId: 'mathematik-m7-spatproduct-bf17-runtime-source-scope-20260929-v1',
  reviewAuthority: 'ai_candidate',
  humanApprovalClaimed: false,
  runtimeEvaluator: 'app/scripts/compositionViewSourceCoverage.ts:collectAuthoritativeTargetAtomicGoalIds',
  canonical: { path: canonicalPath, sha256: sha256(canonicalPath) },
  primarySources: pdfPaths.map((path) => ({ path, sha256: sha256(path) })),
  counts: {
    heGK: heGK.length,
    heLK: heLK.length,
    bf17GKTargetViews: bfGKTargets.length,
    bf17StateGKTargetViews: bfStateGKTargets.length,
    bf17NationalGKTargetViews: bfNationalGKTargets.length,
    slGK: slGK.length,
  },
  volumeExam: { goalId: volumeExam, requires: examinedCompetencies, coveredGoalIds: examinedCompetencies },
  primarySourceSearch,
  views,
}
writeFileSync(resolve(here, 'runtime-targets.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(`${basename(here)}: HE GK ${heGK.length}, HE LK ${heLK.length}, bf17 GK target views ${bfGKTargets.length}, SL GK ${slGK.length}`)
