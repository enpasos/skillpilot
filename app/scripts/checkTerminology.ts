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
  // Submitted V1 demo evidence stays immutable after retirement of the review.
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
 * Exact reviewed legacy-wording occurrences, including historical review prose.
 *
 * These are deliberately narrower than an allowed phrase or a file exclusion:
 * moving or changing the approved wording makes this baseline stale and fails
 * the check until the occurrence is reviewed again.
 */
const grandfatheredOccurrences: GrandfatheredOccurrence[] = [
  {
    ruleId: 'TRM-001',
    path: 'app/scripts/testPublicOverviewUi.tsx',
    line: 59,
    column: 78,
    found: 'Wissenslandschaften',
    lineSha256: '684fbf08d53b563eea7b2e73cf0e8151727f1eda5bc44c4ae45db270c4a5c2e3',
  },
  {
    ruleId: 'TRM-001',
    path: 'app/scripts/testPublicOverviewUi.tsx',
    line: 96,
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
    line: 537,
    column: 30,
    found: 'Wissenslandschaften',
    lineSha256: '863fbedf7aef561bd4fd6868d4e7d13d61b0d1a107fbb2b00c8e0fedcd4275e9',
  },
  // Preserve the original wording in two point-in-time AI image-review records.
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-probability-notation-20260921-v1/52e57eb5-7cd1-5df0-a8c6-7b090f097d9f/ai_candidate-review.json',
    line: 85,
    column: 50,
    found: 'Lernlandschaft',
    lineSha256: '3b6aefda6b8790a14f8f5b8183182dc00a9e749840613f2399b4455d09384428',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-probability-notation-20260921-v1/52e57eb5-7cd1-5df0-a8c6-7b090f097d9f/ai_candidate-review.md',
    line: 23,
    column: 31,
    found: 'Lernlandschaft',
    lineSha256: '93292fa26ce4d15b2ab87d8689386b2eb73b7169e83fdff73dc1e90240145718',
  },
  // Preserve the exact text sent to the image generator in this dated prompt record.
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-m7-global-inquiry-20260930-v1/generation-prompts.md',
    line: 7,
    column: 163,
    found: 'learning landscape',
    lineSha256: 'd56397c29971e66420b28775bc935dacf9279e30bcc372cac29ea6db7a41b749',
  },
  // Preserve exact original Economics provider inputs and their provenance quotes.
  // Independently reviewed in wirtschaft-37-historical-provider-wording-exact-eligibility-20261008-v1.
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/047ce369-b605-5cc6-8363-c5d288f5e938/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'a6fd6a68b026c29284d7dd843f0ae141e7087e5026c34181595d584958c68068',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/13b6317a-d42a-5a13-8358-c85d883cb4c7/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'ab2f7b2ef0bbada726ee579b56bb80d08bcd47db20c6f58d44323905b762b507',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/1d989a89-4b1b-53d3-86ab-dd4986fc5839/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'f62047a68cf587b493cb55f59b9f35d7ebff116accd86b4d5e7b709c199a7b71',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/40676995-14fc-55a9-89ae-440b2ee3ab33/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: '7d936eaf5421f2f290291dc2847a45ec0f911ae6fb9ac58aa228cad318dd1fed',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/52e6731e-71e9-53b1-8bb9-b03da445decf/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: '0b95f797ca08e9f24eb7f2e3e15f306269367424da2f805dc48c5c811dbf68c9',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/8ad94aeb-81ad-58ce-8792-c691f97efd53/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'd0f034eaf1bb2642c30ba29abaa38c359985e202e85d64adff91b147f0051eed',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/a2eda0df-6c5e-5fb5-bc64-8f6127eae50b/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'bf50676d1dfeaa1d76acbe10043238d4cee786ae1fc8618a5f82002ac64a021b',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/a60e0541-80e1-5f94-86fd-073f5a00bee8/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: '72f3e0541aafa148ab5336ce311698d1fd2e33ede7648d34a325c42252516216',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/d3c11bfa-103c-5b58-8183-561e0b076251/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'e76af3fd782223cbd346539a9d35a6615f0d7194bad2bbf0656699d6f5d8a75d',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/e2ac2cc2-894a-5e61-8acb-f5d88811739d/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'd4c5ad4494cf34d5d851a396a41b671f11da6accae6adb0f766a91b66bc5a236',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/e3cd6940-26f0-55a9-a348-4a90c245266c/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: '8c9f39afe1be4d196474ad0bc7c2ae7da521aa9ea5df6db19e616763d6a46319',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/e5b070d2-daa5-5b8e-8782-32bb8a6865d2/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'be39f7ae3323a0f29a3afa49ab76445a248b3d7c7d0d6b9734c0b9f3ad46fb0a',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/e9c4ec6b-9a54-579d-818f-87a7d39d4e3c/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: '3a58a3fb61f4b3b669d79ea79e21d450a58e60da9c1dc6a16452c7e4d2f60d0a',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/ee36cbaf-6a9d-5263-946f-7bb376aa0dfc/prompt.txt',
    line: 1,
    column: 88,
    found: 'learning landscape',
    lineSha256: '2439173ed7061707cc2ca41d6f957430c29e7eaaeca0551cd1eb20484d458d31',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 5,
    column: 103,
    found: 'learning landscape',
    lineSha256: 'd9654761325e853ee1e4ecf30cd50cc586bfd66b0b9f51d9cfefbac5a03777c8',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 10,
    column: 103,
    found: 'learning landscape',
    lineSha256: 'f980ee1f98d239821be3af2b111b33ee0975a52a1d57f0605d7f876fd33707aa',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 15,
    column: 103,
    found: 'learning landscape',
    lineSha256: '60eaecfbdae998c198ca0398b5e48ddb8bfdb8f309a6a46a5d387d0d5b3f22a9',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 20,
    column: 103,
    found: 'learning landscape',
    lineSha256: 'a5e9c680a4f9442622341af60567a4552cb3cd7098b30f3a462cb5dd92949651',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 25,
    column: 103,
    found: 'learning landscape',
    lineSha256: '04a17b81a1d7f960ded12d4b0ded06d37d0bd01ff04e53ffe7278a1168f9f84c',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 30,
    column: 103,
    found: 'learning landscape',
    lineSha256: '13b0eb5a825bd5c00163a362ecb0107e87f69a06446ebc6018edd0bdb05bc851',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 35,
    column: 103,
    found: 'learning landscape',
    lineSha256: '557d5279389a992ab738a04aefe85762d58006be65ca45afe66f0f8b556fb075',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 40,
    column: 103,
    found: 'learning landscape',
    lineSha256: '23b410b64b2936c4a06db94dd4cd8234a3a6fb0ed398e1d6ab0320108a1ce346',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 45,
    column: 103,
    found: 'learning landscape',
    lineSha256: '9274100cdc507e6c8595d5d9780216466dcf92064b1ebb84396e7aef5512ea94',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 50,
    column: 103,
    found: 'learning landscape',
    lineSha256: 'c1ac010ab2d5740991cb179614f7037d2a38c88e4d12e8e084a2c628630b4e7e',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 55,
    column: 103,
    found: 'learning landscape',
    lineSha256: '875de9da946e8fec7ac494514a940b40f2f6e47847af2cfc8174d577e7d0f66f',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 60,
    column: 103,
    found: 'learning landscape',
    lineSha256: '270a8985c1de4ce4d68a1cf64b8c0af82772e609609fe19af1b3a48616b46166',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 65,
    column: 103,
    found: 'learning landscape',
    lineSha256: '24b663c8f855fe7f9e8318daeeee6478fc7330ed3cf56d5d42086bcbf9859026',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-e2-fourteen-image-author-20261008-v1/jobs.author.json',
    line: 70,
    column: 103,
    found: 'learning landscape',
    lineSha256: '9b40cda2c6721ba937e9d1b17d57225922a6ab139cc678a4e4f996a0a6e07dcf',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/1d989a89-4b1b-53d3-86ab-dd4986fc5839/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'f62047a68cf587b493cb55f59b9f35d7ebff116accd86b4d5e7b709c199a7b71',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/40676995-14fc-55a9-89ae-440b2ee3ab33/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: '7d936eaf5421f2f290291dc2847a45ec0f911ae6fb9ac58aa228cad318dd1fed',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/52e6731e-71e9-53b1-8bb9-b03da445decf/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: '0b95f797ca08e9f24eb7f2e3e15f306269367424da2f805dc48c5c811dbf68c9',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/8ad94aeb-81ad-58ce-8792-c691f97efd53/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'd0f034eaf1bb2642c30ba29abaa38c359985e202e85d64adff91b147f0051eed',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/a2eda0df-6c5e-5fb5-bc64-8f6127eae50b/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'bf50676d1dfeaa1d76acbe10043238d4cee786ae1fc8618a5f82002ac64a021b',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/a60e0541-80e1-5f94-86fd-073f5a00bee8/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: '72f3e0541aafa148ab5336ce311698d1fd2e33ede7648d34a325c42252516216',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/e2ac2cc2-894a-5e61-8acb-f5d88811739d/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'd4c5ad4494cf34d5d851a396a41b671f11da6accae6adb0f766a91b66bc5a236',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/e3cd6940-26f0-55a9-a348-4a90c245266c/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: '8c9f39afe1be4d196474ad0bc7c2ae7da521aa9ea5df6db19e616763d6a46319',
  },
  {
    ruleId: 'TRM-001',
    path: 'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/e5b070d2-daa5-5b8e-8782-32bb8a6865d2/prompt.de.md',
    line: 19,
    column: 88,
    found: 'learning landscape',
    lineSha256: 'be39f7ae3323a0f29a3afa49ab76445a248b3d7c7d0d6b9734c0b9f3ad46fb0a',
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
  `Terminology check passed for ${scannedFiles.length} files with ${grandfatheredOccurrences.length} exact reviewed legacy occurrence(s).`,
)
