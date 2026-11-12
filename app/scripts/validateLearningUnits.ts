// SPDX-License-Identifier: Apache-2.0
/**
 * Fail-closed check of every authored learning-unit catalog against the
 * canonical graph (rules R1, R3, R4; see lib/learningUnitContracts.ts).
 *
 *   tsx scripts/validateLearningUnits.ts
 *   tsx scripts/validateLearningUnits.ts --offered tmp/learning-units/offered-membership.json
 *
 * Exit code 0: valid, 1: rule findings, 2: unreadable or malformed input.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  UnitGraph, validateLearningUnitCatalogs, validateOfferedScopes,
  type LearningUnitCatalog, type OfferedMembershipClass, type UnitFinding, type UnitGraphLandscape,
} from './lib/learningUnitContracts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const learningUnitCatalogSchemaPath = 'contracts/drafts/learning-unit/v1/catalog.schema.json'

export function learningUnitCatalogSchemaErrors(value: unknown): string[] {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  const validate = ajv.compile(JSON.parse(readFileSync(resolve(root, learningUnitCatalogSchemaPath), 'utf8')))
  return validate(value) ? [] : (validate.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`)
}

// Same canonical catalog discovery as the transitive-minimality auditor.
function canonicalFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return canonicalFiles(path)
    return entry.isFile() && /\.json$/iu.test(entry.name) && !/_deck/iu.test(entry.name) ? [path] : []
  }).sort()
}

interface Options { canonical: string; units: string; offered?: string }
function parseArgs(args: string[]): Options {
  const options: Options = { canonical: 'curricula/DE/Gymnasium/canonical', units: 'curricula/DE/Gymnasium/learning-units' }
  for (let index = 0; index < args.length; index++) {
    const flag = args[index], value = args[index + 1]
    if (!['--canonical', '--units', '--offered'].includes(flag)) throw new Error(`Unknown argument: ${flag}`)
    if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`)
    options[flag.slice(2) as keyof Options] = value
    index++
  }
  return options
}

async function offeredClasses(path: string): Promise<OfferedMembershipClass[]> {
  const { decodeGoalSetBits } = await import('./reportMathPhysicsNativeInventory')
  const inventory = JSON.parse(readFileSync(resolve(root, path), 'utf8')) as {
    goalUniverseIds: string[]
    membershipClasses: Record<string, { landscapeId: string; targetBits: string; seedTargetBits?: string; members: string[] }>
  }
  if (!Array.isArray(inventory.goalUniverseIds) || !inventory.membershipClasses) throw new Error(`${path} is not an offered-membership inventory`)
  const classes = Object.entries(inventory.membershipClasses).map(([id, membership]) => {
    if (typeof membership.seedTargetBits !== 'string') throw new Error(`${path}: class ${id} lacks seedTargetBits; regenerate the inventory`)
    return {
      id, landscapeId: membership.landscapeId, members: membership.members,
      seedTargetGoalIds: new Set(decodeGoalSetBits(inventory.goalUniverseIds, membership.seedTargetBits)),
      targetGoalIds: new Set(decodeGoalSetBits(inventory.goalUniverseIds, membership.targetBits)),
    }
  })
  if (classes.length === 0) throw new Error(`${path} lists no membership class`)
  return classes
}

async function main(): Promise<number> {
  let options: Options, graph: UnitGraph, catalogs: LearningUnitCatalog[], offered: OfferedMembershipClass[] | undefined
  try {
    options = parseArgs(process.argv.slice(2))
    const landscapes = canonicalFiles(resolve(root, options.canonical))
      .map((path) => JSON.parse(readFileSync(path, 'utf8')) as Partial<UnitGraphLandscape>)
      .filter((value): value is UnitGraphLandscape => typeof value.landscapeId === 'string' && Array.isArray(value.goals))
    if (landscapes.length === 0) throw new Error(`No canonical landscape under ${options.canonical}`)
    graph = new UnitGraph(landscapes)
    const unitsDirectory = resolve(root, options.units)
    const files = !existsSync(unitsDirectory) ? [] : readdirSync(unitsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json')).map((entry) => resolve(unitsDirectory, entry.name)).sort()
    catalogs = files.map((path) => {
      const value: unknown = JSON.parse(readFileSync(path, 'utf8'))
      const errors = learningUnitCatalogSchemaErrors(value)
      if (errors.length) throw new Error(`${relative(root, path)} violates ${learningUnitCatalogSchemaPath}:\n  ${errors.join('\n  ')}`)
      return value as LearningUnitCatalog
    })
    if (options.offered) offered = await offeredClasses(options.offered)
  } catch (error) {
    console.error(`invalid-input: ${error instanceof Error ? error.message : String(error)}`)
    return 2
  }

  const result = validateLearningUnitCatalogs(catalogs, graph, {
    reviewRecordExists: (path) => existsSync(resolve(root, path)),
  })
  const findings: UnitFinding[] = [...result.findings, ...(offered ? validateOfferedScopes(catalogs, graph, offered) : [])]
  for (const ledger of result.ledgers) {
    const open = ledger.unownedGoals
    console.log(`${ledger.catalogId} (${ledger.landscapeId}, ${ledger.completeness}): ${ledger.ownedGoals}/${ledger.atomicGoals} atomic goals owned;`
      + ` without unit: ${open.ordinary} ordinary, ${open.assessment} assessment, ${open.memory} memory, ${open.orientation} orientation`)
  }
  for (const unit of result.units) {
    const own = unit.ownGoals
    console.log(`  ${unit.unitId}: ${unit.structurallyValid ? 'valid' : 'INVALID'};`
      + ` own ${own.ordinary} ordinary, ${own.assessment} assessment, ${own.memory} memory, ${own.orientation} orientation;`
      + ` total scope ${unit.totalScope}; reviewed coverage ${unit.goalsWithoutReviewedCoverage.length === 0 ? 'complete'
        : `missing for ${unit.goalsWithoutReviewedCoverage.length} goal(s)`}`)
  }
  for (const finding of findings) {
    console.error(`${finding.code} ${finding.catalogId}${finding.unitId ? `/${finding.unitId}` : ''}: ${finding.message}`)
  }
  const offeredNote = offered ? `, ${offered.length} offered membership classes checked` : ''
  console.log(`Learning-unit validation ${findings.length ? 'FAILED' : 'passed'}: ${catalogs.length} catalog(s), ${result.units.length} unit(s), ${findings.length} finding(s)${offeredNote}`)
  return findings.length ? 1 : 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main()
}
