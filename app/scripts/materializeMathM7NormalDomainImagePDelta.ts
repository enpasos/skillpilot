import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs } from './goalBookModel'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const evidenceRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const output = `${evidenceRoot}/m7-normal-domain-image-bound-p-20260924-v1`
const reviewId = 'canonical-math-p-v2-m7-normal-domain-image-bound-20260924-v1'
const currentConfigPath = `${output}/current-two.config.json`
const currentCandidatesPath = `${output}/current-two.candidates.json`
const currentReviewPath = `${output}/current-two.review.jsonl`

const sources = [
  {
    goalId: 'b431148b-526c-4bde-b04b-48d23101d0d3',
    title: 'Annähernd normalverteilte Zufallsgrößen in Situationen erkennen (LK)',
    sourceConfig: `${evidenceRoot}/m7-three-description-text-delta-p-20260923-v1/normal-altitudes-text-current.config.json`,
    sourceConfigSha: 'sha256:57b66c491f2e909a11893d6e6c369b7c2dae2e596eda467aaed42483e1b48e57',
    sourceReview: `${evidenceRoot}/m7-three-description-text-delta-p-20260923-v1/normal-altitudes-text-current.review.jsonl`,
    sourceReviewSha: 'sha256:53a76bcf84456fe6f369e391a152f4c6a8b19ddd1282e09ca7888d6d9dc4f59e',
    sourceCount: 2,
    retainedStem: 'normal-source-retained-one',
    pageNumber: 452,
    pageFingerprint: 'sha256:90d4cdbd8b721952691c0c781fe08313413c2e20a14523caf1d81d277b2aa22b',
    imageSha: 'sha256:de87084c06ea972b84ce521e6c70ee57e0f4f304ab40d466f48760ecf59fef0f',
    sourceRef: undefined,
    expectedCaseIds: ['suitable-binomial', 'rare'],
    reason: 'DE: Das neue PNG zeigt 100 unabhängige faire Münzwürfe mit p=0,5 als schematisch annähernd glockenförmig und 100 unabhängige Versuche mit p=0,01, np=1, als rechtsschief und für ein Normalmodell ungeeignet. Die Histogramme sind ausdrücklich schematisch; keine Stetigkeitskorrektur oder Intervallfläche wird als Ziel behauptet. Die frischen P-Fälle Bin(100;0,4) und Bin(20;0,001) sind andere Parameter und prüfen Modellvoraussetzungen, Gegenbeispiel und Begründung ohne Ablesen des Bildes. Aktueller bildgebundener KI-Kandidat, keine menschliche Freigabe oder Lernendenleistung. EN: The new image contrasts a plausible fair-coin binomial model with a rare-event skewed model; the two assessment cases use different parameters and independently test the current recognition goal, not continuity correction.',
  },
  {
    goalId: '502ecaa7-cca6-5c51-a1cc-da09a7b2382c',
    title: 'Definitionsmenge einer Funktion bestimmen',
    sourceConfig: `${evidenceRoot}/canonical-math-positive-understanding-evidence-rollout-v1-batch-033-current-carryover-8-v1.retained-before-m7-current-bundle39-20260920-v1.config.json`,
    sourceConfigSha: 'sha256:7543b837ffcba8b87bbd5fc99e02f9ae4ef7d1bd63905cfed3c61fcc89da29ab',
    sourceReview: `${evidenceRoot}/canonical-math-positive-understanding-evidence-rollout-v1-batch-033-current-carryover-8-v1.retained-before-m7-current-bundle39-20260920-v1.review.jsonl`,
    sourceReviewSha: 'sha256:deae56291fa243d81ade6d0350d60e802142e072f7c6adf337e3b5941af3af21',
    sourceCount: 7,
    retainedStem: 'domain-source-retained-six',
    pageNumber: 188,
    pageFingerprint: 'sha256:ee1a3205599cf1bdc3ffe52f586fb3d1ac26e584c702a4b29e0c4aedd48844ca',
    imageSha: 'sha256:fbc4a7ff7bee8a732f7efb2862e490021ac29e26df6c534f738c5bcae4a5c4e9',
    sourceRef: 'HKM Kerncurriculum Mathematik gymnasiale Oberstufe, E.1, S. 31',
    expectedCaseIds: ['expression-and-complete-graph', 'contextual-domain'],
    reason: 'DE: Das neue PNG unterscheidet fachlich korrekt den Term f(x)=1/(x−3) mit x≠3, einen vollständig gezeichneten Graphen mit geschlossenem x=1 und offenem x=4 sowie im Laufkontext t≥0. Die frischen P-Fälle verwenden stattdessen √(x+1)/(x−2), einen anderen vollständigen Graphen [−3,4) und einen Tank mit sachlichem Zeitraum [0,12]. Sie prüfen die Unterscheidung von rechnerischer und sachlicher Definitionsmenge unabhängig vom Bild. Aktueller bildgebundener KI-Kandidat, keine menschliche Freigabe oder Lernendenleistung. EN: The corrected image shows distinct algebraic, full-graph, and contextual domains; the independent assessment cases use different functions and context, requiring justification rather than image recall.',
  },
] as const

