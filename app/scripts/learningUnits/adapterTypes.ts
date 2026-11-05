import type { GoalPlacement, ProgramUnit } from '../../src/landscapeTypes'
import type { MathGoal } from '../learningUnitsMathAuthoring'

/** Authored JSON shapes at the existing checked script boundaries. */
export interface ContractRef { contractId: string; revision: string }
export interface UnitDefinition extends ContractRef {
  ownGoalIds: string[]; ownAssessmentGoalIds: string[]; ownRecallGoalIds: string[]
  ownOrientationGoalIds: string[]; requiredChildContractRefs: ContractRef[]
  sourceBinding: { programUnitId: string; placementRevision: string }
  [key: string]: unknown
}
export interface ContractEntry {
  path: string; sha256: string; inputs: Record<string, string>
  assessmentInputs?: Record<string, AssessmentInput>; [key: string]: unknown
}
export interface AssessmentInput { taskPath: string; rubricPath: string; [key: string]: unknown }
export interface UnitCatalog {
  schemaVersion: number; contracts: ContractEntry[]
  currentOfferBinding?: { path: string; sha256: string }; [key: string]: unknown
}
export interface MathSource {
  landscapeId: string; goals: MathGoal[]; programUnits: ProgramUnit[]; goalPlacements: GoalPlacement[]
}
export interface OfferScope extends Record<string, unknown> {
  rootLandscapeId: string; landscapeId: string; schoolForm: string; jurisdiction: string; stage: string
  durationModel: string | null; courseProfile: string | null
}
export interface OfferRow {
  scope: OfferScope; coverage: string; compositionViewIds: string[]; inputPaths: string[]
  targetSetSha256: string; prerequisiteOnlySetSha256: string; rootContractRefs: ContractRef[]
}
export interface OfferBinder {
  revision: string; offers: OfferRow[]; inputs: Record<string, string>; reviewRef: string
  [key: string]: unknown
}
export interface SelectionConfig {
  schemaVersion: number; revision: string; reviewRef: string; reviewReceiptPath: string
  rootSelections: Array<ContractRef & { scopeIds: string[] }>
}
export interface NativeReadModel {
  calculationStatus: string
  offerBinding: { status: string; revision: string; scopeKey: Partial<OfferScope>; rootContractRefs: ContractRef[] }
  units: Array<ContractRef & { ownGoalIds?: string[] }>
}
export interface NativeRow {
  scopeId: string; projectionResolved: boolean; prerequisiteCompilationResolved: boolean
  offeredByNativePlanner: boolean; declaredByRepositoryGui: boolean
  targetAtomicGoalIds: string[]; prerequisiteOnlyGoalIds: string[]; atomicPrerequisites: Record<string, string[]>
  requestedCompositionScope: Partial<OfferScope>
  personalCurriculum?: Record<string, { filterId?: string }>
  compositionViewIds: string[]; resolvedSubjectViews: Record<string, { mergedFromViewIds?: string[] }>
  assessmentGoalIds: string[]; recallGoalIds: string[]; orientationGoalIds: string[]
  duplicateVisibleGoalPaths: Record<string, string[]>; missingVisibleGoalIds: string[]; visibleGoalPaths: Record<string, string[]>
  nativeOfferContext: { targetIds: string[]; prerequisiteOnlyIds: string[]; scopeKey: OfferScope }
  learningUnitReadModel: NativeReadModel
}
export interface UnitEvaluation extends ContractRef {
  ownRecallGoalIds: string[]; ownOrdinaryGoalIds: string[]; ownAssessmentGoalIds: string[]
  globalRecognitionAfterOwnQPass: string[]
  ownQPassUnitResult: { complete: boolean; explicitTargetCount: number; recognizedTargetCount: number }
  onlyOrdinaryExplicitUnitResult: { complete: boolean; pendingGoalIds: string[] }
}
export interface NativeReport {
  schemaVersion: number; scopes: NativeRow[]; plannerScopeIds: string[]; declaredScopeIds: string[]
  nativeMapperInputSha256: Record<string, string>; discoveryFailures: unknown[]
  learningUnitCatalogQuarantines: Record<string, string>; globalRecognitionAtEmptyMastery: string[]
  actualContractEvaluations: UnitEvaluation[]; [key: string]: unknown
}
export interface SemanticLedger {
  decisions: Array<{ goalId: string; semanticKind: string; sourceFingerprint?: string; [key: string]: unknown }>
  counts: Record<string, number>
}
export interface OfferReviewReceipt {
  schemaVersion: number; semantics: string; decision: string; independentReviewer: string
  reviewedInputSha256: string; reviewPath: string
}
