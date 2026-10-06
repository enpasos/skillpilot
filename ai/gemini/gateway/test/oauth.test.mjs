// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { createGeminiOAuth } from '../server/oauth.mjs';

const CLIENT_ID = 'skillpilot-gemini-beta';
const CLIENT_SECRET = 'synthetic-unit-test-client-secret';
const OPERATOR_KEY = 'synthetic-unit-test-operator-key';
const REDIRECT = 'https://example.test/oauth/callback';
const VERIFIER = 'synthetic-pkce-verifier-0123456789-abcdefghijklm';
const challenge = value => createHash('sha256').update(value).digest('base64url');

async function fixture(t, options = {}) {
  let timestamp = Date.now();
  const events = [];
  const app = express();
  const server = createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const oauth = createGeminiOAuth({ origin, operatorKey: OPERATOR_KEY, clientSecret: CLIENT_SECRET,
    clientAuthMethod: 'client_secret_basic', redirectUris: [REDIRECT], now: () => timestamp, audit: event => events.push(event), ...options });
  app.use(oauth.router);
  const request = (path, init) => fetch(`${origin}${path}`, { redirect: 'manual', ...init });
  const form = (path, values, init = {}) => request(path, { method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...init.headers },
    body: new URLSearchParams(values), ...init });
  const basic = (id = CLIENT_ID, secret = CLIENT_SECRET) => ({ Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}` });
  const authorize = (overrides = {}) => request(`/authorize?${new URLSearchParams({
    client_id: CLIENT_ID, redirect_uri: REDIRECT, response_type: 'code',
    code_challenge: challenge(VERIFIER), code_challenge_method: 'S256', state: 'synthetic-state-012345',
    scope: 'skillpilot.read skillpilot.write', resource: oauth.resource, ...overrides,
  })}`);
  const consent = async (overrides = {}) => {
    const response = await authorize(overrides);
    assert.equal(response.status, 200);
    const html = await response.text();
    const nonce = html.match(/name="nonce" value="([^"]+)"/)[1];
    const accepted = await form('/consent', { nonce, operator_key: OPERATOR_KEY, decision: 'allow' },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: origin, Accept: '*/*' } });
    assert.equal(accepted.status, 302);
    const location = new URL(accepted.headers.get('Location'));
    assert.equal(location.searchParams.get('state'), overrides.state ?? 'synthetic-state-012345');
    return location.searchParams.get('code');
  };
  const exchange = async (code, overrides = {}, credentials = basic()) => form('/token', {
    grant_type: 'authorization_code', code, code_verifier: VERIFIER,
    redirect_uri: REDIRECT, resource: oauth.resource, ...overrides,
  }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...credentials } });
  const tokens = async () => {
    const response = await exchange(await consent());
    assert.equal(response.status, 200, await response.clone().text());
    return response.json();
  };
  return { oauth, origin, events, request, form, basic, authorize, consent, exchange, tokens,
    advance: milliseconds => { timestamp += milliseconds; } };
}

test('configuration requires supplied secrets, exact callbacks and a safe isolated origin', () => {
  const config = { origin: 'https://synthetic.example.test', clientSecret: CLIENT_SECRET, operatorKey: OPERATOR_KEY };
  assert.throws(() => createGeminiOAuth({ ...config, clientSecret: undefined }), /clientSecret/);
  assert.throws(() => createGeminiOAuth({ ...config, operatorKey: undefined }), /operatorKey/);
  assert.throws(() => createGeminiOAuth({ ...config, origin: 'http://public.example.test' }), /HTTPS/);
  assert.throws(() => createGeminiOAuth({ ...config, origin: 'https://user:secret@example.test' }), /credentials/);
  assert.throws(() => createGeminiOAuth({ ...config, origin: 'https://example.test/path' }), /path/);
  assert.throws(() => createGeminiOAuth({ ...config, allowDcr: true }), /allowlist/);
  assert.throws(() => createGeminiOAuth({ ...config, allowPublicClients: true }), /DCR/);
  for (const clientAuthMethod of ['none', 'client_secret_jwt', null]) {
    assert.throws(() => createGeminiOAuth({ ...config, clientAuthMethod }), /clientAuthMethod/);
  }
  for (const allowRefreshResourceOmission of ['1', null]) {
    assert.throws(() => createGeminiOAuth({ ...config, allowRefreshResourceOmission }), /allowRefreshResourceOmission/);
  }
  assert.throws(() => createGeminiOAuth({ ...config, redirectUris: ['http://public.example.test/callback'] }), /HTTPS/);
});

test('SDK metadata advertises the exact MCP audience and implemented OAuth capabilities', async t => {
  const f = await fixture(t);
  const prm = await (await f.request('/.well-known/oauth-protected-resource/mcp')).json();
  assert.equal(prm.resource, f.oauth.resource);
  assert.deepEqual(prm.scopes_supported, ['skillpilot.read', 'skillpilot.write']);
  const metadata = await (await f.request('/.well-known/oauth-authorization-server')).json();
  assert.equal(metadata.authorization_endpoint, `${f.origin}/authorize`);
  assert.deepEqual(metadata.code_challenge_methods_supported, ['S256']);
  assert.deepEqual(metadata.token_endpoint_auth_methods_supported, ['client_secret_basic']);
  assert.deepEqual(metadata.revocation_endpoint_auth_methods_supported, ['client_secret_basic']);
  assert.equal(metadata.registration_endpoint, undefined);
});

test('authentication audit exposes only bounded method and credential-match facts', async t => {
  const f = await fixture(t);
  const code = await f.consent();
  const privateInput = 'NEVER_LOG_CLIENT_OR_SECRET_7353ea65';
  for (const [overrides, credentials] of [
    [{ client_id: CLIENT_ID, client_secret: CLIENT_SECRET }, {}],
    [{ client_id: privateInput, client_secret: privateInput }, {}],
    [{}, f.basic(CLIENT_ID, privateInput)]
  ]) {
    assert.equal((await f.exchange(code, overrides, credentials)).status, 400);
  }
  assert.deepEqual(f.events.filter(event => event.event === 'oauth.client_auth_rejected'), [
    { event: 'oauth.client_auth_rejected', observedAuthMethod: 'client_secret_post', configuredAuthMethod: 'client_secret_basic', clientKnown: true, secretMatches: true },
    { event: 'oauth.client_auth_rejected', observedAuthMethod: 'client_secret_post', configuredAuthMethod: 'unknown', clientKnown: false, secretMatches: false },
    { event: 'oauth.client_auth_rejected', observedAuthMethod: 'client_secret_basic', configuredAuthMethod: 'client_secret_basic', clientKnown: true, secretMatches: false }
  ]);
  assert.equal((await f.exchange(code)).status, 200);
  assert.deepEqual(f.events.filter(event => event.event === 'oauth.client_auth_accepted'), [
    { event: 'oauth.client_auth_accepted', authMethod: 'client_secret_basic' }
  ]);
  for (const value of [privateInput, CLIENT_ID, CLIENT_SECRET, code]) {
    assert.equal(JSON.stringify(f.events).includes(value), false);
  }
});

test('an explicit fixed Post client completes S256 but never falls back to Basic', async t => {
  const f = await fixture(t, { clientAuthMethod: 'client_secret_post' });
  const metadata = await (await f.request('/.well-known/oauth-authorization-server')).json();
  assert.deepEqual(metadata.token_endpoint_auth_methods_supported, ['client_secret_post']);
  assert.deepEqual(metadata.revocation_endpoint_auth_methods_supported, ['client_secret_post']);
  const code = await f.consent();
  assert.equal((await f.exchange(code)).status, 400, 'the correct secret through Basic must not authenticate a Post client');
  assert.deepEqual(f.events.find(event => event.event === 'oauth.client_auth_rejected'), {
    event: 'oauth.client_auth_rejected', observedAuthMethod: 'client_secret_basic',
    configuredAuthMethod: 'client_secret_post', clientKnown: true, secretMatches: true
  });
  const credentials = { client_id: CLIENT_ID, client_secret: CLIENT_SECRET };
  assert.equal((await f.exchange(code, { ...credentials, code_verifier: `${VERIFIER}wrong` }, {})).status, 400);
  const exchanged = await f.exchange(code, credentials, {});
  assert.equal(exchanged.status, 200);
  const tokens = await exchanged.json();
  const verified = await f.oauth.verifyAccessToken(tokens.access_token);
  assert.equal(verified.clientId, CLIENT_ID);
  assert.equal(verified.resource.href, f.oauth.resource);
  const refreshed = await f.form('/token', {
    grant_type: 'refresh_token', refresh_token: tokens.refresh_token, resource: f.oauth.resource, ...credentials
  });
  assert.equal(refreshed.status, 200);
  const renewal = await refreshed.json();
  assert.equal((await f.form('/revoke', { token: renewal.refresh_token }, { headers: {
    'Content-Type': 'application/x-www-form-urlencoded', ...f.basic()
  } })).status, 400);
  await f.oauth.verifyAccessToken(renewal.access_token);
  assert.equal((await f.form('/revoke', { token: renewal.refresh_token, ...credentials })).status, 200);
  await assert.rejects(f.oauth.verifyAccessToken(renewal.access_token));
  for (const value of [CLIENT_ID, CLIENT_SECRET, code, tokens.access_token, tokens.refresh_token, renewal.access_token, renewal.refresh_token]) {
    assert.equal(JSON.stringify(f.events).includes(value), false);
  }
});

test('grant diagnostics distinguish bounded refresh failures and SDK errors without logging input', async t => {
  const f = await fixture(t, { clientAuthMethod: 'client_secret_post' });
  const credentials = { client_id: CLIENT_ID, client_secret: CLIENT_SECRET };
  const code = await f.consent();
  const exchanged = await f.exchange(code, credentials, {});
  assert.equal(exchanged.status, 200);
  const tokens = await exchanged.json();
  f.events.length = 0;
  const privateInput = 'NEVER_LOG_GRANT_OR_TOKEN_92d26034';
  const privateResource = `https://other.test/mcp?private=${privateInput}`;
  const refresh = overrides => f.form('/token', {
    grant_type: 'refresh_token', refresh_token: tokens.refresh_token, ...credentials, ...overrides
  });
  for (const [overrides, error] of [
    [{}, 'invalid_grant'],
    [{ resource: '' }, 'invalid_grant'],
    [{ resource: privateResource }, 'invalid_grant'],
    [{ resource: f.oauth.resource, scope: '' }, 'invalid_scope'],
    [{ resource: f.oauth.resource, refresh_token: privateInput }, 'invalid_grant'],
    [{ resource: f.oauth.resource, grant_type: privateInput }, 'unsupported_grant_type']
  ]) {
    const response = await refresh(overrides);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, error);
  }
  const renewed = await refresh({ resource: f.oauth.resource });
  assert.equal(renewed.status, 200, 'omitting scope alone must continue to preserve the original granted scope');
  const renewal = await renewed.json();
  assert.equal(renewal.scope, 'skillpilot.read skillpilot.write');
  assert.deepEqual((await f.oauth.verifyAccessToken(renewal.access_token)).scopes, ['skillpilot.read', 'skillpilot.write']);
  const replayed = await refresh({ resource: f.oauth.resource });
  assert.equal(replayed.status, 400);
  assert.equal((await replayed.json()).error, 'invalid_grant');
  await assert.rejects(f.oauth.verifyAccessToken(renewal.access_token));
  assert.deepEqual(f.events.filter(event => event.event === 'oauth.grant_request'), [
    { event: 'oauth.grant_request', grantType: 'refresh_token', resourcePresence: 'absent' },
    { event: 'oauth.grant_request', grantType: 'refresh_token', resourcePresence: 'empty' },
    ...Array.from({ length: 3 }, () => ({ event: 'oauth.grant_request', grantType: 'refresh_token', resourcePresence: 'present' })),
    { event: 'oauth.grant_request', grantType: 'other', resourcePresence: 'present' },
    ...Array.from({ length: 2 }, () => ({ event: 'oauth.grant_request', grantType: 'refresh_token', resourcePresence: 'present' }))
  ]);
  assert.deepEqual(f.events.filter(event => event.event === 'oauth.grant_rejected'), [
    { event: 'oauth.grant_rejected', grantType: 'refresh_token', error: 'invalid_grant', reason: 'resource_missing' },
    { event: 'oauth.grant_rejected', grantType: 'refresh_token', error: 'invalid_grant', reason: 'resource_empty' },
    { event: 'oauth.grant_rejected', grantType: 'refresh_token', error: 'invalid_grant', reason: 'resource_mismatch' },
    { event: 'oauth.grant_rejected', grantType: 'refresh_token', error: 'invalid_scope', reason: 'scope_mismatch' },
    { event: 'oauth.grant_rejected', grantType: 'refresh_token', error: 'invalid_grant', reason: 'refresh_unknown_or_expired' },
    { event: 'oauth.grant_rejected', grantType: 'refresh_token', error: 'invalid_grant', reason: 'refresh_reuse' }
  ]);
  assert.deepEqual(f.events.filter(event => event.event === 'oauth.grant_result'), [
    ...['invalid_grant', 'invalid_grant', 'invalid_grant', 'invalid_scope', 'invalid_grant'].map(error =>
      ({ event: 'oauth.grant_result', grantType: 'refresh_token', status: 400, error })),
    { event: 'oauth.grant_result', grantType: 'other', status: 400, error: 'unsupported_grant_type' },
    { event: 'oauth.grant_result', grantType: 'refresh_token', status: 200 },
    { event: 'oauth.grant_result', grantType: 'refresh_token', status: 400, error: 'invalid_grant' }
  ]);
  for (const value of [privateInput, privateResource, CLIENT_ID, CLIENT_SECRET, code, tokens.access_token, tokens.refresh_token, renewal.access_token, renewal.refresh_token]) {
    assert.equal(JSON.stringify(f.events).includes(value), false);
  }
});

