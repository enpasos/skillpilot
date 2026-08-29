import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import * as ts from 'typescript'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The bounded curriculum ledgers predate a shared TypeScript schema and are
// checked field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = { path: string; bytes: string; appendOnly?: boolean }
type MappingAdjudication = {
  canonicalGoalIds: string[]
  matchTypes: Array<'exact' | 'partial'>
  rationale: string
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-28'
const reviewer = 'codex-physics-batch-021-astrophysics-adjudication-2026-08-28'
const visualizationReviewedAt = '2026-08-28T18:30:00.000Z'
const visualizationReviewer = 'codex-physics-batch021-visual-compatibility-2026-08-28'
const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const expectedAdjudicationSha256 = '596a8a20d7a48597b9dcf6ff5ac0042dfc021d8d0f2f127881390b32f5922214'
const expectedFollowUpConfigSha256 = '8c6fa751fd722a72aceab4ebba9c7796117d6ea6ae3a768388992d9b5c1d7d97'

// This digest is bound only after review of the complete read-only plan.
// --write remains impossible while the value is PENDING.
const expectedBoundedPlanSha256 = '7df950e633801d2e5c4cdde87cd7cf1af551db603df736a83cdac813315fcdc6'

const ids = {
  worldview: '6d18104b-5704-5c45-b39a-2c84565b1796',
  solarSystemClassification: '982df2f3-e040-5f4b-b668-0fe05d994b29',
  nightSky: '2bc068de-5d2b-5f94-bd51-755982befb6f',
  astronomicalUnit: '5cf160e5-e0c2-5552-b2cf-0f04871c5e7e',
  solarObservations: '94a3a80e-f1de-51a2-b834-1e3431c5d3ca',
  parallaxCluster: 'e07f36de-2819-59f8-a707-fa25b4633ed3',
  astrometry: '9f85de48-1b3f-5afb-8a34-ce94cf7a1b49',
  radialVelocity: 'ce037050-f94c-5828-883a-76385c84d1f7',
  spectralClassification: '5c5d6698-c056-5850-8ecd-6dd87fb44549',
  spectraTemperatureCluster: 'a7bec355-48c5-5107-bfab-d6956f9c9205',
  fraunhofer: 'f9c025ce-4327-5de7-8288-a3358e14a576',
  stellarTemperature: '89124b92-5769-5e13-8a5d-78497936260f',
  radiationEquilibrium: 'a5031dfc-6d25-5a04-850a-5c7d8a254c21',
  planetaryVisibility: '0a172021-dfd9-5926-b92c-c01a9dfe9aa8',
  solarActivity: '4e823349-b60c-5d2a-b96f-d3f23ae50e3a',
  galaxyDistances: '61e84097-57b9-5434-9909-8ed8368a7823',
  telescopeMilkyWay: '826af579-3e51-5ac9-bc2a-208d8a2fc99e',
  binaryGwCluster: '7c8f1e34-d81a-51a2-8aa0-a6ee8e1b03a4',
  binaryGwMass: '4ea39b40-1563-58ab-8d54-5fc20efa5365',
  gwGeneration: '09995ab9-86aa-5b02-8a58-62b16a37831d',
  exoplanets: 'e2014db8-c97f-5ce1-82c5-2a42741f4a61',
  cosmologyQuestions: '6ae54ff9-dc3b-563b-b2ee-09a0f0d00162',
  darkMatter: 'f203a552-fcf0-560c-baa2-47d4eb2379c8',
  astrophysicsCluster: 'b59cb1ef-05c2-5b09-abb3-8b6903ca0fd6',
  spectraFoundation: '904670af-8e4c-543e-bc9b-e6248d87a10d',
  radiationFoundation: '2b700858-bc2e-5ddf-a791-b14d44160480',
  astronomyDistance: 'db6b8de4-21e0-58e8-a347-2ae39f538f92',
  twoBodyFoundation: '497f1311-17d6-56ff-afb1-422a738e5c16',
  gwFoundation: 'ba16948b-5e07-54af-b77b-776e677c6906',
  ligo: '52b6722a-b3b2-5d2d-a507-0215532b0422',
} as const

const splitParentIds = [
  ids.parallaxCluster,
  ids.spectraTemperatureCluster,
  ids.binaryGwCluster,
] as const

const childIds = [
  ids.astrometry,
  ids.radialVelocity,
  ids.spectralClassification,
  ids.fraunhofer,
  ids.stellarTemperature,
  ids.binaryGwMass,
  ids.gwGeneration,
] as const

const acceptedRevisionIds = [
  ids.worldview,
  ids.solarSystemClassification,
  ids.nightSky,
  ids.astronomicalUnit,
  ids.solarObservations,
  ids.radiationEquilibrium,
  ids.planetaryVisibility,
  ids.solarActivity,
  ids.galaxyDistances,
  ids.telescopeMilkyWay,
  ids.exoplanets,
  ids.cosmologyQuestions,
  ids.darkMatter,
] as const

const requiredFollowUpGoalIds = [
  ids.worldview,
  ids.solarSystemClassification,
  ids.nightSky,
  ids.astronomicalUnit,
  ids.solarObservations,
  ids.astrometry,
  ids.radialVelocity,
  ids.spectralClassification,
  ids.fraunhofer,
  ids.stellarTemperature,
  ids.radiationEquilibrium,
  ids.planetaryVisibility,
  ids.solarActivity,
  ids.galaxyDistances,
  ids.telescopeMilkyWay,
  ids.binaryGwMass,
  ids.gwGeneration,
  ids.exoplanets,
  ids.cosmologyQuestions,
  ids.darkMatter,
] as const

const existingVisualGoalIds = [
  ids.worldview,
  ids.solarSystemClassification,
  ids.nightSky,
  ids.astronomicalUnit,
  ids.solarObservations,
  ids.parallaxCluster,
  ids.spectraTemperatureCluster,
  ids.radiationEquilibrium,
  ids.planetaryVisibility,
  ids.solarActivity,
  ids.galaxyDistances,
  ids.telescopeMilkyWay,
  ids.binaryGwCluster,
  ids.exoplanets,
  ids.cosmologyQuestions,
  ids.darkMatter,
] as const

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  byMapping: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  hhMapping: 'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  visualizationReview: 'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-batch-081.md',
  byGenerator: 'app/scripts/generateByPhysicsSourceExtraction.ts',
  hhGenerator: 'app/scripts/generateHhPhysicsSourceExtraction.ts',
  adjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-021-astrophysics-fast-lane-16-v1/third-adjudication/adjudication.json',
  followUpConfig:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-022-astrophysics-current-20-v1.config.json',
  bySourceExtraction:
    'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/'
    + 'DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
  hhSourceExtraction:
    'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/'
    + 'DE_HH_PHYSIK_SEKII_BILDUNGSPLAN_2022.source-extraction.json',
  sourceGoalClosure: 'curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json',
  sourceGoalMembership: 'curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json',
  compositionRoot: 'curricula/DE/Gymnasium/composition-views/physik',
} as const

const compositionViewPaths = [
  `${paths.compositionRoot}/de-by-gk.view.json`,
  `${paths.compositionRoot}/de-by-lk.view.json`,
  `${paths.compositionRoot}/de-by-sekii-gk.view.json`,
  `${paths.compositionRoot}/de-by-sekii-lk.view.json`,
] as const

const protectedAssetHashes: Record<string, string> = {
  [ids.worldview]: '60fe10d846309cc435d5a1e6cbdaa496bb305a078bef598c7ee85c5bcc46bc48',
  [ids.solarSystemClassification]: '4f883bc138e486c68c1f388271433b02a2310f33d9261af212cbb2ec84e8c0da',
  [ids.nightSky]: 'd94f6d202d516181f9c1beee9acf00ca20ec798d0627dcaaadc160d6e12129b7',
  [ids.astronomicalUnit]: 'df281eca0a3fc705be47d0f32afc73eef5823baf1edcf988168d3db1b68a8bfd',
  [ids.solarObservations]: 'b3a5e8067fa261ac9f55e9309e79a9790e5762477fcc7d52283da8b0adde399f',
  [ids.parallaxCluster]: 'bee3f7d8681102a2a3cc44eaf1b565635fe62f7a4b3c255c08314c5ff7384a25',
  [ids.spectraTemperatureCluster]: 'c138643c5fdeb276a38548437dcbf7f6b7608ded94a586c9365ab7120c8e55c3',
  [ids.radiationEquilibrium]: 'efc8ba716c4b7cec0d4915c2ae8812ace321383b0b52c04e7739855a0764e6d1',
  [ids.planetaryVisibility]: '8db3951f3b9132359c63d430e4114f9026937aad5d4dd2ef8ea5828d4be16c7b',
  [ids.solarActivity]: 'a6cbf8de1d9e6eacdb25bebaf206637029024f1e8025e4ddd5f7bf31105eea8d',
  [ids.galaxyDistances]: '850c2fe0910fceea8b7ce0d9535a4f3f35a9969f45048e6847a93eb069976319',
  [ids.telescopeMilkyWay]: '6cbf760c81b098f3a3099831d7613fc4c950eb1f7e4e0b8adc26497c9cb1716f',
  [ids.binaryGwCluster]: '88d341f30c471d69c422f3eab4d392f2170f98d56103371beefcb464d0d02bd8',
  [ids.exoplanets]: '63b4b3ae5e2b18dba5a4998fe42810bdbe2411eb44925eebd57031e0e2d19a6d',
  [ids.cosmologyQuestions]: '6dae895d8a0a0ed9905e80e0d1c893814bec6d83023f90618e6cca92e70993f2',
  [ids.darkMatter]: 'cc9846d8f6472e4e9680a22a83645d72e35c86757e732eb715820d26e0ef8b29',
}

