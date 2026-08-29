import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  linkSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// These bounded curriculum ledgers predate a shared TypeScript schema and are
// therefore checked field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = {
  path: string
  bytes: string
  beforeSha256: string
  afterSha256: string
  mode: number
  state: 'before' | 'after'
}
type Revision = {
  titleDe: string
  titleEn: string
  beforeDescriptionDe: string
  beforeDescriptionEn: string
  descriptionDe: string
  descriptionEn: string
  atomicityReason: string
  memoryReason: string
  visualCompatibilityNote: string
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
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-29'
const reviewedAtIso = '2026-08-29T03:03:05.000Z'
const reviewer = 'codex-math-b019-q2-adjudication-2026-08-29'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const linalgMemoryGoalId = 'bd55594a-3e06-5097-8324-4f2f1349fd2a'
const linalgDeckId = 'de_gymnasium_math_linalg_core'

// Bind only after two independently inspected, byte-identical no-write plans.
const expectedPlanSha256 = '0e8c08809faa09dced978fdb979341519d531c0f3efc76bbc5010d6e1e4046cc'

const batchRoot =
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-29/'
  + 'batch-019-q2-lines-planes-current-19-v1'
const roundPrefix =
  'mathematik-rollout-v1-batch-019-q2-lines-planes-current-19-v1-20260829'

const paths = {
  config: `${batchRoot}.config.json`,
  batchManifest: `${batchRoot}/batch-manifest.json`,
  bookModel: `${batchRoot}/bundle/book-model.json`,
  bundleManifest: `${batchRoot}/bundle/manifest.json`,
  bundleReviewInputJson: `${batchRoot}/bundle/review-input.json`,
  bundleReviewInputJsonl: `${batchRoot}/bundle/review-input.jsonl`,
  dualSummary: `${batchRoot}/dual-summary.json`,
  roundADescriptionInput: `${batchRoot}/round-a/description-review-input.json`,
  roundABatchInput:
    `${batchRoot}/round-a/batches/${roundPrefix}-first-pass-a.batch-001.input.jsonl`,
  roundARun: `${batchRoot}/round-a/results/${roundPrefix}-first-pass-a.batch-001.run.json`,
  roundARecords:
    `${batchRoot}/round-a/results/${roundPrefix}-first-pass-a.batch-001.records.jsonl`,
  roundBDescriptionInput: `${batchRoot}/round-b/description-review-input.json`,
  roundBBatchInput:
    `${batchRoot}/round-b/batches/${roundPrefix}-first-pass-b.batch-001.input.jsonl`,
  roundBRun: `${batchRoot}/round-b/results/${roundPrefix}-first-pass-b.batch-001.run.json`,
  roundBRecords:
    `${batchRoot}/round-b/results/${roundPrefix}-first-pass-b.batch-001.records.jsonl`,
  adjudication: `${batchRoot}/third-adjudication/adjudication.json`,
  goalBookModel: 'app/scripts/goalBookModel.ts',
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  goalMemory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  cardLedger: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.cards.review.jsonl',
  canonicalDeckDe: 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_math_flashcards_linalg_core.de.json',
  canonicalDeckEn: 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_math_flashcards_linalg_core.en.json',
  publicDeckDe: 'app/public/data/de_gymnasium_math_flashcards_linalg_core.de.json',
  publicDeckEn: 'app/public/data/de_gymnasium_math_flashcards_linalg_core.en.json',
  backendDeckDe: 'backend/src/main/resources/static/data/de_gymnasium_math_flashcards_linalg_core.de.json',
  backendDeckEn: 'backend/src/main/resources/static/data/de_gymnasium_math_flashcards_linalg_core.en.json',
  visualQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  visualReview:
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-218.md',
  followUpConfig:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-29/'
    + 'batch-020-q2-lines-planes-and-reverse-context-13-v1.config.json',
} as const

const batchGoalIds = [
  'effe43eb-cabe-56cb-a228-35887d7915c1',
  '525b1da9-7fdd-4a70-9f30-ff01d7511b04',
  'd785943c-d61b-51a1-a9c2-c36a9e0cc97d',
  'ec6447d1-97da-5b77-94ae-4973b43f094e',
  '66a96282-340d-5220-91a6-cc97e2ec2220',
  '9cc650e0-100d-5ae1-a83b-2b854ab7c5c8',
  'fa02cf14-0411-4fe3-8be7-a62c69743e26',
  '36e0de23-1e3b-5c69-888f-e5e19e79cbbe',
  'd76766a5-ce07-5c7a-987b-157f2998b05e',
  'ce491ec0-c558-5872-86fd-289e60a38403',
  'ea4bd128-17ab-5a8b-ae98-29552d774fb0',
  'f613634b-39fb-5021-9970-790ef34c9932',
  '06de364f-9b63-4044-8229-a975621dc6df',
  '27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6',
  '436532fe-cee6-5a13-a4be-05522435937b',
  '7aa1abee-d6ec-528a-b110-f2260b0cda51',
  'a9fde754-51b4-58d7-85e5-5e36160581e6',
  'edaf0bb4-e12e-5a6c-b484-91124ba209f3',
  'fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc',
] as const

const followUpGoalIds = [
  'effe43eb-cabe-56cb-a228-35887d7915c1',
  '525b1da9-7fdd-4a70-9f30-ff01d7511b04',
  'd785943c-d61b-51a1-a9c2-c36a9e0cc97d',
  'ec6447d1-97da-5b77-94ae-4973b43f094e',
  '66a96282-340d-5220-91a6-cc97e2ec2220',
  '9cc650e0-100d-5ae1-a83b-2b854ab7c5c8',
  'fa02cf14-0411-4fe3-8be7-a62c69743e26',
  'ea4bd128-17ab-5a8b-ae98-29552d774fb0',
  'f613634b-39fb-5021-9970-790ef34c9932',
  '06de364f-9b63-4044-8229-a975621dc6df',
  'ce491ec0-c558-5872-86fd-289e60a38403',
  '436532fe-cee6-5a13-a4be-05522435937b',
] as const

const reverseContextRegressionGoalId = '858113c5-e53b-57bb-b01f-ba95c3ddcb6f'
const followUpConfigGoalIds = [
  ...followUpGoalIds.slice(0, 9),
  followUpGoalIds[10],
  followUpGoalIds[9],
  followUpGoalIds[11],
  reverseContextRegressionGoalId,
] as const
const reverseRequiresAffectedGoalIds = [
  'b9bbd2a8-1379-5ffb-817f-41467d48abef',
  reverseContextRegressionGoalId,
  '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2',
  'be0e8715-3c3a-5ffb-937a-0b6bce4f01d8',
  '265af6af-8eac-5632-b730-800aafcde26a',
  '9460c3ff-e72d-4107-bc73-087d217200aa',
  '9cc650e0-100d-5ae1-a83b-2b854ab7c5c8',
  'ce491ec0-c558-5872-86fd-289e60a38403',
] as const

const revisionGoalIds = [
  followUpGoalIds[1],
  followUpGoalIds[2],
  followUpGoalIds[4],
  followUpGoalIds[7],
  followUpGoalIds[8],
  followUpGoalIds[9],
  followUpGoalIds[11],
] as const

const semanticKindGoalIds = [
  followUpGoalIds[0],
  followUpGoalIds[1],
  followUpGoalIds[2],
  followUpGoalIds[3],
  followUpGoalIds[4],
  followUpGoalIds[7],
  followUpGoalIds[8],
  followUpGoalIds[9],
  followUpGoalIds[11],
] as const

const topology: Record<string, { before: string[]; final: string[] }> = {
  [followUpGoalIds[0]]: {
    before: [
      'b9bbd2a8-1379-5ffb-817f-41467d48abef',
      '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
      '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2',
      'be0e8715-3c3a-5ffb-937a-0b6bce4f01d8',
      '265af6af-8eac-5632-b730-800aafcde26a',
    ],
    final: ['be0e8715-3c3a-5ffb-937a-0b6bce4f01d8'],
  },
  [followUpGoalIds[2]]: {
    before: [
      'b9bbd2a8-1379-5ffb-817f-41467d48abef',
      '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
      '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2',
      'be0e8715-3c3a-5ffb-937a-0b6bce4f01d8',
      '265af6af-8eac-5632-b730-800aafcde26a',
    ],
    final: ['be0e8715-3c3a-5ffb-937a-0b6bce4f01d8'],
  },
  [followUpGoalIds[3]]: {
    before: [
      'b9bbd2a8-1379-5ffb-817f-41467d48abef',
      '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
      '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2',
      'be0e8715-3c3a-5ffb-937a-0b6bce4f01d8',
      '265af6af-8eac-5632-b730-800aafcde26a',
    ],
    final: ['9460c3ff-e72d-4107-bc73-087d217200aa'],
  },
  [followUpGoalIds[9]]: {
    before: ['9cc650e0-100d-5ae1-a83b-2b854ab7c5c8'],
    final: ['ce491ec0-c558-5872-86fd-289e60a38403'],
  },
}

const revisions: Record<string, Revision> = {
  [revisionGoalIds[0]]: {
    titleDe: 'Geraden und Strecken im Raum in Parameterform darstellen und Parameter deuten',
    titleEn: 'Represent lines and segments in space parametrically and interpret parameters',
    beforeDescriptionDe:
      'Die lernende Person kann Geraden und Strecken im Raum in Parameterform angeben, aus Punktbeschreibungen aufstellen und die Parameter von Geradengleichungen im Kontext deuten.',
    beforeDescriptionEn:
      'The learner can state lines and segments in space in parametric form, construct them from point descriptions, and interpret the parameters of line equations in context.',
    descriptionDe:
      'Die lernende Person kann Geraden und Strecken im Raum aus zwei verschiedenen Punkten parametrisch darstellen, dabei für Geraden den gesamten reellen Parameterbereich und für Strecken einen passenden begrenzten Parameterbereich festlegen sowie Parameterwerte im Kontext deuten.',
    descriptionEn:
      'The learner can parametrically represent lines and segments in space from two distinct points, use the full real parameter range for lines and an appropriate bounded parameter interval for segments, and interpret parameter values in context.',
    atomicityReason:
      'Gerade und Strecke werden über dieselbe Parameterdarstellung aus zwei Punkten erzeugt; die Unterscheidung der Parameterbereiche und ihre Kontextdeutung bilden eine zusammenhängende Darstellungskompetenz.',
    memoryReason:
      'Der bestehende Memory-Anteil bleibt auf die kompakte Geradengleichung im Deck de_gymnasium_math_linalg_core begrenzt; begrenzte Parameterintervalle und Kontextdeutung bleiben Verständnis und Aufgabenpraxis.',
    visualCompatibilityNote:
      'Kompatibilitätsprüfung Batch 218: A=(1,1,0), B=(5,3,2) und v=B-A=(4,2,2) sind korrekt. Das Bild unterscheidet t∈R für die Gerade von 0≤s≤1 für die Strecke und deutet s=0, s=1 sowie s=0,5 korrekt. Asset- und Promptbytes bleiben unverändert.',
  },
  [revisionGoalIds[1]]: {
    titleDe: 'Ebenen in Parameterform angeben und interpretieren',
    titleEn: 'State and interpret planes in parametric form',
    beforeDescriptionDe:
      'Die lernende Person kann eine Ebene in Parameterform angeben, Richtungsvektoren und Stützpunkt interpretieren und Punkte der Ebene prüfen.',
    beforeDescriptionEn:
      'The learner can state a plane in parametric form, interpret direction vectors and base point, and check points on the plane.',
    descriptionDe:
      'Die lernende Person kann eine Ebene durch einen Stützpunkt und zwei linear unabhängige Spannvektoren in Parameterform angeben, den Stützpunkt und die Spannvektoren geometrisch deuten und die Zugehörigkeit von Punkten prüfen.',
    descriptionEn:
      'The learner can represent a plane parametrically using a base point and two linearly independent spanning vectors, interpret the base point and spanning vectors geometrically, and test whether points lie on the plane.',
    atomicityReason:
      'Aufstellen, geometrisches Deuten und Punktprüfung beziehen sich auf dieselbe Parameterdarstellung einer Ebene; lineare Unabhängigkeit ist ihre notwendige Gültigkeitsbedingung und keine zweite Kompetenz.',
    memoryReason:
      'Lineare Unabhängigkeit, geometrische Deutung und Punktprüfung müssen an konkreten Ebenen verstanden und angewendet werden; ein eigenes Memory-Deck ist dafür nicht erforderlich.',
    visualCompatibilityNote:
      'Kompatibilitätsprüfung Batch 218: P=(1,0,2), u=(2,1,0) und v=(0,1,3) sind korrekt; u und v sind nicht proportional und damit linear unabhängig. P+u, P+v und P+u+v sind richtig markiert. Asset- und Promptbytes bleiben unverändert.',
  },
  [revisionGoalIds[2]]: {
    titleDe: 'Punkt-Normalen-Form einer Ebene aufstellen',
    titleEn: 'Set up the point-normal form of a plane',
    beforeDescriptionDe:
      'Die lernende Person kann die Punkt-Normalen-Form einer Ebene aus Punkt und Normalenvektor aufstellen und damit arbeiten.',
    beforeDescriptionEn:
      'The learner can set up the point-normal form of a plane from a point and a normal vector and use it.',
    descriptionDe:
      'Die lernende Person kann aus dem Ortsvektor p eines Ebenenpunkts und einem von null verschiedenen Normalenvektor n die Punkt-Normalen-Form n · (x − p) = 0 aufstellen und als Orthogonalitätsbedingung deuten.',
    descriptionEn:
      'The learner can set up the point-normal form n · (x − p) = 0 from the position vector p of a point on the plane and a nonzero normal vector n and interpret it as an orthogonality condition.',
    atomicityReason:
      'Das Aufstellen der Punkt-Normalen-Form und ihre Deutung als Orthogonalitätsbedingung sind algebraischer und geometrischer Ausdruck derselben Ebenendarstellung.',
    memoryReason:
      'Die Orthogonalitätsbedingung soll aus Punkt und Normalenvektor hergeleitet und gedeutet werden; isolierter Formelabruf rechtfertigt kein eigenes Memory-Deck.',
    visualCompatibilityNote:
      'Kompatibilitätsprüfung Batch 218: P=(1,2,3) und der von null verschiedene Vektor n=(2,-1,4) führen korrekt zu n·(x-p)=0 und 2x-y+4z=12; die Senkrechtbeziehung ist richtig dargestellt. Asset- und Promptbytes bleiben unverändert.',
  },
  [revisionGoalIds[3]]: {
    titleDe: 'Ebenengleichung aus geometrischen Bedingungen bestimmen',
    titleEn: 'Determine a plane equation from geometric conditions',
    beforeDescriptionDe:
      'Die lernende Person kann eine Ebenengleichung aus Bedingungen wie drei Punkten, Punkt+Normalenvektor oder Punkt+zwei Richtungsvektoren bestimmen.',
    beforeDescriptionEn:
      'The learner can determine a plane equation from conditions such as three points, point+normal vector, or point+two direction vectors.',
    descriptionDe:
      'Die lernende Person kann aus drei nicht kollinearen Punkten, einem Ebenenpunkt und einem von null verschiedenen Normalenvektor oder einem Ebenenpunkt und zwei linear unabhängigen Spannvektoren eine passende Ebenengleichung bestimmen.',
    descriptionEn:
      'The learner can determine a suitable plane equation from three noncollinear points, from a point on the plane and a nonzero normal vector, or from a point on the plane and two linearly independent spanning vectors.',
    atomicityReason:
      'Die drei nicht entarteten Eingabeformen sind alternative Ausgangsdaten für dieselbe Konstruktionsleistung: eine passende Ebenengleichung zu bestimmen.',
    memoryReason:
      'Die Wahl einer passenden Darstellung und die Prüfung der Nichtentartungsbedingungen erfordern Verständnis und Konstruktion an Aufgaben; ein eigenes Memory-Deck ist nicht nötig.',
    visualCompatibilityNote:
      'Kompatibilitätsprüfung Batch 218: A=(1,0,1), B=(3,1,1), C=(1,2,2) sind nicht kollinear; u=(2,1,0), v=(0,2,1), u×v=(1,-2,4) und x-2y+4z=5 sind korrekt. Asset- und Promptbytes bleiben unverändert.',
  },
  [revisionGoalIds[4]]: {
    titleDe: 'Parallelogramme und Dreiecke in Parameterform darstellen',
    titleEn: 'Represent Parallelograms and Triangles in Parametric Form',
    beforeDescriptionDe:
      'Die lernende Person kann Parallelogramme und Dreiecke im Raum in Parameterform angeben, geeignete Spannvektoren aus Eckpunkten bestimmen und die Darstellung geometrisch deuten.',
    beforeDescriptionEn:
      'The learner can represent parallelograms and triangles in space in parametric form, determine suitable spanning vectors from vertices, and interpret the representation geometrically.',
    descriptionDe:
      'Die lernende Person kann aus den Eckpunkten passende Spannvektoren bestimmen, Parallelogramme durch x = a + su + tv mit 0 ≤ s,t ≤ 1 und Dreiecke mit s,t ≥ 0 und s + t ≤ 1 parametrisch darstellen und die begrenzten Punktmengen geometrisch deuten.',
    descriptionEn:
      'The learner can determine suitable spanning vectors from the vertices, parametrically represent parallelograms by x = a + su + tv with 0 ≤ s,t ≤ 1 and triangles with s,t ≥ 0 and s + t ≤ 1, and interpret the bounded point sets geometrically.',
    atomicityReason:
      'Spannvektoren, affine Parameterdarstellung und die passenden Nebenbedingungen beschreiben gemeinsam begrenzte Parallelogramm- beziehungsweise Dreiecksflächen.',
    memoryReason:
      'Die unterschiedlichen Parametergebiete müssen geometrisch verstanden, konstruiert und geprüft werden; ein isoliertes Merken der Ungleichungen ersetzt diese Leistung nicht.',
    visualCompatibilityNote:
      'Kompatibilitätsprüfung Batch 218: Die Spannvektoren u=AB=(4,0,0) und v=AD=(0,3,2) sowie C=(5,4,2) sind korrekt. Das Bild zeigt 0≤s,t≤1 für das Parallelogramm und s,t≥0, s+t≤1 für das Dreieck. Asset- und Promptbytes bleiben unverändert.',
  },
  [revisionGoalIds[5]]: {
    titleDe: 'Koordinatenformen von Ebenen zur Orientierung im Raum nutzen',
    titleEn: 'Use coordinate forms of planes for orientation in space',
    beforeDescriptionDe:
      'Die lernende Person kann Koordinatenformen von Ebenen zur Orientierung im Raum nutzen, insbesondere Punktproben durchführen, Achsenschnittpunkte bestimmen und den Normalenvektor zur räumlichen Deutung heranziehen.',
    beforeDescriptionEn:
      'The learner can use coordinate forms of planes for orientation in space, in particular by performing point tests, determining axis intercepts, and using the normal vector for spatial interpretation.',
    descriptionDe:
      'Die lernende Person kann aus der Koordinatenform einer Ebene Achsenschnittpunkte und die Richtung des Normalenvektors bestimmen, die Zugehörigkeit gegebener Punkte prüfen und diese Informationen zu einer begründeten räumlichen Lagebeschreibung der Ebene zusammenführen.',
    descriptionEn:
      "The learner can determine a plane's axis intercepts and normal direction from its coordinate form, test whether given points lie on the plane, and combine these results into a reasoned spatial description of the plane's position.",
    atomicityReason:
      'Achsenschnitte, Normalenrichtung und Punktproben werden nicht bloß aufgezählt, sondern zu einer einzigen begründeten räumlichen Lagebeschreibung zusammengeführt.',
    memoryReason:
      'Die räumliche Lage muss aus mehreren berechneten Merkmalen begründet synthetisiert werden; ein eigenes Memory-Deck ist für diese Verständnisleistung nicht erforderlich.',
    visualCompatibilityNote:
      'Kompatibilitätsprüfung Batch 218: Für E: 2x+3y+6z=12 sind A=(6,0,0), B=(0,4,0), C=(0,0,2), P=(3,0,1) auf E, Q=(1,1,1) nicht auf E und n=(2,3,6) korrekt. Das Bild trägt die geforderte Lagesynthese. Asset- und Promptbytes bleiben unverändert.',
  },
  [revisionGoalIds[6]]: {
    titleDe: 'Lösungsmengen linearer Gleichungssysteme geometrisch deuten',
    titleEn: 'Geometrically interpret solution sets of linear systems',
    beforeDescriptionDe:
      'Die lernende Person kann Lösungsmengen linearer Gleichungssysteme in analytisch-geometrischen Situationen geometrisch deuten, etwa als Schnittpunkt, Schnittgerade, Ebene, leere Menge oder unendlich viele Lösungen.',
    beforeDescriptionEn:
      'The learner can geometrically interpret solution sets of linear systems in analytic-geometry situations, for example as an intersection point, intersection line, plane, empty set, or infinitely many solutions.',
    descriptionDe:
      'Die lernende Person kann die Lösungsmenge eines linearen Gleichungssystems in einer analytisch-geometrischen Situation im Raum als Schnittmenge der durch seine Gleichungen beschriebenen Punktmengen deuten und sie anhand von Konsistenz und Anzahl freier Variablen als leere Menge, Punkt, Gerade, Ebene oder ganzen Raum einordnen.',
    descriptionEn:
      'The learner can interpret the solution set of a linear system in a three-dimensional analytic-geometry situation as the intersection of the point sets described by its equations and classify it, based on consistency and the number of free variables, as the empty set, a point, a line, a plane, or all of space.',
    atomicityReason:
      'Schnittmengen-Deutung und Klassifikation nach Konsistenz und freien Variablen sind zwei Schritte derselben geometrischen Interpretation einer LGS-Lösungsmenge.',
    memoryReason:
      'Konsistenz, freie Variablen und geometrische Dimension müssen an Gleichungssystemen zusammen ausgewertet werden; ein eigenes Memory-Deck ist dafür nicht erforderlich.',
    visualCompatibilityNote:
      'Kompatibilitätsprüfung Batch 218: Das Bild trennt korrekt Punkt, Schnittgerade, Ebene und leere Menge anhand konkreter Gleichungen. Der ergänzte Fall des ganzen Raums ist nicht abgebildet, wird aber auch nicht ausgeschlossen und bleibt Aufgabenevidenz. Asset- und Promptbytes bleiben unverändert.',
  },
}

const assetHashes: Record<string, string> = {
  [revisionGoalIds[0]]: '292968276adb3aa111649548045f6d0daa79cddc8546a02a06e9d80edc5df2fd',
  [revisionGoalIds[1]]: '9fe58537a1bff31a06378dff7783556e9f226c6c3d7e1b68ecffa3503099396f',
  [revisionGoalIds[2]]: 'e76bcf8163f0a54dc4f040ce0cfa8f7ab18e5ef4457e15aede9b418d48e32280',
  [revisionGoalIds[3]]: 'bb4da678e8c67f6aee726329b49e07fc081f14e058b649999cc45dbc78fa73e0',
  [revisionGoalIds[4]]: 'e8b55ba7924bef6a5a55526e73ae959998c86a92cfa0c4c150507db5d3c8b6bc',
  [revisionGoalIds[5]]: 'c4184c896e6fd454b8fc349153122cc8bc3d772a1f4f739b1e98d36a90944cb5',
  [revisionGoalIds[6]]: 'd8817d8f9f4a5efa4af25ff2de0fdadbb275ddb5cde45e295dd54f5192bb6c89',
}

const expectedInputHashes: Record<string, string> = {
  [paths.config]: 'ed260ede97a458dddb272fc514965a9616facd392c760f9265272ffc6646474a',
  [paths.batchManifest]: '5a28c4f03b46945522b9e4a82ba293bf073daafe4c5e738888f66bebb5bb5ddc',
  [paths.bookModel]: '66f567693ca1ed325c2cd1255dc3666ce7aa4a228174a843ef75fb8611bbffae',
  [paths.bundleManifest]: 'ca2ab91450f28155e45493af1ec132098fd5f76b34c33d380ccd36936924dbec',
  [paths.bundleReviewInputJson]: '660b45ea2cbebccd209d29efef05ad17b8ea6e848d0bac272eb023b4b40bb60c',
  [paths.bundleReviewInputJsonl]: '07366a5e635ce44f5cc7bf4ec643102884a8bcf8855ac0ca733cf316b7bfc38f',
  [paths.dualSummary]: 'f4b4bfad37a85df8afe80af677030963b458a4a60e73398785df2bcd46958f9c',
  [paths.roundADescriptionInput]: 'db0ca9d87e986da56953205defcdd887b1af858b55ba7e616d1cee4408179684',
  [paths.roundABatchInput]: '1767dcb54eb89e0114e119b67e6bf41bd37167c7ef196357df935a64c1e0da7b',
  [paths.roundARun]: 'be7f264eca73eed2b1da25b0d9547d036f5d77c97c8f17ddd044fb094bce2d37',
  [paths.roundARecords]: '7b45073fa8b1b7e3d92402fb9b5fe7403762911372b0b75bc95a0cb32b814bdf',
  [paths.roundBDescriptionInput]: 'db0ca9d87e986da56953205defcdd887b1af858b55ba7e616d1cee4408179684',
  [paths.roundBBatchInput]: '0f63367285450183609818c368be62cc0e4366f97966220616b50913e174c372',
  [paths.roundBRun]: '274d45cd3491aca659c3057b61ac0a8b00ce2de7c634b0fe055fc0b0a0e93c7a',
  [paths.roundBRecords]: '44ee9f7cc550c94432e8cd32c488eb7b30f548c70df648bcf0a8a26788692014',
  [paths.adjudication]: '2992aa3172ed3f68adc8bd5c8ff82bb9dce4811c81cc8052e5553e61625dae20',
  [paths.goalBookModel]: 'd8993c1270797f4e8406b2ef359eb0979768cc32078e5b988a32f50409207e60',
}

const protectedHashes: Record<string, string> = {
  [paths.cardLedger]: '184e422a8cde529963758beadbd671c1b28aa7ec2f705dbe6f8dda65a4866d21',
  [paths.canonicalDeckDe]: '8c192e97b87ae5a7e468d7db2b4fb6e0a61cabac2a1ddd599361378678449f83',
  [paths.canonicalDeckEn]: '915f17d4f6363a5228c0e071835fb926bcdd8cbf5b15c94cbab0bce5b9734956',
  [paths.publicDeckDe]: '8c192e97b87ae5a7e468d7db2b4fb6e0a61cabac2a1ddd599361378678449f83',
  [paths.publicDeckEn]: '915f17d4f6363a5228c0e071835fb926bcdd8cbf5b15c94cbab0bce5b9734956',
  [paths.backendDeckDe]: '8c192e97b87ae5a7e468d7db2b4fb6e0a61cabac2a1ddd599361378678449f83',
  [paths.backendDeckEn]: '915f17d4f6363a5228c0e071835fb926bcdd8cbf5b15c94cbab0bce5b9734956',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[0]}/image-reconstruction-prompt.de.md`]: '7b28d9fb47e851ab0e1637391e6e19237e6cd352b672ac3654529ecf8867ed19',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[0]}/prompt.de.md`]: 'a1d791b05a0e5296e5fc2dabc7a5fa0afd5fa77dc32e27ea7cfdb8a45f756fd1',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[1]}/image-reconstruction-prompt.de.md`]: '6a237eb56f3eba87ba83954a79b5b1c01e064bf2253cb62c881c43a9ba9cb9ed',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[1]}/prompt.de.md`]: 'f4150a505651923a35ed073321a08531df13f7fd387bf21e621987b967e4263d',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[2]}/prompt.de.md`]: 'ffbbaa20449d618b0b0ea4bfb9048e429e5af38546bb09745df09d9b532865e7',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[3]}/image-reconstruction-prompt.de.md`]: '8e47cbbad248b258b98ea1c30a260492158666e74dc8b992d99e9b8742ac04d4',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[3]}/prompt.de.md`]: 'a624b17ff0c3cab7c86ab446cf7dea10b1f73b05b5397697924acb466f3c6512',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[4]}/prompt.de.md`]: 'bf73bba61eb6d87ecb945d6554dd9712167295a381b9f9fb4c1b392e55e26263',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[5]}/prompt.de.md`]: 'd58cd3e851f06ec65b99ad96397826199b136e4d82dc6401e8b59540d68f48b0',
  [`curricula/DE/Gymnasium/visualizations/mathematik/${revisionGoalIds[6]}/prompt.de.md`]: '0ac7592ffbe7c4d72891e39c611b70d20ce2066d0c0e897d506e4c9a512546ee',
}

for (const goalId of revisionGoalIds) {
  const hash = assetHashes[goalId]
  const relative = `assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`
  protectedHashes[`curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.jpg`] = hash
  protectedHashes[`app/public/${relative}`] = hash
  protectedHashes[`backend/src/main/resources/static/${relative}`] = hash
}

const outputPaths = [
  paths.canonical,
  paths.semanticKinds,
  paths.atomicity,
  paths.goalMemory,
  paths.visualQa,
  paths.visualReview,
  paths.followUpConfig,
] as const

const expectedBeforeHashes: Record<string, string> = {
  [paths.canonical]: '100825c360d41b225cec01e06ceda10b0014f2987e7911756b4b9166aad2d0ae',
  [paths.semanticKinds]: '70964fbebe5c7f4257d7052a9589e69ddd3235e8f4cf65c533e41d713407d737',
  [paths.atomicity]: '51be0593e43cb51c8e81f8230d7c192839c07fa2688711cc159e1c25ffd866b4',
  [paths.goalMemory]: '559beda292360d0eb3f1fb8f12e8d6253d45ed10837dde9bd15c69cac4699d56',
  [paths.visualQa]: '10d45db9da6c7438a32cd7ab3bdbfd28aa9ad2cae85c5e270156f621d8f7bad8',
  [paths.visualReview]: 'ABSENT',
  [paths.followUpConfig]: 'ABSENT',
}

// Bind these after independent inspection of two identical PLAN runs.
const expectedAfterHashes: Record<string, string> = {
  [paths.canonical]: 'b0b9e06c17430e98748d69533091ff14cfb0fa7d1946a21d8ca698f61cb1af7c',
  [paths.semanticKinds]: '674fcbe3b671abdc02a48f63d57c90df7a04146303d13d9139477d4671092e5c',
  [paths.atomicity]: '940eb0635aaba72e7462fef95e8df7ce7a1c227472dcfdf97fa2705ded11c8cb',
  [paths.goalMemory]: '269a3d368804107de7ac3536023dd4e27b40e842e4898971cd06a34884c6da62',
  [paths.visualQa]: '1bffb5408c79c8d910977ce1d239b38fe387ddd0dc2e968153b6b80f88981f5b',
  [paths.visualReview]: '459984386b181acb5a14083ff1813e6d9d679e7c95034d4c8b7ab17d4531ab27',
  [paths.followUpConfig]: '8e735562e57cac117c8f488c92784a88af49fc7d7d633108b9c651d655b5ec9c',
}
const publishedFileMode = 0o644

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string =>
  createHash('sha256').update(value).digest('hex')
const sha256Digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const fileMode = (path: string): number => statSync(absolute(path)).mode & 0o777
const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(absolute(path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string =>
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}
const exactArray = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right)
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}

const goalReviewFingerprint = (goal: JsonRecord, ruleVersion: string): string =>
  sha256Digest(stableJson({
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

const assertBoundInputs = (): void => {
  for (const [path, expected] of Object.entries({ ...expectedInputHashes, ...protectedHashes })) {
    assert(existsSync(absolute(path)), `Missing bound or protected input: ${path}`)
    const actual = sha256(readFileSync(absolute(path)))
    assert(actual === expected, `Input drifted: ${path}; expected ${expected}, got ${actual}`)
  }
}

const stagingPathFor = (path: string): string =>
  `${absolute(path)}.b019-q2-adjudication.staging`
const lockPath = absolute('app/scripts/.applyMathBatch019Q2Adjudication.lock')
assert(!existsSync(lockPath), `Existing or stale exclusive lock blocks all modes: ${lockPath}`)
for (const path of outputPaths) {
  assert(
    !existsSync(stagingPathFor(path)),
    `Stale staging file blocks all modes: ${stagingPathFor(path)}`,
  )
}

assertBoundInputs()

const config = readJson(paths.config)
const batchManifest = readJson(paths.batchManifest)
const bundleManifest = readJson(paths.bundleManifest)
const dualSummary = readJson(paths.dualSummary)
const roundARun = readJson(paths.roundARun)
const roundBRun = readJson(paths.roundBRun)
const adjudication = readJson(paths.adjudication)
const expectedBatchId = `${roundPrefix}`

assert(
  config.schemaVersion === 1
    && config.batchId === expectedBatchId
    && config.subject === 'mathematik'
    && exactArray(config.goalIds, batchGoalIds),
  'B019 config identity or scope drifted',
)
assert(
  batchManifest.schemaVersion === 1
    && batchManifest.batchId === expectedBatchId
    && exactArray(batchManifest.goalIds, batchGoalIds),
  'B019 batch-manifest identity or scope drifted',
)
assert(
  bundleManifest.schemaVersion === 1
    && bundleManifest.selectedGoalCount === batchGoalIds.length
    && exactArray(
      (bundleManifest.goals as JsonRecord[]).map((goal) => goal.goalId),
      batchGoalIds,
    ),
  'B019 bundle-manifest scope drifted',
)
assert(
  dualSummary.schemaVersion === 1
    && dualSummary.goalCount === batchGoalIds.length
    && Array.isArray(dualSummary.goals)
    && dualSummary.goals.length === batchGoalIds.length,
  'B019 dual-summary scope drifted',
)
for (const [run, recordsHash, lane] of [
  [roundARun, expectedInputHashes[paths.roundARecords], 'A'],
  [roundBRun, expectedInputHashes[paths.roundBRecords], 'B'],
] as const) {
  assert(run.status === 'completed', `B019 round ${lane} is not completed`)
  assert(exactArray(run.goalIds, batchGoalIds), `B019 round ${lane} scope drifted`)
  assert(run.outputDigest === `sha256:${recordsHash}`, `B019 round ${lane} output binding drifted`)
}
assert(
  adjudication.schemaVersion === 1
    && adjudication.batchId === expectedBatchId
    && adjudication.materialized === false
    && adjudication.noProgressClaim === true
    && exactArray(adjudication.requiredFollowUpGoalIds, followUpGoalIds)
    && exactArray(adjudication.acceptedRevisionGoalIds, revisionGoalIds)
    && exactArray(adjudication.strictProgressGoalIds, [])
    && adjudication.applyContract?.scriptPath === 'app/scripts/applyMathBatch019Q2Adjudication.ts',
  'B019 adjudication contract drifted',
)
assert(
  (adjudication.topologyDecisions as JsonRecord[]).length === Object.keys(topology).length,
  'B019 topology-decision count drifted',
)
for (const decision of adjudication.topologyDecisions as JsonRecord[]) {
  const expected = topology[decision.goalId]
  assert(
    expected
      && exactArray(decision.beforeRequires, expected.before)
      && exactArray(decision.finalRequires, expected.final),
    `${decision.goalId}: adjudicated topology drifted`,
  )
}
for (const goalId of revisionGoalIds) {
  const decision = (adjudication.decisions as JsonRecord[])
    .find((candidate) => candidate.goalId === goalId)
  const revision = revisions[goalId]
  assert(
    decision?.resolutionDecision === (goalId === revisionGoalIds[5]
      ? 'accepted_integrated_revision'
      : 'accepted_revision')
      && decision.finalText?.titleDe === revision.titleDe
      && decision.finalText?.titleEn === revision.titleEn
      && decision.finalText?.descriptionDe === revision.descriptionDe
      && decision.finalText?.descriptionEn === revision.descriptionEn,
    `${goalId}: accepted adjudicated text drifted`,
  )
}

const canonicalOriginal = readJson(paths.canonical)
const canonical = cloneJson(canonicalOriginal)
assert(canonical.landscapeId === landscapeId, 'Unexpected canonical Mathematics landscape')
const goalById = new Map<string, JsonRecord>(
  (canonical.goals as JsonRecord[]).map((goal) => [goal.id, goal]),
)
const beforeGoalById = new Map<string, JsonRecord>()
const finalGoalById = new Map<string, JsonRecord>()

for (const goalId of semanticKindGoalIds) {
  const goal = goalById.get(goalId)
  assert(goal, `${goalId}: missing canonical goal`)
  const revision = revisions[goalId]
  const topologyDecision = topology[goalId]
  if (revision) {
    assert(
      goal.title === revision.titleDe && goal.titleEn === revision.titleEn,
      `${goalId}: title drifted; titles are immutable`,
    )
    assert(
      exactArray(
        [goal.description, goal.descriptionEn],
        [revision.beforeDescriptionDe, revision.beforeDescriptionEn],
      ) || exactArray(
        [goal.description, goal.descriptionEn],
        [revision.descriptionDe, revision.descriptionEn],
      ),
      `${goalId}: descriptions are outside bounded before/final states`,
    )
  }
  if (topologyDecision) {
    assert(
      exactArray(goal.requires, topologyDecision.before)
        || exactArray(goal.requires, topologyDecision.final),
      `${goalId}: direct requires are outside bounded before/final states`,
    )
  }

  const beforeGoal = cloneJson(goal)
  const finalGoal = cloneJson(goal)
  if (revision) {
    const resources = (goal.resourceLinks as JsonRecord[] | undefined) ?? []
    const visualResources = resources.filter((resource) => resource.type === 'goal-visualization')
    assert(visualResources.length === 1, `${goalId}: expected exactly one visualization resource`)
    const resource = visualResources[0]
    const expectedUrl = `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`
    const beforeAlt =
      `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.beforeDescriptionDe}`
    const finalAlt =
      `Didaktische Visualisierung zum Lernziel "${revision.titleDe}". ${revision.descriptionDe}`
    assert(
      resource.skillpilotId === goalId
        && resource.url === expectedUrl
        && resource.title === `Visualisierung: ${revision.titleDe}`
        && resource.description === `Visualisierung zum Lernziel: ${revision.titleDe}.`
        && resource.reviewStatus === 'pilot'
        && (resource.altText === beforeAlt || resource.altText === finalAlt),
      `${goalId}: visualization resource identity or alt text drifted`,
    )
    const beforeResource = (beforeGoal.resourceLinks as JsonRecord[])
      .find((candidate) => candidate.type === 'goal-visualization')!
    const finalResource = (finalGoal.resourceLinks as JsonRecord[])
      .find((candidate) => candidate.type === 'goal-visualization')!
    beforeGoal.description = revision.beforeDescriptionDe
    beforeGoal.descriptionEn = revision.beforeDescriptionEn
    beforeResource.altText = beforeAlt
    finalGoal.description = revision.descriptionDe
    finalGoal.descriptionEn = revision.descriptionEn
    finalResource.altText = finalAlt
    goal.description = revision.descriptionDe
    goal.descriptionEn = revision.descriptionEn
    resource.altText = finalAlt
  }
  if (topologyDecision) {
    beforeGoal.requires = topologyDecision.before
    finalGoal.requires = topologyDecision.final
    goal.requires = topologyDecision.final
  }
  beforeGoalById.set(goalId, beforeGoal)
  finalGoalById.set(goalId, finalGoal)
}

const followUpPositionByGoalId = new Map(
  followUpConfigGoalIds.map((goalId, index) => [goalId, index]),
)
for (const [goalId, position] of followUpPositionByGoalId) {
  const goal = goalById.get(goalId)
  assert(goal, `${goalId}: follow-up goal is missing from the final canonical landscape`)
  const forwardPrerequisites = ((goal.requires as string[] | undefined) ?? [])
    .filter((prerequisiteId) => followUpPositionByGoalId.has(prerequisiteId))
    .filter((prerequisiteId) => followUpPositionByGoalId.get(prerequisiteId)! >= position)
  assert(
    forwardPrerequisites.length === 0,
    `${goalId}: follow-up order places prerequisites too late: ${forwardPrerequisites.join(', ')}`,
  )
}

const semanticKinds = cloneJson(readJson(paths.semanticKinds))
for (const goalId of semanticKindGoalIds) {
  const record = (semanticKinds.decisions as JsonRecord[])
    .find((candidate) => candidate.goalId === goalId)
  const beforeGoal = beforeGoalById.get(goalId)!
  const finalGoal = finalGoalById.get(goalId)!
  assert(
    record?.semanticKind === 'curricularAtomic'
      && record.decisionStatus === 'authoritative',
    `${goalId}: semantic-kind authority drifted`,
  )
  const beforeFingerprint = fingerprintSemanticKindSourceGoal(beforeGoal)
  const finalFingerprint = fingerprintSemanticKindSourceGoal(finalGoal)
  assert(
    record.sourceFingerprint === beforeFingerprint || record.sourceFingerprint === finalFingerprint,
    `${goalId}: semantic-kind fingerprint is outside bounded states`,
  )
  record.sourceFingerprint = finalFingerprint
}

const atomicity = cloneJson(readJsonl(paths.atomicity))
const goalMemory = cloneJson(readJsonl(paths.goalMemory))
for (const goalId of revisionGoalIds) {
  const revision = revisions[goalId]
  const beforeGoal = beforeGoalById.get(goalId)!
  const finalGoal = finalGoalById.get(goalId)!
  const atomicityRecord = atomicity.find((candidate) => candidate.goalId === goalId)
  const memoryRecord = goalMemory.find((candidate) => candidate.goalId === goalId)
  assert(atomicityRecord && memoryRecord, `${goalId}: missing review-ledger record`)
  assert(
    atomicityRecord.ruleVersion === 'semantic-atomicity-v1'
      && atomicityRecord.status === 'atomic'
      && atomicityRecord.semanticAtomic === true
      && exactArray(atomicityRecord.suggestedSplit, []),
    `${goalId}: atomicity decision drifted`,
  )
  const beforeAtomicity = goalReviewFingerprint(beforeGoal, atomicityRecord.ruleVersion)
  const finalAtomicity = goalReviewFingerprint(finalGoal, atomicityRecord.ruleVersion)
  assert(
    atomicityRecord.fingerprint === beforeAtomicity
      || atomicityRecord.fingerprint === finalAtomicity,
    `${goalId}: atomicity fingerprint is outside bounded states`,
  )
  Object.assign(atomicityRecord, {
    fingerprint: finalAtomicity,
    reviewedAt,
    reviewer,
    reason: revision.atomicityReason,
  })

  assert(memoryRecord.ruleVersion === 'memory-card-review-v1', `${goalId}: memory rule drifted`)
  if (goalId === revisionGoalIds[0]) {
    assert(
      memoryRecord.status === 'memory_required'
        && memoryRecord.memoryUseful === true
        && exactArray(memoryRecord.memoryGoalIds, [linalgMemoryGoalId])
        && exactArray(memoryRecord.deckIds, [linalgDeckId]),
      `${goalId}: memory-required binding drifted`,
    )
  } else {
    assert(
      memoryRecord.status === 'no_memory_needed'
        && memoryRecord.memoryUseful === false
        && (!memoryRecord.memoryGoalIds || exactArray(memoryRecord.memoryGoalIds, []))
        && (!memoryRecord.deckIds || exactArray(memoryRecord.deckIds, [])),
      `${goalId}: no-memory decision drifted`,
    )
  }
  const beforeMemory = goalReviewFingerprint(beforeGoal, memoryRecord.ruleVersion)
  const finalMemory = goalReviewFingerprint(finalGoal, memoryRecord.ruleVersion)
  assert(
    memoryRecord.fingerprint === beforeMemory || memoryRecord.fingerprint === finalMemory,
    `${goalId}: memory fingerprint is outside bounded states`,
  )
  Object.assign(memoryRecord, {
    fingerprint: finalMemory,
    reviewedAt,
    reviewer,
    reason: revision.memoryReason,
  })
}

const visualQa = cloneJson(readJson(paths.visualQa))
assert(
  visualQa.schemaVersion === 1 && visualQa.subject === 'mathematik',
  'Unexpected Mathematics visualization-QA ledger',
)
for (const goalId of revisionGoalIds) {
  const revision = revisions[goalId]
  const records = (visualQa.records as JsonRecord[])
    .filter((candidate) => candidate.goalId === goalId)
  assert(records.length === 1, `${goalId}: expected exactly one visualization-QA record`)
  const record = records[0]
  const assetDigest = `sha256:${assetHashes[goalId]}`
  assert(
    record.title === revision.titleDe
      && (record.description === revision.beforeDescriptionDe
        || record.description === revision.descriptionDe)
      && record.visualizationState === 'available'
      && record.assetSha256 === assetDigest
      && record.aiApprovedAssetSha256 === assetDigest
      && record.contentApprovedChatGpt === 'yes'
      && record.umlautsCorrectChatGpt === 'yes'
      && record.aiApproved === 'yes',
    `${goalId}: visualization-QA identity, approval, or asset digest drifted`,
  )
  Object.assign(record, {
    description: revision.descriptionDe,
    chatGptReviewedAt: reviewedAtIso,
    chatGptReviewer: reviewer,
    chatGptNotes: revision.visualCompatibilityNote,
    aiReviewedAt: reviewedAtIso,
    aiReviewer: reviewer,
    aiNotes: revision.visualCompatibilityNote,
  })
}

const visualReview = [
  '# Mathematik goal visualization review – Batch 218',
  '',
  'Review date: 2026-08-29',
  '',
  'Scope: concrete compatibility recheck of seven existing Nano Banana Pro assets after the',
  'bounded B019 Q2 description adjudication. No image or historical generator prompt is changed.',
  '',
  '| Goal ID | Decision | Asset SHA-256 | Concrete compatibility finding |',
  '|---|---|---|---|',
  ...revisionGoalIds.map((goalId) => (
    `| \`${goalId}\` | \`keep_current_nano_banana_pro_bytes\` | `
    + `\`sha256:${assetHashes[goalId]}\` | ${revisions[goalId].visualCompatibilityNote} |`
  )),
  '',
  'The revised descriptions need not have every assessment facet printed into one orientation',
  'image. Compatibility here means that the visible mathematics is correct, supports the revised',
  'goal, and makes no contradictory completeness claim. The seven canonical, public, and backend',
  'asset copies and all ten retained historical prompt files are hash-bound and byte-identical.',
  '',
  'B020 contains the twelve adjudicated B019 follow-up goals in prerequisite-safe order plus',
  `the single necessary reorder \`${followUpGoalIds[10]}\` before \`${followUpGoalIds[9]}\` and`,
  `\`${reverseContextRegressionGoalId}\` as one narrow regression guard. The four direct`,
  '`requires` corrections change derived `reverseRequires` context for eight goals; this guard is',
  'the only affected goal that was already strict-complete, so no gate or progress claim may rely',
  'on its prior page fingerprint before the new context has been independently rechecked.',
  '',
].join('\n')

