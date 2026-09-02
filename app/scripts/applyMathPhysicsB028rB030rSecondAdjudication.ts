import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// These bounded curriculum ledgers predate a shared TypeScript schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>

type Subject = 'mathematik' | 'physik'

type PromptBinding = {
  fileName: string
  beforeSha256: string
  afterSha256: string
  headingBindings: number
  titleBindings: number
  descriptionBindings: number
}

type Revision = {
  subject: Subject
  landscapeId: string
  titleDe: string
  titleEn: string
  beforeDescriptionDe: string
  beforeDescriptionEn: string
  finalDescriptionDe: string
  finalDescriptionEn: string
  requires: string[]
  provider: string
  imageSha256: string
  imageBytes: number
  prompts: PromptBinding[]
  beforeSemanticKindFingerprint: string
  beforeAtomicityFingerprint: string
  beforeMemoryFingerprint: string
  atomicityReason: string
  memoryStatus: 'memory_required' | 'no_memory_needed'
  memoryReason: string
  memoryGoalIds?: string[]
  deckIds?: string[]
  approvals: {
    umlautsCorrectChatGpt: 'yes' | 'no'
    contentApprovedChatGpt: 'yes' | 'no'
    humanApproved: 'yes' | 'no'
    humanIssueIdentified: 'yes' | 'no'
    humanIssueDescription: string
    humanReviewedAt: string | null
    humanReviewer: string
    aiApproved: 'yes' | 'no'
  }
}

type SubjectConfig = {
  landscapeId: string
  canonical: string
  semanticKinds: string
  atomicity: string
  memory: string
  visualQa: string
  reviewId: string
  goalIds: string[]
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2)
  .filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode === checkMode) {
  throw new Error('Select exactly one mode: --write or --check')
}

const reviewedAt = '2026-09-02'
const reviewer = 'codex-b028r-b030r-second-adjudication-2026-09-02'
const fixed985Prerequisite = '8c9394cb-f54a-508d-9750-4c49e31b3fa9'

const subjectConfigs: Record<Subject, SubjectConfig> = {
  mathematik: {
    landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
    canonical:
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    semanticKinds:
      'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
    atomicity:
      'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
    memory:
      'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
    visualQa:
      'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
    reviewId: 'canonical-math-full',
    goalIds: ['0a154cbd-1218-4553-835c-a754e9901bba'],
  },
  physik: {
    landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
    canonical:
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    semanticKinds:
      'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
    atomicity:
      'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
    memory:
      'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
    visualQa:
      'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
    reviewId: 'canonical-physics-full',
    goalIds: [
      '0924162b-46d0-5c56-93bc-33e1f5ac6886',
      '9854589c-5feb-4942-b90f-311ddf36eb78',
    ],
  },
}

