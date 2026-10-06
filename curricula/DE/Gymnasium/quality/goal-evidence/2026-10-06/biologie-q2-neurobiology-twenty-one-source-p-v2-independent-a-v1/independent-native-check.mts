// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'

const out = dirname(fileURLToPath(import.meta.url))
const root = resolve(out, '../../../../../../..')
const author = resolve(out, '../biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2')
const iso = resolve(root, 'tmp/biologie-neuro21-v2-independent-a-primary/native-inputs')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const write = (p: string, value: any) => {
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n')
}
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const native = async (name: string) => import(pathToFileURL(resolve(iso, 'app/scripts', name)).href)
const { buildGoalBookSourceAtlasInputs } = await native('goalBookSourceAtlasInputs.ts')
const { loadGoalBookBuildInputs } = await native('goalBookModel.ts')
const { validatePositiveGoalEvidenceRecordSemantics } = await native('positiveGoalEvidenceProfileModel.ts')

const rpPath = 'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_BIOLOGIE_SEKI_RAHMENLEHRPLAN_2014.source-extraction.json'
writeFileSync(resolve(iso, rpPath), readFileSync(resolve(author, 'additive-rp-exact-raw-source-final-v2/RP.extraction.exact-raw-source.author-v2.candidate.json')))
const original = read(resolve(iso, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'))
if (original.expectedCurricularAtomicGoalCount !== 383) throw Error('Original count contract has already been changed')
let failed: any
try {
  buildGoalBookSourceAtlasInputs(original, iso)
} catch (e: any) {
  failed = { status: 'FAIL', message: e.message, expected: e.expected, actual: e.actual }
}
if (!failed || failed.expected !== 383 || failed.actual !== 375) throw Error('Expected genuine original383 contract failure')
const diagnostic = buildGoalBookSourceAtlasInputs({ ...original, expectedCurricularAtomicGoalCount: 375 }, iso)
for (const [path, bytes] of Object.entries(diagnostic.outputs)) {
  mkdirSync(dirname(resolve(iso, path)), { recursive: true })
  writeFileSync(resolve(iso, path), bytes as string)
}
const atlas = (await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json', iso)).model
const full = (await loadGoalBookBuildInputs('app/scripts/config/goal-books/neuro21-author-full383.json', iso)).model
const frozenAtlas = read(resolve(author, 'additive-rp-exact-raw-source-final-v2/sourceAtlas.after-exact-rp-raw-source.actual.book-model.json'))
const frozenFull = read(resolve(author, 'additive-rp-exact-raw-source-final-v2/fullCatalogue.after-exact-rp-raw-source.actual.book-model.json'))
const exactAtlasPages = JSON.stringify(atlas.pages) === JSON.stringify(frozenAtlas.pages)
const exactFullPages = JSON.stringify(full.pages) === JSON.stringify(frozenFull.pages)
if (!exactAtlasPages || !exactFullPages) throw Error('Independent native reconstruction differs from final effective inputs')

const records = readFileSync(resolve(author, 'positive-evidence.author-v2.actual.candidate.jsonl'), 'utf8').trim().split('\n').map(JSON.parse)
const landscape = read(resolve(author, 'canonical.current464.author-v2.candidate.json'))
const goals = new Map(landscape.goals.map((g: any) => [g.id, g]))
const require = createRequire(resolve(iso, 'app/package.json'))
const Ajv = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const ajv = new Ajv({ strict: true, allErrors: true }); addFormats(ajv)
const schemaPath = resolve(iso, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const validate = ajv.compile(read(schemaPath))
const errors: string[] = []
for (const r of records) {
  if (!validate(r)) errors.push(r.goalId + ': ' + ajv.errorsText(validate.errors))
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(r, goals.get(r.goalId), {}, 'curricularAtomic'))
  if (r.status !== 'needs_human_review' || r.reviewAuthority !== 'ai_candidate' || r.evidenceLevel !== 'E1' || r.maximumClaimScope !== 'G1') errors.push(r.goalId + ': invalid claim scope')
}
if (records.length !== 21 || errors.length) throw Error(JSON.stringify({ records: records.length, errors }))
write(resolve(out, 'independent-native.actual.receipt.json'), {
  schemaVersion: 1, actor: '/root/bio_neuro_v2_independent_a',
  nativeCodeSource: 'exact native-inputs code from sealed author review ZIP',
  originalSourceAtlasContract: failed, diagnostic375Only: true,
  independentlyReconstructedSourceAtlasPages: atlas.pages.length,
  independentlyReconstructedFullCataloguePages: full.pages.length,
  allEffectiveFrozenAtlasWholepagesExact: exactAtlasPages,
  allEffectiveFrozenFullWholepagesExact: exactFullPages,
  effectiveRPInputSha256: sha(resolve(iso, rpPath)),
  nativePRecords: records.length, nativePErrors: errors,
  nativePSchemaSha256: sha(schemaPath),
  retainedPStatus: 'needs_human_review', retainedAuthority: 'ai_candidate',
  syntheticCases: records.reduce((n: number, r: any) => n + r.profile.applicationCaseBriefs.length, 0),
  observedLearnerDemonstrations: 0, evidenceLevel: 'E1', maximumClaimScope: 'G1',
  integrationReady: false, currentM7Approval: false, humanApproval: false,
  writesOutsideIndependentOutput: ['tmp/biologie-neuro21-v2-independent-a-primary/native-inputs only'],
})
console.log(JSON.stringify({ original383: failed.status, diagnosticAtlas: atlas.pages.length, full: full.pages.length, exactFinalPages: exactAtlasPages && exactFullPages, P21CandidateSchema: 'PASS', errors }))
