import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const compositionRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/mathematik')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  sourceEdgeAdjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/'
    + 'batch-003b-j6-structural-splits/source-edge-adjudication.json',
} as const

const ids = {
  volumeSurfaceCluster: '1f89d69e-ead1-424b-8221-fae37fdea2bc',
  cuboidVolume: '99ef0fc2-150a-51e8-bac8-7e40e46917b',
  cuboidSurface: 'cddcdabd-ad58-58ad-bfbd-d9fd8fe2d8fa',
  reflectionsCluster: '1335dff9-db1e-5dd6-aa55-3938b6d3b0ec',
  axisReflection: '2f3d24e7-2450-55d8-97c2-3e106d2854c6',
  pointReflection: '50e4ecab-d462-5496-b493-b30d699eb100',
  representationsCluster: '59098969-0a35-5a58-94f2-1cfcdf191cf5',
  nets: 'f52e9d72-4995-5c80-91d2-7761ea0cbec0',
  obliqueViews: '6bb52f96-6320-5a34-afb0-db9b471dd4ac',
  orthographicViews: 'bce2c2cb-5594-5c19-8ae7-bd8c5e1ada82',
  areaFormula: '87c55be5-06a9-41e2-a0d4-c60f7c8b8078',
  cuboidVolumeFormula: 'b44f038c-fb1f-527e-b9ad-382214d0328a',
  convertVolumeUnits: '57fbbf31-9b8c-5408-9af5-fbc73acd12bb',
  classifySolids: 'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6',
  spatialModels: 'd98849c7-bd0b-50d4-90aa-6293a3adb211',
  lineGeometry: '2231c29b-eb4e-51ae-9cb1-eb033bf16099',
  coordinates: '2331caf2-ccb2-5492-9fc6-48763b848bae',
  orientation: '65365dce-f33f-49d8-9516-42f75883aa86',
} as const

const splitParentIds = [
  ids.volumeSurfaceCluster,
  ids.reflectionsCluster,
  ids.representationsCluster,
] as const

type ChildSpec = {
  parentId: string
  id: string
  shortKey: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  requires: string[]
  atomicityReason: string
  memoryReason: string
}

