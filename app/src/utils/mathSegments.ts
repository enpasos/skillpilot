/**
 * Splits a learner-facing text into plain text and formulas. A formula stands between `$…$`
 * or `$$…$$`; an escaped `\$` is a dollar sign. Unlike Markdown rendering, everything outside
 * a formula stays literal: a title such as "1. Compare *a* and $x$" keeps its number and stars.
 */
export type MathSegment = { kind: 'text'; value: string } | { kind: 'math'; value: string; display: boolean }

const TOKEN = /\\\$|\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g

export function splitMath(text: string): MathSegment[] {
  const segments: MathSegment[] = []
  let buffer = ''
  let last = 0
  for (const match of text.matchAll(TOKEN)) {
    buffer += text.slice(last, match.index)
    last = match.index + match[0].length
    if (match[0] === '\\$') { buffer += '$'; continue }
    if (buffer) segments.push({ kind: 'text', value: buffer })
    buffer = ''
    segments.push(match[1] !== undefined
      ? { kind: 'math', value: match[1].trim(), display: true }
      : { kind: 'math', value: match[2], display: false })
  }
  buffer += text.slice(last)
  if (buffer) segments.push({ kind: 'text', value: buffer })
  return segments
}

export const hasMath = (text: string) => splitMath(text).some(segment => segment.kind === 'math')

// Readable plain forms of the commands that occur in titles and short texts.
const COMMANDS: [RegExp, string][] = [
  [/\^\{\\mathsf\s*T\}/g, 'ᵀ'], [/\\mathsf\s*T/g, 'T'], [/\s*\\cdot\s*/g, '·'], [/\s*\\times\s*/g, '×'],
  [/\\leftarrow/g, '←'], [/\\rightarrow|\\to\b/g, '→'], [/\\Rightarrow/g, '⇒'], [/\\neq/g, '≠'],
  [/\\leq?\b/g, '≤'], [/\\geq?\b/g, '≥'], [/\\pm/g, '±'], [/\\approx/g, '≈'], [/\\infty/g, '∞'],
  [/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2'], [/\\sqrt\{([^{}]*)\}/g, '√($1)'],
  [/\\left|\\right/g, ''], [/\\[,;: ]/g, ' '], [/\\\\/g, '; '],
  [/\\(?:begin|end)\{[a-z]*\}/g, ''], [/&/g, ''], [/\\([A-Za-z]+)/g, '$1'], [/[{}]/g, ''],
]

/** Tooltips and accessible names cannot render formulas: they read each formula in a plain form. */
export function plainMathText(text: string): string {
  return splitMath(text).map(segment => segment.kind === 'text' ? segment.value
    : COMMANDS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), segment.value).replace(/\s+/g, ' ').trim()).join('')
}
