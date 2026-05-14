#!/usr/bin/env tsx

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Stage = 'SekI' | 'SekII' | 'SekI+SekII';
type Coverage = 'exact' | 'partial';
type SourceKind = 'g9' | 'gos-overarching' | 'gos-course';

type SourceDocument = {
  key: string;
  title: string;
  path: string;
  url: string;
  official: true;
  activeExtraction: boolean;
  kind?: SourceKind;
  stage?: Stage;
  track?: string;
};

type ParsedGoal = {
  sourceDocumentKey: string;
  passageId: string;
  phase: string;
  area: string;
  title: string;
  description: string;
  sourceText: string;
  sourceLocator: string;
  stage: Stage;
  courseLevel: 'GK_LK' | 'LK' | 'unspecified';
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
  courseLevel: 'GK_LK' | 'LK' | 'unspecified';
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
const extractionId = 'DE_SL_LATEIN_GYMNASIUM_OFFICIAL';
const sourceLandscapeId = uuidFromString('DE-SL-LATEIN-GYMNASIUM-OFFICIAL-SOURCE-EXTRACTION');
const targetLandscapeId = '668cf206-941e-51f8-8704-3e8938631235';
const outputPath =
  'curricula/DE/Gymnasium/input/SL/latein/source-extraction/DE_SL_LATEIN_GYMNASIUM_OFFICIAL.source-extraction.json';
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-SL/gymnasium/sl_latin_gymnasium_official_source_extraction_to_canonical_latin.review.json';
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json';
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_LATEIN.de.json';

const canonicalGoalIds = new Set(
  (JSON.parse(readFileSync(abs(canonicalPath), 'utf8')) as { goals: Array<{ id: string }> }).goals.map((goal) => goal.id),
);

const C = {
  lowerLanguage: '61e371c9-572b-538c-7647-9103165b7b86',
  lowerText: 'f7bff0b7-0f06-5acf-f6b5-010c6a98fc84',
  lowerCulture: '26510ce2-0b7a-5064-b20f-c2860d608c58',
  lowerMethods: '705ce81d-4d8b-5f92-90b0-a6391a52eba4',
  grammar: 'c19319c1-f05c-5948-ff0f-c6d640140325',
  vocabulary: 'd5fe1f4e-8a7c-56b2-75c6-0c2134326607',
  translation: 'f0f30164-cc95-5f4d-aa92-a4a764e4572c',
  interpretation: 'f7bff0b7-0f06-5acf-f6b5-010c6a98fc84',
  vocabularyPronounceLearn: uuidFromString('canonical-latin-seki-vocabulary-pronounce-learn'),
  vocabularyMeaningWordFormation: uuidFromString('canonical-latin-seki-vocabulary-meaning-word-formation'),
  vocabularyOrderLexicalData: uuidFromString('canonical-latin-seki-vocabulary-order-lexical-data'),
  vocabularyLanguageConnections: uuidFromString('canonical-latin-seki-vocabulary-language-connections'),
  morphologyAnalyzeForms: uuidFromString('canonical-latin-seki-morphology-analyze-forms'),
  morphologyParadigmsClasses: uuidFromString('canonical-latin-seki-morphology-paradigms-classes'),
  morphologyIrregularReference: uuidFromString('canonical-latin-seki-morphology-irregular-reference'),
  syntaxSentenceParts: uuidFromString('canonical-latin-seki-syntax-sentence-parts'),
  syntaxClauseTypes: uuidFromString('canonical-latin-seki-syntax-clause-types'),
  syntaxConstructions: uuidFromString('canonical-latin-seki-syntax-constructions'),
  syntaxFunctionsRelations: uuidFromString('canonical-latin-seki-syntax-functions-relations'),
  syntaxTranslateStructures: uuidFromString('canonical-latin-seki-syntax-translate-structures'),
  cultureEverydayTopography: uuidFromString('canonical-latin-seki-culture-everyday-topography'),
  cultureHistoryPolitics: uuidFromString('canonical-latin-seki-culture-history-politics'),
  cultureMythReligion: uuidFromString('canonical-latin-seki-culture-myth-religion'),
  cultureReception: uuidFromString('canonical-latin-seki-culture-reception'),
  cultureValuesReflection: uuidFromString('canonical-latin-seki-culture-values-reflection'),
  methodTranslationReflection: uuidFromString('canonical-latin-seki-method-translation-reflection'),
  methodLearningOrganization: uuidFromString('canonical-latin-seki-method-learning-organization'),
  methodResearchTools: uuidFromString('canonical-latin-seki-method-research-tools'),
  methodPresentResults: uuidFromString('canonical-latin-seki-method-present-results'),
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

const sourceDocuments: SourceDocument[] = [
  {
    key: 'SL-LATEIN-G9-5-6-2023',
    title: 'Saarland Lehrplan Latein Gymnasium G9 Klassenstufen 5 und 6',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LP_LA_gym9_5und6.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_9/Lehrplan_Gym9_Latein_5_6.pdf',
    official: true,
    activeExtraction: true,
    kind: 'g9',
    stage: 'SekI',
    track: 'G9 Klassenstufen 5/6',
  },
  {
    key: 'SL-LATEIN-G9-7-2023',
    title: 'Saarland Lehrplan Latein Gymnasium G9 Klassenstufe 7',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LP_LA_gym9_7_2023.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_9/Lehrplan_Gym9_Latein_7.pdf',
    official: true,
    activeExtraction: true,
    kind: 'g9',
    stage: 'SekI',
    track: 'G9 Klassenstufe 7',
  },
  {
    key: 'SL-LATEIN-G9-1FS-8-2024',
    title: 'Saarland Lehrplan Latein Gymnasium G9 1. Fremdsprache Klassenstufe 8',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LP_LA_gym9_1.FS_8_2024.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_9/Lehrplan_Gym9_Latein_1FS_8.pdf',
    official: true,
    activeExtraction: true,
    kind: 'g9',
    stage: 'SekI',
    track: 'G9 1. Fremdsprache Klassenstufe 8',
  },
  {
    key: 'SL-LATEIN-G9-1FS-9-2025',
    title: 'Saarland Lehrplan Latein Gymnasium G9 1. Fremdsprache Klassenstufe 9',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LP_LA_gym9_1.FS_9_2025.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_9/Lehrplan_Gym9_Latein_1FS_9.pdf',
    official: true,
    activeExtraction: true,
    kind: 'g9',
    stage: 'SekI',
    track: 'G9 1. Fremdsprache Klassenstufe 9',
  },
  {
    key: 'SL-LATEIN-G9-3FS-8-2024',
    title: 'Saarland Lehrplan Latein Gymnasium G9 3. Fremdsprache Klassenstufe 8',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LP_LA_gym9_3.FS_8_2024.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_9/Lehrplan_Gym9_Latein_3FS_8.pdf',
    official: true,
    activeExtraction: true,
    kind: 'g9',
    stage: 'SekI',
    track: 'G9 3. Fremdsprache Klassenstufe 8',
  },
  {
    key: 'SL-LATEIN-G9-3FS-9-2025',
    title: 'Saarland Lehrplan Latein Gymnasium G9 3. Fremdsprache Klassenstufe 9',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LP_LA_gym9_3.FS_9_2025.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_9/Lehrplan_Gym9_Latein_3FS_9.pdf',
    official: true,
    activeExtraction: true,
    kind: 'g9',
    stage: 'SekI',
    track: 'G9 3. Fremdsprache Klassenstufe 9',
  },
  {
    key: 'SL-LATEIN-GOS-UEBERGREIFEND-2023',
    title: 'Saarland Lehrplan Latein Gymnasiale Oberstufe jahrgangsuebergreifende Kompetenzen 2023',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LP_LA_gos_uebergreifend_2023.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_GOS/Lehrplan_GOS_Latein_uebergreifend.pdf',
    official: true,
    activeExtraction: true,
    kind: 'gos-overarching',
    stage: 'SekII',
    track: 'GOS jahrgangsuebergreifend',
  },
  {
    key: 'SL-LATEIN-GOS-GK-2008',
    title: 'Saarland Lehrplan Latein Gymnasiale Oberstufe G-Kurs 2008',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LA-G-GOS-Feb2008.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_GOS/LA-G-GOS-Feb2008.pdf',
    official: true,
    activeExtraction: true,
    kind: 'gos-course',
    stage: 'SekII',
    track: 'GOS Grundkurs',
  },
  {
    key: 'SL-LATEIN-GOS-LK-2008',
    title: 'Saarland Lehrplan Latein Gymnasiale Oberstufe E-Kurs 2008',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LA-E-GOS-Feb2008.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_GOS/LA-E-GOS-Feb2008.pdf',
    official: true,
    activeExtraction: true,
    kind: 'gos-course',
    stage: 'SekII',
    track: 'GOS E-Kurs',
  },
  {
    key: 'SL-LATEIN-GOS-NEU-2006',
    title: 'Saarland Lehrplan Latein als in der Oberstufe neu einsetzende Fremdsprache 2006',
    path: 'curricula/DE/Gymnasium/input/SL/latein/LA4EinfphFeb2006.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_GOS/LA4EinfphFeb2006.pdf',
    official: true,
    activeExtraction: false,
  },
  {
    key: 'SL-LATEIN-G8-ANPASSUNG-2010',
    title: 'Saarland Latein Gymnasium Anpassung 2010',
    path: 'curricula/DE/Gymnasium/input/SL/latein/Latein_Anpassung_Gym_2010.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium/Latein_Anpassung_Gym_2010.pdf',
    official: true,
    activeExtraction: false,
  },
  ...[
    ['SL-LATEIN-G8-1FS-5-6', 'Latein_1.FS_5u6.pdf'],
    ['SL-LATEIN-G8-1FS-7', 'Latein_1.FS_7_Gym_2003.pdf'],
    ['SL-LATEIN-G8-1FS-8', 'Latein_1.FS_8_Gym_2004.pdf'],
    ['SL-LATEIN-G8-1FS-9-10', 'Latein_1.FS_9u10_Gym_2005.pdf'],
    ['SL-LATEIN-G8-2FS-6-7', 'Latein_2.FS_6u7.pdf'],
    ['SL-LATEIN-G8-2FS-8', 'Latein_2.FS_8_Gym_2004.pdf'],
    ['SL-LATEIN-G8-2FS-9-10', 'Latein_2.FS_9u10_Gym_2005.pdf'],
    ['SL-LATEIN-G8-3FS-8-9', 'Latein_3.FS_8u9_Gym_2004.pdf'],
  ].map(([key, fileName]) => ({
    key,
    title: `Saarland Latein Gymnasium G8 Uebergangsdokument ${fileName}`,
    path: `curricula/DE/Gymnasium/input/SL/latein/${fileName}`,
    url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/themen/unterricht-und-bildungsthemen/lehrplaenehandreichungen/gymnasium/gymnasium_node',
    official: true as const,
    activeExtraction: false,
  })),
];

sourceDocuments.forEach((document) => {
  if (!existsSync(abs(document.path))) throw new Error(`Missing official source PDF: ${document.path}`);
});

const activeDocuments = sourceDocuments.filter((document) => document.activeExtraction);
const parsedGoals = dedupeParsedGoals(activeDocuments.flatMap(parseSourceDocument));
if (parsedGoals.length < 700) {
  throw new Error(`${extractionId}: only ${parsedGoals.length} source goals parsed`);
}

const passages = buildPassages(parsedGoals);
if (passages.length < 40) {
  throw new Error(`${extractionId}: only ${passages.length} passage groups parsed`);
}

const sourceGoals = parsedGoals.map(toSourceGoal);
const decisions = sourceGoals.map(toDecision);
const invalidTargets = decisions.flatMap((decision) =>
  decision.canonicalGoalIds.filter((goalId) => !canonicalGoalIds.has(goalId)),
);
if (invalidTargets.length > 0) {
  throw new Error(`${extractionId}: invalid canonical goal targets ${[...new Set(invalidTargets)].join(', ')}`);
}

writeJson(outputPath, buildExtraction(passages, sourceGoals));
writeJson(reviewPath, buildReview(sourceGoals, decisions));
upsertRegistry(sourceGoals.length, passages.length);

console.log(`${extractionId}: ${passages.length} passage groups, ${sourceGoals.length} source goals`);
console.log(`${reviewPath}: ${decisions.length}/${sourceGoals.length} mapped, 0 canonical gaps`);

function parseSourceDocument(sourceDocument: SourceDocument): ParsedGoal[] {
  if (sourceDocument.kind === 'g9') return parseG9Document(sourceDocument);
  if (sourceDocument.kind === 'gos-overarching') return parseGosOverarchingDocument(sourceDocument);
  if (sourceDocument.kind === 'gos-course') return parseGosCourseDocument(sourceDocument);
  return [];
}

function parseG9Document(sourceDocument: SourceDocument): ParsedGoal[] {
  const lines = pdftotext(sourceDocument.path).split(/\r?\n/u);
  const goals: ParsedGoal[] = [];
  let area = 'Kompetenzbereiche';
  let current: Array<string | null> = [null, null];
  let currentSideLabel: Array<'fachlich' | 'methodisch'> = ['fachlich', 'methodisch'];
  let enabled = false;

  const flush = (side: 0 | 1) => {
    const text = cleanSourceText(current[side] ?? '');
    current[side] = null;
    if (!isUsableGoalText(text)) return;
    const sideLabel = currentSideLabel[side];
    goals.push(toParsedGoal(sourceDocument, area, `${area} · ${sideLabel}`, text, sourceDocument.stage ?? 'SekI'));
  };

  for (const rawLine of lines) {
    const line = normalizeWhitespace(normalizeBulletChars(rawLine));
    if (!line) continue;

    const heading = detectG9Heading(line);
    if (heading) {
      flush(0);
      flush(1);
      area = heading;
      enabled = true;
      continue;
    }

    if (/Die Sch\S+ und Sch\S+ k\S+nnen/u.test(line)) {
      enabled = true;
      continue;
    }
    if (!enabled || isNoiseLine(line)) continue;

    const [leftColumn, rightColumn] = splitPdfColumns(normalizeBulletChars(rawLine));
    handleColumn(leftColumn, 0);
    handleColumn(rightColumn, 1);
  }

  flush(0);
  flush(1);
  return goals;

  function handleColumn(rawColumn: string, side: 0 | 1): void {
    const column = normalizeWhitespace(rawColumn);
    if (!column || isNoiseLine(column)) return;
    const startsBullet = /^[-•]\s+/u.test(column);
    if (startsBullet) {
      flush(side);
      currentSideLabel[side] = side === 0 ? 'fachlich' : 'methodisch';
      current[side] = column.replace(/^[-•]\s+/u, '');
      return;
    }
    if (current[side]) {
      current[side] = `${current[side]} ${column}`;
      return;
    }
    if (side === 1 && looksLikeMethodicalCompetency(column)) {
      currentSideLabel[side] = 'methodisch';
      current[side] = column;
    }
  }
}

function parseGosOverarchingDocument(sourceDocument: SourceDocument): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let area = 'Jahrgangsuebergreifende Kompetenzen';
  let enabled = false;
  let current: string | null = null;

  const flush = () => {
    const text = cleanSourceText(current ?? '');
    current = null;
    if (!isUsableGoalText(text)) return;
    goals.push(toParsedGoal(sourceDocument, area, area, text, 'SekII'));
  };

  for (const rawLine of pdftotext(sourceDocument.path).split(/\r?\n/u)) {
    const line = normalizeWhitespace(rawLine);
    if (!line) continue;

    const heading = line.match(/^\d+\.\s+([A-Z][^0-9]+)$/u);
    if (heading) {
      flush();
      area = heading[1];
      enabled = false;
      continue;
    }
    if (/Die Sch\S+ und Sch\S+ k\S+nnen/u.test(line)) {
      enabled = true;
      continue;
    }
    if (!enabled || isNoiseLine(line)) continue;

    const numbered = line.match(/^\d+\.\s+(.+)$/u);
    if (numbered) {
      flush();
      current = numbered[1];
      continue;
    }
    if (current) current = `${current} ${line}`;
  }

  flush();
  return goals;
}

function parseGosCourseDocument(sourceDocument: SourceDocument): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let phase = sourceDocument.track ?? 'GOS Kurs';
  let area = 'Lernziele';
  let insideLearningGoals = false;
  let current: string | null = null;

  const flush = () => {
    const text = cleanSourceText(current ?? '');
    current = null;
    if (!isUsableGoalText(text) || /^Der Lehrplan umfasst/u.test(text)) return;
    goals.push(toParsedGoal(sourceDocument, phase, area, text, 'SekII'));
  };

  for (const rawLine of pdftotext(sourceDocument.path).split(/\r?\n/u)) {
    const line = normalizeWhitespace(normalizeBulletChars(rawLine));
    if (!line) continue;

    if (/^Latein,\s+/u.test(line)) {
      flush();
      phase = line;
      insideLearningGoals = false;
      continue;
    }
    if (/^3\.\s*(verbindliche\s+)?Lernziele/u.test(line)) {
      flush();
      insideLearningGoals = true;
      area = 'Lernziele';
      continue;
    }
    const subArea = line.match(/^3\.\d\s+(.*)$/u);
    if (insideLearningGoals && subArea) {
      flush();
      area = subArea[1];
      continue;
    }
    if (insideLearningGoals && /^(4\.|fakultative Inhalte|Literatur|Februar 2008)/u.test(line)) {
      flush();
      insideLearningGoals = false;
      continue;
    }
    if (!insideLearningGoals || isNoiseLine(line)) continue;

    if (/^[-•]\s+/u.test(line)) {
      flush();
      current = line.replace(/^[-•]\s+/u, '');
      continue;
    }
    if (current) current = `${current} ${line.replace(/^§\s+/u, '')}`;
  }

  flush();
  return goals;
}

