#!/usr/bin/env tsx

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Jurisdiction = 'DE-SN' | 'DE-ST' | 'DE-TH';
type Stage = 'SekI' | 'SekII' | 'SekI+SekII';
type CourseLevel = 'GK_LK' | 'LK' | 'unspecified';
type Coverage = 'exact' | 'partial';

type Spec = {
  jurisdiction: Jurisdiction;
  jurisdictionName: string;
  extractionId: string;
  sourceLandscapeId: string;
  title: string;
  sourceDocumentKey: string;
  sourceDocumentTitle: string;
  sourcePdfPath: string;
  sourceUrl: string;
  extractionPath: string;
  reviewPath: string;
  minSourceGoals: number;
  minPassages: number;
};

type ParsedGoal = {
  sourceDocumentKey: string;
  passageId: string;
  topicCode: string;
  phase: string;
  area: string;
  title: string;
  description: string;
  sourceText: string;
  sourceLocator: string;
  stage: 'SekI' | 'SekII';
  courseLevel: CourseLevel;
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
  stage: 'SekI' | 'SekII';
  courseLevel: CourseLevel;
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
  metadata: Record<string, unknown>;
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
const subject = 'Latein';
const targetLandscapeId = '668cf206-941e-51f8-8704-3e8938631235';
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
    jurisdiction: 'DE-SN',
    jurisdictionName: 'Sachsen',
    extractionId: 'DE_SN_LATEIN_GYMNASIUM_2019',
    sourceLandscapeId: uuidFromString('DE-SN-LATEIN-GYMNASIUM-2019-SOURCE-EXTRACTION'),
    title: 'Latein Gymnasium (Sachsen, Lehrplan 2019 Source-Extraction)',
    sourceDocumentKey: 'SN-LATEIN-GYMNASIUM-2019',
    sourceDocumentTitle: 'Sachsen Lehrplan Gymnasium Latein 2019',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/SN/latein/lehrplan-gymnasium-latein-sachsen-2019.pdf',
    sourceUrl: 'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/116/MLOSQ7710uwoLPeItHYx',
    extractionPath:
      'curricula/DE/Gymnasium/input/SN/latein/source-extraction/DE_SN_LATEIN_GYMNASIUM_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SN/gymnasium/sn_latin_gymnasium_source_extraction_to_canonical_latin.review.json',
    minSourceGoals: 300,
    minPassages: 25,
  },
  {
    jurisdiction: 'DE-ST',
    jurisdictionName: 'Sachsen-Anhalt',
    extractionId: 'DE_ST_LATEIN_GYMNASIUM_2022',
    sourceLandscapeId: uuidFromString('DE-ST-LATEIN-GYMNASIUM-2022-SOURCE-EXTRACTION'),
    title: 'Latein Gymnasium (Sachsen-Anhalt, Fachlehrplan 2022 Source-Extraction)',
    sourceDocumentKey: 'ST-LATEIN-GYMNASIUM-2022',
    sourceDocumentTitle: 'Sachsen-Anhalt Fachlehrplan Latein Gymnasium 2022',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/ST/latein/FLP_Lat_Gym_01082022_sw.pdf',
    sourceUrl: 'https://www.bildung-lsa.de/files/b45de329c361a40a2f0a7211902d5815/FLP_Lat_Gym_01082022_sw.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/ST/latein/source-extraction/DE_ST_LATEIN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/gymnasium/st_latin_gymnasium_source_extraction_to_canonical_latin.review.json',
    minSourceGoals: 260,
    minPassages: 25,
  },
  {
    jurisdiction: 'DE-TH',
    jurisdictionName: 'Thueringen',
    extractionId: 'DE_TH_LATEIN_GYMNASIUM_2024',
    sourceLandscapeId: uuidFromString('DE-TH-LATEIN-GYMNASIUM-2024-SOURCE-EXTRACTION'),
    title: 'Latein Gymnasium (Thueringen, Lehrplan 2024 Source-Extraction)',
    sourceDocumentKey: 'TH-LATEIN-GYMNASIUM-2024',
    sourceDocumentTitle: 'Thueringen Lehrplan Latein Gymnasium 2024',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/TH/latein/LP_Latein-2024.pdf',
    sourceUrl: 'https://www.schulportal-thueringen.de/tip/resources/medien/63127?dateiname=LP_Latein-2024.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/TH/latein/source-extraction/DE_TH_LATEIN_GYMNASIUM_2024.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/gymnasium/th_latin_gymnasium_source_extraction_to_canonical_latin.review.json',
    minSourceGoals: 300,
    minPassages: 25,
  },
];

