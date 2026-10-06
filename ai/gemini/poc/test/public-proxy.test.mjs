// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import test from 'node:test';
import { createPublicProxy } from '../server/public-proxy.mjs';

async function listen(t, server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

function rawRequest(origin, path, { method = 'GET', headers = {}, body = '' } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(origin);
    const outgoing = request({ hostname: url.hostname, port: url.port, path, method, headers }, incoming => {
      const chunks = [];
      incoming.on('data', chunk => chunks.push(chunk));
      incoming.on('end', () => resolve({ status: incoming.statusCode, headers: incoming.headers, body: Buffer.concat(chunks).toString() }));
      incoming.on('error', reject);
    });
    outgoing.on('error', reject);
    outgoing.end(body);
  });
}

test('upstream rejects public, credentialed, path-based or ambiguous destinations', () => {
  for (const upstream of [
    'https://skillpilot.com', 'http://127.0.0.1.evil.test:8793', 'http://127.0.0.2:8793',
    'http://user:secret@127.0.0.1:8793', 'http://127.0.0.1:8793/private',
    'http://127.0.0.1:8793?next=http://evil.test', 'http://127.0.0.1:8793#hidden',
    'file:///etc/passwd', 'http://2130706433:8793', 'http://127.1:8793',
  ]) assert.throws(() => createPublicProxy({ upstream }), /exact HTTP\(S\) loopback origin/);
  for (const upstream of ['http://127.0.0.1:8793', 'http://localhost:8793', 'http://[::1]:8793']) {
    createPublicProxy({ upstream }).close();
  }
});

test('public OAuth flow forwards exact query, credentials, body, headers and status without CORS injection', async t => {
  let observed;
  const upstream = await listen(t, createServer((req, res) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      observed = { method: req.method, url: req.url, authorization: req.headers.authorization,
        origin: req.headers.origin, body: Buffer.concat(chunks).toString() };
      res.writeHead(201, { 'Content-Type': 'application/json', 'X-Poc-Marker': 'forwarded', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ synthetic: true }));
    });
  }));
  const proxy = await listen(t, createPublicProxy({ upstream }));
  const path = '/token?synthetic=a%2Bb&repeat=1&repeat=2';
  const body = 'grant_type=authorization_code&code=synthetic%2Bcode';
  const response = await rawRequest(proxy, path, { method: 'POST', body, headers: {
    Authorization: 'Basic synthetic-credential', Origin: 'https://synthetic.test',
    'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body),
  } });
  assert.deepEqual(observed, { method: 'POST', url: path, authorization: 'Basic synthetic-credential', origin: 'https://synthetic.test', body });
  assert.equal(response.status, 201);
  assert.equal(response.headers['x-poc-marker'], 'forwarded');
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.headers['access-control-allow-origin'], undefined);
  assert.deepEqual(JSON.parse(response.body), { synthetic: true });
});

test('all public exact paths forward while operator/admin/encoded/unknown paths never reach upstream', async t => {
  let forwarded = 0;
  const upstream = await listen(t, createServer((_req, res) => { forwarded += 1; res.writeHead(204); res.end(); }));
  const proxy = await listen(t, createPublicProxy({ upstream }));
  for (const path of [
    '/health', '/mcp', '/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp',
    '/.well-known/oauth-authorization-server', '/authorize', '/consent', '/token', '/revoke', '/register',
  ]) assert.equal((await rawRequest(proxy, path)).status, 204);
  assert.equal(forwarded, 10);
  for (const path of [
    '/operator/sessions', '/operator/sessions?token=synthetic', '/operator', '/admin', '/unknown',
    '/mcp/', '//mcp', '/%6dcp', '/mcp/../operator/sessions', '/mcp%2f..%2foperator%2fsessions',
    '/mcp\\..\\operator\\sessions', '/.well-known/private', '/health?private=yes',
    '/mcp?private=yes', '/.well-known/oauth-authorization-server?private=yes',
    'http://evil.test/mcp',
  ]) assert.equal((await rawRequest(proxy, path)).status, 404, path);
  assert.equal(forwarded, 10);
});

test('upstream OAuth redirects and bearer challenges are preserved', async t => {
  const location = 'https://synthetic.test/callback?code=synthetic-code&state=synthetic-state';
  const upstream = await listen(t, createServer((req, res) => {
    if (req.url === '/authorize?state=synthetic-state') { res.writeHead(302, { Location: location }); res.end(); }
    else { res.writeHead(401, { 'WWW-Authenticate': 'Bearer resource_metadata="https://synthetic.test/.well-known/oauth-protected-resource/mcp"' }); res.end('synthetic challenge'); }
  }));
  const proxy = await listen(t, createPublicProxy({ upstream }));
  const redirect = await rawRequest(proxy, '/authorize?state=synthetic-state');
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.location, location);
  const challenge = await rawRequest(proxy, '/mcp');
  assert.equal(challenge.status, 401);
  assert.match(challenge.headers['www-authenticate'], /^Bearer resource_metadata=/);
  assert.equal(challenge.body, 'synthetic challenge');
});

test('unavailable upstream returns only a generic 502', async t => {
  const unavailable = createServer();
  await new Promise(resolve => unavailable.listen(0, '127.0.0.1', resolve));
  const upstream = `http://127.0.0.1:${unavailable.address().port}`;
  await new Promise(resolve => unavailable.close(resolve));
  const proxy = await listen(t, createPublicProxy({ upstream }));
  const response = await rawRequest(proxy, '/health');
  assert.equal(response.status, 502);
  assert.deepEqual(JSON.parse(response.body), { code: 'UPSTREAM_UNAVAILABLE' });
  assert.ok(!response.body.includes(upstream));
});