test('refresh resource omission is an explicit audience-bound opt-in with unchanged lifecycle guards', async t => {
  const f = await fixture(t, { clientAuthMethod: 'client_secret_post', allowRefreshResourceOmission: true, allowDcr: true });
  const credentials = { client_id: CLIENT_ID, client_secret: CLIENT_SECRET };
  const createGrant = async () => {
    const exchanged = await f.exchange(await f.consent(), credentials, {});
    assert.equal(exchanged.status, 200);
    return exchanged.json();
  };
  const refresh = (token, overrides = {}, client = credentials) => f.form('/token', {
    grant_type: 'refresh_token', refresh_token: token, ...client, ...overrides
  });
  const invalidAuthorize = await f.authorize({ resource: 'https://other.test/mcp' });
  assert.equal(invalidAuthorize.status, 302);
  assert.equal(new URL(invalidAuthorize.headers.get('Location')).searchParams.get('error'), 'invalid_request');
  const code = await f.consent();
  const missingCodeResource = await f.form('/token', {
    grant_type: 'authorization_code', code, code_verifier: VERIFIER, redirect_uri: REDIRECT, ...credentials
  });
  assert.equal(missingCodeResource.status, 400, 'the flag must not relax authorization-code resource binding');
  assert.equal((await missingCodeResource.json()).error, 'invalid_grant');
  const exchanged = await f.exchange(code, credentials, {});
  assert.equal(exchanged.status, 200);
  const tokens = await exchanged.json();
  const privateInput = 'NEVER_LOG_BAD_REFRESH_RESOURCE_b10a8a8a';
  for (const supplied of ['', ' ', `not-a-url-${privateInput}`, `https://other.test/mcp?private=${privateInput}`]) {
    const denied = await refresh(tokens.refresh_token, { resource: supplied });
    assert.equal(denied.status, 400);
    assert.equal((await denied.json()).error, 'invalid_grant');
  }
  const duplicate = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: tokens.refresh_token, ...credentials });
  duplicate.append('resource', f.oauth.resource);
  duplicate.append('resource', f.oauth.resource);
  assert.equal((await f.form('/token', duplicate)).status, 400, 'even identical duplicate resources must not be treated as omission');
  const badScope = await refresh(tokens.refresh_token, { scope: 'production:write' });
  assert.equal(badScope.status, 400);
  assert.equal((await badScope.json()).error, 'invalid_scope');
  assert.equal((await refresh(privateInput)).status, 400);
  const registered = await f.request('/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirect_uris: [REDIRECT], token_endpoint_auth_method: 'client_secret_post' }) });
  assert.equal(registered.status, 201);
  const foreign = await registered.json();
  assert.equal((await refresh(tokens.refresh_token, {}, { client_id: foreign.client_id, client_secret: foreign.client_secret })).status, 400);
  assert.equal(f.events.some(event => event.event === 'oauth.refresh_resource_omission_accepted'), false,
    'no failed request may inherit the original audience');
  await f.oauth.verifyAccessToken(tokens.access_token);
  const renewed = await refresh(tokens.refresh_token);
  assert.equal(renewed.status, 200);
  const renewal = await renewed.json();
  assert.equal(renewal.scope, 'skillpilot.read skillpilot.write');
  assert.equal((await f.oauth.verifyAccessToken(renewal.access_token)).resource.href, f.oauth.resource);
  assert.deepEqual(f.events.filter(event => event.event === 'oauth.refresh_resource_omission_accepted'), [
    { event: 'oauth.refresh_resource_omission_accepted', grantType: 'refresh_token' }
  ]);
  const replayed = await refresh(tokens.refresh_token);
  assert.equal(replayed.status, 400);
  assert.equal((await replayed.json()).error, 'invalid_grant');
  assert.ok(f.events.some(event => event.event === 'oauth.grant_rejected' && event.reason === 'refresh_reuse'));
  await assert.rejects(f.oauth.verifyAccessToken(renewal.access_token));
  assert.equal((await refresh(renewal.refresh_token)).status, 400);
  const revokedGrant = await createGrant();
  assert.equal((await f.form('/revoke', { token: revokedGrant.refresh_token, ...credentials })).status, 200);
  await assert.rejects(f.oauth.verifyAccessToken(revokedGrant.access_token));
  assert.equal((await refresh(revokedGrant.refresh_token)).status, 400,
    'an omitted resource must not recover a revoked grant');
  const lifetime = await createGrant();
  f.advance(3_599_000);
  const nearExpiry = await refresh(lifetime.refresh_token);
  assert.equal(nearExpiry.status, 200);
  const finalRenewal = await nearExpiry.json();
  f.advance(1_001);
  await assert.rejects(f.oauth.verifyAccessToken(finalRenewal.access_token), /expired/);
  assert.equal((await refresh(finalRenewal.refresh_token)).status, 400,
    'refreshing must not extend the original one-hour grant lifetime');
  const reasons = f.events.filter(event => event.event === 'oauth.grant_rejected').map(event => event.reason);
  for (const reason of ['resource_missing', 'resource_empty', 'resource_invalid', 'resource_mismatch', 'resource_duplicate', 'scope_mismatch', 'refresh_unknown_or_expired', 'refresh_client_mismatch', 'refresh_reuse']) {
    assert.ok(reasons.includes(reason), reason);
  }
  for (const value of [privateInput, CLIENT_ID, CLIENT_SECRET, code, tokens.access_token, tokens.refresh_token, foreign.client_id, foreign.client_secret, renewal.access_token, renewal.refresh_token, finalRenewal.access_token, finalRenewal.refresh_token]) {
    assert.equal(JSON.stringify(f.events).includes(value), false);
  }
});

