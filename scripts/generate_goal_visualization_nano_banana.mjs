import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

import {
  DEFAULT_LANG,
  DEFAULT_LANDSCAPE_PATH,
  DEFAULT_LICENSE,
  DEFAULT_REVIEW_STATUS,
  DEFAULT_SUBJECT_PATH,
  ROOT_DIR,
  buildVisualizationPaths,
  createPromptMetadataMarkdown,
  createVisualizationPrompt,
  findGoalOrThrow,
  getBooleanArg,
  getPositionals,
  getStringArg,
  parseCliArgs,
  readLandscape,
  toProjectPath,
} from './goal_visualization_common.mjs'

const DEFAULT_MODEL = 'gemini-3-pro-image'
const DEFAULT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const DEFAULT_ASPECT_RATIO = '16:9'
const DEFAULT_IMAGE_SIZE = '2K'
const DEFAULT_MIME_TYPE = 'image/jpeg'
const DEFAULT_PROVIDER = `Google Gemini / Nano Banana Pro (${DEFAULT_MODEL})`

function usage() {
  return [
    'Usage:',
    '  npm --prefix app run visualization:generate:nano-banana -- <goal-id-or-title>',
    '',
    'Environment:',
    '  GEMINI_API_KEY or GOOGLE_API_KEY must be set unless --dry-run is used.',
    '',
    'Options:',
    '  --goal <query>              Goal ID, exact title, or unique title fragment.',
    `  --landscape <path>         Landscape JSON. Default: ${DEFAULT_LANDSCAPE_PATH}`,
    `  --subject <path>           Asset subject path. Default: ${DEFAULT_SUBJECT_PATH}`,
    `  --lang <code>              Language code. Default: ${DEFAULT_LANG}`,
    `  --model <id>               Gemini image model. Default: ${DEFAULT_MODEL}`,
    `  --aspect-ratio <ratio>     Response aspect ratio. Default: ${DEFAULT_ASPECT_RATIO}`,
    `  --image-size <size>        Response image size. Default: ${DEFAULT_IMAGE_SIZE}`,
    `  --mime-type <mime>         Image MIME type. Default: ${DEFAULT_MIME_TYPE}`,
    '  --prompt-append <text>     Extra provider instruction appended to the generated prompt.',
    '  --description <text>       Optional resourceLink description.',
    '  --alt-text <text>          Optional resourceLink alt text.',
    '  --review-status <status>   Default: pilot.',
    '  --no-import                Save generated image only; do not update canonical JSON.',
    '  --dry-run                  Write prompt/request package only; do not call the API.',
  ].join('\n')
}

function extensionFromMimeType(mimeType) {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  throw new Error(`Unsupported mime type: ${mimeType}`)
}

function getApiKey() {
  return (
    process.env.GEMINI_API_KEY ??
    readApiKeyFromLocalEnv(path.join(ROOT_DIR, '.env.local')) ??
    readApiKeyFromLocalEnv(path.join(ROOT_DIR, 'app/.env.local')) ??
    process.env.GOOGLE_API_KEY
  )
}

function readApiKeyFromLocalEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    return undefined
  }

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const match = line.match(/^(GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)$/)
    if (!match) continue

    return match[2].trim().replace(/^['"]|['"]$/g, '')
  }

  return undefined
}

function collectImageCandidates(response) {
  const candidates = []

  const addImage = (image, source) => {
    if (!image || typeof image !== 'object') return
    const data = image.data ?? image.imageBytes ?? image.image_bytes
    if (typeof data === 'string' && data.trim()) {
      candidates.push({
        data,
        mimeType: image.mime_type ?? image.mimeType,
        source,
      })
    }
  }

  addImage(response.output_image, 'output_image')
  addImage(response.outputImage, 'outputImage')

  for (const step of response.steps ?? []) {
    if (step?.type !== 'model_output') continue
    for (const contentBlock of step.content ?? []) {
      if (contentBlock?.type === 'image') {
        addImage(contentBlock, 'steps.model_output.content')
      }
    }
  }

  for (const generatedImage of response.generated_images ?? response.generatedImages ?? []) {
    addImage(generatedImage.image ?? generatedImage, 'generated_images')
  }

  return candidates
}

function summarizeResponse(response) {
  const textBlocks = []
  for (const step of response.steps ?? []) {
    if (step?.type !== 'model_output') continue
    for (const contentBlock of step.content ?? []) {
      if (contentBlock?.type === 'text' && typeof contentBlock.text === 'string') {
        textBlocks.push(contentBlock.text)
      }
    }
  }

  return {
    id: response.id,
    model: response.model,
    outputText: response.output_text ?? response.outputText,
    textBlocks,
    imageCandidateCount: collectImageCandidates(response).length,
  }
}

