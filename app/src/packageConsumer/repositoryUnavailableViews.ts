// Repository authoring and QA routes are deliberately absent from package
// consumer builds. Named no-op exports keep the shared route module type-safe
// while the package source-policy plugin prevents the real modules from
// entering the Rollup graph at all.
export const UsersView = () => null
export const WorkbenchView = () => null
export const FlashcardEditorView = () => null
export const GraphEditorView = () => null
export const CanonicalClusterEditorView = () => null
export const CompositionViewEditorView = () => null
export const SemanticAtomicityReviewView = () => null
export const GoalVisualizationQaView = () => null
export const CurriculumQualityDashboardView = () => null
export const CurriculumMappingWorkbenchView = () => null
