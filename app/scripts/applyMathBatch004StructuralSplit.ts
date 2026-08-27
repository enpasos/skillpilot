import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewDate = '2026-08-27'
const reviewer = 'codex-math-batch004-structural-split'
const visualizationReviewedAt = '2026-08-27T05:25:00Z'
const visualizationReviewer = 'codex-nano-banana-policy-rework-2026-08-27'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atlasSources: 'app/scripts/config/goal-books/de-gym-math-national-atlas.sources.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  durationPolicy: 'app/scripts/config/math-duration-split-spanning-tree-policy.json',
  durationGenerator: 'app/scripts/generateMathDurationCompositionViews.ts',
  applyScript: 'app/scripts/applyMathBatch004StructuralSplit.ts',
  adjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/'
    + 'canonical-math-058bf6de-structural-split-2026-08-27.adjudication.json',
  receipt:
    'curricula/DE/Gymnasium/quality/goal-description-review/'
    + 'canonical-math-058bf6de-structural-split-2026-08-27.receipt.json',
  receiptSchema:
    'curricula/DE/Gymnasium/quality/goal-description-review/'
    + 'canonical-math-058bf6de-structural-split.receipt.schema.json',
  receiptValidator:
    'curricula/DE/Gymnasium/quality/goal-description-review/'
    + 'validate-canonical-math-058bf6de-structural-split.mjs',
} as const

const ids = {
  retainedCluster: '058bf6de-6c0e-4298-b054-9e8dff6e6a66',
  reusedLinear: '325771e1-602d-4bca-a199-a8f39a2d3dee',
  ratio: '671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6',
  solvability: 'cc60f759-1168-5fc0-8ff5-5f7a2533e61c',
  proportionFoundation: '2c4830e6-a8d5-48d0-9202-3b7d18a419c2',
  year7Anchor: '5a7095a2-2b3a-48bf-9536-eca79ee5ff8c',
  year8Extension: 'fa0b6b69-ce54-4711-90e6-26f27249cd71',
  linearSystemsMultiplicity: 'e42c208d-9555-43cc-92f5-5bb4c0688726',
  canonicalLandscape: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
} as const

const splitChildIds = [ids.reusedLinear, ids.ratio, ids.solvability]
const newChildIds = [ids.ratio, ids.solvability]
const splitStructureId = `split-b004-${ids.retainedCluster}`
const splitStructureLabel = 'Verhältnisgleichungen und Lösbarkeit linearer Gleichungen'

type ChildSpec = {
  id: string
  shortKey: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  topicCode: string
  requires: string[]
  assetSha256: string
  assetAltText: string
  qaNotes: string
  atomicityReason: string
  memoryReason: string
}

const childSpecs: ChildSpec[] = [
  {
    id: ids.ratio,
    shortKey: 'canonical_math_sek1_j7_solve_check_ratio_equations',
    title: 'Verhältnisgleichungen lösen und prüfen',
    titleEn: 'Solve and check ratio equations',
    description:
      'Die lernende Person kann Verhältnisgleichungen durch begründete Äquivalenzumformungen lösen, dabei notwendige Definitionsbedingungen beachten und gefundene Lösungen durch Einsetzen in die Ausgangsgleichung prüfen.',
    descriptionEn:
      'The learner can solve ratio equations using justified equivalent transformations, observe any necessary domain restrictions, and check the solutions found by substituting them into the original equation.',
    topicCode: 'CANONICAL.MATH.SEK1.J7.RATIO_EQUATIONS.SOLVE_CHECK',
    requires: [ids.reusedLinear, ids.proportionFoundation],
    assetSha256: 'sha256:520caae51b4878fc6aab3a5b9000edc17fdad134cc4aa4162f5882410a98e97f',
    assetAltText:
      'Eine begründete Äquivalenzkette löst die Verhältnisgleichung (x + 1)/(x − 2) = 2/3 unter der Definitionsbedingung x ≠ 2 bis x = −7 und bestätigt die Lösung durch Einsetzen in die Ausgangsgleichung.',
    qaNotes:
      'Hashgebundene Sichtprüfung des Nano-Banana-JPG in Originalauflösung: Die Verhältnisgleichung (x+1)/(x−2)=2/3 wird unter der vorher genannten Definitionsbedingung x≠2 über korrekte Äquivalenzschritte zu x=−7 gelöst. Die Probe setzt −7 in die Ausgangsgleichung ein und ergibt links und rechts 2/3. Die verworfene pauschale Formulierung „gilt immer“ kommt nicht mehr vor.',
    atomicityReason:
      'Das begründete Lösen einer Verhältnisgleichung unter Beachtung der Definitionsbedingungen und die Probe an derselben Ausgangsgleichung bilden eine zusammenhängende, eigenständig prüfbare Kompetenz.',
    memoryReason:
      'Die Kompetenz entsteht durch Äquivalenzumformungen, Definitionskontrolle und Probe; ein separates Memory-Deck würde das erforderliche Verständnis nicht sinnvoll ersetzen.',
  },
  {
    id: ids.solvability,
    shortKey: 'canonical_math_sek1_j7_linear_equations_solvability_multiplicity',
    title: 'Lösbarkeit und Lösungsvielfalt linearer Gleichungen untersuchen',
    titleEn: 'Investigate solvability and solution multiplicity of linear equations',
    description:
      'Die lernende Person kann lineare Gleichungen durch äquivalente Umformungen auf 0 = 0, auf 0 = c mit c ≠ 0 oder auf x = a zurückführen, daraus jeweils unendlich viele, keine oder genau eine Lösung folgern und die Lösungsmenge begründen.',
    descriptionEn:
      'The learner can transform linear equations equivalently into 0 = 0, 0 = c with c ≠ 0, or x = a; infer respectively infinitely many solutions, no solution, or exactly one solution; and justify the solution set.',
    topicCode: 'CANONICAL.MATH.SEK1.J7.LINEAR_EQUATIONS.SOLVABILITY',
    requires: [ids.reusedLinear],
    assetSha256: 'sha256:682e00a3f38e373b614aca1b16f3f861a7b94005da4d973ab805bcb9962f747f',
    assetAltText:
      'Drei Äquivalenzketten führen lineare Gleichungen auf 0 = 0, den Widerspruch 0 = 3 beziehungsweise x = 6 zurück und ordnen ihnen die Lösungsmengen ℝ, ∅ und {6} zu.',
    qaNotes:
      'Hashgebundene Sichtprüfung des Nano-Banana-JPG in Originalauflösung: Drei korrekte Äquivalenzketten enden bei 0=0, 0=3 beziehungsweise x=6 und ordnen ihnen schlüssig L=ℝ, L=∅ und L={6} zu. Die Abschlusszeile verallgemeinert die drei Fälle korrekt; Text und mathematische Zeichen sind vollständig lesbar.',
    atomicityReason:
      'Das Zurückführen einer linearen Gleichung auf eine charakteristische Endform und das daraus begründete Klassifizieren ihrer Lösungsmenge sind eine zusammenhängende Untersuchungs-Kompetenz.',
    memoryReason:
      'Die Lösungsvielfalt muss aus äquivalenten Umformungen und Endformen begründet werden; isoliertes Auswendiglernen ist dafür nicht erforderlich.',
  },
]

