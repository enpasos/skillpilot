// SPDX-License-Identifier: Apache-2.0
// Isolated Gemini beta authorization. Each operator pins one confidential client and exact callbacks.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import express from 'express';
import { mcpAuthRouter, mcpAuthMetadataRouter, createOAuthMetadata } from '@modelcontextprotocol/sdk/server/auth/router.js';
import {
  InvalidClientMetadataError, InvalidGrantError, InvalidRequestError,
  InvalidScopeError, InvalidTokenError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';

const SCOPES = ['skillpilot.read', 'skillpilot.write'];
const SCOPE = SCOPES.join(' ');
const exactScopes = values => Array.isArray(values) && values.length === SCOPES.length && SCOPES.every(value => values.includes(value));
const CODE_TTL = 120_000;
const CONSENT_TTL = 300_000;
const ACCESS_TTL = 300_000;
const REFRESH_TTL = 3_600_000;
const MAX_PENDING = 200;
const MAX_CLIENTS = 50;
const MAX_FAMILIES = 200;
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]']);
const opaque = () => randomBytes(32).toString('base64url');
const digest = value => createHash('sha256').update(value).digest('hex');
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const equalSecret = (value, expected) => typeof value === 'string' && timingSafeEqual(Buffer.from(digest(value)), Buffer.from(digest(expected)));

function validateUrl(value, { originOnly = false } = {}) {
  let url;
  try { url = new URL(value); } catch { throw new Error('A valid absolute URL is required'); }
  if (url.username || url.password || url.hash ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOOPBACK.has(url.hostname)))) {
    throw new Error('Use HTTPS, or HTTP on an exact loopback host; credentials and fragments are forbidden');
  }
  if (originOnly && (url.pathname !== '/' || url.search)) throw new Error('The Gemini beta origin must not contain a path or query');
  return url;
}

function sendError(res, status, error, description) {
  res.set('Cache-Control', 'no-store').status(status).json({ error, error_description: description });
}

/**
 * Mount router at '/'. Secrets must be supplied by the Gemini beta operator.
 * Tokens and registrations disappear on restart; an actual host must reconnect.
 * DCR is opt-in and can only register exactly pinned redirects. No callback is guessed.
 */
