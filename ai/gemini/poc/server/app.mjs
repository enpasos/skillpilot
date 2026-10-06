// SPDX-License-Identifier: Apache-2.0
import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { createPocOAuth } from './oauth.mjs';
import { ProbeStore, PocError } from './probe-store.mjs';

export const POC_VERSION = '0.1.0';
export const TOOL_NAMES = ['get_skillpilot_poc_status', 'get_skillpilot_poc_context', 'record_skillpilot_poc_completion'];
const validSession = z.string().regex(/^gp_[A-Za-z0-9_-]{43}$/).describe('Unchanged private temporary synthetic probe reference supplied by the operator start prompt.');
const empty = z.strictObject({});
const contextInput = z.strictObject({ probeSessionId: validSession });
const completionInput = z.strictObject({
  probeSessionId: validSession,
  completionCapability: z.string().regex(/^[A-Za-z0-9_-]{43}$/).describe('Copy unchanged from the fresh probe context after explicit agreement to save the synthetic marker.')
});
const result = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }], structuredContent: value });

export function validateOrigin(origin) {
  const url = new URL(origin);
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (url.origin !== origin || url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))) {
    throw new Error('PoC origin must be an HTTPS origin or an HTTP loopback origin');
  }
  return url;
}

export function createPocApp({ origin, operatorKey, clientSecret, clientAuthMethod = 'client_secret_basic', allowRefreshResourceOmission = false, redirectUris = [], dataDir, now = Date.now, audit = () => {}, allowDcr = false, allowPublicClients = false }) {
  validateOrigin(origin);
  if (typeof operatorKey !== 'string' || operatorKey.length < 32) throw new Error('An independent operator key of at least 32 characters is required');
  const app = express();
  app.disable('x-powered-by');
  const store = new ProbeStore({ dataDir, now });
  const oauth = createPocOAuth({ origin, operatorKey, clientSecret, clientAuthMethod, allowRefreshResourceOmission, redirectUris, now, audit, allowDcr, allowPublicClients });
  app.locals.store = store;
  app.locals.oauth = oauth;
  app.use((req, res, next) => {
    const route = safeRoute(req.path);
    res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    res.on('finish', () => audit({ event: 'http', route, method: req.method, status: res.statusCode }));
    next();
  });
  app.get('/health', (_req, res) => res.json({ status: 'ok', version: POC_VERSION, syntheticOnly: true }));
  // Operator endpoint is never registered as a Gemini tool.
  app.post('/operator/sessions', express.json({ limit: '1kb' }), async (req, res) => {
    const supplied = req.headers.authorization?.replace(/^Bearer /, '') || '';
    if (Buffer.byteLength(supplied) !== Buffer.byteLength(operatorKey) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(operatorKey))) {
      return res.status(401).json({ code: 'OPERATOR_REQUIRED' });
    }
    if (!empty.safeParse(req.body ?? {}).success) return res.status(400).json({ code: 'INVALID_INPUT' });
    res.status(201).json(await store.createSession());
  });
  app.use(oauth.router);
  app.all('/mcp', async (req, res) => {
    const incomingOrigin = req.headers.origin;
    if (incomingOrigin && incomingOrigin !== origin) return res.status(403).json({ code: 'INVALID_ORIGIN' });
    const token = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '')?.[1];
    try {
      if (!token) throw new Error('Missing token');
      await oauth.verifyAccessToken(token);
    } catch {
      res.set('WWW-Authenticate', `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp", scope="poc:probe"`);
      return res.status(401).json({ code: 'OAUTH_REQUIRED' });
    }
    // Stateless request/response PoC: no standalone SSE channel or transport session.
    if (req.method !== 'POST') return res.set('Allow', 'POST').status(405).end();
    if (req.method === 'POST') {
      if (!req.is('application/json')) return res.status(415).json({ code: 'JSON_REQUIRED' });
      try {
        await new Promise((resolve, reject) => express.json({ limit: '16kb' })(req, res, error => error ? reject(error) : resolve()));
      } catch (error) {
        return res.status(error.status === 413 ? 413 : 400).json({ code: error.status === 413 ? 'INPUT_TOO_LARGE' : 'INVALID_JSON' });
      }
    }
    audit({ event: 'mcp.request', ...safeMcpRequest(req.body, req.headers['mcp-protocol-version']) });
    const server = new McpServer({ name: 'skillpilot-gemini-custom-apps-poc', version: POC_VERSION }, {
      instructions: 'Disposable synthetic connectivity test only. Never send learner identities, answers, feedback, or chat text. OAuth does not select a test session. A synthetic save requires a valid independent probeSessionId and explicit operator agreement. Never claim real learning progress.'
    });
    const register = (name, schema, description, readonly, handler) => server.registerTool(name, {
      title: name.replaceAll('_', ' '), description, inputSchema: schema,
      annotations: { readOnlyHint: readonly, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    }, async args => {
      // Validate again before audit, hash, or state; SDK schemas alone are not the privacy gate.
      const parsed = schema.safeParse(args);
      if (!parsed.success) return { ...result({ code: 'INVALID_INPUT', syntheticOnly: true }), isError: true };
      try {
        const value = await handler(parsed.data);
        audit({ event: 'tool', tool: name, status: 'ok', ...(Number.isInteger(value.stateVersion) ? { stateVersion: value.stateVersion } : {}) });
        return result(value);
      } catch (error) {
        const code = error instanceof PocError ? error.code : 'PERSISTENCE_FAILED';
        audit({ event: 'tool', tool: name, status: code });
        return { ...result({ code, syntheticOnly: true, instruction: 'Stop this test flow. The operator must create a fresh probe session locally if the session is missing or near expiry. Do not reconnect OAuth as session recovery.' }), isError: true };
      }
    });
    register(TOOL_NAMES[0], empty, 'Read the synthetic test server identity. This does not establish real Gemini acceptance or SkillPilot learner state.', true,
      () => ({ syntheticOnly: true, version: POC_VERSION, provider: 'gemini-poc', realLearningProgress: false }));
    register(TOOL_NAMES[1], contextInput, 'Read the independent temporary synthetic test session, its saved marker, and the permitted next action.', true,
      ({ probeSessionId }) => store.getContext(probeSessionId));
    register(TOOL_NAMES[2], completionInput, 'WRITE: persist one synthetic completion marker after explicit agreement. Gemini must obtain its write confirmation. Never send chat text. Exact retries cannot create a second marker. This never changes SkillPilot mastery.', false,
      ({ probeSessionId, completionCapability }) => store.complete(probeSessionId, completionCapability));
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { void transport.close(); void server.close(); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch {
      if (!res.headersSent) res.status(500).json({ code: 'MCP_FAILED' });
    }
  });
  app.use((_req, res) => res.status(404).json({ code: 'NOT_FOUND' }));
  app.use((error, _req, res, _next) => {
    const status = error.status === 413 ? 413 : 500;
    if (!res.headersSent) res.status(status).json({ code: status === 413 ? 'INPUT_TOO_LARGE' : 'REQUEST_FAILED' });
  });
  return app;
}

function safeRoute(path) {
  return ['/health', '/mcp', '/operator/sessions', '/authorize', '/consent', '/token', '/revoke', '/register', '/.well-known/oauth-authorization-server', '/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp'].includes(path) ? path : 'other';
}

function safeMcpRequest(body, headerVersion) {
  const rpcMethod = ['initialize', 'notifications/initialized', 'tools/list', 'tools/call'].includes(body?.method) ? body.method : 'other';
  // This is the incoming request version, not the SDK's negotiated response version.
  const versions = [body?.method === 'initialize' ? body.params?.protocolVersion : undefined, headerVersion];
  const protocolVersion = versions.find(value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value));
  return { rpcMethod, ...(protocolVersion ? { protocolVersion } : {}) };
}
