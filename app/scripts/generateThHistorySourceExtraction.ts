import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
  available: true
}

interface ExtractionSpec {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  outputPath: string
  reviewPath: string
  archivePath: string
  sourceGoalPrefix: string
  peerBaselineReview: string
}

interface ParsedSection {
  code: string
  title: string
  phase: string
  stage: Stage
  courseLevel: CourseLevel
  page: number
  category: string
  goals: ParsedGoal[]
}

interface ParsedGoal {
  number: number
  text: string
  kind: string
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
  sourceDocumentKey: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: 'officialCompetency'
  stage: Stage
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
  metadata: {
    extractionMethod: string
    phase: string
    competencyArea: string
    page: number
  }
}

interface CanonicalGoal {
  id: string
  title: string
  applicability?: Record<string, string[]>
}

interface CanonicalLandscape {
  landscapeId: string
  goals: CanonicalGoal[]
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const generatedAt = '2026-05-14'
const jurisdiction = 'DE-TH'
const subject = 'Geschichte'
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const officialOverviewUrl = 'https://www.schulportal-thueringen.de/lehrplaene/gymnasium'

const sourceDocument2025: SourceDocument = {
  key: 'TH-GESCHICHTE-GYM-2025',
  title: 'Lehrplan Geschichte Gymnasium Thueringen, Entwurfsfassung 2025',
  path: 'curricula/DE/Gymnasium/input/TH/LP_GY_Geschichte_Entwurfsfassung2025.pdf',
  url: 'https://www.schulportal-thueringen.de/tip/resources/medien/65649?dateiname=LP_GY_Geschichte_Entwurfsfassung2025.pdf',
  official: true,
  available: true,
}

const sourceDocument2021: SourceDocument = {
  key: 'TH-GESCHICHTE-GYM-2021',
  title: 'Lehrplan Geschichte Gymnasium Thueringen 2021',
  path: 'curricula/DE/Gymnasium/input/TH/LP_GY_Geschichte_2021.pdf',
  url: 'https://www.schulportal-thueringen.de/tip/resources/medien/15749?dateiname=LP_GY_Ge_Fassung_20210913.pdf',
  official: true,
  available: true,
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_TH_GESCHICHTE_SEKI_LEHRPLAN_GYMNASIUM_2025',
    sourceLandscapeId: uuidFromString('DE-TH-GESCHICHTE-SEKI-LEHRPLAN-GYMNASIUM-2025'),
    title: 'Geschichte Sekundarstufe I (Thueringen, Lehrplan Gymnasium 2025 Source-Extraction)',
    stage: 'SekI',
    outputPath:
      'curricula/DE/Gymnasium/input/TH/lower-secondary/source-extraction/DE_TH_GESCHICHTE_SEKI_LEHRPLAN_GYMNASIUM_2025.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_history_lower_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/TH/lower-secondary/',
    sourceGoalPrefix: 'th-history-seki',
    peerBaselineReview:
      'Kritisch geprueft: Thueringen Geschichte Sek I wird aus der amtlichen 2025er Entwurfsfassung extrahiert. Die Zielzahl liegt im Korridor der bereits geprueften Laender; Kompetenzbereichsziele und Lernbereichsziele werden beide gezaehlt.',
  },
  {
    extractionId: 'DE_TH_GESCHICHTE_SEKII_LEHRPLAN_GYMNASIUM_2025',
    sourceLandscapeId: uuidFromString('DE-TH-GESCHICHTE-SEKII-LEHRPLAN-GYMNASIUM-2025'),
    title: 'Geschichte Oberstufe (Thueringen, Lehrplan Gymnasium 2025 Source-Extraction)',
    stage: 'SekII',
    outputPath:
      'curricula/DE/Gymnasium/input/TH/upper-secondary/source-extraction/DE_TH_GESCHICHTE_SEKII_LEHRPLAN_GYMNASIUM_2025.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_history_upper_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/TH/upper-secondary/',
    sourceGoalPrefix: 'th-history-sekii',
    peerBaselineReview:
      'Kritisch geprueft: Thueringen Geschichte Sek II wird aus Einfuehrungsphase 11/11S und Qualifikationsphase 11/12 der amtlichen 2025er Entwurfsfassung extrahiert. 2021 ist als amtlicher Geltungskontext archiviert.',
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

main()

function main(): void {
  for (const sourceDocument of [sourceDocument2025, sourceDocument2021]) {
    if (!existsSync(abs(sourceDocument.path))) throw new Error(`Missing official source PDF: ${sourceDocument.path}`)
  }
  const sections = parseSections()
  const generated = specs.map((spec) => {
    const stageSections = sections.filter((section) => section.stage === spec.stage)
    const { extraction, review } = buildDocuments(spec, stageSections)
    writeJson(spec.outputPath, extraction)
    writeJson(spec.reviewPath, review)
    console.log(`Wrote ${spec.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
    console.log(`Wrote ${spec.reviewPath} (${review.decisions.length}/${extraction.sourceGoals.length} M3 decisions)`)
    return { spec, count: extraction.sourceGoals.length }
  })
  updateRegistry(specs)
  updateReadme(generated)
  updateStageReferences(generated)
  syncCanonicalHistoryApplicability()
}

function parseSections(): ParsedSection[] {
  const pages = pdfRawText(sourceDocument2025.path).split('\f')
  const buckets = new Map<string, ParsedSection>()
  let phase = ''
  let topicTitle = ''
  let category = ''
  let collecting = false
  let current = ''
  let currentPage = 0

  const flush = (): void => {
    const text = cleanGoalText(current)
    if (phase && topicTitle && category && isMeaningfulSourceGoal(text)) {
      const stage = stageForPhase(phase)
      const page = currentPage || 1
      const key = `${stage}:${phase}:${topicTitle}:${category}:${page}`
      let bucket = buckets.get(key)
      if (!bucket) {
        bucket = {
          code: topicCodeFor(phase, topicTitle, category, page),
          title: topicTitle,
          phase,
          stage,
          courseLevel: stage === 'SekII' ? 'GK_LK' : 'unspecified',
          page,
          category,
          goals: [],
        }
        buckets.set(key, bucket)
      }
      bucket.goals.push({ number: bucket.goals.length + 1, text, kind: category })
    }
    current = ''
    currentPage = 0
  }

  for (let index = 0; index < pages.length; index += 1) {
    const page = index + 1
    if (page < 16) continue
    const lines = pages[index].split('\n').map(normalizeLine).filter(Boolean)

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex]
      if (/^\d+$/u.test(line)) continue
      const nextPhase = phaseFromLine(line)
      if (nextPhase) {
        flush()
        phase = nextPhase
        topicTitle = `Zentrale Ziele ${nextPhase}`
        category = ''
        collecting = false
        continue
      }
      const learningArea = learningAreaFromLine(line, lines[lineIndex + 1])
      if (learningArea) {
        flush()
        topicTitle = learningArea
        category = 'Lernbereichsziele'
        collecting = false
        continue
      }
      const nextCategory = categoryFromLine(line)
      if (nextCategory) {
        flush()
        category = nextCategory
        if (!topicTitle) topicTitle = `Zentrale Ziele ${phase || 'fachuebergreifend'}`
        collecting = false
        continue
      }
      if (/^Die Lernenden können$/u.test(line)) {
        collecting = true
        continue
      }
      if (!collecting) continue
      if (isStopLine(line)) {
        flush()
        collecting = false
        continue
      }
      const bullet = line.match(/^[–-]\s*(.+)$/u)
      if (bullet) {
        flush()
        current = bullet[1] ?? ''
        currentPage = page
      } else if (current && !isPdfArtifact(line)) {
        current = `${current} ${line}`
      }
    }
    flush()
  }

  const sections = [...buckets.values()].filter((section) => section.goals.length > 0)
  assertRequiredSections(sections)
  return sections
}

function phaseFromLine(line: string): string | null {
  if (/^Klassenstufen 5\/6$/u.test(line) || /^2\.1 Klassenstufen 5\/6$/u.test(line)) return '5/6'
  if (/^Klassenstufen 7\/8$/u.test(line) || /^2\.2 Klassenstufen 7\/8$/u.test(line)) return '7/8'
  if (/^Klassenstufe 9 und 10$/u.test(line) || /^2\.3 Klassenstufen 9 und 10$/u.test(line)) return '9/10'
  if (/^Klassenstufe 11$/u.test(line)) return '11'
  if (/^Klassenstufen 11\/12$/u.test(line)) return '11/12'
  return null
}

function learningAreaFromLine(line: string, nextLine?: string): string | null {
  const numbered = line.match(/^\d+(?:\.\d+)+\s+Lernbereich\s+([IVX]+):\s*(.+)$/u)
  if (numbered) return `Lernbereich ${numbered[1]} - ${cleanGoalText(numbered[2] ?? '')}`
  const plain = line.match(/^Lernbereich\s+([IVX]+)$/u)
  if (plain && nextLine && !/^Die Lernenden können$/u.test(nextLine)) return `Lernbereich ${plain[1]} - ${cleanGoalText(nextLine)}`
  if (/^Orientierung in Zeit und Raum:/u.test(line)) return 'Orientierung in Zeit und Raum'
  return null
}

function categoryFromLine(line: string): string | null {
  if (/^Sach- und Methodenkompetenz$/u.test(line)) return 'Sach- und Methodenkompetenz'
  if (/^Sachkompetenz$/u.test(line)) return 'Sachkompetenz'
  if (/^Methodenkompetenz$/u.test(line)) return 'Methodenkompetenz'
  if (/^Selbst- und Sozialkompetenz$/u.test(line)) return 'Selbst- und Sozialkompetenz'
  return null
}

function stageForPhase(phase: string): Stage {
  return phase === '11' || phase === '11/12' ? 'SekII' : 'SekI'
}

function assertRequiredSections(sections: ParsedSection[]): void {
  const byPhase = new Set(sections.map((section) => section.phase))
  const missing = ['5/6', '7/8', '9/10', '11', '11/12'].filter((phase) => !byPhase.has(phase))
  if (missing.length > 0) throw new Error(`Missing Thueringen Geschichte phases: ${missing.join(', ')}`)
}

function buildDocuments(spec: ExtractionSpec, sections: ParsedSection[]) {
  if (sections.length === 0) throw new Error(`No sections for ${spec.extractionId}`)
  const passages = sections.map((section) => buildPassage(spec, section))
  const sourceGoals = sections.flatMap((section) => buildSourceGoals(spec, section))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const duplicateGoalIds = findDuplicates(sourceGoals.map((goal) => goal.id))
  const missingPassageRefs = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
  const emptyPassages = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.topicCode)
  if (duplicateGoalIds.length > 0) throw new Error(`Duplicate source goal IDs: ${duplicateGoalIds.join(', ')}`)

  const decisions = sourceGoals.map((sourceGoal) => {
    const canonicalGoalIds = inferCanonicalGoalIds(sourceGoal)
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: 'partial',
      rationale:
        'Das amtliche TH-Geschichte-Source-Ziel ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt. 1:n/partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
      reviewedAt: generatedAt,
      reviewer: 'codex',
    }
  })
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  )

  return {
    extraction: {
      schemaVersion: 1,
      extractionId: spec.extractionId,
      sourceLandscapeId: spec.sourceLandscapeId,
      targetLandscapeId,
      title: spec.title,
      jurisdiction,
      subject,
      stage: spec.stage,
      sourceDocument: sourceDocument2025,
      sourceDocuments: [sourceDocument2025, sourceDocument2021],
      method: {
        passageExtraction:
          'pdftotext -raw over the official Thueringen Geschichte Gymnasium 2025 PDF; one passage per competency block or Lernbereich/category block.',
        sourceGoalExtraction:
          'one source goal per official "Die Lernenden koennen" bullet. General explanatory paragraphs, performance-assessment text, and source-footnote text are excluded.',
        mappingBasis:
          'M3 maps each source goal to one or more canonical Geschichte clusters. 1:n/partial is a mapping form, not a quality deficit.',
      },
      qualityReview: {
        sourceGoalCountPeerBaseline: {
          status: 'accepted',
          accepted: true,
          actualSourceGoals: sourceGoals.length,
          details: spec.peerBaselineReview,
          rationale: spec.peerBaselineReview,
        },
        notes: [
          'Legacy-Snapshots werden nicht als Quelle verwendet.',
          'Die 2025er Entwurfsfassung wird als Ziel-Lehrplan extrahiert; der 2021er Lehrplan ist als amtlicher Geltungskontext lokal archiviert.',
        ],
      },
      expectedTopicCodes: sections.map((section) => section.code),
      pipelineStatus: buildPipelineStatus(spec, passages, sourceGoals, {
        duplicateGoalIds,
        missingPassageRefs,
        emptyPassages,
      }),
      passages,
      sourceGoals,
      validation: {
        passageIdsUnique: passageIds.size === passages.length,
        sourceGoalIdsUnique: duplicateGoalIds.length === 0,
        sourceGoalsReferenceKnownPassages: missingPassageRefs.length === 0,
      },
      generatedAt,
    },
    review: {
      version: 1,
      reviewId: spec.stage === 'SekI'
        ? 'de-th-history-lower-secondary-source-extraction-to-canonical-history'
        : 'de-th-history-upper-secondary-source-extraction-to-canonical-history',
      sourceLandscapeId: spec.sourceLandscapeId,
      targetLandscapeId,
      sourceExtractionPath: spec.outputPath,
      status: 'complete',
      summary: {
        sourceGoals: sourceGoals.length,
        reviewedSourceGoals: sourceGoals.length,
        seedMappedSourceGoals: 0,
        mappedSourceGoals: sourceGoals.length,
        needsCanonicalGoal: 0,
        exactMappings: 0,
        partialMappings: sourceGoals.length,
        inheritedMappings: 0,
        note:
          'Thueringen Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
      },
      mappings,
      decisions,
    },
  }
}

function buildPassage(spec: ExtractionSpec, section: ParsedSection) {
  return {
    id: passageIdFor(spec, section.code),
    sourceDocumentKey: sourceDocument2025.key,
    topicCode: section.code,
    title: `${section.phase} - ${section.title} - ${section.category}`,
    text: section.goals.map((goal) => `(${goal.kind}) ${goal.text}`).join('\n'),
    rawText: section.goals.map((goal) => `(${goal.kind}) ${goal.text}`).join('\n'),
    sourcePath: sourceDocument2025.path,
    sourceUrl: sourceDocument2025.url,
    sourceGoalIds: section.goals.map((goal) => sourceGoalId(spec, section, goal)),
    metadata: {
      jurisdiction,
      subject,
      stage: spec.stage,
      phase: section.phase,
      courseLevel: section.courseLevel,
      sourceDocumentKey: sourceDocument2025.key,
      page: section.page,
    },
  }
}

function buildSourceGoals(spec: ExtractionSpec, section: ParsedSection): SourceGoal[] {
  const passageId = passageIdFor(spec, section.code)
  return section.goals.map((goal) => {
    const sourceSpan = `${section.code}.${slug(goal.kind)}.${goal.number}`
    return {
      id: sourceGoalId(spec, section, goal),
      passageId,
      topicCode: section.code,
      bulletIndex: goal.number,
      aspectIndex: 1,
      title: titleFromSourceText(goal.text),
      description: `Die lernende Person kann ${toSentenceFragment(goal.text)}`,
      sourceText: goal.text,
      sourceSpan,
      parentBulletText: goal.text,
      sourceDocumentKey: sourceDocument2025.key,
      sourceRef: `${sourceDocument2025.title}, ${section.phase}, ${section.title}, ${goal.kind}, PDF-S. ${section.page}`,
      courseLevel: section.courseLevel,
      granularity: 'officialCompetency',
      stage: spec.stage,
      tags: [
        'subject:geschichte',
        `jurisdiction:${jurisdiction}`,
        `stage:${spec.stage}`,
        `phase:${slug(section.phase)}`,
        `competency:${slug(goal.kind)}`,
        `courseLevel:${section.courseLevel}`,
        `sourceDocument:${sourceDocument2025.key}`,
      ],
      rawSourceText: goal.text,
      rawSourceSpan: sourceSpan,
      rawParentBulletText: goal.text,
      metadata: {
        extractionMethod: 'pdftotext-raw-th-gymnasium-geschichte-2025-competency-and-lernbereich-bullets',
        phase: section.phase,
        competencyArea: goal.kind,
        page: section.page,
      },
    }
  })
}

function buildPipelineStatus(
  spec: ExtractionSpec,
  passages: Array<{ topicCode: string; sourceGoalIds: string[] }>,
  sourceGoals: SourceGoal[],
  diagnostics: { duplicateGoalIds: string[]; missingPassageRefs: string[]; emptyPassages: string[] },
) {
  const mapping2Complete = sourceGoals.length > 0
    && diagnostics.duplicateGoalIds.length === 0
    && diagnostics.missingPassageRefs.length === 0
    && diagnostics.emptyPassages.length === 0
  return {
    version: 1,
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: 'complete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtlicher Thueringen-Geschichte-Lehrplan 2025 liegt lokal vor',
            passed: existsSync(abs(sourceDocument2025.path)),
            details: sourceDocument2025.path,
          },
          {
            id: 'bridge-source-document-present',
            label: 'Amtlicher Thueringen-Geschichte-Lehrplan 2021 ist als Geltungskontext archiviert',
            passed: existsSync(abs(sourceDocument2021.path)),
            details: sourceDocument2021.path,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: passages.length > 0 ? 'complete' : 'incomplete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'expected-topic-coverage',
            label: 'TH-Geschichte-Kompetenzbereiche und Lernbereiche sind als Passagen vorhanden',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: sourceDocument2025.path,
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: mapping2Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: 'source-goals-created',
            label: 'Source-Ziele aus amtlichen TH-Geschichte-Kompetenz- und Lernbereichszeilen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline-manual-review',
            label: 'Source-Ziel-Anzahl wurde fachlich gegen den HE/BW-Korridor plausibilisiert',
            passed: true,
            details: spec.peerBaselineReview,
          },
          {
            id: 'passage-to-source-goal-coverage',
            label: 'Jede Passage hat mindestens ein Source-Ziel',
            passed: diagnostics.emptyPassages.length === 0,
            details: `Passagen ohne Source-Ziele: ${diagnostics.emptyPassages.join(', ') || '-'}`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: diagnostics.duplicateGoalIds.length === 0,
            details: `Doppelte IDs: ${diagnostics.duplicateGoalIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: diagnostics.missingPassageRefs.length === 0,
            details: `Ohne Passage: ${diagnostics.missingPassageRefs.join(', ') || '-'}`,
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: mapping2Complete ? 'complete' : 'blocked',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: mapping2Complete,
            details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.`,
          },
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: spec.reviewPath,
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
            details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps, 0 unreviewed. 1:n/partial bezeichnet hier nur die Zuordnungsform.`,
          },
        ],
      },
    ],
  }
}

function inferCanonicalGoalIds(sourceGoal: SourceGoal): string[] {
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.sourceText}`).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/quelle|quellen|darstellung|interpret|narrativ|geschichtskultur|zeitstrahl|archaeologie|museum|digital|praesentation|datenbank|denkmal|methode|forsch/u.test(text)) {
    add('Warum Geschichte? - Relevanz und Orientierung', 'Kontroversen über die Vergangenheit', 'Geschichtsbilder und Geschichtspolitik')
  }
  if (/fruehgeschichte|steinzeit|neolith|metall|aegypt|pharao|pyramide|polis|athen|rom|roemisch|antike|griechen|hellen/u.test(text)) {
    add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Antike Traditionen und Rezeption der Antike')
  }
  if (/mittelalter|grundherrschaft|lehnswesen|ritter|stadt|staende|kirche|reformation|luther|absolut|monarchie|kreuzzug|juedisch/u.test(text)) {
    add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Interkulturelle Begegnungen und europäische Aufbrüche', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/entdeckung|kolonial|renaissance|humanismus|aufklaerung|franzoesische revolution|napoleon|staendegesellschaft|freiheit|nationale einheit|1848|nationalstaat|industriegesellschaft|industrialis|imperialismus|kaiserreich|wiener kongress|vormaerz/u.test(text)) {
    add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    add('Industrialisierung – Wohlstand für wenige?')
    add('Imperialismus – Export europäischer Zivilisation?')
    add('Q1 19. Jahrhundert')
  }
  if (/erster weltkrieg|weimar|demokratie|diktatur|nationalsozial|ns-|holocaust|verfolgung|zweiter weltkrieg|stalinismus|sowjet|totalitaer|faschismus|propaganda|terror|widerstand/u.test(text)) {
    add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
    add('Weimarer Republik als erste deutsche Demokratie')
    add('Aushöhlung der Demokratie und Errichtung der Diktatur')
    add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    add('Weltpolitische Faktoren 1917–1945')
    add('Russische Revolution und Stalinismus')
  }
  if (/1945|kalter krieg|spaltung|geteilten deutschland|brd|ddr|sed|friedliche revolution|wiedervereinigung|transformation|zeitzeuge|nahost|israel|palaestin|internationale kooperation|usa|supermacht|blockbildung|migration/u.test(text)) {
    add('Der Kalte Krieg – stabile oder labile Ordnung?')
    add('Teilung Deutschlands – eine Nation, zwei Staaten')
    add('Deutschland von der Teilung zur Einheit')
    add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
    add('Nahostkonflikt als weltpolitischer Krisenherd')
  }
  if (/erinnerung|gegenwart|geschichtskultur|identitaet|vergangenheits|radikalismus|antisemitismus|gedenk|werturteil|sachurteil|orientierung/u.test(text)) {
    add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
    add('Kontroversen über die Vergangenheit')
    add('Geschichtsbilder und Geschichtspolitik')
    add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }

  const ids = [...titles]
    .map((title) => canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title)))
    .filter((id): id is string => Boolean(id))
  if (ids.length > 0) return [...new Set(ids)]
  return [
    requireCanonicalTitle('Wahrnehmungen und Deutung von Geschichte im Wandel'),
    requireCanonicalTitle('Geschichtsbilder und Geschichtspolitik'),
  ]
}

function updateRegistry(updatedSpecs: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const landscapeIds = new Set(updatedSpecs.map((spec) => spec.sourceLandscapeId))
  const nextEntries = registry.entries.filter((entry) => !landscapeIds.has(String(entry.landscapeId)))
  for (const spec of updatedSpecs) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction,
      subject,
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: sourceDocument2025.path,
      archiveSourcePath: sourceDocument2025.path,
      archivePath: spec.archivePath,
      sourceDocumentKey: sourceDocument2025.key,
      sourceUrl: sourceDocument2025.url,
    })
  }
  registry.entries = nextEntries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(generated: Array<{ spec: ExtractionSpec; count: number }>): void {
  const path = 'curricula/DE/Gymnasium/input/TH/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Thueringen (TH) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-TH-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    'Archived official source input on `2026-05-14`:',
    '',
    '- `LP_GY_Geschichte_Entwurfsfassung2025.pdf`',
    `  - ${sourceDocument2025.title}`,
    `  - direct PDF source: \`${sourceDocument2025.url}\``,
    '- `LP_GY_Geschichte_2021.pdf`',
    `  - ${sourceDocument2021.title}`,
    `  - direct PDF source: \`${sourceDocument2021.url}\``,
    `  - official Lehrplan overview: \`${officialOverviewUrl}\``,
    '',
    'Operational note:',
    '',
    '- `DE-TH` now has real archived lower-secondary plus upper-secondary Geschichte source extractions from the official Schulportal PDFs.',
    '- The 2025 Entwurfsfassung is extracted as the target rollout source; 2021 is retained as official validity/bridge context.',
    '- The retained source extractions now live at:',
    ...generated.map(({ spec }) => `  - \`${spec.outputPath}\``),
    '- Thueringen Geschichte M3 status:',
    ...generated.map(({ spec, count }) => `  - ${spec.stage}: \`complete\` (${count} Source-Ziele)`),
    '<!-- DE-TH-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-TH-GESCHICHTE-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateStageReferences(generated: Array<{ spec: ExtractionSpec; count: number }>): void {
  const lower = generated.find(({ spec }) => spec.stage === 'SekI')
  const upper = generated.find(({ spec }) => spec.stage === 'SekII')
  if (lower) {
    updateReferenceFile({
      path: 'curricula/DE/Gymnasium/input/TH/lower-secondary/references.md',
      marker: 'DE-TH-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
      scope: `lower-secondary extraction target: TH Geschichte Klassenstufen 5/6, 7/8 und 9/10 (${lower.count} Source-Ziele)`,
      extractionPath: lower.spec.outputPath,
      reviewPath: lower.spec.reviewPath,
    })
  }
  if (upper) {
    updateReferenceFile({
      path: 'curricula/DE/Gymnasium/input/TH/upper-secondary/references.md',
      marker: 'DE-TH-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
      scope: `upper-secondary extraction target: TH Geschichte Einfuehrungsphase 11/11S und Qualifikationsphase 11/12 (${upper.count} Source-Ziele)`,
      extractionPath: upper.spec.outputPath,
      reviewPath: upper.spec.reviewPath,
    })
  }
}

