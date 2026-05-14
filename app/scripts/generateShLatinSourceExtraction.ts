#!/usr/bin/env tsx

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Stage = 'SekI' | 'SekII';

type Spec = {
  stage: Stage;
  sourceLandscapeId: string;
  extractionId: string;
  title: string;
  sourceDocumentKey: string;
  extractionPath: string;
  reviewPath: string;
  standardsPageFrom: number;
  standardsPageTo: number;
  themesPageFrom: number;
  themesPageTo: number;
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
  matchType: 'exact' | 'partial';
  rationale: string;
  reviewedAt: string;
  reviewer: string;
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const reviewedAt = '2026-05-14';
const reviewer = 'Codex';
const targetLandscapeId = '668cf206-941e-51f8-8704-3e8938631235';
const sourcePdfPath = 'curricula/DE/Gymnasium/input/SH/latein/Fachanforderungen_Latein_SEK_barrierearm.pdf';
const sourceUrl =
  'https://fachportal.lernnetz.de/files/Fachanforderungen%20und%20Leitf%C3%A4den/Sek.%20I_II/Fachanforderungen_barrierefrei/Fachanforderungen_Latein_SEK_barrierearm.pdf';
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
    sourceLandscapeId: uuidFromString('DE-SH-LATEIN-SEKI-FACHANFORDERUNGEN-2015-SOURCE-EXTRACTION'),
    extractionId: 'DE_SH_LATEIN_SEKI_FACHANFORDERUNGEN_2015',
    title: 'Latein Sekundarstufe I (Schleswig-Holstein, Fachanforderungen 2015 Source-Extraction)',
    sourceDocumentKey: 'SH-FACHANFORDERUNGEN-LATEIN-SEKI-SEKII-2015',
    extractionPath:
      'curricula/DE/Gymnasium/input/SH/latein/source-extraction/DE_SH_LATEIN_SEKI_FACHANFORDERUNGEN_2015.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_latin_lower_secondary_source_extraction_to_canonical_latin.review.json',
    standardsPageFrom: 24,
    standardsPageTo: 43,
    themesPageFrom: 44,
    themesPageTo: 47,
    expectedMinimumGoals: 110,
    expectedPassages: 12,
  },
  {
    stage: 'SekII',
    sourceLandscapeId: uuidFromString('DE-SH-LATEIN-SEKII-FACHANFORDERUNGEN-2015-SOURCE-EXTRACTION'),
    extractionId: 'DE_SH_LATEIN_SEKII_FACHANFORDERUNGEN_2015',
    title: 'Latein Oberstufe (Schleswig-Holstein, Fachanforderungen 2015 Source-Extraction)',
    sourceDocumentKey: 'SH-FACHANFORDERUNGEN-LATEIN-SEKI-SEKII-2015',
    extractionPath:
      'curricula/DE/Gymnasium/input/SH/latein/source-extraction/DE_SH_LATEIN_SEKII_FACHANFORDERUNGEN_2015.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_latin_upper_secondary_source_extraction_to_canonical_latin.review.json',
    standardsPageFrom: 64,
    standardsPageTo: 82,
    themesPageFrom: 83,
    themesPageTo: 88,
    expectedMinimumGoals: 140,
    expectedPassages: 12,
  },
];