const manualViewNames = ['de-by-gk.view.json', 'de-by-lk.view.json']
const generatedViewNames = [
  'de-he-gk-g8.view.json',
  'de-he-gk-g9.view.json',
  'de-he-lk-g8.view.json',
  'de-he-lk-g9.view.json',
  'de-he-seki-g8.view.json',
  'de-he-seki-g9.view.json',
  'de-sh-gk-g8.view.json',
  'de-sh-gk-g9.view.json',
  'de-sh-lk-g8.view.json',
  'de-sh-lk-g9.view.json',
  'de-sh-seki-g8.view.json',
  'de-sh-seki-g9.view.json',
]
const affectedViewNames = [...manualViewNames, ...generatedViewNames]
const compositionRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/mathematik')

const templateParentByFileName: Record<string, string> = {
  'de-he-seki-g8.view.json': 'j7-g8-kompetenzen',
  'de-he-seki-g9.view.json': 'j7-g9-kompetenzen',
  'de-sh-seki-g8.view.json': 'sh-jg7-9-g8-kompetenzen',
  'de-sh-seki-g9.view.json': 'sh-jg7-9-g9-kompetenzen',
}

const rationaleByRouteId: Record<string, string> = {
  'BB-reviewed-linear-and-ratio':
    'Die Quellenaussage nennt das Lösen linearer Gleichungen und von Verhältnisgleichungen ausdrücklich. Sie wird deshalb auf die beiden getrennten atomaren Ziele und den bereits vorhandenen fachlichen Gleichungscluster abgebildet; die Lösbarkeitsklassifikation ist hier nicht genannt.',
  'BE-reviewed-linear-and-ratio':
    'Die Quellenaussage nennt das Lösen linearer Gleichungen und von Verhältnisgleichungen ausdrücklich. Sie wird deshalb auf die beiden getrennten atomaren Ziele und den bereits vorhandenen fachlichen Gleichungscluster abgebildet; die Lösbarkeitsklassifikation ist hier nicht genannt.',
  'BW-reviewed-solvability':
    'Die Quelle fordert ausdrücklich, Lösbarkeit und Lösungsvielfalt zu untersuchen. Für lineare Gleichungen deckt dies das neue atomare Lösbarkeitsziel ab; die bereits vorhandenen Ziele für quadratische Gleichungen und lineare Gleichungssysteme bleiben erhalten.',
  'HE-KC-linear-solving':
    'Die Quelle fordert das Lösen linearer Gleichungen. Das vorhandene atomare Ziel zum systematischen Lösen und der fachliche Gleichungscluster decken dies ab; der frühere breite Sammelziel-Verweis war redundant.',
  'HE-KC-compare-linear-solving':
    'Der Vergleich von Lösungsverfahren für lineare Gleichungen wird durch das vorhandene atomare lineare Gleichungsziel und den fachlichen Gleichungscluster abgedeckt; Verhältnisgleichungen und Lösbarkeitsklassifikation werden nicht zusätzlich behauptet.',
  'HE-G9-simple-equations-without-equivalence-transformations':
    'Die Quelle grenzt Äquivalenzumformungen ausdrücklich aus. Die bereits zugeordneten elementaren Umkehroperationsziele bleiben passend; keines der aus dem breiten Sammelziel hervorgegangenen Atome wird zusätzlich zugeordnet.',
  'HE-G9-linear-equations-and-inequalities':
    'Die Quelle nennt lineare Gleichungen und Ungleichungen. Die vorhandenen atomaren Ziele für beide Bereiche und der fachliche Gleichungscluster bleiben; der breite Sammelziel-Verweis wird als redundant entfernt.',
  'HE-G9-solve-linear-equations-and-inequalities':
    'Die Quelle fordert das Lösen linearer Gleichungen und Ungleichungen. Die beiden bereits vorhandenen atomaren Ziele decken dies exakt genug ab; Verhältnisgleichungen und Lösbarkeitsklassifikation werden nicht zusätzlich behauptet.',
  'HE-G9-solution-set':
    'Die Quelle fordert die Lösungsmenge einschließlich der leeren Menge. Das neue atomare Ziel zur Lösbarkeit linearer Gleichungen und das bestehende Ungleichungsziel bilden diese fachlich getrennten Fälle ab.',
  'HE-G8-solution-set':
    'Die Quelle fordert die Lösungsmenge einschließlich der leeren Menge. Das neue atomare Ziel zur Lösbarkeit linearer Gleichungen und das bestehende Ungleichungsziel bilden diese fachlich getrennten Fälle ab.',
}

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const sha256 = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const sha256Digest = (bytes: string | Uint8Array): string => `sha256:${sha256(bytes)}`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  const serialized = JSON.stringify(value)
  return serialized === undefined ? 'null' : serialized
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const stringArray = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : []
const sameStringSet = (left: unknown, right: unknown): boolean => {
  const leftValues = [...new Set(stringArray(left))].sort()
  const rightValues = [...new Set(stringArray(right))].sort()
  return same(leftValues, rightValues)
}
const sourceId = (entry: JsonRecord): string => String(entry.legacyGoalId ?? entry.sourceGoalId ?? '')
const mappingTargetId = (entry: JsonRecord): string => String(entry.canonicalGoalId ?? '')

type VisualizationAssetPaths = {
  prompt: string
  canonicalImage: string
  publicImage: string
  backendImage: string
}

