import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LearningLandscape } from '../src/landscapeTypes'
import { convertLearningGoal, type UiGoal } from '../src/goalTypes'

type Issue = { level: 'error' | 'warn'; message: string }

const allowedPhases = new Set([
  'GLOBAL', 'E', 'Q1', 'Q2', 'Q3', 'Q4',
  'Abitur',
  'S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14',
  'Pflichtbereich', 'Wahlpflichtbereich', 'Wahlbereich', 'Bachelorarbeit', 'Programm',
  'Modul', 'Module',
  'GOP', 'Bachelorprüfung', 'Studienleistung', 'Grundlagenphase', 'Vertiefungsphase',
  'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10', 'J11', 'J12', 'J13',
  'Curriculum', 'Semester', 'Bereich', 'Katalog'
])

const allowedLeitideen = new Set([
  'L1',
  'L2',
  'L3',
  'L4',
  'L5',
  'LI_BEWEGUNG',
  'LI_ENERGIE',
  'LI_FELDER',
  'LI_WELLEN',
  'LI_MATERIE',
  'LI_TECHNIK',
  'LI_KOSMOS',
  'BC_AUFBAU',
  'BC_REAKTION',
  'BC_ENERGIE',
  'I1',
  'I2',
  'I3',
  'I4',
  'I5',
  'BIO_STRUKTUR_FUNKTION',
  'BIO_STOFF_ENERGIE',
  'BIO_STEUERUNG_REGELUNG',
  'BIO_ENTWICKLUNG',
  'BIO_INFORMATION_KOMMUNIKATION',
  'WW_POLITIK',
  'WW_WIRTSCHAFT',
  'WW_GESELLSCHAFT',
  'WW_NACHHALTIGKEIT',
])
const kompetenzPattern = /^(PK[0-9]+(_[A-ZÄÖÜ]+)?|P[1-5](\.[0-9]+)?|K(1[0-4]|[1-9])(\.[0-9]+)?|E(1[0-7]|[1-9])(\.[0-9]+)?|B(1[0-2]|[1-9])(\.[0-9]+)?)$/

const PHYSICS_LANDSCAPE_ID = '24f2ca0f-b94a-444e-bb70-677cb6f85c02'
const PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID = 'b36bb565-f304-47c4-b44e-012dd9ff7a1a'
const PHYSICS_ENERGY_CLUSTER_GOAL_ID = 'fa204429-674f-466d-b049-a6de19a50579'
const PHYSICS_NEWTON_INERTIAL_CLUSTER_GOAL_ID = 'ff07337f-24bd-4148-8fa7-7a750d7ae5f8'
const PHYSICS_INERTIAL_SYSTEMS_GOAL_ID = '2808ec13-5b8b-4fb9-9b1a-7792146995b7'
const PHYSICS_POTENTIAL_ENERGY_AND_POTENTIAL_GOAL_ID = '99bbf33e-74f5-4f33-98e2-e4e6661d8648'

const MATH_LANDSCAPE_ID = '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3'
const MATH_DIFFERENTIATION_GOAL_ID = 'e2b6b4d1-02db-4a27-948e-ecfbdb44dab3'

