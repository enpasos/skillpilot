import { getPrivacyViewCopy } from './privacyViewCopy'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const de = getPrivacyViewCopy('de')
const en = getPrivacyViewCopy('en')
const deAiText = de.sections.find(section => section.title.includes('KI-Assistenten'))
  ?.paragraphs.join(' ') ?? ''
const enAiText = en.sections.find(section => section.title.includes('AI Assistants'))
  ?.paragraphs.join(' ') ?? ''

assert(de.effectiveDate.includes('22. Juli 2026'), 'German privacy copy carries the current architecture date')
assert(en.effectiveDate.includes('July 22, 2026'), 'English privacy copy carries the current architecture date')
assert(
  deAiText.includes('Visible Session')
    && deAiText.includes('OAuth/MCP')
    && deAiText.includes('Toolanfragen und Argumente'),
  'German privacy copy discloses both coach variants and explicit tool arguments',
)
assert(
  enAiText.includes('Visible Session')
    && enAiText.includes('OAuth/MCP')
    && enAiText.includes('tool requests and arguments'),
  'English privacy copy discloses both coach variants and explicit tool arguments',
)
assert(
  !deAiText.includes('ausschließlich ein temporäres Sitzungstoken')
    && !enAiText.includes('only a temporary session token'),
  'privacy copy no longer describes the Visible Session transport as the only architecture',
)

console.log('privacy view copy tests passed')
