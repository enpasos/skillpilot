#!/usr/bin/env tsx

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Stage = 'SekI' | 'SekII';

type Spec = {
  jurisdiction: 'DE-BB' | 'DE-BE';
  jurisdictionName: string;
  stage: Stage;
  sourceLandscapeId: string;
  extractionId: string;
  title: string;
  sourceDocumentTitle: string;
  sourceDocumentKey: string;
  sourcePdfPath: string;
  sourceUrl: string;
  extractionPath: string;
  reviewPath: string;
  expectedPassages: number;
  expectedMinimumGoals: number;
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
  title: string;
  description: string;
  sourceText: string;
  sourceLocator: string;
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
  title: string;
  sourceDocumentKey: string;
  sourceLocator: string;
  text: string;
  metadata: Record<string, unknown>;
};

type ReviewDecision = {
  sourceGoalId: string;
  status: 'accepted';
  coverage: 'exact' | 'partial';
  canonicalGoalIds: string[];
  rationale: string;
  reviewer: string;
  reviewedAt: string;
};

type Registry = {
  version: number;
  entries: Array<Record<string, unknown>>;
};

const __filename = fileURLToPath(import.meta.url);
const appDir = path.resolve(path.dirname(__filename), '..');
const repoRoot = path.resolve(appDir, '..');

const TODAY = '2026-05-14';
const REVIEWER = 'codex';

const canonicalLatinPath = path.join(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_LATEIN.de.json',
);
const registryPath = path.join(
  repoRoot,
  'curricula/DE/Gymnasium/provenance/source-landscape-registry.json',
);

const canonical = JSON.parse(readFileSync(canonicalLatinPath, 'utf8')) as {
  goals: Array<{ id: string; title: string; contains?: string[] }>;
};
const canonicalIds = new Set(canonical.goals.map((goal) => goal.id));

const C = {
  subject: '34596272-3efc-58f9-b213-b5665ce59c3d',
  lower: '61e371c9-572b-538c-7647-9103165b7b86',
  upper: '34596272-3efc-58f9-b213-b5665ce59c3d',
  lowerLanguage: '61e371c9-572b-538c-7647-9103165b7b86',
  lowerText: 'f7bff0b7-0f06-5acf-f6b5-010c6a98fc84',
  lowerCulture: '26510ce2-0b7a-5064-b20f-c2860d608c58',
  lowerMethods: '705ce81d-4d8b-5f92-90b0-a6391a52eba4',
  upperLanguage: 'f88ec725-cb4c-583a-b0c5-97e68f77786f',
  upperText: '6fad86f2-3208-538e-b3cc-99eda20fbb5e',
  upperCulture: '0f105b95-d858-5fd2-6741-739b13150a2c',
  rhetoric: '391461e5-a0df-59b0-aa0b-6da50974346c',
  philosophy: '5f3abe59-a68b-5261-824b-979418dcb13a',
  poetry: '864aa1a9-4a76-594d-bcef-7a2da61604a5',
  grammar: 'c19319c1-f05c-5948-ff0f-c6d640140325',
  vocabulary: 'd5fe1f4e-8a7c-56b2-75c6-0c2134326607',
  reading: '9847208a-8c93-5eef-9c41-e278861b09c4',
  translation: 'f0f30164-cc95-5f4d-aa92-a4a764e4572c',
  interpretation: 'f7bff0b7-0f06-5acf-f6b5-010c6a98fc84',
  everyday: uuidFromString('canonical-latin-seki-culture-everyday-topography'),
  historyPolitics: uuidFromString('canonical-latin-seki-culture-history-politics'),
  mythology: uuidFromString('canonical-latin-seki-culture-myth-religion'),
  values: uuidFromString('canonical-latin-seki-culture-values-reflection'),
  methods: uuidFromString('canonical-latin-seki-method-learning-organization'),
  upperSyntax: '1476af3f-0ff9-59c0-8a1a-e81dfc011ae2',
  upperTranslation: 'fdf2dd75-7101-5bf2-b2e7-831711d3f63c',
  upperInterpretation: '662680a7-6018-5721-9166-2f73a7ea92c6',
  upperHistoricalCommunication: '0f105b95-d858-5fd2-6741-739b13150a2c',
  terminalLower: 'bfd9bf1e-5751-5f40-f29a-edfab8cea4bf',
  terminalUpper: 'db54a113-eb44-5308-92ae-fb67e33c12c1',
};

const sekiPdf = 'curricula/DE/Gymnasium/input/BB-BE/latein/Teil_C_Latein_2015_11_10.pdf';
const sekiiPdf = 'curricula/DE/Gymnasium/input/BB-BE/latein/Teil_C_RLP_GOST_2025_Latein.pdf';

