import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { SkillLandscape } from '../src/landscapeTypes'
import { convertLearningGoal, type UiGoal } from '../src/goalTypes'
import {
  validateHardDirectAtomicRoutes,
  validateOrientationMotivationStructure,
} from './lib/hardLearningRouteValidation'
import { validateOrientationOutlooks } from './lib/orientationOutlookValidation'
import { findExamMarkdownTableIssues } from './lib/examMarkdownValidation'
import { routeProfiles } from './generateCurriculumQualityStatus'
import { evaluateDirectAtomicRouteCoverage } from './lib/directAtomicRouteCoverage'
import { canResolveRetainedGymnasiumReference, loadGraphValidationLandscapes, loadRetainedGymnasiumSourceLandscapes } from './lib/graphValidationInventory'
import { loadSemanticRouteInventory } from './lib/semanticRouteInventory'

type Issue = { level: 'error' | 'warn'; message: string }

const allowedPhases = new Set([
  'GLOBAL', 'E', 'Q1', 'Q2', 'Q3', 'Q4',
  'Abitur',
  'SekI', 'SekII',
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

const CANONICAL_GYM_MATH_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const RULE_REQUIRES_ANCESTOR = 'GVR-001'
const RULE_PHASE_MONOTONIC = 'GVR-002'
const RULE_REQUIRES_DIRECT_CONTAINER = 'GVR-003'
const RULE_MIT_ATOMIC_SOURCE_LINKS = 'GVR-007'
const RULE_NO_LEGACY_LINK_FIELDS = 'GVR-008'
const RULE_EXPLICIT_TYPE_CONSISTENCY = 'GVR-009'
const RULE_SHORTKEY_UNIQUE_WITHIN_LANDSCAPE = 'GVR-010'
const RULE_SCOPED_TRANSITIVE_TO_MOTIVATION = 'GVR-011'
const RULE_SCOPED_FULL_ROUTE_COVERAGE = 'GVR-012'
const RULE_ORIENTATION_MOTIVATION_STRUCTURE = 'GVR-014'
const RULE_ORIENTATION_OUTLOOK_INTEGRITY = 'GVR-015'
const RULE_EXAM_MARKDOWN_TABLES = 'GVR-016'
const graphRuleIssueLevel = 'error' as const

interface ParsedLandscape {
  file: string
  landscapeId: string
  title: string
  frameworkId?: string
  goals: UiGoal[]
  source: SkillLandscape
}

const curriculaDir = join(process.cwd(), '../curricula')
const curriculumManifestPath = join(curriculaDir, 'curriculum_manifest.json')
const compatibilityArchiveRegistryPath = join(
  curriculaDir,
  'DE/Gymnasium/archive/compatibility-landscape-registry.json',
)

const issues: Issue[] = []
const parsedLandscapes: ParsedLandscape[] = []
const landscapeById = new Map<string, ParsedLandscape>()
const titlesByLandscapeId = new Map<string, Set<string>>()
const compatibilityArchiveLandscapeIds = new Set<string>()
for (const { file, landscape: json } of loadGraphValidationLandscapes(curriculaDir)) {
  const landscapeId = json.landscapeId ?? (json as { id?: string }).id!
  const entry = {
    file, landscapeId, title: json.title ?? '', frameworkId: json.frameworkId,
    goals: json.goals.map((goal) => convertLearningGoal(goal)), source: json,
  }
  parsedLandscapes.push(entry)
  if (!landscapeById.has(landscapeId)) landscapeById.set(landscapeId, entry)
  const titleSet = titlesByLandscapeId.get(landscapeId) ?? new Set<string>()
  if (entry.title) titleSet.add(entry.title)
  if (json.titleEn) titleSet.add(json.titleEn)
  titlesByLandscapeId.set(landscapeId, titleSet)
}

// This inventory is fail-closed even for diagnostic subjects: a missing,
// non-authoritative or stale ledger never silently removes a candidate scope.
const semanticRoutes = await loadSemanticRouteInventory(join(process.cwd(), '..'),
  parsedLandscapes.map(entry => ({ file: entry.file, landscape: entry.source })))
const requiredSemanticProfiles = semanticRoutes.profiles.filter(profile => profile.required)
const rawSemanticGoalById = new Map(semanticRoutes.goals.map(goal => [goal.id, goal]))
const mathQaProfiles = routeProfiles.filter(profile => profile.landscapeId === CANONICAL_GYM_MATH_LANDSCAPE_ID)

if (existsSync(compatibilityArchiveRegistryPath)) {
  try {
    const raw = readFileSync(compatibilityArchiveRegistryPath, 'utf8')
    const json = JSON.parse(raw) as { entries?: unknown }
    if (Array.isArray(json.entries)) {
      for (const entry of json.entries) {
        if (!entry || typeof entry !== 'object') continue
        const record = entry as { landscapeId?: unknown; title?: unknown }
        if (typeof record.landscapeId !== 'string' || record.landscapeId.trim() === '') {
          continue
        }
        const landscapeId = record.landscapeId.trim()
        compatibilityArchiveLandscapeIds.add(landscapeId)

        if (typeof record.title === 'string' && record.title.trim() !== '') {
          const titleSet = titlesByLandscapeId.get(landscapeId) ?? new Set<string>()
          titleSet.add(record.title.trim())
          titlesByLandscapeId.set(landscapeId, titleSet)
        }
      }
    }
  } catch (error) {
    issues.push({
      level: 'error',
      message: `[${compatibilityArchiveRegistryPath}] Failed to parse compatibility archive registry: ${String(error)}`,
    })
  }
}

const globalGoalMap = new Map<string, { goal: UiGoal; landscapeId: string; sourceFile: string }>()
const retainedGymnasiumSources = loadRetainedGymnasiumSourceLandscapes(curriculaDir)
const guidMap = new Map<string, string[]>()
const goalIdToLandscapeId = new Map<string, string>()
const ambiguousGoalIds = new Set<string>()
const shortKeyOwnersByLandscape = new Map<string, Map<string, Set<string>>>()

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

    const shortKey = goal.shortKey?.trim()
    if (shortKey) {
      const landscapeShortKeys = shortKeyOwnersByLandscape.get(landscape.landscapeId) ?? new Map<string, Set<string>>()
      const owners = landscapeShortKeys.get(shortKey) ?? new Set<string>()
      owners.add(goal.id)
      landscapeShortKeys.set(shortKey, owners)
      shortKeyOwnersByLandscape.set(landscape.landscapeId, landscapeShortKeys)
    }
  }
}

