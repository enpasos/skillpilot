// Apache-2.0. Mechanical normalization with the unchanged production normalizer.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-poly18-aro19-final-current231-source-native-author-root-20261013-v1'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const digest = (path: string) => `sha256:${createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')}`
const write = (path: string, value: unknown) => writeFileSync(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' })
const modulePath = 'app/src/utils/authoring/canonicalAuthoring.ts'
const normalizer = await import(pathToFileURL(resolve(root, modulePath)).href)
const rawPath = `${own}/candidate/canonical523.current402.final-compiled.inactive.json`
const normalizedPath = `${own}/candidate/canonical523.current402.normalized-book.inactive.json`
const normalized = JSON.parse(JSON.stringify(normalizer.normalizeCanonicalLandscape(read(rawPath))))
if (normalized.goals.length !== 523) throw new Error('The stock normalized canonical must retain 523 nodes.')
write(normalizedPath, normalized)
write(`${own}/inputs/raw-to-normalized-exact-production-transport.actual.json`, {
  schemaVersion: 1,
  source: { path: rawPath, sha256: digest(rawPath) },
  normalized: { path: normalizedPath, sha256: digest(normalizedPath) },
  productionNormalizer: { path: modulePath, sha256: digest(modulePath) },
  retainedNodeCount: 523,
  changedSemanticDecisions: 0,
  newScienceVotes: 0,
  activeWrites: false,
})
console.log(JSON.stringify({ rawCanonical: digest(rawPath), normalizedCanonical: digest(normalizedPath), nodeCount: 523 }))
