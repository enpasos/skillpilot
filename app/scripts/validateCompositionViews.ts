import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  compileCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionViewFinding,
} from '../src/utils/authoring/compositionViewAuthoring'
import {
  normalizeCanonicalLandscape,
  type CanonicalAuthoringLandscape,
} from '../src/utils/authoring/canonicalAuthoring'

interface CompositionViewValidationFinding extends CompositionViewFinding {
  viewId: string
  viewPath: string
  landscapeId: string
}

const CANONICAL_DE_MATH_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const CANONICAL_DE_MATH_VIEW_ID_PATTERN = /^de-de-gym-(?:seki|sekii-math-(?:gk|lk)|math-(?:gk|lk))$/u
const NAKED_PHASE_LABEL_PATTERN = /^(?:E-Phase|Q[1-4])$/u
const PHASE_SUPPORT_LABEL_PATTERN = /^(?:Lernkarten|Flashcards|Übungen|Uebungen|Practice(?: Set)?)\s*[-–]\s*(?:E-Phase|Q[1-4])$/u

const normalizeLearnerFacingLabel = (value: string) => value
  .normalize('NFKC')
  .toLocaleLowerCase('de-DE')
  .replace(/\s+/gu, ' ')
  .replace(/^q[1-4][.:]\s*/u, '')
  .replace(/^e-phase:\s*/u, '')
  .replace(/\s+\(sek(?:undarstufe)?\s*i{1,2}\)$/u, '')
  .replace(/\s+\((?:gk|lk)\)$/u, '')
  .trim()

const collectCanonicalMathTreeFindings = (
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  const findings: CompositionViewFinding[] = []

  const visit = (node: CompiledCompositionPreviewNode, path: string) => {
    if (NAKED_PHASE_LABEL_PATTERN.test(node.label)) {
      findings.push({
        code: 'CPV-201',
        severity: 'error',
        nodePath: path,
        message: `Nackter Phasenknoten im learner-facing Baum: ${node.label}`,
      })
    }

    if (PHASE_SUPPORT_LABEL_PATTERN.test(node.label)) {
      findings.push({
        code: 'CPV-202',
        severity: 'error',
        nodePath: path,
        message: `Phasenkodierter Support-Knoten im learner-facing Baum: ${node.label}`,
      })
    }

    node.children.forEach((child, index) => visit(child, `${path}.${index}`))
  }

  rootNodes.forEach((node, index) => visit(node, `${index}`))
  return findings
}

const collectGenericTreeFindings = (
  rootNodes: CompiledCompositionPreviewNode[],
): CompositionViewFinding[] => {
  const findings: CompositionViewFinding[] = []

  const visit = (node: CompiledCompositionPreviewNode, path: string, parent?: CompiledCompositionPreviewNode) => {
    if (parent) {
      const parentLabel = normalizeLearnerFacingLabel(parent.label)
      const childLabel = normalizeLearnerFacingLabel(node.label)
      if (parentLabel && parentLabel === childLabel) {
        findings.push({
          code: 'CPV-203',
          severity: 'error',
          nodePath: path,
          message: `Redundante Parent-Child-Kette mit gleichem learner-facing Label: ${parent.label} -> ${node.label}`,
        })
      }
    }

    node.children.forEach((child, index) => visit(child, `${path}.${index}`, node))
  }

  rootNodes.forEach((node, index) => visit(node, `${index}`))
  return findings
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const canonicalRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical')
const compositionViewRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views')

const collectFiles = (directory: string, predicate: (fileName: string) => boolean, target: string[] = []): string[] => {
  let entries: ReturnType<typeof readdirSync>
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return target
  }

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFiles(absolutePath, predicate, target)
      continue
    }
    if (!entry.isFile()) continue
    if (!predicate(entry.name)) continue
    target.push(absolutePath)
  }

  return target
}

const canonicalFiles = collectFiles(canonicalRoot, (fileName) => extname(fileName).toLowerCase() === '.json')
const compositionViewFiles = collectFiles(compositionViewRoot, (fileName) => /\.view\.json$/i.test(fileName))