for (const [landscapeId, shortKeyOwners] of shortKeyOwnersByLandscape.entries()) {
  for (const [shortKey, ownerIds] of shortKeyOwners.entries()) {
    if (ownerIds.size <= 1) continue
    issues.push({
      level: 'error',
      message:
        `[${landscapeId}] [${RULE_SHORTKEY_UNIQUE_WITHIN_LANDSCAPE}] shortKey "${shortKey}" must be unique within landscapeId ${landscapeId}. `
        + `Found on goal ids: ${Array.from(ownerIds).sort().join(', ')}`,
    })
  }
}

function addIssue(level: Issue['level'], landscapeId: string, message: string) {
  issues.push({ level, message: `[${landscapeId}] ${message}` })
}

function getCanonicalResourceLinks(goal: UiGoal): Record<string, unknown>[] {
  const directLinks = Array.isArray(goal.resourceLinks) ? goal.resourceLinks : []
  return directLinks.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
}

function getLegacyGoalLinkFields(goal: UiGoal): string[] {
  const fields: string[] = []
  const extData = (goal.extendedData ?? {}) as Record<string, unknown>
  if (Object.prototype.hasOwnProperty.call(extData, 'sourceLinks')) {
    fields.push('extendedData.sourceLinks')
  }
  const rawGoal = goal as unknown as Record<string, unknown>
  if (Object.prototype.hasOwnProperty.call(rawGoal, 'oerContent')) {
    fields.push('oerContent')
  }
  return fields
}

function parseReference(raw: string, currentLandscape: string) {
  if (raw.includes(':')) {
    const [landscape, goalId] = raw.split(':', 2)
    return { landscapeId: landscape || currentLandscape, goalId }
  }
  return { landscapeId: currentLandscape, goalId: raw }
}

function isYearLevelPhase(phase: string): boolean {
  return /^([5-9]|1[0-3])(?:\.[1-9]\d*)?$/.test(phase)
}

function isAllowedPhase(phase: string): boolean {
  return allowedPhases.has(phase) || isYearLevelPhase(phase)
}

