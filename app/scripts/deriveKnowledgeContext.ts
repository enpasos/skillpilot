// SPDX-License-Identifier: Apache-2.0
/**
 * Derives the knowledge context of learning goals from the canonical catalog
 * (docs/concept/skill-graph/knowledge-context.md). Read-only and deterministic:
 * the same catalog always yields the same output.
 *
 *   tsx scripts/deriveKnowledgeContext.ts <goalId> [--full] [--json] [--lang en]
 *   tsx scripts/deriveKnowledgeContext.ts --cluster <goalId> [--full] [--lang en]
 *   tsx scripts/deriveKnowledgeContext.ts --report [--json]
 *
 * `--cluster` prints the contexts of all atomic goals below a cluster except
 * orientation goals. `--report` prints the sizes of the contexts per subject.
 *
 * Exit code 0: derived, 2: unreadable input or unknown goal.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  KnowledgeContextIndex, renderKnowledgeContext,
  type ContextForm, type ContextLandscape, type ContextLanguage, type ContextSizeSummary,
} from './lib/knowledgeContext'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const CANONICAL_CATALOG = 'curricula/DE/Gymnasium/canonical'

// Same canonical catalog discovery as the learning-unit validator.
function canonicalFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return canonicalFiles(path)
    return entry.isFile() && /\.json$/iu.test(entry.name) && !/_deck/iu.test(entry.name) ? [path] : []
  }).sort()
}

export function loadCanonicalCatalog(canonical: string = CANONICAL_CATALOG): ContextLandscape[] {
  const landscapes = canonicalFiles(resolve(root, canonical))
    .map((path) => JSON.parse(readFileSync(path, 'utf8')) as Partial<ContextLandscape>)
    .filter((value): value is ContextLandscape => typeof value.landscapeId === 'string' && Array.isArray(value.goals))
  if (landscapes.length === 0) throw new Error(`No canonical landscape under ${canonical}`)
  return landscapes
}

interface Options {
  canonical: string
  goal?: string
  cluster?: string
  report: boolean
  form: ContextForm
  json: boolean
  language: ContextLanguage
}
function parseArgs(args: string[]): Options {
  const options: Options = { canonical: CANONICAL_CATALOG, report: false, form: 'core', json: false, language: 'de' }
  for (let index = 0; index < args.length; index++) {
    const flag = args[index]
    const value = (): string => {
      const next = args[++index]
      if (!next || next.startsWith('--')) throw new Error(`${flag} requires a value`)
      return next
    }
    if (flag === '--full') options.form = 'full'
    else if (flag === '--json') options.json = true
    else if (flag === '--report') options.report = true
    else if (flag === '--cluster') options.cluster = value()
    else if (flag === '--canonical') options.canonical = value()
    else if (flag === '--lang') {
      const language = value()
      if (language !== 'de' && language !== 'en') throw new Error('--lang must be de or en')
      options.language = language
    } else if (flag.startsWith('--')) throw new Error(`Unknown argument: ${flag}`)
    else if (options.goal) throw new Error('Only one goal ID is accepted')
    else options.goal = flag
  }
  const modes = [options.goal, options.cluster, options.report || undefined].filter((mode) => mode !== undefined).length
  if (modes !== 1) throw new Error('Give exactly one of: a goal ID, --cluster <goalId>, --report')
  return options
}

function reportLine(summary: ContextSizeSummary): string {
  const triple = (values: [number, number, number]): string => values.join(' / ')
  return `| ${summary.subject} | ${summary.ordinaryGoals} | ${summary.withoutPrerequisite} | ${triple(summary.buildsOn)} |`
    + ` ${triple(summary.secured)} | ${triple(summary.leadsTo)} | ${triple(summary.notYet)} | ${triple(summary.coreTitleCharacters)} |`
}

function main(): number {
  let options: Options, index: KnowledgeContextIndex
  try {
    options = parseArgs(process.argv.slice(2))
    index = new KnowledgeContextIndex(loadCanonicalCatalog(options.canonical))
  } catch (error) {
    console.error(`invalid-input: ${error instanceof Error ? error.message : String(error)}`)
    return 2
  }

  try {
    if (options.report) {
      const summaries = index.landscapeIds().map((landscapeId) => index.summarize(landscapeId))
        .filter((summary) => summary.ordinaryGoals > 0)
        .sort((left, right) => left.subject < right.subject ? -1 : left.subject > right.subject ? 1 : 0)
      if (options.json) console.log(JSON.stringify(summaries, null, 2))
      else {
        console.log('Sizes of the knowledge contexts of the ordinary goals; each cell is median / 90th percentile / maximum.\n')
        console.log('| Subject | Ordinary goals | Without prerequisite | Builds on | Secured | Leads to | Not yet | Core title characters |')
        console.log('| --- | --- | --- | --- | --- | --- | --- | --- |')
        for (const summary of summaries) console.log(reportLine(summary))
      }
      return 0
    }

    const keys = options.goal ? [index.resolveAtomicGoal(options.goal)] : (() => {
      const graph = index.graph
      const matches = index.landscapeIds().map((landscapeId) => `${landscapeId}:${options.cluster}`).filter((key) => graph.has(key))
      const key = graph.has(options.cluster!) ? options.cluster! : matches[0]
      if (!key || matches.length > 1) throw new Error(`Unknown or ambiguous goal ${options.cluster}`)
      return graph.atoms(key).filter((atom) => graph.kind(atom) !== 'orientation')
    })()
    const contexts = keys.map((key) => index.context(key))
    if (options.json) console.log(JSON.stringify(options.goal ? contexts[0] : contexts, null, 2))
    else {
      console.log(contexts.map((context) => renderKnowledgeContext(context, { form: options.form, language: options.language }))
        .join('\n---\n\n').trimEnd())
    }
    return 0
  } catch (error) {
    console.error(`invalid-input: ${error instanceof Error ? error.message : String(error)}`)
    return 2
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main()
}