const revisions: Record<string, Revision> = {
  '0a154cbd-1218-4553-835c-a754e9901bba': {
    subject: 'mathematik',
    landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
    titleDe: 'Formeln mit Brüchen nach Variablen auflösen',
    titleEn: 'Rearrange formulas with fractions for variables',
    beforeDescriptionDe:
      'Die lernende Person kann Formeln mit Bruchtermen, besonders aus naturwissenschaftlichen Kontexten, nach einer gesuchten Variablen auflösen und die Umformungen nachvollziehbar begründen.',
    beforeDescriptionEn:
      'The learner can rearrange formulas with fractional expressions, especially from science contexts, for a target variable and justify the transformations clearly.',
    finalDescriptionDe:
      'Die lernende Person kann Formeln mit Bruchtermen, besonders aus naturwissenschaftlichen Kontexten, unter Beachtung notwendiger Definitions- und Nichtnullbedingungen nach einer gesuchten Variablen auflösen und die Umformungen nachvollziehbar begründen.',
    finalDescriptionEn:
      'The learner can rearrange formulas containing fractional expressions, especially from scientific contexts, for a target variable while observing the necessary domain and non-zero conditions, and justify the transformations clearly.',
    requires: [
      'f7a9a0b4-ec64-468f-8da4-59c5055eac1d',
      '325771e1-602d-4bca-a199-a8f39a2d3dee',
      '65365dce-f33f-49d8-9516-42f75883aa86',
      '15512e77-31e3-5222-8a6b-84791618e5ce',
      '76478e47-5ff9-5de1-b601-5e6e436ad855',
    ],
    provider:
      'Google Gemini / Nano Banana Pro (gemini-3-pro-image, reference-image input)',
    imageSha256: 'b21b1344d2cac88c6a4c2f9a744014134e4fe5526c389883c88af6fe2e3cfcba',
    imageBytes: 1937985,
    prompts: [
      {
        fileName: 'prompt.de.md',
        beforeSha256: '248d9772a0064b70a69aaa53d70c8113941f8991e6f30b728893d13c1a91cd6f',
        afterSha256: 'ed372566604c182a9b4203590de590ffb3d8495c9ff19fc776fc752f07df32a5',
        headingBindings: 1,
        titleBindings: 2,
        descriptionBindings: 2,
      },
      {
        fileName: 'image-reconstruction-prompt.de.md',
        beforeSha256: 'a5663e9bc973299ac1c71af6f3d192d609cfd82c4a7d6c3359a74786c4182dee',
        afterSha256: 'a681ce4270d5f271b5bbacbb0a84fea8a2d72cce85077f981d6b79e23a55b9da',
        headingBindings: 1,
        titleBindings: 1,
        descriptionBindings: 1,
      },
    ],
    beforeSemanticKindFingerprint:
      'sha256:213f1e967bfa852294cd7b211ebba6de5c992f60d027003207024e5a76423d69',
    beforeAtomicityFingerprint:
      'sha256:eb4ac361d3e37dc24a795ee46805d859ba2f65921f22817d228a441a8ea76a12',
    beforeMemoryFingerprint:
      'sha256:9cfb1dd28e17c705f2772b745921b0846bb868f580a1b859b6c84968523c0f5a',
    atomicityReason:
      'Das Auflösen nach genau einer Zielvariablen unter den dafür notwendigen Definitions- und Nichtnullbedingungen und die Begründung der Äquivalenzumformungen bilden eine zusammenhängende Umformungskompetenz; es wird kein unabhängiges Teilziel mitgeführt.',
    memoryStatus: 'no_memory_needed',
    memoryReason:
      'Die notwendigen Definitions- und Nichtnullbedingungen müssen jeweils am konkreten Bruchterm erkannt und während der Umformung angewendet werden; eine isolierte Merkkarte ersetzt diese algebraische Begründungsleistung nicht.',
    approvals: {
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      humanIssueDescription: '',
      humanReviewedAt: null,
      humanReviewer: '',
      aiApproved: 'yes',
    },
  },
  '0924162b-46d0-5c56-93bc-33e1f5ac6886': {
    subject: 'physik',
    landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
    titleDe: 'Magnetisierung und Permanentmagnete',
    titleEn: 'Magnetization and Permanent Magnets',
    beforeDescriptionDe:
      'Die lernende Person kann in einem oberstufengerechten Modell Magnetisierung und Permanentmagnetismus durch die Ausrichtung mikroskopischer magnetischer Momente erklären und den Zusammenhang mit der makroskopischen Feldwirkung herstellen.',
    beforeDescriptionEn:
      'The learner can use an upper-secondary-level model to explain magnetization and permanent magnetism in terms of the alignment of microscopic magnetic moments and relate this to the macroscopic field effect.',
    finalDescriptionDe:
      'Die lernende Person kann in einem oberstufengerechten Modell erklären, wie die Vorzugsorientierung mikroskopischer magnetischer Momente Magnetisierung und eine makroskopische Feldwirkung hervorruft und wie eine bleibende Vorzugsorientierung dieser Momente Permanentmagnetismus erklärt.',
    finalDescriptionEn:
      'The learner can use an upper-secondary-level model to explain how the preferential alignment of microscopic magnetic moments produces magnetization and a macroscopic field effect, and how a persistent preferential alignment of these moments accounts for permanent magnetism.',
    requires: ['0f6b798b-594e-5480-8c5f-95e2486a4d85'],
    provider: 'Google Gemini / Nano Banana Pro',
    imageSha256: '64e96cc02a9b2392673f8b6e7b4ef776cf167dcef795c56be5bbfb57e7d1321b',
    imageBytes: 2115950,
    prompts: [
      {
        fileName: 'prompt.de.md',
        beforeSha256: '1c0dd48456dae451c5c0fdaff5363177ea2fe9310f19be457fa667170582a0c3',
        afterSha256: '54f0781ba1675e527ae575151eab2425c39e58b1c257690e96563511ee64d288',
        headingBindings: 1,
        titleBindings: 2,
        descriptionBindings: 2,
      },
    ],
    beforeSemanticKindFingerprint:
      'sha256:d41e505faf06e75023d2cf82136fcc6d8ebf11d2b1f701851cd19a5d5c3f5845',
    beforeAtomicityFingerprint:
      'sha256:f7d19a7d6943b690b2a4ced2ac1f98134938765354c980d1bb64b8d0d2685ce8',
    beforeMemoryFingerprint:
      'sha256:6a782138ecb194388d0eb23a2e186a753b42061c8da33da9920075008983a78c',
    atomicityReason:
      'Mikroskopische Vorzugsorientierung, daraus entstehende Magnetisierung und makroskopische Feldwirkung sowie deren Persistenz beim Permanentmagneten sind aufeinander bezogene Schritte eines einzigen Erklärmodells, nicht unabhängige Routinen.',
    memoryStatus: 'no_memory_needed',
    memoryReason:
      'Die Kompetenz verlangt, veränderliche und bleibende Vorzugsorientierung mikroskopischer Momente kausal mit Magnetisierung, Feldwirkung und Permanentmagnetismus zu verknüpfen; ein eigenes Memory-Deck würde diese Modellbildung nicht tragen.',
    approvals: {
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      humanIssueDescription: '',
      humanReviewedAt: null,
      humanReviewer: '',
      aiApproved: 'yes',
    },
  },
  '9854589c-5feb-4942-b90f-311ddf36eb78': {
    subject: 'physik',
    landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
    titleDe: 'Geladene Teilchen in homogenen magnetischen Feldern untersuchen',
    titleEn: 'Investigate Charged Particles in Homogeneous Magnetic Fields',
    beforeDescriptionDe:
      'Die lernende Person kann vorgegebene oder simulierte Bahnen geladener Teilchen in homogenen Magnetfeldern mithilfe der Lorentzkraft vergleichen und aus Krümmung und Umlaufsinn qualitative Aussagen über Ladungsvorzeichen sowie über Änderungen von Masse, Geschwindigkeit oder Feldstärke ableiten.',
    beforeDescriptionEn:
      'The learner can compare given or simulated trajectories of charged particles in uniform magnetic fields using the Lorentz force and infer qualitative effects of charge sign and changes in mass, speed, or field strength from curvature and direction of motion.',
    finalDescriptionDe:
      'Die lernende Person kann vorgegebene oder simulierte Bahnen geladener Teilchen in homogenen Magnetfeldern mithilfe der Lorentzkraft vergleichen, aus Feldrichtung und Umlaufsinn das Ladungsvorzeichen erschließen und für Bewegungen senkrecht zur Feldrichtung unter sonst gleichen Bedingungen aus Krümmungsvergleichen qualitative Auswirkungen von Änderungen der Masse, Geschwindigkeit oder Feldstärke ableiten.',
    finalDescriptionEn:
      'The learner can compare given or simulated trajectories of charged particles in uniform magnetic fields using the Lorentz force, infer the sign of the charge from the field direction and direction of circulation, and, for motion perpendicular to the field under otherwise identical conditions, infer from comparisons of curvature the qualitative effects of changes in mass, speed, or field strength.',
    requires: [fixed985Prerequisite],
    provider: 'Google Gemini / Nano Banana Pro',
    imageSha256: '99780a61878c7cb50a251ed9de02c35b11a856b5b0ad2436923f85120bd0ccaf',
    imageBytes: 2130704,
    prompts: [
      {
        fileName: 'prompt.de.md',
        beforeSha256: '52657219034b3d573f5946de06a9bc9cdca855e8f35786b6447a5cb9e73e9095',
        afterSha256: '033619b0c73e8e7f58d9a7c0ff68723cb7c9c9ab24a0fce9aaa6a33cb49d37be',
        headingBindings: 1,
        titleBindings: 2,
        descriptionBindings: 2,
      },
      {
        fileName: 'image-reconstruction-prompt.de.md',
        beforeSha256: 'dd38f6f9796d6632dec41eb9eb32d6cfa574c74a42a2153a81d521c13416753d',
        afterSha256: '312bed9b73bcd5990cc3ce0ea6ab07b5d390b27461b9a4894c34ed9aaa9f3b9f',
        headingBindings: 1,
        titleBindings: 1,
        descriptionBindings: 1,
      },
    ],
    beforeSemanticKindFingerprint:
      'sha256:13e419bf40986d2af2f24aa7d844cdcdc26fa74b76ce093be766fc80711bb436',
    beforeAtomicityFingerprint:
      'sha256:87775b5c1ac5e6de3c22936d546eb43e96da90ba0932c1e09eb1a8e2e178662b',
    beforeMemoryFingerprint:
      'sha256:3691895a1e05a4003237ec47d7d49b1da21cf920764adb7eac99c801cae3f9bf',
    atomicityReason:
      'Vorzeicheninferenz aus Feldrichtung und Umlaufsinn sowie kontrollierte Krümmungsvergleiche bei senkrechter Bewegung sind zusammengehörige Auswertungen desselben Lorentzkraft-Kreisbahnmodells; die variierten Größen sind Vergleichsfälle, keine eigenständigen Lernziele.',
    memoryStatus: 'memory_required',
    memoryReason:
      'Die kompakte Lorentzkraft- und Kreisbahnbeziehung bleibt als Memory-Grundlage erforderlich; Ladungsvorzeichen und qualitative Parameterwirkungen müssen jedoch unter den ausdrücklich kontrollierten Bedingungen aus neuen Bahnen erschlossen werden.',
    memoryGoalIds: ['69f0038a-6e2b-55b5-8ff0-d2ea8852e793'],
    deckIds: ['de_gymnasium_physics_fields_q1'],
    approvals: {
      umlautsCorrectChatGpt: 'no',
      contentApprovedChatGpt: 'no',
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      humanIssueDescription: '',
      humanReviewedAt: null,
      humanReviewer: '',
      aiApproved: 'yes',
    },
  },
}

