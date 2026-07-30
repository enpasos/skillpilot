#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const responses = new Map([
  [
    '/index.html',
    `<!doctype html>
      <html>
        <body>
          <h1>KI-Transparenz</h1>
          <script type="module" src="/assets/index-fixture.js"></script>
        </body>
      </html>`,
  ],
  [
    '/assets/index-fixture.js',
    `const __vite__mapDeps = ["assets/ExplorerView-fixture.js"];
      import("./relative-fixture.js");
      import { sharedFixture } from "./shared-fixture.js";
      const internalBrowserifyReference = require("./elk-api.js");
      console.log(
        sharedFixture,
        internalBrowserifyReference,
        "Diese Audioeinführung enthält KI-erzeugte Stimmen.",
        "This audio introduction contains AI-generated voices."
      );`,
  ],
  [
    '/assets/ExplorerView-fixture.js',
    `console.log(
      "Der Lerncoach ist ein KI-Assistent und kann Fehler machen.",
      "AI Transparency"
    );`,
  ],
  [
    '/assets/relative-fixture.js',
    'console.log("The learning coach is an AI assistant and can make mistakes.");',
  ],
  [
    '/assets/shared-fixture.js',
    'export const sharedFixture = true;',
  ],
])
const requestedPaths = []
const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
  requestedPaths.push(requestUrl.pathname)
  const body = responses.get(requestUrl.pathname)
  if (body === undefined) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('not found')
    return
  }
  response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
  response.end(body)
})

await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', resolve)
})

try {
  const address = server.address()
  assert(address && typeof address !== 'string', 'fixture server is listening')
  const checkerPath = fileURLToPath(
    new URL('./verify_ai_transparency_artifact.mjs', import.meta.url),
  )
  const result = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [checkerPath, `http://127.0.0.1:${address.port}/`],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.once('error', reject)
    child.once('close', (code) => {
      resolve({ code, stdout, stderr })
    })
  })

  assert(
    result.code === 0,
    `remote artifact checker failed:\n${result.stdout}${result.stderr}`,
  )
  assert(
    !requestedPaths.some((requestPath) => requestPath.includes('/assets/assets/')),
    'remote crawler must not duplicate the assets path segment',
  )
  assert(
    requestedPaths.includes('/assets/ExplorerView-fixture.js'),
    'Vite preload-map references are resolved from the document base',
  )
  assert(
    requestedPaths.includes('/assets/relative-fixture.js'),
    'relative ESM imports are resolved from the importing script',
  )
  assert(
    requestedPaths.includes('/assets/shared-fixture.js'),
    'static ESM imports are crawled',
  )
  assert(
    !requestedPaths.includes('/assets/elk-api.js'),
    'unrelated JavaScript-like library strings are not crawled as chunks',
  )

  console.log('AI transparency remote artifact crawler tests passed')
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}
