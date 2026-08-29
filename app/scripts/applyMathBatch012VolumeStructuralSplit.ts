import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewDate = '2026-08-28'
const reviewer = 'codex-math-batch012-volume-structural-split'
const mathLandscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'

const ids = {
  retainedCluster: '99ef0fc2-150a-51e8-bac8-7e40e46917b',
  simpleVolume: '7c978529-ce62-5adc-897f-24ea80babbc8',
  compositeVolume: 'e01869db-891c-57a4-8660-789ec6875ec2',
  formulaFoundation: 'b44f038c-fb1f-527e-b9ad-382214d0328a',
  unitFoundation: '57fbbf31-9b8c-5408-9af5-fbc73acd12bb',
  task5: '974edafb-ea7b-588e-b88a-547e7a097c70',
  j6ExamFolder: '7a2a5706-aff4-4fd0-b092-1779d6ecbc1f',
  compositeAssessment: '7285df88-39cf-59c5-86c3-166e84669abc',
} as const

const childIds = [ids.simpleVolume, ids.compositeVolume]
const allCompiledJurisdictions = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const
const assessmentCompiledJurisdictions = [...allCompiledJurisdictions]
const previousAssessmentDerivedJurisdictions = allCompiledJurisdictions
  .filter((value) => value !== 'DE-SH')
const previousSimpleJurisdictions = [
  'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-NI', 'DE-NW',
  'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST',
] as const
const previousCompositeJurisdictions = ['DE-BW', 'DE-BY', 'DE-HE', 'DE-SL', 'DE-SN'] as const
const previousAssessmentJurisdictions = ['DE-BW', 'DE-BY', 'DE-HE', 'DE-SL', 'DE-SN'] as const
const splitStructureId = `split-b012-${ids.retainedCluster}`
const splitStructureLabel = 'Volumina einfacher und zusammengesetzter Quaderkörper bestimmen'
const overviewAssetSha256 = 'b51f224ff0f4ddfe785244b8e8fa3d43f99d3dc7db4fe92e8be18a3ef42baed7'

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  surrogate: 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  atlasSources: 'app/scripts/config/goal-books/de-gym-math-national-atlas.sources.json',
  durationPolicy: 'app/scripts/config/math-duration-split-spanning-tree-policy.json',
  blueprint: 'curricula/DE/Gymnasium/assessments/mathematik/seki/j6/blueprint.md',
  backendFixture: 'backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingRepositoryFixtureTest.java',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  visualizationReview: 'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-213.md',
  visualizationStatusJson: 'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.json',
  visualizationStatusMarkdown: 'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.md',
  rationalePublic: 'app/public/data/goal-source-rationales-math-public.json',
  rationaleAll: 'docs/qa-ci/status/goal-source-rationales-math-all-relevant.json',
  rationaleCoverageJson: 'docs/qa-ci/status/goal-source-rationale-coverage.json',
  rationaleCoverageMarkdown: 'docs/qa-ci/status/goal-source-rationale-coverage.md',
  rationaleGapIssues: 'docs/qa-ci/status/goal-source-rationale-gap-issues.json',
  memoryReport: 'docs/qa-ci/status/memory-card-review-canonical-math-full.md',
  assessmentDraft:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-28/'
    + 'j6/j6-composite-volume-additivity/draft_v1.md',
  assessmentSolution:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-28/'
    + 'j6/j6-composite-volume-additivity/solution_v1.md',
  assessmentReview:
    'curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-28/'
    + 'j6/j6-composite-volume-additivity/simulated_review_v1.md',
  applyScript: 'app/scripts/applyMathBatch012VolumeStructuralSplit.ts',
  reviewContextRebindScript: 'app/scripts/rebindMathKnownReviewContextStales.ts',
  positiveEvidence006bConfig:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-006b-j6-split-children-current-v1.config.json',
  positiveEvidence006bCandidates:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-006b-j6-split-children-current-v1.candidates.json',
  positiveEvidence006bReview:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-006b-j6-split-children-current-v1.review.jsonl',
  positiveEvidence004Config:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-004-seki-repair-split-current-v1.config.json',
  positiveEvidence004Candidates:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-004-seki-repair-split-current-v1.candidates.json',
  positiveEvidence004Review:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-004-seki-repair-split-current-v1.review.jsonl',
  descriptionRebindConfig:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-27/'
    + 'batch-004-seki-repair-split-6-current-v3.config.json',
  descriptionRebindOutput:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-27/'
    + 'batch-004-seki-repair-split-6-current-v3',
  descriptionBatch012Config:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-012-j6-volume-final-2-v2.config.json',
  descriptionBatch012Output:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-012-j6-volume-final-2-v2',
  positiveEvidence012Config:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-012-j6-volume-current-v1.config.json',
  positiveEvidence012Candidates:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-012-j6-volume-current-v1.candidates.json',
  positiveEvidence012Review:
    'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-batch-012-j6-volume-current-v1.review.jsonl',
  deepRolloutConfig:
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/'
    + 'de-gymnasium-math-physics.config.json',
  publicBookModel: 'app/public/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json',
  publicBookPdf: 'app/public/lernzielbuch/de-gym-mathematik-bundesweit.pdf',
  publicBookRenderManifest:
    'app/public/lernzielbuch/de-gym-mathematik-bundesweit.pdf.render-manifest.json',
  adjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-012-j6-volume-structural-split-1-v1/source-edge-adjudication.json',
  receipt:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-012-j6-volume-structural-split-1-v1/application-receipt.json',
} as const

const mappingPaths = [
  'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_to_canonical_math.json',
  'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json',
  'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_to_canonical_math.json',
  'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nrw_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_math_lower_secondary_to_canonical_math.json',
  'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_math_lower_secondary_source_extraction_to_canonical_math.review.json',
] as const

const generatedViewNames = [
  'de-he-seki-g8.view.json', 'de-he-seki-g9.view.json',
  'de-he-gk-g8.view.json', 'de-he-gk-g9.view.json',
  'de-he-lk-g8.view.json', 'de-he-lk-g9.view.json',
  'de-rp-seki-g8.view.json', 'de-rp-seki-g9.view.json',
  'de-rp-gk-g8.view.json', 'de-rp-gk-g9.view.json',
  'de-rp-lk-g8.view.json', 'de-rp-lk-g9.view.json',
  'de-sh-seki-g8.view.json', 'de-sh-seki-g9.view.json',
  'de-sh-gk-g8.view.json', 'de-sh-gk-g9.view.json',
  'de-sh-lk-g8.view.json', 'de-sh-lk-g9.view.json',
] as const
const compositionRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/mathematik')

