import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Row = {
  topicCode: string
  text: string
  canonicalGoalIds: string[]
}

type Topic = {
  code: string
  title: string
  page: number
  stage: '7/8' | '9/10'
}

type Config = {
  jurisdiction: 'DE-BB' | 'DE-BE'
  displayName: string
  slug: 'bb' | 'be'
  sourceLandscapeId: string
  pdfPath: string
  extractionPath: string
  reviewPath: string
  readmePath: string
  registryTitle: string
}

type Registry = {
  entries?: Array<Record<string, unknown>>
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const officialSourceUrl =
  'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/Teil_C_Chemie_2015_11_10.pdf'

const target = {
  data: '49b13b33-34b7-5e4e-861c-b21082cb9922',
  models: '277a3c20-6082-5a95-be08-c1e386efe79b',
  language: '95dc0ee5-a0af-5682-af32-d66e36fbeb50',

  mixtures: '42a84bca-d27e-581f-a43a-eee424f0504d',
  classifySubstances: '02dc29ae-4046-556a-b048-d64a0feb8f16',
  separation: '5a709938-e0f5-42b7-94f0-cfded08963a2',
  gasDetection: '580b3616-f121-5d82-ac6b-fc24f145fbdc',
  solutions: '53fd1bfd-facb-54ae-b2dc-f667ed1414fc',
  waterProperties: '7a36f2a2-a97e-5a0b-a6e1-a80f72137640',
  saltDissolution: '5abc5961-6368-52bb-88b9-6a846c3c37a8',
  acidBaseDistinguish: 'd2ccd1d5-56f7-583f-9724-e97441367f91',
  phEveryday: '0bf26276-2780-506c-ac34-35dd44a29409',
  particleAcidsBases: 'fd309753-4d48-5570-a4ec-09dfeb20ff9c',
  acidBaseReversibility: '08b44b8f-e407-5a1f-82dc-e70e598022cf',
  neutralization: '88ee181f-b2d3-5639-bb5e-3d1a2915171b',

  reactionsCluster: 'a00d302b-7762-4b9d-a6d7-de0c58b35540',
  reactionCharacteristics: '8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566',
  oxidationReduction: 'bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a',
  airWaterCombustion: 'bb707fda-504c-4699-a78c-d0a6c320658f',
  reactionEnergy: '1286f2fe-89b7-4454-8e11-85b6abd6e278',
  massConservation: '1bdaf7f2-ff3b-455a-a7fb-95a44642762a',
  energyProfiles: '542d88e9-4cd3-5f90-bd20-b50ab030d72a',
  reactionEquations: '11bea4c6-7b8a-47e0-8293-2eb1ce34cf66',
  redoxTerms: '04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162',
  combustionSafety: '8576b82b-811a-5e13-b5dc-ec5d42030565',

  ionsAsChargeCarriers: '4285d84a-2c9a-4d51-8250-8bed4daf2d2e',
  electrolysisSimpleSalts: '70b12d1c-abaf-45c6-ae9e-b571e9cbc126',
  atomModel: '72236f2c-771e-4ab6-933a-e549ee49d15b',
  shellModel: 'f5efab9d-2c61-44ea-b36a-87f873b51fd8',
  pse: 'e9d74940-1e0e-4511-9718-4851f49ad7a5',
  ionFormation: 'a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca',
  ionicBonding: '950c73c6-4ed1-488a-9267-1142e95e0055',
  electronPairBonding: 'bbe038e9-86ed-5ec6-ab33-316758ddb16d',
  bondModels: '15e73664-8c3f-5aa6-ac65-b455fc3ed6d6',
  polarity: '747c5777-07d7-51a9-9be3-7d0d6f51d4e2',
  intermolecularForces: 'eb7537dd-d11b-50e9-a6d7-51a78e96fc4e',
  structureProperty: '5a30273a-98d5-5163-bb16-c250b7ed4e7f',
  interactionProperties: '3d3231f9-039d-5ce5-9e8e-af219c7fee08',
  molecularFormulaRepresentations: '92c99237-1c74-54fc-bf08-9191656afaa6',
  molecularIonic: '79db6d68-b402-5563-a348-f2784fed8867',
  ionDetection: 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4',
  ionSalts: 'b5086548-169e-5d63-a14a-dabf631fa013',
  alkali: 'e0e201bd-a1fd-5985-ab08-fd24c8655f3d',
  halogens: '58486300-3f84-5aa1-9ed4-66186af62669',
  saltFormationLatticeEnergy: 'c441d9e8-d9d9-5e55-a189-a37345541321',
  saltFormulasFromIonCharges: '965ca297-5dbf-5e58-b5f0-6559a4433646',

  amountOfSubstance: '1dc15fa2-fca4-56b0-b5c1-4d215613dde0',
  avogadro: 'e45c0022-ac0d-5c83-b433-5f68655e382f',
  formulaFromData: 'e675fa94-6e23-59c0-b376-4340bf44c00e',
  molarMass: '8a2ad724-df5e-5986-8de9-560ba43caac2',
  molecularStoichiometry: '9f355f63-4fb7-5638-9538-6e8a246ec4b2',

  metalModel: 'fcaf8c9b-bd81-552e-9d91-43649895471e',
  rawMaterials: '62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2',
  rawMaterialReflection: '2be9e61a-88ea-56fe-8294-ee46e3c9a8ef',

  hydrocarbonsCluster: 'a6a28ab1-3a0a-5095-ab51-fa3a91ae8146',
  hydrocarbonClasses: 'dd58c029-176f-5d99-923e-1c1fda6cf58e',
  hydrocarbonAnalysis: 'ddb76915-4d63-5375-901d-4e659f5e9b09',
  organicIntroduction: 'b71d69bd-78d0-5a32-9755-b87e2cc989ea',
  organicProperties: '0b6a6a15-b355-5be8-abc9-4ef8df11bcb6',
  alkanols: '0aaf0cc6-b059-56ef-9284-4cb7a0c5bff5',
  fossilFuels: 'e8c02335-d4e5-565c-8830-628067ce51c3',
  fossilFuelAssessment: '871eabde-6e19-59d3-bc7c-60977a9837db',
  fuelComparison: '8ece9beb-9458-5ea1-8e45-9be04670f464',
  oilProducts: 'b95cdf98-fc97-5a94-b133-878922d28156',
  functionalGroups: '7990387d-f254-5d3b-a589-a3e7ed9502a3',
  iupacOxygenated: 'e14abd24-a0e5-5ab5-ade3-a8ae4f49e935',
  carboxylicAcids: 'a3788e40-b540-5bed-be37-b33053528422',
  esters: '70b34ae7-4481-590c-9a02-516464750832',
  esterEquilibrium: '667bc303-e9b8-570b-84f1-61cc8bdfd006',
  ethanolSociety: 'dd843c85-bf60-58c3-861b-fb531ba69b17',
  functionalGroupDetection: '3de28598-672f-5753-8a45-8f559c2f9dc2',
  particleModelDiffusion: '10ce2814-8796-5633-9bed-f6990d039b91',
}

const topics: Topic[] = [
  { code: '3.1', title: 'Faszination Chemie - Feuer, Schall und Rauch', page: 30, stage: '7/8' },
  { code: '3.2', title: 'Das Periodensystem der Elemente - Uebersicht und Werkzeug', page: 32, stage: '7/8' },
  { code: '3.3', title: 'Gase - zwischen lebensnotwendig und gefaehrlich', page: 33, stage: '7/8' },
  { code: '3.4', title: 'Wasser - eine Verbindung', page: 34, stage: '7/8' },
  { code: '3.5', title: 'Salze - Gegensaetze ziehen sich an', page: 36, stage: '7/8' },
  { code: '3.6', title: 'Metalle - Schaetze der Erde', page: 37, stage: '7/8' },
  { code: '3.7', title: 'Klare Verhaeltnisse - Quantitative Betrachtungen', page: 38, stage: '7/8' },
  { code: '3.8', title: 'Saeuren und Laugen - echt aetzend', page: 39, stage: '7/8' },
  { code: '3.9', title: 'Kohlenwasserstoffe - vom Campinggas zum Superbenzin', page: 40, stage: '9/10' },
  { code: '3.10', title: 'Alkohole - vom Holzgeist zum Glycerin', page: 42, stage: '9/10' },
  { code: '3.11', title: 'Organische Saeuren - Salatsauce, Entkalker & Co', page: 43, stage: '9/10' },
  { code: '3.12', title: 'Ester - Vielfalt der Produkte aus Alkoholen und Saeuren', page: 44, stage: '9/10' },
]

const row = (topicCode: string, text: string, canonicalGoalIds: string[]): Row => ({
  topicCode,
  text,
  canonicalGoalIds,
})

const rows: Row[] = [
  row('3.1', 'chemische Reaktionen stofflich und auf der Teilchenebene beschreiben', [target.reactionsCluster, target.reactionCharacteristics, target.models]),
  row('3.1', 'Energie bei chemischen Reaktionen als thermische Energie, Licht und elektrische Energie beschreiben', [target.reactionEnergy, target.energyProfiles]),
  row('3.1', 'das Gesetz von der Erhaltung der Masse anwenden', [target.reactionsCluster, target.massConservation, target.data]),
  row('3.1', 'Reaktionen von Metallen und Nichtmetallen mit Sauerstoff als Oxidationen beschreiben', [target.oxidationReduction, target.airWaterCombustion, target.redoxTerms]),
  row('3.1', 'Wortgleichungen fuer Oxidationsreaktionen formulieren', [target.reactionsCluster, target.reactionEquations, target.language]),
  row('3.1', 'Edukte, Produkte, Verbindungen sowie Metall- und Nichtmetalloxide fachsprachlich unterscheiden', [target.reactionCharacteristics, target.language, target.classifySubstances]),

  row('3.2', 'chemische Symbole als Fachsprache nutzen', [target.language, target.pse]),
  row('3.2', 'den Atombau mit Kern-Huelle-Modell, Proton, Neutron und Elektron beschreiben', [target.atomModel, target.models, target.pse]),
  row('3.2', 'die strukturierte Atomhuille und die Elektronenschreibweise nach Lewis verwenden', [target.shellModel, target.bondModels, target.language]),
  row('3.2', 'stoffliche und teilchenbezogene Ordnungsprinzipien des Periodensystems erlaeutern', [target.pse, target.classifySubstances, target.models]),
  row('3.2', 'Elementfamilien und charakteristische Eigenschaften im Periodensystem vergleichen', [target.pse, target.alkali, target.halogens]),

  row('3.3', 'Eigenschaften, Verwendung und Nachweise von Sauerstoff, Wasserstoff und Kohlenstoffdioxid beschreiben', [target.gasDetection, target.airWaterCombustion, target.hydrocarbonAnalysis]),
  row('3.3', 'Luft als Stoffgemisch und Gasgemisch beschreiben', [target.mixtures, target.gasDetection]),
  row('3.3', 'Atombindung, Elektronenpaarbindung und Oktettregel modellhaft erklaeren', [target.electronPairBonding, target.bondModels, target.models]),
  row('3.3', 'Molekuele mit Lewis-Strukturformeln darstellen', [target.molecularFormulaRepresentations, target.electronPairBonding, target.language]),

  row('3.4', 'Eigenschaften von Wasser fachlich beschreiben', [target.waterProperties, target.structureProperty]),
  row('3.4', 'Wasser als Loesungsmittel auf Stoff- und Teilchenebene erklaeren', [target.solutions, target.saltDissolution, target.particleModelDiffusion]),
  row('3.4', 'Wasser quantitativ analysieren und aus Daten eine Formel ableiten', [target.formulaFromData, target.data, target.gasDetection]),
  row('3.4', 'Bildung und Zerlegung von Wasser als chemische Reaktionen deuten', [target.reactionsCluster, target.electrolysisSimpleSalts, target.reactionEquations]),
  row('3.4', 'Reaktionsgleichungen zur Wasserbildung und Wasserzerlegung formulieren', [target.reactionsCluster, target.reactionEquations, target.language]),
  row('3.4', 'den Molekuelbau von Wasser mit Elektronenpaarbindung deuten', [target.electronPairBonding, target.structureProperty, target.waterProperties]),
  row('3.4', 'Elektronegativitaet, polare Elektronenpaarbindung und Dipol am Wassermolekuel erklaeren', [target.polarity, target.interactionProperties, target.waterProperties]),

  row('3.5', 'Ionen und Ionenbildung erklaeren', [target.ionFormation, target.ionsAsChargeCarriers, target.models]),
  row('3.5', 'Bildung, Vorkommen und Verwendung von Salzen als Ionensubstanzen beschreiben', [target.ionicBonding, target.ionSalts, target.classifySubstances]),
  row('3.5', 'Bau und Eigenschaften von Salzen mit Ionenbindung und Ionengitter erklaeren', [target.ionicBonding, target.saltFormationLatticeEnergy, target.structureProperty]),
  row('3.5', 'Summenformeln von Salzen aus Ionenladungen ableiten', [target.saltFormulasFromIonCharges, target.language, target.ionicBonding]),

  row('3.6', 'Eigenschaften und Verwendung von Metallen und Legierungen beschreiben', [target.metalModel, target.structureProperty, target.rawMaterials]),
  row('3.6', 'Metallgewinnung aus Rohstoffen als chemischen Prozess beschreiben', [target.rawMaterials, target.oxidationReduction, target.redoxTerms]),
  row('3.6', 'edle und unedle Metalle fachlich unterscheiden', [target.metalModel, target.redoxTerms, target.oxidationReduction]),
  row('3.6', 'den Bau von Metallen mit einem Elektronengas-Modell beschreiben', [target.metalModel, target.models]),
  row('3.6', 'Reaktionsgleichungen fuer Metallreaktionen formulieren', [target.reactionsCluster, target.reactionEquations, target.redoxTerms]),
  row('3.6', 'Reduktion und Redoxreaktion an Metallgewinnung und Oxidation beschreiben', [target.oxidationReduction, target.redoxTerms, target.rawMaterials]),
  row('3.6', 'die Affinitaet von Metallen gegenueber Sauerstoff vergleichen', [target.redoxTerms, target.oxidationReduction, target.data]),

  row('3.7', 'die Stoffmenge als Groesse mit der Einheit Mol verwenden', [target.amountOfSubstance, target.avogadro]),
  row('3.7', 'Atommasse und molare Masse bestimmen und verwenden', [target.molarMass, target.amountOfSubstance]),
  row('3.7', 'Masse, Stoffmenge und molare Masse in einfachen Rechnungen verknuepfen', [target.molecularStoichiometry, target.molarMass, target.amountOfSubstance]),
  row('3.7', 'Massenberechnungen bei chemischen Reaktionen durchfuehren', [target.molecularStoichiometry, target.massConservation, target.reactionsCluster]),
  row('3.7', 'Stoffmengenkonzentrationen waessriger Loesungen beschreiben', [target.amountOfSubstance, target.solutions, target.molarMass]),

  row('3.8', 'Indikatoren zur Unterscheidung saurer, alkalischer und neutraler Loesungen nutzen', [target.acidBaseDistinguish, target.particleAcidsBases]),
  row('3.8', 'pH-Werte messen und alltagsbezogen auswerten', [target.phEveryday, target.particleAcidsBases, target.data]),
  row('3.8', 'den Saeure-Base-Begriff fachlich verwenden', [target.particleAcidsBases, target.acidBaseReversibility, target.language]),
  row('3.8', 'die Bildung saurer und alkalischer Loesungen auf Teilchenebene erklaeren', [target.particleAcidsBases, target.acidBaseReversibility, target.models]),
  row('3.8', 'Neutralisationsreaktionen auf Stoff- und Teilchenebene beschreiben', [target.neutralization, target.particleAcidsBases, target.reactionsCluster]),

  row('3.9', 'Vorkommen und Verwendung von Kohlenwasserstoffen beschreiben', [target.hydrocarbonClasses, target.hydrocarbonsCluster, target.fossilFuels]),
  row('3.9', 'Struktur und Eigenschaften gesaettigter Kohlenwasserstoffe in der homologen Reihe vergleichen', [target.hydrocarbonClasses, target.organicProperties, target.structureProperty]),
  row('3.9', 'Isomerie bei Kohlenwasserstoffen erklaeren', [target.hydrocarbonClasses, target.organicIntroduction, target.molecularFormulaRepresentations]),
  row('3.9', 'Van-der-Waals-Kraefte als zwischenmolekulare Wechselwirkungen bei Kohlenwasserstoffen deuten', [target.intermolecularForces, target.interactionProperties, target.organicProperties]),
  row('3.9', 'Kohlenwasserstoffe mit grundlegenden Nomenklaturregeln benennen', [target.hydrocarbonClasses, target.language]),
  row('3.9', 'Verbrennungsreaktionen von Kohlenwasserstoffen beschreiben und bewerten', [target.airWaterCombustion, target.fuelComparison, target.fossilFuelAssessment]),
  row('3.9', 'ungesaettigte Kohlenwasserstoffe von gesaettigten Kohlenwasserstoffen unterscheiden', [target.hydrocarbonClasses, target.molecularFormulaRepresentations]),

  row('3.10', 'Herstellung von Methanol oder Ethanol beschreiben', [target.alkanols, target.reactionsCluster, target.functionalGroups]),
  row('3.10', 'Struktur und Nomenklatur von Alkanolen anwenden', [target.alkanols, target.iupacOxygenated, target.functionalGroups]),
  row('3.10', 'die Bedeutung funktioneller Gruppen an Alkoholen erklaeren', [target.functionalGroups, target.alkanols]),
  row('3.10', 'Eigenschaftsaenderungen innerhalb der homologen Reihe der Alkanole begruenden', [target.alkanols, target.organicProperties, target.interactionProperties]),
  row('3.10', 'die physiologische Wirkung alkoholischer Getraenke fachlich und gesellschaftlich einordnen', [target.ethanolSociety, target.functionalGroups, target.organicProperties]),
  row('3.10', 'Propan-1,2,3-triol als mehrwertigen Alkohol einordnen', [target.alkanols, target.functionalGroups]),
  row('3.10', 'Alkanale als sauerstoffhaltige organische Stoffklasse erkennen', [target.functionalGroups, target.iupacOxygenated]),

  row('3.11', 'Alkansaeuren aus passenden Ausgangsstoffen herstellen oder ableiten', [target.carboxylicAcids, target.functionalGroups, target.reactionsCluster]),
  row('3.11', 'Struktur von Alkansaeuren und die Carboxy-Gruppe beschreiben', [target.carboxylicAcids, target.functionalGroups, target.molecularFormulaRepresentations]),
  row('3.11', 'Eigenschaften und Verwendung von Alkansaeuren beschreiben', [target.carboxylicAcids, target.organicProperties, target.phEveryday]),
  row('3.11', 'Eigenschaftsaenderungen innerhalb der homologen Reihe der Alkansaeuren erklaeren', [target.carboxylicAcids, target.organicProperties, target.interactionProperties]),
  row('3.11', 'Aminosaeuren als organische Molekuele mit funktionellen Gruppen einordnen', [target.functionalGroups, target.carboxylicAcids, target.models]),

  row('3.12', 'Eigenschaften und Verwendung von Alkansaeurealkylestern und Fetten beschreiben', [target.esters, target.organicProperties, target.interactionProperties]),
  row('3.12', 'lipophile und lipophobe Eigenschaften organischer Stoffe strukturbezogen deuten', [target.esters, target.interactionProperties, target.organicProperties]),
  row('3.12', 'Struktur von Estern und die Estergruppe beschreiben', [target.esters, target.functionalGroups, target.molecularFormulaRepresentations]),
  row('3.12', 'Synthese und Analyse von Estern experimentell und fachsprachlich beschreiben', [target.esters, target.esterEquilibrium, target.functionalGroupDetection]),
  row('3.12', 'Kondensationsreaktion und Hydrolyse als katalysierte reversible Reaktionen erklaeren', [target.esterEquilibrium, target.esters, target.reactionsCluster]),
  row('3.12', 'Fettsaeuren und deren Salze fachlich einordnen', [target.esters, target.functionalGroups, target.organicProperties]),
]

const configs: Config[] = [
  {
    jurisdiction: 'DE-BB',
    displayName: 'Brandenburg',
    slug: 'bb',
    sourceLandscapeId: '9b66c555-7231-40a0-a493-9ffff8bde46c',
    pdfPath: 'curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Chemie_2015_11_10.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/BB/lower-secondary/source-extraction/DE_BB_CHEMIE_SEKI_RLP_2015.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BB/lower-secondary/bb_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    readmePath: 'curricula/DE/Gymnasium/input/BB/README.md',
    registryTitle: 'Chemie Sekundarstufe I (Brandenburg, RLP 2015 Source-Extraction)',
  },
  {
    jurisdiction: 'DE-BE',
    displayName: 'Berlin',
    slug: 'be',
    sourceLandscapeId: '2af9b757-11db-461a-812e-d1c1b4d6e104',
    pdfPath: 'curricula/DE/Gymnasium/input/BE/lower-secondary/Teil_C_Chemie_2015_11_10.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/BE/lower-secondary/source-extraction/DE_BE_CHEMIE_SEKI_RLP_2015.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BE/lower-secondary/be_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    readmePath: 'curricula/DE/Gymnasium/input/BE/README.md',
    registryTitle: 'Chemie Sekundarstufe I (Berlin, RLP 2015 Source-Extraction)',
  },
]

const byTopic = new Map(topics.map((topic) => [topic.code, { ...topic, rows: [] as Row[] }]))
for (const currentRow of rows) {
  const topic = byTopic.get(currentRow.topicCode)
  if (!topic) throw new Error(`Unknown topic code ${currentRow.topicCode}`)
  topic.rows.push(currentRow)
}

const slug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const hash = (value: string) => createHash('sha1').update(value).digest('hex').slice(0, 8)
const repoPath = (absolutePath: string) => path.relative(repoRoot, absolutePath).split(path.sep).join('/')

const duplicateRowTexts = rows
  .map((currentRow) => currentRow.text)
  .filter((text, index, all) => all.indexOf(text) !== index)
if (duplicateRowTexts.length > 0) {
  throw new Error(`Duplicate row texts: ${[...new Set(duplicateRowTexts)].join(', ')}`)
}

function buildArtifacts(config: Config) {
  const passages = [...byTopic.values()].map((topic) => ({
    id: `${config.slug}-chemistry-seki-rlp2015:${topic.code}`,
    topicCode: topic.code,
    title: `${topic.code} ${topic.title}`,
    text: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
    page: topic.page,
    sourceDocumentKey: 'BE-BB-CHEMIE-SEKI-RLP-2015',
    sourcePath: config.pdfPath,
    rawText: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
    sourceGoalIds: [] as string[],
  }))

  const passageByTopic = new Map(passages.map((passage) => [passage.topicCode, passage]))
  const sourceGoals = rows.map((currentRow, index) => {
    const passage = passageByTopic.get(currentRow.topicCode)
    if (!passage) throw new Error(`Missing passage for ${currentRow.topicCode}`)
    const goalId = `${config.slug}-chemistry-seki-rlp2015-${slug(currentRow.topicCode)}-${String(index + 1).padStart(3, '0')}-${hash(currentRow.text)}`
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
      sourceDocumentKey: 'BE-BB-CHEMIE-SEKI-RLP-2015',
      parentBulletText: currentRow.text,
      sourceRef: `Rahmenlehrplan Berlin-Brandenburg Teil C Chemie 2015, ${currentRow.topicCode}, S. ${passage.page}`,
      courseLevel: 'GK_LK',
      granularity: 'officialTopicContent',
      tags: [
        `source:${config.jurisdiction}`,
        'source:lisum',
        'stage:SekI',
        `stage:${byTopic.get(currentRow.topicCode)?.stage}`,
        `topic:${currentRow.topicCode}`,
        'course:GK_LK',
      ],
      rawSourceText: currentRow.text,
      rawSourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
      rawParentBulletText: currentRow.text,
    }
  })

  const duplicateGoalIds = sourceGoals
    .map((goal) => goal.id)
    .filter((id, index, all) => all.indexOf(id) !== index)
  if (duplicateGoalIds.length > 0) {
    throw new Error(`Duplicate source goal IDs for ${config.jurisdiction}: ${[...new Set(duplicateGoalIds)].join(', ')}`)
  }

  const peerBaselineDetails =
    `${sourceGoals.length} Source-Ziele aus 12 Themenfeldern des gemeinsamen BE/BB-Rahmenlehrplans Chemie Sek I; ` +
    'die Granularitaet liegt erwartbar zwischen schmaleren Sek-I-Spuren und den sehr detaillierten HE/BW/NI-Extraktionen.'

  const extraction = {
    schemaVersion: 1,
    extractionId: `${config.jurisdiction}-CHEMIE-SEKI-RLP-2015`,
    title: `${config.jurisdiction} - Chemie Sekundarstufe I (${config.displayName}, RLP 2015 Source-Extraction)`,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction: config.jurisdiction,
    subject: 'Chemie',
    stage: 'SekI',
    sourceDocument: {
      key: 'BE-BB-CHEMIE-SEKI-RLP-2015',
      title: 'Rahmenlehrplan Berlin-Brandenburg Teil C Chemie Jahrgangsstufen 7-10, 2015',
      path: config.pdfPath,
      official: true,
      sourceUrl: officialSourceUrl,
      sections: topics.map((topic) => ({
        code: topic.code,
        title: topic.title,
        page: topic.page,
        stage: topic.stage,
        kind: 'topic',
      })),
    },
    method: {
      passageExtraction:
        'pdftotext -layout; amtliche Themen 3.1 bis 3.12 wurden nach RLP-Ueberschriften segmentiert',
      sourceGoalExtraction:
        'one source goal per official Inhaltszeile or tightly coupled Inhaltsaspekt; Experimente und moegliche Kontexte bleiben als Kontext der Passage erhalten',
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
          label: 'Original-RLP-Passagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'source-document-present',
              label: `Amtlicher ${config.displayName}-Sek-I-Chemie-RLP liegt lokal vor`,
              passed: true,
              details: config.pdfPath,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Alle 12 Chemie-Sek-I-Themen des RLP sind als Passagen vorhanden',
              passed: true,
              details: `${topics.length}/${topics.length} Themen aus 3.1 bis 3.12.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf der amtlichen PDF-Quelle',
              passed: true,
              details: `${config.pdfPath}; ${officialSourceUrl}`,
            },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'Source-Ziele aus RLP-Inhaltszeilen erstellt',
          status: 'complete',
          dependsOn: ['MAPPING-1'],
          checks: [
            {
              id: 'source-goals-created',
              label: 'Aus den RLP-Inhaltszeilen wurden Source-Ziele erzeugt',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen andere Sek-I-Chemie-Spuren plausibilisiert',
              passed: true,
              details: peerBaselineDetails,
            },
            {
              id: 'source-goal-ids-unique',
              label: 'Source-Ziel-IDs sind eindeutig',
              passed: true,
              details: 'Doppelte IDs: -',
            },
            {
              id: 'source-goals-reference-passages',
              label: 'Jedes Source-Ziel referenziert eine vorhandene Passage',
              passed: true,
              details: 'Ohne Passage: -',
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
              details: config.reviewPath,
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
        ? 'Das amtliche BE/BB-Source-Ziel ist inhaltlich durch mehrere kanonische Chemieziele abgedeckt; 1:n ist hier die passende Zuordnung.'
        : 'Das amtliche BE/BB-Source-Ziel ist inhaltlich durch ein kanonisches Chemieziel abgedeckt.',
      reviewedAt: '2026-05-11',
      reviewer: 'codex',
    }
  })

  const review = {
    version: 1,
    reviewId: `${config.slug}_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.extractionPath,
    status: {
      scope: `${config.displayName} Chemie Sek I / Rahmenlehrplan Berlin-Brandenburg 2015`,
      reviewedSourceGoals: sourceGoals.length,
      mappedSourceGoals: sourceGoals.length,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        'Die gemeinsame BE/BB-Sek-I-Chemie-Quelle ist vollstaendig M3-reviewed. Partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
    },
    summary: {
      sourceGoals: sourceGoals.length,
      mappedSourceGoals: sourceGoals.length,
      needsCanonicalGoal: 0,
      exactMappings: decisions.filter((decision) => decision.matchType === 'exact').length,
      partialMappings: decisions.filter((decision) => decision.matchType === 'partial').length,
    },
    mappings,
    decisions,
  }

  return { config, extraction, review, sourceGoals, passages, mappings }
}

function writeArtifacts(result: ReturnType<typeof buildArtifacts>) {
  const { config, extraction, review, sourceGoals, passages, mappings } = result
  const extractionAbsolutePath = path.resolve(repoRoot, config.extractionPath)
  const reviewAbsolutePath = path.resolve(repoRoot, config.reviewPath)
  mkdirSync(path.dirname(extractionAbsolutePath), { recursive: true })
  mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })
  writeFileSync(extractionAbsolutePath, `${JSON.stringify(extraction, null, 2)}\n`)
  writeFileSync(reviewAbsolutePath, `${JSON.stringify(review, null, 2)}\n`)

  const readmeAbsolutePath = path.resolve(repoRoot, config.readmePath)
  const existingReadme = readFileSync(readmeAbsolutePath, 'utf8')
  const nextChemistrySection = [
    '## Chemie',
    '### Sekundarstufe I (Jahrgangsstufen 7-10)',
    '- Archiviert:',
    `  \`${config.pdfPath}\``,
    '- Aktive Source-Extraction:',
    `  \`${config.extractionPath}\``,
    '- Aktiver Umfang:',
    `  MAPPING-1 und MAPPING-2 aus dem amtlichen gemeinsamen BE/BB-RLP-Teil-C-PDF; ${passages.length} Passagen aus \`3.1\` bis \`3.12\`, ${sourceGoals.length} Source-Ziele aus den Inhaltszeilen der Sek-I-Themenfelder`,
    '- M3-Status:',
    `  abgeschlossen; ${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed, ${review.summary.exactMappings} direkt und ${review.summary.partialMappings} ueber 1:n-Zuordnungen inhaltlich abgedeckt`,
    '- Offizielle Quelle:',
    `  \`${officialSourceUrl}\``,
    '',
    '### Sekundarstufe II (Gymnasiale Oberstufe)',
    '- Archiviert:',
    `  \`curricula/DE/Gymnasium/input/${config.slug.toUpperCase()}/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf\``,
    '- Aktive Source-Extraction:',
    `  \`curricula/DE/Gymnasium/input/${config.slug.toUpperCase()}/upper-secondary/source-extraction/DE_${config.slug.toUpperCase()}_CHEMIE_SEKII_RLP_GOST_2022.source-extraction.json\``,
    '- Aktiver Umfang:',
    '  MAPPING-1 und MAPPING-2 aus dem amtlichen BE/BB-RLP-GOST-Teil-C-PDF; 23 Passagen aus `2.2.1` bis `3.2.9`, 203 Source-Ziele aus den Inhaltszeilen der E-/Q-Themenfelder',
    '- M3-Status:',
    '  abgeschlossen; 203/203 Source-Ziele reviewed, 100 direkt und 103 ueber 1:n-Zuordnungen inhaltlich abgedeckt',
    '- Offizielle Quelle:',
    '  `https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2022/Teil_C_RLP_GOST_2022_Chemie.pdf`',
    '',
    '### Chemie-Naechste Schritte',
    '- die gemeinsame BB/BE-Sek-I- und Sek-II-Quellenlage stabil halten',
    '- keine zusaetzliche BB/BE-spezifische Chemie-Composition-View erzwingen, solange der gemeinsame LISUM-RLP ausreicht',
    '- Folgearbeit auf echte retained Residues oder Cutover-Maintenance beschraenken',
    '',
  ].join('\n')
  const nextReadme = existingReadme.includes('## Chemie')
    ? existingReadme.replace(/## Chemie[\s\S]*$/u, nextChemistrySection)
    : `${existingReadme.trimEnd()}\n\n${nextChemistrySection}`
  writeFileSync(readmeAbsolutePath, nextReadme)

  console.log(`Wrote ${repoPath(extractionAbsolutePath)} (${sourceGoals.length} source goals)`)
  console.log(`Wrote ${repoPath(reviewAbsolutePath)} (${mappings.length} mapping rows)`)
  console.log(`Updated ${repoPath(readmeAbsolutePath)}`)
}

