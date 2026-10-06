// SPDX-License-Identifier: Apache-2.0
import { readFile, appendFile } from 'node:fs/promises';
import { createGatewayApp } from './app.mjs';

// Values come from private operator-managed configuration, never generated credentials in logs.
const dir = new URL('../.runtime/', import.meta.url);
const config = JSON.parse(await readFile(new URL('connection.json', dir), 'utf8'));
const secret = async file => (await readFile(new URL(file, dir), 'utf8')).trim();
let redirectUris = [];
try { redirectUris = (await secret('gemini-callback.txt')).split('\n').filter(Boolean); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const app = createGatewayApp({ ...config, redirectUris,
  operatorKey: await secret('operator-key'), clientSecret: await secret('client-secret'),
  gatewaySecret: await secret('gateway-secret'),
  upstream: process.env.GEMINI_BACKEND_MCP_URL || 'http://127.0.0.1:8080/gemini/v1/mcp',
  audit: event => appendFile(new URL('events.jsonl', dir), JSON.stringify({ at: new Date().toISOString(), ...event }) + '\n', { mode: 0o600 }).catch(() => {}),
});
const port = Number(process.env.GEMINI_GATEWAY_PORT || 8795);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid gateway port');
const server = app.listen(port, '127.0.0.1', () => process.stdout.write(`Gemini beta gateway listening on loopback port ${port}\n`));
server.headersTimeout = 10_000; server.requestTimeout = 30_000;
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { server.close(); server.closeAllConnections(); });
