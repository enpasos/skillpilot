import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

type Component = 'extraction' | 'review'
interface SelectedPackage {
  landscapeId: string
  jurisdiction: string
  extraction: { path: string, registered: string[] }
  review: { path: string, registered: string[] }
}

const validator = fileURLToPath(new URL('../../scripts/current_source_packages.py', import.meta.url))
const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const cache = new Map<string, SelectedPackage[]>()

export function readCurrentSourcePackages(root: string): SelectedPackage[] {
  const registry = resolve(root, 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json')
  if (resolve(root) !== repositoryRoot && !existsSync(registry)) return []
  let selections = cache.get(root)
  if (!selections) {
    selections = JSON.parse(execFileSync('python3', [validator, root], { encoding: 'utf8' })) as SelectedPackage[]
    cache.set(root, selections)
  }
  return selections
}

/** Replace registered historical inputs even for explicitly scoped book builds.
 * Full discovery includes the current file whether or not its predecessor was found. */
export function currentSourcePaths(
  root: string, discovered: string[], component: Component, discoveryDirectory?: string,
): string[] {
  const selections = readCurrentSourcePackages(root)
  const replacements = new Map<string, string>()
  const included = new Set<string>()
  const directory = discoveryDirectory && resolve(root, discoveryDirectory) + sep
  for (const selected of selections) {
    for (const path of selected[component].registered) {
      replacements.set(path, selected[component].path)
      if (directory && resolve(root, path).startsWith(directory)) included.add(selected[component].path)
    }
  }
  const files = discovered.map((path) => {
    const local = relative(root, resolve(root, path))
    const current = replacements.get(local)
    if (current) return current
    // Other subjects and independently mapped legacy landscapes share these directories.
    for (const selected of selections) {
      const area = component === 'review' ? 'mapping/' + selected.jurisdiction
        : 'input/' + selected.jurisdiction.replace(/^DE-/, '')
      if (!local.startsWith('curricula/DE/Gymnasium/' + area + '/')) continue
      const doc = JSON.parse(readFileSync(resolve(root, local), 'utf8'))
      if (doc.sourceLandscapeId === selected.landscapeId && (component === 'extraction' || doc.sourceExtractionPath)) {
        throw new Error('Unregistered edition of a versioned source: ' + local)
      }
    }
    return path
  })
  return [...new Set([...files, ...included])]
}