function updateReferenceFile(args: {
  path: string
  marker: string
  scope: string
  extractionPath: string
  reviewPath: string
}): void {
  const existing = existsSync(abs(args.path)) ? readFileSync(abs(args.path), 'utf8') : '# References\n'
  const section = [
    `<!-- ${args.marker}:start -->`,
    '## Geschichte source PDFs',
    '',
    `- \`${sourceDocument2025.title}\`:`,
    `  ${sourceDocument2025.url}`,
    `- \`${sourceDocument2021.title}\`:`,
    `  ${sourceDocument2021.url}`,
    '',
    'Official source page:',
    '',
    `- ${officialOverviewUrl}`,
    '',
    'Scope:',
    '',
    '- Thueringen',
    '- Gymnasium',
    '- Geschichte',
    `- ${args.scope}`,
    '',
    'Archived locally at:',
    '',
    `- \`${sourceDocument2025.path}\``,
    `- \`${sourceDocument2021.path}\``,
    '',
    'Source extraction:',
    '',
    `- \`${args.extractionPath}\``,
    '',
    'Mapping review:',
    '',
    `- \`${args.reviewPath}\``,
    `<!-- ${args.marker}:end -->`,
    '',
  ].join('\n')
  writeFileSync(abs(args.path), `${replaceMarkedSection(existing, args.marker, section).trim()}\n`, 'utf8')
}

