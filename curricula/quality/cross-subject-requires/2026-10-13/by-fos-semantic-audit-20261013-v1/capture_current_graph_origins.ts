// SPDX-License-Identifier: Apache-2.0
// Read-only replay through the repository's graph implementation. No approval.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildCrossLandscapeGraph } from '../../../app/scripts/lib/crossLandscapeGraph'
import { readActiveLandscapes, fingerprint, fileFingerprint } from '../../../app/scripts/lib/crossSubjectRequiresInventory'

const out = 'tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1'
const contextPath = `${out}/full-read-ownership-scope.context.exact.json`
const context = JSON.parse(readFileSync(contextPath, 'utf8'))
const config = JSON.parse(readFileSync('curricula/quality/cross-subject-requires/math-physics.config.json', 'utf8'))
const landscapes = readActiveLandscapes(resolve('.'), config)
const graph = buildCrossLandscapeGraph(landscapes)
const usedKeys = new Set<string>()
const pathsTo = (source: string, target: string, trail: string[] = []): string[][] => {
  if (source === target) return [[source]]
  if (trail.includes(target)) throw new Error('Unexpected contains cycle')
  return (graph.parents.get(target) ?? []).flatMap(parent =>
    pathsTo(source, parent, [...trail, target]).map(path => [...path, target]))
}
const records = context.records.map((row: any) => {
  const key = row.selectedOccurrence.key
  const actualEffective = graph.effectiveRequires.get(key) ?? []
  const actualOrigins = graph.effectiveOrigins.get(key) ?? []
  if (fingerprint(actualEffective) !== row.effectivePrerequisiteSetSha256 ||
    fingerprint(actualOrigins) !== row.prerequisiteOriginsSha256) throw new Error(`Stale effective graph ${key}`)
  if (actualEffective.includes(key)) throw new Error(`Self prerequisite ${key}`)
  const originPaths = actualOrigins.map(origin => {
    const paths = pathsTo(origin.declaredByKey, key)
    if (paths.length === 0) throw new Error(`Origin missing contains path: ${key}`)
    usedKeys.add(origin.prerequisiteKey)
    for (const path of paths) for (const node of path) usedKeys.add(node)
    return { origin, containsInheritancePaths: paths,
      directRequiresDeclarationWitness: {
        declaredByKey: origin.declaredByKey, reference: origin.reference,
        prerequisiteKey: origin.prerequisiteKey,
        referenceActuallyDeclared: graph.nodes.get(origin.declaredByKey)!.goal.requires?.includes(origin.reference) ?? false,
        resolvedByCurrentGraph: graph.resolveReference(origin.reference, graph.nodes.get(origin.declaredByKey)!.landscapeId)?.key,
      } }
  })
  if (originPaths.some((o: any) => !o.directRequiresDeclarationWitness.referenceActuallyDeclared)) throw new Error('Invalid origin')
  // Record the actual ancestor self-declarations which the compatibility graph excludes.
  const selfExclusions = [...graph.ancestors(key)].flatMap(ancestor => {
    const n = graph.nodes.get(ancestor)!
    return (n.goal.requires ?? []).flatMap(reference => {
      const target = graph.resolveReference(reference, n.landscapeId)
      if (target?.goal.id !== row.goalId) return []
      const paths = pathsTo(ancestor, key)
      for (const path of paths) for (const node of path) usedKeys.add(node)
      return [{ declaredByKey: ancestor, reference, resolvedKey: target.key,
        containsInheritancePaths: paths, absentFromEffectivePrerequisites: !actualEffective.includes(target.key) }]
    })
  })
  return { goalId: row.goalId, selectedOccurrenceKey: key, effectivePrerequisites: actualEffective,
    effectiveOriginContainsPaths: originPaths, inheritedSelfExclusionPaths: selfExclusions }
})
const frozenFiles = new Set<string>()
const pathNodes = [...usedKeys].sort().map(key => {
  const actualOccurrences = graph.definitionOccurrences.get(key)!.map(n => {
    frozenFiles.add(n.file)
    return { path: n.file, fileSha256: fileFingerprint(n.file), fullGoal: n.goal, fullGoalSha256: fingerprint(n.goal) }
  })
  return { key, actualOccurrences, authoritativeOwnerChosen: false }
})
const result = { schemaVersion: 1, status: 'inert_current_graph_origin_path_witness',
  contextPath, contextSha256: fileFingerprint(contextPath), graphImplementationPath: 'app/scripts/lib/crossLandscapeGraph.ts',
  graphImplementationSha256: fileFingerprint('app/scripts/lib/crossLandscapeGraph.ts'),
  actualActiveLandscapeCount: landscapes.length, selectedGoalCount: records.length,
  records, pathNodes, frozenInputFiles: [...frozenFiles].sort().map(path => ({path, sha256: fileFingerprint(path)})),
  boundary: 'Actual inventory replay and complete contains paths for every retained origin. The operational graph index is observed, not promoted to authoritative ownership; no runtime or client failure is inferred. No new requires or mastery claim.',
  license: 'Apache-2.0', educationalAnnotationLicense: 'CC-BY-4.0' }
writeFileSync(`${out}/current-effective-requires.full-origin-paths.json`, JSON.stringify(result, null, 2)+'\n', { flag: 'wx' })
console.log(JSON.stringify({ goals: records.length, originPathCount: records.reduce((n: number, r: any) => n+r.effectiveOriginContainsPaths.reduce((m: number,o: any)=>m+o.containsInheritancePaths.length,0),0), pathNodes: pathNodes.length, frozenInputFiles: frozenFiles.size, sha256: fileFingerprint(`${out}/current-effective-requires.full-origin-paths.json`) }))
