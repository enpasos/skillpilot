import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Reviewed collision cases only, NOT a German spelling dictionary and never an
// auto-corrector. In these scientific terms oe is two letters, not an umlaut.
export const reviewedSpellingCollisions = [
  ['fotöffekt', 'Fotoeffekt'],
  ['photöffekt', 'Photoeffekt'],
  ['fotölektr', 'fotoelektr…'],
  ['photölektr', 'photoelektr…'],
  ['köffizient', 'Koeffizient'],
]

export const findReviewedSpellingIssues = (value, path = '$') => {
  if (typeof value === 'string') {
    const lower = value.toLocaleLowerCase('de-DE')
    return reviewedSpellingCollisions
      .filter(([incorrect]) => lower.includes(incorrect))
      .map(([incorrect, expected]) => ({ path, incorrect, expected }))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      findReviewedSpellingIssues(child, `${path}.${key}`))
  }
  return []
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const checkCanonicalCurriculumSpelling = () => {
  const issues = []
  for (const subject of ['MATHEMATIK', 'PHYSIK']) {
    const file = `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${subject}.de.json`
    const landscape = JSON.parse(readFileSync(resolve(repoRoot, file), 'utf8'))
    for (const goal of landscape.goals) {
      for (const issue of findReviewedSpellingIssues(goal)) {
        issues.push({ file, goalId: goal.id, ...issue })
      }
    }
  }
  return issues
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const issues = checkCanonicalCurriculumSpelling()
  for (const issue of issues) {
    console.error(`${issue.file} ${issue.goalId} ${issue.path}: ${issue.incorrect}; expected ${issue.expected}`)
  }
  if (issues.length) {
    console.error('CHECK curriculum_spelling FAIL: review each reported field; never apply global ae/oe/ue replacement.')
    process.exitCode = 1
  } else {
    console.log('CHECK curriculum_spelling PASS subjects=mathematik,physik reviewed-collisions-only')
  }
}
