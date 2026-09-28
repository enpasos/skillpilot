// SPDX-License-Identifier: Apache-2.0
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const sourcePdfRelativePath = 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf'
const candidateRelativePath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/k3-process-source-candidate-20260927-v1/DE_HE_MATHEMATIK_SEKII_KC2024_PROCESS_K3.candidate.source-extraction.json'
const sourcePdfPath = path.join(repoRoot, sourcePdfRelativePath)
const candidatePath = path.join(repoRoot, candidateRelativePath)
const expectedPdfSha256 = 'd53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953'
const sourceDocument = {
  key: 'KC_GOS_2024',
  title: 'Kerncurriculum gymnasiale Oberstufe - Mathematik',
  path: sourcePdfRelativePath,
  role: 'binding-upper-secondary-core-2024',
  official: true,
  url: 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf',
  rightsNote: 'Official HMKB source and excerpts retain third-party rights; no SkillPilot license or redistribution clearance is asserted.',
}

const expectedDefinition = 'Diese Kompetenz umfasst den Wechsel zwischen Realsituationen und mathematischen Begriffen, Resultaten oder Methoden. Hierzu gehört sowohl das Konstruieren passender mathematischer Modelle als auch das Verstehen oder Bewerten vorgegebener Modelle. Typische Teilschritte des Modellierens sind das Strukturieren und Vereinfachen gegebener Realsituationen, das Übersetzen realer Gegebenheiten in mathematische Modelle, das Interpretieren mathematischer Ergebnisse in Bezug auf Realsituationen und das Überprüfen von Ergebnissen im Hinblick auf Stimmigkeit und Angemessenheit bezogen auf die Realsituation. Das Spektrum reicht von Standardmodellen (zum Beispiel bei linearen Zusammenhängen) bis hin zu komplexen Modellierungen.'
const expectedStandards = [
  { id: 'K3.1', level: 'AB1', text: 'vertraute und direkt erkennbare Modelle anwenden,' },
  { id: 'K3.2', level: 'AB1', text: 'eine Realsituation direkt in ein mathematisches Modell überführen,' },
  { id: 'K3.3', level: 'AB1', text: 'ein mathematisches Resultat auf eine gegebene Realsituation übertragen.' },
  { id: 'K3.4', level: 'AB2', text: 'mehrschrittige Modellierungen mit wenigen und klar formulierten Einschränkungen vornehmen,' },
  { id: 'K3.5', level: 'AB2', text: 'Ergebnisse einer solchen Modellierung interpretieren,' },
  { id: 'K3.6', level: 'AB2', text: 'ein mathematisches Modell an veränderte Umstände anpassen.' },
  { id: 'K3.7', level: 'AB3', text: 'eine komplexe Realsituation modellieren, wobei Variablen und Bedingungen festgelegt werden müssen,' },
  { id: 'K3.8', level: 'AB3', text: 'mathematische Modelle im Kontext einer Realsituation überprüfen, vergleichen und bewerten.' },
]

function requireSource(condition, message) {
  if (!condition) throw new Error('HE K3 source extraction: ' + message)
}

function normalizeWrappedText(raw) {
  return raw
    .replace(/(\p{L})-\s*\n\s*(\p{Ll})/gu, '$1$2')
    .replace(/\s+/gu, ' ')
    .trim()
    .normalize('NFC')
}

function requirePrintedPage(text, number) {
  requireSource(new RegExp('\\n\\s*' + number + '\\s*\\f\\s*$', 'u').test(text),
    'expected printed page ' + number + ' at the end of the extracted page')
  requireSource(text.includes('Kerncurriculum') && text.includes('gymnasiale Oberstufe'),
    'missing document header on printed page ' + number)
}

function extractDefinition(page14) {
  requirePrintedPage(page14, 14)
  const marker = 'Mathematisch modellieren (K3)'
  const nextHeading = 'Mathematische Darstellungen verwenden (K4)'
  requireSource(page14.split(marker).length === 2,
    'K3 definition heading must occur exactly once on page 14')
  const afterMarker = page14.split(marker)[1]
  requireSource(afterMarker.split(nextHeading).length === 2,
    'K3 definition must end at the K4 heading on page 14')
  const rawText = afterMarker.split(nextHeading)[0].trim()
  const text = normalizeWrappedText(rawText)
  requireSource(text === expectedDefinition, 'K3 definition wording on page 14 changed')
  return { rawText, text }
}

