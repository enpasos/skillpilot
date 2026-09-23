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
const output = `${evidenceRoot}/m7-two-local-png-bound-p-20260923-v1`
const reviewId = 'canonical-math-p-v2-m7-two-local-png-bound-20260923-v1'
const currentConfigPath = `${output}/current-two.config.json`
const currentCandidatesPath = `${output}/current-two.candidates.json`
const currentReviewPath = `${output}/current-two.review.jsonl`

const sources = [
  {
    goalId: '570d5931-f126-5bb4-8b7f-db236d6b727f',
    title: 'Eine Kreistangente im Berührpunkt konstruieren',
    sourceConfig: `${evidenceRoot}/canonical-math-positive-understanding-evidence-calibration-v2.retained-before-m7-current-bundle39-20260920-v1.config.json`,
    sourceConfigSha: 'sha256:bf88f23b8e34c1403224df639a886fa89f1a024c9a532b7ffbaf8c40375b99a6',
    sourceReview: `${evidenceRoot}/canonical-math-positive-understanding-evidence-calibration-v2.retained-before-m7-current-bundle39-20260920-v1.review.jsonl`,
    sourceReviewSha: 'sha256:65e126299447258d77669ea68a63954a8d7f688f166b99e4ba44509f89e5935e',
    sourceCount: 17,
    retainedStem: 'tangent-source-retained16',
    pageNumber: 141,
    pageFingerprint: 'sha256:044bc0ae8858f632183cf31223fd74c8787749cf4cdb6499d5ae072589f79ac2',
    imageSha: 'sha256:48971c7fddbb8ab7fdf890a2a65f0063ad7ea617df5341823ae5c23f84031778',
    expectedCaseIds: ['construct-from-marked-point', 'diagnose-near-tangent'],
    reason: 'Das aktuelle Kreis-PNG zeigt im Original einen waagerechten Radius MP und die einzige senkrechte Tangente t im rechten Berührpunkt P; die 90°-Markierung und MP ⟂ t stimmen mit dem aktuellen Ziel, der Quelle und der GoalBook-Seite 141 überein. Es ist nur eine Orientierungshilfe und zeigt keine vollständigen Konstruktionsgriffe. Der erste frische Fall setzt P ausdrücklich links oben und verlangt eine neue, schräge Senkrechte; der zweite verlangt die Diagnose einer nur scheinbaren Tangente. Beide Fälle prüfen Konstruktion und geometrische Begründung unabhängig von der rechten Musterlösung im Bild. Aktueller bildgebundener P-v2-KI-Kandidat, keine menschliche Freigabe und keine Lernendenleistung.',
  },
  {
    goalId: 'dcda6fdf-108f-5ea1-bce7-6f30d6443517',
    title: 'Seitenhalbierende in Dreiecken konstruieren',
    sourceConfig: `${evidenceRoot}/canonical-math-positive-understanding-evidence-rollout-v1-batch-030-atlas-context-recheck-18-current-v1.retained-before-m7-current-bundle39-20260920-v1.config.json`,
    sourceConfigSha: 'sha256:6fe71b27bdcf6022ad4266157eaf1610bf7f1ae9102deb15ef30f32f158924b8',
    sourceReview: `${evidenceRoot}/canonical-math-positive-understanding-evidence-rollout-v1-batch-030-atlas-context-recheck-18-current-v1.retained-before-m7-current-bundle39-20260920-v1.review.jsonl`,
    sourceReviewSha: 'sha256:a949d92958eff62b6f965e6cbfddd333010026216f49297a6220a6b7e052d646',
    sourceCount: 16,
    retainedStem: 'median-source-retained15',
    pageNumber: 673,
    pageFingerprint: 'sha256:70b06ba6888d9307be5b0dbc7b6ba90440ef9ac88bd629549c325c0df955b25c',
    imageSha: 'sha256:82f3900283ff6d5a4eedeb4082df0db5cc9f1d291f0894828d45c5a2f0fee41d',
    expectedCaseIds: ['three-medians-base', 'coordinate-median-transfer', 'false-perpendicular-claim-transfer'],
    reason: 'Das aktuelle Dreieck-PNG zeigt im Original die Seitenhalbierende A–M zum Mittelpunkt von BC mit gleichen Teilstrecken und ohne falsche Senkrechtbehauptung; Alttext und GoalBook-Seite 673 stimmen mit Ziel und Quelle überein. Es zeigt nur ein Beispiel, nicht die Konstruktion aller drei Seitenmittelpunkte. Der alte Transferfall mit Parametergerade und Punktprobe liegt fachlich über der J7-Konstruktionskompetenz und wurde durch eine neue schräge AC-Seite mit geometrischer Mittelpunktprüfung und Korrektur einer nur scheinbar mittigen Markierung ersetzt. Die zwei anderen Fälle prüfen alle drei Seitenhalbierenden sowie die Abgrenzung von Höhe und Winkelhalbierender. Das Bild liefert keine der drei frischen Lösungen. Aktueller bildgebundener P-v2-KI-Kandidat, keine menschliche Freigabe und keine Lernendenleistung.',
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
  assert(args.length === 1 && ['--write', '--check'].includes(args[0]), 'Usage: tsx app/scripts/materializeMathM7TwoLocalPngPDelta.ts --write|--check')
  const write = args[0] === '--write'
  const base = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-math-national-atlas.json', root)
  assert(base.config.evidenceReviewPaths.length === 0, 'Expected the current base GoalBook without P review inputs')
  const landscape = await readJson<{ goals: Array<{ id: string; title: string; description: string; sourceRef?: string; resourceLinks?: Array<{ type: string; role?: string; url: string; altText?: string }> }> }>(
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  )
  const qa = await readJson<{ records: Array<{ goalId: string; imageUrl: string; assetSha256: string; aiApproved?: string; aiApprovedAssetSha256?: string; humanApproved: string; publicAssetPath: string; canonicalAssetPath: string }> }>(
    'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  )
  const oldByGoal = new Map<string, PositiveGoalEvidenceReviewRecord>()
  const bindingRows: Array<Record<string, unknown>> = []
  const generated: Array<{ path: string; bytes: Buffer }> = []
  let template: PositiveGoalEvidenceReviewConfig | null = null

  for (const spec of sources) {
    const [configBytes, reviewBytes] = await Promise.all([
      readFile(join(root, spec.sourceConfig)), readFile(join(root, spec.sourceReview)),
    ])
    assert(sha256(configBytes) === spec.sourceConfigSha && sha256(reviewBytes) === spec.sourceReviewSha, `${spec.goalId}: retained historical P source changed`)
    const config = JSON.parse(configBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
    const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
    const records = lines.map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
    assert(config.scope.goalIds.length === spec.sourceCount && records.length === spec.sourceCount, `${spec.goalId}: source P count changed`)
    assert(records.every((record, index) => record.goalId === config.scope.goalIds[index]), `${spec.goalId}: P scope order differs from records`)
    const old = records.find((record) => record.goalId === spec.goalId)
    assert(old?.status === 'needs_human_review' && old.reviewAuthority === 'ai_candidate' && old.evidenceLevel === 'E1' && old.maximumClaimScope === 'G1', `${spec.goalId}: expected unapproved E1/G1 AI candidate`)
    assert(old.profile.applicationCaseBriefs.map(({ id }) => id).join('|') === spec.expectedCaseIds.join('|'), `${spec.goalId}: historical transfer cases changed`)
    oldByGoal.set(spec.goalId, old)
    template ??= config

    const goal = landscape.goals.find(({ id }) => id === spec.goalId)
    const page = base.model.pages.find(({ goalId }) => goalId === spec.goalId)
    const imageQa = qa.records.find(({ goalId }) => goalId === spec.goalId)
    const imageUrl = `/assets/goal-visualizations/mathematik/${spec.goalId}/${spec.goalId}.png`
    const link = goal?.resourceLinks?.find((item) => item.type === 'goal-visualization' && item.role === 'primary')
    assert(goal?.title === spec.title && page?.title === spec.title && page.description === goal.description, `${spec.goalId}: canonical goal or page wording changed`)
    assert(goal.sourceRef && page.pageNumber === spec.pageNumber && page.goalFingerprint === old.goalFingerprint && page.pageFingerprint === spec.pageFingerprint, `${spec.goalId}: current goal/page/source binding changed`)
    assert(link?.url === imageUrl && page.visualization?.url === imageUrl && page.visualization.altText === link.altText && page.visualization.originalDigest === spec.imageSha, `${spec.goalId}: page image or alt text changed`)
    assert(page.visualization.qaStatus === 'review_candidate' && page.visualization.approvedForPublication === false, `${spec.goalId}: current page review status changed`)
    assert(imageQa?.imageUrl === imageUrl && imageQa.assetSha256 === spec.imageSha && imageQa.aiApproved === 'yes' && imageQa.aiApprovedAssetSha256 === spec.imageSha && imageQa.humanApproved === 'no', `${spec.goalId}: exact-image AI QA binding changed`)
    const copies = await Promise.all([
      readFile(join(root, imageQa.publicAssetPath)), readFile(join(root, imageQa.canonicalAssetPath)),
      readFile(join(root, 'backend/src/main/resources/static', imageUrl)),
    ])
    assert(copies.every((bytes) => sha256(bytes) === spec.imageSha), `${spec.goalId}: active PNG copies differ`)

    const retainedIds = config.scope.goalIds.filter((id) => id !== spec.goalId)
    assert(retainedIds.length === spec.sourceCount - 1, `${spec.goalId}: retained source subset count changed`)
    const retainedConfigPath = `${output}/${spec.retainedStem}.config.json`
    const retainedReviewPath = `${output}/${spec.retainedStem}.review.jsonl`
    const retainedConfig: PositiveGoalEvidenceReviewConfig = {
      ...config,
      reviewPath: retainedReviewPath,
      scope: { ...config.scope, label: `${retainedIds.length} unveränderte P-v2-Records nach gezieltem PNG-Split`, goalIds: retainedIds },
    }
    generated.push({ path: retainedConfigPath, bytes: jsonBytes(retainedConfig) })
    generated.push({ path: retainedReviewPath, bytes: Buffer.from(`${lines.filter((line) => retainedIds.includes((JSON.parse(line) as PositiveGoalEvidenceReviewRecord).goalId)).join('\n')}\n`) })
    bindingRows.push({
      goalId: spec.goalId,
      title: spec.title,
      sourceRef: goal.sourceRef,
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
    scope: { label: 'Zwei aktuelle bildgebundene Sek-I-Geometrie-P-v2-KI-Kandidaten', goalIds: sources.map(({ goalId }) => goalId) },
  }

  const tangentProfile = structuredClone(oldByGoal.get(sources[0].goalId)!.profile)
  const tangentFreshCase = tangentProfile.applicationCaseBriefs.find(({ id }) => id === 'construct-from-marked-point')
  assert(tangentFreshCase, 'Tangent fresh case missing')
  tangentFreshCase.taskDemandDe = 'Zu einem Kreis mit markiertem Mittelpunkt M und einem gegebenen Kreispunkt P links oben, sodass MP schräg verläuft, ist die Tangente exakt zu konstruieren und zu begründen.'
  tangentFreshCase.taskDemandEn = 'For a circle with marked centre M and a given point P in the upper-left arc, so that MP is oblique, construct the tangent exactly and justify it.'
  tangentFreshCase.expectedPerformanceDe = 'Die lernende Person zeichnet den schrägen Radius MP, konstruiert die Senkrechte zu MP durch P und begründet mit dem Radius-Tangenten-Kriterium, dass diese Gerade den Kreis dort berührt.'
  tangentFreshCase.expectedPerformanceEn = 'The learner draws the oblique radius MP, constructs the perpendicular to MP through P, and uses the radius–tangent criterion to justify that this line touches the circle there.'

  const medianProfile = structuredClone(oldByGoal.get(sources[1].goalId)!.profile)
  const verificationAxis = medianProfile.variationAxes.find(({ id }) => id === 'verification-mode')
  const medianTransfer = medianProfile.applicationCaseBriefs.find(({ id }) => id === 'coordinate-median-transfer')
  assert(verificationAxis && medianTransfer, 'Median transfer or variation axis missing')
  verificationAxis.textDe = 'Vollständige Konstruktion gegenüber Prüfung und Korrektur eines nur scheinbaren Seitenmittelpunkts auf schräger Seite'
  verificationAxis.textEn = 'Complete construction versus checking and correcting an apparent midpoint on an oblique side'
  medianTransfer.id = 'oblique-side-midpoint-transfer'
  medianTransfer.taskDemandDe = 'In einem stumpfwinkligen ungleichseitigen Dreieck ABC liegt auf der schrägen Seite AC ein Punkt N, der nur ungefähr mittig aussieht. Prüfe konstruktiv, ob BN eine Seitenhalbierende ist. Konstruiere anschließend die Seitenhalbierende von B zur Seite AC und begründe sie.'
  medianTransfer.taskDemandEn = 'In an obtuse scalene triangle ABC, a point N on the oblique side AC only looks approximately central. Use a construction to check whether BN is a median. Then construct and justify the median from B to AC.'
  medianTransfer.expectedPerformanceDe = 'Die lernende Person prüft, ob AN=NC durch exakten Streckenvergleich gilt, konstruiert den tatsächlichen Mittelpunkt M von AC, verbindet B mit M und begründet die Seitenhalbierende durch AM=MC. BN genügt nur dann, wenn N=M; Augenmaß oder Senkrechtlage allein genügen nicht.'
  medianTransfer.expectedPerformanceEn = 'The learner checks by exact segment comparison whether AN=NC, constructs the true midpoint M of AC, joins B to M, and justifies the median by AM=MC. BN qualifies only if N=M; visual estimation or perpendicularity alone is insufficient.'
  medianTransfer.understandingFocusDe = 'Unabhängiger geometrischer Transfer auf eine schräge Gegenseite mit Mittelpunktprüfung und Korrektur statt Koordinatenrechnung.'
  medianTransfer.understandingFocusEn = 'Independent geometric transfer to an oblique opposite side, with midpoint verification and correction instead of coordinate algebra.'

  const existingCandidateBytes = await readOptional(currentCandidatesPath)
  const reviewedAt = existingCandidateBytes
    ? (JSON.parse(existingCandidateBytes.toString('utf8')) as { reviewedAt: string }).reviewedAt
    : new Date().toISOString()
  const candidates = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId,
    reviewedAt,
    reviewer: 'Codex independent original-pixel and current-page P-v2 review /root/two_png_independent_qa',
    goals: sources.map((spec, index) => ({
      goalId: spec.goalId,
      reason: spec.reason,
      evidenceLevel: 'E1' as const,
      maximumClaimScope: 'G1' as const,
      dissent: [],
      profile: index === 0 ? tangentProfile : medianProfile,
    })),
  }
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config: currentConfig, candidateSet: candidates })
  assert(records.length === 2, 'Expected two current image-bound P records')
  for (const record of records) {
    const old = oldByGoal.get(record.goalId)!
    assert(record.goalFingerprint === old.goalFingerprint, `${record.goalId}: goal text changed during P rebind`)
    assert(record.reviewInputFingerprint !== old.reviewInputFingerprint && record.profileFingerprint !== old.profileFingerprint, `${record.goalId}: reviewed image/profile delta did not change fingerprints`)
    assert(record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.reviewRunIds.length === 0, `${record.goalId}: P authority changed`)
    const binding = bindingRows.find((row) => row.goalId === record.goalId)!
    Object.assign(binding, { currentReviewInputFingerprint: record.reviewInputFingerprint, currentProfileFingerprint: record.profileFingerprint })
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
    bookDigestDisposition: 'Whole-book digest is provenance only; claims are limited to these two exact current pages and PNG bytes.',
    changedGoals: bindingRows,
    reviewLimit: 'P-v2 AI candidates only; neither human approval nor learner performance nor independent D review nor a strict five-gate claim.',
  }) })
  for (const item of generated) await verifyOrWrite(item.path, item.bytes, write)
  for (const path of [`${output}/${sources[0].retainedStem}.config.json`, `${output}/${sources[1].retainedStem}.config.json`, currentConfigPath]) {
    const result = reviewPositiveGoalEvidenceConfig(path)
    assert(result.errors.length === 0, `${path}: ${result.errors.join(' | ')}`)
  }
  console.log(`${write ? 'Wrote' : 'Verified'} two current image-bound P-v2 AI candidates and 31 byte-identical retained P records; no human approval.`)
}

void main()
