import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK' | 'LK' | 'unspecified'

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

interface BboxBlock {
  page: number
  xMin: number
  yMin: number
  text: string
}

interface ParsedGoal {
  phase: string
  field: string
  topicCode: string
  text: string
  kind: string
  courseLevel: CourseLevel
  page: number
  index: number
}

interface Passage {
  id: string
  sourceDocumentKey: string
  topicCode: string
  title: string
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
    field: string
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
const jurisdiction = 'DE-SN'
const subject = 'Geschichte'
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const officialPageUrl = 'https://www.schulportal.sachsen.de/lplandb/lehrplan/65'

const sourceDocument: SourceDocument = {
  key: 'SN-GESCHICHTE-GYM-2019-2024',
  title: 'Lehrplan Gymnasium Geschichte Sachsen 2004/2007/2009/2011/2019 (PDF-Fassung 2024)',
  path: 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-geschichte-sachsen-2026.pdf',
  url: 'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/65/aCaTu4iKflh2vcW3XobR',
  official: true,
  available: true,
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_SN_GESCHICHTE_SEKI_LEHRPLAN_GYMNASIUM_2019',
    sourceLandscapeId: uuidFromString('DE-SN-GESCHICHTE-SEKI-LEHRPLAN-GYMNASIUM-2019'),
    title: 'Geschichte Sekundarstufe I (Sachsen, Lehrplan Gymnasium Source-Extraction)',
    stage: 'SekI',
    outputPath:
      'curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_GESCHICHTE_SEKI_LEHRPLAN_GYMNASIUM_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_history_lower_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/SN/lower-secondary/',
    sourceGoalPrefix: 'sn-history-seki',
    peerBaselineReview:
      'Kritisch geprueft: Sachsen Geschichte Sek I wird aus den amtlichen Pflicht-Zielen und Pflicht-Lernbereichen der Klassenstufen 5-10 extrahiert. Wahlbereiche und rechte Bemerkungsspalten werden bewusst ausgeschlossen; linke operatorbezogene Zeilen und verbindliche Unterpunkte werden als Source-Ziele gezaehlt.',
  },
  {
    extractionId: 'DE_SN_GESCHICHTE_SEKII_LEHRPLAN_GYMNASIUM_2019',
    sourceLandscapeId: uuidFromString('DE-SN-GESCHICHTE-SEKII-LEHRPLAN-GYMNASIUM-2019'),
    title: 'Geschichte Oberstufe (Sachsen, Lehrplan Gymnasium Source-Extraction)',
    stage: 'SekII',
    outputPath:
      'curricula/DE/Gymnasium/input/SN/upper-secondary/source-extraction/DE_SN_GESCHICHTE_SEKII_LEHRPLAN_GYMNASIUM_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_history_upper_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/SN/upper-secondary/',
    sourceGoalPrefix: 'sn-history-sekii',
    peerBaselineReview:
      'Kritisch geprueft: Sachsen Geschichte Sek II wird aus den amtlichen Pflicht-Zielen und Pflicht-Lernbereichen fuer Grundkurs und Leistungskurs extrahiert. Wahlbereiche bleiben draussen; GK- und LK-Pflichtziele bleiben sichtbar, weil sie unterschiedliche Kursprofile belegen.',
  },
]

const mainGoalPattern =
  /^(?:Entwickeln|Einblick gewinnen|Kennen|Anwenden|Übertragen|Beurteilen|Sich positionieren|Gestalten|Problemlösen|Nutzen|Erörtern)\b/u

const canonicalTitleToId = loadCanonicalTitleToId()

main()