test('authorization requires explicit operator consent and single-use expiring nonce', async t => {
  const f = await fixture(t);
  const response = await f.authorize();
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('Content-Security-Policy').includes("frame-ancestors 'none'"));
  assert.equal(response.headers.get('Referrer-Policy'), 'strict-origin');
  assert.ok(!html.includes(OPERATOR_KEY));
  const nonce = html.match(/name="nonce" value="([^"]+)"/)[1];
  assert.equal((await f.form('/consent', { nonce, operator_key: 'wrong', decision: 'allow' })).status, 403);
  assert.equal((await f.form('/consent', { nonce, operator_key: OPERATOR_KEY, decision: 'allow' },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://attacker.test' } })).status, 403);
  assert.equal((await f.form('/consent', { nonce, operator_key: OPERATOR_KEY, decision: 'allow' },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'null' } })).status, 403);
  const rejected = await f.form('/consent', { nonce, operator_key: OPERATOR_KEY, decision: 'deny' });
  assert.equal(new URL(rejected.headers.get('Location')).searchParams.get('error'), 'access_denied');
  assert.equal((await f.form('/consent', { nonce, operator_key: OPERATOR_KEY, decision: 'allow' })).status, 403);
  const second = (await (await f.authorize()).text()).match(/name="nonce" value="([^"]+)"/)[1];
  f.advance(300_001);
  assert.equal((await f.form('/consent', { nonce: second, operator_key: OPERATOR_KEY, decision: 'allow' })).status, 403);
});