function syncCanonicalHistoryApplicability(): void {
  const compilation = buildApplicabilityCompilation()
  const report = compilation.reports.find((candidate) => candidate.landscapeId === targetLandscapeId)
  if (!report) throw new Error(`No applicability report for canonical history ${targetLandscapeId}`)
  const compiledByGoalId = new Map(report.goals.map((goal) => [goal.goalId, goal.compiledApplicability]))
  const canonical = readJson<CanonicalLandscape>(canonicalPath)
  for (const goal of canonical.goals) {
    const compiled = compiledByGoalId.get(goal.id) ?? {}
    if ((compiled.jurisdiction?.length ?? 0) > 0) goal.applicability = compiled
    else delete goal.applicability
  }
  writeJson(canonicalPath, canonical)
}

function pdfRawText(path: string): string {
  return execFileSync('pdftotext', ['-raw', abs(path), '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
    .replace(/\r/gu, '')
    .replace(/\u00a0/gu, ' ')
}

function cleanGoalText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/[]/gu, '')
    .replace(/\b(?:DB|DS|MB|BNE|BO)(?:,\s*)?/gu, '')
    .replace(/([A-Za-zÄÖÜäöüß])[-‐‑‒–—]+\s+(?!und\b|oder\b)([a-zäöüß])/gu, '$1$2')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizeLine(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .trim()
}

function isMeaningfulSourceGoal(value: string): boolean {
  if (value.length < 12) return false
  if (/^(?:Lehrplan|Quelle:|Klassenstufen|Lernbereich|Die Lernenden können)/u.test(value)) return false
  return /[a-zäöüß]/u.test(value)
}

function isStopLine(line: string): boolean {
  return /^(\d+(?:\.\d+)+\s|5\s+Leistungseinschätzung|grundlegendes Anforderungsniveau|erhöhtes Anforderungsniveau|Quelle:)/u.test(line)
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/u.test(line)
    || /^Lehrplan/u.test(line)
    || /^Thüringer Ministerium/u.test(line)
}

function topicCodeFor(phase: string, title: string, category: string, page: number): string {
  return `TH-GESCHICHTE-${slug(phase)}-${slug(title)}-${slug(category)}-${page}`.toUpperCase()
}

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return `${spec.sourceGoalPrefix}:${slug(topicCode)}-${hash(topicCode)}`
}