const childSpecs: ChildSpec[] = [
  {
    parentId: ids.volumeSurfaceCluster,
    id: ids.cuboidVolume,
    shortKey: 'canonical_math_sek1_j6_calculate_cuboid_cube_volumes',
    title: 'Volumina von Quadern und Würfeln berechnen',
    titleEn: 'Calculate volumes of cuboids and cubes',
    description:
      'Die lernende Person kann die Volumina von Quadern und Würfeln aus ihren Kantenlängen berechnen, passende Volumeneinheiten verwenden und Ergebnisse an Modellen oder in Sachsituationen prüfen.',
    descriptionEn:
      'The learner can calculate the volumes of cuboids and cubes from their edge lengths, use appropriate units of volume, and check the results against models or in contextual situations.',
    requires: [ids.cuboidVolumeFormula, ids.convertVolumeUnits],
    atomicityReason:
      'Volumen berechnen, eine passende Volumeneinheit verwenden und das Ergebnis prüfen sind zusammengehörige Ausführungsschritte derselben Quader- und Würfelvolumen-Kompetenz.',
    memoryReason:
      'Das Ziel wird durch räumliches Verständnis, Berechnen, Einheitenkontrolle und Ergebnisprüfung aufgebaut; ein separates Memory-Deck ist dafür nicht erforderlich.',
  },
  {
    parentId: ids.volumeSurfaceCluster,
    id: ids.cuboidSurface,
    shortKey: 'canonical_math_sek1_j6_calculate_cuboid_cube_surface_areas',
    title: 'Oberflächeninhalte von Quadern und Würfeln berechnen',
    titleEn: 'Calculate surface areas of cuboids and cubes',
    description:
      'Die lernende Person kann die Oberflächeninhalte von Quadern und Würfeln aus den Flächeninhalten ihrer Seitenflächen berechnen, passende Flächeneinheiten verwenden und Ergebnisse an Modellen oder in Sachsituationen prüfen.',
    descriptionEn:
      'The learner can calculate the surface areas of cuboids and cubes from the areas of their faces, use appropriate units of area, and check the results against models or in contextual situations.',
    requires: [ids.areaFormula, ids.classifySolids],
    atomicityReason:
      'Seitenflächen zu einer Oberfläche zusammenzuführen, eine passende Flächeneinheit zu verwenden und das Ergebnis zu prüfen bildet eine einzelne Oberflächen-Kompetenz.',
    memoryReason:
      'Die Oberflächenberechnung verlangt das Verknüpfen räumlicher und ebener Vorstellungen; ein separates Memory-Deck ist dafür nicht erforderlich.',
  },
  {
    parentId: ids.reflectionsCluster,
    id: ids.axisReflection,
    shortKey: 'canonical_math_sek1_j6_perform_axis_reflections',
    title: 'Achsenspiegelungen durchführen',
    titleEn: 'Perform reflections across a line',
    description:
      'Die lernende Person kann Figuren oder Punkte an einer Geraden spiegeln, indem sie zugehörige Bildpunkte auf dem Lot in gleichem Abstand zur Spiegelachse sorgfältig konstruiert.',
    descriptionEn:
      'The learner can reflect figures or points across a line by carefully constructing each corresponding image point on the perpendicular at the same distance from the mirror line.',
    requires: [ids.lineGeometry, ids.coordinates, ids.orientation],
    atomicityReason:
      'Das sorgfältige Konstruieren von Bildpunkten mit Lot- und Abstandseigenschaft ist eine einzelne, eigenständig prüfbare Achsenspiegelungs-Kompetenz.',
    memoryReason:
      'Die Achsenspiegelung wird durch Konstruktion und Begründung der geometrischen Eigenschaften gelernt; ein separates Memory-Deck ist nicht erforderlich.',
  },
  {
    parentId: ids.reflectionsCluster,
    id: ids.pointReflection,
    shortKey: 'canonical_math_sek1_j6_perform_point_reflections',
    title: 'Punktspiegelungen durchführen',
    titleEn: 'Perform point reflections',
    description:
      'Die lernende Person kann Figuren oder Punkte an einem Punkt spiegeln, indem sie das Spiegelzentrum als Mittelpunkt zwischen jedem Ausgangs- und Bildpunkt sorgfältig konstruiert.',
    descriptionEn:
      'The learner can reflect figures or points across a point by carefully constructing the centre of reflection as the midpoint between each original point and its image.',
    requires: [ids.coordinates, ids.orientation],
    atomicityReason:
      'Das sorgfältige Konstruieren von Bildpunkten mit der Mittelpunktseigenschaft ist eine einzelne, eigenständig prüfbare Punktspiegelungs-Kompetenz.',
    memoryReason:
      'Die Punktspiegelung wird durch Konstruktion und Begründung der Mittelpunktseigenschaft gelernt; ein separates Memory-Deck ist nicht erforderlich.',
  },
  {
    parentId: ids.representationsCluster,
    id: ids.nets,
    shortKey: 'canonical_math_sek1_j6_draw_cuboid_cube_nets',
    title: 'Netze von Quadern und Würfeln zeichnen',
    titleEn: 'Draw nets of cuboids and cubes',
    description:
      'Die lernende Person kann aus den Seitenflächen eines Quaders oder Würfels ein vollständiges, zusammenhängendes Netz zeichnen und prüfen, ob es sich zum Körper falten lässt.',
    descriptionEn:
      'The learner can draw a complete, connected net from the faces of a cuboid or cube and check whether it can be folded to form the solid.',
    requires: [ids.classifySolids, ids.spatialModels, ids.orientation],
    atomicityReason:
      'Ein vollständiges Körpernetz zu zeichnen und durch gedankliches Falten zu prüfen ist eine einzelne Darstellungs-Kompetenz.',
    memoryReason:
      'Körpernetze werden über räumliches Vorstellen, Zeichnen und Faltprüfung verstanden; ein separates Memory-Deck ist nicht erforderlich.',
  },
  {
    parentId: ids.representationsCluster,
    id: ids.obliqueViews,
    shortKey: 'canonical_math_sek1_j6_draw_cuboid_cube_oblique_views',
    title: 'Schrägbilder von Quadern und Würfeln zeichnen',
    titleEn: 'Draw oblique views of cuboids and cubes',
    description:
      'Die lernende Person kann Quader und Würfel als Schrägbilder mit zueinander passenden Kantenrichtungen und sichtbaren beziehungsweise verdeckten Kanten zeichnen.',
    descriptionEn:
      'The learner can draw cuboids and cubes as oblique views with consistent edge directions and visible or hidden edges.',
    requires: [ids.classifySolids, ids.spatialModels, ids.orientation],
    atomicityReason:
      'Ein räumlich konsistentes Schrägbild mit sichtbaren und verdeckten Kanten zu zeichnen ist eine einzelne Darstellungs-Kompetenz.',
    memoryReason:
      'Schrägbilder werden durch räumliches Vorstellen und regelgeleitetes Zeichnen aufgebaut; ein separates Memory-Deck ist nicht erforderlich.',
  },
  {
    parentId: ids.representationsCluster,
    id: ids.orthographicViews,
    shortKey: 'canonical_math_sek1_j6_draw_cuboid_cube_orthographic_views',
    title: 'Grund-, Auf- und Seitenrisse von Quadern und Würfeln zeichnen',
    titleEn: 'Draw top, front, and side views of cuboids and cubes',
    description:
      'Die lernende Person kann zu einem Quader oder Würfel passende Grund-, Auf- und Seitenrisse zeichnen und die sichtbaren Abmessungen den räumlichen Kanten zuordnen.',
    descriptionEn:
      "The learner can draw matching top, front, and side views of a cuboid or cube and relate the visible dimensions to the solid's spatial edges.",
    requires: [ids.classifySolids, ids.spatialModels, ids.orientation],
    atomicityReason:
      'Zusammengehörige orthogonale Ansichten zu zeichnen und ihre Abmessungen den Körperkanten zuzuordnen ist eine einzelne Darstellungs-Kompetenz.',
    memoryReason:
      'Orthogonale Ansichten werden durch Darstellungswechsel und räumliches Zuordnen verstanden; ein separates Memory-Deck ist nicht erforderlich.',
  },
]

