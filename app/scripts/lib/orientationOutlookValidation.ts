import type { HardRouteSemanticKind } from './hardLearningRouteValidation'

export interface OrientationOutlookGoal {
  id: string
  title?: string
  type?: string
  nodeKind?: string
  tags?: string[]
  contains?: string[]
  requires?: string[]
  extendedData?: Record<string, unknown>
}

export interface OrientationOutlookFinding {
  orientationGoalId: string
  pathId?: string
  message: string
}

export interface OrientationOutlookProfile<TGoal extends OrientationOutlookGoal> {
  orientationGoalId: string
  scopeLabel: string
  stageGoalSelector: (goal: TGoal) => boolean
}

const INTERNAL_AUTHORING_PROCESS_LABEL_PATTERN = /source[\s_-]*extraction/iu
const PATH_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

const resolveLocalRef = <TGoal extends OrientationOutlookGoal>(
  rawRef: string,
  goalsById: Map<string, TGoal>,
): string | null => {
  return goalsById.has(rawRef) ? rawRef : null
}

const nonEmptyString = (value: unknown): string | null => (
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null
)

const stringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null
  const strings = value.map(nonEmptyString)
  return strings.every((entry): entry is string => entry !== null) ? strings : null
}

const hasDuplicates = (values: string[]) => new Set(values).size !== values.length

const isAtomicGoal = (goal: OrientationOutlookGoal): boolean => (
  (goal.contains?.length ?? 0) === 0
)

const collectDescendants = <TGoal extends OrientationOutlookGoal>(
  rootId: string,
  goalsById: Map<string, TGoal>,
): Set<string> => {
  const descendants = new Set<string>()
  const pending = [rootId]
  while (pending.length > 0) {
    const currentId = pending.pop()
    if (!currentId || descendants.has(currentId)) continue
    descendants.add(currentId)
    for (const rawChildRef of goalsById.get(currentId)?.contains ?? []) {
      const childId = resolveLocalRef(rawChildRef, goalsById)
      if (childId && !descendants.has(childId)) pending.push(childId)
    }
  }
  return descendants
}

const collectRequiresDownstream = <TGoal extends OrientationOutlookGoal>(
  orientationGoalId: string,
  goals: TGoal[],
  goalsById: Map<string, TGoal>,
  semanticKindByGoalId: ReadonlyMap<string, HardRouteSemanticKind>,
  stageGoalSelector: (goal: TGoal) => boolean,
): Set<string> => {
  const isPermittedRouteGoal = (goal: TGoal): boolean => {
    if (!isAtomicGoal(goal) || !stageGoalSelector(goal)) return false
    return goal.id === orientationGoalId
      ? semanticKindByGoalId.get(goal.id) === 'orientation'
      : semanticKindByGoalId.get(goal.id) === 'curricularAtomic'
  }
  const reverseRequires = new Map<string, string[]>()
  for (const goal of goals) {
    if (!isPermittedRouteGoal(goal)) continue
    for (const rawRequiredRef of goal.requires ?? []) {
      const requiredId = resolveLocalRef(rawRequiredRef, goalsById)
      const requiredGoal = requiredId ? goalsById.get(requiredId) : undefined
      if (!requiredId || !requiredGoal || !isPermittedRouteGoal(requiredGoal)) continue
      reverseRequires.set(requiredId, [...(reverseRequires.get(requiredId) ?? []), goal.id])
    }
  }

  const downstream = new Set<string>([orientationGoalId])
  const pending = [orientationGoalId]
  while (pending.length > 0) {
    const currentId = pending.shift()
    if (!currentId) continue
    for (const successorId of reverseRequires.get(currentId) ?? []) {
      if (downstream.has(successorId)) continue
      downstream.add(successorId)
      pending.push(successorId)
    }
  }
  downstream.delete(orientationGoalId)
  return downstream
}

