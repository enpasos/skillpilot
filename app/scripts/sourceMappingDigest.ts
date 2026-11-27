import { createHash } from 'node:crypto'
import { canonicalJson } from './lib/canonicalJson'

/** Compact UTF-8 JSON with sorted object keys. Array order carries meaning. */
export function sourceMappingDigest(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')
}