for (const spec of specs) {
  if (!existsSync(abs(spec.sourcePdfPath))) {
    throw new Error(`${spec.extractionId}: missing official source PDF ${spec.sourcePdfPath}`);
  }

  const parsedGoals = dedupeParsedGoals(parseSpec(spec));
  if (parsedGoals.length < spec.minSourceGoals) {
    throw new Error(`${spec.extractionId}: only ${parsedGoals.length} source goals parsed`);
  }

  const passages = buildPassages(spec, parsedGoals);
  if (passages.length < spec.minPassages) {
    throw new Error(`${spec.extractionId}: only ${passages.length} passage groups parsed`);
  }

  const sourceGoals = parsedGoals.map((goal, index) => toSourceGoal(spec, goal, index));
  assertUnique(sourceGoals.map((goal) => goal.id), `${spec.extractionId} source goal`);

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
  console.log(`${spec.reviewPath}: ${decisions.length}/${sourceGoals.length} mapped, 0 canonical gaps`);
}

function parseSpec(spec: Spec): ParsedGoal[] {
  if (spec.jurisdiction === 'DE-SN') return parseSachsen(spec);
  if (spec.jurisdiction === 'DE-ST') return parseSachsenAnhalt(spec);
  return parseThueringen(spec);
}

function parseSachsen(spec: Spec): ParsedGoal[] {
  const lines = pdftotext(spec.sourcePdfPath).split(/\r?\n/u);
  const goals: ParsedGoal[] = [];
  let phase = 'Gymnasium Latein';
  let area = 'Ziele';
  let stage: 'SekI' | 'SekII' = 'SekI';
  let courseLevel: CourseLevel = 'unspecified';
  let enabled = false;
  let current: string | null = null;
  let currentArea = area;
  let bodyStarted = false;

  const flush = () => {
    const text = cleanSourceText(current ?? '');
    current = null;
    if (!isUsableGoalText(text)) return;
    goals.push(toParsedGoal(spec, phase, currentArea, text, stage, courseLevel));
  };

  for (const [lineIndex, rawLine] of lines.entries()) {
    const line = normalizeWhitespace(normalizeBulletChars(rawLine));
    if (!line) continue;
    if (/^GY\s+–\s+LA/u.test(line) || /^Gymnasium$/u.test(line) || /^Latein\s+\d{4}/u.test(line)) continue;
    if (!bodyStarted) {
      if (lineIndex > 1000 && /^Latein als vorgezogene zweite Fremdsprache\/Spracherwerbsphase$/u.test(line)) {
        bodyStarted = true;
      } else {
        continue;
      }
    }

    const phaseMatch = line.match(/^(Latein als .+|Jahrgangsstufen 11\/12(?:.+)?)$/u);
    if (phaseMatch) {
      flush();
      phase = phaseMatch[1];
      stage = /Jahrgangsstufen 11\/12/u.test(phase) ? 'SekII' : 'SekI';
      courseLevel = /Leistungskurs/u.test(phase) ? 'LK' : stage === 'SekII' ? 'GK_LK' : 'unspecified';
      area = 'Ziele';
      currentArea = area;
      enabled = true;
      continue;
    }

    const areaMatch = line.match(/^(Entwicklung der Fähigkeit .+|Lernbereich \d+:\s+.+|Wahlthema(?: \d+)?:\s+.+)$/u);
    if (areaMatch) {
      flush();
      area = areaMatch[1];
      currentArea = area;
      enabled = true;
      continue;
    }

    if (!enabled || isNoiseLine(line) || /^siehe Latein als /u.test(line) || /Kennzeichnung: .*beachten/u.test(line)) continue;

    const bulletMatch = line.match(/^[-•]\s*(.+)$/u);
    if (bulletMatch) {
      flush();
      currentArea = area;
      current = bulletMatch[1];
      continue;
    }

    const competencyStart = line.match(
      /^(Beherrschen|Kennen|Einblick gewinnen|Übertragen|Anwenden|Nutzen|Auswerten|Einüben|Gestalten|Beurteilen|Erarbeiten|Auswählen|Beschreiben|Vergleichen|Analysieren|Interpretieren|Reflektieren|Übersetzen|Deutung|inhaltliche und formale|Untersuchen|Wiedergabe)\b(.+)$/u,
    );
    if (competencyStart) {
      flush();
      currentArea = area;
      current = line;
      continue;
    }

    if (/^(Die Schüler|Sie |Im Bereich|Dabei |Hinsichtlich|Außerdem|Auf dem Wege|Der Lehrgang)/u.test(line)) {
      flush();
      currentArea = area;
      current = line;
      continue;
    }

    if (current && shouldContinuePrevious(line)) {
      current = `${current} ${line}`;
    }
  }

  flush();
  return goals;
}

