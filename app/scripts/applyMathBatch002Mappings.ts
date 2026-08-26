import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

type JsonRecord = Record<string, unknown>;

const repoRoot = resolve(import.meta.dirname, "../..");
const mappingRoot = resolve(repoRoot, "curricula/DE/Gymnasium/mapping");
const writeMode = process.argv.includes("--write");
const marker = "AI-Synthese-Strukturrouting 2026-08-26";
const correctionMarker = "AI-Synthese-Fehlroutenkorrektur 2026-08-26";
const hbScaleMarker = "AI-Synthese-HB-Maßstabsbindung 2026-08-26";

const ids = {
  divisibilityCluster: "f2d4a7de-57c3-5749-bbb4-6cd4b57b7562",
  divisibility: "6ff61721-b2cc-5b1b-ade5-b3c1fd7f7077",
  primeFactors: "a4c2b831-02f0-5d55-a300-7823a71352c4",
  proportionalCluster: "ca9093cd-9ccf-5fb4-9dd8-bf4f92af4e70",
  ruleOfThree: "596345cd-679e-5c7b-955f-e8cb1ec81e96",
  scale: "79dd11f0-ed20-5b92-a215-b061a2098c0c",
  fractionsCluster: "a075ae99-7669-563d-807a-f91b119c020a",
  equivalentFractions: "339a7bf5-f1df-5d5a-9ec4-41f471f0c111",
  compareFractions: "02013455-72a0-5213-9509-ed77f7ede62b",
  rationalCluster: "c9e01667-24c4-56a2-8cf4-dfb6c360d7b9",
  rationalNumberLine: "f6b13b8e-1ecd-5420-905d-21290aa996a6",
  numberSets: "60c2418b-aaff-58f6-964a-bc7cda2a673c",
  units: "f2e42af5-67a6-477e-82ea-e65b09cc6cb3",
  measureQuantities: "ad26e4d9-b025-57ec-8f25-df4a2415cc62",
} as const;

const splitParents = new Set([
  ids.divisibilityCluster,
  ids.proportionalCluster,
  ids.fractionsCluster,
  ids.rationalCluster,
]);

const allRoutedTargets = new Set([
  ...splitParents,
  ids.divisibility,
  ids.primeFactors,
  ids.ruleOfThree,
  ids.scale,
  ids.equivalentFractions,
  ids.compareFractions,
  ids.rationalNumberLine,
  ids.numberSets,
  ids.units,
  ids.measureQuantities,
]);

// These exclusions were established by a source-text audit after the mechanical first pass.
// They remove lexical collisions (notably "vervielfachen" / "Vielfache von pi"), pure
// measurement evidence from the revised unit-conversion goal, and number-line overclaims.
const hardTargetExclusions = new Map<string, Set<string>>([
  [
    "hh-math-seki-2022-hh-seki-5-6-09-09-8c0614e78e",
    new Set([ids.divisibility]),
  ],
  [
    "hh-math-seki-2022-hh-seki-5-6-10-09-8be97f8741",
    new Set([ids.divisibility]),
  ],
  [
    "hh-math-seki-2022-hh-seki-5-6-14-08-0d06f1b74a",
    new Set([ids.divisibility]),
  ],
  [
    "de-sl-mathematik-seki-gym9-2023-2026-sl-seki-10-t06-trigonometrische-funktionen-teil-i-b05-f5474e7803",
    new Set([ids.divisibility]),
  ],
  [
    "de-st-mathematik-seki-fachlehrplan-gymnasium-2019-st-seki-5-6-gk-lk-grossen-k004-fa9396bb38",
    new Set([ids.divisibility]),
  ],
  ["bw-math-seki-bp2016-3-1-2-01-705809c6", new Set([ids.units])],
  ["he-math-seki-kc-7-3-messvorgaenge-j5-6-01-9155dc8b", new Set([ids.units])],
  ["he-math-seki-kc-7-3-messvorgaenge-j5-6-02-3720bfb0", new Set([ids.units])],
  ["he-math-seki-kc-7-3-messvorgaenge-j5-6-03-dfe71e54", new Set([ids.units])],
  ["he-math-seki-kc-7-3-messvorgaenge-j5-6-04-1bdfebc4", new Set([ids.units])],
  ["by-math-m6-1-1-37111b61-s03-ca05f3d599", new Set([ids.rationalNumberLine])],
  ["he-math-seki-g9-8-1-06-ecfc9e66", new Set([ids.rationalNumberLine])],
  ["he-math-seki-g9-9-2-09-d809b14a", new Set([ids.rationalNumberLine])],
]);