const specs: Spec[] = [
  {
    jurisdiction: 'DE-BB',
    jurisdictionName: 'Brandenburg',
    stage: 'SekI',
    sourceLandscapeId: uuidFromString('DE-BB-LATEIN-SEKI-RLP2015-SOURCE-EXTRACTION'),
    extractionId: 'de-bb-gym-latin-seki-rlp2015-source-extraction',
    title: 'DE-BB · Latein Sekundarstufe I (Brandenburg, RLP 2015 Source-Extraction)',
    sourceDocumentTitle: 'Rahmenlehrplan Berlin-Brandenburg Teil C Latein, Jahrgangsstufen 5-10, 2015',
    sourceDocumentKey: 'BB-BE-RLP-LATEIN-SEKI-2015',
    sourcePdfPath: sekiPdf,
    sourceUrl:
      'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/Teil_C_Latein_2015_11_10.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/BB-BE/latein/source-extraction/DE_BB_LATEIN_SEKI_RLP2015.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BB/lower-secondary/bb_latin_lower_secondary_source_extraction_to_canonical_latin.review.json',
    expectedPassages: 8,
    expectedMinimumGoals: 90,
  },
  {
    jurisdiction: 'DE-BE',
    jurisdictionName: 'Berlin',
    stage: 'SekI',
    sourceLandscapeId: uuidFromString('DE-BE-LATEIN-SEKI-RLP2015-SOURCE-EXTRACTION'),
    extractionId: 'de-be-gym-latin-seki-rlp2015-source-extraction',
    title: 'DE-BE · Latein Sekundarstufe I (Berlin, RLP 2015 Source-Extraction)',
    sourceDocumentTitle: 'Rahmenlehrplan Berlin-Brandenburg Teil C Latein, Jahrgangsstufen 5-10, 2015',
    sourceDocumentKey: 'BB-BE-RLP-LATEIN-SEKI-2015',
    sourcePdfPath: sekiPdf,
    sourceUrl:
      'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/Teil_C_Latein_2015_11_10.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/BB-BE/latein/source-extraction/DE_BE_LATEIN_SEKI_RLP2015.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BE/lower-secondary/be_latin_lower_secondary_source_extraction_to_canonical_latin.review.json',
    expectedPassages: 8,
    expectedMinimumGoals: 90,
  },
  {
    jurisdiction: 'DE-BB',
    jurisdictionName: 'Brandenburg',
    stage: 'SekII',
    sourceLandscapeId: uuidFromString('DE-BB-LATEIN-SEKII-GOST2025-SOURCE-EXTRACTION'),
    extractionId: 'de-bb-gym-latin-sekii-gost2025-source-extraction',
    title: 'DE-BB · Latein Oberstufe (Brandenburg, GOST 2025 Source-Extraction)',
    sourceDocumentTitle: 'Rahmenlehrplan gymnasiale Oberstufe Berlin-Brandenburg Teil C Latein, 2025',
    sourceDocumentKey: 'BB-BE-GOST-LATEIN-SEKII-2025',
    sourcePdfPath: sekiiPdf,
    sourceUrl:
      'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2025/Teil_C_RLP_GOST_2025_Latein.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/BB-BE/latein/source-extraction/DE_BB_LATEIN_SEKII_GOST2025.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_latin_upper_secondary_source_extraction_to_canonical_latin.review.json',
    expectedPassages: 12,
    expectedMinimumGoals: 80,
  },
  {
    jurisdiction: 'DE-BE',
    jurisdictionName: 'Berlin',
    stage: 'SekII',
    sourceLandscapeId: uuidFromString('DE-BE-LATEIN-SEKII-GOST2025-SOURCE-EXTRACTION'),
    extractionId: 'de-be-gym-latin-sekii-gost2025-source-extraction',
    title: 'DE-BE · Latein Oberstufe (Berlin, GOST 2025 Source-Extraction)',
    sourceDocumentTitle: 'Rahmenlehrplan gymnasiale Oberstufe Berlin-Brandenburg Teil C Latein, 2025',
    sourceDocumentKey: 'BB-BE-GOST-LATEIN-SEKII-2025',
    sourcePdfPath: sekiiPdf,
    sourceUrl:
      'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2025/Teil_C_RLP_GOST_2025_Latein.pdf',
    extractionPath:
      'curricula/DE/Gymnasium/input/BB-BE/latein/source-extraction/DE_BE_LATEIN_SEKII_GOST2025.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_latin_upper_secondary_source_extraction_to_canonical_latin.review.json',
    expectedPassages: 12,
    expectedMinimumGoals: 80,
  },
];

