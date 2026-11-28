import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const extensionViewSchema = 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json'
const extensionMarkers = new Set(['electionGroups', 'extension', 'historicalAssessmentPlacements'])

function findExtensionMarker(value: unknown): string | undefined {
  if (value === null || typeof value !== 'object') return undefined

  for (const [key, nested] of Object.entries(value)) {
    if (extensionMarkers.has(key)) return key
    if (key === 'viewFormatVersion' && nested === '1.3') return 'viewFormatVersion 1.3'
    if (key === '$schema' && nested === extensionViewSchema) return '$schema 1.3'

    const marker = findExtensionMarker(nested)
    if (marker) return marker
  }

  return undefined
}

/** Temporary catalog gate until E1b filters the view used by the Cockpit. */
export function validateCatalogCompositionViewExtensions(curriculaRoot: string): void {
  const violations: string[] = []
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(path)
      } else if (/\.view\.json$/i.test(entry.name)) {
        const source: unknown = JSON.parse(readFileSync(path, 'utf8'))
        const marker = findExtensionMarker(source)
        if (marker) violations.push(`${relative(curriculaRoot, path)} (${marker})`)
      }
    }
  }

  visit(curriculaRoot)
  if (violations.length > 0) {
    throw new Error([
      'Catalog composition views cannot declare extensions until E1b.',
      '/api/ui/composition-views/match and the Cockpit tree use the unfiltered view, so unselected blocks would appear as regular targets.',
      ...violations.sort(),
    ].join('\n'))
  }
}