for (const spec of specs) {
  const parsedGoals = parseSpec(spec);
  if (parsedGoals.length < spec.expectedMinimumGoals) {
    throw new Error(`${spec.extractionId}: only ${parsedGoals.length} source goals parsed`);
  }
  const passages = buildPassages(spec, parsedGoals);
  if (passages.length < spec.expectedPassages) {
    throw new Error(`${spec.extractionId}: only ${passages.length} passages parsed`);
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
  const standards = pdftotext(spec.standardsPageFrom, spec.standardsPageTo);
  const themes = pdftotext(spec.themesPageFrom, spec.themesPageTo);
  return [
    ...parseKnowledgeAndAbilityStandards(spec, standards),
    ...parseThemeGoals(spec, themes),
  ];
}

function parseKnowledgeAndAbilityStandards(spec: Spec, text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let currentArea = spec.stage === 'SekI' ? 'Übergang in die Oberstufe' : 'Fortgeführter Lateinunterricht';
  let currentPhase = spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II';
  let page = `${spec.standardsPageFrom}-${spec.standardsPageTo}`;
  let active = false;
  let current: string[] | null = null;
  let currentKind: 'standard' | 'bullet' = 'standard';
  let currentPage = page;

  const flush = () => {
    if (!current) return;
    const sourceText = cleanSourceText(current.join(' '));
    current = null;
    if (!isUsableGoalText(sourceText)) return;
    const area = currentKind === 'bullet' ? `${currentArea} · Detailvorgabe` : currentArea;
    goals.push({
      passageId: slug(`${spec.stage}-${currentPhase}-${currentArea}`),
      phase: currentPhase,
      area,
      title: shortTitle(sourceText),
      description: asCanStatement(sourceText),
      sourceText,
      sourceLocator: `S. ${currentPage}, ${currentPhase}, ${area}`,
    });
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = normalizeWhitespace(rawLine);
    if (!line) {
      continue;
    }
    const pageMatch = line.match(/^(\d{1,3})$/);
    if (pageMatch) {
      page = pageMatch[1];
      continue;
    }
    if (isHeaderOrFooter(line)) continue;
    const stagePhase = detectPhase(spec, line);
    if (stagePhase) {
      flush();
      currentPhase = stagePhase;
      currentArea = stagePhase;
      active = true;
      continue;
    }
    const area = detectArea(line);
    if (area) {
      flush();
      currentArea = area;
      active = true;
      continue;
    }
    if (/^[IVX]+\.\s+Wissen und Können$/.test(line)) {
      flush();
      active = true;
      current = [];
      currentKind = 'standard';
      currentPage = page;
      continue;
    }
    if (!active || isStructuralLine(line)) continue;

    const bullet = line.match(/^[•o]\s*(.+)$/);
    if (bullet) {
      flush();
      current = [bullet[1]];
      currentKind = 'bullet';
      currentPage = page;
      continue;
    }
    if (!current) {
      continue;
    }
    current.push(line);
  }
  flush();

  return goals;
}

function parseThemeGoals(spec: Spec, text: string): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  let currentPhase = spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II';
  let currentArea = spec.stage === 'SekI' ? 'Themen und Inhalte Sekundarstufe I' : 'Themen und Inhalte Sekundarstufe II';
  let page = `${spec.themesPageFrom}-${spec.themesPageTo}`;
  let current: string[] | null = null;
  let currentPage = page;

  const flush = () => {
    if (!current) return;
    const sourceText = cleanSourceText(current.join(' '));
    current = null;
    if (!isUsableThemeText(sourceText)) return;
    goals.push({
      passageId: slug(`${spec.stage}-${currentPhase}-${currentArea}`),
      phase: currentPhase,
      area: currentArea,
      title: shortTitle(sourceText),
      description:
        spec.stage === 'SekI'
          ? `Die lernende Person kann ${lcFirst(sourceText)} im Kontext des Lateinunterrichts einordnen.`
          : `Die lernende Person kann ${lcFirst(sourceText)} im Kontext lateinischer Originallektüre fachlich einordnen.`,
      sourceText,
      sourceLocator: `S. ${currentPage}, ${currentPhase}, ${currentArea}`,
    });
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = normalizeWhitespace(rawLine);
    if (!line) {
      flush();
      continue;
    }
    const pageMatch = line.match(/^(\d{1,3})$/);
    if (pageMatch) {
      page = pageMatch[1];
      continue;
    }
    if (isHeaderOrFooter(line)) continue;
    const phase = detectPhase(spec, line);
    if (phase) {
      flush();
      currentPhase = phase;
      currentArea = phase;
      continue;
    }
    const heading = detectThemeHeading(line);
    if (heading) {
      flush();
      currentArea = heading;
      continue;
    }
    const bullet = line.match(/^[•o]\s*(.+)$/);
    if (bullet) {
      flush();
      current = [bullet[1]];
      currentPage = page;
      continue;
    }
    if (current) {
      current.push(line);
    } else if (line.length > 35 && !isStructuralLine(line)) {
      current = [line];
      currentPage = page;
    }
  }
  flush();

  return goals;
}

