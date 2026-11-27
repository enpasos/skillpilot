import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:https'
import { join } from 'node:path'

const authorizationPath = '/api/openai/v1/oauth2/authorize'
const consentPath = '/api/openai/v1/oauth/consent'
const callbackReply = 'Local portal callback received'

async function readFixture() {
  const chunks = []
  let size = 0
  for await (const chunk of process.stdin) {
    size += chunk.length
    assert.ok(size <= 8192)
    chunks.push(chunk)
  }
  const input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  const authorization = new URL(input.authorization)
  const callback = new URL(input.callback)
  const state = authorization.searchParams.get('state')
  assert.ok(authorization.protocol === 'http:' && authorization.hostname === '127.0.0.1'
    && authorization.port && authorization.pathname === authorizationPath && state)
  assert.ok(/^https:\/\/chatgpt\.com\/connector\/oauth\/synthetic-[A-Za-z0-9_-]+$/u.test(callback.href))
  assert.ok(authorization.searchParams.get('redirect_uri') === callback.href)
  return { authorization, callback, state }
}

async function listenForCallback(directory, callback, state) {
  const cert = join(directory, 'cert.pem')
  const key = join(directory, 'key.pem')
  const generated = spawnSync('openssl', ['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256',
    '-nodes', '-subj', '/CN=chatgpt.com', '-days', '1', '-keyout', key, '-out', cert], { stdio: 'ignore', timeout: 5000 })
  assert.equal(generated.status, 0)
  let callbacks = 0
  const server = createServer({ cert: await readFile(cert), key: await readFile(key) }, (request, response) => {
    const received = new URL(request.url, callback.origin)
    if (received.pathname !== callback.pathname) {
      response.writeHead(404).end()
      return
    }
    callbacks++
    if (request.method !== 'GET' || request.headers.host !== callback.host
      || received.searchParams.get('state') !== state || !received.searchParams.get('code')) {
      response.writeHead(400).end()
      return
    }
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end(callbackReply)
  })
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve))
  return { port: server.address().port, count: () => callbacks, close: () => server.close() }
}

let phase = 'read_fixture'
let directory, collector, browser
let formActionBlocked = false
let consentStatus = 0
let approvalStatus = 0
try {
  const { authorization, callback, state } = await readFixture()
  phase = 'start_loopback_callback'
  directory = await mkdtemp('/tmp/skillpilot-portal-consent-')
  collector = await listenForCallback(directory, callback, state)

  phase = 'launch_chromium'
  const { chromium } = await import('../app/node_modules/playwright/index.mjs')
  // Preserve the registered HTTPS destination and the real 302. Chromium sends
  // it to the loopback collector while DNS for every other origin is disabled.
  browser = await chromium.launch({ args: ['--no-proxy-server',
    `--host-resolver-rules=MAP ${callback.hostname} 127.0.0.1:${collector.port}, MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`], timeout: 10000 })
  const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' })
  const page = await context.newPage()
  page.on('console', message => {
    if (message.type() === 'error' && /Content Security Policy directive: ["']form-action\b/u.test(message.text())) {
      formActionBlocked = true
    }
  })
  let posts = 0
  const isConsentPost = request => {
    const url = new URL(request.url())
    return request.method() === 'POST' && url.origin === authorization.origin && url.pathname === authorizationPath
  }
  page.on('request', request => { if (isConsentPost(request)) posts++ })

  phase = 'load_application_consent'
  const consent = await page.goto(authorization.href, { timeout: 10000 })
  consentStatus = consent?.status() ?? 0
  const finalConsentUrl = new URL(page.url())
  assert.ok(consentStatus === 200 && finalConsentUrl.origin === authorization.origin
    && finalConsentUrl.pathname === consentPath && await consent.headerValue('content-security-policy'))

  phase = 'submit_application_consent'
  const [approval] = await Promise.all([
    page.waitForResponse(response => isConsentPost(response.request()), { timeout: 10000 }).then(response => {
      approvalStatus = response.status()
      return response
    }),
    page.getByRole('button', { name: 'Authorize app' }).click({ timeout: 10000, noWaitAfter: true }),
  ])
  assert.equal(approval.status(), 302)

  phase = 'reach_registered_callback'
  await page.getByText(callbackReply, { exact: true }).waitFor({ timeout: 10000 })
  const reached = new URL(page.url())
  assert.ok(reached.origin === callback.origin && reached.pathname === callback.pathname)
  assert.equal(posts, 1)
  assert.equal(collector.count(), 1)
  console.log('portal_consent_browser_pass posts=1 callbacks=1')
} catch {
  // Playwright exceptions include full navigation URLs. Only retain the phase.
  const failedPhase = formActionBlocked ? 'browser_form_action' : phase
  console.error(`portal_consent_browser_failed phase=${failedPhase} consent_http=${consentStatus} approval_http=${approvalStatus}`)
  process.exitCode = 1
} finally {
  if (browser) await browser.close()
  if (collector) collector.close()
  if (directory) await rm(directory, { recursive: true, force: true })
}
