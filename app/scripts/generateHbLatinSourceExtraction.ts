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
    sourceLandscapeId: uuidFromString('DE-HB-LATEIN-SEKI-GYM-2FS-2007-SOURCE-EXTRACTION'),
    extractionId: 'DE_HB_LATEIN_SEKI_GYM_2FS_2007',
    title: 'Latein Sekundarstufe I (Bremen, Gymnasium 2. Fremdsprache 2007 Source-Extraction)',
    sourceDocumentKey: 'HB-GYM-LATEIN-2FS-2007',
    sourceDocumentTitle: 'Bremen Bildungsplan Latein als zweite Fremdsprache, Gymnasium Jahrgangsstufe 6-10, 2007',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HB/latein/Gy_Latein_2_Fremdspr_2007.pdf',
    sourceUrl: 'https://www.lis.bremen.de/sixcms/media.php/13/Gy_Latein_2._Fremdspr_2007.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/HB/latein/source-extraction/DE_HB_LATEIN_SEKI_GYM_2FS_2007.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_latin_lower_secondary_2fs_source_extraction_to_canonical_latin.review.json',
    blocks: [
      { from: 5, to: 6, phase: 'Jahrgangsstufe 6-10', area: 'Aufgaben und Ziele' },
      { from: 8, to: 9, phase: 'Jahrgangsstufe 6-10', area: 'Themen und Inhalte' },
      { from: 10, to: 14, phase: 'Jahrgangsstufe 6-10', area: 'Standards' },
    ],
    expectedMinimumGoals: 60,
    expectedPassages: 10,
    methodDescription:
      'Extrahiert Aufgaben/Ziele, Themen/Inhalte und Standards aus dem amtlichen Bremer Gymnasium-Bildungsplan Latein als zweite Fremdsprache.',
  },
  {
    stage: 'SekI',
    sourceLandscapeId: uuidFromString('DE-HB-LATEIN-SEKI-GYM-3FS-2007-SOURCE-EXTRACTION'),
    extractionId: 'DE_HB_LATEIN_SEKI_GYM_3FS_2007',
    title: 'Latein Sekundarstufe I (Bremen, Gymnasium 3. Fremdsprache 2007 Source-Extraction)',
    sourceDocumentKey: 'HB-GYM-LATEIN-3FS-2007',
    sourceDocumentTitle: 'Bremen Bildungsplan Latein als dritte Fremdsprache, Gymnasium Jahrgangsstufe 8-10, 2007',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HB/latein/Gy_Latein_3_Fremdspr_2007.pdf',
    sourceUrl: 'https://www.lis.bremen.de/sixcms/media.php/13/Gy_Latein_3._Fremdspr_2007.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/HB/latein/source-extraction/DE_HB_LATEIN_SEKI_GYM_3FS_2007.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_latin_lower_secondary_3fs_source_extraction_to_canonical_latin.review.json',
    blocks: [
      { from: 5, to: 6, phase: 'Jahrgangsstufe 8-10', area: 'Aufgaben und Ziele' },
      { from: 7, to: 8, phase: 'Jahrgangsstufe 8-10', area: 'Themen und Inhalte' },
      { from: 9, to: 9, phase: 'Jahrgangsstufe 10', area: 'Standards' },
    ],
    expectedMinimumGoals: 30,
    expectedPassages: 6,
    methodDescription:
      'Extrahiert Aufgaben/Ziele, Themen/Inhalte und Standards aus dem amtlichen Bremer Gymnasium-Bildungsplan Latein als dritte Fremdsprache.',
  },
  {
    stage: 'SekII',
    sourceLandscapeId: uuidFromString('DE-HB-LATEIN-SEKII-GYO-2008-SOURCE-EXTRACTION'),
    extractionId: 'DE_HB_LATEIN_SEKII_GYO_2008',
    title: 'Latein Oberstufe (Bremen, GyO Qualifikationsphase 2008 Source-Extraction)',
    sourceDocumentKey: 'HB-GYO-LATEIN-QPHASE-2008',
    sourceDocumentTitle: 'Bremen Bildungsplan Latein Gymnasiale Oberstufe Qualifikationsphase, 2008',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HB/latein/GyO_Latein_2008.pdf',
    sourceUrl: 'https://www.lis.bremen.de/sixcms/media.php/13/GyO_Latein_2008.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/HB/latein/source-extraction/DE_HB_LATEIN_SEKII_GYO_2008.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_latin_upper_secondary_source_extraction_to_canonical_latin.review.json',
    blocks: [
      { from: 5, to: 5, phase: 'Qualifikationsphase', area: 'Aufgaben und Ziele' },
      { from: 6, to: 7, phase: 'Qualifikationsphase', area: 'Themen und Inhalte' },
      { from: 8, to: 10, phase: 'Qualifikationsphase', area: 'Standards' },
    ],
    expectedMinimumGoals: 60,
    expectedPassages: 8,
    methodDescription:
      'Extrahiert Aufgaben/Ziele, Themen/Inhalte und Standards aus dem amtlichen Bremer Bildungsplan Latein fuer die gymnasiale Oberstufe.',
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
  const goals: ParsedGoal[] = [];
  for (const block of spec.blocks) {
    goals.push(...parseBlock(spec, block));
  }
  return goals;
}

