// SPDX-License-Identifier: Apache-2.0
// Real HTTP/OAuth/MCP against an ephemeral LOCAL process, never a Gemini model.
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createPocApp } from '../server/app.mjs';

const reportDir = resolve(process.env.POC_DATA_DIR || '.runtime');
const remote = process.argv.includes('--remote');
const dataDir = remote ? reportDir : await mkdtemp(join(tmpdir(), 'skillpilot-gemini-smoke-'));
const server = createServer();
const events = [];
const operatorKey = remote ? (await readFile(join(reportDir, 'operator-key'), 'utf8')).trim() : randomBytes(32).toString('base64url');
const clientSecret = remote ? (await readFile(join(reportDir, 'client-secret'), 'utf8')).trim() : randomBytes(32).toString('base64url');
const client = new Client({ name: 'skillpilot-local-poc-smoke', version: '0.1.0' });
let negotiatedProtocolVersion;
try {
  let origin, redirect, operatorOrigin;
  let clientAuthMethod = 'client_secret_basic';
  if (remote) {
    const connection = JSON.parse(await readFile(join(reportDir, 'connection.json'), 'utf8'));
    clientAuthMethod = connection.clientAuthMethod === undefined ? 'client_secret_basic' : connection.clientAuthMethod;
    assert.ok(['client_secret_basic', 'client_secret_post'].includes(clientAuthMethod),
      'Remote smoke requires a supported explicit client authentication method');
    origin = connection.origin;
    assert.ok(origin.startsWith('https://'), 'Remote smoke requires the explicitly configured HTTPS PoC origin');
    redirect = connection.redirectUris[0];
    assert.ok(redirect, 'Pin an exact test callback before remote smoke');
    operatorOrigin = connection.localOrigin;
    assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(operatorOrigin), 'Operator key stays on loopback');
  } else {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
    redirect = `${origin}/synthetic-local-callback`;
    operatorOrigin = origin;
    const app = createPocApp({ origin, operatorKey, clientSecret, redirectUris: [redirect], dataDir, audit: e => events.push(e) });
    server.on('request', app);
  }
  const unauthenticated = await fetch(`${origin}/mcp`, { method: 'POST' });
  assert.equal(unauthenticated.status, 401);
  const metadata = await (await fetch(`${origin}/.well-known/oauth-protected-resource/mcp`)).json();
  assert.equal(metadata.resource, `${origin}/mcp`);
  const verifier = randomBytes(32).toString('base64url');
  const url = new URL(`${origin}/authorize`);
  url.search = new URLSearchParams({ client_id: 'skillpilot-gemini-poc', redirect_uri: redirect,
    response_type: 'code', code_challenge_method: 'S256',
    code_challenge: createHash('sha256').update(verifier).digest('base64url'), scope: 'poc:probe', resource: `${origin}/mcp`, state: 'local-smoke' });
  const consentPage = await fetch(url);
  assert.equal(consentPage.status, 200);
  const nonce = (await consentPage.text()).match(/name="nonce"\s+value="([^"]+)"/)?.[1];
  assert.ok(nonce);
  const consent = await fetch(`${origin}/consent`, { method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ nonce, operator_key: operatorKey, decision: 'allow' }) });
  assert.equal(consent.status, 302);
  const code = new URL(consent.headers.get('location')).searchParams.get('code');
  const tokenHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const tokenBody = new URLSearchParams({ grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirect, resource: `${origin}/mcp` });
  if (clientAuthMethod === 'client_secret_basic') {
    tokenHeaders.Authorization = `Basic ${Buffer.from(`skillpilot-gemini-poc:${clientSecret}`).toString('base64')}`;
  } else {
    tokenBody.set('client_id', 'skillpilot-gemini-poc');
    tokenBody.set('client_secret', clientSecret);
  }
  const tokenResponse = await fetch(`${origin}/token`, { method: 'POST',
    headers: tokenHeaders, body: tokenBody });
  assert.equal(tokenResponse.status, 200);
  const token = (await tokenResponse.json()).access_token;
  await client.connect(new StreamableHTTPClientTransport(new URL(`${origin}/mcp`), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
    fetch: async (url, init) => {
      const response = await fetch(url, init);
      if (typeof init?.body === 'string' && JSON.parse(init.body).method === 'initialize') {
        negotiatedProtocolVersion = (await response.clone().json()).result?.protocolVersion;
      }
      return response;
    }
  }));
  const listed = await client.listTools();
  assert.equal(listed.tools.length, 3);
  const sessionResponse = await fetch(`${operatorOrigin}/operator/sessions`, { method: 'POST',
    headers: { Authorization: `Bearer ${operatorKey}`, 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(sessionResponse.status, 201);
  const { probeSessionId } = await sessionResponse.json();
  const read = async () => (await client.callTool({ name: 'get_skillpilot_poc_context', arguments: { probeSessionId } })).structuredContent;
  const before = await read();
  assert.equal(before.completed, false);
  const completionArgs = { probeSessionId, completionCapability: before.completionCapability };
  const write = async () => (await client.callTool({ name: 'record_skillpilot_poc_completion', arguments: completionArgs })).structuredContent;
  const receipt = await write();
  assert.equal(receipt.saved, true);
  assert.equal(receipt.stateVersion, 1);
  assert.deepEqual(await write(), receipt);
  const after = await read();
  assert.equal(after.completed, true);
  assert.equal(after.stateVersion, 1);
  const persisted = JSON.parse(await readFile(join(dataDir, 'probe-state.json'), 'utf8'));
  assert.equal(persisted.sessions[createHash('sha256').update(probeSessionId).digest('hex')].receipt.stateVersion, 1);
  if (remote) {
    const lines = (await readFile(join(dataDir, 'events.jsonl'), 'utf8')).trim().split('\n').filter(Boolean);
    events.push(...lines.map(line => JSON.parse(line)));
    const operatorBlocked = await fetch(`${origin}/operator/sessions`, { method: 'POST' });
    assert.equal(operatorBlocked.status, 404, 'Public proxy must not expose operator session creation');
  }
  const trace = JSON.stringify(events);
  for (const value of [operatorKey, clientSecret, token, probeSessionId, before.completionCapability]) assert.ok(!trace.includes(value));
  const report = {
    observedAt: new Date().toISOString(), executor: remote ? 'automated-mcp-client-over-public-https' : 'local-automated-mcp-client', actualGeminiHost: false,
    status: remote ? 'PASS_HTTPS_ONLY' : 'PASS_LOCAL_ONLY', protocolVersion: negotiatedProtocolVersion, sdkVersion: '1.30.0',
    checks: ['401 discovery', 'resource metadata', 'explicit OAuth consent', 'S256 code exchange', 'SDK MCP initialize/discovery', 'independent temporary probe session', 'persisted synthetic marker', 'idempotent exact replay', 'later context', 'redacted trace'],
    ...(remote ? { origin, publicOperatorEndpoint: 'BLOCKED' } : {}),
    stateVersionBefore: before.stateVersion, stateVersionAfter: after.stateVersion,
    trace: events
  };
  await mkdir(reportDir, { recursive: true, mode: 0o700 });
  const evidenceFile = join(reportDir, remote ? 'https-smoke.json' : 'local-smoke.json');
  await writeFile(evidenceFile, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  console.log(JSON.stringify({ ...report, trace: undefined, evidenceFile }, null, 2));
} finally {
  await client.close().catch(() => {});
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  if (!remote) await rm(dataDir, { recursive: true, force: true });
}
