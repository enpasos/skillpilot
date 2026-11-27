// SPDX-License-Identifier: Apache-2.0
const canonicalNumber = (value: number): string => {
  if (!Number.isFinite(value)) throw new Error('Canonical JSON cannot contain a non-finite number.')
  return JSON.stringify(value)
}

export const canonicalJson = (value: unknown): string => {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value)
  if (typeof value === 'number') return canonicalNumber(value)
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    return `{${entries.join(',')}}`
  }
  throw new Error('Canonical JSON supports only JSON-compatible values.')
}