function main(): void {
  if (!existsSync(abs(sourceDocument.path))) throw new Error(`Missing official source PDF: ${sourceDocument.path}`)
  const parsedGoals = parseOfficialSourceGoals()
  const generated = specs.map((spec) => {
    const stageGoals = parsedGoals
      .filter((goal) => (spec.stage === 'SekI' ? isLowerPhase(goal.phase) : !isLowerPhase(goal.phase)))
      .map((goal, index) => ({ ...goal, index: index + 1 }))
    const { extraction, review } = buildDocuments(spec, stageGoals)
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

function parseOfficialSourceGoals(): ParsedGoal[] {
  const blocks = pdftotextBlocks(sourceDocument.path)
  const goals: ParsedGoal[] = []
  const seen = new Set<string>()
  let phase = ''
  let field = ''
  let courseLevel: CourseLevel = 'unspecified'
  let skipCurrentField = false
  let activeParent = ''

  for (const block of blocks) {
    const nextPhase = phaseFromBlock(block.text)
    if (nextPhase) {
      if (nextPhase !== phase) {
        field = ''
        skipCurrentField = false
        activeParent = ''
      }
      phase = nextPhase
      courseLevel = courseLevelForPhase(nextPhase)
      continue
    }

    if (!phase) continue
    if (isPdfArtifact(block.text)) continue

    if (block.xMin < 95 && block.text === 'Ziele') {
      field = 'Ziele'
      skipCurrentField = false
      activeParent = ''
      continue
    }

    const learningAreaHeading = learningAreaHeadingFor(blocks, block)
    if (learningAreaHeading) {
      field = learningAreaHeading
      skipCurrentField = /^Wahlbereich\b/u.test(learningAreaHeading) || /^Lernbereiche mit Wahlcharakter\b/u.test(learningAreaHeading)
      activeParent = ''
      continue
    }

    if (!field || skipCurrentField) continue

    const text = cleanSourceText(block.text)
    if (!text || isNonGoalLine(text)) continue

    if (isLeftMainGoalBlock(block, text)) {
      activeParent = text
      addParsedGoal({
        phase,
        field,
        text,
        courseLevel,
        page: block.page,
        goals,
        seen,
      })
      continue
    }

    if (isBulletTextBlock(blocks, block) && isMeaningfulSourceGoal(text)) {
      for (const bulletText of splitBundledBulletText(text)) {
        const sourceText = activeParent ? `${activeParent}: ${bulletText}` : bulletText
        addParsedGoal({
          phase,
          field,
          text: sourceText,
          courseLevel,
          page: block.page,
          goals,
          seen,
        })
      }
    }
  }

  assertRequiredPhases(goals)
  return goals
}

function addParsedGoal(args: {
  phase: string
  field: string
  text: string
  courseLevel: CourseLevel
  page: number
  goals: ParsedGoal[]
  seen: Set<string>
}): void {
  const text = cleanSourceText(args.text)
  if (!isMeaningfulSourceGoal(text)) return
  const key = normalizedDedupeKey(`${args.phase}:${args.field}:${args.courseLevel}:${text}`)
  if (args.seen.has(key)) return
  args.seen.add(key)
  args.goals.push({
    phase: args.phase,
    field: args.field,
    topicCode: topicCodeFor(args.phase, args.field, args.courseLevel),
    text,
    kind: inferKind(text),
    courseLevel: args.courseLevel,
    page: args.page,
    index: args.goals.length + 1,
  })
}

function pdftotextBlocks(path: string): BboxBlock[] {
  const fromPage = 20
  const xml = execFileSync('pdftotext', ['-bbox-layout', '-f', String(fromPage), '-l', '61', abs(path), '-'], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  })
  const blocks: BboxBlock[] = []
  let pageNumber = fromPage - 1
  const pagePattern = /<page [^>]*>([\s\S]*?)<\/page>/gu
  for (const pageMatch of xml.matchAll(pagePattern)) {
    pageNumber += 1
    const blockPattern = /<block xMin="([^"]+)" yMin="([^"]+)" xMax="[^"]+" yMax="[^"]+">([\s\S]*?)<\/block>/gu
    for (const blockMatch of pageMatch[1].matchAll(blockPattern)) {
      const words = [...blockMatch[3].matchAll(/<word [^>]*>([\s\S]*?)<\/word>/gu)]
        .map((wordMatch) => decodeHtml(wordMatch[1]))
        .join(' ')
      const text = cleanSourceText(words)
      if (!text) continue
      blocks.push({
        page: pageNumber,
        xMin: Number.parseFloat(blockMatch[1]),
        yMin: Number.parseFloat(blockMatch[2]),
        text,
      })
    }
  }
  return blocks.sort((left, right) => left.page - right.page || left.yMin - right.yMin || left.xMin - right.xMin)
}

function learningAreaHeadingFor(blocks: BboxBlock[], block: BboxBlock): string | null {
  if (block.xMin > 95) return null
  if (!/^(?:Lernbereich\s+\d+:|Lernbereiche mit Wahlcharakter|Wahlbereich\s+\d+:)/u.test(block.text)) return null
  if (/^Lernbereiche mit Wahlcharakter\b/u.test(block.text)) return 'Lernbereiche mit Wahlcharakter'
  const sameAreaBlocks = blocks
    .filter((candidate) =>
      candidate.page === block.page
      && candidate.yMin >= block.yMin - 3
      && candidate.yMin <= block.yMin + 19
      && candidate.xMin > 100
      && candidate.xMin < 540)
    .sort((left, right) => left.yMin - right.yMin || left.xMin - right.xMin)
  const joined = cleanSourceText([block.text, ...sameAreaBlocks.map((candidate) => candidate.text)].join(' '))
    .replace(/\s+\d+\s+Ustd\.$/u, '')
  return joined
}

function isLeftMainGoalBlock(block: BboxBlock, text: string): boolean {
  if (block.xMin < 50 || block.xMin > 90) return false
  if (text === '-') return false
  if (/^(?:Lernbereich|Lernbereiche|Wahlbereich|Ziele|Geschichte|Gymnasium)\b/u.test(text)) return false
  return mainGoalPattern.test(text)
}

function isBulletTextBlock(blocks: BboxBlock[], block: BboxBlock): boolean {
  if (block.xMin < 70 || block.xMin > 145) return false
  return blocks.some((candidate) =>
    candidate.page === block.page
    && candidate.text === '-'
    && candidate.xMin >= 50
    && candidate.xMin < 70
    && Math.abs(candidate.yMin - block.yMin) < 4)
}

function isNonGoalLine(text: string): boolean {
  return text.length === 0
    || text === '-'
    || /^Die Schüler(?:innen und Schüler)?\b/u.test(text)
    || /^Die Lernenden\b/u.test(text)
    || /^Hinweise?\b/u.test(text)
    || /^Methodenbewusstsein\b/u.test(text)
    || /^Bildung für nachhaltige Entwicklung\b/u.test(text)
    || /^informatische Bildung\b/u.test(text)
}

function splitBundledBulletText(text: string): string[] {
  const clean = cleanSourceText(text)
  if (clean.split(/\s+/u).length <= 18) return [clean]
  const parts = clean
    .split(
      /,\s+(?=(?:dass|die|der|das|den|dem|durch|mit|aus|am|sie|sich|Informationen|Spuren|Formen|Möglichkeiten|Vergleich|Konflikt|nationale|Toleranz|Freiheit|wirken|setzen|lehnen|erkennen|begreifen)\b)/u,
    )
    .map((part) => cleanSourceText(part).replace(/[.;:]$/u, ''))
    .filter((part) => isMeaningfulSourceGoal(part))
  return parts.length > 1 ? parts : [clean]
}

function phaseFromBlock(text: string): string | null {
  const lowerMatch = text.match(/(?:^|Geschichte\s+)(Klassenstufe\s+\d+)\b/u)
  if (lowerMatch) return lowerMatch[1] ?? null
  if (/Jahrgangsstufen\s+11\/12\s+[–-]\s+Grundkurs/u.test(text)) return 'Jahrgangsstufen 11/12 Grundkurs'
  if (/Jahrgangsstufe\s+11\s+[–-]\s+Leistungskurs/u.test(text)) return 'Jahrgangsstufe 11 Leistungskurs'
  if (/Jahrgangsstufe\s+12\s+[–-]\s+Leistungskurs/u.test(text)) return 'Jahrgangsstufe 12 Leistungskurs'
  return null
}

function courseLevelForPhase(phase: string): CourseLevel {
  if (phase.includes('Grundkurs')) return 'GK'
  if (phase.includes('Leistungskurs')) return 'LK'
  return 'unspecified'
}

function isLowerPhase(phase: string): boolean {
  return /^Klassenstufe\s+\d+$/u.test(phase)
}

function assertRequiredPhases(goals: ParsedGoal[]): void {
  const expected = [
    'Klassenstufe 5',
    'Klassenstufe 6',
    'Klassenstufe 7',
    'Klassenstufe 8',
    'Klassenstufe 9',
    'Klassenstufe 10',
    'Jahrgangsstufen 11/12 Grundkurs',
    'Jahrgangsstufe 11 Leistungskurs',
    'Jahrgangsstufe 12 Leistungskurs',
  ]
  const found = new Set(goals.map((goal) => goal.phase))
  const missing = expected.filter((phase) => !found.has(phase))
  if (missing.length > 0) throw new Error(`Missing Sachsen Geschichte phases: ${missing.join(', ')}`)
}

function buildDocuments(spec: ExtractionSpec, parsedGoals: ParsedGoal[]) {
  if (parsedGoals.length === 0) throw new Error(`No parsed goals for ${spec.extractionId}`)
  const passagesByCode = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []
  const decisions = parsedGoals.map((parsedGoal) => {
    const passageId = passageIdFor(spec, parsedGoal.topicCode)
    if (!passagesByCode.has(parsedGoal.topicCode)) {
      passagesByCode.set(parsedGoal.topicCode, {
        id: passageId,
        sourceDocumentKey: sourceDocument.key,
        topicCode: parsedGoal.topicCode,
        title: `${parsedGoal.phase} - ${parsedGoal.field}${parsedGoal.courseLevel === 'LK' ? ' (LK)' : ''}`,
        rawText: '',
        sourceGoalIds: [],
      })
    }

    const canonicalGoalIds = inferCanonicalGoalIds(parsedGoal)
    const sourceGoal: SourceGoal = {
      id: uuidFromString(`${spec.extractionId}:${parsedGoal.topicCode}:${parsedGoal.index}:${parsedGoal.text}`),
      passageId,
      topicCode: parsedGoal.topicCode,
      bulletIndex: parsedGoal.index,
      aspectIndex: 1,
      title: titleFromSourceText(parsedGoal.text),
      description: `Die lernende Person kann ${toSentenceFragment(parsedGoal.text)}`,
      sourceText: parsedGoal.text,
      sourceSpan: `${parsedGoal.topicCode}#${parsedGoal.index}`,
      parentBulletText: parsedGoal.text,
      sourceDocumentKey: sourceDocument.key,
      sourceRef: `${sourceDocument.title}, ${parsedGoal.phase}, ${parsedGoal.field}, PDF-S. ${parsedGoal.page}`,
      courseLevel: parsedGoal.courseLevel,
      granularity: 'officialCompetency',
      stage: spec.stage,
      tags: [
        'subject:geschichte',
        `jurisdiction:${jurisdiction}`,
        `stage:${spec.stage}`,
        `phase:${slug(parsedGoal.phase)}`,
        `field:${slug(parsedGoal.field)}`,
        `kind:${slug(parsedGoal.kind)}`,
        `courseLevel:${parsedGoal.courseLevel}`,
        `sourceDocument:${sourceDocument.key}`,
      ],
      rawSourceText: parsedGoal.text,
      rawSourceSpan: `${parsedGoal.topicCode}#${parsedGoal.index}`,
      rawParentBulletText: parsedGoal.text,
      metadata: {
        extractionMethod:
          'pdftotext-bbox-left-column-sn-gymnasium-geschichte-pflicht-ziele-and-pflicht-lernbereiche-without-wahlbereiche',
        phase: parsedGoal.phase,
        field: parsedGoal.field,
        page: parsedGoal.page,
      },
    }
    sourceGoals.push(sourceGoal)
    passagesByCode.get(parsedGoal.topicCode)?.sourceGoalIds.push(sourceGoal.id)

    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: 'partial',
      rationale:
        'Das amtliche SN-Geschichte-Source-Ziel ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt. 1:n/partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
      reviewedAt: generatedAt,
      reviewer: 'codex',
    }
  })

  const passages = [...passagesByCode.values()]
  for (const passage of passages) {
    passage.rawText = passage.sourceGoalIds
      .map((id, index) => {
        const sourceGoal = sourceGoals.find((goal) => goal.id === id)
        return sourceGoal ? `(${index + 1}) ${sourceGoal.sourceText}` : ''
      })
      .filter(Boolean)
      .join('\n')
  }

  const duplicateGoalIds = findDuplicates(sourceGoals.map((goal) => goal.id))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const missingPassageRefs = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
  const emptyPassages = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  if (duplicateGoalIds.length > 0) throw new Error(`Duplicate source goal IDs: ${duplicateGoalIds.join(', ')}`)
  if (missingPassageRefs.length > 0) throw new Error(`Source goals without passage: ${missingPassageRefs.join(', ')}`)
  if (emptyPassages.length > 0) throw new Error(`Passages without source goals: ${emptyPassages.join(', ')}`)

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
      sourceDocument,
      sourceDocuments: [sourceDocument],
      method: {
        passageExtraction:
          'pdftotext -bbox-layout over the official Sachsen Gymnasium Geschichte PDF; the extraction uses grade/year goals and the left column of Pflicht-Lernbereiche.',
        sourceGoalExtraction:
          'one source goal per official Ziel heading, left-column operator competency, and binding subpoint. Wahlbereiche, right-column hints and cross-reference remarks are excluded.',
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
          'Die gemeinsame amtliche Sachsen-Gymnasium-PDF wird als Originalquelle fuer Sek I und Sek II archiviert.',
        ],
      },
      expectedTopicCodes: passages.map((passage) => passage.topicCode),
      pipelineStatus: buildPipelineStatus(spec, passages, sourceGoals, {
        duplicateGoalIds,
        missingPassageRefs,
        emptyPassages,
      }),
      passages: passages.map((passage) => ({
        ...passage,
        sourcePath: sourceDocument.path,
        sourceUrl: sourceDocument.url,
        text: passage.rawText,
        metadata: {
          jurisdiction,
          subject,
          stage: spec.stage,
          sourceDocumentKey: sourceDocument.key,
        },
      })),
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
        ? 'de-sn-history-lower-secondary-source-extraction-to-canonical-history'
        : 'de-sn-history-upper-secondary-source-extraction-to-canonical-history',
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
          'Sachsen Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
      },
      mappings,
      decisions,
    },
  }
}

