// Preserve old reviews verbatim; remove only natively stale/non-atomic or
// explicitly superseded claims from the active registry. No review is approved here.
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
const { reviewPositiveGoalEvidenceConfig } = await import(pathToFileURL(process.cwd() + '/app/scripts/positiveGoalEvidenceReview.ts').href)
const base = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/physics-paused-checkpoint-20260908-v1'
const registryPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
const physics = registry.subjects.find(s => s.subject === 'physik')
const kinds = JSON.parse(fs.readFileSync(physics.semanticKindLedgerPath, 'utf8')).decisions
const atomic = new Set(kinds.filter(k => k.semanticKind === 'curricularAtomic').map(k => k.goalId))
const work = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/'
const additions = [
  work + 'physics100-final-local-corrections-v1/positive-evidence.config.json',
  work + 'physics100-traffic-flow-audit-v1/positive-evidence.config.json',
  work + 'physics100-final-diode-consolidation-v1/positive-evidence.config.json',
  work + 'physics100-final-astro-consolidation-v1/profiles.config.json',
]
const claims = new Set<string>()
for (const p of additions) {
  const r = reviewPositiveGoalEvidenceConfig(p)
  if (r.errors.length) throw Error(p + '\n' + r.errors.join('\n'))
  for (const id of r.config.scope.goalIds) {
    if (!atomic.has(id) || claims.has(id)) throw Error('Invalid new claim ' + id)
    claims.add(id)
  }
}
const files = new Map<string, string>()
const receipt = []
const retainedPaths = []
for (const p of physics.positiveEvidenceConfigPaths) {
  if (additions.includes(p)) continue
  const r = reviewPositiveGoalEvidenceConfig(p)
  const removed = new Map<string, string[]>()
  for (const id of r.config.scope.goalIds) {
    if (!atomic.has(id)) removed.set(id, ['No longer an atomic goal; stable ID is retained as a cluster.'])
    else if (claims.has(id)) removed.set(id, ['Explicitly superseded by a separately authored and natively valid current profile.'])
  }
  for (const e of r.errors) {
    const id = r.config.scope.goalIds.find(id => e.startsWith(id + ':'))
    if (!id) throw Error('Unresolved config-wide error; cannot filter: ' + p + '\n' + e)
    removed.set(id, [...(removed.get(id) ?? []), e])
  }
  if (!removed.size) { retainedPaths.push(p); continue }
  const ids = r.config.scope.goalIds.filter(id => !removed.has(id))
  if (ids.length) {
    const configPath = p.replace(/\.config\.json$/, '.paused-current-20260908-v1.config.json')
    const reviewPath = configPath.replace(/\.config\.json$/, '.review.jsonl')
    const raw = fs.readFileSync(r.config.reviewPath, 'utf8').trim().split('\n').filter(line => ids.includes(JSON.parse(line).goalId))
    const runIds = new Set(raw.flatMap(line => JSON.parse(line).reviewRunIds))
    const config = { ...r.config, reviewPath, reviewRunManifestPaths: (r.config.reviewRunManifestPaths ?? []).filter(path => runIds.has(JSON.parse(fs.readFileSync(path, 'utf8')).runId)), scope: { ...r.config.scope, label: r.config.scope.label + '; unchanged current subset retained at the user-requested pause', goalIds: ids } }
    files.set(configPath, JSON.stringify(config, null, 2) + '\n')
    files.set(reviewPath, raw.join('\n') + '\n')
    retainedPaths.push(configPath)
  }
  receipt.push({ originalConfig: p, retainedGoalIds: ids, excludedClaims: [...removed].map(([goalId, reasons]) => ({ goalId, reasons })) })
}
physics.positiveEvidenceConfigPaths = [...additions, ...retainedPaths]
files.set(base + '/positive-evidence-retention.receipt.json', JSON.stringify({ schemaVersion: 1, createdAt: new Date().toISOString(), rule: 'Native current validation plus explicit supersession only; historical rows and manifests remain unchanged. No new human or D approval.', additions, retainedSubsets: receipt }, null, 2) + '\n')
const chunk = Number(process.argv[2] ?? 0)
if (![0, 1, 2].includes(chunk)) throw Error('Expected chunk 0, 1, or 2')
let patch = '*** Begin Patch\n'
for (const [index, [p, body]] of [...files].entries()) {
  if (Math.min(2, Math.floor(index / 4)) !== chunk) continue
  if (fs.existsSync(p)) throw Error('Refuse overwrite ' + p)
  patch += '*** Add File: ' + p + '\n' + body.trimEnd().split('\n').map(l => '+' + l).join('\n') + '\n'
}
const d = spawnSync('diff', ['-u', registryPath, '-'], { input: JSON.stringify(registry, null, 2) + '\n', encoding: 'utf8', maxBuffer: 4000000 })
if (d.status !== 1) throw Error('Expected registry updates')
if (chunk === 2) patch += '*** Update File: ' + registryPath + '\n' + d.stdout.trimEnd().split('\n').slice(2).map(l => /^@@ .* @@/u.test(l) ? '@@' : l).join('\n') + '\n'
patch += '*** End Patch\n'
process.stdout.write(patch)
