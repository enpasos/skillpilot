// Renders every formula of the courses built with units through the Cockpit's own Markdown
// and KaTeX pipeline. A formula that does not parse, stays as raw text or loses its display
// form fails here, before a learner sees red source code in a goal, a task or a card.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const curricula = fileURLToPath(new URL('../../curricula/', import.meta.url))
// Evidence, retained sources and images hold no course catalog and are very deep; they are not searched.
const skippedDirectories = new Set(['quality', 'visualizations', 'input', 'provenance', 'static'])
const jsonFiles = (directory: string): string[] => readdirSync(directory).flatMap(name => {
  const path = join(directory, name)
  return statSync(path).isDirectory() ? skippedDirectories.has(name) ? [] : jsonFiles(path) : name.endsWith('.json') ? [path] : []
})

export interface FormulaRendering { inline: number; display: number; problem?: string }
// KaTeX shows what it cannot read in its error colour instead of failing (an unknown command such
// as \farc stays red inside an ordinary formula). A colour no formula uses makes every such place visible.
const ERROR_COLOR = '#ff00fe'
export function renderFormulas(text: string): FormulaRendering {
  const warnings: string[] = []
  const warn = console.warn
  console.warn = (...args: unknown[]) => { warnings.push(args.map(String).join(' ')) }
  let html: string
  try {
    html = renderToStaticMarkup(React.createElement(ReactMarkdown,
      { remarkPlugins: [remarkGfm, remarkMath], rehypePlugins: [[rehypeKatex, { errorColor: ERROR_COLOR }]] }, text))
  } finally { console.warn = warn }
  const fences = (text.match(/\$\$/g) ?? []).length
  const display = fences / 2
  const inline = ((text.match(/\$/g) ?? []).length - fences * 2) / 2
  const renderedDisplay = (html.match(/class="katex-display"/g) ?? []).length
  const rendered = (html.match(/class="katex"/g) ?? []).length
  const problem = html.includes('katex-error') || html.includes(ERROR_COLOR) ? 'a formula does not parse'
    : warnings.length ? `KaTeX warns: ${warnings[0].slice(0, 120)}`
    : html.includes('$') ? 'a delimiter is left as text'
      : renderedDisplay !== display ? `${renderedDisplay} of ${display} displayed formulas are rendered as displays`
        : rendered !== inline + display ? `${rendered} of ${inline + display} formulas are rendered` : undefined
  return { inline, display, problem }
}

// The learner-facing text fields, the same as in scripts/check_course_formulas.py.
const textKeys = new Set(['title', 'titleEn', 'description', 'descriptionEn', 'taskContent', 'taskContentEn',
  'solutionContent', 'solutionContentEn', 'label', 'labelEn', 'promise', 'promiseEn', 'front', 'back'])
const texts = (node: unknown, path: string): [string, string][] => Array.isArray(node)
  ? node.flatMap((item, index) => texts(item, `${path}/${index}`))
  : node && typeof node === 'object' ? Object.entries(node).flatMap(([key, value]) => typeof value === 'string'
    ? textKeys.has(key) && value.includes('$') ? [[`${path}/${key}`, value] as [string, string]] : []
    : texts(value, `${path}/${key}`)) : []

// The check itself: good formulas pass, broken ones are named.
for (const good of ['Solve $x + y = 3$.', 'Use\n\n$$\n\\begin{aligned} x &= 1 \\\\ y &= 2 \\end{aligned}\n$$\n\nthen stop.',
  '1. Use the system\n\n   $$\n   \\begin{pmatrix} x \\\\ y \\end{pmatrix}\n   $$\n\n   and go on.']) {
  if (renderFormulas(good).problem) throw new Error(`A valid formula is reported: ${good}`)
}
if (renderFormulas('Solve $\\frac{1}{$.').problem !== 'a formula does not parse') throw new Error('A broken formula passes.')
if (renderFormulas('Half is $\\farc{1}{2}$.').problem !== 'a formula does not parse') throw new Error('An unknown command passes.')
if (!renderFormulas('The price is $5.').problem) throw new Error('A single delimiter passes.')
if (!renderFormulas('Use $$\\begin{aligned} x &= 1 \\end{aligned}$$ here.').problem?.includes('displayed')) {
  throw new Error('A displayed formula written inside a line passes although it is rendered inline.')
}

let courses = 0, inline = 0, display = 0
const problems: string[] = []
for (const path of jsonFiles(curricula).sort()) {
  let document: { learningUnitCoverage?: string; goals?: { extendedData?: { vocabularySource?: unknown } }[] }
  try { document = JSON.parse(readFileSync(path, 'utf8')) } catch { continue }
  if (document?.learningUnitCoverage !== 'complete') continue
  courses++
  const decks = (document.goals ?? []).flatMap(goal => typeof goal.extendedData?.vocabularySource === 'string'
    ? [join(dirname(path), basename(goal.extendedData.vocabularySource))] : [])
  for (const file of [path, ...decks]) {
    for (const [where, text] of texts(JSON.parse(readFileSync(file, 'utf8')), basename(file))) {
      const result = renderFormulas(text)
      inline += result.inline; display += result.display
      if (result.problem) problems.push(`${where}: ${result.problem}`)
    }
  }
}
if (problems.length) throw new Error(`Formulas that the Cockpit cannot render:\n${problems.join('\n')}`)
if (!courses) throw new Error('No course with complete unit coverage was found.')
console.log(`Course formula rendering passed: ${courses} course(s), ${inline} formulas in the text and ${display} displayed formulas render without error.`)
