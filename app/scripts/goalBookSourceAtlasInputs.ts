import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { fingerprintSemanticKindSourceGoal, parseSubjectDurationModelPolicy } from './goalBookModel'

type Row = Record<string, unknown>
export interface GoalBookSourceAtlasInputConfig {
  schemaVersion: 1
  bookId: string
  subject: string
  landscapePath: string
  semanticKindLedgerPath: string
  durationModelPolicyPath: string
  /** Pinned original-document downloads; source extractions remain required inputs. */
  sourceDocumentSnapshots?: { path: string, url: string, sha256: string }[]
  mappingPaths: string[]
  allowedSourceSubjects?: string[]
  fallbackViewPaths?: string[]
  outputDirectory: string
  manifestPath: string
  navigationViewPath: string
  navigationViewId: string
  expectedJurisdictions: string[]
  expectedCurricularAtomicGoalCount: number
  /** Before authored-view fallback: source metadata must never be relabelled. */
  expectedUnresolvedScopeDecisionCount: number
}
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const BOOK_ROOT = 'app/scripts/config/goal-books/'
const row = (v: unknown): Row => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Row : {}
const rows = (v: unknown): Row[] => Array.isArray(v) ? v.map(row) : []
const str = (v: unknown): string => typeof v === 'string' ? v.trim() : ''
const strings = (v: unknown): string[] => Array.isArray(v) ? v.map(str).filter(Boolean) : []
const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0
const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort(compare)
const tags = (r: Row, key: string): string[] => strings(r.tags).filter(v => v.startsWith(`${key}:`)).map(v => v.slice(key.length + 1))
const serialize = (v: unknown): string => `${JSON.stringify(v, null, 2)}\n`
const digest = (v: string | Buffer): string => `sha256:${createHash('sha256').update(v).digest('hex')}`
const local = (root: string, path: string): string => {
  const child = relative(root, resolve(root, path))
  assert.ok(path && !isAbsolute(path) && child !== '..' && !child.startsWith('../') && !isAbsolute(child), `Not repository-relative: ${path}`)
  return resolve(root, path)
}

/** Explicit SOURCE metadata only. A broad two-stage collection does not locate a goal. */
export const sourceAtlasFacet = (levels: Row[], dimension: 'stage' | 'courseProfile'): string[] | null => {
  const keys = dimension === 'stage' ? ['stage', 'phase'] : ['courseProfile', 'courseLevel']
  const allowed = dimension === 'stage' ? ['SekI', 'SekII'] : ['GK', 'LK']
  let known: string[] | undefined
  for (const level of levels) for (const key of keys) {
    for (const values of [[str(level[key])].filter(Boolean), tags(level, key)]) {
      const parsed = values.flatMap(value => {
        if (dimension === 'stage') value = value.replaceAll('Sekundarstufe II', 'SekII').replaceAll('Sekundarstufe I', 'SekI')
        return dimension === 'courseProfile' && ['GK_LK', 'GK/LK', 'both'].includes(value) ? ['GK', 'LK'] : value.split(/[+/_]/u)
      })
      if (!parsed.length || parsed.some(value => !allowed.includes(value))) continue
      const normalized = sorted(parsed)
      known = known ? known.filter(value => normalized.includes(value)) : normalized
      if (!known.length) return null
    }
  }
  return dimension === 'stage' && known?.length === 2 ? [] : known ?? []
}

/** Child mappings may inherit; separately sourced supplement boundaries may not. */
export const sourceAtlasDescendants = (targetId: string, goals: Map<string, Row>, atoms: Set<string>, landscapeId: string): string[] => {
  const result = new Set<string>()
  const visited = new Set<string>()
  const visit = (rawId: string, inherited: boolean) => {
    const id = rawId.replace(`${landscapeId}:`, '')
    if (visited.has(id)) return
    visited.add(id)
    const goal = goals.get(id)
    assert.ok(goal, `Unknown mapped canonical target: ${id}`)
    const data = row(goal.extendedData)
    if (data.applicabilityProjection === 'excluded' || (inherited && data.applicabilityMappingInheritance === 'boundary')) return
    if (atoms.has(id)) result.add(id)
    for (const child of strings(goal.contains)) visit(child, true)
  }
  visit(targetId, false)
  return sorted(result)
}

