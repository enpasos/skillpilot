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
  createImageReconstructionPromptMetadataMarkdown,
  createPromptMetadataMarkdown,
  createVisualizationPrompt,
  findGoalOrThrow,
  getBooleanArg,
  getPositionals,
  getStringArg,
  parseCliArgs,
  readLandscape,
  resolveProjectPath,
  toProjectPath,
} from './goal_visualization_common.mjs'

const DEFAULT_MODEL = 'gemini-3-pro-image'
const DEFAULT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const DEFAULT_ASPECT_RATIO = '16:9'
const DEFAULT_IMAGE_SIZE = '2K'
const DEFAULT_MIME_TYPE = 'image/jpeg'
const DEFAULT_PROVIDER = `Google Gemini / Nano Banana Pro (${DEFAULT_MODEL})`
const DEFAULT_RECONSTRUCTION_PROMPT_MODEL = 'gemini-2.5-flash'
const DEFAULT_RECONSTRUCTION_PROMPT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const TEMPORARY_PROVIDER_FAILURE_EXIT_CODE = 75

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
    '  --prompt-append-file <path> Extra provider instruction read from a UTF-8 text/Markdown file.',
    '  --reference-image <path>    Optional image input sent to the provider together with the prompt.',
    '  --reference-image-mime-type <mime> MIME type for --reference-image. Inferred from file extension by default.',
    `  --reconstruction-prompt-model <id> Model used to describe the generated image. Default: ${DEFAULT_RECONSTRUCTION_PROMPT_MODEL}`,
    `  --reconstruction-prompt-endpoint <url> Base endpoint for prompt reconstruction. Default: ${DEFAULT_RECONSTRUCTION_PROMPT_ENDPOINT}`,
    '  --skip-reconstruction-prompt Do not create the standalone prompt for the generated image.',
    '  --description <text>       Optional resourceLink description.',
    '  --alt-text <text>          Optional resourceLink alt text.',
    '  --review-status <status>   Default: pilot.',
    '  --no-import                Save generated image only; do not update canonical JSON.',
    '  --dry-run                  Write prompt/request package only; do not call the API.',
  ].join('\n')
}

function readPromptAppendFile(filePath) {
  const fullPath = resolveProjectPath(filePath)
  return fs.readFileSync(fullPath, 'utf-8').trim()
}

function collectPromptAppend(args) {
  const parts = []
  const promptAppend = getStringArg(args, 'prompt-append')
  const promptAppendFile = getStringArg(args, 'prompt-append-file')

  if (promptAppend) {
    parts.push(promptAppend)
  }
  if (promptAppendFile) {
    parts.push(readPromptAppendFile(promptAppendFile))
  }

  return parts.filter(Boolean).join('\n\n')
}

function extensionFromMimeType(mimeType) {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  throw new Error(`Unsupported mime type: ${mimeType}`)
}

function mimeTypeFromImagePath(imagePath) {
  const extension = path.extname(imagePath).toLowerCase()
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  throw new Error(`Cannot infer MIME type for reference image: ${imagePath}`)
}