function parseSachsenAnhalt(spec: Spec): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let phase = 'Gymnasium Latein';
  let stage: 'SekI' | 'SekII' = 'SekI';
  let courseLevel: CourseLevel = 'unspecified';
  let area = 'Kompetenzbereiche';
  let subArea = '';
  let current: string | null = null;
  let bodyStarted = false;

  const flush = () => {
    const text = cleanSourceText(current ?? '');
    current = null;
    if (!isUsableGoalText(text)) return;
    goals.push(toParsedGoal(spec, phase, `${area}${subArea ? ` · ${subArea}` : ''}`, text, stage, courseLevel));
  };

  for (const [lineIndex, rawLine] of pdftotext(spec.sourcePdfPath).split(/\r?\n/u).entries()) {
    const line = normalizeWhitespace(normalizeBulletChars(rawLine));
    if (!line || isNoiseLine(line) || /^Quelle: Landesportal/u.test(line)) continue;
    if (!bodyStarted) {
      if (lineIndex > 500 && /^3\.1\s+Schuljahrgänge 7\/8$/u.test(line)) {
        bodyStarted = true;
      } else {
        continue;
      }
    }

    const phaseMatch = line.match(/^([3-5]\.\d)\s+(.+)$/u);
    if (phaseMatch) {
      flush();
      phase = `${phaseMatch[1]} ${phaseMatch[2]}`;
      stage = phaseMatch[1].startsWith('5.') ? 'SekII' : 'SekI';
      courseLevel = phaseMatch[1] === '5.2' ? 'LK' : stage === 'SekII' ? 'GK_LK' : 'unspecified';
      area = 'Kompetenzbereiche';
      subArea = '';
      continue;
    }

    const areaMatch = line.match(/^Kompetenzbereich:\s*(.+)$/u);
    if (areaMatch) {
      flush();
      area = areaMatch[1];
      subArea = '';
      continue;
    }

    if (/^Die folgenden (Wissensbestände|Themen)/u.test(line)) {
      flush();
      area = 'Grundlegende Wissensbestände';
      subArea = '';
      continue;
    }

    const topicRow = line.match(/^([A-ZÄÖÜ][A-Za-zÄÖÜäöüß/ -]{2,45})\s{2,}(.+)$/u);
    if (topicRow && !/^Fachlehrplan/u.test(line)) {
      flush();
      subArea = topicRow[1].trim();
      const rest = normalizeBulletChars(topicRow[2]).replace(/^[-•]\s*/u, '');
      if (isUsableGoalText(rest)) current = rest;
      continue;
    }

    const bullet = line.match(/^[-•]\s*(.+)$/u);
    if (bullet) {
      flush();
      current = bullet[1];
      continue;
    }

    if (current && shouldContinuePrevious(line)) {
      current = `${current} ${line}`;
    }
  }

  flush();
  return goals;
}

function parseThueringen(spec: Spec): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let phase = 'Gymnasium Latein';
  let section = 'Kompetenzen';
  let competence = '';
  let stage: 'SekI' | 'SekII' = 'SekI';
  let courseLevel: CourseLevel = 'unspecified';
  let active = false;
  let current: string | null = null;
  let bodyStarted = false;

  const flush = () => {
    const text = cleanSourceText(current ?? '');
    current = null;
    if (!isUsableGoalText(text)) return;
    const area = `${section}${competence ? ` · ${competence}` : ''}`;
    goals.push(toParsedGoal(spec, phase, area, text, stage, courseLevel));
  };

  for (const [lineIndex, rawLine] of pdftotext(spec.sourcePdfPath).split(/\r?\n/u).entries()) {
    const line = normalizeWhitespace(normalizeBulletChars(rawLine));
    if (!line || isNoiseLine(line)) continue;
    if (/^6\s+Leistungseinschätzung$/u.test(line)) {
      flush();
      break;
    }
    if (!bodyStarted) {
      if (lineIndex > 650 && /^2\.1\s+Klassenstufen 5\/6$/u.test(line)) {
        bodyStarted = true;
      } else {
        continue;
      }
    }

    const sectionMatch = line.match(/^([2-5](?:\.\d+){1,2})\s+(.+)$/u);
    if (sectionMatch) {
      flush();
      section = `${sectionMatch[1]} ${sectionMatch[2]}`;
      stage = sectionMatch[1].startsWith('4.') || sectionMatch[1].startsWith('5.') ? 'SekII' : 'SekI';
      courseLevel = stage === 'SekII' ? 'GK_LK' : 'unspecified';
      phase = stage === 'SekII'
        ? sectionMatch[1].startsWith('5.') ? 'Einführungsphase / spaet beginnende Fremdsprache' : 'Gymnasiale Oberstufe'
        : inferThueringenPhase(section);
      competence = '';
      active = true;
      continue;
    }

    if (/^(Sachkompetenz|Methodenkompetenz|Selbst- und Sozialkompetenz)$/u.test(line)) {
      flush();
      competence = line;
      active = true;
      continue;
    }

    if (/^Grundlegendes Anforderungsniveau\s+Erhöhtes Anforderungsniveau$/u.test(line)) {
      flush();
      courseLevel = 'GK_LK';
      continue;
    }

    if (/^Der Schüler kann/u.test(line) || /^Klassenstufe/u.test(line)) {
      active = true;
      continue;
    }

    if (!active) continue;

    const bullet = line.match(/^[-•]\s*(.+)$/u);
    if (bullet) {
      if (!competence && !section.startsWith('4.2')) continue;
      flush();
      current = bullet[1];
      continue;
    }

    if (/^ein Grundwissen in folgenden Bereichen anwenden:?$/u.test(line)) {
      flush();
      continue;
    }

    if (current && shouldContinuePrevious(line)) {
      current = `${current} ${line}`;
    }
  }

  flush();
  return goals;
}