const protectedPromptHashes: Record<string, string> = {
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.worldview}/prompt.de.md`]: '8e2c39056cbc7e1a7b14c5212cb380724026f82849894c37f3c326d9f2689923',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.solarSystemClassification}/prompt.de.md`]: '7c3dff6f7d8d8ed5051a473d0afd235c1f87446de6704701a82fc72b373e60e9',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.nightSky}/prompt.de.md`]: '57c47ea5c75d115e36eefa48cffef2e279bf1503e091c45d4725f16dbae53c28',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.astronomicalUnit}/prompt.de.md`]: '07d5bbf8e6164b019721bb45bec7ca45dbef9f13a78b97a6976e2feb10560112',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.solarObservations}/prompt.de.md`]: '0449ff29be7caa10ae10425ad04741d2d9290f663d0a1a69117b139eeb4f8106',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.parallaxCluster}/prompt.de.md`]: '6742c30b936d7b6b687a090b84c8d749c82f3d009451d08c9740bf2907ac92b6',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.spectraTemperatureCluster}/prompt.de.md`]: '8e738cdbbc4a70087c9614589fa78d989568098cf61b01102e8631001506611f',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.radiationEquilibrium}/prompt.de.md`]: 'a3c9f2fd53efbe768c004ddc63722b63ee7229b5ef4c10bb4091509a59b58f7f',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.radiationEquilibrium}/image-reconstruction-prompt.de.md`]: '45a5f80bcdcc55d076f3071be7cb2e62b510a4b697eaf16b5343b08115c30d26',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.planetaryVisibility}/prompt.de.md`]: '2f9f8edeb8aa3364b27d37c508535615bfda2761a181f56e97b090162eece957',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.solarActivity}/prompt.de.md`]: '9a5c4139d6bf26a465667893b71191327b3a181892867fc77948ccb3986cf847',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.galaxyDistances}/prompt.de.md`]: '64e19fe20a97eef043b41f494f340707952fd198c0d5d21ae6eed46b22eb776b',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.telescopeMilkyWay}/prompt.de.md`]: 'b3a7516276ce60ad5729222fabf3b77d3a4363ed479f680fdf4939f8f00f23f8',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.binaryGwCluster}/prompt.de.md`]: 'abb41d368a2d6ba519b80283f5977f3604b7f5e3e3d9d0dd83ec4dd6e60c08f0',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.exoplanets}/prompt.de.md`]: '4913b19275c1e26b932037ad21ae9c022b4fe3998197a6ce99cce93f6af06c0f',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.cosmologyQuestions}/prompt.de.md`]: '3f0002bf266cd74f2f0b923f73911ad9b565b406cde629584f8199eeac50b898',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.darkMatter}/prompt.de.md`]: '2b1ca7b5eab0b6095384c0c41a2b0033e7a436d63fe8203a6168fe4aea50007a',
}

const protectedUnchangedHashes: Record<string, string> = {
  [paths.bySourceExtraction]: 'a51e264731060ce2a45ed195e5d3855414ebd84cdfbf4cf4766659bffd6966c1',
  [paths.hhSourceExtraction]: 'bdf230c0341a8e72dce882d603d979715708031c79511d5b12eb0ecbea44b426',
  [paths.sourceGoalClosure]: '66f7d5ce4887f3f7365fcc71c05735a696432f836654d822b653357f243cd720',
  [paths.sourceGoalMembership]: '87fd61377f153ad3c455fd6bc89d7def21af35190ecb5c597ca6480b1abad6e5',
  [compositionViewPaths[0]]: '8800c783e2169fc54360df6a57c52634fe1d218e2f2c18d578cdd36dc079db01',
  [compositionViewPaths[1]]: '90b99937b768c0d41f9759ed9624c09d99a277ac90df45e29b0e5f70dcbe9645',
  [compositionViewPaths[2]]: '5f1c9624d2bc64420b30aa9aba92a007234fee6e0ddbbcc7d907cf63726e2d17',
  [compositionViewPaths[3]]: 'a15c3c3fa8001e2987732324a8c19b97110483589854be1e0c29c9ac3f5c93db',
}

const expectedBeforeExtraHashes: Record<string, string> = {
  [paths.byGenerator]: '53b8590d69ce80d43fe9cde42af42d8c7ee5d542afca0c0457f793f7529df145',
  [paths.hhGenerator]: '615d5551a7f106a8cea30c7323e880fe5636bb39d6470b2af6267aad1d07d18f',
  [paths.provenance]: '218fa443869dcd8aebc13d5c6a32749b67603791329f22096cca26d621246790',
}

const bySourceLandscapeId = '42c2f7e3-91b4-5de8-bef0-d563440e9d52'
const hhSourceLandscapeId = 'b400d5b6-7b13-4a64-881d-7416dcf01785'

const byMappingAdjudications: Record<string, MappingAdjudication> = {
  'f794cbd9-db43-54e9-9abe-45fae5724705': {
    canonicalGoalIds: [ids.astrometry, ids.astronomyDistance],
    matchTypes: ['partial', 'partial'],
    rationale: 'Batch-021-Fachreview: Ph13-GA-ASTRO.4.1 trägt die astrometrische Entfernungs- und Tangentialgeschwindigkeitsbestimmung. Der frühere Sammelknoten wird deshalb durch das Astrometrie-Kind ersetzt; das bereits passende kanonische Distanzziel bleibt erhalten.',
  },
  'cc2ffcad-52de-5a1c-8d32-c9264dd135d3': {
    canonicalGoalIds: [ids.radialVelocity, ids.spectralClassification, ids.spectraFoundation],
    matchTypes: ['partial', 'partial', 'partial'],
    rationale: 'Batch-021-Fachreview: Ph13-GA-ASTRO.4.2 trägt Dopplerschlüsse aus Absorptionslinien und die begründete Spektralklassifikation. Es trägt weder die Fraunhoferlinien-Entstehung noch eine Temperaturbestimmung mit Wien- oder Stefan-Boltzmann-Gesetz; diese Elternanteile werden daher nicht kopiert.',
  },
  '0337c4aa-9350-583c-89e2-e136e1f813e5': {
    canonicalGoalIds: [
      ids.fraunhofer,
      ids.stellarTemperature,
      ids.spectraFoundation,
      ids.radiationFoundation,
      '4c5c7cb1-f238-52c8-b82c-159c6c299c0e',
    ],
    matchTypes: ['partial', 'partial', 'partial', 'partial', 'partial'],
    rationale: 'Batch-021-Fachreview: Ph13-GA-ASTRO.3.4 stützt getrennt die Deutung von Fraunhoferlinien und die Abschätzung der Oberflächentemperatur mit Wien- beziehungsweise Stefan-Boltzmann-Gesetz; die übrigen bereits passenden Grundlagenziele bleiben erhalten.',
  },
  '09a09524-4d0c-5f3f-b39e-3e669970a6a3': {
    canonicalGoalIds: [ids.binaryGwMass, ids.gwGeneration, ids.gwFoundation, ids.twoBodyFoundation],
    matchTypes: ['partial', 'partial', 'partial', 'partial'],
    rationale: 'Batch-021-Fachreview: Ph13-GA-ASTRO.4.5 stützt sowohl die gemeinsame Masseninferenz aus optischen Zweikörper- und Gravitationswellendaten als auch die davon getrennte, physikalisch begrenzte Analogieerklärung der Gravitationswellenentstehung; die beiden Grundlagenziele bleiben erhalten.',
  },
}

const hhMappingAdjudications: Record<string, MappingAdjudication> = {
  'hh-physics-sekii-bp2022-4-2-151-805f5883': {
    canonicalGoalIds: [ids.stellarTemperature, ids.radiationEquilibrium],
    matchTypes: ['partial', 'partial'],
    rationale: 'Batch-021-Fachreview: Das Hamburger Ziel zum Stefan-Boltzmann-Gesetz wird auf das quantitative Temperaturgesetz-Kind und das bestehende Strahlungsbilanzziel abgebildet; der frühere Spektren-Sammelknoten entfällt.',
  },
  'hh-physics-sekii-bp2022-4-2-147-dadec209': {
    canonicalGoalIds: [ids.gwGeneration],
    matchTypes: ['partial'],
    rationale: 'Batch-021-Fachreview: Das Hamburger Ziel zur Abstrahlung beschleunigter Massen stützt das Gravitationswellen-Entstehungskind teilweise; dessen notwendige nicht kugelsymmetrische Zeitabhängigkeit und die Grenzen der elektromagnetischen Analogie gehen über den Source-Wortlaut hinaus.',
  },
  'hh-physics-sekii-bp2022-4-2-148-83499da7': {
    canonicalGoalIds: [ids.ligo],
    matchTypes: ['exact'],
    rationale: 'Batch-021-Fachreview: Dieses Hamburger Source-Ziel betrifft ausschließlich das LIGO-Interferometer. Das bestehende LIGO-Ziel bleibt die exakte Zuordnung; der frühere Gravitationswellen-Sammelknoten wird ohne Umleitung auf ein Kind entfernt.',
  },
}

const atomicityReasons: Record<string, string> = {
  [ids.worldview]: 'Beobachtung, Theorie, historische Einordnung und Wirkungsreflexion bilden die Evidenz- und Deutungsschritte einer einzigen, an einem konkreten Weltbildwechsel prüfbaren Reflexionsleistung.',
  [ids.solarSystemClassification]: 'Physikalische Eigenschaften, Bahnparameter, recherchierte Daten und begründete Schlussfolgerung bilden ein einheitliches Klassifikationsschema für einen Himmelskörper.',
  [ids.nightSky]: 'Orientierung, Objektklassifikation und die Begründung von Ort und Zeit der Sichtbarkeit werden gemeinsam an derselben Beobachtungssituation geprüft.',
  [ids.astronomicalUnit]: 'Begriffliche Einordnung der Astronomischen Einheit und Rekonstruktion einer beobachtungsbasierten Bestimmungsmethode sind zwei zusammengehörige Teile derselben Messgrößenkompetenz.',
  [ids.solarObservations]: 'Eigene sichere Messung oder bereitgestellte Daten sind alternative Eingänge derselben Auswertung, deren Ergebnis die Abschätzung solarer Zustandsgrößen ist.',
  [ids.astrometry]: 'Parallaxe, Entfernung, Eigenbewegung, Tangentialgeschwindigkeit und Methodenbegrenzung bilden eine geschlossene astrometrische Auswertungskette.',
  [ids.radialVelocity]: 'Linienidentifikation, Dopplerverschiebung, Richtung, Betrag, Bezugssystem und Unsicherheit sind notwendige Bestandteile einer einzigen spektroskopischen Radialgeschwindigkeitsbestimmung.',
  [ids.spectralClassification]: 'Linienmuster, Spektralklasse und Oberflächentemperatur bilden ein gemeinsames Begründungsschema für die Klassifikation eines Sternspektrums.',
  [ids.fraunhofer]: 'Absorptionsliniendeutung und Energieniveaumodell erklären gemeinsam genau einen Entstehungsmechanismus der Fraunhoferlinien.',
  [ids.stellarTemperature]: 'Wien- und Stefan-Boltzmann-Gesetz sind alternative, datenabhängige Wege zu derselben Zielgröße, der stellaren Oberflächentemperatur.',
  [ids.radiationEquilibrium]: 'Gleichgewichtsansatz, Temperaturabschätzung, Annahmenprüfung, Messwertvergleich und begrenzte Habitabilitätsaussage sind Phasen eines einzigen Modellierungszyklus.',
  [ids.planetaryVisibility]: 'Konstellationsmodell, Sichtbarkeit und scheinbare Schleifenbahn werden durch denselben Mechanismus relativer Bewegung zusammenhängend erklärt.',
  [ids.solarActivity]: 'Die Prüfung solarer Zusammenhänge liefert unmittelbar die Kriterien für dasselbe fachliche Urteil über die Bedeutung der Weltraumwetterüberwachung.',
  [ids.galaxyDistances]: 'Distanzverfahren, Unsicherheiten und modellabhängiges Hubble-Alter bilden eine zusammenhängende kosmologische Inferenzkette von Entfernungsdaten zur Altersabschätzung.',
  [ids.telescopeMilkyWay]: 'Teleskopvergleich, Zusammenführung mehrerer Spektralbereiche und Strukturbeschreibung sind Schritte derselben Multiwellenlängen-Auswertung der Milchstraße.',
  [ids.binaryGwMass]: 'Optische Bahn- und Gravitationswellendaten sind zwei Beobachtungswege derselben Masseninferenz; der Vergleich ihrer Modellannahmen ist Teil genau dieser Methodenkompetenz.',
  [ids.gwGeneration]: 'Nicht kugelsymmetrische zeitliche Massenänderung sowie Gemeinsamkeiten und Grenzen der elektromagnetischen Analogie bilden eine einzige qualitative Erklärung der Gravitationswellenentstehung.',
  [ids.exoplanets]: 'Methodenvergleich, physikalischer Erdvergleich und Quellenkritik sind Evidenzschritte desselben beobachtbaren Urteils über eine Habitabilitätsaussage.',
  [ids.cosmologyQuestions]: 'Problembeschreibung, Ableitung untersuchbarer Fragen und evidenzbezogene Quellenbewertung bilden eine zusammenhängende wissenschaftliche Einordnungsleistung.',
  [ids.darkMatter]: 'Galaxien und zentrale Schwarze Löcher sind Anwendungsskalen derselben inversen Gravitationsmodellierung; die Dunkle-Materie-Deutung folgt aus derselben Masse-Licht-Diskrepanz.',
}

const memoryReasons: Record<string, string> = {
  [ids.worldview]: 'Das Ziel verlangt historische und gesellschaftliche Einordnung sowie Wirkungsreflexion an Evidenz; isolierte Faktenkarten ersetzen diese Begründungsleistung nicht.',
  [ids.solarSystemClassification]: 'Kriterien müssen auf recherchierte Daten angewendet und Schlussfolgerungen begründet werden; eine Merkliste von Himmelskörperklassen genügt nicht.',
  [ids.nightSky]: 'Die Sichtbarkeit muss aus einer konkreten Karte oder Simulation räumlich und zeitlich erschlossen werden; reine Begriffserinnerung ist nicht hinreichend.',
  [ids.astronomicalUnit]: 'Die Kompetenz liegt in der Rekonstruktion einer beobachtungsbasierten Messmethode und nicht im bloßen Erinnern des Zahlenwerts einer Astronomischen Einheit.',
  [ids.solarObservations]: 'Sichere Datenerhebung beziehungsweise Datenauswertung und Zustandsgrößeninferenz erfordern Mess- und Modellverständnis statt isolierter Merksätze.',
  [ids.astrometry]: 'Die Auswertung neuer Parallaxen- und Eigenbewegungsdaten einschließlich Reichweite und Unsicherheit kann nicht durch eine reine Formelspeicherkarte ersetzt werden.',
  [ids.radialVelocity]: 'Vorzeichen, Bezugssystem und Unsicherheit müssen an neuen Spektrallinienverschiebungen gedeutet werden; bloße Formelkenntnis genügt nicht.',
  [ids.spectralClassification]: 'Unbekannte Sternspektren müssen über Linienmuster und Temperaturzusammenhang begründet klassifiziert werden; eine Klassenliste allein reicht nicht.',
  [ids.fraunhofer]: 'Die Entstehung der Linien muss kausal mit selektiver Absorption und Energieniveaus erklärt werden; eine Definition als Absorptionslinie ersetzt dies nicht.',
  [ids.stellarTemperature]: 'Das passende Strahlungsgesetz muss aus den verfügbaren Daten gewählt, angewendet und gedeutet werden; die Formeln sind bereits in fachlichen Grundlagen verankert und rechtfertigen kein eigenes Deck.',
  [ids.radiationEquilibrium]: 'Modellannahmen, Messwertabweichungen und begrenzte Habitabilitätsaussagen verlangen einen vollständigen Modellierungszyklus statt Formelabruf.',
  [ids.planetaryVisibility]: 'Konstellationen und Schleifenbahnen müssen aus relativer Bewegung modelliert werden; isoliertes Erinnern astronomischer Begriffe genügt nicht.',
  [ids.solarActivity]: 'Zusammenhänge müssen recherchiert, geprüft und zu einem Überwachungsurteil verbunden werden; eine Faktenkarte ersetzt die Bewertung nicht.',
  [ids.galaxyDistances]: 'Methodenvergleich, Unsicherheitsanalyse und modellabhängige Altersinferenz erfordern zusammenhängende Auswertung statt einzelner Kennzahlen.',
  [ids.telescopeMilkyWay]: 'Daten mehrerer Spektralbereiche müssen zusammengeführt und strukturell interpretiert werden; Gerätekategorien als Merkliste reichen nicht.',
  [ids.binaryGwMass]: 'Massen müssen aus zwei Datentypen unter unterschiedlichen Modellannahmen erschlossen werden; isolierte Formeln tragen diese Vergleichsleistung nicht.',
  [ids.gwGeneration]: 'Die physikalische Qualifikation der Massenverteilung und die Grenzen der Analogie müssen erklärt werden; eine kurze Merkaussage würde zentrale Modellgrenzen verdecken.',
  [ids.exoplanets]: 'Das Ziel ist ein quellenkritisches, physikalisch begründetes Urteil über wechselnde Habitabilitätsaussagen und keine kompakte Erinnerungsleistung.',
  [ids.cosmologyQuestions]: 'Untersuchbare Fragen sowie Evidenz, Unsicherheit und Quellenqualität müssen an wechselnden Darstellungen beurteilt werden; Faktenkarten helfen dafür nicht hinreichend.',
  [ids.darkMatter]: 'Bahndaten müssen mit einem Gravitationsmodell invertiert und Masse-Licht-Abweichungen gedeutet werden; reines Erinnern des Begriffs Dunkle Materie genügt nicht.',
}

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line) as JsonRecord)
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
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const sortStrings = (values: string[]): string[] => [...values].sort((left, right) => left < right ? -1 : left > right ? 1 : 0)

const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => sha256Digest(stableJson({
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

const deterministicPhysicsGoalId = (shortKey: string): string => {
  const value = createHash('sha1').update(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`).digest('hex')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-5${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20, 32)}`
}

const countGoalReferences = (value: unknown, goalId: string): number => {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const record = value as JsonRecord
  return (record.goalId === goalId ? 1 : 0)
    + Object.values(record).reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
}

function assertSha256(path: string, expected: string, label: string): void {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const actual = sha256(readFileSync(absolute(path)))
  if (actual !== expected) throw new Error(`${label}: ${path} drifted (${actual} != ${expected})`)
}

function assertProtectedInputs(): void {
  for (const [goalId, expected] of Object.entries(protectedAssetHashes)) {
    const canonicalPath = `curricula/DE/Gymnasium/visualizations/physik/${goalId}/${goalId}.jpg`
    const publicPath = `app/public/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`
    assertSha256(canonicalPath, expected, 'Protected canonical Nano Banana Pro asset')
    assertSha256(publicPath, expected, 'Protected public Nano Banana Pro asset')
  }
  for (const [path, expected] of Object.entries(protectedPromptHashes)) {
    assertSha256(path, expected, 'Protected historical visualization prompt')
  }
  for (const [path, expected] of Object.entries(protectedUnchangedHashes)) {
    assertSha256(path, expected, 'Protected unchanged Batch-021 context')
  }
  for (const childId of childIds) {
    for (const directory of [
      `curricula/DE/Gymnasium/visualizations/physik/${childId}`,
      `app/public/assets/goal-visualizations/physik/${childId}`,
    ]) {
      if (existsSync(absolute(directory)) && readdirSync(absolute(directory)).length > 0) {
        throw new Error(`Batch-021 child ${childId} unexpectedly has substitute visual files in ${directory}`)
      }
    }
  }
}

function loadAdjudication(): JsonRecord {
  assertSha256(paths.adjudication, expectedAdjudicationSha256, 'Batch-021 adjudication')
  assertSha256(paths.followUpConfig, expectedFollowUpConfigSha256, 'Batch-022 follow-up config')
  const adjudication = readJson(paths.adjudication)
  const followUpConfig = readJson(paths.followUpConfig)
  if (
    adjudication.schemaVersion !== 1
    || adjudication.subject !== 'physik'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.counts?.total !== 16
    || adjudication.counts?.accepted_revision !== 13
    || adjudication.counts?.structural_split !== 3
    || adjudication.counts?.newAtomicChildren !== 7
    || adjudication.counts?.curricularAtomicDenominatorBefore !== 447
    || adjudication.counts?.curricularAtomicDenominatorAfter !== 451
    || adjudication.counts?.requiresProductOwnerDecision !== 0
    || !same(adjudication.requiredFollowUpGoalIds, [...requiredFollowUpGoalIds])
    || !same(followUpConfig.goalIds, [...requiredFollowUpGoalIds])
    || followUpConfig.subject !== 'physik'
    || !Array.isArray(adjudication.decisions)
    || adjudication.decisions.length !== 16
  ) throw new Error('Unexpected Batch-021 adjudication or Batch-022 follow-up contract')

  const acceptedIds = (adjudication.decisions as JsonRecord[])
    .filter((decision) => decision.resolutionDecision === 'accepted_revision')
    .map((decision) => decision.goalId)
  const splitIds = (adjudication.decisions as JsonRecord[])
    .filter((decision) => decision.resolutionDecision === 'structural_split')
    .map((decision) => decision.goalId)
  if (!same(acceptedIds, [...acceptedRevisionIds]) || !same(splitIds, [...splitParentIds])) {
    throw new Error('Unexpected Batch-021 accepted/split decision sets')
  }
  const actualChildren = (adjudication.decisions as JsonRecord[])
    .flatMap((decision) => decision.children ?? [])
  if (!same(actualChildren.map((child: JsonRecord) => child.goalId), [...childIds])) {
    throw new Error('Unexpected Batch-021 deterministic child order')
  }
  for (const child of actualChildren) {
    if (deterministicPhysicsGoalId(child.shortKey) !== child.goalId) {
      throw new Error(`Deterministic Physics child ID mismatch for ${child.shortKey}`)
    }
  }
  return adjudication
}

function canonicalIsPreState(canonical: JsonRecord): boolean {
  const goals = canonical.goals as JsonRecord[]
  const parentStates = splitParentIds.map((id) => goals.find((goal) => goal.id === id)?.type === 'atomic')
  if (parentStates.every(Boolean)) return true
  if (parentStates.every((state) => !state)) return false
  throw new Error('Batch-021 canonical is in a mixed parent state')
}

function assertBeforeBindings(adjudication: JsonRecord, preState: boolean): void {
  if (!preState) return
  const bindings = adjudication.currentContextBindings as JsonRecord
  const expected = [
    [paths.canonical, bindings.canonicalLandscape?.sha256],
    [paths.semanticKinds, bindings.semanticKinds?.sha256],
    [paths.atomicity, bindings.semanticAtomicity?.sha256],
    [paths.memory, bindings.memoryCardReview?.sha256],
    [paths.byMapping, bindings.bavariaMappingReview?.sha256],
    [paths.hhMapping, bindings.hamburgMappingReview?.sha256],
    [paths.visualizationQa, bindings.visualizationQa?.sha256],
  ] as const
  for (const [path, digest] of expected) {
    if (typeof digest !== 'string') throw new Error(`Missing adjudication current-context binding for ${path}`)
    assertSha256(path, digest, 'Batch-021 adjudicated before-state')
  }
  for (const [path, digest] of Object.entries(expectedBeforeExtraHashes)) {
    assertSha256(path, digest, 'Batch-021 additional before-state')
  }
}

function assertGraph(goals: JsonRecord[]): void {
  const byId = new Map<string, JsonRecord>()
  for (const goal of goals) {
    if (typeof goal.id !== 'string' || byId.has(goal.id)) {
      throw new Error(`Duplicate or invalid canonical Physics goal ID ${String(goal.id)}`)
    }
    byId.set(goal.id, goal)
  }
  const allCanonicalGoalIds = new Set(byId.keys())
  const canonicalDirectory = dirname(absolute(paths.canonical))
  for (const fileName of readdirSync(canonicalDirectory)) {
    if (!fileName.endsWith('.json') || fileName === basename(paths.canonical)) continue
    const landscape = JSON.parse(readFileSync(resolve(canonicalDirectory, fileName), 'utf8')) as JsonRecord
    for (const goal of landscape.goals ?? []) if (typeof goal.id === 'string') allCanonicalGoalIds.add(goal.id)
  }
  for (const field of ['contains', 'requires'] as const) {
    for (const goal of goals) {
      const targets = goal[field] ?? []
      if (!Array.isArray(targets) || new Set(targets).size !== targets.length) {
        throw new Error(`${goal.id}: invalid or duplicate ${field}`)
      }
      for (const targetId of targets) {
        if (!allCanonicalGoalIds.has(targetId)) throw new Error(`${goal.id}: missing ${field} target ${targetId}`)
      }
    }
    const visiting = new Set<string>()
    const visited = new Set<string>()
    const visit = (goalId: string): void => {
      if (visited.has(goalId)) return
      if (visiting.has(goalId)) throw new Error(`${field} cycle at ${goalId}`)
      visiting.add(goalId)
      for (const targetId of byId.get(goalId)?.[field] ?? []) if (byId.has(targetId)) visit(targetId)
      visiting.delete(goalId)
      visited.add(goalId)
    }
    for (const goalId of byId.keys()) visit(goalId)
  }
}

function updateVisualizationLink(goal: JsonRecord): void {
  const links = (goal.resourceLinks ?? []).filter((link: JsonRecord) => link.type === 'goal-visualization')
  if (
    links.length !== 1
    || links[0].provider !== 'Google Gemini / Nano Banana Pro'
    || links[0].skillpilotId !== goal.id
  ) throw new Error(`${goal.id}: expected one retained Nano Banana Pro goal-visualization link`)
  Object.assign(links[0], {
    title: `Visualisierung: ${goal.title}`,
    description: `Visualisierung zum Lernziel: ${goal.title}.`,
    altText: `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`,
  })
}

function childTopicCode(shortKey: string): string {
  if (!shortKey.startsWith('canonical_physics_')) throw new Error(`Unexpected Physics child shortKey ${shortKey}`)
  return `CANONICAL_PHYSICS_${shortKey.slice('canonical_physics_'.length).toUpperCase()}`
}

function buildCanonical(adjudication: JsonRecord): JsonRecord {
  const canonical = readJson(paths.canonical)
  if (canonical.landscapeId !== physicsLandscapeId || !Array.isArray(canonical.goals)) {
    throw new Error('Unexpected canonical Physics landscape')
  }
  const goals = canonical.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [String(goal.id), goal]))
  if (byId.size !== goals.length) throw new Error('Duplicate canonical Physics goal IDs')
  const goal = (goalId: string): JsonRecord => {
    const value = byId.get(goalId)
    if (!value) throw new Error(`Missing canonical Physics goal ${goalId}`)
    return value
  }
  const decisions = new Map<string, JsonRecord>(
    (adjudication.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]),
  )

  const protectedLinkIdentity = new Map<string, string>()
  for (const goalId of existingVisualGoalIds) {
    const link = (goal(goalId).resourceLinks ?? []).find((candidate: JsonRecord) => candidate.type === 'goal-visualization')
    protectedLinkIdentity.set(goalId, stableJson({
      url: link?.url,
      provider: link?.provider,
      assetSha256: protectedAssetHashes[goalId],
    }))
  }

  for (const goalId of acceptedRevisionIds) {
    const decision = decisions.get(goalId)
    const current = goal(goalId)
    const finalText = decision?.finalText
    if (decision?.resolutionDecision !== 'accepted_revision' || !finalText) {
      throw new Error(`${goalId}: missing accepted Batch-021 final text`)
    }
    Object.assign(current, {
      title: finalText.titleDe,
      titleEn: finalText.titleEn,
      description: finalText.descriptionDe,
      descriptionEn: finalText.descriptionEn,
    })
    const expectedRequires = decision.requiresAfterRevision as string[]
    if (!Array.isArray(expectedRequires)) throw new Error(`${goalId}: missing requiresAfterRevision`)
    const allowedBefore = goalId === ids.radiationEquilibrium
      ? ['c9405043-bdc0-5995-8b4d-5bb56d97d05d', ids.spectraTemperatureCluster]
      : expectedRequires
    if (!same(current.requires, allowedBefore) && !same(current.requires, expectedRequires)) {
      throw new Error(`${goalId}: requires drifted from bounded pre/post Batch-021 states`)
    }
    current.requires = [...expectedRequires]
    updateVisualizationLink(current)
  }

  const childSpecs: Array<{ parentId: string; child: JsonRecord }> = []
  for (const parentId of splitParentIds) {
    const decision = decisions.get(parentId)
    const conversion = decision?.clusterConversion as JsonRecord | undefined
    if (decision?.resolutionDecision !== 'structural_split' || !conversion || !Array.isArray(decision.children)) {
      throw new Error(`${parentId}: missing structural split contract`)
    }
    const parent = goal(parentId)
    const parentTemplate = {
      tags: structuredClone(parent.tags ?? []),
      dimensionTags: structuredClone(parent.dimensionTags ?? {}),
      applicability: structuredClone(parent.applicability ?? {}),
      competencyRefs: structuredClone(parent.competencyRefs ?? []),
    }
    Object.assign(parent, {
      title: conversion.titleDe,
      titleEn: conversion.titleEn,
      description: conversion.descriptionDe,
      descriptionEn: conversion.descriptionEn,
      weight: conversion.weight,
      contains: [...conversion.contains],
      requires: [...conversion.requires],
      type: 'cluster',
    })
    delete parent.semanticAtomic
    updateVisualizationLink(parent)

    for (const child of decision.children as JsonRecord[]) {
      const expectedChild: JsonRecord = {
        id: child.goalId,
        shortKey: child.shortKey,
        title: child.titleDe,
        titleEn: child.titleEn,
        description: child.descriptionDe,
        descriptionEn: child.descriptionEn,
        weight: 1,
        tags: structuredClone(parentTemplate.tags),
        contains: [],
        requires: [...child.requires],
        dimensionTags: {
          ...structuredClone(parentTemplate.dimensionTags),
          topicCode: childTopicCode(child.shortKey),
        },
        applicability: structuredClone(parentTemplate.applicability),
        type: 'atomic',
        semanticAtomic: true,
        competencyRefs: structuredClone(parentTemplate.competencyRefs),
        resourceLinks: [],
      }
      const existing = byId.get(child.goalId)
      if (existing && !same(existing, expectedChild)) {
        throw new Error(`Existing Batch-021 child differs from adjudication: ${child.goalId}`)
      }
      byId.set(child.goalId, existing ?? expectedChild)
      childSpecs.push({ parentId, child: existing ?? expectedChild })
    }
  }

  for (const childId of childIds) {
    const index = goals.findIndex((candidate) => candidate.id === childId)
    if (index >= 0) goals.splice(index, 1)
  }
  for (const parentId of splitParentIds) {
    const parentIndex = goals.findIndex((candidate) => candidate.id === parentId)
    if (parentIndex < 0) throw new Error(`Missing Batch-021 insertion parent ${parentId}`)
    goals.splice(
      parentIndex + 1,
      0,
      ...childSpecs.filter((spec) => spec.parentId === parentId).map((spec) => spec.child),
    )
  }

  const astrophysics = goal(ids.astrophysicsCluster)
  for (const parentId of splitParentIds) {
    if ((astrophysics.contains as string[]).filter((goalId) => goalId === parentId).length !== 1) {
      throw new Error(`Astrophysics cluster does not retain split parent exactly once: ${parentId}`)
    }
  }
  if (childIds.some((childId) => (astrophysics.contains as string[]).includes(childId))) {
    throw new Error('Batch-021 children must remain nested under their retained parent clusters')
  }

  if (!same(goal(ids.radiationEquilibrium).requires, [
    'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
    ids.stellarTemperature,
  ])) throw new Error('Radiation-equilibrium prerequisite was not rebound to the temperature child')
  if (!same(goal(ids.planetaryVisibility).requires, [
    'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
    ids.worldview,
  ])) throw new Error('Worldview prerequisite for planetary visibility was not preserved')

  for (const candidate of goals) {
    const staleRequires = (candidate.requires ?? []).filter((goalId: string) => splitParentIds.includes(goalId as never))
    if (staleRequires.length > 0) {
      throw new Error(`${candidate.id}: unadjudicated requires edge to split parent ${staleRequires.join(',')}`)
    }
    const coveredGoalIds = candidate.examData?.coveredGoalIds ?? []
    const forbiddenCoverage = coveredGoalIds.filter((goalId: string) => (
      splitParentIds.includes(goalId as never) || childIds.includes(goalId as never)
    ))
    if (forbiddenCoverage.length > 0) {
      throw new Error(`${candidate.id}: Batch-021 must not infer assessment coverage ${forbiddenCoverage.join(',')}`)
    }
  }

  if (goals.length !== 690) throw new Error(`Unexpected post-Batch-021 canonical count ${goals.length}`)
  assertGraph(goals)
  for (const [goalId, before] of protectedLinkIdentity) {
    const link = (goal(goalId).resourceLinks ?? []).find((candidate: JsonRecord) => candidate.type === 'goal-visualization')
    const after = stableJson({ url: link?.url, provider: link?.provider, assetSha256: protectedAssetHashes[goalId] })
    if (after !== before) throw new Error(`Protected Nano Banana Pro link identity changed for ${goalId}`)
  }
  for (const childId of childIds) {
    if ((goal(childId).resourceLinks ?? []).length !== 0) {
      throw new Error(`Batch-021 child ${childId} must remain without a substitute visual resource`)
    }
  }
  canonical.goals = goals
  return canonical
}

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const decisions = new Map((ledger.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]))
  const refreshedIds = [...acceptedRevisionIds, ...splitParentIds, ...childIds]
  for (const goalId of refreshedIds) {
    const sourceGoal = goalById.get(goalId)
    if (!sourceGoal) throw new Error(`${goalId}: missing semantic-kind source goal`)
    const existing = decisions.get(goalId)
    const splitParent = splitParentIds.includes(goalId as never)
    const child = childIds.includes(goalId as never)
    if (!existing && !child) throw new Error(`${goalId}: missing existing semantic-kind decision`)
    decisions.set(goalId, {
      ...(existing ?? {}),
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(sourceGoal),
      semanticKind: splitParent ? 'curricularArea' : 'curricularAtomic',
      decisionStatus: 'authoritative',
      decisionBasis: splitParent
        ? 'reviewed-current-structural-split-curricular-area'
        : child
          ? 'reviewed-current-structural-split-curricular-atomic'
          : existing?.decisionBasis,
    })
  }
  ledger.decisions = [...decisions.values()].sort((left, right) => {
    const a = String(left.goalId)
    const b = String(right.goalId)
    return a < b ? -1 : a > b ? 1 : 0
  })
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  }
  const order = [
    'curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure',
    'memory', 'runtimeSupport', 'orientation',
  ]
  ledger.counts = Object.fromEntries(order.map((kind) => [kind, counts[kind] ?? 0]))
  ledger.counts.total = ledger.decisions.length
  const expectedCounts = {
    curricularAtomic: 451,
    curricularArea: 95,
    practiceAssessment: 133,
    programStructure: 1,
    memory: 5,
    runtimeSupport: 4,
    orientation: 1,
    total: 690,
  }
  if (!same(ledger.counts, expectedCounts)) {
    throw new Error(`Unexpected post-Batch-021 semantic-kind counts ${stableJson(ledger.counts)}`)
  }
  return ledger
}

function buildReviewLedger(canonical: JsonRecord, semanticKinds: JsonRecord, kind: 'atomicity' | 'memory'): JsonRecord[] {
  const path = kind === 'atomicity' ? paths.atomicity : paths.memory
  const ruleVersion = kind === 'atomicity' ? 'semantic-atomicity-v1' : 'memory-card-review-v1'
  const reasons = kind === 'atomicity' ? atomicityReasons : memoryReasons
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const records = readJsonl(path)
  const byId = new Map(records.map((record) => [String(record.goalId), record]))
  for (const parentId of splitParentIds) byId.delete(parentId)
  for (const goalId of requiredFollowUpGoalIds) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`${goalId}: missing current atomic goal for ${kind}`)
    const existing = byId.get(goalId)
    const reason = reasons[goalId]
    if (!reason) throw new Error(`${goalId}: missing individual ${kind} rationale`)
    if (existing && existing.ruleVersion !== ruleVersion) throw new Error(`${goalId}: ${kind} rule drift`)
    const base = existing ?? {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion,
      landscapeId: physicsLandscapeId,
      goalId,
    }
    if (kind === 'atomicity') {
      Object.assign(base, {
        fingerprint: reviewFingerprint(goal, ruleVersion),
        reviewedAt,
        reviewer,
        status: 'atomic',
        semanticAtomic: true,
        reason,
        suggestedSplit: [],
      })
    } else {
      Object.assign(base, {
        fingerprint: reviewFingerprint(goal, ruleVersion),
        status: 'no_memory_needed',
        memoryUseful: false,
        reviewedAt,
        reviewer,
        reason,
      })
      delete base.memoryGoalIds
      delete base.deckIds
    }
    byId.set(goalId, base)
  }
  const result = [...byId.values()].sort((left, right) => {
    const a = String(left.goalId)
    const b = String(right.goalId)
    return a < b ? -1 : a > b ? 1 : 0
  })
  const expectedAtomicIds = sortStrings((semanticKinds.decisions as JsonRecord[])
    .filter((decision) => decision.semanticKind === 'curricularAtomic')
    .map((decision) => String(decision.goalId)))
  const actualIds = result.map((record) => String(record.goalId))
  if (result.length !== 451 || !same(actualIds, expectedAtomicIds)) {
    throw new Error(`${kind} ledger does not exactly cover the 451 current curricularAtomic Physics goals`)
  }
  return result
}

function replaceMappingRows(
  mappings: JsonRecord[],
  sourceGoalId: string,
  adjudication: MappingAdjudication,
): void {
  const indexes = mappings
    .map((mapping, index) => mapping.legacyGoalId === sourceGoalId ? index : -1)
    .filter((index) => index >= 0)
  if (indexes.length === 0) throw new Error(`Missing mapping rows for ${sourceGoalId}`)
  if (indexes.some((index, offset) => index !== indexes[0] + offset)) {
    throw new Error(`Non-contiguous mapping rows for ${sourceGoalId}`)
  }
  const replacement = adjudication.canonicalGoalIds.map((canonicalGoalId, index) => ({
    legacyGoalId: sourceGoalId,
    canonicalGoalId,
    matchType: adjudication.matchTypes[index],
    reviewDecisionId: sourceGoalId,
  }))
  mappings.splice(indexes[0], indexes.length, ...replacement)
}

function buildMappingReview(
  path: string,
  sourceLandscapeId: string,
  adjudications: Record<string, MappingAdjudication>,
): JsonRecord {
  const review = readJson(path)
  if (
    review.sourceLandscapeId !== sourceLandscapeId
    || review.targetLandscapeId !== physicsLandscapeId
    || !Array.isArray(review.decisions)
    || !Array.isArray(review.mappings)
  ) throw new Error(`Unexpected Physics mapping review ${path}`)
  const decisions = new Map((review.decisions as JsonRecord[])
    .map((decision) => [String(decision.sourceGoalId), decision]))
  for (const [sourceGoalId, adjudication] of Object.entries(adjudications)) {
    const decision = decisions.get(sourceGoalId)
    if (!decision || decision.decision !== 'mapped') throw new Error(`${path}: missing mapped decision ${sourceGoalId}`)
    decision.canonicalGoalIds = [...adjudication.canonicalGoalIds]
    decision.rationale = adjudication.rationale
    decision.reviewedAt = reviewedAt
    decision.reviewer = reviewer
    replaceMappingRows(review.mappings as JsonRecord[], sourceGoalId, adjudication)
  }
  for (const [sourceGoalId, adjudication] of Object.entries(adjudications)) {
    const decision = decisions.get(sourceGoalId)!
    const mappingTargets = (review.mappings as JsonRecord[])
      .filter((mapping) => mapping.legacyGoalId === sourceGoalId)
      .map((mapping) => ({
        canonicalGoalId: mapping.canonicalGoalId,
        matchType: mapping.matchType,
      }))
    const expectedTargets = adjudication.canonicalGoalIds.map((canonicalGoalId, index) => ({
      canonicalGoalId,
      matchType: adjudication.matchTypes[index],
    }))
    if (!same(decision.canonicalGoalIds, adjudication.canonicalGoalIds) || !same(mappingTargets, expectedTargets)) {
      throw new Error(`${path}: mapping adjudication mismatch for ${sourceGoalId}`)
    }
  }
  const splitParents = new Set<string>(splitParentIds)
  for (const decision of review.decisions as JsonRecord[]) {
    const stale = (decision.canonicalGoalIds ?? []).filter((goalId: string) => splitParents.has(goalId))
    if (stale.length > 0) throw new Error(`${path}: decision ${decision.sourceGoalId} retains split parent ${stale}`)
  }
  for (const mapping of review.mappings as JsonRecord[]) {
    if (splitParents.has(mapping.canonicalGoalId)) {
      throw new Error(`${path}: mapping ${mapping.legacyGoalId} retains split parent ${mapping.canonicalGoalId}`)
    }
  }
  const expectedMappingCount = path === paths.byMapping ? 995 : 220
  if ((review.mappings as JsonRecord[]).length !== expectedMappingCount) {
    throw new Error(`${path}: unexpected post-Batch-021 mapping count ${(review.mappings as JsonRecord[]).length}`)
  }
  return review
}

function buildProvenance(byMapping: JsonRecord, hhMapping: JsonRecord): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[])
    .find((entry) => entry.landscapeId === physicsLandscapeId)
  if (!landscape?.goalProvenance || typeof landscape.goalProvenance !== 'object') {
    throw new Error('Missing canonical Physics provenance landscape')
  }
  const reviews = [byMapping, hhMapping]
  const preferredSourceGoalIds: Record<string, string> = {
    [ids.astrometry]: 'f794cbd9-db43-54e9-9abe-45fae5724705',
    [ids.radialVelocity]: 'cc2ffcad-52de-5a1c-8d32-c9264dd135d3',
    [ids.spectralClassification]: 'cc2ffcad-52de-5a1c-8d32-c9264dd135d3',
    [ids.fraunhofer]: '0337c4aa-9350-583c-89e2-e136e1f813e5',
    [ids.stellarTemperature]: '0337c4aa-9350-583c-89e2-e136e1f813e5',
    [ids.binaryGwMass]: '09a09524-4d0c-5f3f-b39e-3e669970a6a3',
    [ids.gwGeneration]: '09a09524-4d0c-5f3f-b39e-3e669970a6a3',
  }
  for (const childId of childIds) {
    const sources: Array<{ sourceLandscapeId: string; sourceGoalId: string }> = []
    for (const review of reviews) {
      for (const mapping of review.mappings as JsonRecord[]) {
        if (mapping.canonicalGoalId === childId) {
          sources.push({
            sourceLandscapeId: String(review.sourceLandscapeId),
            sourceGoalId: String(mapping.legacyGoalId),
          })
        }
      }
    }
    const preferred = sources.find((source) => source.sourceGoalId === preferredSourceGoalIds[childId])
    if (!preferred) throw new Error(`Missing preferred source provenance for Batch-021 child ${childId}`)
    const additionalSourceLandscapeIds = sortStrings([...new Set(sources
      .map((source) => source.sourceLandscapeId)
      .filter((sourceLandscapeId) => sourceLandscapeId !== preferred.sourceLandscapeId))])
    const expected = {
      sourceLandscapeId: preferred.sourceLandscapeId,
      sourceGoalId: preferred.sourceGoalId,
      ...(additionalSourceLandscapeIds.length > 0 ? { additionalSourceLandscapeIds } : {}),
    }
    const existing = landscape.goalProvenance[childId]
    if (existing && !same(existing, expected)) {
      throw new Error(`Conflicting existing provenance for Batch-021 child ${childId}`)
    }
    landscape.goalProvenance[childId] = expected
  }
  landscape.goalProvenance = Object.fromEntries(Object.entries(landscape.goalProvenance)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0))
  if (Object.keys(landscape.goalProvenance).length !== 442) {
    throw new Error(`Unexpected post-Batch-021 Physics provenance count ${Object.keys(landscape.goalProvenance).length}`)
  }
  return registry
}

const visualizationReviewNotes: Record<string, string> = Object.fromEntries([
  ...acceptedRevisionIds.map((goalId) => [
    goalId,
    'Batch 081 compatibility review: The existing Nano Banana Pro asset remains consistent with the bounded Batch-021 bilingual wording revision. No proposition in the retained image contradicts the final goal; image and historical prompt bytes remain unchanged.',
  ]),
  [
    ids.parallaxCluster,
    'Batch 081 compatibility review: The byte-identical Nano Banana Pro overview remains appropriate for the retained cluster because it jointly depicts parallax, Doppler shift, and stellar spectra. It is not claimed as a child-specific visual; image and historical prompt bytes remain unchanged.',
  ],
  [
    ids.spectraTemperatureCluster,
    'Batch 081 compatibility review: The byte-identical Nano Banana Pro overview remains appropriate for the retained cluster because it jointly depicts Fraunhofer absorption lines and stellar temperature laws. It is not claimed as a child-specific visual; image and historical prompt bytes remain unchanged.',
  ],
  [
    ids.binaryGwCluster,
    'Batch 081 compatibility review: The byte-identical Nano Banana Pro overview remains appropriate for the retained cluster because it jointly depicts binary-system mass inference and gravitational-wave signals. It is not claimed as a child-specific visual; image and historical prompt bytes remain unchanged.',
  ],
])

function buildVisualizationQa(canonical: JsonRecord): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const byId = new Map((qa.records as JsonRecord[]).map((record) => [String(record.goalId), record]))
  for (const goalId of existingVisualGoalIds) {
    const goal = goalById.get(goalId)
    const record = byId.get(goalId)
    const expectedHash = protectedAssetHashes[goalId]
    if (!goal || !record || record.assetSha256 !== `sha256:${expectedHash}`) {
      throw new Error(`${goalId}: visualization-QA asset binding drifted`)
    }
    const note = visualizationReviewNotes[goalId]
    if (!note) throw new Error(`${goalId}: missing Batch-081 visual compatibility note`)
    Object.assign(record, {
      title: goal.title,
      description: goal.description,
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      chatGptReviewedAt: visualizationReviewedAt,
      chatGptReviewer: visualizationReviewer,
      chatGptNotes: note,
      aiApproved: 'yes',
      aiApprovedAssetSha256: record.assetSha256,
      aiReviewedAt: visualizationReviewedAt,
      aiReviewer: visualizationReviewer,
      aiNotes: note,
    })
  }
  for (const childId of childIds) {
    const goal = goalById.get(childId)
    if (!goal) throw new Error(`Missing Batch-021 child for visualization QA ${childId}`)
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
  qa.records = [...byId.values()].sort((left, right) => (
    String(left.title).localeCompare(String(right.title), 'de-DE', { numeric: true, sensitivity: 'base' })
    || (String(left.goalId) < String(right.goalId) ? -1 : String(left.goalId) > String(right.goalId) ? 1 : 0)
  ))
  if (qa.records.length !== 468) throw new Error(`Unexpected post-Batch-021 visualization-QA count ${qa.records.length}`)
  return qa
}

function buildVisualizationReview(canonical: JsonRecord): string {
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const existingRows = existingVisualGoalIds.map((goalId) => {
    const goal = goalById.get(goalId)!
    const decision = splitParentIds.includes(goalId as never)
      ? 'accepted_existing_asset_as_cluster_overview'
      : 'accepted_existing_asset_metadata_rebound'
    const note = splitParentIds.includes(goalId as never)
      ? 'Stabile Eltern-ID ist nun ein Cluster; das vorhandene Überblicksbild bleibt ausschließlich dort gebunden.'
      : 'Die begrenzte Textrevision bleibt mit dem vorhandenen, bereits fachlich akzeptierten Bild vereinbar.'
    return `| \`${goalId}\` | ${goal.title} | \`${decision}\` | ${note} Asset SHA-256: \`sha256:${protectedAssetHashes[goalId]}\`. |`
  }).join('\n')
  const childRows = childIds.map((goalId) => {
    const goal = goalById.get(goalId)!
    return `| \`${goalId}\` | ${goal.title} | \`deferred_provider_limitation\` | Kein Ersatzbild erzeugt; eine spätere Visualisierung bleibt einem fachlich geprüften Nano-Banana-Pro-Lauf vorbehalten. |`
  }).join('\n')
  return `# Physik goal visualization review – Batch 081

Review date: 2026-08-28

Scope: Visual compatibility and metadata rebinding for the bounded Batch-021
astrophysics adjudication. All sixteen existing Google Gemini / Nano Banana Pro
assets remain byte-identical. Historical \`prompt.de.md\` and
\`image-reconstruction-prompt.de.md\` files remain byte-identical as generation
provenance. The three retained parent IDs keep their images as cluster
overviews. No hand-authored, programmatic, self-generated, or substitute-provider
image was created for any of the seven new children.

Human-review fields remain unchanged and open.

| Goal ID | Goal title | Decision | Notes |
|---|---|---|---|
${existingRows}
${childRows}

## Byte and provider boundary

- Existing canonical and public JPG copies remain byte-identical for every
  retained goal listed above.
- Canonical resource links keep their exact URL, provider, licence, and asset
  identity; only title/description bindings are synchronized to the adjudicated
  goal text.
- The seven new child records use exactly
  \`missingReason: deferred_provider_limitation\`; they have no resource link and
  no visualization directory with generated content.
`
}

