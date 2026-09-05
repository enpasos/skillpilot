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
import {
  collectDuplicateDirectPhaseStructureFindings,
  collectLearnerFacingCompositionLabelFindings,
} from './lib/learnerFacingCompositionLabels'
import {
  collectCanonicalMathSek1ReviewedExamRouteFindings,
  hasUnavailableCurricularAtomicAssessmentPrerequisite,
} from './lib/canonicalMathSek1ReviewedExamRoutes'

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
const CANONICAL_MATH_MODULE_ID = 'c01b1ce9-a667-4a46-b251-ec33ae602b15'
const CANONICAL_MATH_SEK1_MOTIVATION_GOAL_ID = '65365dce-f33f-49d8-9516-42f75883aa86'
const CANONICAL_MATH_SEK2_MOTIVATION_GOAL_ID = '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'
const CANONICAL_MATH_SEK2_TERMINAL_CLUSTER_IDS = [
  '28b45b93-11e1-5a96-97a1-4cfee171802b',
  'c25158fc-4860-59b2-8ef0-dca355f3a8b1',
  '14b19ee4-364e-50bd-b6a3-499471356ef3',
  'f24096c6-6ca0-5c15-a2f5-7bdaec789a8d',
  '57f07e66-800c-5f7e-99ab-11dd6e520eb1',
  'd2560dc7-f29a-5e51-ba8c-ec2ca0fb8cc1',
]
const CANONICAL_MATH_SEK1_LEGACY_PRACTICE_CLUSTER_ID = 'bfc4fe23-bfa4-4836-9bd2-793f4305d682'
const CANONICAL_MATH_FALLBACK_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/canonical-math-composition-fallback-policy.json'
const CANONICAL_DE_MATH_VIEW_ID_PATTERN = /^de-de-gym-(?:seki|sekii-math-(?:gk|lk)|math-(?:gk|lk))$/u
const CANONICAL_MATH_SEK1_EXAM_FOLDER_IDS_BY_YEAR: Record<string, string> = {
  '5': '81c8da58-9258-488e-9ab8-48500ab31652',
  '6': '7a2a5706-aff4-4fd0-b092-1779d6ecbc1f',
  '7': '811d6d09-130e-47b2-aba8-a5c401fe3251',
  '8': '5fb3ee61-059c-47f4-8c6f-7285d7982a41',
  '9': 'f6c9c2b8-3dbd-4839-972f-c60f33c44b63',
  '10': 'cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8',
}
const CANONICAL_MATH_SEK1_YEAR_ANCHOR_IDS_BY_YEAR: Record<string, string> = {
  '5': '6377e1e3-8c26-4cf1-997d-8802690d74dd',
  '6': '8f7bb79b-f014-4bb6-8dce-7e3f1c92e893',
  '7': '5a7095a2-2b3a-48bf-9536-eca79ee5ff8c',
  '8': 'd64516eb-9dd2-4808-91d0-0040ccdc281f',
  '9': '902de188-6f27-47c2-ace1-9b2c5771fde8',
  '10': '845f2a2c-e6aa-4991-8a12-645b8a9f70fe',
}
const CANONICAL_MATH_SEK1_G8_EXAM_YEARS = ['5', '6', '7', '8', '9'] as const
const CANONICAL_MATH_SEK1_G9_EXAM_YEARS = ['5', '6', '7', '8', '9', '10'] as const
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

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const isCanonicalMathSek1LearnerScope = (view: ReturnType<typeof normalizeCompositionView>): boolean => (
  view.landscapeId === CANONICAL_DE_MATH_ID
  && (view.scope.stage === 'SekI' || view.scope.stage === 'CrossStage')
)

const isCanonicalMathSek2LearnerScope = (view: ReturnType<typeof normalizeCompositionView>): boolean => (
  view.landscapeId === CANONICAL_DE_MATH_ID
  && (view.scope.stage === 'SekII' || view.scope.stage === 'CrossStage')
)

const expectedCanonicalMathSek1ExamYears = (view: ReturnType<typeof normalizeCompositionView>): readonly string[] => (
  view.scope.durationModel === 'G8'
    ? CANONICAL_MATH_SEK1_G8_EXAM_YEARS
    : CANONICAL_MATH_SEK1_G9_EXAM_YEARS
)