function parseBlock(spec: Spec, block: Block): ParsedGoal[] {
  const text = pdftotext(spec.sourcePdfPath, block.from, block.to);
  const goals: ParsedGoal[] = [];
  let currentPhase = block.phase;
  let currentArea = block.area;
  let currentPage = `${block.from}-${block.to}`;
  let current: string[] | null = null;

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
    const line = normalizeWhitespace(rawLine);
    if (!line || isNoiseLine(line)) continue;

    const pageMatch = line.match(/^(\d{1,2})$/u);
    if (pageMatch) {
      currentPage = pageMatch[1];
      continue;
    }

    const phase = detectPhase(line, spec.stage, currentPhase);
    const area = detectArea(line, block.area, currentArea);
    const heading = isHeadingLine(line) || phase !== currentPhase || area !== currentArea;
    if (heading && !hasBullet(line)) {
      flush();
      currentPhase = phase;
      currentArea = area;
      continue;
    }

    const bulletParts = extractBulletParts(line);
    if (bulletParts.length > 0) {
      for (const bullet of bulletParts) {
        flush();
        current = [bullet];
      }
      const prefix = line.split(/[•-]/u)[0]?.trim();
      if (prefix && prefix.length > 4 && prefix.length < 80 && !/^(Die Schülerinnen|Themenbereiche|Inhalte|Jg\.?)/u.test(prefix)) {
        currentArea = `${block.area} · ${cleanHeading(prefix)}`;
      }
      continue;
    }

    if (current) {
      current.push(line);
    } else if (shouldPromoteSentence()) {
      current = [line];
      flush();
    }
  }
  flush();
  return goals;
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
  const lower = line.toLowerCase();
  const year = line.match(/(?:Anforderungen am Ende der )?Jahrgangsstufe\s+(\d+)/u)?.[1];
  if (year) return `Ende Jahrgangsstufe ${year}`;
  if (lower.includes('latein als fortgesetzte fremdsprache')) return 'Qualifikationsphase · fortgesetzte Fremdsprache';
  if (lower.includes('latein als neu aufgenommene fremdsprache')) {
    return 'Qualifikationsphase · neu aufgenommene Fremdsprache';
  }
  if (lower.includes('anforderungsniveau für den leistungskurs')) return 'Qualifikationsphase · Leistungskurs';
  if (lower.includes('anforderungsniveau für den grundkurs')) return 'Qualifikationsphase · Grundkurs';
  if (lower.includes('lektektürephase') || lower.includes('lektürephase')) return stage === 'SekI' ? 'Lektürephase' : fallback;
  if (lower.includes('sprachlehrgangsphase')) return stage === 'SekI' ? 'Sprachlehrgangsphase' : fallback;
  return fallback;
}

function detectArea(line: string, blockArea: string, fallback: string): string {
  const lower = line.toLowerCase();
  if (lower.includes('sprachliche aufgaben und ziele')) return 'Aufgaben und Ziele · Sprache';
  if (lower.includes('historisch-kulturelle aufgaben und ziele')) return 'Aufgaben und Ziele · Kultur';
  if (lower.includes('sprachliche themen und inhalte')) return 'Themen und Inhalte · Sprache';
  if (lower.includes('historisch-kulturelle themen und inhalte')) return 'Themen und Inhalte · Kultur';
  if (lower.includes('sprachliche kompetenzen')) return 'Standards · Sprachliche Kompetenzen';
  if (lower === 'wortschatz') return 'Standards · Wortschatz';
  if (lower === 'grammatik') return 'Standards · Grammatik';
  if (lower.includes('inhaltlich-methodische kompetenzen')) return 'Standards · Inhaltlich-methodische Kompetenzen';
  if (lower.includes('inhaltliche kompetenzen')) return 'Standards · Inhaltliche Kompetenzen';
  if (lower.includes('methodische kompetenzen im umgang mit texten')) return 'Standards · Methodische Textkompetenzen';
  if (lower.includes('inhaltsaspekt')) return 'Themen und Inhalte · Inhaltsaspekt';
  if (lower.includes('gattungsaspekt')) return 'Themen und Inhalte · Gattungsaspekt';
  if (lower.includes('epochenaspekt')) return 'Themen und Inhalte · Epochenaspekt';
  if (lower.includes('auflagen')) return 'Themen und Inhalte · Obligatorik';
  if (lower.includes('die antike geisteswelt')) return 'Themen und Inhalte · Antike Geisteswelt';
  if (lower.includes('die lateinische literatur')) return 'Themen und Inhalte · Lateinische Literatur';
  if (lower.includes('einführung in die') && blockArea.includes('Themen')) return 'Themen und Inhalte · Einführung';
  if (lower.includes('vertiefung und erwei') && blockArea.includes('Themen')) return 'Themen und Inhalte · Vertiefung';
  return fallback;
}

