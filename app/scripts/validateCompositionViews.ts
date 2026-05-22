import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  compileCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionViewFinding,
} from '../src/utils/authoring/compositionViewAuthoring'
import {
  normalizeCanonicalLandscape,
  type CanonicalAuthoringLandscape,
} from '../src/utils/authoring/canonicalAuthoring'

interface CompositionViewValidationFinding extends CompositionViewFinding {
  viewId: string
  viewPath: string
  landscapeId: string
}

interface RequiredCanonicalMathScope {
  expectedViewId: string
  scope: {
    schoolForm: string
    jurisdiction?: string
    stage?: string
    courseProfile?: string
    durationModel?: string
  }
}

interface ApprovedCanonicalMathFallbackGroup {
  jurisdictions: string[]
  rationale?: string
  scopes: Array<RequiredCanonicalMathScope['scope'] & { expectedViewId: string }>
}

interface MathScopeMatch {
  viewId: string
  scope: Record<string, string>
  score: {
    scopeSize: number
    stageFallbackCount: number
  }
}

const CANONICAL_DE_MATH_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const CANONICAL_MATH_SEK1_MOTIVATION_GOAL_ID = '65365dce-f33f-49d8-9516-42f75883aa86'
const CANONICAL_MATH_SEK1_PRACTICE_CLUSTER_ID = 'bfc4fe23-bfa4-4836-9bd2-793f4305d682'
const CANONICAL_MATH_FALLBACK_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/canonical-math-composition-fallback-policy.json'
const CANONICAL_DE_MATH_VIEW_ID_PATTERN = /^de-de-gym-(?:seki|sekii-math-(?:gk|lk)|math-(?:gk|lk))$/u
const NAKED_PHASE_LABEL_PATTERN = /^(?:E-Phase|Q[1-4])$/u
const PHASE_SUPPORT_LABEL_PATTERN = /^(?:Lernkarten|Flashcards|Übungen|Uebungen|Practice(?: Set)?)\s*[-–]\s*(?:E-Phase|Q[1-4])$/u
const REDUNDANT_STAGE_SUFFIX_PATTERN = /\s+\((Sek I|Sek II)\)$/u
const SEK1_PARENT_LABEL_PATTERN = /^Sekundarstufe I$/u
const SEK2_PARENT_LABEL_PATTERN = /^Sekundarstufe II(?: \((?:GK|LK)\))?$/u
const REQUIRED_CANONICAL_MATH_SCOPES: RequiredCanonicalMathScope[] = [
  {
    expectedViewId: 'de-de-gym-seki-math',
    scope: { schoolForm: 'Gymnasium', stage: 'SekI' },
  },
  {
    expectedViewId: 'de-de-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-de-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-de-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-de-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-bw-gym-seki-math',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BW', stage: 'SekI' },
  },
  {
    expectedViewId: 'de-bw-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BW', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-bw-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BW', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-bw-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BW', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-bw-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BW', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-he-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-he-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-he-gym-seki-math-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekI', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-he-gym-seki-math-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekI', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-he-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-he-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-he-gym-math-gk-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', courseProfile: 'GK', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-he-gym-math-gk-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', courseProfile: 'GK', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-he-gym-math-lk-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', courseProfile: 'LK', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-he-gym-math-lk-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', courseProfile: 'LK', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-by-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BY', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-by-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BY', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-by-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BY', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-by-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BY', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-ni-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-NI', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-ni-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-NI', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-ni-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-NI', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-ni-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-NI', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-nw-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-NW', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-nw-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-NW', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-nw-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-NW', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-nw-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-NW', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-sh-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-sh-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-sh-gym-seki-math-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'SekI', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-sh-gym-seki-math-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'SekI', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-sh-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-sh-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-sh-gym-math-gk-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'CrossStage', courseProfile: 'GK', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-sh-gym-math-gk-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'CrossStage', courseProfile: 'GK', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-sh-gym-math-lk-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'CrossStage', courseProfile: 'LK', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-sh-gym-math-lk-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'CrossStage', courseProfile: 'LK', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-rp-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-rp-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-rp-gym-seki-math-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'SekI', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-rp-gym-seki-math-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'SekI', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-rp-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-rp-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-rp-gym-math-gk-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'CrossStage', courseProfile: 'GK', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-rp-gym-math-gk-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'CrossStage', courseProfile: 'GK', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-rp-gym-math-lk-g8',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'CrossStage', courseProfile: 'LK', durationModel: 'G8' },
  },
  {
    expectedViewId: 'de-rp-gym-math-lk-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-RP', stage: 'CrossStage', courseProfile: 'LK', durationModel: 'G9' },
  },
  {
    expectedViewId: 'de-be-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BE', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-be-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BE', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-be-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BE', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-be-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BE', stage: 'CrossStage', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-bb-gym-sekii-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BB', stage: 'SekII', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-bb-gym-sekii-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BB', stage: 'SekII', courseProfile: 'LK' },
  },
  {
    expectedViewId: 'de-bb-gym-math-gk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BB', stage: 'CrossStage', courseProfile: 'GK' },
  },
  {
    expectedViewId: 'de-bb-gym-math-lk',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-BB', stage: 'CrossStage', courseProfile: 'LK' },
  },
]