// Bremen's explicit J6 standard is the narrow official-source evidence for the
// scale atom. The wording supports calculations with scale data, but does not
// state ratio interpretation or conversion to like length units explicitly;
// consequently the reviewed edge must remain partial.
const hbScaleSourceId =
  "de-hb-mathematik-seki-bildungsplan-2006-2022-hb-seki-j6-content-standards-031-facf459e0c";
const hbScaleRationale = `${hbScaleMarker}: Der amtliche Quelltext „rechnen mit maßstäblichen Angaben“ belegt Maßstabsrechnungen. Er nennt weder das Deuten des Maßstabs als Verhältnis noch die Umrechnung in gleichartige Längeneinheiten ausdrücklich; deshalb ist die Zuordnung zum präziseren kanonischen Ziel partial.`;

// Prime recognition or general factor knowledge is a component of prime factorisation, not
// full one-to-one evidence for it. Keep the useful edge, but fail closed to partial strength.
const partialDowngradeSourceIds = new Set([
  "hh-math-seki-2022-hh-seki-5-6-03-04-314e67b00b",
  "de-mv-mathematik-seki-rahmenplaene-2020-2019-mv-seki-os-j6-naturliche-zahlen-001-4ef760d27d",
  "de-ni-mathematik-seki-kerncurriculum-ni-seki-lernbereich-kern-umgang-mit-naturlichen-zahlen-009-16d7e29faa",
  "de-rp-mathematik-seki-rahmenlehrplan-2007-rp-seki-os-l1-natuerliche-zahlen-020-9e595abe70",
  "de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l1-zahl-und-operation-K002-c0eda6de61",
  "de-sh-mathematik-seki-fachanforderungen-2024-sh-seki-l1-zahl-und-operation-T027-4fc5bc2df8",
  "de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t06-teilbarkeit-der-naturlichen-zahlen-b13-5335a4db8e",
  "de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t06-teilbarkeit-der-naturlichen-zahlen-b14-8a364e451a",
  "de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t06-teilbarkeit-der-naturlichen-zahlen-b17-776c0ab14e",
  "de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t07-bruche-b17-de14d45f1b",
  "de-sn-mathematik-seki-lehrplan-gymnasium-2019-sn-seki-6-wb03-primzahlen-r001-850d7f9b3e",
  "de-th-mathematik-seki-lehrplan-gymnasium-2018-2025-th-seki-2025-2-1-2-zahl-und-operation-019-e05aed7804",
]);

// This BW legacy statement jointly covers divisibility rules and prime-factor
// decomposition. After splitting the old bundle it is useful evidence for both
// children, but neither child is a one-to-one exact replacement of the source.
const jointSplitCoveragePartialSourceIds = new Set([
  "6fe045f9-edf6-4c4c-8962-2c47de192a15",
  "bd59aec0-5af5-49b2-bcce-6ebe98e25c86",
  "b0cd5e41-0cb9-5f96-b0fe-5e40390c0915",
  "f7df6004-58c2-4e4c-bd86-e1cf564f8487",
  "by-math-m5-3-1-cb924558-s02-aad1a58473",
  "de-hb-mathematik-seki-bildungsplan-2006-2022-hb-seki-j6-content-standards-014-ade5e95815",
  "he-math-seki-kc-7-3-zahlen-j5-6-08-9a9f4d25",
  "he-math-seki-g9-5-3-01-b0382c2f",
  "he-math-seki-g9-6-1-09-2c19f0de",
  "he-math-seki-g8-5g-3-01-575d29f0",
  "he-math-seki-g8-6g-1-07-1e463806",
  "de-sl-mathematik-seki-gym9-2023-2026-sl-seki-5-6-t06-teilbarkeit-der-naturlichen-zahlen-b20-a7252bd2ea",
  "de-sn-mathematik-seki-lehrplan-gymnasium-2019-sn-seki-5-lb01-arbeiten-mit-naturlichen-zahlen-r009-722b336e18",
]);

