// SPDX-License-Identifier: Apache-2.0
// Current graph validation only. Historical review-binding values are not inputs.
import { auditTransitiveMinimality, type AuditLandscape } from './auditTransitiveMinimality'
import { fingerprintCurrentCurriculumDocument, requireCurrentCatalogInventory, type CurrentCatalogEntry, type CurrentCatalogSource } from './currentCurriculumCatalog'

export type { CurrentCatalogEntry } from './currentCurriculumCatalog'
export type GraphIntegrityRule = {
  id: 'CQR-001'
  status: 'pass' | 'fail'
  summary: string
  metrics: Record<string, number>
  details?: string[]
}
function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Current curriculum catalog: ${message}`)
}

/** Shared producer seam: absence or incomplete coverage aborts before status rows. */
export function requireCompleteCurrentCatalog(
  loaded: CurrentCatalogEntry[],
  expected: readonly CurrentCatalogSource[] | undefined,
): AuditLandscape[] {
  requireCurrentCatalogInventory(expected)
  const declared = new Map<string, CurrentCatalogSource>(), owners = new Set<string>()
  for (const source of expected) {
    ensure(source.path.length > 0 && source.landscapeId.length > 0, 'invalid verified path/owner')
    ensure(!declared.has(source.path) && !owners.has(source.landscapeId), 'duplicate current path/owner')
    declared.set(source.path, source); owners.add(source.landscapeId)
  }
  ensure(Array.isArray(loaded) && loaded.length === declared.size, 'missing or additional canonical source')
  const paths = new Set<string>(), roots = new Set<string>()
  for (const { path, landscape } of loaded) {
    ensure(!paths.has(path), `duplicate canonical path ${path}`)
    paths.add(path)
    const source = declared.get(path)
    ensure(source && landscape && typeof landscape.landscapeId === 'string' && source.landscapeId === landscape.landscapeId,
      `undeclared canonical path/owner ${path}:${landscape?.landscapeId}`)
    ensure(!roots.has(landscape.landscapeId), `duplicate canonical root ${landscape.landscapeId}`)
    roots.add(landscape.landscapeId)
    ensure(Array.isArray(landscape.goals) && landscape.goals.length > 0, `empty or invalid canonical root ${landscape.landscapeId}`)
    // Hash the unchanged full raw producer object, never a goals-only projection.
    ensure(fingerprintCurrentCurriculumDocument(landscape) === source.currentDocumentDigest,
      `current document digest differs: ${path}`)
  }
  ensure(paths.size === declared.size && roots.size === owners.size, 'incomplete canonical path/owner coverage')
  return loaded.map(({ landscape }) => landscape)
}

/** Thin CQR adapter over the genuine auditor and its existing selected closure. */
export function evaluateGraphIntegrity(catalog: AuditLandscape[], rootLandscapeId: string): GraphIntegrityRule {
  try {
    const audit = auditTransitiveMinimality(catalog, [rootLandscapeId])
    const issues = audit.findings.length + audit.atomicNormalFormFindings.length + audit.explicitTypeMismatchFindings.length
    const details = [
      ...audit.findings.map(({ source, prerequisite, witness, supportingOrigins }) =>
        `Redundant ${source} -> ${prerequisite}; witness ${witness.join(' -> ')}; authored origins ${supportingOrigins.map((origin) => `${origin.source} -> ${origin.prerequisite}`).join('; ')}`),
      ...audit.atomicNormalFormFindings.map(({ source, prerequisite, sourceAtomic, prerequisiteAtomic }) =>
        `Non-atomic requires ${source} -> ${prerequisite}; source=${sourceAtomic ? 'atomic' : 'cluster'}; prerequisite=${prerequisiteAtomic ? 'atomic' : 'cluster'}`),
      ...audit.explicitTypeMismatchFindings.map(({ goal, declaredType, structuralType }) =>
        `Explicit type mismatch ${goal}; declared=${JSON.stringify(declaredType)}; structural=${structuralType}`),
    ]
    return {
      id: 'CQR-001', status: issues ? 'fail' : 'pass',
      summary: issues ? `${issues} current graph integrity issue(s).` : 'Current graph references, DAGs, atomic requires normal form and transitive minimality pass.',
      metrics: {
        goals: audit.nodeCount, authoredRequires: audit.authoredRequiresCount, effectiveRequires: audit.effectiveRequiresCount,
        crossLandscapeReferences: audit.crossLandscapeReferenceCount, minimalityFindings: audit.findings.length,
        atomicNormalFormFindings: audit.atomicNormalFormFindings.length, explicitTypeMismatches: audit.explicitTypeMismatchFindings.length,
        witnessEdges: audit.findings.reduce((count, finding) => count + finding.witness.length - 1, 0), invalidInputs: 0,
      },
      ...(details.length ? { details: details.slice(0, 20) } : {}),
    }
  } catch (error) {
    return { id: 'CQR-001', status: 'fail', summary: `Invalid current graph for ${rootLandscapeId}.`,
      metrics: { invalidInputs: 1 }, details: [error instanceof Error ? error.message : String(error)] }
  }
}