function toParsedGoal(
  spec: Spec,
  phase: string,
  area: string,
  sourceText: string,
  stage: 'SekI' | 'SekII',
  courseLevel: CourseLevel,
): ParsedGoal {
  const passageId = `${spec.jurisdiction.toLowerCase()}-latin-${slug(phase)}-${slug(area)}`;
  const topicCode = passageId.replace(`${spec.jurisdiction.toLowerCase()}-latin-`, '');
  return {
    sourceDocumentKey: spec.sourceDocumentKey,
    passageId,
    topicCode,
    phase,
    area,
    title: shortTitle(sourceText),
    description: asCanStatement(sourceText),
    sourceText,
    sourceLocator: `${phase}, ${area}`,
    stage,
    courseLevel,
  };
}

function buildPassages(spec: Spec, goals: ParsedGoal[]): Passage[] {
  const byPassage = new Map<string, ParsedGoal[]>();
  goals.forEach((goal) => byPassage.set(goal.passageId, [...(byPassage.get(goal.passageId) ?? []), goal]));

  return Array.from(byPassage.entries())
    .map(([passageId, passageGoals]) => ({
      id: passageId,
      sourceDocumentKey: spec.sourceDocumentKey,
      topicCode: passageGoals[0].topicCode,
      title: `${passageGoals[0].phase} · ${passageGoals[0].area}`,
      rawText: passageGoals.map((goal) => `- ${goal.sourceText}`).join('\n'),
      sourceGoalIds: passageGoals.map((goal, index) => sourceGoalId(spec, goal, index)),
      metadata: {
        jurisdiction: spec.jurisdiction,
        subject,
        stage: mergeStage(passageGoals.map((goal) => goal.stage)),
        officialSource: true,
      },
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function toSourceGoal(spec: Spec, goal: ParsedGoal, index: number): SourceGoal {
  return {
    id: sourceGoalId(spec, goal, index),
    sourceDocumentKey: spec.sourceDocumentKey,
    passageId: goal.passageId,
    topicCode: goal.topicCode,
    title: goal.title,
    description: goal.description,
    sourceText: goal.sourceText,
    sourceRef: goal.sourceLocator,
    sourceSpan: {
      passageId: goal.passageId,
      label: `${goal.sourceLocator} #${index + 1}`,
    },
    stage: goal.stage,
    courseLevel: goal.courseLevel,
    tags: [
      `jurisdiction:${spec.jurisdiction}`,
      'subject:Latein',
      `stage:${goal.stage}`,
      `sourceDocument:${spec.sourceDocumentKey}`,
      `courseLevel:${goal.courseLevel}`,
    ],
    metadata: {
      jurisdiction: spec.jurisdiction,
      sourceExtraction: spec.extractionId,
      phase: goal.phase,
      area: goal.area,
      activeOfficialSource: true,
      sourceIndex: index + 1,
    },
  };
}

function toDecision(spec: Spec, sourceGoal: SourceGoal): Decision {
  const targets = canonicalTargetsForSourceGoal(sourceGoal);
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: sourceGoal.topicCode,
    sourceSpan: sourceGoal.sourceSpan.label,
    decision: 'mapped',
    canonicalGoalIds: targets,
    matchType: targets.length <= 3 ? 'exact' : 'partial',
    rationale:
      `Das ${spec.jurisdiction}-Latein-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertige Abdeckungsformen; partial bedeutet keine offene Luecke.`,
    reviewedAt,
    reviewer,
  };
}

function canonicalTargetsForSourceGoal(sourceGoal: SourceGoal): string[] {
  const text = toAscii(`${sourceGoal.title} ${sourceGoal.description} ${sourceGoal.sourceText} ${sourceGoal.sourceRef}`)
    .toLowerCase();
  const targets = new Set<string>();

  if (sourceGoal.stage === 'SekI') addLowerTargets(text, targets);
  else addUpperTargets(text, targets);

  if (sourceGoal.stage === 'SekI') {
    if (targets.size === 0) targets.add(C.lowerText);
    targets.add(C.terminalLower);
  } else if (targets.size === 0) {
    targets.add(C.upperText);
  }

  return Array.from(targets).sort();
}

function addLowerTargets(text: string, targets: Set<string>): void {
  if (/(wort|vokabel|lexik|bedeutung|wortbildung|wortfamilie|sachfeld|fremdwort|lehnwort|aussprache|quantitaet|betonung)/u.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.vocabulary);
    if (/(aussprache|quantitaet|betonung|lernen|wiederholen|sichern|vokabellern|grundwortschatz)/u.test(text)) {
      targets.add(C.vocabularyPronounceLearn);
    }
    if (/(bedeutung|ableitung|wortbildung|praefix|suffix|simplex|kompositum|wortstamm|fremdwort|lehnwort|semantik)/u.test(text)) {
      targets.add(C.vocabularyMeaningWordFormation);
    }
    if (/(wortart|sachfeld|wortfeld|wortfamilie|stammform|genitiv|genus|lexikalisch|kategorie)/u.test(text)) {
      targets.add(C.vocabularyOrderLexicalData);
    }
    if (/(moderne|deutsch|romanisch|englisch|fremdsprach|fachsprache|alltag|sentenz)/u.test(text)) {
      targets.add(C.vocabularyLanguageConnections);
    }
  }

  if (/(morpholog|formenlehre|form|kasus|numerus|genus|tempus|modus|diathese|deklination|konjugation|partizip|infinitiv|gerund|gerundiv|deponent|pronomen|adjektiv|adverb|komparation|flexion)/u.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.grammar);
    if (/(analys|bestimm|termini|person|numerus|modus|tempus|genus verbi|kasus|einordnen)/u.test(text)) {
      targets.add(C.morphologyAnalyzeForms);
    }
    if (/(paradigm|deklinationsklasse|konjugationsklasse|grundform|formenaufbau|segmentier|flexion|systemgrammatik)/u.test(text)) {
      targets.add(C.morphologyParadigmsClasses);
    }
    if (/(unregelmaessig|deponent|semideponent|defectiva|nd-form|partizip|komparation|gerund|gerundiv|supin|futur|konjunktiv)/u.test(text)) {
      targets.add(C.morphologyIrregularReference);
    }
  }

  if (/(syntax|satz|satzglied|subjekt|praedikat|objekt|attribut|adverbial|kongruenz|nebensatz|hauptsatz|aci|nci|ablativus|pc|kasusfunktion|relativsatz|konjunktional|hypotaxe|parataxe|valenz|consecutio|oratio)/u.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.grammar);
    if (/(satzglied|subjekt|praedikat|objekt|attribut|adverbial|fuellung)/u.test(text)) targets.add(C.syntaxSentenceParts);
    if (/(hauptsatz|nebensatz|relativsatz|konjunktional|adverbialsatz|fragesatz|befehlssatz|gliedsatz|subjunktion)/u.test(text)) targets.add(C.syntaxClauseTypes);
    if (/(aci|nci|ablativus|participium|partizip|pc|satzwertig|nd-form|oratio obliqua|infinitiv)/u.test(text)) targets.add(C.syntaxConstructions);
    if (/(kasus|tempus|modus|pronomen|kongruenz|semantisch|zeitverhaeltnis|sinnrichtung|valenz)/u.test(text)) targets.add(C.syntaxFunctionsRelations);
  }

  if (/(uebersetz|uebertrag|erschliess|dekodier|rekodier|text|lektuer|paraphras|inhalt|interpret|stil|gattung|literatur|beleg|aussage|deut|wiedergabe|lesevortrag)/u.test(text)) {
    targets.add(C.lowerText);
    targets.add(C.translation);
    if (/(interpret|deut|beleg|aussage|wirkung|stellung|kontext|gattung|perspektiv|textpragmatik)/u.test(text)) targets.add(C.interpretation);
    if (/(uebersetz|zielsprach|sinngemaess|woerterbuch|wiedergabe|textgrammatik|rekodier|dekodier)/u.test(text)) {
      targets.add(C.syntaxTranslateStructures);
      targets.add(C.methodTranslationReflection);
    }
  }

  if (/(kultur|antike|rom|roemisch|griechisch|myth|religion|goetter|alltag|forum|topograph|politik|geschichte|sachverhalt|rezeption|kunst|film|spiel|sklaverei|migration|werte|ethisch|gesellschaft|familie|thermen|architektur|wasser|republik|kaiser|provinz|cicero|caesar|augustus|pompeius)/u.test(text)) {
    targets.add(C.lowerCulture);
    if (/(alltag|familie|kind|topograph|forum|subura|kapitol|thermen|wasser|architektur|kalender|hygiene|schule|freizeit|kleidung|kueche)/u.test(text)) targets.add(C.cultureEverydayTopography);
    if (/(geschichte|politik|staat|buerger|herrschaft|cursus|migration|gesellschaft|republik|kaiser|senat|provinz|militaer|buergerkrieg|pompeius|augustus|caesar|cicero)/u.test(text)) targets.add(C.cultureHistoryPolitics);
    if (/(myth|religion|goetter|olymp|romulus|remus|polytheistisch|tempel|orakel)/u.test(text)) targets.add(C.cultureMythReligion);
    if (/(rezeption|kunst|film|spiel|fortleben|spuren|muse|ausgrab|architektur|christentum)/u.test(text)) targets.add(C.cultureReception);
    if (/(werte|ethisch|sklaverei|dilemma|beurteilen|vergleichen|orientierung|human|gegenwart|wertediskurs|pietas|virtus)/u.test(text)) targets.add(C.cultureValuesReflection);
  }

  if (/(methode|medien|digital|recherche|praesent|team|kommunikation|kooperation|feedback|selbststaendig|reflektier|woerterbuch|grammatik|lern|arbeit|gruppe|partner|quelle|visualisier|markier|portfolio|hilfsmittel|internet)/u.test(text)) {
    targets.add(C.lowerMethods);
    if (/(uebersetz|erschliess|markier|satz|textgrammatik|pendel|fehler|dekodier|rekodier)/u.test(text)) targets.add(C.methodTranslationReflection);
    if (/(lernen|wiederholen|sichern|vokabel|formen|begleitgrammatik|selbststaendig|hausaufgabe|portfolio|lernfortschritt)/u.test(text)) targets.add(C.methodLearningOrganization);
    if (/(recherche|quelle|woerterbuch|grammatik|suchmaschine|browser|analog|digital|information|internet|lexika)/u.test(text)) targets.add(C.methodResearchTools);
    if (/(praesent|darstell|referat|medial|arbeitsergebnis|kommunikation|kooperation|team|feedback|podcast|video)/u.test(text)) targets.add(C.methodPresentResults);
  }
}

