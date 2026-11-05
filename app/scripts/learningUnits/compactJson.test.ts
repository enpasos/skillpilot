import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compactScalarArrays } from './compactJson'

const values = { defined: true, optional: undefined, nested: { omitted: undefined, retained: null },
  scalar: [1, undefined, null], objects: [{ absent: undefined, id: 'a' }, undefined, { id: 'b', array: [undefined, { absent: undefined }] }] }
assert.deepEqual(JSON.parse(compactScalarArrays(values)), JSON.parse(JSON.stringify(values)))
assert.ok(!compactScalarArrays(values).includes('undefined'))
assert.throws(() => compactScalarArrays(undefined), /no JSON representation/)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
// Existing fully defined committed artifacts retain their exact formatting and bytes.
for (const path of ['docs/dev/learning-units-mathematics-offering-inventory.json',
  'curricula/DE/Gymnasium/learning-units/authoring/mathematics-queue.json',
  'curricula/DE/Gymnasium/learning-units/offers/math-2026-11-05-v1.json']) {
  const bytes = readFileSync(resolve(root, path), 'utf8')
  assert.equal(`${compactScalarArrays(JSON.parse(bytes))}\n`, bytes, `Defined historical artifact formatting changed ${path}`)
}
console.log('Compact JSON: nested undefined object fields omitted, mixed-array undefined null, strict JSON roundtrip; three existing defined artifacts byte-identical')
