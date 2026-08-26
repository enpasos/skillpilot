import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const mappingRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/mapping')
const inputRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/input')
const writeMode = process.argv.includes('--write')

const ids = {
  powersCluster: 'eb993c0c-9b1d-52af-97c8-4a534fd78be3',
  powersMeaning: 'd658e26a-e351-4bca-824e-f346deaa87c5',
  powersOfTen: 'e331a425-e9c6-46eb-89cb-dedf72857974',
} as const

const marker = 'AI-Synthese-Potenzsplit-Routing 2026-08-26'
const exactCombinedSourceId = 'b0cd5e41-0cb9-5f96-b0fe-5e40390c0915'
const obsoleteExactCombinedGrading = 'Der amtliche Quelltext benennt beide nun getrennten Leistungen vollständig; die kombinierte Zielmenge bleibt daher exact.'
const splitGranularityGrading = 'Der amtliche Quelltext benennt beide getrennten Leistungen gemeinsam vollständig. partial kennzeichnet hier die 1:n-Zuordnung und den Granularitätsunterschied nach dem Split, nicht eine fachliche Lücke.'

const walk = (root: string): string[] =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name)
    return entry.isDirectory() ? walk(path) : entry.isFile() ? [path] : []
  })

const normalize = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').toLocaleLowerCase('de').replace(/\s+/gu, ' ').trim()

const unique = <T>(values: T[]): T[] => [...new Set(values)]

function classify(sourceText: unknown): string[] {
  const text = normalize(sourceText)
  const powersOfTen = /zehner[- ]?potenz|normdarstellung|wissenschaft\s*lich|technisch|abgetrennte[nr]? zehner|einheitenvors|vorsilben|\bhekto\b|\bkilo\b|\bmega\b|\bgiga\b/u.test(text)
  const withoutPowersOfTen = text
    .replace(/zehner[- ]?potenz(?:en|schreibweise)?/gu, ' ')
    .replace(/normdarstellung|wissenschaft\s*lich(?:e[nr]?)?|technisch(?:e[nr]?)?|abgetrennte[nr]?/gu, ' ')
    .replace(/einheitenvorsätze|vorsilben|hekto|kilo|mega|giga/gu, ' ')
  const powersMeaning = /potenz|potenzier|basis|exponent|quadratzahl|kubikzahl|radiz|wurzel/u.test(withoutPowersOfTen)
  const replacements = [
    ...(powersMeaning ? [ids.powersMeaning] : []),
    ...(powersOfTen ? [ids.powersOfTen] : []),
  ]
  if (replacements.length === 0) {
    throw new Error(`Cannot route powers source text ${JSON.stringify(sourceText)}`)
  }
  return replacements
}

const sourceIdOfMapping = (mapping: JsonRecord): string =>
  String(mapping.legacyGoalId ?? mapping.sourceGoalId ?? mapping.sourceId ?? '')

const reviewFiles = walk(mappingRoot).filter(
  (path) => path.endsWith('.review.json') && /math|mathematik/iu.test(path),
)
const sourceById = new Map<string, JsonRecord>()
for (const sourcePath of walk(inputRoot).filter(
  (path) => (/\.json(?:\.snapshot)?$/u.test(path) && /math|mathematik/iu.test(path)),
)) {
  let document: JsonRecord
  try {
    document = JSON.parse(readFileSync(sourcePath, 'utf8')) as JsonRecord
  } catch {
    continue
  }
  for (const sourceGoal of document.sourceGoals ?? document.goals ?? []) {
    if (sourceGoal?.id) sourceById.set(sourceGoal.id, sourceGoal)
  }
}

const routesBySource = new Map<string, string[]>()
const matchTypeBySource = new Map<string, 'exact' | 'partial'>()
const transformed = new Map<string, JsonRecord>()
let decisionCount = 0