const childIdsByParent = new Map(
  splitParentIds.map((parentId) => [
    parentId,
    childSpecs.filter((spec) => spec.parentId === parentId).map((spec) => spec.id),
  ]),
)
const childIds = childSpecs.map((spec) => spec.id)

const expectedSourceEdgeCounts: Record<string, number> = {
  [ids.volumeSurfaceCluster]: 150,
  [ids.reflectionsCluster]: 3,
  [ids.representationsCluster]: 6,
}

// These are the current semantic bytes of the 17 non-structural goals in the
// reviewed batch. The split routine is not allowed to turn into a wording pass.
const protectedBatch003TextFingerprints: Record<string, string> = {
  'ee48e811-4c9c-5080-9836-8403fc9f0810': 'sha256:e1f847741423ed007b168ca0aa4a99e39e4d654c34347411392147a0262d947f',
  '26f668a0-6425-5466-9cf7-6295dd189005': 'sha256:9170a76c04840750038e3a028f3b8c7e9c8e888062fc16cd28cc6e49baba3e6e',
  '0a6dab2e-1bbb-5587-adb0-456d3991c327': 'sha256:6f55bfcd914ade4f1c8ca326431e5fff7387acdc4970ceda4108cf7bca6a9e2d',
  '05012547-7263-5bfa-9e7c-df970745a011': 'sha256:15f7867ee1b7b5e4d69d76a982e6bd06a2bc1ca3c2ee7a5f79ea32e8bdc11dbe',
  'b41cb496-dad5-596e-9c23-cdcbdab3ec2e': 'sha256:c9bdaedc76cc606a9fb03559f06d7c77e12a6462496ded41c54c396841030fc7',
  '491e0858-e977-516e-a339-1cc2f9e9690f': 'sha256:4cd7a58f03ff2669dfb747b679b023603c5b350d986ee1151557fd772c135cd8',
  '87c55be5-06a9-41e2-a0d4-c60f7c8b8078': 'sha256:57f4be297eebca4abafba0f23a44ff8011988d089b98002b39369d65ee6ced13',
  'b44f038c-fb1f-527e-b9ad-382214d0328a': 'sha256:65d152328e6ed9c22f56241f40cf772bff92310a8e23b6e5ece2c990f84cf78c',
  '57fbbf31-9b8c-5408-9af5-fbc73acd12bb': 'sha256:ed98304f9ed7bfa10e58e900321bbf9169ec6b4d9455764e869a6cf82be24144',
  '71d43fcc-d787-4874-ae4a-2336364e9c0a': 'sha256:e54c7b658a99dfdec6458e3111a63ca302d5a3e47280a1d8d2da929cfe3adc9c',
  '72b6bfa5-8e34-4029-8f85-0277207c485e': 'sha256:e76fbc94b394d7fd509c0946b9107f5d8d42d8bdc52ec1fb28e2bc88880837a8',
  '91571d3f-3651-4477-ba21-320fc4077453': 'sha256:caa6d67873d4c5093e792e295745fa0c4bd129bd04d72f35e910c4c0d9d3fc78',
  'acbb7e26-f85f-405b-a3e5-affa6add6711': 'sha256:6e78d5ee249934a0005a42cabaf4265767b26422a33f7461799895e82091ba31',
  '15505229-efec-4d01-8e71-acf15f9c2424': 'sha256:86ea8b6512fd9347a8af4e787a13d6d48e8d314afb972eec35d321e74dc39729',
  '8a691345-3216-522c-a898-d65e8e94db28': 'sha256:ed40ef9e781a6df0b3208ca80afb62cb72c32c9a580b7ad80be8c2953ab982d8',
  'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6': 'sha256:431ea6d50b27f6f9b7b86a076768a4e5e473e6e308fde800b3db8892c3d3d60e',
  '11c88ea2-8502-5008-bec2-3e491c75ace4': 'sha256:b6f55713e7e67dfe95ca783311c98e04de35307455d6e0f474469914383607ff',
}

const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord

