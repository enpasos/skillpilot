// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { loadGraphValidationLandscapes } from './lib/graphValidationInventory'
import { evaluateGraphIntegrity } from './curriculumGraphIntegrity'

const retiredLandscapeIds = new Set([
  '3e56aa75-c76c-4de5-883b-0aac98297846', '2f391ba2-ba1e-40e4-a8d2-dff049516c13',
  '7651cbe2-5fb8-464d-b0c4-3e830cda41dd', 'f1ba2118-853f-4aa0-bef5-4f749bc621ed',
  'bc2124fa-2974-46cc-85e7-2392e61250e1', '30acd190-609c-4109-8ee7-06fc5594af19',
  'bdc89685-73d3-446c-af5a-eaf642c07463', 'c7209caa-18e5-4dd8-b68f-dd86e228d045',
  'c1a02ddd-736d-4975-920b-18b03aff147f', 'fe28bda8-03f3-4c4a-8286-7fcfce4eeac1',
  '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3', 'a8c23058-6998-49f2-9f3b-a85e951d5ab0',
  '24f2ca0f-b94a-444e-bb70-677cb6f85c02', '1d0e9f8f-0087-49e4-8ea2-976e5a89b165',
  '936efc61-a4d5-49fd-8694-085d1347db80', 'a334a745-1d67-4e1d-86a5-dadc04f144d2',
  'bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da',
])
test('retired Hessen rules have no loaded landscape scope (QA snapshots excluded)', () => {
  const current = loadGraphValidationLandscapes(resolve(dirname(fileURLToPath(import.meta.url)), '../../curricula'))
  assert.ok(current.length > 0)
  assert.deepEqual(current.filter(({ landscape }) => retiredLandscapeIds.has(landscape.landscapeId ?? (landscape as { id?: string }).id!)).map(({ file }) => file), [])
})
test('CQR-001 replaces direct-child GVR-006 and cluster-target GVR-013', () => {
  for (const goals of [
    [{ id: 'cluster', contains: ['atom'], requires: ['atom'] }, { id: 'atom' }],
    [{ id: 'cluster', contains: ['atom'] }, { id: 'atom' }, { id: 'source', requires: ['cluster'] }],
  ]) {
    const rule = evaluateGraphIntegrity([{ landscapeId: 'L', goals }], 'L')
    assert.equal(rule.status, 'fail')
    assert.ok(rule.metrics.atomicNormalFormFindings === 1 || rule.details?.some(detail => detail.includes('effective requires cycle')))
  }
})