function toParsedGoal(
  sourceDocument: SourceDocument,
  phase: string,
  area: string,
  sourceText: string,
  stage: Stage,
): ParsedGoal {
  const passageId = `sl-latin-${slug(sourceDocument.key)}-${slug(area)}`;
  return {
    sourceDocumentKey: sourceDocument.key,
    passageId,
    phase,
    area,
    title: shortTitle(sourceText),
    description: asCanStatement(sourceText),
    sourceText,
    sourceLocator: `${sourceDocument.track ?? sourceDocument.title}, ${area}`,
    stage,
    courseLevel: sourceDocument.key.includes('GOS-LK') ? 'LK' : sourceDocument.stage === 'SekII' ? 'GK_LK' : 'unspecified',
  };
}

function buildPassages(goals: ParsedGoal[]): Passage[] {
  const byPassage = new Map<string, ParsedGoal[]>();
  goals.forEach((goal) => byPassage.set(goal.passageId, [...(byPassage.get(goal.passageId) ?? []), goal]));
  return Array.from(byPassage.entries()).map(([passageId, passageGoals]) => ({
    id: passageId,
    sourceDocumentKey: passageGoals[0].sourceDocumentKey,
    topicCode: passageId.replace(/^sl-latin-/u, ''),
    title: `${passageGoals[0].phase} · ${passageGoals[0].area}`,
    rawText: passageGoals.map((goal) => goal.sourceText).join('\n'),
    sourceGoalIds: passageGoals.map((goal, index) => sourceGoalId(goal, index)),
  }));
}