const visualizationAssetPaths = (spec: ChildSpec): VisualizationAssetPaths => {
  const relativeDirectory = `mathematik/${spec.id}`
  return {
    prompt: `curricula/DE/Gymnasium/visualizations/${relativeDirectory}/prompt.de.md`,
    canonicalImage: `curricula/DE/Gymnasium/visualizations/${relativeDirectory}/${spec.id}.jpg`,
    publicImage: `app/public/assets/goal-visualizations/${relativeDirectory}/${spec.id}.jpg`,
    backendImage: `backend/src/main/resources/static/assets/goal-visualizations/${relativeDirectory}/${spec.id}.jpg`,
  }
}

const resourceLink = (spec: ChildSpec): JsonRecord => ({
  type: 'goal-visualization',
  resourceType: 'image',
  role: 'primary',
  skillpilotId: spec.id,
  title: `Visualisierung: ${spec.title}`,
  url: `/assets/goal-visualizations/mathematik/${spec.id}/${spec.id}.jpg`,
  provider: 'Google Gemini / Nano Banana Pro',
  description: `Visualisierung zum Lernziel: ${spec.title}.`,
  altText: spec.assetAltText,
  lang: 'de',
  license: 'AI-generated, SkillPilot-curated',
  reviewStatus: 'pilot',
})

function validateVisualizationAssets(): void {
  for (const spec of childSpecs) {
    const assetPaths = visualizationAssetPaths(spec)
    const canonicalImage = readFileSync(absolute(assetPaths.canonicalImage))
    const publicImage = readFileSync(absolute(assetPaths.publicImage))
    const backendImage = readFileSync(absolute(assetPaths.backendImage))
    const prompt = readFileSync(absolute(assetPaths.prompt), 'utf8')
    const imageDigest = sha256Digest(canonicalImage)
    if (imageDigest !== spec.assetSha256) {
      throw new Error(`Visualization JPG hash drift for ${spec.id}: ${imageDigest}`)
    }
    if (!canonicalImage.equals(publicImage) || !canonicalImage.equals(backendImage)) {
      throw new Error(`Visualization JPG copies are not byte-identical for ${spec.id}`)
    }
    if (
      canonicalImage.length < 4
      || canonicalImage[0] !== 0xff
      || canonicalImage[1] !== 0xd8
      || canonicalImage.at(-2) !== 0xff
      || canonicalImage.at(-1) !== 0xd9
    ) throw new Error(`Visualization asset is not a complete JPEG for ${spec.id}`)
    if (
      !prompt.includes('Google Gemini / Nano Banana Pro')
      || !prompt.includes(`${spec.id}.jpg`)
    ) throw new Error(`Visualization prompt/provider binding drift for ${spec.id}`)
  }
}

const visualizationBindingPaths = childSpecs.flatMap((spec) =>
  Object.values(visualizationAssetPaths(spec)))

const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => {
  const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
  const dimensions = (goal.dimensionTags ?? {}) as JsonRecord
  return sha256Digest(stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalize(goal.title),
    titleEn: normalize(goal.titleEn),
    description: normalize(goal.description),
    descriptionEn: normalize(goal.descriptionEn),
    phase: normalize(dimensions.phase),
    area: normalize(dimensions.area),
    topicCode: normalize(dimensions.topicCode),
    nodeKind: normalize(goal.nodeKind),
  }))
}