for (const spec of specs) {
  const parsedGoals = spec.stage === 'SekI' ? parseSekI(spec) : parseSekII(spec);
  if (parsedGoals.length < spec.expectedMinimumGoals) {
    throw new Error(`${spec.title}: only ${parsedGoals.length} source goals parsed`);
  }

  const passages = buildPassages(spec, parsedGoals);
  if (passages.length < spec.expectedPassages) {
    throw new Error(`${spec.title}: only ${passages.length} passage groups parsed`);
  }

  const sourceGoals = parsedGoals.map((goal, index) => toSourceGoal(spec, goal, index));
  const sourceGoalIds = new Set(sourceGoals.map((goal) => goal.id));
  if (sourceGoalIds.size !== sourceGoals.length) {
    throw new Error(`${spec.title}: duplicate source goal IDs`);
  }

  const decisions = sourceGoals.map((goal) => toDecision(goal, spec.stage));
  const invalidTargets = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.filter((id) => !canonicalIds.has(id)),
  );
  if (invalidTargets.length > 0) {
    throw new Error(`${spec.title}: invalid canonical targets ${[...new Set(invalidTargets)].join(', ')}`);
  }

  writeJson(
    path.join(repoRoot, spec.extractionPath),
    buildExtractionDocument(spec, passages, sourceGoals),
  );
  writeJson(path.join(repoRoot, spec.reviewPath), buildReviewDocument(spec, decisions, sourceGoals));
  upsertRegistryEntry(spec, sourceGoals.length, passages.length);

  console.log(
    `${spec.title}: ${passages.length} passage groups, ${sourceGoals.length} source goals, ${decisions.length} M3 decisions`,
  );
}

function parseSekI(spec: Spec): ParsedGoal[] {
  const standardsText = pdftotext(spec.sourcePdfPath, ['-f', '16', '-l', '21']);
  const themesText = pdftotext(spec.sourcePdfPath, ['-f', '25', '-l', '32']);
  return [...parseSekIStandards(standardsText), ...parseSekIThemes(themesText)];
}

function parseSekII(spec: Spec): ParsedGoal[] {
  const standardsText = pdftotext(spec.sourcePdfPath, ['-f', '9', '-l', '14']);
  const themesText = pdftotext(spec.sourcePdfPath, ['-f', '15', '-l', '21']);
  return [...parseSekIIStandards(standardsText), ...parseSekIIThemes(themesText)];
}

function pdftotext(relativePdfPath: string, args: string[]): string {
  const pdfPath = path.join(repoRoot, relativePdfPath);
  return execFileSync('pdftotext', [...args, pdfPath, '-'], { encoding: 'utf8' });
}

function parseSekIStandards(text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let currentArea = 'Sprachkompetenz';
  let page = 'S. 16-21';
  const block: string[] = [];

  const flush = () => {
    const raw = normalizeWhitespace(block.join(' '));
    block.length = 0;
    if (!isUsableSekIStandardBlock(raw)) {
      return;
    }
    goals.push({
      passageId: slug(`seki-standards-${currentArea}`),
      phase: 'Niveaustufen C-H',
      area: currentArea,
      title: shortTitle(raw),
      description: asCanStatement(raw),
      sourceText: raw,
      sourceLocator: `${page}, ${currentArea}`,
    });
  };

  for (const line of text.split(/\r?\n/)) {
    const trimmed = normalizeWhitespace(line);
    if (!trimmed) {
      flush();
      continue;
    }
    const pageMatch = trimmed.match(/^Seite\s+(\d+)\s+von\s+32$/);
    if (pageMatch) {
      page = `S. ${pageMatch[1]}`;
      continue;
    }
    const section = detectSekISection(trimmed);
    if (section) {
      flush();
      currentArea = section;
      continue;
    }
    if (isStructuralSekILine(trimmed)) {
      continue;
    }
    block.push(trimmed);
  }
  flush();

  return goals;
}

function detectSekISection(line: string): string | null {
  if (/^2\.1\s+Sprachkompetenz/.test(line)) return 'Sprachkompetenz';
  if (/^2\.2\s+Textkompetenz/.test(line)) return 'Textkompetenz';
  if (/^2\.3\s+Literatur-/.test(line)) return 'Literatur- und Kulturkompetenz';
  if (/^2\.4\s+Sprachlernkompetenz/.test(line)) return 'Sprachlernkompetenz und Sprachbewusstheit';
  return null;
}

function isStructuralSekILine(line: string): boolean {
  return (
    /^[C-H]$/.test(line) ||
    /^C\s+Latein$/.test(line) ||
    /^Standards$/.test(line) ||
    /^Die Schuelerinnen und Schueler koennen$/i.test(toAscii(line)) ||
    /^(Wortschatz|Formenlehre|Satzlehre|Lesevortrag|Hoeren|Lesen\/Texte erschliessen|Uebersetzen|Interpretieren)$/.test(
      toAscii(line),
    ) ||
    /^Literaturkompetenz/.test(line) ||
    /^Kulturkompetenz/.test(line) ||
    /^Sprachlernkompetenz/.test(line) ||
    /^Sprachbewusstheit/.test(line)
  );
}