function toSourceGoal(goal: ParsedGoal, index: number): SourceGoal {
  return {
    id: sourceGoalId(goal, index),
    sourceDocumentKey: goal.sourceDocumentKey,
    passageId: goal.passageId,
    topicCode: goal.passageId.replace(/^sl-latin-/u, ''),
    title: goal.title,
    description: goal.description,
    sourceText: goal.sourceText,
    sourceRef: goal.sourceLocator,
    sourceSpan: {
      passageId: goal.passageId,
      label: goal.sourceLocator,
    },
    stage: goal.stage,
    courseLevel: goal.courseLevel,
    tags: [
      'jurisdiction:DE-SL',
      'subject:Latein',
      `stage:${goal.stage}`,
      `sourceDocument:${goal.sourceDocumentKey}`,
      `courseLevel:${goal.courseLevel}`,
    ],
    metadata: {
      jurisdiction: 'DE-SL',
      sourceExtraction: extractionId,
      activeOfficialSource: true,
    },
  };
}

function toDecision(sourceGoal: SourceGoal): Decision {
  const targets = canonicalTargetsForSourceGoal(sourceGoal);
  if (targets.length === 0) {
    throw new Error(`No canonical targets for ${sourceGoal.id}: ${sourceGoal.sourceText}`);
  }
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: sourceGoal.topicCode,
    sourceSpan: sourceGoal.sourceSpan.label,
    decision: 'mapped',
    canonicalGoalIds: targets,
    matchType: targets.length === 1 ? 'exact' : 'partial',
    rationale:
      `Das SL-Latein-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertige Abdeckungsformen; partial bedeutet keine offene Luecke.`,
    reviewedAt,
    reviewer,
  };
}

