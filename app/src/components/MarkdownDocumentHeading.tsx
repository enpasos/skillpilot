import React from 'react'
import { Send } from 'lucide-react'

const getTextContent = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getTextContent).join('')
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getTextContent(node.props.children)
  }
  return ''
}

const getSkillPilotSubtitle = (text: string) => {
  const colonMatch = text.match(/^SkillPilot:\s*(.+)$/)
  if (colonMatch) return colonMatch[1].trim()

  const titleMatch = text.match(/^SkillPilot\s+(.+)$/)
  if (titleMatch) return titleMatch[1].trim()

  return null
}

interface MarkdownDocumentH1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  compact?: boolean
}

export const MarkdownDocumentH1: React.FC<MarkdownDocumentH1Props> = ({ children, compact = false, ...props }) => {
  const subtitle = getSkillPilotSubtitle(getTextContent(children).trim())

  if (!subtitle) {
    return (
      <h1 {...props} className="not-prose mb-10 text-4xl font-semibold tracking-tight text-slate-700 dark:text-slate-200">
        {children}
      </h1>
    )
  }

  return (
    <h1 {...props} className={`not-prose ${compact ? 'mb-6' : 'mb-10'}`}>
      <span className="flex items-center gap-3 text-4xl font-bold tracking-tight text-slate-700 dark:text-slate-200">
        <Send size={44} strokeWidth={2} className="shrink-0 text-amber-500" aria-hidden="true" />
        <span>SkillPilot{' '}</span>
      </span>
      <span className="mt-3 block text-2xl font-normal tracking-normal text-text-secondary">
        {subtitle}
      </span>
    </h1>
  )
}
