// SPDX-License-Identifier: Apache-2.0

export class DuplicateJsonMemberError extends SyntaxError {
  constructor(key: string, path: string) {
    super(`Duplicate JSON member ${JSON.stringify(key)} in ${path}`)
  }
}

function skipJsonWhitespace(text: string, index: number): number {
  while (/[ \t\r\n]/u.test(text[index] ?? '')) index++
  return index
}

/** Walk members of syntactically valid JSON, ignoring braces and colons inside strings. */
function* objectMembers(text: string, topLevelOnly = false) {
  const objects: Set<string>[] = []
  for (const match of text.matchAll(/"(?:[^"\\]|\\[\s\S])*"|[{}]/gu)) {
    const token = match[0]
    if (token === '{') {
      objects.push(new Set())
    } else if (token === '}') {
      objects.pop()
    } else if (!topLevelOnly || objects.length === 1) {
      const colon = skipJsonWhitespace(text, match.index! + token.length)
      if (text[colon] === ':') {
        const key: string = JSON.parse(token)
        yield { key, members: objects.at(-1)!, valueStart: colon + 1 }
      }
    }
  }
}

/** Return a V2 input only after every object has unambiguous decoded member names. */
export function parseSourceMappingV2Json(bytes: Buffer, path: string): Record<string, unknown> {
  const text = bytes.toString('utf8')
  const value: unknown = JSON.parse(text)
  for (const { key, members } of objectMembers(text)) {
    if (members.has(key)) throw new DuplicateJsonMemberError(key, path)
    members.add(key)
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected a JSON object: ${path}`)
  }
  return value as Record<string, unknown>
}

/** A raw V2 version declaration cannot disappear through the legacy parser's last-wins rule. */
export function declaresSourceMappingV2(bytes: Buffer): boolean {
  const text = bytes.toString('utf8')
  const numberAt = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y
  for (const { key, valueStart } of objectMembers(text, true)) {
    if (key !== 'version') continue
    numberAt.lastIndex = skipJsonWhitespace(text, valueStart)
    const number = numberAt.exec(text)
    if (number !== null && Number(number[0]) === 2) return true
  }
  return false
}
