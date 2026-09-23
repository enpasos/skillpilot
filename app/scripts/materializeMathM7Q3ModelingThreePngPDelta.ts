import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const evidenceRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const output = `${evidenceRoot}/m7-q3-modeling-three-png-current-p-20260923-v1`
const visualRoot = 'curricula/DE/Gymnasium/quality/goal-visualization-review'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const currentReviewId = 'canonical-math-m7-q3-modeling-three-current-png-p-20260923-v1'
const currentConfigPath = `${output}/current-three.config.json`
const currentCandidatesPath = `${output}/current-three.candidates.json`
const currentReviewPath = `${output}/current-three.review.jsonl`

type SourceSpec = {
  goalId: string
  title: string
  sourceConfig: string
  configSha: string
  sourceReview: string
  reviewSha: string
  retainedName: string
  count: number
  additionalExcludedGoalIds?: string[]
  imageSha: string
  imageReview: string
  reason: string
  requiredCaseIds: [string, string]
}

const sources: SourceSpec[] = [
  {
    goalId: '3019e775-1420-510f-850b-5a29acc47a64',
    title: 'Zufallsexperimente mit Ergebnissen und Ereignissen beschreiben',
    sourceConfig: `${evidenceRoot}/m7-b046-unchanged-six-retained-20260923-v1/positive-evidence.config.json`,
    configSha: 'sha256:d3d2837ebdb151b2cd0bd72fb070a99c494347b79427438487b2e27663b7c800',
    sourceReview: `${evidenceRoot}/m7-b046-unchanged-six-retained-20260923-v1/positive-evidence.review.jsonl`,
    reviewSha: 'sha256:0445afc68c090850dc146228629edde355f1c3b40269f64256a81a2df847951d',
    retainedName: 'b046-retained-five',
    count: 6,
    imageSha: 'sha256:b59b2255b6ab063211d3081a160cdb7bea5a9fba33fa3fdadd4aa4c16ae871f5',
    imageReview: `${visualRoot}/math-m7-q3-outcome-event-candidate-20260923-v1/independent-review-v2.json`,
    reason: 'Aktuelles PNG im Original fachlich geprüft: Ein Würfel zeigt als Einzelergebnis genau 3; Ω={1,2,3,4,5,6} und E={2,4,6}, wobei nur 2, 4, 6 markiert sind. 3 gehört zu Ω, nicht zu E. Die blanken Seitenflächen behaupten keine physische Würfelbelegung und Fairness folgt nicht aus dem Bild. Das unveränderte zweifache DE/EN-Transferprofil wurde erneut rechnerisch geprüft: Bei zwei unterscheidbaren Münzen enthält Ω vier geordnete Paare und „genau einmal Kopf“ genau (K,Z),(Z,K); beim Wechsel von zwei geordneten Würfeln zu ihrer Summe besteht das Ereignis ≥10 aus sechs Paaren bzw. den Summen 10,11,12. Summe 2 hat ein Paar als Urbild, Summe 7 sechs; aus bloßer Ergebnismenge folgt keine Gleichwahrscheinlichkeit. Das Bild illustriert nur das Grundschema und ersetzt die unabhängigen Transferleistungen nicht. KI-P-v2-Kandidat auf exaktem aktuellen Bild, ohne menschliche Freigabe.',
    requiredCaseIds: ['ordered-two-coin-experiment', 'change-observation-to-dice-sum'],
  },
  {
    goalId: 'ce2eb0a8-8f4e-5a94-b81d-8d7502dccf9c',
    title: 'Empirische und theoretische Wahrscheinlichkeit unterscheiden',
    sourceConfig: `${evidenceRoot}/canonical-math-positive-understanding-evidence-rollout-v1-batch-035-current-counterreviewed-7-v1.config.json`,
    configSha: 'sha256:38e3c883c0f3714dcea9f92ae302817655a7d018971fd6ed51489ccc829080ee',
    sourceReview: `${evidenceRoot}/canonical-math-positive-understanding-evidence-rollout-v1-batch-035-current-counterreviewed-7-v1.review.jsonl`,
    reviewSha: 'sha256:e8242eb509f7a5b1db1b3f8f39eff18826319143475dfdc889f6fe5fca1e86c7',
    retainedName: 'b035-retained-six',
    count: 7,
    imageSha: 'sha256:4fbd8328581da6ab5f79903b9d874bcf0c5d2f765c4582897e222c4b4240332e',
    imageReview: `${visualRoot}/math-m7-q3-model-vs-data-pointer-edit-20260923-v2/independent-original-image-review-20260923-v2.json`,
    reason: 'Aktuelles PNG im Original fachlich geprüft: Der Zeiger liegt klar im roten Halbkreis der gleich großen Felder; das faire Modell ergibt P(rot)=1/2. Von zehn protokollierten Ergebnissen sind genau sechs rot und vier blau, sodass die relative Häufigkeit 6/10=0,6 nur diese Stichprobe beschreibt und keine allgemeine Modellabweichung beweist. Das unveränderte bilinguale Transferprofil trennt die Herkunft auch jenseits dieses Bilds: 56 gerade Ergebnisse bei 100 fairen Würfelwürfen geben empirisch 0,56 gegen Modellwert 1/2; 30 rote von 40 Urnenziehungen geben empirisch 0,75, während 3/4 aus Zusammensetzung und Gleichwahrscheinlichkeitsannahme theoretisch 0,75 ergeben. Numerische Gleichheit oder Abweichung ersetzt keine Kontextbegründung und garantiert keinen nächsten Ausgang. Aktuelle Bildbindung und beide Transferfälle fachlich geprüft; KI-P-v2-Kandidat, keine menschliche Freigabe.',
    requiredCaseIds: ['gerade-wuerfelzahlen', 'gleiche-werte-andere-herkunft'],
  },
  {
    goalId: 'bfbaedb9-b138-590a-87e8-4d87784dda0e',
    title: 'Annahmen und Idealisationen formulieren',
    sourceConfig: `${evidenceRoot}/m7-three-png-p-recheck-20260923-v1/modeling-retained14.config.json`,
    configSha: 'sha256:a7b464cd2cebced087368c903413bbc822bafba85fbf79719d206605c9084de8',
    sourceReview: `${evidenceRoot}/m7-three-png-p-recheck-20260923-v1/modeling-retained14.review.jsonl`,
    reviewSha: 'sha256:b485d0f2dd7d5ff8666f5fcdccf0c89b78cf10c0d62a44c595d7207d5b557ea5',
    retainedName: 'modeling-retained-eleven',
    count: 14,
    additionalExcludedGoalIds: [
      '519660d0-85e5-57a6-a219-d0a253336649',
      'e03eca28-9a57-5b24-877c-2e63fecee986',
    ],
    imageSha: 'sha256:5d996c513723468e51f17086c57d7ab3a3eec2d484afdac61bf53908895af489',
    imageReview: `${visualRoot}/math-m7-bfba-straight-path-independent-review-20260923-v3/independent-original-image-review.md`,
    reason: 'Aktuelles PNG im Original fachlich geprüft: Beim schematisch gleitenden Ball folgt der gestrichelte Weg der geraden Rampe; „gerade Bahn“ und blaue gerade Linie widersprechen der Szene nicht mehr. Die Karten benennen als mögliche Idealisierungen konstante Beschleunigung und vernachlässigte Reibung; das Bild behauptet weder gemessenes Rollen noch reale Reibungsfreiheit. Der Satz „Idealisation ≠ Wirklichkeit“ begrenzt die Aussage. Das unveränderte DE/EN-Transferprofil prüft zweifach unabhängig: Beim 6-km-Busabschnitt ist ungefähr konstante mittlere Geschwindigkeit für einen Abschnitt ohne lange Halte/Staus eine begründete Zeitschätzungsannahme; beim 15-min-Füllen mit etwa 3 L/min vereinfacht vernachlässigbarer Verlust im dichten Behälter unter Kapazität die Bilanz. Der Busfall ist nicht dieselbe Bewegungsannahme wie konstante Beschleunigung auf der Rampe; gerade dieser Wechsel ist ein Transfer und darf nicht gleichgesetzt werden. Ziel, aktuelle Bildgrenze und Profile fachlich geprüft; KI-P-v2-Kandidat, keine menschliche Freigabe.',
    requiredCaseIds: ['short-bus-leg', 'water-container'],
  },
]