const followUpConfig = {
  $schema:
    'https://skillpilot.com/schemas/goal-description-review/v1/'
    + 'goal-description-rollout-batch-config.schema.json',
  schemaVersion: 1,
  batchId:
    'mathematik-rollout-v1-batch-020-q2-lines-planes-and-reverse-context-13-v1-20260829',
  subject: 'mathematik',
  subjectLabel: 'Mathematik',
  bookId: 'de-gym-mathematik-q2-lines-planes-and-reverse-context-13-v1-20260829',
  title:
    'Mathematik B020 – Q2: zwölf adjudizierte Ziele plus reverseRequires-Kontextschutz',
  baseGoalBookConfigPath: 'app/scripts/config/goal-books/de-gym-math-national-atlas.json',
  goalIds: followUpConfigGoalIds,
  outputDirectory:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/'
    + '2026-08-29/batch-020-q2-lines-planes-and-reverse-context-13-v1',
  feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback',
  promptPath:
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/'
    + 'goal-description-understanding-evidence-review-v2.md',
  criteriaPath:
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/'
    + 'mathematik-goal-description-understanding-evidence-review-criteria-v2.md',
  printDerivativeProfile: 'bounded-atlas',
}

const outputBytes = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.goalMemory, serializeJsonl(goalMemory)],
  [paths.visualQa, serializeJson(visualQa)],
  [paths.visualReview, visualReview],
  [paths.followUpConfig, serializeJson(followUpConfig)],
])
assert(outputBytes.size === 7, `Expected exactly seven output files, got ${outputBytes.size}`)
assert(exactArray([...outputBytes.keys()], outputPaths), 'Output boundary or ordering drifted')

