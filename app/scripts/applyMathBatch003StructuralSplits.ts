import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
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
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  surrogateEvidence: 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
  atlasSources: 'app/scripts/config/goal-books/de-gym-math-national-atlas.sources.json',
  durationPolicy: 'app/scripts/config/math-duration-split-spanning-tree-policy.json',
  blueprint: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j6/blueprint.md',
  simulatedReview: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j6/simulated_review_v3.md',
  simulatedReviewV4: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j6/simulated_review_v4.md',
  j6AssessmentReadme: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j6/README.md',
  pointReflectionDraft:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-27/j6/'
    + 'j6-point-reflection/draft_v1.md',
  pointReflectionSolution:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-27/j6/'
    + 'j6-point-reflection/solution_v1.md',
  pointReflectionReview:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-27/j6/'
    + 'j6-point-reflection/simulated_review_v1.md',
  representationDraft:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-27/j6/'
    + 'j6-cuboid-representation-switching/draft_v1.md',
  representationSolution:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-27/j6/'
    + 'j6-cuboid-representation-switching/solution_v1.md',
  representationReview:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-27/j6/'
    + 'j6-cuboid-representation-switching/simulated_review_v1.md',
  sourceEdgeAdjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/'
    + 'batch-003b-j6-structural-splits/source-edge-adjudication.json',
  receipt:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/'
    + 'batch-003b-j6-structural-splits/application-receipt.json',
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
  rectangleAreaFromMeasuring: '0bd7dc9b-c7f9-52e6-b374-a019edfd821c',
  cuboidVolumeFormula: 'b44f038c-fb1f-527e-b9ad-382214d0328a',
  convertVolumeUnits: '57fbbf31-9b8c-5408-9af5-fbc73acd12bb',
  classifySolids: 'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6',
  lineGeometry: '2231c29b-eb4e-51ae-9cb1-eb033bf16099',
  basicCoordinateObjects: '25593605-5e13-55cc-9a05-8f3d737e15e9',
  orientation: '65365dce-f33f-49d8-9516-42f75883aa86',
  linkedRepresentations: '11c88ea2-8502-5008-bec2-3e491c75ace4',
  estimateReferenceSizes: '03a87896-088d-4b21-a37b-d0604d784540',
  compareOrderSizes: 'f2e42af5-67a6-477e-82ea-e65b09cc6cb3',
  prismVolume: '59d5a330-61be-4590-ab46-cf7cefecd144',
  j6ExamFolder: '7a2a5706-aff4-4fd0-b092-1779d6ecbc1f',
  pointReflectionAssessment: '1cab2bd9-d79a-5468-89dc-05cc63026584',
  representationAssessment: 'c34c6132-f85d-59be-8b95-032ddfc0d0de',
} as const

const mathLandscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const reviewedAt = '2026-08-27'
const reviewer = 'codex-ai-j6-structural-split-contract-2026-08-27'

type AlternativeBinding = {
  canonicalGoalId: string
  matchType: 'partial'
  classification: string
  rationaleDe: string
}

const alternativeBindingsBySourceGoalId: Record<string, AlternativeBinding> = {
  '1a1a8af3-6b2a-5ea0-b314-1145e8965b72': {
    canonicalGoalId: ids.estimateReferenceSizes,
    matchType: 'partial',
    classification: 'alternative_existing_estimation_goal',
    rationaleDe: 'Der BY-Näherungswert für Volumen ist fachlich eine Schätzkompetenz mit Bezugsgrößen und wird deshalb dem bestehenden Schätzziel statt einem Volumenberechnungs-Kind zugeordnet.',
  },
  'by-math-m6-2-1-97cf9f6b-s02-8cbc5dff4c': {
    canonicalGoalId: ids.linkedRepresentations,
    matchType: 'partial',
    classification: 'alternative_existing_spatial_sketch_goal',
    rationaleDe: 'Der BY-Wechsel zwischen zwei- und dreidimensionaler Betrachtung mithilfe geeigneter Skizzen wird durch das bestehende Ziel zum Verknüpfen räumlicher Darstellungen abgedeckt.',
  },
  'hh-math-seki-2022-hh-seki-5-6-10-01-0c22242b8b': {
    canonicalGoalId: ids.convertVolumeUnits,
    matchType: 'partial',
    classification: 'alternative_existing_volume_measurement_goal',
    rationaleDe: 'Das Hamburger Messen von Volumina ist durch Einheitswürfel und Volumeneinheiten im bestehenden Volumeneinheiten-Ziel belegt.',
  },
  'hh-math-seki-2022-hh-seki-5-6-10-08-af464943cf': {
    canonicalGoalId: ids.compareOrderSizes,
    matchType: 'partial',
    classification: 'alternative_existing_size_comparison_goal',
    rationaleDe: 'Das Hamburger Vergleichen und Ordnen von Rauminhalten ist eine Größenvergleichskompetenz und wird dem bestehenden Vergleichs- und Ordnungsziel zugeordnet.',
  },
  'de-mv-mathematik-seki-rahmenplaene-2020-2019-mv-seki-gym-j8-planimetrie-und-stereometrie-014-c11ef57d62': {
    canonicalGoalId: ids.prismVolume,
    matchType: 'partial',
    classification: 'alternative_existing_prism_volume_goal',
    rationaleDe: 'Der MV-J8-Beleg nennt Volumen im Prisma-Kontext und wird deshalb dem bestehenden Prisma-Volumenziel statt dem J6-Quaderkind zugeordnet.',
  },
  'de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t05-flacheninhalt-und-volumen-b19-a6e51e74d6': {
    canonicalGoalId: ids.cuboidVolume,
    matchType: 'partial',
    classification: 'alternative_existing_composite_cuboid_volume_goal',
    rationaleDe: 'Das saarländische Zerlegen und Ergänzen zum Rauminhaltsvergleich ist im finalen Volumenkind für zusammengesetzte Quaderkörper ausdrücklich enthalten.',
  },
}

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
  jurisdictions: string[]
  atomicityReason: string
  memoryReason: string
}

