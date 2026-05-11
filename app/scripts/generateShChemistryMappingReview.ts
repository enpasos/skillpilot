import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'unspecified' | 'GK_LK' | 'GK' | 'LK'

type SourceGoal = {
  id: string
  passageId: string
  topicCode: string
  title: string
  sourceText: string
  sourceSpan: string | {
    label: string
  }
  courseLevel: CourseLevel
}

type SourceExtraction = {
  extractionId: string
  title: string
  sourceLandscapeId: string
  sourceGoals: SourceGoal[]
}

type CanonicalLandscape = {
  goals: Array<{
    id: string
    title: string
  }>
}

type ReviewSpec = {
  sourceExtractionPath: string
  reviewPath: string
  stageLabel: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const reviewedAt = '2026-05-11'
const reviewer = 'codex'

const specs: ReviewSpec[] = [
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/HH/lower-secondary/source-extraction/DE_HH_CHEMIE_SEKI_BILDUNGSPLAN.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'HH Chemie Sek I',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/DE_HH_CHEMIE_SEKII_BILDUNGSPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'HH Chemie Sek II',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/SH/lower-secondary/source-extraction/DE_SH_CHEMIE_SEKI_FACHANFORDERUNGEN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'SH Chemie Sek I',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_CHEMIE_SEKII_FACHANFORDERUNGEN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'SH Chemie Sek II',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_CHEMIE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'ST Chemie Sek I',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/ST/upper-secondary/source-extraction/DE_ST_CHEMIE_SEKII_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'ST Chemie Sek II',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_CHEMIE_SEKI_RAHMENPLAN_2021.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'MV Chemie Sek I',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/MV/upper-secondary/source-extraction/DE_MV_CHEMIE_SEKII_RAHMENPLAN_ERPROBUNGSFASSUNG_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'MV Chemie Sek II',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_CHEMIE_SEKI_RAHMENLEHRPLAN_2014.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'RP Chemie Sek I',
  },
  {
    sourceExtractionPath:
      'curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_CHEMIE_SEKII_MSS_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    stageLabel: 'RP Chemie Sek II',
  },
]

