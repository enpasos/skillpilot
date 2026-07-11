import { createHash, randomBytes } from 'node:crypto'
import {
  closeSync,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
  renameSync,
  rmSync,
  statSync,
  writeSync,
} from 'node:fs'
import { crc32 } from 'node:zlib'

export type DeterministicZip32Entry = {
  packagePath: string
  content?: Buffer
  sourcePath?: string
  bytes: number
  sha256: string
  crc32: number
}

export type DeterministicZip32Limits = {
  maxEntries?: number
  maxEntryBytes?: number
  maxPathBytes?: number
  maxOuterBytes?: number
  maxTotalUncompressedBytes?: number
}

type ResolvedLimits = Required<DeterministicZip32Limits>

const ZIP32_MAX_ENTRY_COUNT = 0xffff
const ZIP32_MAX_VALUE = 0xffffffff
const ZIP32_MAX_PATH_BYTES = 0xffff
const SHA256_PATTERN = /^[a-f0-9]{64}$/u

const compareCodeUnits = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0)

const assertSafeArchivePath = (packagePath: string) => {
  if (
    packagePath.startsWith('/')
    || packagePath.includes('\\')
    || [...packagePath].some((character) => {
      const codePoint = character.codePointAt(0) ?? 0
      return codePoint < 0x20 || codePoint === 0x7f
    })
    || packagePath.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(`Unsafe ZIP entry path: ${packagePath}`)
  }
}

const positiveLimit = (value: number | undefined, fallback: number, maximum: number, name: string) => {
  const resolved = value ?? fallback
  if (!Number.isSafeInteger(resolved) || resolved < 0 || resolved > maximum) {
    throw new Error(`${name} must be a safe integer between 0 and ${maximum}, got ${resolved}.`)
  }
  return resolved
}

const resolveLimits = (limits: DeterministicZip32Limits): ResolvedLimits => ({
  maxEntries: positiveLimit(limits.maxEntries, ZIP32_MAX_ENTRY_COUNT, ZIP32_MAX_ENTRY_COUNT, 'maxEntries'),
  maxEntryBytes: positiveLimit(limits.maxEntryBytes, ZIP32_MAX_VALUE, ZIP32_MAX_VALUE, 'maxEntryBytes'),
  maxPathBytes: positiveLimit(limits.maxPathBytes, ZIP32_MAX_PATH_BYTES, ZIP32_MAX_PATH_BYTES, 'maxPathBytes'),
  maxOuterBytes: positiveLimit(limits.maxOuterBytes, ZIP32_MAX_VALUE, ZIP32_MAX_VALUE, 'maxOuterBytes'),
  maxTotalUncompressedBytes: positiveLimit(
    limits.maxTotalUncompressedBytes,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    'maxTotalUncompressedBytes',
  ),
})

const writeBufferFully = (descriptor: number, content: Buffer) => {
  let offset = 0
  while (offset < content.length) {
    const written = writeSync(descriptor, content, offset, content.length - offset)
    if (written <= 0) throw new Error('Failed to make progress while writing ZIP output.')
    offset += written
  }
}

const verifyInlineContent = (entry: DeterministicZip32Entry) => {
  if (!entry.content) return
  const actualSha256 = createHash('sha256').update(entry.content).digest('hex')
  const actualCrc32 = crc32(entry.content) >>> 0
  if (
    entry.content.length !== entry.bytes
    || actualSha256 !== entry.sha256
    || actualCrc32 !== entry.crc32
  ) {
    throw new Error(`Inline content metadata mismatch for ZIP entry ${entry.packagePath}.`)
  }
}

const writePackageEntryContent = (descriptor: number, entry: DeterministicZip32Entry) => {
  if (entry.content) {
    writeBufferFully(descriptor, entry.content)
    return
  }
  if (!entry.sourcePath) {
    throw new Error(`Package entry has neither content nor source path: ${entry.packagePath}`)
  }
  if (!lstatSync(entry.sourcePath).isFile()) {
    throw new Error(`ZIP source must be a regular non-symlink file: ${entry.packagePath}`)
  }
  const sourceDescriptor = openSync(entry.sourcePath, 'r')
  const chunk = Buffer.allocUnsafe(8 * 1024 * 1024)
  const hash = createHash('sha256')
  let copied = 0
  let checksum = 0
  try {
    if (!fstatSync(sourceDescriptor).isFile()) {
      throw new Error(`ZIP source must remain a regular file: ${entry.packagePath}`)
    }
    while (true) {
      const read = readSync(sourceDescriptor, chunk, 0, chunk.length, null)
      if (read === 0) break
      const data = chunk.subarray(0, read)
      hash.update(data)
      checksum = crc32(data, checksum) >>> 0
      writeBufferFully(descriptor, data)
      copied += read
    }
  } finally {
    closeSync(sourceDescriptor)
  }
  if (copied !== entry.bytes) {
    throw new Error(
      `Source file changed while writing ZIP entry ${entry.packagePath}: ${copied} != ${entry.bytes} bytes.`,
    )
  }
  const actualSha256 = hash.digest('hex')
  if (actualSha256 !== entry.sha256 || checksum !== entry.crc32) {
    throw new Error(`Source file changed while writing ZIP entry ${entry.packagePath}: checksum mismatch.`)
  }
}