function extractStandards(page22) {
  requirePrintedPage(page22, 22)
  const marker = 'Kompetenzbereich: Mathematisch modellieren (K3)'
  requireSource(page22.split(marker).length === 2,
    'K3 standards heading must occur exactly once on page 22')
  const rawText = page22.split(marker)[1].replace(/\n\s*22\s*\f\s*$/u, '').trim()
  const lines = rawText.split(/\n/u)
    .map((raw) => ({ raw, line: raw.trim() }))
    .filter(({ line }) => Boolean(line))
  const headings = []
  const entries = []
  let level = ''
  let expectsLead = false
  let current = null

  const finish = () => {
    if (!current) return
    current.text = normalizeWrappedText(current.contentLines.join('\n'))
    current.rawSourceText = current.rawLines.join('\n')
    current.rawSourceSpan = [current.contentLines[0], ...current.rawLines.slice(1)].join('\n')
    entries.push(current)
    current = null
  }

  for (const { raw, line } of lines) {
    const heading = /^Anforderungsbereich (I|II|III)$/u.exec(line)
    if (heading) {
      finish()
      headings.push(heading[1])
      level = { I: 'AB1', II: 'AB2', III: 'AB3' }[heading[1]]
      expectsLead = true
      continue
    }
    if (line === 'Die Lernenden können') {
      requireSource(expectsLead, 'unexpected or duplicate standard lead line')
      expectsLead = false
      continue
    }
    const standard = /^(K3\.[1-8])\s+\s+(.+)$/u.exec(line)
    if (standard) {
      requireSource(level !== '' && !expectsLead, 'standard appears outside a complete AB section')
      finish()
      current = { id: standard[1], level, contentLines: [standard[2]], rawLines: [raw] }
      continue
    }
    requireSource(current !== null && !expectsLead,
      'unrecognized content in K3 standards block: ' + line)
    current.contentLines.push(line)
    current.rawLines.push(raw)
  }
  finish()
  requireSource(JSON.stringify(headings) === JSON.stringify(['I', 'II', 'III']),
    'expected AB I, II, III headings exactly once and in order')
  requireSource(entries.length === expectedStandards.length, 'expected exactly eight K3 standards')
  entries.forEach((entry, index) => {
    const expected = expectedStandards[index]
    requireSource(entry.id === expected.id, 'missing, duplicate, or out-of-order standard ' + expected.id)
    requireSource(entry.level === expected.level, 'wrong demand level for ' + entry.id)
    requireSource(entry.text === expected.text, 'official wording changed for ' + entry.id)
  })
  return { rawText, entries }
}

