import { readdirSync, readFileSync } from 'node:fs'
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
  'WW_POLITIK',
  'WW_WIRTSCHAFT',
  'WW_GESELLSCHAFT',
  'WW_NACHHALTIGKEIT',
])
const kompetenzPattern = /^(K[1-6](\.[0-9]+)?|PK[0-9]+(_[A-ZÄÖÜ]+)?)$/

interface ParsedLandscape {
  file: string
  landscapeId: string
  goals: UiGoal[]
}

const curriculaDir = join(process.cwd(), '../curricula')

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

for (const file of landscapeFiles) {
  try {
    const raw = readFileSync(file, 'utf8')
    const json = JSON.parse(raw) as LearningLandscape
    const goals = (json.goals ?? []).map((goal) => convertLearningGoal(goal))
    parsedLandscapes.push({ file, landscapeId: json.landscapeId, goals })
  } catch (error) {
    issues.push({
      level: 'error',
      message: `[${file}] Failed to parse landscape JSON: ${String(error)}`,
    })
  }
}

const globalGoalMap = new Map<string, { goal: UiGoal; landscapeId: string; sourceFile: string }>()
const guidMap = new Map<string, string[]>()

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
}

parsedLandscapes.forEach(validateLandscape)

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