test('consent form CSP permits only same-origin form submissions', async t => {
  const selected = 'https://callback.example.test:8443/synthetic/oauth/callback?private=never-in-csp';
  const f = await fixture(t, { redirectUris: [REDIRECT, selected] });
  const response = await f.authorize({ redirect_uri: selected });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Security-Policy'),
    "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    'the consent form itself must not grant navigation to callback or other provider origins');
  const unpinned = await f.authorize({ redirect_uri: 'https://unknown.example.test/callback' });
  assert.equal(unpinned.status, 400);
  assert.equal(unpinned.headers.get('Content-Security-Policy'), null,
    'an unpinned origin must never receive a consent page or become an allowed form destination');
});

test('explicit HTML consent hands off through one escaped pinned callback link with the same OAuth guards', async t => {
  const f = await fixture(t);
  const state = 'synthetic-html-state-&+"\'<callback>';
  const invalidScope = await f.authorize({ state, scope: 'production:write' });
  assert.equal(invalidScope.status, 302);
  assert.equal(new URL(invalidScope.headers.get('Location')).searchParams.get('error'), 'invalid_scope');
  assert.equal(f.events.filter(event => event.event === 'oauth.consent_requested').length, 0);
  const response = await f.authorize({ state });
  assert.equal(response.status, 200);
  const nonce = (await response.text()).match(/name="nonce" value="([^"]+)"/)[1];
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Origin: f.origin, Accept: 'text/html,application/xhtml+xml;q=0.9'
  };
  for (const [values, origin] of [
    [{ nonce: 'invalid', operator_key: OPERATOR_KEY, decision: 'allow' }, f.origin],
    [{ nonce, operator_key: 'wrong', decision: 'allow' }, f.origin],
    [{ nonce, operator_key: OPERATOR_KEY, decision: 'allow' }, 'null'],
    [{ nonce, operator_key: OPERATOR_KEY, decision: 'allow' }, 'https://attacker.test']
  ]) {
    const denied = await f.form('/consent', values, { headers: { ...headers, Origin: origin } });
    assert.equal(denied.status, 403);
    assert.equal((await denied.json()).error, 'access_denied');
  }
  const handoff = await f.form('/consent', { nonce, operator_key: OPERATOR_KEY, decision: 'allow' }, { headers });
  assert.equal(handoff.status, 200);
  assert.match(handoff.headers.get('Content-Type'), /^text\/html/);
  assert.equal(handoff.headers.get('Location'), null);
  assert.equal(handoff.headers.get('Cache-Control'), 'no-store');
  assert.equal(handoff.headers.get('Referrer-Policy'), 'no-referrer');
  assert.equal(handoff.headers.get('Content-Security-Policy'),
    "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  const html = await handoff.text();
  assert.equal([...html.matchAll(/<a\s/g)].length, 1);
  const escapedHref = html.match(/<a href="([^"]+)" rel="noreferrer noopener">Weiter zu Gemini<\/a>/)[1];
  assert.ok(escapedHref.includes('&amp;'), 'callback query separators must be escaped for HTML');
  assert.equal(html.includes(state), false, 'state markup must not enter the HTML as raw content');
  assert.equal(html.includes(OPERATOR_KEY), false);
  assert.equal(html.includes(nonce), false);
  const callback = new URL(escapedHref.replaceAll('&amp;', '&'));
  assert.equal(callback.origin + callback.pathname, REDIRECT);
  assert.equal(callback.protocol, 'https:');
  assert.equal(callback.searchParams.get('state'), state);
  const code = callback.searchParams.get('code');
  assert.ok(code);
  assert.equal((await f.exchange(code, { code_verifier: `${VERIFIER}wrong` })).status, 400);
  const tokenResponse = await f.exchange(code);
  assert.equal(tokenResponse.status, 200);
  const tokens = await tokenResponse.json();
  assert.equal((await f.oauth.verifyAccessToken(tokens.access_token)).resource.href, f.oauth.resource);
  assert.equal((await f.form('/consent', { nonce, operator_key: OPERATOR_KEY, decision: 'allow' }, { headers })).status, 403);
  for (const secret of [state, code, tokens.access_token, tokens.refresh_token]) {
    assert.equal(JSON.stringify(f.events).includes(secret), false);
  }
});

