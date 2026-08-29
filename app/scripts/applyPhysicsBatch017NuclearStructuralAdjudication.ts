import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, any>
type MatchType = 'exact' | 'partial'
type RouteTarget = { targetGoalId: string; matchType: MatchType }

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewDate = '2026-08-28'
const reviewer = 'codex-physics-batch-017-nuclear-structural-adjudication'
const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'

const ids = {
  subjectRoot: 'bf980fff-b62b-4ea4-a20d-31681a7ad785',
  nuclearCluster: '8917c71a-bfcb-4003-971c-188a69446b60',
  atomModel: '2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb',
  nuclideNotation: 'f74c691b-0b76-54e0-8fd6-a22211994e0a',
  detectionCluster: 'f6f646db-3544-49ed-8f55-67bc684e80ce',
  detection: '25d91cc0-d84c-5522-86b5-fdff73264f08',
  biologicalEffects: '861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd',
  application: '979e0d0d-8933-4ace-814f-f28060ad280f',
  decayCluster: 'cb0426b0-a973-5660-b6fe-79407934730f',
  radiationTypes: '1593d95c-2aac-504c-8527-37cb61877da9',
  halfLife: '16b94a12-ecc5-5b5c-85b6-87b4290bebf8',
  fissionFusion: '50877233-7abf-54df-b347-6d3224678fc9',
  upperRadiation: 'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
  decayLaws: 'a12fddce-0215-58d9-bd91-21be8a960d25',
  upperFissionFusion: '49872cc0-401f-5464-9235-4763df4db5cf',
  massEnergyRelease: '7d78da7f-6af5-440a-9d6b-6cab4bee8dd2',
  doseProtection: 'e6a50c74-c922-508c-aa27-07bac2566955',
  compatibilityCapstone: '3631c8f7-ff48-57ff-b7ee-8397ff1d166a',
  practiceCluster: '21ab0854-4d67-5233-9495-ae208e152a3c',
  radiationEvidenceAssessment: '6c9d0ef3-c82f-534f-8024-6b0efcb88276',
  nuclideNotationAssessment: 'bbe9a270-9b17-519f-8cd7-92c816ac4e29',
  decaySeries: '3b50255a-6b01-578b-8f5c-4383536a3221',
  nuclideCharts: '64b30d2e-cbe1-55d8-915a-a050d736b96e',
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  experimentPlanning: 'd3c153b9-e09b-5668-8386-73105546a7c1',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
  sekIMechanics: '9645f0d8-43a3-5f29-873c-daa5ace638db',
  sekILight: '051cedc5-d380-4716-9751-b18f2e67a912',
  acceleratedMotion: 'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  freeFall: '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  soundPressureRisks: '8ac61062-f63e-5935-96ae-84014906c368',
  particleTemperature: '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
  upperMassEnergy: 'bfea7a23-1ce1-4a42-badd-1fc9bf30124a',
  electricalEnergy: 'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  simpleMachines: '327302e3-5b36-46f8-9c16-73f24583b0eb',
  magnetism: 'f778a659-1467-4aa7-97b2-bed78c530634',
  friction: '581c0766-b84b-54cb-b8b6-375310329a41',
  lightRayModel: '79cb1695-f985-443a-b93e-27b57ab474b7',
  motionSt: 'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
  gravity: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  gravitationalField: '156edddc-ce8d-580d-8d17-d9376d59e60e',
  astronomy: '2b700858-bc2e-5ddf-a791-b14d44160480',
  documentation: 'ad62f563-4fee-5399-8d9c-03a214658aa9',
  digitalTools: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  heat: '2d3d42ae-492b-4795-a22f-eeca03aaed38',
  electricCircuits: 'bbabac7c-9613-4c7e-877e-d7dc3df5300f',
  magneticCircuits: '4924d83e-5e4b-4819-9d70-86cda3496195',
} as const

const splitParents = new Set<string>([ids.detectionCluster, ids.decayCluster])
const childIds = [ids.nuclideNotation, ids.detection, ids.biologicalEffects, ids.radiationTypes, ids.halfLife]
const protectedVisualizationAssetHashes: Record<string, string> = {
  [ids.atomModel]: 'ed59090dc78fb8fcda681c316d579585c2e53344d90cee6a7129dd4f62da8ddb',
  [ids.detectionCluster]: '064d43fd95c417ea90eeb65c7e7f88c7f33f84df7cb971de969448edac9497e9',
  [ids.application]: 'd1dc9b4e7296b82cf4972601bc7e6b9bbd86845d37f74731d925a943b980b6c7',
  [ids.decayCluster]: '0bb442dc0042afc63bccf366d32db1ecf2c190817ad415ec94cc74a2c8a786b8',
}
const allJurisdictions = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
]
const nuclideNotationJurisdictions = ['DE-BW', 'DE-MV', 'DE-ST', 'DE-TH']
const massEnergyReleaseJurisdictions = ['DE-BY', 'DE-MV', 'DE-ST']

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  atlas: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  surrogate: 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  visualizationReview: 'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-batch-079.md',
  physicsInputTest: 'app/scripts/testPhysicsGoalBookInputs.ts',
  bwReview: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  byReview: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  heReview: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  heLegacy: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_to_canonical_physics.json',
  hhReview: 'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  mvReview: 'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  slReview: 'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  snReview: 'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  stReview: 'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  thReview: 'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  thExtraction: 'curricula/DE/Gymnasium/input/TH/lower-secondary/source-extraction/DE_TH_PHYSIK_SEKI_LEHRPLAN_GYMNASIUM_2012.source-extraction.json',
  thReadme: 'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/PHYSIK.md',
  compositionViews: 'curricula/DE/Gymnasium/composition-views/physik',
} as const

const mappingPaths = [
  paths.bwReview, paths.byReview, paths.heReview, paths.heLegacy, paths.hhReview,
  paths.mvReview, paths.slReview, paths.snReview, paths.stReview, paths.thReview,
]
const structuralViewPaths = ['de-bw-gk', 'de-bw-lk', 'de-by-gk', 'de-by-lk']
  .map((name) => `${paths.compositionViews}/${name}.view.json`)
const assessmentViewPaths = readdirSync(resolve(repoRoot, paths.compositionViews))
  .filter((name) => name.endsWith('.view.json'))
  .map((name) => `${paths.compositionViews}/${name}`)
  .filter((path) => {
    const view = JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord
    return view.landscapeId === physicsLandscapeId
      && ['SekI', 'CrossStage'].includes(String(view.scope?.stage))
  })
  .sort()
const allPhysicsViewPaths = readdirSync(resolve(repoRoot, paths.compositionViews))
  .filter((name) => name.endsWith('.view.json'))
  .map((name) => `${paths.compositionViews}/${name}`)
  .filter((path) => {
    const view = JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord
    return view.landscapeId === physicsLandscapeId
  })
  .sort()
const viewPaths = [...new Set([...structuralViewPaths, ...allPhysicsViewPaths])].sort()
const generatorPathsByReview = new Map<string, string>([
  [paths.bwReview, 'app/scripts/generateBwPhysicsSourceExtraction.ts'],
  [paths.byReview, 'app/scripts/generateByPhysicsSourceExtraction.ts'],
  [paths.heReview, 'app/scripts/generateHePhysicsSourceExtraction.ts'],
  [paths.hhReview, 'app/scripts/generateHhPhysicsLowerSecondarySourceExtraction.ts'],
  [paths.mvReview, 'app/scripts/generateMvPhysicsSourceExtraction.ts'],
  [paths.slReview, 'app/scripts/generateSlPhysicsSourceExtraction.ts'],
  [paths.snReview, 'app/scripts/generateSnPhysicsSourceExtraction.ts'],
  [paths.stReview, 'app/scripts/generateStPhysicsSourceExtraction.ts'],
  [paths.thReview, 'app/scripts/generateThPhysicsSourceExtraction.ts'],
])
const generatorPaths = [...generatorPathsByReview.values()]