const childSpecs: ChildSpec[] = [
  {
    parentId: ids.volumeSurfaceCluster,
    id: ids.cuboidVolume,
    shortKey: 'canonical_math_sek1_j6_calculate_cuboid_cube_volumes',
    title: 'Volumina von Quadern, Würfeln und daraus zusammengesetzten Körpern bestimmen',
    titleEn: 'Determine volumes of cuboids, cubes, and solids composed of them',
    description:
      'Die lernende Person kann die Volumina von Quadern, Würfeln und aus ihnen zusammengesetzten Körpern mithilfe von Einheitswürfeln oder aus Kantenlängen bestimmen, zusammengesetzte Körper dazu gezielt in Quader zerlegen oder zu Quadern ergänzen und die Ergebnisse in geeigneten Volumeneinheiten angeben und vergleichen.',
    descriptionEn:
      'The learner can determine the volumes of cuboids, cubes, and solids composed of them using unit cubes or edge lengths, deliberately decompose composite solids into cuboids or complete them to cuboids, and state and compare the results in suitable units of volume.',
    requires: [ids.cuboidVolumeFormula, ids.convertVolumeUnits],
    jurisdictions: ['DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'],
    atomicityReason:
      'Volumen berechnen, eine passende Volumeneinheit verwenden und das Ergebnis prüfen sind zusammengehörige Ausführungsschritte derselben Quader- und Würfelvolumen-Kompetenz.',
    memoryReason:
      'Das Ziel wird durch räumliches Verständnis, Berechnen, Einheitenkontrolle und Ergebnisprüfung aufgebaut; ein separates Memory-Deck ist dafür nicht erforderlich.',
  },
  {
    parentId: ids.volumeSurfaceCluster,
    id: ids.cuboidSurface,
    shortKey: 'canonical_math_sek1_j6_calculate_cuboid_cube_surface_areas',
    title: 'Oberflächeninhalte von Quadern und Würfeln aus ihren Seitenflächen berechnen',
    titleEn: 'Calculate surface areas of cuboids and cubes from their faces',
    description:
      'Die lernende Person kann bei einem Quader oder Würfel die Flächeninhalte der sechs Seitenflächen aus den Kantenlängen bestimmen, gleich große Seitenflächen berücksichtigen und sie zum Oberflächeninhalt addieren.',
    descriptionEn:
      'The learner can determine the areas of the six faces of a cuboid or cube from its edge lengths, account for congruent faces, and add them to obtain the surface area.',
    requires: [ids.rectangleAreaFromMeasuring, ids.classifySolids],
    jurisdictions: ['DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'],
    atomicityReason:
      'Seitenflächen zu einer Oberfläche zusammenzuführen, eine passende Flächeneinheit zu verwenden und das Ergebnis zu prüfen bildet eine einzelne Oberflächen-Kompetenz.',
    memoryReason:
      'Die Oberflächenberechnung verlangt das Verknüpfen räumlicher und ebener Vorstellungen; ein separates Memory-Deck ist dafür nicht erforderlich.',
  },
  {
    parentId: ids.reflectionsCluster,
    id: ids.axisReflection,
    shortKey: 'canonical_math_sek1_j6_perform_axis_reflections',
    title: 'Achsenspiegelungen konstruieren',
    titleEn: 'Construct reflections across a line',
    description:
      'Die lernende Person kann zu einem Punkt oder einer Figur an einer gegebenen Geraden die Bildpunkte so konstruieren, dass die Verbindungsstrecken senkrecht zur Spiegelachse verlaufen und Ausgangs- und Bildpunkt jeweils denselben Abstand von ihr haben, und diese Bedingungen prüfen.',
    descriptionEn:
      'The learner can construct the image points of a point or figure under reflection across a given line so that the joining segments are perpendicular to the mirror line and each original point and its image are equally distant from it, and check these conditions.',
    requires: [ids.lineGeometry],
    jurisdictions: ['DE-BW', 'DE-SH'],
    atomicityReason:
      'Das sorgfältige Konstruieren von Bildpunkten mit Lot- und Abstandseigenschaft ist eine einzelne, eigenständig prüfbare Achsenspiegelungs-Kompetenz.',
    memoryReason:
      'Die Achsenspiegelung wird durch Konstruktion und Begründung der geometrischen Eigenschaften gelernt; ein separates Memory-Deck ist nicht erforderlich.',
  },
  {
    parentId: ids.reflectionsCluster,
    id: ids.pointReflection,
    shortKey: 'canonical_math_sek1_j6_perform_point_reflections',
    title: 'Punktspiegelungen konstruieren',
    titleEn: 'Construct point reflections',
    description:
      'Die lernende Person kann zu einem Punkt oder einer Figur bei gegebenem Spiegelzentrum die Bildpunkte so konstruieren, dass das Spiegelzentrum jeweils auf der Verbindungsstrecke liegt und von Ausgangs- und Bildpunkt gleich weit entfernt ist, und diese Bedingung prüfen.',
    descriptionEn:
      'The learner can construct the image points of a point or figure under point reflection about a given centre so that the centre lies on each joining segment and is equally distant from the original point and its image, and check this condition.',
    requires: [ids.basicCoordinateObjects],
    jurisdictions: ['DE-BW', 'DE-SH'],
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
      'Die lernende Person kann aus den sechs Seitenflächen eines Quaders oder Würfels ein vollständiges, zusammenhängendes Netz zeichnen und prüfen, ob es sich ohne Überlappung zum Körper falten lässt.',
    descriptionEn:
      'The learner can draw a complete, connected net from the six faces of a cuboid or cube and check whether it can be folded into the solid without overlap.',
    requires: [ids.classifySolids],
    jurisdictions: ['DE-BW', 'DE-HE', 'DE-SH'],
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
      'Die lernende Person kann zu einem Quader oder Würfel ein räumlich konsistentes Schrägbild zeichnen, in dem zusammengehörige Körperkanten parallel verlaufen und sichtbare sowie gegebenenfalls verdeckte Kanten regelgerecht dargestellt sind.',
    descriptionEn:
      'The learner can draw a spatially consistent oblique view of a cuboid or cube in which corresponding edges are parallel and visible and, where applicable, hidden edges are represented correctly.',
    requires: [ids.classifySolids],
    jurisdictions: ['DE-BW', 'DE-HE', 'DE-SH'],
    atomicityReason:
      'Ein räumlich konsistentes Schrägbild mit sichtbaren und verdeckten Kanten zu zeichnen ist eine einzelne Darstellungs-Kompetenz.',
    memoryReason:
      'Schrägbilder werden durch räumliches Vorstellen und regelgeleitetes Zeichnen aufgebaut; ein separates Memory-Deck ist nicht erforderlich.',
  },
  {
    parentId: ids.representationsCluster,
    id: ids.orthographicViews,
    shortKey: 'canonical_math_sek1_j6_draw_cuboid_cube_orthographic_views',
    title: 'Eine orthogonale Ansicht eines Quaders oder Würfels zeichnen',
    titleEn: 'Draw an orthographic view of a cuboid or cube',
    description:
      'Die lernende Person kann zu einem Quader oder Würfel aus einer vorgegebenen Hauptblickrichtung eine orthogonale ebene Ansicht zeichnen und deren Breite und Höhe den entsprechenden Kantenlängen des Körpers zuordnen.',
    descriptionEn:
      'The learner can draw an orthographic plane view of a cuboid or cube from a specified principal viewing direction and relate its width and height to the corresponding edge lengths of the solid.',
    requires: [ids.classifySolids],
    jurisdictions: ['DE-BW', 'DE-HE'],
    atomicityReason:
      'Eine orthogonale Ansicht aus vorgegebener Hauptblickrichtung zu zeichnen und ihre Abmessungen den Körperkanten zuzuordnen ist eine einzelne Darstellungs-Kompetenz.',
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

const assessmentSpecs: JsonRecord[] = [
  {
    id: ids.pointReflectionAssessment,
    title: 'Punktspiegelung an einem gegebenen Zentrum konstruieren und prüfen',
    titleEn: 'Construct and verify a point reflection about a given centre',
    description:
      'Die lernende Person kann eine jahrgangsnahe Geometrieaufgabe bearbeiten, in der sie Punkte an einem gegebenen Spiegelzentrum punktspiegelt und an einem Punkt-Bildpunkt-Paar prüft, dass das Zentrum auf der Verbindungsstrecke liegt und von beiden Punkten gleich weit entfernt ist.',
    descriptionEn:
      'The learner can solve an age-appropriate geometry task by reflecting points about a given centre and verifying for an original-image point pair that the centre lies on the joining segment and is equidistant from both points.',
    core: true,
    weight: 1,
    tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'phase:SekI', 'ExamTask'],
    applicability: { jurisdiction: ['DE-BW', 'DE-SH'] },
    sourceRef: `${paths.pointReflectionDraft}#aufgabe`,
    dimensionTags: {
      framework: 'canonical-gymnasium-math',
      demandLevel: 'AB3',
      processCompetencies: ['K3.1', 'K5.1'],
      guidingIdeas: ['L3'],
      phase: 'J6',
      area: 'Mathematik',
      topicCode: 'CANONICAL.MATH.SEK1.PRACTICE.J6.STRUCTURAL_SPLIT.POINT_REFLECTION',
    },
    shortKey: 'canonical_math_j6_structural_split_follow_up_j6_point_reflection',
    contains: [],
    requires: [ids.pointReflection],
    phase: 'J6',
    type: 'atomic',
    nodeKind: 'exam',
    resourceLinks: [],
    examData: {
      reviewStatus: 'released',
      reviewNote: 'released after focused simulated internal review on 2026-08-27 for the J6 structural-split route',
      coveredGoalIds: [ids.pointReflection],
      coveredStrands: ['L3'],
      demandLevels: ['AB1', 'AB2', 'AB3'],
      sourceArtifactPath: paths.pointReflectionDraft,
      taskContent:
        'Im Koordinatensystem sind das Spiegelzentrum $Z(2|1)$ sowie die Punkte $A(0|0)$, $B(4|0)$ und $C(1|3)$ gegeben.\n\n1. Konstruiere die Bildpunkte $A\'$, $B\'$ und $C\'$ der Punktspiegelung an $Z$ und gib ihre Koordinaten an. (4 BE)\n2. Prüfe für $B$ und $B\'$ ausdrücklich, dass $Z$ auf der Verbindungsstrecke liegt und von beiden Punkten gleich weit entfernt ist. Begründe mit den Koordinaten oder den Verschiebungsschritten. (2 BE)',
      solutionContent:
        '$A\'(4|2)$, $B\'(0|2)$ und $C\'(3|-1)$. Die Konstruktion erhält für jedes Punkt-Bildpunkt-Paar $Z$ als Mittelpunkt.\n\nVon $B(4|0)$ nach $Z(2|1)$ geht man $2$ Einheiten nach links und $1$ Einheit nach oben. Von $Z(2|1)$ nach $B\'(0|2)$ gilt derselbe Verschiebungsschritt. Daher liegen $B$, $Z$ und $B\'$ auf einer Geraden, und die Strecken $BZ$ und $ZB\'$ sind gleich lang.',
      scoring: {
        maxPoints: 6,
        passingPoints: 3,
        steps: [{
          id: 'j6_structural_split_point_reflection_v1',
          points: 6,
          description: 'Drei Bildpunkte konstruieren und an einem Punkt-Bildpunkt-Paar die Lage- und Abstandseigenschaft des Spiegelzentrums prüfen.',
        }],
      },
    },
    extendedData: {
      applicabilityFromRequires: true,
      applicabilityMappingInheritance: 'boundary',
    },
  },
  {
    id: ids.representationAssessment,
    title: 'Quaderdarstellungen zeichnen und verknüpfen',
    titleEn: 'Draw and connect representations of a cuboid',
    description:
      'Die lernende Person kann zu einem gegebenen Quader ein vollständiges Netz, ein regelgerechtes Schrägbild und eine vorgeschriebene orthogonale Ansicht zeichnen sowie die Darstellungen anhand derselben Fläche und Markierung fachsprachlich verknüpfen.',
    descriptionEn:
      'The learner can draw a complete net, a correctly constructed oblique view, and a prescribed orthographic view of a given cuboid and connect the representations using the same face and marker with appropriate terminology.',
    core: true,
    weight: 1,
    tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'phase:SekI', 'ExamTask'],
    applicability: { jurisdiction: ['DE-BW'] },
    sourceRef: `${paths.representationDraft}#aufgabe`,
    dimensionTags: {
      framework: 'canonical-gymnasium-math',
      demandLevel: 'AB3',
      processCompetencies: ['K1.2', 'K3.1', 'K4.1'],
      guidingIdeas: ['L3'],
      phase: 'J6',
      area: 'Mathematik',
      topicCode: 'CANONICAL.MATH.SEK1.PRACTICE.J6.STRUCTURAL_SPLIT.CUBOID_REPRESENTATIONS',
    },
    shortKey: 'canonical_math_j6_structural_split_follow_up_j6_cuboid_representation_switching',
    contains: [],
    requires: [ids.nets, ids.obliqueViews, ids.orthographicViews, ids.linkedRepresentations],
    phase: 'J6',
    type: 'atomic',
    nodeKind: 'exam',
    resourceLinks: [],
    examData: {
      reviewStatus: 'released',
      reviewNote: 'released after focused simulated internal review on 2026-08-27 for the J6 structural-split route',
      coveredGoalIds: [ids.nets, ids.obliqueViews, ids.orthographicViews, ids.linkedRepresentations],
      coveredStrands: ['L3'],
      demandLevels: ['AB1', 'AB2', 'AB3'],
      sourceArtifactPath: paths.representationDraft,
      taskContent:
        'Ein Quader ist $6 cm$ lang, $4 cm$ breit und $3 cm$ hoch. Die $6 cm\\times3 cm$ große Seitenfläche ist als Vorderfläche festgelegt. Der Punkt $P$ liegt an der vorderen linken Ecke der Oberseite.\n\n1. Zeichne ein vollständiges, zusammenhängendes Netz mit allen Maßen. Kennzeichne die Vorderfläche und $P$, und prüfe durch gedankliches Falten, dass keine Flächen überlappen. (3 BE)\n2. Zeichne ein regelgerechtes Schrägbild mit der festgelegten Vorderfläche, nach hinten laufenden parallelen Kanten sowie sichtbaren und verdeckten Kanten. Übertrage $P$ an die entsprechende Ecke. (3 BE)\n3. Zeichne die vorgeschriebene orthogonale Ansicht von oben mit den richtigen Seitenlängen und markiere $P$. (2 BE)\n4. Erläutere anhand der Oberseite und des Punkts $P$, wie Netz, Schrägbild, Draufsicht und der gedachte Quader dieselbe räumliche Situation darstellen. (2 BE)',
      solutionContent:
        'Das Netz besteht aus zwei Rechtecken $6 cm\\times4 cm$, zwei Rechtecken $6 cm\\times3 cm$ und zwei Rechtecken $4 cm\\times3 cm$; es ist zusammenhängend und ohne Überlappung faltbar. Vorderfläche, Oberseite und $P$ liegen an zueinander passenden Kanten und Ecken.\n\nDas Schrägbild zeigt die festgelegte $6 cm\\times3 cm$-Vorderfläche, die Tiefe $4 cm$, parallele entsprechende Kanten und regelgerecht gekennzeichnete verdeckte Kanten. $P$ liegt an der vorderen linken Ecke der Oberseite.\n\nDie orthogonale Draufsicht ist ein Rechteck $6 cm$ mal $4 cm$; $P$ liegt an der zur Vorderkante gehörenden linken Ecke.\n\nBeim Falten des Netzes wird die $6 cm\\times4 cm$-Fläche zur Oberseite. Dieselbe Fläche erscheint im Schrägbild räumlich und in der Draufsicht unverzerrt als Rechteck. Die gemeinsame Lage von $P$ an der vorderen linken Ecke belegt den konsistenten Darstellungswechsel.',
      scoring: {
        maxPoints: 10,
        passingPoints: 5,
        steps: [{
          id: 'j6_structural_split_cuboid_representations_v1',
          points: 10,
          description: 'Ein vollständiges Netz, ein regelgerechtes Schrägbild und eine vorgeschriebene orthogonale Draufsicht zeichnen und dieselbe Fläche und Markierung zwischen den Darstellungen verknüpfen.',
        }],
      },
    },
    extendedData: {
      applicabilityFromRequires: false,
      applicabilityMappingInheritance: 'boundary',
      applicabilityOverrides: { jurisdiction: ['DE-BW'] },
    },
  },
]

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

const writeText = (path: string, value: string): void => {
  const absolutePath = resolve(repoRoot, path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, value)
}

const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const sha256Bytes = (value: string | Buffer): string =>
  createHash('sha256').update(value).digest('hex')

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

const countBy = (values: string[]): Record<string, number> => {
  const result: Record<string, number> = {}
  for (const value of values) result[value] = (result[value] ?? 0) + 1
  return result
}

function buildInitialSourceEdgeAdjudication(): JsonRecord {
  const absolutePath = resolve(repoRoot, paths.sourceEdgeAdjudication)
  if (!existsSync(absolutePath)) {
    throw new Error(
      `Required source-edge adjudication is missing: ${paths.sourceEdgeAdjudication}. `
      + 'No structural split may proceed before every mapping edge is adjudicated.',
    )
  }
  const adjudication = structuredClone(readJson(paths.sourceEdgeAdjudication))
  const edges = adjudication.sourceMappingEdges as JsonRecord[] | undefined
  if (!Array.isArray(edges)) throw new Error('source-edge adjudication must contain sourceMappingEdges[]')

  const bwEdge = edges.find((edge) => (
    edge.path === 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json'
    && edge.mappingPointer === '/mappings/381'
    && edge.sourceGoalId === 'bw-math-seki-bp2016-3-1-3-14-a5aa17ca'
  ))
  if (!bwEdge) throw new Error('Missing reviewed BW /mappings/381 source edge')
  const bwSelected = bwEdge.selectedChildGoalIds as string[]
  const bwMatches = bwEdge.selectedChildMatches as JsonRecord[]
  if (!bwSelected.includes(ids.orthographicViews)) {
    bwSelected.push(ids.orthographicViews)
    bwMatches.push({ childGoalId: ids.orthographicViews, matchType: 'partial' })
  }
  bwEdge.classification = 'cuboid_cube_net_oblique_and_orthographic_single_view_drawing'
  bwEdge.action = 'replace_parent_with_selected_children'
  bwEdge.semanticTargetKeys = [
    'cuboid_cube_net_drawing',
    'cuboid_cube_oblique_view_drawing',
    'cuboid_cube_orthographic_single_view_drawing',
  ]
  bwEdge.rationaleDe = 'Der gelesene BW-Source-Goal belegt Netze, Schrägbilder sowie Grund- und Aufrisse. Das generische atomische Kind fordert genau eine orthogonale Ansicht aus vorgegebener Hauptblickrichtung; Grund- oder Aufriss ist dafür ein fachlich passender Teilbeleg (partial).'
  bwEdge.bindingStatus = 'source_semantics_final_applied'
  delete bwEdge.removedSourceFacet

  for (const edge of edges) {
    const sourceGoalId = edge.sourceGoalId as string
    const alternative = alternativeBindingsBySourceGoalId[sourceGoalId]
    if (alternative) {
      if ((edge.selectedChildGoalIds as string[]).length !== 0) {
        throw new Error(`Alternative binding ${sourceGoalId} unexpectedly also selects split children`)
      }
      edge.action = 'replace_parent_with_alternative_canonical_goal'
      edge.classification = alternative.classification
      edge.alternativeCanonicalBinding = {
        canonicalGoalId: alternative.canonicalGoalId,
        matchType: alternative.matchType,
      }
      edge.rationaleDe = alternative.rationaleDe
    }
    edge.bindingStatus = 'source_semantics_final_applied'
  }

  const byOldGoalId: Record<string, JsonRecord> = {}
  for (const parentId of splitParentIds) {
    const parentEdges = edges.filter((edge) => edge.oldCanonicalGoalId === parentId)
    byOldGoalId[parentId] = {
      count: parentEdges.length,
      replace: parentEdges.filter((edge) => edge.action !== 'remove_mapping_edge').length,
      remove: parentEdges.filter((edge) => edge.action === 'remove_mapping_edge').length,
    }
  }
  const selectedChildGoalIds = edges.flatMap((edge) => edge.selectedChildGoalIds as string[])
  adjudication.completeness = {
    ...(adjudication.completeness as JsonRecord),
    sourceMappingEdgeCount: edges.length,
    sourceGoalsReadForEveryEdge: true,
    byOldGoalId,
    actionCounts: countBy(edges.map((edge) => edge.action as string)),
    classificationCounts: countBy(edges.map((edge) => edge.classification as string)),
    selectedChildGoalCounts: countBy(selectedChildGoalIds),
    alternativeMappingEdgeCount: edges.filter((edge) => edge.alternativeCanonicalBinding).length,
    authoritativeAlternativeDecisionCount: Object.keys(alternativeBindingsBySourceGoalId).length,
    openUncertainties: [],
  }
  adjudication.reviewedAt = reviewedAt
  adjudication.reviewer = reviewer
  adjudication.sourceDecisionStatus = 'final_current_contract'
  adjudication.releaseDisposition = 'implemented_layer_a_fresh_v2_dual_review_required'
  adjudication.releaseDispositionRationaleDe = 'Alle 159 gelesenen Source-Mapping-Kanten sind deterministisch gebunden oder fachlich begründet entfernt; sieben Kanten sichern sechs bestehende authoritative Entscheidungen über passende Alternativziele. Die Layer-A-Anwendung ist freigegeben, der frische v2-Doppelreview der sieben Kinder bleibt der nachgelagerte Review-Gate.'
  adjudication.applicationBlockers = []

  for (const reference of adjudication.derivedAndHistoricalReferences as JsonRecord[]) {
    const serialized = stableJson(reference)
    const isParentVisual = reference.referenceGroup === 'old_parent_visual_asset_paths'
      || /goal-visualization|visualizations\/mathematik|package-redistribution/iu.test(String(reference.path ?? ''))
    if (isParentVisual) {
      reference.action = 'retain_active_parent_cluster_overview_and_existing_qa'
      reference.applicationStatus = 'retained_under_product_owner_cluster_overview_rule'
      reference.rationaleDe = 'Die vorhandenen guten Nano-Banana-Bilder bleiben mit aktiven resourceLinks und vorhandenen QA-Records an den drei stabilen Parent-Clustern als fachliche Cluster-Übersichten erhalten; sie werden weder auf Kinder übertragen noch ersetzt.'
    } else if (/blocked/iu.test(serialized)) {
      reference.applicationStatus = 'derived_regeneration_deferred_until_after_fresh_v2_dual_review'
      reference.rationaleDe = `${String(reference.rationaleDe ?? '')} Der historische oder abgeleitete Beleg bleibt unverändert; eine Tiefenregeneration erfolgt erst nach dem frischen v2-Doppelreview.`.trim()
    }
  }
  return adjudication
}