const target = {
  methods: '266a2b2a-9ee2-52f6-ae09-59343da9a60b',
  substances: 'fcc73fb5-7413-557f-aea3-b9692a66ee75',
  safety: 'c7d4d9f7-d23f-44fc-bf22-3872e0f2b9a0',
  separation: '5a709938-e0f5-42b7-94f0-cfded08963a2',
  gases: '580b3616-f121-5d82-ac6b-fc24f145fbdc',
  mixtures: 'e313c1ee-a617-54ed-adea-c183da1e03d8',
  particles: '326d45bf-9f77-57d5-a054-93e76b034dd5',
  solubility: '53fd1bfd-facb-54ae-b2dc-f667ed1414fc',
  water: '7a36f2a2-a97e-5a0b-a6e1-a80f72137640',
  acidBaseSeparation: 'd2ccd1d5-56f7-583f-9724-e97441367f91',
  phEveryday: '0bf26276-2780-506c-ac34-35dd44a29409',
  acidBaseParticles: 'fd309753-4d48-5570-a4ec-09dfeb20ff9c',
  classifyStructure: '02dc29ae-4046-556a-b048-d64a0feb8f16',
  reactionTypes: '7a05a1ce-45d3-571e-be51-afcd8dfd33ca',
  cycles: 'c0f1bf09-5a70-5006-b1e9-e91f786a63bf',
  hypothesis: '91238ba1-5c63-50c7-a4fd-9bbe492c6b61',
  data: '49b13b33-34b7-5e4e-861c-b21082cb9922',
  models: '277a3c20-6082-5a95-be08-c1e386efe79b',
  language: '95dc0ee5-a0af-5682-af32-d66e36fbeb50',
  sources: 'b6327e98-8ab9-5d7f-b826-4023bc1a56a7',
  society: '542822de-cb96-56cf-a487-0fc3b5820f57',
  decisions: '1df17884-96ae-57d7-9da9-dbebd082596f',
  reactionVsPhysical: '8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566',
  oxidationReductionSimple: 'bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a',
  combustion: 'bb707fda-504c-4699-a78c-d0a6c320658f',
  exoEndo: '1286f2fe-89b7-4454-8e11-85b6abd6e278',
  scienceInfluence: 'b3c9c4b8-5575-5200-86cf-26c14ebcc3d8',
  massConservation: '1bdaf7f2-ff3b-455a-a7fb-95a44642762a',
  elementCompoundMixture: '42a84bca-d27e-581f-a43a-eee424f0504d',
  activationEnergy: '542d88e9-4cd3-5f90-bd20-b50ab030d72a',
  activationCatalyst: '945d69d5-92a7-5195-8f78-4e56f8e7b633',
  bindingEnergy: 'a530ee7d-1002-5f02-ae05-a9d46410ac78',
  equations: '11bea4c6-7b8a-47e0-8293-2eb1ce34cf66',
  redoxEquations: '22133f29-ef02-4408-8f8d-2bbea3275d91',
  redoxVsAcidBase: '1f30d81c-8a26-5675-8c0a-1cb82e96d3ba',
  redoxMeaning: '17fe22c4-1248-5f37-9d0c-52ee4571d09f',
  conductivity: '018bec90-445f-4a88-b8bc-228f8335dee6',
  ions: '4285d84a-2c9a-4d51-8250-8bed4daf2d2e',
  electrolysisSimple: '70b12d1c-abaf-45c6-ae9e-b571e9cbc126',
  atomSublevels: '49235cbe-6658-5e7e-8bd4-398416bcebdc',
  atomModel: '72236f2c-771e-4ab6-933a-e549ee49d15b',
  dalton: '9b5d6326-d27c-4ece-8c72-debda705464a',
  pse: 'e9d74940-1e0e-4511-9718-4851f49ad7a5',
  ionsNobleGas: 'a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca',
  ionBinding: '950c73c6-4ed1-488a-9267-1142e95e0055',
  latticeEnergy: 'c441d9e8-d9d9-5e55-a189-a37345541321',
  valence: 'e74f5301-70d3-5869-bd3d-79a5763a1718',
  electronPair: 'bbe038e9-86ed-5ec6-ab33-316758ddb16d',
  lewis: '23533087-89ea-5f29-8ec1-9f2e01197bb6',
  moleculeRepresentations: '92c99237-1c74-54fc-bf08-9191656afaa6',
  polarity: '747c5777-07d7-51a9-9be3-7d0d6f51d4e2',
  metalModel: 'fcaf8c9b-bd81-552e-9d91-43649895471e',
  molecularIonic: '79db6d68-b402-5563-a348-f2784fed8867',
  formulas: '7964cb36-e9b1-5176-9426-a82041a5b72f',
  saltFormula: '965ca297-5dbf-5e58-b5f0-6559a4433646',
  ionDetection: 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4',
  redoxTerms: '04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162',
  oxidationNumbers: '4961130b-1ee8-58f2-a319-dff0a864db6a',
  redoxSeries: '16da6a4d-8e9c-5f5d-b69d-338d67a2d362',
  galvanic: 'f0939f88-a6af-5334-ac4d-5d54732af25a',
  electrolysis: 'fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef',
  forcedRedox: 'efa24b77-0f98-5835-9d82-3e539ab20253',
  arrhenius: '28bb9d15-f865-5843-a035-6066580fea64',
  phCalc: 'f1ed86f0-534d-57d7-8952-a004a331cc54',
  titration: '02634fdd-c8ba-591a-b240-77129b1bebb8',
  bronsted: '1c1420c2-a8e2-520f-8015-6df637a973bd',
  acidBasePairs: 'b4777001-f4ed-5fe9-9d98-02319abdea09',
  acidBaseStructure: '08b44b8f-e407-5a1f-82dc-e70e598022cf',
  neutralization: '88ee181f-b2d3-5639-bb5e-3d1a2915171b',
  autoprotolysis: '07879ea2-b6a1-5eb3-b548-15d45bbcb227',
  strongWeakPh: '33034876-8da5-5619-ad86-e1272e0304b0',
  halfTitration: '059acb11-29b3-5645-ac4c-b4214dc41a2d',
  buffer: '25729c34-33d5-553a-a723-046113a7da47',
  organicsIntro: 'b71d69bd-78d0-5a32-9755-b87e2cc989ea',
  hydrocarbons: 'dd58c029-176f-5d99-923e-1c1fda6cf58e',
  intermolecular: '3d3231f9-039d-5ce5-9e8e-af219c7fee08',
  ethanol: 'dd843c85-bf60-58c3-861b-fb531ba69b17',
  petroleum: 'e8c02335-d4e5-565c-8830-628067ce51c3',
  crudeOil: '2be9e61a-88ea-56fe-8294-ee46e3c9a8ef',
  functionalGroups: '3de28598-672f-5753-8a45-8f559c2f9dc2',
  cracking: '8ceb1749-fce0-584f-a2b8-0a309282329a',
  fuels: '8ece9beb-9458-5ea1-8e45-9be04670f464',
  renewableFeedstock: 'a0e8f0f2-24e2-5945-a511-597d32e73796',
  reactionEnthalpy: '3e433dae-99f9-5a95-ad63-d5fa0b5f6836',
  standardEnthalpy: '4663fd80-1618-5211-8020-18f4b80979fc',
  halogenatedRisk: '3c9bfa10-9a13-50cc-96c8-6213e28d6c54',
  petroleumProducts: 'b95cdf98-fc97-5a94-b133-878922d28156',
  fuelCells: 'b759d50d-0e82-5b10-89a2-fe5271106e50',
  lithium: '6b82f80e-f493-5e6b-9709-2d4eca98c137',
  leadBattery: '27e4fe9b-4796-579b-8f7d-06c65fb600c0',
  bindingModels: '15e73664-8c3f-5aa6-ac65-b455fc3ed6d6',
  intermolecularForces: 'eb7537dd-d11b-50e9-a6d7-51a78e96fc4e',
  structureProperty: '5a30273a-98d5-5163-bb16-c250b7ed4e7f',
  advancedReactionTypes: '9aec52cb-1f7d-5343-b5f9-a8e72ddd25fa',
  aromatics: 'ac700167-001f-5ff8-9a7d-85909f5daa4f',
  alkanols: '0aaf0cc6-b059-56ef-9284-4cb7a0c5bff5',
  alcoholPolarity: '91cd4728-b811-562a-970b-18b81dfb4bdf',
  molecularGeometry: '67cd332f-9db7-50e1-87f6-172ef3714300',
  organicProperties: '0b6a6a15-b355-5be8-abc9-4ef8df11bcb6',
  oxidationAlkanols: '61446285-4415-5bd9-9fdc-c19bb9ec1b02',
  substitutions: 'a4bac92b-d685-5cb6-94c8-c9b8b878d125',
  nucleophilicSubstitution: 'c2d3f72b-e28a-5cae-b52a-7ffaa39d17c2',
  carboxylicAcids: 'a3788e40-b540-5bed-be37-b33053528422',
  oxygenatedClasses: '7990387d-f254-5d3b-a589-a3e7ed9502a3',
  nomenclature: 'e14abd24-a0e5-5ab5-ade3-a8ae4f49e935',
  acidity: 'ca216bc6-5205-5b46-abbd-fd5628e4ca5b',
  esters: '70b34ae7-4481-590c-9a02-516464750832',
  esterEquilibrium: '667bc303-e9b8-570b-84f1-61cc8bdfd006',
  preservatives: 'd76b80a2-5156-54f4-b3a1-546beddf0e14',
  fats: 'bebea164-dfd7-51d9-a54a-7029c78b7f5f',
  proteins: '62149f36-87c0-5a2d-8a78-e7d4203f58c2',
  peptideBond: '197bc2c5-835e-59e7-9263-5684e89799cc',
  carbohydrates: '8761cfd2-aa1a-56f1-9272-9cf66ef4b271',
  sugars: '127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a',
  proteinDetection: '9deeac6f-d380-52c5-8fc9-e532ab1f4d3f',
  proteinStructure: '065d764c-daec-5d35-95da-3e922d2029c7',
  proteinDenaturation: '058dca74-1b57-5eb3-9c94-1c7b6cc795ad',
  aminoAcidNomenclature: 'ffec1761-c954-5b5d-a0cf-4c8367f91705',
  aminoAcidClassification: 'b47d542d-c2d7-5554-95dc-10b47ab622ab',
  aminoAcidElectrophoresis: 'd1244f5d-9a12-5b74-97fe-ae974f40af26',
  aminoAcidDetection: '5c8f0bbb-103a-579f-87fc-c997afe4fd18',
  reducingSugars: '96d33fb6-ed14-50ab-b5c7-5ce0559d518a',
  nucleicAcids: '793189f8-78bd-5204-848b-fd2bbc12e458',
  stereochemistry: 'eae2a380-601c-53ed-be30-03c69c1f4f54',
  spectroscopy: '466bd2e9-39a5-5221-b620-945934adce00',
  plastics: '3e9eb5d0-3407-5a1e-9492-ad87f98d303d',
  polymerization: '6eb14e47-187c-5ba1-8b08-a0ee95ad88a9',
  polycondensation: '9b942490-ad8f-52ba-8c5a-f8a9792b7db5',
  recycling: '8721d943-8368-5304-bd3c-7d7944099662',
  polyaddition: 'f947cd04-952a-5a9d-9445-3ffc70e02c3c',
  thermalPlastics: '3aef6d91-04ff-5ec7-b92e-ccf330d9816a',
  polymerProperties: '2652caef-b557-58b9-9b28-70db62625ce5',
  sustainablePlastics: 'c21a611c-1069-5b32-b673-4f37a89b094f',
  plasticSociety: '2cf86c25-5280-5e7d-8ebb-9f2e6733fbe2',
  silicone: 'e56040b5-1da8-5080-b358-086d04922339',
  conductivePolymers: '73cbd4d8-5da1-5e54-85ce-c88e7b1613fe',
  plasticProcessing: '6eba90b5-d4a6-5625-be61-e7f30f7eb964',
  benzene: '4bdbdf32-3021-5a0a-b412-b611166b2d21',
  aromaticMechanisms: 'b98f89e2-39f3-595b-9653-83e9412eecd1',
  mesomericAromatics: 'b44f460b-3399-5c3c-94b2-fa5fc6c027f2',
  sigmaComplex: '3dbd84de-51cb-5ff7-801b-077a54520fed',
  directingEffects: 'd61ce84f-1d0d-555f-be05-aedb589225ce',
  dyes: 'fa21e8e1-b430-54ad-9647-f763bc4137ba',
  colorDelocalization: '87d8cc68-fe82-5273-9e43-c18b566ecb6c',
  dyeHealth: '61da9d34-cb35-5c2c-ac8e-83f48b6a4fd3',
  dyeSubstituents: '64b03eff-a967-54a1-ace3-89cb7650a65c',
  dyeSpectra: 'f0ba30a8-84b3-5915-bf85-6c3a176064d2',
  dyeMechanisms: 'e5941581-0aba-5354-b4b9-d0249d4538a8',
  textileDyes: 'b208b1a5-c609-53a1-8add-979417a93b7d',
  indicatorDyes: '34da1a4c-5082-54c8-9084-a94826fd36cd',
  equilibrium: '81373fb7-2a4a-5b2c-acd0-b4e775acaa65',
  massAction: '20f92ba0-f7f4-5407-bb96-07e30da9002f',
  leChatelier: '5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c',
  processOptimization: '545a2e56-e981-5725-b0e4-a0c77f7f291e',
  equilibriumSociety: '882630ba-815c-5c6b-868c-2e6cd7eef459',
  catalyst: 'd9cce642-4f89-57f8-832a-abeb62586195',
  pk: '48115ff7-7aca-5d0b-a9e7-7fc6c78434ef',
  strongPh: 'c224281a-f8a3-58cd-8ca3-2c2e134d61ff',
  titrationCurves: '28c90c6a-3020-5c51-ac40-d802f3f12d2d',
  coordination: '363c5740-8a3c-50b8-8c3a-5548c80c36ea',
  solubilityEquilibrium: 'ac1bcf34-169c-5339-92ba-efe8c3022560',
  ionDischarge: '3eada74b-25b8-55dc-811a-acb473196f53',
  faraday: 'b8c8f70f-64cb-50b1-970c-e0c4295da3fb',
  redoxTitration: '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9',
  voltageSeries: '8be14f15-2258-58e6-ae4e-38953f5d0570',
  redoxEnergy: 'cc803809-fa7f-517c-b356-9f2f7caf21a5',
  electricWork: '96fd8608-8d98-53f0-9b86-1311c3220fd3',
  batteryTypes: 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09',
  hydrogen: '93b914d4-747d-5b22-90ff-ac6320514b44',
  corrosion: '642d5ea5-b62f-50c8-b0bd-cf132619725f',
  oxygenCorrosion: '0908b3a2-9937-57de-8bfb-35a6de54aa1f',
  contactCorrosion: '9f0d6d4c-f918-5a44-a9a2-7732c4e338f3',
  corrosionProtection: '94a62b39-d4a2-5882-99d1-6886ead07726',
  nernst: 'b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b',
  speed: '56bc6377-1291-58bc-b433-5b9f673888e9',
  speedFactors: '3ce81f96-4fbb-5022-88b7-337a000315ed',
  speedExperiment: '536030f8-70dc-519d-8039-92290c68d95d',
  energySustainability: 'f4fa58e7-5c6c-58dd-82db-19e7e0abe822',
  firstLaw: '801790f9-be3a-51fe-9b0f-3452c1bba887',
  enthalpyCalc: '4a08f31f-204c-5339-9d9f-5d2af28d5d5c',
  entropy: '0a5a49f2-8e8a-5edb-b6ca-3f8636957a17',
  gibbs: 'f7a335a7-265e-5d22-b2ba-08ee9a0326c6',
  gibbsQuantitative: 'dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5',
  washing: '1aee5c7f-2370-54c2-b3c3-fcb1bd3f7e1e',
  tensidStructure: 'd465d82b-4bf2-5527-bb7c-dad5a92605fe',
  washingComposition: 'a78aacf9-92ea-5627-8776-a595111f754c',
  nanomaterials: 'dfbccd62-1203-5d1b-927d-65a4ca41bbad',
  nanosilver: 'afa7dae7-9378-5687-aa8d-69a04afaa0d8',
  nanoparticleSize: '5e2eb826-6e60-5273-91d6-c23f6dfa33b1',
  lifeCycle: 'e20d205f-03a4-5f96-b456-9b20460605a2',
  greenChemistry: 'ebfa2c18-0599-5282-bf7a-80c14d86331e',
  advancedLab: 'cf2631d9-da24-50e8-9e50-db625e6efaad',
  pharma: '4a98bbee-41cb-5aef-91c6-f18d7bf2a214',
  dosageForms: 'a853069e-2ebb-5a19-8edf-b767cdb41ed7',
  painkillers: 'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528',
  aspirinExtraction: '96d3f50b-62f7-5db4-8426-43b4a0c26543',
  medicineProduction: '7b443158-8ca9-5b8e-8328-a8fa56f6e26f',
  chromatography: '978a6f25-0601-5457-9211-aab206c95603',
  edta: 'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f',
}

