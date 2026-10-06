// SPDX-License-Identifier: Apache-2.0
// Expose only this synthetic PoC's public protocol routes to a temporary tunnel.
// The operator API and every unknown/encoded route remain local.
import { createServer, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_PATHS = new Set([
  '/health', '/mcp', '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-protected-resource/mcp', '/.well-known/oauth-authorization-server',
  '/authorize', '/consent', '/token', '/revoke', '/register',
]);
const QUERY_PATHS = new Set(['/authorize', '/consent', '/token', '/revoke', '/register']);
const HOP_HEADERS = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade',
]);

function upstreamAddress(upstream) {
  let url;
  try { url = new URL(upstream); } catch { throw new Error('The proxy upstream must be an exact HTTP(S) loopback origin'); }
  if (!['http:', 'https:'].includes(url.protocol) ||
      !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash ||
      (upstream !== url.origin && upstream !== `${url.origin}/`)) {
    throw new Error('The proxy upstream must be an exact HTTP(S) loopback origin');
  }
  // Pin localhost to a numeric loopback address, avoiding any DNS-selected destination.
  return { url, hostname: url.hostname === '[::1]' ? '::1' : '127.0.0.1' };
}

function endToEndHeaders(headers) {
  const blocked = new Set(HOP_HEADERS);
  for (const field of String(headers.connection ?? '').split(',')) blocked.add(field.trim().toLowerCase());
  return Object.fromEntries(Object.entries(headers).filter(([key]) => !blocked.has(key.toLowerCase())));
}

function fail(res, status, code) {
  if (res.destroyed || res.writableEnded) return;
  if (res.headersSent) return res.destroy();
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ code }));
}

/** Fixed loopback destination; request paths can never select a host or private route. */
export function createPublicProxy({ upstream = 'http://127.0.0.1:8793' } = {}) {
  const { url, hostname } = upstreamAddress(upstream);
  const send = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const server = createServer({ maxHeaderSize: 16 * 1024 }, (req, res) => {
    const rawUrl = req.url ?? '';
    const separator = rawUrl.indexOf('?');
    const path = separator < 0 ? rawUrl : rawUrl.slice(0, separator);
    // Compare raw paths before URL normalization. Encodings and aliases cannot bypass the allowlist.
    if (!PUBLIC_PATHS.has(path) || path.includes('%') || path.includes('\\') || path.includes('#') ||
        (separator >= 0 && !QUERY_PATHS.has(path))) {
      fail(res, 404, 'NOT_FOUND');
      req.resume();
      return;
    }
    const outgoing = send({
      hostname, port: url.port || (url.protocol === 'https:' ? 443 : 80),
      method: req.method, path: rawUrl, headers: endToEndHeaders(req.headers),
    }, incoming => {
      res.writeHead(incoming.statusCode ?? 502, endToEndHeaders(incoming.headers));
      incoming.on('error', () => fail(res, 502, 'UPSTREAM_UNAVAILABLE'));
      incoming.pipe(res);
    });
    outgoing.on('error', () => fail(res, 502, 'UPSTREAM_UNAVAILABLE'));
    outgoing.setTimeout(30_000, () => outgoing.destroy(new Error('Upstream timeout')));
    req.on('aborted', () => outgoing.destroy());
    req.on('error', () => outgoing.destroy());
    res.on('error', () => outgoing.destroy());
    res.on('close', () => { if (!res.writableEnded) outgoing.destroy(); });
    req.pipe(outgoing);
  });
  server.headersTimeout = 10_000;
  server.requestTimeout = 30_000;
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.POC_PROXY_PORT || 8794);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid POC_PROXY_PORT');
  const server = createPublicProxy({ upstream: process.env.POC_PROXY_UPSTREAM || 'http://127.0.0.1:8793' });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolveListen);
  });
  process.stdout.write(`Synthetic PoC public-route proxy listening on http://127.0.0.1:${port}\n`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    server.close();
    server.closeAllConnections();
  });
}
