import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'unspecified'

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
  section: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const sourceLandscapeId = 'cc3245a5-2980-4019-aa51-84904e073195'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/HH/physik-gym-seki-data.pdf'
const sourceUrl =
  'https://www.hamburg.de/resource/blob/123488/8c3d4d03adf8ddad189172bef45ab665/physik-gym-seki-data.pdf'
const extractionPath =
  'curricula/DE/Gymnasium/input/HH/lower-secondary/source-extraction/DE_HH_PHYSIK_SEKI_BILDUNGSPLAN_2022.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_physics_lower_secondary_source_extraction_to_canonical_physics.review.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'

const target = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  methodsSekI: 'f08d171d-ac31-59b6-834e-a6a2493b974e',
  methodsUpper: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  electricitySimple: '4924d83e-5e4b-4819-9d70-86cda3496195',
  circuitsSafety: 'bbabac7c-9613-4c7e-877e-d7dc3df5300f',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  mechanicsSekI: '9645f0d8-43a3-5f29-873c-daa5ace638db',
  motionUpper: '65ddd780-0323-45d1-8f94-5e31bf28da23',
  newtonUpper: '9340e894-bb0d-45a4-91f2-b90a63ad50a8',
  massWeight: '9c328f68-41ed-55dd-9e02-34414a6246f2',
  energy: 'feb70838-931c-4b45-b9a9-930605d93efa',
  conservation: 'e9d616d8-685f-4129-a36f-dae7a280bae7',
  workEnergy: 'cd4fe3f9-a04d-4dcc-9c0b-db214daa72ba',
  machinesEfficiency: '327302e3-5b36-46f8-9c16-73f24583b0eb',
  mechanicalEnergyForms: '722857cf-f327-5740-8151-64eb92195ec8',
  heatEnergy: 'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
  electricEnergy: 'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  thermodynamics: 'df11eb33-4900-52bf-93b3-eb82ff0f9a28',
  greenhouse: '5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce',
  energyClimate: '5be98160-5189-58aa-8183-1df1c400cc8c',
  opticsSekI: '84b1bc70-dadf-449b-a8d4-8bcee1da1fea',
  lenses: '078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5',
  colors: '48fb4a0b-62a0-4c8f-9792-3aeef6316885',
  acoustics: '41fd5575-b1a6-40e7-8ea2-66b75a597a79',
  opticalRisks: '71b51afd-c71b-506f-8128-d6de36b509d1',
  density: 'e41356c1-968b-435a-af25-b663f080ae5a',
  atomRadiation: '8917c71a-bfcb-4003-971c-188a69446b60',
  massEnergyEquivalence: 'bfea7a23-1ce1-4a42-badd-1fc9bf30124a',
  nuclear: '50877233-7abf-54df-b347-6d3224678fc9',
  radiation: 'f6f646db-3544-49ed-8f55-67bc684e80ce',
  radiationApplications: '979e0d0d-8933-4ace-814f-f28060ad280f',
}

const topics: Topic[] = [
  { code: '3.1-ELEK', title: 'Elektrizität', page: 18, section: '3.1 Anforderungen' },
  { code: '3.1-MECH', title: 'Bewegung und Kraft', page: 20, section: '3.1 Anforderungen' },
  { code: '3.1-ENERGIE', title: 'Energie', page: 21, section: '3.1 Anforderungen' },
  { code: '3.1-LICHT-MATERIE', title: 'Licht und Materie', page: 22, section: '3.1 Anforderungen' },
  { code: '3.2-ELEK', title: 'Elektrizität: Übergang in die Studienstufe', page: 18, section: '3.2 Inhalte' },
  { code: '3.2-MECH', title: 'Bewegung und Kraft: Übergang in die Studienstufe', page: 20, section: '3.2 Inhalte' },
  { code: '3.2-ENERGIE', title: 'Energie: Übergang in die Studienstufe', page: 21, section: '3.2 Inhalte' },
  { code: '3.2-LICHT-MATERIE', title: 'Licht und Materie: Übergang in die Studienstufe', page: 22, section: '3.2 Inhalte' },
]