function readReferenceImage(inputPath, explicitMimeType) {
  if (!inputPath) return undefined

  const imagePath = resolveProjectPath(inputPath)
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Reference image does not exist: ${inputPath}`)
  }

  const mimeType = explicitMimeType ?? mimeTypeFromImagePath(imagePath)
  extensionFromMimeType(mimeType)

  return {
    path: imagePath,
    mimeType,
    data: fs.readFileSync(imagePath).toString('base64'),
  }
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

function buildImageReconstructionPromptRequest({ imageData, mimeType }) {
  return {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: [
              'Analyze only the attached image.',
              'Write a standalone image-generation prompt in German that could recreate this image without any other context.',
              'Output only the prompt text, no preface and no Markdown fence.',
              '',
              'Rules:',
              '- Do not mention that an attached, source, or reference image exists.',
              '- Do not include technical IDs, file names, product or platform names, school-form labels, local paths, or internal paths.',
              '- Never output these exact words: SkillPilot, Nano Banana, Gemini, Gymnasium.',
              '- Describe the visual style, layout, colors, visible text, mathematical notation, labels, arrows, diagrams, and spatial relationships precisely.',
              '- Preserve visible German wording and mathematical notation exactly where it is readable.',
              '- If a visual element is mathematically important, describe the intended relation explicitly.',
            ].join('\n'),
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageData,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
    },
  }
}

async function requestImageReconstructionPrompt({ endpoint, model, apiKey, requestBody }) {
  const modelPathSegment = model.replace(/^models\//u, '')
  const response = await fetch(`${endpoint.replace(/\/+$/u, '')}/${encodeURIComponent(modelPathSegment)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(requestBody),
  })

  const responseText = await response.text()
  let payload
  try {
    payload = JSON.parse(responseText)
  } catch {
    throw new Error(`Gemini prompt reconstruction returned non-JSON response (${response.status}): ${responseText.slice(0, 500)}`)
  }

  if (!response.ok) {
    throw new Error(`Gemini prompt reconstruction failed (${response.status}): ${JSON.stringify(payload, null, 2)}`)
  }

  const textParts = []
  for (const candidate of payload.candidates ?? []) {
    for (const part of candidate?.content?.parts ?? []) {
      if (typeof part?.text === 'string' && part.text.trim()) {
        textParts.push(part.text.trim())
      }
    }
  }

  const prompt = textParts.join('\n\n').trim()
  if (!prompt) {
    throw new Error('Gemini prompt reconstruction response did not contain text.')
  }

  return { payload, prompt }
}

function buildRequestBody({ model, prompt, mimeType, aspectRatio, imageSize, referenceImage }) {
  const input = referenceImage
    ? [
        { type: 'text', text: prompt },
        {
          type: 'image',
          mime_type: referenceImage.mimeType,
          data: referenceImage.data,
        },
      ]
    : prompt

  return {
    model,
    input,
    response_format: {
      type: 'image',
      mime_type: mimeType,
      aspect_ratio: aspectRatio,
      image_size: imageSize,
    },
  }
}

async function requestImage({ endpoint, apiKey, requestBody }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(requestBody),
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

  return { payload, body: requestBody }
}