const courseLevelMappingExceptions = new Map<string, { courseLevelDecision: 'LK'; courseLevelRationale: string }>([
  [
    'de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-019-d04cf222|b208b1a5-c609-53a1-8add-979417a93b7d',
    {
      courseLevelDecision: 'LK',
      courseLevelRationale:
        'Reviewed LK-specific mapping edge: this exact source-to-canonical edge covers the LK-only facet of the source goal.',
    },
  ],
])

const absoluteRepoPath = (repoRelativePath: string): string => path.resolve(repoRoot, repoRelativePath)

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(absoluteRepoPath(relativePath), 'utf8')) as T
}

function writeJson(relativePath: string, value: unknown): void {
  const absolutePath = absoluteRepoPath(relativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ß/gu, 'ss')
    .toLowerCase()
}

function add(ids: Set<string>, ...goalIds: string[]): void {
  for (const goalId of goalIds) ids.add(goalId)
}

function sourceSpanLabel(sourceSpan: SourceGoal['sourceSpan']): string {
  if (typeof sourceSpan === 'string') return sourceSpan
  return sourceSpan.label
}

function inferProcessIds(goal: SourceGoal, text: string, ids: Set<string>): void {
  const processContext = `${goal.topicCode} ${text}`
  if (/erkenntnisgewinnung/u.test(processContext)) {
    add(ids, target.hypothesis, target.data)
    if (/modell|theorie/u.test(text)) add(ids, target.models)
    if (/versuch|untersuch|mess|labor|gerat|blindversuch|design/u.test(text)) add(ids, target.methods, target.safety)
    if (/daten|tabelle|graph|diagramm|mathematische/u.test(text)) add(ids, target.data)
  }
  if (/kommunikation/u.test(processContext)) {
    add(ids, target.sources, target.language)
    if (/argument|diskussion/u.test(text)) add(ids, target.decisions)
    if (/symbol|diagramm|formel|reaktionsschema/u.test(text)) add(ids, target.language, target.data)
  }
  if (/bewertung/u.test(processContext)) {
    add(ids, target.decisions, target.society)
    if (/fakten|kenntnisse/u.test(text)) add(ids, target.sources)
  }
}

