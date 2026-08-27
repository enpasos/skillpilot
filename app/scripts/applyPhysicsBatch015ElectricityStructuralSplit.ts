import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, any>
type MatchType = 'exact' | 'partial'
type MappingRule = {
  sourceGoalId: string
  add?: Array<{ targetGoalId: string; matchType: MatchType }>
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  atlas: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  canonicalProvenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  surrogate: 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
  bwReview: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  heReview: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  heLegacy: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_to_canonical_physics.json',
  hbReview: 'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  hhReview: 'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  mvReview: 'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  slReview: 'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  snReview: 'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  stReview: 'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  thReview: 'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
} as const

const ids = {
  subjectRoot: 'bf980fff-b62b-4ea4-a20d-31681a7ad785',
  voltageArea: 'bbabac7c-9613-4c7e-877e-d7dc3df5300f',
  relation: '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
  chargeSeparation: 'dc7dd287-6eac-574d-818d-65cfb23a2d94',
  electricalPower: 'b92827a7-5d62-5fdb-a6f5-ac44461f4a7b',
  safetyCluster: '1911920e-b099-4310-82f2-b47f51a78b33',
  householdSafety: '5ddba212-9e0a-5dd4-8274-239ec51ab6a8',
  thunderstormSafety: 'c156d2fb-0fe9-5f13-8baa-3e74d7da151e',
  resistanceCluster: 'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  ivCharacteristics: '66256e22-44a3-5939-8862-821e29d6711d',
  conductorFactors: 'af7855a3-6aea-5e05-8505-248bc9a8c219',
  supplyCluster: '50431e92-eec9-54d6-b437-ea7a51b6f474',
  voltageSupplies: '4a42cddd-7827-5204-87e5-8d9eac7792f1',
  deviceRatings: '27b90ce9-b650-5232-85fb-ce2cb69d59a3',
  bavariaSafetyAssessment: '77257ded-ccf0-521f-8a8c-38c8f85fd3ca',
  bwSafetyAssessment: 'eb5e147f-a67c-542e-858b-533a00af7af2',
  bavariaCircuitAssessment: '924e1187-a067-5eb6-8d8d-85525ee6c837',
  resistorNetworksAssessment: '5a530302-1303-517f-82cc-9cd457b792a8',
  supplyAssessment: 'de7528cc-8c5d-5cd6-8d08-f8ce7457e666',
  compatibilityCapstone: '3631c8f7-ff48-57ff-b7ee-8397ff1d166a',
} as const

const splitParents: Set<string> = new Set([ids.safetyCluster, ids.resistanceCluster, ids.supplyCluster])

const allJurisdictions = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const
const withoutBavaria = allJurisdictions.filter((jurisdiction) => jurisdiction !== 'DE-BY')

