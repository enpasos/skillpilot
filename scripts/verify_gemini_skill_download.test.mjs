#!/usr/bin/env node

import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execute = promisify(execFile)
const checker = fileURLToPath(new URL('./verify_gemini_skill_download.mjs', import.meta.url))
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const relativePath = 'plugins/gemini/skillpilot-coach-v1-0.1.0.zip'
await execute('python3', [path.join(repositoryRoot, 'ai/gemini/coach/scripts/package_skill.py')])
const archive = await readFile(path.join(repositoryRoot, 'ai/gemini/coach/dist', path.basename(relativePath)))

async function check(source) {
  try {
    const result = await execute(process.execPath, [checker, source])
    return { code: 0, ...result }
  } catch (error) {
    return { code: error.code, stdout: error.stdout, stderr: error.stderr }
  }
}

const directory = await mkdtemp(path.join(tmpdir(), 'skillpilot-gemini-download-'))
const filename = path.join(directory, relativePath)
await mkdir(path.dirname(filename), { recursive: true })
try {
  await writeFile(filename, archive)
  assert.equal((await check(directory)).code, 0, 'exact local archive passes')
  await writeFile(filename, '<!doctype html><html>SPA shell</html>')
  assert.match((await check(directory)).stderr, /missing PK header/u)
  const alteredArchive = Buffer.from(archive)
  alteredArchive[alteredArchive.length - 1] ^= 1
  await writeFile(filename, alteredArchive)
  assert.match((await check(directory)).stderr, /differs from the exact imported/u)
  await rm(filename)
  await symlink(path.join(repositoryRoot, 'ai/gemini/coach/dist', path.basename(relativePath)), filename)
  assert.match((await check(directory)).stderr, /bounded regular file/u)

  let status = 200
  let contentType = 'application/zip'
  let body = archive
  const requests = []
  const server = createServer((request, response) => {
    requests.push({ path: new URL(request.url, 'http://127.0.0.1').pathname,
      cacheControl: request.headers['cache-control'], pragma: request.headers.pragma })
    response.writeHead(status, { 'content-type': contentType, location: '/index.html' })
    response.end(body)
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const result = await check(baseUrl)
    assert.equal(result.code, 0, result.stderr)
    assert.match(result.stdout, /CHECK gemini_skill_download PASS remote/u)
    assert.equal(requests[0].path, `/${relativePath}`)
    assert.match(requests[0].cacheControl, /no-store/u)
    assert.equal(requests[0].pragma, 'no-cache')

    contentType = 'text/html; charset=utf-8'
    body = Buffer.from('<!doctype html><html>SPA shell</html>')
    assert.match((await check(baseUrl)).stderr, /SPA HTML is not a ZIP/u,
      'the observed HTTP-200 SPA fallback is a deployment failure')
    contentType = 'application/zip'
    assert.match((await check(baseUrl)).stderr, /missing PK header/u)
    body = alteredArchive
    assert.match((await check(baseUrl)).stderr, /differs from the exact imported/u)
    status = 302
    assert.match((await check(baseUrl)).stderr, /HTTP 302/u, 'redirects are rejected')
    status = 404
    assert.match((await check(baseUrl)).stderr, /HTTP 404/u)
    status = 200
    body = Buffer.alloc(1024 * 1024 + 1)
    assert.match((await check(baseUrl)).stderr, /size limit/u)
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
  console.log('Gemini Skill download verifier: exact local/public ZIP, HTML fallback, altered bytes, redirects and size limit passed.')
} finally {
  await rm(directory, { recursive: true, force: true })
}
