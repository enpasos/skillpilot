import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const sourcePdfRelativePath = 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf'
const candidateRelativePath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/aeae-k6-source-assessment-candidate-20260927-v1/DE_HE_MATHEMATIK_SEKII_KC2024_PROCESS_K6.candidate.source-extraction.json'
const sourcePdfPath = path.join(repoRoot, sourcePdfRelativePath)
const candidatePath = path.join(repoRoot, candidateRelativePath)
const expectedPdfSha256 = 'd53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953'
const sourceUrl = 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf'
const sourceDocument = {
  key: 'KC_GOS_2024',
  title: 'Kerncurriculum gymnasiale Oberstufe - Mathematik',
  path: sourcePdfRelativePath,
  role: 'binding-upper-secondary-core-2024',
  official: true,
  url: sourceUrl,
}

const expectedDefinition = 'Zu dieser Kompetenz gehören sowohl das Entnehmen von Informationen aus schriftlichen Texten, mündlichen Äußerungen oder sonstigen Quellen als auch das Darlegen von Überlegungen und Resultaten unter Verwendung einer angemessenen Fachsprache. Das Spektrum reicht von der direkten Informationsentnahme aus Texten des Alltagsgebrauchs beziehungsweise vom Aufschreiben einfacher Lösungswege bis hin zum sinnentnehmenden Erfassen fachsprachlicher Texte beziehungsweise zur strukturierten Darlegung oder Präsentation eigener Überlegungen. Das Erfüllen sprachlicher Anforderungen spielt bei dieser Kompetenz eine besondere Rolle.'

const expectedStandards = [
  { id: 'K6.1', level: 'AB1', text: 'einfache mathematische Sachverhalte darlegen,' },
  { id: 'K6.2', level: 'AB1', text: 'Informationen aus kurzen Texten mit mathematischem Gehalt identifizieren und auswählen, wobei die Ordnung der Informationen im Text die Schritte der mathematischen Bearbeitung nahelegt.' },
  { id: 'K6.3', level: 'AB2', text: 'mehrschrittige Lösungswege, Überlegungen und Ergebnisse verständlich darlegen,' },
  { id: 'K6.4', level: 'AB2', text: 'Äußerungen (auch fehlerhafte) anderer Personen zu mathematischen Aussagen interpretieren,' },
  { id: 'K6.5', level: 'AB2', text: 'mathematische Informationen aus Texten identifizieren und auswählen, wobei die Ordnung der Informationen nicht unmittelbar den Schritten der mathematischen Bearbeitung entsprechen muss.' },
  { id: 'K6.6', level: 'AB3', text: 'eine komplexe mathematische Lösung oder Argumentation kohärent und vollständig darlegen oder präsentieren,' },
  { id: 'K6.7', level: 'AB3', text: 'mathematische Fachtexte sinnentnehmend erfassen,' },
  { id: 'K6.8', level: 'AB3', text: 'mündliche und schriftliche Äußerungen anderer Personen mit mathematischem Gehalt miteinander vergleichen, sie bewerten und ggf. korrigieren.' },
]

function requireSource(condition, message) {
  if (!condition) throw new Error('HE K6 source extraction: ' + message)
}

function normalizeWrappedText(raw) {
  return raw
    .replace(/(\p{L})-\s*\n\s*(\p{Ll})/gu, '$1$2')
    .replace(/\s+/gu, ' ')
    .trim()
    .normalize('NFC')
}

function requirePrintedPage(text, number) {
  requireSource(
    new RegExp('\\n\\s*' + number + '\\s*\\f\\s*$', 'u').test(text),
    'expected printed page ' + number + ' at the end of the extracted page',
  )
  requireSource(text.includes('Kerncurriculum') && text.includes('gymnasiale Oberstufe'),
    'missing document header on printed page ' + number)
}

function extractDefinition(page14, page15) {
  requirePrintedPage(page14, 14)
  requirePrintedPage(page15, 15)
  const marker = 'Mathematisch kommunizieren (K6)'
  requireSource(page14.split(marker).length === 2, 'K6 definition heading must occur exactly once on page 14')
  const page14Tail = page14.split(marker)[1]
  const page14Body = page14Tail.replace(/\n\s*14\s*\f\s*$/u, '').trim()
  const headerEnd = page15.indexOf('gymnasiale Oberstufe')
  requireSource(headerEnd >= 0, 'missing page 15 document header')
  const page15Tail = page15.slice(headerEnd + 'gymnasiale Oberstufe'.length)
  const nextHeading = 'Kompetenzerwerb in fachübergreifenden und fächerverbindenden Zusammenhängen'
  requireSource(page15Tail.split(nextHeading).length === 2,
    'K6 definition continuation must end at the following heading on page 15')
  const page15Body = page15Tail.split(nextHeading)[0].trim()
  const rawText = page14Body + '\n' + page15Body
  const text = normalizeWrappedText(rawText)
  requireSource(text === expectedDefinition, 'K6 definition text on pages 14–15 changed')
  return { rawText, text }
}

