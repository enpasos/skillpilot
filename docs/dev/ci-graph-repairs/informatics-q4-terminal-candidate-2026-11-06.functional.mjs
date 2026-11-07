// Executable reference for the explicitly defined pure term equations.
import assert from 'node:assert/strict'

export const inc = (x) => x + 1
export const raised = (xs) => xs.length === 0 ? [] : [inc(xs[0]), ...raised(xs.slice(1))]
export const sum = (xs) => xs.length === 0 ? 0 : xs[0] + sum(xs.slice(1))
export const total = (xs) => sum(raised(xs))

const cases = [[], [1, 2], [0], [3, 0, 2]]
for (const input of cases) {
  const before = [...input]
  assert.equal(total(input), input.reduce((s, x) => s + x + 1, 0))
  assert.deepEqual(input, before)
}
assert.deepEqual(raised([1, 2]), [2, 3])
assert.equal(total([1, 2]), 5)
assert.equal(total([]), 0)
console.log(JSON.stringify({ status: 'PASS', runtime: 'Node.js', cases: cases.length, total12: total([1, 2]), totalEmpty: total([]), immutableInputs: true }))
