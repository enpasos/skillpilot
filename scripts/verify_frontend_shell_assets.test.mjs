#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const checkerPath = fileURLToPath(
  new URL('./verify_frontend_shell_assets.mjs', import.meta.url),
)

async function runChecker(source) {
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

const fixtureHtml = `<!doctype html>
  <html>
    <head>
      <link href="/assets/app.css" media="screen" rel="preload stylesheet">
      <script src="/assets/app.js" defer type="module"></script>
    </head>
  </html>`

const buildDirectory = await mkdtemp(
  path.join(tmpdir(), 'skillpilot-frontend-shell-'),
)

try {
  await mkdir(path.join(buildDirectory, 'assets'))
  await writeFile(path.join(buildDirectory, 'index.html'), fixtureHtml)
  await writeFile(path.join(buildDirectory, 'assets/app.css'), 'body { color: black; }')
  await writeFile(path.join(buildDirectory, 'assets/app.js'), 'console.log("ready")')

  const localResult = await runChecker(buildDirectory)
  assert(
    localResult.code === 0,
    `local checker failed:\n${localResult.stdout}${localResult.stderr}`,
  )
  assert(
    localResult.stdout.includes(
      'CHECK frontend_shell_assets PASS artifact stylesheets=1 modules=1',
    ),
    `local checker reports a clear PASS summary: ${JSON.stringify(localResult.stdout)}`,
  )

  const requests = []
  let cssContentType = 'text/css; charset=utf-8'
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
    requests.push({
      cacheControl: request.headers['cache-control'],
      path: requestUrl.pathname,
      pragma: request.headers.pragma,
    })

    const fixtures = new Map([
      ['/index.html', [fixtureHtml, 'text/html; charset=utf-8']],
      ['/assets/app.css', ['body { color: black; }', cssContentType]],
      ['/assets/app.js', ['console.log("ready")', 'application/javascript']],
    ])
    const fixture = fixtures.get(requestUrl.pathname)
    if (!fixture) {
      response.writeHead(404, { 'content-type': 'text/plain' })
      response.end('not found')
      return
    }
    response.writeHead(200, { 'content-type': fixture[1] })
    response.end(fixture[0])
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  try {
    const address = server.address()
    assert(address && typeof address !== 'string', 'fixture server is listening')
    const baseUrl = `http://127.0.0.1:${address.port}/`

    const remoteResult = await runChecker(baseUrl)
    assert(
      remoteResult.code === 0,
      `remote checker failed:\n${remoteResult.stdout}${remoteResult.stderr}`,
    )
    assert(
      remoteResult.stdout.includes(
        'CHECK frontend_shell_assets PASS remote stylesheets=1 modules=1',
      ),
      `remote checker reports a clear PASS summary: ${JSON.stringify(remoteResult.stdout)}`,
    )
    assert(
      requests.every(
        (request) => request.cacheControl?.includes('no-store')
          && request.pragma === 'no-cache',
      ),
      'all remote requests bypass caches',
    )
    assert(
      requests.every((request) => request.path !== '/assets/assets/app.css'),
      'root-relative assets are resolved without duplicating the assets segment',
    )

    cssContentType = 'text/html; charset=utf-8'
    const wrongTypeResult = await runChecker(baseUrl)
    assert(wrongTypeResult.code === 1, 'wrong CSS Content-Type must fail')
    assert(
      wrongTypeResult.stderr.includes('CHECK frontend_shell_assets FAIL')
        && wrongTypeResult.stderr.includes('unexpected Content-Type'),
      'wrong CSS Content-Type produces a clear failure',
    )
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  const crossOriginHtml = fixtureHtml.replace(
    '/assets/app.css',
    'https://cdn.example.invalid/app.css',
  )
  await writeFile(path.join(buildDirectory, 'index.html'), crossOriginHtml)
  const crossOriginResult = await runChecker(buildDirectory)
  assert(crossOriginResult.code === 1, 'cross-origin asset must fail')
  assert(
    crossOriginResult.stderr.includes('cross-origin shell asset is not allowed'),
    'cross-origin failure is explicit',
  )

  console.log('Frontend shell asset verifier tests passed')
} finally {
  await rm(buildDirectory, { recursive: true, force: true })
}
