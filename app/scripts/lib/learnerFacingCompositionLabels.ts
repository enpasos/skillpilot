import type {
  CompiledCompositionPreviewNode,
  CompositionViewFinding,
} from '../../src/utils/authoring/compositionViewAuthoring'

const INTERNAL_AUTHORING_PROCESS_LABEL_PATTERN = /source[\s-]*extraction/iu
const DIRECT_PHASE_STRUCTURE_LABEL_PATTERN = /^\s*(E-Phase|Q[1-4])(?=\s*(?::|$))/iu

const normalizePhaseStructureLabel = (label: string): string | null => {
  const match = DIRECT_PHASE_STRUCTURE_LABEL_PATTERN.exec(label)
  if (!match?.[1]) return null
  return match[1].toLocaleUpperCase('de-DE')
}

export const collectDuplicateDirectPhaseStructureFindings = (
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  const findings: CompositionViewFinding[] = []

  const visit = (node: CompiledCompositionPreviewNode, path: string) => {
    const phaseStructures = new Map<string, CompiledCompositionPreviewNode[]>()

    node.children.forEach((child) => {
      if (child.kind !== 'structure') return
      const phase = normalizePhaseStructureLabel(child.label)
      if (!phase) return
      phaseStructures.set(phase, [...(phaseStructures.get(phase) ?? []), child])
    })

    phaseStructures.forEach((children, phase) => {
      if (children.length < 2) return
      findings.push({
        code: 'CPV-217',
        severity: 'error',
        nodePath: path,
        message: `Mehrere direkte ${phase}-Strukturknoten unter demselben learner-facing Parent ${node.label}: ${children.map((child) => child.label).join(' | ')}`,
      })
    })

    node.children.forEach((child, index) => visit(child, `${path}.${index}`))
  }

  rootNodes.forEach((node, index) => visit(node, `${index}`))
  return findings
}

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