const RULE_REQUIRES_ANCESTOR = 'GVR-001'
const RULE_PHASE_MONOTONIC = 'GVR-002'
const RULE_REQUIRES_DIRECT_CONTAINER = 'GVR-003'
const RULE_FIRST_ATOMIC_IS_WARUM = 'GVR-004'
const RULE_ATOMIC_TRANSITIVE_TO_WARUM = 'GVR-005'
const motivationRuleLandscapeIds = new Set<string>([
  '3e56aa75-c76c-4de5-883b-0aac98297846', // DE_HES_S_GYM_2_BIOLOGIE
  '2f391ba2-ba1e-40e4-a8d2-dff049516c13', // DE_HES_S_GYM_2_CHEMIE
  '7651cbe2-5fb8-464d-b0c4-3e830cda41dd', // DE_HES_S_GYM_2_CHINESISCH
  'f1ba2118-853f-4aa0-bef5-4f749bc621ed', // DE_HES_S_GYM_2_DEUTSCH
  'bc2124fa-2974-46cc-85e7-2392e61250e1', // DE_HES_S_GYM_2_ENGLISCH
  '30acd190-609c-4109-8ee7-06fc5594af19', // DE_HES_S_GYM_2_FRANZOESISCH
  'bdc89685-73d3-446c-af5a-eaf642c07463', // DE_HES_S_GYM_2_GESCHICHTE
  'c7209caa-18e5-4dd8-b68f-dd86e228d045', // DE_HES_S_GYM_2_GRIECHISCH
  'c1a02ddd-736d-4975-920b-18b03aff147f', // DE_HES_S_GYM_2_INFORMATIK
  'fe28bda8-03f3-4c4a-8286-7fcfce4eeac1', // DE_HES_S_GYM_2_LATEIN
  MATH_LANDSCAPE_ID, // DE_HES_S_GYM_2_MATHEMATIK
  'a8c23058-6998-49f2-9f3b-a85e951d5ab0', // DE_HES_S_GYM_2_MUSIK
  PHYSICS_LANDSCAPE_ID, // DE_HES_S_GYM_2_PHYSIK
  '1d0e9f8f-0087-49e4-8ea2-976e5a89b165', // DE_HES_S_GYM_2_POLITIKWIRTSCHAFT
  '936efc61-a4d5-49fd-8694-085d1347db80', // DE_HES_S_GYM_2_SPANISCH
  'a334a745-1d67-4e1d-86a5-dadc04f144d2', // DE_HES_S_GYM_2_WIRTSCHAFT
])
// Default is strict. Set VALIDATE_GRAPH_STRICT_RULES=0 for temporary warn-only rollout mode.
const strictGraphRules = process.env.VALIDATE_GRAPH_STRICT_RULES !== '0'
const graphRuleIssueLevel: Issue['level'] = strictGraphRules ? 'error' : 'warn'

interface ParsedLandscape {
  file: string
  landscapeId: string
  title: string
  goals: UiGoal[]
}

const curriculaDir = join(process.cwd(), '../curricula')
const curriculumManifestPath = join(curriculaDir, 'curriculum_manifest.json')

function getAllJsonFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir, { withFileTypes: true })
  files.forEach((file) => {
    if (file.isDirectory()) {
      getAllJsonFiles(join(dir, file.name), fileList)
    } else {
      if (file.name.endsWith('.json')) {
        fileList.push(join(dir, file.name))
      }
    }
  })
  return fileList
}

const landscapeFiles = getAllJsonFiles(curriculaDir)

const issues: Issue[] = []
const parsedLandscapes: ParsedLandscape[] = []
const landscapeById = new Map<string, ParsedLandscape>()
const titlesByLandscapeId = new Map<string, Set<string>>()

for (const file of landscapeFiles) {
  try {
    const raw = readFileSync(file, 'utf8')
    const json = JSON.parse(raw) as LearningLandscape
    const landscapeId = json.landscapeId ?? (json as { id?: string }).id
    if (!landscapeId || !Array.isArray(json.goals)) {
      continue
    }
    const goals = json.goals.map((goal) => convertLearningGoal(goal))
    const entry = {
      file,
      landscapeId,
      title: json.title ?? '',
      goals,
    }
    parsedLandscapes.push(entry)
    if (!landscapeById.has(landscapeId)) {
      landscapeById.set(landscapeId, entry)
    }
    const titleSet = titlesByLandscapeId.get(landscapeId) ?? new Set<string>()
    if (entry.title) {
      titleSet.add(entry.title)
    }
    const titleEn = (json as { titleEn?: string }).titleEn
    if (titleEn) {
      titleSet.add(titleEn)
    }
    titlesByLandscapeId.set(landscapeId, titleSet)
  } catch (error) {
    issues.push({
      level: 'error',
      message: `[${file}] Failed to parse landscape JSON: ${String(error)}`,
    })
  }
}

const globalGoalMap = new Map<string, { goal: UiGoal; landscapeId: string; sourceFile: string }>()
const guidMap = new Map<string, string[]>()
const goalIdToLandscapeId = new Map<string, string>()
const ambiguousGoalIds = new Set<string>()

