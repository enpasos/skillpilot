import assert from 'node:assert/strict'
import test from 'node:test'
import Elk from 'elkjs/lib/elk.bundled.js'
import { learningMapFixture } from '../../../prototypes/learning-map.fixture'
import { complexLearningMapFixture } from '../../../prototypes/learning-map.complex.fixture'
import { computeLearningScopeLayout } from './learningScopeLayoutCore.ts'
import { NODE_HEIGHT, NODE_WIDTH } from './layoutTypes.ts'
import { elkRoutePath } from './edgePath.ts'

const epsilon = 0.001

function verifyGeometry(layout, fixture, scopeId) {
  const ids = fixture.entries[scopeId].children ?? []
  const siblings = new Set(ids)
  assert.deepEqual(Object.keys(layout.positions).sort(), [...ids].sort())
  assert.equal(layout.edges.length, ids.reduce((sum, id) => sum
    + fixture.entries[id].requires.filter(ref => siblings.has(ref)).length, 0))
  const boxes = ids.map(id => ({ id, ...layout.positions[id] }))
  for (const box of boxes) {
    assert.ok(Number.isFinite(box.x) && Number.isFinite(box.y) && box.x >= 0 && box.y >= 0)
    assert.ok(box.x + NODE_WIDTH <= layout.width + epsilon)
    assert.ok(box.y + NODE_HEIGHT <= layout.height + epsilon)
    const ports = layout.ports[box.id]
    assert.equal(new Set(ports.map(port => `${port.x},${port.y}`)).size, ports.length,
      `Coincident ports on ${box.id}`)
  }
  for (let first = 0; first < boxes.length; first++) for (let second = first + 1; second < boxes.length; second++) {
    const a = boxes[first]
    const b = boxes[second]
    assert.ok(a.x + NODE_WIDTH <= b.x + epsilon || b.x + NODE_WIDTH <= a.x + epsilon
      || a.y + NODE_HEIGHT <= b.y + epsilon || b.y + NODE_HEIGHT <= a.y + epsilon,
    `Overlapping nodes ${a.id}, ${b.id}`)
  }
  for (const edge of layout.edges) {
    assert.ok(siblings.has(edge.source) && siblings.has(edge.target))
    assert.ok(edge.points.length >= 2)
    const source = layout.ports[edge.source].find(port => port.id === edge.sourceHandle)
    const target = layout.ports[edge.target].find(port => port.id === edge.targetHandle)
    assert.ok(source && target)
    const start = edge.points[0]
    const end = edge.points[edge.points.length - 1]
    assert.ok(Math.abs(start.x - layout.positions[edge.source].x - source.x) < epsilon)
    assert.ok(Math.abs(start.y - layout.positions[edge.source].y - source.y) < epsilon)
    assert.ok(Math.abs(end.x - layout.positions[edge.target].x - target.x) < epsilon)
    assert.ok(Math.abs(end.y - layout.positions[edge.target].y - target.y) < epsilon)
    for (let index = 1; index < edge.points.length; index++) {
      const a = edge.points[index - 1]
      const b = edge.points[index]
      assert.ok(Number.isFinite(b.x) && Number.isFinite(b.y))
      const horizontal = Math.abs(a.y - b.y) < epsilon
      const vertical = Math.abs(a.x - b.x) < epsilon
      assert.ok(horizontal || vertical, `Non-orthogonal route ${edge.id}`)
      for (const box of boxes) {
        const crosses = horizontal
          ? a.y > box.y + epsilon && a.y < box.y + NODE_HEIGHT - epsilon
            && Math.max(a.x, b.x) > box.x + epsilon && Math.min(a.x, b.x) < box.x + NODE_WIDTH - epsilon
          : a.x > box.x + epsilon && a.x < box.x + NODE_WIDTH - epsilon
            && Math.max(a.y, b.y) > box.y + epsilon && Math.min(a.y, b.y) < box.y + NODE_HEIGHT - epsilon
        assert.ok(!crosses, `${edge.id} crosses node ${box.id}`)
      }
    }
  }
}

for (const direction of ['RIGHT', 'DOWN']) {
  test(`large sibling graph: deterministic ${direction} layout with no card/edge intrusion`, async () => {
    const elk = new Elk()
    // The bundled Node engine uses an in-process fake worker with no terminate().
    const fixture = complexLearningMapFixture
    assert.ok(fixture.entries[fixture.rootId].children.length > 40)
    const start = performance.now()
    const layout = await computeLearningScopeLayout(elk, fixture, fixture.rootId, direction)
    verifyGeometry(layout, fixture, fixture.rootId)
    const reordered = structuredClone(fixture)
    reordered.entries[fixture.rootId].children.reverse()
    for (const entry of Object.values(reordered.entries)) entry.requires.reverse()
    const repeated = await computeLearningScopeLayout(elk, reordered, fixture.rootId, direction)
    assert.deepEqual(repeated, layout)
    console.log(`${direction}: ${Object.keys(layout.positions).length} nodes, ${layout.edges.length} edges, `
      + `${Math.round(layout.width)}×${Math.round(layout.height)}, ${Math.round(performance.now() - start)} ms including repeat`)
  })
}

test('every small scope retains all local edges while excluding outside prerequisites', async () => {
  const elk = new Elk()
  for (const entry of Object.values(learningMapFixture.entries)) {
    if (!entry.children?.length) continue
    const layout = await computeLearningScopeLayout(elk, learningMapFixture, entry.id, 'RIGHT')
    verifyGeometry(layout, learningMapFixture, entry.id)
  }
})

test('rounded paths follow the supplied ELK route instead of re-routing between card centres', () => {
  const points = [{ x: 220, y: 30 }, { x: 250, y: 30 }, { x: 250, y: 120 }, { x: 300, y: 120 }]
  assert.equal(elkRoutePath(points), 'M 220 30 L 246 30 Q 250 30 250 34 L 250 116 Q 250 120 254 120 L 300 120')
  assert.equal(elkRoutePath([]), '')
})
