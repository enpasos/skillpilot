import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  defaultMemoryCardReviewConfigDir,
  discoverMemoryCardReviewConfigs,
} from './memoryCardReviewConfigDiscovery'

type Mode = 'check' | 'report'

interface Args {
  configDir: string
  mode: Mode
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDir, '..')

function usage(): string {
  return `Usage:
  npm run quality:memory-card-review:check:all
  npm run quality:memory-card-review:report:all

Options:
  --mode=check|report      Run check mode or regenerate reports. Default: check.
  --config-dir=<path>      Directory containing *.config.json files.
`
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    configDir: defaultMemoryCardReviewConfigDir,
    mode: 'check',
  }

  argv.forEach((arg) => {
    if (arg === '--help' || arg === '-h') {
      console.log(usage())
      process.exit(0)
    }
    if (arg === '--mode=check') {
      args.mode = 'check'
      return
    }
    if (arg === '--mode=report') {
      args.mode = 'report'
      return
    }
    if (arg.startsWith('--config-dir=')) {
      args.configDir = arg.slice('--config-dir='.length)
      return
    }
    throw new Error(`Unknown argument: ${arg}`)
  })

  return args
}

function runReview(configPath: string, mode: Mode): void {
  const script = mode === 'report'
    ? 'quality:memory-card-review:report'
    : 'quality:memory-card-review:check'
  execFileSync('npm', ['run', script, '--', `--config=${configPath}`], {
    cwd: appRoot,
    stdio: 'inherit',
  })
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const configs = discoverMemoryCardReviewConfigs(args.configDir)
  console.log(`Memory-card review configs: ${configs.length}`)
  configs.forEach(({ configPath }) => runReview(configPath, args.mode))
}

main()
