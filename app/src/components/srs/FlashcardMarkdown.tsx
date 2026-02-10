import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface FlashcardMarkdownProps {
  content: string
  className?: string
}

export function FlashcardMarkdown({ content, className }: FlashcardMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ node, ...props }) => {
            void node
            return <p className="m-0" {...props} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