function validateSourceEdgeAdjudication(adjudication: JsonRecord): JsonRecord {
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
    const alternative = edge.alternativeCanonicalBinding as JsonRecord | undefined
    if (alternative) {
      if (
        edge.action !== 'replace_parent_with_alternative_canonical_goal'
        || edge.selectedChildGoalIds.length !== 0
        || typeof alternative.canonicalGoalId !== 'string'
        || alternative.matchType !== 'partial'
      ) throw new Error(`${label} has an invalid alternative canonical binding`)
    } else {
      const removesEdge = edge.action === 'remove_mapping_edge'
      if (removesEdge !== (edge.selectedChildGoalIds.length === 0)) {
        throw new Error(`${label} has inconsistent removal action and selectedChildGoalIds`)
      }
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

type MappingBuildResult = {
  files: Map<string, JsonRecord>
  changedPaths: string[]
  selectedChildMappingCount: number
  alternativeMappingCount: number
  removedEdgeCount: number
  authoritativeDecisionCount: number
}

const edgeReplacementMappings = (edge: JsonRecord, oldMapping?: JsonRecord): JsonRecord[] => {
  const selectedMatches = edge.selectedChildMatches as JsonRecord[]
  const selectedIds = edge.selectedChildGoalIds as string[]
  if (selectedMatches.length !== selectedIds.length) {
    throw new Error(`${String(edge.edgeKey)} selectedChildMatches length mismatch`)
  }
  const matchByChildId = new Map(selectedMatches.map((match) => [match.childGoalId, match.matchType]))
  const base: JsonRecord = oldMapping
    ? { ...oldMapping }
    : { legacyGoalId: edge.sourceGoalId }
  const reviewDecisionId = oldMapping?.reviewDecisionId
  const selected = selectedIds.map((canonicalGoalId) => {
    const matchType = matchByChildId.get(canonicalGoalId)
    if (matchType !== 'exact' && matchType !== 'partial') {
      throw new Error(`${String(edge.edgeKey)} has invalid child match for ${canonicalGoalId}`)
    }
    return {
      ...base,
      canonicalGoalId,
      matchType,
      ...(reviewDecisionId ? { reviewDecisionId } : {}),
    }
  })
  const alternative = edge.alternativeCanonicalBinding as JsonRecord | undefined
  if (!alternative) return selected
  return [{
    ...base,
    canonicalGoalId: alternative.canonicalGoalId,
    matchType: alternative.matchType,
    ...(reviewDecisionId ? { reviewDecisionId } : {}),
  }]
}

function buildMappings(adjudication: JsonRecord): MappingBuildResult {
  const edges = adjudication.sourceMappingEdges as JsonRecord[]
  const edgesByPath = new Map<string, JsonRecord[]>()
  for (const edge of edges) {
    const path = edge.path as string
    edgesByPath.set(path, [...(edgesByPath.get(path) ?? []), edge])
  }

  const files = new Map<string, JsonRecord>()
  const changedPaths: string[] = []
  let authoritativeDecisionCount = 0

  for (const [path, fileEdges] of [...edgesByPath].sort(([left], [right]) => left.localeCompare(right))) {
    const original = readJson(path)
    if (!Array.isArray(original.mappings)) throw new Error(`${path} has no mappings[]`)
    const edgesByOldPair = new Map<string, JsonRecord>()
    for (const edge of fileEdges) {
      const pointerIndex = Number(String(edge.mappingPointer).split('/').at(-1))
      const pointerMapping = original.mappings[pointerIndex] as JsonRecord | undefined
      const pairKey = `${String(edge.sourceGoalId)}\u0000${String(edge.oldCanonicalGoalId)}`
      if (edgesByOldPair.has(pairKey)) throw new Error(`${path} has duplicate adjudicated old pair ${pairKey}`)
      edgesByOldPair.set(pairKey, edge)
      if (
        pointerMapping
        && pointerMapping.legacyGoalId === edge.sourceGoalId
        && pointerMapping.canonicalGoalId === edge.oldCanonicalGoalId
        && pointerMapping.matchType !== edge.originalMatchType
      ) throw new Error(`${String(edge.edgeKey)} original match type drift`)
    }

    const transformedMappings: JsonRecord[] = []
    const transformedEdgeKeys = new Set<string>()
    for (const mapping of original.mappings as JsonRecord[]) {
      const pairKey = `${String(mapping.legacyGoalId)}\u0000${String(mapping.canonicalGoalId)}`
      const edge = edgesByOldPair.get(pairKey)
      if (!edge) {
        transformedMappings.push(mapping)
        continue
      }
      if (mapping.matchType !== edge.originalMatchType) {
        throw new Error(`${String(edge.edgeKey)} old mapping match type drift`)
      }
      if (transformedEdgeKeys.has(edge.edgeKey as string)) {
        throw new Error(`${path} contains duplicate old mapping for ${String(edge.edgeKey)}`)
      }
      transformedEdgeKeys.add(edge.edgeKey as string)
      transformedMappings.push(...edgeReplacementMappings(edge, mapping))
    }

    const pairToMapping = new Map<string, JsonRecord>()
    for (const mapping of transformedMappings) {
      const pairKey = `${String(mapping.legacyGoalId)}\u0000${String(mapping.canonicalGoalId)}`
      const existing = pairToMapping.get(pairKey)
      if (existing) {
        if (stableJson(existing) !== stableJson(mapping)) {
          throw new Error(`${path} has conflicting duplicate mapping pair ${pairKey}`)
        }
        continue
      }
      pairToMapping.set(pairKey, mapping)
    }
    original.mappings = [...pairToMapping.values()]

    for (const edge of fileEdges) {
      const oldMatches = (original.mappings as JsonRecord[]).filter((mapping) => (
        mapping.legacyGoalId === edge.sourceGoalId && mapping.canonicalGoalId === edge.oldCanonicalGoalId
      ))
      if (oldMatches.length > 0) throw new Error(`${String(edge.edgeKey)} old parent mapping survived`)
      for (const expected of edgeReplacementMappings(edge)) {
        const matches = (original.mappings as JsonRecord[]).filter((mapping) => (
          mapping.legacyGoalId === expected.legacyGoalId
          && mapping.canonicalGoalId === expected.canonicalGoalId
          && mapping.matchType === expected.matchType
        ))
        if (matches.length !== 1) {
          throw new Error(`${String(edge.edgeKey)} expected exactly one mapping to ${String(expected.canonicalGoalId)}`)
        }
      }
    }

    if (Array.isArray(original.decisions)) {
      const affectedSourceIds = [...new Set(fileEdges.map((edge) => edge.sourceGoalId as string))]
      for (const sourceGoalId of affectedSourceIds) {
        const decisions = (original.decisions as JsonRecord[]).filter((decision) => decision.sourceGoalId === sourceGoalId)
        if (decisions.length !== 1) throw new Error(`${path} expected one authoritative decision for ${sourceGoalId}`)
        const decision = decisions[0]
        const decisionMappings = (original.mappings as JsonRecord[]).filter((mapping) => (
          mapping.legacyGoalId === sourceGoalId
          && (mapping.reviewDecisionId === undefined || mapping.reviewDecisionId === sourceGoalId)
        ))
        const canonicalGoalIds = [...new Set(decisionMappings.map((mapping) => mapping.canonicalGoalId as string))]
        if (canonicalGoalIds.length === 0) {
          throw new Error(`${path} authoritative decision ${sourceGoalId} would become empty`)
        }
        decision.decision = 'mapped'
        decision.canonicalGoalIds = canonicalGoalIds
        decision.matchType = decisionMappings.every((mapping) => mapping.matchType === 'exact') ? 'exact' : 'partial'
        decision.reviewedAt = reviewedAt
        decision.reviewer = reviewer
        const alternative = alternativeBindingsBySourceGoalId[sourceGoalId]
        if (alternative) decision.rationale = alternative.rationaleDe
        authoritativeDecisionCount += 1
      }

      for (const decision of original.decisions as JsonRecord[]) {
        if (!affectedSourceIds.includes(decision.sourceGoalId as string)) continue
        const mappingIds = [...new Set((original.mappings as JsonRecord[])
          .filter((mapping) => mapping.legacyGoalId === decision.sourceGoalId)
          .map((mapping) => mapping.canonicalGoalId as string))]
        if (!equalStringArrays(decision.canonicalGoalIds, mappingIds)) {
          throw new Error(`${path} mapping/decision parity failed for ${String(decision.sourceGoalId)}`)
        }
      }
    }

    files.set(path, original)
    if (stableJson(original) !== stableJson(readJson(path))) changedPaths.push(path)
  }

  return {
    files,
    changedPaths,
    selectedChildMappingCount: edges.reduce((sum, edge) => sum + (edge.selectedChildGoalIds as string[]).length, 0),
    alternativeMappingCount: edges.filter((edge) => edge.alternativeCanonicalBinding).length,
    removedEdgeCount: edges.filter((edge) => edge.action === 'remove_mapping_edge').length,
    authoritativeDecisionCount,
  }
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
    after: [ids.classifySolids, ids.cuboidVolumeFormula, ids.cuboidVolume, ids.cuboidSurface],
  },
  {
    goalId: '974edafb-ea7b-588e-b88a-547e7a097c70',
    field: 'coveredGoalIds',
    before: [ids.classifySolids, ids.representationsCluster, '11c88ea2-8502-5008-bec2-3e491c75ace4', ids.cuboidVolumeFormula, ids.volumeSurfaceCluster],
    after: [ids.classifySolids, ids.cuboidVolumeFormula, ids.cuboidVolume, ids.cuboidSurface],
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
    after: [ids.nets, ids.obliqueViews],
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
      applicability: { jurisdiction: [...spec.jurisdictions] },
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

  const examFolder = byId.get(ids.j6ExamFolder)
  if (!examFolder || !Array.isArray(examFolder.contains) || examFolder.type !== 'cluster') {
    throw new Error('Missing canonical J6 assessment folder')
  }
  const assessmentIds = assessmentSpecs.map((spec) => String(spec.id))
  const existingAssessmentIds = assessmentIds.filter((goalId) => byId.has(goalId))
  if (existingAssessmentIds.length !== 0 && existingAssessmentIds.length !== assessmentIds.length) {
    throw new Error('J6 structural-split assessments are only partially present')
  }
  for (const spec of assessmentSpecs) {
    const existing = byId.get(spec.id)
    if (existing && stableJson(existing) !== stableJson(spec)) {
      throw new Error(`Existing structural-split assessment ${String(spec.id)} differs from the exact reviewed specification`)
    }
    byId.set(String(spec.id), existing ?? structuredClone(spec))
  }
  const folderContains = (examFolder.contains as string[]).filter((goalId) => !assessmentIds.includes(goalId))
  examFolder.contains = [...folderContains, ...assessmentIds]
  examFolder.weight = examFolder.contains.length
  for (const assessmentId of assessmentIds) {
    const index = goals.findIndex((goal) => goal.id === assessmentId)
    if (index >= 0) goals.splice(index, 1)
  }
  const folderChildIndexes = folderContains
    .map((goalId) => goals.findIndex((goal) => goal.id === goalId))
    .filter((index) => index >= 0)
  const assessmentInsertIndex = folderChildIndexes.length > 0
    ? Math.max(...folderChildIndexes) + 1
    : goals.findIndex((goal) => goal.id === ids.j6ExamFolder) + 1
  goals.splice(
    assessmentInsertIndex,
    0,
    ...assessmentIds.map((goalId) => byId.get(goalId)!),
  )

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

  const task5 = byId.get('974edafb-ea7b-588e-b88a-547e7a097c70')!
  const task5DescriptionBefore = 'Die lernende Person kann eine freigegebene Prüfungsaufgabe der Jahrgangsstufe 6 bearbeiten: Quader erkennen, Darstellungen verknüpfen, Volumen mit Einheitswürfeln plausibilisieren und Oberfläche berechnen.'
  const task5DescriptionAfter = 'Die lernende Person kann eine freigegebene Prüfungsaufgabe der Jahrgangsstufe 6 bearbeiten: einen Quader erkennen und Darstellungsformen benennen, sein Volumen mit Einheitswürfeln plausibilisieren und den Oberflächeninhalt ohne Deckel berechnen.'
  if (task5.description === task5DescriptionBefore) task5.description = task5DescriptionAfter
  else if (task5.description !== task5DescriptionAfter) throw new Error('Unreviewed assessment description state on task 5')
  const task5Scoring = task5.examData?.scoring?.steps?.[0]
  const task5ScoringBefore = 'Quader erkennen, Darstellungen verknüpfen, Volumen mit Einheitswürfeln plausibilisieren und Oberfläche berechnen.'
  const task5ScoringAfter = 'Quader erkennen und Darstellungsformen benennen, Volumen mit Einheitswürfeln plausibilisieren und den Oberflächeninhalt ohne Deckel berechnen.'
  if (task5Scoring?.description === task5ScoringBefore) task5Scoring.description = task5ScoringAfter
  else if (task5Scoring?.description !== task5ScoringAfter) throw new Error('Unreviewed assessment scoring state on task 5')

  const task6 = byId.get('47c515c9-2174-58c7-a844-6865fc67c243')!
  const task6DescriptionBefore = 'Die lernende Person kann eine freigegebene Prüfungsaufgabe der Jahrgangsstufe 6 bearbeiten: Pi als Kreisverhältnis deuten, einen prozentualen Anteil berechnen, ein Säulendiagramm begründet beurteilen, Spiegelungen ausführen und einfache Muster fortsetzen.'
  const task6DescriptionAfter = 'Die lernende Person kann eine freigegebene Prüfungsaufgabe der Jahrgangsstufe 6 bearbeiten: Pi als Kreisverhältnis deuten, einen prozentualen Anteil berechnen, ein Säulendiagramm begründet beurteilen, eine Achsenspiegelung ausführen und einfache Muster fortsetzen.'
  if (task6.description === task6DescriptionBefore) task6.description = task6DescriptionAfter
  else if (task6.description !== task6DescriptionAfter) throw new Error('Unreviewed assessment description state on task 6')
  const task6Scoring = task6.examData?.scoring?.steps?.[0]
  const task6ScoringBefore = 'Pi als Kreisverhältnis deuten, einen prozentualen Anteil berechnen, eine abgeschnittene Achse kritisch beurteilen, Spiegelungen ausführen und einfache Muster fortsetzen.'
  const task6ScoringAfter = 'Pi als Kreisverhältnis deuten, einen prozentualen Anteil berechnen, eine abgeschnittene Achse kritisch beurteilen, eine Achsenspiegelung ausführen und einfache Muster fortsetzen.'
  if (task6Scoring?.description === task6ScoringBefore) task6Scoring.description = task6ScoringAfter
  else if (task6Scoring?.description !== task6ScoringAfter) throw new Error('Unreviewed assessment scoring state on task 6')

  const setAssessmentApplicabilityFromRequires = (goal: JsonRecord): void => {
    const requirements = (goal.requires as string[]).map((requiredId) => {
      const required = byId.get(requiredId)
      const jurisdictions = required?.applicability?.jurisdiction
      if (!Array.isArray(jurisdictions) || jurisdictions.length === 0) {
        throw new Error(`Assessment ${String(goal.id)} has prerequisite ${requiredId} without jurisdiction applicability`)
      }
      return new Set(jurisdictions as string[])
    })
    const intersection = [...requirements[0]].filter((jurisdiction) =>
      requirements.slice(1).every((jurisdictions) => jurisdictions.has(jurisdiction)))
    goal.applicability = { jurisdiction: intersection }
    goal.extendedData = {
      ...(goal.extendedData ?? {}),
      applicabilityFromRequires: true,
    }
  }
  setAssessmentApplicabilityFromRequires(task5)
  setAssessmentApplicabilityFromRequires(task6)
  setAssessmentApplicabilityFromRequires(byId.get(ids.pointReflectionAssessment)!)
  const representationAssessment = byId.get(ids.representationAssessment)!
  const representationRequirementJurisdictions = (representationAssessment.requires as string[])
    .map((requiredId) => new Set(byId.get(requiredId)?.applicability?.jurisdiction as string[]))
  const rawRepresentationIntersection = [...representationRequirementJurisdictions[0]].filter((jurisdiction) =>
    representationRequirementJurisdictions.slice(1).every((jurisdictions) => jurisdictions.has(jurisdiction)))
  if (!equalStringArrays(rawRepresentationIntersection, ['DE-BW', 'DE-HE'])) {
    throw new Error(`Unexpected raw representation-assessment applicability ${rawRepresentationIntersection.join(',')}`)
  }
  if (
    !equalStringArrays(representationAssessment.applicability?.jurisdiction, ['DE-BW'])
    || representationAssessment.extendedData?.applicabilityFromRequires !== false
    || !equalStringArrays(representationAssessment.extendedData?.applicabilityOverrides?.jurisdiction, ['DE-BW'])
  ) {
    throw new Error('Representation assessment must remain year-aware BW-only instead of raw BW+HE')
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
  const changedExistingGoalIds = [...new Set([
    ...canonicalRewires.map((rewire) => rewire.goalId),
    ids.j6ExamFolder,
  ])]
  for (const goalId of changedExistingGoalIds) {
    const goal = goalById.get(goalId)
    const decision = decisionById.get(goalId)
    if (!goal || !decision) throw new Error(`Missing semantic-kind rewire binding ${goalId}`)
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }
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
  for (const spec of assessmentSpecs) {
    const goal = goalById.get(spec.id)
    if (!goal) throw new Error(`Missing semantic-kind assessment ${String(spec.id)}`)
    decisionById.set(spec.id, {
      goalId: spec.id,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind: 'practiceAssessment',
      decisionStatus: 'authoritative',
      decisionBasis: 'reviewed-current-post-split-practice-assessment',
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
      landscapeId: mathLandscapeId,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
      reviewedAt,
      reviewer,
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
      landscapeId: mathLandscapeId,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
      status: 'no_memory_needed',
      memoryUseful: false,
      reviewedAt,
      reviewer,
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
  const records = qa.records as JsonRecord[]
  for (const parentId of splitParentIds) {
    const matches = records.filter((record) => record.goalId === parentId)
    if (matches.length !== 1 || matches[0].visualizationState !== 'available') {
      throw new Error(`Reviewed Nano Banana cluster overview QA binding is missing for ${parentId}`)
    }
  }
  for (const childId of childIds) {
    const matches = records.filter((record) => record.goalId === childId)
    if (
      matches.length !== 1
      || matches[0].visualizationState !== 'missing'
      || matches[0].missingReason !== 'no_primary_link'
      || matches[0].imageUrl !== ''
    ) {
      throw new Error(`Split child ${childId} must have exactly one honest no-image QA record`)
    }
  }
  return qa
}

const edgeSourceEvidence = (edge: JsonRecord): { sourceLandscapeId: string; sourceGoalId: string } => {
  const sourceEvidence = edge.sourceEvidence as JsonRecord | undefined
  if (!sourceEvidence || typeof sourceEvidence.sourceLandscapeId !== 'string') {
    throw new Error(`${String(edge.edgeKey)} is missing sourceLandscapeId evidence`)
  }
  return {
    sourceLandscapeId: sourceEvidence.sourceLandscapeId,
    sourceGoalId: edge.sourceGoalId as string,
  }
}

function buildProvenance(adjudication: JsonRecord): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[]).find((entry) => entry.landscapeId === mathLandscapeId)
  if (!landscape || !landscape.goalProvenance || typeof landscape.goalProvenance !== 'object') {
    throw new Error('Missing canonical mathematics provenance registry')
  }
  const provenance = landscape.goalProvenance as JsonRecord
  const edges = adjudication.sourceMappingEdges as JsonRecord[]

  const supportingEdgesForGoal = (goalId: string): JsonRecord[] => edges.filter((edge) => (
    (edge.selectedChildGoalIds as string[]).includes(goalId)
    || (edge.alternativeCanonicalBinding as JsonRecord | undefined)?.canonicalGoalId === goalId
  )).sort((left, right) => String(left.edgeKey).localeCompare(String(right.edgeKey)))

  for (const spec of childSpecs) {
    const supportingEdges = supportingEdgesForGoal(spec.id)
    if (supportingEdges.length === 0) throw new Error(`No direct source evidence for split child ${spec.id}`)
    const sources = supportingEdges.map(edgeSourceEvidence)
    const primary = sources[0]
    const additionalSourceLandscapeIds = [...new Set(sources
      .map((source) => source.sourceLandscapeId)
      .filter((sourceLandscapeId) => sourceLandscapeId !== primary.sourceLandscapeId))].sort()
    provenance[spec.id] = {
      sourceLandscapeId: primary.sourceLandscapeId,
      sourceGoalId: primary.sourceGoalId,
      ...(additionalSourceLandscapeIds.length > 0 ? { additionalSourceLandscapeIds } : {}),
    }
  }

  for (const parentId of splitParentIds) {
    const childGoalIds = childIdsByParent.get(parentId)!
    const supportingEdges = childGoalIds.flatMap(supportingEdgesForGoal)
      .sort((left, right) => String(left.edgeKey).localeCompare(String(right.edgeKey)))
    const sources = supportingEdges.map(edgeSourceEvidence)
    const existing = provenance[parentId] as JsonRecord | undefined
    const primary = existing?.sourceLandscapeId
      ? {
          sourceLandscapeId: existing.sourceLandscapeId as string,
          sourceGoalId: existing.sourceGoalId as string | undefined,
        }
      : sources[0]
    if (!primary?.sourceLandscapeId) throw new Error(`No provenance source for split parent ${parentId}`)
    const additionalSourceLandscapeIds = [...new Set([
      ...((existing?.additionalSourceLandscapeIds as string[] | undefined) ?? []),
      ...sources.map((source) => source.sourceLandscapeId),
    ].filter((sourceLandscapeId) => sourceLandscapeId !== primary.sourceLandscapeId))].sort()
    provenance[parentId] = {
      sourceLandscapeId: primary.sourceLandscapeId,
      ...(primary.sourceGoalId ? { sourceGoalId: primary.sourceGoalId } : {}),
      ...(additionalSourceLandscapeIds.length > 0 ? { additionalSourceLandscapeIds } : {}),
    }
  }

  landscape.goalProvenance = Object.fromEntries(
    Object.entries(provenance).sort(([left], [right]) => left.localeCompare(right)),
  )
  return registry
}

function buildSurrogateEvidence(): JsonRecord {
  const registry = readJson(paths.surrogateEvidence)
  if (!Array.isArray(registry.entries)) throw new Error('Surrogate evidence registry has no entries[]')
  const stale = (registry.entries as JsonRecord[]).filter((entry) => (
    entry.landscapeId === mathLandscapeId
    && entry.jurisdiction === 'DE-HB'
    && entry.goalId === 'ca623958-c204-5d1b-bdd0-3f76765674cb'
    && entry.requiredByGoalId === ids.volumeSurfaceCluster
  ))
  const alreadyAfter = (registry.entries as JsonRecord[]).some((entry) => (
    entry.landscapeId === mathLandscapeId
    && entry.jurisdiction === 'DE-HB'
    && entry.goalId === 'ca623958-c204-5d1b-bdd0-3f76765674cb'
    && entry.requiredByGoalId === ids.cuboidVolumeFormula
  ))
  if (stale.length !== 1 && !alreadyAfter) {
    throw new Error(`Expected one stale HB volume requires-closure entry, found ${stale.length}`)
  }
  registry.entries = (registry.entries as JsonRecord[]).filter((entry) => !stale.includes(entry))
  const additions: JsonRecord[] = [
    {
      landscapeId: mathLandscapeId,
      goalId: ids.cuboidVolumeFormula,
      jurisdiction: 'DE-HB',
      evidenceType: 'requires-closure',
      requiredByGoalId: ids.cuboidVolume,
      status: 'accepted',
      rationale: 'DE-HB Mathematik: Das direkt source-gedeckte Ziel zum Bestimmen von Quader- und Würfelvolumina macht die Plausibilisierung der Quaderformel mit Einheitswürfeln als kanonische prerequisite bridge sichtbar; akzeptiert als didaktische requires-closure-Brücke, nicht als zusätzliches originales Lehrplanziel.',
    },
    {
      landscapeId: mathLandscapeId,
      goalId: ids.convertVolumeUnits,
      jurisdiction: 'DE-HB',
      evidenceType: 'requires-closure',
      requiredByGoalId: ids.cuboidVolume,
      status: 'accepted',
      rationale: 'DE-HB Mathematik: Das direkt source-gedeckte Ziel zum Bestimmen von Quader- und Würfelvolumina macht Volumeneinheiten und Einheitswürfel als kanonische prerequisite bridge sichtbar; akzeptiert als didaktische requires-closure-Brücke, nicht als zusätzliches originales Lehrplanziel.',
    },
    {
      landscapeId: mathLandscapeId,
      goalId: 'ca623958-c204-5d1b-bdd0-3f76765674cb',
      jurisdiction: 'DE-HB',
      evidenceType: 'requires-closure',
      requiredByGoalId: ids.cuboidVolumeFormula,
      status: 'accepted',
      rationale: 'DE-HB Mathematik: Die als prerequisite bridge akzeptierte Plausibilisierung der Quaderformel erfordert einheitengerechtes Rechnen und Deuten; diese zweite Stufe der kanonischen requires-closure bleibt didaktische Brücke und kein zusätzliches originales Lehrplanziel.',
    },
  ]
  for (const addition of additions) {
    const duplicate = (registry.entries as JsonRecord[]).some((entry) => (
      entry.landscapeId === addition.landscapeId
      && entry.goalId === addition.goalId
      && entry.jurisdiction === addition.jurisdiction
      && entry.requiredByGoalId === addition.requiredByGoalId
    ))
    if (!duplicate) (registry.entries as JsonRecord[]).push(addition)
  }
  return registry
}

const isCompositionGoalReference = (value: unknown): value is JsonRecord =>
  Boolean(
    value
    && typeof value === 'object'
    && ['goalEntry', 'canonicalSubtree'].includes((value as JsonRecord).kind)
    && typeof (value as JsonRecord).goalId === 'string',
  )

function countCompositionReferences(value: unknown, goalId: string): number {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countCompositionReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const own = isCompositionGoalReference(value) && value.goalId === goalId ? 1 : 0
  return own + Object.values(value as JsonRecord)
    .reduce((sum: number, nested) => sum + countCompositionReferences(nested, goalId), 0)
}

function findCompositionStructure(value: unknown, structureId: string): JsonRecord | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findCompositionStructure(entry, structureId)
      if (found) return found
    }
    return null
  }
  if (!value || typeof value !== 'object') return null
  const record = value as JsonRecord
  if (record.kind === 'structure' && record.id === structureId) return record
  return findCompositionStructure(record.children, structureId)
}

function transformCompositionNodeArrays(
  value: unknown,
  transform: (entry: JsonRecord) => JsonRecord[] | null,
): unknown {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (entry && typeof entry === 'object') {
        const replacement = transform(entry as JsonRecord)
        if (replacement) return replacement.map((node) => transformCompositionNodeArrays(node, transform) as JsonRecord)
      }
      return [transformCompositionNodeArrays(entry, transform)]
    })
  }
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value as JsonRecord).map(([key, nested]) => [
    key,
    transformCompositionNodeArrays(nested, transform),
  ]))
}