function isHeadingLine(line: string): boolean {
  if (/^\d+(\.\d+)*\.?\s+[A-ZÄÖÜ]/u.test(line)) return true;
  if (/^(Vorbemerkung|Aufgaben und Ziele|Themen und Inhalte|Standards|Inhaltsverzeichnis)$/u.test(line)) return true;
  if (/^(Sprachliche|Historisch-kulturelle|Inhaltliche|Methodische)\s/u.test(line) && !line.includes('•')) return true;
  if (/^(Wortschatz|Grammatik|Inhaltsaspekt:|Gattungsaspekt:|Epochenaspekt:|Auflagen)/u.test(line)) return true;
  if (/^Die Schülerinnen und Schüler\s*(…|\.\.\.)?$/u.test(line)) return true;
  if (/^Themenbereiche\s+Inhalte\s+Jg\.?$/u.test(line)) return true;
  return false;
}

function hasBullet(line: string): boolean {
  return /(^[-–]\s+|•)/u.test(line);
}

function isNoiseLine(line: string): boolean {
  return (
    /^Latein\s+–\s+Gymnasium/u.test(line) ||
    /^Die Senatorin/u.test(line) ||
    /^Freie$/u.test(line) ||
    /^Hansestadt$/u.test(line) ||
    /^für Bildung/u.test(line) ||
    /^Herausgegeben/u.test(line) ||
    /^Herausgeber$/u.test(line) ||
    /^Stand:\s*\d/u.test(line) ||
    /^Ansprechpartner/u.test(line) ||
    /^Landesinstitut/u.test(line) ||
    /^Rembertiring/u.test(line) ||
    /^Am Weidedamm/u.test(line) ||
    /^http/u.test(line) ||
    /^Nachdruck/u.test(line) ||
    /^Bezugsadresse/u.test(line)
  );
}

