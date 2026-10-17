import fs from 'node:fs'
import path from 'node:path'

import {
  ROOT_DIR,
  createImageReconstructionPromptMetadataMarkdown,
  getBooleanArg,
  getStringArg,
  parseCliArgs,
  resolveProjectPath,
  toProjectPath,
} from './goal_visualization_common.mjs'

const DEFAULT_MODEL = 'gemini-2.5-flash'
const DEFAULT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_CANONICAL_DIR = 'curricula/DE/Gymnasium/canonical'
const DEFAULT_TRACE_DIR = 'tmp/goal-visualization-reconstruction-prompts'
const CANONICAL_VISUALIZATION_ROOT = resolveProjectPath('curricula/DE/Gymnasium/visualizations')
const allowedImageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function usage() {
  return [
    'Usage:',
    '  npm --prefix app run visualization:generate-reconstruction-prompts -- [options]',
    '',
    'Environment:',
    '  GEMINI_API_KEY or GOOGLE_API_KEY must be set unless --dry-run is used.',
    '',
    'Options:',
    `  --canonical-dir <path>   Canonical landscape directory. Default: ${DEFAULT_CANONICAL_DIR}`,
    '  --subject <slug>        Optional subject filter, e.g. mathematik, physik, chemie.',
    '  --goal <id>             Optional single goal ID filter.',
    '  --limit <n>             Process at most n missing prompts.',
    '  --offset <n>            Skip n eligible prompts before processing.',
    '  --include-existing      Regenerate prompts even when image-reconstruction-prompt.de.md exists.',
    '  --continue-on-error     Continue with later images after an error.',
    `  --model <id>            Gemini text/vision model. Default: ${DEFAULT_MODEL}`,
    `  --endpoint <url>        Gemini model endpoint base. Default: ${DEFAULT_ENDPOINT}`,
    `  --trace-dir <path>      Response trace directory. Default: ${DEFAULT_TRACE_DIR}`,
    '  --dry-run               Print planned work without API calls or writes.',
  ].join('\n')
}

function readApiKeyFromLocalEnv(envPath, preferredKey) {
  if (!fs.existsSync(envPath)) return undefined

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/u)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const match = line.match(/^(GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)$/u)
    if (!match || match[1] !== preferredKey) continue
    return match[2].trim().replace(/^['"]|['"]$/g, '')
  }

  return undefined
}

function getApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim()
    || readApiKeyFromLocalEnv(path.join(ROOT_DIR, '.env.local'), 'GEMINI_API_KEY')
    || readApiKeyFromLocalEnv(path.join(ROOT_DIR, 'app/.env.local'), 'GEMINI_API_KEY')
    || process.env.GOOGLE_API_KEY?.trim()
    || readApiKeyFromLocalEnv(path.join(ROOT_DIR, '.env.local'), 'GOOGLE_API_KEY')
    || readApiKeyFromLocalEnv(path.join(ROOT_DIR, 'app/.env.local'), 'GOOGLE_API_KEY')
  )
}