function extractStandards(page24) {
  requirePrintedPage(page24, 24)
  const marker = 'Kompetenzbereich: Mathematisch kommunizieren (K6)'
  requireSource(page24.split(marker).length === 2, 'K6 standards heading must occur exactly once on page 24')
  const rawText = page24.split(marker)[1].replace(/\n\s*24\s*\f\s*$/u, '').trim()
  const lines = rawText.split(/\n/u).map((line) => line.trim()).filter(Boolean)
  const entries = []
  const seenHeadings = []
  let level = ''
  let current = null
  let expectsLead = false

  const finish = () => {
    if (!current) return
    current.text = normalizeWrappedText(current.rawLines.join('\n'))
    current.rawSourceText = current.id + '  ' + current.rawLines.join('\n')
    entries.push(current)
    current = null
  }

  for (const line of lines) {
    const heading = /^Anforderungsbereich (I|II|III)$/u.exec(line)
    if (heading) {
      finish()
      seenHeadings.push(heading[1])
      level = { I: 'AB1', II: 'AB2', III: 'AB3' }[heading[1]]
      expectsLead = true
      continue
    }
    if (line === 'Die Lernenden können') {
      requireSource(expectsLead, 'unexpected or duplicate standard lead line')
      expectsLead = false
      continue
    }
    const standard = /^(K6\.[1-8])\s+\s+(.+)$/u.exec(line)
    if (standard) {
      requireSource(level !== '' && !expectsLead, 'standard appears outside a complete AB section')
      finish()
      current = { id: standard[1], level, rawLines: [standard[2]] }
      continue
    }
    requireSource(current !== null && !expectsLead,
      'unrecognized content in K6 standards block: ' + line)
    current.rawLines.push(line)
  }
  finish()
  requireSource(JSON.stringify(seenHeadings) === JSON.stringify(['I', 'II', 'III']),
    'expected AB I, II, III headings exactly once and in order')
  requireSource(entries.length === expectedStandards.length,
    'expected exactly eight K6 standards')
  entries.forEach((entry, index) => {
    const expected = expectedStandards[index]
    requireSource(entry.id === expected.id, 'missing, duplicate, or out-of-order standard ' + expected.id)
    requireSource(entry.level === expected.level, 'wrong demand level for ' + entry.id)
    requireSource(entry.text === expected.text, 'official wording changed for ' + entry.id)
  })
  return { rawText, entries }
}