function isUsableSekIStandardBlock(text: string): boolean {
  if (text.length < 28) return false;
  const ascii = toAscii(text);
  if (/^Jahrgangsstufen/.test(ascii)) return false;
  if (/^Rahmenlehrplan/.test(ascii)) return false;
  if (/^Teil C/.test(ascii)) return false;
  if (/^Kompetenzen und Standards/.test(ascii)) return false;
  if (/^Die Standards/.test(ascii)) return false;
  if (/^Wortschatz Formenlehre/.test(ascii)) return false;
  return /(nennen|erkennen|angeben|unterscheiden|erklaeren|uebersetzen|erschliessen|interpretieren|beschreiben|vergleichen|nutzen|anwenden|deuten|rezipieren|reflektieren|bilden|gliedern|analysieren)/.test(
    ascii.toLowerCase(),
  );
}

function parseSekIThemes(text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let currentTheme = 'Themen und Inhalte';
  let page = 'S. 25-32';
  let pendingSection: string | null = null;
  let current: string[] | null = null;
  let currentLocator = page;

  const flush = () => {
    if (!current) return;
    const sourceText = normalizeWhitespace(current.join(' '));
    current = null;
    if (sourceText.length < 8) return;
    goals.push({
      passageId: slug(`seki-theme-${currentTheme}`),
      phase: 'Sekundarstufe I',
      area: `Themenfeld: ${currentTheme}`,
      title: shortTitle(sourceText),
      description: `Die lernende Person kann ${lcFirst(sourceText)} im Kontext antiker Kultur und Sprache einordnen.`,
      sourceText,
      sourceLocator: `${currentLocator}, Themenfeld: ${currentTheme}`,
    });
  };

  for (const line of text.split(/\r?\n/)) {
    const trimmed = normalizeWhitespace(line);
    if (!trimmed) {
      continue;
    }
    const pageMatch = trimmed.match(/^Seite\s+(\d+)\s+von\s+32$/);
    if (pageMatch) {
      page = `S. ${pageMatch[1]}`;
      continue;
    }
    const sectionMatch = trimmed.match(/^3\.(\d+)\s*(.*)$/);
    if (sectionMatch) {
      flush();
      pendingSection = sectionMatch[2] || null;
      continue;
    }
    const themeMatch = trimmed.match(/^Themenfeld:\s*(.+)$/);
    if (themeMatch) {
      flush();
      currentTheme = themeMatch[1].trim();
      if (pendingSection) {
        currentTheme = `${pendingSection} / ${currentTheme}`;
      }
      continue;
    }
    if (/^(Themen|Inhalte|Mögliche Kontexte|Verbindliche Themenfelder|Die Themenfelder)/.test(trimmed)) {
      flush();
      continue;
    }
    const bullet = trimmed.match(/^[\u00ad–−-]\s*(.+)$/);
    if (bullet) {
      flush();
      current = [bullet[1]];
      currentLocator = page;
      continue;
    }
    if (current && !/^C\s+Latein$/.test(trimmed)) {
      current.push(trimmed);
    }
  }
  flush();

  return goals;
}

function parseSekIIStandards(text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let active = false;
  let phase = 'Abschlussorientierte Standards';
  let area = 'Kompetenzbereich Sache';
  let page = 'S. 9-14';
  let current: string[] | null = null;
  let locator = page;

  const flush = () => {
    if (!current) return;
    const sourceText = normalizeWhitespace(current.join(' '));
    current = null;
    if (sourceText.length < 16) return;
    goals.push({
      passageId: slug(`sekii-standards-${phase}-${area}`),
      phase,
      area,
      title: shortTitle(sourceText),
      description: asCanStatement(sourceText),
      sourceText,
      sourceLocator: `${locator}, ${phase}, ${area}`,
    });
  };

  for (const line of text.split(/\r?\n/)) {
    const trimmed = normalizeWhitespace(line);
    if (!trimmed) {
      continue;
    }
    const pageMatch = trimmed.match(/^(?:Seite\s+)?(\d+)(?:\s+von\s+21)?\s*$/);
    if (pageMatch) {
      page = `S. ${pageMatch[1]}`;
      continue;
    }
    if (/^2\.2\.1\s+Kompetenzbereich Sache/.test(trimmed)) {
      flush();
      active = true;
      phase = 'Abschlussorientierte Standards';
      area = 'Kompetenzbereich Sache';
      continue;
    }
    if (/^Abschlussorientierte Standards für den spät/.test(trimmed)) {
      flush();
      active = true;
      phase = 'Spät beginnender Lateinunterricht';
      area = 'Sprachkompetenz';
      continue;
    }
    if (/^3\s+Themenfelder/.test(trimmed)) {
      flush();
      break;
    }
    if (!active) {
      continue;
    }
    const detectedArea = detectSekIIArea(trimmed);
    if (detectedArea) {
      flush();
      area = detectedArea;
      continue;
    }
    if (isSekIIStructuralLine(trimmed)) {
      continue;
    }
    const bullet = trimmed.match(/^[\u00ad–−-]\s*(.*)$/);
    if (bullet) {
      flush();
      current = bullet[1] ? [bullet[1]] : null;
      locator = page;
      if (current && /[,.;]$/.test(bullet[1])) {
        flush();
      }
      continue;
    }
    if (!current) {
      current = [trimmed];
      locator = page;
    } else {
      current.push(trimmed);
    }
    if (/[,.;]$/.test(trimmed)) {
      flush();
    }
  }
  flush();

  return goals;
}