const goalEntry = (
  goalId: string,
  projectionRole?: 'target' | 'prerequisiteOnly',
): JsonRecord => ({
  kind: 'goalEntry',
  goalId,
  ...(projectionRole && projectionRole !== 'target' ? { projectionRole } : {}),
})

const canonicalSubtree = (
  goalId: string,
  projectionRole?: 'target' | 'prerequisiteOnly',
): JsonRecord => ({
  kind: 'canonicalSubtree',
  goalId,
  ...(projectionRole && projectionRole !== 'target' ? { projectionRole } : {}),
})

function replaceGoalEntries(view: JsonRecord, oldGoalId: string, replacements: JsonRecord[]): JsonRecord {
  return transformCompositionNodeArrays(view, (entry) => (
    entry.kind === 'goalEntry' && entry.goalId === oldGoalId
      ? replacements.map((replacement) => structuredClone(replacement))
      : null
  )) as JsonRecord
}

function removeGoalReferences(view: JsonRecord, goalId: string): JsonRecord {
  return transformCompositionNodeArrays(view, (entry) => (
    isCompositionGoalReference(entry) && entry.goalId === goalId ? [] : null
  )) as JsonRecord
}

const structureContainsReference = (structure: JsonRecord, goalId: string): boolean =>
  countCompositionReferences(structure, goalId) > 0