type RouteSpec = { targets: string[]; note: string }
const route = (targets: string[], note: string): RouteSpec => ({ targets, note })
const simpleNote = 'Der bestätigte Split routet den bisherigen breiten Verweis auf das atomare Ziel zum Bestimmen und einheitenrichtigen Vergleichen von Quader- und Würfelvolumina.'
const compositeNote = 'Der bestätigte Split routet den bisherigen breiten Verweis auf das atomare Additivitätsziel für lücken- und überlappungsfreie Zerlegung oder Ergänzung zusammengesetzter Quaderkörper.'
const bothNote = 'Die Quelle trägt sowohl das einfache Quader-/Würfelvolumen als auch die ausdrücklich genannte Volumenadditivität bei zusammengesetzten Quaderkörpern; beide neuen Atome werden direkt gebunden.'
const routeSpecs: Record<string, RouteSpec> = {
  'bw-math-seki-bp2016-3-1-2-15-78754d0f': route(childIds, bothNote),
  '8af615a2-df8b-4446-af06-b289ba97a111': route(childIds, bothNote),
  'e22589c0-cc0d-5df1-8103-b02fc26be319': route(childIds, bothNote),
  'fbef22b4-fd99-53de-9bf7-d4ad4c8ca4fb': route([ids.simpleVolume], simpleNote),
  'b7f1692a-291c-536a-b2ee-defa7399aa7c': route([ids.compositeVolume], compositeNote),
  'de-hb-mathematik-seki-bildungsplan-2006-2022-hb-seki-content-overview-5-9-021-20b7e0d36c': route([ids.simpleVolume], simpleNote),
  'de-hb-mathematik-seki-bildungsplan-2006-2022-hb-seki-j6-content-standards-026-5d938ec099': route([ids.simpleVolume], simpleNote),
  'he-math-seki-kc-7-3-koerper-j5-6-02-15d6870b': route([ids.simpleVolume], simpleNote),
  'he-math-seki-kc-7-3-messvorgaenge-j5-6-07-2a6dd82a': route([ids.simpleVolume], simpleNote),
  'he-math-seki-g9-5-2-03-de977c1c': route([ids.simpleVolume], simpleNote),
  'he-math-seki-g9-6-2-17-99efcdf0': route([ids.simpleVolume], simpleNote),
  'he-math-seki-g9-6-2-18-14d440a7': route([ids.compositeVolume], compositeNote),
  'he-math-seki-g9-6-2-19-23b99577': route([ids.compositeVolume], compositeNote),
  'he-math-seki-g8-5g-2-18-d54a1407': route([ids.simpleVolume], simpleNote),
  'he-math-seki-g8-5g-2-19-8e06ebb4': route([ids.compositeVolume], compositeNote),
  '209a6413-6598-47d6-b296-962207b2f5b1': route(childIds, bothNote),
  'hh-math-seki-2022-hh-seki-5-6-10-10-9055e569c9': route([ids.simpleVolume], simpleNote),
  'hh-math-seki-2022-hh-seki-5-6-10-11-4e88f18218': route([ids.simpleVolume], simpleNote),
  'hh-math-seki-2022-hh-seki-5-6-10-12-06fefc9e29': route(
    [ids.formulaFoundation],
    'Die Quelle verlangt das Beschreiben und Begründen der Volumenformel anhand des Messvorgangs. Sie bindet daher das bereits vorhandene Plausibilisierungsziel, nicht eines der beiden Berechnungsatome.',
  ),
  'de-mv-mathematik-seki-rahmenplaene-2020-2019-mv-seki-os-j6-stereometrie-005-a3baec8132': route([ids.simpleVolume], simpleNote),
  'de-mv-mathematik-seki-rahmenplaene-2020-2019-mv-seki-os-j6-stereometrie-006-1787ff132d': route(
    [ids.unitFoundation],
    'Die Quelle nennt ausschließlich Volumeneinheiten. Sie bindet daher das bereits vorhandene Ziel zum Deuten und Umrechnen von Volumeneinheiten, nicht eines der Berechnungsatome.',
  ),
  'de-ni-mathematik-seki-kerncurriculum-ni-seki-lernbereich-kern-korper-und-figuren-008-2c8c1bdba8': route([ids.simpleVolume], simpleNote),
  'de-nw-mathematik-seki-klp-2019-nw-seki-erprobung-geometrie-002-1c09f2ff48': route([ids.simpleVolume], simpleNote),
  'de-nw-mathematik-seki-klp-2019-nw-seki-erprobung-geometrie-016-f8f9d99d51': route([ids.simpleVolume], simpleNote),
  'de-rp-mathematik-seki-rahmenlehrplan-2007-rp-seki-os-l2-messen-groessen-005-c05173b1ab': route([ids.simpleVolume], simpleNote),
  'de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l2-grossen-und-messen-K024-7460f69fbd': route([ids.simpleVolume], simpleNote),
  'sh-sek1-jg5-6-groessen-messen-volumen-quader': route([ids.simpleVolume], simpleNote),
  'de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t05-flacheninhalt-und-volumen-b19-a6e51e74d6': route([ids.compositeVolume], compositeNote),
  'de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t05-flacheninhalt-und-volumen-b26-e6d1b45ccc': route([ids.simpleVolume], simpleNote),
  'de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t05-flacheninhalt-und-volumen-b28-afcaa6cb28': route([ids.simpleVolume], simpleNote),
  'de-sn-mathematik-seki-lehrplan-gymnasium-2019-sn-seki-5-lb04-rechtecke-und-quader-r009-5632a04ac5': route([ids.simpleVolume], simpleNote),
  'de-sn-mathematik-seki-lehrplan-gymnasium-2019-sn-seki-5-lb04-rechtecke-und-quader-r012-92f4e90477': route([ids.compositeVolume], compositeNote),
  'de-st-mathematik-seki-fachlehrplan-gymnasium-2019-st-seki-5-6-gk-lk-umfang-flacheninhalt-und-volumen-k010-e498ee43ec': route([ids.simpleVolume], simpleNote),
  'de-st-mathematik-seki-fachlehrplan-gymnasium-2019-st-seki-5-6-gk-lk-umfang-flacheninhalt-und-volumen-k011-70cb6cff67': route([ids.simpleVolume], simpleNote),
  'de-st-mathematik-seki-fachlehrplan-gymnasium-2019-st-seki-5-6-gk-lk-umfang-flacheninhalt-und-volumen-w016-956b77f0f4': route([ids.simpleVolume], simpleNote),
  'de-th-mathematik-seki-lehrplan-gymnasium-2018-2025-th-seki-2025-2-1-4-raum-und-form-023-25ccf8044a': route([], 'Die gebundene Thüringer Quellzeile nennt Umfang, Flächeninhalt und Oberflächeninhalt, aber kein Volumen; der fachfremde Volumenverweis wird ersatzlos entfernt.'),
  'de-th-mathematik-seki-lehrplan-gymnasium-2018-2025-th-seki-2025-2-1-4-raum-und-form-024-3c7aadd43c': route([], 'Die gebundene Thüringer Quellzeile nennt Umfang, Flächeninhalt und Oberflächeninhalt, aber kein Volumen; der fachfremde Volumenverweis wird ersatzlos entfernt.'),
  'de-th-mathematik-seki-lehrplan-gymnasium-2018-2025-th-seki-2025-2-1-4-raum-und-form-025-2f559a65e2': route([], 'Die gebundene Thüringer Quellzeile nennt Umfang, Flächeninhalt und Oberflächeninhalt, aber kein Volumen; der fachfremde Volumenverweis wird ersatzlos entfernt.'),
}

const childSpecs = [
  {
    id: ids.simpleVolume,
    shortKey: 'canonical_math_sek1_j6_determine_cuboid_cube_volumes',
    title: 'Volumina von Quadern und Würfeln bestimmen',
    titleEn: 'Determine volumes of cuboids and cubes',
    description: 'Die lernende Person kann die Volumina von Quadern und Würfeln mithilfe von Einheitswürfeln oder aus Kantenlängen bestimmen, die Ergebnisse in geeigneten Volumeneinheiten angeben und sie nach erforderlicher Umrechnung vergleichen.',
    descriptionEn: 'The learner can determine the volumes of cuboids and cubes using unit cubes or edge lengths, state the results in suitable units of volume, and compare them after any required conversion.',
    topicCode: 'CANONICAL.MATH.SEK1.J6.2B2',
    requires: [ids.formulaFoundation, ids.unitFoundation],
    jurisdictions: allCompiledJurisdictions,
    atomicityReason: 'Einheitswürfel- oder Kantenlängenmodell, einheitenrichtige Angabe und gegebenenfalls Umrechnung beziehungsweise Vergleich sind zusammengehörige Ausführungsschritte derselben Kompetenz zum Volumen eines einzelnen Quaders oder Würfels.',
    memoryReason: 'Die Kompetenz beruht auf räumlichem Volumenverständnis, Berechnung und Einheitenbezug; ein separates Memory-Deck würde diese begründete Anwendung nicht sinnvoll ersetzen.',
  },
  {
    id: ids.compositeVolume,
    shortKey: 'canonical_math_sek1_j6_determine_composite_cuboid_volumes_additively',
    title: 'Volumina zusammengesetzter Quaderkörper additiv bestimmen',
    titleEn: 'Determine volumes of composite cuboid solids additively',
    description: 'Die lernende Person kann die Additivität des Volumens nutzen, um die Volumina aus Quadern und Würfeln zusammengesetzter Körper durch eine geeignete lücken- und überlappungsfreie Zerlegung oder durch Ergänzen zu einem Quader und Subtrahieren des Ergänzungsvolumens zu bestimmen und das Ergebnis anhand der Körperstruktur auf Plausibilität zu prüfen.',
    descriptionEn: 'The learner can use the additivity of volume to determine the volumes of solids composed of cuboids and cubes by a suitable decomposition without gaps or overlaps, or by completing the solid to a cuboid and subtracting the complementary volume, and check the result for plausibility against the structure of the solid.',
    topicCode: 'CANONICAL.MATH.SEK1.J6.2B3',
    requires: [ids.simpleVolume],
    jurisdictions: allCompiledJurisdictions,
    atomicityReason: 'Zerlegen beziehungsweise Ergänzen, additiver Volumenansatz und Ergebnisprüfung werden durch dasselbe fachliche Invariant der Volumenadditivität gesteuert und bilden eine kohärente, eigenständig prüfbare Kompetenz.',
    memoryReason: 'Das Ziel erfordert das begründete Strukturieren eines Körpers und die Kontrolle einer additiven Rechnung; isoliertes Auswendiglernen ist dafür nicht erforderlich.',
  },
] as const

const previousCompositeDescription = 'Die lernende Person kann die Additivität des Volumens nutzen, um die Volumina aus Quadern und Würfeln zusammengesetzter Körper durch lücken- und überlappungsfreies Zerlegen oder durch Ergänzen zu einem Quader und Subtrahieren des Ergänzungsvolumens zu bestimmen und das Ergebnis zu prüfen.'
const previousCompositeDescriptionEn = 'The learner can use the additivity of volume to determine the volumes of solids composed of cuboids and cubes by decomposing them without gaps or overlaps, or by completing them to a cuboid and subtracting the added volume, and check the result.'

const assessmentShortKey = 'canonical_math_sek1_practice_j6_volume_additivity_follow_up'
const assessmentTaskContent = 'Ein quaderförmiger Ausstellungsblock ist 8 cm lang, 5 cm breit und 4 cm hoch. Aus einer Ecke wird über die gesamte Höhe ein Quader mit 3 cm Länge und 2 cm Breite herausgenommen.\n\n1. Bestimme das verbleibende Volumen durch Ergänzen zum ursprünglichen Quader und Subtrahieren des herausgenommenen Volumens. (2 BE)\n2. Zerlege den verbleibenden Körper stattdessen in zwei Quader, gib deren Maße an und berechne das Volumen erneut. (2 BE)\n3. Begründe, warum deine Zerlegung weder eine Lücke noch eine Überlappung enthält, und erkläre, weshalb beide Rechenwege dasselbe Ergebnis liefern müssen. Prüfe außerdem, ob dein Ergebnis zwischen 0 cm³ und dem Volumen des vollständigen Quaders liegt. (2 BE)'
const assessmentSolutionContent = 'Der vollständige Quader hat das Volumen 8 · 5 · 4 = 160 cm³. Der herausgenommene Quader hat das Volumen 3 · 2 · 4 = 24 cm³. Durch Ergänzen und Subtrahieren ergibt sich 160 cm³ − 24 cm³ = 136 cm³.\n\nEine mögliche lücken- und überlappungsfreie Zerlegung besteht aus einem Quader 5 cm × 5 cm × 4 cm und einem Quader 3 cm × 3 cm × 4 cm. Ihre Volumina sind 100 cm³ und 36 cm³, zusammen also ebenfalls 136 cm³.\n\nDie beiden Teilquader decken den Restkörper vollständig ab und haben keinen gemeinsamen Rauminhalt; ihre Berührungsfläche besitzt kein Volumen. Deshalb darf man die Teilvolumina addieren. Beide Strategien beschreiben denselben Körper und müssen nach der Additivität des Volumens übereinstimmen. Die Kontrolle 0 < 136 < 160 ist erfüllt.'
const assessmentDraftMarkdown = `# Zusatzaufgabe S3: Volumenadditivität bei einem zusammengesetzten Quaderkörper

Status: released after focused simulated review on 2026-08-28

Bewertungseinheiten: 6 BE

${assessmentTaskContent}
`
const assessmentSolutionMarkdown = `# Lösung zu Zusatzaufgabe S3: Volumenadditivität

${assessmentSolutionContent}

## Bewertung

- 2 BE für den korrekten Ergänzungs-/Subtraktionsansatz und 136 cm³.
- 2 BE für eine lücken- und überlappungsfreie Zerlegung mit korrekten Maßen und Teilvolumina.
- 2 BE für die fachliche Additivitätsbegründung und eine sinnvolle Größenkontrolle.
`
const assessmentReviewMarkdown = `# Simulierte Fachreview: Zusatzaufgabe S3 Volumenadditivität

Review date: 2026-08-28

Decision: \`released\`

- Die Aufgabe bindet ausschließlich das neue atomare Additivitätsziel
  \`${ids.compositeVolume}\`.
- Ergänzen/Subtrahieren und eine geometrisch andere Zerlegung liefern beide
  136 cm³; die vorgegebenen Maße sind widerspruchsfrei.
- Die Begründung verlangt ausdrücklich Lückenfreiheit, fehlende Doppelzählung,
  Strategieinvarianz und eine Größenkontrolle. Reine Formelsubstitution genügt
  daher nicht.
- \`requires\` und \`examData.coveredGoalIds\` sind identisch und behaupten
  keine zusätzliche Kompetenzabdeckung.
`

