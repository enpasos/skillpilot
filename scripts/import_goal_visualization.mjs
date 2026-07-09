import fs from 'node:fs'
import path from 'node:path'

import {
  DEFAULT_LANG,
  DEFAULT_LANDSCAPE_PATH,
  DEFAULT_LICENSE,
  DEFAULT_PROVIDER,
  DEFAULT_REVIEW_STATUS,
  DEFAULT_SUBJECT_PATH,
  ROOT_DIR,
  buildVisualizationPaths,
  createGoalVisualizationLink,
  createImageReconstructionPromptMetadataMarkdown,
  createPromptMetadataMarkdown,
  createVisualizationPrompt,
  extractPromptText,
  findGoalOrThrow,
  getBooleanArg,
  getPositionals,
  getStringArg,
  isGoalVisualizationLink,
  parseCliArgs,
  readLandscape,
  resolveProjectPath,
  toProjectPath,
  writeLandscape,
} from './goal_visualization_common.mjs'

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg'])

function usage() {
  return [
    'Usage:',
    '  npm --prefix app run visualization:import -- <goal-id-or-title> <downloaded-image-path>',
    '',
    'Options:',
    '  --goal <query>          Goal ID, exact title, or unique title fragment.',
    '  --image <path>         Downloaded image from the generator.',
    `  --landscape <path>     Landscape JSON. Default: ${DEFAULT_LANDSCAPE_PATH}`,
    `  --subject <path>       Asset subject path. Default: ${DEFAULT_SUBJECT_PATH}`,
    `  --lang <code>          Language code. Default: ${DEFAULT_LANG}`,
    `  --provider <name>      Generator/provider. Default: ${DEFAULT_PROVIDER}`,
    `  --review-status <s>    Review status. Default: ${DEFAULT_REVIEW_STATUS}`,
    `  --license <text>       License note. Default: ${DEFAULT_LICENSE}`,
    '  --description <text>   Optional resourceLink description.',
    '  --alt-text <text>      Optional resourceLink alt text.',
    '  --prompt <path>        Optional prompt markdown/text file.',
    '  --reconstruction-prompt <path> Optional standalone image reconstruction prompt markdown/text file.',
    '  --dry-run              Print planned changes without writing files.',
  ].join('\n')
}

function resolveExistingInputPath(inputPath) {
  const candidates = [
    path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath),
    path.isAbsolute(inputPath) ? inputPath : path.resolve(ROOT_DIR, inputPath),
    resolveProjectPath(inputPath),
  ]

  const existing = candidates.find((candidate) => fs.existsSync(candidate))
  if (!existing) {
    throw new Error(`Input file does not exist: ${inputPath}`)
  }

  return existing
}

function copyFileIfNeeded(sourcePath, targetPath, dryRun) {
  if (path.resolve(sourcePath) === path.resolve(targetPath)) {
    return
  }
  if (dryRun) {
    return
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.copyFileSync(sourcePath, targetPath)
}

function readPromptForGoal(goalId, lang, explicitPromptPath) {
  if (explicitPromptPath) {
    const promptPath = resolveExistingInputPath(explicitPromptPath)
    return extractPromptText(fs.readFileSync(promptPath, 'utf-8'))
  }

  const preparedPromptPath = path.join(ROOT_DIR, 'tmp/goal-visualizations', goalId, `nano-banana-prompt.${lang}.md`)
  if (fs.existsSync(preparedPromptPath)) {
    return extractPromptText(fs.readFileSync(preparedPromptPath, 'utf-8'))
  }

  return undefined
}

function inferReconstructionPromptPath(imagePath, lang) {
  const extension = path.extname(imagePath)
  const basePath = path.join(path.dirname(imagePath), path.basename(imagePath, extension))
  const candidates = [
    `${basePath}.image-reconstruction-prompt.${lang}.md`,
    `${basePath}.reconstruction-prompt.${lang}.md`,
    `${basePath}.image-reconstruction-prompt.md`,
    `${basePath}.reconstruction-prompt.md`,
    path.join(path.dirname(imagePath), `image-reconstruction-prompt.${lang}.md`),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate))
}

function readReconstructionPromptForImage(imagePath, lang, explicitPromptPath) {
  const promptPath = explicitPromptPath
    ? resolveExistingInputPath(explicitPromptPath)
    : inferReconstructionPromptPath(imagePath, lang)

  if (!promptPath) return null

  return {
    path: promptPath,
    rawPrompt: extractPromptText(fs.readFileSync(promptPath, 'utf-8')),
  }
}

