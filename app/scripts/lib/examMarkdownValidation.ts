export interface ExamMarkdownTableIssue {
  startLine: number
  endLine: number
  message: string
}

function splitPipeRow(line: string): string[] | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null

  const cells: string[] = []
  let current = ''
  let escaped = false

  for (const character of trimmed.slice(1, -1)) {
    if (escaped) {
      current += character
      escaped = false
      continue
    }
    if (character === '\\') {
      current += character
      escaped = true
      continue
    }
    if (character === '|') {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += character
  }
  cells.push(current.trim())

  return cells.length >= 2 ? cells : null
}

function isDelimiterRow(cells: string[]): boolean {
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/u.test(cell))
}

/**
 * Finds malformed table-like blocks in learner-facing exam Markdown.
 *
 * A single pipe row is left alone because it can be ordinary prose or notation.
 * Two or more consecutive rows are treated as an intended GFM table and must
 * have a delimiter in the second row plus a stable column count.
 */
export function findExamMarkdownTableIssues(markdown: string): ExamMarkdownTableIssue[] {
  const lines = markdown.split(/\r?\n/u)
  const issues: ExamMarkdownTableIssue[] = []

  for (let index = 0; index < lines.length;) {
    const firstCells = splitPipeRow(lines[index] ?? '')
    if (!firstCells) {
      index += 1
      continue
    }

    const rows: Array<{ line: number; cells: string[] }> = []
    let cursor = index
    while (cursor < lines.length) {
      const cells = splitPipeRow(lines[cursor] ?? '')
      if (!cells) break
      rows.push({ line: cursor + 1, cells })
      cursor += 1
    }

    if (rows.length >= 2) {
      const startLine = rows[0].line
      const endLine = rows.at(-1)?.line ?? startLine
      if (!isDelimiterRow(rows[1].cells)) {
        issues.push({
          startLine,
          endLine,
          message: 'table-like pipe rows need a GFM delimiter row directly below the header',
        })
      } else {
        const expectedColumns = rows[0].cells.length
        const inconsistentRow = rows.find((row) => row.cells.length !== expectedColumns)
        if (inconsistentRow) {
          issues.push({
            startLine,
            endLine,
            message: `table row ${inconsistentRow.line} has ${inconsistentRow.cells.length} columns; expected ${expectedColumns}`,
          })
        }
      }
    }

    index = cursor
  }

  return issues
}