const collectCanonicalMathSek1ExamStructureFindings = (
  landscape: CanonicalAuthoringLandscape,
): CompositionViewFinding[] => {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const findings: CompositionViewFinding[] = []
  const allTaskGoalIds: string[] = []

  const moduleGoal = goalById.get(CANONICAL_MATH_MODULE_ID)
  if ((moduleGoal?.contains ?? []).includes(CANONICAL_MATH_SEK1_LEGACY_PRACTICE_CLUSTER_ID)) {
    findings.push({
      code: 'CPV-212',
      severity: 'error',
      goalId: CANONICAL_MATH_MODULE_ID,
      message: 'Kanonische Gymnasium-Mathematik darf den alten Sek-I-Übungscluster nicht mehr als learner-facing Hauptzweig enthalten.',
    })
  }

  Object.entries(CANONICAL_MATH_SEK1_EXAM_FOLDER_IDS_BY_YEAR).forEach(([year, folderId]) => {
    const folder = goalById.get(folderId)
    const expectedTitle = `Prüfungen Jahrgangsstufe ${year}`
    if (!folder) {
      findings.push({
        code: 'CPV-212',
        severity: 'error',
        goalId: folderId,
        message: `Sek-I-Prüfungsordner für Jahrgangsstufe ${year} fehlt im kanonischen Mathematikgraphen.`,
      })
      return
    }

    if (folder.title !== expectedTitle) {
      findings.push({
        code: 'CPV-212',
        severity: 'error',
        goalId: folderId,
        message: `Sek-I-Prüfungsordner für Jahrgangsstufe ${year} hat unerwarteten Titel: ${folder.title}`,
      })
    }

    if (folder.type !== 'cluster' || folder.contains.length === 0) {
      findings.push({
        code: 'CPV-212',
        severity: 'error',
        goalId: folderId,
        message: `Sek-I-Prüfungsordner für Jahrgangsstufe ${year} muss ein Cluster mit einzelnen Aufgabenknoten sein.`,
      })
    }

    if (folder.requires.length > 0) {
      findings.push({
        code: 'CPV-212',
        severity: 'error',
        goalId: folderId,
        message: `Sek-I-Prüfungsordner für Jahrgangsstufe ${year} darf keine direkten prerequisites tragen; diese gehören auf die Aufgabenknoten.`,
      })
    }

    const yearAnchorId = CANONICAL_MATH_SEK1_YEAR_ANCHOR_IDS_BY_YEAR[year]
    const yearAnchor = goalById.get(yearAnchorId)
    if (!(yearAnchor?.contains ?? []).includes(folderId)) {
      findings.push({
        code: 'CPV-212',
        severity: 'error',
        goalId: yearAnchorId,
        message: `Kanonischer Jahrgangsanker ${year} enthält den Prüfungsordner ${folderId} nicht.`,
      })
    }

    folder.contains.forEach((taskId) => {
      const task = goalById.get(taskId)
      if (!task) {
        findings.push({
          code: 'CPV-212',
          severity: 'error',
          goalId: taskId,
          message: `Sek-I-Prüfungsordner ${expectedTitle} enthält fehlenden Aufgabenknoten ${taskId}.`,
        })
        return
      }

      allTaskGoalIds.push(taskId)
      if (task.type !== 'atomic' || task.contains.length > 0) {
        findings.push({
          code: 'CPV-212',
          severity: 'error',
          goalId: taskId,
          message: `Sek-I-Prüfungsaufgabe ${taskId} muss ein atomarer Leaf-Knoten sein.`,
        })
      }

      if (task.nodeKind !== 'exam') {
        findings.push({
          code: 'CPV-212',
          severity: 'error',
          goalId: taskId,
          message: `Sek-I-Prüfungsaufgabe ${taskId} muss nodeKind="exam" tragen.`,
        })
      }

      const examData = task.examData
      if (
        !isRecord(examData)
        || typeof examData.taskContent !== 'string'
        || examData.taskContent.trim() === ''
        || typeof examData.solutionContent !== 'string'
        || examData.solutionContent.trim() === ''
        || !isRecord(examData.scoring)
      ) {
        findings.push({
          code: 'CPV-212',
          severity: 'error',
          goalId: taskId,
          message: `Sek-I-Prüfungsaufgabe ${taskId} braucht examData mit taskContent, solutionContent und scoring.`,
        })
      }

      task.requires.forEach((prerequisiteId) => {
        const prerequisite = goalById.get(prerequisiteId)
        if (!prerequisite) {
          findings.push({
            code: 'CPV-212',
            severity: 'error',
            goalId: taskId,
            message: `Sek-I-Prüfungsaufgabe ${taskId} hat fehlendes prerequisite ${prerequisiteId}.`,
          })
          return
        }
        if (prerequisite.contains.length > 0) {
          findings.push({
            code: 'CPV-212',
            severity: 'error',
            goalId: taskId,
            message: `Sek-I-Prüfungsaufgabe ${taskId} darf kein Cluster-prerequisite verwenden: ${prerequisiteId}.`,
          })
        }
      })
    })
  })

  const duplicatedTaskGoalIds = allTaskGoalIds
    .filter((taskId, index) => allTaskGoalIds.indexOf(taskId) !== index)
  if (duplicatedTaskGoalIds.length > 0) {
    findings.push({
      code: 'CPV-212',
      severity: 'error',
      goalId: duplicatedTaskGoalIds[0],
      message: `Sek-I-Prüfungsaufgaben sind mehrfach unter Jahrgangsordnern eingehängt: ${Array.from(new Set(duplicatedTaskGoalIds)).join(', ')}`,
    })
  }

  return findings
}

