const EXTENSION_VIEW_SCHEMA = 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json'

export class UnsupportedCompositionViewFormatError extends Error {}

function includesExtension(nodes: unknown): boolean {
  return Array.isArray(nodes) && nodes.some(node =>
    node && typeof node === 'object' && node.kind === 'structure'
      && ('extension' in node || includesExtension(node.children)),
  )
}

/** Elective-extension views require the backend's learner projection. */
export function assertSupportedCompositionViewFormat(view: unknown, context?: string): void {
  if (!view || typeof view !== 'object') return
  if (('viewFormatVersion' in view && view.viewFormatVersion === '1.3')
      || ('$schema' in view && view.$schema === EXTENSION_VIEW_SCHEMA)
      || 'electionGroups' in view
      || ('rootNodes' in view && includesExtension(view.rootNodes))) {
    const message = 'composition view format 1.3 is unsupported'
    throw new UnsupportedCompositionViewFormatError(context ? `${context}: ${message}` : message)
  }
}

/** Standalone packages currently transport authored personalization flow version 1. */
export function assertSupportedPersonalizationFlowFormat(landscape: unknown, context = 'Landscape'): void {
  if (!landscape || typeof landscape !== 'object' || !('personalizationFlow' in landscape)) return
  const flow = landscape.personalizationFlow
  if (!flow || typeof flow !== 'object') return
  if (('version' in flow && flow.version === '2')
      || ('stages' in flow && Array.isArray(flow.stages) && flow.stages.some(stage =>
        stage && typeof stage === 'object' && 'groupSource' in stage,
      ))) {
    throw new Error(`${context}: personalization flow version 2 is unsupported`)
  }
}