function moveBwParentSubtree(view: JsonRecord, parentId: string): void {
  const destination = findCompositionStructure(view.rootNodes, 'jg5_6_raum_form')
  if (!destination || !Array.isArray(destination.children)) {
    throw new Error(`${String(view.viewId)} is missing jg5_6_raum_form`)
  }
  if (structureContainsReference(destination, parentId)) {
    if (countCompositionReferences(view, parentId) !== 1) {
      throw new Error(`${String(view.viewId)} has duplicate BW parent subtree ${parentId}`)
    }
    return
  }
  if (countCompositionReferences(view, parentId) !== 1) {
    throw new Error(`${String(view.viewId)} expected one movable BW parent subtree ${parentId}`)
  }
  const without = removeGoalReferences(view, parentId)
  Object.assign(view, without)
  const refreshedDestination = findCompositionStructure(view.rootNodes, 'jg5_6_raum_form')
  if (!refreshedDestination || !Array.isArray(refreshedDestination.children)) {
    throw new Error(`${String(view.viewId)} lost jg5_6_raum_form while moving ${parentId}`)
  }
  refreshedDestination.children.push(canonicalSubtree(parentId))
}

const shStageNode = (suffix: string): JsonRecord => ({
  kind: 'structure',
  id: `sh-stage-wide-j6-geometry-${suffix}`,
  label: 'Stufenübergreifend lehrplanbelegte Raum-und-Form-Kompetenzen',
  children: [
    canonicalSubtree(ids.reflectionsCluster),
    goalEntry(ids.nets),
    goalEntry(ids.obliqueViews),
  ],
})

const shBaseJ6WithoutStageWideGeometry = (): JsonRecord => ({
  kind: 'structure',
  id: 'sh-j6-source-safe-base',
  label: 'Jahrgangsstufe 6',
  children: [
    canonicalSubtree('de39c9fe-5940-4320-aca8-2be85d6ada8f'),
    canonicalSubtree('e07fa2ee-c26f-4032-9140-358a4f6c1457'),
    canonicalSubtree('32c9955e-c0e7-4085-8a9a-9341376a453b'),
    {
      kind: 'structure',
      id: 'sh-j6-circle-body-without-stage-wide-geometry',
      label: 'Kreis- und Körpervorstellungen',
      children: [
        canonicalSubtree('8a691345-3216-522c-a898-d65e8e94db28'),
        canonicalSubtree(ids.classifySolids),
        canonicalSubtree(ids.linkedRepresentations),
      ],
    },
    canonicalSubtree('bfca2b3d-c62c-52e0-bdf6-7d51f004383b'),
    canonicalSubtree('7a2a5706-aff4-4fd0-b092-1779d6ecbc1f'),
  ],
})

function ensureShBaseJ6Split(view: JsonRecord, fileName: string): void {
  const expected = shBaseJ6WithoutStageWideGeometry()
  const existing = findCompositionStructure(view.rootNodes, expected.id as string)
  if (existing) {
    if (stableJson(existing) !== stableJson(expected)) {
      throw new Error(`${fileName} has a divergent source-safe SH J6 structure`)
    }
    return
  }
  if (countCompositionReferences(view, '8f7bb79b-f014-4bb6-8dce-7e3f1c92e893') !== 1) {
    throw new Error(`${fileName} expected one SH J6 canonicalSubtree before source-safe materialization`)
  }
  const transformed = transformCompositionNodeArrays(view, (entry) => (
    entry.kind === 'canonicalSubtree' && entry.goalId === '8f7bb79b-f014-4bb6-8dce-7e3f1c92e893'
      ? [structuredClone(expected)]
      : null
  )) as JsonRecord
  Object.assign(view, transformed)
}

function ensureShStageNode(view: JsonRecord, fileName: string): void {
  const durationMatch = fileName.match(/-(g8|g9)\.view\.json$/u)
  const parentId = durationMatch ? `sh-sek1-${durationMatch[1]}` : 'sh-seki-raum-form'
  const suffix = durationMatch?.[1] ?? 'base'
  const expected = shStageNode(suffix)
  const existing = findCompositionStructure(view.rootNodes, expected.id as string)
  if (existing) {
    if (stableJson(existing) !== stableJson(expected)) {
      throw new Error(`${fileName} has a divergent SH stage-level J6 structure`)
    }
    return
  }
  const parent = findCompositionStructure(view.rootNodes, parentId)
  if (!parent || !Array.isArray(parent.children)) {
    throw new Error(`${fileName} is missing SH stage-level insertion parent ${parentId}`)
  }
  parent.children.push(expected)
}

function transformCompositionView(fileName: string, original: JsonRecord): JsonRecord {
  let view = structuredClone(original)
  const isBw = /^de-bw-(?:gk|lk|seki)\.view\.json$/u.test(fileName)
  const isBy = /^de-by-(?:gk|lk)\.view\.json$/u.test(fileName)
  const isHeG8 = /^de-he-(?:gk|lk|seki)-g8\.view\.json$/u.test(fileName)
  const isHeG9 = /^de-he-(?:gk|lk|seki)-g9\.view\.json$/u.test(fileName)
  const isRpDuration = /^de-rp-(?:gk|lk|seki)-(?:g8|g9)\.view\.json$/u.test(fileName)
  const isShDuration = /^de-sh-(?:gk|lk|seki)-(?:g8|g9)\.view\.json$/u.test(fileName)
  const isShBase = /^de-sh-(?:gk|lk)\.view\.json$/u.test(fileName)

  if (countCompositionReferences(view, ids.volumeSurfaceCluster) > 0) {
    if (isBw) {
      const references = countCompositionReferences(view, ids.volumeSurfaceCluster)
      if (references !== 1) throw new Error(`${fileName} expected one BW volume parent subtree`)
    } else if (isBy || isHeG8 || isHeG9 || isRpDuration || isShDuration) {
      view = replaceGoalEntries(view, ids.volumeSurfaceCluster, [
        goalEntry(ids.cuboidVolume),
        goalEntry(ids.cuboidSurface),
      ])
    } else {
      throw new Error(`${fileName} has an unreviewed volume-parent composition scope`)
    }
  }

  if (isBw) {
    moveBwParentSubtree(view, ids.reflectionsCluster)
    moveBwParentSubtree(view, ids.representationsCluster)
  } else if (isBy) {
    view = removeGoalReferences(view, ids.reflectionsCluster)
    view = replaceGoalEntries(view, ids.representationsCluster, [
      goalEntry(ids.nets, 'prerequisiteOnly'),
      goalEntry(ids.obliqueViews, 'prerequisiteOnly'),
    ])
  } else if (isHeG8) {
    view = removeGoalReferences(view, ids.reflectionsCluster)
    view = removeGoalReferences(view, ids.axisReflection)
    view = removeGoalReferences(view, ids.pointReflection)
    view = replaceGoalEntries(view, ids.representationsCluster, [
      goalEntry(ids.nets),
      goalEntry(ids.obliqueViews),
    ])
    if (countCompositionReferences(view, ids.orthographicViews) === 0) {
      const j9 = findCompositionStructure(view.rootNodes, 'j9-g8-kompetenzen')
      if (!j9 || !Array.isArray(j9.children)) throw new Error(`${fileName} is missing j9-g8-kompetenzen`)
      j9.children.push(goalEntry(ids.orthographicViews))
    }
  } else if (isHeG9) {
    view = removeGoalReferences(view, ids.reflectionsCluster)
    view = removeGoalReferences(view, ids.axisReflection)
    view = removeGoalReferences(view, ids.pointReflection)
    view = removeGoalReferences(view, ids.representationsCluster)
  }

  if (isShBase) ensureShBaseJ6Split(view, fileName)
  if (isShDuration || isShBase) ensureShStageNode(view, fileName)
  return view
}