const canonicalByLandscapeId = new Map<string, { path: string, landscape: CanonicalAuthoringLandscape }>()
const canonicalUniverseGoals: CanonicalAuthoringLandscape['goals'] = []

for (const canonicalPath of canonicalFiles) {
  try {
    const normalized = normalizeCanonicalLandscape(JSON.parse(readFileSync(canonicalPath, 'utf8')))
    if (!normalized.landscapeId) continue
    canonicalByLandscapeId.set(normalized.landscapeId, {
      path: canonicalPath,
      landscape: normalized,
    })
    canonicalUniverseGoals.push(...normalized.goals)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
    console.error(`❌ [canonical-load] ${canonicalPath} konnte nicht geladen werden: ${message}`)
    process.exit(1)
  }
}

const canonicalGoalUniverse: CanonicalAuthoringLandscape = normalizeCanonicalLandscape({
  landscapeId: '__composition-view-goal-universe__',
  frameworkId: '__composition-view-goal-universe__',
  title: 'Composition View Goal Universe',
  locale: 'de-DE',
  country: 'DE',
  region: 'DEU',
  schoolType: 'Gymnasium',
  subject: 'Canonical Goal Universe',
  goals: canonicalUniverseGoals,
})
const canonicalLandscapeUniverseById = new Map(
  Array.from(canonicalByLandscapeId.entries()).map(([landscapeId, match]) => [landscapeId, match.landscape]),
)

const findings: CompositionViewValidationFinding[] = []

for (const viewPath of compositionViewFiles) {
  try {
    const normalizedView = normalizeCompositionView(JSON.parse(readFileSync(viewPath, 'utf8')))
    const canonicalMatch = canonicalByLandscapeId.get(normalizedView.landscapeId)
    const result = compileCompositionView(
      normalizedView,
      canonicalMatch?.landscape ?? null,
      canonicalGoalUniverse,
      canonicalLandscapeUniverseById,
    )
    const additionalFindings = [
      ...collectGenericTreeFindings(result.compiledRootNodes),
      ...(normalizedView.landscapeId === CANONICAL_DE_MATH_ID
      && CANONICAL_DE_MATH_VIEW_ID_PATTERN.test(normalizedView.viewId)
        ? collectCanonicalMathTreeFindings(result.compiledRootNodes)
        : []),
    ]

    ;[...result.findings, ...additionalFindings].forEach((finding) => {
      findings.push({
        ...finding,
        viewId: normalizedView.viewId || '(missing-view-id)',
        viewPath,
        landscapeId: normalizedView.landscapeId || '(missing-landscape-id)',
      })
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
    findings.push({
      code: 'CPV-000',
      severity: 'error',
      message: `Composition View konnte nicht geladen werden: ${message}`,
      viewId: '(load-error)',
      viewPath,
      landscapeId: '(unknown)',
    })
  }
}

findings.sort((left, right) => {
  const leftKey = `${left.severity}:${left.code}:${left.viewPath}:${left.nodePath ?? ''}:${left.goalId ?? ''}:${left.message}`
  const rightKey = `${right.severity}:${right.code}:${right.viewPath}:${right.nodePath ?? ''}:${right.goalId ?? ''}:${right.message}`
  return leftKey.localeCompare(rightKey, 'de', { numeric: true, sensitivity: 'base' })
})

for (const finding of findings) {
  const tag = finding.severity === 'error' ? '❌' : '⚠️'
  const nodePathPart = finding.nodePath ? ` [nodePath=${finding.nodePath}]` : ''
  const goalPart = finding.goalId ? ` ${finding.goalId}` : ''
  console.log(`${tag} [${finding.viewId}] [${finding.code}]${nodePathPart}${goalPart} ${finding.message} (${finding.viewPath})`)
}

const errors = findings.filter((finding) => finding.severity === 'error')
const warnings = findings.filter((finding) => finding.severity === 'warning')

if (findings.length === 0) {
  console.log(`✅ ${compositionViewFiles.length} composition view(s) passed validation.`)
} else {
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`)
}

console.log(`Validated composition views: ${compositionViewFiles.length}`)
console.log(`Canonical landscape registry size: ${canonicalByLandscapeId.size}`)

process.exit(errors.length > 0 ? 1 : 0)