const expectedBeforeHashes: Record<string, string> = {
  [paths.canonical]: 'af12f6d966ee4214e014dcab032b5dbbac092c7b87b76de13c290d694f327127',
  [paths.provenance]: '95d45a15220a407101b8badde8c17646fbd23aee4bae7115746f7e2fa82f42b0',
  [paths.surrogate]: '67136140249355b9dee205f3d95bddf985e96535efec8379dc43f0e40a679b4a',
  [paths.semanticKinds]: 'e4d6e27a791c1b1df964aa0d333c633fd4e57542695ea539f8b3027b6768a480',
  [paths.atomicity]: '0bc6bb7fe7713d5ca238d264e134cb6ad87c7d855191fbc8ad642128dc59c173',
  [paths.memory]: 'db069401dccdc2876b307ae58ecd9bd8f0c691c7cd628356ab128892cd59977c',
  [paths.atlasSources]: '7a0a1bb7747e471eef947bb11eebd72f105a9fd821c6c9898daf05d8a06c4909',
  [paths.durationPolicy]: 'be4b010b9563977f5e37e4bf9cf61864ce3967e30b9dd8fbc4c6f34b882d78e3',
  [paths.blueprint]: 'f06f4ed859a9a27e56ae902eea3bc724bf6bc871e31b6745e8736d829f69f6d2',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-by-gk.view.json': '9b9e0da1ca88f397ee912ab20e9afcb25962c722528281d9a1acd97ecff18697',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-by-lk.view.json': '9e6f2fd2eb3d4348122ae55c473ecc8e45f0c5fdc49de68afb54703c64f759c0',
  [paths.visualizationQa]: '7d66a6366b4eb8e465c1dfb4c5a8c949e2a5d7af3bd2eda5e38f05054aa193bd',
}
const expectedBeforeMappingCorpusSha256 = 'cf506cf765e09ec2b1c7fd72c88e8024beba5eb8a6554ab8889f0d82a1571382'
const expectedAfterPlannedCorpusSha256 = '13f307ae004f9c1e66e60ef9f8cc3d1a2f582c3ebc4dd6133a3a3c501c88e0be'

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8').split(/\r?\n/u)
  .filter((line) => line.trim() !== '').map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const sha256Digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const sourceId = (entry: JsonRecord): string => String(entry.sourceGoalId ?? entry.legacyGoalId ?? '')
const targetId = (entry: JsonRecord): string => String(entry.canonicalGoalId ?? '')
const unique = <T>(values: T[]): T[] => [...new Set(values)]