function validateCompositionViewContract(fileName: string, view: JsonRecord): void {
  const isBw = /^de-bw-(?:gk|lk|seki)\.view\.json$/u.test(fileName)
  const isBy = /^de-by-(?:gk|lk)\.view\.json$/u.test(fileName)
  const isHeG8 = /^de-he-(?:gk|lk|seki)-g8\.view\.json$/u.test(fileName)
  const isHeG9 = /^de-he-(?:gk|lk|seki)-g9\.view\.json$/u.test(fileName)
  const isSh = /^de-sh-(?:(?:gk|lk|seki)-(?:g8|g9)|(?:gk|lk))\.view\.json$/u.test(fileName)
  const hasSplitScope = isBw || isBy || isHeG8 || isHeG9
    || /^de-(?:rp|sh)-(?:gk|lk|seki)-(?:g8|g9)\.view\.json$/u.test(fileName)

  for (const childId of childIds) {
    if (countCompositionReferences(view, childId) > 1) {
      throw new Error(`${fileName} has duplicate direct split-child references for ${childId}`)
    }
  }
  if (isBw) {
    for (const parentId of [ids.volumeSurfaceCluster, ids.reflectionsCluster, ids.representationsCluster]) {
      if (countCompositionReferences(view, parentId) !== 1) {
        throw new Error(`${fileName} must retain exactly one BW canonicalSubtree ${parentId}`)
      }
    }
    const destination = findCompositionStructure(view.rootNodes, 'jg5_6_raum_form')!
    if (!structureContainsReference(destination, ids.reflectionsCluster)
      || !structureContainsReference(destination, ids.representationsCluster)) {
      throw new Error(`${fileName} must locate both BW geometry parent subtrees in Klassen 5/6 Raum und Form`)
    }
  } else if (hasSplitScope) {
    if (countCompositionReferences(view, ids.volumeSurfaceCluster) !== 0) {
      throw new Error(`${fileName} retains an unsupported volume goalEntry parent`)
    }
  }
  if (isBy) {
    if (countCompositionReferences(view, ids.reflectionsCluster) !== 0
      || countCompositionReferences(view, ids.axisReflection) !== 0
      || countCompositionReferences(view, ids.pointReflection) !== 0
      || countCompositionReferences(view, ids.representationsCluster) !== 0
      || countCompositionReferences(view, ids.orthographicViews) !== 0
      || countCompositionReferences(view, ids.linkedRepresentations) !== 1) {
      throw new Error(`${fileName} violates the BY source-support projection contract`)
    }
    for (const childId of [ids.nets, ids.obliqueViews]) {
      const serialized = stableJson(view)
      if (countCompositionReferences(view, childId) !== 1
        || !serialized.includes(`"goalId":"${childId}","kind":"goalEntry","projectionRole":"prerequisiteOnly"`)) {
        throw new Error(`${fileName} must expose ${childId} only as prerequisiteOnly via ${ids.linkedRepresentations}`)
      }
    }
  }
  if (isHeG8) {
    for (const childId of [ids.nets, ids.obliqueViews, ids.orthographicViews]) {
      if (countCompositionReferences(view, childId) !== 1) throw new Error(`${fileName} is missing HE G8 child ${childId}`)
    }
    if (countCompositionReferences(view, ids.representationsCluster) !== 0
      || countCompositionReferences(view, ids.reflectionsCluster) !== 0
      || countCompositionReferences(view, ids.axisReflection) !== 0
      || countCompositionReferences(view, ids.pointReflection) !== 0) {
      throw new Error(`${fileName} retains unsupported HE G8 parent targets`)
    }
    const j5 = findCompositionStructure(view.rootNodes, 'j5-g8-kompetenzen')!
    const j9 = findCompositionStructure(view.rootNodes, 'j9-g8-kompetenzen')!
    if (!structureContainsReference(j5, ids.nets)
      || !structureContainsReference(j5, ids.obliqueViews)
      || !structureContainsReference(j9, ids.orthographicViews)) {
      throw new Error(`${fileName} violates HE G8 J5 nets+oblique / J9 orthographic placement`)
    }
  }
  if (isHeG9) {
    for (const goalId of [
      ids.reflectionsCluster, ids.axisReflection, ids.pointReflection,
      ids.representationsCluster, ids.nets, ids.obliqueViews, ids.orthographicViews,
    ]) {
      if (countCompositionReferences(view, goalId) !== 0) {
        throw new Error(`${fileName} exposes unsupported HE G9 geometry goal ${goalId}`)
      }
    }
  }
  if (isSh) {
    if (countCompositionReferences(view, ids.reflectionsCluster) !== 1
      || countCompositionReferences(view, ids.nets) !== 1
      || countCompositionReferences(view, ids.obliqueViews) !== 1
      || countCompositionReferences(view, ids.representationsCluster) !== 0
      || countCompositionReferences(view, ids.orthographicViews) !== 0) {
      throw new Error(`${fileName} violates the SH stage-level geometry contract`)
    }
    if (/^de-sh-(?:gk|lk)\.view\.json$/u.test(fileName)
      && countCompositionReferences(view, '8f7bb79b-f014-4bb6-8dce-7e3f1c92e893') !== 0) {
      throw new Error(`${fileName} retains the overlapping broad J6 canonicalSubtree`)
    }
  }
}