const childSpecs = [
  {
    id: ids.nuclideNotation,
    parentId: ids.nuclearCluster,
    shortKey: 'canonical_physics_sek1_interpret_nuclide_notation_and_isotopes',
    title: 'Nuklidschreibweise deuten und Isotope unterscheiden',
    titleEn: 'Interpret nuclide notation and distinguish isotopes',
    description: 'Die lernende Person kann aus der Nuklidschreibweise mit Massenzahl A und Protonenzahl Z die Protonen- und Neutronenzahl eines Atomkerns bestimmen und Isotope als Kerne desselben Elements mit gleicher Protonen-, aber unterschiedlicher Neutronenzahl begründet unterscheiden.',
    descriptionEn: 'The learner can use nuclide notation with mass number A and proton number Z to determine an atomic nucleus’s proton and neutron numbers and give a reasoned distinction of isotopes as nuclei of the same element with the same proton number but different neutron numbers.',
    requires: [ids.atomModel],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
    competencyRefs: ['PROCESS.PK2', 'PROCESS.PK3'],
    guidingIdeas: ['LI_MATERIE'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.NUCLEAR.NUCLIDE_NOTATION_ISOTOPES',
    applicabilityJurisdictions: nuclideNotationJurisdictions,
    atomicityReason: 'Nuklidschreibweise, Protonen- und Neutronenzahl sowie die Isotopenbeziehung bilden ein einziges zusammenhängendes Deutungs- und Klassifikationsschema, das an neuen Nuklidsymbolen gemeinsam geprüft wird.',
    memoryReason: 'Das Ziel verlangt das begründete Deuten und Vergleichen neuer Nuklidsymbole; bloßes Erinnern einzelner Definitionen oder Symbolpositionen genügt dafür nicht.',
  },
  {
    id: ids.detection,
    parentId: ids.detectionCluster,
    shortKey: 'canonical_physics_sek1_detect_ionising_radiation_with_detectors',
    title: 'Ionisierende Strahlung mit geeigneten Detektoren nachweisen',
    titleEn: 'Detect ionising radiation with suitable detectors',
    description: 'Die lernende Person kann das Nachweisprinzip eines geeigneten Detektors erklären, das beobachtete Signal von der daraus erschlossenen ionisierenden Strahlung unterscheiden und den Nachweis mit einer Hintergrund- oder Kontrollmessung absichern.',
    descriptionEn: 'The learner can explain the detection principle of a suitable detector, distinguish the observed signal from the ionising radiation inferred from it, and corroborate the detection with a background or control measurement.',
    requires: [ids.atomModel],
    demandLevel: 'AB2',
    processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN'],
    competencyRefs: ['PROCESS.PK1', 'PROCESS.PK2'],
    guidingIdeas: ['LI_MATERIE', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.NUCLEAR.RADIATION.DETECTION',
    applicabilityJurisdictions: allJurisdictions,
    atomicityReason: 'Detektorprinzip, beobachtetes Signal, physikalische Schlussfolgerung und Hintergrund- oder Kontrollmessung sind aufeinander bezogene Phasen eines einzigen, experimentell prüfbaren Strahlungsnachweises.',
    memoryReason: 'Ein sicherer Nachweis verlangt die Deutung eines Detektorsignals und die Kontrolle gegen Hintergrund oder Vergleich; eine isolierte Merkkarte ersetzt diese experimentelle Schlussleistung nicht.',
  },
  {
    id: ids.biologicalEffects,
    parentId: ids.detectionCluster,
    shortKey: 'canonical_physics_sek1_classify_biological_effects_ionising_radiation',
    title: 'Biologische Wirkungen ionisierender Strahlung einordnen',
    titleEn: 'Classify biological effects of ionising radiation',
    description: 'Die lernende Person kann die mögliche Schädigung biologischen Gewebes durch ionisierende Strahlung über Ionisation erklären und bei äußerer Exposition grundlegende Schutzmaßnahmen anhand von Expositionszeit, Abstand und Abschirmung begründen.',
    descriptionEn: 'The learner can explain possible damage to biological tissue by ionising radiation through ionisation and, for external exposure, justify basic protective measures in terms of exposure time, distance, and shielding.',
    requires: [ids.atomModel],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK5_BEWERTEN'],
    competencyRefs: ['PROCESS.PK2', 'PROCESS.PK5'],
    guidingIdeas: ['LI_MATERIE', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.NUCLEAR.RADIATION.BIOLOGICAL_EFFECTS',
    applicabilityJurisdictions: allJurisdictions,
    atomicityReason: 'Gewebeschädigung durch Ionisation und die daraus für äußere Exposition begründeten Schutzprinzipien bilden eine zusammenhängende Ursache-Schutz-Kompetenz, die an wechselnden äußeren Expositionssituationen geprüft werden kann.',
    memoryReason: 'Das Ziel verlangt eine kausale Begründung und den Transfer der Schutzprinzipien auf konkrete äußere Expositionssituationen; bloßes Erinnern einer Regelliste ist nicht hinreichend.',
  },
  {
    id: ids.radiationTypes,
    parentId: ids.decayCluster,
    shortKey: 'canonical_physics_sek1_distinguish_alpha_beta_gamma_radiation',
    title: 'Alpha-, Beta- und Gammastrahlung unterscheiden',
    titleEn: 'Distinguish alpha, beta, and gamma radiation',
    description: 'Die lernende Person kann Alpha-, Beta- und Gammastrahlung anhand der jeweiligen Kernänderung beziehungsweise Kernabregung, der emittierten Teilchen oder Photonen sowie ihres unter vergleichbaren Bedingungen in Materie typischen Ionisations- und Durchdringungsvermögens qualitativ unterscheiden.',
    descriptionEn: 'The learner can qualitatively distinguish alpha, beta, and gamma radiation by the respective nuclear change or nuclear de-excitation, the emitted particles or photons, and their typical ionising and penetrating power in matter under comparable conditions.',
    requires: [ids.atomModel],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    competencyRefs: ['PROCESS.PK2', 'PROCESS.PK4'],
    guidingIdeas: ['LI_MATERIE', 'LI_ENERGIE'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.NUCLEAR.DECAY_RADIATION.TYPES',
    applicabilityJurisdictions: allJurisdictions,
    atomicityReason: 'Die drei Strahlungsarten werden entlang desselben konsistenten Merkmalsrasters aus Kernprozess, Emissionsobjekt, Ionisation und Durchdringung klassifiziert; dies ist eine einzelne vergleichende Systematikkompetenz.',
    memoryReason: 'Das Ziel verlangt die begründete Klassifikation unbekannter Darstellungen oder Beobachtungen; eine reine Zuordnungstabelle als Memorycard würde die physikalische Begründung nicht ersetzen.',
  },
  {
    id: ids.halfLife,
    parentId: ids.decayCluster,
    shortKey: 'canonical_physics_sek1_interpret_radioactive_half_life',
    title: 'Halbwertszeit radioaktiver Stoffe deuten',
    titleEn: 'Interpret the half-life of radioactive substances',
    description: 'Die lernende Person kann die Halbwertszeit als statistische Halbierung der Zahl noch nicht zerfallener Kerne in einem großen Ensemble deuten und erklären, warum der Zerfallszeitpunkt eines einzelnen Kerns nicht vorhergesagt werden kann.',
    descriptionEn: 'The learner can interpret half-life as the statistical halving of the number of undecayed nuclei in a large ensemble and explain why the decay time of an individual nucleus cannot be predicted.',
    requires: [ids.radiationTypes],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN'],
    competencyRefs: ['PROCESS.PK2', 'PROCESS.PK3'],
    guidingIdeas: ['LI_MATERIE'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.NUCLEAR.DECAY_RADIATION.HALF_LIFE',
    applicabilityJurisdictions: allJurisdictions,
    atomicityReason: 'Ensemble-Halbierung und Unvorhersagbarkeit des Einzelzerfalls sind zwei komplementäre Aussagen desselben statistischen Halbwertszeitbegriffs und gemeinsam an einer Zerfallsdarstellung prüfbar.',
    memoryReason: 'Das Ziel verlangt die statistische Deutung zwischen Ensemble und Einzelkern; das bloße Erinnern einer Halbwertszeitdefinition genügt dafür nicht.',
  },
] as const

const nuclideNotationAssessmentSpec = {
  id: ids.nuclideNotationAssessment,
  shortKey: 'canonical_physics_sek1_assessment_nuclide_notation_isotopes',
  title: 'Prüfungsaufgabe: Nuklidschreibweise und Isotope begründen',
  titleEn: 'Assessment Task: Explain Nuclide Notation and Isotopes',
  description: 'Die lernende Person kann Nuklidsymbole deuten, Protonen- und Neutronenzahlen bestimmen und Isotopenbeziehungen anhand gleicher Protonen- und unterschiedlicher Neutronenzahlen begründen.',
  descriptionEn: 'The learner can interpret nuclide symbols, determine proton and neutron numbers, and explain isotope relationships using equal proton numbers and different neutron numbers.',
  requires: [ids.nuclideNotation],
  processCompetencies: ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
  guidingIdeas: ['LI_MATERIE'],
  area: 'Atom- und Kernphysik',
  topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.NUCLIDE_NOTATION_ISOTOPES',
  taskContent: '**Material:** Gegeben sind die Nuklidsymbole ²³₁₁Na, ²⁴₁₁Na und ²⁴₁₂Mg. Dabei steht die untere Zahl für die Protonenzahl und die obere Zahl für die Summe aus Protonen und Neutronen.\n\n1. Bestimmen Sie für jeden der drei Kerne die Protonen- und Neutronenzahl. (3 BE)\n2. Begründen Sie, welche beiden Kerne Isotope desselben Elements sind. Verwenden Sie dabei Protonen- und Neutronenzahl. (3 BE)\n3. Erklären Sie, warum ²⁴₁₂Mg trotz gleicher oberer Zahl wie ²⁴₁₁Na kein Isotop von Natrium ist. (2 BE)',
  solutionContent: '²³₁₁Na besitzt 11 Protonen und 12 Neutronen, ²⁴₁₁Na besitzt 11 Protonen und 13 Neutronen, ²⁴₁₂Mg besitzt 12 Protonen und 12 Neutronen. ²³₁₁Na und ²⁴₁₁Na sind Isotope desselben Elements, weil beide Kerne die Protonenzahl 11, aber unterschiedliche Neutronenzahlen besitzen. ²⁴₁₂Mg ist kein Natrium-Isotop: Die gleiche Massenzahl 24 reicht nicht aus, denn mit 12 statt 11 Protonen gehört der Kern zu einem anderen Element.',
  scoring: {
    maxPoints: 8,
    passingPoints: 5,
    steps: [
      { id: 'nuclide_notation_1', points: 3, description: 'Protonen- und Neutronenzahlen aller drei Nuklide korrekt bestimmen.' },
      { id: 'nuclide_notation_2', points: 3, description: 'Das Natrium-Isotopenpaar anhand gleicher Protonen- und unterschiedlicher Neutronenzahl begründen.' },
      { id: 'nuclide_notation_3', points: 2, description: 'Magnesium trotz gleicher Massenzahl über die andere Protonenzahl fachlich abgrenzen.' },
    ],
  },
} as const

const radiationEvidenceAssessmentSpec = {
  id: ids.radiationEvidenceAssessment,
  shortKey: 'canonical_physics_sek1_assessment_radiation_detection_types_half_life',
  title: 'Prüfungsaufgabe: Strahlungsnachweis und Halbwertszeit untersuchen',
  titleEn: 'Assessment Task: Investigate Radiation Detection and Half-Life',
  description: 'Die lernende Person kann kontrollierte Detektormessungen fachlich deuten, Alpha-, Beta- und Gammastrahlung anhand von Abschirmdaten und Kernmodellen unterscheiden sowie die Halbwertszeit als statistische Ensemblegröße aus Messdaten bestimmen und erklären.',
  descriptionEn: 'The learner can interpret controlled detector measurements, distinguish alpha, beta, and gamma radiation using shielding data and nuclear models, and determine and explain half-life as a statistical ensemble quantity from measurement data.',
  requires: [ids.detection, ids.radiationTypes, ids.halfLife],
  processCompetencies: ['PK1_EXPERIMENTIEREN', 'PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
  guidingIdeas: ['LI_MATERIE', 'LI_ENERGIE', 'LI_TECHNIK'],
  area: 'Radioaktivität',
  topicCode: 'CANONICAL.PHYSICS.SEK1.PRACTICE.RADIATION.DETECTION_TYPES_HALF_LIFE',
  taskContent: '**Material:** Eine Lerngruppe untersucht drei gekapselte Schulquellen A, B und C mit einem Geiger-Müller-Zählrohr. Jede Messung dauert 60 s. Drei Kontrollmessungen ohne Quelle ergeben 18, 20 und 22 Impulse. Mit Quelle werden folgende Impulszahlen gemessen:\n\n| Quelle | ohne Abschirmung | Papier | 2 mm Aluminium | 5 cm Blei |\n|---|---:|---:|---:|---:|\n| A | 615 | 24 | 21 | 20 |\n| B | 528 | 510 | 25 | 21 |\n| C | 210 | 207 | 198 | 54 |\n\nModellkarten ergänzen die Messreihe: Bei Alpha-Zerfall wird ein Heliumkern emittiert und Massenzahl sowie Kernladungszahl nehmen um 4 beziehungsweise 2 ab. Bei Beta-minus-Zerfall wird im Kern ein Neutron in ein Proton umgewandelt und ein Elektron emittiert. Bei Gamma-Zerfall gibt ein angeregter Kern ein Photon ab, ohne Massenzahl oder Kernladungszahl zu ändern.\n\nFür Quelle B wird anschließend die bereits um den mittleren Untergrund korrigierte Impulsrate gemessen: 480, 242, 119, 61 und 31 Impulse pro Minute nach 0, 3, 6, 9 und 12 Minuten. Einzelne Impulse treten dabei unregelmäßig auf.\n\n1. Erklären Sie das Nachweisprinzip des Geiger-Müller-Zählrohrs: Trennen Sie beobachtetes Signal und daraus erschlossene ionisierende Strahlung. Bestimmen Sie den mittleren Untergrund und begründen Sie, warum Kontroll- und Wiederholungsmessungen für einen belastbaren Nachweis nötig sind. (6 BE)\n2. Ordnen Sie A, B und C begründet Alpha-, Beta-minus- beziehungsweise Gammastrahlung zu. Verknüpfen Sie das jeweilige Abschirmverhalten mit emittiertem Teilchen oder Photon, Kernänderung sowie qualitativem Ionisations- und Durchdringungsvermögen. (7 BE)\n3. Bestimmen Sie aus der korrigierten Messreihe die Halbwertszeit von Quelle B und prognostizieren Sie die korrigierte Impulsrate nach 15 Minuten. Erklären Sie, warum die Messreihe eine verlässliche Aussage für ein großes Ensemble erlaubt, aber nicht den Zerfallszeitpunkt eines einzelnen Kerns vorhersagt. (5 BE)',
  solutionContent: 'Im Geiger-Müller-Zählrohr ionisiert eintretende Strahlung das Füllgas; die dadurch ausgelöste Ladungslawine erzeugt einen elektrischen Impuls. Beobachtet werden Impulse, nicht die Strahlung selbst. Der mittlere Untergrund beträgt 20 Impulse pro 60 s. Erst der Vergleich mit diesem schwankenden Untergrund, passende Kontrollen und Wiederholungen tragen die Schlussfolgerung, dass eine Quelle ein zusätzliches Signal verursacht. A ist Alpha-Strahlung, weil schon Papier die Impulszahl auf Untergrundniveau senkt; emittiert wird ein Heliumkern, A sinkt um 4 und Z um 2, die Ionisation ist stark und die Durchdringung gering. B ist Beta-minus-Strahlung: Papier lässt sie weitgehend passieren, Aluminium schirmt sie ab; beim Neutron-Proton-Umbau wird ein Elektron emittiert, Ionisation und Durchdringung liegen qualitativ zwischen Alpha und Gamma. C ist Gamma-Strahlung: Papier und Aluminium schwächen kaum, erst Blei deutlich; emittiert wird bei Kernabregung ein Photon ohne Änderung von A oder Z, mit vergleichsweise geringer Ionisation und hoher Durchdringung. Die korrigierte Rate halbiert sich ungefähr alle 3 min, also beträgt die Halbwertszeit 3 min. Nach 15 min sind fünf Halbwertszeiten vergangen; 480 / 32 = 15 Impulse pro Minute sind zu erwarten. Die Halbwertszeit beschreibt die statistische Abnahme einer großen Kernzahl. Zufällige Einzelzerfälle ergeben zusammen einen stabilen Verlauf, der Zeitpunkt eines einzelnen Zerfalls bleibt jedoch nicht vorhersagbar.',
  scoring: {
    maxPoints: 18,
    passingPoints: 11,
    steps: [
      { id: 'radiation_evidence_1', points: 6, description: 'Detektorprinzip, Signal-Schluss-Kette, Untergrund und Kontrolllogik fachlich korrekt gedeutet' },
      { id: 'radiation_evidence_2', points: 7, description: 'Drei Strahlungsarten anhand von Abschirmung, Emissionsobjekt, Kernänderung, Ionisation und Durchdringung begründet unterschieden' },
      { id: 'radiation_evidence_3', points: 5, description: 'Halbwertszeit bestimmt, Rate prognostiziert und Ensembleaussage vom Einzelzerfall abgegrenzt' },
    ],
  },
} as const

const excludedThSourceGoalIds = new Set([
  'th-phys-seki-th-2-1-1-kraft-druck-und-mechanische-energie-031-5a82d897',
  'th-phys-seki-th-2-1-1-kraft-druck-und-mechanische-energie-032-63d0aa9c',
  'th-phys-seki-th-2-1-1-kraft-druck-und-mechanische-energie-033-ccebada7',
  'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-060-cfb57617',
  'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-061-ced5afdc',
  'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-062-e98dec7f',
  'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-063-ccea83cd',
  'th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-064-dce7763f',
  'th-phys-seki-th-2-1-3-temperatur-warme-und-zustandsanderungen-088-e0dae6d9',
  'th-phys-seki-th-2-1-3-temperatur-warme-und-zustandsanderungen-089-2f9a3c7b',
  'th-phys-seki-th-2-1-3-temperatur-warme-und-zustandsanderungen-090-8cf075ae',
  'th-phys-seki-th-2-1-3-temperatur-warme-und-zustandsanderungen-091-fa4099e4',
  'th-phys-seki-th-2-1-3-temperatur-warme-und-zustandsanderungen-092-cd859b0d',
  'th-phys-seki-th-2-1-3-temperatur-warme-und-zustandsanderungen-093-c0ab52da',
  'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-119-1cef23da',
  'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-120-0d489d34',
  'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-121-e36150b1',
  'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-122-458dcfcf',
  'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-123-22ee1cfc',
  'th-phys-seki-th-2-2-1-elektromagnetische-wechselwirkungen-144-70590150',
  'th-phys-seki-th-2-2-1-elektromagnetische-wechselwirkungen-145-faa16491',
  'th-phys-seki-th-2-2-1-elektromagnetische-wechselwirkungen-146-e026e61b',
  'th-phys-seki-th-2-2-1-elektromagnetische-wechselwirkungen-147-e4fd0079',
  'th-phys-seki-th-2-2-1-elektromagnetische-wechselwirkungen-148-64e17c2f',
  'th-phys-seki-th-2-2-1-elektromagnetische-wechselwirkungen-149-52f368c1',
  'th-phys-seki-th-2-2-2-bewegungen-krafte-und-erhaltungssatze-191-d83ecff4',
  'th-phys-seki-th-2-2-2-bewegungen-krafte-und-erhaltungssatze-192-ca96addb',
  'th-phys-seki-th-2-2-2-bewegungen-krafte-und-erhaltungssatze-193-de004503',
  'th-phys-seki-th-2-2-2-bewegungen-krafte-und-erhaltungssatze-194-e2fcd24c',
  'th-phys-seki-th-2-2-2-bewegungen-krafte-und-erhaltungssatze-195-cf0c24ce',
  'th-phys-seki-th-2-2-2-bewegungen-krafte-und-erhaltungssatze-196-39b1774a',
  'th-phys-seki-th-2-2-2-bewegungen-krafte-und-erhaltungssatze-197-6f333399',
  'th-phys-seki-th-2-2-2-bewegungen-krafte-und-erhaltungssatze-198-ac1dc457',
  'th-phys-seki-th-2-2-3-radioaktivitat-213-6ebb790e',
  'th-phys-seki-th-2-2-3-radioaktivitat-214-102473c5',
  'th-phys-seki-th-2-2-3-radioaktivitat-215-ad98d2f8',
  'th-phys-seki-th-2-2-3-radioaktivitat-216-e8496546',
  'th-phys-seki-th-2-2-3-radioaktivitat-217-1fbf1ceb',
  'th-phys-seki-th-2-2-3-radioaktivitat-218-c453c6b4',
  'th-phys-seki-th-2-2-3-radioaktivitat-219-eae6559a',
  'th-phys-seki-th-2-2-3-radioaktivitat-220-25a36bd5',
])

const directRoutes = new Map<string, Record<string, RouteTarget[]>>([
  [paths.bwReview, {
    'bw-phys-seki-3-3-4-b01-a01-31408e45': [{ targetGoalId: ids.nuclideNotation, matchType: 'partial' }],
    'bw-phys-seki-3-3-4-b02-a01-72ced8e1': [
      { targetGoalId: ids.radiationTypes, matchType: 'partial' },
      { targetGoalId: ids.halfLife, matchType: 'partial' },
    ],
    'bw-phys-seki-3-3-4-b03-a01-7266562e': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
    'bw-phys-seki-3-3-4-b06-a01-5219be73': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
  }],
  [paths.byReview, {
    '9af9e852-a30a-5c9f-98cf-618371ebe0a9': [
      { targetGoalId: ids.detection, matchType: 'partial' },
      { targetGoalId: ids.radiationTypes, matchType: 'partial' },
    ],
    'dc93c563-9430-5f43-977f-5dc3a0ee7b35': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'ea53f883-180a-580a-9b39-0dc759673797': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'd889c4dd-eb1b-57a0-8e71-cd9ddf57f8a4': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'da143538-8478-5175-a759-2fdd0b39f77c': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'a91fa2d4-7c0e-53a0-807a-2bd6b26fa1a2': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
  }],
  [paths.heReview, {
    'he-phys-seki-10-2-b02-a01-a2d5bf8d': [
      { targetGoalId: ids.detection, matchType: 'partial' },
      { targetGoalId: ids.biologicalEffects, matchType: 'partial' },
      { targetGoalId: ids.radiationTypes, matchType: 'partial' },
    ],
  }],
  [paths.hhReview, {
    'hh-physics-seki-bp2022-3-2-licht-materie-116-c1251aa9': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'hh-physics-seki-bp2022-3-2-licht-materie-117-a3d9cd7c': [{ targetGoalId: ids.detection, matchType: 'partial' }],
    'hh-physics-seki-bp2022-3-2-licht-materie-118-cc7669a0': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'hh-physics-seki-bp2022-3-2-licht-materie-119-97ad97a7': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'hh-physics-seki-bp2022-3-2-licht-materie-121-d77d2f63': [{ targetGoalId: ids.detection, matchType: 'partial' }],
    'hh-physics-seki-bp2022-3-2-licht-materie-122-ed813150': [{ targetGoalId: ids.decaySeries, matchType: 'partial' }],
    'hh-physics-seki-bp2022-3-2-licht-materie-123-69ca8a0e': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'hh-physics-seki-bp2022-3-2-licht-materie-128-71634e92': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
  }],
  [paths.mvReview, {
    'mv-phys-seki-rp2022-j10-kernphysik-002-f0143df5': [{ targetGoalId: ids.nuclideNotation, matchType: 'partial' }],
    'mv-phys-seki-rp2022-j10-kernphysik-003-7401a30c': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'mv-phys-seki-rp2022-j10-kernphysik-004-9d924038': [{ targetGoalId: ids.detection, matchType: 'partial' }],
    'mv-phys-seki-rp2022-j10-kernphysik-005-f5927ff3': [{ targetGoalId: ids.detection, matchType: 'partial' }],
    'mv-phys-seki-rp2022-j10-kernphysik-006-05bec548': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'mv-phys-seki-rp2022-j10-kernphysik-007-72ab6104': [{ targetGoalId: ids.massEnergyRelease, matchType: 'partial' }],
    'mv-phys-seki-rp2022-j10-kernphysik-008-0ecfe0e7': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'mv-phys-seki-rp2022-j10-kernphysik-010-92147256': [
      { targetGoalId: ids.biologicalEffects, matchType: 'partial' },
      { targetGoalId: ids.doseProtection, matchType: 'partial' },
    ],
  }],
  [paths.slReview, {
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p29-001-6c41a56e': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p29-002-5642f475': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-001-589d6977': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-003-ee5add84': [{ targetGoalId: ids.detection, matchType: 'partial' }],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-005-6234ffc9': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-006-14e9828f': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
  }],
  [paths.snReview, {
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-05-8e9ea851': [{ targetGoalId: ids.fissionFusion, matchType: 'partial' }],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-07-c45fefd6': [{ targetGoalId: ids.fissionFusion, matchType: 'partial' }],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-08-2627771b': [{ targetGoalId: ids.fissionFusion, matchType: 'partial' }],
    'sn-phys-seki-sn-klassenstufe-9-wb1-079-02-2d727896': [{ targetGoalId: ids.detection, matchType: 'partial' }],
    'sn-phys-seki-sn-klassenstufe-9-wb1-079-03-1536cad8': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
    'sn-phys-seki-sn-klassenstufe-9-wb1-079-04-352f581f': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'sn-phys-seki-sn-klassenstufe-9-wb1-079-05-3bf3314f': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'sn-phys-seki-sn-klassenstufe-9-wb1-079-06-c4d110c2': [{ targetGoalId: ids.detection, matchType: 'partial' }],
  }],
  [paths.stReview, {
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-308-f6cbf8fa': [{ targetGoalId: ids.nuclideNotation, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-309-195b1552': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-310-bc3b03ea': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-311-16fce03d': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-312-abec71a0': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-313-b0ea47d1': [{ targetGoalId: ids.detection, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-314-fc7c393c': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-315-2d45386a': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-316-b3b6290e': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-317-b26c20f6': [
      { targetGoalId: ids.massEnergyRelease, matchType: 'partial' },
      { targetGoalId: ids.fissionFusion, matchType: 'partial' },
    ],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-318-9d1c5fa8': [{ targetGoalId: ids.application, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-319-add0e548': [{ targetGoalId: ids.application, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-320-ba90b001': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-321-56ecfa6c': [
      { targetGoalId: ids.application, matchType: 'partial' },
      { targetGoalId: ids.biologicalEffects, matchType: 'partial' },
    ],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-322-a8635b2a': [
      { targetGoalId: ids.fissionFusion, matchType: 'partial' },
      { targetGoalId: ids.application, matchType: 'partial' },
    ],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-323-cff8f6df': [{ targetGoalId: ids.nuclideNotation, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-324-27b80972': [
      { targetGoalId: ids.radiationTypes, matchType: 'partial' },
      { targetGoalId: ids.detection, matchType: 'partial' },
      { targetGoalId: ids.halfLife, matchType: 'partial' },
    ],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-325-a058f9a9': [
      { targetGoalId: ids.detection, matchType: 'partial' },
      { targetGoalId: ids.biologicalEffects, matchType: 'partial' },
    ],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-326-ef000908': [{ targetGoalId: ids.application, matchType: 'partial' }],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-327-f4c8f7d6': [
      { targetGoalId: ids.fissionFusion, matchType: 'partial' },
      { targetGoalId: ids.application, matchType: 'partial' },
    ],
  }],
  [paths.thReview, {
    'th-phys-seki-th-2-2-3-radioaktivitat-199-811aaff7': [{ targetGoalId: ids.nuclideNotation, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-200-ccd23b74': [{ targetGoalId: ids.nuclideNotation, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-201-6b051f4a': [{ targetGoalId: ids.nuclideNotation, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-202-4631ad00': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-203-286771d9': [{ targetGoalId: ids.detection, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-204-91010f39': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-205-816b3011': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-206-f4fbfd69': [{ targetGoalId: ids.radiationTypes, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-207-c12cf23e': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-208-0aa93784': [{ targetGoalId: ids.halfLife, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-209-3ea48415': [{ targetGoalId: ids.application, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-210-d0faa2b4': [{ targetGoalId: ids.application, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-211-5878cb00': [{ targetGoalId: ids.application, matchType: 'partial' }],
    'th-phys-seki-th-2-2-3-radioaktivitat-212-e10bb744': [{ targetGoalId: ids.biologicalEffects, matchType: 'partial' }],
  }],
])

const directRemovals = new Map<string, Record<string, string[]>>([
  [paths.bwReview, {
    'bw-phys-seki-3-3-4-b03-a01-7266562e': [ids.upperRadiation],
  }],
  [paths.mvReview, {
    'mv-phys-seki-rp2022-j8-waerme-007-6cad190f': [ids.sekILight],
    'mv-phys-seki-rp2022-j10-kernphysik-002-f0143df5': [ids.methods],
    'mv-phys-seki-rp2022-j10-kernphysik-003-7401a30c': [ids.sekILight, ids.electricalEnergy, ids.simpleMachines],
    'mv-phys-seki-rp2022-j10-kernphysik-004-9d924038': [ids.sekILight, ids.atomModel, ids.application],
    'mv-phys-seki-rp2022-j10-kernphysik-005-f5927ff3': [ids.sekILight, ids.atomModel],
    'mv-phys-seki-rp2022-j10-kernphysik-006-05bec548': [ids.acceleratedMotion, ids.freeFall, ids.atomModel],
    'mv-phys-seki-rp2022-j10-kernphysik-007-72ab6104': [ids.electricalEnergy, ids.simpleMachines, ids.fissionFusion],
    'mv-phys-seki-rp2022-j10-kernphysik-008-0ecfe0e7': [ids.acceleratedMotion, ids.freeFall],
    'mv-phys-seki-rp2022-j10-kernphysik-009-034ad168': [ids.sekILight, ids.atomModel],
    'mv-phys-seki-rp2022-j10-kernphysik-010-92147256': [ids.sekILight],
  }],
  [paths.slReview, {
    'sl-phys-seki-sl-ph-seki-8-nw-2024-p39-005-fbadea23': [ids.sekILight, ids.atomModel],
    'sl-phys-seki-sl-ph-seki-8-nw-2024-p39-008-3663729d': [ids.acceleratedMotion, ids.freeFall, ids.electricalEnergy, ids.sekILight],
    'sl-phys-seki-sl-ph-seki-9-nw-2024-p13-003-b0c23e4a': [ids.electricalEnergy],
    'sl-phys-seki-sl-ph-seki-9-nw-2024-p16-010-f2d3fdbd': [ids.magnetism],
    'sl-phys-seki-sl-ph-seki-9-nw-2024-p16-011-832b6176': [ids.magnetism],
    'sl-phys-seki-sl-ph-seki-9-nw-2024-p28-006-650ff38b': [ids.atomModel],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p29-001-6c41a56e': [
      ids.acceleratedMotion, ids.freeFall, ids.particleTemperature, ids.sekILight, ids.atomModel, ids.doseProtection,
    ],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p29-002-5642f475': [ids.sekILight, ids.atomModel],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p29-003-e4e34c6a': [ids.sekILight, ids.atomModel, ids.doseProtection],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-001-589d6977': [ids.acceleratedMotion, ids.freeFall, ids.atomModel],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-003-ee5add84': [ids.sekILight, ids.atomModel],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-005-6234ffc9': [ids.sekILight, ids.atomModel],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-006-14e9828f': [ids.atomModel],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-007-95c4724b': [ids.friction],
    'sl-phys-seki-sl-ph-seki-10-nw-2026-p30-009-d83c42dc': [ids.acceleratedMotion, ids.freeFall, ids.atomModel],
  }],
  [paths.snReview, {
    'sn-phys-seki-sn-klassenstufe-6-lb2-007-02-450deb6f': [
      ids.fissionFusion, ids.upperMassEnergy, ids.motionSt, ids.atomModel,
    ],
    'sn-phys-seki-sn-klassenstufe-7-lb1-029-02-8c9699a4': [ids.particleTemperature, ids.friction],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-01-a382df57': [ids.particleTemperature, ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-02-fe15e53c': [ids.particleTemperature, ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-03-2c5dcd0a': [ids.particleTemperature, ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-04-c47fdb4c': [ids.particleTemperature, ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-05-8e9ea851': [ids.particleTemperature, ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-06-ebfd779e': [ids.particleTemperature, ids.electricalEnergy, ids.upperMassEnergy],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-07-c45fefd6': [ids.particleTemperature, ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-9-lb2-070-08-2627771b': [ids.particleTemperature, ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-9-lb2-071-02-cea92100': [ids.friction, ids.doseProtection],
    'sn-phys-seki-sn-klassenstufe-9-wb1-079-03-1536cad8': [ids.sekILight, ids.lightRayModel, ids.application],
    'sn-phys-seki-sn-klassenstufe-9-wb1-079-06-c4d110c2': [ids.sekILight, ids.lightRayModel],
    'sn-phys-seki-sn-klassenstufe-9-wb1-079-07-73696dbf': [
      ids.soundPressureRisks, ids.sekILight, ids.lightRayModel, ids.experimentPlanning, ids.doseProtection,
    ],
    'sn-phys-seki-sn-klassenstufe-9-wb2-080-03-b1be65f2': [ids.gravity, ids.gravitationalField, ids.astronomy],
    'sn-phys-seki-sn-klassenstufe-10-lb2-089-02-b22ed40e': [ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-10-lb2-089-03-15ea84a4': [ids.electricalEnergy],
    'sn-phys-seki-sn-klassenstufe-10-lb2-092-04-ad696e99': [ids.sekILight, ids.lightRayModel],
  }],
  [paths.stReview, {
    'st-phys-seki-st-schuljahrgang-6-temperatur-und-warme-083-c5abc33b': [ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-308-f6cbf8fa': [ids.sekIMechanics],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-309-195b1552': [ids.sekIMechanics, ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-310-bc3b03ea': [ids.sekIMechanics],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-311-16fce03d': [ids.sekIMechanics],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-312-abec71a0': [
      ids.sekIMechanics, ids.sekILight, ids.electricCircuits, ids.magneticCircuits,
    ],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-313-b0ea47d1': [ids.sekIMechanics, ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-314-fc7c393c': [ids.sekIMechanics, ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-315-2d45386a': [ids.sekIMechanics],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-316-b3b6290e': [ids.sekIMechanics],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-317-b26c20f6': [ids.sekIMechanics],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-318-9d1c5fa8': [ids.sekIMechanics, ids.sekILight, ids.documentation],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-319-add0e548': [ids.sekIMechanics, ids.documentation],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-320-ba90b001': [ids.sekIMechanics, ids.documentation],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-321-56ecfa6c': [ids.sekIMechanics, ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-322-a8635b2a': [ids.sekIMechanics, ids.digitalTools],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-323-cff8f6df': [ids.sekIMechanics],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-324-27b80972': [ids.sekIMechanics, ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-325-a058f9a9': [ids.sekIMechanics, ids.sekILight, ids.heat],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-326-ef000908': [ids.sekIMechanics, ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-radioaktivitat-und-kernenergie-327-f4c8f7d6': [ids.sekIMechanics],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-klimaphysik-342-5d53a15b': [ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-klimaphysik-345-ab840ba1': [ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-klimaphysik-351-0f1fd7dc': [ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-klimaphysik-352-3b28ab82': [ids.sekIMechanics, ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-klimaphysik-362-f8a9b3b8': [ids.sekILight],
    'st-phys-seki-st-schuljahrgang-10-einfuhrungsphase-klimaphysik-364-9892d9fa': [ids.sekILight],
  }],
  [paths.thReview, {
    'th-phys-seki-th-2-2-3-radioaktivitat-199-811aaff7': [ids.nuclideCharts],
    'th-phys-seki-th-2-2-3-radioaktivitat-200-ccd23b74': [ids.nuclideCharts],
    'th-phys-seki-th-2-2-3-radioaktivitat-201-6b051f4a': [ids.nuclideCharts],
    'th-phys-seki-th-2-2-3-radioaktivitat-202-4631ad00': [ids.sekILight],
    'th-phys-seki-th-2-2-3-radioaktivitat-203-286771d9': [ids.sekILight],
    'th-phys-seki-th-2-2-3-radioaktivitat-204-91010f39': [ids.society, ids.sekILight],
    'th-phys-seki-th-2-2-3-radioaktivitat-205-816b3011': [ids.sekIMechanics],
    'th-phys-seki-th-2-2-3-radioaktivitat-206-f4fbfd69': [ids.sekIMechanics, ids.sekILight],
    'th-phys-seki-th-2-2-3-radioaktivitat-208-0aa93784': [ids.methods, ids.experimentPlanning, ids.sekIMechanics],
    'th-phys-seki-th-2-2-3-radioaktivitat-210-d0faa2b4': [ids.sekILight],
    'th-phys-seki-th-2-2-3-radioaktivitat-212-e10bb744': [ids.society, ids.sekILight],
  }],
])

const expectedBeforeHashes: Record<string, string> = {
  [paths.canonical]: '811cfa66be5019fd4c964bfdd73ca4f032648a25f881052c0a844b5e155f4063',
  [paths.semanticKinds]: 'd6d9831d72276ddee425b409302bf4c2cd7158d8bd4a1dac6a524697112f2a87',
  [paths.atomicity]: '1701ebc885bbdb61946cdc5f714b94fa000158ee3c8c5de8cf6d58f7bcc1d5f2',
  [paths.memory]: 'd7e5d27ba3d78d18c92e8f04b62bef74ab6baeac4a9aad92b56435dd43c4270e',
  [paths.atlas]: 'e0aef931e290668ff53f872e8a71d100f3df431729d6cc15875e3a453b59485e',
  [paths.provenance]: 'f08f2a04e151fd5a51f0eff352f1f8f34c76cde46f2d50dde0247a33df1cfb8d',
  [paths.surrogate]: 'c8efe3c2d33978ecf3079eeeb06cf08f0a1d5ed2ddfd85fcc131aa7e62364e7c',
  [paths.visualizationQa]: '73323014eb8f3539c2de80008a973158dc44aec7cd47804d380ddd4a36c835b6',
  [paths.physicsInputTest]: 'd52aecac18a4ed80c229417dfc499e6fad746216a320477140e955b449a48b75',
}
const expectedBeforeCorpusHashes = {
  mappings: '506ed0fbf951ed544ffc4253129bb022acad45069a323da9e9b533f79a2be3c0',
  views: 'e8835bc2c9ae142b152b1db934e056aeacaa68f3b909b4b32ff3191e58fed668',
  generators: '91dc7f1707efb003a1cbc0869a4655df3dae33e0ddb1effa67c21668c8c11b31',
}
const expectedAfterHashes: Record<string, string> = {
  [paths.canonical]: 'dfdacc61736f7b5d11e08de2f695f63514a1f01239c664d1afe005180d6b0b89',
  [paths.semanticKinds]: 'e9d6f6b1f207a3f5f87f6f334719009fba34116cd277990aeb1241db442822e8',
  [paths.atomicity]: '329939dc70a09c9ea5302009802368a8d4a444207c26fece0bee25c272c3a385',
  [paths.memory]: '681bb097b2e48ba5039db13f9d6cb1eeb1efa34eca84b0ec452025a0b36d7d8d',
  [paths.atlas]: '67d321797a4af91f362b2aa4dfe2907254b05baa0dfddbb9b83c0437cb47425e',
  [paths.provenance]: '218fa443869dcd8aebc13d5c6a32749b67603791329f22096cca26d621246790',
  [paths.surrogate]: '33ebc9b355d7f8aec22911edd1a388b54dcc6d6a03514282f1d93585e7ff604c',
  [paths.visualizationQa]: '9404d5038fe881be04ec2c9ddaaa600103b0e46733e283ac6cecd34e4c0de0e4',
  [paths.physicsInputTest]: '8e7b317dd7abcd9adb56e10608847335649f8713010f73965ffa10cb51389984',
  [paths.visualizationReview]: 'c85e66fa6050784bb1264903f33cf10a8db00cf1c43f87631a2f94022afc4259',
  [paths.thExtraction]: 'ab0b8d7773e6c45e80c5bdd5ce4bdd7fb45d36ae0992598146ea4b08fe5a256d',
  [paths.thReadme]: 'f7d41c0bd565aa601c4887867ec211386ded7a0d9b94466e50c382e5d57f3f8a',
}
const expectedAfterCorpusHashes = {
  mappings: '236cd6525361231da9f88a0ee9c856c3d2cbc872ac9022c5dff5f921ff011a02',
  views: 'e2f04954af18561eadd77b180adb61779b65805ba246661d1cd3ecc9b3ac31f1',
  generators: '9573d6610ca7d7fac60ac8c03f4eca86337ea5fcc16762c7e9f35a359d67152a',
}

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8'))
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8').split(/\r?\n/u)
  .filter((line) => line.trim()).map((line) => JSON.parse(line))
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (values: JsonRecord[]): string => `${values.map((value) => JSON.stringify(value)).join('\n')}\n`
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const digest = (value: unknown): string => `sha256:${sha256(stableJson(value))}`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const unique = <T>(values: T[]): T[] => [...new Set(values)]
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const deterministicPhysicsGoalId = (shortKey: string): string => {
  const value = createHash('sha1').update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`).digest('hex')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20, 32)}`
}
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
const corpusHash = (paths: string[], bytesByPath?: Map<string, string>): string => sha256(JSON.stringify(paths.map((path) => ({
  path,
  sha256: sha256(bytesByPath?.get(path) ?? readFileSync(absolute(path))),
}))))

function assertBeforeHashes(): void {
  const canonical = readJson(paths.canonical)
  const before = (canonical.goals as JsonRecord[]).find((goal) => goal.id === ids.detectionCluster)?.type === 'atomic'
  if (!before) return
  for (const [path, expected] of Object.entries(expectedBeforeHashes)) {
    if (expected.startsWith('PENDING')) throw new Error(`Unbound Batch-017 before hash for ${path}`)
    const actual = sha256(readFileSync(absolute(path)))
    if (actual !== expected) throw new Error(`Batch-017 before-hash drift at ${path}: ${actual} != ${expected}`)
  }
  for (const [label, actual] of Object.entries({
    mappings: corpusHash(mappingPaths), views: corpusHash(viewPaths), generators: corpusHash(generatorPaths),
  })) {
    if (actual !== expectedBeforeCorpusHashes[label as keyof typeof expectedBeforeCorpusHashes]) {
      throw new Error(`Batch-017 ${label} before-corpus drift: ${actual}`)
    }
  }
}

function replaceOne(values: string[], oldId: string, replacements: string[], label: string): string[] {
  const oldCount = values.filter((value) => value === oldId).length
  if (oldCount === 0) {
    if (replacements.every((replacement) => values.includes(replacement))) return unique(values)
    throw new Error(`${label}: neither exact before nor exact after state for ${oldId}`)
  }
  if (oldCount !== 1) throw new Error(`${label}: duplicate ${oldId}`)
  return unique(values.flatMap((value) => value === oldId ? replacements : [value]))
}

function updateVisualizationLink(goal: JsonRecord): void {
  const links = goal.resourceLinks as JsonRecord[] | undefined
  if (!links || links.length !== 1 || links[0].provider !== 'Google Gemini / Nano Banana Pro') {
    throw new Error(`Expected one retained Nano Banana Pro link for ${goal.id}`)
  }
  links[0].title = `Visualisierung: ${goal.title}`
  if (goal.id === ids.atomModel) {
    links[0].description = 'Schematische, ausdrücklich nicht maßstabsgerechte Darstellung von Atomkern und Elektronenhülle; Größenverhältnisse sind aus dem Bild nicht ablesbar und benötigen Zahlen- oder Maßstabsdaten.'
    links[0].altText = 'Schematische, nicht maßstabsgerechte Darstellung eines Atoms mit kleinem Kern und Elektronenhülle. Das Bild weist darauf hin, dass die Größenverhältnisse nicht maßstabsgerecht und daraus nicht ablesbar sind.'
    return
  }
  if (goal.id === ids.application) {
    links[0].description = 'Qualitative Übersicht zu Anwendungen ionisierender Strahlung in Medizin, Materialprüfung und Kerntechnik sowie zu Nutzen, Strahlenrisiken und grundlegenden Schutzprinzipien.'
    links[0].altText = 'Übersicht mit den Einsatzfeldern Medizin, Materialprüfung und Kerntechnik sowie Symbolen für Nutzen, Strahlenrisiken und die Schutzprinzipien Zeit, Abstand und Abschirmung.'
    return
  }
  if (goal.id === ids.detectionCluster) {
    links[0].description = 'Unveränderte dreiteilige Übersicht mit Alpha-, Beta- und Gammastrahlung als Kontext, einem Geiger-Müller-Nachweis sowie Gewebewirkung und Schutz bei äußerer Exposition durch kurze Expositionszeit, Abstand und Abschirmung.'
    links[0].altText = 'Dreiteilige Übersicht: Alpha-, Beta- und Gammastrahlung als Kontext; Nachweis mit einem Geiger-Müller-Zählrohr; mögliche Gewebewirkung und Schutz bei äußerer Exposition durch kurze Expositionszeit, Abstand und Abschirmung.'
    return
  }
  if (goal.id === ids.decayCluster) {
    links[0].description = 'Unveränderte Übersicht zu Alpha-, Beta-minus- und Gammastrahlung, ihrer qualitativen Abschirmreihenfolge und einer schematischen Halbwertszeitfolge von 16 über 8 zu 4.'
    links[0].altText = 'Übersicht zu Alpha-, Beta-minus- und Gammastrahlung mit Teilchen- beziehungsweise Photonendarstellung, qualitativer Abschirmreihenfolge und der schematischen Halbwertszeitfolge 16, 8 und 4.'
    return
  }
  throw new Error(`No reviewed visualization metadata for ${goal.id}`)
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  if (landscape.landscapeId !== physicsLandscapeId) throw new Error('Unexpected canonical Physics landscape')
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [String(goal.id), goal]))
  if (byId.size !== goals.length) throw new Error('Duplicate canonical Physics goal IDs')
  const goal = (id: string): JsonRecord => {
    const value = byId.get(id)
    if (!value) throw new Error(`Missing canonical Physics goal ${id}`)
    return value
  }
  const protectedParentLinkIdentity = new Map([...splitParents].map((id) => {
    const link = (goal(id).resourceLinks as JsonRecord[] | undefined)?.[0]
    return [id, stableJson({ url: link?.url, provider: link?.provider })]
  }))
  for (const parentId of splitParents) {
    const links = goal(parentId).resourceLinks as JsonRecord[] | undefined
    if (!links?.length || links.some((link) => link.provider !== 'Google Gemini / Nano Banana Pro')) {
      throw new Error(`Split parent ${parentId} lost its Nano Banana Pro overview link`)
    }
  }
  for (const [goalId, expectedHash] of Object.entries(protectedVisualizationAssetHashes)) {
    const link = (goal(goalId).resourceLinks as JsonRecord[] | undefined)?.[0]
    if (typeof link?.url !== 'string' || !link.url.startsWith('/assets/goal-visualizations/')) {
      throw new Error(`Protected visualization ${goalId} has no canonical public asset URL`)
    }
    const actualHash = sha256(readFileSync(absolute(`app/public${link.url}`)))
    if (actualHash !== expectedHash) throw new Error(`Protected visualization bytes changed for ${goalId}`)
  }

  Object.assign(goal(ids.atomModel), {
    description: 'Die lernende Person kann Kern und Elektronenhülle als Bestandteile eines Atommodells beschreiben und die Größenordnungen von Atom- und Kerndurchmesser vergleichen.',
    descriptionEn: 'The learner can describe the nucleus and electron shell as components of an atomic model and compare the orders of magnitude of atomic and nuclear diameters.',
  })
  updateVisualizationLink(goal(ids.atomModel))

  Object.assign(goal(ids.detectionCluster), {
    title: 'Nachweis und biologische Wirkungen ionisierender Strahlung',
    titleEn: 'Detection and biological effects of ionising radiation',
    description: 'Bündelt den kontrollierten Nachweis ionisierender Strahlung mit geeigneten Detektoren und die physikalisch begründete Einordnung ihrer biologischen Wirkungen und grundlegender Schutzmaßnahmen bei äußerer Exposition.',
    descriptionEn: 'Bundles the controlled detection of ionising radiation with suitable detectors and the physically reasoned classification of its biological effects and basic protective measures for external exposure.',
    weight: 2,
    contains: [ids.detection, ids.biologicalEffects],
    requires: [],
    type: 'cluster',
  })
  delete goal(ids.detectionCluster).semanticAtomic
  updateVisualizationLink(goal(ids.detectionCluster))

  Object.assign(goal(ids.application), {
    description: 'Die lernende Person kann bei einem konkreten Einsatz ionisierender Strahlung oder radioaktiver Stoffe in Medizin, Materialprüfung oder Kerntechnik Nutzen, Strahlenrisiken und Schutzmaßnahmen anhand physikalischer Wirkungen, Einsatzbedingungen und benannter Bewertungskriterien qualitativ abwägen.',
    descriptionEn: 'The learner can qualitatively weigh the benefits, radiation risks, and protective measures for a specific use of ionising radiation or radioactive substances in medicine, materials testing, or nuclear technology based on physical effects, operating conditions, and explicitly named evaluation criteria.',
    requires: [ids.biologicalEffects],
  })
  updateVisualizationLink(goal(ids.application))

  Object.assign(goal(ids.decayCluster), {
    title: 'Strahlungsarten und Halbwertszeit radioaktiver Stoffe',
    titleEn: 'Radiation types and the half-life of radioactive substances',
    description: 'Bündelt das qualitative Unterscheiden von Alpha-, Beta- und Gammastrahlung und das statistische Deuten der Halbwertszeit radioaktiver Stoffe.',
    descriptionEn: 'Bundles the qualitative distinction among alpha, beta, and gamma radiation and the statistical interpretation of the half-life of radioactive substances.',
    weight: 2,
    contains: [ids.radiationTypes, ids.halfLife],
    requires: [],
    type: 'cluster',
  })
  delete goal(ids.decayCluster).semanticAtomic
  updateVisualizationLink(goal(ids.decayCluster))

  Object.assign(goal(ids.fissionFusion), {
    description: 'Die lernende Person kann Kernspaltung und Kernfusion anhand der Ausgangskerne, der Reaktionsprodukte und der erforderlichen Bedingungen qualitativ vergleichen sowie heutige Kernkraftwerke der Kernspaltung und Sterne der Kernfusion begründet zuordnen.',
    descriptionEn: 'The learner can qualitatively compare nuclear fission and nuclear fusion in terms of the initial nuclei, reaction products, and required conditions, and give reasoned assignments of present-day nuclear power plants to nuclear fission and stars to nuclear fusion.',
    requires: [ids.atomModel],
  })

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
      tags: structuredClone(parent.tags ?? []),
      contains: [],
      requires: [...spec.requires],
      dimensionTags: {
        framework: 'canonical-gymnasium-physics',
        demandLevel: spec.demandLevel,
        processCompetencies: [...spec.processCompetencies],
        guidingIdeas: [...spec.guidingIdeas],
        phase: 'GLOBAL',
        area: 'Atom- und Kernphysik',
        topicCode: spec.topicCode,
      },
      applicability: { jurisdiction: [...spec.applicabilityJurisdictions] },
      ...(spec.id === ids.nuclideNotation ? {
        extendedData: { applicabilityMappingInheritance: 'boundary' },
      } : {}),
      type: 'atomic',
      semanticAtomic: true,
      competencyRefs: [...spec.competencyRefs],
      resourceLinks: [],
    }
    const existing = byId.get(spec.id)
    if (
      existing
      && spec.id === ids.radiationTypes
      && existing.description === 'Die lernende Person kann Alpha-, Beta- und Gammastrahlung anhand der Kernänderung beziehungsweise Kernabregung, der emittierten Teilchen oder Photonen sowie ihres Ionisations- und Durchdringungsvermögens qualitativ unterscheiden.'
      && existing.descriptionEn === 'The learner can qualitatively distinguish alpha, beta, and gamma radiation by the nuclear change or nuclear de-excitation involved, the emitted particles or photons, and their ionising and penetrating power.'
    ) {
      existing.description = spec.description
      existing.descriptionEn = spec.descriptionEn
    }
    if (
      existing
      && spec.id === ids.biologicalEffects
      && existing.description === 'Die lernende Person kann die mögliche Schädigung biologischen Gewebes durch ionisierende Strahlung über Ionisation erklären und grundlegende Schutzmaßnahmen anhand von Expositionszeit, Abstand und Abschirmung begründen.'
      && existing.descriptionEn === 'The learner can explain possible damage to biological tissue by ionising radiation through ionisation and justify basic protective measures in terms of exposure time, distance, and shielding.'
    ) {
      existing.description = spec.description
      existing.descriptionEn = spec.descriptionEn
    }
    if (existing && !same(existing, expected)) throw new Error(`Existing Batch-017 child differs: ${spec.id}`)
    byId.set(spec.id, existing ?? expected)
  }
  for (const childId of childIds) {
    const index = goals.findIndex((candidate) => candidate.id === childId)
    if (index >= 0) goals.splice(index, 1)
  }
  for (const parentId of [ids.nuclearCluster, ids.decayCluster, ids.detectionCluster]) {
    const parentIndex = goals.findIndex((candidate) => candidate.id === parentId)
    if (parentIndex < 0) throw new Error(`Missing insertion parent ${parentId}`)
    goals.splice(parentIndex + 1, 0, ...childSpecs.filter((spec) => spec.parentId === parentId).map((spec) => byId.get(spec.id)!))
  }

  goal(ids.nuclearCluster).contains = replaceOne(
    goal(ids.nuclearCluster).contains, ids.atomModel,
    [ids.atomModel, ids.nuclideNotation], `${ids.nuclearCluster}.contains`,
  )

  const assessmentSpecs = [nuclideNotationAssessmentSpec, radiationEvidenceAssessmentSpec]
  const assessments = assessmentSpecs.map((spec): JsonRecord => {
    const assessmentJurisdictions = allJurisdictions.filter((jurisdiction) => (
      spec.requires.every((requiredGoalId) => (
        (goal(requiredGoalId).applicability?.jurisdiction as string[] | undefined)?.includes(jurisdiction) === true
      ))
    ))
    if (assessmentJurisdictions.length === 0) throw new Error(`${spec.id} has no shared prerequisite applicability`)
    const existingAssessment = byId.get(spec.id)
    if (existingAssessment && existingAssessment.shortKey !== spec.shortKey) {
      throw new Error(`Assessment ID collision for ${spec.id}`)
    }
    return {
      id: spec.id,
      shortKey: spec.shortKey,
      title: spec.title,
      titleEn: spec.titleEn,
      description: spec.description,
      descriptionEn: spec.descriptionEn,
      weight: 1,
      tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'SekI'],
      dimensionTags: {
        framework: 'canonical-gymnasium-physics',
        demandLevel: 'AB3',
        processCompetencies: [...spec.processCompetencies],
        guidingIdeas: [...spec.guidingIdeas],
        phase: 'GLOBAL',
        area: spec.area,
        topicCode: spec.topicCode,
      },
      requires: [...spec.requires],
      contains: [],
      examples: [],
      applicability: { jurisdiction: assessmentJurisdictions },
      extendedData: {
        applicabilityFromRequires: true,
        applicabilityMappingInheritance: 'boundary',
      },
      type: 'atomic',
      examData: {
        reviewStatus: 'released',
        coveredGoalIds: [...spec.requires],
        coveredStrands: [...spec.guidingIdeas],
        demandLevels: ['AB1', 'AB2', 'AB3'],
        taskContent: spec.taskContent,
        solutionContent: spec.solutionContent,
        scoring: structuredClone(spec.scoring),
      },
    }
  })
  for (const spec of assessmentSpecs) {
    const assessmentIndex = goals.findIndex((candidate) => candidate.id === spec.id)
    if (assessmentIndex >= 0) goals.splice(assessmentIndex, 1)
  }
  const radiationRiskIndex = goals.findIndex((candidate) => candidate.id === '77b23e86-c39f-589e-8460-b28883baea51')
  if (radiationRiskIndex < 0) throw new Error('Missing radiation-risk assessment insertion anchor')
  goals.splice(radiationRiskIndex + 1, 0, ...assessments)
  for (const assessment of assessments) byId.set(assessment.id, assessment)
  const practiceCluster = goal(ids.practiceCluster)
  const retainedPracticeChildren = (practiceCluster.contains as string[])
    .filter((goalId) => !assessmentSpecs.some((spec) => spec.id === goalId))
  const radiationRiskChildIndex = retainedPracticeChildren.indexOf('77b23e86-c39f-589e-8460-b28883baea51')
  if (radiationRiskChildIndex < 0) throw new Error('Missing radiation-risk practice-cluster anchor')
  retainedPracticeChildren.splice(radiationRiskChildIndex + 1, 0, ...assessmentSpecs.map((spec) => spec.id))
  practiceCluster.contains = retainedPracticeChildren

  goal(ids.upperRadiation).requires = replaceOne(
    goal(ids.upperRadiation).requires, ids.detectionCluster,
    [ids.radiationTypes, ids.detection, ids.biologicalEffects], `${ids.upperRadiation}.requires`,
  )
  goal(ids.decayLaws).requires = replaceOne(
    goal(ids.decayLaws).requires, ids.upperRadiation, [ids.halfLife], `${ids.decayLaws}.requires`,
  )
  const upperFissionFusionRequires = goal(ids.upperFissionFusion).requires as string[]
  if (upperFissionFusionRequires.includes(ids.decayCluster)) {
    goal(ids.upperFissionFusion).requires = replaceOne(
      upperFissionFusionRequires, ids.decayCluster, [ids.radiationTypes], `${ids.upperFissionFusion}.requires`,
    )
  } else if (upperFissionFusionRequires.includes(ids.fissionFusion)) {
    goal(ids.upperFissionFusion).requires = replaceOne(
      upperFissionFusionRequires, ids.fissionFusion, [ids.radiationTypes], `${ids.upperFissionFusion}.requires`,
    )
  } else if (!upperFissionFusionRequires.includes(ids.radiationTypes)) {
    throw new Error(`${ids.upperFissionFusion}.requires has neither an adjudicated before nor after state`)
  }
  goal(ids.massEnergyRelease).requires = replaceOne(
    goal(ids.massEnergyRelease).requires, ids.decayCluster, [ids.radiationTypes], `${ids.massEnergyRelease}.requires`,
  )
  goal(ids.massEnergyRelease).applicability = {
    jurisdiction: [...massEnergyReleaseJurisdictions],
  }
  const capstone = goal(ids.compatibilityCapstone)
  for (const [oldId, replacements] of [
    [ids.detectionCluster, [ids.detection, ids.biologicalEffects]],
    [ids.decayCluster, [ids.radiationTypes, ids.halfLife]],
  ] as const) {
    capstone.requires = replaceOne(capstone.requires, oldId, [...replacements], `${ids.compatibilityCapstone}.requires`)
    capstone.examData.coveredGoalIds = replaceOne(
      capstone.examData.coveredGoalIds, oldId, [...replacements], `${ids.compatibilityCapstone}.coveredGoalIds`,
    )
  }

  goal(ids.nuclearCluster).weight = 8
  goal(ids.subjectRoot).weight = 1.2
  for (const candidate of goals) {
    const staleRequires = (candidate.requires ?? []).filter((id: string) => splitParents.has(id))
    const staleCovered = (candidate.examData?.coveredGoalIds ?? []).filter((id: string) => splitParents.has(id))
    if (staleRequires.length || staleCovered.length) {
      throw new Error(`Unadjudicated split-parent dependency on ${candidate.id}: ${[...staleRequires, ...staleCovered].join(',')}`)
    }
  }
  if (goals.length !== 683) throw new Error(`Unexpected post-Batch-017 canonical count ${goals.length}`)
  for (const [parentId, before] of protectedParentLinkIdentity) {
    const link = (goal(parentId).resourceLinks as JsonRecord[] | undefined)?.[0]
    if (stableJson({ url: link?.url, provider: link?.provider }) !== before) {
      throw new Error(`Protected split-parent visualization identity changed for ${parentId}`)
    }
  }
  landscape.goals = goals
  return landscape
}

const semanticallyChangedIds = [
  ids.atomModel, ids.nuclearCluster, ids.nuclideNotation, ids.detectionCluster, ids.detection, ids.biologicalEffects, ids.application,
  ids.decayCluster, ids.radiationTypes, ids.halfLife, ids.fissionFusion,
  ids.upperRadiation, ids.decayLaws, ids.upperFissionFusion, ids.massEnergyRelease, ids.compatibilityCapstone,
  ids.practiceCluster, ids.nuclideNotationAssessment, ids.radiationEvidenceAssessment,
]

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const decisions = new Map((ledger.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]))
  for (const goalId of semanticallyChangedIds) {
    const canonicalGoal = goalById.get(goalId)
    if (!canonicalGoal) throw new Error(`Missing semantic-kind goal ${goalId}`)
    const existing = decisions.get(goalId)
    const isChild = childIds.includes(goalId)
    const isAssessment = [ids.nuclideNotationAssessment, ids.radiationEvidenceAssessment].includes(goalId)
    const semanticKind = splitParents.has(goalId)
      ? 'curricularArea'
      : isChild
        ? 'curricularAtomic'
        : isAssessment
          ? 'practiceAssessment'
          : existing?.semanticKind
    if (!semanticKind) throw new Error(`Missing semantic-kind decision ${goalId}`)
    decisions.set(goalId, {
      ...(existing ?? {}),
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(canonicalGoal),
      semanticKind,
      ...(splitParents.has(goalId) ? {
        decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-structural-split-curricular-area',
      } : isChild ? {
        decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-structural-split-curricular-atomic',
      } : isAssessment ? {
        decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-post-split-practice-assessment',
      } : {}),
    })
  }
  ledger.decisions = [...decisions.values()].sort((left, right) => String(left.goalId).localeCompare(String(right.goalId)))
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions) counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  const order = ['curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure', 'memory', 'runtimeSupport', 'orientation']
  ledger.counts = Object.fromEntries(order.filter((kind) => counts[kind] !== undefined).map((kind) => [kind, counts[kind]]))
  ledger.counts.total = ledger.decisions.length
  if (ledger.counts.curricularAtomic !== 447 || ledger.counts.curricularArea !== 92
    || ledger.counts.practiceAssessment !== 133 || ledger.counts.total !== 683) {
    throw new Error(`Unexpected post-Batch-017 semantic-kind counts: ${stableJson(ledger.counts)}`)
  }
  return ledger
}

const stableAtomicSpecs: Record<string, { atomicityReason: string; memoryReason: string }> = {
  [ids.atomModel]: {
    atomicityReason: 'Kern-Hülle-Struktur und Größenordnungsvergleich sind zwei Darstellungsaspekte desselben Atommodells und gemeinsam an einer Modellskizze mit Maßstabsdaten prüfbar.',
    memoryReason: 'Das Ziel verlangt Modellverständnis und einen Größenordnungsvergleich; das Erinnern einzelner Durchmesserwerte ersetzt diese Einordnung nicht.',
  },
  [ids.application]: {
    atomicityReason: 'Das Ziel verlangt genau ein kriteriengeleitetes qualitatives Urteil zu einem konkreten Einsatz; die möglichen Einsatzfelder sind Alternativen für dieselbe Bewertungsroutine, keine kumulativen Teilziele.',
    memoryReason: 'Nutzen, Risiko und Schutz müssen anhand wechselnder Wirkungen, Bedingungen und Kriterien abgewogen werden; eine Memorycard kann diese Urteilskompetenz nicht ersetzen.',
  },
  [ids.fissionFusion]: {
    atomicityReason: 'Spaltung und Fusion werden in einem gemeinsamen Vergleichsraster aus Ausgangskernen, Produkten, Bedingungen und Beispielen kontrastiert; die begründete Zuordnung prüft genau diese eine Vergleichskompetenz.',
    memoryReason: 'Das Ziel verlangt den qualitativen Prozessvergleich und die begründete Zuordnung neuer Beispiele; isolierte Begriffskarten sind dafür nicht hinreichend.',
  },
}

function buildLeafReviewLedger(canonical: JsonRecord, kind: 'atomicity' | 'memory'): JsonRecord[] {
  const path = kind === 'atomicity' ? paths.atomicity : paths.memory
  const ruleVersion = kind === 'atomicity' ? 'semantic-atomicity-v1' : 'memory-card-review-v1'
  const records = readJsonl(path)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const relevant = new Set([...splitParents, ...childIds, ...Object.keys(stableAtomicSpecs)])
  const makeRecord = (goalId: string): JsonRecord => {
    const goal = goalById.get(goalId)
    const child = childSpecs.find((spec) => spec.id === goalId)
    const stable = stableAtomicSpecs[goalId]
    if (!goal || (!child && !stable)) throw new Error(`Missing Batch-017 leaf review goal ${goalId}`)
    const base = {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion,
      landscapeId: physicsLandscapeId,
      goalId,
      fingerprint: reviewFingerprint(goal, ruleVersion),
      reviewedAt: reviewDate,
      reviewer,
    }
    return kind === 'atomicity'
      ? {
        ...base, status: 'atomic', semanticAtomic: true,
        reason: child?.atomicityReason ?? stable.atomicityReason, suggestedSplit: [],
      }
      : {
        ...base, status: 'no_memory_needed', memoryUseful: false,
        reason: child?.memoryReason ?? stable.memoryReason,
      }
  }
  const result: JsonRecord[] = []
  const inserted = new Set<string>()
  for (const record of records) {
    if (splitParents.has(record.goalId)) {
      for (const child of childSpecs.filter((spec) => spec.parentId === record.goalId)) {
        if (!inserted.has(child.id)) { result.push(makeRecord(child.id)); inserted.add(child.id) }
      }
      continue
    }
    if (relevant.has(record.goalId)) {
      if (!inserted.has(record.goalId) && !splitParents.has(record.goalId)) {
        result.push(makeRecord(record.goalId)); inserted.add(record.goalId)
      }
      continue
    }
    result.push(record)
  }
  for (const goalId of [...childIds, ...Object.keys(stableAtomicSpecs)]) {
    if (!inserted.has(goalId)) result.push(makeRecord(goalId))
  }
  if (result.length !== 447 || result.some((record) => splitParents.has(record.goalId))) {
    throw new Error(`${path}: invalid post-Batch-017 leaf ledger`)
  }
  return result
}

function buildThSourceExtraction(): JsonRecord {
  const extraction = readJson(paths.thExtraction)
  const originalSourceGoals = extraction.sourceGoals as JsonRecord[]
  const excludedCount = originalSourceGoals.filter((goal) => excludedThSourceGoalIds.has(goal.id)).length
  const sourceGoals = originalSourceGoals.filter((goal) => !excludedThSourceGoalIds.has(goal.id))
  if (sourceGoals.length !== 179) {
    throw new Error(`TH source extraction has an incomplete project/stage-boundary filter state (${excludedCount}/41 removed; ${sourceGoals.length}/179 retained)`)
  }
  const sourceGoalsByPassage = new Map<string, JsonRecord[]>()
  for (const goal of sourceGoals) sourceGoalsByPassage.set(
    goal.passageId, [...(sourceGoalsByPassage.get(goal.passageId) ?? []), goal],
  )
  for (const passage of extraction.passages as JsonRecord[]) {
    const goals = sourceGoalsByPassage.get(passage.id) ?? []
    passage.sourceGoalIds = goals.map((goal) => goal.id)
    passage.text = goals.map((goal) => `- ${goal.sourceText}`).join('\n')
  }
  extraction.sourceGoals = sourceGoals
  extraction.method.sourceGoalExtraction = 'Ein Source-Ziel pro fachlichem Kompetenzbullet und ausgewiesenem Schülerexperiment. Projektvorschläge, fachunspezifische Lernorganisationssätze, PDF-Übergangsartefakte, Lernausgangslagen, Seitenköpfe und Formelfragmente werden nicht als eigene Source-Ziele gezählt.'
  extraction.qualityReview.sourceGoalCountPeerBaseline.details = '179 Source-Ziele statt 11 im alten Snapshot. Die Abweichung ist gewollt und gegen geprüfte Physik-Spuren plausibilisiert: HE/BW/HH/MV/BY/SN/ST = 48/101/128/142/296/276/387 Source-Ziele; Thüringen Sek I wird ausschließlich aus fachlichen Kompetenzbullets und ausgewiesenen Schülerexperimenten der Klassenstufen 7-10 extrahiert.'
  const steps = new Map((extraction.pipelineStatus.steps as JsonRecord[])
    .map((step) => [String(step.id), step]))
  const check = (stepId: string, checkId: string): JsonRecord => {
    const value = (steps.get(stepId)?.checks as JsonRecord[] | undefined)
      ?.find((candidate) => candidate.id === checkId)
    if (!value) throw new Error(`Missing TH extraction check ${stepId}/${checkId}`)
    return value
  }
  check('MAPPING-2', 'source-goals-created').details = '179 Source-Ziele'
  check('MAPPING-2', 'source-goal-count-peer-baseline').details = '179 Source-Ziele; HE/BW/HH/MV/BY/SN/ST = 48/101/128/142/296/276/387 Source-Ziele; Thüringen Sek I wird ausschließlich aus fachlichen Kompetenzbullets und ausgewiesenen Schülerexperimenten der Klassenstufen 7-10 extrahiert.'
  check('MAPPING-3', 'mapping-2-complete').details = '179 Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.'
  check('MAPPING-3', 'm3-all-source-goals-reviewed').details = '179/179 Source-Ziele reviewed; offen: 0.'
  check('MAPPING-3', 'm3-all-source-goals-covered-by-canonical').details = 'Abgedeckt: 179/179; keine offenen Canonical-Gaps.'
  const retainedIndices = sourceGoals.map((goal) => Number(goal.bulletIndex))
  if (!retainedIndices.includes(212) || retainedIndices.some((index) => index >= 213)) {
    throw new Error('TH project/stage-boundary filtering did not retain exactly the Sek-I competency range')
  }
  return extraction
}

function buildThReadme(): string {
  const source = readFileSync(absolute(paths.thReadme), 'utf8')
  const next = source.replace(/- Source-Ziele: \d+/u, '- Source-Ziele: 179')
  if (!next.includes('- Source-Ziele: 179')) throw new Error('TH Physics README source-goal count was not updated')
  return next
}

function buildReviewedMapping(path: string): JsonRecord {
  const review = readJson(path)
  if (path === paths.thReview) {
    review.decisions = (review.decisions as JsonRecord[])
      .filter((decision) => !excludedThSourceGoalIds.has(decision.sourceGoalId))
    review.mappings = (review.mappings as JsonRecord[])
      .filter((mapping) => !excludedThSourceGoalIds.has(mapping.legacyGoalId))
  }
  const routes = directRoutes.get(path) ?? {}
  const removals = directRemovals.get(path) ?? {}
  const existingMappings = review.mappings as JsonRecord[]
  const sources = unique([
    ...existingMappings.map((mapping) => String(mapping.legacyGoalId)),
    ...Object.keys(routes),
  ])
  const nextMappings: JsonRecord[] = []
  for (const sourceGoalId of sources) {
    const byTarget = new Map<string, JsonRecord>()
    for (const mapping of existingMappings.filter((entry) => entry.legacyGoalId === sourceGoalId)) {
      if (!splitParents.has(mapping.canonicalGoalId)
        && !(removals[sourceGoalId] ?? []).includes(mapping.canonicalGoalId)) {
        byTarget.set(mapping.canonicalGoalId, mapping)
      }
    }
    for (const route of routes[sourceGoalId] ?? []) {
      const existing = byTarget.get(route.targetGoalId)
      if (existing) existing.matchType = route.matchType
      else byTarget.set(route.targetGoalId, {
        legacyGoalId: sourceGoalId,
        canonicalGoalId: route.targetGoalId,
        matchType: route.matchType,
        reviewDecisionId: sourceGoalId,
      })
    }
    nextMappings.push(...byTarget.values())
  }
  const targetsBySource = new Map<string, string[]>()
  for (const mapping of nextMappings) targetsBySource.set(
    mapping.legacyGoalId, [...(targetsBySource.get(mapping.legacyGoalId) ?? []), mapping.canonicalGoalId],
  )
  for (const decision of review.decisions as JsonRecord[]) {
    const before = decision.canonicalGoalIds ?? []
    const after = targetsBySource.get(decision.sourceGoalId) ?? []
    if (same(before, after)) continue
    decision.canonicalGoalIds = after
    decision.decision = after.length > 0 ? 'mapped' : 'unmapped'
    const labels = (routes[decision.sourceGoalId] ?? []).map((route) => {
      const child = childSpecs.find((spec) => spec.id === route.targetGoalId)
      return child?.title ?? route.targetGoalId
    })
    decision.rationale = labels.length > 0
      ? `Batch-017-Fachreview: Die beiden früheren Sammelziele wurden strukturell entflochten. Diese Quelle stützt direkt oder teilweise ${labels.join('; ')}; fachfremde Altzuordnungen wurden nicht fortgeschrieben, andere bereits geprüfte Ziele bleiben erhalten.`
      : 'Batch-017-Fachreview: Die frühere Sammelzuordnung war für diese Quelle fachlich zu breit. Sie wurde ohne Vererbung auf die neuen Kinder entfernt; andere bereits geprüfte Ziele bleiben erhalten.'
    decision.reviewedAt = reviewDate
    decision.reviewer = reviewer
  }
  if (review.status && typeof review.status === 'object' && !Array.isArray(review.status)) {
    if (path === paths.thReview) {
      review.status.reviewedSourceGoals = 179
      review.status.totalSourceGoals = 179
    }
    review.status.mappedSourceGoals = (review.decisions as JsonRecord[])
      .filter((decision) => (decision.canonicalGoalIds ?? []).length > 0).length
  }
  review.mappings = nextMappings
  if (nextMappings.some((mapping) => splitParents.has(mapping.canonicalGoalId))
    || (review.decisions as JsonRecord[]).some((decision) =>
      (decision.canonicalGoalIds ?? []).some((goalId: string) => splitParents.has(goalId)))) {
    throw new Error(`${path}: split-parent mapping remains`)
  }
  return review
}

function buildHeLegacyMapping(): JsonRecord {
  const mapping = readJson(paths.heLegacy)
  const legacyGoalId = '24350b45-cd48-4c91-b0c6-71480fa1681f'
  const desired = [ids.detection, ids.biologicalEffects, ids.radiationTypes].map((canonicalGoalId) => ({
    legacyGoalId, canonicalGoalId, matchType: 'partial',
  }))
  const retained = (mapping.mappings as JsonRecord[]).filter((entry) => (
    !splitParents.has(entry.canonicalGoalId)
    && !(entry.legacyGoalId === legacyGoalId && desired.some((target) => target.canonicalGoalId === entry.canonicalGoalId))
  ))
  mapping.mappings = [...retained, ...desired]
  if ((mapping.mappings as JsonRecord[]).some((entry) => splitParents.has(entry.canonicalGoalId))) {
    throw new Error('HE legacy mapping retains a split parent')
  }
  return mapping
}

function assertMappingAdjudication(mappings: Map<string, JsonRecord>, canonical: JsonRecord): void {
  const canonicalGoalIds = new Set((canonical.goals as JsonRecord[]).map((goal) => String(goal.id)))
  for (const [path, review] of mappings) {
    if (path === paths.heLegacy) continue
    const edges = review.mappings as JsonRecord[]
    for (const [sourceGoalId, routes] of Object.entries(directRoutes.get(path) ?? {})) {
      for (const route of routes) {
        if (!route || typeof route.targetGoalId !== 'string' || !['exact', 'partial'].includes(route.matchType)) {
          throw new Error(`${path}:${sourceGoalId} has a malformed direct route`)
        }
        if (!canonicalGoalIds.has(route.targetGoalId)) {
          throw new Error(`${path}:${sourceGoalId} routes to missing canonical goal ${route.targetGoalId}`)
        }
        if (!edges.some((edge) => edge.legacyGoalId === sourceGoalId
          && edge.canonicalGoalId === route.targetGoalId && edge.matchType === route.matchType)) {
          throw new Error(`${path}:${sourceGoalId} is missing reviewed route ${route.targetGoalId}`)
        }
      }
    }
    for (const [sourceGoalId, removedTargetGoalIds] of Object.entries(directRemovals.get(path) ?? {})) {
      for (const removedTargetGoalId of removedTargetGoalIds) if (edges.some((edge) => (
        edge.legacyGoalId === sourceGoalId && edge.canonicalGoalId === removedTargetGoalId
      ))) throw new Error(`${path}:${sourceGoalId} retains removed target ${removedTargetGoalId}`)
    }
    if (edges.some((edge) => typeof edge.legacyGoalId !== 'string'
      || typeof edge.canonicalGoalId !== 'string' || !canonicalGoalIds.has(edge.canonicalGoalId))) {
      throw new Error(`${path}: malformed or dangling mapping edge after Batch-017 adjudication`)
    }
  }
}

function buildView(path: string, canonicalLandscape: JsonRecord, semanticKindLedger: JsonRecord): JsonRecord {
  const view = readJson(path)
  const structuralAdjudication = structuralViewPaths.includes(path)
  const hits = new Map<string, number>()
  let removedUpperRadiationHits = 0
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk).filter((entry) => entry !== undefined)
    if (!value || typeof value !== 'object') return value
    const record = value as JsonRecord
    if (structuralAdjudication
      && (path.includes('/de-bw-') || path.includes('/de-by-'))
      && record.goalId === ids.upperRadiation) {
      removedUpperRadiationHits += 1
      return undefined
    }
    const next = Object.fromEntries(Object.entries(record).map(([key, nested]) => [key, walk(nested)])) as JsonRecord
    if (structuralAdjudication && path.includes('/de-by-')
      && record.kind === 'goalEntry'
      && record.goalId === ids.radiationTypes) {
      next.kind = 'canonicalSubtree'
      next.goalId = ids.decayCluster
    }
    if (structuralAdjudication && splitParents.has(String(record.goalId))) {
      if (!['goalEntry', 'canonicalSubtree'].includes(String(record.kind))) {
        throw new Error(`${path}: unsupported split-parent node kind ${String(record.kind)}`)
      }
      hits.set(record.goalId, (hits.get(record.goalId) ?? 0) + 1)
      if (path.includes('/de-bw-') && record.goalId === ids.detectionCluster) {
        next.kind = 'goalEntry'
        next.goalId = ids.biologicalEffects
      } else {
        next.kind = 'canonicalSubtree'
      }
    }
    return next
  }
  const result = walk(view) as JsonRecord
  const jurisdiction = String(result.scope?.jurisdiction ?? '')
  const assessmentScope = ['SekI', 'CrossStage'].includes(String(result.scope?.stage))
  const curricularAreaGoalIds = new Set((semanticKindLedger.decisions as JsonRecord[])
    .filter((decision) => decision.decisionStatus === 'authoritative'
      && decision.semanticKind === 'curricularArea')
    .map((decision) => String(decision.goalId)))
  const removeOpaqueCurricularAreaEntries = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(removeOpaqueCurricularAreaEntries).filter((entry) => entry !== undefined)
    }
    if (!value || typeof value !== 'object') return value
    const node = value as JsonRecord
    if (node.kind === 'goalEntry' && curricularAreaGoalIds.has(String(node.goalId))) {
      return undefined
    }
    for (const [key, nested] of Object.entries(node)) node[key] = removeOpaqueCurricularAreaEntries(nested)
    return node
  }
  result.rootNodes = removeOpaqueCurricularAreaEntries(result.rootNodes)
  const removeRedundantSupplementAreas = (value: unknown): void => {
    if (Array.isArray(value)) { value.forEach(removeRedundantSupplementAreas); return }
    if (!value || typeof value !== 'object') return
    const node = value as JsonRecord
    if (node.kind === 'structure'
      && typeof node.id === 'string'
      && node.id.endsWith('-source-extraction-supplements')
      && Array.isArray(node.children)) {
      node.children = (node.children as JsonRecord[]).filter((child) => (
        !curricularAreaGoalIds.has(String(child.goalId))
      ))
    }
    Object.values(node).forEach(removeRedundantSupplementAreas)
  }
  removeRedundantSupplementAreas(result.rootNodes)
  const countGoalId = (goalId: string): number => {
    let count = 0
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) { value.forEach(visit); return }
      if (!value || typeof value !== 'object') return
      const record = value as JsonRecord
      if (record.goalId === goalId) count += 1
      Object.values(record).forEach(visit)
    }
    visit(result)
    return count
  }
  for (const parentId of structuralAdjudication ? splitParents : []) {
    if (path.includes('/de-bw-') && parentId === ids.detectionCluster) {
      if (countGoalId(ids.biologicalEffects) !== 1) {
        throw new Error(`${path}: expected exactly one biological-effects replacement`)
      }
    } else if (path.includes('/de-by-') && parentId === ids.decayCluster) {
      if (countGoalId(ids.decayCluster) !== 1) {
        throw new Error(`${path}: expected exactly one restored decay-radiation subtree`)
      }
    } else if ((hits.get(parentId) ?? 0) !== 1) {
      throw new Error(`${path}: expected exactly one reference to ${parentId}`)
    }
  }
  if (structuralAdjudication && (path.includes('/de-bw-') || path.includes('/de-by-'))
    && (removedUpperRadiationHits > 1 || countGoalId(ids.upperRadiation) !== 0)) {
    throw new Error(`${path}: redundant upper-radiation entry remains or is duplicated`)
  }
  if (structuralAdjudication && path.includes('/de-by-')) {
    const roots = (result.rootNodes as JsonRecord[] | undefined)?.filter((node) => node.id === 'physics-root') ?? []
    if (roots.length !== 1 || !Array.isArray(roots[0].children)) throw new Error(`${path}: missing Physics root`)
    const children = roots[0].children as JsonRecord[]
    roots[0].children = children.filter((node) => !(
      node.goalId === ids.fissionFusion && node.projectionRole === 'prerequisiteOnly'
    ))
  }
  if (structuralAdjudication && path.includes('/de-bw-')) {
    let atomModelPlacements = 0
    const injectNuclideGoal = (nodes: JsonRecord[]): void => {
      for (const node of nodes) if (Array.isArray(node.children)) injectNuclideGoal(node.children)
      const retained = nodes.filter((node) => node.goalId !== ids.nuclideNotation)
      nodes.splice(0, nodes.length, ...retained)
      const atomModelIndex = nodes.findIndex((node) => node.goalId === ids.atomModel)
      if (atomModelIndex < 0) return
      atomModelPlacements += 1
      nodes.splice(atomModelIndex + 1, 0, { kind: 'goalEntry', goalId: ids.nuclideNotation })
    }
    injectNuclideGoal(result.rootNodes ?? [])
    if (atomModelPlacements !== 1) throw new Error(`${path}: expected exactly one atom-model anchor for nuclide notation`)
  }

  // Broad canonical subtrees intentionally remain the navigation backbone, but
  // they must not promote this source-limited child into unrelated countries.
  // A direct prerequisite-only reference is more specific than an inherited
  // subtree target and therefore expresses the reviewed local exclusion without
  // duplicating or restructuring the shared nuclear-physics subtree.
  if (assessmentScope && jurisdiction && jurisdiction !== 'DE-BY'
    && !nuclideNotationJurisdictions.includes(jurisdiction)) {
    const roots = (result.rootNodes as JsonRecord[] | undefined)?.filter((node) => node.id === 'physics-root') ?? []
    if (roots.length !== 1 || !Array.isArray(roots[0].children)) throw new Error(`${path}: missing Physics root`)
    const rootChildren = (roots[0].children as JsonRecord[]).filter((node) => !(
      node.kind === 'goalEntry' && node.goalId === ids.nuclideNotation
    ))
    const firstTargetIndex = rootChildren.findIndex((node) => node.projectionRole !== 'prerequisiteOnly')
    rootChildren.splice(firstTargetIndex < 0 ? rootChildren.length : firstTargetIndex, 0, {
      kind: 'goalEntry',
      goalId: ids.nuclideNotation,
      projectionRole: 'prerequisiteOnly',
    })
    roots[0].children = rootChildren
  }

  const canonicalById = new Map((canonicalLandscape.goals as JsonRecord[])
    .map((goal) => [String(goal.id), goal]))
  const authoritativeGoalIds = new Set<string>()
  const addCanonicalSubtree = (goalId: string): void => {
    if (authoritativeGoalIds.has(goalId)) return
    authoritativeGoalIds.add(goalId)
    for (const childId of canonicalById.get(goalId)?.contains ?? []) addCanonicalSubtree(String(childId))
  }
  const practiceStructures: JsonRecord[] = []
  const collect = (nodes: JsonRecord[]): void => {
    for (const node of nodes) {
      if (node.kind === 'structure') {
        if (node.id === 'physics-seki-practice-assessments') {
          practiceStructures.push(node)
          continue
        }
        if (Array.isArray(node.children)) collect(node.children)
        continue
      }
      if (typeof node.goalId !== 'string') continue
      if (node.kind === 'canonicalSubtree') addCanonicalSubtree(node.goalId)
      else if (node.kind === 'goalEntry') authoritativeGoalIds.add(node.goalId)
    }
  }
  collect(result.rootNodes ?? [])
  if (assessmentScope) {
    if (practiceStructures.length !== 1 || !Array.isArray(practiceStructures[0].children)) {
      throw new Error(`${path}: expected exactly one Sek-I practice structure`)
    }
    const practice = practiceStructures[0]
    practice.children = (practice.children as JsonRecord[])
      .filter((node) => ![ids.nuclideNotationAssessment, ids.radiationEvidenceAssessment].includes(node.goalId))
    let offset = 1
    for (const spec of [nuclideNotationAssessmentSpec, radiationEvidenceAssessmentSpec]) {
      const prerequisitesComplete = spec.requires.every((goalId) => authoritativeGoalIds.has(goalId))
      const jurisdictionApplicable = jurisdiction === '' || spec.requires.every((goalId) => (
        (canonicalById.get(goalId)?.applicability?.jurisdiction as string[] | undefined)?.includes(jurisdiction) === true
      ))
      if (!prerequisitesComplete || !jurisdictionApplicable) continue
      const anchorIndex = (practice.children as JsonRecord[])
        .findIndex((node) => node.goalId === '77b23e86-c39f-589e-8460-b28883baea51')
      if (anchorIndex < 0) throw new Error(`${path}: missing radiation-risk practice-placement anchor`)
      practice.children.splice(anchorIndex + offset, 0, { kind: 'goalEntry', goalId: spec.id })
      offset += 1
    }
  } else if (practiceStructures.length > 0) {
    throw new Error(`${path}: Sek-II-only view unexpectedly contains a Sek-I practice structure`)
  }
  return result
}

function buildProvenance(mappings: Map<string, JsonRecord>): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[]).find((entry) => entry.landscapeId === physicsLandscapeId)
  if (!landscape?.goalProvenance) throw new Error('Missing canonical Physics provenance landscape')
  const preferredSourceGoalIds: Record<string, string> = {
    [ids.nuclideNotation]: 'mv-phys-seki-rp2022-j10-kernphysik-002-f0143df5',
    [ids.detection]: 'hh-physics-seki-bp2022-3-2-licht-materie-117-a3d9cd7c',
    [ids.biologicalEffects]: 'bw-phys-seki-3-3-4-b03-a01-7266562e',
    [ids.radiationTypes]: 'hh-physics-seki-bp2022-3-2-licht-materie-118-cc7669a0',
    [ids.halfLife]: 'hh-physics-seki-bp2022-3-2-licht-materie-119-97ad97a7',
  }
  for (const childId of childIds) {
    const sources: Array<{ sourceLandscapeId: string; sourceGoalId: string }> = []
    for (const [path, review] of mappings) {
      if (path === paths.heLegacy) continue
      for (const edge of review.mappings as JsonRecord[]) if (edge.canonicalGoalId === childId) {
        sources.push({ sourceLandscapeId: review.sourceLandscapeId, sourceGoalId: edge.legacyGoalId })
      }
    }
    const preferred = sources.find((source) => source.sourceGoalId === preferredSourceGoalIds[childId])
    if (!preferred) throw new Error(`Missing preferred direct provenance source for ${childId}`)
    const additionalSourceLandscapeIds = unique(sources.map((source) => source.sourceLandscapeId)
      .filter((sourceLandscapeId) => sourceLandscapeId !== preferred.sourceLandscapeId)).sort()
    landscape.goalProvenance[childId] = {
      sourceLandscapeId: preferred.sourceLandscapeId,
      sourceGoalId: preferred.sourceGoalId,
      ...(additionalSourceLandscapeIds.length > 0 ? { additionalSourceLandscapeIds } : {}),
    }
  }
  landscape.goalProvenance = Object.fromEntries(Object.entries(landscape.goalProvenance)
    .sort(([left], [right]) => left.localeCompare(right)))
  return registry
}

function buildSurrogate(): JsonRecord {
  const registry = readJson(paths.surrogate)
  const candidates = (registry.entries as JsonRecord[]).filter((entry) => (
    entry.landscapeId === physicsLandscapeId
    && entry.goalId === ids.atomModel
    && [ids.decayCluster, ids.radiationTypes].includes(entry.requiredByGoalId)
    && entry.jurisdiction === 'DE-BY'
    && entry.status === 'accepted'
  ))
  if (candidates.length !== 1) throw new Error(`Expected one accepted BY atom-model surrogate, found ${candidates.length}`)
  candidates[0].requiredByGoalId = ids.radiationTypes
  candidates[0].rationale = 'Bayern Physik: Das learner-facing Ziel "Alpha-, Beta- und Gammastrahlung unterscheiden" macht "Kern und Elektronenhülle als Bestandteile eines Atommodells beschreiben und die Größenordnungen von Atom- und Kerndurchmesser vergleichen" als kanonische prerequisite bridge sichtbar; akzeptiert als didaktische requires-closure-Brücke, nicht als zusätzliches originales Lehrplanziel.'
  if ((registry.entries as JsonRecord[]).some((entry) => (
    entry.landscapeId === physicsLandscapeId && entry.status === 'accepted'
    && splitParents.has(entry.requiredByGoalId)
  ))) throw new Error('Accepted Physics surrogate still points to a split parent')
  return registry
}

function buildVisualizationQa(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.visualizationQa)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const byId = new Map((ledger.records as JsonRecord[]).map((record) => [String(record.goalId), record]))
  for (const goalId of [ids.atomModel, ids.detectionCluster, ids.application, ids.decayCluster, ids.fissionFusion]) {
    const goal = goalById.get(goalId)!
    const record = byId.get(goalId)
    if (!record) throw new Error(`Missing existing visualization-QA record ${goalId}`)
    record.title = goal.title
    record.description = goal.description
  }
  for (const goalId of [ids.atomModel, ids.application]) {
    const record = byId.get(goalId)!
    record.aiReviewedAt = '2026-08-28T12:00:00.000Z'
    record.aiReviewer = reviewer
    record.aiApproved = 'yes'
    record.aiApprovedAssetSha256 = record.assetSha256
    record.aiNotes = goalId === ids.atomModel
      ? 'Batch-017-Neusichtung des unveränderten Originalassets: Kern und Elektronenhülle sind fachlich korrekt dargestellt; der sichtbare Hinweis auf fehlende Maßstäblichkeit verhindert eine falsche Größenablesung. Das Bild unterstützt damit den Modellbestandteil, während der geforderte Größenordnungsvergleich weiterhin mit Zahlen- oder Maßstabsdaten im Coaching erfolgen muss.'
      : 'Batch-017-Neusichtung des unveränderten Originalassets: Medizin, Materialprüfung und Kerntechnik sowie Nutzen, Strahlenrisiken und die Schutzprinzipien Zeit, Abstand und Abschirmung sind als qualitative Bewertungsdimensionen fachlich stimmig dargestellt. Konkrete Einsatzbedingungen und explizite Kriterien werden in der Aufgabe ergänzt.'
  }
  for (const parentId of splitParents) {
    const record = byId.get(parentId)!
    record.aiReviewedAt = '2026-08-28T12:00:00.000Z'
    record.aiReviewer = reviewer
    record.aiApproved = 'yes'
    record.aiApprovedAssetSha256 = record.assetSha256
    record.aiNotes = parentId === ids.detectionCluster
      ? 'Batch-017-Neusichtung des bytegleichen Nano-Banana-Pro-Assets als Clusterübersicht: Detektor, Gewebewirkung sowie Zeit, Abstand und Abschirmung bleiben fachlich stimmig. Die Strahlungsarten-Systematik wird curricular ausschließlich im separaten Kind des anderen Clusters geführt und aus diesem Übersichtsbild nicht als Nachweisziel abgeleitet.'
      : 'Batch-017-Neusichtung des bytegleichen Nano-Banana-Pro-Assets als Clusterübersicht: Alpha-, Beta-minus- und Gammastrahlung, qualitative Abschirmreihenfolge sowie die Halbwertszeitfolge 16 zu 8 zu 4 bleiben fachlich korrekt und passen zu den beiden neuen atomaren Kindern.'
  }
  for (const childId of childIds) {
    const goal = goalById.get(childId)!
    byId.set(childId, {
      goalId: childId,
      title: goal.title,
      description: goal.description,
      subject: 'physik',
      landscapeId: physicsLandscapeId,
      landscapePath: paths.canonical,
      visualizationState: 'missing',
      missingReason: 'deferred_provider_limitation',
      imageUrl: '',
      publicAssetPath: '',
      canonicalAssetPath: '',
      assetSha256: '',
      umlautsCorrectChatGpt: 'no',
      contentApprovedChatGpt: 'no',
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      humanIssueDescription: '',
      chatGptReviewedAt: null,
      chatGptReviewer: '',
      chatGptNotes: '',
      humanReviewedAt: null,
      humanReviewer: '',
    })
  }
  ledger.records = [...byId.values()].sort((left, right) => (
    String(left.title).localeCompare(String(right.title), 'de-DE', { numeric: true, sensitivity: 'base' })
    || String(left.goalId).localeCompare(String(right.goalId))
  ))
  if (ledger.records.length !== 461) throw new Error(`Unexpected visualization-QA count ${ledger.records.length}`)
  return ledger
}

function ensureThNonSubjectSourceBulletFilter(source: string): string {
  const marker = '// Batch 017 TH non-subject source-bullet filter.'
  const anchor = 'const buildExtraction = (config: ExtractionConfig) => {'
  const helper = `${marker} This is a defensive second
// boundary behind parse2012: project suggestions and the page-25 introduction
// to the upper-secondary 11S phase are not Sek-I competencies.
// The loop still enumerates the unfiltered bullet list so retained IDs stay stable.
const isNonSubjectSourceBullet = (bullet: SourceBullet): boolean => {
  if (bullet.stage !== 'SekI') return false
  if (bullet.competencyArea === 'Projektvorschläge') return true
  return bullet.code === 'TH-2-2-3-radioaktivitat' && bullet.page >= 25
}

${anchor}`
  if (source.includes(marker)) {
    const start = source.indexOf(marker)
    const end = source.indexOf(`\n\n${anchor}`, start)
    if (end < 0) throw new Error('TH generator source filter is unterminated')
    source = `${source.slice(0, start)}${helper}${source.slice(end + 2 + anchor.length)}`
  } else {
    const count = source.split(anchor).length - 1
    if (count !== 1) throw new Error(`TH generator source filter expected one buildExtraction anchor, found ${count}`)
    source = source.replace(anchor, helper)
  }
  const oldBoundary = '      if (!currentTopic || isJunkLine(line)) continue'
  const desiredBoundary = `      if (!currentTopic) continue
      if (/^Projektvorschläge/u.test(line)) {
        finishBullet()
        currentArea = 'Projektvorschläge'
        continue
      }
      if (isJunkLine(line)) continue`
  if (source.includes(oldBoundary)) source = source.replace(oldBoundary, desiredBoundary)
  const resetBoundary = `      if (/^3 Ziele des Kompetenzerwerbs in der Einführungsphase/u.test(line)) {
        finishBullet()
        currentTopic = undefined
        currentArea = ''
        continue
      }
      if (!currentTopic) continue
      if (/^Projektvorschläge/u.test(line)) {
        finishBullet()
        currentArea = ''
        continue
      }
      if (isJunkLine(line)) continue`
  if (source.includes(resetBoundary)) source = source.replace(resetBoundary, desiredBoundary)
  if (!source.includes(desiredBoundary)) throw new Error('TH generator project/stage boundary is not stable')
  source = source.replace(
    'beschleunigung|fall|wurf|hebel|gewicht/u.test(text)',
    'beschleunigung|\\bfall\\b|wurf|hebel|gewicht/u.test(text)',
  )
  source = source.replace(
    '/licht|optik|strahl|spiegel|linse|brechung|reflexion|bild/u.test(text)',
    '/licht|optik|\\bstrahl\\b|spiegel|linse|brechung|reflexion|bild/u.test(text)',
  )
  if (!source.includes('beschleunigung|\\bfall\\b|wurf|hebel|gewicht/u.test(text)')
    || !source.includes('/licht|optik|\\bstrahl\\b|spiegel|linse|brechung|reflexion|bild/u.test(text)')) {
    throw new Error('TH generator subject-keyword boundaries are not hardened')
  }
  const loopAnchor = '  for (const [bulletIndex, bullet] of stageBullets.entries()) {\n'
  const filteredLoopAnchor = `${loopAnchor}    if (isNonSubjectSourceBullet(bullet)) continue\n`
  if (!source.includes(filteredLoopAnchor)) {
    const count = source.split(loopAnchor).length - 1
    if (count !== 1) throw new Error(`TH generator source filter expected one bullet loop, found ${count}`)
    source = source.replace(loopAnchor, filteredLoopAnchor)
  }
  const oldMethod = 'Ein Source-Ziel pro Kompetenzbullet und ausgewiesenem Schülerexperiment. Projektvorschläge, Lernausgangslagen, Seitenköpfe und Formelfragmente werden nicht als eigene Source-Ziele gezählt.'
  const newMethod = 'Ein Source-Ziel pro fachlichem Kompetenzbullet und ausgewiesenem Schülerexperiment. Projektvorschläge, fachunspezifische Lernorganisationssätze, PDF-Übergangsartefakte, Lernausgangslagen, Seitenköpfe und Formelfragmente werden nicht als eigene Source-Ziele gezählt.'
  if (!source.includes(newMethod) && source.includes(oldMethod)) source = source.replace(oldMethod, newMethod)
  if (!source.includes(newMethod)) throw new Error('TH generator source-goal extraction contract is missing the reviewed exclusions')
  return source
}

function finalizeThGeneratorOverlay(source: string): string {
  source = ensureThNonSubjectSourceBulletFilter(source)
  const normalizationMarker = '// Batch 017 TH reviewed-empty-target normalization'
  if (source.includes(normalizationMarker)) return source
  const replaceRequired = (before: string, after: string): void => {
    const count = source.split(before).length - 1
    if (count !== 1) throw new Error(`TH generator normalization expected one match, found ${count}: ${before.slice(0, 80)}`)
    source = source.replace(before, after)
  }
  replaceRequired('type MappingDecision = {', `${normalizationMarker}\ntype MappingDecision = {`)
  replaceRequired("  decision: 'mapped'\n  canonicalGoalIds: string[]", "  decision: 'mapped' | 'unmapped'\n  canonicalGoalIds: string[]")
  replaceRequired(
    '    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config.stage))',
    `    const inferredCanonicalGoalIds = inferCanonicalGoalIds(sourceGoal, config.stage)
    const batch017Touched = inferredCanonicalGoalIds.some((goalId) => batch017SplitParentIds.has(goalId))
      || batch017TargetsBySourceGoalId[sourceGoal.id] !== undefined
    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferredCanonicalGoalIds)
    const batch017Labels = (batch017TargetsBySourceGoalId[sourceGoal.id] ?? []).map((goalId) => ({
      '${ids.nuclideNotation}': '${childSpecs.find((spec) => spec.id === ids.nuclideNotation)!.title}',
      '${ids.detection}': '${childSpecs.find((spec) => spec.id === ids.detection)!.title}',
      '${ids.biologicalEffects}': '${childSpecs.find((spec) => spec.id === ids.biologicalEffects)!.title}',
      '${ids.radiationTypes}': '${childSpecs.find((spec) => spec.id === ids.radiationTypes)!.title}',
      '${ids.halfLife}': '${childSpecs.find((spec) => spec.id === ids.halfLife)!.title}',
    }[goalId] ?? goalId))`,
  )
  replaceRequired("      decision: 'mapped',", "      decision: canonicalGoalIds.length > 0 ? 'mapped' : 'unmapped',")
  replaceRequired(
    `      rationale:
        canonicalGoalIds.length > 1
          ? 'Das amtliche Thüringen-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
          : 'Das amtliche Thüringen-Source-Ziel ist inhaltlich durch den angegebenen kanonischen Physik-Teilbaum abgedeckt; die Zuordnung auf ein Sammelziel ist eine fachliche Abdeckungsentscheidung.',
      reviewedAt: '2026-05-11',
      reviewer: 'codex',`,
    `      rationale: batch017Touched
        ? batch017Labels.length > 0
          ? \`Batch-017-Fachreview: Die beiden früheren Sammelziele wurden strukturell entflochten. Diese Quelle stützt direkt oder teilweise \${batch017Labels.join('; ')}; fachfremde Altzuordnungen wurden nicht fortgeschrieben, andere bereits geprüfte Ziele bleiben erhalten.\`
          : 'Batch-017-Fachreview: Die frühere Sammelzuordnung war für diese Quelle fachlich zu breit. Sie wurde ohne Vererbung auf die neuen Kinder entfernt; andere bereits geprüfte Ziele bleiben erhalten.'
        : canonicalGoalIds.length > 1
          ? 'Das amtliche Thüringen-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
          : 'Das amtliche Thüringen-Source-Ziel ist inhaltlich durch den angegebenen kanonischen Physik-Teilbaum abgedeckt; die Zuordnung auf ein Sammelziel ist eine fachliche Abdeckungsentscheidung.',
      reviewedAt: batch017Touched ? '${reviewDate}' : '2026-05-11',
      reviewer: batch017Touched ? '${reviewer}' : 'codex',`,
  )
  replaceRequired(
    '      mappedSourceGoals: sourceGoals.length,',
    "      mappedSourceGoals: decisions.filter((decision) => decision.decision === 'mapped').length,",
  )
  return source
}

function finalizeStringGeneratorRemovals(
  source: string,
  path: string,
  removals: Record<string, string[]>,
): string {
  if (Object.keys(removals).length === 0 || source.includes('const batch017RemovedTargetsBySourceGoalId')) {
    return source
  }
  const anchor = 'const applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => ['
  const anchorCount = source.split(anchor).length - 1
  if (anchorCount !== 1) throw new Error(`${path}: expected one Batch-017 removal anchor, found ${anchorCount}`)
  source = source.replace(
    anchor,
    `const batch017RemovedTargetsBySourceGoalId: Record<string, string[]> = ${JSON.stringify(removals, null, 2)}\n\n${anchor}`,
  )
  const before = '...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId) && !batch017SplitParentIds.has(goalId)),'
  const beforeCount = source.split(before).length - 1
  if (beforeCount !== 1) throw new Error(`${path}: expected one Batch-017 removal filter, found ${beforeCount}`)
  return source.replace(
    before,
    '...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId) && !batch017SplitParentIds.has(goalId) && !(batch017RemovedTargetsBySourceGoalId[sourceGoalId] ?? []).includes(goalId)),',
  )
}

function refreshBatch017GeneratorTargets(
  source: string,
  path: string,
  additions: Record<string, unknown>,
): string {
  const declaration = path === 'app/scripts/generateByPhysicsSourceExtraction.ts'
    ? "const batch017TargetsBySourceGoalId: Record<string, Array<{ targetGoalId: string; matchType: 'exact' | 'partial' }>> = "
    : 'const batch017TargetsBySourceGoalId: Record<string, string[]> = '
  const start = source.indexOf(declaration)
  if (start < 0) throw new Error(`${path}: missing Batch-017 target declaration`)
  const valueStart = start + declaration.length
  const valueEnd = source.indexOf('\n\n', valueStart)
  if (valueEnd < 0) throw new Error(`${path}: unterminated Batch-017 target declaration`)
  const desired = JSON.stringify(additions, null, 2)
  return source.slice(valueStart, valueEnd) === desired
    ? source
    : `${source.slice(0, valueStart)}${desired}${source.slice(valueEnd)}`
}

function buildGeneratorOverlay(
  path: string,
  routes: Record<string, RouteTarget[]>,
  removals: Record<string, string[]>,
): string {
  let source = readFileSync(absolute(path), 'utf8')
  const assertAtomicSupplementTargets = (candidate: string): string => {
    if ([
      'app/scripts/generateMvPhysicsSourceExtraction.ts',
      'app/scripts/generateSlPhysicsSourceExtraction.ts',
      'app/scripts/generateSnPhysicsSourceExtraction.ts',
      'app/scripts/generateStPhysicsSourceExtraction.ts',
    ].includes(path) && !candidate.includes(
      "const allowedTargets = candidateTargets.filter((goalId) => canonicalGoalById.get(goalId)?.type === 'atomic').filter((goalId) => {",
    )) {
      throw new Error(`${path}: supplemental composition targets are not restricted to atomic goals`)
    }
    return candidate
  }
  const marker = '// Batch 017 nuclear structural adjudication overlay'
  const additions = Object.fromEntries(Object.entries(routes).map(([sourceGoalId, targets]) => [
    sourceGoalId,
    path === 'app/scripts/generateByPhysicsSourceExtraction.ts'
      ? targets
      : targets.map((target) => target.targetGoalId),
  ]))
  if (source.includes(marker)) {
    source = refreshBatch017GeneratorTargets(source, path, additions)
    source = finalizeStringGeneratorRemovals(source, path, removals)
    return assertAtomicSupplementTargets(path === 'app/scripts/generateThPhysicsSourceExtraction.ts'
      ? finalizeThGeneratorOverlay(source)
      : source)
  }
  if (path === 'app/scripts/generateByPhysicsSourceExtraction.ts') {
    const anchor = 'const applyPhysicsBatch015Targets = ('
    const helper = `${marker}\nconst batch017SplitParentIds = new Set(${JSON.stringify([...splitParents])})\nconst batch017TargetsBySourceGoalId: Record<string, Array<{ targetGoalId: string; matchType: 'exact' | 'partial' }>> = ${JSON.stringify(additions, null, 2)}\n\n`
    if (!source.includes(anchor)) throw new Error(`${path}: missing BY overlay anchor`)
    source = source.replace(anchor, `${helper}${anchor}`)
    source = source.replace(
      'const retained = targets.filter((target) => !batch015SplitParentIds.has(target.canonicalGoalId))',
      'const retained = targets.filter((target) => !batch015SplitParentIds.has(target.canonicalGoalId) && !batch017SplitParentIds.has(target.canonicalGoalId))',
    )
    const before = '  for (const addition of batch015TargetsBySourceGoalId[sourceGoalId] ?? []) {\n    const existing = retained.find((target) => target.canonicalGoalId === addition.targetGoalId)\n    if (existing) existing.matchType = addition.matchType\n    else retained.push({ canonicalGoalId: addition.targetGoalId, matchType: addition.matchType })\n  }\n  return retained'
    const after = '  for (const addition of batch015TargetsBySourceGoalId[sourceGoalId] ?? []) {\n    const existing = retained.find((target) => target.canonicalGoalId === addition.targetGoalId)\n    if (existing) existing.matchType = addition.matchType\n    else retained.push({ canonicalGoalId: addition.targetGoalId, matchType: addition.matchType })\n  }\n  for (const addition of batch017TargetsBySourceGoalId[sourceGoalId] ?? []) {\n    const existing = retained.find((target) => target.canonicalGoalId === addition.targetGoalId)\n    if (existing) existing.matchType = addition.matchType\n    else retained.push({ canonicalGoalId: addition.targetGoalId, matchType: addition.matchType })\n  }\n  return retained'
    if (!source.includes(before)) throw new Error(`${path}: missing BY overlay function body`)
    return assertAtomicSupplementTargets(source.replace(before, after))
  }
  const anchor = 'const applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => ['
  const helper = `${marker}\nconst batch017SplitParentIds = new Set(${JSON.stringify([...splitParents])})\nconst batch017TargetsBySourceGoalId: Record<string, string[]> = ${JSON.stringify(additions, null, 2)}\n\n`
  if (!source.includes(anchor)) throw new Error(`${path}: missing string overlay anchor`)
  source = source.replace(anchor, `${helper}${anchor}`)
  source = source.replace(
    '...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId)),',
    '...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId) && !batch017SplitParentIds.has(goalId)),',
  )
  source = source.replace(
    '...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),',
    '...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),\n    ...(batch017TargetsBySourceGoalId[sourceGoalId] ?? []),',
  )
  source = finalizeStringGeneratorRemovals(source, path, removals)
  return assertAtomicSupplementTargets(path === 'app/scripts/generateThPhysicsSourceExtraction.ts'
    ? finalizeThGeneratorOverlay(source)
    : source)
}

function buildPhysicsInputTest(): string {
  let source = readFileSync(absolute(paths.physicsInputTest), 'utf8')
  const countFields: Array<{ field: string; before: number[]; after: number }> = [
    { field: 'curricularAtomic', before: [444, 446], after: 447 },
    { field: 'curricularArea', before: [90], after: 92 },
    { field: 'practiceAssessment', before: [130, 131, 132], after: 133 },
    { field: 'total', before: [676, 680, 681], after: 683 },
  ]
  for (const { field, before, after } of countFields) {
    const desired = `  ${field}: ${after},`
    if (source.includes(desired)) continue
    const candidates = before.map((value) => `  ${field}: ${value},`)
    const matches = candidates.filter((candidate) => source.includes(candidate))
    if (matches.length !== 1) {
      throw new Error(`${paths.physicsInputTest}: expected one ${field} before state, found ${matches.length}`)
    }
    source = source.replace(matches[0], desired)
  }
  const routeMetricConstants: Array<[string, number]> = [
    ['EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES', 6387],
    ['EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES', 6215],
    ['EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_OCCURRENCES', 172],
    ['EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_UNIQUE_GOALS', 57],
  ]
  for (const [name, expected] of routeMetricConstants) {
    const pattern = new RegExp(`const ${name} = \\d+`, 'u')
    if (!pattern.test(source)) throw new Error(`${paths.physicsInputTest}: missing ${name}`)
    source = source.replace(pattern, `const ${name} = ${expected}`)
  }
  const appendSetIds = (setName: string, anchorId: string, additions: readonly string[]): void => {
    const missing = additions.filter((goalId) => !source.includes(`  '${goalId}',`))
    if (missing.length === 0) return
    const anchor = `  '${anchorId}',`
    const count = source.split(anchor).length - 1
    if (count !== 1) throw new Error(`${paths.physicsInputTest}: expected one ${setName} anchor ${anchorId}, found ${count}`)
    source = source.replace(anchor, `${anchor}\n${missing.map((goalId) => `  '${goalId}',`).join('\n')}`)
  }
  appendSetIds('STRUCTURAL_SPLIT_ATOMIC_GOAL_IDS', '27b90ce9-b650-5232-85fb-ce2cb69d59a3', childIds)
  appendSetIds('STRUCTURAL_SPLIT_CLUSTER_GOAL_IDS', '50431e92-eec9-54d6-b437-ea7a51b6f474', [...splitParents])
  appendSetIds(
    'POST_SPLIT_PRACTICE_ASSESSMENT_GOAL_IDS',
    '4996346f-ab5d-4d09-9b9e-b9e559af153d',
    [ids.nuclideNotationAssessment, ids.radiationEvidenceAssessment],
  )
  return source
}

const visualizationReview = `# Physik goal visualization review – Batch 079\n\nReview date: ${reviewDate}\n\nScope: Batch-017-Strukturkinder der Atom- und Kernphysik. In diesem Layer-A-Strukturschritt wurden keine neuen Bilder erzeugt. Die vorhandenen Nano-Banana-Pro-Übersichten bleiben bytegleich an den stabilen Elternclustern; für die fünf neuen Atome wird keine Visualisierung behauptet.\n\n| Goal ID | Goal title | Decision | Notes |\n|---|---|---|---|\n${childSpecs.map((spec) => `| \`${spec.id}\` | ${spec.title} | \`deferred_provider_limitation\` | Kein eigenes Bild im eng begrenzten Strukturschritt; spätere Erzeugung bleibt einem fachlich geprüften Nano-Banana-Pro-Lauf vorbehalten. |`).join('\n')}\n`

for (const spec of childSpecs) if (deterministicPhysicsGoalId(spec.shortKey) !== spec.id) {
  throw new Error(`Deterministic Physics goal ID mismatch for ${spec.shortKey}`)
}
if (deterministicPhysicsGoalId(radiationEvidenceAssessmentSpec.shortKey) !== ids.radiationEvidenceAssessment) {
  throw new Error(`Deterministic Physics assessment ID mismatch for ${radiationEvidenceAssessmentSpec.shortKey}`)
}
if (deterministicPhysicsGoalId(nuclideNotationAssessmentSpec.shortKey) !== ids.nuclideNotationAssessment) {
  throw new Error(`Deterministic Physics assessment ID mismatch for ${nuclideNotationAssessmentSpec.shortKey}`)
}
const nuclideNotationScoreTotal = nuclideNotationAssessmentSpec.scoring.steps
  .reduce((sum, step) => sum + step.points, 0)
if (nuclideNotationScoreTotal !== nuclideNotationAssessmentSpec.scoring.maxPoints) {
  throw new Error(`Nuclide-notation assessment score total ${nuclideNotationScoreTotal} does not match maxPoints`)
}
const radiationEvidenceScoreTotal = radiationEvidenceAssessmentSpec.scoring.steps
  .reduce((sum, step) => sum + step.points, 0)
if (radiationEvidenceScoreTotal !== radiationEvidenceAssessmentSpec.scoring.maxPoints) {
  throw new Error(`Radiation evidence assessment score total ${radiationEvidenceScoreTotal} does not match maxPoints`)
}
assertBeforeHashes()
const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildLeafReviewLedger(canonical, 'atomicity')
const memory = buildLeafReviewLedger(canonical, 'memory')
const atlas = readJson(paths.atlas)
if (![444, 446, 447].includes(Number(atlas.expectedCurricularAtomicGoalCount))) {
  throw new Error(`Unexpected Physics atlas denominator ${String(atlas.expectedCurricularAtomicGoalCount)}`)
}
atlas.expectedCurricularAtomicGoalCount = 447
const mappings = new Map<string, JsonRecord>()
for (const path of mappingPaths) mappings.set(path, path === paths.heLegacy ? buildHeLegacyMapping() : buildReviewedMapping(path))
assertMappingAdjudication(mappings, canonical)
const views = new Map(viewPaths.map((path) => [path, buildView(path, canonical, semanticKinds)]))
const countViewPlacements = (goalId: string): number => [...views.values()].filter((view) => {
  let found = false
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) { value.forEach(visit); return }
    if (!value || typeof value !== 'object') return
    const record = value as JsonRecord
    if (record.goalId === goalId) found = true
    Object.values(record).forEach(visit)
  }
  visit(view.rootNodes)
  return found
}).length
const nuclideAssessmentViewPlacements = countViewPlacements(ids.nuclideNotationAssessment)
const radiationAssessmentViewPlacements = countViewPlacements(ids.radiationEvidenceAssessment)
if (nuclideAssessmentViewPlacements === 0) throw new Error('Nuclide-notation assessment has no prerequisite-complete view placement')
if (radiationAssessmentViewPlacements === 0) throw new Error('Radiation evidence assessment has no prerequisite-complete view placement')
const provenance = buildProvenance(mappings)
const surrogate = buildSurrogate()
const visualizationQa = buildVisualizationQa(canonical)
const generators = new Map([...generatorPathsByReview].map(([reviewPath, generatorPath]) => [
  generatorPath, buildGeneratorOverlay(
    generatorPath,
    directRoutes.get(reviewPath) ?? {},
    directRemovals.get(reviewPath) ?? {},
  ),
]))
const physicsInputTest = buildPhysicsInputTest()
const thExtraction = buildThSourceExtraction()
const thReadme = buildThReadme()

type PlannedFile = { path: string; bytes: string }
const plannedFiles: PlannedFile[] = [
  { path: paths.canonical, bytes: serializeJson(canonical) },
  { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
  { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
  { path: paths.memory, bytes: serializeJsonl(memory) },
  { path: paths.atlas, bytes: serializeJson(atlas) },
  ...[...mappings].map(([path, value]) => ({ path, bytes: serializeJson(value) })),
  ...[...views].map(([path, value]) => ({ path, bytes: serializeJson(value) })),
  { path: paths.provenance, bytes: serializeJson(provenance) },
  { path: paths.surrogate, bytes: serializeJson(surrogate) },
  { path: paths.visualizationQa, bytes: serializeJson(visualizationQa) },
  { path: paths.visualizationReview, bytes: visualizationReview },
  ...[...generators].map(([path, bytes]) => ({ path, bytes })),
  { path: paths.physicsInputTest, bytes: physicsInputTest },
  { path: paths.thExtraction, bytes: serializeJson(thExtraction) },
  { path: paths.thReadme, bytes: thReadme },
]
const plannedByPath = new Map(plannedFiles.map((file) => [file.path, file.bytes]))
const actualAfterHashes = Object.fromEntries(Object.keys(expectedAfterHashes).map((path) => [path, sha256(plannedByPath.get(path)!)]))
const actualAfterCorpusHashes = {
  mappings: corpusHash(mappingPaths, plannedByPath),
  views: corpusHash(viewPaths, plannedByPath),
  generators: corpusHash(generatorPaths, plannedByPath),
}
for (const [path, expected] of Object.entries(expectedAfterHashes)) {
  if (expected !== 'PENDING' && actualAfterHashes[path] !== expected) {
    throw new Error(`Batch-017 after-hash mismatch for ${path}: ${actualAfterHashes[path]} != ${expected}`)
  }
}
for (const [label, expected] of Object.entries(expectedAfterCorpusHashes)) {
  if (expected !== 'PENDING' && actualAfterCorpusHashes[label as keyof typeof actualAfterCorpusHashes] !== expected) {
    throw new Error(`Batch-017 ${label} after-corpus mismatch`)
  }
}
const changed = plannedFiles.filter(({ path, bytes }) => !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)
if (writeMode) {
  if (Object.values(expectedAfterHashes).includes('PENDING') || Object.values(expectedAfterCorpusHashes).includes('PENDING')) {
    throw new Error('Refusing --write while Batch-017 after hashes are unbound')
  }
  for (const { path, bytes } of changed) writeFileSync(absolute(path), bytes)
}

console.log(
  `CHECK apply_physics_batch017_nuclear_structural_adjudication ${writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'} `
  + `parents=2 children=5 assessments=2 assessmentPlacements=${nuclideAssessmentViewPlacements}+${radiationAssessmentViewPlacements} mappings=${mappings.size} views=${views.size} generators=${generators.size} `
  + `total=${semanticKinds.counts.total} curricularAtomic=${semanticKinds.counts.curricularAtomic} `
  + `curricularArea=${semanticKinds.counts.curricularArea} plannedWrites=${changed.length} `
  + `files=${changed.map(({ path }) => basename(path)).join(',') || '-'}`,
)
console.log(`AFTER_HASHES ${JSON.stringify(actualAfterHashes)}`)
console.log(`AFTER_CORPORA ${JSON.stringify(actualAfterCorpusHashes)}`)
console.log('PRESERVE split-parent-url-provider=exact existing-nbp-overview-assets=byte-untouched metadata=reviewed-current')
console.log('DEFER child-visualizations=deferred_provider_limitation no-assets-created')