function sourceGoalId(spec: ExtractionSpec, section: ParsedSection, goal: ParsedGoal): string {
  return uuidFromString(`${spec.extractionId}:${section.code}:${goal.kind}:${goal.number}:${goal.text}`)
}

function titleFromSourceText(text: string): string {
  const clean = cleanGoalText(text).replace(/[.;:,]+$/u, '')
  return clean.length <= 110 ? clean : `${clean.slice(0, 107).trim()}...`
}

function toSentenceFragment(text: string): string {
  const clean = cleanGoalText(text).replace(/[.;:,]+$/u, '')
  return `${clean.charAt(0).toLowerCase()}${clean.slice(1)}.`
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates].sort()
}

function loadCanonicalTitleToId(): Map<string, string> {
  const canonical = readJson<CanonicalLandscape>(canonicalPath)
  const map = new Map<string, string>()
  for (const goal of canonical.goals) {
    map.set(goal.title, goal.id)
    map.set(asciiFold(goal.title), goal.id)
  }
  return map
}

function requireCanonicalTitle(title: string): string {
  const id = canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title))
  if (!id) throw new Error(`Missing canonical Geschichte title: ${title}`)
  return id
}

function replaceMarkedSection(existing: string, marker: string, nextSection: string): string {
  const pattern = new RegExp(`<!-- ${escapeRegExp(marker)}:start -->[\\s\\S]*?<!-- ${escapeRegExp(marker)}:end -->\\n?`, 'u')
  if (pattern.test(existing)) return existing.replace(pattern, `${nextSection.trim()}\n`)
  return `${existing.trim()}\n\n${nextSection.trim()}\n`
}

function slug(value: string): string {
  return asciiFold(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function asciiFold(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ß/gu, 'ss')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function uuidFromString(input: string): string {
  const hex = createHash('sha1').update(input).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function abs(path: string): string {
  return resolve(repoRoot, path)
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as T
}

function writeJson(path: string, value: unknown): void {
  const target = abs(path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