async function requestImage({ endpoint, apiKey, model, prompt, mimeType, aspectRatio, imageSize }) {
  const body = {
    model,
    input: prompt,
    response_format: {
      type: 'image',
      mime_type: mimeType,
      aspect_ratio: aspectRatio,
      image_size: imageSize,
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  const responseText = await response.text()
  let payload
  try {
    payload = JSON.parse(responseText)
  } catch {
    throw new Error(`Gemini API returned non-JSON response (${response.status}): ${responseText.slice(0, 500)}`)
  }

  if (!response.ok) {
    throw new Error(`Gemini API failed (${response.status}): ${JSON.stringify(payload, null, 2)}`)
  }

  return { payload, body }
}

function runImporter(goalId, imagePath, options) {
  const args = [
    path.join(ROOT_DIR, 'scripts/import_goal_visualization.mjs'),
    goalId,
    imagePath,
    `--provider=${options.provider}`,
    `--description=${options.description}`,
    `--alt-text=${options.altText}`,
    `--review-status=${options.reviewStatus}`,
    `--license=${options.license}`,
    `--prompt=${options.promptPath}`,
  ]

  const result = spawnSync(process.execPath, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`Import step failed with exit code ${result.status}`)
  }
}

async function main() {
  const args = parseCliArgs()
  const positionals = getPositionals(args)

  if (getBooleanArg(args, 'help')) {
    console.log(usage())
    return
  }

  const goalQuery = getStringArg(args, 'goal') ?? getStringArg(args, 'id') ?? getStringArg(args, 'title') ?? positionals[0]
  if (!goalQuery) {
    throw new Error(`${usage()}\n\nMissing required goal argument.`)
  }

  const landscapePath = getStringArg(args, 'landscape', DEFAULT_LANDSCAPE_PATH) ?? DEFAULT_LANDSCAPE_PATH
  const subjectPath = getStringArg(args, 'subject', DEFAULT_SUBJECT_PATH) ?? DEFAULT_SUBJECT_PATH
  const lang = getStringArg(args, 'lang', DEFAULT_LANG) ?? DEFAULT_LANG
  const model = getStringArg(args, 'model', DEFAULT_MODEL) ?? DEFAULT_MODEL
  const endpoint = getStringArg(args, 'endpoint', DEFAULT_ENDPOINT) ?? DEFAULT_ENDPOINT
  const aspectRatio = getStringArg(args, 'aspect-ratio', DEFAULT_ASPECT_RATIO) ?? DEFAULT_ASPECT_RATIO
  const imageSize = getStringArg(args, 'image-size', DEFAULT_IMAGE_SIZE) ?? DEFAULT_IMAGE_SIZE
  const mimeType = getStringArg(args, 'mime-type', DEFAULT_MIME_TYPE) ?? DEFAULT_MIME_TYPE
  const extension = extensionFromMimeType(mimeType)
  const reviewStatus = getStringArg(args, 'review-status', DEFAULT_REVIEW_STATUS) ?? DEFAULT_REVIEW_STATUS
  const provider = getStringArg(args, 'provider', DEFAULT_PROVIDER) ?? DEFAULT_PROVIDER
  const license = getStringArg(args, 'license', DEFAULT_LICENSE) ?? DEFAULT_LICENSE
  const dryRun = getBooleanArg(args, 'dry-run')
  const shouldImport = !getBooleanArg(args, 'no-import')

  const landscape = readLandscape(landscapePath)
  const goal = findGoalOrThrow(landscape, goalQuery)
  const paths = buildVisualizationPaths(goal, { subjectPath, lang, extension })
  const promptAppend = getStringArg(args, 'prompt-append')
  const prompt = promptAppend ? `${createVisualizationPrompt(goal)}\n\nZusatzanweisung:\n${promptAppend}` : createVisualizationPrompt(goal)
  const description =
    getStringArg(args, 'description') ?? `Visualisierung zum Lernziel: ${goal.title}.`
  const altText =
    getStringArg(args, 'alt-text') ??
    `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description ?? ''}`.trim()

  const workDir = path.join(ROOT_DIR, 'tmp/goal-visualizations', goal.id)
  const generatedDir = path.join(workDir, 'generated')
  fs.mkdirSync(generatedDir, { recursive: true })

  const promptPath = path.join(workDir, `nano-banana-prompt.${lang}.md`)
  fs.writeFileSync(
    promptPath,
    createPromptMetadataMarkdown(goal, {
      provider,
      reviewStatus,
      fileName: paths.fileName,
      publicUrl: paths.publicUrl,
      rawPrompt: prompt,
    }),
    'utf-8',
  )

  const requestBody = {
    model,
    input: prompt,
    response_format: {
      type: 'image',
      mime_type: mimeType,
      aspect_ratio: aspectRatio,
      image_size: imageSize,
    },
  }
  const requestPath = path.join(workDir, 'nano-banana-request.json')
  fs.writeFileSync(requestPath, `${JSON.stringify(requestBody, null, 2)}\n`, 'utf-8')

  console.log(`Goal: ${goal.title}`)
  console.log(`SkillPilot ID: ${goal.id}`)
  console.log(`Prompt: ${toProjectPath(promptPath)}`)
  console.log(`Request: ${toProjectPath(requestPath)}`)

  if (dryRun) {
    console.log('')
    console.log('Dry run only. No API request was sent.')
    return
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.')
  }

  console.log(`Calling ${model} (${aspectRatio}, ${imageSize}, ${mimeType})...`)
  const { payload } = await requestImage({
    endpoint,
    apiKey,
    model,
    prompt,
    mimeType,
    aspectRatio,
    imageSize,
  })

  const responseSummaryPath = path.join(workDir, 'nano-banana-response-summary.json')
  fs.writeFileSync(responseSummaryPath, `${JSON.stringify(summarizeResponse(payload), null, 2)}\n`, 'utf-8')

  const imageCandidates = collectImageCandidates(payload)
  if (imageCandidates.length === 0) {
    throw new Error(`Gemini API response did not contain an image. Summary: ${toProjectPath(responseSummaryPath)}`)
  }

  const selectedImage = imageCandidates[imageCandidates.length - 1]
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const generatedFileName = `${goal.id}.generated.${timestamp}.${extension}`
  const generatedImagePath = path.join(generatedDir, generatedFileName)
  fs.writeFileSync(generatedImagePath, Buffer.from(selectedImage.data, 'base64'))

  console.log(`Generated image: ${toProjectPath(generatedImagePath)}`)
  console.log(`Response summary: ${toProjectPath(responseSummaryPath)}`)

  if (!shouldImport) {
    console.log('Import skipped because --no-import was set.')
    return
  }

  runImporter(goal.id, generatedImagePath, {
    provider,
    description,
    altText,
    reviewStatus,
    license,
    promptPath,
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