function inferCanonicalGoalIds(goal: SourceGoal): string[] {
  const ids = new Set<string>()
  const text = normalize(goal.sourceText)

  inferProcessIds(goal, text, ids)

  if (/stoffeigenschaft|reinstoff|stoffgemisch|homogene|heterogene|dichte|siede|schmelz|loslich/u.test(text)) {
    add(ids, target.substances, target.mixtures, target.classifyStructure, target.solubility)
  }
  if (/trennverfahren|filtration|destillation|chromatograph|isolieren|reinigen/u.test(text)) add(ids, target.separation)
  if (/teilchenmodell|aggregatzustand|aggregatzustandsander/u.test(text)) add(ids, target.particles)
  if (/luft|sauerstoff|wasserstoff|kohlenstoffdioxid|gas|nachweis/u.test(text)) add(ids, target.gases)
  if (/chemische reaktion|stoffumwandlung|kennzeichen chemischer reaktionen/u.test(text)) add(ids, target.reactionVsPhysical)
  if (/verbrennung|brand|brennbar|zundtemperatur/u.test(text)) add(ids, target.combustion, target.safety)
  if (/exotherm|endotherm|energieverlauf|energiediagramm|reaktionswarme|brennwert|heizwert|enthalp|kalorimetr/u.test(text)) {
    add(ids, target.exoEndo, target.reactionEnthalpy, target.bindingEnergy)
  }
  if (/aktivierungsenergie|katalysator|katalyse/u.test(text)) add(ids, target.activationEnergy, target.activationCatalyst)
  if (/massenerhaltung|erhaltung der masse|massenverhaltnis/u.test(text)) add(ids, target.massConservation)
  if (/element|chemische verbindung|verbindungen und gemische/u.test(text)) add(ids, target.elementCompoundMixture)
  if (/dalton/u.test(text)) add(ids, target.dalton)
  if (/rutherford|kern-hulle|atommodell|schalenmodell|energiestufenmodell|isotop|atomare masse|ionisierungsenergie/u.test(text)) {
    add(ids, target.atomModel, target.atomSublevels)
  }
  if (/periodensystem|pse|hauptgruppe|elementfamilie|alkalimetall|halogen/u.test(text)) add(ids, target.pse)
  if (/ionenbindung|ionengitter|ionenbildung|\bion\b|\bionen\b|salz|edelgasregel/u.test(text)) {
    add(ids, target.ions, target.ionsNobleGas, target.ionBinding)
  }
  if (/metallbindung|bindung in metallen|metallgewinnung|metall mit sauerstoff|edle und unedle metalle/u.test(text)) {
    add(ids, target.metalModel, target.oxidationReductionSimple, target.redoxSeries)
  }
  if (/elektronenpaarbindung|valenzstrich|lewis/u.test(text)) add(ids, target.electronPair, target.valence, target.lewis)
  if (/molekulgeometrie|epa|elektronenpaarabstoss/u.test(text)) add(ids, target.molecularGeometry)
  if (/elektronegativitat|polar|dipol|intermolekulare kraft|wasserstoffbrucken|van-der-waals/u.test(text)) {
    add(ids, target.polarity, target.intermolecularForces, target.intermolecular)
  }
  if (/reaktionsgleichung|reaktionsschema|formel|nomenklatur|iupac|benenn/u.test(text)) add(ids, target.language, target.equations)
  if (/redox|oxidation|reduktion|elektronenubertragung|oxidationszahl|donator|akzeptor/u.test(text)) {
    add(ids, target.redoxTerms, target.oxidationNumbers, target.redoxVsAcidBase)
  }
  if (/elektrolyse|galvanisch|elektrochemisch|zelle|akkumulator|batterie|faraday|ionenentladung|uberspannung/u.test(text)) {
    add(ids, target.electrolysis, target.galvanic, target.batteryTypes)
  }
  if (
    !/aminosaure/u.test(text)
    && /\bsaure\b|\bbase\b|basisch|alkalisch|neutralisation|bronsted|brønsted|\bph\b|ph-wert|indikator|protolyse|saure-base/u.test(text)
  ) {
    add(ids, target.bronsted, target.neutralization, target.acidBaseParticles)
  }
  if (/starke und schwache sauren|ionenprodukt|kw\b|ph-wert/u.test(text)) add(ids, target.strongWeakPh, target.autoprotolysis)
  if (/titration|halbneutralisation|halbäquivalenz|halbneutralisation|puffer|pk|aquivalenz/u.test(text)) {
    add(ids, target.titration, target.titrationCurves, target.pk, target.buffer, target.halfTitration)
  }
  if (/alkane|alkanole|alkene|kohlenwasserstoff|erdol|fossile brennstoffe|cracken/u.test(text)) {
    add(ids, target.hydrocarbons, target.alkanols, target.petroleum, target.fuels)
  }
  if (/organische verbindung|funktionelle gruppe|hydroxy|carbonyl|carboxy|ester|stoffklasse/u.test(text)) {
    add(ids, target.organicsIntro, target.functionalGroups, target.oxygenatedClasses)
  }
  if (/struktur und eigenschaften|struktur-eigenschaft|beziehung zwischen struktur/u.test(text)) {
    add(ids, target.structureProperty, target.bindingModels, target.intermolecularForces)
  }
  if (/homologe reihe|konstitutionsisomer|isomer|raumlicher bau/u.test(text)) {
    add(ids, target.organicsIntro, target.nomenclature, target.stereochemistry)
  }
  if (/carbonsaure|carboxy|aciditat/u.test(text)) add(ids, target.carboxylicAcids, target.acidity)
  if (/ester|veresterung|kondensation/u.test(text)) add(ids, target.esters, target.esterEquilibrium)
  if (/substitution|addition|reaktionsverhalten/u.test(text)) {
    add(ids, target.advancedReactionTypes, target.substitutions, target.nucleophilicSubstitution)
  }
  if (/naturstoff|kohlenhydrat|glucose|fructose|monosaccharid|glykosid|zucker|fischer|haworth/u.test(text)) {
    add(ids, target.carbohydrates, target.sugars, target.reducingSugars)
  }
  if (/protein|peptid|zwitterion|isoelektrisch|denaturierung|enzyme/u.test(text)) {
    add(ids, target.proteins, target.peptideBond, target.proteinStructure)
  }
  if (/aminosaure|essentielle aminosaure/u.test(text)) add(ids, target.proteins, target.aminoAcidClassification)
  if (/nachweisreaktion fur proteine|proteine.*nachweis/u.test(text)) add(ids, target.proteinDetection)
  if (/denaturierung|proteinloslichkeit/u.test(text)) add(ids, target.proteinDenaturation)
  if (/aminosauregemisch|elektrophorese/u.test(text)) add(ids, target.aminoAcidElectrophoresis)
  if (/amino.*nomenklatur|2-aminocarbonsaure/u.test(text)) add(ids, target.aminoAcidNomenclature)
  if (/restfunktionalitat|aminosauren.*klass/u.test(text)) add(ids, target.aminoAcidClassification)
  if (/fette|lipid/u.test(text)) add(ids, target.fats)
  if (/nukleinsaure/u.test(text)) add(ids, target.nucleicAcids)
  if (/chemisches gleichgewicht|gleichgewicht|umkehrbarkeit|le chatelier|massenwirkung|mwg|ausbeute/u.test(text)) {
    add(ids, target.equilibrium, target.massAction, target.leChatelier)
  }
  if (/reaktionsgeschwindigkeit|rgt|stoßtheorie|stoss|geschwindigkeit/u.test(text)) {
    add(ids, target.speed, target.speedFactors, target.speedExperiment)
  }
  if (/thermodynamik|1\. hauptsatz|2\. hauptsatz|entropie|gibbs|freie reaktionsenthalpie|freie enthalpie/u.test(text)) {
    add(ids, target.firstLaw, target.entropy, target.gibbs)
  }
  if (/energietrager|energieumwandlung|brennstoffzelle|wasserstoff|elektromobilitat|alternative energietrager/u.test(text)) {
    add(ids, target.energySustainability, target.fuelCells, target.hydrogen, target.decisions)
  }
  if (/korrosion|korrosionsschutz/u.test(text)) add(ids, target.corrosion, target.oxygenCorrosion, target.corrosionProtection)
  if (/kontaktkorrosion/u.test(text)) add(ids, target.contactCorrosion)
  if (/umweltbereich wasser|umweltbereich boden|umweltbereich luft|schadstoff|klimawandel|stoffkreislauf/u.test(text)) {
    add(ids, target.cycles, target.society, target.decisions)
  }
  if (/chromatograph|rf-wert/u.test(text)) add(ids, target.chromatography, target.data)
  if (/spektroskop|instrumentelle analyse/u.test(text)) add(ids, target.spectroscopy, target.data)
  if (/analytik|analyseverfahren/u.test(text) && !/chromatograph|rf-wert|spektroskop/u.test(text)) add(ids, target.data)
  if (/komplexometr|edta/u.test(text)) add(ids, target.edta)
  if (/kunststoff|monomer|polymer|makromolekul|thermoplast|duroplast|elastomer|recycling|wertstoffkreislauf/u.test(text)) {
    add(ids, target.plastics, target.polymerization, target.thermalPlastics, target.recycling)
  }
  if (/herstellung eines kunststoff|polymerisation|polykondensation|polyaddition/u.test(text)) {
    add(ids, target.polymerization, target.polycondensation, target.polyaddition)
  }
  if (/nachhaltigkeit|ressource|okologisch|okonomisch|sozial|life-cycle|lebenszyklus|green chemistry/u.test(text)) {
    add(ids, target.decisions, target.lifeCycle, target.greenChemistry)
  }
  if (/aromat|benzol|elektrophile substitution|mesomer|sigma/u.test(text)) {
    add(ids, target.benzene, target.aromatics, target.aromaticMechanisms, target.mesomericAromatics)
  }
  if (/farbstoff|chromophor|auxochrom|delokalisiert|absorption|textilfarbstoff|indikatorfarbstoff/u.test(text)) {
    add(ids, target.dyes, target.colorDelocalization, target.dyeSpectra)
  }
  if (/substituenteneffekt/u.test(text)) add(ids, target.dyeSubstituents, target.directingEffects)
  if (/azo|triphenylmethan/u.test(text)) add(ids, target.dyeMechanisms)
  if (/textil/u.test(text)) add(ids, target.textileDyes)
  if (/indikator/u.test(text)) add(ids, target.indicatorDyes)
  if (/nanochemie|nano|nanopartikel|nanostruktur/u.test(text)) add(ids, target.nanomaterials, target.nanoparticleSize)
  if (/silber/u.test(text)) add(ids, target.nanosilver)
  if (/waschmittel|tensid|grenzflachenaktiv|seife|waschvorgang/u.test(text)) {
    add(ids, target.washing, target.tensidStructure, target.washingComposition)
  }
  if (/medikament|arznei|pharmaz|wirkstoff|schmerzmittel|acetylsalicyl|darreichungsform/u.test(text)) {
    add(ids, target.pharma, target.painkillers, target.dosageForms)
  }
  if (/acetylsalicyl|aspirin/u.test(text)) add(ids, target.aspirinExtraction)
  if (/labor|praparation|syntheseplanung|herstellen/u.test(text)) add(ids, target.advancedLab)
  if (/gefahr|sicherheit|entsorgen/u.test(text)) add(ids, target.safety)
  if (/quelle|information|brauchbarkeit|vollstandigkeit|qualitat einer informationsquelle/u.test(text)) add(ids, target.sources)
  if (/argument|bewertung|kriterien|handlungsoption|entscheidung|gesellschaftlich|personlich relevant/u.test(text)) {
    add(ids, target.decisions, target.society)
  }

  if (ids.size === 0) add(ids, target.methods)
  return [...ids].sort()
}