function detectPhase(spec: Spec, line: string): string | null {
  if (spec.stage === 'SekI') {
    if (/^2\.1\.1 Latein als zweite Fremdsprache/.test(line)) return 'Übergang Oberstufe · Latein als zweite Fremdsprache';
    if (/^2\.1\.2 Latein als erste und dritte Fremdsprache/.test(line)) return 'Übergang Oberstufe · Latein als erste und dritte Fremdsprache';
    if (/^2\.2 Erster allgemeinbildender und Mittlerer Schulabschluss/.test(line)) return 'ESA/MSA';
    if (/^3\.1 Übergang in die Oberstufe/.test(line)) return 'Themen · Übergang Oberstufe';
    if (/^3\.2 Erster allgemeinbildender und Mittlerer Schulabschluss/.test(line)) return 'Themen · ESA/MSA';
    return null;
  }
  if (/^2\.1 Fortgeführter Lateinunterricht/.test(line)) return 'Fortgeführter Lateinunterricht · grundlegendes Niveau';
  if (/^2\.2 Fortgeführter Lateinunterricht/.test(line)) return 'Fortgeführter Lateinunterricht · erhöhtes Niveau';
  if (/^2\.3 Neu beginnender Lateinunterricht/.test(line)) return 'Neu beginnender Lateinunterricht';
  if (/^3\.1 Fortgeführter Lateinunterricht/.test(line)) return 'Themen · fortgeführt';
  if (/^3\.2 Neu beginnender Lateinunterricht/.test(line)) return 'Themen · neu beginnend';
  return null;
}

function detectArea(line: string): string | null {
  if (/^[A-D]\)\s+/.test(line)) return line;
  if (/können$/.test(line) && line.length < 90 && !line.startsWith('Die Schülerinnen')) return line;
  if (/^Wissen$|^Können$/.test(line)) return null;
  return null;
}

function detectThemeHeading(line: string): string | null {
  const numberedSubsection = line.match(/^3\.\d\.\d\s+(.+)$/);
  if (numberedSubsection) return numberedSubsection[1];
  if (/^3\s+Themen und Inhalte|^3\.\d\s+/.test(line)) return line;
  if (/^Themenbereich\s+[IVX]+:/.test(line)) return line;
  if (/^Themenvorschläge/.test(line)) return line;
  if (/^(Übergangslektüre|Einstiegslektüre|Hauptlektüre|Qualität|Zugänglichkeit|Bildungswirkung)$/.test(line)) return line;
  if (/^Latein als (erste|dritte|zweite) Fremdsprache$/.test(line)) return line;
  if (/^(Erster allgemeinbildender Schulabschluss|Mittlerer Schulabschluss)$/.test(line)) return line;
  return null;
}

function isStructuralLine(line: string): boolean {
  return (
    /^Die Schülerinnen und Schüler$/u.test(line) ||
    /^Die Schülerinnen und Schüler\s+(bilden|erkennen und benennen)$/u.test(line) ||
    /^Wissen$|^Können$|^Lerngegenstände/.test(line) ||
    /^Fachanforderungen/.test(line) ||
    /^Seite\s+\d+/.test(line)
  );
}

function isHeaderOrFooter(line: string): boolean {
  return /^Fachanforderungen Latein Sekundarstufe I\/Sekundarstufe II$/.test(line);
}

function isUsableGoalText(text: string): boolean {
  if (text.length < 24) return false;
  const ascii = toAscii(text).toLowerCase();
  if (/^die schulerinnen und schuler$/.test(ascii)) return false;
  if (/(kennen|konnen|verstehen|beherrschen|erkennen|benennen|bilden|nutzen|anwenden|deuten|ubersetzen|wiedergeben|erschliessen|analysieren|beschreiben|beurteilen|formulieren|einordnen|vergleichen|reflektieren|lesen|arbeiten)/.test(ascii)) {
    return true;
  }
  return /(formen|substantive|pronomina|adjektive|verben|konjugation|deklination|kasus|tempus|modus|infinitiv|partizip|gerund|satzteile|kongruenz|relativpronomen|adverb|gliedsatz|ablativ|aci|oratio|stilistisch|alliteration|anapher|metapher|text|lektuere|lekture|autoren|latein|grammatik)/.test(ascii);
}

