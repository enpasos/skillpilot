// SPDX-License-Identifier: Apache-2.0
// Preparation only until Root explicitly approves a captured final input manifest.
// No renderer, campaign, vote, synthesis, normal-file writer or full quality run.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { resolve, relative, dirname, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { isDeepStrictEqual as equal } from 'node:util'

const ROOT = process.cwd()
const SELF = relative(ROOT, fileURLToPath(import.meta.url))
const OUT = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current454-final-native-description-inputs-technical-20261018-v2'
const REGISTRY = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const SEM = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
const BASELINE = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current454-targeted-P-owner-selection-technical-20261018-v1/SELECTION.exact454-P-owners-and423-byte-exact-retentions.json'
const DIAGNOSTIC = 'tmp/chemie454-current-description-review-delta-selection.actual.json'
const PROMPT = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'
const CRITERIA = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'
const modules = ['goalBookModel', 'positiveGoalEvidenceProfileModel', 'goalBookEvidenceReviewLoader',
  'materializeGoalDescriptionRolloutBatch', 'validateGoalDescriptionReviewCampaign',
  'validateGoalDescriptionDualRoundResolution', 'reportDeepUnderstandingRollout']
function must(condition: unknown, message: string): asserts condition { if (!condition) throw Error(message) }
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'))
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
// The sealed P selection hashes physical UTF-8 lines WITH their LF/CRLF.
const physicalLines = (text: string): string[] => text.match(/[^\n]*\n|[^\n]+$/g) ?? []
const pin = (path: string) => { const bytes = readFileSync(path); return { path, sha256: hash(bytes), bytes: bytes.length } }
const changed = (a: any, b: any) => [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])].filter(k => !equal(a?.[k], b?.[k]))
const write = (path: string, value: any) => {
  const bytes = JSON.stringify(value, null, 2) + '\n'
  JSON.parse(bytes); writeFileSync(path, bytes, { flag: 'wx' }); read(path)
}
const filesUnder = (path: string): string[] => readdirSync(path, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? filesUnder(path + '/' + e.name) : [path + '/' + e.name])
const checkPins = (pins: any[]) => pins.forEach(p => {
  must(p && typeof p.path === 'string' && /^[a-f0-9]{64}$/.test(p.sha256), 'Malformed exact input pin')
  must(equal(pin(p.path), p), 'Input drift: ' + p.path)
})

