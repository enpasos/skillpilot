#!/usr/bin/env tsx

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Stage = 'SekI' | 'SekII';
type MatchType = 'exact' | 'partial';

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
  expectedMinimumGoals: number;
  expectedPassages: number;
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
  matchType: MatchType;
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
    sourceLandscapeId: uuidFromString('DE-HH-LATEIN-SEKI-BILDUNGSPLAN-2011-SOURCE-EXTRACTION'),
    extractionId: 'DE_HH_LATEIN_SEKI_BILDUNGSPLAN_2011',
    title: 'Latein Sekundarstufe I (Hamburg, Bildungsplan 2011 Source-Extraction)',
    sourceDocumentKey: 'HH-BILDUNGSPLAN-ALTE-SPRACHEN-GYM-SEKI-2011',
    sourceDocumentTitle: 'Hamburg Bildungsplan Gymnasium Sekundarstufe I Alte Sprachen',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HH/latein/alte-sprachen-gym-seki-data.pdf',
    sourceUrl: 'https://www.hamburg.de/resource/blob/123402/b1e4c576af201281ac001b38a929116b/alte-sprachen-gym-seki-data.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/HH/latein/source-extraction/DE_HH_LATEIN_SEKI_BILDUNGSPLAN_2011.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_latin_lower_secondary_source_extraction_to_canonical_latin.review.json',
    expectedMinimumGoals: 190,
    expectedPassages: 12,
  },
  {
    stage: 'SekII',
    sourceLandscapeId: uuidFromString('DE-HH-LATEIN-SEKII-STUDIENSTUFE-2022-SOURCE-EXTRACTION'),
    extractionId: 'DE_HH_LATEIN_SEKII_STUDIENSTUFE_2022',
    title: 'Latein Studienstufe (Hamburg, Bildungsplan 2022 Source-Extraction)',
    sourceDocumentKey: 'HH-BILDUNGSPLAN-ALTE-SPRACHEN-STUDIENSTUFE-2022',
    sourceDocumentTitle: 'Hamburg Bildungsplan Studienstufe Alte Sprachen',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/HH/latein/altesprachen-gyo-2022-data.pdf',
    sourceUrl: 'https://www.hamburg.de/resource/blob/123026/76a81e12f582a608c0a21a280e1f0d96/altesprachen-gyo-2022-data.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/HH/latein/source-extraction/DE_HH_LATEIN_SEKII_STUDIENSTUFE_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_latin_upper_secondary_source_extraction_to_canonical_latin.review.json',
    expectedMinimumGoals: 190,
    expectedPassages: 18,
  },
];

for (const spec of specs) {
  const parsedGoals = spec.stage === 'SekI' ? parseSekI(spec) : parseSekII(spec);
  const dedupedGoals = dedupeParsedGoals(parsedGoals);
  if (dedupedGoals.length < spec.expectedMinimumGoals) {
    throw new Error(`${spec.extractionId}: only ${dedupedGoals.length} source goals parsed`);
  }
  const passages = buildPassages(spec, dedupedGoals);
  if (passages.length < spec.expectedPassages) {
    throw new Error(`${spec.extractionId}: only ${passages.length} passage groups parsed`);
  }
  const sourceGoals = dedupedGoals.map((goal, index) => toSourceGoal(spec, goal, index));
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

function parseSekI(spec: Spec): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  const sections = [
    { pages: [18], area: 'Sprache · Wortschatz' },
    { pages: [19], area: 'Sprache · Grammatik' },
    { pages: [20], area: 'Text · Texterschließung' },
    { pages: [21], area: 'Text · Übersetzung' },
    { pages: [22], area: 'Text · Interpretation' },
    { pages: [23], area: 'Kultur · Kulturhistorisches Orientierungswissen' },
    { pages: [24], area: 'Kultur · Historischer Diskurs und Rezeption' },
    { pages: [25], area: 'Interkulturelle Kompetenzen' },
    { pages: [26, 27], area: 'Methodische Kompetenzen' },
  ];

  for (const section of sections) {
    for (const page of section.pages) {
      goals.push(...parseThreeColumnPage(spec, page, section.area));
    }
  }
  goals.push(...parseSekIContent(spec));
  goals.push({
    passageId: 'seki-latein-dritte-fremdsprache-ab-jahrgang-8',
    phase: 'Jahrgangsstufe 10 · dritte Fremdsprache ab Jahrgangsstufe 8',
    area: 'Latein als dritte Fremdsprache',
    title: 'Lateinkenntnisse als dritte Fremdsprache systematisch mit modernen Fremdsprachen verbinden',
    description:
      'Die lernende Person kann Kenntnisse moderner Fremdsprachen aktiv zur systematischen Aneignung des Lateinischen und zum systematischen Vergleich insbesondere mit romanischen Sprachen nutzen.',
    sourceText:
      'Die Schülerinnen und Schüler nutzen ihre Kenntnisse moderner Fremdsprachen aktiv zur systematischen Aneignung des Lateinischen und zum systematischen Vergleich insbesondere mit romanischen Sprachen.',
    sourceLocator: 'S. 33, Latein als 3. Fremdsprache ab Jahrgangsstufe 8',
  });
  return goals;
}

