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
  // Retired landscapes and captured source snapshots behind coverage claims.
  'curricula/DE/Gymnasium/archive',
  'curricula/DE/Gymnasium/input',
  // Submitted V1 demo evidence is byte-frozen while the app is under review.
  'tools/demo-video/output/manual-review-de',
  'tools/demo-video/output/manual-review-en',
  'tmp',
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
  found: string
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
        violations.push({ rule, path, line: index + 1, found: match[0] })
      }
    }
  })
  return violations
}

const scannedFiles = collectScannableFiles('')
const violations = scannedFiles.flatMap((path) => {
  const contents = readFileSync(resolve(repoRoot, path), 'utf8')
  return findViolations(toPosixPath(path), contents)
})

if (violations.length > 0) {
  const shown = violations.slice(0, 40)
  console.error(`Terminology check failed: ${violations.length} retired term(s) found.\n`)
  for (const violation of shown) {
    console.error(`${violation.path}:${violation.line}: "${violation.found}" [${violation.rule.id}]`)
    console.error(`  use instead: ${violation.rule.use}`)
    console.error(`  why: ${violation.rule.why}`)
  }
  if (violations.length > shown.length) {
    console.error(`\n... and ${violations.length - shown.length} more.`)
  }
  console.error('\nDefinitions: docs/concept/glossary.md')
  console.error('Rules and scope policy: app/scripts/checkTerminology.ts')
  process.exit(1)
}

console.log(`Terminology check passed for ${scannedFiles.length} files.`)
