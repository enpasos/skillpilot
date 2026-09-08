/**
 * Read-only proposal emitter. It never writes any file.
 * Run from repository root with Node20 + tsx. Root applies only the emitted patch.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { buildViewCandidates } from './view-candidates.ts'
import { applyPhysicsB040AstroSplitMappings } from './generator-overlay-candidate.ts'
import { buildSourceInventory } from './source-inventory.ts'

const root = process.cwd(), own = dirname(fileURLToPath(import.meta.url))
const ownRelative = relative(root, own)
const clone = (v: any) => JSON.parse(JSON.stringify(v))
const hash = (v: any) => 'sha256:' + createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex')
const assert = (value: any, label: string) => { if (!value) throw new Error(label) }
const equal = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const json = (path: string) => JSON.parse(read(path))
const encode = (v: any) => JSON.stringify(v, null, 2) + '\n'
const authoring = json(ownRelative + '/authoring-input.json')
const sources = json(ownRelative + '/source-decisions.json')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const nativeDiffs: string[] = []

async function unifiedPatch(file: any): Promise<string> {
  if (file.before === null) {
    const lines = file.after.split('\n').slice(0, -1)
    const added = lines.map((line: string) => '+' + line).join('\n') + '\n'
    nativeDiffs.push('--- /dev/null\n+++ ' + file.path + '\n@@ -0,0 +1,' + lines.length + ' @@\n' + added)
    return '*** Add File: ' + file.path + '\n' + added
  }
  if (file.before === file.after) return ''
  const diff = await new Promise<string>((done, reject) => {
    // JSON strings travel through stdin only; Python reads/writes no repository files.
    const child = spawn('python3', ['-B', '-c', "import sys,json,difflib; p=json.load(sys.stdin); sys.stdout.writelines(difflib.unified_diff(p['before'].splitlines(keepends=True),p['after'].splitlines(keepends=True),fromfile=p['path'],tofile=p['path']))"], { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = '', stderr = ''
    child.stdout!.on('data', b => { stdout += b })
    child.stderr!.on('data', b => { stderr += b })
    child.on('error', reject)
    child.stdin.on('error', reject)
    child.on('close', code => code === 0 || code === 1 ? done(stdout) : reject(new Error(stderr)))
    child.stdin.end(JSON.stringify(file))
  })
  nativeDiffs.push(diff)
  return '*** Update File: ' + file.path + '\n' + diff.split('\n').slice(2).map(line => /^@@ /.test(line) ? '@@' : line).join('\n')
}

async function main() {
  assert(hash(read(authoring.priorPlan.path)) === authoring.priorPlan.digest, 'Historical split plan digest changed')
  const beforeText = read(canonicalPath), beforeLandscape = JSON.parse(beforeText), afterLandscape = clone(beforeLandscape)
  const beforeById = new Map<string, any>(beforeLandscape.goals.map((g: any) => [g.id, g]))
  const afterById = new Map<string, any>(afterLandscape.goals.map((g: any) => [g.id, g]))
  const canonicalFieldLeases: any[] = []
  for (const change of authoring.clusterChanges) {
    const goal = afterById.get(change.goalId)
    assert(goal, 'Missing old parent ' + change.goalId)
    for (const [field, expected] of Object.entries(change.fieldLeases)) {
      assert(equal(goal[field], expected), 'Cluster field lease failed ' + change.goalId + '.' + field)
      canonicalFieldLeases.push({ goalId: goal.id, field, before: clone(expected), after: change.after[field] ?? clone(expected) })
    }
    Object.assign(goal, clone(change.after))
  }
  for (const change of authoring.edgeChanges) {
    const goal = afterById.get(change.goalId)
    assert(goal && equal(goal.requires, change.before), 'Requires field lease failed ' + change.goalId)
    canonicalFieldLeases.push({ goalId: goal.id, field: 'requires', before: clone(goal.requires), after: clone(change.after) })
    goal.requires = clone(change.after)
  }
  for (const goal of authoring.newGoals) {
    assert(!afterById.has(goal.id), 'New UUID already exists ' + goal.id)
    assert(!Object.hasOwn(goal.extendedData ?? {}, 'splitFromCanonicalGoalId'), 'Mastery-copying split provenance prohibited')
    afterById.set(goal.id, clone(goal))
    afterLandscape.goals.push(afterById.get(goal.id))
  }
  const changedIds = new Set([...authoring.clusterChanges, ...authoring.edgeChanges].map((g: any) => g.goalId))
  for (const before of beforeLandscape.goals) {
    const after = afterById.get(before.id), allowed = authoring.clusterChanges.some((g: any) => g.goalId === before.id) ? ['type', 'contains', 'requires', 'weight'] : changedIds.has(before.id) ? ['requires'] : []
    for (const field of new Set([...Object.keys(before), ...Object.keys(after)])) {
      assert(allowed.includes(field) || equal(before[field], after[field]), 'Unrelated canonical field changed ' + before.id + '.' + field)
    }
  }
  const graphProof: any = {}
  const externalGoals = readdirSync(resolve(root, 'curricula/DE/Gymnasium/canonical')).filter(p => p.endsWith('.json') && !p.includes('CANONICAL_PHYSIK.'))
    .flatMap(p => json('curricula/DE/Gymnasium/canonical/' + p).goals ?? [])
  const universeById = new Map<string, any>([...externalGoals, ...afterLandscape.goals].map((g: any) => [g.id, g]))
  for (const relation of ['contains', 'requires']) {
    const done = new Set<string>(), active = new Set<string>()
    const visit = (id: string) => {
      assert(!active.has(id), relation + ' cycle at ' + id)
      if (done.has(id)) return
      active.add(id)
      for (const child of universeById.get(id)?.[relation] ?? []) {
        assert(universeById.has(child), relation + ' missing target ' + child)
        visit(child)
      }
      active.delete(id); done.add(id)
    }
    for (const id of afterById.keys()) visit(id)
    graphProof[relation] = { cycleCount: 0, missingReferenceCount: 0, checkedGoals: done.size }
  }
  const views = await buildViewCandidates({ root, beforeLandscape, afterLandscape, externalGoals })
  if (process.argv.includes('--views-only')) {
    console.log(JSON.stringify({ viewReceipt: views.receipt, fileCount: views.files.length }))
    return
  }
  const files: any[] = [{ path: canonicalPath, before: beforeText, after: encode(afterLandscape) }, ...views.files]
  const sourceReceipt: any[] = []
  const sourceGroups = Map.groupBy ? Map.groupBy(sources.records, (r: any) => r.mappingPath) : new Map<string, any[]>()
  if (!sourceGroups.size) for (const record of sources.records) sourceGroups.set(record.mappingPath, [...(sourceGroups.get(record.mappingPath) ?? []), record])
  for (const [path, records] of sourceGroups) {
    const before = json(path), after = clone(before)
    for (const record of records) {
      const extraction = json(record.sourcePath)
      const sourceGoal = extraction.sourceGoals.find((g: any) => g.id === record.sourceGoalId)
      assert(sourceGoal && hash(sourceGoal) === record.sourceGoalDigest, 'Source goal lease failed ' + record.sourceGoalId)
      const decision = before.decisions.find((d: any) => d.sourceGoalId === record.sourceGoalId)
      const mappings = before.mappings.filter((m: any) => m.legacyGoalId === record.sourceGoalId)
      assert(equal(decision, record.beforeDecision), 'Source decision lease failed ' + record.sourceGoalId)
      assert(equal(mappings, record.beforeMappings), 'Source mapping lease failed ' + record.sourceGoalId)
      sourceReceipt.push({ sourceGoalId: record.sourceGoalId, sourceGoalDigest: record.sourceGoalDigest, path, beforeDecision: decision, beforeMappings: mappings, afterCanonicalGoalIds: record.afterCanonicalGoalIds, matchType: 'partial', masteryEquivalent: false })
    }
    applyPhysicsB040AstroSplitMappings(after.decisions, after.mappings)
    const touched = new Set(records.map((r: any) => r.sourceGoalId))
    assert(equal(before.decisions.filter((d: any) => !touched.has(d.sourceGoalId)), after.decisions.filter((d: any) => !touched.has(d.sourceGoalId))), 'Unrelated decisions changed ' + path)
    assert(equal(before.mappings.filter((m: any) => !touched.has(m.legacyGoalId)), after.mappings.filter((m: any) => !touched.has(m.legacyGoalId))), 'Unrelated mappings changed ' + path)
    for (const row of after.mappings.filter((m: any) => touched.has(m.legacyGoalId))) assert(row.matchType === 'partial', 'Exact new source mapping prohibited')
    files.push({ path, before: read(path), after: encode(after) })
  }
  // RP legacy file contains the very same current source IDs, unlike HE old learner-goal compatibility IDs.
  const rpPath = 'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json'
  const rpBefore = json(rpPath), rpAfter = clone(rpBefore), rpArchive: any[] = []
  for (const record of sources.records.filter((r: any) => r.mappingPath.includes('/DE-RP/'))) {
    const oldRows = rpAfter.mappings.filter((m: any) => m.legacyGoalId === record.sourceGoalId)
    assert(equal(oldRows.map((m: any) => m.canonicalGoalId), record.beforeMappings.map((m: any) => m.canonicalGoalId)), 'RP source-ID legacy lease failed ' + record.sourceGoalId)
    assert(oldRows.every((m: any) => m.matchType === 'partial'), 'Unexpected RP exact legacy mapping')
    rpArchive.push(...clone(oldRows))
    const first = rpAfter.mappings.findIndex((m: any) => m.legacyGoalId === record.sourceGoalId)
    rpAfter.mappings = rpAfter.mappings.filter((m: any) => m.legacyGoalId !== record.sourceGoalId)
    rpAfter.mappings.splice(first, 0, ...record.afterCanonicalGoalIds.map((canonicalGoalId: string) => ({ legacyGoalId: record.sourceGoalId, canonicalGoalId, matchType: 'partial' })))
  }
  files.push({ path: rpPath, before: read(rpPath), after: encode(rpAfter) })
  // Deck mutation is exactly one card in two existing files; no other card or deck metadata changes.
  const deckProof: any[] = []
  for (const path of [authoring.memoryDeck.path, authoring.memoryDeck.runtimePath, authoring.memoryDeck.backendRuntimePath].filter(Boolean)) {
    const before = json(path), after = clone(before)
    const cards = Array.isArray(after) ? after : after.cards
    const index = cards.findIndex((c: any) => c.id === authoring.memoryCard.cardId)
    assert(index >= 0 && equal(cards[index], authoring.memoryCard.before), 'c15 exact-card lease failed ' + path)
    assert(authoring.memoryCard.after === null, 'Current explicit c15 disposition is removal, not a replacement card')
    cards.splice(index, 1)
    files.push({ path, before: read(path), after: encode(after) })
    deckProof.push({ path, removedCardId: authoring.memoryCard.cardId, unchangedOtherCards: cards.length, beforeCard: authoring.memoryCard.before, afterCard: null })
  }
  const { buildLedgerCandidates } = await import('./ledger-candidate.ts')
  const judgmentDocument = json(ownRelative + '/individual-am-judgments.json')
  const ledger = await buildLedgerCandidates({ root, beforeLandscape, afterLandscape, authoring, reviewedAt: judgmentDocument.reviewedAt, judgments: judgmentDocument.decisions })
  files.push(...ledger.files)
  const atlasSourcePath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
  const atlasSourceBefore = json(atlasSourcePath), atlasSourceAfter = clone(atlasSourceBefore)
  const kindFile = ledger.files.find((f: any) => f.path === 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json')
  const kindBefore = JSON.parse(kindFile.before), kindAfter = JSON.parse(kindFile.after)
  const oldAtomicCount = kindBefore.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').length
  const newAtomicCount = kindAfter.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').length
  assert(atlasSourceBefore.expectedCurricularAtomicGoalCount === oldAtomicCount, 'Atlas denominator does not match current authoritative semantic inventory; do not silently rebase')
  assert(newAtomicCount - oldAtomicCount === 4, 'B040 expected exact additive atomic denominator delta +4')
  atlasSourceAfter.expectedCurricularAtomicGoalCount = newAtomicCount
  files.push({ path: atlasSourcePath, before: read(atlasSourcePath), after: encode(atlasSourceAfter) })
  const atlasCountDelta = { path: atlasSourcePath, field: 'expectedCurricularAtomicGoalCount', before: oldAtomicCount, after: newAtomicCount, delta: 4, method: 'Exact current K decision inventory, not a hardcoded historical total' }
  const overlayPath = 'app/scripts/lib/physicsB040AstroSplitMappings.ts'
  assert(!existsSync(resolve(root, overlayPath)), 'Generator helper already exists; do not overwrite')
  files.push({ path: overlayPath, before: null, after: read(ownRelative + '/generator-overlay-candidate.ts') })
  const generatorAnchors: Record<string, string> = {
    He: '  const mappedSourceGoalIds = new Set(mappings.map',
    By: '  mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })',
    Bw: '  const reviewedSourceGoalIds = new Set(decisions.map',
    Rp: "const coveredSourceGoalCount = decisions.filter",
    Hh: 'const review = {',
    Sl: '  const uniqueTargetIds = [...new Set(mappings.map',
    Sn: '  const uniqueTargetIds = [...new Set(mappings.map',
    Th: '  const uniqueTargetIds = [...new Set(mappings.map',
  }
  const generatorProof: any[] = []
  for (const [state, anchor] of Object.entries(generatorAnchors)) {
    const path = 'app/scripts/generate' + state + 'PhysicsSourceExtraction.ts', before = read(path)
    assert(!before.includes('applyPhysicsB040AstroSplitMappings'), 'B040 generator hook already exists ' + path)
    assert(before.split(anchor).length === 2, 'Generator insertion anchor is not unique ' + path)
    const indent = anchor.startsWith('  ') ? '  ' : ''
    const after = "import { applyPhysicsB040AstroSplitMappings } from './lib/physicsB040AstroSplitMappings'\n" + before.replace(anchor, indent + 'applyPhysicsB040AstroSplitMappings(decisions, mappings)\n' + anchor)
    files.push({ path, before, after })
    generatorProof.push({ path, insertionAnchor: anchor, rawExtractionRegenerated: false })
  }
  const ts = await import(resolve(root, 'app/node_modules/typescript/lib/typescript.js'))
  const syntaxProof = files.filter(f => f.path.endsWith('.ts')).map(f => {
    const result = ts.transpileModule(f.after, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }, reportDiagnostics: true })
    assert(!(result.diagnostics ?? []).some((d: any) => d.category === ts.DiagnosticCategory.Error), 'Proposed TypeScript syntax failed ' + f.path)
    return { path: f.path, syntaxErrors: 0 }
  })
  const assessments = authoring.assessmentHold.goalIds.map((id: string) => {
    const goal = afterById.get(id)
    assert(equal(goal, beforeById.get(id)), 'Assessment data changed ' + id)
    return { goalId: id, title: goal.title, exactObjectDigest: hash(goal), requires: goal.requires, coveredGoalIds: goal.examData?.coveredGoalIds ?? [], action: 'UNCHANGED: Root must author concrete tasks before successor claims are substituted.' }
  })
  const receipt = {
    schemaVersion: 1, status: 'PROPOSED_NOT_APPLIED', emittedAt: new Date().toISOString(),
    authoringDigest: hash(read(ownRelative + '/authoring-input.json')), sourceDecisionsDigest: hash(read(ownRelative + '/source-decisions.json')),
    fileCount: files.length, fileDigests: files.map(f => ({ path: f.path, beforeDigest: f.before === null ? null : hash(f.before), afterDigest: hash(f.after) })),
    canonical: { oldCount: beforeLandscape.goals.length, proposedCount: afterLandscape.goals.length, newAtoms: authoring.newGoals.map((g: any) => g.id), convertedParents: authoring.clusterChanges.map((c: any) => c.goalId), requiresRewires: authoring.edgeChanges.length, canonicalFieldLeases, allOtherExistingFieldsUnchanged: true, allExistingResourceLinksUnchanged: true, graphProof },
    views: views.receipt, sources: { targetedSourceRows: sourceReceipt.length, sourceReceipt, rpSourceIdLegacyRowsArchived: rpArchive, sourceRawWrites: 0, allNewEdgesPartial: true, inventory: buildSourceInventory(root) },
    memoryDecks: deckProof, ledger: ledger.receipt, atlasCountDelta, generatorProof, syntaxProof, assessments,
    explicitlyNotPerformed: ['canonical writes', 'source regeneration', 'assessment changes', 'learner-state migration', 'image generation/import', 'D/P approval', 'central registry updates', 'blind/human review claims'],
  }
  for (const file of files) {
    assert(file.before === null ? !existsSync(resolve(root, file.path)) : read(file.path) === file.before,
      'Concurrent change detected after snapshot read: ' + file.path + '; regenerate from a stable current snapshot, never overwrite')
  }
  if (process.argv.includes('--receipt-only')) console.log(JSON.stringify(receipt))
  else {
    let patch = '*** Begin Patch\n'
    for (const file of files) patch += await unifiedPatch(file)
    patch += '*** End Patch\n'
    await new Promise<void>((done, reject) => {
      const child = spawn('git', ['apply', '--check', '-p0', '--whitespace=nowarn', '-'], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] })
      let message = ''
      child.stdout.on('data', b => { message += b })
      child.stderr.on('data', b => { message += b })
      child.on('error', reject)
      child.on('close', code => code === 0 ? done() : reject(new Error('Read-only git apply --check failed: ' + message)))
      child.stdin.end(nativeDiffs.join(''))
    })
    const finalReceipt = { ...receipt, patchDigest: hash(patch), patchBytes: Buffer.byteLength(patch), readOnlyGitApplyCheck: 'PASS', filesActuallyApplied: 0 }
    console.log(JSON.stringify(process.argv.includes('--check-only') ? finalReceipt : { patch, receipt: finalReceipt }))
  }
}
main().catch(error => { console.error(error.stack ?? String(error)); process.exitCode = 1 })
