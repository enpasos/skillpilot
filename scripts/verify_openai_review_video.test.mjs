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
const resourceRoot = path.resolve(repositoryRoot, 'backend/src/main/resources')
const videoBytes = await readFile(
  path.resolve(resourceRoot, OPENAI_REVIEW_VIDEO.relativePath),
)

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

assert(
  OPENAI_REVIEW_VIDEO.relativePath.startsWith('openai-review/'),
  'the tracked artifact must stay outside general static-resource locations',
)
assert(
  new URL(OPENAI_REVIEW_VIDEO.publicUrl).pathname.startsWith(
    '/api/public/openai/review/',
  ),
  'the canonical public URL must use the service-worker-safe API path',
)

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

const localResult = await runChecker(resourceRoot)
assert(
  localResult.code === 0,
  `local review-video verification failed:\n${localResult.stdout}${localResult.stderr}`,
)

let contentType = 'video/mp4'
let corsMode = 'full'
const expectedPath = new URL(OPENAI_REVIEW_VIDEO.publicUrl).pathname
const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
  if (requestUrl.pathname !== expectedPath) {
    response.writeHead(404)
    response.end()
    return
  }

  if (request.method === 'OPTIONS') {
    const preflightHeaders = corsMode === 'full'
      ? {
          'access-control-allow-headers': 'Range',
          'access-control-allow-methods': 'GET, HEAD, OPTIONS',
          'access-control-allow-origin': '*',
        }
      : {}
    response.writeHead(204, preflightHeaders)
    response.end()
    return
  }

  const corsHeaders = request.headers.origin && corsMode !== 'none'
    ? {
        'access-control-allow-origin': '*',
        'access-control-expose-headers': [
          'Accept-Ranges',
          'Content-Length',
          'Content-Range',
        ].join(', '),
      }
    : {}
  const commonHeaders = {
    ...corsHeaders,
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

  contentType = 'video/mp4'
  corsMode = 'get-only'
  const missingPreflightResult = await runChecker(localOrigin)
  assert(missingPreflightResult.code === 1, 'missing CORS preflight must fail')
  assert(
    missingPreflightResult.stderr.includes('OpenAI-origin CORS preflight'),
    'missing CORS preflight produces a clear verifier failure',
  )

  corsMode = 'none'
  const missingCorsResult = await runChecker(localOrigin)
  assert(missingCorsResult.code === 1, 'missing response CORS must fail')
  assert(
    missingCorsResult.stderr.includes('OpenAI-origin range response'),
    'missing response CORS produces a clear verifier failure',
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
