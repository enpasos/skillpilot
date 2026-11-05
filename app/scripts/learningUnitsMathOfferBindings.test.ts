import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { nativeOfferScope, physicalViewIds, prepareOfferBindings } from './learningUnitsMathOfferBindings'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const nativeIndex = process.argv.indexOf('--native')
const raw = nativeIndex < 0 ? undefined : read(process.argv[nativeIndex + 1])
const all = nativeOfferScope({ scopeId: 'ALL/SekI//', requestedCompositionScope: { schoolForm: 'Gymnasium', stage: 'SekI' },
  personalCurriculum: { 'a0e13c56-c25f-4742-9272-3a1a603ee52e': { filterId: 'ALL' } } })
assert.equal(all.jurisdiction, 'ALL'); assert.equal(all.courseProfile, null); assert.equal(all.durationModel, null)
const combined = nativeOfferScope({ scopeId: 'DE-HE/SekII/G9/GK+LK', requestedCompositionScope: {
  schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII', courseProfile: 'GK+LK', durationModel: 'G9' } })
assert.equal(combined.courseProfile, 'GK+LK'); assert.equal(combined.durationModel, 'G9')
assert.throws(() => nativeOfferScope({ scopeId: 'x', requestedCompositionScope: {} }), /Unresolved native stage/)
assert.throws(() => physicalViewIds(['merged:two'], {}), /lost its physical provenance/)
assert.deepEqual(physicalViewIds(['merged:two'], { 'merged:two': { mergedFromViewIds: ['physical-b', 'physical-a'] } }), ['physical-a', 'physical-b'])
if (raw) {
const config = read('app/scripts/config/learning-units/math-current-offer-roots.json')
const catalog = read('curricula/DE/Gymnasium/learning-units/catalog.json')
const prepared = prepareOfferBindings(raw, config, catalog)
assert.equal(prepared.binder.offers.length, 182)
assert.equal(prepared.binder.offers.filter(row => row.rootContractRefs.length === 0).length, 123)
assert.ok(prepared.binder.offers.every(row => row.coverage === 'partial'))
assert.equal(prepared.binder.offers.filter(row => row.rootContractRefs.some((ref: any) => ref.contractId === 'math-dot-product-projection')).length, 42)
assert.equal(prepared.binder.offers.filter(row => row.rootContractRefs.some((ref: any) => ref.contractId === 'math-right-prisms-volume-surface')).length, 27)
const duplicate = structuredClone(config); duplicate.rootSelections.push(config.rootSelections[0])
assert.throws(() => prepareOfferBindings(raw, duplicate, catalog), /Duplicate child acquisition path/)
const wrongScope = structuredClone(config); wrongScope.rootSelections[0].scopeIds.push('ALL/SekI//')
assert.throws(() => prepareOfferBindings(raw, wrongScope, catalog), /outside actual native target/)
const sourceRoots = prepared.binder.offers.find(row => row.scope.jurisdiction === 'ALL' && row.scope.stage === 'SekII')!
assert.equal(sourceRoots.rootContractRefs.length, 0, 'A coincidental global target subset must never add an unselected contract')
assert.ok(Object.keys(prepared.binder.inputs).every(path => !path.includes('/input/') && !path.endsWith('.review.json')), 'Unconsumed extraction trees remain proof-only')
assert.ok(prepared.binder.offers.every(row => row.inputPaths.every(path => prepared.binder.inputs[path])), 'Rows bind exact runtime inputs')
console.log('Current offers: exact182keys, static42/27roots and123empty partial rows; ALL/null/GK+LK preserved; merged native provenance used; duplicate owner/wrong scope rejected; no subset-root inference')
} else console.log('Scope/provenance unit checks passed; actual182 integration requires --native <fresh-native.json> and was not executed by this command')