const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(resolve(repoRoot, path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonRecord)

const writeJson = (path: string, value: unknown): void => {
  writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
}

const writeJsonAbsolute = (path: string, value: unknown): void => {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

const writeJsonl = (path: string, records: JsonRecord[]): void => {
  writeFileSync(resolve(repoRoot, path), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
}

const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const digest = (value: unknown): string =>
  `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`

const textFingerprint = (goal: JsonRecord): string => digest({
  id: goal.id,
  shortKey: goal.shortKey ?? '',
  title: goal.title,
  titleEn: goal.titleEn,
  description: goal.description,
  descriptionEn: goal.descriptionEn,
})

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

const equalStringArrays = (left: unknown, right: string[]): boolean =>
  Array.isArray(left)
  && left.length === right.length
  && left.every((value, index) => value === right[index])

function validateSourceEdgeAdjudication(): JsonRecord {
  const absolutePath = resolve(repoRoot, paths.sourceEdgeAdjudication)
  if (!existsSync(absolutePath)) {
    throw new Error(
      `Required source-edge adjudication is missing: ${paths.sourceEdgeAdjudication}. `
      + 'No structural split may proceed before every mapping edge is adjudicated.',
    )
  }
  const adjudication = readJson(paths.sourceEdgeAdjudication)
  if (adjudication.schemaVersion !== 1) {
    throw new Error(`Unsupported source-edge adjudication schemaVersion ${String(adjudication.schemaVersion)}`)
  }
  if (!Array.isArray(adjudication.sourceMappingEdges)) {
    throw new Error('source-edge adjudication must contain sourceMappingEdges[]')
  }
  const edges = adjudication.sourceMappingEdges as JsonRecord[]
  const expectedTotal = Object.values(expectedSourceEdgeCounts).reduce((sum, count) => sum + count, 0)
  if (edges.length !== expectedTotal) {
    throw new Error(`sourceMappingEdges has ${edges.length} records, expected ${expectedTotal}`)
  }

  const seenEdgeKeys = new Set<string>()
  const actualCounts: Record<string, number> = Object.fromEntries(
    splitParentIds.map((parentId) => [parentId, 0]),
  )
  for (const [index, edge] of edges.entries()) {
    const label = `sourceMappingEdges[${index}]`
    const requiredStrings = [
      'edgeKey',
      'path',
      'mappingPointer',
      'sourceGoalId',
      'oldCanonicalGoalId',
      'originalMatchType',
      'classification',
      'action',
      'rationaleDe',
      'confidence',
    ]
    for (const field of requiredStrings) {
      if (typeof edge[field] !== 'string' || edge[field].trim() === '') {
        throw new Error(`${label}.${field} must be a non-empty string`)
      }
    }
    if (edge.edgeKey !== `${edge.path}#${edge.mappingPointer}`) {
      throw new Error(`${label}.edgeKey is not bound to path and mappingPointer`)
    }
    if (!/^\/mappings\/\d+$/u.test(edge.mappingPointer)) {
      throw new Error(`${label}.mappingPointer must address one mappings[] record`)
    }
    if (seenEdgeKeys.has(edge.edgeKey)) throw new Error(`Duplicate source mapping edge ${edge.edgeKey}`)
    seenEdgeKeys.add(edge.edgeKey)

    const oldId = edge.oldCanonicalGoalId as string
    const allowedChildren = new Set(childIdsByParent.get(oldId) ?? [])
    if (allowedChildren.size === 0) throw new Error(`${label} has out-of-scope oldCanonicalGoalId ${oldId}`)
    actualCounts[oldId] += 1
    if (!Array.isArray(edge.selectedChildGoalIds)) {
      throw new Error(`${label}.selectedChildGoalIds must be an array`)
    }
    if (new Set(edge.selectedChildGoalIds).size !== edge.selectedChildGoalIds.length) {
      throw new Error(`${label}.selectedChildGoalIds contains duplicates`)
    }
    for (const childId of edge.selectedChildGoalIds) {
      if (!allowedChildren.has(childId)) {
        throw new Error(`${label} selects child ${String(childId)} outside parent ${oldId}`)
      }
    }
    const removesEdge = /remove/u.test(edge.action) || edge.classification === 'remove_no_child'
    if (removesEdge !== (edge.selectedChildGoalIds.length === 0)) {
      throw new Error(`${label} has inconsistent removal action and selectedChildGoalIds`)
    }
  }

  const completeness = adjudication.completeness as JsonRecord | undefined
  if (!completeness || completeness.sourceMappingEdgeCount !== expectedTotal) {
    throw new Error(`completeness.sourceMappingEdgeCount must be ${expectedTotal}`)
  }
  if (!completeness.byOldGoalId || typeof completeness.byOldGoalId !== 'object') {
    throw new Error('completeness.byOldGoalId is required')
  }
  for (const parentId of splitParentIds) {
    const expected = expectedSourceEdgeCounts[parentId]
    const reportedValue = completeness.byOldGoalId[parentId]
    const reported = typeof reportedValue === 'number' ? reportedValue : reportedValue?.count
    if (actualCounts[parentId] !== expected || reported !== expected) {
      throw new Error(
        `Incomplete source-edge matrix for ${parentId}: actual=${actualCounts[parentId]} reported=${String(reported)} expected=${expected}`,
      )
    }
  }
  const openUncertainties = completeness.openUncertainties ?? completeness.unresolved
  if (Array.isArray(openUncertainties) && openUncertainties.length > 0) {
    throw new Error(`source-edge adjudication still has ${openUncertainties.length} open uncertainties`)
  }

  for (const sectionName of [
    'canonicalGraphReferences',
    'compositionViewReferences',
    'assessmentReferences',
    'derivedAndHistoricalReferences',
  ]) {
    const section = adjudication[sectionName]
    if (!Array.isArray(section)) throw new Error(`source-edge adjudication must contain ${sectionName}[]`)
    for (const [index, reference] of section.entries()) {
      if (!reference || typeof reference !== 'object') {
        throw new Error(`${sectionName}[${index}] must be an object`)
      }
      const serialized = stableJson(reference)
      if (/unadjudicated|unresolved|todo|pending/iu.test(serialized)) {
        throw new Error(`${sectionName}[${index}] is not finally adjudicated`)
      }
    }
  }
  return adjudication
}

type Rewire = {
  goalId: string
  field: 'requires' | 'coveredGoalIds'
  before: string[]
  after: string[]
}

const canonicalRewires: Rewire[] = [
  {
    goalId: '2345ae25-5805-4c72-b830-32e63cc6262a',
    field: 'requires',
    before: ['ca623958-c204-5d1b-bdd0-3f76765674cb', ids.volumeSurfaceCluster, ids.orientation],
    after: ['ca623958-c204-5d1b-bdd0-3f76765674cb', ids.cuboidVolume, ids.orientation],
  },
  {
    goalId: '3d49cd27-3a84-50eb-ac35-f0b0bee80df2',
    field: 'requires',
    before: ['d6c3fb37-ece6-5b56-9221-1eeb21845877', ids.areaFormula, ids.volumeSurfaceCluster, ids.orientation],
    after: ['d6c3fb37-ece6-5b56-9221-1eeb21845877', ids.areaFormula, ids.cuboidVolume, ids.orientation],
  },
  {
    goalId: '415bd48b-8a76-4d4f-bfdd-d085573e7ac3',
    field: 'requires',
    before: [
      '491e0858-e977-516e-a339-1cc2f9e9690f', ids.areaFormula, ids.cuboidVolumeFormula,
      ids.convertVolumeUnits, ids.volumeSurfaceCluster, ids.lineGeometry,
      'f0a49da2-018b-4cda-adbd-27047b610a0f', ids.orientation,
    ],
    after: [
      '491e0858-e977-516e-a339-1cc2f9e9690f', ids.areaFormula, ids.cuboidVolumeFormula,
      ids.convertVolumeUnits, ids.cuboidVolume, ids.lineGeometry,
      'f0a49da2-018b-4cda-adbd-27047b610a0f', ids.orientation,
    ],
  },
  {
    goalId: 'f65ab452-1884-57b0-9be3-c7d9e4944891',
    field: 'requires',
    before: [
      '491e0858-e977-516e-a339-1cc2f9e9690f', ids.areaFormula, ids.cuboidVolumeFormula,
      ids.convertVolumeUnits, ids.volumeSurfaceCluster, ids.lineGeometry,
      'f0a49da2-018b-4cda-adbd-27047b610a0f', ids.orientation,
    ],
    after: [
      '491e0858-e977-516e-a339-1cc2f9e9690f', ids.areaFormula, ids.cuboidVolumeFormula,
      ids.convertVolumeUnits, ids.lineGeometry,
      'f0a49da2-018b-4cda-adbd-27047b610a0f', ids.orientation,
    ],
  },
  {
    goalId: '974edafb-ea7b-588e-b88a-547e7a097c70',
    field: 'requires',
    before: [ids.classifySolids, ids.representationsCluster, '11c88ea2-8502-5008-bec2-3e491c75ace4', ids.cuboidVolumeFormula, ids.volumeSurfaceCluster],
    after: [ids.classifySolids, '11c88ea2-8502-5008-bec2-3e491c75ace4', ids.cuboidVolumeFormula, ids.cuboidVolume, ids.cuboidSurface],
  },
  {
    goalId: '974edafb-ea7b-588e-b88a-547e7a097c70',
    field: 'coveredGoalIds',
    before: [ids.classifySolids, ids.representationsCluster, '11c88ea2-8502-5008-bec2-3e491c75ace4', ids.cuboidVolumeFormula, ids.volumeSurfaceCluster],
    after: [ids.classifySolids, '11c88ea2-8502-5008-bec2-3e491c75ace4', ids.cuboidVolumeFormula, ids.cuboidVolume, ids.cuboidSurface],
  },
  {
    goalId: '47c515c9-2174-58c7-a844-6865fc67c243',
    field: 'requires',
    before: [
      '8a691345-3216-522c-a898-d65e8e94db28', '71d43fcc-d787-4874-ae4a-2336364e9c0a',
      '72b6bfa5-8e34-4029-8f85-0277207c485e', '0c2ddfcd-1399-41ad-aaed-4f061812602a',
      'acbb7e26-f85f-405b-a3e5-affa6add6711', ids.reflectionsCluster,
      '8cb18560-3a2b-593e-b634-9d768566cba9',
    ],
    after: [
      '8a691345-3216-522c-a898-d65e8e94db28', '71d43fcc-d787-4874-ae4a-2336364e9c0a',
      '72b6bfa5-8e34-4029-8f85-0277207c485e', '0c2ddfcd-1399-41ad-aaed-4f061812602a',
      'acbb7e26-f85f-405b-a3e5-affa6add6711', ids.axisReflection,
      '8cb18560-3a2b-593e-b634-9d768566cba9',
    ],
  },
  {
    goalId: '47c515c9-2174-58c7-a844-6865fc67c243',
    field: 'coveredGoalIds',
    before: [
      '8a691345-3216-522c-a898-d65e8e94db28', '71d43fcc-d787-4874-ae4a-2336364e9c0a',
      '72b6bfa5-8e34-4029-8f85-0277207c485e', '0c2ddfcd-1399-41ad-aaed-4f061812602a',
      'acbb7e26-f85f-405b-a3e5-affa6add6711', ids.reflectionsCluster,
      '8cb18560-3a2b-593e-b634-9d768566cba9',
    ],
    after: [
      '8a691345-3216-522c-a898-d65e8e94db28', '71d43fcc-d787-4874-ae4a-2336364e9c0a',
      '72b6bfa5-8e34-4029-8f85-0277207c485e', '0c2ddfcd-1399-41ad-aaed-4f061812602a',
      'acbb7e26-f85f-405b-a3e5-affa6add6711', ids.axisReflection,
      '8cb18560-3a2b-593e-b634-9d768566cba9',
    ],
  },
  {
    goalId: '11c88ea2-8502-5008-bec2-3e491c75ace4',
    field: 'requires',
    before: [ids.classifySolids, ids.representationsCluster, ids.orientation],
    after: [ids.classifySolids, ids.nets, ids.obliqueViews, ids.orientation],
  },
]

function assertProtectedBatchTexts(goalById: Map<string, JsonRecord>): void {
  for (const [goalId, expected] of Object.entries(protectedBatch003TextFingerprints)) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`Missing protected Batch-003 goal ${goalId}`)
    const actual = textFingerprint(goal)
    if (actual !== expected) {
      throw new Error(`Protected Batch-003 text drift for ${goalId}: ${actual} != ${expected}`)
    }
  }
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [goal.id, goal]))
  if (byId.size !== goals.length) throw new Error('Canonical landscape contains duplicate goal IDs')
  assertProtectedBatchTexts(byId)

  for (const parentId of splitParentIds) {
    const parent = byId.get(parentId)
    if (!parent) throw new Error(`Missing split parent ${parentId}`)
    const expectedChildren = childIdsByParent.get(parentId)!
    const isBefore = equalStringArrays(parent.contains, []) && parent.type === 'atomic'
    const isAfter = equalStringArrays(parent.contains, expectedChildren) && parent.type === 'cluster'
    if (!isBefore && !isAfter) throw new Error(`Split parent ${parentId} is neither in reviewed before nor exact after state`)
    parent.type = 'cluster'
    parent.weight = expectedChildren.length
    parent.requires = []
    parent.contains = [...expectedChildren]
    parent.resourceLinks = []
    delete parent.semanticAtomic
  }

  for (const spec of childSpecs) {
    const parent = byId.get(spec.parentId)!
    const expectedGoal: JsonRecord = {
      id: spec.id,
      shortKey: spec.shortKey,
      title: spec.title,
      titleEn: spec.titleEn,
      description: spec.description,
      descriptionEn: spec.descriptionEn,
      core: parent.core,
      weight: 1,
      tags: structuredClone(parent.tags ?? []),
      dimensionTags: structuredClone(parent.dimensionTags),
      contains: [],
      requires: [...spec.requires],
      applicability: structuredClone(parent.applicability),
      type: 'atomic',
      semanticAtomic: true,
      resourceLinks: [],
    }
    const existing = byId.get(spec.id)
    if (existing && stableJson(existing) !== stableJson(expectedGoal)) {
      throw new Error(`Existing split child ${spec.id} differs from the reviewed exact specification`)
    }
    byId.set(spec.id, existing ?? expectedGoal)
  }

  for (const childId of childIds) {
    const index = goals.findIndex((goal) => goal.id === childId)
    if (index >= 0) goals.splice(index, 1)
  }
  for (const parentId of splitParentIds) {
    const parentIndex = goals.findIndex((goal) => goal.id === parentId)
    if (parentIndex < 0) throw new Error(`Missing insertion parent ${parentId}`)
    const children = childSpecs.filter((spec) => spec.parentId === parentId).map((spec) => byId.get(spec.id)!)
    goals.splice(parentIndex + 1, 0, ...children)
  }

  for (const rewire of canonicalRewires) {
    const goal = byId.get(rewire.goalId)
    if (!goal) throw new Error(`Missing canonical rewire source ${rewire.goalId}`)
    const actual = rewire.field === 'requires' ? goal.requires : goal.examData?.coveredGoalIds
    if (equalStringArrays(actual, rewire.before)) {
      if (rewire.field === 'requires') goal.requires = [...rewire.after]
      else goal.examData.coveredGoalIds = [...rewire.after]
    } else if (!equalStringArrays(actual, rewire.after)) {
      throw new Error(`Unreviewed ${rewire.field} state on ${rewire.goalId}`)
    }
  }

  for (const goal of goals) {
    for (const oldId of splitParentIds) {
      if ((goal.requires ?? []).includes(oldId)) {
        throw new Error(`Unadjudicated canonical requires reference ${goal.id} -> ${oldId}`)
      }
      if ((goal.examData?.coveredGoalIds ?? []).includes(oldId)) {
        throw new Error(`Unadjudicated canonical assessment reference ${goal.id} -> ${oldId}`)
      }
    }
  }

  const parentIdsByChild = new Map<string, string[]>()
  for (const goal of goals) {
    for (const childId of goal.contains ?? []) {
      if (!byId.has(childId)) throw new Error(`Missing contains target ${goal.id} -> ${childId}`)
      parentIdsByChild.set(childId, [...(parentIdsByChild.get(childId) ?? []), goal.id])
    }
  }
  const affectedAncestors = new Set<string>()
  const queue = splitParentIds.flatMap((parentId) => parentIdsByChild.get(parentId) ?? [])
  while (queue.length > 0) {
    const ancestorId = queue.shift()!
    if (affectedAncestors.has(ancestorId)) continue
    affectedAncestors.add(ancestorId)
    queue.push(...(parentIdsByChild.get(ancestorId) ?? []))
  }
  const atomicDescendants = (rootId: string): Set<string> => {
    const result = new Set<string>()
    const visiting = new Set<string>()
    const visit = (goalId: string): void => {
      if (visiting.has(goalId)) throw new Error(`Contains cycle while weighing ${rootId}: ${goalId}`)
      const goal = byId.get(goalId)
      if (!goal) throw new Error(`Missing goal ${goalId} while weighing ${rootId}`)
      if ((goal.contains ?? []).length === 0) {
        result.add(goalId)
        return
      }
      visiting.add(goalId)
      for (const childId of goal.contains) visit(childId)
      visiting.delete(goalId)
    }
    visit(rootId)
    return result
  }
  for (const ancestorId of affectedAncestors) {
    const ancestor = byId.get(ancestorId)
    if (!ancestor) throw new Error(`Missing affected ancestor ${ancestorId}`)
    ancestor.weight = atomicDescendants(ancestorId).size
  }

  landscape.goals = goals
  return landscape
}

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const decisionById = new Map((ledger.decisions as JsonRecord[]).map((decision) => [decision.goalId, decision]))
  for (const goalId of [...splitParentIds, ...childIds]) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    decisionById.set(goalId, {
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind: splitParentIds.includes(goalId as typeof splitParentIds[number])
        ? 'curricularArea'
        : 'curricularAtomic',
      decisionStatus: 'authoritative',
      decisionBasis: splitParentIds.includes(goalId as typeof splitParentIds[number])
        ? 'reviewed-current-structural-split-curricular-area'
        : 'reviewed-current-structural-split-curricular-atomic',
    })
  }
  ledger.decisions = [...decisionById.values()].sort((left, right) =>
    left.goalId < right.goalId ? -1 : left.goalId > right.goalId ? 1 : 0,
  )
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  }
  const preferredOrder = [
    'curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure',
    'memory', 'runtimeSupport', 'orientation',
  ]
  ledger.counts = Object.fromEntries(
    preferredOrder.filter((key) => counts[key] !== undefined).map((key) => [key, counts[key]]),
  )
  ledger.counts.total = (ledger.decisions as JsonRecord[]).length
  return ledger
}