async function collect() {
  const imported: any[] = await Promise.all(modules.map(m => import(pathToFileURL(resolve(ROOT, 'app/scripts/' + m + '.ts')).href)))
  const [book, positive, loader, batch, campaign, dual, rollout] = imported
  const pins = new Map<string, any>()
  const keep = (p: string) => { if (!pins.has(p)) pins.set(p, pin(p)); return p }
  const get = (p: string) => read(keep(p))
  // Pin current stock source dependencies and schemas, without running their CLIs.
  const sourceSeen = new Set<string>()
  const source = (p: string) => {
    if (sourceSeen.has(p)) return
    sourceSeen.add(p); keep(p)
    if (!/\.[cm]?tsx?$/.test(p)) return
    const text = readFileSync(p, 'utf8')
    for (const m of text.matchAll(/(?:from\s*|import\(\s*)['"](\.[^'"]+)['"]/g)) {
      const base = resolve(dirname(p), m[1])
      const target = [base, base + '.ts', base + '.tsx', base + '.mts', base + '/index.ts'].find(x => existsSync(x) && !readdirIsDirectory(x))
      must(target, 'Cannot pin local production dependency ' + m[1] + ' from ' + p)
      source(relative(ROOT, target))
    }
  }
  for (const m of modules) source('app/scripts/' + m + '.ts')
  for (const dir of ['contracts/goal-book/v1', 'contracts/goal-description-review/v1', 'contracts/goal-evidence/v2', 'contracts/curriculum-package/v1']) {
    for (const p of filesUnder(dir).filter(p => p.endsWith('.json'))) keep(p)
  }
  keep(SELF); keep(PROMPT); keep(CRITERIA)
  const registry = get(REGISTRY), chem = registry.subjects.find((x: any) => x.subject === 'chemie')
  must(chem?.landscapePath === CANONICAL && chem.semanticKindLedgerPath === SEM, 'Unexpected normal Chemistry input registration')
  must(chem.visualizationQaPath === QA, 'Unexpected Chemistry visualization QA registration')
  const landscape = get(CANONICAL), ledger = get(SEM); keep(QA)
  const byId = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
  must(byId.size === landscape.goals.length && ledger.decisions.length === byId.size, 'Incomplete/duplicate canonical or SEM coverage')
  const kinds = new Map<string, string>(), counts: Record<string, number> = {}
  for (const d of ledger.decisions) {
    must(byId.has(d.goalId) && !kinds.has(d.goalId) && d.decisionStatus === 'authoritative', 'SEM decision is not unique/current: ' + d.goalId)
    must(d.sourceFingerprint === book.fingerprintSemanticKindSourceGoal(byId.get(d.goalId)), 'Stale current SEM source fingerprint: ' + d.goalId)
    kinds.set(d.goalId, d.semanticKind); counts[d.semanticKind] = (counts[d.semanticKind] ?? 0) + 1
  }
  must(ledger.sourceLandscapePath === CANONICAL && ledger.sourceLandscapeId === landscape.landscapeId, 'SEM source mismatch')
  must(ledger.counts.total === byId.size && Object.entries(ledger.counts).every(([k, n]) => k === 'total' || n === (counts[k] ?? 0)), 'SEM declared counts differ')
  const ordinary = new Set([...kinds].filter(([, k]) => k === 'curricularAtomic').map(([id]) => id))
  const selected = new Map<string, any>(), rowCache = new Map<string, any[]>(), configs: any[] = []
  for (const configPath of chem.positiveEvidenceConfigPaths) {
    const cfg = get(configPath), scope = new Set<string>(cfg.scope.goalIds)
    must(cfg.landscapePath === CANONICAL && cfg.semanticKindLedgerPath === SEM && scope.size === cfg.scope.goalIds.length, 'Bad selected P config: ' + configPath)
    const criteria = 'sha256:' + hash(readFileSync(keep(cfg.reviewCriteriaPath)))
    for (const p of cfg.reviewRunManifestPaths ?? []) keep(p)
    if (!rowCache.has(cfg.reviewPath)) rowCache.set(cfg.reviewPath, physicalLines(readFileSync(keep(cfg.reviewPath), 'utf8')).flatMap((wholeLine, i) => {
      const rawLine = wholeLine.replace(/\r?\n$/, '')
      return rawLine.trim() ? [{ rawLine, wholeLine, line: i + 1, record: loader.parseGoalBookEvidenceReviewRecord(JSON.parse(rawLine), cfg.reviewPath + ':' + (i + 1)) }] : []
    }))
    const rows = rowCache.get(cfg.reviewPath)!, rowIds = new Set(rows.map(r => r.record.goalId))
    must(rows.length === scope.size && rowIds.size === rows.length && [...rowIds].every(id => scope.has(id)), 'Selected P file contains missing/duplicate/outside-scope rows: ' + configPath)
    for (const row of rows) {
      const r = row.record, id = r.goalId, goal = byId.get(id), digests: Record<string, string> = {}
      must(ordinary.has(id) && !selected.has(id), 'Nonordinary/duplicate selected P owner: ' + id)
      if (cfg.reviewedResourceTypes.includes('goal-visualization')) for (const link of goal.resourceLinks ?? []) if (link.type === 'goal-visualization') {
        must(link.url.startsWith('/assets/goal-visualizations/'), 'Unexpected visualization URL: ' + id)
        digests[link.url] = 'sha256:' + pin(keep('app/public' + link.url)).sha256
      }
      must(r.schemaVersion === 2 && r.reviewId === cfg.reviewId && r.reviewCriteriaFingerprint === criteria, 'P namespace/criteria mismatch: ' + id)
      must(r.goalFingerprint === positive.fingerprintGoalForPositiveEvidence(goal, kinds.get(id)), 'Stale P goal fingerprint: ' + id)
      must(r.profileFingerprint === positive.fingerprintPositiveGoalEvidenceProfile(r.profile), 'Stale P profile fingerprint: ' + id)
      must(r.reviewInputFingerprint === positive.fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, digests, kinds.get(id)), 'Stale P review-input fingerprint: ' + id)
      const errors = positive.validatePositiveGoalEvidenceRecordSemantics(r, goal, digests, kinds.get(id))
      must(!errors.length, 'P payload semantics: ' + id + ': ' + errors.join('; '))
      selected.set(id, { ...row, configPath, reviewPath: cfg.reviewPath, rawLineSHA256: hash(row.rawLine), wholeLineSHA256: hash(row.wholeLine) })
    }
    configs.push({ configPath, reviewPath: cfg.reviewPath, goalIds: cfg.scope.goalIds })
  }
  must(selected.size === ordinary.size && [...ordinary].every(id => selected.has(id)), 'Current selected whole P owners do not exactly cover SEM ordinary')
  const baseline = get(BASELINE), retained = baseline.exactOneOwnerPerGoal.filter((x: any) => x.wholeOriginalLineByteExact)
  const originalCache = new Map<string, string[]>()
  const retention = retained.map((old: any) => {
    // 423 prior owners bind originalRecordFile/originalRecordLineSHA256;
    // 31 already serialized successors bind nativeInput/nativeRecordLineSHA256.
    // Both line numbers are physical one-based positions in that named file.
    const originalFile = old.originalRecordFile ?? old.nativeInput
    const expectedLineHash = old.originalRecordLineSHA256 ?? old.nativeRecordLineSHA256
    must(originalFile && expectedLineHash && Number.isInteger(old.originalLineOneBased) && old.originalLineOneBased > 0, 'Incomplete historical P line binding: ' + old.goalId)
    if (!originalCache.has(originalFile.path)) {
      must(equal(pin(keep(originalFile.path)), originalFile), 'Historical original P file drift: ' + originalFile.path)
      originalCache.set(originalFile.path, physicalLines(readFileSync(originalFile.path, 'utf8')))
    }
    const original = originalCache.get(originalFile.path)![old.originalLineOneBased - 1]
    must(typeof original === 'string' && hash(original) === expectedLineHash, 'Historical original P line drift: ' + old.goalId)
    must(JSON.parse(original).goalId === old.goalId, 'Historical P line points to another goal: ' + old.goalId)
    const current = selected.get(old.goalId); must(current, 'Retained P owner missing: ' + old.goalId)
    return { goalId: old.goalId, baselineOrigin: old.originalRecordFile ? 'retained_original_owner' : 'serialized_native_successor',
      originalFile: originalFile.path, originalLineOneBased: old.originalLineOneBased,
      originalLineSHA256: hash(original), currentLineSHA256: current.wholeLineSHA256,
      lineHashIncludesTerminator: true, byteExact: original === current.wholeLine, changedFields: changed(JSON.parse(original), current.record) }
  })
  const indices = chem.resolutionIndexPaths.map((path: string) => ({ path, index: get(path) }))
  const retirement = rollout.validateResolutionSemanticRetirements({ config: chem, landscape, semanticKindLedger: ledger, indices, scopeIssues: [] })
  must(!retirement.issues.length, 'Native semantic retirements invalid: ' + retirement.issues.join('; '))
  const chains = rollout.buildResolutionSupersessionChains(chem.resolutionSupersessions ?? [], chem.resolutionIndexPaths, ordinary, retirement)
  must(!chains.issues.length, 'Native supersession chains invalid: ' + chains.issues.join('; '))
  const tips = new Map(chains.chains.map((c: any) => [c.goalId, c.indexPaths.at(-1)]))
  const withdrawals = new Set((chem.resolutionWithdrawals ?? []).map((w: any) => w.indexPath + '#' + w.goalId))
  const owners = new Map<string, any>()
  for (const i of indices) for (const entry of i.index.resolutions) {
    const id = entry.goalId
    if (!ordinary.has(id) || withdrawals.has(i.path + '#' + id) || (tips.has(id) && tips.get(id) !== i.path)) continue
    must(!owners.has(id), 'Duplicate active native D owner: ' + id)
    const group = i.index.groups.find((g: any) => g.groupId === entry.groupId); must(group, 'Missing native group: ' + id)
    const base = relative(ROOT, resolve(dirname(i.path), group.artifactDirectory ?? group.groupId))
    const resolutionPath = relative(ROOT, resolve(dirname(i.path), entry.resolutionPath))
    const firstPath = base + '/round-a/description-review-input.json', secondPath = base + '/round-b/description-review-input.json'
    keep(resolutionPath); keep(firstPath); keep(secondPath)
    owners.set(id, { indexPath: i.path, entry, group, resolutionPath, firstPath, secondPath })
  }
  // Current learner views are frozen as inputs; this helper never writes them.
  for (const p of filesUnder('curricula/DE/Gymnasium/composition-views/chemie').filter(p => p.endsWith('.view.json'))) keep(p)
  const diagnostic = get(DIAGNOSTIC); if (diagnostic.sourceDiagnostic) keep(diagnostic.sourceDiagnostic)
  const snapshot = { canonicalGoalCount: byId.size, ordinaryGoalIds: [...ordinary].sort(),
    selectedPConfigPaths: chem.positiveEvidenceConfigPaths, selectedPCount: selected.size,
    selectedPRows: [...selected].sort(([a], [b]) => a.localeCompare(b)).map(([goalId, r]) => ({ goalId, configPath: r.configPath, reviewPath: r.reviewPath, line: r.line, rawLineSHA256: r.rawLineSHA256, wholeLineSHA256: r.wholeLineSHA256 })),
    activeDOwnerGoalIds: [...owners.keys()].sort(), missingDOwnerGoalIds: [...ordinary].filter(id => !owners.has(id)).sort(),
    originalRetainedPCount: retained.filter((r: any) => r.originalRecordFile).length,
    retainedPExactCount: retention.filter((r: any) => r.baselineOrigin === 'retained_original_owner' && r.byteExact).length,
    baselineWholePCount: retention.length, baselineWholePExactCount: retention.filter((r: any) => r.byteExact).length,
    retainedPHeaderSuccessorsRequiringExplicitApproval: retention.filter((r: any) => !r.byteExact) }
  return { book, batch, campaign, dual, rollout, pins: [...pins.values()].sort((a, b) => a.path.localeCompare(b.path)),
    chem, landscape, byId, ordinary, selected, owners, indices, retirement, diagnostic, snapshot, retention }
}