const deterministicGoalId = (shortKey: string): string => {
  const value = createHash('sha1').update(`DE-GYM-CANONICAL-MATH:${shortKey}`).digest('hex')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20, 32)}`
}

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

const beforeMappingCorpusDigest = (): string => sha256(JSON.stringify(mappingPaths.map((path) => ({
  path,
  sha256: sha256(readFileSync(absolute(path))),
}))))

function assertOverviewAsset(): void {
  for (const path of [
    `curricula/DE/Gymnasium/visualizations/mathematik/${ids.retainedCluster}/${ids.retainedCluster}.jpg`,
    `app/public/assets/goal-visualizations/mathematik/${ids.retainedCluster}/${ids.retainedCluster}.jpg`,
    `backend/src/main/resources/static/assets/goal-visualizations/mathematik/${ids.retainedCluster}/${ids.retainedCluster}.jpg`,
  ]) {
    const actual = sha256(readFileSync(absolute(path)))
    if (actual !== overviewAssetSha256) throw new Error(`Protected Nano Banana overview drift at ${path}: ${actual}`)
  }
}

function assertBeforeHashesIfNeeded(): void {
  const canonical = readJson(paths.canonical)
  const retained = (canonical.goals as JsonRecord[]).find((goal) => goal.id === ids.retainedCluster)
  const inBeforeState = retained?.type === 'atomic' && Array.isArray(retained.contains) && retained.contains.length === 0
  if (!inBeforeState) return
  for (const [path, expected] of Object.entries(expectedBeforeHashes)) {
    const actual = sha256(readFileSync(absolute(path)))
    if (actual !== expected) throw new Error(`Batch-012 before-hash drift at ${path}: ${actual} != ${expected}`)
  }
  const mappingDigest = beforeMappingCorpusDigest()
  if (mappingDigest !== expectedBeforeMappingCorpusSha256) {
    throw new Error(`Batch-012 mapping-corpus before-hash drift: ${mappingDigest}`)
  }
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  if (landscape.landscapeId !== mathLandscapeId) throw new Error('Unexpected canonical Mathematics landscape')
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [String(goal.id), goal]))
  if (byId.size !== goals.length) throw new Error('Duplicate canonical goal IDs')
  const retained = byId.get(ids.retainedCluster)
  if (!retained) throw new Error('Missing retained volume goal')
  const isBefore = retained.type === 'atomic' && same(retained.contains, [])
  const isAfter = retained.type === 'cluster' && same(retained.contains, childIds)
  if (!isBefore && !isAfter) throw new Error('Retained volume ID is neither in exact before nor exact after state')
  if (!Array.isArray(retained.resourceLinks) || retained.resourceLinks.length !== 1) {
    throw new Error('Retained volume overview link is missing')
  }
  retained.type = 'cluster'
  retained.weight = 2
  retained.contains = [...childIds]
  retained.requires = []
  delete retained.semanticAtomic

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
    dimensionTags: { ...structuredClone(retained.dimensionTags), topicCode: spec.topicCode },
    contains: [],
    requires: [...spec.requires],
    applicability: { jurisdiction: [...spec.jurisdictions] },
    type: 'atomic',
    semanticAtomic: true,
    resourceLinks: [],
  }))
  for (const expected of expectedChildren) {
    const existing = byId.get(String(expected.id))
    if (existing && !same(existing, expected)) {
      const previousJurisdictions = expected.id === ids.simpleVolume
        ? previousSimpleJurisdictions
        : previousCompositeJurisdictions
      const acceptedMigrationStates = [structuredClone(expected)]
      acceptedMigrationStates[0].applicability = { jurisdiction: [...previousJurisdictions] }
      if (expected.id === ids.compositeVolume) {
        const previousDescriptionState = structuredClone(acceptedMigrationStates[0])
        previousDescriptionState.description = previousCompositeDescription
        previousDescriptionState.descriptionEn = previousCompositeDescriptionEn
        acceptedMigrationStates.push(previousDescriptionState)
      }
      if (!acceptedMigrationStates.some((candidate) => same(existing, candidate))) {
        throw new Error(`Existing child differs from the exact Batch-012 migration states: ${String(expected.id)}`)
      }
      byId.set(String(expected.id), expected)
      continue
    }
    byId.set(String(expected.id), existing ?? expected)
  }
  for (const childId of childIds) {
    const index = goals.findIndex((goal) => goal.id === childId)
    if (index >= 0) goals.splice(index, 1)
  }
  const retainedIndex = goals.findIndex((goal) => goal.id === ids.retainedCluster)
  goals.splice(retainedIndex + 1, 0, ...childIds.map((goalId) => byId.get(goalId)!))

  const rewireIds = [
    '2345ae25-5805-4c72-b830-32e63cc6262a',
    '3d49cd27-3a84-50eb-ac35-f0b0bee80df2',
    '415bd48b-8a76-4d4f-bfdd-d085573e7ac3',
    ids.task5,
  ]
  for (const goalId of rewireIds) {
    const goal = byId.get(goalId)
    if (!goal) throw new Error(`Missing canonical rewire goal ${goalId}`)
    const requires = (goal.requires ?? []) as string[]
    goal.requires = unique(requires.map((requiredId) => requiredId === ids.retainedCluster ? ids.simpleVolume : requiredId))
    if (goal.requires.includes(ids.retainedCluster)) throw new Error(`Stale requires edge on ${goalId}`)
  }
  const task5 = byId.get(ids.task5)!
  task5.examData.coveredGoalIds = unique((task5.examData.coveredGoalIds as string[])
    .map((goalId) => goalId === ids.retainedCluster ? ids.simpleVolume : goalId))

  const assessment: JsonRecord = {
    id: ids.compositeAssessment,
    title: 'Zusatzaufgabe S3: Volumenadditivität bei einem zusammengesetzten Quaderkörper',
    description: 'Die lernende Person kann in einer freigegebenen Zusatzaufgabe das Volumen eines zusammengesetzten Quaderkörpers durch Ergänzen und durch eine lücken- und überlappungsfreie Zerlegung bestimmen, die Übereinstimmung begründen und das Ergebnis prüfen.',
    weight: 1,
    tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'phase:SekI', 'ExamTask'],
    applicability: { jurisdiction: [...assessmentCompiledJurisdictions] },
    extendedData: {
      applicabilityFromRequires: true,
      applicabilityMappingInheritance: 'boundary',
    },
    sourceRef: paths.assessmentDraft,
    dimensionTags: {
      framework: 'canonical-gymnasium-math',
      demandLevel: 'AB2',
      processCompetencies: ['K1', 'K2', 'K3'],
      guidingIdeas: ['L2'],
      phase: 'J6',
      area: 'Mathematik',
      topicCode: 'CANONICAL.MATH.SEK1.PRACTICE.J6.COMPOSITE_VOLUME_ADDITIVITY',
    },
    shortKey: assessmentShortKey,
    contains: [],
    requires: [ids.compositeVolume],
    phase: 'J6',
    type: 'atomic',
    nodeKind: 'exam',
    examData: {
      reviewStatus: 'released',
      reviewNote: 'released after focused simulated internal review on 2026-08-28 for the Batch-012 composite-volume route',
      coveredGoalIds: [ids.compositeVolume],
      coveredStrands: ['L2'],
      demandLevels: ['AB1', 'AB2'],
      sourceArtifactPath: paths.assessmentDraft,
      taskContent: assessmentTaskContent,
      solutionContent: assessmentSolutionContent,
      scoring: {
        maxPoints: 6,
        passingPoints: 3,
        steps: [{
          id: 'j6_batch012_composite_volume_additivity',
          points: 6,
          description: 'Volumenadditivität durch Ergänzen und Zerlegen nutzen, die Strategieinvarianz begründen und das Ergebnis prüfen.',
        }],
      },
    },
  }
  const existingAssessment = byId.get(ids.compositeAssessment)
  if (existingAssessment && !same(existingAssessment, assessment)) {
    const previousDerivedAssessment = structuredClone(assessment)
    previousDerivedAssessment.applicability = {
      jurisdiction: [...previousAssessmentDerivedJurisdictions],
    }
    const currentApplicabilityBeforeSemantics = structuredClone(assessment)
    delete currentApplicabilityBeforeSemantics.extendedData
    const previousAssessment = structuredClone(currentApplicabilityBeforeSemantics)
    previousAssessment.applicability = { jurisdiction: [...previousAssessmentJurisdictions] }
    if (![previousDerivedAssessment, currentApplicabilityBeforeSemantics, previousAssessment]
      .some((candidate) => same(existingAssessment, candidate))) {
      throw new Error('Existing Batch-012 assessment differs from the exact applicability migration state')
    }
  }
  byId.set(ids.compositeAssessment, assessment)
  const assessmentIndex = goals.findIndex((goal) => goal.id === ids.compositeAssessment)
  if (assessmentIndex >= 0) goals.splice(assessmentIndex, 1)
  const examFolder = byId.get(ids.j6ExamFolder)
  if (!examFolder || examFolder.type !== 'cluster') throw new Error('Missing J6 exam folder')
  examFolder.contains = unique([...(examFolder.contains as string[]), ids.compositeAssessment])
  examFolder.weight = examFolder.contains.length
  const lastExistingAssessmentIndex = Math.max(...(examFolder.contains as string[])
    .filter((goalId) => goalId !== ids.compositeAssessment)
    .map((goalId) => goals.findIndex((goal) => goal.id === goalId)))
  goals.splice(lastExistingAssessmentIndex + 1, 0, byId.get(ids.compositeAssessment)!)

  const parentsByChild = new Map<string, string[]>()
  for (const goal of goals) for (const childId of goal.contains ?? []) {
    parentsByChild.set(childId, [...(parentsByChild.get(childId) ?? []), goal.id])
  }
  const ancestors = new Set<string>()
  const queue = [
    ...(parentsByChild.get(ids.retainedCluster) ?? []),
    ...(parentsByChild.get(ids.j6ExamFolder) ?? []),
  ]
  while (queue.length > 0) {
    const goalId = queue.shift()!
    if (ancestors.has(goalId)) continue
    ancestors.add(goalId)
    queue.push(...(parentsByChild.get(goalId) ?? []))
  }
  const atomicDescendants = (rootId: string): Set<string> => {
    const result = new Set<string>()
    const visiting = new Set<string>()
    const visit = (goalId: string): void => {
      if (visiting.has(goalId)) throw new Error(`Contains cycle at ${goalId}`)
      const goal = byId.get(goalId)
      if (!goal) throw new Error(`Missing contains target ${goalId}`)
      if ((goal.contains ?? []).length === 0) return void result.add(goalId)
      visiting.add(goalId)
      for (const childId of goal.contains) visit(childId)
      visiting.delete(goalId)
    }
    visit(rootId)
    return result
  }
  for (const ancestorId of ancestors) byId.get(ancestorId)!.weight = atomicDescendants(ancestorId).size
  landscape.goals = goals
  return landscape
}

function replaceMappingEntry(entry: JsonRecord, targets: string[]): JsonRecord[] {
  return targets.map((canonicalGoalId) => ({ ...structuredClone(entry), canonicalGoalId }))
}

function buildMappingDocuments(): { beforeCount: number; documents: Map<string, JsonRecord>; routeBindings: JsonRecord[] } {
  let beforeCount = 0
  const documents = new Map<string, JsonRecord>()
  const routeBindings: JsonRecord[] = []
  for (const path of mappingPaths) {
    const document = readJson(path)
    const beforeMappings = document.mappings as JsonRecord[]
    const encountered = new Set<string>()
    const afterMappings: JsonRecord[] = []
    for (const entry of beforeMappings) {
      if (targetId(entry) !== ids.retainedCluster) {
        afterMappings.push(entry)
        continue
      }
      beforeCount += 1
      const sid = sourceId(entry)
      const spec = routeSpecs[sid]
      if (!spec) throw new Error(`Unadjudicated old mapping edge ${path}:${sid}`)
      encountered.add(sid)
      const existingTargets = new Set(beforeMappings.filter((candidate) => sourceId(candidate) === sid).map(targetId))
      for (const replacement of replaceMappingEntry(entry, spec.targets)) {
        if (!existingTargets.has(targetId(replacement)) && !afterMappings.some((candidate) => (
          sourceId(candidate) === sid && targetId(candidate) === targetId(replacement)
        ))) afterMappings.push(replacement)
      }
    }
    const decisions = document.decisions as JsonRecord[] | undefined
    if (decisions) for (const decision of decisions) {
      const sid = String(decision.sourceGoalId ?? '')
      const spec = routeSpecs[sid]
      if (!spec || !(decision.canonicalGoalIds as string[]).includes(ids.retainedCluster)) continue
      encountered.add(sid)
      decision.canonicalGoalIds = unique((decision.canonicalGoalIds as string[]).flatMap(
        (goalId) => goalId === ids.retainedCluster ? spec.targets : [goalId],
      ))
      decision.rationale = `${String(decision.rationale ?? '').trim()} Batch 012: ${spec.note}`.trim()
    }
    document.mappings = afterMappings
    documents.set(path, document)
    for (const sid of encountered) {
      const beforeCanonicalGoalIds = beforeMappings.filter((entry) => sourceId(entry) === sid).map(targetId)
      const afterCanonicalGoalIds = afterMappings.filter((entry) => sourceId(entry) === sid).map(targetId)
      routeBindings.push({ path, sourceGoalId: sid, beforeCanonicalGoalIds, afterCanonicalGoalIds, note: routeSpecs[sid].note })
    }
  }
  if (beforeCount !== 0 && beforeCount !== 40) throw new Error(`Observed ${beforeCount} old mapping edges, expected 40`)
  return { beforeCount, documents, routeBindings }
}

function assertFinalMappingDocuments(documents: Map<string, JsonRecord>): void {
  for (const [path, document] of documents) {
    const mappings = document.mappings as JsonRecord[]
    if (mappings.some((entry) => targetId(entry) === ids.retainedCluster)) throw new Error(`Stale old mapping in ${path}`)
    for (const [sid, spec] of Object.entries(routeSpecs)) {
      const sourceMappings = mappings.filter((entry) => sourceId(entry) === sid)
      const decision = (document.decisions as JsonRecord[] | undefined)?.find((entry) => entry.sourceGoalId === sid)
      if (sourceMappings.length === 0 && !decision) continue
      for (const target of spec.targets) {
        if (!sourceMappings.some((entry) => targetId(entry) === target)) throw new Error(`Missing routed target ${path}:${sid}->${target}`)
      }
      for (const childId of childIds) {
        if (!spec.targets.includes(childId) && sourceMappings.some((entry) => targetId(entry) === childId)) {
          throw new Error(`Unsupported split-child target ${path}:${sid}->${childId}`)
        }
      }
      if (decision) {
        const decisionIds = decision.canonicalGoalIds as string[]
        if (decisionIds.includes(ids.retainedCluster)) throw new Error(`Stale mapping decision ${path}:${sid}`)
        for (const target of spec.targets) if (!decisionIds.includes(target)) throw new Error(`Decision lacks ${target}: ${path}:${sid}`)
      }
    }
  }
}

function buildAdjudication(routeBindings: JsonRecord[]): JsonRecord {
  if (existsSync(absolute(paths.adjudication))) {
    const existing = readJson(paths.adjudication)
    const payload = structuredClone(existing)
    delete payload.adjudicationDigest
    const expected = sha256Digest(JSON.stringify(payload))
    if (existing.adjudicationDigest !== expected) throw new Error('Batch-012 adjudication digest drift')
    return existing
  }
  if (routeBindings.length === 0) {
    // Recovery for an interrupted first write: source files may already be in
    // their exact after state while the adjudication was scheduled later in
    // the same fail-closed write list. HEAD is accepted only when it still
    // carries the pinned canonical before hash.
    const headCanonical = execFileSync('git', ['show', `HEAD:${paths.canonical}`], {
      cwd: repoRoot, maxBuffer: 16 * 1024 * 1024,
    })
    if (sha256(headCanonical) !== expectedBeforeHashes[paths.canonical]) {
      throw new Error('Cannot recover Batch-012 route bindings: HEAD is not the pinned before state')
    }
    for (const path of mappingPaths) {
      const beforeDocument = JSON.parse(execFileSync('git', ['show', `HEAD:${path}`], {
        cwd: repoRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
      })) as JsonRecord
      const afterDocument = readJson(path)
      const oldSourceIds = unique((beforeDocument.mappings as JsonRecord[])
        .filter((entry) => targetId(entry) === ids.retainedCluster).map(sourceId))
      for (const sid of oldSourceIds) routeBindings.push({
        path,
        sourceGoalId: sid,
        beforeCanonicalGoalIds: (beforeDocument.mappings as JsonRecord[])
          .filter((entry) => sourceId(entry) === sid).map(targetId),
        afterCanonicalGoalIds: (afterDocument.mappings as JsonRecord[])
          .filter((entry) => sourceId(entry) === sid).map(targetId),
        note: routeSpecs[sid].note,
      })
    }
  }
  const payload: JsonRecord = {
    schemaVersion: 1,
    adjudicationId: 'canonical-math-99ef-volume-structural-split-2026-08-28-v1',
    status: 'APPROVED_IMPLEMENTATION_INPUT',
    reviewedAt: reviewDate,
    retainedClusterId: ids.retainedCluster,
    retainedScopeUnchanged: true,
    retainedNanoBananaOverviewSha256: `sha256:${overviewAssetSha256}`,
    children: childSpecs.map(({ id, shortKey, title, titleEn, description, descriptionEn, requires, jurisdictions }) => ({
      id, shortKey, title, titleEn, description, descriptionEn, requires, jurisdictions,
    })),
    sourceMappingRoutes: routeBindings,
    completeness: {
      physicalOldOccurrenceCount: routeBindings.reduce((sum, binding) => (
        sum + (binding.beforeCanonicalGoalIds as string[]).filter((goalId) => goalId === ids.retainedCluster).length
      ), 0),
      affectedMappingDocumentCount: unique(routeBindings.map((binding) => String(binding.path))).length,
      thuringiaRemovedSourceGoalIds: Object.entries(routeSpecs)
        .filter(([sourceGoalId, spec]) => sourceGoalId.startsWith('de-th-') && spec.targets.length === 0)
        .map(([sourceGoalId]) => sourceGoalId),
      openUncertainties: [],
    },
    beforeState: {
      canonicalSha256: `sha256:${expectedBeforeHashes[paths.canonical]}`,
      mappingCorpusSha256: `sha256:${expectedBeforeMappingCorpusSha256}`,
    },
  }
  return { ...payload, adjudicationDigest: sha256Digest(JSON.stringify(payload)) }
}

function buildProvenance(mappings: Map<string, JsonRecord>): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[]).find((entry) => entry.landscapeId === mathLandscapeId)
  if (!landscape) throw new Error('Missing Mathematics provenance landscape')
  const provenance = landscape.goalProvenance as JsonRecord
  if (!provenance[ids.retainedCluster]) throw new Error('Retained cluster provenance must remain present')
  for (const childId of childIds) {
    const sources: Array<{ sourceLandscapeId: string; sourceGoalId: string }> = []
    for (const [path, document] of mappings) {
      if (!path.endsWith('.review.json')) continue
      for (const entry of document.mappings as JsonRecord[]) {
        if (targetId(entry) !== childId) continue
        sources.push({ sourceLandscapeId: String(document.sourceLandscapeId), sourceGoalId: sourceId(entry) })
      }
    }
    const preferred = sources.find((source) => source.sourceGoalId === 'bw-math-seki-bp2016-3-1-2-15-78754d0f')
    if (!preferred) throw new Error(`No direct reviewed source evidence for ${childId}`)
    const additionalSourceLandscapeIds = unique(sources.map((source) => source.sourceLandscapeId)
      .filter((landscapeId) => landscapeId !== preferred.sourceLandscapeId)).sort()
    provenance[childId] = {
      sourceLandscapeId: preferred.sourceLandscapeId,
      sourceGoalId: preferred.sourceGoalId,
      ...(additionalSourceLandscapeIds.length > 0 ? { additionalSourceLandscapeIds } : {}),
    }
  }
  landscape.goalProvenance = Object.fromEntries(Object.entries(provenance).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0))
  return registry
}

function buildSurrogate(): JsonRecord {
  const registry = readJson(paths.surrogate)
  let changed = 0
  for (const entry of registry.entries as JsonRecord[]) {
    if (entry.landscapeId === mathLandscapeId && entry.requiredByGoalId === ids.retainedCluster
      && [ids.formulaFoundation, ids.unitFoundation].includes(entry.goalId)) {
      entry.requiredByGoalId = ids.simpleVolume
      changed += 1
    }
  }
  const afterCount = (registry.entries as JsonRecord[]).filter((entry) => (
    entry.landscapeId === mathLandscapeId && entry.requiredByGoalId === ids.simpleVolume
    && [ids.formulaFoundation, ids.unitFoundation].includes(entry.goalId)
  )).length
  if (changed !== 0 && changed !== 2) throw new Error(`Rewired ${changed} surrogate entries, expected 2`)
  if (afterCount !== 2) throw new Error('The two HB prerequisite-closure bindings are not routed to the simple-volume child')
  return registry
}

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const byId = new Map((ledger.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]))
  const rewiredGoalIds = [
    ids.retainedCluster, ids.simpleVolume, ids.compositeVolume,
    '2345ae25-5805-4c72-b830-32e63cc6262a',
    '3d49cd27-3a84-50eb-ac35-f0b0bee80df2',
    '415bd48b-8a76-4d4f-bfdd-d085573e7ac3',
    ids.task5,
    ids.j6ExamFolder,
    ids.compositeAssessment,
  ]
  for (const goalId of rewiredGoalIds) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    const existing = byId.get(goalId)
    if (!existing && !childIds.includes(goalId) && goalId !== ids.compositeAssessment) {
      throw new Error(`Missing semantic-kind decision ${goalId}`)
    }
    byId.set(goalId, {
      ...(existing ?? {}),
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      ...(goalId === ids.retainedCluster ? {
        semanticKind: 'curricularArea', decisionStatus: 'authoritative',
        decisionBasis: 'reviewed-current-structural-split-curricular-area',
      } : childIds.includes(goalId) ? {
        semanticKind: 'curricularAtomic', decisionStatus: 'authoritative',
        decisionBasis: 'reviewed-current-structural-split-curricular-atomic',
      } : goalId === ids.compositeAssessment ? {
        semanticKind: 'practiceAssessment', decisionStatus: 'authoritative',
        decisionBasis: 'reviewed-current-post-split-practice-assessment',
      } : {}),
    })
  }
  ledger.decisions = [...byId.values()].sort((left, right) => String(left.goalId).localeCompare(String(right.goalId)))
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions) counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  const order = ['curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure', 'memory', 'runtimeSupport', 'orientation']
  ledger.counts = Object.fromEntries(order.filter((kind) => counts[kind] !== undefined).map((kind) => [kind, counts[kind]]))
  ledger.counts.total = ledger.decisions.length
  return ledger
}

function buildReviewLedger(canonical: JsonRecord, kind: 'atomicity' | 'memory'): JsonRecord[] {
  const path = kind === 'atomicity' ? paths.atomicity : paths.memory
  const records = readJsonl(path)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const relevant = new Set([ids.retainedCluster, ...childIds])
  const insertionIndex = records.findIndex((record) => relevant.has(String(record.goalId)))
  const retained = records.filter((record) => !relevant.has(String(record.goalId)))
  const replacements = childSpecs.map((spec): JsonRecord => {
    const goal = goalById.get(spec.id)!
    if (kind === 'atomicity') return {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'semantic-atomicity-v1',
      landscapeId: mathLandscapeId,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
      reviewedAt: reviewDate,
      reviewer,
      status: 'atomic',
      semanticAtomic: true,
      reason: spec.atomicityReason,
      suggestedSplit: [],
    }
    return {
      schemaVersion: 1,
      reviewId: 'canonical-math-full',
      ruleVersion: 'memory-card-review-v1',
      landscapeId: mathLandscapeId,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goal, 'memory-card-review-v1'),
      status: 'no_memory_needed',
      memoryUseful: false,
      reviewedAt: reviewDate,
      reviewer,
      reason: spec.memoryReason,
    }
  })
  retained.splice(insertionIndex < 0 ? retained.length : insertionIndex, 0, ...replacements)
  return retained
}

function buildAtlasSources(): JsonRecord {
  const config = readJson(paths.atlasSources)
  const count = Number(config.expectedCurricularAtomicGoalCount)
  if (![791, 792].includes(count)) throw new Error(`Unexpected Mathematics atlas count ${count}`)
  config.expectedCurricularAtomicGoalCount = 792
  return config
}

const replacementStructure = (): JsonRecord => ({
  kind: 'structure',
  id: splitStructureId,
  label: splitStructureLabel,
  children: childIds.map((goalId) => ({ kind: 'canonicalSubtree', goalId })),
})

const isGoalReference = (value: unknown): value is JsonRecord => Boolean(value && typeof value === 'object'
  && ['goalEntry', 'canonicalSubtree'].includes(String((value as JsonRecord).kind))
  && typeof (value as JsonRecord).goalId === 'string')

function replaceViewReference(value: unknown): { value: unknown; count: number } {
  if (Array.isArray(value)) {
    let count = 0
    const transformed = value.map((entry) => {
      if (isGoalReference(entry) && entry.goalId === ids.retainedCluster) {
        count += 1
        return replacementStructure()
      }
      const nested = replaceViewReference(entry)
      count += nested.count
      return nested.value
    })
    return { value: transformed, count }
  }
  if (value && typeof value === 'object') {
    let count = 0
    const transformed = Object.fromEntries(Object.entries(value as JsonRecord).map(([key, nested]) => {
      const result = replaceViewReference(nested)
      count += result.count
      return [key, result.value]
    }))
    return { value: transformed, count }
  }
  return { value, count: 0 }
}

function countGoalReferences(value: unknown, goalId: string): number {
  if (Array.isArray(value)) return value.reduce((sum: number, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const own = isGoalReference(value) && value.goalId === goalId ? 1 : 0
  return own + Object.values(value as JsonRecord).reduce((sum: number, nested) => sum + countGoalReferences(nested, goalId), 0)
}

function buildManualViews(): Map<string, JsonRecord> {
  const result = new Map<string, JsonRecord>()
  for (const fileName of ['de-by-gk.view.json', 'de-by-lk.view.json']) {
    const path = join(compositionRoot, fileName)
    const transformed = replaceViewReference(JSON.parse(readFileSync(path, 'utf8')))
    if (transformed.count > 1) throw new Error(`${fileName} contains multiple old references`)
    const view = transformed.value as JsonRecord
    if (countGoalReferences(view, ids.retainedCluster) !== 0
      || countGoalReferences(view, ids.simpleVolume) !== 1
      || countGoalReferences(view, ids.compositeVolume) !== 1) {
      throw new Error(`${fileName} lacks the exact Batch-012 projection`)
    }
    result.set(relative(repoRoot, path), view)
  }
  return result
}

function buildDurationPolicy(canonical: JsonRecord, adjudication: JsonRecord): JsonRecord {
  const policy = readJson(paths.durationPolicy)
  policy.inputs.canonical.sha256 = sha256(serializeJson(canonical))
  const adjudicationBytes = serializeJson(adjudication)
  policy.inputs.additiveAdjudications = [
    ...(policy.inputs.additiveAdjudications as JsonRecord[] ?? []).filter((entry) => entry.path !== paths.adjudication),
    { path: paths.adjudication, fileSha256: sha256(adjudicationBytes), adjudicationDigest: adjudication.adjudicationDigest },
  ]
  const contract = policy.policy.j6StructuralSplitContract as JsonRecord
  contract.stableParentClusterIds = unique([...(contract.stableParentClusterIds as string[]), ids.retainedCluster])
  contract.atomicChildGoalIds = unique((contract.atomicChildGoalIds as string[])
    .flatMap((goalId) => goalId === ids.retainedCluster ? childIds : [goalId]))
  contract.status = 'LAYER_A_APPLIED_FRESH_V3_BATCH012_VOLUME_SPLIT'

  const placementByTemplate: Record<string, { parent: string; targets: string[] }> = {
    'de-he-seki-g8.view.json': { parent: 'j5-g8-kompetenzen', targets: childIds },
    'de-he-seki-g9.view.json': { parent: 'j5-g9-kompetenzen', targets: childIds },
    'de-rp-seki-g8.view.json': { parent: 'rp-orientierungsstufe-g8-kompetenzen', targets: [ids.simpleVolume] },
    'de-rp-seki-g9.view.json': { parent: 'rp-orientierungsstufe-g9-kompetenzen', targets: [ids.simpleVolume] },
    'de-sh-seki-g8.view.json': { parent: 'sh-jg5-6-g8-kompetenzen', targets: [ids.simpleVolume] },
    'de-sh-seki-g9.view.json': { parent: 'sh-jg5-6-g9-kompetenzen', targets: [ids.simpleVolume] },
  }
  for (const template of policy.sek1Templates as JsonRecord[]) {
    const spec = placementByTemplate[String(template.fileName)]
    if (!spec) throw new Error(`Unbound duration template ${String(template.fileName)}`)
    const placements = (template.placements as JsonRecord[]).filter((entry) => entry.splitCode !== 'B012-99EF')
    const replacementNode = spec.targets.length === 1
      ? { kind: 'canonicalSubtree', goalId: spec.targets[0] }
      : replacementStructure()
    placements.push({
      parentStructureId: spec.parent,
      splitCode: 'B012-99EF',
      oldClusterGoalId: ids.retainedCluster,
      renderKind: spec.targets.length === 1 ? 'canonicalSubtree' : 'structure',
      // The flat mapping projection can inherit both new atoms through an old
      // broad ancestor cluster. Remove the full split closure first; then add
      // back only the source-supported targets for this jurisdiction.
      removeAtomicGoalIds: [...childIds],
      replacementNode,
    })
    template.placements = placements
    template.placementCount = placements.length
  }
  policy.counts.splitPlacementCount = (policy.sek1Templates as JsonRecord[])
    .reduce((sum, template) => sum + template.placements.length, 0)
  policy.policy.sourceOfLayoutTruth = `The six reviewed duration-specific Sek-I candidate layouts and the bound additive structural adjudications are authoritative for the ${String(policy.counts.splitPlacementCount)} split placements. Mapping buckets remain authoritative for the ordinary atomic target set.`
  return policy
}

function transformExactText(actual: string, before: string, after: string, label: string): string {
  if (actual.includes(after)) return actual
  if (!actual.includes(before)) throw new Error(`Missing exact before/after text for ${label}`)
  return actual.replace(before, after)
}

function buildBlueprint(): string {
  let text = readFileSync(absolute(paths.blueprint), 'utf8')
  text = transformExactText(text, '# J6 Mathematics Exam Blueprint v4', '# J6 Mathematics Exam Blueprint v5', 'blueprint version')
  text = transformExactText(
    text,
    'Status: Task 6 v3 remains promoted; two separate structural-split route-closing tasks were released after focused review on 2026-08-27',
    'Status: Task 6 v3 remains promoted; two separate structural-split route-closing tasks were released after focused review on 2026-08-27; Batch 012 routes Task 5 narrowly to the simple cuboid/cube-volume child',
    'blueprint status',
  )
  text = transformExactText(
    text,
    `${ids.retainedCluster} (Volumina von Quadern, Würfeln und daraus zusammengesetzten Körpern bestimmen)`,
    `${ids.simpleVolume} (Volumina von Quadern und Würfeln bestimmen)`,
    'Task 5 covered goal',
  )
  text = transformExactText(
    text,
    'Supplemental route-closing tasks: 16 BE; they are not part of the 36-BE main examination',
    'Supplemental route-closing tasks: 22 BE; they are not part of the 36-BE main examination',
    'supplemental assessment points',
  )
  const s2Row = '| S2 | `structural-split-route-follow-up-2026-08-27/j6/j6-cuboid-representation-switching/draft_v1.md` | 10 | Netz, Schrägbild und vorgeschriebene orthogonale Draufsicht desselben Quaders zeichnen und anhand derselben Fläche und Markierung verknüpfen. | f52e9d72-4995-5c80-91d2-7761ea0cbec0 (Netze von Quadern und Würfeln zeichnen)<br>6bb52f96-6320-5a34-afb0-db9b471dd4ac (Schrägbilder von Quadern und Würfeln zeichnen)<br>bce2c2cb-5594-5c19-8ae7-bd8c5e1ada82 (Eine orthogonale Ansicht eines Quaders oder Würfels zeichnen)<br>11c88ea2-8502-5008-bec2-3e491c75ace4 (Darstellungsformen gerader Körper verknüpfen) |'
  const s3Row = `| S3 | \`structural-split-route-follow-up-2026-08-28/j6/j6-composite-volume-additivity/draft_v1.md\` | 6 | Das Volumen eines zusammengesetzten Quaderkörpers durch Ergänzen und durch lücken- und überlappungsfreies Zerlegen bestimmen, die Übereinstimmung begründen und das Ergebnis prüfen. | ${ids.compositeVolume} (Volumina zusammengesetzter Quaderkörper additiv bestimmen) |`
  text = transformExactText(text, s2Row, `${s2Row}\n${s3Row}`, 'S3 blueprint row')
  const originalFinalNote = '- For both supplemental tasks, `requires` and `examData.coveredGoalIds` are byte-for-byte equal and contain only competencies actually assessed.'
  const currentFinalNote = '- For all three supplemental tasks, `requires` and `examData.coveredGoalIds` are byte-for-byte equal and contain only competencies actually assessed.\n- The Batch-012 volume-additivity follow-up is visible only in the directly source-supported Baden-Wuerttemberg, Bavaria, Hessen, Saarland and Saxony scopes.'
  const reviewedFinalNote = '- For all three supplemental tasks, `requires` and `examData.coveredGoalIds` are byte-for-byte equal and contain only competencies actually assessed.\n- The Batch-012 volume-additivity follow-up has direct source evidence in Baden-Wuerttemberg, Bavaria, Hessen, Saarland and Saxony. Its learner-facing visibility additionally follows its prerequisite in the 15 prerequisite-complete compiled scopes (all except Schleswig-Holstein) via `applicabilityFromRequires`; those derived placements are applicability evidence, not new source evidence.'
  if (!text.includes(reviewedFinalNote)) {
    const before = text.includes(currentFinalNote) ? currentFinalNote : originalFinalNote
    text = transformExactText(text, before, reviewedFinalNote, 'supplemental assessment design note')
  }
  return text
}