const collectCanonicalMathSek1ExamVisibilityFindings = (
  view: ReturnType<typeof normalizeCompositionView>,
  landscape: CanonicalAuthoringLandscape | null,
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  if (!isCanonicalMathSek1LearnerScope(view)) return []
  if (!landscape) return []

  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const visibleGoalIds = collectSourceGoalIds(rootNodes)
  const curricularAtomicGoalIds = new Set(landscape.goals
    .filter((goal) => goal.semanticKind === 'curricularAtomic')
    .map((goal) => goal.id))
  const findings: CompositionViewFinding[] = []

  if (!visibleGoalIds.has(CANONICAL_MATH_SEK1_MOTIVATION_GOAL_ID)) {
    findings.push({
      code: 'CPV-210',
      severity: 'error',
      goalId: CANONICAL_MATH_SEK1_MOTIVATION_GOAL_ID,
      message: 'Sek-I-Route ist learner-facing nicht vollständig: Motivationsanker fehlt in der Composition View.',
    })
  }

  if (visibleGoalIds.has(CANONICAL_MATH_SEK1_LEGACY_PRACTICE_CLUSTER_ID)) {
    findings.push({
      code: 'CPV-213',
      severity: 'error',
      goalId: CANONICAL_MATH_SEK1_LEGACY_PRACTICE_CLUSTER_ID,
      message: 'Sek-I-Route verwendet noch den alten learner-facing Sammelzweig `Übungen Sekundarstufe I`.',
    })
  }

  expectedCanonicalMathSek1ExamYears(view).forEach((year) => {
    const folderId = CANONICAL_MATH_SEK1_EXAM_FOLDER_IDS_BY_YEAR[year]
    const folder = goalById.get(folderId)
    if (!visibleGoalIds.has(folderId)) {
      findings.push({
        code: 'CPV-211',
        severity: 'error',
        goalId: folderId,
        message: `Sek-I-Route ist learner-facing nicht vollständig: Prüfungsordner für Jahrgangsstufe ${year} fehlt in der Composition View.`,
      })
      return
    }

    const missingTaskGoalIds = (folder?.contains ?? [])
      .filter((taskId) => !visibleGoalIds.has(taskId))
      .filter((taskId) => !hasUnavailableCurricularAtomicAssessmentPrerequisite(
        goalById.get(taskId),
        curricularAtomicGoalIds,
        visibleGoalIds,
      ))
    if (missingTaskGoalIds.length > 0) {
      findings.push({
        code: 'CPV-211',
        severity: 'error',
        goalId: folderId,
        message: `Sek-I-Route ist learner-facing nicht vollständig: ${missingTaskGoalIds.length} Aufgabenknoten unter Prüfungen Jahrgangsstufe ${year} fehlen in der Composition View.`,
      })
    }
  })

  return findings
}