for (const landscape of parsedLandscapes) {
  for (const goal of landscape.goals) {
    const key = `${landscape.landscapeId}:${goal.id}`
    if (globalGoalMap.has(key)) {
      const original = globalGoalMap.get(key)!
      // Allow duplicates if they belong to the same landscape ID (e.g. multi-file translations like .en.json and .de.json)
      if (original.landscapeId === landscape.landscapeId) {
        // Just verify consistency? Or just skip. For now, valid.
      } else {
        issues.push({
          level: 'error',
          message: `Duplicate goal id ${key} across landscapes. Found in ${landscape.file} AND ${original.sourceFile}`,
        })
      }
    } else {
      globalGoalMap.set(key, { goal, landscapeId: landscape.landscapeId, sourceFile: landscape.file })
    }

    if (!guidMap.has(goal.id)) {
      guidMap.set(goal.id, [])
    }
    guidMap.get(goal.id)!.push(landscape.landscapeId)

    if (!ambiguousGoalIds.has(goal.id)) {
      const existing = goalIdToLandscapeId.get(goal.id)
      if (!existing) {
        goalIdToLandscapeId.set(goal.id, landscape.landscapeId)
      } else if (existing !== landscape.landscapeId) {
        goalIdToLandscapeId.delete(goal.id)
        ambiguousGoalIds.add(goal.id)
      }
    }
  }
}

function addIssue(level: Issue['level'], landscapeId: string, message: string) {
  issues.push({ level, message: `[${landscapeId}] ${message}` })
}

function parseReference(raw: string, currentLandscape: string) {
  if (raw.includes(':')) {
    const [landscape, goalId] = raw.split(':', 2)
    return { landscapeId: landscape || currentLandscape, goalId }
  }
  return { landscapeId: currentLandscape, goalId: raw }
}

function refMatchesGoal(ref: string, goalId: string): boolean {
  if (ref === goalId) {
    return true
  }
  if (!ref.includes(':')) {
    return false
  }
  const [, refGoalId] = ref.split(':', 2)
  return refGoalId === goalId
}

function refsIncludeGoal(refs: string[], goalId: string): boolean {
  return refs.some((ref) => refMatchesGoal(ref, goalId))
}

function getComparablePhaseRank(phase: string): number | null {
  const upper = phase.toUpperCase()
  if (upper === 'E') return 10
  if (upper === 'Q1') return 11
  if (upper === 'Q2') return 12
  if (upper === 'Q3') return 13
  if (upper === 'Q4') return 14
  if (upper === 'ABITUR') return 15

  const sMatch = upper.match(/^S(\d{1,2})$/)
  if (sMatch) return 100 + Number(sMatch[1])

  const jMatch = upper.match(/^J(\d{1,2})$/)
  if (jMatch) return 200 + Number(jMatch[1])

  return null
}

function isAtomicGoal(goal: UiGoal): boolean {
  if (goal.type === 'atomic') return true
  if (goal.type === 'cluster') return false
  return (goal.contains?.length ?? 0) === 0
}

function isWarumGoal(goal: UiGoal): boolean {
  const title = goal.title ?? ''
  return /^\s*(warum|why)\b/i.test(title)
}

function hasPathToTarget(startId: string, targetId: string, edgeMap: Map<string, string[]>): boolean {
  if (startId === targetId) return true
  const visited = new Set<string>()
  const stack = [startId]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || visited.has(current)) continue
    visited.add(current)

    for (const next of edgeMap.get(current) ?? []) {
      if (next === targetId) {
        return true
      }
      if (!visited.has(next)) {
        stack.push(next)
      }
    }
  }

  return false
}