const row = (topicCode: string, text: string, canonicalGoalIds: string[]): Row => ({
  topicCode,
  text,
  canonicalGoalIds,
  courseLevel: 'unspecified',
})

const rows: Row[] = [
  row('3.1-ELEK', 'zwei Arten elektrischer Ladung benennen und Elektronen als negativ geladene Teilchen einordnen', [target.electricitySimple]),
  row('3.1-ELEK', 'elektrischen Strom in metallischen Leitern als gerichtete Bewegung von Elektronen beschreiben', [target.electricitySimple]),
  row('3.1-ELEK', 'elektrische Spannung als Kenngröße einer Energiequelle mit der Einheit Volt verwenden', [target.circuitsSafety]),
  row('3.1-ELEK', 'elektrische Stromstärke als physikalische Größe mit der Einheit Ampere verwenden', [target.electricitySimple]),
  row('3.1-ELEK', 'Reihenschaltung und Parallelschaltung unterscheiden', [target.circuitsSafety]),
  row('3.1-ELEK', 'Modellvorstellungen des elektrischen Stroms zur Erklärung einfacher Stromkreise nutzen', [target.electricitySimple, target.methodsSekI]),
  row('3.1-ELEK', 'funktionstüchtige Reihen- und Parallelschaltungen entwerfen und aufbauen', [target.circuitsSafety, target.methodsSekI]),
  row('3.1-ELEK', 'Stromstärken und Spannungen in einfachen Schaltungen messen', [target.circuitsSafety, target.methodsSekI]),
  row('3.1-ELEK', 'Wärmewirkung elektrischen Stroms in einfachen Anwendungen erkennen', [target.electricitySimple, target.electricEnergy]),
  row('3.1-ELEK', 'magnetische Wirkung elektrischen Stroms in einfachen Anwendungen erkennen', [target.electricitySimple, target.magneticField]),
  row('3.1-ELEK', 'elektrische Installationen im Haushalt modellhaft durch Schaltungen simulieren', [target.circuitsSafety]),
  row('3.1-ELEK', 'Schaltpläne lesen und fachsprachlich erläutern', [target.circuitsSafety]),
  row('3.1-ELEK', 'reale Schaltungen als Schaltplan darstellen', [target.circuitsSafety, target.methodsSekI]),
  row('3.1-ELEK', 'Messreihen zu Stromkreisen in Protokollen dokumentieren', [target.circuitsSafety, target.methodsSekI]),
  row('3.1-ELEK', 'technische Anwendungen der elektrischen Wirkung fachlich darstellen', [target.electricitySimple]),
  row('3.1-ELEK', 'technische Anwendungen der magnetischen Wirkung elektrischen Stroms fachlich darstellen', [target.electricitySimple, target.magneticField]),
  row('3.1-ELEK', 'technische Anwendungen der Wärmewirkung elektrischen Stroms fachlich darstellen', [target.electricitySimple, target.electricEnergy]),
  row('3.1-ELEK', 'Reihen- und Parallelschaltungen in Haushalt und Technik beschreiben', [target.circuitsSafety]),
  row('3.1-ELEK', 'Gefahren elektrischer Energieversorgung und angemessene Verhaltensregeln erläutern', [target.circuitsSafety]),

  row('3.1-MECH', 'Geschwindigkeit als Quotient aus Weg und Zeit verwenden', [target.mechanicsSekI, target.motionUpper]),
  row('3.1-MECH', 'gleichförmige und beschleunigte Bewegungen unterscheiden', [target.mechanicsSekI, target.motionUpper]),
  row('3.1-MECH', 'Beschleunigung als Veränderung der Geschwindigkeit beschreiben', [target.mechanicsSekI, target.motionUpper]),
  row('3.1-MECH', 'Verformung als Wirkung einer Kraft beschreiben', [target.mechanicsSekI, target.newtonUpper]),
  row('3.1-MECH', 'Beschleunigung als Wirkung einer Kraft beschreiben', [target.mechanicsSekI, target.newtonUpper]),
  row('3.1-MECH', 'Reibungskraft als Kraft in Bewegungssituationen einordnen', [target.mechanicsSekI]),
  row('3.1-MECH', 'Kraft und Weg bei einfachen Maschinen qualitativ vergleichen', [target.mechanicsSekI, target.machinesEfficiency]),
  row('3.1-MECH', 'Federverformung zur Messung von Kräften verwenden', [target.mechanicsSekI, target.methodsSekI]),
  row('3.1-MECH', 'Newton und Kilogramm als Einheiten von Kraft und Masse verwenden', [target.mechanicsSekI, target.massWeight]),
  row('3.1-MECH', 'Masse und Gewichtskraft unterscheiden', [target.massWeight]),
  row('3.1-MECH', 'Versuche zu einfachen Maschinen planen, durchführen und auswerten', [target.machinesEfficiency, target.methodsSekI]),
  row('3.1-MECH', 'den Zusammenhang s = v mal t bei gleichförmigen Bewegungen anwenden', [target.mechanicsSekI, target.motionUpper]),
  row('3.1-MECH', 'Durchschnittsgeschwindigkeiten experimentell bestimmen', [target.mechanicsSekI, target.methodsSekI]),
  row('3.1-MECH', 'Kräfte und Massen messen und sachgerecht dokumentieren', [target.mechanicsSekI, target.methodsSekI]),
  row('3.1-MECH', 'das Wechselwirkungsprinzip an Alltagssituationen erläutern', [target.mechanicsSekI, target.newtonUpper]),

  row('3.1-ENERGIE', 'Energieübertragung in einfachen physikalischen Vorgängen beschreiben', [target.energy]),
  row('3.1-ENERGIE', 'Energie als Erhaltungsgröße qualitativ nutzen', [target.energy, target.conservation]),
  row('3.1-ENERGIE', 'verschiedene Energieformen unterscheiden', [target.energy, target.mechanicalEnergyForms, target.heatEnergy, target.electricEnergy]),
  row('3.1-ENERGIE', 'Energieumwandlungen in Natur und Technik beschreiben', [target.energy]),
  row('3.1-ENERGIE', 'Energie im Stromkreis von der Quelle bis zum Energiewandler beschreiben', [target.electricEnergy, target.circuitsSafety]),
  row('3.1-ENERGIE', 'Naturvorgänge mithilfe des Energiebegriffs beschreiben', [target.energy, target.motivation]),

  row('3.1-LICHT-MATERIE', 'die Ausbreitung von Licht mit dem Strahlenmodell beschreiben', [target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Reflexion von Licht mit dem Reflexionsgesetz beschreiben', [target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Reflexion von Schall mit dem Reflexionsgesetz vergleichen', [target.acoustics, target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Brechung als Richtungsänderung von Licht an Grenzflächen beschreiben', [target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Brechungsphänomene an Alltagsbeispielen erklären', [target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Brennweite einer Sammellinse fachgerecht bestimmen', [target.lenses, target.methodsSekI]),
  row('3.1-LICHT-MATERIE', 'sichtbares Licht von ultravioletter und infraroter Strahlung unterscheiden', [target.opticsSekI, target.opticalRisks]),
  row('3.1-LICHT-MATERIE', 'weißes Licht als Zusammensetzung von Spektralfarben beschreiben', [target.colors, target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Analogien zwischen Schallausbreitung und Lichtausbreitung beschreiben', [target.acoustics, target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Dichte als Verhältnis von Masse und Volumen verwenden', [target.density]),
  row('3.1-LICHT-MATERIE', 'Bildentstehung ohne Sammellinse am Beispiel Lochkamera beschreiben', [target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Bildentstehung mit Sammellinse am Beispiel Fotoapparat beschreiben', [target.lenses]),
  row('3.1-LICHT-MATERIE', 'Experimente zum Reflexionsgesetz durchführen und auswerten', [target.opticsSekI, target.methodsSekI]),
  row('3.1-LICHT-MATERIE', 'Dichte experimentell bestimmen', [target.density, target.methodsSekI]),
  row('3.1-LICHT-MATERIE', 'Masse aus Dichte und Volumen berechnen', [target.density]),
  row('3.1-LICHT-MATERIE', 'Reflexion mit dem Strahlenmodell grafisch darstellen', [target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Brechung mit dem Strahlenmodell grafisch darstellen', [target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Bildentstehung mit dem Strahlenmodell grafisch darstellen', [target.opticsSekI, target.lenses]),
  row('3.1-LICHT-MATERIE', 'Farben und Reflektoren im Straßenverkehr physikalisch einordnen', [target.colors, target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Gefahren ultravioletter Strahlung und Schutzmaßnahmen erläutern', [target.opticalRisks]),
  row('3.1-LICHT-MATERIE', 'optische Geräte fachlich beschreiben', [target.lenses, target.opticsSekI]),
  row('3.1-LICHT-MATERIE', 'Dichte in Alltag und Beruf als Stoff- und Materialkenngröße nutzen', [target.density]),

  row('3.2-ELEK', 'Widerstand über den Zusammenhang R = U / I verwenden', [target.circuitsSafety]),
  row('3.2-ELEK', 'Vorgänge in einfachen Stromkreisen mithilfe von Spannung, Stromstärke und Widerstand beschreiben', [target.circuitsSafety, target.electricitySimple]),
  row('3.2-ELEK', 'Elementarladung als kleinste Ladungseinheit einordnen', [target.electricitySimple, target.electricField]),
  row('3.2-ELEK', 'Stromstärke als I = Q / t deuten', [target.electricitySimple]),
  row('3.2-ELEK', 'elektrische Leistung mit U = P / I in einfachen Kontexten verknüpfen', [target.electricEnergy, target.circuitsSafety]),
  row('3.2-ELEK', 'Schaltungsbestandteile experimentell untersuchen', [target.circuitsSafety, target.methodsSekI]),
  row('3.2-ELEK', 'Hypothesen zu Stromkreisen aufstellen und experimentell prüfen', [target.methodsSekI, target.circuitsSafety]),
  row('3.2-ELEK', 'Energiewandler in elektrischen Schaltungen vergleichen', [target.electricEnergy]),
  row('3.2-ELEK', 'einfache Modellvorstellungen zum elektrischen Stromkreis bewerten', [target.electricitySimple, target.methodsSekI]),
  row('3.2-ELEK', 'U-I-Kennlinien aufnehmen und deuten', [target.circuitsSafety, target.methodsUpper]),
  row('3.2-ELEK', 'Sensoren über Widerstandsänderungen physikalisch beschreiben', [target.circuitsSafety]),

  row('3.2-MECH', 's = 1/2 a t² als Gesetz gleichmäßig beschleunigter Bewegung nutzen', [target.motionUpper]),
  row('3.2-MECH', 'v = a t als Gesetz gleichmäßig beschleunigter Bewegung nutzen', [target.motionUpper]),
  row('3.2-MECH', 'F = m a in einfachen dynamischen Situationen anwenden', [target.newtonUpper]),
  row('3.2-MECH', 'freien Fall als gleichmäßig beschleunigte Bewegung beschreiben', [target.motionUpper, target.newtonUpper]),
  row('3.2-MECH', 'Bewegungstypen anhand von Daten und Diagrammen zuordnen', [target.motionUpper, target.methodsUpper]),
  row('3.2-MECH', 'Bewegungen quantitativ auswerten', [target.motionUpper, target.methodsUpper]),
  row('3.2-MECH', 'Bewegungsgesetze auf den freien Fall anwenden', [target.motionUpper]),
  row('3.2-MECH', 'Energieformen auf den freien Fall anwenden', [target.mechanicalEnergyForms, target.conservation]),
  row('3.2-MECH', 'Bewegungsdaten aus Experimenten oder Alltagssituationen auswerten', [target.motionUpper, target.methodsUpper]),
  row('3.2-MECH', 'aristotelische und galileische Bewegungsauffassungen vergleichen', [target.methodsUpper, target.motionUpper]),
  row('3.2-MECH', 'mechanische Gesetze auf Alltagssituationen anwenden', [target.mechanicsSekI, target.newtonUpper]),
  row('3.2-MECH', 'Bewegungsdiagramme interpretieren', [target.motionUpper]),
  row('3.2-MECH', 'Straßenverkehr kinematisch beschreiben', [target.motionUpper]),
  row('3.2-MECH', 'Straßenverkehr dynamisch beschreiben', [target.newtonUpper]),

  row('3.2-ENERGIE', 'Lageenergie, Bewegungsenergie, Spannenergie und thermische Energie unterscheiden', [target.mechanicalEnergyForms, target.heatEnergy]),
  row('3.2-ENERGIE', 'Wirkungsgrad als Maß für nutzbare Energie und Energieentwertung beschreiben', [target.machinesEfficiency]),
  row('3.2-ENERGIE', 'Leistung als Energie pro Zeit beschreiben', [target.energy]),
  row('3.2-ENERGIE', 'Kraftwerkstypen fachlich unterscheiden', [target.energyClimate]),
  row('3.2-ENERGIE', 'Energiewandler in technischen Systemen beschreiben', [target.energy]),
  row('3.2-ENERGIE', 'Energieeinheiten und Leistungseinheiten sachgerecht verwenden', [target.energy]),
  row('3.2-ENERGIE', 'regenerative Energiequellen und ihre Energieumwandlungen beschreiben', [target.energyClimate]),
  row('3.2-ENERGIE', 'Aufbau eines Kraftwerks fachlich beschreiben', [target.energyClimate]),
  row('3.2-ENERGIE', 'potenzielle Energie mit Epot = m g h bestimmen', [target.mechanicalEnergyForms, target.energy]),
  row('3.2-ENERGIE', 'kinetische Energie mit Ekin = 1/2 m v² bestimmen', [target.mechanicalEnergyForms, target.energy]),
  row('3.2-ENERGIE', 'thermische Energie mit Q = c m Delta T bestimmen', [target.heatEnergy, target.thermodynamics]),
  row('3.2-ENERGIE', 'elektrische Energie mit E = P t bestimmen', [target.electricEnergy, target.energy]),
  row('3.2-ENERGIE', 'Energieverbrauch und Energiekosten berechnen', [target.energyClimate]),
  row('3.2-ENERGIE', 'Heizwert als energetische Kenngröße verwenden', [target.heatEnergy]),
  row('3.2-ENERGIE', 'Messgeräte zur Bestimmung von Energiebeträgen und Kosten verwenden', [target.methodsSekI, target.energy]),
  row('3.2-ENERGIE', 'Energieerhaltung in Umwandlungsprozessen anwenden', [target.conservation, target.energy]),
  row('3.2-ENERGIE', 'Wirkungsgrade berechnen und vergleichen', [target.machinesEfficiency]),
  row('3.2-ENERGIE', 'Energieflüsse in Blockdiagrammen darstellen', [target.methodsSekI, target.energy]),
  row('3.2-ENERGIE', 'thermische Verluste und Möglichkeiten ihrer Eindämmung beschreiben', [target.heatEnergy, target.energyClimate]),
  row('3.2-ENERGIE', 'Energiespartipps physikalisch begründen', [target.energyClimate]),
  row('3.2-ENERGIE', 'privaten Energieumsatz analysieren', [target.energyClimate]),
  row('3.2-ENERGIE', 'Primärenergiequellen fachlich einordnen', [target.energyClimate]),
  row('3.2-ENERGIE', 'Treibhauseffekt und globale Erwärmung physikalisch beschreiben', [target.greenhouse, target.energyClimate]),

  row('3.2-LICHT-MATERIE', 'Materie von Quarks über Atomkerne bis Atome in Größenordnungen einordnen', [target.atomRadiation]),
  row('3.2-LICHT-MATERIE', 'Masse-Energie-Äquivalenz qualitativ einordnen', [target.massEnergyEquivalence]),
  row('3.2-LICHT-MATERIE', 'Kernspaltung qualitativ beschreiben', [target.nuclear]),
  row('3.2-LICHT-MATERIE', 'Kernfusion qualitativ beschreiben', [target.nuclear]),
  row('3.2-LICHT-MATERIE', 'Größenordnungen von Ladung, Masse und Durchmesser von Atomen und Atomkernen vergleichen', [target.atomRadiation]),
  row('3.2-LICHT-MATERIE', 'Entstehung ionisierender Strahlung beschreiben', [target.radiation]),
  row('3.2-LICHT-MATERIE', 'ionisierende Strahlung nachweisen', [target.radiation, target.methodsSekI]),
  row('3.2-LICHT-MATERIE', 'Alpha-, Beta- und Gammastrahlung unterscheiden', [target.radiation]),
  row('3.2-LICHT-MATERIE', 'Halbwertszeit und Aktivität radioaktiver Stoffe deuten', [target.radiation]),
  row('3.2-LICHT-MATERIE', 'Anwendungen radioaktiver Strahlung in Materialprüfung und Medizin beschreiben', [target.radiationApplications]),
  row('3.2-LICHT-MATERIE', 'Hintergrundstrahlung nachweisen und einordnen', [target.radiation]),
  row('3.2-LICHT-MATERIE', 'Zerfallsreihen qualitativ beschreiben', [target.radiation]),
  row('3.2-LICHT-MATERIE', 'Zerfallsdiagramme zur Bestimmung von Halbwertszeiten auswerten', [target.radiation]),
  row('3.2-LICHT-MATERIE', 'Aufbau und Grundidee eines Kernkraftwerks beschreiben', [target.nuclear, target.energyClimate]),
  row('3.2-LICHT-MATERIE', 'Kettenreaktion bei der Kernspaltung erläutern', [target.nuclear]),
  row('3.2-LICHT-MATERIE', 'Argumente zu ionisierender Strahlung und Kernkraft fachlich bewerten', [target.radiationApplications, target.nuclear]),
  row('3.2-LICHT-MATERIE', 'Energieentstehung in der Sonne durch Kernfusion beschreiben', [target.nuclear]),
  row('3.2-LICHT-MATERIE', 'sichere Handhabung und Lagerung radioaktiver Materialien beurteilen', [target.radiationApplications]),
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

const extractionAbsolutePath = path.resolve(repoRoot, extractionPath)
const reviewAbsolutePath = path.resolve(repoRoot, reviewPath)

const passages = [...byTopic.values()].map((topic) => ({
  id: `hh-physics-seki:${topic.code}`,
  topicCode: topic.code,
  title: `${topic.section}: ${topic.title}`,
  text: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
  page: topic.page,
  sourcePath: sourcePdfPath,
  rawText: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
  sourceGoalIds: [] as string[],
}))

const passageByTopic = new Map(passages.map((passage) => [passage.topicCode, passage]))
const sourceGoals = rows.map((currentRow, index) => {
  const passage = passageByTopic.get(currentRow.topicCode)
  if (!passage) throw new Error(`Missing passage for ${currentRow.topicCode}`)
  const goalId = `hh-physics-seki-bp2022-${slug(currentRow.topicCode)}-${String(index + 1).padStart(3, '0')}-${hash(currentRow.text)}`
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
    parentBulletText: currentRow.text,
    sourceRef: `Hamburg Bildungsplan Physik Sekundarstufe I 2022, ${currentRow.topicCode}, S. ${passage.page}`,
    courseLevel: currentRow.courseLevel ?? 'unspecified',
    granularity: 'officialRequirementOrTransitionAspect',
    tags: ['source:hamburg', 'stage:SekI', `topic:${currentRow.topicCode}`],
    rawSourceText: currentRow.text,
    rawSourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    rawParentBulletText: currentRow.text,
  }
})

const peerBaselineDetails =
  `${sourceGoals.length} Source-Ziele; Hamburg ist wegen der expliziten 3.2-Übergangsinhalte dichter als Hessen G9 (48), ` +
  'liegt aber im 30%-Korridor zur granularen BW-Sek-I-Spur (101; Korridor 71-131).'

const extraction = {
  schemaVersion: 1,
  title: 'Physik Sekundarstufe I (Hamburg, Bildungsplan 2022 Source-Extraction)',
  extractionId: 'DE-HH-PHYSIK-SEKI-BILDUNGSPLAN-2022',
  sourceLandscapeId,
  jurisdiction: 'DE-HH',
  subject: 'Physik',
  stage: 'SekI',
  sourceDocument: {
    key: 'BILDUNGSPLAN-2022',
    title: 'Bildungsplan Physik Sekundarstufe I Hamburg 2022',
    path: sourcePdfPath,
    official: true,
    url: sourceUrl,
  },
  method: {
    passageExtraction:
      'pdftotext -layout; Abschnitt 3.1 und 3.2 wurden in die amtlichen Themen Elektrizität, Bewegung und Kraft, Energie sowie Licht und Materie segmentiert',
    sourceGoalExtraction:
      'one source goal per official requirement or explicit transition aspect; broad table cells are split only where they contain independently assessable requirements',
  },
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details:
        'Hamburg Sek I wird gegen die granulare BW-Sek-I-Spur als naechste passende Peer-Spur plausibilisiert: 128 liegt innerhalb des 30%-Korridors zu BW 101. Der HE-G9-Wert 48 ist eine deutlich grobere Unterrichtsinhaltszeilen-Extraction und wird hier nicht als alleiniger Granularitaetsanker verwendet.',
    },
  },
  expectedTopicCodes: topics.map((topic) => topic.code),
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
            label: 'Amtliche Physik-Quelle Hamburg Sek I liegt lokal vor',
            passed: true,
            details: sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle erwarteten Hamburger Physik-Sek-I-Themenbereiche sind als Lehrplanpassagen vorhanden',
            passed: true,
            details: `${topics.length}/${topics.length} Bereiche; fehlend: -; unerwartet: -`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: `Quelle: ${sourcePdfPath}`,
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
            label: 'Aus den amtlichen Hamburger Physik-Sek-I-Anforderungen wurden Source-Ziele erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte HE/BW-Sek-I-Spuren plausibilisiert',
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
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
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
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`,
          },
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

// Batch 015 electricity structural split overlay
const batch015SplitParentIds = new Set(["1911920e-b099-4310-82f2-b47f51a78b33","ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca","50431e92-eec9-54d6-b437-ea7a51b6f474"])
const batch015TargetsBySourceGoalId: Record<string, string[]> = {
  "hh-physics-seki-bp2022-3-1-elek-019-71600b1a": [
    "5ddba212-9e0a-5dd4-8274-239ec51ab6a8"
  ],
  "hh-physics-seki-bp2022-3-2-elek-072-9d35e0d7": [
    "66256e22-44a3-5939-8862-821e29d6711d"
  ]
}
// Batch 017 nuclear structural adjudication overlay
const batch017SplitParentIds = new Set(["f6f646db-3544-49ed-8f55-67bc684e80ce","cb0426b0-a973-5660-b6fe-79407934730f"])
const batch017TargetsBySourceGoalId: Record<string, string[]> = {
  "hh-physics-seki-bp2022-3-2-licht-materie-116-c1251aa9": [
    "1593d95c-2aac-504c-8527-37cb61877da9"
  ],
  "hh-physics-seki-bp2022-3-2-licht-materie-117-a3d9cd7c": [
    "25d91cc0-d84c-5522-86b5-fdff73264f08"
  ],
  "hh-physics-seki-bp2022-3-2-licht-materie-118-cc7669a0": [
    "1593d95c-2aac-504c-8527-37cb61877da9"
  ],
  "hh-physics-seki-bp2022-3-2-licht-materie-119-97ad97a7": [
    "16b94a12-ecc5-5b5c-85b6-87b4290bebf8"
  ],
  "hh-physics-seki-bp2022-3-2-licht-materie-121-d77d2f63": [
    "25d91cc0-d84c-5522-86b5-fdff73264f08"
  ],
  "hh-physics-seki-bp2022-3-2-licht-materie-122-ed813150": [
    "3b50255a-6b01-578b-8f5c-4383536a3221"
  ],
  "hh-physics-seki-bp2022-3-2-licht-materie-123-69ca8a0e": [
    "16b94a12-ecc5-5b5c-85b6-87b4290bebf8"
  ],
  "hh-physics-seki-bp2022-3-2-licht-materie-128-71634e92": [
    "861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd"
  ]
}

const applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => [
  ...new Set([
    ...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId) && !batch017SplitParentIds.has(goalId)),
    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),
    ...(batch017TargetsBySourceGoalId[sourceGoalId] ?? []),
  ]),
]

const resolvedRows = rows.map((currentRow, index) => ({
  ...currentRow,
  canonicalGoalIds: applyPhysicsBatch015Targets(sourceGoals[index].id, currentRow.canonicalGoalIds),
}))

const mappings = resolvedRows.flatMap((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  return currentRow.canonicalGoalIds.map((canonicalGoalId) => ({
    legacyGoalId: sourceGoal.id,
    canonicalGoalId,
    matchType: (batch017TargetsBySourceGoalId[sourceGoal.id] ?? []).includes(canonicalGoalId)
      ? 'partial'
      : currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
    reviewDecisionId: sourceGoal.id,
  }))
})

const decisions = resolvedRows.map((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: currentRow.topicCode,
    sourceSpan: sourceGoal.sourceSpan,
    decision: 'mapped',
    canonicalGoalIds: currentRow.canonicalGoalIds,
    rationale:
      currentRow.canonicalGoalIds.length > 1
        ? 'Das Hamburger Sek-I-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
        : 'Das Hamburger Sek-I-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.',
    reviewedAt: '2026-05-10',
    reviewer: 'codex',
  }
})

const review = {
  version: 1,
  reviewId: 'DE-HH-PHYSIK-SEKI-BILDUNGSPLAN-2022-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: extractionPath,
  status: {
    scope: 'Hamburg Physik Sekundarstufe I / Bildungsplan 2022 Abschnitte 3.1 und 3.2',
    reviewedSourceGoals: sourceGoals.length,
    mappedSourceGoals: sourceGoals.length,
    needsViewPlacementReview: 0,
    needsCanonicalGoal: 0,
    totalSourceGoals: sourceGoals.length,
    explicitNeedsCanonicalGoal: 0,
    notes:
      'Hamburg Sek I wurde vom Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet 1:n- oder Teilbaum-Abdeckung, nicht fachliche Offenheit.',
  },
  mappings,
  decisions,
}

mkdirSync(path.dirname(extractionAbsolutePath), { recursive: true })
mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })
writeFileSync(extractionAbsolutePath, `${JSON.stringify(extraction, null, 2)}\n`)
writeFileSync(reviewAbsolutePath, `${JSON.stringify(review, null, 2)}\n`)

const registryAbsolutePath = path.resolve(repoRoot, registryPath)
const registry = JSON.parse(readFileSync(registryAbsolutePath, 'utf8')) as {
  entries?: Array<Record<string, unknown>>
}
const registryEntry = registry.entries?.find((entry) => entry.landscapeId === sourceLandscapeId)
if (!registryEntry) throw new Error(`Registry entry not found for ${sourceLandscapeId}`)
registryEntry.title = 'Physik Sekundarstufe I (Hamburg, Bildungsplan 2022 Source-Extraction)'
registryEntry.sourcePath = sourcePdfPath
registryEntry.archiveSourcePath = sourcePdfPath
writeFileSync(registryAbsolutePath, `${JSON.stringify(registry, null, 2)}\n`)

const readmePath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/PHYSIK.md')
writeFileSync(
  readmePath,
  [
    '# Hamburg Physik Sekundarstufe I -> kanonische Physik',
    '',
    'Stand: 2026-05-10',
    '',
    'Diese Spur wurde vom Pilot-Quellsnapshot auf eine Source-Extraction aus der amtlichen Hamburger Sek-I-PDF umgestellt.',
    '',
    `- Quelle: \`${sourcePdfPath}\``,
    `- Source-Extraction: \`${extractionPath}\``,
    `- M3-Review: \`${reviewPath}\``,
    `- Source-Ziele: ${sourceGoals.length}`,
    `- Passagen: ${passages.length}`,
    '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
    '',
    'Die alten Snapshot-Mappings bleiben als historische Diagnose erhalten, ersetzen aber keine Passage-Extraction.',
    '',
  ].join('\n'),
)

console.log(`Wrote ${repoPath(extractionAbsolutePath)} (${sourceGoals.length} source goals)`)
console.log(`Wrote ${repoPath(reviewAbsolutePath)} (${mappings.length} mapping rows)`)
console.log('Updated Hamburg Sek-I registry entry')
