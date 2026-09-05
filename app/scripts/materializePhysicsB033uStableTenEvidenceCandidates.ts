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
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const batchDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033u-final-revisions-context-recheck-17-v1',
)
const resultStem = 'physik-rollout-v1-batch-033u-final-revisions-context-recheck-17-v1-20260905-first-pass'
const roundAPath = join(batchDirectory, `round-a/results/${resultStem}-a.batch-001.records.jsonl`)
const roundBPath = join(batchDirectory, `round-b/results/${resultStem}-b.batch-001.records.jsonl`)
const dualSummaryPath = join(batchDirectory, 'dual-summary.json')
const synthesisPath = join(batchDirectory, 'synthesis-decisions.stable-current-carryover-10-v1.json')
const resolutionIndexPath = join(batchDirectory, 'resolution-index.stable-current-carryover-10-v1.json')
const outputPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-033u-stable-current-10-v1.candidates.json',
)
const reviewId = 'canonical-physics-positive-evidence-v1-b033u-stable-current-10-v1'
const goalIds = [
  '9f59a088-3939-59e9-821d-167fadfda782',
  '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
  '09e058e9-f3ed-5046-b0e9-495b694bf2a1',
  'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e',
  '0f803c37-8191-5a07-9b31-9603ded98fe2',
  'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
  '73b309ed-1aab-5778-8494-d9b65f5a352b',
  'e3bce51c-cfeb-4706-b95e-a22b76e7dd73',
  '38e0ff49-f132-44c8-b17a-73dada5344db',
  'e19fccd7-6a35-5c9e-86e1-dcca76481e9c',
] as const
const archetypes = new Map<string, PositiveGoalEvidenceProfile['archetype']>([
  ['9f59a088-3939-59e9-821d-167fadfda782', 'modeling'],
  ['2622bef1-bdbc-504e-b468-b600b2ca3ed8', 'representation'],
  ['09e058e9-f3ed-5046-b0e9-495b694bf2a1', 'data'],
  ['db47ac91-7bb0-5ba3-b39d-e2d6fc98396e', 'modeling'],
  ['0f803c37-8191-5a07-9b31-9603ded98fe2', 'experiment'],
  ['ac4ba260-6086-5fcc-bea2-c06f1425a1cc', 'modeling'],
  ['73b309ed-1aab-5778-8494-d9b65f5a352b', 'modeling'],
  ['e3bce51c-cfeb-4706-b95e-a22b76e7dd73', 'representation'],
  ['38e0ff49-f132-44c8-b17a-73dada5344db', 'proof'],
  ['e19fccd7-6a35-5c9e-86e1-dcca76481e9c', 'modeling'],
])

const sha256 = (value: Buffer | string): `sha256:${string}` => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const parseRecords = (bytes: Buffer): BoundRecord[] => bytes.toString('utf8')
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => ({ record: JSON.parse(line) as ReviewRecord, digest: sha256(line) }))

const buildProfile = (
  goalId: string,
  first: ReviewRecord,
  second: ReviewRecord,
): PositiveGoalEvidenceProfile => {
  const archetype = archetypes.get(goalId)
  if (!archetype) throw new Error(`${goalId}: missing evidence archetype`)
  const firstEvidence = first.understandingEvidence
  const secondEvidence = second.understandingEvidence
  return {
    archetype,
    expectations: [
      {
        id: 'independent-review-a-understanding',
        essentialUnderstandingDe: firstEvidence.essentialUnderstandingDe,
        essentialUnderstandingEn: firstEvidence.essentialUnderstandingEn,
        observablePerformanceDe: firstEvidence.observablePerformanceDe,
        observablePerformanceEn: firstEvidence.observablePerformanceEn,
      },
      {
        id: 'independent-review-b-understanding',
        essentialUnderstandingDe: secondEvidence.essentialUnderstandingDe,
        essentialUnderstandingEn: secondEvidence.essentialUnderstandingEn,
        observablePerformanceDe: secondEvidence.observablePerformanceDe,
        observablePerformanceEn: secondEvidence.observablePerformanceEn,
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
        id: 'changed-physical-condition',
        textDe: 'Mindestens eine relevante Größe, Geometrie, Rand- oder Anfangsbedingung wird gegenüber dem Ausgangsfall verändert.',
        textEn: 'At least one relevant quantity, geometry, boundary condition, or initial condition is changed from the original case.',
      },
      {
        id: 'changed-evidence-representation',
        textDe: 'Die fachliche Information liegt in einer anderen geeigneten Darstellung vor, etwa als Diagramm, Datensatz, Skizze, Formel, Simulation oder belegte Quelle.',
        textEn: 'The scientific information is supplied in another suitable representation, such as a diagram, data set, sketch, formula, simulation, or evidenced source.',
      },
      {
        id: 'model-validity-boundary',
        textDe: 'Ein Fall erfüllt die idealisierenden Annahmen, der andere enthält eine benannte Nichtidealität oder Informationsgrenze.',
        textEn: 'One case satisfies the idealizing assumptions, while the other contains a stated non-ideality or information limit.',
      },
    ],
    applicationCaseBriefs: [
      {
        id: 'fresh-independent-case-a',
        taskDemandDe: firstEvidence.transferExpectationDe,
        taskDemandEn: firstEvidence.transferExpectationEn,
        expectedPerformanceDe: firstEvidence.observablePerformanceDe,
        expectedPerformanceEn: firstEvidence.observablePerformanceEn,
        understandingFocusDe: firstEvidence.essentialUnderstandingDe,
        understandingFocusEn: firstEvidence.essentialUnderstandingEn,
      },
      {
        id: 'fresh-independent-case-b',
        taskDemandDe: secondEvidence.transferExpectationDe,
        taskDemandEn: secondEvidence.transferExpectationEn,
        expectedPerformanceDe: secondEvidence.observablePerformanceDe,
        expectedPerformanceEn: secondEvidence.observablePerformanceEn,
        understandingFocusDe: secondEvidence.essentialUnderstandingDe,
        understandingFocusEn: secondEvidence.essentialUnderstandingEn,
      },
    ],
  }
}

