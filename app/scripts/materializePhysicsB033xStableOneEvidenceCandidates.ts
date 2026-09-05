import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'

type ReviewRecord = {
  recordId: string
  goalId: string
  decision: string
  evidenceProfileContract: string
  evidenceProfileRecommendation: string
  recordStatus: string
  reviewAuthority: string
  understandingEvidence: {
    essentialUnderstandingDe: string
    essentialUnderstandingEn: string
    observablePerformanceDe: string
    observablePerformanceEn: string
    transferExpectationDe: string
    transferExpectationEn: string
  }
}
type BoundRecord = { record: ReviewRecord; digest: `sha256:${string}` }

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const unexpected = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unexpected.length > 0) throw new Error(`Unknown arguments: ${unexpected.join(', ')}`)

const batchDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033x-final-current-recheck-2-v1',
)
const resultStem = 'physik-rollout-v1-batch-033x-final-current-recheck-2-v1-20260905-first-pass'
const roundAPath = join(batchDirectory, `round-a/results/${resultStem}-a.batch-001.records.jsonl`)
const roundBPath = join(batchDirectory, `round-b/results/${resultStem}-b.batch-001.records.jsonl`)
const dualSummaryPath = join(batchDirectory, 'dual-summary.json')
const synthesisPath = join(batchDirectory, 'synthesis-decisions.stable-current-carryover-1-v1.json')
const resolutionPath = join(
  batchDirectory,
  'resolutions-stable-current-carryover-1-v1/b2fb9a25-4d26-5cf2-a917-823909dcb6bd.resolution.json',
)
const resolutionIndexPath = join(batchDirectory, 'resolution-index.stable-current-carryover-1-v1.json')
const receiptPath = join(batchDirectory, 'stable-current-carryover-1-v1.compatibility-receipt.json')
const outputPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-033x-stable-current-carryover-1-v1.candidates.json',
)
const reviewId = 'canonical-physics-positive-evidence-v1-b033x-stable-current-carryover-1-v1'
const goalId = 'b2fb9a25-4d26-5cf2-a917-823909dcb6bd'
const disputedGoalId = 'a684bec1-ba59-59d0-98d2-4ca37236f64c'

const sha256 = (value: Buffer | string): `sha256:${string}` => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const parseRecords = (bytes: Buffer): BoundRecord[] => bytes.toString('utf8')
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => ({ record: JSON.parse(line) as ReviewRecord, digest: sha256(line) }))
const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const exactlyOne = (records: BoundRecord[], expectedGoalId: string): BoundRecord => {
  const matches = records.filter(({ record }) => record.goalId === expectedGoalId)
  if (matches.length !== 1 || !matches[0]) throw new Error(`${expectedGoalId}: expected exactly one source record`)
  return matches[0]
}