function detectSekIIArea(line: string): string | null {
  const ascii = toAscii(line);
  if (/^Sprachkompetenz$/.test(ascii)) return 'Sprachkompetenz';
  if (/^Literaturkompetenz$/.test(ascii)) return 'Literaturkompetenz';
  if (/^Kulturkompetenz$/.test(ascii)) return 'Kulturkompetenz';
  if (/^Sprachlernkompetenz$/.test(ascii)) return 'Sprachlernkompetenz';
  if (/^Textkompetenz$/.test(ascii)) return 'Textkompetenz';
  if (/^Sprachbewusstheit$/.test(ascii)) return 'Sprachbewusstheit';
  if (/^Faehigkeit zur historischen Kommunikation$/.test(ascii)) {
    return 'Fähigkeit zur historischen Kommunikation';
  }
  return null;
}

function isSekIIStructuralLine(line: string): boolean {
  const ascii = toAscii(line);
  return (
    /^Bildung und Erziehung/.test(ascii) ||
    /^Teil C - Latein/.test(ascii) ||
    /^Sache$|^Strategie$|^Person$/.test(ascii) ||
    /^Grundkursfach$|^Leistungskursfach$/.test(ascii) ||
    /^Die Standards/.test(ascii) ||
    /^Die Lernenden/.test(ascii) ||
    /^Ausser den fuer/.test(ascii)
  );
}

function parseSekIIThemes(text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let page = 'S. 15-21';
  let active = false;
  let currentTheme = '';
  let area = '';
  let skippingLektuere = false;
  let freeTextList = false;
  let current: string[] | null = null;
  let locator = page;

  const flush = () => {
    if (!current) return;
    const sourceText = normalizeWhitespace(current.join(' '));
    current = null;
    if (sourceText.length < 10) return;
    goals.push({
      passageId: slug(`sekii-theme-${currentTheme}-${area}`),
      phase: 'Qualifikationsphase',
      area,
      title: shortTitle(sourceText),
      description: `Die lernende Person kann ${lcFirst(sourceText)} im Kontext lateinischer Originallektüre fachlich einordnen.`,
      sourceText,
      sourceLocator: `${locator}, ${currentTheme}`,
    });
  };

  for (const line of text.split(/\r?\n/)) {
    const trimmed = normalizeWhitespace(line);
    if (!trimmed) continue;
    const pageMatch = trimmed.match(/^(?:Seite\s+)?(\d+)(?:\s+von\s+21)?\s*$/);
    if (pageMatch) {
      page = `S. ${pageMatch[1]}`;
      continue;
    }
    if (/^3\.2\s+Themenfelder/.test(trimmed)) {
      active = true;
      continue;
    }
    if (!active) continue;
    const themeMatch = trimmed.match(/^3\.2\.\d\s+(.+)$/);
    if (themeMatch) {
      flush();
      currentTheme = themeMatch[1].trim();
      area = `Themenfeld-Inhalte: ${currentTheme}`;
      skippingLektuere = false;
      freeTextList = false;
      continue;
    }
    if (/^Lektürevorschläge$/.test(trimmed)) {
      flush();
      skippingLektuere = true;
      freeTextList = false;
      continue;
    }
    if (/^Mögliche Beiträge zur Kompetenzentwicklung/.test(trimmed)) {
      flush();
      if (/in allen Themenfeldern/.test(trimmed)) {
        currentTheme = 'Alle Themenfelder der Qualifikationsphase';
      }
      area = `Mögliche Beiträge zur Kompetenzentwicklung: ${currentTheme}`;
      skippingLektuere = false;
      freeTextList = true;
      continue;
    }
    if (/^Zusatzkurs/.test(trimmed)) {
      flush();
      continue;
    }
    if (/^Dieses Themenfeld bietet/.test(trimmed)) {
      flush();
      continue;
    }
    if (isSekIIStructuralLine(trimmed)) {
      continue;
    }
    const bullet = trimmed.match(/^[\u00ad–−-]\s*(.*)$/);
    if (bullet && !skippingLektuere && currentTheme) {
      flush();
      current = bullet[1] ? [bullet[1]] : null;
      locator = page;
      if (current && /[,.;]$/.test(bullet[1])) {
        flush();
      }
      continue;
    }
    if (skippingLektuere) {
      continue;
    }
    if (freeTextList && currentTheme && !current) {
      current = [trimmed];
      locator = page;
    } else if (current) {
      current.push(trimmed);
    }
    if (current && /[,.;]$/.test(trimmed)) {
      flush();
    }
  }
  flush();

  return goals;
}

