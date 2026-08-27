import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DEFAULT_LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
export const DEFAULT_SUBJECT_PATH = 'mathematik'
export const DEFAULT_LANG = 'de'
export const DEFAULT_PROVIDER = 'Google Gemini / Nano Banana Pro'
export const DEFAULT_REVIEW_STATUS = 'pilot'
export const DEFAULT_LICENSE = 'AI-generated, SkillPilot-curated'

export function parseCliArgs(argv = process.argv.slice(2)) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      args._.push(arg)
      continue
    }

    const eqIndex = arg.indexOf('=')
    if (eqIndex > 2) {
      args[arg.slice(2, eqIndex)] = arg.slice(eqIndex + 1)
      continue
    }

    const key = arg.slice(2)
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      args[key] = next
      i += 1
    } else {
      args[key] = true
    }
  }
  return args
}

export function getStringArg(args, key, fallback) {
  const value = args[key]
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  const envValue = getNpmConfigValue(key)
  if (envValue && envValue !== 'true') {
    return envValue
  }
  return fallback
}

export function getPositionals(args) {
  return Array.isArray(args._) ? args._ : []
}

export function getBooleanArg(args, key) {
  const value = args[key]
  if (value === true) {
    return true
  }
  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }
  const envValue = getNpmConfigValue(key)
  return envValue === 'true' || envValue === '1'
}

function getNpmConfigValue(key) {
  const normalized = key.replace(/-/g, '_')
  return process.env[`npm_config_${normalized}`] ?? process.env[`npm_config_${key}`]
}

export function resolveProjectPath(inputPath) {
  if (path.isAbsolute(inputPath)) {
    return inputPath
  }

  const cwdPath = path.resolve(process.cwd(), inputPath)
  if (fs.existsSync(cwdPath)) {
    return cwdPath
  }

  return path.resolve(ROOT_DIR, inputPath)
}

export function toProjectPath(absPath) {
  return path.relative(ROOT_DIR, absPath).replace(/\\/g, '/')
}

export function readLandscape(landscapePath) {
  const fullPath = resolveProjectPath(landscapePath)
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
}

export function writeLandscape(landscapePath, landscape) {
  const fullPath = resolveProjectPath(landscapePath)
  fs.writeFileSync(fullPath, `${JSON.stringify(landscape, null, 2)}\n`, 'utf-8')
}

export function findGoalOrThrow(landscape, query) {
  const goals = landscape.goals ?? []
  const normalizedQuery = query.trim().toLowerCase()

  const exactId = goals.find((goal) => goal.id === query.trim())
  if (exactId) return exactId

  const exactTitle = goals.find((goal) => goal.title.toLowerCase() === normalizedQuery)
  if (exactTitle) return exactTitle

  const matches = goals.filter((goal) => {
    const haystack = [
      goal.id,
      goal.title,
      goal.description ?? '',
      goal.phase ?? '',
      goal.area ?? '',
    ].join('\n').toLowerCase()
    return haystack.includes(normalizedQuery)
  })

  if (matches.length === 1) {
    return matches[0]
  }

  if (matches.length > 1) {
    const preview = matches.slice(0, 20).map((goal) => `- ${goal.id} | ${goal.title}`).join('\n')
    throw new Error(`Goal query is ambiguous (${matches.length} matches):\n${preview}`)
  }

  throw new Error(`No goal found for query: ${query}`)
}

export function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export function buildVisualizationPaths(goal, options) {
  const safeExtension = options.extension.replace(/^\./, '').toLowerCase()
  const slug = slugify(goal.title)
  const fileName = `${goal.id}.${safeExtension}`
  const sourceDir = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/visualizations', options.subjectPath, goal.id)
  const publicDir = path.join(ROOT_DIR, 'app/public/assets/goal-visualizations', options.subjectPath, goal.id)
  const backendDir = path.join(
    ROOT_DIR,
    'backend/src/main/resources/static/assets/goal-visualizations',
    options.subjectPath,
    goal.id,
  )

  return {
    slug,
    fileName,
    sourceDir,
    sourceImagePath: path.join(sourceDir, fileName),
    sourcePromptPath: path.join(sourceDir, `prompt.${options.lang}.md`),
    sourceReconstructionPromptPath: path.join(sourceDir, `image-reconstruction-prompt.${options.lang}.md`),
    publicDir,
    publicImagePath: path.join(publicDir, fileName),
    backendDir,
    backendImagePath: path.join(backendDir, fileName),
    publicUrl: `/assets/goal-visualizations/${options.subjectPath}/${goal.id}/${fileName}`,
  }
}