const forbiddenOutputFragments = [
  '/mapping/',
  '/composition-views/',
  '/provenance/',
  '/assessments/',
  '/visualizations/',
  '/memory-decks/',
  '/openai-plugin/',
  '/mcp/',
]
for (const path of outputPaths) {
  assert(
    forbiddenOutputFragments.every((fragment) => !`/${path}`.includes(fragment)),
    `Forbidden output escaped the B019 boundary: ${path}`,
  )
}

const plan: PlannedFile[] = []
for (const path of outputPaths) {
  const bytes = outputBytes.get(path)!
  const beforeSha256 = expectedBeforeHashes[path]
  const afterSha256 = sha256(bytes)
  const boundAfterSha256 = expectedAfterHashes[path]
  if (boundAfterSha256 !== 'PENDING') {
    assert(
      afterSha256 === boundAfterSha256,
      `${path}: planned after digest drifted; expected ${boundAfterSha256}, got ${afterSha256}`,
    )
  }
  const exists = existsSync(absolute(path))
  if (exists) {
    assert(
      fileMode(path) === publishedFileMode,
      `${path}: expected mode 0644 before planning, got ${fileMode(path).toString(8)}`,
    )
  }
  const currentSha256 = exists ? sha256(readFileSync(absolute(path))) : 'ABSENT'
  assert(
    currentSha256 === beforeSha256 || currentSha256 === afterSha256,
    `${path}: current output is neither exact bounded before-state nor planned after-state`,
  )
  plan.push({
    path,
    bytes,
    beforeSha256,
    afterSha256,
    mode: publishedFileMode,
    state: currentSha256 === afterSha256 ? 'after' : 'before',
  })
}

