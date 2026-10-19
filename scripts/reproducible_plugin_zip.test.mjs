import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createReproduciblePluginZip } from './lib/reproducible_plugin_zip.mjs'

export function readStoredZip(zip) {
  const end = zip.length - 22
  assert.equal(zip.readUInt32LE(end), 0x06054b50)
  assert.equal(zip.readUInt16LE(end + 20), 0)
  const count = zip.readUInt16LE(end + 10)
  let cursor = zip.readUInt32LE(end + 16)
  assert.equal(cursor + zip.readUInt32LE(end + 12), end)
  const members = []
  for (let index = 0; index < count; index += 1) {
    assert.equal(zip.readUInt32LE(cursor), 0x02014b50)
    const size = zip.readUInt32LE(cursor + 24)
    const nameBytes = zip.readUInt16LE(cursor + 28)
    const path = zip.subarray(cursor + 46, cursor + 46 + nameBytes).toString('utf8')
    const offset = zip.readUInt32LE(cursor + 42)
    assert.equal(zip.readUInt32LE(offset), 0x04034b50)
    assert.equal(zip.readUInt16LE(offset + 6), 0x0800)
    assert.equal(zip.readUInt16LE(offset + 8), 0)
    assert.equal(zip.readUInt16LE(offset + 10), 0)
    assert.equal(zip.readUInt16LE(offset + 12), 0x0021)
    assert.equal(zip.readUInt32LE(offset + 14), zip.readUInt32LE(cursor + 16))
    assert.equal(zip.readUInt32LE(offset + 18), size)
    assert.equal(zip.readUInt32LE(offset + 22), size)
    assert.equal(zip.readUInt16LE(offset + 26), nameBytes)
    assert.equal(zip.subarray(offset + 30, offset + 30 + nameBytes).toString('utf8'), path)
    const start = offset + 30 + nameBytes
    members.push({ path, content: zip.subarray(start, start + size), crc: zip.readUInt32LE(cursor + 16), mode: zip.readUInt32LE(cursor + 38) >>> 16 })
    cursor += 46 + nameBytes + zip.readUInt16LE(cursor + 30) + zip.readUInt16LE(cursor + 32)
  }
  assert.equal(cursor, end)
  return members
}

test('ZIP directory, CRC, UTF-8 names and fixed timestamps interoperate and preserve bytes', () => {
  const entries = [{ path: 'skills/übung/SKILL.md', content: Buffer.from('123456789'), mode: 0o755 }, { path: '.codex-plugin/plugin.json', content: Buffer.from('{}\n') }]
  const first = createReproduciblePluginZip(entries)
  assert.ok(first.equals(createReproduciblePluginZip([...entries].reverse())))
  const files = readStoredZip(first)
  assert.deepEqual(files.map(file => file.path), ['.codex-plugin/plugin.json', 'skills/übung/SKILL.md'])
  assert.equal(files[1].crc, 0xcbf43926)
  assert.equal(files[1].mode, 0o100755)
  assert.equal(files[1].content.toString(), '123456789')
  assert.equal(files[0].content.toString(), '{}\n')
})

test('ZIP rejects traversal, ambiguous paths, collisions and unsupported member types', () => {
  for (const path of ['', '../secret', 'a/../secret', '/secret', 'C:/secret', 'a\\secret', ' a', 'a ', 'a//b', './a', 'a/./b', 'a\0b', 'a/\nb', `${'a/'.repeat(20)}b`, 'a'.repeat(241)]) {
    assert.throws(() => createReproduciblePluginZip([{ path, content: Buffer.alloc(0) }]), /ZIP/u)
  }
  for (const pair of [['a', 'A'], ['ü', 'u\u0308'], ['a', 'a/b']]) assert.throws(() => createReproduciblePluginZip(pair.map(path => ({ path, content: Buffer.alloc(0) }))), /ZIP/u)
  assert.throws(() => createReproduciblePluginZip([]), /ZIP/u)
  assert.throws(() => createReproduciblePluginZip([{ path: 'a', content: Buffer.alloc(0), mode: 0o120777 }]), /regular/u)
  assert.throws(() => createReproduciblePluginZip([{ path: 'a', content: 'text' }]), /file bytes/u)
})
