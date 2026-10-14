import assert from 'node:assert/strict'
import { buildCrossLandscapeGraph, findCrossLandscapeCycles, type GraphLandscape } from './lib/crossLandscapeGraph'

const landscape = (landscapeId: string, goals: GraphLandscape['goals']): GraphLandscape =>
  ({ landscapeId, goals, file: `${landscapeId}.json` })

const crossCycle = buildCrossLandscapeGraph([
  landscape('math', [{ id: 'm', requires: ['physics:p'] }]),
  landscape('physics', [{ id: 'p', requires: ['m'] }]),
])
assert.equal(crossCycle.diagnostics.length, 0)
assert(findCrossLandscapeCycles(crossCycle).some(issue => issue.relation === 'requires'
  && issue.message.includes('math:m') && issue.message.includes('physics:p')))

const inheritedCycle = buildCrossLandscapeGraph([
  landscape('math', [{ id: 'root', contains: ['m'], requires: ['physics:p'] }, { id: 'm' }]),
  landscape('physics', [{ id: 'p', requires: ['math:m'] }]),
])
assert(!findCrossLandscapeCycles(inheritedCycle).some(issue => issue.relation === 'requires'))
assert(findCrossLandscapeCycles(inheritedCycle).some(issue => issue.relation === 'effective requires'
  && issue.message.includes('inherited from math:root')))

const references = buildCrossLandscapeGraph([
  landscape('math', [{ id: 'm', requires: ['p', 'physics:absent', 'absent:p', 'unknown'] }]),
  landscape('physics', [{ id: 'p' }]),
])
assert.deepEqual(references.directRequires.get('math:m'), ['physics:p'])
assert.equal(references.diagnostics.filter(issue => issue.code === 'missing_reference').length, 3)

const ambiguous = buildCrossLandscapeGraph([
  landscape('root', [{ id: 'start', requires: ['shared'] }]),
  landscape('one', [{ id: 'shared' }]),
  landscape('two', [{ id: 'shared', requires: ['local'] }, { id: 'local' }]),
])
assert(ambiguous.diagnostics.some(issue => issue.code === 'ambiguous_reference'))
assert.equal(ambiguous.resolveReference('one:shared', 'root')?.key, 'one:shared')
assert.equal(ambiguous.resolveReference('shared', 'two')?.key, 'two:shared')

const duplicates = buildCrossLandscapeGraph([
  landscape('one', [{ id: 'shared' }]), landscape('two', [{ id: 'shared' }]),
  landscape('root', [{ id: 'start', requires: ['shared'] }]),
])
assert.equal(duplicates.diagnostics.length, 0)
assert.equal(duplicates.directRequires.get('root:start')?.length, 1)

const crossContains = buildCrossLandscapeGraph([
  landscape('one', [{ id: 'root', contains: ['two:root'] }]),
  landscape('two', [{ id: 'root', contains: ['one:root'] }]),
])
assert(findCrossLandscapeCycles(crossContains).some(issue => issue.relation === 'contains'))

// Mastery never follows requires transitively: both declared prerequisites stay.
const noReduction = buildCrossLandscapeGraph([
  landscape('one', [{ id: 'a', requires: ['b', 'c'] }, { id: 'b', requires: ['c'] }, { id: 'c' }]),
])
assert.deepEqual(noReduction.effectiveRequires.get('one:a'), ['one:b', 'one:c'])
const noTransitiveInference = buildCrossLandscapeGraph([
  landscape('physics', [{ id: 'p2', requires: ['p1'] }, { id: 'p1', requires: ['math:m'] }]),
  landscape('math', [{ id: 'm' }]),
])
assert.deepEqual(noTransitiveInference.effectiveRequires.get('physics:p2'), ['physics:p1'])
assert.deepEqual(noTransitiveInference.effectiveRequires.get('physics:p1'), ['math:m'])

const compatibilitySelfExclusion = buildCrossLandscapeGraph([
  landscape('one', [{ id: 'root', requires: ['first'], contains: ['first'] },
    { id: 'first', contains: ['nested'] }, { id: 'nested' }]),
])
assert.deepEqual(compatibilitySelfExclusion.effectiveRequires.get('one:first'), [])
assert.deepEqual(compatibilitySelfExclusion.effectiveRequires.get('one:nested'), [])
assert.equal(findCrossLandscapeCycles(compatibilitySelfExclusion).length, 0)
console.log('Cross-landscape graph tests passed (cycles, inheritance, references, duplicate owners, directional prerequisites).')
