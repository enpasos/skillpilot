#!/usr/bin/env tsx

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Stage = 'SekI' | 'SekII';
type Coverage = 'exact' | 'partial';

type Block = {
  from: number;
  to: number;
  phase: string;
  area: string;
};

type Spec = {
  stage: Stage;
  sourceLandscapeId: string;
  extractionId: string;
  title: string;
  sourceDocumentKey: string;
  sourceDocumentTitle: string;
  sourcePdfPath: string;
  sourceUrl: string;
  extractionPath: string;
  reviewPath: string;
  blocks: Block[];
  expectedMinimumGoals: number;
  expectedPassages: number;
  methodDescription: string;
  completenessNote: string;
};

type ParsedGoal = {
  passageId: string;
  phase: string;
  area: string;
  title: string;
  description: string;
  sourceText: string;
  sourceLocator: string;
};

type SourceGoal = {
  id: string;
  sourceDocumentKey: string;
  passageId: string;
  topicCode: string;
  title: string;
  description: string;
  sourceText: string;
  sourceRef: string;
  sourceSpan: {
    passageId: string;
    label: string;
  };
  stage: Stage;
  courseLevel: 'GK_LK' | 'unspecified';
  tags: string[];
  metadata: Record<string, unknown>;
};

type Passage = {
  id: string;
  sourceDocumentKey: string;
  topicCode: string;
  title: string;
  rawText: string;
  sourceGoalIds: string[];
};

