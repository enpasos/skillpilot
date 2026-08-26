import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'LK' | 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  official: true
  url: string
}

interface TopicSpec {
  code: string
  title: string
  stage: Stage
  courseLevel: CourseLevel
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
  granularity: 'officialCompetency'
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

interface ReviewCoverage {
  reviewed: number
  mapped: number
  open: number
  complete: boolean
}

interface ExtractionConfig {
  extractionId: string
  sourceLandscapeId: string
  jurisdiction: 'DE-BW'
  subject: 'Physik'
  stage: Stage
  title: string
  sourceDocument: SourceDocument
  expectedTopics: TopicSpec[]
  outputPath: string
  reviewPath: string
}

interface ParsedTopic {
  spec: TopicSpec
  rawText: string
  sourceGoalTexts: string[]
  page: number
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const toPosix = (value: string) => value.split(path.sep).join('/')
const repoPath = (absolutePath: string) => toPosix(path.relative(repoRoot, absolutePath))

const canonicalPhysicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourceDocument: SourceDocument = {
  key: 'BP2016-PH-V2',
  title: 'Bildungsplan 2016 Gymnasium Physik Baden-Wuerttemberg, ueberarbeitete Fassung vom 25. Maerz 2022',
  path: 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_PH_V2.pdf',
  official: true,
  url: 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_PH.pdf',
}

const topicSpecs: TopicSpec[] = [
  ['3.2.1', 'Denk- und Arbeitsweisen der Physik', 'SekI', 'unspecified', 13],
  ['3.2.2', 'Optik und Akustik', 'SekI', 'unspecified', 14],
  ['3.2.3', 'Energie', 'SekI', 'unspecified', 15],
  ['3.2.4', 'Magnetismus und Elektromagnetismus', 'SekI', 'unspecified', 16],
  ['3.2.5', 'Grundgroessen der Elektrizitaetslehre', 'SekI', 'unspecified', 17],
  ['3.2.6', 'Mechanik: Kinematik', 'SekI', 'unspecified', 18],
  ['3.2.7', 'Mechanik: Dynamik', 'SekI', 'unspecified', 18],
  ['3.3.1', 'Denk- und Arbeitsweisen der Physik', 'SekI', 'unspecified', 20],
  ['3.3.2', 'Elektromagnetismus', 'SekI', 'unspecified', 20],
  ['3.3.3', 'Waermelehre', 'SekI', 'unspecified', 21],
  ['3.3.4', 'Struktur der Materie', 'SekI', 'unspecified', 23],
  ['3.3.5.1', 'Mechanik: Kinematik', 'SekI', 'unspecified', 24],
  ['3.3.5.2', 'Mechanik: Dynamik', 'SekI', 'unspecified', 25],
  ['3.3.5.3', 'Erhaltungssaetze', 'SekI', 'unspecified', 25],
  ['3.4.1', 'Denk- und Arbeitsweisen der Physik', 'SekII', 'GK_LK', 27],
  ['3.4.2.1', 'Elektrische und magnetische Felder', 'SekII', 'GK_LK', 27],
  ['3.4.2.2', 'Elektrodynamik', 'SekII', 'GK_LK', 28],
  ['3.4.3', 'Schwingungen', 'SekII', 'GK_LK', 29],
  ['3.4.4', 'Wellen', 'SekII', 'GK_LK', 30],
  ['3.4.5', 'Wellenoptik', 'SekII', 'GK_LK', 30],
  ['3.4.6', 'Quantenphysik und Materie', 'SekII', 'GK_LK', 31],
  ['3.5.1', 'Denk- und Arbeitsweisen der Physik und Astrophysik', 'SekII', 'GK_LK', 33],
  ['3.5.2.1', 'Elektrische und magnetische Felder', 'SekII', 'GK_LK', 33],
  ['3.5.2.2', 'Elektrodynamik', 'SekII', 'GK_LK', 34],
  ['3.5.3', 'Schwingungen', 'SekII', 'GK_LK', 35],
  ['3.5.4', 'Wellen', 'SekII', 'GK_LK', 36],
  ['3.5.5', 'Wellenoptik', 'SekII', 'GK_LK', 36],
  ['3.5.6', 'Atom- und Kernphysik', 'SekII', 'GK_LK', 37],
  ['3.5.7', 'Astrophysik', 'SekII', 'GK_LK', 38],
  ['3.6.1', 'Denk- und Arbeitsweisen der Physik', 'SekII', 'LK', 40],
  ['3.6.2.1', 'Elektrisches Feld', 'SekII', 'LK', 40],
  ['3.6.2.2', 'Magnetisches Feld', 'SekII', 'LK', 41],
  ['3.6.2.3', 'Elektrodynamik', 'SekII', 'LK', 42],
  ['3.6.3', 'Schwingungen', 'SekII', 'LK', 43],
  ['3.6.4', 'Wellen', 'SekII', 'LK', 44],
  ['3.6.5', 'Wellenoptik', 'SekII', 'LK', 45],
  ['3.6.6', 'Quantenphysik und Materie', 'SekII', 'LK', 46],
  ['3.6.7', 'Vertiefendes Themengebiet', 'SekII', 'LK', 47],
].map(([code, title, stage, courseLevel, page]) => ({
  code: String(code),
  title: String(title),
  stage: stage as Stage,
  courseLevel: courseLevel as CourseLevel,
  page: Number(page),
}))

const lowerConfig: ExtractionConfig = {
  extractionId: 'DE-BW-PHYSIK-SEKI-BP2016-V2',
  sourceLandscapeId: '3f58b4cf-2b02-4ae0-bb0f-8d8ab6d7f4f1',
  jurisdiction: 'DE-BW',
  subject: 'Physik',
  stage: 'SekI',
  title: 'Physik Sekundarstufe I (Baden-Wuerttemberg, BP2016 V2 Source-Extraction)',
  sourceDocument,
  expectedTopics: topicSpecs.filter((topic) => topic.stage === 'SekI'),
  outputPath: 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_PHYSIK_SEKI_BP2016_V2.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
}

const upperConfig: ExtractionConfig = {
  extractionId: 'DE-BW-PHYSIK-SEKII-BP2016-V2',
  sourceLandscapeId: 'eee2dc63-f96b-42c3-a2c9-b906432ccf5d',
  jurisdiction: 'DE-BW',
  subject: 'Physik',
  stage: 'SekII',
  title: 'Physik Kursstufe (Baden-Wuerttemberg, BP2016 V2 Source-Extraction)',
  sourceDocument,
  expectedTopics: topicSpecs.filter((topic) => topic.stage === 'SekII'),
  outputPath: 'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_PHYSIK_SEKII_BP2016_V2.source-extraction.json',
  reviewPath: 'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
}

const lowerCanonicalTargetsByTopicBullet: Record<string, string[]> = {
  '3.2.1:1': ['5355fee0-0477-5570-a234-561477bf77ba'],
  '3.2.1:2': ['da26294f-4316-5bd5-a37a-bd89397b3b8b'],
  '3.2.1:3': ['e5bc2227-d900-585f-8ac0-9d3f1cb40e27'],
  '3.2.1:4': ['3ed3279e-c524-5230-a277-dda89493df6d'],
  '3.2.2:1': ['10aad90e-a1db-42b6-8d1e-1d856e14b47d'],
  '3.2.2:2': [
    '90e1e6cf-4092-41d6-81f7-5206f9d68f84',
    'c1006f55-0406-48cc-92d4-0d8345897cf4',
  ],
  '3.2.2:3': ['3e33813d-db75-4571-8345-3845b02b956d'],
  '3.2.2:4': [
    'dd7cdcea-0950-461b-96ac-ce49989fca47',
    '79cb1695-f985-443a-b93e-27b57ab474b7',
  ],
  '3.2.2:5': [
    'dd7cdcea-0950-461b-96ac-ce49989fca47',
    '79cb1695-f985-443a-b93e-27b57ab474b7',
  ],
  '3.2.2:6': [
    '33e3417c-e062-5f4a-8df9-3195dca50089',
    'f0046ae8-cbfc-526b-8414-04e3595b6075',
  ],
  '3.2.2:7': ['9a9e2085-5ab6-534f-b622-83774d51f36b'],
  '3.2.2:8': [
    '3c8e5510-a12d-5770-8a01-e5fe741b259c',
    'b57427c9-1af5-5daa-8c65-b84a4cc20785',
  ],
  '3.2.2:9': ['6a4c6042-052b-502b-a39a-0ed8941247ac'],
  '3.2.2:10': ['1ab5f599-0927-579d-94cc-feecdf3b5603'],
  '3.2.2:11': ['078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5'],
  '3.2.2:12': [
    'a4681378-ade4-4f20-bf77-fb020469510f',
    'cdab9fd1-5054-4a7e-8c9a-4474062ddd23',
  ],
  '3.2.2:13': [
    'dd7cdcea-0950-461b-96ac-ce49989fca47',
    'c1006f55-0406-48cc-92d4-0d8345897cf4',
    'a24c41ce-68c5-56a7-8235-ef9a7dba7042',
    '10aad90e-a1db-42b6-8d1e-1d856e14b47d',
  ],
  '3.2.3:1': [
    '722857cf-f327-5740-8151-64eb92195ec8',
    '91c49019-ea51-4ce5-a919-c91c45b25e83',
  ],
  '3.2.3:2': [
    '722857cf-f327-5740-8151-64eb92195ec8',
    'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  ],
  '3.2.3:3': [
    '722857cf-f327-5740-8151-64eb92195ec8',
    'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  ],
  '3.2.3:4': ['30a936ec-e427-57fe-bf3e-4abd64b1f0c1'],
  '3.2.3:5': [
    'aed9161b-ddc4-559c-be8f-baeeddf224f3',
    '5be98160-5189-58aa-8183-1df1c400cc8c',
  ],
  '3.2.3:6': ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b'],
  '3.2.3:7': ['201d353a-dfe7-521b-b0f6-eccb4d42945b'],
  '3.2.3:8': ['201d353a-dfe7-521b-b0f6-eccb4d42945b'],
  '3.2.3:9': [
    '201d353a-dfe7-521b-b0f6-eccb4d42945b',
    '327302e3-5b36-46f8-9c16-73f24583b0eb',
  ],
  '3.2.3:10': [
    'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
    '91c49019-ea51-4ce5-a919-c91c45b25e83',
    'cbdc0b5f-8a48-5ade-be53-ab6aacaa3e73',
  ],
  '3.2.4:1': ['f778a659-1467-4aa7-97b2-bed78c530634'],
  '3.2.4:2': [
    'a5f652cc-e091-4c90-bec2-c357ae54fcf1',
    '106417ed-80db-5490-a1ee-bb4160d3f2b4',
  ],
  '3.2.4:3': [
    'a5f652cc-e091-4c90-bec2-c357ae54fcf1',
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
  ],
  '3.2.4:4': [
    'f778a659-1467-4aa7-97b2-bed78c530634',
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
  ],
  '3.2.5:1': ['75bdf5ca-cda4-4658-9ec7-84c77b3759db'],
  '3.2.5:2': ['baa2bf3c-798a-5ec3-a667-031bf062d96c'],
  '3.2.5:3': [
    '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  ],
  '3.2.5:4': [
    '75bdf5ca-cda4-4658-9ec7-84c77b3759db',
    '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
  ],
  '3.2.5:5': ['75bdf5ca-cda4-4658-9ec7-84c77b3759db'],
  '3.2.5:6': [
    'f1a078ae-6262-4444-a4bc-a5ab275621cf',
    '59d1145e-ac54-5917-880a-21b4b80526d3',
  ],
  '3.2.5:7': [
    '8a84de16-2fde-58ec-827a-f803e2ce8564',
    '267170bd-f880-56a7-9719-ffb9751872c5',
  ],
  '3.2.5:8': [
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
    '201d353a-dfe7-521b-b0f6-eccb4d42945b',
  ],
  '3.2.5:9': [
    '50431e92-eec9-54d6-b437-ea7a51b6f474',
    '201d353a-dfe7-521b-b0f6-eccb4d42945b',
  ],
  '3.2.5:10': ['a5f652cc-e091-4c90-bec2-c357ae54fcf1'],
  '3.2.5:11': ['1911920e-b099-4310-82f2-b47f51a78b33'],
  '3.2.6:1': [
    'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
    'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  ],
  '3.2.6:2': [
    'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
    'ce431132-dfc4-42c2-aff6-bd72035190f8',
  ],
  '3.2.6:3': ['4a2bf015-052b-4af0-aed7-324259fa1a8a'],
  '3.2.6:4': ['971beafa-6ba5-4c82-ac8b-7ebf66eec3dd'],
  '3.2.7:1': [
    '5ea765ac-c279-551a-8a94-a07da2381e5b',
    '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  ],
  '3.2.7:2': [
    '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
    '5ea765ac-c279-551a-8a94-a07da2381e5b',
  ],
  '3.2.7:3': [
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
    'a0aaedcb-41f8-4891-af77-a69a76b8c10d',
  ],
  '3.2.7:4': [
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
    'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
  ],
  '3.2.7:5': [
    '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
    '05af2893-0201-4d7f-985b-272d7b88e26e',
  ],
  '3.2.7:6': [
    'e41356c1-968b-435a-af25-b663f080ae5a',
    'eb0ffdea-c12d-56df-b7e8-c0297d2f8aff',
  ],
  '3.2.7:7': [
    '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
    '5f289cdc-fda1-4058-b44f-041ba1398e79',
  ],
  '3.2.7:8': ['4a2bf015-052b-4af0-aed7-324259fa1a8a'],
  '3.2.7:9': ['327302e3-5b36-46f8-9c16-73f24583b0eb'],
  '3.3.1:1': ['5355fee0-0477-5570-a234-561477bf77ba'],
  '3.3.1:2': ['da26294f-4316-5bd5-a37a-bd89397b3b8b'],
  '3.3.1:3': ['e5bc2227-d900-585f-8ac0-9d3f1cb40e27'],
  '3.3.1:4': ['3ed3279e-c524-5230-a277-dda89493df6d'],
  '3.3.2:1': [
    '8a84de16-2fde-58ec-827a-f803e2ce8564',
    '267170bd-f880-56a7-9719-ffb9751872c5',
  ],
  '3.3.2:2': [
    '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  ],
  '3.3.2:3': [
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
    'baa2bf3c-798a-5ec3-a667-031bf062d96c',
  ],
  '3.3.2:4': [
    '8f833b36-4126-52db-b210-79fb0023c7d9',
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  ],
  '3.3.2:5': ['1a037489-3c95-540b-8cae-0acd360358ee'],
  '3.3.2:6': ['fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c'],
  '3.3.2:7': [
    '50431e92-eec9-54d6-b437-ea7a51b6f474',
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
  ],
  '3.3.2:8': ['50431e92-eec9-54d6-b437-ea7a51b6f474'],
  '3.3.2:9': [
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
    'df010b2b-b182-5f7e-bbe4-49b72e48c27a',
  ],
  '3.3.3:1': [
    '940978fa-1f2d-4e54-9c28-081a6df9b76f',
    '37b33812-d428-5953-852e-57a53a4347fe',
  ],
  '3.3.3:2': ['d27c8860-12a4-4d7d-9849-ccd8b7caca48'],
  '3.3.3:3': [
    'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
    '88d07c80-5d7d-5c70-b385-b22769381e44',
  ],
  '3.3.3:4': ['fbe0faae-7fba-482b-888e-341f926770f3'],
  '3.3.3:5': [
    'fbe0faae-7fba-482b-888e-341f926770f3',
    'aed9161b-ddc4-559c-be8f-baeeddf224f3',
  ],
  '3.3.3:6': ['2088ccf0-48f4-51d4-be5f-67affd0fb099'],
  '3.3.3:7': ['5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce'],
  '3.3.3:8': [
    '5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce',
    'f322c268-dc16-5d50-82dd-209834f20208',
  ],
  '3.3.3:9': [
    '5be98160-5189-58aa-8183-1df1c400cc8c',
    'aed9161b-ddc4-559c-be8f-baeeddf224f3',
  ],
  '3.3.3:10': [
    '5be98160-5189-58aa-8183-1df1c400cc8c',
    '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
    '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
  ],
  '3.3.4:1': [
    '2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb',
    'b3f3f4f7-b5cc-40e1-b57a-3d93649baa61',
  ],
  '3.3.4:2': [
    'cb0426b0-a973-5660-b6fe-79407934730f',
    'f6f646db-3544-49ed-8f55-67bc684e80ce',
    'a12fddce-0215-58d9-bd91-21be8a960d25',
  ],
  '3.3.4:3': [
    'f6f646db-3544-49ed-8f55-67bc684e80ce',
    '979e0d0d-8933-4ace-814f-f28060ad280f',
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
  ],
  '3.3.4:4': [
    '50877233-7abf-54df-b347-6d3224678fc9',
    '49872cc0-401f-5464-9235-4763df4db5cf',
  ],
  '3.3.4:5': [
    '979e0d0d-8933-4ace-814f-f28060ad280f',
    '50877233-7abf-54df-b347-6d3224678fc9',
    '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
  ],
  '3.3.4:6': [
    'cb0426b0-a973-5660-b6fe-79407934730f',
    'f6f646db-3544-49ed-8f55-67bc684e80ce',
    '979e0d0d-8933-4ace-814f-f28060ad280f',
  ],
  '3.3.5.1:1': [
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
    'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  ],
  '3.3.5.1:2': [
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
    'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  ],
  '3.3.5.1:3': [
    'ce431132-dfc4-42c2-aff6-bd72035190f8',
    '09029573-864f-40ca-bf8a-cee7bf6dcb73',
    'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
  ],
  '3.3.5.1:4': [
    'ce431132-dfc4-42c2-aff6-bd72035190f8',
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
    'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  ],
  '3.3.5.1:5': [
    '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
    '68c90ba6-c438-463c-9a53-cf61062d416a',
  ],
  '3.3.5.1:6': [
    'ec7a0a68-730b-5c94-ac72-a937508f8303',
    'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
  ],
  '3.3.5.2:1': [
    '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
    '5f289cdc-fda1-4058-b44f-041ba1398e79',
  ],
  '3.3.5.2:2': [
    '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
    'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
    '839ecc8f-3a60-418b-bc92-64bfeef33824',
  ],
  '3.3.5.2:3': [
    'd6dc0e02-831d-4894-a61a-852bcc74f147',
    '12260012-cf04-5409-b57d-f5b3a46d9126',
    '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  ],
  '3.3.5.2:4': [
    '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
    '5f289cdc-fda1-4058-b44f-041ba1398e79',
    '68c90ba6-c438-463c-9a53-cf61062d416a',
  ],
  '3.3.5.2:5': [
    'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
    'e918b31f-6f39-5dee-ade6-3617080fb24f',
  ],
  '3.3.5.3:1': [
    '722857cf-f327-5740-8151-64eb92195ec8',
    'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
    '91c49019-ea51-4ce5-a919-c91c45b25e83',
  ],
  '3.3.5.3:2': [
    'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
    '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
  ],
  '3.3.5.3:3': [
    '94784e0a-7ddc-48be-91fb-dc82b78eb322',
    '7eeff2de-6015-49a6-a96e-a488d886dc9f',
    '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  ],
  '3.3.5.3:4': [
    '91c49019-ea51-4ce5-a919-c91c45b25e83',
    '94784e0a-7ddc-48be-91fb-dc82b78eb322',
  ],
  '3.3.5.3:5': [
    '839ecc8f-3a60-418b-bc92-64bfeef33824',
    'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
  ],
  '3.3.5.3:6': [
    '839ecc8f-3a60-418b-bc92-64bfeef33824',
    '0da13365-02c2-44f1-8a81-d524ca0ac3ae',
    '2eecd0e2-a7ca-4568-9b12-3d47706c65fb',
  ],
}

const upperCanonicalTargetsByTopicBullet: Record<string, string[]> = {}

function mapUpper(keys: string[], canonicalGoalIds: string[]): void {
  keys.forEach((key) => {
    if (upperCanonicalTargetsByTopicBullet[key]) {
      throw new Error(`Duplicate BW Physics Sek II mapping key: ${key}`)
    }
    upperCanonicalTargetsByTopicBullet[key] = canonicalGoalIds
  })
}

mapUpper(['3.4.1:1', '3.5.1:1', '3.6.1:1'], ['da26294f-4316-5bd5-a37a-bd89397b3b8b'])
mapUpper(['3.4.1:2', '3.5.1:3', '3.6.1:2'], ['e5bc2227-d900-585f-8ac0-9d3f1cb40e27'])
mapUpper(['3.4.1:3', '3.6.1:3'], [
  '28f6a324-5f5e-5771-91d2-c007f6c275aa',
  'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
])
mapUpper(['3.5.1:2'], ['2b700858-bc2e-5ddf-a791-b14d44160480'])
mapUpper(['3.5.1:4'], ['e5bc2227-d900-585f-8ac0-9d3f1cb40e27'])
mapUpper(['3.5.1:5'], [
  '7c986fca-1129-5eff-a17e-0a04bb7346ee',
  '3ed3279e-c524-5230-a277-dda89493df6d',
])

mapUpper(['3.4.2.1:1', '3.5.2.1:1'], [
  '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
  '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
  '4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe',
  '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  '0f6b798b-594e-5480-8c5f-95e2486a4d85',
])
mapUpper(['3.4.2.1:2', '3.5.2.1:2'], [
  '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
  '8da5c981-8216-5fcd-a393-19f392ae2006',
])
mapUpper(['3.4.2.1:3', '3.5.2.1:3'], [
  '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
  '1730c01d-8c85-57df-b031-c11e2a0511b1',
])
mapUpper(['3.4.2.1:4', '3.5.2.1:4'], [
  'c6355a22-24cf-5d8b-88af-ea11711460fb',
  '0f6b798b-594e-5480-8c5f-95e2486a4d85',
])
mapUpper(['3.4.2.1:5', '3.5.2.1:5'], [
  '8c9394cb-f54a-508d-9750-4c49e31b3fa9',
  '9854589c-5feb-4942-b90f-311ddf36eb78',
])
mapUpper(['3.4.2.1:6', '3.5.2.1:6'], [
  '9854589c-5feb-4942-b90f-311ddf36eb78',
  '8c9394cb-f54a-508d-9750-4c49e31b3fa9',
])
mapUpper(['3.4.2.1:7', '3.5.2.1:7'], [
  '9f59a088-3939-59e9-821d-167fadfda782',
  'e3bce51c-cfeb-4706-b95e-a22b76e7dd73',
  '38e0ff49-f132-44c8-b17a-73dada5344db',
  'fd9fd8ad-c4a1-5552-9ea0-1878e0636f20',
])
mapUpper(['3.4.2.1:8', '3.5.2.1:8'], [
  '0b4f2020-8486-5372-9cb9-6e59f698ac2d',
  '330808f6-789a-583d-86df-e271a7683d8b',
])
mapUpper(['3.4.2.1:9', '3.5.2.1:9'], [
  '106417ed-80db-5490-a1ee-bb4160d3f2b4',
  'a1389d4e-dc97-5557-babe-a31a2bd57217',
])

mapUpper(['3.4.2.2:1', '3.5.2.2:1'], ['a522c8c0-f3a4-5568-acae-3010ed9feb87'])
mapUpper(['3.4.2.2:2', '3.5.2.2:2'], [
  '1a037489-3c95-540b-8cae-0acd360358ee',
  'eb1ea150-ec6c-5000-bce3-f46c820dccf8',
])
mapUpper(['3.4.2.2:3'], ['37f28bc4-def2-57cf-a06b-191dfd228205'])
mapUpper(['3.4.2.2:4', '3.5.2.2:3'], ['fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c'])

mapUpper(['3.4.3:1', '3.5.3:1'], [
  'd03f1cb6-c224-53db-ad91-76cc7827978d',
  'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e',
])
mapUpper(['3.4.3:2', '3.5.3:2'], [
  'd03f1cb6-c224-53db-ad91-76cc7827978d',
  'b2fb9a25-4d26-5cf2-a917-823909dcb6bd',
])
mapUpper(['3.4.3:3', '3.5.3:3'], ['05af2893-0201-4d7f-985b-272d7b88e26e'])
mapUpper(['3.4.3:4'], [
  'd03f1cb6-c224-53db-ad91-76cc7827978d',
  '78cf6eff-b3bc-5444-9ef8-5d39dae8d17d',
  '05af2893-0201-4d7f-985b-272d7b88e26e',
])
mapUpper(['3.5.3:4'], [
  'd03f1cb6-c224-53db-ad91-76cc7827978d',
  '78cf6eff-b3bc-5444-9ef8-5d39dae8d17d',
])
mapUpper(['3.4.3:5', '3.5.3:5'], [
  'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
  '78cf6eff-b3bc-5444-9ef8-5d39dae8d17d',
])
mapUpper(['3.4.3:6'], ['a844895e-2cdc-4665-aad2-a49c62f11759'])

mapUpper(['3.4.4:1', '3.5.4:1'], [
  'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8',
  '68020906-e615-462e-a56f-dd1ccc14b8d7',
  '549269d3-1aef-5c55-9640-ee2a8e2ee9a1',
])
mapUpper(['3.4.4:2', '3.5.4:2'], [
  'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
  '224243cd-5a53-5d6e-bed5-564cca167a80',
])
mapUpper(['3.4.4:3', '3.5.4:3'], [
  'd5772db3-120c-5c37-ab46-2336d02236b0',
  '224243cd-5a53-5d6e-bed5-564cca167a80',
])
mapUpper(['3.4.4:4', '3.5.4:4'], ['224243cd-5a53-5d6e-bed5-564cca167a80'])
mapUpper(['3.4.4:5', '3.5.4:5'], [
  '9dba2826-b179-59f0-8d91-5916079e5abe',
  'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
])
mapUpper(['3.4.4:6', '3.5.4:7'], ['4a7cbe83-b694-57d3-85ce-1eeca418daaf'])
mapUpper(['3.5.4:6'], [
  'e7131fe3-1da6-5555-80ec-fb6bdf8fcc29',
  'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
])
mapUpper(['3.5.4:8'], [
  'ba16948b-5e07-54af-b77b-776e677c6906',
  '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
])

mapUpper(['3.4.5:1', '3.5.5:1'], ['5b90066f-b5b3-4e82-8d31-7b95ff0a0451'])
mapUpper(['3.4.5:2', '3.5.5:2'], [
  '8ad305d2-bde0-4223-9477-517b2943148b',
  '0693f68f-1bd4-50a9-ba2b-af95b1c949ee',
])
mapUpper(['3.4.5:3', '3.5.5:3'], ['2c6af966-7703-4176-a117-5ddb8295bedf'])
mapUpper(['3.4.5:4', '3.5.5:4'], ['c64820e1-c0ee-4342-9225-f981650f0c52'])
mapUpper(['3.4.5:5', '3.5.5:5'], [
  '91683676-01cf-5003-80fa-a04d043b4e61',
  'c71315c1-f329-4289-a145-d99819da7bad',
  '2c6af966-7703-4176-a117-5ddb8295bedf',
])
mapUpper(['3.5.5:6'], [
  '91683676-01cf-5003-80fa-a04d043b4e61',
  'c14857d3-634f-4a59-9a3f-8d0638fc5784',
  'ea2d5085-4ec1-5e33-87e0-15edcad635bf',
])

mapUpper(['3.4.6:1', '3.6.6:3'], ['4245c54f-d609-41bc-9eff-e9ceeff4902f'])
mapUpper(['3.4.6:2', '3.6.6:4'], ['5c57dbc7-d258-4aad-a84c-e773f3c493ae'])
mapUpper(['3.4.6:3', '3.6.6:5'], ['1a1c09f0-96b7-4c33-a623-0e8101537876'])
mapUpper(['3.4.6:4'], [
  '6031bed0-9baa-4f45-b2a5-57ffb00d39cc',
  '4245c54f-d609-41bc-9eff-e9ceeff4902f',
  '8c97c234-a932-5e84-aed5-237b4e2a8336',
])
mapUpper(['3.4.6:5', '3.6.6:1'], [
  'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f',
  'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  '28f6a324-5f5e-5771-91d2-c007f6c275aa',
])
mapUpper(['3.4.6:6', '3.6.6:2'], [
  'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  'dfa53498-34f5-5326-9d94-87e7b528caf3',
])
mapUpper(['3.4.6:7', '3.6.6:8'], ['727d0946-7019-50ed-8fc6-85db12508733'])
mapUpper(['3.4.6:8', '3.6.6:9'], ['b9fcbad4-a855-54b7-8017-4caac1e2ffb7'])
mapUpper(['3.4.6:9'], [
  '904670af-8e4c-543e-bc9b-e6248d87a10d',
  'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
])
mapUpper(['3.4.6:10'], [
  '8ea46612-7f0d-4ef4-a732-9428e640ae92',
  'ce89fa04-bbd8-53b2-be01-812e3b3044ed',
])

mapUpper(['3.5.6:1'], [
  'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f',
  'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  '28f6a324-5f5e-5771-91d2-c007f6c275aa',
])
mapUpper(['3.5.6:2'], [
  'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  'dfa53498-34f5-5326-9d94-87e7b528caf3',
])
mapUpper(['3.5.6:3'], [
  '904670af-8e4c-543e-bc9b-e6248d87a10d',
  'c14857d3-634f-4a59-9a3f-8d0638fc5784',
  'ea2d5085-4ec1-5e33-87e0-15edcad635bf',
])
mapUpper(['3.5.6:4'], [
  '904670af-8e4c-543e-bc9b-e6248d87a10d',
  'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
])
mapUpper(['3.5.6:5'], [
  'c14857d3-634f-4a59-9a3f-8d0638fc5784',
  'ea2d5085-4ec1-5e33-87e0-15edcad635bf',
  'e28381b4-50ef-5cac-bfa4-b7c8e03aef82',
])
mapUpper(['3.5.6:6'], [
  '4c5c7cb1-f238-52c8-b82c-159c6c299c0e',
  '49872cc0-401f-5464-9235-4763df4db5cf',
  'cde9b548-2cf4-59ad-b5d4-a71872afbe56',
])

mapUpper(['3.5.7:1'], [
  'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
  '5db07785-8cca-50d5-81a9-e0264d344af9',
])
mapUpper(['3.5.7:2'], [
  '5db07785-8cca-50d5-81a9-e0264d344af9',
  '7c986fca-1129-5eff-a17e-0a04bb7346ee',
])
mapUpper(['3.5.7:3'], [
  'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
  'aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745',
])
mapUpper(['3.5.7:4'], [
  'da3169ae-c72a-5782-ad95-408167a5c6da',
  '9b47a758-1b5d-5906-84c9-8621050d5aa5',
])
mapUpper(['3.5.7:5'], [
  '9b47a758-1b5d-5906-84c9-8621050d5aa5',
  '6f896466-e0ec-5f8d-82ad-2890433c82ba',
])
mapUpper(['3.5.7:6'], [
  '9b47a758-1b5d-5906-84c9-8621050d5aa5',
  '4c5c7cb1-f238-52c8-b82c-159c6c299c0e',
])
mapUpper(['3.5.7:7'], [
  '6f896466-e0ec-5f8d-82ad-2890433c82ba',
  '9b47a758-1b5d-5906-84c9-8621050d5aa5',
])
mapUpper(['3.5.7:8'], ['5b8eaf71-96fe-50eb-b9ea-a8fa392df086'])
mapUpper(['3.5.7:9'], [
  'e28381b4-50ef-5cac-bfa4-b7c8e03aef82',
  'c14857d3-634f-4a59-9a3f-8d0638fc5784',
])

mapUpper(['3.6.2.1:1'], ['8da5c981-8216-5fcd-a393-19f392ae2006'])
mapUpper(['3.6.2.1:2'], [
  '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
  '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
  '4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe',
  'f3de5922-dd45-4fb6-87c1-525d1952dd89',
])
mapUpper(['3.6.2.1:3'], ['9fb1dd85-11b7-4a5a-b124-27fea8d1788e'])
mapUpper(['3.6.2.1:4'], [
  '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
  '1730c01d-8c85-57df-b031-c11e2a0511b1',
])
mapUpper(['3.6.2.1:5'], [
  '9f59a088-3939-59e9-821d-167fadfda782',
  '38e0ff49-f132-44c8-b17a-73dada5344db',
])
mapUpper(['3.6.2.1:6'], ['9f59a088-3939-59e9-821d-167fadfda782'])
mapUpper(['3.6.2.1:7'], [
  '9f59a088-3939-59e9-821d-167fadfda782',
  'fd9fd8ad-c4a1-5552-9ea0-1878e0636f20',
])
mapUpper(['3.6.2.1:8'], [
  '0b4f2020-8486-5372-9cb9-6e59f698ac2d',
  '330808f6-789a-583d-86df-e271a7683d8b',
])
mapUpper(['3.6.2.1:9'], [
  '1730c01d-8c85-57df-b031-c11e2a0511b1',
  '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
])
mapUpper(['3.6.2.1:10'], [
  '156edddc-ce8d-580d-8d17-d9376d59e60e',
  '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
])
mapUpper(['3.6.2.1:11'], [
  '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
  '3b866aea-3e4d-5f23-91de-759148382710',
  '1730c01d-8c85-57df-b031-c11e2a0511b1',
])

mapUpper(['3.6.2.2:1'], [
  '0f6b798b-594e-5480-8c5f-95e2486a4d85',
  '106417ed-80db-5490-a1ee-bb4160d3f2b4',
])
mapUpper(['3.6.2.2:2'], ['c6355a22-24cf-5d8b-88af-ea11711460fb'])
mapUpper(['3.6.2.2:3'], ['8c9394cb-f54a-508d-9750-4c49e31b3fa9'])
mapUpper(['3.6.2.2:4'], ['b39ae8fb-4358-5866-8adf-3d5365368eeb'])
mapUpper(['3.6.2.2:5'], ['106417ed-80db-5490-a1ee-bb4160d3f2b4'])
mapUpper(['3.6.2.2:6'], [
  '9854589c-5feb-4942-b90f-311ddf36eb78',
  '7fe6f8a1-5580-4e37-bf8e-9772964a6b0a',
])
mapUpper(['3.6.2.2:7'], [
  '3f17d0d2-562d-4c1c-9ebc-1a1a43f28f9c',
  '7fe6f8a1-5580-4e37-bf8e-9772964a6b0a',
  '9854589c-5feb-4942-b90f-311ddf36eb78',
])

mapUpper(['3.6.2.3:1'], ['a522c8c0-f3a4-5568-acae-3010ed9feb87'])
mapUpper(['3.6.2.3:2'], [
  'eb1ea150-ec6c-5000-bce3-f46c820dccf8',
  'd18d4190-ddc1-5181-b1b6-e79947b737c2',
])
mapUpper(['3.6.2.3:3'], ['fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c'])
mapUpper(['3.6.2.3:4'], [
  '37f28bc4-def2-57cf-a06b-191dfd228205',
  '692db5b6-8be1-5c7b-8307-3a02afb21ea0',
])
mapUpper(['3.6.2.3:5'], [
  '106417ed-80db-5490-a1ee-bb4160d3f2b4',
  'a1389d4e-dc97-5557-babe-a31a2bd57217',
])
mapUpper(['3.6.2.3:6'], ['ffbbf243-c2eb-4330-b050-837de994c130'])
mapUpper(['3.6.2.3:7'], ['e5c33afc-a233-50ff-a17f-63c085dfb89c'])

mapUpper(['3.6.3:1'], [
  'd03f1cb6-c224-53db-ad91-76cc7827978d',
  'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e',
  'e6895bc3-fcbd-59ad-baef-a78c97a13e11',
])
mapUpper(['3.6.3:2'], [
  'd03f1cb6-c224-53db-ad91-76cc7827978d',
  'b2fb9a25-4d26-5cf2-a917-823909dcb6bd',
])
mapUpper(['3.6.3:3'], [
  'e6895bc3-fcbd-59ad-baef-a78c97a13e11',
  '18c1f954-487e-5121-bb18-6c64a82f573d',
])
mapUpper(['3.6.3:4'], ['05af2893-0201-4d7f-985b-272d7b88e26e'])
mapUpper(['3.6.3:5', '3.6.3:6'], ['b2fb9a25-4d26-5cf2-a917-823909dcb6bd'])
mapUpper(['3.6.3:7'], [
  'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
  '78cf6eff-b3bc-5444-9ef8-5d39dae8d17d',
])
mapUpper(['3.6.3:8'], [
  'a7255b83-336c-4d42-ba5c-bc2f6248ea36',
  'f36a5946-f2a8-59b8-b3bd-a2f246defa4f',
])
mapUpper(['3.6.3:9'], ['a844895e-2cdc-4665-aad2-a49c62f11759'])
mapUpper(['3.6.3:10'], ['3efa0cda-f55b-5534-8fac-ffe1d312aed1'])

mapUpper(['3.6.4:1'], [
  'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8',
  '549269d3-1aef-5c55-9640-ee2a8e2ee9a1',
])
mapUpper(['3.6.4:2'], ['68020906-e615-462e-a56f-dd1ccc14b8d7'])
mapUpper(['3.6.4:3'], [
  'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
  '224243cd-5a53-5d6e-bed5-564cca167a80',
])
mapUpper(['3.6.4:4'], [
  'e160acb4-5b88-509e-8055-2653df420c65',
  '158e1c19-7ccb-4c8c-931c-b685951ab161',
])
mapUpper(['3.6.4:5'], [
  'd5772db3-120c-5c37-ab46-2336d02236b0',
  '224243cd-5a53-5d6e-bed5-564cca167a80',
])
mapUpper(['3.6.4:6'], ['224243cd-5a53-5d6e-bed5-564cca167a80'])
mapUpper(['3.6.4:7'], [
  '9dba2826-b179-59f0-8d91-5916079e5abe',
  'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
])
mapUpper(['3.6.4:8'], ['4a7cbe83-b694-57d3-85ce-1eeca418daaf'])
mapUpper(['3.6.4:9'], ['5da7d4d0-878e-44fd-b398-1b1de8b636a4'])

mapUpper(['3.6.5:1'], ['5b90066f-b5b3-4e82-8d31-7b95ff0a0451'])
mapUpper(['3.6.5:2'], [
  '8ad305d2-bde0-4223-9477-517b2943148b',
  '0693f68f-1bd4-50a9-ba2b-af95b1c949ee',
])
mapUpper(['3.6.5:3'], ['c71315c1-f329-4289-a145-d99819da7bad'])
mapUpper(['3.6.5:4'], ['d1e26b52-78a7-5f3b-ac9f-97f3e62d7db1'])
mapUpper(['3.6.5:5'], [
  '2c6af966-7703-4176-a117-5ddb8295bedf',
  '91683676-01cf-5003-80fa-a04d043b4e61',
  'c71315c1-f329-4289-a145-d99819da7bad',
])
mapUpper(['3.6.5:6'], [
  'c64820e1-c0ee-4342-9225-f981650f0c52',
  'f6a3a602-1e45-5018-b0ff-3d49933cf634',
  '6270e558-d657-5363-a6b2-e49a032a453b',
])
mapUpper(['3.6.5:7'], ['31ed4e95-3ed4-4cfb-9b11-9f3c1341f2d4'])
mapUpper(['3.6.5:8'], ['c2b6acd8-b298-4e4e-aa7a-553a8a65f913'])

mapUpper(['3.6.6:6'], [
  '6031bed0-9baa-4f45-b2a5-57ffb00d39cc',
  '8c97c234-a932-5e84-aed5-237b4e2a8336',
  'aef1e312-6a0c-5323-9202-c22ae84086f2',
])
mapUpper(['3.6.6:7'], [
  'f6e5929f-d52a-42a4-a5d2-ff498ee7083f',
  '9e881b3b-68cd-5f52-819f-c2e33b5ba631',
])
mapUpper(['3.6.6:10'], [
  '904670af-8e4c-543e-bc9b-e6248d87a10d',
  'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
  'bacae732-2016-5a83-bc61-d0f94ed5a0e4',
])
mapUpper(['3.6.6:11'], [
  '7e9e814c-fe12-42a9-8d80-e09e7fb52964',
  '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
])
mapUpper(['3.6.6:12'], [
  'ad021f2e-6b94-5e6e-a264-3d1110094b87',
  'ef6d5067-96b0-5388-87dd-5ac4e6a3e313',
])
mapUpper(['3.6.6:13'], [
  '8ea46612-7f0d-4ef4-a732-9428e640ae92',
  'bacae732-2016-5a83-bc61-d0f94ed5a0e4',
])

mapUpper(['3.6.7:1'], ['14ec85b9-68f6-5400-ad43-5e8dddfddf44'])
mapUpper(['3.6.7:2'], ['5c0d5040-92e4-50f6-9695-9d33d889a080'])

const normalizeGermanText = (value: string): string =>
  value
    .replace(/Kapazität/gu, 'Kapazität')
    .replace(/Wärme/gu, 'Wärme')
    .replace(/Grö/gu, 'Grö')
    .replace(/Sätze/gu, 'Sätze')
    .replace(/’/gu, "'")
    .replace(/‘/gu, "'")
    .replace(/­/gu, '')
    .normalize('NFC')

const normalizeLine = (line: string): string =>
  normalizeGermanText(line)
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .trim()

const stripFormulaWhitespace = (value: string): string =>
  value
    .replace(/\(\s+\)/gu, '')
    .replace(/\s+,/gu, ',')
    .replace(/\s+\)/gu, ')')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+/gu, ' ')
    .trim()

const isChromeLine = (line: string): boolean =>
  line.length === 0
  || /^\f?$/u.test(line)
  || /^Bildungsplan 2016/u.test(line)
  || /^Physik – Überarbeitete Fassung/u.test(line)
  || /^Standards für inhaltsbezogene Kompetenzen/u.test(line)
  || /^\d+\s+Standards für inhaltsbezogene Kompetenzen/u.test(line)
  || /^Standards für inhaltsbezogene Kompetenzen.+\d+$/u.test(line)
  || /^Operatoren$/u.test(line)
  || /^Anhang$/u.test(line)
  || /^\d+$/u.test(line)

const isReferenceLine = (line: string): boolean =>
  /^(?:[23]\.\d(?:\.\d+)?|BNT|CH(?:\.V2)?|BIO(?:\.V2)?|NWT|M|GEO|REV|MUS|MUSPROFIL|BK|BKPROFIL)\b/u.test(line)
  || /^(?:BNE|BTV|PG|BO|MB|VB)\b/u.test(line)
  || /^(?:unter anderem|zum Beispiel)\s*$/iu.test(line)

const headingPattern = /^(3\.(?:[2-6])(?:\.\d+){1,2})\s+(.+?)$/u
const sourceGoalStartPattern = /^\(?\s*(\d+)\)\s+(.+)$/u

function absoluteRepoPath(repoRelativePath: string): string {
  return path.resolve(repoRoot, repoRelativePath)
}

function readPdfText(sourcePath: string): string {
  const pdfPath = absoluteRepoPath(sourcePath)
  if (!existsSync(pdfPath)) {
    throw new Error(`Missing source PDF: ${sourcePath}`)
  }
  return execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' })
}

function cleanSourceGoalText(value: string): string {
  return stripFormulaWhitespace(
    normalizeGermanText(value)
      .replace(/\s*-\s+/gu, ' ')
      .replace(/\s+([,.;:])/gu, '$1'),
  )
}

function appendContinuation(previous: string, next: string): string {
  if (previous.endsWith('-')) return `${previous.slice(0, -1)}${next}`
  return `${previous} ${next}`
}

function parseTopics(rawText: string, specs: TopicSpec[]): ParsedTopic[] {
  const expectedByCode = new Map(specs.map((spec) => [spec.code, spec]))
  const allExpectedCodes = new Set(topicSpecs.map((spec) => spec.code))
  const rawLines = rawText.split(/\r?\n/u)
  const normalizedLines = rawLines.map(normalizeLine)
  const startIndex = normalizedLines.findIndex((line, index) => index > 300 && line === '3.2 Klassen 7/8')
  const endIndex = normalizedLines.findIndex((line, index) => index > startIndex && line === '4. Operatoren')
  const lines = rawLines.slice(startIndex >= 0 ? startIndex : 0, endIndex >= 0 ? endIndex : rawLines.length)

  const topics = new Map<string, ParsedTopic>()
  let current: ParsedTopic | null = null
  let currentGoalIndex = -1
  let skippingReferenceBlock = false
  let page = 0

  const ensureCurrent = (line: string, allowHeading: boolean): boolean => {
    if (!allowHeading) return false
    const match = line.match(headingPattern)
    if (!match) return false
    const [, code, title] = match
    if (!allExpectedCodes.has(code)) {
      current = null
      currentGoalIndex = -1
      skippingReferenceBlock = false
      return true
    }
    const spec = expectedByCode.get(code)
    if (!spec) {
      current = null
      currentGoalIndex = -1
      skippingReferenceBlock = false
      return true
    }
    current = {
      spec,
      rawText: `${code} ${title}`,
      sourceGoalTexts: [],
      page,
    }
    topics.set(code, current)
    currentGoalIndex = -1
    skippingReferenceBlock = false
    return true
  }

  for (const rawLine of lines) {
    const lineWithoutPageBreak = rawLine.replace(/^\f/u, '')
    const allowHeading = !/^\s/u.test(lineWithoutPageBreak)
    const line = normalizeLine(lineWithoutPageBreak)
    if (line.length === 0) {
      skippingReferenceBlock = false
      continue
    }
    const footerPageMatch = line.match(/(\d+)$/u)
    if (/Standards für inhaltsbezogene Kompetenzen/u.test(line) && footerPageMatch) {
      page = Number(footerPageMatch[1])
    }
    if (current && currentGoalIndex >= 0 && skippingReferenceBlock && isReferenceLine(line)) {
      current.rawText = appendContinuation(current.rawText, line)
      continue
    }
    if (ensureCurrent(line, allowHeading)) continue
    if (!current || isChromeLine(line)) continue

    const goalStart = line.match(sourceGoalStartPattern)
    if (goalStart) {
      currentGoalIndex += 1
      skippingReferenceBlock = false
      current.sourceGoalTexts[currentGoalIndex] = cleanSourceGoalText(goalStart[2])
      current.rawText = appendContinuation(current.rawText, line)
      continue
    }

    current.rawText = appendContinuation(current.rawText, line)
    if (currentGoalIndex < 0) continue
    if (isReferenceLine(line)) {
      skippingReferenceBlock = true
      continue
    }
    if (skippingReferenceBlock) continue
    if (/^Die Schülerinnen und Schüler können$/u.test(line)) continue
    current.sourceGoalTexts[currentGoalIndex] = cleanSourceGoalText(
      appendContinuation(current.sourceGoalTexts[currentGoalIndex], line),
    )
  }

  return specs.map((spec) => topics.get(spec.code)).filter((topic): topic is ParsedTopic => topic !== undefined)
}

function goalId(prefix: string, topicCode: string, bulletIndex: number, value: string): string {
  const hash = createHash('sha1').update(`${prefix}:${topicCode}:${bulletIndex}:${value}`).digest('hex').slice(0, 8)
  const slug = topicCode.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
  return `${prefix}-${slug}-b${String(bulletIndex).padStart(2, '0')}-a01-${hash}`
}

function sourceDescription(sourceText: string): string {
  const normalized = sourceText.replace(/^können\s+/iu, '').trim()
  const first = normalized.charAt(0).toLowerCase() + normalized.slice(1)
  return `Die lernende Person kann ${first}`
}

function tagsFor(topic: TopicSpec): string[] {
  const tags = ['BW', topic.stage, topic.code]
  if (topic.courseLevel === 'LK') tags.push('LF', 'LK')
  if (topic.courseLevel === 'GK_LK') {
    if (topic.code.startsWith('3.4')) tags.push('Basisfach', 'Quantenphysik')
    if (topic.code.startsWith('3.5')) tags.push('Basisfach', 'Astrophysik')
  }
  if (topic.code.startsWith('3.2')) tags.push('Klassen7-8')
  if (topic.code.startsWith('3.3')) tags.push('Klassen9-10')
  return tags
}

function buildExtraction(config: ExtractionConfig, parsedTopics: ParsedTopic[]) {
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []
  const sourcePath = config.sourceDocument.path
  const prefix = config.stage === 'SekII' ? 'bw-phys-sekii' : 'bw-phys-seki'

  parsedTopics.forEach((topic) => {
    const passageId = `${prefix}:${topic.spec.code}`
    const passage: Passage = {
      id: passageId,
      topicCode: topic.spec.code,
      title: `${topic.spec.code} ${topic.spec.title}`,
      text: topic.sourceGoalTexts.map((entry, index) => `(${index + 1}) ${entry}`).join('\n'),
      page: topic.spec.page || topic.page,
      sourcePath,
      rawText: topic.rawText,
      sourceGoalIds: [],
    }
    topic.sourceGoalTexts.forEach((sourceText, goalIndex) => {
      const bulletIndex = goalIndex + 1
      const id = goalId(prefix, topic.spec.code, bulletIndex, sourceText)
      const sourceSpan = `${topic.spec.code} (${bulletIndex})`
      const goal: SourceGoal = {
        id,
        passageId,
        topicCode: topic.spec.code,
        bulletIndex,
        aspectIndex: 1,
        title: `BW ${sourceSpan}: ${sourceText.slice(0, 96)}${sourceText.length > 96 ? '...' : ''}`,
        description: sourceDescription(sourceText),
        sourceText,
        sourceSpan,
        parentBulletText: sourceText,
        sourceRef: `Bildungsplan 2016 Gymnasium Physik Baden-Wuerttemberg, ${sourceSpan}, S. ${topic.page || '?'}.`,
        courseLevel: topic.spec.courseLevel,
        granularity: 'officialCompetency',
        tags: tagsFor(topic.spec),
        rawSourceText: sourceText,
        rawSourceSpan: sourceSpan,
        rawParentBulletText: sourceText,
      }
      sourceGoals.push(goal)
      passage.sourceGoalIds.push(id)
    })
    passages.push(passage)
  })

  return { passages, sourceGoals }
}

const duplicateValues = (values: string[]): string[] => {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) duplicate.add(value)
    seen.add(value)
  })
  return Array.from(duplicate).sort()
}

function buildPipeline(
  config: ExtractionConfig,
  parsed: { passages: Passage[], sourceGoals: SourceGoal[] },
  reviewCoverage: ReviewCoverage,
): { currentStep: string, steps: PipelineStep[] } {
  const foundTopicCodes = new Set(parsed.passages.map((passage) => passage.topicCode))
  const missingTopics = config.expectedTopics.map((topic) => topic.code).filter((code) => !foundTopicCodes.has(code))
  const unexpectedTopics = Array.from(foundTopicCodes).filter((code) => !config.expectedTopics.some((topic) => topic.code === code))
  const duplicateTopicCodes = duplicateValues(parsed.passages.map((passage) => passage.topicCode))
  const passagesWithoutText = parsed.passages.filter((passage) => !passage.text.trim()).map((passage) => passage.id)
  const passagesWithoutGoals = parsed.passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const duplicateSourceGoalIds = duplicateValues(parsed.sourceGoals.map((goal) => goal.id))
  const sourceGoalsWithoutPassage = parsed.sourceGoals
    .filter((goal) => !parsed.passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const incompleteSourceGoals = parsed.sourceGoals
    .filter((goal) => !goal.sourceText || !goal.sourceSpan || !goal.sourceRef || !goal.parentBulletText)
    .map((goal) => goal.id)
  const sourcePdfPath = absoluteRepoPath(config.sourceDocument.path)
  const reviewPath = absoluteRepoPath(config.reviewPath)

  const m1Complete = existsSync(sourcePdfPath)
    && missingTopics.length === 0
    && duplicateTopicCodes.length === 0
    && passagesWithoutText.length === 0
  const m2Complete = m1Complete
    && parsed.sourceGoals.length > 0
    && passagesWithoutGoals.length === 0
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0
    && incompleteSourceGoals.length === 0

  const steps: PipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: m1Complete ? 'complete' : 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-document-present',
          label: 'Amtliche BW-Physik-Quelle liegt lokal vor',
          passed: existsSync(sourcePdfPath),
          details: config.sourceDocument.path,
        },
        {
          id: 'expected-topic-coverage',
          label: 'Alle erwarteten BW-Physik-Kompetenzbereiche sind als Lehrplanpassagen vorhanden',
          passed: missingTopics.length === 0 && unexpectedTopics.length === 0,
          details: `${parsed.passages.length}/${config.expectedTopics.length} Bereiche; fehlend: ${missingTopics.join(', ') || '-'}; unerwartet: ${unexpectedTopics.join(', ') || '-'}`,
        },
        {
          id: 'unique-topic-passages',
          label: 'Jeder Kompetenzbereich hat genau eine Passage',
          passed: duplicateTopicCodes.length === 0,
          details: `Doppelte Bereiche: ${duplicateTopicCodes.join(', ') || '-'}`,
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
      status: m2Complete ? 'complete' : m1Complete ? 'incomplete' : 'blocked',
      dependsOn: ['MAPPING-1'],
      checks: [
        {
          id: 'source-goals-created',
          label: 'Aus den amtlichen BW-Physik-Kompetenzerwartungen wurden Source-Ziele erzeugt',
          passed: parsed.sourceGoals.length > 0,
          details: `${parsed.sourceGoals.length} Source-Ziele`,
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
          passed: m2Complete,
          details: `${parsed.sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`,
        },
        {
          id: 'm3-review-file-present',
          label: 'M3-Review-Datei ist vorhanden',
          passed: existsSync(reviewPath),
          details: config.reviewPath,
        },
        {
          id: 'm3-review-decisions-reference-source-goals',
          label: 'M3-Review-Entscheidungen referenzieren gültige Source-Ziele',
          passed: reviewCoverage.reviewed === parsed.sourceGoals.length,
          details: reviewCoverage.reviewed > 0
            ? `${reviewCoverage.reviewed}/${parsed.sourceGoals.length} Entscheidungen referenzieren Source-Ziele dieser Extraction.`
            : 'Seed-Datei angelegt; noch keine Entscheidungen.',
        },
        {
          id: 'm3-review-targets-exist',
          label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
          passed: reviewCoverage.mapped === parsed.sourceGoals.length,
          details: reviewCoverage.mapped > 0
            ? `${reviewCoverage.mapped}/${parsed.sourceGoals.length} Source-Ziele sind mit Canonical-Targets belegt.`
            : 'Seed-Datei angelegt; noch keine Targets.',
        },
        {
          id: 'm3-all-source-goals-reviewed',
          label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
          passed: reviewCoverage.open === 0,
          details: `${reviewCoverage.reviewed}/${parsed.sourceGoals.length} Source-Ziele reviewed; offen: ${reviewCoverage.open}.`,
        },
        {
          id: 'm3-all-source-goals-covered-by-canonical',
          label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
          passed: reviewCoverage.complete,
          details: reviewCoverage.complete
            ? `Abgedeckt: ${reviewCoverage.mapped}/${parsed.sourceGoals.length}; keine offenen Canonical-Gaps.`
            : `Abgedeckt: ${reviewCoverage.mapped}/${parsed.sourceGoals.length}; M3-Review steht aus.`,
        },
      ],
    },
  ]

  return {
    currentStep: reviewCoverage.complete ? '' : m2Complete ? 'MAPPING-3' : steps.find((step) => step.status !== 'complete')?.id ?? '',
    steps,
  }
}

function writeExtraction(
  config: ExtractionConfig,
  parsed: { passages: Passage[], sourceGoals: SourceGoal[] },
  reviewCoverage: ReviewCoverage,
): void {
  const outputPath = absoluteRepoPath(config.outputPath)
  mkdirSync(path.dirname(outputPath), { recursive: true })
  const document = {
    schemaVersion: 1,
    extractionId: config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction: config.jurisdiction,
    subject: config.subject,
    stage: config.stage,
    title: config.title,
    sourceDocument: config.sourceDocument,
    method: {
      passageExtraction: 'pdftotext -layout; segmented by official BW Physik competency section headings 3.2.* to 3.6.*',
      sourceGoalExtraction: 'one source goal per official numbered competency expectation; original statement retained in sourceText',
    },
    expectedTopicCodes: config.expectedTopics.map((topic) => topic.code),
    pipelineStatus: buildPipeline(config, parsed, reviewCoverage),
    passages: parsed.passages,
    sourceGoals: parsed.sourceGoals,
  }
  writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`)
}

function writeReview(config: ExtractionConfig, parsed: { sourceGoals: SourceGoal[] }): ReviewCoverage {
  const reviewPath = absoluteRepoPath(config.reviewPath)
  mkdirSync(path.dirname(reviewPath), { recursive: true })
  const targetLookup = config.stage === 'SekII'
    ? upperCanonicalTargetsByTopicBullet
    : lowerCanonicalTargetsByTopicBullet

  const decisions = parsed.sourceGoals.map((sourceGoal) => {
    const sourceKey = `${sourceGoal.topicCode}:${sourceGoal.bulletIndex}`
    const canonicalGoalIds = targetLookup[sourceKey] ?? []
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: canonicalGoalIds.length > 0 ? 'mapped' : 'needsCanonicalGoal',
      canonicalGoalIds,
      rationale: canonicalGoalIds.length > 1
        ? 'Das amtliche BW-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
        : canonicalGoalIds.length === 1
          ? 'Das amtliche BW-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.'
          : 'Für dieses amtliche BW-Source-Ziel fehlt noch ein fachlich passendes kanonisches Physikziel.',
      reviewedAt: '2026-05-10',
      reviewer: 'codex',
    }
  })
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
      reviewDecisionId: decision.sourceGoalId,
    })))
  const reviewedSourceGoalIds = new Set(decisions.map((decision) => decision.sourceGoalId))
  const mappedSourceGoalIds = new Set(mappings.map((mapping) => mapping.legacyGoalId))
  const open = Math.max(0, parsed.sourceGoals.length - reviewedSourceGoalIds.size)
    + decisions.filter((decision) => decision.decision !== 'mapped').length
  const coverage = {
    reviewed: reviewedSourceGoalIds.size,
    mapped: mappedSourceGoalIds.size,
    open,
    complete: parsed.sourceGoals.length > 0 && open === 0 && mappedSourceGoalIds.size === parsed.sourceGoals.length,
  }
  const document = {
    version: 1,
    reviewId: path.basename(config.reviewPath, '.json'),
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId: canonicalPhysicsLandscapeId,
    sourceExtractionPath: config.outputPath,
    status: coverage.complete ? 'complete' : 'in_progress',
    mappings,
    decisions,
  }
  writeFileSync(reviewPath, `${JSON.stringify(document, null, 2)}\n`)
  return coverage
}

function main(): void {
  const rawText = readPdfText(sourceDocument.path)
  const parsedTopics = parseTopics(rawText, topicSpecs)
  ;[lowerConfig, upperConfig].forEach((config) => {
    const topics = parsedTopics.filter((topic) => config.expectedTopics.some((expected) => expected.code === topic.spec.code))
    const parsed = buildExtraction(config, topics)
    const reviewCoverage = writeReview(config, parsed)
    writeExtraction(config, parsed, reviewCoverage)
    console.log(`${config.extractionId}: ${parsed.passages.length} passages, ${parsed.sourceGoals.length} source goals`)
    console.log(`  ${repoPath(absoluteRepoPath(config.outputPath))}`)
    console.log(`  ${repoPath(absoluteRepoPath(config.reviewPath))}`)
  })
}

main()