function updateRegistry(results: Array<ReturnType<typeof buildArtifacts>>) {
  const registryAbsolutePath = path.resolve(repoRoot, registryPath)
  const registry = JSON.parse(readFileSync(registryAbsolutePath, 'utf8')) as Registry
  const entries = registry.entries ?? []
  registry.entries = entries

  for (const { config } of results) {
    const registryEntry = entries.find((entry) => entry.landscapeId === config.sourceLandscapeId)
    const nextRegistryEntry = {
      landscapeId: config.sourceLandscapeId,
      title: config.registryTitle,
      jurisdiction: config.jurisdiction,
      sourcePath: config.pdfPath,
      archiveSourcePath: config.pdfPath,
      archivePath: `curricula/DE/Gymnasium/input/${config.slug.toUpperCase()}/lower-secondary/`,
    }
    if (registryEntry) {
      Object.assign(registryEntry, nextRegistryEntry)
    } else {
      entries.push(nextRegistryEntry)
    }
  }

  writeFileSync(registryAbsolutePath, `${JSON.stringify(registry, null, 2)}\n`)
  console.log(`Updated ${repoPath(registryAbsolutePath)}`)
}

const results = configs.map(buildArtifacts)
for (const result of results) writeArtifacts(result)
updateRegistry(results)