const composeScopeKey = (scope: {
  schoolForm?: string
  jurisdiction?: string
  stage?: string
  courseProfile?: string
  durationModel?: string
}) => [
  scope.schoolForm ?? '',
  scope.jurisdiction ?? '',
  scope.stage ?? '',
  scope.courseProfile ?? '',
  scope.durationModel ?? '',
].join('|')

const normalizeScopeMatchValue = (value?: string) => value?.trim().toUpperCase() ?? ''

const normalizeScopeForMatching = (scope: {
  schoolForm?: string
  jurisdiction?: string
  stage?: string
  courseProfile?: string
  durationModel?: string
}) => {
  const normalized: Record<string, string> = {}
  Object.entries(scope).forEach(([key, value]) => {
    if (!value?.trim()) return
    normalized[key] = value.trim()
  })
  return normalized
}

const matchStageScope = (viewStage?: string, requestedStage?: string): 'exact' | 'fallback' | 'none' => {
  const normalizedViewStage = normalizeScopeMatchValue(viewStage)
  const normalizedRequestedStage = normalizeScopeMatchValue(requestedStage)
  if (!normalizedViewStage || !normalizedRequestedStage) {
    return 'none'
  }
  if (normalizedViewStage === normalizedRequestedStage) {
    return 'exact'
  }
  if (
    normalizedRequestedStage === 'CROSSSTAGE'
    && (normalizedViewStage === 'SEKI' || normalizedViewStage === 'SEKII')
  ) {
    return 'fallback'
  }
  return 'none'
}

const scoreScopeMatch = (
  viewScope: Record<string, string>,
  requestedScope: Record<string, string>,
): MathScopeMatch['score'] | null => {
  if (Object.keys(viewScope).length === 0) {
    return Object.keys(requestedScope).length === 0 ? { scopeSize: 0, stageFallbackCount: 0 } : null
  }

  let stageFallbackCount = 0
  for (const [key, viewValue] of Object.entries(viewScope)) {
    const requestedValue = requestedScope[key]
    if (!requestedValue?.trim()) {
      return null
    }

    if (key === 'stage') {
      const stageMatch = matchStageScope(viewValue, requestedValue)
      if (stageMatch === 'none') {
        return null
      }
      if (stageMatch === 'fallback') {
        stageFallbackCount += 1
      }
      continue
    }

    if (normalizeScopeMatchValue(requestedValue) !== normalizeScopeMatchValue(viewValue)) {
      return null
    }
  }

  return { scopeSize: Object.keys(viewScope).length, stageFallbackCount }
}

const normalizeLearnerFacingLabel = (value: string) => value
  .normalize('NFKC')
  .toLocaleLowerCase('de-DE')
  .replace(/\s+/gu, ' ')
  .replace(/^q[1-4][.:]\s*/u, '')
  .replace(/^e-phase:\s*/u, '')
  .replace(/\s+\(sek(?:undarstufe)?\s*i{1,2}\)$/u, '')
  .replace(/\s+\((?:gk|lk)\)$/u, '')
  .trim()