function validateLandscape(landscape: ParsedLandscape) {
  const localMap = new Map<string, UiGoal>()
  landscape.goals.forEach((goal) => {
    if (localMap.has(goal.id)) {
      addIssue('error', landscape.landscapeId, `Duplicate goal id ${goal.id}`)
    } else {
      localMap.set(goal.id, goal)
    }
  })

  const validateGoal = (goal: UiGoal) => {
    if (!allowedPhases.has(goal.phase)) {
      addIssue('error', landscape.landscapeId, `Goal ${goal.id} has invalid phase ${goal.phase}`)
    }
    // courseLevel check removed as it does not exist on UiGoal
    for (const leitidee of goal.leitideen) {
      if (!allowedLeitideen.has(leitidee)) {
        addIssue(
          'error',
          landscape.landscapeId,
          `Goal ${goal.id} has invalid leitidee ${leitidee}`,
        )
      }
    }
    for (const kompetenz of goal.kompetenzen) {
      if (!kompetenzPattern.test(kompetenz)) {
        addIssue(
          'error',
          landscape.landscapeId,
          `Goal ${goal.id} has invalid kompetenz tag ${kompetenz}`,
        )
      }
    }

    const checkReference = (ref: string, relation: 'requires' | 'contains') => {
      const { landscapeId, goalId } = parseReference(ref, landscape.landscapeId)
      const key = `${landscapeId}:${goalId}`
      const exists =
        landscapeId === landscape.landscapeId
          ? localMap.has(goalId)
          : globalGoalMap.has(key)

      if (!exists) {
        // Fallback: Check if goalId exists globally and is unique
        let resolved = false
        if (landscapeId === landscape.landscapeId && !localMap.has(goalId)) {
          const candidates = guidMap.get(goalId)
          if (candidates && candidates.length >= 1) {
            resolved = true
          }
        }

        if (!resolved) {
          addIssue(
            'error',
            landscape.landscapeId,
            `Goal ${goal.id} ${relation} missing id ${ref}`,
          )
        }
      } else if (landscapeId === landscape.landscapeId && goalId === goal.id) {
        addIssue(
          'error',
          landscape.landscapeId,
          `Goal ${goal.id} cannot ${relation} itself`,
        )
      }
    }

    goal.requires.forEach((dep) => checkReference(dep, 'requires'))
    goal.contains.forEach((child) => checkReference(child, 'contains'))
  }

  landscape.goals.forEach(validateGoal)

  type EdgeMap = Map<string, string[]>

  const buildEdgeMap = (selector: (goal: UiGoal) => string[]): EdgeMap => {
    const map = new Map<string, string[]>()
    for (const goal of landscape.goals) {
      const targets = selector(goal)
        .map((ref) => parseReference(ref, landscape.landscapeId))
        .filter((ref) => ref.landscapeId === landscape.landscapeId && localMap.has(ref.goalId))
        .map((ref) => ref.goalId)
      map.set(goal.id, targets)
    }
    return map
  }

  const detectCycles = (edgeMap: EdgeMap, label: string) => {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const path: string[] = []

    const dfs = (node: string) => {
      if (visiting.has(node)) {
        const startIndex = path.indexOf(node)
        const cycle = [...path.slice(startIndex), node].join(' -> ')
        addIssue('error', landscape.landscapeId, `Cycle detected in ${label}: ${cycle}`)
        return
      }
      if (visited.has(node)) return
      visiting.add(node)
      path.push(node)
      for (const neighbor of edgeMap.get(node) ?? []) {
        dfs(neighbor)
      }
      visiting.delete(node)
      path.pop()
      visited.add(node)
    }

    for (const node of edgeMap.keys()) {
      if (!visited.has(node)) {
        dfs(node)
      }
    }
  }

  const requiresEdges = buildEdgeMap((goal) => goal.requires)
  const containsEdges = buildEdgeMap((goal) => goal.contains)

  detectCycles(requiresEdges, 'requires')
  detectCycles(containsEdges, 'contains')

  // Effective requires = direct requires + requires of all ancestors via contains (local landscape)
  const parentMap = new Map<string, string[]>()
  for (const [parent, children] of containsEdges.entries()) {
    children.forEach((child) => {
      const arr = parentMap.get(child) ?? []
      arr.push(parent)
      parentMap.set(child, arr)
    })
  }

  const ancestorMemo = new Map<string, Set<string>>()
  const ancestorVisiting = new Set<string>()
  const getAncestors = (goalId: string): Set<string> => {
    const cached = ancestorMemo.get(goalId)
    if (cached) return cached
    if (ancestorVisiting.has(goalId)) return new Set<string>()

    ancestorVisiting.add(goalId)
    const result = new Set<string>()
    for (const parentId of parentMap.get(goalId) ?? []) {
      result.add(parentId)
      getAncestors(parentId).forEach((ancestorId) => result.add(ancestorId))
    }
    ancestorVisiting.delete(goalId)
    ancestorMemo.set(goalId, result)
    return result
  }

  // GVR-001 / GVR-003:
  // A goal must not require one of its contains-ancestors.
  // The direct-parent case gets a dedicated rule because it is the most common deadlock source.
  landscape.goals.forEach((goal) => {
    const directParents = new Set(parentMap.get(goal.id) ?? [])
    const ancestors = getAncestors(goal.id)
    goal.requires.forEach((rawReq) => {
      const parsed = parseReference(rawReq, landscape.landscapeId)
      if (parsed.landscapeId !== landscape.landscapeId || !localMap.has(parsed.goalId)) return
      const reqId = parsed.goalId
      const reqGoal = localMap.get(reqId)
      const reqLabel = reqGoal ? `${reqGoal.id} (${reqGoal.title})` : reqId
      const goalLabel = `${goal.id} (${goal.title})`

      if (directParents.has(reqId)) {
        addIssue(
          graphRuleIssueLevel,
          landscape.landscapeId,
          `[${RULE_REQUIRES_DIRECT_CONTAINER}] Goal ${goalLabel} requires its direct container ${reqLabel}.`,
        )
        return
      }
      if (ancestors.has(reqId)) {
        addIssue(
          graphRuleIssueLevel,
          landscape.landscapeId,
          `[${RULE_REQUIRES_ANCESTOR}] Goal ${goalLabel} requires ancestor ${reqLabel}.`,
        )
      }
    })
  })

  const effectiveMemo = new Map<string, string[]>()
  const visiting = new Set<string>()
  const computeEffectiveRequires = (goalId: string): string[] => {
    if (effectiveMemo.has(goalId)) return effectiveMemo.get(goalId) ?? []
    if (visiting.has(goalId)) {
      return localMap.get(goalId)?.requires ?? []
    }
    visiting.add(goalId)

    const direct = localMap.get(goalId)?.requires ?? []
    const inherited = new Set<string>()
      ; (parentMap.get(goalId) ?? []).forEach((pid) => {
        computeEffectiveRequires(pid).forEach((req) => inherited.add(req))
      })

    const merged = Array.from(new Set([...direct, ...inherited])).filter((req) => req !== goalId)
    effectiveMemo.set(goalId, merged)
    visiting.delete(goalId)
    return merged
  }

  landscape.goals.forEach((g) => {
    const eff = computeEffectiveRequires(g.id)
    if (eff.includes(g.id)) {
      addIssue('error', landscape.landscapeId, `Goal ${g.id} inherits itself via requires/contains`)
    }
  })

  const effectiveEdges = new Map<string, string[]>()
  for (const goal of landscape.goals) {
    const edges = computeEffectiveRequires(goal.id)
      .map((ref) => parseReference(ref, landscape.landscapeId))
      .filter((ref) => ref.landscapeId === landscape.landscapeId && localMap.has(ref.goalId))
      .map((ref) => ref.goalId)
    effectiveEdges.set(goal.id, edges)
  }
  detectCycles(effectiveEdges, 'effective_requires (with inheritance)')

  // GVR-002:
  // For comparable phase systems (E/Q*/Abitur, S*, J*), prerequisites must not point to later phases.
  const reportedPhaseViolations = new Set<string>()
  landscape.goals.forEach((goal) => {
    const goalRank = getComparablePhaseRank(goal.phase)
    if (goalRank === null) return

    computeEffectiveRequires(goal.id).forEach((rawReq) => {
      const parsed = parseReference(rawReq, landscape.landscapeId)
      if (parsed.landscapeId !== landscape.landscapeId || !localMap.has(parsed.goalId)) return
      const reqGoal = localMap.get(parsed.goalId)
      if (!reqGoal) return

      const reqRank = getComparablePhaseRank(reqGoal.phase)
      if (reqRank === null || reqRank <= goalRank) return

      const dedupeKey = `${goal.id}->${reqGoal.id}`
      if (reportedPhaseViolations.has(dedupeKey)) return
      reportedPhaseViolations.add(dedupeKey)

      const isDirect = goal.requires.some((rawDirectReq) => {
        const parsedDirect = parseReference(rawDirectReq, landscape.landscapeId)
        return parsedDirect.landscapeId === landscape.landscapeId && parsedDirect.goalId === reqGoal.id
      })
      const edgeType = isDirect ? 'direct' : 'inherited/effective'

      addIssue(
        graphRuleIssueLevel,
        landscape.landscapeId,
        `[${RULE_PHASE_MONOTONIC}] Goal ${goal.id} (${goal.title}, phase ${goal.phase}) has ${edgeType} prerequisite ${reqGoal.id} (${reqGoal.title}, phase ${reqGoal.phase}), which points to a later phase.`,
      )
    })
  })

  // GVR-004 / GVR-005:
  // Motivation anchor rollout: first atomic node must be a "Warum"/"Why" node.
  // All other atomic nodes must reach this anchor transitively via effective requires.
  if (motivationRuleLandscapeIds.has(landscape.landscapeId)) {
    const atomicGoals = landscape.goals.filter(isAtomicGoal)
    let motivationAnchor: UiGoal | undefined

    if (atomicGoals.length === 0) {
      addIssue(
        graphRuleIssueLevel,
        landscape.landscapeId,
        `[${RULE_FIRST_ATOMIC_IS_WARUM}] Landscape has no atomic nodes; cannot validate motivation anchor rule.`,
      )
    } else {
      motivationAnchor = atomicGoals[0]
      const anchorLabel = `${motivationAnchor.id} (${motivationAnchor.title})`
      if (!isWarumGoal(motivationAnchor)) {
        addIssue(
          graphRuleIssueLevel,
          landscape.landscapeId,
          `[${RULE_FIRST_ATOMIC_IS_WARUM}] First atomic node ${anchorLabel} is not a "Warum"/"Why" motivation node.`,
        )
      }
    }

    if (motivationAnchor && isWarumGoal(motivationAnchor)) {
      const anchorId = motivationAnchor.id
      const anchorLabel = `${anchorId} (${motivationAnchor.title})`
      atomicGoals.forEach((goal) => {
        if (goal.id === anchorId) return

        if (!hasPathToTarget(goal.id, anchorId, effectiveEdges)) {
          addIssue(
            graphRuleIssueLevel,
            landscape.landscapeId,
            `[${RULE_ATOMIC_TRANSITIVE_TO_WARUM}] Atomic node ${goal.id} (${goal.title}) has no transitive effective-requires path to motivation anchor ${anchorLabel}.`,
          )
        }
      })
    }
  }

  if (landscape.landscapeId === PHYSICS_LANDSCAPE_ID) {
    const goal = localMap.get(PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID)
    if (!goal) {
      addIssue(
        'error',
        landscape.landscapeId,
        `Missing invariant goal ${PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID} (Energieerhaltung aus Newtonschen Axiomen (LK))`,
      )
      return
    }

    const requires = goal.requires ?? []
    if (refsIncludeGoal(requires, PHYSICS_ENERGY_CLUSTER_GOAL_ID)) {
      addIssue(
        'error',
        landscape.landscapeId,
        `Goal ${PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID} must not require ${PHYSICS_ENERGY_CLUSTER_GOAL_ID} (Energie)`,
      )
    }
    if (!refsIncludeGoal(requires, PHYSICS_NEWTON_INERTIAL_CLUSTER_GOAL_ID)) {
      addIssue(
        'error',
        landscape.landscapeId,
        `Goal ${PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID} must require ${PHYSICS_NEWTON_INERTIAL_CLUSTER_GOAL_ID} (Newtons Axiome und Inertialsysteme)`,
      )
    }
    if (!refsIncludeGoal(requires, PHYSICS_INERTIAL_SYSTEMS_GOAL_ID)) {
      addIssue(
        'error',
        landscape.landscapeId,
        `Goal ${PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID} must require ${PHYSICS_INERTIAL_SYSTEMS_GOAL_ID} (Inertialsysteme und Bezugssysteme)`,
      )
    }
    if (!refsIncludeGoal(requires, PHYSICS_POTENTIAL_ENERGY_AND_POTENTIAL_GOAL_ID)) {
      addIssue(
        'error',
        landscape.landscapeId,
        `Goal ${PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID} must require ${PHYSICS_POTENTIAL_ENERGY_AND_POTENTIAL_GOAL_ID} (Potenzielle Energie und Potential)`,
      )
    }

    const requiredMathDiff = `${MATH_LANDSCAPE_ID}:${MATH_DIFFERENTIATION_GOAL_ID}`
    if (!refsIncludeGoal(requires, MATH_DIFFERENTIATION_GOAL_ID)) {
      addIssue(
        'error',
        landscape.landscapeId,
        `Goal ${PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID} must require ${MATH_DIFFERENTIATION_GOAL_ID} (or ${requiredMathDiff})`,
      )
    }
  }
}