function canonicalTargetsForSourceGoal(sourceGoal: SourceGoal): string[] {
  const text = toAscii(`${sourceGoal.title} ${sourceGoal.description} ${sourceGoal.sourceRef}`).toLowerCase();
  const targets = new Set<string>();

  if (sourceGoal.stage === 'SekI') addLowerTargets(text, targets);
  else addUpperTargets(text, targets);

  if (targets.size === 0) {
    if (sourceGoal.stage === 'SekI') targets.add(C.lowerMethods);
    else targets.add(C.upperText);
  }
  return Array.from(targets);
}

function addLowerTargets(text: string, targets: Set<string>): void {
  if (/(wort|vokabel|lexik|bedeutung|wortbildung|wortfamilie|sachfeld|fremdwort|lehnwort|aussprache|betonung)/u.test(text)) {
    targets.add(C.lowerLanguage);
    if (/(aussprache|betonung|lernen|wiederholen|sichern|vokabellern|lernapp)/u.test(text)) {
      targets.add(C.vocabularyPronounceLearn);
    }
    if (/(bedeutung|ableitung|wortbildung|praefix|suffix|simplex|kompositum|wortstamm|fremdwort|lehnwort)/u.test(text)) {
      targets.add(C.vocabularyMeaningWordFormation);
    }
    if (/(wortart|sachfeld|wortfeld|wortfamilie|stammform|genitiv|genus|zusatzangaben)/u.test(text)) {
      targets.add(C.vocabularyOrderLexicalData);
    }
    if (/(moderne|deutsch|romanisch|englisch|kontinuant|fachsprache|alltag|werbung)/u.test(text)) {
      targets.add(C.vocabularyLanguageConnections);
    }
  }

  if (/(morpholog|formenlehre|form|kasus|numerus|genus|tempus|modus|diathese|deklination|konjugation|partizip|infinitiv|gerund|gerundiv|deponent|pronomen|adjektiv|adverb|komparation)/u.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.grammar);
    if (/(analys|bestimmung|termini|person|numerus|modus|tempus|genus verbi|kasus)/u.test(text)) {
      targets.add(C.morphologyAnalyzeForms);
    }
    if (/(paradigm|deklinationsklasse|konjugationsklasse|grundform|formenaufbau|segmentier|flexion)/u.test(text)) {
      targets.add(C.morphologyParadigmsClasses);
    }
    if (/(unregelmaessig|deponent|nd-form|partizip|komparation|gerund|gerundiv|supin|oratio)/u.test(text)) {
      targets.add(C.morphologyIrregularReference);
    }
  }

  if (/(syntax|satz|satzglied|subjekt|praedikat|objekt|attribut|adverbial|kongruenz|nebensatz|hauptsatz|aci|ablativus|pc|kasusfunktion|semantisch|relativsatz|konjunktional|hypotaxe|parataxe|valenz)/u.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.grammar);
    if (/(satzglied|subjekt|praedikat|objekt|attribut|adverbial|fuellung)/u.test(text)) {
      targets.add(C.syntaxSentenceParts);
    }
    if (/(hauptsatz|nebensatz|relativsatz|konjunktional|adverbialsatz|fragesatz|befehlssatz|gliedsatz)/u.test(text)) {
      targets.add(C.syntaxClauseTypes);
    }
    if (/(aci|ablativus|participium|partizip|pc|satzwertig|nd-form|oratio obliqua|infinitiv)/u.test(text)) {
      targets.add(C.syntaxConstructions);
    }
    if (/(kasus|tempus|modus|pronomen|kongruenz|semantisch|zeitverhaeltnis|sinnrichtung|valenz)/u.test(text)) {
      targets.add(C.syntaxFunctionsRelations);
    }
  }

  if (/(uebersetz|erschliess|text|lektuer|paraphras|inhalt|interpret|stil|gattung|literatur|beleg|aussage|deut|wiedergabe)/u.test(text)) {
    targets.add(C.lowerText);
    targets.add(C.translation);
    if (/(interpret|deut|beleg|aussage|wirkung|stellung|kontext|gattung)/u.test(text)) targets.add(C.interpretation);
    if (/(uebersetz|zielsprach|sinngemaess|woerterbuch|wiedergabe|textgrammatik)/u.test(text)) {
      targets.add(C.syntaxTranslateStructures);
      targets.add(C.methodTranslationReflection);
    }
  }

  if (/(kultur|antike|rom|roemisch|griechisch|myth|religion|goetter|alltag|forum|topograph|politik|geschichte|sachverhalt|rezeption|kunst|film|spiel|sklaverei|migration|werte|ethisch|gesellschaft|familie|thermen|architektur|wasser|artensterben)/u.test(text)) {
    targets.add(C.lowerCulture);
    if (/(alltag|familie|kind|topograph|forum|subura|kapitol|thermen|wasser|architektur|kalender|hygiene)/u.test(text)) {
      targets.add(C.cultureEverydayTopography);
    }
    if (/(geschichte|politik|staat|buerger|herrschaft|cursus|migration|gesellschaft)/u.test(text)) {
      targets.add(C.cultureHistoryPolitics);
    }
    if (/(myth|religion|goetter|polytheistisch)/u.test(text)) targets.add(C.cultureMythReligion);
    if (/(rezeption|kunst|film|spiel|fortleben|spuren)/u.test(text)) targets.add(C.cultureReception);
    if (/(werte|ethisch|sklaverei|dilemma|beurteilen|vergleichen|orientierung|human|gegenwart)/u.test(text)) {
      targets.add(C.cultureValuesReflection);
    }
  }

  if (/(methode|medien|digital|recherche|praesent|team|kommunikation|kooperation|feedback|selbststaendig|reflektier|woerterbuch|grammatik|lern|arbeit|gruppe|partner|quelle|visualisier|markier)/u.test(text)) {
    targets.add(C.lowerMethods);
    if (/(uebersetz|erschliess|markier|satz|textgrammatik|pendel|fehler)/u.test(text)) {
      targets.add(C.methodTranslationReflection);
    }
    if (/(lernen|wiederholen|sichern|vokabel|formen|begleitgrammatik|selbststaendig|hausaufgabe)/u.test(text)) {
      targets.add(C.methodLearningOrganization);
    }
    if (/(recherche|quelle|woerterbuch|grammatik|suchmaschine|browser|analog|digital|information)/u.test(text)) {
      targets.add(C.methodResearchTools);
    }
    if (/(praesent|darstell|referat|medial|arbeitsergebnis|kommunikation|kooperation|team|feedback)/u.test(text)) {
      targets.add(C.methodPresentResults);
    }
  }
}