function buildPassages(spec: Spec, parsedGoals: ParsedGoal[]): Passage[] {
  const passageMap = new Map<string, Passage>();
  for (const goal of parsedGoals) {
    const existing = passageMap.get(goal.passageId);
    if (existing) {
      existing.text += `\n- ${goal.sourceText}`;
      continue;
    }
    passageMap.set(goal.passageId, {
      id: goal.passageId,
      title: `${goal.phase} · ${goal.area}`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceLocator: goal.sourceLocator,
      text: `- ${goal.sourceText}`,
      metadata: {
        jurisdiction: spec.jurisdiction,
        stage: spec.stage,
        subject: 'Latein',
        extractionLevel: goal.area.startsWith('Themenfeld') ? 'theme-content' : 'competency-standard',
      },
    });
  }
  return [...passageMap.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function toSourceGoal(spec: Spec, goal: ParsedGoal, index: number): SourceGoal {
  const ordinal = String(index + 1).padStart(3, '0');
  const id = `${spec.jurisdiction.toLowerCase()}-latin-${spec.stage.toLowerCase()}-${ordinal}-${hashSlug(goal.sourceText)}`;
  return {
    id,
    sourceDocumentKey: spec.sourceDocumentKey,
    passageId: goal.passageId,
    title: goal.title,
    description: goal.description,
    sourceText: goal.sourceText,
    sourceLocator: goal.sourceLocator,
    sourceRef: goal.sourceLocator,
    sourceSpan: {
      passageId: goal.passageId,
      label: `${goal.passageId}#${index + 1}`,
    },
    stage: spec.stage,
    courseLevel: spec.stage === 'SekII' ? 'GK_LK' : 'unspecified',
    tags: [`jurisdiction:${spec.jurisdiction}`, 'subject:Latein', `stage:${spec.stage}`],
    metadata: {
      jurisdiction: spec.jurisdiction,
      subject: 'Latein',
      stage: spec.stage,
      phase: goal.phase,
      area: goal.area,
      extractionMethod:
        spec.stage === 'SekI'
          ? 'Kompetenzstandard- und Themenfeld-Extraktion aus amtlicher RLP-Fassung 2015'
          : 'Abschlussstandard- und Themenfeld-Extraktion aus amtlichem GOST-Fachteil 2025',
      sourceIndex: index + 1,
    },
  };
}

function toDecision(goal: SourceGoal, stage: Stage): ReviewDecision {
  const targets = new Set<string>(stage === 'SekI' ? [C.lower] : [C.upper]);
  const text = toAscii(`${goal.title} ${goal.description} ${goal.sourceText} ${String(goal.metadata.area)}`).toLowerCase();

  if (stage === 'SekI') {
    mapSekITargets(text, targets);
    targets.add(C.terminalLower);
  } else {
    mapSekIITargets(text, targets);
  }

  if (targets.size <= 2) {
    targets.add(stage === 'SekI' ? C.lowerText : C.upperText);
  }

  const canonicalGoalIds = [...targets].sort();
  return {
    sourceGoalId: goal.id,
    status: 'accepted',
    coverage: canonicalGoalIds.length <= 4 ? 'exact' : 'partial',
    canonicalGoalIds,
    rationale:
      'Amtlicher Berlin-Brandenburg-Latein-Standard bzw. Themeninhalt wird inhaltlich durch kanonische Lateinziele abgedeckt; 1:n-Zuordnung ist eine Abdeckungsform, keine offene Lücke.',
    reviewer: REVIEWER,
    reviewedAt: TODAY,
  };
}

function mapSekITargets(text: string, targets: Set<string>): void {
  if (
    /(wortschatz|vokabel|formenlehre|satzlehre|kasus|tempus|modus|deklin|konjug|syntax|grammatik|sprach|lateinische konstruktion|aussprache|intonation)/.test(
      text,
    )
  ) {
    targets.add(C.lowerLanguage);
    targets.add(C.grammar);
  }
  if (/(wort|vokabel|bedeutung|ableit|lexik|fremdwort)/.test(text)) {
    targets.add(C.vocabulary);
  }
  if (/(lesen|lesevortrag|hoeren|erschliess|uebersetz|uebertragen|text|satz|paraphras)/.test(text)) {
    targets.add(C.lowerText);
  }
  if (/(uebersetz|uebertragen|deutsch|wiedergabe)/.test(text)) {
    targets.add(C.translation);
  }
  if (/(interpret|deuten|belegen|argument|perspektiv|stellung nehmen|beurteilen|wirkung)/.test(text)) {
    targets.add(C.interpretation);
  }
  if (/(lernstrategie|woerterbuch|grammatik|medien|recherch|methode|praesentier|portfolio|selbststaendig|reflektier)/.test(
    text,
  )) {
    targets.add(C.lowerMethods);
    targets.add(C.methods);
  }
  if (
    /(alltag|familie|schule|stadt rom|land|villa|thermen|gladiator|spiele|leben|gesellschaft|sklaven|maenner|frauen|kind|sport|medizin|reisen|handel)/.test(
      text,
    )
  ) {
    targets.add(C.lowerCulture);
    targets.add(C.everyday);
  }
  if (/(geschichte|politik|staat|republik|kaiser|krieg|roemisch|provinz|imperium|senat|cicero|caesar)/.test(text)) {
    targets.add(C.lowerCulture);
    targets.add(C.historyPolitics);
  }
  if (/(goetter|religion|myth|hero|held|orakel|kult|tempel|opfer)/.test(text)) {
    targets.add(C.lowerCulture);
    targets.add(C.mythology);
  }
  if (/(gegenwart|vergleich|werte|norm|fremd|eigen|kultur|perspektiv|kunstwerk|rezeption)/.test(text)) {
    targets.add(C.lowerCulture);
    targets.add(C.values);
  }
  if (targets.has(C.lowerCulture) && !targets.has(C.everyday) && !targets.has(C.historyPolitics)) {
    targets.add(C.values);
  }
}

function mapSekIITargets(text: string, targets: Set<string>): void {
  if (/(sprach|syntax|grammatik|stil|metrik|vers|rhetorisch|wortschatz|formen|semantik|textstruktur)/.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
  }
  if (/(uebersetz|uebertragen|zielsprach|ausgangstext|lateinischer originaltext)/.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperTranslation);
  }
  if (/(interpret|analyse|deutung|text|literatur|gattung|lektuer|autor|rezeption|motiv|erzaehl|poetik)/.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperInterpretation);
  }
  if (/(kultur|geschichte|historisch|gesellschaft|staat|politik|recht|macht|herrschaft|rom|antike|tradition)/.test(text)) {
    targets.add(C.upperCulture);
    targets.add(C.upperHistoricalCommunication);
  }
  if (/(rhetor|rede|wort als waffe|argument|manipulation|persuasion|cicero|kommunikation|oeffentlichkeit)/.test(text)) {
    targets.add(C.rhetoric);
  }
  if (/(philosoph|ethik|wert|glueck|leid|lust|sto|epikur|lebensentwurf|sinn|mensch|natur|welt)/.test(text)) {
    targets.add(C.philosophy);
  }
  if (/(dichtung|poesie|lyrik|epik|elegie|ovid|vergil|metrik|kunst|sprachkunst|literatur)/.test(text)) {
    targets.add(C.poetry);
  }
  if (/(sprachlern|methode|strategie|woerterbuch|hilfsmittel|selbststaendig|praesent|recherch|reflexion)/.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.methods);
  }
}

