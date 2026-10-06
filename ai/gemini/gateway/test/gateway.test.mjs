// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash, createHmac } from 'node:crypto';
import { createGatewayApp, nativeJsonResponse } from '../server/app.mjs';
import { createGatewayAssertion } from '../server/assertion.mjs';

const secret = 'gateway-test-independent-secret-123456789';
const result = { jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: 'ok' }], structuredContent: { stateVersion: 1 }, isError: false } };
test('native JSON and single SSE results preserve all MCP fields; malformed/multiple results fail', () => {
  assert.deepEqual(nativeJsonResponse(JSON.stringify(result), 'application/json'), result);
  assert.deepEqual(nativeJsonResponse(`event: message\ndata: ${JSON.stringify(result)}\n\n`, 'text/event-stream'), result);
  for (const value of ['{}', '[]', 'null', '{bad']) assert.throws(() => nativeJsonResponse(value, 'application/json'));
  assert.throws(() => nativeJsonResponse(`data: ${JSON.stringify(result)}\n\ndata: ${JSON.stringify(result)}\n\n`, 'text/event-stream'));
});
test('signed bridge assertion has own namespace, exact body/audience and random replay key', () => {
  const options = { secret, audience: 'https://gemini.example/mcp', connectionId: 'a'.repeat(64), scopes: ['skillpilot.read', 'skillpilot.write'], body: Buffer.from('{}'), now: () => 1000000 };
  const first = createGatewayAssertion(options), second = createGatewayAssertion(options);
  assert.notEqual(first, second);
  const [prefix, payload, signature] = first.split('.');
  assert.equal(prefix, 'sgw1'); assert.equal(signature, createHmac('sha256', secret).update(`${prefix}.${payload}`).digest('hex'));
  const claims = JSON.parse(Buffer.from(payload, 'base64url'));
  assert.equal(claims.exp - claims.iat, 30); assert.equal(claims.aud, options.audience);
  assert.equal(claims.body, createHash('sha256').update('{}').digest('hex'));
  assert.match(claims.sub, /^spga_[a-f0-9]{64}$/); assert.equal(claims.path, '/gemini/v1/mcp');
  assert.throws(() => createGatewayAssertion({ ...options, secret: 'short' }));
  assert.throws(() => createGatewayAssertion({ ...options, connectionId: 'permanent-learner-id' }));
});
async function fixture(t, response = () => new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } })) {
  const calls = [], events = [];
  const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`, redirect = 'https://example.test/callback';
  const app = createGatewayApp({ origin, operatorKey: 'operator-test-key-1234567890123456789', clientSecret: 'client-test-key-1234567890123456789', gatewaySecret: secret,
    redirectUris: [redirect], audit: event => events.push(event), fetchUpstream: async (url, init) => { calls.push({ url: url.href, ...init }); return response(); } });
  server.on('request', app);
  const request = (path, init = {}) => fetch(origin + path, { redirect: 'manual', ...init });
  const form = (path, values) => request(path, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(values) });
  const verifier = 'test-verifier-0123456789-abcdefghijklmnopqrstu';
  const authorize = await request('/authorize?' + new URLSearchParams({ client_id: 'skillpilot-gemini-beta', redirect_uri: redirect, response_type: 'code', resource: origin + '/mcp', scope: 'skillpilot.read skillpilot.write', state: 'test-state-123456789', code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url') }));
  const nonce = (await authorize.text()).match(/name="nonce" value="([^"]+)"/)[1];
  const consent = await form('/consent', { nonce, decision: 'allow', operator_key: 'operator-test-key-1234567890123456789' });
  const code = new URL(consent.headers.get('location')).searchParams.get('code');
  const tokens = await (await form('/token', { client_id: 'skillpilot-gemini-beta', client_secret: 'client-test-key-1234567890123456789', grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirect, resource: origin + '/mcp' })).json();
  assert.equal(typeof tokens.access_token, 'string');
  const post = (value, headers = {}) => request('/mcp', { method: 'POST', headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json', ...headers }, body: typeof value === 'string' ? value : JSON.stringify(value) });
  return { post, request, calls, events, token: tokens.access_token };
}
test('actual OAuth-authenticated native roundtrip keeps body but replaces all caller credentials', async t => {
  const f = await fixture(t); const rpc = { jsonrpc: '2.0', id: 1, method: 'tools/list' };
  const response = await f.post(rpc, { Cookie: 'private-cookie', 'X-Forwarded-For': '203.0.113.1' });
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), result);
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].url, 'http://127.0.0.1:8080/gemini/v1/mcp');
  assert.match(f.calls[0].headers.Authorization, /^Bearer sgw1\./);
  assert.equal(f.calls[0].headers.Cookie, undefined); assert.equal(f.calls[0].headers['X-Forwarded-For'], undefined);
  assert.equal(f.calls[0].body.toString(), JSON.stringify(rpc));
  assert.equal(JSON.stringify(f.events).includes(f.token), false);
});
test('invalid authentication, cross Origin, aliases, unsupported RPC and oversized bodies never reach backend', async t => {
  const f = await fixture(t); const rpc = { jsonrpc: '2.0', id: 1, method: 'tools/list' };
  assert.equal((await f.request('/mcp')).status, 401);
  assert.equal((await f.post(rpc, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await f.request('/mcp?x=1')).status, 404);
  assert.equal((await f.request('/operator/sessions')).status, 404);
  assert.equal((await f.post('{bad')).status, 400);
  assert.equal((await f.post({ ...rpc, method: 'unlisted' })).status, 400);
  assert.equal((await f.post(' '.repeat(65537))).status, 413);
  assert.equal(f.calls.length, 0);
});
test('failed/redirected/oversized upstream responses expose only bounded generic failure', async t => {
  for (const response of [() => new Response('private-error', { status: 500 }), () => new Response('x'.repeat(262145)), () => new Response('{}')]) {
    const f = await fixture(t, response); const actual = await f.post({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
    assert.equal(actual.status, 502); assert.equal((await actual.text()).includes('private-error'), false);
  }
});