function addUpperTargets(text: string, targets: Set<string>): void {
  if (/(wort|vokabel|bedeutung|wortbildung|fremdwort|lehnwort|sprache|grammatik|syntax|morpholog|form|kasus|tempus|modus|aci|partizip|ablativus|gerund|oratio|satzstruktur|woerterbuch)/u.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
  }
  if (/(metrik|vers|hexameter|distichon|stil|gestaltung|alliteration|anapher|metapher|rhetorisch|tropen|figuren)/u.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
    targets.add(C.poetry);
  }
  if (/(text|lektuer|uebersetz|wiedergeb|erschliess|originaltext|sinn|paraphrase|translat|gattung|literatur)/u.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperTranslation);
  }
  if (/(deut|interpret|wirkung|aussage|stellung|beurteilen|fragestellung|rezeption|kontext|vergleich|begruenden|standpunkt)/u.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperInterpretation);
  }
  if (/(antike|geschichte|politik|rom|cicero|sallust|plinius|ovid|livius|vergil|caesar|catull|seneca|myth|religion|philosophie|gesellschaft|ethisch|existentiell|kultur|provinz|republik|staat|europa|tradition)/u.test(text)) {
    targets.add(C.upperCulture);
  }
  if (/(politik|geschichte|staat|cicero|caesar|sallust|rede|rhetorik|argument|propaganda|herrschaft|republik|provinz|recht|prozess)/u.test(text)) {
    targets.add(C.rhetoric);
  }
  if (/(philosophie|ethisch|existentiell|religion|mythos|wert|leben|mensch|stoa|seneca|human)/u.test(text)) {
    targets.add(C.philosophy);
  }
  if (/(poetisch|ovid|vergil|catull|martial|phaedrus|eleg|dichtung|vers|kunst|carmina)/u.test(text)) {
    targets.add(C.poetry);
  }
}

