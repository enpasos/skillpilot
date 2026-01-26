import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface InlineMathTextProps {
  text: string
  className?: string
  title?: string
}

const hasMath = (text: string) => {
  return text.includes('$') || text.includes('\\(') || text.includes('\\[')
}

export const InlineMathText: React.FC<InlineMathTextProps> = ({ text, className, title }) => {
  if (!text) return null
  if (!hasMath(text)) {
    return (
      <span className={className} title={title}>
        {text}
      </span>
    )
  }

  return (
    <span className={className} title={title}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <span>{children}</span>,
        }}
      >
        {text}
      </ReactMarkdown>
    </span>
  )
}