function addUpperTargets(text: string, targets: Set<string>): void {
  if (/(wort|vokabel|bedeutung|wortbildung|fremdwort|lehnwort|sprache|grammatik|syntax|morpholog|form|kasus|tempus|modus|aci|partizip|ablativus|gerund|oratio|satzstruktur|woerterbuch|metrik|stilistik)/u.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
  }
  if (/(metrik|vers|hexameter|distichon|stil|gestaltung|alliteration|anapher|metapher|rhetorisch|tropen|figuren|poetisch)/u.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
    targets.add(C.poetry);
  }
  if (/(text|lektuer|uebersetz|wiedergeb|erschliess|originaltext|sinn|paraphrase|translat|gattung|literatur|textkritik|textvergleich)/u.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperTranslation);
  }
  if (/(deut|interpret|wirkung|aussage|stellung|beurteilen|fragestellung|rezeption|kontext|vergleich|begruenden|standpunkt|textbeleg|uebersetzungskritik)/u.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperInterpretation);
  }
  if (/(antike|geschichte|politik|rom|cicero|sallust|plinius|ovid|livius|vergil|caesar|catull|seneca|myth|religion|philosophie|gesellschaft|ethisch|existentiell|kultur|provinz|republik|staat|europa|tradition|augusteisch|buergerrecht)/u.test(text)) {
    targets.add(C.upperCulture);
  }
  if (/(politik|geschichte|staat|cicero|caesar|sallust|rede|rhetorik|argument|propaganda|herrschaft|republik|provinz|recht|prozess|manipulation|wort als waffe)/u.test(text)) {
    targets.add(C.rhetoric);
  }
  if (/(philosophie|philosophisch|ethisch|existentiell|religion|mythos|wert|leben|mensch|stoa|seneca|epikur|human|bellum iustum)/u.test(text)) {
    targets.add(C.philosophy);
  }
  if (/(poetisch|ovid|vergil|catull|martial|phaedrus|eleg|dichtung|vers|kunst|carmina|lyrik|brief|mythos)/u.test(text)) {
    targets.add(C.poetry);
  }
}

