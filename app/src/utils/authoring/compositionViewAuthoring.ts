import type { GoalPlacementContext } from '../../landscapeTypes'
import {
  STATE_LOOKING_TITLE_PATTERN,
  asRecord,
  asString,
  buildCanonicalGraphIndex,
  normalizeCanonicalLandscape,
  type CanonicalAuthoringLandscape,
} from './canonicalAuthoring'

export type CompositionViewNode =
  | CompositionStructureNode
  | CompositionCanonicalSubtreeNode
  | CompositionGoalEntryNode
  | CompositionLandscapeEntryNode

export interface CompositionStructureNode extends Record<string, unknown> {
  kind: 'structure'
  id: string
  label: string
  children: CompositionViewNode[]
}

export interface CompositionCanonicalSubtreeNode extends Record<string, unknown> {
  kind: 'canonicalSubtree'
  goalId: string
  displayLabel?: string
}

export interface CompositionGoalEntryNode extends Record<string, unknown> {
  kind: 'goalEntry'
  goalId: string
  displayLabel?: string
}

export interface CompositionLandscapeEntryNode extends Record<string, unknown> {
  kind: 'landscapeEntry'
  landscapeId: string
  displayLabel?: string
}

export interface CompositionView extends Record<string, unknown> {
  viewId: string
  landscapeId: string
  scope: GoalPlacementContext
  rootNodes: CompositionViewNode[]
}

export interface CompositionViewFinding {
  code: string
  severity: 'error' | 'warning'
  message: string
  nodePath?: string
  goalId?: string
}

export interface CompiledCompositionPreviewNode {
  runtimeId: string
  kind: 'structure' | 'goal'
  label: string
  sourceGoalId?: string
  children: CompiledCompositionPreviewNode[]
}

export interface CompositionCompileResult {
  compiledRootNodes: CompiledCompositionPreviewNode[]
  findings: CompositionViewFinding[]
}

const normalizeScope = (value: unknown): GoalPlacementContext => {
  const record = asRecord(value)
  const scope: GoalPlacementContext = {}
  Object.entries(record).forEach(([key, entry]) => {
    if (typeof entry === 'string' && entry.trim() !== '') {
      scope[key] = entry
    }
  })
  return scope
}

const normalizeCompositionNode = (value: unknown, pathLabel: string): CompositionViewNode => {
  const record = asRecord(value)
  if (record.kind === 'canonicalSubtree') {
    const displayLabel = asString(record.displayLabel)
    return {
      ...record,
      kind: 'canonicalSubtree',
      goalId: asString(record.goalId),
      ...(displayLabel.trim() ? { displayLabel } : {}),
    }
  }

  if (record.kind === 'goalEntry') {
    const displayLabel = asString(record.displayLabel)
    return {
      ...record,
      kind: 'goalEntry',
      goalId: asString(record.goalId),
      ...(displayLabel.trim() ? { displayLabel } : {}),
    }
  }

  if (record.kind === 'landscapeEntry') {
    const displayLabel = asString(record.displayLabel)
    return {
      ...record,
      kind: 'landscapeEntry',
      landscapeId: asString(record.landscapeId),
      ...(displayLabel.trim() ? { displayLabel } : {}),
    }
  }

  const children = Array.isArray(record.children) ? record.children : []
  return {
    ...record,
    kind: 'structure',
    id: asString(record.id, `structure-${pathLabel}`),
    label: asString(record.label, 'New Structure'),
    children: children.map((child, index) => normalizeCompositionNode(child, `${pathLabel}-${index}`)),
  }
}

export const normalizeCompositionView = (value: unknown): CompositionView => {
  const record = asRecord(value)
  const rootNodes = Array.isArray(record.rootNodes) ? record.rootNodes : []
  return {
    ...record,
    viewId: asString(record.viewId, 'new-view'),
    landscapeId: asString(record.landscapeId),
    scope: normalizeScope(record.scope),
    rootNodes: rootNodes.map((node, index) => normalizeCompositionNode(node, `root-${index}`)),
  }
}

export const createEmptyCompositionView = (): CompositionView => ({
  viewId: 'new-view',
  landscapeId: '',
  scope: {
    schoolForm: 'Gymnasium',
  },
  rootNodes: [],
})