function transformFixtureMethod(text: string, methodName: string, transform: (section: string) => string): string {
  const start = text.indexOf(`void ${methodName}()`)
  if (start < 0) throw new Error(`Missing backend fixture method ${methodName}`)
  const next = text.indexOf('\n    @Test', start)
  const end = next < 0 ? text.length : next
  return `${text.slice(0, start)}${transform(text.slice(start, end))}${text.slice(end)}`
}

function buildBackendFixture(): string {
  let text = readFileSync(absolute(paths.backendFixture), 'utf8')
  const tuple = (source: string, target: string) => `Tuple.tuple("${source}", "${target}", "partial")`
  text = transformFixtureMethod(text, 'parsesRepositoryBackedCanonicalMathSek1MappingFixture', (section) => {
    let next = transformExactText(section, '.hasSize(40);', '.hasSize(41);', 'HE fixture count')
    next = transformExactText(next, tuple('209a6413-6598-47d6-b296-962207b2f5b1', ids.retainedCluster),
      `${tuple('209a6413-6598-47d6-b296-962207b2f5b1', ids.simpleVolume)},\n                        ${tuple('209a6413-6598-47d6-b296-962207b2f5b1', ids.compositeVolume)}`,
      'HE fixture tuples')
    return next
  })
  text = transformFixtureMethod(text, 'parsesRepositoryBackedCanonicalMathBadenWuerttembergSek1MappingFixture', (section) => {
    let next = transformExactText(section, '.hasSize(126);', '.hasSize(127);', 'BW fixture total')
    next = transformExactText(next, '.hasSize(86);', '.hasSize(87);', 'BW fixture partial count')
    next = transformExactText(next, tuple('8af615a2-df8b-4446-af06-b289ba97a111', ids.retainedCluster),
      `${tuple('8af615a2-df8b-4446-af06-b289ba97a111', ids.simpleVolume)},\n                        ${tuple('8af615a2-df8b-4446-af06-b289ba97a111', ids.compositeVolume)}`,
      'BW fixture tuples')
    return next
  })
  text = transformFixtureMethod(text, 'parsesRepositoryBackedCanonicalMathBavariaMappingFixture', (section) => {
    let next = transformExactText(section, '.hasSize(358);', '.hasSize(359);', 'BY fixture total')
    next = transformExactText(next, tuple('e22589c0-cc0d-5df1-8103-b02fc26be319', ids.retainedCluster),
      `${tuple('e22589c0-cc0d-5df1-8103-b02fc26be319', ids.simpleVolume)},\n                        ${tuple('e22589c0-cc0d-5df1-8103-b02fc26be319', ids.compositeVolume)}`,
      'BY fixture tuples')
    return next
  })
  return text
}