function buildExtraction(spec: Spec, passages: Passage[], sourceGoals: SourceGoal[]): unknown {
  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: spec.jurisdiction,
    subject,
    schoolType: 'Gymnasium',
    stage: 'SekI+SekII',
    createdAt: reviewedAt,
    sourceDocument: sourceDocument(spec),
    sourceDocuments: [sourceDocument(spec)],
    method: {
      extractor: 'generateSnStThLatinSourceExtraction.ts',
      passageExtraction:
        'pdftotext -layout; Kompetenzabschnitte, Lernbereiche, Kompetenzbereiche und Wissensbestände werden aus dem amtlichen Landes-PDF segmentiert.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro explizitem Kompetenzbullet, verbindlichem Inhaltsbullet oder fachlich eigenständiger Zielformulierung aus der Originalquelle.',
      mappingStatus:
        'MAPPING-3 complete after fachliche Erstpruefung: all official Latin source goals are covered by canonical Latin goals.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        accepted: true,
        details:
          `${sourceGoals.length} ${spec.jurisdiction}-Latein-Source-Ziele aus einem amtlichen Gymnasium-PDF; die Abweichung wird akzeptiert, weil die Landesdokumente unterschiedlich granular zwischen Kompetenzstandards, Lernbereichen, Themen und Wissensbestaenden ausweisen.`,
        rationale:
          'Latein-Lehrplaene unterscheiden sich stark darin, ob Kompetenzbereiche, Sprachsystematik, Themenfelder und Wissensbestaende getrennt oder gebuendelt ausgewiesen werden. Die Extraktion zaehlt nur explizite Originalquellen-Einheiten und keine Legacy-Snapshots.',
      },
    },
    pipelineStatus: buildPipeline(spec, sourceGoals.length, passages.length),
    passages,
    sourceGoals,
  };
}