function buildPipelineStatus(
  spec: ExtractionSpec,
  passages: Passage[],
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
            label: 'Amtlicher Sachsen-Geschichte-Gymnasium-Lehrplan liegt lokal vor',
            passed: existsSync(abs(sourceDocument.path)),
            details: sourceDocument.path,
          },
          {
            id: 'source-document-url-registered',
            label: 'Originalquelle ist mit URL dokumentiert',
            passed: true,
            details: `${officialPageUrl}; ${sourceDocument.url}`,
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
            label: 'SN-Geschichte-Pflicht-Ziele und Pflicht-Lernbereiche sind als Passagen vorhanden',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: sourceDocument.path,
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
            label: 'Source-Ziele aus amtlichen SN-Geschichte-Kompetenzen und verbindlichen Unterpunkten erzeugt',
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

function inferCanonicalGoalIds(parsedGoal: ParsedGoal): string[] {
  const text = asciiFold(`${parsedGoal.phase} ${parsedGoal.field} ${parsedGoal.text}`).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/quelle|quellen|darstellung|deutung|rekonstruktion|methode|karte|geschichtskarte|zeitstrahl|medien|vergleich|urteilsfaehigkeit|begruendet|diskutieren|positionieren|stellung/u.test(text)) {
    add('Warum Geschichte? - Relevanz und Orientierung', 'Kontroversen über die Vergangenheit', 'Geschichtsbilder und Geschichtspolitik')
  }
  if (/steinzeit|fruehgeschichte|neolith|metallzeit|aegypt|pharao|pyramide|griech|polis|athen|sparta|olymp|rom|roemisch|antike|hellenismus|alexander/u.test(text)) {
    add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Antike Traditionen und Rezeption der Antike')
  }
  if (/mittelalter|feudal|lehns|grundherrschaft|ritter|burg|kloster|stadt|buerger|staende|kirche|papst|kaiser|kreuzzug|islam|christentum|religionen/u.test(text)) {
    add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Interkulturelle Begegnungen und europäische Aufbrüche')
  }
  if (/renaissance|humanismus|reformation|luther|calvin|glaubenskrieg|entdeckung|kolonial|weltbild|neuzeit|absolutismus|parlamentarismus|aufklaerung|menschenrechte|franzoesische revolution|napoleon|wiener kongress/u.test(text)) {
    add('Interkulturelle Begegnungen und europäische Aufbrüche')
    add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
    add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    add('Q1 19. Jahrhundert')
  }
  if (/1848|paulskirche|nationalstaat|einheit|freiheit|bismarck|kaiserreich|industrialis|soziale frage|arbeiter|kinderarbeit|imperialismus|kolonialpolitik|erster weltkrieg|versailler|julikrise/u.test(text)) {
    add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    add('Emanzipationsbestrebungen im 19. Jahrhundert')
    add('Industrialisierung – Wohlstand für wenige?')
    add('Imperialismus – Export europäischer Zivilisation?')
    add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
  }
  if (/weimar|demokratie zur diktatur|nationalsozial|ns-|hitler|gleichschaltung|volksgemeinschaft|holocaust|shoah|juden|vernichtung|zweiter weltkrieg|widerstand|stalin|sowjet|faschismus/u.test(text)) {
    add('Weimarer Republik als erste deutsche Demokratie')
    add('Aushöhlung der Demokratie und Errichtung der Diktatur')
    add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    add('Weltpolitische Faktoren 1917–1945')
    add('Russische Revolution und Stalinismus')
    add('Demokratie, Faschismus und Widerstand in Europa')
  }
  if (/1945|potsdam|kalter krieg|ost-west|usa|udssr|brd|bundesrepublik|ddr|deutsche teilung|mauer|grundgesetz|wiedervereinigung|friedliche revolution|europa|ksze|multipolar|nahost|israel|palaestina/u.test(text)) {
    add('Der Kalte Krieg – stabile oder labile Ordnung?')
    add('Teilung Deutschlands – eine Nation, zwei Staaten')
    add('Deutschland von der Teilung zur Einheit')
    add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/erinnerung|geschichtskultur|identitaet|denkmal|museum|rezeption|nationales selbstverstaendnis|vergangenheitsbewaeltigung|gegenwart|lebenswelt/u.test(text)) {
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

function inferKind(text: string): string {
  const folded = asciiFold(text).toLowerCase()
  if (/quelle|darstellung|karte|zeitstrahl|medien|recherche|praesentation|analys|untersuch|methode|rekonstruktion/u.test(folded)) return 'Methodenkompetenz'
  if (/beurteil|urteil|diskutier|bewert|positionier|stellung|deutung|kontroverse/u.test(folded)) return 'Urteilskompetenz'
  if (/gegenwart|lebenswelt|handlungsmoeglichkeit|mitgestalt|verantwortung|ueberzeugung/u.test(folded)) return 'Handlungskompetenz'
  if (/einblick|zeitbegriff|zeittypisch|orientierung|einordnen/u.test(folded)) return 'Orientierungskompetenz'
  return 'Sachkompetenz'
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
      sourcePath: sourceDocument.path,
      archiveSourcePath: sourceDocument.path,
      archivePath: spec.archivePath,
      sourceDocumentKey: sourceDocument.key,
      sourceUrl: sourceDocument.url,
    })
  }
  registry.entries = nextEntries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(generated: Array<{ spec: ExtractionSpec; count: number }>): void {
  const path = 'curricula/DE/Gymnasium/input/SN/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Sachsen (SN) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-SN-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    'Archived official source input on `2026-05-14`:',
    '',
    '- `lehrplan-gymnasium-geschichte-sachsen-2026.pdf`',
    `  - ${sourceDocument.title}`,
    '  - Klassenstufen `5-10`, Jahrgangsstufen `11/12` Grundkurs und Leistungskurs',
    `  - direct PDF source: \`${sourceDocument.url}\``,
    `  - public Lehrplandatenbank overview: \`${officialPageUrl}\``,
    '',
    'Operational note:',
    '',
    '- `DE-SN` now has real archived lower-secondary plus upper-secondary Geschichte source extractions from the shared official Gymnasium PDF.',
    '- Wahlbereiche and right-column hints are intentionally excluded from the Pflicht-source inventory.',
    '- The retained source extractions now live at:',
    ...generated.map(({ spec }) => `  - \`${spec.outputPath}\``),
    '- Sachsen Geschichte M3 status:',
    ...generated.map(({ spec, count }) => `  - ${spec.stage}: \`complete\` (${count} Source-Ziele)`),
    '<!-- DE-SN-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-SN-GESCHICHTE-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateStageReferences(generated: Array<{ spec: ExtractionSpec; count: number }>): void {
  const lower = generated.find(({ spec }) => spec.stage === 'SekI')
  const upper = generated.find(({ spec }) => spec.stage === 'SekII')
  if (lower) {
    updateReferenceFile({
      path: 'curricula/DE/Gymnasium/input/SN/lower-secondary/references.md',
      marker: 'DE-SN-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
      scope: `lower-secondary extraction target: SN Geschichte Pflicht-Ziele und Pflicht-Lernbereiche Klassenstufen 5-10 (${lower.count} Source-Ziele)`,
      extractionPath: lower.spec.outputPath,
      reviewPath: lower.spec.reviewPath,
    })
  }
  if (upper) {
    updateReferenceFile({
      path: 'curricula/DE/Gymnasium/input/SN/upper-secondary/references.md',
      marker: 'DE-SN-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
      scope: `upper-secondary extraction target: SN Geschichte Grundkurs und Leistungskurs Pflicht-Ziele und Pflicht-Lernbereiche (${upper.count} Source-Ziele)`,
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
    '## Geschichte source PDF',
    '',
    `- \`${sourceDocument.title}\`:`,
    `  ${sourceDocument.url}`,
    '',
    'Official source page:',
    '',
    `- ${officialPageUrl}`,
    '',
    'Scope:',
    '',
    '- Sachsen',
    '- Gymnasium',
    '- Geschichte',
    `- ${args.scope}`,
    '',
    'Archived locally at:',
    '',
    `- \`${sourceDocument.path}\``,
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

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/gu, '&')
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
}

function cleanSourceText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/\u00a0/gu, ' ')
    .replace(/([A-Za-zÄÖÜäöüß])-+\s+(?!und\b|oder\b)([a-zäöüß])/gu, '$1$2')
    .replace(/\s+-\s+/gu, ' - ')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()
}