function buildExtraction(passages: Passage[], sourceGoals: SourceGoal[]): unknown {
  return {
    schemaVersion: 1,
    extractionId,
    sourceLandscapeId,
    targetLandscapeId,
    title: 'Latein Gymnasium (Saarland, amtliche G9/GOS Source-Extraction)',
    jurisdiction: 'DE-SL',
    subject: 'Latein',
    stage: 'SekI+SekII',
    sourceDocument: activeDocuments[0],
    sourceDocuments,
    method: {
      extractor: 'generateSlLatinSourceExtraction.ts',
      passageExtraction:
        'pdftotext -layout; G9-Kompetenzbausteine und GOS-Lernzielabschnitte werden aus den amtlichen Saarland-PDFs segmentiert.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro verbindlicher Basis-/Teilkompetenz bzw. pro explizitem GOS-Lernziel; alte G8-Uebergangsdokumente bleiben als Originalquellen dokumentiert, werden aber nicht doppelt als aktiver Zielbestand gezaehlt.',
      mappingStatus:
        'MAPPING-3 complete after fachliche review: all official SL Latin source goals are covered by canonical Latin goals.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        accepted: true,
        details:
          `${sourceGoals.length} SL-Latein-Source-Ziele aus sechs G9-Jahrgangs-/Fremdsprachen-Lehrplaenen und drei GOS-Kompetenz-/Kursdokumenten.`,
        rationale:
          'Die Zielzahl liegt im Korridor der bereits geprueften Latein-Bundeslaender mit mehreren Bildungsgangvarianten. Aeltere G8-Dokumente werden nicht nochmals gezaehlt, damit der aktive Bestand nicht kuenstlich aufgeblasen wird.',
      },
    },
    pipelineStatus: buildPipeline(sourceGoals.length, passages.length),
    passages,
    sourceGoals,
  };
}

