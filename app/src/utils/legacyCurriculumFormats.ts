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
      || 'historicalAssessmentPlacements' in view
      || ('rootNodes' in view && includesExtension(view.rootNodes))) {
    const message = 'composition view format 1.3 is unsupported'
    throw new UnsupportedCompositionViewFormatError(context ? `${context}: ${message}` : message)
  }
}
