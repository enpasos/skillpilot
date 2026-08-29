/**
 * Terminology guard.
 *
 * `docs/concept/glossary.md` is the human source of truth for SkillPilot's core
 * vocabulary. This check keeps retired synonyms from creeping back in after a
 * term has been consolidated, so that one concept keeps exactly one name.
 *
 * Scope policy: scan what is authored and live. Captured source snapshots and
 * archive records must keep the wording they had when they were captured, so
 * those trees are excluded here instead of being exempted rule by rule.
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

interface TerminologyRule {
  id: string
  /** Retired wording. Matched per line, case-insensitive unless stated. */
  retired: RegExp
  /** What to write instead. */
  use: string
  /** Why the retired wording was dropped. */
  why: string
  /** Longer phrase that legitimately contains the retired wording. */
  allowedPhrase?: RegExp
}

const rules: TerminologyRule[] = [
  {
    id: 'TRM-001',
    retired: /learning[ -]landscapes?|lernlandschaft(en)?|wissenslandschaft(en)?/gi,
    use: 'skill landscape / Skill-Landschaft',
    why: 'The target is skills, not the learning process and not knowledge.',
  },
  {
    id: 'TRM-002',
    retired: /LearningLandscape/g,
    use: 'SkillLandscape',
    why: 'The type follows the term: a skill landscape is one published instance of a skill graph.',
  },
  {
    id: 'TRM-003',
    retired: /competence[ -]graphs?|kompetenz-?graph(en)?/gi,
    use: 'skill graph / Skill-Graph',
    why: 'One concept, one name: the operative model is the skill graph.',
  },
  {
    id: 'TRM-004',
    retired: /curriculum[ -]graphs?/gi,
    use: 'skill graph / Skill-Graph',
    why: 'The curriculum is the normative source; the derived model is the skill graph.',
  },
  {
    id: 'TRM-005',
    retired: /goal graphs?/gi,
    use: 'skill graph / Skill-Graph',
    why: 'The formal specification and the product describe the same object.',
    allowedPhrase: /learning-goal graphs?/gi,
  },
]

/** Directories that never carry authored SkillPilot prose. */
const excludedDirectories = new Set([
  '.git',
  '.gradle',
  '.idea',
  'build',
  'dist',
  'node_modules',
  'site',
  'target',
  '__pycache__',
])

/**
 * Frozen evidence. These trees record what was captured at a point in time and
 * must not be rewritten when vocabulary changes.
 *
 * Hash-pinned packages are deliberately not listed here: a rename updates their
 * wording and their pinned digests together.
 */
const frozenEvidencePaths = [
  // Build output.
  'backend/src/main/resources/static',
  // Immutable point-in-time snapshots for explicitly approved review exceptions.
  'contracts/openai/skillpilot-coach-v1/review-evidence',
  // Retired landscapes and captured source snapshots behind coverage claims.
  'curricula/DE/Gymnasium/archive',
  'curricula/DE/Gymnasium/input',
  // Submitted V1 demo evidence is byte-frozen while the app is under review.
  'tools/demo-video/output/manual-review-de',
  'tools/demo-video/output/manual-review-en',
  'tmp',
]

interface GrandfatheredOccurrence {
  ruleId: string
  path: string
  line: number
  column: number
  found: string
  lineSha256: string
}

/**
 * Exact occurrences preserved by the active OpenAI review freeze.
 *
 * These are deliberately narrower than an allowed phrase or a file exclusion:
 * moving or changing the approved wording makes this baseline stale and fails
 * the check until the occurrence is reviewed again.
 */
const grandfatheredOccurrences: GrandfatheredOccurrence[] = [
  {
    ruleId: 'TRM-001',
    path: 'app/scripts/testPublicOverviewUi.tsx',
    line: 57,
    column: 78,
    found: 'Wissenslandschaften',
    lineSha256: '684fbf08d53b563eea7b2e73cf0e8151727f1eda5bc44c4ae45db270c4a5c2e3',
  },
  {
    ruleId: 'TRM-001',
    path: 'app/scripts/testPublicOverviewUi.tsx',
    line: 94,
    column: 30,
    found: 'Wissenslandschaften',
    lineSha256: 'd240409a7691214bdfde425a657b126c795f642ac87d53f6da873b3a1ce29e90',
  },
  {
    ruleId: 'TRM-001',
    path: 'app/src/utils/skillPilotOverviewCopy.ts',
    line: 97,
    column: 47,
    found: 'Wissenslandschaften',
    lineSha256: '7bebb5107399a1b5f33a292f96816ed3694ef40ae3d4b5a8cf1b6dd9af8ef8c7',
  },
  {
    ruleId: 'TRM-001',
    path: 'docs/deploy/openai-plugin-v1-review-freeze.md',
    line: 505,
    column: 30,
    found: 'Wissenslandschaften',
    lineSha256: '863fbedf7aef561bd4fd6868d4e7d13d61b0d1a107fbb2b00c8e0fedcd4275e9',
  },
]

/** This file lists the retired terms and would otherwise report itself. */
const rulesFile = 'app/scripts/checkTerminology.ts'