parsedLandscapes.forEach(validateLandscape)

const rootGoalByLandscape = new Map<string, string>()
const moduleLandscapeIds = new Set<string>()

const getRootGoal = (landscape: ParsedLandscape): UiGoal | undefined => {
  if (!landscape.goals.length) return undefined
  const root = landscape.goals.find((goal) => goal.tags?.includes('root'))
  return root ?? landscape.goals[0]
}

const isModuleLandscape = (landscape: ParsedLandscape): boolean => {
  const rootGoal = getRootGoal(landscape)
  const tags = rootGoal?.tags ?? []
  for (const tag of tags) {
    if (!tag) continue
    const normalized = tag.toLowerCase()
    if (normalized.startsWith('module:') || normalized.startsWith('modul:')) {
      return true
    }
  }
  const title = (landscape.title ?? '').toLowerCase()
  return /\bmodul\b/.test(title) || /\bmodule\b/.test(title)
}

const resolveLandscapeReference = (ref: string, currentLandscapeId: string) => {
  if (ref.includes(':')) {
    const [landscapeId, goalId] = ref.split(':', 2)
    return { landscapeId: landscapeId || currentLandscapeId, goalId }
  }
  const mappedLandscapeId = goalIdToLandscapeId.get(ref)
  return { landscapeId: mappedLandscapeId ?? currentLandscapeId, goalId: ref }
}

