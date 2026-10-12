import fs from 'node:fs'
import path from 'node:path'

import {
  DEFAULT_LANG,
  DEFAULT_LANDSCAPE_PATH,
  DEFAULT_PROVIDER,
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

function usage() {
  return [
    'Usage:',
    '  npm --prefix app run visualization:prepare -- <goal-id-or-title>',
    '',
    'Options:',
    '  --goal <query>          Goal ID, exact title, or unique title fragment.',
    `  --landscape <path>     Landscape JSON. Default: ${DEFAULT_LANDSCAPE_PATH}`,
    `  --subject <path>       Asset subject path. Default: ${DEFAULT_SUBJECT_PATH}`,
    `  --lang <code>          Language code. Default: ${DEFAULT_LANG}`,
    `  --provider <name>      Generator/provider. Default: ${DEFAULT_PROVIDER}`,
    `  --review-status <s>    Review status. Default: ${DEFAULT_REVIEW_STATUS}`,
  ].join('\n')
}

function main() {
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
  const provider = getStringArg(args, 'provider', DEFAULT_PROVIDER) ?? DEFAULT_PROVIDER
  const reviewStatus = getStringArg(args, 'review-status', DEFAULT_REVIEW_STATUS) ?? DEFAULT_REVIEW_STATUS

  const landscape = readLandscape(landscapePath)
  const goal = findGoalOrThrow(landscape, goalQuery)
  const paths = buildVisualizationPaths(goal, { subjectPath, lang, extension: 'png' })
  const rawPrompt = createVisualizationPrompt(goal, { subjectPath })
  const promptMarkdown = createPromptMetadataMarkdown(goal, {
    provider,
    reviewStatus,
    fileName: paths.fileName,
    publicUrl: paths.publicUrl,
    rawPrompt,
  })

  const outDir = path.join(ROOT_DIR, 'tmp/goal-visualizations', goal.id)
  fs.mkdirSync(outDir, { recursive: true })

  const promptPath = path.join(outDir, `nano-banana-prompt.${lang}.md`)
  fs.writeFileSync(promptPath, promptMarkdown, 'utf-8')

  const metadataPath = path.join(outDir, 'metadata.json')
  fs.writeFileSync(
    metadataPath,
    `${JSON.stringify(
      {
        skillpilotId: goal.id,
        title: goal.title,
        description: goal.description,
        subjectPath,
        lang,
        provider,
        reviewStatus,
        expectedFileName: paths.fileName,
        canonicalDirectory: toProjectPath(paths.sourceDir),
        publicUrl: paths.publicUrl,
        importCommand: `npm --prefix app run visualization:import -- ${goal.id} "<downloaded-image-path>"`,
      },
      null,
      2,
    )}\n`,
    'utf-8',
  )

  console.log(`Prepared prompt package for: ${goal.title}`)
  console.log(`SkillPilot ID: ${goal.id}`)
  console.log(`Prompt: ${toProjectPath(promptPath)}`)
  console.log(`Metadata: ${toProjectPath(metadataPath)}`)
  console.log('')
  console.log('After generating and downloading the image, import it with:')
  console.log(`npm --prefix app run visualization:import -- ${goal.id} "<downloaded-image-path>"`)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