const sourceDocument = (extraction: Row, goal: Row, passage: Row): Row => {
  const docs = rows(extraction.sourceDocuments)
  if (!docs.length && Object.keys(row(extraction.sourceDocument)).length) docs.push(row(extraction.sourceDocument))
  const keys = sorted([str(goal.sourceDocumentKey), ...tags(goal, 'sourceDocument'), str(passage.sourceDocumentKey)].filter(Boolean))
  assert.ok(keys.length <= 1, `Conflicting source documents: ${str(goal.id)}`)
  const matches = keys.length ? docs.filter(doc => str(doc.key) === keys[0]) : docs
  assert.equal(matches.length, 1, `Ambiguous source document: ${str(goal.id)}`)
  return matches[0]
}

/** Lossless provenance compression; the in-memory build/check API stays readable. */
export const compactGoalBookSourceAtlasReceipt = (receipt: Row): Row => {
  const bindings = rows(receipt.inputBindings)
  const inputIndex = new Map(bindings.map((binding, index) => [str(binding.path), index]))
  const ref = (path: unknown): number => {
    const index = inputIndex.get(str(path))
    assert.notEqual(index, undefined, `Unbound receipt input: ${str(path)}`)
    return index as number
  }
  const sharedGroups: Row[] = []
  const sharedGroupIndex = new Map<string, number>()
  const scopes = rows(receipt.scopes).map(scope => {
      const fields = Object.fromEntries(Object.entries(scope).filter(([key]) => key !== 'witnesses'))
      const groups = new Map<string, { context: Row, goalIds: string[] }>()
      for (const witness of rows(scope.witnesses)) {
        const context = {
          mappingInput: ref(witness.mappingPath),
          extractionInput: ref(witness.sourceExtractionPath),
          sourceGoalId: witness.sourceGoalId,
          mappedTargetGoalId: witness.mappedTargetGoalId,
          coverage: witness.coverage,
          profileBasis: witness.profileBasis,
          ...(witness.fallbackViewPath ? { fallbackViewInput: ref(witness.fallbackViewPath) } : {}),
        }
        const key = JSON.stringify(context)
        const group = groups.get(key) ?? { context, goalIds: [] }
        group.goalIds.push(str(witness.goalId))
        groups.set(key, group)
      }
      const witnessGroupRefs = [...groups.values()].map(({ context, goalIds }) => {
        const value = { ...context, goalIds }
        const key = JSON.stringify(value)
        let index = sharedGroupIndex.get(key)
        if (index === undefined) {
          index = sharedGroups.length
          sharedGroups.push(value)
          sharedGroupIndex.set(key, index)
        }
        return index
      })
      return { ...fields, witnessGroupRefs }
    })
  return { ...receipt, witnessEncoding: 'input-binding-index-shared-witness-groups-v1', witnessGroups: sharedGroups, scopes }
}