function buildAtomicity(landscape: JsonRecord): JsonRecord[] {
  const records = readJsonl(paths.atomicity)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const childRecordById = new Map(childSpecs.map((spec) => {
    const goal = goalById.get(spec.id)!
    return [spec.id, {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'semantic-atomicity-v1',
      landscapeId: landscape.landscapeId,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
      reviewedAt: '2026-08-26',
      reviewer: 'codex-ai-synthesis-2026-08-26',
      status: 'atomic',
      semanticAtomic: true,
      reason: spec.atomicityReason,
      suggestedSplit: [],
    }]
  }))
  const result: JsonRecord[] = []
  const emitted = new Set<string>()
  for (const record of records) {
    const replacements = childSpecs.filter((spec) => spec.parentId === record.goalId)
    if (replacements.length > 0) {
      for (const spec of replacements) {
        result.push(childRecordById.get(spec.id)!)
        emitted.add(spec.id)
      }
      continue
    }
    if (splitParentIds.includes(record.goalId) || childIds.includes(record.goalId)) continue
    result.push(record)
  }
  for (const spec of childSpecs) {
    if (!emitted.has(spec.id)) result.push(childRecordById.get(spec.id)!)
  }
  return result
}

function buildMemory(landscape: JsonRecord): JsonRecord[] {
  const records = readJsonl(paths.memory)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const childRecordById = new Map(childSpecs.map((spec) => {
    const goal = goalById.get(spec.id)!
    return [spec.id, {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'memory-card-review-v1',
      landscapeId: landscape.landscapeId,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
      status: 'no_memory_needed',
      memoryUseful: false,
      reviewedAt: '2026-08-26',
      reviewer: 'codex-ai-synthesis-2026-08-26',
      reason: spec.memoryReason,
    }]
  }))
  const result: JsonRecord[] = []
  const emitted = new Set<string>()
  for (const record of records) {
    const replacements = childSpecs.filter((spec) => spec.parentId === record.goalId)
    if (replacements.length > 0) {
      for (const spec of replacements) {
        result.push(childRecordById.get(spec.id)!)
        emitted.add(spec.id)
      }
      continue
    }
    if (splitParentIds.includes(record.goalId) || childIds.includes(record.goalId)) continue
    result.push(record)
  }
  for (const spec of childSpecs) {
    if (!emitted.has(spec.id)) result.push(childRecordById.get(spec.id)!)
  }
  return result
}