const boundedPlan = {
  schemaVersion: 1,
  contract: 'math-b019-q2-adjudication-plan-v1',
  adjudicationSha256: expectedInputHashes[paths.adjudication],
  inputBindings: Object.entries(expectedInputHashes)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([path, hash]) => ({ path, sha256: hash })),
  protectedByteBindings: Object.entries(protectedHashes)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([path, hash]) => ({ path, sha256: hash })),
  outputBindings: plan.map(({ path, beforeSha256, afterSha256, mode }) => ({
    path,
    beforeSha256,
    afterSha256,
    mode,
  })),
  revisionGoalIds,
  semanticKindGoalIds,
  topology,
  adjudicatedFollowUpGoalIds: followUpGoalIds,
  followUpConfigGoalIds,
  reverseRequiresContextEffect: {
    affectedGoalIds: reverseRequiresAffectedGoalIds,
    alreadyStrictCompleteGoalIdsRequiringRegressionProtection: [reverseContextRegressionGoalId],
    pageFingerprintIncludesReverseRequires: true,
    progressAndGateClaimBeforeRecheck: 'forbidden',
  },
  revisionTextsAndReviewReasons: Object.fromEntries(
    revisionGoalIds.map((goalId) => [goalId, revisions[goalId]]),
  ),
  exclusions: [
    'goal IDs, titles, contains edges, and all requires except the four explicit arrays',
    'source mappings, composition views, placements, provenance, and assessments',
    'Nano Banana Pro assets, historical prompts, active decks, cards, and card ledger',
    'progress counts, evidence profiles, resolutions, and curriculum-quality status reports',
    'OpenAI V1 package, MCP, OAuth, tools, schemas, UI, fixtures, and freeze records',
  ],
}
const boundedPlanSha256 = sha256(stableJson(boundedPlan))