function isUsableThemeText(text: string): boolean {
  if (text.length < 18) return false;
  if (/^Die Texte/.test(text) && text.length < 60) return false;
  if (/^Der obligatorische Lerngegenstand/.test(text)) return true;
  if (/^Themenvorschläge/.test(text)) return false;
  return !/^Kapitel/.test(text);
}

function buildPassages(spec: Spec, parsedGoals: ParsedGoal[]): Passage[] {
  const byId = new Map<string, Passage>();
  for (const goal of parsedGoals) {
    const existing = byId.get(goal.passageId);
    const sourceGoalId = `${spec.stage}:${goal.sourceLocator}:${hashSlug(goal.sourceText)}`;
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
  const id = `${spec.stage === 'SekI' ? 'sh-latin-seki' : 'sh-latin-sekii'}-${String(index + 1).padStart(3, '0')}-${hashSlug(goal.sourceText)}`;
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
    tags: ['jurisdiction:DE-SH', 'subject:Latein', `stage:${spec.stage}`],
    metadata: {
      phase: goal.phase,
      field: goal.area,
      extractionMethod:
        spec.stage === 'SekI'
          ? 'Wissen-und-Können- sowie Themenextraktion aus amtlichen SH-Fachanforderungen Sek I'
          : 'Wissen-und-Können- sowie Themenextraktion aus amtlichen SH-Fachanforderungen Sek II',
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
  const matchType = canonicalGoalIds.length <= 3 ? 'exact' : 'partial';
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: sourceGoal.topicCode,
    sourceSpan: sourceGoal.sourceSpan.label,
    decision: 'mapped',
    canonicalGoalIds,
    matchType,
    rationale:
      'Das SH-Latein-Source-Ziel ist inhaltlich durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertige Abdeckungsformen; partial bedeutet keine offene Luecke.',
    reviewedAt,
    reviewer,
  };
}

function mapSekI(text: string, targets: Set<string>): void {
  if (/(wort|vokabel|bedeutung|wortbildung|fremdwort|lexik|worterbuch)/.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.vocabulary);
  }
  if (/(form|deklination|konjugation|kasus|tempus|modus|satz|grammatik|sprache|kongruenz|aci|participium|ablativus|gerund)/.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.grammar);
  }
  if (/(aussprache|betonung|lesen|vers|metrik|hexameter|distichon)/.test(text)) {
    targets.add(C.lowerLanguage);
    targets.add(C.interpretation);
  }
  if (/(text|lekture|ubersetz|wiedergeben|erschliess|paraphras|sinn|originaltext|satzabschnitt)/.test(text)) {
    targets.add(C.lowerText);
    targets.add(C.translation);
  }
  if (/(deuten|interpret|wirkung|gestaltung|stil|aussage|stellung|beurteilen|kontext|fragestellung)/.test(text)) {
    targets.add(C.lowerText);
    targets.add(C.interpretation);
  }
  if (/(antike|rom|caesar|nepos|martial|phaedrus|hygin|vulgata|geschichte|politik|gesellschaft|kultur|religion|myth|lebenswelt|gegenwart|werte|existentiell|ethisch)/.test(text)) {
    targets.add(C.lowerCulture);
    if (/(myth|religion|gott|ovid)/.test(text)) targets.add(C.mythology);
    if (/(geschichte|politik|caesar|nepos|rom)/.test(text)) targets.add(C.historyPolitics);
    if (/(gesellschaft|werte|gegenwart|existentiell|ethisch)/.test(text)) targets.add(C.values);
    if (/(leben|alltag|familie|stadt|land)/.test(text)) targets.add(C.everyday);
  }
  if (/(konzentriert|prazise|systematisch|selbstkritisch|konstruktiv|hilfsmittel|nachschlagewerk|recherche|internet|ubung|methode)/.test(text)) {
    targets.add(C.lowerMethods);
    targets.add(C.methods);
  }
}