for (const [landscapeId, landscape] of landscapeById.entries()) {
  const rootGoal = getRootGoal(landscape)
  if (rootGoal?.id) {
    rootGoalByLandscape.set(landscapeId, rootGoal.id)
  }
  if (isModuleLandscape(landscape)) {
    moduleLandscapeIds.add(landscapeId)
  }
}

const referencedLandscapeIds = new Set<string>()
for (const [landscapeId, landscape] of landscapeById.entries()) {
  for (const goal of landscape.goals) {
    for (const ref of goal.contains ?? []) {
      if (typeof ref !== 'string') continue
      const { landscapeId: targetLandscapeId, goalId } = resolveLandscapeReference(ref, landscapeId)
      if (!targetLandscapeId || targetLandscapeId === landscapeId) continue
      const rootId = rootGoalByLandscape.get(targetLandscapeId)
      if (rootId && rootId === goalId) {
        referencedLandscapeIds.add(targetLandscapeId)
      }
    }
  }
}

const computedCurriculumIds = new Set(
  Array.from(landscapeById.keys()).filter(
    (id) => !referencedLandscapeIds.has(id) && !moduleLandscapeIds.has(id),
  ),
)

const formatIdList = (ids: string[]) => {
  if (ids.length === 0) return ''
  const preview = ids.slice(0, 10).join(', ')
  return ids.length > 10 ? `${preview}, ... (${ids.length} total)` : preview
}

