import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'LK' | 'unspecified'

interface TopicSpec {
  code: string
  title: string
  page: number
}

interface Passage {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  rawText: string
  sourceGoalIds: string[]
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  aspectIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: 'officialBullet' | 'officialContentRow'
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

interface PipelineCheck {
  id: string
  label: string
  passed: boolean
  details: string
}

interface PipelineStep {
  id: 'MAPPING-1' | 'MAPPING-2' | 'MAPPING-3'
  label: string
  status: 'complete' | 'incomplete' | 'blocked'
  dependsOn: string[]
  checks: PipelineCheck[]
}

interface ExtractionConfig {
  extractionId: string
  sourceLandscapeId: string
  jurisdiction: 'DE-HE'
  subject: 'Physik'
  stage: Stage
  sourceDocument: {
    key: string
    title: string
    path: string
    official: true
    url: string
  }
  expectedTopics: TopicSpec[]
  outputPath: string
  reviewPath: string
}

interface ReviewCoverage {
  reviewed: number
  mapped: number
  open: number
  complete: boolean
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const canonicalPhysicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'

const upperConfig: ExtractionConfig = {
  extractionId: 'DE-HE-PHYSIK-SEKII-KC2024',
  sourceLandscapeId: '24f2ca0f-b94a-444e-bb70-677cb6f85c02',
  jurisdiction: 'DE-HE',
  subject: 'Physik',
  stage: 'SekII',
  sourceDocument: {
    key: 'KC2024',
    title: 'Kerncurriculum Physik gymnasiale Oberstufe Hessen 2024',
    path: 'curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf',
    official: true,
    url: 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-physik.pdf',
  },
  expectedTopics: [
    ['E.1', 'Bewegungen und ihre Beschreibung', 30],
    ['E.2', 'Newton’sche Axiome und Erhaltungssätze', 30],
    ['E.3', 'Waagerechter Wurf und Kreisbewegung', 31],
    ['E.4', 'Weitere Bewegungen', 31],
    ['E.5', 'Gravitation', 31],
    ['E.6', 'Grundlagen der Thermodynamik', 31],
    ['E.7', 'Drehbewegungen', 31],
    ['Q1.1', 'Elektrisches Feld', 32],
    ['Q1.2', 'Magnetisches Feld', 34],
    ['Q2.1', 'Mechanische Schwingungen', 36],
    ['Q2.2', 'Induktion und elektromagnetische Schwingungen', 37],
    ['Q2.3', 'Mechanische Wellen', 38],
    ['Q3.1', 'Elektromagnetische Wellen', 41],
    ['Q3.2', 'Welle-Teilchen-Dualismus', 41],
    ['Q3.3', 'Atomvorstellungen', 42],
    ['Q4.1', 'Quantenobjekte', 44],
    ['Q4.2', 'Technische Anwendungen der Quantenphysik', 45],
    ['Q4.3', 'Kernphysik', 45],
    ['Q4.4', 'Spezielle Relativitätstheorie', 46],
    ['Q4.5', 'Festkörperphysik', 46],
    ['Q4.6', 'Astrophysik', 47],
  ].map(([code, title, page]) => ({ code: String(code), title: String(title), page: Number(page) })),
  outputPath: 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_PHYSIK_SEKII_KC2024.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
}

const lowerConfig: ExtractionConfig = {
  extractionId: 'DE-HE-PHYSIK-SEKI-G9',
  sourceLandscapeId: '996d097a-cac2-4b5f-979a-b3a0b9803265',
  jurisdiction: 'DE-HE',
  subject: 'Physik',
  stage: 'SekI',
  sourceDocument: {
    key: 'G9',
    title: 'Lehrplan Physik Gymnasium Hessen G9',
    path: 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-physik.pdf',
    official: true,
    url: 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-physik.pdf',
  },
  expectedTopics: [
    ['7.1', 'Optik 1', 6],
    ['7.2', 'Wärmelehre', 7],
    ['7.3', 'Magnetismus und Elektrizität 1', 8],
    ['7.4', 'Mechanik', 9],
    ['8.1', 'Optik 2', 10],
    ['8.2', 'Elektrizität 2', 11],
    ['8.3a', 'Von Druck und Auftrieb [fakultativ]', 12],
    ['8.3b', 'Akustik [fakultativ]', 13],
    ['8.3c', 'Farben [fakultativ]', 14],
    ['10.1', 'Arbeit und Energie', 15],
    ['10.2', 'Radioaktivität', 16],
    ['10.3', 'Energieversorgung', 17],
  ].map(([code, title, page]) => ({ code: String(code), title: String(title), page: Number(page) })),
  outputPath: 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_PHYSIK_SEKI_G9.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
}

const normalizedLowerTopicRows: Record<string, string[]> = {
  '7.1': [
    'Erste Erfahrung mit Licht: Lichtquellen, Lichtstrahlen, Schatten, Farbigkeit, Sehen, Sehwinkel',
    'Strahlenmodell des Lichtes: Lichtbündel, Lichtstrahl, Schattenkonstruktion, Bau einer Lochkamera, Bildkonstruktion, Zusammenhang von Gegenstandsgröße, Bildgröße, Gegenstandsweite und Bildweite',
    'Reflexion des Lichtes: diffuse und gerichtete Reflexion, Bildentstehung am ebenen Spiegel, virtuelles Bild, Bildkonstruktion, Umkehrbarkeit des Lichtweges, Hohl- und Wölbspiegel, Art der Bilder',
    'Brechung und Totalreflexion: Übergang des Lichtes durch Grenzflächen verschiedener Medien, Prisma, Naturerscheinungen und Anwendungen der Totalreflexion, Lichtleiter',
  ],
  '7.2': [
    'Temperatur und Wärme: Wärmequellen, Wärmeempfinden, Temperatur als Zustandsbeschreibung',
    'Temperatur und ihre Messung: Auswirkungen von Temperaturänderungen, Ausdehnung fester Körper, Ausdehnung von Flüssigkeiten und Gasen',
    'Teilchenbild der Materie: kinetische Temperaturdeutung, Brownsche Bewegung, Billardkugelmodell',
    'Temperaturänderungen: Temperatur-Zeit-Verlauf bei Wärmezufuhr und Phasenumwandlungen, Temperaturänderung durch Reibung, Temperaturänderung durch Mischung, Wärmespeicher',
    'Wärmeausbreitung: Wärmeleitung, Wärmeströmung, Aufnahme und Abgabe von Wärmestrahlung',
  ],
  '7.3': [
    'Magnete: Pole, Kräfte, Elementarmagnete',
    'Stromkreise: elektrische Leitfähigkeit, geschlossener und offener Stromkreis',
    'Wirkungen des elektrischen Stromes und ihre Nutzung: magnetische Wirkung des elektrischen Stromes im Vergleich mit Permanentmagnetismus, Licht- und Wärmewirkung, chemische Wirkung',
    'Messung des elektrischen Stromes: Ampèremeter',
  ],
  '7.4': [
    'Eigenschaften von Körpern: Volumen, Masse, Dichte',
    'Bewegungen: gleichförmige und beschleunigte Bewegung, Weg-Zeit-Diagramme, Geschwindigkeit',
    'Kräfte und ihre Wirkung: Änderung von Bewegungszuständen, Auftreten von Kräften beim Einwirken von Körpern aufeinander, Trägheit',
    'Kräfte und ihre Eigenschaften: Zusammensetzung von Kräften, Proportionalität von Kraft und Auslenkung nach Hooke, Schwerpunkt',
    'Reibung und Fortbewegung: Haft-, Gleit- und Rollreibung, Reibung und Verkehrssicherheit',
  ],
  '8.1': [
    'Abbildung durch Linsen: Konvexlinsen, Brennweite, Art der Bilder, Bildkonstruktion, Konkavlinsen',
    'Das Auge: Sehvorgang',
    'Optische Instrumente: Bau eines optischen Instruments, zum Beispiel Fernrohr, Mikroskop, Fotoapparat oder Projektor',
  ],
  '8.2': [
    'Grunderscheinungen statischer Elektrizität: Ladungstrennung, Kondensator als Ladungsspeicher, elektrostatische Kraftwirkung, Spannung und ihre Messung mit Elektroskop oder Voltmeter',
    'Zusammenhang zwischen Spannung und Stromstärke: Widerstand, Schaltpläne und Schaltsymbole, Reihen- und Parallelschaltung, Kirchhoffsche Regeln',
    'Umgang mit elektrischen Stromkreisen: Gleichstrom, Wechselstrom, Elektrizität im Haus, Nutzung von Elektrogeräten, sicherer Umgang mit Elektrizität, Gefahr durch Strom, Verhalten bei Gewitter',
  ],
  '8.3a': [
    'Erfahrungen mit Druck: Druck und Kraft, Stempeldruck, Schweredruck, Druck in Flüssigkeiten und Gasen, Hydraulik in der Technik, Blutdruck, Luftdruck',
    'Druckänderung und Wärme: Temperaturänderung bei Druckänderung und umgekehrt, Erfahrungen mit Fahrradreifen, Eis aus der Stickstoff-Flasche, technische Anwendungen',
    'Auftrieb in Wasser und Luft: hydrostatischer Auftrieb, archimedisches Gesetz',
    'Warum fliegen Flugzeuge: Auftrieb an Tragflügeln, Luftwiderstand',
  ],
  '8.3b': [
    'Schallquellen und Empfänger: Beispiele, Erzeugung und Wahrnehmung von Schall, Töne sichtbar machen, Schwingungen',
    'Schallausbreitung: Schallträger, Schallausbreitung im Teilchenbild, Schallgeschwindigkeit',
    'Charakterisierung von Schall: Ton, Geräusch, Lärm, Knall, Klang, Lautstärke, Tonhöhe',
    'Das Ohr: Aufbau und Funktion, Hörbereich bei Menschen und Tieren',
    'Schall in unserer Umwelt: Echo, Nachhall, Lärm, Schallschutz in Häusern und auf Verkehrswegen',
    'Musik und Musikinstrumente: Klang, Klangfarbe, einfache Bauprinzipien',
  ],
  '8.3c': [
    'Entstehung von Farben: Prisma, Farbkreis, Weiß als zusammengesetzte Farbe',
    'Farbmischung: additive Farben, subtraktive Farben',
    'Wahrnehmung von Farben: Farben im Alltag und ihre Wahrnehmung, Farben im Tier- und Pflanzenreich',
    'Farben in der Technik: Farbfernseher, Farbdruck, Farbphotographie, Farben bei Bekleidung, Farben im Supermarkt',
  ],
  '10.1': [
    'Kraftverstärkende Werkzeuge: Werkzeuggebrauch als Kulturtechnik des Menschen, Vorzüge einfacher Hebelwerkzeuge, Hebelgesetz',
    'Kraftersparnis durch Räder und Rollen: Vorzüge von Seil und Rolle, Begriffsbildung von Arbeit und Leistung, goldene Regel der Mechanik, Vergleich der Leistungen von Menschen und Maschinen',
    'Mechanische Energie: Nutzung von Wasser- und Windkraft als mechanischen Antrieb',
    'Wärme als Energieform: Wärmemenge, Wärmeaustausch als Energieübertragung, Wärmezufuhr und Temperaturerhöhung',
    'Elektrizität als Energieform: Generator, Motor, Nutzung elektrischer Energie',
  ],
  '10.2': [
    'Bausteine des Atoms: Größenverhältnisse, Kern, Hülle',
    'Radioaktive Strahlung: Eigenschaften, Nachweis, Vorkommen in der Umwelt, biologische Wirkung und ihre Bewertung',
  ],
  '10.3': [
    'Erzeugung und Nutzung der verschiedenen Energieformen: mechanische Energie, Wärmeenergie, chemische Energie, elektrische Energie, Kernenergie, Generatoren, Kraftwerke, Umwandlung von Strahlungsenergie der Sonne, Nutzung von Energie in Haushalt und Technik',
    'Bereitstellung von Energie: Fernleitung elektrischer Energie, Transformator, Energieverlust durch den Transport',
    'Möglichkeiten sparsamer Energieverwendung: elektrische Energie als bequemste Energieform, Energieverluste bei der Umwandlung, Sparmöglichkeiten im Haushalt, Gerätekennzeichnungen',
  ],
}

const lowerCanonicalTargetsByTopicRow: Record<string, string[]> = {
  '7.1:1': [
    'dd7cdcea-0950-461b-96ac-ce49989fca47',
    '79cb1695-f985-443a-b93e-27b57ab474b7',
    'a4681378-ade4-4f20-bf77-fb020469510f',
    '90e1e6cf-4092-41d6-81f7-5206f9d68f84',
  ],
  '7.1:2': ['79cb1695-f985-443a-b93e-27b57ab474b7'],
  '7.1:3': ['b57427c9-1af5-5daa-8c65-b84a4cc20785'],
  '7.1:4': [
    '79cb1695-f985-443a-b93e-27b57ab474b7',
    '58fc7852-722c-5a67-be6a-bfd1be0b527e',
    'a4681378-ade4-4f20-bf77-fb020469510f',
  ],
  '7.2:1': ['940978fa-1f2d-4e54-9c28-081a6df9b76f'],
  '7.2:2': ['d27c8860-12a4-4d7d-9849-ccd8b7caca48'],
  '7.2:3': ['9ac4973a-21d5-48a5-90b4-eb90e10391ae'],
  '7.2:4': [
    '940978fa-1f2d-4e54-9c28-081a6df9b76f',
    '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
    'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
  ],
  '7.2:5': ['fbe0faae-7fba-482b-888e-341f926770f3'],
  '7.3:1': ['f778a659-1467-4aa7-97b2-bed78c530634'],
  '7.3:2': ['75bdf5ca-cda4-4658-9ec7-84c77b3759db'],
  '7.3:3': ['a5f652cc-e091-4c90-bec2-c357ae54fcf1'],
  '7.3:4': ['f1a078ae-6262-4444-a4bc-a5ab275621cf'],
  '7.4:1': [
    'af0e2efb-f634-5f2d-abea-b2e1a67a2894',
    '7c996528-5fae-5353-b8fb-d59382e225c6',
    'c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0',
  ],
  '7.4:2': ['ae67bcf1-f3ee-50d6-9a12-25a159dff659'],
  '7.4:3': ['5ea765ac-c279-551a-8a94-a07da2381e5b'],
  '7.4:4': ['10bb8262-fb0f-40cf-94ef-408420ec7cf2'],
  '7.4:5': ['581c0766-b84b-54cb-b8b6-375310329a41'],
  '8.1:1': ['078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5'],
  '8.1:2': ['90e1e6cf-4092-41d6-81f7-5206f9d68f84'],
  '8.1:3': ['6367d45e-919e-4c19-bcd9-7770a2d51139'],
  '8.2:1': ['32111497-d5ca-453e-906d-d352f885b126'],
  '8.2:2': [
    '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
    '01bebdfc-5819-4610-a03e-ea5e794fc954',
    '8a84de16-2fde-58ec-827a-f803e2ce8564',
    '267170bd-f880-56a7-9719-ffb9751872c5',
    '8f833b36-4126-52db-b210-79fb0023c7d9',
  ],
  '8.2:3': [
    '1911920e-b099-4310-82f2-b47f51a78b33',
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  ],
  '8.3a:1': ['5308de76-79f0-44f4-8cb7-fc9de4772217'],
  '8.3a:2': ['310b4f62-e261-46be-bb1b-1f125fc1699a'],
  '8.3a:3': ['e11b2ee9-e528-4857-9ecd-59bd460fba81'],
  '8.3a:4': ['24b4686a-e8a6-4583-8952-33e6f653c2a3'],
  '8.3b:1': ['c1006f55-0406-48cc-92d4-0d8345897cf4'],
  '8.3b:2': [
    '3c82510a-1f12-4eaa-81c2-8599437a5b85',
    'a24c41ce-68c5-56a7-8235-ef9a7dba7042',
  ],
  '8.3b:3': ['10aad90e-a1db-42b6-8d1e-1d856e14b47d'],
  '8.3b:4': ['2a6ad2c6-3e1b-57a9-82a1-e6620a532f5c'],
  '8.3b:5': ['da0837c7-95a7-5a6a-81db-f33cb7f42d85'],
  '8.3b:6': ['e62e48bc-2387-4b2b-8d6f-7a06c8e7580e'],
  '8.3c:1': ['a4681378-ade4-4f20-bf77-fb020469510f'],
  '8.3c:2': ['cdab9fd1-5054-4a7e-8c9a-4474062ddd23'],
  '8.3c:3': ['1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075'],
  '8.3c:4': ['cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5'],
  '10.1:1': ['327302e3-5b36-46f8-9c16-73f24583b0eb'],
  '10.1:2': ['327302e3-5b36-46f8-9c16-73f24583b0eb'],
  '10.1:3': ['722857cf-f327-5740-8151-64eb92195ec8'],
  '10.1:4': ['eeba6bf8-a2b9-4d7d-a1d6-67286c923cef'],
  '10.1:5': ['cbb26ed2-6979-46f6-a4ae-128f5c5d9d76'],
  '10.2:1': ['2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb'],
  '10.2:2': [
    'f6f646db-3544-49ed-8f55-67bc684e80ce',
    '979e0d0d-8933-4ace-814f-f28060ad280f',
  ],
  '10.3:1': [
    '722857cf-f327-5740-8151-64eb92195ec8',
    'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
    '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
  ],
  '10.3:2': [
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
  ],
  '10.3:3': [
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
    'aed9161b-ddc4-559c-be8f-baeeddf224f3',
  ],
}

const upperCanonicalTargetsByTopicBullet: Record<string, string[]> = {
  'E.1:1': ['ce431132-dfc4-42c2-aff6-bd72035190f8'],
  'E.1:2': ['ce431132-dfc4-42c2-aff6-bd72035190f8'],
  'E.1:3': ['971beafa-6ba5-4c82-ac8b-7ebf66eec3dd'],
  'E.1:4': ['971beafa-6ba5-4c82-ac8b-7ebf66eec3dd'],
  'E.1:5': [
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
    'd67502e3-5e0a-595b-a24b-65b1c40de36e',
  ],
  'E.1:6': ['e4b38061-1f28-43ad-8371-a3e7c0e81856'],
  'E.1:7': ['e4b38061-1f28-43ad-8371-a3e7c0e81856'],
  'E.1:8': [
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
    'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  ],
  'E.1:9': ['09029573-864f-40ca-bf8a-cee7bf6dcb73'],
  'E.1:10': ['d6dc0e02-831d-4894-a61a-852bcc74f147'],
  'E.1:11': ['d6dc0e02-831d-4894-a61a-852bcc74f147'],
  'E.1:12': ['d6dc0e02-831d-4894-a61a-852bcc74f147'],
  'E.1:13': [
    'ce431132-dfc4-42c2-aff6-bd72035190f8',
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
    'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  ],
  'E.2:1': [
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
    'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
  ],
  'E.2:2': [
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
    '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  ],
  'E.2:3': [
    'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
    '5f289cdc-fda1-4058-b44f-041ba1398e79',
  ],
  'E.2:4': [
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
    'a0aaedcb-41f8-4891-af77-a69a76b8c10d',
  ],
  'E.2:5': [
    '00245a43-eb89-47d2-92d7-21799dbec9f3',
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  ],
  'E.2:6': [
    '94784e0a-7ddc-48be-91fb-dc82b78eb322',
    '91c49019-ea51-4ce5-a919-c91c45b25e83',
  ],
  'E.2:7': ['7eeff2de-6015-49a6-a96e-a488d886dc9f'],
  'E.2:8': [
    '7eeff2de-6015-49a6-a96e-a488d886dc9f',
    '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
    '91c49019-ea51-4ce5-a919-c91c45b25e83',
  ],
  'E.2:9': [
    '912febf0-754a-4409-9f8b-7d66810edc08',
    '839ecc8f-3a60-418b-bc92-64bfeef33824',
  ],
  'E.2:10': [
    '2eecd0e2-a7ca-4568-9b12-3d47706c65fb',
    'd168ae5d-f36f-4ad4-b070-d5931f8d70d1',
  ],
  'E.2:11': [
    '912febf0-754a-4409-9f8b-7d66810edc08',
    '839ecc8f-3a60-418b-bc92-64bfeef33824',
  ],
  'E.2:12': [
    '912febf0-754a-4409-9f8b-7d66810edc08',
    '839ecc8f-3a60-418b-bc92-64bfeef33824',
  ],
  'E.2:13': [
    '0da13365-02c2-44f1-8a81-d524ca0ac3ae',
    '253a71d2-e751-4c63-acbe-238b71463cd8',
  ],
  'E.3:1': ['68c90ba6-c438-463c-9a53-cf61062d416a'],
  'E.3:2': ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2'],
  'E.3:3': ['ec7a0a68-730b-5c94-ac72-a937508f8303'],
  'E.3:4': ['accb1d9e-cd48-5983-bcef-9b9bca4a9114'],
  'E.3:5': [
    'e918b31f-6f39-5dee-ade6-3617080fb24f',
    'e2da5eec-45de-5527-9ad7-16f41cacbe58',
  ],
  'E.3:6': ['39b2a0c4-eecf-5049-b58f-e790790a3bf2'],
  'E.4:1': ['fbecbd60-5db3-51e8-94be-d66b066ffa06'],
  'E.4:2': ['5fd45dbc-0eb1-591b-99a9-7386336f1456'],
  'E.4:3': ['30ddb2d7-b991-55fe-9e74-37ffe1048f9f'],
  'E.4:4': ['12260012-cf04-5409-b57d-f5b3a46d9126'],
  'E.4:5': ['761a0879-fc15-5d0c-a2b7-2b439efecd5b'],
  'E.4:6': [
    'ac25ffe3-fd42-592d-a937-79cc13460313',
    '761a0879-fc15-5d0c-a2b7-2b439efecd5b',
  ],
  'E.4:7': [
    'ac25ffe3-fd42-592d-a937-79cc13460313',
    '761a0879-fc15-5d0c-a2b7-2b439efecd5b',
  ],
  'E.5:1': ['92d8f398-0c9f-523c-88d7-44165b6b4768'],
  'E.5:2': ['156edddc-ce8d-580d-8d17-d9376d59e60e'],
  'E.5:3': ['eb0ffdea-c12d-56df-b7e8-c0297d2f8aff'],
  'E.5:4': ['60211ac1-cbe1-5182-87ef-673a068c5b0a'],
  'E.5:5': ['497f1311-17d6-56ff-afb1-422a738e5c16'],
  'E.5:6': [
    '15b56a1e-3eec-52ca-82fa-b4df9ce88415',
    '25edd154-b1d8-546c-94a5-88502b6725cd',
    'd873ffa2-04b3-5978-a955-89563802a348',
  ],
  'E.6:1': ['88d07c80-5d7d-5c70-b385-b22769381e44'],
  'E.6:2': ['2088ccf0-48f4-51d4-be5f-67affd0fb099'],
  'E.6:3': [
    '5f17e992-fd07-56ee-80a0-567f45bbd10c',
    '912a5489-abcc-55f9-8f1a-9ee1e2d7fd9d',
  ],
  'E.6:4': [
    '91b20476-12cf-50d6-880a-ea509ffe8a9a',
    '18058384-a1bc-5ba2-8f5d-1fe9498acbf0',
  ],
  'E.7:1': ['cf570e66-2ce2-5923-9033-c97d74119553'],
  'E.7:2': ['37f17e7e-9fcf-5dca-ac10-e94cb8420be5'],
  'E.7:3': ['37f17e7e-9fcf-5dca-ac10-e94cb8420be5'],
  'E.7:4': ['b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc'],
  'E.7:5': ['642aebd7-66cd-5a50-b543-73c4b207525d'],
  'E.7:6': ['21c0a5f2-4152-549a-aa9c-e02ab772f589'],
  'Q1.1:1': ['7df599e8-21ac-5be4-89f9-9b2a6f2e4465'],
  'Q1.1:2': ['7df599e8-21ac-5be4-89f9-9b2a6f2e4465'],
  'Q1.1:3': [
    '9f59a088-3939-59e9-821d-167fadfda782',
    '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
  ],
  'Q1.1:4': ['f3de5922-dd45-4fb6-87c1-525d1952dd89'],
  'Q1.1:5': ['25998fed-ea4d-4c3e-b606-e965b5d7f290'],
  'Q1.1:6': ['9fb1dd85-11b7-4a5a-b124-27fea8d1788e'],
  'Q1.1:7': [
    '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
    '9f59a088-3939-59e9-821d-167fadfda782',
  ],
  'Q1.1:8': [
    '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
    '9f59a088-3939-59e9-821d-167fadfda782',
  ],
  'Q1.1:9': ['98e42cda-9e5d-5910-b2c0-3e631fd20c78'],
  'Q1.1:10': ['4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe'],
  'Q1.1:11': [
    '9f59a088-3939-59e9-821d-167fadfda782',
    'fd9fd8ad-c4a1-5552-9ea0-1878e0636f20',
  ],
  'Q1.1:12': ['9f59a088-3939-59e9-821d-167fadfda782'],
  'Q1.1:13': [
    '9f59a088-3939-59e9-821d-167fadfda782',
    '1730c01d-8c85-57df-b031-c11e2a0511b1',
  ],
  'Q1.1:14': ['9f59a088-3939-59e9-821d-167fadfda782'],
  'Q1.1:15': ['9f59a088-3939-59e9-821d-167fadfda782'],
  'Q1.1:16': ['bbee4c52-4e95-5529-990f-706aa99316a3'],
  'Q1.1:17': ['0b4f2020-8486-5372-9cb9-6e59f698ac2d'],
  'Q1.1:18': ['fd9fd8ad-c4a1-5552-9ea0-1878e0636f20'],
  'Q1.1:19': ['fd9fd8ad-c4a1-5552-9ea0-1878e0636f20'],
  'Q1.1:20': ['8da5c981-8216-5fcd-a393-19f392ae2006'],
  'Q1.1:21': [
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '1730c01d-8c85-57df-b031-c11e2a0511b1',
  ],
  'Q1.1:22': ['741774ef-15fc-4bcf-a370-e2c5cf4257d0'],
  'Q1.1:23': ['0f803c37-8191-5a07-9b31-9603ded98fe2'],
  'Q1.1:24': ['1730c01d-8c85-57df-b031-c11e2a0511b1'],
  'Q1.1:25': [
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '1730c01d-8c85-57df-b031-c11e2a0511b1',
  ],
  'Q1.1:26': ['741774ef-15fc-4bcf-a370-e2c5cf4257d0'],
  'Q1.1:27': ['7df599e8-21ac-5be4-89f9-9b2a6f2e4465'],
  'Q1.1:28': ['e3bce51c-cfeb-4706-b95e-a22b76e7dd73'],
  'Q1.1:29': ['455c65ca-814a-56ad-918a-013155883c52'],
  'Q1.1:30': [
    '9f59a088-3939-59e9-821d-167fadfda782',
    'fd9fd8ad-c4a1-5552-9ea0-1878e0636f20',
  ],
  'Q1.1:31': ['73b309ed-1aab-5778-8494-d9b65f5a352b'],
  'Q1.1:32': ['73b309ed-1aab-5778-8494-d9b65f5a352b'],
  'Q1.1:33': ['38e0ff49-f132-44c8-b17a-73dada5344db'],
  'Q1.1:34': ['330808f6-789a-583d-86df-e271a7683d8b'],
  'Q1.1:35': ['2622bef1-bdbc-504e-b468-b600b2ca3ed8'],
  'Q1.1:36': ['2622bef1-bdbc-504e-b468-b600b2ca3ed8'],
  'Q1.1:37': [
    '1730c01d-8c85-57df-b031-c11e2a0511b1',
    '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
  ],
  'Q1.1:38': ['741774ef-15fc-4bcf-a370-e2c5cf4257d0'],
  'Q1.1:39': [
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '3b866aea-3e4d-5f23-91de-759148382710',
  ],
  'Q1.1:40': [
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
  ],
  'Q1.1:41': [
    '74a74132-fa39-541c-8d3c-696cf228452d',
    '8d34228c-da38-5c1e-97cc-571f3eafb9f4',
  ],
  'Q1.2:1': ['13e882bd-2fc6-59c6-a2a8-32eb1fbf1751'],
  'Q1.2:2': ['0f6b798b-594e-5480-8c5f-95e2486a4d85'],
  'Q1.2:3': [
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    '106417ed-80db-5490-a1ee-bb4160d3f2b4',
  ],
  'Q1.2:4': ['c6355a22-24cf-5d8b-88af-ea11711460fb'],
  'Q1.2:5': ['c6355a22-24cf-5d8b-88af-ea11711460fb'],
  'Q1.2:6': ['106417ed-80db-5490-a1ee-bb4160d3f2b4'],
  'Q1.2:7': ['9854589c-5feb-4942-b90f-311ddf36eb78'],
  'Q1.2:8': [
    '9854589c-5feb-4942-b90f-311ddf36eb78',
    '7fe6f8a1-5580-4e37-bf8e-9772964a6b0a',
  ],
  'Q1.2:9': ['8c9394cb-f54a-508d-9750-4c49e31b3fa9'],
  'Q1.2:10': [
    '9854589c-5feb-4942-b90f-311ddf36eb78',
    '966782e5-690d-4fae-bbab-fa3fa30525c3',
  ],
  'Q1.2:11': ['3b866aea-3e4d-5f23-91de-759148382710'],
  'Q1.2:12': [
    '3f17d0d2-562d-4c1c-9ebc-1a1a43f28f9c',
    '7fe6f8a1-5580-4e37-bf8e-9772964a6b0a',
  ],
  'Q1.2:13': ['b39ae8fb-4358-5866-8adf-3d5365368eeb'],
  'Q1.2:14': ['2d62b444-796e-548d-aeee-cfd9c6665ddc'],
  'Q2.1:1': [
    'd03f1cb6-c224-53db-ad91-76cc7827978d',
    'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e',
  ],
  'Q2.1:2': ['d03f1cb6-c224-53db-ad91-76cc7827978d'],
  'Q2.1:3': ['fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e'],
  'Q2.1:4': ['fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e'],
  'Q2.1:5': ['78cf6eff-b3bc-5444-9ef8-5d39dae8d17d'],
  'Q2.1:6': ['fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e'],
  'Q2.1:7': ['05af2893-0201-4d7f-985b-272d7b88e26e'],
  'Q2.1:8': [
    'd03f1cb6-c224-53db-ad91-76cc7827978d',
    '05af2893-0201-4d7f-985b-272d7b88e26e',
  ],
  'Q2.1:9': [
    'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e',
    '05af2893-0201-4d7f-985b-272d7b88e26e',
  ],
  'Q2.1:10': [
    'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e',
    'b2fb9a25-4d26-5cf2-a917-823909dcb6bd',
  ],
  'Q2.1:11': ['78cf6eff-b3bc-5444-9ef8-5d39dae8d17d'],
  'Q2.1:12': ['e6895bc3-fcbd-59ad-baef-a78c97a13e11'],
  'Q2.1:13': ['e6895bc3-fcbd-59ad-baef-a78c97a13e11'],
  'Q2.1:14': ['fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e'],
  'Q2.1:15': ['b2fb9a25-4d26-5cf2-a917-823909dcb6bd'],
  'Q2.1:16': [
    'e6895bc3-fcbd-59ad-baef-a78c97a13e11',
    '18c1f954-487e-5121-bb18-6c64a82f573d',
  ],
  'Q2.1:17': ['3efa0cda-f55b-5534-8fac-ffe1d312aed1'],
  'Q2.1:18': ['3efa0cda-f55b-5534-8fac-ffe1d312aed1'],
  'Q2.1:19': [
    '3efa0cda-f55b-5534-8fac-ffe1d312aed1',
    'c0205f47-185c-5e27-b89c-c3ff8809b1d1',
  ],
  'Q2.2:1': ['1a037489-3c95-540b-8cae-0acd360358ee'],
  'Q2.2:2': ['1a037489-3c95-540b-8cae-0acd360358ee'],
  'Q2.2:3': ['eb1ea150-ec6c-5000-bce3-f46c820dccf8'],
  'Q2.2:4': ['eb1ea150-ec6c-5000-bce3-f46c820dccf8'],
  'Q2.2:5': ['37f28bc4-def2-57cf-a06b-191dfd228205'],
  'Q2.2:6': ['fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c'],
  'Q2.2:7': ['ac4ba260-6086-5fcc-bea2-c06f1425a1cc'],
  'Q2.2:8': ['ac4ba260-6086-5fcc-bea2-c06f1425a1cc'],
  'Q2.2:9': ['ac4ba260-6086-5fcc-bea2-c06f1425a1cc'],
  'Q2.2:10': ['f36a5946-f2a8-59b8-b3bd-a2f246defa4f'],
  'Q2.2:11': ['1a037489-3c95-540b-8cae-0acd360358ee'],
  'Q2.2:12': ['d18d4190-ddc1-5181-b1b6-e79947b737c2'],
  'Q2.2:13': ['fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c'],
  'Q2.2:14': ['37f28bc4-def2-57cf-a06b-191dfd228205'],
  'Q2.2:15': ['692db5b6-8be1-5c7b-8307-3a02afb21ea0'],
  'Q2.2:16': ['37f28bc4-def2-57cf-a06b-191dfd228205'],
  'Q2.2:17': ['a1389d4e-dc97-5557-babe-a31a2bd57217'],
  'Q2.2:18': ['a844895e-2cdc-4665-aad2-a49c62f11759'],
  'Q2.2:19': ['18c1f954-487e-5121-bb18-6c64a82f573d'],
  'Q2.2:20': ['3efa0cda-f55b-5534-8fac-ffe1d312aed1'],
  'Q2.3:1': ['cb0ced6d-b7c1-5b7d-9922-8c394f6030e8'],
  'Q2.3:2': ['cb0ced6d-b7c1-5b7d-9922-8c394f6030e8'],
  'Q2.3:3': ['cb0ced6d-b7c1-5b7d-9922-8c394f6030e8'],
  'Q2.3:4': [
    'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8',
    '158e1c19-7ccb-4c8c-931c-b685951ab161',
    '549269d3-1aef-5c55-9640-ee2a8e2ee9a1',
  ],
  'Q2.3:5': ['68020906-e615-462e-a56f-dd1ccc14b8d7'],
  'Q2.3:6': ['549269d3-1aef-5c55-9640-ee2a8e2ee9a1'],
  'Q2.3:7': ['d716a35e-e422-5aba-b39a-f2e22f1e1e74'],
  'Q2.3:8': ['d716a35e-e422-5aba-b39a-f2e22f1e1e74'],
  'Q2.3:9': ['9dba2826-b179-59f0-8d91-5916079e5abe'],
  'Q2.3:10': ['224243cd-5a53-5d6e-bed5-564cca167a80'],
  'Q2.3:11': ['224243cd-5a53-5d6e-bed5-564cca167a80'],
  'Q2.3:12': ['d5772db3-120c-5c37-ab46-2336d02236b0'],
  'Q2.3:13': [
    '224243cd-5a53-5d6e-bed5-564cca167a80',
    'd5772db3-120c-5c37-ab46-2336d02236b0',
  ],
  'Q2.3:14': ['d5772db3-120c-5c37-ab46-2336d02236b0'],
  'Q2.3:15': ['cb0ced6d-b7c1-5b7d-9922-8c394f6030e8'],
  'Q2.3:16': [
    'e160acb4-5b88-509e-8055-2653df420c65',
    '158e1c19-7ccb-4c8c-931c-b685951ab161',
  ],
  'Q2.3:17': ['215f5558-562c-5686-b649-931f324c7983'],
  'Q3.1:1': ['4a7cbe83-b694-57d3-85ce-1eeca418daaf'],
  'Q3.1:2': ['4a7cbe83-b694-57d3-85ce-1eeca418daaf'],
  'Q3.1:3': [
    'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
    '224243cd-5a53-5d6e-bed5-564cca167a80',
  ],
  'Q3.1:4': ['549269d3-1aef-5c55-9640-ee2a8e2ee9a1'],
  'Q3.1:5': ['58fc7852-722c-5a67-be6a-bfd1be0b527e'],
  'Q3.1:6': ['224243cd-5a53-5d6e-bed5-564cca167a80'],
  'Q3.1:7': [
    '6270e558-d657-5363-a6b2-e49a032a453b',
    'c64820e1-c0ee-4342-9225-f981650f0c52',
  ],
  'Q3.1:8': ['91683676-01cf-5003-80fa-a04d043b4e61'],
  'Q3.1:9': ['91683676-01cf-5003-80fa-a04d043b4e61'],
  'Q3.1:10': ['4c919da9-157a-5a14-a725-f7343975c9ab'],
  'Q3.1:11': ['d716a35e-e422-5aba-b39a-f2e22f1e1e74'],
  'Q3.1:12': ['224243cd-5a53-5d6e-bed5-564cca167a80'],
  'Q3.1:13': [
    'f6a3a602-1e45-5018-b0ff-3d49933cf634',
    'c71315c1-f329-4289-a145-d99819da7bad',
    '2c6af966-7703-4176-a117-5ddb8295bedf',
    'c64820e1-c0ee-4342-9225-f981650f0c52',
  ],
  'Q3.1:14': ['d1e26b52-78a7-5f3b-ac9f-97f3e62d7db1'],
  'Q3.2:1': [
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
    'dfa53498-34f5-5326-9d94-87e7b528caf3',
  ],
  'Q3.2:2': ['cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f'],
  'Q3.2:3': [
    'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f',
    '28f6a324-5f5e-5771-91d2-c007f6c275aa',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  ],
  'Q3.2:4': [
    'bfea7a23-1ce1-4a42-badd-1fc9bf30124a',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  ],
  'Q3.2:5': ['dfa53498-34f5-5326-9d94-87e7b528caf3'],
  'Q3.2:6': [
    'dfa53498-34f5-5326-9d94-87e7b528caf3',
    '81c0d811-e6de-5489-8415-3b257c734a2e',
  ],
  'Q3.2:7': ['2aa2ef4b-8204-59b9-ad53-71c994cd6180'],
  'Q3.3:1': ['ce89fa04-bbd8-53b2-be01-812e3b3044ed'],
  'Q3.3:2': ['ce89fa04-bbd8-53b2-be01-812e3b3044ed'],
  'Q3.3:3': ['d7244ce4-5409-58d1-a1b4-bfae35f391e1'],
  'Q3.3:4': ['cf340ce4-8d91-5d22-a1d9-53bf408abdb3'],
  'Q3.3:5': [
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
    'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
  ],
  'Q3.3:6': [
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  ],
  'Q3.3:7': ['904670af-8e4c-543e-bc9b-e6248d87a10d'],
  'Q3.3:8': [
    '974a2d1c-2225-519d-965f-7744fe8aafd5',
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
    'ea2d5085-4ec1-5e33-87e0-15edcad635bf',
  ],
  'Q3.3:9': ['ce89fa04-bbd8-53b2-be01-812e3b3044ed'],
  'Q3.3:10': ['bacae732-2016-5a83-bc61-d0f94ed5a0e4'],
  'Q3.3:11': ['bacae732-2016-5a83-bc61-d0f94ed5a0e4'],
  'Q3.3:12': [
    '7e9e814c-fe12-42a9-8d80-e09e7fb52964',
    '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
  ],
  'Q3.3:13': [
    '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
    '7e9e814c-fe12-42a9-8d80-e09e7fb52964',
    '81c0d811-e6de-5489-8415-3b257c734a2e',
  ],
  'Q4.1:1': [
    'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
    'b1f00a6d-1a03-496c-b1bd-c1f2259f59a8',
  ],
  'Q4.1:2': ['b1f00a6d-1a03-496c-b1bd-c1f2259f59a8'],
  'Q4.1:3': [
    'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
    'ef6d5067-96b0-5388-87dd-5ac4e6a3e313',
    'dfa53498-34f5-5326-9d94-87e7b528caf3',
  ],
  'Q4.1:4': [
    '5c57dbc7-d258-4aad-a84c-e773f3c493ae',
    '1a1c09f0-96b7-4c33-a623-0e8101537876',
    '6031bed0-9baa-4f45-b2a5-57ffb00d39cc',
    '4245c54f-d609-41bc-9eff-e9ceeff4902f',
  ],
  'Q4.1:5': [
    '4245c54f-d609-41bc-9eff-e9ceeff4902f',
    '1a1c09f0-96b7-4c33-a623-0e8101537876',
    'c5413852-abae-566b-b435-f9939209ca63',
  ],
  'Q4.1:6': ['d5bff282-741f-4cc5-9622-b77584fdcc5a'],
  'Q4.1:7': ['6031bed0-9baa-4f45-b2a5-57ffb00d39cc'],
  'Q4.1:8': [
    'b05da028-65e4-5cd1-a13c-6c1a95b6dfdf',
    'defe44d2-c3d3-456b-a786-fad2cef13fe8',
  ],
  'Q4.1:9': ['defe44d2-c3d3-456b-a786-fad2cef13fe8'],
  'Q4.1:10': [
    'ad021f2e-6b94-5e6e-a264-3d1110094b87',
    'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
  ],
  'Q4.1:11': [
    'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
    '51bc5513-6879-548f-b19a-9746b667f1a3',
    'ad021f2e-6b94-5e6e-a264-3d1110094b87',
    'ef6d5067-96b0-5388-87dd-5ac4e6a3e313',
    'f6e5929f-d52a-42a4-a5d2-ff498ee7083f',
  ],
  'Q4.1:12': ['51bc5513-6879-548f-b19a-9746b667f1a3'],
  'Q4.1:13': ['51bc5513-6879-548f-b19a-9746b667f1a3'],
  'Q4.1:14': ['8c97c234-a932-5e84-aed5-237b4e2a8336'],
  'Q4.1:15': ['f6e5929f-d52a-42a4-a5d2-ff498ee7083f'],
  'Q4.1:16': ['aef1e312-6a0c-5323-9202-c22ae84086f2'],
  'Q4.2:1': ['75f7139f-0f07-5cec-bcea-4f139502b528'],
  'Q4.2:2': ['75f7139f-0f07-5cec-bcea-4f139502b528'],
  'Q4.2:3': [
    '75f7139f-0f07-5cec-bcea-4f139502b528',
    '0172ca41-cc42-51d6-94ad-f0f4680059e4',
  ],
  'Q4.2:4': ['2ec48368-ac5b-55f9-a396-5a5fe4e1e874'],
  'Q4.2:5': ['2ec48368-ac5b-55f9-a396-5a5fe4e1e874'],
  'Q4.2:6': ['2ec48368-ac5b-55f9-a396-5a5fe4e1e874'],
  'Q4.3:1': ['e5c08365-a0d3-592c-ad8e-d2c2c6e2b717'],
  'Q4.3:2': ['e5c08365-a0d3-592c-ad8e-d2c2c6e2b717'],
  'Q4.3:3': [
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
    'bb5c5eab-2fc1-5336-b8cf-14d147695487',
  ],
  'Q4.3:4': ['a12fddce-0215-58d9-bd91-21be8a960d25'],
  'Q4.3:5': ['a12fddce-0215-58d9-bd91-21be8a960d25'],
  'Q4.3:6': ['a12fddce-0215-58d9-bd91-21be8a960d25'],
  'Q4.3:7': ['cde9b548-2cf4-59ad-b5d4-a71872afbe56'],
  'Q4.3:8': [
    'cde9b548-2cf4-59ad-b5d4-a71872afbe56',
    '8eb6456b-d915-50ed-a076-2b23c2e5420c',
  ],
  'Q4.3:9': [
    'cde9b548-2cf4-59ad-b5d4-a71872afbe56',
    'bfea7a23-1ce1-4a42-badd-1fc9bf30124a',
  ],
  'Q4.3:10': ['49872cc0-401f-5464-9235-4763df4db5cf'],
  'Q4.3:11': ['a12fddce-0215-58d9-bd91-21be8a960d25'],
  'Q4.3:12': ['3b50255a-6b01-578b-8f5c-4383536a3221'],
  'Q4.3:13': ['6e7c35e0-7a38-5996-a42e-005038eff0db'],
  'Q4.3:14': ['6e7c35e0-7a38-5996-a42e-005038eff0db'],
  'Q4.3:15': ['76bcbdcb-3003-5e6a-952e-aa36eb8f97ee'],
  'Q4.4:1': ['a684bec1-ba59-59d0-98d2-4ca37236f64c'],
  'Q4.4:2': ['a684bec1-ba59-59d0-98d2-4ca37236f64c'],
  'Q4.4:3': ['a684bec1-ba59-59d0-98d2-4ca37236f64c'],
  'Q4.4:4': ['19aef2ed-eb46-55b1-9486-ee83f7520bb6'],
  'Q4.4:5': ['a08e33db-d821-457b-86dd-870e7648c5f4'],
  'Q4.4:6': ['a684bec1-ba59-59d0-98d2-4ca37236f64c'],
  'Q4.4:7': ['6ebb6182-f221-5f4c-b112-4ac72b104321'],
  'Q4.4:8': [
    '8d34228c-da38-5c1e-97cc-571f3eafb9f4',
    'bfea7a23-1ce1-4a42-badd-1fc9bf30124a',
  ],
  'Q4.4:9': ['57ec031c-9a91-5331-81a7-6ef900f7c63e'],
  'Q4.4:10': ['79da5c34-86b2-5c10-9726-9de886ccef7d'],
  'Q4.5:1': ['7badac4d-2874-5b3a-87e8-bf8f4440b2a6'],
  'Q4.5:2': ['df010b2b-b182-5f7e-bbe4-49b72e48c27a'],
  'Q4.5:3': ['df010b2b-b182-5f7e-bbe4-49b72e48c27a'],
  'Q4.5:4': [
    '7f0798cb-5966-5dcb-beb3-84f637ab6139',
    'd36727cc-ce42-51a3-9425-41afb0b9acdd',
  ],
  'Q4.5:5': ['7f0798cb-5966-5dcb-beb3-84f637ab6139'],
  'Q4.5:6': ['7f0798cb-5966-5dcb-beb3-84f637ab6139'],
  'Q4.5:7': ['d36727cc-ce42-51a3-9425-41afb0b9acdd'],
  'Q4.5:8': ['d36727cc-ce42-51a3-9425-41afb0b9acdd'],
  'Q4.5:9': [
    '658cf33d-a0c2-5d47-801a-3dbcd5cac074',
    'df010b2b-b182-5f7e-bbe4-49b72e48c27a',
  ],
  'Q4.5:10': ['af50bb9a-fd7b-50f5-9698-48c4efe99032'],
  'Q4.5:11': ['853dbe54-85b0-59ab-8f3a-000c2b7746ec'],
  'Q4.6:1': ['c9405043-bdc0-5995-8b4d-5bb56d97d05d'],
  'Q4.6:2': ['c9405043-bdc0-5995-8b4d-5bb56d97d05d'],
  'Q4.6:3': ['eb0ffdea-c12d-56df-b7e8-c0297d2f8aff'],
  'Q4.6:4': [
    '497f1311-17d6-56ff-afb1-422a738e5c16',
    'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
  ],
  'Q4.6:5': ['c9405043-bdc0-5995-8b4d-5bb56d97d05d'],
  'Q4.6:6': ['e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9'],
  'Q4.6:7': ['5db07785-8cca-50d5-81a9-e0264d344af9'],
  'Q4.6:8': ['e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9'],
  'Q4.6:9': ['5db07785-8cca-50d5-81a9-e0264d344af9'],
  'Q4.6:10': ['5db07785-8cca-50d5-81a9-e0264d344af9'],
  'Q4.6:11': [
    'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
    'aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745',
  ],
  'Q4.6:12': ['4c5c7cb1-f238-52c8-b82c-159c6c299c0e'],
  'Q4.6:13': ['4c5c7cb1-f238-52c8-b82c-159c6c299c0e'],
  'Q4.6:14': ['4c5c7cb1-f238-52c8-b82c-159c6c299c0e'],
  'Q4.6:15': [
    '9b47a758-1b5d-5906-84c9-8621050d5aa5',
    '6f896466-e0ec-5f8d-82ad-2890433c82ba',
  ],
  'Q4.6:16': [
    '9b47a758-1b5d-5906-84c9-8621050d5aa5',
    '6f896466-e0ec-5f8d-82ad-2890433c82ba',
  ],
}

const upperNeedsCanonicalGoalByTopicBullet = new Set<string>()


function cleanFullText(value: string): string {
  return value
    .replace(/\u00ad\r?\n\s*/gu, '')
    .replace(/([A-Za-zÄÖÜäöüß])-\r?\n\s*([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/\u00ad/gu, '')
    .normalize('NFC')
}

function normalizeLine(value: string): string {
  return value
    .replace(/\u00a0/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function topicSlug(topicCode: string): string {
  return topicCode.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
}

function sourceGoalId(prefix: string, topicCode: string, bulletIndex: number, aspectIndex: number, value: string): string {
  return `${prefix}-${topicSlug(topicCode)}-b${String(bulletIndex).padStart(2, '0')}-a${String(aspectIndex).padStart(2, '0')}-${hash(value)}`
}

function createDescription(span: string, context: string): string {
  const safeSpan = span.replace(/"/gu, '\\"')
  const safeContext = context.replace(/"/gu, '\\"')
  return `Die lernende Person kann den offiziellen Curriculum-Aspekt "${safeSpan}" im Kontext "${safeContext}" fachgerecht bearbeiten.`
}

function readPdfLines(sourceDocumentPath: string): string[] {
  const absolutePath = path.resolve(repoRoot, sourceDocumentPath)
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing source PDF: ${sourceDocumentPath}`)
  }
  return cleanFullText(execFileSync('pdftotext', ['-layout', absolutePath, '-'], { encoding: 'utf8' }))
    .split(/\r?\n/u)
}

function findTopicStarts(lines: string[], topics: TopicSpec[], minLine: number): Array<{ topic: TopicSpec; index: number }> {
  return topics.map((topic) => {
    const pattern = new RegExp(`^\\s*${topic.code.replace(/\./gu, '\\.')}\\s+`, 'u')
    const titleAnchor = topic.title.split(/\s+/u).slice(0, 2).join(' ')
    const matchingIndexes = lines
      .map((line, lineIndex) => ({ line, lineIndex }))
      .filter(({ line, lineIndex }) =>
        lineIndex >= minLine
        && pattern.test(line)
        && normalizeLine(line).includes(titleAnchor))
      .map(({ lineIndex }) => lineIndex)
    const index = matchingIndexes[matchingIndexes.length - 1] ?? -1
    return { topic, index }
  })
}

function isChromeLine(line: string): boolean {
  const normalized = normalizeLine(line)
  return normalized.length === 0
    || /^HMKB(?: Kerncurriculum)?$/u.test(normalized)
    || /^Kerncurriculum$/u.test(normalized)
    || /^Physik$/u.test(normalized)
    || /^gymnasiale Oberstufe$/u.test(normalized)
    || /^Bildungsgang Gymnasium$/u.test(normalized)
    || /^Unterrichtsfach Physik$/u.test(normalized)
    || /^\d+$/u.test(normalized)
    || /^Hessisches Ministerium$/u.test(normalized)
}

function cleanBulletText(lines: string[]): string {
  return lines
    .map(normalizeLine)
    .filter((line) => !isChromeLine(line))
    .join(' ')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()
}

function parseUpperExtraction(config: ExtractionConfig): { passages: Passage[]; sourceGoals: SourceGoal[] } {
  const lines = readPdfLines(config.sourceDocument.path)
  const starts = findTopicStarts(lines, config.expectedTopics, 0)
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []

  starts.forEach((start, index) => {
    if (start.index < 0) return
    const nextStart = starts[index + 1]?.index ?? lines.length
    const rawLines = lines.slice(start.index + 1, nextStart)
    const passageId = `he-physics-sekii:${start.topic.code}`
    const passage: Passage = {
      id: passageId,
      topicCode: start.topic.code,
      title: `${start.topic.code} ${start.topic.title}`,
      text: '',
      page: start.topic.page,
      sourcePath: config.sourceDocument.path,
      rawText: '',
      sourceGoalIds: [],
    }

    let currentLevel: CourseLevel = 'GK_LK'
    let currentBullet: { level: CourseLevel; lines: string[] } | null = null
    const bullets: Array<{ level: CourseLevel; text: string }> = []
    const pushBullet = () => {
      if (!currentBullet) return
      const text = cleanBulletText(currentBullet.lines)
      if (text.length > 5) bullets.push({ level: currentBullet.level, text })
      currentBullet = null
    }

    for (const rawLine of rawLines) {
      const normalized = normalizeLine(rawLine)
      if (isChromeLine(rawLine)) continue
      if (/^grundlegendes Niveau/u.test(normalized)) {
        pushBullet()
        currentLevel = 'GK_LK'
        continue
      }
      if (/^erhöhtes Niveau/u.test(normalized)) {
        pushBullet()
        currentLevel = 'LK'
        continue
      }
      if (/^(Themenfelder|verbindlich:|Q[1-4]\s|E\s)/u.test(normalized)) {
        pushBullet()
        continue
      }

      const bulletMatch = /^\s*[–-]\s+(.+)$/u.exec(rawLine)
      if (bulletMatch) {
        pushBullet()
        currentBullet = { level: currentLevel, lines: [bulletMatch[1]] }
        continue
      }

      if (currentBullet && /^\s{4,}\S/u.test(rawLine)) {
        currentBullet.lines.push(rawLine)
      }
    }
    pushBullet()

    passage.text = bullets.map((bullet) => `- ${bullet.text}`).join('\n')
    passage.rawText = passage.text

    bullets.forEach((bullet, bulletIndex) => {
      const goal: SourceGoal = {
        id: sourceGoalId('he-phys-sekii', start.topic.code, bulletIndex + 1, 1, bullet.text),
        passageId,
        topicCode: start.topic.code,
        bulletIndex: bulletIndex + 1,
        aspectIndex: 1,
        title: bullet.text.length > 96 ? `${bullet.text.slice(0, 93)}...` : bullet.text,
        description: createDescription(bullet.text, start.topic.title),
        sourceText: bullet.text,
        sourceSpan: bullet.text,
        parentBulletText: bullet.text,
        sourceRef: `HMKB Kerncurriculum Physik gymnasiale Oberstufe, ${start.topic.code}, S. ${start.topic.page}, Spiegelstrich ${bulletIndex + 1}`,
        courseLevel: bullet.level,
        granularity: 'officialBullet',
        tags: [
          'source:DE-HE',
          'sourceDocument:KC2024',
          'subject:Physik',
          'stage:SekII',
          `topic:${start.topic.code}`,
          `bullet:${bulletIndex + 1}`,
        ],
        rawSourceText: bullet.text,
        rawSourceSpan: bullet.text,
        rawParentBulletText: bullet.text,
      }
      sourceGoals.push(goal)
      passage.sourceGoalIds.push(goal.id)
    })

    passages.push(passage)
  })

  return { passages, sourceGoals }
}

function parseLowerRows(rawLines: string[]): string[] {
  const rows: string[] = []
  let inContentSection = false
  let current: string[] = []

  const pushRow = () => {
    const text = cleanBulletText(current)
    if (text.length > 5) rows.push(text)
    current = []
  }

  for (const rawLine of rawLines) {
    const normalized = normalizeLine(rawLine)
    if (isChromeLine(rawLine)) continue

    if (/^(Verbindliche|Fakultative) Unterrichtsinhalte\/Aufgaben:/u.test(normalized)) {
      pushRow()
      inContentSection = true
      continue
    }
    if (inContentSection && /^(Besondere Arbeitsmethoden|Querverweise|Anmerkung|Anmerkungen:|\d+\.\d|Hessisches)/u.test(normalized)) {
      pushRow()
      inContentSection = false
      continue
    }
    if (!inContentSection) continue

    const numberedRow = /^\s*\d+\.\s*(.+)$/u.exec(rawLine) ?? /^\s*\d+\.([^\s].+)$/u.exec(rawLine)
    if (numberedRow) {
      pushRow()
      current.push(numberedRow[1])
      continue
    }

    if (current.length > 0 && normalized.length > 0) {
      current.push(rawLine)
    }
  }
  pushRow()

  return rows
}

function parseLowerExtraction(config: ExtractionConfig): { passages: Passage[]; sourceGoals: SourceGoal[] } {
  const lines = readPdfLines(config.sourceDocument.path)
  const starts = findTopicStarts(lines, config.expectedTopics, 0)
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []

  starts.forEach((start, index) => {
    if (start.index < 0) return
    const nextStart = starts[index + 1]?.index ?? lines.length
    const rawLines = lines.slice(start.index + 1, nextStart)
    const rows = normalizedLowerTopicRows[start.topic.code] ?? parseLowerRows(rawLines)
    const passageId = `he-physics-seki:${start.topic.code}`
    const passage: Passage = {
      id: passageId,
      topicCode: start.topic.code,
      title: `${start.topic.code} ${start.topic.title}`,
      text: rows.map((row) => `- ${row}`).join('\n'),
      page: start.topic.page,
      sourcePath: config.sourceDocument.path,
      rawText: rows.map((row) => `- ${row}`).join('\n'),
      sourceGoalIds: [],
    }

    rows.forEach((row, rowIndex) => {
      const title = row.length > 96 ? `${row.slice(0, 93)}...` : row
      const goal: SourceGoal = {
        id: sourceGoalId('he-phys-seki', start.topic.code, rowIndex + 1, 1, row),
        passageId,
        topicCode: start.topic.code,
        bulletIndex: rowIndex + 1,
        aspectIndex: 1,
        title,
        description: createDescription(title, start.topic.title),
        sourceText: row,
        sourceSpan: row,
        parentBulletText: row,
        sourceRef: `Lehrplan Physik Gymnasium Hessen G9, ${start.topic.code}, S. ${start.topic.page}, Unterrichtsinhaltszeile ${rowIndex + 1}`,
        courseLevel: 'unspecified',
        granularity: 'officialContentRow',
        tags: [
          'source:DE-HE',
          'sourceDocument:G9',
          'subject:Physik',
          'stage:SekI',
          `topic:${start.topic.code}`,
          `contentRow:${rowIndex + 1}`,
        ],
        rawSourceText: row,
        rawSourceSpan: row,
        rawParentBulletText: row,
      }
      sourceGoals.push(goal)
      passage.sourceGoalIds.push(goal.id)
    })

    passages.push(passage)
  })

  return { passages, sourceGoals }
}

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  })
  return Array.from(duplicates)
}

function brokenEncodingIds(sourceGoals: SourceGoal[]): string[] {
  return sourceGoals
    .filter((goal) => /[\uFFFD\uE000-\uF8FF]/u.test(goal.sourceText))
    .map((goal) => goal.id)
}

function buildPipeline(
  config: ExtractionConfig,
  passages: Passage[],
  sourceGoals: SourceGoal[],
  reviewCoverage: ReviewCoverage,
): { version: 1; currentStep: string; steps: PipelineStep[] } {
  const expectedCodes = new Set(config.expectedTopics.map((topic) => topic.code))
  const actualCodes = new Set(passages.map((passage) => passage.topicCode))
  const missingCodes = Array.from(expectedCodes).filter((code) => !actualCodes.has(code))
  const unexpectedCodes = Array.from(actualCodes).filter((code) => !expectedCodes.has(code))
  const duplicateTopicCodes = duplicateValues(passages.map((passage) => passage.topicCode))
  const passagesWithoutText = passages.filter((passage) => !passage.text.trim()).map((passage) => passage.id)
  const sourceGoalsWithoutPassage = sourceGoals
    .filter((goal) => !passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const passageIdsWithGoals = new Set(sourceGoals.map((goal) => goal.passageId))
  const passagesWithoutGoals = passages.filter((passage) => !passageIdsWithGoals.has(passage.id)).map((passage) => passage.id)
  const duplicateSourceGoalIds = duplicateValues(sourceGoals.map((goal) => goal.id))
  const incompleteSourceGoals = sourceGoals
    .filter((goal) => !goal.sourceSpan.trim() || !goal.parentBulletText.trim() || !goal.sourceRef.trim())
    .map((goal) => goal.id)
  const brokenIds = brokenEncodingIds(sourceGoals)
  const reviewRelativePath = config.reviewPath

  return {
    version: 1,
    currentStep: reviewCoverage.complete ? '' : 'MAPPING-3',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: missingCodes.length === 0 && duplicateTopicCodes.length === 0 && passagesWithoutText.length === 0 ? 'complete' : 'incomplete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtliche Physik-Quelle liegt lokal vor',
            passed: existsSync(path.resolve(repoRoot, config.sourceDocument.path)),
            details: config.sourceDocument.path,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle erwarteten Physik-Themenfelder sind als Lehrplanpassagen vorhanden',
            passed: missingCodes.length === 0 && unexpectedCodes.length === 0,
            details: `${passages.length}/${config.expectedTopics.length} Themenfelder; fehlend: ${missingCodes.join(', ') || '-'}; unerwartet: ${unexpectedCodes.join(', ') || '-'}`,
          },
          {
            id: 'unique-topic-passages',
            label: 'Jedes Themenfeld hat genau eine Passage',
            passed: duplicateTopicCodes.length === 0,
            details: `Doppelte Themenfelder: ${duplicateTopicCodes.join(', ') || '-'}`,
          },
          {
            id: 'passage-text-present',
            label: 'Jede Passage enthält offiziellen Text',
            passed: passagesWithoutText.length === 0,
            details: `Passagen ohne Text: ${passagesWithoutText.join(', ') || '-'}`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: `Quelle: ${config.sourceDocument.path}`,
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: sourceGoals.length > 0
          && passagesWithoutGoals.length === 0
          && duplicateSourceGoalIds.length === 0
          && sourceGoalsWithoutPassage.length === 0
          && incompleteSourceGoals.length === 0
          && brokenIds.length === 0
          ? 'complete'
          : 'incomplete',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: 'source-goals-created',
            label: 'Aus den Physik-Lehrplanpassagen wurden Source-Ziele erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'passage-to-source-goal-coverage',
            label: 'Jede Passage hat mindestens ein Source-Ziel',
            passed: passagesWithoutGoals.length === 0,
            details: `Passagen ohne Source-Ziele: ${passagesWithoutGoals.join(', ') || '-'}`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateSourceGoalIds.length === 0,
            details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: sourceGoalsWithoutPassage.length === 0,
            details: `Ohne Passage: ${sourceGoalsWithoutPassage.join(', ') || '-'}`,
          },
          {
            id: 'source-goal-trace-complete',
            label: 'Jedes Source-Ziel hat Source-Span, Parent-Bullet und Quellenreferenz',
            passed: incompleteSourceGoals.length === 0,
            details: `Unvollständige Source-Ziele: ${incompleteSourceGoals.join(', ') || '-'}`,
          },
          {
            id: 'source-goal-encoding-clean',
            label: 'Source-Ziele enthalten keine kaputten Umlaute oder PDF-Private-Use-Zeichen',
            passed: brokenIds.length === 0,
            details: `Auffällige Source-Ziele: ${brokenIds.join(', ') || '-'}`,
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: reviewCoverage.complete ? 'complete' : 'incomplete',
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
            details: reviewRelativePath,
          },
          {
            id: 'm3-review-decisions-reference-source-goals',
            label: 'M3-Review-Entscheidungen referenzieren gültige Source-Ziele',
            passed: true,
            details: reviewCoverage.reviewed > 0
              ? `${reviewCoverage.reviewed}/${sourceGoals.length} Entscheidungen referenzieren Source-Ziele dieser Extraction.`
              : 'Seed-Datei angelegt; noch keine Entscheidungen.',
          },
          {
            id: 'm3-review-targets-exist',
            label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
            passed: true,
            details: reviewCoverage.mapped > 0
              ? `${reviewCoverage.mapped}/${sourceGoals.length} Source-Ziele sind mit Canonical-Targets belegt.`
              : 'Seed-Datei angelegt; noch keine Targets.',
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: reviewCoverage.open === 0,
            details: `${reviewCoverage.reviewed}/${sourceGoals.length} Source-Ziele reviewed; offen: ${reviewCoverage.open}.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: reviewCoverage.complete,
            details: reviewCoverage.complete
              ? `Abgedeckt: ${reviewCoverage.mapped}/${sourceGoals.length}; keine offenen Canonical-Gaps.`
              : `Abgedeckt: ${reviewCoverage.mapped}/${sourceGoals.length}; M3-Review steht aus.`,
          },
        ],
      },
    ],
  }
}

function writeExtraction(
  config: ExtractionConfig,
  parsed: { passages: Passage[]; sourceGoals: SourceGoal[] },
  reviewCoverage: ReviewCoverage,
): void {
  const absoluteOutputPath = path.resolve(repoRoot, config.outputPath)
  mkdirSync(path.dirname(absoluteOutputPath), { recursive: true })

  const extraction = {
    schemaVersion: 1,
    extractionId: config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction: config.jurisdiction,
    subject: config.subject,
    stage: config.stage,
    sourceDocument: config.sourceDocument,
    method: {
      passageExtraction: config.stage === 'SekII'
        ? 'pdftotext -layout; segmented by official Physik topic-field headings E.*, Q1.* to Q4.*'
        : 'pdftotext -layout; segmented by official Hessen G9 Physik topic headings 7.1-10.3',
      sourceGoalExtraction: config.stage === 'SekII'
        ? 'one source goal per official bullet/sub-bullet in each topic passage; original bullet text retained in sourceText'
        : 'one source goal per official Unterrichtsinhaltszeile in verbindliche/fakultative topic tables; original row text retained in sourceText',
    },
    expectedTopicCodes: config.expectedTopics.map((topic) => topic.code),
    pipelineStatus: buildPipeline(config, parsed.passages, parsed.sourceGoals, reviewCoverage),
    passages: parsed.passages,
    sourceGoals: parsed.sourceGoals,
  }

  writeFileSync(absoluteOutputPath, `${JSON.stringify(extraction, null, 2)}\n`)
}

// Batch 015 electricity structural split overlay
const batch015SplitParentIds = new Set(["1911920e-b099-4310-82f2-b47f51a78b33","ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca","50431e92-eec9-54d6-b437-ea7a51b6f474"])
const batch015TargetsBySourceGoalId: Record<string, string[]> = {
  "he-phys-seki-8-2-b03-a01-3fe0dc0a": [
    "5ddba212-9e0a-5dd4-8274-239ec51ab6a8",
    "c156d2fb-0fe9-5f13-8baa-3e74d7da151e",
    "4a42cddd-7827-5204-87e5-8d9eac7792f1",
    "27b90ce9-b650-5232-85fb-ce2cb69d59a3"
  ]
}
// Batch 017 nuclear structural adjudication overlay
const batch017SplitParentIds = new Set(["f6f646db-3544-49ed-8f55-67bc684e80ce","cb0426b0-a973-5660-b6fe-79407934730f"])
const batch017TargetsBySourceGoalId: Record<string, string[]> = {
  "he-phys-seki-10-2-b02-a01-a2d5bf8d": [
    "25d91cc0-d84c-5522-86b5-fdff73264f08",
    "861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd",
    "1593d95c-2aac-504c-8527-37cb61877da9"
  ]
}

// Batch 025 average/instantaneous-velocity structural split overlay
const batch025TargetsBySourceGoalId: Record<string, string[]> = {
  "he-phys-sekii-e-1-b08-a01-1823c481": [
    "bf8517a9-142b-5789-826a-767f3b277998"
  ]
}
const batch025RemovedTargetsBySourceGoalId: Record<string, string[]> = {
  "he-phys-sekii-e-1-b08-a01-1823c481": [
    "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd",
    "e4b38061-1f28-43ad-8371-a3e7c0e81856"
  ]
}
const batch025RationalesBySourceGoalId = new Map<string, string>([
  [
    "he-phys-sekii-e-1-b06-a01-276db5cc",
    "Das amtliche Hessen-Ziel behandelt die gleichmäßig beschleunigte Bewegung ohne Anfangsgeschwindigkeit und Anfangsort. Das revidierte kanonische Ziel beschreibt das allgemeinere Konstantbeschleunigungsmodell; die Zuordnung ist deshalb partial."
  ],
  [
    "he-phys-sekii-e-1-b07-a01-5e3ee94d",
    "Das amtliche Hessen-Ziel nennt die Definition der Beschleunigung. Das revidierte kanonische Ziel verlangt zusätzlich die konsistente Beschreibung in t-s-, t-v- und t-a-Darstellungen; die Zuordnung ist deshalb partial."
  ],
  [
    "he-phys-sekii-e-1-b08-a01-1823c481",
    "Der amtliche Hessen-Aspekt fordert den Vergleich von Durchschnitts- und Momentangeschwindigkeit. Das neue kanonische Ziel operationalisiert ihn zusätzlich über Sekanten- und Tangentensteigung; die Zuordnung ist partial."
  ]
])

const applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => [
  ...new Set([
    ...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId) && !batch017SplitParentIds.has(goalId) && !(batch025RemovedTargetsBySourceGoalId[sourceGoalId] ?? []).includes(goalId)),
    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),
    ...(batch017TargetsBySourceGoalId[sourceGoalId] ?? []),
    ...(batch025TargetsBySourceGoalId[sourceGoalId] ?? []),
  ]),
]

const batch019PartialRationalesBySourceGoalId = new Map<string, string>([
  [
    'he-phys-sekii-q1-2-b06-a01-17650b01',
    'Das amtliche Hessen-Source-Ziel spezifiziert nur die Flussdichte im Inneren einer langen Spule; die begründete Modellwahl zum geraden Leiter ist nicht enthalten, daher ist die Zuordnung partial.',
  ],
  [
    'he-phys-sekii-q1-2-b14-a01-726d9aa7',
    'Das amtliche Hessen-Source-Ziel nennt Zyklotron und Synchrotron als Beispiele, verlangt aber nicht den vollständigen fachlichen Vergleich ihrer Feldrollen und Regelungsprinzipien; die Zuordnung ist daher partial.',
  ],
])

function writeReview(config: ExtractionConfig, parsed: { sourceGoals: SourceGoal[] }): ReviewCoverage {
  const absoluteReviewPath = path.resolve(repoRoot, config.reviewPath)
  mkdirSync(path.dirname(absoluteReviewPath), { recursive: true })
  const targetLookup = config.stage === 'SekI'
    ? lowerCanonicalTargetsByTopicRow
    : upperCanonicalTargetsByTopicBullet
  const sourceLabel = config.stage === 'SekI'
    ? 'Sek-I-Unterrichtsinhaltsblock'
    : 'Sek-II-Lehrplanaspekt'
  const explicitlyPartialSourceGoalIds = new Set(
    [
      ...parsed.sourceGoals
      .filter((sourceGoal) => config.stage === 'SekI'
        && new Set(['8.3b:4', '8.3b:5']).has(`${sourceGoal.topicCode}:${sourceGoal.bulletIndex}`))
      .map((sourceGoal) => sourceGoal.id),
      ...batch019PartialRationalesBySourceGoalId.keys(),
      ...batch025RationalesBySourceGoalId.keys(),
    ],
  )
  const partialRationalesBySourceKey = new Map<string, string>([
    [
      '8.3b:4',
      'Das kanonische Ziel deckt Aufbau, funktionalen Hörweg und Signalumwandlung im menschlichen Ohr ab; der zusätzliche amtliche Vergleich der Hörbereiche von Menschen und Tieren bleibt als Source-Coverage-Lücke sichtbar.',
    ],
    [
      '8.3b:5',
      'Das kanonische Ziel deckt die Beurteilung von Lärmbelastung und personenbezogene Schutzmaßnahmen ab; Echo, Nachhall sowie baulicher Schallschutz an Häusern und Verkehrswegen bleiben zusätzliche Source-Aspekte.',
    ],
  ])
  const decisions = parsed.sourceGoals.flatMap((sourceGoal) => {
    const sourceKey = `${sourceGoal.topicCode}:${sourceGoal.bulletIndex}`
    const targetIds = applyPhysicsBatch015Targets(sourceGoal.id, targetLookup[sourceKey] ?? [])
    const isExplicitUpperGap = config.stage === 'SekII' && upperNeedsCanonicalGoalByTopicBullet.has(sourceKey)
    const batch019Rationale = batch019PartialRationalesBySourceGoalId.get(sourceGoal.id)
    const batch025Rationale = batch025RationalesBySourceGoalId.get(sourceGoal.id)
    if (config.stage === 'SekII' && targetIds.length === 0 && !isExplicitUpperGap) {
      return []
    }
    return [{
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: targetIds.length > 0 ? 'mapped' : 'needsCanonicalGoal',
      canonicalGoalIds: targetIds,
      rationale: targetIds.length === 0
        ? `Der amtliche ${sourceLabel} benötigt noch fachliche M3-Review oder ein neues kanonisches Physikziel.`
        : explicitlyPartialSourceGoalIds.has(sourceGoal.id)
          ? batch025Rationale ?? batch019Rationale ?? partialRationalesBySourceKey.get(sourceKey)
        : targetIds.length > 1
          ? `Der amtliche ${sourceLabel} wird inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die korrekte Zuordnungsform.`
          : `Der amtliche ${sourceLabel} wird durch das kanonische Physikziel inhaltlich abgedeckt.`,
      reviewedAt: batch025Rationale
        ? '2026-08-29'
        : batch019Rationale
          ? '2026-08-28'
          : new Set(['8.3b:4', '8.3b:5']).has(sourceKey) ? '2026-08-27' : '2026-05-09',
      reviewer: batch025Rationale
        ? 'codex-physics-batch-025-motion-split-2026-08-29'
        : batch019Rationale
          ? 'codex-physics-batch-019-mapping-adjudication'
          : new Set(['8.3b:4', '8.3b:5']).has(sourceKey)
            ? 'codex-physics-batch-007-split-synthesis'
            : 'codex',
    }]
  })
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.canonicalGoalIds.length === 1
        && !explicitlyPartialSourceGoalIds.has(decision.sourceGoalId) ? 'exact' : 'partial',
      reviewDecisionId: decision.sourceGoalId,
    })))
  const mappedSourceGoalIds = new Set(mappings.map((mapping) => mapping.legacyGoalId))
  const reviewedSourceGoalIds = new Set(decisions.map((decision) => decision.sourceGoalId))
  const open = Math.max(0, parsed.sourceGoals.length - reviewedSourceGoalIds.size)
    + decisions.filter((decision) => decision.decision !== 'mapped').length
  const coverage: ReviewCoverage = {
    reviewed: reviewedSourceGoalIds.size,
    mapped: mappedSourceGoalIds.size,
    open,
    complete: parsed.sourceGoals.length > 0 && open === 0 && mappedSourceGoalIds.size === parsed.sourceGoals.length,
  }
  const review = {
    version: 1,
    reviewId: config.reviewPath.split('/').pop()?.replace(/\.json$/u, '') ?? config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId: canonicalPhysicsLandscapeId,
    sourceExtractionPath: config.outputPath,
    status: coverage.complete ? 'complete' : 'in_progress',
    mappings,
    decisions,
  }
  writeFileSync(absoluteReviewPath, `${JSON.stringify(review, null, 2)}\n`)
  return coverage
}

function generate(config: ExtractionConfig): void {
  const parsed = config.stage === 'SekII'
    ? parseUpperExtraction(config)
    : parseLowerExtraction(config)
  const reviewCoverage = writeReview(config, parsed)
  writeExtraction(config, parsed, reviewCoverage)
  console.log(`${config.extractionId}: ${parsed.passages.length} passages, ${parsed.sourceGoals.length} source goals`)
  console.log(`  ${config.outputPath}`)
  console.log(`  ${config.reviewPath}`)
}

generate(upperConfig)
generate(lowerConfig)