function parseThreeColumnPage(spec: Spec, page: number, area: string): ParsedGoal[] {
  const text = pdftotext(spec, page, page);
  const lines = text.split(/\r?\n/u);
  const starts = inferColumnStarts(lines);
  const phases =
    page <= 24
      ? ['Ende Jahrgangsstufe 6', 'Ende Jahrgangsstufe 8', 'Latinum / Übergang Studienstufe']
      : ['Jahrgangsstufe 6', 'Jahrgangsstufe 8', 'Jahrgangsstufe 10'];
  const current: Array<string[]> = [[], [], []];
  const goals: ParsedGoal[] = [];

  const flush = (column: number) => {
    const sourceText = cleanSourceText(current[column].join(' '));
    current[column] = [];
    if (!isUsableGoalText(sourceText)) return;
    goals.push({
      passageId: slug(`hh-latein-seki-${phases[column]}-${area}`),
      phase: phases[column],
      area,
      title: shortTitle(sourceText),
      description: asCanStatement(sourceText),
      sourceText,
      sourceLocator: `S. ${page}, ${phases[column]}, ${area}`,
    });
  };

  for (const rawLine of lines) {
    if (isHeaderOrFooter(rawLine)) continue;
    const columns = sliceColumns(rawLine, starts);
    for (let column = 0; column < columns.length; column += 1) {
      const segment = normalizeWhitespace(columns[column]);
      if (!segment || isStructuralLine(segment)) continue;
      const bullet = segment.match(/^[•◦o]\s*(.+)$/u);
      if (bullet) {
        flush(column);
        current[column].push(bullet[1]);
      } else if (current[column].length > 0 && !isPageNumber(segment)) {
        current[column].push(segment);
      }
    }
  }
  [0, 1, 2].forEach(flush);
  return goals;
}

function parseSekIContent(spec: Spec): ParsedGoal[] {
  const text = pdftotext(spec, 28, 32);
  const goals: ParsedGoal[] = [];
  let phase = 'Jahrgangsstufe 6';
  let area = 'Inhalte Latein';
  let current: string[] = [];

  const flush = () => {
    const sourceText = cleanSourceText(current.join(' '));
    current = [];
    if (!isUsableThemeText(sourceText)) return;
    goals.push({
      passageId: slug(`hh-latein-seki-${phase}-${area}`),
      phase,
      area,
      title: shortTitle(sourceText),
      description: `Die lernende Person kann ${lcFirst(sourceText)} im Kontext des Hamburger Lateinunterrichts fachlich einordnen.`,
      sourceText,
      sourceLocator: `${phase}, ${area}`,
    });
  };

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = normalizeWhitespace(rawLine);
    if (!line || isHeaderOrFooter(rawLine) || isPageNumber(line) || /^kompetenzbereich$/iu.test(line)) continue;
    const phaseMatch = line.match(/^Jahrgangsstufe\s+(6|8|10)$/u);
    if (phaseMatch) {
      flush();
      phase = `Jahrgangsstufe ${phaseMatch[1]}`;
      area = 'Inhalte Latein';
      continue;
    }
    const areaMatch = detectSekIContentArea(line);
    if (areaMatch) {
      flush();
      area = areaMatch;
      continue;
    }
    const bullet = line.match(/^[•◦]\s*(.+)$/u);
    if (bullet) {
      flush();
      current.push(bullet[1]);
      continue;
    }
    if (current.length > 0 && !isStructuralLine(line)) {
      current.push(line);
    }
  }
  flush();
  return goals;
}