function imageMimeTypeForPath(imagePath) {
  const extension = path.extname(imagePath).toLowerCase()
  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function buildRequestBody({ imageData, mimeType }) {
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

async function requestReconstructionPrompt({ endpoint, model, apiKey, imagePath }) {
  const requestBody = buildRequestBody({
    imageData: fs.readFileSync(imagePath).toString('base64'),
    mimeType: imageMimeTypeForPath(imagePath),
  })
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

  const prompt = normalizeGeneratedPrompt(textParts.join('\n\n'))
  if (!prompt) {
    throw new Error('Gemini prompt reconstruction response did not contain text.')
  }

  return { payload, prompt }
}

function normalizeGeneratedPrompt(rawPrompt) {
  const trimmed = rawPrompt.trim()
  const fenced = trimmed.match(/^```(?:text|markdown)?\s*\n([\s\S]*?)\n```$/iu)
  const prompt = (fenced?.[1] ?? trimmed).trim()
  if (prompt.includes('```')) {
    throw new Error('Generated prompt contains an unexpected Markdown fence.')
  }
  return prompt
}

function collectCanonicalLandscapes(canonicalDir) {
  const fullDir = resolveProjectPath(canonicalDir)
  return fs
    .readdirSync(fullDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(fullDir, name))
    .sort()
}

function primaryVisualizationLink(goal) {
  const links = (goal.resourceLinks ?? []).filter((link) => (
    link?.type === 'goal-visualization'
    && link?.resourceType === 'image'
    && link?.role === 'primary'
    && typeof link?.url === 'string'
  ))
  if (links.length > 1) {
    throw new Error(`Goal ${goal.id} has multiple primary goal-visualization links.`)
  }
  return links[0]
}

function visualizationAssetLocation(goalId, url) {
  const prefix = '/assets/goal-visualizations/'
  if (!url.startsWith(prefix)) {
    throw new Error(`Goal ${goalId} has a primary visualization URL outside ${prefix}.`)
  }
  const assetRelativePath = url.slice(prefix.length)
  const segments = assetRelativePath.split('/')
  const subject = segments[0] ?? ''
  const extension = path.extname(segments[2] ?? '').toLowerCase()
  if (
    segments.length !== 3
    || !/^[a-z0-9][a-z0-9-]*$/u.test(subject)
    || segments[1] !== goalId
    || segments[2] !== `${goalId}${extension}`
    || !allowedImageExtensions.has(extension)
    || segments.some((segment) => segment === '.' || segment === '..' || segment.includes('\\'))
  ) {
    throw new Error(`Goal ${goalId} has an invalid goal-visualization URL schema.`)
  }

  const imagePath = path.resolve(CANONICAL_VISUALIZATION_ROOT, assetRelativePath)
  if (!imagePath.startsWith(`${CANONICAL_VISUALIZATION_ROOT}${path.sep}`)) {
    throw new Error(`Goal ${goalId} resolves outside the canonical visualization root.`)
  }
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Goal ${goalId} is missing its canonical visualization image.`)
  }
  const realRoot = fs.realpathSync(CANONICAL_VISUALIZATION_ROOT)
  const realImagePath = fs.realpathSync(imagePath)
  const realImageDirectory = fs.realpathSync(path.dirname(imagePath))
  for (const [label, realPath] of [
    ['image', realImagePath],
    ['image directory', realImageDirectory],
  ]) {
    if (realPath !== realRoot && !realPath.startsWith(`${realRoot}${path.sep}`)) {
      throw new Error(`Goal ${goalId} ${label} escapes the canonical visualization root through a symlink.`)
    }
  }
  return { assetRelativePath, imagePath, subject }
}

function collectRecords(args) {
  const subjectFilter = getStringArg(args, 'subject')
  const goalFilter = getStringArg(args, 'goal')
  const includeExisting = getBooleanArg(args, 'include-existing')
  const canonicalDir = getStringArg(args, 'canonical-dir', DEFAULT_CANONICAL_DIR) ?? DEFAULT_CANONICAL_DIR
  const records = []

  for (const landscapePath of collectCanonicalLandscapes(canonicalDir)) {
    const landscape = JSON.parse(fs.readFileSync(landscapePath, 'utf-8'))
    for (const goal of landscape.goals ?? []) {
      const link = primaryVisualizationLink(goal)
      if (!link || !goal.id) continue
      const location = visualizationAssetLocation(goal.id, link.url)
      if (!location) continue
      const { subject, imagePath } = location
      if (subjectFilter && subject !== subjectFilter) continue
      if (goalFilter && goal.id !== goalFilter) continue

      const promptPath = path.join(path.dirname(imagePath), 'image-reconstruction-prompt.de.md')
      const hasPrompt = fs.existsSync(promptPath)
      if (hasPrompt) {
        const realRoot = fs.realpathSync(CANONICAL_VISUALIZATION_ROOT)
        const realPromptPath = fs.realpathSync(promptPath)
        if (realPromptPath !== realRoot && !realPromptPath.startsWith(`${realRoot}${path.sep}`)) {
          throw new Error(`Goal ${goal.id} reconstruction prompt escapes the canonical visualization root through a symlink.`)
        }
      }
      if (hasPrompt && !includeExisting) continue

      records.push({
        landscapePath,
        record: {
          subject,
          goalId: goal.id,
          title: goal.title,
          description: goal.description,
        },
        imagePath,
        promptPath,
        hasPrompt,
      })
    }
  }

  const offset = Number.parseInt(getStringArg(args, 'offset', '0') ?? '0', 10)
  const limitArg = getStringArg(args, 'limit')
  const limit = limitArg ? Number.parseInt(limitArg, 10) : undefined
  const start = Number.isFinite(offset) && offset > 0 ? offset : 0
  const end = limit && Number.isFinite(limit) && limit > 0 ? start + limit : undefined

  return records.slice(start, end)
}

function assertProviderSafePrompt(rawPrompt) {
  const forbidden = [
    /SkillPilot/iu,
    /Nano Banana/iu,
    /Gemini/iu,
    /Gymnasium/iu,
    /curricula\//iu,
    /app\/public/iu,
    /goal-visualizations/iu,
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/iu,
  ]
  const match = forbidden.find((pattern) => pattern.test(rawPrompt))
  if (match) {
    throw new Error(`Generated prompt contains a forbidden provider-facing token: ${match}`)
  }
}

function writeTrace(traceDir, item, payload) {
  fs.mkdirSync(traceDir, { recursive: true })
  const tracePath = path.join(
    traceDir,
    `${item.record.subject}.${item.record.goalId}.${new Date().toISOString().replace(/[:.]/g, '-')}.response.json`,
  )
  fs.writeFileSync(tracePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')
  return tracePath
}

async function main() {
  const args = parseCliArgs()
  if (getBooleanArg(args, 'help')) {
    console.log(usage())
    return
  }

  const dryRun = getBooleanArg(args, 'dry-run')
  const continueOnError = getBooleanArg(args, 'continue-on-error')
  const model = getStringArg(args, 'model', DEFAULT_MODEL) ?? DEFAULT_MODEL
  const endpoint = getStringArg(args, 'endpoint', DEFAULT_ENDPOINT) ?? DEFAULT_ENDPOINT
  const traceDir = resolveProjectPath(getStringArg(args, 'trace-dir', DEFAULT_TRACE_DIR) ?? DEFAULT_TRACE_DIR)
  const records = collectRecords(args)

  console.log(`Eligible image(s): ${records.length}`)
  if (records.length === 0) return

  if (dryRun) {
    for (const item of records) {
      console.log(`- ${item.record.subject}/${item.record.goalId} -> ${toProjectPath(item.promptPath)}${item.hasPrompt ? ' (existing)' : ''}`)
    }
    console.log('')
    console.log('Dry run only. No API requests were sent.')
    return
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.')
  }

  let written = 0
  for (const item of records) {
    try {
      if (!fs.existsSync(item.imagePath)) {
        throw new Error(`Canonical image does not exist: ${toProjectPath(item.imagePath)}`)
      }
      console.log(`Generating reconstruction prompt: ${item.record.subject}/${item.record.goalId}`)
      const reconstruction = await requestReconstructionPrompt({
        endpoint,
        model,
        apiKey,
        imagePath: item.imagePath,
      })
      assertProviderSafePrompt(reconstruction.prompt)
      const tracePath = writeTrace(traceDir, item, reconstruction.payload)
      fs.writeFileSync(
        item.promptPath,
        createImageReconstructionPromptMetadataMarkdown(
          {
            id: item.record.goalId,
            title: item.record.title,
            description: item.record.description,
          },
          {
            provider: `Google Gemini (${model})`,
            sourceImageFile: path.basename(item.imagePath),
            rawPrompt: reconstruction.prompt,
          },
        ),
        'utf-8',
      )
      written += 1
      console.log(`  wrote ${toProjectPath(item.promptPath)}`)
      console.log(`  trace ${toProjectPath(tracePath)}`)
    } catch (error) {
      console.error(`  failed ${item.record.subject}/${item.record.goalId}: ${error instanceof Error ? error.message : error}`)
      if (!continueOnError) {
        throw error
      }
    }
  }

  console.log('')
  console.log(`Generated reconstruction prompt(s): ${written}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