const collectCanonicalMathTreeFindings = (
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  const findings: CompositionViewFinding[] = []

  const visit = (node: CompiledCompositionPreviewNode, path: string, parent?: CompiledCompositionPreviewNode) => {
    if (NAKED_PHASE_LABEL_PATTERN.test(node.label)) {
      findings.push({
        code: 'CPV-201',
        severity: 'error',
        nodePath: path,
        message: `Nackter Phasenknoten im learner-facing Baum: ${node.label}`,
      })
    }

    if (PHASE_SUPPORT_LABEL_PATTERN.test(node.label)) {
      findings.push({
        code: 'CPV-202',
        severity: 'error',
        nodePath: path,
        message: `Phasenkodierter Support-Knoten im learner-facing Baum: ${node.label}`,
      })
    }

    if (
      parent
      && REDUNDANT_STAGE_SUFFIX_PATTERN.test(node.label)
      && (
        (SEK1_PARENT_LABEL_PATTERN.test(parent.label) && /\(Sek I\)$/u.test(node.label))
        || (SEK2_PARENT_LABEL_PATTERN.test(parent.label) && /\(Sek II\)$/u.test(node.label))
      )
    ) {
      findings.push({
        code: 'CPV-204',
        severity: 'error',
        nodePath: path,
        message: `Redundanter Stufensuffix unter passendem Stufenknoten im learner-facing Baum: ${parent.label} -> ${node.label}`,
      })
    }

    node.children.forEach((child, index) => visit(child, `${path}.${index}`, node))
  }

  rootNodes.forEach((node, index) => visit(node, `${index}`))
  return findings
}

const collectGenericTreeFindings = (
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  const findings: CompositionViewFinding[] = []

  const visit = (node: CompiledCompositionPreviewNode, path: string, parent?: CompiledCompositionPreviewNode) => {
    if (parent) {
      const parentLabel = normalizeLearnerFacingLabel(parent.label)
      const childLabel = normalizeLearnerFacingLabel(node.label)
      if (parentLabel && parentLabel === childLabel) {
        findings.push({
          code: 'CPV-203',
          severity: 'error',
          nodePath: path,
          message: `Redundante Parent-Child-Kette mit gleichem learner-facing Label: ${parent.label} -> ${node.label}`,
        })
      }
    }

    node.children.forEach((child, index) => visit(child, `${path}.${index}`, node))
  }

  rootNodes.forEach((node, index) => visit(node, `${index}`))
  return findings
}

const collectSourceGoalIds = (rootNodes: CompiledCompositionPreviewNode[]): Set<string> => {
  const sourceGoalIds = new Set<string>()
  const visit = (node: CompiledCompositionPreviewNode) => {
    if (node.sourceGoalId) {
      sourceGoalIds.add(node.sourceGoalId)
    }
    node.children.forEach(visit)
  }
  rootNodes.forEach(visit)
  return sourceGoalIds
}

const collectCanonicalMathSek1RouteEndpointFindings = (
  view: ReturnType<typeof normalizeCompositionView>,
  landscape: CanonicalAuthoringLandscape | null,
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  if (view.landscapeId !== CANONICAL_DE_MATH_ID) return []
  if (view.scope.stage !== 'SekI' && view.scope.stage !== 'CrossStage') return []
  if (!landscape) return []

  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const practiceGoalIds = (goalById.get(CANONICAL_MATH_SEK1_PRACTICE_CLUSTER_ID)?.contains ?? [])
    .filter((goalId) => {
      const goal = goalById.get(goalId)
      return goal && goal.contains.length === 0
    })
  const visibleGoalIds = collectSourceGoalIds(rootNodes)
  const findings: CompositionViewFinding[] = []

  if (!visibleGoalIds.has(CANONICAL_MATH_SEK1_MOTIVATION_GOAL_ID)) {
    findings.push({
      code: 'CPV-210',
      severity: 'error',
      goalId: CANONICAL_MATH_SEK1_MOTIVATION_GOAL_ID,
      message: 'Sek-I-Route ist learner-facing nicht vollständig: Motivationsanker fehlt in der Composition View.',
    })
  }

  const missingPracticeGoalIds = practiceGoalIds.filter((goalId) => !visibleGoalIds.has(goalId))
  if (missingPracticeGoalIds.length > 0) {
    findings.push({
      code: 'CPV-211',
      severity: 'error',
      goalId: CANONICAL_MATH_SEK1_PRACTICE_CLUSTER_ID,
      message: `Sek-I-Route ist learner-facing nicht vollständig: ${missingPracticeGoalIds.length}/${practiceGoalIds.length} Übungs-/Abschlussziel(e) fehlen in der Composition View.`,
    })
  }

  return findings
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const canonicalRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical')
const compositionViewRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views')
const canonicalMathFallbackPolicy = JSON.parse(
  readFileSync(resolve(repoRoot, CANONICAL_MATH_FALLBACK_POLICY_PATH), 'utf8'),
) as {
  landscapeId?: string
  approvedDeDefaultFallbackGroups?: ApprovedCanonicalMathFallbackGroup[]
}

const collectFiles = (directory: string, predicate: (fileName: string) => boolean, target: string[] = []): string[] => {
  let entries: ReturnType<typeof readdirSync>
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return target
  }

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFiles(absolutePath, predicate, target)
      continue
    }
    if (!entry.isFile()) continue
    if (!predicate(entry.name)) continue
    target.push(absolutePath)
  }

  return target
}

