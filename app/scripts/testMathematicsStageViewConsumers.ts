// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { PROVISIONAL_STAGE_PLAN_UNITS } from '../src/utils/learnerNavigation/learnerUnitMapPreview'
import type { CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'

const root = resolve(import.meta.dirname, '../..')
const directory = resolve(root, process.argv[2] ?? 'curricula/DE/Gymnasium/composition-views/mathematik')
const identities = new Map(PROVISIONAL_STAGE_PLAN_UNITS.flatMap(stage =>
  stage.viewNodeIds.map(id => [id, stage.key] as const)))
const checkStage = (node: { id: string; label: string }) => {
  const expected = /^Sekundarstufe II\b/u.test(node.label) ? 'sek2'
    : /^Sekundarstufe I\b/u.test(node.label) ? 'sek1' : undefined
  if (expected) assert.equal(identities.get(node.id), expected,
    `The real map consumer does not recognize stage wrapper ${node.id}: ${node.label}`)
}
// The stage key and the authored wrapper ID are different contracts. This was
// invisible to schema validation and caused complete Sek-II contents to sit
// outside the shared stage board while backend S/L stayed correct.
assert.throws(() => checkStage({ id: 'sek2', label: 'Sekundarstufe II' }), /does not recognize/)
let stages = 0
const files = readdirSync(directory).filter(name => name.endsWith('.view.json'))
assert.equal(files.length, 100)
for (const filename of files) {
  const view = JSON.parse(readFileSync(resolve(directory, filename), 'utf8'))
  const visit = (nodes: CompositionViewNode[]) => nodes.forEach(node => {
    if (node.kind !== 'structure') return
    checkStage(node)
    if (/^Sekundarstufe II?\b/u.test(node.label)) stages += 1
    visit(node.children)
  })
  visit(view.rootNodes)
}
console.log(`Mathematics source/consumer stage identity: ${files.length} views, ${stages} stage wrappers PASS`)