export function parseHeMathSekiiK6ProcessPages({ page14, page15, page24 }) {
  const definition = extractDefinition(page14, page15)
  const standards = extractStandards(page24)
  const definitionId = 'he-math-sekii-process:k6:definition'
  const standardsId = 'he-math-sekii-process:k6:standards'
  const sourceGoals = standards.entries.map((entry, index) => {
    const sourceSpan = entry.text.replace(/[,.]$/u, '')
    return {
      id: 'he-math-sekii-process-k6-' + (index + 1),
      passageId: standardsId,
      topicCode: 'K6',
      standardId: entry.id,
      demandLevel: entry.level,
      bulletIndex: index + 1,
      aspectIndex: 1,
      title: entry.id + ' – ' + sourceSpan,
      description: 'Die Lernenden können ' + sourceSpan + '.',
      sourceText: entry.text,
      rawSourceText: entry.rawSourceText,
      sourceSpan,
      rawSourceSpan: entry.rawLines.join('\n'),
      parentBulletText: entry.text,
      sourceRef: 'HMKB Kerncurriculum Mathematik gymnasiale Oberstufe, Kompetenzbereich K6, S. 24, ' + entry.id + ', Anforderungsbereich ' + { AB1: 'I', AB2: 'II', AB3: 'III' }[entry.level],
      sourcePage: 24,
      sourceDocumentKey: sourceDocument.key,
      courseLevel: 'GK_LK',
      granularity: 'officialStandard',
      tags: ['source-goal', 'process:K6', 'standard:' + entry.id, entry.level, 'GK', 'LK'],
    }
  })
  const passages = [
    {
      id: definitionId,
      topicCode: 'K6.definition',
      title: 'Mathematisch kommunizieren (K6): Kompetenzbeschreibung',
      text: definition.text,
      rawText: definition.rawText,
      page: 14,
      pageEnd: 15,
      sourceRef: 'HMKB Kerncurriculum Mathematik gymnasiale Oberstufe, Mathematisch kommunizieren (K6), S. 14–15',
      sourcePath: sourcePdfRelativePath,
      sourceDocumentKey: sourceDocument.key,
      sourceGoalIds: [],
    },
    {
      id: standardsId,
      topicCode: 'K6',
      title: 'Mathematisch kommunizieren (K6): K6.1–K6.8',
      text: ['Kompetenzbereich: Mathematisch kommunizieren (K6)',
        ...standards.entries.map((entry) => entry.id + ' [' + entry.level + '] – ' + entry.text)].join('\n'),
      rawText: markerText(standards.rawText),
      page: 24,
      sourceRef: 'HMKB Kerncurriculum Mathematik gymnasiale Oberstufe, Kompetenzbereich K6, S. 24',
      sourcePath: sourcePdfRelativePath,
      sourceDocumentKey: sourceDocument.key,
      sourceGoalIds: sourceGoals.map((goal) => goal.id),
    },
  ]
  requireSource(new Set(sourceGoals.map((goal) => goal.id)).size === 8,
    'source-goal IDs must be unique')
  return {
    schemaVersion: 1,
    extractionId: 'DE-HE-MATHEMATIK-SEKII-KC2024-PROCESS-K6-CANDIDATE',
    sourceLandscapeId: '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3',
    jurisdiction: 'DE-HE',
    subject: 'Mathematik',
    stage: 'SekII',
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      passageExtraction: 'pdftotext -f 14 -l 15 and -f 24 -l 24 -layout; exact K6 definition and K6.1–K6.8 wording and AB boundaries checked against pinned PDF',
      sourceGoalExtraction: 'one source goal per official K6 standard; raw PDF text retained separately from normalized text',
      localPdfSha256: expectedPdfSha256,
    },
    expectedProcessStandardIds: expectedStandards.map((standard) => standard.id),
    pipelineStatus: {
      version: 1,
      currentStep: 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Amtliche K6-Passagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            { id: 'k6-context-pages', label: 'K6-Definition vollständig auf S. 14–15', passed: true, details: 'Wortlaut und Seitenmarker geprüft' },
            { id: 'k6-standard-page', label: 'K6-Standards auf S. 24', passed: true, details: 'Acht Standards und AB-Grenzen geprüft' },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'K6.1–K6.8 als Source-Ziele erzeugt',
          status: 'complete',
          dependsOn: ['MAPPING-1'],
          checks: [
            { id: 'k6-source-goals', label: 'Acht eindeutige Source-Ziele mit Quellenspan', passed: true, details: '8/8; keine kanonischen Ziele erzeugt' },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Fachliches Mapping auf kanonische Ziele',
          status: 'incomplete',
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            { id: 'k6-mapping-review', label: 'Separate Mapping-Collection fachlich geprüft', passed: false, details: 'Kandidat; noch keine Mapping-Collection oder Publikationsprofil-Bindung' },
          ],
        },
      ],
    },
    passages,
    sourceGoals,
  }
}

function markerText(rawText) {
  return 'Kompetenzbereich: Mathematisch kommunizieren (K6)\n' + rawText
}

function pageText(page) {
  return execFileSync('pdftotext', ['-f', String(page), '-l', String(page), '-layout', sourcePdfPath, '-'],
    { encoding: 'utf8' })
}

export function verifyHeMathSekiiK6PdfDigest(pdfBytes) {
  const digest = createHash('sha256').update(pdfBytes).digest('hex')
  requireSource(digest === expectedPdfSha256,
    'official PDF digest changed; inspect the new source before regenerating')
  return digest
}

export function buildHeMathSekiiK6ProcessExtraction() {
  verifyHeMathSekiiK6PdfDigest(readFileSync(sourcePdfPath))
  return parseHeMathSekiiK6ProcessPages({
    page14: pageText(14),
    page15: pageText(15),
    page24: pageText(24),
  })
}

function main() {
  const args = process.argv.slice(2)
  requireSource(args.length === 1 && ['--write', '--check'].includes(args[0]),
    'usage: node app/scripts/generateHeMathSekiiK6ProcessSourceExtraction.mjs --write|--check')
  const rendered = JSON.stringify(buildHeMathSekiiK6ProcessExtraction(), null, 2) + '\n'
  if (args[0] === '--check') {
    requireSource(readFileSync(candidatePath, 'utf8') === rendered,
      'candidate extraction differs from the pinned official PDF')
    console.log('HE K6 candidate extraction matches the official PDF: 2 passages, 8 source goals')
    return
  }
  mkdirSync(path.dirname(candidatePath), { recursive: true })
  writeFileSync(candidatePath, rendered)
  console.log('Wrote ' + candidateRelativePath + ': 2 passages, 8 source goals; MAPPING-3 remains open')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