export const toUtcDosDateTime = (date: Date) => {
  const timestamp = date.getTime()
  if (!Number.isFinite(timestamp)) throw new Error('ZIP timestamp must be a valid Date.')
  const year = Math.max(1980, date.getUTCFullYear())
  if (year > 2107) throw new Error(`ZIP32 DOS timestamps cannot represent UTC year ${year}.`)
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = Math.floor(date.getUTCSeconds() / 2)

  return {
    dosTime: (hours << 11) | (minutes << 5) | seconds,
    dosDate: ((year - 1980) << 9) | (month << 5) | day,
  }
}

const validateEntry = (
  entry: DeterministicZip32Entry,
  name: Buffer,
  limits: ResolvedLimits,
) => {
  if (!entry.packagePath || name.toString('utf8') !== entry.packagePath) {
    throw new Error(`ZIP entry path is empty or is not lossless UTF-8: ${entry.packagePath}`)
  }
  assertSafeArchivePath(entry.packagePath)
  if (name.length > limits.maxPathBytes) {
    throw new Error(`ZIP entry path exceeds the ${limits.maxPathBytes}-byte limit: ${entry.packagePath}`)
  }
  if (!Number.isSafeInteger(entry.bytes) || entry.bytes < 0) {
    throw new Error(`ZIP entry size must be a non-negative safe integer: ${entry.packagePath}`)
  }
  if (entry.bytes > limits.maxEntryBytes) {
    throw new Error(`ZIP entry exceeds the ${limits.maxEntryBytes}-byte size limit: ${entry.packagePath}`)
  }
  if (!SHA256_PATTERN.test(entry.sha256)) {
    throw new Error(`ZIP entry has an invalid SHA-256 digest: ${entry.packagePath}`)
  }
  if (!Number.isInteger(entry.crc32) || entry.crc32 < 0 || entry.crc32 > ZIP32_MAX_VALUE) {
    throw new Error(`ZIP entry has an invalid CRC-32 value: ${entry.packagePath}`)
  }
  if ((entry.content === undefined) === (entry.sourcePath === undefined)) {
    throw new Error(`Package entry must have exactly one content source: ${entry.packagePath}`)
  }
  verifyInlineContent(entry)
}

