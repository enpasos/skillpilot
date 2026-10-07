import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseAndValidateGoalBookModel } from './goalBookModel'
import {
  writeGoalBookHtml,
  writeGoalBookPdf,
  writeGoalBookRenderManifest,
} from './goalBookRenderer'
import type { GoalBookPrintDerivativeProfile } from './goalBookRenderer'

type CliOptions = {
  modelPath: string
  feedbackBaseUrl: string
  publicRoot: string
  htmlPath?: string
  pdfPath?: string
  chromiumExecutablePath?: string
  printDerivativeProfile?: GoalBookPrintDerivativeProfile
}

const DEFAULT_PUBLIC_ROOT = fileURLToPath(new URL('../public', import.meta.url))
const VALUE_FLAGS = new Set([
  '--model',
  '--feedback-base-url',
  '--public-root',
  '--html',
  '--pdf',
  '--chromium-executable-path',
  '--print-derivative-profile',
])

const usage = () => {
  console.error([
    'Usage:',
    '  tsx scripts/renderGoalBook.ts --model <book-model.json> --feedback-base-url <https-url> [--html <book.html>] [--pdf <book.pdf>] [--public-root <app/public>] [--chromium-executable-path <path>] [--print-derivative-profile standard|bounded-atlas]',
    '',
    'At least one of --html or --pdf is required. HTML retains deployable',
    'root-relative /assets/goal-visualizations/... URLs. PDF and layout checks',
    'serve bounded local print derivatives from --public-root without network access.',
  ].join('\n'))
}

const parseArgs = (): CliOptions | null => {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) return null
  const values = new Map<string, string>()
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index]
    if (!VALUE_FLAGS.has(flag)) throw new Error(`Unknown goal-book renderer argument: ${flag}`)
    const value = args[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`)
    if (values.has(flag)) throw new Error(`Duplicate goal-book renderer argument: ${flag}`)
    values.set(flag, value)
    index += 1
  }

  const modelPath = values.get('--model')
  const feedbackBaseUrl = values.get('--feedback-base-url')
  const htmlPath = values.get('--html')
  const pdfPath = values.get('--pdf')
  const printDerivativeProfile = values.get('--print-derivative-profile')
  if (!modelPath) throw new Error('--model is required')
  if (!feedbackBaseUrl) throw new Error('--feedback-base-url is required')
  if (!htmlPath && !pdfPath) throw new Error('At least one of --html or --pdf is required')
  if (
    printDerivativeProfile
    && printDerivativeProfile !== 'standard'
    && printDerivativeProfile !== 'bounded-atlas'
  ) {
    throw new Error('--print-derivative-profile must be standard or bounded-atlas')
  }

  return {
    modelPath: resolve(modelPath),
    feedbackBaseUrl,
    publicRoot: resolve(values.get('--public-root') ?? DEFAULT_PUBLIC_ROOT),
    ...(htmlPath ? { htmlPath: resolve(htmlPath) } : {}),
    ...(pdfPath ? { pdfPath: resolve(pdfPath) } : {}),
    ...(values.get('--chromium-executable-path')
      ? { chromiumExecutablePath: resolve(values.get('--chromium-executable-path')!) }
      : {}),
    ...(printDerivativeProfile
      ? { printDerivativeProfile: printDerivativeProfile as GoalBookPrintDerivativeProfile }
      : {}),
  }
}

const main = async () => {
  const options = parseArgs()
  if (options === null) {
    usage()
    return
  }
  const rawModel = await readFile(options.modelPath, 'utf8')
  const model = parseAndValidateGoalBookModel(rawModel)
  const renderOptions = {
    feedbackBaseUrl: options.feedbackBaseUrl,
    publicRoot: options.publicRoot,
    printDerivativeProfile: options.printDerivativeProfile,
  }

  if (options.htmlPath) {
    const manifest = await writeGoalBookHtml(model, options.htmlPath, {
      ...renderOptions,
      chromiumExecutablePath: options.chromiumExecutablePath,
    })
    const manifestPath = `${options.htmlPath}.render-manifest.json`
    await writeGoalBookRenderManifest(manifest, manifestPath)
    console.log(`Goal-book HTML written: ${options.htmlPath}`)
    console.log(`Goal-book HTML render manifest written: ${manifestPath}`)
  }
  if (options.pdfPath) {
    const manifest = await writeGoalBookPdf(model, options.pdfPath, {
      ...renderOptions,
      chromiumExecutablePath: options.chromiumExecutablePath,
    })
    const manifestPath = `${options.pdfPath}.render-manifest.json`
    await writeGoalBookRenderManifest(manifest, manifestPath)
    console.log(`Goal-book PDF written: ${options.pdfPath}`)
    console.log(`Goal-book PDF render manifest written: ${manifestPath}`)
  }
  console.log(
    `Pages: ${model.pages.length}; local visualizations: ${model.pages.filter(({ visualization }) => visualization !== null).length}; digest: ${model.digest}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
