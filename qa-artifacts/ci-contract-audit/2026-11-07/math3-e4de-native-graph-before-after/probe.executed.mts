// SPDX-License-Identifier: Apache-2.0
// Read-only native CQR-001 before/after probe. Does not implement graph or scope semantics.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { checkSkillGraphIntegrity } from '/home/enpasos/projects/skillpilot/app/scripts/lib/skillGraphIntegrity.ts'

const repoRoot = '/home/enpasos/projects/skillpilot'
const canonicalRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical')
const candidatePath = process.argv[2] || '/dev/shm/skillpilot-root-math3-coherent-20261107-_qwmi4e5/source-e4de.json'
const out = process.argv[3] || '/dev/shm/skillpilot-math3-native-graph-20261107/results'
const expectedActive = 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6'
const expectedCandidate = 'e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06'
const mathRoot = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
const toRepoPath = (file: string) => relative(repoRoot, file).split(/[\\/]/).join('/')
const ensure = (value: unknown, message: string) => { if (!value) throw new Error(message) }
const jsonBytes = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const save = (name: string, value: unknown) => writeFileSync(join(out, name), jsonBytes(value))
// Exact collectFiles implementation from generateCurriculumQualityStatus.ts.
function collectFiles(root: string, predicate: (fileName: string) => boolean): string[] {
  if (!existsSync(root)) return []

  const result: string[] = []
  const visit = (directory: string) => {
    const entries = readdirSync(directory, { withFileTypes: true })
    entries.forEach((entry) => {
      const absolutePath = join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(absolutePath)
        return
      }
      if (entry.isFile() && predicate(entry.name)) {
        result.push(absolutePath)
      }
    })
  }

  visit(root)
  return result.sort((left, right) => left.localeCompare(right))
}