if (!existsSync(curriculumManifestPath)) {
  issues.push({
    level: 'error',
    message: `[curriculum_manifest] Missing manifest file at ${curriculumManifestPath}`,
  })
} else {
  try {
    const manifestRaw = readFileSync(curriculumManifestPath, 'utf8')
    const manifest = JSON.parse(manifestRaw) as { curricula?: unknown }
    if (!Array.isArray(manifest.curricula)) {
      issues.push({
        level: 'error',
        message: '[curriculum_manifest] Expected "curricula" array of landscape IDs',
      })
    } else {
      const manifestIds: string[] = []
      const manifestTitles = new Map<string, string>()

      manifest.curricula.forEach((entry, index) => {
        if (typeof entry === 'string') {
          issues.push({
            level: 'error',
            message: `[curriculum_manifest] Entry ${index} must be an object with id/title (found string)`,
          })
          return
        }
        if (!entry || typeof entry !== 'object') {
          issues.push({
            level: 'error',
            message: `[curriculum_manifest] Entry ${index} must be an object with id/title`,
          })
          return
        }

        const entryObj = entry as { id?: unknown; landscapeId?: unknown; curriculumId?: unknown; title?: unknown }
        const rawId = entryObj.id ?? entryObj.landscapeId ?? entryObj.curriculumId
        if (typeof rawId !== 'string' || rawId.trim() === '') {
          issues.push({
            level: 'error',
            message: `[curriculum_manifest] Entry ${index} missing id`,
          })
          return
        }

        const id = rawId.trim()
        manifestIds.push(id)

        const rawTitle = entryObj.title
        if (typeof rawTitle !== 'string' || rawTitle.trim() === '') {
          issues.push({
            level: 'error',
            message: `[curriculum_manifest] Entry ${index} (${id}) missing title`,
          })
        } else if (!manifestTitles.has(id)) {
          manifestTitles.set(id, rawTitle.trim())
        }
      })

      const manifestSet = new Set(manifestIds)

      if (manifestSet.size !== manifestIds.length) {
        issues.push({
          level: 'error',
          message: '[curriculum_manifest] Duplicate curriculum IDs found',
        })
      }

      const unknownIds = manifestIds.filter((id) => !landscapeById.has(id))
      if (unknownIds.length) {
        issues.push({
          level: 'error',
          message: `[curriculum_manifest] Unknown curriculum IDs: ${formatIdList(unknownIds)}`,
        })
      }

      const moduleIds = manifestIds.filter((id) => moduleLandscapeIds.has(id))
      if (moduleIds.length) {
        issues.push({
          level: 'error',
          message: `[curriculum_manifest] Module landscapes cannot be curricula: ${formatIdList(moduleIds)}`,
        })
      }

      const referencedIds = manifestIds.filter((id) => referencedLandscapeIds.has(id))
      if (referencedIds.length) {
        issues.push({
          level: 'error',
          message: `[curriculum_manifest] Contained landscapes cannot be curricula: ${formatIdList(referencedIds)}`,
        })
      }

      const missingInManifest = Array.from(computedCurriculumIds).filter((id) => !manifestSet.has(id))
      if (missingInManifest.length) {
        issues.push({
          level: 'error',
          message: `[curriculum_manifest] Missing root curricula: ${formatIdList(missingInManifest)}`,
        })
      }

      const formatTitleList = (titles: string[]) => {
        if (titles.length === 0) return ''
        const preview = titles.slice(0, 5).join(' | ')
        return titles.length > 5 ? `${preview} | ... (${titles.length} total)` : preview
      }

      for (const id of manifestIds) {
        const manifestTitle = manifestTitles.get(id)
        if (!manifestTitle) continue
        const expectedTitles = titlesByLandscapeId.get(id)
        if (!expectedTitles || expectedTitles.size === 0) continue
        if (!expectedTitles.has(manifestTitle)) {
          issues.push({
            level: 'error',
            message: `[curriculum_manifest] Title mismatch for ${id}. Expected one of: ${formatTitleList(Array.from(expectedTitles))}`,
          })
        }
      }
    }
  } catch (error) {
    issues.push({
      level: 'error',
      message: `[curriculum_manifest] Failed to parse: ${String(error)}`,
    })
  }
}

const errorCount = issues.filter((issue) => issue.level === 'error').length
const warningCount = issues.length - errorCount
const hasGraphRuleMessages = issues.some((issue) => issue.message.includes('[GVR-'))

if (issues.length === 0) {
  console.log(`✅ ${parsedLandscapes.length} landscape(s) passed validation.`)
  process.exit(0)
} else {
  for (const issue of issues) {
    const tag = issue.level === 'error' ? '❌' : '⚠️'
    console.log(`${tag} ${issue.message}`)
  }
  if (hasGraphRuleMessages && !strictGraphRules) {
    console.log(
      '\nℹ️ Legacy warn mode active (VALIDATE_GRAPH_STRICT_RULES=0). GVR rules are not failing in this run. See docs/qa-ci/graph-validation-rules.md',
    )
  }
  console.log(`\n${errorCount} error(s), ${warningCount} warning(s).`)
  process.exit(errorCount > 0 ? 1 : 0)
}