const visualizationReviewMarkdown = `# Goal Visualization Review - Mathematik Batch 213

Review date: 2026-08-28

Scope: Visual-QA-Bindung für die zwei neuen atomaren Kinder des fachlich
bestätigten Batch-012-Volumensplits. Das vorhandene Nano-Banana-Pro-JPG der
stabilen Eltern-ID bleibt unverändert als fachlich freigegebene Übersicht.

Status: \`deferred\`

## Entscheidung

| Goal ID | Lernziel | Entscheidung | Begründung |
| --- | --- | --- | --- |
| \`${ids.simpleVolume}\` | Volumina von Quadern und Würfeln bestimmen | \`deferred_provider_limitation\` | Im eng begrenzten Strukturschritt wurde kein neues Nano-Banana-Pro-Bild erzeugt. Das gute bestehende Übersichtsbild bleibt ausschließlich am stabilen Elterncluster; für das neue Atom wird kein eigenes Ersatzbild behauptet. |
| \`${ids.compositeVolume}\` | Volumina zusammengesetzter Quaderkörper additiv bestimmen | \`deferred_provider_limitation\` | Im eng begrenzten Strukturschritt wurde kein neues Nano-Banana-Pro-Bild erzeugt. Das bestehende Elternbild visualisiert den Gesamtscope bereits korrekt; ein spezifisches Kindbild bleibt bis zu einem späteren qualitätsgesicherten Nano-Banana-Pro-Lauf zurückgestellt. |

## Schutz des vorhandenen Bildes

- Die kanonische, öffentliche und Backend-Kopie der Elternübersicht
  \`${ids.retainedCluster}\` bleiben bytegleich.
- Gebundener SHA-256: \`${overviewAssetSha256}\`.
- Provider: Google Gemini / Nano Banana Pro; kein eigenes oder OpenAI-generiertes
  Ersatzbild wurde eingeführt.
`