// Avoid a directory-valued import candidate without following arbitrary symlinks.
function readdirIsDirectory(path: string) { try { readdirSync(path); return true } catch { return false } }

async function execute(manifestPath: string) {
  const spec = read(manifestPath)
  must(spec.subject === 'chemie' && spec.finalInputsApproved === true && typeof spec.approvedBy === 'string' && spec.approvedBy.trim(), 'Root final input approval and approvedBy are required')
  must(spec.outputRoot === OUT, 'Output must be the new additive final454 package')
  checkPins(spec.inputPins); must(!existsSync(OUT), 'Output already exists; preserve it and request an additive successor')
  checkPins(spec.additionalInputGuards ?? [])
  const s = await collect()
  must(equal(s.pins, spec.inputPins) && equal(s.snapshot, spec.snapshot), 'Actual dynamic input set/snapshot differs from approved final pins')
  const approvedHeaders = new Set(spec.approvedRetainedPHeaderSuccessorGoalIds ?? [])
  for (const r of s.retention.filter((r: any) => !r.byteExact)) must(approvedHeaders.has(r.goalId) && equal(r.changedFields, ['reviewInputFingerprint']), 'Unapproved retained P change beyond a review-input header: ' + r.goalId)
  must([...approvedHeaders].every(id => s.retention.some((r: any) => r.goalId === id && !r.byteExact)), 'Unused retained P successor exception')
  const ready = new Set<string>(), nativeChecks: any[] = []
  const scope: any = { landscape: { landscapeId: s.landscape.landscapeId }, rawLandscape: s.landscape,
    goalById: s.byId, rawGoalById: s.byId, atomicGoalIds: s.ordinary, denominator: s.ordinary.size, issues: [] }
  // Once per active owner index, globally. Never repeated inside the batch loop.
  for (const indexPath of new Set<string>([...s.owners.values()].map(o => o.indexPath))) {
    const index = s.indices.find((i: any) => i.path === indexPath).index
    const superseded = new Set<string>(index.resolutions.filter((r: any) => s.owners.get(r.goalId)?.indexPath !== indexPath).map((r: any) => r.goalId))
    const withdrawn = new Map<string, string>((s.chem.resolutionWithdrawals ?? []).filter((w: any) => w.indexPath === indexPath).map((w: any) => [w.goalId, w.historicalResolutionDigest]))
    const result = await s.rollout.validateResolutionIndex(indexPath, s.chem, scope, superseded, withdrawn, s.retirement)
    for (const id of result.ready) if (s.owners.get(id)?.indexPath === indexPath) ready.add(id)
    nativeChecks.push({ indexPath, ready: [...result.ready].sort(), issues: result.issues })
  }
  checkPins(spec.inputPins)
  mkdirSync(OUT, { recursive: true })
  const ids = [...s.ordinary].sort(), aggregate = OUT + '/P.current-selected-whole-records.EXACT.jsonl'
  must(ids.every(id => s.selected.get(id).wholeLine.endsWith('\n')), 'Selected P line lacks a terminator; preserve source bytes and resolve before aggregation')
  writeFileSync(aggregate, ids.map(id => s.selected.get(id).wholeLine).join(''), { flag: 'wx' })
  const writtenRows = physicalLines(readFileSync(aggregate, 'utf8'))
  must(writtenRows.length === ids.length && writtenRows.every((line, i) => line === s.selected.get(ids[i]).wholeLine && equal(JSON.parse(line), s.selected.get(ids[i]).record)), 'Written whole P aggregate differs')
  const viewPath = OUT + '/REVIEW-ONLY.all-current-ordinary.view.json', configPath = OUT + '/BASE.current-ordinary.review.config.json'
  write(viewPath, { $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json', viewFormatVersion: '1.0',
    viewId: 'chemie-current454-final-ordinary-review-20261018-v1', landscapeId: s.landscape.landscapeId,
    scope: { schoolForm: 'Gymnasium', stage: 'CrossStage' }, rootNodes: [{ kind: 'structure', id: 'technical-final-ordinary-review',
      label: 'Technische Review-Basis aller aktuellen Kompetenzen (' + ids.length + ')', children: ids.map(goalId => ({ kind: 'goalEntry', goalId, projectionRole: 'target' })) }] })
  const modelPath = OUT + '/full-current-ordinary.review.book-model.json'
  write(configPath, { schemaVersion: 1, bookId: 'chemie-current454-final-ordinary-review', title: 'Chemie: aktueller vollständiger Review-Kontext',
    landscapePath: CANONICAL, compositionViewPath: viewPath, semanticKindLedgerPath: SEM, goalVisualizationQaPath: QA,
    publicationMode: 'review', atlasBaseUrl: 'https://skillpilot.com/lernzielbuch', evidenceReviewPaths: [aggregate], outputPath: modelPath })
  // Exactly ONE full production load/build. Subsets below derive from this model.
  const { model } = await s.book.loadGoalBookBuildInputs(configPath)
  must(model.pages.length === ids.length && model.pages.every((p: any) => s.ordinary.has(p.goalId)), 'Full stock model does not exactly cover current ordinary')
  const pages = new Map<string, any>(model.pages.map((p: any) => [p.goalId, p]))
  const envelope = new Set(['pageNumber', 'navigationOrder', 'treeOrder', 'anchor', 'breadcrumbs', 'chapterIds', 'pageFingerprint'])
  const references = new Set(['requires', 'reverseRequires', 'externalPrerequisites', 'externalReverseRequires'])
  const allowed = new Set(['goalId', 'shortKey', 'title', 'description', 'applicability', 'visualization', 'evidenceReview', 'goalFingerprint', ...envelope, ...references])
  const refs = (xs: any[]) => xs.map(r => {
    must(Object.keys(r).every(k => ['goalId', 'title', 'anchor', 'pageNumber', 'landscapeId', 'canonicalUrl'].includes(k)), 'Unclassified stock reference key')
    let otherUrl = r.canonicalUrl ?? null
    // A same-goal stock atlas URL replaces an internal page link in a subset.
    // It is link transport; arbitrary URLs and external landscape identity stay payload.
    if (otherUrl) { try { const u = new URL(otherUrl); if (u.origin === 'https://skillpilot.com' && u.pathname === '/lernzielbuch' && u.searchParams.get('landscape') === s.landscape.landscapeId && u.searchParams.get('edition') === 'curricular-atomic-v1' && u.hash === '#goal-' + r.goalId && [...u.searchParams.keys()].every(k => ['landscape', 'edition'].includes(k))) otherUrl = null } catch {} }
    return { goalId: r.goalId, title: r.title, landscapeId: r.landscapeId ?? s.landscape.landscapeId, otherUrl }
  }).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  const payload = (p: any) => {
    must(Object.keys(p).every(k => allowed.has(k)), 'Unclassified stock page key')
    return { ...Object.fromEntries(Object.entries(p).filter(([k]) => !envelope.has(k) && !references.has(k))),
      forwardReferences: refs([...p.requires, ...p.externalPrerequisites]), reverseReferences: refs([...p.reverseRequires, ...p.externalReverseRequires]) }
  }
  const cache = new Map<string, any>(), get = (p: string) => { if (!cache.has(p)) cache.set(p, read(p)); return cache.get(p) }
  const perGoal = ids.map(id => {
    const owner = s.owners.get(id), goal = s.byId.get(id), page = pages.get(id), record = s.selected.get(id).record
    const summary = Object.fromEntries(['reviewId', 'status', 'reviewInputFingerprint', 'profileFingerprint', 'evidenceLevel', 'maximumClaimScope'].map(k => [k, record[k]]))
    must(equal(page.evidenceReview, summary) && page.goalFingerprint === record.goalFingerprint, 'Stock model does not bind exact selected P: ' + id)
    const actual = { goalId: id, goalFingerprint: page.goalFingerprint, pageFingerprint: page.pageFingerprint,
      currentTitleDe: goal.title, currentTitleEn: goal.titleEn, currentDescriptionDe: goal.description, currentDescriptionEn: goal.descriptionEn,
      canonicalContext: s.campaign.buildGoalDescriptionCanonicalContext(goal), reviewContext: { page, evidenceProfile: record } }
    if (!owner) return { goalId: id, requiresActualFinalInputReview: true, reasons: ['no_existing_native_owner'], inventedOldOwner: false }
    const resolution = get(owner.resolutionPath), first = get(owner.firstPath).goals.find((g: any) => g.goalId === id), second = get(owner.secondPath).goals.find((g: any) => g.goalId === id)
    must(first && second && equal(first, second), 'Historical two-round input mismatch: ' + id)
    must(s.dual.fingerprintGoalDescriptionReviewContext(first) === resolution.goal.goalReviewContextFingerprint && s.dual.fingerprintGoalDescriptionReviewPage(first.reviewContext.page) === resolution.goal.pageFingerprint, 'Historical internal input binding invalid: ' + id)
    const canonicalFields = changed(first.canonicalContext, actual.canonicalContext), pFields = changed(first.reviewContext.evidenceProfile, record)
    const textFields = ['currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn'].filter(k => !equal(first[k], actual[k]))
    const payloadFields = changed(payload(first.reviewContext.page), payload(page)), rawPageFields = changed(first.reviewContext.page, page)
    const required = !ready.has(id) || !!(canonicalFields.length + pFields.length + textFields.length + payloadFields.length)
    return { goalId: id, activeIndex: owner.indexPath, resolutionPath: owner.resolutionPath,
      originalFirstInput: owner.firstPath, originalSecondInput: owner.secondPath, originalReviewIdentities: resolution.rounds,
      unchangedProductionNativeContractValid: ready.has(id), canonicalContextChangedFields: canonicalFields,
      completePRecordChangedFields: pFields, bilingualTextChangedFields: textFields, pagePayloadChangedFields: payloadFields,
      rawPageChangedFields: rawPageFields, envelopeOrLinkTransportChangedFields: rawPageFields.filter(k => envelope.has(k) || references.has(k)),
      requiresActualFinalInputReview: required, retainOriginalOwner: !required,
      envelopeOnlyWithValidOldOwner: !required && !!rawPageFields.length,
      oldContextFingerprint: s.dual.fingerprintGoalDescriptionReviewContext(first), currentContextFingerprint: s.dual.fingerprintGoalDescriptionReviewContext(actual),
      newReviewOrScientificAcceptanceClaimed: false }
  })
  const requiredIds = perGoal.filter(r => r.requiresActualFinalInputReview).map(r => r.goalId), required = new Set(requiredIds), done = new Set<string>(), ordered: string[] = []
  while (ordered.length < requiredIds.length) {
    const candidates = requiredIds.filter(id => !done.has(id) && pages.get(id).requires.every((r: any) => !required.has(r.goalId) || done.has(r.goalId)))
      .sort((a, b) => pages.get(a).navigationOrder - pages.get(b).navigationOrder || a.localeCompare(b))
    must(candidates.length, 'Final review subset cannot be ordered prerequisite-safely'); done.add(candidates[0]); ordered.push(candidates[0])
  }
  const baselineIds = new Set<string>(s.diagnostic.requiredNewReviewGoalIds), batchFiles: any[] = []
  write(modelPath, model)
  for (let i = 0; i < ordered.length; i += 20) {
    const n = String(i / 20 + 1).padStart(3, '0'), goalIds = ordered.slice(i, i + 20), bookId = 'chemie-current454-final-context-d-' + n
    const subset = s.batch.buildGoalDescriptionRolloutSubsetModel({ baseModel: model, goalIds, bookId, title: 'Chemie: endgültiger aktueller D-Kontext' })
    const path = OUT + '/batch-' + n + '.config.json', subsetPath = OUT + '/batch-' + n + '.subset.book-model.json'
    write(subsetPath, subset)
    write(path, { $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json', schemaVersion: 1,
      batchId: bookId + '-20261018-v1', subject: 'chemie', subjectLabel: 'Chemie', bookId, title: 'Chemie: endgültiger aktueller D-Kontext',
      baseGoalBookConfigPath: configPath, goalIds, outputDirectory: OUT + '/batch-' + n,
      feedbackBaseUrl: 'https://skillpilot.com/api/goal-feedback', promptPath: PROMPT, criteriaPath: CRITERIA, publicRoot: 'app/public', printDerivativeProfile: 'bounded-atlas' })
    await s.batch.loadGoalDescriptionRolloutBatchConfig(path)
    batchFiles.push({ config: pin(path), subset: pin(subsetPath), goalIds })
  }
  checkPins(spec.inputPins)
  // Public actual inputs use exact copies for scratch-origin inputs. Original
  checkPins(spec.additionalInputGuards ?? [])
  // scratch locations remain provenance labels, never active public pointers.
  const scratch = spec.inputPins.filter((p: any) => p.path.startsWith('tmp/') || p.path.startsWith('/'))
  if (scratch.length) mkdirSync(OUT + '/actual-inputs', { recursive: true })
  const portable = new Map<string, string>()
  for (const p of scratch) {
    const copy = OUT + '/actual-inputs/' + p.sha256.slice(0, 12) + '-' + basename(p.path)
    writeFileSync(copy, readFileSync(p.path), { flag: 'wx' }); portable.set(p.path, copy)
  }
  writeFileSync(OUT + '/ROOT-APPROVAL.exact-original.raw.txt', readFileSync(manifestPath), { flag: 'wx' })
  write(OUT + '/INPUTS.final-root-approved-pins.actual.json', { ...spec,
    inputPins: spec.inputPins.map((p: any) => portable.has(p.path) ? { ...pin(portable.get(p.path)!), capturedOriginalPath: p.path } : p),
    exactOriginalRootApprovalArchive: pin(OUT + '/ROOT-APPROVAL.exact-original.raw.txt') })
  write(OUT + '/MEASUREMENT.actual-current-owner-and-page-deltas.json', { role: 'TECHNICAL_FINAL_INPUT_MEASUREMENT_NOT_A_REVIEW',
    ordinaryGoals: ids.length, selectedPConfigs: s.chem.positiveEvidenceConfigPaths.length, exactWholePRecords: s.selected.size,
    previousDiagnostic: { ...s.diagnostic, sourceDiagnostic: portable.get(s.diagnostic.sourceDiagnostic) ?? s.diagnostic.sourceDiagnostic }, currentNativeReady: ready.size, nativeChecks,
    requiredReviewGoalIds: ordered, additionalToPriorDiagnostic: ordered.filter(id => !baselineIds.has(id)),
    priorDiagnosticNowRetained: [...baselineIds].filter(id => !required.has(id)), retainedPLineResults: s.retention, perGoal })
  // Public source archive is self-contained with cwd-relative dynamic production imports.
  writeFileSync(OUT + '/native-input-helper.mts', readFileSync(SELF), { flag: 'wx' })
  write(OUT + '/RECEIPT.one-current-model-and-targeted-configs.actual.json', { role: 'TECHNICAL_INPUT_SERIALIZATION_ONLY',
    fullModelBuilds: 1, denominator: ids.length, requiredReviewGoals: ordered.length, batches: batchFiles,
    model: pin(modelPath), baseConfig: pin(configPath), wholeP: pin(aggregate), reviewOnlyView: pin(viewPath),
    learnerScopeChanges: 0, normalWrites: 0, renders: 0, reviewVotes: 0, synthesis: 0,
    twoFreshBlindReviewersStillRequired: true, nativeDOrM7OrHumanAcceptanceClaimed: false })
  console.log(JSON.stringify({ executed: true, fullModelBuilds: 1, ordinary: ids.length, requiredReviewGoals: ordered, batches: batchFiles.map(b => b.config.path), outputRoot: OUT }, null, 2))
}