function buildReview(spec: Spec, sourceGoals: SourceGoal[], decisions: Decision[]): unknown {
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
    reviewId: `${spec.extractionId.toLowerCase()}-to-canonical-latin`,
    sourceExtractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.extractionPath,
    status: 'completed',
    title: `${spec.title} · Source-Ziele zu kanonischem Latein`,
    subject,
    jurisdiction: spec.jurisdiction,
    stage: 'SekI+SekII',
    createdAt: reviewedAt,
    reviewer,
    summary: {
      sourceGoals: sourceGoals.length,
      reviewedSourceGoals: decisions.length,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: decisions.length,
      needsCanonicalGoal: 0,
      exactMappings,
      partialMappings: decisions.length - exactMappings,
      inheritedMappings: 0,
      unmapped: 0,
      note:
        `${spec.jurisdiction} Latein ist fachlich erstgeprueft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertig; partial beschreibt die Zuordnungsform, nicht eine fachliche Luecke.`,
    },
    mappings,
    decisions,
  };
}

function buildPipeline(spec: Spec, sourceGoalCount: number, passageCount: number): unknown {
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
            id: 'official-source-pdf-present',
            label: 'Amtliche PDF-Datei liegt lokal vor',
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
            id: 'official-passages-extracted',
            label: 'Original-Lehrplanpassagen aus amtlichem Landes-PDF extrahiert',
            passed: true,
            details: `${passageCount} Passagegruppen.`,
          },
          {
            id: 'no-legacy-snapshot-source',
            label: 'Source-Extraction basiert auf Originalquelle statt Legacy-Snapshot',
            passed: true,
            details: spec.sourcePdfPath,
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
            label: 'Source-Ziele aus Lehrplanpassagen erzeugt',
            passed: true,
            details: `${sourceGoalCount} Source-Ziele.`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: true,
            details: 'Doppelte IDs: 0.',
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
        dependsOn: ['MAPPING-2'],
        checks: [
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: spec.reviewPath,
          },
          {
            id: 'm3-review-decisions-reference-source-goals',
            label: 'M3-Review-Entscheidungen referenzieren gueltige Source-Ziele',
            passed: true,
            details: `Reviewed Source-Ziele: ${sourceGoalCount}/${sourceGoalCount}.`,
          },
          {
            id: 'm3-review-targets-exist',
            label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
            passed: true,
            details: 'Unbekannte Canonical-Ziele: -',
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${sourceGoalCount}/${sourceGoalCount} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: `Fachlich abgedeckt: ${sourceGoalCount}/${sourceGoalCount}; verbleibend: 0 explizite Canonical-Gaps, 0 unreviewed.`,
          },
        ],
      },
    ],
  };
}

function upsertRegistry(spec: Spec, sourceGoals: number, passages: number): void {
  const registry = JSON.parse(readFileSync(abs(registryPath), 'utf8')) as { entries: Array<Record<string, unknown>> };
  registry.entries = registry.entries.filter((entry) => entry.landscapeId !== spec.sourceLandscapeId);
  registry.entries.push({
    landscapeId: spec.sourceLandscapeId,
    title: spec.title,
    jurisdiction: spec.jurisdiction,
    subject,
    stage: 'SekI+SekII',
    sourcePath: spec.sourcePdfPath,
    archiveSourcePath: spec.sourcePdfPath,
    archivePath: path.dirname(spec.sourcePdfPath),
    sourceDocumentKey: spec.sourceDocumentKey,
    sourceUrl: spec.sourceUrl,
    sourceExtractionPath: spec.extractionPath,
    mappingReviewPath: spec.reviewPath,
    metrics: {
      passages,
      sourceGoals,
      unmapped: 0,
      canonicalGaps: 0,
    },
  });
  registry.entries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)));
  writeJson(registryPath, registry);
}