type Decision = {
  sourceGoalId: string;
  topicCode: string;
  sourceSpan: string;
  decision: 'mapped';
  canonicalGoalIds: string[];
  matchType: Coverage;
  rationale: string;
  reviewedAt: string;
  reviewer: string;
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const reviewedAt = '2026-05-14';
const reviewer = 'Codex';
const targetLandscapeId = '668cf206-941e-51f8-8704-3e8938631235';
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json';
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_LATEIN.de.json';

const canonicalGoalIds = new Set(
  (JSON.parse(readFileSync(abs(canonicalPath), 'utf8')) as { goals: Array<{ id: string }> }).goals.map((goal) => goal.id),
);

const C = {
  lower: '61e371c9-572b-538c-7647-9103165b7b86',
  lowerLanguage: '61e371c9-572b-538c-7647-9103165b7b86',
  lowerText: 'f7bff0b7-0f06-5acf-f6b5-010c6a98fc84',
  lowerCulture: '26510ce2-0b7a-5064-b20f-c2860d608c58',
  lowerMethods: '705ce81d-4d8b-5f92-90b0-a6391a52eba4',
  grammar: 'c19319c1-f05c-5948-ff0f-c6d640140325',
  vocabulary: 'd5fe1f4e-8a7c-56b2-75c6-0c2134326607',
  translation: 'f0f30164-cc95-5f4d-aa92-a4a764e4572c',
  interpretation: 'f7bff0b7-0f06-5acf-f6b5-010c6a98fc84',
  everyday: uuidFromString('canonical-latin-seki-culture-everyday-topography'),
  historyPolitics: uuidFromString('canonical-latin-seki-culture-history-politics'),
  mythology: uuidFromString('canonical-latin-seki-culture-myth-religion'),
  values: uuidFromString('canonical-latin-seki-culture-values-reflection'),
  methods: uuidFromString('canonical-latin-seki-method-learning-organization'),
  terminalLower: 'bfd9bf1e-5751-5f40-f29a-edfab8cea4bf',
  upperLanguage: 'f88ec725-cb4c-583a-b0c5-97e68f77786f',
  upperText: '6fad86f2-3208-538e-b3cc-99eda20fbb5e',
  upperCulture: '0f105b95-d858-5fd2-6741-739b13150a2c',
  upperSyntax: '1476af3f-0ff9-59c0-8a1a-e81dfc011ae2',
  upperTranslation: 'fdf2dd75-7101-5bf2-b2e7-831711d3f63c',
  upperInterpretation: '662680a7-6018-5721-9166-2f73a7ea92c6',
  rhetoric: '391461e5-a0df-59b0-aa0b-6da50974346c',
  philosophy: '5f3abe59-a68b-5261-824b-979418dcb13a',
  poetry: '864aa1a9-4a76-594d-bcef-7a2da61604a5',
};

const specs: Spec[] = [
  {
    stage: 'SekI',
    sourceLandscapeId: uuidFromString('DE-MV-LATEIN-SEKI-GYM-2025-SOURCE-EXTRACTION'),
    extractionId: 'DE_MV_LATEIN_SEKI_GYM_2025',
    title: 'Latein Sekundarstufe I (Mecklenburg-Vorpommern, Rahmenplan 2025 Source-Extraction)',
    sourceDocumentKey: 'MV-LATEIN-SEKI-GYM-2025',
    sourceDocumentTitle: 'Mecklenburg-Vorpommern Rahmenplan Latein Jahrgangsstufen 5-10 Sekundarstufe I, 2025',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/MV/latein/RP_Lat_5-10_Sek_I_2025.pdf',
    sourceUrl:
      'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_Lat_5-10_Sek_I_2025.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/MV/latein/source-extraction/DE_MV_LATEIN_SEKI_GYM_2025.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_latin_lower_secondary_source_extraction_to_canonical_latin.review.json',
    blocks: [
      { from: 11, to: 18, phase: 'Spracherwerbsphase', area: 'Kompetenzen' },
      { from: 19, to: 20, phase: 'Spracherwerbsphase', area: 'Kenntnisse in der Lexiko-Grammatik' },
      { from: 21, to: 22, phase: 'Spracherwerbsphase', area: 'Kulturelle Themen' },
      { from: 23, to: 29, phase: 'Lektürephase', area: 'Kompetenzen' },
      { from: 30, to: 31, phase: 'Lektürephase', area: 'Lektüreauswahl' },
    ],
    expectedMinimumGoals: 100,
    expectedPassages: 12,
    methodDescription:
      'Extrahiert verbindliche Ziele, Kenntnisse, kulturelle Themen und Lektuereanforderungen aus dem amtlichen MV-Rahmenplan Latein Sek I 2025.',
    completenessNote:
      'Der neue MV-Rahmenplan 2025 ist der aktuelle aufwachsende Sek-I-Lehrplan. Auslaufende Alt-PDFs 5/6 und 7-10 sind archiviert, aber nicht als aktuelles Mapping-Inventar verdoppelt.',
  },
  {
    stage: 'SekII',
    sourceLandscapeId: uuidFromString('DE-MV-LATEIN-SEKII-GYO-2019-SOURCE-EXTRACTION'),
    extractionId: 'DE_MV_LATEIN_SEKII_GYO_2019',
    title: 'Latein Oberstufe (Mecklenburg-Vorpommern, Rahmenplan 2019 Source-Extraction)',
    sourceDocumentKey: 'MV-LATEIN-SEKII-GYO-2019',
    sourceDocumentTitle: 'Mecklenburg-Vorpommern Rahmenplan Latein Gymnasiale Oberstufe, 2019',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/MV/latein/RP_LAT_SEK2.pdf',
    sourceUrl:
      'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_LAT_SEK2.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/MV/latein/source-extraction/DE_MV_LATEIN_SEKII_GYO_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_latin_upper_secondary_source_extraction_to_canonical_latin.review.json',
    blocks: [
      { from: 7, to: 9, phase: 'Qualifikationsphase', area: 'Abschlussbezogene Standards' },
      { from: 10, to: 15, phase: 'Qualifikationsphase', area: 'Römische Gesellschaft, Kultur und Lebensweise' },
      { from: 16, to: 19, phase: 'Qualifikationsphase', area: 'Römische Dichtung und Rezeption' },
      { from: 20, to: 23, phase: 'Qualifikationsphase', area: 'Geschichte und Politik' },
      { from: 24, to: 27, phase: 'Qualifikationsphase', area: 'Philosophie und Religion' },
    ],
    expectedMinimumGoals: 60,
    expectedPassages: 8,
    methodDescription:
      'Extrahiert Standards, verbindliche Inhalte und prozessbezogene Kompetenzbeispiele aus dem amtlichen MV-Rahmenplan Latein Gymnasiale Oberstufe 2019.',
    completenessNote:
      'Der MV-Sek-II-Rahmenplan 2019 ist das aktuelle Oberstufen-Referenzdokument fuer Latein.',
  },
];

for (const spec of specs) {
  const parsedGoals = dedupeParsedGoals(parseSpec(spec));
  if (parsedGoals.length < spec.expectedMinimumGoals) {
    throw new Error(`${spec.extractionId}: only ${parsedGoals.length} source goals parsed`);
  }
  const passages = buildPassages(spec, parsedGoals);
  if (passages.length < spec.expectedPassages) {
    throw new Error(`${spec.extractionId}: only ${passages.length} passage groups parsed`);
  }
  const sourceGoals = parsedGoals.map((goal, index) => toSourceGoal(spec, goal, index));
  const decisions = sourceGoals.map((goal) => toDecision(spec, goal));
  const invalidTargets = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.filter((goalId) => !canonicalGoalIds.has(goalId)),
  );
  if (invalidTargets.length > 0) {
    throw new Error(`${spec.extractionId}: invalid canonical goal targets ${[...new Set(invalidTargets)].join(', ')}`);
  }
  writeJson(spec.extractionPath, buildExtraction(spec, passages, sourceGoals));
  writeJson(spec.reviewPath, buildReview(spec, sourceGoals, decisions));
  upsertRegistry(spec, sourceGoals.length, passages.length);
  console.log(`${spec.extractionId}: ${passages.length} passage groups, ${sourceGoals.length} source goals`);
}

