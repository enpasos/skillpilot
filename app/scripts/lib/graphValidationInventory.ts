// SPDX-License-Identifier: Apache-2.0
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import type { SkillLandscape } from '../../src/landscapeTypes'
import { loadCurrentCurriculumCatalog } from '../currentCurriculumCatalog'
import { liveVerificationInputs } from './verificationInputSnapshot'

/** Explicit compatibility source reads never join the live graph inventory. */
export function loadRetainedGymnasiumSourceLandscapes(directory: string): Array<{ file: string; landscape: SkillLandscape }> {
  const sourceDirectory = resolve(directory, 'DE/Gymnasium/input/BY/gymnasium')
  if (!existsSync(sourceDirectory)) return []
  return readdirSync(sourceDirectory, { withFileTypes: true }).filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => {
      const file = join(sourceDirectory, entry.name)
      return { file, landscape: JSON.parse(readFileSync(file, 'utf8')) as SkillLandscape }
    }).filter(({ landscape }) => !!landscape?.landscapeId && Array.isArray(landscape.goals))
}

export function canResolveRetainedGymnasiumReference(
  directory: string, consumerFile: string, landscapeId: string, goalId: string,
  sources: readonly { landscape: SkillLandscape }[],
): boolean {
  const consumerPath = relative(resolve(directory, 'DE/Gymnasium'), resolve(consumerFile))
  if (consumerPath !== '..' && !consumerPath.startsWith(`..${sep}`)) return false
  return sources.some(({ landscape }) => (!landscapeId || landscape.landscapeId === landscapeId)
    && landscape.goals.some(goal => goal.id === goalId))
}

/** Retained inputs and authoring evidence are never live Gymnasium graphs. */
export function loadGraphValidationLandscapes(directory: string): Array<{ file: string; landscape: SkillLandscape }> {
  directory = resolve(directory)
  const gymnasiumDirectory = join(directory, 'DE', 'Gymnasium')
  const gatedFiles = existsSync(gymnasiumDirectory)
    ? new Map(loadCurrentCurriculumCatalog(liveVerificationInputs, dirname(directory)).entries
      .map(entry => [resolve(dirname(directory), entry.path), entry.landscape.landscapeId]))
    : new Map<string, string>()
  const reservedGymnasiumDirectories = new Set(['input', 'quality', 'completion-profiles', 'completion-scopes'])
  const landscapes: Array<{ file: string; landscape: SkillLandscape }> = []
  const visit = (currentDirectory: string) => {
    for (const entry of readdirSync(currentDirectory, { withFileTypes: true })) {
      const file = join(currentDirectory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'quality'
          || (currentDirectory === gymnasiumDirectory && reservedGymnasiumDirectories.has(entry.name))) continue
        visit(file)
      } else if (entry.name.endsWith('.json')) {
        const landscape = JSON.parse(readFileSync(file, 'utf8')) as SkillLandscape
        const landscapeId = landscape?.landscapeId ?? (landscape as { id?: string } | null)?.id
        if (landscapeId && Array.isArray(landscape.goals)) {
          const gymnasiumPath = relative(gymnasiumDirectory, file)
          if (gymnasiumPath !== '..' && !gymnasiumPath.startsWith(`..${sep}`)
            && gatedFiles.get(file) !== landscapeId) {
            throw new Error(`Live Gymnasium landscape is outside the gated canonical catalog: ${file}`)
          }
          landscapes.push({ file, landscape })
        }
      }
    }
  }
  visit(directory)
  return landscapes
}
