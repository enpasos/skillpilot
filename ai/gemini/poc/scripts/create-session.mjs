// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const dataDir = resolve(process.env.POC_DATA_DIR || '.runtime');
const connection = JSON.parse(await readFile(join(dataDir, 'connection.json'), 'utf8'));
const operatorKey = (await readFile(join(dataDir, 'operator-key'), 'utf8')).trim();
const response = await fetch(`${connection.localOrigin}/operator/sessions`, {
  method: 'POST', headers: { Authorization: `Bearer ${operatorKey}`, 'Content-Type': 'application/json' }, body: '{}'
});
if (response.status !== 201) throw new Error(`Session creation failed: HTTP ${response.status}`);
const session = await response.json();
await writeFile(join(dataDir, 'start-prompt.txt'), session.startPrompt + '\n', { mode: 0o600 });
await writeFile(join(dataDir, 'current-session.json'), JSON.stringify(session, null, 2) + '\n', { mode: 0o600 });
console.log(`Private start prompt saved to ${join(dataDir, 'start-prompt.txt')}. Use it only in the technical Gemini test chat.`);