console.log(`MODE ${writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN'}`)
console.log(`PLAN_SHA256 ${boundedPlanSha256}`)
console.log(
  'SCOPE descriptions=7 requires=4 semanticKinds=9 atomicity=7 memory=7 visualQa=7'
    + ' images=0 prompts=0 cards=0 mappings=0 views=0 provenance=0 assessments=0 outputs=7',
)
for (const item of plan) {
  console.log(
    `${item.state === 'after' ? 'KEEP' : 'UPDATE'} ${item.path} `
      + `${item.beforeSha256} -> ${item.afterSha256}`,
  )
}

if (checkMode) {
  assert(
    Object.values(expectedAfterHashes).every((hash) => hash !== 'PENDING'),
    'CHECK failed: exact after hashes are still PENDING',
  )
  assert(expectedPlanSha256 !== 'PENDING', 'CHECK failed: expectedPlanSha256 is still PENDING')
  assert(
    boundedPlanSha256 === expectedPlanSha256,
    `CHECK plan digest mismatch: expected ${expectedPlanSha256}, got ${boundedPlanSha256}`,
  )
  const incomplete = plan.filter((item) => item.state !== 'after')
  assert(
    incomplete.length === 0,
    `CHECK failed: ${incomplete.length} bounded output file(s) are not materialized`,
  )
  console.log('CHECK PASS')
} else if (writeMode) {
  assert(
    Object.values(expectedAfterHashes).every((hash) => hash !== 'PENDING'),
    'Refusing --write: exact after hashes are still PENDING',
  )
  assert(
    expectedPlanSha256 !== 'PENDING',
    `Refusing --write: bind expectedPlanSha256 to ${boundedPlanSha256} after two plan reviews`,
  )
  assert(
    boundedPlanSha256 === expectedPlanSha256,
    `Refusing --write: expected plan ${expectedPlanSha256}, got ${boundedPlanSha256}`,
  )
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  const lockPayload = `pid=${process.pid}\nplan=${boundedPlanSha256}\n`
  let lockOwned = false
  let activeStagingPath: string | undefined
  try {
    writeFileSync(lockPath, lockPayload, { encoding: 'utf8', flag: 'wx', mode: 0o600 })
    lockOwned = true
    assert(fileMode(lockPath) === 0o600, 'Exclusive lock mode mismatch')
    assertBoundInputs()
    for (const item of plan) {
      const exists = existsSync(absolute(item.path))
      const currentSha256 = exists ? sha256(readFileSync(absolute(item.path))) : 'ABSENT'
      const expectedCurrent = item.state === 'before' ? item.beforeSha256 : item.afterSha256
      assert(
        currentSha256 === expectedCurrent,
        `${item.path}: output changed between planning and exclusive lock acquisition`,
      )
      if (exists) {
        assert(
          fileMode(item.path) === item.mode,
          `${item.path}: output mode changed between planning and exclusive lock acquisition`,
        )
      }
    }

    const updates = plan.filter((item) => item.state === 'before')
    for (const item of updates) {
      const targetPath = absolute(item.path)
      activeStagingPath = stagingPathFor(item.path)
      const targetExists = existsSync(targetPath)
      const targetSha256 = targetExists ? sha256(readFileSync(targetPath)) : 'ABSENT'
      assert(targetSha256 === item.beforeSha256, `${item.path}: before-state drifted`)
      writeFileSync(activeStagingPath, item.bytes, {
        encoding: 'utf8',
        flag: 'wx',
        mode: item.mode,
      })
      assert(
        fileMode(activeStagingPath) === item.mode,
        `${item.path}: staging mode mismatch`,
      )
      assert(
        sha256(readFileSync(activeStagingPath)) === item.afterSha256,
        `${item.path}: staging digest mismatch`,
      )
      const recheckedTarget = existsSync(targetPath)
        ? sha256(readFileSync(targetPath))
        : 'ABSENT'
      assert(recheckedTarget === item.beforeSha256, `${item.path}: target changed while staging`)
      if (item.beforeSha256 === 'ABSENT') {
        linkSync(activeStagingPath, targetPath)
        rmSync(activeStagingPath)
      } else {
        renameSync(activeStagingPath, targetPath)
      }
      activeStagingPath = undefined
      assert(
        sha256(readFileSync(targetPath)) === item.afterSha256,
        `${item.path}: published digest mismatch`,
      )
      assert(fileMode(item.path) === item.mode, `${item.path}: published mode mismatch`)
    }
    assertBoundInputs()
    for (const item of plan) {
      assert(existsSync(absolute(item.path)), `${item.path}: final output is missing`)
      assert(
        sha256(readFileSync(absolute(item.path))) === item.afterSha256,
        `${item.path}: final output digest mismatch`,
      )
      assert(fileMode(item.path) === item.mode, `${item.path}: final output mode mismatch`)
    }
    console.log(
      `WRITE PASS ${updates.length} file(s) published sequentially; completed after-states are resumable`,
    )
  } finally {
    if (activeStagingPath && existsSync(activeStagingPath)) rmSync(activeStagingPath)
    if (lockOwned) {
      assert(existsSync(lockPath), 'Exclusive lock disappeared during write')
      assert(
        readFileSync(lockPath, 'utf8') === lockPayload,
        'Exclusive lock ownership changed; stale lock retained fail-closed',
      )
      rmSync(lockPath)
    }
  }
} else {
  console.log('PLAN ONLY; no files written.')
}