type PlannedFile = { path: string; bytes: string }
const changedPlannedFiles = (files: PlannedFile[]): PlannedFile[] => files.filter(({ path, bytes }) => (
  !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes
))

function buildPositiveEvidence006bWithoutRetiredParent(): {
  config: JsonRecord
  candidates: JsonRecord
  review: JsonRecord[]
} {
  const config = readJson(paths.positiveEvidence006bConfig)
  const candidates = readJson(paths.positiveEvidence006bCandidates)
  const review = readJsonl(paths.positiveEvidence006bReview)
  const configGoalIds = config.scope?.goalIds as string[]
  const candidateGoals = candidates.goals as JsonRecord[]
  if (!Array.isArray(configGoalIds) || !Array.isArray(candidateGoals)) {
    throw new Error('Unexpected Batch-006b positive-evidence shape')
  }
  const occurrences = [
    configGoalIds.filter((goalId) => goalId === ids.retainedCluster).length,
    candidateGoals.filter((goal) => goal.goalId === ids.retainedCluster).length,
    review.filter((record) => record.goalId === ids.retainedCluster).length,
  ]
  if (occurrences.some((count) => count > 1) || new Set(occurrences).size !== 1) {
    throw new Error(`Inconsistent retired-parent evidence occurrences: ${occurrences.join('/')}`)
  }
  config.scope.goalIds = configGoalIds.filter((goalId) => goalId !== ids.retainedCluster)
  candidates.goals = candidateGoals.filter((goal) => goal.goalId !== ids.retainedCluster)
  const filteredReview = review.filter((record) => record.goalId !== ids.retainedCluster)
  const expectedIds = config.scope.goalIds as string[]
  for (const [label, actualIds] of [
    ['candidates', (candidates.goals as JsonRecord[]).map((goal) => goal.goalId)],
    ['review', filteredReview.map((record) => record.goalId)],
  ] as const) {
    if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
      throw new Error(`Batch-006b ${label} goal order differs from configured scope`)
    }
  }
  return { config, candidates, review: filteredReview }
}

function filesBelow(path: string): string[] {
  const root = absolute(path)
  if (!existsSync(root)) return []
  const walk = (directory: string): string[] => readdirSync(directory).flatMap((name) => {
    const candidate = join(directory, name)
    return statSync(candidate).isDirectory() ? walk(candidate) : [relative(repoRoot, candidate)]
  })
  return walk(root).sort()
}

const runPositiveEvidenceMaterializer = (config: string, candidates: string, write: boolean): void => {
  execFileSync('npm', [
    'exec', '--', 'tsx', 'scripts/materializePositiveGoalEvidenceCandidates.ts',
    '--config', config, '--candidates', candidates, ...(write ? ['--write'] : []),
  ], { cwd: resolve(repoRoot, 'app'), stdio: 'inherit' })
}

const runDescriptionContextRebind = (write: boolean): void => {
  execFileSync('npm', [
    'exec', '--', 'tsx', 'scripts/rebindMathKnownReviewContextStales.ts',
    '--config', paths.descriptionRebindConfig, ...(write ? ['--write'] : []),
  ], { cwd: resolve(repoRoot, 'app'), stdio: 'inherit' })
}

function assertFinalViews(): void {
  for (const fileName of ['de-by-gk.view.json', 'de-by-lk.view.json', ...generatedViewNames]) {
    const view = JSON.parse(readFileSync(join(compositionRoot, fileName), 'utf8'))
    const simpleCount = countGoalReferences(view, ids.simpleVolume)
    const compositeCount = countGoalReferences(view, ids.compositeVolume)
    if (countGoalReferences(view, ids.retainedCluster) !== 0) throw new Error(`Stale cluster target in ${fileName}`)
    const expectsComposite = fileName.startsWith('de-by-') || fileName.startsWith('de-he-')
    if (simpleCount !== 1 || compositeCount !== (expectsComposite ? 1 : 0)) {
      throw new Error(`Unexpected Batch-012 projection in ${fileName}: simple=${simpleCount} composite=${compositeCount}`)
    }
  }
}

function assertVisualizationQa(): void {
  const qa = readJson(paths.visualizationQa)
  const records = qa.records as JsonRecord[]
  const parent = records.find((record) => record.goalId === ids.retainedCluster)
  if (!parent || parent.visualizationState !== 'available' || parent.assetSha256 !== `sha256:${overviewAssetSha256}`
    || parent.aiApprovedAssetSha256 !== `sha256:${overviewAssetSha256}`) {
    throw new Error('Protected parent visualization QA binding drift')
  }
  for (const childId of childIds) {
    const record = records.find((candidate) => candidate.goalId === childId)
    if (!record || record.visualizationState !== 'missing'
      || record.missingReason !== 'deferred_provider_limitation' || record.imageUrl !== '') {
      throw new Error(`Split child ${childId} lacks the exact deferred visual-QA binding`)
    }
  }
}

const binding = (path: string): JsonRecord => {
  const bytes = readFileSync(absolute(path))
  return { path, bytes: bytes.length, sha256: sha256Digest(bytes) }
}