async function main() {
  const args = process.argv.slice(2)
  if (!args.length || (args.length === 1 && args[0] === '--help')) {
    console.log('Preparation only. No model is built by default.\n' +
      'Capture final inputs without building: app/node_modules/.bin/tsx ' + SELF + ' --captureInputpins NEW.json\n' +
      'Root then reviews pins, sets finalInputsApproved=true and approvedBy, and explicitly approves any listed P-header successors.\n' +
      'Execute ONLY after Root release: app/node_modules/.bin/tsx ' + SELF + ' --executeInputpins APPROVED.json\n' +
      'Execution writes one new public evidence directory, one full model, <=20-goal subsets/configs, and measurements. No PDF/campaign/review/normal changes.')
    return
  }
  must(args.length === 2 && ['--captureInputpins', '--executeInputpins'].includes(args[0]) && args[1], 'Use --help; only an explicit capture or approved execute mode is allowed')
  if (args[0] === '--executeInputpins') return execute(args[1])
  const s = await collect()
  must(!existsSync(args[1]), 'Input-pin file already exists; preserve it')
  write(args[1], { role: 'FINAL_INPUT_PIN_CAPTURE_PENDING_ROOT_APPROVAL_NO_MODEL_BUILT', subject: 'chemie',
    finalInputsApproved: false, approvedBy: null, outputRoot: OUT, approvedRetainedPHeaderSuccessorGoalIds: [],
    inputPins: s.pins, snapshot: s.snapshot, modelBuilds: 0, batchesBuilt: 0, normalWrites: 0 })
  console.log(JSON.stringify({ captured: args[1], finalInputsApproved: false, ordinary: s.ordinary.size, selectedPConfigs: s.chem.positiveEvidenceConfigPaths.length, modelBuilds: 0, batchesBuilt: 0 }, null, 2))
}
main().catch(error => { console.error(error instanceof Error ? error.stack : String(error)); process.exitCode = 1 })