const obsoleteJointSplitRationale =
  "Die Quelle deckt beide getrennten Teilkompetenzen gemeinsam ab; nach dem Split ist daher keine einzelne Kindkante eine 1:1-exact-Ersetzung und beide bleiben partial.";
const jointSplitRationale =
  "Die Quelle kann die aufgeführten getrennten Teilkompetenzen gemeinsam fachlich vollständig belegen. partial kennzeichnet hier jedoch die 1:n-Zuordnung beziehungsweise den Granularitätsunterschied nach dem Split, nicht eine fachliche Lücke; keine einzelne Kindkante ist eine 1:1-exact-Ersetzung.";

const correctionSourceIds = new Set([
  ...hardTargetExclusions.keys(),
  ...partialDowngradeSourceIds,
  ...jointSplitCoveragePartialSourceIds,
  hbScaleSourceId,
]);

const walkJson = (root: string): string[] =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return walkJson(path);
    return entry.isFile() &&
      entry.name.endsWith(".json") &&
      /math/i.test(entry.name)
      ? [path]
      : [];
  });

const walkSourceJson = (root: string): string[] =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return walkSourceJson(path);
    if (
      !entry.isFile() ||
      (!entry.name.endsWith(".json") && !entry.name.endsWith(".json.snapshot"))
    )
      return [];
    return /math|mathematik/i.test(path) ? [path] : [];
  });

const normalize = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("de")
    .replace(/\s+/g, " ")
    .trim();

const has = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(text));