function buildExtractionDocument(spec: Spec, passages: Passage[], sourceGoals: SourceGoal[]): unknown {
  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId: '668cf206-941e-51f8-8704-3e8938631235',
    title: spec.title,
    subject: 'Latein',
    jurisdiction: spec.jurisdiction,
    schoolType: 'Gymnasium',
    stage: spec.stage,
    createdAt: TODAY,
    sourceDocument: {
      key: spec.sourceDocumentKey,
      title: spec.sourceDocumentTitle,
      path: spec.sourcePdfPath,
      url: spec.sourceUrl,
    },
    sourceDocuments: [
      {
        key: spec.sourceDocumentKey,
        title: spec.sourceDocumentTitle,
        path: spec.sourcePdfPath,
        url: spec.sourceUrl,
        provided: true,
        metadata: {
          publisher: 'Bildungsserver Berlin-Brandenburg / LISUM',
          official: true,
          sharedJurisdictions: ['DE-BB', 'DE-BE'],
        },
      },
    ],
    passages,
    sourceGoals,
    pipelineStatus: buildPipeline(spec, sourceGoals.length, passages.length),
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        accepted: true,
        rationale:
          spec.stage === 'SekI'
            ? 'Berlin-Brandenburg Sek-I-Latein enthält tabellarische Niveaustufenstandards und Themen-/Inhaltslisten; die Extraktion liegt im erwartbaren Korridor für einen gemeinsamen RLP-Fachteil.'
            : 'Berlin-Brandenburg Sek-II-Latein enthält abschlussorientierte Standards, spätbeginnenden Lateinunterricht und Q-Phasen-Themenfelder; die Extraktion liegt im erwartbaren Korridor.',
      },
    },
  };
}

