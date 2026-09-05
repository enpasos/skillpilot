import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import { loadGoalBookBuildInputs, stableGoalBookJson } from './goalBookModel'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

type JsonGoal = Record<string, unknown>
type ReviewRound = 'first' | 'second'
type StableGoalSpec = {
  goalId: string
  evidenceRound: ReviewRound
  rationale: { de: string; en: string }
}
type SourceHashes = {
  config: string
  batchManifest: string
  dualSummary: string
  roundARecords: string
  roundARun: string
  roundBRecords: string
  roundBRun: string
}
type BatchSpec = {
  key: 'b031' | 'b031r' | 'b031w'
  rolloutRoot?: string
  batchName: string
  outputStem: string
  manifestId: string
  receiptId: string
  roundAResultStem: string
  roundBResultStem: string
  stableGoals: StableGoalSpec[]
  excludedGoalIds: string[]
  sourceHashes: SourceHashes
}
type PlannedOutput = { path: string; bytes: Buffer }

const repoRoot = resolve(import.meta.dirname, '../..')
const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-02'
const baseGoalBookConfigPath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const curriculumAtomicDenominator = 462
const usage = 'Usage: tsx scripts/materializePhysicsB031B031rConsensusCarryoverResolutions.ts (--write|--check)'

const batches: BatchSpec[] = [
  {
    key: 'b031',
    batchName: 'batch-031-q2-oscillations-and-waves-15-v1',
    outputStem: 'stable-current-carryover-1-v3',
    manifestId: 'physik-b031-stable1-synthesis-openai-codex-20260905-v3',
    receiptId: 'physik-b031-stable-current-carryover-1-v3-20260905',
    roundAResultStem: 'physik-rollout-v1-batch-031-q2-oscillations-and-waves-15-v1-20260902-first-pass-a.batch-001',
    roundBResultStem: 'physik-rollout-v1-batch-031-q2-oscillations-and-waves-15-v1-20260902-first-pass-b.batch-001',
    stableGoals: [
      {
        goalId: 'd5772db3-120c-5c37-ab46-2336d02236b0',
        evidenceRound: 'second',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen den unveränderten bilingualen Wortlaut zu stehenden Wellen und Wellenlängenbestimmung. Runde B wird ausgewählt, weil sie Mehrfachabstände, Messunsicherheit, Überlagerungsbegründung und den Transfer auf andere Randbedingungen besonders klar zusammenführt; Runde A bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the unchanged bilingual wording on standing waves and wavelength determination. Round B is selected because it particularly clearly combines multiple spacings, measurement uncertainty, the superposition rationale, and transfer to different boundary conditions; Round A remains fully bound.',
        },
      },
    ],
    excludedGoalIds: [
      'd03f1cb6-c224-53db-ad91-76cc7827978d',
      'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e',
      'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8',
      '158e1c19-7ccb-4c8c-931c-b685951ab161',
      '68020906-e615-462e-a56f-dd1ccc14b8d7',
      '9dba2826-b179-59f0-8d91-5916079e5abe',
      'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
      '85157cf0-7f68-5aea-b375-0f9797008cc9',
      'f47a7fa0-b929-5264-b038-b83fd682967f',
      'e7131fe3-1da6-5555-80ec-fb6bdf8fcc29',
      '0d2a4690-d891-503b-96f4-42c2de48fd8b',
      'e160acb4-5b88-509e-8055-2653df420c65',
      '215f5558-562c-5686-b649-931f324c7983',
      '1c430e0a-b63e-5729-8715-a96a5a68740f',
    ],
    sourceHashes: {
      config: '5609e6989d5fdd0dd49136a88a79f3e7068165d719a4df801626cc8d3f7c5fcc',
      batchManifest: '5468711bd78326cd277b2625e60a7521e64a2bcd374fb081cad655df53b1cfcc',
      dualSummary: '379a29e8b355706fcb94e7fcddef3c9ef7346162c3fdcd753341e8633a6d00a6',
      roundARecords: 'b8f7f07a9ed3c0eb02fe84ca0d1710593e55ce3c58a566d51b72419434d818ec',
      roundARun: '66af1beb066dd951dff8837300dededb8a559a507db884f1aaa83edc84ccdcb8',
      roundBRecords: 'f826ea76af38760ad1ef5b567c178134b87c96e229059a451f4b2c1d1cfe12f1',
      roundBRun: '0ef57baf7a4e4ceec55e5d5b5c4357052d70a363970e86ed67446172c0043165',
    },
  },
  {
    key: 'b031r',
    batchName: 'batch-031r-q2-oscillations-and-waves-revised-10-v1',
    outputStem: 'stable-current-carryover-5-v3',
    manifestId: 'physik-b031r-stable5-synthesis-openai-codex-20260905-v3',
    receiptId: 'physik-b031r-stable-current-carryover-5-v3-20260905',
    roundAResultStem: 'physik-rollout-v1-batch-031r-q2-oscillations-and-waves-revised-10-v1-20260902-first-pass-a.batch-001',
    roundBResultStem: 'physik-rollout-v1-batch-031r-q2-oscillations-and-waves-revised-10-v1-20260902-first-pass-b.batch-001',
    stableGoals: [
      {
        goalId: 'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
        evidenceRound: 'first',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen den präzisierten bilingualen Wortlaut zu Reflexion, Brechung und Beugung. Runde A wird ausgewählt, weil sie die drei Rand- und Öffnungssituationen mit Wellenfrontkonstruktion und Huygensschem Modell besonders direkt operationalisiert; Runde B bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the revised bilingual wording on reflection, refraction, and diffraction. Round A is selected because it particularly directly operationalizes the three boundary and aperture situations through wavefront construction and the Huygens model; Round B remains fully bound.',
        },
      },
      {
        goalId: '85157cf0-7f68-5aea-b375-0f9797008cc9',
        evidenceRound: 'second',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen den präzisierten bilingualen Wortlaut zu Active Noise Cancelling. Runde B wird ausgewählt, weil sie lokale Interferenz, Frequenz- und Raumabhängigkeit sowie die Trennung von Messbefund und Werturteil besonders klar verbindet; Runde A bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the revised bilingual wording on active noise cancelling. Round B is selected because it particularly clearly connects local interference, frequency and spatial dependence, and the separation of empirical findings from value judgments; Round A remains fully bound.',
        },
      },
      {
        goalId: 'f47a7fa0-b929-5264-b038-b83fd682967f',
        evidenceRound: 'first',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen den präzisierten bilingualen Wortlaut zu Ultraschallanwendungen. Runde A wird ausgewählt, weil sie Puls-Echo-Laufzeit, abgeleitete Tiefe, Auflösung und den Zielkonflikt mit Eindringtiefe und Dämpfung besonders geschlossen verbindet; Runde B bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the revised bilingual wording on ultrasound applications. Round A is selected because it particularly coherently connects pulse-echo travel time, inferred depth, resolution, and the trade-off with penetration and attenuation; Round B remains fully bound.',
        },
      },
      {
        goalId: 'e160acb4-5b88-509e-8055-2653df420c65',
        evidenceRound: 'second',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen den präzisierten bilingualen Wortlaut zur Wellengleichung. Runde B wird ausgewählt, weil sie Wellenzahl, Kreisfrequenz, Phase, Ausbreitungsrichtung und Phasengeschwindigkeit besonders explizit in einer konsistenten Darstellung verknüpft; Runde A bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the revised bilingual wording on the wave equation. Round B is selected because it particularly explicitly links wave number, angular frequency, phase, propagation direction, and phase velocity in one consistent representation; Round A remains fully bound.',
        },
      },
      {
        goalId: '215f5558-562c-5686-b649-931f324c7983',
        evidenceRound: 'first',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen den präzisierten bilingualen Wortlaut zu Phasensprüngen bei Reflexion. Runde A wird ausgewählt, weil sie Reflexionsfaktoren, Randbedingungen und die daraus folgende Knoten- beziehungsweise Bauchbedingung besonders präzise verbindet; Runde B bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the revised bilingual wording on phase shifts upon reflection. Round A is selected because it particularly precisely connects reflection coefficients, boundary conditions, and the resulting node or antinode condition; Round B remains fully bound.',
        },
      },
    ],
    excludedGoalIds: [
      'd03f1cb6-c224-53db-ad91-76cc7827978d',
      '158e1c19-7ccb-4c8c-931c-b685951ab161',
      'e7131fe3-1da6-5555-80ec-fb6bdf8fcc29',
      '0d2a4690-d891-503b-96f4-42c2de48fd8b',
      '1c430e0a-b63e-5729-8715-a96a5a68740f',
    ],
    sourceHashes: {
      config: 'cfac7e99b3de84e4a67b46bab9a350886d227c0cc21af4e7dc2df2ad7dd4eec5',
      batchManifest: 'c805c10e8736cfb9c27b62476ae5e7ae8f820bb4455e76db7c03d8e2de954726',
      dualSummary: '24d60e2666c3ef814c186b8235c5879c297e98d30f7b51c653613a741237c489',
      roundARecords: '694e9638a16fbf28460dafd17c097f95e1765d627a2afc6e8513396f325fb7d2',
      roundARun: '3b32ea90b732d4b6f35ec2f4fcc15c86c89c0b02ef5d7f08a0c6272e9f71c8de',
      roundBRecords: 'aa0d6276f8d69b2842f0ef6b8bef1cfd25658f829a0a7391a85541d84908b381',
      roundBRun: 'ff3f58973e768d590fe41e5a95ae53b0a730476a53602b5cf6c020c7c1eda0b6',
    },
  },
  {
    key: 'b031w',
    rolloutRoot: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-04',
    batchName: 'batch-031w-q2-harmonic-wave-split-context-recheck-5-v1',
    outputStem: 'stable-current-carryover-2-v2',
    manifestId: 'physik-b031w-stable2-synthesis-openai-codex-20260905-v2',
    receiptId: 'physik-b031w-stable-current-carryover-2-v2-20260905',
    roundAResultStem: 'physik-rollout-v1-batch-031w-q2-harmonic-wave-split-context-recheck-5-v1-20260904-first-pass-a.batch-001',
    roundBResultStem: 'physik-rollout-v1-batch-031w-q2-harmonic-wave-split-context-recheck-5-v1-20260904-first-pass-b.batch-001',
    stableGoals: [
      {
        goalId: '158e1c19-7ccb-4c8c-931c-b685951ab161',
        evidenceRound: 'first',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen den unveränderten bilingualen Wortlaut zur Interpretation von Momentaufnahmen und Zeitverläufen harmonischer Wellen. Runde A wird ausgewählt, weil sie Orts- und Zeitachsen, gleiche Phase und die umgekehrte Ausbreitungsrichtung besonders direkt operationalisiert; Runde B bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the unchanged bilingual wording on interpreting spatial snapshots and time traces of harmonic waves. Round A is selected because it particularly directly operationalizes spatial and temporal axes, equal phase, and the reversed propagation direction; Round B remains fully bound.',
        },
      },
      {
        goalId: '9dba2826-b179-59f0-8d91-5916079e5abe',
        evidenceRound: 'first',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen den unveränderten bilingualen Wortlaut zur Konstruktion ebener und kreisförmiger Wellenfronten mit dem Huygensschen Prinzip. Runde A wird ausgewählt, weil sie Elementarwellen, Einhüllende und den Transfer zwischen beiden Geometrien besonders geschlossen verbindet; Runde B bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the unchanged bilingual wording on constructing plane and circular wavefronts with Huygens principle. Round A is selected because it particularly coherently connects secondary wavelets, their envelope, and transfer between both geometries; Round B remains fully bound.',
        },
      },
    ],
    excludedGoalIds: [
      'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8',
      'bf559969-a05c-58b5-82c5-3d719d96555d',
      '68020906-e615-462e-a56f-dd1ccc14b8d7',
    ],
    sourceHashes: {
      config: 'a2036015a934c9d39bf3286f5f068090a3db48e8868aab19a8bbc733663dabe3',
      batchManifest: '1509a4ba2466debbcd2f239e879a4a614e2142eec9d4797d7228e72a5ee576a3',
      dualSummary: 'f92d2cb3c37b5e4cf66ecff906ce411284f18abbfeb1d06a188080cdc72eb9b7',
      roundARecords: '018b6e8d270f5f9517a0e8f2a282fc9e06df1251980e49805dd41befb9b0c676',
      roundARun: 'fc7a4f59f324a323fa5659bf4912d9874109fb9f88f72f98debd9ae8c5dd8356',
      roundBRecords: 'b2c3ec17a76332bd3e6f13b7e0b13d5d50a645d1c074aa16a541da8be4a308b1',
      roundBRun: '2745528a533708d8a19d9a48c41bbcc509758b02b0d069747bebda68a0b5e229',
    },
  },
]

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256Hex = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const digest = (bytes: string | Uint8Array): GoalDescriptionSynthesisDigest => (
  ('sha256:' + sha256Hex(bytes)) as GoalDescriptionSynthesisDigest
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const sameSet = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value) => right.includes(value))
)
const readBound = (path: string, expected: string): Buffer => {
  if (!/^[a-f0-9]{64}$/u.test(expected)) throw new Error(path + ': invalid SHA-256 pin')
  const bytes = readFileSync(absolute(path))
  const actual = sha256Hex(bytes)
  if (actual !== expected) throw new Error(path + ': bound digest drift ' + actual + ' != ' + expected)
  return bytes
}
const assertOutput = (path: string, bytes: Buffer): void => {
  if (!existsSync(absolute(path))) throw new Error('Missing generated output: ' + path)
  const actual = readFileSync(absolute(path))
  if (!actual.equals(bytes)) throw new Error('Generated output drift: ' + path)
}
const publish = (path: string, bytes: Buffer): void => {
  mkdirSync(dirname(absolute(path)), { recursive: true })
  if (existsSync(absolute(path))) assertOutput(path, bytes)
  else writeFileSync(absolute(path), bytes, { flag: 'wx' })
}
const completionTimestamp = (runs: Array<{ completedAt: string }>): string => {
  const timestamps = runs.map(({ completedAt }) => Date.parse(completedAt))
  if (timestamps.length === 0 || timestamps.some((value) => !Number.isFinite(value))) {
    throw new Error('Blind runs must have valid completion timestamps')
  }
  return new Date(Math.max(...timestamps) + 1000).toISOString()
}