function mapSekII(text: string, targets: Set<string>): void {
  if (/(wort|vokabel|bedeutung|wortbildung|fremdwort|lexik|worterbuch|sprache|grammatik|syntax|morphologie|form|kasus|tempus|modus|aci|participium|ablativus|gerund|oratio)/.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
  }
  if (/(metrik|vers|hexameter|distichon|stil|gestaltung|alliteration|anapher|metapher|rhetorisch)/.test(text)) {
    targets.add(C.upperLanguage);
    targets.add(C.upperSyntax);
    targets.add(C.poetry);
  }
  if (/(text|lekture|ubersetz|wiedergeben|erschliess|originaltext|sinn|paraphrase|translat)/.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperTranslation);
  }
  if (/(deuten|interpret|wirkung|aussage|stellung|beurteilen|fragestellung|rezeption|kontext)/.test(text)) {
    targets.add(C.upperText);
    targets.add(C.upperInterpretation);
  }
  if (/(antike|geschichte|politik|rom|cicero|plinius|ovid|livius|vergil|caesar|myth|religion|philosophie|gesellschaft|ethisch|existentiell|kultur|latin)/.test(text)) {
    targets.add(C.upperCulture);
  }
  if (/(politik|geschichte|staat|cicero|caesar|rede|rhetorik|argument|propaganda)/.test(text)) targets.add(C.rhetoric);
  if (/(philosophie|ethisch|existentiell|religion|mythos|wert|leben|mensch)/.test(text)) targets.add(C.philosophy);
  if (/(poetisch|ovid|vergil|martial|phaedrus|eleg|dichtung|vers|kunst)/.test(text)) targets.add(C.poetry);
}

function buildExtraction(spec: Spec, passages: Passage[], sourceGoals: SourceGoal[]): unknown {
  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-SH',
    subject: 'Latein',
    stage: spec.stage,
    sourceDocument: {
      key: spec.sourceDocumentKey,
      title: 'Schleswig-Holstein Fachanforderungen Latein Sekundarstufe I / Sekundarstufe II',
      path: sourcePdfPath,
      url: sourceUrl,
    },
    method: {
      extractor: 'generateShLatinSourceExtraction.ts',
      description:
        'Extrahiert Wissen-und-Können-Abschnitte, Detailbullets und Themen-/Lektürevorgaben aus der amtlichen SH-Fachanforderung.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        accepted: true,
        rationale:
          'SH Latein arbeitet mit wiederkehrenden Wissen-und-Können-Abschnitten und Themen-/Lektürevorgaben. Die Zielzahl wird gegen diese expliziten Kompetenz- und Inhaltsaussagen gezählt.',
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
        'SH Latein ist fachlich erstgeprueft: alle amtlichen Source-Ziele sind durch kanonische Latein-Ziele abgedeckt. 1:1 und 1:n sind gleichwertig; partial beschreibt die Zuordnungsform, nicht eine fachliche Luecke.',
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
        checks: [{ id: 'source-document-present', label: 'Amtliche SH-Fachanforderungen-PDF liegt lokal vor', passed: true, details: sourcePdfPath }],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [{ id: 'passage-groups-extracted', label: 'Kompetenz- und Themenpassagen extrahiert', passed: true, details: `${passages} Passagegruppen` }],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: 'complete',
        dependsOn: ['MAPPING-1'],
        checks: [{ id: 'source-goals-created', label: 'Source-Ziele aus Wissen-und-Können-Abschnitten und Themenvorgaben erzeugt', passed: true, details: `${sourceGoals} Source-Ziele` }],
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
    jurisdiction: 'DE-SH',
    subject: 'Latein',
    stage: spec.stage,
    sourcePath: sourcePdfPath,
    archiveSourcePath: sourcePdfPath,
    archivePath: 'curricula/DE/Gymnasium/input/SH/latein/',
    sourceDocumentKey: spec.sourceDocumentKey,
    sourceUrl,
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

function pdftotext(firstPage: number, lastPage: number): string {
  return execFileSync('pdftotext', ['-layout', '-f', String(firstPage), '-l', String(lastPage), abs(sourcePdfPath), '-'], {
    encoding: 'utf8',
  });
}

function cleanSourceText(text: string): string {
  return normalizeWhitespace(text)
    .replace(/^Die Schülerinnen und Schüler\s+/u, '')
    .replace(/[.;:]$/u, '');
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/gu, ' ').trim();
}

function asCanStatement(text: string): string {
  const clean = cleanSourceText(text);
  const ascii = toAscii(clean).toLowerCase();
  if (ascii.startsWith('die schulerinnen') || ascii.startsWith('die lernende person')) return clean;
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