export const createDeterministicZip32 = (
  entries: DeterministicZip32Entry[],
  mtime: Date,
  outputPath: string,
  requestedLimits: DeterministicZip32Limits = {},
) => {
  const limits = resolveLimits(requestedLimits)
  const sortedEntries = [...entries].sort((left, right) => compareCodeUnits(left.packagePath, right.packagePath))
  if (sortedEntries.length > limits.maxEntries) {
    throw new Error(`ZIP32 entry count exceeds the ${limits.maxEntries}-entry limit: ${sortedEntries.length}.`)
  }

  const duplicatePath = sortedEntries.find((entry, index) => (
    index > 0 && entry.packagePath === sortedEntries[index - 1].packagePath
  ))
  if (duplicatePath) throw new Error(`Duplicate ZIP entry path: ${duplicatePath.packagePath}`)

  const namedEntries = sortedEntries.map((entry) => ({
    entry,
    name: Buffer.from(entry.packagePath, 'utf8'),
  }))
  namedEntries.forEach(({ entry, name }) => validateEntry(entry, name, limits))

  const totalUncompressedBytes = namedEntries.reduce((sum, { entry }) => sum + entry.bytes, 0)
  if (totalUncompressedBytes > limits.maxTotalUncompressedBytes) {
    throw new Error(
      `ZIP uncompressed payload exceeds the ${limits.maxTotalUncompressedBytes}-byte limit: ${totalUncompressedBytes}.`,
    )
  }

  const centralSize = namedEntries.reduce((sum, { name }) => sum + 46 + name.length, 0)
  const centralOffset = namedEntries.reduce((sum, { entry, name }) => sum + 30 + name.length + entry.bytes, 0)
  const totalSize = centralOffset + centralSize + 22
  if (
    centralOffset > ZIP32_MAX_VALUE
    || centralSize > ZIP32_MAX_VALUE
    || totalSize > ZIP32_MAX_VALUE
    || totalSize > limits.maxOuterBytes
  ) {
    throw new Error(`ZIP would exceed the ${limits.maxOuterBytes}-byte outer limit: ${totalSize}.`)
  }

  const centralParts: Buffer[] = []
  let offset = 0
  const { dosTime, dosDate } = toUtcDosDateTime(mtime)
  const temporaryPath = `${outputPath}.tmp-${process.pid}-${randomBytes(12).toString('hex')}`
  const descriptor = openSync(temporaryPath, 'wx', 0o600)
  try {
    namedEntries.forEach(({ entry, name }) => {
      const localHeader = Buffer.alloc(30)
      localHeader.writeUInt32LE(0x04034b50, 0)
      localHeader.writeUInt16LE(20, 4)
      localHeader.writeUInt16LE(0x0800, 6)
      localHeader.writeUInt16LE(0, 8)
      localHeader.writeUInt16LE(dosTime, 10)
      localHeader.writeUInt16LE(dosDate, 12)
      localHeader.writeUInt32LE(entry.crc32, 14)
      localHeader.writeUInt32LE(entry.bytes, 18)
      localHeader.writeUInt32LE(entry.bytes, 22)
      localHeader.writeUInt16LE(name.length, 26)
      localHeader.writeUInt16LE(0, 28)
      writeBufferFully(descriptor, localHeader)
      writeBufferFully(descriptor, name)
      writePackageEntryContent(descriptor, entry)

      const centralHeader = Buffer.alloc(46)
      centralHeader.writeUInt32LE(0x02014b50, 0)
      centralHeader.writeUInt16LE(20, 4)
      centralHeader.writeUInt16LE(20, 6)
      centralHeader.writeUInt16LE(0x0800, 8)
      centralHeader.writeUInt16LE(0, 10)
      centralHeader.writeUInt16LE(dosTime, 12)
      centralHeader.writeUInt16LE(dosDate, 14)
      centralHeader.writeUInt32LE(entry.crc32, 16)
      centralHeader.writeUInt32LE(entry.bytes, 20)
      centralHeader.writeUInt32LE(entry.bytes, 24)
      centralHeader.writeUInt16LE(name.length, 28)
      centralHeader.writeUInt16LE(0, 30)
      centralHeader.writeUInt16LE(0, 32)
      centralHeader.writeUInt16LE(0, 34)
      centralHeader.writeUInt16LE(0, 36)
      centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38)
      centralHeader.writeUInt32LE(offset, 42)
      centralParts.push(centralHeader, name)
      offset += localHeader.length + name.length + entry.bytes
    })

    const centralDirectory = Buffer.concat(centralParts)
    writeBufferFully(descriptor, centralDirectory)
    const endOfCentralDirectory = Buffer.alloc(22)
    endOfCentralDirectory.writeUInt32LE(0x06054b50, 0)
    endOfCentralDirectory.writeUInt16LE(0, 4)
    endOfCentralDirectory.writeUInt16LE(0, 6)
    endOfCentralDirectory.writeUInt16LE(sortedEntries.length, 8)
    endOfCentralDirectory.writeUInt16LE(sortedEntries.length, 10)
    endOfCentralDirectory.writeUInt32LE(centralSize, 12)
    endOfCentralDirectory.writeUInt32LE(centralOffset, 16)
    endOfCentralDirectory.writeUInt16LE(0, 20)
    writeBufferFully(descriptor, endOfCentralDirectory)
  } catch (error) {
    closeSync(descriptor)
    rmSync(temporaryPath, { force: true })
    throw error
  }
  closeSync(descriptor)
  const writtenBytes = statSync(temporaryPath).size
  if (writtenBytes !== totalSize) {
    rmSync(temporaryPath, { force: true })
    throw new Error(`ZIP byte count mismatch after streaming write: ${writtenBytes} != ${totalSize}.`)
  }
  try {
    renameSync(temporaryPath, outputPath)
  } catch (error) {
    rmSync(temporaryPath, { force: true })
    throw error
  }
  return writtenBytes
}