function buildCompositionViews(): Map<string, JsonRecord> {
  const result = new Map<string, JsonRecord>()
  for (const entry of readdirSync(compositionRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.view.json')) continue
    const absolutePath = join(compositionRoot, entry.name)
    const original = JSON.parse(readFileSync(absolutePath, 'utf8')) as JsonRecord
    const view = transformCompositionView(entry.name, original)
    validateCompositionViewContract(entry.name, view)
    if (stableJson(view) !== stableJson(original)) result.set(absolutePath, view)
  }
  return result
}

function buildAtlasSources(): JsonRecord {
  const config = readJson(paths.atlasSources)
  const count = config.expectedCurricularAtomicGoalCount
  if (count !== 787 && count !== 791) {
    throw new Error(`Atlas expectedCurricularAtomicGoalCount is ${String(count)}, expected reviewed before=787 or after=791`)
  }
  config.expectedCurricularAtomicGoalCount = 791
  return config
}

const replaceExactOnce = (text: string, before: string, after: string, label: string): string => {
  if (text.includes(after)) {
    if (text.includes(before)) throw new Error(`${label} contains both before and after text`)
    return text
  }
  const occurrences = text.split(before).length - 1
  if (occurrences !== 1) throw new Error(`${label} expected one exact before occurrence, found ${occurrences}`)
  return text.replace(before, after)
}

function buildAssessmentMarkdown(): Map<string, string> {
  const result = new Map<string, string>()
  const blueprintBefore = readFileSync(resolve(repoRoot, paths.blueprint), 'utf8')
  let blueprint = replaceExactOnce(
    blueprintBefore,
    '| 5 | `draft_v1.md` | 6 | Quader erkennen, Darstellungen verknüpfen, Volumen mit Einheitswürfeln plausibilisieren und Oberfläche berechnen. | c823b5a2-82e3-5e22-9c27-c0f41cc5eac6 (Elementare Körper erkennen und benennen)<br>59098969-0a35-5a58-94f2-1cfcdf191cf5 (Quader- und Würfeldarstellungen zeichnen)<br>11c88ea2-8502-5008-bec2-3e491c75ace4 (Darstellungsformen gerader Körper verknüpfen)<br>b44f038c-fb1f-527e-b9ad-382214d0328a (Volumenformel des Quaders mit Einheitswürfeln plausibilisieren)<br>1f89d69e-ead1-424b-8221-fae37fdea2bc (Volumina und Oberflächen einfacher Körper berechnen) |',
    '| 5 | `draft_v1.md` | 6 | Quader erkennen und Darstellungsformen benennen, Volumen mit Einheitswürfeln plausibilisieren und den Oberflächeninhalt ohne Deckel berechnen. | c823b5a2-82e3-5e22-9c27-c0f41cc5eac6 (Elementare Körper erkennen und benennen)<br>b44f038c-fb1f-527e-b9ad-382214d0328a (Volumenformel des Quaders mit Einheitswürfeln plausibilisieren)<br>99ef0fc2-150a-51e8-bac8-7e40e46917b (Volumina von Quadern, Würfeln und daraus zusammengesetzten Körpern bestimmen)<br>cddcdabd-ad58-58ad-bfbd-d9fd8fe2d8fa (Oberflächeninhalte von Quadern und Würfeln aus ihren Seitenflächen berechnen) |',
    'J6 blueprint Task 5',
  )
  blueprint = replaceExactOnce(
    blueprint,
    '| 6 | `draft_v3.md` | 6 | Pi als Kreisverhältnis deuten, einen prozentualen Anteil berechnen, ein Säulendiagramm eigenständig beurteilen, Spiegelungen ausführen und einfache Muster fortsetzen. | 8a691345-3216-522c-a898-d65e8e94db28 (Zahl Pi als Verhältnis am Kreis erklären)<br>71d43fcc-d787-4874-ae4a-2336364e9c0a (Grundaufgaben der Prozentrechnung lösen)<br>72b6bfa5-8e34-4029-8f85-0277207c485e (Prozentangaben in Texten deuten und prüfen)<br>0c2ddfcd-1399-41ad-aaed-4f061812602a (Diagramme deuten)<br>acbb7e26-f85f-405b-a3e5-affa6add6711 (Diagramme kritisch interpretieren)<br>1335dff9-db1e-5dd6-aa55-3938b6d3b0ec (Achsenspiegelungen und Punktspiegelungen durchführen)<br>8cb18560-3a2b-593e-b634-9d768566cba9 (Muster und Zahlenfolgen erkennen, beschreiben und fortsetzen) |',
    '| 6 | `draft_v3.md` | 6 | Pi als Kreisverhältnis deuten, einen prozentualen Anteil berechnen, ein Säulendiagramm eigenständig beurteilen, eine Achsenspiegelung ausführen und einfache Muster fortsetzen. | 8a691345-3216-522c-a898-d65e8e94db28 (Zahl Pi als Verhältnis am Kreis erklären)<br>71d43fcc-d787-4874-ae4a-2336364e9c0a (Grundaufgaben der Prozentrechnung lösen)<br>72b6bfa5-8e34-4029-8f85-0277207c485e (Prozentangaben in Texten deuten und prüfen)<br>0c2ddfcd-1399-41ad-aaed-4f061812602a (Diagramme deuten)<br>acbb7e26-f85f-405b-a3e5-affa6add6711 (Diagramme kritisch interpretieren)<br>2f3d24e7-2450-55d8-97c2-3e106d2854c6 (Achsenspiegelungen konstruieren)<br>8cb18560-3a2b-593e-b634-9d768566cba9 (Muster und Zahlenfolgen erkennen, beschreiben und fortsetzen) |',
    'J6 blueprint Task 6',
  )
  blueprint = replaceExactOnce(
    blueprint,
    '# J6 Mathematics Exam Blueprint v3\n\nStatus: Task 6 v3 promoted after focused structural review; Tasks 1-5 remain on v1\n\nTotal: 36 BE\nTime: 60 minutes',
    '# J6 Mathematics Exam Blueprint v4\n\nStatus: Task 6 v3 remains promoted; two separate structural-split route-closing tasks were released after focused review on 2026-08-27\n\nMain examination total: 36 BE\nMain examination time: 60 minutes\nSupplemental route-closing tasks: 16 BE; they are not part of the 36-BE main examination',
    'J6 blueprint v4 header',
  )
  if (!blueprint.includes('## Additional route-closing tasks (not part of the 36-BE main examination)')) {
    const supplementalRows = `\n\n## Additional route-closing tasks (not part of the 36-BE main examination)\n\n| Task | Source | BE | Focus | Covered goals |\n| --- | --- | ---: | --- | --- |\n| S1 | \`structural-split-route-follow-up-2026-08-27/j6/j6-point-reflection/draft_v1.md\` | 6 | Punktspiegelung an einem gegebenen Zentrum konstruieren und die Mittelpunktbedingung an einem Punkt-Bildpunkt-Paar prüfen. | ${ids.pointReflection} (Punktspiegelungen konstruieren) |\n| S2 | \`structural-split-route-follow-up-2026-08-27/j6/j6-cuboid-representation-switching/draft_v1.md\` | 10 | Netz, Schrägbild und vorgeschriebene orthogonale Draufsicht desselben Quaders zeichnen und anhand derselben Fläche und Markierung verknüpfen. | ${ids.nets} (Netze von Quadern und Würfeln zeichnen)<br>${ids.obliqueViews} (Schrägbilder von Quadern und Würfeln zeichnen)<br>${ids.orthographicViews} (Eine orthogonale Ansicht eines Quaders oder Würfels zeichnen)<br>${ids.linkedRepresentations} (Darstellungsformen gerader Körper verknüpfen) |`
    blueprint = replaceExactOnce(
      blueprint,
      '\n\nDesign notes:',
      `${supplementalRows}\n\nDesign notes:`,
      'J6 blueprint supplemental structural-split tasks',
    )
  }
  if (!blueprint.includes('The representation follow-up is target-visible only in the reviewed Baden-Wuerttemberg J5/6 scope')) {
    blueprint += '\n- The point-reflection follow-up is jurisdiction-exact for Baden-Wuerttemberg and Schleswig-Holstein.\n'
      + '- The representation follow-up is target-visible only in the reviewed Baden-Wuerttemberg J5/6 scope. Hessen is deliberately excluded because its approved G8 placement separates nets and oblique drawings in J5 from orthographic views in J9.\n'
      + '- For both supplemental tasks, `requires` and `examData.coveredGoalIds` are byte-for-byte equal and contain only competencies actually assessed.\n'
  }
  result.set(paths.blueprint, blueprint)

  const reviewBefore = readFileSync(resolve(repoRoot, paths.simulatedReview), 'utf8')
  let review = replaceExactOnce(
    reviewBefore,
    'The expected results, total of 6 BE, covered goals, prerequisites and demand levels are unchanged. Earlier promoted artifacts remain immutable.',
    'The expected results, total of 6 BE and demand levels are unchanged. The reflection coverage and prerequisite are narrowed from the former combined reflection parent to the exact axis-reflection child. Earlier promoted source artifacts remain immutable.',
    'J6 simulated review unchanged-contract claim',
  )
  review = replaceExactOnce(
    review,
    '- `1335dff9-db1e-5dd6-aa55-3938b6d3b0ec` - Achsenspiegelungen und Punktspiegelungen durchführen;',
    '- `2f3d24e7-2450-55d8-97c2-3e106d2854c6` - Achsenspiegelungen konstruieren;',
    'J6 simulated review reflection goal',
  )
  review = replaceExactOnce(
    review,
    '- Canonical Task 6 retains the same `requires`, `coveredGoalIds`, total points and passing threshold.',
    '- Canonical Task 6 retains the same total points and passing threshold; its `requires` and `coveredGoalIds` narrow only the reflection binding to the exact axis-reflection child.',
    'J6 simulated review promotion condition',
  )
  result.set(paths.simulatedReview, review)

  const pointDraft = `# Punktspiegelung an einem gegebenen Zentrum konstruieren und prüfen\n\n<a id="aufgabe"></a>\nIm Koordinatensystem sind das Spiegelzentrum $Z(2|1)$ sowie die Punkte $A(0|0)$, $B(4|0)$ und $C(1|3)$ gegeben.\n\n1. Konstruiere die Bildpunkte $A'$, $B'$ und $C'$ der Punktspiegelung an $Z$ und gib ihre Koordinaten an. (4 BE)\n2. Prüfe für $B$ und $B'$ ausdrücklich, dass $Z$ auf der Verbindungsstrecke liegt und von beiden Punkten gleich weit entfernt ist. Begründe mit den Koordinaten oder den Verschiebungsschritten. (2 BE)\n`
  const pointSolution = `# Punktspiegelung an einem gegebenen Zentrum konstruieren und prüfen — Lösung und Bewertungsraster\n\n<a id="loesung"></a>\n1. $A'(4|2)$, $B'(0|2)$ und $C'(3|-1)$. Für die drei richtigen Bildpunkte werden je 1 BE und für eine nachvollziehbare Konstruktion insgesamt 1 BE vergeben. (4 BE)\n2. Von $B(4|0)$ nach $Z(2|1)$ geht man $2$ Einheiten nach links und $1$ Einheit nach oben. Von $Z(2|1)$ nach $B'(0|2)$ gilt derselbe Verschiebungsschritt. Daher liegen $B$, $Z$ und $B'$ auf einer Geraden, und die Strecken $BZ$ und $ZB'$ sind gleich lang. Eine gleichwertige Prüfung mit dem Mittelpunkt oder den Abständen ist zulässig. (2 BE)\n\nBestehensgrenze: 3 von 6 BE.\n`
  const pointReview = `# Fokussierter Inhaltsreview — Punktspiegelung an einem gegebenen Zentrum\n\nStatus: RELEASED_FOCUSED_REVIEW\n\nGoal ID: \`${ids.pointReflectionAssessment}\`\nReview date: 2026-08-27\nDraft SHA-256: \`${sha256Bytes(pointDraft)}\`\nSolution SHA-256: \`${sha256Bytes(pointSolution)}\`\n\nDecision: PASS. Die Aufgabe prüft ausschließlich \`${ids.pointReflection}\`: drei Punktspiegelungen werden konstruiert, anschließend werden Kollinearität und gleiche Entfernung am gegebenen Zentrum explizit geprüft. Achsenspiegelung wird weder verlangt noch als Coverage behauptet. \`requires\` und \`coveredGoalIds\` sind identisch. Die Aufgabe ist für BW und SH fachlich belegt und endet im J6-Prüfungsordner.\n`
  result.set(paths.pointReflectionDraft, pointDraft)
  result.set(paths.pointReflectionSolution, pointSolution)
  result.set(paths.pointReflectionReview, pointReview)

  const representationDraft = `# Quaderdarstellungen zeichnen und verknüpfen\n\n<a id="aufgabe"></a>\nEin Quader ist $6 cm$ lang, $4 cm$ breit und $3 cm$ hoch. Die $6 cm\\times3 cm$ große Seitenfläche ist als Vorderfläche festgelegt. Der Punkt $P$ liegt an der vorderen linken Ecke der Oberseite.\n\n1. Zeichne ein vollständiges, zusammenhängendes Netz mit allen Maßen. Kennzeichne die Vorderfläche und $P$, und prüfe durch gedankliches Falten, dass keine Flächen überlappen. (3 BE)\n2. Zeichne ein regelgerechtes Schrägbild mit der festgelegten Vorderfläche, nach hinten laufenden parallelen Kanten sowie sichtbaren und verdeckten Kanten. Übertrage $P$ an die entsprechende Ecke. (3 BE)\n3. Zeichne die vorgeschriebene orthogonale Ansicht von oben mit den richtigen Seitenlängen und markiere $P$. (2 BE)\n4. Erläutere anhand der Oberseite und des Punkts $P$, wie Netz, Schrägbild, Draufsicht und der gedachte Quader dieselbe räumliche Situation darstellen. (2 BE)\n`
  const representationSolution = `# Quaderdarstellungen zeichnen und verknüpfen — Lösung und Bewertungsraster\n\n<a id="loesung"></a>\n1. Das Netz enthält zwei Rechtecke $6 cm\\times4 cm$, zwei Rechtecke $6 cm\\times3 cm$ und zwei Rechtecke $4 cm\\times3 cm$. Es ist zusammenhängend, ohne Überlappung faltbar, und Vorderfläche, Oberseite sowie $P$ liegen an zueinander passenden Kanten und Ecken. (3 BE)\n2. Das Schrägbild zeigt die festgelegte $6 cm\\times3 cm$-Vorderfläche, die Tiefe $4 cm$, parallele entsprechende Kanten und regelgerecht gekennzeichnete verdeckte Kanten. $P$ liegt an der vorderen linken Ecke der Oberseite. (3 BE)\n3. Die orthogonale Draufsicht ist ein Rechteck $6 cm$ mal $4 cm$; $P$ liegt an der zur Vorderkante gehörenden linken Ecke. (2 BE)\n4. Beim Falten des Netzes wird die $6 cm\\times4 cm$-Fläche zur Oberseite. Dieselbe Fläche erscheint im Schrägbild räumlich und in der Draufsicht unverzerrt als Rechteck. Die gemeinsame Lage von $P$ an der vorderen linken Ecke belegt den konsistenten Darstellungswechsel. (2 BE)\n\nBestehensgrenze: 5 von 10 BE.\n`
  const representationReview = `# Fokussierter Inhaltsreview — Quaderdarstellungen zeichnen und verknüpfen\n\nStatus: RELEASED_FOCUSED_REVIEW\n\nGoal ID: \`${ids.representationAssessment}\`\nReview date: 2026-08-27\nDraft SHA-256: \`${sha256Bytes(representationDraft)}\`\nSolution SHA-256: \`${sha256Bytes(representationSolution)}\`\n\nDecision: PASS. Die Aufgabe prüft ein vollständiges Netz, ein regelgerechtes Schrägbild, genau eine vorgeschriebene orthogonale Ansicht und einen echten Darstellungswechsel anhand derselben Oberseite und Markierung. \`requires\` und \`coveredGoalIds\` enthalten exakt \`${ids.nets}\`, \`${ids.obliqueViews}\`, \`${ids.orthographicViews}\` und \`${ids.linkedRepresentations}\`. Die Aufgabe ist jahrgangsgenau nur für BW freigegeben. HE bleibt trotz roher Jurisdiktionsschnittmenge ausgeschlossen, weil die geprüften Kompetenzen dort in der genehmigten G8-Komposition auf J5 und J9 verteilt sind.\n`
  result.set(paths.representationDraft, representationDraft)
  result.set(paths.representationSolution, representationSolution)
  result.set(paths.representationReview, representationReview)

  const reviewV4 = `# Focused Structural-Split Route Review — J6 Mathematics Exam v4\n\nReviewer: Codex focused didactic QA\n\nReview date: 2026-08-27\n\nDecision: approved for release of two supplemental route-closing tasks\n\nThe promoted Tasks 1-6 and their source bytes remain unchanged. Supplemental task \`${ids.pointReflectionAssessment}\` assesses only \`${ids.pointReflection}\` by construction and an explicit midpoint-condition check; it does not reuse the axis-reflection claim of Task 6. Supplemental task \`${ids.representationAssessment}\` assesses exactly \`${ids.nets}\`, \`${ids.obliqueViews}\`, \`${ids.orthographicViews}\`, and \`${ids.linkedRepresentations}\` through one coherent cuboid situation: net, oblique drawing, one prescribed orthographic top view, and an explained representation change.\n\nFor both endpoints, \`requires\` equals \`examData.coveredGoalIds\`. The point-reflection endpoint is applicable in BW and SH. The combined representation endpoint is deliberately BW-only: the raw BW+HE jurisdiction intersection is narrowed because the approved HE G8 topology places nets and oblique drawings in J5 and orthographic views in J9, so no HE J6 terminal may be published. The two tasks are supplemental route endpoints and do not change the 36-BE main examination or its 60-minute working time.\n`
  result.set(paths.simulatedReviewV4, reviewV4)

  const readmeBefore = readFileSync(resolve(repoRoot, paths.j6AssessmentReadme), 'utf8')
  let readme = replaceExactOnce(
    readmeBefore,
    'Status: Task 6 v3 promoted after focused structural review; Tasks 1-5 remain on v1',
    'Status: Task 6 v3 remains promoted; two supplemental structural-split route tasks are released under focused review v4',
    'J6 assessment README v4 status',
  )
  if (!readme.includes('`simulated_review_v4.md`')) {
    readme = replaceExactOnce(
      readme,
      '- `simulated_review_v3.md` - focused structural review and promotion decision for Task 6 v3',
      '- `simulated_review_v3.md` - focused structural review and promotion decision for Task 6 v3\n- `simulated_review_v4.md` - focused release review for the two supplemental structural-split route tasks; their immutable task bundles live under `structural-split-route-follow-up-2026-08-27/j6/`',
      'J6 assessment README v4 artifact',
    )
  }
  if (!readme.includes('Canonical supplemental structural-split tasks')) {
    readme += `\n- Canonical supplemental structural-split tasks \`${ids.pointReflectionAssessment}\` and \`${ids.representationAssessment}\` reference their immutable 2026-08-27 follow-up bundles and remain separate from the 36-BE main examination.\n`
  }
  result.set(paths.j6AssessmentReadme, readme)
  return result
}

function getProspectiveCompositionView(
  fileName: string,
  compositionViews: Map<string, JsonRecord>,
): JsonRecord {
  const absolutePath = join(compositionRoot, fileName)
  return compositionViews.get(absolutePath)
    ?? JSON.parse(readFileSync(absolutePath, 'utf8')) as JsonRecord
}

function buildDurationPolicy(canonical: JsonRecord, compositionViews: Map<string, JsonRecord>): JsonRecord {
  const policy = readJson(paths.durationPolicy)
  const canonicalInput = (policy.inputs as JsonRecord)?.canonical as JsonRecord | undefined
  if (!canonicalInput || canonicalInput.path !== paths.canonical) {
    throw new Error('Duration policy canonical input is missing or points elsewhere')
  }
  canonicalInput.sha256 = sha256Bytes(serializeJson(canonical))
  for (const template of policy.sek1Templates as JsonRecord[]) {
    const fileName = template.fileName as string
    template.fileSha256 = sha256Bytes(serializeJson(getProspectiveCompositionView(fileName, compositionViews)))
  }
  for (const template of policy.crossStageTemplates as JsonRecord[]) {
    const fileName = template.outputFileName as string
    template.outputSha256 = sha256Bytes(serializeJson(getProspectiveCompositionView(fileName, compositionViews)))
  }
  const policyBody = policy.policy as JsonRecord
  policyBody.j6StructuralSplitContract = {
    adjudicationPath: paths.sourceEdgeAdjudication,
    sourceMappingEdgeCount: 159,
    stableParentClusterIds: [...splitParentIds],
    atomicChildGoalIds: [...childIds],
    shProjectionLevel: 'stage-wide',
    heG8Projection: 'J5 nets and oblique view; J9 orthographic single view',
    heG9Projection: 'none from G8-only sources',
    byRepresentationProjection: `prerequisiteOnly via ${ids.linkedRepresentations}`,
    status: 'LAYER_A_APPLIED_FRESH_V2_DUAL_REVIEW_REQUIRED',
  }
  return policy
}

type JsonOccurrence = { pointer: string; value: string; containerGoalId?: string }

function collectExactIdOccurrences(
  value: unknown,
  targetIds: Set<string>,
  pointer = '',
  containerGoalId?: string,
): JsonOccurrence[] {
  if (typeof value === 'string') return targetIds.has(value) ? [{ pointer, value, containerGoalId }] : []
  if (Array.isArray(value)) return value.flatMap((entry, index) =>
    collectExactIdOccurrences(entry, targetIds, `${pointer}/${index}`, containerGoalId))
  if (!value || typeof value !== 'object') return []
  const record = value as JsonRecord
  const nextContainer = typeof record.id === 'string' && ('contains' in record || 'requires' in record)
    ? record.id
    : containerGoalId
  return Object.entries(record).flatMap(([key, nested]) => collectExactIdOccurrences(
    nested,
    targetIds,
    `${pointer}/${key.replace(/~/gu, '~0').replace(/\//gu, '~1')}`,
    nextContainer,
  ))
}

function collectCompositionReferenceRecords(
  compositionViews: Map<string, JsonRecord>,
): JsonRecord[] {
  const targetIds = new Set([...splitParentIds, ...childIds])
  const references: JsonRecord[] = []
  for (const entry of readdirSync(compositionRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.view.json')) continue
    const view = getProspectiveCompositionView(entry.name, compositionViews)
    const visit = (value: unknown, pointer = ''): void => {
      if (Array.isArray(value)) {
        value.forEach((nested, index) => visit(nested, `${pointer}/${index}`))
        return
      }
      if (!value || typeof value !== 'object') return
      const record = value as JsonRecord
      if (isCompositionGoalReference(record) && targetIds.has(record.goalId as string)) {
        references.push({
          path: relative(repoRoot, join(compositionRoot, entry.name)),
          pointer,
          compositionViewId: view.viewId,
          kind: record.kind,
          goalId: record.goalId,
          projectionRole: record.projectionRole ?? 'target',
          action: splitParentIds.includes(record.goalId as typeof splitParentIds[number])
            ? 'retain_canonical_subtree_at_stable_parent_cluster'
            : 'project_exact_reviewed_atomic_child',
          applicationStatus: 'applied',
        })
      }
      Object.entries(record).forEach(([key, nested]) => visit(
        nested,
        `${pointer}/${key.replace(/~/gu, '~0').replace(/\//gu, '~1')}`,
      ))
    }
    visit(view)
  }
  return references.sort((left, right) => `${left.path}${left.pointer}`.localeCompare(`${right.path}${right.pointer}`))
}

function finalizeSourceEdgeAdjudication(
  initial: JsonRecord,
  canonical: JsonRecord,
  compositionViews: Map<string, JsonRecord>,
  assessmentMarkdown: Map<string, string>,
  mappingResult: MappingBuildResult,
): JsonRecord {
  const adjudication = structuredClone(initial)
  const targetIds = new Set([...splitParentIds, ...childIds])
  const allCanonicalOccurrences = collectExactIdOccurrences(canonical, targetIds)
  const assessmentGoalIds = new Set([
    '974edafb-ea7b-588e-b88a-547e7a097c70',
    '47c515c9-2174-58c7-a844-6865fc67c243',
    ids.pointReflectionAssessment,
    ids.representationAssessment,
  ])
  adjudication.canonicalGraphReferences = allCanonicalOccurrences
    .filter((occurrence) => !occurrence.pointer.includes('/examData/'))
    .map((occurrence) => ({
      path: paths.canonical,
      pointer: occurrence.pointer,
      goalId: occurrence.value,
      containerGoalId: occurrence.containerGoalId ?? null,
      referenceKind: occurrence.pointer.endsWith('/id')
        ? 'goal_identity'
        : occurrence.pointer.includes('/contains/')
          ? 'contains_hierarchy'
          : occurrence.pointer.includes('/requires/')
            ? 'requires_dependency'
            : occurrence.pointer.includes('/goalPlacements/')
              ? 'goal_placement'
              : 'canonical_reference',
      action: splitParentIds.includes(occurrence.value as typeof splitParentIds[number])
        ? 'retain_stable_parent_cluster_reference'
        : 'apply_exact_atomic_child_reference',
      replacementGoalIds: [occurrence.value],
      applicationStatus: 'applied',
    }))
  adjudication.compositionViewReferences = collectCompositionReferenceRecords(compositionViews)
  const canonicalAssessmentReferences = allCanonicalOccurrences
    .filter((occurrence) => occurrence.containerGoalId && assessmentGoalIds.has(occurrence.containerGoalId))
    .filter((occurrence) => occurrence.pointer.includes('/requires/') || occurrence.pointer.includes('/coveredGoalIds/'))
    .map((occurrence) => ({
      path: paths.canonical,
      pointer: occurrence.pointer,
      containerGoalId: occurrence.containerGoalId,
      goalId: occurrence.value,
      referenceKind: occurrence.pointer.includes('/coveredGoalIds/') ? 'assessment_coverage' : 'assessment_prerequisite',
      action: 'bind_exact_assessed_atomic_goal',
      applicationStatus: 'applied',
    }))
  const blueprint = assessmentMarkdown.get(paths.blueprint)!
  const simulatedReview = assessmentMarkdown.get(paths.simulatedReview)!
  const simulatedReviewV4 = assessmentMarkdown.get(paths.simulatedReviewV4)!
  for (const goalId of [
    ids.cuboidVolume,
    ids.cuboidSurface,
    ids.axisReflection,
    ids.pointReflection,
    ids.nets,
    ids.obliqueViews,
    ids.orthographicViews,
    ids.linkedRepresentations,
  ]) {
    if (!blueprint.includes(goalId)) throw new Error(`Blueprint is missing exact child ${goalId}`)
  }
  if (!simulatedReview.includes(ids.axisReflection)) throw new Error('Simulated review is missing axis-reflection child')
  for (const goalId of [ids.pointReflection, ids.nets, ids.obliqueViews, ids.orthographicViews, ids.linkedRepresentations]) {
    if (!simulatedReviewV4.includes(goalId)) throw new Error(`Simulated review v4 is missing exact route goal ${goalId}`)
  }
  adjudication.assessmentReferences = [
    ...canonicalAssessmentReferences,
    {
      path: paths.blueprint,
      line: 14,
      goalIds: [ids.cuboidVolume, ids.cuboidSurface],
      action: 'bind_task_5_exact_volume_and_surface_children',
      applicationStatus: 'applied',
    },
    {
      path: paths.blueprint,
      line: 15,
      goalIds: [ids.axisReflection],
      action: 'bind_task_6_exact_axis_reflection_child',
      applicationStatus: 'applied',
    },
    {
      path: paths.simulatedReview,
      line: 53,
      goalIds: [ids.axisReflection],
      action: 'document_exact_axis_reflection_child',
      applicationStatus: 'applied',
    },
    {
      path: paths.blueprint,
      goalIds: [ids.pointReflection],
      assessmentGoalId: ids.pointReflectionAssessment,
      action: 'add_point_reflection_route_closing_task',
      applicationStatus: 'applied',
    },
    {
      path: paths.blueprint,
      goalIds: [ids.nets, ids.obliqueViews, ids.orthographicViews, ids.linkedRepresentations],
      assessmentGoalId: ids.representationAssessment,
      action: 'add_year_aware_bw_only_representation_route_closing_task',
      applicationStatus: 'applied',
    },
    ...[
      paths.pointReflectionDraft,
      paths.pointReflectionSolution,
      paths.pointReflectionReview,
    ].map((path) => ({
      path,
      goalIds: [ids.pointReflection],
      assessmentGoalId: ids.pointReflectionAssessment,
      action: 'materialize_exact_point_reflection_assessment_bundle',
      applicationStatus: 'applied',
    })),
    ...[
      paths.representationDraft,
      paths.representationSolution,
      paths.representationReview,
    ].map((path) => ({
      path,
      goalIds: [ids.nets, ids.obliqueViews, ids.orthographicViews, ids.linkedRepresentations],
      assessmentGoalId: ids.representationAssessment,
      action: 'materialize_exact_representation_assessment_bundle',
      applicationStatus: 'applied',
    })),
    {
      path: paths.simulatedReviewV4,
      goalIds: [ids.pointReflection, ids.nets, ids.obliqueViews, ids.orthographicViews, ids.linkedRepresentations],
      assessmentGoalIds: [ids.pointReflectionAssessment, ids.representationAssessment],
      action: 'record_focused_route_closing_release_review',
      applicationStatus: 'applied',
    },
  ]
  const completeness = adjudication.completeness as JsonRecord
  completeness.canonicalGraphReferenceCount = (adjudication.canonicalGraphReferences as JsonRecord[]).length
  completeness.compositionViewReferenceCount = (adjudication.compositionViewReferences as JsonRecord[]).length
  completeness.assessmentReferenceCount = (adjudication.assessmentReferences as JsonRecord[]).length
  completeness.mappingDecisionReferenceCount = mappingResult.authoritativeDecisionCount
  completeness.allContentReferenceFilesAccountedFor = true
  return validateSourceEdgeAdjudication(adjudication)
}

function buildReceipt(
  mappingResult: MappingBuildResult,
  compositionContractPaths: string[],
  plannedPaths: string[],
): JsonRecord {
  return {
    schemaVersion: 1,
    receiptId: 'canonical-math-j6-batch-003b-structural-splits-application-2026-08-27',
    appliedAt: reviewedAt,
    appliedBy: reviewer,
    landscapeId: mathLandscapeId,
    status: 'LAYER_A_APPLIED_FRESH_V2_DUAL_REVIEW_REQUIRED',
    scope: {
      stableParentClusterIds: [...splitParentIds],
      atomicChildGoalIds: [...childIds],
      sourceMappingEdgeCount: 159,
    },
    mappingApplication: {
      selectedChildMappingCount: mappingResult.selectedChildMappingCount,
      alternativeMappingEdgeCount: mappingResult.alternativeMappingCount,
      removedParentMappingEdgeCount: mappingResult.removedEdgeCount,
      authoritativeDecisionCount: mappingResult.authoritativeDecisionCount,
      mappingDecisionParity: true,
      duplicateMappingPairs: 0,
    },
    compositionApplication: {
      contractViewCount: compositionContractPaths.length,
      bwCanonicalSubtreesRetained: true,
      byRepresentationChildren: 'prerequisiteOnly via 11c88ea2-8502-5008-bec2-3e491c75ace4',
      heG8: 'J5 nets and oblique view; J9 orthographic single view',
      heG9: 'no G8-only representation children',
      sh: 'stage-wide axis reflection, point reflection, nets and oblique view',
    },
    visualizationApplication: {
      parentClusterOverviewCount: 3,
      activeResourceLinksRetained: true,
      existingQaRecordsRetained: true,
      imageFilesCreatedDeletedOrReplaced: 0,
    },
    assessmentApplication: {
      routeClosingTaskCount: 2,
      pointReflectionTaskId: ids.pointReflectionAssessment,
      pointReflectionJurisdictions: ['DE-BW', 'DE-SH'],
      representationTaskId: ids.representationAssessment,
      representationJurisdictions: ['DE-BW'],
      requiresCoveredGoalParity: true,
      legacyMainExamBytesReinterpreted: false,
    },
    atlasExpectedCurricularAtomicGoalCount: 791,
    deepRolloutRegenerationPerformed: false,
    remainingReleaseGate: 'fresh independent v2 dual review of all seven atomic children',
    plannedLayerAPaths: [...plannedPaths].sort(),
  }
}

const initialAdjudication = validateSourceEdgeAdjudication(buildInitialSourceEdgeAdjudication())
const mappingResult = buildMappings(initialAdjudication)
const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildAtomicity(canonical)
const memory = buildMemory(canonical)
const visualizationQa = buildVisualizationQa()
const compositionViews = buildCompositionViews()
const provenance = buildProvenance(initialAdjudication)
const surrogateEvidence = buildSurrogateEvidence()
const atlasSources = buildAtlasSources()
const assessmentMarkdown = buildAssessmentMarkdown()
const durationPolicy = buildDurationPolicy(canonical, compositionViews)

const mappingPaths = [...mappingResult.files.keys()].sort()
const compositionContractPaths = readdirSync(compositionRoot, { withFileTypes: true })
  .filter((entry) => entry.isFile() && (
    /^de-bw-(?:gk|lk|seki)\.view\.json$/u.test(entry.name)
    || /^de-by-(?:gk|lk)\.view\.json$/u.test(entry.name)
    || /^de-(?:he|rp|sh)-(?:gk|lk|seki)-(?:g8|g9)\.view\.json$/u.test(entry.name)
    || /^de-sh-(?:gk|lk)\.view\.json$/u.test(entry.name)
  ))
  .map((entry) => relative(repoRoot, join(compositionRoot, entry.name)))
  .sort()

const plannedPaths = [
  paths.canonical,
  paths.semanticKinds,
  paths.atomicity,
  paths.memory,
  paths.visualizationQa,
  paths.provenance,
  paths.surrogateEvidence,
  paths.atlasSources,
  paths.durationPolicy,
  ...assessmentMarkdown.keys(),
  paths.sourceEdgeAdjudication,
  paths.receipt,
  ...mappingPaths,
  ...compositionContractPaths,
]
const adjudication = finalizeSourceEdgeAdjudication(
  initialAdjudication,
  canonical,
  compositionViews,
  assessmentMarkdown,
  mappingResult,
)
const receipt = buildReceipt(mappingResult, compositionContractPaths, plannedPaths)

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  writeJson(paths.provenance, provenance)
  writeJson(paths.surrogateEvidence, surrogateEvidence)
  writeJson(paths.atlasSources, atlasSources)
  writeJson(paths.durationPolicy, durationPolicy)
  for (const [path, content] of assessmentMarkdown) writeText(path, content)
  writeJson(paths.sourceEdgeAdjudication, adjudication)
  writeJson(paths.receipt, receipt)
  for (const [path, mapping] of mappingResult.files) writeJson(path, mapping)
  for (const [path, view] of compositionViews) writeJsonAbsolute(path, view)
}

console.log(
  `CHECK apply_math_batch_003_structural_splits ${writeMode ? 'WRITE' : 'PASS'} `
  + `parents=3 children=7 canonicalRewires=${canonicalRewires.length} `
  + `sourceEdges=159 childMappings=${mappingResult.selectedChildMappingCount} `
  + `alternativeMappings=${mappingResult.alternativeMappingCount} removedMappings=${mappingResult.removedEdgeCount} `
  + `authoritativeDecisions=${mappingResult.authoritativeDecisionCount} `
  + `compositionViewsChanged=${compositionViews.size} parentClusterOverviewQa=3 `
  + `plannedLayerAPaths=${plannedPaths.length}`,
)
