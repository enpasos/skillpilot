import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { buildCrossLandscapeGraph, type GraphGoal, type GraphLandscape } from './crossLandscapeGraph'

export interface InventoryGoal extends GraphGoal { [key: string]: unknown }
export interface InventoryLandscape extends GraphLandscape<InventoryGoal> { title: string; subject?: string }
export interface InventoryFamily {
  familyId: string
  manifestRootIds: string[]
  paths: string[]
  semanticLedgers?: string[]
  scopeRootGoalIds?: string[]
  reviewSelection: 'curricularAtomic' | 'technicalLeavesUnclassified'
  compatibilityStatus?: string
}
export interface InventoryConfig {
  schemaVersion: 1
  inventoryId: string
  excludedDirectories: string[]
  discoverySubjectNames?: string[]
  /** Repository directories whose active subject files must be registered.
   * This limits review discovery only; global reference validation stays global. */
  discoveryScopeRoots?: string[]
  families: InventoryFamily[]
}
export interface ReviewInput {
  semanticSha256: string
  prerequisitesSha256: string
  scopeSha256: string
}
export interface SourceRef {
  path: string
  recordId?: string
  locator?: string
  supports: 'goalSemantics' | 'scope' | 'prerequisite'
}
export const decisionStates = ['pending', 'add', 'retain', 'remove', 'replace', 'no_cross_subject_required',
  'granularity_gap', 'scope_gap', 'source_gap', 'review_required'] as const
export interface RequiresDecision {
  decisionId: string
  familyId: string
  dependentGoalId: string
  prerequisiteGoalIds: string[]
  decision: typeof decisionStates[number]
  rationale: string
  evidenceKind: 'didacticSequencing' | 'directSourceStatement'
  sourceRefs: SourceRef[]
  applicability: {
    universality: 'allDependentScopes' | 'boundedScopes' | 'unresolved'
    scopes: unknown[]
    alternatives: unknown[]
  }
  author: string
  reviewInput: ReviewInput
  proposalBinding?: {
    baseline: ReviewInput
    proposed: ReviewInput
    baselineRequires: string[]
    proposedRequires: string[]
    changesSha256: string
    prerequisiteInputs: Array<{ goalId: string; semanticSha256: string; scopeSha256: string }>
  }
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value)
    .filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
export const fingerprint = (value: unknown) => `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`
export const bytesFingerprint = (bytes: Uint8Array | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
export const fileFingerprint = (path: string) => bytesFingerprint(readFileSync(path))

/** Bind the exact persisted bytes only after verifying their current graph snapshot. */
export function assertFreshRequiresInventory(inventory: unknown, path: string): string {
  if (!existsSync(path)) throw new Error(`Baseline inventory is missing: ${path}`)
  const bytes = readFileSync(path)
  if (stableJson(JSON.parse(bytes.toString('utf8'))) !== stableJson(inventory)) {
    throw new Error('Baseline inventory is stale. Regenerate and review it before preparing a proposal.')
  }
  return bytesFingerprint(bytes)
}

/** A desired set is complete for the foreign subject, including legacy cluster
 * edges. Internal edges stay byte-identical; existing qualified refs stay when
 * their target is retained. No requires-transitive reduction is performed. */
export function proposeCompleteForeignRequires(originalRequires: string[], desiredGoalIds: string[],
  foreignGoalIds: Set<string>): string[] {
  const targetId = (reference: string) => reference.split(':').at(-1)!
  const internal = originalRequires.filter(reference => !foreignGoalIds.has(targetId(reference)))
  const foreign = desiredGoalIds.map(id => originalRequires.find(reference => targetId(reference) === id) ?? id)
  return [...internal, ...foreign]
}

export function collectJsonFiles(directory: string, excludedDirectories: string[]): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (!excludedDirectories.includes(entry.name)) files.push(...collectJsonFiles(path, excludedDirectories))
    } else if (entry.name.endsWith('.json')) files.push(path)
  }
  return files
}