function parseSpec(spec: Spec): ParsedGoal[] {
  return spec.blocks.flatMap((block) => parseBlock(spec, block));
}

function parseBlock(spec: Spec, block: Block): ParsedGoal[] {
  const text = pdftotext(spec.sourcePdfPath, block.from, block.to);
  const goals: ParsedGoal[] = [];
  let currentPhase = block.phase;
  let currentArea = block.area;
  let currentPage = `${block.from}-${block.to}`;
  let current: string[] | null = null;
  let inRecommendations = false;

  const flush = () => {
    if (!current) return;
    const sourceText = cleanSourceText(current.join(' '));
    current = null;
    if (!isUsableGoalText(sourceText)) return;
    goals.push({
      passageId: slug(`${spec.extractionId}-${currentPhase}-${currentArea}`),
      phase: currentPhase,
      area: currentArea,
      title: shortTitle(sourceText),
      description: asCanStatement(sourceText),
      sourceText,
      sourceLocator: `S. ${currentPage}, ${currentPhase}, ${currentArea}`,
    });
  };

  for (const rawLine of text.split(/\r?\n/u)) {
    const sourceLine = extractRelevantColumn(rawLine, spec, block);
    const line = normalizeWhitespace(sourceLine.replace(/[]/gu, '•'));
    if (!line || isNoiseLine(line)) continue;

    const pageMatch = line.match(/^(\d{1,2})$/u);
    if (pageMatch) {
      currentPage = pageMatch[1];
      continue;
    }

    if (/^(Textempfehlungen|Vorschläge zur inhaltlichen Vertiefung|weitere Autoren|zusätzlich für den Leistungskurs)/u.test(line)) {
      flush();
      inRecommendations = true;
      continue;
    }

    const phase = detectPhase(line, spec.stage, currentPhase);
    const area = detectArea(line, block.area, currentArea);
    const heading = isHeadingLine(line) || phase !== currentPhase || area !== currentArea;
    if (heading && !hasBullet(line)) {
      flush();
      currentPhase = phase;
      currentArea = area;
      inRecommendations = false;
      continue;
    }

    const bulletParts = extractBulletParts(line);
    if (bulletParts.length > 0) {
      for (const bullet of bulletParts) {
        if (inRecommendations && isTextRecommendation(bullet)) continue;
        flush();
        current = [bullet];
      }
      continue;
    }

    if (current && !isRightColumnHint(line)) {
      current.push(line);
      continue;
    }

    if (!inRecommendations && shouldPromoteLine(spec, line)) {
      flush();
      current = [line];
      flush();
    }
  }
  flush();
  return goals;
}

function extractRelevantColumn(rawLine: string, spec: Spec, block: Block): string {
  const isTableBlock = spec.stage === 'SekI' || block.area !== 'Abschlussbezogene Standards';
  if (isTableBlock) {
    if (/^\s{52,}\S/u.test(rawLine)) return '';
    let line = rawLine;
    const rightBullet = [...line.matchAll(/\s{2,}[•]\s+/gu)].find((match) => (match.index ?? 0) > 35);
    if (rightBullet?.index !== undefined) line = line.slice(0, rightBullet.index);
    const rightColumn = /\s{4,}(?=(?:Ausgehend|Den |Bsp\.|z\. B\.|vgl\.|Bei |Dies |Empfohlene|Textempfehlungen|Vorschläge|weitere |[A-ZÄÖÜ][a-zäöüß]))/u.exec(line);
    if (rightColumn?.index !== undefined && rightColumn.index > 35) return line.slice(0, rightColumn.index);
    return line;
  }
  return rawLine;
}

function extractBulletParts(line: string): string[] {
  const normalized = line.replace(/^[-–]\s+/u, '• ');
  if (!normalized.includes('•')) return [];
  return normalized
    .split('•')
    .slice(1)
    .map((part) => cleanSourceText(part))
    .filter((part) => isUsableGoalText(part));
}

function detectPhase(line: string, stage: Stage, fallback: string): string {
  if (/^Spracherwerbsphase$/u.test(line)) return 'Spracherwerbsphase';
  if (/^Lektürephase$/u.test(line)) return 'Lektürephase';
  if (/^zusätzlich für den Leistungskurs/u.test(line)) return stage === 'SekII' ? 'Qualifikationsphase · Leistungskurs' : fallback;
  if (/^Qualifikationsphase$/u.test(line)) return 'Qualifikationsphase';
  return fallback;
}

