#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { lstat, readFile } from 'node:fs/promises'
import path from 'node:path'

const [source] = process.argv.slice(2)
if (!source) {
  console.error('Usage: verify_gemini_skill_download.mjs <static-build-directory-or-base-url>')
  process.exit(2)
}

const relativePath = 'plugins/gemini/skillpilot-coach-v1-0.1.0.zip'
// The archive imported in the controlled Gemini host test is immutable.
const expectedSha256 = '2a5f5de47cd04345196cd21f0ab4dc4e0b3247b509a9deaaa0e2f8cd74d30a40'
const maximumBytes = 1024 * 1024
const remote = /^https?:\/\//iu.test(source)

async function loadArchive() {
  if (!remote) {
    const filename = path.resolve(source, relativePath)
    const stats = await lstat(filename)
    if (!stats.isFile() || stats.isSymbolicLink() || stats.size > maximumBytes) {
      throw new Error('Gemini Skill download must be a bounded regular file')
    }
    return readFile(filename)
  }

  const url = new URL(relativePath, source.endsWith('/') ? source : `${source}/`)
  url.searchParams.set('_gemini_skill_check', String(Date.now()))
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-cache, no-store', pragma: 'no-cache' },
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  })
  if (response.status !== 200) {
    await response.body?.cancel()
    throw new Error(`Gemini Skill download returned HTTP ${response.status} instead of 200`)
  }
  const contentType = response.headers.get('content-type') ?? ''
  if (!/^application\/(?:zip|x-zip-compressed|octet-stream)(?:\s*;|$)/iu.test(contentType)) {
    await response.body?.cancel()
    throw new Error(`Gemini Skill download has unexpected Content-Type ${JSON.stringify(contentType)}; SPA HTML is not a ZIP`)
  }
  if (!response.body) throw new Error('Gemini Skill download has no body')
  const reader = response.body.getReader()
  const chunks = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > maximumBytes) throw new Error('Gemini Skill download exceeds the size limit')
      chunks.push(value)
    }
  } finally {
    await reader.cancel()
  }
  return Buffer.concat(chunks, length)
}

try {
  const bytes = await loadArchive()
  if (!bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
    throw new Error('Gemini Skill download is not a ZIP (missing PK header)')
  }
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (sha256 !== expectedSha256) {
    throw new Error('Gemini Skill download differs from the exact imported 0.1.0 archive')
  }
  console.log(`CHECK gemini_skill_download PASS ${remote ? 'remote' : 'artifact'} bytes=${bytes.length} sha256=${sha256}`)
} catch (error) {
  console.error(`CHECK gemini_skill_download FAIL ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