function main() {
  const args = parseCliArgs()
  const positionals = getPositionals(args)

  if (getBooleanArg(args, 'help')) {
    console.log(usage())
    return
  }

  const goalQuery = getStringArg(args, 'goal') ?? getStringArg(args, 'id') ?? getStringArg(args, 'title') ?? positionals[0]
  const imageInputPath = getStringArg(args, 'image') ?? positionals[1]
  if (!goalQuery || !imageInputPath) {
    throw new Error(`${usage()}\n\nMissing required goal or image argument.`)
  }

  const landscapePath = getStringArg(args, 'landscape', DEFAULT_LANDSCAPE_PATH) ?? DEFAULT_LANDSCAPE_PATH
  const subjectPath = getStringArg(args, 'subject', DEFAULT_SUBJECT_PATH) ?? DEFAULT_SUBJECT_PATH
  const lang = getStringArg(args, 'lang', DEFAULT_LANG) ?? DEFAULT_LANG
  const provider = getStringArg(args, 'provider', DEFAULT_PROVIDER) ?? DEFAULT_PROVIDER
  const reviewStatus = getStringArg(args, 'review-status', DEFAULT_REVIEW_STATUS) ?? DEFAULT_REVIEW_STATUS
  const license = getStringArg(args, 'license', DEFAULT_LICENSE) ?? DEFAULT_LICENSE
  const dryRun = getBooleanArg(args, 'dry-run')

  const imagePath = resolveExistingInputPath(imageInputPath)
  const extension = path.extname(imagePath).toLowerCase()
  if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported image extension ${extension}. Supported: ${Array.from(SUPPORTED_IMAGE_EXTENSIONS).join(', ')}`)
  }

  const landscape = readLandscape(landscapePath)
  const goal = findGoalOrThrow(landscape, goalQuery)
  const paths = buildVisualizationPaths(goal, {
    subjectPath,
    lang,
    extension: extension.slice(1),
  })

  const description =
    getStringArg(args, 'description') ?? `Visualisierung zum Lernziel: ${goal.title}.`
  const altText =
    getStringArg(args, 'alt-text') ??
    `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description ?? ''}`.trim()
  const rawPrompt =
    readPromptForGoal(goal.id, lang, getStringArg(args, 'prompt')) ?? createVisualizationPrompt(goal, { subjectPath })
  const promptMarkdown = createPromptMetadataMarkdown(goal, {
    provider,
    reviewStatus,
    fileName: paths.fileName,
    publicUrl: paths.publicUrl,
    rawPrompt,
  })
  const reconstructionPrompt = readReconstructionPromptForImage(
    imagePath,
    lang,
    getStringArg(args, 'reconstruction-prompt'),
  )
  const reconstructionPromptMarkdown = reconstructionPrompt
    ? createImageReconstructionPromptMetadataMarkdown(goal, {
      provider,
      sourceImageFile: paths.fileName,
      rawPrompt: reconstructionPrompt.rawPrompt,
    })
    : null

  const newLink = createGoalVisualizationLink(goal, {
    provider,
    description,
    altText,
    lang,
    license,
    reviewStatus,
    publicUrl: paths.publicUrl,
  })

  const existingLinks = Array.isArray(goal.resourceLinks) ? goal.resourceLinks : []
  const remainingLinks = existingLinks.filter((link) => {
    return !(isGoalVisualizationLink(link) && link.role === 'primary' && (link.lang ?? lang) === lang)
  })
  goal.resourceLinks = [newLink, ...remainingLinks]

  console.log(`Goal: ${goal.title}`)
  console.log(`SkillPilot ID: ${goal.id}`)
  console.log(`Source image: ${toProjectPath(imagePath)}`)
  console.log(`Canonical image: ${toProjectPath(paths.sourceImagePath)}`)
  console.log(`Public image: ${toProjectPath(paths.publicImagePath)}`)
  console.log(`Canonical prompt: ${toProjectPath(paths.sourcePromptPath)}`)
  console.log(`Canonical reconstruction prompt: ${toProjectPath(paths.sourceReconstructionPromptPath)}`)
  console.log(`JSON link URL: ${paths.publicUrl}`)
  if (reconstructionPrompt) {
    console.log(`Reconstruction prompt source: ${toProjectPath(reconstructionPrompt.path)}`)
  }

  if (dryRun) {
    console.log('')
    console.log('Dry run only. No files were written.')
    return
  }

  copyFileIfNeeded(imagePath, paths.sourceImagePath, dryRun)
  copyFileIfNeeded(imagePath, paths.publicImagePath, dryRun)
  fs.mkdirSync(path.dirname(paths.sourcePromptPath), { recursive: true })
  fs.writeFileSync(paths.sourcePromptPath, promptMarkdown, 'utf-8')
  if (reconstructionPromptMarkdown) {
    fs.writeFileSync(paths.sourceReconstructionPromptPath, reconstructionPromptMarkdown, 'utf-8')
  } else if (fs.existsSync(paths.sourceReconstructionPromptPath)) {
    fs.unlinkSync(paths.sourceReconstructionPromptPath)
  }
  writeLandscape(landscapePath, landscape)

  console.log('')
  console.log('Imported goal visualization and updated canonical JSON.')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
