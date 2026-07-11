import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32 } from 'node:zlib'
import {
  createDeterministicZip32,
  type DeterministicZip32Entry,
  toUtcDosDateTime,
} from './deterministicZip32'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const tempParent = resolve(repoRoot, 'tmp')
mkdirSync(tempParent, { recursive: true })
const tempRoot = mkdtempSync(resolve(tempParent, 'deterministic-zip32-self-test.'))

const entryFromBuffer = (packagePath: string, content: Buffer): DeterministicZip32Entry => ({
  packagePath,
  content,
  bytes: content.length,
  sha256: createHash('sha256').update(content).digest('hex'),
  crc32: crc32(content) >>> 0,
})

const entryFromSource = (packagePath: string, sourcePath: string): DeterministicZip32Entry => {
  const content = readFileSync(sourcePath)
  return {
    packagePath,
    sourcePath,
    bytes: content.length,
    sha256: createHash('sha256').update(content).digest('hex'),
    crc32: crc32(content) >>> 0,
  }
}

type ParsedLocal = {
  name: string
  offset: number
  flags: number
  method: number
  dosTime: number
  dosDate: number
  crc32: number
  bytes: number
  extraBytes: number
}

type ParsedCentral = ParsedLocal & {
  versionMadeBy: number
  versionNeeded: number
  commentBytes: number
  diskNumber: number
  internalAttributes: number
  externalAttributes: number
  localOffset: number
}

const parseZip32 = (content: Buffer) => {
  const eocdOffset = content.length - 22
  assert.ok(eocdOffset >= 0, 'ZIP contains an EOCD record')
  assert.equal(content.readUInt32LE(eocdOffset), 0x06054b50, 'EOCD signature')
  assert.equal(content.readUInt16LE(eocdOffset + 4), 0, 'EOCD disk number')
  assert.equal(content.readUInt16LE(eocdOffset + 6), 0, 'EOCD central-directory disk')
  const entryCount = content.readUInt16LE(eocdOffset + 8)
  assert.equal(content.readUInt16LE(eocdOffset + 10), entryCount, 'EOCD entry counts agree')
  const centralSize = content.readUInt32LE(eocdOffset + 12)
  const centralOffset = content.readUInt32LE(eocdOffset + 16)
  assert.equal(content.readUInt16LE(eocdOffset + 20), 0, 'archive comment is empty')
  assert.equal(centralOffset + centralSize, eocdOffset, 'central directory ends immediately before EOCD')

  const locals: ParsedLocal[] = []
  let localOffset = 0
  while (localOffset < centralOffset) {
    assert.equal(content.readUInt32LE(localOffset), 0x04034b50, 'local-file signature')
    const nameBytes = content.readUInt16LE(localOffset + 26)
    const extraBytes = content.readUInt16LE(localOffset + 28)
    const bytes = content.readUInt32LE(localOffset + 22)
    const nameStart = localOffset + 30
    const dataStart = nameStart + nameBytes + extraBytes
    locals.push({
      name: content.subarray(nameStart, nameStart + nameBytes).toString('utf8'),
      offset: localOffset,
      flags: content.readUInt16LE(localOffset + 6),
      method: content.readUInt16LE(localOffset + 8),
      dosTime: content.readUInt16LE(localOffset + 10),
      dosDate: content.readUInt16LE(localOffset + 12),
      crc32: content.readUInt32LE(localOffset + 14),
      bytes,
      extraBytes,
    })
    localOffset = dataStart + bytes
  }
  assert.equal(localOffset, centralOffset, 'local entries end at the declared central offset')

  const central: ParsedCentral[] = []
  let cursor = centralOffset
  while (cursor < eocdOffset) {
    assert.equal(content.readUInt32LE(cursor), 0x02014b50, 'central-file signature')
    const nameBytes = content.readUInt16LE(cursor + 28)
    const extraBytes = content.readUInt16LE(cursor + 30)
    const commentBytes = content.readUInt16LE(cursor + 32)
    const nameStart = cursor + 46
    central.push({
      name: content.subarray(nameStart, nameStart + nameBytes).toString('utf8'),
      offset: cursor,
      versionMadeBy: content.readUInt16LE(cursor + 4),
      versionNeeded: content.readUInt16LE(cursor + 6),
      flags: content.readUInt16LE(cursor + 8),
      method: content.readUInt16LE(cursor + 10),
      dosTime: content.readUInt16LE(cursor + 12),
      dosDate: content.readUInt16LE(cursor + 14),
      crc32: content.readUInt32LE(cursor + 16),
      bytes: content.readUInt32LE(cursor + 24),
      extraBytes,
      commentBytes,
      diskNumber: content.readUInt16LE(cursor + 34),
      internalAttributes: content.readUInt16LE(cursor + 36),
      externalAttributes: content.readUInt32LE(cursor + 38),
      localOffset: content.readUInt32LE(cursor + 42),
    })
    cursor = nameStart + nameBytes + extraBytes + commentBytes
  }
  assert.equal(cursor, eocdOffset, 'central entries end at the EOCD')
  assert.equal(locals.length, entryCount, 'local entry count')
  assert.equal(central.length, entryCount, 'central entry count')
  return { locals, central }
}

