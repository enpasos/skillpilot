import assert from 'node:assert/strict'
import { hasMath, plainMathText, splitMath } from './mathSegments'

assert.deepEqual(splitMath('Write a system as $Au = b$'), [{ kind: 'text', value: 'Write a system as ' }, { kind: 'math', value: 'Au = b', display: false }])
assert.deepEqual(splitMath('1. Compare *a* and $x$').map(segment => segment.value), ['1. Compare *a* and ', 'x'],
  'text outside a formula stays literal, including list numbers and stars')
assert.deepEqual(splitMath('Use\n$$\nx + y &= 3\n$$\nthen'), [{ kind: 'text', value: 'Use\n' }, { kind: 'math', value: 'x + y &= 3', display: true }, { kind: 'text', value: '\nthen' }])
assert.deepEqual(splitMath('It costs \\$5 and \\$10.'), [{ kind: 'text', value: 'It costs $5 and $10.' }], 'an escaped dollar is a dollar sign')
assert.equal(hasMath('It costs $5 today.'), false, 'a single dollar sign is no formula')
assert.equal(plainMathText('Write a system as $Au = b$'), 'Write a system as Au = b')
assert.equal(plainMathText('The column $(1, 2)^{\\mathsf T}$ and $R_i \\leftarrow R_i - mR_j$'), 'The column (1, 2)ᵀ and R_i ← R_i - mR_j')
assert.equal(plainMathText('Graph of $f(x)=a\\cdot b^x+c$ and $\\frac{1}{2}$'), 'Graph of f(x)=a·b^x+c and 1/2')
assert.equal(plainMathText('It costs $5 today.'), 'It costs $5 today.', 'an unpaired dollar sign stays')
console.log('Math segments passed: literal text around formulas, displays, escaped and unpaired dollar signs, plain forms.')