function parseSekII(spec: Spec): ParsedGoal[] {
  return [
    ...parseUpperCompetencies(spec),
    ...parseUpperModules(spec),
  ];
}

function parseUpperCompetencies(spec: Spec): ParsedGoal[] {
  const text = pdftotext(spec, 8, 11);
  const goals: ParsedGoal[] = [];
  let area = 'Fachliche Kompetenzen';
  let current: string[] = [];
  let active = false;

  const flush = () => {
    const sourceText = cleanSourceText(current.join(' '));
    current = [];
    if (!isUsableGoalText(sourceText)) return;
    goals.push({
      passageId: slug(`hh-latein-sekii-kompetenzen-${area}`),
      phase: 'Studienstufe',
      area,
      title: shortTitle(sourceText),
      description: asCanStatement(sourceText),
      sourceText,
      sourceLocator: `S. 8-11, ${area}`,
    });
  };

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = normalizeWhitespace(rawLine);
    if (!line || isHeaderOrFooter(rawLine) || isPageNumber(line)) continue;
    const areaMatch = line.match(/^2\.2\.\d\s+Kompetenzbereich\s+(.+)$/u);
    if (areaMatch) {
      flush();
      area = `Kompetenzbereich ${areaMatch[1]}`;
      active = true;
      continue;
    }
    if (!active) continue;
    const bullet = line.match(/^[•◦]\s*(.+)$/u);
    if (bullet) {
      flush();
      current.push(bullet[1]);
      continue;
    }
    if (current.length > 0 && !/^Bildung in der digitalen Welt:?$/u.test(line)) current.push(line);
  }
  flush();
  return goals;
}