const getLandscapeRootGoal = (landscape: CanonicalAuthoringLandscape) =>
  landscape.goals.find((goal) => (goal.tags ?? []).includes('root')) ?? null

const isGenericStructureLabel = (label: string): boolean => {
  const normalized = label.trim().toLowerCase()
  return normalized === ''
    || normalized === 'new structure'
    || normalized === 'new node'
    || /^structure\s*\d*$/iu.test(normalized)
    || /^cluster\s*\d*$/iu.test(normalized)
    || /^node\s*\d*$/iu.test(normalized)
}

const stringifyNodePath = (path: number[]): string => (
  path.length === 0 ? 'root' : path.join('.')
)

const expandCanonicalSubtree = (
  goalId: string,
  landscape: CanonicalAuthoringLandscape,
): Set<string> => {
  const index = buildCanonicalGraphIndex(landscape)
  const expanded = new Set<string>([goalId])
  index.descendantsById.get(goalId)?.forEach((descendantId) => expanded.add(descendantId))
  return expanded
}

export const compileCompositionView = (
  view: CompositionView,
  landscape: CanonicalAuthoringLandscape | null,
  goalUniverse: CanonicalAuthoringLandscape | null = null,
  landscapeUniverseById: Map<string, CanonicalAuthoringLandscape> | null = null,
): CompositionCompileResult => {
  const findings: CompositionViewFinding[] = []
  const hasScopeDiscriminator = ['jurisdiction', 'stage', 'courseProfile']
    .some((key) => ((view.scope[key] ?? '') as string).trim())

  if (!(view.viewId ?? '').trim()) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'viewId fehlt.' })
  }
  if (!(view.landscapeId ?? '').trim()) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'landscapeId fehlt.' })
  }
  if (!(view.scope.schoolForm ?? '').trim()) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'scope.schoolForm fehlt.' })
  }
  if (!hasScopeDiscriminator) {
    findings.push({
      code: 'CPV-001',
      severity: 'error',
      message: 'Mindestens einer der Scope-Keys jurisdiction, stage oder courseProfile muss gesetzt sein.',
    })
  }
  if (view.rootNodes.length === 0) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'Keine rootNodes definiert.' })
  }

  const canonicalLandscape = landscape ? normalizeCanonicalLandscape(landscape) : null
  if (!canonicalLandscape) {
    findings.push({ code: 'CPV-001', severity: 'error', message: 'Kein kanonischer Graph geladen.' })
    return { compiledRootNodes: [], findings }
  }

  const canonicalGoalUniverse = goalUniverse ? normalizeCanonicalLandscape(goalUniverse) : canonicalLandscape

  if (view.landscapeId && canonicalLandscape.landscapeId && view.landscapeId !== canonicalLandscape.landscapeId) {
    findings.push({
      code: 'CPV-001',
      severity: 'error',
      message: `view.landscapeId (${view.landscapeId}) passt nicht zum geladenen kanonischen Graphen (${canonicalLandscape.landscapeId}).`,
    })
  }

  const index = buildCanonicalGraphIndex(canonicalGoalUniverse)
  const structureIds = new Set<string>()
  const subtreeRootsByPath = new Map<string, { goalId: string, expandedGoalIds: Set<string> }>()
  const referencedRootIds = new Map<string, string>()
  const goalOccurrenceCount = new Map<string, number>()
  const goalParentKeys = new Map<string, Set<string>>()

  const noteGoalOccurrence = (goalId: string, parentKey: string | null) => {
    goalOccurrenceCount.set(goalId, (goalOccurrenceCount.get(goalId) ?? 0) + 1)
    if (!parentKey) return
    const parents = goalParentKeys.get(goalId) ?? new Set<string>()
    parents.add(parentKey)
    goalParentKeys.set(goalId, parents)
  }

  const validateNode = (node: CompositionViewNode, path: number[]) => {
    const pathKey = stringifyNodePath(path)

    if (node.kind === 'structure') {
      if (!(node.id ?? '').trim()) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'Structure node ohne id.' })
      } else if (structureIds.has(node.id)) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: `Doppelte structure id: ${node.id}` })
      } else {
        structureIds.add(node.id)
      }

      if (!(node.label ?? '').trim()) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'Structure node ohne label.' })
      } else if (isGenericStructureLabel(node.label)) {
        findings.push({ code: 'CPV-101', severity: 'warning', nodePath: pathKey, message: 'Sehr generisches structure label.' })
      }

      if (node.children.length === 0) {
        findings.push({ code: 'CPV-007', severity: 'error', nodePath: pathKey, message: 'Leerer structure node ohne Kinder.' })
      }

      node.children.forEach((child, indexOfChild) => validateNode(child, [...path, indexOfChild]))
      return
    }

    if (node.kind === 'landscapeEntry') {
      if (!(node.landscapeId ?? '').trim()) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'landscapeEntry ohne landscapeId.' })
        return
      }

      if (!landscapeUniverseById) {
        return
      }

      const referencedLandscape = landscapeUniverseById.get(node.landscapeId)
      if (!referencedLandscape) {
        findings.push({
          code: 'CPV-002',
          severity: 'error',
          nodePath: pathKey,
          message: `Fehlende kanonische Landscape-Referenz: ${node.landscapeId}`,
        })
        return
      }

      const rootGoal = getLandscapeRootGoal(referencedLandscape)
      if (!rootGoal) {
        findings.push({
          code: 'CPV-002',
          severity: 'error',
          nodePath: pathKey,
          message: `Referenzierte Landscape ${node.landscapeId} hat keinen Root-Knoten.`,
        })
      }
      return
    }

    if (node.kind === 'goalEntry') {
      if (!(node.goalId ?? '').trim()) {
        findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'goalEntry ohne goalId.' })
        return
      }

      const referencedGoal = index.goalById.get(node.goalId)
      if (!referencedGoal) {
        findings.push({
          code: 'CPV-002',
          severity: 'error',
          nodePath: pathKey,
          goalId: node.goalId,
          message: `Fehlende kanonische Ziel-Referenz: ${node.goalId}`,
        })
        return
      }

      if (STATE_LOOKING_TITLE_PATTERN.test(referencedGoal.title)) {
        findings.push({
          code: 'CPV-102',
          severity: 'warning',
          nodePath: pathKey,
          goalId: node.goalId,
          message: 'Referenziertes kanonisches Ziel wirkt noch phasen- oder landesspezifisch benannt.',
        })
      }
      return
    }

    if (!(node.goalId ?? '').trim()) {
      findings.push({ code: 'CPV-001', severity: 'error', nodePath: pathKey, message: 'canonicalSubtree ohne goalId.' })
      return
    }

    const referencedGoal = index.goalById.get(node.goalId)
    if (!referencedGoal) {
      findings.push({ code: 'CPV-002', severity: 'error', nodePath: pathKey, goalId: node.goalId, message: `Fehlender kanonischer Root: ${node.goalId}` })
      return
    }

    if (STATE_LOOKING_TITLE_PATTERN.test(referencedGoal.title)) {
      findings.push({ code: 'CPV-102', severity: 'warning', nodePath: pathKey, goalId: node.goalId, message: 'Referenzierter kanonischer Root wirkt noch phasen- oder landesspezifisch benannt.' })
    }

    const previousPathForSameRoot = referencedRootIds.get(node.goalId)
    if (previousPathForSameRoot) {
      findings.push({
        code: 'CPV-004',
        severity: 'error',
        nodePath: pathKey,
        goalId: node.goalId,
        message: `Derselbe kanonische Root (${node.goalId}) ist bereits unter ${previousPathForSameRoot} referenziert.`,
      })
    } else {
      referencedRootIds.set(node.goalId, pathKey)
    }

    subtreeRootsByPath.set(pathKey, {
      goalId: node.goalId,
      expandedGoalIds: expandCanonicalSubtree(node.goalId, canonicalGoalUniverse),
    })
  }

  view.rootNodes.forEach((node, indexOfNode) => validateNode(node, [indexOfNode]))

  const subtreeEntries = Array.from(subtreeRootsByPath.entries())
  for (let leftIndex = 0; leftIndex < subtreeEntries.length; leftIndex += 1) {
    const [leftPath, leftEntry] = subtreeEntries[leftIndex]
    for (let rightIndex = leftIndex + 1; rightIndex < subtreeEntries.length; rightIndex += 1) {
      const [rightPath, rightEntry] = subtreeEntries[rightIndex]
      const overlap = Array.from(leftEntry.expandedGoalIds).filter((goalId) => rightEntry.expandedGoalIds.has(goalId))
      if (overlap.length === 0) continue
      findings.push({
        code: 'CPV-004',
        severity: 'error',
        nodePath: `${leftPath} <> ${rightPath}`,
        message: `Überlappende kanonische Teilbäume (${leftEntry.goalId} / ${rightEntry.goalId}); gemeinsame Ziele: ${overlap.slice(0, 5).join(', ')}${overlap.length > 5 ? ' ...' : ''}`,
      })
    }
  }

  const compileGoalSubtree = (
    goalId: string,
    parentKey: string | null,
    pathKey: string,
    displayLabel?: string,
  ): CompiledCompositionPreviewNode | null => {
    const goal = index.goalById.get(goalId)
    if (!goal) return null
    noteGoalOccurrence(goal.id, parentKey)
    const runtimeId = `${pathKey}/goal:${goal.id}`
    return {
      runtimeId,
      kind: 'goal',
      label: displayLabel?.trim() || goal.title,
      sourceGoalId: goal.id,
      children: (index.childrenById.get(goal.id) ?? [])
        .map((childId) => compileGoalSubtree(childId, goal.id, `${runtimeId}/${childId}`))
        .filter((child): child is CompiledCompositionPreviewNode => child !== null),
    }
  }

  const compileNode = (
    node: CompositionViewNode,
    parentKey: string | null,
    path: number[],
  ): CompiledCompositionPreviewNode | null => {
    const pathKey = stringifyNodePath(path)
    if (node.kind === 'structure') {
      const runtimeId = `structure:${node.id || pathKey}`
      return {
        runtimeId,
        kind: 'structure',
        label: node.label,
        children: node.children
          .map((child, indexOfChild) => compileNode(child, runtimeId, [...path, indexOfChild]))
          .filter((child): child is CompiledCompositionPreviewNode => child !== null),
      }
    }

    if (node.kind === 'landscapeEntry') {
      const referencedLandscape = landscapeUniverseById?.get(node.landscapeId)
      const rootGoal = referencedLandscape ? getLandscapeRootGoal(referencedLandscape) : null
      if (rootGoal?.id) {
        noteGoalOccurrence(rootGoal.id, parentKey)
      }
      return {
        runtimeId: `landscape:${pathKey}`,
        kind: 'goal',
        label: node.displayLabel?.trim() || rootGoal?.title || referencedLandscape?.title || node.landscapeId,
        sourceGoalId: rootGoal?.id,
        children: [],
      }
    }

    if (node.kind === 'goalEntry') {
      const goal = index.goalById.get(node.goalId)
      if (!goal) return null
      noteGoalOccurrence(goal.id, parentKey)
      return {
        runtimeId: `goalEntry:${pathKey}`,
        kind: 'goal',
        label: node.displayLabel?.trim() || goal.title,
        sourceGoalId: goal.id,
        children: [],
      }
    }

    return compileGoalSubtree(node.goalId, parentKey, pathKey, node.displayLabel)
  }

  const compiledRootNodes = view.rootNodes
    .map((node, indexOfNode) => compileNode(node, null, [indexOfNode]))
    .filter((node): node is CompiledCompositionPreviewNode => node !== null)

  goalOccurrenceCount.forEach((count, goalId) => {
    if (count > 1) {
      findings.push({
        code: 'CPV-005',
        severity: 'error',
        goalId,
        message: `Kanonisches Ziel erscheint mehrfach im kompilierten Baum: ${goalId}`,
      })
    }
  })

  goalParentKeys.forEach((parents, goalId) => {
    if (parents.size > 1) {
      findings.push({
        code: 'CPV-006',
        severity: 'error',
        goalId,
        message: `Kanonisches Ziel hat mehr als einen sichtbaren Parent im kompilierten Baum: ${goalId}`,
      })
    }
  })

  return {
    compiledRootNodes,
    findings: findings.sort((left, right) => {
      const leftKey = `${left.severity}:${left.code}:${left.nodePath ?? ''}:${left.goalId ?? ''}:${left.message}`
      const rightKey = `${right.severity}:${right.code}:${right.nodePath ?? ''}:${right.goalId ?? ''}:${right.message}`
      return leftKey.localeCompare(rightKey, 'de', { numeric: true, sensitivity: 'base' })
    }),
  }
}