test('exact redirect pin rejects loopback-port relaxation and records redacted discovery only', async t => {
  const pinned = 'http://127.0.0.1:44123/callback';
  const f = await fixture(t, { redirectUris: [pinned] });
  const attempted = 'http://127.0.0.1:44124/callback?token=never-log-this';
  const response = await f.authorize({ redirect_uri: attempted });
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('Location'), null);
  assert.equal(f.events[0].event, 'oauth.callback_not_configured');
  assert.equal(f.events[0].callbackOrigin, 'http://127.0.0.1:44124');
  assert.ok(!JSON.stringify(f.events).includes('never-log-this'));
  assert.ok(!JSON.stringify(f.events).includes('/callback'));
});

test('S256, scope, audience and state are mandatory before consent', async t => {
  const f = await fixture(t);
  for (const invalid of [
    { code_challenge_method: 'plain' }, { code_challenge: 'bad' }, { scope: 'production:write' },
    { resource: 'https://other.example.test/mcp' }, { resource: '' }, { state: '' },
  ]) {
    const response = await f.authorize(invalid);
    assert.equal(response.status, 302);
    assert.ok(new URL(response.headers.get('Location')).searchParams.has('error'));
  }
  assert.equal(f.events.filter(event => event.event === 'oauth.consent_requested').length, 0);
});