const buildProfile = (first: ReviewRecord, second: ReviewRecord): PositiveGoalEvidenceProfile => {
  const a = first.understandingEvidence
  const b = second.understandingEvidence
  return {
    archetype: 'procedure',
    expectations: [
      {
        id: 'independent-review-a-understanding',
        essentialUnderstandingDe: a.essentialUnderstandingDe,
        essentialUnderstandingEn: a.essentialUnderstandingEn,
        observablePerformanceDe: a.observablePerformanceDe,
        observablePerformanceEn: a.observablePerformanceEn,
      },
      {
        id: 'independent-review-b-understanding',
        essentialUnderstandingDe: b.essentialUnderstandingDe,
        essentialUnderstandingEn: b.essentialUnderstandingEn,
        observablePerformanceDe: b.observablePerformanceDe,
        observablePerformanceEn: b.observablePerformanceEn,
      },
    ],
    coverageExpectations: {
      requiredExpectationIds: [
        'independent-review-a-understanding',
        'independent-review-b-understanding',
      ],
      alternativeExpectationGroups: [],
      minimumIndependentDemonstrations: 2,
      freshVariationRequired: true,
      independentTransferRequired: true,
    },
    variationAxes: [
      {
        id: 'changed-initial-state-and-reference-convention',
        textDe: 'Anfangsauslenkung, Anfangsgeschwindigkeit, Zeitnullpunkt oder Koordinatenrichtung werden so verändert, dass Amplitude und Phase neu und mit konsistenter Vorzeichenkonvention bestimmt werden müssen.',
        textEn: 'Initial displacement, initial velocity, time origin, or coordinate direction is changed so that amplitude and phase must be determined anew using a consistent sign convention.',
      },
      {
        id: 'equivalent-solution-representation',
        textDe: 'Die Lösung wird zwischen Sinus-Kosinus-Linearkombination, Amplituden-Phasen-Form und Zeitdiagramm übersetzt; die Gleichwertigkeit wird über Gleichung und Anfangsbedingungen geprüft.',
        textEn: 'The solution is translated among a sine-cosine linear combination, amplitude-phase form, and time graph; equivalence is checked against the equation and initial conditions.',
      },
      {
        id: 'undamped-model-validity-boundary',
        textDe: 'Ein Fall erfüllt das ungedämpfte lineare Modell, während ein zweiter Datensatz oder Verlauf eine erkennbare Dämpfung oder andere Modellabweichung enthält, die als Grenze der verwendeten Lösung benannt werden muss.',
        textEn: 'One case satisfies the linear undamped model, while a second data set or trajectory contains detectable damping or another model deviation that must be identified as a limit of the solution used.',
      },
    ],
    applicationCaseBriefs: [
      {
        id: 'fresh-independent-case-a',
        taskDemandDe: a.transferExpectationDe,
        taskDemandEn: a.transferExpectationEn,
        expectedPerformanceDe: a.observablePerformanceDe,
        expectedPerformanceEn: a.observablePerformanceEn,
        understandingFocusDe: a.essentialUnderstandingDe,
        understandingFocusEn: a.essentialUnderstandingEn,
      },
      {
        id: 'fresh-independent-case-b',
        taskDemandDe: b.transferExpectationDe,
        taskDemandEn: b.transferExpectationEn,
        expectedPerformanceDe: b.observablePerformanceDe,
        expectedPerformanceEn: b.observablePerformanceEn,
        understandingFocusDe: b.essentialUnderstandingDe,
        understandingFocusEn: b.essentialUnderstandingEn,
      },
    ],
  }
}