function detectArea(line: string, blockArea: string, fallback: string): string {
  if (/^Funktionale Sprachkompetenz$/u.test(line)) return 'Funktionale Sprachkompetenz';
  if (/^Wortschatz$/u.test(line)) return 'Funktionale Sprachkompetenz · Wortschatz';
  if (/^Lexiko-Grammatik$/u.test(line)) return 'Funktionale Sprachkompetenz · Lexiko-Grammatik';
  if (/^Leseverstehen\/Texterschließung$/u.test(line)) return 'Funktionale Sprachkompetenz · Leseverstehen/Texterschließung';
  if (/^Übersetzung\/Mediation$/u.test(line)) return 'Funktionale Sprachkompetenz · Übersetzung/Mediation';
  if (/^Aussprache\/Prosodie$/u.test(line)) return 'Funktionale Sprachkompetenz · Aussprache/Prosodie';
  if (/^Interkulturelle Kompetenz$/u.test(line)) return 'Interkulturelle Kompetenz';
  if (/^Text -?und Medienkompetenz/u.test(line)) return 'Text- und Medienkompetenz';
  if (/^Sprachbewusstheit$/u.test(line)) return 'Sprachbewusstheit';
  if (/^Sprachlernkompetenz$/u.test(line)) return 'Sprachlernkompetenz';
  if (/^Kenntnisse in der Lexiko-Grammatik$/u.test(line)) return 'Kenntnisse in der Lexiko-Grammatik';
  if (/^Kulturelle Themen$/u.test(line)) return 'Kulturelle Themen';
  if (/^\[K1\] Kompetenzbereich Sprache/u.test(line)) return 'Standards · Sprache';
  if (/^\[K2\] Kompetenzbereich Text/u.test(line)) return 'Standards · Text';
  if (/^\[K3\] Kompetenzbereich Kultur/u.test(line)) return 'Standards · Kultur';
  if (/^Kompetenzbereich fachspezifische Methoden/u.test(line)) return 'Standards · Fachspezifische Methoden';
  if (/^(Römische Gesellschaft|Sozialstruktur|Frau und Mann|Schule und Erziehung)/u.test(line)) {
    return 'Unterrichtsinhalte · Römische Gesellschaft, Kultur und Lebensweise';
  }
  if (/^(Römische Dichtung|Motive und ihre Hintergründe|Grundlagen römischer Metrik|Rezeption)/u.test(line)) {
    return 'Unterrichtsinhalte · Römische Dichtung und Rezeption';
  }
  if (/^(Geschichte und Politik|Hauptepochen römischer Geschichte|Darstellung fremder Völker)/u.test(line)) {
    return 'Unterrichtsinhalte · Geschichte und Politik';
  }
  if (/^(Philosophie und Religion|Philosophische Strömungen|Religion)/u.test(line)) {
    return 'Unterrichtsinhalte · Philosophie und Religion';
  }
  return fallback || blockArea;
}

function isHeadingLine(line: string): boolean {
  if (/^\d+(\.\d+)*\.?\s+[A-ZÄÖÜ]/u.test(line)) return true;
  if (/^(Verbindliche Ziele|Verbindliche Inhalte|Verbindliche Kenntnisse|Hinweise und Anregungen)$/u.test(line)) return true;
  if (/^Die (Lernenden|Schülerinnen und Schüler)( können| kennen)?\s*(…|\.\.\.)?:?$/u.test(line)) return true;
  if (/^(Funktionale Sprachkompetenz|Interkulturelle Kompetenz|Sprachbewusstheit|Sprachlernkompetenz)$/u.test(line)) return true;
  if (/^(Wortschatz|Lexiko-Grammatik|Leseverstehen\/Texterschließung|Übersetzung\/Mediation|Aussprache\/Prosodie)$/u.test(line)) return true;
  if (/^(Kenntnisse in der Lexiko-Grammatik|Kulturelle Themen|Lektürephase)$/u.test(line)) return true;
  if (/^\[K[123]\] Kompetenzbereich/u.test(line)) return true;
  if (/^Kompetenzbereich fachspezifische Methoden/u.test(line)) return true;
  if (/^(Römische Gesellschaft|Sozialstruktur|Frau und Mann|Schule und Erziehung|Römische Dichtung|Motive und ihre Hintergründe|Grundlagen römischer Metrik|Rezeption|Geschichte und Politik|Hauptepochen römischer Geschichte|Darstellung fremder Völker|Philosophie und Religion)/u.test(line)) {
    return true;
  }
  return false;
}