const sha256 = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(root, path), 'utf8')) as T
const readOptional = async (path: string): Promise<Buffer | null> => {
  try { return await readFile(join(root, path)) } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const verifyOrWrite = async (path: string, expected: Buffer, write: boolean) => {
  assert(path.startsWith(`${output}/`), `Refusing to write outside this P delta: ${path}`)
  const current = await readOptional(path)
  if (current) {
    if (!current.equals(expected)) {
      assert(write, `${path}: generated evidence differs`)
      await writeFile(join(root, path), expected)
    }
  } else {
    assert(write, `${path}: generated evidence missing`)
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), expected, { flag: 'wx' })
  }
}

const main = async () => {
  const args = process.argv.slice(2)
  assert(args.length === 1 && ['--write', '--check'].includes(args[0]), 'Usage: tsx app/scripts/materializeMathM7NormalDomainImagePDelta.ts --write|--check')
  const write = args[0] === '--write'
  const base = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-math-national-atlas.json', root)
  assert(base.config.evidenceReviewPaths.length === 0, 'Expected current base GoalBook without embedded P reviews')
  const landscape = await readJson<{ goals: Array<{ id: string; title: string; description: string; sourceRef?: string; resourceLinks?: Array<{ type: string; role?: string; url: string; altText?: string }> }> }>(
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  )
  const qa = await readJson<{ records: Array<{ goalId: string; imageUrl: string; assetSha256: string; aiApproved?: string; aiApprovedAssetSha256?: string; publicAssetPath: string; canonicalAssetPath: string }> }>(
    'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  )
  const generated: Array<{ path: string; bytes: Buffer }> = []
  const bindingRows: Array<Record<string, unknown>> = []
  const oldByGoal = new Map<string, PositiveGoalEvidenceReviewRecord>()
  let template: PositiveGoalEvidenceReviewConfig | null = null

  for (const spec of sources) {
    const [configBytes, reviewBytes] = await Promise.all([
      readFile(join(root, spec.sourceConfig)), readFile(join(root, spec.sourceReview)),
    ])
    assert(sha256(configBytes) === spec.sourceConfigSha && sha256(reviewBytes) === spec.sourceReviewSha, `${spec.goalId}: registered P source changed`)
    const config = JSON.parse(configBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
    const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
    const records = lines.map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
    assert(config.scope.goalIds.length === spec.sourceCount && records.length === spec.sourceCount, `${spec.goalId}: source P count changed`)
    assert(config.reviewedResourceTypes.length === 0, `${spec.goalId}: expected old text-only P owner`)
    assert(records.every((record, index) => record.goalId === config.scope.goalIds[index]), `${spec.goalId}: P scope order differs from records`)
    const old = records.find((record) => record.goalId === spec.goalId)
    assert(old?.status === 'needs_human_review' && old.reviewAuthority === 'ai_candidate' && old.evidenceLevel === 'E1' && old.maximumClaimScope === 'G1', `${spec.goalId}: expected unapproved E1/G1 AI candidate`)
    assert(old.profile.applicationCaseBriefs.map(({ id }) => id).join('|') === spec.expectedCaseIds.join('|'), `${spec.goalId}: transfer cases changed`)
    oldByGoal.set(spec.goalId, old)
    template ??= config

    const goal = landscape.goals.find(({ id }) => id === spec.goalId)
    const page = base.model.pages.find(({ goalId }) => goalId === spec.goalId)
    const imageQa = qa.records.find(({ goalId }) => goalId === spec.goalId)
    const imageUrl = `/assets/goal-visualizations/mathematik/${spec.goalId}/${spec.goalId}.png`
    const link = goal?.resourceLinks?.find((item) => item.type === 'goal-visualization' && item.role === 'primary')
    assert(goal?.title === spec.title && page?.title === spec.title && page.description === goal.description, `${spec.goalId}: current goal/page wording changed`)
    assert(goal.sourceRef === spec.sourceRef && page.pageNumber === spec.pageNumber && page.goalFingerprint === old.goalFingerprint && page.pageFingerprint === spec.pageFingerprint, `${spec.goalId}: current goal/page/source binding changed`)
    assert(link?.url === imageUrl && page.visualization?.url === imageUrl && page.visualization.altText === link.altText && page.visualization.originalDigest === spec.imageSha, `${spec.goalId}: current page image/alt text changed`)
    assert(page.visualization.qaStatus === 'review_candidate' && page.visualization.approvedForPublication === false, `${spec.goalId}: current page QA status changed`)
    assert(imageQa?.imageUrl === imageUrl && imageQa.assetSha256 === spec.imageSha && imageQa.aiApproved === 'yes' && imageQa.aiApprovedAssetSha256 === spec.imageSha, `${spec.goalId}: current AI V binding changed`)
    const copies = await Promise.all([
      readFile(join(root, imageQa.publicAssetPath)), readFile(join(root, imageQa.canonicalAssetPath)),
      readFile(join(root, 'backend/src/main/resources/static', imageUrl)),
    ])
    assert(copies.every((bytes) => sha256(bytes) === spec.imageSha), `${spec.goalId}: active PNG copies differ`)

    const retainedIds = config.scope.goalIds.filter((id) => id !== spec.goalId)
    assert(retainedIds.length === spec.sourceCount - 1, `${spec.goalId}: retained subset count changed`)
    const retainedConfigPath = `${output}/${spec.retainedStem}.config.json`
    const retainedReviewPath = `${output}/${spec.retainedStem}.review.jsonl`
    const retainedConfig: PositiveGoalEvidenceReviewConfig = {
      ...config,
      reviewPath: retainedReviewPath,
      scope: { ...config.scope, label: `${retainedIds.length} unveränderte textgebundene P-v2-Records nach gezieltem PNG-Split`, goalIds: retainedIds },
    }
    generated.push({ path: retainedConfigPath, bytes: jsonBytes(retainedConfig) })
    generated.push({ path: retainedReviewPath, bytes: Buffer.from(`${lines.filter((line) => retainedIds.includes((JSON.parse(line) as PositiveGoalEvidenceReviewRecord).goalId)).join('\n')}\n`) })
    bindingRows.push({
      goalId: spec.goalId,
      title: spec.title,
      sourceRef: goal.sourceRef ?? null,
      pageNumber: page.pageNumber,
      breadcrumbs: page.breadcrumbs,
      goalFingerprint: page.goalFingerprint,
      pageFingerprint: page.pageFingerprint,
      imageUrl,
      imageAltText: link.altText,
      imageSha256: spec.imageSha,
      pageQaStatus: page.visualization.qaStatus,
      pageApprovedForPublication: page.visualization.approvedForPublication,
      priorConfigPath: spec.sourceConfig,
      priorConfigSha256: spec.sourceConfigSha,
      priorReviewPath: spec.sourceReview,
      priorReviewSha256: spec.sourceReviewSha,
      priorProfileFingerprint: old.profileFingerprint,
      priorReviewInputFingerprint: old.reviewInputFingerprint,
      retainedConfigPath,
      retainedReviewPath,
      retainedCount: retainedIds.length,
    })
  }
  assert(template, 'No source P config')
  const currentConfig: PositiveGoalEvidenceReviewConfig = {
    ...template,
    reviewId,
    reviewPath: currentReviewPath,
    reviewedResourceTypes: ['goal-visualization'],
    scope: { label: 'Zwei aktuelle bildgebundene Mathematik-P-v2-KI-Kandidaten zu Normalmodell und Definitionsmenge', goalIds: sources.map(({ goalId }) => goalId) },
  }
  const existingCandidateBytes = await readOptional(currentCandidatesPath)
  const reviewedAt = existingCandidateBytes
    ? (JSON.parse(existingCandidateBytes.toString('utf8')) as { reviewedAt: string }).reviewedAt
    : new Date().toISOString()
  const candidates = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId,
    reviewedAt,
    reviewer: 'Codex current-pixel, current-page and independent-transfer P-v2 review /root/math_p_gap',
    goals: sources.map((spec) => ({
      goalId: spec.goalId,
      reason: spec.reason,
      evidenceLevel: 'E1' as const,
      maximumClaimScope: 'G1' as const,
      dissent: [],
      profile: structuredClone(oldByGoal.get(spec.goalId)!.profile),
    })),
  }
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config: currentConfig, candidateSet: candidates })
  assert(records.length === 2, 'Expected two current image-bound P records')
  for (const record of records) {
    const old = oldByGoal.get(record.goalId)!
    assert(record.goalFingerprint === old.goalFingerprint, `${record.goalId}: goal text changed during P rebind`)
    assert(record.reviewInputFingerprint !== old.reviewInputFingerprint, `${record.goalId}: image-bound input did not change`)
    assert(record.profileFingerprint === old.profileFingerprint, `${record.goalId}: independently checked transfer profile changed unexpectedly`)
    assert(record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.reviewRunIds.length === 0, `${record.goalId}: P authority changed`)
    Object.assign(bindingRows.find((row) => row.goalId === record.goalId)!, {
      currentReviewInputFingerprint: record.reviewInputFingerprint,
      currentProfileFingerprint: record.profileFingerprint,
    })
  }
  generated.push({ path: currentConfigPath, bytes: jsonBytes(currentConfig) })
  generated.push({ path: currentCandidatesPath, bytes: jsonBytes(candidates) })
  generated.push({ path: currentReviewPath, bytes: Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`) })
  generated.push({ path: `${output}/binding-review.json`, bytes: jsonBytes({
    schemaVersion: 1,
    reviewId,
    reviewedAt,
    reviewer: candidates.reviewer,
    authority: 'ai_candidate',
    humanApproved: false,
    bookDigestAtReview: base.model.digest,
    bookDigestDisposition: 'Whole-book digest is provenance only; claims are limited to these two exact current pages, canonical goal texts, unchanged sourceRef values, PNG bytes, and independent transfer cases.',
    changedGoals: bindingRows,
    reviewLimit: 'P-v2 AI candidates only; neither human approval nor learner performance nor independent D/source review nor a strict five-gate claim.',
  }) })
  for (const item of generated) await verifyOrWrite(item.path, item.bytes, write)
  for (const path of [`${output}/${sources[0].retainedStem}.config.json`, `${output}/${sources[1].retainedStem}.config.json`, currentConfigPath]) {
    const result = reviewPositiveGoalEvidenceConfig(path)
    assert(result.errors.length === 0, `${path}: ${result.errors.join(' | ')}`)
  }
  console.log(`${write ? 'Wrote' : 'Verified'} two current image-bound P-v2 AI candidates and seven byte-identical retained P records; no human approval.`)
}

void main()