const main = async (): Promise<void> => {
  const [roundABytes, roundBBytes, dualBytes, synthesisBytes, indexBytes] = await Promise.all([
    readFile(roundAPath),
    readFile(roundBPath),
    readFile(dualSummaryPath),
    readFile(synthesisPath),
    readFile(resolutionIndexPath),
  ])
  const roundA = parseRecords(roundABytes)
  const roundB = parseRecords(roundBBytes)
  const dual = JSON.parse(dualBytes.toString('utf8')) as {
    goalCount?: number
    goals?: Array<{ goalId?: string; firstDecision?: string; secondDecision?: string }>
  }
  const synthesis = JSON.parse(synthesisBytes.toString('utf8')) as {
    decisions?: Array<{
      goalId?: string
      evidenceRound?: string
      resolutionDecision?: string
      records?: { first?: { recordId?: string; recordDigest?: string }; second?: { recordId?: string; recordDigest?: string } }
    }>
  }
  const index = JSON.parse(indexBytes.toString('utf8')) as {
    groups?: Array<{ campaignGoalCount?: number; resolvedGoalCount?: number }>
    resolutions?: Array<{ goalId?: string; decision?: string; strictDescriptionComplete?: boolean }>
  }
  if (
    dual.goalCount !== 17
    || index.groups?.length !== 1
    || index.groups[0]?.campaignGoalCount !== 17
    || index.groups[0]?.resolvedGoalCount !== 10
    || !sameOrdered(index.resolutions?.map(({ goalId }) => goalId ?? '') ?? [], goalIds)
    || index.resolutions?.some((resolution) => resolution.decision !== 'keep_current' || resolution.strictDescriptionComplete !== true)
    || !sameOrdered(synthesis.decisions?.map(({ goalId }) => goalId ?? '') ?? [], goalIds)
  ) throw new Error('Physics B033u stable10 synthesis or resolution scope is invalid')

  const byGoal = (records: BoundRecord[], goalId: string): BoundRecord => {
    const matches = records.filter(({ record }) => record.goalId === goalId)
    if (matches.length !== 1 || !matches[0]) throw new Error(`${goalId}: expected exactly one source record`)
    return matches[0]
  }
  const candidates = goalIds.map((goalId) => {
    const first = byGoal(roundA, goalId)
    const second = byGoal(roundB, goalId)
    const summary = dual.goals?.find((goal) => goal.goalId === goalId)
    const decision = synthesis.decisions?.find((candidate) => candidate.goalId === goalId)
    if (
      summary?.firstDecision !== 'keep'
      || summary.secondDecision !== 'keep'
      || decision?.resolutionDecision !== 'keep_current'
      || decision.evidenceRound !== 'second'
      || decision.records?.first?.recordId !== first.record.recordId
      || decision.records.first.recordDigest !== first.digest
      || decision.records?.second?.recordId !== second.record.recordId
      || decision.records.second.recordDigest !== second.digest
    ) throw new Error(`${goalId}: evidence selection is not bound to both exact KEEP sources`)
    for (const [label, bound] of [['first', first], ['second', second]] as const) {
      const record = bound.record
      if (
        record.decision !== 'keep'
        || record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || record.evidenceProfileRecommendation !== 'create'
        || record.recordStatus !== 'candidate'
        || record.reviewAuthority !== 'ai_candidate'
      ) throw new Error(`${goalId}: ${label} source is not a valid KEEP V2 AI candidate`)
    }
    return {
      goalId,
      reason: `DE: Das Profil kombiniert die zwei unabhängig erzeugten, aktuellen KEEP-Evidenzblöcke ${first.record.recordId} und ${second.record.recordId}. Beide vollständigen DE/EN-Fassungen werden als verpflichtende Verständniserwartungen und als zwei frische Transferfälle erhalten; gemeinsame Variationsachsen erzwingen geänderte Bedingungen, Darstellungswechsel und eine explizite Modellgrenze. EN: The profile combines the two independently generated, current KEEP evidence blocks ${first.record.recordId} and ${second.record.recordId}. Both complete DE/EN formulations are retained as required understanding expectations and as two fresh transfer cases; shared variation axes require changed conditions, a representation change, and an explicit model boundary.`,
      evidenceLevel: 'E1' as const,
      maximumClaimScope: 'G1' as const,
      dissent: [],
      profile: buildProfile(goalId, first.record, second.record),
    }
  })
  const output = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId,
    reviewedAt: '2026-09-05T01:02:00.000Z',
    reviewer: 'codex-physics-rollout-v1-batch-033u-stable-current-10-positive-understanding-candidate-author-2026-09-05',
    goals: candidates,
  }
  const bytes = jsonBytes(output)
  const current = await readOptional(outputPath)
  if (current && !current.equals(bytes)) throw new Error(`Existing Physics B033u stable10 evidence candidates are stale: ${outputPath}`)
  if (!current && !write) throw new Error(`Missing Physics B033u stable10 evidence candidates: ${outputPath}`)
  if (!current && write) {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, bytes, { flag: 'wx' })
  }
  console.log(`${write ? 'Materialized' : 'Verified'} Physics B033u stable10 evidence candidates: ${candidates.length}/10`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