const main = async (): Promise<void> => {
  const [roundABytes, roundBBytes, dualBytes, synthesisBytes, resolutionBytes, indexBytes, receiptBytes] = await Promise.all([
    readFile(roundAPath),
    readFile(roundBPath),
    readFile(dualSummaryPath),
    readFile(synthesisPath),
    readFile(resolutionPath),
    readFile(resolutionIndexPath),
    readFile(receiptPath),
  ])
  const first = exactlyOne(parseRecords(roundABytes), goalId)
  const second = exactlyOne(parseRecords(roundBBytes), goalId)
  const dual = JSON.parse(dualBytes.toString('utf8')) as {
    goalCount?: number
    goals?: Array<{ goalId?: string; firstDecision?: string; secondDecision?: string }>
  }
  const synthesis = JSON.parse(synthesisBytes.toString('utf8')) as {
    synthesizedAt?: string
    decisions?: Array<{
      goalId?: string
      resolutionDecision?: string
      evidenceRound?: string
      records?: {
        first?: { recordId?: string; recordDigest?: string }
        second?: { recordId?: string; recordDigest?: string }
      }
    }>
  }
  const resolution = JSON.parse(resolutionBytes.toString('utf8')) as {
    goal?: { goalId?: string }
    status?: string
    decision?: string
  }
  const index = JSON.parse(indexBytes.toString('utf8')) as {
    strictDescriptionReviewCompleteCount?: number
    groups?: Array<{ campaignGoalCount?: number; resolvedGoalCount?: number }>
    resolutions?: Array<{ goalId?: string; decision?: string; strictDescriptionComplete?: boolean }>
  }
  const receipt = JSON.parse(receiptBytes.toString('utf8')) as {
    claimedGoalIds?: string[]
    explicitlyExcludedDisputedGoalIds?: string[]
    source?: {
      roundA?: { recordsDigest?: string }
      roundB?: { recordsDigest?: string }
    }
    synthesisManifestDigest?: string
    resolutionIndexDigest?: string
  }
  const selected = synthesis.decisions?.[0]
  const stableSummary = dual.goals?.find(({ goalId: candidate }) => candidate === goalId)
  const disputedSummary = dual.goals?.find(({ goalId: candidate }) => candidate === disputedGoalId)
  if (
    dual.goalCount !== 2
    || stableSummary?.firstDecision !== 'keep'
    || stableSummary.secondDecision !== 'keep'
    || disputedSummary?.firstDecision !== 'split_review'
    || disputedSummary.secondDecision !== 'keep'
    || synthesis.decisions?.length !== 1
    || selected?.goalId !== goalId
    || selected.resolutionDecision !== 'keep_current'
    || selected.evidenceRound !== 'second'
    || selected.records?.first?.recordId !== first.record.recordId
    || selected.records.first.recordDigest !== first.digest
    || selected.records?.second?.recordId !== second.record.recordId
    || selected.records.second.recordDigest !== second.digest
    || resolution.goal?.goalId !== goalId
    || resolution.status !== 'resolved'
    || resolution.decision !== 'keep_current'
    || index.strictDescriptionReviewCompleteCount !== 1
    || index.groups?.length !== 1
    || index.groups[0]?.campaignGoalCount !== 2
    || index.groups[0].resolvedGoalCount !== 1
    || index.resolutions?.length !== 1
    || index.resolutions[0]?.goalId !== goalId
    || index.resolutions[0].decision !== 'keep_current'
    || index.resolutions[0].strictDescriptionComplete !== true
    || JSON.stringify(receipt.claimedGoalIds) !== JSON.stringify([goalId])
    || JSON.stringify(receipt.explicitlyExcludedDisputedGoalIds) !== JSON.stringify([disputedGoalId])
    || receipt.source?.roundA?.recordsDigest !== sha256(roundABytes)
    || receipt.source?.roundB?.recordsDigest !== sha256(roundBBytes)
    || receipt.synthesisManifestDigest !== sha256(synthesisBytes)
    || receipt.resolutionIndexDigest !== sha256(indexBytes)
  ) throw new Error('B033x stable-one resolution or exclusion bindings are invalid')
  for (const [label, bound] of [['first', first], ['second', second]] as const) {
    if (
      bound.record.decision !== 'keep'
      || bound.record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
      || bound.record.evidenceProfileRecommendation !== 'create'
      || bound.record.recordStatus !== 'candidate'
      || bound.record.reviewAuthority !== 'ai_candidate'
    ) throw new Error(`${goalId}: ${label} source is not a valid KEEP V2 AI candidate`)
  }
  if (!synthesis.synthesizedAt || !Number.isFinite(Date.parse(synthesis.synthesizedAt))) {
    throw new Error('B033x synthesis timestamp is invalid')
  }
  const output = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId,
    reviewedAt: synthesis.synthesizedAt,
    reviewer: 'codex-physics-rollout-v1-batch-033x-stable-current-carryover-1-positive-understanding-candidate-author-2026-09-05',
    goals: [{
      goalId,
      reason: `DE: Das Profil bindet die zwei unabhängig erzeugten, exakten KEEP-Evidenzblöcke ${first.record.recordId} und ${second.record.recordId}. Beide DE/EN-Verständniserwartungen bleiben verpflichtend; zwei eigenständige Transferfälle sowie zielgenaue Variationsachsen zu Anfangszustand und Bezugskonvention, äquivalenten Lösungsdarstellungen und der Geltungsgrenze des ungedämpften Modells verhindern bloße Formelreproduktion. Das strittige Ziel ${disputedGoalId} ist nicht enthalten. EN: The profile binds the two independently generated, exact KEEP evidence blocks ${first.record.recordId} and ${second.record.recordId}. Both DE/EN understanding expectations remain required; two independent transfer cases and goal-specific variation axes covering initial state and reference convention, equivalent solution representations, and the validity boundary of the undamped model prevent mere formula reproduction. The disputed goal ${disputedGoalId} is not included.`,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile: buildProfile(first.record, second.record),
    }],
  }
  const bytes = jsonBytes(output)
  const current = await readOptional(outputPath)
  if (current && !current.equals(bytes)) throw new Error(`Existing B033x stable-one evidence candidates are stale: ${outputPath}`)
  if (!current && !write) throw new Error(`Missing B033x stable-one evidence candidates: ${outputPath}`)
  if (!current && write) {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, bytes, { flag: 'wx' })
  }
  console.log(
    `Physics B033x stable-one evidence candidates ${write ? 'materialized' : 'valid'}: goals=1; candidates=${sha256(bytes)}; synthesis=${sha256(synthesisBytes)}; index=${sha256(indexBytes)}; receipt=${sha256(receiptBytes)}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