test('host-sized OAuth state survives consent unchanged with a finite 4096-character bound', async t => {
  const f = await fixture(t);
  for (const length of [1168, 4096]) {
    const state = `synthetic-state-&+?%/=${'x'.repeat(length)}`.slice(0, length);
    assert.equal(state.length, length);
    const code = await f.consent({ state });
    assert.equal((await f.exchange(code)).status, 200);
    assert.equal(JSON.stringify(f.events).includes(state), false,
      'the state is preserved only in the OAuth callback, not copied into audit records');
  }
  const consentRequests = f.events.filter(event => event.event === 'oauth.consent_requested').length;
  const response = await f.authorize({ state: 'x'.repeat(4097) });
  assert.equal(response.status, 302);
  const rejected = new URL(response.headers.get('Location'));
  assert.equal(rejected.searchParams.get('error'), 'invalid_request');
  assert.equal(rejected.searchParams.get('code'), null);
  assert.equal(f.events.filter(event => event.event === 'oauth.consent_requested').length, consentRequests,
    'an oversized state must be rejected before consent can be issued');
});

test('code exchange enforces PKCE, client, audience, redirect and single use', async t => {
  const f = await fixture(t);
  const code = await f.consent();
  for (const invalid of [
    { code_verifier: `${VERIFIER}wrong` }, { code_verifier: 'too-short' }, { redirect_uri: 'https://other.test/callback' },
    { resource: 'https://other.test/mcp' }, { resource: '' },
  ]) {
    const response = await f.exchange(code, invalid);
    assert.equal(response.status, 400);
    assert.ok(['invalid_grant', 'invalid_request'].includes((await response.json()).error));
  }
  assert.equal((await f.exchange(code, {}, f.basic(CLIENT_ID, 'wrong-secret'))).status, 400);
  assert.equal((await f.exchange(code, {}, f.basic('wrong-client'))).status, 400);
  // Fixed advanced-feature client is Basic; credential method fallback is prohibited.
  const posted = await f.exchange(code, { client_id: CLIENT_ID, client_secret: CLIENT_SECRET }, {});
  assert.equal((await posted.json()).error, 'invalid_client');
  const success = await f.exchange(code);
  assert.equal(success.status, 200);
  const tokens = await success.json();
  const verified = await f.oauth.verifyAccessToken(tokens.access_token);
  assert.equal(verified.resource.href, f.oauth.resource);
  assert.deepEqual(verified.scopes, ['skillpilot.read', 'skillpilot.write']);
  assert.equal(verified.clientId, CLIENT_ID);
  assert.equal((await f.exchange(code)).status, 400);
  const privateLog = JSON.stringify(f.events);
  for (const forbidden of [code, tokens.access_token, tokens.refresh_token, CLIENT_SECRET, OPERATOR_KEY, VERIFIER]) {
    assert.ok(!privateLog.includes(forbidden));
  }
});