function isTemporaryProviderFailure(error) {
  const message = String(error instanceof Error ? error.message : error).toLowerCase()
  return (
    message.includes('gemini api failed (429)') ||
    message.includes('"code":"too_many_requests"') ||
    message.includes('"code": "too_many_requests"') ||
    (message.includes('quota') && message.includes('request'))
  )
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
  if (options.reconstructionPromptPath) {
    args.push(`--reconstruction-prompt=${options.reconstructionPromptPath}`)
  }

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
  const reconstructionPromptModel =
    getStringArg(args, 'reconstruction-prompt-model', DEFAULT_RECONSTRUCTION_PROMPT_MODEL)
    ?? DEFAULT_RECONSTRUCTION_PROMPT_MODEL
  const reconstructionPromptEndpoint =
    getStringArg(args, 'reconstruction-prompt-endpoint', DEFAULT_RECONSTRUCTION_PROMPT_ENDPOINT)
    ?? DEFAULT_RECONSTRUCTION_PROMPT_ENDPOINT
  const aspectRatio = getStringArg(args, 'aspect-ratio', DEFAULT_ASPECT_RATIO) ?? DEFAULT_ASPECT_RATIO
  const imageSize = getStringArg(args, 'image-size', DEFAULT_IMAGE_SIZE) ?? DEFAULT_IMAGE_SIZE
  const mimeType = getStringArg(args, 'mime-type', DEFAULT_MIME_TYPE) ?? DEFAULT_MIME_TYPE
  const extension = extensionFromMimeType(mimeType)
  const reviewStatus = getStringArg(args, 'review-status', DEFAULT_REVIEW_STATUS) ?? DEFAULT_REVIEW_STATUS
  const provider = getStringArg(args, 'provider', DEFAULT_PROVIDER) ?? DEFAULT_PROVIDER
  const license = getStringArg(args, 'license', DEFAULT_LICENSE) ?? DEFAULT_LICENSE
  const dryRun = getBooleanArg(args, 'dry-run')
  const shouldImport = !getBooleanArg(args, 'no-import')
  const shouldCreateReconstructionPrompt = !getBooleanArg(args, 'skip-reconstruction-prompt')
  const referenceImage = readReferenceImage(
    getStringArg(args, 'reference-image'),
    getStringArg(args, 'reference-image-mime-type'),
  )

  const landscape = readLandscape(landscapePath)
  const goal = findGoalOrThrow(landscape, goalQuery)
  const paths = buildVisualizationPaths(goal, { subjectPath, lang, extension })
  const promptAppend = collectPromptAppend(args)
  const basePrompt = createVisualizationPrompt(goal, { subjectPath })
  const prompt = promptAppend ? `${basePrompt}\n\nZusatzanweisung:\n${promptAppend}` : basePrompt
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

  const requestBody = buildRequestBody({
    model,
    prompt,
    mimeType,
    aspectRatio,
    imageSize,
    referenceImage,
  })
  const requestPath = path.join(workDir, 'nano-banana-request.json')
  fs.writeFileSync(requestPath, `${JSON.stringify(requestBody, null, 2)}\n`, 'utf-8')

  console.log(`Goal: ${goal.title}`)
  console.log(`SkillPilot ID: ${goal.id}`)
  console.log(`Prompt: ${toProjectPath(promptPath)}`)
  if (referenceImage) {
    console.log(`Reference image: ${toProjectPath(referenceImage.path)} (${referenceImage.mimeType})`)
  }
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
    requestBody,
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

  let reconstructionPromptPath
  if (shouldCreateReconstructionPrompt) {
    const generatedBaseName = path.basename(generatedImagePath, path.extname(generatedImagePath))
    const reconstructionRequestBody = buildImageReconstructionPromptRequest({
      imageData: fs.readFileSync(generatedImagePath).toString('base64'),
      mimeType,
    })
    const reconstructionRequestPath = path.join(generatedDir, `${generatedBaseName}.image-reconstruction-request.json`)
    const reconstructionResponsePath = path.join(generatedDir, `${generatedBaseName}.image-reconstruction-response.json`)
    reconstructionPromptPath = path.join(generatedDir, `${generatedBaseName}.image-reconstruction-prompt.${lang}.md`)

    fs.writeFileSync(reconstructionRequestPath, `${JSON.stringify(reconstructionRequestBody, null, 2)}\n`, 'utf-8')
    console.log(`Calling ${reconstructionPromptModel} for image reconstruction prompt...`)
    const reconstruction = await requestImageReconstructionPrompt({
      endpoint: reconstructionPromptEndpoint,
      model: reconstructionPromptModel,
      apiKey,
      requestBody: reconstructionRequestBody,
    })
    fs.writeFileSync(reconstructionResponsePath, `${JSON.stringify(reconstruction.payload, null, 2)}\n`, 'utf-8')
    fs.writeFileSync(
      reconstructionPromptPath,
      createImageReconstructionPromptMetadataMarkdown(goal, {
        provider: `Google Gemini (${reconstructionPromptModel})`,
        sourceImageFile: generatedFileName,
        rawPrompt: reconstruction.prompt,
      }),
      'utf-8',
    )
    console.log(`Image reconstruction prompt: ${toProjectPath(reconstructionPromptPath)}`)
  }

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
    reconstructionPromptPath,
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(isTemporaryProviderFailure(error) ? TEMPORARY_PROVIDER_FAILURE_EXIT_CODE : 1)
})