const canonicalFiles = collectFiles(canonicalRoot, (fileName) => extname(fileName).toLowerCase() === '.json')
const compositionViewFiles = collectFiles(compositionViewRoot, (fileName) => /\.view\.json$/i.test(fileName))

const canonicalByLandscapeId = new Map<string, { path: string, landscape: CanonicalAuthoringLandscape }>()

for (const canonicalPath of canonicalFiles) {
  try {
    const normalized = normalizeCanonicalLandscape(JSON.parse(readFileSync(canonicalPath, 'utf8')))
    if (!normalized.landscapeId) continue
    canonicalByLandscapeId.set(normalized.landscapeId, {
      path: canonicalPath,
      landscape: normalized,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
    console.error(`❌ [canonical-load] ${canonicalPath} konnte nicht geladen werden: ${message}`)
    process.exit(1)
  }
}

const canonicalLandscapeUniverseById = new Map(
  Array.from(canonicalByLandscapeId.entries()).map(([landscapeId, match]) => [landscapeId, match.landscape]),
)
const normalizedViews: ReturnType<typeof normalizeCompositionView>[] = []

const findings: CompositionViewValidationFinding[] = []

for (const viewPath of compositionViewFiles) {
  try {
    const normalizedView = normalizeCompositionView(JSON.parse(readFileSync(viewPath, 'utf8')))
    normalizedViews.push(normalizedView)
    const canonicalMatch = canonicalByLandscapeId.get(normalizedView.landscapeId)
    const result = compileCompositionView(
      normalizedView,
      canonicalMatch?.landscape ?? null,
      null,
      canonicalLandscapeUniverseById,
    )
    const additionalFindings = [
      ...collectGenericTreeFindings(result.compiledRootNodes),
      ...(normalizedView.landscapeId === CANONICAL_DE_MATH_ID
        && CANONICAL_DE_MATH_VIEW_ID_PATTERN.test(normalizedView.viewId)
        ? collectCanonicalMathTreeFindings(result.compiledRootNodes)
        : []),
      ...collectCanonicalMathSek1RouteEndpointFindings(
        normalizedView,
        canonicalMatch?.landscape ?? null,
        result.compiledRootNodes,
      ),
    ]

    ;[...result.findings, ...additionalFindings].forEach((finding) => {
      findings.push({
        ...finding,
        viewId: normalizedView.viewId || '(missing-view-id)',
        viewPath,
        landscapeId: normalizedView.landscapeId || '(missing-landscape-id)',
      })
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
    findings.push({
      code: 'CPV-000',
      severity: 'error',
      message: `Composition View konnte nicht geladen werden: ${message}`,
      viewId: '(load-error)',
      viewPath,
      landscapeId: '(unknown)',
    })
  }
}

const canonicalMathViews = normalizedViews.filter((view) => view.landscapeId === CANONICAL_DE_MATH_ID)
const canonicalMathViewsByScopeKey = new Map<string, typeof canonicalMathViews>()
canonicalMathViews.forEach((view) => {
  const scopeKey = composeScopeKey(view.scope)
  const existing = canonicalMathViewsByScopeKey.get(scopeKey) ?? []
  existing.push(view)
  canonicalMathViewsByScopeKey.set(scopeKey, existing)
})

REQUIRED_CANONICAL_MATH_SCOPES.forEach(({ expectedViewId, scope }) => {
  const scopeKey = composeScopeKey(scope)
  const matches = canonicalMathViewsByScopeKey.get(scopeKey) ?? []

  if (matches.length === 0) {
    findings.push({
      code: 'CPV-205',
      severity: 'error',
      message: `Pflicht-Scope für kanonische Mathematik ist nicht durch eine Composition View abgedeckt: ${scopeKey}`,
      viewId: expectedViewId,
      viewPath: '(required-canonical-math-scope)',
      landscapeId: CANONICAL_DE_MATH_ID,
    })
    return
  }

  if (matches.length > 1) {
    findings.push({
      code: 'CPV-206',
      severity: 'error',
      message: `Pflicht-Scope für kanonische Mathematik wird von mehreren Composition Views belegt: ${scopeKey} -> ${matches.map((view) => view.viewId).join(', ')}`,
      viewId: expectedViewId,
      viewPath: '(required-canonical-math-scope)',
      landscapeId: CANONICAL_DE_MATH_ID,
    })
    return
  }

  if (matches[0].viewId !== expectedViewId) {
    findings.push({
      code: 'CPV-207',
      severity: 'error',
      message: `Pflicht-Scope für kanonische Mathematik löst auf unerwartete Composition View auf: erwartet ${expectedViewId}, gefunden ${matches[0].viewId}`,
      viewId: expectedViewId,
      viewPath: '(required-canonical-math-scope)',
      landscapeId: CANONICAL_DE_MATH_ID,
    })
  }
})

const approvedCanonicalMathFallbackScopes = (canonicalMathFallbackPolicy.approvedDeDefaultFallbackGroups ?? [])
  .flatMap((group) => group.jurisdictions.flatMap((jurisdiction) => (
    group.scopes.map(({ expectedViewId, ...scope }) => ({
      expectedViewId,
      rationale: group.rationale,
      scope: { ...scope, jurisdiction },
    }))
  )));

approvedCanonicalMathFallbackScopes.forEach(({ expectedViewId, rationale, scope }) => {
  const requestedScope = normalizeScopeForMatching(scope)
  const matches = canonicalMathViews
    .map((view) => ({
      viewId: view.viewId,
      scope: normalizeScopeForMatching(view.scope),
      score: scoreScopeMatch(normalizeScopeForMatching(view.scope), requestedScope),
    }))
    .filter((match): match is MathScopeMatch => match.score !== null)
    .sort((left, right) => {
      if (left.score.scopeSize !== right.score.scopeSize) {
        return right.score.scopeSize - left.score.scopeSize
      }
      if (left.score.stageFallbackCount !== right.score.stageFallbackCount) {
        return left.score.stageFallbackCount - right.score.stageFallbackCount
      }
      return left.viewId.localeCompare(right.viewId, 'de', { sensitivity: 'base' })
    })

  const bestMatch = matches[0]
  if (!bestMatch) {
    findings.push({
      code: 'CPV-208',
      severity: 'error',
      message: `Genehmigter DE-default-Fallback-Scope für kanonische Mathematik löst auf keine Composition View auf: ${composeScopeKey(scope)}`,
      viewId: expectedViewId,
      viewPath: '(approved-canonical-math-default-fallback)',
      landscapeId: CANONICAL_DE_MATH_ID,
    })
    return
  }

  if (bestMatch.viewId !== expectedViewId) {
    findings.push({
      code: 'CPV-209',
      severity: 'error',
      message: `Genehmigter DE-default-Fallback-Scope für kanonische Mathematik löst unerwartet auf: erwartet ${expectedViewId}, gefunden ${bestMatch.viewId}${rationale ? ` (${rationale})` : ''}`,
      viewId: expectedViewId,
      viewPath: '(approved-canonical-math-default-fallback)',
      landscapeId: CANONICAL_DE_MATH_ID,
    })
  }
})

findings.sort((left, right) => {
  const leftKey = `${left.severity}:${left.code}:${left.viewPath}:${left.nodePath ?? ''}:${left.goalId ?? ''}:${left.message}`
  const rightKey = `${right.severity}:${right.code}:${right.viewPath}:${right.nodePath ?? ''}:${right.goalId ?? ''}:${right.message}`
  return leftKey.localeCompare(rightKey, 'de', { numeric: true, sensitivity: 'base' })
})

for (const finding of findings) {
  const tag = finding.severity === 'error' ? '❌' : '⚠️'
  const nodePathPart = finding.nodePath ? ` [nodePath=${finding.nodePath}]` : ''
  const goalPart = finding.goalId ? ` ${finding.goalId}` : ''
  console.log(`${tag} [${finding.viewId}] [${finding.code}]${nodePathPart}${goalPart} ${finding.message} (${finding.viewPath})`)
}

const errors = findings.filter((finding) => finding.severity === 'error')
const warnings = findings.filter((finding) => finding.severity === 'warning')

if (findings.length === 0) {
  console.log(`✅ ${compositionViewFiles.length} composition view(s) passed validation.`)
} else {
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`)
}

console.log(`Validated composition views: ${compositionViewFiles.length}`)
console.log(`Canonical landscape registry size: ${canonicalByLandscapeId.size}`)

process.exit(errors.length > 0 ? 1 : 0)