function buildVisualizationQa(): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const deliberatelyOpen = new Set([...splitParentIds, ...childIds])
  qa.records = (qa.records as JsonRecord[]).filter((record) => !deliberatelyOpen.has(record.goalId))
  return qa
}

const isCompositionGoalReference = (value: unknown): value is JsonRecord =>
  Boolean(
    value
    && typeof value === 'object'
    && ['goalEntry', 'canonicalSubtree'].includes((value as JsonRecord).kind)
    && typeof (value as JsonRecord).goalId === 'string',
  )

function replaceCompositionReferences(value: unknown): { value: unknown; replacements: number } {
  if (Array.isArray(value)) {
    let replacements = 0
    const transformed = value.flatMap((entry) => {
      if (isCompositionGoalReference(entry)) {
        const replacementIds = childIdsByParent.get(entry.goalId)
        if (replacementIds) {
          replacements += 1
          return replacementIds.map((goalId) => ({ ...entry, goalId }))
        }
      }
      const nested = replaceCompositionReferences(entry)
      replacements += nested.replacements
      return [nested.value]
    })
    return { value: transformed, replacements }
  }
  if (value && typeof value === 'object') {
    let replacements = 0
    const entries = Object.entries(value as JsonRecord).map(([key, nested]) => {
      const transformed = replaceCompositionReferences(nested)
      replacements += transformed.replacements
      return [key, transformed.value]
    })
    return { value: Object.fromEntries(entries), replacements }
  }
  return { value, replacements: 0 }
}