function getComparablePhaseRank(phase: string): number | null {
  const upper = phase.toUpperCase()
  const sMatch = upper.match(/^S(\d{1,2})$/)
  if (sMatch) return 100 + Number(sMatch[1])

  const jMatch = upper.match(/^J(\d{1,2})$/)
  if (jMatch) return 200 + Number(jMatch[1])

  const yearLevelMatch = upper.match(/^(\d{1,2})(?:\.(\d{1,2}))?$/)
  if (yearLevelMatch) {
    const year = Number(yearLevelMatch[1])
    if (year >= 5 && year <= 13) {
      const part = yearLevelMatch[2] ? Number(yearLevelMatch[2]) / 100 : 0
      return 200 + year + part
    }
  }

  // In mixed school landscapes, late Sek-I year buckets must come before
  // upper-secondary phases so J8/J9/J10 -> E/Q/Abitur bridge edges stay valid.
  if (upper === 'E') return 300
  if (upper === 'Q1') return 310
  if (upper === 'Q2') return 320
  if (upper === 'Q3') return 330
  if (upper === 'Q4') return 340
  if (upper === 'ABITUR') return 350

  return null
}

function isAtomicGoal(goal: UiGoal): boolean {
  return (goal.contains?.length ?? 0) === 0
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

  if (semanticRoutes.policy.ledgerSources.some(source => source.landscapeId === landscape.landscapeId)) {
    landscape.goals.forEach((goal) => {
      if (semanticRoutes.semanticKindByGoalId.has(goal.id)) return
      addIssue(
        'error',
        landscape.landscapeId,
        `[${RULE_SCOPED_FULL_ROUTE_COVERAGE}] Goal ${goal.id} (${goal.title}) has no authoritative semantic-kind decision; hard route selection must never silently omit an unclassified goal.`,
      )
    })
    semanticRoutes.semanticKindByGoalId.forEach((_semanticKind, goalId) => {
      if (semanticRoutes.ownerByGoalId.get(goalId) !== landscape.landscapeId || localMap.has(goalId)) return
      addIssue(
        'error',
        landscape.landscapeId,
        `[${RULE_SCOPED_FULL_ROUTE_COVERAGE}] Semantic-kind ledger contains stale or foreign goal ${goalId}.`,
      )
    })
    landscape.goals.forEach((goal) => {
      const semanticKind = semanticRoutes.semanticKindByGoalId.get(goal.id)
      const atomicOnlyKind = semanticKind === 'orientation'
        || semanticKind === 'curricularAtomic'
        || semanticKind === 'memory'
      const clusterOnlyKind = semanticKind === 'curricularArea'
        || semanticKind === 'programStructure'
        || semanticKind === 'runtimeSupport'
      if (atomicOnlyKind && !isAtomicGoal(goal)) {
        addIssue(
          'error',
          landscape.landscapeId,
          `[${RULE_SCOPED_FULL_ROUTE_COVERAGE}] Goal ${goal.id} (${goal.title}) is semanticKind=${semanticKind} but is not atomic.`,
        )
      }
      if (clusterOnlyKind && isAtomicGoal(goal)) {
        addIssue(
          'error',
          landscape.landscapeId,
          `[${RULE_SCOPED_FULL_ROUTE_COVERAGE}] Goal ${goal.id} (${goal.title}) is semanticKind=${semanticKind} but has no canonical children.`,
        )
      }
      if (semanticKind !== 'curricularAtomic' || landscape.landscapeId !== CANONICAL_GYM_MATH_LANDSCAPE_ID) return
      const rawGoal = rawSemanticGoalById.get(goal.id)!
      if (mathQaProfiles.some(profile => profile.clusterSelector(rawGoal))) return
      addIssue(
        'error',
        landscape.landscapeId,
        `[${RULE_SCOPED_FULL_ROUTE_COVERAGE}] Curricular atomic goal ${goal.id} (${goal.title}) belongs to neither the Sek-I nor the Sek-II hard route profile.`,
      )
    })
  }

  const validateGoal = (goal: UiGoal) => {
    const authoritativeSemanticKind = semanticRoutes.ownerByGoalId.get(goal.id) === landscape.landscapeId
      ? semanticRoutes.semanticKindByGoalId.get(goal.id)
      : goal.semanticKind
    validateOrientationMotivationStructure(goal, authoritativeSemanticKind).forEach((finding) => {
      addIssue(
        'error',
        landscape.landscapeId,
        `[${RULE_ORIENTATION_MOTIVATION_STRUCTURE}] Goal ${goal.id} (${goal.title}): ${finding.message}`,
      )
    })

    if (goal.examData) {
      const markdownFields = [
        ['taskContent', goal.examData.taskContent],
        ['taskContentEn', goal.examData.taskContentEn],
        ['solutionContent', goal.examData.solutionContent],
        ['solutionContentEn', goal.examData.solutionContentEn],
      ] as const
      for (const [fieldName, markdown] of markdownFields) {
        if (typeof markdown !== 'string') continue
        for (const finding of findExamMarkdownTableIssues(markdown)) {
          addIssue(
            'error',
            landscape.landscapeId,
            `[${RULE_EXAM_MARKDOWN_TABLES}] Goal ${goal.id} (${goal.title}) examData.${fieldName}, lines ${finding.startLine}-${finding.endLine}: ${finding.message}.`,
          )
        }
      }
    }

    const legacyLinkFields = getLegacyGoalLinkFields(goal)
    if (legacyLinkFields.length > 0) {
      addIssue(
        graphRuleIssueLevel,
        landscape.landscapeId,
        `[${RULE_NO_LEGACY_LINK_FIELDS}] Goal ${goal.id} (${goal.title}) uses legacy link field(s): ${legacyLinkFields.join(', ')}. Use canonical resourceLinks instead.`,
      )
    }

    const canonicalType = isAtomicGoal(goal) ? 'atomic' : 'cluster'
    if (goal.type === 'atomic' && canonicalType !== 'atomic') {
      addIssue(
        graphRuleIssueLevel,
        landscape.landscapeId,
        `[${RULE_EXPLICIT_TYPE_CONSISTENCY}] Goal ${goal.id} (${goal.title}) declares type "atomic" but has direct contains children.`,
      )
    }
    if (goal.type === 'cluster' && canonicalType !== 'cluster') {
      addIssue(
        graphRuleIssueLevel,
        landscape.landscapeId,
        `[${RULE_EXPLICIT_TYPE_CONSISTENCY}] Goal ${goal.id} (${goal.title}) declares type "cluster" but has no direct contains children.`,
      )
    }

    if (!isAllowedPhase(goal.phase)) {
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

        if (!resolved) resolved = canResolveRetainedGymnasiumReference(
          curriculaDir, landscape.file, ref.includes(':') ? landscapeId : '', goalId, retainedGymnasiumSources,
        )
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

  for (const profile of requiredSemanticProfiles) {
    if (profile.landscapeId !== landscape.landscapeId) continue

    const scopedGoals = landscape.goals.filter(goal => {
      const rawGoal = rawSemanticGoalById.get(goal.id)
      return rawGoal !== undefined && profile.goalSelector(rawGoal)
    })
    const missingAnchorIds = profile.motivationAnchorGoalIds.filter((goalId) => !localMap.has(goalId))
    const anchorLabels = profile.motivationAnchorGoalIds
      .map((goalId) => {
        const goal = localMap.get(goalId)
        return goal ? `${goal.id} (${goal.title})` : goalId
      })
      .join(', ')

    if (missingAnchorIds.length > 0) {
      addIssue(
        graphRuleIssueLevel,
        landscape.landscapeId,
        `[${RULE_SCOPED_TRANSITIVE_TO_MOTIVATION}] Configured motivation anchor(s) ${missingAnchorIds.join(', ')} are missing for scope ${profile.scopeLabel}.`,
      )
      continue
    }

    scopedGoals.forEach((goal) => {
      if (profile.motivationAnchorGoalIds.includes(goal.id)) return
      if (profile.motivationAnchorGoalIds.some((anchorGoalId) => hasPathToTarget(goal.id, anchorGoalId, effectiveEdges))) return

      addIssue(
        graphRuleIssueLevel,
        landscape.landscapeId,
        `[${RULE_SCOPED_TRANSITIVE_TO_MOTIVATION}] Scoped node ${goal.id} (${goal.title}) has no transitive effective-requires path to any motivation anchor (${anchorLabels}) for scope ${profile.scopeLabel}.`,
      )
    })
  }

  for (const profile of routeProfiles.filter((candidate) => candidate.landscapeId === landscape.landscapeId)) {
    const coverage = evaluateDirectAtomicRouteCoverage(landscape.source, profile)
    for (const detail of coverage.details) addIssue('error', landscape.landscapeId, `[CQR-102] ${profile.profileId}: ${detail}`)
  }

  for (const profile of requiredSemanticProfiles) {
    if (profile.landscapeId !== landscape.landscapeId) continue
    validateHardDirectAtomicRoutes(
      semanticRoutes.goals,
      semanticRoutes.semanticKindByGoalId,
      profile,
    ).forEach((finding) => {
      const goal = finding.goalId ? localMap.get(finding.goalId) : undefined
      const goalLabel = goal ? ` ${goal.id} (${goal.title})` : finding.goalId ? ` ${finding.goalId}` : ''
      addIssue(
        'error',
        landscape.landscapeId,
        `[${RULE_SCOPED_FULL_ROUTE_COVERAGE}]${goalLabel} ${finding.message}`,
      )
    })
  }

  // GVR-007:
  // MIT OCW atomic goals must provide intensive source linking:
  // - canonical resourceLinks include concept/practice/assessment
  // - required links point to OCW course pages
  const isMitOcwLandscape = (landscape.frameworkId ?? '').startsWith('mit-ocw-')
  const rootGoal = landscape.goals.find((goal) => goal.tags?.includes('root')) ?? landscape.goals[0]
  const rootTags = rootGoal?.tags ?? []
  const isMitOcwModuleLandscape = rootTags.some((tag) => {
    const normalized = (tag ?? '').toLowerCase()
    return normalized.startsWith('module:') || normalized.startsWith('modul:')
  })

  if (isMitOcwLandscape && isMitOcwModuleLandscape) {
    const requiredSourceTypes = ['concept', 'practice', 'assessment']

    landscape.goals
      .filter((goal) => isAtomicGoal(goal))
      .forEach((goal) => {
        const goalLabel = `${goal.id} (${goal.title})`
        const sourceLinks = getCanonicalResourceLinks(goal)

        if (sourceLinks.length === 0) {
          addIssue(
            graphRuleIssueLevel,
            landscape.landscapeId,
            `[${RULE_MIT_ATOMIC_SOURCE_LINKS}] Atomic goal ${goalLabel} is missing canonical resourceLinks.`,
          )
          return
        }
        const typeToLinkCount = new Map<string, number>()
        const typeHasValidOcwCourseUrl = new Map<string, boolean>()

        sourceLinks.forEach((link) => {
          const type = typeof link.type === 'string' ? link.type.trim().toLowerCase() : ''
          const url = typeof link.url === 'string' ? link.url : ''

          if (!type) return
          typeToLinkCount.set(type, (typeToLinkCount.get(type) ?? 0) + 1)

          const isValidOcwCourseUrl = url.startsWith('https://ocw.mit.edu/courses/')
          if (!typeHasValidOcwCourseUrl.has(type)) {
            typeHasValidOcwCourseUrl.set(type, isValidOcwCourseUrl)
          } else if (isValidOcwCourseUrl) {
            typeHasValidOcwCourseUrl.set(type, true)
          }
        })

        requiredSourceTypes.forEach((requiredType) => {
          const linkCount = typeToLinkCount.get(requiredType) ?? 0

          if (linkCount === 0) {
            addIssue(
              graphRuleIssueLevel,
              landscape.landscapeId,
              `[${RULE_MIT_ATOMIC_SOURCE_LINKS}] Atomic goal ${goalLabel} is missing source link type "${requiredType}".`,
            )
            return
          }

          if (!typeHasValidOcwCourseUrl.get(requiredType)) {
            addIssue(
              graphRuleIssueLevel,
              landscape.landscapeId,
              `[${RULE_MIT_ATOMIC_SOURCE_LINKS}] Atomic goal ${goalLabel} has no valid OCW course URL for "${requiredType}" links.`,
            )
          }
        })
      })
  }

  if (landscape.landscapeId === CANONICAL_GYM_MATH_LANDSCAPE_ID) {
    const outlookFindings = validateOrientationOutlooks(
      landscape.goals,
      semanticRoutes.semanticKindByGoalId,
      mathQaProfiles.flatMap(profile => profile.motivationAnchorGoalIds.map(orientationGoalId => ({
        orientationGoalId,
        scopeLabel: `${profile.profileId} orientation outlook`,
        stageGoalSelector: (goal) => {
          const rawGoal = rawSemanticGoalById.get(goal.id)
          return rawGoal !== undefined && profile.clusterSelector(rawGoal)
        },
      }))),
    )
    for (const finding of outlookFindings) {
      const pathPart = finding.pathId ? ` path=${finding.pathId}` : ''
      addIssue(
        'error',
        landscape.landscapeId,
        `[${RULE_ORIENTATION_OUTLOOK_INTEGRITY}] Orientation ${finding.orientationGoalId}${pathPart}: ${finding.message}`,
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

      const unknownIds = manifestIds.filter((id) =>
        !landscapeById.has(id) && !compatibilityArchiveLandscapeIds.has(id),
      )
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

semanticRoutes.assertInputsCurrent()
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