test('code and access token TTLs expire without extending grant lifetime', async t => {
  const f = await fixture(t);
  const code = await f.consent();
  f.advance(120_001);
  assert.equal((await f.exchange(code)).status, 400);
  const tokens = await f.tokens();
  f.advance(300_001);
  await assert.rejects(f.oauth.verifyAccessToken(tokens.access_token), /expired/);
  const refreshed = await f.form('/token', { grant_type: 'refresh_token', refresh_token: tokens.refresh_token,
    resource: f.oauth.resource }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...f.basic() } });
  assert.equal(refreshed.status, 200);
  const next = await refreshed.json();
  f.advance(3_600_000);
  const expired = await f.form('/token', { grant_type: 'refresh_token', refresh_token: next.refresh_token,
    resource: f.oauth.resource }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...f.basic() } });
  assert.equal((await expired.json()).error, 'invalid_grant');
});

test('matching PKCE digest still rejects short or oversized verifiers', async t => {
  const f = await fixture(t);
  for (const verifier of ['short', 'a'.repeat(129)]) {
    const code = await f.consent({ code_challenge: challenge(verifier) });
    const response = await f.exchange(code, { code_verifier: verifier });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, 'invalid_grant');
  }
});

test('operator consent attempts are limited before secret or nonce validation', async t => {
  const f = await fixture(t);
  for (let count = 0; count < 60; count += 1) {
    assert.equal((await f.form('/consent', { nonce: 'invalid', operator_key: 'wrong', decision: 'allow' })).status, 403);
  }
  assert.equal((await f.form('/consent', { nonce: 'invalid', operator_key: 'wrong', decision: 'allow' })).status, 429);
  f.advance(60_001);
  assert.equal((await f.form('/consent', { nonce: 'invalid', operator_key: 'wrong', decision: 'allow' })).status, 403);
});

