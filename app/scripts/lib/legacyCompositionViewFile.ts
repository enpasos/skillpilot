import { existsSync, readFileSync } from 'node:fs'
import { assertSupportedCompositionViewFormat } from '../../src/utils/legacyCurriculumFormats'

export function readLegacyCompositionViewFile(path: string): string | null {
  if (!existsSync(path)) return null
  const bytes = readFileSync(path, 'utf8')
  assertSupportedCompositionViewFormat(JSON.parse(bytes), path)
  return bytes
}

export function readRequiredLegacyCompositionViewFile(path: string): string {
  const bytes = readLegacyCompositionViewFile(path)
  if (bytes === null) throw new Error(`Missing composition view: ${path}`)
  return bytes
}