export const expandGoalBookSourceAtlasReceipt = (compact: Row): Row => {
  assert.equal(compact.witnessEncoding, 'input-binding-index-shared-witness-groups-v1')
  const receipt = Object.fromEntries(Object.entries(compact).filter(([key]) => key !== 'witnessEncoding' && key !== 'witnessGroups'))
  const groups = rows(compact.witnessGroups)
  const bindings = rows(receipt.inputBindings)
  const path = (index: unknown): string => {
    assert.ok(Number.isInteger(index) && Number(index) >= 0 && Number(index) < bindings.length, 'Invalid receipt input reference')
    return str(bindings[Number(index)].path)
  }
  return { ...receipt, scopes: rows(receipt.scopes).map(scope => {
    const fields = Object.fromEntries(Object.entries(scope).filter(([key]) => key !== 'witnessGroupRefs'))
    assert.ok(Array.isArray(scope.witnessGroupRefs))
    const scopeGroups = scope.witnessGroupRefs.map(index => {
      assert.ok(Number.isInteger(index) && index >= 0 && index < groups.length, 'Invalid receipt witness group reference')
      return groups[index]
    })
    const witnesses = scopeGroups.flatMap(group => strings(group.goalIds).map(goalId => ({
      mappingPath: path(group.mappingInput), sourceExtractionPath: path(group.extractionInput), sourceGoalId: group.sourceGoalId,
      mappedTargetGoalId: group.mappedTargetGoalId, goalId, coverage: group.coverage, profileBasis: group.profileBasis,
      ...(group.fallbackViewInput !== undefined ? { fallbackViewPath: path(group.fallbackViewInput) } : {}),
    })))
    return { ...fields, witnesses }
  }) }
}