const deterministicGoalId = (shortKey: string): string => {
  const value = createHash('sha1').update(`DE-GYM-CANONICAL-MATH:${shortKey}`).digest('hex')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20, 32)}`
}

function validateAdjudication(): JsonRecord {
  const adjudication = readJson(paths.adjudication)
  const payload = structuredClone(adjudication)
  delete payload.adjudicationDigest
  const actualDigest = sha256Digest(JSON.stringify(payload))
  if (adjudication.adjudicationDigest !== actualDigest) {
    throw new Error(`Adjudication digest drift: ${String(adjudication.adjudicationDigest)} != ${actualDigest}`)
  }
  if (
    adjudication.adjudicationId !== 'canonical-math-058bf6de-structural-split-2026-08-27-v1'
    || adjudication.status !== 'APPROVED_IMPLEMENTATION_INPUT'
  ) throw new Error('Unexpected structural-split adjudication identity or status')
  const routes = adjudication.sourceMappingRoutes as JsonRecord[]
  if (!Array.isArray(routes) || routes.length !== 11) throw new Error('Adjudication must contain 11 source routes')
  const physicalCount = routes.reduce(
    (sum, route) => sum + ((route.physicalOldOccurrences as unknown[] | undefined)?.length ?? 0),
    0,
  )
  if (physicalCount !== 21) throw new Error(`Adjudication binds ${physicalCount} physical occurrences, expected 21`)
  const completeness = adjudication.completeness as JsonRecord
  if (
    completeness.logicalSourceRouteCount !== 11
    || completeness.physicalOldOccurrenceCount !== 21
    || (completeness.openUncertainties as unknown[]).length !== 0
  ) throw new Error('Adjudication completeness block is inconsistent')
  for (const spec of childSpecs) {
    if (deterministicGoalId(spec.shortKey) !== spec.id) {
      throw new Error(`Deterministic ID mismatch for ${spec.shortKey}`)
    }
  }
  return adjudication
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  if (landscape.landscapeId !== ids.canonicalLandscape) throw new Error('Unexpected canonical landscape')
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [String(goal.id), goal]))
  if (byId.size !== goals.length) throw new Error('Canonical landscape contains duplicate goal IDs')
  const retained = byId.get(ids.retainedCluster)
  const reused = byId.get(ids.reusedLinear)
  if (!retained || !reused) throw new Error('Split parent or reused child is missing')
  const isBefore = retained.type === 'atomic' && stringArray(retained.contains).length === 0
  const isAfter = retained.type === 'cluster' && same(stringArray(retained.contains), splitChildIds)
  if (!isBefore && !isAfter) throw new Error('Retained ID is neither in the exact before nor exact after structural state')

  retained.description =
    'Cluster für die fachlich getrennten Kompetenzen zum systematischen Lösen und Prüfen linearer sowie Verhältnisgleichungen und zum Untersuchen der Lösbarkeit linearer Gleichungen.'
  retained.descriptionEn =
    'Cluster for the separate competencies of systematically solving and checking linear and ratio equations and investigating the solvability of linear equations.'
  retained.weight = 3
  retained.requires = []
  retained.contains = [...splitChildIds]
  retained.type = 'cluster'
  // Preserve the reviewed Nano Banana illustration as a cluster overview.
  // Structural atomicity work must not erase a good existing visual asset.
  retained.resourceLinks = [{
    type: 'goal-visualization',
    resourceType: 'image',
    role: 'primary',
    skillpilotId: ids.retainedCluster,
    title: 'Visualisierung: Lineare Gleichungen und Verhältnisgleichungen lösen, prüfen und Lösbarkeit beschreiben',
    url: `/assets/goal-visualizations/mathematik/${ids.retainedCluster}/${ids.retainedCluster}.jpg`,
    provider: 'Google Gemini / Nano Banana Pro',
    description: 'Visualisierung zum Lernziel: Lineare Gleichungen und Verhältnisgleichungen lösen, prüfen und Lösbarkeit beschreiben.',
    altText: 'Didaktische Visualisierung zum Lernziel "Lineare Gleichungen und Verhältnisgleichungen lösen, prüfen und Lösbarkeit beschreiben". Die lernende Person kann lineare Gleichungen und Verhältnisgleichungen mit verschiedenen Verfahren lösen, Lösungen durch Einsetzen prüfen und Fragen der Lösbarkeit und Lösungsvielfalt fachsprachlich beschreiben.',
    lang: 'de',
    license: 'AI-generated, SkillPilot-curated',
    reviewStatus: 'pilot',
  }]
  delete retained.semanticAtomic

  const baseDimensions = structuredClone(retained.dimensionTags as JsonRecord)
  const expectedChildren = childSpecs.map((spec): JsonRecord => ({
    id: spec.id,
    shortKey: spec.shortKey,
    title: spec.title,
    titleEn: spec.titleEn,
    description: spec.description,
    descriptionEn: spec.descriptionEn,
    core: retained.core,
    weight: 1,
    tags: structuredClone(retained.tags ?? []),
    dimensionTags: {
      ...structuredClone(baseDimensions),
      topicCode: spec.topicCode,
    },
    contains: [],
    requires: [...spec.requires],
    applicability: structuredClone(retained.applicability),
    sourceRef: 'RLP BE/BB Mathematik 1-10, L4 Gleichungen und Funktionen, Niveaustufe E, S. 58.',
    type: 'atomic',
    semanticAtomic: true,
    resourceLinks: [resourceLink(spec)],
  }))

  for (const expected of expectedChildren) {
    const existing = byId.get(String(expected.id))
    const beforeVisualization = { ...expected, resourceLinks: [] }
    const existingWithoutVisualization = existing ? { ...existing, resourceLinks: [] } : null
    if (existing && !same(existingWithoutVisualization, beforeVisualization)) {
      throw new Error(`Existing split child ${String(expected.id)} differs from the exact approved specification`)
    }
    if (existing) Object.assign(existing, expected)
    byId.set(String(expected.id), existing ?? expected)
  }

  for (const newId of newChildIds) {
    const index = goals.findIndex((goal) => goal.id === newId)
    if (index >= 0) goals.splice(index, 1)
  }
  const retainedIndex = goals.findIndex((goal) => goal.id === ids.retainedCluster)
  if (retainedIndex < 0) throw new Error('Retained cluster insertion point is missing')
  goals.splice(retainedIndex + 1, 0, ...expectedChildren.map((expected) => byId.get(String(expected.id))!))

  const year7 = byId.get(ids.year7Anchor)
  if (!year7) throw new Error('Year 7 anchor is missing')
  const year7Contains = stringArray(year7.contains)
  if (!year7Contains.includes(ids.retainedCluster)) throw new Error('Year 7 anchor no longer contains the retained split cluster')
  year7.contains = year7Contains.filter((goalId) => goalId !== ids.reusedLinear)

  const year8 = byId.get(ids.year8Extension)
  if (!year8) throw new Error('Year 8 extension goal is missing')
  const currentRequires = stringArray(year8.requires)
  const beforeRequires = currentRequires.includes(ids.retainedCluster)
    ? currentRequires.map((goalId) => goalId === ids.retainedCluster ? ids.ratio : goalId)
    : currentRequires
  if (!beforeRequires.includes(ids.ratio)) throw new Error('Year 8 extension lacks the adjudicated ratio prerequisite')
  year8.requires = [...new Set(beforeRequires)]

  const systemsMultiplicity = byId.get(ids.linearSystemsMultiplicity)
  if (!systemsMultiplicity) throw new Error('Linear-systems multiplicity goal is missing')
  const systemsRequires = stringArray(systemsMultiplicity.requires)
  if (systemsRequires.includes(ids.reusedLinear)) {
    systemsMultiplicity.requires = systemsRequires.map(
      (goalId) => goalId === ids.reusedLinear ? ids.solvability : goalId,
    )
  } else if (!systemsRequires.includes(ids.solvability)) {
    throw new Error('Linear-systems multiplicity goal is neither in the reviewed before nor after route state')
  }

  for (const goal of goals) {
    if (stringArray(goal.requires).includes(ids.retainedCluster)) {
      throw new Error(`Unadjudicated canonical requires reference ${String(goal.id)} -> ${ids.retainedCluster}`)
    }
    const examData = goal.examData as JsonRecord | undefined
    if (stringArray(examData?.coveredGoalIds).includes(ids.retainedCluster)) {
      throw new Error(`Unadjudicated coveredGoalIds reference ${String(goal.id)} -> ${ids.retainedCluster}`)
    }
  }

  const parentIdsByChild = new Map<string, string[]>()
  for (const goal of goals) {
    for (const childId of stringArray(goal.contains)) {
      if (!byId.has(childId)) throw new Error(`Missing contains target ${String(goal.id)} -> ${childId}`)
      parentIdsByChild.set(childId, [...(parentIdsByChild.get(childId) ?? []), String(goal.id)])
    }
  }
  const affected = new Set<string>([ids.retainedCluster])
  const queue = [...(parentIdsByChild.get(ids.retainedCluster) ?? [])]
  while (queue.length > 0) {
    const goalId = queue.shift()!
    if (affected.has(goalId)) continue
    affected.add(goalId)
    queue.push(...(parentIdsByChild.get(goalId) ?? []))
  }
  const atomicDescendants = (rootId: string): Set<string> => {
    const result = new Set<string>()
    const visiting = new Set<string>()
    const visit = (goalId: string): void => {
      if (visiting.has(goalId)) throw new Error(`Contains cycle while weighing ${rootId}: ${goalId}`)
      const goal = byId.get(goalId)
      if (!goal) throw new Error(`Missing goal ${goalId} while weighing ${rootId}`)
      const children = stringArray(goal.contains)
      if (children.length === 0) {
        result.add(goalId)
        return
      }
      visiting.add(goalId)
      children.forEach(visit)
      visiting.delete(goalId)
    }
    visit(rootId)
    return result
  }
  for (const goalId of affected) byId.get(goalId)!.weight = atomicDescendants(goalId).size

  landscape.goals = goals
  return landscape
}

function buildMappingDocuments(adjudication: JsonRecord): Map<string, JsonRecord> {
  const routes = adjudication.sourceMappingRoutes as JsonRecord[]
  const routePaths = [...new Set(routes.map((route) => String(route.path)))]
  const result = new Map(routePaths.map((path) => [path, readJson(path)]))

  for (const route of routes) {
    const path = String(route.path)
    const sourceGoalId = String(route.sourceGoalId)
    const beforeTargets = stringArray(route.beforeCanonicalGoalIds)
    const afterTargets = stringArray(route.afterCanonicalGoalIds)
    const document = result.get(path)!
    const mappings = document.mappings as JsonRecord[]
    const currentEntries = mappings.filter((entry) => sourceId(entry) === sourceGoalId)
    const currentTargets = currentEntries.map(mappingTargetId)
    if (!sameStringSet(currentTargets, beforeTargets) && !sameStringSet(currentTargets, afterTargets)) {
      throw new Error(`${String(route.routeId)} mapping targets are neither in the reviewed before nor after state`)
    }

    if (String(route.classification) !== 'retain_exact_aggregate_cluster_mapping') {
      const oldEntryIndex = mappings.findIndex(
        (entry) => sourceId(entry) === sourceGoalId && mappingTargetId(entry) === ids.retainedCluster,
      )
      if (oldEntryIndex >= 0) {
        const oldEntry = mappings[oldEntryIndex]
        const existingAfterTargets = new Set(
          currentEntries
            .map(mappingTargetId)
            .filter((goalId) => goalId !== ids.retainedCluster),
        )
        const additions = afterTargets
          .filter((goalId) => !existingAfterTargets.has(goalId))
          .map((goalId): JsonRecord => ({
            ...structuredClone(oldEntry),
            canonicalGoalId: goalId,
            matchType: 'partial',
          }))
        mappings.splice(oldEntryIndex, 1, ...additions)
      }

      const decisions = document.decisions as JsonRecord[]
      if (!Array.isArray(decisions)) throw new Error(`${path} lacks reviewed decisions[]`)
      const decision = decisions.find((entry) => entry.sourceGoalId === sourceGoalId)
      if (!decision) throw new Error(`${String(route.routeId)} review decision is missing`)
      const decisionTargets = stringArray(decision.canonicalGoalIds)
      if (!same(decisionTargets, beforeTargets) && !same(decisionTargets, afterTargets)) {
        throw new Error(`${String(route.routeId)} decision targets are neither in the exact before nor after state`)
      }
      decision.canonicalGoalIds = [...afterTargets]
      decision.rationale = rationaleByRouteId[String(route.routeId)]
      decision.reviewedAt = reviewDate
      decision.reviewer = reviewer
      decision.matchType = 'partial'
      const priorEvidence = decision.evidence && typeof decision.evidence === 'object'
        ? structuredClone(decision.evidence as JsonRecord)
        : {}
      decision.evidence = {
        ...priorEvidence,
        structuralSplitAdjudicationPath: paths.adjudication,
        structuralSplitAdjudicationDigest: adjudication.adjudicationDigest,
      }
    }

    const afterEntries = (document.mappings as JsonRecord[]).filter((entry) => sourceId(entry) === sourceGoalId)
    const afterMappingTargets = afterEntries.map(mappingTargetId)
    if (!sameStringSet(afterMappingTargets, afterTargets)) {
      throw new Error(`${String(route.routeId)} failed to reach the exact adjudicated mapping target set`)
    }
    if (new Set(afterMappingTargets).size !== afterMappingTargets.length) {
      throw new Error(`${String(route.routeId)} contains duplicate source-target mapping pairs`)
    }
  }

  for (const [path, document] of result) {
    const mappings = document.mappings as JsonRecord[]
    const pairKeys = mappings.map((entry) => `${sourceId(entry)}\u0000${mappingTargetId(entry)}`)
    if (new Set(pairKeys).size !== pairKeys.length) throw new Error(`${path} contains duplicate source-target pairs`)
    const decisions = document.decisions as JsonRecord[] | undefined
    if (decisions) {
      for (const decision of decisions) {
        const targets = mappings
          .filter((entry) => sourceId(entry) === decision.sourceGoalId)
          .map(mappingTargetId)
        if (!sameStringSet(targets, decision.canonicalGoalIds)) {
          throw new Error(`${path}: raw mappings and decision differ for ${String(decision.sourceGoalId)}`)
        }
      }
    }
  }
  return result
}

function buildProvenance(): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscapes = registry.landscapes as JsonRecord[]
  const landscape = landscapes.find((entry) => entry.landscapeId === ids.canonicalLandscape)
  if (!landscape) throw new Error('Canonical math provenance landscape is missing')
  const provenance = landscape.goalProvenance as JsonRecord
  const retained = provenance[ids.retainedCluster]
  const reused = provenance[ids.reusedLinear]
  if (!retained || !reused) throw new Error('Retained or reused provenance is missing')
  const expectedRetained = {
    sourceLandscapeId: '54cf7ae7-21e7-4cc2-a7b8-1f7dd9df5dc1',
    sourceGoalId: '01122671-ccc3-41a6-ac57-8b6ab736cbea',
  }
  if (!same(retained, expectedRetained)) throw new Error('Retained cluster provenance drift')
  const expectedNew: Record<string, JsonRecord> = {
    [ids.ratio]: {
      sourceLandscapeId: '54cf7ae7-21e7-4cc2-a7b8-1f7dd9df5dc1',
      sourceGoalId: '01122671-ccc3-41a6-ac57-8b6ab736cbea',
      additionalSourceLandscapeIds: ['b30048d2-d649-4727-b448-988a0f86a2c2'],
    },
    [ids.solvability]: {
      sourceLandscapeId: '54cf7ae7-21e7-4cc2-a7b8-1f7dd9df5dc1',
      sourceGoalId: '01122671-ccc3-41a6-ac57-8b6ab736cbea',
      additionalSourceLandscapeIds: [
        '6232b783-199c-4c50-92f2-9fb31277e619',
        'b167b4cd-4b78-4c84-a721-6b2adbbcab3c',
      ],
    },
  }
  for (const [goalId, expected] of Object.entries(expectedNew)) {
    if (provenance[goalId] && !same(provenance[goalId], expected)) {
      throw new Error(`Existing provenance for ${goalId} differs from the adjudicated value`)
    }
    provenance[goalId] = expected
  }
  landscape.goalProvenance = Object.fromEntries(
    Object.entries(provenance).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0),
  )
  return registry
}

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goals = canonical.goals as JsonRecord[]
  const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
  const decisions = ledger.decisions as JsonRecord[]
  const byId = new Map(decisions.map((decision) => [String(decision.goalId), decision]))
  for (const goalId of [ids.retainedCluster, ...newChildIds]) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    const cluster = goalId === ids.retainedCluster
    byId.set(goalId, {
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind: cluster ? 'curricularArea' : 'curricularAtomic',
      decisionStatus: 'authoritative',
      decisionBasis: cluster
        ? 'reviewed-current-structural-split-curricular-area'
        : 'reviewed-current-structural-split-curricular-atomic',
    })
  }
  const routeDependent = goalById.get(ids.linearSystemsMultiplicity)
  const routeDecision = byId.get(ids.linearSystemsMultiplicity)
  if (!routeDependent || !routeDecision) throw new Error('Linear-systems semantic-kind route decision is missing')
  byId.set(ids.linearSystemsMultiplicity, {
    ...routeDecision,
    sourceFingerprint: fingerprintSemanticKindSourceGoal(routeDependent),
    semanticKind: 'curricularAtomic',
    decisionStatus: 'authoritative',
    decisionBasis: 'reviewed-current-structural-split-curricular-atomic',
  })
  for (const goalId of [ids.year7Anchor, ids.year8Extension]) {
    const goal = goalById.get(goalId)
    const decision = byId.get(goalId)
    if (!goal || !decision) throw new Error(`Semantic-kind re-fingerprint target is missing: ${goalId}`)
    byId.set(goalId, {
      ...decision,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
    })
  }
  ledger.decisions = [...byId.values()].sort((left, right) => {
    const leftId = String(left.goalId)
    const rightId = String(right.goalId)
    return leftId < rightId ? -1 : leftId > rightId ? 1 : 0
  })
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    const kind = String(decision.semanticKind)
    counts[kind] = (counts[kind] ?? 0) + 1
  }
  const order = [
    'curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure',
    'memory', 'runtimeSupport', 'orientation',
  ]
  ledger.counts = Object.fromEntries(order.filter((kind) => counts[kind] !== undefined).map((kind) => [kind, counts[kind]]))
  ;(ledger.counts as JsonRecord).total = (ledger.decisions as JsonRecord[]).length
  return ledger
}

function buildAtlasSources(): JsonRecord {
  const atlasSources = readJson(paths.atlasSources)
  if (![786, 787].includes(Number(atlasSources.expectedCurricularAtomicGoalCount))) {
    throw new Error(`Unexpected Mathematics atlas denominator ${String(atlasSources.expectedCurricularAtomicGoalCount)}`)
  }
  atlasSources.expectedCurricularAtomicGoalCount = 787
  return atlasSources
}

function replaceReviewRecords(
  path: string,
  canonical: JsonRecord,
  kind: 'atomicity' | 'memory',
): JsonRecord[] {
  const records = readJsonl(path)
  const goals = canonical.goals as JsonRecord[]
  const goalById = new Map(goals.map((goal) => [String(goal.id), goal]))
  const relevant = new Set([ids.retainedCluster, ...newChildIds])
  const insertionIndex = records.findIndex((record) => relevant.has(String(record.goalId)))
  const retainedRecords = records.filter((record) => !relevant.has(String(record.goalId)))
  const replacements = childSpecs.map((spec): JsonRecord => {
    const goal = goalById.get(spec.id)!
    if (kind === 'atomicity') {
      return {
        schemaVersion: 1,
        reviewId: 'canonical-math-full',
        ruleVersion: 'semantic-atomicity-v1',
        landscapeId: canonical.landscapeId,
        goalId: spec.id,
        fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
        reviewedAt: reviewDate,
        reviewer,
        status: 'atomic',
        semanticAtomic: true,
        reason: spec.atomicityReason,
        suggestedSplit: [],
      }
    }
    return {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'memory-card-review-v1',
      landscapeId: canonical.landscapeId,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
      status: 'no_memory_needed',
      memoryUseful: false,
      reviewedAt: reviewDate,
      reviewer,
      reason: spec.memoryReason,
    }
  })
  const targetIndex = insertionIndex < 0 ? retainedRecords.length : insertionIndex
  retainedRecords.splice(targetIndex, 0, ...replacements)
  return retainedRecords
}

const isGoalReference = (value: unknown): value is JsonRecord => Boolean(
  value
  && typeof value === 'object'
  && ['goalEntry', 'canonicalSubtree'].includes(String((value as JsonRecord).kind))
  && typeof (value as JsonRecord).goalId === 'string',
)

const replacementStructure = (): JsonRecord => ({
  kind: 'structure',
  id: splitStructureId,
  label: splitStructureLabel,
  children: newChildIds.map((goalId) => ({ kind: 'canonicalSubtree', goalId })),
})

function replaceManualViewReference(value: unknown): { value: unknown; count: number } {
  if (Array.isArray(value)) {
    let count = 0
    const transformed = value.map((entry) => {
      if (isGoalReference(entry) && entry.goalId === ids.retainedCluster) {
        count += 1
        return replacementStructure()
      }
      const nested = replaceManualViewReference(entry)
      count += nested.count
      return nested.value
    })
    return { value: transformed, count }
  }
  if (value && typeof value === 'object') {
    let count = 0
    const transformed = Object.fromEntries(Object.entries(value as JsonRecord).map(([key, nested]) => {
      const result = replaceManualViewReference(nested)
      count += result.count
      return [key, result.value]
    }))
    return { value: transformed, count }
  }
  return { value, count: 0 }
}

function countGoalReferences(value: unknown, goalId: string): number {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const own = isGoalReference(value) && value.goalId === goalId ? 1 : 0
  return own + Object.values(value as JsonRecord).reduce(
    (sum: number, nested) => sum + countGoalReferences(nested, goalId),
    0,
  )
}

function buildManualViews(): Map<string, JsonRecord> {
  const result = new Map<string, JsonRecord>()
  for (const fileName of manualViewNames) {
    const path = join(compositionRoot, fileName)
    const view = JSON.parse(readFileSync(path, 'utf8')) as JsonRecord
    const transformed = replaceManualViewReference(view)
    if (transformed.count > 1) throw new Error(`${fileName} contains multiple retained-cluster references`)
    const next = transformed.value as JsonRecord
    if (
      countGoalReferences(next, ids.retainedCluster) !== 0
      || countGoalReferences(next, ids.ratio) !== 1
      || countGoalReferences(next, ids.solvability) !== 1
      || countGoalReferences(next, ids.reusedLinear) !== 1
    ) throw new Error(`${fileName} does not have the exact deduplicated split projection`)
    result.set(path, next)
  }
  return result
}

function buildDurationPolicy(canonical: JsonRecord, adjudication: JsonRecord): JsonRecord {
  const policy = readJson(paths.durationPolicy)
  const canonicalBytes = serializeJson(canonical)
  const inputs = policy.inputs as JsonRecord
  ;(inputs.canonical as JsonRecord).sha256 = sha256(canonicalBytes)
  inputs.additiveAdjudications = [{
    path: paths.adjudication,
    fileSha256: sha256(readFileSync(absolute(paths.adjudication))),
    adjudicationDigest: adjudication.adjudicationDigest,
  }]
  const templates = policy.sek1Templates as JsonRecord[]
  for (const template of templates) {
    const fileName = String(template.fileName)
    const parentStructureId = templateParentByFileName[fileName]
    if (!parentStructureId) {
      if ((template.placements as JsonRecord[]).some((placement) => placement.splitCode === 'B004-058')) {
        throw new Error(`B004 placement is not adjudicated for duration template ${fileName}`)
      }
      continue
    }
    const placements = (template.placements as JsonRecord[])
      .filter((placement) => placement.splitCode !== 'B004-058')
    placements.push({
      parentStructureId,
      splitCode: 'B004-058',
      oldClusterGoalId: ids.retainedCluster,
      renderKind: 'structure',
      removeAtomicGoalIds: [...newChildIds],
      preservedReusedGoalIds: [ids.reusedLinear],
      replacementNode: replacementStructure(),
    })
    template.placements = placements
    template.placementCount = placements.length
  }
  const counts = policy.counts as JsonRecord
  counts.splitPlacementCount = templates.reduce(
    (sum, template) => sum + (template.placements as JsonRecord[]).length,
    0,
  )
  const policyText = policy.policy as JsonRecord
  policyText.sourceOfLayoutTruth =
    `The six reviewed duration-specific Sek-I candidate layouts and the additive B004 adjudication are authoritative for the ${String(counts.splitPlacementCount)} split placements. Mapping buckets remain authoritative for the ordinary atomic target set.`
  return policy
}

type PlannedFile = { path: string; bytes: string }

function collectPlannedSourceFiles(
  canonical: JsonRecord,
  mappings: Map<string, JsonRecord>,
  provenance: JsonRecord,
  semanticKinds: JsonRecord,
  atomicity: JsonRecord[],
  memory: JsonRecord[],
  atlasSources: JsonRecord,
  manualViews: Map<string, JsonRecord>,
  durationPolicy: JsonRecord,
): PlannedFile[] {
  return [
    { path: paths.canonical, bytes: serializeJson(canonical) },
    ...[...mappings].map(([path, value]) => ({ path, bytes: serializeJson(value) })),
    { path: paths.provenance, bytes: serializeJson(provenance) },
    { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
    { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
    { path: paths.memory, bytes: serializeJsonl(memory) },
    { path: paths.atlasSources, bytes: serializeJson(atlasSources) },
    ...[...manualViews].map(([path, value]) => ({ path: relative(repoRoot, path), bytes: serializeJson(value) })),
    { path: paths.durationPolicy, bytes: serializeJson(durationPolicy) },
  ]
}

function changedPlannedFiles(files: PlannedFile[]): PlannedFile[] {
  return files.filter(({ path, bytes }) => !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)
}

function assertFinalViews(): void {
  const affected = new Set(affectedViewNames)
  let observedAffected = 0
  for (const entry of readdirSync(compositionRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.view.json')) continue
    const view = JSON.parse(readFileSync(join(compositionRoot, entry.name), 'utf8')) as JsonRecord
    const oldCount = countGoalReferences(view, ids.retainedCluster)
    const ratioCount = countGoalReferences(view, ids.ratio)
    const solvabilityCount = countGoalReferences(view, ids.solvability)
    if (oldCount !== 0) throw new Error(`Stale retained-cluster projection in ${entry.name}`)
    if (affected.has(entry.name)) {
      observedAffected += 1
      const reusedCount = countGoalReferences(view, ids.reusedLinear)
      if (ratioCount !== 1 || solvabilityCount !== 1 || reusedCount !== 1) {
        throw new Error(`${entry.name} does not contain each split atom exactly once`)
      }
    } else if (ratioCount !== 0 || solvabilityCount !== 0) {
      throw new Error(`Unexpected B004 split projection in unaffected view ${entry.name}`)
    }
  }
  if (observedAffected !== 14) throw new Error(`Observed ${observedAffected} affected views, expected 14`)
}

function assertFinalMappingReferences(adjudication: JsonRecord): void {
  const routes = adjudication.sourceMappingRoutes as JsonRecord[]
  for (const route of routes) {
    const document = readJson(String(route.path))
    const targets = (document.mappings as JsonRecord[])
      .filter((entry) => sourceId(entry) === route.sourceGoalId)
      .map(mappingTargetId)
    if (!sameStringSet(targets, route.afterCanonicalGoalIds)) {
      throw new Error(`${String(route.routeId)} live mapping differs from adjudication`)
    }
    const decisions = document.decisions as JsonRecord[] | undefined
    if (decisions) {
      const decision = decisions.find((entry) => entry.sourceGoalId === route.sourceGoalId)
      if (!decision || !same(decision.canonicalGoalIds, route.afterCanonicalGoalIds)) {
        throw new Error(`${String(route.routeId)} live decision differs from adjudication`)
      }
    }
  }
}

function buildVisualizationQa(): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const records = qa.records as JsonRecord[]
  const recordById = new Map(records.map((record) => [String(record.goalId), record]))
  for (const spec of childSpecs) {
    const record = recordById.get(spec.id)
    const assetPaths = visualizationAssetPaths(spec)
    const imageUrl = `/assets/goal-visualizations/mathematik/${spec.id}/${spec.id}.jpg`
    if (!record) throw new Error(`Visualization QA record is missing for ${spec.id}`)
    if (
      record.visualizationState !== 'available'
      || record.imageUrl !== imageUrl
      || record.canonicalAssetPath !== assetPaths.canonicalImage
      || record.publicAssetPath !== assetPaths.publicImage
      || record.assetSha256 !== spec.assetSha256
    ) throw new Error(`Visualization QA asset metadata drift for ${spec.id}`)
    Object.assign(record, {
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      humanIssueDescription: '',
      chatGptReviewedAt: visualizationReviewedAt,
      chatGptReviewer: visualizationReviewer,
      chatGptNotes: spec.qaNotes,
      humanReviewedAt: null,
      humanReviewer: '',
      aiApproved: 'yes',
      aiApprovedAssetSha256: spec.assetSha256,
      aiReviewedAt: visualizationReviewedAt,
      aiReviewer: visualizationReviewer,
      aiNotes: spec.qaNotes,
    })
  }
  return qa
}

function assertVisualizationQa(): void {
  const expected = serializeJson(buildVisualizationQa())
  const actual = readFileSync(absolute(paths.visualizationQa), 'utf8')
  if (actual !== expected) throw new Error('Visualization QA review bindings are stale')
}

const binding = (path: string): JsonRecord => {
  const bytes = readFileSync(absolute(path))
  return { path, bytes: bytes.length, sha256: sha256(bytes) }
}

function buildReceipt(adjudication: JsonRecord, boundPaths: string[]): JsonRecord {
  const receiptWithoutDigest: JsonRecord = {
    schemaVersion: 1,
    receiptId: 'canonical-math-058bf6de-structural-split-2026-08-27-v1',
    appliedAt: reviewDate,
    status: 'applied-locally-not-committed',
    scope: {
      subject: 'Mathematik',
      layer: 'Layer A curriculum data only',
      retainedGoalId: ids.retainedCluster,
      affectsOpenAiCoachV1Contract: false,
      backendOrRuntimeChanged: false,
      physicsChanged: false,
    },
    authorization: {
      basis: 'Confirmed semantic-atomicity split delegated for autonomous implementation.',
      commitPushDeployAuthorized: false,
      masteryPolicy: 'reassess',
    },
    designBindings: {
      adjudication: binding(paths.adjudication),
      adjudicationDigest: adjudication.adjudicationDigest,
      applyScript: binding(paths.applyScript),
      receiptSchema: binding(paths.receiptSchema),
      receiptValidator: binding(paths.receiptValidator),
      durationGenerator: binding(paths.durationGenerator),
    },
    split: {
      retainedClusterId: ids.retainedCluster,
      reusedChildId: ids.reusedLinear,
      newChildIds: [...newChildIds],
      downstreamRewire: {
        goalId: ids.year8Extension,
        prerequisiteGoalId: ids.ratio,
      },
      terminalRouteConnection: {
        goalId: ids.linearSystemsMultiplicity,
        prerequisiteGoalId: ids.solvability,
      },
    },
    counts: {
      retainedClusters: 1,
      reusedChildren: 1,
      newAtomicGoals: 2,
      logicalSourceRoutes: 11,
      historicalPhysicalOldOccurrences: 21,
      affectedCompositionViews: 14,
      assessmentCoveredGoalIdRewires: 0,
    },
    postApplyBindings: [...new Set(boundPaths)].sort().map(binding),
  }
  return {
    ...receiptWithoutDigest,
    receiptDigest: sha256Digest(JSON.stringify(receiptWithoutDigest)),
  }
}

validateVisualizationAssets()
const adjudication = validateAdjudication()
const canonical = buildCanonical()
const mappings = buildMappingDocuments(adjudication)
const provenance = buildProvenance()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = replaceReviewRecords(paths.atomicity, canonical, 'atomicity')
const memory = replaceReviewRecords(paths.memory, canonical, 'memory')
const atlasSources = buildAtlasSources()
const manualViews = buildManualViews()
const durationPolicy = buildDurationPolicy(canonical, adjudication)
const plannedFiles = collectPlannedSourceFiles(
  canonical,
  mappings,
  provenance,
  semanticKinds,
  atomicity,
  memory,
  atlasSources,
  manualViews,
  durationPolicy,
)
const changed = changedPlannedFiles(plannedFiles)

if (writeMode) {
  for (const { path, bytes } of changed) writeFileSync(absolute(path), bytes)
  execFileSync('npm', ['--prefix', 'app', 'run', 'generate:math-duration-composition-views'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  execFileSync(
    'npm',
    ['exec', '--', 'tsx', 'scripts/generateGoalVisualizationQaLedgers.ts', '--subject=mathematik'],
    { cwd: resolve(repoRoot, 'app'), stdio: 'inherit' },
  )
  writeFileSync(absolute(paths.visualizationQa), serializeJson(buildVisualizationQa()))
  assertVisualizationQa()
  assertFinalViews()
  assertFinalMappingReferences(adjudication)
  const outputPaths = [
    ...plannedFiles.map(({ path }) => path),
    ...generatedViewNames.map((fileName) => relative(repoRoot, join(compositionRoot, fileName))),
    paths.visualizationQa,
    ...visualizationBindingPaths,
  ]
  const receipt = buildReceipt(adjudication, outputPaths)
  writeFileSync(absolute(paths.receipt), serializeJson(receipt))
} else if (changed.length === 0) {
  execFileSync('npm', ['--prefix', 'app', 'run', 'check:math-duration-composition-views'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  execFileSync(
    'npm',
    ['exec', '--', 'tsx', 'scripts/generateGoalVisualizationQaLedgers.ts', '--check', '--subject=mathematik'],
    { cwd: resolve(repoRoot, 'app'), stdio: 'inherit' },
  )
  assertVisualizationQa()
  assertFinalViews()
  assertFinalMappingReferences(adjudication)
}

console.log(
  `CHECK apply_math_batch004_structural_split ${writeMode ? 'WRITE' : 'PASS'} `
  + `retained=1 reused=1 newAtoms=2 mappingRoutes=11 physicalOccurrences=21 `
  + `views=14 plannedWrites=${changed.length} files=${changed.map(({ path }) => basename(path)).join(',') || '-'}`,
)
