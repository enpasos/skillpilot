// SPDX-License-Identifier: Apache-2.0
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { SkillLandscape } from '../../src/landscapeTypes'

/** Live validator inventory; QA packages retain immutable historical snapshots. */
export function loadGraphValidationLandscapes(directory: string): Array<{ file: string; landscape: SkillLandscape }> {
  const landscapes: Array<{ file: string; landscape: SkillLandscape }> = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'quality') landscapes.push(...loadGraphValidationLandscapes(file))
    } else if (entry.name.endsWith('.json')) {
      const landscape = JSON.parse(readFileSync(file, 'utf8')) as SkillLandscape
      if (landscape && (landscape.landscapeId ?? (landscape as { id?: string }).id) && Array.isArray(landscape.goals)) {
        landscapes.push({ file, landscape })
      }
    }
  }
  return landscapes
}