/** Pure with respect to the worktree: computes bytes, never writes or mutates inputs. */
export const buildGoalBookSourceAtlasInputs = (config: GoalBookSourceAtlasInputConfig, repoRoot = REPO_ROOT) => {
  assert.equal(config.schemaVersion, 1)
  assert.ok(Number.isInteger(config.expectedUnresolvedScopeDecisionCount) && config.expectedUnresolvedScopeDecisionCount >= 0)
  assert.deepEqual(config.expectedJurisdictions, sorted(config.expectedJurisdictions))
  assert.ok(config.expectedJurisdictions.every(j => /^DE-[A-Z]{2}$/u.test(j)))
  assert.equal(new Set(config.mappingPaths).size, config.mappingPaths.length)
  const snapshots = new Map((config.sourceDocumentSnapshots ?? []).map(snapshot => {
    assert.ok(/^curricula\/DE\/Gymnasium\/input\/.+\.pdf$/u.test(snapshot.path), `Invalid source snapshot path: ${snapshot.path}`)
    assert.ok(!snapshot.path.split('/').includes('..') && !snapshot.path.includes('\\'), `Invalid source snapshot path: ${snapshot.path}`)
    local(repoRoot, snapshot.path)
    assert.ok(/^sha256:[a-f0-9]{64}$/u.test(snapshot.sha256), `Invalid source snapshot digest: ${snapshot.path}`)
    const url = new URL(snapshot.url)
    assert.ok(url.protocol === 'https:' && !url.username && !url.password, `Invalid source snapshot URL: ${snapshot.path}`)
    return [snapshot.path, snapshot] as const
  }))
  assert.equal(snapshots.size, config.sourceDocumentSnapshots?.length ?? 0, 'Duplicate source document snapshot')
  const usedSnapshots = new Set<string>()
  const bindings = new Map<string, string>()
  const read = (path: string): Row => {
    const bytes = readFileSync(local(repoRoot, path))
    bindings.set(path, digest(bytes))
    return row(JSON.parse(bytes.toString('utf8')))
  }
  const raw = read(config.landscapePath)
  assert.equal(raw.subject, config.subject, 'Canonical landscape subject mismatch')
  const landscapeId = str(raw.landscapeId)
  const landscape = normalizeCanonicalLandscape(raw)
  const goals = new Map(rows(raw.goals).map(goal => [str(goal.id), goal]))
  assert.equal(goals.size, rows(raw.goals).length, 'Duplicate canonical goal IDs')
  const ledger = read(config.semanticKindLedgerPath)
  assert.equal(ledger.sourceLandscapeId, landscapeId)
  const decisions = rows(ledger.decisions)
  assert.equal(decisions.length, goals.size, 'Semantic-kind ledger must cover every canonical goal')
  assert.equal(new Set(decisions.map(d => str(d.goalId))).size, goals.size)
  for (const decision of decisions) {
    const goal = goals.get(str(decision.goalId))
    assert.ok(goal, `Unknown semantic-kind goal: ${str(decision.goalId)}`)
    assert.equal(decision.decisionStatus, 'authoritative')
    assert.equal(decision.sourceFingerprint, fingerprintSemanticKindSourceGoal(goal), `Stale semantic-kind binding: ${str(goal.id)}`)
  }
  const atoms = new Set(decisions.filter(d => d.semanticKind === 'curricularAtomic').map(d => str(d.goalId)))
  const durationPolicy = read(config.durationModelPolicyPath)
  const fallbackViews = (config.fallbackViewPaths ?? []).map(path => {
    assert.equal(config.subject, 'Chemie', 'Authored-profile fallback is authorized only for Chemistry')
    assert.ok(/^curricula\/DE\/Gymnasium\/composition-views\/chemie\/de-(?:bb|be)-(?:gk|lk)\.view\.json$/u.test(path), `Fallback must be one of the four explicitly authorized views: ${path}`)
    const view = normalizeCompositionView(read(path))
    // This narrow fallback is explicitly authorized only for these two states.
    assert.ok(['DE-BB', 'DE-BE'].includes(view.scope.jurisdiction ?? ''), `Unsupported fallback jurisdiction: ${path}`)
    assert.equal(view.landscapeId, landscapeId)
    assert.equal(view.scope.schoolForm, 'Gymnasium')
    assert.ok(['SekII', 'CrossStage'].includes(view.scope.stage ?? ''), `Invalid fallback stage: ${path}`)
    assert.ok(['GK', 'LK'].includes(view.scope.courseProfile ?? ''), `Invalid fallback course: ${path}`)
    assert.ok(!view.scope.durationModel, `Unexpected fallback duration: ${path}`)
    const errors = compileCompositionView(view, landscape).findings.filter(f => f.severity === 'error')
    assert.deepEqual(errors, [], `Invalid authored fallback view: ${path}`)
    const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(landscape.goals.map(g => [g.id, g])))
    return { path, view, targetGoalIds }
  })
  type Witness = { mappingPath: string, sourceExtractionPath: string, sourceGoalId: string, mappedTargetGoalId: string, goalId: string, coverage: 'direct' | 'inherited', profileBasis: 'source-metadata' | 'authored-view', fallbackViewPath?: string }
  const scopeWitnesses = new Map<string, Witness[]>()
  const unresolved: Row[] = []
  const mappedAtoms = new Set<string>()
  const unresolvedAtoms = new Set<string>()
  for (const mappingPath of [...config.mappingPaths].sort(compare)) {
    const mapping = read(mappingPath)
    assert.equal(mapping.targetLandscapeId, landscapeId, `Wrong target landscape: ${mappingPath}`)
    const sourceExtractionPath = str(mapping.sourceExtractionPath)
    const extraction = read(sourceExtractionPath)
    assert.equal(mapping.sourceLandscapeId, extraction.sourceLandscapeId, `Source landscape mismatch: ${mappingPath}`)
    assert.ok([config.subject, ...(config.allowedSourceSubjects ?? [])].includes(str(extraction.subject)), `Unexpected source subject: ${str(extraction.subject)}`)
    const jurisdiction = str(extraction.jurisdiction)
    assert.ok(config.expectedJurisdictions.includes(jurisdiction), `Unexpected source jurisdiction: ${jurisdiction}`)
    const sourceGoals = new Map(rows(extraction.sourceGoals).map(g => [str(g.id), g]))
    const passages = new Map(rows(extraction.passages).map(p => [str(p.id), p]))
    const reviewed = new Set<string>()
    for (const decision of rows(mapping.decisions)) {
      const sourceGoalId = str(decision.sourceGoalId)
      assert.ok(!reviewed.has(sourceGoalId), `Duplicate mapping decision: ${sourceGoalId}`)
      reviewed.add(sourceGoalId)
      const sourceGoal = sourceGoals.get(sourceGoalId)
      assert.ok(sourceGoal, `Unknown source goal: ${sourceGoalId}`)
      assert.ok(str(decision.reviewer) && str(decision.reviewedAt) && str(decision.rationale), `Missing reviewed mapping decision metadata: ${sourceGoalId}`)
      if (decision.decision !== 'mapped') continue
      const passage = passages.get(str(sourceGoal.passageId)) ?? {}
      const document = sourceDocument(extraction, sourceGoal, passage)
      const documentPath = str(document.path)
      assert.ok(documentPath, `Missing local source document: ${sourceGoalId}`)
      assert.equal(document.official, true, `Non-official source: ${sourceGoalId}`)
      const url = new URL(str(document.url))
      assert.equal(url.protocol, 'https:')
      assert.ok(!url.username && !url.password)
      const snapshot = snapshots.get(documentPath)
      if (snapshot) {
        assert.equal(snapshot.url, str(document.url), `Source snapshot URL mismatch: ${documentPath}`)
        usedSnapshots.add(documentPath)
      }
      if (!bindings.has(documentPath)) {
        const documentFile = local(repoRoot, documentPath)
        // Original PDF downloads are gitignored caches, not build inputs. A
        // committed snapshot preserves their exact provenance offline; when
        // cached bytes are present they must still match, never silently drift.
        if (snapshot && !existsSync(documentFile)) bindings.set(documentPath, snapshot.sha256)
        else {
          const sha256 = digest(readFileSync(documentFile))
          if (snapshot) assert.equal(sha256, snapshot.sha256, `Source document snapshot mismatch: ${documentPath}`)
          bindings.set(documentPath, sha256)
        }
      }
      const levels = [sourceGoal, passage, document, extraction]
      const stage = sourceAtlasFacet(levels, 'stage')
      const course = sourceAtlasFacet(levels, 'courseProfile')
      const scoped = course !== null && stage?.length === 1 && (stage[0] === 'SekI' || course.length > 0)
      if (!scoped) unresolved.push({ mappingPath, sourceGoalId, jurisdiction, stage, courseProfile: course, reason: stage === null || course === null ? 'conflicting-source-scope' : 'unspecified-source-scope' })
      const targets = strings(decision.canonicalGoalIds)
      assert.ok(targets.length, `Mapped decision without targets: ${sourceGoalId}`)
      for (const rawTarget of targets) {
        const mappedTargetGoalId = rawTarget.replace(`${landscapeId}:`, '')
        for (const goalId of sourceAtlasDescendants(mappedTargetGoalId, goals, atoms, landscapeId)) {
          mappedAtoms.add(goalId)
          if (!scoped) unresolvedAtoms.add(goalId)
          const witness: Witness = { mappingPath, sourceExtractionPath, sourceGoalId, mappedTargetGoalId, goalId, coverage: goalId === mappedTargetGoalId ? 'direct' : 'inherited', profileBasis: 'source-metadata' }
          const add = (key: string, value: Witness) => scopeWitnesses.set(key, [...(scopeWitnesses.get(key) ?? []), value])
          if (scoped && stage) {
            for (const profile of stage[0] === 'SekI' ? [''] : course ?? []) add(`${jurisdiction}/${stage[0]}/${profile}`, witness)
          } else if (stage?.[0] === 'SekII' && course?.length === 0) {
            // A view supplies course membership, never an official-source profile claim.
            for (const fallback of fallbackViews) if (fallback.view.scope.jurisdiction === jurisdiction && fallback.targetGoalIds.has(goalId)) {
              add(`${jurisdiction}/SekII/${fallback.view.scope.courseProfile}`, { ...witness, profileBasis: 'authored-view', fallbackViewPath: fallback.path })
            }
          }
        }
      }
    }
    assert.equal(reviewed.size, sourceGoals.size, `Incomplete source decision coverage: ${mappingPath}`)
  }
  assert.equal(unresolved.length, config.expectedUnresolvedScopeDecisionCount, 'Source-scope uncertainty changed; inspect rather than guess')
  assert.deepEqual(sorted(usedSnapshots), sorted(snapshots.keys()), 'Unused source document snapshot')
  const outputs: Record<string, string> = {}
  const put = (path: string, value: unknown) => {
    const bookRelative = relative(resolve(repoRoot, BOOK_ROOT), local(repoRoot, path))
    assert.ok(bookRelative && bookRelative !== '..' && !bookRelative.startsWith('../') && !isAbsolute(bookRelative), `Generated atlas inputs must remain book-local: ${path}`)
    assert.ok(!bindings.has(path), `Output would overwrite an input: ${path}`)
    outputs[path] = serialize(value)
  }
  const union = new Set<string>()
  const scopes = [...scopeWitnesses.entries()].sort(([a], [b]) => compare(a, b)).map(([key, witnesses]) => {
    const [jurisdiction, stage, courseProfile] = key.split('/')
    const goalIds = sorted(witnesses.map(w => w.goalId))
    goalIds.forEach(id => union.add(id))
    const viewId = `${config.bookId}-source-${jurisdiction.toLowerCase()}-${stage.toLowerCase()}${courseProfile ? `-${courseProfile.toLowerCase()}` : ''}`
    const path = `${config.outputDirectory}/${viewId}.view.json`
    const view = { viewFormatVersion: '1.0', viewId, landscapeId, language: 'de-DE', title: `${config.subject} – ${jurisdiction}, ${stage}${courseProfile ? ` ${courseProfile}` : ''}`, scope: { schoolForm: 'Gymnasium', jurisdiction, stage, ...(courseProfile ? { courseProfile } : {}) }, rootNodes: [{ kind: 'structure', id: `${viewId}-root`, label: config.subject, children: goalIds.map(goalId => ({ kind: 'goalEntry', goalId })) }] }
    assert.deepEqual(compileCompositionView(normalizeCompositionView(view), landscape).findings.filter(f => f.severity === 'error'), [])
    put(path, view)
    return { key, path, viewId, jurisdiction, stage, durationModel: null, courseProfile: (courseProfile || null) as 'GK' | 'LK' | null, goalIds, witnesses }
  })
  for (const jurisdiction of config.expectedJurisdictions) assert.ok(scopes.some(s => s.jurisdiction === jurisdiction && s.stage === 'SekI'), `Missing SekI source coverage: ${jurisdiction}`)
  assert.equal(union.size, config.expectedCurricularAtomicGoalCount, 'Source-supported atlas goal count changed')
  parseSubjectDurationModelPolicy(durationPolicy, config.subject, config.expectedJurisdictions, scopes)

  // The canonical contains tree owns navigation, not source applicability. The
  // first canonical path owns a repeated leaf; only actual source-union atoms appear.
  const placed = new Set<string>()
  const visiting = new Set<string>()
  const navigationNode = (rawId: string): Row[] => {
    const id = rawId.replace(`${landscapeId}:`, '')
    assert.ok(!visiting.has(id), `Canonical contains cycle: ${id}`)
    const goal = goals.get(id)
    assert.ok(goal, `Unknown contains goal: ${id}`)
    if (union.has(id)) {
      if (placed.has(id)) return []
      placed.add(id)
      return [{ kind: 'goalEntry', goalId: id }]
    }
    visiting.add(id)
    const children = strings(goal.contains).flatMap(navigationNode)
    visiting.delete(id)
    return children.length ? [{ kind: 'structure', id: `canonical-goal-${id}`, label: str(goal.title), children }] : []
  }
  const rootIds = sorted([...goals.keys()].filter(id => ![...goals.values()].some(g => strings(g.contains).some(child => child.replace(`${landscapeId}:`, '') === id))))
  const rootNodes = rootIds.flatMap(navigationNode)
  assert.deepEqual(sorted(placed), sorted(union), 'Canonical navigation does not cover exactly the source-supported union')
  const navigation = { viewFormatVersion: '1.0', viewId: config.navigationViewId, landscapeId, language: 'de-DE', title: `Kanonische Gliederung ${config.subject} – Gymnasium bundesweit`, scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE', stage: 'CrossStage' }, rootNodes }
  assert.deepEqual(compileCompositionView(normalizeCompositionView(navigation), landscape).findings.filter(f => f.severity === 'error'), [])
  put(config.navigationViewPath, navigation)
  put(config.manifestPath, { schemaVersion: 2, manifestId: config.navigationViewId, landscapeId, navigationOwnership: 'canonical-composition-view-v1', navigationViewPath: config.navigationViewPath, expectedJurisdictions: config.expectedJurisdictions, durationModelPolicyPath: config.durationModelPolicyPath, expectedCurricularAtomicGoalCount: union.size, sourcePaths: scopes.map(s => s.path) })
  const omittedGoals = sorted([...atoms].filter(id => !union.has(id))).map(goalId => ({ goalId, reason: !mappedAtoms.has(goalId) ? 'no-reviewed-mapped-source-witness' : unresolvedAtoms.has(goalId) ? 'unresolved-source-scope' : 'no-resolved-source-scope' }))
  const receipt = { schemaVersion: 1, bookId: config.bookId, derivation: 'reviewed-source-mapping-book-local-atlas-v1', claims: { newSourceReview: false, newSemanticAtomicityReview: false, humanApproval: false, canonicalPhaseUsedForScope: false, inheritedCoverageIsDirectSourceEvidence: false, authoredProfileWitnessIsSourceMetadata: false }, configSha256: digest(serialize(config)), inputBindings: [...bindings.entries()].sort(([a], [b]) => compare(a, b)).map(([path, sha256]) => ({ path, sha256 })), outputBindings: Object.entries(outputs).sort(([a], [b]) => compare(a, b)).map(([path, bytes]) => ({ path, sha256: digest(bytes) })), counts: { canonicalCurricularAtomicGoals: atoms.size, publishedCurricularAtomicGoals: union.size, sourceViews: scopes.length, unresolvedSourceScopeDecisions: unresolved.length, omittedGoals: omittedGoals.length }, omittedGoals, unresolvedSourceScopes: unresolved, scopes }
  const receiptPath = `${config.outputDirectory}/source-projection.receipt.json`
  put(receiptPath, compactGoalBookSourceAtlasReceipt(receipt))
  outputs[receiptPath] = `${JSON.stringify(JSON.parse(outputs[receiptPath]))}\n`
  return { outputs, receipt }
}

export const readGoalBookSourceAtlasInputConfig = (configPath: string, repoRoot = REPO_ROOT): GoalBookSourceAtlasInputConfig => JSON.parse(readFileSync(local(repoRoot, configPath), 'utf8')) as GoalBookSourceAtlasInputConfig

export const checkGoalBookSourceAtlasInputs = (configPath: string, repoRoot = REPO_ROOT) => {
  const config = readGoalBookSourceAtlasInputConfig(configPath, repoRoot)
  const result = buildGoalBookSourceAtlasInputs(config, repoRoot)
  for (const [path, expected] of Object.entries(result.outputs)) {
    assert.ok(existsSync(local(repoRoot, path)), `Missing generated atlas input: ${path}`)
    assert.equal(readFileSync(local(repoRoot, path), 'utf8'), expected, `Stale generated atlas input: ${path}`)
  }
  const expectedNames = sorted(Object.keys(result.outputs).filter(p => dirname(p) === config.outputDirectory).map(p => p.slice(config.outputDirectory.length + 1)))
  assert.deepEqual(readdirSync(local(repoRoot, config.outputDirectory)).sort(compare), expectedNames, 'Unexpected/stale atlas source projection files')
  return result
}