const childSpecs = [
  {
    id: ids.householdSafety,
    parentId: ids.safetyCluster,
    shortKey: 'canonical_physics_sek1_assess_electrical_system_household_circuit_hazards',
    title: 'Gefahren elektrischer Anlagen und Haushaltsstromkreise sicher beurteilen',
    titleEn: 'Assess hazards of electrical systems and household circuits safely',
    description: 'Die lernende Person kann Gefahren elektrischer Anlagen und Haushaltsstromkreise anhand möglicher Stromwege und der Wirkung von Schutzmaßnahmen erläutern und sichere Handlungen begründet beurteilen.',
    descriptionEn: 'The learner can explain hazards of electrical systems and household circuits in terms of possible current paths and the effects of protective measures and give reasoned assessments of safe actions.',
    requires: [ids.relation],
    jurisdictions: [...allJurisdictions],
    demandLevel: 'AB2',
    processCompetencies: ['PK5_BEWERTEN'],
    competencyRefs: ['PROCESS.PK5'],
    guidingIdeas: ['LI_FELDER', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.SAFETY.INSTALLATIONS_HOUSEHOLD',
    atomicityReason: 'Die Analyse gefährlicher Stromwege und der dazu passenden Schutzwirkung bildet eine einzelne, sicher anhand von Schaltbildern und Fehlerszenarien prüfbare Bewertungskompetenz; Netzspannungsversuche sind ausdrücklich nicht erforderlich.',
    memoryReason: 'Das Ziel verlangt die kausale Analyse wechselnder Fehler- und Schutzsituationen; isoliertes Merken einzelner Sicherheitsregeln ersetzt diese Urteilsleistung nicht.',
  },
  {
    id: ids.thunderstormSafety,
    parentId: ids.safetyCluster,
    shortKey: 'canonical_physics_sek1_explain_thunderstorm_electricity_safe_behavior',
    title: 'Elektrische Vorgänge und sicheres Verhalten bei Gewittern erklären',
    titleEn: 'Explain electrical processes and safe behavior during thunderstorms',
    description: 'Die lernende Person kann elektrische Vorgänge bei Gewittern qualitativ erklären und sichere Verhaltensregeln anhand des Blitzrisikos begründen.',
    descriptionEn: 'The learner can qualitatively explain electrical processes during thunderstorms and justify safe-behavior rules in terms of lightning risk.',
    requires: [ids.chargeSeparation],
    jurisdictions: [...withoutBavaria],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK5_BEWERTEN'],
    competencyRefs: ['PROCESS.PK2', 'PROCESS.PK5'],
    guidingIdeas: ['LI_FELDER', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.SAFETY.THUNDERSTORMS',
    atomicityReason: 'Gewitterentladung und begründetes Schutzverhalten werden über dasselbe Modell von Ladungstrennung, Entladung und möglichen Stromwegen verbunden und bilden eine einzelne, in neuen Gewittersituationen prüfbare Transferkompetenz.',
    memoryReason: 'Sicheres Gewitterverhalten soll aus Entladungs- und Stromwegsrisiken begründet und auf neue Orte übertragen werden; eine bloße Regelliste genügt dafür nicht.',
  },
  {
    id: ids.ivCharacteristics,
    parentId: ids.resistanceCluster,
    shortKey: 'canonical_physics_sek1_investigate_interpret_component_iv_characteristics',
    title: 'Strom-Spannungs-Kennlinien einfacher Bauteile experimentell untersuchen und deuten',
    titleEn: 'Experimentally investigate and interpret current-voltage characteristics of simple components',
    description: 'Die lernende Person kann unter sicheren Kleinspannungsbedingungen Stromstärke und Spannung an einfachen Bauteilen systematisch messen, Kennlinien erstellen und den Zusammenhang von Spannung, Stromstärke und Widerstand deuten.',
    descriptionEn: 'Under safe low-voltage conditions, the learner can systematically measure current and voltage for simple components, construct current-voltage characteristics, and interpret the relationship among voltage, current, and resistance.',
    requires: [ids.relation],
    jurisdictions: [...allJurisdictions],
    demandLevel: 'AB2',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
    competencyRefs: ['PROCESS.PK1', 'PROCESS.PK2', 'PROCESS.PK3'],
    guidingIdeas: ['LI_FELDER', 'LI_MATERIE'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.RESISTANCE_CHARACTERISTICS.IV_EXPERIMENT',
    atomicityReason: 'Messreihe, Kennliniendarstellung und Deutung sind notwendige Phasen derselben experimentellen Erkenntnisleistung an einem Bauteil und gemeinsam in einer sicheren Kleinspannungsaufgabe prüfbar.',
    memoryReason: 'Das Ziel verlangt Messplanung, Datenerhebung, Darstellung und Modellinterpretation; eine Memorycard kann diese experimentelle Kompetenz nicht ersetzen.',
  },
  {
    id: ids.conductorFactors,
    parentId: ids.resistanceCluster,
    shortKey: 'canonical_physics_sek1_describe_conductor_resistance_factors',
    title: 'Einflüsse auf den Widerstand eines Leiters qualitativ beschreiben',
    titleEn: "Qualitatively describe factors affecting a conductor's resistance",
    description: 'Die lernende Person kann qualitativ erläutern, wie Material, Länge und Querschnitt den Widerstand eines Leiters bei sonst gleichen Bedingungen beeinflussen, und Widerstandsänderungen vorhersagen.',
    descriptionEn: "The learner can qualitatively explain how material, length, and cross-sectional area affect a conductor's resistance when other conditions are held constant and predict changes in resistance.",
    requires: [ids.relation],
    jurisdictions: [...withoutBavaria],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
    competencyRefs: ['PROCESS.PK2', 'PROCESS.PK3'],
    guidingIdeas: ['LI_FELDER', 'LI_MATERIE'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.RESISTANCE_CHARACTERISTICS.CONDUCTOR_FACTORS',
    atomicityReason: 'Material, Länge und Querschnitt werden als kontrollierte Einflussgrößen derselben Leiterwiderstands-Kompetenz verglichen; Vorhersagen bei jeweils sonst gleichen Bedingungen sind in einer zusammenhängenden Aufgabe prüfbar.',
    memoryReason: 'Die qualitative Vorhersage verlangt Variablenkontrolle und physikalische Begründung; das isolierte Erinnern der Formel R = ρ·l/A ist weder gefordert noch hinreichend.',
  },
  {
    id: ids.voltageSupplies,
    parentId: ids.supplyCluster,
    shortKey: 'canonical_physics_sek1_classify_direct_alternating_voltage_supplies',
    title: 'Gleich- und Wechselspannungsversorgungen einordnen',
    titleEn: 'Classify direct- and alternating-voltage supplies',
    description: 'Die lernende Person kann Gleich- und Wechselspannungsversorgungen anhand des zeitlichen Spannungsverlaufs und der Polarität unterscheiden und typische elektrische Versorgungen entsprechend einordnen.',
    descriptionEn: "The learner can distinguish direct- and alternating-voltage supplies by the voltage's time dependence and polarity and classify typical electrical supplies accordingly.",
    requires: [ids.relation],
    jurisdictions: [...withoutBavaria],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    competencyRefs: ['PROCESS.PK2', 'PROCESS.PK4'],
    guidingIdeas: ['LI_FELDER', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.SUPPLY_LABELS.DIRECT_ALTERNATING_VOLTAGE',
    atomicityReason: 'Das Unterscheiden und Einordnen von Gleich- und Wechselspannungsversorgungen anhand von Polarität und Zeitverlauf ist eine einzelne, mit Kennzeichnungen oder U(t)-Diagrammen prüfbare Klassifikationskompetenz.',
    memoryReason: 'Die Einordnung soll aus einem Spannungsverlauf oder einer Versorgungssituation hergeleitet werden; eine isolierte Definition von Gleich- und Wechselspannung ist dafür nicht ausreichend.',
  },
  {
    id: ids.deviceRatings,
    parentId: ids.supplyCluster,
    shortKey: 'canonical_physics_sek1_interpret_device_battery_ratings',
    title: 'Elektrische Geräte- und Akkuangaben physikalisch deuten',
    titleEn: 'Interpret electrical device and battery ratings physically',
    description: 'Die lernende Person kann Angaben zu Spannung, Stromstärke, Leistung und Akkuladung auf Alltagsgeräten und Akkus mit ihren Einheiten physikalisch deuten und für den vorgesehenen Betrieb einordnen.',
    descriptionEn: 'The learner can physically interpret voltage, current, power, and battery-charge ratings on everyday devices and batteries together with their units and classify their roles for intended operation.',
    requires: [ids.relation, ids.electricalPower],
    jurisdictions: [...withoutBavaria],
    demandLevel: 'AB2',
    processCompetencies: ['PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
    competencyRefs: ['PROCESS.PK3', 'PROCESS.PK4', 'PROCESS.PK5'],
    guidingIdeas: ['LI_ENERGIE', 'LI_FELDER', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ELECTRICITY.SUPPLY_LABELS.DEVICE_BATTERY_RATINGS',
    atomicityReason: 'Spannung, Stromstärke, Leistung und Akkuladung werden gemeinsam als funktional unterschiedliche Angaben eines Geräte- oder Akkudatensatzes gedeutet; die Abgrenzung ihrer Rollen ist eine einzelne, authentisch prüfbare Typenschildkompetenz.',
    memoryReason: 'Das Ziel verlangt die Deutung unbekannter Geräte- und Akkuangaben im vorgesehenen Betrieb; isoliertes Einheitenlernen ersetzt diese Anwendung und Abgrenzung nicht.',
  },
] as const

const deterministicPhysicsGoalId = (shortKey: string): string => {
  const digest = createHash('sha1').update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`).digest('hex')
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20, 32)}`
}
for (const spec of childSpecs) if (deterministicPhysicsGoalId(spec.shortKey) !== spec.id) {
  throw new Error(`Deterministic Physics goal ID mismatch for ${spec.shortKey}`)
}

const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))
const writeJson = (path: string, value: unknown): void => writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
const readJsonl = (path: string): JsonRecord[] => readFileSync(resolve(repoRoot, path), 'utf8')
  .split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line))
const writeJsonl = (path: string, values: JsonRecord[]): void => writeFileSync(
  resolve(repoRoot, path), `${values.map((value) => JSON.stringify(value)).join('\n')}\n`,
)
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const unique = <T>(values: T[]): T[] => [...new Set(values)]

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value)
}
const digest = (value: unknown): string => `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => digest({
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
})

const replaceRequired = (values: string[], oldId: string, replacements: string[], label: string): string[] => {
  const oldCount = values.filter((value) => value === oldId).length
  if (oldCount === 0) {
    if (replacements.every((id) => values.includes(id))) return unique(values)
    throw new Error(`${label}: neither before nor after state for ${oldId}`)
  }
  if (oldCount !== 1) throw new Error(`${label}: duplicate ${oldId}`)
  return unique(values.flatMap((value) => value === oldId ? replacements : [value]))
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [goal.id, goal]))
  if (byId.size !== goals.length) throw new Error('Duplicate canonical Physics goal IDs')
  const goal = (id: string): JsonRecord => {
    const value = byId.get(id)
    if (!value) throw new Error(`Missing canonical Physics goal ${id}`)
    return value
  }
  const parentResourceLinks = new Map([...splitParents].map((id) => [id, stableJson(goal(id).resourceLinks ?? [])]))
  for (const parentId of splitParents) {
    const links = goal(parentId).resourceLinks ?? []
    if (links.length === 0 || links.some((link: JsonRecord) => link.provider !== 'Google Gemini / Nano Banana Pro')) {
      throw new Error(`Split parent ${parentId} must retain its existing Nano Banana Pro overview visualization`)
    }
  }

  Object.assign(goal(ids.safetyCluster), {
    description: 'Bündelt das Beurteilen von Gefahren elektrischer Anlagen und Haushaltsstromkreise sowie das Erklären elektrischer Vorgänge und sicheren Verhaltens bei Gewittern.',
    descriptionEn: 'Bundles assessing hazards of electrical systems and household circuits and explaining electrical processes and safe behavior during thunderstorms.',
    weight: 2,
    contains: [ids.householdSafety, ids.thunderstormSafety],
    requires: [],
    type: 'cluster',
  })
  Object.assign(goal(ids.resistanceCluster), {
    description: 'Bündelt das experimentelle Untersuchen und Deuten von Strom-Spannungs-Kennlinien sowie das qualitative Beschreiben von Material-, Längen- und Querschnittseinflüssen auf den Leiterwiderstand.',
    descriptionEn: 'Bundles experimentally investigating and interpreting current-voltage characteristics and qualitatively describing material, length, and cross-sectional effects on conductor resistance.',
    weight: 2,
    contains: [ids.ivCharacteristics, ids.conductorFactors],
    requires: [],
    type: 'cluster',
  })
  Object.assign(goal(ids.supplyCluster), {
    description: 'Bündelt das Einordnen von Gleich- und Wechselspannungsversorgungen sowie das physikalische Deuten elektrischer Geräte- und Akkuangaben.',
    descriptionEn: 'Bundles classifying direct- and alternating-voltage supplies and physically interpreting electrical device and battery ratings.',
    weight: 2,
    contains: [ids.voltageSupplies, ids.deviceRatings],
    requires: [],
    type: 'cluster',
  })
  for (const parentId of splitParents) delete goal(parentId).semanticAtomic

  for (const spec of childSpecs) {
    const parent = goal(spec.parentId)
    const expected: JsonRecord = {
      id: spec.id,
      shortKey: spec.shortKey,
      title: spec.title,
      titleEn: spec.titleEn,
      description: spec.description,
      descriptionEn: spec.descriptionEn,
      weight: 1,
      tags: structuredClone(parent.tags),
      contains: [],
      requires: [...spec.requires],
      dimensionTags: {
        framework: 'canonical-gymnasium-physics',
        demandLevel: spec.demandLevel,
        processCompetencies: [...spec.processCompetencies],
        guidingIdeas: [...spec.guidingIdeas],
        phase: 'GLOBAL',
        area: 'Elektrizität',
        topicCode: spec.topicCode,
      },
      applicability: { jurisdiction: [...spec.jurisdictions] },
      type: 'atomic',
      semanticAtomic: true,
      competencyRefs: [...spec.competencyRefs],
    }
    const existing = byId.get(spec.id)
    const resourceLinks = existing?.resourceLinks ? structuredClone(existing.resourceLinks) : undefined
    if (resourceLinks?.some((link: JsonRecord) => link.provider !== 'Google Gemini / Nano Banana Pro')) {
      throw new Error(`Split child ${spec.id} may only receive a Nano Banana Pro visualization`)
    }
    if (existing) {
      for (const key of Object.keys(existing)) delete existing[key]
      Object.assign(existing, expected)
      if (resourceLinks) existing.resourceLinks = resourceLinks
    } else {
      byId.set(spec.id, expected)
    }
  }

  for (const spec of childSpecs) {
    const index = goals.findIndex((candidate) => candidate.id === spec.id)
    if (index >= 0) goals.splice(index, 1)
  }
  for (const parentId of [ids.supplyCluster, ids.resistanceCluster, ids.safetyCluster]) {
    const parentIndex = goals.findIndex((candidate) => candidate.id === parentId)
    if (parentIndex < 0) throw new Error(`Missing insertion parent ${parentId}`)
    const children = childSpecs.filter((spec) => spec.parentId === parentId).map((spec) => goal(spec.id))
    goals.splice(parentIndex + 1, 0, ...children)
  }

  const rewires = [
    { goalId: ids.bavariaSafetyAssessment, oldId: ids.safetyCluster, replacements: [ids.householdSafety, ids.thunderstormSafety] },
    { goalId: ids.bwSafetyAssessment, oldId: ids.safetyCluster, replacements: [ids.householdSafety, ids.thunderstormSafety] },
    { goalId: ids.bavariaCircuitAssessment, oldId: ids.resistanceCluster, replacements: [ids.ivCharacteristics, ids.conductorFactors] },
    { goalId: ids.resistorNetworksAssessment, oldId: ids.resistanceCluster, replacements: [ids.ivCharacteristics, ids.conductorFactors] },
    { goalId: ids.supplyAssessment, oldId: ids.supplyCluster, replacements: [ids.voltageSupplies, ids.deviceRatings] },
  ] as const
  for (const rewire of rewires) {
    const assessment = goal(rewire.goalId)
    assessment.requires = replaceRequired(assessment.requires, rewire.oldId, [...rewire.replacements], `${rewire.goalId}.requires`)
    assessment.examData.coveredGoalIds = replaceRequired(
      assessment.examData.coveredGoalIds,
      rewire.oldId,
      [...rewire.replacements],
      `${rewire.goalId}.examData.coveredGoalIds`,
    )
  }

  const capstone = goal(ids.compatibilityCapstone)
  for (const [oldId, replacements] of [
    [ids.safetyCluster, [ids.householdSafety, ids.thunderstormSafety]],
    [ids.resistanceCluster, [ids.ivCharacteristics, ids.conductorFactors]],
    [ids.supplyCluster, [ids.voltageSupplies, ids.deviceRatings]],
  ] as const) {
    capstone.requires = replaceRequired(capstone.requires, oldId, [...replacements], `${ids.compatibilityCapstone}.requires`)
    capstone.examData.coveredGoalIds = replaceRequired(
      capstone.examData.coveredGoalIds,
      oldId,
      [...replacements],
      `${ids.compatibilityCapstone}.examData.coveredGoalIds`,
    )
  }

  for (const candidate of goals) {
    const staleRequires = (candidate.requires ?? []).filter((id: string) => splitParents.has(id))
    const staleCovered = (candidate.examData?.coveredGoalIds ?? []).filter((id: string) => splitParents.has(id))
    if (staleRequires.length || staleCovered.length) {
      throw new Error(`Unadjudicated split-parent dependency on ${candidate.id}: ${[...staleRequires, ...staleCovered].join(',')}`)
    }
  }

  const atomicDescendants = (rootId: string): Set<string> => {
    const result = new Set<string>()
    const visiting = new Set<string>()
    const visit = (id: string): void => {
      if (visiting.has(id)) throw new Error(`Contains cycle at ${id}`)
      const candidate = goal(id)
      if ((candidate.contains ?? []).length === 0) { result.add(id); return }
      visiting.add(id)
      for (const childId of candidate.contains) visit(childId)
      visiting.delete(id)
    }
    visit(rootId)
    return result
  }
  goal(ids.voltageArea).weight = atomicDescendants(ids.voltageArea).size
  goal(ids.subjectRoot).weight = 1.2
  if (goal(ids.voltageArea).weight !== 17) {
    throw new Error(`Unexpected post-split voltage-area weight ${goal(ids.voltageArea).weight}`)
  }
  if (goals.length !== 675) throw new Error(`Unexpected post-split canonical goal count ${goals.length}`)
  for (const [parentId, before] of parentResourceLinks) if (stableJson(goal(parentId).resourceLinks ?? []) !== before) {
    throw new Error(`Parent resourceLinks changed for ${parentId}`)
  }

  landscape.goals = goals
  return landscape
}

const semanticChangedIds: string[] = [
  ...splitParents,
  ...childSpecs.map((spec) => spec.id),
  ids.bavariaSafetyAssessment,
  ids.bwSafetyAssessment,
  ids.bavariaCircuitAssessment,
  ids.resistorNetworksAssessment,
  ids.supplyAssessment,
  ids.compatibilityCapstone,
]

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const decisions = new Map((ledger.decisions as JsonRecord[]).map((decision) => [decision.goalId, decision]))
  for (const goalId of semanticChangedIds) {
    const canonicalGoal = goalById.get(goalId)
    if (!canonicalGoal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    const existing = decisions.get(goalId)
    const semanticKind = splitParents.has(goalId)
      ? 'curricularArea'
      : childSpecs.some((spec) => spec.id === goalId)
        ? 'curricularAtomic'
        : existing?.semanticKind
    if (!semanticKind) throw new Error(`Missing semantic-kind decision ${goalId}`)
    decisions.set(goalId, {
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(canonicalGoal),
      semanticKind,
      decisionStatus: 'authoritative',
      decisionBasis: splitParents.has(goalId)
        ? 'reviewed-current-structural-split-curricular-area'
        : childSpecs.some((spec) => spec.id === goalId)
          ? 'reviewed-current-structural-split-curricular-atomic'
          : existing.decisionBasis,
    })
  }
  ledger.decisions = [...decisions.values()].sort((left, right) => left.goalId.localeCompare(right.goalId))
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions) counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  const order = ['curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure', 'memory', 'runtimeSupport', 'orientation']
  ledger.counts = Object.fromEntries(order.filter((key) => counts[key] !== undefined).map((key) => [key, counts[key]]))
  ledger.counts.total = ledger.decisions.length
  if (
    ledger.counts.curricularAtomic !== 444
    || ledger.counts.curricularArea !== 90
    || ledger.counts.practiceAssessment !== 130
    || ledger.counts.total !== 675
  ) {
    throw new Error(`Unexpected semantic-kind counts ${stableJson(ledger.counts)}`)
  }
  return ledger
}

function buildLeafReviewLedger(landscape: JsonRecord, path: string, ruleVersion: string): JsonRecord[] {
  const records = readJsonl(path)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const makeRecord = (goalId: string): JsonRecord => {
    const canonicalGoal = goalById.get(goalId)
    const spec = childSpecs.find((candidate) => candidate.id === goalId)
    if (!canonicalGoal || !spec) throw new Error(`Missing Batch-015 review-ledger goal ${goalId}`)
    const base = {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion,
      landscapeId: landscape.landscapeId,
      goalId,
      fingerprint: reviewFingerprint(canonicalGoal, ruleVersion),
      reviewedAt: '2026-08-27',
      reviewer: 'codex-physics-batch-015-structural-synthesis',
    }
    return ruleVersion === 'semantic-atomicity-v1'
      ? { ...base, status: 'atomic', semanticAtomic: true, reason: spec.atomicityReason, suggestedSplit: [] }
      : { ...base, status: 'no_memory_needed', memoryUseful: false, reason: spec.memoryReason }
  }
  const result: JsonRecord[] = []
  const inserted = new Set<string>()
  for (const record of records) {
    if (splitParents.has(record.goalId)) {
      for (const spec of childSpecs.filter((candidate) => candidate.parentId === record.goalId)) {
        if (!inserted.has(spec.id)) { result.push(makeRecord(spec.id)); inserted.add(spec.id) }
      }
      continue
    }
    if (childSpecs.some((spec) => spec.id === record.goalId)) {
      if (!inserted.has(record.goalId)) { result.push(makeRecord(record.goalId)); inserted.add(record.goalId) }
      continue
    }
    result.push(record)
  }
  for (const spec of childSpecs) if (!inserted.has(spec.id)) result.push(makeRecord(spec.id))
  if (result.length !== 444) throw new Error(`${path}: unexpected post-split review count ${result.length}`)
  if (result.some((record) => splitParents.has(record.goalId))) throw new Error(`${path}: split-parent leaf record remains`)
  return result
}

const targetLabels: Map<string, string> = new Map(childSpecs.map((spec) => [spec.id, spec.title]))

function buildReviewedMapping(path: string, rules: MappingRule[]): JsonRecord {
  const review = readJson(path)
  const ruleBySource = new Map(rules.map((rule) => [rule.sourceGoalId, rule]))
  if (ruleBySource.size !== rules.length) throw new Error(`${path}: duplicate Batch-015 mapping rule`)
  const decisionBySource = new Map((review.decisions as JsonRecord[]).map((decision) => [decision.sourceGoalId, decision]))
  for (const sourceGoalId of ruleBySource.keys()) if (!decisionBySource.has(sourceGoalId)) {
    throw new Error(`${path}: missing adjudicated source decision ${sourceGoalId}`)
  }

  const mappingSources = unique((review.mappings as JsonRecord[]).map((mapping) => mapping.legacyGoalId))
  const allSources = unique([...mappingSources, ...ruleBySource.keys()])
  const nextMappings: JsonRecord[] = []
  for (const sourceGoalId of allSources) {
    const existing = (review.mappings as JsonRecord[])
      .filter((mapping) => mapping.legacyGoalId === sourceGoalId)
      .filter((mapping) => !splitParents.has(mapping.canonicalGoalId))
    for (const addition of ruleBySource.get(sourceGoalId)?.add ?? []) {
      const found = existing.find((mapping) => mapping.canonicalGoalId === addition.targetGoalId)
      if (found) found.matchType = addition.matchType
      else existing.push({
        legacyGoalId: sourceGoalId,
        canonicalGoalId: addition.targetGoalId,
        matchType: addition.matchType,
        reviewDecisionId: sourceGoalId,
      })
    }
    const deduplicated = new Map<string, JsonRecord>()
    for (const mapping of existing) deduplicated.set(mapping.canonicalGoalId, mapping)
    nextMappings.push(...deduplicated.values())
  }

  const targetsBySource = new Map<string, string[]>()
  for (const mapping of nextMappings) targetsBySource.set(
    mapping.legacyGoalId,
    [...(targetsBySource.get(mapping.legacyGoalId) ?? []), mapping.canonicalGoalId],
  )
  for (const decision of review.decisions as JsonRecord[]) {
    const mappedTargets = targetsBySource.get(decision.sourceGoalId) ?? []
    const changed = stableJson(decision.canonicalGoalIds ?? []) !== stableJson(mappedTargets)
    decision.canonicalGoalIds = mappedTargets
    if (decision.canonicalGoalIds.length === 0) {
      throw new Error(`${path}: Batch-015 adjudication leaves ${decision.sourceGoalId} without a canonical target`)
    }
    if (changed) {
      const labels = (ruleBySource.get(decision.sourceGoalId)?.add ?? [])
        .map((entry) => targetLabels.get(entry.targetGoalId) ?? entry.targetGoalId)
      decision.rationale = labels.length > 0
        ? `Batch-015-Fachreview: Das frühere Sammelziel wurde atomar entflochten. Direkt gestützt werden ${labels.join('; ')}; weitere bereits geprüfte Zuordnungen bleiben unverändert.`
        : 'Batch-015-Fachreview: Das frühere Sammelziel war für diesen Source-Aspekt fachlich zu breit und wurde entfernt; keine der neuen Teilkompetenzen wird dadurch hinreichend direkt gestützt. Weitere bereits geprüfte Zuordnungen bleiben unverändert.'
      decision.reviewedAt = '2026-08-27'
      decision.reviewer = 'codex-physics-batch-015-structural-synthesis'
    }
  }
  review.mappings = nextMappings
  if (
    nextMappings.some((mapping) => splitParents.has(mapping.canonicalGoalId))
    || (review.decisions as JsonRecord[]).some((decision) =>
      (decision.canonicalGoalIds ?? []).some((id: string) => splitParents.has(id)))
  ) throw new Error(`${path}: split-parent source mapping remains`)
  return review
}

function buildHeLegacyMapping(): JsonRecord {
  const mapping = readJson(paths.heLegacy)
  const legacyGoalId = '669d4da4-762a-40db-98b9-dab127d86346'
  const desired = [ids.householdSafety, ids.thunderstormSafety].map((canonicalGoalId) => ({
    legacyGoalId,
    canonicalGoalId,
    matchType: 'partial',
  }))
  const result: JsonRecord[] = []
  let inserted = false
  for (const row of mapping.mappings as JsonRecord[]) {
    const isRelevant = row.legacyGoalId === legacyGoalId
      && (splitParents.has(row.canonicalGoalId) || desired.some((entry) => entry.canonicalGoalId === row.canonicalGoalId))
    if (isRelevant) {
      if (!inserted) { result.push(...desired); inserted = true }
      continue
    }
    if (splitParents.has(row.canonicalGoalId)) {
      throw new Error(`HE legacy mapping has unadjudicated split parent ${row.canonicalGoalId}`)
    }
    result.push(row)
  }
  if (!inserted) result.push(...desired)
  mapping.mappings = result
  return mapping
}

const mappingRules = new Map<string, MappingRule[]>([
  [paths.bwReview, [
    { sourceGoalId: 'bw-phys-seki-3-2-5-b09-a01-38e15e8e', add: [{ targetGoalId: ids.deviceRatings, matchType: 'partial' }] },
    { sourceGoalId: 'bw-phys-seki-3-2-5-b11-a01-fe769b0d', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'bw-phys-seki-3-3-2-b02-a01-21aa2c68', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'bw-phys-seki-3-3-2-b03-a01-53b2443a', add: [
      { targetGoalId: ids.ivCharacteristics, matchType: 'partial' },
      { targetGoalId: ids.conductorFactors, matchType: 'partial' },
    ] },
    { sourceGoalId: 'bw-phys-seki-3-3-2-b07-a01-d740a1eb', add: [{ targetGoalId: ids.voltageSupplies, matchType: 'partial' }] },
    { sourceGoalId: 'bw-phys-seki-3-3-2-b08-a01-201ffc0f', add: [
      { targetGoalId: ids.voltageSupplies, matchType: 'partial' },
      { targetGoalId: ids.deviceRatings, matchType: 'partial' },
    ] },
    { sourceGoalId: 'bw-phys-seki-3-3-2-b09-a01-8d5929cb', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
  ]],
  [paths.byReview, [
    { sourceGoalId: 'ca6eda33-e8f1-598d-be39-c768f9db4c6c', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: '8ae934cf-b74e-574f-87dc-d49c5526f819', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
  ]],
  [paths.heReview, [
    { sourceGoalId: 'he-phys-seki-8-2-b03-a01-3fe0dc0a', add: [
      { targetGoalId: ids.householdSafety, matchType: 'partial' },
      { targetGoalId: ids.thunderstormSafety, matchType: 'partial' },
      { targetGoalId: ids.voltageSupplies, matchType: 'partial' },
      { targetGoalId: ids.deviceRatings, matchType: 'partial' },
    ] },
  ]],
  [paths.hbReview, [
    { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-1-elektrostatik-036-94f1334e', add: [{ targetGoalId: ids.thunderstormSafety, matchType: 'partial' }] },
    { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-1-elektrostatik-037-0ed93aad', add: [{ targetGoalId: ids.thunderstormSafety, matchType: 'partial' }] },
    { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-2-stromkreis-043-8df1f4d1', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-2-stromkreis-044-eddcc681', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-2-stromkreis-045-7169ddc0', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-2-stromkreis-048-e8f7a259', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'hb-physics-seki-bp2006-2022-3-2-stromkreis-049-72aab4f1', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
  ]],
  [paths.hhReview, [
    { sourceGoalId: 'hh-physics-seki-bp2022-3-1-elek-019-71600b1a', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'hh-physics-seki-bp2022-3-2-elek-072-9d35e0d7', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
  ]],
  [paths.mvReview, [
    { sourceGoalId: 'mv-phys-seki-rp2022-j8-ladung-009-9b16b23a', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'mv-phys-seki-rp2022-j8-ladung-010-0d2795b5', add: [{ targetGoalId: ids.deviceRatings, matchType: 'partial' }] },
    { sourceGoalId: 'mv-phys-seki-rp2022-j8-stromkreise-007-faa3e23b', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'mv-phys-seki-rp2022-j9-induktion-007-575785eb', add: [{ targetGoalId: ids.voltageSupplies, matchType: 'partial' }] },
    { sourceGoalId: 'mv-phys-seki-rp2022-j9-ebike-003-4bc22ec8', add: [{ targetGoalId: ids.deviceRatings, matchType: 'partial' }] },
  ]],
  [paths.slReview, [
    { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p11-013-86797b18', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p14-005-14a6c835', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p14-006-3c49e209', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p14-008-a34b4bca', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p14-009-5c72747c', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    ...[
      'sl-phys-seki-sl-ph-seki-9-nw-2024-p33-001-e36a6abc',
      'sl-phys-seki-sl-ph-seki-9-nw-2024-p33-002-9d1a7923',
      'sl-phys-seki-sl-ph-seki-9-nw-2024-p33-003-17a8a7b4',
      'sl-phys-seki-sl-ph-seki-9-nw-2024-p33-004-bfcabcc6',
      'sl-phys-seki-sl-ph-seki-9-nw-2024-p33-005-ea4277ff',
    ].map((sourceGoalId) => ({ sourceGoalId, add: [{ targetGoalId: ids.conductorFactors, matchType: 'partial' as const }] })),
    ...[
      'sl-phys-seki-sl-ph-seki-10-nw-2026-p12-007-edc838e3',
      'sl-phys-seki-sl-ph-seki-10-nw-2026-p12-013-82b38b9f',
      'sl-phys-seki-sl-ph-seki-10-nw-2026-p13-003-bf4801b0',
      'sl-phys-seki-sl-ph-seki-10-nw-2026-p13-008-1d602017',
    ].map((sourceGoalId) => ({ sourceGoalId, add: [{ targetGoalId: ids.voltageSupplies, matchType: 'partial' as const }] })),
  ]],
  [paths.snReview, [
    { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb4-017-02-2c6b646e', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb4-017-03-9f23073a', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-8-lb3-053-01-877a802c', add: [{ targetGoalId: ids.conductorFactors, matchType: 'partial' }] },
    { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-8-lb3-055-01-cb8f7101', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-8-lb3-056-01-02d6f9a5', add: [
      { targetGoalId: ids.householdSafety, matchType: 'partial' },
      { targetGoalId: ids.deviceRatings, matchType: 'partial' },
    ] },
    { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-8-lb4-058-01-ac94a954', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'sn-phys-seki-sn-klassenstufe-9-lb1-065-01-d5f010b8', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
  ]],
  [paths.stReview, [
    { sourceGoalId: 'st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-135-28d383fe', add: [{ targetGoalId: ids.thunderstormSafety, matchType: 'partial' }] },
    { sourceGoalId: 'st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-144-f956c47e', add: [{ targetGoalId: ids.thunderstormSafety, matchType: 'partial' }] },
    { sourceGoalId: 'st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-148-2792e40c', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'st-phys-seki-st-schuljahrgange-7-8-stromkreise-und-elektromagnetismus-228-3a402220', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'st-phys-seki-st-schuljahrgang-9-elektromagnetische-induktion-und-leitungsvorgange-252-d54d3f19', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
  ]],
  [paths.thReview, [
    { sourceGoalId: 'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-049-a770abe0', add: [{ targetGoalId: ids.conductorFactors, matchType: 'partial' }] },
    { sourceGoalId: 'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-052-7647d539', add: [{ targetGoalId: ids.ivCharacteristics, matchType: 'partial' }] },
    { sourceGoalId: 'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-058-4b3e32e6', add: [{ targetGoalId: ids.householdSafety, matchType: 'partial' }] },
    { sourceGoalId: 'th-phys-seki-th-2-2-1-elektromagnetische-wechselwirkungen-135-1167f2e8', add: [{ targetGoalId: ids.voltageSupplies, matchType: 'partial' }] },
  ]],
])

const physicsViewRoot = 'curricula/DE/Gymnasium/composition-views/physik'
const viewPaths = readdirSync(resolve(repoRoot, physicsViewRoot))
  .filter((fileName) => fileName.endsWith('.view.json'))
  .sort()
  .map((fileName) => `${physicsViewRoot}/${fileName}`)
  .filter((path) => [...splitParents].some((goalId) =>
    readFileSync(resolve(repoRoot, path), 'utf8').includes(goalId)))

function buildView(path: string): JsonRecord {
  const view = readJson(path)
  const hitCounts = new Map<string, number>()
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk)
    if (!value || typeof value !== 'object') return value
    const record = value as JsonRecord
    const transformed = Object.fromEntries(Object.entries(record).map(([key, nested]) => [key, walk(nested)])) as JsonRecord
    if (splitParents.has(record.goalId)) {
      if (!['goalEntry', 'canonicalSubtree'].includes(record.kind)) {
        throw new Error(`${path}: unsupported split-parent composition node kind ${record.kind}`)
      }
      hitCounts.set(record.goalId, (hitCounts.get(record.goalId) ?? 0) + 1)
      transformed.kind = 'canonicalSubtree'
    }
    return transformed
  }
  const result = walk(view) as JsonRecord
  if ((hitCounts.get(ids.safetyCluster) ?? 0) !== 1) throw new Error(`${path}: expected one safety-cluster reference`)
  const resistanceExpected = path.includes('/de-de-gym-') ? 2 : 1
  if ((hitCounts.get(ids.resistanceCluster) ?? 0) !== resistanceExpected) {
    throw new Error(`${path}: expected ${resistanceExpected} resistance-cluster reference(s)`)
  }
  const supplyExpected = path.includes('/de-by-') ? 0 : 1
  if ((hitCounts.get(ids.supplyCluster) ?? 0) !== supplyExpected) {
    throw new Error(`${path}: expected ${supplyExpected} supply-cluster reference(s)`)
  }
  return result
}

function buildCanonicalProvenance(): JsonRecord {
  const registry = readJson(paths.canonicalProvenance)
  const landscape = (registry.landscapes as JsonRecord[]).find(
    (candidate) => candidate.landscapeId === '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
  )
  if (!landscape?.goalProvenance) throw new Error('Missing canonical Physics provenance registry')
  const sourceLandscapes = {
    BW: '3f58b4cf-2b02-4ae0-bb0f-8d8ab6d7f4f1',
    BY: '42c2f7e3-91b4-5de8-bef0-d563440e9d52',
    HE: '996d097a-cac2-4b5f-979a-b3a0b9803265',
    HB: '6cf49ad5-537a-45ee-848c-b114fd3c57df',
    HH: 'cc3245a5-2980-4019-aa51-84904e073195',
    MV: '27da5587-bef3-49ad-9fec-3907253b85bd',
    SL: 'e5f66ad7-8f49-41f5-b8b2-52ab9a0ebcac',
    SN: 'd2e1fbb7-9e42-49a7-a07b-a7973156da12',
    ST: '3eedae6b-7e62-4e6e-a96c-78cd6df4c4aa',
    TH: '2b1b8596-f8c5-44ba-9dec-4cccb834769a',
  }
  const desired: Record<string, JsonRecord> = {
    [ids.householdSafety]: {
      sourceLandscapeId: sourceLandscapes.BW,
      sourceGoalId: 'bw-phys-seki-3-2-5-b11-a01-fe769b0d',
      additionalSourceLandscapeIds: [sourceLandscapes.BY, sourceLandscapes.HE, sourceLandscapes.HB, sourceLandscapes.HH, sourceLandscapes.MV, sourceLandscapes.SL, sourceLandscapes.SN, sourceLandscapes.ST, sourceLandscapes.TH],
    },
    [ids.thunderstormSafety]: {
      sourceLandscapeId: sourceLandscapes.HE,
      sourceGoalId: 'he-phys-seki-8-2-b03-a01-3fe0dc0a',
      additionalSourceLandscapeIds: [sourceLandscapes.HB, sourceLandscapes.ST],
    },
    [ids.ivCharacteristics]: {
      sourceLandscapeId: sourceLandscapes.BW,
      sourceGoalId: 'bw-phys-seki-3-3-2-b03-a01-53b2443a',
      additionalSourceLandscapeIds: [sourceLandscapes.BY, sourceLandscapes.HB, sourceLandscapes.HH, sourceLandscapes.MV, sourceLandscapes.SL, sourceLandscapes.SN, sourceLandscapes.ST, sourceLandscapes.TH],
    },
    [ids.conductorFactors]: {
      sourceLandscapeId: sourceLandscapes.BW,
      sourceGoalId: 'bw-phys-seki-3-3-2-b03-a01-53b2443a',
      additionalSourceLandscapeIds: [sourceLandscapes.SL, sourceLandscapes.SN, sourceLandscapes.TH],
    },
    [ids.voltageSupplies]: {
      sourceLandscapeId: sourceLandscapes.BW,
      sourceGoalId: 'bw-phys-seki-3-3-2-b07-a01-d740a1eb',
      additionalSourceLandscapeIds: [sourceLandscapes.HE, sourceLandscapes.MV, sourceLandscapes.SL, sourceLandscapes.TH],
    },
    [ids.deviceRatings]: {
      sourceLandscapeId: sourceLandscapes.BW,
      sourceGoalId: 'bw-phys-seki-3-3-2-b08-a01-201ffc0f',
      additionalSourceLandscapeIds: [sourceLandscapes.HE, sourceLandscapes.MV, sourceLandscapes.SN],
    },
  }
  for (const [goalId, provenance] of Object.entries(desired)) {
    const existing = landscape.goalProvenance[goalId]
    if (existing && stableJson(existing) !== stableJson(provenance)) {
      throw new Error(`Conflicting canonical provenance for Batch-015 child ${goalId}`)
    }
    landscape.goalProvenance[goalId] = provenance
  }
  return registry
}

const generatorPathsByReview = new Map<string, string>([
  [paths.bwReview, 'app/scripts/generateBwPhysicsSourceExtraction.ts'],
  [paths.byReview, 'app/scripts/generateByPhysicsSourceExtraction.ts'],
  [paths.heReview, 'app/scripts/generateHePhysicsSourceExtraction.ts'],
  [paths.hbReview, 'app/scripts/generateHbPhysicsLowerSourceExtraction.ts'],
  [paths.hhReview, 'app/scripts/generateHhPhysicsLowerSecondarySourceExtraction.ts'],
  [paths.mvReview, 'app/scripts/generateMvPhysicsSourceExtraction.ts'],
  [paths.slReview, 'app/scripts/generateSlPhysicsSourceExtraction.ts'],
  [paths.snReview, 'app/scripts/generateSnPhysicsSourceExtraction.ts'],
  [paths.stReview, 'app/scripts/generateStPhysicsSourceExtraction.ts'],
  [paths.thReview, 'app/scripts/generateThPhysicsSourceExtraction.ts'],
])
const generatorMarker = '// Batch 015 electricity structural split overlay'

const replaceTextRequired = (source: string, before: string, after: string, label: string): string => {
  if (source.includes(after)) return source
  const count = source.split(before).length - 1
  if (count !== 1) throw new Error(`${label}: expected one before-state occurrence, found ${count}`)
  return source.replace(before, after)
}

function buildStringGeneratorOverlay(path: string, rules: MappingRule[]): string {
  let source = readFileSync(resolve(repoRoot, path), 'utf8')
  if (source.includes(generatorMarker)) return source
  const additions = Object.fromEntries(rules
    .filter((rule) => (rule.add ?? []).length > 0)
    .map((rule) => [rule.sourceGoalId, (rule.add ?? []).map((entry) => entry.targetGoalId)]))
  const helper = `${generatorMarker}\nconst batch015SplitParentIds = new Set(${JSON.stringify([...splitParents])})\nconst batch015TargetsBySourceGoalId: Record<string, string[]> = ${JSON.stringify(additions, null, 2)}\nconst applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => [\n  ...new Set([\n    ...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId)),\n    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),\n  ]),\n]\n\n`
  const specifications: Record<string, { anchor: string; replacements: Array<[string, string]> }> = {
    'app/scripts/generateBwPhysicsSourceExtraction.ts': {
      anchor: 'function writeReview(config: ExtractionConfig, parsed: { sourceGoals: SourceGoal[] }): ReviewCoverage {',
      replacements: [[
        '    const canonicalGoalIds = targetLookup[sourceKey] ?? []',
        '    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, targetLookup[sourceKey] ?? [])',
      ]],
    },
    'app/scripts/generateHePhysicsSourceExtraction.ts': {
      anchor: 'function writeReview(config: ExtractionConfig, parsed: { sourceGoals: SourceGoal[] }): ReviewCoverage {',
      replacements: [[
        '    const targetIds = targetLookup[sourceKey] ?? []',
        '    const targetIds = applyPhysicsBatch015Targets(sourceGoal.id, targetLookup[sourceKey] ?? [])',
      ]],
    },
    'app/scripts/generateHbPhysicsLowerSourceExtraction.ts': {
      anchor: 'const mappings = rows.flatMap((currentRow, index) => {',
      replacements: [
        [
          'const mappings = rows.flatMap((currentRow, index) => {',
          'const resolvedRows = rows.map((currentRow, index) => ({\n  ...currentRow,\n  canonicalGoalIds: applyPhysicsBatch015Targets(sourceGoals[index].id, currentRow.canonicalGoalIds),\n}))\n\nconst mappings = resolvedRows.flatMap((currentRow, index) => {',
        ],
        ['const decisions = rows.map((currentRow, index) => {', 'const decisions = resolvedRows.map((currentRow, index) => {'],
      ],
    },
    'app/scripts/generateHhPhysicsLowerSecondarySourceExtraction.ts': {
      anchor: 'const mappings = rows.flatMap((currentRow, index) => {',
      replacements: [
        [
          'const mappings = rows.flatMap((currentRow, index) => {',
          'const resolvedRows = rows.map((currentRow, index) => ({\n  ...currentRow,\n  canonicalGoalIds: applyPhysicsBatch015Targets(sourceGoals[index].id, currentRow.canonicalGoalIds),\n}))\n\nconst mappings = resolvedRows.flatMap((currentRow, index) => {',
        ],
        ['const decisions = rows.map((currentRow, index) => {', 'const decisions = resolvedRows.map((currentRow, index) => {'],
      ],
    },
    'app/scripts/generateMvPhysicsSourceExtraction.ts': {
      anchor: 'const configs: ExtractionConfig[] = [',
      replacements: [[
        '    const canonicalGoalIds = currentWaveTargetsBySourceGoalId[sourceGoal.id]\n      ?? inferCanonicalGoalIds(rows[index], config)',
        '    const canonicalGoalIds = applyPhysicsBatch015Targets(\n      sourceGoal.id,\n      currentWaveTargetsBySourceGoalId[sourceGoal.id] ?? inferCanonicalGoalIds(rows[index], config),\n    )',
      ]],
    },
    'app/scripts/generateSlPhysicsSourceExtraction.ts': {
      anchor: 'const configs: ExtractionConfig[] = [',
      replacements: [[
        '    const canonicalGoalIds = inferCanonicalGoalIds(sourceGoal, config)',
        '    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config))',
      ]],
    },
    'app/scripts/generateSnPhysicsSourceExtraction.ts': {
      anchor: 'const configs: ExtractionConfig[] = [',
      replacements: [[
        '    const canonicalGoalIds = inferCanonicalGoalIds(sourceGoal, config.stage)',
        '    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config.stage))',
      ]],
    },
    'app/scripts/generateStPhysicsSourceExtraction.ts': {
      anchor: 'const configs: ExtractionConfig[] = [',
      replacements: [[
        '    const canonicalGoalIds = inferCanonicalGoalIds(sourceGoal, config.stage)',
        '    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config.stage))',
      ]],
    },
    'app/scripts/generateThPhysicsSourceExtraction.ts': {
      anchor: 'const configs: ExtractionConfig[] = [',
      replacements: [[
        '    const canonicalGoalIds = inferCanonicalGoalIds(sourceGoal, config.stage)',
        '    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config.stage))',
      ]],
    },
  }
  const spec = specifications[path]
  if (!spec) throw new Error(`Missing string generator overlay specification for ${path}`)
  if (!source.includes(spec.anchor)) throw new Error(`${path}: missing generator overlay anchor`)
  source = source.replace(spec.anchor, `${helper}${spec.anchor}`)
  for (const [before, after] of spec.replacements) source = replaceTextRequired(source, before, after, path)
  return source
}

function buildByGeneratorOverlay(path: string, rules: MappingRule[]): string {
  let source = readFileSync(resolve(repoRoot, path), 'utf8')
  if (source.includes(generatorMarker)) return source
  const additions = Object.fromEntries(rules
    .filter((rule) => (rule.add ?? []).length > 0)
    .map((rule) => [rule.sourceGoalId, rule.add]))
  const helper = `${generatorMarker}\nconst batch015SplitParentIds = new Set(${JSON.stringify([...splitParents])})\nconst batch015TargetsBySourceGoalId: Record<string, Array<{ targetGoalId: string; matchType: 'exact' | 'partial' }>> = ${JSON.stringify(additions, null, 2)}\nconst applyPhysicsBatch015Targets = (\n  sourceGoalId: string,\n  targets: Array<{ canonicalGoalId: string; matchType: string }>,\n): Array<{ canonicalGoalId: string; matchType: string }> => {\n  const retained = targets.filter((target) => !batch015SplitParentIds.has(target.canonicalGoalId))\n  for (const addition of batch015TargetsBySourceGoalId[sourceGoalId] ?? []) {\n    const existing = retained.find((target) => target.canonicalGoalId === addition.targetGoalId)\n    if (existing) existing.matchType = addition.matchType\n    else retained.push({ canonicalGoalId: addition.targetGoalId, matchType: addition.matchType })\n  }\n  return retained\n}\n\n`
  const anchor = 'function writeReviewSeed(parsed: { sourceGoals: SourceGoal[] }, sourceLandscapeId: string): void {'
  if (!source.includes(anchor)) throw new Error(`${path}: missing BY generator overlay anchor`)
  source = source.replace(anchor, `${helper}${anchor}`)
  source = replaceTextRequired(
    source,
    '      const targets = canonicalTargetsBySourceGoalId.get(sourceGoal.id) ?? []',
    '      const targets = applyPhysicsBatch015Targets(\n        sourceGoal.id,\n        canonicalTargetsBySourceGoalId.get(sourceGoal.id) ?? [],\n      )',
    path,
  )
  return source
}

function assertSurrogateHistory(): void {
  const registry = readJson(paths.surrogate)
  const relevant = (registry.entries as JsonRecord[]).filter((entry) =>
    splitParents.has(entry.goalId) || splitParents.has(entry.requiredByGoalId))
  const retainedHistory = relevant.filter((entry) =>
    entry.goalId === ids.supplyCluster
    && entry.jurisdiction === 'DE-BY'
    && entry.status === 'stale')
  if (relevant.length !== 1 || retainedHistory.length !== 1) {
    throw new Error('Unexpected active or additional Batch-015 surrogate evidence; stale BY supply history must remain unchanged')
  }
}

const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildLeafReviewLedger(canonical, paths.atomicity, 'semantic-atomicity-v1')
const memory = buildLeafReviewLedger(canonical, paths.memory, 'memory-card-review-v1')
const atlas = readJson(paths.atlas)
if (![441, 444].includes(atlas.expectedCurricularAtomicGoalCount)) {
  throw new Error(`Unexpected Physics atlas denominator ${atlas.expectedCurricularAtomicGoalCount}`)
}
atlas.expectedCurricularAtomicGoalCount = 444

const mappings = new Map<string, JsonRecord>()
for (const [path, rules] of mappingRules) mappings.set(path, buildReviewedMapping(path, rules))
mappings.set(paths.heLegacy, buildHeLegacyMapping())

if (viewPaths.length !== 35) throw new Error(`Expected 35 Physics composition views, found ${viewPaths.length}`)
const views = new Map(viewPaths.map((path) => [path, buildView(path)]))
const canonicalProvenance = buildCanonicalProvenance()
assertSurrogateHistory()

const generatorSources = new Map<string, string>()
for (const [reviewPath, generatorPath] of generatorPathsByReview) {
  const rules = mappingRules.get(reviewPath)
  if (!rules) throw new Error(`Missing mapping rules for generator ${generatorPath}`)
  generatorSources.set(
    generatorPath,
    generatorPath === 'app/scripts/generateByPhysicsSourceExtraction.ts'
      ? buildByGeneratorOverlay(generatorPath, rules)
      : buildStringGeneratorOverlay(generatorPath, rules),
  )
}

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.atlas, atlas)
  for (const [path, value] of mappings) writeJson(path, value)
  for (const [path, value] of views) writeJson(path, value)
  writeJson(paths.canonicalProvenance, canonicalProvenance)
  for (const [path, source] of generatorSources) writeFileSync(resolve(repoRoot, path), source)
}

console.log(
  `CHECK apply_physics_batch_015_electricity_structural_split ${writeMode ? 'WRITE' : 'PASS'} `
  + `clusters=3 children=6 views=${views.size} mappings=${mappings.size} generators=${generatorSources.size} `
  + `total=${semanticKinds.counts.total} curricularAtomic=${semanticKinds.counts.curricularAtomic} `
  + `curricularArea=${semanticKinds.counts.curricularArea} practiceAssessment=${semanticKinds.counts.practiceAssessment}`,
)
console.log('PRESERVE parent-resource-links=unchanged parent-nbp-overview-assets=byte-untouched')
console.log('DEFER child-visualizations=Nano-Banana-Pro-only no-placeholder-assets-created')
