// SPDX-License-Identifier: Apache-2.0
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyStagePlanMaterialization, buildStagePlanMaterialization,
} from './lib/stagePlanCatalog'

/** No import-time generation. The independent config declares the activated
 * plan IDs and owned output paths, without duplicating any goal placement.
 */
export function generateStagePlanViews(args: string[], repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')) {
  let mode: 'check' | 'write' | undefined, catalogPath: string | undefined, inventoryPath: string | undefined
  for (let index = 0; index < args.length; index++) {
    const argument = args[index]
    if (argument === '--write' || argument === '--check') {
      if (mode) throw new Error('Choose exactly one of --write and --check.')
      mode = argument === '--write' ? 'write' : 'check'
    } else if (argument === '--catalog' || argument === '--inventory') {
      const value = args[++index]
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}.`)
      if (argument === '--catalog') { if (catalogPath) throw new Error('Duplicate --catalog.'); catalogPath = value }
      else { if (inventoryPath) throw new Error('Duplicate --inventory.'); inventoryPath = value }
    } else throw new Error(`Unknown stage-plan argument: ${argument}`)
  }
  if (!mode || !inventoryPath) throw new Error('Usage: generateStagePlanViews.ts (--write|--check) --inventory <repository-relative activation.json> [--catalog <repository-relative catalog.json>]')
  const result = buildStagePlanMaterialization({ repositoryRoot, inventoryPath, catalogPath })
  const applied = applyStagePlanMaterialization(repositoryRoot, result, mode)
  console.log(`Stage-plan compatibility projections: ${result.index.plans.length} plans, ${result.index.plans.reduce((count, entry) => count + entry.plan.units.length, 0)} declared units, ${result.index.views.length} views, ${applied.changed.length} written, ${applied.checked} artifacts checked.`)
  return applied
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { generateStagePlanViews(process.argv.slice(2)) }
  catch (error) { console.error((error as Error).message); process.exitCode = 1 }
}