const parseMode = (): 'help' | 'write' | 'check' => {
  const args = process.argv.slice(2)
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) return 'help'
  if (args.length === 1 && args[0] === '--write') return 'write'
  if (args.length === 1 && args[0] === '--check') return 'check'
  throw new Error(usage)
}

const main = async (): Promise<void> => {
  const mode = parseMode()
  if (mode === 'help') {
    console.log(usage)
    return
  }

  const baseConfigBytes = readFileSync(absolute(baseGoalBookConfigPath))
  const canonicalBytes = readFileSync(absolute(canonicalPath))
  const semanticKindLedgerBytes = readFileSync(absolute(semanticKindLedgerPath))
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals: JsonGoal[] }
  const semanticKindLedger = JSON.parse(semanticKindLedgerBytes.toString('utf8')) as {
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  if (landscape.subject !== 'Physik' || !Array.isArray(landscape.goals)) {
    throw new Error('Current canonical Physics landscape is invalid')
  }
  if (semanticKindLedger.counts?.curricularAtomic !== curriculumAtomicDenominator) {
    throw new Error('Current Physics curricularAtomic denominator drifted')
  }
  const currentBase = await loadGoalBookBuildInputs(baseGoalBookConfigPath)
  if (
    currentBase.config.landscapePath !== canonicalPath
    || currentBase.config.semanticKindLedgerPath !== semanticKindLedgerPath
  ) {
    throw new Error('Current Physics Atlas configuration points to unexpected canonical inputs')
  }

  const allOutputs: PlannedOutput[] = []
  const batchReports: Array<Record<string, unknown>> = []
  for (const spec of batches) {
    const batchDirectory = (spec.rolloutRoot ?? rolloutRoot) + '/' + spec.batchName
    const sourceConfigPath = batchDirectory + '.config.json'
    const batchManifestPath = batchDirectory + '/batch-manifest.json'
    const dualSummaryPath = batchDirectory + '/dual-summary.json'
    const roundARecordsPath = batchDirectory + '/round-a/results/' + spec.roundAResultStem + '.records.jsonl'
    const roundARunPath = batchDirectory + '/round-a/results/' + spec.roundAResultStem + '.run.json'
    const roundBRecordsPath = batchDirectory + '/round-b/results/' + spec.roundBResultStem + '.records.jsonl'
    const roundBRunPath = batchDirectory + '/round-b/results/' + spec.roundBResultStem + '.run.json'
    const synthesisRelativePath = 'synthesis-decisions.' + spec.outputStem + '.json'
    const synthesisPath = batchDirectory + '/' + synthesisRelativePath
    const resolutionDirectory = 'resolutions-' + spec.outputStem
    const indexRelativePath = 'resolution-index.' + spec.outputStem + '.json'
    const indexPath = batchDirectory + '/' + indexRelativePath
    const receiptRelativePath = spec.outputStem + '.compatibility-receipt.json'
    const receiptPath = batchDirectory + '/' + receiptRelativePath

    const configBytes = readBound(sourceConfigPath, spec.sourceHashes.config)
    const batchManifestBytes = readBound(batchManifestPath, spec.sourceHashes.batchManifest)
    const dualSummaryBytes = readBound(dualSummaryPath, spec.sourceHashes.dualSummary)
    const roundARecordsBytes = readBound(roundARecordsPath, spec.sourceHashes.roundARecords)
    const roundARunBytes = readBound(roundARunPath, spec.sourceHashes.roundARun)
    const roundBRecordsBytes = readBound(roundBRecordsPath, spec.sourceHashes.roundBRecords)
    const roundBRunBytes = readBound(roundBRunPath, spec.sourceHashes.roundBRun)
    const sourceConfig = JSON.parse(configBytes.toString('utf8')) as {
      baseGoalBookConfigPath: string
      bookId: string
      title: string
      goalIds: string[]
    }
    if (sourceConfig.baseGoalBookConfigPath !== baseGoalBookConfigPath) {
      throw new Error(spec.key + ': source GoalBook configuration drifted')
    }
    const stableGoalIds = spec.stableGoals.map(({ goalId }) => goalId)
    const partition = [...stableGoalIds, ...spec.excludedGoalIds]
    if (new Set(partition).size !== partition.length || !sameSet(partition, sourceConfig.goalIds)) {
      throw new Error(spec.key + ': stable and excluded scopes must exactly partition the source batch')
    }
    for (const goalId of stableGoalIds) {
      const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === goalId)
      if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
        throw new Error(goalId + ': missing current authoritative curricularAtomic classification')
      }
    }

    const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
    if (!dual.bytes.equals(dualSummaryBytes)) {
      throw new Error(spec.key + ': materialized dual summary is not exact-bound')
    }
    if (!sameSet(dual.summary.goals.map(({ goalId }) => goalId), sourceConfig.goalIds)) {
      throw new Error(spec.key + ': dual summary scope drifted')
    }
    const currentSubset = buildGoalDescriptionRolloutSubsetModel({
      baseModel: currentBase.model,
      goalIds: sourceConfig.goalIds,
      bookId: sourceConfig.bookId,
      title: sourceConfig.title,
    })

    const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
    const sources = new Map<string, {
      first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
      second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    }>()
    const currentBindings: Array<Record<string, unknown>> = []
    for (const goalSpec of spec.stableGoals) {
      const firstResult = extractGoalDescriptionDualRoundResolutionSource({
        artifacts: dual.first,
        goalId: goalSpec.goalId,
        label: 'First',
      })
      const secondResult = extractGoalDescriptionDualRoundResolutionSource({
        artifacts: dual.second,
        goalId: goalSpec.goalId,
        label: 'Second',
      })
      if (
        firstResult.errors.length > 0
        || secondResult.errors.length > 0
        || !firstResult.source?.record
        || !secondResult.source?.record
      ) {
        throw new Error(
          goalSpec.goalId + ': source extraction failed: '
          + [...firstResult.errors, ...secondResult.errors].join(' | '),
        )
      }
      if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
        throw new Error(goalSpec.goalId + ': consensus carryover requires two KEEP records')
      }

      const firstInput = dual.first.input.goals.find(({ goalId }) => goalId === goalSpec.goalId)
      const secondInput = dual.second.input.goals.find(({ goalId }) => goalId === goalSpec.goalId)
      const canonicalMatches = landscape.goals.filter(({ id }) => id === goalSpec.goalId)
      const sourcePage = dual.prepared.model.pages.find(({ goalId }) => goalId === goalSpec.goalId)
      const currentPage = currentSubset.pages.find(({ goalId }) => goalId === goalSpec.goalId)
      if (!firstInput || !secondInput || canonicalMatches.length !== 1 || !sourcePage || !currentPage) {
        throw new Error(goalSpec.goalId + ': missing unique review, canonical, source-page, or current-page input')
      }
      const canonicalGoal = canonicalMatches[0]
      const currentCanonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
      const sourceContextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
      if (
        stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)
        || stableGoalBookJson(firstInput.reviewContext.page) !== stableGoalBookJson(sourcePage)
        || stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(currentCanonicalContext)
        || firstResult.source.binding.goalReviewContextFingerprint !== sourceContextFingerprint
        || secondResult.source.binding.goalReviewContextFingerprint !== sourceContextFingerprint
      ) {
        throw new Error(goalSpec.goalId + ': blind review inputs or current-direct canonical context differ')
      }
      const reviewedText = {
        titleDe: firstInput.currentTitleDe,
        titleEn: firstInput.currentTitleEn,
        descriptionDe: firstInput.currentDescriptionDe,
        descriptionEn: firstInput.currentDescriptionEn,
      }
      const currentText = {
        titleDe: String(canonicalGoal.title ?? ''),
        titleEn: String(canonicalGoal.titleEn ?? ''),
        descriptionDe: String(canonicalGoal.description ?? ''),
        descriptionEn: String(canonicalGoal.descriptionEn ?? ''),
      }
      if (
        stableGoalBookJson(reviewedText) !== stableGoalBookJson(currentText)
        || currentPage.title !== currentText.titleDe
        || currentPage.description !== currentText.descriptionDe
        || currentPage.goalFingerprint !== firstInput.goalFingerprint
      ) {
        throw new Error(goalSpec.goalId + ': reviewed text or goal identity is not exact-current')
      }

      expectedGoals.push({
        goalId: goalSpec.goalId,
        effectiveSemanticKind: 'curricularAtomic',
        goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
        pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
        goalReviewContextFingerprint: sourceContextFingerprint,
        finalText: reviewedText,
        firstSource: firstResult.source,
        secondSource: secondResult.source,
      })
      sources.set(goalSpec.goalId, { first: firstResult.source, second: secondResult.source })
      currentBindings.push({
        goalId: goalSpec.goalId,
        currentCanonicalContext,
        currentCanonicalContextFingerprint: digest(stableGoalBookJson(currentCanonicalContext)),
        sourceGoalFingerprint: firstInput.goalFingerprint,
        currentGoalFingerprint: currentPage.goalFingerprint,
        exactGoalFingerprint: firstInput.goalFingerprint === currentPage.goalFingerprint,
        sourcePageFingerprint: firstInput.pageFingerprint,
        currentPageFingerprint: currentPage.pageFingerprint,
        exactPageFingerprint: firstInput.pageFingerprint === currentPage.pageFingerprint,
        sourceGoalReviewContextFingerprint: sourceContextFingerprint,
      })
    }

    const firstGoal = expectedGoals[0]
    if (!firstGoal) throw new Error(spec.key + ': stable carryover scope is empty')
    const synthesizedAt = completionTimestamp([
      JSON.parse(roundARunBytes.toString('utf8')) as { completedAt: string },
      JSON.parse(roundBRunBytes.toString('utf8')) as { completedAt: string },
    ])
    const expectedBindings = {
      batch: {
        batchId: dual.prepared.manifest.batchId,
        batchManifestDigest: digest(batchManifestBytes),
        configDigest: digest(configBytes),
        bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
        bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
        reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
        dualSummaryDigest: digest(dual.bytes),
        canonicalLandscapeDigest: digest(canonicalBytes),
      },
      rounds: {
        first: buildGoalDescriptionRolloutSynthesisRoundBinding(
          firstGoal.firstSource.binding,
          dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint,
        ),
        second: buildGoalDescriptionRolloutSynthesisRoundBinding(
          firstGoal.secondSource.binding,
          dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint,
        ),
      },
      synthesizedAt,
      goals: expectedGoals,
    }
    const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
      schemaVersion: 1,
      synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
      manifestId: spec.manifestId,
      authority: 'ai_synthesis',
      synthesizedBy: 'OpenAI Codex Physics ' + spec.key.toUpperCase() + ' consensus-stable carryover synthesis candidate',
      synthesizedAt,
      batch: expectedBindings.batch,
      rounds: expectedBindings.rounds,
      decisions: expectedGoals.map((goal, index) => {
        const source = sources.get(goal.goalId)
        const goalSpec = spec.stableGoals.find(({ goalId }) => goalId === goal.goalId)
        if (!source || !goalSpec) throw new Error(goal.goalId + ': incomplete synthesis source')
        return {
          decisionId: spec.manifestId + '-decision-' + String(index + 1).padStart(3, '0'),
          goalId: goal.goalId,
          effectiveSemanticKind: goal.effectiveSemanticKind,
          goalFingerprint: goal.goalFingerprint,
          pageFingerprint: goal.pageFingerprint,
          goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
          finalText: goal.finalText,
          resolutionDecision: 'keep_current' as const,
          evidenceRound: goalSpec.evidenceRound,
          records: {
            first: {
              recordId: source.first.binding.recordId,
              recordDigest: source.first.binding.recordDigest,
            },
            second: {
              recordId: source.second.binding.recordId,
              recordDigest: source.second.binding.recordDigest,
            },
          },
          rationaleDe: goalSpec.rationale.de,
          rationaleEn: goalSpec.rationale.en,
        }
      }),
    }
    const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
      ...manifestPayload,
      manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload),
    }
    const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
      manifest: synthesisManifest,
      expected: expectedBindings,
    })
    if (manifestValidation.errors.length > 0) {
      throw new Error(spec.key + ': synthesis invalid: ' + manifestValidation.errors.join(' | '))
    }
    const synthesisBytes = jsonBytes(synthesisManifest)

    const resolutionOutputs: PlannedOutput[] = []
    const indexEntries: Array<Record<string, unknown>> = []
    for (const goal of expectedGoals) {
      const source = sources.get(goal.goalId)
      const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
      const decision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
      if (!source || !summaryGoal || !decision) {
        throw new Error(goal.goalId + ': incomplete resolution alignment')
      }
      const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
        batchId: synthesisManifest.batch.batchId,
        manifest: synthesisManifest,
        decision,
        summaryGoal,
        firstSource: source.first,
        secondSource: source.second,
      })
      const resolution = buildGoalDescriptionDualRoundResolution({
        resolutionId: 'physik-' + spec.key + '-' + spec.outputStem + '-resolution-' + goal.goalId,
        goalId: goal.goalId,
        effectiveSemanticKind: 'curricularAtomic',
        decision: 'keep_current',
        synthesis,
        dualSummaryBytes: dual.bytes,
        currentInput: dual.first.input,
        firstSource: source.first,
        secondSource: source.second,
        synthesisDecisionManifest: {
          contract: synthesisManifest.synthesisContract,
          manifestPath: synthesisRelativePath,
          manifestId: synthesisManifest.manifestId,
          manifestDigest: digest(synthesisBytes),
          manifestFingerprint: synthesisManifest.manifestFingerprint,
          decisionId: decision.decisionId,
        },
      })
      const validation = await validateGoalDescriptionDualRoundResolution({
        resolution,
        dualSummary: dual.summary,
        dualSummaryBytes: dual.bytes,
        currentInput: dual.first.input,
        landscape,
        first: dual.first,
        second: dual.second,
        synthesisDecisionManifestArtifact: {
          manifest: synthesisManifest,
          manifestBytes: synthesisBytes,
          manifestPath: synthesisRelativePath,
        },
      })
      if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
        throw new Error(goal.goalId + ': resolution invalid: ' + validation.errors.join(' | '))
      }
      const bytes = jsonBytes(resolution)
      const relativePath = resolutionDirectory + '/' + goal.goalId + '.resolution.json'
      resolutionOutputs.push({ path: batchDirectory + '/' + relativePath, bytes })
      indexEntries.push({
        goalId: goal.goalId,
        titleDe: resolution.goal.finalText.titleDe,
        groupId: dual.prepared.manifest.batchId,
        decision: resolution.decision,
        resolutionPath: relativePath,
        resolutionDigest: digest(bytes),
        resolutionFingerprint: resolution.resolutionFingerprint,
        strictDescriptionComplete: true,
      })
    }

    const stableCount = stableGoalIds.length
    const index = {
      schemaVersion: 1,
      artifactSetId: dual.prepared.manifest.batchId + '-' + spec.outputStem,
      subject: dual.prepared.manifest.subjectLabel,
      semanticKind: 'curricularAtomic',
      strictDescriptionReviewCompleteCount: stableCount,
      curriculumAtomicDenominator,
      descriptionReviewPercentage: Number(((stableCount / curriculumAtomicDenominator) * 100).toFixed(1)),
      groups: [{
        groupId: dual.prepared.manifest.batchId,
        artifactDirectory: '.',
        dualSummaryPath: 'dual-summary.json',
        dualSummaryDigest: digest(dual.bytes),
        campaignGoalCount: dual.summary.goalCount,
        resolvedGoalCount: stableCount,
      }],
      resolutions: indexEntries,
    }
    const indexBytes = jsonBytes(index)
    const outputsWithoutReceipt = [
      { path: synthesisPath, bytes: synthesisBytes },
      ...resolutionOutputs,
      { path: indexPath, bytes: indexBytes },
    ]
    const receiptBody = {
      schemaVersion: 1,
      receiptId: spec.receiptId,
      purpose: 'Hash-bound carryover of exactly ' + stableCount
        + ' current KEEP/KEEP consensus goals from ' + spec.key.toUpperCase()
        + '; every other source-batch goal remains explicitly excluded.',
      source: {
        configPath: sourceConfigPath,
        configSha256: digest(configBytes),
        batchManifestPath,
        batchManifestSha256: digest(batchManifestBytes),
        dualSummaryPath,
        dualSummarySha256: digest(dualSummaryBytes),
        roundA: {
          recordsPath: roundARecordsPath,
          recordsSha256: digest(roundARecordsBytes),
          runPath: roundARunPath,
          runSha256: digest(roundARunBytes),
        },
        roundB: {
          recordsPath: roundBRecordsPath,
          recordsSha256: digest(roundBRecordsBytes),
          runPath: roundBRunPath,
          runSha256: digest(roundBRunBytes),
        },
      },
      currentRuntimeSnapshot: {
        baseGoalBookConfigPath,
        baseGoalBookConfigSha256: digest(baseConfigBytes),
        canonicalLandscapePath: canonicalPath,
        canonicalLandscapeSha256: digest(canonicalBytes),
        semanticKindLedgerPath,
        semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
        currentBaseBookDigest: currentBase.model.digest,
        currentSubsetBookDigest: currentSubset.digest,
        capturedAtMaterializationExecution: true,
      },
      compatibilityRebase: {
        status: 'accepted_exact_current_direct_context',
        reason: 'Review-contract page fingerprints remain byte-bound to the two blind runs. Current Atlas goal and page fingerprints are rebuilt only at execution; contextual page drift is allowed only while the goal fingerprint, bilingual text, and direct canonical context remain exact.',
        sourceBaseBookDigest: dual.prepared.manifest.source.baseBookDigest,
        sourceSubsetBookDigest: dual.prepared.model.digest,
        currentBindings,
      },
      claimedGoalIds: stableGoalIds,
      explicitlyExcludedGoalIds: spec.excludedGoalIds,
      synthesisManifestPath: synthesisRelativePath,
      synthesisManifestDigest: digest(synthesisBytes),
      synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
      resolutionIndexPath: indexRelativePath,
      resolutionIndexDigest: digest(indexBytes),
      safeguards: {
        sourceConfigManifestDualSummaryRunsAndRecordsByteBound: true,
        twoIndependentKeepDecisionsRequired: true,
        selectedEvidenceRoundMustBeKeep: true,
        currentBilingualTextRequiredExact: true,
        currentGoalFingerprintRequiredExact: true,
        currentDirectCanonicalContextRequiredExactAndRefingerprintedAtExecution: true,
        currentAtlasPageFingerprintCapturedAtExecutionWithoutClaimingHistoricalEquality: true,
        stableAndExcludedScopesDisjointAndComplete: true,
        currentRuntimeReboundImmediatelyBeforeWrite: true,
        separateBatchResolutionIndex: true,
        openAiReviewFreezeRequiredBeforeWrite: true,
      },
    } as const
    const materializationPlanSha256 = digest(jsonBytes({
      spec,
      currentRuntimeSnapshot: receiptBody.currentRuntimeSnapshot,
      outputs: outputsWithoutReceipt.map(({ path, bytes }) => ({ path, sha256: digest(bytes) })),
      receiptPath,
      receiptBody,
    }))
    const receiptBytes = jsonBytes({ ...receiptBody, materializationPlanSha256 })
    const outputs = [...outputsWithoutReceipt, { path: receiptPath, bytes: receiptBytes }]
    allOutputs.push(...outputs)
    batchReports.push({
      batch: spec.key,
      stableGoalCount: stableCount,
      resolutionIndexPath: indexPath,
      resolutionIndexSha256: digest(indexBytes),
      outputCount: outputs.length,
    })
  }

  if (new Set(allOutputs.map(({ path }) => path)).size !== allOutputs.length) {
    throw new Error('Cross-batch materialization contains duplicate output paths')
  }
  if (batchReports.length !== 3) throw new Error('Exactly three separate B031 resolution indexes are required')

  if (mode === 'write') {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    const refreshedBaseConfigBytes = readFileSync(absolute(baseGoalBookConfigPath))
    const refreshedCanonicalBytes = readFileSync(absolute(canonicalPath))
    const refreshedLedgerBytes = readFileSync(absolute(semanticKindLedgerPath))
    const refreshedBase = await loadGoalBookBuildInputs(baseGoalBookConfigPath)
    if (
      !refreshedBaseConfigBytes.equals(baseConfigBytes)
      || !refreshedCanonicalBytes.equals(canonicalBytes)
      || !refreshedLedgerBytes.equals(semanticKindLedgerBytes)
      || refreshedBase.model.digest !== currentBase.model.digest
    ) {
      throw new Error('Current Physics runtime inputs drifted during materialization planning')
    }
    for (const output of allOutputs) publish(output.path, output.bytes)
  } else {
    for (const output of allOutputs) assertOutput(output.path, output.bytes)
  }

  console.log(JSON.stringify({
    mode: mode.toUpperCase(),
    currentBaseBookDigest: currentBase.model.digest,
    currentCanonicalLandscapeSha256: digest(canonicalBytes),
    currentSemanticKindLedgerSha256: digest(semanticKindLedgerBytes),
    batches: batchReports,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