const assertNoTemporaryOutput = (outputPath: string) => {
  const temporaryPrefix = `${basename(outputPath)}.tmp-${process.pid}-`
  assert.ok(
    !readdirSync(dirname(outputPath)).some((name) => name.startsWith(temporaryPrefix)),
    'temporary ZIP output was cleaned up',
  )
}

try {
  const sourcePath = resolve(tempRoot, 'source.txt')
  writeFileSync(sourcePath, 'source payload\n')
  const entries = [
    entryFromBuffer('root/z.txt', Buffer.from('last\n', 'utf8')),
    entryFromBuffer('root/ä.txt', Buffer.from('unicode\n', 'utf8')),
    entryFromSource('root/a.txt', sourcePath),
  ]
  const timestamp = new Date('2024-02-03T04:05:07.000Z')
  const expectedDos = toUtcDosDateTime(timestamp)
  assert.deepEqual(expectedDos, {
    dosTime: (4 << 11) | (5 << 5) | 3,
    dosDate: ((2024 - 1980) << 9) | (2 << 5) | 3,
  })

  const firstZip = resolve(tempRoot, 'first.zip')
  const secondZip = resolve(tempRoot, 'second.zip')
  writeFileSync(firstZip, 'old output must be atomically replaced')
  const firstBytes = createDeterministicZip32(entries, timestamp, firstZip)
  const secondBytes = createDeterministicZip32([...entries].reverse(), timestamp, secondZip)
  const firstContent = readFileSync(firstZip)
  const secondContent = readFileSync(secondZip)
  assert.equal(firstBytes, firstContent.length)
  assert.equal(secondBytes, secondContent.length)
  assert.deepEqual(firstContent, secondContent, 'input order cannot affect ZIP bytes')
  assert.equal(firstContent.length, 340, 'legacy ZIP32 fixture byte length stays unchanged')
  assert.equal(
    createHash('sha256').update(firstContent).digest('hex'),
    '933eb6265082eea8fe5399ca2f2bde65d7913952768d7454a698de9a56c1ef12',
    'legacy ZIP32 fixture bytes stay unchanged',
  )
  assertNoTemporaryOutput(firstZip)
  assertNoTemporaryOutput(secondZip)

  const { locals, central } = parseZip32(firstContent)
  const expectedNames = ['root/a.txt', 'root/z.txt', 'root/ä.txt']
  assert.deepEqual(locals.map((entry) => entry.name), expectedNames, 'local paths use code-unit order')
  assert.deepEqual(central.map((entry) => entry.name), expectedNames, 'central paths use code-unit order')
  locals.forEach((entry, index) => {
    const matchingCentral = central[index]
    assert.equal(entry.flags, 0x0800, 'local header sets only the UTF-8 flag')
    assert.equal(matchingCentral.flags, 0x0800, 'central header sets only the UTF-8 flag')
    assert.equal(entry.method, 0, 'local entry uses STORE')
    assert.equal(matchingCentral.method, 0, 'central entry uses STORE')
    assert.equal(entry.dosTime, expectedDos.dosTime, 'fixed UTC DOS time in local header')
    assert.equal(entry.dosDate, expectedDos.dosDate, 'fixed UTC DOS date in local header')
    assert.equal(matchingCentral.dosTime, expectedDos.dosTime, 'fixed UTC DOS time in central header')
    assert.equal(matchingCentral.dosDate, expectedDos.dosDate, 'fixed UTC DOS date in central header')
    assert.equal(entry.extraBytes, 0, 'local extra field is absent')
    assert.equal(matchingCentral.extraBytes, 0, 'central extra field is absent')
    assert.equal(matchingCentral.commentBytes, 0, 'entry comment is absent')
    assert.equal(matchingCentral.versionMadeBy, 20, 'legacy version-made-by bytes stay unchanged')
    assert.equal(matchingCentral.versionNeeded, 20, 'ZIP 2.0 is sufficient')
    assert.equal(matchingCentral.diskNumber, 0, 'entry is on disk zero')
    assert.equal(matchingCentral.internalAttributes, 0, 'internal attributes are empty')
    assert.equal(matchingCentral.externalAttributes, (0o100644 << 16) >>> 0, 'regular-file mode is 0644')
    assert.equal(matchingCentral.localOffset, entry.offset, 'central entry points to its local header')
    assert.equal(matchingCentral.crc32, entry.crc32, 'local and central CRC-32 agree')
    assert.equal(matchingCentral.bytes, entry.bytes, 'local and central sizes agree')
    assert.equal(entry.flags & 0x0008, 0, 'data-descriptor flag is absent')
  })
  assert.equal(firstContent.indexOf(Buffer.from([0x50, 0x4b, 0x06, 0x06])), -1, 'ZIP64 EOCD is absent')
  assert.equal(firstContent.indexOf(Buffer.from([0x50, 0x4b, 0x06, 0x07])), -1, 'ZIP64 locator is absent')
  assert.equal(firstContent.indexOf(Buffer.from([0x50, 0x4b, 0x07, 0x08])), -1, 'data descriptor is absent')

  const preflightOutput = resolve(tempRoot, 'preflight-preserves-existing.zip')
  const oldOutput = Buffer.from('old output survives preflight failure', 'utf8')
  writeFileSync(preflightOutput, oldOutput)
  assert.throws(
    () => createDeterministicZip32(entries, timestamp, preflightOutput, { maxPathBytes: 5 }),
    /path exceeds the 5-byte limit/u,
  )
  assert.deepEqual(readFileSync(preflightOutput), oldOutput)
  assertNoTemporaryOutput(preflightOutput)

  assert.throws(
    () => createDeterministicZip32(entries, timestamp, resolve(tempRoot, 'entry-limit.zip'), { maxEntries: 2 }),
    /entry count exceeds the 2-entry limit/u,
  )
  assert.throws(
    () => createDeterministicZip32(entries, timestamp, resolve(tempRoot, 'entry-size-limit.zip'), { maxEntryBytes: 7 }),
    /entry exceeds the 7-byte size limit/u,
  )
  assert.throws(
    () => createDeterministicZip32(entries, timestamp, resolve(tempRoot, 'total-size-limit.zip'), {
      maxTotalUncompressedBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0) - 1,
    }),
    /uncompressed payload exceeds/u,
  )
  assert.throws(
    () => createDeterministicZip32(entries, timestamp, resolve(tempRoot, 'outer-limit.zip'), {
      maxOuterBytes: firstContent.length - 1,
    }),
    /outer limit/u,
  )
  assert.throws(
    () => createDeterministicZip32(entries, timestamp, resolve(tempRoot, 'invalid-limit.zip'), {
      maxEntries: 0x10000,
    }),
    /maxEntries must be a safe integer/u,
  )
  for (const unsafePath of [
    '/absolute.txt',
    '../escape.txt',
    'root/../escape.txt',
    'root\\escape.txt',
    'root/CON.txt',
    'root/trailing.',
    'root/trailing ',
    'C:/drive.txt',
    'root/alternate:data.txt',
  ]) {
    assert.throws(
      () => createDeterministicZip32(
        [entryFromBuffer(unsafePath, Buffer.from('unsafe\n', 'utf8'))],
        timestamp,
        resolve(tempRoot, 'unsafe-path.zip'),
      ),
      /Unsafe ZIP entry path/u,
    )
  }
  for (const collision of [
    ['root/Case.txt', 'root/case.txt'],
    ['root/é.txt', 'root/e\u0301.txt'],
  ]) {
    assert.throws(
      () => createDeterministicZip32(
        collision.map((path) => entryFromBuffer(path, Buffer.from(`${path}\n`, 'utf8'))),
        timestamp,
        resolve(tempRoot, 'portable-collision.zip'),
      ),
      /Portable ZIP path collision/u,
    )
  }
  assert.throws(
    () => createDeterministicZip32(
      [
        entryFromBuffer('root/file', Buffer.from('file\n', 'utf8')),
        entryFromBuffer('root/file/child.txt', Buffer.from('child\n', 'utf8')),
      ],
      timestamp,
      resolve(tempRoot, 'prefix-collision.zip'),
    ),
    /ancestor of another entry/u,
  )
  assert.throws(
    () => createDeterministicZip32(
      [{
        ...entryFromBuffer('root/ambiguous.txt', Buffer.from('ambiguous\n', 'utf8')),
        sourcePath,
      }],
      timestamp,
      resolve(tempRoot, 'ambiguous-source.zip'),
    ),
    /exactly one content source/u,
  )

  const emptyDigest = createHash('sha256').update(Buffer.alloc(0)).digest('hex')
  const emptyCrc32 = crc32(Buffer.alloc(0)) >>> 0
  assert.throws(
    () => createDeterministicZip32(
      [{
        packagePath: 'root/directory-source',
        sourcePath: tempRoot,
        bytes: 0,
        sha256: emptyDigest,
        crc32: emptyCrc32,
      }],
      timestamp,
      resolve(tempRoot, 'directory-source.zip'),
    ),
    /source must be a regular non-symlink file/u,
  )
  const sourceLink = resolve(tempRoot, 'source-link.txt')
  symlinkSync(sourcePath, sourceLink)
  assert.throws(
    () => createDeterministicZip32(
      [{
        ...entryFromSource('root/source-link.txt', sourceLink),
        sourcePath: sourceLink,
      }],
      timestamp,
      resolve(tempRoot, 'symlink-source.zip'),
    ),
    /source must be a regular non-symlink file/u,
  )

  assert.throws(
    () => createDeterministicZip32(
      Array.from({ length: 0x10000 }, (_, index) => ({
        packagePath: `root/${index}.txt`,
        content: Buffer.alloc(0),
        bytes: 0,
        sha256: emptyDigest,
        crc32: emptyCrc32,
      })),
      timestamp,
      resolve(tempRoot, 'zip32-entry-limit.zip'),
    ),
    /entry count exceeds the 65535-entry limit/u,
  )
  assert.throws(
    () => createDeterministicZip32(
      [{
        ...entryFromSource('root/oversized.bin', sourcePath),
        bytes: 0x100000000,
      }],
      timestamp,
      resolve(tempRoot, 'zip32-entry-size.zip'),
    ),
    /entry exceeds the 4294967295-byte size limit/u,
  )
  assert.throws(
    () => createDeterministicZip32(
      [{
        ...entryFromSource(`root/${'x'.repeat(0x10000)}`, sourcePath),
      }],
      timestamp,
      resolve(tempRoot, 'zip32-path-limit.zip'),
    ),
    /path exceeds the 65535-byte limit/u,
  )
  assert.throws(
    () => createDeterministicZip32(
      [
        { ...entryFromSource('root/huge-a.bin', sourcePath), bytes: 0x80000000 },
        { ...entryFromSource('root/huge-b.bin', sourcePath), bytes: 0x80000000 },
      ],
      timestamp,
      resolve(tempRoot, 'zip32-outer-limit.zip'),
    ),
    /outer limit/u,
  )

  const driftSource = resolve(tempRoot, 'drift-source.bin')
  writeFileSync(driftSource, 'original')
  const driftEntry = entryFromSource('root/drift-source.bin', driftSource)
  writeFileSync(driftSource, 'modified')
  const driftOutput = resolve(tempRoot, 'drift.zip')
  writeFileSync(driftOutput, oldOutput)
  assert.throws(
    () => createDeterministicZip32([driftEntry], timestamp, driftOutput),
    /Source file changed while writing ZIP entry/u,
  )
  assert.deepEqual(readFileSync(driftOutput), oldOutput, 'source drift cannot replace an existing output')
  assertNoTemporaryOutput(driftOutput)

  assert.ok(existsSync(firstZip) && existsSync(secondZip), 'successful atomic outputs exist')
  console.log('Deterministic ZIP32 self-test passed: 3 entries, 30 structural and adversarial guarantees.')
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}
