/** Keep scalar identity/index arrays readable without expanding each value to a line. */
export function compactScalarArrays(value: unknown, depth = 0): string {
  // Apply JSON's omission/null/toJSON rules once before custom formatting.
  // In particular, an absent optional object property must never emit `undefined`.
  const encoded = JSON.stringify(value)
  if (encoded === undefined) throw new TypeError('Root value has no JSON representation')
  return format(JSON.parse(encoded), depth)
}

function format(value: unknown, depth: number): string {
  const indent = (level: number) => '  '.repeat(level)
  if (Array.isArray(value)) {
    if (value.every(item => item === null || typeof item !== 'object')) return JSON.stringify(value)
    return `[\n${value.map(item => `${indent(depth + 1)}${format(item, depth + 1)}`).join(',\n')}\n${indent(depth)}]`
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
    if (!entries.length) return '{}'
    return `{\n${entries.map(([key, item]) => `${indent(depth + 1)}${JSON.stringify(key)}: ${format(item, depth + 1)}`).join(',\n')}\n${indent(depth)}}`
  }
  return JSON.stringify(value)
}