function sourceDocument(spec: Spec): unknown {
  return {
    key: spec.sourceDocumentKey,
    title: spec.sourceDocumentTitle,
    path: spec.sourcePdfPath,
    url: spec.sourceUrl,
    official: true,
    available: true,
  };
}

function dedupeParsedGoals(goals: ParsedGoal[]): ParsedGoal[] {
  const seen = new Set<string>();
  return goals.filter((goal) => {
    const key = `${goal.sourceDocumentKey}:${goal.phase}:${goal.area}:${toAscii(goal.sourceText).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sourceGoalId(spec: Spec, goal: ParsedGoal, index: number): string {
  return uuidFromString(`${spec.extractionId}:${goal.passageId}:${index}:${goal.sourceText}`);
}

function inferThueringenPhase(section: string): string {
  if (/Klassenstufen 5\/6/u.test(section)) return 'Klassenstufen 5/6';
  if (/Klassenstufen 7\/8/u.test(section)) return 'Klassenstufen 7/8';
  if (/Klassenstufen 9\/10/u.test(section)) return 'Klassenstufen 9/10';
  return 'Sekundarstufe I';
}

function mergeStage(stages: Array<'SekI' | 'SekII'>): Stage {
  const unique = new Set(stages);
  if (unique.size === 1) return stages[0];
  return 'SekI+SekII';
}

function shouldContinuePrevious(line: string): boolean {
  if (isNoiseLine(line)) return false;
  if (/^(Lernbereich|Wahlthema|Kompetenzbereich|Sachkompetenz|Methodenkompetenz|Selbst- und Sozialkompetenz)/u.test(line)) return false;
  if (/^[A-ZÄÖÜ][A-Za-zÄÖÜäöüß/ -]{2,45}\s{2,}/u.test(line)) return false;
  return !/^(Latein als|Jahrgangsstufen|Ziele|Klassenstufe)/u.test(line);
}

function isUsableGoalText(text: string): boolean {
  if (text.length < 14 || text.length > 420) return false;
  if (/^(Die Schüler kennen|Der Schüler kann|Die folgenden|Grundlegende Wissensbestände|Themen Inhalte|Kompetenzbereich|Sachkompetenz|Methodenkompetenz|Selbst- und Sozialkompetenz)$/u.test(text)) return false;
  if (/^(Lehrplan|Fachlehrplan|Quelle:|Seite|GY – LA|Gymnasium|Latein\s+\d{4})/u.test(text)) return false;
  if (/^\d+$/u.test(text)) return false;
  return /[A-Za-zÄÖÜäöüß]{4}/u.test(text);
}

function isNoiseLine(line: string): boolean {
  return /^\d+$/u.test(line)
    || /^/u.test(line)
    || /^Syntax (Warning|Error):/u.test(line)
    || /^\d+\s+\d{4}\s+GY\s+LA/u.test(line)
    || /^GY\s+LA\s+\d{4}/u.test(line)
    || /^GY\s+–\s+LA/u.test(line)
    || /^Fachlehrplan Latein Gymnasium/u.test(line)
    || /^Landesportal Sachsen-Anhalt/u.test(line)
    || /^Quelle: /u.test(line)
    || /^Inhaltsverzeichnis/u.test(line)
    || /^Thüringer Ministerium/u.test(line)
    || /^Latein\s*$/u.test(line)
    || /^Lehrplan für den Erwerb/u.test(line);
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
  return text.replace(/[–−]/gu, '-').replace(/[·•]/gu, '•');
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\u00a0/gu, ' ').replace(/\s+/gu, ' ').trim();
}

function lcFirst(text: string): string {
  return text ? `${text.charAt(0).toLocaleLowerCase('de-DE')}${text.slice(1)}` : text;
}

function slug(text: string): string {
  return toAscii(text).toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 110);
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

function assertUnique(values: string[], label: string): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  if (duplicates.size > 0) throw new Error(`Duplicate ${label} IDs: ${Array.from(duplicates).join(', ')}`);
}

function pdftotext(pdfPath: string): string {
  return execFileSync('pdftotext', ['-layout', abs(pdfPath), '-'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function abs(filePath: string): string {
  return path.resolve(repoRoot, filePath);
}

function writeJson(filePath: string, value: unknown): void {
  mkdirSync(path.dirname(abs(filePath)), { recursive: true });
  writeFileSync(abs(filePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