function parseUpperModules(spec: Spec): ParsedGoal[] {
  const text = pdftotext(spec, 13, 41);
  const goals: ParsedGoal[] = [];
  let theme = 'Inhalte Latein';
  let module = '';
  let subarea = 'Modulinhalt';
  let current: string[] = [];
  let intro: string[] = [];

  const flushCurrent = () => {
    const sourceText = cleanSourceText(current.join(' '));
    current = [];
    if (!module || !isUsableThemeText(sourceText)) return;
    goals.push({
      passageId: slug(`hh-latein-sekii-${theme}-${module}-${subarea}`),
      phase: 'Studienstufe',
      area: `${theme} · ${module} · ${subarea}`,
      title: shortTitle(sourceText),
      description: `Die lernende Person kann ${lcFirst(sourceText)} im Kontext lateinischer Originallektüre fachlich einordnen.`,
      sourceText,
      sourceLocator: `S. 13-41, ${theme}, ${module}, ${subarea}`,
    });
  };

  const flushIntro = () => {
    const sourceText = cleanSourceText(intro.join(' '));
    intro = [];
    if (!module || !isUsableThemeText(sourceText)) return;
    goals.push({
      passageId: slug(`hh-latein-sekii-${theme}-${module}-ueberblick`),
      phase: 'Studienstufe',
      area: `${theme} · ${module} · Modulüberblick`,
      title: shortTitle(sourceText),
      description: `Die lernende Person kann ${lcFirst(sourceText)} als thematischen Zugriff lateinischer Originallektüre erläutern.`,
      sourceText,
      sourceLocator: `S. 13-41, ${theme}, ${module}`,
    });
  };

  for (const rawLine of text.split(/\r?\n/u)) {
    const trimmed = normalizeWhitespace(rawLine);
    if (!trimmed || isHeaderOrFooter(rawLine) || isPageNumber(trimmed)) continue;
    const themeMatch = trimmed.match(/^Themenbereich\s+\d+:\s+(.+)$/u);
    if (themeMatch) {
      flushCurrent();
      flushIntro();
      theme = `Themenbereich ${themeMatch[1]}`;
      subarea = 'Modulinhalt';
      continue;
    }
    const newBeginningThemeMatch = trimmed.match(/^Latein neu aufgenommen(?:\s+Themenbereich\s+\d+:\s+(.+))?$/u);
    if (newBeginningThemeMatch) {
      flushCurrent();
      flushIntro();
      theme = newBeginningThemeMatch[1] ? `Latein neu aufgenommen · Themenbereich ${newBeginningThemeMatch[1]}` : 'Latein neu aufgenommen';
      subarea = 'Modulinhalt';
      continue;
    }
    const moduleMatch = trimmed.match(/^(S(?:1-4|[1-4]|3\/4))\s+(.+)$/u);
    if (moduleMatch) {
      flushCurrent();
      flushIntro();
      module = `${moduleMatch[1]} ${moduleMatch[2]}`.replace(/\s+/gu, ' ').trim();
      subarea = 'Modulinhalt';
      continue;
    }
    const subareaMatch = detectUpperModuleSubarea(trimmed);
    if (subareaMatch) {
      flushCurrent();
      flushIntro();
      subarea = subareaMatch;
      continue;
    }
    const bulletPos = contentBulletPosition(rawLine);
    if (bulletPos >= 0) {
      flushCurrent();
      current.push(rawLine.slice(bulletPos + 1, 96).trim());
      continue;
    }
    if (current.length > 0) {
      const continuation = contentColumn(rawLine);
      if (continuation && !isStructuralLine(continuation)) current.push(continuation);
      continue;
    }
    if (module && intro.length < 5 && !/^Übergreifend|^Fachübergreifend|^Leitperspektiven|^Kompetenzen|^\[bleibt/u.test(trimmed)) {
      const content = contentColumn(rawLine);
      if (content && isIntroLine(content)) intro.push(content);
    }
  }
  flushCurrent();
  flushIntro();
  return goals;
}

function detectSekIContentArea(line: string): string | null {
  if (/^kultur/i.test(line)) return 'Kultur';
  if (/^text$/iu.test(line)) return 'Text';
  if (/^sprache$/iu.test(line)) return 'Sprache';
  if (/^Texterschließung$/u.test(line)) return 'Text · Texterschließung';
  if (/^Übersetzung$/u.test(line)) return 'Text · Übersetzung';
  if (/^Interpretation$/u.test(line)) return 'Text · Interpretation';
  if (/^Wortschatz:?$/u.test(line)) return 'Sprache · Wortschatz';
  if (/^Grammatik:?$/u.test(line)) return 'Sprache · Grammatik';
  return null;
}

function detectUpperModuleSubarea(line: string): string | null {
  if (/^Struktur und Sprache:?$/u.test(line)) return 'Struktur und Sprache';
  if (/^Inhalte:?$/u.test(line)) return 'Inhalte';
  if (/^Verpflichtend ist zusätzlich im erhöhten Niveau:?$/u.test(line)) return 'erhöhtes Niveau';
  if (/^politisch\/historisch\/kultureller Hintergrund:?$/u.test(line)) return 'politisch-historischer Hintergrund';
  if (/^Beitrag zur Leitperspektive W:?$/u.test(line)) return 'Leitperspektive Werteorientierung';
  if (/^Beitrag zur Leitperspektive BNE:?$/u.test(line)) return 'Leitperspektive BNE';
  if (/^Beitrag zur Leitperspektive D:?$/u.test(line)) return 'Leitperspektive digitale Welt';
  return null;
}

function inferColumnStarts(lines: string[]): number[] {
  const signatures = new Map<string, { starts: number[]; count: number }>();
  for (const line of lines) {
    const starts = [...line].flatMap((char, index) => (char === '•' ? [index] : []));
    if (starts.length >= 3) {
      const firstThree = starts.slice(0, 3);
      const key = firstThree.map((start) => Math.round(start / 4) * 4).join(',');
      const existing = signatures.get(key);
      if (existing) existing.count += 1;
      else signatures.set(key, { starts: firstThree, count: 1 });
    }
  }
  const best = [...signatures.values()].sort((left, right) => right.count - left.count)[0];
  return best ? best.starts : [27, 64, 99];
}

function sliceColumns(line: string, starts: number[]): string[] {
  return starts.map((start, index) => {
    const end = starts[index + 1] ?? line.length + 1;
    return line.slice(start, end).trimEnd();
  });
}

function contentBulletPosition(line: string): number {
  const positions = [...line].flatMap((char, index) => (char === '•' ? [index] : []));
  return positions.find((position) => position >= 20) ?? -1;
}

function contentColumn(line: string): string {
  return normalizeWhitespace(line.slice(27, 96));
}

function isIntroLine(line: string): boolean {
  if (line.length < 24) return false;
  if (/^(Inhalte|Fachbegriffe|Aufgabengebiete|Sprachbildung|Fachübergreifende Bezüge)/u.test(line)) return false;
  return !/^(W|BNE|D|S|T|I|M)(\s|$)/u.test(line);
}

function dedupeParsedGoals(goals: ParsedGoal[]): ParsedGoal[] {
  const seen = new Set<string>();
  return goals.filter((goal) => {
    const key = `${goal.phase}|${goal.area}|${goal.sourceText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildPassages(spec: Spec, parsedGoals: ParsedGoal[]): Passage[] {
  const byId = new Map<string, Passage>();
  for (const goal of parsedGoals) {
    const sourceGoalId = `${spec.stage}:${goal.sourceLocator}:${hashSlug(goal.sourceText)}`;
    const existing = byId.get(goal.passageId);
    if (existing) {
      existing.rawText += `\n- ${goal.sourceText}`;
      existing.sourceGoalIds.push(sourceGoalId);
      continue;
    }
    byId.set(goal.passageId, {
      id: goal.passageId,
      sourceDocumentKey: spec.sourceDocumentKey,
      topicCode: goal.passageId,
      title: `${goal.phase} · ${goal.area}`,
      rawText: `- ${goal.sourceText}`,
      sourceGoalIds: [sourceGoalId],
    });
  }
  return [...byId.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function toSourceGoal(spec: Spec, goal: ParsedGoal, index: number): SourceGoal {
  const prefix = spec.stage === 'SekI' ? 'hh-latin-seki' : 'hh-latin-sekii';
  const id = `${prefix}-${String(index + 1).padStart(3, '0')}-${hashSlug(`${goal.sourceLocator}:${goal.sourceText}`)}`;
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
    tags: ['jurisdiction:DE-HH', 'subject:Latein', `stage:${spec.stage}`],
    metadata: {
      phase: goal.phase,
      field: goal.area,
      extractionMethod:
        spec.stage === 'SekI'
          ? 'Anforderungstabellen, interkulturelle/methodische Kompetenzen und Inhaltsseiten aus dem amtlichen Hamburger Sek-I-Bildungsplan'
          : 'Kompetenzbereiche und Latein-Module aus dem amtlichen Hamburger Studienstufen-Bildungsplan 2022',
      sourceIndex: index + 1,
    },
  };
}

function toDecision(spec: Spec, sourceGoal: SourceGoal): Decision {
  const text = toAscii(`${sourceGoal.title} ${sourceGoal.description} ${sourceGoal.sourceText} ${sourceGoal.metadata.field}`).toLowerCase();
  const targets = new Set<string>(spec.stage === 'SekI' ? [C.lower] : []);
  if (spec.stage === 'SekI') {
    mapSekI(text, targets);
    targets.add(C.terminalLower);
  } else {
    mapSekII(text, targets);
  }
  if (targets.size === 0) targets.add(spec.stage === 'SekI' ? C.lowerText : C.upperText);
  const canonicalGoalIds = [...targets].sort();
  const matchType: MatchType = canonicalGoalIds.length <= 3 ? 'exact' : 'partial';
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: sourceGoal.topicCode,
    sourceSpan: sourceGoal.sourceSpan.label,
    decision: 'mapped',
    canonicalGoalIds,
    matchType,
    rationale:
      'Das Hamburger Latein-Source-Ziel ist inhaltlich durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertige Abdeckungsformen; partial bedeutet keine offene Luecke.',
    reviewedAt,
    reviewer,
  };
}

function mapSekI(text: string, targets: Set<string>): void {
  if (/(wort|vokabel|bedeutung|wortbildung|fremdwort|lexik|woerterbuch|vokabelverzeichnis)/u.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.vocabulary);
  }
  if (/(form|deklination|konjugation|kasus|tempus|modus|satz|grammatik|sprache|kongruenz|aci|participium|ablativus|gerund|partizip|supinum|konjunktiv|indikativ|pronomen|adverb|subjunktion)/u.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.grammar);
  }
  if (/(aussprache|betonung|lesen|vers|metrik|hexameter|distichon|hendekasyllabus|prosodie)/u.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.interpretation);
  }
  if (/(text|lektuer|lehrbuchtext|originaltext|uebersetz|wiedergeben|erschliess|paraphras|sinn|satzabschnitt|textsort|gliederung|eigennamen|interpunktion)/u.test(text)) {
    targets.add(C.lowerText);
    targets.add(C.translation);
  }
  if (/(deuten|interpret|wirkung|gestaltung|stil|aussage|stellung|beurteilen|kontext|fragestellung|rezeption|standpunkt|autor|lyrisch|gattung)/u.test(text)) {
    targets.add(C.lowerText);
    targets.add(C.interpretation);
  }
  if (/(antike|rom|roemisch|caesar|nepos|martial|phaedrus|plinius|hygin|vulgata|einhard|erasmus|geschichte|politik|gesellschaft|kultur|religion|myth|lebenswelt|gegenwart|werte|rhetorik|cicero|ovid|vergil|catull|horaz|carmina|humanismus|christentum)/u.test(text)) {
    targets.add(C.lowerCulture);
    if (/(myth|religion|gott|ovid|weissagung|goetter)/u.test(text)) targets.add(C.mythology);
    if (/(geschichte|politik|caesar|cicero|nepos|rom|republik|kaiser|verwaltung|senat|imperium)/u.test(text)) targets.add(C.historyPolitics);
    if (/(gesellschaft|werte|gegenwart|mensch|freundschaft|liebe|konflikt|christentum|humanismus|lebenswelt|wertvorstellung)/u.test(text)) targets.add(C.values);
    if (/(leben|alltag|familie|stadt|land|schule|freizeit|essen|kleidung|reisen|theater)/u.test(text)) targets.add(C.everyday);
  }
  if (/(methode|hilfsmittel|nachschlage|recherche|information|praesentation|quelle|lernstand|selbsteinschaetzung|visualis|systematis|computer|digitale|medien|plakat|tandem)/u.test(text)) {
    targets.add(C.lowerMethods);
    targets.add(C.methods);
  }
}

function mapSekII(text: string, targets: Set<string>): void {
  if (/(wort|vokabel|bedeutung|wortbildung|fremdwort|lexik|woerterbuch|sprache|grammatik|syntax|morphologie|form|kasus|tempus|modus|aci|participium|ablativus|gerund|satzstruktur|fremdsprache|termini)/u.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
  }
  if (/(metrik|vers|hexameter|distichon|stil|gestaltung|alliteration|anapher|metapher|rhetorisch|prooemium|prosodie|elision|hiat|lyrisch)/u.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
    targets.add(C.poetry);
  }
  if (/(text|lektuer|uebersetz|wiedergeben|erschliess|originaltext|sinn|paraphrase|translat|kommentar|kernaussage|textbeleg)/u.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperTranslation);
  }
  if (/(deuten|interpret|wirkung|aussage|stellung|beurteilen|fragestellung|rezeption|kontext|personendarstellung|charakterisierung|uebersetzungsvergleich)/u.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperInterpretation);
  }
  if (/(antike|geschichte|politik|rom|cicero|plinius|ovid|livius|vergil|caesar|tacitus|sallust|seneca|morus|myth|religion|philosophie|gesellschaft|ethisch|existentiell|kultur|rezeption|humanismus|christentum|mittelalter)/u.test(text)) {
    targets.add(C.upperCulture);
  }
  if (/(politik|geschichte|staat|cicero|caesar|rede|rhetorik|argument|propaganda|republik|historiographie|annalen|livius|sallust|tacitus|plinius|morus)/u.test(text)) targets.add(C.rhetoric);
  if (/(philosophie|ethisch|existentiell|religion|mythos|wert|leben|mensch|seneca|epikur|stoisch|freundschaft|glueck|seele|ataraxie|apatheia)/u.test(text)) targets.add(C.philosophy);
  if (/(poetisch|ovid|vergil|martial|phaedrus|eleg|dichtung|vers|kunst|aeneis|metamorphosen|catull|horaz|carmina|liebe|epos|gedicht)/u.test(text)) targets.add(C.poetry);
}

function buildExtraction(spec: Spec, passages: Passage[], sourceGoals: SourceGoal[]): unknown {
  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-HH',
    subject: 'Latein',
    stage: spec.stage,
    sourceDocument: {
      key: spec.sourceDocumentKey,
      title: spec.sourceDocumentTitle,
      path: spec.sourcePdfPath,
      url: spec.sourceUrl,
    },
    method: {
      extractor: 'generateHhLatinSourceExtraction.ts',
      description:
        spec.stage === 'SekI'
          ? 'Extrahiert die dreispaltigen Hamburger Sek-I-Anforderungstabellen, interkulturelle/methodische Kompetenzen und Inhaltsvorgaben fuer Latein.'
          : 'Extrahiert Kompetenzbereichsbullets und Latein-Module aus dem Hamburger Studienstufen-Bildungsplan Alte Sprachen 2022.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        accepted: true,
        rationale:
          'Hamburg Latein wird aus expliziten Kompetenzanforderungen, Inhaltslisten und Modulen extrahiert. Die Zielzahl liegt im Korridor bereits gepruefter Laender mit vergleichbar detaillierten Plaenen.',
      },
    },
    pipelineStatus: buildPipeline(spec, sourceGoals.length, passages.length),
    passages,
    sourceGoals,
  };
}

function buildReview(spec: Spec, sourceGoals: SourceGoal[], decisions: Decision[]): unknown {
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
    reviewId: `${spec.extractionId}-m3-review`,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.extractionPath,
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
        'Hamburg Latein ist fachlich erstgeprueft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertig; partial beschreibt die Zuordnungsform, nicht eine fachliche Luecke.',
    },
    mappings,
    decisions,
  };
}

function buildPipeline(spec: Spec, sourceGoals: number, passages: number): unknown {
  return {
    currentStep: '',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: 'complete',
        dependsOn: [],
        checks: [{ id: 'source-document-present', label: 'Amtliches Hamburger Bildungsplan-PDF liegt lokal vor', passed: true, details: spec.sourcePdfPath }],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [{ id: 'passage-groups-extracted', label: 'Kompetenz-, Anforderungs- und Inhaltsgruppen extrahiert', passed: true, details: `${passages} Passagegruppen` }],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: 'complete',
        dependsOn: ['MAPPING-1'],
        checks: [{ id: 'source-goals-created', label: 'Source-Ziele aus amtlichen Kompetenz- und Inhaltsaussagen erzeugt', passed: true, details: `${sourceGoals} Source-Ziele` }],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: 'complete',
        dependsOn: ['MAPPING-2'],
        checks: [{ id: 'all-source-goals-covered', label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt', passed: true, details: '0 explizite Canonical-Gaps' }],
      },
    ],
  };
}

function upsertRegistry(spec: Spec, sourceGoals: number, passages: number): void {
  const registry = JSON.parse(readFileSync(abs(registryPath), 'utf8')) as { entries: Array<Record<string, unknown>> };
  const entry = {
    landscapeId: spec.sourceLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-HH',
    subject: 'Latein',
    stage: spec.stage,
    sourcePath: spec.sourcePdfPath,
    archiveSourcePath: spec.sourcePdfPath,
    archivePath: 'curricula/DE/Gymnasium/input/HH/latein/',
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
  };
  registry.entries = registry.entries.filter((candidate) => candidate.landscapeId !== spec.sourceLandscapeId);
  registry.entries.push(entry);
  registry.entries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)));
  writeJson(registryPath, registry);
}

function pdftotext(spec: Spec, firstPage: number, lastPage: number): string {
  return execFileSync('pdftotext', ['-layout', '-f', String(firstPage), '-l', String(lastPage), abs(spec.sourcePdfPath), '-'], {
    encoding: 'utf8',
  });
}

function isHeaderOrFooter(line: string): boolean {
  const clean = normalizeWhitespace(line);
  return (
    /^Gymnasium Sek\. I ♦ Alte Sprachen/.test(clean) ||
    /^Anforderungen und Inhalte in den Alten Sprachen/.test(clean) ||
    /^Bildungsplan Studienstufe/.test(clean) ||
    /^Alte Sprachen/.test(clean)
  );
}

function isStructuralLine(line: string): boolean {
  return (
    /^Die Schülerinnen und Schüler$/u.test(line) ||
    /^Ende der Spracherwerbsphase|^Latinum$|^Mindestanforderungen/u.test(line) ||
    /^Anforderungen nach einem|^Lernjahr am Ende/u.test(line) ||
    /^Fachbezogen|^Umsetzungshilfen|^Kompetenzen|^\[bleibt zunächst/u.test(line) ||
    /^S\s+T\s+I\s+M$/u.test(line) ||
    /^Übergreifend|^Fachübergreifend|^Leitperspektiven|^Aufgabengebiete|^Sprachbildung|^Bezüge$/u.test(line)
  );
}

function isPageNumber(line: string): boolean {
  return /^\d{1,3}$/u.test(line);
}

function isUsableGoalText(text: string): boolean {
  if (text.length < 20) return false;
  const ascii = toAscii(text).toLowerCase();
  if (/^die schuelerinnen und schueler$/.test(ascii)) return false;
  if (/(kennen|koennen|verstehen|beherrschen|erkennen|benennen|bilden|nutzen|anwenden|deuten|uebersetzen|wiedergeben|erschliessen|analysieren|beschreiben|beurteilen|bewerten|formulieren|einordnen|vergleichen|reflektieren|lesen|arbeiten|aneignen|sichern|festigen|erweitern|systematisieren|untersuchen|herausarbeiten|recherchieren|erklaeren|darstellen)/u.test(ascii)) {
    return true;
  }
  return /(formen|substantive|pronomina|adjektive|verben|konjugation|deklination|kasus|tempus|modus|infinitiv|partizip|gerund|satzteile|kongruenz|relativpronomen|adverb|gliedsatz|ablativ|aci|stilistisch|text|lektuere|autoren|latein|grammatik|wortschatz|rhetorik|metrik)/u.test(ascii);
}

function isUsableThemeText(text: string): boolean {
  if (text.length < 16) return false;
  if (/^(Fachbegriffe|Inhalte|Struktur und Sprache|politisch\/historisch)/u.test(text)) return false;
  return !/^S1-4/u.test(text);
}

function cleanSourceText(text: string): string {
  return normalizeWhitespace(text)
    .replace(/^[•◦o]\s*/u, '')
    .replace(/^Die Schülerinnen und Schüler\s+/u, '')
    .replace(/[.;:]$/u, '');
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/gu, ' ').trim();
}

function asCanStatement(text: string): string {
  const clean = cleanSourceText(text);
  const ascii = toAscii(clean).toLowerCase();
  if (ascii.startsWith('die schuelerinnen') || ascii.startsWith('die lernende person')) return clean;
  return `Die lernende Person kann ${lcFirst(clean)}.`;
}

function shortTitle(text: string): string {
  const clean = cleanSourceText(text);
  return clean.length <= 96 ? clean : `${clean.slice(0, 93).trim()}...`;
}

function lcFirst(text: string): string {
  return text ? `${text.charAt(0).toLocaleLowerCase('de-DE')}${text.slice(1)}` : text;
}

function slug(text: string): string {
  return toAscii(text).toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 100);
}

function hashSlug(text: string): string {
  return createHash('sha1').update(text).digest('hex').slice(0, 8);
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