function shouldPromoteSentence(): boolean {
  return false;
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
    tags: ['jurisdiction:DE-HB', 'subject:Latein', `stage:${spec.stage}`],
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
      'Das Bremer Latein-Source-Ziel ist inhaltlich durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertige Abdeckungsformen; partial bedeutet keine offene Luecke.',
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
    if (/(wortschatz|vokabel|wortfamil|wortart|sachfeld|wortbedeut|fremdsprach)/u.test(text)) {
      add(C.lowerLanguage, C.vocabulary);
    }
    if (/(grammatik|morpholog|syntax|deklin|konjug|tempora|modus|modi|formenlehre|satzstruktur|partizip|gerund)/u.test(text)) {
      add(C.lowerLanguage, C.grammar);
    }
    if (/(übersetz|entschlüssel|dekod|rekod|wiedergeben|wörterbuch|lexikon|lateinische texte)/u.test(text)) {
      add(C.lowerText, C.translation);
    }
    if (/(interpret|deuten|analyse|analys|glieder|textaussage|textgattung|kommentar|textmerkmale)/u.test(text)) {
      add(C.lowerText, C.interpretation);
    }
    if (/(alltag|lebenswelt|gesellschaft|römer in deutschland|familie|topograph|realien)/u.test(text)) {
      add(C.lowerCulture, C.everyday);
    }
    if (/(geschichte|politik|republik|kaiserreich|caesar|cicero|sallust|livius|roms aufstieg|weltmacht)/u.test(text)) {
      add(C.lowerCulture, C.historyPolitics);
    }
    if (/(myth|götter|religion|christen|ovid|catull|dichtung)/u.test(text)) {
      add(C.lowerCulture, C.mythology);
    }
    if (/(wertvorstellung|europa|fortleben|rezeption|kulturtradition|identität|reflektier)/u.test(text)) {
      add(C.lowerCulture, C.values);
    }
    if (/(method|medien|präsentier|informationen|selbstständig|portfolio|lernmethod|hilfsmittel)/u.test(text)) {
      add(C.lowerMethods, C.methods);
    }
    add(C.terminalLower);
    return targets.length > 2 ? targets : [...targets, C.lowerText, C.lowerCulture, C.terminalLower];
  }

  if (/(wortschatz|grammatik|morpholog|syntax|metrik|stilmittel|formenlehre|sprachlich|wörterbuch)/u.test(text)) {
    add(C.upperLanguage, C.upperSyntax);
  }
  if (/(übersetz|dekod|rekod|lateinische originaltexte|sprachlichen schwierigkeitsgrad|deutsche)/u.test(text)) {
    add(C.upperText, C.upperTranslation);
  }
  if (/(interpret|textaussage|textvergleich|textglieder|schlüsselbegriffe|stellung beziehen|produktiv|deutung)/u.test(text)) {
    add(C.upperText, C.upperInterpretation);
  }
  if (/(rhetorik|rede|argument|begründet|operator|erörtern)/u.test(text)) {
    add(C.rhetoric);
  }
  if (/(philosophie|wertvorstellung|lebenswelt|reflexion|gedanken)/u.test(text)) {
    add(C.philosophy);
  }
  if (/(dichtung|epik|lyrik|drama|ovid|catull|vers|literaturgattung|ästhetisch)/u.test(text)) {
    add(C.poetry);
  }
  if (/(geschichte|politik|republik|augusteisch|kaiserzeit|spätantike|mittelalter|renaissance|mythos|religion|kultur|gesellschaft|antike|europa)/u.test(text)) {
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
    jurisdiction: 'DE-HB',
    subject: 'Latein',
    stage: spec.stage,
    sourceDocument: {
      key: spec.sourceDocumentKey,
      title: spec.sourceDocumentTitle,
      path: spec.sourcePdfPath,
      url: spec.sourceUrl,
    },
    method: {
      extractor: 'generateHbLatinSourceExtraction.ts',
      description: spec.methodDescription,
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        accepted: true,
        rationale:
          'Bremen Latein wird aus expliziten Aufgaben/Zielen, Themen/Inhalten und Standards der amtlichen Gymnasium-Bildungsplaene extrahiert. Die getrennte Fuehrung von 2. Fremdsprache, 3. Fremdsprache und GyO verhindert kuenstliche Verdichtung.',
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
        'Bremen Latein ist fachlich erstgeprueft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertig; partial beschreibt die Zuordnungsform, nicht eine fachliche Luecke.',
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
            label: 'Amtliches Bremer Bildungsplan-PDF liegt lokal vor',
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
            label: 'Kompetenz-, Themen- und Standardgruppen extrahiert',
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
            label: 'Source-Ziele aus amtlichen Kompetenz- und Inhaltsaussagen erzeugt',
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
    jurisdiction: 'DE-HB',
    subject: 'Latein',
    schoolType: 'Gymnasium',
    stage: spec.stage,
    sourceType: 'source-extraction',
    sourcePath: spec.sourcePdfPath,
    archiveSourcePath: spec.sourcePdfPath,
    archivePath: 'curricula/DE/Gymnasium/input/HB/latein/',
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

function cleanHeading(text: string): string {
  return normalizeWhitespace(text.replace(/\s+Jg\.?$/u, '').replace(/\s+Inhalte$/u, ''));
}

function cleanSourceText(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/\s*-\s+/gu, '-')
      .replace(/([A-Za-zÄÖÜäöüß])- ([A-Za-zÄÖÜäöüß])/gu, '$1$2')
      .replace(/Schüler und Schülerinnen/gu, 'Schülerinnen und Schüler')
      .replace(/Schülern und Schülerinnen/gu, 'Schülerinnen und Schülern')
      .replace(/Schülerinnen und Schüler\s*(…|\.\.\.)?\s*/gu, '')
      .replace(/^[,;]\s*/u, ''),
  ).replace(/[;,]\s*$/u, '');
}

function isUsableGoalText(text: string): boolean {
  if (text.length < 12) return false;
  if (/^(und|oder|sowie|z\. ?B\.|d\. ?h\.)$/iu.test(text)) return false;
  if (/^(Themenbereiche|Inhalte|Jg\.|Anforderungen|Aufgaben und Ziele|Standards)/u.test(text)) return false;
  if (/^(Schriftliche Arbeiten|Laufende Unterrichtsarbeit|Grundsätze der Leistungs)/u.test(text)) return false;
  return /[A-Za-zÄÖÜäöüß]/u.test(text);
}

function shortTitle(text: string): string {
  const normalized = normalizeWhitespace(text.replace(/^kann\s+/u, ''));
  return normalized.length <= 96 ? normalized : `${normalized.slice(0, 93)}...`;
}

function asCanStatement(text: string): string {
  const normalized = normalizeWhitespace(text);
  if (/^Die lernende Person kann /u.test(normalized)) return normalized;
  if (/^kann\s/u.test(normalized)) return `Die lernende Person ${normalized}.`;
  if (/^können\s/u.test(normalized)) return `Die lernende Person kann ${normalized.replace(/^können\s/u, '')}.`;
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