const scannedExtensions = new Set([
  '.java',
  '.js',
  '.json',
  '.jsonl',
  '.kts',
  '.md',
  '.mjs',
  '.py',
  '.sh',
  '.sql',
  '.ts',
  '.tsx',
  '.ttl',
  '.txt',
  '.yaml',
  '.yml',
])

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function isFrozenEvidence(relativePath: string): boolean {
  return frozenEvidencePaths.some(
    (frozen) => relativePath === frozen || relativePath.startsWith(`${frozen}/`),
  )
}

function collectScannableFiles(relativeDir: string): string[] {
  const absoluteDir = resolve(repoRoot, relativeDir)
  return readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name
    if (isFrozenEvidence(relativePath)) return []
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return []
      return collectScannableFiles(relativePath)
    }
    if (!entry.isFile()) return []
    if (relativePath === rulesFile) return []
    if (!scannedExtensions.has(extname(entry.name).toLowerCase())) return []
    return [relativePath]
  })
}

interface Violation {
  rule: TerminologyRule
  path: string
  line: number
  column: number
  found: string
  lineSha256: string
}

/**
 * Cheap pre-filter so that clean files cost one regex pass instead of one pass
 * per rule per line. Most of the scanned bytes are curriculum data.
 */
const anyRetiredTerm = new RegExp(rules.map((rule) => `(?:${rule.retired.source})`).join('|'), 'gi')

function findViolations(path: string, contents: string): Violation[] {
  anyRetiredTerm.lastIndex = 0
  if (!anyRetiredTerm.test(contents)) return []

  const violations: Violation[] = []
  contents.split('\n').forEach((line, index) => {
    for (const rule of rules) {
      const allowedRanges: Array<[number, number]> = []
      if (rule.allowedPhrase) {
        rule.allowedPhrase.lastIndex = 0
        let allowedMatch: RegExpExecArray | null
        while ((allowedMatch = rule.allowedPhrase.exec(line)) !== null) {
          allowedRanges.push([allowedMatch.index, allowedMatch.index + allowedMatch[0].length])
        }
      }

      rule.retired.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = rule.retired.exec(line)) !== null) {
        const start = match.index
        const end = start + match[0].length
        const covered = allowedRanges.some(([from, to]) => start >= from && end <= to)
        if (covered) continue
        violations.push({
          rule,
          path,
          line: index + 1,
          column: start + 1,
          found: match[0],
          lineSha256: createHash('sha256').update(line).digest('hex'),
        })
      }
    }
  })
  return violations
}

const scannedFiles = collectScannableFiles('')
const detectedViolations = scannedFiles.flatMap((path) => {
  const contents = readFileSync(resolve(repoRoot, path), 'utf8')
  return findViolations(toPosixPath(path), contents)
})

const consumedGrandfatheredOccurrences = new Set<number>()
const violations = detectedViolations.filter((violation) => {
  const grandfatheredIndex = grandfatheredOccurrences.findIndex(
    (occurrence, index) =>
      !consumedGrandfatheredOccurrences.has(index) &&
      occurrence.ruleId === violation.rule.id &&
      occurrence.path === violation.path &&
      occurrence.line === violation.line &&
      occurrence.column === violation.column &&
      occurrence.found === violation.found &&
      occurrence.lineSha256 === violation.lineSha256,
  )
  if (grandfatheredIndex < 0) return true
  consumedGrandfatheredOccurrences.add(grandfatheredIndex)
  return false
})
const staleGrandfatheredOccurrences = grandfatheredOccurrences.filter(
  (_, index) => !consumedGrandfatheredOccurrences.has(index),
)

if (violations.length > 0 || staleGrandfatheredOccurrences.length > 0) {
  if (violations.length > 0) {
    const shown = violations.slice(0, 40)
    console.error(`Terminology check failed: ${violations.length} retired term(s) found.\n`)
    for (const violation of shown) {
      console.error(
        `${violation.path}:${violation.line}:${violation.column}: "${violation.found}" [${violation.rule.id}]`,
      )
      console.error(`  use instead: ${violation.rule.use}`)
      console.error(`  why: ${violation.rule.why}`)
    }
    if (violations.length > shown.length) {
      console.error(`\n... and ${violations.length - shown.length} more.`)
    }
  }
  if (staleGrandfatheredOccurrences.length > 0) {
    console.error(
      `${violations.length > 0 ? '\n' : ''}Terminology check failed: ${staleGrandfatheredOccurrences.length} grandfathered occurrence(s) are stale.`,
    )
    for (const occurrence of staleGrandfatheredOccurrences) {
      console.error(
        `${occurrence.path}:${occurrence.line}:${occurrence.column}: expected "${occurrence.found}" [${occurrence.ruleId}]`,
      )
    }
  }
  console.error('\nDefinitions: docs/concept/glossary.md')
  console.error('Rules and scope policy: app/scripts/checkTerminology.ts')
  process.exit(1)
}

console.log(
  `Terminology check passed for ${scannedFiles.length} files with ${grandfatheredOccurrences.length} exact frozen occurrence(s).`,
)
