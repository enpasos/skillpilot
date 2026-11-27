import katex from 'katex'
import * as React from 'react'
import { splitMath } from '../utils/mathSegments'

/**
 * Text with formulas: each `$…$` or `$$…$$` is typeset with KaTeX, everything else stays literal
 * (no Markdown). Line breaks follow the surrounding element, for example `whitespace-pre-line`.
 */
export function MathText({ text, className, title }: { text: string; className?: string; title?: string }) {
  const parts = React.useMemo(() => splitMath(text).map(segment => segment.kind === 'text' ? { text: segment.value }
    : { html: katex.renderToString(segment.value, { displayMode: segment.display, throwOnError: false }) }), [text])
  return <span className={className} title={title}>{parts.map((part, index) => part.html === undefined
    ? <span key={index}>{part.text}</span>
    : <span key={index} dangerouslySetInnerHTML={{ __html: part.html }} />)}</span>
}