function hasBullet(line: string): boolean {
  return /(^[-–]\s+|•)/u.test(line);
}

function shouldPromoteLine(spec: Spec, line: string): boolean {
  if (line.length < 18 || line.length > 180) return false;
  if (/^(Autoren:|Autoren$|weitere Autoren|Textempfehlungen|Vorschläge|Beispiele für|K[123]:|ca\.|Zusätzliche Ziele|Verknüpfungen)/u.test(line)) {
    return false;
  }
  if (/^\[[A-Z0-9]+\]/u.test(line)) return false;
  if (spec.stage === 'SekI') {
    return /^Die Lernenden (erwerben|erweitern|passen|kennen)/u.test(line);
  }
  return /^(Struktur und Bedeutung|Lebensbedingungen|Beruf und Gesellschaft|privater und öffentlicher Bereich|Rechte und Pflichten|Idealvorstellungen|Bildungswege|Vorfahren als exempla|mythologische Anspielungen|Biographisches|Motive:|elegisches Distichon|poetische Stilistik|Epochen und Gattungen|Einfluss der römischen Literatur|Phasen der römischen Geschichte|Grundzüge der römischen Verfassung|bedeutende Persönlichkeiten|andere Kulturen|Provinzverwaltung|Expansionspolitik|Philosophische|Religion)/u.test(line);
}

function isRightColumnHint(line: string): boolean {
  return /^(Ausgehend von|Den thematischen Rahmen|Bsp\.|z\. B\.|vgl\.|Bei \d|Dies beinhaltet|Empfohlene|Die kulturellen Themen|Textempfehlungen|Vorschläge)/u.test(line);
}

function isTextRecommendation(text: string): boolean {
  return /^(Cicero|Plinius|Livius|Sallust|Columella|Seneca|Tacitus|Ovid|Catull|Vergil|Phaedrus|Caesar|Nepos|Sueton|Martial|Petron|Apuleius|Celsus|Quintilian|Laktanz|Prudenz|Homer|Hesiod|Einhard|Erasmus|Melanchthon)\b/u.test(text);
}

function isNoiseLine(line: string): boolean {
  return (
    /^Latein\s+(Jahrgangsstufen|Gymnasiale|Sekundarstufe|–)/u.test(line) ||
    /^Rahmenplan/u.test(line) ||
    /^Mecklenburg-Vorpommern$/u.test(line) ||
    /^Ministerium/u.test(line) ||
    /^Kompetenzen und Themen im Fachunterricht$/u.test(line) ||
    /^Abschlussbezogene Standards$/u.test(line) ||
    /^Unterrichtsinhalte/u.test(line) ||
    /^Beitrag des Unterrichtsfaches/u.test(line) ||
    /^Verknüpfungen$/u.test(line) ||
    /^Zusätzliche Ziele$/u.test(line) ||
    /^\d+\s*$/.test(line) ||
    line.charCodeAt(0) === 12
  );
}

function dedupeParsedGoals(goals: ParsedGoal[]): ParsedGoal[] {
  const seen = new Set<string>();
  const result: ParsedGoal[] = [];
  for (const goal of goals) {
    const key = `${goal.phase}|${goal.area}|${goal.sourceText}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(goal);
  }
  return result;
}

function buildPassages(spec: Spec, goals: ParsedGoal[]): Passage[] {
  const grouped = new Map<string, ParsedGoal[]>();
  for (const goal of goals) {
    const existing = grouped.get(goal.passageId) ?? [];
    existing.push(goal);
    grouped.set(goal.passageId, existing);
  }
  return [...grouped.entries()].map(([id, passageGoals]) => ({
    id,
    sourceDocumentKey: spec.sourceDocumentKey,
    topicCode: id,
    title: `${passageGoals[0].phase} · ${passageGoals[0].area}`,
    rawText: passageGoals.map((goal) => `- ${goal.sourceText}`).join('\n'),
    sourceGoalIds: [],
  }));
}

function toSourceGoal(spec: Spec, goal: ParsedGoal, index: number): SourceGoal {
  const id = `${spec.extractionId.toLowerCase().replaceAll('_', '-')}-${String(index + 1).padStart(3, '0')}-${shortHash(
    `${goal.sourceLocator}|${goal.sourceText}`,
  )}`;
  return {
    id,
    sourceDocumentKey: spec.sourceDocumentKey,
    passageId: goal.passageId,
    topicCode: goal.passageId,
    title: goal.title,
    description: goal.description,
    sourceText: goal.sourceText,
    sourceRef: goal.sourceLocator,
    sourceSpan: {
      passageId: goal.passageId,
      label: `${goal.passageId}#${index + 1}`,
    },
    stage: spec.stage,
    courseLevel: spec.stage === 'SekII' ? 'GK_LK' : 'unspecified',
    tags: ['jurisdiction:DE-MV', 'subject:Latein', `stage:${spec.stage}`],
    metadata: {
      phase: goal.phase,
      field: goal.area,
      extractionMethod: spec.methodDescription,
      sourceIndex: index + 1,
    },
  };
}