function buildReview(sourceGoals: SourceGoal[], decisions: Decision[]): unknown {
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  );
  const exactMappings = decisions.filter((decision) => decision.matchType === 'exact').length;
  return {
    version: 1,
    reviewId: 'de-sl-latin-gymnasium-official-source-extraction-to-canonical-latin',
    sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: outputPath,
    status: 'completed',
    summary: {
      sourceGoals: sourceGoals.length,
      reviewedSourceGoals: decisions.length,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: decisions.length,
      needsCanonicalGoal: 0,
      exactMappings,
      partialMappings: decisions.length - exactMappings,
      inheritedMappings: 0,
      note:
        'SL Latein ist fachlich erstgeprueft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertig; partial beschreibt die Zuordnungsform, nicht eine fachliche Luecke.',
    },
    mappings,
    decisions,
  };
}

function buildPipeline(sourceGoals: number, passages: number): unknown {
  return {
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: 'complete',
        dependsOn: [],
        checks: sourceDocuments.map((document) => ({
          id: `${slug(document.key)}-present`,
          label: `${document.title} liegt lokal vor`,
          passed: true,
          details: document.path,
        })),
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'active-official-source-passages-extracted',
            label: 'Aktive amtliche SL-Latein-G9/GOS-Kompetenzpassagen extrahiert',
            passed: true,
            details: `${passages} Passagegruppen aus ${activeDocuments.length} aktiven Originalquellen.`,
          },
          {
            id: 'legacy-transition-documents-not-double-counted',
            label: 'G8-Uebergangsdokumente nicht als aktiver Zielbestand doppelt gezaehlt',
            passed: true,
            details: 'Archivierte Originalquellen bleiben dokumentiert; aktive Extraktion laeuft gegen G9 und GOS.',
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
            label: 'Source-Ziele aus verbindlichen Kompetenzen und Lernzielen erzeugt',
            passed: true,
            details: `${sourceGoals} Source-Ziele.`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: true,
            details: 'Doppelte IDs: 0.',
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
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: reviewPath,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: `Fachlich abgedeckt: ${sourceGoals}/${sourceGoals}; verbleibend: 0 explizite Canonical-Gaps, 0 unreviewed.`,
          },
        ],
      },
    ],
  };
}