for (const path of reviewFiles) {
  const before = readFileSync(path, 'utf8')
  if (
    !before.includes(ids.powersCluster)
    && !before.includes(ids.powersMeaning)
    && !before.includes(ids.powersOfTen)
  ) continue
  const review = JSON.parse(before) as JsonRecord
  const extraction = JSON.parse(readFileSync(resolve(repoRoot, review.sourceExtractionPath), 'utf8')) as JsonRecord
  const localSourceById = new Map(
    (extraction.sourceGoals ?? []).map((goal: JsonRecord) => [goal.id, goal]),
  )

  for (const decision of review.decisions ?? []) {
    const currentGoalIds = decision.canonicalGoalIds ?? []
    if (
      !currentGoalIds.includes(ids.powersCluster)
      && !currentGoalIds.includes(ids.powersMeaning)
      && !currentGoalIds.includes(ids.powersOfTen)
    ) continue
    const source = localSourceById.get(decision.sourceGoalId)
    if (!source) throw new Error(`${relative(repoRoot, path)}: missing source ${decision.sourceGoalId}`)
    const replacements = currentGoalIds.includes(ids.powersCluster)
      ? classify(source.sourceText ?? source.title)
      : unique(currentGoalIds.filter((goalId: string) =>
          goalId === ids.powersMeaning || goalId === ids.powersOfTen,
        ))
    // A source goal routed to multiple split children is deliberately partial:
    // the repository contract reserves exact for 1:1 mappings. This says
    // nothing about whether the source text jointly covers all child content.
    const matchType = 'partial'
    decision.canonicalGoalIds = unique(
      (currentGoalIds as string[]).flatMap((goalId) =>
        goalId === ids.powersCluster ? replacements : [goalId]),
    )
    decision.matchType = matchType
    const routeLabel = replacements.length === 2
      ? 'beide getrennten Ziele (grundlegende Potenzbedeutung sowie stellenwertbezogene Zehnerpotenzdarstellung)'
      : replacements[0] === ids.powersMeaning
        ? 'das Ziel zur grundlegenden Potenzbedeutung und -berechnung'
        : 'das Ziel zur stellenwertbezogenen Darstellung großer Zahlen mit Zehnerpotenzen'
    const grading = decision.sourceGoalId === exactCombinedSourceId
      ? splitGranularityGrading
      : 'Die Quelle belegt nur eine Teilfacette oder einen breiteren beziehungsweise späteren Potenzkontext; die Kante bleibt deshalb konservativ partial.'
    if (!normalize(decision.rationale).includes(normalize(marker))) {
      decision.rationale = `${decision.rationale ?? ''} ${marker}: Der exakte amtliche Quelltext wurde auf ${routeLabel} verteilt. ${grading}`.trim()
      decision.reviewedAt = '2026-08-26'
      decision.reviewer = 'codex-ai-synthesis'
    } else if (
      decision.sourceGoalId === exactCombinedSourceId
      && String(decision.rationale ?? '').includes(obsoleteExactCombinedGrading)
    ) {
      decision.rationale = String(decision.rationale).replace(
        obsoleteExactCombinedGrading,
        splitGranularityGrading,
      )
      decision.reviewedAt = '2026-08-26'
      decision.reviewer = 'codex-ai-synthesis'
    }
    routesBySource.set(decision.sourceGoalId, replacements)
    matchTypeBySource.set(decision.sourceGoalId, matchType)
    decisionCount += 1
  }

  const seen = new Set<string>()
  review.mappings = (review.mappings ?? []).flatMap((mapping: JsonRecord) => {
    const sourceId = sourceIdOfMapping(mapping)
    const isPowersChild = mapping.canonicalGoalId === ids.powersMeaning
      || mapping.canonicalGoalId === ids.powersOfTen
    const replacements = mapping.canonicalGoalId === ids.powersCluster
      ? routesBySource.get(sourceId)
      : [mapping.canonicalGoalId]
    if (!replacements) throw new Error(`${relative(repoRoot, path)}: missing reviewed route for ${sourceId}`)
    return replacements.flatMap((canonicalGoalId) => {
      const key = `${sourceId}\u0000${canonicalGoalId}`
      if (seen.has(key)) return []
      seen.add(key)
      return [{
        ...mapping,
        canonicalGoalId,
        ...(mapping.canonicalGoalId === ids.powersCluster || isPowersChild
          ? { matchType: matchTypeBySource.get(sourceId) ?? 'partial' }
          : {}),
      }]
    })
  })
  transformed.set(path, review)
}

for (const path of walk(mappingRoot).filter(
  (candidate) =>
    candidate.endsWith('.json')
    && !candidate.endsWith('.review.json')
    && /math|mathematik/iu.test(candidate),
)) {
  const before = readFileSync(path, 'utf8')
  if (
    !before.includes(ids.powersCluster)
    && !before.includes(ids.powersMeaning)
    && !before.includes(ids.powersOfTen)
  ) continue
  const mappingFile = JSON.parse(before) as JsonRecord
  const seen = new Set<string>()
  mappingFile.mappings = (mappingFile.mappings ?? []).flatMap((mapping: JsonRecord) => {
    const sourceId = sourceIdOfMapping(mapping)
    const isPowersChild = mapping.canonicalGoalId === ids.powersMeaning
      || mapping.canonicalGoalId === ids.powersOfTen
    let replacements: string[]
    if (mapping.canonicalGoalId !== ids.powersCluster) {
      replacements = [mapping.canonicalGoalId]
    } else {
      replacements = routesBySource.get(sourceId) ?? classify(
        sourceById.get(sourceId)?.sourceText ?? sourceById.get(sourceId)?.description ?? sourceById.get(sourceId)?.title,
      )
      if (!routesBySource.has(sourceId)) {
        routesBySource.set(sourceId, replacements)
        matchTypeBySource.set(sourceId, 'partial')
      }
    }
    return replacements.flatMap((canonicalGoalId) => {
      const key = `${sourceId}\u0000${canonicalGoalId}`
      if (seen.has(key)) return []
      seen.add(key)
      return [{
        ...mapping,
        canonicalGoalId,
        ...(mapping.canonicalGoalId === ids.powersCluster || isPowersChild
          ? { matchType: matchTypeBySource.get(sourceId) ?? 'partial' }
          : {}),
      }]
    })
  })
  transformed.set(path, mappingFile)
}

let changedFiles = 0
for (const [path, value] of transformed) {
  const after = `${JSON.stringify(value, null, 2)}\n`
  const before = readFileSync(path, 'utf8')
  if (after === before) continue
  changedFiles += 1
  if (writeMode) writeFileSync(path, after)
  else throw new Error(`${relative(repoRoot, path)} is not at the powers-split mapping state`)
}

const staleFiles = walk(mappingRoot).filter(
  (path) =>
    /\.json$/u.test(path)
    && /math|mathematik/iu.test(path)
    && readFileSync(path, 'utf8').includes(ids.powersCluster),
)
if (staleFiles.length > 0) {
  throw new Error(`Stale powers-parent mappings remain: ${staleFiles.map((path) => relative(repoRoot, path)).join(', ')}`)
}

console.log(
  `CHECK apply_math_batch_002_powers_mappings ${writeMode ? 'WRITE' : 'PASS'} decisions=${decisionCount} sources=${routesBySource.size} files=${transformed.size} changedFiles=${changedFiles}`,
)
