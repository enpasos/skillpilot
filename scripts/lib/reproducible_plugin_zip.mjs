import assert from 'node:assert/strict'

// Stored ZIP members avoid compressor/version differences. Fixed DOS timestamps,
// UTF-8 names, Unix modes and byte ordering make the complete ZIP reproducible.
export function createReproduciblePluginZip(entries) {
  assert.ok(Array.isArray(entries) && entries.length > 0 && entries.length <= 5000, 'ZIP requires 1-5000 files')
  const names = new Set()
  let total = 0
  const sorted = entries.map(entry => {
    const { path, content, mode = 0o644 } = entry
    assert.ok(typeof path === 'string' && path === path.trim() && !/[\\\x00-\x1f\x7f:]/u.test(path), 'Unsafe ZIP member path')
    assert.ok(!path.startsWith('/') && path.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe ZIP member path')
    assert.ok(path.split('/').length <= 20 && Buffer.byteLength(path) <= 240, 'ZIP member path exceeds local safety limits')
    const normalized = path.normalize('NFC').toLowerCase()
    assert.ok(!names.has(normalized), 'ZIP member paths collide after normalization')
    names.add(normalized)
    assert.ok(Buffer.isBuffer(content) && content.length <= 100 * 1024 * 1024, 'ZIP member must be bounded file bytes')
    assert.ok(mode === 0o644 || mode === 0o755, 'ZIP supports only regular 0644/0755 files')
    total += content.length
    return { path, content, mode }
  }).sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)))
  assert.ok(total <= 512 * 1024 * 1024, 'ZIP uncompressed size exceeds 512 MiB')
  for (const path of names) {
    const parts = path.split('/')
    while (parts.length > 1) {
      parts.pop()
      assert.ok(!names.has(parts.join('/')), 'ZIP member path conflicts with a file parent')
    }
  }
  const members = []
  const directory = []
  let offset = 0
  for (const { path, content, mode } of sorted) {
    const name = Buffer.from(path)
    const crc = crc32(content)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(0x0021, 12) // 1980-01-01, 00:00:00
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(content.length, 18)
    local.writeUInt32LE(content.length, 22)
    local.writeUInt16LE(name.length, 26)
    members.push(local, name, content)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(0x0314, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(0x0021, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(content.length, 20)
    central.writeUInt32LE(content.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE(((0o100000 | mode) * 65536) >>> 0, 38)
    central.writeUInt32LE(offset, 42)
    directory.push(central, name)
    offset += local.length + name.length + content.length
  }
  const central = Buffer.concat(directory)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(sorted.length, 8)
  end.writeUInt16LE(sorted.length, 10)
  end.writeUInt32LE(central.length, 12)
  end.writeUInt32LE(offset, 16)
  const zip = Buffer.concat([...members, central, end])
  assert.ok(zip.length <= 100 * 1000 * 1000, 'ZIP exceeds the 100 MB upload limit')
  return zip
}

function crc32(content) {
  let crc = 0xffffffff
  for (const byte of content) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}
