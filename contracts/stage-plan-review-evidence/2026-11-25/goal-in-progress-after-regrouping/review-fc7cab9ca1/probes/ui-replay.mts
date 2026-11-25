import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const revisions = JSON.parse(readFileSync(resolve(root, 'comparison.actual.json'), 'utf8'))
const { getNextSingleLearnerFocus } = await import(pathToFileURL(resolve(process.argv[2], 'app/src/utils/learnerFocus.ts')).href)
const results = Object.entries(revisions).map(([commit, value]) => {
  const visible = (value as {visible: { storedFocus: string[]; learnerStateFocus: string[] }}).visible
  const [section] = visible.storedFocus
  const current = new Set(visible.learnerStateFocus)
  const next: Set<string> = getNextSingleLearnerFocus(current, section)
  const returnsBeforePut = next.size === current.size && Array.from(next).every(id => current.has(id))
  return {commit, selected: [...current], click: section, returnsBeforePut}
})
console.log(JSON.stringify(results, null, 2))