function classify(
  oldTargetId: string,
  source: JsonRecord,
  decision: JsonRecord,
): string[] {
  const text = normalize(
    source.sourceText ?? source.sourceSpan ?? decision.sourceSpan,
  );
  const context = normalize(
    `${source.topicCode ?? decision.topicCode ?? ""} ${source.title ?? ""}`,
  );

  if (oldTargetId === ids.divisibilityCluster) {
    const divisibility = has(text, [
      /teilbar/u,
      /\bteiler(?:n|menge|mengen|beziehung|fremd)?\b/u,
      /vielfach/u,
      /\bggt\b/u,
      /\bkgv\b/u,
      /\bgerade\b/u,
      /\bungerade\b/u,
      /zahlentheoret/u,
    ]);
    const primeFactors = has(text, [
      /prim(?:zahl|zahlen|faktor|faktoren|faktorzerleg)/u,
      /faktorisier/u,
      /in primfaktoren/u,
      /\bfaktoren?\b/u,
      /zahlentheoret/u,
    ]);
    return [
      ...(divisibility ? [ids.divisibility] : []),
      ...(primeFactors ? [ids.primeFactors] : []),
    ];
  }

  if (oldTargetId === ids.proportionalCluster) {
    const ruleOfThree = has(text, [
      /dreisatz/u,
      /schlussrechn/u,
      /proportional/u,
      /zuordnung/u,
      /verhältnis/u,
    ]);
    const scale = has(text, [
      /maßstab/u,
      /massstab/u,
      /maßstäb/u,
      /massstäb/u,
      /kartograph/u,
      /bauplän/u,
      /bauplan/u,
      /ähnlichkeit/u,
    ]);
    return [
      ...(ruleOfThree ? [ids.ruleOfThree] : []),
      ...(scale ? [ids.scale] : []),
    ];
  }

  if (oldTargetId === ids.fractionsCluster) {
    const equivalence = has(text, [
      /erweiter/u,
      /kürz/u,
      /kuerz/u,
      /wertgleich/u,
      /äquivalent/u,
      /aequivalent/u,
      /hauptnenner/u,
      /gemeinsame[nr]? nenner/u,
      /gleichheit (?:von )?anteil/u,
    ]);
    const compare = has(text, [
      /vergleich/u,
      /ordn/u,
      /größenvergleich/u,
      /groessenvergleich/u,
      /kleiner/u,
      /größer/u,
      /groesser/u,
      /ungleich/u,
    ]);
    return [
      ...(equivalence ? [ids.equivalentFractions] : []),
      ...(compare ? [ids.compareFractions] : []),
    ];
  }

  if (oldTargetId === ids.rationalCluster) {
    const numberLine = has(text, [
      /zahlengerad/u,
      /zahlenstrahl/u,
      /ordn/u,
      /vergleich/u,
      /darstell/u,
      /bruchzahl/u,
      /punkte/u,
      /lage/u,
      /betrag/u,
      /gegenzahl/u,
      /koordinat/u,
    ]);
    const numberSets = has(text, [
      /zahlenmeng/u,
      /zahlmeng/u,
      /zahlbereich/u,
      /zusammenh.*natür.*ganz.*rational/u,
      /natür.*ganz.*rational/u,
      /unterschied.*zahlen/u,
    ]);
    return [
      ...(numberLine ? [ids.rationalNumberLine] : []),
      ...(numberSets ? [ids.numberSets] : []),
    ];
  }

  if (oldTargetId === ids.units) {
    const unitWork = has(text, [
      /einheit/u,
      /umrechn/u,
      /umwand/u,
      /maßzahl/u,
      /masszahl/u,
      /größenangab/u,
      /groessenangab/u,
      /vorsilb/u,
      /gleichartig/u,
      /winkel.*minuten/u,
      /^länge$/u,
      /^masse(?:\/gewichte)?$/u,
      /^währung\/geld$/u,
      /^geld$/u,
      /^zeitspanne$/u,
    ]);
    const measurement =
      has(text, [
        /\bmess(?:en|ung|ungen|vorgang|vorgänge|mittel|gerät)/u,
        /erfass/u,
        /schätz/u,
        /bestimmung von größen/u,
        /repräsentanten zur bestimmung/u,
      ]) || /messvorg/u.test(context);
    return [
      ...(unitWork ? [ids.units] : []),
      ...(measurement ? [ids.measureQuantities] : []),
    ];
  }

  throw new Error(`Unsupported target ${oldTargetId}`);
}

const unique = <T>(values: T[]): T[] => [...new Set(values)];

const sourceIdOfMapping = (mapping: JsonRecord): string =>
  String(
    mapping.legacyGoalId ?? mapping.sourceGoalId ?? mapping.sourceId ?? "",
  );