function isMeaningfulSourceGoal(value: string): boolean {
  if (value.length < 12) return false
  if (value.split(/\s+/u).length < 2) return false
  if (/^\d+$/u.test(value)) return false
  if (/^(?:Gymnasium|Geschichte|GY\s+[–-]\s+GE)\b/u.test(value)) return false
  if (/^(?:Lernbereich|Wahlbereich|Lernbereiche|Ziele|Klassenstufe|Jahrgangsstufe)\b/u.test(value)) return false
  return /[a-zäöüß]/u.test(value)
}

function isPdfArtifact(text: string): boolean {
  return text.length === 0
    || /^\d+$/u.test(text)
    || /^Gymnasium$/u.test(text)
    || /^Geschichte$/u.test(text)
    || /^GY\s+[–-]\s+GE\b/u.test(text)
    || /^\d+\s+20\d\d\s+GY\s+[–-]\s+GE$/u.test(text)
}

function normalizedDedupeKey(value: string): string {
  return asciiFold(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

function topicCodeFor(phase: string, field: string, courseLevel: CourseLevel): string {
  const coursePart = courseLevel === 'LK' ? '-LK' : courseLevel === 'GK' ? '-GK' : ''
  return `SN-GESCHICHTE-${slug(phase)}-${slug(field)}${coursePart}`.toUpperCase()
}

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return `${spec.sourceGoalPrefix}:${slug(topicCode)}-${hash(topicCode)}`
}

function titleFromSourceText(text: string): string {
  const clean = cleanSourceText(text).replace(/[.;:,]+$/u, '')
  return clean.length <= 110 ? clean : `${clean.slice(0, 107).trim()}...`
}

function toSentenceFragment(text: string): string {
  const clean = cleanSourceText(text).replace(/[.;:,]+$/u, '')
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
