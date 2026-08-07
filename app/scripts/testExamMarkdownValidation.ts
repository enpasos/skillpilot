import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { findExamMarkdownTableIssues } from './lib/examMarkdownValidation'

const malformed = [
  '| Gruppe Nord | 84 | 86 |',
  '| Gruppe Süd | 78 | 82 |',
].join('\n')
assert.deepEqual(findExamMarkdownTableIssues(malformed), [
  {
    startLine: 1,
    endLine: 2,
    message: 'table-like pipe rows need a GFM delimiter row directly below the header',
  },
])

const valid = [
  '| Gruppe | Zeit 1 | Zeit 2 |',
  '| --- | ---: | ---: |',
  '| Nord | 84 | 86 |',
  '| Süd | 78 | 82 |',
].join('\n')
assert.deepEqual(findExamMarkdownTableIssues(valid), [])
const renderedTable = renderToStaticMarkup(
  createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, valid),
)
assert.match(renderedTable, /<table>/u)
assert.match(renderedTable, /<th>Gruppe<\/th>/u)
assert.match(renderedTable, /<td>Nord<\/td>/u)

const inconsistentColumns = [
  '| Gruppe | Zeit 1 | Zeit 2 |',
  '| --- | ---: | ---: |',
  '| Nord | 84 |',
].join('\n')
assert.equal(findExamMarkdownTableIssues(inconsistentColumns).length, 1)
assert.match(findExamMarkdownTableIssues(inconsistentColumns)[0].message, /expected 3/u)

assert.deepEqual(findExamMarkdownTableIssues('Die Schreibweise |x| bezeichnet einen Betrag.'), [])
assert.deepEqual(findExamMarkdownTableIssues('| einzelne | Zeile |'), [])

const canonicalPath = join(
  process.cwd(),
  '../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const canonical = JSON.parse(readFileSync(canonicalPath, 'utf8')) as {
  goals?: Array<{
    id?: string
    examData?: { taskContent?: string }
  }>
}
const releasedTask = canonical.goals?.find(
  (goal) => goal.id === 'c82e4a0a-0af8-54a3-99f1-2789ec4dc3ea',
)
assert.ok(releasedTask?.examData?.taskContent, 'released J7 task 7 must have taskContent')
assert.deepEqual(findExamMarkdownTableIssues(releasedTask.examData.taskContent), [])

const releasedTaskHtml = renderToStaticMarkup(
  createElement(
    ReactMarkdown,
    { remarkPlugins: [remarkGfm] },
    releasedTask.examData.taskContent,
  ),
)
assert.equal((releasedTaskHtml.match(/<table>/gu) ?? []).length, 1)
assert.equal((releasedTaskHtml.match(/<th(?:\s|>)/gu) ?? []).length, 8)
assert.equal((releasedTaskHtml.match(/<tr>/gu) ?? []).length, 3)
assert.match(releasedTaskHtml, /<td>Nord<\/td>/u)
assert.match(releasedTaskHtml, /<td>Süd<\/td>/u)

console.log('Exam Markdown table validation tests passed.')