function routeDecision(
  decision: JsonRecord,
  source: JsonRecord,
): { changed: boolean; routeByOldTarget: Map<string, string[]> } {
  const routeByOldTarget = new Map<string, string[]>();
  let changed = false;
  const originalIds = [...(decision.canonicalGoalIds ?? [])];

  if (decision.sourceGoalId === hbScaleSourceId) {
    if (normalize(source.sourceText) !== "rechnen mit maßstäblichen angaben") {
      throw new Error(
        `${hbScaleSourceId}: unexpected official source text ${JSON.stringify(source.sourceText)}`,
      );
    }
    for (const targetId of originalIds)
      routeByOldTarget.set(targetId, [ids.scale]);
    if (originalIds.length !== 1 || originalIds[0] !== ids.scale) {
      decision.canonicalGoalIds = [ids.scale];
      changed = true;
    }
    if (decision.matchType !== "partial") {
      decision.matchType = "partial";
      changed = true;
    }
    if (decision.rationale !== hbScaleRationale) {
      decision.rationale = hbScaleRationale;
      decision.reviewedAt = "2026-08-26";
      decision.reviewer = "codex-ai-synthesis";
      changed = true;
    }
    return { changed, routeByOldTarget };
  }

  const routedIds: string[] = [];
  const exclusions =
    hardTargetExclusions.get(decision.sourceGoalId) ?? new Set<string>();

  for (const targetId of originalIds) {
    if (exclusions.has(targetId)) {
      routeByOldTarget.set(targetId, []);
      changed = true;
    } else if (splitParents.has(targetId) || targetId === ids.units) {
      const replacements = classify(targetId, source, decision);
      routeByOldTarget.set(targetId, replacements);
      routedIds.push(...replacements);
      if (
        targetId !== ids.units ||
        replacements.length !== 1 ||
        replacements[0] !== ids.units
      )
        changed = true;
      if (targetId === ids.units) changed = true;
    } else {
      routedIds.push(targetId);
    }
  }

  decision.canonicalGoalIds = unique(routedIds);
  if (decision.canonicalGoalIds.length === 0) {
    throw new Error(
      `Routing would leave source decision ${decision.sourceGoalId} without a canonical target`,
    );
  }
  if (changed && !normalize(decision.rationale).includes(normalize(marker))) {
    const routedTitles = unique(
      [...routeByOldTarget.values()].flat().map((targetId) => {
        if (targetId === ids.divisibility) return "Teilbarkeitsregeln 2/3/5/10";
        if (targetId === ids.primeFactors) return "Primfaktorzerlegung";
        if (targetId === ids.ruleOfThree)
          return "Dreisatz in proportionalen Sachsituationen";
        if (targetId === ids.scale)
          return "Maßstabsaufgaben mit gleichartigen Längeneinheiten";
        if (targetId === ids.equivalentFractions)
          return "wertgleiche Brüche durch Erweitern/Kürzen";
        if (targetId === ids.compareFractions)
          return "begründeter Bruchvergleich";
        if (targetId === ids.rationalNumberLine)
          return "Darstellen/Ordnen an der Zahlengeraden";
        if (targetId === ids.numberSets) return "Zahlmengenbeziehungen N–Z–Q";
        if (targetId === ids.units)
          return "Einheitenwahl, Umrechnung und anschließender Vergleich";
        if (targetId === ids.measureQuantities)
          return "eigenständiges Messen mit geeigneten Messmitteln";
        return targetId;
      }),
    );
    const routeSummary =
      routedTitles.length > 0
        ? routedTitles.join("; ")
        : "keine der getrennten Teilkompetenzen";
    decision.rationale =
      `${decision.rationale ?? ""} ${marker}: Der aktuelle Quelltext wurde semantisch auf ${routeSummary} geroutet; die frühere Sammelziel- beziehungsweise Messformulierung wird nicht fortgeschrieben.`.trim();
    decision.reviewedAt = "2026-08-26";
    decision.reviewer = "codex-ai-synthesis";
  }
  if (
    exclusions.size > 0 &&
    !normalize(decision.rationale).includes(normalize(correctionMarker))
  ) {
    decision.rationale =
      `${decision.rationale ?? ""} ${correctionMarker}: Eine nachgelagerte fachliche Quelltextprüfung hat die nicht belegte Zielkante entfernt; übrige belegte Ziele bleiben unverändert.`.trim();
    decision.reviewedAt = "2026-08-26";
    decision.reviewer = "codex-ai-synthesis";
  }
  if (
    partialDowngradeSourceIds.has(decision.sourceGoalId) &&
    decision.matchType !== "partial"
  ) {
    decision.matchType = "partial";
    changed = true;
    if (!normalize(decision.rationale).includes(normalize(correctionMarker))) {
      decision.rationale =
        `${decision.rationale ?? ""} ${correctionMarker}: Die Quelle belegt eine notwendige Primzahl- oder Faktoren-Unterkompetenz, aber nicht die vollständige Primfaktorzerlegung; die Kante ist deshalb nur partial.`.trim();
    }
    decision.reviewedAt = "2026-08-26";
    decision.reviewer = "codex-ai-synthesis";
  }
  if (
    jointSplitCoveragePartialSourceIds.has(decision.sourceGoalId) &&
    decision.matchType !== "partial"
  ) {
    decision.matchType = "partial";
    changed = true;
    if (!normalize(decision.rationale).includes(normalize(correctionMarker))) {
      decision.rationale =
        `${decision.rationale ?? ""} ${correctionMarker}: ${jointSplitRationale}`.trim();
    }
    decision.reviewedAt = "2026-08-26";
    decision.reviewer = "codex-ai-synthesis";
  }
  if (
    jointSplitCoveragePartialSourceIds.has(decision.sourceGoalId) &&
    String(decision.rationale ?? "").includes(obsoleteJointSplitRationale)
  ) {
    decision.rationale = String(decision.rationale).replace(
      obsoleteJointSplitRationale,
      jointSplitRationale,
    );
    decision.reviewedAt = "2026-08-26";
    decision.reviewer = "codex-ai-synthesis";
    changed = true;
  }
  return { changed, routeByOldTarget };
}

