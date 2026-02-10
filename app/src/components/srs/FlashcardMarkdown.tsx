import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

type MarkdownNode = {
  type?: string
  value?: unknown
  children?: MarkdownNode[]
}

const splitTextByNewlines = (value: string): MarkdownNode[] => {
  const lines = value.split('\n')
  const result: MarkdownNode[] = []

  lines.forEach((line, index) => {
    if (line.length > 0) {
      result.push({ type: 'text', value: line })
    }

    if (index < lines.length - 1) {
      result.push({ type: 'break' })
    }
  })

  return result
}

const remarkSingleLineBreaks = () => (tree: unknown) => {
  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const typedNode = node as MarkdownNode

    if (Array.isArray(typedNode.children)) {
      const nextChildren: MarkdownNode[] = []
      typedNode.children.forEach((child) => {
        if (child.type === 'text' && typeof child.value === 'string' && child.value.includes('\n')) {
          nextChildren.push(...splitTextByNewlines(child.value))
          return
        }

        visit(child)
        nextChildren.push(child)
      })
      typedNode.children = nextChildren
    }
  }

  visit(tree)
}

interface FlashcardMarkdownProps {
  content: string
  className?: string
}

export function FlashcardMarkdown({ content, className }: FlashcardMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkSingleLineBreaks]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ node, ...props }) => {
            void node
            return <p className="my-3 first:mt-0 last:mb-0" {...props} />
          },
          ol: ({ node, ...props }) => {
            void node
            return <ol className="my-3 list-decimal list-inside" {...props} />
          },
          ul: ({ node, ...props }) => {
            void node
            return <ul className="my-3 list-disc list-inside" {...props} />
          },
          li: ({ node, ...props }) => {
            void node
            return <li className="my-1" {...props} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
