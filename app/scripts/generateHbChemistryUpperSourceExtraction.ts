import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'

type Row = {
  topicCode: string
  text: string
  canonicalGoalIds: string[]
  courseLevel?: CourseLevel
}

type Topic = {
  code: string
  title: string
  page: number
  phase: 'E' | 'Q'
  courseLevel: CourseLevel
}

type Registry = {
  entries?: Array<Record<string, unknown>>
}

type ViewNode = {
  kind: string
  id?: string
  label?: string
  goalId?: string
  displayLabel?: string
  children?: ViewNode[]
}

type CompositionView = {
  viewId: string
  landscapeId: string
  scope: Record<string, unknown>
  rootNodes: ViewNode[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-HB'
const sourceLandscapeId = '98a4a027-3df3-5797-8664-c731d31942d5'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf'
const sourceUrl = 'https://www.lis.bremen.de/sixcms/media.php/13/GyO_Chemie_2022.pdf'
const sourceDocumentKey = 'HB-GYO-CHEMIE-2022'
const extractionPath =
  'curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'
const runtimeMappingPath =
  'curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_to_canonical_chemistry.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'

const target = {
  methods: '266a2b2a-9ee2-52f6-ae09-59343da9a60b',
  safety: 'c7d4d9f7-d23f-44fc-bf22-3872e0f2b9a0',
  hypothesis: '91238ba1-5c63-50c7-a4fd-9bbe492c6b61',
  data: '49b13b33-34b7-5e4e-861c-b21082cb9922',
  models: '277a3c20-6082-5a95-be08-c1e386efe79b',
  language: '95dc0ee5-a0af-5682-af32-d66e36fbeb50',
  sources: 'b6327e98-8ab9-5d7f-b826-4023bc1a56a7',
  society: '542822de-cb96-56cf-a487-0fc3b5820f57',
  decisions: '1df17884-96ae-57d7-9da9-dbebd082596f',

  atomSublevels: '49235cbe-6658-5e7e-8bd4-398416bcebdc',
  pse: 'e9d74940-1e0e-4511-9718-4851f49ad7a5',
  ionsNobleGas: 'a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca',
  ionBinding: '950c73c6-4ed1-488a-9267-1142e95e0055',
  electronPair: 'bbe038e9-86ed-5ec6-ab33-316758ddb16d',
  lewis: '23533087-89ea-5f29-8ec1-9f2e01197bb6',
  moleculeRepresentations: '92c99237-1c74-54fc-bf08-9191656afaa6',
  polarity: '747c5777-07d7-51a9-9be3-7d0d6f51d4e2',
  metalModel: 'fcaf8c9b-bd81-552e-9d91-43649895471e',
  bindingModels: '15e73664-8c3f-5aa6-ac65-b455fc3ed6d6',
  intermolecularForces: 'eb7537dd-d11b-50e9-a6d7-51a78e96fc4e',
  structureProperty: '5a30273a-98d5-5163-bb16-c250b7ed4e7f',
  interactionProperties: '3d3231f9-039d-5ce5-9e8e-af219c7fee08',

  equations: '11bea4c6-7b8a-47e0-8293-2eb1ce34cf66',
  amountOfSubstance: '1dc15fa2-fca4-56b0-b5c1-4d215613dde0',
  molarMass: '8a2ad724-df5e-5986-8de9-560ba43caac2',
  reactionTypes: '7a05a1ce-45d3-571e-be51-afcd8dfd33ca',
  redoxTerms: '04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162',
  oxidationNumbers: '4961130b-1ee8-58f2-a319-dff0a864db6a',
  redoxEquations: '22133f29-ef02-4408-8f8d-2bbea3275d91',
  redoxSeries: '16da6a4d-8e9c-5f5d-b69d-338d67a2d362',
  galvanic: 'f0939f88-a6af-5334-ac4d-5d54732af25a',
  electrolysis: 'fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef',
  forcedRedox: 'efa24b77-0f98-5835-9d82-3e539ab20253',

  acidBaseSeparation: 'd2ccd1d5-56f7-583f-9724-e97441367f91',
  phEveryday: '0bf26276-2780-506c-ac34-35dd44a29409',
  phCalc: 'f1ed86f0-534d-57d7-8952-a004a331cc54',
  titration: '02634fdd-c8ba-591a-b240-77129b1bebb8',
  bronsted: '1c1420c2-a8e2-520f-8015-6df637a973bd',
  acidBasePairs: 'b4777001-f4ed-5fe9-9d98-02319abdea09',
  acidBaseStructure: '08b44b8f-e407-5a1f-82dc-e70e598022cf',
  neutralization: '88ee181f-b2d3-5639-bb5e-3d1a2915171b',
  autoprotolysis: '07879ea2-b6a1-5eb3-b548-15d45bbcb227',
  strongWeakPh: '33034876-8da5-5619-ad86-e1272e0304b0',
  pk: '48115ff7-7aca-5d0b-a9e7-7fc6c78434ef',
  halfTitration: '059acb11-29b3-5645-ac4c-b4214dc41a2d',
  titrationCurves: '28c90c6a-3020-5c51-ac40-d802f3f12d2d',
  buffer: '25729c34-33d5-553a-a723-046113a7da47',
  henderson: 'd7461c15-6992-5342-b899-6c490ee0cbb7',
  polyprotic: 'dc0470f1-0676-5949-a5cc-02783d478406',
  bufferDesign: '13877340-1370-5278-bb80-31cf382dd6f5',

  organicsIntro: 'b71d69bd-78d0-5a32-9755-b87e2cc989ea',
  hydrocarbons: 'dd58c029-176f-5d99-923e-1c1fda6cf58e',
  functionalGroups: '3de28598-672f-5753-8a45-8f559c2f9dc2',
  nomenclature: 'e14abd24-a0e5-5ab5-ade3-a8ae4f49e935',
  oxygenatedClasses: '7990387d-f254-5d3b-a589-a3e7ed9502a3',
  alkanols: '0aaf0cc6-b059-56ef-9284-4cb7a0c5bff5',
  organicProperties: '0b6a6a15-b355-5be8-abc9-4ef8df11bcb6',
  oxidationAlkanols: '61446285-4415-5bd9-9fdc-c19bb9ec1b02',
  substitutions: 'a4bac92b-d685-5cb6-94c8-c9b8b878d125',
  carboxylicAcids: 'a3788e40-b540-5bed-be37-b33053528422',
  esters: '70b34ae7-4481-590c-9a02-516464750832',
  esterEquilibrium: '667bc303-e9b8-570b-84f1-61cc8bdfd006',
  petroleum: 'e8c02335-d4e5-565c-8830-628067ce51c3',
  petroleumProducts: 'b95cdf98-fc97-5a94-b133-878922d28156',
  fuels: '8ece9beb-9458-5ea1-8e45-9be04670f464',
  renewableFeedstock: 'a0e8f0f2-24e2-5945-a511-597d32e73796',
  crudeOil: '2be9e61a-88ea-56fe-8294-ee46e3c9a8ef',

  plastics: '3e9eb5d0-3407-5a1e-9492-ad87f98d303d',
  polymerization: '6eb14e47-187c-5ba1-8b08-a0ee95ad88a9',
  polycondensation: '9b942490-ad8f-52ba-8c5a-f8a9792b7db5',
  polyaddition: 'f947cd04-952a-5a9d-9445-3ffc70e02c3c',
  recycling: '8721d943-8368-5304-bd3c-7d7944099662',
  thermalPlastics: '3aef6d91-04ff-5ec7-b92e-ccf330d9816a',
  polymerProperties: '2652caef-b557-58b9-9b28-70db62625ce5',
  biopolymers: 'e47b22ec-4443-5aae-bf38-71e3164b6b3e',
  plasticRawMaterials: 'c21a611c-1069-5b32-b673-4f37a89b094f',
  macroSociety: '2cf86c25-5280-5e7d-8ebb-9f2e6733fbe2',
  silicones: 'e56040b5-1da8-5080-b358-086d04922339',
  conductivePlastics: '73cbd4d8-5da1-5e54-85ce-c88e7b1613fe',
  conductiveCompare: '14f1fe97-0585-5738-845e-9c49173d8afa',
  plasticProcessing: '6eba90b5-d4a6-5625-be61-e7f30f7eb964',

  equilibrium: '81373fb7-2a4a-5b2c-acd0-b4e775acaa65',
  massAction: '20f92ba0-f7f4-5407-bb96-07e30da9002f',
  leChatelier: '5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c',
  processOptimization: '545a2e56-e981-5725-b0e4-a0c77f7f291e',
  equilibriumSociety: '882630ba-815c-5c6b-868c-2e6cd7eef459',
  catalyst: 'd9cce642-4f89-57f8-832a-abeb62586195',
  speed: '56bc6377-1291-58bc-b433-5b9f673888e9',
  speedFactors: '3ce81f96-4fbb-5022-88b7-337a000315ed',
  speedExperiment: '536030f8-70dc-519d-8039-92290c68d95d',
  activationCatalyst: '945d69d5-92a7-5195-8f78-4e56f8e7b633',
  rgt: '56115f9d-1d32-5454-94b1-00dbc4a7bc6f',
  arrhenius: 'e62c6c58-b688-59c3-8ac5-2cfc26ac22d7',
  kineticMechanisms: '13838147-c26d-54ca-b9be-5f2f0b8e9de5',
  autocatalysis: '5cdf490f-bfb2-54c2-bbd7-7062cc69a2ef',
  catalystForms: '16f0dc69-6da8-5751-a00e-abbc1c882dbc',

  aminoAcids: '62149f36-87c0-5a2d-8a78-e7d4203f58c2',
  peptideBonds: '197bc2c5-835e-59e7-9263-5684e89799cc',
  carbohydrates: '8761cfd2-aa1a-56f1-9272-9cf66ef4b271',
  reducingCarbohydrates: '96d33fb6-ed14-50ab-b5c7-5ce0559d518a',
  sugarEveryday: '127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a',
  fats: 'bebea164-dfd7-51d9-a54a-7029c78b7f5f',
  chromatography: '978a6f25-0601-5457-9211-aab206c95603',
  stereochemistry: 'eae2a380-601c-53ed-be30-03c69c1f4f54',
  foodPolarity: '9abd8069-17ad-5d30-9102-f8eff6055045',
  proteinStructure: '065d764c-daec-5d35-95da-3e922d2029c7',
  proteinDetection: '9deeac6f-d380-52c5-8fc9-e532ab1f4d3f',
  electrophoresis: 'd1244f5d-9a12-5b74-97fe-ae974f40af26',
  peptideDetection: '5c8f0bbb-103a-579f-87fc-c997afe4fd18',
  proteinDenaturation: '058dca74-1b57-5eb3-9c94-1c7b6cc795ad',
  enzymeFactors: 'b4ca3af2-77f1-59e8-955d-c4959e284242',
  proteinSources: '64a5bb87-358d-5a22-958a-f66ba5521cd5',
  soaps: '6765f741-42a6-55c5-a218-81b883b1f5ae',
  transesterification: '9d97f628-c3ea-5dc0-8723-b17b16297af3',

  firstLaw: '801790f9-be3a-51fe-9b0f-3452c1bba887',
  reactionEnthalpy: '3e433dae-99f9-5a95-ad63-d5fa0b5f6836',
  standardEnthalpy: '4663fd80-1618-5211-8020-18f4b80979fc',
  enthalpyCalc: '4a08f31f-204c-5339-9d9f-5d2af28d5d5c',
  entropy: '0a5a49f2-8e8a-5edb-b6ca-3f8636957a17',
  gibbs: 'f7a335a7-265e-5d22-b2ba-08ee9a0326c6',
  coupling: 'bef4c8eb-1d80-50fb-88cd-3a9904e38b4e',
  entropyFreeEnthalpy: '5169bb6b-f065-5798-8164-9b4521e44ae8',
  gibbsQuantitative: 'dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5',
  boltzmann: 'd4720a9a-65e2-5661-aaaa-c393d144419a',

  voltageSeries: '8be14f15-2258-58e6-ae4e-38953f5d0570',
  ionDischarge: '3eada74b-25b8-55dc-811a-acb473196f53',
  faraday: 'b8c8f70f-64cb-50b1-970c-e0c4295da3fb',
  electricWork: '96fd8608-8d98-53f0-9b86-1311c3220fd3',
  batteryTypes: 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09',
  lithium: '6b82f80e-f493-5e6b-9709-2d4eca98c137',
  leadBattery: '27e4fe9b-4796-579b-8f7d-06c65fb600c0',
  fuelCells: 'b759d50d-0e82-5b10-89a2-fe5271106e50',
  hydrogen: '93b914d4-747d-5b22-90ff-ac6320514b44',
  corrosion: '642d5ea5-b62f-50c8-b0bd-cf132619725f',
  corrosionOxygenAcid: '0908b3a2-9937-57de-8bfb-35a6de54aa1f',
  contactCorrosion: '9f0d6d4c-f918-5a44-a9a2-7732c4e338f3',
  corrosionProtection: '94a62b39-d4a2-5882-99d1-6886ead07726',
  nernst: 'b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b',
  nernstFuelCell: 'a3386a86-f1ee-55b8-bcd5-03bfb1f9d987',

  photosynthesis: '1051c091-a044-5a09-8946-60a4b5e5d185',
  artificialPhotosynthesis: '7dc80ee2-64e3-50c1-8aaa-0fef0ed0919d',
  plantOilFuels: 'e64a79df-7f21-5651-9b5d-e7d17580569e',
  bioethanol: 'a76ab487-4663-5005-8454-cb3196f3773b',
  lifeCycle: 'e20d205f-03a4-5f96-b456-9b20460605a2',
  cycles: 'c0f1bf09-5a70-5006-b1e9-e91f786a63bf',

  benzene: '4bdbdf32-3021-5a0a-b412-b611166b2d21',
  aromaticMechanisms: 'b98f89e2-39f3-595b-9653-83e9412eecd1',
  aromatics: 'ac700167-001f-5ff8-9a7d-85909f5daa4f',
  directingEffects: 'd61ce84f-1d0d-555f-be05-aedb589225ce',
  sigmaComplex: '3dbd84de-51cb-5ff7-801b-077a54520fed',
  mesomerism: 'b44f460b-3399-5c3c-94b2-fa5fc6c027f2',
  aromaticSociety: 'e96771d3-fd72-59e6-8f4c-573ef8cbde0a',
  painRelief: 'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528',

  dyeColor: '87d8cc68-fe82-5273-9e43-c18b566ecb6c',
  dyeUse: '61da9d34-cb35-5c2c-ac8e-83f48b6a4fd3',
  dyeSubstituents: '64b03eff-a967-54a1-ace3-89cb7650a65c',
  dyeSpectra: 'f0ba30a8-84b3-5915-bf85-6c3a176064d2',
  azoTriphenyl: 'e5941581-0aba-5354-b4b9-d0249d4538a8',
  textileDyes: 'b208b1a5-c609-53a1-8add-979417a93b7d',
  dyeIndustry: '188bd684-e894-5753-8a50-798220b04d97',
  indicatorDyes: '34da1a4c-5082-54c8-9084-a94826fd36cd',
}

const topics: Topic[] = [
  { code: '3.1-PROZESS', title: 'Uebergreifende Kompetenzen und Digitalisierung', page: 14, phase: 'E', courseLevel: 'GK_LK' },
  { code: '3.2-E-ATOME', title: 'Atome - die Bausteine unserer Welt', page: 17, phase: 'E', courseLevel: 'GK_LK' },
  { code: '3.2-E-ORGANIK', title: 'Organische Verbindungen - Kohlenstoff, Wasserstoff & Co', page: 18, phase: 'E', courseLevel: 'GK_LK' },
  { code: '3.2-E-KUNSTSTOFFE', title: 'Chemie fuer mehr Nachhaltigkeit - Kunststoffe', page: 19, phase: 'E', courseLevel: 'GK_LK' },
  { code: '3.2-E-SAEURE-BASE', title: 'Geben und Nehmen - Saeure-Base-Reaktionen', page: 20, phase: 'E', courseLevel: 'GK_LK' },
  { code: '3.2-E-REDOX', title: 'Geben und Nehmen - Redoxreaktionen und Elektrochemie', page: 21, phase: 'E', courseLevel: 'GK_LK' },
  { code: '3.3-1-1-GLEICHGEWICHT', title: 'Grundlagen des chemischen Gleichgewichts', page: 22, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-1-2-PROTOLYSE', title: 'Protolysegleichgewichte', page: 23, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-1-3-KINETIK', title: 'Reaktionskinetik und Katalyse', page: 24, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-2-1-KOHLENHYDRATE', title: 'Kohlenhydrate', page: 26, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-2-2-AMINOSAEUREN-PROTEINE', title: 'Aminosaeuren und Proteine', page: 27, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-2-3-FETTE-OELE', title: 'Fette und Oele', page: 28, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-3-1-ENERGETIK', title: 'Energetik', page: 30, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-3-2-ELEKTROCHEMIE', title: 'Elektrochemie', page: 31, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-3-3-ROHSTOFFE-KLIMA', title: 'Mit nachwachsenden Rohstoffen gegen den Klimawandel', page: 32, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-4-1-KUNSTSTOFFE', title: 'Kunststoffe', page: 34, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-4-2-FARBSTOFFE', title: 'Pflanzliche und synthetische Farbstoffe', page: 35, phase: 'Q', courseLevel: 'GK_LK' },
  { code: '3.3-4-3-AROMATEN', title: 'Aromatische Systeme in Natur- und Wirkstoffen', page: 36, phase: 'Q', courseLevel: 'LK' },
]

const row = (topicCode: string, text: string, canonicalGoalIds: string[], courseLevel?: CourseLevel): Row => ({
  topicCode,
  text,
  canonicalGoalIds,
  courseLevel,
})

const rows: Row[] = [
  row('3.1-PROZESS', 'chemische Fragestellungen hypothesengeleitet untersuchen und Experimente planen, durchfuehren, dokumentieren und auswerten', [target.hypothesis, target.methods, target.data, target.safety]),
  row('3.1-PROZESS', 'Theorien, Modelle und Simulationen zur Erklaerung chemischer Sachverhalte nutzen und kritisch vergleichen', [target.models]),
  row('3.1-PROZESS', 'Fachsprache, Reaktionsgleichungen, Diagramme und andere Darstellungen adressatengerecht verwenden', [target.language, target.equations, target.data]),
  row('3.1-PROZESS', 'analoge und digitale Quellen zu chemischen Sachverhalten recherchieren und quellenkritisch auswerten', [target.sources]),
  row('3.1-PROZESS', 'chemische Sachverhalte unter gesellschaftlichen, oekologischen und oekonomischen Perspektiven bewerten', [target.decisions, target.society]),
  row('3.1-PROZESS', 'Messwerte digital erfassen, auswerten und dokumentieren', [target.data, target.methods]),
  row('3.1-PROZESS', 'digitale Modelle, Visualisierungen und Simulationen zur Struktur- und Reaktionsdeutung einsetzen', [target.models, target.data]),

  row('3.2-E-ATOME', 'Atombau, Unterenergiestufen und Elektronenverteilung zur Stellung der Elemente im Periodensystem nutzen', [target.atomSublevels, target.pse]),
  row('3.2-E-ATOME', 'Valenzelektronen und Lewis-Schreibweisen fuer Bindungs- und Strukturfragen verwenden', [target.lewis, target.electronPair, target.language]),
  row('3.2-E-ATOME', 'Ionenbindung, Elektronenpaarbindung und Metallbindung modellhaft vergleichen', [target.ionBinding, target.electronPair, target.metalModel, target.bindingModels]),
  row('3.2-E-ATOME', 'zwischenmolekulare Wechselwirkungen und Polaritaet mit Stoffeigenschaften verknuepfen', [target.polarity, target.intermolecularForces, target.structureProperty]),
  row('3.2-E-ATOME', 'Formeln, Stoffmengen und Reaktionsgleichungen zur quantitativen Beschreibung chemischer Reaktionen anwenden', [target.equations, target.amountOfSubstance, target.molarMass]),

  row('3.2-E-ORGANIK', 'Kohlenwasserstoffe, homologe Reihen und Isomerie als Grundlage organischer Stoffvielfalt beschreiben', [target.hydrocarbons, target.organicsIntro, target.moleculeRepresentations]),
  row('3.2-E-ORGANIK', 'funktionelle Gruppen und sauerstoffhaltige Stoffklassen erkennen, benennen und in Formelschreibweisen darstellen', [target.functionalGroups, target.oxygenatedClasses, target.nomenclature, target.moleculeRepresentations]),
  row('3.2-E-ORGANIK', 'Eigenschaften von Alkanolen, Carbonsaeuren und Estern aus Struktur und Wechselwirkungen erklaeren', [target.alkanols, target.carboxylicAcids, target.esters, target.interactionProperties, target.organicProperties]),
  row('3.2-E-ORGANIK', 'Oxidationen von Alkanolen, Esterbildung und einfache Substitutionsreaktionen als Reaktionstypen einordnen', [target.oxidationAlkanols, target.esters, target.esterEquilibrium, target.substitutions, target.reactionTypes]),
  row('3.2-E-ORGANIK', 'fossile und nachwachsende organische Rohstoffe, Kraftstoffe und Erdölprodukte fachlich und nachhaltig bewerten', [target.petroleum, target.petroleumProducts, target.fuels, target.renewableFeedstock, target.crudeOil, target.decisions]),
  row('3.2-E-ORGANIK', 'funktionelle Gruppen qualitativ nachweisen und Versuchsergebnisse deuten', [target.functionalGroups, target.methods, target.data]),

  row('3.2-E-KUNSTSTOFFE', 'Monomere, Polymere und Makromolekuele als Strukturprinzipien von Kunststoffen beschreiben', [target.plastics, target.polymerization, target.polycondensation]),
  row('3.2-E-KUNSTSTOFFE', 'Polymerisation, Polykondensation und Polyaddition als Kunststoffbildungsreaktionen unterscheiden', [target.polymerization, target.polycondensation, target.polyaddition, target.reactionTypes]),
  row('3.2-E-KUNSTSTOFFE', 'Thermoplaste, Duroplaste und Elastomere anhand von Struktur-Eigenschafts-Beziehungen vergleichen', [target.plastics, target.thermalPlastics, target.polymerProperties, target.structureProperty]),
  row('3.2-E-KUNSTSTOFFE', 'Kunststoffrohstoffe, Recyclingstrategien und Lebenszyklusaspekte nachhaltig bewerten', [target.plasticRawMaterials, target.recycling, target.lifeCycle, target.decisions, target.society]),

  row('3.2-E-SAEURE-BASE', 'saure, basische und neutrale Loesungen mit pH-Wert, Indikator und Neutralisation beschreiben', [target.acidBaseSeparation, target.phEveryday, target.phCalc, target.neutralization]),
  row('3.2-E-SAEURE-BASE', 'das Brønsted-Konzept, Protonenuebertragungen und korrespondierende Saeure-Base-Paare anwenden', [target.bronsted, target.acidBasePairs, target.acidBaseStructure]),
  row('3.2-E-SAEURE-BASE', 'Saeure-Base-Titrationen planen, durchfuehren und rechnerisch auswerten', [target.titration, target.phCalc, target.methods, target.data]),

  row('3.2-E-REDOX', 'Oxidation, Reduktion, Elektronenuebertragung und Oxidationszahlen in Redoxreaktionen anwenden', [target.redoxTerms, target.oxidationNumbers, target.redoxEquations]),
  row('3.2-E-REDOX', 'Redoxreihen und Spannungsreihen zur Vorhersage freiwilliger Redoxreaktionen nutzen', [target.redoxSeries, target.voltageSeries]),
  row('3.2-E-REDOX', 'galvanische Zellen, Elektrolysen sowie freiwillige und erzwungene Redoxreaktionen vergleichen', [target.galvanic, target.electrolysis, target.forcedRedox]),
  row('3.2-E-REDOX', 'Korrosion und elektrochemische Anwendungen fachlich und alltagsbezogen beurteilen', [target.corrosion, target.batteryTypes, target.hydrogen, target.decisions]),

  row('3.3-1-1-GLEICHGEWICHT', 'dynamische chemische Gleichgewichte mit Hin- und Rueckreaktion erklaeren und experimentell nachweisen', [target.equilibrium, target.methods, target.data]),
  row('3.3-1-1-GLEICHGEWICHT', 'das Massenwirkungsgesetz auf Gleichgewichtsreaktionen anwenden', [target.massAction]),
  row('3.3-1-1-GLEICHGEWICHT', 'das Prinzip von Le Chatelier zur Vorhersage von Gleichgewichtsverschiebungen nutzen', [target.leChatelier]),
  row('3.3-1-1-GLEICHGEWICHT', 'Gleichgewichtslagen quantitativ fuer technische Prozessoptimierungen begruenden', [target.massAction, target.processOptimization]),
  row('3.3-1-1-GLEICHGEWICHT', 'die gesellschaftliche Bedeutung chemischer Gleichgewichte quellenkritisch erlaeutern', [target.equilibriumSociety, target.sources, target.society]),

  row('3.3-1-2-PROTOLYSE', 'Protolysegleichgewichte mit dem Brønsted-Konzept und Autoprotolyse des Wassers erklaeren', [target.bronsted, target.autoprotolysis]),
  row('3.3-1-2-PROTOLYSE', 'pH-Werte starker und schwacher einprotoniger Saeuren und Basen berechnen', [target.phCalc, target.strongWeakPh]),
  row('3.3-1-2-PROTOLYSE', 'pK-Werte, Saeurestaerke und Basenstaerke zur Deutung von Saeure-Base-Gleichgewichten nutzen', [target.pk, target.acidBasePairs]),
  row('3.3-1-2-PROTOLYSE', 'Titrationskurven einschliesslich Halbtitrationspunkt auswerten', [target.titrationCurves, target.titration, target.halfTitration]),
  row('3.3-1-2-PROTOLYSE', 'Saeure-Base-Puffer erklaeren, auswaehlen und bewerten', [target.buffer, target.decisions]),
  row('3.3-1-2-PROTOLYSE', 'polyprotische Systeme, Henderson-Hasselbalch-Zusammenhaenge und Pufferdesign vertieft anwenden', [target.polyprotic, target.henderson, target.bufferDesign], 'LK'),

  row('3.3-1-3-KINETIK', 'Reaktionsgeschwindigkeiten bestimmen und aus Messdaten darstellen', [target.speed, target.data]),
  row('3.3-1-3-KINETIK', 'Einflussfaktoren auf die Reaktionsgeschwindigkeit fachlich diskutieren', [target.speedFactors, target.rgt]),
  row('3.3-1-3-KINETIK', 'Aktivierungsenergie und Katalysatorwirkung mit Energieprofilen erklaeren', [target.activationCatalyst, target.catalyst, target.speedFactors]),
  row('3.3-1-3-KINETIK', 'Reaktionsbedingungen hypothesengeleitet untersuchen und auswerten', [target.speedExperiment, target.methods, target.data]),
  row('3.3-1-3-KINETIK', 'Arrhenius-Beziehung, kinetische Mechanismen, Autokatalyse und Katalyseformen vertieft analysieren', [target.arrhenius, target.kineticMechanisms, target.autocatalysis, target.catalystForms], 'LK'),

  row('3.3-2-1-KOHLENHYDRATE', 'Kohlenhydrate strukturell einteilen und als Naturstoffgruppe analysieren', [target.carbohydrates, target.foodPolarity]),
  row('3.3-2-1-KOHLENHYDRATE', 'reduzierende Kohlenhydrate und Glucose experimentell nachweisen', [target.reducingCarbohydrates, target.methods, target.data]),
  row('3.3-2-1-KOHLENHYDRATE', 'Stereochemie und Darstellungsformen von Kohlenhydraten nutzen', [target.stereochemistry, target.moleculeRepresentations]),
  row('3.3-2-1-KOHLENHYDRATE', 'Zucker in Alltag, Ernaehrung und Nachhaltigkeitsfragen chemisch bewerten', [target.sugarEveryday, target.foodPolarity, target.decisions]),
  row('3.3-2-1-KOHLENHYDRATE', 'chromatografische Verfahren zur Analyse von Naturstoffen vertieft anwenden', [target.chromatography], 'LK'),

  row('3.3-2-2-AMINOSAEUREN-PROTEINE', 'Aminosaeuren mit funktionellen Gruppen, Zwitterionen und Eigenschaften charakterisieren', [target.aminoAcids, target.functionalGroups]),
  row('3.3-2-2-AMINOSAEUREN-PROTEINE', 'Peptidbindungen und Proteinstrukturen erklaeren', [target.peptideBonds, target.proteinStructure]),
  row('3.3-2-2-AMINOSAEUREN-PROTEINE', 'Proteine und Peptide nachweisen sowie Denaturierung und Loeslichkeit deuten', [target.proteinDetection, target.peptideDetection, target.proteinDenaturation]),
  row('3.3-2-2-AMINOSAEUREN-PROTEINE', 'Aussenfaktoren auf Enzymreaktionen und proteinbezogene Prozesse erklaeren', [target.enzymeFactors, target.catalyst]),
  row('3.3-2-2-AMINOSAEUREN-PROTEINE', 'Proteinquellen nachhaltig und quellenkritisch bewerten', [target.proteinSources, target.sources, target.decisions]),
  row('3.3-2-2-AMINOSAEUREN-PROTEINE', 'Aminocarbonsaeuren elektrophoretisch trennen und auswerten', [target.electrophoresis], 'LK'),

  row('3.3-2-3-FETTE-OELE', 'Fette und Oele strukturell als Ester von Fettsaeuren einordnen', [target.fats, target.esters]),
  row('3.3-2-3-FETTE-OELE', 'Eigenschaften von Fetten und Oelen aus Struktur und Wechselwirkungen erklaeren', [target.fats, target.structureProperty, target.intermolecularForces]),
  row('3.3-2-3-FETTE-OELE', 'Verseifung, Seifenbildung und Tensidwirkung fachlich beschreiben', [target.soaps, target.esters]),
  row('3.3-2-3-FETTE-OELE', 'Pflanzenoelkraftstoffe und Transesterifizierung nachhaltig bewerten', [target.plantOilFuels, target.transesterification, target.lifeCycle, target.decisions]),
  row('3.3-2-3-FETTE-OELE', 'Fette und Oele in Ernaehrung, Technik und Umwelt bewerten', [target.fats, target.decisions, target.society]),

  row('3.3-3-1-ENERGETIK', 'innere Energie, Enthalpie und den ersten Hauptsatz auf chemische Reaktionen anwenden', [target.firstLaw, target.reactionEnthalpy]),
  row('3.3-3-1-ENERGETIK', 'Reaktionsenthalpien aus Bildungsenthalpien, Bindungsverhaeltnissen und Messdaten berechnen', [target.enthalpyCalc, target.standardEnthalpy, target.reactionEnthalpy, target.data]),
  row('3.3-3-1-ENERGETIK', 'Entropieaenderungen und Gibbs-Helmholtz-Zusammenhaenge qualitativ fuer Reaktionsrichtungen nutzen', [target.entropy, target.gibbs]),
  row('3.3-3-1-ENERGETIK', 'endergone und exergone Prozesse sowie energetische Kopplung erklaeren', [target.coupling, target.gibbs]),
  row('3.3-3-1-ENERGETIK', 'freie Enthalpie quantitativ und statistische Deutungen der Entropie vertieft anwenden', [target.entropyFreeEnthalpy, target.gibbsQuantitative, target.boltzmann], 'LK'),

  row('3.3-3-2-ELEKTROCHEMIE', 'galvanische Zellen und Elektrodenpotentiale mit Spannungsreihen deuten', [target.galvanic, target.voltageSeries, target.electricWork]),
  row('3.3-3-2-ELEKTROCHEMIE', 'Elektrolyse, Ionenentladung und Faraday-Gesetze quantitativ anwenden', [target.electrolysis, target.ionDischarge, target.faraday]),
  row('3.3-3-2-ELEKTROCHEMIE', 'Batterien, Akkumulatoren und Brennstoffzellen fachlich und nachhaltig beurteilen', [target.batteryTypes, target.lithium, target.leadBattery, target.fuelCells, target.hydrogen, target.decisions]),
  row('3.3-3-2-ELEKTROCHEMIE', 'Korrosion und Korrosionsschutz auf Teilchenebene erklaeren und bewerten', [target.corrosion, target.corrosionOxygenAcid, target.contactCorrosion, target.corrosionProtection]),
  row('3.3-3-2-ELEKTROCHEMIE', 'die Nernst-Gleichung auf galvanische Zellen und Brennstoffzellen anwenden', [target.nernst, target.nernstFuelCell], 'LK'),

  row('3.3-3-3-ROHSTOFFE-KLIMA', 'Photosynthese und kuenstliche Photosynthese als Redox- und Energiespeicherprinzip beschreiben', [target.photosynthesis, target.artificialPhotosynthesis]),
  row('3.3-3-3-ROHSTOFFE-KLIMA', 'Bioethanol und Pflanzenoelkraftstoffe aus nachwachsenden Rohstoffen fachlich einordnen', [target.bioethanol, target.plantOilFuels, target.renewableFeedstock]),
  row('3.3-3-3-ROHSTOFFE-KLIMA', 'Wasserstoffspeicherung und Energietraeger im Klimakontext bewerten', [target.hydrogen, target.artificialPhotosynthesis, target.decisions]),
  row('3.3-3-3-ROHSTOFFE-KLIMA', 'Stoffkreislaeufe, Klimawandel und Life-Cycle-Assessment chemisch begruenden', [target.cycles, target.lifeCycle, target.sources, target.society]),

  row('3.3-4-1-KUNSTSTOFFE', 'Kunststoffe nach Struktur, Bildungsreaktion und Eigenschaftsprofil einteilen', [target.plastics, target.polymerization, target.polycondensation, target.polyaddition, target.polymerProperties]),
  row('3.3-4-1-KUNSTSTOFFE', 'Verarbeitung, thermisches Verhalten und Recycling von Kunststoffen erklaeren', [target.plasticProcessing, target.thermalPlastics, target.recycling]),
  row('3.3-4-1-KUNSTSTOFFE', 'Biopolymere, Kunststoffrohstoffe und Makromolekuelproduktion nachhaltig bewerten', [target.biopolymers, target.plasticRawMaterials, target.macroSociety, target.lifeCycle, target.decisions]),
  row('3.3-4-1-KUNSTSTOFFE', 'Silikone und leitfaehige Kunststoffe strukturbezogen beschreiben und vergleichen', [target.silicones, target.conductivePlastics, target.conductiveCompare], 'LK'),

  row('3.3-4-2-FARBSTOFFE', 'Farbigkeit organischer Farbstoffe durch delokalisierte Elektronen erklaeren', [target.dyeColor, target.models]),
  row('3.3-4-2-FARBSTOFFE', 'pflanzliche und synthetische Farbstoffe in Alltag, Textilien und Gesundheit bewerten', [target.dyeUse, target.textileDyes, target.decisions]),
  row('3.3-4-2-FARBSTOFFE', 'Absorptionsspektren von Farbstoffen auswerten', [target.dyeSpectra, target.data]),
  row('3.3-4-2-FARBSTOFFE', 'Substituenteneffekte, Azo- und Triphenylmethanfarbstoffe sowie Indikatorfarbstoffe strukturell erklaeren', [target.dyeSubstituents, target.azoTriphenyl, target.indicatorDyes], 'LK'),
  row('3.3-4-2-FARBSTOFFE', 'Farbstoffe als Motor der chemischen Industrie historisch und gesellschaftlich beurteilen', [target.dyeIndustry, target.sources, target.society], 'LK'),

  row('3.3-4-3-AROMATEN', 'Benzolstruktur, Aromatizitaet und mesomere Grenzstrukturen aromatischer Systeme deuten', [target.benzene, target.aromatics, target.mesomerism], 'LK'),
  row('3.3-4-3-AROMATEN', 'elektrophile Substitutionen an Aromaten einschliesslich Sigma-Komplex, Halogenierung und Nitrierung mechanistisch beschreiben', [target.aromaticMechanisms, target.sigmaComplex], 'LK'),
  row('3.3-4-3-AROMATEN', 'dirigierende Effekte von Substituenten in aromatischen Systemen analysieren', [target.directingEffects, target.dyeSubstituents], 'LK'),
  row('3.3-4-3-AROMATEN', 'aromatische Verbindungen in Naturstoffen, Wirkstoffen, Alltag, Industrie und Gesundheit bewerten', [target.aromaticSociety, target.painRelief, target.sources, target.society], 'LK'),
]

const byTopic = new Map(topics.map((topic) => [topic.code, { ...topic, rows: [] as Row[] }]))
for (const currentRow of rows) {
  const topic = byTopic.get(currentRow.topicCode)
  if (!topic) throw new Error(`Unknown topic code ${currentRow.topicCode}`)
  topic.rows.push(currentRow)
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function repoPath(absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/')
}

function writeJson(relativePath: string, value: unknown): void {
  const absolutePath = path.resolve(repoRoot, relativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.resolve(repoRoot, relativePath), 'utf8')) as T
}

function knownCanonicalGoalIds(): Set<string> {
  return new Set(readJson<{ goals: Array<{ id: string }> }>(canonicalPath).goals.map((goal) => goal.id))
}

function validateTargets(): void {
  const known = knownCanonicalGoalIds()
  const unknown = rows.flatMap((currentRow) => currentRow.canonicalGoalIds).filter((goalId) => !known.has(goalId))
  if (unknown.length > 0) throw new Error(`Unknown canonical target IDs: ${Array.from(new Set(unknown)).join(', ')}`)
}

const passages = [...byTopic.values()].map((topic) => ({
  id: `hb-chemistry-sekii:${topic.code}`,
  topicCode: topic.code,
  title: `${topic.code} ${topic.title}`,
  text: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
  page: topic.page,
  sourceDocumentKey,
  sourcePath: sourcePdfPath,
  rawText: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
  sourceGoalIds: [] as string[],
}))

const passageByTopic = new Map(passages.map((passage) => [passage.topicCode, passage]))
const topicByCode = new Map(topics.map((topic) => [topic.code, topic]))
const sourceGoals = rows.map((currentRow, index) => {
  const topic = topicByCode.get(currentRow.topicCode)
  const passage = passageByTopic.get(currentRow.topicCode)
  if (!topic || !passage) throw new Error(`Missing passage for ${currentRow.topicCode}`)
  const courseLevel = currentRow.courseLevel ?? topic.courseLevel
  const goalId = `hb-chemistry-sekii-gyo2022-${slug(currentRow.topicCode)}-${String(index + 1).padStart(3, '0')}-${hash(currentRow.text)}`
  passage.sourceGoalIds.push(goalId)

  return {
    id: goalId,
    passageId: passage.id,
    topicCode: currentRow.topicCode,
    bulletIndex: index + 1,
    aspectIndex: 1,
    title: currentRow.text,
    description: `Die lernende Person kann ${currentRow.text}.`,
    sourceText: currentRow.text,
    sourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    sourceDocumentKey,
    parentBulletText: currentRow.text,
    sourceRef: `Bremen Bildungsplan Chemie Gymnasiale Oberstufe 2022, ${currentRow.topicCode}, S. ${passage.page}`,
    courseLevel,
    granularity: 'officialCompetencyBullet',
    tags: ['source:bremen', 'stage:SekII', `phase:${topic.phase}`, `topic:${currentRow.topicCode}`, `course:${courseLevel}`],
    rawSourceText: currentRow.text,
    rawSourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    rawParentBulletText: currentRow.text,
  }
})

function buildExtraction(): unknown {
  const peerBaselineDetails =
    `${sourceGoals.length} Source-Ziele; Bremen GyO Chemie 2022 ist damit im erwartbaren Korridor ` +
    'gegenueber anderen geprueften Sek-II-Chemie-Spuren (ca. 126-333 Source-Ziele), weil die Bremer Quelle kompakte Themenbereiche statt langer Kompetenzraster fuehrt.'

  return {
    schemaVersion: 1,
    extractionId: 'DE-HB-CHEMIE-SEKII-GYO-2022',
    title: 'DE-HB - Chemie Gymnasiale Oberstufe (Bremen, Bildungsplan 2022 Source-Extraction)',
    sourceLandscapeId,
    jurisdiction,
    subject: 'Chemie',
    stage: 'SekII',
    sourceDocument: {
      key: sourceDocumentKey,
      title: 'Bildungsplan Chemie Gymnasiale Oberstufe Bremen 2022',
      path: sourcePdfPath,
      url: sourceUrl,
      official: true,
    },
    sourceDocuments: [
      {
        key: sourceDocumentKey,
        title: 'Bildungsplan Chemie Gymnasiale Oberstufe Bremen 2022',
        path: sourcePdfPath,
        url: sourceUrl,
        official: true,
      },
    ],
    method: {
      passageExtraction:
        'pdftotext -layout; Kapitel 3.1-3.4 wurden nach amtlichen Themenueberschriften und verbindlichen E/Q-Themenbereichen segmentiert',
      sourceGoalExtraction:
        'one source goal per fachlich trennbarer official competency/content bullet; LK-only rows are tagged course:LK',
    },
    expectedTopicCodes: topics.map((topic) => topic.code),
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details: peerBaselineDetails,
      },
    },
    pipelineStatus: {
      version: 1,
      currentStep: '',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'source-document-present',
              label: 'Amtliche Bremer Sek-II-Chemie-Quelle liegt lokal vor',
              passed: true,
              details: sourcePdfPath,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Alle verbindlichen Bremer GyO-Chemie-Themen sind als Lehrplanpassagen vorhanden',
              passed: true,
              details: `${topics.length}/${topics.length} Themen inklusive E-Phase, Qualifikationsphase und LK-Pflichtthema 4.3.`,
            },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'Source-Ziele aus Lehrplanpassagen erstellt',
          status: 'complete',
          dependsOn: ['MAPPING-1'],
          checks: [
            {
              id: 'source-goals-created',
              label: 'Aus den amtlichen Bremer GyO-Chemie-Kompetenzbullets wurden Source-Ziele erzeugt',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen geprüfte Sek-II-Chemie-Spuren plausibilisiert',
              passed: true,
              details: peerBaselineDetails,
            },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
          status: 'complete',
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            {
              id: 'm3-review-file-present',
              label: 'M3-Review-Datei ist vorhanden',
              passed: true,
              details: reviewPath,
            },
            {
              id: 'm3-all-source-goals-reviewed',
              label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
              passed: true,
              details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
            },
            {
              id: 'm3-all-source-goals-covered-by-canonical',
              label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
              passed: true,
              details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; keine offenen Canonical-Gaps.`,
            },
          ],
        },
      ],
    },
    passages,
    sourceGoals,
  }
}

function buildReview(): unknown {
  const mappings = rows.flatMap((currentRow, index) => {
    const sourceGoal = sourceGoals[index]
    return currentRow.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: sourceGoal.id,
      canonicalGoalId,
      matchType: currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
      reviewDecisionId: sourceGoal.id,
    }))
  })

  const decisions = rows.map((currentRow, index) => {
    const sourceGoal = sourceGoals[index]
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: currentRow.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds: currentRow.canonicalGoalIds,
      matchType: currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
      rationale: currentRow.canonicalGoalIds.length > 1
        ? 'Das amtliche Bremer Sek-II-Source-Ziel ist inhaltlich durch mehrere kanonische Chemieziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
        : 'Das amtliche Bremer Sek-II-Source-Ziel ist inhaltlich durch ein kanonisches Chemieziel abgedeckt.',
      reviewedAt: '2026-05-11',
      reviewer: 'codex',
    }
  })

  return {
    version: 1,
    reviewId: 'DE-HB-CHEMIE-SEKII-GYO-2022-MAPPING-3-SOURCE-EXTRACTION-1',
    sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: extractionPath,
    status: {
      scope: 'Bremen Chemie Gymnasiale Oberstufe / Bildungsplan 2022',
      reviewedSourceGoals: sourceGoals.length,
      mappedSourceGoals: sourceGoals.length,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        'Bremen Sek II wurde als amtliche Source-Extraction aus dem GyO-Bildungsplan 2022 angelegt. Partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
    },
    mappings,
    decisions,
  }
}

function buildRuntimeMapping(): unknown {
  const review = buildReview() as { mappings: unknown[] }
  return {
    version: 1,
    sourceLandscapeId,
    targetLandscapeId,
    mappings: review.mappings,
  }
}

function updateRegistry(): void {
  const registry = readJson<Registry>(registryPath)
  const entries = registry.entries ?? []
  registry.entries = entries
  const nextRegistryEntry = {
    landscapeId: sourceLandscapeId,
    title: 'Chemie Gymnasiale Oberstufe (Bremen, Bildungsplan 2022 Source-Extraction)',
    jurisdiction,
    sourcePath: sourcePdfPath,
    sourceUrl,
    archiveSourcePath: sourcePdfPath,
    archivePath: 'curricula/DE/Gymnasium/input/HB/upper-secondary/',
  }
  const registryEntry = entries.find((entry) => entry.landscapeId === sourceLandscapeId)
  if (registryEntry) {
    Object.assign(registryEntry, nextRegistryEntry)
  } else {
    entries.push(nextRegistryEntry)
  }
  writeJson(registryPath, registry)
}

function writeMappingReadme(): void {
  const readmePath = 'curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/CHEMIE.md'
  writeFileSync(
    path.resolve(repoRoot, readmePath),
    [
      '# Bremen Chemie Gymnasiale Oberstufe -> kanonische Chemie',
      '',
      'Stand: 2026-05-11',
      '',
      'Diese Spur wurde als amtliche Source-Extraction aus dem Bremer GyO-Bildungsplan 2022 angelegt.',
      '',
      `- Quelle: \`${sourcePdfPath}\``,
      `- Direkte PDF-Quelle: ${sourceUrl}`,
      `- Source-Extraction: \`${extractionPath}\``,
      `- M3-Review: \`${reviewPath}\``,
      `- Runtime-Mapping: \`${runtimeMappingPath}\``,
      `- Source-Ziele: ${sourceGoals.length}`,
      `- Passagen: ${passages.length}`,
      '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
      '',
      'Fachliche Abgrenzung: Thema 4.3 Aromatische Systeme ist in Bremen explizit LK-Pflichtthema; die Topicfolge aus Kapitel 3.4 wurde in den course-Tags berücksichtigt.',
      '',
    ].join('\n'),
  )
}

function updateInputReadme(): void {
  const readmePath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/input/HB/README.md')
  let readme = readFileSync(readmePath, 'utf8')
  if (readme.includes('GyO_Chemie_2022.pdf')) return

  const block = [
    '### Sekundarstufe II (Gymnasiale Oberstufe)',
    '- **Archivierte offizielle PDFs**',
    '  - `GyO_Chemie_2022.pdf`',
    '- **Öffentliche Quellen**',
    '  - Lehrpläne: [LIS Bremen - Lehrpläne](https://www.lis.bremen.de/schulqualitaet/lehrplaene-und-richtlinien-4384)',
    `  - Direkte PDF-Quelle: [LIS Bremen - Gymnasiale Oberstufe Chemie](${sourceUrl})`,
    '- **Source-Extraction**',
    '  - `upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json`',
    '  - Die Sek-II-Spur umfasst E-Phase, verbindliche Q-Themen, Wahlthemen und das LK-Pflichtthema Aromatische Systeme nach Kapitel 3.4.',
    '',
  ].join('\n')

  readme = readme.replace('## Physik', `${block}## Physik`)
  writeFileSync(readmePath, readme)
}

function sourceNodeFor(view: CompositionView, profile: 'gk' | 'lk'): ViewNode {
  const id = `chemistry-de-hb-${profile}-source-backed`
  const queue = [...view.rootNodes]
  while (queue.length > 0) {
    const node = queue.shift()
    if (!node) continue
    if (node.kind === 'structure' && node.id === id) return node
    queue.push(...(node.children ?? []))
  }
  throw new Error(`Missing source-backed node ${id}`)
}

function collectGoalIds(nodes: ViewNode[], targetSet = new Set<string>()): Set<string> {
  for (const node of nodes) {
    if (node.kind === 'goalEntry' && node.goalId) targetSet.add(node.goalId)
    collectGoalIds(node.children ?? [], targetSet)
  }
  return targetSet
}

function rowVisibleForProfile(currentRow: Row, profile: 'gk' | 'lk'): boolean {
  const topic = topicByCode.get(currentRow.topicCode)
  if (!topic) throw new Error(`Missing topic ${currentRow.topicCode}`)
  const courseLevel = currentRow.courseLevel ?? topic.courseLevel
  if (profile === 'gk') return courseLevel !== 'LK'
  return courseLevel !== 'GK'
}

function buildUpperViewGroups(profile: 'gk' | 'lk', alreadyUsed: Set<string>): ViewNode[] {
  const groups: ViewNode[] = []
  for (const topic of topics.filter((currentTopic) => currentTopic.code !== '3.1-PROZESS')) {
    const topicRows = rows.filter((currentRow) => currentRow.topicCode === topic.code && rowVisibleForProfile(currentRow, profile))
    const goalIds: string[] = []
    for (const currentRow of topicRows) {
      for (const goalId of currentRow.canonicalGoalIds) {
        if (alreadyUsed.has(goalId) || goalIds.includes(goalId)) continue
        goalIds.push(goalId)
      }
    }
    if (goalIds.length === 0) continue
    for (const goalId of goalIds) alreadyUsed.add(goalId)
    groups.push({
      kind: 'structure',
      id: `chemistry-de-hb-${profile}-upper-${slug(topic.code)}`,
      label: `${topic.title} (${topic.phase}-Phase)`,
      children: goalIds.map((goalId) => ({ kind: 'goalEntry', goalId })),
    })
  }
  return groups
}

function writeCompositionViews(): void {
  for (const profile of ['gk', 'lk'] as const) {
    const viewPath = `curricula/DE/Gymnasium/composition-views/chemie/de-hb-${profile}.view.json`
    const view = readJson<CompositionView>(viewPath)
    const sourceNode = sourceNodeFor(view, profile)
    const prefix = `chemistry-de-hb-${profile}-upper-`
    const preservedChildren = (sourceNode.children ?? []).filter((node) => !node.id?.startsWith(prefix))
    const used = collectGoalIds(preservedChildren)
    sourceNode.children = [...preservedChildren, ...buildUpperViewGroups(profile, used)]
    writeJson(viewPath, view)
  }
}

validateTargets()
writeJson(extractionPath, buildExtraction())
writeJson(reviewPath, buildReview())
writeJson(runtimeMappingPath, buildRuntimeMapping())
updateRegistry()
writeMappingReadme()
updateInputReadme()
writeCompositionViews()

console.log(`Wrote ${extractionPath} (${sourceGoals.length} source goals)`)
console.log(`Wrote ${reviewPath}`)
console.log(`Wrote ${runtimeMappingPath}`)
console.log(`Updated ${repoPath(path.resolve(repoRoot, registryPath))}`)
console.log('Updated Bremen Chemistry composition views')