export const validateOrientationOutlooks = <TGoal extends OrientationOutlookGoal>(
  goals: TGoal[],
  semanticKindByGoalId: ReadonlyMap<string, HardRouteSemanticKind>,
  profiles: readonly OrientationOutlookProfile<TGoal>[],
): OrientationOutlookFinding[] => {
  const findings: OrientationOutlookFinding[] = []
  const goalsById = new Map(goals.map((goal) => [goal.id, goal]))

  for (const profile of profiles) {
    const { orientationGoalId, scopeLabel, stageGoalSelector } = profile
    const orientationGoal = goalsById.get(orientationGoalId)
    if (!orientationGoal) {
      findings.push({
        orientationGoalId,
        message: 'Required orientation goal is missing.',
      })
      continue
    }

    if (semanticKindByGoalId.get(orientationGoalId) !== 'orientation') {
      findings.push({
        orientationGoalId,
        message: `Orientation anchor must have authoritative semanticKind=orientation for ${scopeLabel}.`,
      })
    }
    if (!isAtomicGoal(orientationGoal)) {
      findings.push({
        orientationGoalId,
        message: `Orientation anchor must be atomic for ${scopeLabel}.`,
      })
    }
    if (!stageGoalSelector(orientationGoal)) {
      findings.push({
        orientationGoalId,
        message: `Orientation anchor is outside the explicit stage scope for ${scopeLabel}.`,
      })
    }

    const rawOutlook = orientationGoal.extendedData?.orientationOutlook
    if (!rawOutlook || typeof rawOutlook !== 'object' || Array.isArray(rawOutlook)) {
      findings.push({
        orientationGoalId,
        message: 'Required extendedData.orientationOutlook object is missing.',
      })
      continue
    }

    const rawPaths = (rawOutlook as Record<string, unknown>).paths
    if (!Array.isArray(rawPaths) || rawPaths.length < 2 || rawPaths.length > 4) {
      findings.push({
        orientationGoalId,
        message: 'orientationOutlook.paths must contain between two and four authored paths.',
      })
      continue
    }

    const downstream = collectRequiresDownstream(
      orientationGoalId,
      goals,
      goalsById,
      semanticKindByGoalId,
      stageGoalSelector,
    )
    const seenPathIds = new Set<string>()

    rawPaths.forEach((rawPath, pathIndex) => {
      if (!rawPath || typeof rawPath !== 'object' || Array.isArray(rawPath)) {
        findings.push({
          orientationGoalId,
          message: `orientationOutlook.paths[${pathIndex}] must be an object.`,
        })
        return
      }
      const path = rawPath as Record<string, unknown>
      const pathId = nonEmptyString(path.id)
      const findingPathId = pathId ?? `index:${pathIndex}`
      if (!pathId || !PATH_ID_PATTERN.test(pathId)) {
        findings.push({
          orientationGoalId,
          pathId: findingPathId,
          message: 'Path id must be a non-empty lowercase kebab-case identifier.',
        })
      } else if (seenPathIds.has(pathId)) {
        findings.push({
          orientationGoalId,
          pathId,
          message: 'Path id must be unique within the orientation outlook.',
        })
      } else {
        seenPathIds.add(pathId)
      }

      for (const field of ['title', 'titleEn', 'learningOutlook', 'learningOutlookEn']) {
        if (!nonEmptyString(path[field])) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Path field ${field} must be a non-empty string.`,
          })
        }
      }

      for (const field of ['title', 'titleEn']) {
        const title = nonEmptyString(path[field])
        if (title && INTERNAL_AUTHORING_PROCESS_LABEL_PATTERN.test(title)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Learner-facing path ${field} exposes the internal Source-Extraction authoring process.`,
          })
        }
      }

      const practicalContexts = stringArray(path.practicalContexts)
      const practicalContextsEn = stringArray(path.practicalContextsEn)
      for (const [field, values] of [
        ['practicalContexts', practicalContexts],
        ['practicalContextsEn', practicalContextsEn],
      ] as const) {
        if (!values || values.length < 1 || values.length > 3 || hasDuplicates(values)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `${field} must contain between one and three distinct non-empty strings.`,
          })
        }
      }
      if (practicalContexts && practicalContextsEn
          && practicalContexts.length !== practicalContextsEn.length) {
        findings.push({
          orientationGoalId,
          pathId: findingPathId,
          message: 'German and English practical-context arrays must have equal length.',
        })
      }

      const subtreeRootRefs = stringArray(path.subtreeRootIds)
      if (!subtreeRootRefs || subtreeRootRefs.length < 1 || subtreeRootRefs.length > 12
          || hasDuplicates(subtreeRootRefs)) {
        findings.push({
          orientationGoalId,
          pathId: findingPathId,
          message: 'subtreeRootIds must contain between one and twelve distinct local goal references.',
        })
      }

      const milestoneRefs = stringArray(path.milestoneGoalIds)
      if (!milestoneRefs || milestoneRefs.length < 1 || milestoneRefs.length > 4
          || hasDuplicates(milestoneRefs)) {
        findings.push({
          orientationGoalId,
          pathId: findingPathId,
          message: 'milestoneGoalIds must contain between one and four distinct local goal references.',
        })
      }

      const entryRefs = stringArray(path.entryGoalIds)
      if (!entryRefs || entryRefs.length < 1 || entryRefs.length > 6
          || hasDuplicates(entryRefs)) {
        findings.push({
          orientationGoalId,
          pathId: findingPathId,
          message: 'entryGoalIds must contain between one and six distinct local goal references.',
        })
      }

      const pathDescendants = new Set<string>()
      for (const rootRef of subtreeRootRefs ?? []) {
        const rootId = resolveLocalRef(rootRef, goalsById)
        if (!rootId) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Unknown subtree root reference: ${rootRef}.`,
          })
          continue
        }
        const rootGoal = goalsById.get(rootId)!
        if (semanticKindByGoalId.get(rootId) !== 'curricularArea') {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Subtree root ${rootId} must have authoritative semanticKind=curricularArea for ${scopeLabel}.`,
          })
        }
        if (isAtomicGoal(rootGoal)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Subtree root ${rootId} must be a non-atomic canonical cluster.`,
          })
        }
        if (!stageGoalSelector(rootGoal)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Subtree root ${rootId} is outside the explicit stage scope for ${scopeLabel}.`,
          })
        }
        if (INTERNAL_AUTHORING_PROCESS_LABEL_PATTERN.test(rootGoal.title ?? '')) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Subtree root ${rootId} exposes the internal Source-Extraction authoring process in its title.`,
          })
        }
        const descendants = collectDescendants(rootId, goalsById)
        descendants.forEach((goalId) => pathDescendants.add(goalId))
        const hasReachableContent = Array.from(descendants).some((goalId) => downstream.has(goalId))
        if (!hasReachableContent) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Subtree root ${rootId} has no in-scope curricularAtomic descendant reachable from the orientation anchor through direct atomic requires edges.`,
          })
        }
      }

      for (const entryRef of entryRefs ?? []) {
        const entryId = resolveLocalRef(entryRef, goalsById)
        if (!entryId) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Unknown entry goal reference: ${entryRef}.`,
          })
          continue
        }
        const entryGoal = goalsById.get(entryId)!
        if (semanticKindByGoalId.get(entryId) !== 'curricularAtomic') {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Entry goal ${entryId} must have authoritative semanticKind=curricularAtomic for ${scopeLabel}.`,
          })
        }
        if (!isAtomicGoal(entryGoal)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Entry goal ${entryId} must be atomic for ${scopeLabel}.`,
          })
        }
        if (!stageGoalSelector(entryGoal)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Entry goal ${entryId} is outside the explicit stage scope for ${scopeLabel}.`,
          })
        }
        if (!pathDescendants.has(entryId)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Entry goal ${entryId} is not contained in any authored subtree root of this path.`,
          })
        }
        if (!downstream.has(entryId)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Entry goal ${entryId} is not reachable from orientation goal ${orientationGoalId} through in-scope direct atomic requires edges.`,
          })
        }
        const directlyRequiresOrientation = (entryGoal.requires ?? [])
          .map((rawRequiredRef) => resolveLocalRef(rawRequiredRef, goalsById))
          .includes(orientationGoalId)
        if (!directlyRequiresOrientation) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Entry goal ${entryId} must directly require orientation goal ${orientationGoalId}.`,
          })
        }
      }

      for (const milestoneRef of milestoneRefs ?? []) {
        const milestoneId = resolveLocalRef(milestoneRef, goalsById)
        if (!milestoneId) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Unknown milestone goal reference: ${milestoneRef}.`,
          })
          continue
        }
        const milestone = goalsById.get(milestoneId)!
        if (semanticKindByGoalId.get(milestoneId) !== 'curricularAtomic') {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Milestone ${milestoneId} must have authoritative semanticKind=curricularAtomic for ${scopeLabel}.`,
          })
        }
        if (!isAtomicGoal(milestone)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Milestone ${milestoneId} must be atomic for ${scopeLabel}.`,
          })
        }
        if (!stageGoalSelector(milestone)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Milestone ${milestoneId} is outside the explicit stage scope for ${scopeLabel}.`,
          })
        }
        if (!pathDescendants.has(milestoneId)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Milestone ${milestoneId} is not contained in any authored subtree root of this path.`,
          })
        }
        if (!downstream.has(milestoneId)) {
          findings.push({
            orientationGoalId,
            pathId: findingPathId,
            message: `Milestone ${milestoneId} is not reachable from orientation goal ${orientationGoalId} through in-scope direct atomic requires edges.`,
          })
        }
      }
    })
  }

  return findings
}
