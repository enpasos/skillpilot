import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs, checkGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from './goalBookSourceAtlasInputs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
if (args[0] !== '--config' || !args[1] || args.length > 3 || (args[2] && args[2] !== '--check')) {
  throw new Error('Usage: tsx scripts/buildGoalBookSourceAtlasInputs.ts --config <repository-relative inputs.json> [--check]')
}
const result = args[2] === '--check' ? checkGoalBookSourceAtlasInputs(args[1], root) : buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(args[1], root), root)
if (args[2] !== '--check') for (const [path, bytes] of Object.entries(result.outputs)) {
  const absolute = resolve(root, path)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, bytes)
}
console.log(`${args[2] === '--check' ? 'PASS' : 'Generated'} source atlas inputs: ${JSON.stringify(result.receipt.counts)}`)