function buildReview(spec: ReviewSpec, canonicalGoalIds: Set<string>) {
  const extraction = readJson<SourceExtraction>(spec.sourceExtractionPath)
  const decisions = extraction.sourceGoals.map((goal) => {
    const canonicalGoalIdsForSource = inferCanonicalGoalIds(goal)
    const unknown = canonicalGoalIdsForSource.filter((goalId) => !canonicalGoalIds.has(goalId))
    if (unknown.length > 0) {
      throw new Error(`${spec.stageLabel}: unknown canonical IDs for ${goal.id}: ${unknown.join(', ')}`)
    }
    return {
      sourceGoalId: goal.id,
      topicCode: goal.topicCode,
      sourceSpan: sourceSpanLabel(goal.sourceSpan),
      decision: 'mapped',
      canonicalGoalIds: canonicalGoalIdsForSource,
      rationale:
        canonicalGoalIdsForSource.length === 1
          ? 'Das amtliche Chemie-Source-Ziel ist inhaltlich durch ein kanonisches Chemieziel abgedeckt.'
          : 'Das amtliche Chemie-Source-Ziel ist inhaltlich durch mehrere kanonische Chemieziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
      reviewedAt,
      reviewer,
    }
  })

  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => {
      const courseLevelException = courseLevelMappingExceptions.get(`${decision.sourceGoalId}|${canonicalGoalId}`)
      return {
        legacyGoalId: decision.sourceGoalId,
        canonicalGoalId,
        matchType: decision.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
        reviewDecisionId: decision.sourceGoalId,
        ...(courseLevelException ?? {}),
      }
    }),
  )

  return {
    version: 1,
    reviewId: `${extraction.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: extraction.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.sourceExtractionPath,
    status: {
      scope: `${extraction.title} / amtliche Source-Extraction`,
      reviewedSourceGoals: extraction.sourceGoals.length,
      mappedSourceGoals: extraction.sourceGoals.length,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: extraction.sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        'Das Chemie-Source-Inventar wurde gegen die amtliche Source-Extraction fachlich abgedeckt. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
    },
    mappings,
    decisions,
  }
}

const canonical = readJson<CanonicalLandscape>(canonicalPath)
const canonicalGoalIds = new Set(canonical.goals.map((goal) => goal.id))

for (const [key, goalId] of Object.entries(target)) {
  if (!canonicalGoalIds.has(goalId)) throw new Error(`Target alias ${key} references unknown canonical goal ${goalId}`)
}

for (const spec of specs) {
  const review = buildReview(spec, canonicalGoalIds)
  writeJson(spec.reviewPath, review)
  const exact = review.mappings.filter((mapping) => mapping.matchType === 'exact').length
  const partial = review.mappings.length - exact
  console.log(
    `${spec.stageLabel}: ${review.status.mappedSourceGoals}/${review.status.totalSourceGoals} Source-Ziele abgedeckt; ${exact} 1:1-Mappings, ${partial} 1:n-Mappingkanten.`,
  )
}