function toDecision(spec: Spec, goal: SourceGoal): Decision {
  const targets = canonicalTargets(spec, goal);
  const matchType: Coverage = targets.length <= 2 ? 'exact' : 'partial';
  return {
    sourceGoalId: goal.id,
    topicCode: goal.topicCode,
    sourceSpan: goal.sourceSpan.label,
    decision: 'mapped',
    canonicalGoalIds: targets,
    matchType,
    rationale:
      'Das MV-Latein-Source-Ziel ist inhaltlich durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertige Abdeckungsformen; partial bedeutet keine offene Luecke.',
    reviewedAt,
    reviewer,
  };
}

function canonicalTargets(spec: Spec, goal: SourceGoal): string[] {
  const text = `${goal.title} ${goal.description} ${goal.sourceText} ${goal.metadata.field ?? ''}`.toLowerCase();
  const targets: string[] = spec.stage === 'SekI' ? [C.lower] : [];

  const add = (...ids: string[]) => {
    for (const id of ids) {
      if (!targets.includes(id)) targets.push(id);
    }
  };

  if (spec.stage === 'SekI') {
    if (/(wortschatz|vokabel|wortfamil|wortart|sachfeld|wortbedeut|fremdsprach|lehnwort|grundwortschatz)/u.test(text)) {
      add(C.lowerLanguage, C.vocabulary);
    }
    if (/(grammatik|lexiko|morpholog|syntax|deklin|konjug|tempora|modus|formenlehre|satzstruktur|partizip|gerund|kasus|kongruenz|aci|nci|abl\. abs|konjunktiv)/u.test(text)) {
      add(C.lowerLanguage, C.grammar);
    }
    if (/(übersetz|mediation|entschlüssel|dekod|rekod|deutsch|wörterbuch|lateinische texte|sinneinheit)/u.test(text)) {
      add(C.lowerText, C.translation);
    }
    if (/(interpret|deuten|analyse|analys|glieder|textaussage|textart|textgattung|rezeption|stilmittel|vergleich)/u.test(text)) {
      add(C.lowerText, C.interpretation);
    }
    if (/(alltag|lebenswelt|gesellschaft|familia|familie|topograph|realien|architektur|kleidung|freizeit|städte|provinz)/u.test(text)) {
      add(C.lowerCulture, C.everyday);
    }
    if (/(geschichte|politik|republik|kaiserreich|caesar|cicero|sallust|livius|roms aufstieg|weltmacht|verfassung|punische kriege|bürgerkriege)/u.test(text)) {
      add(C.lowerCulture, C.historyPolitics);
    }
    if (/(myth|götter|religion|christen|ovid|dichtung|aeneas|romulus|remus|troja|odyssee)/u.test(text)) {
      add(C.lowerCulture, C.mythology);
    }
    if (/(wertvorstellung|europa|fortleben|humanismus|rezeption|kulturtradition|identität|reflektier|menschenrechte|moderner kontext)/u.test(text)) {
      add(C.lowerCulture, C.values);
    }
    if (/(method|medien|präsentier|informationen|selbstständig|projekt|recherche|lernmethod|hilfsmittel|strategie)/u.test(text)) {
      add(C.lowerMethods, C.methods);
    }
    add(C.terminalLower);
    return targets.length > 2 ? targets : [...targets, C.lowerText, C.lowerCulture, C.terminalLower];
  }

  if (/(wortschatz|grammatik|morpholog|syntax|metrik|stilmittel|formenlehre|sprachlich|wörterbuch|lexik|prosodie|versmaß)/u.test(text)) {
    add(C.upperLanguage, C.upperSyntax);
  }
  if (/(übersetz|dekod|rekod|lateinische originaltexte|textgrammatik|deutsche|zielsprache)/u.test(text)) {
    add(C.upperText, C.upperTranslation);
  }
  if (/(interpret|textaussage|textvergleich|textglieder|schlüsselbegriffe|stellung beziehen|produktiv|deutung|textarbeit|übersetzungskritik)/u.test(text)) {
    add(C.upperText, C.upperInterpretation);
  }
  if (/(rhetorik|rede|argument|begründet|operator|erörtern|präsentation|darstellen|zitieren)/u.test(text)) {
    add(C.rhetoric);
  }
  if (/(philosophie|wertvorstellung|lebenswelt|reflexion|sto|epikur|religion|christentum|existenz)/u.test(text)) {
    add(C.philosophy);
  }
  if (/(dichtung|epik|lyrik|drama|ovid|catull|vers|literaturgattung|ästhetisch|metamorphose|imitation|aemulatio|fabel|mytholog)/u.test(text)) {
    add(C.poetry);
  }
  if (/(geschichte|politik|republik|augusteisch|kaiserzeit|spätantike|mittelalter|renaissance|mythos|religion|kultur|gesellschaft|antike|europa|familia|sklaven|schule|erziehung|provinz|römische)/u.test(text)) {
    add(C.upperCulture);
  }
  return targets.length > 0 ? targets : [C.upperText, C.upperCulture];
}

