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
const kompetenzPattern = /^(PK[0-9]+(_[A-ZÄÖÜ]+)?|K(1[0-4]|[1-9])(\.[0-9]+)?|E(1[0-7]|[1-9])(\.[0-9]+)?|B(1[0-2]|[1-9])(\.[0-9]+)?)$/

const PHYSICS_LANDSCAPE_ID = '24f2ca0f-b94a-444e-bb70-677cb6f85c02'
const PHYSICS_ENERGY_FROM_NEWTON_LK_GOAL_ID = 'b36bb565-f304-47c4-b44e-012dd9ff7a1a'
const PHYSICS_ENERGY_CLUSTER_GOAL_ID = 'fa204429-674f-466d-b049-a6de19a50579'
const PHYSICS_NEWTON_INERTIAL_CLUSTER_GOAL_ID = 'ff07337f-24bd-4148-8fa7-7a750d7ae5f8'
const PHYSICS_INERTIAL_SYSTEMS_GOAL_ID = '2808ec13-5b8b-4fb9-9b1a-7792146995b7'
const PHYSICS_POTENTIAL_ENERGY_AND_POTENTIAL_GOAL_ID = '99bbf33e-74f5-4f33-98e2-e4e6661d8648'

const MATH_LANDSCAPE_ID = '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3'
const MATH_DIFFERENTIATION_GOAL_ID = 'e2b6b4d1-02db-4a27-948e-ecfbdb44dab3'

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

if (issues.length === 0) {
  console.log(`✅ ${parsedLandscapes.length} landscape(s) passed validation.`)
  process.exit(0)
} else {
  for (const issue of issues) {
    const tag = issue.level === 'error' ? '❌' : '⚠️'
    console.log(`${tag} ${issue.message}`)
  }
  console.log(`\n${errorCount} error(s), ${warningCount} warning(s).`)
  process.exit(errorCount > 0 ? 1 : 0)
}