const collectCanonicalMathSek2RouteEndpointVisibilityFindings = (
  view: ReturnType<typeof normalizeCompositionView>,
  landscape: CanonicalAuthoringLandscape | null,
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  if (!isCanonicalMathSek2LearnerScope(view) || !landscape) return []

  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const visibleGoalIds = collectSourceGoalIds(rootNodes)
  const findings: CompositionViewFinding[] = []

  if (!visibleGoalIds.has(CANONICAL_MATH_SEK2_MOTIVATION_GOAL_ID)) {
    findings.push({
      code: 'CPV-214',
      severity: 'error',
      goalId: CANONICAL_MATH_SEK2_MOTIVATION_GOAL_ID,
      message: 'Sek-II-Route ist learner-facing nicht vollständig: stufenspezifischer Motivationsanker fehlt in der Composition View.',
    })
  }

  const configuredTerminalIds = CANONICAL_MATH_SEK2_TERMINAL_CLUSTER_IDS.flatMap((clusterId) =>
    goalById.get(clusterId)?.contains ?? [])
  const visibleTerminalIds = configuredTerminalIds.filter((goalId) => visibleGoalIds.has(goalId))
  if (visibleTerminalIds.length === 0) {
    findings.push({
      code: 'CPV-215',
      severity: 'error',
      message: 'Sek-II-Route ist learner-facing nicht vollständig: kein atomarer terminaler Autonomie-/Prüfungsendpunkt ist in der Composition View sichtbar.',
    })
  }

  return findings
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const canonicalRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical')
const compositionViewRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views')
const semanticKindLedgerRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/quality/release-model')
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
const semanticKindLedgerFiles = collectFiles(
  semanticKindLedgerRoot,
  (fileName) => /\.semantic-kinds\.json$/i.test(fileName),
)

const semanticKindsByLandscapeId = new Map<string, Map<string, string>>()

for (const ledgerPath of semanticKindLedgerFiles) {
  try {
    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8')) as {
      sourceLandscapeId?: string
      decisions?: Array<{
        goalId?: string
        semanticKind?: string
        decisionStatus?: string
      }>
    }
    const landscapeId = ledger.sourceLandscapeId?.trim() ?? ''
    if (!landscapeId) {
      throw new Error('sourceLandscapeId fehlt')
    }
    if (semanticKindsByLandscapeId.has(landscapeId)) {
      throw new Error(`Mehr als ein Semantic-Kind-Ledger für Landscape ${landscapeId}`)
    }

    const semanticKindByGoalId = new Map<string, string>()
    for (const decision of ledger.decisions ?? []) {
      const goalId = decision.goalId?.trim() ?? ''
      const semanticKind = decision.semanticKind?.trim() ?? ''
      if (!goalId || !semanticKind || decision.decisionStatus !== 'authoritative') {
        throw new Error('Semantic-Kind-Entscheidungen müssen vollständig und authoritative sein')
      }
      if (semanticKindByGoalId.has(goalId)) {
        throw new Error(`Doppelte Semantic-Kind-Entscheidung für ${goalId}`)
      }
      semanticKindByGoalId.set(goalId, semanticKind)
    }
    semanticKindsByLandscapeId.set(landscapeId, semanticKindByGoalId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
    console.error(`❌ [semantic-kind-ledger-load] ${ledgerPath} konnte nicht geladen werden: ${message}`)
    process.exit(1)
  }
}

const canonicalByLandscapeId = new Map<string, { path: string, landscape: CanonicalAuthoringLandscape }>()

for (const canonicalPath of canonicalFiles) {
  try {
    const normalized = normalizeCanonicalLandscape(JSON.parse(readFileSync(canonicalPath, 'utf8')))
    if (!normalized.landscapeId) continue
    const semanticKindByGoalId = semanticKindsByLandscapeId.get(normalized.landscapeId)
    if (semanticKindByGoalId) {
      const canonicalGoalIds = new Set(normalized.goals.map((goal) => goal.id))
      const missingDecisionIds = normalized.goals
        .filter((goal) => !semanticKindByGoalId.has(goal.id))
        .map((goal) => goal.id)
      const unknownDecisionIds = Array.from(semanticKindByGoalId.keys())
        .filter((goalId) => !canonicalGoalIds.has(goalId))
      if (missingDecisionIds.length > 0 || unknownDecisionIds.length > 0) {
        throw new Error(
          `Semantic-Kind-Ledger ist nicht deckungsgleich (fehlend: ${missingDecisionIds.slice(0, 5).join(', ') || '-'}; unbekannt: ${unknownDecisionIds.slice(0, 5).join(', ') || '-'})`,
        )
      }
    }
    const landscape = semanticKindByGoalId
      ? {
          ...normalized,
          goals: normalized.goals.map((goal) => ({
            ...goal,
            semanticKind: semanticKindByGoalId.get(goal.id) ?? goal.semanticKind,
          })),
        }
      : normalized
    canonicalByLandscapeId.set(normalized.landscapeId, {
      path: canonicalPath,
      landscape,
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
const canonicalGoalOwnerById = new Map<string, string>()
const canonicalGoalUniverseGoals = Array.from(canonicalByLandscapeId.entries())
  .sort(([leftLandscapeId], [rightLandscapeId]) => leftLandscapeId.localeCompare(rightLandscapeId))
  .flatMap(([landscapeId, match]) => match.landscape.goals.map((goal) => {
    const previousOwner = canonicalGoalOwnerById.get(goal.id)
    if (previousOwner) {
      throw new Error(
        `Kanonische Ziel-ID ${goal.id} ist nicht global eindeutig (${previousOwner} / ${landscapeId}).`,
      )
    }
    canonicalGoalOwnerById.set(goal.id, landscapeId)
    return goal
  }))
const canonicalGoalUniverse: CanonicalAuthoringLandscape = {
  landscapeId: 'de-gymnasium-global-canonical-goal-universe',
  title: 'Globales kanonisches Zieluniversum Gymnasium DE',
  goals: canonicalGoalUniverseGoals,
}
const normalizedViews: ReturnType<typeof normalizeCompositionView>[] = []

const findings: CompositionViewValidationFinding[] = []
const canonicalMathMatch = canonicalByLandscapeId.get(CANONICAL_DE_MATH_ID)

if (canonicalMathMatch) {
  collectCanonicalMathSek1ExamStructureFindings(canonicalMathMatch.landscape).forEach((finding) => {
    findings.push({
      ...finding,
      viewId: '(canonical-math-sek1-exam-structure)',
      viewPath: canonicalMathMatch.path,
      landscapeId: CANONICAL_DE_MATH_ID,
    })
  })
  collectCanonicalMathSek1ReviewedExamRouteFindings(canonicalMathMatch.landscape).forEach((finding) => {
    findings.push({
      ...finding,
      viewId: '(canonical-math-sek1-reviewed-exam-routes)',
      viewPath: canonicalMathMatch.path,
      landscapeId: CANONICAL_DE_MATH_ID,
    })
  })
}

for (const viewPath of compositionViewFiles) {
  try {
    const normalizedView = normalizeCompositionView(JSON.parse(readFileSync(viewPath, 'utf8')))
    normalizedViews.push(normalizedView)
    const canonicalMatch = canonicalByLandscapeId.get(normalizedView.landscapeId)
    const result = compileCompositionView(
      normalizedView,
      canonicalMatch?.landscape ?? null,
      canonicalGoalUniverse,
      canonicalLandscapeUniverseById,
    )
    const additionalFindings = [
      ...collectGenericTreeFindings(result.compiledRootNodes),
      ...collectDuplicateDirectPhaseStructureFindings(result.compiledRootNodes),
      ...collectLearnerFacingCompositionLabelFindings(result.compiledRootNodes),
      ...(normalizedView.landscapeId === CANONICAL_DE_MATH_ID
        && CANONICAL_DE_MATH_VIEW_ID_PATTERN.test(normalizedView.viewId)
        ? collectCanonicalMathTreeFindings(result.compiledRootNodes)
        : []),
      ...collectCanonicalMathSek1ExamVisibilityFindings(
        normalizedView,
        canonicalMatch?.landscape ?? null,
        result.compiledRootNodes,
      ),
      ...collectCanonicalMathSek2RouteEndpointVisibilityFindings(
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
