import type {
  CompiledCompositionPreviewNode,
  CompositionViewFinding,
} from '../../src/utils/authoring/compositionViewAuthoring'

const INTERNAL_AUTHORING_PROCESS_LABEL_PATTERN = /source[\s-]*extraction/iu

export const collectLearnerFacingCompositionLabelFindings = (
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  const findings: CompositionViewFinding[] = []

  const visit = (node: CompiledCompositionPreviewNode, path: string) => {
    if (INTERNAL_AUTHORING_PROCESS_LABEL_PATTERN.test(node.label)) {
      findings.push({
        code: 'CPV-216',
        severity: 'error',
        nodePath: path,
        message: `Interne Autorenprozess-Bezeichnung im learner-facing Baum: ${node.label}`,
      })
    }

    node.children.forEach((child, index) => visit(child, `${path}.${index}`))
  }

  rootNodes.forEach((node, index) => visit(node, `${index}`))
  return findings
}
