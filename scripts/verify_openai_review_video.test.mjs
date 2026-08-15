#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { OPENAI_REVIEW_VIDEO } from './openai_review_video_contract.mjs'

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const checkerPath = path.resolve(repositoryRoot, 'scripts/verify_openai_review_video.mjs')
const publicRoot = path.resolve(repositoryRoot, 'app/public')
const videoBytes = await readFile(
  path.resolve(publicRoot, OPENAI_REVIEW_VIDEO.relativePath),
)

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function runChecker(source) {
  return new Promise((resolve) => {
    execFile(process.execPath, [checkerPath, source], (error, stdout, stderr) => {
      resolve({
        code: error && typeof error.code === 'number' ? error.code : 0,
        stderr,
        stdout,
      })
    })
  })
}

const localResult = await runChecker(publicRoot)
assert(
  localResult.code === 0,
  `local review-video verification failed:\n${localResult.stdout}${localResult.stderr}`,
)

let contentType = 'video/mp4'
const expectedPath = new URL(OPENAI_REVIEW_VIDEO.publicUrl).pathname
const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
  if (requestUrl.pathname !== expectedPath) {
    response.writeHead(404)
    response.end()
    return
  }

  const commonHeaders = {
    'accept-ranges': 'bytes',
    'content-type': contentType,
  }
  const range = request.headers.range
  if (range === 'bytes=0-1023') {
    const partial = videoBytes.subarray(0, 1024)
    response.writeHead(206, {
      ...commonHeaders,
      'content-length': String(partial.length),
      'content-range': `bytes 0-1023/${videoBytes.length}`,
    })
    response.end(partial)
    return
  }

  response.writeHead(200, {
    ...commonHeaders,
    'content-length': String(videoBytes.length),
  })
  response.end(videoBytes)
})

await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', resolve)
})

try {
  const address = server.address()
  assert(address && typeof address !== 'string', 'fixture server is listening')
  const localOrigin = `http://127.0.0.1:${address.port}`
  const remoteResult = await runChecker(localOrigin)
  assert(
    remoteResult.code === 0,
    `remote review-video verification failed:\n${remoteResult.stdout}${remoteResult.stderr}`,
  )

  contentType = 'text/html; charset=utf-8'
  const wrongTypeResult = await runChecker(localOrigin)
  assert(wrongTypeResult.code === 1, 'wrong Content-Type must fail')
  assert(
    wrongTypeResult.stderr.includes('CHECK openai_review_video FAIL'),
    'wrong Content-Type produces a clear verifier failure',
  )
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

console.log('OpenAI review video verifier tests passed')
