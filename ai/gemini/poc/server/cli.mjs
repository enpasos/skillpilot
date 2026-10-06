// SPDX-License-Identifier: Apache-2.0
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, appendFile, chmod } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'node:http';
import { createPocApp, validateOrigin } from './app.mjs';

if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Use Node.js 22 or newer');
const dataDir = resolve(process.env.POC_DATA_DIR || '.runtime');
await mkdir(dataDir, { recursive: true, mode: 0o700 });
await chmod(dataDir, 0o700);
async function secret(filename) {
  const path = join(dataDir, filename);
  try { await writeFile(path, randomBytes(32).toString('base64url'), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  await chmod(path, 0o600);
  return (await readFile(path, 'utf8')).trim();
}
const port = Number(process.env.PORT || 8793);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const origin = process.env.POC_PUBLIC_ORIGIN || `http://127.0.0.1:${port}`;
validateOrigin(origin);
const bind = process.env.POC_BIND || '127.0.0.1';
if (!['127.0.0.1', '::1', '0.0.0.0'].includes(bind) || (bind === '0.0.0.0' && !origin.startsWith('https://'))) {
  throw new Error('Non-loopback listening requires an explicit HTTPS public origin');
}
const redirectUris = (process.env.POC_REDIRECT_URIS || '').split(',').map(s => s.trim()).filter(Boolean);
const clientAuthMethod = process.env.POC_CLIENT_AUTH_METHOD || 'client_secret_basic';
if (!['client_secret_basic', 'client_secret_post'].includes(clientAuthMethod)) throw new Error('Invalid POC_CLIENT_AUTH_METHOD');
const allowRefreshResourceOmission = process.env.POC_ALLOW_REFRESH_RESOURCE_OMISSION === '1';
const operatorKey = await secret('operator-key');
const clientSecret = await secret('client-secret');
const eventsPath = join(dataDir, 'events.jsonl');
let logQueue = Promise.resolve();
const audit = event => {
  // Module events contain only bounded status facts. No request bodies/queries,
  // authorization headers, session IDs, capabilities or chat text are logged.
  const line = JSON.stringify({ timestamp: new Date().toISOString(), ...event }) + '\n';
  logQueue = logQueue.then(() => appendFile(eventsPath, line, { mode: 0o600 }));
  logQueue.catch(() => process.stderr.write('PoC audit write failed\n'));
};
const app = createPocApp({ origin, operatorKey, clientSecret, clientAuthMethod, allowRefreshResourceOmission, redirectUris, dataDir, audit,
  allowDcr: process.env.POC_ALLOW_DCR === '1', allowPublicClients: process.env.POC_ALLOW_PUBLIC_CLIENTS === '1' });
const server = createServer(app);
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, bind, resolve); });
await writeFile(join(dataDir, 'connection.json'), JSON.stringify({ origin, localOrigin: `http://127.0.0.1:${port}`, clientId: 'skillpilot-gemini-poc', clientAuthMethod, allowRefreshResourceOmission, redirectUris }, null, 2) + '\n', { mode: 0o600 });
console.log(`SkillPilot Gemini synthetic PoC listening at ${origin}/mcp`);
console.log(`Private operator/client credentials and redacted trace: ${dataDir}`);
console.log(redirectUris.length ? 'Only configured exact OAuth callbacks are accepted.' : 'No OAuth callback is pinned yet. Unknown callbacks fail closed; pin the observed Gemini callback and restart.');
console.log('This service proves no Gemini host acceptance and changes no SkillPilot learner state.');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  server.close(); server.closeAllConnections();
  await logQueue.catch(() => {});
});