export function createGeminiOAuth({
  origin, operatorKey, redirectUris = [], clientId = 'skillpilot-gemini-beta', clientSecret,
  clientAuthMethod = 'client_secret_post',
  allowRefreshResourceOmission = false,
  allowDcr = false, allowPublicClients = false, now = Date.now, audit = () => {},
} = {}) {
  const originUrl = validateUrl(origin, { originOnly: true });
  const baseOrigin = originUrl.origin;
  const resource = `${baseOrigin}/mcp`;
  if (typeof operatorKey !== 'string' || operatorKey.length < 16) throw new Error('A random operatorKey of at least 16 characters is required');
  if (typeof clientSecret !== 'string' || clientSecret.length < 16) throw new Error('A random clientSecret of at least 16 characters is required');
  if (typeof clientId !== 'string' || !/^[A-Za-z0-9._-]{1,100}$/.test(clientId)) throw new Error('Invalid Gemini beta clientId');
  if (!['client_secret_basic', 'client_secret_post'].includes(clientAuthMethod)) throw new Error('clientAuthMethod must be client_secret_basic or client_secret_post');
  if (typeof allowRefreshResourceOmission !== 'boolean') throw new Error('allowRefreshResourceOmission must be a boolean');
  if (!Array.isArray(redirectUris) || redirectUris.length > 10 || redirectUris.some(uri => typeof uri !== 'string' || uri.length > 2048)) {
    throw new Error('At most ten exact redirect URIs are supported');
  }
  for (const uri of redirectUris) validateUrl(uri);
  if (allowDcr && redirectUris.length === 0) throw new Error('DCR requires an explicit redirect allowlist');
  if (allowPublicClients && !allowDcr) throw new Error('Public clients require explicitly enabled pinned DCR');
  const allowedRedirects = new Set(redirectUris);
  const clients = new Map();
  const pending = new Map();
  const codes = new Map();
  const accessTokens = new Map();
  const refreshTokens = new Map();
  const families = new Map();
  const emit = (event, fields = {}) => audit({ event, ...fields });
  const seconds = milliseconds => Math.floor(milliseconds / 1000);

  function callbackDiscovery(uri, source) {
    if (typeof uri !== 'string') return;
    let callbackOrigin = 'invalid';
    try { callbackOrigin = new URL(uri).origin; } catch { /* No raw URL in logs. */ }
    emit('oauth.callback_not_configured', { source, callbackOrigin, callbackFingerprint: digest(uri), configured: false });
  }

  function removeFamily(familyId) {
    families.delete(familyId);
    for (const [key, value] of accessTokens) if (value.familyId === familyId) accessTokens.delete(key);
    for (const [key, value] of refreshTokens) if (value.familyId === familyId) refreshTokens.delete(key);
  }

  function purge() {
    const timestamp = now();
    for (const [key, value] of pending) if (value.expiresAt <= timestamp) pending.delete(key);
    for (const [key, value] of codes) if (value.expiresAt <= timestamp) codes.delete(key);
    for (const [key, value] of accessTokens) if (value.expiresAt <= timestamp) accessTokens.delete(key);
    for (const [key, value] of families) if (value.expiresAt <= timestamp) removeFamily(key);
  }

  clients.set(clientId, {
    client_id: clientId, client_secret: clientSecret, client_secret_expires_at: 0,
    client_id_issued_at: seconds(now()), client_name: 'SkillPilot Gemini Beta',
    redirect_uris: [...allowedRedirects], token_endpoint_auth_method: clientAuthMethod,
    grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'], scope: SCOPE,
  });

  const clientsStore = {
    async getClient(id) {
      const client = clients.get(id);
      return client ? structuredClone(client) : undefined;
    },
  };
  if (allowDcr) clientsStore.registerClient = async metadata => {
    if (clients.size >= MAX_CLIENTS) throw new InvalidClientMetadataError('Gemini beta registration limit reached');
    const method = metadata.token_endpoint_auth_method ?? 'client_secret_post';
    if (!['client_secret_basic', 'client_secret_post', ...(allowPublicClients ? ['none'] : [])].includes(method)) {
      throw new InvalidClientMetadataError('Unsupported client authentication method');
    }
    if (!Array.isArray(metadata.redirect_uris) || metadata.redirect_uris.length === 0 || metadata.redirect_uris.length > 10 ||
        metadata.redirect_uris.some(uri => !allowedRedirects.has(uri))) {
      for (const uri of metadata.redirect_uris ?? []) if (!allowedRedirects.has(uri)) callbackDiscovery(uri, 'register');
      throw new InvalidClientMetadataError('Redirect URI is not in the exact operator allowlist');
    }
    if (metadata.scope && metadata.scope !== SCOPE) throw new InvalidClientMetadataError('Only the configured Gemini scope set is available');
    if (metadata.grant_types?.some(value => !['authorization_code', 'refresh_token'].includes(value)) ||
        metadata.response_types?.some(value => value !== 'code')) throw new InvalidClientMetadataError('Unsupported grant or response type');
    const client = {
      client_id: metadata.client_id, client_id_issued_at: metadata.client_id_issued_at,
      ...(method === 'none' ? {} : { client_secret: metadata.client_secret, client_secret_expires_at: metadata.client_secret_expires_at }),
      client_name: 'Pinned Gemini beta client', redirect_uris: [...metadata.redirect_uris],
      token_endpoint_auth_method: method, scope: SCOPE,
      grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'],
    };
    clients.set(client.client_id, client);
    emit('oauth.client_registered', { authMethod: method, redirectCount: client.redirect_uris.length });
    return structuredClone(client);
  };

  function rejectGrant(grantType, error, reason) {
    emit('oauth.grant_rejected', { grantType, error: error.errorCode, reason });
    throw error;
  }
  function checkResource(requestedResource, grantType) {
    if (requestedResource?.href !== resource) rejectGrant(grantType,
      new InvalidGrantError('The exact Gemini beta resource parameter is required'),
      requestedResource === undefined ? 'resource_missing' : 'resource_mismatch');
  }
  function getCode(client, code) {
    purge();
    const entry = typeof code === 'string' ? codes.get(digest(code)) : undefined;
    if (!entry || entry.clientId !== client.client_id) rejectGrant('authorization_code',
      new InvalidGrantError('Invalid or expired authorization code'), entry ? 'code_client_mismatch' : 'code_unknown_or_expired');
    return entry;
  }
  function issueTokens(familyId, grantType) {
    const family = families.get(familyId);
    if (!family || family.expiresAt <= now()) rejectGrant(grantType, new InvalidGrantError('Expired grant'), 'grant_unknown_or_expired');
    const accessToken = opaque();
    const refreshToken = opaque();
    accessTokens.set(digest(accessToken), { familyId, expiresAt: now() + ACCESS_TTL });
    refreshTokens.set(digest(refreshToken), { familyId, consumed: false });
    return {
      access_token: accessToken, token_type: 'Bearer', expires_in: ACCESS_TTL / 1000,
      refresh_token: refreshToken, scope: SCOPE,
    };
  }

  const provider = {
    clientsStore,
    async authorize(client, params, res) {
      purge();
      if (!client.redirect_uris.includes(params.redirectUri) || !allowedRedirects.has(params.redirectUri)) {
        throw new InvalidRequestError('An exactly configured redirect URI is required');
      }
      if (params.resource?.href !== resource) throw new InvalidRequestError('The exact Gemini beta resource parameter is required');
      if (!exactScopes(params.scopes)) throw new InvalidScopeError('The exact configured Gemini scope set is required');
      if (!/^[A-Za-z0-9_-]{43}$/.test(params.codeChallenge)) throw new InvalidRequestError('A SHA-256 PKCE challenge is required');
      if (typeof params.state !== 'string' || params.state.length < 8 || params.state.length > 4096) throw new InvalidRequestError('A bounded OAuth state value is required');
      if (pending.size >= MAX_PENDING) throw new InvalidRequestError('Too many pending Gemini beta consent requests');
      const nonce = opaque();
      pending.set(digest(nonce), { ...params, clientId: client.client_id, expiresAt: now() + CONSENT_TTL });
      emit('oauth.consent_requested');
      res.set({
        'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
        'Referrer-Policy': 'strict-origin', 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-store',
      }).type('html').send(`<!doctype html><html lang="de"><meta charset="utf-8"><title>Gemini verbinden</title>
<h1>SkillPilot Gemini: Lernverbindung</h1>
<p>Gemini darf den SkillPilot-Lernkontext lesen und Lernfortschritt speichern. Die Verbindung wählt keine lernende Person: dafür wird eine getrennte, zeitlich begrenzte Lernsitzung aus „Lernen starten“ benötigt.</p>
<p>Ressource: ${escapeHtml(resource)}. Berechtigung: ${SCOPE}.</p>
<form method="post" action="/consent"><input type="hidden" name="nonce" value="${nonce}">
<label>Gemini-Beta-Verbindungsschlüssel <input type="password" name="operator_key" autocomplete="off" required></label>
<button name="decision" value="allow" type="submit">Lernverbindung freigeben</button>
<button name="decision" value="deny" type="submit">Ablehnen</button></form></html>`);
    },
    async challengeForAuthorizationCode(client, code) { return getCode(client, code).codeChallenge; },
    async exchangeAuthorizationCode(client, code, _verifier, redirectUri, requestedResource) {
      const entry = getCode(client, code);
      checkResource(requestedResource, 'authorization_code');
      if (redirectUri !== entry.redirectUri) rejectGrant('authorization_code',
        new InvalidGrantError('The authorization redirect URI must match exactly'), 'redirect_mismatch');
      codes.delete(digest(code));
      if (families.size >= MAX_FAMILIES) rejectGrant('authorization_code', new InvalidGrantError('Gemini beta active grant limit reached'), 'grant_limit');
      const familyId = opaque();
      families.set(familyId, { clientId: client.client_id, audience: resource, expiresAt: now() + REFRESH_TTL });
      emit('oauth.code_exchanged');
      return issueTokens(familyId, 'authorization_code');
    },
    async exchangeRefreshToken(client, token, scopes, requestedResource) {
      purge();
      const resourceOmitted = requestedResource === undefined;
      if (!resourceOmitted || !allowRefreshResourceOmission) checkResource(requestedResource, 'refresh_token');
      if (scopes && (!exactScopes(scopes))) rejectGrant('refresh_token',
        new InvalidScopeError('Cannot change the granted Gemini beta scope'), 'scope_mismatch');
      const entry = typeof token === 'string' ? refreshTokens.get(digest(token)) : undefined;
      const family = entry && families.get(entry.familyId);
      if (!family || family.clientId !== client.client_id) rejectGrant('refresh_token',
        new InvalidGrantError('Invalid or expired refresh token'), family ? 'refresh_client_mismatch' : 'refresh_unknown_or_expired');
      if (resourceOmitted && family.audience !== resource) rejectGrant('refresh_token',
        new InvalidGrantError('The exact Gemini beta resource parameter is required'), 'resource_mismatch');
      if (entry.consumed) {
        removeFamily(entry.familyId);
        emit('oauth.refresh_reuse_revoked');
        rejectGrant('refresh_token', new InvalidGrantError('Refresh token reuse revoked this Gemini beta grant'), 'refresh_reuse');
      }
      // Bound tombstones while preserving reuse detection for the whole grant lifetime.
      if (refreshTokens.size >= MAX_FAMILIES * 50) rejectGrant('refresh_token', new InvalidGrantError('Gemini beta refresh limit reached; reconnect'), 'refresh_limit');
      if (resourceOmitted) emit('oauth.refresh_resource_omission_accepted', { grantType: 'refresh_token' });
      entry.consumed = true;
      emit('oauth.token_refreshed');
      return issueTokens(entry.familyId, 'refresh_token');
    },
    async verifyAccessToken(token) {
      purge();
      const entry = typeof token === 'string' ? accessTokens.get(digest(token)) : undefined;
      const family = entry && families.get(entry.familyId);
      if (!family || !clients.has(family.clientId)) throw new InvalidTokenError('Invalid or expired Gemini beta access token');
      return { token, clientId: family.clientId, scopes: [...SCOPES], expiresAt: seconds(entry.expiresAt), resource: new URL(family.audience), connectionId: digest(entry.familyId) };
    },
    async revokeToken(client, request) {
      purge();
      const key = digest(request.token);
      const entry = accessTokens.get(key) ?? refreshTokens.get(key);
      if (entry && families.get(entry.familyId)?.clientId === client.client_id) {
        removeFamily(entry.familyId);
        emit('oauth.grant_revoked');
      }
    },
  };

  const router = express.Router();
  const formParser = express.urlencoded({ extended: false, limit: '8kb', parameterLimit: 20 });
  // SDK endpoint limits remain active; cap attempts before our credential guards too.
  const attempts = new Map();
  router.use(['/authorize', '/consent', '/token', '/revoke'], (req, res, next) => {
    const timestamp = now();
    for (const [key, bucket] of attempts) if (bucket.expiresAt <= timestamp) attempts.delete(key);
    const key = `${req.ip}:${req.baseUrl}`;
    const bucket = attempts.get(key) ?? { count: 0, expiresAt: timestamp + 60_000 };
    if (!attempts.has(key) && attempts.size >= 1000) return sendError(res, 429, 'temporarily_unavailable', 'Gemini beta request limit reached');
    bucket.count += 1;
    attempts.set(key, bucket);
    if (bucket.count > 60) return sendError(res, 429, 'temporarily_unavailable', 'Gemini beta request limit reached');
    next();
  });
  // The SDK permits dynamic loopback ports. This experiment intentionally pins every byte.
  router.use('/authorize', formParser, async (req, res, next) => {
    const input = req.method === 'POST' ? req.body : req.query;
    const client = typeof input?.client_id === 'string' ? await clientsStore.getClient(input.client_id) : undefined;
    const requested = input?.redirect_uri;
    if (requested !== undefined && (typeof requested !== 'string' || !client?.redirect_uris.includes(requested) || !allowedRedirects.has(requested))) {
      callbackDiscovery(requested, 'authorize');
      return sendError(res, 400, 'invalid_request', 'Redirect URI is not exactly configured');
    }
    next();
  });
  // SDK 1.30 implements body authentication only. Normalize Basic after strict method checks.
  router.use(['/token', '/revoke'], formParser, async (req, res, next) => {
    if (req.method !== 'POST') return next();
    const body = req.body ?? {};
    if (req.baseUrl === '/token') {
      const grantType = ['authorization_code', 'refresh_token'].includes(body.grant_type) ? body.grant_type : 'other';
      const resourcePresence = body.resource === undefined ? 'absent' : typeof body.resource !== 'string' ? 'invalid' : body.resource === '' ? 'empty' : 'present';
      emit('oauth.grant_request', { grantType, resourcePresence });
      let error;
      const json = res.json;
      res.json = function (value) {
        error = typeof value?.error === 'string'
          ? (['invalid_request', 'invalid_client', 'invalid_grant', 'invalid_scope', 'unsupported_grant_type', 'unauthorized_client', 'server_error', 'temporarily_unavailable', 'too_many_requests'].includes(value.error) ? value.error : 'other')
          : undefined;
        return json.call(this, value);
      };
      res.on('finish', () => emit('oauth.grant_result', { grantType, status: res.statusCode, ...(error ? { error } : {}) }));
    }
    if (req.baseUrl === '/token' && body.grant_type === 'authorization_code' &&
        (typeof body.code_verifier !== 'string' || !/^[A-Za-z0-9._~-]{43,128}$/.test(body.code_verifier))) {
      emit('oauth.grant_rejected', { grantType: 'authorization_code', error: 'invalid_grant', reason: 'pkce_verifier_format' });
      return sendError(res, 400, 'invalid_grant', 'A valid RFC 7636 code verifier is required');
    }
    let method = body.client_secret === undefined ? 'none' : 'client_secret_post';
    let id = body.client_id;
    let secret = body.client_secret;
    if (req.headers.authorization) {
      if (body.client_id !== undefined || body.client_secret !== undefined || !/^Basic [A-Za-z0-9+/]+={0,2}$/.test(req.headers.authorization)) {
        return sendError(res, 400, 'invalid_client', 'Use one supported client authentication method');
      }
      try {
        const decoded = Buffer.from(req.headers.authorization.slice(6), 'base64').toString('utf8');
        const separator = decoded.indexOf(':');
        if (separator < 1) throw new Error('Malformed Basic value');
        id = decodeURIComponent(decoded.slice(0, separator));
        secret = decodeURIComponent(decoded.slice(separator + 1));
        method = 'client_secret_basic';
      } catch { return sendError(res, 400, 'invalid_client', 'Invalid client authentication'); }
    }
    const client = typeof id === 'string' ? await clientsStore.getClient(id) : undefined;
    const secretMatches = typeof client?.client_secret === 'string' && equalSecret(secret, client.client_secret);
    if (!client || method !== client.token_endpoint_auth_method || (method !== 'none' && !secretMatches)) {
      emit('oauth.client_auth_rejected', {
        observedAuthMethod: method, configuredAuthMethod: client?.token_endpoint_auth_method ?? 'unknown',
        clientKnown: Boolean(client), secretMatches,
      });
      return sendError(res, 400, 'invalid_client', 'Invalid client authentication');
    }
    emit('oauth.client_auth_accepted', { authMethod: method });
    // A supplied resource must never become an omitted one through SDK normalization.
    if (req.baseUrl === '/token' && body.grant_type === 'refresh_token' && Object.hasOwn(body, 'resource') && body.resource !== resource) {
      let reason = 'resource_mismatch';
      if (Array.isArray(body.resource)) reason = 'resource_duplicate';
      else if (typeof body.resource !== 'string') reason = 'resource_invalid';
      else if (!body.resource.trim()) reason = 'resource_empty';
      else { try { new URL(body.resource); } catch { reason = 'resource_invalid'; } }
      emit('oauth.grant_rejected', { grantType: 'refresh_token', error: 'invalid_grant', reason });
      return sendError(res, 400, 'invalid_grant', 'The exact Gemini beta resource parameter is required');
    }
    req.body = { ...body, client_id: id, ...(method === 'none' ? {} : { client_secret: secret }) };
    next();
  });
  router.post('/consent', formParser, (req, res) => {
    purge();
    res.set('Cache-Control', 'no-store');
    const { nonce, operator_key: suppliedKey, decision } = req.body ?? {};
    const entry = typeof nonce === 'string' && pending.get(digest(nonce));
    // Check Origin where browsers provide it. The nonce remains mandatory for all clients.
    if ((req.headers.origin && req.headers.origin !== baseOrigin) || !entry || !equalSecret(suppliedKey, operatorKey) || !['allow', 'deny'].includes(decision)) {
      emit('oauth.consent_rejected');
      return sendError(res, 403, 'access_denied', 'Invalid or expired operator consent');
    }
    pending.delete(digest(nonce));
    const target = new URL(entry.redirectUri);
    target.searchParams.set('state', entry.state);
    if (decision === 'deny') {
      target.searchParams.set('error', 'access_denied');
      emit('oauth.consent_denied');
    } else {
      if (codes.size >= MAX_PENDING) return sendError(res, 429, 'temporarily_unavailable', 'Gemini beta authorization limit reached');
      const code = opaque();
      codes.set(digest(code), { ...entry, expiresAt: now() + CODE_TTL });
      target.searchParams.set('code', code);
      emit('oauth.consent_granted');
    }
    const acceptsHtml = req.headers.accept?.split(',').some(value => value.split(';')[0].trim().toLowerCase() === 'text/html');
    if (acceptsHtml) {
      return res.set({
        'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
        'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
      }).type('html').send(`<!doctype html><html lang="de"><meta charset="utf-8"><title>Gemini-Verbindung fortsetzen</title>
<h1>Gemini-Verbindung fortsetzen</h1>
<p>Die Anfrage wurde verarbeitet. Setze den Verbindungstest bei Gemini fort.</p>
<a href="${escapeHtml(target.href)}" rel="noreferrer noopener">Weiter zu Gemini</a></html>`);
    }
    res.redirect(302, target.href);
  });

  const options = {
    provider, issuerUrl: new URL(baseOrigin), resourceServerUrl: new URL(resource),
    scopesSupported: [...SCOPES], resourceName: 'SkillPilot Gemini Beta',
  };
  const metadata = createOAuthMetadata(options);
  metadata.token_endpoint_auth_methods_supported = allowDcr
    ? ['client_secret_basic', 'client_secret_post', ...(allowPublicClients ? ['none'] : [])]
    : [clientAuthMethod];
  metadata.revocation_endpoint_auth_methods_supported = [...metadata.token_endpoint_auth_methods_supported];
  router.use(mcpAuthMetadataRouter({ ...options, oauthMetadata: metadata }));
  router.use(mcpAuthRouter(options));
  return { router, provider, clientsStore, resource, scope: SCOPE, verifyAccessToken: provider.verifyAccessToken };
}
