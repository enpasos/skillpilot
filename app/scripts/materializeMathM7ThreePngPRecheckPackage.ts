import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import { loadGoalBookBuildInputs } from './goalBookModel'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'

type Digest = `sha256:${string}`
type CandidateSet = {
  schemaVersion: 1
  authoringContract: 'positive-understanding-evidence-candidates-v1'
  reviewId: string
  reviewedAt: string
  reviewer: string
  goals: Array<{
    goalId: string
    reason: string
    evidenceLevel: 'E1'
    maximumClaimScope: 'G1'
    dissent: string[]
    profile: PositiveGoalEvidenceReviewRecord['profile']
  }>
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const evidenceRoot = join(repositoryRoot, 'curricula/DE/Gymnasium/quality/goal-evidence')
const packageDirectory = join(evidenceRoot, 'm7-three-png-p-recheck-20260923-v1')
const sourceNames = {
  modeling: 'canonical-math-positive-understanding-evidence-m7-modeling-sixteen-20260922-v1',
  spatial: 'canonical-math-positive-understanding-evidence-m7-spatial-nine-20260922-v1',
} as const
const sourceDigests = {
  modelingConfig: 'sha256:6453d445d9117b5bcb716c2bd1182bbe280d5af563876a886d652188b5dcdd78',
  modelingReview: 'sha256:1d45dea0b2629ff8103286ac0c3d86fe09177ab1ec428c54359be72998d09f39',
  spatialConfig: 'sha256:791c1f96c253484e37d3757629d937b20d5cff529756257367996c0574da5143',
  spatialReview: 'sha256:d3fd961392103319b4c787833e392d2c134889727f058ae112bf8fd156ba6491',
} as const
const ids = {
  compare: '163dd583-8308-53f0-b60d-34588787988d',
  improve: 'fb4dcd2a-a6a9-5371-a2fc-95348ee130e0',
  vectors: '6fc9246a-9448-4cdb-b627-cf20ea1c65d3',
} as const
const changedGoalIds = [ids.compare, ids.improve, ids.vectors]
const currentBindings = [
  {
    goalId: ids.compare,
    goalFingerprint: 'sha256:084388b924fb04f332eda5a274be2366af48420bfb82395f43e1c12a0a5cd4d2',
    pageFingerprint: 'sha256:8c32d51dd848458b567b364d939259765eaaf8c0d1bab193f545634223af06f9',
    imageDigest: 'sha256:6f66c3d6bb4b84472299c3beb573fccd1f7b35cdfb3db21b5383a050b11078c9',
  },
  {
    goalId: ids.improve,
    goalFingerprint: 'sha256:8e66fbada8aaebef3e9454d821fae4b28ce455fab624d814cb7a8659e233eb06',
    pageFingerprint: 'sha256:2ec68004866e030dc5168f8e8e140c721bf79a293e9c949449d84fd6c8f9460f',
    imageDigest: 'sha256:9c51468c08c6f883e8f3112d962a0bf6a5f046d33ee840f657e504b623af97f0',
  },
  {
    goalId: ids.vectors,
    goalFingerprint: 'sha256:a4aa1ee1694db01c13e2690875b027cd75fe6d046479e916224540f9bf9e92fa',
    pageFingerprint: 'sha256:2ee5f7d39e7593e7b41790081b9dc30f742cb9bab643f01ac21465843fb67f27',
    imageDigest: 'sha256:c0cecbbad7341c1b6273707818f7745eee6eb61c005c657f99ad9a066b960373',
  },
] as const
const reviewedAt = '2026-09-23T00:46:35Z'
const write = process.argv.includes('--write')

const sha256 = (value: Buffer | string): Digest => `sha256:${createHash('sha256').update(value).digest('hex')}`
const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message) }
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const readJson = async <T>(path: string) => JSON.parse(await readFile(path, 'utf8')) as T
const readOptional = async (path: string) => {
  try { return await readFile(path) } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const writeAllOrRequireExact = async (artifacts: Array<{ path: string; bytes: Buffer }>) => {
  for (const { path, bytes } of artifacts) {
    const current = await readOptional(path)
    if (current) assert(current.equals(bytes), `Existing generated P artifact differs: ${path}`)
    else if (!write) throw new Error(`Missing generated P artifact: ${path}`)
    else {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, bytes, { flag: 'wx' })
    }
  }
}
const readSource = async (name: string, expectedConfigDigest: Digest, expectedReviewDigest: Digest) => {
  const configBytes = await readFile(join(evidenceRoot, `${name}.config.json`))
  const reviewBytes = await readFile(join(evidenceRoot, `${name}.review.jsonl`))
  assert(sha256(configBytes) === expectedConfigDigest && sha256(reviewBytes) === expectedReviewDigest, `${name}: historical P source bytes changed`)
  const config = JSON.parse(configBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
  const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
  const records = lines.map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
  assert(records.length === config.scope.goalIds.length, `${name}: source record/scope count differs`)
  assert(new Set(records.map(({ goalId }) => goalId)).size === records.length, `${name}: duplicate source goal`)
  assert(config.scope.goalIds.every((goalId) => records.some((record) => record.goalId === goalId)), `${name}: source scope and records disagree`)
  return { config, lines, records }
}
const retainedArtifacts = (
  source: Awaited<ReturnType<typeof readSource>>,
  excludedIds: string[],
  stem: string,
  label: string,
) => {
  const retainedIds = source.config.scope.goalIds.filter((goalId) => !excludedIds.includes(goalId))
  const retainedLines = source.lines.filter((line) => retainedIds.includes((JSON.parse(line) as PositiveGoalEvidenceReviewRecord).goalId))
  assert(retainedIds.length === retainedLines.length && retainedIds.length === source.records.length - excludedIds.length, `${stem}: retained subset is incomplete`)
  const reviewPath = `curricula/DE/Gymnasium/quality/goal-evidence/m7-three-png-p-recheck-20260923-v1/${stem}.review.jsonl`
  const config = {
    ...source.config,
    reviewPath,
    scope: { label, goalIds: retainedIds },
  }
  return {
    ids: retainedIds,
    config,
    artifacts: [
      { path: join(packageDirectory, `${stem}.config.json`), bytes: jsonBytes(config) },
      { path: join(packageDirectory, `${stem}.review.jsonl`), bytes: Buffer.from(`${retainedLines.join('\n')}\n`) },
    ],
  }
}

const main = async () => {
  assert(process.argv.slice(2).every((arg) => arg === '--write'), 'Only --write is supported')
  const [modeling, spatial, threeConfig] = await Promise.all([
    readSource(sourceNames.modeling, sourceDigests.modelingConfig, sourceDigests.modelingReview),
    readSource(sourceNames.spatial, sourceDigests.spatialConfig, sourceDigests.spatialReview),
    readJson<PositiveGoalEvidenceReviewConfig>(join(packageDirectory, 'three-current-png.config.json')),
  ])
  assert(modeling.records.length === 16 && spatial.records.length === 9, 'Historical campaign counts changed')
  assert(changedGoalIds.every((goalId) => threeConfig.scope.goalIds.includes(goalId)) && threeConfig.scope.goalIds.length === 3, 'New three-goal config scope changed')
  const oldByGoalId = new Map([...modeling.records, ...spatial.records].map((record) => [record.goalId, record]))
  assert(changedGoalIds.every((goalId) => oldByGoalId.has(goalId)), 'One changed goal has no historical P source')
  for (const goalId of changedGoalIds) {
    const source = oldByGoalId.get(goalId)!
    assert(source.status === 'needs_human_review' && source.reviewAuthority === 'ai_candidate' && source.evidenceLevel === 'E1' && source.maximumClaimScope === 'G1', `${goalId}: historical source is not an E1/G1 AI candidate`)
  }
  const retainedModeling = retainedArtifacts(modeling, [ids.compare, ids.improve], 'modeling-retained14', 'Vierzehn unveränderte, aktuelle Modeling-P-v2-Kandidaten nach Bildwechsel-Split')
  const retainedSpatial = retainedArtifacts(spatial, [ids.vectors], 'spatial-retained8', 'Acht unveränderte, aktuelle Spatial-P-v2-Kandidaten nach Bildwechsel-Split')
  assert(retainedModeling.ids.length === 14 && retainedSpatial.ids.length === 8, 'Retained candidate counts must be 14 and eight')

  const currentBase = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-math-national-atlas.json', repositoryRoot)
  const canonicalGoalById = new Map(currentBase.model.pages.map((page) => [page.goalId, page]))
  assert(currentBase.config.evidenceReviewPaths.length === 0, 'The base GoalBook unexpectedly includes P review inputs')
  const canonicalLandscape = await readJson<{ goals: Array<{ id: string; title: string; tags?: string[] }> }>(
    join(repositoryRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),
  )
  const hessenSource = await readJson<{ goals: Array<{ id: string; title: string; tags?: string[] }> }>(
    join(repositoryRoot, 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot'),
  )
  const hessenMapping = await readJson<{ mappings: Array<{ legacyGoalId: string; canonicalGoalId: string; matchType: string }> }>(
    join(repositoryRoot, 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json'),
  )
  const canonicalCompare = canonicalLandscape.goals.find(({ id }) => id === ids.compare)
  const canonicalImprove = canonicalLandscape.goals.find(({ id }) => id === ids.improve)
  const sourceCompareId = '61ac138a-f470-4f29-a056-8a6d5682ef19'
  const sourceImproveId = 'c7fe19c8-a08f-4ee3-8752-ecd86fd0ac05'
  const sourceCompare = hessenSource.goals.find(({ id }) => id === sourceCompareId)
  const sourceImprove = hessenSource.goals.find(({ id }) => id === sourceImproveId)
  assert(
    canonicalCompare?.title.endsWith('(LK)') && JSON.stringify(canonicalCompare.tags) === '["LK"]'
    && sourceCompare?.title.endsWith('(LK)') && JSON.stringify(sourceCompare.tags) === '["LK"]'
    && hessenMapping.mappings.some(({ legacyGoalId, canonicalGoalId, matchType }) => legacyGoalId === sourceCompareId && canonicalGoalId === ids.compare && matchType === 'exact'),
    '163 LK-only canonical/source binding changed; re-adjudicate applicability hold',
  )
  assert(
    JSON.stringify(canonicalImprove?.tags) === '["GK","LK"]'
    && JSON.stringify(sourceImprove?.tags) === '["GK","LK"]'
    && hessenMapping.mappings.some(({ legacyGoalId, canonicalGoalId, matchType }) => legacyGoalId === sourceImproveId && canonicalGoalId === ids.improve && matchType === 'exact'),
    'fb4d GK/LK canonical/source binding changed',
  )
  const comparePage = canonicalGoalById.get(ids.compare)
  const compareGkJurisdictions = comparePage?.applicability
    ?.filter(({ scopes }) => scopes.some(({ courseProfile }) => courseProfile === 'GK'))
    .map(({ jurisdiction }) => jurisdiction) ?? []
  assert(compareGkJurisdictions.includes('DE-HE'), '163 LK-only source is no longer exposed in the HE GK GoalBook; re-adjudicate hold')
  const qa = await readJson<{ records: Array<{ goalId: string; imageUrl: string; publicAssetPath: string; canonicalAssetPath: string; assetSha256: Digest; aiApproved?: string; aiApprovedAssetSha256?: Digest; humanApproved?: string }> }>(
    join(repositoryRoot, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'),
  )
  const qaById = new Map(qa.records.map((record) => [record.goalId, record]))
  const boundPages = []
  for (const binding of currentBindings) {
    const page = canonicalGoalById.get(binding.goalId)
    const imageQa = qaById.get(binding.goalId)
    assert(page && imageQa && page.visualization, `${binding.goalId}: current page/image QA missing`)
    assert(
      page.goalFingerprint === binding.goalFingerprint
      && page.pageFingerprint === binding.pageFingerprint
      && page.visualization.url === imageQa.imageUrl
      && page.visualization.url.endsWith(`/${binding.goalId}.png`)
      && page.visualization.originalDigest === binding.imageDigest
      && page.visualization.qaStatus === 'review_candidate'
      && page.visualization.approvedForPublication === false
      && imageQa.assetSha256 === binding.imageDigest
      && imageQa.aiApproved === 'yes'
      && imageQa.aiApprovedAssetSha256 === binding.imageDigest
      && imageQa.humanApproved !== 'yes',
      `${binding.goalId}: target image/page/current AI-QA binding differs from reviewed PNG`,
    )
    const [publicBytes, canonicalBytes] = await Promise.all([
      readFile(resolve(repositoryRoot, imageQa.publicAssetPath)),
      readFile(resolve(repositoryRoot, imageQa.canonicalAssetPath)),
    ])
    assert(sha256(publicBytes) === binding.imageDigest && sha256(canonicalBytes) === binding.imageDigest, `${binding.goalId}: public/canonical image bytes differ from reviewed PNG`)
    boundPages.push({
      goalId: binding.goalId,
      title: page.title,
      description: page.description,
      breadcrumbs: page.breadcrumbs,
      goalFingerprint: binding.goalFingerprint,
      pageFingerprint: binding.pageFingerprint,
      imageUrl: page.visualization.url,
      imageDigest: binding.imageDigest,
      pageQaStatus: page.visualization.qaStatus,
      pageApprovedForPublication: page.visualization.approvedForPublication,
      aiApprovedForExactImage: true,
      humanApproved: imageQa.humanApproved ?? null,
    })
  }

  const improveProfile = structuredClone(oldByGoalId.get(ids.improve)!.profile)
  const fare = improveProfile.applicationCaseBriefs.find((brief) => brief.id === 'fare-waiting-improvement')
  const tank = improveProfile.applicationCaseBriefs.find((brief) => brief.id === 'declining-flow-improvement')
  assert(fare && tank && improveProfile.applicationCaseBriefs.length === 2, 'fb4d historical case structure changed')
  fare.taskDemandDe = 'Ein Taximodell C(d)=4 €+(2 €/km)d für die Strecke d in km unterschätzt Fahrten mit längerer Wartezeit trotz gleicher Strecke. Schlage eine gezielte Verbesserung vor und erkläre ihre qualitative Wirkung.'
  fare.taskDemandEn = 'A taxi model C(d)=€4+(€2/km)d for distance d in km underestimates trips with longer waiting time despite the same distance. Propose a targeted improvement and explain its qualitative effect.'
  fare.expectedPerformanceDe = 'Ergänze die gemessene Wartezeit w in min und einen sachlich begründeten positiven Minutenpreis p in €/min: C(d,w)=4 €+(2 €/km)d+p w. Bei gleicher Strecke wächst der Preis mit w, weil p>0; p und w müssten bekannt oder erhoben werden. Ohne berechnetes Warteentgelt ist der Zusatz nicht begründet.'
  fare.expectedPerformanceEn = 'Add measured waiting time w in minutes and a contextually justified positive rate p in €/min: C(d,w)=€4+(€2/km)d+p w. At fixed distance the price rises with w because p>0; p and w must be known or measured. Without a waiting charge the added term is not justified.'
  tank.taskDemandDe = 'Für t in Minuten mit 0≤t≤40 min prognostiziert ein Tankmodell V(t)=120 L−(3 L/min)t zu späteren Zeiten zu wenig Wasser, weil der Abfluss mit sinkendem Druck langsamer wird. Schlage innerhalb dieses Zeitbereichs eine Verbesserung vor und beschreibe ihre Wirkung gegenüber der konstanten Rate.'
  tank.taskDemandEn = 'For t in minutes with 0≤t≤40 min, a tank model V(t)=120 L−(3 L/min)t predicts too little water at later times because outflow slows as pressure falls. Propose an improvement within this time range and describe its effect relative to the constant rate.'
  tank.expectedPerformanceDe = 'Ersetze 3 L/min in einer späteren Phase durch eine anhand von Messungen kleinere, weiterhin nichtnegative Abflussrate, die von Zeit oder Füllstand abhängt. Wenn der frühere Verlauf gleich bleibt, fließt ab diesem Wechsel bis zu jedem verglichenen späteren Zeitpunkt weniger Wasser ab; V liegt dann über der konstanten-Rate-Prognose. Zur Bestimmung der Rate sind weitere Durchflussmessungen nötig.'
  tank.expectedPerformanceEn = 'Replace 3 L/min in a later phase with a measured, lower but still nonnegative outflow rate depending on time or volume. If the earlier trajectory stays the same, less water flows out from that change until each compared later time, so V then exceeds the constant-rate prediction. Further flow measurements are needed to determine the rate.'

  const candidateSet: CandidateSet = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: threeConfig.reviewId,
    reviewedAt,
    reviewer: 'Codex / informed AI current-PNG P-v2 re-review / math_modeling_p16',
    goals: [
      {
        goalId: ids.compare,
        reason: 'Das aktuelle PNG stellt Einfachheit, Datengüte und Interpretierbarkeit als offene Fragen ohne unbelegte Modellrangfolge dar. E1 beruht auf zwei unabhängigen daten- und zweckgebundenen Vergleichsfällen; Bildwiedererkennung ist keine Lernerevidenz. Das Konstruieren neuer Modelle und Sensitivitätsanalyse bleiben außerhalb dieses Ziels.',
        evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: [],
        profile: structuredClone(oldByGoalId.get(ids.compare)!.profile),
      },
      {
        goalId: ids.improve,
        reason: 'Das aktuelle PNG zeigt den Grundpreis als mögliche Modellergänzung und verlangt eine Datenprüfung; es beweist keine reale Tarifregel. E1 prüft stattdessen unabhängig zusätzliche Wartezeit und variable Abflussrate. Die neuen Fälle präzisieren Einheiten, Zeitbereich und p>0, damit die behauptete Preiswirkung mathematisch gilt.',
        evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: [],
        profile: improveProfile,
      },
      {
        goalId: ids.vectors,
        reason: 'Das aktuelle PNG stellt a, b und c auf einem konsistenten x/y-Gitter mit dritter Koordinate 0 sowie e1,e2,e3 an den drei Raumachsen dar. E1 bleibt an frische Dreiergruppen, nichttriviale Nullkombinationen und den Nullvektor-Transfer gebunden, nicht an das Ablesen des Bildes; keine bestimmte Rechenmethode wird erzwungen.',
        evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: [],
        profile: structuredClone(oldByGoalId.get(ids.vectors)!.profile),
      },
    ],
  }
  const candidateRecords = await buildPositiveGoalEvidenceCandidateRecords({ config: threeConfig, candidateSet })
  assert(candidateRecords.length === 3 && candidateRecords.every((record) => record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.evidenceLevel === 'E1' && record.maximumClaimScope === 'G1'), 'New P records exceeded AI E1/G1 authority')
  const allReviewLines = candidateRecords.map((record) => JSON.stringify(record))
  const splitConfig = (stem: string, label: string, goalIds: string[]) => ({
    ...threeConfig,
    reviewPath: `curricula/DE/Gymnasium/quality/goal-evidence/m7-three-png-p-recheck-20260923-v1/${stem}.review.jsonl`,
    scope: { label, goalIds },
  })
  const currentTwo = splitConfig('current-two', 'Zwei aktuelle PNG-P-v2-Kandidaten ohne LK/GK-Geltungswiderspruch', [ids.improve, ids.vectors])
  const applicabilityHeldOne = splitConfig('applicability-held-163', 'Ein dokumentierter LK-only-P-v2-Kandidat mit GK-GoalBook-Geltungs-HOLD', [ids.compare])
  const receipt = {
    schemaVersion: 1,
    receiptId: 'canonical-math-m7-three-current-png-p-recheck-20260923-v1',
    authority: 'informed_ai_candidate_only',
    source: {
      modeling: { reviewId: modeling.config.reviewId, configDigest: sourceDigests.modelingConfig, reviewDigest: sourceDigests.modelingReview, retainedGoalCount: retainedModeling.ids.length },
      spatial: { reviewId: spatial.config.reviewId, configDigest: sourceDigests.spatialConfig, reviewDigest: sourceDigests.spatialReview, retainedGoalCount: retainedSpatial.ids.length },
    },
    changedGoals: candidateRecords.map((record, index) => ({
      ...boundPages[index],
      oldReviewInputFingerprint: oldByGoalId.get(record.goalId)!.reviewInputFingerprint,
      newReviewInputFingerprint: record.reviewInputFingerprint,
      oldProfileFingerprint: oldByGoalId.get(record.goalId)!.profileFingerprint,
      newProfileFingerprint: record.profileFingerprint,
      status: record.status,
      reviewAuthority: record.reviewAuthority,
      evidenceLevel: record.evidenceLevel,
      maximumClaimScope: record.maximumClaimScope,
    })),
    retained: { modelingGoalIds: retainedModeling.ids, spatialGoalIds: retainedSpatial.ids },
    integrationTriage: {
      currentPReviewConfig: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-three-png-p-recheck-20260923-v1/current-two.config.json',
      applicabilityHeldPReviewConfig: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-three-png-p-recheck-20260923-v1/applicability-held-163.config.json',
      heldGoalId: ids.compare,
      reason: 'Canonical and mapped HE source are LK-only; current base GoalBook includes this goal in GK, including DE-HE. P review is documented but not registry-eligible until the curricular applicability mismatch is resolved and rebound.',
      leakedGkJurisdictions: compareGkJurisdictions,
      unaffectedGkLkGoalId: ids.improve,
      baseGoalBookEvidenceReviewPathsEmpty: true,
    },
    limitations: {
      newHumanProfileApproval: false,
      centralRegistryChanged: false,
      oldDescriptionPageReviewsRebound: false,
      visualizationPublicationApproved: false,
    },
  }
  await writeAllOrRequireExact([
    ...retainedModeling.artifacts,
    ...retainedSpatial.artifacts,
    { path: join(packageDirectory, 'three-current-png.candidates.json'), bytes: jsonBytes(candidateSet) },
    { path: join(packageDirectory, 'three-current-png.review.jsonl'), bytes: Buffer.from(`${allReviewLines.join('\n')}\n`) },
    { path: join(packageDirectory, 'current-two.config.json'), bytes: jsonBytes(currentTwo) },
    { path: join(packageDirectory, 'current-two.review.jsonl'), bytes: Buffer.from(`${allReviewLines.filter((line) => [ids.improve, ids.vectors].includes((JSON.parse(line) as PositiveGoalEvidenceReviewRecord).goalId)).join('\n')}\n`) },
    { path: join(packageDirectory, 'applicability-held-163.config.json'), bytes: jsonBytes(applicabilityHeldOne) },
    { path: join(packageDirectory, 'applicability-held-163.review.jsonl'), bytes: Buffer.from(`${allReviewLines.filter((line) => (JSON.parse(line) as PositiveGoalEvidenceReviewRecord).goalId === ids.compare).join('\n')}\n`) },
    { path: join(packageDirectory, 'binding-receipt.json'), bytes: jsonBytes(receipt) },
  ])
  console.log(`${write ? 'Materialized' : 'Verified'} current-PNG P-v2 recheck package: 3 AI candidates, 2 integration-current, 1 applicability HOLD, 14 modeling retained, 8 spatial retained; output=${packageDirectory}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