const expectedGoalIds = [
  '0a154cbd-1218-4553-835c-a754e9901bba',
  '0924162b-46d0-5c56-93bc-33e1f5ac6886',
  '9854589c-5feb-4942-b90f-311ddf36eb78',
].sort()

function absolute(path: string): string {
  return resolve(repoRoot, path)
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function readJson(path: string): JsonRecord {
  return JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
}

function readJsonl(path: string): JsonRecord[] {
  return readFileSync(absolute(path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonRecord)
}

function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function serializeJsonl(records: JsonRecord[]): string {
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
}

function sha256Hex(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex')
}

function digest(value: string | Uint8Array): string {
  return `sha256:${sha256Hex(value)}`
}

function normalizeText(value: unknown): string {
  return String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

function reviewFingerprint(goal: JsonRecord, ruleVersion: string): string {
  return digest(stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText(goal.titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText(goal.descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText(goal.nodeKind),
  }))
}

function visualizationDirectory(subject: Subject, goalId: string): string {
  return `curricula/DE/Gymnasium/visualizations/${subject}/${goalId}`
}

function imagePaths(subject: Subject, goalId: string): string[] {
  const suffix = `assets/goal-visualizations/${subject}/${goalId}/${goalId}.jpg`
  return [
    `${visualizationDirectory(subject, goalId)}/${goalId}.jpg`,
    `app/public/${suffix}`,
    `backend/src/main/resources/static/${suffix}`,
  ]
}

function updatePromptBinding(
  bytes: string,
  goalId: string,
  revision: Revision,
  binding: PromptBinding,
): string {
  assert(
    bytes.includes(`SkillPilot-ID: \`${goalId}\``),
    `${goalId}/${binding.fileName}: prompt is not ID-bound`,
  )
  let headingBindings = 0
  let titleBindings = 0
  let descriptionBindings = 0
  const updated = bytes.split(/\r?\n/u).map((line) => {
    if (/^# (?:Lernzielvisualisierung|Bildrekonstruktionsprompt): /u.test(line)) {
      headingBindings += 1
      return line.replace(/: .*$/u, `: ${revision.titleDe}`)
    }
    if (/^- Titel: /u.test(line) || /^Titel: /u.test(line)) {
      titleBindings += 1
      return `${line.startsWith('- ') ? '- ' : ''}Titel: ${revision.titleDe}`
    }
    if (/^- Beschreibung: /u.test(line) || /^Beschreibung: /u.test(line)) {
      descriptionBindings += 1
      return `${line.startsWith('- ') ? '- ' : ''}Beschreibung: ${revision.finalDescriptionDe}`
    }
    return line
  }).join('\n')

  assert(
    headingBindings === binding.headingBindings
      && titleBindings === binding.titleBindings
      && descriptionBindings === binding.descriptionBindings,
    `${goalId}/${binding.fileName}: prompt binding count drifted`,
  )
  assert(
    sha256Hex(updated) === binding.afterSha256,
    `${goalId}/${binding.fileName}: planned prompt bytes do not match the bound final hash`,
  )
  return updated
}

assert(
  same(Object.keys(revisions).sort(), expectedGoalIds),
  'Revision scope must contain exactly the three adjudicated goals',
)
assert(
  same(revisions['9854589c-5feb-4942-b90f-311ddf36eb78'].requires, [fixed985Prerequisite]),
  '9854589c-5feb-4942-b90f-311ddf36eb78: fixed prerequisite declaration drifted',
)

const protectedImages = new Map<string, { sha256: string; bytes: number }>()
for (const [goalId, revision] of Object.entries(revisions)) {
  for (const path of imagePaths(revision.subject, goalId)) {
    protectedImages.set(path, {
      sha256: revision.imageSha256,
      bytes: revision.imageBytes,
    })
  }
}
assert(protectedImages.size === 9, 'Expected exactly nine protected image copies')
for (const [path, expected] of protectedImages) {
  assert(existsSync(absolute(path)), `Missing protected image: ${path}`)
  const bytes = readFileSync(absolute(path))
  assert(bytes.length === expected.bytes, `Protected image size drifted: ${path}`)
  assert(sha256Hex(bytes) === expected.sha256, `Protected image hash drifted: ${path}`)
}

const outputs = new Map<string, string>()
const beforeGoals = new Map<string, JsonRecord>()
const finalGoals = new Map<string, JsonRecord>()

for (const subject of ['mathematik', 'physik'] as const) {
  const config = subjectConfigs[subject]
  assert(config.landscapeId === revisions[config.goalIds[0]].landscapeId, `${subject}: landscape binding drifted`)
  const canonical = readJson(config.canonical)
  assert(canonical.landscapeId === config.landscapeId, `${subject}: unexpected canonical landscape`)
  const goals = canonical.goals as JsonRecord[]

  for (const goalId of config.goalIds) {
    const revision = revisions[goalId]
    assert(revision.subject === subject, `${goalId}: subject binding drifted`)
    const matches = goals.filter((candidate) => candidate.id === goalId)
    assert(matches.length === 1, `${goalId}: expected exactly one canonical goal`)
    const goal = matches[0]
    const beforeText = same(
      [goal.description, goal.descriptionEn],
      [revision.beforeDescriptionDe, revision.beforeDescriptionEn],
    )
    const finalText = same(
      [goal.description, goal.descriptionEn],
      [revision.finalDescriptionDe, revision.finalDescriptionEn],
    )
    assert(beforeText || finalText, `${goalId}: bilingual description left the bounded states`)
    assert(
      goal.title === revision.titleDe
        && goal.titleEn === revision.titleEn
        && goal.type === 'atomic'
        && same(goal.contains, [])
        && same(goal.requires, revision.requires),
      `${goalId}: identity, atomic structure, or prerequisite list drifted`,
    )

    const links = ((goal.resourceLinks as JsonRecord[] | undefined) ?? [])
      .filter((link) => link.type === 'goal-visualization')
    assert(links.length === 1, `${goalId}: expected exactly one visualization link`)
    const link = links[0]
    const beforeAltText =
      `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.beforeDescriptionDe}`
    const finalAltText =
      `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.finalDescriptionDe}`
    const assetUrl = `/assets/goal-visualizations/${subject}/${goalId}/${goalId}.jpg`
    assert(
      link.resourceType === 'image'
        && link.role === 'primary'
        && link.skillpilotId === goalId
        && link.title === `Visualisierung: ${revision.titleDe}`
        && link.url === assetUrl
        && link.provider === revision.provider
        && link.description === `Visualisierung zum Lernziel: ${revision.titleDe}.`
        && (link.altText === beforeAltText || link.altText === finalAltText)
        && link.lang === 'de'
        && link.license === 'AI-generated, SkillPilot-curated'
        && link.reviewStatus === 'pilot',
      `${goalId}: visualization resource binding drifted`,
    )

    const beforeGoal = clone(goal)
    beforeGoal.description = revision.beforeDescriptionDe
    beforeGoal.descriptionEn = revision.beforeDescriptionEn
    const beforeLink = (beforeGoal.resourceLinks as JsonRecord[])
      .find((candidate) => candidate.type === 'goal-visualization')
    assert(beforeLink, `${goalId}: missing cloned visualization link`)
    beforeLink.altText = beforeAltText

    goal.description = revision.finalDescriptionDe
    goal.descriptionEn = revision.finalDescriptionEn
    goal.requires = [...revision.requires]
    link.altText = finalAltText
    assert(same(goal.requires, revision.requires), `${goalId}: planned prerequisites drifted`)
    if (goalId === '9854589c-5feb-4942-b90f-311ddf36eb78') {
      assert(
        same(goal.requires, [fixed985Prerequisite]),
        `${goalId}: prerequisite must remain exactly ${fixed985Prerequisite}`,
      )
    }

    beforeGoals.set(goalId, beforeGoal)
    finalGoals.set(goalId, clone(goal))
  }
  outputs.set(config.canonical, serializeJson(canonical))
}

for (const subject of ['mathematik', 'physik'] as const) {
  const config = subjectConfigs[subject]
  const semanticKinds = readJson(config.semanticKinds)
  for (const goalId of config.goalIds) {
    const revision = revisions[goalId]
    const records = (semanticKinds.decisions as JsonRecord[])
      .filter((candidate) => candidate.goalId === goalId)
    assert(records.length === 1, `${goalId}: expected one semantic-kind decision`)
    const record = records[0]
    assert(
      record.semanticKind === 'curricularAtomic'
        && record.decisionStatus === 'authoritative'
        && record.decisionBasis === 'reviewed-current-pilot-curricular-atomic',
      `${goalId}: authoritative curricularAtomic decision drifted`,
    )
    const beforeFingerprint = fingerprintSemanticKindSourceGoal(beforeGoals.get(goalId)!)
    const finalFingerprint = fingerprintSemanticKindSourceGoal(finalGoals.get(goalId)!)
    assert(
      beforeFingerprint === revision.beforeSemanticKindFingerprint,
      `${goalId}: semantic-kind fingerprint algorithm or bound before-state drifted`,
    )
    assert(
      record.sourceFingerprint === beforeFingerprint
        || record.sourceFingerprint === finalFingerprint,
      `${goalId}: semantic-kind source fingerprint left the bounded states`,
    )
    record.sourceFingerprint = finalFingerprint
  }
  outputs.set(config.semanticKinds, serializeJson(semanticKinds))
}

for (const subject of ['mathematik', 'physik'] as const) {
  const config = subjectConfigs[subject]
  const atomicity = readJsonl(config.atomicity)
  const memory = readJsonl(config.memory)

  for (const goalId of config.goalIds) {
    const revision = revisions[goalId]
    const beforeGoal = beforeGoals.get(goalId)!
    const finalGoal = finalGoals.get(goalId)!

    const atomicityRecords = atomicity.filter((candidate) => candidate.goalId === goalId)
    assert(atomicityRecords.length === 1, `${goalId}: expected one atomicity record`)
    const atomicityRecord = atomicityRecords[0]
    assert(
      atomicityRecord.schemaVersion === 1
        && atomicityRecord.reviewId === config.reviewId
        && atomicityRecord.ruleVersion === 'semantic-atomicity-v1'
        && atomicityRecord.landscapeId === config.landscapeId
        && atomicityRecord.status === 'atomic'
        && atomicityRecord.semanticAtomic === true
        && same(atomicityRecord.suggestedSplit, []),
      `${goalId}: semantic-atomicity decision drifted`,
    )
    const beforeAtomicity = reviewFingerprint(beforeGoal, atomicityRecord.ruleVersion)
    const finalAtomicity = reviewFingerprint(finalGoal, atomicityRecord.ruleVersion)
    assert(
      beforeAtomicity === revision.beforeAtomicityFingerprint,
      `${goalId}: atomicity fingerprint algorithm or bound before-state drifted`,
    )
    assert(
      atomicityRecord.fingerprint === beforeAtomicity
        || atomicityRecord.fingerprint === finalAtomicity,
      `${goalId}: atomicity fingerprint left the bounded states`,
    )
    Object.assign(atomicityRecord, {
      fingerprint: finalAtomicity,
      status: 'atomic',
      semanticAtomic: true,
      reviewedAt,
      reviewer,
      reason: revision.atomicityReason,
      suggestedSplit: [],
    })

    const memoryRecords = memory.filter((candidate) => candidate.goalId === goalId)
    assert(memoryRecords.length === 1, `${goalId}: expected one memory-review record`)
    const memoryRecord = memoryRecords[0]
    assert(
      memoryRecord.schemaVersion === 1
        && memoryRecord.reviewId === config.reviewId
        && memoryRecord.ruleVersion === 'memory-card-review-v1'
        && memoryRecord.landscapeId === config.landscapeId
        && memoryRecord.status === revision.memoryStatus
        && memoryRecord.memoryUseful === (revision.memoryStatus === 'memory_required'),
      `${goalId}: memory-review decision drifted`,
    )
    if (revision.memoryStatus === 'memory_required') {
      assert(
        same(memoryRecord.memoryGoalIds, revision.memoryGoalIds)
          && same(memoryRecord.deckIds, revision.deckIds),
        `${goalId}: required memory trace drifted`,
      )
    } else {
      assert(
        (!memoryRecord.memoryGoalIds || same(memoryRecord.memoryGoalIds, []))
          && (!memoryRecord.deckIds || same(memoryRecord.deckIds, [])),
        `${goalId}: unexpected memory trace for no-memory decision`,
      )
    }
    const beforeMemory = reviewFingerprint(beforeGoal, memoryRecord.ruleVersion)
    const finalMemory = reviewFingerprint(finalGoal, memoryRecord.ruleVersion)
    assert(
      beforeMemory === revision.beforeMemoryFingerprint,
      `${goalId}: memory fingerprint algorithm or bound before-state drifted`,
    )
    assert(
      memoryRecord.fingerprint === beforeMemory || memoryRecord.fingerprint === finalMemory,
      `${goalId}: memory fingerprint left the bounded states`,
    )
    Object.assign(memoryRecord, {
      fingerprint: finalMemory,
      status: revision.memoryStatus,
      memoryUseful: revision.memoryStatus === 'memory_required',
      reviewedAt,
      reviewer,
      reason: revision.memoryReason,
    })
  }
  outputs.set(config.atomicity, serializeJsonl(atomicity))
  outputs.set(config.memory, serializeJsonl(memory))
}

for (const subject of ['mathematik', 'physik'] as const) {
  const config = subjectConfigs[subject]
  const visualQa = readJson(config.visualQa)
  assert(
    visualQa.schemaVersion === 1 && visualQa.subject === subject,
    `${subject}: unexpected visualization-QA ledger`,
  )
  for (const goalId of config.goalIds) {
    const revision = revisions[goalId]
    const records = (visualQa.records as JsonRecord[])
      .filter((candidate) => candidate.goalId === goalId)
    assert(records.length === 1, `${goalId}: expected one visualization-QA record`)
    const record = records[0]
    const retainedRecord = clone(record)
    const assetUrl = `/assets/goal-visualizations/${subject}/${goalId}/${goalId}.jpg`
    const canonicalImage = imagePaths(subject, goalId)[0]
    const publicImage = imagePaths(subject, goalId)[1]
    assert(
      record.title === revision.titleDe
        && (record.description === revision.beforeDescriptionDe
          || record.description === revision.finalDescriptionDe)
        && record.subject === subject
        && record.landscapeId === config.landscapeId
        && record.landscapePath === config.canonical
        && record.visualizationState === 'available'
        && record.missingReason === ''
        && record.imageUrl === assetUrl
        && record.publicAssetPath === publicImage
        && record.canonicalAssetPath === canonicalImage
        && record.assetSha256 === `sha256:${revision.imageSha256}`
        && record.umlautsCorrectChatGpt === revision.approvals.umlautsCorrectChatGpt
        && record.contentApprovedChatGpt === revision.approvals.contentApprovedChatGpt
        && record.humanApproved === revision.approvals.humanApproved
        && record.humanIssueIdentified === revision.approvals.humanIssueIdentified
        && record.humanIssueDescription === revision.approvals.humanIssueDescription
        && record.humanReviewedAt === revision.approvals.humanReviewedAt
        && record.humanReviewer === revision.approvals.humanReviewer
        && record.aiApproved === revision.approvals.aiApproved
        && record.aiApprovedAssetSha256 === `sha256:${revision.imageSha256}`,
      `${goalId}: visualization-QA identity, digest, or approval state drifted`,
    )
    record.description = revision.finalDescriptionDe
    const restoredForComparison = clone(record)
    restoredForComparison.description = retainedRecord.description
    assert(
      same(restoredForComparison, retainedRecord),
      `${goalId}: planned visualization-QA update changed more than the description`,
    )
  }
  outputs.set(config.visualQa, serializeJson(visualQa))
}

for (const [goalId, revision] of Object.entries(revisions)) {
  const directory = visualizationDirectory(revision.subject, goalId)
  const promptFileNames = readdirSync(absolute(directory))
    .filter((name) => name.endsWith('prompt.de.md'))
    .sort()
  const expectedPromptFileNames = revision.prompts.map((binding) => binding.fileName).sort()
  assert(
    same(promptFileNames, expectedPromptFileNames),
    `${goalId}: prompt/reconstruction file set drifted`,
  )
  for (const binding of revision.prompts) {
    const path = `${directory}/${binding.fileName}`
    const currentBytes = readFileSync(absolute(path), 'utf8')
    const currentHash = sha256Hex(currentBytes)
    assert(
      currentHash === binding.beforeSha256 || currentHash === binding.afterSha256,
      `${goalId}/${binding.fileName}: prompt bytes left the bounded states`,
    )
    outputs.set(path, updatePromptBinding(currentBytes, goalId, revision, binding))
  }
}

const expectedOutputPaths = [
  ...Object.values(subjectConfigs).flatMap((config) => [
    config.canonical,
    config.semanticKinds,
    config.atomicity,
    config.memory,
    config.visualQa,
  ]),
  ...Object.entries(revisions).flatMap(([goalId, revision]) =>
    revision.prompts.map((binding) =>
      `${visualizationDirectory(revision.subject, goalId)}/${binding.fileName}`)),
].sort()
assert(expectedOutputPaths.length === 15, 'Expected exactly fifteen adjudication output files')
assert(
  same([...outputs.keys()].sort(), expectedOutputPaths),
  'Planned adjudication output scope drifted',
)
for (const path of outputs.keys()) {
  assert(!protectedImages.has(path), `Protected image unexpectedly entered output scope: ${path}`)
}

for (const [path, bytes] of outputs) {
  if (writeMode) {
    writeFileSync(absolute(path), bytes)
  } else {
    assert(
      readFileSync(absolute(path), 'utf8') === bytes,
      `Second adjudication drift in ${path}; run with --write after authorization`,
    )
  }
}

if (writeMode) {
  for (const [path, bytes] of outputs) {
    assert(readFileSync(absolute(path), 'utf8') === bytes, `Write verification failed: ${path}`)
  }
  for (const [path, expected] of protectedImages) {
    const bytes = readFileSync(absolute(path))
    assert(bytes.length === expected.bytes, `Protected image size changed after write: ${path}`)
    assert(sha256Hex(bytes) === expected.sha256, `Protected image hash changed after write: ${path}`)
  }
}

console.log(
  `CHECK apply_math_physics_b028r_b030r_second_adjudication ${writeMode ? 'WRITE' : 'PASS'} goals=${expectedGoalIds.length} files=${outputs.size} protectedImages=${protectedImages.size}`,
)
