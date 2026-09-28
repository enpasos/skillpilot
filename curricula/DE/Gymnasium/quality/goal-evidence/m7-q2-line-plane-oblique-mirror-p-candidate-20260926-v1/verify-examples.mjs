import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0)
const plus = (a, b) => a.map((value, index) => value + b[index])
const minus = (a, b) => a.map((value, index) => value - b[index])
const times = (scalar, vector) => vector.map((value) => scalar * value)
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const same = (actual, expected) => assert.deepEqual(actual, expected)

const reflect = (point, normal, offset) => {
  const numerator = 2 * (dot(normal, point) - offset)
  const denominator = dot(normal, normal)
  assert.equal(numerator % denominator, 0, 'chosen point has a non-integral image')
  return minus(point, times(numerator / denominator, normal))
}

const checkPair = (point, image, normal, offset) => {
  same(reflect(point, normal, offset), image)
  assert.equal(dot(normal, plus(point, image)), 2 * offset, 'midpoint is outside mirror')
  same(cross(minus(point, image), normal), [0, 0, 0])
}

const lineCrossing = { normal: [1, 1, 0], offset: 2 }
checkPair([3, 1, 0], [1, -1, 0], lineCrossing.normal, lineCrossing.offset)
checkPair([5, 1, 2], [1, -3, 2], lineCrossing.normal, lineCrossing.offset)
same(minus([1, -3, 2], [1, -1, 0]), times(2, [0, -1, 1]))
same(plus([3, 1, 0], times(-2, [1, 0, 1])), [1, 1, -2])
same(reflect([1, 1, -2], lineCrossing.normal, lineCrossing.offset), [1, 1, -2])

const lineParallel = { normal: [1, -1, 1], offset: 1 }
checkPair([2, 0, 2], [0, 2, 0], lineParallel.normal, lineParallel.offset)
checkPair([3, 1, 2], [1, 3, 0], lineParallel.normal, lineParallel.offset)
assert.equal(dot(lineParallel.normal, [1, 1, 0]), 0)
same(minus([1, 3, 0], [0, 2, 0]), [1, 1, 0])

const planeCrossing = { normal: [1, 1, 0], offset: 2 }
const planeCrossingPoints = [
  [[3, 0, 0], [2, -1, 0]],
  [[2, 0, 1], [2, 0, 1]],
  [[3, 1, 0], [1, -1, 0]],
]
for (const [point, image] of planeCrossingPoints) {
  assert.equal(point[0] + point[2], 3)
  assert.equal(image[2] - image[1], 1)
  checkPair(point, image, planeCrossing.normal, planeCrossing.offset)
}
assert.notDeepEqual(cross(
  minus(planeCrossingPoints[1][1], planeCrossingPoints[0][1]),
  minus(planeCrossingPoints[2][1], planeCrossingPoints[0][1]),
), [0, 0, 0])
// A second intersection point confirms the fixed set is a line, not just one fixed sample.
const secondFixedPoint = [1, 1, 2]
assert.equal(secondFixedPoint[0] + secondFixedPoint[2], 3)
assert.equal(dot(planeCrossing.normal, secondFixedPoint), planeCrossing.offset)
assert.equal(secondFixedPoint[2] - secondFixedPoint[1], 1)
same(reflect(secondFixedPoint, planeCrossing.normal, planeCrossing.offset), secondFixedPoint)

const planeParallel = { normal: [1, -1, 1], offset: 1 }
const planeParallelPoints = [
  [[4, 0, 0], [2, 2, -2]],
  [[5, 1, 0], [3, 3, -2]],
  [[4, 1, 1], [2, 3, -1]],
]
for (const [point, image] of planeParallelPoints) {
  assert.equal(dot(planeParallel.normal, point), 4)
  assert.equal(dot(planeParallel.normal, image), -2)
  checkPair(point, image, planeParallel.normal, planeParallel.offset)
}
assert.notDeepEqual(cross(
  minus(planeParallelPoints[1][1], planeParallelPoints[0][1]),
  minus(planeParallelPoints[2][1], planeParallelPoints[0][1]),
), [0, 0, 0])
assert.equal(4 - planeParallel.offset, planeParallel.offset - (-2))

const assets = [
  ['a97c7cce-1343-5d04-926f-4a4f323b3c21', 'e49940b3d327ba539aef28d21ec8db69bab4a7be8761265dbf94e45f6113e34d'],
  ['985d5529-a586-50eb-bd7f-2db2be8906d1', 'cf54e59eaf5edb3a7ac481d4b370906f984053f3416a37dfab8f96fee5f31d32'],
]
for (const [goalId, expectedSha] of assets) {
  const paths = [
    `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.jpg`,
    `app/public/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`,
  ]
  for (const path of paths) {
    const actualSha = createHash('sha256').update(readFileSync(path)).digest('hex')
    assert.equal(actualSha, expectedSha, `${path}: image bytes changed`)
  }
}

console.log('Verified four mirror cases, fixed/intersection and parallel invariants, and exact original/public JPG bytes.')