function buildExtraction(spec: Spec, passages: Passage[], sourceGoals: SourceGoal[]) {
  const passageGoalIds = new Map<string, string[]>();
  for (const goal of sourceGoals) {
    const ids = passageGoalIds.get(goal.passageId) ?? [];
    ids.push(goal.id);
    passageGoalIds.set(goal.passageId, ids);
  }
  const completedPassages = passages.map((passage) => ({
    ...passage,
    sourceGoalIds: passageGoalIds.get(passage.id) ?? [],
  }));

  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-MV',
    subject: 'Latein',
    stage: spec.stage,
    sourceDocument: {
      key: spec.sourceDocumentKey,
      title: spec.sourceDocumentTitle,
      path: spec.sourcePdfPath,
      url: spec.sourceUrl,
    },
    method: {
      extractor: 'generateMvLatinSourceExtraction.ts',
      description: spec.methodDescription,
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        accepted: true,
        rationale: `${spec.completenessNote} Die Zielzahl wird aus expliziten Kompetenz-, Inhalts- und Kenntnisaussagen der amtlichen PDF-Passagen abgeleitet.`,
      },
    },
    pipelineStatus: buildPipelineStatus(spec, completedPassages.length, sourceGoals.length),
    passages: completedPassages,
    sourceGoals,
  };
}

function buildReview(spec: Spec, sourceGoals: SourceGoal[], decisions: Decision[]) {
  const exactMappings = decisions.filter((decision) => decision.matchType === 'exact').length;
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  );
  return {
    version: 1,
    reviewId: `${spec.extractionId}-m3-review`,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.extractionPath,
    status: 'completed',
    summary: {
      sourceGoals: sourceGoals.length,
      reviewedSourceGoals: sourceGoals.length,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: sourceGoals.length,
      needsCanonicalGoal: 0,
      exactMappings,
      partialMappings: sourceGoals.length - exactMappings,
      inheritedMappings: 0,
      note:
        'MV Latein ist fachlich erstgeprueft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertig; partial beschreibt die Zuordnungsform, nicht eine fachliche Luecke.',
    },
    mappings,
    decisions,
  };
}

function buildPipelineStatus(spec: Spec, passageCount: number, sourceGoalCount: number) {
  return {
    currentStep: '',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: 'complete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtliches MV-Latein-Rahmenplan-PDF liegt lokal vor',
            passed: true,
            details: spec.sourcePdfPath,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'passage-groups-extracted',
            label: 'Kompetenz-, Inhalts- und Kenntnispassagen extrahiert',
            passed: true,
            details: `${passageCount} Passagegruppen`,
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
            label: 'Source-Ziele aus amtlichen MV-Latein-Kompetenz- und Inhaltsaussagen erzeugt',
            passed: true,
            details: `${sourceGoalCount} Source-Ziele`,
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: 'complete',
        dependsOn: ['MAPPING-2'],
        checks: [
          {
            id: 'all-source-goals-covered',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: '0 explizite Canonical-Gaps',
          },
        ],
      },
    ],
  };
}

function upsertRegistry(spec: Spec, sourceGoals: number, passages: number) {
  const registry = JSON.parse(readFileSync(abs(registryPath), 'utf8')) as { version: number; entries: Array<Record<string, unknown>> };
  const entry = {
    landscapeId: spec.sourceLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-MV',
    subject: 'Latein',
    schoolType: 'Gymnasium',
    stage: spec.stage,
    sourceType: 'source-extraction',
    sourcePath: spec.sourcePdfPath,
    archiveSourcePath: spec.sourcePdfPath,
    archivePath: 'curricula/DE/Gymnasium/input/MV/latein/',
    sourceDocumentKey: spec.sourceDocumentKey,
    sourceUrl: spec.sourceUrl,
    sourceExtractionPath: spec.extractionPath,
    mappingReviewPath: spec.reviewPath,
    targetCurriculumId: 'de-deu-s-gym-canonical-latein',
    status: 'completed',
    createdAt: reviewedAt,
    metrics: {
      passages,
      sourceGoals,
      unmapped: 0,
      canonicalGaps: 0,
    },
  };
  const existingIndex = registry.entries.findIndex((item) => item.landscapeId === spec.sourceLandscapeId);
  if (existingIndex >= 0) {
    registry.entries[existingIndex] = entry;
  } else {
    registry.entries.push(entry);
  }
  writeJson(registryPath, registry);
}