const sha256 = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(root, path), 'utf8')) as T
const readOptional = async (path: string): Promise<Buffer | null> => {
  try { return await readFile(path) } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const verifyOrWrite = async (path: string, expected: Buffer, write: boolean) => {
  const absolute = join(root, path)
  const current = await readOptional(absolute)
  if (current) {
    assert(current.equals(expected), `${path}: generated P artifact differs`)
  } else {
    assert(write, `${path}: generated P artifact missing`)
    await mkdir(dirname(absolute), { recursive: true })
    await writeFile(absolute, expected, { flag: 'wx' })
  }
}

const main = async () => {
  const args = process.argv.slice(2)
  assert(args.length === 1 && ['--write', '--check'].includes(args[0]), 'Usage: tsx app/scripts/materializeMathM7Q3ModelingThreePngPDelta.ts --write|--check')
  const write = args[0] === '--write'
  const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
  const landscape = await readJson<{ goals: Array<{ id: string; title: string; resourceLinks?: Array<{ type: string; role?: string; url: string }> }> }>(landscapePath)
  const qa = await readJson<{ records: Array<{ goalId: string; imageUrl: string; assetSha256: string; aiApproved?: string; aiApprovedAssetSha256?: string; humanApproved: string; publicAssetPath: string; canonicalAssetPath: string }> }>(qaPath)

  const generated: Array<{ path: string; bytes: Buffer }> = []
  const oldByGoal = new Map<string, PositiveGoalEvidenceReviewRecord>()
  const bindingRows = []
  let template: PositiveGoalEvidenceReviewConfig | null = null
  for (const spec of sources) {
    const [configBytes, reviewBytes, imageReviewBytes] = await Promise.all([
      readFile(join(root, spec.sourceConfig)), readFile(join(root, spec.sourceReview)), readFile(join(root, spec.imageReview)),
    ])
    assert(sha256(configBytes) === spec.configSha, `${spec.goalId}: prior P config changed`)
    assert(sha256(reviewBytes) === spec.reviewSha, `${spec.goalId}: prior P review changed`)
    assert(imageReviewBytes.toString('utf8').includes(spec.imageSha.slice(7)), `${spec.goalId}: independent image review is not hash-bound`)
    const config = JSON.parse(configBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
    const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
    const records = lines.map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
    assert(config.scope.goalIds.length === spec.count && records.length === spec.count, `${spec.goalId}: prior P scope changed`)
    assert(records.map((record) => record.goalId).join('|') === config.scope.goalIds.join('|'), `${spec.goalId}: prior P record order changed`)
    const sourceRecord = records.find((record) => record.goalId === spec.goalId)
    assert(sourceRecord?.status === 'needs_human_review' && sourceRecord.reviewAuthority === 'ai_candidate', `${spec.goalId}: expected prior AI candidate`)
    assert(sourceRecord.profile.applicationCaseBriefs.map((item) => item.id).join('|') === spec.requiredCaseIds.join('|'), `${spec.goalId}: transfer cases changed and need new review`)
    oldByGoal.set(spec.goalId, sourceRecord)
    template ??= config

    const goal = landscape.goals.find((item) => item.id === spec.goalId)
    const imageUrl = `/assets/goal-visualizations/mathematik/${spec.goalId}/${spec.goalId}.png`
    assert(goal?.title === spec.title && goal.resourceLinks?.filter((link) => link.type === 'goal-visualization' && link.role === 'primary').length === 1, `${spec.goalId}: current goal/link changed`)
    assert(goal.resourceLinks.some((link) => link.type === 'goal-visualization' && link.role === 'primary' && link.url === imageUrl), `${spec.goalId}: current image URL changed`)
    const qaRecord = qa.records.find((item) => item.goalId === spec.goalId)
    assert(qaRecord?.imageUrl === imageUrl && qaRecord.assetSha256 === spec.imageSha && qaRecord.aiApproved === 'yes' && qaRecord.aiApprovedAssetSha256 === spec.imageSha && qaRecord.humanApproved === 'no', `${spec.goalId}: current exact-image AI-V binding changed`)
    const copies = await Promise.all([
      readFile(join(root, qaRecord.publicAssetPath)),
      readFile(join(root, qaRecord.canonicalAssetPath)),
      readFile(join(root, 'backend/src/main/resources/static', imageUrl)),
    ])
    assert(copies.every((bytes) => sha256(bytes) === spec.imageSha), `${spec.goalId}: active PNG bytes differ from independent review`)

    const retainedConfigPath = `${output}/${spec.retainedName}.config.json`
    const retainedReviewPath = `${output}/${spec.retainedName}.review.jsonl`
    const excluded = new Set([spec.goalId, ...(spec.additionalExcludedGoalIds ?? [])])
    assert([...excluded].every((id) => config.scope.goalIds.includes(id)), `${spec.goalId}: prior split scope changed`)
    const retainedIds = config.scope.goalIds.filter((id) => !excluded.has(id))
    const retainedConfig: PositiveGoalEvidenceReviewConfig = {
      ...config,
      reviewPath: retainedReviewPath,
      scope: { ...config.scope, label: `${config.scope.label} — ${retainedIds.length} byteidentische P-Records nach gezieltem PNG-Split`, goalIds: retainedIds },
    }
    generated.push({ path: retainedConfigPath, bytes: jsonBytes(retainedConfig) })
    generated.push({ path: retainedReviewPath, bytes: Buffer.from(`${lines.filter((line) => retainedIds.includes((JSON.parse(line) as PositiveGoalEvidenceReviewRecord).goalId)).join('\n')}\n`) })
    bindingRows.push({
      goalId: spec.goalId,
      currentImageUrl: imageUrl,
      currentImageSha256: spec.imageSha,
      independentImageReviewPath: spec.imageReview,
      priorConfigPath: spec.sourceConfig,
      priorConfigSha256: spec.configSha,
      priorReviewPath: spec.sourceReview,
      priorReviewSha256: spec.reviewSha,
      retainedConfigPath,
      retainedCount: retainedIds.length,
      additionallyExcludedForSeparateTextReview: spec.additionalExcludedGoalIds ?? [],
      oldReviewInputFingerprint: sourceRecord.reviewInputFingerprint,
      oldProfileFingerprint: sourceRecord.profileFingerprint,
    })
  }
  assert(template, 'No source P config')
  const currentConfig: PositiveGoalEvidenceReviewConfig = {
    ...template,
    reviewId: currentReviewId,
    reviewPath: currentReviewPath,
    reviewedResourceTypes: ['goal-visualization'],
    scope: { label: 'Drei fachlich neu geprüfte aktuelle Q3-/Modellierungs-PNG-Bindungen', goalIds: sources.map(({ goalId }) => goalId) },
  }
  const existingCandidate = await readOptional(join(root, currentCandidatesPath))
  const reviewedAt = existingCandidate
    ? (JSON.parse(existingCandidate.toString('utf8')) as { reviewedAt: string }).reviewedAt
    : new Date().toISOString()
  const candidate = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId: currentReviewId,
    reviewedAt,
    reviewer: 'Codex current-image P-v2 substantive review /root/math_v_priority_audit',
    goals: sources.map((spec) => ({
      goalId: spec.goalId,
      reason: spec.reason,
      evidenceLevel: 'E1' as const,
      maximumClaimScope: 'G1' as const,
      dissent: [],
      profile: structuredClone(oldByGoal.get(spec.goalId)!.profile),
    })),
  }
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config: currentConfig, candidateSet: candidate })
  assert(records.length === sources.length, 'Expected exactly three current P records')
  records.forEach((record) => {
    const old = oldByGoal.get(record.goalId)!
    assert(record.reviewInputFingerprint !== old.reviewInputFingerprint, `${record.goalId}: image change did not alter P input`)
    assert(record.profileFingerprint === old.profileFingerprint, `${record.goalId}: transfer profile changed unexpectedly`)
    const row = bindingRows.find((item) => item.goalId === record.goalId)!
    Object.assign(row, { newReviewInputFingerprint: record.reviewInputFingerprint, unchangedProfileFingerprint: record.profileFingerprint })
  })
  generated.push({ path: currentConfigPath, bytes: jsonBytes(currentConfig) })
  generated.push({ path: currentCandidatesPath, bytes: jsonBytes(candidate) })
  generated.push({ path: currentReviewPath, bytes: Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`) })
  generated.push({ path: `${output}/binding-review.json`, bytes: jsonBytes({
    schemaVersion: 1,
    reviewId: currentReviewId,
    reviewedAt,
    reviewer: candidate.reviewer,
    authority: 'ai_candidate',
    humanApproved: false,
    changedGoalCount: sources.length,
    changedGoals: bindingRows,
    DReviewCampaignPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-q3-modeling-three-png-delta-20260923-v2.config.json',
    limit: 'P-v2 review is current-image candidate evidence only. D page reviews remain independent; no human profile approval, no learner-performance evidence, and no automatic strict five-gate claim.',
  }) })
  for (const item of generated) await verifyOrWrite(item.path, item.bytes, write)
  for (const path of [...sources.map(({ retainedName }) => `${output}/${retainedName}.config.json`), currentConfigPath]) {
    const result = reviewPositiveGoalEvidenceConfig(path)
    assert(result.errors.length === 0, `${path}: ${result.errors.join(' | ')}`)
  }
  console.log(`${write ? 'Wrote' : 'Verified'} exact three current-image P-v2 candidates and 22 byteidentical retained P records; no human approval.`)
}

void main()