function subjectLabelFromPath(subjectPath) {
  const normalized = (subjectPath ?? DEFAULT_SUBJECT_PATH).split('/').filter(Boolean).at(-1) ?? DEFAULT_SUBJECT_PATH
  const labels = {
    biologie: 'Biologie',
    chemie: 'Chemie',
    deutsch: 'Deutsch',
    englisch: 'Englisch',
    franzoesisch: 'Franzoesisch',
    geschichte: 'Geschichte',
    informatik: 'Informatik',
    mathematik: 'Mathematik',
    physik: 'Physik',
    politikwirtschaft: 'Politik und Wirtschaft',
    wirtschaft: 'Wirtschaft',
  }

  return labels[normalized] ?? normalized.replace(/(^|-)([a-z])/g, (_, prefix, letter) => `${prefix ? ' ' : ''}${letter.toUpperCase()}`)
}

function sanitizeProviderGoalText(value) {
  return String(value ?? '')
    .replace(/\s*\((?:LK|GK|Grundkurs|Leistungskurs)\)\s*/giu, ' ')
    .replace(/\b(?:Gymnasium|gymnasiale Oberstufe|gymnasialer Oberstufe|Sekundarstufe I|Sekundarstufe II)\b/giu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createVisualizationPrompt(goal, options = {}) {
  const phase = goal.phase ? `\nPhase/Jahrgang: ${goal.phase}` : ''
  const area = goal.area ? `\nBereich: ${goal.area}` : ''
  const providerTitle = sanitizeProviderGoalText(goal.title)
  const providerDescription = sanitizeProviderGoalText(goal.description ?? 'Keine Beschreibung hinterlegt.')

  return [
    'Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.',
    '',
    'Rahmen:',
    '- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.',
    '- Erzeuge eine klare, gut lesbare Infografik im Querformat.',
    '- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.',
    '- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.',
    '- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.',
    '- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.',
    '- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.',
    '',
    `Titel: ${providerTitle}`,
    `Beschreibung: ${providerDescription}${phase}${area}`,
  ].join('\n')
}

export function createPromptMetadataMarkdown(goal, options) {
  return [
    `# Lernzielvisualisierung: ${goal.title}`,
    '',
    '## SkillPilot-Ziel',
    '',
    `- SkillPilot-ID: \`${goal.id}\``,
    `- Titel: ${goal.title}`,
    `- Beschreibung: ${goal.description ?? 'Keine Beschreibung hinterlegt.'}`,
    '',
    '## Generator',
    '',
    `- Provider: ${options.provider}`,
    `- Status: ${options.reviewStatus}`,
    `- Quellbild: \`${options.fileName}\``,
    `- Public Asset: \`${options.publicUrl}\``,
    '',
    '## Prompt',
    '',
    '```text',
    options.rawPrompt,
    '```',
    '',
    '## Review-Notiz',
    '',
    'Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.',
    '',
  ].join('\n')
}

export function createImageReconstructionPromptMetadataMarkdown(goal, options) {
  return [
    `# Bildrekonstruktionsprompt: ${goal.title}`,
    '',
    '## SkillPilot-Ziel',
    '',
    `- SkillPilot-ID: \`${goal.id}\``,
    `- Titel: ${goal.title}`,
    `- Beschreibung: ${goal.description ?? 'Keine Beschreibung hinterlegt.'}`,
    '',
    '## Generator',
    '',
    `- Provider: ${options.provider}`,
    `- Quellbild: \`${options.sourceImageFile}\``,
    '',
    '## Zweck',
    '',
    'Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.',
    '',
    '## Prompt',
    '',
    '```text',
    options.rawPrompt,
    '```',
    '',
  ].join('\n')
}

export function isGoalVisualizationLink(link) {
  return link.type === 'goal-visualization' || link.resourceType === 'goal-visualization'
}

export function createGoalVisualizationLink(goal, options) {
  return {
    type: 'goal-visualization',
    resourceType: 'image',
    role: 'primary',
    skillpilotId: goal.id,
    title: `Visualisierung: ${goal.title}`,
    url: options.publicUrl,
    provider: options.provider,
    description: options.description,
    altText: options.altText,
    lang: options.lang,
    license: options.license,
    reviewStatus: options.reviewStatus,
  }
}

export function extractPromptText(markdown) {
  const fenced = markdown.match(/```(?:text)?\r?\n([\s\S]*?)```/)
  return (fenced?.[1] ?? markdown).trim()
}