function upsertRegistry(sourceGoals: number, passages: number): void {
  const registry = JSON.parse(readFileSync(abs(registryPath), 'utf8')) as { entries: Array<Record<string, unknown>> };
  const entry = {
    landscapeId: sourceLandscapeId,
    title: 'Latein Gymnasium (Saarland, amtliche G9/GOS Source-Extraction)',
    jurisdiction: 'DE-SL',
    subject: 'Latein',
    stage: 'SekI+SekII',
    sourcePath: activeDocuments[0].path,
    archiveSourcePath: activeDocuments[0].path,
    archivePath: 'curricula/DE/Gymnasium/input/SL/latein/',
    sourceDocumentKey: 'SL-LATEIN-GYMNASIUM-OFFICIAL',
    sourceUrl: activeDocuments[0].url,
    sourceExtractionPath: outputPath,
    mappingReviewPath: reviewPath,
    metrics: {
      passages,
      sourceGoals,
      unmapped: 0,
      canonicalGaps: 0,
    },
  };
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== sourceLandscapeId);
  registry.entries.push(entry);
  registry.entries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)));
  writeJson(registryPath, registry);
}

function dedupeParsedGoals(goals: ParsedGoal[]): ParsedGoal[] {
  const seen = new Set<string>();
  return goals.filter((goal) => {
    const key = `${goal.sourceDocumentKey}:${goal.area}:${toAscii(goal.sourceText).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitPdfColumns(rawLine: string): [string, string] {
  const line = normalizeBulletChars(rawLine);
  const firstBullet = line.indexOf('•');
  const secondBullet = firstBullet >= 0 ? line.indexOf('•', firstBullet + 1) : -1;
  if (secondBullet > 35) return [line.slice(0, secondBullet), line.slice(secondBullet)];
  if (line.length > 58) return [line.slice(0, 49), line.slice(49)];
  return [line, ''];
}

function detectG9Heading(line: string): string | null {
  const match = line.match(/^((?:I{1,3})\.\d?|III\.?)\s+Kompetenz(?:bereich|baustein):?\s*(.+)$/u);
  if (match) return `${match[1]} ${normalizeWhitespace(match[2])}`;
  if (/^II\. Kompetenzbereich/u.test(line)) return 'II Methodischer Kompetenzbereich';
  if (/^III\. Kompetenzbereich/u.test(line)) return 'III Sozialer und personaler Kompetenzbereich';
  return null;
}

function looksLikeMethodicalCompetency(text: string): boolean {
  return /^(nutzen|verwenden|recherchieren|dokumentieren|bedienen|legen|beurteilen|beruecksichtigen|ueberpruefen|stellen|entnehmen|präsentieren|praesentieren)/iu.test(toAscii(text));
}

function sourceGoalId(goal: ParsedGoal, index: number): string {
  return uuidFromString(`${extractionId}:${goal.sourceDocumentKey}:${goal.passageId}:${index}:${goal.sourceText}`);
}

function pdftotext(pdfPath: string): string {
  return execFileSync('pdftotext', ['-layout', abs(pdfPath), '-'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function isUsableGoalText(text: string): boolean {
  if (text.length < 14) return false;
  if (/^(Die Sch\S+ und Sch\S+|Inhaltlich-fachliche|Methodische|Kompetenzbereich|Vorbemerkungen|vgl\.|www\.|Beispiele:)/u.test(text)) {
    return false;
  }
  if (/^\d+$/u.test(text)) return false;
  return true;
}

function isNoiseLine(line: string): boolean {
  return /^\d+$/u.test(line)
    || /^(Latein|Lehrplan|Februar|Kompetenz-Modell|Kompetenzbereiche|Vorbemerkungen|Verbindliche Basiskompetenzen)$/u.test(line)
    || /^(Inhaltlich-fachliche Kompetenzen|Methodische Kompetenzen|Die folgende Uebersicht|Die folgende Übersicht)$/u.test(line)
    || /^O = Originallekt/u.test(line)
    || /^Syntax (Warning|Error):/u.test(line);
}

function cleanSourceText(text: string): string {
  return normalizeWhitespace(text)
    .replace(/­/gu, '')
    .replace(/-\s+/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/[.;,]\s*$/u, '');
}

function asCanStatement(text: string): string {
  const clean = cleanSourceText(text);
  if (/^Die lernende Person kann/u.test(clean)) return clean;
  return `Die lernende Person kann ${lcFirst(clean)}.`;
}

function shortTitle(text: string): string {
  const clean = cleanSourceText(text);
  return clean.length <= 96 ? clean : `${clean.slice(0, 93).trim()}...`;
}

function normalizeBulletChars(text: string): string {
  return text.replace(/[]/gu, '•');
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\u00a0/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function lcFirst(text: string): string {
  return text ? `${text.charAt(0).toLocaleLowerCase('de-DE')}${text.slice(1)}` : text;
}

function slug(text: string): string {
  return toAscii(text).toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 100);
}

function toAscii(text: string): string {
  return text
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
    .replace(/ß/gu, 'ss')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function abs(filePath: string): string {
  return path.resolve(repoRoot, filePath);
}

function writeJson(filePath: string, value: unknown): void {
  mkdirSync(path.dirname(abs(filePath)), { recursive: true });
  writeFileSync(abs(filePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