function assertCompositionViews(): Map<string, JsonRecord> {
  const views = new Map<string, JsonRecord>()
  for (const path of compositionViewPaths) {
    const view = readJson(path)
    for (const parentId of splitParentIds) {
      if (countGoalReferences(view, parentId) !== 1) {
        throw new Error(`${path}: retained Batch-021 parent ${parentId} must appear exactly once`)
      }
    }
    for (const childId of childIds) {
      if (countGoalReferences(view, childId) !== 0) {
        throw new Error(`${path}: Batch-021 child ${childId} must be inherited below its parent, not duplicated`)
      }
    }
    views.set(path, view)
  }
  return views
}

function insertBeforeOnce(source: string, marker: string, anchor: string, insertion: string, label: string): string {
  if (source.includes(marker)) return source
  const first = source.indexOf(anchor)
  if (first < 0 || source.indexOf(anchor, first + anchor.length) >= 0) {
    throw new Error(`${label}: expected one insertion anchor`)
  }
  return `${source.slice(0, first)}${insertion}\n\n${source.slice(first)}`
}

function replaceOnceOrAfter(source: string, before: string, after: string, label: string): string {
  if (source.includes(after)) return source
  const first = source.indexOf(before)
  if (first < 0 || source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${label}: expected one replacement anchor`)
  }
  return `${source.slice(0, first)}${after}${source.slice(first + before.length)}`
}

function buildByGenerator(): string {
  let source = readFileSync(absolute(paths.byGenerator), 'utf8')
  const definitions = `// Batch 021 astrophysics structural adjudication overlay
const batch021SplitParentIds = new Set(${JSON.stringify([...splitParentIds])})
const batch021TargetsBySourceGoalId: Record<string, Array<{ targetGoalId: string; matchType: 'exact' | 'partial' }>> = ${JSON.stringify(Object.fromEntries(
    Object.entries(byMappingAdjudications).map(([sourceGoalId, adjudication]) => [
      sourceGoalId,
      adjudication.canonicalGoalIds
        .map((targetGoalId) => ({
          targetGoalId,
          matchType: adjudication.matchTypes[adjudication.canonicalGoalIds.indexOf(targetGoalId)],
        })),
    ]),
  ), null, 2)}
const batch021MappingRationaleBySourceGoalId: Record<string, string> = ${JSON.stringify(Object.fromEntries(
    Object.entries(byMappingAdjudications).map(([sourceGoalId, adjudication]) => [sourceGoalId, adjudication.rationale]),
  ), null, 2)}`
  source = insertBeforeOnce(
    source,
    '// Batch 021 astrophysics structural adjudication overlay',
    'const applyPhysicsBatch015Targets = (',
    definitions,
    'BY generator Batch-021 definitions',
  )
  source = replaceOnceOrAfter(
    source,
    '  const retained = targets.filter((target) => !batch015SplitParentIds.has(target.canonicalGoalId) && !batch017SplitParentIds.has(target.canonicalGoalId))',
    `  const batch021Targets = batch021TargetsBySourceGoalId[sourceGoalId]
  if (batch021Targets) {
    return batch021Targets.map((target) => ({
      canonicalGoalId: target.targetGoalId,
      matchType: target.matchType,
    }))
  }
  const retained = targets.filter((target) => !batch015SplitParentIds.has(target.canonicalGoalId) && !batch017SplitParentIds.has(target.canonicalGoalId) && !batch021SplitParentIds.has(target.canonicalGoalId))`,
    'BY generator split-parent filter',
  )
  source = insertBeforeOnce(
    source,
    '// Batch 021 source-specific mapping rationales.',
    '  const mappings = decisions.flatMap((decision) => {',
    `  // Batch 021 source-specific mapping rationales.
  for (const decision of decisions) {
    const batch021Rationale = batch021MappingRationaleBySourceGoalId[decision.sourceGoalId]
    if (!batch021Rationale) continue
    decision.rationale = batch021Rationale
    decision.reviewedAt = '2026-08-28'
    decision.reviewer = '${reviewer}'
  }`,
    'BY generator Batch-021 rationale overlay',
  )
  return source
}

function buildHhGenerator(): string {
  let source = readFileSync(absolute(paths.hhGenerator), 'utf8')
  source = replaceOnceOrAfter(
    source,
    `  stellarSpectra: '${ids.spectraTemperatureCluster}',`,
    `  stellarSurfaceTemperature: '${ids.stellarTemperature}',`,
    'HH generator temperature target',
  )
  source = replaceOnceOrAfter(
    source,
    `  gravitationalWaves: '${ids.binaryGwCluster}',`,
    `  gravitationalWaveGeneration: '${ids.gwGeneration}',`,
    'HH generator gravitational-wave target',
  )
  source = replaceOnceOrAfter(
    source,
    "  row('4.2', 'Gravitationswellen als Abstrahlung beschleunigter Massen beschreiben', [target.gravitationalWaves]),",
    "  row('4.2', 'Gravitationswellen als Abstrahlung beschleunigter Massen beschreiben', [target.gravitationalWaveGeneration]),",
    'HH generator gravitational-wave source row',
  )
  source = replaceOnceOrAfter(
    source,
    "  row('4.2', 'Messverfahren von Gravitationswellen mit dem Interferometer LIGO erläutern', [target.gravitationalWaves, target.interferometer]),",
    "  row('4.2', 'Messverfahren von Gravitationswellen mit dem Interferometer LIGO erläutern', [target.interferometer]),",
    'HH generator LIGO source row',
  )
  source = replaceOnceOrAfter(
    source,
    "  row('4.2', 'Stefan-Boltzmann-Gesetz für schwarze Strahler und Strahlungsleistung anwenden', [target.stellarSpectra, target.radiationBalance]),",
    "  row('4.2', 'Stefan-Boltzmann-Gesetz für schwarze Strahler und Strahlungsleistung anwenden', [target.stellarSurfaceTemperature, target.radiationBalance]),",
    'HH generator Stefan-Boltzmann source row',
  )

  const hhByText = {
    'Gravitationswellen als Abstrahlung beschleunigter Massen beschreiben': hhMappingAdjudications['hh-physics-sekii-bp2022-4-2-147-dadec209'],
    'Messverfahren von Gravitationswellen mit dem Interferometer LIGO erläutern': hhMappingAdjudications['hh-physics-sekii-bp2022-4-2-148-83499da7'],
    'Stefan-Boltzmann-Gesetz für schwarze Strahler und Strahlungsleistung anwenden': hhMappingAdjudications['hh-physics-sekii-bp2022-4-2-151-805f5883'],
  }
  const definitions = `// Batch 021 source-specific astrophysics mapping adjudications.
const batch021MappingAdjudicationBySourceText: Record<string, { rationale: string; matchTypes: Array<'exact' | 'partial'> }> = ${JSON.stringify(Object.fromEntries(
    Object.entries(hhByText).map(([text, adjudication]) => [text, {
      rationale: adjudication.rationale,
      matchTypes: adjudication.matchTypes,
    }]),
  ), null, 2)}`
  source = insertBeforeOnce(
    source,
    '// Batch 021 source-specific astrophysics mapping adjudications.',
    'const mappings = rows.flatMap((currentRow, index) => {',
    definitions,
    'HH generator Batch-021 definitions',
  )
  source = replaceOnceOrAfter(
    source,
    `const mappings = rows.flatMap((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  return currentRow.canonicalGoalIds.map((canonicalGoalId) => ({
    legacyGoalId: sourceGoal.id,
    canonicalGoalId,
    matchType: currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
    reviewDecisionId: sourceGoal.id,
  }))
})`,
    `const mappings = rows.flatMap((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  const batch021Adjudication = batch021MappingAdjudicationBySourceText[currentRow.text]
  return currentRow.canonicalGoalIds.map((canonicalGoalId, targetIndex) => ({
    legacyGoalId: sourceGoal.id,
    canonicalGoalId,
    matchType: batch021Adjudication?.matchTypes[targetIndex]
      ?? (currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial'),
    reviewDecisionId: sourceGoal.id,
  }))
})`,
    'HH generator mapping match types',
  )
  source = replaceOnceOrAfter(
    source,
    `    rationale:
      currentRow.canonicalGoalIds.length > 1
        ? 'Das Hamburger Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
        : 'Das Hamburger Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.',
    reviewedAt: '2026-05-10',
    reviewer: 'codex',`,
    `    rationale: batch021MappingAdjudicationBySourceText[currentRow.text]?.rationale
      ?? (currentRow.canonicalGoalIds.length > 1
        ? 'Das Hamburger Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
        : 'Das Hamburger Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.'),
    reviewedAt: batch021MappingAdjudicationBySourceText[currentRow.text] ? '2026-08-28' : '2026-05-10',
    reviewer: batch021MappingAdjudicationBySourceText[currentRow.text]
      ? '${reviewer}'
      : 'codex',`,
    'HH generator mapping rationales',
  )
  return source
}

function assertGeneratedTypeScriptSyntax(path: string, source: string): void {
  const result = ts.transpileModule(source, {
    fileName: path,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  })
  const errors = (result.diagnostics ?? []).filter((diagnostic) => (
    diagnostic.category === ts.DiagnosticCategory.Error
  ))
  if (errors.length > 0) {
    const formatted = ts.formatDiagnostics(errors, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => repoRoot,
      getNewLine: () => '\n',
    })
    throw new Error(`Generated TypeScript syntax failed for ${path}:\n${formatted}`)
  }
}

function changedPlannedFiles(files: PlannedFile[]): PlannedFile[] {
  return files.filter(({ path, bytes }) => !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)
}

function assertOutputBoundary(files: PlannedFile[]): void {
  const expected = new Set<string>([
    paths.canonical,
    paths.semanticKinds,
    paths.atomicity,
    paths.memory,
    paths.byMapping,
    paths.hhMapping,
    paths.provenance,
    paths.visualizationQa,
    paths.visualizationReview,
    paths.byGenerator,
    paths.hhGenerator,
    ...compositionViewPaths,
  ])
  const actual = new Set(files.map((file) => file.path))
  if (actual.size !== expected.size || [...actual].some((path) => !expected.has(path))) {
    throw new Error('Batch-021 planned outputs escaped the exact canonical/QA/mapping/generator/provenance/four-view boundary')
  }
}

function assertAppendOnlyStates(files: PlannedFile[]): void {
  for (const { path, bytes, appendOnly } of files) {
    if (!appendOnly || !existsSync(absolute(path))) continue
    if (readFileSync(absolute(path), 'utf8') !== bytes) {
      throw new Error(`Refusing to overwrite append-only Batch-021 artifact ${path}`)
    }
  }
}

assertProtectedInputs()
const adjudication = loadAdjudication()
const currentCanonical = readJson(paths.canonical)
const preState = canonicalIsPreState(currentCanonical)
assertBeforeBindings(adjudication, preState)

const canonical = buildCanonical(adjudication)
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = buildReviewLedger(canonical, semanticKinds, 'atomicity')
const memory = buildReviewLedger(canonical, semanticKinds, 'memory')
const byMapping = buildMappingReview(paths.byMapping, bySourceLandscapeId, byMappingAdjudications)
const hhMapping = buildMappingReview(paths.hhMapping, hhSourceLandscapeId, hhMappingAdjudications)
const provenance = buildProvenance(byMapping, hhMapping)
const visualizationQa = buildVisualizationQa(canonical)
const visualizationReview = buildVisualizationReview(canonical)
const byGenerator = buildByGenerator()
const hhGenerator = buildHhGenerator()
assertGeneratedTypeScriptSyntax(paths.byGenerator, byGenerator)
assertGeneratedTypeScriptSyntax(paths.hhGenerator, hhGenerator)
const compositionViews = assertCompositionViews()

const plannedFiles: PlannedFile[] = [
  { path: paths.canonical, bytes: serializeJson(canonical) },
  { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
  { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
  { path: paths.memory, bytes: serializeJsonl(memory) },
  { path: paths.byMapping, bytes: serializeJson(byMapping) },
  { path: paths.hhMapping, bytes: serializeJson(hhMapping) },
  { path: paths.provenance, bytes: serializeJson(provenance) },
  { path: paths.visualizationQa, bytes: serializeJson(visualizationQa) },
  { path: paths.visualizationReview, bytes: visualizationReview, appendOnly: true },
  { path: paths.byGenerator, bytes: byGenerator },
  { path: paths.hhGenerator, bytes: hhGenerator },
  ...[...compositionViews].map(([path, view]) => ({ path, bytes: serializeJson(view) })),
]
assertOutputBoundary(plannedFiles)
assertAppendOnlyStates(plannedFiles)

const boundedPlanSha256 = sha256(stableJson({
  adjudicationSha256: expectedAdjudicationSha256,
  followUpConfigSha256: expectedFollowUpConfigSha256,
  requiredFollowUpGoalIds,
  acceptedRevisionIds,
  splitParentIds,
  childIds,
  byMappingAdjudications,
  hhMappingAdjudications,
  atomicityReasons,
  memoryReasons,
  protectedAssetHashes,
  protectedPromptHashes,
  protectedUnchangedHashes,
  visualizationReviewSha256: sha256(visualizationReview),
  plannedOutputBindings: plannedFiles.map(({ path, bytes, appendOnly }) => ({
    path,
    sha256: sha256(bytes),
    appendOnly: appendOnly === true,
  })),
}))
if (expectedBoundedPlanSha256 !== 'PENDING' && boundedPlanSha256 !== expectedBoundedPlanSha256) {
  throw new Error(`Batch-021 bounded plan drift: ${boundedPlanSha256} != ${expectedBoundedPlanSha256}`)
}

const changed = changedPlannedFiles(plannedFiles)
if (checkMode && changed.length > 0) {
  throw new Error(`Batch-021 is not applied; ${changed.length} planned files differ`)
}

if (writeMode) {
  if (expectedBoundedPlanSha256 === 'PENDING') {
    throw new Error(`Refusing --write until expectedBoundedPlanSha256 is bound to ${boundedPlanSha256}`)
  }
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  for (const { path, bytes, appendOnly } of changed) {
    mkdirSync(dirname(absolute(path)), { recursive: true })
    if (appendOnly) writeFileSync(absolute(path), bytes, { flag: 'wx' })
    else writeFileSync(absolute(path), bytes)
  }
  assertProtectedInputs()
}

const status = writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'
console.log(
  `CHECK apply_physics_batch021_astrophysics_adjudication ${status} `
  + `revisions=13 splitParents=3 children=7 followUp=20 mappings=BY4+HH3 `
  + `views=4-noop assessments=unchanged curricularAtomic=${semanticKinds.counts.curricularAtomic} `
  + `curricularArea=${semanticKinds.counts.curricularArea} plannedWrites=${changed.length} `
  + `files=${changed.map(({ path }) => basename(path)).join(',') || '-'}`,
)
console.log(`BOUNDED_PLAN_SHA256 ${boundedPlanSha256}`)
console.log(`OUTPUT_HASHES ${JSON.stringify(Object.fromEntries(plannedFiles.map(({ path, bytes }) => [path, sha256(bytes)])))}`)
console.log('PRESERVE existing-nbp-assets=16 historical-prompts=17 views=4 source-extractions=2 source-registries=2 assessments=all')
console.log('DEFER child-visualizations=7 provider=Google-Gemini-Nano-Banana-Pro no-substitute-assets')