function routeMappings(
  mappings: JsonRecord[],
  routesBySource: Map<string, Map<string, string[]>>,
): JsonRecord[] {
  const result: JsonRecord[] = [];
  const seen = new Set<string>();
  for (const mapping of mappings) {
    const sourceId = sourceIdOfMapping(mapping);
    const routes = routesBySource.get(sourceId);
    const targetId = String(mapping.canonicalGoalId ?? "");
    const replacements = routes?.get(targetId) ?? [targetId];
    for (const replacement of replacements) {
      const next = { ...mapping, canonicalGoalId: replacement };
      if (
        partialDowngradeSourceIds.has(sourceId) ||
        jointSplitCoveragePartialSourceIds.has(sourceId) ||
        sourceId === hbScaleSourceId
      )
        next.matchType = "partial";
      const key = `${sourceId}\u0000${replacement}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(next);
    }
  }
  return result;
}

const reviewFiles = walkJson(mappingRoot).filter((path) =>
  path.endsWith(".review.json"),
);
const globalRoutes = new Map<string, Map<string, string[]>>();
const transformed = new Map<string, JsonRecord>();
let changedDecisions = 0;
let changedFiles = 0;

const legacySourceById = new Map<string, JsonRecord>();
for (const sourcePath of walkSourceJson(
  resolve(repoRoot, "curricula/DE/Gymnasium/input"),
)) {
  let sourceDocument: JsonRecord;
  try {
    sourceDocument = JSON.parse(readFileSync(sourcePath, "utf8")) as JsonRecord;
  } catch {
    continue;
  }
  for (const goal of sourceDocument.goals ?? [])
    legacySourceById.set(goal.id, goal);
}

for (const path of reviewFiles) {
  const before = readFileSync(path, "utf8");
  if (
    ![...splitParents, ids.units].some((targetId) =>
      before.includes(targetId),
    ) &&
    ![...correctionSourceIds].some((sourceId) => before.includes(sourceId))
  )
    continue;
  const review = JSON.parse(before) as JsonRecord;
  const extractionPath = resolve(repoRoot, review.sourceExtractionPath);
  const extraction = JSON.parse(
    readFileSync(extractionPath, "utf8"),
  ) as JsonRecord;
  const sourceById = new Map(
    (extraction.sourceGoals ?? []).map((goal: JsonRecord) => [goal.id, goal]),
  );
  const localRoutes = new Map<string, Map<string, string[]>>();

  for (const decision of review.decisions ?? []) {
    if (
      !(decision.canonicalGoalIds ?? []).some(
        (targetId: string) =>
          splitParents.has(targetId) || targetId === ids.units,
      ) &&
      !correctionSourceIds.has(decision.sourceGoalId)
    ) {
      continue;
    }
    const source = sourceById.get(decision.sourceGoalId);
    if (!source)
      throw new Error(
        `${relative(repoRoot, path)}: source goal ${decision.sourceGoalId} missing`,
      );
    const routed = routeDecision(decision, source);
    if (routed.changed) changedDecisions += 1;
    localRoutes.set(decision.sourceGoalId, routed.routeByOldTarget);
    const existing =
      globalRoutes.get(decision.sourceGoalId) ?? new Map<string, string[]>();
    for (const [oldTarget, replacements] of routed.routeByOldTarget) {
      const previous = existing.get(oldTarget);
      if (
        previous &&
        JSON.stringify(previous) !== JSON.stringify(replacements)
      ) {
        throw new Error(
          `Conflicting routes for ${decision.sourceGoalId} / ${oldTarget}`,
        );
      }
      existing.set(oldTarget, replacements);
    }
    globalRoutes.set(decision.sourceGoalId, existing);
  }

  review.mappings = routeMappings(review.mappings ?? [], localRoutes);
  transformed.set(path, review);
}

for (const path of walkJson(mappingRoot).filter(
  (candidate) => !candidate.endsWith(".review.json"),
)) {
  const before = readFileSync(path, "utf8");
  if (
    ![...splitParents, ids.units].some((targetId) =>
      before.includes(targetId),
    ) &&
    ![...correctionSourceIds].some((sourceId) => before.includes(sourceId))
  )
    continue;
  const mappingFile = JSON.parse(before) as JsonRecord;
  for (const mapping of mappingFile.mappings ?? []) {
    const targetId = String(mapping.canonicalGoalId ?? "");
    const sourceId = sourceIdOfMapping(mapping);
    if (globalRoutes.get(sourceId)?.has(targetId)) continue;
    if (!splitParents.has(targetId) && targetId !== ids.units) continue;
    if (!globalRoutes.get(sourceId)?.has(targetId)) {
      const legacySource = legacySourceById.get(sourceId);
      if (!legacySource) {
        throw new Error(
          `${relative(repoRoot, path)}: no reviewed or legacy-source route for ${sourceId} / ${targetId}`,
        );
      }
      const routes = globalRoutes.get(sourceId) ?? new Map<string, string[]>();
      routes.set(
        targetId,
        classify(targetId, legacySource, {
          sourceGoalId: sourceId,
          sourceSpan: legacySource.description ?? legacySource.title,
        }),
      );
      globalRoutes.set(sourceId, routes);
    }
  }
  mappingFile.mappings = routeMappings(
    mappingFile.mappings ?? [],
    globalRoutes,
  );
  transformed.set(path, mappingFile);
}

for (const [path, value] of transformed) {
  const after = `${JSON.stringify(value, null, 2)}\n`;
  const before = readFileSync(path, "utf8");
  if (after !== before) {
    changedFiles += 1;
    if (writeMode) writeFileSync(path, after);
    else
      throw new Error(
        `${relative(repoRoot, path)} is not at the adjudicated mapping state`,
      );
  }
}

const staleFiles = walkJson(mappingRoot).filter((path) => {
  const text = readFileSync(path, "utf8");
  return [...splitParents].some((targetId) => text.includes(targetId));
});
if (writeMode && staleFiles.length > 0) {
  throw new Error(
    `Stale split-parent mapping references remain: ${staleFiles.map((path) => relative(repoRoot, path)).join(", ")}`,
  );
}

for (const [path, value] of transformed) {
  for (const decision of value.decisions ?? []) {
    if (
      new Set(decision.canonicalGoalIds ?? []).size !==
      (decision.canonicalGoalIds ?? []).length
    ) {
      throw new Error(
        `${relative(repoRoot, path)}: duplicate canonical IDs in ${decision.sourceGoalId}`,
      );
    }
    if (
      (decision.canonicalGoalIds ?? []).some((targetId: string) =>
        splitParents.has(targetId),
      )
    ) {
      throw new Error(
        `${relative(repoRoot, path)}: stale split parent in ${decision.sourceGoalId}`,
      );
    }
  }
  for (const mapping of value.mappings ?? []) {
    if (splitParents.has(mapping.canonicalGoalId)) {
      throw new Error(
        `${relative(repoRoot, path)}: stale split parent mapping`,
      );
    }
    if (
      mapping.canonicalGoalId &&
      !allRoutedTargets.has(mapping.canonicalGoalId)
    )
      continue;
  }
}

console.log(
  `CHECK apply_math_batch_002_mappings ${writeMode ? "WRITE" : "PASS"} reviewFiles=${reviewFiles.length} transformedFiles=${transformed.size} changedFiles=${changedFiles} changedDecisions=${changedDecisions}`,
);