function buildReceipt(adjudication: JsonRecord, boundPaths: string[]): JsonRecord {
  const payload: JsonRecord = {
    schemaVersion: 1,
    receiptId: 'canonical-math-99ef-volume-structural-split-2026-08-28-v3',
    appliedAt: reviewDate,
    status: 'applied-locally-not-committed',
    scope: {
      subject: 'Mathematik',
      layer: 'Layer A curriculum data and its direct QA bindings only',
      retainedClusterId: ids.retainedCluster,
      newAtomicGoalIds: childIds,
      centralDeepRolloutConfigChanged: true,
      publicGoalBooksChanged: true,
      physicsChanged: false,
    },
    invariants: {
      retainedScopeTextUnchanged: true,
      retainedNanoBananaOverviewSha256: `sha256:${overviewAssetSha256}`,
      child2RequiresChild1: true,
      childVisualizations: 'deferred_provider_limitation',
      thuringiaUnsupportedVolumeEdgesRemoved: 3,
      applicabilityCompilerReconciled: true,
      simpleAndCompositeJurisdictions: [...allCompiledJurisdictions],
      assessmentJurisdictions: [...assessmentCompiledJurisdictions],
      retiredParentPositiveEvidenceScopeRemoved: true,
      retainedPositiveEvidenceProfilesChanged: false,
      descriptionReviewDecisionAndTextChanged: false,
      descriptionContextBindingsRebound: true,
    },
    counts: {
      oldAtomicGoals: 1,
      retainedClusters: 1,
      newAtomicGoals: 2,
      curricularAtomicDelta: 1,
      historicalPhysicalMappingEdgesReconsidered: 40,
      affectedMappingDocuments: mappingPaths.length,
      affectedCompositionViews: 20,
      assessmentReferencesRewired: 2,
      newRouteClosingAssessments: 1,
    },
    sourceAdjudication: binding(paths.adjudication),
    sourceAdjudicationDigest: adjudication.adjudicationDigest,
    applyScript: binding(paths.applyScript),
    beforeState: {
      canonicalSha256: `sha256:${expectedBeforeHashes[paths.canonical]}`,
      mappingCorpusSha256: `sha256:${expectedBeforeMappingCorpusSha256}`,
    },
    afterBindings: unique(boundPaths).sort().map(binding),
    openBoundaries: [
      'The existing J6 Task 5 directly assesses only the simple cuboid/cube-volume child and is therefore not falsely bound to the composite-volume child; a separate six-point S3 task closes the composite route.',
      'The stable parent is now a curricular-area cluster and was therefore removed from the older curricular-atomic positive-understanding evidence scope; its two new atomic children remain covered by Batch 012.',
    ],
  }
  return { ...payload, receiptDigest: sha256Digest(JSON.stringify(payload)) }
}

function assertReceipt(adjudication: JsonRecord, boundPaths: string[]): void {
  if (!existsSync(absolute(paths.receipt))) throw new Error('Batch-012 application receipt is missing')
  const actual = readJson(paths.receipt)
  const payload = structuredClone(actual)
  delete payload.receiptDigest
  if (actual.receiptDigest !== sha256Digest(JSON.stringify(payload))) {
    throw new Error('Batch-012 application receipt self-digest drift')
  }
  const expected = buildReceipt(adjudication, boundPaths)
  if (!same(actual, expected)) throw new Error('Batch-012 application receipt bindings are stale')
}

for (const spec of childSpecs) {
  if (deterministicGoalId(spec.shortKey) !== spec.id) throw new Error(`Deterministic ID mismatch for ${spec.shortKey}`)
}
if (deterministicGoalId(assessmentShortKey) !== ids.compositeAssessment) {
  throw new Error(`Deterministic ID mismatch for ${assessmentShortKey}`)
}
assertOverviewAsset()
assertBeforeHashesIfNeeded()
const canonical = buildCanonical()
const mappingResult = buildMappingDocuments()
assertFinalMappingDocuments(mappingResult.documents)
const adjudication = buildAdjudication(mappingResult.routeBindings)
const provenance = buildProvenance(mappingResult.documents)
const surrogate = buildSurrogate()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildReviewLedger(canonical, 'atomicity')
const memory = buildReviewLedger(canonical, 'memory')
const atlasSources = buildAtlasSources()
const manualViews = buildManualViews()
const durationPolicy = buildDurationPolicy(canonical, adjudication)
const blueprint = buildBlueprint()
const backendFixture = buildBackendFixture()
const positiveEvidence006b = buildPositiveEvidence006bWithoutRetiredParent()

const plannedFiles: PlannedFile[] = [
  { path: paths.canonical, bytes: serializeJson(canonical) },
  ...[...mappingResult.documents].map(([path, document]) => ({ path, bytes: serializeJson(document) })),
  { path: paths.provenance, bytes: serializeJson(provenance) },
  { path: paths.surrogate, bytes: serializeJson(surrogate) },
  { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
  { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
  { path: paths.memory, bytes: serializeJsonl(memory) },
  { path: paths.atlasSources, bytes: serializeJson(atlasSources) },
  ...[...manualViews].map(([path, view]) => ({ path, bytes: serializeJson(view) })),
  { path: paths.durationPolicy, bytes: serializeJson(durationPolicy) },
  { path: paths.blueprint, bytes: blueprint },
  { path: paths.backendFixture, bytes: backendFixture },
  { path: paths.assessmentDraft, bytes: assessmentDraftMarkdown },
  { path: paths.assessmentSolution, bytes: assessmentSolutionMarkdown },
  { path: paths.assessmentReview, bytes: assessmentReviewMarkdown },
  { path: paths.visualizationReview, bytes: visualizationReviewMarkdown },
  { path: paths.adjudication, bytes: serializeJson(adjudication) },
  { path: paths.positiveEvidence006bConfig, bytes: serializeJson(positiveEvidence006b.config) },
  { path: paths.positiveEvidence006bCandidates, bytes: serializeJson(positiveEvidence006b.candidates) },
  { path: paths.positiveEvidence006bReview, bytes: serializeJsonl(positiveEvidence006b.review) },
]
const afterPlannedCorpusSha256 = sha256(JSON.stringify(plannedFiles.map(({ path, bytes }) => ({
  path,
  sha256: sha256(bytes),
}))))
if (
  expectedAfterPlannedCorpusSha256 !== 'PENDING'
  && afterPlannedCorpusSha256 !== expectedAfterPlannedCorpusSha256
) {
  throw new Error(
    `Batch-012 after planned-corpus mismatch: ${afterPlannedCorpusSha256} != ${expectedAfterPlannedCorpusSha256}`,
  )
}
const outputPaths = [
  ...plannedFiles.map(({ path }) => path),
  ...generatedViewNames.map((fileName) => relative(repoRoot, join(compositionRoot, fileName))),
  paths.visualizationQa, paths.visualizationStatusJson, paths.visualizationStatusMarkdown,
  paths.rationalePublic, paths.rationaleAll, paths.rationaleCoverageJson, paths.rationaleCoverageMarkdown,
  paths.rationaleGapIssues, paths.memoryReport,
  paths.positiveEvidence004Config, paths.positiveEvidence004Candidates, paths.positiveEvidence004Review,
  paths.reviewContextRebindScript, paths.descriptionRebindConfig, ...filesBelow(paths.descriptionRebindOutput),
  paths.descriptionBatch012Config, ...filesBelow(paths.descriptionBatch012Output),
  paths.positiveEvidence012Config, paths.positiveEvidence012Candidates,
  paths.positiveEvidence012Review, paths.deepRolloutConfig,
  paths.publicBookModel, paths.publicBookPdf, paths.publicBookRenderManifest,
]
const changed = changedPlannedFiles(plannedFiles)

if (writeMode) {
  if (expectedAfterPlannedCorpusSha256 === 'PENDING') {
    throw new Error('Refusing --write while the Batch-012 after planned-corpus hash is unbound')
  }
  for (const { path, bytes } of changed) {
    mkdirSync(dirname(absolute(path)), { recursive: true })
    writeFileSync(absolute(path), bytes)
  }
  execFileSync('npm', ['--prefix', 'app', 'run', 'generate:math-duration-composition-views'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['exec', '--', 'tsx', 'scripts/generateGoalVisualizationQaLedgers.ts', '--subject=mathematik'], {
    cwd: resolve(repoRoot, 'app'), stdio: 'inherit',
  })
  execFileSync('npm', ['--prefix', 'app', 'run', 'quality:goal-visualization-rollout-status'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'quality:goal-source-rationales:math-public'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'quality:goal-source-rationales:math-all-relevant'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'quality:goal-source-rationale-coverage'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'quality:goal-source-rationale-gap-issues'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'quality:memory-card-review:report'], { cwd: repoRoot, stdio: 'inherit' })
  runPositiveEvidenceMaterializer(paths.positiveEvidence006bConfig, paths.positiveEvidence006bCandidates, true)
  runPositiveEvidenceMaterializer(paths.positiveEvidence004Config, paths.positiveEvidence004Candidates, true)
  runDescriptionContextRebind(true)
  assertOverviewAsset()
  assertFinalViews()
  assertVisualizationQa()
  writeFileSync(absolute(paths.receipt), serializeJson(buildReceipt(adjudication, outputPaths)))
} else if (changed.length === 0) {
  runPositiveEvidenceMaterializer(paths.positiveEvidence006bConfig, paths.positiveEvidence006bCandidates, false)
  runPositiveEvidenceMaterializer(paths.positiveEvidence004Config, paths.positiveEvidence004Candidates, false)
  runDescriptionContextRebind(false)
  execFileSync('npm', ['--prefix', 'app', 'run', 'check:math-duration-composition-views'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['exec', '--', 'tsx', 'scripts/generateGoalVisualizationQaLedgers.ts', '--check', '--subject=mathematik'], {
    cwd: resolve(repoRoot, 'app'), stdio: 'inherit',
  })
  execFileSync('npm', ['--prefix', 'app', 'run', 'check:goal-visualization-rollout-status'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'check:goal-source-rationales:math-public'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'check:goal-source-rationales:math-all-relevant'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'check:goal-source-rationale-coverage'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'check:goal-source-rationale-gap-issues'], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('npm', ['--prefix', 'app', 'run', 'quality:memory-card-review:check'], { cwd: repoRoot, stdio: 'inherit' })
  assertFinalViews()
  assertVisualizationQa()
  assertReceipt(adjudication, outputPaths)
}

console.log(
  `CHECK apply_math_batch012_volume_structural_split ${writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'} `
  + `retained=1 newAtoms=2 oldMappingEdges=${mappingResult.beforeCount} views=20 `
  + `plannedWrites=${changed.length} files=${changed.map(({ path }) => basename(path)).join(',') || '-'}`,
)
console.log(`AFTER_PLANNED_CORPUS ${afterPlannedCorpusSha256}`)