export function readActiveLandscapes(repoRoot: string, config: InventoryConfig): InventoryLandscape[] {
  return collectJsonFiles(join(repoRoot, 'curricula'), config.excludedDirectories).flatMap(path => {
    const document = JSON.parse(readFileSync(path, 'utf8'))
    const landscapeId = document.landscapeId ?? document.id
    if (typeof landscapeId !== 'string' || !Array.isArray(document.goals)) return []
    return [{ landscapeId, file: relative(repoRoot, path), title: document.title ?? '', subject: document.subject, goals: document.goals }]
  })
}

const semanticPayload = (goal: InventoryGoal, semanticKind: string | null) => ({
  id: goal.id, title: goal.title, titleEn: goal.titleEn, description: goal.description,
  descriptionEn: goal.descriptionEn, semanticKind, type: goal.type, nodeKind: goal.nodeKind,
  dimensionTags: goal.dimensionTags, tags: goal.tags, core: goal.core, level: goal.level,
  examData: goal.examData, contains: goal.contains ?? [],
})

export function buildRequiresInventory(repoRoot: string, config: InventoryConfig,
  goalOverrides?: Map<string, InventoryGoal>) {
  const landscapes = readActiveLandscapes(repoRoot, config)
  // Retained definitions resolve live references but are never active nominees.
  // Match proposal/validateGraph closure across every school and university scope.
  const graphLandscapes = readActiveLandscapes(repoRoot, { ...config, excludedDirectories: ['quality'] })
  if (goalOverrides) for (const landscape of [...landscapes, ...graphLandscapes]) landscape.goals = landscape.goals.map(goal =>
    goalOverrides.get(`${landscape.file}:${goal.id}`) ?? goal)
  const graph = buildCrossLandscapeGraph(graphLandscapes)
  const allOccurrencesById = new Map<string, Array<InventoryLandscape & { goal: InventoryGoal; key: string }>>()
  for (const landscape of landscapes) for (const goal of landscape.goals) {
    const occurrences = allOccurrencesById.get(goal.id) ?? []
    occurrences.push({ ...landscape, goal, key: `${landscape.landscapeId}:${goal.id}` })
    allOccurrencesById.set(goal.id, occurrences)
  }
  const prerequisiteOriginSets: Record<string, unknown> = {}
  const effectivePrerequisiteSets: Record<string, unknown> = {}
  const prerequisiteOriginTable: unknown[] = []
  const originIndexByJson = new Map<string, number>()
  const sourceBindingFileSets: Record<string, unknown> = {}
  const manifestPath = 'curricula/curriculum_manifest.json'
  const manifest = JSON.parse(readFileSync(join(repoRoot, manifestPath), 'utf8'))
  const manifestIds = new Set<string>(manifest.curricula.map((row: { id: string }) => row.id))
  const semanticKinds = new Map<string, { kind: string; path: string; sourceFingerprint: string }>()
  for (const family of config.families) {
    for (const path of family.semanticLedgers ?? []) {
      const ledger = JSON.parse(readFileSync(join(repoRoot, path), 'utf8'))
      for (const decision of ledger.decisions ?? []) {
        if (decision.decisionStatus === 'authoritative') semanticKinds.set(`${ledger.sourceLandscapeId}:${decision.goalId}`,
          { kind: decision.semanticKind, path, sourceFingerprint: decision.sourceFingerprint })
      }
    }
  }
  const provenancePath = 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json'
  const provenance = existsSync(join(repoRoot, provenancePath))
    ? JSON.parse(readFileSync(join(repoRoot, provenancePath), 'utf8')) : { landscapes: [] }
  const provenanceById = new Map<string, unknown>()
  for (const landscape of provenance.landscapes ?? []) for (const [goalId, value] of Object.entries(landscape.goalProvenance ?? {})) {
    provenanceById.set(`${landscape.landscapeId}:${goalId}`, value)
  }
  const mappingById = new Map<string, Array<Record<string, unknown>>>()
  const mappingRoot = join(repoRoot, 'curricula/DE/Gymnasium/mapping')
  if (existsSync(mappingRoot)) for (const path of collectJsonFiles(mappingRoot, [])) {
    const document = JSON.parse(readFileSync(path, 'utf8'))
    for (const mapping of document.mappings ?? []) {
      if (!mapping.canonicalGoalId) continue
      const key = `${document.targetLandscapeId}:${mapping.canonicalGoalId}`
      const refs = mappingById.get(key) ?? []
      refs.push({ path: relative(repoRoot, path), sourceLandscapeId: document.sourceLandscapeId,
        sourceGoalId: mapping.legacyGoalId, reviewDecisionId: mapping.reviewDecisionId,
        sourceExtractionPath: document.sourceExtractionPath, recordSha256: fingerprint(mapping),
        evidenceRole: 'goalMappingNotPrerequisiteStatement' })
      mappingById.set(key, refs)
    }
  }

  const families = config.families.map(family => {
    for (const id of family.manifestRootIds) if (!manifestIds.has(id)) throw new Error(`${family.familyId}: root ${id} absent from manifest`)
    const selectedFiles = new Set<string>()
    for (const path of family.paths) {
      const absolute = resolve(repoRoot, path)
      if (!existsSync(absolute)) throw new Error(`${family.familyId}: missing configured path ${path}`)
      if (statSync(absolute).isDirectory()) for (const file of collectJsonFiles(absolute, config.excludedDirectories)) selectedFiles.add(relative(repoRoot, file))
      else selectedFiles.add(path)
    }
    const selected = landscapes.filter(landscape => selectedFiles.has(landscape.file))
    const scopedKeys = new Set<string>()
    if (family.scopeRootGoalIds?.length) {
      const visit = (key: string) => {
        if (scopedKeys.has(key)) return
        scopedKeys.add(key)
        for (const child of graph.contains.get(key) ?? []) visit(child)
      }
      for (const goalId of family.scopeRootGoalIds) {
        const node = selected.flatMap(landscape => landscape.goals.map(goal => `${landscape.landscapeId}:${goal.id}`))
          .find(key => key.endsWith(`:${goalId}`))
        if (!node) throw new Error(`${family.familyId}: missing scope root ${goalId}`)
        visit(node)
      }
    } else for (const landscape of selected) for (const goal of landscape.goals) scopedKeys.add(`${landscape.landscapeId}:${goal.id}`)
    const grouped = new Map<string, string[]>()
    for (const key of scopedKeys) {
      const node = graph.nodes.get(key)!
      const keys = grouped.get(node.goal.id) ?? []
      keys.push(key)
      grouped.set(node.goal.id, keys)
    }
    const goals = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([goalId, selectedKeys]) => {
      const occurrences = (allOccurrencesById.get(goalId) ?? []).map(node => {
        const authoritative = semanticKinds.get(node.key)
        const kind = authoritative?.kind ?? (typeof node.goal.semanticKind === 'string' ? node.goal.semanticKind : null)
        const sourceBindings = mappingById.get(node.key) ?? []
        const extendedData = node.goal.extendedData && typeof node.goal.extendedData === 'object'
          ? Object.fromEntries(Object.entries(node.goal.extendedData)
            .filter(([field]) => field.startsWith('applicability'))) : {}
        const scope = { applicability: node.goal.applicability ?? null,
          placements: node.goal.placements ?? null, extendedData,
          provenance: provenanceById.get(node.key) ?? null, sourceBindings }
        const sourceBindingFiles = [...new Set(sourceBindings.map(binding => binding.path))].sort()
        const sourceBindingFilesRef = fingerprint(sourceBindingFiles)
        sourceBindingFileSets[sourceBindingFilesRef] = sourceBindingFiles
        const scopeSummary = { applicability: scope.applicability, placements: scope.placements,
          extendedData: scope.extendedData,
          provenanceRef: scope.provenance === null ? null : { path: provenancePath, recordId: node.goal.id,
            locator: `landscapes[landscapeId=${node.landscapeId}].goalProvenance[${node.goal.id}]`,
            recordSha256: fingerprint(scope.provenance) },
          sourceBindingFilesRef,
          sourceBindingRecordCount: sourceBindings.length,
          sourceBindingsSha256: fingerprint(sourceBindings) }
        const effectiveRequires = graph.effectiveRequires.get(node.key) ?? []
        const origins = graph.effectiveOrigins.get(node.key) ?? []
        const originSetId = fingerprint(origins)
        const effectiveSetId = fingerprint(effectiveRequires)
        prerequisiteOriginSets[originSetId] = origins.map(origin => {
          const json = stableJson(origin)
          const prior = originIndexByJson.get(json)
          if (prior !== undefined) return prior
          const index = prerequisiteOriginTable.length
          prerequisiteOriginTable.push(origin)
          originIndexByJson.set(json, index)
          return index
        })
        effectivePrerequisiteSets[effectiveSetId] = effectiveRequires
        return { key: node.key, landscapeId: node.landscapeId, path: node.file,
          selected: selectedKeys.includes(node.key) && selectedFiles.has(node.file), definitionSha256: fingerprint(node.goal),
          semanticKind: kind, semanticKindBasis: authoritative ? { path: authoritative.path,
            sourceFingerprint: authoritative.sourceFingerprint } : kind ? 'authoredField' : 'unclassified',
          technicalRole: (node.goal.contains?.length ?? 0) === 0 ? 'leaf' : 'cluster',
          title: node.goal.title,
          directRequires: node.goal.requires ?? [],
          effectiveRequiresRef: effectiveSetId,
          prerequisiteOriginsRef: originSetId,
          prerequisiteContextStatus: graph.diagnostics.some(diagnostic => diagnostic.nodeKey === node.key
            && diagnostic.code === 'inconsistent_graph_definition') ? 'conflictingDefinition' : 'resolved',
          scope: scopeSummary, sourceRef: node.goal.sourceRef ?? null,
          reviewInput: { semanticSha256: fingerprint(semanticPayload(node.goal, kind)),
            prerequisitesSha256: fingerprint({ directRequires: node.goal.requires ?? [],
              effectiveOrigins: graph.effectiveOrigins.get(node.key) ?? [],
              prerequisiteSemantics: effectiveRequires.map(key => {
                const target = graph.nodes.get(key)!
                const targetKind = semanticKinds.get(key)?.kind
                  ?? (typeof target.goal.semanticKind === 'string' ? target.goal.semanticKind : null)
                return { key, semanticSha256: fingerprint(semanticPayload(target.goal, targetKind)) }
              }) }),
            scopeSha256: fingerprint(scope) } }
      })
      const definitions = new Set(occurrences.map(occurrence => occurrence.definitionSha256))
      const reviewOccurrences = occurrences.filter(occurrence => occurrence.selected && (
        family.reviewSelection === 'curricularAtomic' ? occurrence.semanticKind === 'curricularAtomic'
          : occurrence.technicalRole === 'leaf'))
      return { goalId, reviewRequired: reviewOccurrences.length > 0, reviewStatus: 'pending',
        definitionStatus: definitions.size > 1 ? 'conflictingOccurrences' : 'consistent',
        // Stable IDs are deduplicated, but no conflicting occurrence is picked as owner.
        authoritativeOwner: definitions.size === 1 && occurrences.length === 1 ? occurrences[0].key : null,
        occurrences }
    })
    return { familyId: family.familyId, manifestRootIds: family.manifestRootIds,
      compatibilityStatus: family.compatibilityStatus ?? 'pendingReview',
      reviewSelection: family.reviewSelection, status: 'pending',
      counts: { landscapes: selected.length, stableGoalIds: goals.length,
        technicalLeaves: goals.filter(goal => goal.occurrences.some(occurrence => occurrence.selected && occurrence.technicalRole === 'leaf')).length,
        curricularAtomic: goals.filter(goal => goal.occurrences.some(occurrence => occurrence.selected && occurrence.semanticKind === 'curricularAtomic')).length,
        reviewRequired: goals.filter(goal => goal.reviewRequired).length,
        conflictingOccurrences: goals.filter(goal => goal.definitionStatus === 'conflictingOccurrences').length },
      landscapes: selected.map(landscape => ({ landscapeId: landscape.landscapeId, path: landscape.file,
        title: landscape.title, fileSha256: fileFingerprint(join(repoRoot, landscape.file)) })), goals }
  })
  const registeredFiles = new Set(families.flatMap(family => family.landscapes.map(landscape => landscape.path)))
  const subjectNames = new Set(config.discoverySubjectNames ?? ['mathematik', 'mathematics', 'physik', 'physics'])
  const discoveryScopeRoots = config.discoveryScopeRoots ?? ['curricula']
  if (!discoveryScopeRoots.length) throw new Error('Subject discovery requires at least one scope root')
  const discoveryRoots = discoveryScopeRoots.map(path => {
    const absolute = resolve(repoRoot, path)
    const relativePath = relative(join(repoRoot, 'curricula'), absolute)
    if (relativePath === '..' || relativePath.startsWith('../') || relativePath.split('/').includes('quality')
      || config.excludedDirectories.some(directory => relativePath.split('/').includes(directory))) {
      throw new Error(`Subject discovery root is outside active curricula: ${path}`)
    }
    if (!existsSync(absolute) || !statSync(absolute).isDirectory()) throw new Error(`Missing subject discovery directory: ${path}`)
    return absolute
  })
  const subjectDiscovery = landscapes.filter(landscape => discoveryRoots.some(root => {
    const path = relative(root, resolve(repoRoot, landscape.file))
    return path !== '..' && !path.startsWith('../')
  }) && landscape.subject
    && subjectNames.has(landscape.subject.trim().toLowerCase())).map(landscape => ({
    path: landscape.file, landscapeId: landscape.landscapeId, subject: landscape.subject,
    status: registeredFiles.has(landscape.file) ? 'registered' : 'unregistered',
  }))
  const unregisteredSubjects = subjectDiscovery.filter(subject => subject.status === 'unregistered')
  if (unregisteredSubjects.length) throw new Error(`Unregistered active mathematics/physics subjects: ${unregisteredSubjects.map(subject => subject.path).join(', ')}`)
  return { schemaVersion: 1, inventoryId: config.inventoryId,
    licensing: { tooling: 'Apache-2.0', ownCurricularReviewContent: 'CC-BY-4.0', attribution: 'SkillPilot contributors' },
    semantics: { effectiveRequires: 'recursive-direct-plus-contains-parent-inheritance-with-self-exclusion',
      requiresTransitiveMastery: false, automaticApproval: false,
      sourceBindings: 'Goal mapping/provenance evidence is not a direct prerequisite statement.' },
    manifest: { path: manifestPath, sha256: fileFingerprint(join(repoRoot, manifestPath)), roots: manifest.curricula },
    activeLandscapeFiles: landscapes.length, graphReferenceLandscapeFiles: graphLandscapes.length,
    excludedDirectories: config.excludedDirectories, discoveryScopeRoots,
    activeDefinitionConflicts: [...allOccurrencesById.entries()].filter(([, owners]) =>
      new Set(owners.map(owner => fingerprint(owner.goal))).size > 1)
      .map(([goalId, owners]) => ({ goalId, occurrences: owners.map(owner => ({ key: owner.key,
        path: owner.file, definitionSha256: fingerprint(owner.goal) })) })),
    activeGraphDiagnostics: graph.diagnostics, subjectDiscovery,
    prerequisiteOriginSets, prerequisiteOriginTable, effectivePrerequisiteSets,
    sourceBindingFileSets, families }
}