mkdirSync(out, { recursive: true })
const startedAt = new Date().toISOString()
const codePaths = ['app/scripts/generateCurriculumQualityStatus.ts', 'app/scripts/lib/skillGraphIntegrity.ts', 'app/scripts/auditTransitiveMinimality.ts', 'AGENTS.md']
const codeBefore = codePaths.map(path => ({ path, sha256: sha256(readFileSync(resolve(repoRoot, path))) }))
const cqrSource = readFileSync(resolve(repoRoot, codePaths[0]), 'utf8')
const collectorSource = cqrSource.slice(cqrSource.indexOf('function collectFiles(root:'), cqrSource.indexOf('\nfunction isAtomicGoal(', cqrSource.indexOf('function collectFiles(root:'))).trim()
const ownSource = readFileSync(fileURLToPath(import.meta.url), 'utf8')
const ownCollector = ownSource.slice(ownSource.indexOf('function collectFiles(root:'), ownSource.indexOf('\nmkdirSync(out,', ownSource.indexOf('function collectFiles(root:'))).trim()
ensure(collectorSource === ownCollector, 'Normal CQR file collector must remain byte-identical')
const canonicalFiles = collectFiles(canonicalRoot, (fileName) => /\.json$/i.test(fileName) && !/_deck/i.test(fileName))
ensure(canonicalFiles.length === 21, `Expected actual normal 21 inputs; found ${canonicalFiles.length}`)
const loadedLandscapes = canonicalFiles.map(file => {
  const bytes = readFileSync(file)
  return { file, bytes, sha256: sha256(bytes), landscape: JSON.parse(bytes.toString('utf8')) }
})
const math = loadedLandscapes.find(({ landscape }) => landscape.landscapeId === mathRoot)!
ensure(math && math.sha256 === expectedActive, `Active Mathematics hash mismatch: ${math?.sha256}`)
const candidateBytes = readFileSync(candidatePath)
ensure(sha256(candidateBytes) === expectedCandidate, 'Candidate hash mismatch')
const candidate = JSON.parse(candidateBytes.toString('utf8'))
ensure(candidate.landscapeId === mathRoot, 'Candidate owner mismatch')
const inputsBefore = loadedLandscapes.map(({ file, bytes, sha256, landscape }) => ({ path: toRepoPath(file), bytes: bytes.length, sha256, landscapeId: landscape.landscapeId, goals: landscape.goals.length }))
save('inputs.before.json', inputsBefore)
const integrityCatalog = loadedLandscapes.map(({ file, landscape }) => ({ landscapeId: landscape.landscapeId, sourceFile: toRepoPath(file), goals: landscape.goals }))
const candidateCatalog = loadedLandscapes.map(({ file, landscape }) => ({ landscapeId: landscape.landscapeId, sourceFile: toRepoPath(file), goals: landscape.landscapeId === mathRoot ? candidate.goals : landscape.goals }))
const runNative = (label: string, catalog: typeof integrityCatalog) => {
  const runStartedAt = new Date().toISOString()
  console.log(`${runStartedAt} ${label} native check started; ${catalog.length} catalog landscapes`)
  const report = checkSkillGraphIntegrity(catalog, [mathRoot])
  const bytes = jsonBytes(report)
  const name = `${label}.native-graph.raw.json.gz`
  const compressed = gzipSync(bytes, { level: 9 })
  writeFileSync(join(out, name), compressed)
  const receipt = { runStartedAt, finishedAt: new Date().toISOString(), reportPath: name, rawBytes: bytes.length, rawSha256: sha256(bytes), gzipBytes: compressed.length, gzipSha256: sha256(compressed) }
  console.log(JSON.stringify({ label, ...receipt, ok: report.ok, checks: report.checks, metrics: report.metrics }))
  return { report, receipt }
}
const before = runNative('before', integrityCatalog)
const after = runNative('after', candidateCatalog)
const key = (f: any) => JSON.stringify([f.ruleId, f.code, f.landscapeId, f.goalId ?? null, f.sourceFile ?? null, f.message])
const beforeByKey = new Map(before.report.findings.map(f => [key(f), f]))
const afterByKey = new Map(after.report.findings.map(f => [key(f), f]))
ensure(beforeByKey.size === before.report.findings.length && afterByKey.size === after.report.findings.length, 'Stable finding keys must be unique')
const removed = before.report.findings.filter(f => !afterByKey.has(key(f)))
const added = after.report.findings.filter(f => !beforeByKey.has(key(f)))
const changed = before.report.findings.flatMap(f => {
  const next = afterByKey.get(key(f))
  return next && JSON.stringify(f) !== JSON.stringify(next) ? [{ before: f, after: next }] : []
})
const sourceDelta: any[] = []
const differences = (a: any, b: any, path: string) => {
  if (JSON.stringify(a) === JSON.stringify(b)) return
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[k], b[k], `${path}/${k.replace(/~/g, '~0').replace(/\//g, '~1')}`)
  } else sourceDelta.push({ path, ...(a === undefined ? {} : { before: a }), ...(b === undefined ? {} : { after: b }) })
}
differences(math.landscape, candidate, '')
save('source-field-delta.json', sourceDelta)
const graphFields = ['id', 'weight', 'contains', 'requires']
const graphEdits: any[] = []
ensure(math.landscape.goals.length === candidate.goals.length, 'Goal count changed')
for (let index = 0; index < math.landscape.goals.length; index++) {
  const prev = math.landscape.goals[index], next = candidate.goals[index]
  ensure(prev.id === next.id, `Goal order or identity changed at ${index}`)
  for (const field of graphFields) if (JSON.stringify(prev[field]) !== JSON.stringify(next[field])) {
    const prevArr = prev[field] ?? [], nextArr = next[field] ?? []
    graphEdits.push({ goalIndex: index, goalId: prev.id, title: prev.title, field, before: prev[field], after: next[field], ...(Array.isArray(prevArr) && Array.isArray(nextArr) ? { removed: prevArr.filter((v: any) => !nextArr.includes(v)), added: nextArr.filter((v: any) => !prevArr.includes(v)) } : {}) })
  }
}
const findingsDelta = { removedCount: removed.length, addedCount: added.length, witnessOrOtherPayloadChanges: changed.length, byteIdenticalRetainedCount: before.report.findings.length - removed.length - changed.length, removed, added, changed }
save('findings-delta.json', findingsDelta)
save('graph-field-delta.json', graphEdits)
const filesAfter = collectFiles(canonicalRoot, (fileName) => /\.json$/i.test(fileName) && !/_deck/i.test(fileName))
const inputsAfter = filesAfter.map(file => ({ path: toRepoPath(file), sha256: sha256(readFileSync(file)), bytes: statSync(file).size }))
const inputGuards = inputsBefore.map(entry => ({ path: entry.path, sha256Before: entry.sha256, sha256After: inputsAfter.find(v => v.path === entry.path)?.sha256, unchanged: inputsAfter.some(v => v.path === entry.path && v.sha256 === entry.sha256) }))
const codeGuards = codeBefore.map(entry => ({ ...entry, sha256After: sha256(readFileSync(resolve(repoRoot, entry.path))), unchanged: entry.sha256 === sha256(readFileSync(resolve(repoRoot, entry.path))) }))
const fileSetUnchanged = JSON.stringify(canonicalFiles) === JSON.stringify(filesAfter)
const candidateUnchanged = sha256(readFileSync(candidatePath)) === expectedCandidate
const allInputsUnchanged = fileSetUnchanged && inputGuards.every(entry => entry.unchanged)
save('inputs.after-and-guards.json', { finishedAt: new Date().toISOString(), fileSetUnchanged, allInputsUnchanged, candidateUnchanged, inputs: inputGuards, code: codeGuards })
ensure(allInputsUnchanged, 'Active inputs drifted during probe')
ensure(candidateUnchanged && codeGuards.every(entry => entry.unchanged), 'Candidate or checker code drifted during probe')
writeFileSync(join(out, 'candidate.source.exact.json.gz'), gzipSync(candidateBytes, { level: 9 }))
const countByRule = (report: any) => Object.fromEntries(report.checks.map((v: any) => [v.id, v.findingCount]))
const receipt = { schemaVersion: 1, startedAt, finishedAt: new Date().toISOString(), scope: 'Native whole-canonical Mathematics CQR-001 check with the normal 21-file canonical identity catalog; no focus/applicability cuts or runtime projection proof.', invocation: 'checkSkillGraphIntegrity(integrityCatalog, [mathRoot])', normalProducer: 'app/scripts/generateCurriculumQualityStatus.ts', normalCollectorByteIdentical: true, roots: [mathRoot], activeSource: { path: toRepoPath(math.file), sha256: math.sha256 }, candidateSource: { originalPath: candidatePath, archivedAs: 'candidate.source.exact.json.gz', bytes: candidateBytes.length, sha256: expectedCandidate }, catalogLandscapes: loadedLandscapes.length, catalogGoals: loadedLandscapes.reduce((n, v) => n + v.landscape.goals.length, 0), before: { ...before.receipt, ok: before.report.ok, findings: before.report.findings.length, byRule: countByRule(before.report), checks: before.report.checks, metrics: before.report.metrics }, after: { ...after.receipt, ok: after.report.ok, findings: after.report.findings.length, byRule: countByRule(after.report), checks: after.report.checks, metrics: after.report.metrics }, delta: { removed: removed.length, added: added.length, changedPayloads: changed.length, identicalRetained: findingsDelta.byteIdenticalRetainedCount, graphFieldEdits: graphEdits.length, sourceFieldEdits: sourceDelta.length }, guards: { all21ActiveInputsUnchanged: allInputsUnchanged, fileSetUnchanged, candidateUnchanged, checkerAndProducerUnchanged: codeGuards.every(entry => entry.unchanged) }, expectedHypothesis: { before: 919, after: 916, actualMatches: before.report.findings.length === 919 && after.report.findings.length === 916 }, boundary: 'This is a global authoring-graph finding delta. No scope-dependent Runtime, full-CQR, strict M7, human review, host or deployment acceptance is claimed.' }
save('receipt.json', receipt)
const artifactFiles = readdirSync(out).map(name => ({ path: name, bytes: statSync(join(out, name)).size, sha256: sha256(readFileSync(join(out, name))) }))
save('artifact-manifest.json', { files: artifactFiles, totalBytesExcludingManifest: artifactFiles.reduce((n,v) => n + v.bytes, 0) })
console.log(JSON.stringify(receipt))
