// SPDX-License-Identifier: Apache-2.0
import express from 'express';
import { createGeminiOAuth } from './oauth.mjs';
import { createGatewayAssertion } from './assertion.mjs';

const PATHS = new Set(['/health', '/privacy', '/mcp', '/authorize', '/consent', '/token', '/revoke',
  '/.well-known/oauth-authorization-server', '/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp']);
const RPC = new Set(['initialize', 'notifications/initialized', 'ping', 'tools/list', 'tools/call', 'resources/list']);
const TOOLS = new Set(['get_skillpilot_coach_context', 'resume_skillpilot_learning_plan', 'switch_skillpilot_learning_plan_subject',
  'render_skillpilot_goal_visualization', 'start_skillpilot_memory_practice', 'get_skillpilot_memory_practice_answer',
  'review_skillpilot_memory_practice_card', 'get_skillpilot_navigation_options', 'set_skillpilot_focus',
  'set_skillpilot_active_goal', 'set_skillpilot_mastery', 'start_skillpilot_verified_recall',
  'get_skillpilot_verified_recall_answers', 'record_skillpilot_verified_recall_results', 'get_skillpilot_exam_evaluation']);

export function nativeJsonResponse(text, contentType) {
  if (contentType?.includes('text/event-stream')) {
    const messages = text.split(/\r?\n\r?\n/).filter(frame => frame.split(/\r?\n/).some(line => line.startsWith('data:')));
    if (messages.length !== 1) throw new Error('Expected one stateless MCP result');
    text = messages[0].split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
  }
  const value = JSON.parse(text);
  if (!value || Array.isArray(value) || value.jsonrpc !== '2.0' || !(Object.hasOwn(value, 'result') || Object.hasOwn(value, 'error'))) {
    throw new Error('Invalid MCP response');
  }
  return value;
}

export function createGatewayApp({ origin, operatorKey, clientSecret, redirectUris, gatewaySecret,
  upstream = 'http://127.0.0.1:8080/gemini/v1/mcp', clientId = 'skillpilot-gemini-beta',
  clientAuthMethod = 'client_secret_post', allowRefreshResourceOmission = false,
  now = Date.now, audit = () => {}, fetchUpstream = fetch }) {
  const target = new URL(upstream);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.protocol !== 'http:' ||
      target.pathname !== '/gemini/v1/mcp' || target.search || target.hash || target.username || target.password) {
    throw new Error('The backend must be the exact HTTP loopback Gemini MCP endpoint');
  }
  if (typeof gatewaySecret !== 'string' || Buffer.byteLength(gatewaySecret) < 32 || [operatorKey, clientSecret].includes(gatewaySecret)) {
    throw new Error('An independent gateway secret of at least 32 bytes is required');
  }
  const app = express(); app.disable('x-powered-by');
  const oauth = createGeminiOAuth({ origin, operatorKey, clientSecret, redirectUris, clientId,
    clientAuthMethod, allowRefreshResourceOmission, now, audit });
  app.locals.oauth = oauth;
  app.use((req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    const path = req.originalUrl.split('?')[0];
    if (!PATHS.has(path) || (req.originalUrl.includes('?') && path !== '/authorize')) return res.status(404).json({ code: 'NOT_FOUND' });
    res.on('finish', () => audit({ event: 'http', route: path, method: req.method, status: res.statusCode }));
    next();
  });
  app.get('/health', (_req, res) => res.json({ status: 'ok', version: '0.1.0', provider: 'gemini-v1', syntheticOnly: false }));
  app.get('/privacy', (_req, res) => res.type('text/plain').send('SkillPilot Gemini Beta: tool calls contain a temporary learning-session reference and structured learning state. Chat text and learner answers must stay in Gemini. This isolated development gateway uses an operator-managed confidential OAuth client. OAuth grants expire after one hour and are lost on restart. Learning sessions expire after 24 hours. Canonical progress is stored in SkillPilot, independent of the chat.'));
  app.use(oauth.router);
  app.all('/mcp', async (req, res) => {
    if (req.headers.origin && req.headers.origin !== origin) return res.status(403).json({ code: 'INVALID_ORIGIN' });
    let authorization;
    try {
      const token = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '')?.[1];
      if (!token) throw new Error('Missing OAuth token');
      authorization = await oauth.verifyAccessToken(token);
    } catch {
      res.set('WWW-Authenticate', `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp", scope="${oauth.scope}"`);
      return res.status(401).json({ code: 'OAUTH_REQUIRED' });
    }
    if (req.method !== 'POST') return res.set('Allow', 'POST').status(405).end();
    if (!req.is('application/json')) return res.status(415).json({ code: 'JSON_REQUIRED' });
    try { await new Promise((resolve, reject) => express.raw({ type: 'application/json', limit: '64kb' })(req, res, error => error ? reject(error) : resolve())); }
    catch (error) { return res.status(error.status === 413 ? 413 : 400).json({ code: 'INVALID_BODY' }); }
    let request;
    try {
      request = JSON.parse(req.body.toString('utf8'));
      if (!request || Array.isArray(request) || request.jsonrpc !== '2.0' || !RPC.has(request.method)) throw new Error('Unsupported RPC');
    } catch { return res.status(400).json({ code: 'INVALID_MCP_REQUEST' }); }
    // Audit contains only the RPC method, never tool arguments or chat content.
    const tool = request.method === 'tools/call' && TOOLS.has(request.params?.name) ? request.params.name : undefined;
    audit({ event: 'mcp.request', rpcMethod: request.method, ...(tool ? { tool } : {}) });
    const assertion = createGatewayAssertion({ secret: gatewaySecret, audience: oauth.resource,
      connectionId: authorization.connectionId, scopes: authorization.scopes, body: req.body, now });
    try {
      const headers = { Authorization: `Bearer ${assertion}`, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
      if (typeof req.headers['mcp-protocol-version'] === 'string') headers['MCP-Protocol-Version'] = req.headers['mcp-protocol-version'];
      const response = await fetchUpstream(target, { method: 'POST', headers, body: req.body, redirect: 'error', signal: AbortSignal.timeout(30_000) });
      if (response.status === 202 || response.status === 204) return res.status(response.status).end();
      let length = 0; const chunks = [];
      for await (const chunk of response.body ?? []) {
        length += chunk.byteLength;
        if (length > 262144) throw new Error('Response limit exceeded');
        chunks.push(chunk);
      }
      const text = Buffer.concat(chunks).toString('utf8');
      if (!response.ok) return res.status(response.status >= 500 ? 502 : response.status).json({ code: 'BACKEND_REJECTED' });
      const result = nativeJsonResponse(text, response.headers.get('content-type'));
      let state = result.result?.structuredContent;
      if (!state && result.result?.content?.[0]?.type === 'text') {
        try { state = JSON.parse(result.result.content[0].text); } catch { /* Never retain response prose. */ }
      }
      const stateVersion = state?.stateVersion;
      audit({ event: 'mcp.response', rpcMethod: request.method, ...(tool ? { tool } : {}), status: response.status,
        success: !result.error && result.result?.isError !== true,
        ...(Number.isSafeInteger(stateVersion) && stateVersion >= 0 ? { stateVersion } : {}) });
      return res.status(response.status).json(result);
    } catch { return res.status(502).json({ code: 'BACKEND_UNAVAILABLE' }); }
  });
  app.use((error, _req, res, _next) => res.status(error.status === 413 ? 413 : 400).json({ code: 'INVALID_REQUEST' }));
  return app;
}