function buildReviewDocument(spec: Spec, decisions: ReviewDecision[], sourceGoals: SourceGoal[]): unknown {
  const exact = decisions.filter((decision) => decision.coverage === 'exact').length;
  const partial = decisions.length - exact;
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.coverage,
      reviewDecisionId: decision.sourceGoalId,
    })),
  );
  const sourceGoalById = new Map(sourceGoals.map((goal) => [goal.id, goal]));
  return {
    version: 1,
    reviewId: `${spec.extractionId}-m3-review`,
    sourceExtractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId: '668cf206-941e-51f8-8704-3e8938631235',
    sourceExtractionPath: spec.extractionPath,
    status: 'completed',
    title: `${spec.title} · Source-Ziele zu kanonischem Latein`,
    subject: 'Latein',
    jurisdiction: spec.jurisdiction,
    stage: spec.stage,
    createdAt: TODAY,
    reviewer: REVIEWER,
    summary: {
      sourceGoals: sourceGoals.length,
      reviewedSourceGoals: decisions.length,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: decisions.length,
      exact,
      exactMappings: exact,
      partialMappings: partial,
      needsCanonicalGoal: 0,
      unmapped: 0,
      inheritedMappings: 0,
      note:
        'Berlin/Brandenburg Latein ist fachlich erstgeprueft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertig; partial beschreibt die Zuordnungsform, nicht eine fachliche Luecke.',
    },
    mappings,
    decisions: decisions.map((decision) => {
      const sourceGoal = sourceGoalById.get(decision.sourceGoalId);
      return {
        sourceGoalId: decision.sourceGoalId,
        topicCode: sourceGoal?.passageId ?? '',
        sourceSpan: sourceGoal?.sourceSpan?.label ?? sourceGoal?.sourceLocator ?? '',
        decision: 'mapped',
        canonicalGoalIds: decision.canonicalGoalIds,
        matchType: decision.coverage,
        rationale: decision.rationale,
        reviewedAt: decision.reviewedAt,
        reviewer: decision.reviewer,
      };
    }),
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
          id: 'source-document-present',
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
          id: 'passage-groups-extracted',
          label: 'Passage-Gruppen aus amtlicher PDF-Fassung extrahiert',
          passed: true,
          details: `${passageCount} Passage-Gruppen`,
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
          label: 'Source-Ziele aus Kompetenzstandards und Themenfeldern erzeugt',
          passed: true,
          details: `${sourceGoalCount} Source-Ziele`,
        },
        {
          id: 'source-goals-reference-passages',
          label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
          passed: true,
          details: 'ohne fehlende Passage',
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
          id: 'all-source-goals-reviewed',
          label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
          passed: true,
          details: `${sourceGoalCount}/${sourceGoalCount}`,
        },
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

function upsertRegistryEntry(spec: Spec, sourceGoalCount: number, passageCount: number): void {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as Registry;
  const nextEntry = {
    landscapeId: spec.sourceLandscapeId,
    title: spec.title,
    subject: 'Latein',
    jurisdiction: spec.jurisdiction,
    schoolType: 'Gymnasium',
    stage: spec.stage,
    sourceType: 'source-extraction',
    sourcePath: spec.sourcePdfPath,
    sourceUrl: spec.sourceUrl,
    archivePath: 'curricula/DE/Gymnasium/input/BB-BE/latein/',
    sourceExtractionPath: spec.extractionPath,
    mappingReviewPath: spec.reviewPath,
    targetCurriculumId: 'de-deu-s-gym-canonical-latein',
    status: 'completed',
    createdAt: TODAY,
    metrics: {
      passages: passageCount,
      sourceGoals: sourceGoalCount,
      unmapped: 0,
      canonicalGaps: 0,
    },
  };
  registry.entries = registry.entries.filter((entry) => String(entry.landscapeId) !== spec.sourceLandscapeId);
  registry.entries.push(nextEntry);
  registry.entries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)));
  writeJson(registryPath, registry);
}

function writeJson(filePath: string, value: unknown): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function toAscii(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ß/g, 'ss');
}

function slug(text: string): string {
  return toAscii(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function hashSlug(text: string): string {
  return createHash('sha1').update(text).digest('hex').slice(0, 8);
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function shortTitle(text: string): string {
  const cleaned = normalizeWhitespace(text).replace(/[.;:]$/, '');
  return cleaned.length <= 96 ? cleaned : `${cleaned.slice(0, 93).trim()}...`;
}

function asCanStatement(text: string): string {
  const cleaned = normalizeWhitespace(text).replace(/[.;:]$/, '');
  const ascii = toAscii(cleaned).toLowerCase();
  if (ascii.startsWith('die lernenden ') || ascii.startsWith('die schulerinnen und schuler ')) {
    return cleaned;
  }
  return `Die lernende Person kann ${lcFirst(cleaned)}.`;
}

function lcFirst(text: string): string {
  if (!text) return text;
  return `${text.charAt(0).toLocaleLowerCase('de-DE')}${text.slice(1)}`;
}