export function parseHeMathSekiiK3ProcessPages({ page14, page22 }) {
  const definition = extractDefinition(page14)
  const standards = extractStandards(page22)
  const definitionId = 'he-math-sekii-process:k3:definition'
  const standardsId = 'he-math-sekii-process:k3:standards'
  const sourceGoals = standards.entries.map((entry, index) => {
    const sourceSpan = entry.text.replace(/[,.]$/u, '')
    return {
      id: 'he-math-sekii-process-k3-' + (index + 1),
      passageId: standardsId,
      topicCode: 'K3',
      standardId: entry.id,
      demandLevel: entry.level,
      bulletIndex: index + 1,
      aspectIndex: 1,
      title: entry.id + ' – ' + sourceSpan,
      description: 'Die Lernenden können ' + sourceSpan + '.',
      sourceText: entry.text,
      rawSourceText: entry.rawSourceText,
      sourceSpan,
      rawSourceSpan: entry.rawSourceSpan,
      parentBulletText: entry.text,
      sourceRef: 'HMKB Kerncurriculum Mathematik gymnasiale Oberstufe, Kompetenzbereich K3, S. 22, ' + entry.id + ', Anforderungsbereich ' + { AB1: 'I', AB2: 'II', AB3: 'III' }[entry.level],
      sourcePage: 22,
      sourceDocumentKey: sourceDocument.key,
      courseLevel: 'GK_LK',
      granularity: 'officialStandard',
      tags: ['source-goal', 'process:K3', 'standard:' + entry.id, entry.level, 'GK', 'LK'],
    }
  })
  requireSource(new Set(sourceGoals.map((goal) => goal.id)).size === 8,
    'source-goal IDs must be unique')
  const passages = [
    {
      id: definitionId,
      topicCode: 'K3.definition',
      title: 'Mathematisch modellieren (K3): Kompetenzbeschreibung',
      text: definition.text,
      rawText: definition.rawText,
      page: 14,
      sourceRef: 'HMKB Kerncurriculum Mathematik gymnasiale Oberstufe, Mathematisch modellieren (K3), S. 14',
      sourcePath: sourcePdfRelativePath,
      sourceDocumentKey: sourceDocument.key,
      sourceGoalIds: [],
    },
    {
      id: standardsId,
      topicCode: 'K3',
      title: 'Mathematisch modellieren (K3): K3.1–K3.8',
      text: ['Kompetenzbereich: Mathematisch modellieren (K3)',
        ...standards.entries.map((entry) => entry.id + ' [' + entry.level + '] – ' + entry.text)].join('\n'),
      rawText: 'Kompetenzbereich: Mathematisch modellieren (K3)\n' + standards.rawText,
      page: 22,
      sourceRef: 'HMKB Kerncurriculum Mathematik gymnasiale Oberstufe, Kompetenzbereich K3, S. 22',
      sourcePath: sourcePdfRelativePath,
      sourceDocumentKey: sourceDocument.key,
      sourceGoalIds: sourceGoals.map((goal) => goal.id),
    },
  ]
  return {
    schemaVersion: 1,
    extractionId: 'DE-HE-MATHEMATIK-SEKII-KC2024-PROCESS-K3-CANDIDATE',
    sourceLandscapeId: '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3',
    jurisdiction: 'DE-HE',
    subject: 'Mathematik',
    stage: 'SekII',
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      passageExtraction: 'pdftotext -f 14 -l 14 and -f 22 -l 22 -layout; exact K3 definition and K3.1–K3.8 wording and AB boundaries checked against pinned PDF',
      sourceGoalExtraction: 'one source goal per official K3 standard; raw PDF text retained separately from normalized text',
      localPdfSha256: expectedPdfSha256,
    },
    expectedProcessStandardIds: expectedStandards.map((standard) => standard.id),
    pipelineStatus: {
      version: 1,
      currentStep: 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Amtliche K3-Passagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            { id: 'k3-context-page', label: 'K3-Definition vollständig auf S. 14', passed: true, details: 'Wortlaut und Seitenmarker geprüft' },
            { id: 'k3-standard-page', label: 'K3-Standards auf S. 22', passed: true, details: 'Acht Standards und AB-Grenzen geprüft' },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'K3.1–K3.8 als Source-Ziele erzeugt',
          status: 'complete',
          dependsOn: ['MAPPING-1'],
          checks: [
            { id: 'k3-source-goals', label: 'Acht eindeutige Source-Ziele mit Quellenspan', passed: true, details: '8/8; keine kanonischen Ziele erzeugt' },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Fachliches Mapping auf kanonische Ziele',
          status: 'incomplete',
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            { id: 'k3-mapping-review', label: 'Separate Mapping-Collection fachlich geprüft', passed: false, details: 'Kandidat; noch keine Mapping-Collection oder Publikationsprofil-Bindung' },
          ],
        },
      ],
    },
    passages,
    sourceGoals,
  }
}

export function verifyHeMathSekiiK3PdfDigest(pdfBytes) {
  const digest = createHash('sha256').update(pdfBytes).digest('hex')
  requireSource(digest === expectedPdfSha256,
    'official PDF digest changed; inspect the new source before regenerating')
  return digest
}

function pageText(page) {
  return execFileSync('pdftotext', ['-f', String(page), '-l', String(page), '-layout', sourcePdfPath, '-'],
    { encoding: 'utf8' })
}

export function buildHeMathSekiiK3ProcessExtraction() {
  verifyHeMathSekiiK3PdfDigest(readFileSync(sourcePdfPath))
  return parseHeMathSekiiK3ProcessPages({ page14: pageText(14), page22: pageText(22) })
}

function main() {
  const args = process.argv.slice(2)
  requireSource(args.length === 1 && ['--write', '--check'].includes(args[0]),
    'usage: node app/scripts/generateHeMathSekiiK3ProcessSourceExtraction.mjs --write|--check')
  const rendered = JSON.stringify(buildHeMathSekiiK3ProcessExtraction(), null, 2) + '\n'
  if (args[0] === '--check') {
    requireSource(readFileSync(candidatePath, 'utf8') === rendered,
      'candidate extraction differs from the pinned official PDF')
    console.log('HE K3 candidate extraction matches the official PDF: 2 passages, 8 source goals')
    return
  }
  mkdirSync(path.dirname(candidatePath), { recursive: true })
  writeFileSync(candidatePath, rendered)
  console.log('Wrote ' + candidateRelativePath + ': 2 passages, 8 source goals; MAPPING-3 remains open')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
