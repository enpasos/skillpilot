import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import { fingerprintPositiveGoalEvidenceProfile, type PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const target = 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ten-independent-png-20260927-v1'
const reviewedAt = '2026-09-27T09:11:38Z'
const sources = [
  { key: 'p20', path: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-p20-text-current-v1/positive-evidence.config.json' },
  { key: 'q3', path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-retained-after-user-image-import/94239e85e6ee.config.json' },
  { key: 'j7', path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-retained-after-user-image-import/caa79b7de280.config.json' },
  { key: 'calculus', path: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-five-png-two-text-current-20260923-v1/retained/rest-308.config.json' },
] as const

const goals = [
  { id: '70efdec0-110c-5564-849b-bc05cfff0f6a', sha: '2d19a513c73095f3d3e849352cfb8a155354865b6d611ba3552b9d63d0ab659c', reason: 'Vier verschiedene Plättchen erzeugen genau sechs ungeordnete Zweiergruppen: 4!/(2!·2!)=6. Die alten P-Transferfälle fünf aus zwei =10 und sechs aus drei =20 wurden mit der Teilmengen- statt Ziehfolgenzählung erneut geprüft.' },
  { id: '2041f4ec-620d-4a20-9922-6ebf16f8f8fa', sha: '2fe00147e59186ab14d70352351cc12f225b5eae48cbd518a9f196580fc096eb', reason: 'Die 3-4-5-Figur wird an der Winkelhalbierenden kongruent gespiegelt (die Katheten 3 und 4 wechseln ihre Lage) und mit k=2 beziehungsweise k=1/2 zu 6-8-10 und 1,5-2-2,5 skaliert. Die alten P-Fälle mit Koordinatenskalierung und Software-Verschiebung verlangen weiterhin eigene Konstruktion und Begründung; das Bild behauptet keine Softwareprüfung.' },
  { id: '0408ac7f-0530-5de5-b248-cf581c9b5a17', sha: 'a522c90588fefc0b8a112963a693a0531bf4cb9116d2128a69c79e34807b4c53', reason: 'Beim Ziehen mit Zurücklegen aus 2R+1B sind RRB, RBR, BRR die drei Trefferlagen und 3·(2/3)²·(1/3)=4/9. Der zweite alte P-Fall mit 3R+2B und vier Zügen ergibt weiterhin 6·(3/5)²·(2/5)²=216/625; keine Scheinselbständigkeit aus dem Bild.' },
  { id: '27bdc580-ba17-5399-bf02-48f354846d1d', sha: '4d134eb230ac996f76b52ace1b44fa83879b39c788689ac7b2a836e42e3e8f51', reason: 'Die durchgehende Kurve zeigt f(a)<0, f(c)=0, f(b)>0 und keinen formalen Stetigkeitsbeweis. Die alten P-Fälle wurden erneut kontrastiert: durchgehender Graph mit Randwerten −2 und 3 erzwingt mindestens eine Nullstelle, Sprungfunktion −1/+1 trotz Vorzeichenwechsel nicht.' },
  { id: '909d8b16-5156-528b-a300-d9aee5405ba0', sha: '04c731660994cdacadff6b69d4347113cd11dfadf9444ea09a57efea512cbe0f', reason: 'Der neue Getränkepreis 20·2+10·1,80=58 € wird korrekt dem alten 30·2=60 € gegenübergestellt. Die P-Fälle verlangen darüber hinaus gezielte Steigungsanpassung y=3x+2 samt Konflikt zur alten Messung und Kapazitätskappung bei 160 statt 180; geprüft, nicht aus dem Bild abgelesen.' },
  { id: 'e02b994f-376d-5a8e-a14c-c4acacae57cf', sha: 'f6710170409455556df3a2687b2f1682ee413d51d45a56d162bb2abf3b7471bb', reason: '30b≥73 und ganzzahliges b ergeben b_min=3; zwei Busse reichen nicht. Die P-Transferfälle wurden erneut gerechnet: P(x)=−x²+12x−20 auf 0..5 hat zulässiges Maximum P(5)=15, und bei x+2y=10 ist (3,3,5) unzulässig, (4,3) zulässig.' },
  { id: '18be713b-7d90-4f01-b60a-5582ac4df0e8', sha: '984456f9834149a31314167bc77a31b4ebdb1f9b4b896810ffb104427067bde2', reason: 'Für u=(1,0), v=(1,1) stimmen Schnittwinkel 45° und cos α=1/√2. Der zweite P-Fall bleibt unabhängig: Gerade d=(1,0,√3) und E:z=0 ergeben 30° zur Normale und 60° zur Ebene; Winkelkonvention erneut geprüft.' },
  { id: 'f2a12269-6bcb-564a-9fdb-45cfdbd704fc', sha: 'e5fc79e6c424399d9e479fa42b5b157d490e27ae962c1e50c0919fc8508bc8f3', reason: 'Bei gleicher Grundfläche 12 cm² und Höhen 3/9 cm sind die Teilvolumina 36/108 cm³ und das Verhältnis 1:3. Die P-Fälle bleiben korrekt: Prismateile 16:40=2:5, bei einer Pyramide mit Höhenmaßstab 1/4 aber kubische Volumenskalierung 1/64 und Teil-zu-Rest 1:63.' },
  { id: '3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6', sha: '249fe3f8c0555dd276d65d5563e105d942ed26983488d71fd84f70410fb14470', reason: 'Aus 3R+2B sind C(3,2)+C(2,2)=4 gleichfarbige von C(5,2)=10 ungeordneten Paaren günstig, also 2/5. Die anderen P-Fälle verlangen neuen Transfer: 3R+3B ergibt 6/15=2/5, ein gerader zweistelliger Code aus vier verschiedenen Ziffern 6/12=1/2.' },
  { id: '7156558c-57f1-4372-9ba7-0640c3f7cb3a', sha: 'c8be0423886df14cef2c227e581118e9240f1ce9175eccad263c1076a6574a41', reason: 'Das neue Bild zu f(x)=x² zeigt A(2,4), B(3,9), Sekante 5 und Tangente in A mit Steigung 4; das falsche ältere Bild ist ersetzt. Die P-Fälle wurden unabhängig nachgerechnet: bei x=1 ist ((1+h)²−1)/h=2+h→2, beim Höhenmodell H(2+h)−H(2) pro h =−4−h→−4 m/s.' },
] as const

const sha256 = (value: Buffer | string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(root, path), 'utf8')) as T
const writeOrCheck = async (path: string, bytes: Buffer, mode: 'write' | 'refresh' | 'check'): Promise<void> => {
  const absolute = join(root, path)
  if (mode === 'write') { await mkdir(dirname(absolute), { recursive: true }); await writeFile(absolute, bytes, { flag: 'wx' }) }
  else if (mode === 'refresh' && (path.endsWith('/positive-current-ten.candidates.json') || path.endsWith('/positive-current-ten.review.jsonl') || path.endsWith('/positive-binding-review.json'))) {
    await writeFile(absolute, bytes)
  }
  else assert((await readFile(absolute)).equals(bytes), `${path}: changed or stale`)
}

const main = async (): Promise<void> => {
  const mode = process.argv[2]
  assert(mode === '--write' || mode === '--refresh' || mode === '--check', 'Usage: tsx app/scripts/materializeMathM7TenPDelta.ts --write|--refresh|--check')
  const outputMode = mode.slice(2) as 'write' | 'refresh' | 'check'
  const ids = new Set(goals.map(({ id }) => id))
  const canonical = await readJson<{ goals: Array<{ id: string; resourceLinks?: Array<{ type: string; role?: string; url: string }> }> }>('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
  const qa = await readJson<{ records: Array<{ goalId: string; assetSha256: string; aiApproved?: string; aiApprovedAssetSha256?: string }> }>('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json')
  for (const { id, sha } of goals) {
    const expected = `sha256:${sha}`
    const url = `/assets/goal-visualizations/mathematik/${id}/${id}.png`
    const links = canonical.goals.find((goal) => goal.id === id)?.resourceLinks?.filter((link) => link.type === 'goal-visualization' && link.role === 'primary')
    assert(links?.length === 1 && links[0]?.url === url, `${id}: canonical link missing or not unique`)
    const copies = await Promise.all([
      readFile(join(root, 'curricula/DE/Gymnasium/visualizations/mathematik', id, `${id}.png`)),
      readFile(join(root, 'app/public', url)),
      readFile(join(root, 'backend/src/main/resources/static', url)),
    ])
    assert(copies.every((copy) => sha256(copy) === expected), `${id}: three PNG copies do not match reviewed hash`)
    const review = qa.records.find((row) => row.goalId === id)
    assert(review?.assetSha256 === expected && review.aiApproved === 'yes' && review.aiApprovedAssetSha256 === expected, `${id}: exact V approval absent`)
  }

  const sourceData = await Promise.all(sources.map(async ({ key, path }) => {
    const configBytes = await readFile(join(root, path))
    const config = JSON.parse(configBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
    const reviewBytes = await readFile(join(root, config.reviewPath))
    const raw = reviewBytes.toString('utf8').trimEnd().split('\n')
    const records = raw.map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
    assert(records.length === config.scope.goalIds.length && records.every((row, index) => row.goalId === config.scope.goalIds[index]), `${key}: old P config/record order changed`)
    return { key, path, config, configBytes, reviewBytes, raw, records }
  }))
  const oldRecords = new Map<string, { record: PositiveGoalEvidenceReviewRecord; source: string }>()
  const artifacts: Array<{ path: string; bytes: Buffer }> = []
  const retainedConfigs: string[] = []
  for (const source of sourceData) {
    for (const record of source.records) {
      if (!ids.has(record.goalId as typeof goals[number]['id'])) continue
      assert(!oldRecords.has(record.goalId), `${record.goalId}: duplicate active P source`)
      assert(record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate', `${record.goalId}: expected old AI P candidate`)
      oldRecords.set(record.goalId, { record, source: source.path })
    }
    const retained = source.records.filter((record) => !ids.has(record.goalId as typeof goals[number]['id']))
    if (!retained.length) continue
    const retainedPath = `${target}/positive-retained-${source.key}.review.jsonl`
    const retainedConfigPath = `${target}/positive-retained-${source.key}.config.json`
    const retainedConfig: PositiveGoalEvidenceReviewConfig = {
      ...source.config,
      reviewPath: retainedPath,
      scope: { ...source.config.scope, label: `${source.config.scope.label} — unchanged records retained after ten PNG imports`, goalIds: retained.map((record) => record.goalId) },
    }
    retainedConfigs.push(retainedConfigPath)
    artifacts.push({ path: retainedConfigPath, bytes: jsonBytes(retainedConfig) })
    artifacts.push({ path: retainedPath, bytes: Buffer.from(`${retained.map((record) => source.raw[source.records.indexOf(record)]).join('\n')}\n`) })
  }
  assert(oldRecords.size === goals.length, `Expected ${goals.length} unique old P records; found ${oldRecords.size}`)
  const base = sourceData[0]!.config
  assert(sourceData.every(({ config }) => config.landscapePath === base.landscapePath && config.reviewCriteriaPath === base.reviewCriteriaPath), 'P source context differs')
  const currentConfig: PositiveGoalEvidenceReviewConfig = {
    ...base,
    reviewId: 'canonical-math-positive-evidence-m7-ten-current-png-20260927-v1',
    reviewPath: `${target}/positive-current-ten.review.jsonl`,
    reviewedResourceTypes: ['goal-visualization'],
    scope: { label: 'Ten independently inspected current Mathematics PNGs; profiles rechecked as AI candidates', goalIds: goals.map(({ id }) => id) },
  }
  const candidateSet = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId: currentConfig.reviewId,
    reviewedAt,
    reviewer: 'Codex independent current-PNG P-v2 content review; exact imagegen model not exposed for OpenAI assets',
    goals: goals.map(({ id, sha, reason }) => ({
      goalId: id,
      reason: `Aktuelles PNG sha256:${sha} im Original und bei 360 px geprüft. ${reason} Das Profil bleibt E1/G1-KI-Kandidat; keine menschliche oder lernpraktische Freigabe.`,
      evidenceLevel: 'E1' as const,
      maximumClaimScope: 'G1' as const,
      dissent: [],
      profile: structuredClone(oldRecords.get(id)!.record.profile),
    })),
  }
  const currentRecords = await buildPositiveGoalEvidenceCandidateRecords({ config: currentConfig, candidateSet })
  assert(currentRecords.length === goals.length, 'Current P count wrong')
  for (const record of currentRecords) {
    const old = oldRecords.get(record.goalId)!.record
    assert(record.reviewInputFingerprint !== old.reviewInputFingerprint, `${record.goalId}: image not added to P fingerprint`)
    assert(record.profileFingerprint === old.profileFingerprint, `${record.goalId}: prior P profile content changed`)
    assert(record.profileFingerprint === fingerprintPositiveGoalEvidenceProfile(record.profile), `${record.goalId}: P profile hash invalid`)
  }
  const receipt = {
    schemaVersion: 1,
    reviewedAt,
    authority: 'ai_candidate',
    humanApproved: false,
    sources: sourceData.map(({ key, path, configBytes, reviewBytes }) => ({ key, configPath: path, configSha256: sha256(configBytes), reviewSha256: sha256(reviewBytes) })),
    goals: currentRecords.map((record) => ({
      goalId: record.goalId,
      imageSha256: `sha256:${goals.find(({ id }) => id === record.goalId)!.sha}`,
      oldConfigPath: oldRecords.get(record.goalId)!.source,
      oldReviewInputFingerprint: oldRecords.get(record.goalId)!.record.reviewInputFingerprint,
      currentReviewInputFingerprint: record.reviewInputFingerprint,
      unchangedProfileFingerprint: record.profileFingerprint,
      status: record.status,
    })),
    limit: 'Current-image P-v2 AI candidates only; no human approval or learner performance evidence.',
  }
  artifacts.push(
    { path: `${target}/positive-current-ten.config.json`, bytes: jsonBytes(currentConfig) },
    { path: `${target}/positive-current-ten.candidates.json`, bytes: jsonBytes(candidateSet) },
    { path: `${target}/positive-current-ten.review.jsonl`, bytes: Buffer.from(`${currentRecords.map((record) => JSON.stringify(record)).join('\n')}\n`) },
    { path: `${target}/positive-binding-review.json`, bytes: jsonBytes(receipt) },
  )
  for (const artifact of artifacts) await writeOrCheck(artifact.path, artifact.bytes, outputMode)
  for (const path of [...retainedConfigs, `${target}/positive-current-ten.config.json`]) {
    const result = reviewPositiveGoalEvidenceConfig(path)
    assert(result.errors.length === 0, `${path}: ${result.errors.join(' | ')}`)
  }
  console.log(`${mode === '--check' ? 'Verified' : 'Wrote'} ten exact-PNG P-v2 AI candidates and ${retainedConfigs.length} unchanged retained groups.`)
}

void main()