function countCompositionReferences(value: unknown, goalId: string): number {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countCompositionReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const own = isCompositionGoalReference(value) && value.goalId === goalId ? 1 : 0
  return own + Object.values(value as JsonRecord)
    .reduce((sum: number, nested) => sum + countCompositionReferences(nested, goalId), 0)
}

function buildCompositionViews(): Map<string, JsonRecord> {
  const result = new Map<string, JsonRecord>()
  const observedViewCounts: Record<string, number> = Object.fromEntries(splitParentIds.map((id) => [id, 0]))
  for (const entry of readdirSync(compositionRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.view.json')) continue
    const absolutePath = join(compositionRoot, entry.name)
    const original = JSON.parse(readFileSync(absolutePath, 'utf8')) as JsonRecord
    const transformed = replaceCompositionReferences(original)
    const view = transformed.value as JsonRecord
    for (const parentId of splitParentIds) {
      if (countCompositionReferences(view, parentId) !== 0) {
        throw new Error(`Stale learner-facing composition reference ${entry.name} -> ${parentId}`)
      }
      const children = childIdsByParent.get(parentId)!
      const childCounts = children.map((childId) => countCompositionReferences(view, childId))
      if (childCounts.some((count) => count > 1)) {
        throw new Error(`Duplicate split-child projection in ${entry.name} for parent ${parentId}`)
      }
      const hasAny = childCounts.some((count) => count === 1)
      const hasAll = childCounts.every((count) => count === 1)
      if (hasAny && !hasAll) throw new Error(`Partial split-child projection in ${entry.name} for ${parentId}`)
      if (hasAll) observedViewCounts[parentId] += 1
    }
    if (stableJson(view) !== stableJson(original)) result.set(absolutePath, view)
  }
  const expectedViewCounts: Record<string, number> = {
    [ids.volumeSurfaceCluster]: 23,
    [ids.reflectionsCluster]: 11,
    [ids.representationsCluster]: 11,
  }
  for (const parentId of splitParentIds) {
    if (observedViewCounts[parentId] !== expectedViewCounts[parentId]) {
      throw new Error(
        `Composition-view coverage for ${parentId} is ${observedViewCounts[parentId]}, expected ${expectedViewCounts[parentId]}`,
      )
    }
  }
  return result
}

validateSourceEdgeAdjudication()
const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildAtomicity(canonical)
const memory = buildMemory(canonical)
const visualizationQa = buildVisualizationQa()
const compositionViews = buildCompositionViews()

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  for (const [path, view] of compositionViews) writeJsonAbsolute(path, view)
}

const plannedPaths = [
  paths.canonical,
  paths.semanticKinds,
  paths.atomicity,
  paths.memory,
  paths.visualizationQa,
  ...[...compositionViews.keys()].map((path) => relative(repoRoot, path)),
]

console.log(
  `CHECK apply_math_batch_003_structural_splits ${writeMode ? 'WRITE' : 'PASS'} `
  + `parents=3 children=7 canonicalRewires=${canonicalRewires.length} `
  + `compositionViews=${compositionViews.size} visualizationQaOpen=7 plannedWrites=${plannedPaths.length}`,
)
