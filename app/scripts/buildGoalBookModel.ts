import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  loadGoalBookBuildInputs,
  writeGoalBookModel,
} from './goalBookModel'

const DEFAULT_CONFIG = fileURLToPath(new URL(
  './config/goal-books/de-de-gym-seki-math.json',
  import.meta.url,
))

const usage = () => {
  console.error('Usage: tsx scripts/buildGoalBookModel.ts [config.json]')
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length > 1 || args.includes('--help') || args.includes('-h')) {
    usage()
    process.exitCode = args.includes('--help') || args.includes('-h') ? 0 : 2
    return
  }

  const configPath = args[0] ? resolve(args[0]) : DEFAULT_CONFIG
  const { model, outputPath } = await loadGoalBookBuildInputs(configPath)
  await writeGoalBookModel(model, outputPath)
  console.log(`Goal-book model written: ${outputPath}`)
  console.log(`Pages: ${model.pages.length}; digest: ${model.digest}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