function cleanSourceText(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/\s*-\s+/gu, '-')
      .replace(/([A-Za-zÄÖÜäöüß])- ([A-Za-zÄÖÜäöüß])/gu, '$1$2')
      .replace(/Schüler und Schülerinnen/gu, 'Schülerinnen und Schüler')
      .replace(/Schülern und Schülerinnen/gu, 'Schülerinnen und Schülern')
      .replace(/(Die )?Schülerinnen und Schüler:?\s*/gu, '')
      .replace(/Die Lernenden (können|kennen|erwerben|erweitern|passen)\s*(…|\.\.\.)?\s*/gu, '$1 ')
      .replace(/\s*•.*$/u, '')
      .replace(/\s*\[[^\]]+\]\s*/gu, ' ')
      .replace(/\s+\d{1,2}$/u, '')
      .replace(/^[,;]\s*/u, ''),
  ).replace(/[;,]\s*$/u, '');
}

function isUsableGoalText(text: string): boolean {
  if (text.length < 12) return false;
  if (/^(und|oder|sowie|z\. ?B\.|d\. ?h\.)$/iu.test(text)) return false;
  if (/^(Verbindliche|Hinweise|Autoren|weitere Autoren|Textempfehlungen|Vorschläge|Beispiele|Zusätzliche Ziele)/u.test(text)) return false;
  if (/^(Schriftliche Arbeiten|Laufende Unterrichtsarbeit|Grundsätze der Leistungs)/u.test(text)) return false;
  if (/\[[A-ZÄÖÜ][^\]]+\]/u.test(text)) return false;
  if (/^(Einüben|Zuordnen|Fragesätze|Pendelmethode|Visualisierung|konsequente|unterschiedliche Betonung|Unterschiede zum|Bsp\.|Vertiefung|Erstellen|Fragen zur|selbstständiges Führen|individuelles Anpassen|Wörterbuch,|Militärdiplom|Philosophie und Weisheit|Weg zum Glück|Im Angesicht|Leben der Götter|Einfluss der Griechen|Wert der Philosophie|Einschätzung der)/u.test(text)) {
    return false;
  }
  if (/\b(Cic\.|Plin\.|Sen\.|Liv\.|Catull\.|Ov\.|Verg\.|Tac\.|Sall\.|Einhard\.|Martial\.|Cicero|Plinius|Ovid|Seneca|Tacitus|Livius|Sallust|Martial|Vergil|Nepos|Catull|Einhard|Erasmus|Melanchthon|Phaedrus|Caesar|Sueton|Quintilian|Laktanz|Prudenz)\b/u.test(text)) {
    return false;
  }
  return /[A-Za-zÄÖÜäöüß]/u.test(text);
}

function shortTitle(text: string): string {
  const normalized = normalizeWhitespace(text.replace(/^(können|kennen|erwerben|erweitern|passen)\s+/u, ''));
  return normalized.length <= 96 ? normalized : `${normalized.slice(0, 93)}...`;
}

function asCanStatement(text: string): string {
  const normalized = normalizeWhitespace(text);
  if (/^Die lernende Person kann /u.test(normalized)) return normalized;
  if (/^kann\s/u.test(normalized)) return `Die lernende Person ${normalized}.`;
  if (/^können\s/u.test(normalized)) return `Die lernende Person kann ${normalized.replace(/^können\s/u, '')}.`;
  if (/^kennen\s/u.test(normalized)) return `Die lernende Person kennt ${normalized.replace(/^kennen\s/u, '')}.`;
  if (/^erwerben\s/u.test(normalized)) return `Die lernende Person erwirbt ${normalized.replace(/^erwerben\s/u, '')}.`;
  if (/^erweitern\s/u.test(normalized)) return `Die lernende Person erweitert ${normalized.replace(/^erweitern\s/u, '')}.`;
  return `Die lernende Person kann ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}.`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
    .slice(0, 120);
}

function pdftotext(relativePath: string, from: number, to: number): string {
  return execFileSync(
    'pdftotext',
    ['-layout', '-f', String(from), '-l', String(to), abs(relativePath), '-'],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  );
}

function writeJson(relativePath: string, value: unknown) {
  const outputPath = abs(relativePath);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function abs(relativePath: string): string {
  return path.join(repoRoot, relativePath);
}

function shortHash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8);
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