test('refresh requires the same audience and scope; rotation reuse revokes the whole grant', async t => {
  const f = await fixture(t);
  const original = await f.tokens();
  const refresh = (token, extra = {}, credentials = f.basic()) => f.form('/token', {
    grant_type: 'refresh_token', refresh_token: token, resource: f.oauth.resource, ...extra,
  }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...credentials } });
  assert.equal((await refresh(original.refresh_token, { resource: 'https://other.test/mcp' })).status, 400);
  assert.equal((await refresh(original.refresh_token, { scope: 'poc:probe production:write' })).status, 400);
  assert.equal((await refresh(original.refresh_token, {}, f.basic('different-client'))).status, 400);
  const response = await refresh(original.refresh_token);
  assert.equal(response.status, 200);
  const rotated = await response.json();
  assert.notEqual(rotated.refresh_token, original.refresh_token);
  await f.oauth.verifyAccessToken(rotated.access_token);
  assert.equal((await refresh(original.refresh_token)).status, 400);
  await assert.rejects(f.oauth.verifyAccessToken(rotated.access_token));
  await assert.rejects(f.oauth.verifyAccessToken(original.access_token));
  assert.equal((await refresh(rotated.refresh_token)).status, 400);
});

test('revocation is idempotent, client bound, and removes access plus refresh', async t => {
  const f = await fixture(t);
  const tokens = await f.tokens();
  const revoke = (token, credentials = f.basic()) => f.form('/revoke', { token },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...credentials } });
  assert.equal((await revoke(tokens.refresh_token, f.basic('other-client'))).status, 400);
  await f.oauth.verifyAccessToken(tokens.access_token);
  assert.equal((await revoke(tokens.refresh_token)).status, 200);
  assert.equal((await revoke(tokens.refresh_token)).status, 200);
  await assert.rejects(f.oauth.verifyAccessToken(tokens.access_token));
  assert.equal((await revoke('unknown-synthetic-token')).status, 200);
});

test('DCR is opt-in, bounded, exactly pinned, and public authentication needs separate opt-in', async t => {
  const f = await fixture(t, { allowDcr: true });
  const metadata = await (await f.request('/.well-known/oauth-authorization-server')).json();
  assert.deepEqual(metadata.token_endpoint_auth_methods_supported, ['client_secret_basic', 'client_secret_post']);
  const register = metadata => f.request('/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(metadata) });
  assert.equal((await register({ redirect_uris: ['https://unknown.test/callback?secret=hidden'] })).status, 400);
  assert.ok(!JSON.stringify(f.events).includes('hidden'));
  assert.equal((await register({ redirect_uris: [REDIRECT], token_endpoint_auth_method: 'none' })).status, 400);
  const response = await register({ redirect_uris: [REDIRECT], token_endpoint_auth_method: 'client_secret_post', scope: 'skillpilot.read skillpilot.write' });
  assert.equal(response.status, 201);
  const client = await response.json();
  const code = await f.consent({ client_id: client.client_id });
  // A valid second client's credentials still cannot redeem another client's code.
  assert.equal((await f.exchange(code)).status, 400);
  const result = await f.exchange(code, { client_id: client.client_id, client_secret: client.client_secret }, {});
  assert.equal(result.status, 200);
});

test('explicit public DCR works with S256 and has no client secret or confidential fallback', async t => {
  const f = await fixture(t, { allowDcr: true, allowPublicClients: true });
  const metadata = await (await f.request('/.well-known/oauth-authorization-server')).json();
  assert.deepEqual(metadata.token_endpoint_auth_methods_supported, ['client_secret_basic', 'client_secret_post', 'none']);
  const response = await f.request('/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirect_uris: [REDIRECT], token_endpoint_auth_method: 'none' }) });
  assert.equal(response.status, 201);
  const client = await response.json();
  assert.equal(client.client_secret, undefined);
  const code = await f.consent({ client_id: client.client_id });
  const tokens = await f.exchange(code, { client_id: client.client_id }, {});
  assert.equal(tokens.status, 200);
  assert.equal((await f.exchange(await f.consent(), { client_id: CLIENT_ID }, {})).status, 400);
});
